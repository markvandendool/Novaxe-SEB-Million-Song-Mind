import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface TonalityWheelProps {
  isOpened?: boolean;
  currentMidiChord?: string[];
  onTonalityChange?: (tonality: string, mode: 'major' | 'minor') => void;
  onChordSelect?: (chord: string) => void;
  locked?: boolean;
  currentTonality?: string;
}

interface TonalityPosition {
  x: number;
  y: number;
  chord: string;
  roman: string;
  position: number;
}

const ReactTonalityWheel: React.FC<TonalityWheelProps> = ({
  isOpened = false,
  currentMidiChord = [],
  onTonalityChange,
  onChordSelect,
  locked = false,
  currentTonality = 'C'
}) => {
  // State management from Angular component
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [selectedTonality, setSelectedTonality] = useState<string>(currentTonality);
  const [selectedGreen, setSelectedGreen] = useState<string>('C');
  const [currentScoreChord, setCurrentScoreChord] = useState<string>('');
  const [activeMidiChord, setActiveMidiChord] = useState<string>('');
  const [isLocked, setIsLocked] = useState<boolean>(locked);
  const [mode, setMode] = useState<'major' | 'minor' | ''>('');
  
  const wheelRef = useRef<HTMLDivElement>(null);

  // Circle of fifths data (from Angular analysis)
  const fifths = ['C','G','D','A','E','B','Gb','Db','Ab','Eb','Bb','F'];
  const fifthsSharp = ['C','G','D','A','E','B','F#','C#','G#','D#','A#','F'];
  const minorFifths = ['Am','Em','Bm','F#m','C#m','G#m','Ebm','Bbm','Fm','Cm','Gm','Dm'];
  const romanNumerals = ['IV','I','V','II','VI','III','VII','Tri','','bVI','bIII','bVII'];
  const diminished = ['Bo','F#o','C#o','G#o','D#o','A#o','E#o','Fo','Co','Go','Do','Ao','Eo'];
  
  // Position mappings from Angular component
  const chordsFPositions: Record<string, number> = {
    'C': 0, 'G': 1, 'D': 2, 'A': 3, 'E': 4, 'B': 5,
    'Gb': 6, 'F#': 6, 'Db': 7, 'Ab': 8, 'Eb': 9, 'Bb': 10, 'F': 11
  };
  
  const chordsMFPositions: Record<string, number> = {
    'Am': 0, 'Em': 1, 'Bm': 2, 'F#m': 3, 'C#m': 4, 'G#m': 5,
    'Ebm': 6, 'D#m': 6, 'Bbm': 7, 'Fm': 8, 'Cm': 9, 'Gm': 10, 'Dm': 11
  };

  // Coordinate system (from Angular analysis)
  const xRoman = [25, 170, 305, 400, 438, 400, 290, 165, 25, -75, -110, -70];
  const yRoman = [125.36, 85.36, 125.36, 215.36, 360.36, 495.36, 600.36, 635.36, 600.36, 495.36, 360.36, 215.36];

  // Generate tonality positions
  const generateTonalityPositions = useCallback((): TonalityPosition[] => {
    const positions: TonalityPosition[] = [];
    
    fifths.forEach((chord, index) => {
      positions.push({
        x: xRoman[index] + 250, // Offset for center positioning
        y: yRoman[index] + 150,
        chord,
        roman: romanNumerals[index],
        position: index
      });
    });
    
    return positions;
  }, []);

  const generateMinorTonalityPositions = useCallback((): TonalityPosition[] => {
    const positions: TonalityPosition[] = [];
    
    minorFifths.forEach((chord, index) => {
      // Inner circle positioning for minor chords
      const centerX = 250;
      const centerY = 300;
      const radius = 120;
      const angle = (index * 30 - 90) * Math.PI / 180;
      
      positions.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        chord,
        roman: romanNumerals[index].toLowerCase(),
        position: index
      });
    });
    
    return positions;
  }, []);

  // Chord type detection
  const detectChordType = (chord: string): 'major' | 'minor' | 'diminished' | 'dominant' => {
    if (chord.includes('m') && !chord.includes('M')) return 'minor';
    if (chord.includes('dim') || chord.includes('°')) return 'diminished';
    if (chord.includes('7') && !chord.includes('maj') && !chord.includes('M')) return 'dominant';
    return 'major';
  };

  // Tonality selection handler
  const handleTonalitySelect = (chord: string) => {
    if (isLocked) return;
    
    setSelectedTonality(chord);
    setSelectedGreen(chord);
    
    const chordType = detectChordType(chord);
    const tonalityMode = chordType === 'minor' ? 'minor' : 'major';
    setMode(tonalityMode);
    
    onTonalityChange?.(chord, tonalityMode);
    onChordSelect?.(chord);
  };

  // Show/hide wheel
  const showWheel = () => setIsVisible(true);
  const hideWheel = () => setIsVisible(false);

  // Effects
  useEffect(() => {
    if (isOpened) {
      showWheel();
    } else {
      hideWheel();
    }
  }, [isOpened]);

  useEffect(() => {
    setSelectedTonality(currentTonality);
    setSelectedGreen(currentTonality);
  }, [currentTonality]);

  useEffect(() => {
    setIsLocked(locked);
  }, [locked]);

  const majorPositions = generateTonalityPositions();
  const minorPositions = generateMinorTonalityPositions();

  if (!isVisible) return null;

  return (
    <Card className="absolute z-50 w-96 h-96 shadow-lg">
      <CardContent className="p-4">
        <div 
          ref={wheelRef}
          className="relative w-full h-full overflow-hidden rounded-lg bg-gradient-to-br from-blue-50 to-purple-50"
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 500 600"
            className="absolute inset-0"
          >
            {/* Background circles */}
            <circle
              cx="250"
              cy="300"
              r="200"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="2"
              opacity="0.5"
            />
            
            <circle
              cx="250"
              cy="300"
              r="140"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="1"
              opacity="0.3"
            />

            {/* Major tonalities (outer circle) */}
            {majorPositions.map((position, index) => {
              const isSelected = position.chord === selectedGreen;
              const isCurrent = position.chord === selectedTonality;
              
              return (
                <g key={`major-${index}`}>
                  <circle
                    cx={position.x}
                    cy={position.y}
                    r="20"
                    fill={
                      isSelected ? '#10b981' :
                      isCurrent ? '#3b82f6' :
                      '#6b7280'
                    }
                    fillOpacity={isSelected ? 1 : 0.7}
                    stroke="#1f2937"
                    strokeWidth="2"
                    className={`cursor-pointer transition-all hover:fill-opacity-100 ${
                      isLocked ? 'cursor-not-allowed opacity-50' : ''
                    }`}
                    onClick={() => !isLocked && handleTonalitySelect(position.chord)}
                  />
                  
                  <text
                    x={position.x}
                    y={position.y + 4}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="bold"
                    fill="white"
                    className="pointer-events-none select-none"
                  >
                    {position.chord}
                  </text>
                  
                  {/* Roman numeral label */}
                  <text
                    x={position.x}
                    y={position.y - 30}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#374151"
                    className="pointer-events-none select-none"
                  >
                    {position.roman}
                  </text>
                </g>
              );
            })}

            {/* Minor tonalities (inner circle) */}
            {minorPositions.map((position, index) => {
              const isSelected = position.chord === selectedGreen;
              const isCurrent = position.chord === selectedTonality;
              
              return (
                <g key={`minor-${index}`}>
                  <circle
                    cx={position.x}
                    cy={position.y}
                    r="15"
                    fill={
                      isSelected ? '#8b5cf6' :
                      isCurrent ? '#6366f1' :
                      '#9ca3af'
                    }
                    fillOpacity={isSelected ? 1 : 0.7}
                    stroke="#1f2937"
                    strokeWidth="1"
                    className={`cursor-pointer transition-all hover:fill-opacity-100 ${
                      isLocked ? 'cursor-not-allowed opacity-50' : ''
                    }`}
                    onClick={() => !isLocked && handleTonalitySelect(position.chord)}
                  />
                  
                  <text
                    x={position.x}
                    y={position.y + 3}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="bold"
                    fill="white"
                    className="pointer-events-none select-none"
                  >
                    {position.chord}
                  </text>
                </g>
              );
            })}

            {/* Center information */}
            <circle
              cx="250"
              cy="300"
              r="30"
              fill="#1f2937"
              fillOpacity="0.9"
            />
            
            <text
              x="250"
              y="295"
              textAnchor="middle"
              fontSize="12"
              fontWeight="bold"
              fill="white"
              className="select-none"
            >
              {selectedTonality}
            </text>
            
            <text
              x="250"
              y="310"
              textAnchor="middle"
              fontSize="10"
              fill="#d1d5db"
              className="select-none"
            >
              {mode}
            </text>
            
            {/* Lock indicator */}
            {isLocked && (
              <g>
                <rect
                  x="240"
                  y="320"
                  width="20"
                  height="15"
                  fill="#ef4444"
                  rx="2"
                />
                <text
                  x="250"
                  y="330"
                  textAnchor="middle"
                  fontSize="8"
                  fill="white"
                  className="select-none"
                >
                  🔒
                </text>
              </g>
            )}
          </svg>
          
          {/* Close button */}
          <button
            onClick={hideWheel}
            className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold hover:bg-red-600 transition-colors"
          >
            ×
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReactTonalityWheel;
