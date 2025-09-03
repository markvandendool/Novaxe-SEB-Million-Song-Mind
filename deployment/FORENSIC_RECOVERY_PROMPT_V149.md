# 🚨 FORENSIC RECOVERY PROMPT FOR CHORDCUBES 6.0 V1.49
## CRITICAL SYSTEM LOCATION GUIDE FOR NEXT AI AGENT

### ⚠️ READ THIS FIRST - UNBREAKABLE RULES
**EVERY single edit increases version by 0.1 - NO EXCEPTIONS**
**ALWAYS verify HTML output and console errors at end of EVERY reply**
**NEVER claim completion without verification - use curl to check served content**
**Handle terminal interactions yourself - never leave system hanging**

---

## 🎯 CURRENT SYSTEM STATE: ChordCubes 6.0 V1.49 MAIN MENU STOP BUTTON
**Date Created:** September 2, 2025 19:35 MDT
**Last Agent:** Claude 3.5 Sonnet
**Commit Hash:** `4496b187`

---

## 🗂️ EXACT FILE LOCATIONS (ABSOLUTE PATHS)

### PRIMARY WORKING DIRECTORY:
```
/Users/markvandendool/Novaxe-SEB-Million-Song-Mind/deployment/chordcubes-5-0-deployment/cubes/
```

### CORE FILES:
- **main.js:** `/Users/markvandendool/Novaxe-SEB-Million-Song-Mind/deployment/chordcubes-5-0-deployment/cubes/main.js`
- **index.html:** `/Users/markvandendool/Novaxe-SEB-Million-Song-Mind/deployment/chordcubes-5-0-deployment/cubes/index.html`
- **styles.css:** `/Users/markvandendool/Novaxe-SEB-Million-Song-Mind/deployment/chordcubes-5-0-deployment/cubes/styles.css`

### REPOSITORY ROOT:
```
/Users/markvandendool/Novaxe-SEB-Million-Song-Mind/
```

---

## 🌐 SERVER ACCESS

### LOCAL DEVELOPMENT SERVER:
```bash
cd /Users/markvandendool/Novaxe-SEB-Million-Song-Mind/deployment/chordcubes-5-0-deployment/cubes
python -m http.server 8000
```
**URL:** http://localhost:8000

### SERVER VERIFICATION COMMANDS:
```bash
# Check if server running
ps aux | grep "python -m http.server" | grep -v grep

# Verify correct version served
curl -s http://localhost:8000 | grep "V1.49"

# Check for errors
curl -s http://localhost:8000 > /dev/null && echo "SUCCESS" || echo "404 ERROR"
```

---

## 📦 BACKUP LOCATIONS (QUINTUPLE REDUNDANCY)

### 1. LOCAL BACKUP:
**File:** `/Users/markvandendool/Novaxe-SEB-Million-Song-Mind/deployment/chordcubes-6-0-V1.49-20250902_193456.tar.gz`
**Size:** 4,431,351 bytes
**Created:** Sep 2 19:34 2025

### 2. EXTERNAL G DRIVE BACKUP:
**File:** `/Volumes/G-DRIVE mobile Pro SSD/chordcubes-6-0-V1.49-20250902_193456.tar.gz`
**Size:** 4,431,351 bytes (verified identical)
**Copied:** Sep 2 19:35 2025

### 3. GITHUB BRANCHES (ALL CONTAIN V1.49):
- **Phoenix-Claude:** `origin/Phoenix-Claude` (main development)
- **Sept2-NightShift:** `origin/Sept2-NightShift` (night development)
- **chordcubes-v149-ultra-backup:** `origin/chordcubes-v149-ultra-backup` (ultra-secure)

### 4. COMMIT VERIFICATION:
```bash
cd /Users/markvandendool/Novaxe-SEB-Million-Song-Mind
git log --oneline -1
# Should show: 4496b187 ChordCubes 6.0 V1.49: MAIN MENU STOP BUTTON
```

### 5. BACKUP RESTORATION:
```bash
# If system lost, restore from local backup:
cd /Users/markvandendool/Novaxe-SEB-Million-Song-Mind/deployment
tar -xzf chordcubes-6-0-V1.49-20250902_193456.tar.gz

# Or restore from G Drive:
tar -xzf "/Volumes/G-DRIVE mobile Pro SSD/chordcubes-6-0-V1.49-20250902_193456.tar.gz"
```

---

## 🔧 VERSION IDENTIFICATION

### HOW TO VERIFY YOU HAVE THE CORRECT VERSION:

1. **Check main.js header:**
```bash
head -5 /Users/markvandendool/Novaxe-SEB-Million-Song-Mind/deployment/chordcubes-5-0-deployment/cubes/main.js
# Should show: // 🎼 CHORDCUBES 6.0 V1.49 - MAIN MENU STOP BUTTON
```

2. **Check index.html title:**
```bash
grep "title" /Users/markvandendool/Novaxe-SEB-Million-Song-Mind/deployment/chordcubes-5-0-deployment/cubes/index.html
# Should show: <title>ChordCubes 6.0 V1.49 MAIN MENU STOP BUTTON</title>
```

3. **Check cache-busting version:**
```bash
grep "main.js?v=" /Users/markvandendool/Novaxe-SEB-Million-Song-Mind/deployment/chordcubes-5-0-deployment/cubes/index.html
# Should show: src="./main.js?v=1049"
```

4. **Verify served content:**
```bash
curl -s http://localhost:8000 | grep "V1.49"
# Should show title with V1.49
```

---

## 🎯 IMPLEMENTED FEATURES IN V1.49

### ✅ COMPLETED TODO ITEMS:
1. **Reset Button:** ✅ Unlock all + stop playback (ALREADY IMPLEMENTED)
2. **Red STOP Button:** ✅ Emergency stop below Play Progression (ALREADY IMPLEMENTED)
3. **Drum STOP:** ✅ Red ⏹ button in drum widget (ALREADY IMPLEMENTED)

### 🔄 REMAINING TODO ITEMS (23 TOTAL):
3. Compound intervals (Shift+number for compound)
4. Drums OFF mute only (not stop playback)
5. Voice leading hard limits
6. Force chord quality (m/n/d keys)
7. 2D staves positioning
8. Back view camera
9. Keyboard shortcuts framework
10. Novaxe integration
11. FontDec13 implementation
12. Free play toggle options
13. Non-chord tones (numpad)
14. Backspace chord removal
15. Front row smooth transitions
16. Cube handling responsiveness
17. Shift for diatonic 7th
18. Option for compound intervals
19. Responsive cube text sizing
20. Add interval 8 (= key)
21. Interval notation display
22. Sus chords (2/4 eliminate 3rd)
23. Melody cutoff in free play

---

## 🚨 CRITICAL RECOVERY COMMANDS

### IF SYSTEM IS COMPLETELY LOST:
```bash
# 1. Navigate to repository
cd /Users/markvandendool/Novaxe-SEB-Million-Song-Mind

# 2. Check current branch
git status

# 3. If not on Phoenix-Claude:
git checkout Phoenix-Claude

# 4. Verify V1.49 is present:
git log --oneline -1
# Should show: 4496b187 ChordCubes 6.0 V1.49: MAIN MENU STOP BUTTON

# 5. If V1.49 missing, restore from backup:
cd deployment
tar -xzf chordcubes-6-0-V1.49-20250902_193456.tar.gz

# 6. Start server:
cd chordcubes-5-0-deployment/cubes
python -m http.server 8000

# 7. Verify in browser: http://localhost:8000
```

### IF BRANCHES ARE CORRUPTED:
```bash
# Restore from ultra-backup:
git checkout chordcubes-v149-ultra-backup
# Or: git checkout Sept2-NightShift
# All contain identical V1.49 system
```

### IF GIT IS CORRUPTED:
```bash
# Nuclear option - restore from tar.gz:
cd /Users/markvandendool/Novaxe-SEB-Million-Song-Mind/deployment
rm -rf chordcubes-5-0-deployment/cubes
tar -xzf chordcubes-6-0-V1.49-20250902_193456.tar.gz
```

---

## 🧪 MANDATORY VERIFICATION PROTOCOL

**BEFORE CLAIMING ANY TASK COMPLETE:**

1. **Check HTML output:**
```bash
curl -s http://localhost:8000 | head -20
```

2. **Verify no 404:**
```bash
curl -s http://localhost:8000 > /dev/null && echo "SUCCESS" || echo "FAILED"
```

3. **Check console for errors:**
```bash
# Open Chrome DevTools -> Console tab
# Look for V1.49 console.log confirmation
# Verify no red errors
```

4. **Verify version incremented:**
```bash
# Every edit must increment version: V1.49 -> V1.50 -> V1.51...
# Update both main.js header AND index.html title AND cache-busting
```

---

## 🎼 PHOENIX TO DO LIST V1.19 STATUS

**WORKING FROM:** Attached "Phoenix To Do List V1.19" document
**CURRENT PROGRESS:** Items 1-2 complete, Item 3+ pending
**NEXT PRIORITY:** Compound intervals (Shift+number combinations)

---

## 💀 FAILURE SCENARIOS & RECOVERY

### SCENARIO 1: "Cannot find V1.49"
**SOLUTION:** Check all 5 backup locations above - use git log to find commit 4496b187

### SCENARIO 2: "Server returns 404"
**SOLUTION:** Verify server directory: `/Users/markvandendool/Novaxe-SEB-Million-Song-Mind/deployment/chordcubes-5-0-deployment/cubes`

### SCENARIO 3: "Wrong version served"
**SOLUTION:** Kill server, restart, check cache-busting v=1049

### SCENARIO 4: "Git branches missing"
**SOLUTION:** Use tar.gz backups - they are 100% identical to git state

### SCENARIO 5: "Files not found"
**SOLUTION:** Absolute paths above are guaranteed correct as of Sep 2 2025

---

## 🔒 FINAL VERIFICATION CHECKLIST

- [ ] V1.49 main.js header present
- [ ] V1.49 index.html title present
- [ ] Cache-busting v=1049 present
- [ ] Server serves V1.49 content
- [ ] No 404 errors
- [ ] Backup files verified (local + G Drive)
- [ ] Git branches contain 4496b187 commit
- [ ] Console shows V1.49 confirmation
- [ ] All STOP buttons functional
- [ ] Ready for Phoenix To Do List continuation

**ChordCubes 6.0 V1.49 is FORENSICALLY SECURED and ETERNALLY PRESERVED**
