#!/bin/bash
# Automatic Mac Pro Beast Sync After Every Git Push
# Prevents hyperthreading with out-of-sync repositories
# CRITICAL SAFETY MEASURE for multi-machine development
# Date: August 16, 2025

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"

echo ""
echo "🔄 AUTOMATIC MAC PRO BEAST SYNC TRIGGERED"
echo "========================================="
echo "📍 Triggered by: git push to GitHub"
echo "🎯 Purpose: Prevent hyperthreading with out-of-sync repository"
echo "📊 Latest commit being synced: $(git log --oneline -1)"
echo ""

# Check if Mac Pro Beast is reachable
echo "🔍 Testing Mac Pro Beast connectivity..."
if ! ping -c 2 -W 5000 192.168.68.106 > /dev/null 2>&1; then
    echo "⚠️  Mac Pro Beast unreachable at 192.168.68.106"
    echo ""
    echo "🚨 HYPERTHREADING SAFETY WARNING:"
    echo "   Mac Pro Beast repository may be OUT OF SYNC!"
    echo "   Before hyperthreading, manually sync with:"
    echo "   ./scripts/sync-to-mac-pro-beast.sh"
    echo ""
    echo "📝 This warning logged to: logs/mac-pro-sync-warnings.log"
    
    # Log the sync failure
    mkdir -p "$REPO_ROOT/logs"
    echo "$(date): Mac Pro Beast unreachable during auto-sync after commit $(git log --oneline -1)" >> "$REPO_ROOT/logs/mac-pro-sync-warnings.log"
    
    exit 0  # Don't fail the push, just warn
fi

echo "✅ Mac Pro Beast reachable"

# Test SSH connection
echo "🔍 Testing SSH connection..."
if ! ssh -o ConnectTimeout=10 -o BatchMode=yes markvandendool@192.168.68.106 "echo 'SSH test successful'" > /dev/null 2>&1; then
    echo "⚠️  SSH connection to Mac Pro Beast failed"
    echo ""
    echo "🚨 HYPERTHREADING SAFETY WARNING:"
    echo "   Cannot auto-sync to Mac Pro Beast!"
    echo "   Before hyperthreading, manually sync with:"
    echo "   ./scripts/sync-to-mac-pro-beast.sh"
    echo ""
    
    # Log the SSH failure
    mkdir -p "$REPO_ROOT/logs"
    echo "$(date): SSH failed during auto-sync to Mac Pro Beast after commit $(git log --oneline -1)" >> "$REPO_ROOT/logs/mac-pro-sync-warnings.log"
    
    exit 0  # Don't fail the push, just warn
fi

echo "✅ SSH connection established"

# Execute automatic sync
echo "🚀 Executing automatic repository sync..."
ssh markvandendool@192.168.68.106 << 'EOF'
    cd /Users/markvandendool/
    
    if [ ! -d "Novaxe-SEB-Million-Song-Mind" ]; then
        echo "📥 Cloning repository to Mac Pro Beast..."
        git clone https://github.com/markvandendool/Novaxe-SEB-Million-Song-Mind.git
        cd Novaxe-SEB-Million-Song-Mind
    else
        echo "🔄 Auto-syncing repository on Mac Pro Beast..."
        cd Novaxe-SEB-Million-Song-Mind
        
        # Save any local changes (just in case)
        if ! git diff --quiet; then
            echo "💾 Stashing local changes on Mac Pro Beast..."
            git stash push -m "Auto-stash before sync $(date)"
        fi
        
        # Force sync to match GitHub exactly
        git fetch origin
        git reset --hard origin/main
        
        echo "✅ Mac Pro Beast repository synced to GitHub state"
    fi
    
    # Apply TypeScript fix if the script exists
    if [ -f "scripts/fix-abcjs-types.sh" ]; then
        echo "🔧 Ensuring TypeScript compatibility fix is applied..."
        chmod +x scripts/fix-abcjs-types.sh
        ./scripts/fix-abcjs-types.sh
    fi
    
    echo "🎯 Mac Pro Beast ready for hyperthreading"
    echo "📊 Current commit: $(git log --oneline -1)"
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ AUTOMATIC MAC PRO BEAST SYNC SUCCESSFUL"
    echo "🎯 Both repositories now in perfect sync"
    echo "🚀 Safe to proceed with hyperthreading operations"
    echo ""
    
    # Log successful sync
    mkdir -p "$REPO_ROOT/logs"
    echo "$(date): Successful auto-sync to Mac Pro Beast after commit $(git log --oneline -1)" >> "$REPO_ROOT/logs/mac-pro-sync-success.log"
else
    echo ""
    echo "❌ AUTOMATIC MAC PRO BEAST SYNC FAILED"
    echo "🚨 HYPERTHREADING SAFETY WARNING: Repositories may be out of sync!"
    echo "   Manually sync before hyperthreading with: ./scripts/sync-to-mac-pro-beast.sh"
    echo ""
    
    # Log sync failure
    mkdir -p "$REPO_ROOT/logs"
    echo "$(date): Auto-sync failed to Mac Pro Beast after commit $(git log --oneline -1)" >> "$REPO_ROOT/logs/mac-pro-sync-warnings.log"
fi
