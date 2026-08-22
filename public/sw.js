// Service worker for Build Ledger PWA
// Strategy:
//   - App shell (precached on install)
//   - Static assets (_next/static): cache-first
//   - HTML navigations: network-first, fallback to cached shell
//   - Everything else: stale-while-revalidate

const VERSION = 'v1'
const SHELL_CACHE = `build-ledger-shell-${VERSION}`
const RUNTIME_CACHE = `build-ledger-runtime-${VERSION}`

const APP_SHELL = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
  '/favicon.ico',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE)
      // Use addAll but ignore failures for individual assets
      await Promise.allSettled(APP_SHELL.map((url) => cache.add(url)))
      self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys
          .filter((k) => k !== SHELL_CACHE && k !== RUNTIME_CACHE)
          .map((k) => caches.delete(k)),
      )
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle same-origin GET requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  // Skip Next.js dev-only HMR endpoints
  if (url.pathname.startsWith('/_next/webpack-hmr')) return

  // HTML navigations: network-first
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request)
          const cache = await caches.open(SHELL_CACHE)
          cache.put('/', fresh.clone())
          return fresh
        } catch {
          const cache = await caches.open(SHELL_CACHE)
          return (await cache.match('/')) || (await cache.match(request)) || Response.error()
        }
      })(),
    )
    return
  }

  // Static assets: stale-while-revalidate
  event.respondWith(
    (async () => {
      const cache = await caches.open(RUNTIME_CACHE)
      const cached = await cache.match(request)
      const networkPromise = fetch(request)
        .then((response) => {
          if (response.ok) cache.put(request, response.clone())
          return response
        })
        .catch(() => null)
      return cached || (await networkPromise) || Response.error()
    })(),
  )
})
