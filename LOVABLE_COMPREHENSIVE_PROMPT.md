# COMPREHENSIVE LOVABLE RECONNECTION PROMPT: HARMONIC ORACLE PROJECT

## CRITICAL PROJECT STATUS & PATHS

**MAIN PROJECT PATH**: `/Users/markvandendool/harmonic-oracle-current/`
**BACKUP REFERENCE**: `/Users/markvandendool/harmonic-oracle/` (older version)
**ACTIVE DEVELOPMENT APP**: `apps/million-song-mind/`

**IMMEDIATE CRITICAL ISSUE**: The harmonic chart to braid chord mapping is STILL BROKEN after multiple fix attempts. Clicking "I" in the harmonic chart lights up multiple wrong chords (C#º, C7, CFr) instead of just "C".

## TECHNICAL ARCHITECTURE OVERVIEW

### Core Technology Stack
- **Frontend**: React + TypeScript + Vite
- **UI Framework**: Tailwind CSS + shadcn/ui components  
- **State Management**: React useState with Set<string> for selectedChords
- **Font System**: Custom nvxChord + FontDec13 fonts for musical symbols
- **Data Format**: CSV parsing with chord progression analysis
- **Audio**: Web Audio API integration

### Project Structure
```
harmonic-oracle-current/
├── apps/million-song-mind/                    # MAIN APPLICATION
│   ├── src/
│   │   ├── components/
│   │   │   ├── HarmonicChart.tsx             # Harmonic analysis visualization
│   │   │   └── braid/BraidTonal.tsx          # Interactive chord braid
│   │   ├── pages/MillionSongMind.tsx         # Main orchestrator component
│   │   ├── utils/definiteBraidMapping.ts     # 1:1 Roman/note mappings
│   │   └── utils/exhaustiveLogger.ts         # Comprehensive debugging system
│   ├── public/fonts/                         # Custom musical fonts
│   └── package.json                          # React app dependencies
├── package.json                              # Root workspace config
└── dev-server.sh                            # Development environment script
```

## THE CORE MAPPING PROBLEM (UNSOLVED)

### Expected Behavior
- User clicks "I" in harmonic chart → Only "C" bubble lights up in braid
- Perfect 1:1 mapping: I→C, ii→Dm, iii→Em, IV→F, V→G, vi→Am, viiø→Bø

### Current Broken Behavior  
- User clicks "I" in harmonic chart → Multiple chords light up (C, C#º, C7, CFr)
- Mapping logic appears to match any chord containing "C" instead of exact "C"

### Technical Investigation History
1. **Initial Analysis**: Suspected fuzzy matching in `isSelected()` logic
2. **Roman/Note Mismatch Fix**: Fixed displayRoman vs note name inconsistencies  
3. **Set vs Array Bug**: Corrected JavaScript Set.has() vs Array.includes() methods
4. **TypeScript Compatibility**: Fixed all Set<string> vs string[] type issues
5. **Exhaustive Logging**: Implemented comprehensive debugging to trace every interaction

### Current Code State

**definiteBraidMapping.ts** - 1:1 mappings (CORRECT):
```typescript
export const definiteBraidMapping: Record<string, string> = {
  'I': 'C', 'ii': 'Dm', 'iii': 'Em', 'IV': 'F', 
  'V': 'G', 'vi': 'Am', 'viiø': 'Bø'
  // + complete chromatic mappings...
};
```

**MillionSongMind.tsx** - handleChordSelect (SUSPECT):
```typescript
const handleChordSelect = (chordsToToggle: string[], isSelected: boolean) => {
  // Complex logic converting Roman numerals to note names
  // Multiple mapping calls with exhaustive logging
  // Sets selectedChords as Set<string>
};
```

**BraidTonal.tsx** - isSelected (RECENTLY FIXED):
```typescript
const isSelected = (label: string): boolean => {
  return selectedChords?.has(label) || false; // Fixed from includes()
};
```

## DEBUGGING INFRASTRUCTURE IMPLEMENTED

### Exhaustive Logger System
- **File**: `src/utils/exhaustiveLogger.ts`
- **Features**: Mouse coordinates, timestamps, function tracing, state monitoring
- **Global Access**: `window.checkLog()` in browser console
- **Coverage**: Every chord selection, mapping call, state change

### Debug Evidence Gathered
- Mapping logic shows correct I→C conversion
- selectedChords Set contains correct ["C"] value  
- Multiple bubbles still lighting up suggests deeper issue
- Set vs Array method compatibility now resolved

## USER'S ESCALATION & CONSIDERATIONS

**CURRENT FRUSTRATION**: "The mapping STILL isn't fixed" after multiple attempts
**NUCLEAR OPTION CONSIDERATION**: User is considering "completely wiping all mapping and starting from scratch using the letter names in the key of C as obvious template"

This suggests:
1. Current Roman numeral → Note name conversion may be fundamentally flawed
2. A simpler direct letter-based approach (C, D, E, F, G, A, B) might be more reliable
3. The complexity of chromatic mappings may be introducing bugs

## FONT SYSTEM (RECENTLY ADDRESSED)

### Issue Fixed
- Harmonic chart percentage numbers were using `font-mono` instead of original FontDec13
- Updated `HarmonicChart.tsx` to use proper font hierarchy

### Current Font Stack
```css
.chord-symbol { font-family: "FontDec13", monospace !important; }
.braid-chord-text { font-family: "nvxChord", "Monaco", "Menlo", "Consolas", monospace; }
```

## DEVELOPMENT ENVIRONMENT

### Running the Application
```bash
cd /Users/markvandendool/harmonic-oracle-current/apps/million-song-mind
npm run dev
# Serves at http://localhost:8080
```

### Key Files to Focus On
1. **MillionSongMind.tsx** - Main state management and chord selection logic
2. **definiteBraidMapping.ts** - Core Roman/note mappings (may need complete rewrite)
3. **BraidTonal.tsx** - Bubble selection visualization  
4. **HarmonicChart.tsx** - Chart click handling
5. **exhaustiveLogger.ts** - Debugging tools (working correctly)

## SUGGESTED APPROACHES FOR LOVABLE

### Option 1: Debug Current System
- Use exhaustive logging to trace exact execution path
- Identify why multiple bubbles light up despite correct selectedChords
- Check for rendering loops or state propagation issues

### Option 2: Nuclear Mapping Rebuild (USER PREFERENCE)
- Replace Roman numeral system with direct note names (C, D, E, F, G, A, B)
- Implement simple 1:1 letter-based mapping
- Remove complex chromatic conversions that may be introducing bugs
- Use C major as base template as user suggested

### Option 3: Hybrid Approach  
- Keep Roman numerals for display
- Use direct note names internally for all logic
- Eliminate conversion functions that may have bugs

## CRITICAL SUCCESS CRITERIA

1. **Perfect 1:1 Mapping**: Clicking "I" lights up ONLY "C" bubble
2. **No False Positives**: No C#º, C7, CFr, or other "C"-containing chords should activate
3. **Bidirectional Sync**: Braid bubble clicks must properly update harmonic chart selection
4. **Performance**: No lag or rendering issues during interactions

## TESTING PROTOCOL

1. Load app at http://localhost:8080
2. Click "I" in harmonic chart
3. Verify ONLY "C" bubble lights up in braid
4. Run `checkLog()` in browser console for debugging trace
5. Test all other Roman numerals (ii, iii, IV, V, vi, viiø)
6. Test reverse direction (braid → chart)

## REPOSITORY INFORMATION

- **Owner**: markvandendool
- **Repo**: Various versions exist, use harmonic-oracle-current as primary
- **Branch**: main
- **Git Status**: Working directory clean, ready for development

---

**LOVABLE MISSION**: Fix the chord mapping once and for all. The user has been extremely patient through multiple failed attempts. This is the final push to get perfect 1:1 harmonic chart to braid mapping working flawlessly.
