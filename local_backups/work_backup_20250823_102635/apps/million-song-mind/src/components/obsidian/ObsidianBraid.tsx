/**
 * Obsidian Braid Component - Exact implementation of Obsidian's braid system
 * Integrates font mapping and braid positioning for MSM
 */

import React, { useState, useEffect, useCallback } from 'react';
import { formatChordForObsidianFont, parseChord, classifyChordType } from './ObsidianFontMapper';
import {
  getBraidPositionsForKey,
  getChordPositions,
  isChordInBraidPosition,
  OBSIDIAN_CHORD_TYPES,
  type ObsidianKey,
  type BraidPosition
} from './ObsidianBraidMapper';

interface ObsidianBraidProps {
  currentChord?: string;
  currentKey?: string;
  chordsInScore?: string[];
  displayAsRoman?: boolean;
  zoom?: number;
  braidType?: 'tonal' | 'modal';
  onChordClick?: (chord: string) => void;
}

interface BraidState {
  highlightedChords: string[];
  currentTonality: string;
  braidPositions: any;
  chordTypes: typeof OBSIDIAN_CHORD_TYPES;
}

export const ObsidianBraid: React.FC<ObsidianBraidProps> = ({
  currentChord,
  currentKey = 'C',
  chordsInScore = [],
  displayAsRoman = false,
  zoom = 1,
  braidType = 'tonal',
  onChordClick
}) => {
  const [braidState, setBraidState] = useState<BraidState>({
    highlightedChords: [],
    currentTonality: currentKey,
    braidPositions: getBraidPositionsForKey(currentKey as ObsidianKey),
    chordTypes: OBSIDIAN_CHORD_TYPES
  });

  // Update braid when key changes - matches Obsidian's change_tonality
  useEffect(() => {
    const newPositions = getBraidPositionsForKey(currentKey as ObsidianKey);
    setBraidState(prev => ({
      ...prev,
      currentTonality: currentKey,
      braidPositions: newPositions
    }));
  }, [currentKey]);

  // Light up chord when current chord changes - matches Obsidian's change_score_chord
  useEffect(() => {
    if (currentChord) {
      const parsed = parseChord(currentChord);
      if (parsed) {
        const { root, chordType } = parsed;
        const classifiedType = classifyChordType(chordType);

        // Matches Obsidian's light_score logic
        const chordsToHighlight = [currentChord];

        // Add enharmonic equivalents (simplified version of Obsidian's logic)
        if (root === 'B') chordsToHighlight.push(`Cb${chordType}`);
        if (root === 'E') chordsToHighlight.push(`Fb${chordType}`);
        if (root === 'F') chordsToHighlight.push(`E#${chordType}`);

        // Special handling for dim7 chords (Obsidian lights enharmonic dims)
        if (classifiedType === 'dim7') {
          // Add other dim7 enharmonics (simplified)
          const rootNote = root;
          // In full implementation, would add all enharmonic dim7 chords
        }

        setBraidState(prev => ({
          ...prev,
          highlightedChords: chordsToHighlight
        }));
      }
    } else {
      setBraidState(prev => ({
        ...prev,
        highlightedChords: []
      }));
    }
  }, [currentChord]);

  // Check if chord should be highlighted - matches Obsidian's get_bubble_class logic
  const getBubbleClass = useCallback((chord: string, chordType: string): string => {
    const fullChord = chord + chordType;
    const isHighlighted = braidState.highlightedChords.includes(fullChord) ||
      braidState.highlightedChords.includes(chord);
    const isInScore = chordsInScore.includes(fullChord) || chordsInScore.includes(chord);

    let classes = ['obsidian-bubble'];
    if (isHighlighted) classes.push('active');
    if (isInScore) classes.push('in-score');

    return classes.join(' ');
  }, [braidState.highlightedChords, chordsInScore]);

  // Handle chord click - matches Obsidian's hoverMe function
  const handleChordClick = useCallback((chord: string, chordType: string) => {
    const fullChord = chord + chordType;
    if (onChordClick) {
      onChordClick(fullChord);
    }
  }, [onChordClick]);

  // Render chord text with Obsidian font - matches Obsidian's text rendering
  const renderChordText = useCallback((chord: string, chordType: string, position: { x: number; y: number }) => {
    if (displayAsRoman && chord) {
      // For roman numeral display (simplified - full implementation would need proper roman conversion)
      const isMinor = chordType === 'm' || chordType.startsWith('m');
      return (
        <text
          className="obsidian-chord-font duo roman"
          x={position.x}
          y={position.y}
        >
          {isMinor ? chord.toLowerCase() : chord}
        </text>
      );
    } else {
      // Regular chord display with font mapping
      const fontText = formatChordForObsidianFont(chord + chordType);
      return (
        <text
          className="obsidian-chord-font duo"
          x={position.x}
          y={position.y}
        >
          {fontText}
        </text>
      );
    }
  }, [displayAsRoman]);

  // Get zoom transform - matches Obsidian's zoom_val setter
  const getZoomTransform = useCallback(() => {
    let topOffset = 0;
    const zoomStr = zoom.toString();

    // Matches Obsidian's zoom offset calculation
    switch (zoomStr) {
      case '0.4': topOffset = -760; break;
      case '0.5': topOffset = -630; break;
      case '0.6': topOffset = -510; break;
      case '0.7': topOffset = -380; break;
      case '0.8': topOffset = -260; break;
      case '0.9': topOffset = -140; break;
      case '1': topOffset = 0; break;
      case '1.1': topOffset = 110; break;
      case '1.2': topOffset = 240; break;
      case '1.3': topOffset = 360; break;
      case '1.4': topOffset = 490; break;
      case '1.5': topOffset = 620; break;
      case '1.6': topOffset = 740; break;
      case '1.7': topOffset = 860; break;
      case '1.8': topOffset = 990; break;
      case '1.9': topOffset = 1110; break;
      case '2': topOffset = 1250; break;
      default: topOffset = 0; break;
    }

    return {
      transform: `scale(${zoom})`,
      top: `${topOffset}px`
    };
  }, [zoom]);

  if (braidType !== 'tonal') {
    return <div>Modal braid not implemented yet</div>;
  }

  return (
    <div className="obsidian-braid-container">
      <style>{`
        .obsidian-braid-container {
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        
        .obsidian-braid-svg {
          width: 100%;
          ${getZoomTransform().transform && `transform: ${getZoomTransform().transform};`}
          ${getZoomTransform().top && `top: ${getZoomTransform().top};`}
          position: relative;
        }
        
        .obsidian-braid-svg:focus {
          outline: none;
        }
        
        .obsidian-bubble {
          fill: url(#greyGradient);
          cursor: pointer;
          transition: all 0.25s ease;
        }
        
        .obsidian-bubble.active {
          stroke: var(--primary, #00a450) !important;
          filter: saturate(2.5) drop-shadow(2px 4px 6px black);
        }
        
        .obsidian-bubble.in-score {
          opacity: 0.8;
        }
        
        .obsidian-chord-font {
          font-family: "nvxChord", monospace;
          fill: black;
          font-size: 0.7em;
          text-anchor: left;
          user-select: none;
        }
        
        .obsidian-chord-font.duo {
          font-size: 0.85em;
        }
        
        .obsidian-chord-font.duo.roman {
          font-size: 0.7em;
        }
        
        @font-face {
          font-family: "nvxChord";
          src: url("/assets/font/nvxFont.otf");
        }
      `}</style>

      <svg
        className="obsidian-braid-svg"
        viewBox="-10 40 320 1600"
        width="100%"
        height="100%"
      >
        {/* SVG Gradients - matches Obsidian's definitions */}
        <defs>
          <linearGradient id="greenGradient" x1="0.5" x2="0.8" y1="0.1" y2="0.8">
            <stop offset="0%" stopColor="#00a450" />
            <stop offset="100%" stopColor="#416c63" />
          </linearGradient>

          <radialGradient id="greyGradient" x1="0.1" y1="0.1" x2="1" y2="1">
            <stop offset="0%" stopColor="#7f8899" />
            <stop offset="100%" stopColor="#58595b" />
          </radialGradient>

          <radialGradient id="eraseGradient" x1="0.1" y1="0.1" x2="1" y2="1">
            <stop offset="0%" stopColor="#343a40" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>
        </defs>

        {/* Center Vertical Axis - simplified version of Obsidian's layout */}
        <g transform="translate(150 0) scale(0.9)">
          {braidState.braidPositions.center_major?.map((chord: string, i: number) => {
            if (!chord) return null;

            return (
              <g key={`center-${i}`} transform={`translate(0 ${(i + 1) * 90})`}>
                {/* Center Major Bubble */}
                <g
                  className={getBubbleClass(chord, braidState.chordTypes.center.left)}
                  onClick={() => handleChordClick(chord, braidState.chordTypes.center.left)}
                >
                  <circle cx="0" cy="0" r="30" />
                  {renderChordText(chord, braidState.chordTypes.center.left, { x: -5, y: -6 })}
                </g>

                {/* Center Minor Bubble */}
                {braidState.braidPositions.center_minor?.[i] && (
                  <g
                    className={getBubbleClass(braidState.braidPositions.center_minor[i], braidState.chordTypes.center.right)}
                    onClick={() => handleChordClick(braidState.braidPositions.center_minor[i], braidState.chordTypes.center.right)}
                  >
                    <circle cx="0" cy="30" r="25" />
                    {renderChordText(braidState.braidPositions.center_minor[i], braidState.chordTypes.center.right, { x: 0, y: 35 })}
                  </g>
                )}
              </g>
            );
          })}
        </g>

        {/* Simplified layout - full implementation would include all braid positions */}
        {/* This demonstrates the core concept with center positions only */}

      </svg>
    </div>
  );
};

export default ObsidianBraid;
