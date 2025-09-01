/**
 * Phase 1 Demo Integration - Test MusicXML functionality
 */

// Global Phase 1 integration variables
let notationIntegrator = null;
let musicXMLGenerator = null;
let precisionTimeline = null;

// Initialize Phase 1 systems
function initializePhase1() {
    console.log('[PHASE 1 DEMO] Initializing MusicXML integration...');

    // Wait for all dependencies to load
    if (typeof window.scene === 'undefined' || typeof window.camera === 'undefined') {
        console.log('[PHASE 1 DEMO] Waiting for Three.js scene...');
        setTimeout(initializePhase1, 500);
        return;
    }

    if (typeof VF === 'undefined') {
        console.log('[PHASE 1 DEMO] Waiting for VexFlow...');
        setTimeout(initializePhase1, 500);
        return;
    }

    if (typeof MusicXMLChord === 'undefined') {
        console.log('[PHASE 1 DEMO] Waiting for MusicXML core...');
        setTimeout(initializePhase1, 500);
        return;
    }

    try {
        // Initialize Phase 1 components
        notationIntegrator = new ChordCubesNotationIntegrator(window.scene, window.camera);
        musicXMLGenerator = new MusicXMLGenerator();
        precisionTimeline = new PrecisionTimeline();

        console.log('[PHASE 1 DEMO] ✅ All systems initialized successfully');

        // Add Phase 1 UI controls
        addPhase1Controls();

        // Hook into existing chord system
        hookIntoChordSystem();

        // Add test functionality
        addTestFunctions();

    } catch (error) {
        console.error('[PHASE 1 DEMO] Initialization error:', error);
        setTimeout(initializePhase1, 1000);
    }
}

// Add Phase 1 UI controls
function addPhase1Controls() {
    const controlsContainer = document.getElementById('camera-ui');
    if (!controlsContainer) return;

    // Add Phase 1 buttons
    const phase1Controls = document.createElement('div');
    phase1Controls.style.marginTop = '10px';
    phase1Controls.innerHTML = `
        <div style="background: rgba(0,0,0,0.8); padding: 10px; border-radius: 5px; color: white;">
            <h4>Phase 1: MusicXML Integration</h4>
            <button id="show-notation-btn" style="margin: 5px; padding: 5px 10px;">Show Notation</button>
            <button id="hide-notation-btn" style="margin: 5px; padding: 5px 10px;">Hide Notation</button>
            <button id="export-musicxml-btn" style="margin: 5px; padding: 5px 10px;">Export MusicXML</button>
            <button id="test-timeline-btn" style="margin: 5px; padding: 5px 10px;">Test Timeline</button>
        </div>
    `;

    controlsContainer.appendChild(phase1Controls);

    // Add event listeners
    document.getElementById('show-notation-btn').addEventListener('click', showNotationForLineup);
    document.getElementById('hide-notation-btn').addEventListener('click', hideAllNotation);
    document.getElementById('export-musicxml-btn').addEventListener('click', exportCurrentProgressionToMusicXML);
    document.getElementById('test-timeline-btn').addEventListener('click', testPrecisionTimeline);
}

// Hook into existing chord system
function hookIntoChordSystem() {
    // Override the existing chord click handler to add notation
    const originalPlayChord = window.playChordForObjectWith7th;

    if (originalPlayChord) {
        window.playChordForObjectWith7th = function (obj, use7th = false, options = {}) {
            // Call original function
            const result = originalPlayChord.call(this, obj, use7th, options);

            // Add notation if enabled
            if (notationIntegrator && obj.userData && obj.userData.roman) {
                // Check if this cube already has notation
                if (!notationIntegrator.notationMap.has(obj)) {
                    notationIntegrator.addNotationToCube(obj);
                } else {
                    // Update existing notation
                    notationIntegrator.updateCubeNotation(obj);
                }
            }

            return result;
        };

        console.log('[PHASE 1 DEMO] ✅ Hooked into chord system');
    }
}

// Show notation for all chords in lineup
function showNotationForLineup() {
    if (!notationIntegrator || !window.lineup) {
        console.warn('[PHASE 1 DEMO] Systems not ready');
        return;
    }

    console.log('[PHASE 1 DEMO] Adding notation to lineup...');
    notationIntegrator.addNotationToLineup(window.lineup);

    // Update render loop to handle billboards
    if (window.animate && !window.phase1BillboardUpdate) {
        const originalAnimate = window.animate;
        window.animate = function () {
            originalAnimate.call(this);
            if (notationIntegrator) {
                notationIntegrator.updateNotationBillboards();
            }
        };
        window.phase1BillboardUpdate = true;
        console.log('[PHASE 1 DEMO] ✅ Billboard updates integrated into render loop');
    }
}

// Hide all notation
function hideAllNotation() {
    if (!notationIntegrator) return;

    notationIntegrator.vexFlowRenderer.clearAllNotation();
    notationIntegrator.notationMap.clear();
    console.log('[PHASE 1 DEMO] All notation hidden');
}

// Export current progression to MusicXML
function exportCurrentProgressionToMusicXML() {
    if (!window.lineup || !musicXMLGenerator) {
        console.warn('[PHASE 1 DEMO] No progression to export');
        return;
    }

    try {
        // Convert lineup to MusicXML format
        const migrator = new LegacyDataMigrator();
        const musicXMLChords = migrator.convertLineupToMusicXML(window.lineup);

        // Generate MusicXML document
        const xmlDocument = musicXMLGenerator.generateScore(musicXMLChords);

        // Create download
        const blob = new Blob([xmlDocument], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'chordcubes-progression.musicxml';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('[PHASE 1 DEMO] ✅ MusicXML exported successfully');
        console.log('XML Preview:', xmlDocument.substring(0, 500) + '...');

    } catch (error) {
        console.error('[PHASE 1 DEMO] Export error:', error);
    }
}

// Test precision timeline
function testPrecisionTimeline() {
    if (!precisionTimeline || !window.lineup) {
        console.warn('[PHASE 1 DEMO] Timeline not ready');
        return;
    }

    console.log('[PHASE 1 DEMO] Testing precision timeline...');

    // Create test chord progression with precise timing
    const testChords = window.lineup.slice(0, 4); // First 4 chords

    testChords.forEach((chord, index) => {
        const musicXMLChord = new MusicXMLChord(chord);

        // Schedule chords at different subdivisions
        if (index === 0) {
            precisionTimeline.scheduleChordChange(musicXMLChord, 1, 1, 0); // Downbeat
        } else if (index === 1) {
            precisionTimeline.scheduleChordChange(musicXMLChord, 1, 2, 2); // Beat 2 + 2 sixteenths
        } else if (index === 2) {
            precisionTimeline.scheduleChordChange(musicXMLChord, 2, 1, 0); // Measure 2 downbeat
        } else if (index === 3) {
            precisionTimeline.addSyncopatedChord(musicXMLChord, 2, 3, 1); // Syncopated
        }
    });

    console.log('[PHASE 1 DEMO] Timeline events:', precisionTimeline.events);
    console.log('[PHASE 1 DEMO] ✅ Precision timeline test complete');
}

// Add test functions to global scope
function addTestFunctions() {
    // Test MusicXML chord creation
    window.testMusicXMLChord = function (cubeObject) {
        if (!cubeObject && window.lineup.length > 0) {
            cubeObject = window.lineup[0];
        }

        const musicXMLChord = new MusicXMLChord(cubeObject);
        console.log('MusicXML Chord:', musicXMLChord);
        console.log('MusicXML Output:', musicXMLChord.toMusicXML());
        return musicXMLChord;
    };

    // Test notation rendering
    window.testNotationRender = function (cubeObject) {
        if (!cubeObject && window.lineup.length > 0) {
            cubeObject = window.lineup[0];
        }

        if (notationIntegrator) {
            notationIntegrator.addNotationToCube(cubeObject);
            console.log('Notation added to cube:', cubeObject.userData.roman);
        }
    };

    console.log('[PHASE 1 DEMO] ✅ Test functions available: testMusicXMLChord(), testNotationRender()');
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePhase1);
} else {
    initializePhase1();
}

console.log('[PHASE 1 DEMO] Demo integration script loaded');
