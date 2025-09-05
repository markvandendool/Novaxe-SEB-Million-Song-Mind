// Enhanced Braid Mapping System - Intelligent harmonic relationship mapping
// Combines the best of Roman numeral analysis with visual braid positioning

import { CHORD_SLOTS, CHORD_GROUPS } from '@/constants/harmony';
import { translateChordToLigature, ROMAN_LIGATURE_MAP } from './EnhancedFontMapper';

// Enhanced logging system
const log = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 🎯 ENHANCED_BRAID: ${message}`, data || '');
};

// Key-aware harmonic function mapping
const HARMONIC_FUNCTIONS = {
  // Tonic function (stable)
  tonic: ['I', 'i', 'vi', 'VI', 'iii', 'III'],

  // Subdominant function (departure from tonic)
  subdominant: ['IV', 'iv', 'ii', 'II', 'vi', 'VI'],

  // Dominant function (tension, resolution to tonic)
  dominant: ['V', 'v', 'VII', 'vii', 'viiø', 'viiº'],

  // Applied dominants (temporary tonicization)
  applied: ['V/ii', 'V/iii', 'V/IV', 'V/V', 'V/vi', 'VII/V'],

  // Chromatic mediants and modal interchange
  chromatic: ['bII', 'bIII', 'bVI', 'bVII', '#I', '#ii', '#iv', '#v']
};

// Braid position to harmonic function mapping (3D spatial awareness)
const BRAID_POSITION_MAP = {
  // Inner ring - primary triads
  inner: {
    0: 'I',    // Tonic (12 o'clock)
    120: 'IV',  // Subdominant (4 o'clock) 
    240: 'V'    // Dominant (8 o'clock)
  },

  // Middle ring - secondary functions
  middle: {
    30: 'vi',   // Relative minor
    60: 'ii',   // Supertonic
    90: 'iii',  // Mediant
    150: 'viiø', // Half-diminished
    210: 'V7',  // Dominant seventh
    270: 'vi7', // Minor seventh
    300: 'ii7', // Minor seventh
    330: 'iii7' // Minor seventh
  },

  // Outer ring - extended and altered chords
  outer: {
    0: 'Imaj7',   // Tonic major 7th
    45: 'V/vi',   // Applied dominant
    90: 'V/ii',   // Applied dominant
    135: 'bII',   // Neapolitan
    180: 'bVII',  // Modal interchange
    225: 'V/IV',  // Applied dominant
    270: 'V/V',   // Applied dominant
    315: '#ivø'   // Raised subdominant
  }
};

/**
 * Enhanced chord to harmonic slot mapping with 3D braid awareness
 */
export function enhancedBraidMapping(
  chord: string,
  key: string = 'C',
  braidPosition?: { ring: 'inner' | 'middle' | 'outer', angle: number }
): {
  harmonicSlot: string | null;
  braidPosition: { ring: string; angle: number } | null;
  harmonicFunction: string;
  ligatureText: string;
  confidence: number;
} {
  log(`🎯 ENHANCED MAPPING: chord="${chord}", key="${key}"`, braidPosition);

  if (!chord || chord.trim() === '') {
    return {
      harmonicSlot: null,
      braidPosition: null,
      harmonicFunction: 'unknown',
      ligatureText: '',
      confidence: 0
    };
  }

  const cleanChord = chord.trim();

  // Step 1: Get ligature representation
  const ligatureText = translateChordToLigature(cleanChord);
  log(`✨ LIGATURE: "${cleanChord}" → "${ligatureText}"`);

  // Step 2: Determine harmonic function
  const harmonicFunction = determineHarmonicFunction(cleanChord);
  log(`🎵 FUNCTION: ${harmonicFunction}`);

  // Step 3: Find best harmonic slot match
  const harmonicSlot = findBestHarmonicSlot(cleanChord, harmonicFunction);
  log(`🎯 SLOT: ${harmonicSlot}`);

  // Step 4: Calculate or use provided braid position
  const calculatedPosition = braidPosition || calculateBraidPosition(cleanChord, harmonicFunction);
  log(`📍 POSITION:`, calculatedPosition);

  // Step 5: Calculate confidence based on multiple factors
  const confidence = calculateMappingConfidence(cleanChord, harmonicSlot, calculatedPosition, harmonicFunction);
  log(`📊 CONFIDENCE: ${confidence}%`);

  return {
    harmonicSlot,
    braidPosition: calculatedPosition,
    harmonicFunction,
    ligatureText,
    confidence
  };
}

/**
 * Determine the harmonic function of a chord
 */
function determineHarmonicFunction(chord: string): string {
  // Check each harmonic function category
  for (const [funcName, chords] of Object.entries(HARMONIC_FUNCTIONS)) {
    if (chords.some(c =>
      chord === c ||
      chord.startsWith(c) ||
      chord.replace(/[#b]/g, '') === c
    )) {
      return funcName;
    }
  }

  // Special cases
  if (chord.includes('dim') || chord.includes('º') || chord.includes('°')) {
    return 'diminished';
  }

  if (chord.includes('aug') || chord.includes('+')) {
    return 'augmented';
  }

  if (chord.includes('/')) {
    return 'applied';
  }

  return 'other';
}

/**
 * Find the best matching harmonic profile slot
 */
function findBestHarmonicSlot(chord: string, harmonicFunction: string): string | null {
  // Direct match in chord slots
  const directMatch = CHORD_SLOTS.find(slot =>
    slot === chord ||
    slot.replace(/[()]/g, '') === chord
  );

  if (directMatch) {
    log(`🎯 DIRECT MATCH: ${directMatch}`);
    return directMatch;
  }

  // Function-based matching
  const functionMatches = CHORD_SLOTS.filter(slot => {
    const slotFunction = determineHarmonicFunction(slot);
    return slotFunction === harmonicFunction;
  });

  if (functionMatches.length > 0) {
    // Return the most common/standard chord for this function
    const bestMatch = functionMatches.sort((a, b) => {
      const scoreA = getChordCommonness(a);
      const scoreB = getChordCommonness(b);
      return scoreB - scoreA;
    })[0];

    log(`🎵 FUNCTION MATCH: ${bestMatch} (function: ${harmonicFunction})`);
    return bestMatch;
  }

  // Fallback to "Other" category
  log(`❓ FALLBACK: No specific match, using "Other"`);
  return "Other";
}

/**
 * Calculate optimal braid position for a chord
 */
function calculateBraidPosition(chord: string, harmonicFunction: string): { ring: string; angle: number } {
  // Primary triads go in inner ring
  if (['I', 'IV', 'V'].includes(chord)) {
    const angle = chord === 'I' ? 0 : chord === 'IV' ? 120 : 240;
    return { ring: 'inner', angle };
  }

  // Secondary chords go in middle ring
  if (['ii', 'iii', 'vi', 'vii'].some(c => chord.includes(c))) {
    const baseAngle = {
      'vi': 30, 'ii': 60, 'iii': 90, 'vii': 150
    };

    for (const [roman, angle] of Object.entries(baseAngle)) {
      if (chord.includes(roman)) {
        return { ring: 'middle', angle };
      }
    }
  }

  // Complex/extended chords go in outer ring
  if (harmonicFunction === 'applied' || chord.includes('7') || chord.includes('#') || chord.includes('b')) {
    // Distribute evenly around outer ring based on function
    const functionAngles = {
      'applied': 45,
      'chromatic': 135,
      'extended': 225,
      'altered': 315
    };

    const angle = functionAngles[harmonicFunction as keyof typeof functionAngles] || 180;
    return { ring: 'outer', angle };
  }

  // Default to middle ring
  return { ring: 'middle', angle: Math.floor(Math.random() * 360) };
}

/**
 * Calculate confidence score for the mapping
 */
function calculateMappingConfidence(
  chord: string,
  harmonicSlot: string | null,
  braidPosition: { ring: string; angle: number } | null,
  harmonicFunction: string
): number {
  let confidence = 0;

  // Base confidence from direct match
  if (harmonicSlot && harmonicSlot !== "Other") {
    confidence += 40;
  }

  // Bonus for recognized harmonic function
  if (harmonicFunction !== 'other' && harmonicFunction !== 'unknown') {
    confidence += 30;
  }

  // Bonus for valid braid position
  if (braidPosition && braidPosition.ring && braidPosition.angle >= 0) {
    confidence += 20;
  }

  // Bonus for common chord symbols
  const commonness = getChordCommonness(chord);
  confidence += commonness * 10;

  return Math.min(confidence, 100);
}

/**
 * Get commonness score for chord symbols
 */
function getChordCommonness(chord: string): number {
  const commonChords = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii', 'i', 'iv', 'v'];
  if (commonChords.includes(chord)) return 1.0;

  const extendedChords = ['I7', 'ii7', 'V7', 'vi7', 'Imaj7', 'IVmaj7'];
  if (extendedChords.includes(chord)) return 0.8;

  const appliedChords = ['V/ii', 'V/iii', 'V/IV', 'V/V', 'V/vi'];
  if (appliedChords.includes(chord)) return 0.6;

  return 0.4; // Less common chords
}

/**
 * Get visual styling recommendations based on harmonic analysis
 */
export function getChordStyling(
  chord: string,
  harmonicFunction: string,
  confidence: number
): {
  colorClass: string;
  sizeClass: string;
  fontWeight: string;
  opacity: number;
} {
  const baseStyle = {
    colorClass: 'text-foreground',
    sizeClass: 'text-base',
    fontWeight: 'normal',
    opacity: 1.0
  };

  // Color by harmonic function
  const functionColors = {
    'tonic': 'text-blue-600',
    'subdominant': 'text-green-600',
    'dominant': 'text-red-600',
    'applied': 'text-orange-600',
    'chromatic': 'text-purple-600',
    'diminished': 'text-gray-600',
    'augmented': 'text-yellow-600'
  };

  baseStyle.colorClass = functionColors[harmonicFunction as keyof typeof functionColors] || 'text-foreground';

  // Size by importance/confidence
  if (confidence > 80) {
    baseStyle.sizeClass = 'text-lg';
    baseStyle.fontWeight = 'bold';
  } else if (confidence > 60) {
    baseStyle.sizeClass = 'text-base';
    baseStyle.fontWeight = 'semibold';
  } else {
    baseStyle.sizeClass = 'text-sm';
    baseStyle.opacity = 0.8;
  }

  return baseStyle;
}

/**
 * Export enhanced mapping for React components
 */
export { BRAID_POSITION_MAP, HARMONIC_FUNCTIONS };
