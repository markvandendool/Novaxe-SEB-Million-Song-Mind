import React, { useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';

interface FileDropZoneProps {
  onFiles: (files: File[]) => void;
  isLoading: boolean;
  isDragOver: boolean;
  setIsDragOver: (isDragOver: boolean) => void;
}

export function FileDropZone({ onFiles, isLoading, isDragOver, setIsDragOver }: FileDropZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, [setIsDragOver]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, [setIsDragOver]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.csv'));
    if (files.length > 0) {
      onFiles(files);
    }
  }, [onFiles, setIsDragOver]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      onFiles(files);
    }
  };

  return (
    <div
      className={`
        border-2 border-dashed rounded-lg p-12 px-24 text-center 
        transition-all duration-300 bg-gradient-surface
        ${isDragOver 
          ? 'border-primary bg-primary/10 shadow-chart animate-pulse-glow' 
          : 'border-border hover:border-primary/50 hover:bg-card'
        }
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="space-y-6">
        <div className="text-6xl animate-fade-in">🎵</div>
        
        <div className="space-y-4">
          <h3 className="text-2xl  font-bold text-foreground tracking-wider">
            HARMONIC DATA IMPORT
          </h3>
          
          <p className="text-lg text-muted-foreground">
            Drop CSV files here or{' '}
            <Button
              variant="link"
              className="text-primary hover:text-primary/80 p-0 h-auto "
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              browse to upload
            </Button>
          </p>
          
          <div className="text-sm text-muted-foreground space-y-2">
            <div>• Industrial scale ready: 680,000+ files supported</div>
            <div>• Multi-file aggregation and normalization</div>
            <div>• Professional chord progression analysis</div>
          </div>
        </div>

        <Button 
          variant="professional" 
          size="xl"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="transition-all duration-300"
        >
          {isLoading ? '⏳ PROCESSING...' : '📁 SELECT FILES'}
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          multiple
          onChange={handleFileUpload}
          className="hidden"
          disabled={isLoading}
        />
      </div>
    </div>
  );
}