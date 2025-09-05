import React, { useState } from 'react';
import BraidView from '@/components/BraidView';

const BraidTestPage: React.FC = () => {
    const [selectedChords, setSelectedChords] = useState<string[]>([]);
    const [useRoman, setUseRoman] = useState(true);

    const handleChordSelect = (chord: string, isSelected: boolean) => {
        if (isSelected) {
            setSelectedChords(prev => prev.filter(c => c !== chord));
        } else {
            setSelectedChords(prev => [...prev, chord]);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground p-4">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-4">Braid Chord Mapping Test</h1>

                <div className="mb-4 flex items-center gap-4">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={useRoman}
                            onChange={(e) => setUseRoman(e.target.checked)}
                            className="mr-2"
                        />
                        Use Roman Numerals
                    </label>
                    <span className="text-sm text-muted-foreground">
                        Selected: {selectedChords.join(', ') || 'None'}
                    </span>
                </div>

                <div className="border rounded-lg p-4 bg-card">
                    <h2 className="text-xl mb-2">Font Test</h2>
                    <div className="space-y-2">
                        <p className="braid-chord-text text-lg">
                            nvxChord Font Test: I ii iii IV V vi vii° ♭ ♯
                        </p>
                        <p className="chord-label-custom text-lg">
                            chord-label-custom: I ii iii IV V vi vii° ♭ ♯
                        </p>
                        <p style={{ fontFamily: '"REAL_NOVAXE_FONT", monospace' }} className="text-lg">
                            Direct font-family: I ii iii IV V vi vii° ♭ ♯
                        </p>
                    </div>
                </div>

                <BraidView
                    width={800}
                    height={1200}
                    selectedChords={selectedChords}
                    onChordSelect={handleChordSelect}
                    useRoman={useRoman}
                />
            </div>
        </div>
    );
};

export default BraidTestPage;
