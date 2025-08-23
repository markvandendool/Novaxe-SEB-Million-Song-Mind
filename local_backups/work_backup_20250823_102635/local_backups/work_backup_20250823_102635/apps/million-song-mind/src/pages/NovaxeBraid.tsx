import React, { useCallback, useMemo, useRef } from 'react';
import BraidExact, { DEFAULT_BRAID_GEOMETRY } from '@/components/BraidExact';
import { MSM_BRAID_GEOMETRY } from '@/constants/msmBraid';
import { Button } from '@/components/ui/button';
import { useSEO } from '@/hooks/useSEO';

const NovaxeBraidPage: React.FC = () => {
  useSEO({
    title: 'Novaxe Braid — MillionSongMind',
    description: 'Exact Novaxe braid layout using MSM preset geometry. Export as SVG.',
    canonicalPath: '/novaxe-braid',
  });

  const geometry = useMemo(() => ({
    ...DEFAULT_BRAID_GEOMETRY,
    ...MSM_BRAID_GEOMETRY,
  }), []);

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

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl  font-bold">Novaxe Braid</h1>
        <div className="flex items-center gap-3">
          <Button onClick={downloadSVG} variant="harmonic">Download SVG</Button>
        </div>
      </header>

      <div className="bg-muted rounded p-4 flex justify-center overflow-auto">
        <div ref={containerRef} style={{ width: geometry.width, height: geometry.height }}>
          <BraidExact geometry={geometry} />
        </div>
      </div>
    </div>
  );
};

export default NovaxeBraidPage;
