import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/nvx-font-exact.css' // EXACT Angular font system with ligatures
import './styles/braid-angular-exact.css' // Use exact Angular font system
import './styles/braid-fonts.css' // Additional braid font styles

// Temporarily disabled Agent Check-In System
// import AgentCheckInSystem from './utils/agentCheckIn.ts'

console.log('🤖 Million Song Mind starting...');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)