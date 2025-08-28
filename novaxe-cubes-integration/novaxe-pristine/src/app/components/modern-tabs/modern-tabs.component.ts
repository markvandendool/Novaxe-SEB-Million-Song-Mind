import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { ModernTabService, TabConfig, TabState } from '../../services/modern-tab/modern-tab.service';
import { AudioManagerService } from '../../services/audio-manager/audio-manager.service';

@Component({
    selector: 'app-modern-tabs',
    templateUrl: './modern-tabs.component.html',
    styleUrls: ['./modern-tabs.component.scss'],
    animations: [
        ModernTabService.getSlideAnimation(),
        ModernTabService.getTabAnimation()
    ],
    standalone: false
})
export class ModernTabsComponent implements OnInit, OnDestroy {

    @Input() position: 'left' | 'right' = 'right';

    public tabs: TabConfig[] = [];
    public tabState: TabState = {
        activeTabId: null,
        isAnimating: false,
        slidePosition: 0,
        soundEnabled: true
    };

    // PS5/Guitar Hero rhythm pulse state
    public rhythmPulse: boolean = false;

    // Performance optimization: track last logged component to reduce console spam
    private lastLoggedComponent: string | null = null;

    // Reactive property for active component (Angular best practice - avoid method calls in templates)
    public activeComponent: string | null = null;

    private subscriptions: Subscription[] = [];

    constructor(
        private tabService: ModernTabService,
        private audioManager: AudioManagerService
    ) { }

    ngOnInit(): void {
        console.log('🎯 ModernTabsComponent: ngOnInit called');
        console.log('🎯 TabService exists:', !!this.tabService);

        // Angular community best practice: Defensive service checking
        if (!this.tabService) {
            console.error('🎯 CRITICAL ERROR: TabService not injected!');
            return;
        }

        if (typeof this.tabService.getAllTabs !== 'function') {
            console.error('🎯 CRITICAL ERROR: TabService.getAllTabs method missing!');
            console.log('🎯 Service methods available:', Object.getOwnPropertyNames(this.tabService));
            return;
        }

        try {
            // Angular community best practice: Service health check
            const serviceHealthy = this.tabService.verifyServiceHealth();
            if (!serviceHealthy) {
                console.error('🎯 CRITICAL ERROR: Service health check failed!');
                return;
            }

            // Initialize tabs from service
            this.tabs = this.tabService.getAllTabs();
            console.log('🎯 Tabs retrieved successfully:', this.tabs.length, 'tabs');

            if (!this.tabs || this.tabs.length === 0) {
                console.error('🎯 CRITICAL ERROR: No tabs returned from service!');
                return;
            }

            this.tabState = this.tabService.getCurrentState();

            console.log('🎯 Initial tabs loaded:', this.tabs.length);
            console.log('🎯 Tab details:', this.tabs.map(t => ({ id: t.id, name: t.name, component: t.component })));
            console.log('🎯 Initial tab state:', this.tabState);

            // Subscribe to tab state changes with error handling
            this.subscriptions.push(
                this.tabService.tabState$.subscribe({
                    next: (state) => {
                        console.log('🎯 Tab state changed:', state);
                        this.tabState = state;
                        // Re-fetch tabs when state changes
                        this.tabs = this.tabService.getAllTabs();
                        // Update active component reactively
                        this.updateActiveComponent();
                    },
                    error: (error) => {
                        console.error('🎯 Tab state subscription error:', error);
                    }
                })
            );

            // Initialize active component
            this.updateActiveComponent();
        } catch (error) {
            console.error('🎯 CRITICAL ERROR in ngOnInit:', error);
            console.log('🎯 Stack trace:', error.stack);
        }
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    // Track by function for ngFor
    public trackByTabId(index: number, tab: TabConfig): string {
        return tab.id;
    }

    // Public access to tab service methods
    public getTab(id: string): TabConfig | null {
        return this.tabService.getTab(id);
    }

    // Tab interaction handlers with VERBOSE LOGGING
    public async onTabClick(tabId: string): Promise<void> {
        if (this.tabState.isAnimating) {
            console.log('🚫 Tab click blocked: Animation in progress');
            return;
        }

        console.log('🎯 ModernTabs: Opening tab', {
            tabId,
            currentActiveTab: this.tabState.activeTabId,
            allTabs: this.tabs.map(t => ({ id: t.id, name: t.name, component: t.component }))
        });

        await this.tabService.openTab(tabId);

        // Log result
        console.log('🎯 Tab opened, new state:', {
            activeTabId: this.tabState.activeTabId,
            component: this.getActiveComponent()
        });
    }

    public async onTabHover(tabId: string): Promise<void> {
        if (this.tabState.isAnimating || this.tabState.activeTabId === tabId) return;

        // Trigger PS5/Guitar Hero rhythm pulse on hover
        this.triggerRhythmPulse();
        await this.tabService.hoverTab(tabId);
    }

    public async closeCurrentTab(): Promise<void> {
        if (this.tabState.isAnimating || !this.tabState.activeTabId) return;

        console.log('🎯 ModernTabs: Closing current tab');
        await this.tabService.closeTab();
    }

    // Animation state getters
    public getTabAnimationState(tabId: string): string {
        if (this.tabState.activeTabId === tabId) {
            return tabId === 'cubes' ? 'cubes-active' : 'active';
        }
        return 'inactive';
    }

    public getSlideAnimationState(): string {
        return this.tabState.activeTabId ? 'open' : 'closed';
    }

    public getSlideWidth(): string {
        if (!this.tabState.activeTabId) return '0px';

        const tab = this.tabService.getTab(this.tabState.activeTabId);
        return tab?.slideWidth || '36vw';
    }

    // Icon helpers
    public getTabIcon(tab: TabConfig): string {
        // Handle special icons
        if (tab.icon === 'cubes-isometric') {
            return 'fa-cubes'; // FontAwesome fallback, will be replaced with custom SVG
        }
        if (tab.icon.startsWith('fa-')) {
            return tab.icon;
        }
        return tab.icon; // Asset path
    }

    public isImageIcon(icon: string): boolean {
        return icon.includes('assets/') || icon.includes('.svg') || icon.includes('.png');
    }

    public isFontAwesome(icon: string): boolean {
        return icon.startsWith('fa-') || icon === 'cubes-isometric';
    }

    // Component access helpers - OPTIMIZED FOR PERFORMANCE
    private updateActiveComponent(): void {
        if (!this.tabState.activeTabId) {
            this.activeComponent = null;
            return;
        }

        const tab = this.tabService.getTab(this.tabState.activeTabId);
        const component = tab?.component || null;

        // Only log once when component actually changes
        if (component !== this.lastLoggedComponent) {
            console.log('🔍 updateActiveComponent: Active component changed to', {
                activeTabId: this.tabState.activeTabId,
                tabFound: !!tab,
                tabName: tab?.name,
                component: component,
                fullTab: tab
            });
            this.lastLoggedComponent = component;
        }

        this.activeComponent = component;
    }

    // Legacy method kept for debugging
    public getActiveComponent(): string | null {
        return this.activeComponent;
    }

    // PS5/Guitar Hero hover events
    public onTabLeave(tabId: string): void {
        // Reset any hover states
        this.clearRhythmPulse();
    }

    // Guitar Hero rhythm pulse effects
    private triggerRhythmPulse(): void {
        this.rhythmPulse = true;
        setTimeout(() => {
            this.rhythmPulse = false;
        }, 150);
    }

    private clearRhythmPulse(): void {
        this.rhythmPulse = false;
    }

    // Audio controls
    public toggleSound(): void {
        this.tabService.toggleSound();
    }

    // Responsive helpers
    public getTabPosition(index: number): number {
        const baseTop = 100; // Start position in pixels
        const tabHeight = 160; // Updated for PS5 style
        const tabSpacing = 8;
        return baseTop + (index * (tabHeight + tabSpacing));
    }
}
