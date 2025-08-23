import { parseUnifiedCSVData } from './utils/cpmlParser.ts';
import * as fs from 'fs';

// Test the data3 CSV parsing with real files
async function testData3Parsing() {
  console.log('🧪 Testing data3 CSV parsing with real files...\n');
  
  try {
    // Test with Mac Pro data3 file
    console.log('📁 Testing Mac Pro data3 file...');
    const macProContent = fs.readFileSync('src/components/ui/data3_macpro_chordonomicon_v2.csv', 'utf-8');
    const macProResult = parseUnifiedCSVData(macProContent);
    
    console.log(`✅ Mac Pro parsing successful:`);
    console.log(`   - Format: ${macProResult.format}`);
    console.log(`   - Total rows: ${macProResult.totalRows}`);
    console.log(`   - Successful rows: ${macProResult.successfulRows}`);
    console.log(`   - Skipped rows: ${macProResult.skippedRows}`);
    console.log(`   - Harmonic data points: ${macProResult.harmonicData?.length || 0}`);
    
    // Show first few harmonic data points
    if (macProResult.harmonicData && macProResult.harmonicData.length > 0) {
      console.log('\n📊 First 5 harmonic data points:');
      macProResult.harmonicData.slice(0, 5).forEach(item => {
        console.log(`   - ${item.chord}: ${item.percent.toFixed(1)}% (${item.total} instances)`);
      });
    }
    
    // Test with Studio data3 file
    console.log('\n📁 Testing Studio data3 file...');
    const studioContent = fs.readFileSync('src/components/ui/data3_studio_chordonomicon_v2.csv', 'utf-8');
    const studioResult = parseUnifiedCSVData(studioContent);
    
    console.log(`✅ Studio parsing successful:`);
    console.log(`   - Format: ${studioResult.format}`);
    console.log(`   - Total rows: ${studioResult.totalRows}`);
    console.log(`   - Successful rows: ${studioResult.successfulRows}`);
    console.log(`   - Skipped rows: ${studioResult.skippedRows}`);
    console.log(`   - Harmonic data points: ${studioResult.harmonicData?.length || 0}`);
    
    // Show first few harmonic data points
    if (studioResult.harmonicData && studioResult.harmonicData.length > 0) {
      console.log('\n📊 First 5 harmonic data points:');
      studioResult.harmonicData.slice(0, 5).forEach(item => {
        console.log(`   - ${item.chord}: ${item.percent.toFixed(1)}% (${item.total} instances)`);
      });
    }
    
    // Test chord filtering logic
    console.log('\n🎵 Testing chord filtering...');
    const testSong = macProResult.songs[0];
    if (testSong) {
      console.log(`   - Test song ID: ${testSong.id}`);
      console.log(`   - Roman numerals: ${testSong.roman_numerals?.substring(0, 100)}...`);
      console.log(`   - Contains 'I': ${testSong.roman_numerals?.includes('I')}`);
      console.log(`   - Contains 'V': ${testSong.roman_numerals?.includes('V')}`);
      console.log(`   - Contains 'IV': ${testSong.roman_numerals?.includes('IV')}`);
    }
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testData3Parsing(); 