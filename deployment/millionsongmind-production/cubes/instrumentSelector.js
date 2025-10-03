// 🎼 MASSIVE INSTRUMENT BANK UI SELECTOR - ChordCubes 5.0 Phoenix Ultra
// Professional instrument selection interface with 50+ premium instruments

export class InstrumentSelector {
    constructor() {
        this.isVisible = false;
        this.currentCategory = 'keyboards';
        this.selectedRole = 'chord'; // chord, bass, melody
        this.sampleLibrary = null;
        this.createUI();
        this.bindEvents();
    }

    createUI() {
        // Create main container
        this.container = document.createElement('div');
        this.container.id = 'instrument-selector';
        this.container.className = 'instrument-selector hidden';

        this.container.innerHTML = `
            <div class="instrument-panel">
                <div class="panel-header">
                    <h2>🎼 Massive Instrument Bank</h2>
                    <div class="role-selector">
                        <button class="role-btn active" data-role="chord">Chord</button>
                        <button class="role-btn" data-role="bass">Bass</button>
                        <button class="role-btn" data-role="melody">Melody</button>
                    </div>
                    <button class="close-btn">&times;</button>
                </div>
                
                <div class="panel-body">
                    <div class="categories">
                        <button class="cat-btn active" data-category="keyboards">🎹 Keyboards</button>
                        <button class="cat-btn" data-category="strings">🎻 Strings</button>
                        <button class="cat-btn" data-category="brass">🎺 Brass</button>
                        <button class="cat-btn" data-category="woodwinds">🎷 Woodwinds</button>
                        <button class="cat-btn" data-category="guitars">🎸 Guitars</button>
                        <button class="cat-btn" data-category="bass">🎸 Bass</button>
                        <button class="cat-btn" data-category="percussion">🥁 Percussion</button>
                        <button class="cat-btn" data-category="world">🌍 World</button>
                        <button class="cat-btn" data-category="voices">🎤 Voices</button>
                        <button class="cat-btn" data-category="synth">🎛️ Synth</button>
                    </div>
                    
                    <div class="instruments-grid" id="instruments-grid">
                        <!-- Instruments will be populated here -->
                    </div>
                    
                    <div class="current-setup">
                        <h3>Current Setup</h3>
                        <div class="current-instruments">
                            <div class="current-item">
                                <span class="label">Chord:</span>
                                <span class="value" id="current-chord">Acoustic Grand Piano</span>
                            </div>
                            <div class="current-item">
                                <span class="label">Bass:</span>
                                <span class="value" id="current-bass">Acoustic Bass</span>
                            </div>
                            <div class="current-item">
                                <span class="label">Melody:</span>
                                <span class="value" id="current-melody">Violin</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="quick-presets">
                        <h3>Quick Presets</h3>
                        <div class="presets-grid">
                            <button class="preset-btn" data-preset="classical">🎼 Classical</button>
                            <button class="preset-btn" data-preset="jazz">🎷 Jazz</button>
                            <button class="preset-btn" data-preset="rock">🎸 Rock</button>
                            <button class="preset-btn" data-preset="world">🌍 World</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .instrument-selector {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                transition: opacity 0.3s ease;
            }
            
            .instrument-selector.hidden {
                opacity: 0;
                pointer-events: none;
            }
            
            .instrument-panel {
                background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
                border-radius: 12px;
                width: 80vw;
                max-width: 1000px;
                height: 80vh;
                max-height: 700px;
                overflow: hidden;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
                color: white;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .panel-header {
                background: linear-gradient(135deg, #ff6b35, #f7931e);
                padding: 15px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .panel-header h2 {
                margin: 0;
                font-size: 1.5rem;
                font-weight: 600;
            }
            
            .role-selector {
                display: flex;
                gap: 10px;
            }
            
            .role-btn {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s ease;
                font-weight: 500;
            }
            
            .role-btn:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: translateY(-1px);
            }
            
            .role-btn.active {
                background: rgba(255, 255, 255, 0.4);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            }
            
            .close-btn {
                background: none;
                border: none;
                color: white;
                font-size: 2rem;
                cursor: pointer;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }
            
            .close-btn:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: rotate(90deg);
            }
            
            .panel-body {
                padding: 20px;
                height: calc(100% - 70px);
                overflow-y: auto;
            }
            
            .categories {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 8px;
                margin-bottom: 20px;
            }
            
            .cat-btn {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: white;
                padding: 10px 12px;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 0.9rem;
                text-align: center;
            }
            
            .cat-btn:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            }
            
            .cat-btn.active {
                background: linear-gradient(135deg, #ff6b35, #f7931e);
                border-color: #ff6b35;
                box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
            }
            
            .instruments-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 10px;
                margin-bottom: 30px;
                min-height: 200px;
            }
            
            .instrument-item {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 8px;
                padding: 15px;
                cursor: pointer;
                transition: all 0.2s ease;
                text-align: center;
            }
            
            .instrument-item:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: translateY(-3px);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
            }
            
            .instrument-item.loading {
                opacity: 0.6;
                background: linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
            }
            
            .instrument-name {
                font-weight: 600;
                margin-bottom: 5px;
                text-transform: capitalize;
            }
            
            .instrument-status {
                font-size: 0.8rem;
                opacity: 0.7;
            }
            
            .current-setup, .quick-presets {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 20px;
            }
            
            .current-setup h3, .quick-presets h3 {
                margin: 0 0 10px 0;
                color: #ff6b35;
                font-size: 1.1rem;
            }
            
            .current-instruments {
                display: flex;
                gap: 20px;
                flex-wrap: wrap;
            }
            
            .current-item {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }
            
            .current-item .label {
                font-size: 0.8rem;
                opacity: 0.7;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .current-item .value {
                font-weight: 600;
                color: #f7931e;
            }
            
            .presets-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 10px;
            }
            
            .preset-btn {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: white;
                padding: 12px;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 0.9rem;
            }
            
            .preset-btn:hover {
                background: linear-gradient(135deg, #ff6b35, #f7931e);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(this.container);
    }

    bindEvents() {
        // Close button
        this.container.querySelector('.close-btn').addEventListener('click', () => {
            this.hide();
        });

        // Role selector
        this.container.querySelectorAll('.role-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectRole(e.target.dataset.role);
            });
        });

        // Category selector
        this.container.querySelectorAll('.cat-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectCategory(e.target.dataset.category);
            });
        });

        // Preset selector
        this.container.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.loadPreset(e.target.dataset.preset);
            });
        });

        // Close on backdrop click
        this.container.addEventListener('click', (e) => {
            if (e.target === this.container) {
                this.hide();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (this.isVisible) {
                if (e.key === 'Escape') {
                    this.hide();
                } else if (e.key >= '1' && e.key <= '9') {
                    const index = parseInt(e.key) - 1;
                    const instruments = this.container.querySelectorAll('.instrument-item');
                    if (instruments[index]) {
                        instruments[index].click();
                    }
                }
            }
        });
    }

    show() {
        this.isVisible = true;
        this.container.classList.remove('hidden');

        // Initialize with SampleLibrary if available
        if (window.chordCubesInstruments) {
            this.sampleLibrary = window.chordCubesInstruments.sampleLibrary;
        }

        this.updateInstruments();
        this.updateCurrentSetup();
    }

    hide() {
        this.isVisible = false;
        this.container.classList.add('hidden');
    }

    selectRole(role) {
        this.selectedRole = role;

        // Update active button
        this.container.querySelectorAll('.role-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.role === role);
        });

        console.log(`[InstrumentSelector] Selected role: ${role}`);
    }

    selectCategory(category) {
        this.currentCategory = category;

        // Update active button
        this.container.querySelectorAll('.cat-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });

        this.updateInstruments();
    }

    updateInstruments() {
        const grid = this.container.querySelector('#instruments-grid');

        if (!window.chordCubesInstruments) {
            grid.innerHTML = '<div class="instrument-item">Loading instruments...</div>';
            return;
        }

        try {
            const categories = window.chordCubesInstruments.sampleLibrary.getInstrumentCategories();
            const categoryInstruments = categories[this.currentCategory] || {};

            grid.innerHTML = '';

            Object.keys(categoryInstruments).forEach(instrumentKey => {
                const item = document.createElement('div');
                item.className = 'instrument-item';
                item.dataset.instrument = instrumentKey;

                const isLoaded = this.sampleLibrary && this.sampleLibrary.isInstrumentLoaded(instrumentKey);
                const status = isLoaded ? '✅ Ready' : '⏳ Click to load';

                item.innerHTML = `
                    <div class="instrument-name">${instrumentKey.replace(/_/g, ' ')}</div>
                    <div class="instrument-status">${status}</div>
                `;

                item.addEventListener('click', () => {
                    this.selectInstrument(instrumentKey);
                });

                grid.appendChild(item);
            });

        } catch (error) {
            console.error('[InstrumentSelector] Error updating instruments:', error);
            grid.innerHTML = '<div class="instrument-item">Error loading instruments</div>';
        }
    }

    async selectInstrument(instrumentName) {
        if (!this.sampleLibrary) {
            console.warn('[InstrumentSelector] SampleLibrary not available');
            return;
        }

        const item = this.container.querySelector(`[data-instrument="${instrumentName}"]`);
        if (item) {
            item.classList.add('loading');
            item.querySelector('.instrument-status').textContent = '🔄 Loading...';
        }

        try {
            console.log(`[InstrumentSelector] Loading ${instrumentName} for ${this.selectedRole}...`);

            const success = await this.sampleLibrary.crossfadeToInstrument(this.selectedRole, instrumentName);

            if (success) {
                console.log(`[InstrumentSelector] ✅ Successfully loaded ${instrumentName} for ${this.selectedRole}`);
                this.updateCurrentSetup();

                if (item) {
                    item.querySelector('.instrument-status').textContent = '✅ Active!';
                    setTimeout(() => {
                        item.querySelector('.instrument-status').textContent = '✅ Ready';
                    }, 2000);
                }
            } else {
                console.warn(`[InstrumentSelector] ❌ Failed to load ${instrumentName}`);
                if (item) {
                    item.querySelector('.instrument-status').textContent = '❌ Failed';
                }
            }

        } catch (error) {
            console.error(`[InstrumentSelector] Error loading instrument:`, error);
            if (item) {
                item.querySelector('.instrument-status').textContent = '❌ Error';
            }
        }

        if (item) {
            item.classList.remove('loading');
        }
    }

    updateCurrentSetup() {
        if (!this.sampleLibrary) return;

        try {
            const current = this.sampleLibrary.getCurrentInstruments();

            // Update display (simplified for now - would need more complex tracking)
            const elements = {
                chord: this.container.querySelector('#current-chord'),
                bass: this.container.querySelector('#current-bass'),
                melody: this.container.querySelector('#current-melody')
            };

            // This would need proper tracking - for now just update with placeholder
            console.log('[InstrumentSelector] Current instruments:', current);

        } catch (error) {
            console.error('[InstrumentSelector] Error updating current setup:', error);
        }
    }

    loadPreset(presetName) {
        const presets = {
            classical: {
                chord: 'acoustic_grand_piano',
                bass: 'contrabass',
                melody: 'violin'
            },
            jazz: {
                chord: 'electric_piano_2',
                bass: 'acoustic_bass',
                melody: 'alto_sax'
            },
            rock: {
                chord: 'electric_guitar_clean',
                bass: 'electric_bass_finger',
                melody: 'electric_guitar_clean'
            },
            world: {
                chord: 'sitar',
                bass: 'acoustic_bass',
                melody: 'pan_flute'
            }
        };

        const preset = presets[presetName];
        if (!preset || !this.sampleLibrary) return;

        console.log(`[InstrumentSelector] Loading ${presetName} preset...`);

        // Load each instrument with a delay for smooth crossfades
        Object.entries(preset).forEach(([role, instrument], index) => {
            setTimeout(() => {
                this.sampleLibrary.crossfadeToInstrument(role, instrument);
            }, index * 300);
        });

        setTimeout(() => {
            this.updateCurrentSetup();
        }, 1000);
    }
}

// 🎯 GLOBAL INSTRUMENT SELECTOR - Initialize once
let globalInstrumentSelector = null;

export function getInstrumentSelector() {
    if (!globalInstrumentSelector) {
        globalInstrumentSelector = new InstrumentSelector();
    }
    return globalInstrumentSelector;
}

// 🎵 CONVENIENCE FUNCTION TO OPEN SELECTOR
export function openInstrumentSelector() {
    const selector = getInstrumentSelector();
    selector.show();
}
