import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import * as Tone from 'tone';

export interface AudioConfig {
    masterVolume: number;
    uiSoundsEnabled: boolean;
    musicalFeedbackEnabled: boolean;
    spatialAudioEnabled: boolean;
    currentKey: string;
}

export interface SoundEffect {
    id: string;
    type: 'ui' | 'musical' | 'ambient' | 'spatial';
    duration: number;
    volume: number;
    key?: string;
    notes?: string[];
    spatialPosition?: { x: number; y: number; z: number };
}

@Injectable({
    providedIn: 'root'
})
export class AudioManagerService {

    private audioConfigSubject = new BehaviorSubject<AudioConfig>({
        masterVolume: 0.7,
        uiSoundsEnabled: true,
        musicalFeedbackEnabled: true,
        spatialAudioEnabled: true,
        currentKey: 'C'
    });

    public audioConfig$: Observable<AudioConfig> = this.audioConfigSubject.asObservable();

    // Tone.js instruments and effects
    private synth: Tone.PolySynth | null = null;
    private uiSynth: Tone.Synth | null = null;
    private spatialPanner: Tone.Panner3D | null = null;
    private reverb: Tone.Reverb | null = null;
    private masterGain: Tone.Gain | null = null;

    // Sound effect cache
    private soundEffects = new Map<string, SoundEffect>();

    // Active ambient loops
    private ambientLoops = new Map<string, Tone.Player>();

    // Audio context state
    private isInitialized: boolean = false;
    private isStarted: boolean = false;

    constructor() {
        this.initializeAudioSystem();
        this.createSoundEffectLibrary();
    }

    private async initializeAudioSystem(): Promise<void> {
        try {
            // Initialize Tone.js audio system
            await Tone.start();
            this.isStarted = true;

            // Create master gain for volume control
            this.masterGain = new Tone.Gain(0.7).toDestination();

            // Create reverb for spatial depth
            this.reverb = new Tone.Reverb(2.5);
            await this.reverb.generate();

            // Create spatial panner for 3D audio
            this.spatialPanner = new Tone.Panner3D({
                panningModel: 'HRTF',
                distanceModel: 'inverse',
                refDistance: 1,
                maxDistance: 100,
                rolloffFactor: 1
            });

            // Create main musical synthesizer
            this.synth = new Tone.PolySynth(Tone.Synth, {
                oscillator: {
                    type: 'sawtooth'
                },
                envelope: {
                    attack: 0.1,
                    decay: 0.2,
                    sustain: 0.3,
                    release: 0.8
                }
            });

            // Create UI sound synthesizer
            this.uiSynth = new Tone.Synth({
                oscillator: {
                    type: 'sine'
                },
                envelope: {
                    attack: 0.01,
                    decay: 0.1,
                    sustain: 0.1,
                    release: 0.2
                }
            });

            // Connect audio chain: Synth -> Reverb -> Panner -> Master
            this.synth.chain(this.reverb, this.spatialPanner, this.masterGain);
            this.uiSynth.chain(this.masterGain);

            this.isInitialized = true;
            console.log('🎵 AudioManager: Advanced audio system initialized!');

        } catch (error) {
            console.warn('AudioManager initialization failed:', error);
        }
    }

    private createSoundEffectLibrary(): void {
        // UI Sound Effects
        this.soundEffects.set('tab_hover', {
            id: 'tab_hover',
            type: 'ui',
            duration: 0.1,
            volume: 0.3,
            notes: ['C5']
        });

        this.soundEffects.set('tab_open', {
            id: 'tab_open',
            type: 'ui',
            duration: 0.4,
            volume: 0.5,
            notes: ['C4', 'E4', 'G4'] // C major chord
        });

        this.soundEffects.set('tab_close', {
            id: 'tab_close',
            type: 'ui',
            duration: 0.3,
            volume: 0.4,
            notes: ['G4', 'E4', 'C4'] // Reverse chord
        });

        // Musical Feedback Effects
        this.soundEffects.set('cubes_hover', {
            id: 'cubes_hover',
            type: 'musical',
            duration: 0.15,
            volume: 0.4,
            notes: ['A4']
        });

        this.soundEffects.set('cubes_open', {
            id: 'cubes_open',
            type: 'musical',
            duration: 0.6,
            volume: 0.6,
            notes: ['A3', 'C#4', 'E4', 'A4'] // A major chord with octave
        });

        this.soundEffects.set('cubes_close', {
            id: 'cubes_close',
            type: 'musical',
            duration: 0.4,
            volume: 0.5,
            notes: ['A4', 'E4', 'C#4', 'A3'] // Reverse A major
        });

        // Spatial Effects for 3D Cubes
        this.soundEffects.set('cube_click', {
            id: 'cube_click',
            type: 'spatial',
            duration: 0.2,
            volume: 0.6,
            spatialPosition: { x: 0, y: 0, z: 0 } // Will be updated dynamically
        });

        console.log('🎵 AudioManager: Sound effect library created');
    }

    // Public methods for playing sounds
    public async playUISound(soundId: string, options?: { key?: string; volume?: number }): Promise<void> {
        if (!this.isInitialized || !this.audioConfigSubject.value.uiSoundsEnabled) return;

        const effect = this.soundEffects.get(soundId);
        if (!effect || !this.uiSynth) return;

        try {
            const volume = (options?.volume || effect.volume) * this.audioConfigSubject.value.masterVolume;
            const notes = this.transposeToKey(effect.notes || ['C4'], options?.key || 'C');

            this.uiSynth.volume.value = Tone.gainToDb(volume);

            notes.forEach((note, index) => {
                this.uiSynth?.triggerAttackRelease(note, effect.duration, `+${index * 0.05}`);
            });

        } catch (error) {
            console.warn(`Failed to play UI sound ${soundId}:`, error);
        }
    }

    public async playMusicalChord(notes: string[], options?: { duration?: number; volume?: number; key?: string }): Promise<void> {
        if (!this.isInitialized || !this.audioConfigSubject.value.musicalFeedbackEnabled || !this.synth) return;

        try {
            const duration = options?.duration || 0.8;
            const volume = (options?.volume || 0.5) * this.audioConfigSubject.value.masterVolume;
            const transposedNotes = this.transposeToKey(notes, options?.key || this.audioConfigSubject.value.currentKey);

            this.synth.volume.value = Tone.gainToDb(volume);
            this.synth.triggerAttackRelease(transposedNotes, duration);

        } catch (error) {
            console.warn('Failed to play musical chord:', error);
        }
    }

    public async playSpatialSound(soundId: string, position: { x: number; y: number; z: number }): Promise<void> {
        if (!this.isInitialized || !this.audioConfigSubject.value.spatialAudioEnabled || !this.spatialPanner || !this.synth) return;

        const effect = this.soundEffects.get(soundId);
        if (!effect) return;

        try {
            // Update spatial position
            this.spatialPanner.positionX.value = position.x;
            this.spatialPanner.positionY.value = position.y;
            this.spatialPanner.positionZ.value = position.z;

            const volume = effect.volume * this.audioConfigSubject.value.masterVolume;
            this.synth.volume.value = Tone.gainToDb(volume);

            const notes = effect.notes || ['A4'];
            this.synth.triggerAttackRelease(notes, effect.duration);

        } catch (error) {
            console.warn(`Failed to play spatial sound ${soundId}:`, error);
        }
    }

    public async startAmbientLoop(soundId: string, options?: { volume?: number; fadeIn?: number }): Promise<void> {
        if (!this.isInitialized) return;

        try {
            // Stop existing ambient loop if running
            this.stopAmbientLoop(soundId);

            // Create new player for ambient sound
            // Note: In production, load actual audio files
            const player = new Tone.Player({
                url: `assets/audio/ambient/${soundId}.mp3`,
                loop: true,
                fadeIn: options?.fadeIn || 2,
                volume: Tone.gainToDb((options?.volume || 0.3) * this.audioConfigSubject.value.masterVolume)
            }).connect(this.masterGain || Tone.Destination);

            await Tone.loaded();
            player.start();

            this.ambientLoops.set(soundId, player);

        } catch (error) {
            console.warn(`Failed to start ambient loop ${soundId}:`, error);
        }
    }

    public stopAmbientLoop(soundId: string): void {
        const loop = this.ambientLoops.get(soundId);
        if (loop) {
            loop.stop();
            loop.dispose();
            this.ambientLoops.delete(soundId);
        }
    }

    public stopAllAmbientLoops(): void {
        this.ambientLoops.forEach((loop, id) => {
            this.stopAmbientLoop(id);
        });
    }

    // Musical theory helpers
    private transposeToKey(notes: string[], targetKey: string): string[] {
        // Simple transposition - in production, use more sophisticated music theory
        const keyOffset = this.getKeyOffset('C', targetKey);

        return notes.map(note => {
            const noteWithoutOctave = note.replace(/\d/, '');
            const octave = note.match(/\d/) ? note.match(/\d/)![0] : '4';
            const transposedNote = this.transposeNote(noteWithoutOctave, keyOffset);
            return `${transposedNote}${octave}`;
        });
    }

    private getKeyOffset(fromKey: string, toKey: string): number {
        const chromatic = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const fromIndex = chromatic.indexOf(fromKey);
        const toIndex = chromatic.indexOf(toKey);
        return (toIndex - fromIndex + 12) % 12;
    }

    private transposeNote(note: string, semitones: number): string {
        const chromatic = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const currentIndex = chromatic.indexOf(note);
        const newIndex = (currentIndex + semitones + 12) % 12;
        return chromatic[newIndex];
    }

    // Configuration methods
    public setMasterVolume(volume: number): void {
        const config = this.audioConfigSubject.value;
        this.audioConfigSubject.next({ ...config, masterVolume: Math.max(0, Math.min(1, volume)) });

        if (this.masterGain) {
            this.masterGain.gain.rampTo(volume, 0.1);
        }
    }

    public setCurrentKey(key: string): void {
        const config = this.audioConfigSubject.value;
        this.audioConfigSubject.next({ ...config, currentKey: key });
    }

    public toggleUISound(): void {
        const config = this.audioConfigSubject.value;
        this.audioConfigSubject.next({ ...config, uiSoundsEnabled: !config.uiSoundsEnabled });
    }

    public toggleMusicalFeedback(): void {
        const config = this.audioConfigSubject.value;
        this.audioConfigSubject.next({ ...config, musicalFeedbackEnabled: !config.musicalFeedbackEnabled });
    }

    public toggleSpatialAudio(): void {
        const config = this.audioConfigSubject.value;
        this.audioConfigSubject.next({ ...config, spatialAudioEnabled: !config.spatialAudioEnabled });
    }

    // Cleanup
    public dispose(): void {
        this.stopAllAmbientLoops();

        this.synth?.dispose();
        this.uiSynth?.dispose();
        this.spatialPanner?.dispose();
        this.reverb?.dispose();
        this.masterGain?.dispose();

        this.isInitialized = false;
        console.log('🎵 AudioManager: System disposed');
    }

    // Getters
    public get config(): AudioConfig {
        return this.audioConfigSubject.value;
    }

    public get initialized(): boolean {
        return this.isInitialized;
    }
}
