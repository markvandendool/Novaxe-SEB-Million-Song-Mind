import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.info('[App] Bootstrapping...');
const rootEl = document.getElementById("root");
if (!rootEl) {
  console.error('[App] Root element not found');
} else {
  createRoot(rootEl).render(<App />);
}
