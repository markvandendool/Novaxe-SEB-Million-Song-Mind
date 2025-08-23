#!/bin/bash

# FAST WORKFLOW SCRIPT - Million Song Mind Debug
# Usage: ./fast-debug.sh [route]

ROUTE=${1:-live}
BASE_URL="http://localhost:8080"

echo "🚀 FAST DEBUG WORKFLOW"
echo "======================="
echo "Testing route: /$ROUTE"
echo "Full URL: $BASE_URL/$ROUTE"
echo ""

# Check if server is running
if ! curl -s "$BASE_URL" >/dev/null; then
    echo "❌ Server not running on port 8080!"
    echo "Starting dev server..."
    cd /Users/markvandendool/Novaxe-SEB-Million-Song-Mind/apps/million-song-mind
    npm run dev &
    sleep 5
fi

# Test the route
echo "📡 Testing route response..."
RESPONSE=$(curl -s -w "HTTP_STATUS:%{http_code}" "$BASE_URL/$ROUTE")
HTTP_STATUS=$(echo "$RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
CONTENT=$(echo "$RESPONSE" | sed 's/HTTP_STATUS:[0-9]*$//')

echo "Status: $HTTP_STATUS"
if [[ $HTTP_STATUS == "200" ]]; then
    echo "✅ Route is working!"
    if [[ "$CONTENT" == *"LIVE TEST"* ]]; then
        echo "✅ Live test page detected!"
    elif [[ "$CONTENT" == *"DEBUG ROUTE"* ]]; then
        echo "✅ Debug route detected!"
    else
        echo "⚠️  Route returns content but may not be expected page"
    fi
else
    echo "❌ Route returned status $HTTP_STATUS"
fi

echo ""
echo "🌐 Opening in browsers..."
open -a "Google Chrome" "$BASE_URL/$ROUTE"
echo "✅ Chrome opened"

echo ""
echo "⚡ INSTANT EDIT COMMANDS:"
echo "Edit live test: code /Users/markvandendool/Novaxe-SEB-Million-Song-Mind/apps/million-song-mind/src/pages/LiveTest.tsx"
echo "Edit main page: code /Users/markvandendool/Novaxe-SEB-Million-Song-Mind/apps/million-song-mind/src/pages/MillionSongMind.tsx"
echo "Edit routes: code /Users/markvandendool/Novaxe-SEB-Million-Song-Mind/apps/million-song-mind/src/App.tsx"
echo ""
echo "🔄 Quick test: curl -s $BASE_URL/$ROUTE | grep -i 'test\\|debug\\|million'"
