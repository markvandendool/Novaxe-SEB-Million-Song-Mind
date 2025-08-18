#!/bin/bash
# NOVAXE TYPESCRIPT COMPILATION FIX SCRIPT
# Purpose: Fix common TypeScript syntax errors from migration

set -e

TARGET_DIR="/Users/markvandendool/Novaxe-SEB-Million-Song-Mind/nuclear-angular"
BACKUP_DIR="/tmp/pre-fix-backup-$(date +%Y%m%d_%H%M%S)"

echo "🔧 NOVAXE TYPESCRIPT FIX SCRIPT STARTING..."
echo "📂 Target: $TARGET_DIR"
echo "💾 Backup: $BACKUP_DIR"

cd "$TARGET_DIR"

# Create backup
cp -r src "$BACKUP_DIR"
echo "✅ Source code backed up to $BACKUP_DIR"

# ==========================================
# FIX 1: Arrow function syntax issues
# ==========================================
echo ""
echo "🔧 FIX 1: Arrow function syntax corrections..."

fix_arrow_functions() {
    local file="$1"
    if [ -f "$file" ]; then
        echo "  📝 Fixing arrow functions in $(basename "$file")"
        
        # Fix arrow function syntax: (e) => => { becomes (e) => {
        sed -i '' 's/=> =>/=>/g' "$file"
        
        # Fix malformed arrow functions with double arrows
        sed -i '' 's/\((.*)\) => =>{/\1 => {/g' "$file"
        
        echo "    ✅ Arrow functions fixed in $(basename "$file")"
    fi
}

# Apply arrow function fixes to problematic files
fix_arrow_functions "src/app/components/braid/braid.component.ts"
fix_arrow_functions "src/app/components/fretboard/fretboard.component.ts"
fix_arrow_functions "src/app/components/piano/piano.component.ts"
fix_arrow_functions "src/app/services/chord-detect/chord-detect.service.ts"

# ==========================================
# FIX 2: Missing parentheses and brackets
# ==========================================
echo ""
echo "🔧 FIX 2: Bracket and parentheses corrections..."

fix_brackets() {
    local file="$1"
    if [ -f "$file" ]; then
        echo "  📝 Fixing brackets in $(basename "$file")"
        
        # Fix missing closing parentheses in JSON.parse calls
        sed -i '' 's/JSON\.parse(res));/JSON.parse(res);/g' "$file"
        
        # Fix malformed conditional expressions
        sed -i '' 's/if(res=="creating user : email error"))/if(res=="creating user : email error")/g' "$file"
        sed -i '' 's/if(res == "link error"))/if(res == "link error")/g' "$file"
        
        # Fix malformed array access
        sed -i '' 's/\[(rootIndex + interval))/[(rootIndex + interval)]/g' "$file"
        
        echo "    ✅ Brackets fixed in $(basename "$file")"
    fi
}

# Apply bracket fixes
fix_brackets "src/app/models/usermodel/usermodel.ts"
fix_brackets "src/app/services/music-theory.service.ts"

# ==========================================
# FIX 3: Syntax and structure issues
# ==========================================
echo ""
echo "🔧 FIX 3: Syntax structure corrections..."

fix_syntax() {
    local file="$1"
    if [ -f "$file" ]; then
        echo "  📝 Fixing syntax in $(basename "$file")"
        
        # Fix malformed for loops and const declarations
        sed -i '' 's/for(const \[i,n\] of/for(const [i,n] of/g' "$file"
        
        # Fix incomplete class methods
        sed -i '' 's/public \([a-zA-Z_][a-zA-Z0-9_]*\)(/public \1(/g' "$file"
        sed -i '' 's/private \([a-zA-Z_][a-zA-Z0-9_]*\)(/private \1(/g' "$file"
        
        # Fix malformed if-else statements
        sed -i '' '/^} else {$/d' "$file"
        sed -i '' '/^    else /s/^    else /} else /g' "$file"
        
        echo "    ✅ Syntax fixed in $(basename "$file")"
    fi
}

# Apply syntax fixes to all TypeScript files
find src -name "*.ts" -not -name "*.spec.ts" | while read -r file; do
    fix_syntax "$file"
done

# ==========================================
# FIX 4: Remove broken/incomplete files
# ==========================================
echo ""
echo "🔧 FIX 4: Removing broken files..."

broken_files=(
    "src/app/models/usermodel/usermodel-broken.ts"
)

for broken_file in "${broken_files[@]}"; do
    if [ -f "$broken_file" ]; then
        echo "  🗑️  Removing broken file: $broken_file"
        rm "$broken_file"
    fi
done

# ==========================================
# FIX 5: Create stub implementations for missing dependencies
# ==========================================
echo ""
echo "🔧 FIX 5: Creating stub implementations..."

# Create missing assets directory structure
mkdir -p "src/assets/chords"

# Create basic chord definitions if missing
if [ ! -f "src/assets/chords/chords.js" ]; then
    cat > "src/assets/chords/chords.js" << 'EOF'
// Basic chord definitions for Novaxe
export const CHORDS = [
  // Major chords
  [["1P", "3M", "5P"], ["", "M", "maj"], "Major"],
  [["1P", "3m", "5P"], ["m", "min", "-"], "Minor"],
  [["1P", "3M", "5P", "7M"], ["M7", "maj7"], "Major seventh"],
  [["1P", "3m", "5P", "7m"], ["m7", "min7", "-7"], "Minor seventh"],
  [["1P", "3M", "5P", "7m"], ["7", "dom7"], "Dominant seventh"],
  // Extended chords
  [["1P", "3M", "5P", "7M", "9M"], ["M9", "maj9"], "Major ninth"],
  [["1P", "3m", "5P", "7m", "9M"], ["m9", "min9", "-9"], "Minor ninth"],
  [["1P", "3M", "5P", "7m", "9M"], ["9"], "Dominant ninth"],
  // Suspended chords
  [["1P", "4P", "5P"], ["sus4"], "Suspended fourth"],
  [["1P", "2M", "5P"], ["sus2"], "Suspended second"],
  // Diminished and augmented
  [["1P", "3m", "5d"], ["dim", "°"], "Diminished"],
  [["1P", "3M", "5A"], ["aug", "+"], "Augmented"]
];
EOF
    echo "    ✅ Created basic chord definitions"
fi

# ==========================================
# FIX 6: Update import paths to be Angular 20 compatible
# ==========================================
echo ""
echo "🔧 FIX 6: Updating import paths..."

fix_imports() {
    local file="$1"
    if [ -f "$file" ]; then
        # Fix asset imports
        sed -i '' 's|@assets/|../../../assets/|g' "$file"
        sed -i '' 's|@services/|../../../services/|g' "$file"
        sed -i '' 's|@models/|../../../models/|g' "$file"
        sed -i '' 's|@components/|../components/|g' "$file"
    fi
}

# Apply import fixes to all TypeScript files
find src -name "*.ts" -not -name "*.spec.ts" | while read -r file; do
    fix_imports "$file"
done

# ==========================================
# FIX 7: Test compilation
# ==========================================
echo ""
echo "🧪 FIX 7: Testing compilation..."

echo "📋 Running TypeScript compilation test..."
if npx tsc --noEmit --skipLibCheck 2>&1 | tee /tmp/tsc_output.log; then
    error_count=$(grep -c "error TS" /tmp/tsc_output.log 2>/dev/null || echo "0")
    if [ "$error_count" -eq "0" ]; then
        echo "✅ TypeScript compilation: SUCCESS"
        compilation_success=true
    else
        echo "⚠️  TypeScript compilation: $error_count errors remaining"
        compilation_success=false
    fi
else
    echo "❌ TypeScript compilation: FAILED"
    compilation_success=false
fi

# ==========================================
# SUMMARY REPORT
# ==========================================
echo ""
echo "📋 TYPESCRIPT FIX SUMMARY:"
echo "=========================="

if [ "$compilation_success" = true ]; then
    echo "✅ COMPILATION FIX: SUCCESSFUL"
    echo "🎯 Ready for Angular build and testing"
    echo ""
    echo "Next steps:"
    echo "  1. ng build"
    echo "  2. ng serve --port 4201"
    echo "  3. Test musical functionality"
else
    echo "⚠️  COMPILATION FIX: PARTIAL SUCCESS"
    echo "📄 Remaining errors logged to /tmp/tsc_output.log"
    echo ""
    echo "Next steps:"
    echo "  1. Review remaining errors in /tmp/tsc_output.log"
    echo "  2. Manual fixes may be required for complex syntax issues"
    echo "  3. Consider isolating problematic components temporarily"
fi

echo ""
echo "💾 Pre-fix backup available at: $BACKUP_DIR"
echo "🏁 TYPESCRIPT FIX COMPLETED!"
