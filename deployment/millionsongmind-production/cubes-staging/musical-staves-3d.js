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

        // Piano staff positioning in 3D space
        this.positions = {
            treble: { x: 0, y: 6.5, z: 8 },  // Treble clef staff
            bass: { x: 0, y: 3.5, z: 8 }     // Bass clef staff  
        };
        
        // Voice visual cues
        this.voiceColors = {
            voice1: '#FF6B6B',  // Red for first instrument/voice
            voice2: '#4ECDC4',  // Teal for middle harmonies  
            voice3: '#45B7D1'   // Blue for bass voice
        };

        console.log('[MUSICAL STAVES 3D] Initialized');
    }

    /**
     * Create piano staves for sophisticated 3-7 note harmony display
     */
    createStaves() {
        if (!window.VF) {
            console.error('[MUSICAL STAVES 3D] VexFlow not loaded');
            return;
        }

        // Clear existing staves
        this.clearStaves();

        try {
            // Create treble staff (upper harmonies from ChordCubes)
            this.staves.treble = this.createSingleStaff(
                this.positions.treble,
                'treble',
                'Treble - Upper Harmonies'
            );

            // Create bass staff (bass notes + lower harmonies from ChordCubes)
            this.staves.bass = this.createSingleStaff(
                this.positions.bass,
                'bass',
                'Bass - Lower Harmonies & Bass'
            );

            this.isVisible = true;
            console.log('[MUSICAL STAVES 3D] ✅ Created piano staff system (treble + bass)');

        } catch (error) {
            console.error('[MUSICAL STAVES 3D] ❌ Error creating staves:', error);
        }
    }

    /**
     * Create a single staff at specified 3D position
     */
    createSingleStaff(position, clef, title) {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 200;

        const renderer = new VF.Renderer(canvas, VF.Renderer.Backends.CANVAS);
        const context = renderer.getContext();
        context.setFont('Arial', 12);

        // Create stave with clef and time signature
        const stave = new VF.Stave(10, 40, 750);
        stave.addClef(clef);
        stave.addTimeSignature('4/4');
        stave.addKeySignature('C'); // C Major for now
        stave.setContext(context).draw();

        // Add title
        context.fillStyle = '#000';
        context.fillText(title, 10, 20);

        // Convert canvas to texture and create 3D mesh
        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;

        const geometry = new THREE.PlaneGeometry(6, 1.5);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.1
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(position.x, position.y, position.z);
        mesh.lookAt(this.camera.position); // Always face camera

        this.scene.add(mesh);

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
}

// Export for global use
if (typeof window !== 'undefined') {
    window.MusicalStaves3D = MusicalStaves3D;
}
