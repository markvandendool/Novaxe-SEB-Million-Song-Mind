#!/bin/bash

echo "🚀 SPOTIFY METADATA FETCHER v3.5 - 3-MACHINE DEPLOYMENT"
echo "========================================================"

# Configuration
MAC_PRO_IP="10.0.0.115"
IMAC_IP="10.0.0.66"
USERNAME="vandendool"

# Spotify App Credentials (you'll need to create these)
echo "🔑 SPOTIFY APP SETUP REQUIRED:"
echo "1. Go to https://developer.spotify.com/dashboard"
echo "2. Create 3 apps: VIPER_MacStudio, VIPER_MacPro, VIPER_iMac"
echo "3. Get client_id and client_secret for each"
echo ""

# Check if credentials are provided
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "❌ Usage: $0 <client_id> <client_secret>"
    echo "Example: $0 abc123def456 ghi789jkl012"
    exit 1
fi

CLIENT_ID="$1"
CLIENT_SECRET="$2"

echo "✅ Using Spotify credentials:"
echo "Client ID: ${CLIENT_ID:0:8}..."
echo "Client Secret: ${CLIENT_SECRET:0:8}..."

# Step 1: Setup SSH keys
echo ""
echo "🔑 Step 1: Setting up SSH keys..."
if [ ! -f ~/.ssh/id_rsa_imac ]; then
    ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa_imac -N "" -C "vandendool@$IMAC_IP"
fi

if [ ! -f ~/.ssh/id_rsa_macpro ]; then
    ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa_macpro -N "" -C "vandendool@$MAC_PRO_IP"
fi

# Copy keys to target machines
echo "📋 Copying SSH keys..."
ssh-copy-id -i ~/.ssh/id_rsa_imac.pub "$USERNAME@$IMAC_IP" || echo "⚠️  iMac SSH key copy failed (may need password)"
ssh-copy-id -i ~/.ssh/id_rsa_macpro.pub "$USERNAME@$MAC_PRO_IP" || echo "⚠️  Mac Pro SSH key copy failed (may need password)"

# Step 2: Test connections
echo ""
echo "🧪 Step 2: Testing SSH connections..."
echo "Testing iMac connection..."
ssh "$USERNAME@$IMAC_IP" "echo '✅ iMac SSH working - $(uname -m) - $(sw_vers -productVersion)'" || {
    echo "❌ iMac SSH failed. Please check:"
    echo "1. iMac is powered on and connected to network"
    echo "2. SSH is enabled on iMac (System Preferences > Sharing > Remote Login)"
    echo "3. Try: ssh $USERNAME@$IMAC_IP"
    exit 1
}

echo "Testing Mac Pro connection..."
ssh "$USERNAME@$MAC_PRO_IP" "echo '✅ Mac Pro SSH working - $(uname -m) - $(sw_vers -productVersion)'" || {
    echo "❌ Mac Pro SSH failed. Please check connection."
    exit 1
}

# Step 3: Install dependencies on remote machines
echo ""
echo "📦 Step 3: Installing dependencies on remote machines..."

# Install on iMac
echo "Installing dependencies on iMac..."
ssh "$USERNAME@$IMAC_IP" "
    echo 'Installing Python packages on iMac...'
    pip3 install pandas aiohttp asyncio backoff rich
    echo '✅ iMac dependencies installed'
"

# Install on Mac Pro
echo "Installing dependencies on Mac Pro..."
ssh "$USERNAME@$MAC_PRO_IP" "
    echo 'Installing Python packages on Mac Pro...'
    pip3 install pandas aiohttp asyncio backoff rich
    echo '✅ Mac Pro dependencies installed'
"

# Step 4: Copy script to remote machines
echo ""
echo "📁 Step 4: Copying Spotify fetcher script to remote machines..."

# Copy to iMac
scp spotify_metadata_fetcher.py "$USERNAME@$IMAC_IP:~/spotify_metadata_fetcher.py"
echo "✅ Script copied to iMac"

# Copy to Mac Pro
scp spotify_metadata_fetcher.py "$USERNAME@$MAC_PRO_IP:~/spotify_metadata_fetcher.py"
echo "✅ Script copied to Mac Pro"

# Step 5: Test run on iMac
echo ""
echo "🧪 Step 5: Testing Spotify fetcher on iMac..."
echo "Running test with 10 tracks on iMac..."

ssh "$USERNAME@$IMAC_IP" "
    cd ~
    python3 spotify_metadata_fetcher.py \
        --input data3_enriched.csv \
        --start 0 \
        --end 10 \
        --output data3.5_spotify_extras_imac_test.csv \
        --client-id '$CLIENT_ID' \
        --client-secret '$CLIENT_SECRET' \
        --test
"

if [ $? -eq 0 ]; then
    echo "✅ iMac test successful!"
else
    echo "❌ iMac test failed. Check logs on iMac."
    exit 1
fi

# Step 6: Launch full processing
echo ""
echo "🚀 Step 6: Launching full 3-machine processing..."

# Launch Mac Pro (rows 0-375,000)
echo "🖥️  Launching Mac Pro processing (rows 0-375,000)..."
ssh "$USERNAME@$MAC_PRO_IP" "
    cd ~
    nohup python3 spotify_metadata_fetcher.py \
        --input data3_enriched.csv \
        --start 0 \
        --end 375000 \
        --output data3.5_spotify_extras_macpro.csv \
        --client-id '$CLIENT_ID' \
        --client-secret '$CLIENT_SECRET' > macpro_spotify.log 2>&1 &
    echo 'Mac Pro processing started (PID: $!)'
"

# Launch Mac Studio (rows 375,001-750,000)
echo "💻 Launching Mac Studio processing (rows 375,001-750,000)..."
nohup python3 spotify_metadata_fetcher.py \
    --input data3_enriched.csv \
    --start 375001 \
    --end 750000 \
    --output data3.5_spotify_extras_studio.csv \
    --client-id "$CLIENT_ID" \
    --client-secret "$CLIENT_SECRET" > studio_spotify.log 2>&1 &
STUDIO_PID=$!
echo "Mac Studio processing started (PID: $STUDIO_PID)"

# Launch iMac (rows 750,001-end)
echo "🖥️  Launching iMac processing (rows 750,001-end)..."
ssh "$USERNAME@$IMAC_IP" "
    cd ~
    nohup python3 spotify_metadata_fetcher.py \
        --input data3_enriched.csv \
        --start 750001 \
        --output data3.5_spotify_extras_imac.csv \
        --client-id '$CLIENT_ID' \
        --client-secret '$CLIENT_SECRET' > imac_spotify.log 2>&1 &
    echo 'iMac processing started (PID: $!)'
"

echo ""
echo "🎉 ALL MACHINES LAUNCHED!"
echo "=========================="
echo "🖥️  Mac Pro: Processing rows 0-375,000"
echo "💻 Mac Studio: Processing rows 375,001-750,000 (PID: $STUDIO_PID)"
echo "🖥️  iMac: Processing rows 750,001-end"
echo ""
echo "📊 Monitor progress:"
echo "  Mac Pro: ssh $USERNAME@$MAC_PRO_IP 'tail -f ~/macpro_spotify.log'"
echo "  Mac Studio: tail -f studio_spotify.log"
echo "  iMac: ssh $USERNAME@$IMAC_IP 'tail -f ~/imac_spotify.log'"
echo ""
echo "🔮 Next steps:"
echo "1. Monitor logs for progress and errors"
echo "2. Wait for all machines to complete"
echo "3. Merge results: python3 merge_spotify_results.py"
echo ""
echo "⏱️  Estimated completion: 18-40 hours (depending on rate limits)" 