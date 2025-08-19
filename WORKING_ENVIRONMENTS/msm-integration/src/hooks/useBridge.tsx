import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';

// Bridge schema types (from Angular analysis)
interface BridgeEnvelope<T = any> {
  type: 'MSM_TO_NOVAXE' | 'NOVAXE_TO_MSM';
  kind: 'HANDSHAKE' | 'KEY_CHANGE' | 'CHORD_SELECTION' | 'SELECTION_SYNC' | 'COMMAND' | 'HEARTBEAT';
  source: 'MSM' | 'NOVAXE';
  origin: string;
  version: string;
  payload: T;
}

interface KeyPayload {
  key: string;
  mode: 'major' | 'minor' | 'ionian' | 'dorian' | 'phrygian' | 'lydian' | 'mixolydian' | 'aeolian' | 'locrian';
  scale?: string;
}

interface ChordSelectionPayload {
  chord: string;
  position: number;
  tonality: string;
  timestamp: number;
}

interface SelectionSyncPayload {
  selectedChords: string[];
  currentMeasure: number;
  currentBeat: number;
}

interface CommandPayload {
  command: 'PLAY' | 'PAUSE' | 'STOP' | 'REWIND' | 'SET_TEMPO';
  value?: any;
}

// Bridge context
interface BridgeContextType {
  isConnected: boolean;
  msmReady: boolean;
  currentKey: KeyPayload | null;
  sendKeyChange: (key: KeyPayload) => void;
  sendChordSelection: (chord: ChordSelectionPayload) => void;
  sendCommand: (command: CommandPayload) => void;
  attachToMsm: (window: Window, origin: string) => void;
  detach: () => void;
  onKeyChange?: (key: KeyPayload) => void;
  onChordSelection?: (chord: ChordSelectionPayload) => void;
  onCommand?: (command: CommandPayload) => void;
}

const BridgeContext = createContext<BridgeContextType | null>(null);

export const useBridge = () => {
  const context = useContext(BridgeContext);
  if (!context) {
    throw new Error('useBridge must be used within a BridgeProvider');
  }
  return context;
};

const BRIDGE_VERSION = '1.0.0';
const HEARTBEAT_INTERVAL = 5000;

interface BridgeProviderProps {
  children: ReactNode;
  onKeyChange?: (key: KeyPayload) => void;
  onChordSelection?: (chord: ChordSelectionPayload) => void;
  onCommand?: (command: CommandPayload) => void;
}

export const BridgeProvider: React.FC<BridgeProviderProps> = ({
  children,
  onKeyChange,
  onChordSelection,
  onCommand
}) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [msmReady, setMsmReady] = useState<boolean>(false);
  const [currentKey, setCurrentKey] = useState<KeyPayload | null>(null);

  const msmWindowRef = useRef<Window | null>(null);
  const targetOriginRef = useRef<string>('*');
  const allowedOriginsRef = useRef<string[]>(['http://localhost:8080', 'http://localhost:3000', 'http://localhost:5173']);
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Message validation
  const isBridgeEnvelope = (data: any): data is BridgeEnvelope => {
    return (
      data &&
      typeof data === 'object' &&
      typeof data.type === 'string' &&
      typeof data.kind === 'string' &&
      typeof data.source === 'string' &&
      typeof data.origin === 'string' &&
      data.payload !== undefined
    );
  };

  const isFromAllowedOrigin = (origin: string): boolean => {
    return allowedOriginsRef.current.includes(origin) || origin === targetOriginRef.current;
  };

  // Send message function
  const sendMessage = <T,>(envelope: BridgeEnvelope<T>): void => {
    if (!msmWindowRef.current) {
      console.warn('[BRIDGE] No MSM window attached');
      return;
    }

    try {
      msmWindowRef.current.postMessage(envelope, targetOriginRef.current);
    } catch (error) {
      console.error('[BRIDGE] Failed to send message:', error);
    }
  };

  // Heartbeat system
  const startHeartbeat = () => {
    stopHeartbeat();
    heartbeatTimerRef.current = setInterval(() => {
      sendMessage({
        type: 'NOVAXE_TO_MSM',
        kind: 'HEARTBEAT',
        source: 'NOVAXE',
        origin: window.location.origin,
        version: BRIDGE_VERSION,
        payload: { timestamp: Date.now() }
      });
    }, HEARTBEAT_INTERVAL);
  };

  const stopHeartbeat = () => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
  };

  // Message handler
  const handleIncomingMessage = (envelope: BridgeEnvelope): void => {
    switch (envelope.kind) {
      case 'HANDSHAKE':
        if (envelope.source === 'MSM') {
          setIsConnected(true);
          setMsmReady(true);
          // Respond with handshake
          sendMessage({
            type: 'NOVAXE_TO_MSM',
            kind: 'HANDSHAKE',
            source: 'NOVAXE',
            origin: window.location.origin,
            version: BRIDGE_VERSION,
            payload: { hello: 'from-novaxe', ready: true }
          });
        }
        break;

      case 'KEY_CHANGE':
        if (envelope.source === 'MSM') {
          const keyPayload = envelope.payload as KeyPayload;
          setCurrentKey(keyPayload);
          onKeyChange?.(keyPayload);
        }
        break;

      case 'CHORD_SELECTION':
        if (envelope.source === 'MSM') {
          const chordPayload = envelope.payload as ChordSelectionPayload;
          onChordSelection?.(chordPayload);
        }
        break;

      case 'COMMAND':
        if (envelope.source === 'MSM') {
          const commandPayload = envelope.payload as CommandPayload;
          onCommand?.(commandPayload);
        }
        break;

      case 'HEARTBEAT':
        // Heartbeat received - connection is alive
        break;

      default:
        console.warn('[BRIDGE] Unknown message kind:', envelope.kind);
    }
  };

  // Message event listener
  useEffect(() => {
    const messageHandler = (event: MessageEvent) => {
      if (!isFromAllowedOrigin(event.origin)) return;

      const data = event.data;
      if (!isBridgeEnvelope(data)) return;

      if (data.version !== BRIDGE_VERSION) {
        console.warn('[BRIDGE] Version mismatch:', data.version, 'expected:', BRIDGE_VERSION);
      }

      handleIncomingMessage(data);
    };

    window.addEventListener('message', messageHandler);
    return () => window.removeEventListener('message', messageHandler);
  }, [onKeyChange, onChordSelection, onCommand]);

  // Bridge API methods
  const attachToMsm = (msmWindow: Window, origin: string): void => {
    msmWindowRef.current = msmWindow;
    targetOriginRef.current = origin || '*';

    // Send initial handshake
    sendMessage({
      type: 'NOVAXE_TO_MSM',
      kind: 'HANDSHAKE',
      source: 'NOVAXE',
      origin: window.location.origin,
      version: BRIDGE_VERSION,
      payload: { hello: 'from-novaxe' }
    });

    startHeartbeat();
  };

  const detach = (): void => {
    stopHeartbeat();
    msmWindowRef.current = null;
    setIsConnected(false);
    setMsmReady(false);
    setCurrentKey(null);
  };

  const sendKeyChange = (key: KeyPayload): void => {
    sendMessage({
      type: 'NOVAXE_TO_MSM',
      kind: 'KEY_CHANGE',
      source: 'NOVAXE',
      origin: window.location.origin,
      version: BRIDGE_VERSION,
      payload: key
    });
  };

  const sendChordSelection = (chord: ChordSelectionPayload): void => {
    sendMessage({
      type: 'NOVAXE_TO_MSM',
      kind: 'CHORD_SELECTION',
      source: 'NOVAXE',
      origin: window.location.origin,
      version: BRIDGE_VERSION,
      payload: chord
    });
  };

  const sendCommand = (command: CommandPayload): void => {
    sendMessage({
      type: 'NOVAXE_TO_MSM',
      kind: 'COMMAND',
      source: 'NOVAXE',
      origin: window.location.origin,
      version: BRIDGE_VERSION,
      payload: command
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      detach();
    };
  }, []);

  const contextValue: BridgeContextType = {
    isConnected,
    msmReady,
    currentKey,
    sendKeyChange,
    sendChordSelection,
    sendCommand,
    attachToMsm,
    detach,
    onKeyChange,
    onChordSelection,
    onCommand
  };

  return (
    <BridgeContext.Provider value={contextValue}>
      {children}
    </BridgeContext.Provider>
  );
};

// Bridge status component
export const BridgeStatus: React.FC = () => {
  const { isConnected, msmReady, currentKey } = useBridge();

  return (
    <div className="fixed top-4 right-4 bg-white shadow-lg rounded-lg p-3 border">
      <div className="text-xs font-semibold mb-2">Bridge Status</div>
      <div className="flex items-center gap-2 text-xs">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span>Connected: {isConnected ? 'Yes' : 'No'}</span>
      </div>
      <div className="flex items-center gap-2 text-xs mt-1">
        <div className={`w-2 h-2 rounded-full ${msmReady ? 'bg-green-500' : 'bg-yellow-500'}`} />
        <span>MSM Ready: {msmReady ? 'Yes' : 'No'}</span>
      </div>
      {currentKey && (
        <div className="text-xs mt-1">
          <span>Key: {currentKey.key} {currentKey.mode}</span>
        </div>
      )}
    </div>
  );
};

export default BridgeProvider;
