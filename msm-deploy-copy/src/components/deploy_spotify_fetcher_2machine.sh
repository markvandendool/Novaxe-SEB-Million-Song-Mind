#!/bin/bash

echo "🚀 SPOTIFY METADATA FETCHER v3.5 - 2-MACHINE DEPLOYMENT"
echo "========================================================"

# Configuration
MAC_PRO_IP="10.0.0.115"
USERNAME="vandendool"

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

# Step 1: Test Mac Pro connection
echo ""
echo "🧪 Step 1: Testing Mac Pro connection..."
ssh "$USERNAME@$MAC_PRO_IP" "echo '✅ Mac Pro SSH working - $(uname -m) - $(sw_vers -productVersion)'" || {
    echo "❌ Mac Pro SSH failed. Please check connection."
    exit 1
}

# Step 2: Install dependencies on Mac Pro
echo ""
echo "📦 Step 2: Installing dependencies on Mac Pro..."
ssh "$USERNAME@$MAC_PRO_IP" "
    echo 'Installing Python packages on Mac Pro...'
    pip3 install pandas aiohttp asyncio backoff rich
    echo '✅ Mac Pro dependencies installed'
"

# Step 3: Copy script to Mac Pro
echo ""
echo "📁 Step 3: Copying Spotify fetcher script to Mac Pro..."
scp spotify_metadata_fetcher.py "$USERNAME@$MAC_PRO_IP:~/spotify_metadata_fetcher.py"
echo "✅ Script copied to Mac Pro"

# Step 4: Copy input file to Mac Pro
echo ""
echo "📁 Step 4: Copying input file to Mac Pro..."
scp data3_studio_chordonomicon_v2.csv "$USERNAME@$MAC_PRO_IP:~/data3_enriched.csv"
echo "✅ Input file copied to Mac Pro"

# Step 5: Test run on Mac Pro
echo ""
echo "🧪 Step 5: Testing Spotify fetcher on Mac Pro..."
echo "Running test with 10 tracks on Mac Pro..."

ssh "$USERNAME@$MAC_PRO_IP" "
    cd ~
    python3 spotify_metadata_fetcher.py \
        --input data3_enriched.csv \
        --start 0 \
        --end 10 \
        --output data3.5_spotify_extras_macpro_test.csv \
        --client-id '$CLIENT_ID' \
        --client-secret '$CLIENT_SECRET' \
        --test
"

if [ $? -eq 0 ]; then
    echo "✅ Mac Pro test successful!"
else
    echo "❌ Mac Pro test failed. Check logs on Mac Pro."
    exit 1
fi

# Step 6: Launch full processing
echo ""
echo "🚀 Step 6: Launching full 2-machine processing..."

# Launch Mac Pro (rows 0-500,000)
echo "🖥️  Launching Mac Pro processing (rows 0-500,000)..."
ssh "$USERNAME@$MAC_PRO_IP" "
    cd ~
    nohup python3 spotify_metadata_fetcher.py \
        --input data3_enriched.csv \
        --start 0 \
        --end 500000 \
        --output data3.5_spotify_extras_macpro.csv \
        --client-id '$CLIENT_ID' \
        --client-secret '$CLIENT_SECRET' > macpro_spotify.log 2>&1 &
    echo 'Mac Pro processing started (PID: $!)'
"

# Launch Mac Studio (rows 500,001-end)
echo "💻 Launching Mac Studio processing (rows 500,001-end)..."
nohup python3 spotify_metadata_fetcher.py \
    --input data3_studio_chordonomicon_v2.csv \
    --start 500001 \
    --output data3.5_spotify_extras_studio.csv \
    --client-id "$CLIENT_ID" \
    --client-secret "$CLIENT_SECRET" > studio_spotify.log 2>&1 &
STUDIO_PID=$!
echo "Mac Studio processing started (PID: $STUDIO_PID)"

echo ""
echo "🎉 2-MACHINE PROCESSING LAUNCHED!"
echo "================================"
echo "🖥️  Mac Pro: Processing rows 0-500,000"
echo "💻 Mac Studio: Processing rows 500,001-end (PID: $STUDIO_PID)"
echo ""
echo "📊 Monitor progress:"
echo "  Mac Pro: ssh $USERNAME@$MAC_PRO_IP 'tail -f ~/macpro_spotify.log'"
echo "  Mac Studio: tail -f studio_spotify.log"
echo ""
echo "🔮 Next steps:"
echo "1. Monitor logs for progress and errors"
echo "2. Wait for both machines to complete"
echo "3. Merge results: python3 merge_spotify_results_2machine.py"
echo ""
echo "⏱️  Estimated completion: 20-30 hours (depending on rate limits)" 