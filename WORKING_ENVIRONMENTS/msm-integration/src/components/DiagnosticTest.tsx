import React from 'react';

const DiagnosticTest = () => {
    console.log('DiagnosticTest component loaded');

    return (
        <div style={{
            padding: '20px',
            backgroundColor: '#1a1a2e',
            color: 'white',
            fontFamily: 'Arial, sans-serif',
            minHeight: '100vh'
        }}>
            <h1>🔧 Diagnostic Test - Basic React Working</h1>
            <p>If you see this, React routing and basic rendering works</p>

            <div style={{
                border: '2px solid #769987',
                padding: '20px',
                margin: '20px 0',
                borderRadius: '8px'
            }}>
                <h2>✅ Server Status: OK</h2>
                <p>Vite server is responding correctly</p>
                <p>React components can render</p>
                <p>Basic styling is working</p>
            </div>

            <div style={{
                marginTop: '20px',
                padding: '10px',
                backgroundColor: '#16213e',
                borderRadius: '4px'
            }}>
                <h3>Next Test: Try IntegrationTestSimple</h3>
                <a href="/integration-simple" style={{ color: '#769987', textDecoration: 'underline' }}>
                    → Go to Integration Test Simple
                </a>
            </div>
        </div>
    );
};

export default DiagnosticTest;
