import React, { useState } from 'react';
import { EnhancedBraidChord, EnhancedBraidGrid } from '@/components/EnhancedBraidChord';
import { enhancedBraidMapping } from '@/utils/EnhancedBraidMapping';
import { translateChordToLigature } from '@/utils/EnhancedFontMapper';
import { useGlobalKey } from '@/state/globalKeyStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

/**
 * Enhanced Font & Braid System Demo
 * Showcases ligature fonts, intelligent mapping, and harmonic analysis
 */
export const EnhancedSystemDemo: React.FC = () => {
    const { focusedKey, setTonality } = useGlobalKey();
    const [debug, setDebug] = useState(false);
    const [showFunctions, setShowFunctions] = useState(true);
    const [animationMode, setAnimationMode] = useState<'none' | 'pulse' | 'glow'>('none');
    const [selectedChord, setSelectedChord] = useState<string>('');

    // Sample chords for demonstration
    const sampleChords = [
        'I', 'ii', 'iii', 'IV', 'V', 'vi', 'viiø',
        'I7', 'V7', 'vi7', 'ii7', 'IVmaj7',
        'V/vi', 'V/ii', 'V/IV', 'bVII', 'bII',
        'viiº', 'iiiº', '#ivø', '#vº'
    ];

    // Test keys
    const testKeys = ['C', 'G', 'D', 'A', 'F', 'Bb', 'Eb', 'Am', 'Em', 'Bm', 'Dm', 'Gm'];

    // Generate grid positions for chords
    const chordGrid = sampleChords.map((chord, index) => {
        const angle = (index * 360 / sampleChords.length) * (Math.PI / 180);
        const radius = 150 + (index % 3) * 50; // Three rings
        return {
            chord,
            x: 300 + radius * Math.cos(angle),
            y: 300 + radius * Math.sin(angle),
            active: selectedChord === chord
        };
    });

    const handleChordClick = (chord: string) => {
        setSelectedChord(selectedChord === chord ? '' : chord);
    };

    // Get analysis for selected chord
    const selectedAnalysis = selectedChord ?
        enhancedBraidMapping(selectedChord, focusedKey || 'C') : null;

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">🎵 Enhanced Font & Braid System Demo</CardTitle>
                    <p className="text-muted-foreground">
                        Showcasing ligature-aware font rendering with intelligent harmonic mapping
                    </p>
                </CardHeader>
            </Card>

            {/* Controls */}
            <Card>
                <CardHeader>
                    <CardTitle>Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-4">
                        {/* Key selector */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Key:</label>
                            <div className="flex flex-wrap gap-1">
                                {testKeys.map(key => (
                                    <Button
                                        key={key}
                                        variant={focusedKey === key ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setTonality(key)}
                                    >
                                        {key}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Animation mode */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Animation:</label>
                            <div className="flex gap-1">
                                {(['none', 'pulse', 'glow'] as const).map(mode => (
                                    <Button
                                        key={mode}
                                        variant={animationMode === mode ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setAnimationMode(mode)}
                                    >
                                        {mode}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                            <Switch checked={debug} onCheckedChange={setDebug} />
                            Debug Mode
                        </label>
                        <label className="flex items-center gap-2">
                            <Switch checked={showFunctions} onCheckedChange={setShowFunctions} />
                            Show Functions
                        </label>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chord Grid Visualization */}
                <Card>
                    <CardHeader>
                        <CardTitle>Interactive Chord Braid</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Click chords to see enhanced analysis. Key: <Badge>{focusedKey}</Badge>
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div style={{ height: '600px', position: 'relative' }}>
                            <EnhancedBraidGrid
                                chords={chordGrid}
                                onChordClick={handleChordClick}
                                debug={debug}
                                showHarmonicFunctions={showFunctions}
                                animationMode={animationMode}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Analysis Panel */}
                <div className="space-y-4">
                    {/* Selected Chord Analysis */}
                    {selectedAnalysis && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Chord Analysis</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Original:</label>
                                        <div className="text-lg font-mono">{selectedChord}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Ligature:</label>
                                        <div className="text-lg nvx-ligature-font">{selectedAnalysis.ligatureText}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Function:</label>
                                        <Badge className={`nvx-${selectedAnalysis.harmonicFunction}`}>
                                            {selectedAnalysis.harmonicFunction}
                                        </Badge>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Confidence:</label>
                                        <Badge variant={selectedAnalysis.confidence > 80 ? "default" : "secondary"}>
                                            {selectedAnalysis.confidence}%
                                        </Badge>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Harmonic Slot:</label>
                                    <div className="text-base font-mono">{selectedAnalysis.harmonicSlot}</div>
                                </div>

                                {selectedAnalysis.braidPosition && (
                                    <div>
                                        <label className="text-sm font-medium">Braid Position:</label>
                                        <div className="text-sm">
                                            Ring: {selectedAnalysis.braidPosition.ring},
                                            Angle: {selectedAnalysis.braidPosition.angle}°
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Ligature Sample */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Ligature Font Samples</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {sampleChords.slice(0, 12).map(chord => {
                                    const ligature = translateChordToLigature(chord);
                                    return (
                                        <div key={chord} className="flex items-center justify-between border-b pb-2">
                                            <span className="font-mono text-sm">{chord}</span>
                                            <span className="nvx-ligature-font text-lg">{ligature}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Feature Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Enhanced Features</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2">
                                    <span className="text-green-500">✓</span>
                                    Ligature-aware font rendering with GSUB table support
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-500">✓</span>
                                    Intelligent harmonic function analysis
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-500">✓</span>
                                    3D braid position mapping with ring awareness
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-500">✓</span>
                                    Confidence-based styling and positioning
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-500">✓</span>
                                    Key-aware Roman numeral translation
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-green-500">✓</span>
                                    Enhanced bridge communication with analysis data
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default EnhancedSystemDemo;
