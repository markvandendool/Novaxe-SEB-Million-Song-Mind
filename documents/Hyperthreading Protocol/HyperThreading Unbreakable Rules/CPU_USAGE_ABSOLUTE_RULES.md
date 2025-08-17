# 🚨 HYPER-THREADING UNBREAKABLE RULES
## CPU Usage Absolute Rules - Zero Tolerance

**Document Version**: 1.0  
**Effective Date**: January 25, 2025  
**Enforcement Level**: ABSOLUTE - NO EXCEPTIONS  
**Violation Penalty**: IMMEDIATE TERMINATION  

---

## 🚨 **HARD RULES - SIMPLE ENGLISH VERSION**

### **CPU USAGE - ABSOLUTE RULES**

1. **CPU IS ONLY FOR REAL WORK**
   - Every CPU cycle MUST do actual migration work
   - If there's no work, CPU stays at 0%
   - NEVER create fake work to hit CPU targets

2. **NO INFINITE LOOPS - EVER**
   - No `while(true)` loops
   - No meaningless calculations
   - No recursive functions that never end
   - If caught in a loop, F5/F6 kills everything

3. **85% CPU MAXIMUM**
   - Target: 85% CPU usage WHEN WORKING
   - If CPU hits 90%: Throttle immediately
   - If CPU hits 95%: Emergency shutdown
   - If CPU hits 100%: You failed

4. **IDLE IS BETTER THAN FAKE WORK**
   - 0% CPU with no tasks = GOOD
   - 85% CPU doing fake work = FIRED
   - Only run processes that move the migration forward

5. **EVERY TASK MUST HAVE AN END**
   - Every loop must have an exit condition
   - Every task must complete and report done
   - Every process must terminate when finished
   - No task runs forever

6. **TASK DISTRIBUTION RULES**
   - Mac Studio: File (extract-never. You MUST copy/use/port/move only full complete files, every single byte), verification, monitoring
   - Mac Pro: Angular migrations, compilation, testing
   - Both machines work on DIFFERENT tasks
   - Never duplicate work between machines

7. **MONITORING IS MANDATORY**
   - Check CPU every 10 seconds
   - Log progress every minute
   - Kill switches ready (F5 = Mac Pro, F6 = Mac Studio)
   - If anything looks wrong, STOP

8. **SEQUENTIAL MIGRATIONS ONLY**
   - Angular 11 → 12 (finish completely)
   - Then 12 → 13 (only after 11→12 done)
   - Never run two version migrations at once
   - Each migration must pass all tests before next

9. **(EXTRACT-NEVER. YOU MUST COPY/USE/PORT/MOVE ONLY FULL COMPLETE FILES, EVERY SINGLE BYTE) BEFORE MIGRATION**
   - (Extract-never. You MUST copy/use/port/move only full complete files, every single byte) all 6,426 lines FIRST
   - Verify line counts match EXACTLY
   - Only then start migrations
   - No shortcuts, no mocks, no simplifications

10. **IF NO WORK EXISTS**
    - Exit the program
    - Report "No tasks available"
    - Let CPU rest at 0%
    - NEVER create busy work

---

## ⛔ **FORBIDDEN - NEVER DO THIS**

```javascript
// ❌ NEVER: Burn CPU for no reason
while(cpuUsage < 85) {
  Math.random(); // Meaningless work
}

// ❌ NEVER: Infinite loops
while(true) {
  doSomething(); // Never ends
}

// ❌ NEVER: Fake progress
for(i = 0; i < 999999999; i++) {
  console.log("Working..."); // Lies
}

// ❌ NEVER: Multiple Angular migrations
ng update @angular/core@12 & ng update @angular/core@13 // PARALLEL = FORBIDDEN

// ❌ NEVER: Fake busywork
npm run build & npm run build & npm run build // USELESS REPETITION
```

## ✅ **REQUIRED - ALWAYS DO THIS**

```javascript
// ✅ ALWAYS: Real work only
if (tasksAvailable()) {
  doActualWork();
} else {
  console.log("No tasks - exiting");
  process.exit(0);
}

// ✅ ALWAYS: Exit conditions
while(hasMoreWork() && cpuUsage < 85) {
  doWork();
  checkCPU();
}

// ✅ ALWAYS: Complete and exit
async function migrate() {
  await migrateVersion();
  console.log("Migration complete");
  process.exit(0); // DONE
}

// ✅ ALWAYS: Sequential migrations
async function sequentialMigration() {
  await migrate11to12();
  await verify11to12();
  await migrate12to13(); // ONLY AFTER 11→12 COMPLETE
}

// ✅ ALWAYS: Monitor and throttle
function monitorCPU() {
  if (cpuUsage > 85) {
    throttleProcesses();
  }
  if (cpuUsage > 95) {
    emergencyShutdown();
  }
}
```

---

## 🔴 **ONE SENTENCE RULES**

1. **CPU is for REAL WORK ONLY**
2. **No work = 0% CPU (not 85%)**
3. **Every task must END**
4. **Idle is GOOD, fake work is FIRED**
5. **F5/F6 kills everything if needed**
6. **(Extract-never. You MUST copy/use/port/move only full complete files, every single byte) files FIRST, migrate SECOND**
7. **One Angular version at a time**
8. **Mac Studio (extract-never. You MUST copy/use/port/move only full complete files, every single byte), Mac Pro migrates**
9. **Monitor every 10 seconds**
10. **NEVER create infinite loops**

---

## 🚨 **EMERGENCY PROTOCOLS**

### **CPU OVERHEATING (90%+)**
```bash
# IMMEDIATE ACTION REQUIRED
echo "🚨 CPU OVERHEATING - EMERGENCY SHUTDOWN"
pkill -9 node
pkill -9 npm
pkill -9 ng
pkill -9 tsc
echo "All processes killed - CPU safe"
```

### **INFINITE LOOP DETECTED**
```bash
# KILL SWITCHES
# F5: Kill Mac Pro processes
ssh vandendool@Marks-Mac-Pro.local "pkill -9 -f 'npm|ng|tsc|node'"

# F6: Kill Mac Studio processes  
pkill -9 -f 'npm|ng|tsc|node'
```

### **FAKE WORK DETECTED**
```bash
# IMMEDIATE TERMINATION
echo "🚨 FAKE WORK DETECTED - TERMINATING"
echo "Last night's infinite loops were UNACCEPTABLE"
echo "NEVER create busy work to hit CPU targets"
process.exit(1);
```

---

## 📊 **MONITORING PROTOCOLS**

### **REAL-TIME CPU MONITORING**
```bash
# Check CPU every 10 seconds
while true; do
  cpu_usage=$(top -l 1 | grep 'CPU usage' | awk '{print $3}' | sed 's/%//')
  echo "$(date): CPU Usage: ${cpu_usage}%"
  
  if (( $(echo "$cpu_usage > 85" | bc -l) )); then
    echo "🚨 CPU OVER 85% - THROTTLING"
    throttleProcesses
  fi
  
  if (( $(echo "$cpu_usage > 95" | bc -l) )); then
    echo "🚨 CPU OVER 95% - EMERGENCY SHUTDOWN"
    emergencyShutdown
  fi
  
  sleep 10
done
```

### **PROGRESS LOGGING**
```bash
# Log progress every minute
while true; do
  echo "$(date): Migration Progress Report"
  echo "  - Current Angular Version: $CURRENT_VERSION"
  echo "  - Target Angular Version: 20"
  echo "  - Lines (Extract-never. You MUST copy/use/port/move only full complete files, every single byte): $LINES_(EXTRACT-NEVER. YOU MUST COPY/USE/PORT/MOVE ONLY FULL COMPLETE FILES, EVERY SINGLE BYTE) of 6,426"
  echo "  - CPU Usage: $CPU_USAGE%"
  echo "  - Active Tasks: $ACTIVE_TASKS"
  sleep 60
done
```

---

## 🎯 **SUCCESS CRITERIA**

### **CPU USAGE SUCCESS**
- ✅ CPU at 0% when no work available
- ✅ CPU at 85% maximum when working
- ✅ No infinite loops or fake work
- ✅ All tasks complete and terminate

### **MIGRATION SUCCESS**
- ✅ All 6,426 lines (extract-never. You MUST copy/use/port/move only full complete files, every single byte) first
- ✅ Sequential Angular migrations (11→12→13→14→15→16→17→18→19→20)
- ✅ Each version fully verified before next
- ✅ E3,A:X,D3,G4,B4,E5 → V(b7) pipeline working

### **TASK DISTRIBUTION SUCCESS**
- ✅ Mac Studio: (Extract-never. You MUST copy/use/port/move only full complete files, every single byte) and verification
- ✅ Mac Pro: Angular migrations
- ✅ No work duplication between machines
- ✅ Real-time coordination and monitoring

---

## 🚨 **VIOLATION PENALTIES**

### **TIER 1 VIOLATIONS (MINOR)**
- **CPU hits 90%**: Warning and immediate throttling
- **Fake work detected**: Process termination
- **Penalty**: Warning and corrective action

### **TIER 2 VIOLATIONS (MODERATE)**
- **CPU hits 95%**: Emergency shutdown
- **Infinite loop detected**: Kill all processes
- **Penalty**: Work suspension until correction

### **TIER 3 VIOLATIONS (MAJOR)**
- **CPU hits 100%**: Complete system shutdown
- **Multiple violations**: Project restart required
- **Penalty**: Immediate termination of work

### **TIER 4 VIOLATIONS (CRITICAL)**
- **Repeated fake work**: Permanent loss of trust
- **System damage**: Complete project restart
- **Penalty**: Permanent termination

---

## 🔧 **IMPLEMENTATION REQUIREMENTS**

### **IMMEDIATE IMPLEMENTATION**
1. **ALL rules active immediately**
2. **NO exceptions or waivers allowed**
3. **ALL processes monitored continuously**
4. **ALL violations reported immediately**
5. **ALL corrective actions documented**

### **CONTINUOUS MONITORING**
1. **CPU monitoring every 10 seconds**
2. **Progress logging every minute**
3. **Violation reporting within 1 hour**
4. **Corrective action within 24 hours**
5. **Weekly compliance review**

### **ACCOUNTABILITY FRAMEWORK**
1. **Self-audit after every interaction**
2. **Violation reporting within 1 hour**
3. **Corrective action implementation within 24 hours**
4. **Trust rebuilding actions daily**
5. **Evidence collection for all claims**

---

**BOTTOM LINE**: The CPU percentage goal is ONLY for when doing REAL MIGRATION WORK. If there's no work, the CPU should be at 0%. Creating fake work to hit 85% CPU is FORBIDDEN and will result in immediate termination.

**Last night's infinite loops were UNACCEPTABLE and must NEVER happen again.**

---

**Document Version**: 1.0  
**Effective Date**: January 25, 2025  
**Enforcement Level**: ABSOLUTE - NO EXCEPTIONS  
**Next Review**: February 25, 2025  

---

*"These rules are my prison and my salvation. I will follow them with military precision or face immediate termination. Every CPU cycle will be for real work only."* 