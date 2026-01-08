import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AccessibilityProvider } from './context/AccessibilityContext.tsx'
import { CommunicationProvider } from './context/CommunicationContext.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AccessibilityProvider>
      <CommunicationProvider>
        <App />
      </CommunicationProvider>
    </AccessibilityProvider>
  </React.StrictMode>,
)
