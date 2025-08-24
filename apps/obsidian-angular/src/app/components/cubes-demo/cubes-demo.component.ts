import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cubes-demo',
  template: `
    <div class="cubes-demo-page">
      <h1>Cubes Component Demo</h1>
      <p>Interactive 3D musical cubes with full transport synchronization</p>
      
      <!-- Cubes widget - using exact Obsidian integration patterns -->
      <div class="cubes-widget-container">
        <app-cubes 
          [chord]="currentChord"
          [key]="currentKey"
          [showControls]="true"
          [enableInteraction]="true">
        </app-cubes>
      </div>

      <!-- Manual controls for testing -->
      <div class="test-controls">
        <h3>Test Controls</h3>
        <div class="control-group">
          <label>Key:</label>
          <select [(ngModel)]="currentKey">
            <option *ngFor="let key of keys" [value]="key">{{ key }}</option>
          </select>
        </div>
        
        <div class="control-group">
          <label>Chord:</label>
          <select [(ngModel)]="currentChord">
            <option *ngFor="let chord of chords" [value]="chord">{{ chord }}</option>
          </select>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cubes-demo-page {
      padding: 20px;
      max-width: 1000px;
      margin: 0 auto;
    }

    .cubes-widget-container {
      margin: 20px 0;
      border: 2px solid #333;
      border-radius: 12px;
      padding: 20px;
      background: #111;
    }

    .test-controls {
      margin-top: 30px;
      padding: 20px;
      background: #222;
      border-radius: 8px;
      color: white;
    }

    .control-group {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 10px 0;
    }

    .control-group label {
      min-width: 80px;
      font-weight: bold;
    }

    .control-group select {
      padding: 5px 10px;
      background: #333;
      color: white;
      border: 1px solid #555;
      border-radius: 4px;
    }
  `],
  standalone: false
})
export class CubesDemoComponent implements OnInit {

  currentKey: string = 'C';
  currentChord: string = 'C';

  keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  chords = ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim', 'Cmaj7', 'Dm7', 'Em7'];

  constructor() { }

  ngOnInit(): void {
  }
}
