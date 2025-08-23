// Simple chord mapping utility based on braid_tonalities.json
import braidTonalities from '../data/braid_tonalities.json';

export interface ChordMapping {
    topChord: string;
    bottomChord: string;
}

// Simplified mapping for braid bubbles per user request
export function getChordMapping(position: number, useRoman: boolean = true): ChordMapping {
    // SIMPLIFIED MAPPING - NO JSON DATA
    // All top bubbles: "Fr" (French augmented 6th)
    // Bottom bubbles vary by position:

    let bottomSymbol: string;
    if (position > 0) {
        bottomSymbol = "Gr";  // Right side: German augmented 6th
    } else if (position < 0) {
        bottomSymbol = "ø";   // Left side: Half diminished
    } else {
        bottomSymbol = "º";   // Center: Full diminished
    }

    console.log(`🎵 Position ${position} -> Top: Fr, Bottom: ${bottomSymbol}`);

    return {
        topChord: "Fr",
        bottomChord: bottomSymbol
    };
}

export function getAllChordMappings(useRoman: boolean = true): ChordMapping[] {
    return Array.from({ length: 15 }, (_, i) => getChordMapping(i - 7, useRoman));
}
