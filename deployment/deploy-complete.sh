#!/bin/bash

# Million Song Mind Complete Deployment Script
# Prepares all 4 applications for millionsongmind.com deployment

echo "🚀 PREPARING MILLION SONG MIND COMPLETE DEPLOYMENT 🚀"
echo "======================================================="

DEPLOYMENT_DIR="/Users/markvandendool/Novaxe-SEB-Million-Song-Mind/deployment/production-ready"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DEPLOYMENT_PACKAGE="millionsongmind-complete-${TIMESTAMP}.tar.gz"

echo "📂 Deployment Directory: $DEPLOYMENT_DIR"
echo "📦 Creating deployment package: $DEPLOYMENT_PACKAGE"
echo ""

# Verify deployment directory exists and has content
if [ ! -d "$DEPLOYMENT_DIR" ]; then
    echo "❌ ERROR: Deployment directory not found!"
    exit 1
fi

# Create deployment package
echo "📦 Creating deployment package..."
cd /Users/markvandendool/Novaxe-SEB-Million-Song-Mind/deployment
tar -czf "$DEPLOYMENT_PACKAGE" -C production-ready .

echo "✅ Deployment package created: $(du -h $DEPLOYMENT_PACKAGE | cut -f1)"
echo ""

echo "📋 DEPLOYMENT STRUCTURE:"
echo "========================"
echo "millionsongmind.com/          → Million Song Mind (React Analytics)"
echo "millionsongmind.com/cubes/    → ChordCubes (Three.js)"
echo "millionsongmind.com/obsidian/ → ObsidianNVX (Angular - Staging)"
echo "millionsongmind.com/unity     → Unity Landing Page"
echo ""

echo "🌐 NEXT STEPS FOR DOMAIN DEPLOYMENT:"
echo "===================================="
echo "1. Upload $DEPLOYMENT_PACKAGE to your hosting provider"
echo "2. Extract in your domain root directory"
echo "3. Verify vercel.json routing configuration"
echo "4. Test all applications at their respective URLs"
echo ""

echo "✨ DEPLOYMENT READY FOR MILLIONSONGMIND.COM ✨"
