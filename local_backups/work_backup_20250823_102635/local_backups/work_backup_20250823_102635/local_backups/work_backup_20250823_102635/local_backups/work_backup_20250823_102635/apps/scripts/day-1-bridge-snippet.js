// ============================================================================
// DAY 1 DRY-RUN BRIDGE SNIPPET
// ============================================================================
// 
// This is a minimal implementation to prove MSM → Novaxe communication
// in under 30 minutes. Copy these snippets into your apps.
//
// USAGE:
// 1. Add MSM snippet to your MSM app
// 2. Add Novaxe snippet to your Novaxe app  
// 3. Run both apps
// 4. Click "Send Test Chord" in MSM
// 5. Verify chord appears in Novaxe
//
// ============================================================================

// ============================================================================
// MSM SIDE (React/Vite) - Add to your MSM component
// ============================================================================

/*
// Add this to your MSM component (e.g., src/components/ChordDisplay.tsx)

import { useState } from 'react';

// Simple bridge for MSM → Novaxe communication
class MSMBridge {
  constructor() {
    this.listeners = [];
    this.targetWindow = null;
    
    // Try to find Novaxe window (adjust port if needed)
    if (window.opener) {
      this.targetWindow = window.opener;
    } else {
      // For testing, we'll use localStorage as fallback
      console.log('MSM Bridge: Using localStorage fallback');
    }
  }
  
  sendChord(chordData) {
    const message = {
      type: 'CHORD_UPDATE',
      source: 'msm',
      payload: chordData,
      timestamp: Date.now()
    };
    
    console.log('MSM → Novaxe:', message);
    
    // Try PostMessage first
    if (this.targetWindow) {
      this.targetWindow.postMessage(message, '*');
    }
    
    // Fallback to localStorage
    localStorage.setItem('msm-to-novaxe', JSON.stringify(message));
    
    // Trigger storage event for Novaxe
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'msm-to-novaxe',
      newValue: JSON.stringify(message)
    }));
  }
}

// React component with test button
function ChordDisplay() {
  const [bridge] = useState(() => new MSMBridge());
  const [lastSent, setLastSent] = useState(null);
  
  const sendTestChord = () => {
    const testChord = {
      key: "C",
      chords: ["C", "G", "Am", "F"],
      progression: "I-V-vi-IV",
      timestamp: Date.now()
    };
    
    bridge.sendChord(testChord);
    setLastSent(testChord);
    
    console.log('✅ Test chord sent from MSM');
  };
  
  return (
    <div>
      <h3>MSM Chord Display</h3>
      <button onClick={sendTestChord} style={{ padding: '10px', margin: '10px' }}>
        Send Test Chord to Novaxe
      </button>
      
      {lastSent && (
        <div style={{ margin: '10px', padding: '10px', background: '#e8f5e8' }}>
          <strong>Last sent:</strong> {lastSent.key} - {lastSent.chords.join(', ')}
        </div>
      )}
    </div>
  );
}

export default ChordDisplay;
*/

// ============================================================================
// NOVAXE SIDE (Angular) - Add to your Novaxe component
// ============================================================================

/*
// Add this to your Novaxe component (e.g., src/app/components/msm-integration.component.ts)

import { Component, OnInit, OnDestroy } from '@angular/core';

// Simple bridge for Novaxe ← MSM communication
class NovaxeBridge {
  private listeners: ((data: any) => void)[] = [];
  
  constructor() {
    // Listen for PostMessage from MSM
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'CHORD_UPDATE') {
        console.log('Novaxe ← MSM:', event.data);
        this.notifyListeners(event.data);
      }
    });
    
    // Listen for localStorage changes (fallback)
    window.addEventListener('storage', (event) => {
      if (event.key === 'msm-to-novaxe' && event.newValue) {
        try {
          const data = JSON.parse(event.newValue);
          console.log('Novaxe ← MSM (storage):', data);
          this.notifyListeners(data);
        } catch (e) {
          console.error('Failed to parse MSM message:', e);
        }
      }
    });
    
    console.log('Novaxe Bridge: Listening for MSM messages');
  }
  
  onChordReceived(callback: (data: any) => void) {
    this.listeners.push(callback);
  }
  
  private notifyListeners(data: any) {
    this.listeners.forEach(listener => listener(data));
  }
}

@Component({
  selector: 'app-msm-integration',
  template: `
    <div style="padding: 20px; border: 2px solid #007acc; border-radius: 8px; margin: 20px;">
      <h3>🎵 MSM Integration Test</h3>
      
      <div *ngIf="lastReceived" style="margin: 10px 0; padding: 10px; background: #e8f5e8; border-radius: 4px;">
        <strong>Received from MSM:</strong><br>
        Key: {{ lastReceived.payload.key }}<br>
        Chords: {{ lastReceived.payload.chords.join(', ') }}<br>
        Progression: {{ lastReceived.payload.progression }}<br>
        <small>Time: {{ lastReceived.timestamp | date:'HH:mm:ss' }}</small>
      </div>
      
      <div *ngIf="!lastReceived" style="color: #666; font-style: italic;">
        Waiting for chord from MSM... Click "Send Test Chord" in MSM app
      </div>
      
      <div style="margin-top: 10px; font-size: 12px; color: #666;">
        Bridge Status: {{ bridgeStatus }}
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      margin: 20px;
    }
  `]
})
export class MSMIntegrationComponent implements OnInit, OnDestroy {
  private bridge = new NovaxeBridge();
  lastReceived: any = null;
  bridgeStatus = 'Listening for MSM messages...';
  
  ngOnInit() {
    this.bridge.onChordReceived((data) => {
      this.lastReceived = data;
      this.bridgeStatus = `Received chord at ${new Date().toLocaleTimeString()}`;
      
      // Optional: Trigger Novaxe's chord processing
      this.processMSMChord(data.payload);
    });
  }
  
  ngOnDestroy() {
    // Clean up if needed
  }
  
  private processMSMChord(chordData: any) {
    console.log('🎵 Processing MSM chord in Novaxe:', chordData);
    
    // Here you would integrate with Novaxe's existing chord system
    // For now, just log it
    console.log('Key:', chordData.key);
    console.log('Chords:', chordData.chords);
    console.log('Progression:', chordData.progression);
    
    // TODO: Map to Novaxe's chord format
    // TODO: Update Novaxe's UI
    // TODO: Trigger any Novaxe-specific logic
  }
}
*/

// ============================================================================
// TESTING INSTRUCTIONS
// ============================================================================

/*
STEP 1: Add MSM snippet to your MSM app
- Copy the MSM code into a component
- Add the component to your MSM app
- Start MSM: npm run dev (port 5173)

STEP 2: Add Novaxe snippet to your Novaxe app  
- Copy the Novaxe code into a component
- Add the component to your Novaxe app
- Start Novaxe: npm start (port 4200)

STEP 3: Test the bridge
- Open both apps in browser
- Click "Send Test Chord" in MSM
- Verify chord appears in Novaxe
- Check browser console for bridge logs

STEP 4: Verify success
- MSM console: "✅ Test chord sent from MSM"
- Novaxe console: "🎵 Processing MSM chord in Novaxe"
- Novaxe UI: Shows received chord data

STEP 5: Clean up
- Remove test components
- Commit working pattern
- Proceed with real integration
*/

// ============================================================================
// TROUBLESHOOTING
// ============================================================================

/*
ISSUE: Messages not received
- Check browser console for errors
- Verify both apps are running
- Try localStorage fallback
- Check CORS settings

ISSUE: PostMessage not working
- Ensure both apps are on same domain
- Try different ports (localhost:5173, localhost:4200)
- Use localStorage fallback

ISSUE: Component not showing
- Check component is added to app
- Verify selector is correct
- Check for TypeScript errors

ISSUE: Bridge not initializing
- Check console for initialization logs
- Verify event listeners are added
- Check for JavaScript errors
*/

console.log('🎯 Day 1 Bridge Snippet loaded');
console.log('📋 Copy the code blocks above into your apps');
console.log('🚀 Test the MSM → Novaxe communication pattern'); 