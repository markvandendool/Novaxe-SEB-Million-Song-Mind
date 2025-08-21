import React, { useMemo } from 'react';
import YinYangCircle from './YinYangCircle';
import { getAllChordMappings } from '@/utils/braidMapping';

type BraidViewProps = {
  width?: number;
  height?: number;
  selectedChords: string[];
  onChordSelect?: (chord: string, isSelected: boolean) => void;
  useRoman?: boolean;
};

export const BraidView: React.FC<BraidViewProps> = ({
  width = 1200,
  height = 2400,
  selectedChords,
  onChordSelect,
  useRoman = true,
}) => {
  const centerX = width / 2;
  const circleRadius = 220; // tuned to match Braid Simplified
  const verticalStep = circleRadius * 0.85; // heavier overlap, closer to reference

  // Get chord mappings from braid_tonalities.json
  const chordMappings = useMemo(() => {
    const mappings = getAllChordMappings(useRoman);
    console.log('🎵 BraidView chord mappings:', mappings.slice(0, 3)); // Debug first 3
    return mappings;
  }, [useRoman]);

  // 15 circle centers (7 up, center, 7 down)
  const centers = useMemo(() => {
    const arr: { x: number; y: number; keyLabel: string; chordMapping: { topChord: string; bottomChord: string } }[] = [];
    for (let i = -7; i <= 7; i++) {
      const mappingIndex = i + 7; // Convert to 0-14 range
      arr.push({
        x: centerX,
        y: height / 2 + i * verticalStep,
        keyLabel: `Key ${i + 8}`,
        chordMapping: chordMappings[mappingIndex]
      });
    }
    return arr;
  }, [centerX, height, verticalStep, chordMappings]);

  const chords = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'viiø'];

  function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
    const a = (angleDeg * Math.PI) / 180;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  }

  return (
    <div className="w-full flex justify-center">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <rect x={0} y={0} width={width} height={height} fill="transparent" />
        {centers.map((c, idx) => (
          <g key={`circle-${idx}`}>
            <text x={c.x} y={c.y - circleRadius - 12} textAnchor="middle" fill="hsl(var(--muted-foreground))" className=" text-xs">
              {c.keyLabel}
            </text>
            <YinYangCircle
              cx={c.x}
              cy={c.y}
              r={circleRadius}
              chordTop={c.chordMapping.topChord}
              chordBottom={c.chordMapping.bottomChord}
              selectedChords={selectedChords}
              onChordSelect={onChordSelect}
            />
          </g>
        ))}
      </svg>
    </div>
  );
};

export default BraidView;

