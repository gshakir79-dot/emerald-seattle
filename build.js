/* EMERALD static site generator — zero dependencies.
   Usage: node build.js
   Generates /neighborhoods/, /eat/, /day-trips/ page trees + sitemap.xml + robots.txt
   from data.js. Homepage (index.html) is hand-authored and not touched. */

const fs = require("fs");
const path = require("path");
const { neighborhoods, eatCategories, dayTrips, tripArt } = require("./data.js");

// Live at GitHub Pages for now; change to the custom domain when purchased, then `node build.js` and push.
const ORIGIN = "https://gshakir79-dot.github.io/emerald-seattle";
const ROOT = __dirname;

const gmaps = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q + ", Seattle area, WA")}`;
const gdir = (q) => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}`;

/* ---------- shared shell ---------- */

function shell({ title, desc, urlPath, body, hasMap, crumbs }) {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem", position: i + 1, name: c.name, item: ORIGIN + c.href,
    })),
  };
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} — EMERALD Seattle Field Guide</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${ORIGIN}${urlPath}">
<meta property="og:title" content="${title} — EMERALD Seattle Field Guide">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${ORIGIN}${urlPath}">
<meta property="og:site_name" content="EMERALD — A Seattle Field Guide">
<meta property="og:type" content="article">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌲</text></svg>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..600&family=Outfit:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
${hasMap ? `<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">` : ""}
<link rel="stylesheet" href="/styles.css">
<link rel="stylesheet" href="/guide.css">
<script type="application/ld+json">${JSON.stringify(breadcrumbLd)}</script>
</head>
<body class="subpage">

<div class="grain" aria-hidden="true"></div>

<header class="nav" id="nav">
  <a class="nav-brand" href="/">
    <svg viewBox="0 0 24 32" class="brand-needle" aria-hidden="true">
      <path d="M12 0 L13 10 L18 22 L14 22 L14 32 L10 32 L10 22 L6 22 L11 10 Z" fill="currentColor"/>
      <ellipse cx="12" cy="11" rx="7" ry="2.4" fill="currentColor"/>
    </svg>
    <span>EMERALD<em>/ a seattle field guide</em></span>
  </a>
  <nav class="nav-links">
    <a href="/neighborhoods/">Neighborhoods</a>
    <a href="/eat/">Eat &amp; Drink</a>
    <a href="/day-trips/">Day Trips</a>
    <a href="/#itineraries">Itineraries</a>
    <a href="/#fieldnotes">Field Notes</a>
  </nav>
  <a class="rain-toggle nav-back" href="/">← The Guide</a>
</header>

${body}

<footer class="footer">
  <svg class="footer-skyline" viewBox="0 0 1440 120" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <path d="M0 120 L0 90 L60 90 L60 60 L100 60 L100 85 L160 85 L160 40 L200 40 L200 120 M240 120 L240 70 L300 70 L300 95 L360 95 L360 55 L420 55 L420 120 M470 120 L470 30 Q495 8 520 30 L520 120 M560 120 L560 65 L620 65 L620 120 M700 120 L706 20 L712 20 L718 120 M713 24 a30 7 0 1 0 -12 0 M780 120 L780 75 L840 75 L840 50 L880 50 L880 120 M940 120 L940 60 L1000 60 L1000 120 M1050 120 L1050 80 L1110 80 L1110 45 L1150 45 L1150 120 M1210 120 L1210 70 L1270 70 L1270 95 L1330 95 L1330 120 M1370 120 L1370 60 L1440 60 L1440 120"
      fill="none" stroke="currentColor" stroke-width="2" opacity="0.4"/>
  </svg>
  <div class="wrap footer-inner">
    <div class="footer-brand">
      <span class="footer-logo">EMERALD</span>
      <p>A field guide to Seattle &amp; the Salish Sea.<br>Drawn entirely in code. No stock photos were harmed.</p>
    </div>
    <div class="footer-cols">
      <div><h4>Guide</h4><a href="/neighborhoods/">Neighborhoods</a><a href="/eat/">Eat &amp; Drink</a><a href="/#itineraries">Itineraries</a></div>
      <div><h4>Beyond</h4><a href="/day-trips/">Day Trips</a><a href="/#seasons">Seasons</a><a href="/#fieldnotes">Field Notes</a></div>
    </div>
  </div>
  <div class="footer-bottom">
    <span>MMXXVI · Made with rain</span>
    <span>47.6062° N — 122.3321° W</span>
  </div>
</footer>

<script src="/page.js"></script>
${hasMap ? `<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script><script>window.addEventListener('load',()=>window.__initMap&&window.__initMap());</script>` : ""}
</body>
</html>`;
}

/* ---------- reusable fragments ---------- */

function crumbsHtml(crumbs) {
  return `<p class="crumbs">${crumbs
    .map((c, i) => (i === crumbs.length - 1 ? `<span>${c.name}</span>` : `<a href="${c.href}">${c.name}</a>`))
    .join(`<i>/</i>`)}</p>`;
}

function mapBlock(center, zoom, markers) {
  const data = {
    center, zoom,
    markers: markers.filter((m) => m.coords).map((m) => ({
      lat: m.coords[0], lng: m.coords[1], name: m.name, addr: m.address, dir: gmaps(`${m.name}, ${m.address}`),
    })),
  };
  return `
  <div class="map-wrap reveal">
    <div class="map-head"><span class="kicker">The Map</span><span class="map-note">Tap a marker for directions</span></div>
    <div id="map" class="map-frame"></div>
    <script type="application/json" id="map-data">${JSON.stringify(data)}</script>
  </div>`;
}

function stopsHtml(stops, startNum = 1) {
  return stops.map((s, i) => `
    <article class="stop reveal">
      <div class="stop-num">${String(i + startNum).padStart(2, "0")}</div>
      <div class="stop-body">
        <div class="stop-tag">${s.tag || s.price || ""}</div>
        <h3>${s.name}</h3>
        <p>${s.blurb}</p>
        <div class="stop-foot">
          <span class="stop-addr">${s.address}</span>
          ${s.coords ? `<a class="stop-link" href="${gmaps(`${s.name}, ${s.address}`)}" target="_blank" rel="noopener">Directions ↗</a>
          <a class="stop-link dim" href="${gmaps(`${s.name}, ${s.address}`)}" target="_blank" rel="noopener">Hours ↗</a>` : ""}
        </div>
      </div>
    </article>`).join("");
}

function pagenav(prev, next, base, label) {
  return `
  <nav class="pagenav wrap reveal" aria-label="More ${label}">
    ${prev ? `<a class="pn prev" href="${base}${prev.slug}/"><span>← Previous</span><b>${prev.shortName || prev.name}</b></a>` : `<span class="pn empty"></span>`}
    <a class="pn all" href="${base}"><span>All ${label}</span></a>
    ${next ? `<a class="pn next" href="${base}${next.slug}/"><span>Next →</span><b>${next.shortName || next.name}</b></a>` : `<span class="pn empty"></span>`}
  </nav>`;
}

/* ---------- neighborhood pages ---------- */

function neighborhoodPage(h, i) {
  const prev = neighborhoods[i - 1], next = neighborhoods[i + 1];
  const crumbs = [
    { name: "EMERALD", href: "/" },
    { name: "Neighborhoods", href: "/neighborhoods/" },
    { name: h.name, href: `/neighborhoods/${h.slug}/` },
  ];
  const body = `
<main class="page">
  <section class="page-hero">
    <div class="wrap">
      ${crumbsHtml(crumbs)}
      <p class="kicker reveal">Dossier ${h.num} — The Territory</p>
      <h1 class="page-title reveal">${h.name}</h1>
      <p class="lede reveal">${h.lede}</p>
    </div>
  </section>

  <section class="wrap">
    <div class="essentials reveal">
      <div class="ess"><span>Get there</span><b>${h.essentials.getThere}</b></div>
      <div class="ess"><span>Time needed</span><b>${h.essentials.time}</b></div>
      <div class="ess"><span>Best at</span><b>${h.essentials.best}</b></div>
      <div class="ess"><span>Pairs with</span><b><a href="${h.essentials.pairs.href}">${h.essentials.pairs.label}</a></b></div>
    </div>

    <div class="prose reveal">${h.body.map((p) => `<p>${p}</p>`).join("")}</div>

    ${mapBlock(h.map.center, h.map.zoom, h.stops)}

    <div class="stops-head reveal"><p class="kicker">Field-tested stops</p></div>
    <div class="stops">${stopsHtml(h.stops)}</div>

    <aside class="tip-block reveal">
      <span class="tip-label">Local tip</span>
      <p>${h.tip}</p>
    </aside>
  </section>

  ${pagenav(prev, next, "/neighborhoods/", "neighborhoods")}
</main>`;
  return shell({
    title: h.name, desc: h.metaDesc,
    urlPath: `/neighborhoods/${h.slug}/`, body, hasMap: true, crumbs,
  });
}

function neighborhoodsIndex() {
  const crumbs = [
    { name: "EMERALD", href: "/" },
    { name: "Neighborhoods", href: "/neighborhoods/" },
  ];
  const cards = neighborhoods.map((h) => `
    <a class="hood reveal idx-card" href="/neighborhoods/${h.slug}/">
      <div class="hood-num">${h.num}</div>
      <h3>${h.name}</h3>
      <p>${h.teaser}</p>
      <span class="idx-more">Open dossier →</span>
    </a>`).join("");
  const body = `
<main class="page">
  <section class="page-hero">
    <div class="wrap">
      ${crumbsHtml(crumbs)}
      <p class="kicker reveal">01 — The Territory</p>
      <h1 class="page-title reveal">Eight neighborhoods, <em>zero filler</em></h1>
      <p class="lede reveal">Every dossier: how to get there, how long it takes, a mapped route of field-tested stops, and the local tip that changes the visit.</p>
    </div>
  </section>
  <section class="wrap"><div class="hood-grid">${cards}</div></section>
</main>`;
  return shell({
    title: "Seattle Neighborhoods", urlPath: "/neighborhoods/",
    desc: "Eight Seattle neighborhoods worth your shoe leather — Pike Place, Capitol Hill, Ballard, Fremont, Queen Anne, the C-ID, West Seattle, and Georgetown — each with a mapped dossier.",
    body, hasMap: false, crumbs,
  });
}

/* ---------- eat pages ---------- */

function eatPage(c, i) {
  const prev = eatCategories[i - 1], next = eatCategories[i + 1];
  const crumbs = [
    { name: "EMERALD", href: "/" },
    { name: "Eat & Drink", href: "/eat/" },
    { name: c.name, href: `/eat/${c.slug}/` },
  ];
  const body = `
<main class="page">
  <section class="page-hero">
    <div class="wrap">
      ${crumbsHtml(crumbs)}
      <p class="kicker reveal">The Food Doctrine — ${c.cat}</p>
      <h1 class="page-title reveal">${c.name}</h1>
      <p class="lede reveal">${c.lede}</p>
    </div>
  </section>

  <section class="wrap">
    ${mapBlock([47.612, -122.335], 12, c.places)}
    <div class="stops-head reveal"><p class="kicker">Where to go</p></div>
    <div class="stops">${stopsHtml(c.places)}</div>
    <aside class="tip-block reveal">
      <span class="tip-label">Doctrine</span>
      <p>${c.tip}</p>
    </aside>
  </section>

  ${pagenav(prev, next, "/eat/", "food doctrine")}
</main>`;
  return shell({
    title: c.name, desc: c.metaDesc,
    urlPath: `/eat/${c.slug}/`, body, hasMap: true, crumbs,
  });
}

function eatIndex() {
  const crumbs = [
    { name: "EMERALD", href: "/" },
    { name: "Eat & Drink", href: "/eat/" },
  ];
  const rows = eatCategories.map((c) => `
    <a class="menu-row reveal idx-row" href="/eat/${c.slug}/">
      <div class="menu-cat">${c.cat}</div>
      <div class="menu-body"><h3>${c.name}</h3><p>${c.teaser}</p></div>
      <div class="menu-price">→</div>
    </a>`).join("");
  const body = `
<main class="page">
  <section class="page-hero">
    <div class="wrap">
      ${crumbsHtml(crumbs)}
      <p class="kicker reveal">02 — Sustenance</p>
      <h1 class="page-title reveal">The food <em>doctrine</em></h1>
      <p class="lede reveal">Non-negotiables, in the order you should eat them — each with addresses, maps, and marching orders.</p>
    </div>
  </section>
  <section class="wrap"><div class="menu-list">${rows}</div></section>
</main>`;
  return shell({
    title: "Where to Eat & Drink in Seattle", urlPath: "/eat/",
    desc: "Seattle's food doctrine: coffee, oysters, teriyaki, pho and dim sum, pastry, and cocktail bars — the non-negotiables with addresses and maps.",
    body, hasMap: false, crumbs,
  });
}

/* ---------- day trip pages ---------- */

function tripPage(t, i) {
  const prev = dayTrips[i - 1], next = dayTrips[i + 1];
  const crumbs = [
    { name: "EMERALD", href: "/" },
    { name: "Day Trips", href: "/day-trips/" },
    { name: t.shortName, href: `/day-trips/${t.slug}/` },
  ];
  const body = `
<main class="page">
  <section class="page-hero trip-hero">
    <div class="wrap">
      ${crumbsHtml(crumbs)}
      <p class="kicker reveal">Beyond the City — ${t.meta.join(" · ")}</p>
      <h1 class="page-title reveal">${t.name}</h1>
      <p class="lede reveal">${t.lede}</p>
    </div>
    <div class="trip-banner reveal">${tripArt[t.slug]}</div>
  </section>

  <section class="wrap">
    <div class="essentials reveal">
      ${t.stats.map(([k, v]) => `<div class="ess"><span>${k}</span><b>${v}</b></div>`).join("")}
    </div>
  </section>

  <section class="section-paper plan-band">
    <div class="wrap">
      <div class="stops-head reveal"><p class="kicker">The Plan</p></div>
      <div class="timeline">
        ${t.plan.map((p) => `
        <div class="tl-item reveal"><span class="tl-time">${p.time}</span><div><h4>${p.title}</h4><p>${p.text}</p></div></div>`).join("")}
      </div>
    </div>
  </section>

  <section class="wrap">
    ${mapBlock(t.map.center, t.map.zoom, t.markers)}
    <div class="ntk reveal">
      <p class="kicker">Need to know</p>
      <ul>${t.needToKnow.map((n) => `<li>${n}</li>`).join("")}</ul>
      <div class="ntk-actions">
        <a class="btn btn-solid" href="${gdir(t.directions)}" target="_blank" rel="noopener">Route it from Seattle ↗</a>
        ${t.ferryLink ? `<a class="btn btn-ghost" href="https://wsdot.wa.gov/travel/washington-state-ferries/schedule" target="_blank" rel="noopener">Ferry schedules ↗</a>` : ""}
      </div>
    </div>
  </section>

  ${pagenav(prev, next, "/day-trips/", "day trips")}
</main>`;
  return shell({
    title: `${t.name} Day Trip`, desc: t.metaDesc,
    urlPath: `/day-trips/${t.slug}/`, body, hasMap: true, crumbs,
  });
}

function tripsIndex() {
  const crumbs = [
    { name: "EMERALD", href: "/" },
    { name: "Day Trips", href: "/day-trips/" },
  ];
  const cards = dayTrips.map((t) => `
    <a class="trip reveal idx-trip" href="/day-trips/${t.slug}/">
      ${tripArt[t.slug]}
      <div class="trip-body">
        <div class="trip-meta"><span>${t.meta[0]}</span><span>${t.meta[1]}</span></div>
        <h3>${t.name}</h3>
        <p>${t.teaser}</p>
      </div>
    </a>`).join("");
  const body = `
<main class="page">
  <section class="page-hero">
    <div class="wrap">
      ${crumbsHtml(crumbs)}
      <p class="kicker reveal">04 — Beyond the City</p>
      <h1 class="page-title reveal">Day trips worth <em>the drive</em></h1>
      <p class="lede reveal">Six escapes, each with an hour-by-hour plan, a map, and the honest logistics nobody prints on the brochure.</p>
    </div>
  </section>
  <section class="wrap"><div class="trips-grid">${cards}</div></section>
</main>`;
  return shell({
    title: "Day Trips from Seattle", urlPath: "/day-trips/",
    desc: "Six day trips from Seattle worth the drive: Mount Rainier, Bainbridge Island, Snoqualmie Falls, Leavenworth, the San Juan Islands, and the Olympic Peninsula.",
    body, hasMap: false, crumbs,
  });
}

/* ---------- write everything ---------- */

/* Convert root-relative hrefs to depth-aware relative ones so pages work
   both on a server AND opened directly from the filesystem (file://). */
function relativize(html, depth) {
  const prefix = "../".repeat(depth);
  return html.replace(/(href|src)="\/([^"]*)"/g, (m, attr, p) => {
    if (p === "") return `${attr}="${prefix}index.html"`;               // "/"
    if (p.startsWith("#")) return `${attr}="${prefix}index.html${p}"`; // "/#section"
    if (p.endsWith("/")) p += "index.html";                             // "/eat/" etc.
    return `${attr}="${prefix}${p}"`;
  });
}

const pages = [];
function emit(rel, html) {
  const depth = rel.split("/").length;
  const file = path.join(ROOT, rel, "index.html");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, relativize(html, depth));
  pages.push("/" + rel.replace(/\\/g, "/") + "/");
  console.log("  built /" + rel.replace(/\\/g, "/") + "/");
}

emit("neighborhoods", neighborhoodsIndex());
neighborhoods.forEach((h, i) => emit(`neighborhoods/${h.slug}`, neighborhoodPage(h, i)));
emit("eat", eatIndex());
eatCategories.forEach((c, i) => emit(`eat/${c.slug}`, eatPage(c, i)));
emit("day-trips", tripsIndex());
dayTrips.forEach((t, i) => emit(`day-trips/${t.slug}`, tripPage(t, i)));

/* sitemap + robots */
const urls = ["/", ...pages];
fs.writeFileSync(path.join(ROOT, "sitemap.xml"),
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${ORIGIN}${u}</loc></url>`).join("\n")}
</urlset>
`);
fs.writeFileSync(path.join(ROOT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`);

console.log(`\n${urls.length} URLs (${pages.length} generated pages + homepage) · sitemap.xml · robots.txt`);
