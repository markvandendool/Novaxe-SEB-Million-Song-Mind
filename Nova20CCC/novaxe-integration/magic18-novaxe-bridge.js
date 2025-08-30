/**
 * Magic 18 - Novaxe Ecosystem Integration Bridge
 * Connects Magic 18 chord cube system with 127K line Novaxe ecosystem
 * Running at http://localhost:9000/
 */

class Magic18NovaxeBridge {
    constructor() {
        this.novaxeEndpoint = 'http://localhost:9000';
        this.magic18Data = this.initializeMagic18Data();
        this.initializeIntegration();
    }

    initializeMagic18Data() {
        return {
            // Precise coordinate mapping from user's ascending click data
            CHORD_CUBES: {
                // Major Scale Chords (Pages A, C, D, E, G)
                'C': { coords: [1199, 327], roman: 'I', midi: [60, 64, 67], color: '#ff6b6b', page: 'A' },
                'Dm': { coords: [1199, 387], roman: 'ii', midi: [62, 65, 69], color: '#4ecdc4', page: 'A' },
                'Em': { coords: [1199, 447], roman: 'iii', midi: [64, 67, 71], color: '#45b7d1', page: 'A' },
                'F': { coords: [1199, 507], roman: 'IV', midi: [65, 69, 72], color: '#96ceb4', page: 'A' },
                'G': { coords: [1199, 567], roman: 'V', midi: [67, 71, 74], color: '#ffeaa7', page: 'A' },
                'Am': { coords: [1199, 627], roman: 'vi', midi: [69, 72, 76], color: '#dda0dd', page: 'A' },
                'B°': { coords: [1199, 687], roman: 'vii°', midi: [71, 74, 77], color: '#f8b500', page: 'A' },

                // Applied Dominant Chords (Pages C, D, E, G)
                'C7': { coords: [1199, 327], roman: 'I7', midi: [60, 64, 67, 70], color: '#ff6b6b', page: 'C' },
                'D7': { coords: [1199, 387], roman: 'V7/V', midi: [62, 66, 69, 72], color: '#4ecdc4', page: 'C' },
                'E7': { coords: [1199, 447], roman: 'V7/vi', midi: [64, 68, 71, 74], color: '#45b7d1', page: 'C' },
                'A7': { coords: [1199, 567], roman: 'V7/ii', midi: [69, 73, 76, 79], color: '#ffeaa7', page: 'C' },
                'B7': { coords: [1199, 627], roman: 'V7/iii', midi: [71, 75, 78, 81], color: '#dda0dd', page: 'C' },

                // Minor Scale Chords (Pages D, E, G)
                'Cm': { coords: [1199, 327], roman: 'i', midi: [60, 63, 67], color: '#ff6b6b', page: 'D' },
                'Eb': { coords: [1199, 387], roman: '♭III', midi: [63, 67, 70], color: '#4ecdc4', page: 'D' },
                'Fm': { coords: [1199, 447], roman: 'iv', midi: [65, 68, 72], color: '#45b7d1', page: 'D' },
                'Gm': { coords: [1199, 507], roman: 'v', midi: [67, 70, 74], color: '#96ceb4', page: 'D' },
                'Ab': { coords: [1199, 567], roman: '♭VI', midi: [68, 72, 75], color: '#ffeaa7', page: 'D' },
                'Bb': { coords: [1199, 627], roman: '♭VII', midi: [70, 74, 77], color: '#dda0dd', page: 'D' }
            },

            // Animation styles for spectacular chord activation
            ANIMATION_STYLES: {
                'quantum-pulse': {
                    name: 'Quantum Pulse',
                    css: 'quantum-pulse-animation',
                    description: 'Quantum field energy waves'
                },
                'neural-spark': {
                    name: 'Neural Spark',
                    css: 'neural-spark-animation',
                    description: 'Synaptic neural fire cascade'
                },
                'harmonic-resonance': {
                    name: 'Harmonic Resonance',
                    css: 'harmonic-resonance-animation',
                    description: 'Musical frequency visualization'
                },
                'stellar-explosion': {
                    name: 'Stellar Explosion',
                    css: 'stellar-explosion-animation',
                    description: 'Cosmic supernova burst'
                },
                'lightning-cascade': {
                    name: 'Lightning Cascade',
                    css: 'lightning-cascade-animation',
                    description: 'Electrical storm discharge'
                },
                'aurora-flow': {
                    name: 'Aurora Flow',
                    css: 'aurora-flow-animation',
                    description: 'Northern lights shimmer'
                },
                'diamond-crystal': {
                    name: 'Diamond Crystal',
                    css: 'diamond-crystal-animation',
                    description: 'Crystalline light refraction'
                },
                'phoenix-rise': {
                    name: 'Phoenix Rise',
                    css: 'phoenix-rise-animation',
                    description: 'Mythical rebirth flames'
                },
                'ocean-wave': {
                    name: 'Ocean Wave',
                    css: 'ocean-wave-animation',
                    description: 'Fluid tidal surge'
                }
            }
        };
    }

    async initializeIntegration() {
        try {
            // Check Novaxe system status
            const response = await fetch(this.novaxeEndpoint);
            if (response.ok) {
                console.log('🎵 Magic 18 → Novaxe Integration Active');
                this.setupEventListeners();
                this.injectMagic18Component();
            }
        } catch (error) {
            console.error('Novaxe connection failed:', error);
        }
    }

    setupEventListeners() {
        // Listen for chord activations
        document.addEventListener('magic18-chord-activated', (event) => {
            this.handleChordActivation(event.detail);
        });

        // Listen for Novaxe events
        document.addEventListener('novaxe-score-update', (event) => {
            this.handleNovaxeUpdate(event.detail);
        });
    }

    handleChordActivation(chordData) {
        const { chord, coordinates, animation } = chordData;
        const chordInfo = this.magic18Data.CHORD_CUBES[chord];

        if (chordInfo) {
            // Send to Novaxe MIDI system
            this.sendToNovaxeMIDI(chordInfo);

            // Update Novaxe braid system
            this.updateNovaxeBraid(chordInfo);

            // Trigger spectacular animation
            this.activateSpectacularAnimation(coordinates, animation);

            console.log(`🎯 Magic 18 Chord Activated: ${chord} (${chordInfo.roman})`);
        }
    }

    sendToNovaxeMIDI(chordInfo) {
        // Integration with Novaxe MIDI engine
        const midiEvent = {
            type: 'magic18-chord',
            chord: chordInfo,
            timestamp: Date.now(),
            notes: chordInfo.midi,
            roman: chordInfo.roman
        };

        // Send to Novaxe via postMessage or WebSocket
        if (window.parent !== window) {
            window.parent.postMessage({
                type: 'NOVAXE_MIDI_EVENT',
                data: midiEvent
            }, this.novaxeEndpoint);
        }
    }

    updateNovaxeBraid(chordInfo) {
        // Integration with Novaxe braid system
        const braidUpdate = {
            type: 'magic18-braid-update',
            chord: chordInfo,
            position: this.calculateBraidPosition(chordInfo),
            harmonicFunction: chordInfo.roman,
            colorMapping: chordInfo.color
        };

        // Dispatch to Novaxe braid components
        document.dispatchEvent(new CustomEvent('novaxe-braid-update', {
            detail: braidUpdate
        }));
    }

    calculateBraidPosition(chordInfo) {
        // Map Magic 18 coordinates to Novaxe braid positions
        const [x, y] = chordInfo.coords;
        return {
            x: (x / 1400) * 100, // Normalize to percentage
            y: (y / 800) * 100,
            page: chordInfo.page,
            roman: chordInfo.roman
        };
    }

    activateSpectacularAnimation(coordinates, animationStyle) {
        const [x, y] = coordinates;
        const animation = this.magic18Data.ANIMATION_STYLES[animationStyle] ||
            this.magic18Data.ANIMATION_STYLES['quantum-pulse'];

        // Create animation overlay
        const overlay = document.createElement('div');
        overlay.className = `magic18-animation ${animation.css}`;
        overlay.style.position = 'fixed';
        overlay.style.left = `${x}px`;
        overlay.style.top = `${y}px`;
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '10000';

        document.body.appendChild(overlay);

        // Remove after animation
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 3000);
    }

    injectMagic18Component() {
        // Create Magic 18 floating component for Novaxe
        const magic18Widget = document.createElement('div');
        magic18Widget.id = 'magic18-novaxe-widget';
        magic18Widget.innerHTML = `
            <div class="magic18-widget-container">
                <div class="magic18-header">
                    <h3>Magic 18 Chord Cubes</h3>
                    <button class="toggle-btn" onclick="toggleMagic18()">⚡</button>
                </div>
                <div class="magic18-content">
                    <iframe src="/Nova20CCC/magic18/magic18-professional-editor.html" 
                            width="100%" height="600px" frameborder="0">
                    </iframe>
                </div>
            </div>
        `;

        // Add CSS styles
        const styles = document.createElement('style');
        styles.textContent = `
            #magic18-novaxe-widget {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 400px;
                background: rgba(26, 26, 46, 0.95);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                z-index: 9999;
                backdrop-filter: blur(10px);
            }

            .magic18-widget-container {
                padding: 15px;
            }

            .magic18-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
                color: #ffffff;
            }

            .toggle-btn {
                background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
                border: none;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                cursor: pointer;
                font-size: 16px;
            }

            .magic18-content {
                max-height: 600px;
                overflow: hidden;
                border-radius: 8px;
            }
        `;

        document.head.appendChild(styles);
        document.body.appendChild(magic18Widget);

        // Add toggle functionality
        window.toggleMagic18 = () => {
            const content = document.querySelector('.magic18-content');
            content.style.display = content.style.display === 'none' ? 'block' : 'none';
        };
    }

    // Public API for Novaxe integration
    getChordData(chordName) {
        return this.magic18Data.CHORD_CUBES[chordName];
    }

    getAllChords() {
        return Object.keys(this.magic18Data.CHORD_CUBES);
    }

    getAnimationStyles() {
        return this.magic18Data.ANIMATION_STYLES;
    }

    activateChord(chordName, animationStyle = 'quantum-pulse') {
        const chordData = this.getChordData(chordName);
        if (chordData) {
            this.handleChordActivation({
                chord: chordName,
                coordinates: chordData.coords,
                animation: animationStyle
            });
        }
    }
}

// Initialize Magic 18 → Novaxe Integration
const magic18Bridge = new Magic18NovaxeBridge();

// Export for global access
window.Magic18NovaxeBridge = magic18Bridge;

console.log('🚀 Magic 18 → Novaxe Integration Bridge Loaded');
