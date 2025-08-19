import React, { useEffect, useMemo, useState } from 'react';

// Placeholder: This component mirrors the structure expected from the GitLab Angular braid,
// and will render once we import the exact <defs> and arrays from nvx_braid_fixes2.
// It fetches tonalities JSON and exposes a key select. When the actual SVG <defs>
// (paths, gradients, filters) are pasted in, this will produce the exact classic braid.

export type TonalityKey = string;
export type BraidTonalities = Record<string, any>;

const KEYS_FALLBACK = ['C','G','D','A','E','B','F#','C#','F','Bb','Eb','Ab','Db','Gb','Cb'];

const Select: React.FC<{
  value: string;
  onChange: (v: string) => void;
  options: string[];
}> = ({ value, onChange, options }) => (
  <label className="flex items-center gap-2 text-sm">
    <span className="text-muted-foreground">Key</span>
    <select
      className="border rounded px-2 py-1 bg-background"
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
    return Object.keys(tonalities);
  }, [tonalities]);

  // Derived arrays (placeholders). Once we paste the exact nvx_braid_fixes2 logic,
  // these will pull center/left/right/outer arrays exactly as in Angular.
  const arrays = useMemo(() => {
    const t = tonalities?.[keySel] ?? {};
    return {
      center_up: t.center_minor ?? [],
      center_left: t.center_major ?? [],
      center_right: t.center_minor ?? [],
      left_up: t.left_up ?? [],
      left_down: t.left_down ?? [],
      right_up: t.right_up ?? [],
      right_down: t.right_down ?? [],
      outer_left_up: t.outer_left_up ?? [],
      outer_left_down: t.outer_left_down ?? [],
      outer_right_up: t.outer_right_up ?? [],
      outer_right_down: t.outer_right_down ?? [],
    };
  }, [tonalities, keySel]);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-mono font-semibold">Classic Braid (nvx_braid_fixes2)</h2>
        <div className="flex items-center gap-3">
          <Select value={keySel} onChange={setKeySel} options={keys} />
        </div>
      </div>

      {/* Info block until defs are pasted */}
      {!tonalities && (
        <div className="text-sm text-muted-foreground">
          {error ? `Failed to load braid_tonalities.json: ${error}` : 'Loading braid_tonalities.json ...'}
        </div>
      )}

      <div className="bg-muted rounded p-4 overflow-auto">
        <div className="w-full flex justify-center">
          <svg
            width={1200}
            height={2400}
            viewBox="0 0 1200 2400"
            xmlns="http://www.w3.org/2000/svg"
            shapeRendering="geometricPrecision"
          >
            <defs>
              {/* TODO: Paste exact <defs> from braid.component.html (nvx_braid_fixes2) here */}
              {/* gradients, filters, and shapes: circle, rects, arrows, commas, etc. */}
            </defs>

            {/* TODO: Paste exact background circles layout (greenCircle) */}

            {/* Example of how to mirror Angular *ngFor -> map with translate */}
            {/* Center column bubbles (placeholder) */}
            <g id="centerColumn">
              {arrays.center_left.map((label: string, i: number) => (
                <g key={`center-${i}`} transform={`translate(600 ${(i + 1) * 90})`}>
                  {/* TODO: replace with <use href="#commaId"/> and text styling from SCSS */}
                  <circle r={28} cx={0} cy={0} fill="hsl(var(--muted-foreground) / 0.15)" />
                  <text x={0} y={4} textAnchor="middle" className="font-mono" fill="hsl(var(--foreground))">
                    {label}
                  </text>
                </g>
              ))}
            </g>

            {/* TODO: Add left/right columns, outer columns, arrows and link rectangles */}
          </svg>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Note: This is a scaffold awaiting the exact SVG &lt;defs&gt; and arrays from GitLab nvx_braid_fixes2. Once imported, it will render the classic braid identically.
      </p>
    </section>
  );
};

export default BraidClassic;
