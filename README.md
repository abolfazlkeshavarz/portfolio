# Portfolio — Abolfazl Keshavarz

A personal portfolio built as a **systems console**: a dark, instrument-like
interface where every section is a panel and every item is a physical card you
can tilt in 3D, with a WebGL node-network behind the hero.

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
| Hero + stat tiles   | `profile`             |
| Profile panel       | `profile.aboutParagraphs`, `profile.tags` |
| Stack               | `skills[]`            |
| Featured system     | the `projects[]` entry with `"featured": true` |
| Telemetry readout   | `featuredTelemetry[]` |
| Other systems       | remaining `projects[]` |
| Experience & research | `experience[]`      |
| Education           | `education[]`         |
| Connect             | `profile.email`, `.github`, `.linkedin`, `.cvUrl` |

Two ways to edit it:

1. **Directly** — open the JSON, change it, rebuild.
2. **Through the Console Content Manager** — the admin panel published as a
   Claude Artifact. Edit items there, hit **Export → Download content.json**,
   and drop the file over `src/content/content.json`.

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
  components/
    NodeField.tsx          three.js node network behind the hero
    TiltCard.tsx           3D tilt wrapper used by every card
    Panel.tsx              shared panel chrome
    Hero.tsx ... ContactPanel.tsx
  hooks/
    useTilt.ts             pointer → CSS custom properties, no per-frame React renders
    usePrefersReducedMotion.ts
deploy/nginx/
  site.conf                nginx config inside the container (static file serving)
  app.conf.template        host vhost, rendered per-domain by deploy-host-nginx.sh
  security-headers.conf    HSTS/CSP snippet installed on the host
scripts/                   setup, bootstrap, image build/load, nginx+TLS
```

---

## How the 3D works

- `useTilt` writes rotation angles to CSS custom properties (`--rx`, `--ry`,
  `--lift`) straight on the DOM node. React never re-renders during a tilt.
- `.card3d` applies `transform-style: preserve-3d`, so `.depth-1/2/3` children
  sit at real distances above the card surface — text and badges separate from
  the panel as it turns, instead of the whole thing rotating as a flat image.
- A pointer-tracked `.sheen` gradient moves across the surface to sell it as
  physical material.
- `NodeField` lazy-imports three.js after first paint, caps the device pixel
  ratio at 2, and stops its render loop when the tab is hidden or the hero
  scrolls out of view.
- Everything above is disabled under `prefers-reduced-motion: reduce` — the node
  field renders a single static frame and cards stop tilting.
