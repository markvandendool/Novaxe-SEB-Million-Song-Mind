// Braid to Harmonic Profile mapping system
// DEFINITIVE USER-SPECIFIED MAPPINGS - August 21, 2025
// Based on user's click order and cross-mapping specifications

import { CHORD_SLOTS } from '@/constants/harmony';
import { getBraidToHarmonicMapping } from './definiteBraidMapping';

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
 * Map braid chord to harmonic profile slot using DEFINITIVE user mappings
 * Everything not explicitly mapped goes to "Other"
 */
export function mapRomanToHarmonicSlot(chord: string, key: string = 'C'): string | null {
  log(`🔍 DEFINITIVE MAPPING REQUEST: chord="${chord}", key="${key}"`);
  
  if (!chord || chord.trim() === '') {
    log(`❌ EMPTY CHORD: returning null`);
    return null;
  }

  const cleanChord = chord.trim();
  log(`🧹 CLEANED CHORD: "${cleanChord}"`);

  // Use the definitive user-specified mapping
  const harmonicSlot = getBraidToHarmonicMapping(cleanChord);
  
  if (harmonicSlot === "Other") {
    log(`🔄 MAPPED TO OTHER: "${cleanChord}" → "Other" (not in definitive mappings)`);
  } else {
    log(`✅ DEFINITIVE MAPPING: "${cleanChord}" → "${harmonicSlot}"`);
  }
  
  return harmonicSlot === "Other" ? null : harmonicSlot;
}

/**
 * Get chord usage for a specific braid position based on definitive harmonic function mapping
 */
export function getBraidPositionUsage(
  chordLabel: string,
  harmonicUsageData: Record<string, number>,
  key: string = 'C'
): number {
  log(`📊 USAGE REQUEST: chordLabel="${chordLabel}", key="${key}"`);
  
  // Use definitive mapping
  const harmonicSlot = getBraidToHarmonicMapping(chordLabel);
  
  if (harmonicSlot === "Other") {
    const usage = harmonicUsageData["Other"] || 0;
    log(`📊 OTHER USAGE: "${chordLabel}" → "Other" → ${usage}`);
    return usage;
  }
  
  const usage = harmonicUsageData[harmonicSlot] || 0;
  log(`📊 USAGE RESULT: "${chordLabel}" → "${harmonicSlot}" → ${usage}`);
  return usage;
}

/**
 * Create a mapping of all harmonic profile slots to their braid positions using definitive mappings
 */
export function createHarmonicSlotToBraidMapping(): Record<string, string[]> {
  const mapping: Record<string, string[]> = {};
  
  // Initialize all harmonic slots
  CHORD_SLOTS.forEach(slot => {
    mapping[slot] = [];
  });
  
  // Use definitive mappings from our user-specified system
  import('./definiteBraidMapping').then(({ COMPLETE_BRAID_MAPPING }) => {
    Object.entries(COMPLETE_BRAID_MAPPING).forEach(([braidChord, harmonicSlot]) => {
      if (mapping[harmonicSlot]) {
        mapping[harmonicSlot].push(braidChord);
      }
    });
  });
  
  return mapping;
}

/**
 * Debug function to validate definitive mappings
 */
export function validateBraidHarmonicMapping(): {
  validMappings: Record<string, string>;
  unmappedRomans: string[];
} {
  // Test chords from user's click order specification
  const testChords = [
    // Major
    'C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bø',
    // Applied  
    'C7', 'Eø', 'D(7)', 'D7', 'F#ø', 'E(7)', 'E7', 'G#º', 'A(7)', 'A7', 'C#º', 'B(7)', 'B7', 'D#º',
    // Minor
    'Cm', 'Dø', 'Eb', 'E♭', 'Fm', 'Gm', 'Ab', 'A♭', 'Bb', 'B♭', 'G(7)(b9)', 'G7(b9)', 'Bº7',
    // Special cross-mappings
    'G7', 'D'
  ];
  
  const validMappings: Record<string, string> = {};
  const unmappedRomans: string[] = [];
  
  testChords.forEach(chord => {
    const slot = getBraidToHarmonicMapping(chord);
    if (slot !== "Other") {
      validMappings[chord] = slot;
    } else {
      unmappedRomans.push(chord);
    }
  });
  
  return { validMappings, unmappedRomans };
}