import React from 'react';
import { Button } from '@/components/ui/button';
import { BraidTextMode } from '@/hooks/useBraidTextSwitching';

interface BraidTextSwitcherProps {
  mode: BraidTextMode;
  onModeChange: (mode: BraidTextMode) => void;
  compact?: boolean;
}

export const BraidTextSwitcher: React.FC<BraidTextSwitcherProps> = ({
  mode,
  onModeChange,
  compact = false
}) => {
  const handleToggle = () => {
    onModeChange(mode === 'letters' ? 'roman' : 'letters');
  };

  return (
    <Button
      variant="outline"
      size={compact ? "sm" : "default"}
      onClick={handleToggle}
      className={` transition-all duration-200 ${
        compact 
          ? "text-xs px-2 py-1 h-6" 
          : "text-sm px-3 py-2"
      }`}
    >
      {mode === 'letters' ? (
        <>
          <span className="mr-1">A</span>
          <span className="text-muted-foreground">→</span>
          <span className="ml-1 text-muted-foreground">I</span>
        </>
      ) : (
        <>
          <span className="text-muted-foreground mr-1">A</span>
          <span className="text-muted-foreground">→</span>
          <span className="ml-1">I</span>
        </>
      )}
    </Button>
  );
};

export default BraidTextSwitcher;