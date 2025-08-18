#!/usr/bin/env python3
"""
🤖 AUTO-STITCH TRI-SYSTEM MERGER
Automated script to monitor iMac Spotify progress and merge all datasets
"""

import os
import time
import pandas as pd
import subprocess
import logging
from datetime import datetime
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TimeElapsedColumn
from rich.panel import Panel
from rich.table import Table

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)
console = Console()

class AutoStitchTriSystem:
    def __init__(self):
        self.macpro_file = "data3_macpro_chordonomicon_v2.csv"
        self.studio_file = "data3_studio_chordonomicon_v2.csv"
        self.imac_file = "data3.5_spotify_extras_imac.csv"
        self.final_output = "data3_complete_tri_system.csv"
        self.imac_log = "imac_unified.log"
        
    def check_imac_status(self):
        """Check if iMac Spotify processing is complete"""
        try:
            # Check if iMac log exists and contains completion message
            result = subprocess.run([
                'ssh', '-i', '~/imackeys', 'Worker3@10.0.0.66', 
                'test -f ~/imac_unified.log && tail -n 5 ~/imac_unified.log | grep -q "✅ Spotify metadata complete"'
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                return True
                
            # Also check if the output file exists and has substantial size
            result = subprocess.run([
                'ssh', '-i', '~/imackeys', 'Worker3@10.0.0.66',
                'test -f ~/data3.5_spotify_extras_imac.csv && ls -lh ~/data3.5_spotify_extras_imac.csv'
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                # Check file size (should be substantial if complete)
                size_info = result.stdout.strip()
                if 'M' in size_info or 'G' in size_info:  # File is substantial size
                    return True
                    
            return False
            
        except Exception as e:
            logger.error(f"Error checking iMac status: {e}")
            return False
    
    def copy_imac_data(self):
        """Copy iMac Spotify data to local directory"""
        try:
            console.print("📋 Copying iMac Spotify metadata...")
            result = subprocess.run([
                'scp', '-i', '~/imackeys', 
                'Worker3@10.0.0.66:~/data3.5_spotify_extras_imac.csv', 
                './data3.5_spotify_extras_imac.csv'
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                console.print("✅ iMac data copied successfully")
                return True
            else:
                console.print(f"❌ Failed to copy iMac data: {result.stderr}")
                return False
                
        except Exception as e:
            console.print(f"❌ Error copying iMac data: {e}")
            return False
    
    def merge_datasets(self):
        """Merge all three datasets into final complete dataset"""
        try:
            console.print("🔗 Merging tri-system datasets...")
            
            # Load Mac Pro data
            console.print("📖 Loading Mac Pro data...")
            macpro_df = pd.read_csv(self.macpro_file)
            console.print(f"✅ Mac Pro: {len(macpro_df)} rows loaded")
            
            # Load Mac Studio data
            console.print("📖 Loading Mac Studio data...")
            studio_df = pd.read_csv(self.studio_file)
            console.print(f"✅ Mac Studio: {len(studio_df)} rows loaded")
            
            # Load iMac Spotify data
            console.print("📖 Loading iMac Spotify data...")
            imac_df = pd.read_csv(self.imac_file)
            console.print(f"✅ iMac: {len(imac_df)} rows loaded")
            
            # Combine Mac Pro and Mac Studio data
            console.print("🔗 Combining Mac Pro + Mac Studio data...")
            combined_df = pd.concat([macpro_df, studio_df], ignore_index=True)
            console.print(f"✅ Combined: {len(combined_df)} rows")
            
            # Merge with Spotify data on spotify_song_id
            console.print("🔗 Merging with Spotify metadata...")
            final_df = pd.merge(
                combined_df, 
                imac_df, 
                on='spotify_song_id', 
                how='left',
                suffixes=('', '_spotify')
            )
            
            console.print(f"✅ Final merged: {len(final_df)} rows")
            
            # Save final dataset
            console.print("💾 Saving complete tri-system dataset...")
            final_df.to_csv(self.final_output, index=False)
            
            # Display summary
            self.display_summary(final_df)
            
            return True
            
        except Exception as e:
            console.print(f"❌ Error merging datasets: {e}")
            return False
    
    def display_summary(self, df):
        """Display summary of final merged dataset"""
        console.print("\n" + "="*80)
        console.print("🎉 TRI-SYSTEM MERGE COMPLETE!")
        console.print("="*80)
        
        # Create summary table
        table = Table(title="Final Dataset Summary")
        table.add_column("Metric", style="cyan")
        table.add_column("Value", style="green")
        
        table.add_row("Total Songs", str(len(df)))
        table.add_row("Columns", str(len(df.columns)))
        table.add_row("File Size", f"{os.path.getsize(self.final_output) / (1024*1024):.1f} MB")
        
        # Spotify metadata coverage
        spotify_columns = [col for col in df.columns if 'spotify' in col.lower() or col in ['artist_name', 'song_name', 'album_name', 'popularity', 'tempo', 'key', 'mode']]
        spotify_coverage = df[spotify_columns].notna().any(axis=1).sum()
        table.add_row("Songs with Spotify Metadata", f"{spotify_coverage} ({spotify_coverage/len(df)*100:.1f}%)")
        
        # TRUE HUV coverage
        huv_coverage = df['harmonic_fingerprint'].notna().sum()
        table.add_row("Songs with TRUE HUV", f"{huv_coverage} ({huv_coverage/len(df)*100:.1f}%)")
        
        console.print(table)
        
        # Show sample columns
        console.print("\n📋 Sample Columns:")
        for i, col in enumerate(df.columns[:10]):
            console.print(f"  {i+1:2d}. {col}")
        if len(df.columns) > 10:
            console.print(f"  ... and {len(df.columns) - 10} more columns")
        
        console.print(f"\n💾 Complete dataset saved: {self.final_output}")
        console.print("🚀 Ready for Million Song Mind app development!")
    
    def monitor_and_stitch(self):
        """Main monitoring and stitching function"""
        console.print(Panel.fit(
            "🤖 AUTO-STITCH TRI-SYSTEM MONITOR",
            style="bold blue"
        ))
        
        console.print("📊 Monitoring iMac Spotify progress...")
        console.print("📁 Waiting for completion to auto-merge datasets...")
        
        check_count = 0
        while True:
            check_count += 1
            current_time = datetime.now().strftime("%H:%M:%S")
            
            console.print(f"\n[{current_time}] Check #{check_count}: Checking iMac status...")
            
            if self.check_imac_status():
                console.print("🎉 iMac Spotify processing COMPLETE!")
                console.print("🚀 Starting automated merge...")
                
                if self.copy_imac_data():
                    if self.merge_datasets():
                        console.print("✅ TRI-SYSTEM MERGE SUCCESSFUL!")
                        return True
                    else:
                        console.print("❌ Merge failed")
                        return False
                else:
                    console.print("❌ Failed to copy iMac data")
                    return False
            else:
                console.print("⏳ iMac still processing... (rate limited)")
                console.print("💤 Waiting 5 minutes before next check...")
                time.sleep(300)  # Wait 5 minutes

def main():
    """Main function"""
    stitcher = AutoStitchTriSystem()
    
    # Check if required files exist
    if not os.path.exists(stitcher.macpro_file):
        console.print(f"❌ Mac Pro file not found: {stitcher.macpro_file}")
        return 1
    
    if not os.path.exists(stitcher.studio_file):
        console.print(f"❌ Mac Studio file not found: {stitcher.studio_file}")
        return 1
    
    console.print("✅ Mac Pro and Mac Studio files found")
    console.print("🤖 Starting automated monitoring and stitching...")
    
    success = stitcher.monitor_and_stitch()
    return 0 if success else 1

if __name__ == "__main__":
    exit(main()) 