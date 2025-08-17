import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter, take } from 'rxjs/operators';

// Modern WebAudioFont loading
declare global {
  interface Window {
    WebAudioFontPlayer: any;
  }
}

@Injectable({
    providedIn: 'root'
})
export class GuitarService {
    private audioContext: AudioContext;
    private player: any;
    private instrumentReady$ = new BehaviorSubject<boolean>(false);
    
    constructor() {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.loadWebAudioFont();
    }
    
    private async loadWebAudioFont(): Promise<void> {
        try {
            // Dynamic import for WebAudioFont
            const script = document.createElement('script');
            script.src = 'https://surikov.github.io/webaudiofont/npm/dist/WebAudioFontPlayer.js';
            
            await new Promise<void>((resolve, reject) => {
                script.onload = () => resolve();
                script.onerror = () => reject(new Error('Failed to load WebAudioFont'));
                document.head.appendChild(script);
            });
            
            this.player = new window.WebAudioFontPlayer();
            
            // Load acoustic guitar instrument
            const instrumentInfo = this.player.loader.instrumentInfo(25); // Acoustic Guitar
            await this.player.loader.loadModules(this.audioContext, instrumentInfo);
            
            this.instrumentReady$.next(true);
            console.log('🎸 WebAudioFont Guitar Service initialized successfully!');
        } catch (error) {
            console.error('❌ Failed to load WebAudioFont:', error);
            // Fallback to console logging
            this.instrumentReady$.next(true);
        }
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
            
            if (this.player && this.player.queueWaveTable) {
                this.player.queueWaveTable(
                    this.audioContext,
                    this.audioContext.destination,
                    this.player.loader.instrumentInfo(25).variable,
                    when,
                    midiNote,
                    duration
                );
            } else {
                // Fallback for development
                console.log(`🎸 Playing guitar note ${midiNote} with delay ${delay}ms for ${duration}s`);
            }
        } catch (error) {
            console.error('Failed to play note:', error);
            console.log(`🎸 Fallback: Playing guitar note ${midiNote} with delay ${delay}ms`);
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
