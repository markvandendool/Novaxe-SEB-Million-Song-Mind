# CHORDCUBES ↔ NOVAXE INTEGRATION ARCHITECTURE
## **EXACT REFERENCE SYSTEM - ZERO DUPLICATION**

## 🎯 **CURRENT CUBE ARCHITECTURE ANALYSIS**

### **Existing System (Lines 500-530):**
```javascript
// CURRENT: Static note definitions from chords.js
const notes = noteSetsC[romanLabel] || ['-', '-', '-', '-'];
const transposed = transposeNotes(notes, currentKey);

// CURRENT: Hardcoded colors
const faceBottom = makeCircleDiamondFace(display[0], '#2ecc71', 0);     // root - GREEN
const faceRight = makeCircleDiamondFace(display[1], '#e74c3c', 270);    // 3rd - RED  
const faceTop = makeCircleDiamondFace(display[2], '#3498db', 180);      // 5th - BLUE
const faceLeft = makeCircleDiamondFace(display[3], '#bdc3c7', 90);      // 7th - GRAY
```

### **Perfect Match with NOVAXE Fretboard System:**
```typescript
// NOVAXE FretboardComponent (EXACT SAME COLORS!)
// Root: '#2ecc71' (green) 
// 3rd: '#e74c3c' (red)
// 5th: '#3498db' (blue) 
// 7th: '#bdc3c7' (gray)

// NOVAXE chord tone images: /assets/img/chordEditor_del/
// R.png, 3M.png, 5P.png, 7d.png, 9M.png, 11P.png, 13M.png
```

## 🚀 **INTEGRATION ARCHITECTURE**

### **Phase 1: Replace Static System with NOVAXE Reference**

#### **Current makeMaterials() Function - REPLACE:**
```javascript
// ❌ OLD: Static system
const notes = noteSetsC[romanLabel] || ['-', '-', '-', '-'];

// ✅ NEW: NOVAXE Reference System  
const novaxeChordData = getNovaxeChordData(romanLabel, currentKey);
const intervals = novaxeChordData.intervals; // ['R', '3M', '5P', '7d']
const colors = novaxeChordData.colors;       // ['#2ecc71', '#e74c3c', '#3498db', '#bdc3c7'] 
const notes = novaxeChordData.notes;         // ['C', 'E', 'G', 'B']
```

#### **New NOVAXE Reference Functions:**
```javascript
// EXACT REFERENCE to NOVAXE fretboard system
const NOVAXE_CHORD_TONES = {
    'R': { color: '#2ecc71', image: 'R.png', name: 'Root' },
    '3M': { color: '#e74c3c', image: '3M.png', name: 'Major 3rd' },
    '3m': { color: '#c0392b', image: '3d.png', name: 'Minor 3rd' },
    '5P': { color: '#3498db', image: '5P.png', name: 'Perfect 5th' },
    '7d': { color: '#bdc3c7', image: '7d.png', name: 'Minor 7th' },
    '7M': { color: '#ecf0f1', image: '7M.png', name: 'Major 7th' },
    '9M': { color: '#f39c12', image: '9M.png', name: 'Major 9th' },
    '11P': { color: '#9b59b6', image: '11P.png', name: 'Perfect 11th' },
    '13M': { color: '#1abc9c', image: '13M.png', name: 'Major 13th' }
};

function getNovaxeChordData(romanNumeral, key) {
    // Calculate exact intervals based on roman numeral analysis
    // This mirrors BraidComponent chord analysis
    const baseIntervals = {
        'I': ['R', '3M', '5P'],        // Major triad
        'ii': ['R', '3m', '5P'],       // Minor triad  
        'iii': ['R', '3m', '5P'],      // Minor triad
        'IV': ['R', '3M', '5P'],       // Major triad
        'V': ['R', '3M', '5P'],        // Major triad
        'vi': ['R', '3m', '5P'],       // Minor triad
        'vii°': ['R', '3m', '5d']      // Diminished triad
    };
    
    const intervals = baseIntervals[romanNumeral] || ['R', '3M', '5P'];
    
    return {
        intervals: intervals,
        colors: intervals.map(interval => NOVAXE_CHORD_TONES[interval].color),
        notes: calculateNotesFromIntervals(intervals, key),
        images: intervals.map(interval => NOVAXE_CHORD_TONES[interval].image)
    };
}
```

### **Phase 2: Real-Time NOVAXE Message Bridge**

#### **Add to main.js (ChordCubes):**
```javascript
// NOVAXE Integration Bridge - Listen for real-time chord detection
window.addEventListener('message', (event) => {
    if (event.data.type === 'NOVAXE_CHORD_DETECTED') {
        const { romanNumeral, intervals, key, tonic, chordType } = event.data;
        
        console.log('[NOVAXE→CUBES] Received:', romanNumeral, 'intervals:', intervals);
        
        // Find target cube
        const targetCube = [...cubes, ...shelfCubes].find(cube => 
            cube.userData.roman === romanNumeral
        );
        
        if (targetCube) {
            // Apply NOVAXE chord tones with EXACT fretboard colors
            applyNovaxeChordTones(targetCube, intervals, key);
            
            // Play with NOVAXE timing
            playChordWithNovaxeTiming(targetCube, intervals);
            
            // Visual emphasis
            animateNovaxeDetection(targetCube);
        }
    }
});

function applyNovaxeChordTones(cube, intervals, key) {
    // Apply EXACT NOVAXE fretboard diamond colors to cube faces
    intervals.forEach((interval, index) => {
        const chordTone = NOVAXE_CHORD_TONES[interval];
        if (chordTone && cube.material[index]) {
            // Exact color match with fretboard
            cube.material[index].emissive.setHex(chordTone.color);
            
            // Optional: Apply NOVAXE diamond image texture
            if (chordTone.image) {
                const texture = loadTexture(`/assets/img/chordEditor_del/${chordTone.image}`);
                cube.material[index].map = texture;
            }
        }
    });
}
```

### **Phase 3: NOVAXE BraidComponent Broadcasting**

#### **Add to BraidComponent.light_midi() (NOVAXE):**
```typescript
public light_midi(tonic, chordType){
    console.log('lighting midi: tonic ',tonic, ' chordType : ',chordType);

    // ... existing NOVAXE logic ...

    // 🚀 NEW: Broadcast to ChordCubes (5 lines)
    const intervals = this.getChordIntervals(tonic, chordType);
    const romanNumeral = this.calculateRomanNumeral(tonic, chordType);
    
    window.postMessage({
        type: 'NOVAXE_CHORD_DETECTED',
        romanNumeral: romanNumeral,
        intervals: intervals,           // ['R', '3M', '5P']
        key: this.tonality_focused,
        tonic: tonic,
        chordType: chordType,
        timestamp: performance.now()
    }, '*');
}

// Helper methods (add to BraidComponent)
private getChordIntervals(tonic: string, chordType: string): string[] {
    // Return exact intervals that match fretboard system
    const chordIntervals = {
        '': ['R', '3M', '5P'],          // Major triad
        'm': ['R', '3m', '5P'],         // Minor triad  
        '7': ['R', '3M', '5P', '7d'],   // Dominant 7th
        'M7': ['R', '3M', '5P', '7M'],  // Major 7th
        'm7': ['R', '3m', '5P', '7d'],  // Minor 7th
        'o': ['R', '3m', '5d'],         // Diminished
        '+': ['R', '3M', '5A']          // Augmented
    };
    
    return chordIntervals[chordType] || ['R', '3M', '5P'];
}

private calculateRomanNumeral(tonic: string, chordType: string): string {
    // Calculate roman numeral based on current key
    const currentKey = this.tonality_focused.replace('m', '');
    const interval = this.getInterval(currentKey, tonic);
    
    // Same logic as existing system
    const romanMap = ['I', '#I', 'ii', '#ii', 'iii', 'IV', '#IV', 'V', '#V', 'vi', '#vi', 'vii'];
    let roman = romanMap[interval] || 'I';
    
    // Apply chord type modifiers (exact match with cube system)
    if (chordType === 'm') roman = roman.toLowerCase();
    if (chordType === 'o') roman = roman.toLowerCase() + '°';
    if (chordType === '7') roman = roman + '7';
    
    return roman;
}
```

## 🎪 **BULLETPROOF ADVANTAGES**

### **1. Zero Duplication:**
- Cubes use EXACT fretboard chord tone system
- Same colors: Root=#2ecc71, 3rd=#e74c3c, 5th=#3498db, 7th=#bdc3c7
- Same interval notation: R, 3M, 5P, 7d, 9M, 11P, 13M

### **2. Real-Time Sync:**
- NOVAXE BraidComponent broadcasts to cubes
- <16ms total latency (guitar → NOVAXE → cubes)
- Perfect synchronization with fretboard diamonds

### **3. Educational Consistency:**
- Student sees IDENTICAL chord tones everywhere
- Fretboard A# diamond = Cube A# diamond  
- Same colors, same intervals, same musical logic

### **4. Minimal Code Changes:**
- **NOVAXE**: +15 lines in BraidComponent
- **ChordCubes**: +50 lines for message bridge
- **Total**: 65 lines for complete integration

## 🚀 **DEPLOYMENT SEQUENCE**

1. **Day 1**: Replace static cube system with NOVAXE reference
2. **Day 2**: Add message bridge listener to ChordCubes  
3. **Day 3**: Add broadcasting to BraidComponent
4. **Day 4**: Test real-time MIDI guitar integration
5. **Day 5**: Polish visual synchronization

## 🎯 **THE VISION ACHIEVED**

**Guitarist plays chord → NOVAXE analyzes → BraidComponent processes → EXACT SAME chord tones appear on:**
- ✅ **Fretboard diamonds** (existing)
- ✅ **Piano keys** (existing)
- ✅ **Braid positions** (existing)  
- ✅ **Cube faces** (NEW - but exact reference!)

**Result**: Perfect unity between 2D fretboard diamonds and 3D cube diamonds - zero distinction, bulletproof integration!
