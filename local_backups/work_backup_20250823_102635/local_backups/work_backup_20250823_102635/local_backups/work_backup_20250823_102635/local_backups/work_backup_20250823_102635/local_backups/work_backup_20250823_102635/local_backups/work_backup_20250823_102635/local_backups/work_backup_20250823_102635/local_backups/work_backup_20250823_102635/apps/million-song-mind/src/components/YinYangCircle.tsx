import React from 'react';
import { audioManager } from '@/utils/audioManager';

type YinYangCircleProps = {
  cx: number;
  cy: number;
  r: number;
  chordTop: string;
  chordBottom: string;
  selectedChords: string[];
  onChordSelect?: (chord: string, isSelected: boolean) => void;
};

function arcPath(cx: number, cy: number, r: number, sweepFlag: 0 | 1, toY: number) {
  // Arc from (cx, currentY) to (cx, toY) with radius r vertically
  return `A ${r} ${r} 0 0 ${sweepFlag} ${cx} ${toY}`;
}

export const YinYangCircle: React.FC<YinYangCircleProps> = ({
  cx,
  cy,
  r,
  chordTop,
  chordBottom,
  selectedChords,
  onChordSelect,
}) => {
  const topSelected = selectedChords.includes(chordTop);
  const bottomSelected = selectedChords.includes(chordBottom);
  const r2 = r / 2;
  const topDotY = cy - r2;
  const bottomDotY = cy + r2;

  const handleSelect = (e: React.MouseEvent, label: string, isSelected: boolean) => {
    if (!onChordSelect) return;
    // Audio feedback first
    if (isSelected) {
      audioManager.playDeselection();
    } else {
      audioManager.playSelection();
    }
    const additive = e.metaKey || e.ctrlKey;
    if (additive) {
      onChordSelect(label, !isSelected);
    } else {
      // Replace selection with just this label
      selectedChords.filter(c => c !== label).forEach(c => onChordSelect(c, false));
      onChordSelect(label, true);
    }
  };

  // Taijitu paths (precise)
  const blackPath = [
    `M ${cx} ${cy - r}`,
    arcPath(cx, cy - r, r, 1, cy + r), // big arc down
    `A ${r2} ${r2} 0 0 0 ${cx} ${cy}`, // small arc leftwards up
    `A ${r2} ${r2} 0 0 1 ${cx} ${cy - r}`, // small arc to start
    'Z',
  ].join(' ');

  const whitePath = [
    `M ${cx} ${cy - r}`,
    `A ${r2} ${r2} 0 0 1 ${cx} ${cy}`, // small arc down
    `A ${r2} ${r2} 0 0 0 ${cx} ${cy + r}`, // small arc further down
    arcPath(cx, cy + r, r, 1, cy - r), // big arc back to top
    'Z',
  ].join(' ');

  // Scale from the shared center of the dual bubble (selected state triggers scale)
  const topScale = topSelected ? 1.12 : 1;
  const bottomScale = bottomSelected ? 1.12 : 1;
  const transition = 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)';

  const topGroup = (
    <g
      style={{
        transform: `translate(${cx}px, ${cy}px) scale(${topScale}) translate(${-cx}px, ${-cy}px)`,
        transition,
        willChange: 'transform',
      }}
    >
      <path
        d={blackPath}
        className={`harmonic-bar ${topSelected ? 'selected' : ''}`}
        fill={'hsl(var(--foreground))'}
        opacity={topSelected ? 0.25 : 0.12}
        onClick={(e) => handleSelect(e, chordTop, topSelected)}
      />
      <circle
        cx={cx}
        cy={topDotY}
        r={r2 * 0.22}
        fill={topSelected ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))'}
        opacity={topSelected ? 0.95 : 0.7}
      />
      <text
        x={cx}
        y={topDotY}
        fontSize="0.7em"
        fill={topSelected ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))'}
        style={{
          cursor: 'pointer',
          textAnchor: 'middle',
          dominantBaseline: 'middle',
          fontFamily: 'nvxChord, Fontdec13, music-font, monospace'
        }}
        onClick={(e) => handleSelect(e, chordTop, topSelected)}
      >
        {chordTop}
      </text>
    </g>
  );

  const bottomGroup = (
    <g
      style={{
        transform: `translate(${cx}px, ${cy}px) scale(${bottomScale}) translate(${-cx}px, ${-cy}px)`,
        transition,
        willChange: 'transform',
      }}
    >
      {/* Yang (bottom white lobe) */}
      <path
        d={whitePath}
        className={`harmonic-bar ${bottomSelected ? 'selected' : ''}`}
        fill={'hsl(var(--foreground))'}
        opacity={bottomSelected ? 0.22 : 0.10}
        onClick={(e) => handleSelect(e, chordBottom, bottomSelected)}
      />
      <circle
        cx={cx}
        cy={bottomDotY}
        r={r2 * 0.22}
        fill={bottomSelected ? 'hsl(var(--accent-foreground))' : 'hsl(var(--foreground))'}
        opacity={bottomSelected ? 0.95 : 0.7}
      />
      <text
        x={cx}
        y={bottomDotY}
        fontSize="0.7em"
        fill={bottomSelected ? 'hsl(var(--accent-foreground))' : 'hsl(var(--foreground))'}
        style={{
          cursor: 'pointer',
          textAnchor: 'middle',
          dominantBaseline: 'middle',
          fontFamily: 'nvxChord, Fontdec13, music-font, monospace'
        }}
        onClick={(e) => handleSelect(e, chordBottom, bottomSelected)}
      >
        {chordBottom}
      </text>
    </g>
  );

  return (
    <g>
      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth={2} />

      {/* Ensure active half renders on top to manage overlap */}
      {topSelected && !bottomSelected ? (
        <>
          {bottomGroup}
          {topGroup}
        </>
      ) : bottomSelected && !topSelected ? (
        <>
          {topGroup}
          {bottomGroup}
        </>
      ) : (
        <>
          {topGroup}
          {bottomGroup}
        </>
      )}
    </g>
  );
};

export default YinYangCircle;

