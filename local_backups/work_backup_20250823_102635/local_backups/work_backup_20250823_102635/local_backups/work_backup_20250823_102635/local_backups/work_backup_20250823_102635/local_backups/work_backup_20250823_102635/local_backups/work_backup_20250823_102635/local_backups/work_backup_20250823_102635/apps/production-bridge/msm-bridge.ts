// ============================================================================
// PRODUCTION MSM BRIDGE
// ============================================================================
// 
// Production-ready bridge for MSM → Novaxe communication
// Copy this into your MSM app for real integration
//
// USAGE:
// 1. Copy this file to your MSM app (e.g., src/bridge/msm-bridge.ts)
// 2. Import and use in your components
// 3. Replace mock data with real MSM chord output
//
// ============================================================================

export interface ChordData {
  root: string;
  quality: string;
  intervals: number[];
  midi?: number[];
  timestamp: number;
}

export interface ScaleData {
  root: string;
  type: string;
  notes: string[];
  intervals: number[];
  timestamp: number;
}

export interface ProgressionData {
  key: string;
  chords: string[];
  romanNumerals: string[];
  timestamp: number;
}

export interface BridgeMessage {
  type: 'CHORD_UPDATE' | 'SCALE_UPDATE' | 'PROGRESSION_UPDATE';
  source: 'msm';
  payload: ChordData | ScaleData | ProgressionData;
  timestamp: number;
  version: string;
}

export class MSMBridge {
  private targetWindow: Window | null = null;
  private messageQueue: BridgeMessage[] = [];
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  constructor() {
    this.initializeConnection();
    this.setupHeartbeat();
  }
  
  private initializeConnection() {
    // Try to find Novaxe window
    if (window.opener) {
      this.targetWindow = window.opener;
      this.isConnected = true;
      console.log('MSM Bridge: Connected to Novaxe via window.opener');
    } else {
      // For development, try to connect to Novaxe on different port
      this.tryConnectToNovaxe();
    }
  }
  
  private tryConnectToNovaxe() {
    // Try to connect to Novaxe on port 4200
    try {
      const novaxeUrl = 'http://localhost:4200';
      const testWindow = window.open(novaxeUrl, '_blank', 'width=100,height=100');
      
      if (testWindow) {
        this.targetWindow = testWindow;
        this.isConnected = true;
        console.log('MSM Bridge: Connected to Novaxe on port 4200');
      } else {
        console.log('MSM Bridge: Novaxe not found, using localStorage fallback');
        this.setupLocalStorageFallback();
      }
    } catch (error) {
      console.log('MSM Bridge: Connection failed, using localStorage fallback');
      this.setupLocalStorageFallback();
    }
  }
  
  private setupLocalStorageFallback() {
    // Use localStorage as fallback for development
    this.isConnected = false;
    console.log('MSM Bridge: Using localStorage fallback mode');
  }
  
  private setupHeartbeat() {
    // Send heartbeat every 30 seconds to maintain connection
    setInterval(() => {
      if (this.isConnected && this.targetWindow) {
        this.sendHeartbeat();
      }
    }, 30000);
  }
  
  private sendHeartbeat() {
    const heartbeat = {
      type: 'HEARTBEAT',
      source: 'msm',
      timestamp: Date.now(),
      version: '1.0.0'
    };
    
    this.targetWindow?.postMessage(heartbeat, '*');
  }
  
  // Send chord data to Novaxe
  sendChord(chordData: Omit<ChordData, 'timestamp'>) {
    const message: BridgeMessage = {
      type: 'CHORD_UPDATE',
      source: 'msm',
      payload: {
        ...chordData,
        timestamp: Date.now()
      },
      timestamp: Date.now(),
      version: '1.0.0'
    };
    
    this.sendMessage(message);
  }
  
  // Send scale data to Novaxe
  sendScale(scaleData: Omit<ScaleData, 'timestamp'>) {
    const message: BridgeMessage = {
      type: 'SCALE_UPDATE',
      source: 'msm',
      payload: {
        ...scaleData,
        timestamp: Date.now()
      },
      timestamp: Date.now(),
      version: '1.0.0'
    };
    
    this.sendMessage(message);
  }
  
  // Send progression data to Novaxe
  sendProgression(progressionData: Omit<ProgressionData, 'timestamp'>) {
    const message: BridgeMessage = {
      type: 'PROGRESSION_UPDATE',
      source: 'msm',
      payload: {
        ...progressionData,
        timestamp: Date.now()
      },
      timestamp: Date.now(),
      version: '1.0.0'
    };
    
    this.sendMessage(message);
  }
  
  private sendMessage(message: BridgeMessage) {
    console.log('MSM → Novaxe:', message);
    
    // Try PostMessage first
    if (this.isConnected && this.targetWindow) {
      try {
        this.targetWindow.postMessage(message, '*');
        return;
      } catch (error) {
        console.warn('MSM Bridge: PostMessage failed, falling back to localStorage');
        this.isConnected = false;
      }
    }
    
    // Fallback to localStorage
    this.sendViaLocalStorage(message);
  }
  
  private sendViaLocalStorage(message: BridgeMessage) {
    const storageKey = `msm-to-novaxe-${Date.now()}`;
    localStorage.setItem(storageKey, JSON.stringify(message));
    
    // Trigger storage event for Novaxe
    window.dispatchEvent(new StorageEvent('storage', {
      key: storageKey,
      newValue: JSON.stringify(message)
    }));
    
    // Clean up old messages (keep last 10)
    this.cleanupOldMessages();
  }
  
  private cleanupOldMessages() {
    const keys = Object.keys(localStorage);
    const msmKeys = keys.filter(key => key.startsWith('msm-to-novaxe-'));
    
    if (msmKeys.length > 10) {
      msmKeys
        .sort()
        .slice(0, msmKeys.length - 10)
        .forEach(key => localStorage.removeItem(key));
    }
  }
  
  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      targetWindow: !!this.targetWindow,
      fallbackMode: !this.isConnected
    };
  }
  
  // Reconnect to Novaxe
  reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`MSM Bridge: Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      this.initializeConnection();
    } else {
      console.error('MSM Bridge: Max reconnect attempts reached');
    }
  }
}

// ============================================================================
// REACT HOOK FOR MSM BRIDGE
// ============================================================================

import { useState, useEffect, useCallback } from 'react';

export function useMSMBridge() {
  const [bridge] = useState(() => new MSMBridge());
  const [connectionStatus, setConnectionStatus] = useState(bridge.getConnectionStatus());
  const [lastSent, setLastSent] = useState<any>(null);
  
  useEffect(() => {
    // Update connection status every 5 seconds
    const interval = setInterval(() => {
      setConnectionStatus(bridge.getConnectionStatus());
    }, 5000);
    
    return () => clearInterval(interval);
  }, [bridge]);
  
  const sendChord = useCallback((chordData: Omit<ChordData, 'timestamp'>) => {
    bridge.sendChord(chordData);
    setLastSent({ type: 'chord', data: chordData, timestamp: Date.now() });
  }, [bridge]);
  
  const sendScale = useCallback((scaleData: Omit<ScaleData, 'timestamp'>) => {
    bridge.sendScale(scaleData);
    setLastSent({ type: 'scale', data: scaleData, timestamp: Date.now() });
  }, [bridge]);
  
  const sendProgression = useCallback((progressionData: Omit<ProgressionData, 'timestamp'>) => {
    bridge.sendProgression(progressionData);
    setLastSent({ type: 'progression', data: progressionData, timestamp: Date.now() });
  }, [bridge]);
  
  const reconnect = useCallback(() => {
    bridge.reconnect();
    setConnectionStatus(bridge.getConnectionStatus());
  }, [bridge]);
  
  return {
    sendChord,
    sendScale,
    sendProgression,
    connectionStatus,
    lastSent,
    reconnect
  };
}

// ============================================================================
// EXAMPLE USAGE IN MSM COMPONENT
// ============================================================================

/*
// Example: Add this to your MSM chord component

import { useMSMBridge } from '../bridge/msm-bridge';

function ChordDisplay() {
  const { sendChord, connectionStatus, lastSent } = useMSMBridge();
  
  const handleChordGenerated = (chordData: any) => {
    // Transform MSM chord data to bridge format
    const bridgeChord = {
      root: chordData.root,
      quality: chordData.quality,
      intervals: chordData.intervals,
      midi: chordData.midiNotes
    };
    
    sendChord(bridgeChord);
  };
  
  return (
    <div>
      <h3>MSM Chord Display</h3>
      
      <div style={{ margin: '10px 0', padding: '10px', background: connectionStatus.isConnected ? '#e8f5e8' : '#fff3cd' }}>
        <strong>Bridge Status:</strong> {connectionStatus.isConnected ? 'Connected' : 'Fallback Mode'}
      </div>
      
      {lastSent && (
        <div style={{ margin: '10px 0', padding: '10px', background: '#e8f5e8' }}>
          <strong>Last sent:</strong> {lastSent.type} - {JSON.stringify(lastSent.data)}
        </div>
      )}
      
      {/* Your existing MSM chord UI here */}
    </div>
  );
}
*/ 