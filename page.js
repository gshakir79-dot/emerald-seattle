/* EMERALD — shared subpage behavior: nav, reveals, Leaflet map */

// nav background on scroll
(() => {
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// reveal on scroll
(() => {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

// Leaflet map — called after the Leaflet script loads
window.__initMap = () => {
  const el = document.getElementById('map');
  const dataEl = document.getElementById('map-data');
  if (!el || !dataEl || typeof L === 'undefined') return;
  const data = JSON.parse(dataEl.textContent);

  const map = L.map(el, {
    center: data.center,
    zoom: data.zoom,
    scrollWheelZoom: false,
    zoomControl: true,
  });
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
  }).addTo(map);

  const icon = L.divIcon({ className: 'pin', html: '<span class="pin-dot"></span>', iconSize: [12, 12], iconAnchor: [6, 6] });
  const bounds = [];
  data.markers.forEach(m => {
    bounds.push([m.lat, m.lng]);
    L.marker([m.lat, m.lng], { icon })
      .addTo(map)
      .bindPopup(`<b>${m.name}</b><span class="pp-addr">${m.addr}</span><a href="${m.dir}" target="_blank" rel="noopener">DIRECTIONS ↗</a>`);
  });
  if (bounds.length > 1) map.fitBounds(bounds, { padding: [46, 46], maxZoom: data.zoom });
};
