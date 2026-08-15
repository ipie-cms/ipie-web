// Everything that depends on runtime configuration, imported only after it has loaded.
//
// This file exists because of import order, not tidiness. `lib/axios.ts` builds its clients at
// module scope from the configured endpoints, so importing it before /config.json has been fetched
// would capture the values that did not exist yet. main.tsx imports this module dynamically once
// loadRuntimeConfig() resolves, which is what guarantees the ordering.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'

import './index.css'
import App from './App.tsx'
import { store } from '@/app/store'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
