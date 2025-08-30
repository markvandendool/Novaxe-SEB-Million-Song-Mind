// Magic 18 Configuration for Novaxe Fretboard Integration
// This defines the 18 different chord/scale combinations to be displayed

export interface Magic18Position {
    id: number;
    name: string;
    key: string; // Root note (A, C, D, E, G, etc.)
    chordType: 'major' | 'minor' | 'dominant' | 'pentatonic';
    position: 'open' | 'closed';
    capoFret?: number;
    displaySettings: {
        x: number;  // SVG coordinate
        y: number;  // SVG coordinate
        scale: number; // Size multiplier
        rotation?: number; // Degrees
    };
}

export const MAGIC_18_CONFIGURATIONS: Magic18Position[] = [
    // A Series (Major)
    {
        id: 1,
        name: 'A Open Major',
        key: 'A',
        chordType: 'major',
        position: 'open',
        displaySettings: { x: 100, y: 100, scale: 1.0 }
    },
    {
        id: 2,
        name: 'A Closed Major',
        key: 'A',
        chordType: 'major',
        position: 'closed',
        capoFret: 1,
        displaySettings: { x: 200, y: 100, scale: 1.0 }
    },
    {
        id: 3,
        name: 'A Pentatonic Left',
        key: 'A',
        chordType: 'pentatonic',
        position: 'open',
        displaySettings: { x: 300, y: 100, scale: 1.0 }
    },
    {
        id: 4,
        name: 'A Pentatonic Right',
        key: 'A',
        chordType: 'pentatonic',
        position: 'closed',
        displaySettings: { x: 400, y: 100, scale: 1.0 }
    },

    // C Series
    {
        id: 5,
        name: 'C Open Major',
        key: 'C',
        chordType: 'major',
        position: 'open',
        displaySettings: { x: 100, y: 200, scale: 1.0 }
    },
    {
        id: 6,
        name: 'C Closed Major',
        key: 'C',
        chordType: 'major',
        position: 'closed',
        capoFret: 3,
        displaySettings: { x: 200, y: 200, scale: 1.0 }
    },
    {
        id: 7,
        name: 'C Pentatonic Left',
        key: 'C',
        chordType: 'pentatonic',
        position: 'open',
        displaySettings: { x: 300, y: 200, scale: 1.0 }
    },
    {
        id: 8,
        name: 'C Pentatonic Right',
        key: 'C',
        chordType: 'pentatonic',
        position: 'closed',
        displaySettings: { x: 400, y: 200, scale: 1.0 }
    },

    // D Series
    {
        id: 9,
        name: 'D Open Major',
        key: 'D',
        chordType: 'major',
        position: 'open',
        displaySettings: { x: 100, y: 300, scale: 1.0 }
    },
    {
        id: 10,
        name: 'D Closed Major',
        key: 'D',
        chordType: 'major',
        position: 'closed',
        capoFret: 2,
        displaySettings: { x: 200, y: 300, scale: 1.0 }
    },
    {
        id: 11,
        name: 'D Pentatonic Left',
        key: 'D',
        chordType: 'pentatonic',
        position: 'open',
        displaySettings: { x: 300, y: 300, scale: 1.0 }
    },
    {
        id: 12,
        name: 'D Pentatonic Right',
        key: 'D',
        chordType: 'pentatonic',
        position: 'closed',
        displaySettings: { x: 400, y: 300, scale: 1.0 }
    },

    // E Series
    {
        id: 13,
        name: 'E Open Major',
        key: 'E',
        chordType: 'major',
        position: 'open',
        displaySettings: { x: 100, y: 400, scale: 1.0 }
    },
    {
        id: 14,
        name: 'E Closed Major',
        key: 'E',
        chordType: 'major',
        position: 'closed',
        capoFret: 4,
        displaySettings: { x: 200, y: 400, scale: 1.0 }
    },
    {
        id: 15,
        name: 'E Pentatonic Left',
        key: 'E',
        chordType: 'pentatonic',
        position: 'open',
        displaySettings: { x: 300, y: 400, scale: 1.0 }
    },
    {
        id: 16,
        name: 'E Pentatonic Right',
        key: 'E',
        chordType: 'pentatonic',
        position: 'closed',
        displaySettings: { x: 400, y: 400, scale: 1.0 }
    },

    // G Series
    {
        id: 17,
        name: 'G Open Major',
        key: 'G',
        chordType: 'major',
        position: 'open',
        displaySettings: { x: 100, y: 500, scale: 1.0 }
    },
    {
        id: 18,
        name: 'G Pentatonic',
        key: 'G',
        chordType: 'pentatonic',
        position: 'open',
        displaySettings: { x: 200, y: 500, scale: 1.0 }
    }
];

// Template configuration for SVG integration
export const TEMPLATE_CONFIG = {
    viewBox: '0 0 612 792', // Standard Letter size
    width: 612,
    height: 792,
    fretboardSize: {
        width: 80,
        height: 120
    }
};
