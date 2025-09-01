/**
 * Musical Staves 3D - Render chord progressions as 3-voice notation in 3D space
 * Simple, foundational approach: Big fat whole notes showing harmonic functions
 */

class MusicalStaves3D {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.staves = [];
        this.notation = [];
        this.isVisible = false;

        // ACCESSIBLE piano staff positioning - at eye level with cubes  
        this.positions = {
            treble: { x: 0, y: 3, z: 4 },     // Treble clef staff - IN FRONT of cubes, higher up  
            bass: { x: 0, y: 1, z: 4 }        // Bass clef staff - IN FRONT of cubes, above ground
        };

        // REASONABLE scale - not massive screen-filling
        this.staveScale = {
            width: 8,     // Readable but not overwhelming
            height: 2     // Proportional height
        };

        // ChordCubes Voice Architecture (NO COLORS - user has sophisticated system)
        this.voiceStructure = {
            bass: 1,        // Single bass voice
            melody: 1,      // Single melody voice (soprano)  
            middle: 3,      // Minimum 3 middle voices for complete chords
            minimum: 5      // Total minimum voices when locked
        };

        console.log('[MUSICAL STAVES 3D] 🎼 VERBOSE: Initialized with positions:', this.positions);
        console.log('[MUSICAL STAVES 3D] 🎼 VERBOSE: Scale:', this.staveScale);
    }

    /**
     * Create piano staves for sophisticated 3-7 note harmony display
     */
    createStaves() {
        console.log('[MUSICAL STAVES 3D] 🎼 VERBOSE: createStaves() called');
        console.log('[MUSICAL STAVES 3D] 🎼 VERBOSE: VexFlow available:', !!window.VF);
        console.log('[MUSICAL STAVES 3D] 🎼 VERBOSE: Scene available:', !!this.scene);
        console.log('[MUSICAL STAVES 3D] 🎼 VERBOSE: Camera available:', !!this.camera);
        console.log('[MUSICAL STAVES 3D] 🎼 VERBOSE: THREE available:', !!window.THREE);

        // Check for VexFlow - 4.x exposes as window.Vex.Flow
        const VF = window.VF || (window.Vex ? window.Vex.Flow : null);
        if (!VF) {
            console.error('[MUSICAL STAVES 3D] ❌ VexFlow not loaded. Checked window.VF and window.Vex.Flow');
            console.error('[MUSICAL STAVES 3D] ❌ Available:', { VF: !!window.VF, Vex: !!window.Vex });
            return;
        }

        console.log('[MUSICAL STAVES 3D] 🎼 VERBOSE: VexFlow available:', { VF: !!VF, source: window.VF ? 'window.VF' : 'window.Vex.Flow' });

        // Ensure VF is available globally
        if (!window.VF && VF) {
            window.VF = VF;
        }

        // Clear existing staves
        console.log('[MUSICAL STAVES 3D] 🎼 VERBOSE: Clearing existing staves...');
        this.clearStaves();

        try {
            console.log('[MUSICAL STAVES 3D] 🎼 VERBOSE: Creating treble staff at position:', this.positions.treble);
            // Create treble staff (upper harmonies from ChordCubes)
            this.staves.treble = this.createSingleStaff(
                this.positions.treble,
                'treble',
                'Treble - Upper Harmonies'
            );
            console.log('[MUSICAL STAVES 3D] 🎼 VERBOSE: Treble staff created:', !!this.staves.treble);

            console.log('[MUSICAL STAVES 3D] 🎼 VERBOSE: Creating bass staff at position:', this.positions.bass);
            // Create bass staff (bass notes + lower harmonies from ChordCubes)
            this.staves.bass = this.createSingleStaff(
                this.positions.bass,
                'bass',
                'Bass - Lower Harmonies & Bass'
            );
            console.log('[MUSICAL STAVES 3D] 🎼 VERBOSE: Bass staff created:', !!this.staves.bass);

            this.isVisible = true;
            console.log('[MUSICAL STAVES 3D] ✅ Created piano staff system (treble + bass)');
            console.log('[MUSICAL STAVES 3D] 🎼 VERBOSE: Scene children count:', this.scene.children.length);

        } catch (error) {
            console.error('[MUSICAL STAVES 3D] ❌ Error creating staves:', error);
            console.error('[MUSICAL STAVES 3D] ❌ Error stack:', error.stack);
        }
    }

    /**
     * Create a single staff at specified 3D position
     */
    createSingleStaff(position, clef, title) {
        console.log('[MUSICAL STAVES 3D] 🎼 VERBOSE: createSingleStaff called for', clef, 'at position', position);

        // REASONABLE canvas for good quality without being massive
        const canvas = document.createElement('canvas');
        canvas.width = 1024;  // Good quality without being excessive
        canvas.height = 256;  // Proportional height
        console.log('[MUSICAL STAVES 3D] 🎼 VERBOSE: Canvas created:', canvas.width + 'x' + canvas.height);

        const VF = window.VF || (window.Vex ? window.Vex.Flow : null);
        const renderer = new VF.Renderer(canvas, VF.Renderer.Backends.CANVAS);
        const context = renderer.getContext();
        context.setFont('Arial', 12);
        console.log('[MUSICAL STAVES 3D] 🎼 VERBOSE: VexFlow renderer and context created');

        // Declare stave outside try block for proper scope
        let stave = null;

        try {
            // Create MASSIVE stave with clef and time signature (scaled for 2048px canvas)
            stave = new VF.Stave(20, 100, 1900);  // Much wider stave for the massive canvas
            stave.addClef(clef);
            stave.addTimeSignature('4/4');
            stave.addKeySignature('C'); // C Major for now
            stave.setContext(context).draw();
            console.log('[MUSICAL STAVES 3D] 🎼 VERBOSE: VexFlow stave drawn successfully');

            // Add title with bigger font
            context.fillStyle = '#000';
            context.font = '24px Arial';  // Bigger font for massive scale
            context.fillText(title, 20, 50);
            console.log('[MUSICAL STAVES 3D] 🎼 VERBOSE: Title added:', title);

        } catch (error) {
            console.error('[MUSICAL STAVES 3D] ❌ Error drawing VexFlow stave:', error);
            throw error;
        }

        // Convert canvas to texture and create 3D mesh
        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        console.log('[MUSICAL STAVES 3D] 🎼 VERBOSE: Texture created from canvas');

        // MASSIVE geometry to match MELODY/BASSLINE titles (16x8) - even bigger!
        const geometry = new THREE.PlaneGeometry(this.staveScale.width, this.staveScale.height);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.1,
            side: THREE.DoubleSide  // Visible from both sides
        });
        console.log('[MUSICAL STAVES 3D] 🎼 VERBOSE: Geometry created:', this.staveScale.width + 'x' + this.staveScale.height);

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(position.x, position.y, position.z);
        // Don't look at camera - keep them horizontal like the MELODY/BASS titles  
        mesh.rotation.x = -Math.PI / 8; // Gentle angle for better visibility (22.5 degrees)
        console.log('[MUSICAL STAVES 3D] 🎼 VERBOSE: Mesh created and positioned at:', mesh.position);
        console.log('[MUSICAL STAVES 3D] 🎼 VERBOSE: Mesh rotation:', mesh.rotation);

        console.log('[MUSICAL STAVES 3D] 🎼 VERBOSE: Adding mesh to scene...');
        this.scene.add(mesh);
        console.log('[MUSICAL STAVES 3D] ✅ VERBOSE: Mesh added to scene successfully!');

        return {
            mesh,
            canvas,
            context,
            stave,
            renderer,
            clef,
            title
        };
    }

    /**
     * Display chord progression as 3-voice counterpoint
     */
    displayChordProgression(progression) {
        if (!this.isVisible || !progression || progression.length === 0) {
            return;
        }

        console.log('[MUSICAL STAVES 3D] Displaying progression:', progression);

        try {
            // Extract harmony notes from chord progression for piano staves
            const pianoStaves = this.extractPianoStaves(progression);

            // Render harmony notes on treble and bass staves
            this.renderVoice('treble', pianoStaves.treble);
            this.renderVoice('bass', pianoStaves.bass);

            console.log('[MUSICAL STAVES 3D] ✅ Rendered piano staff progression with 3-7 note harmonies');

        } catch (error) {
            console.error('[MUSICAL STAVES 3D] ❌ Error displaying progression:', error);
        }
    }

    /**
     * Extract 3-7 note harmonies and distribute across piano staves (treble + bass)
     */
    extractPianoStaves(progression) {
        const pianoStaves = {
            treble: [],  // Upper harmony notes (middle C and above)
            bass: []     // Bass notes and lower harmonies (below middle C)
        };

        progression.forEach((chord, index) => {
            // Get the actual MIDI notes being played for this chord
            const midiNotes = this.getMidiNotesFromChord(chord);

            if (midiNotes && midiNotes.length > 0) {
                console.log(`[MUSICAL STAVES 3D] Processing ${midiNotes.length}-note harmony for chord ${index + 1}`);

                // Sort notes by pitch for proper voice leading
                const sortedNotes = midiNotes.sort((a, b) => a.midi - b.midi);
                const middleC = 60; // MIDI note 60 is middle C4

                // Distribute each note to appropriate staff with voice color coding
                sortedNotes.forEach((midiNote, voiceIndex) => {
                    const vexFlowNote = this.midiToVexFlow(midiNote);
                    const noteData = {
                        note: vexFlowNote,
                        duration: 'w', // whole note
                        measure: index + 1,
                        voiceColor: this.getVoiceColor(voiceIndex),
                        voiceIndex: voiceIndex
                    };

                    // Distribute based on pitch (middle C as divider)
                    if (midiNote.midi >= middleC) {
                        pianoStaves.treble.push(noteData);
                    } else {
                        pianoStaves.bass.push(noteData);
                    }
                });

            } else {
                console.warn('[MUSICAL STAVES 3D] No MIDI notes found for chord:', chord);
            }
        });

        console.log('[MUSICAL STAVES 3D] Piano staves distribution:', pianoStaves);
        return pianoStaves;
    }

    /**
     * Get voice color for visual distinction in piano staves
     */
    getVoiceColor(voiceIndex) {
        const colors = [
            this.voiceColors.voice1,  // First voice/instrument (red)
            this.voiceColors.voice2,  // Middle harmonies (teal) 
            this.voiceColors.voice3,  // Bass voice (blue)
            '#9B59B6', // Purple for additional harmony notes
            '#E67E22', // Orange for extensions  
            '#34495E', // Dark gray for complex harmonies
            '#16A085'  // Dark teal for added color tones
        ];
        return colors[voiceIndex % colors.length];
    }

    /**
     * Get ACTUAL MIDI notes being played by ChordCubes for this chord
     */
    getMidiNotesFromChord(chord) {
        // Try multiple methods to get the played MIDI notes

        // Method 1: Check if chord has cached MIDI data
        if (chord.midiNotes) {
            return chord.midiNotes;
        }

        // Method 2: Use ChordCubes voice leading system
        if (typeof getChordVoicing === 'function') {
            try {
                return getChordVoicing(chord);
            } catch (e) {
                console.log('[STAVES] Voice leading method failed:', e);
            }
        }

        // Method 3: Hook into audio engine played notes
        if (chord.userData && chord.userData.playedNotes) {
            return chord.userData.playedNotes;
        }

        // Method 4: Get notes from last audio playback
        if (window.lastPlayedNotes && window.lastPlayedNotes.length > 0) {
            return window.lastPlayedNotes;
        }

        // Fallback: Generate basic triad for testing
        console.log('[STAVES] Using fallback chord generation for:', chord.userData?.roman);
        return this.generateFallbackChord(chord.userData?.roman || 'I');
    }

    /**
     * Convert MIDI note data to VexFlow notation format
     */
    midiToVexFlow(noteData) {
        if (!noteData) return 'C/4';

        // If noteData is already a string, return it
        if (typeof noteData === 'string') {
            return noteData;
        }

        // If noteData has midi property, convert from MIDI number
        if (noteData.midi) {
            return this.midiNumberToVexFlow(noteData.midi);
        }

        // If noteData has note property, use that
        if (noteData.note) {
            return noteData.note;
        }

        return 'C/4'; // Fallback
    }

    /**
     * Convert MIDI number to VexFlow notation (e.g., 60 -> "C/4")
     */
    midiNumberToVexFlow(midiNumber) {
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const octave = Math.floor(midiNumber / 12) - 1;
        const noteIndex = midiNumber % 12;
        return `${notes[noteIndex]}/${octave}`;
    }

    /**
     * Generate fallback chord for testing when MIDI data unavailable
     */
    generateFallbackChord(roman = 'I') {
        // Simple fallback triads in C major
        const chords = {
            'I': [60, 64, 67],    // C major: C, E, G
            'ii': [62, 65, 69],   // D minor: D, F, A
            'iii': [64, 67, 71],  // E minor: E, G, B
            'IV': [65, 69, 72],   // F major: F, A, C
            'V': [67, 71, 74],    // G major: G, B, D
            'vi': [69, 72, 76],   // A minor: A, C, E
            'viiø': [71, 74, 77]  // B dim: B, D, F
        };

        const midiNumbers = chords[roman] || chords['I'];
        return midiNumbers.map(midi => ({ midi, note: this.midiNumberToVexFlow(midi) }));
    }

    /**
     * Render voice on specific staff with whole notes
     */
    renderVoice(staffName, voice) {
        const staff = this.staves[staffName];
        if (!staff || !voice.length) return;

        // Clear previous notation
        staff.context.clearRect(0, 0, staff.canvas.width, staff.canvas.height);

        // Redraw stave
        staff.stave.setContext(staff.context).draw();

        // Add title
        staff.context.fillStyle = '#000';
        staff.context.fillText(staff.title, 10, 20);

        // Create notes for this voice
        const notes = voice.map(noteData => {
            return new VF.StaveNote({
                clef: staff.clef,
                keys: [noteData.note],
                duration: noteData.duration
            });
        });

        if (notes.length > 0) {
            // Create voice and add notes
            const vfVoice = new VF.Voice({ num_beats: 4 * notes.length, beat_value: 1 });
            vfVoice.addTickables(notes);

            // Format and draw
            const formatter = new VF.Formatter().joinVoices([vfVoice]);
            formatter.format([vfVoice], 700); // Width for formatting
            vfVoice.draw(staff.context, staff.stave);
        }

        // Update texture
        staff.mesh.material.map.needsUpdate = true;
    }

    /**
     * Get current key from ChordCubes system
     */
    getCurrentKey() {
        // Hook into ChordCubes key system
        if (typeof getCurrentKey === 'function') {
            return getCurrentKey();
        }
        return 'C'; // Default to C major
    }

    /**
     * Show/hide staves
     */
    setVisible(visible) {
        Object.values(this.staves).forEach(staff => {
            if (staff.mesh) {
                staff.mesh.visible = visible;
            }
        });
        this.isVisible = visible;
    }

    /**
     * Clear all staves from scene
     */
    clearStaves() {
        Object.values(this.staves).forEach(staff => {
            if (staff.mesh) {
                this.scene.remove(staff.mesh);
                staff.mesh.geometry.dispose();
                staff.mesh.material.dispose();
            }
        });
        this.staves = {};
        this.isVisible = false;
    }

    /**
     * Update staves to face camera (billboard behavior)
     */
    updateBillboard() {
        if (!this.isVisible) return;

        Object.values(this.staves).forEach(staff => {
            if (staff.mesh) {
                staff.mesh.lookAt(this.camera.position);
            }
        });
    }

    /**
     * 🎼 LOCK BASS/MELODY → DRAW MEASURES
     * Instantly draws measures on staves (1 measure per chord in progression)
     */
    drawMeasures(chordCount) {
        if (!this.isVisible || chordCount === 0) return;

        console.log(`[MUSICAL STAVES 3D] 🎼 Drawing ${chordCount} measures for chord progression`);

        // Update both treble and bass staves with measure lines
        Object.entries(this.staves).forEach(([clef, staff]) => {
            if (staff.canvas && staff.context) {
                // Clear existing content
                staff.context.clearRect(0, 0, staff.canvas.width, staff.canvas.height);

                // Redraw stave with measure lines
                this.redrawStaffWithMeasures(staff, chordCount);

                // Update texture
                if (staff.mesh && staff.mesh.material && staff.mesh.material.map) {
                    staff.mesh.material.map.needsUpdate = true;
                }

                console.log(`[MUSICAL STAVES 3D] ✅ ${clef} clef updated with ${chordCount} measures`);
            }
        });
    }

    /**
     * Redraw a staff with measure lines for the progression
     */
    redrawStaffWithMeasures(staff, measureCount) {
        const VF = window.VF || (window.Vex ? window.Vex.Flow : null);
        if (!VF || !staff.context || !staff.stave) return;

        try {
            // NO BACKGROUND - transparent staves for clean overlay

            // VexFlow renderer
            const renderer = new VF.Renderer(staff.canvas, VF.Renderer.Backends.CANVAS);
            const context = renderer.getContext();
            context.setFont('Arial', 24); // Large font for 3D visibility

            // Calculate measure width
            const totalWidth = 1900; // Our massive canvas width for measures
            const measureWidth = Math.max(120, totalWidth / Math.max(measureCount, 1));

            // Draw multiple measures
            for (let i = 0; i < measureCount; i++) {
                const xPos = 20 + (i * measureWidth);
                const stave = new VF.Stave(xPos, 100, measureWidth);

                // Only add clef, key, and time signature to first measure
                if (i === 0) {
                    stave.addClef(staff.clef);
                    stave.addTimeSignature('4/4');
                    stave.addKeySignature('C');
                }

                stave.setContext(context).draw();
            }

            // Add title showing measure count
            context.setFont('Arial', 32);
            context.fillStyle = '#FFFFFF';
            context.textAlign = 'center';
            context.fillText(
                `${staff.title} - ${measureCount} Measures Ready`,
                staff.canvas.width / 2,
                50
            );

            console.log(`[MUSICAL STAVES 3D] 🎼 Drew ${measureCount} measures for ${staff.title}`);

        } catch (error) {
            console.error('[MUSICAL STAVES 3D] ❌ Error drawing measures:', error);
        }
    }

    /**
     * 🎼 LOCK MELODY → ADD NOTES TO TREBLE CLEF  
     * Prints melody notes from above cubes using voice leading 3 algorithm
     */
    addMelodyNotation(melodyNotes) {
        if (!this.isVisible || !melodyNotes || melodyNotes.length === 0) return;

        console.log(`[MUSICAL STAVES 3D] 🎵 Adding melody notation: ${melodyNotes.length} notes`);
        console.log(`[MUSICAL STAVES 3D] 🎵 Melody notes:`, melodyNotes);

        const trebleStaff = this.staves.treble;
        if (trebleStaff) {
            this.addNotesToStaff(trebleStaff, melodyNotes, 'melody');
        }
    }

    /**
     * 🎼 LOCK BASS → ADD NOTES TO BASS CLEF
     * Prints bass notes using voice leading algorithm  
     */
    addBassNotation(bassNotes) {
        if (!this.isVisible || !bassNotes || bassNotes.length === 0) return;

        console.log(`[MUSICAL STAVES 3D] 🎵 Adding bass notation: ${bassNotes.length} notes`);
        console.log(`[MUSICAL STAVES 3D] 🎵 Bass notes:`, bassNotes);

        const bassStaff = this.staves.bass;
        if (bassStaff) {
            this.addNotesToStaff(bassStaff, bassNotes, 'bass');
        }
    }

    /**
     * Add notes to a specific staff (treble or bass)
     */
    addNotesToStaff(staff, notes, voiceType) {
        const VF = window.VF || (window.Vex ? window.Vex.Flow : null);
        if (!VF || !staff.context || !notes.length) return;

        try {
            console.log(`[MUSICAL STAVES 3D] 🎼 Rendering ${voiceType} notes:`, notes);

            // Clear canvas for transparent background
            staff.context.clearRect(0, 0, staff.canvas.width, staff.canvas.height);

            // Create VexFlow renderer with NO background
            const renderer = new VF.Renderer(staff.canvas, VF.Renderer.Backends.CANVAS);
            const context = renderer.getContext();
            context.setFont('Arial', 10); // No background fill style

            // Create stave
            const stave = new VF.Stave(20, 40, staff.canvas.width - 40);
            const clef = voiceType === 'melody' ? 'treble' : 'bass';
            stave.addClef(clef).addTimeSignature('4/4');
            stave.setContext(context).draw();

            // Convert notes to VexFlow format
            const vfNotes = [];
            for (let i = 0; i < Math.min(notes.length, 8); i++) { // Limit to 8 notes for now
                const noteData = notes[i];
                let pitch = 'C/4'; // Default

                // Extract pitch from different possible formats
                if (typeof noteData === 'string') {
                    pitch = this.convertToVexFlowPitch(noteData);
                } else if (noteData && noteData.note) {
                    pitch = this.convertToVexFlowPitch(noteData.note);
                } else if (noteData && noteData.midi) {
                    pitch = this.midiNumberToVexFlow(noteData.midi);
                } else if (noteData && noteData.pitch) {
                    pitch = this.convertToVexFlowPitch(noteData.pitch);
                }

                // Create whole note
                const note = new VF.StaveNote({
                    clef: clef,
                    keys: [pitch],
                    duration: 'w' // Whole note
                });

                vfNotes.push(note);
            }

            if (vfNotes.length > 0) {
                // Create voice and add notes
                const voice = new VF.Voice({ num_beats: 4 * vfNotes.length, beat_value: 4 });
                voice.addTickables(vfNotes);

                // Format and draw
                const formatter = new VF.Formatter().joinVoices([voice]).format([voice], staff.canvas.width - 80);
                voice.draw(context, stave);

                console.log(`[MUSICAL STAVES 3D] ✅ Rendered ${vfNotes.length} ${voiceType} notes on stave`);
            }

            // Add title
            context.setFont('Arial', 14);
            context.fillStyle = '#000';
            context.fillText(`${staff.title} - ${notes.length} ${voiceType.toUpperCase()} NOTES`, 20, 20);

            // Update texture
            if (staff.mesh && staff.mesh.material && staff.mesh.material.map) {
                staff.mesh.material.map.needsUpdate = true;
            }

        } catch (error) {
            console.error(`[MUSICAL STAVES 3D] ❌ Error rendering ${voiceType} notes:`, error);

            // Fallback: Show error message
            const context = staff.context;
            context.fillStyle = '#FF0000';
            context.fillText(`Error rendering ${voiceType} notes: ${error.message}`, 20, 100);
        }
    }

    /**
     * Convert various pitch formats to VexFlow format
     */
    convertToVexFlowPitch(pitchString) {
        if (!pitchString) return 'C/4';

        // If already in VexFlow format (e.g., "C/4"), return as-is
        if (pitchString.includes('/')) return pitchString;

        // Convert from formats like "C4", "D#3", etc.
        const match = pitchString.match(/([A-G][#b]?)(\d+)/);
        if (match) {
            return `${match[1]}/${match[2]}`;
        }

        return 'C/4'; // Fallback
    }
}

// Export for global use
if (typeof window !== 'undefined') {
    window.MusicalStaves3D = MusicalStaves3D;
}
