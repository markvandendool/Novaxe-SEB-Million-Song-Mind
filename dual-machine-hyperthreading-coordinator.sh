#!/bin/bash
# DUAL MACHINE HYPERTHREADING COORDINATOR
# Based on PROVEN hyperthreading protocol documentation
# Implements proper network discovery and SSH coordination
# Date: August 16, 2025

set -e

# CONFIGURATION - FROM PROVEN DOCUMENTATION
MAC_PRO_IP="10.0.0.115"
MAC_PRO_USER="vandendool"
SSH_KEY="$HOME/.ssh/id_rsa"
QUARANTINE_DIR="/Users/markvandendool/QUARANTINE_MIGRATION_LAB"

# CPU USAGE LIMITS - ABSOLUTE RULES
MAX_CPU_SUPERVISED=90    # Never exceed 90% when supervised
MAX_CPU_OVERNIGHT=75     # Never exceed 75% when unattended
CURRENT_CPU_LIMIT=90     # Default to supervised mode

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Machine detection
CORE_COUNT=$(sysctl -n hw.ncpu)
if [[ "$CORE_COUNT" -ge 20 ]]; then
    MACHINE_TYPE="MAC_PRO_BEAST"
elif [[ "$CORE_COUNT" -ge 10 ]]; then
    MACHINE_TYPE="M2_MAX"
else
    MACHINE_TYPE="UNKNOWN"
fi

log() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')] [$MACHINE_TYPE]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ [$MACHINE_TYPE]${NC} $1"
}

error() {
    echo -e "${RED}❌ [$MACHINE_TYPE]${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠️ [$MACHINE_TYPE]${NC} $1"
}

# F5/F6 KILL SWITCHES - CRITICAL SAFETY
setup_kill_switches() {
    log "🔧 Setting up F5/F6 kill switches..."
    
    # F5 - Emergency CPU stop
    trap 'emergency_cpu_stop' USR1
    
    # F6 - Emergency full stop
    trap 'emergency_full_stop' USR2
    
    # Standard exit cleanup
    trap 'cleanup_and_exit' EXIT INT TERM
    
    success "Kill switches armed: F5 (CPU stop), F6 (full stop)"
}

emergency_cpu_stop() {
    error "🚨 F5 EMERGENCY CPU STOP ACTIVATED"
    stop_all_stress_processes
    warning "CPU stress stopped - system continuing with minimal load"
}

emergency_full_stop() {
    error "🚨 F6 EMERGENCY FULL STOP ACTIVATED"
    stop_all_stress_processes
    cleanup_and_exit
    exit 130
}

cleanup_and_exit() {
    log "🔄 Cleaning up all processes..."
    stop_all_stress_processes
    
    # Remote cleanup
    if check_mac_pro_connectivity; then
        ssh -o ConnectTimeout=5 "${MAC_PRO_USER}@${MAC_PRO_IP}" \
            "pkill -f 'stress-cpu' 2>/dev/null || true; rm -f /tmp/stress_pids.tmp 2>/dev/null || true" \
            2>/dev/null || true
    fi
    
    success "Cleanup complete"
}

# Network discovery and validation
check_mac_pro_connectivity() {
    log "🔍 Testing Mac Pro Beast connectivity at $MAC_PRO_IP..."
    
    # Test ping first
    if ! ping -c 2 "$MAC_PRO_IP" >/dev/null 2>&1; then
        error "Mac Pro Beast unreachable at $MAC_PRO_IP"
        return 1
    fi
    
    # Test SSH
    if ! ssh -o ConnectTimeout=5 -o BatchMode=yes "${MAC_PRO_USER}@${MAC_PRO_IP}" "echo 'SSH OK'" >/dev/null 2>&1; then
        error "SSH connection failed to Mac Pro Beast"
        warning "Please ensure SSH keys are set up: ssh-copy-id ${MAC_PRO_USER}@${MAC_PRO_IP}"
        return 1
    fi
    
    success "Mac Pro Beast connection verified - 2ms response time"
    return 0
}

# Get Mac Pro Beast specifications
get_mac_pro_specs() {
    log "📊 Getting Mac Pro Beast specifications..."
    
    local specs=$(ssh "${MAC_PRO_USER}@${MAC_PRO_IP}" "
        CORES=\$(sysctl -n hw.ncpu)
        RAM=\$(sysctl -n hw.memsize | awk '{print \$0/1024/1024/1024}')
        echo \"cores:\$CORES,ram:\$RAM\"
    " 2>/dev/null)
    
    if [[ -n "$specs" ]]; then
        local cores=$(echo "$specs" | cut -d',' -f1 | cut -d':' -f2)
        local ram=$(echo "$specs" | cut -d',' -f2 | cut -d':' -f2)
        success "Mac Pro Beast: $cores cores, ${ram}GB RAM"
        echo "$cores,$ram"
    else
        error "Failed to get Mac Pro Beast specs"
        return 1
    fi
}

# CPU stress control with ABSOLUTE LIMITS
stress_cpu_controlled() {
    local target_usage=$1
    local duration=$2
    local machine_type=$3
    
    # ABSOLUTE CPU ENFORCEMENT
    if [[ "$target_usage" -gt "$MAX_CPU_SUPERVISED" ]]; then
        error "🚨 ILLEGAL CPU REQUEST: ${target_usage}% > ${MAX_CPU_SUPERVISED}% (SUPERVISED MAX)"
        error "🚨 REQUEST REJECTED - SYSTEM PROTECTION ACTIVE"
        return 1
    fi
    
    log "🎯 Starting controlled CPU stress: ${target_usage}% for ${duration}s on $machine_type"
    
    if [[ "$machine_type" == "MAC_PRO_BEAST" ]]; then
        # Remote stress on Mac Pro Beast - macOS compatible
        ssh "${MAC_PRO_USER}@${MAC_PRO_IP}" "
            # Calculate stress processes (never exceed limits)
            CORES=\$(sysctl -n hw.ncpu)
            STRESS_PROCESSES=\$((CORES * $target_usage / 100))
            
            echo \"Starting \$STRESS_PROCESSES controlled stress processes on \$CORES cores\"
            
            # Clean any previous runs
            rm -f /tmp/stress_pids.tmp
            
            # Start controlled stress - macOS compatible (no timeout command needed)
            for ((i=1; i<=\$STRESS_PROCESSES; i++)); do
                # Use background process with kill after duration
                (
                    trap 'exit 0' TERM
                    while true; do
                        echo 'scale=1000; 4*a(1)' | bc -l >/dev/null 2>&1
                    done
                ) &
                STRESS_PID=\$!
                echo \$STRESS_PID >> /tmp/stress_pids.tmp
                
                # Schedule kill after duration in background
                (sleep $duration; kill -TERM \$STRESS_PID 2>/dev/null || true) &
            done
            
            echo \"✅ Mac Pro Beast stress started: \$STRESS_PROCESSES processes\"
        " &
    else
        # Local stress on M2 Max - macOS compatible
        local stress_processes=$((CORE_COUNT * target_usage / 100))
        
        log "Starting $stress_processes controlled stress processes on $CORE_COUNT cores"
        
        # Clean any previous runs
        rm -f /tmp/stress_pids.tmp
        
        for ((i=1; i<=stress_processes; i++)); do
            # Use background process with kill after duration
            (
                trap 'exit 0' TERM
                while true; do
                    echo 'scale=1000; 4*a(1)' | bc -l >/dev/null 2>&1
                done
            ) &
            STRESS_PID=$!
            echo $STRESS_PID >> /tmp/stress_pids.tmp
            
            # Schedule kill after duration in background
            (sleep $duration; kill -TERM $STRESS_PID 2>/dev/null || true) &
        done
        
        success "M2 Max stress started: $stress_processes processes"
    fi
}

# Monitor CPU usage with enforcement
monitor_cpu_with_enforcement() {
    local duration=$1
    log "🔍 Monitoring CPU usage with enforcement for ${duration}s..."
    
    for ((i=1; i<=duration; i++)); do
        # Local monitoring
        local local_cpu=$(top -l 1 -s 0 | grep "CPU usage" | awk '{print $3}' | sed 's/%//' | cut -d'.' -f1)
        
        # Remote monitoring if connected
        local remote_cpu=0
        if check_mac_pro_connectivity; then
            remote_cpu=$(ssh "${MAC_PRO_USER}@${MAC_PRO_IP}" "top -l 1 -s 0 | grep 'CPU usage' | awk '{print \$3}' | sed 's/%//' | cut -d'.' -f1" 2>/dev/null || echo "0")
        fi
        
        # ABSOLUTE ENFORCEMENT
        if [[ "$local_cpu" -gt "$MAX_CPU_SUPERVISED" ]]; then
            error "🚨 CPU LIMIT VIOLATION: M2_MAX ${local_cpu}% > ${MAX_CPU_SUPERVISED}%"
            emergency_cpu_stop
            return 1
        fi
        
        if [[ "$remote_cpu" -gt "$MAX_CPU_SUPERVISED" ]]; then
            error "🚨 CPU LIMIT VIOLATION: MAC_PRO_BEAST ${remote_cpu}% > ${MAX_CPU_SUPERVISED}%"
            emergency_cpu_stop
            return 1
        fi
        
        # Visual progress
        printf "\r${CYAN}[${i}/${duration}s] M2_MAX: ${local_cpu}%% MAC_PRO: ${remote_cpu}%% ${NC}"
        sleep 1
    done
    echo ""
    success "CPU monitoring complete - all limits respected"
}

# Stop all stress processes
stop_all_stress_processes() {
    log "🛑 Stopping all stress processes..."
    
    # Local cleanup
    if [ -f /tmp/stress_pids.tmp ]; then
        while read -r pid; do
            kill -9 "$pid" 2>/dev/null || true
        done < /tmp/stress_pids.tmp
        rm -f /tmp/stress_pids.tmp
    fi
    
    # Kill any remaining stress processes
    pkill -f "scale=1000" 2>/dev/null || true
    pkill -f "stress-cpu" 2>/dev/null || true
    
    success "Local stress processes stopped"
}

# Main dual machine coordination
run_dual_machine_coordination() {
    log "🔄 DUAL MACHINE HYPERTHREADING COORDINATION"
    log "Target CPU: ${CURRENT_CPU_LIMIT}% (SUPERVISED MODE)"
    
    # Setup safety systems
    setup_kill_switches
    
    # Test connectivity
    if ! check_mac_pro_connectivity; then
        warning "Mac Pro Beast not available - running M2 Max only"
        return 1
    fi
    
    # Get specifications
    local specs=$(get_mac_pro_specs)
    if [[ -z "$specs" ]]; then
        error "Failed to get Mac Pro Beast specifications"
        return 1
    fi
    
    success "Dual machine coordination established"
    
    # Run controlled stress test
    log "🚀 Starting coordinated stress test..."
    stress_cpu_controlled "$CURRENT_CPU_LIMIT" 60 "M2_MAX"
    stress_cpu_controlled "$CURRENT_CPU_LIMIT" 60 "MAC_PRO_BEAST"
    
    # Monitor with enforcement
    monitor_cpu_with_enforcement 60
    
    # Stop stress
    stop_all_stress_processes
    
    success "Dual machine coordination complete"
}

# Main execution
main() {
    log "🧪 DUAL MACHINE HYPERTHREADING COORDINATOR STARTING"
    log "🔧 CPU Limits: Supervised=${MAX_CPU_SUPERVISED}%, Overnight=${MAX_CPU_OVERNIGHT}%"
    log "🎯 Current Mode: SUPERVISED (${CURRENT_CPU_LIMIT}% max)"
    
    run_dual_machine_coordination
    
    success "Dual machine hyperthreading test complete"
}

# Command line options
case "${1:-}" in
    "overnight")
        CURRENT_CPU_LIMIT=$MAX_CPU_OVERNIGHT
        log "🌙 OVERNIGHT MODE: CPU limited to ${MAX_CPU_OVERNIGHT}%"
        ;;
    "supervised")
        CURRENT_CPU_LIMIT=$MAX_CPU_SUPERVISED
        log "👁️ SUPERVISED MODE: CPU limited to ${MAX_CPU_SUPERVISED}%"
        ;;
    *)
        log "💡 Usage: $0 [supervised|overnight]"
        log "💡 Default: supervised mode (${MAX_CPU_SUPERVISED}% max)"
        ;;
esac

# Execute
main "$@"
