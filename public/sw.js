/// Service Worker for দৈনিক রমজান ট্র্যাকার (Offline PWA)

const CACHE_VERSION = "v1";
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;

// Core assets to pre-cache on install
const PRE_CACHE_URLS = ["/", "/favicon.ico"];

// ── Install ──
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRE_CACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: clean old caches ──
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== STATIC_CACHE && k !== DYNAMIC_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ── Fetch strategy ──
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip cross-origin requests that aren't fonts/CDN assets we want to cache
  if (url.origin !== self.location.origin) {
    // Cache cross-origin font files and CDN assets
    if (
      url.hostname.includes("fonts.googleapis.com") ||
      url.hostname.includes("fonts.gstatic.com")
    ) {
      event.respondWith(cacheFirst(request));
      return;
    }
    return;
  }

  // Navigation requests (HTML pages): network first, fall back to cache
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets (JS, CSS, images, fonts): cache first
  event.respondWith(cacheFirst(request));
});

// ── Cache-first strategy ──
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Return a basic offline fallback for images
    if (request.destination === "image") {
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><text y="18" font-size="18">🌙</text></svg>',
        { headers: { "Content-Type": "image/svg+xml" } }
      );
    }
    return new Response("Offline", { status: 503 });
  }
}

// ── Network-first strategy (for HTML navigation) ──
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    // Fall back to cached root page for any navigation
    const fallback = await caches.match("/");
    if (fallback) return fallback;

    return new Response(
      `<!DOCTYPE html>
<html lang="bn">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>অফলাইন — রমজান ট্র্যাকার</title>
<style>
  body{background:#0b1120;color:#e2e8f0;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;font-family:system-ui,sans-serif;text-align:center}
  .c{max-width:320px}.e{font-size:3rem;margin-bottom:1rem}h1{font-size:1.25rem;margin:0 0 .5rem}p{color:#94a3b8;font-size:.875rem;margin:0}
</style>
</head>
<body><div class="c"><div class="e">🌙</div><h1>আপনি অফলাইনে আছেন</h1><p>ইন্টারনেট সংযোগ পুনরায় চালু করে পেজটি রিলোড করুন।</p></div></body>
</html>`,
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
}
