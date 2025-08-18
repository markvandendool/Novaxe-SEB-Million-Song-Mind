import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AudioPlayer {
    private isPlaying$ = new BehaviorSubject<boolean>(false);
    private currentTime$ = new BehaviorSubject<number>(0);
    private duration$ = new BehaviorSubject<number>(0);

    constructor() { }

    // Angular 20 Compatible AudioPlayer Service Stub
    // TODO: Migrate full AudioPlayer from pristine source when needed

    public play(audioUrl?: string): void {
        console.log('AudioPlayer stub - play:', audioUrl);
        this.isPlaying$.next(true);
    }

    public pause(): void {
        console.log('AudioPlayer stub - pause');
        this.isPlaying$.next(false);
    }

    public stop(): void {
        console.log('AudioPlayer stub - stop');
        this.isPlaying$.next(false);
        this.currentTime$.next(0);
    }

    public seek(time: number): void {
        console.log('AudioPlayer stub - seek:', time);
        this.currentTime$.next(time);
    }

    public getIsPlaying(): Observable<boolean> {
        return this.isPlaying$.asObservable();
    }

    public getCurrentTime(): Observable<number> {
        return this.currentTime$.asObservable();
    }

    public getCurrentTimeSync(): number {
        return this.currentTime$.value;
    }

    public getDuration(): Observable<number> {
        return this.duration$.asObservable();
    }

    // Additional methods required by EditorComponent
    public setCurrentTime(time: number): void {
        console.log('AudioPlayer stub - setCurrentTime:', time);
        this.currentTime$.next(time);
    }

    public isPlaying(): boolean {
        return this.isPlaying$.value;
    }

    public playPause(): void {
        const playing = this.isPlaying$.value;
        console.log('AudioPlayer stub - playPause, was playing:', playing);
        this.isPlaying$.next(!playing);
    }

    public playMeasure(measureIdx: number): void {
        console.log('AudioPlayer stub - playMeasure:', measureIdx);
        this.isPlaying$.next(true);
    }

    public getCurrentRegion(): any {
        // Stub implementation for region support
        return {
            id: 'region-1',
            start: this.currentTime$.value,
            end: this.currentTime$.value + 1
        };
    }

    public addRegion(region: any): void {
        console.log('AudioPlayer stub - addRegion:', region);
    }
}
