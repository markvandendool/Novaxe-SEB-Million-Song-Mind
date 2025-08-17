import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GuitarService } from '@services/guitar/guitar.service';

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
}

@Component({
    selector: 'app-piano',
    templateUrl: './piano.component.html',
    styleUrls: ['./piano.component.scss'],
    standalone: false, // SENSEI FIX: Prevent CLI phantom standalone bug
})
export class PianoComponent implements OnInit, OnDestroy {

    @ViewChild('pianoCanvas', { static: true }) pianoCanvas!: ElementRef<HTMLCanvasElement>;

    private destroy$ = new Subject<void>();
    private canvasContext: CanvasRenderingContext2D | null = null;
    private animationFrame: number | null = null;
    private recordingStartTime: number = 0;

    public pianoKeys: PianoKey[] = [];
    public recordedNotes: RecordedNote[] = [];
    public currentlyPlayingNotes: Set<number> = new Set();

    public settings: PianoSettings = {
        octaveRange: { min: 2, max: 6 },
        keyboardLayout: 'piano',
        showNoteNames: true,
        showMidiNumbers: false,
        sustainPedal: false,
        recordingMode: false,
        playbackMode: 'realtime'
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

    constructor(private guitarService: GuitarService) { }

    ngOnInit(): void {
        console.log('🎹 Full PianoComponent initialized with advanced MIDI integration');
        this.initializePiano();
        this.initializeCanvas();
        this.startRenderLoop();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
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

    // Piano initialization
    private initializePiano(): void {
        this.pianoKeys = [];
        const totalKeys = (this.settings.octaveRange.max - this.settings.octaveRange.min + 1) * 12;
        const whiteKeyWidth = 50;
        const blackKeyWidth = 30;
        const whiteKeyHeight = 200;
        const blackKeyHeight = 120;

        let whiteKeyX = 0;

        for (let octave = this.settings.octaveRange.min; octave <= this.settings.octaveRange.max; octave++) {
            for (let note = 0; note < 12; note++) {
                const midiNote = (octave * 12) + note + 12; // +12 for MIDI offset
                const noteName = this.noteNames[note];
                const isBlack = this.isBlackKey(note);
                const frequency = this.midiToFrequency(midiNote);

                let keyX: number;
                let keyWidth: number;
                let keyHeight: number;

                if (isBlack) {
                    keyX = whiteKeyX - (blackKeyWidth / 2);
                    keyWidth = blackKeyWidth;
                    keyHeight = blackKeyHeight;
                } else {
                    keyX = whiteKeyX;
                    keyWidth = whiteKeyWidth;
                    keyHeight = whiteKeyHeight;
                    whiteKeyX += whiteKeyWidth;
                }

                this.pianoKeys.push({
                    note: midiNote,
                    name: noteName,
                    octave: octave,
                    frequency: frequency,
                    isBlack: isBlack,
                    isPressed: false,
                    x: keyX,
                    width: keyWidth,
                    height: keyHeight
                });
            }
        }
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

    // Drawing methods
    private drawPiano(): void {
        if (!this.canvasContext) return;

        const ctx = this.canvasContext;
        const canvas = this.pianoCanvas.nativeElement;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw white keys first
        this.pianoKeys.filter(key => !key.isBlack).forEach(key => {
            this.drawKey(ctx, key);
        });

        // Draw black keys on top
        this.pianoKeys.filter(key => key.isBlack).forEach(key => {
            this.drawKey(ctx, key);
        });
    }

    private drawKey(ctx: CanvasRenderingContext2D, key: PianoKey): void {
        const isPressed = key.isPressed || this.currentlyPlayingNotes.has(key.note);

        // Key background
        if (key.isBlack) {
            ctx.fillStyle = isPressed ? '#555' : '#222';
        } else {
            ctx.fillStyle = isPressed ? '#ddd' : '#fff';
        }

        ctx.fillRect(key.x, 10, key.width, key.height);

        // Key border
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(key.x, 10, key.width, key.height);

        // Note labels
        if (this.settings.showNoteNames && !key.isBlack) {
            ctx.fillStyle = '#666';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(
                `${key.name}${key.octave}`,
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

        // Pressed key highlight
        if (isPressed) {
            ctx.fillStyle = key.isBlack ? '#ff6b6b' : '#4ecdc4';
            ctx.globalAlpha = 0.3;
            ctx.fillRect(key.x + 2, 12, key.width - 4, key.height - 4);
            ctx.globalAlpha = 1;
        }
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

    // Audio methods
    playNote(midiNote: number, velocity: number = 80): void {
        console.log(`🎵 Playing MIDI note ${midiNote} (${this.getMidiNoteName(midiNote)})`);

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

    // Controls
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
        if (this.recordedNotes.length === 0) return;

        this.isPlaying = true;
        this.playbackPosition = 0;

        console.log('▶️ Playing recording...');

        this.recordedNotes.forEach(recordedNote => {
            setTimeout(() => {
                this.playNote(recordedNote.note, recordedNote.velocity);

                // Stop the note after its recorded duration
                setTimeout(() => {
                    this.stopNote(recordedNote.note);
                }, recordedNote.duration);

            }, recordedNote.timestamp);
        });

        // Calculate total playback time
        const totalDuration = Math.max(...this.recordedNotes.map(note => note.timestamp + note.duration));
        setTimeout(() => {
            this.isPlaying = false;
            console.log('⏹️ Playback finished');
        }, totalDuration);
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
}
