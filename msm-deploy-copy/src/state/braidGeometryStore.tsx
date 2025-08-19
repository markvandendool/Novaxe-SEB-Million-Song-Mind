import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_BRAID_GEOMETRY, type BraidGeometry } from '@/components/BraidExact';

const STORAGE_KEY = 'braidGeometry';

type Ctx = {
  geometry: BraidGeometry;
  setGeometry: (next: Partial<BraidGeometry> | ((prev: BraidGeometry) => BraidGeometry)) => void;
  reset: () => void;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
  importFromJSON: (json: string) => void;
  exportJSON: () => string;
};

const BraidGeometryContext = createContext<Ctx | null>(null);

export const BraidGeometryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [geometry, setGeometryState] = useState<BraidGeometry>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return { ...DEFAULT_BRAID_GEOMETRY, ...parsed } as BraidGeometry;
      }
    } catch {}
    return { ...DEFAULT_BRAID_GEOMETRY };
  });

  // Keep in-memory state and provide a controlled setter
  const setGeometry: Ctx['setGeometry'] = useCallback((next) => {
    setGeometryState(prev => {
      const updated = typeof next === 'function' ? (next as (p: BraidGeometry) => BraidGeometry)(prev) : { ...prev, ...next };
      return updated;
    });
  }, []);

  const reset = useCallback(() => {
    setGeometryState({ ...DEFAULT_BRAID_GEOMETRY });
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  const saveToLocalStorage = useCallback(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(geometry)); } catch {}
  }, [geometry]);

  const loadFromLocalStorage = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setGeometryState(prev => ({ ...prev, ...parsed }));
      }
    } catch {}
  }, []);

  const importFromJSON = useCallback((json: string) => {
    try {
      const parsed = JSON.parse(json);
      setGeometryState(prev => ({ ...prev, ...parsed }));
    } catch {}
  }, []);

  const exportJSON = useCallback(() => JSON.stringify(geometry, null, 2), [geometry]);

  const value = useMemo<Ctx>(() => ({ geometry, setGeometry, reset, saveToLocalStorage, loadFromLocalStorage, importFromJSON, exportJSON }), [geometry, setGeometry, reset, saveToLocalStorage, loadFromLocalStorage, importFromJSON, exportJSON]);

  return (
    <BraidGeometryContext.Provider value={value}>{children}</BraidGeometryContext.Provider>
  );
};

export function useBraidGeometry() {
  const ctx = useContext(BraidGeometryContext);
  if (!ctx) throw new Error('useBraidGeometry must be used within BraidGeometryProvider');
  return ctx;
}
