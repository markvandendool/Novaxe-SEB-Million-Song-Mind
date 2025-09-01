/**
 * Staves Integration - Connect musical staves with ChordCubes progression system
 * Wire up UI controls and automatic progression display
 */

// Global staves instance with aggressive protection
let musicalStaves3D = null;

// Multiple layers of initialization protection
let stavesIntegrationInitialized = false;
if (!window.STAVES_INTEGRATION_PROTECTED) {
    window.STAVES_INTEGRATION_PROTECTED = false;
}

/**
 * Initialize musical staves integration
 */
function initializeStavesIntegration() {
    // AGGRESSIVE protection against multiple initializations
    if (stavesIntegrationInitialized || window.STAVES_INTEGRATION_PROTECTED) {
        return;
    }

    // Set protection immediately
    window.STAVES_INTEGRATION_PROTECTED = true;

    console.log('[STAVES INTEGRATION] Initializing...');

    // Wait for dependencies - VexFlow 4.x exposes as window.Vex, not window.VF
    const VF = window.Vex ? window.Vex.Flow : null;
    if (!window.scene || !window.camera || !VF || !window.THREE) {
        console.log('[STAVES INTEGRATION] Missing dependencies - will NOT retry automatically to prevent infinite loop');
        console.log('[STAVES INTEGRATION] Dependencies status:', {
            scene: !!window.scene,
            camera: !!window.camera,
            VF: !!VF,
            Vex: !!window.Vex,
            THREE: !!window.THREE
        });
        return;
    }

    // Expose VF globally for compatibility
    if (!window.VF && VF) {
        window.VF = VF;
        console.log('[STAVES INTEGRATION] 🎼 VERBOSE: VexFlow exposed as window.VF for compatibility');
    }

    try {
        // Create staves instance
        musicalStaves3D = new MusicalStaves3D(window.scene, window.camera);

        // CRITICAL: Expose to global window scope for main.js access
        window.musicalStaves3D = musicalStaves3D;
        console.log('[STAVES INTEGRATION] ✅ musicalStaves3D exposed to window.musicalStaves3D');

        // Set up UI controls
        setupStavesControls();

        // Hook into chord progression updates
        hookProgressionUpdates();

        // Mark as initialized to prevent multiple runs
        stavesIntegrationInitialized = true;

        console.log('[STAVES INTEGRATION] ✅ Initialized successfully');

    } catch (error) {
        console.error('[STAVES INTEGRATION] ❌ Initialization failed:', error);
    }
}

/**
 * Set up UI button controls for musical staves
 */
function setupStavesControls() {
    console.log('[STAVES INTEGRATION] 🎼 VERBOSE: setupStavesControls called');

    const showBtn = document.getElementById('show-staves');
    const hideBtn = document.getElementById('hide-staves');
    const testBtn = document.getElementById('test-progression');

    console.log('[STAVES INTEGRATION] 🎼 VERBOSE: Button elements found:');
    console.log('[STAVES INTEGRATION] 🎼 VERBOSE: - Show button:', !!showBtn);
    console.log('[STAVES INTEGRATION] 🎼 VERBOSE: - Hide button:', !!hideBtn);
    console.log('[STAVES INTEGRATION] 🎼 VERBOSE: - Test button:', !!testBtn);
    console.log('[STAVES INTEGRATION] 🎼 VERBOSE: - musicalStaves3D instance:', !!musicalStaves3D);

    if (showBtn) {
        showBtn.addEventListener('click', () => {
            console.log('[STAVES INTEGRATION] 🎼 VERBOSE: === SHOW STAVES CLICKED ===');
            console.log('[STAVES INTEGRATION] 🎼 VERBOSE: musicalStaves3D available:', !!musicalStaves3D);
            if (musicalStaves3D) {
                console.log('[STAVES INTEGRATION] 🎼 VERBOSE: Calling musicalStaves3D.createStaves()...');
                musicalStaves3D.createStaves();
                console.log('[STAVES INTEGRATION] ✅ Staves creation triggered');
            } else {
                console.error('[STAVES INTEGRATION] ❌ musicalStaves3D not available!');
            }
        });
        console.log('[STAVES INTEGRATION] 🎼 VERBOSE: Show button listener attached');
    } else {
        console.error('[STAVES INTEGRATION] ❌ Show button not found!');
    }

    if (hideBtn) {
        hideBtn.addEventListener('click', () => {
            console.log('[STAVES INTEGRATION] 🎼 VERBOSE: === HIDE STAVES CLICKED ===');
            if (musicalStaves3D) {
                musicalStaves3D.setVisible(false);
                console.log('[STAVES INTEGRATION] ✅ Staves hidden');
            }
        });
        console.log('[STAVES INTEGRATION] 🎼 VERBOSE: Hide button listener attached');
    }

    if (testBtn) {
        testBtn.addEventListener('click', () => {
            console.log('[STAVES INTEGRATION] 🎼 VERBOSE: === TEST PROGRESSION CLICKED ===');
            console.log('[STAVES INTEGRATION] 🎼 VERBOSE: Calling testThreeVoiceProgression()...');
            testThreeVoiceProgression();
        });
        console.log('[STAVES INTEGRATION] 🎼 VERBOSE: Test button listener attached');
    }

    console.log('[STAVES INTEGRATION] 🎼 VERBOSE: setupStavesControls completed');
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

// SAFE INITIALIZATION: Only initialize once when called manually
// NO automatic initialization to prevent infinite loops

// Export for global use
if (typeof window !== 'undefined') {
    window.initializeStavesIntegration = initializeStavesIntegration;
    window.updateStavesBillboard = updateStavesBillboard;
    window.testThreeVoiceProgression = testThreeVoiceProgression;

    // Initialize safely after a delay when everything is loaded
    setTimeout(() => {
        if (!window.STAVES_INTEGRATION_PROTECTED) {
            console.log('[STAVES INTEGRATION] Safe delayed initialization...');
            initializeStavesIntegration();
        }
    }, 2000);
}
