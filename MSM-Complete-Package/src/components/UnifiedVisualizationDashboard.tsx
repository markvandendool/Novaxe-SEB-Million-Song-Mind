import React, { useState, useMemo } from 'react';
import { ParsedSong, VisualizationFilters } from '../types';
import { SongTimelineVisualizer } from './SongTimelineVisualizer';
import { HarmonicChart } from './HarmonicChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Search, Filter, BarChart3, Music2, Database, TrendingUp } from 'lucide-react';

interface UnifiedVisualizationDashboardProps {
  songs: ParsedSong[];
  format: "datanaught" | "data1" | "data2" | "data3";
  harmonicData?: any[];
}

export function UnifiedVisualizationDashboard({ songs, format, harmonicData }: UnifiedVisualizationDashboardProps) {
  const [filters, setFilters] = useState<VisualizationFilters>({
    genre: 'all',
    decade: 'all',
    artistSearch: '',
    hasStructureOnly: false
  });

  // Extract unique values for filter options (safely handle null/undefined)
  const filterOptions = useMemo(() => {
    const allGenres = songs
      .map(s => s.main_genre)
      .filter((genre): genre is string => Boolean(genre))
      .flatMap(genre => genre.split(/[,\s]+/).map(g => g.trim()).filter(Boolean));
    
    const genres = [...new Set(allGenres)].sort();
    
    const allDecades = songs
      .map(s => s.decade)
      .filter((decade): decade is number => typeof decade === 'number' && !isNaN(decade));
    
    const decades = [...new Set(allDecades)].sort();
    
    return { genres, decades };
  }, [songs]);

  // Filter songs based on current filters (with null safety)
  const filteredSongs = useMemo(() => {
    return songs.filter(song => {
      if (filters.genre && filters.genre !== "all") {
        if (!song.main_genre) return false;
        const songGenres = song.main_genre.split(/[,\s]+/).map(g => g.trim());
        if (!songGenres.some(g => g === filters.genre)) return false;
      }
      
      if (filters.decade && filters.decade !== "all") {
        if (!song.decade || song.decade.toString() !== filters.decade) return false;
      }
      
      if (filters.artistSearch && song.spotify_artist_id) {
        if (!song.spotify_artist_id.toLowerCase().includes(filters.artistSearch.toLowerCase())) return false;
      }
      
      if (filters.hasStructureOnly && !song.hasStructure) return false;
      
      return true;
    });
  }, [songs, filters]);

  // Statistics with safe calculations
  const stats = useMemo(() => {
    const structured = filteredSongs.filter(s => s.hasStructure).length;
    const totalSections = filteredSongs.reduce((acc, song) => acc + (song.sections?.length || 0), 0);
    const avgSections = filteredSongs.length > 0 ? totalSections / filteredSongs.length : 0;
    
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

  // Format-specific rendering
  const renderFormatSpecificContent = () => {
    switch (format) {
      case "datanaught":
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
                  data={harmonicData || []}
                  fileCount={1}
                  totalSongs={harmonicData?.length || 0}
                />
              </CardContent>
            </Card>
          </div>
        );

      case "data1":
        return (
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-orange-50/50 to-red-50/50 dark:from-orange-900/10 dark:to-red-900/10 border-orange-200 dark:border-orange-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                  <TrendingUp className="h-5 w-5" />
                  Harmonic Profile (Horizontal Format)
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center py-12">
                <div className="space-y-4">
                  <div className="text-4xl text-orange-500">📈</div>
                  <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200">
                    Horizontal Harmonic Profiles
                  </h3>
                  <p className="text-orange-600 dark:text-orange-300">
                    Each row represents a song's complete harmonic profile across all chord types.
                  </p>
                  {songs.length > 0 && (
                    <div className="mt-6 p-4 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                        {songs.length}
                      </div>
                      <div className="text-sm text-orange-600 dark:text-orange-400">
                        Song profiles loaded successfully
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-orange-500 dark:text-orange-400 mt-4">
                    Advanced visualization coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "data2":
      case "data3":
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
                  <Label htmlFor="structure-only" className="text-purple-700 dark:text-purple-300">
                    Show only songs with structure tags
                  </Label>
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

            {/* Pagination Indicator */}
            {filteredSongs.length > 20 && (
              <Card className="bg-gradient-to-br from-yellow-50/50 to-orange-50/50 dark:from-yellow-900/10 dark:to-orange-900/10 border-yellow-200 dark:border-yellow-700">
                <CardContent className="text-center py-6">
                  <p className="text-yellow-700 dark:text-yellow-300">
                    Showing first 20 of {filteredSongs.length} songs. Use filters to narrow down results.
                  </p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                    🚀 Ready for massive datasets - Optimized for 680K+ songs
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        );

      default:
        return (
          <Card className="bg-gradient-to-br from-red-50/50 to-pink-50/50 dark:from-red-900/10 dark:to-pink-900/10 border-red-200 dark:border-red-700">
            <CardContent className="text-center py-12">
              <div className="space-y-4">
                <div className="text-4xl text-red-500">❌</div>
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                  Unrecognized Format
                </h3>
                <p className="text-red-600 dark:text-red-300">
                  This file format could not be recognized.
                </p>
                <p className="text-sm text-red-500 dark:text-red-400">
                  Please upload a supported format: CPML (Data2), Harmonic Profile Vertical (Datanaught), 
                  Harmonic Profile Horizontal (Data1), or Combined (Data3).
                </p>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Format Header */}
      <Card className="bg-gradient-to-br from-green-50/50 to-blue-50/50 dark:from-green-900/10 dark:to-blue-900/10 border-green-200 dark:border-green-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <Database className="h-5 w-5" />
            {format === "datanaught" && "Datanaught Format - Vertical Harmonic Profile"}
            {format === "data1" && "Data1 Format - Horizontal Harmonic Profile"} 
            {format === "data2" && "Data2 Format - CPML Chord Progressions"}
            {format === "data3" && "Data3 Format - Combined CPML + Harmonic Analysis"}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Format-specific content */}
      {renderFormatSpecificContent()}
    </div>
  );
}