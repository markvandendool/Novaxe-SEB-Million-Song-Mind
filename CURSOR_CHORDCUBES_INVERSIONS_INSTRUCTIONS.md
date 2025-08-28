# 🤖 **EXPLICIT INSTRUCTIONS FOR CURSOR - CHORDCUBES INVERSIONS**

**CURSOR: The user has verified the correct ChordCubes version. Here are EXACT instructions to locate and deploy it.**

---

## **📍 VERIFIED LOCATION (USER CONFIRMED):**
```
/Users/markvandendool/Novaxe-SEB-Million-Song-Mind/deployment/millionsongmind-production/cubes/
```

## **🔍 VERIFICATION COMMANDS:**
```bash
# Navigate to verified location
cd /Users/markvandendool/Novaxe-SEB-Million-Song-Mind/deployment/millionsongmind-production/cubes/

# Verify main.js line count (MUST be 3370)
wc -l main.js

# Check for working files
ls -la | grep -E "(main.js|chords.js|index.html)"

# Verify it's the right version
grep -i "million song mind" index.html
```

## **✅ EXPECTED RESULTS:**
- **Line count:** `3370 main.js`
- **Files present:** main.js, chords.js, index.html, styles.css, etc.
- **Content:** Should contain "Million Song Mind" references
- **Functionality:** Working chord inversions (user verified)

## **🚫 DO NOT USE THESE LOCATIONS:**
- ❌ `/site-static/cubes/` (3436 lines - wrong version)
- ❌ `/apps/million-song-mind/public/obs-cubes/` (OBS Cubes - not ChordCubes)
- ❌ Any other `/cubes/` directories in the workspace

## **📦 BACKUP CREATED:**
```
ChordCubes-Inversions-VERIFIED-20250827_201700.tar.gz
```

## **🌐 CURRENT STATUS:**
- **Running on:** localhost:8080 (user verified working)
- **User Status:** ✅ CONFIRMED THIS IS THE CORRECT VERSION
- **Name:** ChordCubes Inversions
- **Features:** Working inversions, 3D visualization, audio integration

---

## **🔧 DEPLOYMENT PROTOCOL FOR CURSOR:**

**If you need to deploy this version:**
1. Copy from `/Users/markvandendool/Novaxe-SEB-Million-Song-Mind/deployment/millionsongmind-production/cubes/`
2. Verify `wc -l main.js` returns `3370`
3. Deploy without any modifications
4. Verify live site has working inversions

**CURSOR: This is the definitive source. User has verified it works. Use ONLY this location.**

---

*Instructions created after user verification - August 27, 2025*
