// Chord Font Mapper - React port of Angular braid font system
// Translates chord symbols to nvxFont characters

import fontChordMapping from '@/assets/font_chords_eq.json';

export interface ChordMapping {
    [key: string]: string;
}

// Type-safe import of the chord mapping
const FONT_CHORD_EQ: ChordMapping = fontChordMapping as ChordMapping;

/**
 * Translates a chord symbol to its corresponding nvxFont character
 * @param chord - Standard chord symbol (e.g., "Cmaj7", "Dm", "G7")
 * @returns Font character string for nvxFont rendering
 */
export const translateChordToFont = (chord: string): string => {
    if (!chord) return '';

    // Clean the chord symbol (remove root note, keep quality)
    const chordQuality = extractChordQuality(chord);

    // Get font character from mapping
    const fontChar = FONT_CHORD_EQ[chordQuality];

    // Return mapped character or fallback to original
    return fontChar !== undefined ? fontChar : chord;
};

/**
 * Extracts the chord quality from a full chord symbol
 * @param fullChord - Full chord like "Cmaj7", "F#m", "Bb7"
 * @returns Chord quality like "maj7", "m", "7"
 */
export const extractChordQuality = (fullChord: string): string => {
    if (!fullChord) return '';

    // Remove common root note patterns (C, C#, Db, etc.)
    const quality = fullChord.replace(/^[A-G][#b]?/, '');

    // Handle empty quality (major triad)
    return quality || 'M';
};

/**
 * Gets the root note from a chord symbol
 * @param chord - Full chord symbol
 * @returns Root note (e.g., "C", "F#", "Bb")
 */
export const extractRootNote = (chord: string): string => {
    if (!chord) return '';

    const match = chord.match(/^[A-G][#b]?/);
    return match ? match[0] : '';
};

/**
 * Combines root note with font character for display
 * @param chord - Full chord symbol
 * @returns Object with root and fontChar for separate styling
 */
export const parseChordForDisplay = (chord: string): {
    root: string;
    fontChar: string;
    original: string;
} => {
    const root = extractRootNote(chord);
    const fontChar = translateChordToFont(chord);

    return {
        root,
        fontChar,
        original: chord
    };
};

// Chord classification arrays (ported from Angular braid component)
export const CHORD_CLASSIFICATIONS = {
    major: ['', 'M', 'maj7', '5', 'maj9', 'maj11', 'maj13', '6', 'Maj7', 'Maj9', 'M11', 'M13', 'maj9no5', 'M9sus4', 'Madd9', 'sus2', '69'],
    minor: ['m', 'm7', 'm#5', 'mMa7', 'm6', 'm9', 'm11', 'm7no5', 'm9no5', 'm11no5', 'madd9'],
    halfDiminished: ['m7b5'],
    dominant: ['7', '9', '11', '13', '7no5', '9no5', '13no5', '13sus4', '7add13'],
    m69: ['m69'],
    german: ['german'],
    sevenb5: ['7b5'],
    diminished: ['dim'],
    diminishedSeventh: ['dim7']
};

/**
 * Classifies a chord by its type
 * @param chord - Chord symbol or quality
 * @returns Chord classification category
 */
export const classifyChord = (chord: string): string => {
    const quality = extractChordQuality(chord);

    for (const [category, chords] of Object.entries(CHORD_CLASSIFICATIONS)) {
        if (chords.includes(quality)) {
            return category;
        }
    }

    return 'unknown';
};

export default {
    translateChordToFont,
    parseChordForDisplay,
    classifyChord,
    CHORD_CLASSIFICATIONS
};
