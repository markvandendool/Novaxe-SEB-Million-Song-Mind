#!/bin/bash
# Novaxe 18 Staging Deployment Verification
# millionsongmind.com/Novaxe18

echo "🔍 Novaxe 18 Staging Deployment Verification"
echo "============================================="

BASE_URL="http://localhost:8018/Novaxe18"
PASSED=0
TOTAL=0

function test_endpoint() {
    local name="$1"
    local url="$2"
    local expected_code="$3"
    
    TOTAL=$((TOTAL + 1))
    echo -n "Testing $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" = "$expected_code" ]; then
        echo "✅ OK ($response)"
        PASSED=$((PASSED + 1))
    else
        echo "❌ FAILED ($response)"
    fi
}

echo ""
echo "📋 Application Tests:"
test_endpoint "Main Application" "$BASE_URL/" "200"
test_endpoint "Novaxe18 Config" "$BASE_URL/novaxe18-config.js" "200"

echo ""
echo "🎵 Magic 18 Asset Tests:"
test_endpoint "Magic 18 Left SVG (Primary)" "$BASE_URL/assets/magic18-left.svg" "200"
test_endpoint "Magic 18 Right SVG (Primary)" "$BASE_URL/assets/magic18-right.svg" "200"
test_endpoint "Magic 18 Left SVG (Fallback)" "$BASE_URL/assets/Charts%20Magic18%20SVG_C%20Left.svg" "200"
test_endpoint "Magic 18 Right SVG (Fallback)" "$BASE_URL/assets/Charts%20Magic18%20SVG_C%20Right.svg" "200"

echo ""
echo "📊 Static Asset Tests:"
test_endpoint "Main CSS Bundle" "$BASE_URL/styles.css" "200"
test_endpoint "Main JS Bundle" "$BASE_URL/main.js" "200"

echo ""
echo "============================================="
echo "📈 Test Results: $PASSED/$TOTAL tests passed"

if [ $PASSED -eq $TOTAL ]; then
    echo "🎉 All tests PASSED! Deployment verified!"
    echo ""
    echo "🚀 Ready for millionsongmind.com/Novaxe18 deployment!"
    echo ""
    echo "Next steps:"
    echo "1. Copy staging files to production server"
    echo "2. Configure web server routing for /Novaxe18/"
    echo "3. Update DNS/load balancer if needed"
    echo "4. Run production verification tests"
    exit 0
else
    echo "⚠️  Some tests failed. Please check the deployment."
    echo ""
    echo "🔧 Troubleshooting:"
    echo "1. Ensure staging server is running: ./start-novaxe18-staging.sh"
    echo "2. Check file permissions and paths"
    echo "3. Verify Magic 18 assets were copied correctly"
    exit 1
fi
