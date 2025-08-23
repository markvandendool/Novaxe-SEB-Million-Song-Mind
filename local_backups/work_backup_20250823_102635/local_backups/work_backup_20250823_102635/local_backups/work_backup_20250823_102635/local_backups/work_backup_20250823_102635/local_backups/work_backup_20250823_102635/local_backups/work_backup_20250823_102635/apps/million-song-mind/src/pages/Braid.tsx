import React, { useCallback, useRef } from 'react';
import BraidExact from '@/components/BraidExact';
import { useBraidGeometry } from '@/state/braidGeometryStore';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';

const BraidPage: React.FC = () => {
  useSEO({
    title: 'Exact Braid — MillionSongMind',
    description: 'Render and export the exact braid lattice with calibrated geometry.',
    canonicalPath: '/braid',
  });

  const { geometry } = useBraidGeometry();
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
    a.download = 'exact-braid.svg';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl  font-bold">Exact Braid</h1>
        <div className="flex items-center gap-3">
          <Link to="/calibrate-braid">
            <Button variant="secondary">Open Calibrator</Button>
          </Link>
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

export default BraidPage;
