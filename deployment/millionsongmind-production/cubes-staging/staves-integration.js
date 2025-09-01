/**
 * Staves Integration - Connect musical staves with ChordCubes progression system
 * Wire up UI controls and automatic progression display
 */

// Global staves instance
let musicalStaves3D = null;

/**
 * Initialize musical staves integration
 */
function initializeStavesIntegration() {
    console.log('[STAVES INTEGRATION] Initializing...');

    // Wait for dependencies
    if (!window.scene || !window.camera || !window.VF) {
        setTimeout(initializeStavesIntegration, 500);
        return;
    }

    try {
        // Create staves instance
        musicalStaves3D = new MusicalStaves3D(window.scene, window.camera);

        // Set up UI controls
        setupStavesControls();

        // Hook into chord progression updates
        hookProgressionUpdates();

        console.log('[STAVES INTEGRATION] ✅ Initialized successfully');

    } catch (error) {
        console.error('[STAVES INTEGRATION] ❌ Initialization failed:', error);
    }
}

/**
 * Set up UI button controls for musical staves
 */
function setupStavesControls() {
    const showBtn = document.getElementById('show-staves');
    const hideBtn = document.getElementById('hide-staves');
    const testBtn = document.getElementById('test-progression');

    if (showBtn) {
        showBtn.addEventListener('click', () => {
            if (musicalStaves3D) {
                musicalStaves3D.createStaves();
                console.log('[STAVES INTEGRATION] Staves created');
            }
        });
    }

    if (hideBtn) {
        hideBtn.addEventListener('click', () => {
            if (musicalStaves3D) {
                musicalStaves3D.setVisible(false);
                console.log('[STAVES INTEGRATION] Staves hidden');
            }
        });
    }

    if (testBtn) {
        testBtn.addEventListener('click', () => {
            testThreeVoiceProgression();
        });
    }
}

/**
 * Hook into ChordCubes progression updates and MIDI playback to capture actual notes
 */
function hookProgressionUpdates() {
    // Check if lineup exists and hook into progression changes
    if (typeof window.lineup !== 'undefined') {
        console.log('[STAVES INTEGRATION] Found lineup array, setting up auto-update');

        // Store original lineup for comparison
        let lastLineup = JSON.stringify(window.lineup);

        // Check for changes every 2 seconds
        setInterval(() => {
            if (musicalStaves3D && musicalStaves3D.isVisible) {
                const currentLineup = JSON.stringify(window.lineup);
                if (currentLineup !== lastLineup && window.lineup.length > 0) {
                    console.log('[STAVES INTEGRATION] Progression changed, updating staves');
                    musicalStaves3D.displayChordProgression(window.lineup);
                    lastLineup = currentLineup;
                }
            }
        }, 2000);
    }

    // Hook into chord playback to capture MIDI notes
    hookChordPlayback();
}

/**
 * Hook into ChordCubes chord playback to capture actual MIDI notes being played
 */
function hookChordPlayback() {
    // Method 1: Hook into playChord function if it exists
    if (typeof window.playChord === 'function') {
        const originalPlayChord = window.playChord;
        window.playChord = function (...args) {
            // Capture the notes being played
            const result = originalPlayChord.apply(this, args);
            captureMidiNotes(args);
            return result;
        };
        console.log('[STAVES INTEGRATION] Hooked into playChord function');
    }

    // Method 2: Hook into playChordForObject if it exists  
    if (typeof window.playChordForObject === 'function') {
        const originalPlayChordForObject = window.playChordForObject;
        window.playChordForObject = function (chordObj, ...args) {
            const result = originalPlayChordForObject.apply(this, arguments);
            // Store played notes in the chord object for staves to use
            if (chordObj && window.lastPlayedNotes) {
                chordObj.playedNotes = [...window.lastPlayedNotes];
            }
            return result;
        };
        console.log('[STAVES INTEGRATION] Hooked into playChordForObject function');
    }

    // Method 3: Listen for Tone.js note triggers if available
    if (typeof Tone !== 'undefined' && Tone.Transport) {
        console.log('[STAVES INTEGRATION] Tone.js transport available for MIDI capture');
    }
}

/**
 * Capture MIDI notes from chord playback
 */
function captureMidiNotes(playChordArgs) {
    // This will depend on how ChordCubes playChord function works
    // For now, just log what we receive
    console.log('[STAVES INTEGRATION] Captured chord playback:', playChordArgs);

    // Store in global variable for staves to use
    if (playChordArgs && playChordArgs.length > 0) {
        window.lastCapturedChordArgs = playChordArgs;
    }
}

/**
 * Test 3-voice progression display with sample chords
 */
function testThreeVoiceProgression() {
    if (!musicalStaves3D) {
        console.error('[STAVES INTEGRATION] Staves not initialized');
        return;
    }

    // Create staves if not visible
    if (!musicalStaves3D.isVisible) {
        musicalStaves3D.createStaves();
    }

    // Test progression: I - vi - IV - V (classic progression)
    const testProgression = [
        { userData: { roman: 'I' } },   // C major
        { userData: { roman: 'vi' } },  // A minor
        { userData: { roman: 'IV' } },  // F major  
        { userData: { roman: 'V' } }    // G major
    ];

    musicalStaves3D.displayChordProgression(testProgression);
    console.log('[STAVES INTEGRATION] ✅ Test progression displayed');
}

/**
 * Update staves to face camera (call from render loop)
 */
function updateStavesBillboard() {
    if (musicalStaves3D && musicalStaves3D.isVisible) {
        musicalStaves3D.updateBillboard();
    }
}

/**
 * Get current ChordCubes progression for staves display
 */
function getCurrentProgression() {
    if (typeof window.lineup !== 'undefined' && window.lineup.length > 0) {
        return window.lineup.filter(chord => chord.userData && chord.userData.roman);
    }
    return [];
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeStavesIntegration);
} else {
    initializeStavesIntegration();
}

// Export for global use
if (typeof window !== 'undefined') {
    window.initializeStavesIntegration = initializeStavesIntegration;
    window.updateStavesBillboard = updateStavesBillboard;
    window.testThreeVoiceProgression = testThreeVoiceProgression;
}
