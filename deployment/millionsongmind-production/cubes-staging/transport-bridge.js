// Enterprise-level Transport Bridge for Chord Cubes + Novaxe Integration
// Based on Novaxe TransportService architecture with Three.js integration

export class ChordCubesTransport {
    constructor() {
        // Core timing variables (based on Novaxe TransportService)
        this.subBeat = 0;        // 0-3 (16th notes)
        this.beat = 0;           // 0-3 (quarter notes)  
        this.measure = 0;        // 0-infinity (measures)
        this.bpm = 120;          // beats per minute
        this.bpms = 60000 / this.bpm; // milliseconds per beat

        // Musical structure
        this.nb_subbeat_per_beat = 4;    // 16th note resolution
        this.nb_beat_per_measure = 4;    // 4/4 time signature default

        // Transport state
        this.state = 'stopped'; // 'playing' | 'stopped' | 'paused'
        this.clock_ms = 0;

        // Event system for UI updates
        this.beatChangeCallbacks = [];
        this.measureChangeCallbacks = [];
        this.subBeatChangeCallbacks = [];

        // Chord placement system
        this.chordPlacements = new Map(); // Map<measureBeat, chordData>

        // Drum system
        this.drumStyle = 'hip-hop';
        this.drumPatterns = this.initDrumPatterns();
        this.audioContext = null;
        this.drumInstruments = {};

        // Integration with existing progression system
        this.isIntegratedMode = false;

        console.log('[TRANSPORT] Enterprise Transport Bridge initialized');
    }

    // Initialize drum patterns for different styles
    initDrumPatterns() {
        return {
            'hip-hop': {
                kick: [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0], // 16th pattern
                snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0]
            },
            'country': {
                kick: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
                snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                hihat: [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1]
            },
            'techno': {
                kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
                snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                hihat: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1]
            },
            'orchestra': {
                timpani: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                snare: [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
                cymbal: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]
            },
            'quartet': {
                // Subtle percussion for chamber music
                shaker: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
                triangle: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0]
            }
        };
    }

    // Initialize audio system (SIMPLIFIED Tone.js synthesis - no external scripts)
    async initAudioSystem() {
        try {
            console.log('[TRANSPORT] Initializing audio system using Tone.js synthesis...');

            // OFFICIAL: Use Tone.js context
            if (window.Tone) {
                console.log('[TRANSPORT] Using Tone.js AudioContext');
                this.audioContext = window.Tone.context.rawContext;

                // Ensure Tone.js context is started
                if (window.Tone.context.state !== 'running') {
                    await window.Tone.start();
                    console.log('[TRANSPORT] Tone.js context started');
                }
            } else {
                console.error('[TRANSPORT] Tone.js not available');
                return false;
            }

            // Create drum sounds using Tone.js synthesis (no external files needed)
            console.log('[TRANSPORT] Creating drum synthesizers...');
            this.createDrumSynths();

            this.isInitialized = true;
            console.log('[TRANSPORT] ✅ Audio system initialized successfully');
            return true;
        } catch (error) {
            console.error('[TRANSPORT] Audio system initialization failed:', error);
            return false;
        }
    }

    // Create drum sounds using Tone.js synthesis
    createDrumSynths() {
        // Kick drum - low frequency membrane
        this.drumSynths = {
            kick: new window.Tone.MembraneSynth({
                pitchDecay: 0.05,
                octaves: 10,
                oscillator: { type: "triangle" },
                envelope: {
                    attack: 0.001,
                    decay: 0.4,
                    sustain: 0.01,
                    release: 1.4
                }
            }).toDestination(),

            // Snare drum - noise with sharp attack
            snare: new window.Tone.NoiseSynth({
                noise: { type: "white" },
                envelope: {
                    attack: 0.001,
                    decay: 0.2,
                    sustain: 0
                }
            }).toDestination(),

            // Hi-hat - metallic synthesis
            hihat: new window.Tone.MetalSynth({
                frequency: 250,
                envelope: {
                    attack: 0.001,
                    decay: 0.1,
                    release: 0.01
                },
                harmonicity: 3.1,
                modulationIndex: 16,
                octaves: 0.5,
                resonance: 4000
            }).toDestination(),

            // Timpani for orchestral
            timpani: new window.Tone.MembraneSynth({
                pitchDecay: 0.1,
                octaves: 6,
                oscillator: { type: "triangle" },
                envelope: {
                    attack: 0.01,
                    decay: 0.8,
                    sustain: 0.1,
                    release: 2.0
                }
            }).toDestination(),

            // Cymbal - bright metallic
            cymbal: new window.Tone.MetalSynth({
                frequency: 500,
                envelope: {
                    attack: 0.001,
                    decay: 0.5,
                    release: 2.0
                },
                harmonicity: 8,
                modulationIndex: 32,
                octaves: 1.5,
                resonance: 8000
            }).toDestination()
        };

        console.log('[TRANSPORT] ✅ Drum synthesizers created');
    }

    // Using Tone.js synthesis - no external loading needed

    // Set BPM (enterprise pattern from Novaxe)
    setBpm(bpm) {
        this.bpm = Math.max(30, Math.min(240, bpm));
        this.bpms = 60000 / this.bpm;
        console.log(`[TRANSPORT] BPM set to ${this.bpm}`);

        // Notify callbacks
        this.bpmChangeCallbacks?.forEach(cb => cb(this.bpm));
    }

    // Place chord on specific beat (enterprise chord placement system)
    placeChordOnBeat(chordData, measure, beat, subBeat = 0) {
        const key = `${measure}:${beat}:${subBeat}`;
        this.chordPlacements.set(key, {
            ...chordData,
            measure,
            beat,
            subBeat,
            timestamp: Date.now()
        });

        console.log(`[TRANSPORT] Placed ${chordData.roman} on ${key}`);
        return key;
    }

    // Get chord at specific timing
    getChordAtBeat(measure, beat, subBeat = 0) {
        const key = `${measure}:${beat}:${subBeat}`;
        return this.chordPlacements.get(key);
    }

    // Start transport (OFFICIAL Tone.js + WebAudioFont pattern)
    async start() {
        try {
            console.log('[TRANSPORT] Starting transport...');

            // OFFICIAL: Ensure Tone.js is started first (required for AudioContext)
            if (window.Tone && window.Tone.context.state !== 'running') {
                console.log('[TRANSPORT] Starting Tone.js context...');
                await window.Tone.start();
                console.log('[TRANSPORT] Tone.js context started');
            }

            // Initialize audio system after Tone.js is ready
            if (!await this.initAudioSystem()) {
                console.error('[TRANSPORT] Audio system initialization failed');
                return false;
            }

            this.state = 'playing';
            this.startTime = this.audioContext.currentTime;
            this.clock_ms = 0;

            // Start the timing loop (60fps for smooth updates)
            this.timingLoop = setInterval(() => {
                this.updateTiming();
            }, 16.67); // ~60fps

            console.log('[TRANSPORT] ✅ Transport started successfully');
            return true;
        } catch (error) {
            console.error('[TRANSPORT] ❌ Transport start failed:', error);
            return false;
        }
    }

    // Stop transport
    stop() {
        this.state = 'stopped';
        if (this.timingLoop) {
            clearInterval(this.timingLoop);
            this.timingLoop = null;
        }
        this.reset();
        console.log('[TRANSPORT] Transport stopped');
    }

    // Reset to beginning
    reset() {
        this.subBeat = 0;
        this.beat = 0;
        this.measure = 0;
        this.clock_ms = 0;
        console.log('[TRANSPORT] Transport reset');
    }

    // Update timing (enterprise precision timing)
    updateTiming() {
        if (this.state !== 'playing') return;

        const currentTime = this.audioContext.currentTime;
        const elapsed = (currentTime - this.startTime) * 1000; // ms
        this.clock_ms = elapsed;

        // Calculate current position
        const totalSubBeats = Math.floor(elapsed / (this.bpms / 4));
        const newSubBeat = totalSubBeats % this.nb_subbeat_per_beat;
        const totalBeats = Math.floor(totalSubBeats / this.nb_subbeat_per_beat);
        const newBeat = totalBeats % this.nb_beat_per_measure;
        const newMeasure = Math.floor(totalBeats / this.nb_beat_per_measure);

        // Check for changes and trigger events
        if (newSubBeat !== this.subBeat) {
            this.subBeat = newSubBeat;
            this.triggerSubBeatChange();
        }

        if (newBeat !== this.beat) {
            this.beat = newBeat;
            this.triggerBeatChange();
            this.playDrumPattern(); // Play drums on beat
        }

        if (newMeasure !== this.measure) {
            this.measure = newMeasure;
            this.triggerMeasureChange();
        }
    }

    // Play drum pattern based on current style
    playDrumPattern() {
        if (!this.drumInstruments || !this.audioContext) return;

        const pattern = this.drumPatterns[this.drumStyle];
        if (!pattern) return;

        const patternIndex = (this.beat * this.nb_subbeat_per_beat + this.subBeat) % 16;
        const when = this.audioContext.currentTime;

        // Play each drum instrument based on pattern
        Object.entries(pattern).forEach(([instrument, pattern]) => {
            if (pattern[patternIndex] === 1 && this.drumInstruments[instrument]) {
                this.playDrumSound(instrument, when);
            }
        });
    }

    // Play individual drum sound (RELIABLE Tone.js synthesis)
    playDrumSound(instrument, when = 0) {
        if (!this.drumSynths || !this.drumSynths[instrument]) {
            console.log(`[TRANSPORT] Cannot play ${instrument}: synth not available`);
            return;
        }

        try {
            const synth = this.drumSynths[instrument];
            const time = when || this.audioContext.currentTime;

            // Play appropriate note for each drum type
            switch (instrument) {
                case 'kick':
                    synth.triggerAttackRelease("C1", "8n", time);
                    break;
                case 'snare':
                    synth.triggerAttackRelease("4n", time);
                    break;
                case 'hihat':
                    synth.triggerAttackRelease("32n", time, 0.3);
                    break;
                case 'timpani':
                    synth.triggerAttackRelease("C2", "4n", time);
                    break;
                case 'cymbal':
                    synth.triggerAttackRelease("2n", time, 0.5);
                    break;
                default:
                    console.warn(`[TRANSPORT] Unknown instrument: ${instrument}`);
                    return;
            }

            console.log(`[TRANSPORT] ✅ ${instrument} played`);
        } catch (error) {
            console.error(`[TRANSPORT] Error playing ${instrument}:`, error);
        }
    }

    // Event system (enterprise observer pattern)
    onBeatChange(callback) {
        this.beatChangeCallbacks.push(callback);
    }

    onMeasureChange(callback) {
        this.measureChangeCallbacks.push(callback);
    }

    onSubBeatChange(callback) {
        this.subBeatChangeCallbacks.push(callback);
    }

    // Trigger events
    triggerBeatChange() {
        this.beatChangeCallbacks.forEach(cb => {
            try {
                cb({ beat: this.beat, measure: this.measure, subBeat: this.subBeat });
            } catch (error) {
                console.error('[TRANSPORT] Beat change callback error:', error);
            }
        });
    }

    triggerMeasureChange() {
        this.measureChangeCallbacks.forEach(cb => {
            try {
                cb({ measure: this.measure, beat: this.beat });
            } catch (error) {
                console.error('[TRANSPORT] Measure change callback error:', error);
            }
        });
    }

    triggerSubBeatChange() {
        this.subBeatChangeCallbacks.forEach(cb => {
            try {
                cb({ subBeat: this.subBeat, beat: this.beat, measure: this.measure });
            } catch (error) {
                console.error('[TRANSPORT] Sub-beat change callback error:', error);
            }
        });
    }

    // Set drum style (enterprise style system)
    setDrumStyle(style) {
        if (this.drumPatterns[style]) {
            this.drumStyle = style;
            console.log(`[TRANSPORT] Drum style set to ${style}`);
            return true;
        }
        console.warn(`[TRANSPORT] Unknown drum style: ${style}`);
        return false;
    }

    // Get available styles
    getAvailableStyles() {
        return Object.keys(this.drumPatterns);
    }

    // Integration with existing progression system
    syncWithProgression(lineup, progressionBpm) {
        this.setBpm(progressionBpm);

        // Map lineup to beat placements (4 beats per chord default)
        this.chordPlacements.clear();
        lineup.forEach((chord, index) => {
            const measure = Math.floor(index / (this.nb_beat_per_measure / 4)); // 1 chord per beat
            const beat = (index % (this.nb_beat_per_measure / 4)) * 4; // Spread across beats
            this.placeChordOnBeat({
                roman: chord.userData.roman,
                rotationIndex: chord.userData.rotationIndex,
                object: chord
            }, measure, beat);
        });

        console.log(`[TRANSPORT] Synced ${lineup.length} chords to transport`);
    }

    // Enterprise-level progression playback with timing
    async playProgressionWithTiming(lineup, progressionBpm, beatsPerChord) {
        this.syncWithProgression(lineup, progressionBpm);

        if (!await this.start()) {
            console.error('[TRANSPORT] Failed to start transport');
            return false;
        }

        // Calculate total duration
        const totalBeats = lineup.length * beatsPerChord;
        const totalDuration = (totalBeats * this.bpms);

        console.log(`[TRANSPORT] Starting timed progression: ${totalBeats} beats, ${totalDuration}ms`);

        // Schedule chord playback based on transport timing
        lineup.forEach((chord, index) => {
            const chordStartTime = index * beatsPerChord * this.bpms;
            setTimeout(() => {
                if (this.state === 'playing') {
                    console.log(`[TRANSPORT] Playing chord ${chord.userData.roman} at beat ${index * beatsPerChord}`);
                    // Trigger existing chord playback
                    if (window.playChordForObject) {
                        window.playChordForObject(chord);
                    }
                }
            }, chordStartTime);
        });

        // Auto-stop after progression
        setTimeout(() => {
            this.stop();
            console.log('[TRANSPORT] Progression completed');
        }, totalDuration + 500);

        return true;
    }
}

// Enterprise singleton pattern
export const chordCubesTransport = new ChordCubesTransport();
