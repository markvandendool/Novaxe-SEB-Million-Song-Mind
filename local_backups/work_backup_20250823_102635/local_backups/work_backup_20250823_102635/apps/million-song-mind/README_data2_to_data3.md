# Data2 to Data3 Conversion Script v7.0

## Overview

This script converts chordonomicon **data2** (CPML format) to **data3** format with exact structure compliance. It enriches the original chord progression data with Spotify metadata, key detection, Roman numeral analysis, and harmonic fingerprinting.

## What is Data3?

Data3 is the ultimate combined format that merges:
- **Data2**: CPML chord progressions with metadata
- **Spotify enrichment**: Artist names, song names, clickable URLs
- **Harmonic analysis**: Key detection, Roman numerals, harmonic fingerprints
- **Chord counting**: 27 chord type categories with occurrence counts

## Data3 Structure

The output CSV contains these columns in exact order:

### Core Data2 Columns
- `id` - Song identifier
- `chords` - Original chord progression with section markers
- `release_date` - Song release date
- `genres` - Genre information
- `decade` - Decade classification
- `rock_genre` - Rock genre classification
- `artist_id` - Original artist ID
- `main_genre` - Primary genre
- `spotify_song_id` - Spotify track ID
- `spotify_artist_id` - Spotify artist ID

### Spotify Enrichment
- `artist_name` - Human-readable artist name
- `artist_url` - Clickable Spotify artist URL
- `song_name` - Human-readable song name
- `song_url` - Clickable Spotify track URL

### Harmonic Analysis
- `key` - Detected key (e.g., "C", "A", "F#")
- `roman_numerals` - Full progression in Roman numerals
- `harmonic_fingerprint` - HUV (Harmonic Unit Vector) format

### Chord Type Counts (27 categories)
- `I`, `ii`, `iii`, `IV`, `V`, `vi`, `vii°` - Major diatonic
- `I7`, `iiiº`, `II(7)`, `#ivø`, `III`, `#vº`, `VI(7)`, `#iø`, `VII(7)`, `#iiø` - Applied
- `i`, `iiø`, `bIII`, `iv`, `v`, `bVI`, `bVII`, `V(b9)`, `viiº` - Minor diatonic
- `Other` - Catch-all for unrecognized chords

## Installation

### Quick Setup
```bash
chmod +x setup_data2_to_data3.sh
./setup_data2_to_data3.sh
```

### Manual Setup
```bash
# Create virtual environment
python3 -m venv venv_data2_to_data3
source venv_data2_to_data3/bin/activate

# Install dependencies
pip install pandas>=2.0.0 numpy>=1.24.0 aiohttp>=3.8.0 pyyaml>=6.0
```

## Usage

### Basic Conversion
```bash
python3 enrich_data2_to_data3_v7.py --input data2.csv --output data3.csv
```

### Advanced Options
```bash
# With custom batch size for API calls
python3 enrich_data2_to_data3_v7.py \
  --input chordonomicon_v2.csv \
  --output data3_enriched.csv \
  --batch-size 100 \
  --verbose
```

### Command Line Options
- `--input, -i`: Input data2 CSV file (required)
- `--output, -o`: Output data3 CSV file (default: data3_enriched.csv)
- `--batch-size`: Number of API calls per batch (default: 50)
- `--config, -c`: Configuration YAML file
- `--verbose, -v`: Enable detailed logging

## Features

### 🎵 Spotify Metadata Enrichment
- Fetches artist and song names from Spotify API
- Creates clickable URLs for Spotify pages
- Caches results to avoid duplicate API calls
- Handles rate limiting and errors gracefully

### 🎼 Advanced Music Theory Analysis
- **Key Detection**: Uses Krumhansl-Schmuckler profiles for accurate key detection
- **Roman Numerals**: Converts chord progressions to Roman numeral notation
- **Section Preservation**: Maintains structure markers (`<verse_1>`, `<chorus_1>`, etc.)
- **Harmonic Fingerprinting**: Generates HUV vectors for similarity analysis

### 📊 Chord Type Counting
- Counts occurrences of all 27 chord categories
- Handles complex jazz chords and extensions
- Provides statistical analysis of harmonic content

### ⚡ Performance Optimizations
- Async HTTP requests for efficient API usage
- Batch processing to minimize API calls
- Intelligent caching to avoid redundant requests
- Progress tracking for large datasets

## Example Output

### Input (Data2)
```csv
id,chords,spotify_artist_id,spotify_song_id
1,"<verse_1> C G Am F <chorus_1> F C G Am",4AIEGdwDzPELXYgM5JaEY5,4AIEGdwDzPELXYgM5JaEY5
```

### Output (Data3)
```csv
id,chords,spotify_artist_id,spotify_song_id,artist_name,artist_url,song_name,song_url,key,roman_numerals,harmonic_fingerprint,I,ii,iii,IV,V,vi,vii°,...
1,"<verse_1> C G Am F <chorus_1> F C G Am",4AIEGdwDzPELXYgM5JaEY5,4AIEGdwDzPELXYgM5JaEY5,MEL STREET,https://open.spotify.com/artist/4AIEGdwDzPELXYgM5JaEY5,Song Name,https://open.spotify.com/track/4AIEGdwDzPELXYgM5JaEY5,C,"<verse_1> I V vi IV <chorus_1> IV I V vi","1,0,0,0,1,0,0,0,0,0,0,0 | 0,0,0,0,0,0,0,1,0,0,0,0 | ...",2,0,0,2,2,2,0,...
```

## Technical Details

### Key Detection Algorithm
1. Extract pitch class profile from chord sequence
2. Compare with Krumhansl-Schmuckler key profiles
3. Calculate correlation scores for all 24 keys (12 major + 12 minor)
4. Select key with highest correlation score

### Roman Numeral Analysis
1. Parse each chord for root note and quality
2. Calculate scale degree relative to detected key
3. Map to appropriate Roman numeral
4. Preserve section markers and structure

### Harmonic Fingerprinting
- Generates 12-dimensional vectors for each chord
- Represents harmonic content in chromatic space
- Enables similarity analysis and pattern recognition

### Caching Strategy
- Stores API responses in `spotify_cache.json`
- Prevents duplicate API calls
- Handles rate limiting gracefully
- Saves progress periodically

## Error Handling

The script handles various error conditions:
- Missing or invalid chord data
- Spotify API rate limiting
- Network connectivity issues
- Malformed CSV data
- Missing required columns

## Performance

- **Processing Speed**: ~1000 songs/minute (depending on API rate limits)
- **Memory Usage**: Minimal - processes data in chunks
- **API Efficiency**: Caches results to minimize API calls
- **Scalability**: Designed for datasets up to 600K+ songs

## Troubleshooting

### Common Issues

1. **Spotify API Errors**
   - Check API credentials in script
   - Verify network connectivity
   - Check rate limiting status

2. **Memory Issues**
   - Reduce batch size with `--batch-size 25`
   - Process smaller chunks of data

3. **CSV Format Issues**
   - Ensure input file has required columns
   - Check for encoding issues (use UTF-8)

### Logs
- Check `enrich_data2_to_data3.log` for detailed error messages
- Use `--verbose` flag for additional debugging information

## Future Enhancements

- Audio analysis integration
- Enhanced chord recognition
- Machine learning key detection
- Real-time processing capabilities
- Web interface for monitoring

## License

MIT License - see LICENSE file for details.

## Support

For issues or questions:
1. Check the logs for error messages
2. Verify input data format
3. Test with a small sample first
4. Review API rate limits and credentials 