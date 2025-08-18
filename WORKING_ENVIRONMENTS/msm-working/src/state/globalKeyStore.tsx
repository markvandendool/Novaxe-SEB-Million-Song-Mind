import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type GlobalKeyState = {
  tonality: string; // user-selected key, e.g., 'C', 'Gm'
  scoreTonality: string; // score-provided key
  isLockedToScore: boolean; // when true, use scoreTonality
};

type GlobalKeyCtx = GlobalKeyState & {
  setTonality: (key: string) => void;
  setScoreTonality: (key: string) => void;
  toggleLock: () => void;
  focusedKey: string; // derived key in effect
};

const DEFAULT_STATE: GlobalKeyState = {
  tonality: 'C',
  scoreTonality: 'C',
  isLockedToScore: false,
};

const GlobalKeyContext = createContext<GlobalKeyCtx | null>(null);

export const GlobalKeyProvider: React.FC<{ children: React.ReactNode; initial?: Partial<GlobalKeyState> }> = ({ children, initial }) => {
  const [state, setState] = useState<GlobalKeyState>({ ...DEFAULT_STATE, ...initial });

  const setTonality = useCallback((key: string) => setState(prev => ({ ...prev, tonality: key })), []);
  const setScoreTonality = useCallback((key: string) => setState(prev => ({ ...prev, scoreTonality: key })), []);
  const toggleLock = useCallback(() => setState(prev => ({ ...prev, isLockedToScore: !prev.isLockedToScore })), []);

  const focusedKey = useMemo(() => (state.isLockedToScore ? state.scoreTonality : state.tonality) || 'C', [state]);

  const value = useMemo<GlobalKeyCtx>(() => ({ ...state, setTonality, setScoreTonality, toggleLock, focusedKey }), [state, setTonality, setScoreTonality, toggleLock, focusedKey]);

  return <GlobalKeyContext.Provider value={value}>{children}</GlobalKeyContext.Provider>;
};

export function useGlobalKey() {
  const ctx = useContext(GlobalKeyContext);
  if (!ctx) throw new Error('useGlobalKey must be used within GlobalKeyProvider');
  return ctx;
}
