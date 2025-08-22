// Canonical harmonic profile definitions (single source of truth)

// Group → ordered chord slots
export const CHORD_GROUPS = {
  Major: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'viiø'],
  Applied: ['I7', 'iiiø', 'II(7)', '#ivø', 'III(7)', '#vº', 'VI(7)', '#iº', 'VII(7)', '#iiº'],
  Minor: ['i', 'iiø', 'bIII', 'iv', 'v', 'bVI', 'bVII', 'V(b9)', 'viiº'],
  Other: ['Other']
} as const;

// Flat list in canonical order (27 slots including Other)
export const CHORD_SLOTS: string[] = [
  ...CHORD_GROUPS.Major,
  ...CHORD_GROUPS.Applied,
  ...CHORD_GROUPS.Minor,
  ...CHORD_GROUPS.Other,
];

// Simple note-name mapping for C major/C minor context used in axis helpers
export const NOTE_MAPPING: Record<string, string> = {
  // Major Key
  I: 'C', ii: 'Dm', iii: 'Em', IV: 'F', V: 'G', vi: 'Am', 'viiø': 'B°',
  // Minor Key (C minor reference)
  i: 'Cm', 'iiø': 'Dø', 'bIII': 'E♭', iv: 'Fm', v: 'Gm', 'bVI': 'A♭', 'bVII': 'B♭', 'V(b9)': 'G7♭9', 'viiº': 'B°',
  // Applied / Non‑diatonic
  'I7': 'C7', 'iiiø': 'Eø', 'II(7)': 'D7', '#ivø': 'F#ø', 'III(7)': 'E7', '#vº': 'G#°',
  'VI(7)': 'A7', '#iº': 'C#°', 'VII(7)': 'B7', '#iiº': 'D#°',
  Other: ''
};

// Dynamic note mapping by key (letters beneath Roman numerals)
// Supports common 12 major and 12 minor keys
export function getNoteMappingForKey(key: string | undefined): Record<string, string> {
  if (!key) return NOTE_MAPPING;
  const k = key.trim();
  const majorMap: Record<string, Record<string, string>> = {
    'C': { I: 'C', ii: 'Dm', iii: 'Em', IV: 'F', V: 'G', vi: 'Am', 'viiø': 'Bm7♭5' },
    'G': { I: 'G', ii: 'Am', iii: 'Bm', IV: 'C', V: 'D', vi: 'Em', 'viiø': 'F#m7♭5' },
    'D': { I: 'D', ii: 'Em', iii: 'F#m', IV: 'G', V: 'A', vi: 'Bm', 'viiø': 'C#m7♭5' },
    'A': { I: 'A', ii: 'Bm', iii: 'C#m', IV: 'D', V: 'E', vi: 'F#m', 'viiø': 'G#m7♭5' },
    'E': { I: 'E', ii: 'F#m', iii: 'G#m', IV: 'A', V: 'B', vi: 'C#m', 'viiø': 'D#m7♭5' },
    'B': { I: 'B', ii: 'C#m', iii: 'D#m', IV: 'E', V: 'F#', vi: 'G#m', 'viiø': 'A#m7♭5' },
    'F#': { I: 'F#', ii: 'G#m', iii: 'A#m', IV: 'B', V: 'C#', vi: 'D#m', 'viiø': 'E#m7♭5' },
    'C#': { I: 'C#', ii: 'D#m', iii: 'E#m', IV: 'F#', V: 'G#', vi: 'A#m', 'viiø': 'B#m7♭5' },
    'F': { I: 'F', ii: 'Gm', iii: 'Am', IV: 'Bb', V: 'C', vi: 'Dm', 'viiø': 'Em7♭5' },
    'Bb': { I: 'Bb', ii: 'Cm', iii: 'Dm', IV: 'Eb', V: 'F', vi: 'Gm', 'viiø': 'Am7♭5' },
    'Eb': { I: 'Eb', ii: 'Fm', iii: 'Gm', IV: 'Ab', V: 'Bb', vi: 'Cm', 'viiø': 'Dm7♭5' },
    'Ab': { I: 'Ab', ii: 'Bbm', iii: 'Cm', IV: 'Db', V: 'Eb', vi: 'Fm', 'viiø': 'Gm7♭5' },
  };
  const minorMap: Record<string, Record<string, string>> = {
    'A': { i: 'Am', 'iiø': 'Bm7♭5', 'bIII': 'C', iv: 'Dm', v: 'Em', 'bVI': 'F', 'bVII': 'G' },
    'E': { i: 'Em', 'iiø': 'F#m7♭5', 'bIII': 'G', iv: 'Am', v: 'Bm', 'bVI': 'C', 'bVII': 'D' },
    'B': { i: 'Bm', 'iiø': 'C#m7♭5', 'bIII': 'D', iv: 'Em', v: 'F#m', 'bVI': 'G', 'bVII': 'A' },
    'F#': { i: 'F#m', 'iiø': 'G#m7♭5', 'bIII': 'A', iv: 'Bm', v: 'C#m', 'bVI': 'D', 'bVII': 'E' },
    'C#': { i: 'C#m', 'iiø': 'D#m7♭5', 'bIII': 'E', iv: 'F#m', v: 'G#m', 'bVI': 'A', 'bVII': 'B' },
    'G#': { i: 'G#m', 'iiø': 'A#m7♭5', 'bIII': 'B', iv: 'C#m', v: 'D#m', 'bVI': 'E', 'bVII': 'F#' },
    'D#': { i: 'D#m', 'iiø': 'E#m7♭5', 'bIII': 'F#', iv: 'G#m', v: 'A#m', 'bVI': 'B', 'bVII': 'C#' },
    'A#': { i: 'A#m', 'iiø': 'B#m7♭5', 'bIII': 'C#', iv: 'D#m', v: 'E#m', 'bVI': 'F#', 'bVII': 'G#' },
    'D': { i: 'Dm', 'iiø': 'Em7♭5', 'bIII': 'F', iv: 'Gm', v: 'Am', 'bVI': 'Bb', 'bVII': 'C' },
    'G': { i: 'Gm', 'iiø': 'Am7♭5', 'bIII': 'Bb', iv: 'Cm', v: 'Dm', 'bVI': 'Eb', 'bVII': 'F' },
    'C': { i: 'Cm', 'iiø': 'Dm7♭5', 'bIII': 'Eb', iv: 'Fm', v: 'Gm', 'bVI': 'Ab', 'bVII': 'Bb' },
    'F': { i: 'Fm', 'iiø': 'Gm7♭5', 'bIII': 'Ab', iv: 'Bbm', v: 'Cm', 'bVI': 'Db', 'bVII': 'Eb' },
  };

  // Determine mode: treat keys ending with ' Minor' as minor, otherwise strip ' Major'
  const normalized = k.replace(/\s+(Major|Minor)$/i, '');
  // Per spec: even when key is minor, display the corresponding MAJOR letter naming for that tonic
  const diatonic = majorMap[normalized];
  if (!diatonic) return NOTE_MAPPING;

  // Start from static NOTE_MAPPING and override diatonic entries for the selected key
  return {
    ...NOTE_MAPPING,
    ...diatonic,
  };
}

