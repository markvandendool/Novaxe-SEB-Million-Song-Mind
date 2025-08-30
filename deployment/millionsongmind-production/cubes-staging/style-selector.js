// Enterprise-level Style Selector UI Component
// Based on Angular component patterns with Three.js integration

export class StyleSelector {
    constructor(transport, container = document.body) {
        this.transport = transport;
        this.container = container;
        this.element = null;
        this.isVisible = false;

        this.styles = [
            { id: 'hip-hop', name: 'Hip Hop', description: 'Heavy kick, crisp snare, steady hi-hats' },
            { id: 'country', name: 'Country', description: 'Traditional kick/snare, shuffled hi-hats' },
            { id: 'techno', name: 'Techno', description: '4-on-the-floor kick, electronic percussion' },
            { id: 'orchestra', name: 'Orchestra', description: 'Timpani, orchestral snare, cymbals' },
            { id: 'quartet', name: 'Quartet', description: 'Subtle chamber percussion' }
        ];

        this.createUI();
        console.log('[STYLE-SELECTOR] Enterprise style selector initialized');
    }

    // Create enterprise-level UI (Angular-inspired component structure)
    createUI() {
        // Main container
        this.element = document.createElement('div');
        this.element.className = 'style-selector-container';
        this.element.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid #444;
            border-radius: 12px;
            padding: 16px;
            color: white;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            z-index: 1000;
            min-width: 280px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            display: none;
        `;

        // Header
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            border-bottom: 1px solid #555;
            padding-bottom: 8px;
        `;

        const title = document.createElement('h3');
        title.textContent = 'Musical Styles';
        title.style.cssText = 'margin: 0; color: #fff; font-size: 16px; font-weight: 600;';

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: #ccc;
            font-size: 20px;
            cursor: pointer;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        closeBtn.onclick = () => this.hide();

        header.appendChild(title);
        header.appendChild(closeBtn);

        // Style grid
        const grid = document.createElement('div');
        grid.style.cssText = `
            display: grid;
            gap: 8px;
        `;

        // Create style buttons
        this.styles.forEach(style => {
            const button = this.createStyleButton(style);
            grid.appendChild(button);
        });

        // BPM Control
        const bpmControl = this.createBpmControl();

        // Transport controls
        const transportControls = this.createTransportControls();

        this.element.appendChild(header);
        this.element.appendChild(grid);
        this.element.appendChild(bpmControl);
        this.element.appendChild(transportControls);
        this.container.appendChild(this.element);
    }

    // Create individual style button (enterprise component pattern)
    createStyleButton(style) {
        const button = document.createElement('button');
        button.className = `style-btn style-btn-${style.id}`;
        button.style.cssText = `
            background: linear-gradient(135deg, #333, #555);
            border: 2px solid #666;
            border-radius: 8px;
            color: white;
            padding: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
            text-align: left;
            width: 100%;
        `;

        const isActive = this.transport.drumStyle === style.id;
        if (isActive) {
            button.style.background = 'linear-gradient(135deg, #4a90e2, #357abd)';
            button.style.borderColor = '#4a90e2';
        }

        button.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 4px;">${style.name}</div>
            <div style="font-size: 12px; color: #ccc; line-height: 1.3;">${style.description}</div>
        `;

        button.addEventListener('mouseenter', () => {
            if (!isActive) {
                button.style.background = 'linear-gradient(135deg, #444, #666)';
                button.style.borderColor = '#777';
            }
        });

        button.addEventListener('mouseleave', () => {
            if (!isActive) {
                button.style.background = 'linear-gradient(135deg, #333, #555)';
                button.style.borderColor = '#666';
            }
        });

        button.onclick = () => {
            this.selectStyle(style.id);
            this.updateActiveButton(style.id);
        };

        return button;
    }

    // Create BPM control (enterprise input component)
    createBpmControl() {
        const container = document.createElement('div');
        container.style.cssText = `
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid #555;
        `;

        const label = document.createElement('label');
        label.textContent = 'BPM';
        label.style.cssText = 'display: block; margin-bottom: 8px; font-weight: 600;';

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = '30';
        slider.max = '240';
        slider.value = this.transport.bpm.toString();
        slider.style.cssText = 'width: 100%; margin-bottom: 8px;';

        const display = document.createElement('span');
        display.textContent = `${this.transport.bpm} BPM`;
        display.style.cssText = 'font-size: 14px; color: #ccc;';

        slider.oninput = () => {
            const bpm = parseInt(slider.value);
            this.transport.setBpm(bpm);
            display.textContent = `${bpm} BPM`;
        };

        container.appendChild(label);
        container.appendChild(slider);
        container.appendChild(display);

        return container;
    }

    // Create transport controls
    createTransportControls() {
        const container = document.createElement('div');
        container.style.cssText = `
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid #555;
            display: flex;
            gap: 8px;
        `;

        const playBtn = document.createElement('button');
        playBtn.textContent = '▶ Play';
        playBtn.style.cssText = `
            background: #4a90e2;
            border: none;
            border-radius: 6px;
            color: white;
            padding: 8px 16px;
            cursor: pointer;
            font-weight: 600;
            flex: 1;
        `;
        playBtn.onclick = () => this.transport.start();

        const stopBtn = document.createElement('button');
        stopBtn.textContent = '⏹ Stop';
        stopBtn.style.cssText = `
            background: #e74c3c;
            border: none;
            border-radius: 6px;
            color: white;
            padding: 8px 16px;
            cursor: pointer;
            font-weight: 600;
            flex: 1;
        `;
        stopBtn.onclick = () => this.transport.stop();

        container.appendChild(playBtn);
        container.appendChild(stopBtn);

        return container;
    }

    // Select style and update UI
    selectStyle(styleId) {
        if (this.transport.setDrumStyle(styleId)) {
            console.log(`[STYLE-SELECTOR] Selected style: ${styleId}`);
            // Play preview of the style
            this.playStylePreview(styleId);
        }
    }

    // Update active button styling
    updateActiveButton(activeId) {
        const buttons = this.element.querySelectorAll('.style-btn');
        buttons.forEach(btn => {
            const isActive = btn.classList.contains(`style-btn-${activeId}`);
            if (isActive) {
                btn.style.background = 'linear-gradient(135deg, #4a90e2, #357abd)';
                btn.style.borderColor = '#4a90e2';
            } else {
                btn.style.background = 'linear-gradient(135deg, #333, #555)';
                btn.style.borderColor = '#666';
            }
        });
    }

    // Play style preview
    async playStylePreview(styleId) {
        if (!await this.transport.initAudioSystem()) return;

        const pattern = this.transport.drumPatterns[styleId];
        if (!pattern) return;

        console.log(`[STYLE-SELECTOR] Playing ${styleId} preview`);

        // Play first 4 beats of pattern
        for (let beat = 0; beat < 4; beat++) {
            setTimeout(() => {
                Object.entries(pattern).forEach(([instrument, patternArray]) => {
                    const patternIndex = beat * 4; // First sub-beat of each beat
                    if (patternArray[patternIndex] === 1) {
                        this.transport.playDrumSound(instrument);
                    }
                });
            }, beat * (60000 / this.transport.bpm)); // BPM-based timing
        }
    }

    // Show/hide UI
    show() {
        this.element.style.display = 'block';
        this.isVisible = true;
    }

    hide() {
        this.element.style.display = 'none';
        this.isVisible = false;
    }

    toggle() {
        if (this.isVisible) this.hide();
        else this.show();
    }
}

// Enterprise factory function
export function createStyleSelector(transport, container) {
    return new StyleSelector(transport, container);
}
