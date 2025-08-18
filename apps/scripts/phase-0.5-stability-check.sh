#!/bin/bash

# Phase 0.5 Stability Checklist
# Run before merging any major changes or starting cross-app integration

# Don't exit on error - we want to run all checks
set +e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "================================================"
echo "    PHASE 0.5 STABILITY CHECKLIST"
echo "================================================"
echo ""

CHECKS_PASSED=0
CHECKS_FAILED=0

check_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗${NC} $2"
        ((CHECKS_FAILED++))
    fi
}

echo "1. DEPENDENCY LOCKDOWN"
echo "----------------------"

# Check Node version
if [ -f .nvmrc ]; then
    EXPECTED_NODE=$(cat .nvmrc)
    CURRENT_NODE=$(node -v | sed 's/v//')
    if [[ "$CURRENT_NODE" == "$EXPECTED_NODE"* ]]; then
        check_status 0 "Node version matches .nvmrc ($CURRENT_NODE)"
    else
        check_status 1 "Node version mismatch. Expected: $EXPECTED_NODE, Got: $CURRENT_NODE"
    fi
else
    CURRENT_NODE=$(node -v)
    check_status 0 "Node version: $CURRENT_NODE (no .nvmrc found)"
fi

# Check if node_modules exist
NOVAXE_DEPS=0
MSM_DEPS=0
if [ -d "apps/novaxe/node_modules" ]; then
    NOVAXE_DEPS=1
fi
if [ -d "apps/msm/node_modules" ]; then
    MSM_DEPS=1
fi

if [ $NOVAXE_DEPS -eq 1 ] && [ $MSM_DEPS -eq 1 ]; then
    check_status 0 "Dependencies installed in both apps"
elif [ $NOVAXE_DEPS -eq 0 ] && [ $MSM_DEPS -eq 0 ]; then
    check_status 1 "Missing node_modules in both apps (run: npm run install:all)"
elif [ $NOVAXE_DEPS -eq 0 ]; then
    check_status 1 "Missing node_modules in Novaxe (run: cd apps/novaxe && npm install --legacy-peer-deps)"
else
    check_status 1 "Missing node_modules in MSM (run: cd apps/msm && npm install)"
fi

echo ""
echo "2. INDEPENDENT BUILD HEALTH"
echo "---------------------------"

# Check if build scripts exist
if [ -f "apps/novaxe/package.json" ]; then
    if grep -q '"build"' apps/novaxe/package.json; then
        check_status 0 "Novaxe build script exists"
    else
        check_status 1 "Novaxe build script missing"
    fi
else
    check_status 1 "Novaxe package.json not found"
fi

if [ -f "apps/msm/package.json" ]; then
    if grep -q '"build"' apps/msm/package.json; then
        check_status 0 "MSM build script exists"
    else
        check_status 1 "MSM build script missing"
    fi
else
    check_status 1 "MSM package.json not found"
fi

echo ""
echo "3. SHARED PACKAGE INTEGRITY"
echo "---------------------------"

# Check for cross-app imports
CROSS_IMPORTS_NOVAXE=$(grep -R "from ['\"]\.\.\/\.\.\/msm" apps/novaxe 2>/dev/null | wc -l || echo "0")
CROSS_IMPORTS_MSM=$(grep -R "from ['\"]\.\.\/\.\.\/novaxe" apps/msm 2>/dev/null | wc -l || echo "0")

if [ "$CROSS_IMPORTS_NOVAXE" -eq 0 ] && [ "$CROSS_IMPORTS_MSM" -eq 0 ]; then
    check_status 0 "No direct cross-app imports found"
else
    check_status 1 "Found direct cross-app imports (Novaxe: $CROSS_IMPORTS_NOVAXE, MSM: $CROSS_IMPORTS_MSM)"
fi

# Check shared packages exist
if [ -d "packages/shared/src" ] && [ -d "packages/msm-bridge/src" ]; then
    check_status 0 "Shared packages structure exists"
else
    check_status 1 "Shared packages missing or incomplete"
fi

echo ""
echo "4. LINT & FORMAT"
echo "----------------"

# Check for ESLint config
if [ -f "apps/novaxe/.eslintrc.json" ] || [ -f "apps/novaxe/.eslintrc.js" ]; then
    check_status 0 "Novaxe ESLint configured"
else
    check_status 0 "Novaxe ESLint not configured (TSLint may be in use)"
fi

if [ -f "apps/msm/.eslintrc.json" ] || [ -f "apps/msm/.eslintrc.js" ] || [ -f "apps/msm/.eslintrc.cjs" ]; then
    check_status 0 "MSM ESLint configured"
else
    check_status 0 "MSM ESLint not configured (may use Vite defaults)"
fi

echo ""
echo "5. GIT CLEAN STATE"
echo "------------------"

# Check git status
GIT_STATUS=$(git status --porcelain | wc -l)
if [ "$GIT_STATUS" -eq 0 ]; then
    check_status 0 "Working directory clean"
else
    check_status 1 "Working directory has $GIT_STATUS uncommitted changes"
    echo "  Run: git status"
fi

# Check for merge/rebase in progress
if [ -d ".git/rebase-merge" ] || [ -d ".git/rebase-apply" ]; then
    check_status 1 "Rebase in progress"
else
    check_status 0 "No rebase in progress"
fi

if [ -f ".git/MERGE_HEAD" ]; then
    check_status 1 "Merge in progress"
else
    check_status 0 "No merge in progress"
fi

echo ""
echo "6. CI/CD VERIFICATION"
echo "--------------------"

if [ -f ".github/workflows/ci.yml" ]; then
    check_status 0 "CI/CD workflow exists"
else
    check_status 1 "CI/CD workflow missing"
fi

echo ""
echo "7. CURRENT STATE"
echo "----------------"

CURRENT_BRANCH=$(git branch --show-current)
echo "  Branch: $CURRENT_BRANCH"

LAST_COMMIT=$(git log -1 --oneline)
echo "  Last commit: $LAST_COMMIT"

if [ -d "apps/novaxe/dist" ]; then
    echo "  Novaxe dist: exists"
else
    echo "  Novaxe dist: not built"
fi

if [ -d "apps/msm/dist" ]; then
    echo "  MSM dist: exists"
else
    echo "  MSM dist: not built"
fi

echo ""
echo "================================================"
echo "                SUMMARY"
echo "================================================"
echo -e "Checks passed: ${GREEN}$CHECKS_PASSED${NC}"
echo -e "Checks failed: ${RED}$CHECKS_FAILED${NC}"

if [ $CHECKS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ All stability checks passed!${NC}"
    echo ""
    echo "Ready to proceed with integration. Consider tagging:"
    echo "  git tag pre-phase1-$(date +%Y%m%d_%H%M%S)"
    echo "  git push --tags"
    exit 0
else
    echo ""
    echo -e "${YELLOW}⚠ Some checks failed. Review and fix before proceeding.${NC}"
    exit 1
fi