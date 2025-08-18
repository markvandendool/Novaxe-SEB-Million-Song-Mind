import React, { useState, useEffect, useCallback } from 'react';

interface ClassicBraidDisplayFAKEProps {
  currentChord: string[];
  chordsInScore: string[];
  tonality: string;
  zoom: number;
  onChordSelect?: (chord: string[]) => void;
}

const ClassicBraidDisplayFAKE: React.FC<ClassicBraidDisplayFAKEProps> = ({
  currentChord,
  chordsInScore, 
  tonality,
  zoom,
  onChordSelect
}) => {
  const [svgContent, setSvgContent] = useState<string>('');

  // Helper functions for tonal braid (the REAL classic tonality braid)
  const getBubbleClass = (chord: string) => {
    const isActive = currentChord.includes(chord);
    const isInScore = chordsInScore.includes(chord);
    
    if (isActive) return 'bubble active';
    if (isInScore) return 'bubble inScore';
    return 'bubble';
  };
  
  const getAdjacentChord = (baseChord: string, position: string): string => {
    const circleOfFifths = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'Ab', 'Eb', 'Bb', 'F'];
    const minorCircle = ['Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'Ebm', 'Bbm', 'Fm', 'Cm', 'Gm', 'Dm'];
    
    const majorIndex = circleOfFifths.indexOf(baseChord);
    const minorIndex = minorCircle.indexOf(baseChord);
    const index = majorIndex >= 0 ? majorIndex : minorIndex;
    const isMinor = minorIndex >= 0;
    
    if (index === -1) return baseChord;
    
    switch (position) {
      case 'left_up':
      case 'right_up':
        return isMinor ? minorCircle[(index - 1 + minorCircle.length) % minorCircle.length] 
                      : circleOfFifths[(index - 1 + circleOfFifths.length) % circleOfFifths.length];
      case 'left_down':
      case 'right_down':
        return isMinor ? circleOfFifths[(index + 1) % circleOfFifths.length]
                      : minorCircle[(index + 1) % minorCircle.length];
      default:
        return baseChord;
    }
  };
  
  const getFifthChord = (baseChord: string, position: string): string => {
    const circleOfFifths = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'Ab', 'Eb', 'Bb', 'F'];
    const minorCircle = ['Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'Ebm', 'Bbm', 'Fm', 'Cm', 'Gm', 'Dm'];
    
    const majorIndex = circleOfFifths.indexOf(baseChord);
    const minorIndex = minorCircle.indexOf(baseChord);
    const index = majorIndex >= 0 ? majorIndex : minorIndex;
    const isMinor = minorIndex >= 0;
    
    if (index === -1) return baseChord;
    
    switch (position) {
      case 'fifth_left_up':
      case 'fifth_right_up':
        return isMinor ? minorCircle[(index - 2 + minorCircle.length) % minorCircle.length]
                      : circleOfFifths[(index - 2 + circleOfFifths.length) % circleOfFifths.length];
      case 'fifth_left_down':
      case 'fifth_right_down':
        return isMinor ? circleOfFifths[(index + 2) % circleOfFifths.length]
                      : minorCircle[(index + 2) % minorCircle.length];
      default:
        return baseChord;
    }
  };

  // Generate the Classic Tonal Braid SVG with Real Angular Logic
  const generateClassicBraidSVG = () => {
    // Real Angular tonal braid data - the honeycomb layout you want
    const centerLeft = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'Ab', 'Eb', 'Bb', 'F'];
    const centerRight = ['Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'Ebm', 'Bbm', 'Fm', 'Cm', 'Gm', 'Dm'];
    
    let bubbleContent = '';
    
    // Generate the tonal braid bubbles (the real classic layout)
    for (let i = 0; i < centerLeft.length; i++) {
      const leftChord = centerLeft[i];
      const rightChord = centerRight[i];
      const leftActive = currentChord.includes(leftChord);
      const rightActive = currentChord.includes(rightChord);
      const yPos = (i + 1) * 90;
      
      // Background circles (only for middle elements)
      if (i !== 0 && i !== centerLeft.length - 1) {
        const isActive = leftActive || rightActive;
        bubbleContent += `
          <g transform="translate(0 ${yPos})">
            <use class="${isActive ? 'greenCircle active' : 'greenCircle'}" href="#circle"/>
          </g>
        `;
      }
      
      // Center major/minor bubble pair
      bubbleContent += `
        <g transform="translate(0 ${yPos})">
          <g class="medBubble">
            <g class="bub ${leftActive ? 'active' : ''}" data-chord="${leftChord}">
              <use href="#leftCommaXL" class="${getBubbleClass(leftChord)}" />
              <text class="left duo" x="-5" y="-6">${leftChord}</text>
            </g>
            <g class="bub ${rightActive ? 'active' : ''}" data-chord="${rightChord}">
              <use href="#rightCommaXL" class="${getBubbleClass(rightChord)}" />
              <text class="right duo" x="0" y="19">${rightChord}</text>
            </g>
          </g>
          
          ${i !== 0 && i !== centerLeft.length - 1 ? `
            <!-- Green bubbles close to center -->
            <g class="smallBubble" transform="translate(-85 0)">
              <g class="bub" data-chord="${getAdjacentChord(leftChord, 'left_up')}">
                <use href="#leftCommaSM" class="${getBubbleClass(getAdjacentChord(leftChord, 'left_up'))}" />
                <text class="duo" x="-20" y="-4">${getAdjacentChord(leftChord, 'left_up')}</text>
              </g>
              <g class="bub" data-chord="${getAdjacentChord(leftChord, 'left_down')}">
                <use href="#rightCommaSM" class="${getBubbleClass(getAdjacentChord(leftChord, 'left_down'))}" />
                <text class="duo" x="-5" y="16">${getAdjacentChord(leftChord, 'left_down')}</text>
              </g>
            </g>
            <g class="smallBubble" transform="translate(90 0)">
              <g class="bub" data-chord="${getAdjacentChord(rightChord, 'right_up')}">
                <use href="#leftCommaSM" class="${getBubbleClass(getAdjacentChord(rightChord, 'right_up'))}" />
                <text class="duo" x="-20" y="-4">${getAdjacentChord(rightChord, 'right_up')}</text>
              </g>
              <g class="bub" data-chord="${getAdjacentChord(rightChord, 'right_down')}">
                <use href="#rightCommaSM" class="${getBubbleClass(getAdjacentChord(rightChord, 'right_down'))}" />
                <text class="duo" x="0" y="16">${getAdjacentChord(rightChord, 'right_down')}</text>
              </g>
            </g>
          ` : ''}
          
          ${i !== centerLeft.length - 2 && i !== centerLeft.length - 1 ? `
            <!-- Red bubbles outer ones -->
            <g class="smallBubble outer" transform="translate(-130 45)">
              <g class="bub" data-chord="${getFifthChord(leftChord, 'fifth_left_up')}">
                <use class="comma" href="#leftCommaSM" class="${getBubbleClass(getFifthChord(leftChord, 'fifth_left_up'))}" />
                <text class="duo" x="-22" y="-4">${getFifthChord(leftChord, 'fifth_left_up')}</text>
              </g>
              <g class="bub" data-chord="${getFifthChord(leftChord, 'fifth_left_down')}">
                <use class="comma" href="#rightCommaSM" class="${getBubbleClass(getFifthChord(leftChord, 'fifth_left_down'))}" />
                <text class="duo" x="-3" y="14">${getFifthChord(leftChord, 'fifth_left_down')}</text>
              </g>
            </g>
            <g class="smallBubble outer" transform="translate(130 45)">
              <g class="bub" data-chord="${getFifthChord(rightChord, 'fifth_right_up')}">
                <use class="comma" href="#leftCommaSM" class="${getBubbleClass(getFifthChord(rightChord, 'fifth_right_up'))}" />
                <text class="duo" x="-22" y="-4">${getFifthChord(rightChord, 'fifth_right_up')}</text>
              </g>
              <g class="bub" data-chord="${getFifthChord(rightChord, 'fifth_right_down')}">
                <use class="comma" href="#rightCommaSM" class="${getBubbleClass(getFifthChord(rightChord, 'fifth_right_down'))}" />
                <text class="duo" x="-2" y="13">${getFifthChord(rightChord, 'fifth_right_down')}</text>
              </g>
            </g>
          ` : ''}
          
          <!-- Links between bubbles -->
          ${i !== centerLeft.length - 1 ? '<use class="rect-arrow" href="#rectV" transform="translate(0 45)"/>' : ''}
          ${i !== 0 && i !== centerLeft.length - 1 ? '<use class="rect-arrow" href="#rectHright" transform="translate(50 0)"/>' : ''}
          ${i !== 0 && i !== centerLeft.length - 1 ? '<use class="rect-arrow" href="#rectHleft" transform="translate(-50 0)"/>' : ''}
        </g>
      `;
    }
    
    return `
    <svg version="1.1" width="100%" viewBox="-10 40 320 1600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          .greenCircle {
            fill: url(#greenGradient);
            opacity: 0.6;
          }
          
          .greenCircle.active {
            fill: url(#greenGradient);
            opacity: 1;
            filter: url(#f2);
          }
          
          .rect-arrow {
            fill: #979da2ff;
            opacity: 0.7;
          }
          
          .bubble {
            fill: url(#greyGradient);
            cursor: pointer;
            transition: all 0.3s ease;
          }
          
          .bubble.active {
            fill: url(#greenGradient);
            filter: url(#f2);
          }
          
          .bubble.inScore {
            fill: url(#greyGradient);
            opacity: 0.8;
          }
          
          .bub {
            cursor: pointer;
          }
          
          .bub:hover .bubble,
          .bub:hover use {
            fill: url(#greenGradient);
            opacity: 0.8;
          }
          
          .duo {
            font-family: 'Arial', sans-serif;
            font-size: 8px;
            fill: white;
            text-anchor: middle;
            pointer-events: none;
          }
          
          .left.duo {
            text-anchor: end;
          }
          
          .right.duo {
            text-anchor: start;
          }
          
          .medBubble .duo {
            font-size: 10px;
            font-weight: bold;
          }
          
          .smallBubble .duo {
            font-size: 7px;
          }
          
          .outer .duo {
            font-size: 6px;
          }
        </style>

        <linearGradient id="greenGradient" x1="0.5" x2="0.8" y1="0.1" y2="0.8">
          <stop offset="0%" stop-color="#00a450"/>
          <stop offset="100%" stop-color="#416c63"/>
        </linearGradient>

        <radialGradient id="greyGradient" x1="0.1" y1="0.1" x2="1" y2="1">
          <stop offset="0%" stop-color="#7f8899"/>
          <stop offset="100%" stop-color="#58595b"/>
        </radialGradient>

        <filter id="f2">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="imgBlur" />
          <feSpecularLighting in="imgBlur" surfaceScale="2" specularConstant=".75"
            specularExponent="20" lighting-color="#bbbbbb" result="imgSpecular">
           <fePointLight x="-5" y="-100" z="100" />
          </feSpecularLighting>
          <feComposite in="imgSpecular" in2="SourceAlpha" operator="in" result="imgMasked" />
          <feComposite in="SourceGraphic" in2="imgMasked"
            operator="arithmetic" k1="0" k2="1" k3="2" k4="0"/>
        </filter>

        <!-- Real Angular braid shapes -->
        <g id="leftCommaXL" style="transform: scale(1.5) translate(-33px, -203px);">
          <path d="m 32.734375,179.20618 c 0,0 12.113735,-0.82137 8.401424,13.54174 -2.342291,6.20927 -8.707643,9.85526 -9.083293,10.09833 -0.68501,0.48614 -8.461794,5.67897 -9.257288,11.5789 -0.352227,3.65595 -0.689274,10.31176 10.020883,11.82129 -9.013122,0.002 -23.157482,-6.89426 -23.144332,-23.81622 0.01445,-18.60061 15.886974,-23.24613 23.062606,-23.22404 z"/>
        </g>

        <g id="rightCommaXL" style="transform: scale(1.5) translate(-33px, -203px);">
          <path d="m 33.024778,226.20487 c 0,0 -13.443364,-0.0489 -9.683064,-13.47923 1.243181,-4.30995 6.111411,-8.15928 9.392661,-10.28428 3.21875,-2.125 6.102754,-5.36321 7.859805,-8.419 4.860534,-14.74796 -6.999423,-14.84859 -6.999423,-14.84859 6.473148,0 21.785508,5.24551 22.271648,23.5419 0.48613,18.29638 -16.172921,23.52203 -22.841627,23.4892 z"/>
        </g>

        <g id="leftCommaSM" style="transform: scale(1.2) translate(-35px, -200px);">
          <path d="m 32.734375,179.20618 c 0,0 12.113735,-0.82137 8.401424,13.54174 -2.342291,6.20927 -8.707643,9.85526 -9.083293,10.09833 -0.68501,0.48614 -8.461794,5.67897 -9.257288,11.5789 -0.352227,3.65595 -0.689274,10.31176 10.020883,11.82129 -9.013122,0.002 -23.157482,-6.89426 -23.144332,-23.81622 0.01445,-18.60061 15.886974,-23.24613 23.062606,-23.22404 z"/>
        </g>

        <g id="rightCommaSM" style="transform: scale(1.2) translate(-35px, -200px);">
          <path d="m 33.024778,226.20487 c 0,0 -13.443364,-0.0489 -9.683064,-13.47923 1.243181,-4.30995 6.111411,-8.15928 9.392661,-10.28428 3.21875,-2.125 6.102754,-5.36321 7.859805,-8.419 4.860534,-14.74796 -6.999423,-14.84859 -6.999423,-14.84859 6.473148,0 21.785508,5.24551 22.271648,23.5419 0.48613,18.29638 -16.172921,23.52203 -22.841627,23.4892 z"/>
        </g>

        <g id="circle" style="transform: translate(-150px, -160px);">
          <circle cx="150.45" cy="161.55" r="84.076797" />
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
      </defs>
      
      <g transform="translate(150 0) scale(${zoom * 0.9})">
        ${bubbleContent}
      </g>
    </svg>
    `;
  };

  // Handle chord selection
  const handleChordClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const bubbleElement = target.closest('[data-chord]');
    
    if (bubbleElement) {
      const chord = bubbleElement.getAttribute('data-chord');
      if (chord && onChordSelect) {
        onChordSelect([chord]);
      }
    }
  }, [onChordSelect]);

  // Generate SVG content when props change
  useEffect(() => {
    const newSvgContent = generateClassicBraidSVG();
    setSvgContent(newSvgContent);
  }, [currentChord, chordsInScore, tonality, zoom]);

  return (
    <div 
      className="classic-braid-display-fake relative w-full h-full overflow-hidden"
      style={{ background: '#1a1a1a', color: 'white' }}
    >
      {/* Real Angular CSS for tonal braid styling - embedded in SVG */}
      <div 
        className="w-full h-full flex items-center justify-center"
        onClick={handleChordClick}
        dangerouslySetInnerHTML={{ __html: svgContent }}
        style={{
          // Add any additional styles here if needed
        }}
      />
      
      {/* Debug info */}
      <div className="absolute top-2 left-2 text-xs text-slate-400 bg-black/50 px-2 py-1 rounded">
        Classic Tonal Braid (Real Angular "tonal" section) | Current: {currentChord.join(', ')} | Zoom: {(zoom * 100).toFixed(0)}%
      </div>
    </div>
  );
};

export default ClassicBraidDisplayFAKE;
