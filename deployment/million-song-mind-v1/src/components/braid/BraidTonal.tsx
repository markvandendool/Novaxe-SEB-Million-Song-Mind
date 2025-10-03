import React, { useEffect, useMemo, useState, useRef } from "react";
import "@/styles/braid-angular-exact.css"; // EXACT Angular font definitions
import "./BraidTonal.css";
import { MusicalChordText } from '@/components/MusicalChordText';
import { ChordAudioPlayer } from '@/components/ChordAudioPlayer';
import { getBraidPositionUsage } from '@/utils/braidHarmonicMapping';
import { getBraidToHarmonicMapping } from '@/utils/definiteBraidMapping';
import { getChordSuffix } from '@/utils/chordTypes';
import { exhaustiveLogger } from '@/utils/exhaustiveLogger';

interface TonalSet {
  center_major: string[];
  center_minor: string[];
  left_up: string[];
  left_down: string[];
  right_up: string[];
  right_down: string[];
  outer_left_up: string[];
  outer_left_down: string[];
  outer_right_up: string[];
  outer_right_down: string[];
}

interface BraidTonalities {
  roman: Record<string, string[]>;
  empty: Record<string, string[]>;
  [key: string]: any;
}

function rotate<T>(arr: T[], n: number): T[] {
  const a = arr.slice();
  if (a.length === 0) return a;
  const k = ((n % a.length) + a.length) % a.length;
  return a.slice(k).concat(a.slice(0, k));
}

type BraidTonalProps = {
  focusKey?: string;
  zoom?: number;
  onZoomChange?: (z: number) => void;
  onChordClick?: (chord: string) => void;
  onChordSelect?: (chord: string, isSelected: boolean) => void;
  selectedChords?: Set<string>;
  scrollContainerRef?: React.RefObject<HTMLDivElement>;
  chordUsage?: Record<string, number>;
  displayRoman?: boolean; // Add external control for text switching
};
const BraidTonal: React.FC<BraidTonalProps> = ({
  focusKey,
  zoom: zoomProp,
  onZoomChange,
  onChordClick,
  onChordSelect,
  selectedChords,
  scrollContainerRef,
  chordUsage,
  displayRoman: externalDisplayRoman
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tonalities, setTonalities] = useState<BraidTonalities | null>(null);
  const [tonality, setTonality] = useState("C");
  const [displayRoman, setDisplayRoman] = useState(externalDisplayRoman ?? false);
  const [zoom, setZoom] = useState<number>(zoomProp ?? 1);

  useEffect(() => {
    fetch("./assets/braid_tonalities.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log('📦 JSON LOADED:', data);
        setTonalities(data);
      })
      .catch((error) => {
        console.error('❌ JSON FAILED TO LOAD:', error);
        // Fallback minimal dataset: center columns only, using regular text
        setTonalities({
          roman: {
            center_major: Array(12).fill('I'),
            center_minor: Array(12).fill('i'),
            left_up: ['IV', 'I', 'V', 'ii', 'vi', 'iii', 'vii°', '#iv°', '#I', '#V', '#ii', '#vi'],
            left_down: ['ii', 'vi', 'iii', 'vii°', '#iv°', '#I', '#V', '#ii', '#vi', 'iv', 'i', 'v'],
            right_up: ['V', 'ii', 'vi', 'iii', 'vii°', '#iv°', '#I', '#V', '#ii', '#vi', 'IV', 'I'],
            right_down: ['iii', 'vii°', '#iv°', '#I', '#V', '#ii', '#vi', 'iv', 'i', 'v', 'ii', 'vi'],
            outer_left_up: ['♭VII', 'IV', 'I', 'V', 'ii', 'vi', 'iii', 'vii°', '#iv°', '#I', '#V', '#ii'],
            outer_left_down: ['v', 'ii', 'vi', 'iii', 'vii°', '#iv°', '#I', '#V', '#ii', '#vi', 'iv', 'i'],
            outer_right_up: ['ii', 'vi', 'iii', 'vii°', '#iv°', '#I', '#V', '#ii', '#vi', 'IV', 'I', 'V'],
            outer_right_down: ['vii°', '#iv°', '#I', '#V', '#ii', '#vi', 'iv', 'i', 'v', 'ii', 'vi', 'iii'],
          },
          C: {
            center_major: ["C", "G", "D", "A", "E", "B", "F#", "C#", "G#", "D#", "A#", "F"],
            center_minor: ["Am", "Em", "Bm", "F#m", "C#m", "G#m", "D#m", "A#m", "Fm", "Cm", "Gm", "Dm"],
            left_up: ["F", "C", "G", "D", "A", "E", "B", "F#", "C#", "G#", "D#", "A#"],
            left_down: ["Dm", "Am", "Em", "Bm", "F#m", "C#m", "G#m", "D#m", "A#m", "Fm", "Cm", "Gm"],
            right_up: ["G", "D", "A", "E", "B", "F#", "C#", "G#", "D#", "A#", "F", "C"],
            right_down: ["Em", "Bm", "F#m", "C#m", "G#m", "D#m", "A#m", "Fm", "Cm", "Gm", "Dm", "Am"],
            outer_left_up: ["Bb", "F", "C", "G", "D", "A", "E", "B", "F#", "C#", "G#", "D#"],
            outer_left_down: ["Gm", "Dm", "Am", "Em", "Bm", "F#m", "C#m", "G#m", "D#m", "A#m", "Fm", "Cm"],
            outer_right_up: ["D", "A", "E", "B", "F#", "C#", "G#", "D#", "A#", "F", "C", "G"],
            outer_right_down: ["Bm", "F#m", "C#m", "G#m", "D#m", "A#m", "Fm", "Cm", "Gm", "Dm", "Am", "Em"],
          },
        } as unknown as BraidTonalities);
      });
  }, []);

  useEffect(() => { if (zoomProp !== undefined) setZoom(zoomProp); }, [zoomProp]);

  // Sync external displayRoman prop
  useEffect(() => {
    if (externalDisplayRoman !== undefined) {
      setDisplayRoman(externalDisplayRoman);
    }
  }, [externalDisplayRoman]);

  // Normalize external key inputs like "C major", "A Minor", "C/Am" -> "C" or "Am"
  const normalizeKey = (k?: string | null): string | null => {
    if (!k) return null;
    let s = String(k).trim();
    s = s.replace(/major/i, '').replace(/minor/i, 'm');
    s = s.replace(/\s+/g, '');
    if (s.includes('/')) s = s.split('/')[0];
    return s;
  };

  // Auto-fit initial zoom to fill width if no zoomProp
  useEffect(() => {
    if (zoomProp === undefined && containerRef.current) {
      const containerWidth = containerRef.current.clientWidth || window.innerWidth;
      const baseWidth = 320; // matches SVG viewBox width
      const targetRaw = ((containerWidth - 24) / baseWidth) * 1.6; // start much higher per spec
      const target = Math.min(3, Math.max(0.9, Number(targetRaw.toFixed(2))));
      setZoom(target);
      onZoomChange?.(target);
    }
  }, [zoomProp, onZoomChange]);

  // Sync external focusKey into internal tonality
  useEffect(() => {
    const nk = normalizeKey(focusKey);
    if (nk) setTonality(nk);
  }, [focusKey]);

  // Wheel zoom (Ctrl/Cmd + wheel)
  const handleWheel: React.WheelEventHandler<HTMLDivElement> = (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const next = Math.min(3, Math.max(0.5, Number((zoom + delta).toFixed(2))));
      setZoom(next);
      onZoomChange?.(next);
    }
  };

  const {
    center_left,
    center_right,
    left_up,
    left_down,
    right_up,
    right_down,
    fifth_left_up,
    fifth_left_down,
    fifth_right_up,
    fifth_right_down,
    center_left_in_use,
    center_right_in_use,
    left_up_in_use,
    left_down_in_use,
    right_up_in_use,
    right_down_in_use,
    fifth_left_up_in_use,
    fifth_left_down_in_use,
    fifth_right_up_in_use,
    fifth_right_down_in_use,
  } = useMemo(() => {
    if (!tonalities) {
      const emptySet = {
        center_left: [], center_right: [], left_up: [], left_down: [], right_up: [], right_down: [],
        fifth_left_up: [], fifth_left_down: [], fifth_right_up: [], fifth_right_down: [],
        center_left_in_use: [], center_right_in_use: [], left_up_in_use: [], left_down_in_use: [],
        right_up_in_use: [], right_down_in_use: [], fifth_left_up_in_use: [], fifth_left_down_in_use: [],
        fifth_right_up_in_use: [], fifth_right_down_in_use: [],
      };
      return emptySet;
    }

    const currentTonalitySet = tonalities[tonality] as TonalSet;
    
    // DEBUG: Log the current tonality and what data we have
    console.log('🔍 BraidTonal DEBUG - Current tonality:', tonality);
    console.log('🔍 BraidTonal DEBUG - Available keys in tonalities:', Object.keys(tonalities || {}));
    console.log('🔍 BraidTonal DEBUG - currentTonalitySet:', currentTonalitySet);
    if (currentTonalitySet) {
      console.log('🔍 BraidTonal DEBUG - Side bubble arrays:');
      console.log('  left_up length:', currentTonalitySet.left_up?.length, 'values:', currentTonalitySet.left_up?.slice(0, 5));
      console.log('  left_down length:', currentTonalitySet.left_down?.length, 'values:', currentTonalitySet.left_down?.slice(0, 5));
      console.log('  right_up length:', currentTonalitySet.right_up?.length, 'values:', currentTonalitySet.right_up?.slice(0, 5));
      console.log('  right_down length:', currentTonalitySet.right_down?.length, 'values:', currentTonalitySet.right_down?.slice(0, 5));
      console.log('🔍 BraidTonal DEBUG - Outer bubble arrays:');
      console.log('  outer_left_up length:', currentTonalitySet.outer_left_up?.length, 'values:', currentTonalitySet.outer_left_up?.slice(0, 5));
      console.log('  outer_left_down length:', currentTonalitySet.outer_left_down?.length, 'values:', currentTonalitySet.outer_left_down?.slice(0, 5));
      console.log('  outer_right_up length:', currentTonalitySet.outer_right_up?.length, 'values:', currentTonalitySet.outer_right_up?.slice(0, 5));
      console.log('  outer_right_down length:', currentTonalitySet.outer_right_down?.length, 'values:', currentTonalitySet.outer_right_down?.slice(0, 5));
      
      console.log('🔍 BraidTonal DEBUG - currentTonalitySet properties check:');
      console.log('  Has left_up?', !!currentTonalitySet.left_up);
      console.log('  Has left_down?', !!currentTonalitySet.left_down);
      console.log('  Has right_up?', !!currentTonalitySet.right_up);  
      console.log('  Has right_down?', !!currentTonalitySet.right_down);
      console.log('  Has outer_left_up?', !!currentTonalitySet.outer_left_up);
      console.log('  Has outer_left_down?', !!currentTonalitySet.outer_left_down);
      console.log('  Has outer_right_up?', !!currentTonalitySet.outer_right_up);
      console.log('  Has outer_right_down?', !!currentTonalitySet.outer_right_down);
    }

    const getInUse = (noteArr: string[], romanArr: string[], rotation = 0) => {
      // ALWAYS use note names for consistency with selectedChords
      // This ensures isSelected() checks against the same identifiers used by handleChordSelect
      console.log('🔍 getInUse called with noteArr:', noteArr?.slice(0, 5));
      return noteArr;
    };

    // The original Angular code has a rotation of -3 for roman numerals in minor context
    const romanMinorRotation = -3;

    const result = {
      center_left: currentTonalitySet.center_major,
      center_right: currentTonalitySet.center_minor,
      left_up: currentTonalitySet.left_up,
      left_down: currentTonalitySet.left_down,
      right_up: currentTonalitySet.right_up,
      right_down: currentTonalitySet.right_down,
      fifth_left_up: currentTonalitySet.outer_left_up,
      fifth_left_down: currentTonalitySet.outer_left_down,
      fifth_right_up: currentTonalitySet.outer_right_up,
      fifth_right_down: currentTonalitySet.outer_right_down,

      center_left_in_use: getInUse(currentTonalitySet.center_major, tonalities.roman.center_major, displayRoman ? romanMinorRotation : 0),
      center_right_in_use: getInUse(currentTonalitySet.center_minor, tonalities.roman.center_minor, displayRoman ? romanMinorRotation : 0),
      left_up_in_use: getInUse(currentTonalitySet.left_up, tonalities.roman.left_up, displayRoman ? romanMinorRotation : 0),
      left_down_in_use: getInUse(currentTonalitySet.left_down, tonalities.roman.left_down, displayRoman ? romanMinorRotation : 0),
      right_up_in_use: getInUse(currentTonalitySet.right_up, tonalities.roman.right_up, displayRoman ? romanMinorRotation : 0),
      right_down_in_use: getInUse(currentTonalitySet.right_down, tonalities.roman.right_down, displayRoman ? romanMinorRotation : 0),
      fifth_left_up_in_use: getInUse(currentTonalitySet.outer_left_up, tonalities.roman.outer_left_up, displayRoman ? romanMinorRotation : 0),
      fifth_left_down_in_use: getInUse(currentTonalitySet.outer_left_down, tonalities.roman.outer_left_down, displayRoman ? romanMinorRotation : 0),
      fifth_right_up_in_use: getInUse(currentTonalitySet.outer_right_up, tonalities.roman.outer_right_up, displayRoman ? romanMinorRotation : 0),
      fifth_right_down_in_use: getInUse(currentTonalitySet.outer_right_down, tonalities.roman.outer_right_down, displayRoman ? romanMinorRotation : 0),
    };

    // DEBUG: Log the final processed arrays
    console.log('🎯 BraidTonal FINAL ARRAYS DEBUG:');
    console.log('  left_up_in_use:', result.left_up_in_use?.slice(0, 5));
    console.log('  left_down_in_use:', result.left_down_in_use?.slice(0, 5));  
    console.log('  right_up_in_use:', result.right_up_in_use?.slice(0, 5));
    console.log('  right_down_in_use:', result.right_down_in_use?.slice(0, 5));
    console.log('  fifth_left_up_in_use:', result.fifth_left_up_in_use?.slice(0, 5));
    console.log('  fifth_left_down_in_use:', result.fifth_left_down_in_use?.slice(0, 5));
    console.log('  fifth_right_up_in_use:', result.fifth_right_up_in_use?.slice(0, 5));
    console.log('  fifth_right_down_in_use:', result.fifth_right_down_in_use?.slice(0, 5));

    return result;

  }, [tonalities, tonality, displayRoman]);

  // Center the selected key row in view when focusKey/tonality changes
  useEffect(() => {
    const container = (scrollContainerRef?.current) || containerRef.current;
    if (!container) return;
    const nk = normalizeKey(focusKey) || tonality;
    const isMinorKey = nk.endsWith('m');
    const selector = isMinorKey ? `[data-key-minor="${nk}"]` : `[data-key-major="${nk}"]`;
    const target = container.querySelector(selector) as SVGGElement | null;
    if (!target) return;
    const containerRect = container.getBoundingClientRect();
    const elemRect = target.getBoundingClientRect();
    const desiredTop = container.scrollTop + (elemRect.top - containerRect.top) - (containerRect.height / 2) + (elemRect.height / 2);
    container.scrollTo({ top: desiredTop, behavior: 'smooth' });
  }, [focusKey, tonality, displayRoman, tonalities, scrollContainerRef]);

  const focusedKey = normalizeKey(focusKey) || tonality;

  // STRICT selection logic - only check if chord is directly in selectedChords
  const isSelected = (label?: string) => {
    exhaustiveLogger.selection('BraidTonal', 'isSelected CALLED', { label, selectedChords });
    if (!label) return false;
    // STRICT: Only light up if this exact chord is in selectedChords
    // selectedChords is a Set, so use .has() not .includes()
    const selected = selectedChords?.has(label) || false;
    if (selected) {
      exhaustiveLogger.selection('BraidTonal', 'CHORD SELECTED TRUE', { label, selectedChords });
      console.log(`🚨 BraidTonal.isSelected("${label}") = TRUE | selectedChords:`, selectedChords);
    }
    return selected;
  };
  const toggleChord = (label: string) => {
    exhaustiveLogger.func('BraidTonal', 'toggleChord CALLED', { label });
    if (!label) return;
    if (onChordSelect) onChordSelect(label, !isSelected(label));
    else onChordClick?.(label);
  };

  // Selection with Cmd/Ctrl semantics: click = replace, Cmd/Ctrl-click = add/remove
  const handleSelect = (e: React.MouseEvent, label: string) => {
    exhaustiveLogger.click('BraidTonal', 'handleSelect CLICKED', {
      label,
      isSelected: isSelected(label),
      additive: e.metaKey || e.ctrlKey
    }, e.nativeEvent);
    if (!label) return;
    const additive = e.metaKey || e.ctrlKey;
    if (additive) {
      onChordSelect ? onChordSelect(label, !isSelected(label)) : onChordClick?.(label);
    } else {
      // Replace selection with this single chord
      // selectedChords is a Set, so convert to Array to use filter
      const others = Array.from(selectedChords || new Set()).filter((c: string) => c !== label);
      others.forEach((c: string) => onChordSelect?.(c, false));
      onChordSelect?.(label, true);
    }
  };
  const getBubbleClass = (name: string, type: string, arg1: string = 'medBubble', arg2: string = '') => {
    let c = `${arg1} ${arg2} `;
    // This is a simplified version of the original logic.
    // In a real app, you'd have state for chords, midi, etc.
    const isInScore = true;
    const emphasisChords = true;

    if (isInScore && emphasisChords) {
      c += "erasenot";
    } else if (!isInScore && emphasisChords) {
      c += "erase";
    }
    return c;
  };

  const getArrowClass = (...args: any[]) => {
    return "arrows-2";
  };

  // Usage-based styling helpers using DEFINITIVE mappings
  const getUsage = (label?: string) => {
    if (!label) return 0;

    // Map braid chord to harmonic slot using definitive mapping
    const harmonicSlot = getBraidToHarmonicMapping(label);
    console.log(`🎯 USAGE LOOKUP: "${label}" → "${harmonicSlot}"`);

    // Get usage from harmonic slot
    let usage = 0;
    if (harmonicSlot !== "Other") {
      usage = (chordUsage as any)?.[harmonicSlot];
    } else {
      usage = (chordUsage as any)?.[label] || (chordUsage as any)?.["Other"];
    }

    if (typeof usage !== 'number' || isNaN(usage)) return 0;
    const finalUsage = Math.max(0, Math.min(100, Math.round(usage)));
    console.log(`📊 FINAL USAGE: "${label}" → ${finalUsage}%`);
    return finalUsage;
  };
  const usageClass = (p: number) => {
    if (p >= 100) return 'usage-max';
    if (p >= 85) return 'usage-hype';
    if (p >= 60) return 'usage-high';
    if (p >= 30) return 'usage-med';
    if (p > 0) return 'usage-low';
    return 'usage-zero';
  };

  // Extract root note from chord (C, Db, F#, etc.)
  const getRootNote = (chord: string): string => {
    if (!chord) return 'X';
    const rootMatch = chord.match(/^[A-G][#b]?/);
    return rootMatch ? rootMatch[0] : 'X';
  };

  // Clean text renderer with proper musical font
  const BraidText: React.FC<{
    x?: number | string;
    y?: number | string;
    className?: string;
    children: string;
    position?: 'center-up' | 'center-down' | 'left-up' | 'left-down' | 'right-up' | 'right-down' | 'outer-up' | 'outer-down';
    onClick?: (e: React.MouseEvent<SVGTextElement>) => void;
  }> = ({ x = 0, y = 0, className, children, position = 'center-up', onClick }) => {
    const root = getRootNote(children);

    // Get font size based on position - center bubbles are larger
    const getFontSize = (pos: string) => {
      if (pos.includes('center')) return '24px'; // Large for center bubbles
      if (pos.includes('outer')) return '12px'; // Medium for outer bubbles
      return '16px'; // Standard for left/right bubbles
    };

    // Get text anchor and dominant baseline for proper centering
    const getTextAlignment = () => ({
      textAnchor: 'middle' as const,
      dominantBaseline: 'central' as const
    });

    const renderChordText = () => {
      switch (position) {
        case 'center-up':
          return root; // Just root note
        case 'center-down':
          return `${root}m`; // Root + m for minor
        case 'left-up':
          return `${root}b7`; // Root + b7
        case 'left-down':
          return (
            <>
              {root}<tspan style={{ fontSize: '12px', baselineShift: 'super' }}>ø</tspan>
            </>
          );
        case 'right-up':
          return `${root}b7`; // Root + b7
        case 'right-down':
          return (
            <>
              {root}<tspan style={{ fontSize: '10px', baselineShift: 'super' }}>º</tspan>
            </>
          );
        case 'outer-up':
          return (
            <>
              {root}<tspan style={{ fontSize: '5px' }}>Fr</tspan>
            </>
          );
        case 'outer-down':
          return (
            <>
              {root}<tspan style={{ fontSize: '5px' }}>Gr</tspan>
            </>
          );
        default:
          return root;
      }
    };

    return (
      <text
        x={x}
        y={y}
        className={className}
        onClick={onClick}
        style={{
          fontFamily: '"Times New Roman", "Liberation Serif", serif',
          fontSize: getFontSize(position),
          fontWeight: '500',
          textAnchor: 'middle',
          dominantBaseline: 'central'
        }}
      >
        {renderChordText()}
      </text>
    );
  };
  // Compute stitch geometry ensuring F#/Gb bottom and Db/C# top alignment
  const rowCount = center_left.length || 15;
  const n = rowCount;
  const find = (s: string) => center_left.findIndex(v => v === s);
  const fsIndex = find('F#');
  const gbIndex = find('Gb');
  const dbIndex = find('Db');
  const csIndex = find('C#');

  const validBottom = fsIndex >= 0 && gbIndex >= 0;
  const validTop = dbIndex >= 0 && csIndex >= 0;

  const rowsBetweenBottom = validBottom ? ((fsIndex - gbIndex + n) % n || n) : n;
  const rowsBetweenTop = validTop ? ((dbIndex - csIndex + n) % n || n) : n;
  const cycleRows = Math.max(rowsBetweenBottom, rowsBetweenTop);

  // Distance to shift stacked copies so stitched rows overlap
  const cycleSpan = cycleRows * 90;
  // Add padding so the braid never gets clipped
  const rowSpan = cycleSpan + 180; // in SVG units

  // Simple chord rendering - no programmatic font manipulation
  // Let nvxChord font handle all typography naturally

  // Infinite scroll disabled for now (focus on core functionality)
  const contentHeight = (rowCount * 90) + 180;
  const totalHeight = contentHeight + (rowSpan * 2);
  // Reusable stack renderer to avoid duplication
  const Stack: React.FC = () => (
    <>
      {/* Background Layer (Circles) */}
      {center_left.map((_, i) => (
        <g key={`bg-circle-${i}`} className="tona" transform={`translate(0, ${(i + 1) * 90})`}>
          <use className={(focusedKey === center_left[i] || focusedKey === center_right[i] + 'm') ? 'greenCircle active' : 'greenCircle'} xlinkHref="#circle" />
        </g>
      ))}

      {/* Intermediate Layer (Arrows and Links) */}
      {center_left.map((_, i) => (
        <g key={`links-arrows-${i}`} className="tona simpleShape" transform={`translate(0, ${(i + 1) * 90})`}>
          <use className="rect-arrow" xlinkHref="#rectV" transform="translate(0 45)" />
          <use className="rect-arrow" xlinkHref="#rectHright" transform="translate(50 0)" />
          <use className="rect-arrow" xlinkHref="#rectHleft" transform="translate(-50 0)" />
          <g className={getArrowClass()}>
            <use className="arrows-2" xlinkHref="#arrowR" transform="translate(45 0)" />
          </g>
          <g className={getArrowClass()}>
            <use className="arrows-2" xlinkHref="#arrowL" transform="translate(-46 0)" />
          </g>
          <g className={getArrowClass()}>
            <use className="arrows-2" xlinkHref="#arrow" transform="translate(0 45)" />
          </g>
        </g>
      ))}

      {/* Foreground Layer (Bubbles) */}
      {center_left.map((_, i) => (
        <g
          key={`fg-bubble-${i}`}
          className="tona simpleShape"
          transform={`translate(0, ${(i + 1) * 90})`}
          data-key-major={center_left[i]}
          data-key-minor={center_right[i]}
        >
          {/* Center Bubble */}
          <g className="medBubble bub">
            <g className={`${usageClass(getUsage(center_left_in_use[i]))}`}>
              <use xlinkHref="#leftCommaXL" className={`${getBubbleClass(center_left[i], "")} harmonic-bar ${isSelected(center_left_in_use[i]) ? 'selected' : ''}`} onClick={(e) => handleSelect(e, center_left_in_use[i])} />
              <BraidText
                className={displayRoman ? "left duo roman" : "left duo"}
                x="-8"
                y="-12"
                position="center-up"
                onClick={(e) => handleSelect(e, center_left_in_use[i])}
              >
                {center_left_in_use[i]}
              </BraidText>
            </g>
            <g className={`${usageClass(getUsage(center_right_in_use[i]))}`}>
              <use xlinkHref="#rightCommaXL" className={`${getBubbleClass(center_right[i], "m")} harmonic-bar ${isSelected(center_right_in_use[i]) ? 'selected' : ''}`} onClick={(e) => handleSelect(e, center_right_in_use[i])} />
              <BraidText
                className={displayRoman ? "right duo roman braid-label label-right" : "right duo braid-label label-right"}
                x="8"
                y="17"
                position="center-down"
                onClick={(e) => handleSelect(e, center_right_in_use[i])}
              >
                {center_right_in_use[i]}
              </BraidText>
            </g>
          </g>

          {/* Side Bubbles */}
          {i > 0 && i < center_left.length - 1 && (() => {
            const sideCondition = (left_up_in_use[i - 1] || left_down_in_use[i - 1] || right_up_in_use[i - 1] || right_down_in_use[i - 1]);
            if (i === 1) { // Only log for first eligible row
              console.log(`🔍 Side bubbles condition for i=${i}:`, {
                indexCheck: `${i} > 0 && ${i} < ${center_left.length - 1}`,
                leftUp: left_up_in_use[i - 1],
                leftDown: left_down_in_use[i - 1], 
                rightUp: right_up_in_use[i - 1],
                rightDown: right_down_in_use[i - 1],
                condition: sideCondition
              });
            }
            // HARDCODED TEST: Force render for i=1 to test bubble visibility
            return sideCondition || i === 1;
          })() && (
            <>
              <g className="smallBubble bub" transform="translate(-85 0)">
                <g className={`${usageClass(getUsage(left_up_in_use[i - 1]))}`}>
                  <use xlinkHref="#leftCommaSM" className={`${getBubbleClass(left_up[i - 1], "b7")} harmonic-bar ${isSelected(left_up_in_use[i - 1]) ? 'selected' : ''}`} onClick={(e) => handleSelect(e, left_up_in_use[i - 1])} />
                  <BraidText
                    className={displayRoman ? "duo roman braid-label label-left" : "duo braid-label label-left"}
                    x="-12"
                    y="-8"
                    position="left-up"
                    onClick={(e) => handleSelect(e, left_up_in_use[i - 1])}
                  >
                    {left_up_in_use[i - 1]}
                  </BraidText>
                </g>
                <g className={`${usageClass(getUsage(left_down_in_use[i - 1]))}`}>
                  <use xlinkHref="#rightCommaSM" className={`${getBubbleClass(left_down[i - 1], "mb7b5")} harmonic-bar ${isSelected(left_down_in_use[i - 1]) ? 'selected' : ''}`} onClick={(e) => handleSelect(e, left_down_in_use[i - 1])} />
                  <BraidText
                    className={displayRoman ? "duo roman braid-label label-left" : "duo braid-label label-left"}
                    x="7"
                    y="17"
                    position="left-down"
                    onClick={(e) => handleSelect(e, left_down_in_use[i - 1])}
                  >
                    {left_down_in_use[i - 1]}
                  </BraidText>
                </g>
              </g>
              <g className="smallBubble bub" transform="translate(90 0)">
                <g className={`${usageClass(getUsage(right_up_in_use[i - 1]))}`}>
                  <use xlinkHref="#leftCommaSM" className={`${getBubbleClass(right_up[i - 1], 'b7')} harmonic-bar ${isSelected(right_up_in_use[i - 1]) ? 'selected' : ''}`} onClick={(e) => handleSelect(e, right_up_in_use[i - 1])} />
                  <BraidText
                    className={displayRoman ? 'duo roman braid-label label-right' : 'duo braid-label label-right'}
                    x="-12"
                    y="-8"
                    position="right-up"
                    onClick={(e) => handleSelect(e, right_up_in_use[i - 1])}
                  >
                    {right_up_in_use[i - 1]}
                  </BraidText>
                </g>
                <g className={`${usageClass(getUsage(right_down_in_use[i - 1]))}`}>
                  <use xlinkHref="#rightCommaSM" className={`${getBubbleClass(right_down[i - 1], 'o')} harmonic-bar ${isSelected(right_down_in_use[i - 1]) ? 'selected' : ''}`} onClick={(e) => handleSelect(e, right_down_in_use[i - 1])} />
                  <BraidText
                    className={displayRoman ? 'duo roman braid-label label-right' : 'duo braid-label label-right'}
                    x="7"
                    y="17"
                    position="right-down"
                    onClick={(e) => handleSelect(e, right_down_in_use[i - 1])}
                  >
                    {right_down_in_use[i - 1]}
                  </BraidText>
                </g>
              </g>
            </>
          )}

          {/* Outer Bubbles */}
          {i < center_left.length - 2 && (() => {
            const outerCondition = (fifth_left_up_in_use[i] || fifth_left_down_in_use[i] || fifth_right_up_in_use[i] || fifth_right_down_in_use[i]);
            if (i === 0) { // Only log for first eligible row
              console.log(`🔍 Outer bubbles condition for i=${i}:`, {
                indexCheck: `${i} < ${center_left.length - 2}`,
                fifthLeftUp: fifth_left_up_in_use[i],
                fifthLeftDown: fifth_left_down_in_use[i],
                fifthRightUp: fifth_right_up_in_use[i], 
                fifthRightDown: fifth_right_down_in_use[i],
                condition: outerCondition
              });
            }
            // HARDCODED TEST: Force render for i=0 to test bubble visibility
            return outerCondition || i === 0;
          })() && (
            <>
              <g className="smallBubble outer bub" transform="translate(-130 45)">
                <g className={`${usageClass(getUsage(fifth_left_up_in_use[i]))}`}>
                  <use className={`comma harmonic-bar ${isSelected(fifth_left_up_in_use[i]) ? 'selected' : ''}`} xlinkHref="#leftCommaSM" onClick={(e) => handleSelect(e, fifth_left_up_in_use[i])} />
                  <BraidText
                    className={displayRoman ? 'duo roman braid-label label-left' : 'duo braid-label label-left'}
                    x="-12"
                    y="-8"
                    position="outer-up"
                    onClick={(e) => handleSelect(e, fifth_left_up_in_use[i])}
                  >
                    {fifth_left_up_in_use[i]}
                  </BraidText>
                </g>
                <g className={`${usageClass(getUsage(fifth_left_down_in_use[i]))}`}>
                  <use className={`comma harmonic-bar ${isSelected(fifth_left_down_in_use[i]) ? 'selected' : ''}`} xlinkHref="#rightCommaSM" onClick={(e) => handleSelect(e, fifth_left_down_in_use[i])} />
                  <BraidText
                    className={displayRoman ? 'duo roman braid-label label-left' : 'duo braid-label label-left'}
                    x="7"
                    y="17"
                    position="outer-down"
                    onClick={(e) => handleSelect(e, fifth_left_down_in_use[i])}
                  >
                    {fifth_left_down_in_use[i]}
                  </BraidText>
                </g>
              </g>
              <g className="smallBubble outer bub" transform="translate(130 45)">
                <g className={`${usageClass(getUsage(fifth_right_up_in_use[i]))}`}>
                  <use className={`comma harmonic-bar ${isSelected(fifth_right_up_in_use[i]) ? 'selected' : ''}`} xlinkHref="#leftCommaSM" onClick={(e) => handleSelect(e, fifth_right_up_in_use[i])} />
                  <BraidText
                    className={displayRoman ? 'duo roman braid-label label-right' : 'duo braid-label label-right'}
                    x="-12"
                    y="-8"
                    position="outer-up"
                    onClick={(e) => handleSelect(e, fifth_right_up_in_use[i])}
                  >
                    {fifth_right_up_in_use[i]}
                  </BraidText>
                </g>
                <g className={`${usageClass(getUsage(fifth_right_down_in_use[i]))}`}>
                  <use className={`comma harmonic-bar ${isSelected(fifth_right_down_in_use[i]) ? 'selected' : ''}`} xlinkHref="#rightCommaSM" onClick={(e) => handleSelect(e, fifth_right_down_in_use[i])} />
                  <BraidText
                    className={displayRoman ? 'duo roman braid-label label-right' : 'duo braid-label label-right'}
                    x="7"
                    y="17"
                    position="outer-down"
                    onClick={(e) => handleSelect(e, fifth_right_down_in_use[i])}
                  >
                    {fifth_right_down_in_use[i]}
                  </BraidText>
                </g>
              </g>
            </>
          )}
        </g>
      ))}
    </>
  );


  return (
    <section id="braid-tonal" className="" style={{ display: "block", background: 'hsl(var(--muted))', color: 'hsl(var(--foreground))' }}>
      <div
        ref={containerRef}
        className="braid"
        style={{ width: "100%", height: "auto", overflow: 'visible' }}
        onWheel={handleWheel}
      >
        <svg version="1.1" width="100%" height={totalHeight + 120} viewBox={`-10 40 320 ${totalHeight + 80}`} preserveAspectRatio="xMidYMin meet" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
          <defs>
            <linearGradient id="greenGradient" x1="0.5" x2="0.8" y1="0.1" y2="0.8">
              <stop offset="0%" stopColor="#00a450" />
              <stop offset="100%" stopColor="#416c63" />
            </linearGradient>

            <radialGradient id="greyGradient" x1="0.1" y1="0.1" x2="1" y2="1">
              <stop offset="0%" stopColor="#7f8899" />
              <stop offset="100%" stopColor="#58595b" />
            </radialGradient>
            <filter id="f2">
              <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="imgBlur" />
              <feSpecularLighting in="imgBlur" surfaceScale="2" specularConstant=".75"
                specularExponent="20" lightingColor="#bbbbbb" result="imgSpecular">
                <fePointLight x="-5" y="-100" z="100" />
              </feSpecularLighting>
              <feComposite in="imgSpecular" in2="SourceAlpha" operator="in" result="imgMasked" />
              <feComposite in="SourceGraphic" in2="imgMasked"
                operator="arithmetic" k1="0" k2="1" k3="2" k4="0" />
            </filter>

            {/* Braid shapes */}
            <g id="leftCommaXL" style={{ transform: "scale(1.5) translate(-33px, -203px)" }}>
              <path d="m 32.734375,179.20618 c 0,0 12.113735,-0.82137 8.401424,13.54174 -2.342291,6.20927 -8.707643,9.85526 -9.083293,10.09833 -0.68501,0.48614 -8.461794,5.67897 -9.257288,11.5789 -0.352227,3.65595 -0.689274,10.31176 10.020883,11.82129 -9.013122,0.002 -23.157482,-6.89426 -23.144332,-23.81622 0.01445,-18.60061 15.886974,-23.24613 23.062606,-23.22404 z" />
            </g>
            <g id="rightCommaXL" style={{ transform: "scale(1.5) translate(-33px, -203px)" }}>
              <path d="m 33.024778,226.20487 c 0,0 -13.443364,-0.0489 -9.683064,-13.47923 1.243181,-4.30995 6.111411,-8.15928 9.392661,-10.28428 3.21875,-2.125 6.102754,-5.36321 7.859805,-8.419 4.860534,-14.74796 -6.999423,-14.84859 -6.999423,-14.84859 6.473148,0 21.785508,5.24551 22.271648,23.5419 0.48613,18.29638 -16.172921,23.52203 -22.841627,23.4892 z" />
            </g>
            <g id="leftCommaSM" style={{ transform: "scale(1.2) translate(-35px, -200px)" }}>
              <path d="m 32.734375,179.20618 c 0,0 12.113735,-0.82137 8.401424,13.54174 -2.342291,6.20927 -8.707643,9.85526 -9.083293,10.09833 -0.68501,0.48614 -8.461794,5.67897 -9.257288,11.5789 -0.352227,3.65595 -0.689274,10.31176 10.020883,11.82129 -9.013122,0.002 -23.157482,-6.89426 -23.144332,-23.81622 0.01445,-18.60061 15.886974,-23.24613 23.062606,-23.22404 z" />
            </g>
            <g id="rightCommaSM" style={{ transform: "scale(1.2) translate(-35px, -200px)" }}>
              <path d="m 33.024778,226.20487 c 0,0 -13.443364,-0.0489 -9.683064,-13.47923 1.243181,-4.30995 6.111411,-8.15928 9.392661,-10.28428 3.21875,-2.125 6.102754,-5.36321 7.859805,-8.419 4.860534,-14.74796 -6.999423,-14.84859 -6.999423,-14.84859 6.473148,0 21.785508,5.24551 22.271648,23.5419 0.48613,18.29638 -16.172921,23.52203 -22.841627,23.4892 z" />
            </g>
            <g id="circle" style={{ transform: "translate(-150px, -160px)" }}>
              <path d="M 234.52679,161.55 A 84.076797,84.076797 0 0 1 150.45,245.6268 84.076797,84.076797 0 0 1 66.373199,161.55 84.076797,84.076797 0 0 1 150.45,77.473206 84.076797,84.076797 0 0 1 234.52679,161.55 Z" />
            </g>
            <g id="rectV">
              <path d="m-17-26s19.6 25.5 0 52c.631-.631 18.1-8.98 33.1-.312-.315 0-19.6-25.8 0-51.4 0-.315-16.6 9.22-33.1-.312z" />
            </g>
            <g id="rectHright" transform="rotate(180)">
              <path d="m-22.4-9.55s22.9 9.15 44.7 0c-2.41 5.55-2.64 13.9-.624 19.1-.158.158-19.8-8.2-44.7 0 3.17-4.85 3.33-12.9.002-19.1z" />
            </g>
            <g id="rectHleft">
              <path d="m-22.4-9.55s22.9 9.15 44.7 0c-2.41 5.55-2.64 13.9-.624 19.1-.158.158-19.8-8.2-44.7 0 3.17-4.85 3.33-12.9.002-19.1z" />
            </g>
            <g id="arrow">
              <path d="m5.46-8.1-5.75 7.18-5.78-7.19v7.14l5.77 9.14 5.72-8.97z" />
            </g>
            <g id="arrowL" transform="rotate(-90)">
              <path d="m5.46-8.1-5.75 7.18-5.78-7.19v7.14l5.77 9.14 5.72-8.97z" />
            </g>
            <g id="arrowR" transform="rotate(90)">
              <path d="m5.46-8.1-5.75 7.18-5.78-7.19v7.14l5.77 9.14 5.72-8.97z" />
            </g>
          </defs>

          {/* Overlap temporarily disabled per request: render single stack only */}
          <g transform={`translate(150 0) scale(${0.9 * zoom})`}>
            <Stack />
          </g>
        </svg>
      </div>
    </section>
  );
};

export default BraidTonal;