import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Filter, Music, Users, Calendar, Tag } from 'lucide-react';

interface SearchFiltersProps {
  onSearch: (filters: SearchFilters) => void;
  totalSongs: number;
  filteredCount: number;
  isLoading?: boolean;
}

interface SearchFilters {
  songName: string;
  artistName: string;
  genre: string;
  yearRange: [number, number];
  selectedChords: string[];
  decade: string;
}

export function SearchFilters({ onSearch, totalSongs, filteredCount, isLoading }: SearchFiltersProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    songName: '',
    artistName: '',
    genre: '',
    yearRange: [1950, 2024],
    selectedChords: [],
    decade: ''
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = useCallback((key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onSearch(newFilters);
  }, [filters, onSearch]);

  const clearFilters = useCallback(() => {
    const emptyFilters: SearchFilters = {
      songName: '',
      artistName: '',
      genre: '',
      yearRange: [1950, 2024],
      selectedChords: [],
      decade: ''
    };
    setFilters(emptyFilters);
    onSearch(emptyFilters);
  }, [onSearch]);

  const genres = [
    'pop', 'rock', 'metal', 'country', 'classical', 'jazz', 'blues', 'electronic', 
    'hip-hop', 'r&b', 'indie', 'alternative', 'folk', 'reggae', 'latin'
  ];

  const decades = ['1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];

  return (
    <div className="bg-gradient-surface border border-border rounded-lg shadow-professional px-20">
      {/* Header with Live Counter */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl  font-bold text-foreground tracking-wider">
              HARMONIC DATABASE SEARCH
            </h2>
            <p className="text-muted-foreground  text-sm">
              Professional Music Analysis • Educational Interface
            </p>
          </div>
          
          {/* Live Counter */}
          <div className="text-right">
            <div className="text-3xl  font-bold text-primary">
              {filteredCount.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground ">
              of {totalSongs.toLocaleString()} songs
            </div>
            <div className="text-xs text-accent  mt-1">
              {((filteredCount / totalSongs) * 100).toFixed(1)}% of database
            </div>
          </div>
        </div>
      </div>

      {/* Quick Search Bar */}
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Song Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Music className="w-4 h-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder="Search songs..."
              value={filters.songName}
              onChange={(e) => handleFilterChange('songName', e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg text-foreground  text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
              disabled={isLoading}
            />
          </div>

          {/* Artist Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder="Search artists..."
              value={filters.artistName}
              onChange={(e) => handleFilterChange('artistName', e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg text-foreground  text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className=""
            disabled={isLoading}
          >
            <Filter className="w-4 h-4 mr-2" />
            {isExpanded ? 'Hide' : 'Show'} Advanced Filters
          </Button>

          <Button
            variant="harmonic"
            onClick={clearFilters}
            disabled={isLoading}
          >
            🔄 CLEAR ALL
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="px-6 pb-6 space-y-6 border-t border-border animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Genre Filter */}
            <div className="space-y-2">
              <label className="flex items-center text-sm  font-bold text-foreground">
                <Tag className="w-4 h-4 mr-2 text-accent" />
                GENRE
              </label>
              <select
                value={filters.genre}
                onChange={(e) => handleFilterChange('genre', e.target.value)}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground  text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isLoading}
              >
                <option value="">All Genres</option>
                {genres.map(genre => (
                  <option key={genre} value={genre}>
                    {genre.charAt(0).toUpperCase() + genre.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Decade Filter */}
            <div className="space-y-2">
              <label className="flex items-center text-sm  font-bold text-foreground">
                <Calendar className="w-4 h-4 mr-2 text-accent" />
                DECADE
              </label>
              <select
                value={filters.decade}
                onChange={(e) => handleFilterChange('decade', e.target.value)}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground  text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isLoading}
              >
                <option value="">All Decades</option>
                {decades.map(decade => (
                  <option key={decade} value={decade}>
                    {decade}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Range */}
            <div className="space-y-2">
              <label className="flex items-center text-sm  font-bold text-foreground">
                <Calendar className="w-4 h-4 mr-2 text-accent" />
                YEAR RANGE
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1950"
                  max="2024"
                  value={filters.yearRange[0]}
                  onChange={(e) => handleFilterChange('yearRange', [parseInt(e.target.value), filters.yearRange[1]])}
                  className="w-20 px-2 py-2 bg-input border border-border rounded text-foreground  text-xs focus:ring-1 focus:ring-primary"
                  disabled={isLoading}
                />
                <span className="text-muted-foreground">–</span>
                <input
                  type="number"
                  min="1950"
                  max="2024"
                  value={filters.yearRange[1]}
                  onChange={(e) => handleFilterChange('yearRange', [filters.yearRange[0], parseInt(e.target.value)])}
                  className="w-20 px-2 py-2 bg-input border border-border rounded text-foreground  text-xs focus:ring-1 focus:ring-primary"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Chord Selection Instructions */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h4 className="text-sm  font-bold text-foreground mb-2">
              🎵 CHORD FILTERING
            </h4>
            <p className="text-xs text-muted-foreground ">
              Click chords on the chart below while holding <kbd className="bg-muted px-1 rounded text-xs">⌘</kbd> to filter songs.
              Selected chords will show only songs using those specific harmonies.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}