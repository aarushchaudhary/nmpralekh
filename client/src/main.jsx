import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'
import { reportError, reportApiError } from './hooks/useErrorReporter'

// Global error handlers for uncaught errors and rejections
window.addEventListener('error', (event) => {
  reportError(event.error, {
    extra: { errorEventType: 'window.onerror' }
  })
})

window.addEventListener('unhandledrejection', (event) => {
  reportError(event.reason, {
    extra: { errorEventType: 'unhandledrejection' }
  })
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
