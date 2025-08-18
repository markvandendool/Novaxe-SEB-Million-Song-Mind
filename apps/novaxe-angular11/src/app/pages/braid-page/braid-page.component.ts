import { Component } from '@angular/core';

@Component({
  selector: 'app-braid-page',
  template: `
    <div style="width: 100%; height: 100vh; background: #1a1a1a; overflow: hidden; position: relative;">
      <!-- Controls -->
      <div style="position: absolute; top: 10px; left: 10px; z-index: 1000; background: rgba(0,0,0,0.8); padding: 10px; border-radius: 8px; color: white;">
        <div style="margin-bottom: 10px;">
          <label style="display: block; margin-bottom: 5px; font-size: 12px; text-transform: uppercase;">Braid Type:</label>
          <select id="braidType" style="padding: 5px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
            <option value="tonal">Tonal</option>
            <option value="blues">Blues</option>
          </select>
        </div>
        <div style="margin-bottom: 10px;">
          <label style="display: block; margin-bottom: 5px; font-size: 12px; text-transform: uppercase;">Tonality:</label>
          <select id="tonality" style="padding: 5px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
            <option value="C">C</option>
            <option value="G">G</option>
            <option value="D">D</option>
            <option value="A">A</option>
            <option value="E">E</option>
            <option value="B">B</option>
            <option value="F#">F#</option>
            <option value="C#">C#</option>
            <option value="G#">G#</option>
            <option value="D#">D#</option>
            <option value="A#">A#</option>
            <option value="F">F</option>
          </select>
        </div>
        <div style="margin-bottom: 10px;">
          <button id="romanToggle" style="padding: 5px 10px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px; cursor: pointer;">Show Roman</button>
        </div>
        <div>
          <button id="scoreFollowToggle" style="padding: 5px 10px; background: #00a450; color: white; border: 1px solid #00a450; border-radius: 4px; cursor: pointer;">Score Follow ON</button>
        </div>
      </div>
      
      <!-- Real Novaxe Braid -->
      <app-braid 
        [braidModel]="'tonal'"
        [is_roman]="false"
        [one_tona_mode]="2">
      </app-braid>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100vh;
    }
    
    ::ng-deep app-braid {
      display: block;
      width: 100%;
      height: 100%;
    }
    
    ::ng-deep app-braid .braid {
      width: 100% !important;
      height: 100% !important;
    }
    
    ::ng-deep app-braid svg {
      width: 100% !important;
      height: 100% !important;
      max-height: none !important;
    }
  `]
})
export class BraidPageComponent {
  constructor() { }
} 