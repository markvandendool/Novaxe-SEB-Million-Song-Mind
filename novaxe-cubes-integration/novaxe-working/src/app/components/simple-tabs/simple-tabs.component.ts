import { Component, OnInit, OnDestroy } from '@angular/core';
import { SimpleTabService, SimpleTabConfig } from '../../services/simple-tab/simple-tab.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-simple-tabs',
    template: `
    <div class="simple-tabs">
      <h2>🔥 EXTREMELY SIMPLE ANGULAR 20 TABS 🔥</h2>
      
      <!-- Tab buttons -->
      <div class="tab-buttons">
        <button 
          *ngFor="let tab of tabs" 
          (click)="selectTab(tab.id)"
          [class.active]="activeTab === tab.id"
          class="tab-button">
          {{ tab.label }}
        </button>
      </div>
      
      <!-- Tab content -->
      <div class="tab-content">
        <div *ngIf="activeTab === 'tab1'" class="tab-panel">
          <h3>First Tab Content</h3>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
          <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.</p>
          <ul>
            <li>First bullet point</li>
            <li>Second bullet point</li>
            <li>Third bullet point</li>
          </ul>
        </div>
        
        <div *ngIf="activeTab === 'tab2'" class="tab-panel">
          <h3>Second Tab Content</h3>
          <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis.</p>
          <p>Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus.</p>
          <ol>
            <li>First numbered item</li>
            <li>Second numbered item</li>
            <li>Third numbered item</li>
          </ol>
        </div>
        
        <div *ngIf="activeTab === 'tab3'" class="tab-panel">
          <h3>Third Tab Content</h3>
          <p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores.</p>
          <p>Et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi.</p>
          <blockquote>
            This is a blockquote to show different content formatting.
          </blockquote>
        </div>
        
        <div *ngIf="!activeTab || (activeTab !== 'tab1' && activeTab !== 'tab2' && activeTab !== 'tab3')" class="tab-panel error">
          <h3>⚠️ NO CONTENT FOUND</h3>
          <p>Active tab: "{{ activeTab }}"</p>
          <p>This means the *ngIf conditions are not working properly.</p>
        </div>
      </div>
      
      <!-- Debug panel -->
      <div class="debug-panel">
        <h4>🔍 Debug Information</h4>
        <p><strong>Active Tab:</strong> {{ activeTab }}</p>
        <p><strong>Total Tabs:</strong> {{ tabs.length }}</p>
        <p><strong>Available Tabs:</strong> {{ tabs.map(t => t.id).join(', ') }}</p>
        <p><strong>Component Status:</strong> {{ componentStatus }}</p>
        <p><strong>Last Update:</strong> {{ lastUpdate }}</p>
      </div>
    </div>
  `,
    styles: [`
    .simple-tabs {
      padding: 20px;
      background: #f0f0f0;
      border-radius: 8px;
      margin: 20px;
    }
    
    .tab-buttons {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }
    
    .tab-button {
      padding: 10px 20px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    }
    
    .tab-button:hover {
      background: #0056b3;
    }
    
    .tab-button.active {
      background: #28a745;
      font-weight: bold;
    }
    
    .tab-content {
      background: white;
      padding: 20px;
      border-radius: 4px;
      min-height: 200px;
    }
    
    .tab-panel h3 {
      color: #333;
      margin-top: 0;
    }
    
    .tab-panel.error {
      background: #ffe6e6;
      border: 2px solid #ff0000;
    }
    
    .tab-panel.error h3 {
      color: #cc0000;
    }
    
    .debug-panel {
      background: #e9ecef;
      padding: 15px;
      margin-top: 20px;
      border-radius: 4px;
      font-family: monospace;
    }
    
    .debug-panel h4 {
      margin-top: 0;
      color: #495057;
    }
    
    .debug-panel p {
      margin: 5px 0;
      font-size: 14px;
    }
  `]
})
styles: [`
    .simple-tabs {
      padding: 20px;
      background: #f0f0f0;
      border-radius: 8px;
      margin: 20px;
    }
    
    .tab-buttons {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }
    
    .tab-button {
      padding: 10px 20px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    }
    
    .tab-button:hover {
      background: #0056b3;
    }
    
    .tab-button.active {
      background: #28a745;
      font-weight: bold;
    }
    
    .tab-content {
      background: white;
      padding: 20px;
      border-radius: 4px;
      min-height: 200px;
    }
    
    .tab-panel h3 {
      color: #333;
      margin-top: 0;
    }
    
    .tab-panel.error {
      background: #ffe6e6;
      border: 2px solid #ff0000;
    }
    
    .tab-panel.error h3 {
      color: #cc0000;
    }
    
    .debug-panel {
      background: #e9ecef;
      padding: 15px;
      margin-top: 20px;
      border-radius: 4px;
      font-family: monospace;
    }
    
    .debug-panel h4 {
      margin-top: 0;
      color: #495057;
    }
    
    .debug-panel p {
      margin: 5px 0;
      font-size: 14px;
    }
  `]
})
export class SimpleTabsComponent implements OnInit, OnDestroy {
    tabs: SimpleTabConfig[] = [];
    activeTab: string = '';
    componentStatus: string = 'Initializing...';
    lastUpdate: string = new Date().toLocaleTimeString();

    private subscription: Subscription = new Subscription();

    constructor(private tabService: SimpleTabService) {
        console.log('🚀 SimpleTabsComponent constructor called');
    }

    ngOnInit() {
        console.log('🔄 SimpleTabsComponent ngOnInit started');

        // Load tabs
        this.tabs = this.tabService.getTabs();
        console.log('📋 Loaded tabs:', this.tabs);

        // Subscribe to active tab changes
        this.subscription.add(
            this.tabService.activeTab$.subscribe(activeTabId => {
                console.log('🔔 Received active tab change:', activeTabId);
                this.activeTab = activeTabId;
                this.lastUpdate = new Date().toLocaleTimeString();
                this.updateComponentStatus();
                this.performSelfCheck();
            })
        );

        // Initial self-check
        setTimeout(() => {
            this.performSelfCheck();
        }, 1000);

        console.log('✅ SimpleTabsComponent ngOnInit completed');
    }

    ngOnDestroy() {
        console.log('🔚 SimpleTabsComponent ngOnDestroy called');
        this.subscription.unsubscribe();
    }

    selectTab(tabId: string) {
        console.log('🖱️ Tab clicked:', tabId);
        console.log('🔍 Current active tab before click:', this.activeTab);

        this.tabService.setActiveTab(tabId);

        // Verify the change
        setTimeout(() => {
            console.log('🔍 Active tab after click:', this.activeTab);
            this.performSelfCheck();
        }, 200);
    }

    private updateComponentStatus() {
        const tabExists = this.tabs.find(t => t.id === this.activeTab);
        if (tabExists) {
            this.componentStatus = `✅ Active: ${this.activeTab}`;
        } else {
            this.componentStatus = `❌ Invalid: ${this.activeTab}`;
        }
        console.log('📊 Component status updated:', this.componentStatus);
    }

    private performSelfCheck() {
        console.log('🤖 SELF-CHECK: Starting component diagnostics...');
        console.log('🔍 Active tab value:', this.activeTab);
        console.log('🔍 Tabs array length:', this.tabs.length);
        console.log('🔍 Does active tab exist in tabs?', this.tabs.some(t => t.id === this.activeTab));

        // Check which *ngIf conditions would be true
        const conditions = {
            'tab1': this.activeTab === 'tab1',
            'tab2': this.activeTab === 'tab2',
            'tab3': this.activeTab === 'tab3',
            'error': !this.activeTab || (this.activeTab !== 'tab1' && this.activeTab !== 'tab2' && this.activeTab !== 'tab3')
        };

        console.log('🔍 *ngIf conditions:', conditions);
        console.log('🔍 Which condition is true?', Object.entries(conditions).filter(([key, value]) => value));

        const trueConditions = Object.entries(conditions).filter(([key, value]) => value);
        if (trueConditions.length === 1) {
            console.log('✅ SELF-CHECK: Exactly one condition is true -', trueConditions[0][0]);
        } else if (trueConditions.length === 0) {
            console.error('❌ SELF-CHECK: No conditions are true - no content will show');
        } else {
            console.error('❌ SELF-CHECK: Multiple conditions are true - this should not happen');
        }
    }
}
