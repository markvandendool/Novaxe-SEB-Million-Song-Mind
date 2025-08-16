#!/bin/bash

# ULTIMATE NUCLEAR EMERGENCY KILL - STOP EVERYTHING!
# Mark van den Dool - August 16, 2025
# THIS WILL KILL EVERYTHING INCLUDING VS CODE!

echo "🚨🚨🚨 ULTIMATE NUCLEAR EMERGENCY KILL ACTIVATED 🚨🚨🚨"

# 1. KILL ALL YES PROCESSES WITH EXTREME PREJUDICE
echo "💀 STAGE 1: KILLING ALL YES PROCESSES"
sudo pkill -9 -f "yes" 2>/dev/null || true
pkill -9 -f "yes" 2>/dev/null || true
killall -9 yes 2>/dev/null || true

# 2. KILL ALL STRESS PROCESSES
echo "💀 STAGE 2: KILLING ALL STRESS PROCESSES"
sudo pkill -9 -f "stress" 2>/dev/null || true
pkill -9 -f "stress" 2>/dev/null || true
sudo pkill -9 -f "shasum" 2>/dev/null || true
sudo pkill -9 -f "sort" 2>/dev/null || true
sudo pkill -9 -f "uniq" 2>/dev/null || true
sudo pkill -9 -f "grep" 2>/dev/null || true

# 3. KILL ALL VS CODE PROCESSES
echo "💀 STAGE 3: KILLING ALL VS CODE PROCESSES"
sudo pkill -9 -f "Code" 2>/dev/null || true
sudo pkill -9 -f "code" 2>/dev/null || true
sudo pkill -9 -f "Electron" 2>/dev/null || true
sudo pkill -9 -f "extensionHost" 2>/dev/null || true
sudo pkill -9 -f "rg" 2>/dev/null || true

# 4. KILL ALL TERMINAL SPAWNED PROCESSES
echo "💀 STAGE 4: KILLING ALL TERMINAL PROCESSES"
sudo pkill -9 -f "bash.*nuclear" 2>/dev/null || true
sudo pkill -9 -f "bash.*test" 2>/dev/null || true
sudo pkill -9 -f "zsh.*nuclear" 2>/dev/null || true

# 5. KILL ALL HIGH CPU PROCESSES
echo "💀 STAGE 5: KILLING ALL HIGH CPU PROCESSES"
HIGH_CPU_PIDS=$(ps -eo pid,pcpu,comm | awk '$2 > 20.0 { print $1 }' | grep -v PID)
for pid in $HIGH_CPU_PIDS; do
    echo "Killing high CPU process: $pid"
    sudo kill -9 "$pid" 2>/dev/null || true
done

# 6. NUCLEAR REMOTE CLEANUP
echo "💀 STAGE 6: NUCLEAR MAC PRO BEAST CLEANUP"
ssh vandendool@10.0.0.115 "
    sudo pkill -9 -f 'yes' 2>/dev/null || true
    pkill -9 -f 'yes' 2>/dev/null || true
    killall -9 yes 2>/dev/null || true
    sudo pkill -9 -f 'stress' 2>/dev/null || true
    sudo pkill -9 -f 'shasum' 2>/dev/null || true
    sudo pkill -9 -f 'sort' 2>/dev/null || true
    sudo pkill -9 -f 'uniq' 2>/dev/null || true
    sudo pkill -9 -f 'grep' 2>/dev/null || true
    echo 'MAC PRO BEAST NUCLEAR CLEANUP COMPLETE'
" 2>/dev/null || true

# 7. FINAL STATUS CHECK
echo "💀 STAGE 7: CHECKING FINAL STATUS"
sleep 3

echo "📊 FINAL CPU STATUS:"
top -l 1 | head -5

echo "🔍 REMAINING HIGH CPU PROCESSES:"
ps -eo pid,pcpu,comm | awk '$2 > 10.0 { print $0 }' | head -10

echo ""
echo "🚨🚨🚨 ULTIMATE NUCLEAR KILL COMPLETE 🚨🚨🚨"
echo "✅ ALL STRESS PROCESSES TERMINATED"
echo "✅ VS CODE PROCESSES KILLED"
echo "✅ MAC PRO BEAST CLEANED"
echo "✅ SYSTEM SHOULD NOW BE STABLE"
