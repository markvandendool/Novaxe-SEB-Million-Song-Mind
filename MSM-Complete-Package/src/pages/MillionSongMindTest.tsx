import React from 'react';

const MillionSongMindTest = () => {
  console.log('🔥 EMERGENCY TEST COMPONENT LOADING');

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center'
    }}>
      <div style={{
        background: 'rgba(0,0,0,0.3)',
        padding: '50px',
        borderRadius: '20px',
        maxWidth: '600px'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '20px', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
          🎵 MILLION SONG MIND
        </h1>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '30px', color: '#ffd700' }}>
          🔥 EMERGENCY TEST MODE 🔥
        </h2>
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '15px' }}>✅ React is rendering</p>
          <p style={{ fontSize: '1.2rem', marginBottom: '15px' }}>✅ CSS is working</p>
          <p style={{ fontSize: '1.2rem', marginBottom: '15px' }}>✅ Component loaded successfully</p>
          <p style={{ fontSize: '1.2rem' }}>🕒 {new Date().toLocaleTimeString()}</p>
        </div>
        <p style={{ fontSize: '1rem', opacity: '0.8' }}>
          This test proves the app structure is working.<br />
          If you see this, the white screen issue is component-specific.
        </p>
      </div>
    </div>
  );
};

export default MillionSongMindTest;
