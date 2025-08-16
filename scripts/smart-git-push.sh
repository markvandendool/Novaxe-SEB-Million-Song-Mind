#!/bin/bash
# Smart Git Push Wrapper with Automatic Mac Pro Beast Sync
# Prevents hyperthreading disasters by ensuring repository sync
# Usage: Use 'gpush' instead of 'git push' for automatic Mac Pro sync
# Date: August 16, 2025

echo "🚀 SMART GIT PUSH WITH AUTO-SYNC"
echo "================================"

# Get the original git push arguments
PUSH_ARGS="$@"

# If no arguments provided, default to 'origin main'
if [ $# -eq 0 ]; then
    PUSH_ARGS="origin main"
fi

echo "📤 Executing: git push $PUSH_ARGS"

# Execute the actual git push
if git push $PUSH_ARGS; then
    echo ""
    echo "✅ Git push successful to GitHub"
    
    # Check if we're pushing to main branch (the critical branch for hyperthreading)
    if [[ "$PUSH_ARGS" == *"main"* ]] || [[ "$PUSH_ARGS" == "origin main" ]] || [[ $# -eq 0 ]]; then
        echo ""
        echo "🎯 MAIN BRANCH PUSH DETECTED - Auto-syncing Mac Pro Beast..."
        echo "🚨 HYPERTHREADING SAFETY: Ensuring repositories stay synchronized"
        
        # Execute the auto-sync script
        SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
        if [ -f "$SCRIPT_DIR/auto-sync-mac-pro-after-push.sh" ]; then
            "$SCRIPT_DIR/auto-sync-mac-pro-after-push.sh"
        else
            echo "⚠️  Auto-sync script not found!"
            echo "   Expected: $SCRIPT_DIR/auto-sync-mac-pro-after-push.sh"
            echo "🚨 MANUAL SYNC REQUIRED before hyperthreading!"
        fi
    else
        echo "ℹ️  Non-main branch push - skipping Mac Pro Beast sync"
    fi
    
    echo ""
    echo "🏁 SMART PUSH COMPLETE"
    
else
    echo ""
    echo "❌ Git push failed - no sync attempted"
    exit 1
fi
