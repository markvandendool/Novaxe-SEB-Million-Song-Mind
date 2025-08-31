# 🚨 URGENT: COMPREHENSIVE CHORDCUBES DEBUGGING SESSION

## CRITICAL ISSUES THAT MUST BE SOLVED TONIGHT

You are debugging a professional music application called ChordCubes. Here are the **CRITICAL ISSUES** that need immediate resolution:

---

## 🎵 **ISSUE #1: AUDIO ENGINE CRISIS (HIGHEST PRIORITY)**

**PROBLEM:** Despite extensive work on instrument switching, the audio **NEVER CHANGES**. All instruments sound identical.

**CURRENT IMPLEMENTATION:**
- Uses Tone.js with PolySynth/MonoSynth
- Different oscillator types (sawtooth, square, triangle, sine)
- Different envelopes and filters
- Connected to audio buses (chordBus, bassBus, melodyBus)

**WHAT'S NOT WORKING:**
- Changing from "Violin" to "Flute" to "Trumpet" = NO DIFFERENCE
- Changing from "String Ensemble" to "Brass" to "Piano" = NO DIFFERENCE  
- All instruments sound like basic synthesizer tones

**INVESTIGATION NEEDED:**
1. Are the instruments actually being replaced when changed?
2. Are the audio buses working correctly?
3. Is there a caching issue preventing new instruments from loading?
4. Should we use WebAudioFont samples instead of Tone.js synthesis?
5. Are there better orchestral libraries (Tonejs-Instruments, etc.)?

**CURRENT CODE LOCATIONS:**
- `main.js` lines ~2577-2753: Instrument switching logic
- `main.js` lines ~2529-2547: makeTonePlayable function
- `main.js` lines ~2488-2557: loadInstruments function

---

## 🥁 **ISSUE #2: DRUM MACHINE PRESETS VANISHED**

**PROBLEM:** Drum machine only has Rock/Hip-hop/Electronic presets. Others are empty.

**INVESTIGATION NEEDED:**
1. Check `professional-drum-machine.js` for missing drum patterns
2. Verify genre switching logic
3. Restore missing Jazz, Latin, Funk, etc. patterns

---

## 🎮 **ISSUE #3: IMPROV MODE SHELF QUEUEING**

**PROBLEM:** In Improv mode (when drums are ON), shelf chord clicks play instantly instead of queueing for downbeats.

**CURRENT LOGIC:**
```javascript
if (improvMode && window.drumMachine && window.drumMachine.isPlaying) {
    queueChordForDownbeat(targetObj, shouldUse7th);
} else {
    playChordForObjectWith7th(targetObj, shouldUse7th);
}
```

**ISSUE:** This only applies to center-play clicks, not shelf clicks. Shelf clicks bypass this check.

**INVESTIGATION NEEDED:**
1. Find shelf click handler in `enqueueShelfAdd` or `animateShelfClickAdd`
2. Add improv mode detection to shelf clicks
3. Ensure shelf chords queue properly for downbeats

---

## 🎨 **ISSUE #4: VEN DIAGRAM TEXT POSITIONING**

**PROBLEM:** Motion and Tension text are in wrong positions on ven diagram circles.

**CURRENT POSITIONS:**
- Motion: 5 o'clock (should be 2 o'clock)
- Tension: 7 o'clock (should be 10 o'clock)

**CURRENT CODE:**
```javascript
// MOTION centered at 2 o'clock on the right circle (60° = π/3 radians)
drawCurvedWord('MOTION', right.x, right.y, right.r - 24, Math.PI / 3, { fill: '#000', spacingDeg: 10 });
// TENSION centered at 10 o'clock on the left circle (120° = 2π/3 radians) 
drawCurvedWord('TENSION', left.x, left.y, left.r - 24, (2 * Math.PI) / 3, { fill: '#000', spacingDeg: 10 });
```

**INVESTIGATION NEEDED:**
1. Verify angle calculations for clock positions
2. Check if circle positioning affects text placement
3. Test different angle values to achieve correct positioning

---

## 🎯 **ISSUE #5: 3D PLAY BUTTONS MISSING**

**NEED TO ADD:** Play buttons in 3D space next to MELODY and BASSLINE text, positioned between the lock icons and the text titles.

**REQUIREMENTS:**
- Light grey color (like lock icons)
- Positioned between locks and text in 3D space
- Should trigger solo melody/bass playback
- Same style and interaction as existing lock icons

---

## 🔤 **ISSUE #6: FONT PREVIEW NOT USING REAL CHORD FACE**

**PROBLEM:** Font preview should use the ACTUAL V(b7)(b9) chord face from the scene as a live reference.

**CURRENT:** Creates a new texture with makeTitleTexture
**NEEDED:** Reference the actual existing V(b7)(b9) chord cube face in the scene so changes apply in real-time to both preview AND the actual chord.

---

## 📋 **DEBUGGING METHODOLOGY**

### **For Audio Engine (Priority #1):**
1. **Console Debugging:** Add extensive logging to instrument switching
2. **Audio Context:** Verify Tone.js audio context state
3. **Bus Testing:** Test if audio buses are actually routing correctly
4. **Instrument Disposal:** Ensure old instruments are properly disposed
5. **Alternative Libraries:** Research WebAudioFont, Tonejs-Instruments, or other solutions

### **For All Issues:**
1. Use Chrome DevTools to inspect audio nodes
2. Add console.log statements at every critical point
3. Test each component in isolation
4. Verify event handlers are actually firing
5. Check for JavaScript errors in console

---

## 🎯 **SUCCESS CRITERIA**

**AUDIO ENGINE FIXED:**
- Violin sounds like a violin (bowed, warm, sustained)
- Flute sounds like a flute (breathy, airy, smooth attack)
- Trumpet sounds like a trumpet (brassy, punchy, bright)
- String Ensemble sounds orchestral and rich
- Bass instruments have proper low-end response

**ALL OTHER ISSUES RESOLVED:**
- Drum presets all working with distinct patterns
- Shelf chords queue properly in Improv mode
- Ven diagram text positioned correctly
- 3D play buttons functional and positioned correctly
- Font preview uses live chord face reference

---

## 🔧 **FILE LOCATIONS**

**Main Files:**
- `main.js` (5000+ lines) - Core application logic
- `professional-drum-machine.js` - Drum machine implementation
- `chords.js` - Chord definitions and mappings
- `index.html` - UI and structure

**Key Functions to Debug:**
- `loadInstruments()` - Audio engine initialization
- `makeTonePlayable()` - Instrument wrapper
- `*InstEl?.addEventListener('change')` - Instrument switching handlers
- `enqueueShelfAdd()` - Shelf click handling
- `drawCurvedWord()` - Ven diagram text positioning
- `makeTitleTexture()` - Font rendering

---

## ⚡ **URGENCY LEVEL: MAXIMUM**

This is a professional music application that needs to work perfectly. The audio engine is the core functionality and must be resolved immediately. All other issues are blocking user experience improvements.

**APPROACH:** Systematic debugging with extensive console logging, testing each component in isolation, and exploring alternative audio libraries if needed.

**GOAL:** A fully functional professional music creation tool with realistic orchestral sounds and perfect user experience.

