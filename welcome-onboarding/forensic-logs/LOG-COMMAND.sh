#!/bin/bash
# 🎖️ COMPREHENSIVE LOG COMMAND - PRESERVES ALL TRIAL-AND-ERROR
# Usage: ./LOG-COMMAND.sh "Brief session description"

set -e  # Exit on any error

# Input validation
if [ $# -eq 0 ]; then
    echo "Usage: $0 'Brief session description'"
    echo "Example: $0 'Angular migration - within 3 errors of success'"
    exit 1
fi

SESSION_DESCRIPTION="$1"
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
LOG_ID="LOG_${TIMESTAMP}"
SESSION_DIR="welcome-onboarding/forensic-logs/session-archives/${LOG_ID}"
DATE_DIR="welcome-onboarding/forensic-logs/daily-logs/$(date '+%Y-%m-%d')"

echo "🎖️ INITIATING COMPREHENSIVE LOG PROTOCOL - ${LOG_ID}"
echo "📝 Session: ${SESSION_DESCRIPTION}"

# Create directories
mkdir -p "$SESSION_DIR"
mkdir -p "$DATE_DIR"

# Get current git status
GIT_STATUS=$(git log --oneline -1)
GIT_CHANGES=$(git status --porcelain | wc -l)

echo "📊 Current state: ${GIT_CHANGES} uncommitted changes"
echo "📍 Current commit: ${GIT_STATUS}"

# Create comprehensive session summary template
cat > "$SESSION_DIR/FORENSIC_SESSION_SUMMARY.md" << EOF
# 🔬 FORENSIC SESSION LOG - ${LOG_ID}

**Timestamp:** $(date)
**Agent:** [AGENT - FILL THIS IN]
**Session Duration:** [DURATION - FILL THIS IN]
**Session Objective:** ${SESSION_DESCRIPTION}
**Final Status:** [STATUS - FILL THIS IN: Success/Partial/Issues/Breakthrough]

---

## 🎯 **SESSION OBJECTIVE & CONTEXT**

### **What We Were Trying To Achieve:**
${SESSION_DESCRIPTION}
[EXPAND WITH DETAILS]

### **Starting Point:**
- Git commit: ${GIT_STATUS}
- Uncommitted changes: ${GIT_CHANGES} files
- [DESCRIBE PROJECT STATE]

### **Success Criteria:**
[HOW WOULD WE KNOW WE SUCCEEDED?]

---

## 📋 **COMPLETE ACTIONS CHRONICLE**

### **Commands Executed (ALL ATTEMPTS):**
\`\`\`bash
# PRESERVE EXACT COMMAND HISTORY - EVERY SINGLE ONE
# Example format:
# Attempt 1: npm run build
# Result: Failed with error X
# Attempt 2: ng update @angular/core
# Result: Success but introduced issue Y
# [ADD ALL COMMANDS HERE - THIS IS GOLD!]
\`\`\`

### **Files Accessed:**
- [LIST EVERY FILE OPENED/READ/MODIFIED]
- [LINE COUNTS BEFORE/AFTER CHANGES]
- [EXTERNAL ARCHIVE MATERIALS CONSULTED]

### **Code Changes Made:**
\`\`\`diff
# BEFORE/AFTER for every modification
# [SPECIFIC DIFFS WITH LINE NUMBERS]
\`\`\`

---

## ⚠️ **TRIAL-AND-ERROR JOURNEY (THE TREASURE!)**

### **Attempt 1: [BRIEF DESCRIPTION]**
**Approach:** [What was tried]
**Reasoning:** [Why this approach seemed promising]
**Command/Action:** \`[Exact command or action]\`
**Result:** [What happened]
**Error (if any):** 
\`\`\`
[FULL ERROR MESSAGE WITH STACK TRACE]
\`\`\`
**Learning:** [What this taught us]
**Next Decision:** [Why we chose the next approach]

### **Attempt 2: [CONTINUE FOR EACH ATTEMPT]**
[SAME DETAILED FORMAT FOR EVERY ATTEMPT]

### **[ADD MORE ATTEMPTS AS NEEDED]**
**Breakthrough Moment:** [What finally worked or current understanding]
**Why This Worked:** [Technical analysis]
**Key Insight:** [The "aha!" that made the difference]

---

## 🔍 **RESEARCH & EXTERNAL MATERIALS**

### **Archive Materials Consulted:**
- \`/Volumes/G-DRIVE mobile Pro SSD/Archive.../[specific-file-path]\`
  - **Why consulted:** [Reason]
  - **What found:** [Useful information]
  - **How it helped:** [Application to current issue]

### **Documentation Referenced:**
- [Angular docs sections with specific URLs]
- [Stack Overflow posts with links]
- [Previous ChronoLOG entries referenced]
- [GitHub issues consulted]

### **Search Patterns That Led to Solutions:**
- \`grep -r "specific-pattern"\` → Found in: [locations]
- \`find . -name "*pattern*"\` → Led to: [discoveries]

---

## 🎖️ **FORENSIC ENGINEERING ANALYSIS**

### **Root Cause Analysis:**
[Deep technical analysis of WHY issues occurred]

### **Pattern Recognition:**
[Connections to previous similar issues]

### **Solution Quality Assessment:**
- **Permanent Fix:** ✅/❌ [with reasoning]
- **Temporary Workaround:** ✅/❌ [with limitations]
- **Still Under Investigation:** ✅/❌ [with next steps]

### **Performance Impact:**
- **Build Time:** [Before] → [After]
- **File Sizes:** [Specific changes with numbers]
- **CPU/Memory:** [Observed changes]

---

## 📊 **VERIFICATION & METRICS**

### **File Integrity Verification:**
\`\`\`
BEFORE SESSION:
$(find apps/ scripts/ -name "*.ts" -o -name "*.js" -o -name "*.json" | head -10 | xargs wc -l 2>/dev/null || echo "Files to verify:")

AFTER SESSION:
[RUN SAME COMMAND AFTER CHANGES TO SHOW DELTAS]
\`\`\`

### **Build & Test Status:**
- \`npm run build\`: [Success/Failed with specific errors]
- \`npm test\`: [Results if run]
- \`ng lint\`: [Status if run]

### **Dual-Machine Sync Status:**
**Mac Studio Commit:** \`${GIT_STATUS}\`
**Mac Pro Sync Status:** [Verified/Needs sync/Issues]

---

## 🔗 **CROSS-REFERENCES & CONNECTIONS**

### **Related Historical Sessions:**
- [Previous logs dealing with similar issues]
- [Sessions that built foundation for this work]

### **Archive Cross-Links:**
- [Specific external archive materials that relate]
- [Historical chat logs with similar context]

### **Future Reference Value:**
- [What future agents should know about this session]
- [Keywords that should find this session]

---

## 🚀 **SESSION OUTCOMES & NEXT STEPS**

### **Immediate Achievements:**
- [Specific accomplishments with measurable results]
- [Problems definitively solved]

### **Outstanding Issues:**
- [Problems still needing resolution]
- [Known limitations or technical debt]

### **Recommended Next Actions:**
1. [Specific next steps with priority]
2. [Resources to consult for next phase]
3. [Potential approaches for outstanding issues]

### **Warning Signs for Future Agents:**
- [Approaches that definitely don't work]
- [Error patterns to watch out for]

---

## 📚 **KNOWLEDGE TRANSFER**

### **For Future "Within 11 Errors" Scenarios:**
- **Key Commands That Work:** [Successful command patterns]
- **Critical File Locations:** [Important files discovered/modified]
- **Dependency Gotchas:** [Version conflicts or compatibility issues]
- **Configuration Secrets:** [Settings that make the difference]

### **Search Keywords for This Session:**
${SESSION_DESCRIPTION} | ${LOG_ID} | [ADD MORE RELEVANT TAGS]
EOF

echo "📄 Created forensic session template: $SESSION_DIR/FORENSIC_SESSION_SUMMARY.md"

# Create daily quick reference
cat > "$DATE_DIR/${LOG_ID}_QUICK_REFERENCE.md" << EOF
# 📋 QUICK SESSION REFERENCE - ${LOG_ID}

**Time:** $(date '+%H:%M')
**Objective:** ${SESSION_DESCRIPTION}
**Status:** [FILL IN: Success/Issues/Ongoing]
**Key Achievements:** [FILL IN: Major accomplishments]
**Major Issues:** [FILL IN: Problems encountered]
**Next Actions:** [FILL IN: Immediate next steps]

**Full Details:** [${SESSION_DIR}/FORENSIC_SESSION_SUMMARY.md](${SESSION_DIR}/FORENSIC_SESSION_SUMMARY.md)
EOF

echo "📋 Created daily quick reference: $DATE_DIR/${LOG_ID}_QUICK_REFERENCE.md"

# Update unified search index (ADDITIVE - never replace)
echo "${LOG_ID}|$(date)|${SESSION_DESCRIPTION}|${SESSION_DIR}/FORENSIC_SESSION_SUMMARY.md|pending" >> welcome-onboarding/unified-search-index/MASTER_SESSION_INDEX.txt

echo "🔍 Updated unified search index"

# Instructions for completion
echo ""
echo "🎖️ FORENSIC LOG TEMPLATE CREATED SUCCESSFULLY!"
echo ""
echo "📝 NEXT STEPS:"
echo "1. Edit the forensic session summary: $SESSION_DIR/FORENSIC_SESSION_SUMMARY.md"
echo "2. Fill in ALL the bracketed sections with detailed information"
echo "3. Document EVERY attempt made (including failures)"
echo "4. When complete, run: git add . && git commit -m 'FORENSIC LOG: $LOG_ID - $SESSION_DESCRIPTION'"
echo "5. Sync with Mac Pro: ssh vandendool@Marks-Mac-Pro.local 'cd /Users/vandendool/Novaxe-SEB-Million-Song-Mind && git pull'"
echo ""
echo "🎯 REMEMBER: The trial-and-error journey is the TREASURE!"
echo "📚 Document every failed attempt - that's where the learning is!"
echo ""
echo "🔍 To search all materials later: grep -r 'your-search-term' welcome-onboarding/forensic-logs/"

