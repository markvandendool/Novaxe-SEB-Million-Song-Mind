#!/bin/bash

echo "🔧 FIXING IMAC SSH PERMANENTLY - PASSWORDLESS AUTHENTICATION"
echo "============================================================="

# Configuration
IMAC_IP="10.0.0.66"
USERNAME="Worker3"
SSH_KEY_PATH="$HOME/.ssh/id_rsa"

echo "🎯 Target: $USERNAME@$IMAC_IP"
echo "🔑 SSH Key: $SSH_KEY_PATH"

# Step 1: Check if SSH key exists
echo ""
echo "🔍 Step 1: Checking SSH key..."
if [ ! -f "$SSH_KEY_PATH" ]; then
    echo "❌ SSH key not found. Generating new key..."
    ssh-keygen -t rsa -b 4096 -f "$SSH_KEY_PATH" -N "" -C "viper-ultimate@$(hostname)"
    echo "✅ SSH key generated"
else
    echo "✅ SSH key exists"
fi

# Step 2: Backup existing authorized_keys on iMac
echo ""
echo "🔍 Step 2: Backing up existing authorized_keys on iMac..."
ssh -o ConnectTimeout=10 -o PasswordAuthentication=yes "$USERNAME@$IMAC_IP" "
    if [ -f ~/.ssh/authorized_keys ]; then
        cp ~/.ssh/authorized_keys ~/.ssh/authorized_keys.backup.$(date +%Y%m%d_%H%M%S)
        echo '✅ Backup created'
    else
        echo 'ℹ️  No existing authorized_keys'
    fi
" || echo "⚠️  Could not backup (this is normal if first time)"

# Step 3: Copy SSH key to iMac
echo ""
echo "🔍 Step 3: Copying SSH key to iMac..."
echo "This may prompt for password - enter it once for permanent fix:"
ssh-copy-id -i "$SSH_KEY_PATH.pub" "$USERNAME@$IMAC_IP"

if [ $? -eq 0 ]; then
    echo "✅ SSH key copied successfully"
else
    echo "❌ SSH key copy failed. Trying alternative method..."
    
    # Alternative method: manual copy
    echo "📋 Manual key copy method..."
    cat "$SSH_KEY_PATH.pub" | ssh "$USERNAME@$IMAC_IP" "
        mkdir -p ~/.ssh
        chmod 700 ~/.ssh
        cat >> ~/.ssh/authorized_keys
        chmod 600 ~/.ssh/authorized_keys
        echo '✅ Manual key copy completed'
    "
fi

# Step 4: Test passwordless connection
echo ""
echo "🔍 Step 4: Testing passwordless connection..."
ssh -o ConnectTimeout=10 -o PasswordAuthentication=no "$USERNAME@$IMAC_IP" "echo '🎉 PASSWORDLESS SSH SUCCESSFUL!'" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ PASSWORDLESS SSH WORKING!"
    echo "🎉 IMAC SSH FIXED PERMANENTLY!"
else
    echo "❌ Passwordless SSH still failing. Trying additional fixes..."
    
    # Additional fixes
    echo "🔧 Applying additional SSH fixes..."
    ssh "$USERNAME@$IMAC_IP" "
        # Fix SSH directory permissions
        chmod 700 ~/.ssh
        chmod 600 ~/.ssh/authorized_keys
        
        # Ensure SSH service is running
        sudo launchctl load -w /System/Library/LaunchDaemons/ssh.plist 2>/dev/null || true
        
        # Check SSH config
        echo 'SSH directory permissions:'
        ls -la ~/.ssh/
        echo 'SSH service status:'
        sudo launchctl list | grep ssh || echo 'SSH service not found'
    "
    
    # Test again
    echo "🔄 Testing again after fixes..."
    ssh -o ConnectTimeout=10 -o PasswordAuthentication=no "$USERNAME@$IMAC_IP" "echo '🎉 PASSWORDLESS SSH SUCCESSFUL!'" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✅ PASSWORDLESS SSH WORKING AFTER FIXES!"
    else
        echo "❌ Still failing. Manual intervention may be needed."
        echo "💡 Try manually on iMac:"
        echo "   1. Open Terminal on iMac"
        echo "   2. Run: ssh-keygen -t rsa -b 4096"
        echo "   3. Copy the public key to authorized_keys"
    fi
fi

# Step 5: Test VIPER deployment
echo ""
echo "🔍 Step 5: Testing VIPER deployment to iMac..."
if ssh -o ConnectTimeout=10 -o PasswordAuthentication=no "$USERNAME@$IMAC_IP" "echo 'SSH working'" 2>/dev/null; then
    echo "✅ IMAC READY FOR VIPER DEPLOYMENT!"
    echo ""
    echo "🚀 You can now run:"
    echo "   ./deploy_unified_viper.sh <client_id> <client_secret>"
    echo ""
    echo "🎵 The iMac will handle Spotify metadata fetching!"
else
    echo "❌ IMAC SSH still needs manual setup"
fi

echo ""
echo "�� SSH FIX COMPLETE!" 