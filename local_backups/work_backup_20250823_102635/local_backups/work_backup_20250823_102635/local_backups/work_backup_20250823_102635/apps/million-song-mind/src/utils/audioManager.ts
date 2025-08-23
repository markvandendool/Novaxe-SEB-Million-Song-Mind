// Audio Manager for Chart Interactions
export class AudioManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isEnabled = true;

  constructor() {
    this.initializeAudio();
  }

  private async initializeAudio() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    } catch (error) {
      console.warn('Audio context initialization failed:', error);
      this.isEnabled = false;
    }
  }

  private createTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.3) {
    if (!this.audioContext || !this.masterGain || !this.isEnabled) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = type;
    
    // ADSR envelope for smooth sound
    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.01); // Attack
    gainNode.gain.exponentialRampToValueAtTime(volume * 0.8, now + 0.1); // Decay
    gainNode.gain.setValueAtTime(volume * 0.8, now + duration - 0.1); // Sustain
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration); // Release
    
    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  // Bar animation sound - ascending chord
  playBarAnimation(percentage: number) {
    if (!this.isEnabled) return;
    
    const baseFreq = 220 + (percentage * 8); // Higher pitch for higher values
    const duration = 0.15;
    
    // Play a quick ascending arpeggio
    setTimeout(() => this.createTone(baseFreq, duration, 'sine', 0.2), 0);
    setTimeout(() => this.createTone(baseFreq * 1.25, duration, 'sine', 0.15), 50);
    setTimeout(() => this.createTone(baseFreq * 1.5, duration, 'sine', 0.1), 100);
  }

  // Selection sound - positive chord
  playSelection() {
    if (!this.isEnabled) return;
    
    const baseFreq = 440;
    setTimeout(() => this.createTone(baseFreq, 0.12, 'triangle', 0.25), 0);
    setTimeout(() => this.createTone(baseFreq * 1.25, 0.15, 'triangle', 0.2), 60);
  }

  // Deselection sound - gentle fade
  playDeselection() {
    if (!this.isEnabled) return;
    
    const baseFreq = 330;
    this.createTone(baseFreq, 0.2, 'sine', 0.15);
    setTimeout(() => this.createTone(baseFreq * 0.75, 0.25, 'sine', 0.1), 100);
  }

  // Celebration sound for 100% usage
  playCelebration() {
    if (!this.isEnabled) return;
    
    const baseFreq = 523; // C5
    const notes = [1, 1.25, 1.5, 2, 2.5, 3]; // Major scale up
    
    notes.forEach((ratio, index) => {
      setTimeout(() => {
        this.createTone(baseFreq * ratio, 0.3, 'triangle', 0.3);
      }, index * 100);
    });
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }
}

export const audioManager = new AudioManager();