#!/bin/bash

# Fix mds/mds_stores CPU Issues - macOS Spotlight Indexing Control
# Mark van den Dool - August 16, 2025

echo "🔧 FIXING MDS/MDS_STORES SPOTLIGHT INDEXING CPU ISSUES"
echo "=================================================="

# Method 1: Disable Spotlight Indexing (Nuclear Option)
disable_spotlight_completely() {
    echo "🚫 Method 1: Completely Disable Spotlight Indexing"
    sudo mdutil -i off -a
    echo "✅ Spotlight indexing disabled on all volumes"
    
    # Kill existing processes
    sudo pkill -f mds
    sudo pkill -f mds_stores
    sleep 3
    
    # Prevent launch daemon restart
    sudo launchctl unload -w /System/Library/LaunchDaemons/com.apple.metadata.mds.plist 2>/dev/null || true
    echo "✅ Launch daemon disabled"
}

# Method 2: Selective Exclusion (Recommended)
selective_exclusion() {
    echo "🎯 Method 2: Selective Exclusion of Problem Directories"
    
    # Add common problem directories to Spotlight exclusion
    EXCLUDE_PATHS=(
        "/Users/markvandendool/Novaxe-SEB-Million-Song-Mind"
        "/Users/markvandendool/.npm"
        "/Users/markvandendool/.cache"
        "/Users/markvandendool/node_modules"
        "/System/Volumes/Data/private/tmp"
        "/private/var/folders"
    )
    
    for path in "${EXCLUDE_PATHS[@]}"; do
        if [ -d "$path" ]; then
            echo "🚫 Excluding: $path"
            sudo mdutil -i off "$path" 2>/dev/null || true
        fi
    done
    
    # Restart Spotlight with exclusions
    sudo pkill -f mds
    sudo pkill -f mds_stores
    sleep 2
    sudo mdutil -E /
}

# Method 3: Priority Throttling (Gentle)
throttle_mds_processes() {
    echo "⚡ Method 3: Throttle MDS Process Priority"
    
    # Find and throttle existing processes
    MDS_PIDS=$(pgrep -f "mds")
    MDS_STORES_PIDS=$(pgrep -f "mds_stores")
    
    for pid in $MDS_PIDS $MDS_STORES_PIDS; do
        if [ ! -z "$pid" ]; then
            echo "🐌 Throttling process $pid to lowest priority"
            sudo renice +20 $pid 2>/dev/null || true
        fi
    done
}

# Method 4: Rebuild Spotlight Index (Reset)
rebuild_spotlight_index() {
    echo "🔄 Method 4: Rebuild Spotlight Index (Clean Slate)"
    
    # Delete existing index
    sudo rm -rf /.Spotlight-V100
    sudo rm -rf /System/Volumes/Data/.Spotlight-V100 2>/dev/null || true
    
    # Force rebuild
    sudo mdutil -E /
    echo "✅ Spotlight index rebuild initiated"
}

# Interactive menu
show_menu() {
    echo ""
    echo "Choose your approach:"
    echo "1) 🚫 Nuclear: Completely disable Spotlight (FAST)"
    echo "2) 🎯 Smart: Exclude problem directories (RECOMMENDED)"
    echo "3) 🐌 Gentle: Just throttle process priority"
    echo "4) 🔄 Reset: Rebuild Spotlight index completely"
    echo "5) 📊 Status: Check current CPU usage"
    echo "6) 🔙 Exit"
    echo ""
    read -p "Enter choice [1-6]: " choice
}

check_status() {
    echo "📊 Current MDS Process Status:"
    echo "=============================="
    ps aux | grep -E "(mds|mds_stores)" | grep -v grep || echo "No mds processes running"
    echo ""
    echo "💾 Spotlight Status:"
    mdutil -s / 2>/dev/null || echo "Spotlight status unavailable"
}

# Main execution
if [[ $# -eq 0 ]]; then
    # Interactive mode
    while true; do
        show_menu
        case $choice in
            1)
                disable_spotlight_completely
                break
                ;;
            2)
                selective_exclusion
                break
                ;;
            3)
                throttle_mds_processes
                break
                ;;
            4)
                rebuild_spotlight_index
                break
                ;;
            5)
                check_status
                ;;
            6)
                echo "👋 Exiting"
                exit 0
                ;;
            *)
                echo "❌ Invalid option"
                ;;
        esac
    done
else
    # Command line mode
    case $1 in
        disable)
            disable_spotlight_completely
            ;;
        exclude)
            selective_exclusion
            ;;
        throttle)
            throttle_mds_processes
            ;;
        rebuild)
            rebuild_spotlight_index
            ;;
        status)
            check_status
            ;;
        *)
            echo "Usage: $0 [disable|exclude|throttle|rebuild|status]"
            exit 1
            ;;
    esac
fi

echo ""
echo "✅ MDS Fix Operation Complete"
echo "🔄 Checking results in 5 seconds..."
sleep 5
check_status
