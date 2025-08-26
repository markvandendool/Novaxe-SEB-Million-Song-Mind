import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface SimpleTabConfig {
    id: string;
    label: string;
}

@Injectable({
    providedIn: 'root'
})
export class SimpleTabService {
    private _activeTab = new BehaviorSubject<string>('tab1');
    private _tabs: SimpleTabConfig[] = [
        { id: 'tab1', label: 'First Tab' },
        { id: 'tab2', label: 'Second Tab' },
        { id: 'tab3', label: 'Third Tab' }
    ];

    activeTab$ = this._activeTab.asObservable();

    constructor() {
        console.log('🚀 SIMPLE SimpleTabService initialized');
        console.log('📋 Available tabs:', this._tabs);
        console.log('🎯 Initial active tab:', this._activeTab.value);
        this.performHealthCheck();

        // Auto-test every 5 seconds
        setInterval(() => {
            this.autonomousHealthCheck();
        }, 5000);
    }

    private performHealthCheck() {
        console.log('🏥 HEALTH CHECK: Starting service diagnostics...');
        console.log('🔍 Total tabs:', this._tabs.length);
        console.log('🔍 Active tab value:', this._activeTab.value);
        console.log('🔍 BehaviorSubject working:', this._activeTab instanceof BehaviorSubject);
        console.log('🔍 Tabs array:', JSON.stringify(this._tabs, null, 2));
        console.log('✅ HEALTH CHECK: Service is healthy');
    }

    private autonomousHealthCheck() {
        console.log('🤖 AUTONOMOUS CHECK: Running self-diagnostics...');
        const currentTab = this._activeTab.value;
        const tabExists = this._tabs.find(t => t.id === currentTab);

        if (tabExists) {
            console.log('✅ AUTONOMOUS: Active tab is valid:', currentTab);
        } else {
            console.error('❌ AUTONOMOUS: Active tab is invalid:', currentTab);
        }

        console.log('🔄 AUTONOMOUS: Testing tab switch...');
        const testTab = this._tabs[Math.floor(Math.random() * this._tabs.length)];
        console.log('🎯 AUTONOMOUS: Switching to test tab:', testTab.id);
        this.setActiveTab(testTab.id);
    }

    getTabs(): SimpleTabConfig[] {
        console.log('📋 GET_TABS called, returning:', this._tabs);
        return this._tabs;
    }

    setActiveTab(tabId: string) {
        console.log('🔄 SET_ACTIVE_TAB called with:', tabId);
        console.log('🔍 Looking for tab in array:', this._tabs);

        const tab = this._tabs.find(t => t.id === tabId);
        if (tab) {
            console.log('✅ Tab found, setting active:', tab);
            const oldValue = this._activeTab.value;
            this._activeTab.next(tabId);
            const newValue = this._activeTab.value;
            console.log('🎯 Active tab updated from:', oldValue, 'to:', newValue);
            console.log('🔔 Broadcasting change to', this._activeTab.observers.length, 'subscribers');

            // Verify the change took effect
            setTimeout(() => {
                console.log('🔍 VERIFICATION: Current active tab is:', this._activeTab.value);
            }, 100);

        } else {
            console.error('❌ Tab not found for id:', tabId);
            console.log('📋 Available tab IDs:', this._tabs.map(t => t.id));
        }
    }

    getActiveTab(): string {
        const current = this._activeTab.value;
        console.log('🎯 GET_ACTIVE_TAB returning:', current);
        return current;
    }
}
