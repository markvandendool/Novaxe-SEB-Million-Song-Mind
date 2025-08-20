/**
 * TEST: Try different transformations to see what works
 */

export function noTransform(chord: string): string {
    // Don't transform anything - let the font handle it
    return chord;
}

export function onlyFlatTransform(chord: string): string {
    // Only transform b to l for flats
    return chord.replace(/([A-G])b/g, '$1l');
}

export function fullTransform(chord: string): string {
    // Full transformation as currently implemented
    let transformed = chord;
    transformed = transformed.replace(/([A-G])b/g, '$1l');
    transformed = transformed.replace(/dim/g, 'o');
    transformed = transformed.replace(/º/g, 'o');
    transformed = transformed.replace(/°/g, 'o');
    transformed = transformed.replace(/german/g, 'ger');
    transformed = transformed.replace(/ø/g, 'o');
    transformed = transformed.replace(/m7b5/g, 'm7l5');
    return transformed;
}
