# IMPLEMENTATION ROADMAP: Bulletproof Note Identity
**Step-by-step transition from "thinking" cubes to permanent identity system**

## Phase 1: Permanent Note Assignment (Week 1)

### 1.1 Define Absolute Note Maps
Create permanent note assignments for each chord type:

```javascript
// PERMANENT CUBE DEFINITIONS - Never change
const PERMANENT_CUBE_NOTES = {
  // Major chords - root position voicings
  'I': {
    cubeId: 'I',
    notes: { bottom: 'C4', right: 'E4', top: 'G4', left: 'B4' },
    midi:  { bottom: 60,   right: 64,   top: 67,   left: 71 },
    roman: 'I' // This changes with key, notes don't
  },
  'ii': {
    cubeId: 'ii', 
    notes: { bottom: 'D4', right: 'F4', top: 'A4', left: 'C5' },
    midi:  { bottom: 62,   right: 65,   top: 69,   left: 72 }
  },
  'iii': {
    cubeId: 'iii',
    notes: { bottom: 'E4', right: 'G4', top: 'B4', left: 'D5' },
    midi:  { bottom: 64,   right: 67,   top: 71,   left: 74 }
  },
  'IV': {
    cubeId: 'IV',
    notes: { bottom: 'F3', right: 'A3', top: 'C4', left: 'E4' },
    midi:  { bottom: 53,   right: 57,   top: 60,   left: 64 }
  },
  'V': {
    cubeId: 'V',
    notes: { bottom: 'G3', right: 'B3', top: 'D4', left: 'F4' },
    midi:  { bottom: 55,   right: 59,   top: 62,   left: 65 }
  },
  'vi': {
    cubeId: 'vi',
    notes: { bottom: 'A3', right: 'C4', top: 'E4', left: 'G4' },
    midi:  { bottom: 57,   right: 60,   top: 64,   left: 67 }
  },
  'viiø': {
    cubeId: 'viiø',
    notes: { bottom: 'B3', right: 'D4', top: 'F4', left: 'A4' },
    midi:  { bottom: 59,   right: 62,   top: 65,   left: 69 }
  }
  // Continue for all 29 chord types...
};
```

### 1.2 Create Direct Note Access
Replace all calculation-based note selection:

```javascript
// ❌ REMOVE: Complex calculation system
function getNotesForCube(cube) {
  const r = ((cube.userData.rotationIndex || 0) % 4 + 4) % 4;
  const tones = noteSetsC[cube.userData.roman] || ['C', 'E', 'G', 'B'];
  const names = transposeNotes(tones, currentKey);
  // ... complex rotation/inversion logic
}

// ✅ REPLACE: Direct permanent lookup
function getNotesForCube(cube) {
  const def = PERMANENT_CUBE_NOTES[cube.userData.cubeId];
  return def.notes; // Always the same, no calculations
}

function playDiamondNote(cube, face) {
  const def = PERMANENT_CUBE_NOTES[cube.userData.cubeId];
  const midiNote = def.midi[face]; // Direct lookup
  playMidi(midiNote); // Zero processing delay
}
```

### 1.3 Simplify Click Detection
Remove complex screen-space calculations:

```javascript
// ❌ REMOVE: decideShelfDeltaScreen, complex quadrant math
function decideShelfDeltaScreen(cube, event) {
  // ... 50+ lines of projection calculations
}

// ✅ REPLACE: Simple raycast to face
function getClickedFace(cube, hitPoint) {
  const localPoint = cube.worldToLocal(hitPoint.clone());
  
  // Simple comparison - which face is closest?
  if (localPoint.y < -0.4) return 'bottom';
  if (localPoint.y > 0.4)  return 'top';  
  if (localPoint.x > 0.4)  return 'right';
  if (localPoint.x < -0.4) return 'left';
  return 'bottom'; // default
}
```

## Phase 2: Remove Rotation Intelligence (Week 2)

### 2.1 Eliminate rotationIndex System
```javascript
// ❌ REMOVE ALL ROTATION CALCULATIONS:
// - syncRotationIndexFromQuaternion()
// - cube.userData.rotationIndex tracking  
// - rotation-based note selection
// - inversion "intelligence"

// ✅ REPLACE: Visual-only rotation
function rotateCubeVisually(cube, direction) {
  // Pure cosmetic rotation - notes stay permanent
  const currentZ = cube.rotation.z;
  const targetZ = currentZ + (direction === 'cw' ? -Math.PI/2 : Math.PI/2);
  
  animateRotation(cube, targetZ);
  // Notes remain identical - no recalculation needed
}
```

### 2.2 Lock Down Diamond Positions
```javascript
// Each diamond gets permanent world position relative to cube center
function createDiamondFaces(cube) {
  const def = PERMANENT_CUBE_NOTES[cube.userData.cubeId];
  
  cube.faces = {
    bottom: createDiamond(def.notes.bottom, def.midi.bottom, 'bottom'),
    right:  createDiamond(def.notes.right,  def.midi.right,  'right'),
    top:    createDiamond(def.notes.top,    def.midi.top,    'top'), 
    left:   createDiamond(def.notes.left,   def.midi.left,   'left')
  };
  
  // Diamonds have permanent identity regardless of cube rotation
}
```

## Phase 3: Roman Numeral Overlay System (Week 3)

### 3.1 Decouple Notes from Key Changes
```javascript
function changeKey(newKey) {
  cubes.forEach(cube => {
    // NOTES NEVER CHANGE - only roman numeral labels update
    const permanentNotes = PERMANENT_CUBE_NOTES[cube.userData.cubeId].notes;
    
    // Calculate what roman numeral these permanent notes represent in new key
    const newRoman = calculateRomanNumeral(permanentNotes, newKey);
    
    // Update only the front label
    cube.userData.roman = newRoman;
    updateFrontLabel(cube, newRoman);
    
    // CRITICAL: permanentNotes stay exactly the same
  });
}

function calculateRomanNumeral(noteArray, key) {
  // Analyze the permanent note pattern against the new key signature
  // Return appropriate roman numeral (I, ii, V, etc)
  const rootNote = noteArray.bottom;
  const keyRoot = getKeyRoot(key);
  
  // Simple interval calculation to determine roman numeral
  const interval = getInterval(keyRoot, rootNote);
  return INTERVAL_TO_ROMAN[interval];
}
```

### 3.2 Visual Roman Numeral Updates Only
```javascript
// When key changes, ONLY update the visual labels
function updateCubeLabelsForKey(key) {
  cubes.forEach(cube => {
    const permanentDef = PERMANENT_CUBE_NOTES[cube.userData.cubeId];
    const newRoman = calculateRomanNumeral(permanentDef.notes, key);
    
    // Update front face label texture
    const newLabelTexture = createRomanLabelTexture(newRoman);
    cube.material[FRONT_FACE_INDEX].map = newLabelTexture;
    
    // Update userData for display purposes
    cube.userData.displayRoman = newRoman;
    
    // NOTES STAY PERMANENT - zero change to audio
  });
}
```

## Phase 4: NOVAXE Integration Bridge (Week 4)

### 4.1 Direct Roman Numeral Mapping
```javascript
// NOVAXE → ChordCubes bridge (your brilliant insight!)
function onNovaxeBraidDetection(romanNumeral) {
  // Find cube with this roman numeral in current key
  const targetCube = cubes.find(cube => 
    cube.userData.displayRoman === romanNumeral
  );
  
  if (targetCube) {
    // Light up the cube - permanent notes play
    lightUpCube(targetCube);
    playChordFromCube(targetCube); // Uses permanent MIDI values
  }
}

function lightUpCube(cube) {
  const def = PERMANENT_CUBE_NOTES[cube.userData.cubeId];
  
  // Play all permanent notes simultaneously  
  Object.values(def.midi).forEach(midiNote => {
    playMidi(midiNote, { duration: 2.0, velocity: 0.8 });
  });
  
  // Visual highlight
  cube.material.forEach(mat => {
    mat.emissive.setHex(0x444444);
    setTimeout(() => mat.emissive.setHex(0x000000), 2000);
  });
}
```

### 4.2 Bidirectional Communication
```javascript
// ChordCubes → NOVAXE feedback
function onCubeClick(cube) {
  const def = PERMANENT_CUBE_NOTES[cube.userData.cubeId];
  
  // Send permanent note info to NOVAXE
  window.postMessage({
    type: 'CHORD_CUBES_NOTE',
    cubeId: cube.userData.cubeId,
    romanNumeral: cube.userData.displayRoman,
    permanentNotes: def.notes,
    midiNotes: def.midi
  }, '*');
  
  // Play the permanent note
  playDiamondNote(cube, getClickedFace(cube, lastHitPoint));
}
```

## Benefits Summary

### 🔒 Bulletproof Reliability
- **No calculation failures** - direct table lookups
- **Predictable behavior** - same diamond = same note always
- **Zero identity confusion** - permanent assignments

### ⚡ Performance  
- **Instant response** - no processing delays
- **Minimal CPU** - no complex math during play
- **Scalable** - works with 100+ cubes easily

### 🔧 Maintenance
- **Easy debugging** - simple data structures  
- **Clear architecture** - permanent definitions
- **Future-proof** - no complex interdependencies

### 🎵 Musical Integrity
- **Consistent voicings** - each chord type has optimal note spacing
- **Voice leading** - natural transitions between chord cubes
- **Professional sound** - carefully crafted permanent assignments

This architecture transforms ChordCubes from a complex calculation engine into a **bulletproof musical instrument** with permanent, reliable note identities.
