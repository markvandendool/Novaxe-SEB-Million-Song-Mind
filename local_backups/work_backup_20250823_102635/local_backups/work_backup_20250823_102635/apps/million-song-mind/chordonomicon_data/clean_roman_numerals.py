#!/usr/bin/env python3
"""
Roman Numeral Cleaning Script
Processes the complete data3 file to clean Roman numerals and convert slash chords to scale degrees
"""

import pandas as pd
import re
import os
import sys
from pathlib import Path

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

def clean_roman_numerals(input_file, output_file):
    """Clean Roman numerals in the complete data3 file"""
    
    print("🧹 CLEANING ROMAN NUMERALS")
    print("=" * 50)
    
    # Load the mapping
    mapping = load_roman_mapping()
    if not mapping:
        return False
    
    try:
        # Read the input file
        print(f"📖 Reading input file: {input_file}")
        df = pd.read_csv(input_file, low_memory=False)
        print(f"   Total rows: {len(df)}")
        
        # Check if roman_numerals column exists
        if 'roman_numerals' not in df.columns:
            print("❌ 'roman_numerals' column not found!")
            print("Available columns:", df.columns.tolist())
            return False
        
        # Create a copy for processing
        df_cleaned = df.copy()
        
        # Process each row
        print("🔄 Processing Roman numerals...")
        processed_count = 0
        converted_count = 0
        
        for idx, row in df_cleaned.iterrows():
            if pd.notna(row['roman_numerals']):
                original = str(row['roman_numerals'])
                cleaned = convert_scale_degrees(original)
                
                if original != cleaned:
                    converted_count += 1
                    if converted_count <= 5:  # Show first 5 examples
                        print(f"   {original} → {cleaned}")
                
                df_cleaned.at[idx, 'roman_numerals'] = cleaned
                processed_count += 1
        
        print(f"✅ Processed {processed_count} rows")
        print(f"✅ Converted {converted_count} slash chords to scale degrees")
        
        # Save the cleaned file
        print(f"💾 Saving cleaned file: {output_file}")
        df_cleaned.to_csv(output_file, index=False)
        
        # Show sample of cleaned data
        print("\n📋 Sample of cleaned data:")
        sample_cols = ['id', 'roman_numerals', 'key']
        if all(col in df_cleaned.columns for col in sample_cols):
            print(df_cleaned[sample_cols].head())
        
        return True
        
    except Exception as e:
        print(f"❌ Error during cleaning: {e}")
        return False

def main():
    """Main function"""
    
    input_file = "chordonomicon_data/stitches/data3_complete_chordonomicon_v2.csv"
    output_file = "chordonomicon_data/cleaned/data3_cleaned_chordonomicon_v2.csv"
    
    # Check if input file exists
    if not os.path.exists(input_file):
        print(f"❌ Input file not found: {input_file}")
        print("Please run the stitching script first!")
        return False
    
    # Create output directory
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    # Clean the Roman numerals
    success = clean_roman_numerals(input_file, output_file)
    
    if success:
        print("\n🎉 Roman numeral cleaning complete!")
        print(f"📁 Cleaned file saved to: {output_file}")
        print("Ready for harmonic profile mapping!")
    else:
        print("\n💥 Cleaning failed!")
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    if not success:
        sys.exit(1) 