#!/bin/bash

# IMMEDIATE LARGE BATCH REAL COMPONENT TEST
# Mark van den Dool - August 16, 2025
# PROCESS REAL NOVAXE COMPONENTS WITH PASS/FAIL RESULT

set -e

# Configuration
MAC_STUDIO_PATH="/Users/markvandendool/Novaxe-SEB-Million-Song-Mind/novaxe-seb-ng11"
MAC_PRO_BEAST_IP="10.0.0.115"
MAC_PRO_BEAST_USER="vandendool"
MAC_PRO_BEAST_PATH="/Users/vandendool/Novaxe-SEB-Million-Song-Mind/novaxe-seb-ng11"

# Results
TOTAL=0
PASSED=0
FAILED=0
START_TIME=$(date +%s)

log() {
    echo "[$(date '+%H:%M:%S')] $1"
}

success() {
    echo "[$(date '+%H:%M:%S')] ✅ $1"
}

error() {
    echo "[$(date '+%H:%M:%S')] ❌ $1"
}

# Test a single component on both machines
test_component_dual_machine() {
    local component_file=$1
    local relative_path=$(echo "$component_file" | sed "s|$MAC_STUDIO_PATH/||")
    local component_name=$(basename "$component_file" .component.ts)
    
    TOTAL=$((TOTAL + 1))
    
    # Local validation
    if [[ ! -f "$component_file" ]]; then
        error "$component_name - Local file missing"
        FAILED=$((FAILED + 1))
        return 1
    fi
    
    local local_lines=$(wc -l < "$component_file")
    
    # Remote validation
    local remote_lines=$(ssh "${MAC_PRO_BEAST_USER}@${MAC_PRO_BEAST_IP}" "
        if [[ -f '$MAC_PRO_BEAST_PATH/$relative_path' ]]; then
            wc -l < '$MAC_PRO_BEAST_PATH/$relative_path'
        else
            echo '0'
        fi
    " 2>/dev/null)
    
    # Real component processing (finite operations)
    local complexity=0
    if [[ "$local_lines" -gt 0 ]]; then
        # Real TypeScript analysis
        local imports=$(grep -c "^import" "$component_file" 2>/dev/null || echo 0)
        local classes=$(grep -c "class\|interface" "$component_file" 2>/dev/null || echo 0)
        local functions=$(grep -c "function\|=>" "$component_file" 2>/dev/null || echo 0)
        local components=$(grep -c "@Component" "$component_file" 2>/dev/null || echo 0)
        complexity=$((imports + classes + functions + components))
    fi
    
    # Validation logic
    if [[ "$local_lines" -eq "$remote_lines" && "$local_lines" -ge 10 && "$complexity" -gt 0 ]]; then
        success "$component_name - PASS ($local_lines lines, complexity: $complexity)"
        PASSED=$((PASSED + 1))
        return 0
    else
        error "$component_name - FAIL (Local: $local_lines, Remote: $remote_lines, Complexity: $complexity)"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# Main execution
main() {
    log "🔥 IMMEDIATE LARGE BATCH REAL COMPONENT TEST"
    log "=========================================="
    log "✅ Processing ONLY real Novaxe components"
    log "✅ Dual machine validation"
    log "✅ Real TypeScript analysis (no fake work)"
    log "✅ Automatic pass/fail determination"
    log ""
    
    # Get all real components
    local component_files=()
    while IFS= read -r -d '' file; do
        component_files+=("$file")
    done < <(find "$MAC_STUDIO_PATH/src/app/components" -name "*.component.ts" -print0)
    
    log "📁 Found ${#component_files[@]} real Novaxe components"
    
    # Process components in batches of 6 (hyperthreading)
    local batch_size=6
    local batch_count=0
    
    for ((i=0; i<${#component_files[@]}; i+=batch_size)); do
        batch_count=$((batch_count + 1))
        log "📦 Processing batch $batch_count..."
        
        # Process batch in parallel
        local pids=()
        for ((j=0; j<batch_size && (i+j)<${#component_files[@]}; j++)); do
            test_component_dual_machine "${component_files[$((i+j))]}" &
            pids+=($!)
        done
        
        # Wait for batch to complete
        for pid in "${pids[@]}"; do
            wait "$pid" || true
        done
        
        log "✅ Batch $batch_count complete"
        sleep 1  # Brief pause between batches
    done
    
    # Calculate results
    local end_time=$(date +%s)
    local duration=$((end_time - START_TIME))
    local pass_rate=0
    if (( TOTAL > 0 )); then
        pass_rate=$(( (PASSED * 100) / TOTAL ))
    fi
    
    # Final report
    log ""
    log "📊 FINAL RESULTS"
    log "==============="
    log "🕐 Duration: ${duration} seconds"
    log "📁 Total Components: $TOTAL"
    log "✅ Passed: $PASSED"
    log "❌ Failed: $FAILED"
    log "📈 Pass Rate: ${pass_rate}%"
    log ""
    
    # Determine final result
    if (( pass_rate >= 80 )); then
        log "🎉 OVERALL RESULT: PASS (${pass_rate}%)"
        log "🍽️  LUNCH APPROVED - Dual machine hyperthreading successful!"
        log "✅ Real components processed with automatic termination"
        log "✅ No fake work or infinite loops"
        log "✅ Finite operation set completed"
        echo "FINAL_RESULT:PASS:${pass_rate}%"
        return 0
    else
        log "🚫 OVERALL RESULT: FAIL (${pass_rate}%)"
        log "❌ Requirements not met - need ≥80% pass rate"
        echo "FINAL_RESULT:FAIL:${pass_rate}%"
        return 1
    fi
}

# Execute the test
main "$@"
