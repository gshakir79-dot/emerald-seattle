# EMERALD — A Seattle Field Guide

An opinionated, hand-crafted tourist guide to Seattle and the Salish Sea.
Every visual is procedural SVG — no stock photos, no frameworks, no build dependencies.

**Live:** https://gshakir79-dot.github.io/emerald-seattle/

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

## Custom domain checklist (when purchased)

1. Change `ORIGIN` in `build.js`, run `node build.js`
2. Update the hardcoded home link in `404.html`
3. Add a `CNAME` file containing the domain; configure DNS per GitHub Pages docs
