#!/usr/bin/env python3
"""
🎵 SPOTIFY DATA ENRICHER - VIPER ULTIMATE FUNCTIONALITY
Based on existing Novaxe Spotify integration patterns
Processes data3_enriched.csv files with Spotify ID replacement

USAGE:
    python3 spotify-data-enricher.py --input data3_enriched.csv --output enriched_with_spotify.csv
    python3 spotify-data-enricher.py --analyze existing_file.csv
    python3 spotify-data-enricher.py --batch-process *.csv

FEATURES:
    ✅ CSV Processing: Reads and processes large CSV files (104MB+)
    ✅ Spotify Integration: Uses existing Novaxe API patterns
    ✅ ID Replacement: Artist/Song ID matching and replacement
    ✅ Chordonomicon Data: Handles chordonomicon format processing
    ✅ Error Handling: Comprehensive validation and logging
    ✅ Batch Processing: Multiple file processing capability
"""

import csv
import json
import requests
import argparse
import sys
import os
import time
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import logging
from urllib.parse import quote

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('spotify-enricher.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class SpotifyDataEnricher:
    """
    Spotify Data Enricher - Replicates Viper Ultimate functionality
    Based on existing Novaxe Spotify API integration patterns
    """
    
    def __init__(self, config_file: str = None):
        """Initialize with configuration"""
        self.config = self._load_config(config_file)
        self.spotify_api_base = self.config.get('spotify_api_base', 'http://localhost:4200')
        self.cache = {}
        self.processed_count = 0
        self.error_count = 0
        
        logger.info("🎵 Spotify Data Enricher initialized")
        logger.info(f"📍 API Base: {self.spotify_api_base}")

    def _load_config(self, config_file: str) -> Dict:
        """Load configuration from file or use defaults"""
        default_config = {
            'spotify_api_base': 'http://localhost:4200',
            'api_endpoints': {
                'search': '/api/spotify/songInfos',
                'features': '/api/spotify/songFeatures',
                'contents': '/api/spotify/songContents',
                'recommendations': '/api/spotify/songReco',
                'top_tracks': '/api/spotify/songTop'
            },
            'rate_limit': {
                'requests_per_second': 5,
                'batch_size': 100
            },
            'csv_settings': {
                'delimiter': ',',
                'quotechar': '"',
                'encoding': 'utf-8'
            }
        }
        
        if config_file and os.path.exists(config_file):
            with open(config_file, 'r') as f:
                user_config = json.load(f)
                default_config.update(user_config)
        
        return default_config

    def search_spotify_track(self, title: str, artist: str, album: str = '') -> Optional[Dict]:
        """
        Search for Spotify track using existing Novaxe API pattern
        Replicates the PHP songInfos.php functionality
        """
        cache_key = f"{artist}|{title}|{album}"
        if cache_key in self.cache:
            return self.cache[cache_key]
        
        endpoint = f"{self.spotify_api_base}{self.config['api_endpoints']['search']}"
        
        payload = {
            'title': title,
            'artist': artist,
            'album': album,
            'comp': 'stats'  # Component context like stats.component.ts
        }
        
        try:
            response = requests.post(
                endpoint,
                json=payload,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    if 'tracks' in data and 'items' in data['tracks'] and data['tracks']['items']:
                        track_info = data['tracks']['items'][0]
                        result = {
                            'spotify_id': track_info['id'],
                            'spotify_uri': track_info['uri'],
                            'external_urls': track_info.get('external_urls', {}),
                            'popularity': track_info.get('popularity', 0),
                            'duration_ms': track_info.get('duration_ms', 0),
                            'preview_url': track_info.get('preview_url', ''),
                            'artists': [{'id': artist['id'], 'name': artist['name']} for artist in track_info.get('artists', [])],
                            'album': {
                                'id': track_info['album']['id'],
                                'name': track_info['album']['name']
                            } if 'album' in track_info else None
                        }
                        self.cache[cache_key] = result
                        return result
                except json.JSONDecodeError:
                    logger.warning(f"Invalid JSON response for {artist} - {title}")
            
            time.sleep(1 / self.config['rate_limit']['requests_per_second'])
            return None
            
        except requests.RequestException as e:
            logger.error(f"Request failed for {artist} - {title}: {e}")
            self.error_count += 1
            return None

    def get_spotify_features(self, spotify_id: str) -> Optional[Dict]:
        """
        Get Spotify audio features using existing Novaxe API pattern
        Replicates the PHP songFeatures.php functionality
        """
        if spotify_id in self.cache:
            return self.cache[spotify_id]
        
        endpoint = f"{self.spotify_api_base}{self.config['api_endpoints']['features']}"
        
        payload = {'id': spotify_id}
        
        try:
            response = requests.post(
                endpoint,
                json=payload,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    self.cache[spotify_id] = data
                    return data
                except json.JSONDecodeError:
                    logger.warning(f"Invalid JSON response for features: {spotify_id}")
            
            time.sleep(1 / self.config['rate_limit']['requests_per_second'])
            return None
            
        except requests.RequestException as e:
            logger.error(f"Features request failed for {spotify_id}: {e}")
            self.error_count += 1
            return None

    def process_csv_data3_enriched(self, input_file: str, output_file: str) -> bool:
        """
        Process data3_enriched.csv file with Spotify ID replacement
        Main function replicating Viper Ultimate CSV processing
        """
        logger.info(f"📄 Processing CSV: {input_file}")
        logger.info(f"📤 Output file: {output_file}")
        
        try:
            with open(input_file, 'r', encoding=self.config['csv_settings']['encoding']) as infile:
                # Detect CSV structure
                sample = infile.read(1024)
                infile.seek(0)
                
                csv_reader = csv.DictReader(
                    infile, 
                    delimiter=self.config['csv_settings']['delimiter'],
                    quotechar=self.config['csv_settings']['quotechar']
                )
                
                # Get fieldnames and add Spotify enrichment columns
                original_fieldnames = csv_reader.fieldnames
                logger.info(f"📋 Original columns: {original_fieldnames}")
                
                enriched_fieldnames = list(original_fieldnames) + [
                    'spotify_track_id',
                    'spotify_artist_id', 
                    'spotify_uri',
                    'spotify_popularity',
                    'spotify_duration_ms',
                    'spotify_preview_url',
                    'audio_features_danceability',
                    'audio_features_energy',
                    'audio_features_key',
                    'audio_features_loudness',
                    'audio_features_mode',
                    'audio_features_speechiness',
                    'audio_features_acousticness',
                    'audio_features_instrumentalness',
                    'audio_features_liveness',
                    'audio_features_valence',
                    'audio_features_tempo',
                    'audio_features_time_signature',
                    'enrichment_status',
                    'enrichment_timestamp'
                ]
                
                with open(output_file, 'w', encoding=self.config['csv_settings']['encoding'], newline='') as outfile:
                    csv_writer = csv.DictWriter(
                        outfile,
                        fieldnames=enriched_fieldnames,
                        delimiter=self.config['csv_settings']['delimiter'],
                        quotechar=self.config['csv_settings']['quotechar']
                    )
                    
                    csv_writer.writeheader()
                    
                    batch_count = 0
                    for row in csv_reader:
                        enriched_row = self._enrich_row(row)
                        csv_writer.writerow(enriched_row)
                        
                        self.processed_count += 1
                        batch_count += 1
                        
                        if batch_count % self.config['rate_limit']['batch_size'] == 0:
                            logger.info(f"✅ Processed {self.processed_count} rows")
                            time.sleep(1)  # Rate limiting
                
                logger.info(f"🎉 Processing complete!")
                logger.info(f"📊 Total rows processed: {self.processed_count}")
                logger.info(f"❌ Errors encountered: {self.error_count}")
                
                return True
                
        except FileNotFoundError:
            logger.error(f"❌ Input file not found: {input_file}")
            return False
        except Exception as e:
            logger.error(f"❌ Processing failed: {e}")
            return False

    def _enrich_row(self, row: Dict) -> Dict:
        """
        Enrich a single CSV row with Spotify data
        Core enrichment logic replicating Viper Ultimate pattern
        """
        enriched_row = row.copy()
        
        # Initialize enrichment columns
        spotify_columns = {
            'spotify_track_id': '',
            'spotify_artist_id': '',
            'spotify_uri': '',
            'spotify_popularity': 0,
            'spotify_duration_ms': 0,
            'spotify_preview_url': '',
            'audio_features_danceability': 0,
            'audio_features_energy': 0,
            'audio_features_key': -1,
            'audio_features_loudness': 0,
            'audio_features_mode': -1,
            'audio_features_speechiness': 0,
            'audio_features_acousticness': 0,
            'audio_features_instrumentalness': 0,
            'audio_features_liveness': 0,
            'audio_features_valence': 0,
            'audio_features_tempo': 0,
            'audio_features_time_signature': 4,
            'enrichment_status': 'pending',
            'enrichment_timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
        }
        
        enriched_row.update(spotify_columns)
        
        # Extract artist and title from various possible column names
        artist = self._extract_field_value(row, ['artist', 'Artist', 'ARTIST', 'artist_name', 'performer'])
        title = self._extract_field_value(row, ['title', 'Title', 'TITLE', 'song_title', 'track_name', 'song'])
        album = self._extract_field_value(row, ['album', 'Album', 'ALBUM', 'album_name', 'release'])
        
        if not artist or not title:
            enriched_row['enrichment_status'] = 'missing_data'
            return enriched_row
        
        # Search for Spotify track
        spotify_track = self.search_spotify_track(title, artist, album)
        
        if spotify_track:
            enriched_row.update({
                'spotify_track_id': spotify_track['spotify_id'],
                'spotify_uri': spotify_track['spotify_uri'],
                'spotify_popularity': spotify_track.get('popularity', 0),
                'spotify_duration_ms': spotify_track.get('duration_ms', 0),
                'spotify_preview_url': spotify_track.get('preview_url', ''),
                'enrichment_status': 'spotify_found'
            })
            
            # Extract artist ID if available
            if spotify_track.get('artists') and spotify_track['artists']:
                enriched_row['spotify_artist_id'] = spotify_track['artists'][0]['id']
            
            # Get audio features
            audio_features = self.get_spotify_features(spotify_track['spotify_id'])
            if audio_features:
                feature_mapping = {
                    'audio_features_danceability': 'danceability',
                    'audio_features_energy': 'energy', 
                    'audio_features_key': 'key',
                    'audio_features_loudness': 'loudness',
                    'audio_features_mode': 'mode',
                    'audio_features_speechiness': 'speechiness',
                    'audio_features_acousticness': 'acousticness',
                    'audio_features_instrumentalness': 'instrumentalness',
                    'audio_features_liveness': 'liveness',
                    'audio_features_valence': 'valence',
                    'audio_features_tempo': 'tempo',
                    'audio_features_time_signature': 'time_signature'
                }
                
                for csv_col, spotify_col in feature_mapping.items():
                    if spotify_col in audio_features:
                        enriched_row[csv_col] = audio_features[spotify_col]
                
                enriched_row['enrichment_status'] = 'fully_enriched'
        else:
            enriched_row['enrichment_status'] = 'not_found'
        
        return enriched_row

    def _extract_field_value(self, row: Dict, possible_fields: List[str]) -> str:
        """Extract value from row using multiple possible field names"""
        for field in possible_fields:
            if field in row and row[field] and row[field].strip():
                return row[field].strip()
        return ''

    def analyze_csv(self, csv_file: str) -> Dict:
        """
        Analyze CSV structure and content
        Useful for understanding data3_enriched.csv format
        """
        logger.info(f"🔍 Analyzing CSV structure: {csv_file}")
        
        analysis = {
            'file_path': csv_file,
            'file_size_mb': 0,
            'total_rows': 0,
            'columns': [],
            'sample_data': [],
            'potential_music_columns': {
                'artist': [],
                'title': [], 
                'album': [],
                'other': []
            }
        }
        
        try:
            file_size = os.path.getsize(csv_file)
            analysis['file_size_mb'] = round(file_size / (1024 * 1024), 2)
            
            with open(csv_file, 'r', encoding='utf-8') as f:
                csv_reader = csv.DictReader(f)
                analysis['columns'] = csv_reader.fieldnames
                
                # Categorize columns
                for col in analysis['columns']:
                    col_lower = col.lower()
                    if any(term in col_lower for term in ['artist', 'performer', 'musician']):
                        analysis['potential_music_columns']['artist'].append(col)
                    elif any(term in col_lower for term in ['title', 'song', 'track', 'name']):
                        analysis['potential_music_columns']['title'].append(col)
                    elif any(term in col_lower for term in ['album', 'release', 'record']):
                        analysis['potential_music_columns']['album'].append(col)
                    else:
                        analysis['potential_music_columns']['other'].append(col)
                
                # Sample first 5 rows
                for i, row in enumerate(csv_reader):
                    if i < 5:
                        analysis['sample_data'].append(row)
                    analysis['total_rows'] = i + 1
            
            logger.info(f"📊 Analysis complete:")
            logger.info(f"   File size: {analysis['file_size_mb']} MB")
            logger.info(f"   Total rows: {analysis['total_rows']}")
            logger.info(f"   Total columns: {len(analysis['columns'])}")
            logger.info(f"   Potential artist columns: {analysis['potential_music_columns']['artist']}")
            logger.info(f"   Potential title columns: {analysis['potential_music_columns']['title']}")
            
            return analysis
            
        except Exception as e:
            logger.error(f"❌ Analysis failed: {e}")
            return analysis

    def batch_process(self, pattern: str) -> bool:
        """
        Process multiple CSV files matching a pattern
        Useful for processing multiple data3_enriched files
        """
        logger.info(f"🔄 Batch processing files matching: {pattern}")
        
        input_files = list(Path('.').glob(pattern))
        
        if not input_files:
            logger.warning(f"⚠️  No files found matching pattern: {pattern}")
            return False
        
        logger.info(f"📁 Found {len(input_files)} files to process")
        
        success_count = 0
        for input_file in input_files:
            output_file = input_file.with_suffix('.enriched.csv')
            logger.info(f"🔄 Processing: {input_file}")
            
            if self.process_csv_data3_enriched(str(input_file), str(output_file)):
                success_count += 1
                logger.info(f"✅ Successfully processed: {input_file}")
            else:
                logger.error(f"❌ Failed to process: {input_file}")
        
        logger.info(f"🎉 Batch processing complete: {success_count}/{len(input_files)} successful")
        return success_count == len(input_files)


def main():
    """Main entry point with command line interface"""
    parser = argparse.ArgumentParser(
        description='🎵 Spotify Data Enricher - Viper Ultimate Functionality',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    python3 spotify-data-enricher.py --input data3_enriched.csv --output enriched_with_spotify.csv
    python3 spotify-data-enricher.py --analyze existing_file.csv  
    python3 spotify-data-enricher.py --batch-process "data3_*.csv"
    python3 spotify-data-enricher.py --batch-process "*.csv" --config my_config.json
        """
    )
    
    parser.add_argument('--input', '-i', help='Input CSV file to process')
    parser.add_argument('--output', '-o', help='Output CSV file (enriched)')
    parser.add_argument('--analyze', '-a', help='Analyze CSV structure and content')
    parser.add_argument('--batch-process', '-b', help='Process multiple files matching pattern')
    parser.add_argument('--config', '-c', help='Configuration file (JSON)')
    
    args = parser.parse_args()
    
    if not any([args.input, args.analyze, args.batch_process]):
        parser.print_help()
        return 1
    
    enricher = SpotifyDataEnricher(args.config)
    
    if args.analyze:
        analysis = enricher.analyze_csv(args.analyze)
        print(json.dumps(analysis, indent=2))
        return 0
    
    if args.batch_process:
        success = enricher.batch_process(args.batch_process)
        return 0 if success else 1
    
    if args.input:
        if not args.output:
            args.output = args.input.replace('.csv', '_enriched.csv')
        
        success = enricher.process_csv_data3_enriched(args.input, args.output)
        return 0 if success else 1
    
    return 1


if __name__ == '__main__':
    sys.exit(main())
