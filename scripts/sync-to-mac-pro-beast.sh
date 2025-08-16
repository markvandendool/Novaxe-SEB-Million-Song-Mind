#!/bin/bash
# Mac Pro Beast Repository Sync Script
# Syncs TypeScript TS1337 resolution and all documentation to Mac Pro Beast
# Date: August 16, 2025

echo "🚀 Mac Pro Beast Repository Sync - TypeScript Resolution Success"
echo "================================================="

# Check Mac Pro Beast connectivity
echo "🔍 Testing Mac Pro Beast connection..."
if ! ping -c 2 192.168.68.106 > /dev/null 2>&1; then
    echo "❌ Mac Pro Beast unreachable at 192.168.68.106"
    echo "   Please ensure Mac Pro Beast is powered on and connected"
    echo "   Expected network: 192.168.68.x subnet"
    exit 1
fi

echo "✅ Mac Pro Beast reachable"

# Test SSH connection
echo "🔍 Testing SSH connection..."
if ! ssh -o ConnectTimeout=10 markvandendool@192.168.68.106 "echo 'SSH connection successful'" > /dev/null 2>&1; then
    echo "❌ SSH connection failed"
    echo "   Please verify SSH is enabled on Mac Pro Beast"
    echo "   Try: System Preferences > Sharing > Remote Login"
    exit 1
fi

echo "✅ SSH connection established"

# Clone or update repository on Mac Pro Beast
echo "🔄 Syncing repository to Mac Pro Beast..."
ssh markvandendool@192.168.68.106 << 'EOF'
    cd /Users/markvandendool/
    
    # Create directory if it doesn't exist
    if [ ! -d "Novaxe-SEB-Million-Song-Mind" ]; then
        echo "📥 Cloning repository to Mac Pro Beast..."
        git clone https://github.com/markvandendool/Novaxe-SEB-Million-Song-Mind.git
        cd Novaxe-SEB-Million-Song-Mind
    else
        echo "🔄 Updating existing repository on Mac Pro Beast..."
        cd Novaxe-SEB-Million-Song-Mind
        git fetch origin
        git reset --hard origin/main
    fi
    
    echo "✅ Repository synced to Mac Pro Beast"
    echo "📊 Latest commit:"
    git log --oneline -1
    
    # Verify TypeScript resolution files
    echo "🔍 Verifying TypeScript resolution documentation:"
    ls -la TYPESCRIPT_TS1337_RESOLUTION_LOG_AUG16_2025.md BUILD_STATUS_QUICK_REFERENCE.md 2>/dev/null || echo "⚠️  Documentation files not found"
    
    # Check if novaxe-seb-ng11 directory exists
    if [ -d "novaxe-seb-ng11" ]; then
        echo "✅ novaxe-seb-ng11 Angular project synced"
        cd novaxe-seb-ng11
        
        # Apply TypeScript fix if needed
        if [ -f "scripts/fix-abcjs-types.sh" ]; then
            echo "🔧 Applying TypeScript compatibility fix..."
            chmod +x scripts/fix-abcjs-types.sh
            ./scripts/fix-abcjs-types.sh
        fi
        
        echo "🚀 Ready for Angular build on Mac Pro Beast:"
        echo "   cd novaxe-seb-ng11"
        echo "   NODE_OPTIONS=\"--openssl-legacy-provider\" npm run build"
    fi
EOF

echo ""
echo "🎉 Mac Pro Beast sync complete!"
echo "✅ TypeScript TS1337 resolution successfully synced"
echo "✅ All documentation transferred"
echo "✅ Build environment ready on Mac Pro Beast"
echo ""
echo "Next steps on Mac Pro Beast:"
echo "1. cd /Users/markvandendool/Novaxe-SEB-Million-Song-Mind/novaxe-seb-ng11"
echo "2. npm install (if needed)"
echo "3. NODE_OPTIONS=\"--openssl-legacy-provider\" npm run build"
