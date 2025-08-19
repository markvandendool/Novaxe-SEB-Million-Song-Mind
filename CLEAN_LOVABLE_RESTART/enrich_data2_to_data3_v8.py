#!/usr/bin/env python3
"""
VIPER 2.0 - Enhanced Data2 to Data3 Enrichment Script
======================================================

Industrial-scale conversion with advanced features:
- Exponential backoff API resilience
- Confidence-scored key detection
- Enhanced Roman numeral analysis
- Per-row status tracking
- Comprehensive error handling
- Chroma vector module (commented for future data4)
- Exact data3 structure compliance

Author: VIPER 2.0 Enhanced
Version: 8.0
License: MIT
"""

import pandas as pd
import numpy as np
import re
import json
import time
import asyncio
import aiohttp
from collections import Counter
from typing import Dict, List, Optional, Tuple, Any, Union
from dataclasses import dataclass
import logging
import argparse
from pathlib import Path
import random
import hashlib
from datetime import datetime, timedelta

# Configure enhanced logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('viper_enrichment.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# =====================================================================================
# ENHANCED CONFIGURATION
# =====================================================================================

@dataclass
class Config:
    """Enhanced configuration for VIPER 2.0."""
    
    # Spotify API credentials
    spotify_client_id: str = "fe078534288e4a8f95c41a189e9cc493"
    spotify_client_secret: str = "26dcec68d1bc4ad3b2e9c72709da77cc"
    
    # Processing settings
    batch_size: int = 50
    max_retries: int = 5
    api_timeout: int = 30
    cache_file: str = "spotify_cache_v8.json"
    
    # Enhanced API resilience
    exponential_backoff_base: float = 2.0
    exponential_backoff_max: float = 60.0
    jitter_factor: float = 0.1
    
    # Key detection settings
    key_confidence_threshold: float = 0.3
    ambiguous_key_threshold: float = 0.1
    
    # Data3 structure requirements (unchanged)
    chord_types = [
        'I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°',  # Major diatonic
        'I7', 'iiiº', 'II(7)', '#ivø', 'III', '#vº', 'VI(7)', '#iø', 'VII(7)', '#iiø',  # Applied
        'i', 'iiø', 'bIII', 'iv', 'v', 'bVI', 'bVII', 'V(b9)', 'viiº',  # Minor diatonic
        'Other'  # Catch-all
    ]
    
    # Status tracking
    enable_status_tracking: bool = True
    output_failed_rows: bool = True
    
    # Validation settings
    validate_output: bool = True
    strict_mode: bool = False

# =====================================================================================
# ENHANCED MUSIC THEORY ENGINE
# =====================================================================================

class EnhancedMusicTheoryEngine:
    """Enhanced music theory analysis engine with confidence scoring."""
    
    CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    NOTE_TO_INDEX = {note: idx for idx, note in enumerate(CHROMATIC_NOTES)}
    
    # Enhanced diatonic relationships
    MAJOR_DIATONIC = {0: 'I', 2: 'ii', 4: 'iii', 5: 'IV', 7: 'V', 9: 'vi', 11: 'vii°'}
    MINOR_DIATONIC = {0: 'i', 2: 'ii°', 3: 'III', 5: 'iv', 7: 'v', 8: 'VI', 10: 'VII'}
    
    # Enhanced chord quality mapping
    CHORD_QUALITIES = {
        'maj': {'intervals': [0, 4, 7], 'symbol': '', 'weight': 1.0},
        'min': {'intervals': [0, 3, 7], 'symbol': 'm', 'weight': 1.0},
        'dim': {'intervals': [0, 3, 6], 'symbol': '°', 'weight': 0.8},
        'aug': {'intervals': [0, 4, 8], 'symbol': '+', 'weight': 0.8},
        'maj7': {'intervals': [0, 4, 7, 11], 'symbol': 'maj7', 'weight': 1.2},
        'min7': {'intervals': [0, 3, 7, 10], 'symbol': 'm7', 'weight': 1.2},
        'dom7': {'intervals': [0, 4, 7, 10], 'symbol': '7', 'weight': 1.2},
        'dim7': {'intervals': [0, 3, 6, 9], 'symbol': '°7', 'weight': 1.0},
        'min7b5': {'intervals': [0, 3, 6, 10], 'symbol': 'ø7', 'weight': 1.0},
        'maj9': {'intervals': [0, 4, 7, 11, 14], 'symbol': 'maj9', 'weight': 1.4},
        'min9': {'intervals': [0, 3, 7, 10, 14], 'symbol': 'm9', 'weight': 1.4},
        'dom9': {'intervals': [0, 4, 7, 10, 14], 'symbol': '9', 'weight': 1.4},
        'dom7b9': {'intervals': [0, 4, 7, 10, 13], 'symbol': '7b9', 'weight': 1.3},
        'dom7#9': {'intervals': [0, 4, 7, 10, 15], 'symbol': '7#9', 'weight': 1.3},
        'dom7alt': {'intervals': [0, 4, 7, 10, 13, 15, 20], 'symbol': '7alt', 'weight': 1.5}
    }
    
    @staticmethod
    def parse_chord_advanced(chord_str: str) -> Optional[Dict[str, Any]]:
        """Enhanced chord parsing with better error handling."""
        if not chord_str or not isinstance(chord_str, str):
            return None
        
        # Enhanced regex for complex chord parsing
        pattern = r'^([A-G][b#]?)' \
                 r'(maj|min|dim|aug|m|°|\+)?' \
                 r'(\d+)?' \
                 r'([b#]\d+|add\d+|sus[24]?|alt)?' \
                 r'(/([A-G][b#]?))?$'
                 
        match = re.match(pattern, chord_str.strip())
        if not match:
            return None
            
        root, quality, extension, alteration, _, bass = match.groups()
        
        # Normalize root note
        root = root.replace('b', '#') if 'b' in root else root
        
        # Enhanced quality mapping
        quality_map = {
            'maj': 'maj', 'min': 'min', 'm': 'min',
            'dim': 'dim', '°': 'dim', 'aug': 'aug', '+': 'aug'
        }
        base_quality = quality_map.get(quality, 'maj')
        
        # Build full chord type
        chord_type = base_quality
        if extension:
            chord_type += extension
        if alteration:
            chord_type += alteration
            
        return {
            'root': root,
            'quality': chord_type,
            'bass': bass,
            'intervals': EnhancedMusicTheoryEngine._get_chord_intervals(chord_type),
            'chord_str': chord_str,
            'weight': EnhancedMusicTheoryEngine.CHORD_QUALITIES.get(chord_type, {}).get('weight', 1.0)
        }
    
    @staticmethod
    def _get_chord_intervals(chord_type: str) -> List[int]:
        """Get interval structure for chord type."""
        if chord_type in EnhancedMusicTheoryEngine.CHORD_QUALITIES:
            return EnhancedMusicTheoryEngine.CHORD_QUALITIES[chord_type]['intervals']
        return [0, 4, 7]  # Default to major triad
    
    @staticmethod
    def detect_key_enhanced(chord_sequence: List[str]) -> Tuple[str, bool, float, bool, List[Tuple[str, float]]]:
        """Enhanced key detection with confidence scoring and ambiguity detection."""
        if not chord_sequence:
            return 'C', True, 0.0, False, []
        
        # Extract weighted pitch class profile
        pitch_classes = np.zeros(12)
        total_weight = 0
        
        for chord_str in chord_sequence:
            parsed = EnhancedMusicTheoryEngine.parse_chord_advanced(chord_str)
            if parsed:
                root_idx = EnhancedMusicTheoryEngine.NOTE_TO_INDEX[parsed['root']]
                weight = parsed.get('weight', 1.0)
                
                pitch_classes[root_idx] += weight
                total_weight += weight
                
                # Add chord tones with weight
                for interval in parsed['intervals']:
                    note_idx = (root_idx + interval) % 12
                    pitch_classes[note_idx] += weight * 0.5
        
        # Normalize
        if total_weight > 0:
            pitch_classes = pitch_classes / total_weight
        
        # Enhanced Krumhansl-Schmuckler key profiles
        major_profile = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
        minor_profile = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])
        
        # Calculate correlations with key profiles
        key_scores = []
        
        for tonic in range(12):
            # Major key correlation
            major_shifted = np.roll(major_profile, tonic)
            major_corr = np.corrcoef(pitch_classes, major_shifted)[0, 1]
            if np.isnan(major_corr):
                major_corr = 0
            key_scores.append(('major', tonic, major_corr))
            
            # Minor key correlation
            minor_shifted = np.roll(minor_profile, tonic)
            minor_corr = np.corrcoef(pitch_classes, minor_shifted)[0, 1]
            if np.isnan(minor_corr):
                minor_corr = 0
            key_scores.append(('minor', tonic, minor_corr))
        
        # Sort by correlation score
        key_scores.sort(key=lambda x: x[2], reverse=True)
        
        # Find best match
        best_mode, best_tonic, best_score = key_scores[0]
        key_name = EnhancedMusicTheoryEngine.CHROMATIC_NOTES[best_tonic]
        is_major = best_mode == 'major'
        confidence = max(0, best_score)  # Ensure non-negative
        
        # Check for ambiguity
        is_ambiguous = False
        if len(key_scores) > 1:
            second_best_score = key_scores[1][2]
            if best_score - second_best_score < 0.1:  # Close scores indicate ambiguity
                is_ambiguous = True
        
        # Return top 3 candidates for reference
        top_candidates = []
        for mode, tonic, score in key_scores[:3]:
            key_candidate = EnhancedMusicTheoryEngine.CHROMATIC_NOTES[tonic]
            top_candidates.append((f"{key_candidate}{'maj' if mode == 'major' else 'min'}", score))
        
        return key_name, is_major, confidence, is_ambiguous, top_candidates
    
    @staticmethod
    def assign_roman_numerals_enhanced(chord_sequence: List[str], key: str, is_major: bool) -> List[Dict[str, Any]]:
        """Enhanced Roman numeral assignment with confidence and alternatives."""
        romans = []
        key_idx = EnhancedMusicTheoryEngine.NOTE_TO_INDEX[key]
        scale_degrees = (EnhancedMusicTheoryEngine.MAJOR_DIATONIC if is_major 
                        else EnhancedMusicTheoryEngine.MINOR_DIATONIC)
        
        for chord_str in chord_sequence:
            if chord_str.startswith('<'):
                romans.append({
                    'roman': chord_str,
                    'confidence': 1.0,
                    'alternatives': [],
                    'is_section_marker': True
                })
                continue
                
            parsed = EnhancedMusicTheoryEngine.parse_chord_advanced(chord_str)
            if not parsed:
                romans.append({
                    'roman': '?',
                    'confidence': 0.0,
                    'alternatives': [],
                    'is_section_marker': False
                })
                continue
            
            root_idx = EnhancedMusicTheoryEngine.NOTE_TO_INDEX[parsed['root']]
            degree = (root_idx - key_idx) % 12
            
            # Primary Roman numeral
            if degree in scale_degrees:
                roman = scale_degrees[degree]
                confidence = 0.9
            else:
                # Handle chromatic chords
                roman = f"b{degree + 1}" if degree > 6 else f"#{degree + 1}"
                confidence = 0.7
            
            # Add quality indicators
            if 'dim' in parsed['quality']:
                roman += '°'
            elif 'aug' in parsed['quality']:
                roman += '+'
            elif any(ext in parsed['quality'] for ext in ['7', '9', '11', '13']):
                roman += '7' if '7' in parsed['quality'] else parsed['quality'][-1]
            
            # Generate alternatives for ambiguous cases
            alternatives = []
            if confidence < 0.8:
                # Try different interpretations
                if '7' in parsed['quality']:
                    alternatives.append(roman.replace('7', ''))
                if roman.endswith('°'):
                    alternatives.append(roman.replace('°', 'm'))
            
            romans.append({
                'roman': roman,
                'confidence': confidence,
                'alternatives': alternatives,
                'is_section_marker': False
            })
        
        return romans
    
    @staticmethod
    def generate_harmonic_fingerprint_enhanced(chord_sequence: List[str], key: str) -> str:
        """Enhanced harmonic fingerprint using improved HUV format."""
        if not chord_sequence or not key:
            return ""
        
        key_idx = EnhancedMusicTheoryEngine.NOTE_TO_INDEX[key]
        huv_vectors = []
        
        for chord_str in chord_sequence:
            if chord_str.startswith('<'):
                huv_vectors.append(chord_str)
                continue
                
            parsed = EnhancedMusicTheoryEngine.parse_chord_advanced(chord_str)
            if not parsed:
                huv_vectors.append("0,0,0,0,0,0,0,0,0,0,0,0")
                continue
            
            root_idx = EnhancedMusicTheoryEngine.NOTE_TO_INDEX[parsed['root']]
            degree = (root_idx - key_idx) % 12
            
            # Enhanced HUV vector with weighted values
            huv = [0] * 12
            quality = parsed['quality']
            weight = parsed.get('weight', 1.0)
            
            if quality in ['maj', 'dom7', 'maj7', 'maj9']:
                huv[degree] = weight  # Root
                huv[(degree + 4) % 12] = weight * 0.8  # Major third
                huv[(degree + 7) % 12] = weight * 0.6  # Fifth
                if '7' in quality:
                    huv[(degree + 10) % 12] = weight * 0.7  # Minor seventh
                elif '9' in quality:
                    huv[(degree + 14) % 12] = weight * 0.5  # Ninth
            elif quality in ['min', 'min7', 'min9']:
                huv[degree] = weight  # Root
                huv[(degree + 3) % 12] = weight * 0.8  # Minor third
                huv[(degree + 7) % 12] = weight * 0.6  # Fifth
                if '7' in quality:
                    huv[(degree + 10) % 12] = weight * 0.7  # Minor seventh
                elif '9' in quality:
                    huv[(degree + 14) % 12] = weight * 0.5  # Ninth
            elif 'dim' in quality:
                huv[degree] = weight
                huv[(degree + 3) % 12] = weight * 0.8
                huv[(degree + 6) % 12] = weight * 0.6
            elif 'aug' in quality:
                huv[degree] = weight
                huv[(degree + 4) % 12] = weight * 0.8
                huv[(degree + 8) % 12] = weight * 0.6
            else:
                # Default to root and fifth
                huv[degree] = weight
                huv[(degree + 7) % 12] = weight * 0.6
            
            # Normalize to 0-1 range
            max_val = max(huv)
            if max_val > 0:
                huv = [v / max_val for v in huv]
            
            huv_vectors.append(','.join(f"{v:.3f}" for v in huv))
        
        return ' | '.join(huv_vectors)
    
    @staticmethod
    def detect_key_final_boss(chord_sequence: List[str], config: Config) -> Tuple[str, bool, float, float, str]:
        """Final Boss key selector: choose key that minimizes Other count.
        
        This is the ultimate key detection algorithm that prioritizes musical interpretability
        over statistical correlation by selecting the key that results in the fewest 
        "Other" (unclassified) chords in the harmonic analysis.
        
        Returns: (key_name, is_major, ks_confidence, other_rate, chosen_by)
        """
        if not chord_sequence:
            return 'C', True, 0.0, 1.0, 'final_boss'
            
        # Get baseline KS scores for tiebreaking
        baseline_key, baseline_major, baseline_confidence, _, _ = EnhancedMusicTheoryEngine.detect_key_enhanced(chord_sequence)
        
        # Track best candidate
        best = {
            "key": "C",
            "is_major": True,
            "ks": 0.0,
            "other_count": float("inf"),
            "total_chords": 0,
            "other_rate": 1.0
        }
        
        # Evaluate all 24 keys
        chromatic_notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        
        for tonic_idx in range(12):
            for is_major in [True, False]:
                key_name = chromatic_notes[tonic_idx]
                
                # Get Roman numeral analysis for this key
                romans = EnhancedMusicTheoryEngine.assign_roman_numerals_enhanced(
                    chord_sequence, key_name, is_major
                )
                
                # Count occurrences in each category
                chord_counts = {chord_type: 0 for chord_type in config.chord_types}
                total_tokens = 0
                
                for roman_entry in romans:
                    roman = roman_entry['roman']
                    if roman.startswith('<'):  # Skip section markers
                        continue
                        
                    total_tokens += 1
                    
                    # Map roman numeral to chord type
                    if roman in chord_counts:
                        chord_counts[roman] += 1
                    else:
                        # Try to map complex romans to basic types
                        mapped = EnhancedMusicTheoryEngine._map_roman_to_chord_type(roman)
                        if mapped in chord_counts:
                            chord_counts[mapped] += 1
                        else:
                            chord_counts['Other'] += 1
                
                other_count = chord_counts['Other']
                other_rate = (other_count / total_tokens) if total_tokens > 0 else 1.0
                
                # Calculate KS score for this key for tiebreaking
                ks_score = 0.0
                if key_name == baseline_key and is_major == baseline_major:
                    ks_score = baseline_confidence
                
                # Determine if this candidate is better
                # Priority: 1) Minimize Other count, 2) Minimize Other rate, 3) Maximize KS score
                is_better = False
                if other_count < best["other_count"]:
                    is_better = True
                elif other_count == best["other_count"]:
                    if other_rate < best["other_rate"]:
                        is_better = True
                    elif abs(other_rate - best["other_rate"]) < 1e-9:
                        if ks_score > best["ks"]:
                            is_better = True
                
                if is_better:
                    best.update({
                        "key": key_name,
                        "is_major": is_major,
                        "ks": ks_score,
                        "other_count": other_count,
                        "total_chords": total_tokens,
                        "other_rate": other_rate
                    })
        
        logger.info(f"Final Boss selected {best['key']} {'major' if best['is_major'] else 'minor'} "
                   f"(Other: {best['other_count']}/{best['total_chords']}, rate: {best['other_rate']:.3f})")
        
        return best["key"], best["is_major"], best["ks"], best["other_rate"], "final_boss"
    
    @staticmethod
    def _map_roman_to_chord_type(roman: str) -> str:
        """Map complex roman numerals to basic chord types."""
        # Remove quality indicators for mapping
        clean_roman = roman.replace('°', '').replace('ø', '').replace('7', '').replace('+', '')
        clean_roman = re.sub(r'\([^)]*\)', '', clean_roman)  # Remove parentheses content
        clean_roman = clean_roman.replace('#', '').replace('b', '')  # Remove accidentals for now
        
        # Basic mapping - this could be expanded
        basic_mapping = {
            'I': 'I', 'i': 'i',
            'II': 'II(7)', 'ii': 'ii', 
            'III': 'III', 'iii': 'iii',
            'IV': 'IV', 'iv': 'iv',
            'V': 'V', 'v': 'v',
            'VI': 'VI(7)', 'vi': 'vi',
            'VII': 'VII(7)', 'vii': 'viiº'
        }
        
        return basic_mapping.get(clean_roman, 'Other')

# =====================================================================================
# CHROMA VECTOR MODULE (COMMENTED FOR FUTURE DATA4)
# =====================================================================================

"""
# CHROMA VECTOR MODULE - FOR FUTURE DATA4 IMPLEMENTATION
# This module will be used when we have audio/MIDI data sources
# Currently commented out as it cannot be extracted from chord symbols alone

class ChromaVectorAnalyzer:
    def __init__(self):
        self.chroma_bins = 12
        self.sample_rate = 22050
        self.hop_length = 512
    
    def extract_chroma_features(self, audio_path: str) -> np.ndarray:
        # Extract chroma features from audio
        # This requires librosa or essentia for audio analysis
        pass
    
    def generate_chroma_fingerprint(self, audio_data: np.ndarray) -> str:
        # Generate chroma-based harmonic fingerprint
        # Returns 12-dimensional chroma vector
        pass
    
    def analyze_voice_leading(self, chroma_sequence: List[np.ndarray]) -> Dict[str, float]:
        # Analyze voice leading between chroma vectors
        # Returns smoothness, contrary motion, parallel motion metrics
        pass

# USAGE EXAMPLE (for future data4):
# chroma_analyzer = ChromaVectorAnalyzer()
# chroma_features = chroma_analyzer.extract_chroma_features("song.wav")
# chroma_fingerprint = chroma_analyzer.generate_chroma_fingerprint(chroma_features)
# voice_leading = chroma_analyzer.analyze_voice_leading(chroma_sequence)
"""

# =====================================================================================
# ENHANCED SPOTIFY API CLIENT
# =====================================================================================

class EnhancedSpotifyClient:
    """Enhanced Spotify API client with exponential backoff and comprehensive error handling."""
    
    def __init__(self, config: Config):
        self.config = config
        self.session = None
        self._token = None
        self._token_expires = 0
        self.cache = self._load_cache()
        self.request_count = 0
        self.error_count = 0
        self.last_request_time = 0
    
    def _load_cache(self) -> Dict[str, Any]:
        """Load cached Spotify data with enhanced error handling."""
        try:
            with open(self.config.cache_file, 'r') as f:
                cache_data = json.load(f)
                logger.info(f"Loaded {len(cache_data)} cached entries")
                return cache_data
        except FileNotFoundError:
            logger.info("No cache file found, starting fresh")
            return {}
        except json.JSONDecodeError:
            logger.warning("Corrupted cache file, starting fresh")
            return {}
    
    def _save_cache(self):
        """Save cached Spotify data with error handling."""
        try:
            with open(self.config.cache_file, 'w') as f:
                json.dump(self.cache, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save cache: {e}")
    
    def _calculate_backoff(self, attempt: int) -> float:
        """Calculate exponential backoff with jitter."""
        backoff = min(
            self.config.exponential_backoff_base ** attempt,
            self.config.exponential_backoff_max
        )
        jitter = random.uniform(0, self.config.jitter_factor * backoff)
        return backoff + jitter
    
    async def _rate_limit_delay(self):
        """Implement rate limiting to respect API limits."""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        
        # Ensure minimum delay between requests
        min_delay = 0.1  # 100ms between requests
        if time_since_last < min_delay:
            await asyncio.sleep(min_delay - time_since_last)
        
        self.last_request_time = time.time()
    
    async def _get_token(self) -> str:
        """Get valid access token with retry logic."""
        if self._token and time.time() < self._token_expires:
            return self._token
        
        # Request new token with exponential backoff
        for attempt in range(self.config.max_retries):
            try:
                import base64
                
                credentials = f"{self.config.spotify_client_id}:{self.config.spotify_client_secret}"
                encoded_credentials = base64.b64encode(credentials.encode()).decode()
                
                async with aiohttp.ClientSession() as session:
                    response = await session.post(
                        "https://accounts.spotify.com/api/token",
                        headers={"Authorization": f"Basic {encoded_credentials}"},
                        data={"grant_type": "client_credentials"},
                        timeout=self.config.api_timeout
                    )
                    
                    response.raise_for_status()
                    token_data = await response.json()
                    
                    self._token = token_data["access_token"]
                    self._token_expires = time.time() + token_data["expires_in"] - 300  # 5min buffer
                    
                    logger.info("Successfully obtained Spotify access token")
                    return self._token
                    
            except Exception as e:
                logger.warning(f"Token request attempt {attempt + 1} failed: {e}")
                if attempt < self.config.max_retries - 1:
                    backoff = self._calculate_backoff(attempt)
                    logger.info(f"Retrying token request in {backoff:.2f} seconds")
                    await asyncio.sleep(backoff)
                else:
                    raise Exception(f"Failed to obtain Spotify token after {self.config.max_retries} attempts")
    
    async def _make_api_request(self, url: str, headers: Dict[str, str]) -> Optional[Dict[str, Any]]:
        """Make API request with exponential backoff and comprehensive error handling."""
        for attempt in range(self.config.max_retries):
            try:
                await self._rate_limit_delay()
                
                async with aiohttp.ClientSession() as session:
                    response = await session.get(
                        url,
                        headers=headers,
                        timeout=self.config.api_timeout
                    )
                    
                    self.request_count += 1
                    
                    if response.status == 200:
                        return await response.json()
                    elif response.status == 429:  # Rate limited
                        retry_after = int(response.headers.get('Retry-After', 60))
                        logger.warning(f"Rate limited, waiting {retry_after} seconds")
                        await asyncio.sleep(retry_after)
                        continue
                    elif response.status == 401:  # Unauthorized
                        logger.warning("Token expired, refreshing...")
                        self._token = None
                        headers["Authorization"] = f"Bearer {await self._get_token()}"
                        continue
                    else:
                        logger.warning(f"API request failed with status {response.status}")
                        self.error_count += 1
                        
            except asyncio.TimeoutError:
                logger.warning(f"Request timeout on attempt {attempt + 1}")
                self.error_count += 1
            except Exception as e:
                logger.warning(f"Request error on attempt {attempt + 1}: {e}")
                self.error_count += 1
            
            if attempt < self.config.max_retries - 1:
                backoff = self._calculate_backoff(attempt)
                logger.info(f"Retrying request in {backoff:.2f} seconds")
                await asyncio.sleep(backoff)
        
        return None
    
    async def get_artist_info(self, artist_id: str) -> Optional[Dict[str, str]]:
        """Get artist information with enhanced error handling."""
        cache_key = f"artist_{artist_id}"
        
        # Check cache first
        if cache_key in self.cache:
            return self.cache[cache_key]
        
        try:
            token = await self._get_token()
            headers = {"Authorization": f"Bearer {token}"}
            
            url = f"https://api.spotify.com/v1/artists/{artist_id}"
            data = await self._make_api_request(url, headers)
            
            if data:
                artist_info = {
                    'name': data.get('name', 'Unknown'),
                    'url': data.get('external_urls', {}).get('spotify', ''),
                    'genres': ','.join(data.get('genres', [])),
                    'popularity': data.get('popularity', 0)
                }
                
                # Cache the result
                self.cache[cache_key] = artist_info
                return artist_info
            else:
                logger.warning(f"Failed to get artist info for {artist_id}")
                return None
                
        except Exception as e:
            logger.error(f"Error getting artist info for {artist_id}: {e}")
            return None
    
    async def get_track_info(self, track_id: str) -> Optional[Dict[str, str]]:
        """Get track information with enhanced error handling."""
        cache_key = f"track_{track_id}"
        
        # Check cache first
        if cache_key in self.cache:
            return self.cache[cache_key]
        
        try:
            token = await self._get_token()
            headers = {"Authorization": f"Bearer {token}"}
            
            url = f"https://api.spotify.com/v1/tracks/{track_id}"
            data = await self._make_api_request(url, headers)
            
            if data:
                track_info = {
                    'name': data.get('name', 'Unknown'),
                    'url': data.get('external_urls', {}).get('spotify', ''),
                    'duration_ms': data.get('duration_ms', 0),
                    'popularity': data.get('popularity', 0),
                    'album': data.get('album', {}).get('name', 'Unknown')
                }
                
                # Cache the result
                self.cache[cache_key] = track_info
                return track_info
            else:
                logger.warning(f"Failed to get track info for {track_id}")
                return None
                
        except Exception as e:
            logger.error(f"Error getting track info for {track_id}: {e}")
            return None
    
    async def batch_get_metadata(self, df: pd.DataFrame) -> pd.DataFrame:
        """Batch get Spotify metadata with enhanced error handling and status tracking."""
        logger.info("Starting enhanced Spotify metadata enrichment...")
        
        # Initialize status tracking
        if self.config.enable_status_tracking:
            df['spotify_status'] = 'pending'
            df['spotify_errors'] = ''
        
        # Create tasks for all API calls
        tasks = []
        for idx, row in df.iterrows():
            if pd.notna(row.get('spotify_artist_id')):
                tasks.append((idx, 'artist', row['spotify_artist_id']))
            if pd.notna(row.get('spotify_song_id')):
                tasks.append((idx, 'track', row['spotify_song_id']))
        
        logger.info(f"Created {len(tasks)} metadata tasks")
        
        # Process in batches
        successful_requests = 0
        failed_requests = 0
        
        for i in range(0, len(tasks), self.config.batch_size):
            batch = tasks[i:i + self.config.batch_size]
            
            # Create async tasks
            async_tasks = []
            for idx, metadata_type, id_value in batch:
                if metadata_type == 'artist':
                    task = self.get_artist_info(id_value)
                else:
                    task = self.get_track_info(id_value)
                async_tasks.append((idx, metadata_type, task))
            
            # Execute batch
            for idx, metadata_type, task in async_tasks:
                try:
                    result = await task
                    if result:
                        if metadata_type == 'artist':
                            df.at[idx, 'artist_name'] = result['name']
                            df.at[idx, 'artist_url'] = result['url']
                            df.at[idx, 'artist_genres'] = result.get('genres', '')
                            df.at[idx, 'artist_popularity'] = result.get('popularity', 0)
                        else:
                            df.at[idx, 'song_name'] = result['name']
                            df.at[idx, 'song_url'] = result['url']
                            df.at[idx, 'song_duration'] = result.get('duration_ms', 0)
                            df.at[idx, 'song_popularity'] = result.get('popularity', 0)
                            df.at[idx, 'album_name'] = result.get('album', '')
                        
                        if self.config.enable_status_tracking:
                            df.at[idx, 'spotify_status'] = 'success'
                        successful_requests += 1
                    else:
                        if self.config.enable_status_tracking:
                            df.at[idx, 'spotify_status'] = 'failed'
                            df.at[idx, 'spotify_errors'] = f'{metadata_type}_not_found'
                        failed_requests += 1
                        
                except Exception as e:
                    if self.config.enable_status_tracking:
                        df.at[idx, 'spotify_status'] = 'error'
                        df.at[idx, 'spotify_errors'] = str(e)[:100]  # Truncate long errors
                    failed_requests += 1
                    logger.error(f"Error processing {metadata_type} {idx}: {e}")
            
            # Save cache periodically
            if i % (self.config.batch_size * 5) == 0:
                self._save_cache()
                logger.info(f"Processed {i + len(batch)} of {len(tasks)} metadata requests")
                logger.info(f"Success: {successful_requests}, Failed: {failed_requests}")
        
        # Final cache save
        self._save_cache()
        
        # Log final statistics
        logger.info("Enhanced Spotify metadata enrichment complete")
        logger.info(f"Total requests: {self.request_count}")
        logger.info(f"Successful requests: {successful_requests}")
        logger.info(f"Failed requests: {failed_requests}")
        logger.info(f"Error rate: {failed_requests/(successful_requests+failed_requests)*100:.1f}%" if (successful_requests+failed_requests) > 0 else "No requests made")
        
        return df

# =====================================================================================
# ENHANCED DATA3 CONVERSION ENGINE
# =====================================================================================

class EnhancedData3Converter:
    """Enhanced data3 converter with comprehensive error handling and status tracking."""
    
    def __init__(self, config: Config):
        self.config = config
        self.music_theory = EnhancedMusicTheoryEngine()
        self.spotify_client = EnhancedSpotifyClient(config)
        self.processing_stats = {
            'total_songs': 0,
            'successful_conversions': 0,
            'failed_conversions': 0,
            'partial_conversions': 0,
            'errors': []
        }
    
    def extract_chord_sequence(self, chords_str: str) -> List[str]:
        """Extract chord sequence from CPML format with enhanced parsing."""
        if not chords_str or not isinstance(chords_str, str):
            return []
        
        try:
            # Enhanced regex for section and chord extraction
            sections = re.findall(r'(<[^>]+>|[\w#b°/]+)', chords_str)
            return [section.strip() for section in sections if section.strip()]
        except Exception as e:
            logger.error(f"Error extracting chord sequence: {e}")
            return []
    
    def analyze_harmonic_profile_enhanced(self, chord_sequence: List[str]) -> Dict[str, Any]:
        """Enhanced harmonic profile analysis with confidence scoring."""
        if not chord_sequence:
            return {
                'key': 'unknown',
                'key_confidence': 0.0,
                'is_ambiguous': False,
                'key_candidates': [],
                'roman_numerals': '',
                'roman_confidence': 0.0,
                'harmonic_fingerprint': '',
                'chord_counts': {chord: 0 for chord in self.config.chord_types},
                'analysis_quality': 'poor'
            }
        
        try:
            # Final Boss key detection - minimizes Other chord classifications
            key, is_major, ks_confidence, other_rate, chosen_by = self.music_theory.detect_key_final_boss(chord_sequence, self.config)
            
            # Also get enhanced detection for comparison and ambiguity check
            _, _, confidence, is_ambiguous, key_candidates = self.music_theory.detect_key_enhanced(chord_sequence)
            
            # Enhanced Roman numeral analysis
            roman_analysis = self.music_theory.assign_roman_numerals_enhanced(chord_sequence, key, is_major)
            roman_str = ' '.join([r['roman'] for r in roman_analysis])
            
            # Calculate average Roman numeral confidence
            roman_confidences = [r['confidence'] for r in roman_analysis if not r['is_section_marker']]
            avg_roman_confidence = sum(roman_confidences) / len(roman_confidences) if roman_confidences else 0.0
            
            # Generate enhanced harmonic fingerprint
            harmonic_fingerprint = self.music_theory.generate_harmonic_fingerprint_enhanced(chord_sequence, key)
            
            # Count chord types with enhanced accuracy
            chord_counts = {chord: 0 for chord in self.config.chord_types}
            for roman_analysis_item in roman_analysis:
                roman = roman_analysis_item['roman']
                if roman in chord_counts:
                    chord_counts[roman] += 1
                elif not roman_analysis_item['is_section_marker']:
                    chord_counts['Other'] += 1
            
            # Determine analysis quality
            analysis_quality = 'excellent'
            if confidence < 0.5 or avg_roman_confidence < 0.7:
                analysis_quality = 'poor'
            elif confidence < 0.7 or avg_roman_confidence < 0.8:
                analysis_quality = 'fair'
            elif confidence < 0.9 or avg_roman_confidence < 0.9:
                analysis_quality = 'good'
            
            return {
                'key': key,
                'key_confidence': confidence,
                'is_ambiguous': is_ambiguous,
                'key_candidates': key_candidates,
                'roman_numerals': roman_str,
                'roman_confidence': avg_roman_confidence,
                'harmonic_fingerprint': harmonic_fingerprint,
                'chord_counts': chord_counts,
                'analysis_quality': analysis_quality,
                # Final Boss audit columns
                'chosen_by': chosen_by,
                'other_rate': other_rate,
                'ks_score': ks_confidence
            }
            
        except Exception as e:
            logger.error(f"Error in harmonic profile analysis: {e}")
            return {
                'key': 'unknown',
                'key_confidence': 0.0,
                'is_ambiguous': False,
                'key_candidates': [],
                'roman_numerals': '',
                'roman_confidence': 0.0,
                'harmonic_fingerprint': '',
                'chord_counts': {chord: 0 for chord in self.config.chord_types},
                'analysis_quality': 'error',
                # Final Boss audit columns (error case)
                'chosen_by': 'error',
                'other_rate': 1.0,
                'ks_score': 0.0
            }
    
    def validate_data3_structure(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Validate data3 structure and report issues."""
        validation_results = {
            'is_valid': True,
            'missing_columns': [],
            'empty_columns': [],
            'data_type_issues': [],
            'warnings': []
        }
        
        # Required columns for data3
        required_columns = [
            'id', 'chords', 'release_date', 'genres', 'decade', 'rock_genre',
            'artist_id', 'main_genre', 'spotify_song_id', 'spotify_artist_id',
            'artist_name', 'artist_url', 'song_name', 'song_url',
            'key', 'roman_numerals', 'harmonic_fingerprint'
        ] + self.config.chord_types
        
        # Check for missing columns
        for col in required_columns:
            if col not in df.columns:
                validation_results['missing_columns'].append(col)
                validation_results['is_valid'] = False
        
        # Check for empty columns
        for col in df.columns:
            if df[col].isna().all():
                validation_results['empty_columns'].append(col)
                validation_results['warnings'].append(f"Column '{col}' is completely empty")
        
        # Check data types
        if 'id' in df.columns and not pd.api.types.is_numeric_dtype(df['id']):
            validation_results['data_type_issues'].append("'id' column should be numeric")
        
        return validation_results
    
    async def convert_data2_to_data3_enhanced(self, input_file: str, output_file: str) -> Dict[str, Any]:
        """Enhanced data2 to data3 conversion with comprehensive error handling."""
        logger.info(f"Starting enhanced conversion from {input_file} to {output_file}")
        
        start_time = time.time()
        
        try:
            # Load data2
            df = pd.read_csv(input_file)
            self.processing_stats['total_songs'] = len(df)
            logger.info(f"Loaded {len(df)} songs from data2")
            
            # Initialize enhanced columns
            df['key'] = ''
            df['key_confidence'] = 0.0
            df['is_ambiguous_key'] = False
            df['key_candidates'] = ''
            df['roman_numerals'] = ''
            df['roman_confidence'] = 0.0
            df['harmonic_fingerprint'] = ''
            df['analysis_quality'] = ''
            # Final Boss audit columns
            df['chosen_by'] = ''
            df['other_rate'] = 0.0
            df['ks_score'] = 0.0
            
            # Add chord type columns
            for chord_type in self.config.chord_types:
                df[chord_type] = 0
            
            # Initialize status tracking
            if self.config.enable_status_tracking:
                df['conversion_status'] = 'pending'
                df['conversion_errors'] = ''
                df['processing_time'] = 0.0
            
            # Enrich with Spotify metadata
            logger.info("Starting Spotify metadata enrichment...")
            df = await self.spotify_client.batch_get_metadata(df)
            
            # Process each song with enhanced error handling
            logger.info("Processing enhanced harmonic analysis...")
            for idx, row in df.iterrows():
                song_start_time = time.time()
                
                try:
                    chords_str = row.get('chords', '')
                    if not chords_str or pd.isna(chords_str):
                        if self.config.enable_status_tracking:
                            df.at[idx, 'conversion_status'] = 'skipped'
                            df.at[idx, 'conversion_errors'] = 'no_chords'
                        continue
                    
                    # Extract chord sequence
                    chord_sequence = self.extract_chord_sequence(chords_str)
                    if not chord_sequence:
                        if self.config.enable_status_tracking:
                            df.at[idx, 'conversion_status'] = 'failed'
                            df.at[idx, 'conversion_errors'] = 'no_valid_chords'
                        self.processing_stats['failed_conversions'] += 1
                        continue
                    
                    # Analyze harmonic profile
                    analysis = self.analyze_harmonic_profile_enhanced(chord_sequence)
                    
                    # Update DataFrame with enhanced data
                    df.at[idx, 'key'] = analysis['key']
                    df.at[idx, 'key_confidence'] = analysis['key_confidence']
                    df.at[idx, 'is_ambiguous_key'] = analysis['is_ambiguous']
                    df.at[idx, 'key_candidates'] = ';'.join([f"{k}:{v:.3f}" for k, v in analysis['key_candidates']])
                    df.at[idx, 'roman_numerals'] = analysis['roman_numerals']
                    df.at[idx, 'roman_confidence'] = analysis['roman_confidence']
                    df.at[idx, 'harmonic_fingerprint'] = analysis['harmonic_fingerprint']
                    df.at[idx, 'analysis_quality'] = analysis['analysis_quality']
                    # Final Boss audit columns
                    df.at[idx, 'chosen_by'] = analysis['chosen_by']
                    df.at[idx, 'other_rate'] = analysis['other_rate']
                    df.at[idx, 'ks_score'] = analysis['ks_score']
                    
                    # Update chord counts
                    for chord_type, count in analysis['chord_counts'].items():
                        df.at[idx, chord_type] = count
                    
                    # Update status tracking
                    if self.config.enable_status_tracking:
                        df.at[idx, 'conversion_status'] = 'success'
                        df.at[idx, 'processing_time'] = time.time() - song_start_time
                    
                    self.processing_stats['successful_conversions'] += 1
                    
                except Exception as e:
                    error_msg = str(e)[:200]  # Truncate long errors
                    logger.error(f"Error processing song {idx}: {error_msg}")
                    
                    if self.config.enable_status_tracking:
                        df.at[idx, 'conversion_status'] = 'error'
                        df.at[idx, 'conversion_errors'] = error_msg
                        df.at[idx, 'processing_time'] = time.time() - song_start_time
                    
                    self.processing_stats['failed_conversions'] += 1
                    self.processing_stats['errors'].append(f"Row {idx}: {error_msg}")
                    continue
                
                # Progress logging
                if idx % 1000 == 0:
                    logger.info(f"Processed {idx}/{self.processing_stats['total_songs']} songs")
                    logger.info(f"Success: {self.processing_stats['successful_conversions']}, "
                              f"Failed: {self.processing_stats['failed_conversions']}")
            
            # Ensure exact data3 column order
            data3_columns = [
                'id', 'chords', 'release_date', 'genres', 'decade', 'rock_genre',
                'artist_id', 'main_genre', 'spotify_song_id', 'spotify_artist_id',
                'artist_name', 'artist_url', 'song_name', 'song_url',
                'key', 'key_confidence', 'is_ambiguous_key', 'key_candidates',
                'roman_numerals', 'roman_confidence', 'harmonic_fingerprint', 'analysis_quality'
            ] + self.config.chord_types
            
            # Add status tracking columns if enabled
            if self.config.enable_status_tracking:
                data3_columns.extend(['conversion_status', 'conversion_errors', 'processing_time'])
                if 'spotify_status' in df.columns:
                    data3_columns.extend(['spotify_status', 'spotify_errors'])
            
            # Reorder columns to match data3 structure
            existing_columns = [col for col in data3_columns if col in df.columns]
            missing_columns = [col for col in data3_columns if col not in df.columns]
            
            # Add missing columns with default values
            for col in missing_columns:
                df[col] = ''
            
            # Reorder to exact data3 structure
            df = df[data3_columns]
            
            # Validate output structure
            if self.config.validate_output:
                validation_results = self.validate_data3_structure(df)
                if not validation_results['is_valid']:
                    logger.warning("Data3 structure validation issues:")
                    for issue in validation_results['missing_columns']:
                        logger.warning(f"  Missing column: {issue}")
                    for issue in validation_results['data_type_issues']:
                        logger.warning(f"  Data type issue: {issue}")
            
            # Save data3
            df.to_csv(output_file, index=False)
            
            # Save failed rows if requested
            if self.config.output_failed_rows and self.config.enable_status_tracking:
                failed_df = df[df['conversion_status'].isin(['failed', 'error'])]
                if len(failed_df) > 0:
                    failed_output = output_file.replace('.csv', '_failed.csv')
                    failed_df.to_csv(failed_output, index=False)
                    logger.info(f"Saved {len(failed_df)} failed rows to {failed_output}")
            
            # Calculate enhanced metrics
            processing_time = time.time() - start_time
            success_rate = self.processing_stats['successful_conversions'] / self.processing_stats['total_songs'] if self.processing_stats['total_songs'] > 0 else 0
            
            metrics = {
                'total_songs': self.processing_stats['total_songs'],
                'successful_conversions': self.processing_stats['successful_conversions'],
                'failed_conversions': self.processing_stats['failed_conversions'],
                'success_rate': success_rate,
                'processing_time': processing_time,
                'songs_per_second': self.processing_stats['total_songs'] / processing_time if processing_time > 0 else 0,
                'output_file': output_file,
                'validation_results': validation_results if self.config.validate_output else None
            }
            
            logger.info(f"Enhanced conversion complete: {metrics}")
            return metrics
            
        except Exception as e:
            logger.error(f"Conversion failed: {e}")
            raise 

# =====================================================================================
# ENHANCED COMMAND LINE INTERFACE
# =====================================================================================

def create_enhanced_parser() -> argparse.ArgumentParser:
    """Create enhanced command line argument parser."""
    parser = argparse.ArgumentParser(
        description="VIPER 2.0 - Enhanced Data2 to Data3 Enrichment Script",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python enrich_data2_to_data3_v8.py --input data2.csv --output data3.csv
  python enrich_data2_to_data3_v8.py --input chordonomicon_v2.csv --output data3_enhanced.csv --batch-size 100
  python enrich_data2_to_data3_v8.py --input data2.csv --output data3.csv --strict-mode --validate-output
        """
    )
    
    # Required arguments
    parser.add_argument(
        "--input", "-i",
        required=True,
        help="Input data2 CSV file path"
    )
    
    parser.add_argument(
        "--output", "-o",
        default="data3_enhanced_v8.csv",
        help="Output data3 CSV file path (default: data3_enhanced_v8.csv)"
    )
    
    # Configuration arguments
    parser.add_argument(
        "--config", "-c",
        help="Configuration YAML file path"
    )
    
    parser.add_argument(
        "--batch-size",
        type=int,
        default=50,
        help="Batch size for API calls (default: 50)"
    )
    
    parser.add_argument(
        "--max-retries",
        type=int,
        default=5,
        help="Maximum retry attempts for API calls (default: 5)"
    )
    
    # Processing options
    parser.add_argument(
        "--strict-mode",
        action="store_true",
        help="Enable strict mode for enhanced validation"
    )
    
    parser.add_argument(
        "--validate-output",
        action="store_true",
        help="Validate output data3 structure"
    )
    
    parser.add_argument(
        "--output-failed-rows",
        action="store_true",
        help="Output failed rows to separate CSV file"
    )
    
    parser.add_argument(
        "--disable-status-tracking",
        action="store_true",
        help="Disable per-row status tracking"
    )
    
    # API resilience options
    parser.add_argument(
        "--exponential-backoff-base",
        type=float,
        default=2.0,
        help="Base for exponential backoff calculation (default: 2.0)"
    )
    
    parser.add_argument(
        "--exponential-backoff-max",
        type=float,
        default=60.0,
        help="Maximum backoff time in seconds (default: 60.0)"
    )
    
    parser.add_argument(
        "--jitter-factor",
        type=float,
        default=0.1,
        help="Jitter factor for backoff calculation (default: 0.1)"
    )
    
    # Key detection options
    parser.add_argument(
        "--key-confidence-threshold",
        type=float,
        default=0.3,
        help="Minimum confidence threshold for key detection (default: 0.3)"
    )
    
    parser.add_argument(
        "--ambiguous-key-threshold",
        type=float,
        default=0.1,
        help="Threshold for ambiguous key detection (default: 0.1)"
    )
    
    # Logging options
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Enable verbose logging"
    )
    
    parser.add_argument(
        "--quiet", "-q",
        action="store_true",
        help="Suppress non-error logging"
    )
    
    parser.add_argument(
        "--log-file",
        default="viper_enrichment.log",
        help="Log file path (default: viper_enrichment.log)"
    )
    
    return parser

# =====================================================================================
# ENHANCED MAIN FUNCTION
# =====================================================================================

async def main_enhanced():
    """Enhanced main entry point with comprehensive error handling."""
    parser = create_enhanced_parser()
    args = parser.parse_args()
    
    # Configure enhanced logging
    log_level = logging.DEBUG if args.verbose else (logging.ERROR if args.quiet else logging.INFO)
    logging.basicConfig(
        level=log_level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(args.log_file),
            logging.StreamHandler()
        ]
    )
    
    logger.info("="*80)
    logger.info("VIPER 2.0 - Enhanced Data2 to Data3 Enrichment Script")
    logger.info("="*80)
    logger.info(f"Input file: {args.input}")
    logger.info(f"Output file: {args.output}")
    logger.info(f"Batch size: {args.batch_size}")
    logger.info(f"Max retries: {args.max_retries}")
    logger.info(f"Strict mode: {args.strict_mode}")
    logger.info(f"Validate output: {args.validate_output}")
    logger.info(f"Status tracking: {not args.disable_status_tracking}")
    logger.info("="*80)
    
    try:
        # Load configuration
        config = Config()
        
        # Load from YAML if provided
        if args.config:
            try:
                import yaml
                with open(args.config, 'r') as f:
                    config_data = yaml.safe_load(f)
                    for key, value in config_data.items():
                        if hasattr(config, key):
                            setattr(config, key, value)
                logger.info(f"Loaded configuration from {args.config}")
            except Exception as e:
                logger.warning(f"Failed to load config file {args.config}: {e}")
        
        # Override config with CLI arguments
        config.batch_size = args.batch_size
        config.max_retries = args.max_retries
        config.exponential_backoff_base = args.exponential_backoff_base
        config.exponential_backoff_max = args.exponential_backoff_max
        config.jitter_factor = args.jitter_factor
        config.key_confidence_threshold = args.key_confidence_threshold
        config.ambiguous_key_threshold = args.ambiguous_key_threshold
        config.strict_mode = args.strict_mode
        config.validate_output = args.validate_output or args.strict_mode
        config.output_failed_rows = args.output_failed_rows
        config.enable_status_tracking = not args.disable_status_tracking
        
        # Validate input file
        if not Path(args.input).exists():
            raise FileNotFoundError(f"Input file not found: {args.input}")
        
        # Initialize enhanced converter
        converter = EnhancedData3Converter(config)
        
        # Convert data2 to data3
        start_time = time.time()
        metrics = await converter.convert_data2_to_data3_enhanced(args.input, args.output)
        total_time = time.time() - start_time
        
        # Print comprehensive results
        print("\n" + "="*80)
        print("VIPER 2.0 CONVERSION COMPLETE")
        print("="*80)
        print(f"Total songs processed: {metrics['total_songs']:,}")
        print(f"Successful conversions: {metrics['successful_conversions']:,}")
        print(f"Failed conversions: {metrics['failed_conversions']:,}")
        print(f"Success rate: {metrics['success_rate']:.2%}")
        print(f"Processing time: {total_time:.2f} seconds")
        print(f"Processing speed: {metrics['songs_per_second']:.1f} songs/second")
        print(f"Output saved to: {metrics['output_file']}")
        
        # Enhanced features summary
        print("\nEnhanced Features:")
        print("✅ Exponential backoff API resilience")
        print("✅ Confidence-scored key detection")
        print("✅ Enhanced Roman numeral analysis")
        print("✅ Per-row status tracking")
        print("✅ Comprehensive error handling")
        print("✅ Chroma vector module (commented for future data4)")
        print("✅ Exact data3 structure compliance")
        
        # Validation results
        if metrics.get('validation_results'):
            validation = metrics['validation_results']
            if not validation['is_valid']:
                print("\n⚠️  Validation Issues:")
                for issue in validation['missing_columns']:
                    print(f"  Missing column: {issue}")
                for issue in validation['data_type_issues']:
                    print(f"  Data type issue: {issue}")
            else:
                print("\n✅ Data3 structure validation passed")
        
        # Spotify API statistics
        if hasattr(converter.spotify_client, 'request_count'):
            spotify_client = converter.spotify_client
            print(f"\nSpotify API Statistics:")
            print(f"  Total requests: {spotify_client.request_count}")
            print(f"  Error count: {spotify_client.error_count}")
            if spotify_client.request_count > 0:
                error_rate = spotify_client.error_count / spotify_client.request_count * 100
                print(f"  Error rate: {error_rate:.1f}%")
        
        # Quality analysis
        if 'analysis_quality' in metrics:
            print(f"\nAnalysis Quality:")
            print(f"  Excellent: {metrics.get('excellent_quality', 0):,}")
            print(f"  Good: {metrics.get('good_quality', 0):,}")
            print(f"  Fair: {metrics.get('fair_quality', 0):,}")
            print(f"  Poor: {metrics.get('poor_quality', 0):,}")
        
        print("\n" + "="*80)
        print("VIPER 2.0 - Mission Accomplished! 🚀")
        print("="*80)
        
    except FileNotFoundError as e:
        logger.error(f"File not found: {e}")
        print(f"\n❌ Error: {e}")
        return 1
    except KeyboardInterrupt:
        logger.info("Conversion interrupted by user")
        print("\n⚠️  Conversion interrupted by user")
        return 1
    except Exception as e:
        logger.error(f"Conversion failed: {e}")
        print(f"\n❌ Conversion failed: {e}")
        print("Check the log file for detailed error information.")
        return 1
    
    return 0

# =====================================================================================
# SCRIPT ENTRY POINT
# =====================================================================================

if __name__ == "__main__":
    # Run the enhanced application
    exit_code = asyncio.run(main_enhanced())
    exit(exit_code) 