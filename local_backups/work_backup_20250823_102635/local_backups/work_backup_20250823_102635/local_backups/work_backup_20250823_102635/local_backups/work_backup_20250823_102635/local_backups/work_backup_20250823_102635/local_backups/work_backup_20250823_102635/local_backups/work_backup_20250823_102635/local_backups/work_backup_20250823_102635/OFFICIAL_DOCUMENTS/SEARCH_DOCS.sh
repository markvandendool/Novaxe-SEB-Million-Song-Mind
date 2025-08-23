#!/bin/bash

# 🔍 OFFICIAL DOCUMENTATION SEARCH SYSTEM
# Usage: ./SEARCH_DOCS.sh "error_text" [category]

DOCS_DIR="/Users/markvandendool/Novaxe-SEB-Million-Song-Mind/OFFICIAL_DOCUMENTS"
SEARCH_TERM="$1"
CATEGORY="$2"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 OFFICIAL DOCUMENTATION SEARCH${NC}"
echo -e "${BLUE}=================================${NC}"

if [ -z "$SEARCH_TERM" ]; then
    echo -e "${RED}Usage: ./SEARCH_DOCS.sh \"search_term\" [category]${NC}"
    echo -e "${YELLOW}Categories: Angular, React, TypeScript, JavaScript, Node.js, CSS-SCSS, HTML, Python, Shell-Bash, Vite, NPM-Yarn, Git, VS-Code, JSON, Web-APIs${NC}"
    exit 1
fi

echo -e "${GREEN}Searching for: ${YELLOW}\"$SEARCH_TERM\"${NC}"

if [ -n "$CATEGORY" ]; then
    echo -e "${GREEN}Category: ${YELLOW}$CATEGORY${NC}"
    SEARCH_PATH="$DOCS_DIR/$CATEGORY"
else
    echo -e "${GREEN}Category: ${YELLOW}ALL${NC}"
    SEARCH_PATH="$DOCS_DIR"
fi

echo ""
echo -e "${BLUE}🎯 RESULTS:${NC}"
echo -e "${BLUE}----------${NC}"

# Search in files
FOUND=0

# Search in HTML files
echo -e "${GREEN}📄 HTML Documentation Files:${NC}"
find "$SEARCH_PATH" -name "*.html" -type f | while read file; do
    if grep -l -i "$SEARCH_TERM" "$file" 2>/dev/null; then
        echo -e "  ${YELLOW}✓ Found in:${NC} $(basename "$file")"
        echo -e "    ${BLUE}Path:${NC} $file"
        # Show context
        grep -n -i -A2 -B2 "$SEARCH_TERM" "$file" 2>/dev/null | head -10
        echo ""
        FOUND=1
    fi
done

# Search in Markdown files  
echo -e "${GREEN}📝 Markdown Documentation Files:${NC}"
find "$SEARCH_PATH" -name "*.md" -type f | while read file; do
    if grep -l -i "$SEARCH_TERM" "$file" 2>/dev/null; then
        echo -e "  ${YELLOW}✓ Found in:${NC} $(basename "$file")"
        echo -e "    ${BLUE}Path:${NC} $file"
        # Show context with line numbers
        grep -n -i -A3 -B1 "$SEARCH_TERM" "$file" 2>/dev/null | head -15
        echo ""
        FOUND=1
    fi
done

# Search in JSON files
echo -e "${GREEN}📋 JSON Files:${NC}"
find "$SEARCH_PATH" -name "*.json" -type f | while read file; do
    if grep -l -i "$SEARCH_TERM" "$file" 2>/dev/null; then
        echo -e "  ${YELLOW}✓ Found in:${NC} $(basename "$file")"
        echo -e "    ${BLUE}Path:${NC} $file"
        echo ""
        FOUND=1
    fi
done

echo ""
echo -e "${BLUE}🚀 QUICK COMMANDS:${NC}"
echo -e "${BLUE}=================${NC}"
echo -e "${GREEN}Cross-reference search:${NC}"
echo -e "  grep -r -i \"$SEARCH_TERM\" $DOCS_DIR/Angular $DOCS_DIR/React"
echo ""
echo -e "${GREEN}Exact error lookup:${NC}"
echo -e "  find $DOCS_DIR -name \"*ERROR*\" | xargs grep -l \"$SEARCH_TERM\""
echo ""
echo -e "${GREEN}API documentation search:${NC}"
echo -e "  find $DOCS_DIR -name \"*api*\" -o -name \"*reference*\" | xargs grep -l \"$SEARCH_TERM\""

echo ""
echo -e "${BLUE}🎯 SUGGESTED ACTIONS:${NC}"
echo -e "${BLUE}==================${NC}"

# Suggest based on search term
case "$SEARCH_TERM" in
    *"cannot find module"*|*"module not found"*)
        echo -e "${YELLOW}📦 Module Error Detected:${NC}"
        echo -e "  1. Check ${DOCS_DIR}/NPM-Yarn/npm-docs.html"
        echo -e "  2. Check ${DOCS_DIR}/TypeScript/typescript-compiler-options.html"
        echo -e "  3. Run: npm install missing-package"
        ;;
    *"property does not exist"*|*"property"*)
        echo -e "${YELLOW}🔷 TypeScript Type Error:${NC}"
        echo -e "  1. Check ${DOCS_DIR}/TypeScript/QUICK_ERROR_REFERENCE.md"
        echo -e "  2. Define proper interface types"
        echo -e "  3. Use optional properties (?)"
        ;;
    *"hook"*|*"useState"*|*"useEffect"*)
        echo -e "${YELLOW}⚛️ React Hook Error:${NC}"
        echo -e "  1. Check ${DOCS_DIR}/React/QUICK_ERROR_REFERENCE.md"
        echo -e "  2. Ensure hooks are called at top level"
        echo -e "  3. Check useEffect dependencies"
        ;;
    *"provider"*|*"injection"*|*"service"*)
        echo -e "${YELLOW}🅰️ Angular DI Error:${NC}"
        echo -e "  1. Check ${DOCS_DIR}/Angular/QUICK_ERROR_REFERENCE.md"
        echo -e "  2. Add service to providers array"
        echo -e "  3. Check @Injectable decorator"
        ;;
esac

echo ""
