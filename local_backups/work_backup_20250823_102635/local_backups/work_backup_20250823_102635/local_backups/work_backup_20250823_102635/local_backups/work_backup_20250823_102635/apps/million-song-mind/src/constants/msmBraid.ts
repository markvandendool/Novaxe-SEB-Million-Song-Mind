import type { BraidGeometry } from '@/components/BraidExact';

// Million Song Mind preset tuned to match Novaxe braid layout
export const MSM_BRAID_GEOMETRY: Partial<BraidGeometry> = {
  circleRadius: 60,
  verticalSpacing: 90,
  sideOffset: 120,
  sideVerticalOffsetFactor: 0.5,

  // Use design system tokens
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