import React from 'react';
import { enhancedBraidMapping, getChordStyling } from '@/utils/EnhancedBraidMapping';
import { getLigatureRenderingProps, getFontLigatureClasses } from '@/utils/EnhancedFontMapper';
import { sendChord } from '@/components/NovaxeBridgeSender';
import { useGlobalKey } from '@/state/globalKeyStore';
import '@/styles/enhanced-ligatures.css';

interface EnhancedBraidChordProps {
    chord: string;
    x?: number;
    y?: number;
    active?: boolean;
    debug?: boolean;
    className?: string;
    onClick?: (chord: string) => void;
    showHarmonicFunction?: boolean;
    animationMode?: 'none' | 'pulse' | 'glow';
}

/**
 * Enhanced BraidChord component with ligature support and intelligent mapping
 */
export const EnhancedBraidChord: React.FC<EnhancedBraidChordProps> = ({
    chord,
    x = 0,
    y = 0,
    active = false,
    debug = false,
    className = '',
    onClick,
    showHarmonicFunction = false,
    animationMode = 'none'
}) => {
    const { focusedKey } = useGlobalKey();

    // Get enhanced mapping information
    const mappingResult = enhancedBraidMapping(chord, focusedKey || 'C');
    const { harmonicSlot, braidPosition, harmonicFunction, ligatureText, confidence } = mappingResult;

    // Get styling based on harmonic analysis
    const styling = getChordStyling(chord, harmonicFunction, confidence);

    // Get font ligature classes
    const fontClasses = getFontLigatureClasses(ligatureText);

    // Handle click interaction
    const handleClick = () => {
        // Send enhanced chord data to Angular app via bridge
        try {
            const chordData = {
                root: chord.replace(/[^A-Ga-g#b]/g, '') || 'C',
                quality: chord.includes('m') || chord.includes('i') ? 'minor' : 'major',
                intervals: [], // Will be computed by the receiving app
                source: 'EnhancedBraidChord',
                harmonicFunction,
                harmonicSlot,
                braidPosition,
                ligatureText,
                confidence,
                originalChord: chord
            };
            sendChord(chordData);
            console.log('🌉 ENHANCED BRIDGE: Sent chord data', chordData);
        } catch (error) {
            console.warn('❌ ENHANCED BRIDGE ERROR: Failed to send chord data', error);
        }

        if (onClick) {
            onClick(chord);
        }
    };

    // Build CSS classes
    const baseClasses = [
        'nvx-ligature-font',
        'nvx-braid-chord',
        ...fontClasses,
        styling.colorClass,
        styling.sizeClass,
        `nvx-${harmonicFunction}`,
        braidPosition?.ring ? `nvx-${braidPosition.ring}-ring` : '',
        active ? 'nvx-chord-selected' : '',
        onClick ? 'nvx-chord-interactive' : '',
        animationMode !== 'none' ? `nvx-chord-${animationMode}` : '',
        confidence < 60 ? 'opacity-70' : '',
        debug ? 'nvx-debug' : '',
        className
    ].filter(Boolean);

    // Container style with positioning
    const containerStyle: React.CSSProperties = {
        ...getLigatureRenderingProps(),
        left: x !== 0 ? `${x}px` : undefined,
        top: y !== 0 ? `${y}px` : undefined,
        fontWeight: styling.fontWeight,
        opacity: styling.opacity,
        transform: braidPosition ? `rotate(${braidPosition.angle}deg)` : undefined
    };

    // Debug info
    const debugInfo = debug ? `${chord}→${ligatureText} (${harmonicFunction}, ${confidence}%)` : undefined;

    return (
        <div
            className={baseClasses.join(' ')}
            style={containerStyle}
            onClick={handleClick}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
            title={`${chord} - ${harmonicFunction} function (${confidence}% confidence)`}
            data-chord-info={debugInfo}
            data-original-chord={chord}
            data-ligature-text={ligatureText}
            data-harmonic-function={harmonicFunction}
            data-confidence={confidence}
        >
            {/* Main chord text using ligatures */}
            <span className="nvx-chord-text">
                {ligatureText}
            </span>

            {/* Optional harmonic function label */}
            {showHarmonicFunction && (
                <span className="nvx-function-label absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-xs opacity-60">
                    {harmonicFunction}
                </span>
            )}

            {/* Confidence indicator for debug */}
            {debug && (
                <span className="nvx-confidence absolute -top-3 -right-2 text-xs bg-black text-white rounded px-1">
                    {confidence}%
                </span>
            )}
        </div>
    );
};

interface EnhancedBraidGridProps {
    chords: Array<{
        chord: string;
        x: number;
        y: number;
        active?: boolean;
    }>;
    onChordClick?: (chord: string) => void;
    debug?: boolean;
    className?: string;
    showHarmonicFunctions?: boolean;
    animationMode?: 'none' | 'pulse' | 'glow';
}

/**
 * Enhanced BraidGrid with intelligent positioning and harmonic awareness
 */
export const EnhancedBraidGrid: React.FC<EnhancedBraidGridProps> = ({
    chords,
    onChordClick,
    debug = false,
    className = '',
    showHarmonicFunctions = false,
    animationMode = 'none'
}) => {
    const { focusedKey } = useGlobalKey();

    // Group chords by harmonic function for better visual organization
    const chordsWithMapping = chords.map(chordData => {
        const mapping = enhancedBraidMapping(chordData.chord, focusedKey || 'C');
        return {
            ...chordData,
            mapping
        };
    });

    // Sort by confidence for layered rendering (high confidence on top)
    const sortedChords = chordsWithMapping.sort((a, b) => b.mapping.confidence - a.mapping.confidence);

    return (
        <div className={`relative ${className}`} style={{ position: 'relative', width: '100%', height: '100%' }}>
            {sortedChords.map((chordData, index) => (
                <EnhancedBraidChord
                    key={`${chordData.chord}-${index}-${chordData.x}-${chordData.y}`}
                    chord={chordData.chord}
                    x={chordData.x}
                    y={chordData.y}
                    active={chordData.active}
                    onClick={onChordClick}
                    debug={debug}
                    showHarmonicFunction={showHarmonicFunctions}
                    animationMode={animationMode}
                />
            ))}

            {/* Debug overlay */}
            {debug && (
                <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white p-2 rounded text-xs">
                    <div>Key: {focusedKey}</div>
                    <div>Chords: {chords.length}</div>
                    <div>High Confidence: {sortedChords.filter(c => c.mapping.confidence > 80).length}</div>
                </div>
            )}
        </div>
    );
};

// Export both components
export { EnhancedBraidChord as default };
