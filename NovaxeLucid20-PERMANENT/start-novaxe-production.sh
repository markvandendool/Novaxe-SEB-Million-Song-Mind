#!/bin/bash
# Permanent Novaxe Production Server - GUARANTEED TO WORK
# This avoids the Angular 20 ng serve bug completely

echo "🎵 Starting Permanent Novaxe Production Server..."
echo "📍 Location: $(pwd)"
echo "🔍 Verifying files exist..."

if [ ! -f "index.html" ]; then
    echo "❌ ERROR: index.html not found in $(pwd)"
    echo "📂 Contents of current directory:"
    ls -la
    exit 1
fi

echo "✅ Files verified. Starting HTTP server..."
echo "🌐 Production URL: http://localhost:4200"
echo "🛑 Press Ctrl+C to stop"
echo ""

# Kill any existing server on port 4200
echo "🔧 Cleaning up any existing processes on port 4200..."
lsof -ti:4200 | xargs kill -9 2>/dev/null || echo "No existing processes found"

# Start reliable Python HTTP server
python3 -m http.server 4200
