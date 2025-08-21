/**
 * DEFINITIVE BRAID TO HARMONIC PROFILE MAPPING
 * Date: August 21, 2025
 * Source: User-specified click order and cross-mappings
 * 
 * This file contains the PERMANENT mapping from braid chord symbols 
 * to harmonic profile slots. Everything else maps to "Other".
 */

// Direct 1:1 mappings from braid chords to harmonic slots
export const BRAID_TO_HARMONIC_MAPPING: Record<string, string> = {
  // MAJOR SECTION (7 chords)
  'C': 'I',
  'Dm': 'ii',
  'Em': 'iii', 
  'F': 'IV',
  'G': 'V',
  'Am': 'vi',
  'Bø': 'viiø',

  // APPLIED SECTION (10 chords)
  'C7': 'I7',
  'Eø': 'iiiø', 
  'D(7)': 'II(7)',
  'D7': 'II(7)',  // Alternative notation
  'F#ø': '#ivø',
  'E(7)': 'III(7)',
  'E7': 'III(7)',  // Alternative notation
  'G#º': '#vº',
  'A(7)': 'VI(7)',
  'A7': 'VI(7)',  // Alternative notation
  'C#º': '#iº',
  'B(7)': 'VII(7)',
  'B7': 'VII(7)',  // Alternative notation
  'D#º': '#iiº',

  // MINOR SECTION (9 chords)
  'Cm': 'i',
  'Dø': 'iiø',
  'Eb': 'bIII',
  'E♭': 'bIII',  // Alternative notation
  'Fm': 'iv',
  'Gm': 'v', 
  'Ab': 'bVI',
  'A♭': 'bVI',  // Alternative notation
  'Bb': 'bVII',
  'B♭': 'bVII',  // Alternative notation
  'G(7)(b9)': 'V(b9)',
  'G7(b9)': 'V(b9)',  // Alternative notation
  'Bº7': 'viiº'
};

// Special cross-mappings noted by user
export const SPECIAL_CROSS_MAPPINGS: Record<string, string> = {
  // G7 chord (left-up bubble next to C/Am pair) → Major V
  'G7': 'V',  // Maps to Major V, not Applied V(7)
  
  // D major chord → II(7) 
  'D': 'II(7)'  // Maps to Applied II(7)
};

// Combined mapping (special mappings override standard ones)
export const COMPLETE_BRAID_MAPPING: Record<string, string> = {
  ...BRAID_TO_HARMONIC_MAPPING,
  ...SPECIAL_CROSS_MAPPINGS
};

/**
 * Get harmonic slot for a braid chord
 * @param braidChord The chord symbol from the braid
 * @returns Harmonic slot name or "Other" if no mapping exists
 */
export function getBraidToHarmonicMapping(braidChord: string): string {
  // Clean the chord symbol (remove spaces, normalize)
  const cleaned = braidChord.trim();
  
  // Check complete mapping
  if (COMPLETE_BRAID_MAPPING[cleaned]) {
    return COMPLETE_BRAID_MAPPING[cleaned];
  }
  
  // Try some common variations
  const variations = [
    cleaned.replace('♭', 'b').replace('♯', '#'),  // Flat/sharp symbols
    cleaned.replace('b', '♭').replace('#', '♯'),  // Reverse
    cleaned.replace('ø', 'ø'),  // Half-diminished
    cleaned.replace('º', '°'),  // Diminished variations
    cleaned.replace('°', 'º')   // Reverse
  ];
  
  for (const variation of variations) {
    if (COMPLETE_BRAID_MAPPING[variation]) {
      return COMPLETE_BRAID_MAPPING[variation];
    }
  }
  
  // Default to "Other" for everything not explicitly mapped
  return "Other";
}

/**
 * Get all mapped braid chords for a given harmonic slot
 * @param harmonicSlot The harmonic slot name
 * @returns Array of braid chord symbols that map to this slot
 */
export function getHarmonicToBraidMapping(harmonicSlot: string): string[] {
  return Object.entries(COMPLETE_BRAID_MAPPING)
    .filter(([_, slot]) => slot === harmonicSlot)
    .map(([chord, _]) => chord);
}

// Export the click order for reference
export const USER_CLICK_ORDER = {
  major: ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bø'],
  applied: ['C7', 'Eø', 'D(7)', 'F#ø', 'E(7)', 'G#º', 'A(7)', 'C#º', 'B(7)', 'D#º'],
  minor: ['Cm', 'Dø', 'Eb', 'Fm', 'Gm', 'Ab', 'Bb', 'G(7)(b9)', 'Bº7']
} as const;
