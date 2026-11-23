// Service Worker for battlecatsinfo.github.io
// Generated at build time with the deployment and database versions baked in.

const APP_VERSION = '{{{lookup (loadJSON "config.json") "db_ver"}}}';
const DEPLOYMENT_ID = '{{{buildVersion}}}';
const CACHE_NAME = `battlecatsinfo-v${DEPLOYMENT_ID}-${APP_VERSION}`;

// App shell: static assets that rarely change between deployments.
// These are precached on install for offline support.
//
// Note: HTML/JS/CSS pages are deliberately NOT precached —
// this site's real data lives in the IndexedDB, which is only seeded by the
// one-shot data files below.  A cached shell with no data would just render
// blank pages, so only these durable assets are worth caching.
const PRECACHE_URLS = [
	'/manifest.json',
	'/favicon.ico',
	'/favicon-16x16.png',
	'/favicon-32x32.png',
	'/android-chrome-192x192.png',
	'/apple-touch-icon.png',
];

// One-shot data files: fetched only to build the IndexedDB, never needed
// again.  Keep them out of the cache entirely (network-only pass-through).
const DATA_FILE_NAMES = new Set([
	'cat.json',
	'combos.json',
	'combos_scheme.json',
	'enemy.json',
	'map.json',
	'rewards.json',
	'stage.json',
	'stage_scheme.json',
	'tcat.json',
	'tcombo.json',
	'tenemy.json',
	'titem.json',
	'tmedal.json',
	'tstage.json',
	'tterm.json',
	'units_scheme.json',
]);

// Pinned CDN libraries the pages depend on.  Their contents are immutable
// (version-pinned URLs), so it is safe to cache them with the same
// cache-first strategy as the app's own assets — this also lets
// crown/materials/stage_difficulty/dpsgraph pages work offline.
const CDN_LIBRARY_PATTERNS = [
	/^https:\/\/code\.jquery\.com\/jquery-3\.7\.0\.min\.js$/,
	/^https:\/\/cdn\.datatables\.net\//,
	/^https:\/\/cdn\.canvasjs\.com\/canvasjs\.min\.js$/,
	/^https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/pdfmake\//,
	/^https:\/\/cdn\.jsdelivr\.net\/npm\/d3@7\//,
];

// ----- Install -----
// Precache the app shell so the site works offline immediately.
self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(PRECACHE_URLS);
		}).then(() => {
			// Activate the new service worker immediately without waiting for
			// all tabs to close.
			return self.skipWaiting();
		}),
	);
});

// ----- Activate -----
// Delete old caches from previous versions.
self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((keys) => {
			return Promise.all(
				keys
					.filter((key) => key.startsWith('battlecatsinfo-') && key !== CACHE_NAME)
					.map((key) => caches.delete(key)),
			);
		}).then(() => {
			// Take control of all open tabs immediately so this version's
			// fetch handler is used right away.
			return self.clients.claim();
		}),
	);
});

// ----- Fetch -----
// Strategy: Cache-First for (a) the site's own static files and
// (b) version-pinned CDN libraries; Network-Only for everything else.
//
// Cacheable requests go through this flow:
//   1. Look up the request in the cache.
//   2. If found → return the cached response (no network hit).
//   3. If not found → fetch from the network, cache a copy, then return it.
//
// When a new version is deployed the APP_VERSION / CACHE_NAME changes,
// so the install event precaches the latest app shell into a fresh cache,
// and the activate event deletes the old one.  This guarantees all
// clients eventually pick up the new files without any extra "revalidation"
// traffic on every request.

// Decide whether a request should go through the cache.  Everything not
// matched here is passed straight to the network (cross-origin APIs,
// external images, fonts, …).
function shouldCache(url) {
	// Game sprite images (hosted in a separate repo, too large to cache).
	if (url.origin === self.location.origin) {
		if (url.pathname.startsWith('/img/u/') ||
			url.pathname.startsWith('/img/e/') ||
			url.pathname.startsWith('/img/m/'))
			return false;

		// One-shot data files: fetched once to build the IndexedDB, never
		// needed again.
		const base = url.pathname.split('/').pop() || '';
		if (DATA_FILE_NAMES.has(base) || base.endsWith('_scheme.json'))
			return false;

		return true;
	}

	// Cross-origin: only the pinned CDN libraries listed above.
	return CDN_LIBRARY_PATTERNS.some((re) => re.test(url.href));
}

self.addEventListener('fetch', (event) => {
	// Only handle GET requests.
	if (event.request.method !== 'GET') return;

	const url = new URL(event.request.url);
	if (!shouldCache(url)) return;

	event.respondWith(
		caches.open(CACHE_NAME).then((cache) => {
			// Strip query string — it has no effect on these static
			// responses, so normalise the URL to avoid duplicate cache entries.
			const cacheUrl = new URL(event.request.url);
			cacheUrl.search = '';
			const cacheKey = new Request(cacheUrl);

			return cache.match(cacheKey).then((cachedResponse) => {
				if (cachedResponse) {
					return cachedResponse;
				}

				return fetch(event.request).then((networkResponse) => {
					// Only cache successful responses.
					if (networkResponse.ok) {
						cache.put(cacheKey, networkResponse.clone());
					}
					return networkResponse;
				});
			});
		}),
	);
});
