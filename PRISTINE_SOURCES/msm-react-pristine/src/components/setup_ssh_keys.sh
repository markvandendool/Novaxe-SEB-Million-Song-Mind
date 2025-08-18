#!/bin/bash

echo "🔑 SETTING UP SSH KEY AUTHENTICATION FOR 3-MACHINE SPOTIFY FETCHING"
echo "=================================================================="

# Generate SSH keys for iMac and Mac Pro
echo "🔑 Generating SSH keys..."
ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa_imac -N "" -C "vandendool@10.0.0.66"
ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa_macpro -N "" -C "vandendool@10.0.0.115"

# Copy keys to target machines
echo "📋 Copying SSH keys to target machines..."

# Copy to iMac (2012)
echo "🖥️  Copying key to 2012 iMac (10.0.0.66)..."
ssh-copy-id -i ~/.ssh/id_rsa_imac.pub vandendool@10.0.0.66

# Copy to Mac Pro
echo "🖥️  Copying key to Mac Pro (10.0.0.115)..."
ssh-copy-id -i ~/.ssh/id_rsa_macpro.pub vandendool@10.0.0.115

# Test connections
echo "🧪 Testing SSH connections..."
echo "Testing iMac connection..."
ssh vandendool@10.0.0.66 "echo '✅ iMac SSH working - $(uname -m) - $(sw_vers -productVersion)'"

echo "Testing Mac Pro connection..."
ssh vandendool@10.0.0.115 "echo '✅ Mac Pro SSH working - $(uname -m) - $(sw_vers -productVersion)'"

echo "🎉 SSH key setup complete!"
echo "You can now SSH without passwords to both machines." 