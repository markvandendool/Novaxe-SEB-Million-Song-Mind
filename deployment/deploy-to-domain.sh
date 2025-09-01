#!/bin/bash

# ChordCubes 5.0 Domain Deployment Script  
# Target: millionsongmind.com/cubes

echo "🎼 DEPLOYING CHORDCUBES 5.0 TO MILLIONSONGMIND.COM/CUBES 🎼"
echo "============================================================="

DEPLOYMENT_PACKAGE="chordcubes-5-0-deployment-20250901.tar.gz"
TARGET_DOMAIN="millionsongmind.com"
TARGET_PATH="/cubes"

echo "📦 Deployment Package: $DEPLOYMENT_PACKAGE"
echo "🌐 Target Domain: $TARGET_DOMAIN$TARGET_PATH"
echo ""

# Verify deployment package exists
if [ ! -f "$DEPLOYMENT_PACKAGE" ]; then
    echo "❌ ERROR: Deployment package not found!"
    exit 1
fi

echo "✅ Deployment package verified ($(du -h $DEPLOYMENT_PACKAGE | cut -f1))"

# Extract deployment package for upload preparation
echo "📂 Preparing deployment files..."
mkdir -p domain-upload
cd domain-upload
tar -xzf "../$DEPLOYMENT_PACKAGE"

echo "✅ Files extracted and ready for upload:"
ls -la cubes/ | head -10

echo ""
echo "🎯 DEPLOYMENT INSTRUCTIONS:"
echo "1. Upload the 'cubes' directory to your web server"
echo "2. Place it at: $TARGET_DOMAIN$TARGET_PATH/"
echo "3. Ensure HTTPS is configured"
echo "4. Set proper MIME types for .js files"
echo ""

echo "📋 CHORDCUBES 5.0 UPLOAD CHECKLIST:"
echo "□ main.js (398KB) - Revolutionary Audio Cutoff System"
echo "□ index.html - ChordCubes 5.0 entry point"  
echo "□ chords.js - Advanced musical intelligence"
echo "□ styles.css - Professional styling"
echo "□ fonts/ - Complete font collection"
echo "□ All 22 production files"
echo ""

echo "🌐 After upload, ChordCubes 5.0 will be live at:"
echo "https://$TARGET_DOMAIN$TARGET_PATH/"
echo ""

# Create a validation URL for testing
echo "🔍 TEST URL: https://$TARGET_DOMAIN$TARGET_PATH/"
echo "Expected: ChordCubes 5.0 with instant audio cutoff, clean MELODY/BASSLINE text"
echo ""

echo "✨ NEW IN 5.0:"
echo "• Revolutionary instant audio cutoff system"  
echo "• Manual note tracking with triggerAttack/triggerRelease"
echo "• Clean professional branding (removed 'tnxgod')"
echo "• Enhanced debugging and logging system"
echo ""

echo "✅ CHORDCUBES 5.0 DEPLOYMENT PREPARATION COMPLETE!"
echo "Ready for upload to $TARGET_DOMAIN$TARGET_PATH"
