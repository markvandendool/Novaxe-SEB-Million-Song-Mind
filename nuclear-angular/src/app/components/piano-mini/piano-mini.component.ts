import { Component, OnInit } from '@angular/core';
import { GuitarService } from '@services/guitar/guitar.service';

@Component({
    selector: 'app-piano-mini',
    templateUrl: './piano-mini.component.html',
    styleUrls: ['./piano-mini.component.scss'],
    standalone: false, // SENSEI FIX: Prevent CLI phantom standalone bug
})
export class PianoMiniComponent implements OnInit {

    public selectedNote: number = 60; // Middle C
    public octave: number = 4;
    public velocity: number = 80;
    public isPlaying: boolean = false;

    // Piano keys (simplified mini keyboard)
    public whiteKeys: Array<{ note: number, name: string }> = [
        { note: 60, name: 'C' },
        { note: 62, name: 'D' },
        { note: 64, name: 'E' },
        { note: 65, name: 'F' },
        { note: 67, name: 'G' },
        { note: 69, name: 'A' },
        { note: 71, name: 'B' }
    ];

    public blackKeys: Array<{ note: number, name: string, position: number }> = [
        { note: 61, name: 'C#', position: 1 },
        { note: 63, name: 'D#', position: 2 },
        { note: 66, name: 'F#', position: 4 },
        { note: 68, name: 'G#', position: 5 },
        { note: 70, name: 'A#', position: 6 }
    ];

    constructor(private guitarService: GuitarService) { }

    ngOnInit(): void {
        console.log('🎹 PianoMiniComponent initialized with MIDI integration');
    }

    playNote(midiNote: number, keyName: string): void {
        this.selectedNote = midiNote;
        this.isPlaying = true;

        console.log(`🎵 Playing ${keyName} (MIDI: ${midiNote})`);

        // Use GuitarService for sound generation (WebAudioFont integration)
        this.guitarService.play(0, midiNote);

        // Reset playing state after short duration
        setTimeout(() => {
            this.isPlaying = false;
        }, 200);
    }

    changeOctave(direction: number): void {
        const newOctave = this.octave + direction;
        if (newOctave >= 1 && newOctave <= 7) {
            this.octave = newOctave;
            this.updateKeysForOctave();
        }
    }

    private updateKeysForOctave(): void {
        const baseNote = (this.octave * 12) + 12; // C in the selected octave

        this.whiteKeys = [
            { note: baseNote, name: 'C' },
            { note: baseNote + 2, name: 'D' },
            { note: baseNote + 4, name: 'E' },
            { note: baseNote + 5, name: 'F' },
            { note: baseNote + 7, name: 'G' },
            { note: baseNote + 9, name: 'A' },
            { note: baseNote + 11, name: 'B' }
        ];

        this.blackKeys = [
            { note: baseNote + 1, name: 'C#', position: 1 },
            { note: baseNote + 3, name: 'D#', position: 2 },
            { note: baseNote + 6, name: 'F#', position: 4 },
            { note: baseNote + 8, name: 'G#', position: 5 },
            { note: baseNote + 10, name: 'A#', position: 6 }
        ];
    }
}
