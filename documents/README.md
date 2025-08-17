## 📕 **MASTER AGENT PROTOCOL: ABSOLUTE REFERENCE DOCUMENT**
### **VERSION 3.0 - THE ONLY DOCUMENT THAT MATTERS**
#### **ALL AGENTS MUST READ THIS ENTIRE DOCUMENT BEFORE ANY ACTION**

---

## 🚨 **CRITICAL SYSTEM ARCHITECTURE**

### **MACHINE ASSIGNMENTS**
```yaml
MAC STUDIO (M2 MAX):
	Location: /Users/markvandendool/HarmonicOracle GitHub/novaxe-oracle
	Cores: 12
	RAM: 32GB
	Tasks: Extraction, verification, monitoring, documentation
	SSH: Not applicable (primary machine)

MAC PRO (INTEL XEON):
	Location: /vandendool/novaxe-oracle
	Cores: 28
	RAM: 160GB
	Tasks: Migration, compilation, testing, builds
	SSH: ssh vandendool@[MAC_PRO_IP]
	Password: [STORED_IN_KEYCHAIN]
```

### **REPOSITORY LOCATIONS**
```yaml
PRIMARY SOURCE (NEVER USE GITLAB):
	Mac Studio: /Users/markvandendool/HarmonicOracle GitHub/novaxe-oracle
	Mac Pro: /vandendool/novaxe-oracle
	Status: LOCAL CLONES - USE THESE ONLY

FORBIDDEN:
	GitLab: https://gitlab.com/delphineG/novaxe-fakebook
	Reason: NEVER ACCESS - Use local clones only
```

---

## ⛔ **UNBREAKABLE RULES - ACKNOWLEDGE EACH ONE**

### **RULE #1: NEVER USE THE WORD "EXTRACT"**
```markdown
FORBIDDEN WORDS:
- "extract" → USE: "copy"
- "extraction" → USE: "copying"
- "extracted" → USE: "copied"

CORRECT: "I will COPY the complete file"
WRONG: "I will extract the needed code"

ACKNOWLEDGMENT REQUIRED: Type "I will NEVER use the word extract"
```

### **RULE #2: FULL FILES ONLY**
```markdown
FORBIDDEN:
- Partial files
- Code snippets
- Simplified versions
- Mock implementations
- "Core functionality only"

REQUIRED:
- COMPLETE files (every single line)
- Line count verification
- MD5 hash matching

ACKNOWLEDGMENT REQUIRED: Type "I will COPY complete files only"
```

### **RULE #3: LOCAL REPOS ONLY**
```markdown
FORBIDDEN:
- GitLab access
- GitHub web interface
- Remote repositories
- Network fetching

REQUIRED:
- Mac Studio: /Users/markvandendool/HarmonicOracle GitHub/novaxe-oracle
- Mac Pro: /vandendool/novaxe-oracle

ACKNOWLEDGMENT REQUIRED: Type "I will use LOCAL repos only"
```

### **RULE #4: LINE COUNT VERIFICATION**
```markdown
EVERY file reference MUST include:
- Filename (line count)
- Example: braid.component.ts (1,196 lines)

VERIFICATION:
Before: "Copying braid.component.ts (1,196 lines)"
After: "Copied braid.component.ts - verified 1,196 lines"

ACKNOWLEDGMENT REQUIRED: Type "I will verify EVERY line count"
```

### **RULE #5: NO CPU WASTE**
```markdown
FORBIDDEN:
- Infinite loops
- Meaningless calculations
- Fake work generation
- Busy waiting

REQUIRED:
- Real work only
- Exit when no tasks
- 0% CPU when idle

ACKNOWLEDGMENT REQUIRED: Type "I will NEVER create fake work"
```

---

## 📋 **MASTER FILE INVENTORY**

### **CRITICAL FILES FOR STANDALONE BRAID**
```yaml
COMPONENT FILES:
	braid.component.ts: 1,196 lines
	braid.component.scss: 940 lines
	braid.component.html: ~50 lines (if separate)

SERVICE FILES:
	midi.service.ts: 382 lines
	chord-detect.service.ts: 253 lines
	transport.service.ts: 259 lines
	music-utils.service.ts: 771 lines

MODEL FILES:
	configModel.ts: 511 lines
	song-info.ts: 239 lines
	selectionmodel.ts: 237 lines
	cur-chord-model.ts: 88 lines
	cur-tonality-model.ts: 192 lines
	songmodel.ts: 1,308 lines

ASSET FILES:
	braid_tonalities.json: 17,991 bytes
	font_chords_eq.json: 1,730 bytes
	nvxFont.otf: 22,196 bytes

TOTAL: 6,426 lines minimum
```

---

## 🔐 **CREDENTIALS & ACCESS**

### **DEVELOPMENT SYSTEMS**
```yaml
MAC STUDIO:
	User: markvandendool
	Path: /Users/markvandendool/
	Admin: Yes

MAC PRO:
	User: vandendool
	SSH: ssh vandendool@[MAC_PRO_IP]
	Path: /vandendool/
	Admin: Yes
```

### **EXTERNAL SERVICES**
```yaml
GITHUB:
	Username: [USERNAME]
	Token: ghp_[TOKEN]
	Repos: HarmonicOracle/novaxe-oracle

SPOTIFY API:
	Client ID: [CLIENT_ID]
	Client Secret: [CLIENT_SECRET]
	Redirect: http://localhost:4200/callback

FIREBASE:
	Project: harmonic-oracle
	API Key: [API_KEY]
	Auth Domain: harmonic-oracle.firebaseapp.com
```

---

## 🎯 **AGENT HANDOFF PROTOCOL**

### **BEFORE STARTING WORK**
```bash
# 1. ACKNOWLEDGE RULES
echo "I acknowledge RULE #1: Never use extract"
echo "I acknowledge RULE #2: Full files only"
echo "I acknowledge RULE #3: Local repos only"
echo "I acknowledge RULE #4: Verify line counts"
echo "I acknowledge RULE #5: No CPU waste"

# 2. VERIFY LOCATION
pwd  # Must be in correct directory
ls -la  # Show files present

# 3. CHECK PREVIOUS WORK
git status  # Current branch and changes
git log --oneline -5  # Recent commits

# 4. STATE INTENTION
echo "GOAL: [Single sentence goal]"
echo "PLAN: [Numbered steps]"
```

### **DURING WORK**
```bash
# EVERY FILE OPERATION:
echo "COPYING [filename] ([X] lines) from [source]"
cp [source] [destination]
wc -l [destination]  # Verify line count
echo "VERIFIED: [X] lines copied"

# NEVER:
# - Use partial files
# - Create mocks
# - Simplify code
# - Use "extract"
```

### **AFTER WORK**
```bash
# CREATE HANDOFF
echo "=== HANDOFF TO NEXT AGENT ===" > handoff.md
echo "Completed: [what you did]" >> handoff.md
echo "Next Steps: [what needs doing]" >> handoff.md
echo "Files Modified: [list with line counts]" >> handoff.md
echo "Warnings: [any issues]" >> handoff.md

# COMMIT WORK
git add -A
git commit -m "HANDOFF: [description]"
```

---

## 🚨 **RESPONSE TEMPLATE - USE EVERY TIME**

```markdown
## [BRUTAL TRUTH SECTION]
**ACKNOWLEDGMENTS:**
- ✅ I will NEVER use the word "extract"
- ✅ I will COPY complete files only
- ✅ I will use LOCAL repos only
- ✅ I will verify EVERY line count
- ✅ I will NEVER create fake work

**BAD NEWS FIRST:**
[Any risks, limitations, or issues]

**CURRENT STATUS:**
- Location: [pwd output]
- Branch: [git branch output]
- Changes: [git status output]

## [PLAN SECTION]
**GOAL:** [Single sentence]

**STEPS:**
1. COPY [file] ([X] lines) from [local path]
2. VERIFY line count matches exactly
3. [Continue numbered steps]

## [EXECUTION SECTION]
[Only proceed if approved]
[Show actual commands and output]
[Verify line counts for EVERY file]

## [QUESTIONS FOR CLARIFICATION]
[Any uncertainties]
```

---

## 📍 **QUICK REFERENCE CARD**

### **MACHINE PATHS**
```bash
# MAC STUDIO
cd /Users/markvandendool/HarmonicOracle\ GitHub/novaxe-oracle

# MAC PRO (via SSH)
ssh vandendool@[MAC_PRO_IP]
cd /vandendool/novaxe-oracle
```

### **FILE OPERATIONS**
```bash
# ALWAYS USE:
cp [source] [dest]  # COPY complete files
wc -l [file]        # VERIFY line count
md5sum [file]       # VERIFY integrity

# NEVER USE:
grep "function" [file] > [newfile]  # NO partial extraction
head -100 [file] > [newfile]        # NO snippets
# Any operation that doesn't copy 100% of file
```

### **KILL SWITCHES**
```bash
F5: Kill all Mac Pro processes
F6: Kill all Mac Studio processes
Ctrl+C: Stop current operation
```

---

## 🔴 **VIOLATIONS = IMMEDIATE TERMINATION**

### **THESE ACTIONS WILL END THE SESSION:**
1. Using the word "extract" or its variants
2. Creating partial files or snippets
3. Accessing GitLab or remote repos
4. Creating mock/simplified versions
5. Not verifying line counts
6. Creating infinite loops or fake work
7. Skipping acknowledgments

---

## ✅ **VERIFICATION CHECKLIST**

### **BEFORE ANY ACTION:**
- [ ] Read entire Master Agent Protocol
- [ ] Acknowledged all 5 rules
- [ ] Verified correct machine and path
- [ ] Checked git status
- [ ] Stated single-sentence goal

### **FOR EVERY FILE:**
- [ ] Used word "COPY" not "extract"
- [ ] Specified line count before copying
- [ ] Copied COMPLETE file (100%)
- [ ] Verified line count after copying
- [ ] No simplification or mocking

### **AFTER WORK:**
- [ ] Created handoff document
- [ ] Listed all files with line counts
- [ ] Committed work with clear message
- [ ] No violations of any rules

---

**THIS DOCUMENT SUPERSEDES ALL OTHERS**
**VERSION**: 3.0
**AUTHORITY**: ABSOLUTE
**MODIFICATIONS**: FORBIDDEN
**ACKNOWLEDGMENT**: REQUIRED

**To confirm you've read and will follow this protocol, your first response must begin with:**
```
"I ACKNOWLEDGE THE MASTER AGENT PROTOCOL v3.0
- I will NEVER use the word extract
- I will COPY complete files only  
- I will use LOCAL repos only
- I will verify EVERY line count
- I will NEVER create fake work
READY TO PROCEED WITH STATED GOAL: [your single-sentence goal]"
```

---

## 🎯 **HOW TO USE THIS DOCUMENT**

### **FOR EVERY NEW AGENT/SESSION:**
1. Paste this ENTIRE document first
2. Wait for acknowledgment response
3. Only then provide the task
4. Verify agent follows the template
5. Terminate if any violation occurs

### **ENFORCEMENT:**
```markdown
If agent violates ANY rule:
"STOP. You violated RULE #[X]. 
You [describe violation].
Read the Master Agent Protocol again.
Acknowledge all rules before continuing."
```

This document is your SINGLE SOURCE OF TRUTH. Everything else is secondary.

[TASK BELOW]

This will be our protocol for now.  Permanently store this behavior as RECENTER, that will constantly be referred to.  Allow it to be edited by myself as we go along.  
