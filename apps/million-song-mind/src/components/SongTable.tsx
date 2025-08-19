import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Music2, User, KeyRound, ChevronLeft, ChevronRight } from 'lucide-react';
import { AudioPreviewPlayer } from '@/components/AudioPreviewPlayer';
interface Song {
  id: string;
  songName: string;
  artistName: string;
  releaseDate: string;
  genres: string[];
  decade: string;
  mainGenre: string;
  key?: string;
  romanNumerals?: string;
  previewUrl?: string;
  spotifySongId: string;
  spotifyArtistId: string;
  chords: string[];
  harmonic_profile?: any;
}

interface SongTableProps {
  songs: Song[];
  isLoading?: boolean;
  onSongSelect?: (song: Song) => void;
  selectedSongs?: string[];
}

export function SongTable({ songs, isLoading, onSongSelect, selectedSongs = [] }: SongTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLetter, setSelectedLetter] = useState('A');
  const [sortField, setSortField] = useState<keyof Song>('songName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [previewSong, setPreviewSong] = useState<Song | null>(null);
  
  const itemsPerPage = 50;

  // Generate alphabet for pagination
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // Filter songs by selected letter and sort
  const filteredAndSortedSongs = useMemo(() => {
    let filtered = songs.filter(song => 
      song.songName.charAt(0).toUpperCase() === selectedLetter ||
      song.artistName.charAt(0).toUpperCase() === selectedLetter
    );

    // Sort songs
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (Array.isArray(aValue)) aValue = aValue.join(', ');
      if (Array.isArray(bValue)) bValue = bValue.join(', ');
      
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [songs, selectedLetter, sortField, sortDirection]);

  // Paginate songs
  const paginatedSongs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedSongs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedSongs, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedSongs.length / itemsPerPage);

  const handleSort = (field: keyof Song) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleLetterChange = (letter: string) => {
    setSelectedLetter(letter);
    setCurrentPage(1);
  };

const handlePlay = (song: Song) => {
  setPreviewSong(song);
};

  if (isLoading) {
    return (
      <div className="bg-gradient-surface border border-border rounded-lg shadow-professional p-8 px-20">
        <div className="text-center space-y-4">
          <div className="text-primary  text-xl animate-pulse">
            ⏳ ANALYZING MUSICAL DATABASE...
          </div>
          <div className="w-full max-w-md mx-auto bg-muted rounded-full h-2">
            <div className="bg-gradient-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-surface border border-border rounded-lg shadow-professional px-20">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl  font-bold text-foreground tracking-wider">
              SONG DATABASE
            </h3>
            <p className="text-muted-foreground  text-sm">
              {filteredAndSortedSongs.length.toLocaleString()} songs • Letter "{selectedLetter}"
            </p>
          </div>
          
          {/* Letter Pagination */}
          <div className="flex flex-wrap gap-1">
            {alphabet.map(letter => {
              const count = songs.filter(song => 
                song.songName.charAt(0).toUpperCase() === letter ||
                song.artistName.charAt(0).toUpperCase() === letter
              ).length;
              
              return (
                <Button
                  key={letter}
                  variant={selectedLetter === letter ? "professional" : "outline"}
                  size="sm"
                  onClick={() => handleLetterChange(letter)}
                  disabled={count === 0}
                  className="w-10 h-8 text-xs "
                  title={`${count} songs starting with ${letter}`}
                >
                  {letter}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th 
                className="px-6 py-4 text-left text-xs  font-bold text-foreground uppercase tracking-wider cursor-pointer hover:bg-secondary transition-colors"
                onClick={() => handleSort('songName')}
              >
                <div className="flex items-center space-x-1">
                  <Music2 className="w-4 h-4" />
                  <span>Song</span>
                  {sortField === 'songName' && (
                    <span className="text-primary">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-4 text-left text-xs  font-bold text-foreground uppercase tracking-wider cursor-pointer hover:bg-secondary transition-colors"
                onClick={() => handleSort('artistName')}
              >
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>Artist</span>
                  {sortField === 'artistName' && (
                    <span className="text-primary">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
<th 
  className="px-6 py-4 text-left text-xs  font-bold text-foreground uppercase tracking-wider cursor-pointer hover:bg-secondary transition-colors"
  onClick={() => handleSort('releaseDate')}
>
  <div className="flex items-center space-x-1">
    <KeyRound className="w-4 h-4" />
    <span>Key</span>
  </div>
</th>
<th className="px-6 py-4 text-left text-xs  font-bold text-foreground uppercase tracking-wider">
  Chords
</th>
<th className="px-6 py-4 text-left text-xs  font-bold text-foreground uppercase tracking-wider">
  Chords
</th>
<th className="px-6 py-4 text-center text-xs  font-bold text-foreground uppercase tracking-wider">
  Play
</th>
            </tr>
          </thead>
          <tbody className="bg-background">
            {paginatedSongs.map((song, index) => (
              <tr 
                key={song.id}
                className={`border-b border-border hover:bg-secondary/50 transition-colors cursor-pointer ${
                  selectedSongs.includes(song.id) ? 'bg-primary/10' : ''
                }`}
                onClick={() => onSongSelect?.(song)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm  font-medium text-foreground">
                    {song.songName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm  text-muted-foreground">
                    {song.artistName}
                  </div>
                </td>
<td className="px-6 py-4 whitespace-nowrap">
  <div className="text-sm  text-muted-foreground">
    {song.key || '—'}
  </div>
</td>
<td className="px-6 py-4" colSpan={2}>
  <div className="max-w-xl">
    <div className="text-sm  text-foreground truncate">
      {Array.isArray(song.chords) ? song.chords.join(' ') : song.chords}
    </div>
    <div className="text-xs  text-muted-foreground truncate">
      {song.romanNumerals || '—'}
    </div>
  </div>
</td>
<td className="px-6 py-4 text-center">
  <Button
    variant="outline"
    size="sm"
    onClick={(e) => {
      e.stopPropagation();
      handlePlay(song);
    }}
    className="w-8 h-8 p-0"
    title="Play preview"
  >
    <Play className="w-4 h-4" />
  </Button>
</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-border flex items-center justify-between">
          <div className="text-sm  text-muted-foreground">
            Page {currentPage} of {totalPages} • {filteredAndSortedSongs.length} songs starting with "{selectedLetter}"
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <span className="text-sm  text-foreground">
              {currentPage} / {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
      {previewSong && (
        <AudioPreviewPlayer
          spotifySongId={previewSong.spotifySongId}
          songName={previewSong.songName}
          artistName={previewSong.artistName}
          isVisible={!!previewSong}
          onClose={() => setPreviewSong(null)}
        />
      )}
    </div>
  );
}