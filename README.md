# EMERALD — A Seattle Field Guide

An opinionated, hand-crafted tourist guide to Seattle and the Salish Sea.
Every visual is procedural SVG — no stock photos, no frameworks, no build dependencies.

**Live:** https://emerald-seattle.com/ (GitHub Pages, custom domain via `CNAME`)

## Structure

- `index.html` / `styles.css` / `app.js` — hand-authored homepage (animated skyline, live weather bar, rain toggle)
- `data.js` — **all content**: 8 neighborhood dossiers, 6 food-doctrine categories, 6 day trips, with addresses and coordinates
- `build.js` — zero-dependency static site generator
- `guide.css` / `page.js` — shared styles and behavior for generated pages (incl. Leaflet maps)
- `neighborhoods/`, `eat/`, `day-trips/` — **generated output, do not hand-edit**

## Editing content

```
# edit data.js, then:
node build.js
```

Regenerates all 23 sub-pages plus `sitemap.xml` and `robots.txt`.

## Local preview

Any static server, e.g. `npx serve .` — or just open `index.html` directly (all links are relative).

## Custom domain

Domain purchased 2026-07-13 (Porkbun). `CNAME` file at repo root + `ORIGIN` in `build.js`
both point at `emerald-seattle.com`. DNS: A records (apex) to GitHub Pages IPs, `www` CNAME
to `gshakir79-dot.github.io`. Enforce HTTPS is set in repo Settings → Pages.
