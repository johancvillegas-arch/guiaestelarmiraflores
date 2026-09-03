'use strict';

let map, placesData;
let activeCategory = 'all';
let activeZona     = 'miraflores';
let activeLang     = 'es';
let activeTour     = null;
let markerLayer = {};   // { id: { marker, place } }

const i18n = {
  es: {
    title:       'Mapa Turístico de Miraflores y Centro de Lima · Eco Estelar',
    subtitle:    'Miraflores · Lima, Perú',
    metaTitle:   'Mapa Turístico de Miraflores y Centro de Lima · Eco Estelar',
    description: 'Guía interactiva sostenible del Hotel Estelar Miraflores',
  },
  en: {
    title:       'Tourist Map of Miraflores & Downtown Lima · Eco Estelar',
    subtitle:    'Miraflores · Lima, Peru',
    metaTitle:   'Tourist Map of Miraflores & Downtown Lima · Eco Estelar',
    description: 'Sustainable interactive guide by Hotel Estelar Miraflores',
  },
};

function applyLang() {
  const t = i18n[activeLang];
  document.getElementById('app-title').textContent    = t.title;
  document.getElementById('app-subtitle').textContent = t.subtitle;
  document.title = t.metaTitle;
  document.querySelector('meta[name="description"]').setAttribute('content', t.description);
  document.getElementById('lang-toggle').textContent  = activeLang === 'es' ? 'EN' : 'ES';
}

function toggleLang() {
  activeLang = activeLang === 'es' ? 'en' : 'es';
  applyLang();
}

// ── Bootstrap ──────────────────────────────────────────────────
async function init() {
  console.log('[GuiaEstelar] init() start');

  // Diagnóstico: verificar que Leaflet esté disponible
  if (typeof L === 'undefined') {
    console.error('[GuiaEstelar] ERROR: Leaflet (L) no está definido. Revisa que el script de Leaflet se cargó correctamente.');
    showLoadError('Error: librería de mapa no disponible. Recarga la página.');
    return;
  }
  console.log('[GuiaEstelar] Leaflet OK, versión:', L.version);

  try {
    console.log('[GuiaEstelar] Cargando places.json…');
    const res = await fetch('./data/places.json');
    console.log('[GuiaEstelar] fetch status:', res.status, res.ok);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    placesData = await res.json();
    console.log('[GuiaEstelar] places.json cargado:', placesData.places.length, 'lugares,', placesData.categories.length, 'categorías');
  } catch (err) {
    console.error('[GuiaEstelar] ERROR al cargar places.json:', err);
    showLoadError('Error al cargar datos. Verifica tu conexión.');
    return;
  }

  try {
    console.log('[GuiaEstelar] Inicializando mapa…');
    initMap();
    console.log('[GuiaEstelar] Mapa OK');

    console.log('[GuiaEstelar] Construyendo sidebar…');
    buildSidebar();

    console.log('[GuiaEstelar] Añadiendo marcadores…');
    addMarkers();

    console.log('[GuiaEstelar] Enlazando eventos…');
    bindEvents();

    applyLang();
    hideLoading();
    console.log('[GuiaEstelar] Listo.');
  } catch (err) {
    console.error('[GuiaEstelar] ERROR durante la inicialización del mapa/UI:', err);
    showLoadError('Error al inicializar el mapa. Recarga la página.');
    return;
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

function showLoadError(msg) {
  const p = document.querySelector('#loading p');
  if (p) p.textContent = msg;
}

// ── Mapa ───────────────────────────────────────────────────────
function initMap() {
  const { lat, lng, name, address } = placesData.hotel;

  map = L.map('map', {
    center: [lat, lng],
    zoom: 15,
    zoomControl: false,
  });

  const attribution = '<a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a> · © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors';

  if (typeof L.maplibreGL === 'function') {
    L.maplibreGL({
      style: 'https://tiles.openfreemap.org/styles/positron',
      attribution,
    }).addTo(map);
  } else {
    // Respaldo si MapLibre GL no cargó (p. ej. sin conexión al CDN)
    console.warn('[GuiaEstelar] MapLibre GL no disponible, usando teselas OSM estándar.');
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      subdomains: 'abc',
      maxZoom: 19,
    }).addTo(map);
  }

  L.control.zoom({ position: 'topright' }).addTo(map);
}

// ── Barra lateral ──────────────────────────────────────────────
function buildSidebar() {
  const container = document.getElementById('categories-list');
  container.innerHTML = '';

  if (activeZona === 'tours') {
    const tours = placesData.places.filter(p => p.zona === 'tours');
    tours.forEach(tour => {
      const btn = document.createElement('button');
      btn.className = 'category-btn tour-btn' + (activeTour === tour.id ? ' active' : '');
      btn.dataset.tourId = tour.id;
      btn.innerHTML = `
        <span class="cat-emoji">${tour.pinEmoji || '🎫'}</span>
        <span class="cat-label">${tour.name}</span>`;
      btn.addEventListener('click', () => selectTour(tour.id));
      container.appendChild(btn);
    });
    return;
  }

  placesData.categories.forEach(cat => {
    const count = placesData.places.filter(p =>
      p.category === cat.id && (p.zona || 'miraflores') === activeZona
    ).length;
    if (count === 0) return;

    const btn = document.createElement('button');
    btn.className = 'category-btn' + (activeCategory === cat.id ? ' active' : '');
    btn.dataset.category = cat.id;
    const iconHtml = cat.iconImg
      ? `<img src="${cat.iconImg}" class="cat-icon-img" alt="${cat.label}">`
      : `<span class="cat-emoji">${cat.emoji}</span>`;
    btn.innerHTML = `
      ${iconHtml}
      <span class="cat-label">${cat.label}</span>
      <span class="cat-count">${count}</span>`;
    btn.addEventListener('click', () => selectCategory(cat.id));
    container.appendChild(btn);
  });
}

function selectCategory(id) {
  activeCategory = id;
  document.querySelectorAll('.category-btn')
    .forEach(b => b.classList.toggle('active', b.dataset.category === id));
  filterMarkers();
  closePanel();
}

// ── Marcadores ─────────────────────────────────────────────────
function addMarkers() {
  placesData.places.forEach(place => {
    const cat = placesData.categories.find(c => c.id === place.category);
    if (!cat) return;

    const icon = place.iconUrl
      ? L.icon({
          iconUrl: place.iconUrl,
          iconSize: [60, 60],
          iconAnchor: [30, 60],
          popupAnchor: [0, -60],
        })
      : place.hotelPin
      ? L.divIcon({
          html: `<div class="hotel-pin" title="${place.name}">⭐</div>`,
          className: '',
          iconSize: [48, 48],
          iconAnchor: [24, 24],
        })
      : L.divIcon({
          html: `<div class="place-pin" style="--pin-color:${cat.color}">
                   <span class="pin-emoji">${place.pinEmoji || cat.emoji}</span>
                 </div>`,
          className: '',
          iconSize: [36, 44],
          iconAnchor: [18, 44],
        });

    const marker = L.marker([place.lat, place.lng], {
      icon,
      zIndexOffset: place.alwaysVisible ? 1000 : 0,
    }).on('click', () => showDetail(place));

    marker.addTo(map);
    markerLayer[place.id] = { marker, place, cat };
  });
}

function filterMarkers() {
  if (activeZona === 'tours') {
    const routeIds = activeTour
      ? new Set(placesData.places.find(p => p.id === activeTour)?.ruta || [])
      : null;

    Object.values(markerLayer).forEach(({ marker, place }) => {
      const show = routeIds
        ? routeIds.has(place.id)
        : place.zona === 'tours';
      if (show) marker.addTo(map); else marker.remove();
    });
    return;
  }

  const term = document.getElementById('search-input').value.toLowerCase().trim();

  Object.values(markerLayer).forEach(({ marker, place }) => {
    const matchZona = (place.zona || 'miraflores') === activeZona;
    const matchCat  = activeCategory === 'all' || place.category === activeCategory;
    const matchText = !term
      || place.name.toLowerCase().includes(term)
      || (place.description || '').toLowerCase().includes(term)
      || (place.address || '').toLowerCase().includes(term);

    if (matchZona && (place.alwaysVisible || (matchCat && matchText))) {
      marker.addTo(map);
    } else {
      marker.remove();
    }
  });
}

// ── Panel de detalle ───────────────────────────────────────────
function showDetail(place) {
  const cat   = placesData.categories.find(c => c.id === place.category);
  const dist  = haversine(
    placesData.hotel.lat, placesData.hotel.lng,
    place.lat, place.lng
  );
  const walk  = Math.max(1, Math.round(dist / 80));   // ~80 m/min caminando
  const distTxt = dist < 1000
    ? `${dist} m`
    : `${(dist / 1000).toFixed(1)} km`;

  const stars = buildStars(place.rating);
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${placesData.hotel.lat},${placesData.hotel.lng}&destination=${place.lat},${place.lng}&travelmode=walking`;

  const c2 = cat.colorAlt || cat.color + 'AA';
  let photoHtml;
  if (place.fotos && place.fotos.length > 0) {
    const slots = place.fotos.map((f, i) => f
      ? `<div class="gallery-slot"><img src="${f}" alt="foto ${i + 1}"></div>`
      : `<div class="gallery-slot gallery-slot--placeholder" style="background:linear-gradient(135deg,${cat.color} 0%,${c2} 100%)">
           <span>${place.pinEmoji || cat.emoji}</span>
         </div>`
    ).join('');
    photoHtml = `<div class="panel-gallery">${slots}</div>`;
  } else {
    photoHtml = place.foto
      ? `<div class="panel-photo"><img src="${place.foto}" alt="${place.name}"></div>`
      : `<div class="panel-photo panel-photo--placeholder" style="background:linear-gradient(135deg,${cat.color} 0%,${c2} 100%)">
           <span class="panel-photo-emoji">${place.pinEmoji || cat.emoji}</span>
         </div>`;
  }

  document.getElementById('panel-content').innerHTML = `
    ${photoHtml}
    <div class="panel-name">${place.name}</div>
    <div class="panel-meta">
      <span class="panel-badge" style="background:${cat.color}">${cat.emoji} ${cat.label}</span>
      <span class="panel-distance">🚶 ${distTxt} · ~${walk} min</span>
      ${stars ? `<span class="panel-rating">${stars} ${place.rating}</span>` : ''}
    </div>
    ${place.address  ? `<div class="panel-row">📍 <span>${place.address}</span></div>`  : ''}
    ${place.hours    ? `<div class="panel-row">🕐 <span>${place.hours}</span></div>`    : ''}
    ${place.normativa ? `<div class="panel-row panel-normativa">⚖️ <span>${place.normativa}</span></div>` : ''}
    ${place.description ? `<p class="panel-desc">${place.description}</p>` : ''}
    ${place.tip ? `
      <div class="panel-tip">
        <div class="tip-label">💬 Consejo del Recepcionista</div>
        <div class="tip-text">${place.tip}</div>
      </div>` : ''}
    ${place.incluye && place.incluye.length ? `
      <div class="panel-incluye">
        <div class="incluye-label">✅ Incluye</div>
        <ul class="incluye-list">
          ${place.incluye.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>` : ''}
    ${place.nota ? `<div class="panel-nota">* ${place.nota}</div>` : ''}
    <div class="panel-actions">
      <a href="${mapsUrl}" target="_blank" rel="noopener" class="btn-maps">
        🚶 Cómo llegar
      </a>
    </div>`;

  const panel   = document.getElementById('detail-panel');
  const overlay = document.getElementById('overlay');

  panel.classList.remove('hidden');
  overlay.classList.remove('hidden');

  // Doble rAF para activar la transición CSS después de remove('hidden')
  requestAnimationFrame(() =>
    requestAnimationFrame(() => panel.classList.add('visible'))
  );

  map.panTo([place.lat, place.lng], { animate: true, duration: 0.5 });
}

function closePanel() {
  const panel   = document.getElementById('detail-panel');
  const overlay = document.getElementById('overlay');
  panel.classList.remove('visible');
  overlay.classList.add('hidden');
  setTimeout(() => panel.classList.add('hidden'), 320);
}

// ── Tours ──────────────────────────────────────────────────────
function selectTour(id) {
  activeTour = activeTour === id ? null : id;

  document.querySelectorAll('.tour-btn')
    .forEach(b => b.classList.toggle('active', +b.dataset.tourId === activeTour));

  filterMarkers();

  if (activeTour) {
    const tour = placesData.places.find(p => p.id === activeTour);
    if (tour?.ruta?.length) {
      const waypoints = tour.ruta
        .map(rid => placesData.places.find(p => p.id === rid))
        .filter(Boolean);
      const bounds = L.latLngBounds(waypoints.map(p => [p.lat, p.lng]));
      map.flyToBounds(bounds, { padding: [50, 50], animate: true, duration: 1.2 });
    }
    showDetail(tour);
  } else {
    map.flyTo([-12.0800, -77.0300], 12, { animate: true, duration: 1.0 });
    closePanel();
  }
}

// ── Zonas ──────────────────────────────────────────────────────
function switchZona(zona) {
  activeZona     = zona;
  activeCategory = 'all';
  activeTour     = null;

  document.querySelectorAll('.zona-tab')
    .forEach(t => t.classList.toggle('active', t.dataset.zona === zona));

  document.querySelectorAll('.category-btn')
    .forEach(b => b.classList.toggle('active', b.dataset.category === 'all'));

  const centers = {
    miraflores: { latlng: [-12.1219, -77.0282], zoom: 15 },
    centro:     { latlng: [-12.0464, -77.0328], zoom: 15 },
    tours:      { latlng: [-12.0800, -77.0300], zoom: 12 },
  };
  const c = centers[zona];
  map.flyTo(c.latlng, c.zoom, { animate: true, duration: 1.2 });

  buildSidebar();
  filterMarkers();
  closePanel();
}

// ── Eventos ────────────────────────────────────────────────────
function bindEvents() {
  document.getElementById('lang-toggle').addEventListener('click', toggleLang);

  document.querySelectorAll('.zona-tab')
    .forEach(t => t.addEventListener('click', () => switchZona(t.dataset.zona)));

  document.querySelector('[data-category="all"]').addEventListener('click', () => selectCategory('all'));

  document.getElementById('panel-close').addEventListener('click', closePanel);
  document.getElementById('overlay').addEventListener('click', closePanel);
  map.on('click', closePanel);

  const input = document.getElementById('search-input');
  const clear = document.getElementById('search-clear');

  input.addEventListener('input', () => {
    const hasVal = input.value.length > 0;
    clear.classList.toggle('hidden', !hasVal);

    // Al buscar, muestra todos los marcadores (ignora filtro de categoría)
    if (hasVal && activeCategory !== 'all') {
      activeCategory = 'all';
      document.querySelectorAll('.category-btn')
        .forEach(b => b.classList.toggle('active', b.dataset.category === 'all'));
    }

    filterMarkers();
  });

  clear.addEventListener('click', () => {
    input.value = '';
    clear.classList.add('hidden');
    filterMarkers();
    input.focus();
  });
}

// ── Utilidades ─────────────────────────────────────────────────
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = x => x * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2
          + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function buildStars(rating) {
  if (!rating) return '';
  const full  = Math.round(rating);
  const empty = 5 - full;
  return '★'.repeat(full) + '☆'.repeat(empty);
}

function hideLoading() {
  const el = document.getElementById('loading');
  el.style.opacity = '0';
  el.style.pointerEvents = 'none';
  setTimeout(() => el.style.display = 'none', 400);
}

// ── Arranque ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
