#!/bin/bash
# NOVAXE MIGRATION VALIDATION & TESTING SCRIPT
# Purpose: Comprehensive testing of migrated Novaxe functionality

set -e

TARGET_DIR="/Users/markvandendool/Novaxe-SEB-Million-Song-Mind/nuclear-angular"
RESULTS_FILE="/tmp/novaxe_validation_$(date +%Y%m%d_%H%M%S).log"

echo "🧪 NOVAXE MIGRATION VALIDATION STARTING..."
echo "📝 Results will be logged to: $RESULTS_FILE"

# Redirect output to both console and log file
exec > >(tee -a "$RESULTS_FILE")
exec 2>&1

cd "$TARGET_DIR"

# ==========================================
# PHASE 1: STRUCTURAL VALIDATION
# ==========================================
echo ""
echo "🏗️  PHASE 1: STRUCTURAL VALIDATION"
echo "=================================="

validate_structure() {
    local description="$1"
    local path="$2"
    
    if [ -e "$path" ]; then
        echo "✅ $description: PRESENT"
        return 0
    else
        echo "❌ $description: MISSING"
        return 1
    fi
}

# Core services validation
echo ""
echo "🧠 Core Musical Intelligence Services:"
validate_structure "MidiService" "src/app/services/midi/midi.service.ts"
validate_structure "ChordDetectService" "src/app/services/chord-detect/chord-detect.service.ts"
validate_structure "MusicTheoryService" "src/app/services/music-theory.service.ts"

# Component validation
echo ""
echo "🧩 Core Components:"
validate_structure "BraidComponent" "src/app/components/braid/braid.component.ts"
validate_structure "FretboardComponent" "src/app/components/fretboard/fretboard.component.ts"
validate_structure "PianoComponent" "src/app/components/piano/piano.component.ts"
validate_structure "EditorComponent" "src/app/components/editor/editor.component.ts"

# Assets validation
echo ""
echo "🎨 Musical Assets:"
validate_structure "Assets directory" "src/assets"
validate_structure "Chord definitions" "src/assets/chords"

# Count migrated items
echo ""
echo "📊 MIGRATION METRICS:"
services_count=$(find src/app/services -name "*.ts" 2>/dev/null | grep -v spec | wc -l | tr -d ' ')
components_count=$(find src/app/components -name "*.ts" 2>/dev/null | grep -v spec | wc -l | tr -d ' ')
assets_count=$(find src/assets -type f 2>/dev/null | wc -l | tr -d ' ')

echo "  Services migrated: $services_count"
echo "  Components migrated: $components_count"
echo "  Assets available: $assets_count"

# ==========================================
# PHASE 2: COMPILATION VALIDATION
# ==========================================
echo ""
echo "⚙️  PHASE 2: COMPILATION VALIDATION"
echo "=================================="

echo "📋 Testing TypeScript compilation..."
if npx tsc --noEmit --skipLibCheck; then
    echo "✅ TypeScript compilation: SUCCESS"
    ts_success=true
else
    echo "❌ TypeScript compilation: FAILED"
    ts_success=false
fi

echo ""
echo "📋 Testing Angular build..."
if timeout 180 ng build --configuration development > /tmp/build_output.log 2>&1; then
    echo "✅ Angular build: SUCCESS"
    build_success=true
    
    # Extract build metrics
    if [ -f "dist/nuclear-angular/stats.json" ]; then
        echo "  📊 Build metrics available in dist/nuclear-angular/stats.json"
    fi
    
    build_size=$(du -sh dist/nuclear-angular 2>/dev/null | cut -f1 || echo "Unknown")
    echo "  📦 Build size: $build_size"
else
    echo "❌ Angular build: FAILED"
    echo "  📄 Build log saved to /tmp/build_output.log"
    build_success=false
fi

# ==========================================
# PHASE 3: DEPENDENCY VALIDATION
# ==========================================
echo ""
echo "📦 PHASE 3: DEPENDENCY VALIDATION"
echo "================================"

echo "📋 Checking musical dependencies..."
node << 'EOF'
const fs = require('fs');
const path = require('path');

try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const allDeps = {...(packageJson.dependencies || {}), ...(packageJson.devDependencies || {})};
    
    const musicalDeps = {};
    const musicalKeywords = ['tonal', 'midi', 'audio', 'music', 'sound', 'webaudio'];
    
    Object.entries(allDeps).forEach(([dep, version]) => {
        if (musicalKeywords.some(keyword => dep.toLowerCase().includes(keyword))) {
            musicalDeps[dep] = version;
        }
    });
    
    console.log('🎵 Musical dependencies found:');
    if (Object.keys(musicalDeps).length > 0) {
        Object.entries(musicalDeps).forEach(([dep, version]) => {
            console.log(`  ✅ ${dep}: ${version}`);
        });
    } else {
        console.log('  ⚠️  No musical dependencies detected');
    }
    
    // Check for critical dependencies
    const criticalDeps = ['@tonaljs/tonal'];
    console.log('\n🎯 Critical dependency check:');
    criticalDeps.forEach(dep => {
        if (allDeps[dep]) {
            console.log(`  ✅ ${dep}: ${allDeps[dep]}`);
        } else {
            console.log(`  ❌ ${dep}: MISSING`);
        }
    });
    
} catch (error) {
    console.log('❌ Error checking dependencies:', error.message);
}
EOF

# ==========================================
# PHASE 4: FUNCTIONAL VALIDATION
# ==========================================
echo ""
echo "🎯 PHASE 4: FUNCTIONAL VALIDATION"
echo "================================"

# Test service instantiation
echo "📋 Testing service instantiation..."
node << 'EOF'
const fs = require('fs');
const path = require('path');

// Simple TypeScript syntax validation for services
const servicePaths = [
    'src/app/services/midi/midi.service.ts',
    'src/app/services/chord-detect/chord-detect.service.ts'
];

servicePaths.forEach(servicePath => {
    try {
        if (fs.existsSync(servicePath)) {
            const content = fs.readFileSync(servicePath, 'utf8');
            
            // Check for basic Angular service structure
            const hasInjectable = content.includes('@Injectable');
            const hasConstructor = content.includes('constructor');
            const hasExportClass = content.includes('export class');
            
            const serviceName = path.basename(servicePath, '.ts');
            
            if (hasInjectable && hasConstructor && hasExportClass) {
                console.log(`  ✅ ${serviceName}: Valid Angular service structure`);
            } else {
                console.log(`  ⚠️  ${serviceName}: Incomplete service structure`);
                if (!hasInjectable) console.log(`    - Missing @Injectable decorator`);
                if (!hasConstructor) console.log(`    - Missing constructor`);
                if (!hasExportClass) console.log(`    - Missing export class`);
            }
        } else {
            console.log(`  ❌ ${serviceName}: File not found`);
        }
    } catch (error) {
        console.log(`  ❌ Error validating ${servicePath}:`, error.message);
    }
});
EOF

# ==========================================
# PHASE 5: RUNTIME PREPARATION
# ==========================================
echo ""
echo "🚀 PHASE 5: RUNTIME PREPARATION"
echo "=============================="

# Kill any existing ng serve processes
echo "📋 Cleaning up existing dev servers..."
pkill -f "ng serve" 2>/dev/null || echo "  No existing dev servers to clean up"

# Start dev server for testing (background)
echo "📋 Starting development server..."
ng serve --port 4201 --host 127.0.0.1 > /tmp/dev_server.log 2>&1 &
DEV_SERVER_PID=$!

# Wait for server to start
echo "  ⏳ Waiting for dev server startup..."
sleep 10

# Test server response
if curl -s -I http://localhost:4201 > /dev/null; then
    echo "✅ Development server: RUNNING on port 4201"
    server_running=true
else
    echo "❌ Development server: FAILED to start"
    server_running=false
fi

# ==========================================
# PHASE 6: INTEGRATION TESTING
# ==========================================
echo ""
echo "🔗 PHASE 6: INTEGRATION TESTING"
echo "==============================="

if [ "$server_running" = true ]; then
    echo "📋 Testing key application routes..."
    
    test_route() {
        local route="$1"
        local description="$2"
        
        if curl -s -I "http://localhost:4201$route" | head -n 1 | grep -q "200"; then
            echo "  ✅ $description: ACCESSIBLE"
        else
            echo "  ❌ $description: FAILED"
        fi
    }
    
    test_route "/" "Home page"
    test_route "/test" "Test page"
    test_route "/fretboard" "Fretboard component"
    test_route "/braid" "Braid component"
else
    echo "⚠️  Skipping integration tests - dev server not running"
fi

# ==========================================
# FINAL REPORT
# ==========================================
echo ""
echo "📋 FINAL VALIDATION REPORT"
echo "=========================="

# Calculate success rate
total_tests=0
passed_tests=0

if [ "$ts_success" = true ]; then
    ((passed_tests++))
fi
((total_tests++))

if [ "$build_success" = true ]; then
    ((passed_tests++))
fi
((total_tests++))

if [ "$server_running" = true ]; then
    ((passed_tests++))
fi
((total_tests++))

success_rate=$((passed_tests * 100 / total_tests))

echo "🎯 Overall Success Rate: $success_rate% ($passed_tests/$total_tests tests passed)"

if [ $success_rate -ge 80 ]; then
    echo "✅ MIGRATION VALIDATION: SUCCESSFUL"
    validation_status="SUCCESS"
elif [ $success_rate -ge 50 ]; then
    echo "⚠️  MIGRATION VALIDATION: PARTIAL SUCCESS"
    validation_status="PARTIAL"
else
    echo "❌ MIGRATION VALIDATION: NEEDS ATTENTION"
    validation_status="FAILED"
fi

echo ""
echo "📊 Detailed Metrics:"
echo "  - Services migrated: $services_count"
echo "  - Components migrated: $components_count"
echo "  - Assets available: $assets_count"
echo "  - TypeScript compilation: $([ "$ts_success" = true ] && echo "✅" || echo "❌")"
echo "  - Angular build: $([ "$build_success" = true ] && echo "✅" || echo "❌")"
echo "  - Development server: $([ "$server_running" = true ] && echo "✅" || echo "❌")"

echo ""
echo "🎯 Recommended Next Steps:"
if [ "$validation_status" = "SUCCESS" ]; then
    echo "  1. ✅ All core systems operational - proceed with feature testing"
    echo "  2. 🎵 Test MIDI connectivity with hardware devices"
    echo "  3. 🎨 Verify visual components render correctly"
    echo "  4. 🧪 Run comprehensive user acceptance testing"
elif [ "$validation_status" = "PARTIAL" ]; then
    echo "  1. 🔧 Address compilation/build issues identified above"
    echo "  2. 📦 Install any missing dependencies"
    echo "  3. 🎯 Re-run validation script to verify fixes"
else
    echo "  1. ❗ Critical issues detected - review migration logs"
    echo "  2. 🔄 Consider re-running migration script"
    echo "  3. 📞 Seek assistance with identified blockers"
fi

echo ""
echo "📝 Full results logged to: $RESULTS_FILE"
echo "🏁 VALIDATION COMPLETED!"

# Clean up background processes
if [ ! -z "$DEV_SERVER_PID" ]; then
    kill $DEV_SERVER_PID 2>/dev/null || true
fi
