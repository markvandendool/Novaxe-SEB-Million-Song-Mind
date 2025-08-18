import { Component, OnInit, OnDestroy, Input, inject } from '@angular/core';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';

@Component({
    selector: 'app-metro',
    templateUrl: './metro.component.html',
    styleUrls: ['./metro.component.scss'],
    standalone: false
})
export class MetroComponent implements OnInit, OnDestroy {
    // Core metronome properties
    public bpm: number = 90;
    public volume: number = 0.6;
    public isPlaying: boolean = false;

    // Beat tracking
    public subBeat: number = 0;
    public beat: number = 0;
    public measure: number = 0;

    // Configuration
    public nb_subbeat_per_beat: number = 1;
    public nb_beat_per_measure: number = 4;
    public display: 'line' | 'circle' = 'circle';
    public count_display: 'beat' | 'measure' | 'subBeat' | 'measure_only' = 'measure';
    public animation: boolean = true;

    // Audio context (stub)
    private audioContext: AudioContext | null = null;
    private intervalId: any = null;

    // Reactive streams
    private destroy$ = new Subject<void>();

    // Expose Math for template use
    public Math = Math;

    @Input() set metro_volume(value: number) {
        this.volume = value;
        console.log('🎵 Metro volume set to:', value);
    }

    constructor() {
        console.log('🥁 MetroComponent initialized - Angular 20 migration');
    }

    ngOnInit(): void {
        console.log('🎯 MetroComponent OnInit - setting up metronome');
        this.initializeAudioContext();
    }

    ngOnDestroy(): void {
        console.log('🛑 MetroComponent OnDestroy - cleaning up');
        this.stop();
        this.destroy$.next();
        this.destroy$.complete();

        if (this.audioContext) {
            this.audioContext.close();
        }
    }

    // Core metronome functions
    play(): void {
        console.log('▶️ MetroComponent play() - starting metronome');
        this.isPlaying = true;

        const interval = (60 / this.bpm) * 1000; // Convert BPM to milliseconds

        this.intervalId = setInterval(() => {
            this.tick();
        }, interval);
    }

    pause(): void {
        console.log('⏸️ MetroComponent pause() - pausing metronome');
        this.isPlaying = false;

        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    stop(): void {
        console.log('⏹️ MetroComponent stop() - stopping metronome');
        this.pause();
        this.resetCounters();
    }

    private tick(): void {
        // Advance beat counters
        this.subBeat++;

        if (this.subBeat >= this.nb_subbeat_per_beat) {
            this.subBeat = 0;
            this.beat++;

            if (this.beat >= this.nb_beat_per_measure) {
                this.beat = 0;
                this.measure++;
            }
        }

        // Play sound (stub implementation)
        this.playMetronomeSound();

        console.log(`🎵 Metro tick - M:${this.measure + 1} B:${this.beat + 1} Sb:${this.subBeat + 1}`);
    }

    private playMetronomeSound(): void {
        // Stub implementation for metronome sound
        // In full implementation, this would use WebAudio API

        if (this.beat === 0 && this.subBeat === 0) {
            console.log('🔊 ACCENT tick (measure start)');
        } else {
    i
}f (this.subBeat === 0) {
            console.log('🔊 Beat tick');
        } else {
            console.log('🔊 Sub-beat tick');
        }
    }

    private resetCounters(): void {
        this.subBeat = 0;
        this.beat = 0;
        this.measure = 0;
    }

    // Configuration methods
    setBpm(bpm: number): void {
        console.log('🎵 MetroComponent setBpm:', bpm);
        this.bpm = Math.max(40, Math.min(200, bpm)); // Clamp between 40-200 BPM

        if (this.isPlaying) {
            this.pause();
            this.play(); // Restart with new BPM
        }
    }

    setTimeSignature(beats: number, subdivision: number = 1): void {
        console.log('🎵 MetroComponent setTimeSignature:', beats, subdivision);
        this.nb_beat_per_measure = beats;
        this.nb_subbeat_per_beat = subdivision;
        this.resetCounters();
    }

    setDisplay(display: 'line' | 'circle'): void {
        console.log('🎵 MetroComponent setDisplay:', display);
        this.display = display;
    }

    setCountDisplay(countDisplay: 'beat' | 'measure' | 'subBeat' | 'measure_only'): void {
        console.log('🎵 MetroComponent setCountDisplay:', countDisplay);
        this.count_display = countDisplay;
    }

    toggleAnimation(): void {
        this.animation = !this.animation;
        console.log('🎵 MetroComponent animation toggled:', this.animation);
    }

    // Audio initialization (stub)
    private initializeAudioContext(): void {
        try {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            console.log('🔊 AudioContext initialized');
        } catch (error) {
            console.warn('Failed to initialize AudioContext:', error);
        }
    }

    // UI event handlers
    onPlayPause(): void {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    onStop(): void {
        this.stop();
    }

    onBpmChange(bpm: number): void {
        this.setBpm(bpm);
    }

    onTimeSignatureChange(beats: number): void {
        this.setTimeSignature(beats);
    }

    // Utility methods for display
    getCurrentBeatDisplay(): string {
        switch (this.count_display) {
            case 'beat':
                return `${this.beat + 1}`;
            case 'subBeat':
                return `${this.subBeat + 1}`;
            case 'measure':
                return `${this.measure + 1}.${this.beat + 1}`;
            case 'measure_only':
                return `${this.measure + 1}`;
            default:
                return `${this.measure + 1}.${this.beat + 1}`;
        }
    }

    getBeatPosition(): number {
        // For circular display - calculate angle
        const totalBeats = this.nb_beat_per_measure;
        return (this.beat / totalBeats) * 360;
    }

    getSubBeatPosition(): number {
        // For circular display - calculate sub-beat angle
        const totalSubBeats = this.nb_subbeat_per_beat;
        return (this.subBeat / totalSubBeats) * (360 / this.nb_beat_per_measure);
    }
}
