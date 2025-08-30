#!/bin/bash
# Novaxe 18 Official Staging Server
# millionsongmind.com/Novaxe18

echo "🚀 Starting Novaxe 18 Official Staging Server"
echo "============================================="
echo ""
echo "🌐 Staging URL: http://localhost:8018/Novaxe18/"
echo "🎯 Production Target: millionsongmind.com/Novaxe18"
echo ""
echo "✅ Magic 18 Comprehensive Solution Deployed"
echo "✅ Intelligent SVG Error Handling Active"
echo "✅ Multiple Asset Path Fallbacks Configured"
echo ""
echo "Press Ctrl+C to stop server"
echo "============================================="

cd "$(dirname "$0")"

# Start Python HTTP server
if command -v python3 &> /dev/null; then
    python3 -m http.server 8018
elif command -v python &> /dev/null; then
    python -m SimpleHTTPServer 8018
else
    echo "❌ Python not found. Please install Python to run the staging server."
    exit 1
fi
