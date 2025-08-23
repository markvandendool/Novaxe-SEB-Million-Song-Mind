import React, { useEffect, useState } from 'react';

const FontDiagnosticPage: React.FC = () => {
    const [fontStatus, setFontStatus] = useState<string>('Checking...');
    const [fontFeatures, setFontFeatures] = useState<string>('Unknown');

    useEffect(() => {
        // Diagnostic Step 1: Verify Font Loading with Features
        document.fonts.ready.then(() => {
            const font = new FontFace('nvxChord', 'url(/fonts/nvxFont.otf)');

            font.load().then(() => {
                setFontStatus('✅ Font loaded successfully');
                // Check if font features are available
                setFontFeatures(`Features available: ${font.featureSettings || 'None detected'}`);

                // Add loaded font to document
                document.fonts.add(font);

                console.log('Font diagnostic:', {
                    family: font.family,
                    status: font.status,
                    features: font.featureSettings
                });
            }).catch((error) => {
                setFontStatus(`❌ Font loading failed: ${error.message}`);
            });
        });
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <h1 className="text-3xl font-bold">Font Feature Diagnostic</h1>

                {/* Font Loading Status */}
                <div className="p-4 border rounded bg-card">
                    <h2 className="text-xl mb-2">Font Loading Status</h2>
                    <p>{fontStatus}</p>
                    <p className="text-sm text-muted-foreground">{fontFeatures}</p>
                </div>

                {/* Test 1: HTML with CSS Classes */}
                <div className="p-4 border rounded bg-card">
                    <h2 className="text-xl mb-4">Test 1: HTML Text with CSS Classes</h2>
                    <div className="space-y-2">
                        <div className="text-2xl musical-html-test">## bb # b Ger6 I ii iii</div>
                        <p className="text-sm">CSS class application (should work if CSS inheritance works)</p>
                    </div>
                </div>

                {/* Test 2: SVG with CSS Classes */}
                <div className="p-4 border rounded bg-card">
                    <h2 className="text-xl mb-4">Test 2: SVG Text with CSS Classes</h2>
                    <svg width="400" height="100" className="border">
                        <text x="20" y="40" className="musical-svg-css text-2xl">
                            ## bb # b Ger6 I ii iii
                        </text>
                        <text x="20" y="80" fontSize="12" fill="gray">
                            CSS class on SVG text (likely broken)
                        </text>
                    </svg>
                </div>

                {/* Test 3: SVG with Inline Styles */}
                <div className="p-4 border rounded bg-card">
                    <h2 className="text-xl mb-4">Test 3: SVG Text with Inline Styles</h2>
                    <svg width="400" height="100" className="border">
                        <text
                            x="20"
                            y="40"
                            style={{
                                fontFamily: 'nvxChord, monospace',
                                fontSize: '24px',
                                fontFeatureSettings: '"liga" 1, "clig" 1',
                                fontVariantLigatures: 'common-ligatures'
                            }}
                        >
                            ## bb # b Ger6 I ii iii
                        </text>
                        <text x="20" y="80" fontSize="12" fill="gray">
                            Inline styles on SVG text (should work)
                        </text>
                    </svg>
                </div>

                {/* Test 4: Force Feature Activation */}
                <div className="p-4 border rounded bg-card">
                    <h2 className="text-xl mb-4">Test 4: Multiple Feature Activation Methods</h2>
                    <svg width="400" height="120" className="border">
                        <text
                            x="20"
                            y="30"
                            className="force-ligatures"
                            style={{
                                fontFamily: 'nvxChord',
                                fontFeatureSettings: '"liga" on, "clig" on, "dlig" on',
                            }}
                        >
                            ## bb # b Ger6
                        </text>
                        <text
                            x="20"
                            y="60"
                            style={{
                                fontFamily: 'nvxChord',
                                fontVariantLigatures: 'common-ligatures discretionary-ligatures',
                                textRendering: 'optimizeLegibility'
                            }}
                        >
                            ## bb # b Ger6
                        </text>
                        <text x="20" y="100" fontSize="12" fill="gray">
                            Multiple activation methods
                        </text>
                    </svg>
                </div>

                {/* Test 5: REAL Font Character Mapping */}
                <div className="p-4 border rounded bg-card">
                    <h2 className="text-xl mb-4">Test 5: REAL nvxFont Character Mapping</h2>
                    <p className="text-sm text-muted-foreground mb-4">Based on actual font keyboard mapping from text editor</p>
                    <div className="space-y-4">
                        {[
                            { input: 'blbb7b5', expected: 'B♭♭⁷♭⁵ (German 6th down)', description: 'German augmented 6th chord' },
                            { input: 'Ibb7bb3', expected: 'I♭♭⁷♭♭³ (Roman numeral)', description: 'Roman with double flats' },
                            { input: '#', expected: '# (sharp)', description: 'Sharp symbol' },
                            { input: 'b', expected: '♭ (flat)', description: 'Flat symbol' },
                            { input: 'l', expected: 'ø (half-dim)', description: 'Half-diminished' },
                            { input: 'Ab7b5', expected: 'A♭⁷♭⁵ (Fr43 up)', description: 'French augmented 6th chord' },
                            { input: 'Abb7bb3', expected: 'A♭♭⁷♭♭³ (Ger6 up)', description: 'German up position' },
                            { input: 'bb7', expected: '♭⁷ (flat 7)', description: 'Flat with superscript' },
                            { input: 'b5', expected: '♭⁵ (flat 5)', description: 'Flat 5 with superscript' },
                            { input: 'bb3', expected: '♭♭³ (double flat 3)', description: 'Double flat with superscript' }
                        ].map((test, i) => (
                            <div key={i} className="grid grid-cols-4 gap-4 p-2 border-l-2 border-primary">
                                <code className="text-sm bg-muted p-1 rounded">"{test.input}"</code>
                                <span
                                    style={{
                                        fontFamily: 'nvxChord, monospace',
                                        fontSize: '18px',
                                        fontFeatureSettings: '"liga" 1, "clig" 1'
                                    }}
                                >
                                    {test.input}
                                </span>
                                <span className="text-sm">{test.expected}</span>
                                <span className="text-xs text-muted-foreground">{test.description}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Test 6: SVG with Real Mappings */}
                <div className="p-4 border rounded bg-card">
                    <h2 className="text-xl mb-4">Test 6: SVG with REAL Character Mappings</h2>
                    <svg width="600" height="120" className="border">
                        <text
                            x="20"
                            y="30"
                            style={{
                                fontFamily: 'nvxChord, monospace',
                                fontSize: '20px',
                                fontFeatureSettings: '"liga" 1, "clig" 1',
                            }}
                        >
                            blbb7b5 Ibb7bb3 # b l Ab7b5 Abb7bb3
                        </text>
                        <text
                            x="20"
                            y="60"
                            style={{
                                fontFamily: 'nvxChord, monospace',
                                fontSize: '16px',
                                fontFeatureSettings: '"liga" 1, "clig" 1',
                            }}
                        >
                            bb7 b5 bb3 (superscript tests)
                        </text>
                        <text x="20" y="100" fontSize="12" fill="gray">
                            Real font character sequences in SVG
                        </text>
                    </svg>
                </div>                {/* Browser Information */}
                <div className="p-4 border rounded bg-card">
                    <h2 className="text-xl mb-4">Browser Context</h2>
                    <div className="text-sm font-mono space-y-1">
                        <p>User Agent: {navigator.userAgent}</p>
                        <p>Font Support: {document.fonts ? '✅' : '❌'}</p>
                        <p>CSS Font Loading: {'FontFace' in window ? '✅' : '❌'}</p>
                    </div>
                </div>
            </div>

            <style>{`
        .musical-html-test {
          font-family: "nvxChord", monospace;
          font-feature-settings: "liga" 1, "clig" 1;
          font-variant-ligatures: common-ligatures;
        }
        
        .musical-svg-css {
          font-family: "nvxChord", monospace;
          font-feature-settings: "liga" 1, "clig" 1;
          font-variant-ligatures: common-ligatures;
        }
        
        .force-ligatures {
          font-feature-settings: "liga" on, "clig" on !important;
          font-variant-ligatures: common-ligatures !important;
          text-rendering: optimizeLegibility !important;
        }
      `}</style>
        </div>
    );
};

export default FontDiagnosticPage;
