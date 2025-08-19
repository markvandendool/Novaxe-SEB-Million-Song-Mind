// ============================================================================
// MSM BRIDGE RECEIVER - ISOLATED WORKING ENVIRONMENT
// ============================================================================
//
// This bridge receiver matches the Angular bridge schema discovered in the
// forensic investigation. It implements the exact protocol expected by
// the Novaxe Angular iframe integration.
//
// PROTOCOL VERSION: "1.0.0" (matches shared-bridge-schema.ts)
// ============================================================================

export const BRIDGE_VERSION = "1.0.0";

export type BridgeChannel = "MSM_TO_NOVAXE" | "NOVAXE_TO_MSM";

export type MsmToNovaxeKind =
    | "HANDSHAKE"
    | "HEARTBEAT"
    | "READY"
    | "KEY_SET"
    | "SELECTION_SET"
    | "COMMAND";

export type NovaxeToMsmKind =
    | "HANDSHAKE_ACK"
    | "HEARTBEAT_ACK"
    | "READY_ACK"
    | "KEY_CHANGED"
    | "CHORD_SELECTED"
    | "SELECTION_SYNC"
    | "COMMAND_RESULT";

export interface BridgeEnvelope<TPayload> {
    version: string;
    type: BridgeChannel;
    kind: string;
    nonce?: string;
    ts: number;
    source: "MSM" | "NOVAXE";
    origin: string;
    payload: TPayload;
}

export interface KeyPayload {
    key: string;
    mode?: "major" | "minor";
}

export interface ChordSelectionPayload {
    roman: string;
    key?: string;
    source: "braid" | "graph" | "msm-chart";
}

export interface SelectionSyncPayload {
    slot: string;
    selected: boolean;
    key?: string;
    reason?: string;
}

export interface CommandPayload {
    name: "playChord" | "highlightNode" | "setKey" | "ping";
    args?: Record<string, unknown>;
}

export interface CommandResultPayload {
    name: string;
    ok: boolean;
    error?: string;
}

export function isBridgeEnvelope(x: any): x is BridgeEnvelope<any> {
    return (
        x && typeof x === "object" && typeof x.version === "string" &&
        typeof x.type === "string" && typeof x.kind === "string" &&
        typeof x.ts === "number" && x.payload !== undefined
    );
}

// ============================================================================
// MSM BRIDGE RECEIVER CLASS
// ============================================================================

export class MSMBridgeReceiver {
    private isConnected = false;
    private novaxeOrigin = 'http://localhost:4200';
    private heartbeatTimer: NodeJS.Timeout | null = null;

    // Event callbacks
    public onConnected?: () => void;
    public onDisconnected?: () => void;
    public onKeyChanged?: (key: KeyPayload) => void;
    public onChordSelected?: (chord: ChordSelectionPayload) => void;
    public onCommand?: (command: CommandPayload) => void;

    constructor() {
        this.initializeReceiver();
    }

    private initializeReceiver() {
        console.log('🔌 MSM Bridge Receiver: Initializing...');

        // Listen for PostMessage events from Angular iframe parent
        window.addEventListener('message', (event) => {
            if (!this.isFromNovaxe(event.origin)) {
                return; // Ignore messages from unknown origins
            }

            const data = event.data;
            if (!isBridgeEnvelope(data)) {
                return; // Ignore non-bridge messages
            }

            if (data.version !== BRIDGE_VERSION) {
                console.warn('⚠️ MSM Bridge: Version mismatch', data.version, 'vs', BRIDGE_VERSION);
            }

            this.handleIncomingMessage(data as BridgeEnvelope<any>);
        });

        // Send READY message to indicate MSM is loaded and ready
        this.sendReady();
        console.log('✅ MSM Bridge Receiver: Ready and listening');
    }

    private isFromNovaxe(origin: string): boolean {
        return origin === this.novaxeOrigin;
    }

    private handleIncomingMessage(msg: BridgeEnvelope<any>) {
        console.log('📨 MSM ← NOVAXE:', msg);

        if (msg.type === 'NOVAXE_TO_MSM') {
            switch (msg.kind) {
                case 'HANDSHAKE':
                    console.log('🤝 MSM Bridge: Handshake received from Novaxe');
                    this.isConnected = true;
                    this.reply('HANDSHAKE_ACK', { hello: 'from-msm' });
                    this.onConnected?.();
                    break;

                case 'HEARTBEAT':
                    console.log('💓 MSM Bridge: Heartbeat from Novaxe');
                    this.reply('HEARTBEAT_ACK', { t: Date.now() });
                    break;

                case 'KEY_CHANGED':
                    console.log('🎵 MSM Bridge: Key change from Novaxe');
                    const keyPayload = msg.payload as KeyPayload;
                    this.onKeyChanged?.(keyPayload);
                    break;

                case 'CHORD_SELECTED':
                    console.log('🎹 MSM Bridge: Chord selection from Novaxe');
                    const chordPayload = msg.payload as ChordSelectionPayload;
                    this.onChordSelected?.(chordPayload);
                    break;

                case 'COMMAND':
                    console.log('⚡ MSM Bridge: Command from Novaxe');
                    const commandPayload = msg.payload as CommandPayload;
                    this.onCommand?.(commandPayload);
                    this.reply('COMMAND_RESULT', { name: commandPayload.name, ok: true });
                    break;
            }
        }
    }

    private send(partial: Omit<BridgeEnvelope<any>, 'version' | 'ts'>) {
        if (!window.parent || window.parent === window) {
            console.warn('⚠️ MSM Bridge: No parent window found for communication');
            return;
        }

        const envelope: BridgeEnvelope<any> = {
            ...partial,
            version: BRIDGE_VERSION,
            ts: Date.now()
        };

        console.log('📤 MSM → NOVAXE:', envelope);
        window.parent.postMessage(envelope, this.novaxeOrigin);
    }

    private reply(kind: string, payload: any) {
        this.send({
            type: 'MSM_TO_NOVAXE',
            kind,
            source: 'MSM',
            origin: window.location.origin,
            payload
        });
    }

    // Public methods for MSM to communicate with Novaxe
    public sendReady() {
        this.send({
            type: 'MSM_TO_NOVAXE',
            kind: 'READY',
            source: 'MSM',
            origin: window.location.origin,
            payload: { ready: true, timestamp: Date.now() }
        });
    }

    public setKey(key: KeyPayload) {
        this.send({
            type: 'MSM_TO_NOVAXE',
            kind: 'KEY_SET',
            source: 'MSM',
            origin: window.location.origin,
            payload: key
        });
    }

    public setSelection(selection: SelectionSyncPayload) {
        this.send({
            type: 'MSM_TO_NOVAXE',
            kind: 'SELECTION_SET',
            source: 'MSM',
            origin: window.location.origin,
            payload: selection
        });
    }

    public sendCommand(command: CommandPayload) {
        this.send({
            type: 'MSM_TO_NOVAXE',
            kind: 'COMMAND',
            source: 'MSM',
            origin: window.location.origin,
            payload: command
        });
    }

    public getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            novaxeOrigin: this.novaxeOrigin,
            version: BRIDGE_VERSION
        };
    }

    public destroy() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }
}

// ============================================================================
// REACT HOOK FOR MSM BRIDGE INTEGRATION
// ============================================================================

import { useState, useEffect, useCallback } from 'react';

export function useMSMBridge() {
    const [bridge] = useState(() => new MSMBridgeReceiver());
    const [connectionStatus, setConnectionStatus] = useState(bridge.getConnectionStatus());
    const [lastReceived, setLastReceived] = useState<any>(null);

    useEffect(() => {
        // Set up bridge event handlers
        bridge.onConnected = () => {
            console.log('🎉 MSM Bridge: Connected to Novaxe');
            setConnectionStatus(bridge.getConnectionStatus());
        };

        bridge.onDisconnected = () => {
            console.log('❌ MSM Bridge: Disconnected from Novaxe');
            setConnectionStatus(bridge.getConnectionStatus());
        };

        bridge.onKeyChanged = (key) => {
            console.log('🎵 MSM Bridge: Key changed to', key);
            setLastReceived({ type: 'keyChange', data: key, timestamp: Date.now() });
        };

        bridge.onChordSelected = (chord) => {
            console.log('🎹 MSM Bridge: Chord selected', chord);
            setLastReceived({ type: 'chordSelection', data: chord, timestamp: Date.now() });
        };

        bridge.onCommand = (command) => {
            console.log('⚡ MSM Bridge: Command received', command);
            setLastReceived({ type: 'command', data: command, timestamp: Date.now() });
        };

        // Cleanup on unmount
        return () => {
            bridge.destroy();
        };
    }, [bridge]);

    const setKey = useCallback((key: string, mode: "major" | "minor" = "major") => {
        bridge.setKey({ key, mode });
    }, [bridge]);

    const setSelection = useCallback((slot: string, selected: boolean, key?: string) => {
        bridge.setSelection({ slot, selected, key });
    }, [bridge]);

    const sendCommand = useCallback((name: CommandPayload['name'], args?: Record<string, unknown>) => {
        bridge.sendCommand({ name, args });
    }, [bridge]);

    return {
        connectionStatus,
        lastReceived,
        setKey,
        setSelection,
        sendCommand,
        bridge
    };
}
