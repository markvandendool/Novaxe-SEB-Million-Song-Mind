#!/bin/bash
# 🎯 RECENTER COMMAND - INSTANT AGENT CONTEXT RECOVERY
# Usage: ./welcome-onboarding/RECENTER.sh
# RESULT: Any agent instantly understands EVERYTHING

set -e  # Exit on any error

echo "🎯 RECENTERING AGENT - LOADING COMPLETE CONTEXT"
echo "=" | tr '=' '=' | head -c 70 && echo
echo

# Force read all critical onboarding materials
echo "📚 LOADING CRITICAL ONBOARDING MATERIALS..."
echo

# 1. UNBREAKABLE RULES
echo "📕 UNBREAKABLE RULES (MANDATORY READING):"
if [ -f "welcome-onboarding/IMPROVED_MASTER_PROTOCOL.md" ]; then
    echo "✅ Master Protocol Available - Key Points:"
    grep -E "UNBREAKABLE|CRITICAL|MANDATORY|ABSOLUTE" welcome-onboarding/IMPROVED_MASTER_PROTOCOL.md | head -5 | sed 's/^/   📌 /'
else
    echo "⚠️  Master Protocol not found - checking alternatives"
fi

if [ -f "welcome-onboarding/UNBREAKABLE_RULES/CORRECTED_CPU_USAGE_RULES.md" ]; then
    echo "✅ CPU Usage Rules - Critical Points:"
    head -10 "welcome-onboarding/UNBREAKABLE_RULES/CORRECTED_CPU_USAGE_RULES.md" | grep -E "RULE|NEVER|ALWAYS" | head -3 | sed 's/^/   🚨 /'
fi

echo

# 2. PROJECT OVERVIEW
echo "🏗️ PROJECT OVERVIEW:"
echo "   📍 Location: $(pwd)"
echo "   🌲 Branch: $(git branch --show-current)"
echo "   📝 Latest: $(git log --oneline -1)"
echo "   📊 Changes: $(git status --porcelain | wc -l) files pending"
echo "   💾 Size: $(du -sh . 2>/dev/null | cut -f1)"

echo
echo "🎯 Mission: Angular 11→20 Migration + MillionSongMind Integration"
echo "🏗️ Current: Angular 20 harness + forensic logging system established"
echo "🔧 Status: Ready for component migration with zero agent drift"

echo

# 3. CRITICAL COMMANDS
echo "⚡ CRITICAL COMMANDS YOU MUST KNOW:"
echo
echo "🎖️ WHEN USER SAYS 'LOG' - EXECUTE:"
echo "   ./welcome-onboarding/forensic-logs/LOG-COMMAND.sh 'session description'"
echo "   📋 This preserves ALL trial-and-error attempts forever"
echo "   🔍 Prevents losing 'within 11 errors' type discoveries"
echo "   📚 Documents every failure AND success with forensic detail"
echo
echo "🔍 TO SEARCH FOR ANYTHING:"
echo "   ./welcome-onboarding/forensic-logs/SEARCH_EVERYTHING.sh 'search-term'"
echo "   📋 Finds ALL references across entire project ecosystem"
echo "   🏆 Perfect for recovering lost context or similar issues"
echo
echo "📋 FOR QUICK 2-DAY CONTEXT:"
echo "   ./welcome-onboarding/forensic-logs/AGENT_QUICK_CONTEXT.sh"
echo "   📋 Shows recent work without memory waste"
echo "   🎯 Follows the '2-day rule' for efficiency"
echo

# 4. HYPERTHREADING STATUS
echo "🖥️ DUAL-MACHINE HYPERTHREADING STATUS:"
echo "   🎛️ Mac Studio (Primary): 12 cores, 32GB RAM"
echo "   🚀 Mac Pro (Heavy Processing): 56 cores, 160GB RAM"
echo "   🔄 Sync Method: GitHub (NOT SMB/SSH file transfer)"
echo "   ✅ Status: TESTED and VERIFIED with real conflict resolution"
echo "   📡 SSH Command: ssh vandendool@Marks-Mac-Pro.local"

echo

# 5. CURRENT PRIORITIES
echo "🎯 CURRENT PRIORITIES:"
echo "   1. 🏗️ Component migration using established patterns"
echo "   2. 🔍 Always use LOG command for session documentation"
echo "   3. 🤝 Maintain dual-machine coordination"
echo "   4. 📊 Follow 2-day context rule for efficiency"
echo "   5. 🔍 Search existing solutions before creating new ones"

echo

# 6. RECENT CONTEXT (2-DAY RULE)
echo "📅 RECENT CONTEXT (Following 2-Day Rule):"
if [ -d "welcome-onboarding/forensic-logs/daily-logs" ]; then
    RECENT_SESSIONS=$(find welcome-onboarding/forensic-logs/daily-logs/ -name "*.md" -newerct "2 days ago" 2>/dev/null | wc -l)
    echo "   📊 Recent sessions: $RECENT_SESSIONS in last 2 days"
    if [ "$RECENT_SESSIONS" -gt 0 ]; then
        echo "   🔍 Run AGENT_QUICK_CONTEXT.sh for details"
    fi
else
    echo "   📝 No recent forensic logs - you might be early in this session!"
fi

# Check ChronoLOG for latest activity
if [ -f "welcome-onboarding/timeline-logs/ChronoLOG.md" ]; then
    echo "   📖 Latest ChronoLOG Activity:"
    tail -5 welcome-onboarding/timeline-logs/ChronoLOG.md | head -3 | sed 's/^/      📍 /'
fi

echo

# 7. SYSTEM ARCHITECTURE
echo "🏗️ SYSTEM ARCHITECTURE:"
echo "   📁 apps/web/ - Frontend Angular 20 development"
echo "   📁 apps/api/ - Backend API functions"
echo "   📁 welcome-onboarding/ - Agent orientation system (YOU ARE HERE)"
echo "   📁 welcome-onboarding/forensic-logs/ - Session preservation system"
echo "   📦 External Archive: 35GB reference materials on G-DRIVE"
echo "   🔍 Unified Search: Instant access to ALL project materials"

echo

# 8. CRITICAL SUCCESS FACTORS
echo "🎖️ CRITICAL SUCCESS FACTORS:"
echo "   ✅ NEVER lose context - always use LOG command"
echo "   ✅ PRESERVE trial-and-error - document every attempt"
echo "   ✅ SEARCH before creating - avoid duplicate work"
echo "   ✅ COORDINATE machines - maintain GitHub sync"
echo "   ✅ FOLLOW 2-day rule - don't waste memory on old context"
echo "   ✅ RECENTER when needed - run this command if confused"

echo

# 9. EMERGENCY PROTOCOLS
echo "🚨 EMERGENCY PROTOCOLS:"
echo "   🔍 Lost context? Run: ./welcome-onboarding/forensic-logs/SEARCH_EVERYTHING.sh"
echo "   🎯 Confused about goals? Read: welcome-onboarding/START_HERE.md"
echo "   📞 Need full history? Check: welcome-onboarding/timeline-logs/ChronoLOG.md"
echo "   🔄 Sync issues? Test: ssh vandendool@Marks-Mac-Pro.local 'pwd'"
echo "   🆘 Total confusion? Re-run: ./welcome-onboarding/RECENTER.sh"

echo

# 10. VALIDATION
echo "🔐 RECENTER VALIDATION:"
echo "   ✅ Do you understand what 'LOG' means? (Comprehensive session logging)"
echo "   ✅ Do you know the 2-day context rule? (Recent focus, search for older)"
echo "   ✅ Do you know the dual-machine setup? (Mac Studio + Mac Pro via GitHub)"
echo "   ✅ Do you understand trial-and-error preservation? (Document failures too)"
echo "   ✅ Do you know the search capabilities? (Instant access to all materials)"

echo

echo "=" | tr '=' '=' | head -c 70 && echo
echo "🎯 AGENT RECENTERING COMPLETE!"
echo
echo "📋 IMMEDIATE READINESS CHECKLIST:"
echo "   [ ] I understand that 'LOG' means comprehensive session documentation"
echo "   [ ] I know to search existing materials before creating new solutions"
echo "   [ ] I will maintain dual-machine GitHub coordination"
echo "   [ ] I will follow the 2-day context rule for efficiency"
echo "   [ ] I will document ALL attempts, including failures"
echo
echo "🚀 YOU ARE NOW FULLY RECENTERED AND READY FOR PRODUCTIVE WORK!"
echo "🎖️ Next: Wait for user instructions or use LOG command to document work"
echo
echo "💡 Quick Test: Try running './welcome-onboarding/forensic-logs/SEARCH_EVERYTHING.sh angular' to verify search works"
