import React, { useEffect, useMemo, useState } from "react";
import { useGlobalKey } from "@/state/globalKeyStore";
import "./BraidTonal.css";

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

const BraidTonal: React.FC = () => {
  // BraidTonal is just a consumer - reads from Novaxe Brain (GlobalKeyProvider), can flip switches
  const { tonality: brainKey, setTonality: setBrainKey } = useGlobalKey();

  const [tonalities, setTonalities] = useState<BraidTonalities | null>(null);
  const [displayRoman, setDisplayRoman] = useState(false);

  // Use Novaxe Brain Key state - extract root from global key
  const tonality = brainKey; // Direct use of global key

  // Function to update global brain key (any component can flip this switch)
  const handleTonalityChange = (newKey: string) => {
    setBrainKey(newKey); // Flip the switch in the global mind
  };

  useEffect(() => {
    fetch("/assets/braid_tonalities.json")
      .then((res) => res.json())
      .then((data) => setTonalities(data));
  }, []);

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
    const romanTonalitySet = tonalities.roman as unknown as TonalSet;

    const getInUse = (noteArr: string[], romanArr: string[], rotation = 0) => {
      const rotatedRoman = rotate(romanArr, rotation);
      return displayRoman ? rotatedRoman : noteArr;
    };

    const isMinor = tonality.endsWith('m');
    const romanRotation = isMinor ? 3 : 0;

    // The original Angular code has a rotation of -3 for roman numerals.
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

      center_left_in_use: getInUse(currentTonalitySet.center_major, romanTonalitySet.center_major, displayRoman ? romanMinorRotation : 0),
      center_right_in_use: getInUse(currentTonalitySet.center_minor, rotate(tonalities.roman.center_minor, romanMinorRotation), displayRoman ? romanMinorRotation : 0),
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


  if (!tonalities) {
    return <div>Loading...</div>;
  }

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
  }

  return (
    <section id="braid-tonal" style={{ display: "block", background: '#343a40', color: 'white' }}>
      <div style={{ position: 'fixed', top: 10, left: 10, zIndex: 1000, background: 'rgba(0,0,0,0.5)', padding: '5px', borderRadius: '5px' }}>
        <select onChange={(e) => handleTonalityChange(e.target.value)} value={tonality}>
          {Object.keys(tonalities).filter(k => k !== 'roman' && k !== 'empty').map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <label style={{ marginLeft: 10 }}>
          <input type="checkbox" checked={displayRoman} onChange={() => setDisplayRoman(!displayRoman)} />
          Display Roman
        </label>
      </div>
      <div className="braid" style={{ width: "100%", height: "100vh" }}>
        <svg version="1.1" width="100%" viewBox="-10 40 320 1600" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
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

          <g transform="translate(150 0) scale(0.9)">
            {/* Background Layer (Circles) */}
            {center_left.map((_, i) => (
              <g key={`bg-circle-${i}`} className="tona" transform={`translate(0, ${(i + 1) * 90})`}>
                <use className="greenCircle" xlinkHref="#circle" />
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
              <g key={`fg-bubble-${i}`} className="tona simpleShape" transform={`translate(0, ${(i + 1) * 90})`}>
                {/* Center Bubble */}
                <g className="medBubble">
                  <g>
                    <use xlinkHref="#leftCommaXL" className={getBubbleClass(center_left[i], "")} />
                    <text className={displayRoman ? "left duo roman" : "left duo"} x={displayRoman ? "0" : "-5"} y="-6">
                      {center_left_in_use[i]}
                    </text>
                  </g>
                  <g>
                    <use xlinkHref="#rightCommaXL" className={getBubbleClass(center_right[i], "m")} />
                    <text className={displayRoman ? "right duo roman" : "right duo"} x="0" y="19">
                      {center_right_in_use[i]}
                    </text>
                  </g>
                </g>

                {/* Side Bubbles */}
                {i > 0 && i < center_left.length - 1 && (
                  <>
                    <g className="smallBubble" transform="translate(-85 0)">
                      <g>
                        <use xlinkHref="#leftCommaSM" className={getBubbleClass(left_up[i - 1], "b7")} />
                        <text className={displayRoman ? "duo roman" : "duo"} x="-20" y="-4">
                          {left_up_in_use[i - 1]}
                        </text>
                      </g>
                      <g>
                        <use xlinkHref="#rightCommaSM" className={getBubbleClass(left_down[i - 1], "mb7b5")} />
                        <text className={displayRoman ? "duo roman" : "duo"} x="-5" y="16">
                          {left_down_in_use[i - 1]}
                        </text>
                      </g>
                    </g>
                    <g className="smallBubble" transform="translate(90 0)">
                      <g>
                        <use xlinkHref="#leftCommaSM" className={getBubbleClass(right_up[i - 1], 'b7')} />
                        <text className={displayRoman ? 'duo roman' : 'duo'} x={displayRoman ? '-22' : '-20'} y="-4">{right_up_in_use[i - 1]}</text>
                      </g>
                      <g>
                        <use xlinkHref="#rightCommaSM" className={getBubbleClass(right_down[i - 1], 'o')} />
                        <text className={displayRoman ? 'duo roman' : 'duo'} x="0" y="16">{right_down_in_use[i - 1]}</text>
                      </g>
                    </g>
                  </>
                )}

                {/* Outer Bubbles */}
                {i < center_left.length - 2 && (
                  <>
                    <g className="smallBubble outer" transform="translate(-130 45)">
                      <g>
                        <use className="comma" xlinkHref="#leftCommaSM" />
                        <text className={displayRoman ? 'duo roman' : 'duo'} x="-22" y="-4">{fifth_left_up_in_use[i]}</text>
                      </g>
                      <g>
                        <use className="comma" xlinkHref="#rightCommaSM" />
                        <text className={displayRoman ? 'duo roman' : 'duo'} x={displayRoman ? '-5' : '-3'} y="14">{fifth_left_down_in_use[i]}</text>
                      </g>
                    </g>
                    <g className="smallBubble outer" transform="translate(130 45)">
                      <g>
                        <use className="comma" xlinkHref="#leftCommaSM" />
                        <text className={displayRoman ? 'duo roman' : 'duo'} x={displayRoman ? '-25' : '-22'} y="-4">{fifth_right_up_in_use[i]}</text>
                      </g>
                      <g>
                        <use className="comma" xlinkHref="#rightCommaSM" />
                        <text className={displayRoman ? 'duo roman' : 'duo'} x={displayRoman ? '-5' : '-2'} y="13">{fifth_right_down_in_use[i]}</text>
                      </g>
                    </g>
                  </>
                )}

              </g>
            ))}
          </g>
        </svg>
      </div>
    </section>
  );
};

export default BraidTonal;