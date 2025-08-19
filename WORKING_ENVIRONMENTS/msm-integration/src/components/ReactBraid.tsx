import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';

// Font mapping from Angular migration analysis
import fontChordsEq from '@/assets/font_chords_eq.json';
import braidTonalities from '@/assets/braid_tonalities.json';

interface BraidProps {
  currentChord?: string[];
  chordsInScore?: string[];
  braidModel?: string;
  isRoman?: boolean;
  oneTonalityMode?: number;
  onAskChordsInScore?: (value: string) => void;
}

interface ChordPosition {
  x: number;
  y: number;
  chord: string;
  type: 'major' | 'minor' | 'diminished' | 'dominant' | 'half-diminished';
}

const ReactBraid: React.FC<BraidProps> = ({
  currentChord = [],
  chordsInScore = [],
  braidModel = 'default',
  isRoman = false,
  oneTonalityMode = 2,
  onAskChordsInScore
}) => {
  // State management (converted from Angular component properties)
  const [chord, setChord] = useState<string[]>([]);
  const [midiChord, setMidiChord] = useState<string[]>([]);
  const [tonic, setTonic] = useState<string[]>([]);
  const [curScoreChord, setCurScoreChord] = useState<string>('');
  const [displayAsRoman, setDisplayAsRoman] = useState<boolean>(false);
  const [tonalityFocused, setTonalityFocused] = useState<string>('');
  const [chordsInEmphasis, setChordsInEmphasis] = useState<string[]>(['Am']);
  const [braidType, setBraidType] = useState<string>('default');
  const [tonasDisplayed, setTonasDisplayed] = useState<number[]>([8]);

  const svgRef = useRef<SVGSVGElement>(null);

  // Chord categorization (from Angular analysis)
  const majChords = ['', 'M', 'maj7', '5', 'maj9', 'maj11', 'maj13', '6', 'Maj7', 'Maj9', 'M11', 'M13', 'maj9no5', 'M9sus4', 'Madd9', 'sus2', '69'];
  const minChords = ['m', 'm7', 'm#5', 'mMa7', 'm6', 'm9', 'm11', 'm7no5', 'm9no5', 'm11no5', 'madd9'];
  const halfDimChords = ['m7b5'];
  const sevenChords = ['7', '9', '11', '13', '7no5', '9no5', '13no5', '13sus4', '7add13'];
  const m69 = ['m69'];
  const german = ['german'];
  const sevenb5 = ['7b5'];
  const dimChords = ['dim'];
  const dimSevenChords = ['dim7'];

  // Font system integration
  const getChordSymbol = useCallback((chord: string): string => {
    // Extract root and quality from chord
    const chordParts = chord.match(/^([A-G][#b]?)(.*)$/);
    if (!chordParts) return chord;

    const [, root, quality] = chordParts;
    const fontMapping = fontChordsEq as Record<string, string>;

    // Get font character for chord quality
    const fontChar = fontMapping[quality] || quality;

    return isRoman ? convertToRoman(chord) : `${root}${fontChar}`;
  }, [isRoman]);

  const convertToRoman = (chord: string): string => {
    // Roman numeral conversion logic (simplified)
    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
    const chordRoot = chord.match(/^[A-G]/)?.[0] || 'C';
    const index = ['C', 'D', 'E', 'F', 'G', 'A', 'B'].indexOf(chordRoot);
    return romanNumerals[index] || chord;
  };

  const determineChordType = (chord: string): ChordPosition['type'] => {
    if (majChords.some(suffix => chord.includes(suffix))) return 'major';
    if (minChords.some(suffix => chord.includes(suffix))) return 'minor';
    if (dimChords.some(suffix => chord.includes(suffix))) return 'diminished';
    if (halfDimChords.some(suffix => chord.includes(suffix))) return 'half-diminished';
    if (sevenChords.some(suffix => chord.includes(suffix))) return 'dominant';
    return 'major';
  };

  // SVG rendering system
  const generateChordPositions = useCallback((): ChordPosition[] => {
    const positions: ChordPosition[] = [];
    const centerX = 300;
    const centerY = 300;
    const radius = 200;

    // Generate positions based on circle of fifths
    const fifths = ['C', 'G', 'D', 'A', 'E', 'B', 'Gb', 'Db', 'Ab', 'Eb', 'Bb', 'F'];

    fifths.forEach((chordRoot, index) => {
      const angle = (index * 30 - 90) * Math.PI / 180; // 30 degrees per step, start at top
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      positions.push({
        x,
        y,
        chord: chordRoot,
        type: determineChordType(chordRoot)
      });

      // Add minor chord inner circle
      const minorRadius = 140;
      const minorX = centerX + minorRadius * Math.cos(angle);
      const minorY = centerY + minorRadius * Math.sin(angle);
      const minorChord = chordRoot + 'm';

      positions.push({
        x: minorX,
        y: minorY,
        chord: minorChord,
        type: 'minor'
      });
    });

    return positions;
  }, []);

  // Chord highlighting logic
  const isChordInScore = (chord: string): boolean => {
    return chordsInScore.includes(chord);
  };

  const isChordCurrent = (chord: string): boolean => {
    return currentChord.includes(chord);
  };

  // Effects for prop changes
  useEffect(() => {
    setChord(currentChord);
    setMidiChord(currentChord);
  }, [currentChord]);

  useEffect(() => {
    setDisplayAsRoman(isRoman);
  }, [isRoman]);

  useEffect(() => {
    setBraidType(braidModel);
  }, [braidModel]);

  useEffect(() => {
    switch (oneTonalityMode) {
      case 1:
        setTonasDisplayed([7, 8]);
        break;
      case 2:
        setTonasDisplayed([8]);
        break;
      case 3:
        setTonasDisplayed([8, 9]);
        break;
      case 4:
        setTonasDisplayed([7, 8, 9]);
        break;
      default:
        setTonasDisplayed([8]);
        break;
    }
  }, [oneTonalityMode]);

  const chordPositions = generateChordPositions();

  return (
    <Card className="w-full h-full">
      <CardContent className="p-4">
        <div className="relative w-full h-96">
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox="0 0 600 600"
            className="absolute inset-0"
            style={{ fontFamily: 'nvxFont, serif' }}
          >
            {/* Background circle */}
            <circle
              cx="300"
              cy="300"
              r="250"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="2"
            />

            {/* Inner circle */}
            <circle
              cx="300"
              cy="300"
              r="170"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="1"
            />

            {/* Render chord positions */}
            {chordPositions.map((position, index) => {
              const isInScore = isChordInScore(position.chord);
              const isCurrent = isChordCurrent(position.chord);
              const symbol = getChordSymbol(position.chord);

              return (
                <g key={index}>
                  {/* Chord circle */}
                  <circle
                    cx={position.x}
                    cy={position.y}
                    r="25"
                    fill={
                      isCurrent ? '#ef4444' :
                        isInScore ? '#10b981' :
                          position.type === 'minor' ? '#6366f1' :
                            position.type === 'diminished' ? '#f59e0b' :
                              position.type === 'half-diminished' ? '#d97706' :
                                position.type === 'dominant' ? '#8b5cf6' :
                                  '#3b82f6'
                    }
                    fillOpacity={isCurrent ? 1 : isInScore ? 0.8 : 0.6}
                    stroke="#1f2937"
                    strokeWidth="2"
                    className="cursor-pointer hover:fillOpacity-100 transition-all"
                    onClick={() => onAskChordsInScore?.(position.chord)}
                  />

                  {/* Chord text */}
                  <text
                    x={position.x}
                    y={position.y + 5}
                    textAnchor="middle"
                    fontSize="14"
                    fontWeight="bold"
                    fill="white"
                    className="pointer-events-none select-none"
                  >
                    {symbol}
                  </text>
                </g>
              );
            })}

            {/* Center information */}
            <text
              x="300"
              y="300"
              textAnchor="middle"
              fontSize="16"
              fontWeight="bold"
              fill="#1f2937"
            >
              {tonalityFocused || 'Braid'}
            </text>
          </svg>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReactBraid;
