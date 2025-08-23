import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';

// SENTINEL_LOVABLE_BRAID_FREEZE

type ViewMode = 'presence' | 'only' | 'progression';

interface ChordData {
  chord: string;
  count: number;
  only_count?: number;
}

interface LiveMetricsProps {
  songData?: {
    chords: ChordData[];
    progressions?: Array<{ from: string; to: string; count: number }>;
  };
  onBubbleClick?: (chord: string) => void;
}

// Sample data for demonstration - will be replaced with real data
const SAMPLE_CHORD_DATA: ChordData[] = [
  { chord: 'I', count: 1250, only_count: 890 },
  { chord: 'V', count: 1180, only_count: 720 },
  { chord: 'vi', count: 980, only_count: 610 },
  { chord: 'IV', count: 1020, only_count: 680 },
  { chord: 'ii', count: 720, only_count: 420 },
  { chord: 'iii', count: 480, only_count: 290 },
  { chord: 'vii°', count: 310, only_count: 180 },
  { chord: 'bVII', count: 420, only_count: 290 },
  { chord: 'bIII', count: 280, only_count: 170 },
  { chord: 'V7', count: 890, only_count: 560 },
  { chord: 'ii7', count: 560, only_count: 340 },
  { chord: 'vi7', count: 390, only_count: 230 },
];

const SAMPLE_PROGRESSIONS = [
  { from: 'I', to: 'V', count: 450 },
  { from: 'V', to: 'vi', count: 380 },
  { from: 'vi', to: 'IV', count: 420 },
  { from: 'IV', to: 'I', count: 390 },
  { from: 'I', to: 'vi', count: 290 },
  { from: 'ii', to: 'V', count: 340 },
  { from: 'V', to: 'I', count: 520 },
];

const BraidLiveMetrics: React.FC<LiveMetricsProps> = ({
  songData,
  onBubbleClick
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('presence');

  const chordData = songData?.chords || SAMPLE_CHORD_DATA;
  const progressions = songData?.progressions || SAMPLE_PROGRESSIONS;

  // Calculate scaling factors for bubble sizes
  const maxCount = useMemo(() => {
    if (viewMode === 'only') {
      return Math.max(...chordData.map(c => c.only_count || 0));
    }
    return Math.max(...chordData.map(c => c.count));
  }, [chordData, viewMode]);

  // Calculate bubble radius based on count
  const getBubbleRadius = useCallback((chord: ChordData) => {
    const count = viewMode === 'only' ? (chord.only_count || 0) : chord.count;
    const ratio = count / maxCount;
    return 20 + (ratio * 40); // Min 20px, max 60px radius
  }, [maxCount, viewMode]);

  // Calculate arrow width for progressions
  const getArrowWidth = useCallback((progression: { count: number }) => {
    const maxProgCount = Math.max(...progressions.map(p => p.count));
    const ratio = progression.count / maxProgCount;
    return 2 + (ratio * 8); // Min 2px, max 10px width
  }, [progressions]);

  // Cycle through view modes
  const cycleViewMode = () => {
    setViewMode(current => {
      switch (current) {
        case 'presence': return 'only';
        case 'only': return 'progression';
        case 'progression': return 'presence';
        default: return 'presence';
      }
    });
  };

  // Handle bubble click
  const handleBubbleClick = (chord: string) => {
    onBubbleClick?.(chord);
  };

  return (
    <section className="space-y-4">
      {/* SENTINEL_LOVABLE_BRAID_FREEZE */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg  font-semibold text-primary">
          Live Harmonic Metrics
        </h2>
        <Button
          variant="outline"
          onClick={cycleViewMode}
          className=" text-sm"
        >
          {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} View
        </Button>
      </div>

      <div className="bg-card rounded-lg p-6 overflow-auto border">
        <div className="w-full flex justify-center">
          <svg
            width={1000}
            height={800}
            viewBox="0 0 1000 800"
            className="w-full h-auto"
            style={{ maxHeight: '70vh' }}
          >
            <defs>
              {/* Gradient definitions for bubbles */}
              <radialGradient id="bubbleGradient" cx="30%" cy="30%">
                <stop offset="0%" stopColor="hsl(var(--primary) / 0.8)" />
                <stop offset="70%" stopColor="hsl(var(--primary) / 0.4)" />
                <stop offset="100%" stopColor="hsl(var(--primary) / 0.1)" />
              </radialGradient>

              <radialGradient id="onlyGradient" cx="30%" cy="30%">
                <stop offset="0%" stopColor="hsl(var(--accent) / 0.8)" />
                <stop offset="70%" stopColor="hsl(var(--accent) / 0.4)" />
                <stop offset="100%" stopColor="hsl(var(--accent) / 0.1)" />
              </radialGradient>

              {/* Arrow marker for progressions */}
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="hsl(var(--muted-foreground))"
                />
              </marker>
            </defs>

            {/* Background grid for positioning */}
            <g opacity="0.1">
              {Array.from({ length: 5 }, (_, i) => (
                <line
                  key={`h-${i}`}
                  x1="0"
                  y1={i * 160 + 80}
                  x2="1000"
                  y2={i * 160 + 80}
                  stroke="hsl(var(--border))"
                  strokeWidth="1"
                />
              ))}
              {Array.from({ length: 6 }, (_, i) => (
                <line
                  key={`v-${i}`}
                  x1={i * 166 + 83}
                  y1="0"
                  x2={i * 166 + 83}
                  y2="800"
                  stroke="hsl(var(--border))"
                  strokeWidth="1"
                />
              ))}
            </g>

            {/* Render progression arrows (only in progression mode) */}
            {viewMode === 'progression' && progressions.map((prog, i) => {
              const fromChord = chordData.find(c => c.chord === prog.from);
              const toChord = chordData.find(c => c.chord === prog.to);
              if (!fromChord || !toChord) return null;

              const fromIndex = chordData.indexOf(fromChord);
              const toIndex = chordData.indexOf(toChord);

              const fromX = (fromIndex % 6) * 166 + 83;
              const fromY = Math.floor(fromIndex / 6) * 160 + 80;
              const toX = (toIndex % 6) * 166 + 83;
              const toY = Math.floor(toIndex / 6) * 160 + 80;

              return (
                <line
                  key={`prog-${i}`}
                  x1={fromX}
                  y1={fromY}
                  x2={toX}
                  y2={toY}
                  stroke="hsl(var(--muted-foreground) / 0.6)"
                  strokeWidth={getArrowWidth(prog)}
                  markerEnd="url(#arrowhead)"
                  className="transition-all duration-300"
                />
              );
            })}

            {/* Render chord bubbles */}
            {chordData.map((chord, i) => {
              const x = (i % 6) * 166 + 83; // 6 columns
              const y = Math.floor(i / 6) * 160 + 80; // Row spacing
              const radius = getBubbleRadius(chord);
              const count = viewMode === 'only' ? (chord.only_count || 0) : chord.count;

              return (
                <g
                  key={chord.chord}
                  transform={`translate(${x}, ${y})`}
                  className="cursor-pointer"
                  onClick={() => handleBubbleClick(chord.chord)}
                >
                  {/* Bubble circle */}
                  <circle
                    r={radius}
                    fill={viewMode === 'only' ? 'url(#onlyGradient)' : 'url(#bubbleGradient)'}
                    stroke="hsl(var(--primary) / 0.3)"
                    strokeWidth="2"
                    className="transition-all duration-300 hover:stroke-primary hover:stroke-[3px]"
                  />

                  {/* Chord label */}
                  <text
                    x="0"
                    y="5"
                    textAnchor="middle"
                    className=" font-semibold fill-foreground pointer-events-none"
                  >
                    {chord.chord}
                  </text>

                  {/* Count label */}
                  <text
                    x="0"
                    y={radius + 20}
                    textAnchor="middle"
                    className=" text-xs fill-muted-foreground pointer-events-none"
                  >
                    {count.toLocaleString()}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>
          <strong>Presence:</strong> Total chord occurrences |
          <strong> Only:</strong> Standalone chord counts |
          <strong> Progression:</strong> Chord transition flows
        </p>
        <p>Bubble size reflects relative frequency. Click bubbles to query Million Song Mind.</p>
      </div>
    </section>
  );
};

export default BraidLiveMetrics;