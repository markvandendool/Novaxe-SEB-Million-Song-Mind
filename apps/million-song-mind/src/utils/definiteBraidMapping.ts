/**
 * DEFINITIVE BRAID TO HARMONIC PROFILE MAPPING
 * Date: August 21, 2025
 * Source: User-specified click order and cross-mappings
 * 
 * This file contains the PERMANENT mapping from braid chord symbols 
 * to harmonic profile slots. Everything else maps to "Other".
 */

// STRICT 1:1 mappings from braid chords to harmonic slots - USER SPECIFIED
// Each harmonic slot maps to EXACTLY ONE braid chord (no duplicates)
export const DEFINITIVE_BRAID_MAPPING: Record<string, string> = {
  // MAJOR SECTION (7 chords) - EXACT user click order
  'C': 'I',
  'Dm': 'ii',
  'Em': 'iii',
  'F': 'IV',
  'G': 'V',        // G maps to V (not G7!)
  'Am': 'vi',
  'Bø': 'viiø',

  // APPLIED SECTION (10 chords) - EXACT user click order
  'C7': 'I7',
  'Eø': 'iiiø',
  'D7': 'II(7)',   // D7 maps to II(7) (not D!)
  'F#ø': '#ivø',
  'E7': 'III(7)',
  'G#º': '#vº',
  'A7': 'VI(7)',
  'C#º': '#iº',
  'B7': 'VII(7)',
  'D#º': '#iiº',

  // MINOR SECTION (9 chords) - EXACT user click order
  'Cm': 'i',
  'Dø': 'iiø',
  'Eb': 'bIII',
  'Fm': 'iv',
  'Gm': 'v',
  'Ab': 'bVI',
  'Bb': 'bVII',
  'G7(b9)': 'V(b9)',  // Use exact notation from user spec
  'Bº7': 'viiº'
};

// Reverse mapping: harmonic slot → braid chord (1:1 STRICT)
export const HARMONIC_TO_BRAID_MAPPING: Record<string, string> = {
  // MAJOR
  'I': 'C',
  'ii': 'Dm',
  'iii': 'Em',
  'IV': 'F',
  'V': 'G',
  'vi': 'Am',
  'viiø': 'Bø',

  // APPLIED  
  'I7': 'C7',
  'iiiø': 'Eø',
  'II(7)': 'D7',
  '#ivø': 'F#ø',
  'III(7)': 'E7',
  '#vº': 'G#º',
  'VI(7)': 'A7',
  '#iº': 'C#º',
  'VII(7)': 'B7',
  '#iiº': 'D#º',

  // MINOR
  'i': 'Cm',
  'iiø': 'Dø',
  'bIII': 'Eb',
  'iv': 'Fm',
  'v': 'Gm',
  'bVI': 'Ab',
  'bVII': 'Bb',
  'V(b9)': 'G7(b9)',
  'viiº': 'Bº7'
};

/**
 * Get harmonic slot for a braid chord - STRICT 1:1 mapping
 * @param braidChord The chord symbol from the braid
 * @returns Harmonic slot name or "Other" if no mapping exists
 */
export function getBraidToHarmonicMapping(braidChord: string): string {
  // Clean the chord symbol (remove spaces, normalize)
  const cleaned = braidChord.trim();

  // Check STRICT mapping first
  if (DEFINITIVE_BRAID_MAPPING[cleaned]) {
    return DEFINITIVE_BRAID_MAPPING[cleaned];
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
    if (DEFINITIVE_BRAID_MAPPING[variation]) {
      return DEFINITIVE_BRAID_MAPPING[variation];
    }
  }

  // Default to "Other" for everything not explicitly mapped
  return "Other";
}

/**
 * Get the SINGLE braid chord for a given harmonic slot - STRICT 1:1 mapping
 * @param harmonicSlot The harmonic slot name
 * @returns Single braid chord that maps to this slot, or empty array if not found
 */
export function getHarmonicToBraidMapping(harmonicSlot: string): string[] {
  const braidChord = HARMONIC_TO_BRAID_MAPPING[harmonicSlot];
  return braidChord ? [braidChord] : [];
}

// Export the click order for reference
export const USER_CLICK_ORDER = {
  major: ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bø'],
  applied: ['C7', 'Eø', 'D(7)', 'F#ø', 'E(7)', 'G#º', 'A(7)', 'C#º', 'B(7)', 'D#º'],
  minor: ['Cm', 'Dø', 'Eb', 'Fm', 'Gm', 'Ab', 'Bb', 'G(7)(b9)', 'Bº7']
} as const;
