#!/usr/bin/env python3
"""
FINAL BOSS KEY DETECTION - HARMONIC ORACLE IMPLEMENTATION
=========================================================

The "Final Boss" algorithm is the ultimate key detection method that minimizes 
"Other" chord classifications by selecting the key that results in the lowest
percentage of unclassified chords when converted to Roman numeral analysis.

This is the missing "Viper Rose" functionality - a sophisticated key detection
system that combines Krumhansl-Schmuckler analysis with Roman numeral optimization.

Based on HarmonicOracle handoff documentation:
- /handoff/05_BACKEND_PIPELINE.md
- /handoff/02_DATA_FORMATS.md  
- /handoff/11_CODE_EXAMPLES.md

Original implementation lost in migration - recreated from documentation.
"""

import re
import numpy as np
from typing import List, Tuple, Dict, Any
import json
import argparse
import pandas as pd

# All 24 keys (12 major + 12 minor)
ALL_24_KEYS = [
    'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 
    'F', 'Bb', 'Eb', 'Ab',
    'Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 
    'Ebm', 'Bbm', 'Fm', 'Cm', 'Gm', 'Dm'
]

# 27-slot HUV mapping system
HARMONIC_SLOTS = {
    'major': [
        'I', 'ii', 'iii', 'IV', 'V', 'vi', 'viiº',
        'I7', 'iiiø', 'II(7)', '#ivø', 'III(7)', '#vº', 
        'VI(7)', '#iº', 'VII(7)', '#iiº', 'V(7)', 'viiø'
    ],
    'minor': [
        'i', 'iiø', 'bIII', 'iv', 'v', 'bVI', 'bVII'
    ],
    'special': [
        'V(b9)', 'Other'
    ]
}

# Krumhansl-Schmuckler key profiles
KS_MAJOR_PROFILE = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
KS_MINOR_PROFILE = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])

# Chord to pitch class mapping
CHORD_TO_PITCH_CLASS = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4,
    'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9,
    'A#': 10, 'Bb': 10, 'B': 11
}

# Roman numeral mapping for major and minor keys
ROMAN_MAPPINGS = {
    'major': {
        0: 'I', 1: '#i', 2: 'ii', 3: '#ii', 4: 'iii', 5: 'IV',
        6: '#iv', 7: 'V', 8: '#v', 9: 'vi', 10: '#vi', 11: 'vii'
    },
    'minor': {
        0: 'i', 1: '#i', 2: 'ii', 3: 'bIII', 4: 'iii', 5: 'iv',
        6: '#iv', 7: 'v', 8: 'bVI', 9: 'vi', 10: 'bVII', 11: 'vii'
    }
}

def parse_cpml_chords(cpml_string: str) -> List[str]:
    """
    Extract chords from CPML section tags.
    
    Args:
        cpml_string: String with section markup like "<verse_1>Am F C G</verse_1>" or "<verse>Am F C G</verse>"
    
    Returns:
        List of normalized chord strings
    """
    if not cpml_string:
        return []
    
    # Remove section tags: <verse_1>Am F C G</verse_1> → Am F C G
    # Also handle: <verse>Am F C G</verse> → Am F C G
    # Pattern matches opening and closing tags with optional numbers/underscores
    pattern = r'<[^>]*?>(.*?)</[^>]*?>'
    matches = re.findall(pattern, cpml_string)
    
    if not matches:
        # If no CPML tags found, try parsing as simple chord list
        chord_text = cpml_string
    else:
        chord_text = ' '.join(matches)
    
    # Split chords and filter out empty strings
    chords = [chord.strip() for chord in chord_text.split() if chord.strip()]
    
    return [normalize_chord(chord) for chord in chords if chord]

def normalize_chord(chord: str) -> str:
    """
    Standardize chord notation.
    
    Args:
        chord: Raw chord symbol
    
    Returns:
        Normalized chord symbol
    """
    chord = chord.strip()
    if not chord:
        return chord
    
    # Handle major chords: C → CM, F → FM (unless already has modifier)
    if (chord and 
        not chord.endswith('m') and 
        not any(c in chord for c in ['7', 'sus', 'add', 'dim', 'aug']) and
        chord[-1].isupper()):
        chord += 'M'  # C → CM
    
    return chord

def extract_root_from_chord(chord: str) -> str:
    """
    Extract the root note from a chord symbol.
    
    Args:
        chord: Normalized chord symbol like "CM", "Am", "F7"
    
    Returns:
        Root note like "C", "A", "F"
    """
    if not chord:
        return ''
    
    # Handle sharp/flat notes
    if len(chord) >= 2 and chord[1] in ['#', 'b']:
        return chord[:2]
    else:
        return chord[0]

def chord_to_pitch_class(chord: str) -> int:
    """
    Convert chord to pitch class (0-11).
    
    Args:
        chord: Chord symbol
    
    Returns:
        Pitch class integer (0-11), or -1 if unknown
    """
    root = extract_root_from_chord(chord)
    return CHORD_TO_PITCH_CLASS.get(root, -1)

def krumhansl_schmuckler_analysis(chords: List[str]) -> Dict[str, float]:
    """
    Calculate Krumhansl-Schmuckler correlation scores for all 24 keys.
    
    Args:
        chords: List of chord symbols
    
    Returns:
        Dictionary mapping key names to correlation scores
    """
    if not chords:
        return {key: 0.0 for key in ALL_24_KEYS}
    
    # Build pitch class histogram
    pitch_histogram = np.zeros(12)
    for chord in chords:
        pc = chord_to_pitch_class(chord)
        if pc >= 0:
            pitch_histogram[pc] += 1
    
    # Normalize histogram
    if pitch_histogram.sum() > 0:
        pitch_histogram = pitch_histogram / pitch_histogram.sum()
    
    scores = {}
    
    # Major keys
    for i, key in enumerate(['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'F', 'Bb', 'Eb', 'Ab']):
        # Rotate profile to match key
        rotated_profile = np.roll(KS_MAJOR_PROFILE, i * 7 % 12)  # Circle of fifths
        correlation = np.corrcoef(pitch_histogram, rotated_profile)[0, 1]
        scores[key] = correlation if not np.isnan(correlation) else 0.0
    
    # Minor keys  
    for i, key in enumerate(['Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'Ebm', 'Bbm', 'Fm', 'Cm', 'Gm', 'Dm']):
        # Rotate profile to match key (relative minor is 3 semitones down)
        key_offset = (i * 7 + 9) % 12  # Minor keys offset
        rotated_profile = np.roll(KS_MINOR_PROFILE, key_offset)
        correlation = np.corrcoef(pitch_histogram, rotated_profile)[0, 1]
        scores[key] = correlation if not np.isnan(correlation) else 0.0
    
    return scores

def convert_chord_to_roman(chord: str, key: str) -> str:
    """
    Convert a chord to Roman numeral in the given key using Claude mapping system.
    
    Args:
        chord: Chord symbol like "AM", "Dm", "G7"
        key: Key like "C" or "Am"
    
    Returns:
        Roman numeral or "Other" if unclassifiable
    """
    if not chord or not key:
        return "Other"

    chord_root = extract_root_from_chord(chord)
    chord_pc = chord_to_pitch_class(chord_root)
    
    if chord_pc < 0:
        return "Other"

    # Determine if key is major or minor
    is_minor_key = key.endswith('m')
    key_root = key[:-1] if is_minor_key else key
    key_pc = chord_to_pitch_class(key_root)
    
    if key_pc < 0:
        return "Other"

    # Calculate interval from key
    interval = (chord_pc - key_pc) % 12
    
    # Determine chord quality - FIXED LOGIC
    is_minor_chord = chord.endswith('min') or (chord.endswith('m') and not chord.endswith('M'))
    is_major_chord = chord.endswith('M') or (len(chord) == 1) or (len(chord) == 2 and chord[1] in ['#', 'b'])
    is_seventh = '7' in chord
    is_diminished = 'dim' in chord or 'º' in chord
    
    # Claude Roman Numeral Mapping System
    if is_minor_key:
        # Minor key Roman numerals
        if interval == 0:  # Tonic
            if is_major_chord:
                return "I"  # Picardy third
            else:
                return "i"
        elif interval == 1:
            return "#i"
        elif interval == 2:  # Supertonic
            if is_diminished:
                return "iiø"
            else:
                return "ii"
        elif interval == 3:  # Mediant
            return "bIII"
        elif interval == 4:
            return "iii"
        elif interval == 5:  # Subdominant
            if is_major_chord:
                return "IV"  # Borrowed from parallel major
            else:
                return "iv"
        elif interval == 6:
            return "#iv"
        elif interval == 7:  # Dominant
            if is_seventh:
                return "V(7)"
            elif is_major_chord:
                return "V"
            else:
                return "v"
        elif interval == 8:  # Submediant
            return "bVI"
        elif interval == 9:
            return "vi"
        elif interval == 10:  # Subtonic
            return "bVII"
        elif interval == 11:
            if is_diminished:
                return "viiø"
            else:
                return "vii"
    else:
        # Major key Roman numerals  
        if interval == 0:  # Tonic
            if is_seventh:
                return "I7"
            else:
                return "I"
        elif interval == 1:
            return "#i"
        elif interval == 2:  # Supertonic
            if is_seventh:
                return "ii7"
            else:
                return "ii"
        elif interval == 3:
            return "#ii"
        elif interval == 4:  # Mediant
            if is_seventh and is_minor_chord:
                return "iii7"
            elif is_major_chord:
                return "III"  # Secondary dominant area
            else:
                return "iii"
        elif interval == 5:  # Subdominant
            return "IV"
        elif interval == 6:
            return "#iv"
        elif interval == 7:  # Dominant
            if is_seventh:
                return "V(7)"
            else:
                return "V"
        elif interval == 8:
            return "#v"
        elif interval == 9:  # Submediant
            if is_seventh and is_minor_chord:
                return "vi7"
            else:
                return "vi"
        elif interval == 10:
            return "#vi"
        elif interval == 11:  # Leading tone
            if is_diminished:
                return "viiº"
            elif is_seventh:
                return "vii7"
            else:
                return "vii"
    
    return "Other"

def convert_to_romans(chords: List[str], key: str) -> List[str]:
    """
    Convert list of chords to Roman numerals in the given key.
    
    Args:
        chords: List of chord symbols
        key: Key name
    
    Returns:
        List of Roman numeral strings
    """
    return [convert_chord_to_roman(chord, key) for chord in chords]

def build_huv_histogram(romans: List[str]) -> Dict[str, int]:
    """
    Build 27-slot HUV histogram from Roman numerals.
    
    Args:
        romans: List of Roman numeral strings
    
    Returns:
        Dictionary mapping slot names to counts
    """
    histogram = {}
    
    # Initialize all slots to 0
    for slot_list in HARMONIC_SLOTS.values():
        for slot in slot_list:
            histogram[slot] = 0
    
    # Count Roman numerals
    for roman in romans:
        if roman in histogram:
            histogram[roman] += 1
        else:
            histogram['Other'] += 1
    
    return histogram

def detect_key_final_boss(chords: List[str]) -> Tuple[str, float, float]:
    """
    The Final Boss key detection algorithm.
    
    Selects the key that minimizes 'Other' chord classifications when
    chords are converted to Roman numeral analysis.
    
    Args:
        chords: List of chord symbols
    
    Returns:
        Tuple of (chosen_key, other_rate, ks_score)
    """
    if not chords:
        return 'C', 1.0, 0.0
    
    # Get Krumhansl-Schmuckler scores for all keys
    ks_scores = krumhansl_schmuckler_analysis(chords)
    
    best_key = None
    best_other_rate = float('inf')
    best_ks_score = -1
    
    for key in ALL_24_KEYS:
        # Convert chords to Roman numerals in this key
        romans = convert_to_romans(chords, key)
        
        # Build 27-slot HUV histogram
        huv_histogram = build_huv_histogram(romans)
        
        # Calculate "Other" rate
        total_chords = sum(huv_histogram.values())
        other_count = huv_histogram.get('Other', 0)
        other_rate = other_count / total_chords if total_chords > 0 else 1.0
        
        # Select key with lowest other_rate, KS score as tiebreaker
        ks_score = ks_scores.get(key, 0.0)
        if (other_rate < best_other_rate or 
            (other_rate == best_other_rate and ks_score > best_ks_score)):
            best_key = key
            best_other_rate = other_rate
            best_ks_score = ks_score
    
    return best_key, best_other_rate, best_ks_score

def analyze_song(chords_input: str, song_id: str = None) -> Dict[str, Any]:
    """
    Complete analysis of a song using Final Boss key detection.
    
    Args:
        chords_input: Either chord list string or CPML markup
        song_id: Optional song identifier
    
    Returns:
        Dictionary with complete analysis results
    """
    # Parse chords
    if '<' in chords_input and '>' in chords_input:
        # CPML format
        chords = parse_cpml_chords(chords_input)
    else:
        # Simple space-separated format  
        raw_chords = [c.strip() for c in chords_input.split() if c.strip()]
        # Filter out section tags that might have been missed
        chords = [normalize_chord(c) for c in raw_chords 
                 if c and not c.startswith('<') and not c.endswith('>')]
    
    if not chords:
        return {
            'id': song_id,
            'chords': chords_input,
            'error': 'No valid chords found',
            'key': 'C',
            'other_rate': 1.0,
            'ks_score': 0.0,
            'chosen_by': 'error'
        }
    
    # Apply Final Boss algorithm
    key, other_rate, ks_score = detect_key_final_boss(chords)
    
    # Generate Roman numerals
    romans = convert_to_romans(chords, key)
    
    # Build HUV histogram
    huv_histogram = build_huv_histogram(romans)
    
    # Create harmonic fingerprint
    fingerprint_data = [str(huv_histogram.get(slot, 0)) for slot_list in HARMONIC_SLOTS.values() for slot in slot_list]
    harmonic_fingerprint = '_'.join(fingerprint_data)
    
    return {
        'id': song_id,
        'chords': ' '.join(chords),
        'key': key,
        'roman_numerals': ' '.join(romans),
        'harmonic_fingerprint': harmonic_fingerprint,
        'other_rate': round(other_rate, 4),
        'ks_score': round(ks_score, 4),
        'chosen_by': 'final_boss',
        'total_chords': len(chords),
        'other_chords': sum(1 for r in romans if r == 'Other'),
        'huv_histogram': huv_histogram,
        'raw_chords': chords,
        'raw_romans': romans
    }

def process_csv_file(input_file: str, output_file: str = None) -> None:
    """
    Process a CSV file with Final Boss key detection.
    
    Args:
        input_file: Path to input CSV file
        output_file: Path to output CSV file (optional)
    """
    try:
        df = pd.read_csv(input_file)
        
        if 'chords' not in df.columns:
            print("Error: Input CSV must have 'chords' column")
            return
        
        results = []
        total_rows = len(df)
        
        print(f"Processing {total_rows} songs with Final Boss key detection...")
        
        for idx, row in df.iterrows():
            song_id = row.get('id', f'song_{idx + 1}')
            chords_input = str(row['chords']) if pd.notna(row['chords']) else ''
            
            result = analyze_song(chords_input, song_id)
            
            # Merge with original row data
            merged_row = dict(row)
            merged_row.update(result)
            results.append(merged_row)
            
            if (idx + 1) % 100 == 0:
                print(f"Processed {idx + 1}/{total_rows} songs")
        
        # Convert to DataFrame
        result_df = pd.DataFrame(results)
        
        # Save results
        if output_file:
            result_df.to_csv(output_file, index=False)
            print(f"Results saved to {output_file}")
        else:
            output_file = input_file.replace('.csv', '_final_boss.csv')
            result_df.to_csv(output_file, index=False)
            print(f"Results saved to {output_file}")
        
        # Print summary statistics
        total_songs = len(result_df)
        avg_other_rate = result_df['other_rate'].mean()
        avg_ks_score = result_df['ks_score'].mean()
        
        print(f"\n=== FINAL BOSS ANALYSIS SUMMARY ===")
        print(f"Total songs analyzed: {total_songs}")
        print(f"Average 'Other' rate: {avg_other_rate:.4f} ({avg_other_rate*100:.2f}%)")
        print(f"Average K-S score: {avg_ks_score:.4f}")
        print(f"Songs with 0% 'Other' rate: {(result_df['other_rate'] == 0).sum()}")
        print(f"Songs with >20% 'Other' rate: {(result_df['other_rate'] > 0.2).sum()}")
        
        # Key distribution
        key_counts = result_df['key'].value_counts()
        print(f"\nTop detected keys:")
        print(key_counts.head(10).to_string())
        
    except Exception as e:
        print(f"Error processing CSV file: {e}")

def main():
    """
    Command-line interface for Final Boss key detection.
    """
    parser = argparse.ArgumentParser(
        description='Final Boss Key Detection - Ultimate key detection algorithm',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Analyze single chord progression
  %(prog)s --chords "Am F C G"
  
  # Analyze CPML markup
  %(prog)s --chords "<verse>Am F C G</verse><chorus>F C G Am</chorus>"
  
  # Process CSV file
  %(prog)s --csv input.csv --output results.csv
  
  # Interactive mode
  %(prog)s --interactive
        """)
    
    parser.add_argument('--chords', 
                       help='Chord progression to analyze')
    parser.add_argument('--csv', 
                       help='CSV file to process (must have "chords" column)')
    parser.add_argument('--output', 
                       help='Output file path')
    parser.add_argument('--interactive', action='store_true',
                       help='Interactive mode for multiple analyses')
    parser.add_argument('--verbose', action='store_true',
                       help='Verbose output with detailed analysis')
    
    args = parser.parse_args()
    
    if args.csv:
        # Process CSV file
        process_csv_file(args.csv, args.output)
    
    elif args.chords:
        # Analyze single chord progression
        result = analyze_song(args.chords)
        
        print(f"=== FINAL BOSS KEY DETECTION ===")
        print(f"Chords: {result['chords']}")
        print(f"Detected Key: {result['key']}")
        print(f"Roman Numerals: {result['roman_numerals']}")
        print(f"'Other' Rate: {result['other_rate']:.4f} ({result['other_rate']*100:.2f}%)")
        print(f"K-S Score: {result['ks_score']:.4f}")
        
        if args.verbose:
            print(f"\nHUV Histogram:")
            for slot, count in result['huv_histogram'].items():
                if count > 0:
                    print(f"  {slot}: {count}")
            
            print(f"\nChord → Roman Mapping:")
            for chord, roman in zip(result['raw_chords'], result['raw_romans']):
                print(f"  {chord} → {roman}")
    
    elif args.interactive:
        # Interactive mode
        print("=== FINAL BOSS KEY DETECTION - INTERACTIVE MODE ===")
        print("Enter chord progressions to analyze (or 'quit' to exit)")
        
        while True:
            try:
                chords_input = input("\nChords: ").strip()
                
                if chords_input.lower() in ['quit', 'exit', 'q']:
                    break
                
                if not chords_input:
                    continue
                
                result = analyze_song(chords_input)
                
                print(f"Key: {result['key']} | "
                      f"Romans: {result['roman_numerals']} | "
                      f"Other: {result['other_rate']*100:.1f}% | "
                      f"K-S: {result['ks_score']:.3f}")
                
            except KeyboardInterrupt:
                break
            except Exception as e:
                print(f"Error: {e}")
        
        print("Goodbye!")
    
    else:
        # No arguments - show help and examples
        parser.print_help()
        
        print("\n=== QUICK EXAMPLES ===")
        
        examples = [
            "Am F C G",
            "C Am F G",
            "<verse>Dm Bb F C</verse><chorus>Bb F C Dm</chorus>",
            "Em Am D G B7 Em"
        ]
        
        for example in examples:
            result = analyze_song(example)
            print(f"'{example}' → {result['key']} (Other: {result['other_rate']*100:.1f}%)")

if __name__ == '__main__':
    main()
