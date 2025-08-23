/**
 * Service interfaces for the Novaxe Oracle ecosystem
 * These interfaces enable AI, mobile, and future platform integrations
 */

import { Observable } from 'rxjs';
import {
  ChordDTO,
  ScaleDTO,
  NoteDTO,
  ProgressionAnalysis,
  TransportState,
  TimeSignature,
  MidiDevice,
  MidiRecordingState,
  MidiEventDTO,
  HarmonyAnalysis,
  ChordSuggestion,
  MelodyConstraints,
  MelodySequence,
  AudioFeatures,
  GenreClassification
} from '../types/music';

/**
 * Music Theory Service Interface
 * Provides music theory calculations and analysis
 */
export interface IMusicTheoryService {
  getChord(notesMidi: number[], key?: string): Observable<string[]>;
  getScale(key: string, mode?: string): Observable<string[]>;
  transpose(note: string, semitones: number): string;
  analyzeProgression(chords: string[]): Observable<ProgressionAnalysis>;
  getInterval(note1: string, note2: string): string;
  getChordFromSymbol(symbol: string): Observable<ChordDTO>;
  getScaleNotes(root: string, scaleName: string): Observable<NoteDTO[]>;
  identifyKey(notes: number[]): Observable<string>;
}

/**
 * MIDI Service Interface
 * Handles MIDI device communication and note playback
 */
export interface IMidiService {
  // Lifecycle
  start(): Promise<void>;
  stop(): Promise<void>;
  
  // Playback
  playNote(noteMidi: number, velocity?: number, durationMs?: number): void;
  playChord(notesMidi: number[], velocity?: number, durationMs?: number): void;
  stopNote(noteMidi: number): void;
  stopAllNotes(): void;
  
  // Device management
  getConnectedDevices(): Observable<MidiDevice[]>;
  selectInputDevice(deviceId: string): Promise<void>;
  selectOutputDevice(deviceId: string): Promise<void>;
  
  // Event streams
  onNotesChanged(cb: (activeMidi: number[]) => void): () => void;
  noteOn$: Observable<MidiEventDTO>;
  noteOff$: Observable<MidiEventDTO>;
  controlChange$: Observable<MidiEventDTO>;
  
  // Recording
  recordingState$: Observable<MidiRecordingState>;
  startRecording(): void;
  stopRecording(): MidiEventDTO[];
  clearRecording(): void;
}

/**
 * Transport Service Interface
 * Controls playback timing and synchronization
 */
export interface ITransportService {
  // Playback control
  play(): void;
  pause(): void;
  stop(): void;
  toggle(): void;
  
  // Position control
  setPosition(positionMs: number): void;
  setPositionBeats(beats: number): void;
  seekForward(ms: number): void;
  seekBackward(ms: number): void;
  
  // Tempo control
  setTempo(bpm: number): void;
  getTempo(): number;
  tapTempo(): void;
  
  // Time signature
  setTimeSignature(numerator: number, denominator: number): void;
  timeSignature$: Observable<TimeSignature>;
  
  // State
  state$: Observable<TransportState>;
  isPlaying$: Observable<boolean>;
  position$: Observable<number>;
  
  // Looping
  setLoop(startMs: number, endMs: number): void;
  clearLoop(): void;
  
  // Synchronization
  scheduleEvent(timeMs: number, callback: () => void): number;
  cancelScheduledEvent(id: number): void;
  
  // Metronome
  enableMetronome(enabled: boolean): void;
  setMetronomeVolume(volume: number): void;
}

/**
 * AI Analysis Service Interface
 * Provides AI-powered music analysis and generation
 */
export interface IAIAnalysisService {
  // Analysis
  analyzeHarmony(notes: number[]): Promise<HarmonyAnalysis>;
  analyzeAudioFeatures(audioBuffer: AudioBuffer): Promise<AudioFeatures>;
  classifyGenre(audioFeatures: AudioFeatures): Promise<GenreClassification>;
  detectChords(audioBuffer: AudioBuffer): Promise<ChordDTO[]>;
  
  // Generation
  suggestNextChord(progression: string[], key: string): Promise<ChordSuggestion[]>;
  generateMelody(constraints: MelodyConstraints): Promise<MelodySequence>;
  generateHarmony(melody: NoteDTO[], style: string): Promise<ChordDTO[]>;
  generateBassLine(chords: ChordDTO[], style: string): Promise<NoteDTO[]>;
  
  // Transformation
  humanizeTiming(events: MidiEventDTO[], amount: number): MidiEventDTO[];
  quantizeTiming(events: MidiEventDTO[], gridSize: number): MidiEventDTO[];
  transposeAudio(audioBuffer: AudioBuffer, semitones: number): Promise<AudioBuffer>;
  
  // Model management
  loadModel(modelName: string): Promise<void>;
  unloadModel(modelName: string): void;
  getAvailableModels(): string[];
  getModelInfo(modelName: string): ModelInfo;
}

/**
 * Audio Service Interface
 * Handles audio synthesis and processing
 */
export interface IAudioService {
  // Context management
  getAudioContext(): AudioContext;
  resumeContext(): Promise<void>;
  suspendContext(): Promise<void>;
  
  // Synthesis
  playSample(url: string, when?: number): void;
  playBuffer(buffer: AudioBuffer, when?: number): void;
  synthesizeNote(frequency: number, duration: number, type?: OscillatorType): void;
  
  // Effects
  setReverb(amount: number): void;
  setDelay(time: number, feedback: number): void;
  setDistortion(amount: number): void;
  setFilter(type: BiquadFilterType, frequency: number, q: number): void;
  
  // Recording
  startAudioRecording(): void;
  stopAudioRecording(): Promise<Blob>;
  
  // Analysis
  getFrequencyData(): Uint8Array;
  getWaveformData(): Uint8Array;
  getPeakLevel(): number;
}

/**
 * Notation Service Interface
 * Handles music notation rendering and editing
 */
export interface INotationService {
  // Rendering
  renderABC(abc: string, elementId: string): void;
  renderMusicXML(xml: string, elementId: string): void;
  renderFromMidi(events: MidiEventDTO[], elementId: string): void;
  
  // Conversion
  abcToMusicXML(abc: string): string;
  musicXMLToABC(xml: string): string;
  midiToABC(events: MidiEventDTO[]): string;
  
  // Editing
  addNote(position: number, pitch: number, duration: number): void;
  removeNote(noteId: string): void;
  updateNote(noteId: string, updates: Partial<NoteDTO>): void;
  
  // Export
  exportPDF(): Promise<Blob>;
  exportMIDI(): Uint8Array;
  exportAudio(): Promise<Blob>;
}

// Supporting types
export interface ModelInfo {
  name: string;
  version: string;
  size: number;
  accuracy: number;
  latency: number;
  description: string;
}