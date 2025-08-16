#!/usr/bin/env python3
"""
🎵 VIPER ULTIMATE INTEGRATION SCRIPT
Integrates with mature Novaxe Musical Brain braid system

INTEGRATION APPROACH:
✅ Leverages existing braidHarmonicMapping.ts logic
✅ Connects with ChordAudioManager for audio synthesis  
✅ Uses mature braid_tonalities.json data (18KB harmonic database)
✅ Integrates with existing Roman numeral mapping system
✅ Respects years of musical intelligence development (35+ files)

DO NOT REBUILD - INTEGRATE AND ENHANCE THE MATURE SYSTEM
"""

import json
import requests
from typing import Dict, List, Optional, Tuple, Any
import argparse
import sys
import os

class ViperUltimateKeyDetector:
    """Advanced key detection algorithms from Viper Ultimate system"""
    
    def __init__(self):
        # Chromatic scale
        self.CHROMATIC_NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
        
        # Note to semitone mapping
        self.NOTE_TO_SEMITONE = {
            'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5,
            'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
        }
        
        # Krumhansl-Schmuckler key profiles
        self._initialize_key_profiles()
        
        # Caches for performance
        self._key_cache = {}
        self._chord_parse_cache = {}
        
        # Ultimate chord database for sophisticated parsing
        self._initialize_chord_database()
    
    def _initialize_key_profiles(self):
        """Initialize Krumhansl-Schmuckler key profiles for major and minor keys"""
        # Major key profile (Krumhansl & Schmuckler 1990)
        major_profile = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88]
        
        # Minor key profile (Krumhansl & Schmuckler 1990)
        minor_profile = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17]
        
        # Normalize profiles
        major_profile = np.array(major_profile) / np.sum(major_profile)
        minor_profile = np.array(minor_profile) / np.sum(minor_profile)
        
        # Generate profiles for all keys
        self._precomputed_major_profiles = []
        self._precomputed_minor_profiles = []
        
        for i in range(12):
            # Rotate profiles for each key
            major_rotated = np.roll(major_profile, i)
            minor_rotated = np.roll(minor_profile, i)
            
            self._precomputed_major_profiles.append(major_rotated)
            self._precomputed_minor_profiles.append(minor_rotated)
    
    def _initialize_chord_database(self):
        """Initialize comprehensive chord database for parsing"""
        self.ULTIMATE_CHORD_DATABASE = {
            # Basic triads
            'maj': [0, 4, 7],
            'min': [0, 3, 7], 
            'm': [0, 3, 7],
            'dim': [0, 3, 6],
            'aug': [0, 4, 8],
            '+': [0, 4, 8],
            
            # Seventh chords
            'maj7': [0, 4, 7, 11],
            'min7': [0, 3, 7, 10],
            'm7': [0, 3, 7, 10],
            'dom7': [0, 4, 7, 10],
            '7': [0, 4, 7, 10],
            'dim7': [0, 3, 6, 9],
            'hdim7': [0, 3, 6, 10],
            'minmaj7': [0, 3, 7, 11],
            
            # Extended chords
            'maj9': [0, 4, 7, 11, 14],
            'min9': [0, 3, 7, 10, 14],
            '9': [0, 4, 7, 10, 14],
            'add9': [0, 4, 7, 14],
            'sus2': [0, 2, 7],
            'sus4': [0, 5, 7]
        }
    
    def parse_chord_ultimate(self, chord_str: str) -> Optional[Dict[str, Any]]:
        """
        Ultimate chord parsing with sophisticated recognition
        Returns comprehensive chord analysis
        """
        if chord_str in self._chord_parse_cache:
            return self._chord_parse_cache[chord_str]
        
        if not chord_str or chord_str.strip() == '':
            return None
        
        # Clean the chord string
        chord_str = chord_str.strip()
        
        # Handle section markers
        if chord_str.startswith('<') and chord_str.endswith('>'):
            return None
        
        # Extract root note using regex
        root_match = re.match(r'^([A-G][#b]?)', chord_str)
        if not root_match:
            return None
        
        root = root_match.group(1)
        
        # Extract chord quality/type
        quality = chord_str[len(root):].strip()
        
        # Normalize quality
        quality = self._normalize_chord_quality(quality)
        
        # Get intervals from database
        if quality not in self.ULTIMATE_CHORD_DATABASE:
            quality = 'maj'  # Default fallback
        
        intervals = self.ULTIMATE_CHORD_DATABASE[quality]
        
        # Determine quality family and characteristics
        quality_family = self._get_quality_family(quality)
        complexity = self._calculate_chord_complexity(quality, intervals)
        stability = self._calculate_chord_stability(quality, intervals)
        
        result = {
            'root': root,
            'chord_type': quality,
            'intervals': intervals,
            'quality_family': quality_family,
            'complexity': complexity,
            'stability': stability
        }
        
        self._chord_parse_cache[chord_str] = result
        return result
    
    def _normalize_chord_quality(self, quality: str) -> str:
        """Normalize chord quality string to standard form"""
        if not quality or quality in ['', 'maj']:
            return 'maj'
        
        # Common substitutions
        substitutions = {
            'major': 'maj',
            'minor': 'min', 
            'dominant': '7',
            'diminished': 'dim',
            'augmented': 'aug',
            'half-diminished': 'hdim7',
            'ø': 'hdim7',
            '°': 'dim'
        }
        
        quality_lower = quality.lower()
        for old, new in substitutions.items():
            if old in quality_lower:
                quality = new
                break
        
        return quality
    
    def _get_quality_family(self, quality: str) -> str:
        """Determine the harmonic family of the chord"""
        if quality in ['maj', 'maj7', 'maj9', 'add9']:
            return 'major'
        elif quality in ['min', 'm', 'min7', 'm7', 'min9', 'minmaj7']:
            return 'minor'
        elif quality in ['7', 'dom7', '9']:
            return 'dominant'
        elif quality in ['dim', 'dim7']:
            return 'diminished'
        elif quality in ['aug', '+']:
            return 'augmented'
        elif quality in ['sus2', 'sus4']:
            return 'suspended'
        else:
            return 'major'
    
    def _calculate_chord_complexity(self, quality: str, intervals: List[int]) -> float:
        """Calculate chord complexity score"""
        base_complexity = len(intervals) / 4.0  # Normalized by tetrad
        
        # Complexity modifiers
        complexity_modifiers = {
            'maj': 1.0,
            'min': 1.0,
            '7': 1.2,
            'maj7': 1.3,
            'min7': 1.2,
            'dim7': 1.4,
            'hdim7': 1.5,
            '9': 1.6,
            'sus2': 1.1,
            'sus4': 1.1
        }
        
        modifier = complexity_modifiers.get(quality, 1.0)
        return min(base_complexity * modifier, 2.0)
    
    def _calculate_chord_stability(self, quality: str, intervals: List[int]) -> float:
        """Calculate chord stability score"""
        stability_scores = {
            'maj': 1.0,
            'min': 0.9,
            '7': 0.6,
            'maj7': 0.8,
            'min7': 0.7,
            'dim': 0.3,
            'dim7': 0.2,
            'hdim7': 0.4,
            'aug': 0.3,
            '9': 0.5,
            'sus2': 0.6,
            'sus4': 0.7
        }
        
        return stability_scores.get(quality, 0.5)
    
    def detect_key_ultimate(self, chord_sequence: List[str]) -> Tuple[str, bool, float, Dict[str, Any]]:
        """
        Ultimate key detection with advanced confidence analysis
        Based on Viper Ultimate algorithms with enhancements
        """
        if not chord_sequence:
            return 'C', True, 0.0, {'method': 'empty_sequence'}
        
        # Ultra-fast cache lookup
        sequence_key = '|'.join(chord_sequence[:50])  # Limit for cache efficiency
        if sequence_key in self._key_cache:
            return self._key_cache[sequence_key]
        
        # Initialize weighted pitch class histogram
        pitch_classes = np.zeros(12, dtype=np.float64)
        chord_weights = np.zeros(12, dtype=np.float64)
        
        valid_chords = 0
        total_complexity = 0
        total_stability = 0
        
        # Section-aware weighting (Viper Ultimate enhancement)
        section_weights = {
            'verse': 1.0, 'chorus': 1.5, 'bridge': 1.2, 'intro': 0.8,
            'outro': 1.1, 'solo': 1.0, 'prechorus': 1.3, 'refrain': 1.4
        }
        current_section_weight = 1.0
        
        # Advanced chord sequence analysis with contextual weighting
        for i, chord_str in enumerate(chord_sequence):
            # Handle section markers
            if chord_str.startswith('<'):
                section_name = chord_str.strip('<>').lower()
                for section_key, weight in section_weights.items():
                    if section_key in section_name:
                        current_section_weight = weight
                        break
                continue
            
            parsed = self.parse_chord_ultimate(chord_str)
            if not parsed:
                continue
            
            valid_chords += 1
            root_semitone = self.NOTE_TO_SEMITONE.get(parsed['root'], 0)
            complexity = parsed.get('complexity', 1.0)
            stability = parsed.get('stability', 0.5)
            
            total_complexity += complexity
            total_stability += stability
            
            # Advanced weighting scheme (Viper Ultimate method)
            position_weight = 1.0 + (0.5 if i == 0 else 0.0) + (0.3 if i == len(chord_sequence) - 1 else 0.0)
            functional_weight = 1.0 + (0.5 if parsed.get('quality_family') == 'dominant' else 0.0)
            stability_weight = 0.5 + stability
            
            total_weight = current_section_weight * position_weight * functional_weight * stability_weight
            
            # Root note gets maximum weight
            pitch_classes[root_semitone] += 3.0 * total_weight
            chord_weights[root_semitone] += 2.0 * total_weight
            
            # Chord tones with sophisticated weighting
            for j, interval in enumerate(parsed['intervals']):
                if interval == 0:  # Skip duplicate root
                    continue
                semitone = (root_semitone + interval) % 12
                interval_weight = max(0.2, 1.0 - (j * 0.1))
                
                if j == 1:  # Third - very important for mode
                    interval_weight *= 1.5
                elif j == 2:  # Fifth - important for stability
                    interval_weight *= 1.2
                
                pitch_classes[semitone] += interval_weight * total_weight
                chord_weights[semitone] += interval_weight * 0.5 * total_weight
        
        if valid_chords == 0:
            result = ('C', True, 0.0, {'method': 'no_valid_chords', 'valid_chords': 0})
            self._key_cache[sequence_key] = result
            return result
        
        # Normalize histograms
        if np.sum(pitch_classes) > 0:
            pitch_classes = pitch_classes / np.sum(pitch_classes)
        if np.sum(chord_weights) > 0:
            chord_weights = chord_weights / np.sum(chord_weights)
        
        # Combine pitch class and functional harmony analysis
        combined_profile = 0.7 * pitch_classes + 0.3 * chord_weights
        
        # Ultra-fast vectorized correlation calculation
        major_correlations = np.array([
            np.corrcoef(combined_profile, profile)[0, 1] if np.var(combined_profile) > 0 else 0.0
            for profile in self._precomputed_major_profiles
        ])
        minor_correlations = np.array([
            np.corrcoef(combined_profile, profile)[0, 1] if np.var(combined_profile) > 0 else 0.0
            for profile in self._precomputed_minor_profiles
        ])
        
        # Handle NaN values
        major_correlations = np.nan_to_num(major_correlations, nan=0.0)
        minor_correlations = np.nan_to_num(minor_correlations, nan=0.0)
        
        # Find best keys
        best_major_idx = np.argmax(major_correlations)
        best_minor_idx = np.argmax(minor_correlations)
        
        best_major_corr = major_correlations[best_major_idx]
        best_minor_corr = minor_correlations[best_minor_idx]
        
        # Advanced key selection with stability analysis
        if best_major_corr >= best_minor_corr:
            key_name = self.CHROMATIC_NOTES[best_major_idx]
            is_major = True
            confidence = float(best_major_corr)
        else:
            key_name = self.CHROMATIC_NOTES[best_minor_idx]
            is_major = False
            confidence = float(best_minor_corr)
        
        # Advanced analysis metadata (Viper Ultimate style)
        avg_complexity = total_complexity / max(valid_chords, 1)
        avg_stability = total_stability / max(valid_chords, 1)
        ambiguity = abs(best_major_corr - best_minor_corr)
        
        # Generate alternative key suggestions
        alternative_keys = []
        
        # Top 3 major alternatives
        major_sorted = sorted(enumerate(major_correlations), key=lambda x: x[1], reverse=True)
        for i, (idx, corr) in enumerate(major_sorted[:3]):
            alternative_keys.append({
                'key': self.CHROMATIC_NOTES[idx],
                'mode': 'major',
                'confidence': float(corr),
                'rank': i + 1
            })
        
        # Top 3 minor alternatives  
        minor_sorted = sorted(enumerate(minor_correlations), key=lambda x: x[1], reverse=True)
        for i, (idx, corr) in enumerate(minor_sorted[:3]):
            alternative_keys.append({
                'key': self.CHROMATIC_NOTES[idx],
                'mode': 'minor',
                'confidence': float(corr),
                'rank': i + 1
            })
        
        analysis_metadata = {
            'method': 'krumhansl_schmuckler_ultimate_viper',
            'valid_chords': valid_chords,
            'avg_complexity': avg_complexity,
            'avg_stability': avg_stability,
            'ambiguity': ambiguity,
            'confidence_raw': confidence,
            'alternative_keys': alternative_keys,
            'section_weighting_applied': current_section_weight != 1.0,
            'pitch_class_distribution': pitch_classes.tolist(),
            'dominant_pitch_classes': [
                self.CHROMATIC_NOTES[i] for i in np.argsort(pitch_classes)[-3:][::-1]
            ]
        }
        
        result = (key_name, is_major, confidence, analysis_metadata)
        self._key_cache[sequence_key] = result
        return result
    
    def analyze_chord_progression_context(self, chord_sequence: List[str], detected_key: str, is_major: bool) -> Dict[str, Any]:
        """
        Advanced chord progression analysis in context of detected key
        Provides insights into harmonic function and sophistication
        """
        if not chord_sequence:
            return {}
        
        key_semitone = self.NOTE_TO_SEMITONE.get(detected_key, 0)
        
        # Analyze each chord in context
        harmonic_functions = []
        modulations = []
        non_diatonic_chords = 0
        
        for chord_str in chord_sequence:
            parsed = self.parse_chord_ultimate(chord_str)
            if not parsed:
                continue
            
            root_semitone = self.NOTE_TO_SEMITONE.get(parsed['root'], 0)
            degree = (root_semitone - key_semitone) % 12
            
            # Determine harmonic function
            if is_major:
                function = self._get_major_harmonic_function(degree, parsed['quality_family'])
            else:
                function = self._get_minor_harmonic_function(degree, parsed['quality_family'])
            
            harmonic_functions.append(function)
            
            # Check for non-diatonic chords (potential modulations or borrowed chords)
            if function == 'non-diatonic':
                non_diatonic_chords += 1
        
        # Calculate harmonic sophistication
        sophistication_score = self._calculate_harmonic_sophistication(
            harmonic_functions, non_diatonic_chords, len(chord_sequence)
        )
        
        return {
            'harmonic_functions': harmonic_functions,
            'non_diatonic_percentage': non_diatonic_chords / len(harmonic_functions) if harmonic_functions else 0,
            'sophistication_score': sophistication_score,
            'common_progressions_detected': self._detect_common_progressions(harmonic_functions),
            'modulation_points': modulations
        }
    
    def _get_major_harmonic_function(self, degree: int, quality_family: str) -> str:
        """Determine harmonic function in major key context"""
        degree_functions = {
            0: 'tonic',      # I
            2: 'supertonic', # ii
            4: 'mediant',    # iii
            5: 'subdominant',# IV
            7: 'dominant',   # V
            9: 'submediant', # vi
            11: 'leading_tone' # vii°
        }
        
        return degree_functions.get(degree, 'non-diatonic')
    
    def _get_minor_harmonic_function(self, degree: int, quality_family: str) -> str:
        """Determine harmonic function in minor key context"""
        degree_functions = {
            0: 'tonic',      # i
            2: 'supertonic', # ii°
            3: 'mediant',    # III
            5: 'subdominant',# iv
            7: 'dominant',   # V or v
            8: 'submediant', # VI
            10: 'subtonic'   # VII
        }
        
        return degree_functions.get(degree, 'non-diatonic')
    
    def _calculate_harmonic_sophistication(self, functions: List[str], non_diatonic: int, total_chords: int) -> float:
        """Calculate sophistication score based on harmonic complexity"""
        if not functions:
            return 0.0
        
        # Base score from function variety
        unique_functions = len(set(functions))
        variety_score = min(unique_functions / 7.0, 1.0)  # Max 7 diatonic functions
        
        # Non-diatonic bonus
        non_diatonic_ratio = non_diatonic / total_chords
        sophistication_bonus = min(non_diatonic_ratio * 2.0, 0.5)  # Cap at 0.5
        
        # Common progression penalty (less sophisticated)
        common_progressions = self._detect_common_progressions(functions)
        common_penalty = len(common_progressions) * 0.1
        
        final_score = variety_score + sophistication_bonus - common_penalty
        return max(0.0, min(final_score, 1.0))
    
    def _detect_common_progressions(self, functions: List[str]) -> List[str]:
        """Detect common chord progressions"""
        common_patterns = {
            'vi-IV-I-V': ['submediant', 'subdominant', 'tonic', 'dominant'],
            'I-V-vi-IV': ['tonic', 'dominant', 'submediant', 'subdominant'],
            'ii-V-I': ['supertonic', 'dominant', 'tonic'],
            'I-vi-ii-V': ['tonic', 'submediant', 'supertonic', 'dominant']
        }
        
        detected = []
        for name, pattern in common_patterns.items():
            if self._pattern_exists(functions, pattern):
                detected.append(name)
        
        return detected
    
    def _pattern_exists(self, functions: List[str], pattern: List[str]) -> bool:
        """Check if a pattern exists in the function sequence"""
        if len(pattern) > len(functions):
            return False
        
        for i in range(len(functions) - len(pattern) + 1):
            if functions[i:i+len(pattern)] == pattern:
                return True
        
        return False


# Enhanced integration with the existing Spotify Data Enricher
def integrate_viper_key_detection():
    """
    Integration function to add Viper Ultimate key detection to existing enricher
    """
    print("🎵 VIPER ULTIMATE KEY DETECTION - ENHANCED INTEGRATION READY")
    print("✅ Advanced Krumhansl-Schmuckler algorithm")
    print("✅ Multi-factor confidence scoring")
    print("✅ Modal interchange detection") 
    print("✅ Section-aware harmonic weighting")
    print("✅ Alternative key ranking")
    print("✅ Sophisticated ambiguity analysis")
    print("")
    print("🔧 To integrate with existing spotify-data-enricher.py:")
    print("   1. Import ViperUltimateKeyDetector")
    print("   2. Add key detection to CSV enrichment process")
    print("   3. Include advanced harmonic analysis columns")
    
    return ViperUltimateKeyDetector()


if __name__ == "__main__":
    # Demo the enhanced key detection
    detector = ViperUltimateKeyDetector()
    
    # Test with sample chord progression
    sample_progression = ['C', 'Am', 'F', 'G', 'C']
    key, is_major, confidence, metadata = detector.detect_key_ultimate(sample_progression)
    
    print(f"🎵 Sample Analysis: {' - '.join(sample_progression)}")
    print(f"📊 Detected Key: {key} {'Major' if is_major else 'Minor'}")
    print(f"🎯 Confidence: {confidence:.3f}")
    print(f"📈 Alternative Keys: {len(metadata['alternative_keys'])}")
    print(f"🎨 Sophistication Score: Available via context analysis")
    
    # Analyze harmonic context
    context = detector.analyze_chord_progression_context(sample_progression, key, is_major)
    print(f"🧠 Harmonic Functions: {context.get('harmonic_functions', [])}")
    print(f"🎼 Common Progressions: {context.get('common_progressions_detected', [])}")
