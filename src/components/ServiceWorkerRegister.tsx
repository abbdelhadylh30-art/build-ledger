'use client'

import { useEffect } from 'react'

/**
 * Registers the service worker for PWA support.
 * Only runs in production (or any non-dev build) — in dev, SW caching
 * interferes with hot reload, so we skip it.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return
    // Skip in dev to avoid breaking HMR
    if (process.env.NODE_ENV === 'development') return

    const register = () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          console.log('[pwa] service worker registered', reg.scope)
        })
        .catch((err) => {
          console.warn('[pwa] service worker registration failed:', err)
        })
    }

    if (document.readyState === 'complete') {
      register()
    } else {
      window.addEventListener('load', register)
      return () => window.removeEventListener('load', register)
    }
  }, [])

  return null
}
