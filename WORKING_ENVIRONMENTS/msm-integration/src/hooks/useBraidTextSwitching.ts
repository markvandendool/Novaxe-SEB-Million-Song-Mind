import { useState, useCallback } from 'react';

export type BraidTextMode = 'letters' | 'roman';

export interface BraidTextSwitchingState {
  mode: BraidTextMode;
  displayRoman: boolean;
}

export const useBraidTextSwitching = (initialMode: BraidTextMode = 'letters') => {
  const [mode, setMode] = useState<BraidTextMode>(initialMode);
  
  const displayRoman = mode === 'roman';
  
  const toggleMode = useCallback(() => {
    setMode(prev => prev === 'letters' ? 'roman' : 'letters');
  }, []);
  
  const setModeExplicit = useCallback((newMode: BraidTextMode) => {
    setMode(newMode);
  }, []);
  
  return {
    mode,
    displayRoman,
    toggleMode,
    setMode: setModeExplicit,
  };
};