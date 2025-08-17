#!/bin/bash
# cpu-monitor.sh
# CONTINUOUS CPU MONITORING FOR HYPERTHREADING VALIDATION

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

CORE_COUNT=$(sysctl -n hw.ncpu)
MACHINE_TYPE="UNKNOWN"

if [[ "$CORE_COUNT" -ge 20 ]]; then
    MACHINE_TYPE="MAC_PRO_BEAST"
elif [[ "$CORE_COUNT" -ge 10 ]]; then
    MACHINE_TYPE="M2_MAX"
fi

get_cpu_usage() {
    # Get CPU usage from top command
    local cpu_line=$(top -l 1 -s 0 | grep "CPU usage" | head -1)
    local user_cpu=$(echo "$cpu_line" | awk '{print $3}' | sed 's/%//')
    local sys_cpu=$(echo "$cpu_line" | awk '{print $5}' | sed 's/%//')
    
    # Calculate total CPU usage
    local total_cpu=$(echo "$user_cpu + $sys_cpu" | bc 2>/dev/null || echo "0")
    echo "$total_cpu"
}

get_load_average() {
    uptime | awk '{print $10}' | sed 's/,//'
}

get_memory_usage() {
    local mem_info=$(vm_stat)
    local pages_free=$(echo "$mem_info" | grep "Pages free" | awk '{print $3}' | sed 's/\.//')
    local pages_active=$(echo "$mem_info" | grep "Pages active" | awk '{print $3}' | sed 's/\.//')
    local pages_inactive=$(echo "$mem_info" | grep "Pages inactive" | awk '{print $3}' | sed 's/\.//')
    local pages_wired=$(echo "$mem_info" | grep "Pages wired down" | awk '{print $4}' | sed 's/\.//')
    
    local page_size=4096
    local total_pages=$((pages_free + pages_active + pages_inactive + pages_wired))
    local used_pages=$((pages_active + pages_inactive + pages_wired))
    local memory_usage=$((used_pages * 100 / total_pages))
    
    echo "$memory_usage"
}

display_status() {
    local cpu_usage=$1
    local load_avg=$2
    local mem_usage=$3
    local duration=$4
    
    # Determine status colors
    local cpu_color=$GREEN
    if (( $(echo "$cpu_usage > 80" | bc -l) )); then
        cpu_color=$RED
    elif (( $(echo "$cpu_usage > 60" | bc -l) )); then
        cpu_color=$YELLOW
    fi
    
    local mem_color=$GREEN
    if (( mem_usage > 80 )); then
        mem_color=$RED
    elif (( mem_usage > 60 )); then
        mem_color=$YELLOW
    fi
    
    # Create CPU usage bar
    local cpu_bars=$((${cpu_usage%.*} / 5))  # Each bar represents 5%
    local cpu_bar=""
    for ((i=0; i<cpu_bars && i<20; i++)); do
        cpu_bar+="█"
    done
    for ((i=cpu_bars; i<20; i++)); do
        cpu_bar+="░"
    done
    
    # Clear line and display status
    printf "\r\033[K"
    printf "${CYAN}[$MACHINE_TYPE]${NC} "
    printf "${cpu_color}CPU: %5.1f%% ${NC}[%s] " "$cpu_usage" "$cpu_bar"
    printf "${mem_color}MEM: %2d%% ${NC}" "$mem_usage"
    printf "${YELLOW}LOAD: %s ${NC}" "$load_avg"
    printf "${GREEN}CORES: %2d ${NC}" "$CORE_COUNT"
    printf "${CYAN}TIME: %ds${NC}" "$duration"
}

main() {
    local max_duration=${1:-300}  # Default 5 minutes
    local target_cpu=${2:-85}     # Default target 85% CPU
    
    echo -e "${CYAN}🖥️  HYPERTHREADING CPU MONITOR${NC}"
    echo -e "${CYAN}Machine: $MACHINE_TYPE ($CORE_COUNT cores)${NC}"
    echo -e "${CYAN}Target CPU Usage: ${target_cpu}%${NC}"
    echo -e "${CYAN}Monitoring Duration: ${max_duration}s${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
    echo ""
    
    local start_time=$(date +%s)
    local high_cpu_time=0
    local peak_cpu=0
    
    for ((duration=1; duration<=max_duration; duration++)); do
        local cpu_usage=$(get_cpu_usage)
        local load_avg=$(get_load_average)
        local mem_usage=$(get_memory_usage)
        
        # Track peak CPU
        if (( $(echo "$cpu_usage > $peak_cpu" | bc -l) )); then
            peak_cpu=$cpu_usage
        fi
        
        # Track high CPU time
        if (( $(echo "$cpu_usage >= $target_cpu" | bc -l) )); then
            high_cpu_time=$((high_cpu_time + 1))
        fi
        
        display_status "$cpu_usage" "$load_avg" "$mem_usage" "$duration"
        
        sleep 1
    done
    
    echo ""
    echo ""
    echo -e "${GREEN}📊 MONITORING COMPLETE${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}Peak CPU Usage: ${peak_cpu}%${NC}"
    echo -e "${GREEN}Time at >=${target_cpu}% CPU: ${high_cpu_time}s ($(( high_cpu_time * 100 / max_duration ))%)${NC}"
    echo -e "${GREEN}Average Load: $(get_load_average)${NC}"
    echo -e "${GREEN}Cores Utilized: $CORE_COUNT${NC}"
    
    # Validation
    local success_threshold=$((max_duration * 60 / 100))  # 60% of time at target
    
    if (( high_cpu_time >= success_threshold )); then
        echo -e "${GREEN}✅ HYPERTHREADING VALIDATION: PASSED${NC}"
        echo -e "${GREEN}   Successfully maintained ${target_cpu}%+ CPU usage${NC}"
        return 0
    else
        echo -e "${RED}❌ HYPERTHREADING VALIDATION: FAILED${NC}"
        echo -e "${RED}   Only ${high_cpu_time}s at target (need ${success_threshold}s+)${NC}"
        return 1
    fi
}

# Handle Ctrl+C gracefully
trap 'echo -e "\n${YELLOW}Monitoring stopped by user${NC}"; exit 0' INT

main "$@"
