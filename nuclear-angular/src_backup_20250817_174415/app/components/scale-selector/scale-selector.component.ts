import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

interface MusicalScale {
    name: string;
    intervals: number[];
    description: string;
    category: 'major' | 'minor' | 'modal' | 'exotic';
}

@Component({
    selector: 'app-scale-selector',
    templateUrl: './scale-selector.component.html',
    styleUrls: ['./scale-selector.component.scss'],
    standalone: false, // SENSEI FIX: Prevent CLI phantom standalone bug
})
export class ScaleSelectorComponent implements OnInit {

    @Input() scale_tona: any;
    @Input() scale_type: any;
    @Input() measure: any;
    @Input() caged_position: any;

    @Output() scaleSelected = new EventEmitter<MusicalScale>();
    @Output() rootNoteChanged = new EventEmitter<number>();

    public selectedScale: MusicalScale;
    public rootNote: number = 60; // Middle C
    public scaleNotes: number[] = [];

    public rootNoteNames: string[] = [
        'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
    ];

    public musicalScales: MusicalScale[] = [
        // Major Scales
        { name: 'Major', intervals: [0, 2, 4, 5, 7, 9, 11], description: 'The most common major scale', category: 'major' },
        { name: 'Pentatonic Major', intervals: [0, 2, 4, 7, 9], description: 'Five-note major scale', category: 'major' },

        // Minor Scales
        { name: 'Natural Minor', intervals: [0, 2, 3, 5, 7, 8, 10], description: 'Classic minor scale', category: 'minor' },
        { name: 'Harmonic Minor', intervals: [0, 2, 3, 5, 7, 8, 11], description: 'Minor with raised 7th', category: 'minor' },
        { name: 'Pentatonic Minor', intervals: [0, 3, 5, 7, 10], description: 'Five-note minor scale', category: 'minor' },

        // Modal Scales
        { name: 'Dorian', intervals: [0, 2, 3, 5, 7, 9, 10], description: 'Minor with raised 6th', category: 'modal' },
        { name: 'Mixolydian', intervals: [0, 2, 4, 5, 7, 9, 10], description: 'Major with flat 7th', category: 'modal' },
        { name: 'Lydian', intervals: [0, 2, 4, 6, 7, 9, 11], description: 'Major with sharp 4th', category: 'modal' },

        // Exotic Scales
        { name: 'Blues', intervals: [0, 3, 5, 6, 7, 10], description: 'Traditional blues scale', category: 'exotic' },
        { name: 'Whole Tone', intervals: [0, 2, 4, 6, 8, 10], description: 'All whole steps', category: 'exotic' },
        { name: 'Diminished', intervals: [0, 2, 3, 5, 6, 8, 9, 11], description: 'Half-whole pattern', category: 'exotic' }
    ];

    public filteredScales: MusicalScale[] = [];
    public selectedCategory: string = 'all';

    constructor() {
        this.selectedScale = this.musicalScales[0]; // Default to Major
    }

    ngOnInit(): void {
        console.log('🎵 ScaleSelectorComponent initialized with music theory');
        this.filterScales();
        this.calculateScaleNotes();
    }

    selectScale(scale: MusicalScale): void {
        this.selectedScale = scale;
        this.calculateScaleNotes();
        this.scaleSelected.emit(scale);
        console.log(`Selected scale: ${scale.name} - ${scale.description}`);
    }

    changeRootNote(noteIndex: number): void {
        this.rootNote = 60 + noteIndex; // C4 + semitones
        this.calculateScaleNotes();
        this.rootNoteChanged.emit(this.rootNote);
        console.log(`Root note changed to: ${this.rootNoteNames[noteIndex]} (MIDI: ${this.rootNote})`);
    }

    filterScales(): void {
        if (this.selectedCategory === 'all') {
            this.filteredScales = this.musicalScales;
        } else {
            this.filteredScales = this.musicalScales.filter(
                scale => scale.category === this.selectedCategory
            );
        }
    }

    onCategoryChange(): void {
        this.filterScales();
    }

    private calculateScaleNotes(): void {
        this.scaleNotes = this.selectedScale.intervals.map(
            interval => this.rootNote + interval
        );
    }

    getNoteName(midiNote: number): string {
        const noteIndex = midiNote % 12;
        const octave = Math.floor(midiNote / 12) - 1;
        return `${this.rootNoteNames[noteIndex]}${octave}`;
    }

    getRootNoteName(): string {
        const noteIndex = this.rootNote % 12;
        return this.rootNoteNames[noteIndex];
    }
}
