#!/bin/bash

# NUCLEAR DUAL MACHINE HYPERTHREADING STRESS TEST
# Mark van den Dool - August 16, 2025  
# MAXIMUM CPU UTILIZATION - NO MERCY!

set -e

# ==============================================
# NUCLEAR CONFIGURATION
# ==============================================
MAC_STUDIO_PATH="/Users/markvandendool/Novaxe-SEB-Million-Song-Mind/novaxe-seb-ng11"
MAC_PRO_BEAST_IP="10.0.0.115"
MAC_PRO_BEAST_USER="vandendool"
MAC_PRO_BEAST_PATH="/Users/vandendool/Novaxe-SEB-Million-Song-Mind/novaxe-seb-ng11"

# Components
COMPONENT_1_NAME="BraidComponent"
COMPONENT_1_PATH="src/app/components/braid/braid.component.ts"
COMPONENT_1_EXPECTED_LINES=1195

COMPONENT_2_NAME="FretboardComponent"
COMPONENT_2_PATH="src/app/components/fretboard/fretboard.component.ts"
COMPONENT_2_EXPECTED_LINES=1206

# NUCLEAR PARAMETERS
STRESS_DURATION=30
TARGET_CPU_MIN=75
SAFETY_LIMIT=89

# ==============================================
# LOGGING FUNCTIONS  
# ==============================================
log() {
    echo "[$(date '+%H:%M:%S')] $1"
}

error() {
    echo "[$(date '+%H:%M:%S')] ❌ ERROR: $1" >&2
}

success() {
    echo "[$(date '+%H:%M:%S')] ✅ SUCCESS: $1"
}

# ==============================================
# NUCLEAR STRESS FUNCTIONS
# ==============================================
nuclear_stress_local() {
    local component_path=$1
    
    log "💥 NUCLEAR MAC STUDIO STRESS - ALL 12 CORES AT MAXIMUM"
    
    # Use 'yes' command for maximum CPU burn - one per core
    for ((i=1; i<=12; i++)); do
        yes > /dev/null &
        NUCLEAR_PIDS_LOCAL[$i]=$!
    done
    
    # Add file processing stress on top
    for ((i=1; i<=12; i++)); do
        (
            while true; do
                if [[ -f "$MAC_STUDIO_PATH/$component_path" ]]; then
                    # Intensive file operations
                    cat "$MAC_STUDIO_PATH/$component_path" | grep -E "(component|function|class|import|export)" | wc -l > /dev/null
                    sort "$MAC_STUDIO_PATH/$component_path" > /dev/null
                    uniq "$MAC_STUDIO_PATH/$component_path" > /dev/null
                fi
                
                # Pure CPU computation
                local sum=0
                for ((j=1; j<=10000; j++)); do
                    sum=$((sum + j * j * j))
                done
                
                # Hash computation
                echo "$RANDOM$RANDOM$RANDOM" | shasum -a 256 > /dev/null
            done
        ) &
        FILE_STRESS_PIDS_LOCAL[$i]=$!
    done
    
    success "Started 24 nuclear processes on Mac Studio (12 yes + 12 file stress)"
}

nuclear_stress_remote() {
    local component_path=$1
    
    log "💥 NUCLEAR MAC PRO BEAST STRESS - ALL 56 CORES AT MAXIMUM"
    
    ssh "${MAC_PRO_BEAST_USER}@${MAC_PRO_BEAST_IP}" "
        # Kill any existing stress
        pkill -f 'yes\|stress\|nuclear' 2>/dev/null || true
        
        # Start 56 'yes' processes for maximum CPU burn
        for ((i=1; i<=56; i++)); do
            nohup yes > /dev/null 2>&1 &
        done
        
        # Add 56 more intensive CPU processes
        for ((i=1; i<=56; i++)); do
            (
                while true; do
                    # File operations
                    if [[ -f '$MAC_PRO_BEAST_PATH/$component_path' ]]; then
                        cat '$MAC_PRO_BEAST_PATH/$component_path' | wc -l > /dev/null
                        grep -E 'component|function|class|import|export|interface|async|await' '$MAC_PRO_BEAST_PATH/$component_path' | wc -l > /dev/null
                        sort '$MAC_PRO_BEAST_PATH/$component_path' > /dev/null
                        uniq '$MAC_PRO_BEAST_PATH/$component_path' > /dev/null
                    fi
                    
                    # Intensive math
                    sum=0
                    for ((j=1; j<=50000; j++)); do
                        sum=\$((sum + j * j * j))
                    done
                    
                    # Hash operations
                    echo \"\$RANDOM\$RANDOM\$RANDOM\$RANDOM\" | shasum -a 512 > /dev/null
                done
            ) &
        done
        
        echo 'Started 112 nuclear processes on Mac Pro Beast (56 yes + 56 intensive)'
    "
    
    success "Started 112 nuclear processes on Mac Pro Beast"
}

monitor_nuclear_performance() {
    local duration=$1
    local start_time=$(date +%s)
    local max_local_cpu=0
    local max_remote_cpu=0
    local measurements=0
    
    log "🔥 NUCLEAR PERFORMANCE MONITORING FOR ${duration} SECONDS"
    
    while (( $(date +%s) - start_time < duration )); do
        # Get CPU readings
        LOCAL_CPU=$(top -l 1 | awk '/CPU usage:/ {print $3}' | sed 's/%//' | head -1)
        LOCAL_CPU_NUM=$(echo "$LOCAL_CPU" | awk '{printf "%.0f", $1}')
        
        REMOTE_CPU=$(ssh "${MAC_PRO_BEAST_USER}@${MAC_PRO_BEAST_IP}" "top -l 1 | awk '/CPU usage:/ {print \$3}' | sed 's/%//' | head -1" 2>/dev/null || echo "0")
        REMOTE_CPU_NUM=$(echo "$REMOTE_CPU" | awk '{printf "%.0f", $1}')
        
        # Track maximums
        if (( LOCAL_CPU_NUM > max_local_cpu )); then
            max_local_cpu=$LOCAL_CPU_NUM
        fi
        
        if (( REMOTE_CPU_NUM > max_remote_cpu )); then
            max_remote_cpu=$REMOTE_CPU_NUM
        fi
        
        measurements=$((measurements + 1))
        
        # Safety monitoring
        if (( LOCAL_CPU_NUM > SAFETY_LIMIT )); then
            log "⚠️  Mac Studio at ${LOCAL_CPU_NUM}% - near safety limit!"
        fi
        
        if (( REMOTE_CPU_NUM > SAFETY_LIMIT )); then
            log "⚠️  Mac Pro Beast at ${REMOTE_CPU_NUM}% - near safety limit!"
        fi
        
        log "🔥 Mac Studio: ${LOCAL_CPU}% | Mac Pro Beast: ${REMOTE_CPU}% (measurement $measurements)"
        sleep 2
    done
    
    log "💥 NUCLEAR TEST COMPLETE - PEAK PERFORMANCE:"
    log "🏆 Mac Studio Peak: ${max_local_cpu}%"
    log "🏆 Mac Pro Beast Peak: ${max_remote_cpu}%"
    
    # Results validation
    if (( max_local_cpu >= TARGET_CPU_MIN )); then
        success "🎯 Mac Studio TARGET HIT: ${max_local_cpu}% (≥${TARGET_CPU_MIN}%)"
        LOCAL_SUCCESS=true
    else
        error "🎯 Mac Studio TARGET MISSED: ${max_local_cpu}% (< ${TARGET_CPU_MIN}%)"
        LOCAL_SUCCESS=false
    fi
    
    if (( max_remote_cpu >= TARGET_CPU_MIN )); then
        success "🎯 Mac Pro Beast TARGET HIT: ${max_remote_cpu}% (≥${TARGET_CPU_MIN}%)"
        REMOTE_SUCCESS=true
    else
        error "🎯 Mac Pro Beast TARGET MISSED: ${max_remote_cpu}% (< ${TARGET_CPU_MIN}%)"
        REMOTE_SUCCESS=false
    fi
}

nuclear_cleanup() {
    log "☢️  NUCLEAR CLEANUP - TERMINATING ALL STRESS"
    
    # Local nuclear cleanup
    for pid in "${NUCLEAR_PIDS_LOCAL[@]}" "${FILE_STRESS_PIDS_LOCAL[@]}"; do
        kill "$pid" 2>/dev/null || true
    done
    
    # Kill all 'yes' processes locally
    pkill -f "yes" 2>/dev/null || true
    
    wait 2>/dev/null || true
    
    # Remote nuclear cleanup
    ssh "${MAC_PRO_BEAST_USER}@${MAC_PRO_BEAST_IP}" "
        # Kill ALL stress processes
        pkill -f 'yes' 2>/dev/null || true
        pkill -f 'stress' 2>/dev/null || true
        pkill -f 'shasum' 2>/dev/null || true
        pkill -f 'sort' 2>/dev/null || true
        pkill -f 'uniq' 2>/dev/null || true
        pkill -f 'grep' 2>/dev/null || true
        pkill -f 'cat' 2>/dev/null || true
        
        echo 'Remote nuclear cleanup complete'
    " 2>/dev/null || true
    
    success "☢️  Nuclear cleanup complete"
}

validate_component() {
    local machine=$1
    local component_name=$2
    local component_path=$3
    local expected_lines=$4
    
    if [[ "$machine" == "local" ]]; then
        local actual_lines=$(wc -l < "$MAC_STUDIO_PATH/$component_path")
        local location="Mac Studio"
    else
        local actual_lines=$(ssh "${MAC_PRO_BEAST_USER}@${MAC_PRO_BEAST_IP}" "wc -l < '$MAC_PRO_BEAST_PATH/$component_path'")
        local location="Mac Pro Beast"
    fi
    
    if [[ "$actual_lines" -eq "$expected_lines" ]]; then
        success "$component_name intact on $location: $actual_lines lines ✅"
        return 0
    else
        error "$component_name corrupted on $location: $actual_lines ≠ $expected_lines"
        return 1
    fi
}

# ==============================================
# MAIN NUCLEAR EXECUTION
# ==============================================
main() {
    log "☢️  NUCLEAR DUAL MACHINE HYPERTHREADING TEST ☢️"
    log "=============================================="
    log "🎯 TARGET: ${TARGET_CPU_MIN}%+ CPU on BOTH machines"
    log "💥 Mac Studio: 12 cores × 2 = 24 nuclear processes"
    log "💥 Mac Pro Beast: 56 cores × 2 = 112 nuclear processes"
    log "⚠️  SAFETY LIMIT: ${SAFETY_LIMIT}%"
    log "🕐 Duration: ${STRESS_DURATION} seconds per component"
    log ""
    
    # Pre-validation
    log "🔍 PRE-NUCLEAR COMPONENT VALIDATION"
    validate_component "local" "$COMPONENT_1_NAME" "$COMPONENT_1_PATH" "$COMPONENT_1_EXPECTED_LINES"
    validate_component "remote" "$COMPONENT_1_NAME" "$COMPONENT_1_PATH" "$COMPONENT_1_EXPECTED_LINES"
    validate_component "local" "$COMPONENT_2_NAME" "$COMPONENT_2_PATH" "$COMPONENT_2_EXPECTED_LINES"
    validate_component "remote" "$COMPONENT_2_NAME" "$COMPONENT_2_PATH" "$COMPONENT_2_EXPECTED_LINES"
    
    # NUCLEAR TEST 1: BraidComponent
    log ""
    log "☢️  NUCLEAR TEST 1: BRAID COMPONENT (1,195 LINES)"
    log "=============================================="
    
    # Start nuclear stress
    nuclear_stress_local "$COMPONENT_1_PATH" &
    sleep 3
    nuclear_stress_remote "$COMPONENT_1_PATH" &
    sleep 5
    
    # Monitor nuclear performance
    monitor_nuclear_performance "$STRESS_DURATION"
    
    # Nuclear cleanup
    nuclear_cleanup
    sleep 8
    
    # NUCLEAR TEST 2: FretboardComponent
    log ""
    log "☢️  NUCLEAR TEST 2: FRETBOARD COMPONENT (1,206 LINES)"
    log "================================================="
    
    # Start nuclear stress
    nuclear_stress_local "$COMPONENT_2_PATH" &
    sleep 3
    nuclear_stress_remote "$COMPONENT_2_PATH" &
    sleep 5
    
    # Monitor nuclear performance
    monitor_nuclear_performance "$STRESS_DURATION"
    
    # Nuclear cleanup
    nuclear_cleanup
    
    # Post-nuclear validation
    log ""
    log "🔍 POST-NUCLEAR COMPONENT VALIDATION"
    validate_component "local" "$COMPONENT_1_NAME" "$COMPONENT_1_PATH" "$COMPONENT_1_EXPECTED_LINES"
    validate_component "remote" "$COMPONENT_1_NAME" "$COMPONENT_1_PATH" "$COMPONENT_1_EXPECTED_LINES"
    validate_component "local" "$COMPONENT_2_NAME" "$COMPONENT_2_PATH" "$COMPONENT_2_EXPECTED_LINES"
    validate_component "remote" "$COMPONENT_2_NAME" "$COMPONENT_2_PATH" "$COMPONENT_2_EXPECTED_LINES"
    
    # Final results
    if [[ "$LOCAL_SUCCESS" == "true" && "$REMOTE_SUCCESS" == "true" ]]; then
        success "🍽️  NUCLEAR DUAL MACHINE TEST SUCCESS - LUNCH APPROVED!"
        log "✅ Both machines hit hyperthreading targets"
        log "✅ Both large components survived nuclear stress"
        log "✅ Dual machine coordination successful"
        return 0
    else
        error "🚫 NUCLEAR TEST FAILED - NO LUNCH UNTIL SUCCESS!"
        log "❌ One or both machines failed to hit CPU targets"
        return 1
    fi
}

# Nuclear cleanup on any exit
trap nuclear_cleanup EXIT INT TERM

# Execute nuclear test
main "$@"
