import { getChordSuffix } from '@/utils/chordTypes';

/**
 * CORRECTED simpleChord function based on nvxFont.otf ligature analysis
 * Font expects DIRECT 'b' characters, NOT b→l transformation
 */
export const simpleChordDirect = (s?: string, position?: string, direction?: string, displayRoman: boolean = false) => {
    if (!s) return '';

    // REMOVED b→l transformation - font expects direct 'b' characters
    let result = s;

    // Add chord quality suffix based on position and direction
    if (position && direction) {
        const suffix = getChordSuffix(position, direction, displayRoman);
        if (suffix) {
            // Apply transformations to the suffix but keep 'b' as 'b'
            const transformedSuffix = suffix
                .replace(/german/g, '+6')        // German 6th → augmented 6th notation
                .replace(/m7b5/g, 'm7b5')       // Half-diminished - keep b
                .replace(/7b5/g, '7b5')         // Dom7b5 - keep b
                .replace(/dim/g, 'o');          // Diminished
            result += transformedSuffix;
        }
    }

    return result;
};

/**
 * ORIGINAL simpleChord function with b→l transformation
 * This is what's currently in BraidTonal.tsx
 */
export const simpleChordWithTransform = (s?: string, position?: string, direction?: string, displayRoman: boolean = false) => {
    if (!s) return '';

    // Current b→l transformation
    let result = s.replace(/([A-G])(b)/g, '$1l');

    // Add chord quality suffix based on position and direction
    if (position && direction) {
        const suffix = getChordSuffix(position, direction, displayRoman);
        if (suffix) {
            // Apply transformations to the suffix too
            const transformedSuffix = suffix
                .replace(/german/g, '+6')        // German 6th → augmented 6th notation
                .replace(/m7b5/g, 'm7l5')       // Half-diminished
                .replace(/7b5/g, '7l5')         // Dom7b5
                .replace(/dim/g, 'o')           // Diminished
                .replace(/bb/g, 'll');          // Double flats
            result += transformedSuffix;
        }
    }

    return result;
};
