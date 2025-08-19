import React from 'react';
import { useGlobalKey } from '@/state/globalKeyStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

const MAJOR_KEYS = ['C','G','D','A','E','B','F#','C#','F','Bb','Eb','Ab','Db','Gb','Cb'] as const;
const MINOR_KEYS = ['Am','Em','Bm','F#m','C#m','G#m','D#m','A#m','Dm','Gm','Cm','Fm','Bbm','Ebm','Abm'] as const;

// Compact version for header integration
export const GlobalKeySelector: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { tonality, scoreTonality, isLockedToScore, setTonality, toggleLock, focusedKey } = useGlobalKey();

  const handleChange = (value: string) => {
    setTonality(value);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-xs  text-muted-foreground">Key:</div>
        <div className="px-1.5 py-0.5 rounded bg-muted text-foreground  text-xs min-w-[24px] text-center">
          {focusedKey}
        </div>
        <div className="min-w-[120px]">
          <Select value={tonality} onValueChange={handleChange}>
            <SelectTrigger className="h-6 text-xs" aria-label="Select global key">
              <SelectValue placeholder="Key" />
            </SelectTrigger>
            <SelectContent>
              <div className="px-2 py-1 text-xs  text-muted-foreground">Major</div>
              {MAJOR_KEYS.map(k => (
                <SelectItem key={k} value={k}>{k}</SelectItem>
              ))}
              <div className="px-2 pt-2 text-xs  text-muted-foreground">Minor</div>
              {MINOR_KEYS.map(k => (
                <SelectItem key={k} value={k}>{k}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1">
          <Switch 
            checked={isLockedToScore} 
            onCheckedChange={toggleLock} 
            id="lock-to-score-compact"
            className="scale-75"
          />
          <label htmlFor="lock-to-score-compact" className="text-xs  text-muted-foreground">Lock</label>
        </div>
      </div>
    );
  }

  return (
    <section className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card/80 border border-border rounded-md px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="text-sm  text-muted-foreground">Global Key</div>
          <div className="px-2 py-1 rounded bg-muted text-foreground  text-xs">Focused: {focusedKey}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="min-w-[180px]">
            <Select value={tonality} onValueChange={handleChange}>
              <SelectTrigger aria-label="Select global key">
                <SelectValue placeholder="Select key" />
              </SelectTrigger>
              <SelectContent>
                <div className="px-2 py-1 text-xs  text-muted-foreground">Major</div>
                {MAJOR_KEYS.map(k => (
                  <SelectItem key={k} value={k}>{k}</SelectItem>
                ))}
                <div className="px-2 pt-2 text-xs  text-muted-foreground">Minor</div>
                {MINOR_KEYS.map(k => (
                  <SelectItem key={k} value={k}>{k}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={isLockedToScore} onCheckedChange={toggleLock} id="lock-to-score" />
            <label htmlFor="lock-to-score" className="text-xs  text-muted-foreground">Lock to score</label>
          </div>
          <Button variant="secondary" onClick={() => setTonality('C')} className=" text-xs">
            Reset C
          </Button>
        </div>
      </div>
    </section>
  );
};

export default GlobalKeySelector;
