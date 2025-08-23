// Chord type suffixes from Angular braid.component.ts
export const chord_type_notes = {
    fifth_left: { up: '7b5', down: 'german' },
    left: { up: '7', down: 'm7b5' },
    center: { up: '7', left: 'M', right: 'm' },
    right: { up: '7', down: 'dim' },
    fifth_right: { up: '7b5', down: 'german' },
};

export const chord_type_roman = {
    fifth_left: { up: '7b5', down: 'german' },
    left: { up: '7', down: 'm7b5' },
    center: { up: '7', left: 'M', right: 'm' },
    right: { up: '7', down: 'dim' },
    fifth_right: { up: '7b5', down: 'german' },
};

// Font ligature transformations
export const transformChordText = (text: string): string => {
    if (!text) return '';

    // Apply b→l transformation for flats with Font Jan16
    let result = text.replace(/([A-G])(b)/g, '$1l');

    // Apply chord quality transformations
    result = result
        .replace(/german/g, '+6')       // German 6th → augmented 6th notation
        .replace(/m7b5/g, 'm7l5')      // Half-diminished → m7♭5
        .replace(/7b5/g, '7l5')         // Dom7b5 → 7♭5
        .replace(/dim/g, 'o')           // Diminished → °
        .replace(/bb/g, 'll');          // Double flats → ♭♭

    return result;
};

// Get the chord suffix based on position and direction
export const getChordSuffix = (position: string, direction: string, useRoman: boolean = false): string => {
    const chord_type = useRoman ? chord_type_roman : chord_type_notes;

    const positionData = chord_type[position as keyof typeof chord_type];
    if (!positionData) return '';

    const suffix = positionData[direction as keyof typeof positionData];
    if (!suffix) return '';

    // Don't append 'M' for major - just show root note
    if (suffix === 'M') return '';

    return suffix;
};
