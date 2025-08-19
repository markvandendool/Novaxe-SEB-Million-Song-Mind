import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BraidTonal from '@/components/braid/BraidTonal';
import BraidTextSwitcher from '@/components/braid/BraidTextSwitcher';

export default function IntegrationTestSimple() {
  // Control states
  const [skinEnabled, setSkinEnabled] = useState(true);
  const [displayEnabled, setDisplayEnabled] = useState(true);
  const [emphasisEnabled, setEmphasisEnabled] = useState(false);
  const [zoom, setZoom] = useState([1.0]);
  const [selectedKey, setSelectedKey] = useState('C');
  const [useRoman, setUseRoman] = useState(false);

  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Classic Tonality Braid - Full Integration Test
        </h1>

        {/* Control Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          {/* SKIN Panel */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-green-400">SKIN</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm">Skin Display</span>
                <Switch
                  checked={skinEnabled}
                  onCheckedChange={setSkinEnabled}
                />
              </div>
            </CardContent>
          </Card>

          {/* DISPLAY Panel */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-blue-400">DISPLAY</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Display Mode</span>
                <Switch
                  checked={displayEnabled}
                  onCheckedChange={setDisplayEnabled}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm">Key Selection</label>
                <Select value={selectedKey} onValueChange={setSelectedKey}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {keys.map(key => (
                      <SelectItem key={key} value={key}>{key}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* EMPHASIS Panel */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-yellow-400">EMPHASIS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Emphasis Mode</span>
                <Switch
                  checked={emphasisEnabled}
                  onCheckedChange={setEmphasisEnabled}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm">Zoom Level: {zoom[0].toFixed(1)}x</label>
                <Slider
                  value={zoom}
                  onValueChange={setZoom}
                  min={0.5}
                  max={3.0}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Text Switcher */}
        <div className="mb-6">
          <BraidTextSwitcher onRomanChange={setUseRoman} />
        </div>

        {/* Main Tonal Braid Display */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-purple-400 text-center">
              Classic Tonal Braid - Key of {selectedKey}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="flex justify-center items-center overflow-auto"
              style={{
                height: '80vh',
                transform: `scale(${zoom[0]})`,
                transformOrigin: 'center center'
              }}
            >
              <BraidTonal
                focusKey={selectedKey}
                zoom={zoom[0]}
                displayRoman={useRoman}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
