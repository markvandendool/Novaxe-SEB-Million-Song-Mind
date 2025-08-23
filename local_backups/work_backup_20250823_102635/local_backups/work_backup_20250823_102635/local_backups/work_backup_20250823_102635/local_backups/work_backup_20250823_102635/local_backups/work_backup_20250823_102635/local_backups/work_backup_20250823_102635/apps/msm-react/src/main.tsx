import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Temporarily disabled Agent Check-In System
// import AgentCheckInSystem from './utils/agentCheckIn.ts'

console.log('🤖 Million Song Mind starting...');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)