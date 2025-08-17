import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener, Input, Output, EventEmitter, NgZone, AfterViewInit } from '@angular/core';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GuitarService } from '@services/guitar/guitar.service';

// Legacy interfaces for compatibility
interface PianoNote {
    display: boolean;
    greyed: boolean;
    image: string;
    glow: boolean;
}

interface PianoKey {
    note: number;
    name: string;
    octave: number;
    frequency: number;
    isBlack: boolean;
    isPressed: boolean;
    x: number;
    width: number;
    height: number;
    // Legacy compatibility
    midi: number;
    pianoX: number;
    pianoY: number;
    display: boolean;
    glow: boolean;
    greyed: boolean;
}

interface RecordedNote {
    note: number;
    timestamp: number;
    velocity: number;
    duration: number;
}

interface PianoSettings {
    octaveRange: { min: number; max: number };
    keyboardLayout: 'piano' | 'compact';
    showNoteNames: boolean;
    showMidiNumbers: boolean;
    sustainPedal: boolean;
    recordingMode: boolean;
    playbackMode: 'realtime' | 'step';
    // Legacy settings
    activeBubbles: boolean;
    activeLosanges: boolean;
    scoreFollow: boolean;
    chordFollowScore: boolean;
    scaleFollowScore: boolean;
    displayMode: boolean;
    // Enhanced settings from legacy
    scaleKey?: string;
    scaleType?: string;
    animationTime?: number;
    selectedAnimation?: string;
    chordTona?: string;
    chordType?: string;
}

@Component({
    selector: 'app-piano',
    templateUrl: './piano.component.html',
    styleUrls: ['./piano.component.scss'],
    standalone: false, // SENSEI FIX: Prevent CLI phantom standalone bug
})
export class PianoComponent implements OnInit, OnDestroy, AfterViewInit {

    @ViewChild('pianoCanvas', { static: true }) pianoCanvas!: ElementRef<HTMLCanvasElement>;

    // Legacy @Input/@Output for compatibility with existing templates
    @Input() visible: boolean = true;
    @Input() set display(val: boolean) {
        this.visible = val;
    }
    @Input() set cur_chord(chord: any) {
        if (chord) {
            this.currentChord = chord;
            this.lightChord(chord);
        }
    }
    @Output() displayChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    private destroy$ = new Subject<void>();
    private canvasContext: CanvasRenderingContext2D | null = null;
    private animationFrame: number | null = null;
    private recordingStartTime: number = 0;

    // Enhanced properties with legacy compatibility
    public pianoKeys: PianoKey[] = [];
    public recordedNotes: RecordedNote[] = [];
    public currentlyPlayingNotes: Set<number> = new Set();

    // Legacy 88-key piano positioning arrays (exact from 717-line version)
    public piano_x = [114, 128, 139, 164, 179, 189, 204, 214, 239, 253, 264, 278, 289, 303, 314, 339, 354, 364, 379, 389, 414, 428, 439, 453, 464, 478, 489, 514, 529, 539, 554, 564, 589, 604, 614, 628, 639, 653, 664, 689, 705, 714, 730, 739, 764, 779, 789, 804, 814, 828, 839, 864, 880, 889, 905, 914, 939, 954, 964, 979, 989, 1004, 1014, 1039, 1055, 1064, 1080, 1089, 1114, 1129, 1139, 1154, 1164, 1179, 1189, 1214, 1230, 1239, 1255, 1264, 1289, 1304, 1314, 1329, 1339, 1354, 1364, 1389];
    public piano_y = [80, 50, 80, 80, 50, 80, 50, 80, 80, 50, 80, 50, 80, 50, 80, 80, 50, 80, 50, 80, 80, 50, 80, 50, 80, 50, 80, 80, 50, 80, 50, 80, 80, 50, 80, 50, 80, 50, 80, 80, 50, 80, 50, 80, 80, 50, 80, 50, 80, 50, 80, 80, 50, 80, 50, 80, 80, 50, 80, 50, 80, 50, 80, 80, 50, 80, 50, 80, 80, 50, 80, 50, 80, 50, 80, 80, 50, 80, 50, 80, 80, 50, 80, 50, 80, 50, 80, 80];
    public piano_midi = [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108];

    // Legacy note arrays
    public notes_sharp = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C'];
    public notes_flat = ['A', 'Bb', 'B', 'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B', 'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B', 'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B', 'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B', 'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B', 'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B', 'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B', 'C'];
    public notes_active = this.notes_flat;

    // Legacy 108-note array structure
    public notes: PianoNote[] = new Array(108);
    public currentChord: any = null;
    private _chordName: string = '';

    // Legacy animation and visual state from 717-line version
    public animationTime: number = 5;
    public anim: Array<string> = ['Misty', 'Summertime', 'Fever', 'Misty-time', 'Off'];
    public selected_anim: string = 'Misty';
    public glowingBubbles: boolean = true;

    // Legacy display modes
    public display_letters: boolean = true;
    public scale_tona: string = 'C';
    public scale_type: string = 'major';
    public chord_tona: string = 'C';
    public chord_type: string = 'major';

    // Legacy follow modes from 717-line version
    public chord_follow_score: boolean = true;
    public scale_follow_score: boolean = true;

    public settings: PianoSettings = {
        octaveRange: { min: 2, max: 6 },
        keyboardLayout: 'piano',
        showNoteNames: true,
        showMidiNumbers: false,
        sustainPedal: false,
        recordingMode: false,
        playbackMode: 'realtime',
        // Legacy settings from 717-line version
        activeBubbles: true,
        activeLosanges: false,
        scoreFollow: true,
        chordFollowScore: true,
        scaleFollowScore: true,
        displayMode: true,
        // Enhanced settings
        scaleKey: 'C',
        scaleType: 'major',
        animationTime: 5,
        selectedAnimation: 'Misty',
        chordTona: 'C',
        chordType: 'major'
    };

    // Piano state
    public isPlaying: boolean = false;
    public currentOctave: number = 4;
    public masterVolume: number = 80;
    public selectedInstrument: string = 'piano';
    public playbackPosition: number = 0;

    // Computer keyboard mapping to piano keys
    private keyboardMap: { [key: string]: number } = {
        'a': 60,  // C4
        'w': 61,  // C#4
        's': 62,  // D4
        'e': 63,  // D#4
        'd': 64,  // E4
        'f': 65,  // F4
        't': 66,  // F#4
        'g': 67,  // G4
        'y': 68,  // G#4
        'h': 69,  // A4
        'u': 70,  // A#4
        'j': 71,  // B4
        'k': 72,  // C5
        'o': 73,  // C#5
        'l': 74,  // D5
        'p': 75,  // D#5
        ';': 76   // E5
    };

    private noteNames: string[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    constructor(private guitarService: GuitarService, private zone: NgZone) {
        // Initialize legacy 108-note array
        this.lightsOff();
    }

    ngOnInit(): void {
        console.log('🎹 Enhanced PianoComponent initialized - Tier 4 with legacy compatibility');
        this.initializePiano();
        this.initializeCanvas();
        this.startRenderLoop();
    }

    ngAfterViewInit(): void {
        console.log('🎹 PianoComponent AfterViewInit - Canvas ready');
        // Additional canvas setup after view initialization
        if (this.pianoCanvas?.nativeElement) {
            this.setupCanvas();
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        console.log('🎹 Enhanced PianoComponent destroyed');
    }

    // Legacy compatibility methods
    public lightsOff(): void {
        this.notes = new Array(108);
        for (let i = 21; i <= 108; i++) {
            this.notes[i] = {
                display: false,
                greyed: false,
                image: "none",
                glow: false
            };
        }
    }

    public lightChord(chord: any): void {
        if (!chord || !this.visible) return;

        this.lightsOff();
        this._chordName = chord.chords ? chord.chords[0] : '';

        if (chord.full_chord && chord.full_chord.midi_notes) {
            this.light(chord.full_chord.midi_notes, chord.full_chord.intervals);
        }
    }

    public light(midiNotes: number[], intervals?: string[]): void {
        if (!midiNotes) return;

        for (const note of midiNotes) {
            if (this.notes[note]) {
                this.notes[note].display = true;
                this.notes[note].glow = this.settings.activeBubbles;
                this.currentlyPlayingNotes.add(note);
            }
        }
    }

    public unlight_all_glow(): void {
        for (let i = 21; i <= 108; i++) {
            if (this.notes[i]) {
                this.notes[i].glow = false;
                this.notes[i].greyed = false;
            }
        }
        this.currentlyPlayingNotes.clear();
    }

    // Legacy setter for compatibility
    set cur_chord_legacy(chord: any) {
        this.lightChord(chord);
    }

    // Keyboard event handling
    @HostListener('window:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        if (event.repeat) return;

        const midiNote = this.keyboardMap[event.key.toLowerCase()];
        if (midiNote !== undefined) {
            event.preventDefault();
            this.playNote(midiNote, this.masterVolume);
        }

        // Special keys
        switch (event.key) {
            case ' ': // Spacebar - sustain pedal
                event.preventDefault();
                this.settings.sustainPedal = true;
                break;
            case 'ArrowUp':
                event.preventDefault();
                this.changeOctave(1);
                break;
            case 'ArrowDown':
                event.preventDefault();
                this.changeOctave(-1);
                break;
        }
    }

    @HostListener('window:keyup', ['$event'])
    onKeyUp(event: KeyboardEvent): void {
        const midiNote = this.keyboardMap[event.key.toLowerCase()];
        if (midiNote !== undefined) {
            this.stopNote(midiNote);
        }

        if (event.key === ' ') {
            this.settings.sustainPedal = false;
            this.releaseAllSustainedNotes();
        }
    }

    // Enhanced Piano initialization with legacy compatibility
    private initializePiano(): void {
        this.pianoKeys = [];

        // Initialize with 88 keys using legacy positioning arrays
        for (let i = 0; i < this.piano_midi.length; i++) {
            const midiNote = this.piano_midi[i];
            const noteIndex = midiNote % 12;
            const octave = Math.floor(midiNote / 12) - 1;
            const noteName = this.noteNames[noteIndex];
            const isBlack = this.isBlackKey(noteIndex);
            const frequency = this.midiToFrequency(midiNote);

            // Use legacy positioning arrays
            const pianoX = this.piano_x[i];
            const pianoY = this.piano_y[i];

            // Calculate modern canvas positioning
            const keyX = pianoX;
            const keyWidth = isBlack ? 30 : 50;
            const keyHeight = isBlack ? 120 : 200;

            this.pianoKeys.push({
                note: midiNote,
                name: noteName,
                octave: octave,
                frequency: frequency,
                isBlack: isBlack,
                isPressed: false,
                x: keyX,
                width: keyWidth,
                height: keyHeight,
                // Legacy compatibility properties
                midi: midiNote,
                pianoX: pianoX,
                pianoY: pianoY,
                display: false,
                glow: false,
                greyed: false
            });
        }

        console.log(`🎹 Piano initialized with ${this.pianoKeys.length} keys (MIDI ${this.piano_midi[0]}-${this.piano_midi[this.piano_midi.length - 1]})`);
    }

    private initializeCanvas(): void {
        if (this.pianoCanvas?.nativeElement) {
            this.canvasContext = this.pianoCanvas.nativeElement.getContext('2d');
            if (this.canvasContext) {
                this.setupCanvas();
            }
        }
    }

    private setupCanvas(): void {
        if (!this.canvasContext || !this.pianoCanvas?.nativeElement) return;

        const canvas = this.pianoCanvas.nativeElement;
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        this.canvasContext.scale(dpr, dpr);

        // Set canvas style dimensions
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
    }

    private startRenderLoop(): void {
        const render = () => {
            this.drawPiano();
            this.animationFrame = requestAnimationFrame(render);
        };
        render();
    }

    // Enhanced drawing methods with legacy chord lighting
    private drawPiano(): void {
        if (!this.canvasContext) return;

        const ctx = this.canvasContext;
        const canvas = this.pianoCanvas.nativeElement;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw white keys first
        this.pianoKeys.filter(key => !key.isBlack).forEach(key => {
            this.drawEnhancedKey(ctx, key);
        });

        // Draw black keys on top
        this.pianoKeys.filter(key => key.isBlack).forEach(key => {
            this.drawEnhancedKey(ctx, key);
        });
    }

    private drawEnhancedKey(ctx: CanvasRenderingContext2D, key: PianoKey): void {
        const isPressed = key.isPressed || this.currentlyPlayingNotes.has(key.note);
        const isLit = this.notes[key.midi] && this.notes[key.midi].display;
        const isGlowing = this.notes[key.midi] && this.notes[key.midi].glow;
        const isGreyed = this.notes[key.midi] && this.notes[key.midi].greyed;

        // Enhanced key background with legacy chord lighting
        if (key.isBlack) {
            if (isLit && isGlowing) {
                ctx.fillStyle = '#ff6b6b'; // Chord highlight for black keys
            } else if (isPressed) {
                ctx.fillStyle = '#555';
            } else {
                ctx.fillStyle = '#222';
            }
        } else {
            if (isLit && isGlowing) {
                ctx.fillStyle = '#4ecdc4'; // Chord highlight for white keys
            } else if (isPressed) {
                ctx.fillStyle = '#ddd';
            } else if (isGreyed) {
                ctx.fillStyle = '#f5f5f5'; // Greyed out for score follow
            } else {
                ctx.fillStyle = '#fff';
            }
        }

        ctx.fillRect(key.x, 10, key.width, key.height);

        // Enhanced key border
        ctx.strokeStyle = isLit ? '#333' : '#ccc';
        ctx.lineWidth = isLit ? 2 : 1;
        ctx.strokeRect(key.x, 10, key.width, key.height);

        // Legacy bubble effects for chord visualization
        if (isLit && this.settings.activeBubbles && !key.isBlack) {
            this.drawChordBubble(ctx, key);
        }

        // Note labels (enhanced from legacy display modes)
        if (this.settings.showNoteNames && !key.isBlack) {
            ctx.fillStyle = isLit ? '#333' : '#666';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';

            const noteText = this.settings.displayMode ?
                `${key.name}${key.octave}` :
                this.notes_active[key.midi - 21] || key.name;

            ctx.fillText(
                noteText,
                key.x + key.width / 2,
                key.height - 10
            );
        }

        // MIDI numbers
        if (this.settings.showMidiNumbers && !key.isBlack) {
            ctx.fillStyle = '#888';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(
                key.note.toString(),
                key.x + key.width / 2,
                key.height - 25
            );
        }

        // Pressed key highlight with legacy animation support
        if (isPressed || isLit) {
            ctx.fillStyle = key.isBlack ?
                (isLit ? '#ff6b6b' : '#ff6b6b') :
                (isLit ? '#4ecdc4' : '#4ecdc4');
            ctx.globalAlpha = isGlowing ? 0.7 : 0.3;
            ctx.fillRect(key.x + 2, 12, key.width - 4, key.height - 4);
            ctx.globalAlpha = 1;
        }
    }

    private drawChordBubble(ctx: CanvasRenderingContext2D, key: PianoKey): void {
        // Legacy bubble visualization for chord notes
        const bubbleX = key.x + key.width / 2;
        const bubbleY = 30;
        const bubbleRadius = 8;

        // Bubble with glow effect
        ctx.beginPath();
        ctx.arc(bubbleX, bubbleY, bubbleRadius, 0, 2 * Math.PI);
        ctx.fillStyle = '#4ecdc4';
        ctx.globalAlpha = 0.8;
        ctx.fill();

        // Bubble border
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 1;
        ctx.stroke();
    }

    // Mouse interaction
    onCanvasClick(event: MouseEvent): void {
        const rect = this.pianoCanvas.nativeElement.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Check black keys first (they're on top)
        let clickedKey = this.pianoKeys.filter(key => key.isBlack).find(key =>
            x >= key.x && x <= key.x + key.width && y >= 10 && y <= 10 + key.height
        );

        // If no black key, check white keys
        if (!clickedKey) {
            clickedKey = this.pianoKeys.filter(key => !key.isBlack).find(key =>
                x >= key.x && x <= key.x + key.width && y >= 10 && y <= 10 + key.height
            );
        }

        if (clickedKey) {
            this.playNote(clickedKey.note, this.masterVolume);

            // Visual feedback
            clickedKey.isPressed = true;
            setTimeout(() => {
                clickedKey!.isPressed = false;
            }, 150);
        }
    }

    // Enhanced Audio methods with legacy MIDI integration
    playNote(midiNote: number, velocity: number = 80): void {
        console.log(`🎵 Playing MIDI note ${midiNote} (${this.getMidiNoteName(midiNote)})`);

        // Legacy: Update notes array for lighting system
        if (this.notes[midiNote]) {
            this.notes[midiNote].display = true;
            this.notes[midiNote].glow = true;
        }

        // Use GuitarService for audio output
        this.guitarService.play(0, midiNote);

        this.currentlyPlayingNotes.add(midiNote);

        // Record note if recording
        if (this.settings.recordingMode) {
            const timestamp = Date.now() - this.recordingStartTime;
            this.recordedNotes.push({
                note: midiNote,
                timestamp: timestamp,
                velocity: velocity,
                duration: 0 // Will be set when note is released
            });
        }

        // Auto-release after duration (if not sustained)
        if (!this.settings.sustainPedal) {
            setTimeout(() => {
                this.stopNote(midiNote);
            }, 1000);
        }
    }

    stopNote(midiNote: number): void {
        this.currentlyPlayingNotes.delete(midiNote);

        // Legacy: Update notes array
        if (this.notes[midiNote]) {
            this.notes[midiNote].display = false;
            this.notes[midiNote].glow = false;
        }

        // Update recorded note duration
        if (this.settings.recordingMode) {
            const recordedNote = this.recordedNotes
                .reverse()
                .find(note => note.note === midiNote && note.duration === 0);
            if (recordedNote) {
                recordedNote.duration = Date.now() - this.recordingStartTime - recordedNote.timestamp;
            }
            this.recordedNotes.reverse(); // Restore original order
        }
    }

    // Utility methods
    private isBlackKey(noteIndex: number): boolean {
        return [1, 3, 6, 8, 10].includes(noteIndex);
    }

    private midiToFrequency(midiNote: number): number {
        return 440 * Math.pow(2, (midiNote - 69) / 12);
    }

    private getMidiNoteName(midiNote: number): string {
        const noteIndex = midiNote % 12;
        const octave = Math.floor(midiNote / 12) - 1;
        return `${this.noteNames[noteIndex]}${octave}`;
    }

    private releaseAllSustainedNotes(): void {
        if (!this.settings.sustainPedal) {
            this.currentlyPlayingNotes.forEach(note => {
                this.stopNote(note);
            });
        }
    }

    // Enhanced legacy compatibility methods from 717-line version
    public refreshScale(): void {
        // Legacy scale refresh functionality
        const scaleKey = this.settings.scaleKey || 'C';
        const scaleType = this.settings.scaleType || 'major';

        console.log(`🎼 Refreshing scale: ${scaleKey} ${scaleType}`);

        // Update active scale notes (legacy compatibility)
        this.updateActiveScale(scaleKey, scaleType);
    }

    private updateActiveScale(key: string, type: string): void {
        // Legacy scale note mapping
        this.notes_active = this.notes_flat; // Default to flats

        // Switch to sharps if scale contains sharps
        if (key.includes('#')) {
            this.notes_active = this.notes_sharp;
        }

        console.log(`🎼 Active notes updated for ${key} ${type}`);
    }

    // Legacy compatibility methods
    public get_class_active(idx: number): boolean {
        return this.notes[idx] ? this.notes[idx].display : false;
    }

    public get_class_glow(idx: number): boolean {
        return this.notes[idx] ? this.notes[idx].glow : false;
    }

    public toggle_piano_score_follow(): void {
        this.settings.scoreFollow = !this.settings.scoreFollow;
        console.log(`🎹 Score follow: ${this.settings.scoreFollow}`);
    }

    public toggle_piano_losanges(): void {
        this.settings.activeLosanges = !this.settings.activeLosanges;
        console.log(`🎹 Losanges: ${this.settings.activeLosanges}`);
    }

    public toggle_piano_chordtones(): void {
        this.settings.activeBubbles = !this.settings.activeBubbles;
        console.log(`🎹 Chord tones: ${this.settings.activeBubbles}`);
    }

    public close_piano(toggle: boolean = false): void {
        if (toggle) {
            this.visible = !this.visible;
        } else {
            this.visible = false;
        }
        this.displayChange.emit(this.visible);
    }

    // String reverse utility (from legacy) - TypeScript compatible
    public reverse = (s: string): string => s.split('').reverse().join('');

    // Advanced chord and scale visualization methods (from 717-line legacy)
    public lightChordFromScore(measure: any, beat?: any): void {
        if (!measure || !this.settings.scoreFollow) return;

        console.log('🎹 Lighting chord from score:', measure);

        // TODO: Implement score chord extraction
        // This would extract chord information from the measure/beat
        // and call this.lightChord() with the chord data
    }

    public refreshFromSelectedScoreChord(data: any): void {
        if (!this.chord_follow_score || !this.settings.scoreFollow) return;

        console.log('🎹 Refreshing from selected score chord:', data);
        // Legacy score chord refresh functionality
    }

    public toggleChordFollowScore(): void {
        this.chord_follow_score = !this.chord_follow_score;
        this.lightsOff();

        console.log(`🎹 Chord follow score: ${this.chord_follow_score}`);

        if (this.chord_follow_score) {
            // Follow score chords
            this.chord_tona = this.currentChord?.tonic || 'C';
            this.chord_type = this.currentChord?.aliases?.[0] || 'major';
        } else {
            // Use manual chord selection
            this.updateManualChord();
        }
    }

    public toggleScaleFollowScore(): void {
        this.scale_follow_score = !this.scale_follow_score;
        console.log(`🎹 Scale follow score: ${this.scale_follow_score}`);

        if (this.scale_follow_score) {
            this.refreshScale();
        }
    }

    private updateManualChord(): void {
        // Legacy manual chord update
        const chordKey = this.chord_tona || 'C';
        const chordType = this.chord_type || 'major';

        console.log(`🎹 Manual chord: ${chordKey} ${chordType}`);

        // TODO: Implement chord creation and lighting
        // This would create a chord object and call this.lightChord()
    }

    // Animation control methods from legacy
    public changeAnimationTime(measure?: any): void {
        if (measure) {
            // Extract animation time from measure
            // Legacy functionality for score-based animation timing
            console.log('🎹 Animation time changed from measure');
        } else {
            console.log(`🎹 Animation time: ${this.animationTime}`);
        }
    }

    public setSelectedAnimation(animation: string): void {
        if (this.anim.includes(animation)) {
            this.selected_anim = animation;
            console.log(`🎹 Selected animation: ${animation}`);
        }
    }

    // Enhanced display mode toggles
    public toggleDisplayMode(): void {
        this.settings.displayMode = !this.settings.displayMode;
        this.display_letters = this.settings.displayMode;
        console.log(`🎹 Display mode (letters): ${this.display_letters}`);
    }

    public setScaleKey(key: string): void {
        this.scale_tona = key;
        this.settings.scaleKey = key;
        if (!this.scale_follow_score) {
            this.refreshScale();
        }
        console.log(`🎹 Scale key: ${key}`);
    }

    public setScaleType(type: string): void {
        this.scale_type = type;
        this.settings.scaleType = type;
        if (!this.scale_follow_score) {
            this.refreshScale();
        }
        console.log(`🎹 Scale type: ${type}`);
    }

    public setChordKey(key: string): void {
        this.chord_tona = key;
        this.settings.chordTona = key;
        if (!this.chord_follow_score) {
            this.updateManualChord();
        }
        console.log(`🎹 Chord key: ${key}`);
    }

    public setChordType(type: string): void {
        this.chord_type = type;
        this.settings.chordType = type;
        if (!this.chord_follow_score) {
            this.updateManualChord();
        }
        console.log(`🎹 Chord type: ${type}`);
    }

    // Legacy visualization state getters
    public getChordName(): string {
        return this._chordName;
    }

    public isVisible(): boolean {
        return this.visible;
    }

    public getAnimationState(): { time: number; selected: string; glowing: boolean } {
        return {
            time: this.animationTime,
            selected: this.selected_anim,
            glowing: this.glowingBubbles
        };
    }

    // Controls - moved back inside PianoComponent class
    changeOctave(direction: number): void {
        const newOctave = this.currentOctave + direction;
        if (newOctave >= 0 && newOctave <= 8) {
            this.currentOctave = newOctave;
            this.updateKeyboardMapping();
            console.log(`Octave changed to: ${this.currentOctave}`);
        }
    }

    private updateKeyboardMapping(): void {
        const baseNote = (this.currentOctave * 12) + 12; // +12 for MIDI offset

        const keys = ['a', 'w', 's', 'e', 'd', 'f', 't', 'g', 'y', 'h', 'u', 'j', 'k', 'o', 'l', 'p', ';'];
        keys.forEach((key, index) => {
            this.keyboardMap[key] = baseNote + index;
        });
    }

    // Recording and playback
    startRecording(): void {
        this.settings.recordingMode = true;
        this.recordedNotes = [];
        this.recordingStartTime = Date.now();
        console.log('🔴 Recording started');
    }

    stopRecording(): void {
        this.settings.recordingMode = false;
        console.log(`🛑 Recording stopped. Captured ${this.recordedNotes.length} notes`);
    }

    playRecording(): void {
        if (this.recordedNotes.length === 0) {
            console.log('No recording to play');
            return;
        }

        this.isPlaying = true;
        this.playbackPosition = 0;
        console.log(`▶️ Playing recording with ${this.recordedNotes.length} notes`);

        // Play notes in sequence with proper timing and duration control
        this.recordedNotes.forEach((recordedNote, index) => {
            setTimeout(() => {
                this.playNote(recordedNote.note, recordedNote.velocity);
                this.playbackPosition = index + 1;

                // Stop the note after its recorded duration
                setTimeout(() => {
                    this.stopNote(recordedNote.note);
                }, recordedNote.duration);

                if (index === this.recordedNotes.length - 1) {
                    this.isPlaying = false;
                    this.playbackPosition = 0;
                    console.log('🏁 Playback completed');
                }
            }, recordedNote.timestamp);
        });
    }

    clearRecording(): void {
        this.recordedNotes = [];
        this.playbackPosition = 0;
        console.log('🗑️ Recording cleared');
    }

    // Settings
    updateSettings(): void {
        this.initializePiano();
        console.log('⚙️ Piano settings updated');
    }

    // Presets
    loadPreset(preset: string): void {
        switch (preset) {
            case 'compact':
                this.settings.octaveRange = { min: 3, max: 5 };
                this.settings.keyboardLayout = 'compact';
                break;
            case 'full':
                this.settings.octaveRange = { min: 1, max: 7 };
                this.settings.keyboardLayout = 'piano';
                break;
            case 'practice':
                this.settings.octaveRange = { min: 2, max: 6 };
                this.settings.showNoteNames = true;
                this.settings.showMidiNumbers = true;
                break;
        }
        this.updateSettings();
        console.log(`🎹 Loaded preset: ${preset}`);
    }

    // Audio Gate C: Test Sound Method
    public async testSound(): Promise<void> {
        try {
            // Ensure AudioContext is resumed
            await (this as any).guitarService['audioContext']?.resume?.();
            await this.guitarService.play(0, 60, 0.5); // C4
            console.log('TestSound triggered');
        } catch (e) {
            console.error('TestSound failed', e);
        }
    }
}

// Legacy PianoDiamondComponent from 717-line version
@Component({
    selector: '[piano-diamond]',
    standalone: false,
    styleUrls: ['./piano.component.scss'],
    template: `
        <svg:path d="M 0.20267886,17.651493 17.802677,0.05149334 35.402678,17.651493 17.802677,35.251499 Z" />
        <svg:text x="45%" y="60%" class="chords_notes_labels piano">{{text}}</svg:text>
    `
})
export class PianoDiamondComponent {
    @Input() x: number = 0;
    @Input() y: number = 0;
    @Input() text: string = '';
}
