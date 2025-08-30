import { Component, Input, OnInit } from '@angular/core';
import { Magic18Position } from './magic18-config';

interface FretPosition {
    string: number; // 1-6 (E,A,D,G,B,E)
    fret: number;   // 0-12+
    note: string;   // Note name
    color: string;  // Display color
    role: 'root' | 'third' | 'fifth' | 'seventh' | 'pentatonic'; // Musical role
}

@Component({
    selector: 'app-novaxe-fretboard',
    template: `
    <svg 
      [attr.width]="width" 
      [attr.height]="height" 
      [attr.viewBox]="'0 0 ' + width + ' ' + height"
      class="novaxe-fretboard">
      
      <!-- Fretboard Background -->
      <rect x="10" y="10" 
            [attr.width]="width-20" 
            [attr.height]="height-20" 
            fill="#8B4513" 
            stroke="#5D2D0C" 
            stroke-width="2" 
            rx="5"/>
      
      <!-- Frets (vertical lines) -->
      <g class="frets">
        <line *ngFor="let fret of frets" 
              [attr.x1]="fret.x" 
              [attr.y1]="20" 
              [attr.x2]="fret.x" 
              [attr.y2]="height-20"
              stroke="#C0C0C0" 
              stroke-width="1"/>
      </g>
      
      <!-- Strings (horizontal lines) -->
      <g class="strings">
        <line *ngFor="let string of strings" 
              x1="15" 
              [attr.y1]="string.y" 
              [attr.x2]="width-15" 
              [attr.y2]="string.y"
              stroke="#FFD700" 
              [attr.stroke-width]="string.thickness"/>
      </g>
      
      <!-- Fret Markers -->
      <g class="fret-markers">
        <circle *ngFor="let marker of fretMarkers" 
                [attr.cx]="marker.x" 
                [attr.cy]="marker.y" 
                [attr.r]="marker.size"
                fill="#E6E6FA" 
                opacity="0.6"/>
      </g>
      
      <!-- Note Positions -->
      <g class="note-positions">
        <g *ngFor="let pos of notePositions">
          <circle [attr.cx]="pos.x" 
                  [attr.cy]="pos.y" 
                  r="8" 
                  [attr.fill]="pos.color" 
                  stroke="#000" 
                  stroke-width="1"/>
          <text [attr.x]="pos.x" 
                [attr.y]="pos.y + 3" 
                text-anchor="middle" 
                font-size="10" 
                font-weight="bold" 
                fill="white">
            {{pos.note}}
          </text>
        </g>
      </g>
      
      <!-- Title -->
      <text x="50%" 
            y="15" 
            text-anchor="middle" 
            font-size="12" 
            font-weight="bold" 
            fill="#2F4F4F">
        {{position?.name || 'Fretboard'}}
      </text>
      
    </svg>
  `,
    styles: [`
    .novaxe-fretboard {
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .note-positions circle {
      transition: all 0.3s ease;
    }
    
    .note-positions circle:hover {
      r: 10;
      stroke-width: 2;
    }
  `]
})
export class NovaxeFretboardComponent implements OnInit {
    @Input() position!: Magic18Position;
    @Input() width = 120;
    @Input() height = 180;

    frets: { x: number }[] = [];
    strings: { y: number, thickness: number }[] = [];
    fretMarkers: { x: number, y: number, size: number }[] = [];
    notePositions: FretPosition[] = [];

    ngOnInit() {
        this.generateFretboard();
        this.generateNotePositions();
    }

    private generateFretboard() {
        // Generate frets (vertical lines)
        const fretSpacing = (this.width - 30) / 12;
        for (let i = 0; i <= 12; i++) {
            this.frets.push({ x: 15 + (i * fretSpacing) });
        }

        // Generate strings (horizontal lines) - thicker for lower strings
        const stringSpacing = (this.height - 40) / 5;
        const stringThicknesses = [3, 2.5, 2, 1.5, 1, 1]; // E,A,D,G,B,E
        for (let i = 0; i < 6; i++) {
            this.strings.push({
                y: 25 + (i * stringSpacing),
                thickness: stringThicknesses[i]
            });
        }

        // Generate fret markers (dots at 3rd, 5th, 7th, 9th, 12th frets)
        const markerFrets = [3, 5, 7, 9, 12];
        markerFrets.forEach(fretNum => {
            if (fretNum <= 12) {
                const x = 15 + (fretNum * fretSpacing) - (fretSpacing / 2);
                const y = this.height / 2;
                this.fretMarkers.push({ x, y, size: 3 });
            }
        });
    }

    private generateNotePositions() {
        if (!this.position) return;

        const noteColors = {
            root: '#FF4500',      // Orange-red for root
            third: '#32CD32',     // Lime green for third
            fifth: '#4169E1',     // Royal blue for fifth
            seventh: '#FF69B4',   // Hot pink for seventh
            pentatonic: '#FFD700' // Gold for pentatonic notes
        };

        // Generate note positions based on chord/scale type
        switch (this.position.chordType) {
            case 'major':
                this.generateMajorChordPositions(noteColors);
                break;
            case 'minor':
                this.generateMinorChordPositions(noteColors);
                break;
            case 'dominant':
                this.generateDominantChordPositions(noteColors);
                break;
            case 'pentatonic':
                this.generatePentatonicPositions(noteColors);
                break;
        }
    }

    private generateMajorChordPositions(colors: any) {
        const rootNote = this.position.key;
        const fretSpacing = (this.width - 30) / 12;
        const stringSpacing = (this.height - 40) / 5;

        // Basic major chord positions (example for A major)
        if (rootNote === 'A') {
            if (this.position.position === 'open') {
                // A major open chord
                this.notePositions = [
                    {
                        string: 1, fret: 0, note: 'E', color: colors.fifth, role: 'fifth',
                        x: 15, y: 25
                    },
                    {
                        string: 2, fret: 0, note: 'A', color: colors.root, role: 'root',
                        x: 15, y: 25 + stringSpacing
                    },
                    {
                        string: 3, fret: 2, note: 'A', color: colors.root, role: 'root',
                        x: 15 + (2 * fretSpacing), y: 25 + (2 * stringSpacing)
                    },
                    {
                        string: 4, fret: 2, note: 'E', color: colors.fifth, role: 'fifth',
                        x: 15 + (2 * fretSpacing), y: 25 + (3 * stringSpacing)
                    },
                    {
                        string: 5, fret: 2, note: 'A', color: colors.root, role: 'root',
                        x: 15 + (2 * fretSpacing), y: 25 + (4 * stringSpacing)
                    },
                    {
                        string: 6, fret: 0, note: 'E', color: colors.fifth, role: 'fifth',
                        x: 15, y: 25 + (5 * stringSpacing)
                    }
                ];
            }
        }

        // Add more chord positions for other keys...
        this.adjustPositionsForKey(rootNote);
    }

    private generateMinorChordPositions(colors: any) {
        // Similar structure for minor chords
        // Implementation would follow same pattern
    }

    private generateDominantChordPositions(colors: any) {
        // Similar structure for dominant chords
    }

    private generatePentatonicPositions(colors: any) {
        const rootNote = this.position.key;
        const fretSpacing = (this.width - 30) / 12;
        const stringSpacing = (this.height - 40) / 5;

        // Generate pentatonic scale positions
        // This is a simplified version - full implementation would include all pentatonic patterns
        if (rootNote === 'A') {
            this.notePositions = [
                {
                    string: 1, fret: 5, note: 'A', color: colors.pentatonic, role: 'pentatonic',
                    x: 15 + (5 * fretSpacing), y: 25
                },
                {
                    string: 2, fret: 7, note: 'E', color: colors.pentatonic, role: 'pentatonic',
                    x: 15 + (7 * fretSpacing), y: 25 + stringSpacing
                },
                {
                    string: 3, fret: 7, note: 'A', color: colors.pentatonic, role: 'pentatonic',
                    x: 15 + (7 * fretSpacing), y: 25 + (2 * stringSpacing)
                },
                // Add more pentatonic positions...
            ];
        }
    }

    private adjustPositionsForKey(key: string) {
        // Adjust fret positions based on the root key
        // This would implement transposition logic
    }
}
