import React from 'react';

// ULTRA SIMPLE TEST - NO DEPENDENCIES
const FontTest: React.FC = () => {
    return (
        <div style={{
            fontSize: '24px',
            padding: '20px',
            backgroundColor: '#1e293b',
            color: 'white',
            border: '2px solid red',
            margin: '20px'
        }}>
            <div>🚨 FONT TEST - NO FALLBACKS 🚨</div>
            <div style={{ fontFamily: 'nvxChord' }}>
                nvxChord Font Test: Cmaj7
            </div>
            <div style={{ fontFamily: 'Fontdec13' }}>
                Fontdec13 Font Test: Dm7
            </div>
            <div style={{ fontFamily: 'music-font' }}>
                music-font Test: G7
            </div>
            <div style={{ fontFamily: 'Arial' }}>
                Arial Test (fallback): Am
            </div>
        </div>
    );
};

export default FontTest;
