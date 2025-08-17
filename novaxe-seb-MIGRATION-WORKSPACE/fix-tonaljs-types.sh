#!/bin/bash
echo "Fixing @tonaljs type exports for TypeScript 4.4..."
find node_modules/@tonaljs -name "*.d.ts" -exec sed -i '' 's/export { type /export { /g' {} \;
echo "Fixed type exports in @tonaljs"
