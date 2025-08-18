#!/bin/bash

# Angular 20 Fretboard Component Systematic Fix
# Following the successful editor component pattern

echo "🎸 Fretboard Component Angular 20 Migration Fix"
echo "Applying systematic fixes following Angular documentation standards..."

cd /Users/markvandendool/Novaxe-SEB-Million-Song-Mind/nuclear-angular

# Backup the current state
cp src/app/components/fretboard/fretboard.component.ts src/app/components/fretboard/fretboard.component.ts.backup-$(date +%s)

echo "📝 Applying structural fixes..."

# Fix malformed if-else statements (similar pattern to editor component)
sed -i '' 's/} else {[[:space:]]*i[[:space:]]*} else if/} else if/g' src/app/components/fretboard/fretboard.component.ts

# Fix preventDefault() calls
sed -i '' 's/(event as any)\.prevent: anyDefault/(event as any).preventDefault/g' src/app/components/fretboard/fretboard.component.ts
sed -i '' 's/\.prevent: anyDefault/.preventDefault/g' src/app/components/fretboard/fretboard.component.ts

# Fix pipe() method calls on arrays (should be map())
sed -i '' 's/\.pipe(map(/\.map(/g' src/app/components/fretboard/fretboard.component.ts

# Fix missing public/private keywords on methods
sed -i '' 's/^[[:space:]]*\([a-zA-Z_][a-zA-Z0-9_]*\)([^)]*) {$/  public \1(\&) {/g' src/app/components/fretboard/fretboard.component.ts

echo "✅ Applied fretboard component fixes"

# Check progress
echo "📊 Fretboard component errors after fixes:"
npx tsc --noEmit 2>&1 | grep "fretboard.component.ts" | wc -l

echo "📊 Total project errors:"
npx tsc --noEmit 2>&1 | grep -v "src_backup" | grep -E "error TS" | wc -l
