import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface InstrumentConfig {
    id: string;
    name: string;
    stringCount: number;
    tuning: number[]; // MIDI note numbers
    fretCount: number;
    displayName: string;
    abbreviation: string;
}

@Injectable({
    providedIn: 'root'
})
export class InstrumentModelService {

    // Instrument definitions - the single source of truth
    private instruments: { [key: string]: InstrumentConfig } = {
        guitar: {
            id: 'guitar',
            name: 'Guitar',
            stringCount: 6,
            tuning: [64, 59, 55, 50, 45, 40], // E A D G B E (standard)
            fretCount: 24,
            displayName: 'Guitar',
            abbreviation: 'GTR'
        },
        ukulele: {
            id: 'ukulele',
            name: 'Ukulele',
            stringCount: 4,
            tuning: [69, 64, 60, 67], // A E C G (soprano)
            fretCount: 15,
            displayName: 'Ukulele',
            abbreviation: 'UKE'
        },
        bass: {
            id: 'bass',
            name: 'Bass Guitar',
            stringCount: 4,
            tuning: [43, 38, 33, 28], // G D A E (bass)
            fretCount: 24,
            displayName: 'Bass Guitar',
            abbreviation: 'BASS'
        },
        mandolin: {
            id: 'mandolin',
            name: 'Mandolin',
            stringCount: 8, // 4 courses of 2 strings each
            tuning: [74, 74, 67, 67, 60, 60, 53, 53], // E E A A D D G G
            fretCount: 24,
            displayName: 'Mandolin',
            abbreviation: 'MAND'
        },
        banjo: {
            id: 'banjo',
            name: 'Banjo (5-string)',
            stringCount: 5,
            tuning: [67, 59, 55, 62, 67], // G D G B D (open G)
            fretCount: 22,
            displayName: 'Banjo',
            abbreviation: 'BANJO'
        }
    };

    // Current active instrument
    private currentInstrumentSubject = new BehaviorSubject<InstrumentConfig>(this.instruments.guitar);
    public currentInstrument$ = this.currentInstrumentSubject.asObservable();

    constructor() { }

    // Get current instrument
    getCurrentInstrument(): InstrumentConfig {
        return this.currentInstrumentSubject.value;
    }

    // Switch instrument
    switchInstrument(instrumentId: string): void {
        if (this.instruments[instrumentId]) {
            this.currentInstrumentSubject.next(this.instruments[instrumentId]);
        } else {
            console.warn(`Instrument ${instrumentId} not found`);
        }
    }

    // Get all available instruments
    getAllInstruments(): InstrumentConfig[] {
        return Object.values(this.instruments);
    }

    // Get specific instrument
    getInstrument(id: string): InstrumentConfig | null {
        return this.instruments[id] || null;
    }

    // Generate note arrays for any instrument
    generateNoteArrays(instrument: InstrumentConfig): {
        notes_sharp: string[][],
        notes_flat: string[][],
        notes_midi: number[][]
    } {
        const notes_sharp: string[][] = [];
        const notes_flat: string[][] = [];
        const notes_midi: number[][] = [];

        const sharpNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const flatNotes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

        for (let stringIndex = 0; stringIndex < instrument.stringCount; stringIndex++) {
            const openMidi = instrument.tuning[stringIndex];
            const sharpString: string[] = [];
            const flatString: string[] = [];
            const midiString: number[] = [];

            for (let fret = 0; fret <= instrument.fretCount; fret++) {
                const midiNote = openMidi + fret;
                const noteIndex = midiNote % 12;

                sharpString.push(sharpNotes[noteIndex]);
                flatString.push(flatNotes[noteIndex]);
                midiString.push(midiNote);
            }

            notes_sharp.push(sharpString);
            notes_flat.push(flatString);
            notes_midi.push(midiString);
        }

        return { notes_sharp, notes_flat, notes_midi };
    }

    // Custom tuning support
    setCustomTuning(tuning: number[]): void {
        const current = this.getCurrentInstrument();
        if (tuning.length === current.stringCount) {
            const customInstrument: InstrumentConfig = {
                ...current,
                id: 'custom',
                name: 'Custom Tuning',
                tuning: [...tuning],
                displayName: 'Custom Tuning',
                abbreviation: 'CUSTOM'
            };
            this.currentInstrumentSubject.next(customInstrument);
        } else {
            console.warn(`Tuning array length (${tuning.length}) doesn't match instrument string count (${current.stringCount})`);
        }
    }

    // MIDI note to note name conversion
    midiToNoteName(midiNote: number, useFlats: boolean = false): string {
        const noteNames = useFlats ?
            ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] :
            ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        return noteNames[midiNote % 12];
    }
}
