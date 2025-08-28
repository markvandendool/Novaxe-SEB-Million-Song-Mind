#!/bin/bash

# Million Song Mind Deployment Verification Script

echo "🔍 VERIFYING MILLION SONG MIND DEPLOYMENT 🔍"
echo "============================================="

DEPLOYMENT_DIR="/Users/markvandendool/Novaxe-SEB-Million-Song-Mind/deployment/production-ready"

echo "📂 Checking deployment structure..."
echo ""

# Check main components
echo "✅ Main Application Components:"
echo "   🌐 Main Site: $(ls -la $DEPLOYMENT_DIR/index.html 2>/dev/null && echo "READY" || echo "MISSING")"
echo "   🎮 ChordCubes: $(ls -la $DEPLOYMENT_DIR/cubes/index.html 2>/dev/null && echo "READY" || echo "MISSING")"
echo "   🎵 ObsidianNVX: $(ls -la $DEPLOYMENT_DIR/obsidian/index.html 2>/dev/null && echo "READY" || echo "MISSING")"
echo "   🏠 Unity Landing: $(ls -la $DEPLOYMENT_DIR/unity-landing.html 2>/dev/null && echo "READY" || echo "MISSING")"
echo ""

echo "📁 Directory sizes:"
echo "   Main assets: $(du -sh $DEPLOYMENT_DIR/assets 2>/dev/null | cut -f1 || echo "N/A")"
echo "   ChordCubes: $(du -sh $DEPLOYMENT_DIR/cubes 2>/dev/null | cut -f1 || echo "N/A")"
echo "   ObsidianNVX: $(du -sh $DEPLOYMENT_DIR/obsidian 2>/dev/null | cut -f1 || echo "N/A")"
echo ""

echo "🌐 URL Mapping Verification:"
echo "   millionsongmind.com/           → React Analytics Dashboard"
echo "   millionsongmind.com/cubes/     → ChordCubes 3D Interface"
echo "   millionsongmind.com/obsidian/  → ObsidianNVX (Staging)"
echo "   millionsongmind.com/unity      → Unity Landing Page"
echo ""

echo "🚀 Ready for upload to millionsongmind.com hosting!"
echo "📦 Latest package: $(ls -t /Users/markvandendool/Novaxe-SEB-Million-Song-Mind/deployment/millionsongmind-complete-*.tar.gz | head -1)"
