// Entry point. Loads the runtime configuration, then the application.
//
// The bundle is built once and promoted unchanged through every environment (Development
// Environment Configuration, Section 45), so it cannot carry endpoints compiled into it. It reads
// them from /config.json, which the serving layer supplies per environment.
//
// Nothing that reads configuration may be imported statically here: Vite would hoist that import
// above the fetch, and the module would read values that had not arrived. The dynamic import below
// is load-bearing for that reason.
import { loadRuntimeConfig } from '@/lib/runtimeConfig'

loadRuntimeConfig()
  .then(() => import('./bootstrap.tsx'))
  .catch((error: unknown) => {
    // Fail visibly. A blank page sends someone hunting through application code for what is a
    // deployment problem, so say which file is wrong and stop.
    const message = error instanceof Error ? error.message : String(error)
    const root = document.getElementById('root')
    if (root) {
      root.textContent = `Configuration error: ${message}`
      root.setAttribute('style', 'padding:2rem;font-family:system-ui,sans-serif;color:#6B1A1A')
    }
    console.error('[ipie-web] runtime configuration failed to load', error)
  })
