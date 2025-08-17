# 🤖 **COPILOT UPDATED INSTRUCTIONS - PRISTINE SOURCE PATHS**

## **CRITICAL UPDATE: SOURCE PATHS CORRECTED**

### **PRISTINE SOURCE LOCATIONS (USE THESE ONLY)**
```yaml
MAC STUDIO SOURCE (CORRECTED):
  /Users/markvandendool/Novaxe-SEB-Million-Song-Mind/novaxe-seb-ng11
  Status: PRISTINE LEGACY ANGULAR 11 SOURCE

MAC PRO SOURCE (CORRECTED):
  /Volumes/vandendool/Novaxe-SEB-Million-Song-Mind/novaxe-seb-ng11
  Status: PRISTINE LEGACY ANGULAR 11 SOURCE

MIGRATION TARGET:
  /Users/markvandendool/Novaxe-SEB-Million-Song-Mind/nuclear-angular
  Status: Angular 20.1.7 harness - PROVEN OPERATIONAL
```

### **PHASE 1 EXECUTION - UPDATED PATHS**

**IMMEDIATE TASK: MusicUtilsService Migration**

**CORRECTED SOURCE PATH:**
```bash
# Mac Studio - COPY from pristine source:
SOURCE: /Users/markvandendool/Novaxe-SEB-Million-Song-Mind/novaxe-seb-ng11/src/app/services/music-utils.service.ts
DESTINATION: /Users/markvandendool/Novaxe-SEB-Million-Song-Mind/nuclear-angular/src/app/services/music-utils.service.ts
VERIFICATION: wc -l = 771 lines exactly
```

**EXECUTION COMMANDS:**
```bash
# 1. Verify pristine source exists
ls -la /Users/markvandendool/Novaxe-SEB-Million-Song-Mind/novaxe-seb-ng11/src/app/services/music-utils.service.ts
wc -l /Users/markvandendool/Novaxe-SEB-Million-Song-Mind/novaxe-seb-ng11/src/app/services/music-utils.service.ts

# 2. COPY complete file (771 lines)
cp /Users/markvandendool/Novaxe-SEB-Million-Song-Mind/novaxe-seb-ng11/src/app/services/music-utils.service.ts /Users/markvandendool/Novaxe-SEB-Million-Song-Mind/nuclear-angular/src/app/services/music-utils.service.ts

# 3. Verify line count
wc -l /Users/markvandendool/Novaxe-SEB-Million-Song-Mind/nuclear-angular/src/app/services/music-utils.service.ts

# 4. Test build
cd /Users/markvandendool/Novaxe-SEB-Million-Song-Mind/nuclear-angular
ng build --configuration production
```

### **SUCCESS METRICS (UNCHANGED)**
- ✅ Build <500 kB (currently 425.73 kB)
- ✅ Build time <5s (currently 3.5s)
- ✅ Existing functionality maintained
- ✅ Enhanced capabilities operational

### **NEXT PHASE COMPONENTS (CORRECTED PATHS)**
```yaml
PHASE 2 - SERVICE LAYER:
  ChordDetectService: /Users/markvandendool/Novaxe-SEB-Million-Song-Mind/novaxe-seb-ng11/src/app/services/chord-detect.service.ts (253 lines)
  TransportService: /Users/markvandendool/Novaxe-SEB-Million-Song-Mind/novaxe-seb-ng11/src/app/services/transport.service.ts (259 lines)
  MidiService: /Users/markvandendool/Novaxe-SEB-Million-Song-Mind/novaxe-seb-ng11/src/app/services/midi.service.ts (382 lines)

PHASE 3 - FLAGSHIP COMPONENT:
  BraidComponent: /Users/markvandendool/Novaxe-SEB-Million-Song-Mind/novaxe-seb-ng11/src/app/components/braid/braid.component.ts (1,195 lines)
```

**PROCEED WITH PHASE 1 USING CORRECTED PRISTINE SOURCE PATHS**
