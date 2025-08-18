# 🚨 (EXTRACT-NEVER. YOU MUST COPY/USE/PORT/MOVE ONLY FULL COMPLETE FILES, EVERY SINGLE BYTE) AND MIGRATION PROTOCOL
## Correct Sequence of Operations - Unbreakable Rules

**Document Version**: 1.0  
**Effective Date**: January 25, 2025  
**Enforcement Level**: ABSOLUTE - NO EXCEPTIONS  
**Violation Penalty**: IMMEDIATE TERMINATION  

---

## 🎯 **CORRECT EXECUTION SEQUENCE**

### **PHASE 1: COMPLETE (EXTRACT-NEVER. YOU MUST COPY/USE/PORT/MOVE ONLY FULL COMPLETE FILES, EVERY SINGLE BYTE) (M2 MAX ONLY)**

#### **STEP 1.1: GITLAB ACCESS AND VERIFICATION**
```bash
# M2 MAX ONLY - NO MAC PRO INVOLVEMENT
cd "/Users/markvandendool/HarmonicOracle GitHub/novaxe-oracle"
git clone https://gitlab.com/delphineG/novaxe-fakebook.git gitlab-(extract-never. You MUST copy/use/port/move only full complete files, every single byte)
cd gitlab-(extract-never. You MUST copy/use/port/move only full complete files, every single byte)
git checkout prod_fix

# VERIFY BRANCH
git branch
# Expected: * prod_fix
```

#### **STEP 1.2: CRITICAL COMPONENT (EXTRACT-NEVER. YOU MUST COPY/USE/PORT/MOVE ONLY FULL COMPLETE FILES, EVERY SINGLE BYTE)**
```bash
# (EXTRACT-NEVER. YOU MUST COPY/USE/PORT/MOVE ONLY FULL COMPLETE FILES, EVERY SINGLE BYTE) WITH LINE COUNT VERIFICATION
echo "=== (EXTRACT-NEVER. YOU MUST COPY/USE/PORT/MOVE ONLY FULL COMPLETE FILES, EVERY SINGLE BYTE) BRAIDCOMPONENT ==="
wc -l src/app/components/braid/braid.component.ts
# Expected: 1195 lines

echo "=== (EXTRACT-NEVER. YOU MUST COPY/USE/PORT/MOVE ONLY FULL COMPLETE FILES, EVERY SINGLE BYTE) BRAIDCOMPONENT.SCSS ==="
wc -l src/app/components/braid/braid.component.scss
# Expected: 939 lines

echo "=== (EXTRACT-NEVER. YOU MUST COPY/USE/PORT/MOVE ONLY FULL COMPLETE FILES, EVERY SINGLE BYTE) SERVICES ==="
wc -l src/app/services/midi/midi.service.ts
# Expected: 381 lines

wc -l src/app/services/chord-detect/chord-detect.service.ts
# Expected: 252 lines

wc -l src/app/services/transport/transport.service.ts
# Expected: 258 lines

wc -l src/app/services/music-utils-service/music-utils.service.ts
# Expected: 770 lines
```

#### **STEP 1.3: FORENSIC VALIDATION**
```bash
# VERIFY MUSICAL LOGIC EXISTS
echo "=== VERIFYING MUSICAL LOGIC ==="
grep -n "rotate_arrays_for_tona" src/app/components/braid/braid.component.ts
# Expected: Lines 350, 365, 741

grep -n "detectChord" src/app/services/chord-detect/chord-detect.service.ts
# Expected: Function exists

# SHOW FIRST 50 LINES AS PROOF
echo "=== SHOWING FIRST 50 LINES ==="
head -50 src/app/components/braid/braid.component.ts
```

#### **STEP 1.4: (EXTRACT-NEVER. YOU MUST COPY/USE/PORT/MOVE ONLY FULL COMPLETE FILES, EVERY SINGLE BYTE) MANIFEST**
```bash
# CREATE (EXTRACT-NEVER. YOU MUST COPY/USE/PORT/MOVE ONLY FULL COMPLETE FILES, EVERY SINGLE BYTE) MANIFEST
echo "=== (EXTRACT-NEVER. YOU MUST COPY/USE/PORT/MOVE ONLY FULL COMPLETE FILES, EVERY SINGLE BYTE) MANIFEST ==="
echo "GitLab URL: https://gitlab.com/delphineG/novaxe-fakebook/-/commits/prod_fix"
echo "Branch: prod_fix"
echo "SHA: $(git rev-parse HEAD)"
echo "(Extract-never. You MUST copy/use/port/move only full complete files, every single byte) Date: $(date)"
echo ""
echo "Files (Extract-never. You MUST copy/use/port/move only full complete files, every single byte):"
echo "  - BraidComponent.ts: $(wc -l < src/app/components/braid/braid.component.ts) lines"
echo "  - BraidComponent.scss: $(wc -l < src/app/components/braid/braid.component.scss) lines"
echo "  - MidiService.ts: $(wc -l < src/app/services/midi/midi.service.ts) lines"
echo "  - ChordDetectService.ts: $(wc -l < src/app/services/chord-detect/chord-detect.service.ts) lines"
echo "  - TransportService.ts: $(wc -l < src/app/services/transport/transport.service.ts) lines"
echo "  - MusicUtilsService.ts: $(wc -l < src/app/services/music-utils-service/music-utils.service.ts) lines"
echo ""
echo "Total Lines: $(find src/app -name "*.ts" -o -name "*.scss" | xargs wc -l | tail -1)"
```

### **PHASE 2: SEQUENTIAL MIGRATION (MAC PRO BEAST ONLY)**

#### **STEP 2.1: PRE-MIGRATION SETUP**
```bash
# MAC PRO BEAST ONLY - NO M2 MAX INVOLVEMENT
ssh vandendool@Marks-Mac-Pro.local

# SETUP ANGULAR 11 BASELINE
cd ~/novaxe-oracle
npm install
ng version
# Expected: Angular CLI: 11.x.x

# VERIFY BASELINE BUILDS
ng build --prod
# Expected: SUCCESS
```

#### **STEP 2.2: ANGULAR 11→12 MIGRATION (SEQUENTIAL)**
```bash
# MAC PRO BEAST ONLY
echo "=== STARTING ANGULAR 11→12 MIGRATION ==="

# UPDATE PACKAGE.JSON
ng update @angular/core@12 @angular/cli@12

# FIX VIEWCHILD STATIC FLAGS
# Reference: Angular docs section 3.2.1
find src -name "*.ts" -exec sed -i '' 's/@ViewChild(\([^)]*\))/@ViewChild(\1, {static: false})/g' {} \;

# UPDATE RXJS TO 6.6
# Reference: RxJS migration guide
npm install rxjs@6.6

# VERIFY MIGRATION
ng build --prod
npm test
# Expected: ALL TESTS PASS

echo "=== ANGULAR 11→12 MIGRATION COMPLETE ==="
```

#### **STEP 2.3: ANGULAR 12→13 MIGRATION (SEQUENTIAL)**
```bash
# MAC PRO BEAST ONLY - ONLY AFTER 11→12 COMPLETE
echo "=== STARTING ANGULAR 12→13 MIGRATION ==="

# UPDATE PACKAGE.JSON
ng update @angular/core@13 @angular/cli@13

# REMOVE IE11 SUPPORT
# Reference: Angular 13 breaking changes
# Update browserslist in package.json

# UPDATE TO NODE 14+
# Verify Node.js version

# VERIFY MIGRATION
ng build --prod
npm test
# Expected: ALL TESTS PASS

echo "=== ANGULAR 12→13 MIGRATION COMPLETE ==="
```

#### **STEP 2.4: CONTINUE SEQUENTIALLY (13→14→15→16→17→18→19→20)**
```bash
# REPEAT FOR EACH VERSION
# ONLY START NEXT VERSION AFTER PREVIOUS COMPLETE
# EACH VERSION MUST PASS ALL TESTS BEFORE NEXT

for version in 14 15 16 17 18 19 20; do
  echo "=== STARTING ANGULAR $((version-1))→$version MIGRATION ==="
  
  # UPDATE PACKAGE.JSON
  ng update @angular/core@$version @angular/cli@$version
  
  # VERSION-SPECIFIC FIXES
  case $version in
    14) echo "Angular 14 specific fixes" ;;
    15) echo "Angular 15 specific fixes" ;;
    16) echo "Angular 16 specific fixes" ;;
    17) echo "Angular 17 specific fixes" ;;
    18) echo "Angular 18 specific fixes" ;;
    19) echo "Angular 19 specific fixes" ;;
    20) echo "Angular 20 specific fixes" ;;
  esac
  
  # VERIFY MIGRATION
  ng build --prod
  npm test
  # Expected: ALL TESTS PASS
  
  echo "=== ANGULAR $((version-1))→$version MIGRATION COMPLETE ==="
done
```

---

## 🚨 **FORBIDDEN OPERATIONS**

### **NEVER DO THIS:**
```bash
# ❌ NEVER: Parallel migrations
ng update @angular/core@12 & ng update @angular/core@13
# PARALLEL = FORBIDDEN

# ❌ NEVER: Skip (extract-never. You MUST copy/use/port/move only full complete files, every single byte)
# Start migration without (extract-never. You MUST copy/use/port/move only full complete files, every single byte) files first
# (EXTRACT-NEVER. YOU MUST COPY/USE/PORT/MOVE ONLY FULL COMPLETE FILES, EVERY SINGLE BYTE) BEFORE MIGRATION = REQUIRED

# ❌ NEVER: Skip verification
# Start next version without verifying previous
# VERIFICATION BETWEEN VERSIONS = REQUIRED

# ❌ NEVER: Use both machines for same task
# M2 Max and Mac Pro doing same work
# TASK DISTRIBUTION = REQUIRED
```

### **NEVER DO THIS:**
```bash
# ❌ NEVER: Fake work to hit CPU targets
while [ $(top -l 1 | grep 'CPU usage' | awk '{print $3}' | sed 's/%//') -lt 85 ]; do
  npm run build  # USELESS REPETITION
done

# ❌ NEVER: Infinite loops
while true; do
  echo "Working..."  # NEVER ENDS
done

# ❌ NEVER: Skip line count verification
# Assume files are correct without checking
# LINE COUNT VERIFICATION = REQUIRED
```

---

## ✅ **REQUIRED OPERATIONS**

### **ALWAYS DO THIS:**
```bash
# ✅ ALWAYS: (Extract-never. You MUST copy/use/port/move only full complete files, every single byte) first, migrate second
# Phase 1: Complete (extract-never. You MUST copy/use/port/move only full complete files, every single byte) (M2 Max)
# Phase 2: Sequential migration (Mac Pro)

# ✅ ALWAYS: Verify line counts
wc -l src/app/components/braid/braid.component.ts
# Must match expected exactly

# ✅ ALWAYS: Verify musical logic
grep -n "rotate_arrays_for_tona" src/app/components/braid/braid.component.ts
# Must exist

# ✅ ALWAYS: Sequential migrations
# 11→12 (complete) → 12→13 (complete) → 13→14 (complete) → ...

# ✅ ALWAYS: Verify between versions
ng build --prod
npm test
# Must pass before next version

# ✅ ALWAYS: Monitor CPU
# Keep CPU under 85% during real work
# Let CPU rest at 0% when no work
```

---

## 📊 **SUCCESS CRITERIA**

### **(EXTRACT-NEVER. YOU MUST COPY/USE/PORT/MOVE ONLY FULL COMPLETE FILES, EVERY SINGLE BYTE) SUCCESS (M2 MAX)**
- ✅ GitLab prod_fix branch accessed
- ✅ All critical files (extract-never. You MUST copy/use/port/move only full complete files, every single byte)
- ✅ Line counts match exactly:
  - BraidComponent.ts: 1,195 lines
  - BraidComponent.scss: 939 lines
  - MidiService.ts: 381 lines
  - ChordDetectService.ts: 252 lines
  - TransportService.ts: 258 lines
  - MusicUtilsService.ts: 770 lines
- ✅ Musical logic verified (rotate_arrays_for_tona, detectChord)
- ✅ (Extract-never. You MUST copy/use/port/move only full complete files, every single byte) manifest created

### **MIGRATION SUCCESS (MAC PRO BEAST)**
- ✅ Angular 11 baseline established
- ✅ Sequential migrations completed (11→12→13→14→15→16→17→18→19→20)
- ✅ Each version verified before next
- ✅ All tests pass at each version
- ✅ Production builds successful at each version
- ✅ E3,A:X,D3,G4,B4,E5 → V(b7) pipeline working

### **COORDINATION SUCCESS**
- ✅ M2 Max: (Extract-never. You MUST copy/use/port/move only full complete files, every single byte) only
- ✅ Mac Pro: Migration only
- ✅ No work duplication
- ✅ Real-time monitoring
- ✅ CPU usage controlled

---

## 🚨 **EMERGENCY PROTOCOLS**

### **(EXTRACT-NEVER. YOU MUST COPY/USE/PORT/MOVE ONLY FULL COMPLETE FILES, EVERY SINGLE BYTE) FAILURE**
```bash
# IF (EXTRACT-NEVER. YOU MUST COPY/USE/PORT/MOVE ONLY FULL COMPLETE FILES, EVERY SINGLE BYTE) FAILS:
echo "🚨 (EXTRACT-NEVER. YOU MUST COPY/USE/PORT/MOVE ONLY FULL COMPLETE FILES, EVERY SINGLE BYTE) FAILURE - STOPPING"
echo "Cannot migrate without (extract-never. You MUST copy/use/port/move only full complete files, every single byte) files"
echo "Fix (extract-never. You MUST copy/use/port/move only full complete files, every single byte) before proceeding"
exit 1
```

### **MIGRATION FAILURE**
```bash
# IF MIGRATION FAILS:
echo "🚨 MIGRATION FAILURE - ROLLBACK"
git checkout HEAD~1
echo "Rolled back to previous version"
echo "Fix issues before retrying"
```

### **CPU OVERHEATING**
```bash
# IF CPU OVERHEATS:
echo "🚨 CPU OVERHEATING - EMERGENCY SHUTDOWN"
pkill -9 node
pkill -9 npm
pkill -9 ng
echo "All processes killed"
```

---

## 🔧 **IMPLEMENTATION CHECKLIST**

### **BEFORE STARTING:**
- [ ] M2 Max ready for (extract-never. You MUST copy/use/port/move only full complete files, every single byte)
- [ ] Mac Pro Beast ready for migration
- [ ] SSH connection established
- [ ] GitLab access verified
- [ ] Monitoring tools ready
- [ ] Kill switches ready (F5/F6)

### **DURING (EXTRACT-NEVER. YOU MUST COPY/USE/PORT/MOVE ONLY FULL COMPLETE FILES, EVERY SINGLE BYTE):**
- [ ] GitLab prod_fix branch accessed
- [ ] All files (extract-never. You MUST copy/use/port/move only full complete files, every single byte) with line count verification
- [ ] Musical logic verified
- [ ] (Extract-never. You MUST copy/use/port/move only full complete files, every single byte) manifest created
- [ ] CPU usage monitored (target: 0-85%)

### **DURING MIGRATION:**
- [ ] Sequential migrations only
- [ ] Each version verified before next
- [ ] All tests pass at each version
- [ ] Production builds successful
- [ ] CPU usage monitored (target: 0-85%)

### **AFTER COMPLETION:**
- [ ] All 6,426 lines migrated
- [ ] Angular 20 target reached
- [ ] E3,A:X,D3,G4,B4,E5 → V(b7) pipeline working
- [ ] All toggles and switches functional
- [ ] Performance maintained

---

**Document Version**: 1.0  
**Effective Date**: January 25, 2025  
**Enforcement Level**: ABSOLUTE - NO EXCEPTIONS  
**Next Review**: February 25, 2025  

---

*"(Extract-never. You MUST copy/use/port/move only full complete files, every single byte) first, migration second. Sequential only, no parallel. Real work only, no fake work. These rules are absolute."* 