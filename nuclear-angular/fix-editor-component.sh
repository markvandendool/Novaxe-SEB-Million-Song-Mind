#!/bin/bash

# Script to fix common TypeScript issues in editor component
echo "Fixing editor component structural issues..."

cd /Users/markvandendool/Novaxe-SEB-Million-Song-Mind/nuclear-angular

# Fix corrupted if statements - replace }f( with } else if(
sed -i '' 's/}f(/} else if(/g' src/app/components/editor/editor.component.ts

# Fix type annotation issues - replace "event: any" with "(event as any)"
sed -i '' 's/event: any\./\(event as any\)\./g' src/app/components/editor/editor.component.ts
sed -i '' 's/event: any\[/\(event as any\)\[/g' src/app/components/editor/editor.component.ts

# Fix variable declarations - replace "let e:any= event: any;" with "let e:any = event as any;"
sed -i '' 's/let e:any= event: any;/let e:any = event as any;/g' src/app/components/editor/editor.component.ts

# Fix method signatures - replace "event: any: any" with "event: any"
sed -i '' 's/event: any: any/event: any/g' src/app/components/editor/editor.component.ts

# Fix preventDefault calls - replace "event: any.prevent: anyDefault" with "(event as any).preventDefault"
sed -i '' 's/event: any\.prevent: anyDefault/(event as any).preventDefault/g' src/app/components/editor/editor.component.ts

# Fix if condition syntax - replace "if( !event: any[" with "if( !(event as any)["
sed -i '' 's/if( !event: any\[/if( !\(event as any\)\[/g' src/app/components/editor/editor.component.ts

# Fix alert syntax - replace "alert('text') {" with "alert('text');"
sed -i '' "s/alert('\([^']*\)') {/alert('\1');/g" src/app/components/editor/editor.component.ts

echo "Editor component fixes applied. Running TypeScript check..."

# Check if fixes worked
npx tsc --noEmit --project tsconfig.json 2>&1 | grep "src/app/components/editor/editor.component.ts" | head -5
