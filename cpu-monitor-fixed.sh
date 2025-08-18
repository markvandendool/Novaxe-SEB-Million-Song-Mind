#!/bin/bash

# 🖥️ MAC STUDIO CPU MONITOR - FIXED VERSION
# Real-time visual CPU monitoring that actually works!

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'

BOLD_RED='\033[1;31m'
BOLD_GREEN='\033[1;32m'
BOLD_YELLOW='\033[1;33m'
BOLD_BLUE='\033[1;34m'
BOLD_PURPLE='\033[1;35m'
BOLD_CYAN='\033[1;36m'
BOLD_WHITE='\033[1;37m'

# Function to draw CPU usage bar
draw_cpu_bar() {
    local usage=$1
    local width=50
    
    # Convert to integer for calculations
    local usage_int=$(printf "%.0f" "$usage")
    local filled=$((usage_int * width / 100))
    local empty=$((width - filled))
    
    # Choose color based on usage
    local color=$GREEN
    if [ "$usage_int" -gt 80 ]; then
        color=$BOLD_RED
    elif [ "$usage_int" -gt 60 ]; then
        color=$RED
    elif [ "$usage_int" -gt 40 ]; then
        color=$YELLOW
    fi
    
    printf "${color}"
    for ((i=1; i<=filled; i++)); do printf "█"; done
    printf "${NC}"
    for ((i=1; i<=empty; i++)); do printf "░"; done
    printf " ${BOLD_WHITE}%5.1f%%${NC}" "$usage"
}

# Function to get CPU usage
get_cpu_usage() {
    # Get CPU usage from top command
    local cpu_line=$(top -l 1 -s 0 | grep "CPU usage")
    
    # Extract user and system CPU usage
    local cpu_user=$(echo "$cpu_line" | awk '{print $3}' | sed 's/%//')
    local cpu_sys=$(echo "$cpu_line" | awk '{print $5}' | sed 's/%//')
    
    # Calculate total (handle decimal numbers properly)
    local cpu_total=$(echo "$cpu_user + $cpu_sys" | bc -l 2>/dev/null || echo "0")
    
    echo "$cpu_total|$cpu_user|$cpu_sys"
}

# Main monitoring function
monitor_cpu() {
    local counter=0
    
    while true; do
        clear
        
        # Get current time
        local current_time=$(date '+%H:%M:%S')
        
        # Get CPU info
        local cpu_info=$(get_cpu_usage)
        IFS='|' read -r cpu_total cpu_user cpu_sys <<< "$cpu_info"
        
        # Get memory info
        local mem_line=$(top -l 1 -s 0 | grep "PhysMem")
        local mem_used=$(echo "$mem_line" | awk '{print $2}' | sed 's/M.*//')
        
        # Get load average
        local load_avg=$(uptime | awk -F'load averages:' '{print $2}' | xargs)
        
        # Get top 5 processes
        local top_procs=$(top -l 1 -o cpu -n 5 | tail -n +12 | head -5)
        
        # Header
        echo -e "${BOLD_PURPLE}"
        printf "╔══════════════════════════════════════════════════════════════════════════════╗\n"
        printf "║                    🖥️  MAC STUDIO CPU MONITOR  🖥️                          ║\n"
        printf "║                              %s                                     ║\n" "$current_time"
        printf "║                            Update #%-5d                                   ║\n" "$counter"
        printf "╚══════════════════════════════════════════════════════════════════════════════╝\n"
        echo -e "${NC}"
        
        echo
        
        # CPU Usage Display
        echo -e "${BOLD_CYAN}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${BOLD_CYAN}║                                CPU USAGE                                     ║${NC}"
        echo -e "${BOLD_CYAN}╠══════════════════════════════════════════════════════════════════════════════╣${NC}"
        
        printf "${BOLD_CYAN}║${NC} ${BOLD_WHITE}TOTAL:${NC} "
        draw_cpu_bar "$cpu_total"
        printf "                         ${BOLD_CYAN}║${NC}\n"
        
        printf "${BOLD_CYAN}║${NC} ${BOLD_WHITE}USER: ${NC} "
        draw_cpu_bar "$cpu_user"
        printf "                         ${BOLD_CYAN}║${NC}\n"
        
        printf "${BOLD_CYAN}║${NC} ${BOLD_WHITE}SYS:  ${NC} "
        draw_cpu_bar "$cpu_sys"
        printf "                         ${BOLD_CYAN}║${NC}\n"
        
        echo -e "${BOLD_CYAN}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
        
        echo
        
        # System Resources
        echo -e "${BOLD_YELLOW}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${BOLD_YELLOW}║                            SYSTEM RESOURCES                                  ║${NC}"
        echo -e "${BOLD_YELLOW}╠══════════════════════════════════════════════════════════════════════════════╣${NC}"
        printf "${BOLD_YELLOW}║${NC} ${BOLD_WHITE}MEMORY:${NC}     ${GREEN}%6sM${NC}     ${BOLD_WHITE}LOAD AVG:${NC} ${PURPLE}%-20s${NC}        ${BOLD_YELLOW}║${NC}\n" "$mem_used" "$load_avg"
        printf "${BOLD_YELLOW}║${NC} ${BOLD_WHITE}TIME:${NC}       ${CYAN}%8s${NC}     ${BOLD_WHITE}UPDATE:${NC}   ${YELLOW}#%-6d${NC}               ${BOLD_YELLOW}║${NC}\n" "$current_time" "$counter"
        echo -e "${BOLD_YELLOW}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
        
        echo
        
        # Top Processes
        echo -e "${BOLD_GREEN}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${BOLD_GREEN}║                              TOP 5 CPU PROCESSES                             ║${NC}"
        echo -e "${BOLD_GREEN}╠══════════════════════════════════════════════════════════════════════════════╣${NC}"
        printf "${BOLD_GREEN}║${NC} ${BOLD_WHITE}%-20s %8s %8s %12s %-15s${NC}                  ${BOLD_GREEN}║${NC}\n" "PROCESS" "PID" "CPU%" "MEM" "COMMAND"
        echo -e "${BOLD_GREEN}╠══════════════════════════════════════════════════════════════════════════════╣${NC}"
        
        local proc_count=0
        echo "$top_procs" | while IFS= read -r line && [ $proc_count -lt 5 ]; do
            if [ -n "$line" ]; then
                local process=$(echo "$line" | awk '{print $1}' | cut -c1-20)
                local pid=$(echo "$line" | awk '{print $2}')
                local cpu=$(echo "$line" | awk '{print $3}')
                local mem=$(echo "$line" | awk '{print $8}')
                local command=$(echo "$line" | awk '{print $1}' | cut -c1-15)
                
                # Color code based on CPU usage
                local cpu_num=$(echo "$cpu" | sed 's/%//' | cut -d. -f1)
                local cpu_color=$GREEN
                if [ "$cpu_num" -gt 50 ]; then
                    cpu_color=$RED
                elif [ "$cpu_num" -gt 20 ]; then
                    cpu_color=$YELLOW
                fi
                
                printf "${BOLD_GREEN}║${NC} ${WHITE}%-20s${NC} ${CYAN}%8s${NC} ${cpu_color}%8s${NC} ${YELLOW}%12s${NC} ${BLUE}%-15s${NC} ${BOLD_GREEN}║${NC}\n" \
                    "$process" "$pid" "$cpu" "$mem" "$command"
                proc_count=$((proc_count + 1))
            fi
        done
        
        echo -e "${BOLD_GREEN}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
        
        echo
        echo -e "${BOLD_WHITE}🔄 Updating every second | Press ${RED}Ctrl+C${NC}${BOLD_WHITE} to stop${NC}"
        
        # Increment counter
        counter=$((counter + 1))
        
        # Wait 1 second
        sleep 1
    done
}

# Cleanup function
cleanup() {
    clear
    echo -e "${BOLD_YELLOW}🛑 CPU monitoring stopped${NC}"
    echo -e "${BOLD_GREEN}Total updates: $counter${NC}"
    exit 0
}

# Set up signal handler
trap cleanup SIGINT SIGTERM

# Check if bc is available for calculations
if ! command -v bc &> /dev/null; then
    echo -e "${BOLD_RED}❌ Error: 'bc' calculator not found${NC}"
    echo -e "${BOLD_YELLOW}Installing bc...${NC}"
    if command -v brew &> /dev/null; then
        brew install bc
    else
        echo -e "${BOLD_RED}Please install 'bc' calculator: brew install bc${NC}"
        exit 1
    fi
fi

# Start monitoring
echo -e "${BOLD_PURPLE}🚀 Starting Mac Studio CPU Monitor...${NC}"
echo -e "${BOLD_YELLOW}⏱️  Updates every second with live CPU usage${NC}"
echo -e "${BOLD_GREEN}📊 Visual bars show CPU usage levels${NC}"
sleep 2
monitor_cpu
