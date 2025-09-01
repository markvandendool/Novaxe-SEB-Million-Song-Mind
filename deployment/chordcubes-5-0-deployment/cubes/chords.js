// Basic chord datasets for key of C. Extendable later.

export const chordSetsC = {
    none: [],
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
        { roman: 'i7', letter: 'Cm7' },
        { roman: 'iiiø', letter: 'Eø' },
        { roman: 'II(7)', letter: 'D(7)' },
        { roman: 'II', letter: 'D' },
        { roman: '#ivø', letter: 'F#ø' },
        { roman: 'III(7)', letter: 'E(7)' },
        { roman: '#vº', letter: 'G#º' },
        { roman: 'VI(7)', letter: 'A(7)' },
        { roman: '#iº', letter: 'C#º' },
        { roman: 'VII(7)', letter: 'B(7)' },
        { roman: 'VII', letter: 'B' },
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

export const inversionByQuarterTurn = ['root', 'first', 'second', 'third'];

export const degreeSets = {
    'I': ['1', '3', '5', '7'],
    'ii': ['2', '4', '6', '1'],
    'iii': ['3', '5', '7', '2'],
    'IV': ['4', '6', '1', '3'],
    'V': ['5', '7', '2', '4'],
    'vi': ['6', '1', '3', '5'],
    'viiø': ['7', '2', '4', '6'],
    'I7': ['1', '3', '5', 'b7'],
    'iiiø': ['3', '5', 'b7', '2'],
    'II(7)': ['2', '#4', '6', '1'],
    '#ivø': ['#4', '6', '1', '3'],
    'III(7)': ['3', '#5', '7', '2'],
    '#vº': ['#5', '7', '2', '4'],
    'VI(7)': ['6', '#1', '3', '5'],
    'VII(7)': ['7', '#2', '#4', '6'],
    'II': ['2', '#4', '6', '#1'],
    'VII': ['7', '#2', '#4', '#6'],
    'i': ['1', 'b3', '5', 'b7'],
    'iiø': ['2', '4', 'b6', '1'],
    'bIII': ['b3', '5', 'b7', '2'],
    'iv': ['4', 'b6', '1', 'b3'],
    'v': ['5', 'b7', '2', '4'],
    'bVI': ['b6', '1', 'b3', '5'],
    'bVII': ['b7', '2', '4', 'b6'],
    'V(7)(b9)': ['5', '7', '2', 'b2'],  // Root, 3rd, 5th, b9th (b2 = b9th)
    'viiº7': ['7', '2', '4', 'b6'],
    '#iiº': ['#2', '#4', '6', '1'],  // Bass: #2, Melody: #1 3 5 b7
    '#iº': ['#1', '3', '5', 'b7'],   // Bass: #1, Melody: #1 3 5 b7
};

export const noteSetsC = {
    'I': ['C', 'E', 'G', 'B'],
    'ii': ['D', 'F', 'A', 'C'],
    'iii': ['E', 'G', 'B', 'D'],
    'IV': ['F', 'A', 'C', 'E'],
    'V': ['G', 'B', 'D', 'F'],
    'vi': ['A', 'C', 'E', 'G'],
    'viiø': ['B', 'D', 'F', 'A'],
    'I7': ['C', 'E', 'G', 'Bb'],
    'III(7)': ['E', 'G#', 'B', 'D'],
    'II(7)': ['D', 'F#', 'A', 'C'],
    'VI(7)': ['A', 'C#', 'E', 'G'],
    'VII(7)': ['B', 'D#', 'F#', 'A'],
    'II': ['D', 'F#', 'A', 'C#'],
    'iiiø': ['E', 'G', 'Bb', 'D'],
    '#ivø': ['F#', 'A', 'C', 'E'],
    '#vº': ['G#', 'B', 'D', 'F'],
    '#iº': ['C#', 'E', 'G', 'Bb'],
    '#iiº': ['D#', 'F#', 'A', 'C'],
    'VII': ['B', 'D#', 'F#', 'A#'],
    'i': ['C', 'Eb', 'G', 'Bb'],
    'i7': ['C', 'Eb', 'G', 'Bb'],
    'iiø': ['D', 'F', 'Ab', 'C'],
    'bIII': ['Eb', 'G', 'Bb', 'D'],
    'iv': ['F', 'Ab', 'C', 'Eb'],
    'v': ['G', 'Bb', 'D', 'F'],
    'bVI': ['Ab', 'C', 'Eb', 'G'],
    'bVII': ['Bb', 'D', 'F', 'Ab'],
    'V(7)(b9)': ['G', 'B', 'D', 'Ab'],  // Root, 3rd, 5th, b9th (b9th is the distinctive tone)
    'viiº7': ['B', 'D', 'F', 'Ab'],
};

const SEMITONE_FOR_NOTE = { 'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'Fb': 4, 'E#': 5, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11, 'Cb': 11, 'B#': 0 };
const NOTE_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTE_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const KEY_OFFSETS = { 'C': 0, 'Db': 1, 'D': 2, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'Ab': 8, 'A': 9, 'Bb': 10, 'B': 11 };
const SHARP_KEYS = new Set(['G', 'D', 'A', 'E', 'B', 'F#', 'C#']);

export function transposeNotes(notes, key = 'C') {
    const off = KEY_OFFSETS[key] ?? 0;
    const useSharps = SHARP_KEYS.has(key);
    return notes.map(n => {
        const s = SEMITONE_FOR_NOTE[n];
        if (s == null) return n;
        const t = (s + off + 120) % 12;
        return useSharps ? NOTE_SHARP[t] : NOTE_FLAT[t];
    });
}

export function notesToDegreesInC(notes, key = 'C') {
    const off = KEY_OFFSETS[key] ?? 0;
    const scale = [0, 2, 4, 5, 7, 9, 11].map(d => (d + off) % 12);
    return notes.map(n => {
        const s = SEMITONE_FOR_NOTE[n];
        if (s == null) return n;
        const t = (s + 120) % 12;
        let bestDeg = 0; let bestDelta = 99;
        for (let i = 0; i < 7; i++) {
            const d = scale[i];
            const delta = ((t - d + 12) % 12);
            const wrapped = delta > 6 ? delta - 12 : delta;
            if (Math.abs(wrapped) < Math.abs(bestDelta)) { bestDelta = wrapped; bestDeg = i + 1; }
        }
        const accidental = bestDelta === 0 ? '' : (bestDelta > 0 ? '#' : 'b').repeat(Math.abs(bestDelta));
        return `${accidental}${bestDeg}`;
    });
}


