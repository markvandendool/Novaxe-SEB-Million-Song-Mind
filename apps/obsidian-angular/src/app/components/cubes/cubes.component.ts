import { Component, OnInit, OnDestroy, ElementRef, ViewChild, NgZone, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import * as THREE from 'three';

// Import Obsidian services - using EXACT patterns from chordstrip and braid
import { TransportService } from '../../services/transport/transport.service';
import { BeatComputingService } from '../../services/beat-computing-service/beat-computing.service';
import { DisplayService } from '../../services/display/displayService';

@Component({
  selector: 'app-cubes',
  templateUrl: './cubes.component.html',
  styleUrls: ['./cubes.component.scss'],
  standalone: false
})
export class CubesComponent implements OnInit, OnDestroy {

  @ViewChild('cubesContainer', { static: true }) cubesContainer!: ElementRef;

  // Transport service subscriptions - EXACT pattern from chordstrip
  private transportSubscription: Subscription = new Subscription();
  private beatSubscription: Subscription = new Subscription();
  private measureSubscription: Subscription = new Subscription();
  private bpmSubscription: Subscription = new Subscription();

  // Musical state management - following Obsidian patterns
  public currentKey: string = 'C';
  public currentChord: string = 'C';
  public currentInversion: number = 0;
  public currentBeat: number = 0;
  public currentMeasure: number = 0;
  public currentBpm: number = 120;
  public isPlaying: boolean = false;

  // Three.js core components
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  public cubes: THREE.Mesh[] = []; // Public for template access
  private animationId: number = 0;

  // Cube configuration - simplified from original 3,371-line main.js
  private readonly CUBE_COUNT = 12; // One cube per semitone
  private readonly CUBE_SIZE = 1;
  private readonly RADIUS = 5;

  // Component properties for template binding
  public containerWidth: number = 800;
  public containerHeight: number = 400;
  
  @Input() showControls: boolean = true;
  @Input() enableInteraction: boolean = true;

  // Musical theory data - using Obsidian patterns
  public readonly CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  private readonly CIRCLE_OF_FIFTHS = ['C', 'G', 'D', 'A', 'E', 'B', 'Gb', 'Db', 'Ab', 'Eb', 'Bb', 'F'];

  // Input handling - following Obsidian component patterns
  private _chord: string = "C";
  
  @Input() set chord(value: string) {
    this._chord = value;
    this.updateChordVisualization(value);
  }

  @Input() set key(value: string) {
    this.currentKey = value;
    this.updateKeyVisualization(value);
  }

  constructor(
    private transportService: TransportService,
    private beatComputingService: BeatComputingService,
    private displayService: DisplayService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.initializeThreeJS();
    this.setupCubes();
    this.subscribeToTransportService();
    this.startAnimation();
  }

  ngOnDestroy(): void {
    // Clean disposal - following Obsidian patterns
    this.transportSubscription.unsubscribe();
    this.beatSubscription.unsubscribe();
    this.measureSubscription.unsubscribe();
    this.bpmSubscription.unsubscribe();
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  private initializeThreeJS(): void {
    // Scene setup - simplified from original main.js complexity
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000011);

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    this.camera.position.z = 10;

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      preserveDrawingBuffer: true
    });
    
    const container = this.cubesContainer.nativeElement;
    const containerRect = container.getBoundingClientRect();
    this.renderer.setSize(containerRect.width, containerRect.height);
    
    container.appendChild(this.renderer.domElement);
  }

  private setupCubes(): void {
    // Create 12 cubes in circle formation - simplified from original quaternion complexity
    const geometry = new THREE.BoxGeometry(this.CUBE_SIZE, this.CUBE_SIZE, this.CUBE_SIZE);
    
    for (let i = 0; i < this.CUBE_COUNT; i++) {
      const material = new THREE.MeshLambertMaterial({ 
        color: this.getNoteColor(i),
        transparent: true,
        opacity: 0.7
      });
      
      const cube = new THREE.Mesh(geometry, material);
      
      // Position cubes in circle - using simple trigonometry instead of complex quaternions
      const angle = (i / this.CUBE_COUNT) * Math.PI * 2;
      cube.position.x = Math.cos(angle) * this.RADIUS;
      cube.position.y = Math.sin(angle) * this.RADIUS;
      cube.position.z = 0;
      
      // Store note information for interaction
      cube.userData = {
        noteIndex: i,
        note: this.CHROMATIC_NOTES[i],
        isActive: false
      };
      
      this.cubes.push(cube);
      this.scene.add(cube);
    }

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    this.scene.add(directionalLight);
  }

  private subscribeToTransportService(): void {
    // Transport service subscriptions - EXACT pattern from transport.service.ts
    this.beatSubscription.add(
      this.transportService.beatChange.subscribe(beatData => {
        this.currentBeat = beatData.beat;
        this.currentMeasure = beatData.measure;
        this.isPlaying = this.transportService.isPlaying();
        this.updatePlaybackVisualization();
        this.onBeatChange(beatData);
      })
    );

    this.measureSubscription.add(
      this.transportService.measureChange.subscribe(measure => {
        this.currentMeasure = measure;
        this.onMeasureChange(measure);
      })
    );

    this.bpmSubscription.add(
      this.transportService.bpmChange.subscribe(bpm => {
        this.currentBpm = bpm;
        this.onBpmChange(bpm);
      })
    );
  }

  private startAnimation(): void {
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      
      // Simple rotation animation - replacing complex quaternion system
      this.cubes.forEach((cube, index) => {
        if (cube.userData.isActive) {
          cube.rotation.x += 0.02;
          cube.rotation.y += 0.02;
          
          // Pulse effect for active cubes
          const scale = 1 + Math.sin(Date.now() * 0.005 + index) * 0.1;
          cube.scale.setScalar(scale);
        } else {
          cube.rotation.x += 0.005;
          cube.rotation.y += 0.005;
          cube.scale.setScalar(1);
        }
      });
      
      this.renderer.render(this.scene, this.camera);
    };
    
    this.ngZone.runOutsideAngular(animate);
  }

  private getNoteColor(noteIndex: number): number {
    // Color mapping for chromatic notes - simplified from original
    const colors = [
      0xFF0000, // C - Red
      0xFF4000, // C# - Orange-Red
      0xFF8000, // D - Orange
      0xFFFF00, // D# - Yellow
      0x80FF00, // E - Yellow-Green
      0x00FF00, // F - Green
      0x00FF80, // F# - Green-Cyan
      0x00FFFF, // G - Cyan
      0x0080FF, // G# - Cyan-Blue
      0x0000FF, // A - Blue
      0x8000FF, // A# - Blue-Magenta
      0xFF00FF  // B - Magenta
    ];
    return colors[noteIndex];
  }

  // Musical visualization methods - following Obsidian patterns
  private updateChordVisualization(chord: string): void {
    // Parse chord and highlight relevant cubes
    this.cubes.forEach(cube => cube.userData.isActive = false);
    
    // Basic chord parsing - can be enhanced with TonalJS like braid component
    const root = chord.charAt(0);
    const rootIndex = this.CHROMATIC_NOTES.indexOf(root);
    
    if (rootIndex !== -1) {
      // Highlight root, third, fifth (basic triad)
      this.cubes[rootIndex].userData.isActive = true;
      this.cubes[(rootIndex + 4) % 12].userData.isActive = true; // Major third
      this.cubes[(rootIndex + 7) % 12].userData.isActive = true; // Perfect fifth
    }
  }

  private updateKeyVisualization(key: string): void {
    // Update key-based visualization
    const keyIndex = this.CHROMATIC_NOTES.indexOf(key);
    if (keyIndex !== -1) {
      // Highlight key center with different color
      const keyMaterial = this.cubes[keyIndex].material as THREE.MeshLambertMaterial;
      keyMaterial.emissive.setHex(0x333333);
    }
  }

  private updatePlaybackVisualization(): void {
    // Update visual state based on playback
    if (this.isPlaying) {
      this.scene.background = new THREE.Color(0x001122);
    } else {
      this.scene.background = new THREE.Color(0x000011);
    }
  }

  // Transport service event handlers - following chordstrip patterns
  private onBeatChange(beatData: any): void {
    // Pulse effect on beat
    const beatIndex = beatData.beat % this.CUBE_COUNT;
    if (this.cubes[beatIndex]) {
      const cube = this.cubes[beatIndex];
      cube.scale.setScalar(1.5);
      
      setTimeout(() => {
        if (cube) cube.scale.setScalar(1);
      }, 100);
    }
  }

  private onMeasureChange(measure: number): void {
    // Visual feedback on measure change
    this.cubes.forEach(cube => {
      const material = cube.material as THREE.MeshLambertMaterial;
      material.opacity = 0.5;
      setTimeout(() => {
        material.opacity = 0.7;
      }, 200);
    });
  }

  private onBpmChange(bpm: number): void {
    // Adjust animation speed based on BPM
    // Implementation can be added here
  }

  // Public methods for external control - following Obsidian patterns
  public setChord(chord: string): void {
    this.chord = chord;
  }

  public setKey(key: string): void {
    this.key = key;
  }

  public setInversion(inversion: number): void {
    this.currentInversion = inversion;
    // Update visualization based on inversion
  }

  // Template helper methods
  public getCubeActive(index: number): boolean {
    return this.cubes[index] ? this.cubes[index].userData.isActive : false;
  }

  public getCubeOverlayPosition(index: number): string {
    // Calculate overlay position to match 3D cube positions
    const angle = (index / this.CUBE_COUNT) * Math.PI * 2;
    const x = Math.cos(angle) * (this.containerWidth * 0.3) + (this.containerWidth * 0.5);
    const y = Math.sin(angle) * (this.containerHeight * 0.3) + (this.containerHeight * 0.5);
    return `translate(${x - 30}px, ${y - 30}px)`;
  }

  // Interaction methods - simplified from original complex mouse handling
  public onCubeClick(cubeIndex: number): void {
    const cube = this.cubes[cubeIndex];
    if (cube) {
      const note = cube.userData.note;
      // Update internal chord state and emit to parent or global service
      this.setChord(note);
      // TODO: Emit to global chord/key service when available
    }
  }
}
