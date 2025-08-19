import React, { useState, useCallback, useEffect } from 'react';

interface RealNovaxeBraidProps {
  onBraidTypeChange?: (type: string) => void;
  onTonalityChange?: (tonality: string) => void;
  onRomanToggle?: (displayRoman: boolean) => void;
  onScoreFollowToggle?: (scoreFollow: boolean) => void;
}

const RealNovaxeBraid: React.FC<RealNovaxeBraidProps> = ({
  onBraidTypeChange,
  onTonalityChange,
  onRomanToggle,
  onScoreFollowToggle
}) => {
  const [braidType, setBraidType] = useState('tonal');
  const [tonality, setTonality] = useState('C');
  const [displayRoman, setDisplayRoman] = useState(false);
  const [scoreFollow, setScoreFollow] = useState(true);

  const handleBraidTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setBraidType(newType);
    onBraidTypeChange?.(newType);
  }, [onBraidTypeChange]);

  const handleTonalityChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTonality = e.target.value;
    setTonality(newTonality);
    onTonalityChange?.(newTonality);
  }, [onTonalityChange]);

  const handleRomanToggle = useCallback(() => {
    const newDisplayRoman = !displayRoman;
    setDisplayRoman(newDisplayRoman);
    onRomanToggle?.(newDisplayRoman);
  }, [displayRoman, onRomanToggle]);

  const handleScoreFollowToggle = useCallback(() => {
    const newScoreFollow = !scoreFollow;
    setScoreFollow(newScoreFollow);
    onScoreFollowToggle?.(newScoreFollow);
  }, [scoreFollow, onScoreFollowToggle]);

  return (
    <div style={{ width: '100%', height: '100%', background: '#1a1a1a', position: 'relative', overflow: 'hidden' }}>
      {/* Controls */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '10px',
        borderRadius: '8px',
        color: 'white',
        fontFamily: 'nvxChord, monospace'
      }}>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', textTransform: 'uppercase' }}>
            Braid Type:
          </label>
          <select
            value={braidType}
            onChange={handleBraidTypeChange}
            style={{
              padding: '5px',
              background: '#2a2a2a',
              color: 'white',
              border: '1px solid #444',
              borderRadius: '4px'
            }}
          >
            <option value="tonal">Tonal</option>
            <option value="blues">Blues</option>
          </select>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', textTransform: 'uppercase' }}>
            Tonality:
          </label>
          <select
            value={tonality}
            onChange={handleTonalityChange}
            style={{
              padding: '5px',
              background: '#2a2a2a',
              color: 'white',
              border: '1px solid #444',
              borderRadius: '4px'
            }}
          >
            <option value="C">C</option>
            <option value="G">G</option>
            <option value="D">D</option>
            <option value="A">A</option>
            <option value="E">E</option>
            <option value="B">B</option>
            <option value="F#">F#</option>
            <option value="C#">C#</option>
            <option value="G#">G#</option>
            <option value="D#">D#</option>
            <option value="A#">A#</option>
            <option value="F">F</option>
          </select>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <button
            onClick={handleRomanToggle}
            style={{
              padding: '5px 10px',
              background: displayRoman ? '#00a450' : '#2a2a2a',
              color: 'white',
              border: `1px solid ${displayRoman ? '#00a450' : '#444'}`,
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {displayRoman ? 'Show Notes' : 'Show Roman'}
          </button>
        </div>

        <div>
          <button
            onClick={handleScoreFollowToggle}
            style={{
              padding: '5px 10px',
              background: scoreFollow ? '#00a450' : '#2a2a2a',
              color: 'white',
              border: `1px solid ${scoreFollow ? '#00a450' : '#444'}`,
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {scoreFollow ? 'Score Follow ON' : 'Score Follow OFF'}
          </button>
        </div>
      </div>

      {/* Real Novaxe Braid SVG - This is the actual braid from the Novaxe component */}
      <svg
        id="braid-tonal-svg"
        style={{ width: '100%', height: '100%' }}
        version="1.1"
        viewBox="-10 40 320 1600"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="greenGradient" x1="0.5" x2="0.8" y1="0.1" y2="0.8">
            <stop offset="0%" stopColor="#00a450" />
            <stop offset="100%" stopColor="#416c63" />
          </linearGradient>
          <radialGradient id="greyGradient" x1="0.1" y1="0.1" x2="1" y2="1">
            <stop offset="0%" stopColor="#7f8899" />
            <stop offset="100%" stopColor="#58595b" />
          </radialGradient>
          <filter id="f1">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
          </filter>
          <filter id="f2">
            <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="imgBlur" />
            <feSpecularLighting in="imgBlur" surfaceScale="2" specularConstant=".75" specularExponent="20" lightingColor="#bbbbbb" result="imgSpecular">
              <fePointLight x="-5" y="-100" z="100" />
            </feSpecularLighting>
            <feComposite in="imgSpecular" in2="SourceAlpha" operator="in" result="imgMasked" />
            <feComposite in="SourceGraphic" in2="imgMasked" operator="arithmetic" k1="0" k2="1" k3="2" k4="0" />
          </filter>
          <g id="circle" style={{ transform: 'translate(-150px, -160px)' }}>
            <path cx="150.45" cy="161.55" r="84.076797" d="M 234.52679,161.55 A 84.076797,84.076797 0 0 1 150.45,245.6268 84.076797,84.076797 0 0 1 66.373199,161.55 84.076797,84.076797 0 0 1 150.45,77.473206 84.076797,84.076797 0 0 1 234.52679,161.55 Z" />
          </g>
          <g id="rectV">
            <path d="m-17-26s19.6 25.5 0 52c.631-.631 18.1-8.98 33.1-.312-.315 0-19.6-25.8 0-51.4 0-.315-16.6 9.22-33.1-.312z" />
          </g>
          <g id="arrow">
            <path d="m5.46-8.1-5.75 7.18-5.78-7.19v7.14l5.77 9.14 5.72-8.97z" />
          </g>
        </defs>

        <g transform="translate(150 0) scale(0.9)">
          {/* Center Major */}
          <use className="greenCircle active" href="#circle" transform="translate(0 90)" />
          <text x="150" y="205" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
            {displayRoman ? 'I' : 'C'}
          </text>

          {/* Left Major */}
          <use className="greenCircle" href="#circle" transform="translate(-50 90)" />
          <text x="100" y="205" textAnchor="middle" fill="white" fontSize="12">
            {displayRoman ? 'IV' : 'F'}
          </text>

          {/* Right Major */}
          <use className="greenCircle" href="#circle" transform="translate(50 90)" />
          <text x="200" y="205" textAnchor="middle" fill="white" fontSize="12">
            {displayRoman ? 'V' : 'G'}
          </text>

          {/* Center Minor */}
          <use className="greenCircle active" href="#circle" transform="translate(0 180)" />
          <text x="150" y="295" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
            {displayRoman ? 'vi' : 'Am'}
          </text>

          {/* Left Minor */}
          <use className="greenCircle" href="#circle" transform="translate(-50 180)" />
          <text x="100" y="295" textAnchor="middle" fill="white" fontSize="12">
            {displayRoman ? 'ii' : 'Dm'}
          </text>

          {/* Right Minor */}
          <use className="greenCircle" href="#circle" transform="translate(50 180)" />
          <text x="200" y="295" textAnchor="middle" fill="white" fontSize="12">
            {displayRoman ? 'iii' : 'Em'}
          </text>

          {/* Links */}
          <use className="rect-arrow" href="#rectV" transform="translate(0 135)" />
          <use className="arrows-2" href="#arrow" transform="translate(0 135)" />

          {/* Additional braid elements */}
          <use className="greenCircle" href="#circle" transform="translate(0 270)" />
          <text x="150" y="385" textAnchor="middle" fill="white" fontSize="12">
            {displayRoman ? 'IV' : 'F'}
          </text>

          <use className="greenCircle" href="#circle" transform="translate(0 360)" />
          <text x="150" y="475" textAnchor="middle" fill="white" fontSize="12">
            {displayRoman ? 'V' : 'G'}
          </text>

          <use className="greenCircle" href="#circle" transform="translate(0 450)" />
          <text x="150" y="565" textAnchor="middle" fill="white" fontSize="12">
            {displayRoman ? 'I' : 'C'}
          </text>
        </g>
      </svg>
    </div>
  );
};

export default RealNovaxeBraid; 