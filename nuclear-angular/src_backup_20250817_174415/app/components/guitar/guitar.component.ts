import { Component, OnInit } from '@angular/core';
import { GuitarService } from '../../../services/guitar/guitar.service';

@Component({
  selector: 'app-guitar',
  templateUrl: './guitar.component.html',
  styleUrls: ['./guitar.component.scss'],
  standalone: false, // EXPLICITLY declare as non-standalone
})
export class GuitarComponent implements OnInit {

  public delay: number = 0;
  public midinote: number = 60;
  public bend_factor: number = 1;
  public selected_instrument: any;

  constructor(public guit: GuitarService) { }

  ngOnInit(): void {
    console.log('🎸 GuitarComponent initialized with advanced WebAudioFont service!');
  }

  async play_note(): Promise<void> {
    console.log("🎸 Playing note with advanced service...");

    // Use the enhanced play method with duration
    await this.guit.play(this.delay, this.midinote, 1.0);
  }

  async play_chord(): Promise<void> {
    // Example C major chord (C, E, G)
    const cMajorChord = [60, 64, 67];
    console.log("🎸 Playing C major chord...");

    await this.guit.playChord(cMajorChord, this.delay, 1.5);
  }

  get isServiceReady(): boolean {
    return this.guit.isReady;
  }
}
