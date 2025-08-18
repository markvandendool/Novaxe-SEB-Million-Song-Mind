import React from 'react';
import YinYang from './YinYang';

export type BraidGeometry = {
  circleRadius: number;
  verticalSpacing: number; // distance between central circle centers
  sideOffset: number; // horizontal distance from center to side rings
  sideVerticalOffsetFactor: number; // vertical offset of side rings relative to center, in multiples of verticalSpacing (e.g., 0.5)
  circleStroke: string;
  circleStrokeWidth: number;
  ringFill: string;
  ringFillOpacity: number;
  taijituSize: number; // radius of inner yin-yang on center of ring
  taijituSideSize: number; // radius of inner yin-yang on left/right positions
  taijituRotationCenter: number; // rotation in degrees for center taijitu
  taijituRotationSide: number; // rotation in degrees for side taijitu
  width: number;
  height: number;
  originX: number; // center x of vertical column
  originY: number; // center y of middle circle (index 7)
  globalOffsetX: number; // translation for overlay alignment
  globalOffsetY: number; // translation for overlay alignment
  globalScale: number; // scale for overlay alignment
};

export const DEFAULT_BRAID_GEOMETRY: BraidGeometry = {
  circleRadius: 60,
  verticalSpacing: 90,
  sideOffset: 120,
  sideVerticalOffsetFactor: 0.5,
  circleStroke: 'hsl(var(--border))',
  circleStrokeWidth: 1.5,
  ringFill: 'hsl(var(--muted-foreground))',
  ringFillOpacity: 0.12,
  taijituSize: 18,
  taijituSideSize: 18,
  taijituRotationCenter: -45,
  taijituRotationSide: -45,
  width: 900,
  height: 1800,
  originX: 450,
  originY: 900,
  globalOffsetX: 0,
  globalOffsetY: 0,
  globalScale: 1,
};

function generatePositions(geometry: BraidGeometry) {
  const positions: { x: number; y: number; type: 'center' | 'left' | 'right'; index: number }[] = [];
  const centerIndex = 7; // 0..14
  const sideYOffset = geometry.verticalSpacing * geometry.sideVerticalOffsetFactor;
  for (let i = 0; i < 15; i++) {
    const rel = i - centerIndex;
    const yCenter = geometry.originY + rel * geometry.verticalSpacing;
    const xCenter = geometry.originX;

    positions.push({ x: xCenter, y: yCenter, type: 'center', index: i });
    positions.push({ x: xCenter - geometry.sideOffset, y: yCenter + sideYOffset, type: 'left', index: i });
    positions.push({ x: xCenter + geometry.sideOffset, y: yCenter - sideYOffset, type: 'right', index: i });
  }
  return positions;
}

type BraidExactProps = {
  geometry?: Partial<BraidGeometry>;
};

export const BraidExact: React.FC<BraidExactProps> = ({ geometry = {} }) => {
  const g: BraidGeometry = { ...DEFAULT_BRAID_GEOMETRY, ...geometry };
  const positions = generatePositions(g);

  // Render side rings first to approximate lattice overlap; center rings last
  const side = positions.filter(p => p.type !== 'center').sort((a, b) => a.y - b.y);
  const center = positions.filter(p => p.type === 'center').sort((a, b) => a.y - b.y);

  return (
    <svg width={g.width} height={g.height} viewBox={`0 0 ${g.width} ${g.height}`} shapeRendering="geometricPrecision">
      {/* Optional dev grid */}
      {/* <rect x={0} y={0} width={g.width} height={g.height} fill="#0b1020" /> */}

      <g transform={`translate(${g.globalOffsetX}, ${g.globalOffsetY}) scale(${g.globalScale})`}>
        {side.map((p, i) => (
          <g key={`s-${i}`}>
            <circle
              cx={p.x}
              cy={p.y}
              r={g.circleRadius}
              fill={g.ringFill}
              fillOpacity={g.ringFillOpacity}
              stroke={g.circleStroke}
              strokeWidth={g.circleStrokeWidth}
              vectorEffect="non-scaling-stroke"
            />
            <YinYang
              cx={p.x}
              cy={p.y}
              r={g.taijituSideSize}
              rotationDeg={g.taijituRotationSide}
            />
          </g>
        ))}
      </g>

      <g transform={`translate(${g.globalOffsetX}, ${g.globalOffsetY}) scale(${g.globalScale})`}>
        {center.map((p, i) => (
          <g key={`c-${i}`}>
            <circle
              cx={p.x}
              cy={p.y}
              r={g.circleRadius}
              fill={g.ringFill}
              fillOpacity={g.ringFillOpacity}
              stroke={g.circleStroke}
              strokeWidth={g.circleStrokeWidth}
              vectorEffect="non-scaling-stroke"
            />
            <YinYang
              cx={p.x}
              cy={p.y}
              r={g.taijituSize}
              rotationDeg={g.taijituRotationCenter}
            />
          </g>
        ))}
      </g>
    </svg>
  );
};

export default BraidExact;

