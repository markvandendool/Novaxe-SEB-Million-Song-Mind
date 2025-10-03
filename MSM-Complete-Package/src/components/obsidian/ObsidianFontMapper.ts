/**
 * Obsidian Font Mapper - Exact implementation of Obsidian's font and chord mapping system
 * Based on the Angular Obsidian app's font_chords_eq.json and braid component
 */

// Exact font mapping from Obsidian's font_chords_eq.json
export const OBSIDIAN_FONT_MAPPING = {
  "m7b5": ",mb5b7",
  "m9": ",mb79",
  "7b5": ",b7b5",
  "m13": ",mb7913",
  "M": "",
  "m6": ",m6",
  "Maj7": ",&",
  "maj7": ",&",
  "m11": ",mb7911",
  "dim": ",o",
  "7": ",b7",
  "aug": ",+",
  "dim7": ",obb7",
  "maj9": ",&9",
  "9": ",b79",
  "m": ",m",
  "mmaj7": ",m&",
  "m7": ",mb7",
  "13": ",b7913",
  "11": ",b7911",
  "german": ",obb3bb7",
  "m69": ",m69",
  "m6/9": ",m69",
  "6/9": "69",
  "5": "5",
  "M7#5sus4": "&%4",
  "7#5sus4": "b7%4",
  "sus4": "4",
  "M7sus4": "&4",
  "7sus4": "b74",
  "7no5": "b7no5",
  "M7b6": "&b6",
  "maj7#5": ",&%",
  "7#5": "b7%",
  "7b13": "b7b13",
  "6": "6",
  "7add6": "b76",
  "7b6": "b7b6",
  "Mb5": "b5",
  "M7b5": "&b5",
  "maj#4": ",#4",
  "7#11": "b7#11",
  "M6#11": "6#11",
  "7#11b13": "b7#11b13",
  "m#5": "m%",
  "mb6M7": "m&6",
  "m7#5": "mb7%",
  "mMaj7b6": "m&b6",
  "oM7": "o&",
  "o7M7": "",
  "4": "4",
  "madd4": "m4",
  "m7add11": "mb711",
  "+add#9": "+#9",
  "7#5#9": ",b7%#9",
  "7#9": ",b7#9",
  "13#9": "13#9",
  "7#9b13": "b7#9b13",
  "maj7#9#11": "&#9#11",
  "7#9#11": "b7#9#11",
  "13#9#11": "13#9#11",
  "7#9#11b13": "b7#9#11b13",
  "sus2": "2",
  "M9#5sus4": "&94",
  "sus24": "24",
  "M9sus4": "&94",
  "9sus4": "b794",
  "13sus4": "b79134",
  "9no5": "9no5",
  "13no5": "b7913no5",
  "M#5add9": "%9",
  "maj9#5": "&9%",
  "9#5": "b79%",
  "9b13": "b79b13",
  "Madd9": "9",
  "maj13": "&913",
  "M7add13": "&13",
  "M9b5": "&9b5",
  "9b5": "b79b5",
  "13b5": "b7913b5",
  "9#5#11": "b79%#11",
  "maj9#11": "&9#11",
  "9#11": "b79#11",
  "69#11": "69#11",
  "M13#11": "&9#1113",
  "13#11": "#1113",
  "9#11b13": "9#11b13",
  "m9#5": "mb79%",
  "madd9": "m9",
  "mM9": "m&9",
  "mMaj9b6": "m&9b6",
  "m9b5": "mb79b5",
  "m11A": "",
  "b9sus": "b7b94",
  "11b9": "b911",
  "7sus4b9b13": "4b7b9b13",
  "alt7": "b7%",
  "7#5b9": "b7%b9",
  "Maddb9": "b9",
  "M7b9": "&b9",
  "7b9": "b7b9",
  "13b9": "b7b913",
  "7b9b13": "b7b9b13",
  "7#5b9#11": "%b7b9#11",
  "7b9#11": "b7b9#11",
  "13b9#11": "b7b9#1113",
  "7b9b13#11": "b7b9#1113",
  "mb6b9": "mb6b9",
  "7b9#9": "b7b9#9"
} as const;

// Chord type classification - based on Obsidian's chord arrays
const MAJOR_CHORDS = ['', 'M', 'maj7', '5', 'maj9', 'maj11', 'maj13', '6', 'Maj7', 'Maj9', 'M11', 'M13', 'maj9no5', 'M9sus4', 'Madd9', 'sus2', '69'];
const MINOR_CHORDS = ['m', 'm7', 'm#5', 'mMa7', 'm6', 'm9', 'm11', 'm7no5', 'm9no5', 'm11no5', 'madd9'];
const HALF_DIM_CHORDS = ['m7b5'];
const SEVEN_CHORDS = ['7', '9', '11', '13', '7no5', '9no5', '13no5', '13sus4', '7add13'];
const M69_CHORDS = ['m69'];
const GERMAN_CHORDS = ['german'];
const SEVEN_B5_CHORDS = ['7b5'];
const DIM_CHORDS = ['dim'];
const DIM_SEVEN_CHORDS = ['dim7'];

/**
 * Translate chord symbol to Obsidian font character
 * Exactly matches the Obsidian Translate[chordType] functionality
 */
export function translateChordToObsidianFont(chordType: string): string {
  return OBSIDIAN_FONT_MAPPING[chordType as keyof typeof OBSIDIAN_FONT_MAPPING] || chordType;
}

/**
 * Classify chord type for braid mapping - matches Obsidian's change_score_chord logic
 */
export function classifyChordType(chordType: string): string {
  if (MAJOR_CHORDS.includes(chordType)) return 'M';
  if (MINOR_CHORDS.includes(chordType)) return 'm';
  if (HALF_DIM_CHORDS.includes(chordType)) return 'm7b5';
  if (SEVEN_CHORDS.includes(chordType)) return '7';
  if (M69_CHORDS.includes(chordType)) return 'm69';
  if (GERMAN_CHORDS.includes(chordType)) return 'german';
  if (SEVEN_B5_CHORDS.includes(chordType)) return '7b5';
  if (DIM_CHORDS.includes(chordType)) return 'dim';
  if (DIM_SEVEN_CHORDS.includes(chordType)) return 'dim7';

  return chordType; // Return original if no classification
}

/**
 * Parse chord symbol into root and type - matches Obsidian's regex logic
 */
export function parseChord(chord: string): { root: string; chordType: string } | null {
  const regex = /([A-G][b#]{0,2})(.*)/;
  const match = chord.split('/')[0].match(regex);

  if (!match) return null;

  return {
    root: match[1],
    chordType: match[2]
  };
}

/**
 * Format chord for Obsidian font rendering
 * Exactly matches how Obsidian renders: root + Translate[chordType]
 */
export function formatChordForObsidianFont(chord: string): string {
  const parsed = parseChord(chord);
  if (!parsed) return chord;

  const { root, chordType } = parsed;
  const fontSymbol = translateChordToObsidianFont(chordType);

  return root + fontSymbol;
}

/**
 * CSS for Obsidian nvxChord font - exact from Obsidian SCSS
 */
export const OBSIDIAN_FONT_CSS = `
  @font-face {
    font-family: "nvxChord";
    src: url("../../../assets/font/nvxFont.otf");
  }

  .obsidian-chord-font {
    font-family: "nvxChord", monospace;
    font-size: 0.7em;
    text-anchor: left;
    fill: black;
  }

  .obsidian-chord-font.duo {
    font-size: 0.85em;
  }

  .obsidian-chord-font.duo.roman {
    font-size: 0.7em;
  }
`;

export default {
  translateChordToObsidianFont,
  classifyChordType,
  parseChord,
  formatChordForObsidianFont,
  OBSIDIAN_FONT_MAPPING,
  OBSIDIAN_FONT_CSS
};
