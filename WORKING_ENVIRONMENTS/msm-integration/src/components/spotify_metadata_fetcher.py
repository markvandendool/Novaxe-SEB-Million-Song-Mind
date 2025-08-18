#!/usr/bin/env python3
"""
🎵 SPOTIFY METADATA FETCHER v3.5
================================

Fetches comprehensive Spotify metadata for data3.5_spotify_extras.csv
Includes: track data, album data, artist data, audio features, light audio analysis
Excludes: heavy audio analysis segments, markets, external URLs

Usage:
    python spotify_metadata_fetcher.py --start 0 --end 1000 --output data3.5_spotify_extras_test.csv
    python spotify_metadata_fetcher.py --start 0 --end 375000 --output data3.5_spotify_extras_macpro.csv
"""

import asyncio
import aiohttp
import pandas as pd
import json
import time
import logging
import argparse
import os
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
import backoff
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TimeElapsedColumn

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler('spotify_fetcher.log'),
        logging.StreamHandler()
    ]
)

console = Console()

@dataclass
class SpotifyConfig:
    """Spotify API configuration"""
    client_id: str
    client_secret: str
    access_token: Optional[str] = None
    token_expires: Optional[float] = None

class SpotifyMetadataFetcher:
    """Comprehensive Spotify metadata fetcher for data3.5"""
    
    def __init__(self, config: SpotifyConfig):
        self.config = config
        self.session = None
        self.rate_limit_remaining = 1000
        self.rate_limit_reset = 0
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30),
            headers={'User-Agent': 'VIPER-Spotify-Fetcher/3.5'}
        )
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    @backoff.on_exception(backoff.expo, aiohttp.ClientError, max_tries=5)
    async def get_access_token(self) -> str:
        """Get Spotify access token"""
        if (self.config.access_token and self.config.token_expires and 
            time.time() < self.config.token_expires - 60):
            return self.config.access_token
            
        auth_url = "https://accounts.spotify.com/api/token"
        auth_data = {
            'grant_type': 'client_credentials'
        }
        
        async with self.session.post(
            auth_url,
            data=auth_data,
            auth=aiohttp.BasicAuth(self.config.client_id, self.config.client_secret)
        ) as response:
            if response.status != 200:
                raise Exception(f"Auth failed: {response.status}")
            
            data = await response.json()
            self.config.access_token = data['access_token']
            self.config.token_expires = time.time() + data['expires_in']
            
            return self.config.access_token
    
    @backoff.on_exception(backoff.expo, aiohttp.ClientError, max_tries=3)
    async def fetch_spotify_data(self, spotify_id: str) -> Dict:
        """Fetch comprehensive Spotify metadata for a track"""
        token = await self.get_access_token()
        headers = {'Authorization': f'Bearer {token}'}
        
        # Fetch track data
        track_url = f"https://api.spotify.com/v1/tracks/{spotify_id}"
        async with self.session.get(track_url, headers=headers) as response:
            if response.status == 429:
                retry_after = int(response.headers.get('Retry-After', 60))
                logging.warning(f"Rate limited, waiting {retry_after} seconds...")
                await asyncio.sleep(retry_after)
                return await self.fetch_spotify_data(spotify_id)
            
            if response.status != 200:
                logging.error(f"Track fetch failed for {spotify_id}: {response.status}")
                return {}
            
            track_data = await response.json()
        
        # Fetch audio features
        features_url = f"https://api.spotify.com/v1/audio-features/{spotify_id}"
        async with self.session.get(features_url, headers=headers) as response:
            features_data = await response.json() if response.status == 200 else {}
        
        # Fetch artist data
        artist_id = track_data.get('artists', [{}])[0].get('id')
        artist_data = {}
        if artist_id:
            artist_url = f"https://api.spotify.com/v1/artists/{artist_id}"
            async with self.session.get(artist_url, headers=headers) as response:
                artist_data = await response.json() if response.status == 200 else {}
        
        # Fetch light audio analysis (track section only)
        analysis_url = f"https://api.spotify.com/v1/audio-analysis/{spotify_id}"
        async with self.session.get(analysis_url, headers=headers) as response:
            analysis_data = await response.json() if response.status == 200 else {}
        
        # Extract and structure the data
        return self._extract_metadata(track_data, features_data, artist_data, analysis_data)

    @backoff.on_exception(backoff.expo, aiohttp.ClientError, max_tries=3)
    async def search_track_id(self, artist_name: str, song_name: str) -> Optional[str]:
        """Resolve a Spotify track id from artist/song names when id is missing."""
        if not artist_name and not song_name:
            return None
        token = await self.get_access_token()
        headers = {'Authorization': f'Bearer {token}'}
        # Basic query; URL-encode via params
        query = f"track:{song_name} artist:{artist_name}".strip()
        params = {"q": query, "type": "track", "limit": 1}
        async with self.session.get("https://api.spotify.com/v1/search", headers=headers, params=params) as resp:
            if resp.status != 200:
                return None
            data = await resp.json()
            items = data.get("tracks", {}).get("items", [])
            if items:
                return items[0].get("id")
            return None
    
    def _extract_metadata(self, track_data: Dict, features_data: Dict, 
                         artist_data: Dict, analysis_data: Dict) -> Dict:
        """Extract and structure metadata according to data3.5 specification"""
        
        # Track data
        metadata = {
            'spotify_song_id': track_data.get('id', ''),
            'track_name': track_data.get('name', ''),
            'explicit': track_data.get('explicit', False),
            'popularity': track_data.get('popularity', 0),
            'duration_ms': track_data.get('duration_ms', 0),
            'preview_url': track_data.get('preview_url', ''),
            'external_spotify_url': track_data.get('external_urls', {}).get('spotify', ''),
            
            # Album data
            'album_id': track_data.get('album', {}).get('id', ''),
            'album_name': track_data.get('album', {}).get('name', ''),
            'album_release_date': track_data.get('album', {}).get('release_date', ''),
            'album_total_tracks': track_data.get('album', {}).get('total_tracks', 0),
            'album_type': track_data.get('album', {}).get('album_type', ''),
            'album_cover_url': track_data.get('album', {}).get('images', [{}])[0].get('url', ''),
            
            # Artist data
            'artist_name': artist_data.get('name', ''),
            'artist_genres': ','.join(artist_data.get('genres', [])),
            'artist_popularity': artist_data.get('popularity', 0),
            'artist_followers': artist_data.get('followers', {}).get('total', 0),
            'artist_spotify_url': artist_data.get('external_urls', {}).get('spotify', ''),
            
            # Audio features
            'danceability': features_data.get('danceability', 0),
            'energy': features_data.get('energy', 0),
            'key': features_data.get('key', 0),
            'mode': features_data.get('mode', 0),
            'tempo': features_data.get('tempo', 0),
            'valence': features_data.get('valence', 0),
            'acousticness': features_data.get('acousticness', 0),
            'liveness': features_data.get('liveness', 0),
            'instrumentalness': features_data.get('instrumentalness', 0),
            'speechiness': features_data.get('speechiness', 0),
            'loudness': features_data.get('loudness', 0),
            'time_signature': features_data.get('time_signature', 0),
            
            # Light audio analysis (track section only)
            'analysis_tempo': analysis_data.get('track', {}).get('tempo', 0),
            'analysis_key': analysis_data.get('track', {}).get('key', 0),
            'analysis_mode': analysis_data.get('track', {}).get('mode', 0),
            'analysis_time_signature': analysis_data.get('track', {}).get('time_signature', 0),
            'analysis_loudness': analysis_data.get('track', {}).get('loudness', 0),
            'analysis_confidence': analysis_data.get('track', {}).get('analysis_confidence', 0),
            'analysis_start': analysis_data.get('track', {}).get('start', 0),
            'analysis_duration': analysis_data.get('track', {}).get('duration', 0),
        }
        
        return metadata
    
    async def process_chunk(self, spotify_ids: List[str], progress) -> List[Dict]:
        """Process a chunk of Spotify IDs with progress tracking"""
        results = []
        semaphore = asyncio.Semaphore(10)  # Limit concurrent requests
        
        async def fetch_with_semaphore(spotify_id: str):
            async with semaphore:
                try:
                    data = await self.fetch_spotify_data(spotify_id)
                    progress.advance(1)
                    return data
                except Exception as e:
                    logging.error(f"Failed to fetch {spotify_id}: {e}")
                    progress.advance(1)
                    return {}
        
        tasks = [fetch_with_semaphore(sid) for sid in spotify_ids]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Filter out exceptions
        return [r for r in results if isinstance(r, dict) and r]

async def main():
    parser = argparse.ArgumentParser(description='Spotify Metadata Fetcher v3.5')
    parser.add_argument('--input', default='data3_enriched.csv', help='Input CSV file')
    parser.add_argument('--start', type=int, default=0, help='Start row index')
    parser.add_argument('--end', type=int, help='End row index')
    parser.add_argument('--output', default='data3.5_spotify_extras.csv', help='Output CSV file')
    parser.add_argument('--test', action='store_true', help='Test mode (100 rows)')
    parser.add_argument('--client-id', required=True, help='Spotify Client ID')
    parser.add_argument('--client-secret', required=True, help='Spotify Client Secret')
    
    args = parser.parse_args()
    
    # Load input data
    console.print("📊 Loading input data...")
    df = pd.read_csv(args.input, low_memory=False, dtype=str)
    
    # Filter to work range
    if args.end:
        df = df.iloc[args.start:args.end]
    else:
        df = df.iloc[args.start:]
    
    # Test mode
    if args.test:
        df = df.head(100)
        console.print("🧪 TEST MODE: Processing 100 rows")
    
    # Get Spotify IDs or resolve via search if missing
    spotify_ids: List[str] = []
    if 'spotify_song_id' in df.columns:
        col = df['spotify_song_id'].astype(str).str.strip()
        spotify_ids = [sid for sid in col.tolist() if sid and sid.lower() != 'nan']
    if not spotify_ids and {'artist_name','song_name'}.issubset(set(df.columns)):
        console.print("🔎 No track ids present. Resolving via search (artist_name + song_name)...")
        # Resolve ids sequentially to stay safe with older hardware
        config = SpotifyConfig(args.client_id, args.client_secret)
        async with SpotifyMetadataFetcher(config) as fetcher_for_search:
            resolved: List[str] = []
            for _, row in df[['artist_name','song_name']].fillna('').itertuples():
                # Note: itertuples yields Index then fields; avoid unpack mismatch
                pass
        # Fallback: simple loop with iterrows
        config = SpotifyConfig(args.client_id, args.client_secret)
        async with SpotifyMetadataFetcher(config) as fetcher_for_search:
            resolved: List[str] = []
            for _, r in df.iterrows():
                aid = await fetcher_for_search.search_track_id(str(r.get('artist_name','')), str(r.get('song_name','')))
                if aid:
                    resolved.append(aid)
            spotify_ids = list(dict.fromkeys(resolved))
    console.print(f"🎵 Processing {len(spotify_ids)} unique Spotify tracks")
    
    # Initialize fetcher
    config = SpotifyConfig(args.client_id, args.client_secret)
    
    async with SpotifyMetadataFetcher(config) as fetcher:
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            BarColumn(),
            TextColumn("[progress.percentage]{task.percentage:>3.0f}%"),
            TimeElapsedColumn(),
            console=console
        ) as progress:
            
            task = progress.add_task("Fetching Spotify metadata...", total=len(spotify_ids))
            
            # Process in chunks
            chunk_size = 50
            all_results = []
            
            for i in range(0, len(spotify_ids), chunk_size):
                chunk = spotify_ids[i:i+chunk_size]
                results = await fetcher.process_chunk(chunk, progress)
                all_results.extend(results)
                
                # Save progress every 1000 tracks
                if len(all_results) % 1000 == 0:
                    temp_df = pd.DataFrame(all_results)
                    temp_df.to_csv(f"{args.output}.temp", index=False)
                    console.print(f"💾 Progress saved: {len(all_results)} tracks processed")
    
    # Save final results
    console.print("💾 Saving final results...")
    final_df = pd.DataFrame(all_results)
    final_df.to_csv(args.output, index=False)
    
    console.print(f"✅ COMPLETE! Processed {len(all_results)} tracks")
    console.print(f"📁 Output: {args.output}")
    if spotify_ids:
        console.print(f"📊 Success rate: {len(all_results)/len(spotify_ids)*100:.1f}%")
    else:
        console.print("📊 Success rate: N/A (no input track ids)")

if __name__ == "__main__":
    asyncio.run(main()) 