/**
 * Core musical data types for the Novaxe Oracle ecosystem
 * These types serve as the canonical data structures for cross-platform consistency
 */

export interface NoteDTO {
  name: string;
  midi: number;
  freqHz?: number;
  octave: number;
  pitchClass: string;
}

export interface ChordDTO {
  symbol: string;
  notes: NoteDTO[];
  quality: ChordQuality;
  root: string;
  bass?: string;
  extensions?: string[];
  inversions?: number;
}

export interface ScaleDTO {
  name: string;
  notes: NoteDTO[];
  mode: string;
  intervals: number[];
  keySignature: KeySignature;
}

export interface TonalityDTO {
  tonic: string;
  mode: string;
  keySignature: KeySignature;
  circleOfFifthsPosition: number;
}

export interface ProgressionDTO {
  key: TonalityDTO;
  symbols: string[];
  romanNumerals: string[];
  functions: HarmonicFunction[];
  cadences: Cadence[];
}

export interface TransportState {
  playing: boolean;
  bpm: number;
  positionMs: number;
  positionBeats: number;
  timeSignature: TimeSignature;
  loop: LoopState | null;
}

export interface MidiEventDTO {
  timestamp: number;
  type: 'noteOn' | 'noteOff' | 'controlChange' | 'programChange';
  note?: number;
  velocity?: number;
  channel: number;
  controller?: number;
  value?: number;
}

export interface BraidNodeDTO {
  id: string;
  label: string;
  tonality: TonalityDTO;
  position: { x: number; y: number };
  connections: string[];
  strength: number;
  metadata?: Record<string, any>;
}

export interface BraidEdgeDTO {
  from: string;
  to: string;
  weight: number;
  relationshipType: 'dominant' | 'subdominant' | 'relative' | 'parallel' | 'chromatic';
  strength: number;
}

// Supporting types
export type ChordQuality = 'major' | 'minor' | 'diminished' | 'augmented' | 'dominant' | 'halfDiminished' | 'suspended';

export interface KeySignature {
  sharps: number;
  flats: number;
  accidentals: string[];
}

export interface TimeSignature {
  numerator: number;
  denominator: number;
  beatsPerMeasure: number;
}

export interface LoopState {
  enabled: boolean;
  startMs: number;
  endMs: number;
  startBeat: number;
  endBeat: number;
}

export type HarmonicFunction = 'tonic' | 'subdominant' | 'dominant' | 'predominant' | 'chromatic' | 'passing';

export interface Cadence {
  type: 'authentic' | 'plagal' | 'half' | 'deceptive';
  position: number;
  strength: number;
}

// Future-proofing for AI integration
export interface AudioFeatures {
  tempo: number;
  key: number;
  mode: number;
  energy: number;
  valence: number;
  danceability: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  speechiness: number;
}

export interface HarmonyAnalysis {
  key: TonalityDTO;
  chords: ChordDTO[];
  progression: ProgressionDTO;
  modulationPoints: ModulationPoint[];
  complexity: number;
  stability: number;
}

export interface ModulationPoint {
  measure: number;
  fromKey: TonalityDTO;
  toKey: TonalityDTO;
  type: 'direct' | 'pivot' | 'chromatic' | 'enharmonic';
}

export interface MelodyConstraints {
  key: TonalityDTO;
  range: { low: number; high: number };
  rhythm: RhythmPattern;
  style: MelodyStyle;
  length: number;
}

export interface RhythmPattern {
  timeSignature: TimeSignature;
  pattern: number[];
  syncopation: number;
  density: number;
}

export type MelodyStyle = 'classical' | 'jazz' | 'blues' | 'pop' | 'folk' | 'electronic';

export interface MelodySequence {
  notes: NoteDTO[];
  rhythm: RhythmPattern;
  contour: number[];
  phrases: MelodyPhrase[];
}

export interface MelodyPhrase {
  startIndex: number;
  endIndex: number;
  type: 'antecedent' | 'consequent' | 'bridge' | 'climax';
}

export interface ChordSuggestion {
  chord: ChordDTO;
  probability: number;
  reasoning: string;
}

export interface GenreClassification {
  genre: string;
  subgenre?: string;
  confidence: number;
  features: AudioFeatures;
}

export interface MidiDevice {
  id: string;
  name: string;
  manufacturer: string;
  type: 'input' | 'output';
  state: 'connected' | 'disconnected';
}

export interface MidiRecordingState {
  recording: boolean;
  startTime: number;
  events: MidiEventDTO[];
  duration: number;
}

export interface ProgressionAnalysis {
  key: TonalityDTO;
  romanNumerals: string[];
  functions: HarmonicFunction[];
  complexity: number;
  commonProgressions: CommonProgression[];
}

export interface CommonProgression {
  name: string;
  pattern: string[];
  frequency: number;
  genre: string[];
}