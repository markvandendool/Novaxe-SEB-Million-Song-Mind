import React, { useState, useCallback, useEffect, useDeferredValue, useMemo } from 'react';
import { useGlobalKey } from '@/state/globalKeyStore';
import { sendDevLog } from '@/lib/devlog';

// 🔥 IMMEDIATE DEBUG LOG
console.log('🚀 MillionSongMind.tsx loading at', new Date().toISOString());

// 🔥 INITIALIZE EXHAUSTIVE LOGGING
import { exhaustiveLogger } from '@/utils/exhaustiveLogger';
if (typeof window !== 'undefined') {
  exhaustiveLogger.clear();
}

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HarmonicChart } from '@/components/HarmonicChart';
import { MusicVizFileUploader } from '@/components/MusicVizFileUploader';
import { UnifiedVisualizationDashboard } from '@/components/UnifiedVisualizationDashboard';
import { DebugPanel, debugLogger } from '@/components/DebugPanel';
import { parseUnifiedCSVData, convertData3ToHarmonicData } from '@/utils/cpmlParser';
import { UnifiedParseResult } from '@/types/cpml';
import { useToast } from '@/hooks/use-toast';
import { Music, Database, Upload, FileText, ArrowUpDown, Search, BookOpen } from 'lucide-react';
import Fuse from 'fuse.js';
import { FixedSizeList as List } from 'react-window';
import debounce from 'lodash.debounce';
import { SongDetailPanel } from '@/components/SongDetailPanel';
import { OnboardingSystem } from '@/components/OnboardingSystem';
import { sendChord, sendScale, sendProgression } from '@/components/NovaxeBridgeSender';
import BraidTonal from '@/components/braid/BraidTonal';
import BraidTorus3D from '@/components/braid/BraidTorus3D';
import { BraidChordSequence } from '@/components/BraidChord';
import { CHORD_SLOTS, CHORD_GROUPS } from '@/constants/harmony';
import { useSEO } from '@/hooks/useSEO';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { noteToRoman, romanToNote, createChordMappingForKey } from '@/utils/chordMapping';
import { mapRomanToHarmonicSlot } from '@/utils/braidHarmonicMapping';
import { getBraidToHarmonicMapping, getHarmonicToBraidMapping } from '@/utils/definiteBraidMapping';
import { GlobalKeySelector } from '@/components/GlobalKeySelector';
import { BraidTextSwitcher } from '@/components/BraidTextSwitcher';
import { useBraidTextSwitching } from '@/hooks/useBraidTextSwitching';
import { chordAudioManager } from '@/utils/ChordAudioManager';
// Empty state data - all zeros
const EMPTY_HARMONIC_DATA = [
  { chord: "I", percent: 0, root: 0, first: 0, second: 0, third: 0, section: "Major" },
  { chord: "ii", percent: 0, root: 0, first: 0, second: 0, third: 0, section: "Major" },
  { chord: "iii", percent: 0, root: 0, first: 0, second: 0, third: 0, section: "Major" },
  { chord: "IV", percent: 0, root: 0, first: 0, second: 0, third: 0, section: "Major" },
  { chord: "V", percent: 0, root: 0, first: 0, second: 0, third: 0, section: "Major" },
  { chord: "vi", percent: 0, root: 0, first: 0, second: 0, third: 0, section: "Major" },
  { chord: "viiø", percent: 0, root: 0, first: 0, second: 0, third: 0, section: "Major" },
  { chord: "I7", percent: 0, root: 0, first: 0, second: 0, third: 0, section: "Applied" },
  { chord: "iiiº", percent: 0, root: 0, first: 0, second: 0, third: 0, section: "Applied" },
  { chord: "II(7)", percent: 0, root: 0, first: 0, second: 0, third: 0, section: "Applied" },
  { chord: "#ivø", percent: 0, root: 0, first: 0, second: 0, third: 0, section: "Applied" },
  { chord: "III", percent: 0, root: 0, first: 0, second: 0, third: 0, section: "Applied" },
  { chord: "#vº", percent: 0, root: 0, first: 0, second: 0, third: 0, section: "Applied" },
  { chord: "VI(7)", percent: 0, root: 0, first: 0, second: 0, third: 0, section: "Applied" },
  { chord: "#iø", percent: 0, root: 0, first: 0, second: 0, third: 0, section: "Applied" },
  { chord: "VII(7)", percent: 0, root: 0, first: 0, second: 0, third: 0, section: "Applied" },
  { chord: "#iiø", percent: 0, root: 0, first: 0, second: 0, third: 0, section: "Applied" },
  { chord: "i", percent: 0, root: 0, first: 0, second: 0, third: 0, section: "Minor" },
  { chord: "iiø", percent: 0, root: 0, first: 0, second: 0, third: 0, section: "Minor" },
  { chord: "bIII", percent: 0, root: 0, first: 0, second: 0, third: 0, section: "Minor" },
  { chord: "iv", percent: 0, root: 0, first: 0, second: 0, third: 0, section: "Minor" },
  { chord: "v", percent: 0, root: 0, first: 0, second: 0, third: 0, section: "Minor" },
  { chord: "bVI", percent: 0, root: 0, first: 0, second: 0, third: 0, section: "Minor" },
  { chord: "bVII", percent: 0, root: 0, first: 0, second: 0, third: 0, section: "Minor" },
  { chord: "V(b9)", percent: 0, root: 0, first: 0, second: 0, third: 0, section: "Minor" },
  { chord: "viiº", percent: 0, root: 0, first: 0, second: 0, third: 0, section: "Minor" },
  { chord: "Other", percent: 0, root: 0, first: 0, second: 0, third: 0, section: "Other" }
];

// Verbose logging utility
const VERBOSE_LOGGING = true;
const log = (message: string, data?: any) => {
  if (VERBOSE_LOGGING) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}]  MILLION_SONG_MIND: ${message}`;
    console.log(logMessage, data ? data : '');

    if (typeof window !== 'undefined') {
      if (!window.millionSongMindLogs) {
        window.millionSongMindLogs = [];
      }
      window.millionSongMindLogs.push({ timestamp, message, data });
    }
  }
};

const MillionSongMind = () => {
  console.log('🎵 MillionSongMind component is mounting...');
  console.log('🎵 Component render starting');

  useSEO({
    title: 'MillionSongMind — Harmonic Oracle',
    description: 'Explore MillionSongMind harmonic analysis and data3 visualizations',
    canonicalPath: '/million-song-mind',
  });
  // Separate storage from rendering
  const [songBank, setSongBank] = useState<any[]>([]); // All uploaded songs stored here
  const [parseResult, setParseResult] = useState<UnifiedParseResult | null>(null);
  const [displayedSongs, setDisplayedSongs] = useState<any[]>([]); // Only filtered songs for rendering
  const [isLoading, setIsLoading] = useState(false);
  const [debugPanelOpen, setDebugPanelOpen] = useState(false);

  // Onboarding and educational system
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [debugLogs, setDebugLogs] = useState(debugLogger.getLogs());
  const [selectedSongs, setSelectedSongs] = useState<Set<string>>(new Set());
  const [selectedSong, setSelectedSong] = useState<any>(null);
  const [selectedChords, setSelectedChords] = useState<Set<string>>(new Set());
  const [chordQueryMode, setChordQueryMode] = useState<'only' | 'possess'>('possess');
  const [sortColumn, setSortColumn] = useState<string>('');
  const [is3D, setIs3D] = useState(false);
  const [braidZoom, setBraidZoom] = useState<number>(3.0);
  const braidScrollRef = React.useRef<HTMLDivElement>(null);
  const { setTonality, setScoreTonality, focusedKey } = useGlobalKey();
  const { mode: braidTextMode, displayRoman, setMode: setBraidTextMode } = useBraidTextSwitching();

  // Initialize audio manager
  React.useEffect(() => {
    chordAudioManager.initialize().catch(console.warn);
  }, []);

  // Check for first-time users and show onboarding
  React.useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('msm:tutorial-completed');
    if (!hasSeenTutorial) {
      setIsFirstTimeUser(true);
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('msm:tutorial-completed', 'true');
    setShowOnboarding(false);
    setIsFirstTimeUser(false);
  };

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
  };

  const startTutorial = () => {
    setShowOnboarding(true);
  };

  // Example: emit a heartbeat-ish chord when focusedKey changes
  React.useEffect(() => {
    if (!focusedKey) return;
    try {
      sendScale({ root: focusedKey, type: 'key', notes: [], intervals: [] });
    } catch { }
  }, [focusedKey]);

  // Auto-ingest pending upload forwarded from Index (/)
  React.useEffect(() => {
    try {
      const pending = sessionStorage.getItem('msm:pendingUpload');
      if (pending) {
        setDebugPanelOpen(true);
        debugLogger.info('Auto-processing pending upload forwarded from /', {});
        try {
          const result = parseUnifiedCSVData(pending);
          setParseResult(result);
          toast({ title: 'File Loaded (Auto)', description: `Format: ${result.format.toUpperCase()} • ${result.successfulRows} rows processed` });
        } catch (e) {
          debugLogger.error('Auto-processing failed', { details: e instanceof Error ? e.message : String(e) });
          toast({ title: 'Auto-processing failed', description: e instanceof Error ? e.message : 'Unknown error', variant: 'destructive' });
        } finally {
          sessionStorage.removeItem('msm:pendingUpload');
        }
      }
    } catch { }
  }, []);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Search state
  const [songSearch, setSongSearch] = useState('');
  const [artistSearch, setArtistSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedDecade, setSelectedDecade] = useState('');
  const [selectedKey, setSelectedKey] = useState('');
  const [selectedStructure, setSelectedStructure] = useState('');
  const [yearRangeStart, setYearRangeStart] = useState('');
  const [yearRangeEnd, setYearRangeEnd] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('');
  const [alphabetFilterMode, setAlphabetFilterMode] = useState<'song' | 'artist'>('song'); // Toggle between song/artist filtering
  const [filteredSongs, setFilteredSongs] = useState<any[]>([]);

  const { toast } = useToast();

  // Deferred search values for performance
  const deferredSongSearch = useDeferredValue(songSearch);
  const deferredArtistSearch = useDeferredValue(artistSearch);

  // Fuse.js search indices for instant search
  const fuseOptions = {
    keys: [
      { name: 'spotify_song_id', weight: 0.7 },
      { name: 'id', weight: 0.7 },
      { name: 'spotify_artist_id', weight: 0.6 },
      { name: 'artist_id', weight: 0.6 },
      { name: 'genres', weight: 0.3 }
    ],
    threshold: 0.4,
    ignoreLocation: true,
    includeScore: true,
  };

  const songFuse = useMemo(() => {
    if (songBank.length === 0) return null;
    return new Fuse(songBank, fuseOptions);
  }, [songBank]);

  // Optimized search function using Fuse.js
  const performOptimizedSearch = useCallback((searchTerm: string, artistTerm: string) => {
    if (songBank.length === 0) {
      setDisplayedSongs([]);
      setFilteredSongs([]);
      return;
    }

    let results = songBank;

    // Use Fuse.js for fast fuzzy search if search terms exist
    if (searchTerm || artistTerm) {
      if (songFuse) {
        const combinedQuery = [searchTerm, artistTerm].filter(Boolean).join(' ');
        const fuseResults = songFuse.search(combinedQuery);
        results = fuseResults.map(result => result.item);
      }
    }

    // Apply additional filters to search results
    let filtered = results.filter(song => {
      // Genre filter
      if (selectedGenre && selectedGenre !== '' && selectedGenre !== 'All Genres') {
        if (!song.genres || !song.genres.toLowerCase().includes(selectedGenre.toLowerCase())) {
          return false;
        }
      }

      // Decade filter
      if (selectedDecade && selectedDecade !== '' && selectedDecade !== 'All Decades') {
        const decade = parseInt(selectedDecade.replace('s', ''));
        if (!song.decade || Math.floor(song.decade / 10) * 10 !== decade) {
          return false;
        }
      }

      // Key filter
      if (selectedKey && selectedKey !== '' && selectedKey !== 'All Keys') {
        if (!song.key || !song.key.includes(selectedKey.split(' ')[0])) {
          return false;
        }
      }

      // Structure filter
      if (selectedStructure && selectedStructure !== '' && selectedStructure !== 'All Structures') {
        if (selectedStructure === 'Has Sections' && !song.hasStructure) return false;
        if (selectedStructure === 'Simple Progression' && song.hasStructure) return false;
      }

      // Year range filter
      if (yearRangeStart && song.decade && song.decade < parseInt(yearRangeStart)) return false;
      if (yearRangeEnd && song.decade && song.decade > parseInt(yearRangeEnd)) return false;

      // Letter filter - FIXED: Check both song and artist names properly
      if (selectedLetter && selectedLetter !== '') {
        const songName = song.spotify_song_id || song.id || '';
        const artistName = song.spotify_artist_id || song.artist_id || '';

        const songStartsWithLetter = songName.charAt(0).toUpperCase() === selectedLetter;
        const artistStartsWithLetter = artistName.charAt(0).toUpperCase() === selectedLetter;

        // Filter based on mode: song or artist names
        if (alphabetFilterMode === 'song' && !songStartsWithLetter) return false;
        if (alphabetFilterMode === 'artist' && !artistStartsWithLetter) return false;
      }

      // Chord filter - NEW: Filter songs based on selected chords
      if (selectedChords.size > 0) {
        const songRoman = song.roman_numerals || '';
        const tokens = (songRoman.match(/\b(?:I{1,3}|IV|V|VI{0,2}|VII|i{1,3}|iv|v|vi{0,2}|vii)(?:[#b])?(?:º|ø)?(?:\([b#]?\d+\))?/g) || []);
        const selected = Array.from(selectedChords);
        const hasAll = selected.every(ch => tokens.includes(ch));
        const hasAny = selected.some(ch => tokens.includes(ch));
        const ok = chordQueryMode === 'only' ? hasAll : hasAny;
        if (!ok) return false;
      }

      return true;
    });

    // Limit results to prevent performance issues (max 100 for instant display)
    if (filtered.length > 100) {
      filtered = filtered.slice(0, 100);
      toast({
        title: "🎯 Results Limited",
        description: `Showing first 100 of ${filtered.length} matches. Refine search for more specific results.`,
      });
    }

    setFilteredSongs(filtered);
    setDisplayedSongs(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [songBank, songFuse, selectedGenre, selectedDecade, selectedKey, selectedStructure, yearRangeStart, yearRangeEnd, selectedLetter, alphabetFilterMode, selectedChords, toast]);

  // Debounced search function to prevent excessive filtering
  const debouncedSearch = useMemo(
    () => debounce((searchTerm: string) => {
      // Split search term to handle both song and artist search
      const terms = searchTerm.toLowerCase().split(' ');
      performOptimizedSearch(searchTerm, searchTerm); // Pass same term for both song and artist search
    }, 300),
    [performOptimizedSearch]
  );

  // Handle chord selection with DEFINITIVE user-specified mappings
  const handleChordSelect = useCallback((chord: string, isSelected: boolean) => {
    exhaustiveLogger.func('MillionSongMind', 'handleChordSelect ENTRY', { chord, isSelected });
    console.log(`🚨 DEBUG handleChordSelect: chord="${chord}", isSelected=${isSelected}`);
    console.log(`🚨 DEBUG CHORD_SLOTS.includes("${chord}"):`, CHORD_SLOTS.includes(chord));

    // Determine if this is a braid chord or harmonic slot
    let chordsToToggle: string[] = [];

    // Check if this is a harmonic slot being clicked (from harmonic chart)
    if (CHORD_SLOTS.includes(chord)) {
      console.log(`� DEBUG HARMONIC SLOT CLICKED: "${chord}"`);
      // Find the SINGLE braid chord that maps to this harmonic slot
      const braidChords = getHarmonicToBraidMapping(chord);
      console.log(`� DEBUG getHarmonicToBraidMapping("${chord}") returned:`, braidChords);

      // STRICT: Only light up the corresponding braid chord, not the harmonic slot
      chordsToToggle = braidChords;
      console.log(`🚨 DEBUG chordsToToggle for harmonic:`, chordsToToggle);
    } else {
      console.log(`🚨 DEBUG BRAID CHORD CLICKED: "${chord}"`);
      // This is a braid chord being clicked
      const harmonicSlot = getBraidToHarmonicMapping(chord);
      console.log(`🚨 DEBUG getBraidToHarmonicMapping("${chord}") returned:`, harmonicSlot);

      if (harmonicSlot !== "Other") {
        // STRICT: Only light up the corresponding harmonic slot, not the braid chord
        chordsToToggle = [harmonicSlot];
        console.log(`🚨 DEBUG chordsToToggle for braid:`, chordsToToggle);
      } else {
        // This chord maps to "Other" - just select itself
        chordsToToggle = [chord];
        console.log(`� DEBUG chordsToToggle for Other:`, chordsToToggle);
      }
    }

    console.log(`🚨 DEBUG FINAL chordsToToggle:`, chordsToToggle);

    log(`📋 CHORDS TO TOGGLE:`, chordsToToggle);

    // Update selection state
    setSelectedChords(prev => {
      exhaustiveLogger.state('MillionSongMind', 'setSelectedChords ENTRY', { previousSelection: Array.from(prev), isSelected, chordsToToggle });
      const newSelection = new Set(prev);
      log(` PREVIOUS SELECTION:`, Array.from(prev));

      if (isSelected) {
        chordsToToggle.forEach(c => newSelection.add(c));
        log(`✅ ADDING CHORDS:`, chordsToToggle);
      } else {
        chordsToToggle.forEach(c => newSelection.delete(c));
        log(`❌ REMOVING CHORDS:`, chordsToToggle);
      }

      const finalSelection = Array.from(newSelection);
      log(` FINAL SELECTION:`, finalSelection);
      return newSelection;
    });

    // Trigger search to filter songs based on chord selection
    log(` TRIGGERING SEARCH: deferredSongSearch="${deferredSongSearch}"`);
    setTimeout(() => {
      performOptimizedSearch(deferredSongSearch, deferredSongSearch);
    }, 100);
  }, [performOptimizedSearch, deferredSongSearch, selectedSong?.key, selectedKey]);

  // Store parse result data to song bank when uploaded
  useEffect(() => {
    if (parseResult?.songs) {
      setSongBank(parseResult.songs);
      debugLogger.info(`Stored ${parseResult.songs.length} songs in song bank`);
    } else {
      setSongBank([]);
    }
  }, [parseResult]);

  // Subscribe to debug logs
  useEffect(() => {
    const unsubscribe = debugLogger.subscribe(setDebugLogs);
    return unsubscribe;
  }, []);

  // Trigger search when deferred search values change
  useEffect(() => {
    debouncedSearch(deferredSongSearch);
  }, [deferredSongSearch, debouncedSearch]);

  // Apply filters when non-search criteria change
  useEffect(() => {
    performOptimizedSearch(deferredSongSearch, deferredSongSearch);
  }, [selectedGenre, selectedDecade, selectedKey, selectedStructure, yearRangeStart, yearRangeEnd, selectedLetter, alphabetFilterMode, performOptimizedSearch]);

  // Clear all filters and reset display
  const clearAllFilters = useCallback(() => {
    setSongSearch('');
    setSelectedGenre('');
    setSelectedDecade('');
    setSelectedKey('');
    setSelectedStructure('');
    setYearRangeStart('');
    setYearRangeEnd('');
    setSelectedLetter('');
    setDisplayedSongs([]); // Clear display when filters are cleared
  }, []);

  // Handle song selection with multi-select support
  const handleSongSelect = useCallback((songId: string, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      // Ctrl/Cmd + click for multi-select
      setSelectedSongs(prev => {
        const newSet = new Set(prev);
        if (newSet.has(songId)) {
          newSet.delete(songId);
        } else {
          newSet.add(songId);
        }
        return newSet;
      });
    } else if (event.shiftKey && selectedSongs.size > 0) {
      // Shift + click for range selection
      const lastSelectedId = Array.from(selectedSongs)[selectedSongs.size - 1];
      const currentIndex = filteredSongs.findIndex(song => (song.spotify_song_id || song.id) === songId);
      const lastIndex = filteredSongs.findIndex(song => (song.spotify_song_id || song.id) === lastSelectedId);

      if (currentIndex !== -1 && lastIndex !== -1) {
        const start = Math.min(currentIndex, lastIndex);
        const end = Math.max(currentIndex, lastIndex);
        const rangeIds = filteredSongs.slice(start, end + 1).map(song => song.spotify_song_id || song.id);
        setSelectedSongs(prev => new Set([...Array.from(prev), ...rangeIds]));
      }
    } else {
      // Single selection - INSTANT DISPLAY
      setSelectedSongs(new Set([songId]));
      const song = filteredSongs.find(s => (s.spotify_song_id || s.id) === songId);
      setSelectedSong(song || null);
    }
  }, [filteredSongs, selectedSongs]);

  // Handle sorting
  const handleSort = useCallback((column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  }, [sortColumn, sortDirection]);

  // Pagination for performance
  const [currentPage, setCurrentPage] = useState(1);
  const [songsPerPage] = useState(50); // Limit to 50 songs per page

  // Sort filtered songs
  const sortedFilteredSongs = React.useMemo(() => {
    if (!sortColumn) return filteredSongs;

    return [...filteredSongs].sort((a, b) => {
      let aValue = '';
      let bValue = '';

      switch (sortColumn) {
        case 'spotify_song_id':
          aValue = a.spotify_song_id || a.id || '';
          bValue = b.spotify_song_id || b.id || '';
          break;
        case 'spotify_artist_id':
          aValue = a.spotify_artist_id || a.artist_id || '';
          bValue = b.spotify_artist_id || b.artist_id || '';
          break;
        case 'decade':
          aValue = String(a.decade || 0);
          bValue = String(b.decade || 0);
          break;
        default:
          return 0;
      }

      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }, [filteredSongs, sortColumn, sortDirection]);

  // Paginated songs for performance
  const paginatedSongs = React.useMemo(() => {
    const startIndex = (currentPage - 1) * songsPerPage;
    const endIndex = startIndex + songsPerPage;
    return sortedFilteredSongs.slice(startIndex, endIndex);
  }, [sortedFilteredSongs, currentPage, songsPerPage]);

  const totalPages = Math.ceil(sortedFilteredSongs.length / songsPerPage);

  // Get unique values for autocomplete
  const getUniqueGenres = useCallback(() => {
    if (!parseResult?.songs) return [];
    const genres = new Set<string>();
    parseResult.songs.forEach(song => {
      if (song.genres) {
        song.genres.split(',').forEach(genre => genres.add(genre.trim()));
      }
    });
    return Array.from(genres).sort();
  }, [parseResult]);

  const getUniqueKeys = useCallback(() => {
    if (!parseResult?.songs) return [];
    const keys = new Set<string>();
    parseResult.songs.forEach(song => {
      if (song.key) keys.add(song.key);
    });
    return Array.from(keys).sort();
  }, [parseResult]);

  // Mock data for testing all formats
  const loadMockData = useCallback(() => {
    const mockFormats = ['datanaught', 'data1', 'data2', 'data3'];
    const currentMockIndex = parseResult ?
      (mockFormats.indexOf(parseResult.format) + 1) % mockFormats.length : 0;
    const format = mockFormats[currentMockIndex] as any;

    debugLogger.info(`Loading mock data for format: ${format}`);

    switch (format) {
      case 'datanaught':
        setParseResult({
          format: 'datanaught',
          songs: [],
          harmonicData: [
            { chord: "I", percent: 17, root: 11, first: 3, second: 0, third: 3 },
            { chord: "V", percent: 36, root: 27, first: 5, second: 3, third: 1 },
            { chord: "vi", percent: 15, root: 10, first: 3, second: 2, third: 0 },
            { chord: "IV", percent: 12, root: 8, first: 2, second: 2, third: 0 },
          ],
          totalRows: 4,
          successfulRows: 4,
          skippedRows: 0,
          skippedReasons: []
        });
        break;

      case 'data1':
        setParseResult({
          format: 'data1',
          songs: [
            {
              id: 'mock1',
              chords: 'I,V,vi,IV',
              artist_id: 'artist1',
              sections: [],
              hasStructure: false
            }
          ],
          totalRows: 1,
          successfulRows: 1,
          skippedRows: 0,
          skippedReasons: []
        });
        break;

      case 'data2':
        setParseResult({
          format: 'data2',
          songs: [
            {
              id: 'mock1',
              chords: '<verse_1>C,Am,F,G</verse_1><chorus_1>F,C,G,Am</chorus_1>',
              artist_id: 'artist1',
              genres: 'pop,rock',
              decade: 2020,
              sections: [
                { sectionType: 'verse', sectionNumber: 1, chords: ['C', 'Am', 'F', 'G'], fullLabel: 'verse_1' },
                { sectionType: 'chorus', sectionNumber: 1, chords: ['F', 'C', 'G', 'Am'], fullLabel: 'chorus_1' }
              ],
              hasStructure: true
            },
            {
              id: 'mock2',
              chords: '<verse_1>Dm,Bb,F,C</verse_1><bridge_1>Am,F,C,G</bridge_1>',
              artist_id: 'artist2',
              genres: 'folk,indie',
              decade: 2010,
              sections: [
                { sectionType: 'verse', sectionNumber: 1, chords: ['Dm', 'Bb', 'F', 'C'], fullLabel: 'verse_1' },
                { sectionType: 'bridge', sectionNumber: 1, chords: ['Am', 'F', 'C', 'G'], fullLabel: 'bridge_1' }
              ],
              hasStructure: true
            }
          ],
          totalRows: 2,
          successfulRows: 2,
          skippedRows: 0,
          skippedReasons: []
        });
        break;

      case 'data3':
        setParseResult({
          format: 'data3',
          songs: [
            {
              id: 'mock1',
              chords: '<verse_1>C,Am,F,G</verse_1><chorus_1>F,C,G,Am</chorus_1>',
              artist_id: 'artist1',
              key: 'C',
              roman_numerals: '<verse_1>I,vi,IV,V</verse_1><chorus_1>IV,I,V,vi</chorus_1>',
              genres: 'pop,rock',
              decade: 2020,
              sections: [
                { sectionType: 'verse', sectionNumber: 1, chords: ['C', 'Am', 'F', 'G'], fullLabel: 'verse_1' },
                { sectionType: 'chorus', sectionNumber: 1, chords: ['F', 'C', 'G', 'Am'], fullLabel: 'chorus_1' }
              ],
              hasStructure: true
            }
          ],
          harmonicData: [
            { chord: "I", percent: 25, root: 20, first: 3, second: 1, third: 1 },
            { chord: "vi", percent: 25, root: 20, first: 3, second: 1, third: 1 },
            { chord: "IV", percent: 25, root: 20, first: 3, second: 1, third: 1 },
            { chord: "V", percent: 25, root: 20, first: 3, second: 1, third: 1 },
          ],
          totalRows: 1,
          successfulRows: 1,
          skippedRows: 0,
          skippedReasons: []
        });
        break;
    }

    debugLogger.success(`Mock data loaded successfully`, { format });

    toast({
      title: "Mock Data Loaded",
      description: `Testing ${format.toUpperCase()} format visualization`,
    });
  }, [parseResult, toast]);

  // Enhanced file upload handler with filename-based metadata for datanaught
  const handleFileUpload = useCallback(async (content: string, filename?: string) => {
    setIsLoading(true);
    setDebugPanelOpen(true);

    debugLogger.info('Starting file upload processing', { filename });

    try {
      const result = parseUnifiedCSVData(content);

      // Extract artist and song from filename for datanaught files
      if (result.format === 'datanaught' && filename) {
        const nameWithoutExt = filename.replace(/\.csv$/i, '');
        const [artist, songTitle] = nameWithoutExt.split('_').map(s => s.trim());

        if (artist && songTitle) {
          // Create a mock song entry for datanaught files
          const datanaughtSong = {
            id: `datanaught_${Date.now()}`,
            spotify_song_id: songTitle,
            spotify_artist_id: artist,
            artist_id: artist,
            chords: '', // Datanaught doesn't have chord progressions
            sections: [],
            hasStructure: false,
            genres: 'Unknown',
            decade: new Date().getFullYear()
          };

          result.songs = [datanaughtSong];

          debugLogger.info(`Extracted metadata from filename: ${filename} -> ${artist} - ${songTitle}`);
        }
      }

      debugLogger.success('File parsed successfully', {
        format: result.format,
        rowCount: result.totalRows,
        skippedRows: result.skippedRows,
        details: `Successfully parsed ${result.successfulRows} of ${result.totalRows} rows`
      });

      setParseResult(result);

      sendDevLog({ ts: Date.now(), stage: 'file:parsed', format: result.format, successfulRows: result.successfulRows, totalRows: result.totalRows });
      toast({
        title: "File Loaded Successfully",
        description: `Format: ${result.format.toUpperCase()} • ${result.successfulRows} rows processed`,
      });

    } catch (error) {
      debugLogger.error('File parsing failed', {
        details: error instanceof Error ? error.message : 'Unknown error'
      });

      toast({
        title: "File Processing Error",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Multi-file upload handler for datanaught format
  const handleMultiFileUpload = useCallback(async (files: { content: string; filename: string }[]) => {
    setIsLoading(true);
    setDebugPanelOpen(true);

    debugLogger.info('Starting multi-file upload processing', { details: `Processing ${files.length} files` });

    try {
      const allResults: UnifiedParseResult[] = [];
      let totalSongs = 0;

      // Process each file
      for (const { content, filename } of files) {
        const result = parseUnifiedCSVData(content);

        // Extract artist and song from filename for datanaught files
        if (result.format === 'datanaught' && filename) {
          const nameWithoutExt = filename.replace(/\.csv$/i, '');
          const [artist, songTitle] = nameWithoutExt.split('_').map(s => s.trim());

          if (artist && songTitle) {
            const datanaughtSong = {
              id: `datanaught_${Date.now()}_${totalSongs}`,
              spotify_song_id: songTitle,
              spotify_artist_id: artist,
              artist_id: artist,
              chords: '',
              sections: [],
              hasStructure: false,
              genres: 'Unknown',
              decade: new Date().getFullYear()
            };

            result.songs = [datanaughtSong];
            totalSongs++;
          }
        }

        allResults.push(result);
      }

      // Aggregate harmonic data from all files
      const aggregatedHarmonicData = EMPTY_HARMONIC_DATA.map(emptyChord => {
        const aggregated = { ...emptyChord };
        let totalPercent = 0;
        let totalRoot = 0;
        let totalFirst = 0;
        let totalSecond = 0;
        let totalThird = 0;

        // Sum up data from all files for this chord
        allResults.forEach(result => {
          if (result.harmonicData) {
            const chordData = result.harmonicData.find(d => d.chord === emptyChord.chord);
            if (chordData) {
              totalPercent += chordData.percent || 0;
              totalRoot += chordData.root || 0;
              totalFirst += chordData.first || 0;
              totalSecond += chordData.second || 0;
              totalThird += chordData.third || 0;
            }
          }
        });

        // Average the percentages and inversion data
        const fileCount = allResults.length;
        aggregated.percent = totalPercent / fileCount;
        aggregated.root = totalRoot / fileCount;
        aggregated.first = totalFirst / fileCount;
        aggregated.second = totalSecond / fileCount;
        aggregated.third = totalThird / fileCount;

        return aggregated;
      });

      // Create aggregated result
      const aggregatedResult: UnifiedParseResult = {
        format: 'datanaught',
        songs: allResults.flatMap(r => r.songs),
        harmonicData: aggregatedHarmonicData,
        totalRows: allResults.reduce((sum, r) => sum + r.totalRows, 0),
        successfulRows: allResults.reduce((sum, r) => sum + r.successfulRows, 0),
        skippedRows: allResults.reduce((sum, r) => sum + r.skippedRows, 0),
        skippedReasons: allResults.flatMap(r => r.skippedReasons || [])
      };

      debugLogger.success('Multi-file aggregation completed', { details: `Aggregated data from ${files.length} files with ${totalSongs} songs` });

      setParseResult(aggregatedResult);

      toast({
        title: "Multiple Files Loaded",
        description: `Aggregated ${files.length} datanaught files with ${totalSongs} songs`,
      });

    } catch (error) {
      debugLogger.error('Multi-file processing failed', {
        details: error instanceof Error ? error.message : 'Unknown error'
      });

      toast({
        title: "Multi-File Processing Error",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Reset to empty state
  const resetToEmpty = useCallback(() => {
    setParseResult(null);
    setDisplayedSongs([]);
    setFilteredSongs([]);
    setSelectedSongs(new Set());
    setSelectedChords(new Set());
    setSelectedSong(null);
    debugLogger.clear();
    toast({
      title: "Reset Complete",
      description: "All data and selections cleared - ready for new upload",
      duration: 2200,
    });
  }, [toast]);

  const resetSelections = useCallback(() => {
    setSelectedSongs(new Set());
    setSelectedChords(new Set());
    toast({ title: "Selections Cleared", description: "Chord and song selections reset." });
  }, [toast]);

  console.log('🎵 About to render MillionSongMind UI');

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Premium Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border" style={{ boxShadow: 'var(--shadow-professional)' }}>
        <div className="max-w-[120rem] mx-auto px-4 md:px-8 py-6 md:py-8">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <h1 className="text-3xl md:text-5xl  font-bold text-foreground tracking-[0.12em] md:tracking-[0.15em] leading-none">
                MILLION SONG MIND <span className="text-primary font-black text-4xl md:text-6xl">V1.0</span>
              </h1>
              <p className="text-muted-foreground  text-xs md:text-sm tracking-[0.08em] md:tracking-[0.1em] uppercase">
                Professional Music Analysis Tool • Industrial Scale Ready • Forensic Grade Precision
              </p>
            </div>

            <div className="flex items-center space-x-6">
              {parseResult && (
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-2xl  font-bold text-primary">
                      {parseResult.successfulRows.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground  uppercase tracking-wider">
                      of {parseResult.totalRows.toLocaleString()} songs
                    </div>
                    <div className="text-xs text-accent ">
                      {((parseResult.successfulRows / parseResult.totalRows) * 100).toFixed(1)}% of database
                    </div>
                  </div>
                  <Badge variant="secondary" className=" text-xs">
                    {parseResult.format.toUpperCase()}
                  </Badge>
                </div>
              )}

              <div className="flex items-center gap-3 md:gap-4">
                <GlobalKeySelector compact />

                <div className="flex flex-col space-y-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={startTutorial}
                    className="text-xs tracking-wider h-8 px-3 touch-target"
                  >
                    <BookOpen className="w-3 h-3 mr-1" />
                    TUTORIAL
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDebugPanelOpen(!debugPanelOpen)}
                    className="text-xs tracking-wider h-6 py-0 px-2"
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    DEBUG
                  </Button>
                </div>

                <Button
                  variant="secondary"
                  onClick={resetToEmpty}
                  disabled={isLoading}
                  className="text-xs tracking-wider bg-gradient-accent touch-target"
                >
                  ⚡ RESET
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Global key is now provided via GlobalKeyProvider and updated by local selections */}

      <main className="container-mobile space-y-8 md:space-y-12">
        {/* Welcome message for first-time users */}
        {isFirstTimeUser && (
          <div className="learning-section">
            <h3 className="text-responsive-lg font-semibold mb-2">🎵 Welcome to Million Song Mind <span className="font-black text-primary">V1.0</span>!</h3>
            <p className="text-responsive-sm text-muted-foreground mb-4">
              This is your professional music analysis tool. Click the <strong>TUTORIAL</strong> button
              in the header to get started with a guided tour.
            </p>
          </div>
        )}

        {/* Section 1: Harmonic Profile - TOP PRIORITY */}
        <section className="space-y-6 md:space-y-8 relative">
          <Card style={{ boxShadow: 'var(--shadow-card)' }} className="harmonic-chart">
            <CardContent className="pt-3 pb-3 relative">
              <h2 className="text-responsive-xl tracking-[0.2em] text-foreground mb-3">HARMONIC PROFILE</h2>

              {/* Welcome overlay for harmonic chart - disappears on any interaction */}
              {isFirstTimeUser && (
                <div
                  className="absolute inset-0 z-10 bg-black/30 backdrop-blur-sm cursor-pointer rounded-lg"
                  onClick={() => setIsFirstTimeUser(false)}
                  onTouchStart={() => setIsFirstTimeUser(false)}
                >
                  <div className="absolute top-4 left-4 right-4 bg-primary/90 text-primary-foreground px-4 py-3 rounded-lg border border-primary">
                    <div className="text-sm font-medium">
                      🎵 <strong>Harmonic Profile</strong> shows chord usage across your selected songs.
                      Click any chord to select it for analysis.
                    </div>
                    <div className="text-xs mt-1 opacity-75">Touch anywhere to continue</div>
                  </div>
                </div>
              )}

              {/* Dynamic harmonic profile based on SELECTED SONGS */}
              <HarmonicChart key={focusedKey}
                data={(() => {
                  const snapshot = {
                    selectedSongsSize: selectedSongs.size,
                    selectedSongsArray: Array.from(selectedSongs),
                    filteredSongsLength: filteredSongs.length
                  };
                  console.log('🔄 Harmonic Profile Update:', snapshot);
                  sendDevLog({ ts: Date.now(), stage: 'chart:update', ...snapshot });

                  // Use SELECTED SONGS for harmonic profile
                  if (selectedSongs.size > 0) {
                    // Get the actual selected song objects
                    const selectedSongObjects = filteredSongs.filter(song =>
                      selectedSongs.has(song.spotify_song_id || song.id)
                    );

                    console.log('🎵 Selected Song Objects:', selectedSongObjects);

                    if (selectedSongObjects.length > 0) {
                      // Convert selected songs to harmonic data
                      // Debug surface: show whether HUV columns exist for first selected song
                      try {
                        const first = selectedSongObjects[0] as any;
                        const snapshot = {
                          id: first?.id || first?.spotify_song_id,
                          hasHUV: !!(first && first.huvBySlot && Object.keys(first.huvBySlot).length),
                          romanSample: (first?.roman_numerals || '').slice(0, 120),
                          key: first?.key
                        };
                        console.log('🔍 First selected song snapshot:', snapshot);
                        fetch('/__log', { method: 'POST', body: JSON.stringify({ ts: Date.now(), stage: 'selected:snapshot', ...snapshot }), keepalive: true }).catch(() => { });
                      } catch { }

                      const selectedHarmonicData = convertData3ToHarmonicData(selectedSongObjects);
                      console.log('📊 Selected Harmonic Data (first 3):', selectedHarmonicData.slice(0, 3));
                      if (selectedHarmonicData.length > 0) {
                        try { fetch('/__log', { method: 'POST', body: JSON.stringify({ ts: Date.now(), stage: 'selected:rows', count: selectedHarmonicData.length }), keepalive: true }).catch(() => { }); } catch { }
                        return selectedHarmonicData.map(item => ({ ...item, section: 'Major' }));
                      }
                      // Safety fallback: if selection produced no rows, show global aggregate
                      if (parseResult?.harmonicData && parseResult.harmonicData.length > 0) {
                        try { fetch('/__log', { method: 'POST', body: JSON.stringify({ ts: Date.now(), stage: 'selected:fallback:parsed' }), keepalive: true }).catch(() => { }); } catch { }
                        console.log('⚠️ Selection produced no rows; falling back to parsed aggregate');
                        return parseResult.harmonicData.map(item => ({ ...item, section: 'Major' }));
                      }
                      return EMPTY_HARMONIC_DATA;
                    }
                  }

                  // When no songs selected: show aggregate harmonic data
                  // Prefer parsed aggregate; else compute from filtered songs
                  if (parseResult?.harmonicData && parseResult.harmonicData.length > 0) {
                    console.log('📊 Using parsed aggregate harmonicData');
                    try { fetch('/__log', { method: 'POST', body: JSON.stringify({ ts: Date.now(), stage: 'chart:aggregate:parsed', rows: parseResult.harmonicData.length }), keepalive: true }).catch(() => { }); } catch { }
                    return parseResult.harmonicData.map(item => ({ ...item, section: 'Major' }));
                  }
                  if (filteredSongs.length > 0) {
                    console.log('📊 Computing aggregate from filteredSongs');
                    try { fetch('/__log', { method: 'POST', body: JSON.stringify({ ts: Date.now(), stage: 'chart:aggregate:filtered', songs: filteredSongs.length }), keepalive: true }).catch(() => { }); } catch { }
                    const agg = convertData3ToHarmonicData(filteredSongs);
                    return agg.length > 0 ? agg.map(item => ({ ...item, section: 'Major' })) : EMPTY_HARMONIC_DATA;
                  }
                  console.log('📭 No data available, showing empty harmonic profile');
                  return EMPTY_HARMONIC_DATA;
                })()}
                fileCount={1}
                totalSongs={filteredSongs.length || parseResult?.successfulRows || 0}
                onChordSelect={handleChordSelect}
                selectedChords={selectedChords}
              />

              {/* Small reset button in bottom-right of chart card */}
              <div className="absolute right-3 bottom-3">
                <Button size="sm" variant="outline" className=" text-xs" onClick={resetSelections}>
                  reset selection
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 1.5: Braid Visualization (Educational) */}
        <section className="space-y-6 relative">
          <Card className="braid-visualization">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-responsive-lg tracking-[0.2em] text-foreground">BRAID PATTERN</CardTitle>
                  <p className="text-responsive-sm text-muted-foreground mt-1">
                    Geometric visualization of harmonic relationships
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <BraidTextSwitcher
                    mode={braidTextMode}
                    onModeChange={setBraidTextMode}
                    compact
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">3D</span>
                    <Switch checked={is3D} onCheckedChange={setIs3D} />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 relative">

              {/* Welcome overlay for braid - disappears on any interaction */}
              {isFirstTimeUser && (
                <div
                  className="absolute inset-0 z-10 bg-black/30 backdrop-blur-sm cursor-pointer"
                  onClick={() => setIsFirstTimeUser(false)}
                  onTouchStart={() => setIsFirstTimeUser(false)}
                >
                  <div className="absolute top-4 left-4 right-4 bg-accent/90 text-accent-foreground px-4 py-3 rounded-lg border border-accent">
                    <div className="text-sm font-medium">
                      💫 The <strong>Braid</strong> shows harmonic relationships as a geometric pattern.
                      Each chord is positioned by its harmonic distance from others.
                    </div>
                    <div className="text-xs mt-1 opacity-75">Touch anywhere to continue</div>
                  </div>
                </div>
              )}

              {/* Zoom controls - touch friendly */}
              {!is3D && (
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 bg-card border border-border rounded-lg p-4 mb-4">
                  <span className="text-sm font-medium text-foreground">Zoom Level</span>
                  <div className="flex-1 min-w-0">
                    <Slider
                      value={[braidZoom]}
                      min={0.8}
                      max={3.5}
                      step={0.01}
                      onValueChange={(v) => setBraidZoom(Math.min(3.5, Math.max(0.8, v[0] ?? braidZoom)))}
                      onValueCommit={(v) => setBraidZoom(Math.max(0.8, Math.min(3.5, Math.round((v[0] ?? braidZoom) / 0.25) * 0.25)))}
                      className="touch-target"
                    />
                  </div>
                  <span className="text-sm font-bold w-16 text-center bg-primary/10 rounded px-2 py-1">
                    {Math.round(braidZoom * 100)}%
                  </span>
                </div>
              )}

              <div className="relative bg-background/50 rounded-lg overflow-hidden" style={{ width: '100%', minHeight: '300px', height: '51vh' }}>
                {is3D ? (
                  <div style={{ width: '100%', height: '100%' }}>
                    <BraidTorus3D focusKey={focusedKey} />
                  </div>
                ) : (
                  <div ref={braidScrollRef} style={{ width: '100%', height: '100%', overflowY: 'auto', maxHeight: '51vh' }}>
                    <BraidTonal
                      focusKey={focusedKey}
                      onChordSelect={handleChordSelect}
                      selectedChords={selectedChords}
                      zoom={braidZoom}
                      onZoomChange={setBraidZoom}
                      scrollContainerRef={braidScrollRef}
                      displayRoman={displayRoman}
                      chordUsage={useMemo(() => {
                        if (!parseResult?.harmonicData) return {};
                        const harmonicUsage: Record<string, number> = {};
                        parseResult.harmonicData.forEach(item => {
                          harmonicUsage[item.chord] = item.percent;
                        });
                        return harmonicUsage;
                      }, [parseResult?.harmonicData])}
                      key={`braid-${focusedKey}-${braidTextMode}`}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 2: Combined Song Search */}
        <section className="space-y-6">
          <Card className="bg-card/80 border-border backdrop-blur-sm" style={{ boxShadow: 'var(--shadow-professional)' }}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl  font-bold text-foreground tracking-[0.2em] uppercase">
                    Song Search
                  </CardTitle>
                  <p className="text-muted-foreground  text-sm tracking-wide mt-1">
                    Professional Music Analysis • Educational Interface
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-3 mb-2">
                    <div className="text-2xl  font-bold text-primary">
                      {filteredSongs.length.toLocaleString()}
                    </div>
                    {filteredSongs.length > 0 && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          const allSongIds = filteredSongs.map(song => song.spotify_song_id || song.id);
                          setSelectedSongs(new Set(allSongIds));
                          toast({
                            title: "Songs Selected",
                            description: `Selected ${filteredSongs.length} songs for harmonic analysis.`
                          });
                        }}
                        className=" text-xs tracking-wide bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        Select {filteredSongs.length}
                      </Button>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground  uppercase tracking-wider">
                    of {parseResult?.successfulRows?.toLocaleString() || '0'} songs
                  </div>
                  <div className="text-xs text-accent ">
                    {parseResult ? ((filteredSongs.length / parseResult.successfulRows) * 100).toFixed(1) : '0.0'}% filtered
                  </div>
                  {selectedSongs.size > 0 && (
                    <div className="text-xs text-primary  mt-1">
                      {selectedSongs.size} selected
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Unified Search Bar - Removed redundant search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search songs, artists, or albums..."
                  value={songSearch}
                  onChange={(e) => setSongSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-background/50 border border-border rounded-lg text-foreground placeholder-muted-foreground  focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>

              <div className="flex items-center justify-between mb-6">
                <div className="text-sm  text-muted-foreground uppercase tracking-wider">
                  Advanced Filters
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className=" text-xs tracking-wide text-muted-foreground hover:text-foreground"
                >
                  Clear All
                </Button>
              </div>

              {/* Advanced Filters - Now Always Visible */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-3">
                <div className="space-y-2">
                  <label className="text-xs  uppercase tracking-wider text-muted-foreground">Genre</label>
                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="w-full p-3 bg-background/50 border border-border rounded-lg text-foreground  text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">All Genres</option>
                    {getUniqueGenres().map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs  uppercase tracking-wider text-muted-foreground">Decade</label>
                  <select
                    value={selectedDecade}
                    onChange={(e) => setSelectedDecade(e.target.value)}
                    className="w-full p-3 bg-background/50 border border-border rounded-lg text-foreground  text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">All Decades</option>
                    <option value="2020">2020s</option>
                    <option value="2010">2010s</option>
                    <option value="2000">2000s</option>
                    <option value="1990">1990s</option>
                    <option value="1980">1980s</option>
                    <option value="1970">1970s</option>
                    <option value="1960">1960s</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs  uppercase tracking-wider text-muted-foreground">Key</label>
                  <select
                    value={selectedKey}
                    onChange={(e) => setSelectedKey(e.target.value)}
                    className="w-full p-3 bg-background/50 border border-border rounded-lg text-foreground  text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">All Keys</option>
                    {getUniqueKeys().map(key => (
                      <option key={key} value={key}>{key}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs  uppercase tracking-wider text-muted-foreground">Year Range</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="From"
                      value={yearRangeStart}
                      onChange={(e) => setYearRangeStart(e.target.value)}
                      className="w-full p-3 bg-background/50 border border-border rounded-lg text-foreground  text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <input
                      type="number"
                      placeholder="To"
                      value={yearRangeEnd}
                      onChange={(e) => setYearRangeEnd(e.target.value)}
                      className="w-full p-3 bg-background/50 border border-border rounded-lg text-foreground  text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs  uppercase tracking-wider text-muted-foreground">Structure</label>
                  <select
                    value={selectedStructure}
                    onChange={(e) => setSelectedStructure(e.target.value)}
                    className="w-full p-3 bg-background/50 border border-border rounded-lg text-foreground  text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">All Structures</option>
                    <option value="Has Sections">Has Sections</option>
                    <option value="Simple Progression">Simple Progression</option>
                    <option value="Complex Arrangement">Complex Arrangement</option>
                  </select>
                </div>
              </div>

              {/* Chord Query Mode */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <span className="text-sm  text-muted-foreground uppercase tracking-wider">Chord Query</span>
                <Button variant={chordQueryMode === 'possess' ? 'default' : 'outline'} size="sm" className=" text-xs" onClick={() => setChordQueryMode('possess')}>Possess</Button>
                <Button variant={chordQueryMode === 'only' ? 'default' : 'outline'} size="sm" className=" text-xs" onClick={() => setChordQueryMode('only')}>Only</Button>
              </div>
              {/* Alphabet Filter Mode Toggle */}
              <div className="flex items-center justify-center gap-4 mb-4">
                <span className="text-sm  text-muted-foreground uppercase tracking-wider">
                  Browse by first letter:
                </span>
                <div className="flex gap-2">
                  <Button
                    variant={alphabetFilterMode === 'song' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAlphabetFilterMode('song')}
                    className=" text-xs"
                  >
                    Song
                  </Button>
                  <Button
                    variant={alphabetFilterMode === 'artist' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAlphabetFilterMode('artist')}
                    className=" text-xs"
                  >
                    Artist
                  </Button>
                </div>
              </div>

              {/* Alphabetical Filter */}
              <div className="flex flex-wrap gap-2 justify-center">
                {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map((letter) => (
                  <Button
                    key={letter}
                    variant={letter === selectedLetter ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedLetter(selectedLetter === letter ? '' : letter)}
                    className={`w-10 h-10 p-0  text-sm ${letter === selectedLetter ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                      }`}
                  >
                    {letter}
                  </Button>
                ))}
              </div>

              {/* Song Table */}
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <div className="min-w-[900px] grid grid-cols-[32px,1.2fr,1fr,80px,2fr,2fr,64px] gap-4 py-3 text-xs md:text-sm  border-b border-border/30 uppercase tracking-[0.08em] md:tracking-[0.1em] text-muted-foreground font-bold">
                    <div className="w-8"></div>
                    <div className="cursor-pointer hover:text-foreground transition-colors flex items-center gap-1" onClick={() => handleSort('spotify_song_id')}>
                      SONG
                      {sortColumn === 'spotify_song_id' && <ArrowUpDown className="w-3 h-3" />}
                    </div>
                    <div className="cursor-pointer hover:text-foreground transition-colors flex items-center gap-1" onClick={() => handleSort('spotify_artist_id')}>
                      ARTIST
                      {sortColumn === 'spotify_artist_id' && <ArrowUpDown className="w-3 h-3" />}
                    </div>
                    <div className="cursor-pointer hover:text-foreground transition-colors flex items-center gap-1" onClick={() => handleSort('key')}>
                      KEY
                      {sortColumn === 'key' && <ArrowUpDown className="w-3 h-3" />}
                    </div>
                    <div>CHORDS</div>
                    <div>CHORDS</div>
                    <div>PLAY</div>
                  </div>

                  <ScrollArea className="h-80">
                    {filteredSongs.length > 0 ? (
                      paginatedSongs.map((song, idx) => (
                        <div
                          key={song.spotify_song_id || song.id}
                          className={`min-w-[900px] grid grid-cols-[32px,1.2fr,1fr,80px,2fr,2fr,64px] gap-4 py-3 text-xs md:text-sm  border-b border-border/30 hover:bg-accent/30 transition-colors cursor-pointer ${selectedSongs.has(song.spotify_song_id || song.id) ? 'bg-primary/10' : ''
                            }`}
                          onClick={(e) => handleSongSelect(song.spotify_song_id || song.id, e)}
                        >
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedSongs.has(song.spotify_song_id || song.id)}
                              onChange={() => { }}
                              className="w-4 h-4 accent-primary"
                            />
                          </div>
                          <div className="text-foreground font-medium truncate" title={song.spotify_song_id || `Song ${idx + 1}`}>
                            {song.spotify_song_id || `Song ${idx + 1}`}
                          </div>
                          <div className="text-muted-foreground truncate" title={song.spotify_artist_id || 'Unknown Artist'}>
                            {song.spotify_artist_id || 'Unknown Artist'}
                          </div>
                          <div className="text-muted-foreground" title={song.key || 'Unknown'}>{song.key || 'Unknown'}</div>
                          <div className="text-accent  text-xs truncate" title={song.chords ? song.chords : 'No chords'}>
                            {song.chords ? song.chords : 'No chords'}
                          </div>
                          <div className="text-accent  text-xs truncate" title={song.roman_numerals || 'No roman numerals'}>
                            {song.roman_numerals ? song.roman_numerals : 'No roman numerals'}
                          </div>
                          <div className="text-accent  text-xs">
                            {song.chords ? song.chords.substring(0, 20) + '...' : 'No chords'}
                          </div>
                          <div>
                            <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                              ▶
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : songBank.length > 0 ? (
                      <div className="text-center py-12">
                        <div className="text-2xl  font-bold text-muted-foreground/50 tracking-[0.4em] mb-4">
                          NO MATCHES
                        </div>
                        <p className="text-muted-foreground  text-sm tracking-wide mb-4">
                          No songs match your current filters from {songBank.length.toLocaleString()} stored songs.
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearAllFilters}
                          className="mt-4  text-xs"
                        >
                          Clear All Filters
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-4xl  font-bold text-muted-foreground/20 tracking-[0.4em] mb-4">
                          NO DATA
                        </div>
                        <p className="text-muted-foreground  text-sm tracking-wide">
                          Upload song structure data files to begin analysis
                        </p>
                      </div>
                    )}
                  </ScrollArea>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 px-4 py-2 bg-muted/20 rounded-lg">
                    <div className="flex items-center gap-4">
                      <span className="text-sm  text-muted-foreground">
                        Page {currentPage} of {totalPages} • Showing {paginatedSongs.length} of {sortedFilteredSongs.length} songs
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage <= 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage >= totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}

                {/* Selection Summary */}
                {selectedSongs.size > 0 && (
                  <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className=" text-sm text-foreground">
                        {selectedSongs.size} song{selectedSongs.size !== 1 ? 's' : ''} selected
                      </span>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedSongs(new Set())}>
                          Clear Selection
                        </Button>
                        <Button variant="secondary" size="sm">
                          Bulk Actions
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 3: Song Import */}
        <section className="space-y-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Music className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl  font-bold text-foreground tracking-[0.2em]">
              SONG IMPORT
            </h2>
            <p className="text-muted-foreground  text-sm max-w-2xl mx-auto leading-relaxed">
              Drop CSV files here or <span className="text-primary font-semibold">browse to upload</span>
              <br />
              <span className="text-xs">• Industrial scale ready: 680,000+ files supported</span>
              <br />
              <span className="text-xs">• Multi-file aggregation and normalization</span>
              <br />
              <span className="text-xs">• Professional chord progression analysis</span>
            </p>
          </div>

          <div className="text-center space-y-6">
            {isLoading ? (
              <div className="space-y-4">
                <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
                  <Database className="h-10 w-10 text-primary" />
                </div>
                <div className="text-primary  text-xl font-bold tracking-[0.1em]">
                  PROCESSING FILE...
                </div>
                <div className="text-muted-foreground  text-sm tracking-wide">
                  Detecting format and parsing harmonic data
                </div>
                <div className="w-full max-w-lg mx-auto bg-muted rounded-full h-3 overflow-hidden">
                  <div className="bg-gradient-primary h-3 rounded-full animate-pulse transition-all duration-1000" style={{ width: '75%' }}></div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <MusicVizFileUploader
                  onFileUpload={handleFileUpload}
                  onMultiFileUpload={handleMultiFileUpload}
                  isLoading={isLoading}
                />
                <div className="pt-6 border-t border-border/30">
                  <Button
                    variant="ghost"
                    onClick={loadMockData}
                    className=" text-sm tracking-wide text-muted-foreground hover:text-foreground"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Load Mock Data (Testing)
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Dataset Status - Only show when data is loaded */}
          {parseResult && !isLoading && (
            <Card className="bg-gradient-accent border-border" style={{ boxShadow: 'var(--shadow-card)' }}>
              <CardContent className="pt-6 pb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-3xl  font-bold text-primary">
                        {parseResult.successfulRows.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground  uppercase tracking-wider">
                        Songs Loaded
                      </div>
                    </div>

                    <div className="h-12 w-px bg-border"></div>

                    <div className="space-y-1">
                      <Badge variant="secondary" className=" text-sm">
                        {parseResult.format.toUpperCase()}
                      </Badge>
                      <div className="text-xs text-muted-foreground ">
                        Format Detected
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={loadMockData}
                      className=" text-xs tracking-wider"
                    >
                      <Database className="w-4 h-4 mr-2" />
                      Cycle Mock Data
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </section>

      </main>

      {/* Timeline Visualization Section - Separated at Bottom */}
      {parseResult && (parseResult.format === 'data2' || parseResult.format === 'data3') && (
        <div className="bg-muted/30 border-t mt-8">
          <div className="max-w-[120rem] mx-auto px-8 py-12">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl  font-bold text-foreground tracking-[0.2em] uppercase">
                  Timeline Visualization
                </CardTitle>
                <p className="text-muted-foreground  text-sm">
                  Song structure analysis and chord progression timelines for selected songs
                </p>
              </CardHeader>
              <CardContent>
                <UnifiedVisualizationDashboard
                  songs={parseResult.songs}
                  format={parseResult.format}
                  harmonicData={parseResult.harmonicData}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Song Detail Panel - TEMPORARILY DISABLED */}
      {/* {selectedSong && (
        <SongDetailPanel
          song={selectedSong}
          isVisible={!!selectedSong}
          onClose={() => setSelectedSong(null)}
        />
      )} */}

      {/* Debug Panel */}
      <DebugPanel
        logs={debugLogs}
        isOpen={debugPanelOpen}
        onClose={() => setDebugPanelOpen(false)}
        onClear={() => debugLogger.clear()}
      />

      {/* Onboarding System */}
      <OnboardingSystem
        isOpen={showOnboarding}
        onClose={handleOnboardingClose}
        onComplete={handleOnboardingComplete}
      />

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-muted-foreground text-sm">
            Million Song Mind <span className="font-black text-primary">V1.0</span> — built for harmonic exploration at scale
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MillionSongMind;