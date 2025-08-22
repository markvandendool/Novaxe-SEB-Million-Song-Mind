// DEBUG SCRIPT - Simulate clicking "I" to trace the exact execution path
console.log('🚨 DEBUGGING: Simulating click on "I" in harmonic chart\n');

// Simulate the exact code path from MillionSongMind.tsx handleChordSelect
function simulateClickI() {
  console.log('📍 STEP 1: User clicks "I" in harmonic chart');
  
  const chord = "I";
  const isSelected = true; // Assuming we want to select it
  
  console.log(`📍 STEP 2: handleChordSelect("${chord}", ${isSelected}) called`);
  
  // Import the constants (simulate)
  const CHORD_SLOTS = [
    'I', 'ii', 'iii', 'IV', 'V', 'vi', 'viiø',
    'I7', 'iiiø', 'II(7)', '#ivø', 'III(7)', '#vº', 'VI(7)', '#iº', 'VII(7)', '#iiº', 'viiº',
    'i', 'iiø', 'bIII', 'iv', 'v', 'bVI', 'bVII', 'Other'
  ];
  
  console.log(`📍 STEP 3: CHORD_SLOTS.includes("${chord}") = ${CHORD_SLOTS.includes(chord)}`);
  
  let chordsToToggle = [];
  
  if (CHORD_SLOTS.includes(chord)) {
    console.log(`📊 HARMONIC SLOT CLICKED: "${chord}"`);
    
    // Simulate getHarmonicToBraidMapping - the EXACT mapping from definiteBraidMapping.ts
    const HARMONIC_TO_BRAID_MAPPING = {
      'I': 'C',
      'ii': 'Dm',
      'iii': 'Em',
      'IV': 'F',
      'V': 'G',
      'vi': 'Am',
      'viiø': 'Bø',
      'I7': 'C7',
      'iiiø': 'Eø',
      'II(7)': 'D7',
      '#ivø': 'F#ø',
      'III(7)': 'E7',
      '#vº': 'G#º',
      'VI(7)': 'A7',
      '#iº': 'C#º',
      'VII(7)': 'B7',
      '#iiº': 'D#º',
      'i': 'Cm',
      'iiø': 'Dø',
      'bIII': 'Eb',
      'iv': 'Fm',
      'v': 'Gm',
      'bVI': 'Ab',
      'bVII': 'Bb',
      'V(b9)': 'G7(b9)',
      'viiº': 'Bº7'
    };
    
    function getHarmonicToBraidMapping(harmonicSlot) {
      const braidChord = HARMONIC_TO_BRAID_MAPPING[harmonicSlot];
      return braidChord ? [braidChord] : [];
    }
    
    const braidChords = getHarmonicToBraidMapping(chord);
    console.log(`📍 STEP 4: getHarmonicToBraidMapping("${chord}") returned:`, braidChords);
    
    chordsToToggle = braidChords;
    console.log(`📍 STEP 5: chordsToToggle = [${chordsToToggle.join(', ')}]`);
  }
  
  console.log(`📍 STEP 6: Final chordsToToggle:`, chordsToToggle);
  console.log(`📍 STEP 7: selectedChords should be set to: [${chordsToToggle.join(', ')}]`);
  
  // Now check what BraidTonal.isSelected should do
  console.log('\n🎯 BRAID SELECTION LOGIC:');
  console.log('📍 STEP 8: BraidTonal.isSelected() will be called for each braid bubble');
  
  // Test bubbles that should and shouldn't light up
  const testBubbles = ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'C7', 'D7', 'CFr', 'Eb'];
  testBubbles.forEach(bubble => {
    const shouldBeSelected = chordsToToggle.includes(bubble);
    console.log(`  isSelected("${bubble}") should return: ${shouldBeSelected}`);
  });
  
  console.log('\n🚨 EXPECTED RESULT:');
  console.log('✅ ONLY "C" bubble should light up');
  console.log('❌ CFr, C7, C#º should NOT light up');
  console.log('\nIf multiple bubbles are lighting up, the problem is:');
  console.log('  1. chordsToToggle contains wrong values, OR');
  console.log('  2. selectedChords state contains wrong values, OR');
  console.log('  3. isSelected() logic is wrong, OR');
  console.log('  4. Bubble identifiers dont match selectedChords values');
}

simulateClickI();
