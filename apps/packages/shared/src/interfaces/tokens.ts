/**
 * Dependency Injection tokens for the Novaxe Oracle ecosystem
 * These tokens enable service swapping and feature flag-based implementations
 */

import { InjectionToken } from '@angular/core';
import {
  IMusicTheoryService,
  IMidiService,
  ITransportService,
  IAIAnalysisService,
  IAudioService,
  INotationService
} from './music-services';

// Core service tokens
export const MUSIC_THEORY = new InjectionToken<IMusicTheoryService>('MUSIC_THEORY');
export const MIDI = new InjectionToken<IMidiService>('MIDI');
export const TRANSPORT = new InjectionToken<ITransportService>('TRANSPORT');
export const AI_ANALYSIS = new InjectionToken<IAIAnalysisService>('AI_ANALYSIS');
export const AUDIO = new InjectionToken<IAudioService>('AUDIO');
export const NOTATION = new InjectionToken<INotationService>('NOTATION');

// Configuration tokens
export const MSM_CONFIG = new InjectionToken<MsmConfig>('MSM_CONFIG');
export const AUDIO_CONFIG = new InjectionToken<AudioConfig>('AUDIO_CONFIG');
export const MIDI_CONFIG = new InjectionToken<MidiConfig>('MIDI_CONFIG');

// Configuration interfaces
export interface MsmConfig {
  url: string;
  timeoutMs: number;
  retryAttempts: number;
  enableDebugLogging: boolean;
}

export interface AudioConfig {
  sampleRate: number;
  bufferSize: number;
  latencyHint: 'interactive' | 'balanced' | 'playback';
  enableEffects: boolean;
}

export interface MidiConfig {
  enableSysex: boolean;
  defaultVelocity: number;
  defaultChannel: number;
  autoConnect: boolean;
}