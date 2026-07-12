# Dr Ammar M. H. Shehadeh — Portfolio

A single-page faculty/practice portfolio built with plain HTML, CSS, and vanilla JS, bundled with [Vite](https://vitejs.dev/).

## Structure

```
index.html          All page markup and content (edit text directly here)
src/style.css        Design tokens (CSS custom properties) + all styling
src/main.js          Scroll-reveal, sticky nav, mobile menu, publications toggle
public/favicon.svg   Monogram favicon
public/images/       Drop-in photos (portrait, book covers) — see below
```

## Editing content

All visible text lives in `index.html` as plain, semantic markup — there is no CMS or templating layer. Open the file and edit directly:

- **Hero / About / Experience / Teaching / Skills / Contact** — edit the text inside each `<section>`.
- **Publications** — each entry is an `<li>` inside `.pub-list`. The first list (`#publications`) holds the eight featured citations. Additional citations go inside the collapsible list with `id="pubMore"` — there's a placeholder `<li>` and HTML comments marking where to paste the remaining 2002–2018 references.

Colours, fonts, and spacing are all defined as CSS custom properties at the top of `src/style.css` under `:root` — change a value there to restyle the whole site consistently.

## Adding photos (no code changes needed)

The hero portrait and both book covers are already wired up to files in `public/images/` — see `public/images/README.txt` for full details. Just drop in files with these exact names and refresh:

| File | Used for |
| --- | --- |
| `public/images/dr-shehadeh.jpg` | Hero circular portrait |
| `public/images/paediatric-encounter.jpg` | "Paediatric Encounter" book cover |
| `public/images/pediatric-cardiology.jpg` | "Pediatric Cardiology" book cover |

Until a file exists at one of those paths, that spot shows a built-in placeholder (initials for the portrait, a typeset title card for each book) instead of a broken image — the site never looks unfinished. Each `<img>` uses `onerror` to fall back to the placeholder automatically, so no code needs to change in either direction; adding or removing a file just works on the next reload.

## Running locally

Requires [Node.js](https://nodejs.org/) 18+.

```bash
cd paediatric-portfolio
npm install
npm run dev
```

Vite will print a local URL (default `http://localhost:5173`). Open it in your browser; changes to any file hot-reload instantly.

## Building for production

```bash
npm run build
```

This outputs a static, optimised site to `dist/`. Preview the production build locally with:

```bash
npm run preview
```

## Deploying

The `dist/` folder is a fully static site — deploy it to any static host:

- **Netlify / Vercel**: connect the repository and set build command `npm run build`, output directory `dist`.
- **GitHub Pages**: run `npm run build`, then publish the contents of `dist/` to a `gh-pages` branch (e.g. using the `gh-pages` npm package or GitHub Actions).
- **Any static host** (S3, Cloudflare Pages, plain Nginx/Apache): upload the contents of `dist/` as-is.

No environment variables, server, or database are required.

## Accessibility & performance notes

- Respects `prefers-reduced-motion`: scroll-reveal and smooth-scroll animations are disabled for users who request reduced motion.
- All interactive elements have visible keyboard focus states.
- Semantic landmarks (`header`, `nav`, `main`, `section`, `footer`) and a skip-to-content link are included.
- No external JS frameworks or 3D/graphics libraries — just two Google Fonts (Fraunces, Inter) and a few KB of vanilla JS.
