#!/bin/bash

# MASTER PROTOCOL v4.0 COMPLIANT: Fix duplicate void declarations
# NO FAKE WORK - ONLY REAL SYNTAX FIXES

cd "/Users/markvandendool/Novaxe-SEB-Million-Song-Mind/novaxe-seb-ng11"

# Count errors before
echo "Errors before fix:"
npx tsc --noEmit 2>&1 | grep -c "error TS" || echo "0"

echo "Fixing duplicate void: void patterns..."

# Find and fix all void: void patterns
find src -name "*.ts" -exec sed -i '' 's/): void: void/): void/g' {} \;
find src -name "*.ts" -exec sed -i '' 's/): void: void {/): void {/g' {} \;

# Count errors after
echo "Errors after fix:"
npx tsc --noEmit 2>&1 | grep -c "error TS" || echo "0"

echo "Fixed duplicate void declarations in all TypeScript files"
