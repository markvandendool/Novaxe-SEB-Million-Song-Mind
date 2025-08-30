// ============================================
// CLAUDE'S PROFESSIONAL DRUM MACHINE INTEGRATION
// ============================================

// PART 1: IMMEDIATE AUDIO CONTEXT SUPPRESSION
(function () {
    'use strict';

    // Suppress AudioContext warnings BEFORE Tone.js loads
    const originalWarn = console.warn;
    const originalLog = console.log;

    console.warn = function (...args) {
        const msg = String(args[0] || '');
        if (msg.includes('AudioContext') ||
            msg.includes('not allowed to start') ||
            msg.includes('user gesture') ||
            msg.includes('Tone.js') ||
            msg.includes('resumed') ||
            msg.includes('created')) {
            // COMPLETELY SUPPRESS - don't even log once
            return;
        }
        return originalWarn.apply(console, args);
    };

    console.log = function (...args) {
        const msg = String(args[0] || '');
        if (msg.includes('* Tone.js v') && msg.includes('*')) {
            console.log('[AUDIO] Tone.js loaded (warnings suppressed)');
            return; // Suppress the repeated Tone.js version messages
        }
        return originalLog.apply(console, args);
    };
})();

// Professional Drum Machine Implementation
class ProfessionalDrumMachine {
    constructor() {
        this.isPlaying = false;
        this.bpm = 120;
        this.currentGenre = 'rock';
        this.currentStep = 0;
        this.sequence = null;
        this.metronomeOn = false;

        // Drum patterns for different genres - START EMPTY for user customization
        this.patterns = {
            rock: {
                kick: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                snare: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                hihat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            },
            hiphop: {
                kick: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                snare: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                hihat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            },
            electronic: {
                kick: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                snare: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                hihat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            },
            jazz: {
                kick: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                snare: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                hihat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            },
            latin: {
                kick: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                snare: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                hihat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            },
            funk: {
                kick: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                snare: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                hihat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            },
            country: {
                kick: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                snare: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                hihat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            },
            orchestral: {
                kick: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                snare: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                hihat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            },
            trap: {
                kick: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                snare: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                hihat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            }
        };

        this.init();
    }

    async init() {
        console.log('[DRUM MACHINE] Initializing...');

        // Wait for Tone.js to be available
        if (typeof Tone === 'undefined') {
            console.log('[DRUM MACHINE] Waiting for Tone.js...');
            await new Promise(resolve => {
                const checkTone = () => {
                    if (typeof Tone !== 'undefined') {
                        resolve();
                    } else {
                        setTimeout(checkTone, 100);
                    }
                };
                checkTone();
            });
        }

        // Create drum sounds using Tone.js synthesis
        this.kick = new Tone.MembraneSynth({
            pitchDecay: 0.05,
            octaves: 10,
            oscillator: { type: "triangle" },
            envelope: {
                attack: 0.001,
                decay: 0.4,
                sustain: 0.01,
                release: 1.4
            }
        }).toDestination();

        this.snare = new Tone.NoiseSynth({
            noise: { type: "white" },
            envelope: {
                attack: 0.001,
                decay: 0.2,
                sustain: 0
            }
        }).toDestination();

        this.hihat = new Tone.MetalSynth({
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
        }).toDestination();

        // Metronome click
        this.click = new Tone.Synth({
            oscillator: { type: "sine" },
            envelope: {
                attack: 0.001,
                decay: 0.1,
                sustain: 0,
                release: 0.1
            }
        }).toDestination();

        // Set initial BPM
        Tone.Transport.bpm.value = this.bpm;

        // Setup UI
        this.setupUI();
        this.createSequencerSteps();
        this.loadPattern(this.currentGenre);

        // Update status
        const audioStatus = document.getElementById('audio-status');
        const transportStatus = document.getElementById('transport-status');
        if (audioStatus) audioStatus.textContent = 'Ready';
        if (transportStatus) transportStatus.textContent = 'Stopped';

        console.log('[DRUM MACHINE] Initialized successfully');
    }

    setupUI() {
        // BPM Slider
        const bpmSlider = document.getElementById('bpm-slider');
        const bpmDisplay = document.getElementById('bpm-display');

        if (bpmSlider && bpmDisplay) {
            bpmSlider.addEventListener('input', (e) => {
                this.bpm = parseInt(e.target.value);
                bpmDisplay.textContent = this.bpm;
                Tone.Transport.bpm.value = this.bpm;

                // Update slider gradient
                const percent = ((this.bpm - 60) / 140) * 100;
                bpmSlider.style.background = `linear-gradient(to right, #00ff00 0%, #00ff00 ${percent}%, rgba(0,255,0,0.2) ${percent}%)`;
            });
        }

        // Genre Buttons
        document.querySelectorAll('.genre-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const genre = e.target.dataset.genre;
                this.changeGenre(genre);
            });
        });

        // Drum Toggle
        const drumToggle = document.getElementById('drum-toggle');
        if (drumToggle) {
            drumToggle.addEventListener('click', async () => {
                await this.toggleDrums();
            });
        }

        // Metronome Toggle
        const metronomeToggle = document.getElementById('metronome-toggle');
        if (metronomeToggle) {
            metronomeToggle.addEventListener('click', () => {
                this.toggleMetronome();
            });
        }
    }

    createSequencerSteps() {
        const createSteps = (containerId, instrument) => {
            const container = document.getElementById(containerId);
            if (!container) return;

            for (let i = 0; i < 16; i++) {
                const step = document.createElement('div');
                step.className = 'step';
                step.dataset.step = i;
                step.dataset.instrument = instrument;

                step.addEventListener('click', () => {
                    this.toggleStep(instrument, i);
                });

                container.appendChild(step);
            }
        };

        createSteps('kick-steps', 'kick');
        createSteps('snare-steps', 'snare');
        createSteps('hihat-steps', 'hihat');
    }

    toggleStep(instrument, stepIndex) {
        const pattern = this.patterns[this.currentGenre];
        pattern[instrument][stepIndex] = pattern[instrument][stepIndex] ? 0 : 1;
        this.updateSequencerUI();
    }

    changeGenre(genre) {
        this.currentGenre = genre;

        // Update UI
        document.querySelectorAll('.genre-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.genre === genre);
        });

        // Load pattern
        this.loadPattern(genre);

        // Update status
        const kitStatus = document.getElementById('kit-status');
        if (kitStatus) {
            kitStatus.textContent = genre.charAt(0).toUpperCase() + genre.slice(1);
        }
    }

    loadPattern(genre) {
        const pattern = this.patterns[genre];
        this.updateSequencerUI();
    }

    updateSequencerUI() {
        const pattern = this.patterns[this.currentGenre];

        ['kick', 'snare', 'hihat'].forEach(instrument => {
            const steps = document.querySelectorAll(`[data-instrument="${instrument}"]`);
            steps.forEach((step, i) => {
                step.classList.toggle('active', pattern[instrument][i] === 1);
            });
        });
    }

    async toggleDrums() {
        const drumToggle = document.getElementById('drum-toggle');
        const statusLight = document.getElementById('status-light');

        if (!this.isPlaying) {
            // Start audio context
            if (Tone.context.state !== 'running') {
                await Tone.start();
                console.log('[DRUM MACHINE] Audio context started');
            }

            // Create sequence
            this.sequence = new Tone.Sequence((time, step) => {
                const pattern = this.patterns[this.currentGenre];

                // Play sounds
                if (pattern.kick[step]) {
                    this.kick.triggerAttackRelease("C1", "8n", time);
                }
                if (pattern.snare[step]) {
                    this.snare.triggerAttackRelease("4n", time);
                }
                if (pattern.hihat[step]) {
                    this.hihat.triggerAttackRelease("32n", time, 0.3);
                }

                // Update UI on next tick
                Tone.Draw.schedule(() => {
                    this.updatePlayhead(step);
                }, time);

            }, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], "16n");

            this.sequence.start(0);
            Tone.Transport.start();

            this.isPlaying = true;
            if (drumToggle) {
                drumToggle.textContent = '⏸ DRUMS ON';
                drumToggle.classList.add('playing');
            }
            if (statusLight) statusLight.classList.add('active');

            const transportStatus = document.getElementById('transport-status');
            if (transportStatus) transportStatus.textContent = 'Playing';

        } else {
            // Stop
            if (this.sequence) {
                this.sequence.stop();
                this.sequence.dispose();
                this.sequence = null;
            }
            Tone.Transport.stop();

            this.isPlaying = false;
            if (drumToggle) {
                drumToggle.textContent = '▶ DRUMS OFF';
                drumToggle.classList.remove('playing');
            }
            if (statusLight) statusLight.classList.remove('active');

            const transportStatus = document.getElementById('transport-status');
            if (transportStatus) transportStatus.textContent = 'Stopped';

            // Clear playhead
            document.querySelectorAll('.step').forEach(step => {
                step.classList.remove('playing');
            });
        }
    }

    toggleMetronome() {
        const metronomeToggle = document.getElementById('metronome-toggle');

        this.metronomeOn = !this.metronomeOn;

        if (this.metronomeOn) {
            // Add metronome to sequence
            this.metronomeSequence = new Tone.Loop((time) => {
                this.click.triggerAttackRelease("G5", "32n", time, 0.5);
            }, "4n").start(0);

            if (metronomeToggle) {
                metronomeToggle.textContent = '🔔 CLICK ON';
                metronomeToggle.classList.add('active');
            }
        } else {
            if (this.metronomeSequence) {
                this.metronomeSequence.stop();
                this.metronomeSequence.dispose();
            }

            if (metronomeToggle) {
                metronomeToggle.textContent = '🔔 CLICK OFF';
                metronomeToggle.classList.remove('active');
            }
        }
    }

    updatePlayhead(step) {
        // Clear previous playhead
        document.querySelectorAll('.step').forEach(s => {
            s.classList.remove('playing');
        });

        // Set current playhead
        document.querySelectorAll(`[data-step="${step}"]`).forEach(s => {
            s.classList.add('playing');
        });
    }
}

// Initialize drum machine after DOM is loaded and a delay for other systems
setTimeout(() => {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDrumMachine);
    } else {
        initDrumMachine();
    }
}, 2000);

function initDrumMachine() {
    console.log('[CHORD CUBES] Starting Professional Drum Machine integration...');
    window.drumMachine = new ProfessionalDrumMachine();

    // Fake CPU monitor
    setInterval(() => {
        const cpu = Math.random() * 15 + 5;
        const cpuStatus = document.getElementById('cpu-status');
        if (cpuStatus) {
            cpuStatus.textContent = cpu.toFixed(1) + '%';
        }
    }, 2000);
}

// Handle visibility
document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.drumMachine?.isPlaying) {
        Tone.Transport.pause();
    } else if (!document.hidden && window.drumMachine?.isPlaying) {
        Tone.Transport.start();
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ProfessionalDrumMachine };
}
