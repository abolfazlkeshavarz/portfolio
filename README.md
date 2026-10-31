# Portfolio — Abolfazl Keshavarz

A personal academic portfolio: a calm, paper-toned single page with serif
headings, a CV-style section layout, and selected research and projects.

Static site — React + TypeScript + Tailwind, built by Vite, served by nginx in a
container. No database, no backend process in production.

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

**Everything on the page comes from one file: `src/content/content.json`.** No
copy lives in a component. The shape is typed in `src/types.ts`, so a wrong key
or a missing field fails the build rather than silently rendering nothing.

| Section on the page | Key in `content.json` |
| ------------------- | --------------------- |
| Intro, About, Research interests | `profile` |
| Education           | `education[]`         |
| Research            | `research[]`          |
| Selected projects   | `projects[]` (`"featured": true` gets the full write-up) |
| Teaching & experience | `experience[]`      |
| Skills & certificates | `skills[]`, `certifications[]`, `languages[]` |
| Contact             | `profile.email`, `.github`, `.linkedin`, `.cvUrl` |

Two ways to edit it:

1. **Directly** — open the JSON, change it, rebuild.
2. **Through the Console Content Manager** — a private admin panel published
   as a Claude Artifact (<https://claude.ai/artifact/WXHVtKRx5bT4bPiuAVQFr6>).
   Its fields mirror `src/types.ts`. Edit items there, open
   **Import / Export → Download content.json**, and drop the file over
   `src/content/content.json`. If you edit the JSON by hand instead, use
   **Choose content.json…** on the same tab to load it back into the panel so
   the two don't drift apart.

   If you add a field to `src/types.ts`, add it to the panel's schema too.

Content changes require a rebuild (`make deploy`, or `npm run build` locally) —
the JSON is compiled into the bundle so the page paints instantly with no
loading state and stays readable to search engines.

### Photos

Drop `portrait.jpg` and `about.jpg` into `public/images/` — see
[`public/images/README.md`](public/images/README.md) for sizes and framing.
Until they exist, each slot renders a labelled placeholder rather than a broken
image, so you can deploy first and add photos later.

### CV

Put your PDF at `public/resume.pdf` (the path is `profile.cvUrl`).

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
