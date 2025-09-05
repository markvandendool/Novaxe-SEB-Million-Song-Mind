#!/bin/bash
# Christian's Complete Developer Package Setup Script
# Industry Standard Automated Environment Setup

set -e  # Exit on any error

echo "🚀 CHRISTIAN'S DEVELOPER PACKAGE SETUP"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
print_status "Checking prerequisites..."

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js found: $NODE_VERSION"
    
    # Check if version is 18 or higher
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | cut -d'v' -f2)
    if [ "$MAJOR_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ required. Please upgrade."
        exit 1
    fi
else
    print_error "Node.js not found. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check Python
if command -v python &> /dev/null; then
    PYTHON_VERSION=$(python --version)
    print_success "Python found: $PYTHON_VERSION"
elif command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    print_success "Python3 found: $PYTHON_VERSION"
else
    print_error "Python not found. Please install Python 3.6+"
    exit 1
fi

# Check curl
if command -v curl &> /dev/null; then
    print_success "curl found"
else
    print_error "curl not found. Please install curl for health checks"
    exit 1
fi

print_success "All prerequisites met!"

# Create package.json for easy dependency management
print_status "Creating package.json..."
cat > package.json << EOF
{
  "name": "christian-developer-package",
  "version": "1.0.0",
  "description": "Christian's Complete NOVAXE Developer Package",
  "main": "index.js",
  "scripts": {
    "dev": "python -m http.server 8000",
    "start": "python -m http.server 8000",
    "health-check": "./tools/health-check.sh",
    "build": "./tools/build-all.sh",
    "test": "./tools/test-runner.sh",
    "deploy": "./tools/deploy.sh",
    "start:chordcubes": "cd apps/chordcubes && python -m http.server 3001",
    "start:msm": "cd apps/million-song-mind && python -m http.server 3000",
    "setup": "./tools/setup.sh"
  },
  "keywords": [
    "novaxe",
    "chordcubes", 
    "million-song-mind",
    "harmonic-oracle",
    "music-theory"
  ],
  "author": "NOVAXE Team",
  "license": "MIT"
}
EOF

print_success "package.json created!"

# Verify production systems are accessible
print_status "Verifying production systems..."

if curl -f -s -I https://millionsongmind.com > /dev/null; then
    print_success "millionsongmind.com is accessible"
else
    print_warning "millionsongmind.com may be down or inaccessible"
fi

if curl -f -s -I https://millionsongmind.com/cubes/ > /dev/null; then
    print_success "ChordCubes production system accessible"
    
    # Check bundle size
    BUNDLE_SIZE=$(curl -f -s https://millionsongmind.com/cubes/main.js | wc -c | tr -d ' ')
    if [ "$BUNDLE_SIZE" -eq 480140 ]; then
        print_success "ChordCubes bundle size verified: 480,140 bytes"
    else
        print_warning "ChordCubes bundle size unexpected: $BUNDLE_SIZE bytes (expected 480,140)"
    fi
else
    print_warning "ChordCubes production system may be inaccessible"
fi

if curl -f -s -I https://millionsongmind.com/MSM/ > /dev/null; then
    print_success "MSM React production system accessible"
else
    print_warning "MSM React production system may be inaccessible"
fi

# Set up directory permissions
print_status "Setting up directory permissions..."
chmod +x tools/*.sh 2>/dev/null || true
print_success "Directory permissions set!"

# Create initial test file
print_status "Creating test environment..."
mkdir -p data/sample-data3-files
cat > data/sample-data3-files/test-data.csv << EOF
id,chords,key,roman_numerals,harmonic_fingerprint,I,ii,iii,IV,V,vi,viiº,I7,iiiø,II(7),#ivø,III(7),#vº,VI(7),#iº,VII(7),#iiº,V(7),viiº,i,iiø,bIII,iv,v,bVI,bVII,V(b9),Other
1,"C Am F G","C major","I vi IV V","C-Am-F-G","12,8,2,2,0","0,0,0,0,0","0,0,0,0,0","8,6,1,1,0","10,7,2,1,0","8,5,2,1,0","0,0,0,0,0","0,0,0,0,0","0,0,0,0,0","0,0,0,0,0","0,0,0,0,0","0,0,0,0,0","0,0,0,0,0","0,0,0,0,0","0,0,0,0,0","0,0,0,0,0","0,0,0,0,0","0,0,0,0,0","0,0,0,0,0","0,0,0,0,0","0,0,0,0,0","0,0,0,0,0","0,0,0,0,0","0,0,0,0,0","0,0,0,0,0","0,0,0,0,0","0,0,0,0,0","0,0,0,0,0"
2,"Am F C G","A minor","i bVI bIII bVII","Am-F-C-G","0,0,0,0,0","0,0,0,0,0","0,0,0,0,0","0,0,0,0,0","0,0,0,0,0","0,0,0,0,0","0,0,0,0,0","0,0,0,0,0","0,0,0,0,0","0,0,0,0,0","0,0,0,0,0","0,0,0,0,0","0,0,0,0,0","0,0,0,0,0","0,0,0,0,0","0,0,0,0,0","0,0,0,0,0","0,0,0,0,0","0,0,0,0,0","10,7,2,1,0","0,0,0,0,0","6,4,1,1,0","0,0,0,0,0","0,0,0,0,0","8,6,1,1,0","12,9,2,1,0","0,0,0,0,0","0,0,0,0,0"
EOF

print_success "Sample Data3 CSV created!"

# Display next steps
echo ""
echo "🎉 SETUP COMPLETE! 🎉"
echo "===================="
echo ""
echo "Next Steps:"
echo "1. Start development server:"
echo "   npm run dev"
echo ""  
echo "2. Open in browser:"
echo "   http://localhost:8000/"
echo ""
echo "3. Test applications:"
echo "   - ChordCubes: http://localhost:8000/apps/chordcubes/"
echo "   - MSM React:  http://localhost:8000/apps/msm/"
echo ""
echo "4. Run health check:"
echo "   npm run health-check"
echo ""
echo "5. Read documentation:"
echo "   - README.md (this directory)"
echo "   - docs/QUICK_START_GUIDE.md"
echo "   - docs/ARCHITECTURE.md"
echo ""
print_success "Christian's Developer Package is ready! 🚀"
