/**
 * NVX Font Character Mapping System
 * Based on actual keyboard mappings discovered from working text editor
 */

export interface ChordMapping {
    input: string;
    output: string;
    description: string;
}

/**
 * Real nvxFont character mappings as discovered from keyboard input
 */
export const NVX_CHORD_MAPPINGS: ChordMapping[] = [
    // Complex chord sequences
    { input: 'blbb7b5', output: 'B♭♭⁷♭⁵', description: 'German 6th down' },
    { input: 'Ibb7bb3', output: 'I♭♭⁷♭♭³', description: 'Roman numeral with double flats' },
    { input: 'Ab7b5', output: 'A♭⁷♭⁵', description: 'Fr43 up - French augmented 6th chord' },
    { input: 'Abb7bb3', output: 'A♭♭⁷♭♭³', description: 'Ger6 up - German up position' },

    // Superscript combinations
    { input: 'bb7', output: '♭⁷', description: 'Flat 7 with superscript' },
    { input: 'b5', output: '♭⁵', description: 'Flat 5 with superscript' },
    { input: 'bb3', output: '♭♭³', description: 'Double flat 3 with superscript' },
    { input: 'b7', output: '♭⁷', description: 'Flat 7' },
    { input: 'b3', output: '♭³', description: 'Flat 3' },
    { input: 'b9', output: '♭⁹', description: 'Flat 9' },
    { input: '#5', output: '♯⁵', description: 'Sharp 5' },
    { input: '#9', output: '♯⁹', description: 'Sharp 9' },
    { input: '#11', output: '♯¹¹', description: 'Sharp 11' },

    // Basic symbols
    { input: '#', output: '♯', description: 'Sharp symbol' },
    { input: 'b', output: '♭', description: 'Flat symbol' },
    { input: 'l', output: 'ø', description: 'Half-diminished symbol' },
    { input: 'o', output: '°', description: 'Diminished symbol' },
    { input: 'M', output: '△', description: 'Major 7 triangle' },
    { input: 'dim', output: '°', description: 'Diminished' },
    { input: 'aug', output: '+', description: 'Augmented' },
];

/**
 * Convert text containing chord symbols to nvxFont character sequences
 * This function processes musical chord symbols and converts them appropriately
 */
export function convertToNvxChordText(text: string): string {
    if (!text) return text;

    // Only apply conversions to actual musical chord symbols
    // Don't blindly convert all 'b' to 'l' - only in chord contexts

    // Pattern for chord symbols (letter followed by accidental and/or chord quality)
    // Examples: Bb, C#, F#m, Ab7, Ger6, etc.
    const chordPattern = /([A-G][#b]*[^A-Za-z]*)|([ivxIVX]+[#b°ø]*)|([A-Za-z]*[+6789])/g;

    let result = text.replace(chordPattern, (match) => {
        // Only convert 'b' to 'l' within chord symbols for flat rendering
        return match.replace(/b/g, 'l');
    });

    return result;
}

/**
 * Check if text contains nvxFont character sequences
 */
export function containsNvxChords(text: string): boolean {
    return NVX_CHORD_MAPPINGS.some(mapping => text.includes(mapping.input));
}

/**
 * Get the expected visual output for debugging
 */
export function getExpectedOutput(text: string): string {
    if (!text) return text;

    let result = text;
    const sortedMappings = [...NVX_CHORD_MAPPINGS].sort((a, b) => b.input.length - a.input.length);

    for (const mapping of sortedMappings) {
        const regex = new RegExp(escapeRegExp(mapping.input), 'g');
        result = result.replace(regex, mapping.output);
    }

    return result;
}

/**
 * Escape special regex characters
 */
function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * React component props for nvxFont text
 */
export interface NvxTextProps {
    children: string;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * Get the complete inline style for nvxFont rendering
 */
export function getNvxFontStyle(additionalStyles?: React.CSSProperties): React.CSSProperties {
    return {
        fontFamily: 'nvxChord, monospace',
        fontFeatureSettings: '"liga" 1, "clig" 1, "dlig" 1',
        ...additionalStyles
    };
}
