#!/bin/bash

echo "🤖 LAUNCHING AUTO-STITCH TRI-SYSTEM MONITOR"
echo "=============================================="
echo ""
echo "📊 This script will:"
echo "  1. Monitor iMac Spotify progress"
echo "  2. Auto-merge all datasets when complete"
echo "  3. Create final data3_complete_tri_system.csv"
echo ""
echo "🚀 Starting automated monitoring..."

# Make script executable
chmod +x auto_stitch_tri_system.py

# Launch the auto-stitch monitor
python3 auto_stitch_tri_system.py

echo ""
echo "✅ Auto-stitch monitor completed!" 