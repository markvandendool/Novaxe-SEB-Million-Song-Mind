#!/bin/bash
# 📋 AGENT QUICK CONTEXT - 2-DAY RECENT LOGS RULE
# Prevents memory waste for new agents while providing essential context

set -e  # Exit on any error

echo "🎯 AGENT QUICK CONTEXT - LAST 2 DAYS ONLY"
echo "=" | tr '=' '=' | head -c 60 && echo

# Check if forensic logs directory exists
if [ ! -d "welcome-onboarding/forensic-logs/daily-logs" ]; then
    echo "⚠️  No recent forensic logs found. This might be your first session!"
    echo "📚 Check welcome-onboarding/timeline-logs/ChronoLOG.md for project history"
    exit 0
fi

echo "=== 📅 RECENT DAILY SUMMARIES (Last 2 Days) ==="
find welcome-onboarding/forensic-logs/daily-logs/ -name "*QUICK_REFERENCE.md" -newerct "2 days ago" 2>/dev/null | sort -r | head -10 | while read -r file; do
    echo "📄 $(basename "$file")"
    head -8 "$file" | grep -E "Time:|Objective:|Status:|Key Achievements:|Major Issues:" 2>/dev/null || echo "   [Content preview not available]"
    echo
done

echo "=== 🎯 CURRENT PROJECT STATUS ==="
echo "📊 Repository Overview:"
echo "   Current branch: $(git branch --show-current)"
echo "   Latest commit: $(git log --oneline -1)"
echo "   Uncommitted changes: $(git status --porcelain | wc -l) files"
echo "   Repository size: $(du -sh . 2>/dev/null | cut -f1)"

echo
echo "📖 Recent ChronoLOG Activity:"
tail -15 welcome-onboarding/timeline-logs/ChronoLOG.md 2>/dev/null | head -10 || echo "   [ChronoLOG not available]"

echo
echo "=== ⚠️  OUTSTANDING ISSUES (Recent) ==="
grep -r -i "outstanding\|todo\|fixme\|issues:\|problem:\|error:" welcome-onboarding/forensic-logs/daily-logs/ 2>/dev/null | \
    grep -E "$(date -d '1 day ago' '+%Y-%m-%d')|$(date '+%Y-%m-%d')" | \
    head -5 | sed 's/^/   /' || echo "   ✅ No major outstanding issues found"

echo
echo "=== ✅ RECENT SUCCESSES ==="
grep -r -i "✅\|success\|completed\|resolved\|fixed" welcome-onboarding/forensic-logs/daily-logs/ 2>/dev/null | \
    grep -E "$(date -d '1 day ago' '+%Y-%m-%d')|$(date '+%Y-%m-%d')" | \
    head -5 | sed 's/^/   /' || echo "   📝 No recent successes logged yet"

echo
echo "=== 🔧 ACTIVE DEVELOPMENT AREAS ==="
echo "📁 Current working directories:"
ls -la apps/ 2>/dev/null | head -5 || echo "   [Apps directory not available]"
echo
echo "📋 Recent scripts activity:"
ls -lt scripts/*.sh 2>/dev/null | head -3 | awk '{print "   " $9 " (" $6 " " $7 ")"}' || echo "   [No recent script activity]"

echo
echo "=== 🚀 QUICK ACTION MENU ==="
echo "To dive deeper into specific areas:"
echo "   🔍 search_everything 'your-search-term'  # Search all materials"
echo "   📖 tail -50 welcome-onboarding/timeline-logs/ChronoLOG.md  # More project history"
echo "   📂 ls -la apps/  # Check current development structure"
echo "   🔧 ./welcome-onboarding/forensic-logs/LOG-COMMAND.sh 'your-session-description'  # Start logging"

echo
echo "=== 📏 2-DAY CONTEXT RULE ==="
echo "✅ This summary follows the 2-day rule to prevent memory waste"
echo "🔍 For older context, use: search_everything 'specific-error-or-topic'"
echo "📚 For complete history, check: welcome-onboarding/timeline-logs/ChronoLOG.md"
echo "🗂️ For specific sessions, browse: welcome-onboarding/forensic-logs/session-archives/"

echo
echo "🎯 READY FOR PRODUCTIVE WORK!"
