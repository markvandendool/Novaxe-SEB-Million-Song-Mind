#!/bin/bash
# 🔍 UNIVERSAL SEARCH - INSTANT CONTEXT RECOVERY
# Finds ALL references to any topic across the entire project ecosystem
# Perfect for "within 11 errors" type context recovery!

set -e  # Exit on any error

# Input validation
if [ $# -eq 0 ]; then
    echo "Usage: $0 'search-term'"
    echo "Examples:"
    echo "  $0 'TS2304'                    # Find TypeScript error references"
    echo "  $0 'within 11 errors'          # Find that lost success story"
    echo "  $0 'angular migration'         # All migration attempts"
    echo "  $0 'braid component'           # Specific component issues"
    echo "  $0 'vercel deploy'             # Deployment problems"
    exit 1
fi

SEARCH_TERM="$1"
echo "🔍 SEARCHING ALL MATERIALS FOR: $SEARCH_TERM"
echo "=" | tr '=' '=' | head -c 80 && echo

# Track search results
RESULTS_FOUND=0

echo "=== 📅 RECENT SESSIONS (2 Days) ==="
if [ -d "welcome-onboarding/forensic-logs/daily-logs" ]; then
    RECENT_RESULTS=$(find welcome-onboarding/forensic-logs/daily-logs/ -name "*.md" -newerct "2 days ago" 2>/dev/null | xargs grep -l "$SEARCH_TERM" 2>/dev/null || true)
    if [ -n "$RECENT_RESULTS" ]; then
        echo "$RECENT_RESULTS" | while read -r file; do
            echo "📄 $file:"
            grep -n -A 2 -B 2 "$SEARCH_TERM" "$file" 2>/dev/null | head -10 | sed 's/^/    /'
            echo
        done
        RESULTS_FOUND=$((RESULTS_FOUND + $(echo "$RECENT_RESULTS" | wc -l)))
    else
        echo "   📛 No recent matches found"
    fi
else
    echo "   📁 Daily logs directory not yet created"
fi

echo "=== 🗂️ FULL SESSION ARCHIVE ==="
ARCHIVE_RESULTS=$(find welcome-onboarding/forensic-logs/session-archives/ -name "*.md" -exec grep -l "$SEARCH_TERM" {} \; 2>/dev/null | head -10 || true)
if [ -n "$ARCHIVE_RESULTS" ]; then
    echo "$ARCHIVE_RESULTS" | while read -r file; do
        echo "📄 $file:"
        grep -n -A 1 -B 1 "$SEARCH_TERM" "$file" 2>/dev/null | head -6 | sed 's/^/    /'
        echo
    done
    RESULTS_FOUND=$((RESULTS_FOUND + $(echo "$ARCHIVE_RESULTS" | wc -l)))
else
    echo "   📛 No archived session matches found"
fi

echo "=== 📖 CHRONOLOG SEARCH ==="
CHRONO_RESULTS=$(grep -n -A 3 -B 3 "$SEARCH_TERM" welcome-onboarding/timeline-logs/ChronoLOG.md 2>/dev/null || true)
if [ -n "$CHRONO_RESULTS" ]; then
    echo "📄 welcome-onboarding/timeline-logs/ChronoLOG.md:"
    echo "$CHRONO_RESULTS" | head -15 | sed 's/^/    /'
    echo
    RESULTS_FOUND=$((RESULTS_FOUND + 1))
else
    echo "   📛 No ChronoLOG matches found"
fi

echo "=== 🗄️ EXTERNAL ARCHIVE SEARCH ==="
if [ -d "/Volumes/G-DRIVE mobile Pro SSD/Archive Novaxe-SEB-MillionSongMind" ]; then
    EXTERNAL_RESULTS=$(find "/Volumes/G-DRIVE mobile Pro SSD/Archive Novaxe-SEB-MillionSongMind/" -name "*.md" -o -name "*.txt" 2>/dev/null | head -30 | xargs grep -l "$SEARCH_TERM" 2>/dev/null | head -5 || true)
    if [ -n "$EXTERNAL_RESULTS" ]; then
        echo "$EXTERNAL_RESULTS" | while read -r file; do
            echo "📄 $file:"
            grep -n -A 1 "$SEARCH_TERM" "$file" 2>/dev/null | head -4 | sed 's/^/    /'
            echo
        done
        RESULTS_FOUND=$((RESULTS_FOUND + $(echo "$EXTERNAL_RESULTS" | wc -l)))
    else
        echo "   📛 No external archive matches found"
    fi
else
    echo "   💿 External archive not mounted or available"
fi

echo "=== 💻 CODE & SCRIPT SEARCH ==="
CODE_RESULTS=$(grep -r "$SEARCH_TERM" apps/ scripts/ welcome-onboarding/ 2>/dev/null | head -10 || true)
if [ -n "$CODE_RESULTS" ]; then
    echo "💻 Found in code:"
    echo "$CODE_RESULTS" | sed 's/^/    /' | head -10
    echo
    RESULTS_FOUND=$((RESULTS_FOUND + 1))
else
    echo "   📛 No code matches found"
fi

echo "=== 🔧 SOLUTION PATTERNS ==="
SOLUTION_RESULTS=$(grep -r -i "fix.*$SEARCH_TERM\|solve.*$SEARCH_TERM\|resolve.*$SEARCH_TERM\|success.*$SEARCH_TERM" welcome-onboarding/forensic-logs/ 2>/dev/null | head -8 || true)
if [ -n "$SOLUTION_RESULTS" ]; then
    echo "✅ Found solution patterns:"
    echo "$SOLUTION_RESULTS" | sed 's/^/    /'
    echo
    RESULTS_FOUND=$((RESULTS_FOUND + 1))
else
    echo "   📛 No solution patterns found"
fi

echo "=== ⚠️ ERROR PATTERNS & TROUBLESHOOTING ==="
ERROR_RESULTS=$(grep -r -i "error.*$SEARCH_TERM\|failed.*$SEARCH_TERM\|problem.*$SEARCH_TERM" welcome-onboarding/forensic-logs/ 2>/dev/null | head -8 || true)
if [ -n "$ERROR_RESULTS" ]; then
    echo "⚠️ Found error patterns:"
    echo "$ERROR_RESULTS" | sed 's/^/    /'
    echo
    RESULTS_FOUND=$((RESULTS_FOUND + 1))
else
    echo "   ✅ No error patterns found (good sign!)"
fi

echo "=== 🕰️ UNIFIED SEARCH INDEX ==="
if [ -f "welcome-onboarding/unified-search-index/MASTER_SESSION_INDEX.txt" ]; then
    INDEX_RESULTS=$(grep -i "$SEARCH_TERM" welcome-onboarding/unified-search-index/MASTER_SESSION_INDEX.txt 2>/dev/null || true)
    if [ -n "$INDEX_RESULTS" ]; then
        echo "🔍 Found in session index:"
        echo "$INDEX_RESULTS" | sed 's/^/    /' | head -5
        echo
        RESULTS_FOUND=$((RESULTS_FOUND + 1))
    else
        echo "   📛 No index matches found"
    fi
else
    echo "   ⚠️  Search index not yet created"
fi

echo "=" | tr '=' '=' | head -c 80 && echo
echo "📊 SEARCH SUMMARY"
echo "   Search term: '$SEARCH_TERM'"
echo "   Sources found: $RESULTS_FOUND"

if [ $RESULTS_FOUND -eq 0 ]; then
    echo "
🤔 NO MATCHES FOUND - SUGGESTIONS:"
    echo "   1. Try broader search terms (e.g., 'angular' instead of 'angular 20')"
    echo "   2. Check spelling and try variations"
    echo "   3. Search for error codes without context (e.g., 'TS2304')"
    echo "   4. Try related terms (e.g., 'migration' if 'upgrade' found nothing)"
    echo "   5. Check if external drive is mounted for archive search"
else
    echo "
✅ CONTEXT RECOVERED SUCCESSFULLY!"
    echo "   📝 Review the results above for your 'within 11 errors' type context"
    echo "   📂 Check full session files for complete details"
    echo "   🔍 Try more specific searches if needed"
fi

echo "
🚀 NEXT ACTIONS:"
echo "   - Review specific files mentioned above"
echo "   - Use './welcome-onboarding/forensic-logs/LOG-COMMAND.sh' to document new work"
echo "   - Run './welcome-onboarding/forensic-logs/AGENT_QUICK_CONTEXT.sh' for recent overview"
echo
echo "🎖️ UNIVERSAL SEARCH COMPLETE!"
