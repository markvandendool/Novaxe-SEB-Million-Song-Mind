#!/bin/bash
# Setup Git Push Aliases for Automatic Mac Pro Beast Sync
# Creates convenient commands that ensure repository synchronization
# Date: August 16, 2025

echo "🔧 SETTING UP HYPERTHREADING-SAFE GIT ALIASES"
echo "============================================="

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
SMART_PUSH_SCRIPT="$SCRIPT_DIR/smart-git-push.sh"

# Check if the smart push script exists
if [ ! -f "$SMART_PUSH_SCRIPT" ]; then
    echo "❌ Smart push script not found at: $SMART_PUSH_SCRIPT"
    exit 1
fi

echo "📋 Creating shell aliases for hyperthreading safety..."

# Detect shell and create appropriate alias
if [ -n "$ZSH_VERSION" ]; then
    SHELL_RC="$HOME/.zshrc"
    SHELL_NAME="zsh"
elif [ -n "$BASH_VERSION" ]; then
    SHELL_RC="$HOME/.bashrc"
    SHELL_NAME="bash"
else
    echo "⚠️  Shell detection failed. Manual alias setup required."
    echo "Add this to your shell configuration:"
    echo "alias gpush='$SMART_PUSH_SCRIPT'"
    echo "alias git-sync-push='$SMART_PUSH_SCRIPT'"
    exit 1
fi

# Backup existing shell configuration
if [ -f "$SHELL_RC" ]; then
    cp "$SHELL_RC" "$SHELL_RC.backup.$(date +%Y%m%d_%H%M%S)"
    echo "✅ Backed up $SHELL_RC"
fi

# Add aliases if they don't already exist
ALIAS_BLOCK="
# Hyperthreading-Safe Git Push Aliases (Added $(date))
# Prevents disasters by auto-syncing Mac Pro Beast after every push
alias gpush='$SMART_PUSH_SCRIPT'
alias git-sync-push='$SMART_PUSH_SCRIPT'
alias sync-push='$SMART_PUSH_SCRIPT'
"

if ! grep -q "git-sync-push" "$SHELL_RC" 2>/dev/null; then
    echo "$ALIAS_BLOCK" >> "$SHELL_RC"
    echo "✅ Added hyperthreading-safe aliases to $SHELL_RC"
else
    echo "ℹ️  Aliases already exist in $SHELL_RC"
fi

echo ""
echo "🎯 ALIASES CONFIGURED:"
echo "   gpush          - Smart git push with auto Mac Pro sync"
echo "   git-sync-push  - Same as above (explicit name)"
echo "   sync-push      - Short alias for convenience"
echo ""
echo "🔄 To activate in current session:"
echo "   source $SHELL_RC"
echo ""
echo "💡 USAGE EXAMPLES:"
echo "   gpush                    # Push to origin main with auto-sync"
echo "   gpush origin feature     # Push to feature branch (no auto-sync)"
echo "   git-sync-push origin main # Explicit sync push to main"
echo ""
echo "🚨 HYPERTHREADING SAFETY:"
echo "   Always use 'gpush' instead of 'git push' for main branch!"
echo "   This ensures Mac Pro Beast stays synchronized automatically."
