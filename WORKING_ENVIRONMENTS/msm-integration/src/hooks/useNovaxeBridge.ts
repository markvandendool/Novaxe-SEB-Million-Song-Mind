import { useEffect, useRef } from 'react';
import {
  BRIDGE_VERSION,
  BridgeEnvelope,
  isBridgeEnvelope,
  KeyPayload,
  ChordSelectionPayload,
  SelectionSyncPayload,
  CommandPayload
} from '@/bridge/shared-bridge-schema';
import { chordAudioManager } from '@/utils/ChordAudioManager';

const ALLOWED_NOVAXE_ORIGINS = [ 'http://localhost:4200', 'http://127.0.0.1:4200' ];

export function useNovaxeBridge({ onKey, onChordSelected, onSelectionSync }:{
  onKey: (key: KeyPayload) => void;
  onChordSelected: (sel: ChordSelectionPayload) => void;
  onSelectionSync: (sel: SelectionSyncPayload) => void;
}){
  const parentOriginRef = useRef<string | null>(null);
  const inNovaxe = typeof window !== 'undefined' && window.parent && window.parent !== window;

  useEffect(() => {
    function handleMessage(event: MessageEvent){
      if (!ALLOWED_NOVAXE_ORIGINS.includes(event.origin)) return;
      const data = (event as any).data;
      if (!isBridgeEnvelope(data)) return;
      parentOriginRef.current = event.origin;

      if (data.type === 'NOVAXE_TO_MSM'){
        switch(data.kind){
          case 'HANDSHAKE_ACK': break;
          case 'READY_ACK': break;
          case 'KEY_CHANGED':
            onKey(data.payload as KeyPayload);
            break;
          case 'CHORD_SELECTED':{
            const sel = data.payload as ChordSelectionPayload;
            if (isAug6(sel.roman)) return;
            onChordSelected(sel);
            playChordIfAllowed(sel);
            onSelectionSync({ slot: sel.roman, selected: true, key: sel.key, reason: 'from-novaxe' });
            break;
          }
          case 'SELECTION_SYNC':
            onSelectionSync(data.payload as SelectionSyncPayload);
            break;
        }
      }
    }

    function post(partial: Omit<BridgeEnvelope<any>, 'version'|'ts'|'source'|'origin'>){
      if (!inNovaxe) return;
      const origin = parentOriginRef.current ?? 'http://localhost:4200';
      const env: BridgeEnvelope<any> = { ...partial, version: BRIDGE_VERSION, ts: Date.now(), source: 'MSM', origin: window.location.origin };
      window.parent.postMessage(env, origin);
    }

    function playChordIfAllowed(sel: ChordSelectionPayload){
      const roman = sel.roman;
      if (isAug6(roman)) return;
      const ok = /(°|ø|7|maj|min|dim|^I$|^i$|^V$)/i.test(roman);
      if (!ok) return;
      chordAudioManager.playRomanInKey(roman, sel.key ?? undefined);
    }

    function isAug6(roman: string){
      const t = roman.replace(/\s+/g,'');
      return ['It+6','Fr+6','Ger+6','It6','Fr6','Ger6'].includes(t);
    }

    window.addEventListener('message', handleMessage);
    if (inNovaxe){
      post({ type:'MSM_TO_NOVAXE', kind:'HANDSHAKE', payload:{ hello:'from-msm' } });
      post({ type:'MSM_TO_NOVAXE', kind:'READY', payload:{ ok:true } });
    }
    const hb = setInterval(() => post({ type:'MSM_TO_NOVAXE', kind:'HEARTBEAT', payload:{ t:Date.now() } }), 10000);
    return () => { clearInterval(hb); window.removeEventListener('message', handleMessage); };
  }, [inNovaxe, onKey, onChordSelected, onSelectionSync]);
}

