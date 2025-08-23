import React from 'react';

const LigatureTestPage: React.FC = () => {
    const testSymbols = [
        { input: '##', expected: 'Double Sharp (single glyph)' },
        { input: 'bb', expected: 'Double Flat (single glyph)' },
        { input: '#', expected: 'Sharp' },
        { input: 'b', expected: 'Flat' },
        { input: 'Ger6', expected: 'German 6th (custom glyph)' },
        { input: 'I', expected: 'Roman I' },
        { input: 'ii', expected: 'Roman ii' },
        { input: 'iii', expected: 'Roman iii' },
        { input: 'IV', expected: 'Roman IV' },
        { input: 'V', expected: 'Roman V' },
        { input: 'vi', expected: 'Roman vi' },
        { input: 'vii°', expected: 'Roman vii diminished' }
    ];

    return (
        <div className="min-h-screen bg-background text-foreground p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Musical Font Ligature Test</h1>

                {/* Font Loading Test */}
                <div className="mb-8 p-4 border rounded bg-card">
                    <h2 className="text-xl mb-4">Font Loading Status</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                        Check browser DevTools Network tab for font loading errors
                    </p>
                    <div className="space-y-2">
                        <p>Font URL: <code>/fonts/nvxFont.otf</code></p>
                        <button
                            onClick={() => fetch('/fonts/nvxFont.otf').then(r => alert(`Font status: ${r.status}`))}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded"
                        >
                            Test Font Loading
                        </button>
                    </div>
                </div>

                {/* Ligature Test Grid */}
                <div className="grid gap-4 mb-8">
                    <h2 className="text-xl font-bold">Ligature Tests</h2>
                    {testSymbols.map((test, i) => (
                        <div key={i} className="grid grid-cols-4 gap-4 p-4 border rounded bg-card">
                            <div className="font-mono">
                                Input: <code>{test.input}</code>
                            </div>
                            <div className="musical-text text-2xl" style={{
                                fontFamily: "nvxChord, monospace",
                                fontFeatureSettings: '"liga" 1, "kern" 1'
                            }}>
                                {test.input}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Expected: {test.expected}
                            </div>
                            <div className="text-xs">
                                {test.input === '##' ? (
                                    test.input.length === 2 ?
                                        <span className="text-red-500">❌ FAIL (2 chars)</span> :
                                        <span className="text-green-500">✅ SUCCESS (ligature)</span>
                                ) : '—'}
                            </div>
                        </div>
                    ))}
                </div>

                {/* SVG Test */}
                <div className="mb-8 p-4 border rounded bg-card">
                    <h2 className="text-xl mb-4">SVG Text Ligature Test</h2>
                    <svg width="400" height="200" className="border">
                        <text
                            x="50" y="50"
                            className="musical-text"
                            style={{
                                fontFamily: "nvxChord, monospace",
                                fontFeatureSettings: '"liga" 1, "kern" 1',
                                fontSize: '24px'
                            }}
                        >
                            ## bb # b Ger6
                        </text>
                        <text
                            x="50" y="100"
                            className="musical-text"
                            style={{
                                fontFamily: "nvxChord, monospace",
                                fontFeatureSettings: '"liga" 1, "kern" 1',
                                fontSize: '20px'
                            }}
                        >
                            I ii iii IV V vi vii°
                        </text>
                        <text x="50" y="150" fill="red" fontSize="12">
                            If ## shows as two characters, ligatures are broken
                        </text>
                    </svg>
                </div>

                {/* CSS Debug Info */}
                <div className="p-4 border rounded bg-card">
                    <h2 className="text-xl mb-4">CSS Debug</h2>
                    <div className="space-y-2 text-sm font-mono">
                        <p>font-family: "nvxChord", monospace</p>
                        <p>font-feature-settings: "liga" 1, "kern" 1</p>
                        <p>font-variant-ligatures: common-ligatures</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LigatureTestPage;
