import React, { useEffect, useMemo, useState, useRef } from "react";
import "./BraidTonal.css";
import { MusicalChordText } from '@/components/MusicalChordText';
import { ChordAudioPlayer } from '@/components/ChordAudioPlayer';
import { getBraidPositionUsage, mapRomanToHarmonicSlot } from '@/utils/braidHarmonicMapping';

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
  selectedChords?: string[]; 
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
    fetch("/assets/braid_tonalities.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setTonalities(data))
      .catch(() => {
        // Fallback minimal dataset: center columns only, using regular text
        setTonalities({
          roman: {
            center_major: Array(12).fill('I'),
            center_minor: Array(12).fill('i'),
            left_up: Array(12).fill(''),
            left_down: Array(12).fill(''),
            right_up: Array(12).fill(''),
            right_down: Array(12).fill(''),
            outer_left_up: Array(12).fill(''),
            outer_left_down: Array(12).fill(''),
            outer_right_up: Array(12).fill(''),
            outer_right_down: Array(12).fill(''),
          },
          C: {
            center_major: ["C","G","D","A","E","B","F#","C#","G#","D#","A#","F"],
            center_minor: ["Am","Em","Bm","F#m","C#m","G#m","D#m","A#m","Fm","Cm","Gm","Dm"],
            left_up: Array(12).fill(''),
            left_down: Array(12).fill(''),
            right_up: Array(12).fill(''),
            right_down: Array(12).fill(''),
            outer_left_up: Array(12).fill(''),
            outer_left_down: Array(12).fill(''),
            outer_right_up: Array(12).fill(''),
            outer_right_down: Array(12).fill(''),
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

    const getInUse = (noteArr: string[], romanArr: string[], rotation = 0) => {
      const rotatedRoman = rotate(romanArr, rotation);
      return displayRoman ? rotatedRoman : noteArr;
    };

    // The original Angular code has a rotation of -3 for roman numerals in minor context
    const romanMinorRotation = -3;

    return {
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

  // Selection helpers to mirror HarmonicChart logic
  const isSelected = (label?: string) => {
    if (!label) return false;
    // Check both the original label and its mapped harmonic function (key-aware)
    const harmonicSlot = mapRomanToHarmonicSlot(label, focusedKey);
    return selectedChords?.includes(label) || 
           (harmonicSlot && selectedChords?.includes(harmonicSlot)) || false;
  };
  const toggleChord = (label: string) => {
    if (!label) return;
    if (onChordSelect) onChordSelect(label, !isSelected(label));
    else onChordClick?.(label);
  };

  // Selection with Cmd/Ctrl semantics: click = replace, Cmd/Ctrl-click = add/remove
  const handleSelect = (e: React.MouseEvent, label: string) => {
    if (!label) return;
    const additive = e.metaKey || e.ctrlKey;
    if (additive) {
      onChordSelect ? onChordSelect(label, !isSelected(label)) : onChordClick?.(label);
    } else {
      // Replace selection with this single chord
      const others = (selectedChords || []).filter(c => c !== label);
      others.forEach(c => onChordSelect?.(c, false));
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

  // Usage-based styling helpers
  const getUsage = (label?: string) => {
    if (!label) return 0;
    const p = (chordUsage as any)?.[label];
    if (typeof p !== 'number' || isNaN(p)) return 0;
    return Math.max(0, Math.min(100, Math.round(p)));
  };
  const usageClass = (p: number) => {
    if (p >= 100) return 'usage-max';
    if (p >= 85) return 'usage-hype';
    if (p >= 60) return 'usage-high';
    if (p >= 30) return 'usage-med';
    if (p > 0) return 'usage-low';
    return 'usage-zero';
  };
  
  // Formatting helpers for musical glyphs and minor marking
  const formatAccidentals = (s?: string) => {
    if (!s) return '';
    return s.replace(/#/g, '♯').replace(/º/g, '°').replace(/b/g, '♭');
  };
  const ensureMinor = (s?: string) => {
    if (!s) return '';
    // If roman numerals, do not modify
    if (/^[iv]+$/.test(s)) return s;
    return s.endsWith('m') ? s : `${s}m`;
  };
  const toSuperscripts = (s: string) =>
    s
      .replace(/13/g, '¹³')
      .replace(/11/g, '¹¹')
      .replace(/9/g, '⁹')
      .replace(/7/g, '⁷')
      .replace(/6/g, '⁶')
      .replace(/5/g, '⁵');
  const prettyChord = (s?: string) => {
    if (!s) return '';
    let t = s;
    // Normalize common aliases
    t = t.replace(/maj7|M7|∆7|Δ7/g, 'Δ7');
    t = t.replace(/dim7|o7|º7/gi, '°7');
    // Accidentals to musical glyphs
    t = formatAccidentals(t);
    // Half-diminished
    t = t.replace(/m7(?:♭|b)5/gi, 'm7♭5');
    // Superscript tensions/qualities
    t = toSuperscripts(t);
    return t;
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

// Typography helpers for braid labels
const renderChordSVG = (s?: string) => {
  if (!s) return null;
  const tokens = Array.from(s);
  return tokens.map((ch, idx) => {
    if (ch === 'm') {
      return (
        <tspan key={`m-${idx}`} style={{ fontSize: '0.33em' }}>{ch}</tspan>
      );
    }
    if (/[♭♯°ø♮]/.test(ch)) {
      return (
        <tspan key={`acc-${idx}`} style={{ fontSize: '0.33em' }}>{ch}</tspan>
      );
    }
    if (/[⁰¹²³⁴⁵⁶⁷⁸⁹]/.test(ch)) {
      return (
        <tspan key={`sup-${idx}`} style={{ fontSize: '0.55em' }}>{ch}</tspan>
      );
    }
    return <tspan key={`ch-${idx}`}>{ch}</tspan>;
  });
};

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
            <text className={displayRoman ? "left duo roman" : "left duo"} x={displayRoman ? "0" : "-5"} y="-6">
              {displayRoman ? center_left_in_use[i] : prettyChord(center_left_in_use[i])}
            </text>
          </g>
          <g className={`${usageClass(getUsage(center_right_in_use[i]))}`}>
            <use xlinkHref="#rightCommaXL" className={`${getBubbleClass(center_right[i], "m")} harmonic-bar ${isSelected(center_right_in_use[i]) ? 'selected' : ''}`} onClick={(e) => handleSelect(e, center_right_in_use[i])} />
            <text className={displayRoman ? "right duo roman braid-label label-right" : "right duo braid-label label-right"} x="-6" y="22">
              {displayRoman ? center_right_in_use[i] : renderChordSVG(prettyChord(ensureMinor(center_right_in_use[i])))}
            </text>
          </g>
        </g>

        {/* Side Bubbles */}
        {i > 0 && i < center_left.length - 1 && (left_up_in_use[i-1] || left_down_in_use[i-1] || right_up_in_use[i-1] || right_down_in_use[i-1]) && (
          <>
            <g className="smallBubble bub" transform="translate(-85 0)">
              <g className={`${usageClass(getUsage(left_up_in_use[i-1]))}`}>
                <use xlinkHref="#leftCommaSM" className={`${getBubbleClass(left_up[i - 1], "b7")} harmonic-bar ${isSelected(left_up_in_use[i-1]) ? 'selected' : ''}`} onClick={(e) => handleSelect(e, left_up_in_use[i-1])} />
                <text className={displayRoman ? "duo roman braid-label label-left" : "duo braid-label label-left"} x="-20" y="-4">
                  {displayRoman ? left_up_in_use[i-1] : renderChordSVG(prettyChord(`${left_up_in_use[i-1]}7`)) || ''}
                </text>
              </g>
              <g className={`${usageClass(getUsage(left_down_in_use[i-1]))}`}>
                <use xlinkHref="#rightCommaSM" className={`${getBubbleClass(left_down[i - 1], "mb7b5")} harmonic-bar ${isSelected(left_down_in_use[i-1]) ? 'selected' : ''}`} onClick={(e) => handleSelect(e, left_down_in_use[i-1])} />
                <text className={displayRoman ? "duo roman braid-label label-left" : "duo braid-label label-left"} x="-5" y="16">
                  {displayRoman ? left_down_in_use[i-1] : renderChordSVG(prettyChord(`${left_down_in_use[i-1]}m7b5`)) || ''}
                </text>
              </g>
            </g>
            <g className="smallBubble bub" transform="translate(90 0)">
              <g className={`${usageClass(getUsage(right_up_in_use[i-1]))}`}>
                <use xlinkHref="#leftCommaSM" className={`${getBubbleClass(right_up[i-1], 'b7')} harmonic-bar ${isSelected(right_up_in_use[i-1]) ? 'selected' : ''}`} onClick={(e) => handleSelect(e, right_up_in_use[i-1])} />
                <text className={displayRoman ? 'duo roman braid-label label-right' : 'duo braid-label label-right'} x={displayRoman ? '-22' : '-20'} y="-2">{displayRoman ? right_up_in_use[i-1] : renderChordSVG(prettyChord(`${right_up_in_use[i-1]}7`)) || ''}</text>
              </g>
              <g className={`${usageClass(getUsage(right_down_in_use[i-1]))}`}>
                <use xlinkHref="#rightCommaSM" className={`${getBubbleClass(right_down[i-1], 'o')} harmonic-bar ${isSelected(right_down_in_use[i-1]) ? 'selected' : ''}`} onClick={(e) => handleSelect(e, right_down_in_use[i-1])} />
                <text className={displayRoman ? 'duo roman braid-label label-right' : 'duo braid-label label-right'} x="-6" y="18">{displayRoman ? right_down_in_use[i-1] : renderChordSVG(prettyChord(`${right_down_in_use[i-1]}º7`)) || ''}</text>
              </g>
            </g>
          </>
        )}
        
        {/* Outer Bubbles */}
        {i < center_left.length - 2 && (fifth_left_up_in_use[i] || fifth_left_down_in_use[i] || fifth_right_up_in_use[i] || fifth_right_down_in_use[i]) && (
            <>
                <g className="smallBubble outer bub" transform="translate(-130 45)">
                    <g className={`${usageClass(getUsage(fifth_left_up_in_use[i]))}`}>
                        <use className={`comma harmonic-bar ${isSelected(fifth_left_up_in_use[i]) ? 'selected' : ''}`} xlinkHref="#leftCommaSM" onClick={(e) => handleSelect(e, fifth_left_up_in_use[i])} />
                        <text className={displayRoman ? 'duo roman braid-label label-left' : 'duo braid-label label-left'} x="-22" y="-4">{displayRoman ? fifth_left_up_in_use[i] : renderChordSVG(prettyChord(`${fifth_left_up_in_use[i]}7`)) || ''}</text>
                    </g>
                    <g className={`${usageClass(getUsage(fifth_left_down_in_use[i]))}`}>
                        <use className={`comma harmonic-bar ${isSelected(fifth_left_down_in_use[i]) ? 'selected' : ''}`} xlinkHref="#rightCommaSM" onClick={(e) => handleSelect(e, fifth_left_down_in_use[i])} />
                        <text className={displayRoman ? 'duo roman braid-label label-left' : 'duo braid-label label-left'} x={displayRoman ? '-5' : '-3'} y="14">{displayRoman ? fifth_left_down_in_use[i] : renderChordSVG(prettyChord(`${fifth_left_down_in_use[i]}m7b5`)) || ''}</text>
                    </g>
                </g>
                <g className="smallBubble outer bub" transform="translate(130 45)">
                    <g className={`${usageClass(getUsage(fifth_right_up_in_use[i]))}`}>
                        <use className={`comma harmonic-bar ${isSelected(fifth_right_up_in_use[i]) ? 'selected' : ''}`} xlinkHref="#leftCommaSM" onClick={(e) => handleSelect(e, fifth_right_up_in_use[i])} />
                        <text className={displayRoman ? 'duo roman braid-label label-right' : 'duo braid-label label-right'} x={displayRoman ? '-25' : '-22'} y="-2">{displayRoman ? fifth_right_up_in_use[i] : renderChordSVG(prettyChord(`${fifth_right_up_in_use[i]}7`)) || ''}</text>
                    </g>
                    <g className={`${usageClass(getUsage(fifth_right_down_in_use[i]))}`}>
                        <use className={`comma harmonic-bar ${isSelected(fifth_right_down_in_use[i]) ? 'selected' : ''}`} xlinkHref="#rightCommaSM" onClick={(e) => handleSelect(e, fifth_right_down_in_use[i])} />
                        <text className={displayRoman ? 'duo roman braid-label label-right' : 'duo braid-label label-right'} x={displayRoman ? '-5' : '-2'} y="15">{displayRoman ? fifth_right_down_in_use[i] : renderChordSVG(prettyChord(`${fifth_right_down_in_use[i]}º7`)) || ''}</text>
                    </g>
                </g>
            </>
        )}
      </g>
    ))}
  </>
);


  return (
    <section id="braid-tonal" className="font-fontdec13" style={{ display: "block", background: 'hsl(var(--muted))', color: 'hsl(var(--foreground))' }}>
      <div
        ref={containerRef}
        className="braid"
        style={{ width: "100%", height: "auto", overflow: 'visible' }}
        onWheel={handleWheel}
      >
        <svg version="1.1" width="100%" height={totalHeight + 120} viewBox={`-10 40 320 ${totalHeight + 80}`} preserveAspectRatio="xMidYMin meet" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
        <defs>
            <linearGradient id="greenGradient" x1="0.5" x2="0.8" y1="0.1" y2="0.8">
                <stop offset="0%" stopColor="#00a450"/>
                <stop offset="100%" stopColor="#416c63"/>
            </linearGradient>

            <radialGradient id="greyGradient" x1="0.1" y1="0.1" x2="1" y2="1">
                <stop offset="0%" stopColor="#7f8899"/>
                <stop offset="100%" stopColor="#58595b"/>
            </radialGradient>
            <filter id="f2">
                <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="imgBlur" />
                <feSpecularLighting in="imgBlur" surfaceScale="2" specularConstant=".75"
                  specularExponent="20" lightingColor="#bbbbbb" result="imgSpecular">
                 <fePointLight x="-5" y="-100" z="100" />
                </feSpecularLighting>
                <feComposite in="imgSpecular" in2="SourceAlpha" operator="in" result="imgMasked" />
                <feComposite in="SourceGraphic" in2="imgMasked"
                  operator="arithmetic" k1="0" k2="1" k3="2" k4="0"/>
            </filter>

            {/* Braid shapes */}
            <g id="leftCommaXL" style={{ transform: "scale(1.5) translate(-33px, -203px)" }}>
                <path d="m 32.734375,179.20618 c 0,0 12.113735,-0.82137 8.401424,13.54174 -2.342291,6.20927 -8.707643,9.85526 -9.083293,10.09833 -0.68501,0.48614 -8.461794,5.67897 -9.257288,11.5789 -0.352227,3.65595 -0.689274,10.31176 10.020883,11.82129 -9.013122,0.002 -23.157482,-6.89426 -23.144332,-23.81622 0.01445,-18.60061 15.886974,-23.24613 23.062606,-23.22404 z"/>
            </g>
            <g id="rightCommaXL" style={{ transform: "scale(1.5) translate(-33px, -203px)" }}>
                <path d="m 33.024778,226.20487 c 0,0 -13.443364,-0.0489 -9.683064,-13.47923 1.243181,-4.30995 6.111411,-8.15928 9.392661,-10.28428 3.21875,-2.125 6.102754,-5.36321 7.859805,-8.419 4.860534,-14.74796 -6.999423,-14.84859 -6.999423,-14.84859 6.473148,0 21.785508,5.24551 22.271648,23.5419 0.48613,18.29638 -16.172921,23.52203 -22.841627,23.4892 z"/>
            </g>
            <g id="leftCommaSM" style={{ transform: "scale(1.2) translate(-35px, -200px)" }}>
                <path d="m 32.734375,179.20618 c 0,0 12.113735,-0.82137 8.401424,13.54174 -2.342291,6.20927 -8.707643,9.85526 -9.083293,10.09833 -0.68501,0.48614 -8.461794,5.67897 -9.257288,11.5789 -0.352227,3.65595 -0.689274,10.31176 10.020883,11.82129 -9.013122,0.002 -23.157482,-6.89426 -23.144332,-23.81622 0.01445,-18.60061 15.886974,-23.24613 23.062606,-23.22404 z"/>
            </g>
            <g id="rightCommaSM" style={{ transform: "scale(1.2) translate(-35px, -200px)" }}>
                <path d="m 33.024778,226.20487 c 0,0 -13.443364,-0.0489 -9.683064,-13.47923 1.243181,-4.30995 6.111411,-8.15928 9.392661,-10.28428 3.21875,-2.125 6.102754,-5.36321 7.859805,-8.419 4.860534,-14.74796 -6.999423,-14.84859 -6.999423,-14.84859 6.473148,0 21.785508,5.24551 22.271648,23.5419 0.48613,18.29638 -16.172921,23.52203 -22.841627,23.4892 z"/>
            </g>
            <g id="circle" style={{ transform: "translate(-150px, -160px)" }}>
                <path d="M 234.52679,161.55 A 84.076797,84.076797 0 0 1 150.45,245.6268 84.076797,84.076797 0 0 1 66.373199,161.55 84.076797,84.076797 0 0 1 150.45,77.473206 84.076797,84.076797 0 0 1 234.52679,161.55 Z"/>
            </g>
            <g id="rectV">
                <path d="m-17-26s19.6 25.5 0 52c.631-.631 18.1-8.98 33.1-.312-.315 0-19.6-25.8 0-51.4 0-.315-16.6 9.22-33.1-.312z"/>
            </g>
            <g id="rectHright" transform="rotate(180)">
                <path d="m-22.4-9.55s22.9 9.15 44.7 0c-2.41 5.55-2.64 13.9-.624 19.1-.158.158-19.8-8.2-44.7 0 3.17-4.85 3.33-12.9.002-19.1z"/>
            </g>
            <g id="rectHleft">
                <path d="m-22.4-9.55s22.9 9.15 44.7 0c-2.41 5.55-2.64 13.9-.624 19.1-.158.158-19.8-8.2-44.7 0 3.17-4.85 3.33-12.9.002-19.1z"/>
            </g>
            <g id="arrow">
              <path d="m5.46-8.1-5.75 7.18-5.78-7.19v7.14l5.77 9.14 5.72-8.97z"/>
            </g>
            <g id="arrowL" transform="rotate(-90)">
              <path d="m5.46-8.1-5.75 7.18-5.78-7.19v7.14l5.77 9.14 5.72-8.97z"/>
            </g>
            <g id="arrowR" transform="rotate(90)">
              <path d="m5.46-8.1-5.75 7.18-5.78-7.19v7.14l5.77 9.14 5.72-8.97z"/>
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