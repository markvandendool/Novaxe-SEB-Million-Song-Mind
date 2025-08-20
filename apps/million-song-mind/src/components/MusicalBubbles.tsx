import React, { useState } from 'react';
import braidTonalities from '../data/braid_tonalities.json';
import { BraidChord } from './BraidChord';

interface BubblePosition {
  id: string;
  x: number;
  y: number;
  type: 'note' | 'chord' | 'roman';
  radius?: number;
  row: number;
  column: 'left' | 'center-left' | 'center-right' | 'right';
}

interface MusicalBubblesProps {
  currentKey?: string;
  displayAsRoman?: boolean;
  onBubbleClick?: (position: string, value: string) => void;
  className?: string;
}

// Authentic Novaxe braid layout - vertical braided pattern matching the screenshots
// Based on the actual visual structure: vertical rows with interwoven diamond connections
const bubblePositions: BubblePosition[] = [
  // Row 1 (top)
  { id: 'row1-left', x: 100, y: 50, type: 'note', radius: 35, row: 1, column: 'left' },
  { id: 'row1-center-left', x: 200, y: 50, type: 'roman', radius: 35, row: 1, column: 'center-left' },
  { id: 'row1-center-right', x: 300, y: 50, type: 'chord', radius: 35, row: 1, column: 'center-right' },
  { id: 'row1-right', x: 400, y: 50, type: 'note', radius: 35, row: 1, column: 'right' },
  
  // Row 2
  { id: 'row2-left', x: 100, y: 130, type: 'note', radius: 35, row: 2, column: 'left' },
  { id: 'row2-center-left', x: 200, y: 130, type: 'roman', radius: 35, row: 2, column: 'center-left' },
  { id: 'row2-center-right', x: 300, y: 130, type: 'chord', radius: 35, row: 2, column: 'center-right' },
  { id: 'row2-right', x: 400, y: 130, type: 'note', radius: 35, row: 2, column: 'right' },
  
  // Row 3
  { id: 'row3-left', x: 100, y: 210, type: 'note', radius: 35, row: 3, column: 'left' },
  { id: 'row3-center-left', x: 200, y: 210, type: 'roman', radius: 35, row: 3, column: 'center-left' },
  { id: 'row3-center-right', x: 300, y: 210, type: 'chord', radius: 35, row: 3, column: 'center-right' },
  { id: 'row3-right', x: 400, y: 210, type: 'note', radius: 35, row: 3, column: 'right' },
  
  // Row 4
  { id: 'row4-left', x: 100, y: 290, type: 'note', radius: 35, row: 4, column: 'left' },
  { id: 'row4-center-left', x: 200, y: 290, type: 'roman', radius: 35, row: 4, column: 'center-left' },
  { id: 'row4-center-right', x: 300, y: 290, type: 'chord', radius: 35, row: 4, column: 'center-right' },
  { id: 'row4-right', x: 400, y: 290, type: 'note', radius: 35, row: 4, column: 'right' },
  
  // Row 5
  { id: 'row5-left', x: 100, y: 370, type: 'note', radius: 35, row: 5, column: 'left' },
  { id: 'row5-center-left', x: 200, y: 370, type: 'roman', radius: 35, row: 5, column: 'center-left' },
  { id: 'row5-center-right', x: 300, y: 370, type: 'chord', radius: 35, row: 5, column: 'center-right' },
  { id: 'row5-right', x: 400, y: 370, type: 'note', radius: 35, row: 5, column: 'right' },
  
  // Row 6
  { id: 'row6-left', x: 100, y: 450, type: 'note', radius: 35, row: 6, column: 'left' },
  { id: 'row6-center-left', x: 200, y: 450, type: 'roman', radius: 35, row: 6, column: 'center-left' },
  { id: 'row6-center-right', x: 300, y: 450, type: 'chord', radius: 35, row: 6, column: 'center-right' },
  { id: 'row6-right', x: 400, y: 450, type: 'note', radius: 35, row: 6, column: 'right' },
  
  // Row 7 (bottom)
  { id: 'row7-left', x: 100, y: 530, type: 'note', radius: 35, row: 7, column: 'left' },
  { id: 'row7-center-left', x: 200, y: 530, type: 'roman', radius: 35, row: 7, column: 'center-left' },
  { id: 'row7-center-right', x: 300, y: 530, type: 'chord', radius: 35, row: 7, column: 'center-right' },
  { id: 'row7-right', x: 400, y: 530, type: 'note', radius: 35, row: 7, column: 'right' }
];

/**
 * Get authentic bubble texts for a musical key
 * Uses the exact same mapping as the original Novaxe Angular component
 * Now supports the vertical braided layout with proper row distribution
 */
const getBubbleTextsForKey = (key: string = 'C', displayAsRoman: boolean = false) => {
  const tonality = displayAsRoman ? 'roman' : key;
  const data = braidTonalities[tonality as keyof typeof braidTonalities];
  
  if (!data) {
    console.warn(`No tonality data found for key: ${key}`);
    return getBubbleTextsForKey('C', displayAsRoman);
  }
  
  // Map the original 10-position arrays to the vertical braided layout
  return {
    // Left column - outer_left arrays
    'row1-left': data.outer_left_up?.[0] || '',
    'row2-left': data.outer_left_up?.[1] || '',
    'row3-left': data.outer_left_up?.[2] || '',
    'row4-left': data.outer_left_down?.[0] || '',
    'row5-left': data.outer_left_down?.[1] || '',
    'row6-left': data.outer_left_down?.[2] || '',
    'row7-left': data.outer_left_down?.[3] || '',
    
    // Center-left column - Roman numerals/left arrays
    'row1-center-left': data.left_up?.[0] || '',
    'row2-center-left': data.left_up?.[1] || '',
    'row3-center-left': data.left_up?.[2] || '',
    'row4-center-left': data.left_down?.[0] || '',
    'row5-center-left': data.left_down?.[1] || '',
    'row6-center-left': data.left_down?.[2] || '',
    'row7-center-left': data.left_down?.[3] || '',
    
    // Center-right column - center arrays (major/minor)
    'row1-center-right': data.center_major?.[0] || '',
    'row2-center-right': data.center_major?.[1] || '',
    'row3-center-right': data.center_major?.[2] || '',
    'row4-center-right': data.center_minor?.[0] || '',
    'row5-center-right': data.center_minor?.[1] || '',
    'row6-center-right': data.center_minor?.[2] || '',
    'row7-center-right': data.center_minor?.[3] || '',
    
    // Right column - outer_right arrays
    'row1-right': data.outer_right_up?.[0] || '',
    'row2-right': data.outer_right_up?.[1] || '',
    'row3-right': data.outer_right_up?.[2] || '',
    'row4-right': data.outer_right_down?.[0] || '',
    'row5-right': data.outer_right_down?.[1] || '',
    'row6-right': data.outer_right_down?.[2] || '',
    'row7-right': data.outer_right_down?.[3] || ''
  };
};

/**
 * MusicalBubbles - Authentic recreation of Novaxe SEB vertical braided system
 * Renders the vertical elongated braid with interwoven diamond patterns and connecting bands
 * Matches the authentic visual structure from the original Novaxe screenshots
 */
export const MusicalBubbles: React.FC<MusicalBubblesProps> = ({
  currentKey = 'C',
  displayAsRoman = false,
  onBubbleClick,
  className = ''
}) => {
  const [hoveredBubble, setHoveredBubble] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  
  // Get authentic text data for the current key
  const bubbleTexts = getBubbleTextsForKey(currentKey, displayAsRoman);
  
  const handleBubbleClick = (positionId: string, text: string) => {
    if (onBubbleClick) {
      onBubbleClick(positionId, text);
    }
    
    // Rotate to next position in the arrays (matching original behavior)
    setCurrentIndex((prev) => (prev + 1) % 17); // 17-element arrays in most positions
  };
  
  return (
    <div className={`musical-bubbles ${className}`}>
      <svg 
        viewBox="0 0 500 600" 
        className="musical-bubbles-svg"
        style={{ 
          width: '100%', 
          height: '600px',
          background: 'linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)'
        }}
      >
        {/* Authentic Novaxe Braid Connections - Interwoven Diamond Pattern */}
        <defs>
          <linearGradient id="braidGreen" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="50%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
          <linearGradient id="braidBlue" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>
        
        {/* Vertical Braid Connections - Green Interwoven Bands */}
        <g className="braid-connections" fill="none" strokeWidth="8">
          {/* Primary braid bands - left to right weaving */}
          {[1, 2, 3, 4, 5, 6].map(row => {
            const y1 = 50 + (row - 1) * 80;
            const y2 = y1 + 80;
            return (
              <g key={`braid-row-${row}`}>
                {/* Left-to-center weave */}
                <path 
                  d={`M 100 ${y1} Q 150 ${y1 + 40} 200 ${y2}`}
                  stroke="url(#braidGreen)"
                  opacity="0.8"
                />
                {/* Center weave */}
                <path 
                  d={`M 200 ${y1} Q 250 ${y1 + 40} 300 ${y2}`}
                  stroke="url(#braidGreen)" 
                  opacity="0.8"
                />
                {/* Right-to-center weave */}
                <path 
                  d={`M 300 ${y1} Q 350 ${y1 + 40} 400 ${y2}`}
                  stroke="url(#braidGreen)"
                  opacity="0.8"
                />
              </g>
            );
          })}
          
          {/* Secondary braid bands - reverse weaving */}
          {[1, 2, 3, 4, 5, 6].map(row => {
            const y1 = 50 + (row - 1) * 80 + 40;
            const y2 = y1 + 80;
            return (
              <g key={`reverse-braid-row-${row}`}>
                {/* Reverse left-to-center weave */}
                <path 
                  d={`M 200 ${y1} Q 150 ${y1 + 40} 100 ${y2}`}
                  stroke="url(#braidBlue)"
                  opacity="0.6"
                />
                {/* Reverse center weave */}
                <path 
                  d={`M 300 ${y1} Q 250 ${y1 + 40} 200 ${y2}`}
                  stroke="url(#braidBlue)"
                  opacity="0.6"
                />
                {/* Reverse right-to-center weave */}
                <path 
                  d={`M 400 ${y1} Q 350 ${y1 + 40} 300 ${y2}`}
                  stroke="url(#braidBlue)"
                  opacity="0.6"
                />
              </g>
            );
          })}
          
          {/* Diamond connection pattern */}
          {[2, 3, 4, 5, 6].map(row => {
            const y = 50 + (row - 1) * 80;
            return (
              <g key={`diamond-${row}`}>
                {/* Diamond connecting lines */}
                <path 
                  d={`M 150 ${y - 20} L 200 ${y} L 250 ${y - 20} L 300 ${y} L 350 ${y - 20}`}
                  stroke="#4ade80"
                  strokeWidth="2"
                  opacity="0.4"
                />
                <path 
                  d={`M 150 ${y + 20} L 200 ${y} L 250 ${y + 20} L 300 ${y} L 350 ${y + 20}`}
                  stroke="#4ade80"
                  strokeWidth="2"
                  opacity="0.4"
                />
              </g>
            );
          })}
        </g>
        
        {/* Bubble positions with authentic musical content - Vertical Braided Layout */}
        {bubblePositions.map((position) => {
          const currentText = bubbleTexts[position.id as keyof typeof bubbleTexts] || '';
          const isHovered = hoveredBubble === position.id;
          
          // Get bubble color based on type and position
          const getBubbleColor = () => {
            switch (position.type) {
              case 'chord': return '#3b82f6'; // Blue for chords
              case 'roman': return '#8b5cf6'; // Purple for roman numerals
              case 'note': return '#6b7280'; // Gray for notes
              default: return '#6b7280';
            }
          };
          
          return (
            <g key={position.id} className="musical-bubble-group">
              {/* Bubble shadow */}
              <circle
                cx={position.x + 3}
                cy={position.y + 3}
                r={position.radius}
                fill="rgba(0,0,0,0.3)"
                className="bubble-shadow"
              />
              
              {/* Main bubble circle */}
              <circle
                cx={position.x}
                cy={position.y}
                r={position.radius}
                fill={getBubbleColor()}
                stroke={isHovered ? '#fbbf24' : 'rgba(255,255,255,0.2)'}
                strokeWidth={isHovered ? 3 : 1}
                className="musical-bubble"
                style={{ 
                  cursor: 'pointer',
                  filter: isHovered ? 'drop-shadow(0 0 12px rgba(251,191,36,0.8))' : 'none',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={() => setHoveredBubble(position.id)}
                onMouseLeave={() => setHoveredBubble(null)}
                onClick={() => handleBubbleClick(position.id, currentText)}
              />
              
              {/* Inner highlight */}
              <circle
                cx={position.x}
                cy={position.y}
                r={position.radius! - 8}
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1"
                className="inner-highlight"
                pointerEvents="none"
              />
              
              {/* Musical text - using BraidChord component for authentic font rendering */}
              <foreignObject
                x={position.x - 20}
                y={position.y - 10}
                width="40"
                height="20"
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  height: '100%',
                  fontSize: currentText.length > 3 ? '12px' : '16px'
                }}>
                  <BraidChord 
                    chord={currentText}
                    active={isHovered}
                    className="bubble-chord-text"
                  />
                </div>
              </foreignObject>
              
              {/* Row and column indicators for debugging */}
              {hoveredBubble === position.id && (
                <g>
                  <text
                    x={position.x}
                    y={position.y - position.radius! - 10}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#fbbf24"
                    className="position-label"
                    fontWeight="bold"
                  >
                    {position.id}
                  </text>
                  <text
                    x={position.x}
                    y={position.y + position.radius! + 20}
                    textAnchor="middle"
                    fontSize="8"
                    fill="#94a3b8"
                    className="position-details"
                  >
                    Row {position.row} • {position.column}
                  </text>
                </g>
              )}
            </g>
          );
        })}
        
        {/* Key indicator with authentic styling */}
        <rect x="10" y="10" width="140" height="50" rx="8" fill="rgba(0,0,0,0.8)" stroke="rgba(255,255,255,0.2)" />
        <text 
          x="25" 
          y="30" 
          fontSize="16" 
          fontFamily="nvxChord, REAL_NOVAXE_FONT, music-font, monospace"
          fill="#22c55e"
          fontWeight="bold"
        >
          Key: {currentKey}
        </text>
        <text 
          x="25" 
          y="45" 
          fontSize="10" 
          fill="#94a3b8"
        >
          {displayAsRoman ? 'Roman Numerals' : 'Note Names'}
        </text>
        
        {/* Braid title */}
        <text 
          x="250" 
          y="25" 
          textAnchor="middle"
          fontSize="18" 
          fontFamily="nvxChord, REAL_NOVAXE_FONT, music-font, monospace"
          fill="rgba(255,255,255,0.9)"
          fontWeight="bold"
          style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
        >
          AUTHENTIC NOVAXE BRAID
        </text>
      </svg>
      
      {/* Control panel with authentic styling */}
      <div className="bubble-controls" style={{ 
        marginTop: '15px',
        display: 'flex',
        gap: '15px',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '15px',
        backgroundColor: 'rgba(0,0,0,0.8)',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <button 
          onClick={() => setCurrentIndex((prev) => (prev - 1 + 17) % 17)}
          style={{
            padding: '10px 20px',
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            color: 'white',
            border: '1px solid rgba(59, 130, 246, 0.5)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontFamily: 'nvxChord, REAL_NOVAXE_FONT, music-font, monospace',
            fontWeight: 'bold',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 1)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.8)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          ← Previous
        </button>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          color: 'rgba(255,255,255,0.9)',
          minWidth: '120px'
        }}>
          <span style={{ 
            fontSize: '14px', 
            fontWeight: 'bold',
            color: '#22c55e'
          }}>
            Position {currentIndex + 1} of 17
          </span>
          <span style={{ 
            fontSize: '12px', 
            color: 'rgba(255,255,255,0.6)',
            marginTop: '2px'
          }}>
            Authentic Braid Rotation
          </span>
        </div>
        
        <button 
          onClick={() => setCurrentIndex((prev) => (prev + 1) % 17)}
          style={{
            padding: '10px 20px',
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            color: 'white',
            border: '1px solid rgba(34, 197, 94, 0.5)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontFamily: 'nvxChord, REAL_NOVAXE_FONT, music-font, monospace',
            fontWeight: 'bold',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 1)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.8)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default MusicalBubbles;
