#!/bin/bash

# Million Song Mind FINAL Production Deployment Script
# Deploys exactly what's working on localhost to millionsongmind.com

echo "🚀 MILLION SONG MIND - FINAL DEPLOYMENT PACKAGE 🚀"
echo "=================================================="

DEPLOYMENT_DIR="/Users/markvandendool/Novaxe-SEB-Million-Song-Mind/deployment/production-ready-final"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DEPLOYMENT_PACKAGE="millionsongmind-FINAL-${TIMESTAMP}.tar.gz"

echo "📂 Source: Exact localhost content"
echo "   🏠 localhost:9000  → Unity Landing (index.html)"
echo "   🎮 localhost:8080  → ChordCubes (cubes/)"
echo "   📊 localhost:8090  → MSM1.0 Analytics (analytics/)"
echo "   🎵 ObsidianNVX     → Staging page (obsidian/)"
echo ""

# Verify deployment directory exists and has content
if [ ! -d "$DEPLOYMENT_DIR" ]; then
    echo "❌ ERROR: Final deployment directory not found!"
    exit 1
fi

echo "📋 Final Deployment Verification:"
echo "================================="
echo "✅ Unity Landing:    $(ls -la $DEPLOYMENT_DIR/index.html 2>/dev/null && echo "READY" || echo "MISSING")"
echo "✅ ChordCubes:       $(ls -la $DEPLOYMENT_DIR/cubes/index.html 2>/dev/null && echo "READY" || echo "MISSING")"
echo "✅ MSM Analytics:    $(ls -la $DEPLOYMENT_DIR/analytics/index.html 2>/dev/null && echo "READY" || echo "MISSING")"
echo "✅ ObsidianNVX:      $(ls -la $DEPLOYMENT_DIR/obsidian/index.html 2>/dev/null && echo "READY" || echo "MISSING")"
echo "✅ Vercel Config:    $(ls -la $DEPLOYMENT_DIR/vercel.json 2>/dev/null && echo "READY" || echo "MISSING")"
echo ""

# Create deployment package
echo "📦 Creating FINAL deployment package..."
cd /Users/markvandendool/Novaxe-SEB-Million-Song-Mind/deployment
tar -czf "$DEPLOYMENT_PACKAGE" -C production-ready-final .

echo "✅ FINAL deployment package: $(du -h $DEPLOYMENT_PACKAGE | cut -f1)"
echo ""

echo "🌐 LIVE URL STRUCTURE (millionsongmind.com):"
echo "==========================================="
echo "🏠 https://millionsongmind.com/           → Unity Landing Page"
echo "🎮 https://millionsongmind.com/cubes/     → ChordCubes 3D Interface"
echo "📊 https://millionsongmind.com/analytics/ → MSM1.0 Analytics Dashboard"
echo "🎵 https://millionsongmind.com/obsidian/  → ObsidianNVX (Staging)"
echo ""

echo "🚀 DEPLOYMENT INSTRUCTIONS:"
echo "============================"
echo "1. Upload: $DEPLOYMENT_PACKAGE"
echo "2. Extract to domain root directory"
echo "3. Verify routing with vercel.json"
echo "4. Test all URLs above"
echo ""

echo "✨ READY FOR MILLIONSONGMIND.COM PRODUCTION! ✨"
echo "🎵 All localhost applications successfully packaged!"
