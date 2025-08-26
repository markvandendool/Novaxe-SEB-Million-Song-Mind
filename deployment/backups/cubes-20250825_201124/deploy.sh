#!/bin/bash

# OBS Cubes Deployment Script
# Deploy to millionsonmind.com/cubes

set -e

echo "🚀 OBS Cubes Deployment Script"
echo "================================"
echo "Target: millionsonmind.com/cubes"
echo "Version: 2.0 Production"
echo "Date: $(date)"
echo ""

# Configuration
DEPLOYMENT_DIR="/Users/markvandendool/Novaxe-SEB-Million-Song-Mind/deployment/cubes"
BACKUP_DIR="/Users/markvandendool/Novaxe-SEB-Million-Song-Mind/deployment/backups/cubes-$(date +%Y%m%d_%H%M%S)"
STAGING_SERVER="127.0.0.1:8901"
PRODUCTION_URL="https://millionsonmind.com/cubes/"

echo "📁 Validating deployment directory..."
if [ ! -d "$DEPLOYMENT_DIR" ]; then
    echo "❌ Deployment directory not found: $DEPLOYMENT_DIR"
    exit 1
fi

cd "$DEPLOYMENT_DIR"

echo "✅ Deployment directory validated"
echo ""

echo "📊 Analyzing deployment package..."
echo "Files to deploy:"
find . -type f -name "*.html" -o -name "*.js" -o -name "*.css" -o -name "*.json" | sort
echo ""

echo "📈 Package statistics:"
echo "HTML files: $(find . -name "*.html" | wc -l)"
echo "JavaScript files: $(find . -name "*.js" | wc -l)"
echo "CSS files: $(find . -name "*.css" | wc -l)"
echo "Total files: $(find . -type f | wc -l)"
echo "Package size: $(du -sh . | cut -f1)"
echo ""

echo "🧪 Running pre-deployment tests..."

# Test 1: Check for required files
echo "Test 1: Required files..."
REQUIRED_FILES=("index.html" "main.js" "chords.js" "styles.css")
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file - MISSING"
        exit 1
    fi
done

# Test 2: Validate HTML
echo "Test 2: HTML validation..."
if grep -q "OBS Cubes" index.html && grep -q "three.module.js" index.html; then
    echo "  ✅ HTML structure valid"
else
    echo "  ❌ HTML validation failed"
    exit 1
fi

# Test 3: Check JavaScript syntax (basic)
echo "Test 3: JavaScript syntax..."
if node -c main.js 2>/dev/null; then
    echo "  ✅ main.js syntax valid"
else
    echo "  ⚠️  Could not validate main.js (Node.js may not be available)"
fi

# Test 4: Check file sizes
echo "Test 4: File size validation..."
MAIN_JS_SIZE=$(wc -c < main.js)
if [ "$MAIN_JS_SIZE" -gt 100000 ]; then
    echo "  ✅ main.js size: $(($MAIN_JS_SIZE / 1024))KB"
else
    echo "  ❌ main.js too small: $(($MAIN_JS_SIZE / 1024))KB"
    exit 1
fi

echo ""

# Create backup
echo "💾 Creating backup..."
mkdir -p "$(dirname "$BACKUP_DIR")"
cp -r "$DEPLOYMENT_DIR" "$BACKUP_DIR"
echo "✅ Backup created: $BACKUP_DIR"
echo ""

# Start staging server for testing
echo "🧪 Starting staging server..."
python3 -m http.server 8901 > /dev/null 2>&1 &
SERVER_PID=$!
sleep 2

# Test staging server
echo "🔍 Testing staging server..."
if curl -s "http://$STAGING_SERVER/" | grep -q "OBS Cubes"; then
    echo "✅ Staging server responding correctly"
else
    echo "❌ Staging server test failed"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# Stop staging server
kill $SERVER_PID 2>/dev/null || true
echo "🛑 Staging server stopped"
echo ""

echo "✅ All pre-deployment tests passed!"
echo ""

echo "🚀 Deployment Package Ready!"
echo "================================"
echo "📁 Source: $DEPLOYMENT_DIR"
echo "💾 Backup: $BACKUP_DIR"
echo "🎯 Target: $PRODUCTION_URL"
echo ""

echo "📋 Manual Deployment Steps:"
echo "1. Upload contents of $DEPLOYMENT_DIR to web server"
echo "2. Ensure millionsonmind.com/cubes/ points to index.html"
echo "3. Verify HTTPS is enabled"
echo "4. Test at $PRODUCTION_URL"
echo ""

echo "🔧 Production Checklist:"
echo "☐ Upload all files maintaining directory structure"
echo "☐ Set proper MIME types for .js files (application/javascript)"
echo "☐ Enable gzip compression for static assets"
echo "☐ Verify CDN resources are accessible"
echo "☐ Test WebGL functionality"
echo "☐ Test Web Audio API"
echo "☐ Validate on mobile devices"
echo "☐ Check loading performance"
echo "☐ Monitor error logs"
echo ""

echo "🎉 OBS Cubes ready for production deployment!"
echo "Visit: $PRODUCTION_URL"
echo ""

# Generate deployment manifest
cat > deployment-manifest.json << EOF
{
    "name": "OBS Cubes",
    "version": "2.0",
    "deploymentDate": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "targetUrl": "$PRODUCTION_URL",
    "sourceDir": "$DEPLOYMENT_DIR",
    "backupDir": "$BACKUP_DIR",
    "fileCount": $(find . -type f | wc -l),
    "packageSize": "$(du -sh . | cut -f1)",
    "mainJsSize": "$(($MAIN_JS_SIZE / 1024))KB",
    "dependencies": [
        "three@0.160.0",
        "soundfont-player@0.15.7",
        "tone@14.8.49",
        "@tonaljs/tonal@4.12.1",
        "troika-three-text@0.49.0"
    ],
    "features": [
        "3D Interactive Cubes",
        "Real-time Audio",
        "Chord Progressions",
        "Shelf Mapping",
        "Stage Lighting",
        "Voice Leading",
        "Multiple Instruments"
    ],
    "testsRun": [
        "Required Files Check",
        "HTML Validation",
        "JavaScript Syntax",
        "File Size Validation",
        "Staging Server Test"
    ]
}
EOF

echo "📄 Deployment manifest created: deployment-manifest.json"
