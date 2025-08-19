import React, { useState, useMemo } from 'react';
import { ParsedSong, VisualizationFilters } from '../types/cpml';
import { SongStructureVisualizer } from './SongStructureVisualizer';
import { SongTimelineVisualizer } from './SongTimelineVisualizer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Search, Filter, BarChart3, Download, ArrowUpDown, Grid, BarChart2 } from 'lucide-react';

interface MusicVizDashboardProps {
  songs: ParsedSong[];
}

export function MusicVizDashboard({ songs }: MusicVizDashboardProps) {
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'timeline'>('timeline'); // unified: show timeline by default
  const [sortBy, setSortBy] = useState<'artist' | 'sections' | 'chords'>('artist');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<VisualizationFilters>({
    genre: 'all',
    decade: 'all',
    artistSearch: '',
    hasStructureOnly: false,
  });

  // Extract unique values for filter options
  const filterOptions = useMemo(() => {
    const allGenres = songs.map(s => s.main_genre).filter(Boolean);
    const expandedGenres = allGenres.flatMap(genre => 
      genre.split(/[,\s]+/).map(g => g.trim()).filter(Boolean)
    );
    const genres = [...new Set(expandedGenres)].sort();
    const decades = [...new Set(songs.map(s => s.decade).filter(Boolean))].sort();
    
    return { genres, decades };
  }, [songs]);

  // Sort songs only (filtering/search handled upstream via unified search)
  const sortedSongs = useMemo(() => {
    let filtered = songs.filter(song => {
      if (filters.genre && filters.genre !== 'all' && !song.main_genre?.split(/[,\s]+/).some(g => g.trim() === filters.genre)) return false;
      if (filters.decade && filters.decade !== 'all' && song.decade?.toString() !== filters.decade) return false;
      if (filters.artistSearch && !song.spotify_artist_id?.toLowerCase().includes(filters.artistSearch.toLowerCase())) return false;
      if (filters.hasStructureOnly && !song.hasStructure) return false;
      
      return true;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'artist':
          aValue = a.spotify_artist_id || '';
          bValue = b.spotify_artist_id || '';
          break;
        case 'sections':
          aValue = a.sections.length;
          bValue = b.sections.length;
          break;
        case 'chords':
          aValue = a.sections.reduce((sum, s) => sum + s.chords.length, 0);
          bValue = b.sections.reduce((sum, s) => sum + s.chords.length, 0);
          break;
        default:
          return 0;
      }
      
      if (typeof aValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortOrder === 'asc' ? comparison : -comparison;
      } else {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
    });

    return filtered;
  }, [songs, filters, sortBy, sortOrder]);

  const filteredSongs = sortedSongs;

  // Statistics
  const stats = useMemo(() => {
    const structured = sortedSongs.filter(s => s.hasStructure).length;
    const avgSections = sortedSongs.reduce((acc, song) => acc + song.sections.length, 0) / (sortedSongs.length || 1);
    
    return {
      total: sortedSongs.length,
      structured,
      avgSections: avgSections.toFixed(1)
    };
  }, [sortedSongs]);

  const clearFilters = () => {
    setFilters({
      genre: 'all',
      decade: 'all',
      artistSearch: '',
      hasStructureOnly: false
    });
  };

  const handleSectionTypeFilter = (sectionType: string) => {
    // This could be enhanced to filter by section type
    console.log('Filter by section type:', sectionType);
  };

  const exportFilteredData = () => {
    const csvHeader = 'id,chords,release_date,genres,decade,rock_genre,artist_id,main_genre,spotify_song_id,spotify_artist_id\n';
    const csvContent = filteredSongs.map(song => 
      `${song.id},"${song.chords}",${song.release_date || ''},${song.genres || ''},${song.decade || ''},${song.rock_genre || ''},${song.artist_id || ''},${song.main_genre || ''},${song.spotify_song_id || ''},${song.spotify_artist_id || ''}`
    ).join('\n');
    
    const blob = new Blob([csvHeader + csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `musicviz_filtered_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 bg-gradient-surface border border-border rounded-lg shadow-professional px-20 p-6">
      {/* Statistics Panel */}
      <Card className="bg-gradient-surface border border-border rounded-lg shadow-professional">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <BarChart3 className="h-5 w-5" />
            Dataset Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <div>
              <Label htmlFor="musicviz-artist-search" className="text-muted-foreground  text-xs uppercase tracking-wider">Artist Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="musicviz-artist-search"
                  placeholder="Search artists..."
                  value={filters.artistSearch}
                  onChange={(e) => setFilters(prev => ({ ...prev, artistSearch: e.target.value }))}
                  className="pl-10 bg-background/50 border border-border focus:ring-2 focus:ring-primary/30  text-sm"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="musicviz-genre-select" className="text-muted-foreground  text-xs uppercase tracking-wider">Genre</Label>
              <Select value={filters.genre} onValueChange={(value) => setFilters(prev => ({ ...prev, genre: value }))}>
                <SelectTrigger className="bg-background/50 border border-border focus:ring-2 focus:ring-primary/30  text-sm">
                  <SelectValue placeholder="All genres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All genres</SelectItem>
                  {filterOptions.genres.map(genre => (
                    <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="musicviz-decade-select" className="text-muted-foreground  text-xs uppercase tracking-wider">Decade</Label>
              <Select value={filters.decade} onValueChange={(value) => setFilters(prev => ({ ...prev, decade: value }))}>
                <SelectTrigger className="bg-background/50 border border-border focus:ring-2 focus:ring-primary/30  text-sm">
                  <SelectValue placeholder="All decades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All decades</SelectItem>
                  {filterOptions.decades.map(decade => (
                    <SelectItem key={decade} value={decade.toString()}>{decade}s</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="musicviz-sort-select" className="text-muted-foreground  text-xs uppercase tracking-wider">Sort By</Label>
              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [newSortBy, newSortOrder] = value.split('-') as [typeof sortBy, typeof sortOrder];
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
              }}>
                <SelectTrigger className="bg-background/50 border border-border focus:ring-2 focus:ring-primary/30  text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="artist-asc">Artist A-Z</SelectItem>
                  <SelectItem value="artist-desc">Artist Z-A</SelectItem>
                  <SelectItem value="sections-asc">Sections (Low)</SelectItem>
                  <SelectItem value="sections-desc">Sections (High)</SelectItem>
                  <SelectItem value="chords-asc">Chords (Low)</SelectItem>
                  <SelectItem value="chords-desc">Chords (High)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="border-purple-300 text-purple-700 hover:bg-purple-100 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-900/50"
              >
                Clear Filters
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
              <Checkbox
                id="musicviz-structure-only"
                checked={filters.hasStructureOnly}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, hasStructureOnly: !!checked }))}
              />
              <Label htmlFor="musicviz-structure-only" className="text-muted-foreground  text-xs uppercase tracking-wider">Show only songs with structure tags</Label>
            </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportFilteredData}
                className="border-purple-300 text-purple-700 hover:bg-purple-100 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-900/50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              
              <div className="flex border border-purple-300 dark:border-purple-600 rounded-md">
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                  className={viewMode === 'cards' ? 'bg-purple-600 hover:bg-purple-700' : 'text-purple-700 hover:bg-purple-100 dark:text-purple-300 dark:hover:bg-purple-900/50'}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'timeline' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('timeline')}
                  className={viewMode === 'timeline' ? 'bg-purple-600 hover:bg-purple-700' : 'text-purple-700 hover:bg-purple-100 dark:text-purple-300 dark:hover:bg-purple-900/50'}
                >
                  <BarChart2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Panel */}
      <Card className="bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-900/10 dark:to-blue-900/10 border-purple-200 dark:border-purple-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
            <BarChart3 className="h-5 w-5" />
            Dataset Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.total}</div>
              <div className="text-sm text-purple-600 dark:text-purple-400">Total Songs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.structured}</div>
              <div className="text-sm text-purple-600 dark:text-purple-400">With Structure</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.avgSections}</div>
              <div className="text-sm text-purple-600 dark:text-purple-400">Avg Sections</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Song Visualizations */}
      <div className={`grid gap-6 ${viewMode === 'timeline' ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
        {filteredSongs.length > 0 ? (
          filteredSongs.slice(0, 20).map(song => (
            viewMode === 'timeline' ? (
              <SongTimelineVisualizer
                key={song.id}
                song={song}
                onSectionTypeFilter={handleSectionTypeFilter}
              />
            ) : (
              <SongStructureVisualizer
                key={song.id}
                song={song}
                selectedSongId={selectedSongId}
                onSongSelect={setSelectedSongId}
              />
            )
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-lg text-muted-foreground">No songs match your current filters</p>
            <Button 
              variant="outline" 
              onClick={clearFilters} 
              className="mt-4 border-purple-300 text-purple-700 hover:bg-purple-100 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-900/50"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {filteredSongs.length > 20 && (
        <Card className="bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-900/10 dark:to-blue-900/10 border-purple-200 dark:border-purple-700">
          <CardContent className="text-center py-6">
            <p className="text-purple-600 dark:text-purple-400">
              Showing first 20 of {filteredSongs.length} songs. Use filters to narrow down results.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}