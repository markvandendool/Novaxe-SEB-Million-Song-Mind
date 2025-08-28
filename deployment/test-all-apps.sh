#!/bin/bash

echo "🧪 Testing All Applications - Million Song Mind Deployment"
echo "=========================================================="

cd /Users/markvandendool/Novaxe-SEB-Million-Song-Mind/deployment/production-ready-final

# Kill any existing servers
pkill -f "python.*8080" 2>/dev/null

# Start the server
echo "🚀 Starting server on port 8080..."
python3 -m http.server 8080 &
SERVER_PID=$!
sleep 3

echo "📊 Testing all routes..."

# Test main page
echo "Testing main page (Unity Landing)..."
if curl -f -s "http://localhost:8080/" > /dev/null; then
    echo "✅ Main page: OK"
else
    echo "❌ Main page: FAILED"
fi

# Test cubes
echo "Testing cubes page..."
if curl -f -s "http://localhost:8080/cubes/" > /dev/null; then
    echo "✅ Cubes page: OK"
    # Test cubes assets
    if curl -f -s "http://localhost:8080/cubes/main.js" > /dev/null; then
        echo "✅ Cubes JS: OK"
    else
        echo "❌ Cubes JS: FAILED"
    fi
else
    echo "❌ Cubes page: FAILED"
fi

# Test analytics (MSM)
echo "Testing analytics page..."
if curl -f -s "http://localhost:8080/analytics/" > /dev/null; then
    echo "✅ Analytics page: OK"
    # Test analytics assets
    if curl -f -s "http://localhost:8080/analytics/assets/index-BppLUvM-.css" > /dev/null; then
        echo "✅ Analytics CSS: OK"
    else
        echo "❌ Analytics CSS: FAILED"
    fi
    if curl -f -s "http://localhost:8080/analytics/assets/index-45y_oU3k.js" > /dev/null; then
        echo "✅ Analytics JS: OK"
    else
        echo "❌ Analytics JS: FAILED"
    fi
else
    echo "❌ Analytics page: FAILED"
fi

# Test obsidian
echo "Testing obsidian page..."
if curl -f -s "http://localhost:8080/obsidian/" > /dev/null; then
    echo "✅ Obsidian page: OK"
else
    echo "❌ Obsidian page: FAILED"
fi

# Test fonts
echo "Testing fonts..."
if curl -f -s "http://localhost:8080/fonts/NVX%20Diamond%20Font.otf" > /dev/null; then
    echo "✅ Diamond Font: OK"
else
    echo "❌ Diamond Font: FAILED"
fi

echo ""
echo "🌐 Open these URLs to verify:"
echo "Main: http://localhost:8080/"
echo "Cubes: http://localhost:8080/cubes/"
echo "Analytics: http://localhost:8080/analytics/"
echo "Obsidian: http://localhost:8080/obsidian/"

echo ""
echo "Server running on PID: $SERVER_PID"
echo "To stop: kill $SERVER_PID"
