#!/bin/bash
# abcjs TypeScript Compatibility Fix for Angular 11
# Applies surgical fix for TS1337 union type error
# Based on historical "Braid Pattern Migration" strategy
# Date: August 16, 2025

echo "🔧 Applying abcjs TypeScript compatibility fix..."

# Backup original types file
if [ ! -f "node_modules/abcjs/types/index.d.ts.backup" ]; then
    cp node_modules/abcjs/types/index.d.ts node_modules/abcjs/types/index.d.ts.backup
    echo "✅ Original abcjs types backed up"
fi

# Apply the fix: Convert union type index signature to mapped type
sed -i '' 's/format?: { \[attr: FormatAttributes\]: any };/format?: { [K in FormatAttributes]?: any };/' node_modules/abcjs/types/index.d.ts

echo "✅ TypeScript union type compatibility fix applied"
echo "   Changed: { [attr: FormatAttributes]: any }"
echo "   To:      { [K in FormatAttributes]?: any }"
echo ""
echo "🚀 Ready to build with: NODE_OPTIONS=\"--openssl-legacy-provider\" npm run build"
