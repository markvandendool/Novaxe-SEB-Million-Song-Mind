import React, { useState, useEffect } from 'react';

const LiveTest = () => {
  const [timestamp, setTimestamp] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimestamp(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    console.log('🔥 LIVE TEST CLICKED at', new Date().toISOString());
    alert('Live test working! Check console for details.');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      color: 'white',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '20px', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
        🚀 LIVE TEST PAGE 🚀
      </h1>

      <div style={{
        background: 'rgba(0,0,0,0.3)',
        padding: '30px',
        borderRadius: '15px',
        marginBottom: '20px',
        minWidth: '400px'
      }}>
        <p style={{ fontSize: '1.5rem', marginBottom: '15px' }}>
          ✅ React is rendering
        </p>
        <p style={{ fontSize: '1.5rem', marginBottom: '15px' }}>
          ✅ CSS styles are working
        </p>
        <p style={{ fontSize: '1.5rem', marginBottom: '15px' }}>
          ✅ Live reload timestamp: {new Date(timestamp).toLocaleTimeString()}
        </p>
      </div>

      <button
        onClick={handleClick}
        style={{
          background: '#ff4757',
          color: 'white',
          border: 'none',
          padding: '15px 30px',
          fontSize: '1.2rem',
          borderRadius: '8px',
          cursor: 'pointer',
          marginBottom: '20px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
        }}
        onMouseOver={(e) => (e.target as HTMLButtonElement).style.background = '#ff3742'}
        onMouseOut={(e) => (e.target as HTMLButtonElement).style.background = '#ff4757'}
      >
        🎯 CLICK TO TEST INTERACTIVITY
      </button>

      <div style={{
        background: 'rgba(255,255,255,0.1)',
        padding: '20px',
        borderRadius: '10px',
        maxWidth: '600px'
      }}>
        <h3 style={{ marginBottom: '15px' }}>Quick Debug Info:</h3>
        <p>• URL: {window.location.href}</p>
        <p>• User Agent: {navigator.userAgent.split(' ')[0]}</p>
        <p>• Screen: {window.screen.width}x{window.screen.height}</p>
        <p>• Viewport: {window.innerWidth}x{window.innerHeight}</p>
      </div>

      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: 'rgba(0,0,0,0.7)',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '0.9rem'
      }}>
        Last update: {new Date().toLocaleString()}
      </div>
    </div>
  );
};

export default LiveTest;
