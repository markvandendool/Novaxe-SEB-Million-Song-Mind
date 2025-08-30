// World-Class iPad App Level Menu System
// Professional UI hierarchy with iOS design patterns

export class iPadMenuSystem {
    constructor() {
        this.isMenuOpen = false;
        this.activePanel = null;
        this.panels = {};

        // iOS Design System colors
        this.colors = {
            background: 'rgba(28, 28, 30, 0.95)',
            surface: 'rgba(44, 44, 46, 0.95)',
            surfaceSecondary: 'rgba(58, 58, 60, 0.95)',
            accent: '#007AFF',
            accentSecondary: '#5856D6',
            success: '#34C759',
            warning: '#FF9500',
            error: '#FF3B30',
            text: '#FFFFFF',
            textSecondary: '#8E8E93',
            textTertiary: '#48484A',
            border: 'rgba(84, 84, 88, 0.6)',
            separator: 'rgba(84, 84, 88, 0.3)'
        };

        this.createMenuSystem();
        this.setupGestures();
        console.log('[IPAD-MENU] World-class menu system initialized');
    }

    createMenuSystem() {
        // Main menu container (iOS style)
        this.menuContainer = document.createElement('div');
        this.menuContainer.className = 'ipad-menu-container';
        this.menuContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(20px);
            z-index: 10000;
            display: none;
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        `;

        // Menu sidebar (iOS Settings style)
        this.sidebar = document.createElement('div');
        this.sidebar.style.cssText = `
            position: absolute;
            left: -320px;
            top: 0;
            bottom: 0;
            width: 320px;
            background: ${this.colors.background};
            border-right: 1px solid ${this.colors.border};
            transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
        `;

        // Content panel (right side)
        this.contentPanel = document.createElement('div');
        this.contentPanel.style.cssText = `
            position: absolute;
            left: 320px;
            top: 0;
            bottom: 0;
            right: 0;
            background: ${this.colors.surface};
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
        `;

        this.createSidebar();
        this.createPanels();

        this.menuContainer.appendChild(this.sidebar);
        this.menuContainer.appendChild(this.contentPanel);
        document.body.appendChild(this.menuContainer);

        // Menu toggle button (iOS style hamburger)
        this.createMenuButton();
    }

    createMenuButton() {
        console.log('[IPAD-MENU] Creating menu button...');

        this.menuButton = document.createElement('button');
        this.menuButton.innerHTML = '☰';
        this.menuButton.style.cssText = `
            position: fixed !important;
            top: 20px !important;
            left: 20px !important;
            width: 50px !important;
            height: 50px !important;
            background: rgba(28, 28, 30, 0.95) !important;
            border: 2px solid #007AFF !important;
            border-radius: 12px !important;
            color: #007AFF !important;
            cursor: pointer !important;
            z-index: 99999 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            backdrop-filter: blur(20px) !important;
            transition: all 0.2s ease !important;
            box-shadow: 0 4px 16px rgba(0, 122, 255, 0.4) !important;
            font-size: 24px !important;
            font-weight: bold !important;
            pointer-events: auto !important;
        `;

        // Prevent event bubbling to avoid chord selection
        this.menuButton.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.log('[IPAD-MENU] Menu button clicked');
            this.toggleMenu();
        };

        // Add multiple event listeners to ensure it works
        this.menuButton.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
        });

        this.menuButton.addEventListener('pointerup', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
        });

        document.body.appendChild(this.menuButton);
        console.log('[IPAD-MENU] Menu button added to DOM');

        // Verify it's visible
        setTimeout(() => {
            const rect = this.menuButton.getBoundingClientRect();
            console.log('[IPAD-MENU] Menu button position:', rect);
        }, 100);
    }

    createSidebar() {
        // Header
        const header = document.createElement('div');
        header.style.cssText = `
            padding: 60px 20px 20px 20px;
            border-bottom: 1px solid ${this.colors.separator};
        `;

        const title = document.createElement('h1');
        title.textContent = 'ChordCubes';
        title.style.cssText = `
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            color: ${this.colors.text};
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
        `;

        const subtitle = document.createElement('p');
        subtitle.textContent = 'Professional Music Production';
        subtitle.style.cssText = `
            margin: 4px 0 0 0;
            font-size: 16px;
            color: ${this.colors.textSecondary};
            font-weight: 400;
        `;

        header.appendChild(title);
        header.appendChild(subtitle);

        // Menu items
        const menuItems = [
            { id: 'transport', icon: '🎛️', title: 'Transport', subtitle: 'Playback & Timing' },
            { id: 'styles', icon: '🥁', title: 'Drum Styles', subtitle: 'Hip Hop, Country, Techno...' },
            { id: 'chords', icon: '🎹', title: 'Chord Settings', subtitle: 'Key, Set, Instruments' },
            { id: 'visual', icon: '🎨', title: 'Visual Settings', subtitle: 'Colors, Labels, Layout' },
            { id: 'audio', icon: '🔊', title: 'Audio Settings', subtitle: 'Volume, Effects, Mix' },
            { id: 'advanced', icon: '⚙️', title: 'Advanced', subtitle: 'Voice Leading, Physics' }
        ];

        const menuList = document.createElement('div');
        menuList.style.cssText = 'padding: 0;';

        menuItems.forEach(item => {
            const menuItem = this.createMenuItem(item);
            menuList.appendChild(menuItem);
        });

        this.sidebar.appendChild(header);
        this.sidebar.appendChild(menuList);
    }

    createMenuItem(item) {
        const menuItem = document.createElement('div');
        menuItem.className = `menu-item menu-item-${item.id}`;
        menuItem.style.cssText = `
            padding: 16px 20px;
            border-bottom: 1px solid ${this.colors.separator};
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 16px;
        `;

        const icon = document.createElement('div');
        icon.textContent = item.icon;
        icon.style.cssText = `
            font-size: 24px;
            width: 32px;
            text-align: center;
        `;

        const content = document.createElement('div');
        content.style.cssText = 'flex: 1;';

        const title = document.createElement('div');
        title.textContent = item.title;
        title.style.cssText = `
            font-size: 17px;
            font-weight: 600;
            color: ${this.colors.text};
            margin-bottom: 2px;
        `;

        const subtitle = document.createElement('div');
        subtitle.textContent = item.subtitle;
        subtitle.style.cssText = `
            font-size: 14px;
            color: ${this.colors.textSecondary};
        `;

        const chevron = document.createElement('div');
        chevron.innerHTML = '›';
        chevron.style.cssText = `
            font-size: 20px;
            color: ${this.colors.textTertiary};
            font-weight: 300;
        `;

        content.appendChild(title);
        content.appendChild(subtitle);
        menuItem.appendChild(icon);
        menuItem.appendChild(content);
        menuItem.appendChild(chevron);

        // Hover effects
        menuItem.addEventListener('mouseenter', () => {
            menuItem.style.background = this.colors.surfaceSecondary;
        });

        menuItem.addEventListener('mouseleave', () => {
            menuItem.style.background = 'transparent';
        });

        menuItem.onclick = () => this.showPanel(item.id);

        return menuItem;
    }

    createPanels() {
        // Transport Panel
        this.panels.transport = this.createTransportPanel();

        // Styles Panel
        this.panels.styles = this.createStylesPanel();

        // Chords Panel
        this.panels.chords = this.createChordsPanel();

        // Visual Panel
        this.panels.visual = this.createVisualPanel();

        // Audio Panel
        this.panels.audio = this.createAudioPanel();

        // Advanced Panel
        this.panels.advanced = this.createAdvancedPanel();
    }

    createTransportPanel() {
        const panel = document.createElement('div');
        panel.style.cssText = `
            padding: 40px;
            height: 100%;
            overflow-y: auto;
        `;

        const header = this.createPanelHeader('🎛️', 'Transport Control', 'Professional playback and timing');

        // Transport controls section
        const controlsSection = this.createSection('Playback Controls');

        const transportControls = document.createElement('div');
        transportControls.style.cssText = `
            display: flex;
            gap: 16px;
            margin-bottom: 32px;
        `;

        // Professional transport buttons
        const playBtn = this.createTransportButton('▶', 'Play', this.colors.success);
        const pauseBtn = this.createTransportButton('⏸', 'Pause', this.colors.warning);
        const stopBtn = this.createTransportButton('⏹', 'Stop', this.colors.error);
        const recordBtn = this.createTransportButton('●', 'Record', this.colors.error);

        transportControls.appendChild(playBtn);
        transportControls.appendChild(pauseBtn);
        transportControls.appendChild(stopBtn);
        transportControls.appendChild(recordBtn);

        // Timing display
        const timingSection = this.createSection('Timing Display');
        const timingDisplay = this.createTimingDisplay();

        // BPM control
        const bpmSection = this.createSection('Tempo Control');
        const bpmControl = this.createBpmControl();

        controlsSection.appendChild(transportControls);

        panel.appendChild(header);
        panel.appendChild(controlsSection);
        panel.appendChild(timingSection);
        panel.appendChild(timingDisplay);
        panel.appendChild(bpmSection);
        panel.appendChild(bpmControl);

        return panel;
    }

    createStylesPanel() {
        const panel = document.createElement('div');
        panel.style.cssText = `
            padding: 40px;
            height: 100%;
            overflow-y: auto;
        `;

        const header = this.createPanelHeader('🥁', 'Drum Styles', 'Professional rhythm patterns');

        const stylesGrid = document.createElement('div');
        stylesGrid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 16px;
            margin-top: 24px;
        `;

        const styles = [
            { id: 'hip-hop', name: 'Hip Hop', description: 'Heavy kick, crisp snare, steady hi-hats', icon: '🎤' },
            { id: 'country', name: 'Country', description: 'Traditional patterns, shuffled hi-hats', icon: '🤠' },
            { id: 'techno', name: 'Techno', description: '4-on-the-floor, electronic precision', icon: '🔊' },
            { id: 'orchestra', name: 'Orchestra', description: 'Timpani, orchestral snare, cymbals', icon: '🎼' },
            { id: 'quartet', name: 'Quartet', description: 'Subtle chamber percussion', icon: '🎻' }
        ];

        styles.forEach(style => {
            const card = this.createStyleCard(style);
            stylesGrid.appendChild(card);
        });

        panel.appendChild(header);
        panel.appendChild(stylesGrid);

        return panel;
    }

    createChordsPanel() {
        const panel = document.createElement('div');
        panel.style.cssText = `
            padding: 40px;
            height: 100%;
            overflow-y: auto;
        `;

        const header = this.createPanelHeader('🎹', 'Chord Settings', 'Musical configuration and instruments');

        // Move existing UI elements here
        const existingUI = document.getElementById('ui');
        if (existingUI) {
            const clonedUI = existingUI.cloneNode(true);
            clonedUI.style.cssText = `
                position: static;
                background: transparent;
                padding: 24px 0;
            `;
            panel.appendChild(header);
            panel.appendChild(clonedUI);
        }

        return panel;
    }

    createVisualPanel() {
        const panel = document.createElement('div');
        panel.style.cssText = `
            padding: 40px;
            height: 100%;
            overflow-y: auto;
        `;

        const header = this.createPanelHeader('🎨', 'Visual Settings', 'Colors, labels, and display options');

        // Color controls section
        const colorSection = this.createSection('Color Scheme');

        // Move color controls here from existing UI
        const colorControls = document.getElementById('color-cal');
        if (colorControls) {
            const clonedColors = colorControls.cloneNode(true);
            clonedColors.style.cssText = `
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 16px;
                margin-top: 16px;
            `;
            colorSection.appendChild(clonedColors);
        }

        panel.appendChild(header);
        panel.appendChild(colorSection);

        return panel;
    }

    createAudioPanel() {
        const panel = document.createElement('div');
        panel.style.cssText = `
            padding: 40px;
            height: 100%;
            overflow-y: auto;
        `;

        const header = this.createPanelHeader('🔊', 'Audio Settings', 'Volume, effects, and mixing');

        // Master volume section
        const volumeSection = this.createSection('Master Volume');
        const volumeSlider = this.createSlider('Master', 0, 100, 80);
        volumeSection.appendChild(volumeSlider);

        // Effects section
        const effectsSection = this.createSection('Audio Effects');
        const reverbSlider = this.createSlider('Reverb', 0, 100, 20);
        const delaySlider = this.createSlider('Delay', 0, 100, 10);
        effectsSection.appendChild(reverbSlider);
        effectsSection.appendChild(delaySlider);

        panel.appendChild(header);
        panel.appendChild(volumeSection);
        panel.appendChild(effectsSection);

        return panel;
    }

    createAdvancedPanel() {
        const panel = document.createElement('div');
        panel.style.cssText = `
            padding: 40px;
            height: 100%;
            overflow-y: auto;
        `;

        const header = this.createPanelHeader('⚙️', 'Advanced Settings', 'Voice leading, physics, and expert options');

        // Voice leading section
        const voiceSection = this.createSection('Voice Leading');
        const voiceToggle = this.createToggle('Smart Voice Leading', true);
        voiceSection.appendChild(voiceToggle);

        // Physics section
        const physicsSection = this.createSection('Physics Settings');
        const physicsToggle = this.createToggle('Cube Physics', true);
        const gravitySlider = this.createSlider('Gravity', 0, 100, 50);
        physicsSection.appendChild(physicsToggle);
        physicsSection.appendChild(gravitySlider);

        panel.appendChild(header);
        panel.appendChild(voiceSection);
        panel.appendChild(physicsSection);

        return panel;
    }

    createPanelHeader(icon, title, subtitle) {
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 32px;
            padding-bottom: 16px;
            border-bottom: 1px solid ${this.colors.separator};
        `;

        const iconEl = document.createElement('div');
        iconEl.textContent = icon;
        iconEl.style.cssText = `
            font-size: 32px;
            width: 48px;
            height: 48px;
            background: ${this.colors.accent};
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        const content = document.createElement('div');

        const titleEl = document.createElement('h2');
        titleEl.textContent = title;
        titleEl.style.cssText = `
            margin: 0;
            font-size: 24px;
            font-weight: 700;
            color: ${this.colors.text};
        `;

        const subtitleEl = document.createElement('p');
        subtitleEl.textContent = subtitle;
        subtitleEl.style.cssText = `
            margin: 4px 0 0 0;
            font-size: 16px;
            color: ${this.colors.textSecondary};
        `;

        content.appendChild(titleEl);
        content.appendChild(subtitleEl);
        header.appendChild(iconEl);
        header.appendChild(content);

        return header;
    }

    createSection(title) {
        const section = document.createElement('div');
        section.style.cssText = 'margin-bottom: 32px;';

        const sectionTitle = document.createElement('h3');
        sectionTitle.textContent = title;
        sectionTitle.style.cssText = `
            margin: 0 0 16px 0;
            font-size: 20px;
            font-weight: 600;
            color: ${this.colors.text};
        `;

        section.appendChild(sectionTitle);
        return section;
    }

    createTransportButton(symbol, label, color) {
        const button = document.createElement('button');
        button.style.cssText = `
            width: 60px;
            height: 60px;
            background: ${color};
            border: none;
            border-radius: 16px;
            color: white;
            font-size: 24px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        `;

        button.innerHTML = `
            <div style="font-size: 24px;">${symbol}</div>
            <div style="font-size: 10px; margin-top: 2px; opacity: 0.8;">${label}</div>
        `;

        return button;
    }

    createStyleCard(style) {
        const card = document.createElement('div');
        card.style.cssText = `
            background: ${this.colors.surfaceSecondary};
            border: 1px solid ${this.colors.border};
            border-radius: 16px;
            padding: 20px;
            cursor: pointer;
            transition: all 0.2s ease;
        `;

        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
        `;

        const icon = document.createElement('div');
        icon.textContent = style.icon;
        icon.style.cssText = 'font-size: 24px;';

        const title = document.createElement('h4');
        title.textContent = style.name;
        title.style.cssText = `
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            color: ${this.colors.text};
        `;

        const description = document.createElement('p');
        description.textContent = style.description;
        description.style.cssText = `
            margin: 0;
            font-size: 14px;
            color: ${this.colors.textSecondary};
            line-height: 1.4;
        `;

        header.appendChild(icon);
        header.appendChild(title);
        card.appendChild(header);
        card.appendChild(description);

        // Hover effects
        card.addEventListener('mouseenter', () => {
            card.style.background = this.colors.surface;
            card.style.borderColor = this.colors.accent;
        });

        card.addEventListener('mouseleave', () => {
            card.style.background = this.colors.surfaceSecondary;
            card.style.borderColor = this.colors.border;
        });

        return card;
    }

    createSlider(label, min, max, value) {
        const container = document.createElement('div');
        container.style.cssText = `
            margin-bottom: 20px;
            padding: 16px;
            background: ${this.colors.surfaceSecondary};
            border-radius: 12px;
        `;

        const labelEl = document.createElement('label');
        labelEl.textContent = label;
        labelEl.style.cssText = `
            display: block;
            margin-bottom: 8px;
            font-size: 16px;
            font-weight: 600;
            color: ${this.colors.text};
        `;

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = min;
        slider.max = max;
        slider.value = value;
        slider.style.cssText = `
            width: 100%;
            height: 6px;
            background: ${this.colors.border};
            border-radius: 3px;
            outline: none;
            cursor: pointer;
        `;

        container.appendChild(labelEl);
        container.appendChild(slider);

        return container;
    }

    createToggle(label, checked) {
        const container = document.createElement('div');
        container.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px;
            background: ${this.colors.surfaceSecondary};
            border-radius: 12px;
            margin-bottom: 12px;
        `;

        const labelEl = document.createElement('span');
        labelEl.textContent = label;
        labelEl.style.cssText = `
            font-size: 16px;
            font-weight: 600;
            color: ${this.colors.text};
        `;

        const toggle = document.createElement('input');
        toggle.type = 'checkbox';
        toggle.checked = checked;
        toggle.style.cssText = `
            width: 20px;
            height: 20px;
            cursor: pointer;
        `;

        container.appendChild(labelEl);
        container.appendChild(toggle);

        return container;
    }

    createTimingDisplay() {
        const display = document.createElement('div');
        display.style.cssText = `
            background: #000;
            border: 2px solid ${this.colors.border};
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            margin-bottom: 24px;
        `;

        const time = document.createElement('div');
        time.textContent = '001.1.1';
        time.style.cssText = `
            font-family: 'SF Mono', Monaco, monospace;
            font-size: 32px;
            font-weight: 700;
            color: #00FF41;
            letter-spacing: 2px;
        `;

        const beats = document.createElement('div');
        beats.style.cssText = `
            display: flex;
            justify-content: center;
            gap: 8px;
            margin-top: 16px;
        `;

        for (let i = 0; i < 4; i++) {
            const beat = document.createElement('div');
            beat.style.cssText = `
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: ${i === 0 ? this.colors.accent : this.colors.border};
                transition: all 0.1s ease;
            `;
            beats.appendChild(beat);
        }

        display.appendChild(time);
        display.appendChild(beats);

        return display;
    }

    createBpmControl() {
        const container = document.createElement('div');
        container.style.cssText = `
            background: ${this.colors.surfaceSecondary};
            border-radius: 16px;
            padding: 24px;
        `;

        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
        `;

        const label = document.createElement('span');
        label.textContent = 'Tempo (BPM)';
        label.style.cssText = `
            font-size: 18px;
            font-weight: 600;
            color: ${this.colors.text};
        `;

        const bpmDisplay = document.createElement('div');
        bpmDisplay.textContent = '120';
        bpmDisplay.style.cssText = `
            background: #000;
            color: #00FF41;
            padding: 8px 16px;
            border-radius: 8px;
            font-family: 'SF Mono', Monaco, monospace;
            font-size: 18px;
            font-weight: 700;
            letter-spacing: 1px;
        `;

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = '60';
        slider.max = '180';
        slider.value = '120';
        slider.style.cssText = `
            width: 100%;
            height: 8px;
            background: ${this.colors.border};
            border-radius: 4px;
            outline: none;
            cursor: pointer;
        `;

        header.appendChild(label);
        header.appendChild(bpmDisplay);
        container.appendChild(header);
        container.appendChild(slider);

        return container;
    }

    showPanel(panelId) {
        // Hide current panel
        if (this.activePanel) {
            this.contentPanel.removeChild(this.activePanel);
        }

        // Show new panel
        if (this.panels[panelId]) {
            this.activePanel = this.panels[panelId];
            this.contentPanel.appendChild(this.activePanel);

            // Update menu item selection
            this.updateMenuSelection(panelId);
        }

        console.log(`[IPAD-MENU] Showing ${panelId} panel`);
    }

    updateMenuSelection(activeId) {
        const menuItems = this.sidebar.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            if (item.classList.contains(`menu-item-${activeId}`)) {
                item.style.background = this.colors.surfaceSecondary;
            } else {
                item.style.background = 'transparent';
            }
        });
    }

    toggleMenu() {
        if (this.isMenuOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        this.isMenuOpen = true;
        this.menuContainer.style.display = 'block';

        // Force reflow
        this.menuContainer.offsetHeight;

        this.menuContainer.style.opacity = '1';
        this.sidebar.style.left = '0';

        // Show default panel
        if (!this.activePanel) {
            this.showPanel('transport');
        }

        // Hide existing UI
        const existingUI = document.getElementById('ui');
        if (existingUI) {
            existingUI.style.display = 'none';
        }

        console.log('[IPAD-MENU] Menu opened');
    }

    closeMenu() {
        this.isMenuOpen = false;
        this.menuContainer.style.opacity = '0';
        this.sidebar.style.left = '-320px';

        setTimeout(() => {
            this.menuContainer.style.display = 'none';
        }, 300);

        // Show existing UI
        const existingUI = document.getElementById('ui');
        if (existingUI) {
            existingUI.style.display = 'block';
        }

        console.log('[IPAD-MENU] Menu closed');
    }

    setupGestures() {
        // Close menu when clicking outside
        this.menuContainer.onclick = (e) => {
            if (e.target === this.menuContainer) {
                this.closeMenu();
            }
        };

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMenu();
            }
        });
    }
}

// Enterprise factory
export function createiPadMenuSystem() {
    return new iPadMenuSystem();
}
