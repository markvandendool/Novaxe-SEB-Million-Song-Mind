#!/bin/bash
# EMERGENCY CPU KILL SWITCH - F5/F6 IMPLEMENTATION
# Prevents CPU runaway situations and provides instant cleanup
# Date: August 16, 2025

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')] 🚨 EMERGENCY KILL${NC} $1"
}

success() {
    echo -e "${GREEN}✅ EMERGENCY KILL${NC} $1"
}

error() {
    echo -e "${RED}❌ EMERGENCY KILL${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠️ EMERGENCY KILL${NC} $1"
}

# F5 KILL SWITCH - CPU Stress Emergency Stop
f5_cpu_emergency_stop() {
    log "🚨 F5 EMERGENCY ACTIVATED - CPU STRESS STOP"
    
    # Kill all stress-related processes
    pkill -f "scale=.*bc" 2>/dev/null && success "Killed bc calculator processes" || warning "No bc processes found"
    pkill -f "while.*true" 2>/dev/null && success "Killed while loops" || warning "No while loops found" 
    pkill -f "timeout.*bash" 2>/dev/null && success "Killed timeout processes" || warning "No timeout processes found"
    pkill -f "stress.*cpu" 2>/dev/null && success "Killed stress processes" || warning "No stress processes found"
    
    # Clean up PID tracking files
    rm -f /tmp/stress_pids.tmp 2>/dev/null && success "Cleaned PID tracking file" || warning "No PID file found"
    
    # Kill any runaway high CPU processes (>80% CPU)
    ps aux | awk '$3 > 80 {print $2}' | while read pid; do
        if [[ -n "$pid" && "$pid" != "PID" ]]; then
            kill -15 "$pid" 2>/dev/null && success "Killed high CPU process $pid" || warning "Could not kill process $pid"
        fi
    done
    
    success "F5 EMERGENCY CPU STOP COMPLETE"
}

# F6 KILL SWITCH - Full System Emergency Stop
f6_full_emergency_stop() {
    log "🚨 F6 EMERGENCY ACTIVATED - FULL SYSTEM STOP"
    
    # Run F5 first
    f5_cpu_emergency_stop
    
    # Kill all migration/build related processes
    pkill -f "node.*migration" 2>/dev/null && success "Killed migration processes" || warning "No migration processes found"
    pkill -f "npm.*build" 2>/dev/null && success "Killed build processes" || warning "No build processes found"
    pkill -f "angular.*build" 2>/dev/null && success "Killed Angular builds" || warning "No Angular builds found"
    pkill -f "ng.*build" 2>/dev/null && success "Killed ng build processes" || warning "No ng builds found"
    
    # Kill any hyperthreading test processes
    pkill -f "hyperthreading.*test" 2>/dev/null && success "Killed hyperthreading tests" || warning "No hyperthreading tests found"
    pkill -f "quarantine.*test" 2>/dev/null && success "Killed quarantine tests" || warning "No quarantine tests found"
    
    # Clean up quarantine directories
    if [[ -d "/Users/markvandendool/QUARANTINE_MIGRATION_LAB" ]]; then
        rm -rf /Users/markvandendool/QUARANTINE_MIGRATION_LAB/*/node_modules 2>/dev/null || true
        success "Cleaned quarantine node_modules"
    fi
    
    success "F6 FULL EMERGENCY STOP COMPLETE"
}

# CPU Monitor Emergency Stop
cpu_monitor_emergency_stop() {
    log "🚨 CPU MONITOR EMERGENCY STOP"
    
    # Kill CPU monitoring scripts
    pkill -f "cpu-monitor.sh" 2>/dev/null && success "Killed CPU monitors" || warning "No CPU monitors found"
    pkill -f "top.*cpu" 2>/dev/null && success "Killed top monitors" || warning "No top monitors found"
    
    success "CPU MONITOR EMERGENCY STOP COMPLETE"
}

# Runaway Process Emergency Detection and Kill
runaway_process_emergency_kill() {
    log "🔍 SCANNING FOR RUNAWAY PROCESSES (>90% CPU)"
    
    # Find processes using >90% CPU for emergency kill
    ps aux | awk '$3 > 90 {printf "%s %s %s\n", $2, $3, $11}' | while read pid cpu_pct command; do
        if [[ -n "$pid" && "$pid" != "PID" ]]; then
            warning "RUNAWAY DETECTED: PID $pid using $cpu_pct% CPU - $command"
            
            # Give process 5 seconds to stop gracefully
            kill -15 "$pid" 2>/dev/null || true
            sleep 5
            
            # Force kill if still running
            if kill -0 "$pid" 2>/dev/null; then
                kill -9 "$pid" 2>/dev/null && success "FORCE KILLED runaway process $pid" || error "Failed to kill $pid"
            else
                success "Process $pid stopped gracefully"
            fi
        fi
    done
}

# Remote Mac Pro Beast Emergency Stop
mac_pro_emergency_stop() {
    log "🔍 MAC PRO BEAST EMERGENCY STOP"
    
    local mac_pro_ip="10.0.0.115"
    local mac_pro_user="vandendool"
    
    # Test connectivity
    if ping -c 1 "$mac_pro_ip" >/dev/null 2>&1; then
        log "Stopping processes on Mac Pro Beast..."
        
        ssh -o ConnectTimeout=5 "${mac_pro_user}@${mac_pro_ip}" '
            pkill -f "scale=.*bc" 2>/dev/null || true
            pkill -f "while.*true" 2>/dev/null || true
            pkill -f "stress.*cpu" 2>/dev/null || true
            pkill -f "node.*migration" 2>/dev/null || true
            rm -f /tmp/stress_pids.tmp 2>/dev/null || true
            echo "Mac Pro Beast emergency stop complete"
        ' 2>/dev/null && success "Mac Pro Beast cleaned" || warning "Mac Pro Beast unreachable"
    else
        warning "Mac Pro Beast not reachable - skipping remote cleanup"
    fi
}

# Show current system status
show_system_status() {
    log "📊 CURRENT SYSTEM STATUS"
    
    echo "CPU Usage:"
    top -l 1 | grep "CPU usage" || echo "Could not get CPU usage"
    
    echo ""
    echo "High CPU Processes (>20%):"
    ps aux | awk '$3 > 20 {printf "PID: %s CPU: %s%% CMD: %s\n", $2, $3, $11}' | head -5
    
    echo ""
    echo "Memory Usage:"
    top -l 1 | grep "PhysMem" || echo "Could not get memory usage"
    
    echo ""
    success "System status check complete"
}

# TILDE ULTIMATE PANIC BUTTON - ALL KILL SWITCHES SIMULTANEOUSLY
tilde_ultimate_panic_emergency() {
    log "🚨🚨🚨 TILDE (~) ULTIMATE PANIC ACTIVATED - ALL KILL SWITCHES SIMULTANEOUSLY 🚨🚨🚨"
    
    # Execute ALL emergency procedures in parallel for maximum speed
    (
        log "🔥 STAGE 1: CPU EMERGENCY STOP"
        f5_cpu_emergency_stop
    ) &
    
    (
        log "🔥 STAGE 2: FULL SYSTEM STOP"
        f6_full_emergency_stop
    ) &
    
    (
        log "🔥 STAGE 3: MAC PRO BEAST EMERGENCY"
        mac_pro_emergency_stop
    ) &
    
    (
        log "🔥 STAGE 4: CPU MONITOR STOP"
        cpu_monitor_emergency_stop
    ) &
    
    (
        log "🔥 STAGE 5: RUNAWAY PROCESS KILL"
        runaway_process_emergency_kill
    ) &
    
    # Wait for all parallel operations to complete
    wait
    
    # Final nuclear cleanup
    log "🚨 NUCLEAR CLEANUP - FINAL STAGE"
    
    # Kill ANY process using >50% CPU (more aggressive)
    ps aux | awk '$3 > 50 {print $2}' | while read pid; do
        if [[ -n "$pid" && "$pid" != "PID" ]]; then
            kill -9 "$pid" 2>/dev/null && success "NUCLEAR KILLED process $pid" || true
        fi
    done
    
    # Clean ALL temporary files
    rm -rf /tmp/stress_pids.tmp /tmp/migration_*.tmp /tmp/quarantine_*.tmp 2>/dev/null || true
    
    # Clean ALL quarantine directories completely
    rm -rf /Users/markvandendool/QUARANTINE_MIGRATION_LAB 2>/dev/null && success "NUKED quarantine lab" || true
    
    success "🚨🚨🚨 TILDE ULTIMATE PANIC COMPLETE - SYSTEM SHOULD BE STABLE 🚨🚨🚨"
    
    # Show final status
    show_system_status
}

# Main function based on argument
main() {
    case "${1:-}" in
        "~"|"tilde"|"panic"|"ultimate")
            tilde_ultimate_panic_emergency
            ;;
        "f5"|"cpu")
            f5_cpu_emergency_stop
            show_system_status
            ;;
        "f6"|"full")
            f6_full_emergency_stop
            mac_pro_emergency_stop
            show_system_status
            ;;
        "monitor")
            cpu_monitor_emergency_stop
            ;;
        "runaway")
            runaway_process_emergency_kill
            ;;
        "mac-pro")
            mac_pro_emergency_stop
            ;;
        "status")
            show_system_status
            ;;
        *)
            echo "🚨 EMERGENCY KILL SWITCH - Usage:"
            echo "  $0 ~       - 🚨 TILDE ULTIMATE PANIC (ALL SIMULTANEOUS)"
            echo "  $0 f5      - F5 CPU emergency stop"
            echo "  $0 f6      - F6 full emergency stop" 
            echo "  $0 monitor - Stop CPU monitors"
            echo "  $0 runaway - Kill runaway processes (>90% CPU)"
            echo "  $0 mac-pro - Emergency stop Mac Pro Beast"
            echo "  $0 status  - Show system status"
            echo ""
            echo "🔥 KEYBOARD SHORTCUTS:"
            echo "  ~ (TILDE) = 🚨 ULTIMATE PANIC BUTTON (ALL KILL SWITCHES)"
            echo "  F5 = CPU Emergency Stop"
            echo "  F6 = Full Emergency Stop"
            ;;
    esac
}

# Execute main function
main "$@"
