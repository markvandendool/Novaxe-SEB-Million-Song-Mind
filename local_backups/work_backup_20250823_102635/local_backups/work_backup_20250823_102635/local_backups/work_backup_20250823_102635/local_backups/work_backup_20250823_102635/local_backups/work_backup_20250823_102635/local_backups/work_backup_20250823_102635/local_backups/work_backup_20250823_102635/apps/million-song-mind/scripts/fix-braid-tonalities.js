#!/usr/bin/env node

/**
 * Fix braid_tonalities.json to include chord qualities matching Angular implementation
 * Based on Angular braid.component.ts chord_type_notes definition
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load the current tonalities file
const tonalitiesPath = path.join(__dirname, '../public/assets/braid_tonalities.json');
const tonalities = JSON.parse(fs.readFileSync(tonalitiesPath, 'utf8'));

// Angular chord type mappings
const CHORD_TYPES = {
    center_major: 'M',    // Major
    center_minor: 'm',    // Minor  
    left_up: '7',         // Dominant 7
    left_down: 'm7b5',    // Half-diminished
    right_up: '7',        // Dominant 7
    right_down: 'dim',    // Diminished
    outer_left_up: '7b5',     // 7b5
    outer_left_down: 'german', // German 6th  
    outer_right_up: '7b5',    // 7b5
    outer_right_down: 'german' // German 6th
};

// Transform each key's chord arrays
const transformedTonalities = {};

for (const [key, arrays] of Object.entries(tonalities)) {
    transformedTonalities[key] = {};

    for (const [arrayName, chords] of Object.entries(arrays)) {
        const chordType = CHORD_TYPES[arrayName];

        if (chordType) {
            // Add chord quality to each root note
            transformedTonalities[key][arrayName] = chords.map(chord => {
                if (!chord) return chord;

                // Handle special cases
                if (chordType === 'M') {
                    // Major chords: just add M
                    return chord + 'M';
                } else if (chordType === 'm') {
                    // Minor chords: just add m
                    return chord + 'm';
                } else if (chordType === 'dim') {
                    // Diminished: add dim
                    return chord + 'dim';
                } else if (chordType === 'german') {
                    // German 6th: special notation
                    return chord + 'german';
                } else {
                    // All other types (7, m7b5, 7b5)
                    return chord + chordType;
                }
            });
        } else {
            // Unknown array type, keep as-is
            transformedTonalities[key][arrayName] = chords;
        }
    }
}

// Save the transformed tonalities
fs.writeFileSync(tonalitiesPath, JSON.stringify(transformedTonalities, null, 2));

console.log('✅ Fixed braid_tonalities.json with proper chord qualities');
console.log('📝 Chord type mappings applied:');
for (const [position, type] of Object.entries(CHORD_TYPES)) {
    console.log(`   ${position}: +${type}`);
}
