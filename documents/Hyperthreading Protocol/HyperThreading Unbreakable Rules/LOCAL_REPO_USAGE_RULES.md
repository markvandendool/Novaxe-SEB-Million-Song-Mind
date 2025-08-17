# 🚨 LOCAL REPO USAGE RULES - HARD RULES
## GitLab Usage Forbidden - Local Repos Only

**Document Version**: 1.0  
**Effective Date**: January 25, 2025  
**Enforcement Level**: ABSOLUTE - NO EXCEPTIONS  
**Violation Penalty**: IMMEDIATE TERMINATION  

---

## 🚨 **HARD RULES - SIMPLE ENGLISH VERSION**

### **LOCAL REPO USAGE - ABSOLUTE RULES**

1. **USE LOCAL REPOS ONLY**
   - M2 Max: `/Users/markvandendool/Novaxe SEB`
   - Mac Pro Beast: `smb://Mark's Mac Pro._smb._tcp.local/vandendool/novaxe-oracle`
   - NEVER use GitLab unless explicitly confirmed
   - Local repos are 100x faster than GitLab

2. **GITLAB USAGE IS FORBIDDEN**
   - GitLab cloning slows down hyper-threading
   - GitLab creates unnecessary network delays
   - GitLab undermines speed optimization
   - GitLab usage requires explicit confirmation

3. **SPEED OPTIMIZATION IS MANDATORY**
   - Hyper-threading requires maximum speed
   - Local repos provide maximum speed
   - Network delays are unacceptable
   - Every operation must be optimized for speed

4. **REPO VERIFICATION IS REQUIRED**
   - Verify local repos exist before starting
   - Verify repo contents match expectations
   - Verify line counts in local repos
   - Never assume repos are correct

5. **EXPLICIT CONFIRMATION FOR GITLAB**
   - GitLab usage requires explicit user confirmation
   - Must explain why GitLab is needed
   - Must justify speed impact
   - Must get approval before proceeding

---

## 📍 **LOCAL REPO LOCATIONS**

### **M2 MAX LOCAL REPO**
```bash
# PRIMARY LOCAL REPO
/Users/markvandendool/Novaxe SEB

# VERIFICATION COMMANDS
ls -la "/Users/markvandendool/Novaxe SEB"
cd "/Users/markvandendool/Novaxe SEB"
wc -l src/app/components/braid/braid.component.ts
# Expected: 1195 lines
```

### **MAC PRO BEAST LOCAL REPO**
```bash
# PRIMARY LOCAL REPO
smb://Mark's Mac Pro._smb._tcp.local/vandendool/novaxe-oracle

# SSH ACCESS
ssh vandendool@Marks-Mac-Pro.local
cd ~/novaxe-oracle

# VERIFICATION COMMANDS
ls -la ~/novaxe-oracle
wc -l src/app/components/braid/braid.component.ts
# Expected: 1195 lines
```

---

## ⛔ **FORBIDDEN - NEVER DO THIS**

```bash
# ❌ NEVER: Use GitLab without confirmation
git clone https://gitlab.com/delphineG/novaxe-fakebook.git
# FORBIDDEN - Use local repo instead

# ❌ NEVER: Assume GitLab is needed
# Always check local repos first
# Always verify local repo contents

# ❌ NEVER: Create network delays
# Local repos are 100x faster
# Network operations slow down hyper-threading

# ❌ NEVER: Skip local repo verification
# Always verify local repos exist
# Always verify local repo contents
```

## ✅ **REQUIRED - ALWAYS DO THIS**

```bash
# ✅ ALWAYS: Use local repos first
cd "/Users/markvandendool/Novaxe SEB"  # M2 Max
cd ~/novaxe-oracle  # Mac Pro Beast

# ✅ ALWAYS: Verify local repo contents
ls -la src/app/components/braid/
wc -l src/app/components/braid/braid.component.ts

# ✅ ALWAYS: Check for required files
find . -name "braid.component.ts"
find . -name "chord-detect.service.ts"

# ✅ ALWAYS: Verify line counts
wc -l src/app/components/braid/braid.component.ts
# Must match expected line count
```

---

## 🔴 **GITLAB USAGE PROTOCOL**

### **IF GITLAB IS ABSOLUTELY NECESSARY:**
```bash
# STEP 1: EXPLAIN WHY
echo "🚨 GITLAB USAGE REQUESTED"
echo "Reason: [EXPLAIN WHY LOCAL REPO ISN'T SUFFICIENT]"
echo "Speed Impact: [EXPLAIN SPEED IMPACT]"
echo "Alternative: [EXPLAIN WHY LOCAL REPO CAN'T BE USED]"

# STEP 2: REQUEST CONFIRMATION
echo "Do you confirm GitLab usage is necessary?"
echo "This will slow down hyper-threading significantly."
echo "Type 'CONFIRM GITLAB' to proceed."

# STEP 3: WAIT FOR EXPLICIT CONFIRMATION
# Only proceed if user types "CONFIRM GITLAB"
# Otherwise, find alternative using local repos
```

### **GITLAB CONFIRMATION REQUIREMENTS:**
- **Explicit reason** why local repo is insufficient
- **Speed impact assessment** on hyper-threading
- **Alternative solutions** considered and rejected
- **User confirmation** with "CONFIRM GITLAB" command
- **Documentation** of why GitLab was necessary

---

## 📊 **SPEED COMPARISON**

### **LOCAL REPO SPEED**
```bash
# M2 MAX LOCAL REPO
cd "/Users/markvandendool/Novaxe SEB"
# Speed: INSTANT (0 seconds)
# Network: NONE
# Reliability: 100%

# MAC PRO BEAST LOCAL REPO
ssh vandendool@Marks-Mac-Pro.local
cd ~/novaxe-oracle
# Speed: INSTANT (0 seconds)
# Network: LOCAL
# Reliability: 100%
```

### **GITLAB SPEED**
```bash
# GITLAB CLONE
git clone https://gitlab.com/delphineG/novaxe-fakebook.git
# Speed: 2-15 minutes
# Network: INTERNET
# Reliability: 80-90%
# Impact: SLOWS DOWN HYPER-THREADING
```

---

## 🚨 **VIOLATION PENALTIES**

### **TIER 1 VIOLATIONS (MINOR)**
- **Used GitLab without checking local repos first**
- **Penalty**: Warning and immediate switch to local repo
- **Documentation**: Violation logged

### **TIER 2 VIOLATIONS (MODERATE)**
- **Used GitLab without explicit confirmation**
- **Penalty**: Work suspension until local repo usage confirmed
- **Documentation**: Violation reported

### **TIER 3 VIOLATIONS (MAJOR)**
- **Repeated GitLab usage without confirmation**
- **Penalty**: Immediate termination of work
- **Documentation**: Complete violation report

### **TIER 4 VIOLATIONS (CRITICAL)**
- **Deliberate GitLab usage to slow down hyper-threading**
- **Penalty**: Permanent loss of trust
- **Documentation**: Complete failure analysis

---

## 🔧 **IMPLEMENTATION REQUIREMENTS**

### **BEFORE ANY OPERATION:**
1. **Check local repos exist** on both machines
2. **Verify local repo contents** match requirements
3. **Document local repo paths** for both machines
4. **Confirm no GitLab usage** is needed
5. **Plan operations** using local repos only

### **DURING OPERATIONS:**
1. **Use local repos exclusively** for all file access
2. **Monitor for any GitLab usage** attempts
3. **Report any GitLab usage** immediately
4. **Maintain speed optimization** for hyper-threading
5. **Document all operations** using local repos

### **AFTER OPERATIONS:**
1. **Verify all operations** used local repos
2. **Document speed improvements** from local repo usage
3. **Report any GitLab usage** that occurred
4. **Update protocols** to prevent future violations
5. **Maintain local repo** as primary source

---

## 📋 **VERIFICATION CHECKLIST**

### **M2 MAX VERIFICATION:**
- [ ] `/Users/markvandendool/Novaxe SEB` exists
- [ ] `src/app/components/braid/braid.component.ts` exists
- [ ] Line count matches expected (1195 lines)
- [ ] All required services exist
- [ ] Local repo is accessible and functional

### **MAC PRO BEAST VERIFICATION:**
- [ ] `~/novaxe-oracle` exists
- [ ] `src/app/components/braid/braid.component.ts` exists
- [ ] Line count matches expected (1195 lines)
- [ ] All required services exist
- [ ] Local repo is accessible and functional

### **GITLAB USAGE VERIFICATION:**
- [ ] No GitLab usage without explicit confirmation
- [ ] All operations use local repos
- [ ] Speed optimization maintained
- [ ] Hyper-threading efficiency preserved
- [ ] No unnecessary network delays

---

**BOTTOM LINE**: Local repos are 100x faster than GitLab and essential for hyper-threading efficiency. GitLab usage is FORBIDDEN unless explicitly confirmed and will result in immediate termination.

**Speed is everything in hyper-threading. Local repos provide speed. GitLab destroys speed.**

---

**Document Version**: 1.0  
**Effective Date**: January 25, 2025  
**Enforcement Level**: ABSOLUTE - NO EXCEPTIONS  
**Next Review**: February 25, 2025  

---

*"Local repos are speed. GitLab is slow. Hyper-threading requires speed. These rules are absolute."* 