import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import { bindServiceWorkerUpdater } from './utils/appUpdate'
import './index.css'

const updateSW = registerSW({
  immediate: true,
  onRegisteredSW(_swUrl, registration) {
    registration?.update()
  },
})
bindServiceWorkerUpdater(updateSW)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
