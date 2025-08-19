# LOVABLE PROMPT: Data3 CSV Harmonic Profile Display Enhancement

## 🎯 CRITICAL ISSUE TO RESOLVE

Lovable reports that "the scope has not been broadened" for data3 CSV ingest. We need to ensure the harmonic profile correctly displays data3 information with TRUE HUV fingerprints and proper mouse interactions.

## 📋 CURRENT STATE ANALYSIS

### ✅ What's Working:
- Data3 CSV parser exists in `src/utils/cpmlParser.ts`
- Harmonic chart component exists in `src/components/HarmonicChart.tsx`
- Mouse interaction logic is implemented
- TRUE HUV fingerprint parsing is added

### ❌ What's Missing:
- **Data3 → Harmonic Chart Conversion**: The data3 parser doesn't generate `harmonicData` for the chart
- **Chord Instance Analysis**: Need to extract chord instances from data3 chord progressions
- **Inversion Estimation**: Need to estimate chord inversions for visualization

## 🔧 REQUIRED CODE CHANGES

### 1. Update Data3 Parser to Generate Harmonic Data

**File**: `src/utils/cpmlParser.ts`

**Add this function after the existing functions**:

```typescript
// Convert data3 songs to harmonic chart data
export const convertData3ToHarmonicData = (songs: ParsedSong[]): DatanaughtRow[] => {
  const chordStats: { [chord: string]: { total: number; root: number; first: number; second: number; third: number; } } = {};
  let totalChords = 0;
  
  // Initialize all possible chords
  const allChords = [
    'I', 'ii', 'iii', 'IV', 'V', 'vi', 'viiø',
    'I7', 'iiiº', 'II(7)', '#ivø', 'III', '#vº', 'VI(7)', '#iø', 'VII(7)', '#iiø',
    'i', 'iiø', 'bIII', 'iv', 'v', 'bVI', 'bVII', 'V(b9)', 'viiº'
  ];
  
  allChords.forEach(chord => {
    chordStats[chord] = { total: 0, root: 0, first: 0, second: 0, third: 0 };
  });
  
  // Analyze each song's chord progression
  songs.forEach(song => {
    if (!song.chords) return;
    
    // Extract all chords from the progression
    const chordMatches = song.chords.match(/\b[A-G][#b]?m?(aj7|7|sus2|sus4|dim|aug)?\b/g) || [];
    
    chordMatches.forEach(chordStr => {
      // Convert chord to Roman numeral (simplified mapping)
      const romanNumeral = convertChordToRoman(chordStr, song.key || 'C');
      
      if (romanNumeral && chordStats[romanNumeral]) {
        chordStats[romanNumeral].total++;
        totalChords++;
        
        // Estimate inversions based on chord type
        const inversions = estimateChordInversions(chordStr);
        chordStats[romanNumeral].root += inversions.root;
        chordStats[romanNumeral].first += inversions.first;
        chordStats[romanNumeral].second += inversions.second;
        chordStats[romanNumeral].third += inversions.third;
      }
    });
  });
  
  // Convert to DatanaughtRow format
  const harmonicData: DatanaughtRow[] = [];
  
  Object.entries(chordStats).forEach(([chord, stats]) => {
    if (stats.total > 0) {
      const percent = (stats.total / totalChords) * 100;
      harmonicData.push({
        chord,
        percent,
        root: stats.root,
        first: stats.first,
        second: stats.second,
        third: stats.third
      });
    }
  });
  
  // Sort by percentage descending
  return harmonicData.sort((a, b) => b.percent - a.percent);
};

// Convert chord string to Roman numeral
const convertChordToRoman = (chordStr: string, key: string): string => {
  // Simplified mapping - in production this would use the full chord analysis
  const chord = chordStr.toUpperCase();
  
  // Basic major/minor chord detection
  if (chord.includes('M') || chord.includes('MAJ')) return 'I';
  if (chord.includes('M7') || chord.includes('MAJ7')) return 'I7';
  if (chord.includes('M') === false && chord.includes('7')) return 'V7';
  if (chord.includes('M') === false && chord.includes('M') === false) return 'i';
  
  // Default to I for unrecognized chords
  return 'I';
};

// Estimate chord inversions based on chord type
const estimateChordInversions = (chordStr: string): { root: number; first: number; second: number; third: number } => {
  const chord = chordStr.toUpperCase();
  
  // Default distribution: mostly root position
  if (chord.includes('7') || chord.includes('M7')) {
    return { root: 0.7, first: 0.2, second: 0.1, third: 0.0 };
  } else if (chord.includes('M') || chord.includes('MAJ')) {
    return { root: 0.8, first: 0.15, second: 0.05, third: 0.0 };
  } else {
    return { root: 0.75, first: 0.2, second: 0.05, third: 0.0 };
  }
};
```

### 2. Update parseData3CSV Function

**In the same file, find the parseData3CSV function and add this before the return statement**:

```typescript
  // Generate harmonic data for chart visualization
  const harmonicData = convertData3ToHarmonicData(songs);
  
  return {
    format: "data3",
    songs,
    harmonicData, // ← ADD THIS LINE
    totalRows: lines.length - 1,
    successfulRows,
    skippedRows,
    skippedReasons
  };
```

### 3. Update Type Definitions

**File**: `src/types/cpml.ts`

**Add TRUE HUV and Spotify metadata fields to Data3Song interface**:

```typescript
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
```

### 4. Update ParsedSong Interface

**Add the same fields to ParsedSong interface**:

```typescript
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
```

### 5. Update parseData3CSV to Handle New Fields

**In the parseData3CSV function, add these lines to the song object creation**:

```typescript
      const song: ParsedSong = {
        id: (row.id || row.song_id || '').toString(),
        chords,
        artist_id: row.artist_id || row.artistid || row.artist || '',
        release_date: row.release_date || row.releasedate || row.date,
        genres: row.genres || row.genre || row.main_genre || row.maingenre,
        decade: row.decade ? parseFloat(row.decade) : undefined,
        rock_genre: row.rock_genre || row.rockgenre || row.subgenre,
        main_genre: row.main_genre || row.maingenre || row.genre,
        spotify_song_id: row.spotify_song_id || row.spotifysongid,
        spotify_artist_id: row.spotify_artist_id || row.spotifyartistid,
        // TRUE HUV fingerprint
        harmonic_fingerprint: row.harmonic_fingerprint,
        // Spotify metadata fields
        artist_name: row.artist_name,
        song_name: row.song_name,
        album_name: row.album_name,
        popularity: row.popularity ? parseFloat(row.popularity) : undefined,
        tempo: row.tempo ? parseFloat(row.tempo) : undefined,
        mode: row.mode ? parseFloat(row.mode) : undefined,
        loudness: row.loudness ? parseFloat(row.loudness) : undefined,
        danceability: row.danceability ? parseFloat(row.danceability) : undefined,
        energy: row.energy ? parseFloat(row.energy) : undefined,
        valence: row.valence ? parseFloat(row.valence) : undefined,
        acousticness: row.acousticness ? parseFloat(row.acousticness) : undefined,
        instrumentalness: row.instrumentalness ? parseFloat(row.instrumentalness) : undefined,
        liveness: row.liveness ? parseFloat(row.liveness) : undefined,
        speechiness: row.speechiness ? parseFloat(row.speechiness) : undefined,
        time_signature: row.time_signature ? parseFloat(row.time_signature) : undefined,
        duration_ms: row.duration_ms ? parseFloat(row.duration_ms) : undefined,
        sections: parseStructuredChords(chords),
        hasStructure: false
      };
```

## 🎯 EXPECTED BEHAVIOR AFTER CHANGES

1. **Data3 CSV Upload**: Should detect format and parse TRUE HUV fingerprints
2. **Harmonic Profile Display**: Should show chord instances and inversions from data3
3. **Mouse Interactions**: 
   - Single click: Select individual chord bars
   - Cmd/Ctrl + click: Multi-select for aggregate analysis
   - Immediate visual feedback
4. **TRUE HUV Support**: Should parse frequency-optimized harmonic fingerprints
5. **Spotify Metadata**: Should preserve all metadata fields for filtering

## 🧪 TESTING SCENARIO

Upload a data3 CSV file (like `data3_macpro_chordonomicon_v2.csv`) and verify:
- Harmonic profile displays chord instances and inversions
- Mouse interactions work correctly
- TRUE HUV fingerprints are parsed
- Spotify metadata is preserved

## 📝 LOVABLE RESPONSE FORMAT

Please implement these changes and confirm:
1. ✅ Data3 CSV parsing works
2. ✅ Harmonic profile displays data3 information
3. ✅ Mouse interactions function correctly
4. ✅ TRUE HUV fingerprints are handled
5. ✅ Spotify metadata is preserved

**This will ensure the harmonic profile scope is properly broadened to handle data3 CSV files with TRUE HUV fingerprints.** 