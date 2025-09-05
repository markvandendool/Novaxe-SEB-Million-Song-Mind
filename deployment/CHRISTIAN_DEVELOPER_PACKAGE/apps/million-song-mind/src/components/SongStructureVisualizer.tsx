import React from 'react';
import { ParsedSong, SongSection } from '../types/cpml';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SongStructureVisualizerProps {
  song: ParsedSong;
  selectedSongId: string | null;
  onSongSelect?: (songId: string) => void;
}

const SECTION_COLORS = {
  intro: 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/50 dark:border-blue-600 dark:text-blue-200',
  verse: 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/50 dark:border-green-600 dark:text-green-200', 
  chorus: 'bg-orange-100 border-orange-300 text-orange-800 dark:bg-orange-900/50 dark:border-orange-600 dark:text-orange-200',
  bridge: 'bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-900/50 dark:border-purple-600 dark:text-purple-200',
  outro: 'bg-gray-100 border-gray-300 text-gray-800 dark:bg-gray-800/50 dark:border-gray-600 dark:text-gray-200',
  solo: 'bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-900/50 dark:border-yellow-600 dark:text-yellow-200',
  progression: 'bg-slate-100 border-slate-300 text-slate-800 dark:bg-slate-800/50 dark:border-slate-600 dark:text-slate-200'
};

export function SongStructureVisualizer({ song, selectedSongId, onSongSelect }: SongStructureVisualizerProps) {
  const isSelected = selectedSongId === song.id;
  
  const handleClick = () => {
    onSongSelect?.(song.id);
  };

  const renderSection = (section: SongSection, index: number) => {
    const colorClass = SECTION_COLORS[section.sectionType as keyof typeof SECTION_COLORS] || SECTION_COLORS.progression;
    
    return (
      <div key={`${section.fullLabel}-${index}`} className="mb-4">
        <div className={`p-3 rounded-lg border-2 ${colorClass} transition-all duration-200`}>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary" className=" text-xs">
              {section.fullLabel}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {section.chords.length} chords
            </span>
          </div>
          
          <div className="grid grid-cols-4 gap-2 mt-2">
            {section.chords.map((chord, chordIndex) => (
              <div
                key={`${chord}-${chordIndex}`}
                className="bg-background/80 px-2 py-1 rounded text-center text-sm  border"
              >
                {chord}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card 
      className={`w-full transition-all duration-200 cursor-pointer bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-900/10 dark:to-blue-900/10 border-purple-200 dark:border-purple-700 ${
        isSelected ? 'ring-2 ring-purple-500 shadow-lg' : 'hover:shadow-md hover:border-purple-400'
      }`}
      onClick={handleClick}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-purple-800 dark:text-purple-200">{song.spotify_artist_id || 'Unknown Artist'}</CardTitle>
          <Badge variant="outline" className="border-purple-300 text-purple-700 dark:border-purple-600 dark:text-purple-300">ID: {song.id}</Badge>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          {song.main_genre && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200">{song.main_genre}</Badge>
          )}
          {song.decade && (
            <Badge variant="outline" className="border-purple-300 text-purple-700 dark:border-purple-600 dark:text-purple-300">{song.decade}s</Badge>
          )}
          {song.hasStructure ? (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">Structured</Badge>
          ) : (
            <Badge variant="secondary">Flat Progression</Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {song.sections.length > 0 ? (
          <div className="space-y-2">
            {song.sections.map((section, index) => renderSection(section, index))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No chord progression data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}