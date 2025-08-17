// Music Utils Service Enhanced - Angular 20 Migration  
// Enhanced implementation for Tier 2 component support
// Full implementation: 848 lines to be added incrementally

import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class MusicUtilsService {

    // Core reactive streams
    public chordSubject = new BehaviorSubject<Object>({});

    // Enhanced music theory data for Tier 2 components
    private scales = {
        major: { intervals: [0, 2, 4, 5, 7, 9, 11], description: 'Major scale - bright and happy' },
        minor: { intervals: [0, 2, 3, 5, 7, 8, 10], description: 'Natural minor - melancholic' },
        dorian: { intervals: [0, 2, 3, 5, 7, 9, 10], description: 'Dorian mode - jazzy minor' },
        mixolydian: { intervals: [0, 2, 4, 5, 7, 9, 10], description: 'Mixolydian - bluesy major' },
        pentatonic: { intervals: [0, 2, 4, 7, 9], description: 'Pentatonic - versatile 5-note scale' }
    };

    private chords = {
        'C': { notes: ['C', 'E', 'G'], intervals: [0, 4, 7] },
        'Dm': { notes: ['D', 'F', 'A'], intervals: [2, 5, 9] },
        'Em': { notes: ['E', 'G', 'B'], intervals: [4, 7, 11] },
        'F': { notes: ['F', 'A', 'C'], intervals: [5, 9, 0] },
        'G': { notes: ['G', 'B', 'D'], intervals: [7, 11, 2] },
        'Am': { notes: ['A', 'C', 'E'], intervals: [9, 0, 4] },
        'Bdim': { notes: ['B', 'D', 'F'], intervals: [11, 2, 5] }
    };

    private noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    // Stub data - simplified versions of complex music theory objects
    public scale = { name: 'major', notes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'] };
    public scaleNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

    private fifthsCycle = {
        '#': ['c', 'g', 'd', 'a', 'e', 'b', 'f#', 'c#', 'g#', 'd#', 'a#', 'f'],
        'b': ['c', 'f', 'bb', 'eb', 'ab', 'db', 'gb', 'b', 'e', 'a', 'd', 'g']
    };

    constructor(private zone: NgZone) {
        console.log('🎵 MusicUtilsService enhanced - Angular 20 migration');
    }

    // ENHANCED METHODS - Improved implementations for Tier 2 components

    /**
     * Get degree from root note - ENHANCED IMPLEMENTATION
     */
    getDegreeFromRoot(root: string): number {
        console.log('🎯 MusicUtilsService.getDegreeFromRoot() enhanced', root);
        const noteIndex = this.noteNames.indexOf(root.toUpperCase());
        return noteIndex !== -1 ? noteIndex + 1 : 1;
    }

    /**
     * Get note names from MIDI numbers - ENHANCED IMPLEMENTATION
     */
    getNotesName(notes: any, tonaNotes?: any): Observable<string[]> {
        console.log('🎹 MusicUtilsService.getNotesName() enhanced');
        if (Array.isArray(notes)) {
            const noteNames = notes.map(note => this.midiToNoteName(note));
            return of(noteNames);
        }
        return of(this.scaleNotes);
    }

    /**
     * Get enhanced chord information - ENHANCED for Tier 2 components
     */
    getChord(chordName: string): Observable<any> {
        console.log('🎼 MusicUtilsService.getChord() enhanced:', chordName);

        const chordData = this.chords[chordName as keyof typeof this.chords];
        if (!chordData) {
            return of({
                name: chordName,
                notes: ['C', 'E', 'G'],
                intervals: [0, 4, 7],
                quality: 'major'
            });
        }

        return of({
            name: chordName,
            notes: chordData.notes,
            intervals: chordData.intervals,
            quality: this.getChordQuality(chordName)
        });
    }

    /**
     * Get enhanced scale information - ENHANCED for Tier 2 components
     */
    getScale(scaleName: string, root: string = 'C'): Observable<any> {
        console.log('📏 MusicUtilsService.getScale() enhanced:', scaleName, root);

        const scaleData = this.scales[scaleName as keyof typeof this.scales];
        if (!scaleData) {
            return of({ name: scaleName, root, notes: this.scaleNotes, intervals: [0, 2, 4, 5, 7, 9, 11] });
        }

        const rootIndex = this.noteNames.indexOf(root);
        const scaleNotes = scaleData.intervals.map(interval =>
            this.noteNames[(rootIndex + interval) % 12]
        );

        return of({
            name: scaleName,
            root: root,
            notes: scaleNotes,
            intervals: scaleData.intervals,
            description: scaleData.description
        });
    }

    /**
     * Get available scales - NEW for scale-selector component
     */
    getAvailableScales(): Observable<any[]> {
        console.log('� MusicUtilsService.getAvailableScales() enhanced');

        const scaleList = Object.entries(this.scales).map(([name, data]) => ({
            name,
            intervals: data.intervals,
            description: data.description,
            category: this.getScaleCategory(name)
        }));

        return of(scaleList);
    }

    /**
     * Get chord quality helper - ENHANCED
     */
    private getChordQuality(chordName: string): string {
        if (chordName.includes('m') && !chordName.includes('maj')) return 'minor';
        if (chordName.includes('dim')) return 'diminished';
        if (chordName.includes('aug')) return 'augmented';
        if (chordName.includes('7')) return 'seventh';
        return 'major';
    }

    /**
     * Get scale category helper - ENHANCED
     */
    private getScaleCategory(scaleName: string): string {
        if (['major', 'minor'].includes(scaleName)) return 'traditional';
        if (['dorian', 'mixolydian', 'lydian', 'phrygian'].includes(scaleName)) return 'modal';
        if (['pentatonic', 'blues'].includes(scaleName)) return 'ethnic';
        return 'other';
    }

    /**
     * Get MIDI note with enhanced validation - ENHANCED
     */
    getMidiNote(noteName: string, octave: number = 4): number {
        console.log('🎛️ MusicUtilsService.getMidiNote() enhanced:', noteName, octave);

        const noteIndex = this.noteNames.indexOf(noteName.toUpperCase());
        if (noteIndex === -1) {
            console.warn('Invalid note name:', noteName);
            return 60; // Default to middle C
        }

        const midiNote = (octave + 1) * 12 + noteIndex;
        return Math.max(0, Math.min(127, midiNote)); // Clamp to valid MIDI range
    }    /**
     * Transpose notes - ENHANCED IMPLEMENTATION
     */
    transpose(notes: string[], semitones: number): string[] {
        console.log('🔄 MusicUtilsService.transpose() enhanced', notes, semitones);
        return notes.map(note => {
            const noteIndex = this.noteNames.indexOf(note.toUpperCase());
            if (noteIndex === -1) return note;
            const newIndex = (noteIndex + semitones + 12) % 12;
            return this.noteNames[newIndex];
        });
    }

    /**
     * Get fifths cycle - ENHANCED IMPLEMENTATION
     */
    getFifthsCycle(direction: '#' | 'b' = '#'): string[] {
        console.log('⭕ MusicUtilsService.getFifthsCycle() enhanced', direction);
        return this.fifthsCycle[direction];
    }

    /**
     * Analyze chord progression - ENHANCED IMPLEMENTATION
     */
    analyzeProgression(chords: string[]): Observable<any> {
        console.log('🔍 MusicUtilsService.analyzeProgression() enhanced', chords);
        return of({
            chords: chords,
            key: 'C major',
            analysis: this.getProgressionAnalysis(chords),
            confidence: 0.85
        });
    }

    /**
     * Convert MIDI to note name - ENHANCED IMPLEMENTATION
     */
    midiToNoteName(midiNumber: number): string {
        console.log('🔢 MusicUtilsService.midiToNoteName() enhanced', midiNumber);
        return this.noteNames[midiNumber % 12];
    }

    /**
     * Get progression analysis helper - ENHANCED
     */
    private getProgressionAnalysis(chords: string[]): string {
        const commonProgressions: { [key: string]: string } = {
            'C,Am,F,G': 'vi-IV-I-V (Pop progression)',
            'Am,F,C,G': 'vi-IV-I-V (Pop progression)',
            'C,F,Am,G': 'I-IV-vi-V (Classic progression)',
            'C,G,Am,F': 'I-V-vi-IV (Very common)'
        };

        const chordKey = chords.join(',');
        return commonProgressions[chordKey] || 'Custom progression';
    }

    // Observable getters
    getChordSubject(): Observable<Object> {
        return this.chordSubject.asObservable();
    }

    // Update chord subject
    updateChord(chord: Object): void {
        console.log('📡 MusicUtilsService.updateChord() called (STUB)', chord);
        this.chordSubject.next(chord);
    }
}

/**
 * MIGRATION NOTES:
 * 
 * This stub enables component migration by providing:
 * 1. Compatible method signatures for existing components
 * 2. Basic music theory calculations for development/testing  
 * 3. Reactive streams for component communication
 * 4. Console logging to track component interactions
 * 
 * IMPLEMENTATION ROADMAP:
 * - Phase 1: Basic method stubs with simple return values (CURRENT)
 * - Phase 2: Load actual music theory data (scales, chords, intervals)
 * - Phase 3: Implement core music theory calculations
 * - Phase 4: Full 848-line business logic integration
 * - Phase 5: Advanced features (tonality analysis, chord detection, etc.)
 * 
 * COMPONENT COMPATIBILITY:
 * Components can be migrated immediately and will receive stub responses.
 * Real music theory calculations will be added incrementally.
 */
