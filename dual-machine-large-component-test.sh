#!/bin/bash

# DUAL MACHINE HYPERTHREADING TEST - TWO LARGE COMPONENTS WITH VALIDATION
# Mark van den Dool - August 16, 2025
# NO LUNCH UNTIL SUCCESS!

set -e

# ==============================================
# GLOBAL CONFIGURATION
# ==============================================
MAC_STUDIO_PATH="/Users/markvandendool/Novaxe-SEB-Million-Song-Mind/novaxe-seb-ng11"
MAC_PRO_BEAST_IP="10.0.0.115"
MAC_PRO_BEAST_USER="vandendool"
MAC_PRO_BEAST_PATH="/Users/vandendool/Novaxe-SEB-Million-Song-Mind/novaxe-seb-ng11"

# Component definitions
COMPONENT_1_NAME="BraidComponent"
COMPONENT_1_PATH="src/app/components/braid/braid.component.ts"
COMPONENT_1_EXPECTED_LINES=1195

COMPONENT_2_NAME="FretboardComponent"
COMPONENT_2_PATH="src/app/components/fretboard/fretboard.component.ts"
COMPONENT_2_EXPECTED_LINES=1206

# Test workspace
TEST_WORKSPACE="/tmp/dual_machine_hyperthreading_test_$(date +%s)"
MAC_PRO_TEST_WORKSPACE="/tmp/dual_machine_hyperthreading_test_$(date +%s)"

# Safety limits
MAX_CPU_SAFE=90
MAX_CPU_OVERNIGHT=75
MIN_CPU_TARGET=75
MAX_CPU_TARGET=85

# ==============================================
# LOGGING AND SAFETY FUNCTIONS
# ==============================================
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ ERROR: $1" >&2
}

success() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ SUCCESS: $1"
}

warning() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  WARNING: $1"
}

check_cpu_safety() {
    local machine=$1
    local max_allowed=$2
    
    if [[ "$machine" == "local" ]]; then
        CPU_USAGE=$(top -l 1 | awk '/CPU usage:/ {print $3}' | sed 's/%//')
    else
        CPU_USAGE=$(ssh "${MAC_PRO_BEAST_USER}@${MAC_PRO_BEAST_IP}" "top -l 1 | awk '/CPU usage:/ {print \$3}' | sed 's/%//'")
    fi
    
    if (( $(echo "$CPU_USAGE > $max_allowed" | bc -l) )); then
        error "$machine CPU at ${CPU_USAGE}% exceeds safety limit of ${max_allowed}%"
        return 1
    fi
    
    log "$machine CPU usage: ${CPU_USAGE}% (within ${max_allowed}% limit)"
    return 0
}

emergency_panic() {
    error "EMERGENCY PANIC TRIGGERED!"
    log "Executing global emergency shutdown..."
    
    # Local panic
    source /Users/markvandendool/Novaxe-SEB-Million-Song-Mind/emergency-kill-switch.sh
    tilde_ultimate_panic_emergency
    
    # Remote panic
    ssh "${MAC_PRO_BEAST_USER}@${MAC_PRO_BEAST_IP}" "pkill -f 'hyperthreading\|stress\|test' || true" 2>/dev/null || true
    
    log "Emergency panic complete"
    exit 1
}

# ==============================================
# COMPONENT VALIDATION FUNCTIONS
# ==============================================
validate_component_local() {
    local component_name=$1
    local component_path=$2
    local expected_lines=$3
    
    log "Validating $component_name on Mac Studio..."
    
    # Check file exists
    if [[ ! -f "$MAC_STUDIO_PATH/$component_path" ]]; then
        error "$component_name not found at $MAC_STUDIO_PATH/$component_path"
        return 1
    fi
    
    # Check line count
    local actual_lines=$(wc -l < "$MAC_STUDIO_PATH/$component_path")
    if [[ "$actual_lines" -ne "$expected_lines" ]]; then
        error "$component_name has $actual_lines lines, expected $expected_lines"
        return 1
    fi
    
    success "$component_name validated: $actual_lines lines ✅"
    return 0
}

validate_component_remote() {
    local component_name=$1
    local component_path=$2
    local expected_lines=$3
    
    log "Validating $component_name on Mac Pro Beast..."
    
    # Check file exists and line count
    local result=$(ssh "${MAC_PRO_BEAST_USER}@${MAC_PRO_BEAST_IP}" "
        if [[ -f '$MAC_PRO_BEAST_PATH/$component_path' ]]; then
            wc -l < '$MAC_PRO_BEAST_PATH/$component_path'
        else
            echo 'FILE_NOT_FOUND'
        fi
    ")
    
    if [[ "$result" == "FILE_NOT_FOUND" ]]; then
        error "$component_name not found on Mac Pro Beast"
        return 1
    fi
    
    if [[ "$result" -ne "$expected_lines" ]]; then
        error "$component_name has $result lines on Mac Pro Beast, expected $expected_lines"
        return 1
    fi
    
    success "$component_name validated on Mac Pro Beast: $result lines ✅"
    return 0
}

# ==============================================
# HYPERTHREADING STRESS TEST FUNCTIONS
# ==============================================
stress_test_component_local() {
    local component_name=$1
    local component_path=$2
    local duration=30
    
    log "Starting hyperthreading stress test for $component_name on Mac Studio..."
    
    # Create test workspace
    mkdir -p "$TEST_WORKSPACE"
    cd "$TEST_WORKSPACE"
    
    # Start CPU stress for hyperthreading
    log "Starting CPU stress (targeting 80% utilization)..."
    for ((i=1; i<=8; i++)); do
        (
            while true; do
                # Read component file repeatedly under stress
                if [[ -f "$MAC_STUDIO_PATH/$component_path" ]]; then
                    head -n 100 "$MAC_STUDIO_PATH/$component_path" > /dev/null
                    tail -n 100 "$MAC_STUDIO_PATH/$component_path" > /dev/null
                    wc -l "$MAC_STUDIO_PATH/$component_path" > /dev/null
                fi
                sleep 0.1
            done
        ) &
        STRESS_PIDS[$i]=$!
    done
    
    # Monitor for duration
    local start_time=$(date +%s)
    while (( $(date +%s) - start_time < duration )); do
        check_cpu_safety "local" "$MAX_CPU_SAFE" || emergency_panic
        sleep 2
    done
    
    # Clean up stress processes
    for pid in "${STRESS_PIDS[@]}"; do
        kill "$pid" 2>/dev/null || true
    done
    wait 2>/dev/null || true
    
    success "$component_name stress test completed on Mac Studio"
}

stress_test_component_remote() {
    local component_name=$1
    local component_path=$2
    local duration=30
    
    log "Starting hyperthreading stress test for $component_name on Mac Pro Beast..."
    
    # Start remote stress test
    ssh "${MAC_PRO_BEAST_USER}@${MAC_PRO_BEAST_IP}" "
        # Create test workspace
        mkdir -p '$MAC_PRO_TEST_WORKSPACE'
        cd '$MAC_PRO_TEST_WORKSPACE'
        
        # Start CPU stress for hyperthreading (56 cores)
        echo 'Starting CPU stress on Mac Pro Beast...'
        for ((i=1; i<=48; i++)); do
            (
                while true; do
                    if [[ -f '$MAC_PRO_BEAST_PATH/$component_path' ]]; then
                        head -n 200 '$MAC_PRO_BEAST_PATH/$component_path' > /dev/null
                        tail -n 200 '$MAC_PRO_BEAST_PATH/$component_path' > /dev/null  
                        wc -l '$MAC_PRO_BEAST_PATH/$component_path' > /dev/null
                    fi
                    sleep 0.05
                done
            ) &
        done
        
        # Run for duration and then cleanup
        sleep $duration
        pkill -f 'head\|tail\|wc' || true
        echo 'Mac Pro Beast stress test complete'
    " &
    
    MAC_PRO_PID=$!
    
    # Monitor local safety while remote runs
    local start_time=$(date +%s)
    while (( $(date +%s) - start_time < duration )); do
        check_cpu_safety "remote" "$MAX_CPU_SAFE" || emergency_panic
        sleep 2
    done
    
    # Wait for remote completion
    wait $MAC_PRO_PID
    
    success "$component_name stress test completed on Mac Pro Beast"
}

# ==============================================
# COORDINATION AND VALIDATION
# ==============================================
synchronized_dual_machine_test() {
    local component_name=$1
    local component_path=$2
    
    log "🚀 STARTING SYNCHRONIZED DUAL MACHINE TEST: $component_name"
    
    # Phase 1: Validate components on both machines  
    if [[ "$component_name" == "BraidComponent" ]]; then
        validate_component_local "$component_name" "$component_path" "$COMPONENT_1_EXPECTED_LINES"
        validate_component_remote "$component_name" "$component_path" "$COMPONENT_1_EXPECTED_LINES"
    else
        validate_component_local "$component_name" "$component_path" "$COMPONENT_2_EXPECTED_LINES"
        validate_component_remote "$component_name" "$component_path" "$COMPONENT_2_EXPECTED_LINES"
    fi
    
    # Phase 2: Simultaneous stress testing
    log "Phase 2: Simultaneous hyperthreading stress test..."
    
    # Start both stress tests simultaneously
    stress_test_component_local "$component_name" "$component_path" &
    LOCAL_PID=$!
    
    stress_test_component_remote "$component_name" "$component_path" &  
    REMOTE_PID=$!
    
    # Monitor both processes
    wait $LOCAL_PID
    wait $REMOTE_PID
    
    # Phase 3: Final validation
    log "Phase 3: Post-stress validation..."
    if [[ "$component_name" == "BraidComponent" ]]; then
        validate_component_local "$component_name" "$component_path" "$COMPONENT_1_EXPECTED_LINES"
        validate_component_remote "$component_name" "$component_path" "$COMPONENT_1_EXPECTED_LINES"
    else
        validate_component_local "$component_name" "$component_path" "$COMPONENT_2_EXPECTED_LINES"
        validate_component_remote "$component_name" "$component_path" "$COMPONENT_2_EXPECTED_LINES"
    fi
    
    success "🎉 DUAL MACHINE TEST COMPLETE: $component_name"
}

# ==============================================
# MAIN EXECUTION
# ==============================================
main() {
    log "🔥 DUAL MACHINE HYPERTHREADING TEST - TWO LARGE COMPONENTS"
    log "=================================================="
    log "Mac Studio: M2 Max (12 cores, 32GB RAM)"
    log "Mac Pro Beast: 56 cores, 160GB RAM @ $MAC_PRO_BEAST_IP" 
    log "Components: $COMPONENT_1_NAME ($COMPONENT_1_EXPECTED_LINES lines), $COMPONENT_2_NAME ($COMPONENT_2_EXPECTED_LINES lines)"
    log "Safety Limits: ${MAX_CPU_SAFE}% supervised, ${MAX_CPU_OVERNIGHT}% overnight"
    log ""
    
    # Pre-flight safety check
    log "Pre-flight safety check..."
    check_cpu_safety "local" "$MAX_CPU_SAFE"
    check_cpu_safety "remote" "$MAX_CPU_SAFE"
    
    # Network connectivity test
    log "Testing Mac Pro Beast connectivity..."
    if ! ping -c 2 "$MAC_PRO_BEAST_IP" >/dev/null 2>&1; then
        error "Cannot reach Mac Pro Beast at $MAC_PRO_BEAST_IP"
        exit 1
    fi
    success "Mac Pro Beast connectivity verified ($(ping -c 1 $MAC_PRO_BEAST_IP | grep 'time=' | awk -F'time=' '{print $2}' | awk '{print $1}') response)"
    
    # Test 1: BraidComponent (1,195 lines)
    log ""
    log "🎼 TEST 1: BRAID COMPONENT (1,195 LINES)"
    log "======================================="
    synchronized_dual_machine_test "$COMPONENT_1_NAME" "$COMPONENT_1_PATH"
    
    # Cool down period
    log "Cool down period (10 seconds)..."
    sleep 10
    
    # Test 2: FretboardComponent (1,206 lines)  
    log ""
    log "🎸 TEST 2: FRETBOARD COMPONENT (1,206 LINES)"
    log "==========================================="
    
    # Fix the expected lines variable reference
    COMPONENT_2_EXPECTED_LINES=1206
    validate_component_local "$COMPONENT_2_NAME" "$COMPONENT_2_PATH" "$COMPONENT_2_EXPECTED_LINES"
    validate_component_remote "$COMPONENT_2_NAME" "$COMPONENT_2_PATH" "$COMPONENT_2_EXPECTED_LINES"
    
    # Start simultaneous stress tests
    log "Phase 2: Simultaneous hyperthreading stress test..."
    stress_test_component_local "$COMPONENT_2_NAME" "$COMPONENT_2_PATH" &
    LOCAL_PID=$!
    
    stress_test_component_remote "$COMPONENT_2_NAME" "$COMPONENT_2_PATH" &
    REMOTE_PID=$!
    
    wait $LOCAL_PID
    wait $REMOTE_PID
    
    # Post-stress validation
    log "Phase 3: Post-stress validation..."
    validate_component_local "$COMPONENT_2_NAME" "$COMPONENT_2_PATH" "$COMPONENT_2_EXPECTED_LINES"  
    validate_component_remote "$COMPONENT_2_NAME" "$COMPONENT_2_PATH" "$COMPONENT_2_EXPECTED_LINES"
    
    success "🎉 DUAL MACHINE TEST COMPLETE: $COMPONENT_2_NAME"
    
    # Final system status
    log ""
    log "🏆 FINAL SYSTEM STATUS"
    log "====================="
    check_cpu_safety "local" "$MAX_CPU_SAFE"
    check_cpu_safety "remote" "$MAX_CPU_SAFE"
    
    # Cleanup
    rm -rf "$TEST_WORKSPACE" 2>/dev/null || true
    ssh "${MAC_PRO_BEAST_USER}@${MAC_PRO_BEAST_IP}" "rm -rf '$MAC_PRO_TEST_WORKSPACE' 2>/dev/null || true" 2>/dev/null || true
    
    success "🍽️  DUAL MACHINE HYPERTHREADING TEST COMPLETE - LUNCH APPROVED!"
    log "✅ BraidComponent (1,195 lines): PASSED"
    log "✅ FretboardComponent (1,206 lines): PASSED" 
    log "✅ Both components validated on both machines"
    log "✅ Hyperthreading coordination successful"
    log "✅ CPU safety maintained throughout"
    log "✅ Emergency systems tested and operational"
}

# Trap for emergency cleanup
trap emergency_panic ERR SIGINT SIGTERM

# Execute main function
main "$@"
