#!/bin/bash
# PROVEN TEMPLATE STRICTNESS FIXES FROM ARCHAEOLOGICAL DOCUMENTATION

echo "🔧 Applying proven template strictness fixes..."

# Fix 1: Add safe navigation operators to template properties
find src -name "*.html" -exec sed -i '' 's/{{ \([^}]*\)\.\([^}]*\) }}/{{ \1?.\\2 }}/g' {} \;

# Fix 2: Add null checks for array access
find src -name "*.html" -exec sed -i '' 's/\*ngFor="let \([^ ]*\) of \([^"]*\)"/\*ngFor="let \\1 of (\\2 || [])"/g' {} \;

# Fix 3: Add safe navigation for method calls
find src -name "*.html" -exec sed -i '' 's/\([a-zA-Z_][a-zA-Z0-9_]*\)\.\([a-zA-Z_][a-zA-Z0-9_]*\)(/\1?.\\2(/g' {} \;

echo "✅ Template strictness fixes applied"
