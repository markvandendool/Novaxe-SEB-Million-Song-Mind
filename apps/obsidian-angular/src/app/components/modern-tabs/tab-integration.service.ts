import { Injectable, ComponentRef, ViewContainerRef, Type } from '@angular/core';
import { ModernTabService, TabConfig } from '../../services/modern-tab/modern-tab.service';
import { AudioManagerService } from '../../services/audio-manager/audio-manager.service';

// Import existing components for integration
interface LegacyComponentMapping {
    [key: string]: {
        component: Type<any>;
        config: Partial<TabConfig>;
    };
}

@Injectable({
    providedIn: 'root'
})
export class TabIntegrationService {
    private componentRefs = new Map<string, ComponentRef<any>>();

    constructor(
        private tabService: ModernTabService,
        private audioManager: AudioManagerService
    ) {
        this.initializeTabSystem();
    }

    /**
     * Initialize the modern tab system with existing components
     */
    private initializeTabSystem(): void {
        // Register default tabs that were in the legacy system
        const defaultTabs: TabConfig[] = [
            {
                id: 'editor',
                name: 'Editor',
                icon: '✏️',
                component: 'editor',
                position: 0
            },
            {
                id: 'metro',
                name: 'Metronome',
                icon: '🎵',
                component: 'metro',
                position: 1
            },
            {
                id: 'cubes',
                name: 'Cubes',
                icon: 'custom-cubes', // Special marker for custom icon
                component: 'cubes',
                position: 2,
                slideWidth: '100vw'
            },
            {
                id: 'circle',
                name: 'Circle',
                icon: '🔄',
                component: 'circle',
                position: 3
            },
            {
                id: 'dico',
                name: 'Dictionary',
                icon: '📖',
                component: 'dico',
                position: 4
            },
            {
                id: 'options',
                name: 'Options',
                icon: '⚙️',
                component: 'options',
                position: 5
            }
        ];

        // Register all tabs
        defaultTabs.forEach(tab => {
            this.tabService.registerTab(tab);
        });

        // Subscribe to tab changes for sound effects
        this.tabService.tabState$.subscribe(state => {
            if (state.activeTabId && !state.isAnimating) {
                this.audioManager.playUISound('tabOpen');

                // Special sound for cubes tab
                if (state.activeTabId === 'cubes') {
                    setTimeout(() => {
                        this.audioManager.playMusicalChord(['C4'], { duration: 0.3 });
                    }, 200);
                }
            }
        });
    }

    /**
     * Create and load a component into the panel
     */
    async loadComponent(
        tabId: string,
        container: ViewContainerRef
    ): Promise<ComponentRef<any> | null> {
        // Clear existing component
        if (this.componentRefs.has(tabId)) {
            this.componentRefs.get(tabId)?.destroy();
            this.componentRefs.delete(tabId);
        }

        try {
            let componentRef: ComponentRef<any> | null = null;

            switch (tabId) {
                case 'editor':
                    componentRef = await this.loadEditorComponent(container);
                    break;

                case 'metro':
                    componentRef = await this.loadMetronomeComponent(container);
                    break;

                case 'cubes':
                    componentRef = await this.loadCubesComponent(container);
                    break;

                case 'circle':
                    componentRef = await this.loadCircleComponent(container);
                    break;

                case 'dico':
                    componentRef = await this.loadDictionaryComponent(container);
                    break;

                case 'options':
                    componentRef = await this.loadOptionsComponent(container);
                    break;

                default:
                    console.warn(`Unknown tab component: ${tabId}`);
                    return null;
            }

            if (componentRef) {
                this.componentRefs.set(tabId, componentRef);

                // Initialize component with any needed data
                this.initializeComponent(tabId, componentRef);
            }

            return componentRef;
        } catch (error) {
            console.error(`Failed to load component for tab ${tabId}:`, error);
            return null;
        }
    }

    /**
     * Load the editor component
     */
    private async loadEditorComponent(container: ViewContainerRef): Promise<ComponentRef<any> | null> {
        try {
            // Dynamically import and create the editor component
            // This assumes the editor exists as part of the song component
            const template = `
        <div class="editor-panel-content">
          <div class="editor-toolbar">
            <h3>Music Editor</h3>
            <div class="editor-actions">
              <button class="btn btn-primary" (click)="saveChanges()">
                💾 Save
              </button>
              <button class="btn btn-secondary" (click)="resetEditor()">
                🔄 Reset
              </button>
            </div>
          </div>
          <div class="editor-workspace">
            <!-- Editor content will be dynamically loaded here -->
            <div class="editor-placeholder">
              <p>🎵 Music Editor Loading...</p>
              <p>Advanced music editing capabilities will be integrated here.</p>
            </div>
          </div>
        </div>
      `;

            // Create a dynamic component
            const componentRef = this.createDynamicComponent(container, template, {
                saveChanges: () => {
                    this.audioManager.playUISound('success');
                    console.log('Editor: Save changes');
                },
                resetEditor: () => {
                    this.audioManager.playUISound('reset');
                    console.log('Editor: Reset');
                }
            });

            return componentRef;
        } catch (error) {
            console.error('Failed to load editor component:', error);
            return null;
        }
    }

    /**
     * Load the metronome component
     */
    private async loadMetronomeComponent(container: ViewContainerRef): Promise<ComponentRef<any> | null> {
        try {
            const template = `
        <div class="metro-panel-content">
          <div class="metro-controls">
            <h3>🎵 Metronome</h3>
            <div class="tempo-control">
              <label>Tempo: {{currentTempo}} BPM</label>
              <input type="range" min="60" max="200" 
                     [value]="currentTempo" 
                     (input)="updateTempo($event)">
            </div>
            <div class="metro-actions">
              <button class="btn btn-primary" 
                      [class.active]="isPlaying"
                      (click)="toggleMetronome()">
                {{isPlaying ? '⏸️ Stop' : '▶️ Start'}}
              </button>
            </div>
          </div>
          <div class="metro-visual">
            <div class="beat-indicator" [class.active]="beatActive">
              🥁
            </div>
          </div>
        </div>
      `;

            const componentRef = this.createDynamicComponent(container, template, {
                currentTempo: 120,
                isPlaying: false,
                beatActive: false,
                updateTempo: (event: any) => {
                    const tempo = parseInt(event.target.value);
                    console.log('Metronome tempo:', tempo);
                    this.audioManager.playMusicalChord(['C5'], { duration: 0.1 });
                },
                toggleMetronome: function () {
                    this.isPlaying = !this.isPlaying;
                    console.log('Metronome:', this.isPlaying ? 'started' : 'stopped');
                }
            });

            return componentRef;
        } catch (error) {
            console.error('Failed to load metronome component:', error);
            return null;
        }
    }

    /**
     * Load the 3D cubes component
     */
    private async loadCubesComponent(container: ViewContainerRef): Promise<ComponentRef<any> | null> {
        try {
            const template = `
        <div class="cubes-panel-content cubes-fullscreen">
          <div class="cubes-controls">
            <h3>🎲 3D Musical Cubes</h3>
            <div class="cubes-actions">
              <button class="btn btn-primary" (click)="resetCubes()">
                🔄 Reset Scene
              </button>
              <button class="btn btn-secondary" (click)="randomizeCubes()">
                🎲 Randomize
              </button>
            </div>
          </div>
          
          <!-- Cubes container will be dynamically populated -->
          <div class="cubes-container" id="cubes-threejs-container">
            <div class="loading-indicator">
              <p>🎲 Loading 3D Cubes Scene...</p>
              <p>Prepare for an immersive musical experience!</p>
            </div>
          </div>
        </div>
      `;

            const componentRef = this.createDynamicComponent(container, template, {
                resetCubes: () => {
                    this.audioManager.playUISound('reset');
                    this.audioManager.playMusicalChord(['C4', 'E4', 'G4'], { duration: 0.5 });
                    console.log('Cubes: Reset scene');
                },
                randomizeCubes: () => {
                    this.audioManager.playUISound('magic');
                    // Play a cascade of notes
                    ['C4', 'D4', 'E4', 'F4', 'G4'].forEach((note, i) => {
                        setTimeout(() => this.audioManager.playMusicalChord([note], { duration: 0.3 }), i * 100);
                    });
                    console.log('Cubes: Randomize');
                }
            });

            // Initialize Three.js cubes here if needed
            // This would integrate with the existing LearnFifthsComponent
            setTimeout(() => {
                this.initializeCubesScene();
            }, 100);

            return componentRef;
        } catch (error) {
            console.error('Failed to load cubes component:', error);
            return null;
        }
    }

    /**
     * Load the circle component
     */
    private async loadCircleComponent(container: ViewContainerRef): Promise<ComponentRef<any> | null> {
        try {
            const template = `
        <div class="circle-panel-content">
          <div class="circle-header">
            <h3>🔄 Circle of Fifths</h3>
            <div class="circle-controls">
              <button class="btn btn-primary" (click)="spinCircle()">
                🌀 Spin
              </button>
            </div>
          </div>
          <div class="circle-container">
            <div class="circle-of-fifths">
              <p>🎵 Interactive Circle of Fifths</p>
              <p>Musical theory visualization will be loaded here.</p>
            </div>
          </div>
        </div>
      `;

            const componentRef = this.createDynamicComponent(container, template, {
                spinCircle: () => {
                    this.audioManager.playUISound('whoosh');
                    console.log('Circle: Spin animation');
                }
            });

            return componentRef;
        } catch (error) {
            console.error('Failed to load circle component:', error);
            return null;
        }
    }

    /**
     * Load the dictionary component
     */
    private async loadDictionaryComponent(container: ViewContainerRef): Promise<ComponentRef<any> | null> {
        try {
            const template = `
        <div class="dico-panel-content">
          <div class="dico-header">
            <h3>📖 Music Dictionary</h3>
            <div class="search-box">
              <input type="text" placeholder="Search music terms..." 
                     (input)="searchDictionary($event)">
            </div>
          </div>
          <div class="dico-content">
            <div class="dictionary-results">
              <p>🎵 Music Dictionary</p>
              <p>Search for musical terms, chords, and theory.</p>
            </div>
          </div>
        </div>
      `;

            const componentRef = this.createDynamicComponent(container, template, {
                searchDictionary: (event: any) => {
                    const query = event.target.value;
                    if (query.length > 2) {
                        this.audioManager.playMusicalChord(['A4'], { duration: 0.1 });
                        console.log('Dictionary search:', query);
                    }
                }
            });

            return componentRef;
        } catch (error) {
            console.error('Failed to load dictionary component:', error);
            return null;
        }
    }

    /**
     * Load the options component
     */
    private async loadOptionsComponent(container: ViewContainerRef): Promise<ComponentRef<any> | null> {
        try {
            const template = `
        <div class="options-panel-content">
          <div class="options-header">
            <h3>⚙️ Settings</h3>
          </div>
          <div class="options-content">
            <div class="setting-group">
              <h4>🎵 Audio Settings</h4>
              <label>
                <input type="checkbox" [checked]="soundEnabled" 
                       (change)="toggleSound($event)"> 
                Enable Sound Effects
              </label>
              <label>
                <input type="range" min="0" max="100" [value]="volume" 
                       (input)="updateVolume($event)">
                Volume: {{volume}}%
              </label>
            </div>
            
            <div class="setting-group">
              <h4>🎨 Visual Settings</h4>
              <label>
                <input type="checkbox" [checked]="animationsEnabled" 
                       (change)="toggleAnimations($event)"> 
                Enable Animations
              </label>
            </div>
          </div>
        </div>
      `;

            const componentRef = this.createDynamicComponent(container, template, {
                soundEnabled: true,
                animationsEnabled: true,
                volume: 75,
                toggleSound: (event: any) => {
                    const enabled = event.target.checked;
                    if (enabled) {
                        this.audioManager.playUISound('success');
                    }
                    console.log('Sound enabled:', enabled);
                },
                toggleAnimations: (event: any) => {
                    const enabled = event.target.checked;
                    console.log('Animations enabled:', enabled);
                },
                updateVolume: (event: any) => {
                    const volume = parseInt(event.target.value);
                    console.log('Volume:', volume);
                }
            });

            return componentRef;
        } catch (error) {
            console.error('Failed to load options component:', error);
            return null;
        }
    }

    /**
     * Create a dynamic component with template and methods
     */
    private createDynamicComponent(
        container: ViewContainerRef,
        template: string,
        methods: any
    ): ComponentRef<any> {
        // This is a simplified dynamic component creation
        // In a real implementation, you'd use Angular's ComponentFactory
        // For now, we'll create a basic container with the template

        const div = document.createElement('div');
        div.innerHTML = template;

        // Attach methods to the div for event handling
        Object.keys(methods).forEach(methodName => {
            (div as any)[methodName] = methods[methodName];
        });

        container.element.nativeElement.appendChild(div);

        // Return a mock component ref
        return {
            instance: methods,
            location: { nativeElement: div },
            destroy: () => {
                if (div.parentNode) {
                    div.parentNode.removeChild(div);
                }
            }
        } as ComponentRef<any>;
    }

    /**
     * Initialize component with specific configuration
     */
    private initializeComponent(tabId: string, componentRef: ComponentRef<any>): void {
        // Component-specific initialization
        switch (tabId) {
            case 'cubes':
                // Initialize 3D scene if needed
                this.initializeCubesScene();
                break;

            case 'metro':
                // Initialize metronome
                console.log('Metronome component initialized');
                break;

            // Add more initialization as needed
        }
    }

    /**
     * Initialize the 3D cubes scene
     */
    private initializeCubesScene(): void {
        const container = document.getElementById('cubes-threejs-container');
        if (container) {
            // This would integrate with the existing LearnFifthsComponent
            // For now, just show that it's ready
            container.innerHTML = `
        <div class="cubes-ready">
          <h2>🎲 3D Cubes Scene Ready!</h2>
          <p>Full interactive 3D musical cubes experience</p>
          <div class="integration-note">
            <p><strong>Integration Point:</strong> LearnFifthsComponent will be loaded here</p>
          </div>
        </div>
      `;

            // Play spatial audio for cubes
            this.audioManager.playSpatialSound('cube_click', { x: 0, y: 0, z: 0 });
        }
    }

    /**
     * Clean up component resources
     */
    cleanup(): void {
        this.componentRefs.forEach(ref => ref.destroy());
        this.componentRefs.clear();
    }
}
