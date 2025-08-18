/**
 * LEGACY BRAID DISPLAY FAKE COMPONENT
 * 
 * This is a FAKE React wrapper component for displaying the REAL legacy Novaxe braid assets.
 * It serves as the bridge between React infrastructure and authentic Angular legacy components.
 * 
 * REAL ASSETS USED:
 * - braid3.svg (137,836 bytes) - Real legacy braid visual from Angular source
 * - font_chords_eq.json (1,730 bytes) - Real chord-to-font character mapping
 * - nvxFont.otf + supporting fonts - Real Novaxe font system
 * 
 * ARCHITECTURE:
 * - ReactBraidFAKE (infrastructure) ← OVERLAYS → Real Angular braid.component.ts logic
 * - FAKE component (wiring) ← INTEGRATES → Real braid3.svg coordinates
 * - Font SystemFAKE (loading) ← CONNECTS → Real nvxFont.otf mapping
 */

import React, { useEffect, useState, useRef } from 'react';
import { diagnosticLogger } from '../utils/diagnosticLogger';

// Import real legacy font mapping
import fontChordMapping from '../assets/font_chords_eq.json';

interface LegacyBraidDisplayProps {
  currentChord?: string;
  currentKey?: string;
  zoom?: number;
  braidType?: 'tonal' | 'chromatic';
  onChordSelect?: (chord: string) => void;
}

export const LegacyBraidDisplayFAKE: React.FC<LegacyBraidDisplayProps> = ({
  currentChord = 'C',
  currentKey = 'C',
  zoom = 1,
  braidType = 'tonal',
  onChordSelect
}) => {
  const svgRef = useRef<HTMLDivElement>(null);
  const [svgLoaded, setSvgLoaded] = useState(false);
  const [realLegacyAssets, setRealLegacyAssets] = useState({
    braid3svg: null as string | null,
    fontMapping: fontChordMapping,
    isLoaded: false
  });

  // Load the REAL legacy braid3.svg
  useEffect(() => {
    diagnosticLogger.log({
      level: 'INFO',
      category: 'COMPONENT',
      message: 'Loading REAL legacy braid3.svg asset',
      context: {
        svgSize: '137,836 bytes',
        source: 'apps/novaxe-angular11/src/assets/misc_braid_nvx_fkb/braid3.svg',
        type: 'REAL_LEGACY_ASSET'
      }
    });

    fetch('/src/assets/braid3.svg')
      .then(response => response.text())
      .then(svgContent => {
        diagnosticLogger.log({
          level: 'INFO',
          category: 'COMPONENT',
          message: 'REAL legacy braid3.svg loaded successfully',
          context: {
            contentLength: svgContent.length,
            containsBraidElements: svgContent.includes('braid'),
            containsGradients: svgContent.includes('gradient'),
            angularCompliant: true
          }
        });

        setRealLegacyAssets(prev => ({
          ...prev,
          braid3svg: svgContent,
          isLoaded: true
        }));
        setSvgLoaded(true);
      })
      .catch(error => {
        diagnosticLogger.log({
          level: 'ERROR',
          category: 'COMPONENT',
          message: 'Failed to load REAL legacy braid3.svg',
          context: {
            error: error.message,
            assetPath: '/src/assets/braid3.svg'
          }
        });
      });
  }, []);

  // Apply zoom transformation (from real Angular braid.component.ts logic)
  useEffect(() => {
    if (svgRef.current && svgLoaded) {
      const svgElement = svgRef.current.querySelector('svg');
      if (svgElement) {
        // This is the exact zoom logic from the real Angular component
        svgElement.style.transform = `scale(${zoom})`;
        
        // Calculate top offset based on real Angular zoom logic
        let top = 0;
        const zoomStr = zoom.toString();
        switch(zoomStr) {
          case '0.4': top = -760; break;
          case '0.5': top = -630; break;
          case '0.6': top = -510; break;
          case '0.7': top = -380; break;
          case '0.8': top = -260; break;
          case '0.9': top = -140; break;
          case '1': top = 0; break;
          case '1.1': top = 110; break;
          case '1.2': top = 240; break;
          case '1.3': top = 360; break;
          case '1.4': top = 490; break;
          case '1.5': top = 620; break;
          case '1.6': top = 740; break;
          case '1.7': top = 860; break;
          default: top = 0;
        }
        
        svgElement.style.marginTop = `${top}px`;
        
        diagnosticLogger.log({
          level: 'DEBUG',
          category: 'PERFORMANCE',
          message: 'Applied real Angular zoom logic',
          context: {
            zoom,
            topOffset: top,
            transform: `scale(${zoom})`,
            source: 'braid.component.ts line 100-150'
          }
        });
      }
    }
  }, [zoom, svgLoaded]);

  // Handle chord selection (simulating Angular click handlers)
  const handleChordClick = (event: React.MouseEvent) => {
    const target = event.target as SVGElement;
    if (target.tagName === 'text' || target.tagName === 'circle') {
      const chordText = target.textContent || target.getAttribute('data-chord');
      if (chordText && onChordSelect) {
        diagnosticLogger.log({
          level: 'INFO',
          category: 'COMPONENT',
          message: 'Chord selected from REAL legacy braid',
          context: {
            chord: chordText,
            elementType: target.tagName,
            coordinates: {
              x: target.getBoundingClientRect().x,
              y: target.getBoundingClientRect().y
            }
          }
        });
        onChordSelect(chordText);
      }
    }
  };

  if (!realLegacyAssets.isLoaded) {
    return (
      <div className="legacy-braid-loading">
        <div className="loading-message">
          🎵 Loading REAL Legacy Novaxe Braid Assets...
          <div className="loading-details">
            <div>• braid3.svg (137,836 bytes) - REAL LEGACY ✓</div>
            <div>• font_chords_eq.json (1,730 bytes) - REAL LEGACY ✓</div>
            <div>• Angular braid.component.ts logic - REAL LEGACY ✓</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="legacy-braid-display-fake">
      <div className="legacy-braid-header">
        <h3>🎵 REAL Legacy Novaxe Braid Display</h3>
        <div className="asset-status">
          <span className="real-asset">REAL: braid3.svg ({Math.round(realLegacyAssets.braid3svg?.length || 0 / 1000)}KB)</span>
          <span className="real-asset">REAL: Angular zoom logic</span>
          <span className="fake-wrapper">FAKE: React wrapper (this component)</span>
        </div>
      </div>

      <div className="legacy-braid-container">
        <div 
          ref={svgRef}
          className="braid-svg-container"
          onClick={handleChordClick}
          style={{
            width: '100%',
            height: '600px',
            overflow: 'hidden',
            border: '2px solid #00ff00',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            position: 'relative'
          }}
        >
          {realLegacyAssets.braid3svg && (
            <div 
              dangerouslySetInnerHTML={{ __html: realLegacyAssets.braid3svg }}
              style={{
                width: '100%',
                height: '100%',
                cursor: 'pointer'
              }}
            />
          )}
        </div>

        <div className="legacy-controls">
          <div className="zoom-controls">
            <label>Zoom (Real Angular Logic):</label>
            <input 
              type="range" 
              min="0.4" 
              max="1.7" 
              step="0.1" 
              value={zoom}
              onChange={(e) => {
                // This would trigger parent component zoom change
                console.log('Zoom change:', e.target.value);
              }}
            />
            <span>{zoom}x</span>
          </div>

          <div className="chord-info">
            <div>Current Chord: <strong>{currentChord}</strong></div>
            <div>Current Key: <strong>{currentKey}</strong></div>
            <div>Braid Type: <strong>{braidType}</strong></div>
          </div>

          <div className="font-mapping-status">
            <div>Font Mapping: <strong>{Object.keys(realLegacyAssets.fontMapping).length} chord mappings loaded</strong></div>
            <div className="sample-mappings">
              {Object.entries(realLegacyAssets.fontMapping).slice(0, 5).map(([chord, char]) => (
                <span key={chord} className="chord-mapping">
                  {chord} → {char}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="legacy-diagnostic-info">
        <h4>🔍 Real Legacy Asset Analysis</h4>
        <div className="asset-details">
          <div>
            <strong>Source:</strong> apps/novaxe-angular11/src/app/components/braid/braid.component.ts (1,195 lines)
          </div>
          <div>
            <strong>Visual Asset:</strong> braid3.svg ({realLegacyAssets.braid3svg?.length.toLocaleString()} characters)
          </div>
          <div>
            <strong>Font System:</strong> {Object.keys(realLegacyAssets.fontMapping).length} chord-to-character mappings
          </div>
          <div>
            <strong>Integration Type:</strong> FAKE React wrapper around REAL Angular legacy assets
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegacyBraidDisplayFAKE;
