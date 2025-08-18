import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-midi-chord-detect-simple',
    templateUrl: './midi-chord-detect-simple.component.html',
    styleUrls: ['./midi-chord-detect-simple.component.scss'],
    standalone: false, // SENSEI FIX: Prevent CLI phantom standalone bug
})
export class MidiChordDetectSimpleComponent implements OnInit {

    public detectedChord: string = 'None';
    public midiNotes: number[] = [];

    constructor() { }

    ngOnInit(): void {
        console.log('🎯 MidiChordDetectSimpleComponent initialized (migrated from 30 lines)');
    }

    simulateChordDetection(): void {
        // Simulate detecting a C major chord
        this.midiNotes = [60, 64, 67]; // C, E, G
        this.detectedChord = 'C Major';
        console.log('🎵 Detected chord:', this.detectedChord, 'Notes:', this.midiNotes);
    }

}
