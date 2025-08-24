# 🔧 CURSOR FAILURE FIXES - IMPLEMENTATION GUIDE
## Specific Solutions for Recurring Implementation Issues

**Target**: Fix the audio instrument loading errors and rotation complexity that keeps causing Cursor to fail  
**Priority**: Critical - Enable reliable AI-assisted development  

---

## 🎯 ROOT CAUSE SOLUTIONS

### 1. **AUDIO SYSTEM REWRITE** (Critical Priority)

#### Problem:
```javascript
// CURRENT FAILING PATTERN: Multiple audio contexts, poor error handling
console.error('[obs-cubes] Bass instrument missing; no oscillator fallback.');
console.error('[obs-cubes] Failed to initialize Tone instruments', err);
```

#### Solution: Create `audioEngine.js`
```javascript
// NEW FILE: audioEngine.js
export class UnifiedAudioEngine {
    constructor() {
        this.context = null;
        this.instruments = new Map();
        this.fallbackSynths = new Map();
        this.initialized = false;
        this.initPromise = null;
    }

    async init() {
        if (this.initPromise) return this.initPromise;
        
        this.initPromise = this._initInternal();
        return this.initPromise;
    }

    async _initInternal() {
        try {
            // Step 1: Single audio context
            if (!this.context) {
                this.context = new (window.AudioContext || window.webkitAudioContext)();
            }

            // Step 2: Resume on user gesture
            if (this.context.state === 'suspended') {
                await this.context.resume();
            }

            // Step 3: Initialize Tone.js with our context
            if (window.Tone) {
                window.Tone.setContext(this.context);
                await window.Tone.start();
            }

            // Step 4: Load instruments with fallbacks
            await this._loadInstruments();
            
            this.initialized = true;
            console.log('[AudioEngine] Successfully initialized');
            
        } catch (error) {
            console.warn('[AudioEngine] Init failed, using fallbacks:', error);
            this._createFallbackSynths();
            this.initialized = true;
        }
    }

    async _loadInstruments() {
        const instrumentDefs = [
            { name: 'chord', type: 'acoustic_grand_piano' },
            { name: 'bass', type: 'acoustic_bass' },
            { name: 'melody', type: 'violin' }
        ];

        for (const def of instrumentDefs) {
            try {
                // Try SoundFont first
                const instrument = await this._loadSoundFont(def.type);
                this.instruments.set(def.name, instrument);
            } catch (error) {
                console.warn(`[AudioEngine] SoundFont failed for ${def.name}, creating Tone.js fallback`);
                this._createToneFallback(def.name, def.type);
            }
        }
    }

    _createToneFallback(name, type) {
        if (!window.Tone) return;

        const synthMap = {
            'chord': () => new window.Tone.PolySynth(window.Tone.Synth, {
                oscillator: { type: 'sawtooth' },
                envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 1 }
            }).toDestination(),
            
            'bass': () => new window.Tone.MonoSynth({
                oscillator: { type: 'square' },
                envelope: { attack: 0.02, decay: 0.2, sustain: 0.4, release: 0.8 }
            }).toDestination(),
            
            'melody': () => new window.Tone.Synth({
                oscillator: { type: 'sine' },
                envelope: { attack: 0.01, decay: 0.2, sustain: 0.2, release: 0.6 }
            }).toDestination()
        };

        const createSynth = synthMap[name];
        if (createSynth) {
            this.fallbackSynths.set(name, createSynth());
            console.log(`[AudioEngine] Created Tone.js fallback for ${name}`);
        }
    }

    async playNote(instrumentName, note, duration = 1.0, velocity = 0.8) {
        if (!this.initialized) await this.init();

        const instrument = this.instruments.get(instrumentName);
        const fallback = this.fallbackSynths.get(instrumentName);

        if (instrument && instrument.play) {
            // SoundFont path
            instrument.play(note, this.context.currentTime, { duration, gain: velocity });
        } else if (fallback && window.Tone) {
            // Tone.js fallback path
            const noteName = this._midiToNoteName(note);
            fallback.triggerAttackRelease(noteName, duration);
        } else {
            console.warn(`[AudioEngine] No instrument available for ${instrumentName}`);
        }
    }

    _midiToNoteName(midi) {
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const octave = Math.floor(midi / 12) - 1;
        const note = notes[midi % 12];
        return `${note}${octave}`;
    }

    async _loadSoundFont(instrumentName) {
        // SoundFont loading with timeout
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('SoundFont load timeout')), 5000);
            
            if (window.Soundfont) {
                window.Soundfont.instrument(this.context, instrumentName)
                    .then(instrument => {
                        clearTimeout(timeout);
                        resolve(instrument);
                    })
                    .catch(error => {
                        clearTimeout(timeout);
                        reject(error);
                    });
            } else {
                clearTimeout(timeout);
                reject(new Error('SoundFont library not available'));
            }
        });
    }

    dispose() {
        for (const synth of this.fallbackSynths.values()) {
            if (synth.dispose) synth.dispose();
        }
        this.fallbackSynths.clear();
        this.instruments.clear();
    }
}

// Singleton instance
export const audioEngine = new UnifiedAudioEngine();
```

#### Integration in main.js:
```javascript
// REPLACE existing audio initialization with:
import { audioEngine } from './audioEngine.js';

// Initialize audio early
audioEngine.init().catch(console.warn);

// REPLACE all audio playback with:
function playChordForObject(obj) {
    const notes = getNotesForChord(obj);
    notes.forEach(note => audioEngine.playNote('chord', note, 1.0, 0.18));
}

function playBassTone(note) {
    audioEngine.playNote('bass', note, 1.1, 0.34);
}

function playMelodyTone(note) {
    audioEngine.playNote('melody', note, 1.0, 0.3);
}
```

### 2. **SIMPLIFIED ROTATION SYSTEM** (High Priority)

#### Problem:
```javascript
// CURRENT COMPLEX SYSTEM: 50+ lines of quaternion math
function syncRotationIndexFromQuaternion(obj) {
    const worldDown = new THREE.Vector3(0, -1, 0);
    const baseNormals = [/* complex quaternion calculations */];
    // ... 40+ more lines of spatial math
}
```

#### Solution: Replace with Simple System
```javascript
// NEW SIMPLIFIED APPROACH in main.js:

function initCubeRotation(cube) {
    cube.userData.rotationIndex = 0; // Start with root face down
    cube.userData.targetRotation = 0;
}

function rotateCubeToNext(cube) {
    cube.userData.rotationIndex = (cube.userData.rotationIndex + 1) % 4;
    cube.userData.targetRotation = cube.userData.rotationIndex * (Math.PI / 2);
    
    // Simple Z-axis rotation animation
    const fromRotation = cube.rotation.z;
    const toRotation = cube.userData.targetRotation;
    
    animateRotation(cube, fromRotation, toRotation, 600);
}

function animateRotation(cube, from, to, duration = 600) {
    cancelTweensFor(cube);
    
    return tweenObject({
        duration,
        owner: cube,
        onUpdate: (v) => {
            cube.rotation.z = from + (to - from) * v;
        },
        onComplete: () => {
            cube.rotation.z = to; // Snap to exact value
        }
    });
}

function getCurrentFaceTone(cube) {
    const rotIndex = cube.userData.rotationIndex || 0;
    const tones = noteSetsC[cube.userData.roman] || ['C', 'E', 'G', 'B'];
    return tones[rotIndex];
}

// REMOVE the complex syncRotationIndexFromQuaternion function entirely
```

### 3. **MODULAR ARCHITECTURE** (Medium Priority)

#### Create focused modules to prevent context overflow:

**sceneManager.js:**
```javascript
export class SceneManager {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = null;
        this.renderer = null;
        this.controls = null;
    }
    
    init(canvasId) {
        const canvas = document.getElementById(canvasId);
        this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        // ... focused scene setup
    }
    
    setMelodyView() { /* focused camera logic */ }
    setBassView() { /* focused camera logic */ }
    render() { /* render loop */ }
}
```

**cubeFactory.js:**
```javascript
export class CubeFactory {
    constructor() {
        this.geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
        this.materialCache = new Map();
    }
    
    async createChordCube(roman, letter) {
        const materials = await this.getMaterials(roman, letter);
        const cube = new THREE.Mesh(this.geometry, materials);
        
        cube.userData = {
            roman,
            letter,
            rotationIndex: 0,
            targetRotation: 0
        };
        
        return cube;
    }
    
    async getMaterials(roman, letter) {
        const key = `${roman}_${letter}`;
        if (this.materialCache.has(key)) {
            return this.materialCache.get(key);
        }
        
        const materials = await this.createMaterials(roman, letter);
        this.materialCache.set(key, materials);
        return materials;
    }
}
```

### 4. **ERROR RECOVERY PATTERNS** (High Priority)

#### Add comprehensive try/catch blocks:
```javascript
// PATTERN: Wrap all complex operations
async function safeOperation(operation, fallback, context = '') {
    try {
        return await operation();
    } catch (error) {
        console.warn(`[${context}] Operation failed, using fallback:`, error);
        return fallback ? fallback() : null;
    }
}

// USAGE:
const cube = await safeOperation(
    () => cubeFactory.createChordCube(roman, letter),
    () => createBasicCube(roman),
    'CubeCreation'
);
```

### 5. **STATE MANAGEMENT SIMPLIFICATION** (Medium Priority)

#### Single source of truth:
```javascript
// REPLACE multiple state sources with unified store
import { createStore } from './stateStore.js';

const appState = createStore({
    key: 'C',
    lineup: [],
    currentChord: null,
    audioReady: false,
    viewMode: 'melody', // 'melody' | 'bass'
    lockedMelody: null,
    lockedBass: null
});

// REPLACE scattered state with:
appState.subscribe(state => {
    // React to all state changes
    updateUI(state);
    bridge.emit('stateChange', state);
});
```

---

## 🚀 IMPLEMENTATION PRIORITY

### Phase 1 (Immediate - Fix Cursor Failures):
1. **Create `audioEngine.js`** with unified audio handling
2. **Replace rotation system** with simplified Z-axis rotation
3. **Add comprehensive error recovery** around all audio operations

### Phase 2 (Short-term - Improve Maintainability):
1. **Break main.js** into focused modules (sceneManager, cubeFactory)
2. **Implement state management** with single source of truth
3. **Add comprehensive logging** for debugging

### Phase 3 (Medium-term - World-class Quality):
1. **Mobile optimization** with proper gesture handling
2. **Memory management** with texture disposal
3. **Advanced musical features** (modal interchange, extended chords)

---

## 📋 TESTING CHECKLIST

After implementing fixes, verify:

- [ ] Audio plays reliably on first load
- [ ] Cube rotation works without errors
- [ ] No console errors during normal operation
- [ ] Mobile audio works after user gesture
- [ ] Memory usage remains stable over time
- [ ] AI tools can reliably modify code without context overflow

---

## 🎯 SUCCESS METRICS

**Before Fixes:**
- Cursor success rate: ~30%
- Audio initialization failures: 60%+
- Complex rotation bugs: Frequent

**After Fixes (Target):**
- Cursor success rate: 85%+
- Audio initialization failures: <10%
- Rotation system: Reliable and predictable

This implementation guide provides the specific, actionable solutions needed to resolve the recurring issues that prevent reliable AI-assisted development of the OBS Cubes project.
