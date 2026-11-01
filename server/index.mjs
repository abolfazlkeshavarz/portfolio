// Portfolio server: serves the built site, the editable content, and the
// /aboli control-panel API. Zero dependencies — Node built-ins only — so the
// production image needs no `npm install`.
import http from 'node:http';
import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { validateContent } from './validate.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 8787);
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(here, '..', '.data'));
const DIST_DIR = path.resolve(process.env.DIST_DIR || path.join(here, '..', 'dist'));
const SEED_FILE = path.resolve(process.env.SEED_FILE || path.join(here, '..', 'src', 'content', 'content.json'));

const CONTENT_FILE = path.join(DATA_DIR, 'content.json');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');

const ADMIN_USER = process.env.ADMIN_USER || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const ADMIN_ENABLED = ADMIN_USER.length > 0 && ADMIN_PASSWORD.length >= 10;

const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const COOKIE = 'aboli_session';
const MAX_JSON_BYTES = 1024 * 1024;
const MAX_IMAGE_BYTES = 6 * 1024 * 1024;
const IMAGE_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
};
const COMPRESSIBLE = new Set(['.html', '.js', '.css', '.json', '.svg', '.txt']);

// ------------------------------------------------------------------ storage
let contentJson = '';
let sessionKey = Buffer.alloc(0);

async function readJsonFile(file) {
  return JSON.parse(await fs.readFile(file, 'utf8'));
}

async function writeAtomic(file, data) {
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(tmp, data);
  await fs.rename(tmp, file);
}

async function init() {
  await fs.mkdir(BACKUP_DIR, { recursive: true });
  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  try {
    await fs.access(CONTENT_FILE);
  } catch {
    await fs.copyFile(SEED_FILE, CONTENT_FILE);
    console.log('seeded content from', SEED_FILE);
  }
  contentJson = JSON.stringify(await readJsonFile(CONTENT_FILE));

  const secretFile = path.join(DATA_DIR, '.session-secret');
  let secret;
  try {
    secret = await fs.readFile(secretFile, 'utf8');
  } catch {
    secret = crypto.randomBytes(32).toString('hex');
    await fs.writeFile(secretFile, secret, { mode: 0o600 });
  }
  // Tying the key to the credentials means changing the password logs
  // everyone out.
  sessionKey = crypto.createHash('sha256').update(`${secret}:${ADMIN_USER}:${ADMIN_PASSWORD}`).digest();
}

async function saveContent(content) {
  try {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    await fs.copyFile(CONTENT_FILE, path.join(BACKUP_DIR, `content-${stamp}.json`));
    const old = (await fs.readdir(BACKUP_DIR)).filter((f) => f.startsWith('content-')).sort();
    for (const file of old.slice(0, Math.max(0, old.length - 30))) {
      await fs.unlink(path.join(BACKUP_DIR, file)).catch(() => {});
    }
  } catch (error) {
    console.warn('backup skipped:', error.message);
  }
  await writeAtomic(CONTENT_FILE, JSON.stringify(content, null, 2) + '\n');
  contentJson = JSON.stringify(content);
}

// --------------------------------------------------------------------- auth
const safeEqual = (a, b) => {
  const ha = crypto.createHash('sha256').update(a).digest();
  const hb = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
};

const sign = (value) => crypto.createHmac('sha256', sessionKey).update(value).digest('base64url');

function issueToken() {
  const exp = String(Date.now() + SESSION_TTL_MS);
  return `${exp}.${sign(exp)}`;
}

function tokenValid(token) {
  if (!token) return false;
  const [exp, mac] = token.split('.');
  if (!exp || !mac || Number(exp) < Date.now()) return false;
  const expected = sign(exp);
  return mac.length === expected.length && crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected));
}

function parseCookies(header = '') {
  const jar = {};
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > 0) jar[part.slice(0, i).trim()] = part.slice(i + 1).trim();
  }
  return jar;
}

const isAuthed = (req) => ADMIN_ENABLED && tokenValid(parseCookies(req.headers.cookie)[COOKIE]);

const isHttps = (req) => req.headers['x-forwarded-proto'] === 'https';

function sessionCookie(req, token, maxAgeSec) {
  const flags = ['HttpOnly', 'SameSite=Strict', 'Path=/', `Max-Age=${maxAgeSec}`];
  if (isHttps(req)) flags.push('Secure');
  return `${COOKIE}=${token}; ${flags.join('; ')}`;
}

const clientIp = (req) => (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();

const attempts = new Map();
const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000;

function lockedFor(ip) {
  const entry = attempts.get(ip);
  if (entry && entry.until > Date.now()) return Math.ceil((entry.until - Date.now()) / 1000);
  return 0;
}

function recordFailure(ip) {
  const entry = attempts.get(ip) ?? { fails: 0, until: 0 };
  entry.fails += 1;
  if (entry.fails >= MAX_FAILS) {
    entry.fails = 0;
    entry.until = Date.now() + LOCK_MS;
  }
  attempts.set(ip, entry);
}

// ------------------------------------------------------------------ helpers
function send(res, status, body, headers = {}) {
  const isObject = typeof body === 'object' && !Buffer.isBuffer(body) && body !== null;
  res.writeHead(status, {
    ...(isObject ? { 'Content-Type': 'application/json; charset=utf-8' } : {}),
    'Cache-Control': 'no-store',
    ...headers,
  });
  res.end(isObject ? JSON.stringify(body) : body);
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(Object.assign(new Error('Payload too large'), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function readJson(req) {
  const raw = await readBody(req, MAX_JSON_BYTES);
  try {
    return JSON.parse(raw.toString('utf8'));
  } catch {
    throw Object.assign(new Error('Invalid JSON'), { status: 400 });
  }
}

// Mutations must come from this site: SameSite=Strict already blocks
// cross-site cookies, the Origin check is the second layer.
function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try {
    return new URL(origin).host === (req.headers['x-forwarded-host'] || req.headers.host);
  } catch {
    return false;
  }
}

function looksLikeImage(buf, type) {
  if (type === 'image/jpeg') return buf[0] === 0xff && buf[1] === 0xd8;
  if (type === 'image/png') return buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  return buf.subarray(0, 4).toString() === 'RIFF' && buf.subarray(8, 12).toString() === 'WEBP';
}

// ---------------------------------------------------------------------- api
async function handleApi(req, res, pathname) {
  if (req.method === 'GET' && pathname === '/api/content') {
    return send(res, 200, contentJson, { 'Content-Type': 'application/json; charset=utf-8' });
  }

  if (!pathname.startsWith('/api/aboli/')) return send(res, 404, { error: 'Not found' });
  const route = pathname.slice('/api/aboli'.length);

  if (!ADMIN_ENABLED) {
    return send(res, 503, {
      error: 'The control panel is disabled: set ADMIN_USER and an ADMIN_PASSWORD of at least 10 characters.',
    });
  }
  if (req.method !== 'GET' && !sameOrigin(req)) return send(res, 403, { error: 'Cross-origin request refused' });

  if (req.method === 'POST' && route === '/login') {
    const ip = clientIp(req);
    const wait = lockedFor(ip);
    if (wait) return send(res, 429, { error: `Too many attempts. Try again in ${Math.ceil(wait / 60)} min.` });

    const body = await readJson(req);
    const user = typeof body.username === 'string' ? body.username : '';
    const pass = typeof body.password === 'string' ? body.password : '';
    // Evaluate both so timing doesn't reveal which one was wrong.
    const userOk = safeEqual(user, ADMIN_USER);
    const passOk = safeEqual(pass, ADMIN_PASSWORD);
    if (!(userOk && passOk)) {
      recordFailure(ip);
      await new Promise((resolve) => setTimeout(resolve, 500));
      return send(res, 401, { error: 'Wrong username or password' });
    }
    attempts.delete(ip);
    return send(res, 200, { ok: true }, { 'Set-Cookie': sessionCookie(req, issueToken(), SESSION_TTL_MS / 1000) });
  }

  if (req.method === 'POST' && route === '/logout') {
    return send(res, 200, { ok: true }, { 'Set-Cookie': sessionCookie(req, '', 0) });
  }

  if (req.method === 'GET' && route === '/session') {
    const ok = isAuthed(req);
    return send(res, ok ? 200 : 401, { ok });
  }

  if (!isAuthed(req)) return send(res, 401, { error: 'Not signed in' });

  if (req.method === 'PUT' && route === '/content') {
    const content = await readJson(req);
    const problem = validateContent(content);
    if (problem) return send(res, 400, { error: problem });
    await saveContent(content);
    return send(res, 200, { ok: true });
  }

  if (req.method === 'POST' && route === '/reset') {
    const seed = await readJsonFile(SEED_FILE);
    await saveContent(seed);
    return send(res, 200, { ok: true, content: seed });
  }

  if (req.method === 'POST' && route === '/upload') {
    const type = String(req.headers['content-type'] || '').split(';')[0].trim();
    const ext = IMAGE_TYPES[type];
    if (!ext) return send(res, 415, { error: 'Only JPEG, PNG or WebP images are accepted' });
    const data = await readBody(req, MAX_IMAGE_BYTES);
    if (!looksLikeImage(data, type)) return send(res, 415, { error: 'That file is not a valid image' });
    const name = `${crypto.createHash('sha256').update(data).digest('hex').slice(0, 16)}.${ext}`;
    await writeAtomic(path.join(UPLOAD_DIR, name), data);
    return send(res, 200, { url: `/uploads/${name}` });
  }

  return send(res, 404, { error: 'Not found' });
}

// ------------------------------------------------------------------- static
let indexTemplate = null;
let indexMtime = 0;

async function indexHtml(withContent) {
  // Re-read when a new build lands, so a rebuild never serves stale asset names.
  const file = path.join(DIST_DIR, 'index.html');
  const { mtimeMs } = await fs.stat(file);
  if (!indexTemplate || mtimeMs !== indexMtime) {
    indexTemplate = await fs.readFile(file, 'utf8');
    indexMtime = mtimeMs;
  }
  if (!withContent) return indexTemplate;
  // `<` is escaped so content can never close the script block early.
  const safe = contentJson.replace(/</g, '\\u003c');
  return indexTemplate.replace('</head>', `<script id="__content" type="application/json">${safe}</script></head>`);
}

async function serveFile(req, res, file, cacheControl) {
  const ext = path.extname(file).toLowerCase();
  let stat;
  try {
    stat = await fs.stat(file);
    if (!stat.isFile()) return false;
  } catch {
    return false;
  }
  const headers = {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Cache-Control': cacheControl,
    'X-Content-Type-Options': 'nosniff',
  };
  const gzip = COMPRESSIBLE.has(ext) && /\bgzip\b/.test(req.headers['accept-encoding'] || '');
  if (gzip) {
    headers['Content-Encoding'] = 'gzip';
    headers.Vary = 'Accept-Encoding';
  } else {
    headers['Content-Length'] = stat.size;
  }
  res.writeHead(200, headers);
  if (req.method === 'HEAD') {
    res.end();
    return true;
  }
  const stream = createReadStream(file);
  stream.on('error', () => res.destroy());
  (gzip ? stream.pipe(zlib.createGzip()) : stream).pipe(res);
  return true;
}

function within(dir, target) {
  const resolved = path.resolve(dir, '.' + path.sep + target);
  return resolved.startsWith(dir + path.sep) ? resolved : null;
}

async function handleStatic(req, res, pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return send(res, 400, 'Bad request');
  }

  if (decoded.startsWith('/uploads/')) {
    const file = within(UPLOAD_DIR, decoded.slice('/uploads/'.length));
    if (file && (await serveFile(req, res, file, 'public, max-age=31536000, immutable'))) return;
    return send(res, 404, 'Not found');
  }

  const isPanel = decoded === '/aboli' || decoded.startsWith('/aboli/');
  if (decoded !== '/' && !isPanel) {
    const file = within(DIST_DIR, decoded);
    if (file && file !== path.join(DIST_DIR, 'index.html')) {
      const cache = decoded.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'public, max-age=3600';
      if (await serveFile(req, res, file, cache)) return;
    }
    // A path with a file extension that doesn't exist is a real 404, not a
    // client-side route.
    if (path.extname(decoded)) return send(res, 404, 'Not found');
  }

  try {
    const html = await indexHtml(!isPanel);
    const headers = { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-store' };
    if (isPanel) headers['X-Robots-Tag'] = 'noindex, nofollow';
    res.writeHead(200, headers);
    res.end(req.method === 'HEAD' ? undefined : html);
  } catch {
    send(res, 503, 'The site has not been built yet. Run `npm run build`.');
  }
}

// ------------------------------------------------------------------- server
const server = http.createServer(async (req, res) => {
  try {
    const { pathname } = new URL(req.url, 'http://localhost');
    if (pathname === '/healthz') return send(res, 200, 'ok');
    if (pathname.startsWith('/api/')) return await handleApi(req, res, pathname);
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed');
    return await handleStatic(req, res, pathname);
  } catch (error) {
    const status = error.status || 500;
    if (status === 500) console.error(error);
    if (!res.headersSent) send(res, status, { error: status === 500 ? 'Server error' : error.message });
    else res.destroy();
  }
});

await init();
server.listen(PORT, process.env.HOST || '0.0.0.0', () => {
  console.log(
    `portfolio server on :${PORT}  data=${DATA_DIR}  panel=${ADMIN_ENABLED ? 'enabled' : 'DISABLED (set ADMIN_USER and ADMIN_PASSWORD)'}`,
  );
});
