export type BraidTonalities = Record<string, Record<string, string[]>>;

export type TonalityValidation = {
  key: string;
  lanesMissingI: string[]; // list of lane names where 'I' not found
  issues: string[]; // additional notes
};

const LANES = [
  'center_major',
  'center_minor',
  'left_up',
  'left_down',
  'right_up',
  'right_down',
  'outer_left_up',
  'outer_left_down',
  'outer_right_up',
  'outer_right_down',
];

export async function fetchAndValidateTonalities(path = '/assets/braid_tonalities.json') {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json: BraidTonalities = await res.json();
    const report = validateBraidTonalities(json);
    // Developer-friendly console output
    const summary = report.map(r => ({ key: r.key, missingIn: r.lanesMissingI.join(', ') || '—' }));
    console.groupCollapsed('[Braid Validation] I-chord presence by key');
    console.table(summary);
    console.groupEnd();
    const offenders = report.filter(r => r.lanesMissingI.length > 0);
    if (offenders.length) {
      console.warn('[Braid Validation] Keys with I-chord missing in some lanes:', offenders.map(o => o.key));
    }
    return report;
  } catch (e) {
    console.error('[Braid Validation] Failed to load tonalities JSON:', e);
    return [] as TonalityValidation[];
  }
}

export function validateBraidTonalities(tonalities: BraidTonalities): TonalityValidation[] {
  const out: TonalityValidation[] = [];
  for (const key of Object.keys(tonalities)) {
    const t = tonalities[key] || {};
    const lanesMissingI: string[] = [];
    const issues: string[] = [];
    for (const lane of LANES) {
      const arr = (t[lane] as string[]) || [];
      const hasI = arr.some(label => (label || '').trim() === 'I');
      if (!hasI) lanesMissingI.push(lane);
    }
    // Additional sanity checks
    if (!Array.isArray(t['center_major']) || !Array.isArray(t['center_minor'])) {
      issues.push('center arrays missing or not arrays');
    }
    out.push({ key, lanesMissingI, issues });
  }
  return out;
}
