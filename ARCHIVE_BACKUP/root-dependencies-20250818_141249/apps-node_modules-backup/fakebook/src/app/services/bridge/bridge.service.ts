import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import {
  BRIDGE_VERSION,
  BridgeEnvelope,
  isBridgeEnvelope,
  KeyPayload,
  ChordSelectionPayload,
  SelectionSyncPayload,
  CommandPayload
} from './shared-bridge-schema';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MsmBridgeService {
  private msmWindow: Window | null = null;
  private targetOrigin = this.computeDefaultOrigin();
  private allowedOrigins = this.computeAllowedOrigins();

  public isConnected$ = new BehaviorSubject<boolean>(false);
  public msmReady$ = new BehaviorSubject<boolean>(false);
  public currentKey$ = new BehaviorSubject<KeyPayload | null>(null);
  public chordSelected$ = new Subject<ChordSelectionPayload>();

  private heartbeatTimer: any = null;

  constructor(private zone: NgZone) {
    window.addEventListener('message', (event) => {
      if (!this.isFromAllowedMsm(event.origin)) return;
      const data = event.data;
      if (!isBridgeEnvelope(data)) return;
      if (data.version !== BRIDGE_VERSION) {
        console.warn('[MSM↔NOVAXE v1.0.0] Version mismatch', data.version, BRIDGE_VERSION);
      }
      this.zone.run(() => this.handleIncoming(data as BridgeEnvelope<any>));
    });
  }

  attachMsmWindow(win: Window, origin: string) {
    this.msmWindow = win;
    this.targetOrigin = this.normalizeOrigin(origin) || this.targetOrigin;
    this.send({ type: 'MSM_TO_NOVAXE', kind: 'HANDSHAKE', source: 'NOVAXE', origin: window.location.origin, payload: { hello: 'from-novaxe' } });
    this.startHeartbeat();
  }

  detach() {
    this.stopHeartbeat();
    this.msmWindow = null;
    this.isConnected$.next(false);
    this.msmReady$.next(false);
  }

  setKey(key: KeyPayload) {
    this.currentKey$.next(key);
    this.send({ type: 'NOVAXE_TO_MSM', kind: 'KEY_CHANGED', source: 'NOVAXE', origin: window.location.origin, payload: key });
  }

  emitChordSelected(sel: ChordSelectionPayload) {
    if (this.isAug6(sel.roman)) return;
    this.chordSelected$.next(sel);
    this.send({ type: 'NOVAXE_TO_MSM', kind: 'CHORD_SELECTED', source: 'NOVAXE', origin: window.location.origin, payload: sel });
  }

  sendCommand(cmd: CommandPayload) {
    this.send({ type: 'NOVAXE_TO_MSM', kind: 'COMMAND', source: 'NOVAXE', origin: window.location.origin, payload: cmd });
  }

  private handleIncoming(msg: BridgeEnvelope<any>) {
    if (msg.type === 'MSM_TO_NOVAXE') {
      switch (msg.kind) {
        case 'HANDSHAKE':
          this.isConnected$.next(true);
          this.reply('HANDSHAKE_ACK', { ok: true });
          break;
        case 'READY':
          this.msmReady$.next(true);
          this.reply('READY_ACK', { ok: true });
          break;
        case 'KEY_SET':
          this.currentKey$.next(msg.payload as KeyPayload);
          break;
        case 'SELECTION_SET': {
          const sel = msg.payload as SelectionSyncPayload;
          if (sel.slot && !this.isAug6(sel.slot)) {
            // downstream: update Novaxe UI (braid/graphs)
          }
          break;
        }
        case 'COMMAND': {
          const cmd = msg.payload as CommandPayload;
          this.reply('COMMAND_RESULT', { name: cmd.name, ok: true });
          break;
        }
        case 'HEARTBEAT':
          this.reply('HEARTBEAT_ACK', { t: Date.now() });
          break;
      }
    }
  }

  private send(partial: Omit<BridgeEnvelope<any>, 'version' | 'ts'>) {
    if (!this.msmWindow) return;
    const envelope: BridgeEnvelope<any> = { ...partial, version: BRIDGE_VERSION, ts: Date.now() };
    this.msmWindow.postMessage(envelope, this.targetOrigin);
  }

  private reply(kind: string, payload: any) {
    this.send({ type: 'NOVAXE_TO_MSM', kind, source: 'NOVAXE', origin: window.location.origin, payload });
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      this.send({ type: 'NOVAXE_TO_MSM', kind: 'HEARTBEAT', source: 'NOVAXE', origin: window.location.origin, payload: { t: Date.now() } });
    }, 10000);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = null;
  }

  private isFromAllowedMsm(origin: string) {
    return this.allowedOrigins.includes(origin);
  }

  private isAug6(roman: string) {
    const label = roman.replace(/\s+/g, '');
    return ['It+6', 'Fr+6', 'Ger+6', 'It6', 'Fr6', 'Ger6'].includes(label);
  }

  private computeDefaultOrigin(): string {
    try {
      const url = new URL(environment.msmUrl);
      return url.origin;
    } catch {
      return 'http://localhost:8080';
    }
  }

  private computeAllowedOrigins(): string[] {
    const origins = new Set<string>();
    const def = this.computeDefaultOrigin();
    origins.add(def);
    try {
      const u = new URL(environment.msmUrl);
      const isLocal = (u.hostname === 'localhost' || u.hostname === '127.0.0.1');
      const port = u.port || (u.protocol === 'https:' ? '443' : '80');
      const proto = u.protocol;
      if (isLocal) {
        origins.add(`${proto}//localhost:${port}`);
        origins.add(`${proto}//127.0.0.1:${port}`);
      }
    } catch {}
    return Array.from(origins);
  }

  private normalizeOrigin(candidate: string): string {
    try {
      return new URL(candidate).origin;
    } catch {
      return '';
    }
  }
}
