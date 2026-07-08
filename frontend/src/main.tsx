import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const container = document.getElementById('react-address-picker-root') || document.getElementById('root');

createRoot(container!).render(
  <StrictMode>
    <App isIntegrated={!!document.getElementById('react-address-picker-root')} />
  </StrictMode>,
)
