#!/usr/bin/env node

import { parseUnifiedCSVData } from '../utils/cpmlParser';
import { parseHUVFingerprint } from '../lib/utils';
import * as fs from 'fs';

// Test the data3 ingest logic
const testData3Ingest = () => {
  console.log('🧪 Testing Data3 Ingest Logic');
  console.log('================================');
  
  try {
    // Read the test sample
    const csvContent = fs.readFileSync('test_data3_sample.csv', 'utf-8');
    console.log('✅ Loaded test CSV file');
    
    // Parse using unified parser
    const result = parseUnifiedCSVData(csvContent);
    console.log(`✅ Format detected: ${result.format}`);
    console.log(`✅ Songs parsed: ${result.songs.length}`);
    console.log(`✅ Total rows: ${result.totalRows}`);
    console.log(`✅ Successful rows: ${result.successfulRows}`);
    console.log(`✅ Skipped rows: ${result.skippedRows}`);
    
    if (result.skippedReasons.length > 0) {
      console.log('⚠️ Skipped reasons:');
      result.skippedReasons.forEach(reason => console.log(`  - ${reason}`));
    }
    
    // Test TRUE HUV fingerprint parsing
    if (result.songs.length > 0) {
      const firstSong = result.songs[0];
      console.log('\n🎵 First Song Analysis:');
      console.log(`  ID: ${firstSong.id}`);
      console.log(`  Artist: ${firstSong.artist_id}`);
      console.log(`  Key: ${firstSong.key}`);
      console.log(`  Roman Numerals: ${firstSong.roman_numerals}`);
      console.log(`  Sections: ${firstSong.sections.length}`);
      
      if (firstSong.harmonic_fingerprint) {
        console.log(`  TRUE HUV Fingerprint: ${firstSong.harmonic_fingerprint.substring(0, 100)}...`);
        
        // Test HUV parsing
        const huvData = parseHUVFingerprint(firstSong.harmonic_fingerprint);
        console.log(`  HUV Sections: ${huvData.sections.length}`);
        console.log(`  Total Intervals: ${huvData.totalIntervals}`);
        
        huvData.sections.forEach((section, i) => {
          console.log(`    Section ${i + 1}: ${section.sectionName} (${section.intervals.length} intervals)`);
        });
      }
      
      // Check Spotify metadata
      console.log('\n📱 Spotify Metadata:');
      console.log(`  Artist Name: ${firstSong.artist_name || 'PENDING'}`);
      console.log(`  Song Name: ${firstSong.song_name || 'PENDING'}`);
      console.log(`  Spotify Song ID: ${firstSong.spotify_song_id || 'None'}`);
    }
    
    console.log('\n🎉 Data3 Ingest Test Complete!');
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
};

// Run the test
testData3Ingest(); 