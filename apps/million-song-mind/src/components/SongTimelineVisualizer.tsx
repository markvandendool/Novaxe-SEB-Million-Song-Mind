import React from 'react';
import { ParsedSong, SongSection } from '../types/cpml';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Music } from 'lucide-react';

interface SongTimelineVisualizerProps {
  song: ParsedSong;
  onSectionTypeFilter?: (sectionType: string) => void;
}

const SECTION_COLORS = {
  intro: 'bg-blue-500 hover:bg-blue-600',
  verse: 'bg-green-500 hover:bg-green-600', 
  chorus: 'bg-orange-500 hover:bg-orange-600',
  bridge: 'bg-purple-500 hover:bg-purple-600',
  outro: 'bg-gray-500 hover:bg-gray-600',
  solo: 'bg-yellow-500 hover:bg-yellow-600',
  progression: 'bg-slate-500 hover:bg-slate-600'
};

const SECTION_LABELS = {
  intro: 'Intro',
  verse: 'Verse',
  chorus: 'Chorus',
  bridge: 'Bridge',
  outro: 'Outro',
  solo: 'Solo',
  progression: 'Progression'
};

export function SongTimelineVisualizer({ song, onSectionTypeFilter }: SongTimelineVisualizerProps) {
  const totalChords = song.sections.reduce((sum, section) => sum + section.chords.length, 0);
  
  const handleSectionClick = (sectionType: string) => {
    onSectionTypeFilter?.(sectionType);
  };

  const renderTimelineBlock = (section: SongSection, index: number) => {
    const percentage = totalChords > 0 ? (section.chords.length / totalChords) * 100 : 0;
    const colorClass = SECTION_COLORS[section.sectionType as keyof typeof SECTION_COLORS] || SECTION_COLORS.progression;
    const label = SECTION_LABELS[section.sectionType as keyof typeof SECTION_LABELS] || 'Unknown';
    
    return (
      <div
        key={`${section.fullLabel}-${index}`}
        className={`relative ${colorClass} text-white text-xs font-medium cursor-pointer transition-all duration-200 hover:scale-105 hover:z-10`}
        style={{ 
          width: `${Math.max(percentage, 8)}%`, // Minimum 8% width for visibility
          minWidth: '60px'
        }}
        onClick={() => handleSectionClick(section.sectionType)}
        title={`${section.fullLabel}: ${section.chords.length} chords\nClick to filter by ${label}`}
      >
        <div className="px-2 py-3 text-center overflow-hidden">
          <div className="font-semibold truncate">{label} {section.sectionNumber}</div>
          <div className="text-xs opacity-90">{section.chords.length}</div>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-900/10 dark:to-blue-900/10 border-purple-200 dark:border-purple-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
            <Music className="h-5 w-5" />
            {song.spotify_artist_id || 'Unknown Artist'}
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="border-purple-300 text-purple-700 dark:border-purple-600 dark:text-purple-300">
              {totalChords} chords
            </Badge>
            <Badge variant="outline" className="border-purple-300 text-purple-700 dark:border-purple-600 dark:text-purple-300">
              {song.sections.length} sections
            </Badge>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          {song.main_genre && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200">
              {song.main_genre}
            </Badge>
          )}
          {song.decade && (
            <Badge variant="outline" className="border-purple-300 text-purple-700 dark:border-purple-600 dark:text-purple-300">
              {song.decade}s
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {song.sections.length > 0 ? (
          <div className="space-y-4">
            {/* Timeline visualization */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
              <div className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-3">
                Song Structure Timeline (click sections to filter)
              </div>
              <div className="flex gap-1 rounded-md overflow-hidden shadow-sm min-h-[60px]">
                {song.sections.map((section, index) => renderTimelineBlock(section, index))}
              </div>
            </div>
            
            {/* Section legend */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              {song.sections.map((section, index) => (
                <div 
                  key={`legend-${section.fullLabel}-${index}`}
                  className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded border border-purple-200 dark:border-purple-700"
                >
                  <div 
                    className={`w-3 h-3 rounded ${SECTION_COLORS[section.sectionType as keyof typeof SECTION_COLORS] || SECTION_COLORS.progression}`}
                  />
                  <span className="text-purple-700 dark:text-purple-300 ">
                    {section.fullLabel} ({section.chords.length})
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No chord progression data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}