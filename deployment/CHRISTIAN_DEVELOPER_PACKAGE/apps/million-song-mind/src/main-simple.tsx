import React from 'react'
import ReactDOM from 'react-dom/client'

console.log('🚀 MSM React Loading...');

function SimpleApp() {
  return (
    <div>
      <h1 style={{color: '#3b82f6', fontSize: '4rem', fontWeight: 900, textAlign: 'center', marginTop: '2rem'}}>
        MILLION SONG MIND <span style={{color: '#2563eb'}}>V1.0</span>
      </h1>
      <h2 style={{color: '#374151', fontSize: '2rem', textAlign: 'center', marginTop: '2rem', letterSpacing: '0.2em'}}>
        HARMONIC PROFILE
      </h2>
      <p style={{textAlign: 'center', fontSize: '1.2rem', color: '#6b7280'}}>
        React app successfully mounted! 🎵
      </p>
    </div>
  );
}

console.log('🎯 About to mount React app...');

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<SimpleApp />);
  console.log('✅ React app mounted successfully');
} else {
  console.error('❌ Root element not found');
}
