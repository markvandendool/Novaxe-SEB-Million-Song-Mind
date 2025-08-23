import React from 'react';

const FontLigatureComparison: React.FC = () => {
    const testCases = [
        {
            label: 'bb7 (double flat seventh)',
            original: 'bb7',
            transformed: 'll7'
        },
        {
            label: 'b5 (flat fifth)',
            original: 'b5',
            transformed: 'l5'
        },
        {
            label: 'Bb (B flat)',
            original: 'Bb',
            transformed: 'Bl'
        },
        {
            label: 'bbseven (ligature test)',
            original: 'bbseven',
            transformed: 'llseven'
        },
        {
            label: '## (double sharp)',
            original: '##',
            transformed: '##'
        }
    ];

    return (
        <div style={{ padding: '20px' }}>
            <h2>Font Ligature Comparison Test</h2>
            <p>Testing direct vs transformed input to see which renders musical symbols correctly</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                <div>
                    <h3>Direct Input (b characters)</h3>
                    <p style={{ fontSize: '12px', color: '#666' }}>What the font analysis says should work</p>
                </div>
                <div>
                    <h3>Transformed Input (l characters)</h3>
                    <p style={{ fontSize: '12px', color: '#666' }}>What current simpleChord() function produces</p>
                </div>
            </div>

            {testCases.map((testCase, index) => (
                <div key={index} style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '20px',
                    marginBottom: '20px',
                    padding: '15px',
                    border: '1px solid #ddd',
                    borderRadius: '8px'
                }}>
                    {/* Direct input */}
                    <div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                            Input: "{testCase.original}"
                        </div>
                        <div
                            style={{
                                fontFamily: 'nvxChord, monospace',
                                fontSize: '28px',
                                fontFeatureSettings: '"liga" 1',
                                backgroundColor: '#f8f9fa',
                                padding: '10px',
                                border: '1px solid #e9ecef',
                                borderRadius: '4px',
                                minHeight: '60px',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            {testCase.original}
                        </div>
                    </div>

                    {/* Transformed input */}
                    <div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                            Input: "{testCase.transformed}"
                        </div>
                        <div
                            style={{
                                fontFamily: 'nvxChord, monospace',
                                fontSize: '28px',
                                fontFeatureSettings: '"liga" 1',
                                backgroundColor: '#fff3cd',
                                padding: '10px',
                                border: '1px solid #ffeaa7',
                                borderRadius: '4px',
                                minHeight: '60px',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            {testCase.transformed}
                        </div>
                    </div>
                </div>
            ))}

            <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '8px' }}>
                <h3>What to Look For:</h3>
                <ul>
                    <li>If <strong>LEFT side</strong> shows musical symbols (♭♭⁷, ♭⁵, etc.), then direct input works</li>
                    <li>If <strong>RIGHT side</strong> shows musical symbols, then b→l transformation works</li>
                    <li>If neither works, there's a CSS/font loading issue</li>
                </ul>
            </div>

            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '8px' }}>
                <h3>Expected Based on Font Analysis:</h3>
                <p>The nvxFont.otf analysis shows ligatures like:</p>
                <ul>
                    <li><code>b+b+seven → bbseven.liga</code></li>
                    <li><code>b+five → bfive.liga</code></li>
                    <li><code>b+b → bb.liga</code></li>
                </ul>
                <p>This suggests <strong>direct input</strong> (left side) should work, not b→l transformation.</p>
            </div>
        </div>
    );
};

export default FontLigatureComparison;
