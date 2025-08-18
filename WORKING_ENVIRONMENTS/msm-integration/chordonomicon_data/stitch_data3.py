#!/usr/bin/env python3
"""
Data3 Stitching Script
Combines Mac Pro and Mac Studio outputs into complete data3 file
"""

import pandas as pd
import os
import sys
from pathlib import Path

def stitch_data3_files():
    """Stitch together Mac Pro and Mac Studio data3 outputs"""
    
    # Define file paths
    macpro_file = "chordonomicon_data/outputs/data3_macpro_chordonomicon_v2.csv"
    studio_file = "chordonomicon_data/outputs/data3_studio_chordonomicon_v2.csv"
    output_file = "chordonomicon_data/stitches/data3_complete_chordonomicon_v2.csv"
    
    print("🔗 STITCHING DATA3 FILES")
    print("=" * 50)
    
    # Check if input files exist
    if not os.path.exists(macpro_file):
        print(f"❌ Mac Pro file not found: {macpro_file}")
        print("Please place the Mac Pro output file in chordonomicon_data/outputs/")
        return False
        
    if not os.path.exists(studio_file):
        print(f"❌ Mac Studio file not found: {studio_file}")
        print("Please place the Mac Studio output file in chordonomicon_data/outputs/")
        return False
    
    try:
        # Read the files
        print(f"📖 Reading Mac Pro file: {macpro_file}")
        macpro_df = pd.read_csv(macpro_file)
        print(f"   Mac Pro rows: {len(macpro_df)}")
        
        print(f"📖 Reading Mac Studio file: {studio_file}")
        studio_df = pd.read_csv(studio_file)
        print(f"   Mac Studio rows: {len(studio_df)}")
        
        # Concatenate the dataframes
        print("🔗 Concatenating files...")
        combined_df = pd.concat([macpro_df, studio_df], ignore_index=True)
        print(f"   Combined rows: {len(combined_df)}")
        
        # Create output directory if it doesn't exist
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        
        # Save the combined file
        print(f"💾 Saving combined file: {output_file}")
        combined_df.to_csv(output_file, index=False)
        
        print("✅ Stitching complete!")
        print(f"📊 Total rows in combined file: {len(combined_df)}")
        
        # Display sample of the combined data
        print("\n📋 Sample of combined data:")
        print(combined_df.head())
        
        return True
        
    except Exception as e:
        print(f"❌ Error during stitching: {e}")
        return False

if __name__ == "__main__":
    success = stitch_data3_files()
    if success:
        print("\n🎉 Ready for scale degree conversion!")
    else:
        print("\n💥 Stitching failed!")
        sys.exit(1) 