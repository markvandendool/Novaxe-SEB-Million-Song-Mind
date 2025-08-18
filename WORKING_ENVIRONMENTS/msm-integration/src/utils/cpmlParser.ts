import { CPMLSong, ParsedSong, SongSection, DatanaughtRow, Data1Song, Data3Song, UnifiedParseResult } from '../types/cpml.ts';
import { detectCSVFormat, inferKeyFromChords, mapChordsToRoman } from '../lib/utils.ts';
import { CHORD_SLOTS } from '@/constants/harmony';
import { tokenizeRomanProgression, mapRomanToSlot } from './romanMapping';

// Normalize chord notation to handle variations
const normalizeChord = (chord: string): string => {
  return chord
    .replace(/s/g, '#') // Fs -> F#
    .replace(/b/g, '♭') // Bb -> B♭
    .replace(/min/g, 'm') // Amin -> Am
    .replace(/maj/g, 'M') // Cmaj7 -> CM7
    .replace(/no3d/g, '(no3)') // Cno3d -> C(no3)
    .replace(/\//g, '/'); // Keep slash chords as is
};

// Parse structured chord progression with section tags
const parseStructuredChords = (chordsString: string): SongSection[] => {
  const sections: SongSection[] = [];
  
  // Split by section markers like <verse_1>, <chorus_2>, etc.
  const parts = chordsString.split(/<([^>]+)>/).filter(part => part.trim());
  
  let currentSection: SongSection | null = null;
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    
    if (part && !part.includes('_')) {
      // This is chord content, not a section marker
      if (currentSection) {
        const chords = part.split(/\s+/).map(normalizeChord).filter(Boolean);
        currentSection.chords.push(...chords);
      }
    } else if (part.includes('_')) {
      // This is a section marker like "verse_1"
      if (currentSection) {
        sections.push(currentSection);
      }
      
      const [sectionType, sectionNumber] = part.split('_');
      currentSection = {
        sectionType: sectionType.toLowerCase(),
        sectionNumber: parseInt(sectionNumber) || 1,
        chords: [],
        fullLabel: part
      };
    }
  }
  
  // Add the last section if it exists
  if (currentSection) {
    sections.push(currentSection);
  }
  
  // If no structured sections found, treat as flat progression
  if (sections.length === 0) {
    const chords = chordsString.split(/\s+/).map(normalizeChord).filter(Boolean);
    if (chords.length > 0) {
      sections.push({
        sectionType: 'progression',
        sectionNumber: 1,
        chords,
        fullLabel: 'progression_1'
      });
    }
  }
  
  return sections;
};

// Robust CSV parser that handles quoted fields and commas
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last field
  result.push(current.trim());
  return result;
};

// Create case-insensitive column mapping
const createColumnMapping = (headers: string[]): Map<string, number> => {
  const mapping = new Map<string, number>();
  
  headers.forEach((header, index) => {
    const normalized = header.toLowerCase().trim().replace(/['"]/g, '');
    mapping.set(normalized, index);
  });
  
  return mapping;
};

// Sanitize chord progression
const sanitizeChords = (chords: string): string => {
  return chords
    .trim()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/</g, '<') // Ensure proper angle brackets
    .replace(/>/g, '>');
};

// Parsing result interface (legacy)
export interface ParseResult {
  songs: CPMLSong[];
  totalRows: number;
  successfulRows: number;
  skippedRows: number;
  skippedReasons: string[];
}

// Parse datanaught format (vertical chord data)
const parseDatanaughtCSV = (lines: string[], parseLineMethod: (line: string) => string[]): UnifiedParseResult => {
  const headers = parseLineMethod(lines[0]);
  const columnMap = createColumnMapping(headers);
  try {
    fetch('/__log', { method: 'POST', body: JSON.stringify({ ts: Date.now(), stage: 'parseData3CSV:columns', columns: Array.from(columnMap.keys()).slice(0, 80) }), keepalive: true }).catch(() => {});
  } catch {}
  const harmonicData: DatanaughtRow[] = [];
  const skippedReasons: string[] = [];
  let successfulRows = 0;
  let skippedRows = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      const values = parseLineMethod(line);
      const row: any = {};

      headers.forEach((header, index) => {
        if (values[index] !== undefined) {
          const normalizedHeader = header.toLowerCase().trim().replace(/['"]/g, '');
          const value = values[index]?.trim().replace(/^["']|["']$/g, '');
          if (value && value !== 'NaN' && value !== '') {
            row[normalizedHeader] = value;
          }
        }
      });

      if (!row.chord || !row.percent) {
        skippedRows++;
        skippedReasons.push(`Row ${i}: Missing required fields: chord or percent`);
        continue;
      }

      harmonicData.push({
        chord: row.chord,
        percent: parseFloat(row.percent) || 0,
        root: parseFloat(row.root) || 0,
        first: parseFloat(row.first) || 0,
        second: parseFloat(row.second) || 0,
        third: parseFloat(row.third) || 0
      });

      successfulRows++;
    } catch (error) {
      skippedRows++;
      skippedReasons.push(`Row ${i}: Parse error - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return {
    format: "datanaught",
    songs: [], // Datanaught doesn't contain song data
    harmonicData,
    totalRows: lines.length - 1,
    successfulRows,
    skippedRows,
    skippedReasons
  };
};

// Parse data1 format (horizontal harmonic profile)
const parseData1CSV = (lines: string[], parseLineMethod: (line: string) => string[]): UnifiedParseResult => {
  const headers = parseLineMethod(lines[0]);
  const songs: ParsedSong[] = [];
  const skippedReasons: string[] = [];
  let successfulRows = 0;
  let skippedRows = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      const values = parseLineMethod(line);
      const row: any = {};

      headers.forEach((header, index) => {
        if (values[index] !== undefined) {
          const normalizedHeader = header.toLowerCase().trim().replace(/['"]/g, '');
          const value = values[index]?.trim().replace(/^["']|["']$/g, '');
          if (value && value !== 'NaN' && value !== '') {
            row[normalizedHeader] = value;
          }
        }
      });

      if (!row.id) {
        skippedRows++;
        skippedReasons.push(`Row ${i}: Missing required field: id`);
        continue;
      }

      // Create a minimal song with harmonic data only
      const song: ParsedSong = {
        id: row.id.toString(),
        chords: '', // No chord progression in data1
        artist_id: row.artist_id || 'unknown',
        sections: [],
        hasStructure: false
      };

      songs.push(song);
      successfulRows++;
    } catch (error) {
      skippedRows++;
      skippedReasons.push(`Row ${i}: Parse error - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return {
    format: "data1",
    songs,
    totalRows: lines.length - 1,
    successfulRows,
    skippedRows,
    skippedReasons
  };
};

// Parse data3 format (CPML + harmonic + key/roman)
const parseData3CSV = (lines: string[], parseLineMethod: (line: string) => string[]): UnifiedParseResult => {
  const headers = parseLineMethod(lines[0]);
  try {
    fetch('/__log', { method: 'POST', body: JSON.stringify({
      ts: Date.now(), stage: 'parseData3CSV:headers', headers: headers.slice(0, 60)
    }), keepalive: true }).catch(() => {});
  } catch {}
  const columnMap = createColumnMapping(headers);
  const songs: ParsedSong[] = [];
  const skippedReasons: string[] = [];
  let successfulRows = 0;
  let skippedRows = 0;

  const requiredFields = ['id', 'chords', 'artist_id'];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      const values = parseLineMethod(line);
      const row: any = {};

      headers.forEach((header, index) => {
        if (values[index] !== undefined) {
          const normalizedHeader = header.toLowerCase().trim().replace(/['"]/g, '');
          const value = values[index]?.trim().replace(/^["']|["']$/g, '');
          if (value && value !== 'NaN' && value !== '') {
            row[normalizedHeader] = value;
          }
        }
      });

      const missingFields = requiredFields.filter(field => {
        const value = row[field] || row[field.replace('_', '')] || row[field.replace('_id', 'id')];
        return !value || !value.trim();
      });

      if (missingFields.length > 0) {
        skippedRows++;
        skippedReasons.push(`Row ${i}: Missing required fields: ${missingFields.join(', ')}`);
        continue;
      }

      const chords = sanitizeChords(row.chords || '');
      let key = row.key || row.canonical_key;
      let romanNumerals = row.roman_numerals || row.romannumerals;

      // Infer key if missing (only if not already provided)
      if (!key && chords) {
        key = inferKeyFromChords(chords);
      }

      // Generate roman numerals if missing (only if not already provided)
      if (!romanNumerals && chords && key) {
        romanNumerals = mapChordsToRoman(chords, key);
      }

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
        key: row.key || row.canonical_key,
        roman_numerals: row.roman_numerals || row.romannumerals,
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

      // Capture per-slot HUV columns if present (27-slot schema) with alias support
      const huvBySlot: Record<string, string> = {};
      const canonicalSet = new Set(CHORD_SLOTS);
      const canonicalByLower: Record<string, string> = Object.fromEntries(
        CHORD_SLOTS.map(s => [s.toLowerCase(), s])
      );
      const ALIASES: Record<string, string> = {
        'iiiº': 'iiiø',
        '#iø': '#iº',
        '#iiø': '#iiº',
        'vii°': 'viiº',
        // Applied seventh aliases (lowercase keys)
        'v7': 'V(7)',
        'v(7)': 'V(7)',
        'ii7': 'II(7)',
        'ii(7)': 'II(7)',
        'iii7': 'III(7)',
        'iii(7)': 'III(7)',
        'vi7': 'VI(7)',
        'vi(7)': 'VI(7)',
        'vii7': 'VII(7)',
        'vii(7)': 'VII(7)'
      };
      (headers || []).forEach((raw) => {
        const headerRaw = (raw || '').trim();
        const headerLower = headerRaw.toLowerCase();
        let canon: string | undefined = undefined;
        if (canonicalSet.has(headerRaw)) {
          canon = headerRaw; // exact match preserves case (avoids I/i collision)
        } else {
          canon = ALIASES[headerLower] || canonicalByLower[headerLower];
        }
        if (!canon) return;
        const val = row[headerLower];
        if (val !== undefined && val !== '') {
          huvBySlot[canon] = val;
        }
      });
      // Fallback: build vectors from per-metric columns like "i_percent", "i_root", ... if present
      if (Object.keys(huvBySlot).length === 0) {
        CHORD_SLOTS.forEach(slot => {
          const sLower = slot.toLowerCase();
          const p = parseFloat(row[`${sLower}_percent`]);
          const r = parseFloat(row[`${sLower}_root`]);
          const f = parseFloat(row[`${sLower}_first`]);
          const s = parseFloat(row[`${sLower}_second`]);
          const t = parseFloat(row[`${sLower}_third`]);
          const parts = [p, r, f, s, t].map(v => (typeof v === 'number' && !isNaN(v) ? v : 0));
          if (parts.some(v => v > 0)) {
            huvBySlot[slot] = parts.join(',');
          }
        });
      }
      (song as any).huvBySlot = huvBySlot;
      try {
        if (i <= 5) {
          fetch('/__log', { method: 'POST', body: JSON.stringify({
            ts: Date.now(), stage: 'parseData3CSV:row', index: i, id: song.id, key: song.key,
            hasHUV: Object.keys(huvBySlot).length > 0, romanSample: (song.roman_numerals || '').slice(0, 120)
          }), keepalive: true }).catch(() => {});
        }
      } catch {}

      song.hasStructure = song.sections.some(section => section.sectionType !== 'progression');
      songs.push(song);
      successfulRows++;

    } catch (error) {
      skippedRows++;
      skippedReasons.push(`Row ${i}: Parse error - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Generate harmonic data for chart visualization
  const harmonicData = convertData3ToHarmonicData(songs);
  try {
    fetch('/__log', { method: 'POST', body: JSON.stringify({ ts: Date.now(), stage: 'parseData3CSV:done', songs: songs.length, rows: harmonicData.length }), keepalive: true }).catch(() => {});
  } catch {}
  
  return {
    format: "data3",
    songs,
    harmonicData,
    totalRows: lines.length - 1,
    successfulRows,
    skippedRows,
    skippedReasons
  };
};

// Main unified parser that detects format and dispatches to appropriate parser
export const parseUnifiedCSVData = (csvContent: string): UnifiedParseResult => {
  const content = (csvContent || '').replace(/\uFEFF/g, ''); // strip UTF-8 BOM if present
  const lines = content.trim().split('\n').filter(line => line.trim());
  try {
    fetch('/__log', { method: 'POST', body: JSON.stringify({
      ts: Date.now(), stage: 'parseUnifiedCSVData:start', firstLineSample: lines[0]?.slice(0, 200)
    }), keepalive: true }).catch(() => {});
  } catch {}
  
  if (lines.length < 2) {
    throw new Error('CSV must have header and at least one data row');
  }

  // Determine parsing method
  let headers: string[];
  let parseLineMethod: (line: string) => string[];
  
  if (lines[0].includes(',')) {
    headers = parseCSVLine(lines[0]);
    parseLineMethod = parseCSVLine;
  } else {
    headers = lines[0].split('\t').map(h => h.trim());
    parseLineMethod = (line: string) => line.split('\t');
  }

  // Detect format
  const format = detectCSVFormat(headers);
  
  switch (format) {
    case "datanaught":
      return parseDatanaughtCSV(lines, parseLineMethod);
    case "data1":
      return parseData1CSV(lines, parseLineMethod);
    case "data2":
      // Use existing CPML parser but wrap result
      const cpmlResult = parseCSVData(csvContent);
      return {
        format: "data2",
        songs: enrichSongsWithStructure(cpmlResult.songs),
        totalRows: cpmlResult.totalRows,
        successfulRows: cpmlResult.successfulRows,
        skippedRows: cpmlResult.skippedRows,
        skippedReasons: cpmlResult.skippedReasons
      };
    case "data3":
      return parseData3CSV(lines, parseLineMethod);
    default:
      throw new Error(`Unknown format detected. This file format could not be recognized. Please ensure it matches one of the 4 supported MusicViz formats: CPML (Data2), Harmonic Profile Vertical (Datanaught), Harmonic Profile Horizontal (Data1), or Combined (Data3).`);
  }
};

// Legacy function for backward compatibility
export const parseCSVData = (csvContent: string): ParseResult => {
  const lines = csvContent.trim().split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    throw new Error('CSV must have header and at least one data row');
  }
  
  // Try comma-separated first, then tab-separated
  let headers: string[];
  let parseLineMethod: (line: string) => string[];
  
  if (lines[0].includes(',')) {
    headers = parseCSVLine(lines[0]);
    parseLineMethod = parseCSVLine;
  } else {
    headers = lines[0].split('\t').map(h => h.trim());
    parseLineMethod = (line: string) => line.split('\t');
  }
  
  const columnMap = createColumnMapping(headers);
  const songs: CPMLSong[] = [];
  const skippedReasons: string[] = [];
  let successfulRows = 0;
  let skippedRows = 0;
  
  // Required fields (case-insensitive)
  const requiredFields = ['id', 'chords', 'artist_id'];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines
    
    try {
      const values = parseLineMethod(line);
      const row: any = {};
      
      // Map values to normalized column names
      headers.forEach((header, index) => {
        if (values[index] !== undefined) {
          const normalizedHeader = header.toLowerCase().trim().replace(/['"]/g, '');
          const value = values[index]?.trim().replace(/^["']|["']$/g, ''); // Remove quotes
          
          if (value && value !== 'NaN' && value !== '') {
            row[normalizedHeader] = value;
          }
        }
      });
      
      // Check required fields
      const missingFields = requiredFields.filter(field => {
        const value = row[field] || row[field.replace('_', '')] || row[field.replace('_id', 'id')];
        return !value || !value.trim();
      });
      
      if (missingFields.length > 0) {
        skippedRows++;
        skippedReasons.push(`Row ${i}: Missing required fields: ${missingFields.join(', ')}`);
        continue;
      }
      
      // Create CPMLSong object with flexible field mapping
      const song: CPMLSong = {
        id: (row.id || row.song_id || '').toString(),
        chords: sanitizeChords(row.chords || ''),
        artist_id: row.artist_id || row.artistid || row.artist || '',
        release_date: row.release_date || row.releasedate || row.date,
        genres: row.genres || row.genre || row.main_genre || row.maingenre,
        decade: row.decade ? parseFloat(row.decade) : undefined,
        rock_genre: row.rock_genre || row.rockgenre || row.subgenre,
        main_genre: row.main_genre || row.maingenre || row.genre,
        spotify_song_id: row.spotify_song_id || row.spotifysongid,
        spotify_artist_id: row.spotify_artist_id || row.spotifyartistid
      };
      
      songs.push(song);
      successfulRows++;
      
    } catch (error) {
      skippedRows++;
      skippedReasons.push(`Row ${i}: Parse error - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  return {
    songs,
    totalRows: lines.length - 1, // Exclude header
    successfulRows,
    skippedRows,
    skippedReasons
  };
};

// Enrich songs with parsed structure
export const enrichSongsWithStructure = (songs: CPMLSong[]): ParsedSong[] => {
  return songs.map(song => {
    const sections = parseStructuredChords(song.chords);
    const hasStructure = sections.some(section => section.sectionType !== 'progression');
    
    return {
      ...song,
      sections,
      hasStructure
    };
  });
};

// Convert data3 songs to harmonic chart data
export const convertData3ToHarmonicData = (songs: ParsedSong[]): DatanaughtRow[] => {
  const chordStats: { [chord: string]: { total: number; root: number; first: number; second: number; third: number; } } = {};
  let totalChords = 0;
  
  // Initialize all possible chords with correct harmonic profile labels
  const allChords = [
    'I','ii','iii','IV','V','vi','viiø',
    'I7','iiiø','II(7)','#ivø','III(7)','#vº','VI(7)','#iº','VII(7)','#iiº','V(7)','viiº',
    'i','iiø','bIII','iv','v','bVI','bVII',
    'Other'
  ];
  
  allChords.forEach(chord => {
    chordStats[chord] = { total: 0, root: 0, first: 0, second: 0, third: 0 };
  });
  
  // Prefer per-slot HUV vectors if present; else fall back to roman parsing
  songs.forEach(song => {
    const huvBySlot = (song as any).huvBySlot as Record<string, string> | undefined;
    if (huvBySlot && Object.keys(huvBySlot).length > 0) {
      Object.entries(huvBySlot).forEach(([slot, vecStr]) => {
        if (!vecStr) return;
        const parts = vecStr.split(',').map(s => parseFloat(s.trim()) || 0);
        const [total, root=0, first=0, second=0, third=0] = parts;
        if (total && chordStats[slot] !== undefined) {
          chordStats[slot].total += total;
          chordStats[slot].root += root;
          chordStats[slot].first += first;
          chordStats[slot].second += second;
          chordStats[slot].third += third;
          totalChords += total;
        }
      });
      return; // done with this song
    }

    // Fallback: derive from roman numerals text
    const romanProgression = song.roman_numerals || song.chords || '';
    if (!romanProgression) return;

    // Strip section tags like <verse_1> and normalize whitespace
    const cleanedProgression = romanProgression.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

    // Tokenize and map using comprehensive alias mapping
    const tokens = tokenizeRomanProgression(cleanedProgression);

    tokens.forEach(tok => {
      const slot = mapRomanToSlot(tok, song.key);
      if (slot && chordStats[slot] !== undefined) {
        chordStats[slot].total++;
        totalChords++;
        const inv = estimateRomanNumeralInversions(slot);
        chordStats[slot].root += inv.root;
        chordStats[slot].first += inv.first;
        chordStats[slot].second += inv.second;
        chordStats[slot].third += inv.third;
      } else if (chordStats['Other']) {
        chordStats['Other'].total++;
        totalChords++;
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

// Estimate inversions based on Roman numeral type
const estimateRomanNumeralInversions = (romanNumeral: string): { root: number; first: number; second: number; third: number } => {
  // Major chords (I, IV, V) - mostly root position
  if (['I', 'IV', 'V', 'III', 'VI', 'VII'].includes(romanNumeral)) {
    return { root: 0.8, first: 0.15, second: 0.05, third: 0.0 };
  }
  // Minor chords (ii, iii, vi) - some first inversion
  else if (['ii', 'iii', 'vi'].includes(romanNumeral)) {
    return { root: 0.7, first: 0.25, second: 0.05, third: 0.0 };
  }
  // Minor key chords (i, iv, v) - similar to minor
  else if (['i', 'iv', 'v'].includes(romanNumeral)) {
    return { root: 0.7, first: 0.25, second: 0.05, third: 0.0 };
  }
  // Flat major chords (bIII, bVI, bVII) - mostly root
  else if (['bIII', 'bVI', 'bVII'].includes(romanNumeral)) {
    return { root: 0.8, first: 0.15, second: 0.05, third: 0.0 };
  }
  // Half-diminished chords (iiø, viiø) - more varied
  else if (['iiø', 'viiø'].includes(romanNumeral)) {
    return { root: 0.6, first: 0.3, second: 0.1, third: 0.0 };
  }
  // Fully diminished chords (viiº) - more varied
  else if (['viiº'].includes(romanNumeral)) {
    return { root: 0.6, first: 0.3, second: 0.1, third: 0.0 };
  }
  // Seventh chords - more inversions
  else if (romanNumeral.includes('7') || romanNumeral.includes('(7)')) {
    return { root: 0.6, first: 0.25, second: 0.1, third: 0.05 };
  }
  // Non-diatonic chords - mostly root
  else if (['I7', 'II(7)', 'III(7)', 'VI(7)', 'VII(7)', 'V(7)'].includes(romanNumeral)) {
    return { root: 0.8, first: 0.15, second: 0.05, third: 0.0 };
  }
  // Default distribution
  else {
    return { root: 0.75, first: 0.2, second: 0.05, third: 0.0 };
  }
};