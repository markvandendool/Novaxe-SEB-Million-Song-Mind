# 🚨 EMERGENCY RECOVERY PROCEDURES 🚨

## IF COPILOT BROKE THE BRAID, DO THIS IMMEDIATELY:

### STEP 1: STOP AND ASSESS
```bash
# Check what was changed:
git status
git diff
```

### STEP 2: INSTANT RECOVERY (NUCLEAR OPTION)
```bash
# This will restore EVERYTHING to the working state:
git reset --hard d3a0bb50

# Verify recovery:
./verify-braid-working.sh
```

### STEP 3: RESTART THE SERVER
```bash
# Kill any running processes:
pkill -f "node.*vite"

# Restart:
cd apps/million-song-mind
npm run dev
```

### STEP 4: VERIFY RECOVERY
Open: http://localhost:8080/braid-demo

You should see:
- 10 vertical chord positions
- Blue/purple bubbles
- Musical notation (B♭, m, 7, etc.)
- Interactive controls

---

## IF ONLY SPECIFIC FILES WERE BROKEN:

### Restore MusicalBubbles.tsx:
```bash
git checkout d3a0bb50 -- apps/million-song-mind/src/components/MusicalBubbles.tsx
```

### Restore BraidTonal.tsx:
```bash
git checkout d3a0bb50 -- apps/million-song-mind/src/components/braid/BraidTonal.tsx
```

### Restore Font System:
```bash
git checkout d3a0bb50 -- apps/million-song-mind/src/utils/chordTypes.ts
git checkout d3a0bb50 -- apps/million-song-mind/src/styles/braid-angular-exact.css
```

### Restore Font Files:
```bash
git checkout d3a0bb50 -- apps/million-song-mind/public/fonts/
```

---

## BACKUP RESTORATION:

If git recovery fails, use the backup:
```bash
# Restore from backup:
cp BACKUP_FONT_IMPLEMENTATION_20250819/BraidTonal.tsx apps/million-song-mind/src/components/braid/
cp BACKUP_FONT_IMPLEMENTATION_20250819/chordTypes.ts apps/million-song-mind/src/utils/
cp BACKUP_FONT_IMPLEMENTATION_20250819/braid-angular-exact.css apps/million-song-mind/src/styles/
cp -r BACKUP_FONT_IMPLEMENTATION_20250819/fonts/* apps/million-song-mind/public/fonts/
```

---

## VERIFICATION CHECKLIST:

After recovery, verify:
- [ ] Server running on port 8080
- [ ] /braid-demo loads without errors
- [ ] Font Jan16.otf exists as REAL_NOVAXE_FONT.otf
- [ ] MusicalBubbles.tsx is ~18KB
- [ ] BraidTonal.tsx is ~27KB
- [ ] chordTypes.ts contains transformations
- [ ] Musical symbols render (B♭, °, +6)

---

## THE WORKING STATE SUMMARY:

**Commit:** d3a0bb50
**Date:** 2025-01-19
**Status:** EVERYTHING WORKING

Components:
- MusicalBubbles.tsx (AUTHENTIC BRAID)
- BraidTonal.tsx (SUPPLEMENTARY)

Fonts:
- Font Jan16.otf → REAL_NOVAXE_FONT.otf

Transformations:
- b→l (flats)
- dim→o (diminished)
- german→+6 (augmented 6th)

---

## PREVENT FUTURE BREAKS:

Before letting ANYONE touch the code:
1. Make them read CRITICAL_SYSTEM_STATE_DO_NOT_BREAK.md
2. Have them run ./verify-braid-working.sh
3. Make them acknowledge the system is working
4. Create a new branch for any experiments
5. Never work directly on main

---

## CONTACT FOR HELP:

If all else fails and you can't recover:
1. The working code is in GitHub at commit d3a0bb50
2. The backup is in BACKUP_FONT_IMPLEMENTATION_20250819/
3. This document has all the recovery procedures

**REMEMBER: THE BRAID WAS WORKING PERFECTLY. WE CAN ALWAYS GET IT BACK.**

