import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GuitarService } from '@services/guitar/guitar.service';

interface FretPosition {
    string: number;    // 0-5 (low E to high E)
    fret: number;      // 0-24
    note: string;
    midiNote: number;
    frequency: number;
    isPressed: boolean;
    isHighlighted: boolean;
}

interface ChordShape {
    name: string;
    frets: number[];   // Array of 6 fret positions for strings [0-5]
    fingering: string[];
    difficulty: 'easy' | 'medium' | 'hard';
    category: 'open' | 'barre' | 'power';
    rootNote: string;
}

interface Scale {
    name: string;
    pattern: number[]; // Semitone pattern
    positions: FretPosition[];
}

interface FretboardSettings {
    numberOfFrets: number;
    showFretNumbers: boolean;
    showNoteNames: boolean;
    showIntervals: boolean;
    tuning: string[];
    visualMode: 'chord' | 'scale' | 'notes';
    selectedChord: ChordShape | null;
    selectedScale: Scale | null;
    rootNote: string;
}

@Component({
    selector: 'app-fretboard',
    templateUrl: './fretboard.component.html',
    styleUrls: ['./fretboard.component.scss'],
    standalone: false, // SENSEI FIX: Prevent CLI phantom standalone bug
})
export class FretboardComponent implements OnInit, OnDestroy {

    @ViewChild('fretboardCanvas', { static: true }) fretboardCanvas!: ElementRef<HTMLCanvasElement>;

    private destroy$ = new Subject<void>();
    private canvasContext: CanvasRenderingContext2D | null = null;
    private animationFrame: number | null = null;

    public fretPositions: FretPosition[] = [];
    public playingNotes: Set<number> = new Set();

    public settings: FretboardSettings = {
        numberOfFrets: 12,
        showFretNumbers: true,
        showNoteNames: true,
        showIntervals: false,
        tuning: ['E', 'A', 'D', 'G', 'B', 'E'], // Standard tuning (low to high)
        visualMode: 'chord',
        selectedChord: null,
        selectedScale: null,
        rootNote: 'C'
    };

    // Standard guitar tuning MIDI notes (4th octave)
    private baseTuning: number[] = [40, 45, 50, 55, 59, 64]; // E2, A2, D3, G3, B3, E4

    // Comprehensive chord database
    public chordDatabase: ChordShape[] = [
        // Open Chords
        { name: 'C Major', frets: [-1, 3, 2, 0, 1, 0], fingering: ['', '3', '2', '', '1', ''], difficulty: 'easy', category: 'open', rootNote: 'C' },
        { name: 'G Major', frets: [3, 2, 0, 0, 3, 3], fingering: ['2', '1', '', '', '3', '4'], difficulty: 'easy', category: 'open', rootNote: 'G' },
        { name: 'D Major', frets: [-1, -1, 0, 2, 3, 2], fingering: ['', '', '', '1', '3', '2'], difficulty: 'easy', category: 'open', rootNote: 'D' },
        { name: 'A Major', frets: [-1, 0, 2, 2, 2, 0], fingering: ['', '', '1', '2', '3', ''], difficulty: 'easy', category: 'open', rootNote: 'A' },
        { name: 'E Major', frets: [0, 2, 2, 1, 0, 0], fingering: ['', '2', '3', '1', '', ''], difficulty: 'easy', category: 'open', rootNote: 'E' },

        // Minor Chords
        { name: 'A Minor', frets: [-1, 0, 2, 2, 1, 0], fingering: ['', '', '2', '3', '1', ''], difficulty: 'easy', category: 'open', rootNote: 'A' },
        { name: 'E Minor', frets: [0, 2, 2, 0, 0, 0], fingering: ['', '2', '3', '', '', ''], difficulty: 'easy', category: 'open', rootNote: 'E' },
        { name: 'D Minor', frets: [-1, -1, 0, 2, 3, 1], fingering: ['', '', '', '1', '3', '2'], difficulty: 'medium', category: 'open', rootNote: 'D' },

        // Barre Chords
        { name: 'F Major (Barre)', frets: [1, 3, 3, 2, 1, 1], fingering: ['1', '3', '4', '2', '1', '1'], difficulty: 'hard', category: 'barre', rootNote: 'F' },
        { name: 'B Minor (Barre)', frets: [-1, 2, 4, 4, 3, 2], fingering: ['', '1', '3', '4', '2', '1'], difficulty: 'hard', category: 'barre', rootNote: 'B' },

        // Power Chords
        { name: 'E5 Power', frets: [0, 2, 2, -1, -1, -1], fingering: ['', '1', '2', '', '', ''], difficulty: 'easy', category: 'power', rootNote: 'E' },
        { name: 'A5 Power', frets: [-1, 0, 2, 2, -1, -1], fingering: ['', '', '1', '2', '', ''], difficulty: 'easy', category: 'power', rootNote: 'A' }
    ];

    // Scale database
    public scaleDatabase: Scale[] = [
        { name: 'Major Pentatonic', pattern: [0, 2, 4, 7, 9], positions: [] },
        { name: 'Minor Pentatonic', pattern: [0, 3, 5, 7, 10], positions: [] },
        { name: 'Blues Scale', pattern: [0, 3, 5, 6, 7, 10], positions: [] },
        { name: 'Major Scale', pattern: [0, 2, 4, 5, 7, 9, 11], positions: [] },
        { name: 'Natural Minor', pattern: [0, 2, 3, 5, 7, 8, 10], positions: [] }
    ];

    public filteredChords: ChordShape[] = [];
    public chordFilter: string = 'all';
    public noteNames: string[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    constructor(private guitarService: GuitarService) { }

    ngOnInit(): void {
        console.log('🎸 FretboardComponent initialized with guitar visualization');
        this.initializeFretboard();
        this.initializeCanvas();
        this.filterChords();
        this.startRenderLoop();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }

    // Fretboard initialization
    private initializeFretboard(): void {
        this.fretPositions = [];

        for (let stringIndex = 0; stringIndex < 6; stringIndex++) {
            for (let fretNumber = 0; fretNumber <= this.settings.numberOfFrets; fretNumber++) {
                const midiNote = this.baseTuning[stringIndex] + fretNumber;
                const noteIndex = midiNote % 12;
                const noteName = this.noteNames[noteIndex];
                const frequency = this.midiToFrequency(midiNote);

                this.fretPositions.push({
                    string: stringIndex,
                    fret: fretNumber,
                    note: noteName,
                    midiNote: midiNote,
                    frequency: frequency,
                    isPressed: false,
                    isHighlighted: false
                });
            }
        }
    }

    // Canvas setup and rendering
    private initializeCanvas(): void {
        if (this.fretboardCanvas?.nativeElement) {
            this.canvasContext = this.fretboardCanvas.nativeElement.getContext('2d');
            if (this.canvasContext) {
                this.setupCanvas();
            }
        }
    }

    private setupCanvas(): void {
        if (!this.canvasContext || !this.fretboardCanvas?.nativeElement) return;

        const canvas = this.fretboardCanvas.nativeElement;
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        this.canvasContext.scale(dpr, dpr);

        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
    }

    private startRenderLoop(): void {
        const render = () => {
            this.drawFretboard();
            this.animationFrame = requestAnimationFrame(render);
        };
        render();
    }

    // Drawing methods
    private drawFretboard(): void {
        if (!this.canvasContext) return;

        const ctx = this.canvasContext;
        const canvas = this.fretboardCanvas.nativeElement;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const neckWidth = 600;
        const neckHeight = 250;
        const startX = 50;
        const startY = 30;

        // Draw neck background
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(startX, startY, neckWidth, neckHeight);

        // Draw frets
        this.drawFrets(ctx, startX, startY, neckWidth, neckHeight);

        // Draw strings
        this.drawStrings(ctx, startX, startY, neckWidth, neckHeight);

        // Draw fret markers
        this.drawFretMarkers(ctx, startX, startY, neckWidth, neckHeight);

        // Draw notes/chord shapes
        this.drawNotes(ctx, startX, startY, neckWidth, neckHeight);

        // Draw labels
        this.drawLabels(ctx, startX, startY, neckWidth, neckHeight);
    }

    private drawFrets(ctx: CanvasRenderingContext2D, startX: number, startY: number, width: number, height: number): void {
        ctx.strokeStyle = '#C0C0C0';
        ctx.lineWidth = 2;

        const fretWidth = width / this.settings.numberOfFrets;

        for (let i = 0; i <= this.settings.numberOfFrets; i++) {
            const x = startX + (i * fretWidth);
            ctx.beginPath();
            ctx.moveTo(x, startY);
            ctx.lineTo(x, startY + height);
            ctx.stroke();
        }
    }

    private drawStrings(ctx: CanvasRenderingContext2D, startX: number, startY: number, width: number, height: number): void {
        const stringSpacing = height / 5;

        for (let i = 0; i < 6; i++) {
            const y = startY + (i * stringSpacing);

            // Thicker strings for lower notes
            ctx.lineWidth = i < 2 ? 3 : (i < 4 ? 2 : 1);
            ctx.strokeStyle = '#808080';

            ctx.beginPath();
            ctx.moveTo(startX, y);
            ctx.lineTo(startX + width, y);
            ctx.stroke();
        }
    }

    private drawFretMarkers(ctx: CanvasRenderingContext2D, startX: number, startY: number, width: number, height: number): void {
        const markerFrets = [3, 5, 7, 9, 12];
        const fretWidth = width / this.settings.numberOfFrets;

        ctx.fillStyle = '#DEB887';

        markerFrets.forEach(fret => {
            if (fret <= this.settings.numberOfFrets) {
                const x = startX + ((fret - 0.5) * fretWidth);

                if (fret === 12) {
                    // Double dot for 12th fret
                    ctx.beginPath();
                    ctx.arc(x, startY + height / 3, 6, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(x, startY + 2 * height / 3, 6, 0, 2 * Math.PI);
                    ctx.fill();
                } else {
                    // Single dot
                    ctx.beginPath();
                    ctx.arc(x, startY + height / 2, 6, 0, 2 * Math.PI);
                    ctx.fill();
                }
            }
        });
    }

    private drawNotes(ctx: CanvasRenderingContext2D, startX: number, startY: number, width: number, height: number): void {
        const fretWidth = width / this.settings.numberOfFrets;
        const stringSpacing = height / 5;

        this.fretPositions.forEach(pos => {
            if (pos.isHighlighted || pos.isPressed || this.playingNotes.has(pos.midiNote)) {
                const x = pos.fret === 0 ? startX - 15 : startX + ((pos.fret - 0.5) * fretWidth);
                const y = startY + (pos.string * stringSpacing);

                // Note circle
                ctx.fillStyle = pos.isPressed ? '#ff4757' : (pos.isHighlighted ? '#3742fa' : '#2ed573');
                ctx.beginPath();
                ctx.arc(x, y, 12, 0, 2 * Math.PI);
                ctx.fill();

                // Note name
                if (this.settings.showNoteNames) {
                    ctx.fillStyle = 'white';
                    ctx.font = 'bold 10px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(pos.note, x, y + 3);
                }
            }
        });
    }

    private drawLabels(ctx: CanvasRenderingContext2D, startX: number, startY: number, width: number, height: number): void {
        // String names
        const stringSpacing = height / 5;
        ctx.fillStyle = '#333';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';

        this.settings.tuning.forEach((note, index) => {
            const y = startY + (index * stringSpacing);
            ctx.fillText(note, startX - 30, y + 5);
        });

        // Fret numbers
        if (this.settings.showFretNumbers) {
            const fretWidth = width / this.settings.numberOfFrets;
            ctx.font = '12px Arial';

            for (let i = 1; i <= this.settings.numberOfFrets; i++) {
                const x = startX + ((i - 0.5) * fretWidth);
                ctx.fillText(i.toString(), x, startY - 10);
            }
        }
    }

    // Interaction methods
    onCanvasClick(event: MouseEvent): void {
        const rect = this.fretboardCanvas.nativeElement.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const clickedPosition = this.getPositionFromCoordinates(x, y);
        if (clickedPosition) {
            this.playPosition(clickedPosition);
        }
    }

    private getPositionFromCoordinates(x: number, y: number): FretPosition | null {
        const startX = 50;
        const startY = 30;
        const neckWidth = 600;
        const neckHeight = 250;
        const fretWidth = neckWidth / this.settings.numberOfFrets;
        const stringSpacing = neckHeight / 5;

        // Determine string
        const stringIndex = Math.round((y - startY) / stringSpacing);
        if (stringIndex < 0 || stringIndex >= 6) return null;

        // Determine fret
        let fretNumber = Math.round((x - startX) / fretWidth);
        if (x < startX - 25) fretNumber = 0; // Open string area
        if (fretNumber < 0 || fretNumber > this.settings.numberOfFrets) return null;

        return this.fretPositions.find(pos =>
            pos.string === stringIndex && pos.fret === fretNumber
        ) || null;
    }

    private playPosition(position: FretPosition): void {
        console.log(`🎸 Playing ${position.note} on string ${position.string + 1}, fret ${position.fret}`);

        // Visual feedback
        position.isPressed = true;
        setTimeout(() => {
            position.isPressed = false;
        }, 300);

        // Play sound
        this.guitarService.play(0, position.midiNote);

        // Track playing notes
        this.playingNotes.add(position.midiNote);
        setTimeout(() => {
            this.playingNotes.delete(position.midiNote);
        }, 1000);
    }

    // Chord functionality
    selectChord(chord: ChordShape): void {
        this.settings.selectedChord = chord;
        this.settings.visualMode = 'chord';
        this.highlightChordPositions(chord);
        console.log(`Selected chord: ${chord.name}`);
    }

    private highlightChordPositions(chord: ChordShape): void {
        // Clear previous highlights
        this.fretPositions.forEach(pos => pos.isHighlighted = false);

        // Highlight chord positions
        chord.frets.forEach((fret, stringIndex) => {
            if (fret >= 0) {
                const position = this.fretPositions.find(pos =>
                    pos.string === stringIndex && pos.fret === fret
                );
                if (position) {
                    position.isHighlighted = true;
                }
            }
        });
    }

    playChord(chord: ChordShape): void {
        console.log(`🎸 Playing chord: ${chord.name}`);

        chord.frets.forEach((fret, stringIndex) => {
            if (fret >= 0) {
                const position = this.fretPositions.find(pos =>
                    pos.string === stringIndex && pos.fret === fret
                );
                if (position) {
                    setTimeout(() => {
                        this.playPosition(position);
                    }, stringIndex * 50); // Strum effect
                }
            }
        });
    }

    // Scale functionality
    selectScale(scale: Scale): void {
        this.settings.selectedScale = scale;
        this.settings.visualMode = 'scale';
        this.highlightScalePositions(scale);
        console.log(`Selected scale: ${scale.name}`);
    }

    private highlightScalePositions(scale: Scale): void {
        // Clear previous highlights
        this.fretPositions.forEach(pos => pos.isHighlighted = false);

        const rootNoteIndex = this.noteNames.indexOf(this.settings.rootNote);

        // Find scale notes across the fretboard
        this.fretPositions.forEach(position => {
            const noteIndex = (position.midiNote % 12);
            const intervalFromRoot = (noteIndex - rootNoteIndex + 12) % 12;

            if (scale.pattern.includes(intervalFromRoot)) {
                position.isHighlighted = true;
            }
        });
    }

    // Utility methods
    private midiToFrequency(midiNote: number): number {
        return 440 * Math.pow(2, (midiNote - 69) / 12);
    }

    // Filter methods
    filterChords(): void {
        if (this.chordFilter === 'all') {
            this.filteredChords = this.chordDatabase;
        } else {
            this.filteredChords = this.chordDatabase.filter(chord => chord.category === this.chordFilter);
        }
    }

    // Settings methods
    updateFretCount(): void {
        this.initializeFretboard();
    }

    resetView(): void {
        this.fretPositions.forEach(pos => {
            pos.isHighlighted = false;
            pos.isPressed = false;
        });
        this.playingNotes.clear();
        this.settings.selectedChord = null;
        this.settings.selectedScale = null;
    }
}
