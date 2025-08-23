export class ChordAudioManager {
  private audioContext: AudioContext | null = null;
  private isEnabled = true;
  private isPlaying = false;

  async initialize() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
    } catch (error) {
      console.warn('Audio initialization failed:', error);
    }
  }

  async playChord(chord: string, key: string = 'C') {
    if (!this.isEnabled || this.isPlaying || !this.audioContext) return;

    this.isPlaying = true;

    try {
      const gainNode = this.audioContext.createGain();
      gainNode.connect(this.audioContext.destination);
      
      gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.8);

      const frequencies = this.getChordFrequencies(chord, key);
      
      frequencies.forEach((freq, index) => {
        const oscillator = this.audioContext!.createOscillator();
        oscillator.connect(gainNode);
        oscillator.frequency.setValueAtTime(freq, this.audioContext!.currentTime);
        oscillator.type = 'sine';
        oscillator.start(this.audioContext!.currentTime + index * 0.03);
        oscillator.stop(this.audioContext!.currentTime + 0.8);
      });

      setTimeout(() => {
        this.isPlaying = false;
      }, 900);
    } catch (error) {
      console.warn('Chord playback failed:', error);
      this.isPlaying = false;
    }
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  private getChordFrequencies(chord: string, key: string): number[] {
    const noteFreqs: Record<string, number> = {
      'C': 261.63, 'C#': 277.18, 'Db': 277.18,
      'D': 293.66, 'D#': 311.13, 'Eb': 311.13,
      'E': 329.63, 'F': 349.23, 'F#': 369.99, 'Gb': 369.99,
      'G': 392.00, 'G#': 415.30, 'Ab': 415.30,
      'A': 440.00, 'A#': 466.16, 'Bb': 466.16,
      'B': 493.88
    };

    const rootNote = key.charAt(0).toUpperCase();
    const rootFreq = noteFreqs[rootNote] || 261.63;

    const romanToInterval: Record<string, number[]> = {
      'I': [0, 4, 7], 'ii': [2, 5, 9], 'iii': [4, 7, 11],
      'IV': [5, 9, 0], 'V': [7, 11, 2], 'vi': [9, 0, 4],
      'viiø': [11, 2, 5],
      'i': [0, 3, 7], 'bIII': [3, 7, 10], 'iv': [5, 8, 0],
      'v': [7, 10, 2], 'bVI': [8, 0, 3], 'bVII': [10, 2, 5]
    };

    const intervals = romanToInterval[chord] || [0, 4, 7];
    
    return intervals.map(interval => {
      const semitoneRatio = Math.pow(2, interval / 12);
      return rootFreq * semitoneRatio;
    });
  }
}

export const chordAudioManager = new ChordAudioManager();