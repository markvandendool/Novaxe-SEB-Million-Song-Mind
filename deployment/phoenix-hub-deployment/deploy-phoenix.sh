#!/usr/bin/env bash
set -euo pipefail

# 🔥 NOVAXE PHOENIX HUB DEPLOYMENT SCRIPT
# Deploy the Phoenix Hub system to Vercel permanently

echo "🔥 DEPLOYING NOVAXE PHOENIX HUB SYSTEM..."

cd "/Users/markvandendool/Novaxe-SEB-Million-Song-Mind/deployment/phoenix-hub-deployment"

# Verify files exist
if [[ ! -f "index.html" ]]; then
    echo "❌ ERROR: index.html not found!"
    exit 1
fi

if [[ ! -f "STAGING_HUB.html" ]]; then
    echo "❌ ERROR: STAGING_HUB.html not found!"
    exit 1
fi

if [[ ! -f "PROFESSIONAL_HUB.html" ]]; then
    echo "❌ ERROR: PROFESSIONAL_HUB.html not found!"
    exit 1
fi

echo "✅ All Phoenix files verified"

# Check if vercel is installed
if ! command -v vercel >/dev/null 2>&1; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "🚀 Deploying to Vercel..."

# Deploy with specific project name
vercel --prod --name "novaxe-phoenix-hubs" --confirm

echo "🎉 DEPLOYMENT COMPLETE!"
echo "🔥 PHOENIX HUB SYSTEM IS LIVE!"

# Display deployment info
echo ""
echo "📍 Access your Phoenix Hubs at:"
echo "🔵 Staging Hub: [Your-Vercel-URL]/STAGING_HUB.html"
echo "🟣 Professional Hub: [Your-Vercel-URL]/PROFESSIONAL_HUB.html" 
echo "🚀 Ultimate Mobile: [Your-Vercel-URL]/ULTIMATE_MOBILE_STAGING.html"
echo ""
echo "✨ The Phoenix has risen and is permanently deployed! ✨"
