import React, { useState, useMemo } from 'react';
import { ParsedSong, VisualizationFilters } from '../types';
import { SongStructureVisualizer } from './SongStructureVisualizer';
import { SongTimelineVisualizer } from './SongTimelineVisualizer';
import { HarmonicChart } from './HarmonicChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Search, Filter, BarChart3, Music2 } from 'lucide-react';

interface VisualizationDashboardProps {
  songs: ParsedSong[];
  format?: "datanaught" | "data1" | "data2" | "data3";
  harmonicData?: any[];
}

export function VisualizationDashboard({ songs, format = "data2", harmonicData }: VisualizationDashboardProps) {
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [filters, setFilters] = useState<VisualizationFilters>({
    genre: 'all',
    decade: 'all',
    artistSearch: '',
    hasStructureOnly: false
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

  // Filter songs based on current filters
  const filteredSongs = useMemo(() => {
    return songs.filter(song => {
      if (filters.genre && filters.genre !== "all" && !song.main_genre?.split(/[,\s]+/).some(g => g.trim() === filters.genre)) return false;
      if (filters.decade && filters.decade !== "all" && song.decade?.toString() !== filters.decade) return false;
      if (filters.artistSearch && !song.spotify_artist_id?.toLowerCase().includes(filters.artistSearch.toLowerCase())) return false;
      if (filters.hasStructureOnly && !song.hasStructure) return false;
      
      return true;
    });
  }, [songs, filters]);

  // Statistics
  const stats = useMemo(() => {
    const structured = filteredSongs.filter(s => s.hasStructure).length;
    const avgSections = filteredSongs.reduce((acc, song) => acc + song.sections.length, 0) / filteredSongs.length || 0;
    
    return {
      total: filteredSongs.length,
      structured,
      avgSections: avgSections.toFixed(1)
    };
  }, [filteredSongs]);

  const clearFilters = () => {
    setFilters({
      genre: 'all',
      decade: 'all',
      artistSearch: '',
      hasStructureOnly: false
    });
  };

  // Show only filters for formats that support them (data2, data3, datanaught)
  const showFilters = format === "data2" || format === "data3" || format === "datanaught";

  // Datanaught format (vertical harmonic profile)
  if (format === "datanaught" && harmonicData?.length) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-900/10 dark:to-blue-900/10 border-purple-200 dark:border-purple-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
              <Music2 className="h-5 w-5" />
              Harmonic Profile (Vertical Format)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HarmonicChart
              data={harmonicData}
              fileCount={1}
              totalSongs={harmonicData.length}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Data1 format (horizontal harmonic profile)
  if (format === "data1") {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-orange-50/50 to-red-50/50 dark:from-orange-900/10 dark:to-red-900/10 border-orange-200 dark:border-orange-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
              <BarChart3 className="h-5 w-5" />
              Harmonic Profile (Horizontal Format)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">
              Each row represents a song's harmonic profile. Visualization is not yet implemented.
            </p>
            {songs.length > 0 && (
              <div className="text-sm text-muted-foreground">
                <strong>{songs.length}</strong> song profiles loaded successfully
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Data2 (CPML) or Data3 (Combined) formats
  if ((format === "data2" || format === "data3") && showFilters) {
    return (
      <div className="space-y-6">
        {/* Filters Panel */}
        <Card className="bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-900/10 dark:to-blue-900/10 border-purple-200 dark:border-purple-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
              <Filter className="h-5 w-5" />
              Filters & Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <Label htmlFor="artist-search" className="text-purple-700 dark:text-purple-300">Artist Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <Input
                    id="artist-search"
                    placeholder="Search artists..."
                    value={filters.artistSearch}
                    onChange={(e) => setFilters(prev => ({ ...prev, artistSearch: e.target.value }))}
                    className="pl-10 border-purple-300 focus:border-purple-500 dark:border-purple-600 dark:focus:border-purple-400 bg-background"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="genre-select" className="text-purple-700 dark:text-purple-300">Genre</Label>
                <Select value={filters.genre} onValueChange={(value) => setFilters(prev => ({ ...prev, genre: value }))}>
                  <SelectTrigger className="border-purple-300 focus:border-purple-500 dark:border-purple-600 dark:focus:border-purple-400 bg-background">
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
                <Label htmlFor="decade-select" className="text-purple-700 dark:text-purple-300">Decade</Label>
                <Select value={filters.decade} onValueChange={(value) => setFilters(prev => ({ ...prev, decade: value }))}>
                  <SelectTrigger className="border-purple-300 focus:border-purple-500 dark:border-purple-600 dark:focus:border-purple-400 bg-background">
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

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="border-purple-300 text-purple-700 hover:bg-purple-100 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-900/50"
                >
                  Clear Filters
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="structure-only"
                checked={filters.hasStructureOnly}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, hasStructureOnly: !!checked }))}
              />
              <Label htmlFor="structure-only" className="text-purple-700 dark:text-purple-300">Show only songs with structure tags</Label>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Statistics Panel */}
        <Card className="bg-gradient-to-br from-blue-50/50 to-green-50/50 dark:from-blue-900/10 dark:to-green-900/10 border-blue-200 dark:border-blue-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <BarChart3 className="h-5 w-5" />
              Dataset Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Songs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.structured}</div>
                <div className="text-sm text-muted-foreground">With Structure</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.avgSections}</div>
                <div className="text-sm text-muted-foreground">Avg Sections</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Song Structure Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSongs.length > 0 ? (
            filteredSongs.slice(0, 20).map(song => (
              <SongTimelineVisualizer
                key={song.id}
                song={song}
                onSectionTypeFilter={(sectionType) => {
                  console.log('Filter by section:', sectionType);
                }}
              />
            ))
          ) : (
            <div className="col-span-full">
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-lg text-muted-foreground mb-4">No songs match your current filters</p>
                  <Button 
                    variant="outline" 
                    onClick={clearFilters}
                    className="border-purple-300 text-purple-700 hover:bg-purple-100 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-900/50"
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {filteredSongs.length > 20 && (
          <Card className="bg-gradient-to-br from-yellow-50/50 to-orange-50/50 dark:from-yellow-900/10 dark:to-orange-900/10 border-yellow-200 dark:border-yellow-700">
            <CardContent className="text-center py-6">
              <p className="text-yellow-700 dark:text-yellow-300">
                Showing first 20 of {filteredSongs.length} songs. Use filters to narrow down results.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Fallback for unsupported formats or no data
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-lg text-muted-foreground">No data available for this view.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Format: {format || 'unknown'} • Songs: {songs.length}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}