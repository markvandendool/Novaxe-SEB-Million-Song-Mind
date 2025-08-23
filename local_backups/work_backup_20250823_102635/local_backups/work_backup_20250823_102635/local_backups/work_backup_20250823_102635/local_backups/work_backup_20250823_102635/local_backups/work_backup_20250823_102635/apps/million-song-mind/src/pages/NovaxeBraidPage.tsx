import React, { useCallback, useRef } from 'react';
import NovaxeBraid from '@/components/braid/NovaxeBraid';
import { Button } from '@/components/ui/button';
import { useSEO } from '@/hooks/useSEO';

const NovaxeBraidPage: React.FC = () => {
  useSEO({
    title: 'Novaxe Braid — MillionSongMind',
    description: 'Exact Novaxe braid layout with all mappings and features. Interactive harmonic visualization.',
    canonicalPath: '/novaxe-braid',
  });

  const containerRef = useRef<HTMLDivElement | null>(null);

  const downloadSVG = useCallback(() => {
    if (!containerRef.current) return;
    const svg = containerRef.current.querySelector('svg');
    if (!svg) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'novaxe-braid.svg';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, []);

  const handleChordClick = useCallback((chord: string) => {
    console.log('Chord clicked:', chord);
    // Add any additional chord click handling here
  }, []);

  const handleChordSelect = useCallback((chord: string, isSelected: boolean) => {
    console.log('Chord selected:', chord, isSelected);
    // Add any additional chord selection handling here
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl  font-bold">Novaxe Braid</h1>
          <p className="text-muted-foreground mt-2">
            Exact Novaxe braid implementation with all mappings and interactive features
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={downloadSVG} variant="harmonic">Download SVG</Button>
        </div>
      </header>

      <div className="bg-muted rounded p-4 flex justify-center overflow-auto min-h-[600px]">
        <div ref={containerRef} className="w-full max-w-4xl">
          <NovaxeBraid
            onChordClick={handleChordClick}
            onChordSelect={handleChordSelect}
            displayRoman={false}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-card rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Features</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Exact Novaxe SVG geometry and bubble definitions</li>
            <li>• Interactive chord selection and highlighting</li>
            <li>• Roman numeral and note name display toggle</li>
            <li>• All 12 key tonality support with rotation</li>
            <li>• Complete harmonic mapping system</li>
            <li>• SVG export functionality</li>
          </ul>
        </div>
        
        <div className="bg-card rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Controls</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• <strong>Key Selector:</strong> Choose from all 12 keys</li>
            <li>• <strong>Roman Toggle:</strong> Switch between note names and Roman numerals</li>
            <li>• <strong>Click Bubbles:</strong> Select and highlight chords</li>
            <li>• <strong>Download:</strong> Export as SVG for use in other applications</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NovaxeBraidPage; 