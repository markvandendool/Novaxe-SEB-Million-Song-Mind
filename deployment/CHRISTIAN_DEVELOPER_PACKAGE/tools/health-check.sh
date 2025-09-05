#!/bin/bash
# Health Check Script for Christian's Developer Package
# Comprehensive system verification and diagnostics

set -e

echo "🏥 NOVAXE ECOSYSTEM HEALTH CHECK"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Function to print colored output
print_test() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

print_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((PASSED++))
}

print_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((FAILED++))
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
    ((WARNINGS++))
}

# Test 1: Production System Accessibility
echo ""
print_test "Testing production system accessibility..."

if curl -f -s -I --max-time 10 https://millionsongmind.com > /dev/null; then
    print_pass "millionsongmind.com is accessible"
else
    print_fail "millionsongmind.com is not accessible"
fi

if curl -f -s -I --max-time 10 https://millionsongmind.com/cubes/ > /dev/null; then
    print_pass "ChordCubes production endpoint accessible"
else
    print_fail "ChordCubes production endpoint not accessible"
fi

if curl -f -s -I --max-time 10 https://millionsongmind.com/MSM/ > /dev/null; then
    print_pass "MSM React production endpoint accessible"
else
    print_fail "MSM React production endpoint not accessible"
fi

# Test 2: Bundle Integrity
echo ""
print_test "Testing production bundle integrity..."

CHORDCUBES_SIZE=$(curl -f -s --max-time 30 https://millionsongmind.com/cubes/main.js | wc -c | tr -d ' ')
if [ "$CHORDCUBES_SIZE" -eq 480140 ]; then
    print_pass "ChordCubes bundle size correct: 480,140 bytes"
else
    if [ "$CHORDCUBES_SIZE" -gt 0 ]; then
        print_warn "ChordCubes bundle size unexpected: $CHORDCUBES_SIZE bytes (expected 480,140)"
    else
        print_fail "ChordCubes bundle could not be downloaded"
    fi
fi

# Check if MSM bundle exists
if curl -f -s --max-time 10 https://millionsongmind.com/MSM/ | grep -q "main-.*\.js"; then
    print_pass "MSM React bundle detected in HTML"
else
    print_fail "MSM React bundle not found in HTML"
fi

# Test 3: Local Environment
echo ""
print_test "Testing local development environment..."

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | cut -d'v' -f2)
    if [ "$MAJOR_VERSION" -ge 18 ]; then
        print_pass "Node.js version adequate: $NODE_VERSION"
    else
        print_fail "Node.js version too old: $NODE_VERSION (need 18+)"
    fi
else
    print_fail "Node.js not found"
fi

# Check Python
if command -v python &> /dev/null; then
    PYTHON_VERSION=$(python --version 2>&1)
    print_pass "Python available: $PYTHON_VERSION"
elif command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version 2>&1)
    print_pass "Python3 available: $PYTHON_VERSION"
else
    print_fail "Python not found"
fi

# Test 4: Package Structure
echo ""
print_test "Testing package structure..."

REQUIRED_DIRS=("apps" "docs" "tools" "data")
for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        print_pass "Directory exists: $dir/"
    else
        print_fail "Missing directory: $dir/"
    fi
done

REQUIRED_FILES=("README.md" "tools/setup.sh" "tools/health-check.sh")
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_pass "File exists: $file"
    else
        print_fail "Missing file: $file"
    fi
done

# Test 5: Sample Data
echo ""
print_test "Testing sample data availability..."

if [ -d "data/sample-data3-files" ]; then
    print_pass "Sample data directory exists"
    
    CSV_COUNT=$(find data/sample-data3-files -name "*.csv" | wc -l | tr -d ' ')
    if [ "$CSV_COUNT" -gt 0 ]; then
        print_pass "Found $CSV_COUNT sample CSV files"
    else
        print_warn "No sample CSV files found"
    fi
else
    print_fail "Sample data directory missing"
fi

# Test 6: Local Server Test (if not already running)
echo ""
print_test "Testing local server capability..."

# Check if port 8000 is available
if ! lsof -i :8000 > /dev/null 2>&1; then
    # Start server in background for test
    python -m http.server 8000 > /dev/null 2>&1 &
    SERVER_PID=$!
    
    sleep 2
    
    if curl -f -s -I --max-time 5 http://localhost:8000 > /dev/null; then
        print_pass "Local HTTP server working on port 8000"
    else
        print_fail "Local HTTP server not working on port 8000"
    fi
    
    # Clean up test server
    kill $SERVER_PID 2>/dev/null || true
    wait $SERVER_PID 2>/dev/null || true
else
    print_warn "Port 8000 already in use (server may be running)"
fi

# Test 7: Essential Tools
echo ""
print_test "Testing essential tools..."

TOOLS=("curl" "grep" "wc" "find")
for tool in "${TOOLS[@]}"; do
    if command -v $tool &> /dev/null; then
        print_pass "Tool available: $tool"
    else
        print_fail "Missing tool: $tool"
    fi
done

# Test 8: Git Repository Status (if in git repo)
echo ""
print_test "Testing git repository status..."

if git rev-parse --git-dir > /dev/null 2>&1; then
    BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
    print_pass "Git repository detected, branch: $BRANCH"
    
    if git status --porcelain | grep -q .; then
        print_warn "Working directory has uncommitted changes"
    else
        print_pass "Working directory clean"
    fi
else
    print_warn "Not in a git repository"
fi

# Summary
echo ""
echo "🏥 HEALTH CHECK SUMMARY"
echo "======================"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"  
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}🎉 ALL SYSTEMS GO! Your development environment is perfect! 🎉${NC}"
    else
        echo -e "${YELLOW}⚠️  System mostly healthy with $WARNINGS warnings. Review warnings above.${NC}"
    fi
    echo ""
    echo "Next steps:"
    echo "1. Start development: npm run dev"
    echo "2. Open browser: http://localhost:8000"
    echo "3. Test applications and explore the ecosystem"
else
    echo -e "${RED}❌ System has $FAILED critical issues. Please resolve before continuing.${NC}"
    echo ""
    echo "Common solutions:"
    echo "- Install Node.js 18+ from https://nodejs.org"
    echo "- Install Python 3.6+ from https://python.org"  
    echo "- Check network connectivity"
    echo "- Run setup script: ./tools/setup.sh"
fi

echo ""
echo "For help: Read README.md or docs/TROUBLESHOOTING.md"
echo ""

# Exit with error code if any tests failed
if [ $FAILED -gt 0 ]; then
    exit 1
else
    exit 0
fi
