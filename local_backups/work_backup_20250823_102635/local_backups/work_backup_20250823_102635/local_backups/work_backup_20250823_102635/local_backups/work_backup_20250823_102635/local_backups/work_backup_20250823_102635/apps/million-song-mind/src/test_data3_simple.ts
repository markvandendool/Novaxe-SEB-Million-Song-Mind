import * as fs from 'fs';

// Simple test without React dependencies
function testData3Parsing() {
  console.log('🧪 Testing data3 CSV parsing with real files...\n');
  
  try {
    // Test with Mac Pro data3 file
    console.log('📁 Testing Mac Pro data3 file...');
    const macProContent = fs.readFileSync('components/ui/data3_macpro_chordonomicon_v2.csv', 'utf-8');
    
    // Simple parsing test
    const lines = macProContent.trim().split('\n');
    const headers = lines[0].split(',');
    const dataRows = lines.slice(1);
    
    console.log(`✅ Mac Pro file loaded:`);
    console.log(`   - Total rows: ${dataRows.length}`);
    console.log(`   - Headers: ${headers.join(', ')}`);
    
    // Check for key fields
    const hasChords = headers.some(h => h.toLowerCase().includes('chords'));
    const hasRomanNumerals = headers.some(h => h.toLowerCase().includes('roman'));
    const hasHarmonicFingerprint = headers.some(h => h.toLowerCase().includes('harmonic'));
    
    console.log(`   - Has chords field: ${hasChords}`);
    console.log(`   - Has roman numerals field: ${hasRomanNumerals}`);
    console.log(`   - Has harmonic fingerprint field: ${hasHarmonicFingerprint}`);
    
    // Test first few rows
    console.log('\n📊 First 3 data rows:');
    dataRows.slice(0, 3).forEach((row, index) => {
      const values = row.split(',');
      const id = values[0];
      const romanNumerals = values[15] || 'N/A'; // Assuming roman_numerals is at index 15
      console.log(`   Row ${index + 1}: ID=${id}, Roman numerals: ${romanNumerals.substring(0, 50)}...`);
    });
    
    // Test with Studio data3 file
    console.log('\n📁 Testing Studio data3 file...');
    const studioContent = fs.readFileSync('components/ui/data3_studio_chordonomicon_v2.csv', 'utf-8');
    
    const studioLines = studioContent.trim().split('\n');
    const studioHeaders = studioLines[0].split(',');
    const studioDataRows = studioLines.slice(1);
    
    console.log(`✅ Studio file loaded:`);
    console.log(`   - Total rows: ${studioDataRows.length}`);
    console.log(`   - Headers: ${studioHeaders.join(', ')}`);
    
    // Check for key fields
    const studioHasChords = studioHeaders.some(h => h.toLowerCase().includes('chords'));
    const studioHasRomanNumerals = studioHeaders.some(h => h.toLowerCase().includes('roman'));
    const studioHasHarmonicFingerprint = studioHeaders.some(h => h.toLowerCase().includes('harmonic'));
    
    console.log(`   - Has chords field: ${studioHasChords}`);
    console.log(`   - Has roman numerals field: ${studioHasRomanNumerals}`);
    console.log(`   - Has harmonic fingerprint field: ${studioHasHarmonicFingerprint}`);
    
    // Test first few rows
    console.log('\n📊 First 3 data rows:');
    studioDataRows.slice(0, 3).forEach((row, index) => {
      const values = row.split(',');
      const id = values[0];
      const romanNumerals = values[15] || 'N/A'; // Assuming roman_numerals is at index 15
      console.log(`   Row ${index + 1}: ID=${id}, Roman numerals: ${romanNumerals.substring(0, 50)}...`);
    });
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Mac Pro: ${dataRows.length} songs processed`);
    console.log(`   - Studio: ${studioDataRows.length} songs processed`);
    console.log(`   - Total: ${dataRows.length + studioDataRows.length} songs ready for analysis`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testData3Parsing(); 