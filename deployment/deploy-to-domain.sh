#!/bin/bash

# OBS Cubes Domain Deployment Script
# Target: millionsongmind.com/cubes

echo "🚀 DEPLOYING OBS CUBES TO MILLIONSONGMIND.COM/CUBES 🚀"
echo "======================================================="

DEPLOYMENT_PACKAGE="obs-cubes-FINAL-DEPLOYMENT-20250825.tar.gz"
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

echo "📋 UPLOAD CHECKLIST:"
echo "□ main.js (165KB) - Core Three.js engine"
echo "□ index.html - SEO-optimized entry point"
echo "□ chords.js - Musical intelligence"
echo "□ styles.css - Visual styling"
echo "□ All 23 production files"
echo ""

echo "🌐 After upload, your OBS Cubes will be live at:"
echo "https://$TARGET_DOMAIN$TARGET_PATH/"
echo ""

# Create a validation URL for testing
echo "🔍 TEST URL: https://$TARGET_DOMAIN$TARGET_PATH/"
echo "Expected: Sophisticated Three.js chord visualization with interactive 3D cubes"
echo ""

echo "✅ DEPLOYMENT PREPARATION COMPLETE!"
echo "Ready for upload to $TARGET_DOMAIN$TARGET_PATH"
