import React from 'react';
import BraidTonal from '@/components/braid/BraidTonal';

export default function IntegrationTestSimpleClean() {
    return (
        <div style={{
            padding: '20px',
            backgroundColor: '#1a1a2e',
            color: 'white',
            minHeight: '100vh',
            fontFamily: 'Arial, sans-serif'
        }}>
            <h1 style={{
                textAlign: 'center',
                marginBottom: '30px',
                color: '#769987'
            }}>
                🎵 Classic Tonality Braid - Clean Lovable Version
            </h1>

            <div style={{
                border: '2px solid #769987',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: '#16213e',
                height: '80vh',
                overflow: 'auto'
            }}>
                <BraidTonal />
            </div>

            <div style={{
                marginTop: '20px',
                textAlign: 'center',
                opacity: 0.7,
                fontSize: '14px'
            }}>
                ✅ Using clean Lovable BraidTonal component (16K) instead of over-engineered version (28K)
            </div>
        </div>
    );
}
