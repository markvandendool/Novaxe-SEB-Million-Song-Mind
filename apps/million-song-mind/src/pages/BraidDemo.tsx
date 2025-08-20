import React, { useState } from 'react';
import MusicalBubbles from '@/components/MusicalBubbles';
import { BraidChord } from '@/components/BraidChord';

// All available keys from the original braid_tonalities.json
const AVAILABLE_KEYS = [
  'C', 'C#', 'D', 'Db', 'E', 'Eb', 'F', 'F#', 
  'G', 'Gb', 'A', 'Ab', 'B', 'Bb', 'Cb', 'roman'
];

/**
 * BraidDemo - Complete demonstration of the authentic Novaxe SEB vertical braided system
 * Features:
 * - Authentic vertical elongated layout matching original screenshots
 * - Interwoven diamond patterns with green connecting bands
 * - All original musical keys and progressions from braid_tonalities.json
 * - Roman numeral notation (original feature)
 * - Interactive bubble system with authentic musical progressions
 * - Real nvxChord font rendering with authentic visual structure
 */
const BraidDemo: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState<string>('C');
  const [displayAsRoman, setDisplayAsRoman] = useState<boolean>(false);
  const [selectedBubble, setSelectedBubble] = useState<{position: string, value: string} | null>(null);
  
  const handleBubbleClick = (position: string, value: string) => {
    setSelectedBubble({ position, value });
    console.log(`Clicked bubble at ${position}: ${value}`);
  };
  
  const handleKeyChange = (key: string) => {
    setSelectedKey(key);
    setDisplayAsRoman(key === 'roman');
  };
  
  return (
    <div className="braid-demo">
      <div className="demo-header" style={{ marginBottom: '20px' }}>
        <h1 style={{ 
          fontFamily: 'nvxChord, REAL_NOVAXE_FONT, music-font, monospace',
          fontSize: '2.5em',
          color: '#333',
          marginBottom: '10px',
          textAlign: 'center'
        }}>
          Novaxe SEB - Authentic Vertical Braided System
        </h1>
        
        <p style={{ 
          color: '#666', 
          marginBottom: '20px', 
          textAlign: 'center',
          fontSize: '1.1em',
          lineHeight: '1.6'
        }}>
          Restored from the original Angular component with authentic vertical braided layout, 
          interwoven diamond patterns, real Font Jan16.otf rendering, and complete braid_tonalities.json data.
        </p>
        
        {/* Key Selection */}
        <div className="key-selector" style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold', marginRight: '10px' }}>
            Musical Key:
          </label>
          <select 
            value={selectedKey}
            onChange={(e) => handleKeyChange(e.target.value)}
            style={{
              padding: '5px 10px',
              fontSize: '14px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          >
            {AVAILABLE_KEYS.map(key => (
              <option key={key} value={key}>
                {key === 'roman' ? 'Roman Numerals' : `${key} Major`}
              </option>
            ))}
          </select>
        </div>
        
        {/* Roman Notation Toggle */}
        <div className="roman-toggle" style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={displayAsRoman}
              onChange={(e) => setDisplayAsRoman(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Display as Roman Numerals (Original Novaxe Feature)
          </label>
        </div>
      </div>
      
      {/* Main Braid Display */}
      <div className="braid-container" style={{ 
        backgroundColor: '#0f0f0f',
        padding: '30px',
        borderRadius: '12px',
        border: '2px solid #22c55e',
        marginBottom: '20px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
      }}>
        <MusicalBubbles
          currentKey={displayAsRoman ? 'roman' : selectedKey}
          displayAsRoman={displayAsRoman}
          onBubbleClick={handleBubbleClick}
          className="main-braid"
        />
      </div>
      
      {/* Selected Bubble Info */}
      {selectedBubble && (
        <div className="selection-info" style={{
          backgroundColor: '#e3f2fd',
          padding: '15px',
          borderRadius: '6px',
          marginBottom: '20px',
          border: '1px solid #bbdefb'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>
            Selected Bubble
          </h3>
          <p><strong>Position:</strong> {selectedBubble.position}</p>
          <p><strong>Value:</strong> 
            <span style={{ 
              fontFamily: 'nvxChord, REAL_NOVAXE_FONT, music-font, monospace',
              fontSize: '1.2em',
              marginLeft: '8px',
              color: '#333'
            }}>
              {selectedBubble.value}
            </span>
          </p>
          
          {/* Render as BraidChord if it's a musical note/chord */}
          {selectedBubble.value && (
            <div style={{ marginTop: '10px' }}>
              <strong>Font Rendering:</strong>
              <div style={{ marginLeft: '10px', marginTop: '5px' }}>
                <BraidChord 
                  chord={selectedBubble.value}
                  active={true}
                  debug={true}
                />
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Authentic Features Documentation */}
      <div className="features-info" style={{
        backgroundColor: '#fff3e0',
        padding: '20px',
        borderRadius: '6px',
        border: '1px solid #ffcc02'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#f57c00' }}>
          Authentic Novaxe SEB Features Restored
        </h3>
        
        <ul style={{ margin: '0', paddingLeft: '20px', color: '#666' }}>
          <li><strong>Authentic Vertical Layout:</strong> Elongated braided pattern matching original screenshots</li>
          <li><strong>Interwoven Diamond Patterns:</strong> Green and blue connecting bands creating true "braid" visual</li>
          <li><strong>Real Font Jan16.otf:</strong> Original 135,500-byte musical font from assets/fonts</li>
          <li><strong>Complete Tonality System:</strong> All 16 musical keys + Roman numeral notation</li>
          <li><strong>7-Row Bubble Layout:</strong> Vertical chain with authentic musical relationships</li>
          <li><strong>Musical Progressions:</strong> Original arrays from braid_tonalities.json (209 lines)</li>
          <li><strong>Interactive System:</strong> Click bubbles to explore musical relationships</li>
          <li><strong>Authentic Mapping:</strong> Outer/inner columns, center major/minor split</li>
          <li><strong>Visual Effects:</strong> Shadows, highlights, and hover interactions</li>
          <li><strong>Font Rendering:</strong> nvxChord family with real musical glyphs</li>
        </ul>
        
        <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fff8e1', borderRadius: '4px' }}>
          <strong>Visual Structure Note:</strong> This implementation now matches the authentic Novaxe 
          vertical braided layout with interwoven diamond patterns and connecting bands, creating 
          the true "braid" appearance seen in the original screenshots. The 7-row vertical chain 
          with green/blue weaving patterns recreates the exact visual structure of the original system.
        </div>
      </div>
    </div>
  );
};

export default BraidDemo;
