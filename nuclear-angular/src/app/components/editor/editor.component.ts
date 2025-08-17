import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface ChordDefinition {
    name: string;
    symbol: string;
    notes: number[];
    frets: number[];
    fingering: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    variations: ChordVariation[];
}

interface ChordVariation {
    name: string;
    frets: number[];
    fingering: string[];
}

interface ChordProgression {
    name: string;
    chords: string[];
    key: string;
    tempo: number;
    timeSignature: string;
}

interface EditorState {
    currentChord: ChordDefinition | null;
    selectedProgression: ChordProgression | null;
    isPlaying: boolean;
    currentPosition: number;
    editMode: 'chord' | 'progression' | 'theory';
    zoom: number;
}

@Component({
    selector: 'app-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.scss'],
    standalone: false, // SENSEI FIX: Prevent CLI phantom standalone bug
})
export class EditorComponent implements OnInit, OnDestroy {

    @ViewChild('chordCanvas', { static: true }) chordCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('progressionCanvas', { static: true }) progressionCanvas!: ElementRef<HTMLCanvasElement>;

    private destroy$ = new Subject<void>();
    private canvasContext: CanvasRenderingContext2D | null = null;
    private progressionContext: CanvasRenderingContext2D | null = null;

    public editorState: EditorState = {
        currentChord: null,
        selectedProgression: null,
        isPlaying: false,
        currentPosition: 0,
        editMode: 'chord',
        zoom: 1.0
    };

    // Comprehensive chord database
    public chordDatabase: ChordDefinition[] = [
        // Major Chords
        {
            name: 'C Major', symbol: 'C', notes: [60, 64, 67], frets: [0, 1, 0, 2, 1, 0],
            fingering: ['', '1', '', '2', '1', ''], difficulty: 'beginner',
            variations: [
                { name: 'C Barre', frets: [8, 10, 10, 9, 8, 8], fingering: ['1', '3', '4', '2', '1', '1'] }
            ]
        },
        {
            name: 'G Major', symbol: 'G', notes: [67, 71, 74], frets: [3, 2, 0, 0, 3, 3],
            fingering: ['2', '1', '', '', '3', '4'], difficulty: 'beginner',
            variations: [
                { name: 'G Barre', frets: [3, 5, 5, 4, 3, 3], fingering: ['1', '3', '4', '2', '1', '1'] }
            ]
        },
        {
            name: 'D Major', symbol: 'D', notes: [62, 66, 69], frets: [-1, -1, 0, 2, 3, 2],
            fingering: ['', '', '', '1', '3', '2'], difficulty: 'beginner',
            variations: []
        },
        // Minor Chords  
        {
            name: 'A Minor', symbol: 'Am', notes: [57, 60, 64], frets: [0, 0, 2, 2, 1, 0],
            fingering: ['', '', '2', '3', '1', ''], difficulty: 'beginner',
            variations: [
                { name: 'Am Barre', frets: [5, 7, 7, 5, 5, 5], fingering: ['1', '3', '4', '1', '1', '1'] }
            ]
        },
        {
            name: 'E Minor', symbol: 'Em', notes: [64, 67, 71], frets: [0, 2, 2, 0, 0, 0],
            fingering: ['', '2', '3', '', '', ''], difficulty: 'beginner',
            variations: []
        },
        // Seventh Chords
        {
            name: 'G7', symbol: 'G7', notes: [67, 71, 74, 77], frets: [3, 2, 0, 0, 0, 1],
            fingering: ['3', '2', '', '', '', '1'], difficulty: 'intermediate',
            variations: []
        },
        {
            name: 'C Major 7', symbol: 'Cmaj7', notes: [60, 64, 67, 71], frets: [0, 3, 2, 0, 0, 0],
            fingering: ['', '3', '2', '', '', ''], difficulty: 'intermediate',
            variations: []
        }
    ];

    // Chord progressions
    public progressionDatabase: ChordProgression[] = [
        { name: 'I-V-vi-IV', chords: ['C', 'G', 'Am', 'F'], key: 'C', tempo: 120, timeSignature: '4/4' },
        { name: 'ii-V-I', chords: ['Dm', 'G7', 'Cmaj7'], key: 'C', tempo: 100, timeSignature: '4/4' },
        { name: 'I-vi-ii-V', chords: ['C', 'Am', 'Dm', 'G7'], key: 'C', tempo: 110, timeSignature: '4/4' },
        { name: 'Blues 12-bar', chords: ['C', 'C', 'C', 'C', 'F', 'F', 'C', 'C', 'G7', 'F', 'C', 'G7'], key: 'C', tempo: 90, timeSignature: '4/4' }
    ];

    public filteredChords: ChordDefinition[] = [];
    public searchTerm: string = '';
    public difficultyFilter: string = 'all';
    public isEditingChord: boolean = false;
    public customChord: ChordDefinition = this.createEmptyChord();

    constructor() { }

    ngOnInit(): void {
        console.log('🎼 EditorComponent initialized - Advanced chord editing system');
        this.initializeCanvas();
        this.filterChords();
        this.loadDefaultProgression();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // Canvas initialization
    private initializeCanvas(): void {
        if (this.chordCanvas?.nativeElement) {
            this.canvasContext = this.chordCanvas.nativeElement.getContext('2d');
            if (this.canvasContext) {
                this.setupCanvas(this.canvasContext, this.chordCanvas.nativeElement);
            }
        }

        if (this.progressionCanvas?.nativeElement) {
            this.progressionContext = this.progressionCanvas.nativeElement.getContext('2d');
            if (this.progressionContext) {
                this.setupCanvas(this.progressionContext, this.progressionCanvas.nativeElement);
            }
        }
    }

    private setupCanvas(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        context.scale(dpr, dpr);
    }

    // Chord management
    selectChord(chord: ChordDefinition): void {
        this.editorState.currentChord = chord;
        this.drawChordDiagram(chord);
        console.log(`Selected chord: ${chord.name} (${chord.symbol})`);
    }

    createNewChord(): void {
        this.isEditingChord = true;
        this.customChord = this.createEmptyChord();
        this.editorState.editMode = 'chord';
    }

    saveCustomChord(): void {
        if (this.validateChord(this.customChord)) {
            this.chordDatabase.push({ ...this.customChord });
            this.filterChords();
            this.isEditingChord = false;
            console.log(`Saved custom chord: ${this.customChord.name}`);
        }
    }

    deleteChord(chord: ChordDefinition): void {
        const index = this.chordDatabase.indexOf(chord);
        if (index > -1) {
            this.chordDatabase.splice(index, 1);
            this.filterChords();
            console.log(`Deleted chord: ${chord.name}`);
        }
    }

    // Chord progression management
    selectProgression(progression: ChordProgression): void {
        this.editorState.selectedProgression = progression;
        this.editorState.currentPosition = 0;
        this.drawProgression(progression);
        console.log(`Selected progression: ${progression.name}`);
    }

    playProgression(): void {
        if (!this.editorState.selectedProgression) return;

        this.editorState.isPlaying = true;
        this.editorState.currentPosition = 0;
        console.log('Playing progression...');

        // Simulate progression playback
        const interval = (60 / this.editorState.selectedProgression.tempo) * 1000;
        const playNextChord = () => {
            if (!this.editorState.isPlaying || !this.editorState.selectedProgression) return;

            const chordName = this.editorState.selectedProgression.chords[this.editorState.currentPosition];
            const chord = this.chordDatabase.find(c => c.symbol === chordName);

            if (chord) {
                this.selectChord(chord);
                this.editorState.currentPosition = (this.editorState.currentPosition + 1) % this.editorState.selectedProgression.chords.length;
                setTimeout(playNextChord, interval);
            }
        };

        playNextChord();
    }

    stopProgression(): void {
        this.editorState.isPlaying = false;
        this.editorState.currentPosition = 0;
        console.log('Stopped progression');
    }

    // Drawing methods
    private drawChordDiagram(chord: ChordDefinition): void {
        if (!this.canvasContext) return;

        const ctx = this.canvasContext;
        const canvas = this.chordCanvas.nativeElement;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw guitar neck
        const neckWidth = 200;
        const neckHeight = 250;
        const fretHeight = neckHeight / 5;
        const stringSpacing = neckWidth / 5;

        // Frets (horizontal lines)
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        for (let i = 0; i <= 5; i++) {
            ctx.beginPath();
            ctx.moveTo(20, 20 + i * fretHeight);
            ctx.lineTo(20 + neckWidth, 20 + i * fretHeight);
            ctx.stroke();
        }

        // Strings (vertical lines)  
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            ctx.beginPath();
            ctx.moveTo(20 + i * stringSpacing, 20);
            ctx.lineTo(20 + i * stringSpacing, 20 + neckHeight);
            ctx.stroke();
        }

        // Draw finger positions
        ctx.fillStyle = '#e74c3c';
        for (let i = 0; i < chord.frets.length; i++) {
            const fret = chord.frets[i];
            if (fret > 0 && fret <= 5) {
                const x = 20 + i * stringSpacing;
                const y = 20 + (fret - 0.5) * fretHeight;
                ctx.beginPath();
                ctx.arc(x, y, 8, 0, 2 * Math.PI);
                ctx.fill();

                // Draw fingering number
                ctx.fillStyle = 'white';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(chord.fingering[i] || '', x, y + 4);
                ctx.fillStyle = '#e74c3c';
            }
        }
    }

    private drawProgression(progression: ChordProgression): void {
        if (!this.progressionContext) return;

        const ctx = this.progressionContext;
        const canvas = this.progressionCanvas.nativeElement;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const chordWidth = canvas.width / progression.chords.length;

        progression.chords.forEach((chordName, index) => {
            const x = index * chordWidth;
            const isActive = index === this.editorState.currentPosition;

            // Draw chord box
            ctx.fillStyle = isActive ? '#3498db' : '#ecf0f1';
            ctx.fillRect(x + 5, 20, chordWidth - 10, 60);

            // Draw chord name
            ctx.fillStyle = isActive ? 'white' : '#2c3e50';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(chordName, x + chordWidth / 2, 55);
        });
    }

    // Utility methods
    private createEmptyChord(): ChordDefinition {
        return {
            name: '',
            symbol: '',
            notes: [],
            frets: [0, 0, 0, 0, 0, 0],
            fingering: ['', '', '', '', '', ''],
            difficulty: 'beginner',
            variations: []
        };
    }

    private validateChord(chord: ChordDefinition): boolean {
        return chord.name.trim() !== '' &&
            chord.symbol.trim() !== '' &&
            chord.frets.length === 6;
    }

    private loadDefaultProgression(): void {
        if (this.progressionDatabase.length > 0) {
            this.selectProgression(this.progressionDatabase[0]);
        }
    }

    // Filter and search
    filterChords(): void {
        let filtered = this.chordDatabase;

        if (this.searchTerm.trim()) {
            filtered = filtered.filter(chord =>
                chord.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                chord.symbol.toLowerCase().includes(this.searchTerm.toLowerCase())
            );
        }

        if (this.difficultyFilter !== 'all') {
            filtered = filtered.filter(chord => chord.difficulty === this.difficultyFilter);
        }

        this.filteredChords = filtered;
    }

    onSearchChange(): void {
        this.filterChords();
    }

    onDifficultyChange(): void {
        this.filterChords();
    }

    // Edit mode switching
    setEditMode(mode: 'chord' | 'progression' | 'theory'): void {
        this.editorState.editMode = mode;
    }

    // Zoom controls
    zoomIn(): void {
        this.editorState.zoom = Math.min(this.editorState.zoom * 1.2, 3.0);
    }

    zoomOut(): void {
        this.editorState.zoom = Math.max(this.editorState.zoom * 0.8, 0.5);
    }

    resetZoom(): void {
        this.editorState.zoom = 1.0;
    }
}
