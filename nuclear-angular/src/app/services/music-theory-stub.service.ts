import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class MusicTheoryStubService {

    // Stub methods to replace tonal.js functionality
    getNote(noteName: string) {
        return { name: noteName, midi: 60 };
    }

    getChord(chordName: string) {
        return { name: chordName, notes: [] };
    }

    getScale(scaleName: string) {
        return { name: scaleName, notes: [] };
    }

    transpose(note: string, interval: string) {
        return note;
    }
}
