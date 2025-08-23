export interface CPMLSong {
  id: string;
  chords: string;
  release_date?: string;
  genres?: string;
  decade?: number;
  rock_genre?: string;
  artist_id: string;
  main_genre?: string;
  spotify_song_id?: string;
  spotify_artist_id?: string;
}

export interface SongSection {
  sectionType: string;
  sectionNumber: number;
  chords: string[];
  fullLabel: string;
}

export interface ParsedSong extends CPMLSong {
  sections: SongSection[];
  hasStructure: boolean;
}

export interface VisualizationFilters {
  genre: string;
  decade: string;
  artistSearch: string;
  hasStructureOnly: boolean;
}