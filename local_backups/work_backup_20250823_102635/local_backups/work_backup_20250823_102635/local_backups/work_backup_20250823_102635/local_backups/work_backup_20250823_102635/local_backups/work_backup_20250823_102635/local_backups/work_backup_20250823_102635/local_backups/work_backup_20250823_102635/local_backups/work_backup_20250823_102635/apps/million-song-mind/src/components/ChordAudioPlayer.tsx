import React from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';
import { useGlobalKey } from '@/state/globalKeyStore';

interface ChordAudioPlayerProps {
  chord: string;
  isPlaying?: boolean;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

export const ChordAudioPlayer: React.FC<ChordAudioPlayerProps> = ({
  chord,
  isPlaying = false,
  className = '',
  size = 'sm'
}) => {
  const { focusedKey } = useGlobalKey();
  const [isCurrentlyPlaying, setIsCurrentlyPlaying] = React.useState(false);

  const playChord = React.useCallback(async () => {
    if (isCurrentlyPlaying) return;
    
    setIsCurrentlyPlaying(true);
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const gainNode = audioContext.createGain();
      gainNode.connect(audioContext.destination);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      const frequencies = getChordFrequencies(chord, focusedKey);
      
      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        oscillator.connect(gainNode);
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
        oscillator.type = 'sine';
        oscillator.start(audioContext.currentTime + index * 0.02);
        oscillator.stop(audioContext.currentTime + 0.5);
      });
      
      setTimeout(() => {
        setIsCurrentlyPlaying(false);
        audioContext.close();
      }, 600);
    } catch (error) {
      console.warn('Audio playback failed:', error);
      setIsCurrentlyPlaying(false);
    }
  }, [chord, focusedKey, isCurrentlyPlaying]);

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={playChord}
      disabled={isCurrentlyPlaying}
      className={`${className} opacity-60 hover:opacity-100 transition-opacity`}
      aria-label={`Play ${chord} chord`}
    >
      {isCurrentlyPlaying ? (
        <Volume2 className="h-3 w-3 animate-pulse" />
      ) : (
        <VolumeX className="h-3 w-3" />
      )}
    </Button>
  );
};

function getChordFrequencies(chord: string, key: string): number[] {
  const baseFreqs: Record<string, number> = {
    'C': 261.63, 'C#': 277.18, 'Db': 277.18,
    'D': 293.66, 'D#': 311.13, 'Eb': 311.13,
    'E': 329.63, 'F': 349.23, 'F#': 369.99, 'Gb': 369.99,
    'G': 392.00, 'G#': 415.30, 'Ab': 415.30,
    'A': 440.00, 'A#': 466.16, 'Bb': 466.16,
    'B': 493.88
  };

  const root = key.charAt(0).toUpperCase();
  const rootFreq = baseFreqs[root] || 261.63;
  
  if (chord.includes('i') || chord.includes('minor')) {
    return [rootFreq, rootFreq * 1.2, rootFreq * 1.5];
  }
  
  return [rootFreq, rootFreq * 1.25, rootFreq * 1.5];
}

export default ChordAudioPlayer;