// transport-bridge.js - COMPLETE REWRITE WITHOUT WEBAUDIOFONT
// NOTE: Tone.js is loaded globally via script tag, not ES module

// CRITICAL: Singleton AudioContext Manager that actually works
class AudioContextManager {
    constructor() {
        this.context = null;
        this.started = false;
        this.startPromise = null;

        // AGGRESSIVE warning suppression
        this.suppressWarnings();
    }

    suppressWarnings() {
        // Store original console methods
        const originalWarn = console.warn;
        const originalLog = console.log;

        // Override console.warn to filter AudioContext warnings
        console.warn = function (...args) {
            const message = args[0]?.toString() || '';
            if (message.includes('AudioContext') ||
                message.includes('not allowed to start') ||
                message.includes('user gesture')) {
                return; // Suppress these warnings
            }
            originalWarn.apply(console, args);
        };

        // Also suppress Tone.js startup logs if needed
        console.log = function (...args) {
            const message = args[0]?.toString() || '';
            if (message.includes('Tone.js v') && message.includes('AudioContext')) {
                return; // Suppress
            }
            originalLog.apply(console, args);
        };
    }

    async getContext() {
        if (!this.context) {
            // Create context only once
            this.context = Tone.getContext();

            // Configure for low latency
            if (this.context.rawContext) {
                // Skip latencyHint - it's read-only in some browsers
                // this.context.latencyHint = 'interactive';
                this.context.lookAhead = 0.01;
            }
        }
        return this.context;
    }

    async start() {
        if (this.started) return Promise.resolve();

        if (!this.startPromise) {
            this.startPromise = (async () => {
                try {
                    await this.getContext();

                    // Only start if not already running
                    if (Tone.context.state !== 'running') {
                        await Tone.start();
                    }

                    this.started = true;
                    console.log('[AUDIO] Context started successfully');
                    return true;
                } catch (error) {
                    console.error('[AUDIO] Failed to start context:', error);
                    return false;
                }
            })();
        }

        return this.startPromise;
    }
}

// Global singleton instance
const audioManager = new AudioContextManager();

class ChordCubesTransport {
    constructor() {
        console.log('[TRANSPORT] Pure Tone.js Transport Bridge initialized');

        this.bpm = 120;
        this.drumsOn = false;
        this.metronomOn = false;
        this.currentStyle = 'rock';
        this.isPlaying = false;

        // Drum synths storage
        this.drumSynths = {};
        this.patterns = {};

        // NO WebAudioFont references!
        this.webAudioFont = null; // Explicitly null
        this.instrumentsLoaded = false;

        // Initialize immediately
        this.initPromise = this.initialize();
    }

    async initialize() {
        console.log('[TRANSPORT] Starting initialization...');

        // Ensure audio context is ready
        await audioManager.start();

        // Create drum synthesizers
        await this.createDrumSynths();

        // Setup patterns
        this.setupPatterns();

        // Configure Tone.Transport
        Tone.Transport.bpm.value = this.bpm;

        console.log('[TRANSPORT] ✅ Initialization complete');
        return true;
    }

    async createDrumSynths() {
        console.log('[TRANSPORT] Creating Tone.js drum synthesizers...');

        // Professional drum kit using Tone.js synthesis
        this.drumSynths = {
            kick: new Tone.MembraneSynth({
                pitchDecay: 0.05,
                octaves: 10,
                oscillator: { type: "triangle" },
                envelope: {
                    attack: 0.001,
                    decay: 0.4,
                    sustain: 0.01,
                    release: 1.4,
                    attackCurve: "exponential"
                }
            }).toDestination(),

            snare: new Tone.NoiseSynth({
                noise: { type: "white" },
                envelope: {
                    attack: 0.001,
                    decay: 0.2,
                    sustain: 0
                }
            }).toDestination(),

            hihat: new Tone.MetalSynth({
                frequency: 250,
                envelope: {
                    attack: 0.001,
                    decay: 0.1,
                    release: 0.01
                },
                harmonicity: 3.1,
                modulationIndex: 16,
                resonance: 4000,
                octaves: 0.5
            }).toDestination(),

            openHihat: new Tone.MetalSynth({
                frequency: 250,
                envelope: {
                    attack: 0.001,
                    decay: 0.3,
                    release: 0.1
                },
                harmonicity: 3.1,
                modulationIndex: 16,
                resonance: 4000,
                octaves: 0.5
            }).toDestination(),

            crash: new Tone.MetalSynth({
                frequency: 300,
                envelope: {
                    attack: 0.001,
                    decay: 1,
                    release: 3
                },
                harmonicity: 5.1,
                modulationIndex: 32,
                resonance: 4000,
                octaves: 1.5
            }).toDestination(),

            ride: new Tone.MetalSynth({
                frequency: 350,
                envelope: {
                    attack: 0.001,
                    decay: 0.5,
                    release: 2
                },
                harmonicity: 3.5,
                modulationIndex: 20,
                resonance: 4000,
                octaves: 1
            }).toDestination()
        };

        // Set volumes
        this.drumSynths.kick.volume.value = -10;
        this.drumSynths.snare.volume.value = -12;
        this.drumSynths.hihat.volume.value = -20;
        this.drumSynths.openHihat.volume.value = -18;
        this.drumSynths.crash.volume.value = -16;
        this.drumSynths.ride.volume.value = -18;

        this.instrumentsLoaded = true;
        console.log('[TRANSPORT] ✅ Drum synths created');
    }

    setupPatterns() {
        // Professional drum patterns for different styles
        this.patterns = {
            rock: {
                kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
                snare: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
                hihat: [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
                crash: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            },
            jazz: {
                kick: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
                snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0],
                ride: [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0],
                hihat: [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0]
            },
            electronic: {
                kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
                snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                hihat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
                openHihat: [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1]
            },
            funk: {
                kick: [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0],
                snare: [0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1],
                hihat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                openHihat: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0]
            },
            latin: {
                kick: [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0],
                snare: [0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0],
                hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
                ride: [0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1]
            },
            hiphop: {
                kick: [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0],
                snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                hihat: [1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0],
                openHihat: [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0]
            }
        };

        console.log('[TRANSPORT] ✅ Drum patterns configured');
    }

    async initAudioSystem() {
        // Ensure everything is initialized
        await this.initPromise;

        // Start audio context if needed
        const success = await audioManager.start();

        console.log('[TRANSPORT] Audio system ready:', success);
        return success;
    }

    setBPM(newBPM) {
        this.bpm = Math.max(40, Math.min(300, newBPM));
        Tone.Transport.bpm.value = this.bpm;
        console.log(`[TRANSPORT] BPM set to ${this.bpm}`);
    }

    setStyle(style) {
        if (this.patterns[style]) {
            this.currentStyle = style;
            console.log(`[TRANSPORT] Style changed to ${style}`);

            // If playing, restart with new pattern
            if (this.isPlaying && this.drumsOn) {
                this.stop();
                this.start();
            }
        }
    }

    async start() {
        console.log('[TRANSPORT] Starting playback...');

        // Ensure audio is initialized
        await this.initAudioSystem();

        // Clear any existing events
        Tone.Transport.cancel();

        // Schedule drum pattern
        if (this.drumsOn) {
            this.scheduleDrumPattern();
        }

        // Schedule metronome
        if (this.metronomOn) {
            this.scheduleMetronome();
        }

        // Start transport
        Tone.Transport.start();
        this.isPlaying = true;

        console.log('[TRANSPORT] ✅ Playback started');
    }

    stop() {
        console.log('[TRANSPORT] Stopping playback...');

        Tone.Transport.stop();
        Tone.Transport.cancel();
        this.isPlaying = false;

        console.log('[TRANSPORT] ✅ Playback stopped');
    }

    scheduleDrumPattern() {
        const pattern = this.patterns[this.currentStyle];
        if (!pattern) return;

        // Schedule each drum hit
        Object.keys(pattern).forEach(drum => {
            const drumPattern = pattern[drum];
            const synth = this.drumSynths[drum];

            if (synth && drumPattern) {
                drumPattern.forEach((hit, index) => {
                    if (hit === 1) {
                        Tone.Transport.scheduleRepeat((time) => {
                            this.playDrumSound(drum, time);
                        }, "1m", `0:0:${index * 0.25}`);
                    }
                });
            }
        });
    }

    scheduleMetronome() {
        // Simple metronome click
        Tone.Transport.scheduleRepeat((time) => {
            const click = new Tone.Synth({
                oscillator: { type: "sine" },
                envelope: {
                    attack: 0.001,
                    decay: 0.1,
                    sustain: 0,
                    release: 0.1
                }
            }).toDestination();

            click.volume.value = -20;
            click.triggerAttackRelease("C5", "32n", time);

            // Clean up
            setTimeout(() => click.dispose(), 200);
        }, "4n");
    }

    playDrumSound(drumType, time) {
        const synth = this.drumSynths[drumType];
        if (!synth) return;

        try {
            if (drumType === 'kick') {
                synth.triggerAttackRelease("C1", "8n", time);
            } else if (drumType === 'snare' || drumType === 'hihat' || drumType === 'openHihat') {
                synth.triggerAttackRelease("16n", time);
            } else if (drumType === 'crash' || drumType === 'ride') {
                synth.triggerAttackRelease("4n", time);
            }
        } catch (error) {
            console.error(`[TRANSPORT] Error playing ${drumType}:`, error);
        }
    }

    toggleDrums() {
        this.drumsOn = !this.drumsOn;
        console.log(`[TRANSPORT] Drums ${this.drumsOn ? 'ON' : 'OFF'}`);

        if (this.isPlaying) {
            this.stop();
            this.start();
        }

        return this.drumsOn;
    }

    toggleMetronome() {
        this.metronomOn = !this.metronomOn;
        console.log(`[TRANSPORT] Metronome ${this.metronomOn ? 'ON' : 'OFF'}`);

        if (this.isPlaying) {
            this.stop();
            this.start();
        }

        return this.metronomOn;
    }

    // Compatibility methods for existing code
    async ensureAudioContext() {
        return audioManager.start();
    }

    async loadInstrument(instrumentKey) {
        // NO-OP - We don't load WebAudioFont instruments anymore
        console.log(`[TRANSPORT] Skipping WebAudioFont load for ${instrumentKey}`);
        return true;
    }
}

// Create and export singleton instance
const chordCubesTransport = new ChordCubesTransport();

// CRITICAL: Expose globally IMMEDIATELY
window.chordCubesTransport = chordCubesTransport;
console.log('[TRANSPORT] ✅ Global transport exposed at window.chordCubesTransport');

export { chordCubesTransport };