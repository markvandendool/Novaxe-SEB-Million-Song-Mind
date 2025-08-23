import React from 'react';

export type YinYangProps = {
  cx: number;
  cy: number;
  r: number;
  rotationDeg?: number;
  darkFill?: string;
  lightFill?: string;
  stroke?: string;
  strokeWidth?: number;
};

/**
 * Precise Taijitu (yin-yang) built exclusively from SVG elliptical arcs.
 * Orientation: dark on top, light on bottom (classic). Use rotationDeg to adjust.
 */
export const YinYang: React.FC<YinYangProps> = ({
  cx,
  cy,
  r,
  rotationDeg = 0,
  darkFill = '#111827', // slate-900
  lightFill = '#d1d5db', // gray-300
  stroke = '#111827',
  strokeWidth = 0,
}) => {
  const halfR = r / 2;
  const topY = cy - r;
  const bottomY = cy + r;

  const groupTransform = rotationDeg !== 0 ? `rotate(${rotationDeg} ${cx} ${cy})` : undefined;

  // Dark half path (top-dominant)
  const darkPath = [
    `M ${cx} ${topY}`,
    `A ${r} ${r} 0 0 1 ${cx} ${bottomY}`,
    `A ${halfR} ${halfR} 0 0 0 ${cx} ${cy}`,
    `A ${halfR} ${halfR} 0 0 1 ${cx} ${topY}`,
    'Z',
  ].join(' ');

  // Light half path (bottom-dominant)
  const lightPath = [
    `M ${cx} ${topY}`,
    `A ${halfR} ${halfR} 0 0 1 ${cx} ${cy}`,
    `A ${halfR} ${halfR} 0 0 0 ${cx} ${bottomY}`,
    `A ${r} ${r} 0 0 1 ${cx} ${topY}`,
    'Z',
  ].join(' ');

  return (
    <g transform={groupTransform} shapeRendering="geometricPrecision">
      {/* Outer circle (invisible, for alignment reference if needed) */}
      {/* <circle cx={cx} cy={cy} r={r} fill="none" stroke={stroke} strokeWidth={strokeWidth} /> */}

      <path d={darkPath} fill={darkFill} stroke={stroke} strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" />
      <path d={lightPath} fill={lightFill} stroke={stroke} strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" />

      {/* Dots */}
      <circle cx={cx} cy={cy - halfR} r={r / 6} fill={lightFill} stroke={stroke} strokeWidth={strokeWidth * 0.5} vectorEffect="non-scaling-stroke" />
      <circle cx={cx} cy={cy + halfR} r={r / 6} fill={darkFill} stroke={stroke} strokeWidth={strokeWidth * 0.5} vectorEffect="non-scaling-stroke" />
    </g>
  );
};

export default YinYang;

