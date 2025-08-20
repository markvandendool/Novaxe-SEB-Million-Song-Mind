import React from 'react';
import { translateChordToFont, classifyChord } from '@/utils/ChordFontMapper';
import '@/styles/braid-angular-exact.css'; // Use exact Angular font system

interface BraidChordProps {
    chord: string;
    x?: number;
    y?: number;
    active?: boolean;
    debug?: boolean;
    onClick?: (chord: string) => void;
    className?: string;
}

/**
 * BraidChord - Renders a chord using the original nvxChord font system
 * Matches the legacy Angular braid font rendering (single font, no separation)
 */
export const BraidChord: React.FC<BraidChordProps> = ({
    chord,
    x = 0,
    y = 0,
    active = false,
    debug = false,
    onClick,
    className = ''
}) => {
    if (!chord) return null;

    const fontChar = translateChordToFont(chord);
    const chordType = classifyChord(chord);

    const handleClick = () => {
        if (onClick) {
            onClick(chord);
        }
    };

    const containerStyle: React.CSSProperties = {
        left: x !== 0 ? `${x}px` : undefined,
        top: y !== 0 ? `${y}px` : undefined,
    };

    return (
        <div
            className={`
        braid-chord-container
        ${active ? 'braid-chord-active' : ''}
        ${x !== 0 || y !== 0 ? 'braid-position-absolute' : ''}
        ${className}
      `.trim()}
            data-chord-type={chordType}
            data-original-chord={chord}
            data-debug={debug}
            style={containerStyle}
            onClick={handleClick}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            <span className="braid-chord-text">
                {fontChar}
            </span>
        </div>
    );
};

interface BraidChordGridProps {
    chords: Array<{
        chord: string;
        x: number;
        y: number;
        active?: boolean;
    }>;
    onChordClick?: (chord: string) => void;
    debug?: boolean;
    className?: string;
}

/**
 * BraidChordGrid - Renders multiple chords with precise positioning
 * Replicates the Angular braid SVG positioning system
 */
export const BraidChordGrid: React.FC<BraidChordGridProps> = ({
    chords,
    onChordClick,
    debug = false,
    className = ''
}) => {
    return (
        <div className={`braid-position-relative ${className}`}>
            {chords.map((chordData, index) => (
                <BraidChord
                    key={`${chordData.chord}-${index}`}
                    chord={chordData.chord}
                    x={chordData.x}
                    y={chordData.y}
                    active={chordData.active}
                    onClick={onChordClick}
                    debug={debug}
                />
            ))}
        </div>
    );
};

interface BraidChordSequenceProps {
    chords: string[];
    activeIndex?: number;
    onChordClick?: (chord: string, index: number) => void;
    debug?: boolean;
    className?: string;
}

/**
 * BraidChordSequence - Renders a horizontal sequence of chords
 * Useful for chord progressions and harmonic analysis display
 */
export const BraidChordSequence: React.FC<BraidChordSequenceProps> = ({
    chords,
    activeIndex = -1,
    onChordClick,
    debug = false,
    className = ''
}) => {
    return (
        <div className={`flex gap-6 items-baseline ${className}`}>
            {chords.map((chord, index) => (
                <BraidChord
                    key={`${chord}-${index}`}
                    chord={chord}
                    active={index === activeIndex}
                    onClick={(chord) => onChordClick?.(chord, index)}
                    debug={debug}
                />
            ))}
        </div>
    );
};

export default BraidChord;
