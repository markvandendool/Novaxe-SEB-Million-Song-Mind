import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Billboard, Text } from '@react-three/drei';

export type BraidTorus3DProps = {
  focusKey?: string | null;
  zoom?: number;
  onZoomChange?: (z: number) => void;
  onChordClick?: (chord: string) => void;
};

const MAJOR_CYCLE_12 = [
  'C/Am',
  'G',
  'D',
  'A',
  'E',
  'B',
  'F#/Gb',
  'Db/C#',
  'Ab/G#',
  'Eb/D#',
  'Bb/A#',
  'F',
];

// Map minor keys to their relative major for highlighting purposes
const RELATIVE_MAJOR: Record<string, string> = {
  'Am': 'C', 'Em': 'G', 'Bm': 'D', 'F#m': 'A', 'C#m': 'E', 'G#m': 'B',
  'D#m': 'F#', 'Ebm': 'Gb',
  'Dbm': 'E', 'Abm': 'B', 'Bbm': 'Db',
  'Fm': 'Ab', 'Cm': 'Eb', 'Gm': 'Bb', 'Dm': 'F',
  'A#m': 'C#',
};

function canonicalMajor(focusKey?: string | null): string | null {
  if (!focusKey) return null;
  const k = focusKey.trim();
  // If already a major like 'C' or 'Gb'
  if (!k.endsWith('m')) return k.replace('maj', '').replace('Major', '');
  // Try dictionary
  if (RELATIVE_MAJOR[k]) return RELATIVE_MAJOR[k];
  // Simple common-case mapping
  switch (k) {
    case 'Am': return 'C';
    case 'Em': return 'G';
    case 'Bm': return 'D';
    case 'F#m': return 'A';
    case 'C#m': return 'E';
    case 'G#m': return 'B';
    case 'D#m':
    case 'Ebm': return 'F#';
    case 'Bbm':
    case 'A#m': return 'Db';
    case 'Fm': return 'Ab';
    case 'Cm': return 'Eb';
    case 'Gm': return 'Bb';
    case 'Dm': return 'F';
    default: return k.replace('m', '').toUpperCase();
  }
}

function labelMatches(label: string, major: string | null) {
  if (!major) return false;
  return label.split('/').some(part => part.replace('m', '') === major.replace('m', ''));
}

function KeyMarker({ label, angle, active, onClick }: { label: string; angle: number; active: boolean; onClick?: () => void }) {
  // Torus parameters must match the base torus for alignment
  const R = 2.2; // major radius
  const r = 0.6; // minor radius

  // Place markers on the outer rim (facing camera initially)
  // 12 o'clock is angle = 0 (positive Y). Clockwise increases angle negatively
  const theta = -angle; // clockwise
  const x = (R + r + 0.05) * Math.cos(theta);
  const y = (R + r + 0.05) * Math.sin(theta);
  const z = 0;

  const base = active ? '#22d3ee' : '#94a3b8';
  const emissive = active ? '#22d3ee' : '#000000';

  return (
    <group position={[x, y, z]}>
      <mesh onPointerDown={onClick} castShadow receiveShadow>
        <sphereGeometry args={[0.07, 24, 24]} />
        <meshStandardMaterial color={base} emissive={emissive} emissiveIntensity={active ? 0.5 : 0.0} metalness={0.1} roughness={0.4} />
      </mesh>
      <Billboard position={[0, 0.16, 0]}>
        <Text
          color={active ? '#e2e8f0' : '#cbd5e1'}
          anchorX="center"
          anchorY="middle"
          outlineColor="black"
          outlineWidth={0.005}
        >
          {label}
        </Text>
      </Billboard>
    </group>
  );
}

const BaseTorus: React.FC<{ tintActive: boolean }> = ({ tintActive }) => (
  <mesh receiveShadow castShadow>
    <torusGeometry args={[2.2, 0.6, 64, 256]} />
    <meshStandardMaterial color={tintActive ? '#5eead4' : '#9ca3af'} metalness={0.2} roughness={0.35} />
  </mesh>
);

const BraidTorus3D: React.FC<BraidTorus3DProps> = ({ focusKey, onChordClick }) => {
  const major = useMemo(() => canonicalMajor(focusKey || undefined), [focusKey]);

  return (
    <section style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas camera={{ position: [0, 0, 6], fov: 60 }} shadows>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.9} castShadow />

        {/* Torus base */}
        <BaseTorus tintActive={!!major} />

        {/* 12 key centers positioned around the ring */}
        {MAJOR_CYCLE_12.map((label, i) => {
          const angle = (i / 12) * Math.PI * 2; // 0..2π
          const isActive = labelMatches(label, major);
          return (
            <KeyMarker
              key={label}
              label={label}
              angle={angle}
              active={isActive}
              onClick={() => onChordClick?.(label)}
            />
          );
        })}

        <OrbitControls enablePan={false} enableDamping makeDefault autoRotate autoRotateSpeed={0.5} />
        <Environment preset="city" />
      </Canvas>

      <div style={{ position: 'absolute', top: 12, left: 12, padding: '6px 10px', borderRadius: 8, fontFamily: 'nvxChord, monospace', opacity: 0.9, background: 'rgba(0,0,0,0.45)', color: 'white' }}>
        3D Braid Map — 12 keys around torus{major ? ` • focus: ${major}` : ''}
      </div>
    </section>
  );
};

export default BraidTorus3D;
