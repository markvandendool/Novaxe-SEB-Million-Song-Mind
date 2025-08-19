#!/bin/bash

echo "🚀 VIPER ULTIMATE UNIFIED v3.0 - TRUE HUV + SPOTIFY METADATA DEPLOYMENT"
echo "========================================================================"
echo "🎵 Mac Pro & Mac Studio: TRUE HUV analysis only"
echo "🎵 iMac: Spotify metadata fetching ONLY (no musical analysis)"
echo "========================================================================"

# Configuration
MAC_PRO_IP="10.0.0.115"
IMAC_IP="10.0.0.66"
MAC_PRO_USER="vandendool"
IMAC_USER="Worker3"

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
            ssh "$MAC_PRO_USER@$MAC_PRO_IP" "echo '✅ Mac Pro SSH working - $(uname -m) - $(sw_vers -productVersion)'" || {
                echo "❌ Mac Pro SSH failed. Please check connection."
                exit 1
            }

            # Step 2: Install dependencies on Mac Pro
            echo ""
            echo "📦 Step 2: Installing dependencies on Mac Pro..."
            ssh "$MAC_PRO_USER@$MAC_PRO_IP" "
                echo 'Installing Python packages on Mac Pro...'
                pip3 install pandas aiohttp asyncio backoff rich
                echo '✅ Mac Pro dependencies installed'
            "

            # Step 3: Copy unified script to Mac Pro
            echo ""
            echo "📁 Step 3: Copying unified VIPER script to Mac Pro..."
            scp VIPER_ULTIMATE_UNIFIED.py "$MAC_PRO_USER@$MAC_PRO_IP:~/VIPER_ULTIMATE_UNIFIED.py"
            echo "✅ Script copied to Mac Pro"

            # Step 4: Copy input file to Mac Pro
            echo ""
            echo "📁 Step 4: Copying input file to Mac Pro..."
            scp data3_studio_chordonomicon_v2.csv "$MAC_PRO_USER@$MAC_PRO_IP:~/chordonomicon_v2.csv"
            echo "✅ Input file copied to Mac Pro"

# Step 5: Test run on Mac Pro
echo ""
echo "🧪 Step 5: Testing unified VIPER on Mac Pro..."
echo "Running test with 10 tracks on Mac Pro..."

ssh "$MAC_PRO_USER@$MAC_PRO_IP" "
    cd ~
    python3 VIPER_ULTIMATE_UNIFIED.py \
        --input chordonomicon_v2.csv \
        --client-id '$CLIENT_ID' \
        --client-secret '$CLIENT_SECRET' \
        --spotify
"

if [ $? -eq 0 ]; then
    echo "✅ Mac Pro test successful!"
else
    echo "❌ Mac Pro test failed. Check logs on Mac Pro."
    exit 1
fi

# Step 6: Launch full 3-machine processing
echo ""
echo "🚀 Step 6: Launching full 3-machine unified processing..."

# Launch Mac Pro (rows 0-375,000)
echo "🖥️  Launching Mac Pro processing (rows 0-375,000)..."
ssh "$MAC_PRO_USER@$MAC_PRO_IP" "
    cd ~
    nohup python3 VIPER_ULTIMATE_UNIFIED.py \
        --input chordonomicon_v2.csv \
        --client-id '$CLIENT_ID' \
        --client-secret '$CLIENT_SECRET' \
        --spotify > macpro_unified.log 2>&1 &
    echo 'Mac Pro unified processing started (PID: $!)'
"

# Launch Mac Studio (rows 375,001-750,000)
echo "💻 Launching Mac Studio processing (rows 375,001-750,000)..."
nohup python3 VIPER_ULTIMATE_UNIFIED.py \
    --input data3_studio_chordonomicon_v2.csv \
    --client-id "$CLIENT_ID" \
    --client-secret "$CLIENT_SECRET" \
    --spotify > studio_unified.log 2>&1 &
STUDIO_PID=$!
echo "Mac Studio unified processing started (PID: $STUDIO_PID)"

# Launch iMac (ENTIRE dataset for Spotify metadata) - if SSH works
echo "🖥️  Attempting iMac launch (ENTIRE dataset for Spotify metadata)..."
ssh -i ~/imackeys "$IMAC_USER@$IMAC_IP" "echo 'iMac connection test'" 2>/dev/null
if [ $? -eq 0 ]; then
    # Install dependencies on iMac
    ssh -i ~/imackeys "$IMAC_USER@$IMAC_IP" "
        echo 'Installing Python packages on iMac...'
        pip3 install pandas aiohttp asyncio backoff rich
        echo '✅ iMac dependencies installed'
    "
    
    # Copy script to iMac
    scp -i ~/imackeys VIPER_ULTIMATE_UNIFIED.py "$IMAC_USER@$IMAC_IP:~/VIPER_ULTIMATE_UNIFIED.py"
    scp -i ~/imackeys data3_studio_chordonomicon_v2.csv "$IMAC_USER@$IMAC_IP:~/chordonomicon_v2.csv"
    
    # Launch iMac processing (ENTIRE dataset for Spotify metadata)
    ssh -i ~/imackeys "$IMAC_USER@$IMAC_IP" "
        cd ~
        nohup python3 VIPER_ULTIMATE_UNIFIED.py \
            --input chordonomicon_v2.csv \
            --client-id '$CLIENT_ID' \
            --client-secret '$CLIENT_SECRET' \
            --spotify > imac_unified.log 2>&1 &
        echo 'iMac unified processing started (PID: $!)'
    "
    echo "✅ iMac processing launched!"
else
    echo "⚠️  iMac SSH failed - proceeding with 2-machine setup"
fi

echo ""
            echo "🎉 UNIFIED VIPER DEPLOYMENT LAUNCHED!"
            echo "====================================="
            echo "🖥️  Mac Pro: TRUE HUV analysis only (rows 0-375,000)"
            echo "💻 Mac Studio: TRUE HUV analysis only (rows 375,001-750,000) (PID: $STUDIO_PID)"
            if [ $? -eq 0 ]; then
                echo "🖥️  iMac: Spotify metadata ONLY (ENTIRE dataset)"
            else
                echo "⚠️  iMac: Skipped due to SSH issues"
            fi
echo ""
echo "📊 Monitor progress:"
echo "  Mac Pro: ssh $MAC_PRO_USER@$MAC_PRO_IP 'tail -f ~/macpro_unified.log'"
echo "  Mac Studio: tail -f studio_unified.log"
if [ $? -eq 0 ]; then
    echo "  iMac: ssh -i ~/imackeys $IMAC_USER@$IMAC_IP 'tail -f ~/imac_unified.log'"
fi
echo ""
            echo "🔮 What this will create:"
echo "  ✅ data3_macpro_chordonomicon_v2.csv (TRUE HUV fingerprints)"
echo "  ✅ data3_studio_chordonomicon_v2.csv (TRUE HUV fingerprints)"
echo "  ✅ data3.5_spotify_extras_imac.csv (Spotify metadata ONLY - iMac)"
echo ""
echo "⏱️  Estimated completion: 20-40 hours (TRUE HUV + Spotify metadata)"
echo ""
echo "🎵 TRUE HUV FEATURES:"
echo "  ✅ Frequency-optimized extensions list"
echo "  ✅ Single-column, comma-separated format"
echo "  ✅ Early stopping logic (no trailing zeros)"
echo "  ✅ Chroma values commented out (deprecated)" 