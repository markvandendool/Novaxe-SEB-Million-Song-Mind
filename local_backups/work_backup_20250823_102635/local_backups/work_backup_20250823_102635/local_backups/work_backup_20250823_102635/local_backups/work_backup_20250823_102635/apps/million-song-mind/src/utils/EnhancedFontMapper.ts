// Enhanced Font Mapper - Leverages nvxFont.otf ligatures and GSUB table
// Based on fontTools analysis showing ligature support in the font

/**
 * Enhanced font mapping that leverages the actual font ligature capabilities
 * discovered through fontTools analysis of nvxFont.otf
 */

// Roman numeral to ligature mapping using actual font ligatures
export const ROMAN_LIGATURE_MAP = {
  // Basic Roman numerals - these should trigger font ligatures
  'I': 'I',
  'II': 'II',
  'III': 'III',
  'IV': 'IV',
  'V': 'V',
  'VI': 'VI',
  'VII': 'VII',

  // Minor chords
  'i': 'i',
  'ii': 'ii',
  'iii': 'iii',
  'iv': 'iv',
  'v': 'v',
  'vi': 'vi',
  'vii': 'vii',

  // Extended chords with ligature potential
  'I7': 'I7',
  'ii7': 'ii7',
  'iii7': 'iii7',
  'IV7': 'IV7',
  'V7': 'V7',
  'vi7': 'vi7',
  'vii7': 'vii7',

  // Major 7th chords
  'Imaj7': 'IMa7',
  'IVmaj7': 'IVMa7',
  'Vmaj7': 'VMa7',

  // Diminished and half-diminished (special symbols)
  'viiº': 'vii°',
  'viiø': 'viiø',
  'iiø': 'iiø',
  '#ivø': '#ivø',
  '#vº': '#v°',
  'iiiº': 'iii°',
  '#iº': '#i°',
  '#iiº': '#ii°',

  // Applied dominants with parentheses (ligature candidates)
  'V/ii': 'V/ii',
  'V/iii': 'V/iii',
  'V/IV': 'V/IV',
  'V/V': 'V/V',
  'V/vi': 'V/vi',

  // Complex chord symbols
  'V(b7)': 'V♭⁷',
  'V(9)': 'V⁹',
  'V(b9)': 'V♭⁹',
  'V(b13)': 'V♭¹³',

  // Modal interchange
  'bII': '♭II',
  'bIII': '♭III',
  'bVI': '♭VI',
  'bVII': '♭VII',

  // Neapolitan and augmented sixth chords
  'N6': 'N⁶',
  'It6': 'It⁶',
  'Fr6': 'Fr⁶',
  'Ger6': 'Ger⁶'
};

// Quality symbols that should use font ligatures
export const CHORD_QUALITY_LIGATURES = {
  // Standard qualities
  'maj7': 'Ma⁷',
  'maj9': 'Ma⁹',
  'maj11': 'Ma¹¹',
  'maj13': 'Ma¹³',

  // Minor extensions
  'm7': 'm⁷',
  'm9': 'm⁹',
  'm11': 'm¹¹',
  'm13': 'm¹³',
  'mMa7': 'mMa⁷',

  // Dominant extensions
  '7': '⁷',
  '9': '⁹',
  '11': '¹¹',
  '13': '¹³',
  '7b5': '⁷♭⁵',
  '7#5': '⁷#⁵',
  '7b9': '⁷♭⁹',
  '7#9': '⁷#⁹',
  '7b13': '⁷♭¹³',
  '7#11': '⁷#¹¹',

  // Diminished
  'dim': '°',
  'dim7': '°⁷',
  'm7b5': 'ø⁷',

  // Added tones
  'add9': 'add⁹',
  'add2': 'add²',
  'add4': 'add⁴',
  '6': '⁶',
  '69': '⁶⁄⁹',
  'm69': 'm⁶⁄⁹',

  // Suspensions
  'sus2': 'sus²',
  'sus4': 'sus⁴',
  '7sus4': '⁷sus⁴',
  '9sus4': '⁹sus⁴'
};

// Accidental symbols with proper Unicode
export const ACCIDENTAL_LIGATURES = {
  '#': '♯',
  'b': '♭',
  'bb': '𝄫', // Double flat
  '##': '𝄪', // Double sharp
  '♮': '♮'   // Natural
};

/**
 * Enhanced chord translation using ligature-aware font mapping
 */
export const translateChordToLigature = (chord: string): string => {
  if (!chord) return '';

  // Step 1: Handle Roman numerals first
  if (ROMAN_LIGATURE_MAP[chord]) {
    return ROMAN_LIGATURE_MAP[chord];
  }

  // Step 2: Parse complex chord symbols
  const parseResult = parseComplexChord(chord);
  if (parseResult) {
    return buildLigatureString(parseResult);
  }

  // Step 3: Fallback to original chord
  return chord;
};

interface ParsedChord {
  accidentals: string;
  root: string;
  quality: string;
  bass?: string;
}

/**
 * Parse complex chord symbols into components
 */
function parseComplexChord(chord: string): ParsedChord | null {
  // Match patterns like: #ivø, bVII, V(b9), V7/vi, etc.
  const complexPattern = /^([#b]*)(I{1,3}|IV|V|VI{0,2}|VII|i{1,3}|iv|v|vi{0,2}|vii)([^/]*)(?:\/(.+))?$/;
  const match = chord.match(complexPattern);

  if (!match) return null;

  const [, accidentals, root, quality, bass] = match;

  return {
    accidentals: accidentals || '',
    root: root || '',
    quality: quality || '',
    bass: bass
  };
}

/**
 * Build ligature string from parsed components
 */
function buildLigatureString(parsed: ParsedChord): string {
  let result = '';

  // Add accidentals with ligature symbols
  if (parsed.accidentals) {
    for (const char of parsed.accidentals) {
      result += ACCIDENTAL_LIGATURES[char] || char;
    }
  }

  // Add root Roman numeral
  result += parsed.root;

  // Add quality with ligature symbols
  if (parsed.quality) {
    const qualityLigature = CHORD_QUALITY_LIGATURES[parsed.quality];
    if (qualityLigature) {
      result += qualityLigature;
    } else {
      // Process quality for common symbols
      result += processQualityString(parsed.quality);
    }
  }

  // Add bass note if present
  if (parsed.bass) {
    result += '/' + parsed.bass;
  }

  return result;
}

/**
 * Process quality string for common musical symbols
 */
function processQualityString(quality: string): string {
  return quality
    .replace(/7/g, '⁷')
    .replace(/9/g, '⁹')
    .replace(/11/g, '¹¹')
    .replace(/13/g, '¹³')
    .replace(/6/g, '⁶')
    .replace(/2/g, '²')
    .replace(/4/g, '⁴')
    .replace(/5/g, '⁵')
    .replace(/dim/g, '°')
    .replace(/ø/g, 'ø')
    .replace(/º/g, '°')
    .replace(/#/g, '♯')
    .replace(/b/g, '♭')
    .replace(/\(/g, '')
    .replace(/\)/g, '');
}

/**
 * CSS class generator for ligature-enabled font rendering
 */
export const getFontLigatureClasses = (chord: string): string[] => {
  const classes = ['nvx-ligature-font'];

  // Add specific classes based on chord characteristics
  if (chord.includes('♯') || chord.includes('♭')) {
    classes.push('nvx-accidentals');
  }

  if (chord.includes('⁷') || chord.includes('⁹') || chord.includes('¹¹') || chord.includes('¹³')) {
    classes.push('nvx-extensions');
  }

  if (chord.includes('°') || chord.includes('ø')) {
    classes.push('nvx-diminished');
  }

  if (chord.includes('/')) {
    classes.push('nvx-slash-chord');
  }

  return classes;
};

/**
 * Get optimal font rendering settings for ligature display
 */
export const getLigatureRenderingProps = (): React.CSSProperties => {
  return {
    fontFamily: '"nvxChord", "music-font", monospace',
    fontFeatureSettings: '"liga" 1, "dlig" 1, "calt" 1', // Enable ligatures
    fontVariantLigatures: 'common-ligatures discretionary-ligatures',
    textRendering: 'optimizeLegibility',
    fontSmooth: 'antialiased',
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale'
  };
};
