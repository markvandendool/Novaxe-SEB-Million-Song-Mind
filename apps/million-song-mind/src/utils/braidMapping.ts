// Simple chord mapping utility based on braid_tonalities.json
import braidTonalities from '../data/braid_tonalities.json';

export interface ChordMapping {
    topChord: string;
    bottomChord: string;
}

// Key mapping (simplified - matching the 15 positions)
const KEY_SEQUENCE = [
    'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'Ab', 'Eb', 'Bb', 'F', 'Db', 'Gb', 'Cb'
];

export function getChordMapping(position: number, useRoman: boolean = true): ChordMapping {
    // Normalize position to array index (0-14)
    const keyIndex = Math.abs(position) % KEY_SEQUENCE.length;

    if (useRoman) {
        const romanChords = braidTonalities.roman;
        const majorChords = romanChords.center_major || [];
        const minorChords = romanChords.center_minor || [];

        // Use position to select chord from arrays
        const chordIndex = position % majorChords.length;

        return {
            topChord: majorChords[chordIndex] || 'I',
            bottomChord: minorChords[chordIndex] || 'i'
        };
    }

    // Basic chord mapping for non-roman mode
    const key = KEY_SEQUENCE[keyIndex];
    return {
        topChord: key,
        bottomChord: key.toLowerCase()
    };
}

export function getAllChordMappings(useRoman: boolean = true): ChordMapping[] {
    return Array.from({ length: 15 }, (_, i) => getChordMapping(i - 7, useRoman));
}
