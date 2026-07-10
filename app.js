/* EMERALD — interactions & procedural scene details */

// ---------- file:// support ----------
// If the guide is opened straight from the folder (no web server), root-relative
// links would point at the drive root. Rewrite them to real relative paths.
(() => {
  if (location.protocol !== 'file:') return;
  document.querySelectorAll('a[href^="/"]').forEach(a => {
    let href = a.getAttribute('href');
    if (href === '/') { a.setAttribute('href', 'index.html'); return; }
    if (href.endsWith('/')) href += 'index.html';
    a.setAttribute('href', href.slice(1));
  });
})();

// ---------- procedural stars ----------
(() => {
  const g = document.getElementById('stars');
  if (!g) return;
  const NS = 'http://www.w3.org/2000/svg';
  for (let i = 0; i < 70; i++) {
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', (Math.random() * 1440).toFixed(1));
    c.setAttribute('cy', (Math.random() * 320).toFixed(1));
    c.setAttribute('r', (Math.random() * 1.1 + 0.3).toFixed(2));
    c.setAttribute('opacity', (Math.random() * 0.6 + 0.15).toFixed(2));
    if (Math.random() < 0.3) {
      c.style.animation = `beacon ${(Math.random() * 3 + 2).toFixed(1)}s ease-in-out ${(Math.random() * 3).toFixed(1)}s infinite`;
    }
    g.appendChild(c);
  }
})();

// ---------- procedural window lights + reflections ----------
(() => {
  const wins = document.getElementById('windows');
  const refl = document.getElementById('reflections');
  if (!wins) return;
  const NS = 'http://www.w3.org/2000/svg';
  // building footprints: [x, yTop, width] — lights fill from yTop+12 down to 630
  const buildings = [
    [60, 470, 58], [128, 430, 46], [184, 500, 70], [268, 425, 48],
    [332, 452, 54], [398, 392, 40], [456, 370, 36], [508, 418, 62],
    [582, 472, 44], [640, 484, 26], [680, 510, 58],
    [900, 520, 52], [962, 488, 40], [1012, 540, 66],
  ];
  buildings.forEach(([bx, by, bw]) => {
    const cols = Math.max(2, Math.floor(bw / 12));
    const rows = Math.floor((630 - by - 14) / 16);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (Math.random() > 0.38) continue;
        const w = document.createElementNS(NS, 'rect');
        const x = bx + 5 + c * (bw - 10) / cols;
        const y = by + 14 + r * 16;
        w.setAttribute('x', x.toFixed(1));
        w.setAttribute('y', y.toFixed(1));
        w.setAttribute('width', '4');
        w.setAttribute('height', '5');
        w.setAttribute('opacity', (Math.random() * 0.55 + 0.3).toFixed(2));
        if (Math.random() < 0.06) {
          w.style.animation = `beacon ${(Math.random() * 4 + 3).toFixed(1)}s ease-in-out ${(Math.random() * 4).toFixed(1)}s infinite`;
        }
        wins.appendChild(w);
        // reflection streak in the water
        if (refl && Math.random() < 0.18) {
          const s = document.createElementNS(NS, 'rect');
          s.setAttribute('x', x.toFixed(1));
          s.setAttribute('y', (648 + Math.random() * 90).toFixed(1));
          s.setAttribute('width', '3');
          s.setAttribute('height', (Math.random() * 18 + 6).toFixed(1));
          s.setAttribute('fill', '#ffd9a0');
          s.setAttribute('opacity', (Math.random() * 0.3 + 0.1).toFixed(2));
          refl.appendChild(s);
        }
      }
    }
  });
})();

// ---------- scroll: nav state + parallax ----------
(() => {
  const nav = document.getElementById('nav');
  const layers = document.querySelectorAll('.layer');
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      nav.classList.toggle('scrolled', y > 40);
      if (y < window.innerHeight) {
        layers.forEach(l => {
          const d = parseFloat(l.dataset.depth || 0);
          l.style.transform = `translateY(${y * d}px)`;
        });
      }
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ---------- reveal on scroll ----------
(() => {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

// ---------- itinerary tabs ----------
(() => {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      const panel = document.getElementById(tab.dataset.tab);
      panel.classList.add('active');
      panel.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
    });
  });
})();

// ---------- rain toggle ----------
(() => {
  const btn = document.getElementById('rainToggle');
  const layer = document.getElementById('rain-layer');
  let built = false;
  const build = () => {
    for (let i = 0; i < 90; i++) {
      const drop = document.createElement('i');
      drop.style.left = Math.random() * 100 + 'vw';
      drop.style.animationDuration = (Math.random() * 0.5 + 0.55) + 's';
      drop.style.animationDelay = (Math.random() * 2) + 's';
      drop.style.opacity = (Math.random() * 0.5 + 0.3).toFixed(2);
      layer.appendChild(drop);
    }
    built = true;
  };
  btn.addEventListener('click', () => {
    const on = btn.getAttribute('aria-pressed') !== 'true';
    btn.setAttribute('aria-pressed', String(on));
    btn.querySelector('.rain-label').textContent = on ? 'Raining' : 'Make it rain';
    if (on && !built) build();
    document.body.classList.toggle('raining', on);
  });
})();

// ---------- ticker: duplicate content for seamless loop ----------
(() => {
  const track = document.getElementById('tickerTrack');
  track.innerHTML += track.innerHTML;
})();

// ---------- day trips: drag to scroll ----------
(() => {
  const el = document.getElementById('trips');
  let down = false, startX = 0, startLeft = 0, moved = 0;
  el.addEventListener('pointerdown', e => {
    down = true; moved = 0; startX = e.clientX; startLeft = el.scrollLeft;
    el.classList.add('dragging');
  });
  window.addEventListener('pointermove', e => {
    if (!down) return;
    moved = Math.max(moved, Math.abs(e.clientX - startX));
    el.scrollLeft = startLeft - (e.clientX - startX);
  });
  window.addEventListener('pointerup', () => {
    down = false;
    el.classList.remove('dragging');
  });
  // a drag should not count as a click on a card link
  el.addEventListener('click', e => {
    if (moved > 6) { e.preventDefault(); e.stopPropagation(); }
  }, true);
})();

// ---------- live field conditions (Open-Meteo, no key) ----------
(() => {
  const bar = document.getElementById('conditions');
  if (!bar) return;
  const SKY = c => {
    if (c === 0) return 'CLEAR SKIES';
    if (c <= 2) return 'PARTLY CLOUDY';
    if (c === 3) return 'OVERCAST';
    if (c <= 48) return 'FOG';
    if (c <= 57) return 'DRIZZLE';
    if (c <= 67) return 'RAIN';
    if (c <= 77) return 'SNOW';
    if (c <= 82) return 'SHOWERS';
    return 'THUNDER';
  };
  fetch('https://api.open-meteo.com/v1/forecast?latitude=47.6062&longitude=-122.3321'
      + '&current=temperature_2m,precipitation,weather_code,cloud_cover'
      + '&daily=precipitation_probability_max&forecast_days=1'
      + '&temperature_unit=fahrenheit&timezone=America%2FLos_Angeles')
    .then(r => r.json())
    .then(d => {
      const c = d.current;
      document.getElementById('condTemp').textContent = Math.round(c.temperature_2m) + '°F';
      document.getElementById('condSky').textContent = SKY(c.weather_code);
      document.getElementById('condRain').textContent =
        'RAIN CHANCE ' + (d.daily && d.daily.precipitation_probability_max ? d.daily.precipitation_probability_max[0] : '—') + '%';
      const mtn = c.cloud_cover <= 30 ? 'OUT' : c.cloud_cover <= 60 ? 'PLAYING COY' : 'HIDING';
      document.getElementById('condMtn').textContent = mtn;
      bar.hidden = false;
    })
    .catch(() => { /* stay hidden — the site works without live data */ });
})();
