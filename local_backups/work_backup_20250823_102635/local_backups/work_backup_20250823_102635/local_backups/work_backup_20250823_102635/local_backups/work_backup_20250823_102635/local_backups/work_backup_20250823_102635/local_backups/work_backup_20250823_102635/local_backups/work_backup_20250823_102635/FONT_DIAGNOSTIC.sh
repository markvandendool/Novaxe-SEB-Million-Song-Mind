#!/bin/bash

# ═══════════════════════════════════════════════════════════════
#             FONT LOADING DIAGNOSTIC - NO FALLBACKS
#           FORCE ERRORS TO SURFACE - NO HIDING
# ═══════════════════════════════════════════════════════════════

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║               🔍 FONT LOADING DIAGNOSTIC 🔍                  ║"
echo "║                   NO FALLBACKS EDITION                       ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

cd "/Users/markvandendool/Novaxe-SEB-Million-Song-Mind"

echo "🎯 CHECKING FONT FILES ON DISK:"
echo "================================"
ls -la apps/million-song-mind/public/fonts/*.otf | while read line; do
    filename=$(echo "$line" | awk '{print $9}' | xargs basename)
    size=$(echo "$line" | awk '{print $5}')
    echo "✅ $filename ($size bytes)"
done
echo ""

echo "🌐 CHECKING FONT FILES VIA HTTP:"
echo "================================="
for font in Chord_Grid_v2.otf nvxFont.otf Fontdec13.otf; do
    status=$(curl -s -w "%{http_code}" "http://localhost:8080/fonts/$font" -o /dev/null 2>/dev/null)
    if [ "$status" = "200" ]; then
        echo "✅ $font - HTTP $status (OK)"
    else
        echo "❌ $font - HTTP $status (FAILED)"
    fi
done
echo ""

echo "📄 CHECKING @font-face DECLARATIONS:"
echo "====================================="
echo "🔍 In braid-angular-exact.css:"
grep -n "@font-face\|font-family\|src:" apps/million-song-mind/src/styles/braid-angular-exact.css | head -10
echo ""
echo "🔍 In braid-fonts.css:"
grep -n "@font-face\|font-family\|src:" apps/million-song-mind/src/styles/braid-fonts.css | head -10
echo ""

echo "🎨 CHECKING CSS CLASSES USING FONTS:"
echo "====================================="
echo "🔍 Classes using nvxChord:"
grep -n "font-family.*nvxChord" apps/million-song-mind/src/styles/*.css | head -5
echo ""
echo "🔍 Classes using Fontdec13:"
grep -n "font-family.*Fontdec13" apps/million-song-mind/src/styles/*.css apps/million-song-mind/src/components/**/*.css | head -5
echo ""

echo "🔍 CHECKING COMPONENT IMPORTS:"
echo "==============================="
echo "🔍 Components importing braid fonts:"
grep -r "import.*braid.*css" apps/million-song-mind/src/ | head -5
echo ""

echo "🌍 CHECKING HTML FONT PRELOADING:"
echo "=================================="
curl -s http://localhost:8080 | grep -i "preload.*font\|@font-face" | head -5
echo ""

echo "🎭 CHECKING ACTUAL RENDERED CONTENT:"
echo "====================================="
echo "🔍 Looking for BraidChordSequence test section:"
curl -s http://localhost:8080 | grep -i "braid.*font.*test" -A 3 -B 3
echo ""

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                    DIAGNOSTIC COMPLETE                       ║"
echo "║                                                             ║"
echo "║  IF FONTS STILL SHOW AS FALLBACK:                          ║"
echo "║  1. Font files not loading (HTTP errors above)             ║"
echo "║  2. @font-face declarations broken                          ║"
echo "║  3. CSS not imported properly                               ║"
echo "║  4. Browser cache issues (hard refresh needed)             ║"
echo "║                                                             ║"
echo "║  NO FALLBACKS = IMMEDIATE FONT FAILURE VISIBILITY          ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
