#!/usr/bin/env python3
"""
🔗 SPOTIFY METADATA MERGER (2-MACHINE)
=======================================

Merges data3.5_spotify_extras_*.csv files from Mac Pro and Mac Studio
into a single data3.5_spotify_extras_complete.csv file.

Usage:
    python merge_spotify_results_2machine.py
"""

import pandas as pd
import os
import glob
from pathlib import Path
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s'
)

def merge_spotify_results():
    """Merge Spotify metadata files from 2 machines into a single dataset"""
    
    print("🔗 SPOTIFY METADATA MERGER (2-MACHINE) ACTIVATED")
    print("=" * 50)
    
    # Expected files
    files = [
        "data3.5_spotify_extras_macpro.csv",
        "data3.5_spotify_extras_studio.csv"
    ]
    
    output_file = "data3.5_spotify_extras_complete.csv"
    
    # Check which files exist
    existing_files = []
    for file in files:
        if os.path.exists(file):
            existing_files.append(file)
            print(f"✅ Found: {file}")
        else:
            print(f"❌ Missing: {file}")
    
    if not existing_files:
        print("❌ No Spotify metadata files found!")
        print("Expected files:")
        for file in files:
            print(f"  - {file}")
        return False
    
    # Load and merge files
    dataframes = []
    total_rows = 0
    
    for file in existing_files:
        print(f"📊 Loading {file}...")
        try:
            df = pd.read_csv(file)
            print(f"  ✅ Loaded {len(df)} rows")
            dataframes.append(df)
            total_rows += len(df)
        except Exception as e:
            print(f"  ❌ Error loading {file}: {e}")
            return False
    
    # Concatenate all dataframes
    print(f"🔗 Merging {len(dataframes)} files...")
    merged_df = pd.concat(dataframes, ignore_index=True)
    
    # Remove duplicates based on spotify_song_id
    print("🧹 Removing duplicates...")
    initial_count = len(merged_df)
    merged_df = merged_df.drop_duplicates(subset=['spotify_song_id'], keep='first')
    final_count = len(merged_df)
    duplicates_removed = initial_count - final_count
    
    print(f"  📊 Initial rows: {initial_count}")
    print(f"  📊 Final rows: {final_count}")
    print(f"  🗑️  Duplicates removed: {duplicates_removed}")
    
    # Sort by spotify_song_id for consistency
    print("📋 Sorting by spotify_song_id...")
    merged_df = merged_df.sort_values('spotify_song_id').reset_index(drop=True)
    
    # Save merged file
    print(f"💾 Saving merged data to {output_file}...")
    merged_df.to_csv(output_file, index=False)
    
    # Print summary
    print("")
    print("🎉 MERGE COMPLETE!")
    print("=" * 30)
    print(f"📁 Output: {output_file}")
    print(f"📊 Total tracks: {len(merged_df)}")
    print(f"📊 Columns: {len(merged_df.columns)}")
    print("")
    print("📋 Column summary:")
    for col in merged_df.columns:
        non_null = merged_df[col].notna().sum()
        print(f"  {col}: {non_null}/{len(merged_df)} ({non_null/len(merged_df)*100:.1f}%)")
    
    return True

def check_processing_status():
    """Check the status of both machines"""
    
    print("🔍 CHECKING PROCESSING STATUS (2-MACHINE)")
    print("=" * 40)
    
    # Check for log files and temp files
    log_files = [
        "studio_spotify.log",
        "macpro_spotify.log"
    ]
    
    temp_files = [
        "data3.5_spotify_extras_studio.csv.temp",
        "data3.5_spotify_extras_macpro.csv.temp"
    ]
    
    print("📊 Log files:")
    for log_file in log_files:
        if os.path.exists(log_file):
            size = os.path.getsize(log_file)
            print(f"  ✅ {log_file} ({size} bytes)")
        else:
            print(f"  ❌ {log_file} (not found)")
    
    print("📊 Temp files (progress saves):")
    for temp_file in temp_files:
        if os.path.exists(temp_file):
            size = os.path.getsize(temp_file)
            print(f"  ✅ {temp_file} ({size} bytes)")
        else:
            print(f"  ❌ {temp_file} (not found)")
    
    print("📊 Final files:")
    final_files = [
        "data3.5_spotify_extras_studio.csv",
        "data3.5_spotify_extras_macpro.csv"
    ]
    
    for final_file in final_files:
        if os.path.exists(final_file):
            size = os.path.getsize(final_file)
            print(f"  ✅ {final_file} ({size} bytes)")
        else:
            print(f"  ❌ {final_file} (not found)")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--status":
        check_processing_status()
    else:
        success = merge_spotify_results()
        if success:
            print("\n✅ MERGE COMPLETE!")
        else:
            print("\n❌ MERGE FAILED!") 