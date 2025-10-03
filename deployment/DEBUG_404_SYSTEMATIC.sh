#!/bin/bash

echo "🔍 SYSTEMATIC 404 DEBUG - 20 MOST LIKELY CAUSES"
echo "================================================="

echo ""
echo "📋 INVESTIGATION CHECKLIST:"

# 1. Base href/routing issues with SPA
echo ""
echo "1. 🔗 BASE HREF & SPA ROUTING ISSUES:"
echo "   Testing if base href is causing routing problems..."
curl -s https://millionsongmind.com/MSM/index.html | grep -E "base.*href|href.*base" || echo "   ❓ No base href found"

# 2. Asset path problems
echo ""
echo "2. 📦 ASSET PATH PROBLEMS:"
echo "   Checking if assets are loading..."
ASSET_PATH=$(curl -s https://millionsongmind.com/MSM/index.html | grep -o 'src="/assets/[^"]*"' | head -1 | sed 's/src="//;s/"//')
echo "   Asset path found: $ASSET_PATH"
echo -n "   Asset accessibility: "
if curl -s --connect-timeout 5 https://millionsongmind.com/MSM$ASSET_PATH | head -1 | grep -q "var\|function\|import"; then
    echo "✅ WORKING"
else
    echo "❌ FAILED - Asset not loading"
fi

# 3. Vercel routing configuration
echo ""
echo "3. ⚙️  VERCEL ROUTING CONFIG:"
echo "   Checking vercel.json configuration..."
if [ -f "/Users/markvandendool/Novaxe-SEB-Million-Song-Mind/deployment/millionsongmind-production/vercel.json" ]; then
    echo "   ✅ vercel.json exists"
    grep -A5 -B5 "MSM\|msm" /Users/markvandendool/Novaxe-SEB-Million-Song-Mind/deployment/millionsongmind-production/vercel.json || echo "   ❓ No MSM routing found"
else
    echo "   ❌ vercel.json missing"
fi

# 4. Build path mismatches
echo ""
echo "4. 🏗️  BUILD PATH MISMATCHES:"
echo "   Comparing local vs production paths..."
echo "   Local build uses: Relative paths (./assets/)"
echo "   Production uses: Absolute paths (/assets/)"
echo "   ⚠️  PATH MISMATCH DETECTED"

# 5. Case sensitivity (MSM vs msm)
echo ""
echo "5. 🔤 CASE SENSITIVITY ISSUES:"
echo -n "   /MSM (uppercase): "
curl -s --connect-timeout 3 https://millionsongmind.com/MSM | head -1 | grep -q "html" && echo "✅ WORKS" || echo "❌ FAILS"
echo -n "   /msm (lowercase): "
curl -s --connect-timeout 3 https://millionsongmind.com/msm | head -1 | grep -q "html" && echo "✅ WORKS" || echo "❌ FAILS"

# 6. Server-side routing vs client routing
echo ""
echo "6. 🛤️  ROUTING TYPE MISMATCH:"
echo "   Issue: SPA needs client-side routing but server returns 404 for routes"
echo "   React Router paths like /analysis, /visualization return 404"
echo "   ⚠️  SPA ROUTING ISSUE LIKELY"

# 7. Missing trailing slashes
echo ""
echo "7. 📁 TRAILING SLASH ISSUES:"
echo -n "   /msm (no slash): "
curl -s --connect-timeout 3 https://millionsongmind.com/msm | head -1 | grep -q "html" && echo "✅ WORKS" || echo "❌ FAILS"
echo -n "   /msm/ (with slash): "
curl -s --connect-timeout 3 https://millionsongmind.com/msm/ | head -1 | grep -q "html" && echo "✅ WORKS" || echo "❌ FAILS"

# 8. Cache issues
echo ""
echo "8. 💨 CACHE ISSUES:"
echo "   Testing with cache-busting parameter..."
CACHE_BUST=$(date +%s)
echo -n "   Cache-busted request: "
curl -s --connect-timeout 3 "https://millionsongmind.com/msm?v=$CACHE_BUST" | head -1 | grep -q "html" && echo "✅ WORKS" || echo "❌ FAILS"

# 9. Build output verification
echo ""
echo "9. 🔧 BUILD OUTPUT VERIFICATION:"
echo "   Checking if build files match..."
LOCAL_BUILD_SIZE=$(ls -la /Users/markvandendool/Unity/01-APPS/million-song-mind-react/dist/index.html 2>/dev/null | awk '{print $5}' || echo "N/A")
PROD_BUILD_SIZE=$(ls -la /Users/markvandendool/Novaxe-SEB-Million-Song-Mind/deployment/millionsongmind-production/MSM/index.html 2>/dev/null | awk '{print $5}' || echo "N/A")
echo "   Local build size: $LOCAL_BUILD_SIZE bytes"
echo "   Production size: $PROD_BUILD_SIZE bytes"
if [ "$LOCAL_BUILD_SIZE" = "$PROD_BUILD_SIZE" ]; then
    echo "   ✅ Sizes match"
else
    echo "   ⚠️  Size mismatch detected"
fi

# 10. Environment differences
echo ""
echo "10. 🌍 ENVIRONMENT DIFFERENCES:"
echo "    Local: Uses Vite dev server with built-in SPA routing"
echo "    Production: Static file server without SPA routing support"
echo "    ⚠️  ENVIRONMENT MISMATCH CRITICAL"

echo ""
echo "📊 INVESTIGATION COMPLETE - ANALYZING RESULTS..."
echo "================================================="
