#!/bin/bash

# F5/F6 KILL SWITCHES - EMERGENCY CPU CONTROL
# Based on CPU_USAGE_ABSOLUTE_RULES.md

# F5: Kill all Mac Pro processes
kill_mac_pro() {
    echo "🚨 F5 KILL SWITCH ACTIVATED - MAC PRO BEAST SHUTDOWN"
    
    # Try SSH connection to Mac Pro Beast
    if ssh -o ConnectTimeout=5 vandendool@Marks-Mac-Pro.local "echo 'Connected'" 2>/dev/null; then
        echo "📡 Mac Pro Beast found - killing all processes"
        ssh vandendool@Marks-Mac-Pro.local "
            echo '🚨 EMERGENCY SHUTDOWN - ALL PROCESSES KILLED'
            pkill -9 -f 'npm|ng|tsc|node|stress|angular|migration'
            pkill -9 -f 'bc.*4.*a.*1'
            killall -9 node npm ng tsc 2>/dev/null || true
            echo '✅ Mac Pro Beast processes terminated'
        "
    else
        echo "⚠️  Mac Pro Beast not accessible via SSH"
        echo "🔍 Scanning network for Mac Pro Beast..."
        arp -a | grep -i "mac-pro\|beast" || echo "Mac Pro not found in ARP table"
    fi
}

# F6: Kill all Mac Studio processes (current machine)
kill_mac_studio() {
    echo "🚨 F6 KILL SWITCH ACTIVATED - MAC STUDIO SHUTDOWN"
    echo "🔥 Killing all processes on current machine"
    
    # Kill stress processes
    pkill -9 -f "stress\|cpu-monitor\|hyperthreading" 2>/dev/null || true
    pkill -9 -f "bc.*4.*a.*1" 2>/dev/null || true
    
    # Kill Angular/Node processes
    pkill -9 -f "npm|ng|tsc|node|angular|migration" 2>/dev/null || true
    killall -9 node npm ng tsc 2>/dev/null || true
    
    # Clean up quarantine directories
    rm -rf ~/QUARANTINE_MIGRATION_LAB/hyperthreading-stress-test 2>/dev/null || true
    rm -f /tmp/dual_machine_sync.lock 2>/dev/null || true
    
    echo "✅ Mac Studio processes terminated"
}

# CPU Usage Checker with ABSOLUTE LIMITS
check_cpu_limits() {
    local cpu_usage=$(top -l 1 | grep 'CPU usage' | awk '{print $3}' | sed 's/%//' | cut -d. -f1)
    local is_supervised="$1"  # "supervised" or "overnight"
    
    if [[ "$is_supervised" == "overnight" ]]; then
        # OVERNIGHT MODE: MAX 75% - NO EXCEPTIONS
        if [[ $cpu_usage -gt 75 ]]; then
            echo "🚨 OVERNIGHT CPU VIOLATION: ${cpu_usage}% > 75% LIMIT"
            echo "🚨 UNATTENDED OPERATIONS MUST NEVER EXCEED 75%"
            kill_mac_studio
            kill_mac_pro
            return 1
        fi
    else
        # SUPERVISED MODE: MAX 90% - NO EXCEPTIONS  
        if [[ $cpu_usage -gt 90 ]]; then
            echo "🚨 SUPERVISED CPU VIOLATION: ${cpu_usage}% > 90% LIMIT"
            echo "🚨 IMMEDIATE SHUTDOWN REQUIRED"
            kill_mac_studio
            kill_mac_pro
            return 1
        fi
    fi
    
    echo "✅ CPU Usage: ${cpu_usage}% (within limits for $is_supervised mode)"
    return 0
}

# Network discovery for Mac Pro Beast
discover_mac_pro() {
    echo "🔍 SEARCHING FOR MAC PRO BEAST..."
    
    # Method 1: ARP table scan
    echo "📡 Checking ARP table..."
    arp -a | grep -i "mac-pro\|beast\|192.168"
    
    # Method 2: Bonjour/mDNS discovery
    echo "🔎 Bonjour discovery..."
    dns-sd -B _ssh._tcp local. &
    DISCOVERY_PID=$!
    sleep 3
    kill $DISCOVERY_PID 2>/dev/null || true
    
    # Method 3: Common IP ranges
    echo "🌐 Scanning common IP ranges..."
    for ip in 192.168.1.{1..20} 192.168.0.{1..20}; do
        if ping -c 1 -W 1000 $ip >/dev/null 2>&1; then
            echo "🎯 Active IP found: $ip"
            # Try SSH to see if it's Mac Pro
            if ssh -o ConnectTimeout=2 vandendool@$ip "hostname" 2>/dev/null | grep -i "mac-pro\|beast"; then
                echo "🎉 MAC PRO BEAST FOUND: $ip"
                return 0
            fi
        fi
    done
    
    echo "❌ Mac Pro Beast not found on network"
    return 1
}

# Main execution
case "$1" in
    "F5"|"f5")
        kill_mac_pro
        ;;
    "F6"|"f6") 
        kill_mac_studio
        ;;
    "check")
        check_cpu_limits "${2:-supervised}"
        ;;
    "discover")
        discover_mac_pro
        ;;
    "emergency")
        echo "🚨 EMERGENCY SHUTDOWN - BOTH MACHINES"
        kill_mac_studio
        kill_mac_pro
        ;;
    *)
        echo "🚨 KILL SWITCHES AVAILABLE:"
        echo "  F5: Kill Mac Pro Beast processes"  
        echo "  F6: Kill Mac Studio processes"
        echo "  check [supervised|overnight]: Check CPU limits"
        echo "  discover: Find Mac Pro Beast on network"
        echo "  emergency: Kill all processes both machines"
        echo ""
        echo "CRITICAL RULES:"
        echo "  - SUPERVISED MAX: 90% CPU"
        echo "  - OVERNIGHT MAX: 75% CPU"  
        echo "  - NO FAKE WORK EVER"
        echo "  - REAL WORK ONLY"
        ;;
esac
