#!/usr/bin/env python3
"""
Test Roman Numeral Cleaning Script
Tests the CSV mapping and scale degree conversion logic
"""

import pandas as pd
import re
import os
import sys

def load_roman_mapping():
    """Load the Roman numeral mapping from CSV"""
    mapping_file = "Onboarding/RomanNumeralMapping.csv"
    
    if not os.path.exists(mapping_file):
        print(f"❌ Mapping file not found: {mapping_file}")
        return None
    
    try:
        df = pd.read_csv(mapping_file)
        mapping = {}
        
        for _, row in df.iterrows():
            slot = row['Harmonic_Profile_Slot']
            symbols = row['Mapped_Symbols'].split(',')
            mapping[slot] = symbols
            
        print(f"✅ Loaded {len(mapping)} harmonic profile slots")
        return mapping
        
    except Exception as e:
        print(f"❌ Error loading mapping: {e}")
        return None

def convert_scale_degrees(roman_progression, key="C"):
    """Convert slash chords to scale degree notation"""
    
    # Scale degree mappings for major keys
    major_scale_degrees = {
        'I': '^1', 'ii': '^2', 'iii': '^3', 'IV': '^4', 
        'V': '^5', 'vi': '^6', 'vii': '^7'
    }
    
    # Scale degree mappings for minor keys  
    minor_scale_degrees = {
        'i': '^1', 'ii': '^2', 'bIII': '^3', 'iv': '^4',
        'v': '^5', 'bVI': '^6', 'bVII': '^7'
    }
    
    # Combine both mappings
    all_scale_degrees = {**major_scale_degrees, **minor_scale_degrees}
    
    # Pattern to match slash chords
    slash_pattern = r'([IiVv]+[#b]?[ºø]?\(?[b#]?[0-9]*\)?)/([IiVv]+[#b]?[ºø]?\(?[b#]?[0-9]*\)?)'
    
    def replace_slash(match):
        chord = match.group(1)
        bass_note = match.group(2)
        
        # Convert bass note to scale degree
        if bass_note in all_scale_degrees:
            scale_degree = all_scale_degrees[bass_note]
            return f"{chord}/{scale_degree}"
        else:
            # Keep original if not found in mapping
            return match.group(0)
    
    # Apply the conversion
    cleaned_progression = re.sub(slash_pattern, replace_slash, roman_progression)
    
    return cleaned_progression

def test_roman_cleaning():
    """Test the Roman numeral cleaning logic"""
    
    print("🧪 TESTING ROMAN NUMERAL CLEANING")
    print("=" * 50)
    
    # Load the mapping
    mapping = load_roman_mapping()
    if not mapping:
        return False
    
    # Test cases
    test_cases = [
        "I V/IV ii V",
        "I/ii V/iii IV/ii",
        "i iv bIII bVI",
        "V7/ii I/IV",
        "ii° V7/ii°",
        "I7 V9/ii"
    ]
    
    print("\n📋 TEST CASES:")
    print("-" * 30)
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\nTest {i}: {test_case}")
        
        # Clean the progression
        cleaned = convert_scale_degrees(test_case)
        print(f"Cleaned: {cleaned}")
        
        # Test mapping lookup
        for symbol in test_case.split():
            found_slot = None
            for slot, symbols in mapping.items():
                if symbol in symbols:
                    found_slot = slot
                    break
            
            if found_slot:
                print(f"  {symbol} → {found_slot}")
            else:
                print(f"  {symbol} → NOT FOUND")
    
    print("\n✅ Test complete!")
    return True

def test_with_sample_data():
    """Test with a small sample of actual data"""
    
    print("\n📊 TESTING WITH SAMPLE DATA")
    print("=" * 50)
    
    # Create sample data
    sample_data = [
        "I V/IV ii V",
        "I/ii V/iii IV/ii", 
        "i iv bIII bVI",
        "V7/ii I/IV",
        "ii° V7/ii°",
        "I7 V9/ii"
    ]
    
    sample_df = pd.DataFrame({
        'roman_numerals': sample_data,
        'key': ['C', 'C', 'A', 'C', 'C', 'C']
    })
    
    print("Sample data:")
    print(sample_df)
    
    # Apply cleaning
    sample_df['cleaned_roman'] = sample_df['roman_numerals'].apply(convert_scale_degrees)
    
    print("\nAfter cleaning:")
    print(sample_df[['roman_numerals', 'cleaned_roman']])
    
    return True

if __name__ == "__main__":
    print("🎵 ROMAN NUMERAL CLEANING TEST")
    print("=" * 50)
    
    success1 = test_roman_cleaning()
    success2 = test_with_sample_data()
    
    if success1 and success2:
        print("\n🎉 All tests passed!")
        print("Ready to implement in main cleaning script!")
    else:
        print("\n💥 Some tests failed!")
        sys.exit(1) 