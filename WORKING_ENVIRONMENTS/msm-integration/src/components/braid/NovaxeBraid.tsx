import React, { useEffect, useMemo, useState, useRef } from "react";
import "./NovaxeBraid.css";
import { MusicalChordText } from '@/components/MusicalChordText';
import { ChordAudioPlayer } from '@/components/ChordAudioPlayer';

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

type NovaxeBraidProps = { 
  focusKey?: string; 
  zoom?: number; 
  onZoomChange?: (z: number) => void; 
  onChordClick?: (chord: string) => void; 
  onChordSelect?: (chord: string, isSelected: boolean) => void; 
  selectedChords?: string[]; 
  scrollContainerRef?: React.RefObject<HTMLDivElement>; 
  chordUsage?: Record<string, number>;
  displayRoman?: boolean;
};

const NovaxeBraid: React.FC<NovaxeBraidProps> = ({ 
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
  const [displayedChord, setDisplayedChord] = useState("");

  useEffect(() => {
    fetch("/assets/braid_tonalities.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setTonalities(data))
      .catch(() => {
        // Fallback minimal dataset
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

  const currentTonalSet = useMemo(() => {
    if (!tonalities) return null;
    
    const keyIndex = Object.keys(tonalities).findIndex(key => key === tonality);
    if (keyIndex === -1) return null;
    
    const baseSet = tonalities[tonality] as TonalSet;
    if (!baseSet) return null;
    
    return {
      center_major: rotate(baseSet.center_major, keyIndex),
      center_minor: rotate(baseSet.center_minor, keyIndex),
      left_up: rotate(baseSet.left_up, keyIndex),
      left_down: rotate(baseSet.left_down, keyIndex),
      right_up: rotate(baseSet.right_up, keyIndex),
      right_down: rotate(baseSet.right_down, keyIndex),
      outer_left_up: rotate(baseSet.outer_left_up, keyIndex),
      outer_left_down: rotate(baseSet.outer_left_down, keyIndex),
      outer_right_up: rotate(baseSet.outer_right_up, keyIndex),
      outer_right_down: rotate(baseSet.outer_right_down, keyIndex),
    };
  }, [tonalities, tonality]);

  const romanTonalSet = useMemo(() => {
    if (!tonalities?.roman) return null;
    return tonalities.roman;
  }, [tonalities]);

  const handleChordClick = (chord: string, event: React.MouseEvent) => {
    setDisplayedChord(chord);
    onChordClick?.(chord);
    
    if (onChordSelect && selectedChords) {
      const isSelected = selectedChords.includes(chord);
      onChordSelect(chord, !isSelected);
    }
  };

  const getBubbleClass = (chord: string, chordType: string) => {
    if (!chord || chord === '') return 'erase';
    if (selectedChords?.includes(chord)) return 'active';
    return 'normal';
  };

  const getArrowClass = (chord1: string, type1: string, chord2: string, type2: string, chord3: string, type3: string, chord4: string, type4: string) => {
    if ((chord1 && chord1 !== '') || (chord2 && chord2 !== '') || (chord3 && chord3 !== '') || (chord4 && chord4 !== '')) {
      return 'arrows-2';
    }
    return 'arrows-2 erase';
  };

  if (!currentTonalSet || !romanTonalSet) {
    return <div>Loading braid...</div>;
  }

  const { center_major, center_minor, left_up, left_down, right_up, right_down, outer_left_up, outer_left_down, outer_right_up, outer_right_down } = currentTonalSet;

  return (
    <div className="novaxe-braid-container" ref={containerRef}>
      <span className="displayed-chord">{displayedChord}</span>
      
      <div className="braid" style={{ width: '100%', height: '100%' }}>
        <svg 
          version="1.1" 
          width="100%" 
          viewBox="-10 40 320 1600" 
          xmlns="http://www.w3.org/2000/svg"
          style={{ transform: `scale(${zoom})` }}
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="greenGradient" x1="0.5" x2="0.8" y1="0.1" y2="0.8">
              <stop offset="0%" stopColor="#00a450"/>
              <stop offset="100%" stopColor="#416c63"/>
            </linearGradient>

            <radialGradient id="greyGradient" x1="0.1" y1="0.1" x2="1" y2="1">
              <stop offset="0%" stopColor="#7f8899"/>
              <stop offset="100%" stopColor="#58595b"/>
            </radialGradient>

            <radialGradient id="greyGradient0" x1="0.1" y1="0.1" x2="1" y2="1">
              <stop offset="0%" stopColor="#6d7481"/>
              <stop offset="100%" stopColor="#545659"/>
            </radialGradient>

            <radialGradient id="greyGradient1" x1="0.1" y1="0.1" x2="1" y2="1">
              <stop offset="0%" stopColor="#6a717f"/>
              <stop offset="100%" stopColor="#505255"/>
            </radialGradient>

            <radialGradient id="greyGradient2" x1="0.1" y1="0.1" x2="1" y2="1">
              <stop offset="0%" stopColor="#5f6472"/>
              <stop offset="100%" stopColor="#494c4f"/>
            </radialGradient>

            <radialGradient id="greyGradient3" x1="0.1" y1="0.1" x2="1" y2="1">
              <stop offset="0%" stopColor="#5e636e"/>
              <stop offset="100%" stopColor="#46494c"/>
            </radialGradient>

            <radialGradient id="greyGradient4" x1="0.1" y1="0.1" x2="1" y2="1">
              <stop offset="0%" stopColor="#5d646f"/>
              <stop offset="100%" stopColor="#4b4c4e"/>
            </radialGradient>

            <radialGradient id="greyGradient5" x1="0.1" y1="0.1" x2="1" y2="1">
              <stop offset="0%" stopColor="#5c626d"/>
              <stop offset="100%" stopColor="#4a4b4d"/>
            </radialGradient>

            <radialGradient id="greyGradient6" x1="0.1" y1="0.1" x2="1" y2="1">
              <stop offset="0%" stopColor="#585d65"/>
              <stop offset="100%" stopColor="#434446"/>
            </radialGradient>

            <radialGradient id="greyGradient7" x1="0.1" y1="0.1" x2="1" y2="1">
              <stop offset="0%" stopColor="#575d69"/>
              <stop offset="100%" stopColor="#404245"/>
            </radialGradient>

            <radialGradient id="greyGradient8" x1="0.1" y1="0.1" x2="1" y2="1">
              <stop offset="0%" stopColor="#4f555f"/>
              <stop offset="100%" stopColor="#3a3d41"/>
            </radialGradient>

            <radialGradient id="greyGradient9" x1="0.1" y1="0.1" x2="1" y2="1">
              <stop offset="0%" stopColor="#434a51"/>
              <stop offset="100%" stopColor="#3a3f45"/>
            </radialGradient>

            <radialGradient id="eraseGradient" x1="0.1" y1="0.1" x2="1" y2="1">
              <stop offset="0%" stopColor="#343a40"/>
              <stop offset="100%" stopColor="#343a40"/>
            </radialGradient>

            <linearGradient id="greenOrangeGradient" x1="0.1" y1="0.1" x2="1" y2="1">
              <stop offset="0%" stopColor="#979da2ff"/>
              <stop offset="100%" stopColor="#f1ded7ff"/>
            </linearGradient>

            {/* Filters */}
            <filter id="f1">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
            </filter>

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

            {/* Bubble shapes */}
            <g id="leftCommaXL" style={{ transform: 'scale(1.5) translate(-33px, -203px)' }}>
              <path d="m 32.734375,179.20618 c 0,0 12.113735,-0.82137 8.401424,13.54174 -2.342291,6.20927 -8.707643,9.85526 -9.083293,10.09833 -0.68501,0.48614 -8.461794,5.67897 -9.257288,11.5789 -0.352227,3.65595 -0.689274,10.31176 10.020883,11.82129 -9.013122,0.002 -23.157482,-6.89426 -23.144332,-23.81622 0.01445,-18.60061 15.886974,-23.24613 23.062606,-23.22404 z"/>
            </g>

            <g id="rightCommaXL" style={{ transform: 'scale(1.5) translate(-33px, -203px)' }}>
              <path d="m 33.024778,226.20487 c 0,0 -13.443364,-0.0489 -9.683064,-13.47923 1.243181,-4.30995 6.111411,-8.15928 9.392661,-10.28428 3.21875,-2.125 6.102754,-5.36321 7.859805,-8.419 4.860534,-14.74796 -6.999423,-14.84859 -6.999423,-14.84859 6.473148,0 21.785508,5.24551 22.271648,23.5419 0.48613,18.29638 -16.172921,23.52203 -22.841627,23.4892 z"/>
            </g>

            <g id="leftCommaSM" style={{ transform: 'scale(1.2) translate(-35px, -200px)' }}>
              <path d="m 32.734375,179.20618 c 0,0 12.113735,-0.82137 8.401424,13.54174 -2.342291,6.20927 -8.707643,9.85526 -9.083293,10.09833 -0.68501,0.48614 -8.461794,5.67897 -9.257288,11.5789 -0.352227,3.65595 -0.689274,10.31176 10.020883,11.82129 -9.013122,0.002 -23.157482,-6.89426 -23.144332,-23.81622 0.01445,-18.60061 15.886974,-23.24613 23.062606,-23.22404 z"/>
            </g>

            <g id="rightCommaSM" style={{ transform: 'scale(1.2) translate(-35px, -200px)' }}>
              <path d="m 33.024778,226.20487 c 0,0 -13.443364,-0.0489 -9.683064,-13.47923 1.243181,-4.30995 6.111411,-8.15928 9.392661,-10.28428 3.21875,-2.125 6.102754,-5.36321 7.859805,-8.419 4.860534,-14.74796 -6.999423,-14.84859 -6.999423,-14.84859 6.473148,0 21.785508,5.24551 22.271648,23.5419 0.48613,18.29638 -16.172921,23.52203 -22.841627,23.4892 z"/>
            </g>

            {/* Arrows */}
            <g id="leftArrow">
              <path d="m-21.4 6.82c3.4-2.29 9.5 2.32 13.9-.5-5.07-3.38-9.5-8.43-14-13.2.027 4.38-.438 9.39.09 13.7z"/>
              <path d="m-21.5-6.87c.996.215 2 .223 3 .0117.961-.203 1.88-.664 2.81-1.06.949-.406 1.91-.695 2.91-.648 1.01.043 2 .402 2.95.898 1.87.969 3.67 2.34 5.35 3.9 1.74 1.62 3.36 3.49 5.09 5.14 1.54 1.47 3.15 2.73 4.73 4.1.16.137.961-.106 1.12.0312-1.53 1.27-3.74 2.67-5.51 2.9-1.82.238-3.75.137-5.52-.551-1.19-.457-2.34-1.12-3.46-1.86-.91-.606-1.78-1.28-2.67-1.97l-1.49-1.34-2.02-1.95-1.74-1.75-1.74-1.84-1.95-2.11-1.87-1.89"/>
              <path d="m-6.82-5.8c.059.0508.426-.227.496-.266.176-.0977.352-.195.527-.293.367-.207.734-.41 1.1-.609.762-.41 1.54-.789 2.32-1.06.781-.27 1.59-.426 2.4-.438 1.23-.0195 2.44.473 3.56 1.22.324.223.648.461.957.719.547.449 1.09.953 1.7 1.16.289.0977.586.0937.879.121.141.0156.5.16.508-.188v-.453c.01-.34 0-.684 0-1.03v-3.84l1.65 1.34v5.32s-14 .004-14.1.004c-.047 0-.145-.125-.184-.16-.152-.133-.309-.27-.461-.402-.355-.309-.707-.617-1.06-.926-.082-.0742-.168-.144-.254-.219z"/>
              <path d="m5.88 5.35s1.09.0664 1.75.0664h1.65v5.18l11.8-9.93-11.8-10.1v5.49l-13.8-.168-.098.215 4.64 4.69s1.28 1.27 2.69 2.5 2.41 1.95 2.41 1.95z"/>
            </g>

            <g id="rightArrow" transform="scale(-1 1)">
              <path d="m-21.4 6.82c3.4-2.29 9.5 2.32 13.9-.5-5.07-3.38-9.5-8.43-14-13.2.027 4.38-.438 9.39.09 13.7z"/>
              <path d="m-21.5-6.87c.996.215 2 .223 3 .0117.961-.203 1.88-.664 2.81-1.06.949-.406 1.91-.695 2.91-.648 1.01.043 2 .402 2.95.898 1.87.969 3.67 2.34 5.35 3.9 1.74 1.62 3.36 3.49 5.09 5.14 1.54 1.47 3.15 2.73 4.73 4.1.16.137.961-.106 1.12.0312-1.53 1.27-3.74 2.67-5.51 2.9-1.82.238-3.75.137-5.52-.551-1.19-.457-2.34-1.12-3.46-1.86-.91-.606-1.78-1.28-2.67-1.97l-1.49-1.34-2.02-1.95-1.74-1.75-1.74-1.84-1.95-2.11-1.87-1.89"/>
              <path d="m-6.82-5.8c.059.0508.426-.227.496-.266.176-.0977.352-.195.527-.293.367-.207.734-.41 1.1-.609.762-.41 1.54-.789 2.32-1.06.781-.27 1.59-.426 2.4-.438 1.23-.0195 2.44.473 3.56 1.22.324.223.648.461.957.719.547.449 1.09.953 1.7 1.16.289.0977.586.0937.879.121.141.0156.5.16.508-.188v-.453c.01-.34 0-.684 0-1.03v-3.84l1.65 1.34v5.32s-14 .004-14.1.004c-.047 0-.145-.125-.184-.16-.152-.133-.309-.27-.461-.402-.355-.309-.707-.617-1.06-.926-.082-.0742-.168-.144-.254-.219z"/>
              <path d="m5.88 5.35s1.09.0664 1.75.0664h1.65v5.18l11.8-9.93-11.8-10.1v5.49l-13.8-.168-.098.215 4.64 4.69s1.28 1.27 2.69 2.5 2.41 1.95 2.41 1.95z"/>
            </g>

            {/* Circle and rectangles */}
            <g id="circle" style={{ transform: 'translate(-150px, -160px)' }}>
              <path cx="150.45" cy="161.55" r="84.076797" d="M 234.52679,161.55 A 84.076797,84.076797 0 0 1 150.45,245.6268 84.076797,84.076797 0 0 1 66.373199,161.55 84.076797,84.076797 0 0 1 150.45,77.473206 84.076797,84.076797 0 0 1 234.52679,161.55 Z"/>
            </g>

            <g id="rectHleft">
              <path d="m-22.4-9.55s22.9 9.15 44.7 0c-2.41 5.55-2.64 13.9-.624 19.1-.158.158-19.8-8.2-44.7 0 3.17-4.85 3.33-12.9.002-19.1z"/>
            </g>

            <g id="rectHright" transform="rotate(180)">
              <path d="m-22.4-9.55s22.9 9.15 44.7 0c-2.41 5.55-2.64 13.9-.624 19.1-.158.158-19.8-8.2-44.7 0 3.17-4.85 3.33-12.9.002-19.1z"/>
            </g>

            <g id="rectV">
              <path d="m-17-26s19.6 25.5 0 52c.631-.631 18.1-8.98 33.1-.312-.315 0-19.6-25.8 0-51.4 0-.315-16.6 9.22-33.1-.312z"/>
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
          
          <g transform="translate(150 0) scale(0.9)">
            {/* Background layer (circles) */}
            {center_major.map((_, i) => (
              <g key={`circle-${i}`} className="tona" transform={`translate(0 ${(i+1)*90})`}>
                {i !== 0 && i !== center_major.length - 1 && (
                  <use className="braidBack greenCircle" href="#circle"/>
                )}
              </g>
            ))}

            {/* Intermediate layer (arrows and links) */}
            {center_major.map((_, i) => (
              <g key={`links-${i}`} className="tona simpleShape" transform={`translate(0 ${(i+1)*90})`}>
                {/* Links between bubbles */}
                {i !== center_major.length - 1 && (
                  <use className="rect-arrow" href="#rectV" transform="translate(0 45)"/>
                )}
                {i !== 0 && i !== center_major.length - 1 && (
                  <>
                    <use className="rect-arrow" href="#rectHright" transform="translate(50 0)"/>
                    <use className="rect-arrow" href="#rectHleft" transform="translate(-50 0)"/>
                  </>
                )}

                {/* Arrows */}
                {i !== 0 && i !== center_major.length - 1 && (
                  <>
                    <g id={`arrowsR_${i}`} className={getArrowClass(right_up[i-1], 'up', right_down[i-1], 'down', center_major[i], 'major', center_minor[i], 'minor')}>
                      <use className="arrows-2" href="#arrowR" transform="translate(45 0)"/>
                    </g>
                    <g id={`arrowsL_${i}`} className={getArrowClass(left_up[i-1], 'up', left_down[i-1], 'down', center_major[i], 'major', center_minor[i], 'minor')}>
                      <use className="arrows-2" href="#arrowL" transform="translate(-46 0)"/>
                    </g>
                  </>
                )}
                {i !== center_major.length - 1 && (
                  <g id={`arrows_${i}`} className={getArrowClass(center_major[i], 'major', center_minor[i], 'minor', center_major[i+1], 'major', center_minor[i+1], 'minor')}>
                    <use className="arrows-2" href="#arrow" transform="translate(0 45)"/>
                  </g>
                )}
              </g>
            ))}

            {/* Foreground layer (bubbles) */}
            {center_major.map((_, i) => (
              <g key={`bubbles-${i}`} className="tona simpleShape" transform={`translate(0 ${(i+1)*90})`}>
                {/* Center bubble */}
                <g id={`center_bubble_${i}`} className="medBubble">
                  <g 
                    id={`center_bubble_left_${i}`} 
                    className="bub"
                    onClick={(e) => handleChordClick(center_major[i], e)}
                  >
                    <use href="#leftCommaXL" className={getBubbleClass(center_major[i], 'major')} />
                    <text 
                      className={displayRoman ? 'left duo roman' : 'left duo'} 
                      x={displayRoman ? '0' : '-5'} 
                      y="-6"
                    >
                      {displayRoman ? romanTonalSet.center_major[i] : center_major[i]},major
                    </text>
                  </g>
                  <g 
                    id={`center_bubble_right_${i}`} 
                    className="bub"
                    onClick={(e) => handleChordClick(center_minor[i], e)}
                  >
                    <use href="#rightCommaXL" className={getBubbleClass(center_minor[i], 'minor')} />
                    <text 
                      className={displayRoman ? 'right duo roman' : 'right duo'} 
                      x="0" 
                      y="19"
                    >
                      {displayRoman ? romanTonalSet.center_minor[i] : center_minor[i]}
                    </text>
                  </g>
                </g>

                {/* Green bubbles close to center */}
                {i !== 0 && i !== center_major.length - 1 && (
                  <>
                    <g className="smallBubble" transform="translate(-85 0)">
                      <g 
                        id={`left_bubble_up_${i}`} 
                        className="bub"
                        onClick={(e) => handleChordClick(left_up[i-1], e)}
                      >
                        <use href="#leftCommaSM" className={getBubbleClass(left_up[i-1], 'up')} />
                        <text 
                          className={displayRoman ? 'duo roman' : 'duo'} 
                          x="-20" 
                          y="-4"
                        >
                          {displayRoman ? romanTonalSet.left_up[i-1] : left_up[i-1]},up
                        </text>
                      </g>
                      <g 
                        id={`left_bubble_down_${i}`} 
                        className="bub"
                        onClick={(e) => handleChordClick(left_down[i-1], e)}
                      >
                        <use href="#rightCommaSM" className={getBubbleClass(left_down[i-1], 'down')} />
                        <text 
                          className={displayRoman ? 'duo roman' : 'duo'} 
                          x="-5" 
                          y="16"
                        >
                          {displayRoman ? romanTonalSet.left_down[i-1] : left_down[i-1]},down
                        </text>
                      </g>
                    </g>
                    <g className="smallBubble" transform="translate(90 0)">
                      <g 
                        id={`right_bubble_up_${i}`} 
                        className="bub"
                        onClick={(e) => handleChordClick(right_up[i-1], e)}
                      >
                        <use href="#leftCommaSM" className={getBubbleClass(right_up[i-1], 'up')} />
                        <text 
                          className={displayRoman ? 'duo roman' : 'duo'} 
                          x={displayRoman ? '-22' : '-20'} 
                          y="-4"
                        >
                          {displayRoman ? romanTonalSet.right_up[i-1] : right_up[i-1]},up
                        </text>
                      </g>
                      <g 
                        id={`right_bubble_down_${i}`} 
                        className="bub"
                        onClick={(e) => handleChordClick(right_down[i-1], e)}
                      >
                        <use href="#rightCommaSM" className={getBubbleClass(right_down[i-1], 'down')} />
                        <text 
                          className={displayRoman ? 'duo roman' : 'duo'} 
                          x="0" 
                          y="16"
                        >
                          {displayRoman ? romanTonalSet.right_down[i-1] : right_down[i-1]},down
                        </text>
                      </g>
                    </g>
                  </>
                )}

                {/* Red bubbles outer ones */}
                {i !== center_major.length - 2 && i !== center_major.length - 1 && (
                  <>
                    <g id={`outer_${i}`} className="smallBubble outer" transform="translate(-130 45)">
                      <g 
                        id={`fifth_left_bubble_up_${i}`} 
                        className="bub"
                        onClick={(e) => handleChordClick(outer_left_up[i], e)}
                      >
                        <use href="#leftCommaSM" className={getBubbleClass(outer_left_up[i], 'up')} />
                        <text 
                          className={displayRoman ? 'duo roman' : 'duo'} 
                          x="-22" 
                          y="-4"
                        >
                          {displayRoman ? romanTonalSet.outer_left_up[i] : outer_left_up[i]},up
                        </text>
                      </g>
                      <g 
                        id={`fifth_left_bubble_down_${i}`} 
                        className="bub"
                        onClick={(e) => handleChordClick(outer_left_down[i], e)}
                      >
                        <use href="#rightCommaSM" className={getBubbleClass(outer_left_down[i], 'down')} />
                        <text 
                          className={displayRoman ? 'duo roman' : 'duo'} 
                          x={displayRoman ? '-5' : '-3'} 
                          y="14"
                        >
                          {displayRoman ? romanTonalSet.outer_left_down[i] : outer_left_down[i]},down
                        </text>
                      </g>
                    </g>
                    <g className="smallBubble outer" transform="translate(130 45)">
                      <g 
                        id={`fifth_right_bubble_up_${i}`} 
                        className="bub"
                        onClick={(e) => handleChordClick(outer_right_up[i], e)}
                      >
                        <use href="#leftCommaSM" className={getBubbleClass(outer_right_up[i], 'up')} />
                        <text 
                          className={displayRoman ? 'duo roman' : 'duo'} 
                          x={displayRoman ? '-25' : '-22'} 
                          y="-4"
                        >
                          {displayRoman ? romanTonalSet.outer_right_up[i] : outer_right_up[i]},up
                        </text>
                      </g>
                      <g 
                        id={`fifth_right_bubble_down_${i}`} 
                        className="bub"
                        onClick={(e) => handleChordClick(outer_right_down[i], e)}
                      >
                        <use href="#rightCommaSM" className={getBubbleClass(outer_right_down[i], 'down')} />
                        <text 
                          className={displayRoman ? 'duo roman' : 'duo'} 
                          x={displayRoman ? '-5' : '-2'} 
                          y="13"
                        >
                          {displayRoman ? romanTonalSet.outer_right_down[i] : outer_right_down[i]},down
                        </text>
                      </g>
                    </g>
                  </>
                )}
              </g>
            ))}
          </g>
        </svg>
      </div>

      {/* Controls */}
      <div className="braid-controls">
        <select 
          value={tonality} 
          onChange={(e) => setTonality(e.target.value)}
          className="tonality-select"
        >
          {Object.keys(tonalities || {}).filter(key => key !== 'roman' && key !== 'empty').map(key => (
            <option key={key} value={key}>{key}</option>
          ))}
        </select>
        
        <button 
          onClick={() => setDisplayRoman(!displayRoman)}
          className="roman-toggle"
        >
          {displayRoman ? 'Show Notes' : 'Show Roman'}
        </button>
      </div>
    </div>
  );
};

export default NovaxeBraid; 