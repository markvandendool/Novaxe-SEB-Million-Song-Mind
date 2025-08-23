import React from 'react';
import { CHORD_GROUPS, NOTE_MAPPING, getNoteMappingForKey } from '@/constants/harmony';
import { useMusicalFont, getMusicalFontStyle } from '@/utils/fontSelector';

interface ChordData {
  chord: string;
  percent: number;
  root: number;
  first: number;
  second: number;
  third: number;
  section: string;
}

interface HarmonicChartProps {
  data: ChordData[];
  fileCount: number;
  totalSongs: number;
  onChordSelect?: (chord: string, isSelected: boolean) => void;
  selectedChords?: string[];
}

const CHORD_ORDER = CHORD_GROUPS;

// Format chord labels to use 'l' for flats (Fontdec13 ligature)
function formatChordLabel(label: string): string {
  // Handle special cases first
  if (label === 'V(7)') return 'V⁷';
  if (label === 'viiº') return 'vii°';
  if (label === '#iº') return '#i°';
  if (label === '#iiº') return '#ii°';
  if (label === '#vº') return '#v°';

  // Then handle other flat replacements
  return label.replace(/^b/, 'l').replace(/b([IVX]+)/g, 'l$1').replace(/\(b([0-9])\)/g, '(l$1)');
}

export function HarmonicChart({ data = [], fileCount, totalSongs, onChordSelect, selectedChords = [] }: HarmonicChartProps) {
  // DYNAMIC FONT SYSTEM - allows runtime font switching
  const { currentFont, getFontFamily } = useMusicalFont();

  // Show empty state if no data
  if (!data || data.length === 0) {
    try { fetch('/__log', { method: 'POST', body: JSON.stringify({ ts: Date.now(), stage: 'chart:empty' }), keepalive: true }).catch(() => { }); } catch { }
    return (
      <div className="flex items-center justify-center h-96 text-center">
        <div className="space-y-4">
          <div className="text-4xl text-muted-foreground">📊</div>
          <h3 className="text-lg font-semibold text-muted-foreground">No Harmonic Data</h3>
          <p className="text-sm text-muted-foreground">
            Upload a Datanaught format CSV to see vertical harmonic profiles
          </p>
        </div>
      </div>
    );
  }
  const CHART_HEIGHT = 400;
  let BAR_WIDTH = 32;
  let BAR_SPACING = 8;
  const SECTION_SPACING = 30;

  // Professional compression curve: normalized to 1.0 at 100%
  const compressPercent = (value: number) => {
    // First calculate raw compression
    const getRawCompression = (val: number) => {
      if (val <= 40) return val;
      const extra = val - 40;
      const compressionFactor = 1 - Math.pow(extra / 60, 1.5) * 0.4;
      return 40 + extra * compressionFactor;
    };

    // Normalize by the maximum compressed value (100%)
    const maxCompressed = getRawCompression(100);
    return getRawCompression(value) / maxCompressed;
  };

  // Clean Y-axis labels at key intervals
  const getYAxisLabels = () => [
    { value: 100, compressed: compressPercent(100) },
    { value: 70, compressed: compressPercent(70) },
    { value: 60, compressed: compressPercent(60) },
    { value: 50, compressed: compressPercent(50) },
    { value: 40, compressed: compressPercent(40) },
    { value: 30, compressed: compressPercent(30) },
    { value: 20, compressed: compressPercent(20) },
    { value: 10, compressed: compressPercent(10) },
    { value: 0, compressed: compressPercent(0) }
  ];

  // Faint grid lines at select intervals for alignment
  const getGridLines = () => [
    ...getYAxisLabels(),
    { value: 75, compressed: compressPercent(75) },
    { value: 65, compressed: compressPercent(65) },
    { value: 55, compressed: compressPercent(55) },
    { value: 45, compressed: compressPercent(45) },
    { value: 35, compressed: compressPercent(35) },
    { value: 25, compressed: compressPercent(25) },
    { value: 15, compressed: compressPercent(15) },
    { value: 5, compressed: compressPercent(5) }
  ];

  const sections = ['Major', 'Applied', 'Minor', 'Other'];
  try {
    const summary = Object.fromEntries(data.slice(0, 10).map(d => [d.chord, d.percent]));
    fetch('/__log', { method: 'POST', body: JSON.stringify({ ts: Date.now(), stage: 'chart:data', count: data.length, summary }), keepalive: true }).catch(() => { });
  } catch { }
  const SECTION_KEY_MAP: Record<string, keyof typeof CHORD_GROUPS> = { Applied: 'Applied' };
  let currentX = 60;
  const sectionData: {
    name: string;
    total: number;
    x: number;
    width: number;
    chords: Array<ChordData & { x: number }>;
  }[] = sections.map(sectionName => {
    const key = SECTION_KEY_MAP[sectionName] || (sectionName as keyof typeof CHORD_ORDER);
    const chords = (CHORD_ORDER[key] as readonly string[]) || [];
    const sectionTotal = (chords as readonly string[]).reduce<number>((sum, chord) => {
      const chordData = data.find(d => d.chord === chord);
      return sum + (chordData?.percent || 0);
    }, 0);

    const sectionWidth = Math.max(0, (chords as readonly string[]).length * (BAR_WIDTH + BAR_SPACING) - BAR_SPACING);
    const sectionInfo = {
      name: sectionName,
      total: sectionTotal,
      x: currentX,
      width: sectionWidth,
      chords: (chords as readonly string[]).map((chord, idx) => {
        const chordData = data.find(d => d.chord === chord) || {
          chord, percent: 0, root: 0, first: 0, second: 0, third: 0, section: sectionName
        };
        const x = currentX + idx * (BAR_WIDTH + BAR_SPACING);
        return { ...chordData, x } as ChordData & { x: number };
      })
    };

    currentX += sectionWidth + SECTION_SPACING;
    return sectionInfo;
  });

  // Compute dynamic chart width based on bars and enable horizontal scroll to avoid squish
  const chordGroups = Object.values(CHORD_ORDER) as unknown as readonly string[][];
  const totalBars = chordGroups.reduce((sum: number, arr: readonly string[]) => sum + arr.length, 0);
  const idealWidth = 60 + (totalBars * (BAR_WIDTH + BAR_SPACING)) + (SECTION_SPACING * 3);
  if (idealWidth > 1600) {
    BAR_WIDTH = 28;
    BAR_SPACING = 6;
  }
  const chartWidth = 60 + (totalBars * (BAR_WIDTH + BAR_SPACING)) + (SECTION_SPACING * 3);

  // Try to infer key from selected song(s) via a global object exposed by the page, else fall back
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inferredKey: string | undefined = (typeof window !== 'undefined' && (window as any).__msmSelectedKey) || undefined;
  const keyUsed = inferredKey || 'C';

  // Build Roman → Alphabet chord names map (exact, no fuzzy)
  const buildRomanToAlphabetMap = (key: string): Record<string, string> => {
    // Major scale mapping by index
    const majorNotes = getNoteMappingForKey(key);
    const map: Record<string, string> = {
      I: majorNotes[0],
      ii: `${majorNotes[1]}m`,
      iii: `${majorNotes[2]}m`,
      IV: majorNotes[3],
      V: majorNotes[4],
      vi: `${majorNotes[5]}m`,
      'viiø': `${majorNotes[6]}dim`,
    } as Record<string, string>;

    // For C only, add explicit Applied and Minor mappings
    if (key === 'C') {
      Object.assign(map, {
        // Applied
        I7: 'C7',
        'iiiº': 'Eº',
        'II(7)': 'D7',
        '#ivø': 'F#ø',
        III: 'E',
        '#vº': 'G#º',
        'VI(7)': 'A7',
        '#iø': 'C#ø',
        'VII(7)': 'B7',
        '#iiø': 'D#ø',
        // Minor
        i: 'Cm',
        'iiø': 'Dø',
        bIII: 'Eb',
        iv: 'Fm',
        v: 'Gm',
        bVI: 'Ab',
        bVII: 'Bb',
        'V(b9)': 'G7(b9)',
        'viiº': 'Bº',
        Other: 'Other',
      });
    }

    return map;
  };

  const romanToAlpha = buildRomanToAlphabetMap(keyUsed);

  return (
    <div className="flex justify-center w-full">
      <div className="relative animate-fade-in" style={{ width: Math.max(chartWidth + 200, 1200), height: CHART_HEIGHT + 200 }}>

        {/* Y-Axis Labels with Compression - 100% anchored 10px from top */}
        <div className="absolute left-0 top-0 h-full">
          {getYAxisLabels().map((label) => (
            <div
              key={label.value}
              className="absolute flex items-center text-foreground text-sm font-mono font-bold"
              style={{ bottom: 140 + label.compressed * (CHART_HEIGHT - 10) }}
            >
              <span className="mr-2">{label.value}</span>
              <span className="text-primary">{label.value === 100 ? '▼' : '▶'}</span>
            </div>
          ))}
        </div>

        {/* Professional Grid Lines with Compression */}
        <div
          className="absolute"
          style={{
            left: 60,
            bottom: 140,
            width: currentX - 60, // Dynamically match all chord bars
            height: CHART_HEIGHT
          }}
        >
          {/* Major grid lines at 10% intervals */}
          {getYAxisLabels().filter(l => l.value > 0).map(label => (
            <div
              key={`major-${label.value}`}
              className="absolute w-full border-t border-foreground opacity-30"
              style={{ bottom: label.compressed * (CHART_HEIGHT - 10) }}
            />
          ))}

          {/* Faint grid lines at 5% intervals for alignment */}
          {getGridLines().filter(l => l.value > 0 && l.value % 10 !== 0).map(label => (
            <div
              key={`minor-${label.value}`}
              className="absolute w-full border-t border-muted-foreground opacity-10"
              style={{ bottom: label.compressed * (CHART_HEIGHT - 10) }}
            />
          ))}

          {/* X-AXIS BASELINE - PERFECT ANCHORING */}
          <div className="absolute w-full border-t-2 border-primary bottom-0 shadow-chart" />
        </div>


        {/* Section Aggregate Bars - Enhanced Visibility */}
        {sectionData.map(section => (
          <div key={`${section.name}-aggregate-container`}>
            <div
              className="absolute bg-gray-700 opacity-30 rounded-t transition-all duration-500"
              style={{
                left: section.x,
                width: section.width,
                height: compressPercent(section.total) * (CHART_HEIGHT - 10),
                bottom: 140
              }}
            />

            {/* Section Total Percentage */}
            {section.total > 0 && ['Major', 'Applied', 'Minor'].includes(section.name) && (
              <div
                className="absolute text-foreground text-lg font-mono font-bold text-center opacity-50 pointer-events-none"
                style={{
                  left: section.x,
                  width: section.width,
                  bottom: compressPercent(section.total) * (CHART_HEIGHT - 10) + 150
                }}
              >
                {section.total.toFixed(1)}%
              </div>
            )}
          </div>
        ))}

        {/* Individual Chord Bars - PERFECTLY ANCHORED */}
        {sectionData.map(section =>
          section.chords.map(chord => {
            const compressedPercent = compressPercent(chord.percent);
            const barHeight = compressedPercent * (CHART_HEIGHT - 10);
            const inversionValues: number[] = [chord.root, chord.first, chord.second, chord.third];
            const totalInversions = inversionValues.reduce((a, b) => a + b, 0);
            const isSelected = selectedChords.includes(chord.chord);

            const handleChordClick = (e: React.MouseEvent) => {
              e.preventDefault();
              // Toggle selection on regular click; Cmd/Ctrl also toggles
              onChordSelect?.(chord.chord, !isSelected);
            };

            // Unique key prevents unnecessary re-renders
            const uniqueKey = `${section.name}-${chord.chord}`;

            return (
              <div
                key={uniqueKey}
                className={`absolute transition-all duration-300 cursor-pointer ${isSelected ? 'z-10 ring-2 ring-primary/60 rounded-sm' : 'z-0'
                  }`}
                style={{
                  left: chord.x,
                  width: BAR_WIDTH,
                  height: CHART_HEIGHT + 60,
                  bottom: 100
                }}
                onClick={handleChordClick}
                title={`${chord.chord} (${romanToAlpha[chord.chord] || ''}) - Click to select, ⌘/Ctrl+click for multi-select`}
              >
                {/* Percentage Label - Static positioning to prevent flicker */}
                {chord.percent > 0 && (
                  <div
                    className="absolute text-foreground text-sm font-mono text-center font-bold pointer-events-none"
                    style={{
                      left: 0,
                      width: BAR_WIDTH,
                      bottom: barHeight + 48
                    }}
                  >
                    {chord.percent.toFixed(1)}%
                  </div>
                )}

                {/* Main Bar - ANCHORED TO BOTTOM X-AXIS */}
                {chord.percent > 0 && (
                  <div
                    className={`absolute flex rounded-t harmonic-bar ${isSelected ? 'selected' : ''
                      } ${chord.percent > 20 ? 'flame-effect' : ''}`}
                    style={{
                      left: 0,
                      width: BAR_WIDTH,
                      height: barHeight,
                      bottom: 40,
                      background: isSelected
                        ? 'linear-gradient(180deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))'
                        : 'linear-gradient(180deg, hsl(var(--foreground)), hsl(var(--foreground) / 0.8))',
                      boxShadow: isSelected
                        ? 'var(--glow-intense)'
                        : chord.percent > 15
                          ? 'var(--glow-primary)'
                          : 'var(--shadow-chart)'
                    }}
                  >
                    {/* Inversion Sub-bars with Harmonic Colors */}
                    {inversionValues.map((value, idx) => {
                      const invHeight = totalInversions > 0 ? (value / totalInversions) * barHeight : 0;
                      const colors = ['hsl(var(--harmonic-root))', 'hsl(var(--harmonic-first))', 'hsl(var(--harmonic-second))', 'hsl(var(--harmonic-third))'];

                      return (
                        <div key={`inv-${idx}`} className="relative" style={{ width: 8 }}>
                          <div
                            className="absolute bottom-0 transition-all duration-300"
                            style={{
                              width: 8,
                              height: invHeight,
                              backgroundColor: colors[idx],
                              borderRadius: idx === 0 ? '2px 0 0 0' : idx === 3 ? '0 2px 0 0' : '0',
                              animationDelay: `${idx * 0.1}s`
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Chord Labels - Both Roman numerals AND chord names in Fontdec13 */}
                <div
                  className="absolute text-center pointer-events-none"
                  style={{
                    left: 0,
                    width: BAR_WIDTH,
                    bottom: -15
                  }}
                >
                  <div
                    className={`font-bold leading-tight mb-1  ${isSelected ? 'text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.75)]' : 'text-foreground'}`}
                    style={{
                      fontSize: "16px",
                      ...getMusicalFontStyle(), // DYNAMIC FONT: Changes based on user selection
                    }}
                  >
                    {formatChordLabel(chord.chord)}
                  </div>
                  <div
                    className={`leading-none  ${isSelected ? 'text-primary/80' : 'text-muted-foreground'}`}
                    style={{
                      fontSize: "16px",
                      ...getMusicalFontStyle(), // DYNAMIC FONT: Changes based on user selection
                    }}
                  >
                    <span className="text-[10px] font-mono leading-tight">
                      {chord.chord !== '' ? (romanToAlpha[chord.chord] || '') : ''}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Section Labels */}
        {sectionData.map(section => (
          <div
            key={`${section.name}-label`}
            className="absolute text-center text-foreground/80 font-semibold tracking-wide"
            style={{
              left: section.x,
              width: section.width,
              bottom: 30,
              fontSize: '24px'
            }}
          >
            {section.name.toUpperCase()}
          </div>
        ))}

        {/* Section Separators */}
        {sectionData.slice(0, -1).map((section, idx) => (
          <div
            key={`separator-${idx}`}
            className="absolute bg-border"
            style={{
              left: section.x + section.width + SECTION_SPACING / 2,
              width: 1,
              height: CHART_HEIGHT,
              bottom: 140
            }}
          />
        ))}

        {/* Professional Legend */}
        <div
          className="absolute flex items-center justify-center space-x-8 text-foreground font-mono text-sm"
          style={{ bottom: 0, left: 0, right: 0 }}
        >
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-foreground border border-border rounded"></div>
            <span className="tracking-wider">INSTANCES</span>
          </div>
          <div className="flex items-center space-x-6">
            <span className="tracking-wider">INVERSIONS:</span>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-harmonic-root rounded"></div>
              <span className="text-xs">Root</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-harmonic-first rounded"></div>
              <span className="text-xs">1st</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-harmonic-second rounded"></div>
              <span className="text-xs">2nd</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-harmonic-third rounded"></div>
              <span className="text-xs">3rd</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
