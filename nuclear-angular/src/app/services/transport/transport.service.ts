import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransportService {
  
  private subBeat_div: number = 240;
  private beatDiv: number = 0;
  private subBeat: number = 0;
  private beat: number = 0;
  private measure: number = 0;
  
  private nb_subbeat_per_beat: number = 4;
  private nb_beat_per_measure: number = 4;
  private bpms: number = 60000 / 40;
  private bpm: number = 40;
  
  // Subjects for Angular 20 (using rxjs 7.8.2)
  public subBeatChange: Subject<number> = new Subject<number>();
  public beatChange: Subject<number> = new Subject<number>();
  public measureChange: Subject<number> = new Subject<number>();
  public nb_beat_per_measureChange: Subject<number> = new Subject<number>();
  public nb_subbeat_per_beatChange: Subject<number> = new Subject<number>();
  public bpmChange: Subject<number> = new Subject<number>();
  
  // Transport state for UI binding
  public state: "playing" | "stopped" | "paused" = 'stopped';

  constructor() {
    console.log('TransportService initialized in Angular 20!');
  }

  stop(param1?: number, param2?: boolean): void {
    this.state = 'stopped';
    console.log('TransportService.stop() called with:', param1, param2);
    // Placeholder implementation for Angular 20 migration
  }

  play_pause(): void {
    if (this.state === "stopped" || this.state === "paused") {
      this.state = "playing";
      console.log('TransportService: Starting playback');
    } else if (this.state === "playing") {
      this.state = "paused"; 
      console.log('TransportService: Pausing playback');
    }
  }

  play(): void {
    console.log('TransportService.play() called');
    // Placeholder implementation
  }

  pause(): void {
    console.log('TransportService.pause() called');
    // Placeholder implementation
  }

  setBpm(bpm: number): void {
    this.bpm = bpm;
    this.bpmChange.next(bpm);
    console.log('BPM set to:', bpm);
  }

  getBpm(): number {
    return this.bpm;
  }
}
