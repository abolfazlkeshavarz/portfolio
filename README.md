# Portfolio — Abolfazl Keshavarz

A personal academic portfolio: a calm, paper-toned single page with serif
headings, a CV-style section layout, and selected research and projects.

React + TypeScript + Tailwind, built by Vite, and served by a small dependency-free
Node server in one container. The same server powers the **control panel at
`/aboli`**, where you edit the whole site from the browser. Edits live in a
Docker volume, so they survive redeploys.

---

## Quick start (local)

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually <http://localhost:5173>).

Other local commands:

```bash
npm run build       # production build into dist/
npm run preview     # serve the built output
npm run typecheck   # TypeScript only, no emit
```

---

## Editing the content

### The control panel — `/aboli`

Open `https://your-domain/aboli`, sign in, and edit everything: profile and
photo, about text, education, research, projects (with live-demo and source
links), experience, skills, certifications and languages. **Save** publishes
instantly — no rebuild or redeploy.

- Login comes from `ADMIN_USER` / `ADMIN_PASSWORD` in `.env` (min 10 characters).
  `make admin` sets or changes it; changing the password signs everyone out.
- Sessions last 12 hours, use an HttpOnly + SameSite=Strict cookie, and five
  wrong logins from one address lock it out for 15 minutes.
- The panel saves a backup of the previous content on every save (last 30 kept
  in the data volume) and has **Restore original content**, which resets to the
  `src/content/content.json` that shipped with the build.
- Photos are resized in the browser before upload.
- If `ADMIN_USER` / `ADMIN_PASSWORD` are not set, the panel is disabled and the
  public site is unaffected.

`src/content/content.json` is now only the **starting content**: the server copies
it into the data volume the first time it runs. After that, the panel's copy is
the live one, and edits to `content.json` only matter for a fresh volume or after
**Restore original content**. The shape is typed in `src/types.ts`.

**Backing up your edits:** `docker run --rm -v portfolio_portfolio-data:/data -v "$PWD":/out alpine tar czf /out/portfolio-data.tgz -C /data .`
(the volume name is prefixed with the compose project name; check `docker volume ls`).

### Running the panel locally

```bash
# terminal 1 — API + panel on :8787 (create .env.local with ADMIN_USER / ADMIN_PASSWORD first)
npm run dev:api
# terminal 2 — the site with hot reload; /api and /uploads are proxied to :8787
npm run dev
```

Then open <http://127.0.0.1:5173/aboli>. Local data goes to `.data/` (gitignored).

### Photos and CV

Upload a new portrait from the control panel (Profile → Upload new photo). The
default lives at `public/images/portrait.jpg`. To offer a CV download, put the
PDF at `public/resume.pdf` and set **CV link** to `/resume.pdf` in the panel.

---

## Deploying to a VPS

Same pattern as the Gym Management project: **the host's nginx terminates TLS
for every site on the server**, and each project's container publishes a
loopback-only port that its own vhost proxies to. Several sites therefore share
ports 80/443 without fighting over them, and nothing here touches another
project's config.

### First deploy on a fresh Ubuntu/Debian server

```bash
git clone https://github.com/abolfazlkeshavarz/portfolio.git /opt/portfolio
cd /opt/portfolio
./scripts/bootstrap-vps.sh
```

That single script installs Docker, writes `.env`, builds and starts the site,
then configures nginx and obtains the Let's Encrypt certificate. To skip the
prompts:

```bash
DOMAIN=abolfazlkeshavarz.com LETSENCRYPT_EMAIL=you@example.com ./scripts/bootstrap-vps.sh
```

If the server already hosts another project, the script auto-picks a free
loopback port (from 8093) and shows it before continuing.

### Deploying without building on the server

Building the frontend pulls the whole npm toolchain — the slowest and most
fragile step on a filtered connection. Build on your own machine instead and
ship the image:

```bash
# on your machine
./scripts/build-images.sh
scp dist-image/abolfazl-portfolio-image.tar.gz user@server:/opt/portfolio/

# on the server
cd /opt/portfolio
./scripts/load-images.sh
make up-prebuilt          # or ./scripts/bootstrap-vps.sh for a first-time setup
```

Both scripts verify the image architecture, so an arm64/amd64 mix-up is caught
before it turns into a bare `exec format error` at container start.

### Day-to-day

```bash
make help          # list every target
make deploy        # rebuild the image and restart
make logs          # follow container logs
make ps            # container status
make down          # stop
make ssl           # (re)configure nginx + certificate
```

Certificates renew automatically through certbot's systemd timer; the deploy
hook installed by `make ssl` reloads nginx afterwards.

### Updating the live site

```bash
cd /opt/portfolio
git pull
make deploy
```

The first time you deploy a version with the control panel on an existing
server, also set the login and refresh the host vhost (it raises the upload
limit):

```bash
make admin
make ssl
make deploy
```

---

## Project layout

```
src/
  content/content.json     all page copy and data — the only file you edit to update the site
  types.ts                 the shape content.json must satisfy
  components/              one component per section (Intro, About, Education, ...)
deploy/nginx/
  site.conf                nginx config inside the container (static file serving)
  app.conf.template        host vhost, rendered per-domain by deploy-host-nginx.sh
  security-headers.conf    HSTS/CSP snippet installed on the host
scripts/                   setup, bootstrap, image build/load, nginx+TLS
```
