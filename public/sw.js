/* eslint-disable no-restricted-globals */
const CACHE_VERSION = "v1";
const RUNTIME_CACHE = `runtime-${CACHE_VERSION}`;

const NAVIGATION_NETWORK_TIMEOUT_MS = 3000;

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => ![RUNTIME_CACHE].includes(name))
          .map((name) => caches.delete(name))
      );
      await self.clients.claim();
    })()
  );
});

/**
 * Strategy:
 * - Navigations: network-first with short timeout, then fallback to cache.
 * - Static assets (images, fonts, css, js): cache-first with stale-while-revalidate.
 */
self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const isNavigation = request.mode === "navigate";
  const isAsset =
    url.origin === self.location.origin &&
    /\.(?:js|css|png|jpg|jpeg|gif|webp|svg|ico|ttf|otf|woff2?)$/i.test(
      url.pathname
    );

  if (isNavigation) {
    event.respondWith(networkFirstWithTimeout(request, NAVIGATION_NETWORK_TIMEOUT_MS));
    return;
  }

  if (isAsset) {
    event.respondWith(cacheFirstWithRevalidate(request));
  }
});

async function networkFirstWithTimeout(request, timeoutMs) {
  const cache = await caches.open(RUNTIME_CACHE);
  const timeoutPromise = new Promise((resolve) =>
    setTimeout(async () => {
      const cached = await cache.match(request);
      if (cached) resolve(cached);
    }, timeoutMs)
  );

  try {
    const networkPromise = fetch(request);
    const response = await Promise.race([networkPromise, timeoutPromise]);
    if (response) {
      if (response instanceof Response) {
        cache.put(request, response.clone());
      }
      return response;
    }
    const cached = await cache.match(request);
    if (cached) return cached;
    return fetch(request);
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response("Offline", { status: 503, statusText: "Offline" });
  }
}

async function cacheFirstWithRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response && response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => undefined);
  return cached || fetchPromise || fetch(request);
}


