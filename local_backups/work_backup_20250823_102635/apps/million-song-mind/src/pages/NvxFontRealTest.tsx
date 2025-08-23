import React from 'react';
import { NvxText, NvxSvgText } from '../components/NvxText';
import { NVX_CHORD_MAPPINGS, getExpectedOutput } from '../utils/nvxChordMapping';

export const NvxFontRealTest: React.FC = () => {
    // Test strings based on your actual discovery
    const testStrings = [
        'blbb7b5',      // German 6th down -> B♭♭⁷♭⁵
        'Ibb7bb3',      // Roman numeral -> I♭♭⁷♭♭³ 
        'Ab7b5',        // Fr43 up -> A♭⁷♭⁵
        'Abb7bb3',      // Ger6 up -> A♭♭⁷♭♭³
        'bb7',          // Flat 7 -> ♭⁷
        'b5',           // Flat 5 -> ♭⁵
        'bb3',          // Double flat 3 -> ♭♭³
        '#',            // Sharp -> ♯
        'b',            // Flat -> ♭
        'l',            // Half-diminished -> ø
    ];

    return (
        <div className="p-8 space-y-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Real nvxFont Character System Test</h1>

                {/* Header with your discovery */}
                <div className="bg-green-50 dark:bg-green-950 p-6 rounded-lg mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-green-800 dark:text-green-200">
                        🎯 Breakthrough Discovery
                    </h2>
                    <p className="text-green-700 dark:text-green-300 mb-4">
                        Your screenshot revealed the actual character mapping system! The font uses specific
                        keyboard sequences that render as musical notation with proper superscripts and subscripts.
                    </p>
                    <div className="font-mono text-sm bg-green-100 dark:bg-green-900 p-3 rounded">
                        Original input: "blbb7b5 Ibb7bb3 # b l Ab7b5 Abb7bb3"
                    </div>
                </div>

                {/* Real Character Test Grid */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-semibold">Real Character Mapping Tests</h2>

                    <div className="grid gap-4">
                        <div className="grid grid-cols-5 gap-4 font-semibold text-sm">
                            <div>Input</div>
                            <div>HTML Render</div>
                            <div>SVG Render</div>
                            <div>Expected</div>
                            <div>Description</div>
                        </div>

                        {testStrings.map((testStr, i) => {
                            const mapping = NVX_CHORD_MAPPINGS.find(m => m.input === testStr);
                            const expected = getExpectedOutput(testStr);

                            return (
                                <div key={i} className="grid grid-cols-5 gap-4 p-3 border rounded hover:bg-muted/50">
                                    <code className="text-sm bg-muted p-1 rounded font-mono">
                                        "{testStr}"
                                    </code>

                                    <div className="text-lg">
                                        <NvxText debug={true}>{testStr}</NvxText>
                                    </div>

                                    <div>
                                        <svg width="80" height="30">
                                            <NvxSvgText x={5} y={20} fontSize={18} debug={true}>
                                                {testStr}
                                            </NvxSvgText>
                                        </svg>
                                    </div>

                                    <div className="text-lg font-semibold">
                                        {expected}
                                    </div>

                                    <div className="text-sm text-muted-foreground">
                                        {mapping?.description || 'Basic symbol'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Your Original Discovery String */}
                <div className="mt-8 space-y-4">
                    <h2 className="text-2xl font-semibold">Your Complete Discovery String</h2>
                    <div className="p-6 border-2 border-primary rounded-lg bg-card">
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold mb-2">HTML Render:</h3>
                                <div className="text-2xl p-4 bg-muted rounded">
                                    <NvxText debug={true}>blbb7b5 Ibb7bb3 # b l Ab7b5 Abb7bb3</NvxText>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">SVG Render:</h3>
                                <svg width="600" height="60" className="border bg-muted rounded">
                                    <NvxSvgText x={20} y={35} fontSize={24} debug={true}>
                                        blbb7b5 Ibb7bb3 # b l Ab7b5 Abb7bb3
                                    </NvxSvgText>
                                </svg>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">Expected Output:</h3>
                                <div className="text-2xl p-4 bg-muted rounded font-serif">
                                    {getExpectedOutput('blbb7b5 Ibb7bb3 # b l Ab7b5 Abb7bb3')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Font Loading Status */}
                <div className="mt-8 p-4 bg-muted rounded">
                    <h3 className="font-semibold mb-2">Font Loading Status</h3>
                    <div id="font-status">Checking font loading...</div>
                </div>
            </div>
        </div>
    );
};

export default NvxFontRealTest;
