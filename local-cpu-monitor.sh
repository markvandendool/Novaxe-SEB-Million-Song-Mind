#!/bin/bash

# 🖥️ MAC STUDIO LOCAL CPU MONITORING
# Real-time visual CPU monitoring with top processes
# Updates every second with big, clear display

set -e

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
    local width=60
    local filled=$((usage * width / 100))
    local empty=$((width - filled))
    
    # Choose color based on usage
    local color=$GREEN
    if (( $(echo "$usage > 80" | bc -l) )); then
        color=$BOLD_RED
    elif (( $(echo "$usage > 60" | bc -l) )); then
        color=$RED
    elif (( $(echo "$usage > 40" | bc -l) )); then
        color=$YELLOW
    fi
    
    printf "${color}"
    printf '█%.0s' $(seq 1 $filled)
    printf "${NC}"
    printf '░%.0s' $(seq 1 $empty)
    printf " ${BOLD_WHITE}%5.1f%%${NC}" "$usage"
}

# Main monitoring function
monitor_cpu() {
    while true; do
        clear
        
        # Get system info
        local cpu_line=$(top -l 1 -s 0 | grep "CPU usage")
        local cpu_user=$(echo "$cpu_line" | awk '{print $3}' | sed 's/%//')
        local cpu_sys=$(echo "$cpu_line" | awk '{print $5}' | sed 's/%//')
        local cpu_idle=$(echo "$cpu_line" | awk '{print $7}' | sed 's/%//')
        local cpu_total=$(echo "$cpu_user + $cpu_sys" | bc)
        
        # Memory info
        local mem_line=$(top -l 1 -s 0 | grep "PhysMem")
        local mem_used=$(echo "$mem_line" | awk '{print $2}' | sed 's/M//')
        local mem_wired=$(echo "$mem_line" | awk '{print $4}' | sed 's/M//')
        local mem_compressed=$(echo "$mem_line" | awk '{print $6}' | sed 's/M//')
        
        # Load average
        local load_avg=$(uptime | awk -F'load averages:' '{print $2}' | xargs)
        
        # Top 5 processes
        local top_procs=$(top -l 1 -o cpu -n 5 | tail -n +12 | head -5)
        
        # Header
        echo -e "${BOLD_PURPLE}"
        printf "╔══════════════════════════════════════════════════════════════════════════════╗\n"
        printf "║                          🖥️  MAC STUDIO CPU MONITOR  🖥️                     ║\n"
        printf "║                              %s                                 ║\n" "$(date '+%H:%M:%S')"
        printf "╚══════════════════════════════════════════════════════════════════════════════╝\n"
        echo -e "${NC}"
        
        echo
        
        # CPU Usage Display
        echo -e "${BOLD_CYAN}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${BOLD_CYAN}║                                CPU USAGE                                     ║${NC}"
        echo -e "${BOLD_CYAN}╠══════════════════════════════════════════════════════════════════════════════╣${NC}"
        
        printf "${BOLD_CYAN}║${NC} ${BOLD_WHITE}TOTAL:${NC} "
        draw_cpu_bar "$cpu_total"
        printf "                    ${BOLD_CYAN}║${NC}\n"
        
        printf "${BOLD_CYAN}║${NC} ${BOLD_WHITE}USER:${NC}  "
        draw_cpu_bar "$cpu_user"
        printf "                    ${BOLD_CYAN}║${NC}\n"
        
        printf "${BOLD_CYAN}║${NC} ${BOLD_WHITE}SYS:${NC}   "
        draw_cpu_bar "$cpu_sys"
        printf "                    ${BOLD_CYAN}║${NC}\n"
        
        echo -e "${BOLD_CYAN}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
        
        echo
        
        # Memory and Load Info
        echo -e "${BOLD_YELLOW}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${BOLD_YELLOW}║                            SYSTEM RESOURCES                                  ║${NC}"
        echo -e "${BOLD_YELLOW}╠══════════════════════════════════════════════════════════════════════════════╣${NC}"
        printf "${BOLD_YELLOW}║${NC} ${BOLD_WHITE}MEMORY USED:${NC}     ${GREEN}%6sM${NC}     ${BOLD_WHITE}LOAD AVERAGE:${NC} ${PURPLE}%-20s${NC}      ${BOLD_YELLOW}║${NC}\n" "$mem_used" "$load_avg"
        printf "${BOLD_YELLOW}║${NC} ${BOLD_WHITE}MEMORY WIRED:${NC}    ${CYAN}%6sM${NC}     ${BOLD_WHITE}IDLE CPU:${NC}     ${GREEN}%5.1f%%${NC}                 ${BOLD_YELLOW}║${NC}\n" "$mem_wired" "$cpu_idle"
        printf "${BOLD_YELLOW}║${NC} ${BOLD_WHITE}COMPRESSED:${NC}     ${YELLOW}%6sM${NC}     ${BOLD_WHITE}TIMESTAMP:${NC}    ${CYAN}%-15s${NC}       ${BOLD_YELLOW}║${NC}\n" "$mem_compressed" "$(date '+%H:%M:%S')"
        echo -e "${BOLD_YELLOW}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
        
        echo
        
        # Top Processes
        echo -e "${BOLD_GREEN}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${BOLD_GREEN}║                              TOP 5 CPU PROCESSES                             ║${NC}"
        echo -e "${BOLD_GREEN}╠══════════════════════════════════════════════════════════════════════════════╣${NC}"
        printf "${BOLD_GREEN}║${NC} ${BOLD_WHITE}%-15s %6s %8s %8s %8s %-20s${NC}                  ${BOLD_GREEN}║${NC}\n" "PROCESS" "PID" "CPU%" "MEM" "TIME" "COMMAND"
        echo -e "${BOLD_GREEN}╠══════════════════════════════════════════════════════════════════════════════╣${NC}"
        
        echo "$top_procs" | while IFS= read -r line; do
            if [ -n "$line" ]; then
                local process=$(echo "$line" | awk '{print $1}')
                local pid=$(echo "$line" | awk '{print $2}')
                local cpu=$(echo "$line" | awk '{print $3}')
                local mem=$(echo "$line" | awk '{print $8}')
                local time=$(echo "$line" | awk '{print $9}')
                local command=$(echo "$line" | awk '{for(i=10;i<=NF;i++) printf "%s ", $i}' | cut -c1-20)
                
                # Color code based on CPU usage
                local cpu_num=$(echo "$cpu" | sed 's/%//')
                local cpu_color=$GREEN
                if (( $(echo "$cpu_num > 50" | bc -l) )); then
                    cpu_color=$RED
                elif (( $(echo "$cpu_num > 20" | bc -l) )); then
                    cpu_color=$YELLOW
                fi
                
                printf "${BOLD_GREEN}║${NC} ${WHITE}%-15s${NC} ${CYAN}%6s${NC} ${cpu_color}%8s${NC} ${YELLOW}%8s${NC} ${PURPLE}%8s${NC} ${BLUE}%-20s${NC} ${BOLD_GREEN}║${NC}\n" \
                    "$process" "$pid" "$cpu" "$mem" "$time" "$command"
            fi
        done
        
        echo -e "${BOLD_GREEN}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
        
        echo
        echo -e "${BOLD_WHITE}Press ${RED}Ctrl+C${NC} to stop monitoring | Updates every second${NC}"
        
        sleep 1
    done
}

# Cleanup function
cleanup() {
    clear
    echo -e "${BOLD_YELLOW}🛑 CPU monitoring stopped${NC}"
    echo -e "${BOLD_GREEN}Thanks for using Mac Studio CPU Monitor!${NC}"
    exit 0
}

# Set up signal handler
trap cleanup SIGINT SIGTERM

# Start monitoring
echo -e "${BOLD_PURPLE}🚀 Starting Mac Studio CPU Monitor...${NC}"
sleep 1
monitor_cpu
