#!/bin/bash

# 🖥️ DUAL-MACHINE REAL-TIME CPU MONITORING SYSTEM
# Monitors Mac Studio (local) + Mac Pro Beast (remote)
# Real-time updates every second with visual display

set -e

# Configuration
MAC_PRO_HOST="markvandendool@192.168.1.100"  # Update with actual Mac Pro IP
UPDATE_INTERVAL=1
LOG_FILE="cpu-monitoring-$(date +%Y%m%d_%H%M%S).log"

# Colors for visual display
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Bold colors
BOLD_RED='\033[1;31m'
BOLD_GREEN='\033[1;32m'
BOLD_YELLOW='\033[1;33m'
BOLD_BLUE='\033[1;34m'
BOLD_PURPLE='\033[1;35m'
BOLD_CYAN='\033[1;36m'

# Function to get Mac Studio (local) CPU info
get_local_cpu_info() {
    # Get overall CPU usage
    local cpu_usage=$(top -l 1 -s 0 | grep "CPU usage" | awk '{print $3}' | sed 's/%//')
    
    # Get top 5 CPU processes
    local top_processes=$(top -l 1 -o cpu -n 5 | tail -n +12 | head -5 | awk '{printf "%-20s %6s%%\n", $1, $3}')
    
    # Get memory usage
    local memory_usage=$(top -l 1 -s 0 | grep "PhysMem" | awk '{print $2}' | sed 's/M//')
    
    # Get load average
    local load_avg=$(uptime | awk -F'load averages:' '{print $2}' | xargs)
    
    echo "$cpu_usage|$memory_usage|$load_avg|$top_processes"
}

# Function to get Mac Pro Beast (remote) CPU info
get_remote_cpu_info() {
    # SSH command to get remote CPU info
    local remote_info=$(ssh -o ConnectTimeout=5 -o BatchMode=yes "$MAC_PRO_HOST" '
        cpu_usage=$(top -l 1 -s 0 | grep "CPU usage" | awk "{print \$3}" | sed "s/%//")
        memory_usage=$(top -l 1 -s 0 | grep "PhysMem" | awk "{print \$2}" | sed "s/M//")
        load_avg=$(uptime | awk -F"load averages:" "{print \$2}" | xargs)
        top_processes=$(top -l 1 -o cpu -n 5 | tail -n +12 | head -5 | awk "{printf \"%-20s %6s%%\\n\", \$1, \$3}")
        echo "$cpu_usage|$memory_usage|$load_avg|$top_processes"
    ' 2>/dev/null || echo "OFFLINE|||")
    
    echo "$remote_info"
}

# Function to draw CPU usage bar
draw_cpu_bar() {
    local usage=$1
    local width=50
    local filled=$((usage * width / 100))
    local empty=$((width - filled))
    
    # Choose color based on usage
    local color=$GREEN
    if (( $(echo "$usage > 70" | bc -l) )); then
        color=$RED
    elif (( $(echo "$usage > 50" | bc -l) )); then
        color=$YELLOW
    fi
    
    printf "${color}"
    printf '█%.0s' $(seq 1 $filled)
    printf "${NC}"
    printf '░%.0s' $(seq 1 $empty)
    printf " ${BOLD_WHITE}%5.1f%%${NC}" "$usage"
}

# Function to display machine status
display_machine_status() {
    local machine_name=$1
    local cpu_usage=$2
    local memory_usage=$3
    local load_avg=$4
    local top_processes=$5
    local is_online=$6
    
    if [ "$is_online" = "false" ]; then
        printf "${BOLD_RED}╔════════════════════════════════════════════════════════════════════════╗${NC}\n"
        printf "${BOLD_RED}║                          %-20s OFFLINE                          ║${NC}\n" "$machine_name"
        printf "${BOLD_RED}╚════════════════════════════════════════════════════════════════════════╝${NC}\n"
        return
    fi
    
    # Header
    printf "${BOLD_CYAN}╔════════════════════════════════════════════════════════════════════════╗${NC}\n"
    printf "${BOLD_CYAN}║                          %-20s MONITORING                          ║${NC}\n" "$machine_name"
    printf "${BOLD_CYAN}╠════════════════════════════════════════════════════════════════════════╣${NC}\n"
    
    # CPU Usage with visual bar
    printf "${BOLD_CYAN}║${NC} ${BOLD_WHITE}CPU:${NC} "
    draw_cpu_bar "$cpu_usage"
    printf "                                        ${BOLD_CYAN}║${NC}\n"
    
    # Memory and Load
    printf "${BOLD_CYAN}║${NC} ${BOLD_WHITE}MEM:${NC} ${YELLOW}%4sM${NC}     ${BOLD_WHITE}LOAD:${NC} ${PURPLE}%-20s${NC}                  ${BOLD_CYAN}║${NC}\n" "$memory_usage" "$load_avg"
    
    printf "${BOLD_CYAN}╠════════════════════════════════════════════════════════════════════════╣${NC}\n"
    printf "${BOLD_CYAN}║${NC} ${BOLD_WHITE}TOP 5 CPU PROCESSES:${NC}                                                    ${BOLD_CYAN}║${NC}\n"
    
    # Top processes
    echo "$top_processes" | while IFS= read -r process; do
        if [ -n "$process" ]; then
            printf "${BOLD_CYAN}║${NC} ${GREEN}%-66s${NC} ${BOLD_CYAN}║${NC}\n" "$process"
        fi
    done
    
    printf "${BOLD_CYAN}╚════════════════════════════════════════════════════════════════════════╝${NC}\n"
}

# Main monitoring loop
main_monitor() {
    echo -e "${BOLD_PURPLE}"
    cat << "EOF"
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║              🖥️  DUAL-MACHINE CPU MONITORING SYSTEM  🖥️                   ║
║                                                                              ║
║              Real-time CPU, Memory & Process Monitoring                      ║
║              Updates every second • Press Ctrl+C to stop                    ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    
    # Log start
    echo "[$(date)] Dual-machine monitoring started" >> "$LOG_FILE"
    
    while true; do
        # Clear screen for real-time updates
        clear
        
        # Display header
        echo -e "${BOLD_PURPLE}"
        printf "╔══════════════════════════════════════════════════════════════════════════════╗\n"
        printf "║                    🖥️  REAL-TIME CPU MONITORING  🖥️                        ║\n"
        printf "║                        %s                                     ║\n" "$(date '+%Y-%m-%d %H:%M:%S')"
        printf "╚══════════════════════════════════════════════════════════════════════════════╝\n"
        echo -e "${NC}"
        
        # Get Mac Studio info
        echo -e "${BOLD_YELLOW}📊 Gathering Mac Studio data...${NC}"
        local_info=$(get_local_cpu_info)
        IFS='|' read -r local_cpu local_mem local_load local_processes <<< "$local_info"
        
        # Get Mac Pro info
        echo -e "${BOLD_YELLOW}📊 Gathering Mac Pro Beast data...${NC}"
        remote_info=$(get_remote_cpu_info)
        IFS='|' read -r remote_cpu remote_mem remote_load remote_processes <<< "$remote_info"
        
        # Clear gathering messages
        clear
        
        # Display header again
        echo -e "${BOLD_PURPLE}"
        printf "╔══════════════════════════════════════════════════════════════════════════════╗\n"
        printf "║                    🖥️  REAL-TIME CPU MONITORING  🖥️                        ║\n"
        printf "║                        %s                                     ║\n" "$(date '+%Y-%m-%d %H:%M:%S')"
        printf "╚══════════════════════════════════════════════════════════════════════════════╝\n"
        echo -e "${NC}"
        echo
        
        # Display Mac Studio status
        if [ -n "$local_cpu" ] && [ "$local_cpu" != "" ]; then
            display_machine_status "MAC STUDIO (LOCAL)" "$local_cpu" "$local_mem" "$local_load" "$local_processes" "true"
        else
            display_machine_status "MAC STUDIO (LOCAL)" "0" "0" "N/A" "" "false"
        fi
        
        echo
        
        # Display Mac Pro Beast status
        if [ "$remote_info" != "OFFLINE|||" ] && [ -n "$remote_cpu" ]; then
            display_machine_status "MAC PRO BEAST (REMOTE)" "$remote_cpu" "$remote_mem" "$remote_load" "$remote_processes" "true"
        else
            display_machine_status "MAC PRO BEAST (REMOTE)" "0" "0" "N/A" "" "false"
        fi
        
        echo
        
        # Status summary
        printf "${BOLD_WHITE}╔════════════════════════════════════════════════════════════════════════╗${NC}\n"
        printf "${BOLD_WHITE}║                            STATUS SUMMARY                              ║${NC}\n"
        printf "${BOLD_WHITE}╠════════════════════════════════════════════════════════════════════════╣${NC}\n"
        
        # Local status
        local local_status="${GREEN}ONLINE${NC}"
        if [ -z "$local_cpu" ] || [ "$local_cpu" = "" ]; then
            local_status="${RED}OFFLINE${NC}"
        fi
        printf "${BOLD_WHITE}║${NC} Mac Studio:     $local_status                                              ${BOLD_WHITE}║${NC}\n"
        
        # Remote status  
        local remote_status="${GREEN}ONLINE${NC}"
        if [ "$remote_info" = "OFFLINE|||" ] || [ -z "$remote_cpu" ]; then
            remote_status="${RED}OFFLINE${NC}"
        fi
        printf "${BOLD_WHITE}║${NC} Mac Pro Beast:  $remote_status                                              ${BOLD_WHITE}║${NC}\n"
        
        printf "${BOLD_WHITE}║${NC} Log File:       ${CYAN}%-50s${NC} ${BOLD_WHITE}║${NC}\n" "$LOG_FILE"
        printf "${BOLD_WHITE}║${NC} Update Rate:    ${YELLOW}Every ${UPDATE_INTERVAL} second(s)${NC}                                      ${BOLD_WHITE}║${NC}\n"
        printf "${BOLD_WHITE}╚════════════════════════════════════════════════════════════════════════╝${NC}\n"
        
        # Log data
        echo "[$(date)] Local: CPU=${local_cpu}% MEM=${local_mem}M | Remote: CPU=${remote_cpu}% MEM=${remote_mem}M" >> "$LOG_FILE"
        
        # Wait for next update
        sleep $UPDATE_INTERVAL
    done
}

# Cleanup function
cleanup() {
    echo
    echo -e "${BOLD_YELLOW}🛑 Monitoring stopped by user${NC}"
    echo "[$(date)] Monitoring stopped" >> "$LOG_FILE"
    echo -e "${BOLD_GREEN}📝 Log saved to: $LOG_FILE${NC}"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check if we can connect to remote machine
echo -e "${BOLD_YELLOW}🔍 Testing connection to Mac Pro Beast...${NC}"
if ssh -o ConnectTimeout=5 -o BatchMode=yes "$MAC_PRO_HOST" 'echo "Connection successful"' >/dev/null 2>&1; then
    echo -e "${BOLD_GREEN}✅ Mac Pro Beast connection successful${NC}"
else
    echo -e "${BOLD_RED}❌ Mac Pro Beast connection failed${NC}"
    echo -e "${BOLD_YELLOW}⚠️  Will monitor Mac Studio only. Update MAC_PRO_HOST in script for remote monitoring.${NC}"
    read -p "Press Enter to continue with local monitoring only..."
fi

# Start monitoring
main_monitor
