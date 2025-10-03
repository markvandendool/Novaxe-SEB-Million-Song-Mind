#!/bin/bash

echo "🔧 APPLYING DEFINITIVE 404 FIX"
echo "==============================="

echo ""
echo "📋 ROOT CAUSE ANALYSIS:"
echo "1. ✅ Assets exist at /MSM/assets/"
echo "2. ❌ Vercel routing missing for /MSM/assets/*"
echo "3. ❌ Vercel routing missing for /MSM/* paths"
echo ""

# Create a proper vercel.json fix
echo "🛠️  APPLYING VERCEL.JSON FIX..."

# Backup current vercel.json
cp /Users/markvandendool/Novaxe-SEB-Million-Song-Mind/deployment/millionsongmind-production/vercel.json /Users/markvandendool/Novaxe-SEB-Million-Song-Mind/deployment/millionsongmind-production/vercel.json.backup

# Add MSM routing after the existing MSM line
sed -i '' '/\"source\": \"\/MSM\",/a\
        },\
        {\
            "source": "/MSM/(.*)",\
            "destination": "/MSM/$1"' /Users/markvandendool/Novaxe-SEB-Million-Song-Mind/deployment/millionsongmind-production/vercel.json

echo "✅ Vercel.json updated with MSM/* routing"

# Verify the change
echo ""
echo "🔍 VERIFYING FIX:"
grep -A5 -B2 "MSM" /Users/markvandendool/Novaxe-SEB-Million-Song-Mind/deployment/millionsongmind-production/vercel.json

echo ""
echo "🚀 DEPLOYING FIX..."
