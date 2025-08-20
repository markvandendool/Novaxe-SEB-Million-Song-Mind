/**
 * Font transformation utilities for musical notation fonts
 * Based on legacy Angular Novaxe system font handling
 * 
 * The nvxFont and Fontdec13 fonts use ligatures to render musical symbols:
 * - Lowercase 'l' renders as flat symbol (♭)
 * - Special character sequences trigger font ligatures
 */

/**
 * Transform chord text for font ligature rendering
 * Converts standard chord notation to font-specific character sequences
 */
export function transformChordForFont(chord: string): string {
    if (!chord) return '';

    let transformed = chord;

    // CRITICAL: Only transform 'b' to 'l' when it's a flat accidental (after A-G)
    // Pattern: Capital letter A-G followed by 'b' = flat accidental
    // Examples: Bb → Bl, Eb → El, Ab → Al, Db → Dl, Gb → Gl, Cb → Cl, Fb → Fl
    // But NOT: Bm → Bm (B minor stays as is), B → B (B natural stays as is)
    transformed = transformed.replace(/([A-G])b/g, '$1l');

    // Note: Sharps (#) might also need transformation depending on font design
    // For now leaving # as-is, but could be transformed if needed
    // transformed = transformed.replace(/([A-G])#/g, '$1s'); // Uncomment if needed

    // Handle specific chord quality transformations
    // These trigger ligatures in the heavily-ligatured font

    // Transform diminished symbols to trigger º ligature
    transformed = transformed.replace(/dim/g, 'o');
    transformed = transformed.replace(/º/g, 'o');
    transformed = transformed.replace(/°/g, 'o');

    // German 6th chord - shortened form for ligature
    transformed = transformed.replace(/german/g, 'ger');

    // Half-diminished might need special handling
    transformed = transformed.replace(/ø/g, 'o');

    // For m7b5, only the b5 part needs transformation (flat 5)
    transformed = transformed.replace(/m7b5/g, 'm7l5');

    return transformed;
}

/**
 * Transform a full chord symbol including enharmonic equivalents
 * Handles special cases like F# → Gb for certain contexts
 */
export function transformChordEnharmonic(chord: string): string {
    // Enharmonic substitutions used in Angular system
    const enharmonics: Record<string, string> = {
        'F#': 'Gl',  // F# → Gb (G-flat)
        'C#': 'Dl',  // C# → Db (D-flat)
        'G#': 'Al',  // G# → Ab (A-flat)
        'D#': 'El',  // D# → Eb (E-flat)
        'A#': 'Bl',  // A# → Bb (B-flat)
    };

    let result = chord;

    // Apply enharmonic transformations for sharps to flats
    for (const [sharp, flat] of Object.entries(enharmonics)) {
        if (result.startsWith(sharp)) {
            result = flat + result.slice(sharp.length);
            break;
        }
    }

    // Then apply standard font transformations
    return transformChordForFont(result);
}

/**
 * Process chord text for display in braid
 * This is what should be called for each chord before rendering
 */
export function processChordForBraid(chord: string): string {
    if (!chord) return '';

    // The Angular system would transform the chord for font display
    // This includes both character substitutions and quality additions
    return transformChordForFont(chord);
}

export default {
    transformChordForFont,
    transformChordEnharmonic,
    processChordForBraid
};
