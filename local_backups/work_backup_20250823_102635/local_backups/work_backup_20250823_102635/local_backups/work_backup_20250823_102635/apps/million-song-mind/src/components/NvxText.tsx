import React from 'react';
import { getNvxFontStyle, convertToNvxChordText, containsNvxChords, getExpectedOutput } from '../utils/nvxChordMapping';

export interface NvxTextProps {
    children: string;
    className?: string;
    style?: React.CSSProperties;
    debug?: boolean;
}

/**
 * NvxText - Renders text using the nvxFont with proper character mappings
 * This component automatically converts chord symbols to nvxFont sequences
 */
export const NvxText: React.FC<NvxTextProps> = ({
    children,
    className = '',
    style = {},
    debug = false
}) => {
    const nvxText = convertToNvxChordText(children);
    const hasChords = containsNvxChords(children);
    const expectedOutput = getExpectedOutput(children);

    const finalStyle = getNvxFontStyle(style);

    if (debug) {
        console.log('NvxText Debug:', {
            original: children,
            converted: nvxText,
            hasChords,
            expected: expectedOutput,
            style: finalStyle
        });
    }

    return (
        <span
            className={className}
            style={finalStyle}
            title={debug ? `Expected: ${expectedOutput}` : undefined}
        >
            {nvxText}
        </span>
    );
};

/**
 * NvxSvgText - For SVG contexts where inline styles are required
 */
export interface NvxSvgTextProps {
    x?: number | string;
    y?: number | string;
    children: string;
    fontSize?: number | string;
    fill?: string;
    className?: string;
    debug?: boolean;
    style?: React.CSSProperties;
    onClick?: (e: React.MouseEvent<SVGTextElement>) => void;
}

export const NvxSvgText: React.FC<NvxSvgTextProps> = ({
    x = 0,
    y = 0,
    children,
    fontSize = 16,
    fill = 'currentColor',
    className = '',
    debug = false,
    style = {},
    onClick
}) => {
    const nvxText = convertToNvxChordText(children);
    const expectedOutput = getExpectedOutput(children);

    const svgStyle: React.CSSProperties = {
        fontFamily: 'nvxChord, monospace',
        fontSize,
        fontFeatureSettings: '"liga" 1, "clig" 1, "dlig" 1, "kern" 1',
        fontVariantLigatures: 'common-ligatures contextual discretionary-ligatures' as any,
        ...style
    };

    if (debug || children.includes('german') || children.includes('dim')) {
        console.log('🎵 NvxSvgText Debug:', {
            original: children,
            converted: nvxText,
            expected: expectedOutput,
            style: svgStyle
        });
    }

    return (
        <text
            x={x}
            y={y}
            fill={fill}
            className={className}
            style={svgStyle}
            onClick={onClick}
        >
            {nvxText}
        </text>
    );
};
