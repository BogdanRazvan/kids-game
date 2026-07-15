// Offline-first service worker.
//
// Bump CACHE whenever the caching rules change: every older cache is deleted on
// activate, which also flushes anything stale a previous version pinned.
const CACHE = 'joaca-v2'

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (e) =>
  e.waitUntil(
    (async () => {
      // Drop every previous cache. v1 cached audio under a name derived from the
      // spoken TEXT, so a re-recorded word kept serving the old voice forever.
      const names = await caches.keys()
      await Promise.all(names.filter((n) => n !== CACHE).map((n) => caches.delete(n)))
      await self.clients.claim()
    })()
  )
)

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return

  // The app shell must never lag behind a deploy: network first, falling back to
  // the cache only when offline. Everything else (JS/CSS/audio) is content
  // hashed, so a cache hit is always the right bytes.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(req, copy))
          return res
        })
        .catch(async () => (await caches.match(req)) || caches.match('./index.html'))
    )
    return
  }

  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(req)
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            cache.put(req, res.clone())
          }
          return res
        })
        .catch(() => cached)
      return cached || network
    })
  )
})
