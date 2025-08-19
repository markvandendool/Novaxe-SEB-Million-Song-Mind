import React from 'react';

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

  return (
    <g>
      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth={2} />

      {/* Yin (top black lobe) */}
      <path d={blackPath} fill={topSelected ? 'hsl(var(--primary))' : 'hsl(var(--foreground))'} opacity={topSelected ? 0.9 : 0.12} />
      {/* Yang (bottom white lobe) */}
      <path d={whitePath} fill={bottomSelected ? 'hsl(var(--accent))' : 'hsl(var(--foreground))'} opacity={bottomSelected ? 0.85 : 0.10} />

      {/* Inner dots */}
      <circle cx={cx} cy={topDotY} r={r2 * 0.22} fill={topSelected ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))'} opacity={topSelected ? 0.95 : 0.7} />
      <circle cx={cx} cy={bottomDotY} r={r2 * 0.22} fill={bottomSelected ? 'hsl(var(--accent-foreground))' : 'hsl(var(--foreground))'} opacity={bottomSelected ? 0.95 : 0.7} />

      {/* Labels */}
      <text
        x={cx}
        y={topDotY}
        textAnchor="middle"
        dominantBaseline="middle"
        className="font-mono text-sm chord-label-custom"
        fill={topSelected ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))'}
        onClick={() => onChordSelect?.(chordTop, !topSelected)}
        style={{ cursor: 'pointer' }}
      >
        {chordTop}
      </text>
      <text
        x={cx}
        y={bottomDotY}
        textAnchor="middle"
        dominantBaseline="middle"
        className="font-mono text-sm chord-label-custom"
        fill={bottomSelected ? 'hsl(var(--accent-foreground))' : 'hsl(var(--foreground))'}
        onClick={() => onChordSelect?.(chordBottom, !bottomSelected)}
        style={{ cursor: 'pointer' }}
      >
        {chordBottom}
      </text>
    </g>
  );
};

export default YinYangCircle;

