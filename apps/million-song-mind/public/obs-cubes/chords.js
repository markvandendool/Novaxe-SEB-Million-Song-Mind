// Basic chord datasets for key of C. Extendable later.

export const chordSetsC = {
    major: [
        { roman: 'I', letter: 'C' },
        { roman: 'ii', letter: 'Dm' },
        { roman: 'iii', letter: 'Em' },
        { roman: 'IV', letter: 'F' },
        { roman: 'V', letter: 'G' },
        { roman: 'vi', letter: 'Am' },
        { roman: 'viiø', letter: 'Bø' },
    ],
    applied: [
        { roman: 'I7', letter: 'C7' },
        { roman: 'iiiø', letter: 'Eø' },
        { roman: 'II(7)', letter: 'D(7)' },
        { roman: '#ivø', letter: 'F#ø' },
        { roman: 'III(7)', letter: 'E(7)' },
        { roman: '#vº', letter: 'G#º' },
        { roman: 'VI(7)', letter: 'A(7)' },
        { roman: '#iº', letter: 'C#º' },
        { roman: 'VII(7)', letter: 'B(7)' },
        { roman: '#iiº', letter: 'D#º' },
    ],
    minor: [
        { roman: 'i', letter: 'Cm' },
        { roman: 'iiø', letter: 'Dø' },
        { roman: 'bIII', letter: 'Eb' },
        { roman: 'iv', letter: 'Fm' },
        { roman: 'v', letter: 'Gm' },
        { roman: 'bVI', letter: 'Ab' },
        { roman: 'bVII', letter: 'Bb' },
        { roman: 'V(7)(b9)', letter: 'G(7)(b9)' },
        { roman: 'viiº7', letter: 'Bº7' },
    ],
    all: [],
};

// Combine into an 'all' view
chordSetsC.all = [...chordSetsC.major, ...chordSetsC.applied, ...chordSetsC.minor];

// Mapping from rotation index -> inversion name
export const inversionByQuarterTurn = [
    'root', // 0°
    'first', // 90°
    'second', // 180°
    'third', // 270°
];

// Note sets for key of C (letter mode), per chord label (roman side shown for reference)
// Arrays are [root, third, fifth, seventh]
export const noteSetsC = {
    // Diatonic major family
    'I': ['C', 'E', 'G', 'B'],
    'ii': ['D', 'F', 'A', 'C'],
    'iii': ['E', 'G', 'B', 'D'],
    'IV': ['F', 'A', 'C', 'E'],
    'V': ['G', 'B', 'D', 'F'],
    'vi': ['A', 'C', 'E', 'G'],
    'viiø': ['B', 'D', 'F', 'A'],

    // Applied family (dominants/altered/half-dim/dim) relative to C
    'I7': ['C', 'E', 'G', 'Bb'],        // C7
    'III(7)': ['E', 'G#', 'B', 'D'],    // E7
    'II(7)': ['D', 'F#', 'A', 'C'],     // D7
    'VI(7)': ['A', 'C#', 'E', 'G'],     // A7
    'VII(7)': ['B', 'D#', 'F#', 'A'],   // B7
    'iiiø': ['E', 'G', 'Bb', 'D'],      // E half-dim 7
    '#ivø': ['F#', 'A', 'C', 'E'],      // F# half-dim 7
    '#vº': ['G#', 'B', 'D', 'F'],       // G# dim 7
    '#iº': ['C#', 'E', 'G', 'Bb'],      // C# dim 7
    '#iiº': ['D#', 'F#', 'A', 'C'],     // D# dim 7
};

// Degree labels in C major for natural and altered notes
const DEGREE_FOR_NOTE = {
    'C': '1', 'C#': '#1', 'Cb': 'b1',
    'D': '2', 'D#': '#2', 'Db': 'b2',
    'E': '3', 'E#': '#3', 'Eb': 'b3',
    'F': '4', 'F#': '#4', 'Fb': 'b4',
    'G': '5', 'G#': '#5', 'Gb': 'b5',
    'A': '6', 'A#': '#6', 'Ab': 'b6',
    'B': '7', 'B#': '#7', 'Bb': 'b7',
};

export function notesToDegreesInC(notes) {
    return notes.map(n => DEGREE_FOR_NOTE[n] || n);
}


