#!/bin/bash

# ULTIMATE EMERGENCY KILL SYSTEM - VS CODE SAFE
# Mark van den Dool - August 16, 2025
# HANDLES VS CODE SPAWNED PROCESSES PROPERLY

set +e  # Continue on errors

# ==============================================
# EMERGENCY KILL FUNCTIONS
# ==============================================

log() {
    echo "[$(date '+%H:%M:%S')] 🚨 EMERGENCY: $1"
}

ultimate_nuclear_kill() {
    log "ULTIMATE NUCLEAR KILL ACTIVATED"
    
    # Stage 1: Kill all stress test processes
    log "Stage 1: Killing stress test processes..."
    sudo pkill -9 -f "yes" 2>/dev/null || true
    sudo pkill -9 -f "stress" 2>/dev/null || true
    sudo pkill -9 -f "nuclear" 2>/dev/null || true
    sudo pkill -9 -f "aggressive" 2>/dev/null || true
    sudo pkill -9 -f "hyperthreading" 2>/dev/null || true
    
    # Stage 2: Kill CPU intensive operations
    log "Stage 2: Killing CPU intensive operations..."
    sudo pkill -9 -f "shasum" 2>/dev/null || true
    sudo pkill -9 -f "sort" 2>/dev/null || true
    sudo pkill -9 -f "uniq" 2>/dev/null || true
    sudo pkill -9 -f "grep -E" 2>/dev/null || true
    
    # Stage 3: Kill bash processes spawned by test scripts (but not current shell)
    log "Stage 3: Killing test script bash processes..."
    # Get current shell PID to avoid killing ourselves
    CURRENT_SHELL_PID=$$
    PARENT_SHELL_PID=$(ps -p $$ -o ppid= | xargs)
    
    # Kill bash processes that are NOT our current shell or parent
    ps aux | grep bash | grep -v grep | awk '{print $2}' | while read pid; do
        if [[ "$pid" != "$CURRENT_SHELL_PID" && "$pid" != "$PARENT_SHELL_PID" ]]; then
            # Only kill if it's running stress-related commands
            if ps -p "$pid" -o command= | grep -q -E "(yes|stress|nuclear|aggressive|hyperthreading)"; then
                log "Killing stress-related bash PID: $pid"
                sudo kill -9 "$pid" 2>/dev/null || true
            fi
        fi
    done
    
    # Stage 4: Clean up VS Code task runners
    log "Stage 4: Cleaning VS Code task runners..."
    # Kill node processes that might be running our scripts
    ps aux | grep node | grep -v grep | awk '{print $2}' | while read pid; do
        if ps -p "$pid" -o command= | grep -q -E "(stress|nuclear|aggressive|hyperthreading)"; then
            log "Killing stress-related node PID: $pid"
            sudo kill -9 "$pid" 2>/dev/null || true
        fi
    done
    
    # Stage 5: Remote cleanup
    log "Stage 5: Remote Mac Pro Beast cleanup..."
    ssh "${MAC_PRO_BEAST_USER:-vandendool}@${MAC_PRO_BEAST_IP:-10.0.0.115}" "
        # Kill all stress processes on remote
        sudo pkill -9 -f 'yes' 2>/dev/null || true
        sudo pkill -9 -f 'stress' 2>/dev/null || true
        sudo pkill -9 -f 'nuclear' 2>/dev/null || true
        sudo pkill -9 -f 'aggressive' 2>/dev/null || true
        sudo pkill -9 -f 'shasum' 2>/dev/null || true
        sudo pkill -9 -f 'sort' 2>/dev/null || true
        sudo pkill -9 -f 'uniq' 2>/dev/null || true
        echo 'Remote emergency cleanup complete'
    " 2>/dev/null || true
    
    # Stage 6: Final system check
    log "Stage 6: Final system status check..."
    sleep 3
    
    local cpu_usage=$(top -l 1 | awk '/CPU usage:/ {print $3}' | sed 's/%//')
    local cpu_num=$(echo "$cpu_usage" | awk '{print int($1)}')
    
    if (( cpu_num < 50 )); then
        log "✅ SUCCESS: CPU usage back to normal (${cpu_usage}%)"
        return 0
    else
        log "⚠️  WARNING: CPU still high (${cpu_usage}%) - may need Activity Monitor"
        log "📋 MANUAL STEPS:"
        log "1. Open Activity Monitor"
        log "2. Sort by CPU usage"
        log "3. Force quit any remaining 'bash', 'yes', or high CPU processes"
        log "4. Check for VS Code extension processes"
        return 1
    fi
}

activity_monitor_guide() {
    log "🎯 ACTIVITY MONITOR EMERGENCY GUIDE"
    echo ""
    echo "If CPU is still 100%, follow these steps:"
    echo ""
    echo "1. 🔍 OPEN ACTIVITY MONITOR:"
    echo "   - Press Cmd+Space, type 'Activity Monitor'"
    echo ""
    echo "2. 📊 SORT BY CPU:"
    echo "   - Click 'CPU' tab"
    echo "   - Click '%CPU' column to sort by highest"
    echo ""
    echo "3. 🎯 LOOK FOR THESE PROCESSES:"
    echo "   - bash (multiple instances)"
    echo "   - yes"
    echo "   - stress"
    echo "   - shasum"
    echo "   - sort/uniq/grep"
    echo "   - node (if running our scripts)"
    echo ""
    echo "4. ☠️  FORCE QUIT HIGH CPU PROCESSES:"
    echo "   - Select the process"
    echo "   - Click 'Force Quit' (X button)"
    echo "   - Confirm the kill"
    echo ""
    echo "5. 🔄 REFRESH AND REPEAT:"
    echo "   - Wait 2-3 seconds"
    echo "   - Look for new high CPU processes"
    echo "   - Force quit until CPU drops below 50%"
    echo ""
}

check_system_health() {
    log "🏥 SYSTEM HEALTH CHECK"
    
    # CPU Status
    local cpu_usage=$(top -l 1 | awk '/CPU usage:/ {print $3}' | sed 's/%//')
    log "💻 Mac Studio CPU: ${cpu_usage}%"
    
    # Memory Status
    local memory=$(top -l 1 | awk '/PhysMem:/ {print $2 " used, " $6 " unused"}')
    log "💾 Mac Studio Memory: $memory"
    
    # Remote status
    local remote_cpu=$(ssh "${MAC_PRO_BEAST_USER:-vandendool}@${MAC_PRO_BEAST_IP:-10.0.0.115}" "top -l 1 | awk '/CPU usage:/ {print \$3}' | sed 's/%//'" 2>/dev/null || echo "unavailable")
    log "🖥️  Mac Pro Beast CPU: ${remote_cpu}%"
    
    # Process count check
    local stress_count=$(ps aux | grep -c -E "(yes|stress|nuclear|aggressive)" | head -1)
    if (( stress_count > 1 )); then  # > 1 because grep counts itself
        log "⚠️  WARNING: $((stress_count - 1)) stress processes still running"
        log "📋 Remaining processes:"
        ps aux | grep -E "(yes|stress|nuclear|aggressive)" | grep -v grep
    else
        log "✅ No stress processes detected"
    fi
}

# ==============================================
# MAIN EXECUTION
# ==============================================
case "${1:-ultimate}" in
    "ultimate"|"nuclear"|"emergency")
        ultimate_nuclear_kill
        ;;
    "guide"|"help"|"manual")
        activity_monitor_guide
        ;;
    "check"|"status"|"health")
        check_system_health
        ;;
    *)
        log "🚨 ULTIMATE EMERGENCY KILL SYSTEM"
        echo ""
        echo "Usage:"
        echo "  $0 ultimate    - Full nuclear kill (default)"
        echo "  $0 guide       - Activity Monitor guide"
        echo "  $0 check       - System health check"
        echo ""
        echo "🔥 RUNNING ULTIMATE KILL NOW..."
        sleep 2
        ultimate_nuclear_kill
        ;;
esac

# Always show final status
echo ""
check_system_health
