import React, { useState, useMemo } from 'react';
import BraidExact from '@/components/BraidExact';
import { useBraidGeometry } from '@/state/braidGeometryStore';
import { Button } from '@/components/ui/button';
import { useSEO } from '@/hooks/useSEO';
import { MSM_BRAID_GEOMETRY } from '@/constants/msmBraid';
const Slider = ({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) => (
  <label className="block text-sm mb-2">
    <span className="text-muted-foreground mr-2">{label}:</span>
    <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full" />
    <input type="number" value={value} onChange={(e) => onChange(parseFloat(e.target.value))} step={step} className="w-full mt-1 px-2 py-1 border rounded" />
  </label>
);

const BraidCalibration: React.FC = () => {
  useSEO({
    title: 'Braid Calibration — Exact Braid',
    description: 'Calibrate braid geometry with image overlay and difference mode.',
    canonicalPath: '/calibrate-braid',
  });
  const { geometry, setGeometry, reset, saveToLocalStorage, loadFromLocalStorage, importFromJSON, exportJSON } = useBraidGeometry();
  const [image, setImage] = useState<string | null>(null);
  const [opacity, setOpacity] = useState(0.5);
  const [difference, setDifference] = useState(false);

  const handleFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setImage(String(e.target?.result || ''));
    reader.readAsDataURL(file);
  };

  const containerStyle: React.CSSProperties = useMemo(() => ({ position: 'relative', width: geometry.width, height: geometry.height, margin: '0 auto' }), [geometry.width, geometry.height]);
  const imgStyle: React.CSSProperties = useMemo(() => ({ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', opacity, mixBlendMode: difference ? 'difference' as const : 'normal' }), [opacity, difference]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl  font-bold">Braid Calibration</h1>
        <div className="flex items-center gap-3">
          <input type="file" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0] || undefined)} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={difference} onChange={(e) => setDifference(e.target.checked)} /> Difference</label>
          <Button variant="secondary" onClick={saveToLocalStorage}>Save Preset</Button>
          <Button variant="secondary" onClick={loadFromLocalStorage}>Load Preset</Button>
          <Button variant="secondary" onClick={() => setGeometry({ ...geometry, ...MSM_BRAID_GEOMETRY })}>MSM Preset</Button>
          <Button variant="outline" onClick={reset}>Reset</Button>
          <Button
            variant="harmonic"
            onClick={() => {
              const data = exportJSON();
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'braid-geometry.json';
              document.body.appendChild(a);
              a.click();
              a.remove();
              URL.revokeObjectURL(url);
            }}
          >Export JSON</Button>
          <label className="text-sm cursor-pointer">
            <span className="px-3 py-2 border rounded">Import JSON</span>
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const text = await file.text();
                importFromJSON(text);
              }}
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div style={containerStyle} className="bg-muted rounded relative overflow-hidden">
            {image && <img src={image} alt="reference" style={imgStyle} />}
            <BraidExact geometry={geometry} />
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-3 border rounded">
            <h3 className="font-semibold mb-2">Overlay</h3>
            <Slider label="Opacity" value={opacity} min={0} max={1} step={0.01} onChange={setOpacity} />
            <Slider label="Global Scale" value={geometry.globalScale} min={0.5} max={2} step={0.01} onChange={(v) => setGeometry({ ...geometry, globalScale: v })} />
            <Slider label="Offset X" value={geometry.globalOffsetX} min={-400} max={400} step={1} onChange={(v) => setGeometry({ ...geometry, globalOffsetX: v })} />
            <Slider label="Offset Y" value={geometry.globalOffsetY} min={-400} max={400} step={1} onChange={(v) => setGeometry({ ...geometry, globalOffsetY: v })} />
          </div>
          <div className="p-3 border rounded">
            <h3 className="font-semibold mb-2">Circle Geometry</h3>
            <Slider label="Circle Radius" value={geometry.circleRadius} min={20} max={200} step={1} onChange={(v) => setGeometry({ ...geometry, circleRadius: v })} />
            <Slider label="Vertical Spacing" value={geometry.verticalSpacing} min={20} max={200} step={1} onChange={(v) => setGeometry({ ...geometry, verticalSpacing: v })} />
            <Slider label="Side Offset" value={geometry.sideOffset} min={20} max={400} step={1} onChange={(v) => setGeometry({ ...geometry, sideOffset: v })} />
            <Slider label="Side Y Offset Factor" value={geometry.sideVerticalOffsetFactor} min={-1} max={1} step={0.01} onChange={(v) => setGeometry({ ...geometry, sideVerticalOffsetFactor: v })} />
          </div>
          <div className="p-3 border rounded">
            <h3 className="font-semibold mb-2">Taijitu</h3>
            <Slider label="Center Rotation" value={geometry.taijituRotationCenter} min={-180} max={180} step={1} onChange={(v) => setGeometry({ ...geometry, taijituRotationCenter: v })} />
            <Slider label="Side Rotation" value={geometry.taijituRotationSide} min={-180} max={180} step={1} onChange={(v) => setGeometry({ ...geometry, taijituRotationSide: v })} />
          </div>
          <div className="p-3 border rounded">
            <h3 className="font-semibold mb-2">Origin & Canvas</h3>
            <Slider label="Origin X" value={geometry.originX} min={0} max={geometry.width} step={1} onChange={(v) => setGeometry({ ...geometry, originX: v })} />
            <Slider label="Origin Y" value={geometry.originY} min={0} max={geometry.height} step={1} onChange={(v) => setGeometry({ ...geometry, originY: v })} />
            <Slider label="Width" value={geometry.width} min={400} max={2000} step={10} onChange={(v) => setGeometry({ ...geometry, width: v })} />
            <Slider label="Height" value={geometry.height} min={600} max={4000} step={10} onChange={(v) => setGeometry({ ...geometry, height: v })} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BraidCalibration;

