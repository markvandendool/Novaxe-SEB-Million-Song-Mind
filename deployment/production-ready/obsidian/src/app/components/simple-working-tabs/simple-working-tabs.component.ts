import { Component, OnInit } from '@angular/core';

export interface SimpleTab {
  id: string;
  name: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-simple-working-tabs',
  template: `
    <div class="simple-tabs-container">
      <!-- Tab Navigation -->
      <div class="tab-navigation">
        <button 
          *ngFor="let tab of tabs" 
          class="tab-button"
          [class.active]="activeTabId === tab.id"
          (click)="selectTab(tab.id)"
          type="button">
          <span class="tab-icon">{{ tab.icon }}</span>
          <span class="tab-name">{{ tab.name }}</span>
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Editor Tab -->
        <div *ngIf="activeTabId === 'editor'" class="tab-panel">
          <h2>📝 Score Editor</h2>
          <p class="tab-description">Create and edit musical compositions with professional-grade tools.</p>
          <div class="content-placeholder">
            <h3>Musical Staff</h3>
            <div class="staff-lines">
              <div class="staff-line"></div>
              <div class="staff-line"></div>
              <div class="staff-line"></div>
              <div class="staff-line"></div>
              <div class="staff-line"></div>
            </div>
            <p>This is where the actual editor component will be integrated.</p>
            <button class="action-button">New Composition</button>
            <button class="action-button">Load Score</button>
          </div>
        </div>

        <!-- Metro Tab -->
        <div *ngIf="activeTabId === 'metro'" class="tab-panel">
          <h2>🥁 Metronome</h2>
          <p class="tab-description">Keep perfect time with precision rhythm tools.</p>
          <div class="content-placeholder">
            <h3>Tempo Control</h3>
            <div class="tempo-display">BPM: 120</div>
            <div class="metronome-visual">
              <div class="pendulum"></div>
            </div>
            <p>This is where the actual metronome component will be integrated.</p>
            <button class="action-button">Start/Stop</button>
            <button class="action-button">Tap Tempo</button>
          </div>
        </div>

        <!-- Cubes Tab -->
        <div *ngIf="activeTabId === 'cubes'" class="tab-panel cubes-panel">
          <h2>🎮 3D Cubes Arena</h2>
          <p class="tab-description">Professional OBS-ready 3D musical visualization with advanced lighting and interactions.</p>
          <div class="cubes-iframe-wrapper">
            <iframe 
              src="http://127.0.0.1:8087/obs-cubes/index.html?debug=1&embedded=true"
              width="100%" 
              height="600px"
              frameborder="0"
              allow="autoplay; fullscreen"
              loading="lazy"
              title="Professional 3D Musical Cubes">
            </iframe>
          </div>
        </div>

        <!-- Circle of Fifths Tab -->
        <div *ngIf="activeTabId === 'circle'" class="tab-panel">
          <h2>⭕ Circle of Fifths</h2>
          <p class="tab-description">Master musical relationships and key signatures.</p>
          <div class="content-placeholder">
            <h3>Key Relationships</h3>
            <div class="circle-preview">
              <div class="circle-center">C</div>
              <div class="key-positions">
                <span>G</span><span>D</span><span>A</span><span>E</span>
                <span>B</span><span>F#</span><span>Db</span><span>Ab</span>
                <span>Eb</span><span>Bb</span><span>F</span>
              </div>
            </div>
            <p>This is where the actual circle component will be integrated.</p>
            <button class="action-button">Major Keys</button>
            <button class="action-button">Minor Keys</button>
          </div>
        </div>

        <!-- Braid Tab -->
        <div *ngIf="activeTabId === 'braid'" class="tab-panel">
          <h2>🌊 Harmonic Braid</h2>
          <p class="tab-description">Navigate the interconnected web of musical harmonies.</p>
          <div class="content-placeholder">
            <h3>Musical Threads</h3>
            <div class="braid-preview">
              <div class="braid-strand strand-1"></div>
              <div class="braid-strand strand-2"></div>
              <div class="braid-strand strand-3"></div>
            </div>
            <p>This is where the actual braid component will be integrated.</p>
            <button class="action-button">Show Threads</button>
            <button class="action-button">Analyze Harmony</button>
          </div>
        </div>

        <!-- Dictionary Tab -->
        <div *ngIf="activeTabId === 'dictionary'" class="tab-panel">
          <h2>📚 Chord Library</h2>
          <p class="tab-description">Explore an extensive library of musical knowledge.</p>
          <div class="content-placeholder">
            <h3>Chord Database</h3>
            <div class="chord-list">
              <div class="chord-item">C Major</div>
              <div class="chord-item">G7</div>
              <div class="chord-item">Am</div>
              <div class="chord-item">F Major</div>
            </div>
            <p>This is where the actual dictionary component will be integrated.</p>
            <button class="action-button">Search Chords</button>
            <button class="action-button">Browse Scales</button>
          </div>
        </div>

        <!-- Options Tab -->
        <div *ngIf="activeTabId === 'options'" class="tab-panel">
          <h2>⚙️ Settings</h2>
          <p class="tab-description">Configure application preferences and settings.</p>
          <div class="content-placeholder">
            <h3>Configuration</h3>
            <div class="settings-list">
              <div class="setting-item">Audio Settings</div>
              <div class="setting-item">Display Options</div>
              <div class="setting-item">MIDI Configuration</div>
              <div class="setting-item">Key Bindings</div>
            </div>
            <p>This is where the actual options component will be integrated.</p>
            <button class="action-button">Save Settings</button>
            <button class="action-button">Reset Defaults</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .simple-tabs-container {
      height: 100vh;
      display: flex;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .tab-navigation {
      width: 80px;
      background: rgba(0, 0, 0, 0.3);
      display: flex;
      flex-direction: column;
      padding: 20px 0;
      border-right: 2px solid rgba(255, 255, 255, 0.1);
    }

    .tab-button {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 16px 8px;
      margin: 8px;
      border: none;
      background: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.7);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      min-height: 80px;
    }

    .tab-button:hover {
      background: rgba(255, 255, 255, 0.2);
      color: rgba(255, 255, 255, 0.9);
      transform: translateX(4px);
    }

    .tab-button.active {
      background: linear-gradient(45deg, #00D4FF, #0099CC);
      color: #ffffff;
      font-weight: 600;
      transform: translateX(8px);
      box-shadow: 0 4px 20px rgba(0, 212, 255, 0.3);
    }

    .tab-icon {
      font-size: 24px;
    }

    .tab-name {
      font-size: 10px;
      font-weight: 600;
      text-align: center;
      line-height: 1.2;
    }

    .tab-content {
      flex: 1;
      padding: 40px;
      overflow-y: auto;
    }

    .tab-panel {
      max-width: 1200px;
      margin: 0 auto;
    }

    .tab-panel h2 {
      font-size: 36px;
      font-weight: 700;
      margin: 0 0 16px 0;
      background: linear-gradient(45deg, #00D4FF, #BB00FF);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .tab-description {
      font-size: 18px;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 40px;
      line-height: 1.6;
    }

    .content-placeholder {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 32px;
      backdrop-filter: blur(10px);
    }

    .content-placeholder h3 {
      color: #00D4FF;
      font-size: 24px;
      margin: 0 0 24px 0;
    }

    .content-placeholder p {
      color: rgba(255, 255, 255, 0.7);
      margin: 24px 0;
      line-height: 1.6;
    }

    .action-button {
      background: linear-gradient(45deg, rgba(0, 212, 255, 0.2), rgba(187, 0, 255, 0.2));
      border: 2px solid rgba(0, 212, 255, 0.4);
      color: #ffffff;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      margin: 8px 16px 8px 0;
      transition: all 0.3s ease;
    }

    .action-button:hover {
      background: linear-gradient(45deg, rgba(0, 212, 255, 0.4), rgba(187, 0, 255, 0.4));
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0, 212, 255, 0.3);
    }

    /* Cubes Integration Styles */
    .cubes-iframe-wrapper {
      width: 100%;
      height: 600px;
      border-radius: 12px;
      overflow: hidden;
      margin: 20px 0;
      box-shadow: 0 8px 32px rgba(0, 212, 255, 0.2);
      border: 2px solid rgba(0, 212, 255, 0.3);
      background: linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(0, 34, 68, 0.6));
    }

    .cubes-iframe-wrapper iframe {
      width: 100%;
      height: 100%;
      border: none;
      background: transparent;
      display: block;
    }

    /* Specific Content Styles */
    .staff-lines {
      margin: 20px 0;
    }

    .staff-line {
      height: 2px;
      background: rgba(255, 255, 255, 0.3);
      margin: 12px 0;
    }

    .tempo-display {
      font-size: 48px;
      font-weight: 700;
      color: #00D4FF;
      text-align: center;
      margin: 20px 0;
    }

    .metronome-visual {
      display: flex;
      justify-content: center;
      margin: 30px 0;
    }

    .pendulum {
      width: 4px;
      height: 80px;
      background: linear-gradient(to bottom, #FF3333, #CC0000);
      border-radius: 2px;
    }

    .cubes-preview {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin: 30px 0;
    }

    .cube-mock {
      width: 60px;
      height: 60px;
      background: linear-gradient(45deg, #00D4FF, #0099CC);
      border-radius: 8px;
      animation: cubeFloat 3s ease-in-out infinite;
    }

    .cube-mock.cube-2 {
      animation-delay: 1s;
    }

    .cube-mock.cube-3 {
      animation-delay: 2s;
    }

    @keyframes cubeFloat {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }

    .circle-preview {
      position: relative;
      width: 200px;
      height: 200px;
      margin: 30px auto;
    }

    .circle-center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 50px;
      height: 50px;
      background: linear-gradient(45deg, #FFD700, #FFAA00);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: #000;
    }

    .key-positions {
      display: flex;
      justify-content: space-around;
      align-items: center;
      height: 100%;
    }

    .key-positions span {
      background: rgba(0, 212, 255, 0.2);
      border: 1px solid rgba(0, 212, 255, 0.4);
      padding: 8px;
      border-radius: 50%;
      min-width: 30px;
      text-align: center;
      font-weight: 600;
    }

    .braid-preview {
      height: 100px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 30px 0;
    }

    .braid-strand {
      width: 200px;
      height: 4px;
      position: absolute;
      border-radius: 2px;
    }

    .strand-1 {
      background: linear-gradient(45deg, #BB00FF, #7700BB);
      transform: rotate(0deg);
    }

    .strand-2 {
      background: linear-gradient(45deg, #00D4FF, #0099CC);
      transform: rotate(120deg);
    }

    .strand-3 {
      background: linear-gradient(45deg, #FFD700, #FFAA00);
      transform: rotate(240deg);
    }

    .chord-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 12px;
      margin: 20px 0;
    }

    .chord-item {
      background: rgba(0, 255, 136, 0.1);
      border: 1px solid rgba(0, 255, 136, 0.3);
      padding: 16px;
      border-radius: 8px;
      text-align: center;
      font-weight: 600;
    }

    .settings-list {
      display: grid;
      gap: 12px;
      margin: 20px 0;
    }

    .setting-item {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 16px;
      border-radius: 8px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .tab-navigation {
        width: 60px;
      }
      
      .tab-name {
        font-size: 8px;
      }
      
      .tab-content {
        padding: 20px;
      }
      
      .tab-panel h2 {
        font-size: 28px;
      }
    }
  `],
  standalone: false
})
export class SimpleWorkingTabsComponent implements OnInit {
  
  activeTabId = 'editor'; // Default to editor tab

  tabs: SimpleTab[] = [
    {
      id: 'editor',
      name: 'Editor',
      icon: '📝',
      description: 'Score Editor - Create musical compositions'
    },
    {
      id: 'metro',
      name: 'Metro',
      icon: '🥁',
      description: 'Metronome - Keep perfect time'
    },
    {
      id: 'cubes',
      name: 'Cubes',
      icon: '🎮',
      description: '3D Cubes - Interactive musical visualization'
    },
    {
      id: 'circle',
      name: 'Circle',
      icon: '⭕',
      description: 'Circle of Fifths - Musical relationships'
    },
    {
      id: 'braid',
      name: 'Braid',
      icon: '🌊',
      description: 'Harmonic Braid - Musical fabric'
    },
    {
      id: 'dictionary',
      name: 'Dictionary',
      icon: '📚',
      description: 'Chord Library - Musical knowledge'
    },
    {
      id: 'options',
      name: 'Options',
      icon: '⚙️',
      description: 'Settings - Configure preferences'
    }
  ];

  constructor() { 
    console.log('✅ SimpleWorkingTabsComponent initialized');
  }

  ngOnInit(): void {
    console.log('✅ SimpleWorkingTabsComponent ready with', this.tabs.length, 'tabs');
  }

  selectTab(tabId: string): void {
    console.log('🎯 Tab selected:', tabId);
    this.activeTabId = tabId;
  }

  getActiveTab(): SimpleTab | undefined {
    return this.tabs.find(tab => tab.id === this.activeTabId);
  }
}
