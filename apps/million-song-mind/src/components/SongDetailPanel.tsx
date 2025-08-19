import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Music, ExternalLink, User, Calendar, Key, Hash, Disc3, Activity, Heart, Zap, TrendingUp, Volume2, Guitar, Mic, Radio, Clock, Play } from 'lucide-react';
import { AudioPreviewPlayer } from './AudioPreviewPlayer';

interface SongDetailPanelProps {
  song: any;
  isVisible: boolean;
  onClose: () => void;
}

export const SongDetailPanel: React.FC<SongDetailPanelProps> = ({ song, isVisible, onClose }) => {
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  
  if (!isVisible || !song) return null;

  // Create Spotify link if we have a Spotify song ID
  const spotifyUrl = song.spotify_song_id 
    ? `https://open.spotify.com/track/${song.spotify_song_id}`
    : null;

  // Format duration from milliseconds
  const formatDuration = (ms: number) => {
    if (!ms) return 'Unknown';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Format key from numeric value
  const formatKey = (key: number, mode: number) => {
    if (key === null || key === undefined) return 'Unknown';
    const keys = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
    const modes = ['Minor', 'Major'];
    return `${keys[key]} ${modes[mode] || 'Major'}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <Music className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl font-bold">Song Details</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Basic Song Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {song.song_name || song.spotify_song_id || 'Unknown Song'}
                </h3>
                <p className="text-muted-foreground flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  {song.artist_name || song.spotify_artist_id || 'Unknown Artist'}
                </p>
              </div>

              {/* Musical Analysis */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Key:</strong> {formatKey(song.key, song.mode)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Structure:</strong> {song.hasStructure ? 'Has Sections' : 'Simple Progression'}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Duration:</strong> {formatDuration(song.duration_ms)}
                  </span>
                </div>
              </div>
            </div>

            {/* Spotify Integration */}
            <div className="space-y-4">
              {spotifyUrl && (
                <div className="space-y-2">
                  <Button 
                    className="w-full"
                    onClick={() => setShowAudioPlayer(true)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Play 10-Second Preview
                  </Button>
                  <Button 
                    variant="outline"
                    asChild 
                    className="w-full"
                    onClick={() => window.open(spotifyUrl, '_blank')}
                  >
                    <a href={spotifyUrl} target="_blank" rel="noopener noreferrer">
                      <Music className="h-4 w-4 mr-2" />
                      Open in Spotify
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </a>
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Preview plays in browser • Full song opens in Spotify
                  </p>
                </div>
              )}

              {/* Spotify Metadata */}
              {song.popularity && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Popularity</span>
                    <span className="text-sm text-muted-foreground">{song.popularity}/100</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${song.popularity}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Harmonic Analysis */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold flex items-center">
              <Guitar className="h-5 w-5 mr-2 text-primary" />
              Harmonic Analysis
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h5 className="font-medium text-sm">Original Chords</h5>
                <div className="bg-muted p-3 rounded-lg">
                  <code className="text-sm  break-all">
                    {song.chords || 'No chord data available'}
                  </code>
                </div>
              </div>
              
              <div className="space-y-2">
                <h5 className="font-medium text-sm">Roman Numerals</h5>
                <div className="bg-muted p-3 rounded-lg">
                  <code className="text-sm  break-all">
                    {song.roman_numerals || 'No Roman numeral analysis available'}
                  </code>
                </div>
              </div>
            </div>

            {/* TRUE HUV Fingerprint */}
            {song.harmonic_fingerprint && (
              <div className="space-y-2">
                <h5 className="font-medium text-sm">TRUE HUV Fingerprint</h5>
                <div className="bg-muted p-3 rounded-lg">
                  <code className="text-sm  break-all">
                    {song.harmonic_fingerprint}
                  </code>
                </div>
              </div>
            )}
          </div>

          {/* Spotify Audio Features */}
          {song.tempo && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold flex items-center">
                <Activity className="h-5 w-5 mr-2 text-primary" />
                Audio Features
              </h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-1">
                    <Zap className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-medium">Tempo</span>
                  </div>
                  <p className="text-sm">{song.tempo?.toFixed(0)} BPM</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center space-x-1">
                    <Volume2 className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-medium">Loudness</span>
                  </div>
                  <p className="text-sm">{song.loudness?.toFixed(1)} dB</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center space-x-1">
                    <Heart className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-medium">Danceability</span>
                  </div>
                  <p className="text-sm">{(song.danceability * 100)?.toFixed(0)}%</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-medium">Energy</span>
                  </div>
                  <p className="text-sm">{(song.energy * 100)?.toFixed(0)}%</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center space-x-1">
                    <Mic className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-medium">Speechiness</span>
                  </div>
                  <p className="text-sm">{(song.speechiness * 100)?.toFixed(0)}%</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center space-x-1">
                    <Radio className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-medium">Acousticness</span>
                  </div>
                  <p className="text-sm">{(song.acousticness * 100)?.toFixed(0)}%</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center space-x-1">
                    <Disc3 className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-medium">Instrumentalness</span>
                  </div>
                  <p className="text-sm">{(song.instrumentalness * 100)?.toFixed(0)}%</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center space-x-1">
                    <Activity className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-medium">Liveness</span>
                  </div>
                  <p className="text-sm">{(song.liveness * 100)?.toFixed(0)}%</p>
                </div>
              </div>
            </div>
          )}

          {/* Genres */}
          {song.genres && (
            <div className="space-y-2">
              <h5 className="font-medium text-sm">Genres</h5>
              <div className="flex flex-wrap gap-2">
                {song.genres.split(',').map((genre: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {genre.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Audio Preview Player */}
      {showAudioPlayer && song.spotify_song_id && (
        <AudioPreviewPlayer
          spotifySongId={song.spotify_song_id}
          songName={song.song_name || 'Unknown Song'}
          artistName={song.artist_name || 'Unknown Artist'}
          isVisible={showAudioPlayer}
          onClose={() => setShowAudioPlayer(false)}
        />
      )}
    </div>
  );
}; 