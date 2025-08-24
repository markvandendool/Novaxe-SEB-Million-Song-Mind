import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { trigger, state, style, animate, transition, AnimationTriggerMetadata } from '@angular/animations';

export interface TabConfig {
    id: string;
    name: string;
    icon: string;
    component: string;
    position: number;
    audioTheme?: AudioTheme;
    animationDuration?: number;
    slideWidth?: string;
    // PS5/Guitar Hero enhancements
    description?: string;
    ps5Theme?: string;
    soundEffect?: string;
}

export interface AudioTheme {
    hover: string;
    open: string;
    close: string;
    ambient?: string;
    key?: string; // Musical key for harmonic sound effects
}

export interface TabState {
    activeTabId: string | null;
    isAnimating: boolean;
    slidePosition: number;
    soundEnabled: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class ModernTabService {

    // Tab state management
    private tabStateSubject = new BehaviorSubject<TabState>({
        activeTabId: null,
        isAnimating: false,
        slidePosition: 0,
        soundEnabled: true
    });

    public tabState$: Observable<TabState> = this.tabStateSubject.asObservable();

    // Tab configuration registry
    private tabs = new Map<string, TabConfig>();

    // PS5/Guitar Hero styled tab definitions
    private ps5TabDefaults: Omit<TabConfig, 'position'>[] = [
        {
            id: 'cubes',
            name: 'Cubes Arena',
            icon: '🎮',
            component: 'CubesComponent',
            description: 'Enter the 3D Cube Universe',
            ps5Theme: 'neon-blue',
            soundEffect: 'cube-portal',
            audioTheme: {
                hover: 'synthChord-C',
                open: 'cubePortal',
                close: 'synthPad',
                ambient: 'digitalRain',
                key: 'C'
            }
        },
        {
            id: 'braid',
            name: 'Harmonic Braid',
            icon: '🌊',
            component: 'BraidComponent',
            description: 'Navigate the Musical Fabric',
            ps5Theme: 'electric-purple',
            soundEffect: 'harmonic-wave',
            audioTheme: {
                hover: 'synthChord-A',
                open: 'harmonicWave',
                close: 'synthPad',
                ambient: 'organicPulse',
                key: 'A'
            }
        },
        {
            id: 'fifths',
            name: 'Circle of Fifths',
            icon: '⭕',
            component: 'FifthCircleComponent',
            description: 'Master Musical Relationships',
            ps5Theme: 'golden-ring',
            soundEffect: 'circle-chime',
            audioTheme: {
                hover: 'synthChord-G',
                open: 'circleChime',
                close: 'synthPad',
                ambient: 'harmonicResonance',
                key: 'G'
            }
        },
        {
            id: 'editor',
            name: 'Score Editor',
            icon: '📝',
            component: 'EditorComponent',
            description: 'Create Musical Masterpieces',
            ps5Theme: 'silver-chrome',
            soundEffect: 'editor-click',
            audioTheme: {
                hover: 'synthChord-E',
                open: 'editorClick',
                close: 'synthPad',
                ambient: 'creativeSpark',
                key: 'E'
            }
        },
        {
            id: 'metronome',
            name: 'Rhythm Engine',
            icon: '🥁',
            component: 'MetroComponent',
            description: 'Lock into Perfect Time',
            ps5Theme: 'rhythmic-red',
            soundEffect: 'metronome-tick',
            audioTheme: {
                hover: 'synthChord-D',
                open: 'metronomeTick',
                close: 'synthPad',
                ambient: 'rhythmicPulse',
                key: 'D'
            }
        },
        {
            id: 'dictionary',
            name: 'Chord Library',
            icon: '📚',
            component: 'DicoComponent',
            description: 'Explore Musical Knowledge',
            ps5Theme: 'wisdom-green',
            soundEffect: 'library-open',
            audioTheme: {
                hover: 'synthChord-F',
                open: 'libraryOpen',
                close: 'synthPad',
                ambient: 'knowledgeFlow',
                key: 'F'
            }
        }
    ];

    constructor() {
        console.log('🔧 ModernTabService: Constructor called');
        this.initializeTabs();
        console.log('🔧 ModernTabService: Initialized with tabs:', Array.from(this.tabs.keys()));
    }

    private initializeTabs(): void {
        // Initialize PS5/Guitar Hero styled tabs with proper positioning
        this.ps5TabDefaults.forEach((tabDef, index) => {
            const fullConfig: TabConfig = {
                ...tabDef,
                position: index,
                animationDuration: 600,
                slideWidth: '400px'
            };
            this.tabs.set(tabDef.id, fullConfig);
        });
    }

    // Tab management methods
    public registerTab(config: TabConfig): void {
        this.tabs.set(config.id, config);
    }

    public getTab(id: string): TabConfig | undefined {
        return this.tabs.get(id);
    }

    public getAllTabs(): TabConfig[] {
        console.log('🔧 ModernTabService.getAllTabs called');
        console.log('🔧 Tab registry size:', this.tabs.size);
        console.log('🔧 Tab registry keys:', Array.from(this.tabs.keys()));

        const tabsArray = Array.from(this.tabs.values());
        console.log('🔧 Raw tabs array length:', tabsArray.length);

        if (tabsArray.length === 0) {
            console.error('🔧 CRITICAL: No tabs in registry! Service initialization may have failed.');
            return [];
        }

        const sortedTabs = tabsArray.sort((a, b) => a.position - b.position);
        console.log('🔧 Sorted tabs:', sortedTabs.map(t => ({
            id: t.id,
            name: t.name,
            component: t.component,
            position: t.position
        })));

        return sortedTabs;
    }

    public async openTab(id: string): Promise<void> {
        const currentState = this.tabStateSubject.value;

        console.log('🔧 ModernTabService.openTab called:', {
            requestedId: id,
            currentActiveTab: currentState.activeTabId,
            allRegisteredTabs: Array.from(this.tabs.keys()),
            tabExists: this.tabs.has(id)
        });

        // If same tab is already open, close it
        if (currentState.activeTabId === id) {
            console.log('🔧 Same tab already open, closing');
            return this.closeTab();
        }

        // Close current tab if different tab is open
        if (currentState.activeTabId && currentState.activeTabId !== id) {
            console.log('🔧 Closing current tab before opening new one');
            await this.closeTab();
        }

        const tab = this.getTab(id);
        if (!tab) {
            console.error('🚫 Tab not found:', id, 'Available tabs:', Array.from(this.tabs.keys()));
            return;
        }

        console.log('🔧 Opening tab:', { id, tabConfig: tab });

        // Set animating state
        this.updateState({ isAnimating: true });

        // Play open sound
        if (currentState.soundEnabled && tab.audioTheme?.open) {
            await this.playSound(tab.audioTheme.open, tab.audioTheme.key);
        }

        // Perform slide animation
        await this.animateSlide(id, 'open', tab.slideWidth || '36vw', tab.animationDuration || 400);

        // Update final state
        this.updateState({
            activeTabId: id,
            isAnimating: false,
            slidePosition: this.getSlidePosition(tab.slideWidth || '36vw')
        });

        // Start ambient audio if configured
        if (tab.audioTheme?.ambient) {
            this.playAmbientAudio(tab.audioTheme.ambient);
        }
    }

    public async closeTab(): Promise<void> {
        const currentState = this.tabStateSubject.value;
        if (!currentState.activeTabId) return;

        const tab = this.getTab(currentState.activeTabId);
        if (!tab) return;

        // Set animating state
        this.updateState({ isAnimating: true });

        // Stop ambient audio
        this.stopAmbientAudio();

        // Play close sound
        if (currentState.soundEnabled && tab.audioTheme?.close) {
            await this.playSound(tab.audioTheme.close, tab.audioTheme.key);
        }

        // Perform slide animation
        await this.animateSlide(currentState.activeTabId, 'close', '0px', tab.animationDuration || 400);

        // Update final state
        this.updateState({
            activeTabId: null,
            isAnimating: false,
            slidePosition: 0
        });
    }

    public async hoverTab(id: string): Promise<void> {
        const currentState = this.tabStateSubject.value;
        if (!currentState.soundEnabled) return;

        const tab = this.getTab(id);
        if (tab?.audioTheme?.hover) {
            await this.playSound(tab.audioTheme.hover, tab.audioTheme.key);
        }
    }

    // Animation helpers
    private async animateSlide(tabId: string, direction: 'open' | 'close', targetWidth: string, duration: number): Promise<void> {
        return new Promise(resolve => {
            // Animation will be handled by CSS transitions
            // This method coordinates timing
            setTimeout(() => {
                resolve();
            }, duration);
        });
    }

    private getSlidePosition(width: string): number {
        // Convert width string to pixel value for calculations
        if (width.includes('vw')) {
            const vw = parseFloat(width.replace('vw', ''));
            return (window.innerWidth * vw) / 100;
        }
        if (width.includes('px')) {
            return parseFloat(width.replace('px', ''));
        }
        return 0;
    }

    // Sound effect methods (will be enhanced with AudioManager)
    private async playSound(soundFile: string, musicalKey?: string): Promise<void> {
        // Placeholder for AudioManager integration
        console.log(`Playing sound: ${soundFile} in key: ${musicalKey}`);

        // TODO: Integrate with AudioManager service
        // this.audioManager.playUISound(soundFile, { key: musicalKey });
    }

    private playAmbientAudio(soundFile: string): void {
        // TODO: Implement ambient audio loop
        console.log(`Starting ambient: ${soundFile}`);
    }

    private stopAmbientAudio(): void {
        // TODO: Stop current ambient audio
        console.log('Stopping ambient audio');
    }

    // State management
    private updateState(partialState: Partial<TabState>): void {
        const currentState = this.tabStateSubject.value;
        this.tabStateSubject.next({ ...currentState, ...partialState });
    }

    public getCurrentState(): TabState {
        return this.tabStateSubject.value;
    }

    // Angular community debugging helper - verify service health
    public verifyServiceHealth(): boolean {
        const health = {
            tabRegistrySize: this.tabs.size,
            tabRegistryKeys: Array.from(this.tabs.keys()),
            stateSubjectExists: !!this.tabStateSubject,
            currentState: this.tabStateSubject?.value
        };

        console.log('🏥 ModernTabService Health Check:', health);

        const isHealthy = this.tabs.size > 0 &&
            !!this.tabStateSubject;

        console.log('🏥 Service is healthy:', isHealthy);
        return isHealthy;
    }

    public toggleSound(): void {
        const currentState = this.tabStateSubject.value;
        this.updateState({ soundEnabled: !currentState.soundEnabled });
    }

    // Animation configurations for Angular Animations
    public static getSlideAnimation(): AnimationTriggerMetadata {
        return trigger('slideOut', [
            state('closed', style({
                transform: 'translateX(100%)',
                opacity: 0
            })),
            state('open', style({
                transform: 'translateX(0)',
                opacity: 1
            })),
            transition('closed => open', [
                animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)')
            ]),
            transition('open => closed', [
                animate('300ms cubic-bezier(0.25, 0.8, 0.25, 1)')
            ])
        ]);
    }

    public static getTabAnimation(): AnimationTriggerMetadata {
        return trigger('tabHighlight', [
            state('inactive', style({
                backgroundColor: '#2a2f34',
                transform: 'translateX(0)'
            })),
            state('active', style({
                backgroundColor: '#343a40',
                transform: 'translateX(-36vw)' // Default slide distance
            })),
            state('cubes-active', style({
                backgroundColor: '#343a40',
                transform: 'translateX(-100vw)' // Full screen for cubes
            })),
            transition('inactive => active', [
                animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)')
            ]),
            transition('inactive => cubes-active', [
                animate('600ms cubic-bezier(0.25, 0.8, 0.25, 1)')
            ]),
            transition('* => inactive', [
                animate('300ms cubic-bezier(0.25, 0.8, 0.25, 1)')
            ])
        ]);
    }
}
