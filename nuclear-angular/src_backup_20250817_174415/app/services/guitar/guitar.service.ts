import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter, take } from 'rxjs/operators';

// Modern 2025 WebAudioFont loading
declare global {
    interface Window {
        WebAudioFontPlayer: any;
        _tone_0250_SoundBlasterOld_sf2: any;
    }
}

@Injectable({
    providedIn: 'root'
})
export class GuitarService {
    private audioContext: AudioContext;
    private player: any;
    private guitarInstrument: any;
    private instrumentReady$ = new BehaviorSubject<boolean>(false);
    private usingSynthesizerFallback = false;

    constructor() {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.loadWebAudioFont();
    }

    private async loadWebAudioFont(): Promise<void> {
        try {
            // Load WebAudioFont Player script
            const script = document.createElement('script');
            script.src = 'https://surikov.github.io/webaudiofont/npm/dist/WebAudioFontPlayer.js';

            await new Promise<void>((resolve, reject) => {
                script.onload = () => resolve();
                script.onerror = () => reject(new Error('Failed to load WebAudioFont'));
                document.head.appendChild(script);
            });

            // Initialize WebAudioFont player
            this.player = new (window as any).WebAudioFontPlayer();
            console.log('🎸 WebAudioFont player initialized, attempting instrument loading...');

            // Use correct 2025 WebAudioFont API for dynamic loading
            const instrumentUrl = 'https://surikov.github.io/webaudiofontdata/sound/0250_SoundBlasterOld_sf2.js';
            const variableName = '_tone_0250_SoundBlasterOld_sf2';

            console.log(`🎸 Loading guitar instrument from: ${instrumentUrl}`);

            this.player.loader.startLoad(this.audioContext, instrumentUrl, variableName);

            this.player.loader.waitLoad(() => {
                try {
                    this.guitarInstrument = (window as any)[variableName];
                    if (this.guitarInstrument) {
                        console.log(`✅ WebAudioFont guitar instrument loaded successfully!`, this.guitarInstrument);
                        this.instrumentReady$.next(true);
                    } else {
                        console.warn(`⚠️ Guitar instrument variable ${variableName} not found, using synthesizer fallback`);
                        this.createSynthesizerFallback();
                    }
                } catch (loadError) {
                    console.warn('⚠️ WebAudioFont instrument loading failed, using synthesizer fallback:', loadError);
                    this.createSynthesizerFallback();
                }
            });

            console.log('🎸 Guitar service initialization complete');
        } catch (error) {
            console.error('❌ Failed to load WebAudioFont:', error);
            this.createSynthesizerFallback();
        }
    }

    private createSynthesizerFallback(): void {
        console.log('🎵 Creating synthesizer fallback for audio proof...');
        this.usingSynthesizerFallback = true;
        this.instrumentReady$.next(true);
    }

    private playSynthesizedNote(midiNote: number, when: number, duration: number): void {
        // Create a simple guitar-like synthesized sound
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        // Convert MIDI note to frequency
        const frequency = 440 * Math.pow(2, (midiNote - 69) / 12);

        // Set up oscillator (sawtooth wave for guitar-like sound)
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(frequency, when);

        // Set up gain envelope (attack-decay for guitar-like pluck)
        gainNode.gain.setValueAtTime(0, when);
        gainNode.gain.linearRampToValueAtTime(0.3, when + 0.01); // Quick attack
        gainNode.gain.exponentialRampToValueAtTime(0.1, when + 0.1); // Decay
        gainNode.gain.exponentialRampToValueAtTime(0.001, when + duration); // Sustain and release

        // Connect and play
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start(when);
        oscillator.stop(when + duration);

        console.log(`🎵 Synthesized guitar note ${midiNote} at ${frequency.toFixed(1)}Hz`);
    }

    async play(delay: number, midiNote: number, duration: number = 0.5): Promise<void> {
        if (!this.instrumentReady$.value) {
            await this.instrumentReady$.pipe(
                filter(ready => ready),
                take(1)
            ).toPromise();
        }

        try {
            const when = this.audioContext.currentTime + (delay / 1000);

            // Check if we're using synthesizer fallback
            if (this.usingSynthesizerFallback) {
                console.log(`🎵 Playing synthesized note ${midiNote} (fallback mode)`);
                this.playSynthesizedNote(midiNote, when, duration);
                return;
            }

            // Try to use WebAudioFont with loaded guitar instrument
            if (this.player && this.player.queueWaveTable && this.guitarInstrument) {
                console.log(`🎸 Playing guitar note ${midiNote} with WebAudioFont`);
                this.player.queueWaveTable(
                    this.audioContext,
                    this.audioContext.destination,
                    this.guitarInstrument,
                    when,
                    midiNote,
                    duration
                );
                return;
            } else {
                console.log(`⚠️ WebAudioFont guitar instrument not available - using synthesizer for note ${midiNote}`);
                this.playSynthesizedNote(midiNote, when, duration);
            }
        } catch (error) {
            console.error('Failed to play note:', error);
            console.log(`🎸 Fallback: Playing guitar note ${midiNote} with delay ${delay}ms using synthesizer`);
            const when = this.audioContext.currentTime + (delay / 1000);
            this.playSynthesizedNote(midiNote, when, duration);
        }
    }

    // Additional method for chord playing
    async playChord(notes: number[], delay: number = 0, duration: number = 0.5): Promise<void> {
        for (const note of notes) {
            await this.play(delay, note, duration);
        }
    }

    // Method to check if service is ready
    get isReady(): boolean {
        return this.instrumentReady$.value;
    }
}
