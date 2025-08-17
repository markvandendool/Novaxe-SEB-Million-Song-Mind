// Braid to Harmonic Profile mapping system
// Maps braid positions to harmonic profile slots based on Roman numeral analysis

import { CHORD_SLOTS } from '@/constants/harmony';
import { noteToRoman } from '@/utils/chordMapping';

// Verbose logging utility
const VERBOSE_LOGGING = true; // Set to false to disable
const log = (message: string, data?: any) => {
  if (VERBOSE_LOGGING) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] 🎵 BRAID_MAPPING: ${message}`;
    console.log(logMessage, data ? data : '');
    
    // Also log to a global array for debugging
    if (typeof window !== 'undefined') {
      if (!window.braidMappingLogs) {
        window.braidMappingLogs = [];
      }
      window.braidMappingLogs.push({ timestamp, message, data });
    }
  }
};

/**
 * Map Roman numeral chord to harmonic profile slot based on the rules:
 * - I, ii, iii, vi, viiø, I7 are 1:1 unique mappings
 * - V and V(b7) map to the same harmonic profile slot (V)
 * - II, III, V, VI, VII have multiple braid positions but map to single harmonic profile slots
 * - IV7 maps to "Other"
 * - Diminished symbols are flexible except viiø/viiº which must be unique
 */
export function mapRomanToHarmonicSlot(chord: string, key: string = 'C'): string | null {
  log(`🔍 MAPPING REQUEST: chord="${chord}", key="${key}"`);
  
  if (!chord || chord.trim() === '') {
    log(`❌ EMPTY CHORD: returning null`);
    return null;
  }

  const cleanChord = chord.trim();
  log(` CLEANED CHORD: "${cleanChord}"`);

  // Handle note names first (from braid clicks like "Am", "C", "F#", etc.)
  // Convert note names to Roman numerals using key context
  const notePattern = /^([A-G][#b]?)m?$/;
  const noteMatch = cleanChord.match(notePattern);
  if (noteMatch) {
    log(` NOTE NAME DETECTED: "${cleanChord}" matches note pattern`);
    const romanNumeral = noteToRoman(cleanChord, key);
    log(` NOTE TO ROMAN: "${cleanChord}" → "${romanNumeral}" in key "${key}"`);
    if (romanNumeral) {
      log(`✅ RECURSIVE MAPPING: calling mapRomanToHarmonicSlot("${romanNumeral}", "${key}")`);
      return mapRomanToHarmonicSlot(romanNumeral, key);
    } else {
      log(`❌ NOTE TO ROMAN FAILED: "${cleanChord}" could not be converted to Roman numeral in key "${key}"`);
      return null;
    }
  }
  
  log(`📝 ROMAN NUMERAL DETECTED: "${cleanChord}" - checking mappings`);
  
  // Handle exact matches for unique 1:1 mappings
  const uniqueMappings: Record<string, string> = {
    'I': 'I',
    'ii': 'ii', 
    'iii': 'iii',
    'vi': 'vi',
    'viiø': 'viiø',
    'I7': 'I7',
    'viiº': 'viiø', // Maps to same slot as viiø per rules
  };

  if (uniqueMappings[cleanChord]) {
    log(`✅ UNIQUE MAPPING: "${cleanChord}" → "${uniqueMappings[cleanChord]}"`);
    return uniqueMappings[cleanChord];
  }

  // Handle applied chords that map to "Other"
  if (cleanChord === 'IV7') {
    log(`🔄 SPECIAL CASE: "${cleanChord}" → "Other"`);
    return 'Other';
  }

  // Handle many-to-one mappings (with and without ♭7)
  const manyToOneMappings: Record<string, string> = {
    // V and V(♭7) map to same slot
    'V': 'V',
    'V7': 'V',
    'V(b7)': 'V',
    'V(♭7)': 'V',
    'Vb7': 'V',
    
    // II variations map to same slot
    'II': 'II(7)',
    'II7': 'II(7)',
    'II(b7)': 'II(7)',
    'II(♭7)': 'II(7)',
    'IIb7': 'II(7)',
    
    // III variations map to same slot
    'III': 'III(7)',
    'III7': 'III(7)',
    'III(b7)': 'III(7)',
    'III(♭7)': 'III(7)',
    'IIIb7': 'III(7)',
    
    // VI variations map to same slot
    'VI': 'VI(7)',
    'VI7': 'VI(7)',
    'VI(b7)': 'VI(7)',
    'VI(♭7)': 'VI(7)',
    'VIb7': 'VI(7)',
    
    // VII variations map to same slot
    'VII': 'VII(7)',
    'VII7': 'VII(7)',
    'VII(b7)': 'VII(7)',
    'VII(♭7)': 'VII(7)',
    'VIIb7': 'VII(7)',
    // Minor bVII remains bVII bucket
    'bVII': 'bVII',
    'bVII7': 'bVII',
    'bVII(b7)': 'bVII',
    'bVII(♭7)': 'bVII',
    'bVIIb7': 'bVII',
  };

  if (manyToOneMappings[cleanChord]) {
    log(`🔄 MANY-TO-ONE MAPPING: "${cleanChord}" → "${manyToOneMappings[cleanChord]}"`);
    return manyToOneMappings[cleanChord];
  }

  // Handle diminished chords with flexible symbols (except viiø/viiº which are unique above)
  const diminishedPattern = /^([iv]+|[IV]+)([º°ø])$/;
  const dimMatch = cleanChord.match(diminishedPattern);
  if (dimMatch) {
    const root = dimMatch[1];
    log(`🎭 DIMINISHED DETECTED: "${cleanChord}" with root "${root}"`);
    // Map common diminished chords
    if (root.toLowerCase() === 'ii') {
      log(` DIMINISHED MAPPING: "${cleanChord}" → "#ivø" (ii root)`);
      return '#ivø';
    }
    if (root.toLowerCase() === 'iv') {
      log(` DIMINISHED MAPPING: "${cleanChord}" → "#ivø" (iv root)`);
      return '#ivø';
    }
    if (root.toLowerCase() === 'vi') {
      log(` DIMINISHED MAPPING: "${cleanChord}" → "#ivø" (vi root)`);
      return '#ivø';
    }
  }

  // Handle case variations and flats/sharps
  const normalizedRoman = normalizeRomanNumeral(cleanChord);
  log(` NORMALIZATION: "${cleanChord}" → "${normalizedRoman}"`);
  if (manyToOneMappings[normalizedRoman]) {
    log(`✅ NORMALIZED MAPPING: "${cleanChord}" → "${normalizedRoman}" → "${manyToOneMappings[normalizedRoman]}"`);
    return manyToOneMappings[normalizedRoman];
  }

  // If no mapping found, return null (will be treated as "Other")
  log(`❌ NO MAPPING FOUND: "${cleanChord}" - returning null (will be treated as "Other")`);
  return null;
}

/**
 * Normalize Roman numeral notation for consistent mapping
 */
function normalizeRomanNumeral(roman: string): string {
  const normalized = roman
    .replace(/♭/g, 'b')
    .replace(/♯/g, '#')
    .replace(/°/g, 'º')
    .replace(/ø/g, 'ø');
  log(`🔄 NORMALIZE: "${roman}" → "${normalized}"`);
  return normalized;
}

/**
 * Get chord usage for a specific braid position based on harmonic function mapping
 * This replaces the simple chord name lookup with harmonic function mapping
 */
export function getBraidPositionUsage(
  romanLabel: string,
  harmonicUsageData: Record<string, number>,
  key: string = 'C'
): number {
  log(`📊 USAGE REQUEST: romanLabel="${romanLabel}", key="${key}"`);
  const harmonicSlot = mapRomanToHarmonicSlot(romanLabel, key);
  
  if (!harmonicSlot) {
    log(`❌ NO USAGE: "${romanLabel}" has no harmonic slot`);
    return 0;
  }
  
  const usage = harmonicUsageData[harmonicSlot] || 0;
  log(`📊 USAGE RESULT: "${romanLabel}" → "${harmonicSlot}" → ${usage}`);
  return usage;
}

/**
 * Create a mapping of all harmonic profile slots to their braid positions
 * This helps understand which braid positions correspond to each harmonic function
 */
export function createHarmonicSlotToBraidMapping(): Record<string, string[]> {
  const mapping: Record<string, string[]> = {};
  
  // Initialize all harmonic slots
  CHORD_SLOTS.forEach(slot => {
    mapping[slot] = [];
  });
  
  // Common Roman numerals that appear in the braid
  const commonRomanNumerals = [
    'I', 'ii', 'iii', 'IV', 'V', 'vi', 'viiø', 'I7',
    'II', 'II7', 'III', 'III7', 'VI', 'VI7', 'VII', 'VII7',
    'V7', 'IV7', 'bVII', 'bVII7', '#ivø', 'viiº',
    // Add variations with different flat/sharp notations
    'bII', 'bIII', 'bV', 'bVI', '#I', '#II', '#IV', '#V', '#VI'
  ];
  
  commonRomanNumerals.forEach(roman => {
    const slot = mapRomanToHarmonicSlot(roman);
    if (slot && mapping[slot]) {
      mapping[slot].push(roman);
    }
  });
  
  return mapping;
}

/**
 * Debug function to validate mappings
 */
export function validateBraidHarmonicMapping(): {
  validMappings: Record<string, string>;
  unmappedRomans: string[];
} {
  const commonRomanNumerals = [
    'I', 'ii', 'iii', 'IV', 'V', 'vi', 'viiø', 'I7',
    'II', 'II7', 'III', 'III7', 'VI', 'VI7', 'VII', 'VII7',
    'V7', 'IV7', 'bVII', 'bVII7', '#ivø', 'viiº'
  ];
  
  const validMappings: Record<string, string> = {};
  const unmappedRomans: string[] = [];
  
  commonRomanNumerals.forEach(roman => {
    const slot = mapRomanToHarmonicSlot(roman);
    if (slot) {
      validMappings[roman] = slot;
    } else {
      unmappedRomans.push(roman);
    }
  });
  
  return { validMappings, unmappedRomans };
}