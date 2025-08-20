import React, { useState } from 'react';
import braidTonalities from '../data/braid_tonalities.json';

interface BubblePosition {
  id: string;
  x: number;
  y: number;
  type: 'note' | 'chord';
  radius?: number;
}

interface MusicalBubblesProps {
  currentKey?: string;
  displayAsRoman?: boolean;
  onBubbleClick?: (position: string, value: string) => void;
  className?: string;
}

// Original Novaxe bubble positions - matching the authentic braid layout
const bubblePositions: BubblePosition[] = [
  // Left outer arc (5th circle) - fifth_left arrays
  { id: 'outer-left-up', x: 200, y: 150, type: 'note', radius: 25 },
  { id: 'outer-left-down', x: 200, y: 250, type: 'note', radius: 25 },
  
  // Left inner arc - left arrays
  { id: 'left-up', x: 250, y: 170, type: 'note', radius: 20 },
  { id: 'left-down', x: 250, y: 230, type: 'note', radius: 20 },
  
  // Center positions - center arrays (core of the braid)
  { id: 'center-left', x: 300, y: 180, type: 'chord', radius: 30 },
  { id: 'center-right', x: 300, y: 220, type: 'chord', radius: 30 },
  
  // Right inner arc - right arrays  
  { id: 'right-up', x: 350, y: 170, type: 'note', radius: 20 },
  { id: 'right-down', x: 350, y: 230, type: 'note', radius: 20 },
  
  // Right outer arc (5th circle) - fifth_right arrays
  { id: 'outer-right-up', x: 400, y: 150, type: 'note', radius: 25 },
  { id: 'outer-right-down', x: 400, y: 250, type: 'note', radius: 25 }
];

/**
 * Get authentic bubble texts for a musical key
 * Uses the exact same mapping as the original Novaxe Angular component
 */
const getBubbleTextsForKey = (key: string = 'C', displayAsRoman: boolean = false) => {
  const tonality = displayAsRoman ? 'roman' : key;
  const data = braidTonalities[tonality as keyof typeof braidTonalities];
  
  if (!data) {
    console.warn(`No tonality data found for key: ${key}`);
    return getBubbleTextsForKey('C', displayAsRoman);
  }
  
  return {
    // Left outer arc (5th circle) - outer_left arrays from original braid_tonalities.json
    'outer-left-up': data.outer_left_up || [],
    'outer-left-down': data.outer_left_down || [],
    
    // Left inner arc - left arrays from original
    'left-up': data.left_up || [],
    'left-down': data.left_down || [],
    
    // Center positions - core of braid system
    // Original mapping: center_left = center_major, center_right = center_minor  
    'center-left': data.center_major || [],
    'center-right': data.center_minor || [],
    
    // Right inner arc - right arrays from original
    'right-up': data.right_up || [],
    'right-down': data.right_down || [],
    
    // Right outer arc (5th circle) - outer_right arrays from original
    'outer-right-up': data.outer_right_up || [],
    'outer-right-down': data.outer_right_down || []
  };
};

/**
 * MusicalBubbles - Authentic recreation of Novaxe SEB braid bubble system
 * Renders the 10-position musical note/chord arrangement with real data from braid_tonalities.json
 */
export const MusicalBubbles: React.FC<MusicalBubblesProps> = ({
  currentKey = 'C',
  displayAsRoman = false,
  onBubbleClick,
  className = ''
}) => {
  const [hoveredBubble, setHoveredBubble] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  
  // Get authentic text arrays for the current key
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
        viewBox="0 0 600 400" 
        className="musical-bubbles-svg"
        style={{ 
          width: '100%', 
          height: '400px',
          background: 'transparent'
        }}
      >
        {/* Background braid lines - connecting the musical relationships */}
        <g className="braid-connections" stroke="#e0e0e0" strokeWidth="1" fill="none">
          {/* Fifth circle connections */}
          <path d="M 200 150 Q 300 100 400 150" />
          <path d="M 200 250 Q 300 300 400 250" />
          
          {/* Inner arc connections */}
          <path d="M 250 170 Q 300 150 350 170" />
          <path d="M 250 230 Q 300 250 350 230" />
          
          {/* Center connection - the core braid */}
          <line x1="300" y1="180" x2="300" y2="220" strokeWidth="3" stroke="#666" />
        </g>
        
        {/* Bubble positions with authentic musical content */}
        {bubblePositions.map((position) => {
          const textArray = bubbleTexts[position.id as keyof typeof bubbleTexts];
          const currentText = textArray && textArray.length > 0 
            ? textArray[currentIndex % textArray.length] 
            : '';
          const isHovered = hoveredBubble === position.id;
          
          return (
            <g key={position.id} className="musical-bubble-group">
              {/* Bubble circle */}
              <circle
                cx={position.x}
                cy={position.y}
                r={position.radius}
                fill={position.type === 'chord' ? '#4a90e2' : '#7fb3d3'}
                stroke={isHovered ? '#ff6b6b' : '#333'}
                strokeWidth={isHovered ? 3 : 1}
                className="musical-bubble"
                style={{ 
                  cursor: 'pointer',
                  filter: isHovered ? 'drop-shadow(0 0 8px rgba(255,107,107,0.6))' : 'none',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={() => setHoveredBubble(position.id)}
                onMouseLeave={() => setHoveredBubble(null)}
                onClick={() => handleBubbleClick(position.id, currentText)}
              />
              
              {/* Musical text - using original nvxChord font */}
              <text
                x={position.x}
                y={position.y + 4}
                textAnchor="middle"
                fontSize={position.type === 'chord' ? '16' : '14'}
                fontFamily="nvxChord, REAL_NOVAXE_FONT, music-font, monospace"
                fill="white"
                fontWeight="bold"
                className="musical-text"
                pointerEvents="none"
                style={{
                  textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                }}
              >
                {currentText}
              </text>
              
              {/* Position label for debugging */}
              {hoveredBubble === position.id && (
                <text
                  x={position.x}
                  y={position.y - position.radius! - 8}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#666"
                  className="position-label"
                >
                  {position.id}
                </text>
              )}
            </g>
          );
        })}
        
        {/* Key indicator */}
        <text 
          x="30" 
          y="30" 
          fontSize="18" 
          fontFamily="nvxChord, REAL_NOVAXE_FONT, music-font, monospace"
          fill="#333"
          fontWeight="bold"
        >
          Key: {currentKey} {displayAsRoman ? '(Roman)' : ''}
        </text>
        
        {/* Rotation indicator */}
        <text 
          x="30" 
          y="50" 
          fontSize="12" 
          fill="#666"
        >
          Position: {currentIndex + 1}/17
        </text>
      </svg>
      
      {/* Control panel */}
      <div className="bubble-controls" style={{ marginTop: '10px' }}>
        <button 
          onClick={() => setCurrentIndex((prev) => (prev + 1) % 17)}
          style={{
            padding: '8px 16px',
            marginRight: '10px',
            backgroundColor: '#4a90e2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Rotate Forward
        </button>
        
        <button 
          onClick={() => setCurrentIndex((prev) => (prev - 1 + 17) % 17)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#7fb3d3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Rotate Back
        </button>
      </div>
    </div>
  );
};

export default MusicalBubbles;
