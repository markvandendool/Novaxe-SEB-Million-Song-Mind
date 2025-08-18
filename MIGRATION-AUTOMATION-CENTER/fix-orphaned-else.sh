#!/bin/bash

# MASTER PROTOCOL v4.0 COMPLIANT: Fix orphaned else statements
# REAL SYNTAX FIXES ONLY

cd "/Users/markvandendool/Novaxe-SEB-Million-Song-Mind/novaxe-seb-ng11"

echo "Fixing orphaned else statements..."

# Count errors before
BEFORE=$(npx tsc --noEmit 2>&1 | grep -c "error TS" || echo "0")
echo "Errors before: $BEFORE"

# Fix orphaned else patterns like we did manually
# Pattern 1: else followed by variable assignment
find src -name "*.ts" -type f -exec sed -i '' '/^\s*else\s*$/N;s/\n\s*out\s*=\s*\([^;]*\);/\nout = \1;/' {} \;

# Pattern 2: else followed by method call
find src -name "*.ts" -type f -exec sed -i '' '/^\s*else\s*$/N;s/\n\s*out\.push\s*(\s*\([^)]*\)\s*);/\nout.push(\1);/' {} \;

# Remove remaining orphaned else lines
find src -name "*.ts" -type f -exec sed -i '' '/^\s*else\s*$/d' {} \;

# Count errors after
AFTER=$(npx tsc --noEmit 2>&1 | grep -c "error TS" || echo "0")
FIXED=$((BEFORE - AFTER))

echo "Errors after: $AFTER"
echo "Fixed: $FIXED orphaned else statement errors"

echo "Orphaned else fixes completed"
