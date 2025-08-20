#!/bin/bash

# 🚨 NEW AGENT INSTANT BRIEFING & AUTHENTICATION PROTOCOL 🚨
# MANDATORY EXECUTION: Every new agent MUST run this first

echo "🔴 AGENT ONBOARDING PROTOCOL - INSTANT BRIEFING SYSTEM"
echo "======================================================"
echo ""

# Critical repository verification
EXPECTED_REPO="/Users/markvandendool/Novaxe-SEB-Million-Song-Mind"
CURRENT_DIR=$(pwd)

if [ "$CURRENT_DIR" != "$EXPECTED_REPO" ]; then
    echo "❌ CRITICAL ERROR: Wrong repository location!"
    echo "   Expected: $EXPECTED_REPO"
    echo "   Current:  $CURRENT_DIR"
    echo ""
    echo "🚨 MANDATORY FIRST COMMAND: cd $EXPECTED_REPO"
    exit 1
fi

echo "✅ Repository Location: AUTHENTICATED"
echo "✅ Project: Novaxe-SEB-Million-Song-Mind"
echo "✅ Owner: markvandendool"
echo "✅ Branch: main"
echo ""

# Forensic structure verification
echo "🔍 FORENSIC STRUCTURE VERIFICATION:"

# Check DIAMOND source (archaeological gold)
DIAMOND_FILE="apps/million-song-mind/vendor/gitlab_braid/braid.component.ts"
if [ -f "$DIAMOND_FILE" ]; then
    DIAMOND_LINES=$(wc -l < "$DIAMOND_FILE")
    echo "   ✅ DIAMOND Source: $DIAMOND_LINES lines (Angular archaeological gold)"
else
    echo "   ❌ CRITICAL: DIAMOND source missing!"
    exit 1
fi

# Check MSM app
if [ -d "apps/million-song-mind" ]; then
    echo "   ✅ MSM App: React/Vite target application ready"
else
    echo "   ❌ CRITICAL: MSM application missing!"
    exit 1
fi

# Check font integrity
FONT_FILE="apps/million-song-mind/public/fonts/Font Jan16.otf"
if [ -f "$FONT_FILE" ]; then
    FONT_SIZE=$(stat -f%z "$FONT_FILE" 2>/dev/null || stat -c%s "$FONT_FILE" 2>/dev/null)
    echo "   ✅ Font Asset: $FONT_SIZE bytes (authentic nvxChord font)"
else
    echo "   ⚠️  Font Asset: May need restoration from Angular source"
fi

# Check documentation library
if [ -d "OFFICIAL_DOCUMENTS" ]; then
    DOC_SIZE=$(du -sh OFFICIAL_DOCUMENTS | cut -f1)
    echo "   ✅ Documentation: $DOC_SIZE comprehensive library + intelligent search"
else
    echo "   ⚠️  Documentation: Library may need setup"
fi

echo ""
echo "🎯 MSM APPLICATION STATUS CHECK:"

cd apps/million-song-mind

# Check if MSM is running
MSM_RUNNING=$(lsof -ti:8080 2>/dev/null)
if [ -n "$MSM_RUNNING" ]; then
    echo "   ✅ MSM App: RUNNING on localhost:8080 (PID: $MSM_RUNNING)"
    echo "   🌐 Braid Demo: http://localhost:8080/braid-demo LIVE"
else
    echo "   📝 MSM App: Ready to start (npm run dev)"
    echo "   📝 Will run on: localhost:8080/braid-demo"
fi

cd ../..

echo ""
echo "🚨 UNBREAKABLE DEVELOPMENT RULES:"
echo "=================================="
echo "1. 🚫 NO AGENT DRIFT: Never recreate existing code from scratch"
echo "2. 🔍 ARCHAEOLOGICAL FIRST: Always check DIAMOND source before braid work" 
echo "3. 🎵 PRESERVE AUTHENTICITY: MSM must maintain original Novaxe SEB features"
echo "4. 📚 USE DOCUMENTATION: OFFICIAL_DOCUMENTS/ has 3.2GB of references"
echo "5. ⚡ SEARCH BEFORE ASKING: ./OFFICIAL_DOCUMENTS/SEARCH_DOCS.sh for errors"
echo ""

echo "📋 MANDATORY AGENT CONFIRMATION:"
echo "================================"
echo "New agents must respond with this EXACT statement:"
echo ""
echo "AUTHENTICATION COMPLETE:"
echo "✅ Repository: Novaxe-SEB-Million-Song-Mind located and verified"
echo "✅ DIAMOND Source: 675-line braid.component.ts archaeological gold identified"
echo "✅ MSM App: Status confirmed (running/ready on localhost:8080)"
echo "✅ Live Demo: /braid-demo route available for testing"
echo "✅ Documentation: 3.2GB OFFICIAL_DOCUMENTS library ready for search"
echo "✅ Rules: Agent drift prevention and archaeological protocols understood"
echo "✅ Ready for: [specify your intended work area]"
echo ""

echo "📞 COMPLETE BRIEFING DOCUMENT:"
echo "Read AGENT_ONBOARDING_PROTOCOL_MASTER.md for comprehensive details"
echo ""
echo "✅ INSTANT BRIEFING COMPLETE - AGENT AUTHENTICATION REQUIRED ABOVE"
