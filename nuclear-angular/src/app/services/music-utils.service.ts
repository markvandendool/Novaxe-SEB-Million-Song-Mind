// Music Utils Service Stub - Angular 20 Migration  
// Minimal implementation to enable component migration without blocking
// Full implementation: 848 lines to be added incrementally

import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class MusicUtilsService {

    // Core reactive streams
    public chordSubject = new BehaviorSubject<Object>({});

    // Stub data - simplified versions of complex music theory objects
    public scale = { name: 'major', notes: ['c', 'd', 'e', 'f', 'g', 'a', 'b'] };
    public scaleNotes = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];

    private fifthsCycle = {
        '#': ['c', 'g', 'd', 'a', 'e', 'b', 'f#', 'c#', 'g#', 'd#', 'a#', 'f'],
        'b': ['c', 'f', 'bb', 'eb', 'ab', 'db', 'gb', 'b', 'e', 'a', 'd', 'g']
    };

    constructor(private zone: NgZone) {
        console.log('🎵 MusicUtilsService stub initialized - Angular 20 migration');
    }

    // STUB METHODS - Basic implementations for component compatibility

    /**
     * Get degree from root note - STUB IMPLEMENTATION
     * TODO: Implement full music theory calculation logic
     */
    getDegreeFromRoot(root: string): number {
        console.log('🎯 MusicUtilsService.getDegreeFromRoot() called (STUB)', root);
        // Simple stub: return position in scale notes
        return this.scaleNotes.indexOf(root.toLowerCase()) + 1;
    }

    /**
     * Get note names from MIDI numbers - STUB IMPLEMENTATION
     */
    getNotesName(notes: any, tonaNotes?: any): Observable<string[]> {
        console.log('🎹 MusicUtilsService.getNotesName() called (STUB)');
        return of(['C', 'D', 'E', 'F', 'G', 'A', 'B']); // Default stub response
    }

    /**
     * Get chord information - STUB IMPLEMENTATION
     */
    getChord(chordName: string): Observable<any> {
        console.log('🎼 MusicUtilsService.getChord() called (STUB)', chordName);
        return of({
            name: chordName,
            notes: ['C', 'E', 'G'], // Basic major chord stub
            intervals: [0, 4, 7],
            quality: 'major'
        });
    }

    /**
     * Get scale information - STUB IMPLEMENTATION  
     */
    getScale(scaleName: string, root?: string): Observable<any> {
        console.log('📏 MusicUtilsService.getScale() called (STUB)', scaleName, root);
        return of({
            name: scaleName,
            root: root || 'C',
            notes: this.scaleNotes,
            intervals: [0, 2, 4, 5, 7, 9, 11]
        });
    }

    /**
     * Transpose notes - STUB IMPLEMENTATION
     */
    transpose(notes: string[], semitones: number): string[] {
        console.log('🔄 MusicUtilsService.transpose() called (STUB)', notes, semitones);
        // Simple stub: return original notes
        return notes;
    }

    /**
     * Get fifths cycle - STUB IMPLEMENTATION
     */
    getFifthsCycle(direction: '#' | 'b' = '#'): string[] {
        console.log('⭕ MusicUtilsService.getFifthsCycle() called (STUB)', direction);
        return this.fifthsCycle[direction];
    }

    /**
     * Analyze chord progression - STUB IMPLEMENTATION
     */
    analyzeProgression(chords: string[]): Observable<any> {
        console.log('🔍 MusicUtilsService.analyzeProgression() called (STUB)', chords);
        return of({
            chords: chords,
            key: 'C major',
            analysis: 'I-V-vi-IV progression',
            confidence: 0.85
        });
    }

    /**
     * Get MIDI note number - STUB IMPLEMENTATION
     */
    getMidiNote(noteName: string, octave: number = 4): number {
        console.log('🎛️ MusicUtilsService.getMidiNote() called (STUB)', noteName, octave);
        const noteMap: { [key: string]: number } = {
            'c': 0, 'd': 2, 'e': 4, 'f': 5, 'g': 7, 'a': 9, 'b': 11
        };
        const baseNote = noteMap[noteName.toLowerCase()] || 0;
        return (octave + 1) * 12 + baseNote;
    }

    /**
     * Convert MIDI to note name - STUB IMPLEMENTATION
     */
    midiToNoteName(midiNumber: number): string {
        console.log('🔢 MusicUtilsService.midiToNoteName() called (STUB)', midiNumber);
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        return notes[midiNumber % 12];
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
