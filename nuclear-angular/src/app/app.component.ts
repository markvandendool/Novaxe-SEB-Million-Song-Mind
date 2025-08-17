import { Component } from '@angular/core';
import { GuitarService } from './services/guitar/guitar.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false
})
export class AppComponent {
  title = 'nuclear-angular';
  audioUnlocked = false;

  constructor(private guitarService: GuitarService) { }

  unlockAudio() {
    // Resume audio context if suspended (required by browsers)
    if (this.guitarService['audioContext'] && this.guitarService['audioContext'].state === 'suspended') {
      this.guitarService['audioContext'].resume();
    }
    this.audioUnlocked = true;
    console.log('🔊 Audio unlocked!');
  }

  async testSound() {
    if (!this.audioUnlocked) {
      alert('Please click "Unlock Audio" first!');
      return;
    }

    try {
      console.log('🎵 Testing sound - playing C4 (MIDI 60)');
      await this.guitarService.play(0, 60, 0.5); // C4 note
    } catch (error) {
      console.error('Test sound failed:', error);
    }
  }
}
