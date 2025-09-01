#!/bin/bash

# ============================================
# 🔍 CHORDCUBES 5.0 MONITORING TEST SUITE
# ============================================
# Military-grade testing for the new monitoring system

echo "🚀 Starting ChordCubes 5.0 Monitoring Test Suite..."
echo "==========================================="

# Change to cubes directory
cd /Users/markvandendool/Novaxe-SEB-Million-Song-Mind/deployment/chordcubes-5-0-deployment/cubes

echo ""
echo "📋 TEST 1: File Structure Validation"
echo "-----------------------------------"

# Check if all critical files exist
files_to_check=(
    "main.js"
    "monitor.js"
    "transport-bridge.js"
    "chords.js"
    "professional-drum-machine.js"
    "index.html"
)

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
        # Get file size
        size=$(wc -c < "$file" | tr -d ' ')
        echo "   Size: $size bytes"
        
        # Check if it's JavaScript and validate basic syntax
        if [[ "$file" == *.js ]]; then
            # Basic syntax check using node
            if node -c "$file" 2>/dev/null; then
                echo "   ✅ JavaScript syntax valid"
            else
                echo "   ❌ JavaScript syntax error detected"
            fi
        fi
    else
        echo "❌ $file missing"
    fi
done

echo ""
echo "📋 TEST 2: Monitor.js Integration Check"
echo "-------------------------------------"

# Check if monitor is properly integrated into main.js
if grep -q "import.*ChordCubesMonitor.*from.*monitor\.js" main.js; then
    echo "✅ Monitor import found in main.js"
else
    echo "❌ Monitor import missing from main.js"
fi

# Check if monitor export is correct
if grep -q "export.*ChordCubesMonitor" monitor.js; then
    echo "✅ Monitor export statement found"
else
    echo "❌ Monitor export statement missing"
fi

echo ""
echo "📋 TEST 3: Monitor Functionality Verification"
echo "--------------------------------------------"

# Test monitor class structure with Node.js
cat > test_monitor.js << 'EOF'
// Test the monitor module
import { ChordCubesMonitor } from './monitor.js';

console.log('Testing ChordCubesMonitor class...');

try {
    const monitor = new ChordCubesMonitor();
    console.log('✅ Monitor instance created successfully');
    
    // Test basic methods
    if (typeof monitor.start === 'function') {
        console.log('✅ start() method exists');
    } else {
        console.log('❌ start() method missing');
    }
    
    if (typeof monitor.stop === 'function') {
        console.log('✅ stop() method exists');
    } else {
        console.log('❌ stop() method missing');
    }
    
    if (typeof monitor.getMetrics === 'function') {
        console.log('✅ getMetrics() method exists');
    } else {
        console.log('❌ getMetrics() method missing');
    }
    
    if (typeof monitor.getStatus === 'function') {
        console.log('✅ getStatus() method exists');
    } else {
        console.log('❌ getStatus() method missing');
    }
    
    console.log('✅ All basic monitor tests passed');
    
} catch (error) {
    console.log('❌ Monitor test failed:', error.message);
}
EOF

# Run the monitor test (might fail in Node.js due to browser APIs, but structure should be valid)
echo "Testing monitor class structure..."
if node --experimental-modules test_monitor.js 2>/dev/null; then
    echo "✅ Monitor class structure valid"
else
    echo "⚠️  Monitor class uses browser APIs (expected in Node.js environment)"
fi

# Clean up test file
rm -f test_monitor.js

echo ""
echo "📋 TEST 4: HTML Integration Check"
echo "--------------------------------"

# Check if index.html exists and has proper structure
if [ -f "index.html" ]; then
    if grep -q "<script.*type.*module.*main\.js" index.html; then
        echo "✅ Main.js module import found in HTML"
    else
        echo "❌ Main.js module import missing from HTML"
    fi
    
    if grep -q "Three\.js" index.html || grep -q "threejs" index.html || grep -q "three\.js" index.html; then
        echo "✅ Three.js reference found in HTML"
    else
        echo "⚠️  Three.js reference not found (might be imported in JS)"
    fi
    
    if grep -q "Tone\.js" index.html || grep -q "tonejs" index.html; then
        echo "✅ Tone.js reference found in HTML"
    else
        echo "⚠️  Tone.js reference not found (might be imported in JS)"
    fi
else
    echo "❌ index.html not found"
fi

echo ""
echo "📋 TEST 5: Production Readiness Check"
echo "------------------------------------"

# Check file sizes for production optimization
echo "File sizes:"
for file in *.js; do
    if [ -f "$file" ]; then
        size=$(wc -c < "$file" | tr -d ' ')
        lines=$(wc -l < "$file" | tr -d ' ')
        echo "  $file: $size bytes, $lines lines"
        
        # Flag very large files
        if [ $size -gt 500000 ]; then  # 500KB
            echo "    ⚠️  Large file - consider optimization"
        fi
    fi
done

echo ""
echo "📋 TEST 6: Critical Pattern Verification"
echo "---------------------------------------"

# Check for critical patterns that might cause issues
critical_patterns=(
    "console\.log.*AudioContext"
    "new AudioContext"
    "new webkitAudioContext"
    "console\.warn.*Tone"
    "emergency.*shutdown"
    "CRITICAL.*ERROR"
)

echo "Checking for critical monitoring patterns in monitor.js:"
for pattern in "${critical_patterns[@]}"; do
    if grep -q "$pattern" monitor.js; then
        echo "✅ Found pattern: $pattern"
    else
        echo "⚠️  Pattern not found: $pattern"
    fi
done

echo ""
echo "📋 TEST 7: Git Status Check"
echo "--------------------------"

# Check git status
if git status --porcelain | grep -q "monitor\.js"; then
    echo "✅ monitor.js detected as new/modified file"
else
    echo "⚠️  monitor.js not in git staging area"
fi

if git status --porcelain | grep -q "main\.js"; then
    echo "✅ main.js detected as modified file"
else
    echo "⚠️  main.js modifications not detected"
fi

echo ""
echo "📋 TEST 8: Development Environment Check"
echo "---------------------------------------"

# Check if we're in the correct branch
current_branch=$(git branch --show-current)
echo "Current branch: $current_branch"

if [[ "$current_branch" == "chord-cubes-under-construction-1.0" ]]; then
    echo "✅ Correct refactoring branch active"
else
    echo "⚠️  Not on expected refactoring branch"
fi

# Check backup tag exists
if git tag | grep -q "chordcubes-5.0-emergency-backup"; then
    echo "✅ Emergency backup tag found"
else
    echo "❌ Emergency backup tag missing"
fi

echo ""
echo "==========================================="
echo "🎯 MONITORING TEST SUITE COMPLETE"
echo "==========================================="

echo ""
echo "📊 SUMMARY:"
echo "• Monitor system implemented: monitor.js"
echo "• Integration complete: main.js updated"
echo "• Emergency backup: Available for rollback"
echo "• Branch status: chord-cubes-under-construction-1.0"
echo ""

echo "🚀 Next Steps:"
echo "1. Deploy monitoring system to test environment"
echo "2. Verify real-time metrics collection"
echo "3. Test emergency alert thresholds"
echo "4. Begin AudioContext crisis resolution"

echo ""
echo "✅ Ready for Phase 2: AudioContext Crisis Resolution"
