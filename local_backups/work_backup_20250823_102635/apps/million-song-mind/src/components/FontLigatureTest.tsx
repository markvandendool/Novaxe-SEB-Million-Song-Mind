import React from 'react';

const FontLigatureTest: React.FC = () => {
    const testCases = [
        { label: 'Direct b characters (font expects)', text: 'Bb bb7 b5 bbseven' },
        { label: 'l transformation (current code)', text: 'Bl bl7 l5 llseven' },
        { label: 'Double sharp test', text: '##' },
        { label: 'Numbers test', text: 'b7 b5 b3' },
        { label: 'Mixed test', text: 'Bb Eb Ab Db' }
    ];

    return (
        <div style={{ padding: '20px' }}>
            <h2>Font Ligature Test - nvxFont.otf</h2>

            {testCases.map((testCase, index) => (
                <div key={index} style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                        {testCase.label}
                    </div>
                    <div
                        style={{
                            fontFamily: 'nvxChord, monospace',
                            fontSize: '24px',
                            fontFeatureSettings: '"liga" 1',
                            backgroundColor: '#f5f5f5',
                            padding: '10px',
                            border: '1px solid #ddd'
                        }}
                    >
                        {testCase.text}
                    </div>
                    <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                        Raw text: "{testCase.text}"
                    </div>
                </div>
            ))}

            <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#fff3cd', border: '1px solid #ffeaa7' }}>
                <h3>Expected Results if Ligatures Work:</h3>
                <ul>
                    <li><strong>Bb</strong> should render as <strong>B♭</strong> (flat symbol)</li>
                    <li><strong>bb7</strong> should render as <strong>♭♭⁷</strong> (double flat seventh)</li>
                    <li><strong>##</strong> should render as single double-sharp symbol</li>
                    <li><strong>b5</strong> should render as <strong>♭⁵</strong> (flat fifth)</li>
                </ul>
            </div>
        </div>
    );
};

export default FontLigatureTest;
