// Datanaught format (vertical - each row is a chord)
export interface DatanaughtRow {
  chord: string;
  percent: number;
  root: number;
  first: number;
  second: number;
  third: number;
  total?: number;
}

// Data1 format (horizontal harmonic profile - each row is a song)
export interface Data1Song {
  id: string;
  [key: string]: string | number; // Dynamic harmonic columns like I_percent, I_root, etc.
}

// Data2 format (CPML - each row is a song with chord progression)
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

// Data3 format (CPML + harmonic profile + key/roman + TRUE HUV + Spotify metadata)
export interface Data3Song extends CPMLSong {
  key?: string;
  roman_numerals?: string;
  harmonic_fingerprint?: string; // TRUE HUV fingerprint
  // Spotify metadata fields
  artist_name?: string;
  song_name?: string;
  album_name?: string;
  popularity?: number;
  tempo?: number;
  mode?: number;
  loudness?: number;
  danceability?: number;
  energy?: number;
  valence?: number;
  acousticness?: number;
  instrumentalness?: number;
  liveness?: number;
  speechiness?: number;
  time_signature?: number;
  duration_ms?: number;
  [key: string]: string | number | undefined; // Dynamic harmonic columns
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
  key?: string;
  roman_numerals?: string;
  harmonic_fingerprint?: string; // TRUE HUV fingerprint
  // Spotify metadata fields
  artist_name?: string;
  song_name?: string;
  album_name?: string;
  popularity?: number;
  tempo?: number;
  mode?: number;
  loudness?: number;
  danceability?: number;
  energy?: number;
  valence?: number;
  acousticness?: number;
  instrumentalness?: number;
  liveness?: number;
  speechiness?: number;
  time_signature?: number;
  duration_ms?: number;
}

export interface VisualizationFilters {
  genre: string;
  decade: string;
  artistSearch: string;
  hasStructureOnly: boolean;
}

// Unified parse result for all formats
export interface UnifiedParseResult {
  format: "datanaught" | "data1" | "data2" | "data3";
  songs: ParsedSong[];
  harmonicData?: DatanaughtRow[];
  totalRows: number;
  successfulRows: number;
  skippedRows: number;
  skippedReasons: string[];
}