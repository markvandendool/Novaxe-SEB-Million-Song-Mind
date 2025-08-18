# 🚨 CPU USAGE ABSOLUTE RULES - CORRECTED VERSION
## **Replacing Corrupted CPU_USAGE_ABSOLUTE_RULES.md**

**Document Version**: 2.0 (Corruption Fixed)  
**Effective Date**: August 18, 2025 (Post-Restructure)  
**Enforcement Level**: ABSOLUTE - NO EXCEPTIONS  

---

## 🎯 **CORE PRINCIPLE: CPU IS FOR REAL WORK ONLY**

```yaml
FUNDAMENTAL TRUTH:
  - CPU percentage targets are ONLY for when doing REAL work
  - If there's no work → CPU should be 0% (THIS IS CORRECT)
  - Creating fake work to hit CPU targets → IMMEDIATE TERMINATION
  - Idle processes with 0% CPU → GOOD SYSTEM BEHAVIOR
```

---

## 🚫 **UNBREAKABLE RULES - SIMPLE ENGLISH**

### **RULE 1: REAL WORK ONLY**
- Every CPU cycle must accomplish actual development tasks
- File operations, compilation, testing = REAL WORK
- Infinite loops, fake calculations = FAKE WORK (FORBIDDEN)
- When no tasks exist → Let CPU rest at 0%

### **RULE 2: NO INFINITE LOOPS EVER**
- No `while(true)` without exit conditions
- No recursive functions that never terminate  
- No meaningless repetitive operations
- All processes must complete and exit

### **RULE 3: 85% MAXIMUM WHEN WORKING**
- Target: 85% CPU usage during active development
- If CPU hits 90%: Throttle processes immediately
- If CPU hits 95%: Emergency shutdown required
- If CPU hits 100%: System failure - investigate

### **RULE 4: IDLE IS BETTER THAN FAKE**
- 0% CPU with no tasks = PERFECT BEHAVIOR
- 85% CPU doing meaningless work = VIOLATION
- Only run processes that move development forward
- Exit programs when work is complete

### **RULE 5: ALL TASKS MUST TERMINATE**
- Every process must have exit conditions
- Every loop must be bounded and finite
- Every task must report completion
- No background processes running indefinitely

### **RULE 6: COMPLETE FILES ONLY** (Fixed corrupted rule)
- Copy complete files with all lines intact
- Verify line counts before and after operations  
- Never use partial files or code snippets
- Preserve original functionality completely

### **RULE 7: SEQUENTIAL OPERATIONS**
- One major task at a time (Angular migration: 11→12→13...)
- Complete current step before starting next
- Verify success before proceeding
- No parallel operations on same codebase

### **RULE 8: MONITORING IS MANDATORY**
- Check CPU usage regularly during work
- Log progress and task completion
- Emergency shutdown procedures ready
- Real-time system health verification

---

## ✅ **ACCEPTABLE CPU USAGE PATTERNS**

```bash
# ✅ GOOD: Real compilation work
npm run build                    # 85% CPU for 30 seconds, then exits
ng build --prod                  # High CPU during build, then 0%
tsc --noEmit                     # TypeScript checking, then complete

# ✅ GOOD: Idle state
# No active development tasks = 0% CPU usage (CORRECT)

# ✅ GOOD: Bounded file operations
cp source.ts destination.ts      # Brief CPU spike, then complete
wc -l *.ts                       # Count lines, then exit
```

## ❌ **FORBIDDEN CPU USAGE PATTERNS**

```bash
# ❌ NEVER: Infinite loops
while(true) {
  console.log("Working...");     # FAKE WORK - TERMINATION
}

# ❌ NEVER: Meaningless calculations  
for(i = 0; i < 999999999; i++) {
  Math.random();                 # FAKE WORK - TERMINATION
}

# ❌ NEVER: Busy waiting
while(cpuUsage < 85) {
  doNothing();                   # FAKE WORK - TERMINATION
}

# ❌ NEVER: Parallel conflicting operations
ng update @angular/core@12 & ng update @angular/core@13  # CONFLICT
npm run build & npm run build & npm run build           # WASTE
```

---

## 🔍 **MONITORING COMMANDS**

### **Real CPU Monitoring:**
```bash
# Check actual CPU usage
ps aux | grep -E "node|ng|npm|tsc" | grep -v grep
top -l 1 | grep 'CPU usage'

# Identify real vs fake work
ps aux | sort -k 3 -nr | head -10    # Top CPU consumers
pgrep -fl "node|ng|npm"              # Active Node processes
```

### **System Health Verification:**
```bash
# Verify processes are doing real work
lsof -p [PID]                        # What files is process accessing?
strace -p [PID]                      # What system calls (Linux)
dtruss -p [PID]                      # What system calls (macOS)

# If process not accessing files or making progress → FAKE WORK
```

---

## 🚨 **EMERGENCY PROTOCOLS**

### **CPU OVERHEATING (90%+ Usage):**
```bash
echo "🚨 CPU OVERHEATING - THROTTLING PROCESSES"
pkill -STOP node                     # Pause Node processes
pkill -STOP ng                       # Pause Angular CLI
sleep 10                             # Cool down period
pkill -CONT node                     # Resume if temperature OK
```

### **Infinite Loop Detection:**
```bash
echo "🚨 INFINITE LOOP DETECTED - EMERGENCY SHUTDOWN"
pkill -9 node                        # Force kill Node
pkill -9 ng                          # Force kill Angular CLI  
pkill -9 npm                         # Force kill NPM
pkill -9 tsc                         # Force kill TypeScript compiler
echo "All development processes terminated"
```

### **Fake Work Detection:**
```bash
echo "🚨 FAKE WORK DETECTED - IMMEDIATE TERMINATION"
echo "Process doing fake work to maintain CPU targets"
echo "This violates core development principles"
kill -9 [PID_OF_FAKE_PROCESS]
echo "Fake work process terminated - investigation required"
```

---

## 📊 **ACCEPTABLE DEVELOPMENT SCENARIOS**

### **SCENARIO 1: Angular Development**
```yaml
Task: ng serve (development server)
Expected CPU: 15-30% sustained (serving files)
Duration: Until manually stopped
Behavior: Real work - serving application

Task: ng build --prod (production build)  
Expected CPU: 85% for 1-5 minutes
Duration: Until build complete, then exit
Behavior: Real work - compiling application
```

### **SCENARIO 2: TypeScript Compilation**
```yaml
Task: tsc --noEmit (error checking)
Expected CPU: 60-85% for 10-60 seconds
Duration: Until checking complete, then exit  
Behavior: Real work - type checking code

Task: Watching mode (tsc --watch)
Expected CPU: 5-10% sustained (file monitoring)
Duration: Until manually stopped
Behavior: Real work - monitoring file changes
```

### **SCENARIO 3: File Operations**
```yaml
Task: Copying large files (cp source dest)
Expected CPU: 20-40% during transfer
Duration: Until copy complete, then exit
Behavior: Real work - file system operations

Task: Line counting (wc -l *.ts)
Expected CPU: 10-30% for few seconds
Duration: Until counting complete, then exit
Behavior: Real work - file analysis
```

---

## 🎯 **SUCCESS CRITERIA**

### **CPU Usage Success:**
- ✅ 0% CPU when no development tasks active
- ✅ 85% maximum CPU during real work
- ✅ All processes complete and terminate properly
- ✅ No infinite loops or fake work detected

### **Development Success:**
- ✅ Files copied completely with verified line counts
- ✅ Builds complete successfully or fail with clear errors  
- ✅ Type checking completes with error counts
- ✅ Development server runs until manually stopped

### **System Health Success:**
- ✅ Memory usage remains stable
- ✅ No processes consuming CPU without progress
- ✅ All file operations complete successfully
- ✅ Emergency shutdown procedures tested and ready

---

## 🔴 **VIOLATION CONSEQUENCES**

### **MINOR VIOLATIONS:**
- CPU briefly exceeds 85% during legitimate work
- **Action:** Monitor and throttle if sustained
- **Penalty:** Warning logged

### **MODERATE VIOLATIONS:**  
- CPU sustained above 90% or brief fake work detected
- **Action:** Immediate process throttling or termination
- **Penalty:** Work suspension until correction

### **MAJOR VIOLATIONS:**
- Infinite loops, sustained fake work, or CPU above 95%
- **Action:** Emergency shutdown of all processes
- **Penalty:** Session termination and investigation

### **CRITICAL VIOLATIONS:**
- Repeated fake work, system damage, or malicious behavior
- **Action:** Complete system shutdown and reset
- **Penalty:** Permanent development access revocation

---

## ⚡ **QUICK REFERENCE CHECKLIST**

### **Before Starting Work:**
- [ ] Verify current CPU usage (should be low/idle)
- [ ] Identify specific development task to perform  
- [ ] Estimate expected CPU usage and duration
- [ ] Ensure emergency shutdown procedures ready

### **During Work:**
- [ ] Monitor CPU usage every few minutes
- [ ] Verify processes are making real progress
- [ ] Check for infinite loops or stuck operations
- [ ] Throttle if CPU exceeds 85% sustained

### **After Work:**
- [ ] Verify all processes completed and exited
- [ ] Check CPU returned to idle/low usage
- [ ] Log completion status and any issues
- [ ] Document actual vs expected performance

---

## 📋 **ENFORCEMENT FRAMEWORK**

### **Self-Monitoring Requirements:**
1. **Check CPU usage before and after each task**
2. **Verify all processes complete properly**  
3. **Document any violations immediately**
4. **Report system health issues within 1 hour**
5. **Take corrective action within 24 hours**

### **Automated Monitoring:**
```bash
# Run this every 60 seconds during development
#!/bin/bash
CPU=$(top -l 1 | grep 'CPU usage' | awk '{print $3}' | sed 's/%//')
if (( $(echo "$CPU > 85" | bc -l) )); then
  echo "$(date): WARNING - CPU usage ${CPU}% exceeds 85%"
  ps aux | grep -E "node|ng|npm" | grep -v grep
fi
```

---

**BOTTOM LINE:** CPU percentage targets are ONLY for real development work. When idle, 0% CPU is the correct and desired state. Any fake work to maintain CPU targets results in immediate termination.

---

**Document Version**: 2.0 (Corruption Fixed)  
**Replaces**: CPU_USAGE_ABSOLUTE_RULES.md (corrupted version)  
**Effective**: August 18, 2025  
**Authority**: ABSOLUTE - NO EXCEPTIONS
