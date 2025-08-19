import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { HarmonicChart } from '@/components/HarmonicChart';
import { CHORD_GROUPS } from '@/constants/harmony';
import { FileDropZone } from '@/components/FileDropZone';
import { SearchFilters } from '@/components/SearchFilters';
import { SongTable } from '@/components/SongTable';
import { MusicVizFileUploader } from '@/components/MusicVizFileUploader';
import { MusicVizDashboard } from '@/components/MusicVizDashboard';
import BraidExact, { DEFAULT_BRAID_GEOMETRY } from '@/components/BraidExact';
import { parseCSVData, enrichSongsWithStructure, ParseResult } from '@/utils/cpmlParser';
import { ParsedSong } from '@/types/cpml';
import { useToast } from '@/hooks/use-toast';
import { Music, Database, Settings, Zap } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';
import { Link, useNavigate } from 'react-router-dom';
import RealNovaxeBraid from '@/components/braid/RealNovaxeBraid';

// Sample song data structure for V2 (will be replaced with real CSV data)
interface Song {
  id: string;
  songName: string;
  artistName: string;
  releaseDate: string;
  genres: string[];
  decade: string;
  mainGenre: string;
  spotifySongId: string;
  spotifyArtistId: string;
  chords: string[];
  harmonic_profile?: any;
}

interface SearchFilters {
  songName: string;
  artistName: string;
  genre: string;
  yearRange: [number, number];
  selectedChords: string[];
  decade: string;
}

// Professional template data matching music industry standards
const DEFAULT_DATA = [
  { chord: "I", percent: 17, root: 11, first: 3, second: 0, third: 3, section: "Major" },
  { chord: "ii", percent: 11, root: 6, first: 3, second: 2, third: 0, section: "Major" },
  { chord: "iii", percent: 6, root: 3, first: 2, second: 1, third: 0, section: "Major" },
  { chord: "IV", percent: 6, root: 3, first: 1, second: 2, third: 0, section: "Major" },
  { chord: "V", percent: 36, root: 27, first: 5, second: 3, third: 1, section: "Major" },
  { chord: "vi", percent: 6, root: 3, first: 2, second: 1, third: 0, section: "Major" },
  { chord: "viiø", percent: 0, root: 0, first: 0, second: 0, third: 0, section: "Major" },
  { chord: "I7", percent: 6, root: 4, first: 1, second: 1, third: 0, section: "Applied" },
  { chord: "iiiº", percent: 0, root: 0, first: 0, second: 0, third: 0, section: "Applied" },
  { chord: "II(7)", percent: 6, root: 3, first: 2, second: 1, third: 0, section: "Applied" },
  { chord: "#ivø", percent: 0, root: 0, first: 0, second: 0, third: 0, section: "Applied" },
  { chord: "III", percent: 0, root: 0, first: 0, second: 0, third: 0, section: "Applied" },
  { chord: "#vº", percent: 3, root: 2, first: 1, second: 0, third: 0, section: "Applied" },
  { chord: "VI(7)", percent: 3, root: 2, first: 1, second: 0, third: 0, section: "Applied" },
  { chord: "#iø", percent: 0, root: 0, first: 0, second: 0, third: 0, section: "Applied" },
  { chord: "VII(7)", percent: 0, root: 0, first: 0, second: 0, third: 0, section: "Applied" },
  { chord: "#iiø", percent: 3, root: 1, first: 1, second: 1, third: 0, section: "Applied" },
  { chord: "i", percent: 3, root: 1, first: 0, second: 1, third: 1, section: "Minor" },
  { chord: "iiø", percent: 0, root: 0, first: 0, second: 0, third: 0, section: "Minor" },
  { chord: "bIII", percent: 3, root: 2, first: 1, second: 0, third: 0, section: "Minor" },
  { chord: "iv", percent: 0, root: 0, first: 0, second: 0, third: 0, section: "Minor" },
  { chord: "v", percent: 0, root: 0, first: 0, second: 0, third: 0, section: "Minor" },
  { chord: "bVI", percent: 3, root: 2, first: 0, second: 1, third: 0, section: "Minor" },
  { chord: "bVII", percent: 0, root: 0, first: 0, second: 0, third: 0, section: "Minor" },
  { chord: "V(b9)", percent: 0, root: 0, first: 0, second: 0, third: 0, section: "Minor" },
  { chord: "viiº", percent: 3, root: 2, first: 1, second: 0, third: 0, section: "Minor" },
  { chord: "Other", percent: 3, root: 0, first: 2, second: 0, third: 1, section: "Other" }
];

const CHORD_ORDER = CHORD_GROUPS;

const Index = () => {
  useSEO({
    title: 'Harmonic Oracle — Harmonic Profile Analyzer',
    description: 'Visualize chord distributions and explore harmonic patterns.',
    canonicalPath: '/',
  });
  const navigate = useNavigate();
  const [currentData, setCurrentData] = useState(DEFAULT_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [fileCount, setFileCount] = useState(0);
  const [totalSongs, setTotalSongs] = useState(679807); // V2: Massive database ready
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedChords, setSelectedChords] = useState<string[]>([]);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    songName: '',
    artistName: '',
    genre: '',
    yearRange: [1950, 2024],
    selectedChords: [],
    decade: ''
  });
  
  // MusicViz state
  const [musicVizSongs, setMusicVizSongs] = useState<ParsedSong[]>([]);
  const [isMusicVizLoading, setIsMusicVizLoading] = useState(false);
  const [sampleSongs] = useState<Song[]>([
    // Sample V2 data structure - will be replaced with real CSV data
    {
      id: '1',
      songName: 'Sample Song 1',
      artistName: 'Sample Artist',
      releaseDate: '2020-01-01',
      genres: ['pop', 'rock'],
      decade: '2020s',
      mainGenre: 'pop',
      spotifySongId: '4AIEGdwDzPELXYgM5JaEY5',
      spotifyArtistId: '694QW15WkebjcrWgQHzRYF',
      chords: ['I', 'V', 'vi', 'IV']
    },
    {
      id: '2',
      songName: 'Another Example',
      artistName: 'Demo Band',
      releaseDate: '2018-06-15',
      genres: ['alternative', 'indie'],
      decade: '2010s',
      mainGenre: 'alternative',
      spotifySongId: '2ffJZ2r8HxI5DHcmf3BO6c',
      spotifyArtistId: '0niJkG4tKkne3zwr7I8n9n',
      chords: ['i', 'bVII', 'bVI', 'V']
    }
  ]);
  const { toast } = useToast();

  // Novaxe Braid integration
  const braidIframeRef = useRef<HTMLIFrameElement>(null);

  // Handle braid iframe load and communication
  const handleBraidIframeLoad = useCallback(() => {
    console.log('Novaxe braid iframe loaded');
    // Send initial data to the braid iframe
    if (braidIframeRef.current?.contentWindow) {
      braidIframeRef.current.contentWindow.postMessage({
        source: 'msm-app',
        type: 'updateChordsInScore',
        data: { chords: selectedChords }
      }, '*');
    }
  }, [selectedChords]);

  // Listen for messages from the Novaxe braid
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.source === 'novaxe-braid') {
        const { type, data } = event.data;
        
        switch (type) {
          case 'tonalityChange':
            console.log('Braid tonality changed:', data.tonality);
            // Update MSM interface based on tonality change
            break;
          case 'chordInScore':
            console.log('Chord in score from braid:', data.chord);
            // Handle chord selection from braid
            if (data.chord && !selectedChords.includes(data.chord)) {
              setSelectedChords(prev => [...prev, data.chord]);
            }
            break;
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [selectedChords]);

  // Industrial-grade CSV parser with error recovery
  const parseCSV = (text: string) => {
    try {
      const lines = text.trim().split('\n').filter(line => line.trim());
      if (lines.length < 2) return [];
      
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const requiredHeaders = ['chord', 'percent', 'root', 'first', 'second', 'third', 'section'];
      
      const hasRequiredHeaders = requiredHeaders.every(header => 
        headers.some(h => h.includes(header))
      );
      
      // Verbose diagnostics: detect likely Data3 uploads on the Index page
      const isLikelyData3 = headers.includes('chords')
        || headers.includes('roman_numerals')
        || headers.includes('artist_id')
        || headers.some(h => ['i','ii','iii','iv','v','vi','viiø','other','v(7)','ii(7)','iii(7)','vi(7)','vii(7)'].includes(h));
      console.groupCollapsed('[Index] CSV header check');
      console.log('headers:', headers.slice(0, 60));
      console.log('isLikelyData3:', isLikelyData3);
      console.log('requiredHeaders:', requiredHeaders);
      console.groupEnd();
      
      if (!hasRequiredHeaders) {
        if (isLikelyData3) {
          console.warn('[Index] Detected CPML/Data3-style headers. This page expects vertical harmonic profile (Datanaught) CSV. For Data3 ingestion, use /million-song-mind.');
        }
        throw new Error(`CSV must have headers: ${requiredHeaders.join(', ')}`);
      }
      
      const data = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length >= 7) {
          const row = {
            chord: values[0] || '',
            percent: parseFloat(values[1]) || 0,
            root: parseFloat(values[2]) || 0,
            first: parseFloat(values[3]) || 0,
            second: parseFloat(values[4]) || 0,
            third: parseFloat(values[5]) || 0,
            section: values[6] || ''
          };
          
          if (row.chord && row.section && !isNaN(row.percent) && row.percent >= 0) {
            data.push(row);
          }
        }
      }
      
      return data;
    } catch (err) {
      throw new Error(`CSV parsing failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Professional data aggregation for large-scale analysis
  const aggregateData = (allFiles: any[][]) => {
    const aggregated: { [key: string]: any } = {};
    const totalFiles = allFiles.length;
    
    // Initialize all possible chords
    Object.entries(CHORD_ORDER).forEach(([section, chords]) => {
      chords.forEach(chord => {
        aggregated[chord] = {
          chord,
          section,
          percent: 0,
          root: 0,
          first: 0,
          second: 0,
          third: 0,
          count: 0
        };
      });
    });

    // Process in chunks for performance
    const CHUNK_SIZE = 1000;
    for (let i = 0; i < allFiles.length; i += CHUNK_SIZE) {
      const chunk = allFiles.slice(i, i + CHUNK_SIZE);
      
      chunk.forEach(fileData => {
        fileData.forEach(row => {
          if (aggregated[row.chord]) {
            aggregated[row.chord].percent += row.percent;
            aggregated[row.chord].root += row.root;
            aggregated[row.chord].first += row.first;
            aggregated[row.chord].second += row.second;
            aggregated[row.chord].third += row.third;
            aggregated[row.chord].count++;
          }
        });
      });
    }

    // Convert to array and normalize
    const result = Object.values(aggregated).map(chord => ({
      ...chord,
      percent: totalFiles > 0 ? chord.percent / totalFiles : 0,
      root: totalFiles > 0 ? chord.root / totalFiles : 0,
      first: totalFiles > 0 ? chord.first / totalFiles : 0,
      second: totalFiles > 0 ? chord.second / totalFiles : 0,
      third: totalFiles > 0 ? chord.third / totalFiles : 0
    }));

    // CRITICAL: Normalize to exactly 100%
    const total = result.reduce((sum, chord) => sum + chord.percent, 0);
    if (total > 0 && Math.abs(total - 100) > 0.01) {
      const normalizationFactor = 100 / total;
      result.forEach(chord => {
        chord.percent *= normalizationFactor;
        chord.root *= normalizationFactor;
        chord.first *= normalizationFactor;
        chord.second *= normalizationFactor;
        chord.third *= normalizationFactor;
      });
    }

    return result;
  };

  // Professional file processing with error recovery
  const handleFiles = useCallback(async (files: File[]) => {
    setIsLoading(true);
    
    try {
      const allData = [];
      const errors = [];
      
      for (let i = 0; i < files.length; i++) {
        try {
          const content = await files[i].text();
          const firstLine = content.split('\n')[0] || '';
          const headers = firstLine.split(',').map(h => h.trim().toLowerCase());
          const isLikelyData3 = headers.includes('chords')
            || headers.includes('roman_numerals')
            || headers.includes('artist_id')
            || headers.some(h => ['i','ii','iii','iv','v','vi','viiø','other','v(7)','ii(7)','iii(7)','vi(7)','vii(7)'].includes(h));

          console.groupCollapsed('[Index] Processing file', files[i].name);
          console.log('firstLine:', firstLine.slice(0, 200));
          console.log('isLikelyData3:', isLikelyData3);

          if (isLikelyData3) {
            console.warn('[Index] Detected Data3/CPML file. Routing to /million-song-mind for proper ingestion.');
            try { sessionStorage.setItem('msm:pendingUpload', content); } catch {}
            toast({ title: 'Routing to MSM', description: 'Detected Data3 file. Opening MSM Explorer for proper ingestion.' });
            console.groupEnd();
            navigate('/million-song-mind?auto=1');
            setIsLoading(false);
            return; // stop Index processing, hand off to MSM
          }

          const data = parseCSV(content);
          console.log('rows parsed:', data.length);
          console.groupEnd();
          if (data.length > 0) {
            allData.push(data);
          }
        } catch (err) {
          errors.push(`${files[i].name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }
      
      if (allData.length === 0) {
        console.error('[Index] No valid data found. This uploader expects vertical harmonic profile CSV with headers: chord, percent, root, first, second, third, section. If your file is Data3/CPML, use /million-song-mind.', { fileErrors: errors });
        throw new Error('No valid data found in uploaded files');
      }
      
      if (errors.length > 0 && errors.length < files.length) {
        toast({
          title: "Partial Success",
          description: `${errors.length} files had errors, but ${allData.length} processed successfully`,
          variant: "destructive"
        });
      }
      
      const aggregated = aggregateData(allData);
      setCurrentData(aggregated);
      setFileCount(files.length);
      setTotalSongs(allData.length);
      
      toast({
        title: "Analysis Complete",
        description: `Successfully processed ${files.length} files containing ${allData.length} songs`,
      });
      
    } catch (err) {
      toast({
        title: "Processing Error",
        description: err instanceof Error ? err.message : 'Unknown error occurred',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // V2: Enhanced reset to zero state (as requested)
  const resetToZero = useCallback(() => {
    const ZERO_DATA = Object.entries(CHORD_ORDER).flatMap(([section, chords]) =>
      chords.map(chord => ({
        chord,
        percent: 0,
        root: 0,
        first: 0,
        second: 0,
        third: 0,
        section
      }))
    );
    
    setCurrentData(ZERO_DATA);
    setFileCount(0);
    setTotalSongs(679807); // Keep massive database ready
    setSelectedChords([]);
    setSearchFilters({
      songName: '',
      artistName: '',
      genre: '',
      yearRange: [1950, 2024],
      selectedChords: [],
      decade: ''
    });
    
    toast({
      title: "Reset Complete",
      description: "All values reset to zero - clean slate ready",
    });
  }, [toast]);

  // V2: Chord selection handler for interactive filtering
  const handleChordSelect = useCallback((chord: string, isSelected: boolean) => {
    const newSelectedChords = isSelected 
      ? [...selectedChords, chord]
      : selectedChords.filter(c => c !== chord);
    
    setSelectedChords(newSelectedChords);
    setSearchFilters(prev => ({
      ...prev,
      selectedChords: newSelectedChords
    }));
    
    toast({
      title: "Chord Filter Updated",
      description: `${newSelectedChords.length} chords selected`,
    });
  }, [selectedChords, toast]);

  // V2: Search filter handler
  const handleSearchFilters = useCallback((filters: SearchFilters) => {
    setSearchFilters(filters);
    setSelectedChords(filters.selectedChords);
  }, []);

  // V2: Calculate filtered song count based on current filters
  const filteredSongCount = useMemo(() => {
    let count = sampleSongs.length;
    
    if (searchFilters.songName) count = Math.floor(count * 0.1); // Simulate filtering
    if (searchFilters.artistName) count = Math.floor(count * 0.3);
    if (searchFilters.genre) count = Math.floor(count * 0.2);
    if (selectedChords.length > 0) count = Math.floor(count * (0.8 ** selectedChords.length));
    
    return Math.max(1, count);
  }, [searchFilters, selectedChords, sampleSongs.length]);

  // V2: Song selection handler
  const handleSongSelect = useCallback((song: Song) => {
    toast({
      title: "Song Selected",
      description: `"${song.songName}" by ${song.artistName}`,
    });
  }, [toast]);

  // MusicViz file upload handler
  const handleMusicVizFileUpload = useCallback(async (content: string) => {
    setIsMusicVizLoading(true);
    
    try {
      const parseResult = parseCSVData(content);
      const enrichedSongs = enrichSongsWithStructure(parseResult.songs);
      
      setMusicVizSongs(enrichedSongs);
      
      toast({
        title: "CPML Dataset Loaded",
        description: `Parsed ${enrichedSongs.length} songs from CPML data`,
      });
      
    } catch (error) {
      console.error('Error parsing CPML CSV:', error);
      toast({
        title: "Error Loading CPML Dataset",
        description: "Failed to parse the uploaded file. Please check the format.",
        variant: "destructive",
      });
    } finally {
      setIsMusicVizLoading(false);
    }
  }, [toast]);

  return (
    <div className="min-h-screen bg-background">
      {/* Professional Header - Reduced Height */}
      <header className="bg-gradient-surface border-b border-border shadow-professional">
        <div className="max-w-7xl mx-auto px-6 py-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-foreground tracking-tight ">
                MILLION SONG MIND
              </h1>
              <p className="text-xs text-muted-foreground ">
                Professional Music Intelligence Analytics Platform
              </p>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-right text-foreground  text-sm space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-muted-foreground">Files:</span>
                  <span className="text-primary font-bold">{fileCount.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-muted-foreground">Songs:</span>
                  <span className="text-accent font-bold">{totalSongs.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Link to="/braid">
                  <Button variant="secondary" className="transition-all duration-300">
                    Exact Braid
                  </Button>
                </Link>
                <Link to="/calibrate-braid">
                  <Button variant="secondary" className="transition-all duration-300">
                    Braid Studio
                  </Button>
                </Link>
                <Link to="/million-song-mind">
                  <Button variant="secondary" className="transition-all duration-300">
                    MSM Explorer
                  </Button>
                </Link>
                <Button
                  variant="harmonic"
                  onClick={resetToZero}
                  disabled={isLoading}
                  className="transition-all duration-300"
                >
                  🔄 RESET TO ZERO
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-12">
        {/* V2: Enhanced Search & Filter Interface */}
        <SearchFilters
          onSearch={handleSearchFilters}
          totalSongs={totalSongs}
          filteredCount={filteredSongCount}
          isLoading={isLoading}
        />

        {/* V2: Song Database Table */}
        <SongTable
          songs={sampleSongs}
          isLoading={isLoading}
          onSongSelect={handleSongSelect}
          selectedSongs={[]}
        />

        {/* V1: File Drop Zone (preserved for compatibility) */}
        <FileDropZone
          onFiles={handleFiles}
          isLoading={isLoading}
          isDragOver={isDragOver}
          setIsDragOver={setIsDragOver}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12 space-y-4">
            <div className="text-primary  text-xl animate-pulse">
              ⏳ PROCESSING {fileCount.toLocaleString()} FILES...
            </div>
            <div className="text-muted-foreground  text-sm">
              Aggregating harmonic data and normalizing percentages
            </div>
            <div className="w-full max-w-md mx-auto bg-muted rounded-full h-2">
              <div className="bg-gradient-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        )}

        {/* V2: Enhanced Interactive Chart Container with Integrated Title */}
        <div className="bg-gradient-surface rounded-lg p-6 px-12 shadow-professional relative">
          {/* Harmonic Profile Title - positioned in chart container */}
          <div className="text-center mb-4">
            <h2 className="text-4xl  font-bold text-foreground tracking-[0.2em] animate-fade-in">
              HARMONIC PROFILE
            </h2>
            {fileCount > 0 && (
              <div className="text-muted-foreground  text-sm mt-2">
                Aggregated from <span className="text-primary">{fileCount.toLocaleString()}</span> files • 
                <span className="text-accent"> {totalSongs.toLocaleString()}</span> songs analyzed
              </div>
            )}
          </div>
          
          <HarmonicChart 
            data={currentData} 
            fileCount={fileCount}
            totalSongs={totalSongs}
            onChordSelect={handleChordSelect}
            selectedChords={selectedChords}
          />
        </div>

        {/* Novaxe Braid: Complete Integration */}
        <div className="bg-gradient-surface rounded-lg p-6 shadow-professional">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Zap className="h-6 w-6 text-green-500" />
              <h3 className="text-2xl  font-bold tracking-wider">NOVAXE BRAID • COMPLETE</h3>
              <Settings className="h-6 w-6 text-green-500" />
            </div>
            <p className="text-muted-foreground  text-sm">
              Full Novaxe Angular braid with all options, toggle switches, and MSM integration
            </p>
          </div>
          
          {/* Braid Options Info */}
          <div className="mb-4 p-4 bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-lg border border-green-500/30">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-green-400 mb-1">Braid Types</div>
                <div className="text-muted-foreground">Tonal • Blues</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-green-400 mb-1">Display Modes</div>
                <div className="text-muted-foreground">Single • Dual • Extended • Full</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-green-400 mb-1">Controls</div>
                <div className="text-muted-foreground">Roman/Notes • Score Follow • Tonality</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-green-400 mb-1">Integration</div>
                <div className="text-muted-foreground">MSM ↔ Novaxe Bridge</div>
              </div>
            </div>
          </div>
          
          <RealNovaxeBraid
            onBraidTypeChange={(type) => console.log('Braid type changed:', type)}
            onTonalityChange={(tonality) => console.log('Braid tonality changed:', tonality)}
            onRomanToggle={(displayRoman) => console.log('Roman toggle:', displayRoman)}
            onScoreFollowToggle={(scoreFollow) => console.log('Score follow toggle:', scoreFollow)}
          />
        </div>

        {/* MusicViz Section */}
        <div className="border-t-2 border-purple-200 dark:border-purple-700 pt-12 mt-16">
          {/* MusicViz Header */}
          <div className="text-center space-y-4 mb-8">
            <h2 className="text-5xl  font-bold text-purple-800 dark:text-purple-200 tracking-[0.2em] animate-fade-in">
              MUSICVIZ
            </h2>
            <p className="text-purple-600 dark:text-purple-400  text-lg">
              Chord Progression Master List Visualizer • Song Structure Analysis
            </p>
          </div>

          {musicVizSongs.length === 0 ? (
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Welcome Section */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-8 border border-purple-200 dark:border-purple-700">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-2 text-2xl mb-6">
                    <Database className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                    <span className="font-bold text-purple-800 dark:text-purple-200">Welcome to MusicViz</span>
                  </div>
                  <p className="text-lg text-purple-600 dark:text-purple-300">
                    Visualize and explore chord progressions from the Chordonomicon dataset
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">📊</div>
                      <h3 className="font-semibold mt-2 text-purple-800 dark:text-purple-200">Song Structure</h3>
                      <p className="text-sm text-purple-600 dark:text-purple-300">
                        Visualize intro, verse, chorus, and bridge sections
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">🎵</div>
                      <h3 className="font-semibold mt-2 text-purple-800 dark:text-purple-200">Chord Analysis</h3>
                      <p className="text-sm text-purple-600 dark:text-purple-300">
                        Explore chord progressions and harmonic patterns
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">🔍</div>
                      <h3 className="font-semibold mt-2 text-purple-800 dark:text-purple-200">Filter & Search</h3>
                      <p className="text-sm text-purple-600 dark:text-purple-300">
                        Find songs by genre, decade, artist, and structure
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* File Upload */}
              <MusicVizFileUploader onFileUpload={handleMusicVizFileUpload} isLoading={isMusicVizLoading} />

              {/* Instructions */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-700">
                <h3 className="text-xl font-bold mb-4 text-purple-800 dark:text-purple-200">Expected Data Format</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-purple-700 dark:text-purple-300"><strong>CPML CSV Format:</strong> Tab-separated values with these columns:</p>
                  <ul className="list-disc list-inside space-y-1 text-purple-600 dark:text-purple-400 ml-4">
                    <li><code>id</code> - Unique song identifier</li>
                    <li><code>chords</code> - Chord progression with optional structure tags like &lt;verse_1&gt;, &lt;chorus_1&gt;</li>
                    <li><code>artist_id</code> - Artist identifier</li>
                    <li><code>spotify_artist_id</code> - Spotify artist name (if available)</li>
                    <li><code>main_genre</code> - Primary genre classification</li>
                    <li><code>decade</code> - Release decade</li>
                    <li>Additional metadata columns supported</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <MusicVizDashboard songs={musicVizSongs} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
