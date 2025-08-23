#!/bin/bash

# Quick Bridge Test Script
# Tests MSM → Novaxe communication in under 5 minutes

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}         QUICK BRIDGE TEST${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "apps" ]; then
    echo -e "${RED}❌ Not in monorepo root. Please run from novaxe-oracle directory.${NC}"
    exit 1
fi

echo -e "${YELLOW}🎯 Quick test of MSM → Novaxe bridge pattern...${NC}"
echo ""

# Create test HTML file for immediate testing
echo -e "${BLUE}1. Creating test HTML file...${NC}"
cat > test-bridge.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>MSM-Novaxe Bridge Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .container { display: flex; gap: 20px; }
        .panel { flex: 1; border: 2px solid #ccc; padding: 20px; border-radius: 8px; }
        .msm { border-color: #61dafb; }
        .novaxe { border-color: #007acc; }
        button { padding: 10px 20px; margin: 10px 0; background: #007acc; color: white; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background: #005a9e; }
        .received { background: #e8f5e8; padding: 10px; margin: 10px 0; border-radius: 4px; }
        .waiting { color: #666; font-style: italic; }
    </style>
</head>
<body>
    <h1>🎵 MSM-Novaxe Bridge Test</h1>
    <p>This simulates the bridge communication between MSM and Novaxe apps.</p>
    
    <div class="container">
        <div class="panel msm">
            <h2>🎼 MSM Side (React/Vite)</h2>
            <button onclick="sendTestChord()">Send Test Chord to Novaxe</button>
            <div id="msm-status">Ready to send chord...</div>
        </div>
        
        <div class="panel novaxe">
            <h2>🎹 Novaxe Side (Angular)</h2>
            <div id="novaxe-status" class="waiting">Waiting for chord from MSM...</div>
            <div id="novaxe-received"></div>
        </div>
    </div>

    <script>
        // Simulate MSM bridge
        function sendTestChord() {
            const testChord = {
                key: "C",
                chords: ["C", "G", "Am", "F"],
                progression: "I-V-vi-IV",
                timestamp: Date.now()
            };
            
            const message = {
                type: 'CHORD_UPDATE',
                source: 'msm',
                payload: testChord,
                timestamp: Date.now()
            };
            
            console.log('MSM → Novaxe:', message);
            
            // Simulate PostMessage
            window.postMessage(message, '*');
            
            // Update MSM status
            document.getElementById('msm-status').innerHTML = 
                `<div class="received">
                    <strong>Sent:</strong> ${testChord.key} - ${testChord.chords.join(', ')}<br>
                    <small>Time: ${new Date().toLocaleTimeString()}</small>
                </div>`;
        }
        
        // Simulate Novaxe bridge
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'CHORD_UPDATE') {
                console.log('Novaxe ← MSM:', event.data);
                
                const chordData = event.data.payload;
                const receivedDiv = document.getElementById('novaxe-received');
                const statusDiv = document.getElementById('novaxe-status');
                
                receivedDiv.innerHTML = `
                    <div class="received">
                        <strong>Received from MSM:</strong><br>
                        Key: ${chordData.key}<br>
                        Chords: ${chordData.chords.join(', ')}<br>
                        Progression: ${chordData.progression}<br>
                        <small>Time: ${new Date(chordData.timestamp).toLocaleTimeString()}</small>
                    </div>
                `;
                
                statusDiv.innerHTML = `<strong>✅ Bridge working!</strong> Received chord at ${new Date().toLocaleTimeString()}`;
                statusDiv.className = '';
                
                // Simulate Novaxe processing
                console.log('🎵 Processing MSM chord in Novaxe:', chordData);
            }
        });
        
        console.log('🎯 Bridge test page loaded');
        console.log('📋 Click "Send Test Chord" to test MSM → Novaxe communication');
    </script>
</body>
</html>
EOF

echo -e "${GREEN}✓ Test HTML file created${NC}"
echo ""

# Open the test file
echo -e "${BLUE}2. Opening test in browser...${NC}"
if command -v open >/dev/null 2>&1; then
    open test-bridge.html
    echo -e "${GREEN}✓ Test page opened in browser${NC}"
else
    echo -e "${YELLOW}⚠ Please open test-bridge.html in your browser manually${NC}"
fi
echo ""

# Instructions
echo -e "${BLUE}3. Testing instructions:${NC}"
echo ""
echo -e "${YELLOW}📋 In the browser:${NC}"
echo "1. Click 'Send Test Chord to Novaxe' button"
echo "2. Watch the 'Novaxe Side' panel update"
echo "3. Check browser console for bridge logs"
echo ""
echo -e "${YELLOW}✅ Success indicators:${NC}"
echo "- MSM panel shows sent chord"
echo "- Novaxe panel shows received chord"
echo "- Console shows bridge messages"
echo "- Status shows 'Bridge working!'"
echo ""

# Cleanup instructions
echo -e "${BLUE}4. After testing:${NC}"
echo ""
echo -e "${YELLOW}🧹 Clean up:${NC}"
echo "rm test-bridge.html"
echo ""
echo -e "${YELLOW}🚀 Next steps:${NC}"
echo "1. If test works, copy snippets to your real apps"
echo "2. Test with actual MSM and Novaxe apps"
echo "3. Proceed with Phase 1 integration"
echo ""

echo -e "${GREEN}🎉 Bridge test ready! Open test-bridge.html in your browser.${NC}" 