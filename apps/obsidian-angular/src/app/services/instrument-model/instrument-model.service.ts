import { Injectable } from '@angular/core';

export interface InstrumentTuning {
    name: string;
    notes: string[];
    fretCount: number;
}

export interface InstrumentDefinition {
    name: string;
    tunings: { [key: string]: InstrumentTuning };
    defaultTuning: string;
    icon: string;
}

@Injectable({
    providedIn: 'root'
})
export class InstrumentModelService {
    private currentInstrument: string = 'guitar';
    private currentTuning: string = 'standard';

    private instruments: { [key: string]: InstrumentDefinition } = {
        guitar: {
            name: 'Guitar',
            defaultTuning: 'standard',
            icon: '🎸',
            tunings: {
                standard: { name: 'Standard', notes: ['E', 'A', 'D', 'G', 'B', 'E'], fretCount: 24 },
                dropD: { name: 'Drop D', notes: ['D', 'A', 'D', 'G', 'B', 'E'], fretCount: 24 },
                openG: { name: 'Open G', notes: ['D', 'G', 'D', 'G', 'B', 'D'], fretCount: 24 },
                dadgad: { name: 'DADGAD', notes: ['D', 'A', 'D', 'G', 'A', 'D'], fretCount: 24 }
            }
        },
        ukulele: {
            name: 'Ukulele',
            defaultTuning: 'standard',
            icon: '🏝️',
            tunings: {
                standard: { name: 'Standard', notes: ['G', 'C', 'E', 'A'], fretCount: 15 },
                lowG: { name: 'Low G', notes: ['G', 'C', 'E', 'A'], fretCount: 15 },
                baritone: { name: 'Baritone', notes: ['D', 'G', 'B', 'E'], fretCount: 18 }
            }
        },
        bass: {
            name: 'Bass',
            defaultTuning: 'standard',
            icon: '🎸',
            tunings: {
                standard: { name: 'Standard', notes: ['E', 'A', 'D', 'G'], fretCount: 24 },
                fiveString: { name: '5-String', notes: ['B', 'E', 'A', 'D', 'G'], fretCount: 24 },
                dropD: { name: 'Drop D', notes: ['D', 'A', 'D', 'G'], fretCount: 24 }
            }
        },
        mandolin: {
            name: 'Mandolin',
            defaultTuning: 'standard',
            icon: '🎵',
            tunings: {
                standard: { name: 'Standard', notes: ['G', 'D', 'A', 'E'], fretCount: 20 }
            }
        },
        banjo: {
            name: 'Banjo',
            defaultTuning: 'openG',
            icon: '🪕',
            tunings: {
                openG: { name: 'Open G', notes: ['G', 'D', 'G', 'B', 'D'], fretCount: 22 },
                cTuning: { name: 'C Tuning', notes: ['G', 'C', 'G', 'B', 'D'], fretCount: 22 }
            }
        }
    };

    getCurrentInstrument(): InstrumentDefinition {
        return this.instruments[this.currentInstrument];
    }

    getCurrentTuning(): InstrumentTuning {
        const instrument = this.getCurrentInstrument();
        return instrument.tunings[this.currentTuning];
    }

    switchInstrument(instrumentKey: string): void {
        if (this.instruments[instrumentKey]) {
            this.currentInstrument = instrumentKey;
            const instrument = this.instruments[instrumentKey];
            this.currentTuning = instrument.defaultTuning;
        }
    }

    setTuning(tuningKey: string): void {
        const instrument = this.getCurrentInstrument();
        if (instrument.tunings[tuningKey]) {
            this.currentTuning = tuningKey;
        }
    }

    setCustomTuning(notes: string[]): void {
        const instrument = this.getCurrentInstrument();
        instrument.tunings['custom'] = {
            name: 'Custom',
            notes: notes,
            fretCount: instrument.tunings[instrument.defaultTuning].fretCount
        };
        this.currentTuning = 'custom';
    }

    getAvailableInstruments(): string[] {
        return Object.keys(this.instruments);
    }

    getAvailableTunings(): string[] {
        const instrument = this.getCurrentInstrument();
        return Object.keys(instrument.tunings);
    }

    // Generate note arrays for current instrument/tuning
    generateNoteArrays(): { notes: string[][], notes_midi: number[][] } {
        const tuning = this.getCurrentTuning();
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

        const notes: string[][] = [];
        const notes_midi: number[][] = [];

        tuning.notes.forEach((openNote, stringIndex) => {
            const stringNotes: string[] = [];
            const stringMidi: number[] = [];

            // Find the starting MIDI note (assuming E2 = 40 for guitar low E)
            const baseMidiNote = this.getBaseMidiNote(openNote, stringIndex);

            for (let fret = 0; fret <= tuning.fretCount; fret++) {
                const midiNote = baseMidiNote + fret;
                const noteName = noteNames[midiNote % 12];
                stringNotes.push(noteName);
                stringMidi.push(midiNote);
            }

            notes.push(stringNotes);
            notes_midi.push(stringMidi);
        });

        return { notes, notes_midi };
    }

    private getBaseMidiNote(noteName: string, stringIndex: number): number {
        // MIDI note mappings for guitar standard tuning as reference
        const guitarMidiBase = { 'E': [40, 64], 'A': [45], 'D': [50], 'G': [55], 'B': [59] };

        // Simplified mapping - in real implementation would be more sophisticated
        const noteToMidi: { [key: string]: number } = {
            'C': 36, 'C#': 37, 'D': 38, 'D#': 39, 'E': 40, 'F': 41,
            'F#': 42, 'G': 43, 'G#': 44, 'A': 45, 'A#': 46, 'B': 47
        };

        let baseNote = noteToMidi[noteName];
        if (!baseNote) baseNote = 40; // Default to E

        // Adjust octave based on string and instrument
        if (this.currentInstrument === 'guitar') {
            const octaveAdjustments = [0, 0, 12, 12, 12, 24]; // Low to high strings
            baseNote += octaveAdjustments[stringIndex] || 0;
        }

        return baseNote;
    }
}
