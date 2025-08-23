// ============================================================================
// PRODUCTION NOVAXE BRIDGE
// ============================================================================
// 
// Production-ready bridge for Novaxe ← MSM communication
// Copy this into your Novaxe app for real integration
//
// USAGE:
// 1. Copy this file to your Novaxe app (e.g., src/app/services/novaxe-bridge.ts)
// 2. Import and use in your components/services
// 3. Integrate with Novaxe's existing chord/scale systems
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
  type: 'CHORD_UPDATE' | 'SCALE_UPDATE' | 'PROGRESSION_UPDATE' | 'HEARTBEAT';
  source: 'msm';
  payload?: ChordData | ScaleData | ProgressionData;
  timestamp: number;
  version: string;
}

export interface BridgeStatus {
  isConnected: boolean;
  lastMessageTime: number | null;
  messageCount: number;
  errorCount: number;
  fallbackMode: boolean;
}

export class NovaxeBridge {
  private listeners: Map<string, ((data: any) => void)[]> = new Map();
  private messageQueue: BridgeMessage[] = [];
  private status: BridgeStatus = {
    isConnected: false,
    lastMessageTime: null,
    messageCount: 0,
    errorCount: 0,
    fallbackMode: false
  };
  private heartbeatInterval: any = null;
  private cleanupInterval: any = null;
  private msmWindow: Window | null = null;
  
  constructor() {
    this.initializeListeners();
    this.setupHeartbeat();
    this.setupCleanup();
    console.log('Novaxe Bridge: Initialized and listening for MSM messages');
  }
  
  private initializeListeners() {
    // Listen for PostMessage from MSM
    window.addEventListener('message', (event) => {
      this.handleMessage(event.data);
    });
    
    // Listen for localStorage changes (fallback)
    window.addEventListener('storage', (event) => {
      this.handleStorageEvent(event);
    });
    
    // Listen for custom storage events (triggered by MSM)
    window.addEventListener('storage', (event) => {
      if (event.key && event.key.startsWith('msm-to-novaxe-') && event.newValue) {
        try {
          const data = JSON.parse(event.newValue);
          this.handleMessage(data);
        } catch (error) {
          console.error('Novaxe Bridge: Failed to parse storage message:', error);
          this.status.errorCount++;
        }
      }
    });
  }

  // Launch MSM in a child window or focus existing
  openMSM(url: string) {
    try {
      if (this.msmWindow && !this.msmWindow.closed) {
        this.msmWindow.focus();
        return;
      }
      this.msmWindow = window.open(url, '_blank');
    } catch (e) {
      console.warn('Novaxe Bridge: Failed to open MSM window');
    }
  }
  
  private handleMessage(data: any) {
    if (!data || data.source !== 'msm') {
      return;
    }
    
    console.log('Novaxe ← MSM:', data);
    
    // Update status
    this.status.lastMessageTime = Date.now();
    this.status.messageCount++;
    this.status.isConnected = true;
    
    // Handle different message types
    switch (data.type) {
      case 'CHORD_UPDATE':
        this.notifyListeners('chord', data.payload);
        break;
      case 'SCALE_UPDATE':
        this.notifyListeners('scale', data.payload);
        break;
      case 'PROGRESSION_UPDATE':
        this.notifyListeners('progression', data.payload);
        break;
      case 'HEARTBEAT':
        this.handleHeartbeat(data);
        break;
      default:
        console.warn('Novaxe Bridge: Unknown message type:', data.type);
    }
  }
  
  private handleStorageEvent(event: StorageEvent) {
    if (event.key && event.key.startsWith('msm-to-novaxe-') && event.newValue) {
      try {
        const data = JSON.parse(event.newValue);
        this.handleMessage(data);
        this.status.fallbackMode = true;
      } catch (error) {
        console.error('Novaxe Bridge: Failed to parse storage event:', error);
        this.status.errorCount++;
      }
    }
  }
  
  private handleHeartbeat(data: BridgeMessage) {
    this.status.isConnected = true;
    this.status.lastMessageTime = Date.now();
    console.log('Novaxe Bridge: Received heartbeat from MSM');
  }
  
  private setupHeartbeat() {
    // Check for connection status every 10 seconds
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      if (this.status.lastMessageTime && (now - this.status.lastMessageTime) > 60000) {
        // No message for 1 minute, mark as disconnected
        this.status.isConnected = false;
        console.log('Novaxe Bridge: Connection lost, waiting for reconnection');
      }
    }, 10000);
  }
  
  private setupCleanup() {
    // Clean up old messages every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldMessages();
    }, 300000);
  }
  
  private cleanupOldMessages() {
    const keys = Object.keys(localStorage);
    const msmKeys = keys.filter(key => key.startsWith('msm-to-novaxe-'));
    
    // Remove messages older than 1 hour
    const oneHourAgo = Date.now() - 3600000;
    
    msmKeys.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        if (data.timestamp && data.timestamp < oneHourAgo) {
          localStorage.removeItem(key);
        }
      } catch (error) {
        // Remove invalid messages
        localStorage.removeItem(key);
      }
    });
  }
  
  // Subscribe to specific message types
  onChordReceived(callback: (chordData: ChordData) => void) {
    this.addListener('chord', callback);
  }
  
  onScaleReceived(callback: (scaleData: ScaleData) => void) {
    this.addListener('scale', callback);
  }
  
  onProgressionReceived(callback: (progressionData: ProgressionData) => void) {
    this.addListener('progression', callback);
  }
  
  private addListener(type: string, callback: (data: any) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(callback);
  }
  
  private notifyListeners(type: string, data: any) {
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Novaxe Bridge: Error in ${type} callback:`, error);
          this.status.errorCount++;
        }
      });
    }
  }
  
  // Get bridge status
  getStatus(): BridgeStatus {
    return { ...this.status };
  }
  
  // Clear all listeners
  clearListeners() {
    this.listeners.clear();
  }
  
  // Cleanup
  destroy() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clearListeners();
    console.log('Novaxe Bridge: Destroyed');
  }
}

// ============================================================================
// ANGULAR SERVICE FOR NOVAXE BRIDGE
// ============================================================================

import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NovaxeBridgeService implements OnDestroy {
  private bridge = new NovaxeBridge();
  private statusSubject = new BehaviorSubject<BridgeStatus>(this.bridge.getStatus());
  private chordSubject = new BehaviorSubject<ChordData | null>(null);
  private scaleSubject = new BehaviorSubject<ScaleData | null>(null);
  private progressionSubject = new BehaviorSubject<ProgressionData | null>(null);
  
  constructor() {
    this.setupBridgeListeners();
  }
  
  private setupBridgeListeners() {
    this.bridge.onChordReceived((chordData: ChordData) => {
      this.chordSubject.next(chordData);
      this.updateStatus();
    });
    
    this.bridge.onScaleReceived((scaleData: ScaleData) => {
      this.scaleSubject.next(scaleData);
      this.updateStatus();
    });
    
    this.bridge.onProgressionReceived((progressionData: ProgressionData) => {
      this.progressionSubject.next(progressionData);
      this.updateStatus();
    });
  }
  
  private updateStatus() {
    this.statusSubject.next(this.bridge.getStatus());
  }
  
  // Observables for components
  get status$(): Observable<BridgeStatus> {
    return this.statusSubject.asObservable();
  }
  
  get chord$(): Observable<ChordData | null> {
    return this.chordSubject.asObservable();
  }
  
  get scale$(): Observable<ScaleData | null> {
    return this.scaleSubject.asObservable();
  }
  
  get progression$(): Observable<ProgressionData | null> {
    return this.progressionSubject.asObservable();
  }
  
  // Get current status
  getStatus(): BridgeStatus {
    return this.bridge.getStatus();
  }
  
  // Clear all data
  clearData() {
    this.chordSubject.next(null);
    this.scaleSubject.next(null);
    this.progressionSubject.next(null);
  }
  
  ngOnDestroy() {
    this.bridge.destroy();
  }
}

// ============================================================================
// ANGULAR COMPONENT FOR BRIDGE STATUS
// ============================================================================

import { Component, OnInit, OnDestroy } from '@angular/core';
import { NovaxeBridgeService } from './novaxe-bridge.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-msm-bridge-status',
  template: `
    <div class="bridge-status" [ngClass]="statusClass">
      <h4>🎵 MSM Bridge Status</h4>
      
      <div class="status-indicators">
        <div class="indicator">
          <span class="dot" [ngClass]="status.isConnected ? 'connected' : 'disconnected'"></span>
          {{ status.isConnected ? 'Connected' : 'Disconnected' }}
        </div>
        
        <div class="indicator" *ngIf="status.fallbackMode">
          <span class="warning">⚠</span>
          Fallback Mode
        </div>
        
        <div class="indicator">
          Messages: {{ status.messageCount }}
        </div>
        
        <div class="indicator" *ngIf="status.errorCount > 0">
          Errors: {{ status.errorCount }}
        </div>
      </div>
      
      <div class="last-message" *ngIf="status.lastMessageTime">
        Last message: {{ status.lastMessageTime | date:'HH:mm:ss' }}
      </div>
    </div>
  `,
  styles: [`
    .bridge-status {
      padding: 15px;
      border-radius: 8px;
      margin: 10px 0;
      border: 2px solid;
    }
    
    .connected {
      border-color: #28a745;
      background-color: #f8fff9;
    }
    
    .disconnected {
      border-color: #dc3545;
      background-color: #fff8f8;
    }
    
    .status-indicators {
      display: flex;
      gap: 15px;
      margin: 10px 0;
      flex-wrap: wrap;
    }
    
    .indicator {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 14px;
    }
    
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    
    .dot.connected {
      background-color: #28a745;
    }
    
    .dot.disconnected {
      background-color: #dc3545;
    }
    
    .warning {
      color: #ffc107;
      font-weight: bold;
    }
    
    .last-message {
      font-size: 12px;
      color: #666;
      margin-top: 5px;
    }
  `]
})
export class MSMBridgeStatusComponent implements OnInit, OnDestroy {
  status: BridgeStatus = {
    isConnected: false,
    lastMessageTime: null,
    messageCount: 0,
    errorCount: 0,
    fallbackMode: false
  };
  
  private subscription = new Subscription();
  
  constructor(private bridgeService: NovaxeBridgeService) {}
  
  ngOnInit() {
    this.subscription.add(
      this.bridgeService.status$.subscribe(status => {
        this.status = status;
      })
    );
  }
  
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  
  get statusClass() {
    return this.status.isConnected ? 'connected' : 'disconnected';
  }
}

// ============================================================================
// EXAMPLE USAGE IN NOVAXE COMPONENT
// ============================================================================

/*
// Example: Add this to your Novaxe component

import { Component, OnInit, OnDestroy } from '@angular/core';
import { NovaxeBridgeService } from '../services/novaxe-bridge.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-msm-integration',
  template: `
    <div class="msm-integration">
      <app-msm-bridge-status></app-msm-bridge-status>
      
      <div class="received-data" *ngIf="lastChord">
        <h4>🎼 Last Chord from MSM</h4>
        <div class="chord-display">
          <strong>{{ lastChord.root }} {{ lastChord.quality }}</strong><br>
          Intervals: {{ lastChord.intervals.join(', ') }}<br>
          <small>Received: {{ lastChord.timestamp | date:'HH:mm:ss' }}</small>
        </div>
      </div>
      
      <div class="received-data" *ngIf="lastScale">
        <h4>🎵 Last Scale from MSM</h4>
        <div class="scale-display">
          <strong>{{ lastScale.root }} {{ lastScale.type }}</strong><br>
          Notes: {{ lastScale.notes.join(', ') }}<br>
          <small>Received: {{ lastScale.timestamp | date:'HH:mm:ss' }}</small>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .msm-integration {
      padding: 20px;
      border: 2px solid #007acc;
      border-radius: 8px;
      margin: 20px;
    }
    
    .received-data {
      margin: 15px 0;
      padding: 15px;
      background: #e8f5e8;
      border-radius: 4px;
    }
    
    .chord-display, .scale-display {
      margin-top: 10px;
    }
  `]
})
export class MSMIntegrationComponent implements OnInit, OnDestroy {
  lastChord: ChordData | null = null;
  lastScale: ScaleData | null = null;
  lastProgression: ProgressionData | null = null;
  
  private subscription = new Subscription();
  
  constructor(private bridgeService: NovaxeBridgeService) {}
  
  ngOnInit() {
    this.subscription.add(
      this.bridgeService.chord$.subscribe(chord => {
        this.lastChord = chord;
        if (chord) {
          this.processMSMChord(chord);
        }
      })
    );
    
    this.subscription.add(
      this.bridgeService.scale$.subscribe(scale => {
        this.lastScale = scale;
        if (scale) {
          this.processMSMScale(scale);
        }
      })
    );
    
    this.subscription.add(
      this.bridgeService.progression$.subscribe(progression => {
        this.lastProgression = progression;
        if (progression) {
          this.processMSMProgression(progression);
        }
      })
    );
  }
  
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  
  private processMSMChord(chordData: ChordData) {
    console.log('🎵 Processing MSM chord in Novaxe:', chordData);
    
    // TODO: Integrate with Novaxe's existing chord system
    // TODO: Update Novaxe's UI
    // TODO: Trigger any Novaxe-specific logic
  }
  
  private processMSMScale(scaleData: ScaleData) {
    console.log('🎵 Processing MSM scale in Novaxe:', scaleData);
    
    // TODO: Integrate with Novaxe's existing scale system
  }
  
  private processMSMProgression(progressionData: ProgressionData) {
    console.log('🎵 Processing MSM progression in Novaxe:', progressionData);
    
    // TODO: Integrate with Novaxe's existing progression system
  }
}
*/ 