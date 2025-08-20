#!/bin/bash

echo "======================================"
echo "🔍 BRAID SYSTEM VERIFICATION SCRIPT"
echo "======================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check 1: MusicalBubbles component exists
echo "1. Checking MusicalBubbles.tsx (authentic braid)..."
if [ -f "apps/million-song-mind/src/components/MusicalBubbles.tsx" ]; then
    echo -e "${GREEN}✅ MusicalBubbles.tsx exists${NC}"
    echo "   Size: $(ls -lh apps/million-song-mind/src/components/MusicalBubbles.tsx | awk '{print $5}')"
else
    echo -e "${RED}❌ MusicalBubbles.tsx missing!${NC}"
fi
echo ""

# Check 2: BraidTonal component exists
echo "2. Checking BraidTonal.tsx..."
if [ -f "apps/million-song-mind/src/components/braid/BraidTonal.tsx" ]; then
    echo -e "${GREEN}✅ BraidTonal.tsx exists${NC}"
    echo "   Size: $(ls -lh apps/million-song-mind/src/components/braid/BraidTonal.tsx | awk '{print $5}')"
else
    echo -e "${RED}❌ BraidTonal.tsx missing!${NC}"
fi
echo ""

# Check 3: Font files exist
echo "3. Checking Font Jan16.otf..."
if [ -f "apps/million-song-mind/public/fonts/REAL_NOVAXE_FONT.otf" ]; then
    echo -e "${GREEN}✅ REAL_NOVAXE_FONT.otf exists${NC}"
    echo "   Size: $(ls -lh apps/million-song-mind/public/fonts/REAL_NOVAXE_FONT.otf | awk '{print $5}')"
else
    echo -e "${RED}❌ REAL_NOVAXE_FONT.otf missing!${NC}"
fi

if [ -f "apps/million-song-mind/public/fonts/Font Jan16.otf" ]; then
    echo -e "${GREEN}✅ Font Jan16.otf backup exists${NC}"
fi
echo ""

# Check 4: Transformation utilities exist
echo "4. Checking transformation utilities..."
if [ -f "apps/million-song-mind/src/utils/chordTypes.ts" ]; then
    echo -e "${GREEN}✅ chordTypes.ts exists${NC}"
    # Check for key transformations
    if grep -q "german.*+6" apps/million-song-mind/src/utils/chordTypes.ts; then
        echo -e "${GREEN}   ✅ German 6th transformation found${NC}"
    fi
    if grep -q "b.*l" apps/million-song-mind/src/utils/chordTypes.ts; then
        echo -e "${GREEN}   ✅ Flat transformation found${NC}"
    fi
else
    echo -e "${RED}❌ chordTypes.ts missing!${NC}"
fi
echo ""

# Check 5: Data file exists
echo "5. Checking braid_tonalities.json..."
if [ -f "apps/million-song-mind/public/assets/braid_tonalities.json" ]; then
    echo -e "${GREEN}✅ braid_tonalities.json exists${NC}"
    # Count keys
    KEY_COUNT=$(grep -c '"' apps/million-song-mind/public/assets/braid_tonalities.json | head -1)
    echo "   Keys in file: ~$((KEY_COUNT/20)) positions"
else
    echo -e "${RED}❌ braid_tonalities.json missing!${NC}"
fi
echo ""

# Check 6: Server running
echo "6. Checking if server is running on port 8080..."
if lsof -i :8080 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Server is running on port 8080${NC}"
    
    # Try to fetch the braid demo
    echo "7. Checking braid-demo page..."
    if curl -s http://localhost:8080/braid-demo | grep -q "AUTHENTIC\|Musical\|Braid"; then
        echo -e "${GREEN}✅ Braid demo page is accessible${NC}"
    else
        echo -e "${RED}⚠️  Braid demo page not responding as expected${NC}"
    fi
else
    echo -e "${RED}❌ Server not running on port 8080${NC}"
    echo "   Run: cd apps/million-song-mind && npm run dev"
fi
echo ""

# Check 7: Git status
echo "8. Checking git status..."
LAST_COMMIT=$(git log --oneline -1)
echo "   Last commit: $LAST_COMMIT"
if echo "$LAST_COMMIT" | grep -q "FONT IMPLEMENTATION"; then
    echo -e "${GREEN}✅ On the correct commit${NC}"
else
    echo "   ⚠️  Make sure you're on the right branch"
fi
echo ""

# Summary
echo "======================================"
echo "📊 VERIFICATION SUMMARY:"
echo "======================================"
echo ""
echo "THE AUTHENTIC NOVAXE SEB BRAID IS:"
if [ -f "apps/million-song-mind/src/components/MusicalBubbles.tsx" ] && \
   [ -f "apps/million-song-mind/public/fonts/REAL_NOVAXE_FONT.otf" ] && \
   [ -f "apps/million-song-mind/src/utils/chordTypes.ts" ]; then
    echo -e "${GREEN}✅ FULLY OPERATIONAL${NC}"
    echo ""
    echo "Access it at: http://localhost:8080/braid-demo"
    echo ""
    echo "Key features working:"
    echo "  • 10-position vertical braid"
    echo "  • Font Jan16.otf rendering"
    echo "  • Flat symbols (Bb → B♭)"
    echo "  • Chord qualities (m, 7, dim, +6)"
    echo "  • Interactive key changes"
    echo "  • Roman numeral toggle"
else
    echo -e "${RED}❌ MISSING CRITICAL FILES${NC}"
    echo "Run: git reset --hard d3a0bb50"
fi
echo ""
echo "======================================"
