import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

const TestSimple = () => {
    return (
        <div style={{
            padding: '20px',
            backgroundColor: '#1a1a2e',
            color: 'white',
            fontFamily: 'Arial, sans-serif'
        }}>
            <h1>🎵 TEST: Simple React Component Working</h1>
            <p>If you see this, React and Vite are working correctly</p>
            <div style={{
                border: '2px solid #769987',
                padding: '20px',
                marginTop: '20px',
                borderRadius: '8px'
            }}>
                <h2>✅ Success - Basic Setup Works</h2>
                <p>This proves the server and React are functional</p>
                <p>URL: <a href="/integration-simple" style={{ color: '#769987' }}>Go to Integration Test</a></p>
            </div>
        </div>
    )
}

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<TestSimple />} />
                <Route path="/test" element={<TestSimple />} />
                <Route path="*" element={<TestSimple />} />
            </Routes>
        </Router>
    )
}

export default App
