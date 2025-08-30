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

    // Initialize audio system (based on Novaxe MetroComponent)
    async initAudioSystem() {
        try {
            console.log('[TRANSPORT] Initializing audio system...');

            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                console.log('[TRANSPORT] AudioContext created');
            }

            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
                console.log('[TRANSPORT] AudioContext resumed');
            }

            // Load WebAudioFont drum instruments with timeout (enterprise resilience)
            console.log('[TRANSPORT] Loading drum instruments with 5s timeout...');
            try {
                await Promise.race([
                    this.loadDrumInstruments(),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Instrument loading timeout')), 5000)
                    )
                ]);
                console.log('[TRANSPORT] Drum instruments loaded successfully');
            } catch (error) {
                console.warn('[TRANSPORT] Drum loading failed, continuing without drums:', error.message);
                // Continue without drums - basic functionality preserved
            }

            console.log('[TRANSPORT] Audio system initialized successfully');
            return true;
        } catch (error) {
            console.error('[TRANSPORT] Audio system initialization failed:', error);
            console.error('[TRANSPORT] Error details:', error.message);
            console.error('[TRANSPORT] Error stack:', error.stack);
            return false;
        }
    }

    // Load drum instruments using WebAudioFont (enterprise pattern from Novaxe)
    async loadDrumInstruments() {
        console.log('[TRANSPORT] Starting drum instrument loading...');

        const instrumentUrls = {
            kick: 'https://surikov.github.io/webaudiofontdata/sound/12835_17_JCLive_sf2_file.js',
            snare: 'https://surikov.github.io/webaudiofontdata/sound/12840_1_JCLive_sf2_file.js',
            hihat: 'https://surikov.github.io/webaudiofontdata/sound/12875_0_FluidR3_GM_sf2_file.js',
            timpani: 'https://surikov.github.io/webaudiofontdata/sound/12847_0_FluidR3_GM_sf2_file.js',
            cymbal: 'https://surikov.github.io/webaudiofontdata/sound/12849_0_FluidR3_GM_sf2_file.js',
            triangle: 'https://surikov.github.io/webaudiofontdata/sound/12881_0_FluidR3_GM_sf2_file.js',
            shaker: 'https://surikov.github.io/webaudiofontdata/sound/12882_0_FluidR3_GM_sf2_file.js'
        };

        console.log('[TRANSPORT] Instrument URLs prepared:', Object.keys(instrumentUrls));

        // Load instruments dynamically
        const loadPromises = Object.entries(instrumentUrls).map(([name, url]) => {
            console.log(`[TRANSPORT] Loading ${name} from ${url}`);
            return this.loadInstrument(name, url);
        });

        try {
            await Promise.all(loadPromises);
            console.log('[TRANSPORT] All drum instruments loaded successfully');
        } catch (error) {
            console.error('[TRANSPORT] Error loading drum instruments:', error);
            throw error;
        }
    }

    // Load individual instrument (WebAudioFont pattern)
    loadInstrument(name, url) {
        return new Promise((resolve, reject) => {
            console.log(`[TRANSPORT] Creating script element for ${name}`);

            const script = document.createElement('script');
            script.src = url;

            script.onload = () => {
                console.log(`[TRANSPORT] Script loaded for ${name}`);
                const instrumentKey = url.split('/').pop().replace('.js', '');
                console.log(`[TRANSPORT] Looking for window.${instrumentKey}`);

                this.drumInstruments[name] = window[instrumentKey];

                if (this.drumInstruments[name]) {
                    console.log(`[TRANSPORT] ✅ Successfully loaded ${name} instrument`);
                } else {
                    console.warn(`[TRANSPORT] ⚠️ Instrument ${name} loaded but not found in window.${instrumentKey}`);
                }

                resolve();
            };

            script.onerror = (error) => {
                console.error(`[TRANSPORT] ❌ Failed to load ${name} from ${url}:`, error);
                reject(error);
            };

            document.head.appendChild(script);
            console.log(`[TRANSPORT] Script element added to DOM for ${name}`);
        });
    }

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

    // Start transport (enterprise playback system)
    async start() {
        if (!await this.initAudioSystem()) return false;

        this.state = 'playing';
        this.startTime = this.audioContext.currentTime;
        this.clock_ms = 0;

        // Start the timing loop (60fps for smooth updates)
        this.timingLoop = setInterval(() => {
            this.updateTiming();
        }, 16.67); // ~60fps

        console.log('[TRANSPORT] Transport started');
        return true;
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

    // Play individual drum sound
    playDrumSound(instrument, when = 0) {
        if (!this.drumInstruments[instrument] || !this.audioContext) return;

        try {
            // WebAudioFont playback pattern
            const preset = this.drumInstruments[instrument];
            if (preset && window.WebAudioFontPlayer) {
                const player = new window.WebAudioFontPlayer();
                player.queueWaveTable(
                    this.audioContext,
                    this.audioContext.destination,
                    preset,
                    when,
                    60, // MIDI note
                    0.5, // duration
                    0.7  // volume
                );
            }
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
