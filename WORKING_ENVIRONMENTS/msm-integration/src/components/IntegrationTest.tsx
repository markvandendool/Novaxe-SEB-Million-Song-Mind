import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BraidTonal from './braid/BraidTonal';
import { BraidTextSwitcher } from './BraidTextSwitcher';
import { useBraidTextSwitching } from '@/hooks/useBraidTextSwitching';

const IntegrationTest: React.FC = () => {
  const [focusKey, setFocusKey] = useState('C');
  const [zoom, setZoom] = useState([1.2]);
  const [autoPlay, setAutoPlay] = useState(false);
  const [selectedChords, setSelectedChords] = useState<string[]>(['C']);

  // Braid controls as shown in screenshot
  const [skin, setSkin] = useState('Classic');
  const [showGrid, setShowGrid] = useState(false);
  const [showScoreChords, setShowScoreChords] = useState(true);
  const [simplifiedBraid, setSimplifiedBraid] = useState(false);
  const [scoreChords, setScoreChords] = useState(true);
  const [diatonicScale, setDiatonicScale] = useState(true);
  const [oneTone, setOneTone] = useState(true);

  // Use the braid text switching hook
  const { mode: braidTextMode, toggleMode: toggleBraidTextMode } = useBraidTextSwitching();
  const displayRoman = braidTextMode === 'roman';

  const intervalRef = useRef<NodeJS.Timeout>();

  const testKeys = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
  const skinOptions = ['Classic', 'Modern', 'Dark', 'Light'];

  // Auto-play through keys
  useEffect(() => {
    if (autoPlay) {
      let keyIndex = 0;
      intervalRef.current = setInterval(() => {
        setFocusKey(testKeys[keyIndex % testKeys.length]);
        keyIndex++;
      }, 2000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoPlay]);

  const handleChordSelect = (chord: string, isSelected: boolean) => {
    if (isSelected) {
      if (!selectedChords.includes(chord)) {
        setSelectedChords([...selectedChords, chord]);
      }
    } else {
      setSelectedChords(selectedChords.filter(c => c !== chord));
    }
    console.log('Chord selected:', chord, 'Selected:', isSelected);
  };

  const handleChordClick = (chord: string) => {
    setSelectedChords([chord]);
    console.log('Chord clicked:', chord);
  };

  return (
    <div className="integration-test bg-gray-900 min-h-screen text-white">

      {/* Top Control Panel - Like in the screenshot */}
      <div className="bg-gray-800 p-4 border-b border-gray-600">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">

          {/* Left side - Braid name and basic info */}
          <div className="flex items-center gap-4">
            <div className="text-lg font-bold text-green-400">
              🎵 {skin} Tonal Braid
            </div>
            <div className="text-sm text-gray-400">
              Key: {focusKey} | Selected: {selectedChords.join(', ') || 'None'}
            </div>
          </div>

          {/* Right side - Main controls in rows */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* SKIN Controls */}
            <Card className="bg-gray-700 border-gray-600">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-300">SKIN</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <select
                  value={skin}
                  onChange={(e) => setSkin(e.target.value)}
                  className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
                >
                  {skinOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </CardContent>
            </Card>

            {/* DISPLAY Controls */}
            <Card className="bg-gray-700 border-gray-600">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-300">DISPLAY</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-400">Show grid</label>
                  <Switch checked={showGrid} onCheckedChange={setShowGrid} />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-400">Show score chords</label>
                  <Switch checked={showScoreChords} onCheckedChange={setShowScoreChords} />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-400">Simplified braid</label>
                  <Switch checked={simplifiedBraid} onCheckedChange={setSimplifiedBraid} />
                </div>
              </CardContent>
            </Card>

            {/* EMPHASIS Controls */}
            <Card className="bg-gray-700 border-gray-600">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-300">EMPHASIS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-400">Score chords</label>
                  <Switch checked={scoreChords} onCheckedChange={setScoreChords} />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-400">Diatonic scale</label>
                  <Switch checked={diatonicScale} onCheckedChange={setDiatonicScale} />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-400">One tone</label>
                  <Switch checked={oneTone} onCheckedChange={setOneTone} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Second row - Key selector, zoom, and text mode */}
        <div className="mt-4 flex flex-col lg:flex-row gap-4 items-start lg:items-center">

          {/* Key Selection */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400">Focus Key:</label>
            <select
              value={focusKey}
              onChange={(e) => setFocusKey(e.target.value)}
              className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
            >
              {testKeys.map(key => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
          </div>

          {/* Zoom Control */}
          <div className="flex items-center gap-2 min-w-[200px]">
            <label className="text-sm text-gray-400">Zoom:</label>
            <Slider
              value={zoom}
              onValueChange={setZoom}
              max={2.5}
              min={0.5}
              step={0.1}
              className="flex-1"
            />
            <span className="text-xs text-gray-400 min-w-[40px]">
              {(zoom[0] * 100).toFixed(0)}%
            </span>
          </div>

          {/* Text Mode Switcher */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400">Text:</label>
            <BraidTextSwitcher
              mode={braidTextMode}
              onModeChange={toggleBraidTextMode}
              compact={true}
            />
          </div>

          {/* Auto Play */}
          <Button
            onClick={() => setAutoPlay(!autoPlay)}
            variant={autoPlay ? "destructive" : "default"}
            size="sm"
            className="text-xs"
          >
            {autoPlay ? 'Stop Auto' : 'Auto Play'}
          </Button>
        </div>
      </div>

      {/* Main Braid Display - MUCH TALLER and scrollable */}
      <div className="flex-1" style={{ height: 'calc(100vh - 200px)' }}>
        <div className="h-full overflow-auto bg-black">
          <BraidTonal
            focusKey={focusKey}
            zoom={zoom[0]}
            onZoomChange={(newZoom) => setZoom([newZoom])}
            onChordClick={handleChordClick}
            onChordSelect={handleChordSelect}
            selectedChords={selectedChords}
            displayRoman={displayRoman}
          />
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="bg-gray-800 p-2 border-t border-gray-600 text-xs text-gray-400">
        <div className="flex justify-between items-center">
          <div>
            Classic Tonal Braid Integration Test | Lovable's React Implementation
          </div>
          <div>
            {selectedChords.length} chord(s) selected | Key: {focusKey} | Zoom: {(zoom[0] * 100).toFixed(0)}% | {displayRoman ? 'Roman' : 'Letters'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationTest;
