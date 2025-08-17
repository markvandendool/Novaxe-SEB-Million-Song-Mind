import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class GuitarService {

    constructor() { }

    play(delay: number, midiNote: number): void {
        console.log(`Playing note ${midiNote} with delay ${delay}ms`);
        // TODO: Implement actual guitar sound synthesis
        // This requires WebAudioFont and MidiService integration
    }
}
