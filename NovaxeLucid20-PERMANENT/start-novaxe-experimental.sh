#!/bin/bash
# Permanent Novaxe Experimental Server - SAFE TO EXPERIMENT WITH
# This avoids the Angular 20 ng serve bug completely

echo "🧪 Starting Permanent Novaxe Experimental Server..."
echo "📍 Location: $(pwd)"
echo "🔍 Verifying files exist..."

if [ ! -f "index.html" ]; then
    echo "❌ ERROR: index.html not found in $(pwd)"
    echo "📂 Contents of current directory:"
    ls -la
    exit 1
fi

echo "✅ Files verified. Starting HTTP server..."
echo "🌐 Experimental URL: http://localhost:4201"
echo "🧪 SAFE FOR EXPERIMENTATION - Production version unaffected"
echo "🛑 Press Ctrl+C to stop"
echo ""

# Kill any existing server on port 4201
echo "🔧 Cleaning up any existing processes on port 4201..."
lsof -ti:4201 | xargs kill -9 2>/dev/null || echo "No existing processes found"

# Start reliable Python HTTP server
python3 -m http.server 4201
