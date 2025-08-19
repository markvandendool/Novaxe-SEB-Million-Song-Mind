import React, { useState } from 'react';

// Simple fallback components if shadcn/ui fails
const FallbackCard = ({ children, className }: any) => (
    <div style={{ border: '1px solid #ccc', padding: '16px', margin: '8px', borderRadius: '8px' }} className={className}>
        {children}
    </div>
);

const FallbackSelect = ({ value, onValueChange, children }: any) => (
    <select
        value={value}
        onChange={(e) => onValueChange?.(e.target.value)}
        style={{ padding: '8px', borderRadius: '4px', backgroundColor: '#333', color: 'white', border: '1px solid #555' }}
    >
        {children}
    </select>
);

const SimpleIntegrationTest = () => {
    console.log('SimpleIntegrationTest component loaded');

    const [selectedKey, setSelectedKey] = useState('C');
    const [zoom, setZoom] = useState(1.0);

    const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    return (
        <div style={{
            padding: '20px',
            backgroundColor: '#1a1a2e',
            color: 'white',
            fontFamily: 'Arial, sans-serif',
            minHeight: '100vh'
        }}>
            <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#769987' }}>
                🎵 Classic Tonality Braid - Simple Test
            </h1>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
            }}>
                {/* Key Selection */}
                <FallbackCard>
                    <h3 style={{ marginBottom: '15px' }}>🎼 Key Selection</h3>
                    <label style={{ display: 'block', marginBottom: '8px' }}>Current Key:</label>
                    <FallbackSelect value={selectedKey} onValueChange={setSelectedKey}>
                        {keys.map(key => (
                            <option key={key} value={key}>{key}</option>
                        ))}
                    </FallbackSelect>
                    <p style={{ marginTop: '10px', fontSize: '14px', opacity: 0.8 }}>
                        Selected: {selectedKey}
                    </p>
                </FallbackCard>

                {/* Zoom Control */}
                <FallbackCard>
                    <h3 style={{ marginBottom: '15px' }}>🔍 Zoom Control</h3>
                    <label style={{ display: 'block', marginBottom: '8px' }}>Zoom Level:</label>
                    <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        style={{ width: '100%', marginBottom: '8px' }}
                    />
                    <p style={{ fontSize: '14px', opacity: 0.8 }}>
                        Current: {zoom.toFixed(1)}x
                    </p>
                </FallbackCard>
            </div>

            {/* Braid Display Area */}
            <div style={{
                border: '2px solid #769987',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: '#16213e',
                height: '60vh',
                overflow: 'auto'
            }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Classic Tonality Braid</h2>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '80%',
                    fontSize: '18px',
                    opacity: 0.7
                }}>
                    <div>
                        <p>✅ Basic component loading works</p>
                        <p>🎼 Key: {selectedKey}</p>
                        <p>🔍 Zoom: {zoom.toFixed(1)}x</p>
                        <p style={{ marginTop: '20px', color: '#769987' }}>
                            Next step: Load actual BraidTonal component
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <a href="/integration-simple" style={{ color: '#769987', textDecoration: 'underline' }}>
                    → Try Full Integration Test
                </a>
            </div>
        </div>
    );
};

export default SimpleIntegrationTest;
