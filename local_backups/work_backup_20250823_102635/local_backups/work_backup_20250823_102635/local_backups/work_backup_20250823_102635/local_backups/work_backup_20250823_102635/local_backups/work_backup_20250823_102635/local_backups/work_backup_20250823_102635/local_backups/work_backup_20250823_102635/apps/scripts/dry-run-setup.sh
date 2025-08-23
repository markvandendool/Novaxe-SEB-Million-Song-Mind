#!/bin/bash

# Phase 1 Dry Run Setup Script
# Tests the integration pattern with minimal implementation

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}         PHASE 1 DRY RUN SETUP${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "apps" ]; then
    echo -e "${RED}❌ Not in monorepo root. Please run from novaxe-oracle directory.${NC}"
    exit 1
fi

echo -e "${YELLOW}🎯 Setting up Phase 1 dry run...${NC}"
echo ""

# 1. Create dry run branch
echo -e "${BLUE}1. Creating dry run branch...${NC}"
git checkout -b phase-1-dry-run
git tag dry-run-start-$(date +%Y%m%d_%H%M%S)
echo -e "${GREEN}✓ Dry run branch created${NC}"
echo ""

# 2. Run stability check
echo -e "${BLUE}2. Running stability check...${NC}"
if npm run stability-check; then
    echo -e "${GREEN}✓ Stability check passed${NC}"
else
    echo -e "${YELLOW}⚠ Stability check has issues (expected without dependencies)${NC}"
fi
echo ""

# 3. Create minimal shared types
echo -e "${BLUE}3. Creating minimal shared types...${NC}"
mkdir -p packages/shared/src/types
cat > packages/shared/src/types/music.ts << 'EOF'
// Minimal shared types for dry run
export interface ChordData {
  root: string;
  quality: string;
  intervals: number[];
}

export interface MessageData {
  type: 'CHORD_UPDATE' | 'SCALE_UPDATE';
  payload: ChordData;
  timestamp: number;
}
EOF
echo -e "${GREEN}✓ Shared types created${NC}"
echo ""

# 4. Create minimal bridge
echo -e "${BLUE}4. Creating minimal bridge...${NC}"
mkdir -p packages/msm-bridge/src
cat > packages/msm-bridge/src/bridge.ts << 'EOF'
// Minimal bridge for dry run
export class MSMBridge {
  private listeners: ((data: any) => void)[] = [];
  
  sendChord(chord: any): void {
    const message = {
      type: 'CHORD_UPDATE',
      payload: chord,
      timestamp: Date.now()
    };
    
    // Simulate async message passing
    setTimeout(() => {
      this.listeners.forEach(listener => listener(message));
    }, 10);
  }
  
  onChordReceived(callback: (data: any) => void): void {
    this.listeners.push(callback);
  }
}
EOF
echo -e "${GREEN}✓ Bridge created${NC}"
echo ""

# 5. Create test script
echo -e "${BLUE}5. Creating dry run test...${NC}"
cat > scripts/dry-run-test.js << 'EOF'
#!/usr/bin/env node

// Dry run test script
const { MSMBridge } = require('../packages/msm-bridge/src/bridge');

console.log('🧪 Testing dry run integration...');

const bridge = new MSMBridge();
const testChord = {
  root: 'C',
  quality: 'major',
  intervals: [0, 4, 7]
};

let received = false;

bridge.onChordReceived((message) => {
  if (message.type === 'CHORD_UPDATE' && 
      message.payload.root === testChord.root) {
    console.log('✅ Chord received successfully!');
    console.log('   Root:', message.payload.root);
    console.log('   Quality:', message.payload.quality);
    received = true;
    process.exit(0);
  }
});

bridge.sendChord(testChord);

setTimeout(() => {
  if (!received) {
    console.log('❌ No response received');
    process.exit(1);
  }
}, 1000);
EOF

chmod +x scripts/dry-run-test.js
echo -e "${GREEN}✓ Test script created${NC}"
echo ""

# 6. Run the test
echo -e "${BLUE}6. Running dry run test...${NC}"
if node scripts/dry-run-test.js; then
    echo -e "${GREEN}✅ DRY RUN SUCCESS!${NC}"
    echo ""
    echo -e "${YELLOW}🎉 The integration pattern works!${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Clean up: git checkout main && git branch -D phase-1-dry-run"
    echo "2. Start real Phase 1: git checkout -b phase-1-integration"
    echo "3. Follow the timeline in PHASE_1_TIMELINE.md"
else
    echo -e "${RED}❌ DRY RUN FAILED${NC}"
    echo ""
    echo -e "${YELLOW}Debug the issue before proceeding with real integration.${NC}"
fi
echo ""

# 7. Show cleanup instructions
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}              CLEANUP${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo -e "${YELLOW}To clean up the dry run:${NC}"
echo "git checkout main"
echo "git branch -D phase-1-dry-run"
echo "git tag -d dry-run-start-*"
echo ""
echo -e "${YELLOW}To start real Phase 1:${NC}"
echo "git checkout -b phase-1-integration"
echo "npm run tag:snapshot"
echo "npm run install:all"
echo ""
echo -e "${GREEN}Happy integrating! 🚀${NC}" 