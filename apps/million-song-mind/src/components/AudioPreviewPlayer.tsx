import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface AudioPreviewPlayerProps {
  spotifySongId: string;
  songName: string;
  artistName: string;
  isVisible: boolean;
  previewUrl?: string;
  onClose: () => void;
}

export const AudioPreviewPlayer: React.FC<AudioPreviewPlayerProps> = ({
  spotifySongId,
  songName,
  artistName,
  isVisible,
  previewUrl,
  onClose
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(10); // 10 seconds max
  const audioRef = useRef<HTMLAudioElement>(null);

// Use provided preview URL if available
const resolvedPreviewUrl = previewUrl || '';

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      
      const updateTime = () => {
        setCurrentTime(audio.currentTime);
        if (audio.currentTime >= 10) {
          // Stop at 10 seconds
          audio.pause();
          setIsPlaying(false);
          audio.currentTime = 0;
          setCurrentTime(0);
        }
      };

      const handleLoadedMetadata = () => {
        setDuration(Math.min(audio.duration, 10));
      };

      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);

      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, []);

const togglePlay = async () => {
  if (audioRef.current && resolvedPreviewUrl) {
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Audio playback failed:', error);
        // Fallback to Spotify if audio fails
        window.open(`https://open.spotify.com/track/${spotifySongId}`, '_blank');
      }
    }
  }
};

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const clickTime = (clickX / width) * 10; // 10 seconds max
      
      audioRef.current.currentTime = Math.min(clickTime, 10);
      setCurrentTime(Math.min(clickTime, 10));
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">{songName}</h3>
                <p className="text-muted-foreground text-sm">{artistName}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                ×
              </Button>
            </div>

{/* Audio area */}
{resolvedPreviewUrl ? (
  <>
    <audio ref={audioRef} src={resolvedPreviewUrl} preload="metadata" />
    {/* Progress Bar */}
    <div className="space-y-2">
      <div 
        className="w-full h-2 bg-muted rounded-full cursor-pointer relative"
        onClick={handleProgressClick}
      >
        <div 
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${(currentTime / 10) * 100}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(10)}</span>
      </div>
    </div>
  </>
) : (
  <div className="text-center py-8">
    <div className="text-muted-foreground mb-4">
      <p className=" text-sm">🎵 Spotify Preview</p>
      <p className="text-xs mt-2">Preview URLs require Spotify API access</p>
    </div>
    <Button 
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        window.open(`https://open.spotify.com/track/${spotifySongId}`, '_blank');
      }}
      className=" text-xs tracking-wide"
    >
      Open in Spotify
    </Button>
  </div>
)}

            {/* Controls */}
            <div className="flex items-center justify-center space-x-4">
<Button
  size="lg"
  onClick={togglePlay}
  className="rounded-full w-12 h-12"
  disabled={!resolvedPreviewUrl}
>
  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
</Button>
              
<Button
  variant="ghost"
  size="sm"
  onClick={toggleMute}
  disabled={!resolvedPreviewUrl}
>
  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
</Button>
            </div>

{/* Info */}
<div className="text-center text-xs text-muted-foreground">
  <p>10-second preview • Spotify</p>
  <p>Click progress bar to seek</p>
</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 