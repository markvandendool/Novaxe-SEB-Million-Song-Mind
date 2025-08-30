// Logic Pro X Style Transport - World Class Professional Interface
// Enterprise-level transport with Novaxe timing integration

export class LogicTransport {
    constructor(transportBridge) {
        this.transport = transportBridge;
        this.element = null;
        this.isVisible = true;
        this.currentStyle = 'hip-hop';
        this.isRecording = false;
        this.isPlaying = false;

        // Professional color scheme (Logic Pro X inspired)
        this.colors = {
            background: '#2a2a2a',
            surface: '#3a3a3a',
            accent: '#007aff',
            record: '#ff3b30',
            play: '#34c759',
            text: '#ffffff',
            textSecondary: '#8e8e93',
            border: '#4a4a4a'
        };

        this.createTransport();
        this.setupEventListeners();
        console.log('[LOGIC-TRANSPORT] World-class transport initialized');
    }

    createTransport() {
        // Main transport container (bottom of screen, Logic Pro X style)
        this.element = document.createElement('div');
        this.element.className = 'logic-transport';
        this.element.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 80px;
            background: linear-gradient(180deg, ${this.colors.surface} 0%, ${this.colors.background} 100%);
            border-top: 1px solid ${this.colors.border};
            display: flex;
            align-items: center;
            padding: 0 20px;
            z-index: 2000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(20px);
        `;

        // Transport controls section
        const controls = this.createControls();

        // Timing display section  
        const timing = this.createTimingDisplay();

        // Style selector section
        const styles = this.createStyleSection();

        // BPM section
        const bpm = this.createBpmSection();

        this.element.appendChild(controls);
        this.element.appendChild(timing);
        this.element.appendChild(styles);
        this.element.appendChild(bpm);

        document.body.appendChild(this.element);
    }

    createControls() {
        const section = document.createElement('div');
        section.style.cssText = `
            display: flex;
            align-items: center;
            gap: 12px;
            margin-right: 30px;
        `;

        // Record button (Logic Pro X style)
        this.recordBtn = document.createElement('button');
        this.recordBtn.innerHTML = '●';
        this.recordBtn.style.cssText = `
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 2px solid ${this.colors.record};
            background: ${this.isRecording ? this.colors.record : 'transparent'};
            color: ${this.isRecording ? 'white' : this.colors.record};
            font-size: 16px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        // Play/Pause button (Logic Pro X style)
        this.playBtn = document.createElement('button');
        this.playBtn.innerHTML = this.isPlaying ? '⏸' : '▶';
        this.playBtn.style.cssText = `
            width: 50px;
            height: 50px;
            border-radius: 8px;
            border: none;
            background: ${this.colors.play};
            color: white;
            font-size: 18px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        `;

        // Stop button
        this.stopBtn = document.createElement('button');
        this.stopBtn.innerHTML = '⏹';
        this.stopBtn.style.cssText = `
            width: 40px;
            height: 40px;
            border-radius: 6px;
            border: 1px solid ${this.colors.border};
            background: ${this.colors.surface};
            color: ${this.colors.text};
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        section.appendChild(this.recordBtn);
        section.appendChild(this.playBtn);
        section.appendChild(this.stopBtn);

        return section;
    }

    createTimingDisplay() {
        const section = document.createElement('div');
        section.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-right: 30px;
            min-width: 120px;
        `;

        // Main timing display (Logic Pro X LCD style)
        this.timingDisplay = document.createElement('div');
        this.timingDisplay.style.cssText = `
            background: #1a1a1a;
            border: 1px solid ${this.colors.border};
            border-radius: 4px;
            padding: 8px 16px;
            font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
            font-size: 18px;
            font-weight: 600;
            color: #00ff41;
            text-align: center;
            min-width: 100px;
            letter-spacing: 1px;
        `;
        this.updateTimingDisplay();

        // Beat indicator dots (Logic Pro X style)
        this.beatIndicators = document.createElement('div');
        this.beatIndicators.style.cssText = `
            display: flex;
            gap: 4px;
            margin-top: 4px;
        `;

        for (let i = 0; i < 4; i++) {
            const dot = document.createElement('div');
            dot.style.cssText = `
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: ${i === 0 ? this.colors.accent : this.colors.border};
                transition: all 0.1s ease;
            `;
            this.beatIndicators.appendChild(dot);
        }

        section.appendChild(this.timingDisplay);
        section.appendChild(this.beatIndicators);

        return section;
    }

    createStyleSection() {
        const section = document.createElement('div');
        section.style.cssText = `
            display: flex;
            flex-direction: column;
            margin-right: 30px;
        `;

        const label = document.createElement('div');
        label.textContent = 'STYLE';
        label.style.cssText = `
            font-size: 10px;
            font-weight: 600;
            color: ${this.colors.textSecondary};
            margin-bottom: 4px;
            letter-spacing: 1px;
        `;

        this.styleSelector = document.createElement('select');
        this.styleSelector.style.cssText = `
            background: ${this.colors.surface};
            border: 1px solid ${this.colors.border};
            border-radius: 6px;
            color: ${this.colors.text};
            padding: 8px 12px;
            font-size: 14px;
            cursor: pointer;
            min-width: 120px;
        `;

        const styles = [
            { id: 'hip-hop', name: 'Hip Hop' },
            { id: 'country', name: 'Country' },
            { id: 'techno', name: 'Techno' },
            { id: 'orchestra', name: 'Orchestra' },
            { id: 'quartet', name: 'Quartet' }
        ];

        styles.forEach(style => {
            const option = document.createElement('option');
            option.value = style.id;
            option.textContent = style.name;
            if (style.id === this.currentStyle) option.selected = true;
            this.styleSelector.appendChild(option);
        });

        section.appendChild(label);
        section.appendChild(this.styleSelector);

        return section;
    }

    createBpmSection() {
        const section = document.createElement('div');
        section.style.cssText = `
            display: flex;
            flex-direction: column;
            margin-right: 30px;
        `;

        const label = document.createElement('div');
        label.textContent = 'TEMPO';
        label.style.cssText = `
            font-size: 10px;
            font-weight: 600;
            color: ${this.colors.textSecondary};
            margin-bottom: 4px;
            letter-spacing: 1px;
        `;

        const bpmContainer = document.createElement('div');
        bpmContainer.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
        `;

        // BPM display (Logic Pro X style)
        this.bpmDisplay = document.createElement('div');
        this.bpmDisplay.style.cssText = `
            background: #1a1a1a;
            border: 1px solid ${this.colors.border};
            border-radius: 4px;
            padding: 8px 12px;
            font-family: 'SF Mono', Monaco, monospace;
            font-size: 16px;
            font-weight: 600;
            color: #00ff41;
            min-width: 60px;
            text-align: center;
        `;
        this.updateBpmDisplay();

        // BPM slider
        this.bpmSlider = document.createElement('input');
        this.bpmSlider.type = 'range';
        this.bpmSlider.min = '60';
        this.bpmSlider.max = '180';
        this.bpmSlider.value = this.transport.bpm.toString();
        this.bpmSlider.style.cssText = `
            width: 100px;
            height: 4px;
            background: ${this.colors.border};
            border-radius: 2px;
            outline: none;
            cursor: pointer;
        `;

        bpmContainer.appendChild(this.bpmDisplay);
        bpmContainer.appendChild(this.bpmSlider);

        section.appendChild(label);
        section.appendChild(bpmContainer);

        return section;
    }

    setupEventListeners() {
        // Play/Pause button
        this.playBtn.onclick = async () => {
            if (this.isPlaying) {
                this.transport.stop();
                this.setPlaying(false);
            } else {
                const success = await this.transport.start();
                if (success) {
                    this.setPlaying(true);
                }
            }
        };

        // Stop button
        this.stopBtn.onclick = () => {
            this.transport.stop();
            this.setPlaying(false);
        };

        // Style selector
        this.styleSelector.onchange = () => {
            const newStyle = this.styleSelector.value;
            this.transport.setDrumStyle(newStyle);
            this.currentStyle = newStyle;
            console.log(`[LOGIC-TRANSPORT] Style changed to ${newStyle}`);
        };

        // BPM slider
        this.bpmSlider.oninput = () => {
            const bpm = parseInt(this.bpmSlider.value);
            this.transport.setBpm(bpm);
            this.updateBpmDisplay();
        };

        // Transport event listeners
        this.transport.onBeatChange((data) => {
            this.updateBeatIndicators(data.beat);
            this.updateTimingDisplay();
        });

        this.transport.onMeasureChange((data) => {
            this.updateTimingDisplay();
        });
    }

    setPlaying(playing) {
        this.isPlaying = playing;
        this.playBtn.innerHTML = playing ? '⏸' : '▶';
        this.playBtn.style.background = playing ? '#ff9500' : this.colors.play;
    }

    updateTimingDisplay() {
        const measure = String(this.transport.measure + 1).padStart(3, '0');
        const beat = String(this.transport.beat + 1).padStart(1, '0');
        const subBeat = String(this.transport.subBeat + 1).padStart(1, '0');
        this.timingDisplay.textContent = `${measure}.${beat}.${subBeat}`;
    }

    updateBeatIndicators(currentBeat) {
        const dots = this.beatIndicators.children;
        for (let i = 0; i < dots.length; i++) {
            dots[i].style.background = i === currentBeat ? this.colors.accent : this.colors.border;
        }
    }

    updateBpmDisplay() {
        this.bpmDisplay.textContent = this.transport.bpm.toString();
    }

    // Integration with existing progression system
    async playProgressionWithStyle() {
        if (!window.lineup || window.lineup.length === 0) {
            console.warn('[LOGIC-TRANSPORT] No progression to play');
            return;
        }

        console.log('[LOGIC-TRANSPORT] Starting styled progression...');

        // Sync BPM with existing system
        this.transport.setBpm(window.progressionBpm || 120);
        this.updateBpmDisplay();

        // Start transport
        const success = await this.transport.start();
        if (!success) {
            console.error('[LOGIC-TRANSPORT] Failed to start transport');
            return;
        }

        this.setPlaying(true);

        // Use enterprise transport for progression
        try {
            await this.transport.playProgressionWithTiming(
                window.lineup,
                this.transport.bpm,
                window.beatsPerChord || 4
            );
        } catch (error) {
            console.error('[LOGIC-TRANSPORT] Progression playback error:', error);
        }

        this.setPlaying(false);
    }

    // Show/hide transport
    show() {
        this.element.style.display = 'flex';
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

// Enterprise factory
export function createLogicTransport(transportBridge) {
    return new LogicTransport(transportBridge);
}
