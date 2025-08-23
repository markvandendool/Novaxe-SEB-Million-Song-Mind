// DYNAMIC FONT SWITCHING ARCHITECTURE
// Allows runtime font changes across the application

import React from 'react';

export type MusicalFontName =
    | 'nvxChord'
    | 'FontDec13'
    | 'ChordGrid'
    | 'ChordGridLegacy'
    | 'MainComma'
    | 'FontJan16'
    | 'system'; // Fallback to system fonts

export interface FontConfig {
    name: MusicalFontName;
    displayName: string;
    family: string;
    fallback: string;
    description: string;
}

// Complete font library configuration
export const AVAILABLE_FONTS: Record<MusicalFontName, FontConfig> = {
    nvxChord: {
        name: 'nvxChord',
        displayName: 'NVX Chord (Original)',
        family: '"nvxChord", monospace',
        fallback: 'monospace',
        description: 'Original Novaxe chord font - classic ligatures'
    },
    FontDec13: {
        name: 'FontDec13',
        displayName: 'Font December 13',
        family: '"FontDec13", monospace',
        fallback: 'monospace',
        description: 'REAL Novaxe font - premium ligature system'
    },
    ChordGrid: {
        name: 'ChordGrid',
        displayName: 'Chord Grid V2',
        family: '"ChordGrid", monospace',
        fallback: 'monospace',
        description: 'Modern chord grid visualization'
    },
    ChordGridLegacy: {
        name: 'ChordGridLegacy',
        displayName: 'Chord Grid Legacy',
        family: '"ChordGridLegacy", monospace',
        fallback: 'monospace',
        description: 'Legacy chord grid compatibility'
    },
    MainComma: {
        name: 'MainComma',
        displayName: 'Main Comma',
        family: '"MainComma", monospace',
        fallback: 'monospace',
        description: 'Comma-based notation system'
    },
    FontJan16: {
        name: 'FontJan16',
        displayName: 'Font January 16',
        family: '"FontJan16", monospace',
        fallback: 'monospace',
        description: 'January 2016 prototype font'
    },
    system: {
        name: 'system',
        displayName: 'System Monospace',
        family: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace',
        fallback: 'monospace',
        description: 'High-performance system fonts'
    }
};

// Current font selection state
let currentMusicalFont: MusicalFontName = 'FontDec13'; // Default

// Font selection API
export const fontSelector = {
    // Get current font
    getCurrentFont: (): FontConfig => AVAILABLE_FONTS[currentMusicalFont],

    // Set new font
    setFont: (fontName: MusicalFontName): void => {
        currentMusicalFont = fontName;
        // Trigger font change event for reactive updates
        window.dispatchEvent(new CustomEvent('musicalFontChanged', {
            detail: { fontName, config: AVAILABLE_FONTS[fontName] }
        }));
    },

    // Get font family string for CSS
    getFontFamily: (fontName?: MusicalFontName): string => {
        const font = fontName ? AVAILABLE_FONTS[fontName] : AVAILABLE_FONTS[currentMusicalFont];
        return font.family;
    },

    // Get all available fonts
    getAllFonts: (): FontConfig[] => Object.values(AVAILABLE_FONTS),

    // Font validation
    isFontLoaded: async (fontName: MusicalFontName): Promise<boolean> => {
        if (fontName === 'system') return true;

        try {
            await document.fonts.load(`16px "${fontName}"`);
            return document.fonts.check(`16px "${fontName}"`);
        } catch {
            return false;
        }
    }
};

// React hook for font selection
export function useMusicalFont() {
    const [currentFont, setCurrentFont] = React.useState<FontConfig>(
        AVAILABLE_FONTS[currentMusicalFont]
    );

    React.useEffect(() => {
        const handleFontChange = (event: CustomEvent) => {
            setCurrentFont(event.detail.config);
        };

        window.addEventListener('musicalFontChanged', handleFontChange as EventListener);
        return () => window.removeEventListener('musicalFontChanged', handleFontChange as EventListener);
    }, []);

    return {
        currentFont,
        setFont: fontSelector.setFont,
        getFontFamily: fontSelector.getFontFamily,
        allFonts: fontSelector.getAllFonts(),
        isFontLoaded: fontSelector.isFontLoaded
    };
}

// CSS-in-JS helper for dynamic font switching
export function getMusicalFontStyle(fontName?: MusicalFontName): React.CSSProperties {
    return {
        fontFamily: fontSelector.getFontFamily(fontName),
        fontFeatureSettings: '"liga" on, "kern" on, "calt" on'
    };
}

// Debug utility
export function debugFontStatus(): void {
    console.group('🔤 FONT SYSTEM STATUS');
    console.log('Current Font:', fontSelector.getCurrentFont());
    console.log('Available Fonts:', fontSelector.getAllFonts().length);

    fontSelector.getAllFonts().forEach(async (font) => {
        const loaded = await fontSelector.isFontLoaded(font.name);
        console.log(`${font.displayName}: ${loaded ? '✅' : '❌'}`);
    });

    console.groupEnd();
}
