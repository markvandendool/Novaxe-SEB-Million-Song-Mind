// Roman numeral mapping loader and normalizer
// Parses a comprehensive CSV mapping of Roman numeral permutations to canonical 27-slot labels

// Import CSV content at build time as raw text (Vite supports ?raw)
// Place the CSV at src/assets/roman-mapping.csv
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - vite raw import
import mappingCsv from '@/assets/roman-mapping.csv?raw';

// Simple CSV line parser that respects quotes
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result.map(f => f.replace(/^\s*"|"\s*$/g, '')); // strip outer quotes
}

// Build alias -> canonical slot(s) map at module init
const aliasToSlots = new Map<string, Set<string>>();

(function buildAliasMap() {
  if (!mappingCsv) return;
  const lines = mappingCsv.replace(/\uFEFF/g, '').split(/\r?\n/).filter(Boolean);
  // Expect header: Harmonic_Profile_Slot,Mapped_Symbols,Notes
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (!cols.length) continue;
    const slot = (cols[0] || '').trim();
    const symbolsField = (cols[1] || '').trim();
    if (!slot || !symbolsField) continue;
    const symbols = symbolsField.split(',').map(s => s.trim()).filter(Boolean);
    for (const sym of symbols) {
      const key = normalizeToken(sym);
      if (!key) continue;
      let set = aliasToSlots.get(key);
      if (!set) {
        set = new Set<string>();
        aliasToSlots.set(key, set);
      }
      set.add(slot);
    }
  }
})();

function isMinorKey(key: string | undefined): boolean {
  if (!key) return false;
  const k = key.trim();
  // Common encodings: "C Minor", "Cm", "A minor"
  return /minor$/i.test(k) || /(^|\s)[A-G](?:#|b)?m(\s|$)/i.test(k);
}

// Normalize input token into the same format used by mapping keys
function normalizeToken(raw: string): string {
  let t = (raw || '').trim();
  if (!t) return '';
  // Strip barlines and trailing punctuation
  t = t.replace(/[|;,]+/g, '').replace(/^\(+|\)+$/g, '');
  // Normalize diminished symbol
  t = t.replace('vii°', 'viiº');
  // Collapse double carets (defensive)
  t = t.replace(/\^\^/g, '^');
  return t;
}

// Attempt to map a roman token to one of the 27 canonical slots
export function mapRomanToSlot(token: string, key?: string): string | undefined {
  let t = normalizeToken(token);
  if (!t) return undefined;

  // Heuristic: bare applied dominants default to 7
  if (/^[#b]?(II|III|VI|VII)$/.test(t)) {
    t = t + '7';
  }

  // Try exact match first
  let targets = aliasToSlots.get(t);

  // If not found, try dropping slash bass part
  if (!targets && t.includes('/')) {
    const base = t.split('/')[0];
    targets = aliasToSlots.get(base);
  }

  if (!targets || targets.size === 0) return undefined;

  if (targets.size === 1) return targets.values().next().value;

  // Disambiguation by key context (e.g., 'V' appears in both Major V and Minor V(7) groups)
  const preferMinor = isMinorKey(key);
  const candidates = Array.from(targets);
  if (preferMinor) {
    // Prefer Minor/applied variants when ambiguous
    const minorFirst = candidates.find(c => /\b(V\(7\)|i|iv|v|bIII|bVI|bVII|iiø|viiº)\b/.test(c));
    if (minorFirst) return minorFirst;
  } else {
    const majorFirst = candidates.find(c => /\b(I|ii|iii|IV|V|vi|viiø)\b/.test(c));
    if (majorFirst) return majorFirst;
  }
  // Fallback: deterministic first
  return candidates[0];
}

// Tokenize a roman numeral progression string into meaningful tokens
export function tokenizeRomanProgression(text: string): string[] {
  const cleaned = (text || '')
    .replace(/<[^>]+>/g, ' ') // remove section tags
    .replace(/\s+/g, ' ')    // normalize spaces
    .trim();
  if (!cleaned) return [];

  const rough = cleaned.split(' ').map(s => s.trim()).filter(Boolean);
  const romanStart = /^[#b]?(?:I{1,3}|IV|V|VI{0,2}|VII|i{1,3}|iv|v|vi{0,2}|vii)/;

  const tokens: string[] = [];
  for (const piece of rough) {
    const stripped = piece.replace(/^[|]+|[|]+$/g, '');
    if (!romanStart.test(stripped)) continue;
    tokens.push(stripped);
  }
  return tokens;
}

export type RomanAliasMap = Map<string, Set<string>>;
export const __debug_aliasToSlots: RomanAliasMap = aliasToSlots; // for diagnostics
