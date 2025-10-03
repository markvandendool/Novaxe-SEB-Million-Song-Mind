import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// import './styles/nvx-font-exact.css' // Temporarily disabled
// import './styles/braid-angular-exact.css' // Temporarily disabled  
// import './styles/braid-fonts.css' // Temporarily disabled

// Temporarily disabled Agent Check-In System
// import AgentCheckInSystem from './utils/agentCheckIn.ts'

console.log('🤖 Million Song Mind starting...');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)