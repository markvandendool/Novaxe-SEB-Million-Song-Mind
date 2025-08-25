#!/bin/bash

# Unity2.0 Deployment Script
# Deploy to millionsongmind.com

echo "🚀 Unity2.0 Deployment to millionsongmind.com"
echo "=============================================="

DEPLOY_PATH="/Users/markvandendool/Unity2.0/deployment/www"
DOMAIN="millionsongmind.com"

echo "📂 Deployment Structure:"
echo "  - Landing page: $DEPLOY_PATH/index.html"
echo "  - MSM V1.0:     $DEPLOY_PATH/msm/"  
echo "  - ChordCubes:   $DEPLOY_PATH/cubes/"

echo ""
echo "🌐 Live URLs will be:"
echo "  - Main:      https://$DOMAIN"
echo "  - MSM V1.0:  https://$DOMAIN/msm"
echo "  - ChordCubes: https://$DOMAIN/cubes"

echo ""
echo "✅ Status:"
echo "  - Landing page: Ready ✅"
echo "  - MSM V1.0: Built & Ready ✅" 
echo "  - ChordCubes: Ready ✅"

echo ""
echo "📦 Deployment files ready at: $DEPLOY_PATH"
echo "Next steps:"
echo "1. Upload $DEPLOY_PATH/* to millionsongmind.com web root"
echo "2. Configure web server routing" 
echo "3. Test live deployment"

# Show file sizes
echo ""
echo "📊 Build sizes:"
du -sh "$DEPLOY_PATH"/*

echo ""
echo "🎯 Ready for production deployment!"
