import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Chord } from '@tonaljs/tonal';

@Component({
    selector: 'app-chord-chart-magic18',
    templateUrl: './chord-chart-magic18.component.html',
    styleUrls: ['./chord-chart-magic18.component.scss'],
    standalone: false
})
export class ChordChartMagic18Component implements OnInit, AfterViewInit {

    // Reference to existing Novaxe fretboard - NO DUPLICATION!
    @ViewChild('novaxeFretboard') fretboard: any;

    // Chart configuration
    public currentKey: string = 'C';
    public currentMode: 'major' | 'minor' = 'major';

    // The Magic 18 Roman Numerals for Major Key
    public majorKeyChords = [
        { roman: 'I', degree: 1, quality: 'major', symbol: 'C' },
        { roman: 'ii', degree: 2, quality: 'minor', symbol: 'Dm' },
        { roman: 'iii', degree: 3, quality: 'minor', symbol: 'Em' },
        { roman: 'IV', degree: 4, quality: 'major', symbol: 'F' },
        { roman: 'V', degree: 5, quality: 'major', symbol: 'G' },
        { roman: 'vi', degree: 6, quality: 'minor', symbol: 'Am' },
        { roman: 'vii°', degree: 7, quality: 'diminished', symbol: 'Bdim' },
        { roman: 'V7', degree: 5, quality: 'dominant7', symbol: 'G7' },
        { roman: 'vi7', degree: 6, quality: 'minor7', symbol: 'Am7' }
    ];

    // Current active chord
    public activeChord: any = null;
    public activeRoman: string = '';

    // Visual states
    public showFingerings: boolean = true;
    public showIntervals: boolean = true;
    public chordPosition: 'open' | 'barre' = 'open';

    constructor() { }

    ngOnInit(): void {
        // Initialize with C major I chord
        this.selectChord('I');
    }

    ngAfterViewInit(): void {
        // Ensure fretboard is ready before first chord display
        setTimeout(() => {
            this.selectChord('I');
        }, 100);
    }

    // Main chord selection method
    selectChord(romanNumeral: string): void {
        console.log(`🎵 Selecting chord: ${romanNumeral} in key of ${this.currentKey}`);

        const chordData = this.majorKeyChords.find(c => c.roman === romanNumeral);
        if (!chordData) {
            console.warn(`Chord ${romanNumeral} not found`);
            return;
        }

        // Build the actual chord symbol (e.g., "C major" for I in key of C)
        const actualChordSymbol = this.getChordSymbolForKey(chordData, this.currentKey);
        console.log(`🎸 Actual chord: ${actualChordSymbol}`);

        // Get Tonal.js chord object
        const tonalChord = Chord.get(actualChordSymbol);
        console.log('📊 Tonal chord data:', tonalChord);

        // Create chord object in format expected by existing fretboard
        const chordForFretboard = {
            chords: [actualChordSymbol],
            full_chord: {
                ...tonalChord,
                midi_notes: tonalChord.notes.map(note => this.noteToMidi(note)),
                unfiltered_midi: this.getGuitarVoicing(tonalChord, this.chordPosition),
                intervals: tonalChord.intervals || ['1', '3', '5']
            }
        };

        // Send to existing fretboard component
        if (this.fretboard && this.fretboard.light_chord) {
            this.fretboard.light_chord(chordForFretboard);
        }

        // Update our state
        this.activeChord = chordForFretboard;
        this.activeRoman = romanNumeral;

        // Play the chord audio
        this.playChordAudio(chordForFretboard);
    }

    // Convert roman numeral + key to actual chord symbol
    public getChordSymbolForKey(chordData: any, key: string): string {
        const keyNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        const keyIndex = keyNotes.indexOf(key);
        const chordRootIndex = (keyIndex + chordData.degree - 1) % 7;
        const chordRoot = keyNotes[chordRootIndex];

        // Map qualities to chord symbols
        const qualityMap = {
            'major': '',
            'minor': 'm',
            'diminished': 'dim',
            'dominant7': '7',
            'minor7': 'm7'
        };

        return chordRoot + (qualityMap[chordData.quality] || '');
    }

    // Get guitar-specific chord voicing for open position
    private getGuitarVoicing(chord: any, position: 'open' | 'barre'): (number | null)[] {
        // For now, return a simple C major open position
        // This will be enhanced to calculate actual fingerings
        if (chord.tonic === 'C' && position === 'open') {
            // C major open: x-3-2-0-1-0 (low to high: X-C-E-G-C-E)
            return [null, 48, 52, 55, 60, 64]; // MIDI notes for strings 6-1
        }

        // Fallback: basic chord tones
        const midiNotes = chord.notes.map(note => this.noteToMidi(note));
        return [null, null, midiNotes[0], midiNotes[1], midiNotes[2], midiNotes[0] + 12];
    }

    // Simple note to MIDI conversion
    private noteToMidi(noteName: string): number {
        const noteMap = { 'C': 60, 'D': 62, 'E': 64, 'F': 65, 'G': 67, 'A': 69, 'B': 71 };
        const baseName = noteName.charAt(0);
        const accidental = noteName.slice(1);

        let midi = noteMap[baseName] || 60;
        if (accidental.includes('#')) midi++;
        if (accidental.includes('b')) midi--;

        return midi;
    }

    // Play chord audio through existing system
    public playChordAudio(chord: any): void {
        // This will integrate with your existing MIDI/audio system
        console.log('🔊 Playing chord:', chord.chords[0]);
        // TODO: Integrate with existing Novaxe audio system
    }

    // Change key
    changeKey(newKey: string): void {
        this.currentKey = newKey;
        // Refresh current chord in new key
        if (this.activeRoman) {
            this.selectChord(this.activeRoman);
        }
    }

    // Toggle between major and minor
    toggleMode(): void {
        this.currentMode = this.currentMode === 'major' ? 'minor' : 'major';
        // TODO: Implement minor key chord charts
    }
}
