import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';

interface TonalSet {
  center_major: string[];
  center_minor: string[];
  left_up: string[];
  left_down: string[];
  right_up: string[];
  right_down: string[];
  outer_left_up: string[];
  outer_left_down: string[];
  outer_right_up: string[];
  outer_right_down: string[];
}

interface BraidTonalities {
  roman: TonalSet;
  empty: Record<string, string[]>;
  [key: string]: any;
}

function rotate<T>(arr: T[], n: number): T[] {
  const a = arr.slice();
  if (a.length === 0) return a;
  const k = ((n % a.length) + a.length) % a.length;
  return a.slice(k).concat(a.slice(0, k));
}

const KEYS_FALLBACK = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'];

const Select: React.FC<{
  value: string;
  onChange: (v: string) => void;
  options: string[];
}> = ({ value, onChange, options }) => (
  <label className="flex items-center gap-2 text-sm">
    <span className="text-muted-foreground">Key</span>
    <select
      className="border border-border rounded px-2 py-1 bg-background text-foreground"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((k) => (
        <option key={k} value={k}>{k}</option>
      ))}
    </select>
  </label>
);

const BraidClassic: React.FC = () => {
  const [tonalities, setTonalities] = useState<BraidTonalities | null>(null);
  const [keySel, setKeySel] = useState<string>('C');
  const [displayRoman, setDisplayRoman] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch('/assets/braid_tonalities.json')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => {
        if (mounted) setTonalities(json);
      })
      .catch((e) => {
        if (mounted) setError(String(e));
      });
    return () => { mounted = false; };
  }, []);

  const keys = useMemo(() => {
    if (!tonalities) return KEYS_FALLBACK;
    return Object.keys(tonalities).filter(k => k !== 'roman' && k !== 'empty');
  }, [tonalities]);

  const braidData = useMemo(() => {
    if (!tonalities) return null;

    const currentSet = tonalities[keySel] as TonalSet;
    const romanSet = tonalities.roman as TonalSet;

    if (!currentSet || !romanSet) return null;

    const getInUse = (noteArr: string[], romanArr: string[], rotation = 0) => {
      const rotatedRoman = rotate(romanArr, rotation);
      return displayRoman ? rotatedRoman : noteArr;
    };

    const isMinor = keySel.endsWith('m');
    const romanRotation = displayRoman ? (isMinor ? -3 : 0) : 0;

    return {
      center_major: getInUse(currentSet.center_major, romanSet.center_major, romanRotation),
      center_minor: getInUse(currentSet.center_minor, romanSet.center_minor, romanRotation),
      left_up: getInUse(currentSet.left_up, romanSet.left_up, romanRotation),
      left_down: getInUse(currentSet.left_down, romanSet.left_down, romanRotation),
      right_up: getInUse(currentSet.right_up, romanSet.right_up, romanRotation),
      right_down: getInUse(currentSet.right_down, romanSet.right_down, romanRotation),
      outer_left_up: getInUse(currentSet.outer_left_up, romanSet.outer_left_up, romanRotation),
      outer_left_down: getInUse(currentSet.outer_left_down, romanSet.outer_left_down, romanRotation),
      outer_right_up: getInUse(currentSet.outer_right_up, romanSet.outer_right_up, romanRotation),
      outer_right_down: getInUse(currentSet.outer_right_down, romanSet.outer_right_down, romanRotation),
    };
  }, [tonalities, keySel, displayRoman]);

  // Bubble component
  const BraidBubble: React.FC<{
    x: number;
    y: number;
    label: string;
    isActive?: boolean;
    size?: number;
  }> = ({ x, y, label, isActive = false, size = 28 }) => (
    <g transform={`translate(${x}, ${y})`}>
      <circle
        r={size}
        fill={isActive ? "hsl(var(--primary) / 0.2)" : "hsl(var(--muted) / 0.3)"}
        stroke={isActive ? "hsl(var(--primary))" : "hsl(var(--border))"}
        strokeWidth={isActive ? "2" : "1"}
        className="cursor-pointer transition-all hover:fill-primary/30 hover:stroke-primary"
      />
      <text
        x="0"
        y="5"
        textAnchor="middle"
        className=" text-sm fill-foreground pointer-events-none"
      >
        {label}
      </text>
    </g>
  );

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg  font-semibold">Classic Braid (nvx_braid_fixes2)</h2>
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant={displayRoman ? "default" : "outline"}
            size="sm"
            onClick={() => setDisplayRoman(!displayRoman)}
            className=""
          >
            {displayRoman ? 'Roman' : 'Notes'}
          </Button>
          <Select value={keySel} onChange={setKeySel} options={keys} />
        </div>
      </div>

      {!tonalities && (
        <div className="text-sm text-muted-foreground">
          {error ? `Failed to load braid_tonalities.json: ${error}` : 'Loading braid_tonalities.json ...'}
        </div>
      )}

      {braidData && (
        <div className="bg-card rounded-lg p-6 overflow-auto border">
          <div className="w-full flex justify-center">
            <svg
              width={1200}
              height={800}
              viewBox="0 0 1200 800"
              className="w-full h-auto"
              style={{ maxHeight: '80vh' }}
            >
              <defs>
                {/* Background circles gradient */}
                <radialGradient id="bgGradient" cx="50%" cy="50%">
                  <stop offset="0%" stopColor="hsl(var(--muted) / 0.1)" />
                  <stop offset="100%" stopColor="hsl(var(--muted) / 0.05)" />
                </radialGradient>

                {/* Connection lines gradient */}
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--border) / 0.3)" />
                  <stop offset="50%" stopColor="hsl(var(--border) / 0.6)" />
                  <stop offset="100%" stopColor="hsl(var(--border) / 0.3)" />
                </linearGradient>
              </defs>

              {/* Background lattice structure */}
              <g opacity="0.3">
                {/* Horizontal guide lines */}
                {[200, 400, 600].map(y => (
                  <line key={`h-${y}`} x1="50" y1={y} x2="1150" y2={y} stroke="url(#lineGradient)" strokeWidth="1" />
                ))}
                {/* Vertical guide lines */}
                {[300, 600, 900].map(x => (
                  <line key={`v-${x}`} x1={x} y1="50" x2={x} y2="750" stroke="url(#lineGradient)" strokeWidth="1" />
                ))}
              </g>

              {/* Background circles for visual depth */}
              <g opacity="0.1">
                <circle cx="600" cy="400" r="350" fill="url(#bgGradient)" />
                <circle cx="300" cy="200" r="180" fill="url(#bgGradient)" />
                <circle cx="900" cy="200" r="180" fill="url(#bgGradient)" />
                <circle cx="300" cy="600" r="180" fill="url(#bgGradient)" />
                <circle cx="900" cy="600" r="180" fill="url(#bgGradient)" />
              </g>

              {/* Center Major Column (Left Center) */}
              <g id="centerMajor">
                {braidData.center_major.slice(0, 17).map((label: string, i: number) => (
                  <BraidBubble
                    key={`cm-${i}`}
                    x={520}
                    y={80 + i * 40}
                    label={label}
                    isActive={label === 'I' || label === keySel}
                  />
                ))}
              </g>

              {/* Center Minor Column (Right Center) */}
              <g id="centerMinor">
                {braidData.center_minor.slice(0, 17).map((label: string, i: number) => (
                  <BraidBubble
                    key={`cm-${i}`}
                    x={680}
                    y={80 + i * 40}
                    label={label}
                    isActive={label === 'i' || label === 'I'}
                  />
                ))}
              </g>

              {/* Left Up Column */}
              <g id="leftUp">
                {braidData.left_up.slice(0, 15).map((label: string, i: number) => (
                  <BraidBubble
                    key={`lu-${i}`}
                    x={360}
                    y={120 + i * 40}
                    label={label}
                    size={24}
                  />
                ))}
              </g>

              {/* Left Down Column */}
              <g id="leftDown">
                {braidData.left_down.slice(0, 15).map((label: string, i: number) => (
                  <BraidBubble
                    key={`ld-${i}`}
                    x={400}
                    y={160 + i * 40}
                    label={label}
                    size={24}
                  />
                ))}
              </g>

              {/* Right Up Column */}
              <g id="rightUp">
                {braidData.right_up.slice(0, 15).map((label: string, i: number) => (
                  <BraidBubble
                    key={`ru-${i}`}
                    x={840}
                    y={120 + i * 40}
                    label={label}
                    size={24}
                  />
                ))}
              </g>

              {/* Right Down Column */}
              <g id="rightDown">
                {braidData.right_down.slice(0, 15).map((label: string, i: number) => (
                  <BraidBubble
                    key={`rd-${i}`}
                    x={800}
                    y={160 + i * 40}
                    label={label}
                    size={24}
                  />
                ))}
              </g>

              {/* Outer Left Up Column */}
              <g id="outerLeftUp">
                {braidData.outer_left_up.slice(0, 15).map((label: string, i: number) => (
                  <BraidBubble
                    key={`olu-${i}`}
                    x={200}
                    y={160 + i * 40}
                    label={label}
                    size={20}
                  />
                ))}
              </g>

              {/* Outer Left Down Column */}
              <g id="outerLeftDown">
                {braidData.outer_left_down.slice(0, 15).map((label: string, i: number) => (
                  <BraidBubble
                    key={`old-${i}`}
                    x={240}
                    y={200 + i * 40}
                    label={label}
                    size={20}
                  />
                ))}
              </g>

              {/* Outer Right Up Column */}
              <g id="outerRightUp">
                {braidData.outer_right_up.slice(0, 15).map((label: string, i: number) => (
                  <BraidBubble
                    key={`oru-${i}`}
                    x={1000}
                    y={160 + i * 40}
                    label={label}
                    size={20}
                  />
                ))}
              </g>

              {/* Outer Right Down Column */}
              <g id="outerRightDown">
                {braidData.outer_right_down.slice(0, 15).map((label: string, i: number) => (
                  <BraidBubble
                    key={`ord-${i}`}
                    x={960}
                    y={200 + i * 40}
                    label={label}
                    size={20}
                  />
                ))}
              </g>

              {/* Connection arrows between columns */}
              <g opacity="0.4">
                {/* Center connections */}
                <path d="M 540 400 Q 600 380 660 400" stroke="hsl(var(--primary))" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />

                {/* Left side connections */}
                <path d="M 380 300 Q 450 280 500 300" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" fill="none" />
                <path d="M 260 350 Q 330 330 380 350" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" fill="none" />

                {/* Right side connections */}
                <path d="M 700 300 Q 750 280 820 300" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" fill="none" />
                <path d="M 820 350 Q 880 330 980 350" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" fill="none" />
              </g>

              {/* Arrow marker definition */}
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--primary))" />
                </marker>
              </defs>
            </svg>
          </div>
        </div>
      )}

      <div className="text-xs text-muted-foreground space-y-1">
        <p>
          <strong>Classic Braid:</strong> Full harmonic lattice with center major/minor columns, flanked by up/down progressions and outer fifth relationships.
        </p>
        <p>
          Toggle between note names and Roman numerals. Key selection updates all tonality relationships dynamically.
        </p>
      </div>
    </section>
  );
};

export default BraidClassic;
