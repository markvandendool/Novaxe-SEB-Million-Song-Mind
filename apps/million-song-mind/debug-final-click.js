// FINAL DEBUG - Simulate the EXACT click "I" sequence with REAL data
import fs from 'fs';

console.log('🚨 FINAL DEBUG: Complete "I" click simulation\n');

// Load the actual tonality data
const tonalities = JSON.parse(fs.readFileSync('./public/assets/braid_tonalities.json', 'utf8'));
const cTonality = tonalities.C;

// Step 1: User clicks "I" in harmonic chart
console.log('📍 STEP 1: User clicks "I" in harmonic chart');
const chord = "I";

// Step 2: handleChordSelect logic
console.log('📍 STEP 2: handleChordSelect("I", true)');

const CHORD_SLOTS = [
  'I', 'ii', 'iii', 'IV', 'V', 'vi', 'viiø',
  'I7', 'iiiø', 'II(7)', '#ivø', 'III(7)', '#vº', 'VI(7)', '#iº', 'VII(7)', '#iiº', 'viiº',
  'i', 'iiø', 'bIII', 'iv', 'v', 'bVI', 'bVII', 'Other'
];

const isHarmonicSlot = CHORD_SLOTS.includes(chord);
console.log(`📍 STEP 3: CHORD_SLOTS.includes("${chord}") = ${isHarmonicSlot}`);

// Step 4: Get harmonic to braid mapping 
const HARMONIC_TO_BRAID_MAPPING = {
  'I': 'C'
};

function getHarmonicToBraidMapping(harmonicSlot) {
  const braidChord = HARMONIC_TO_BRAID_MAPPING[harmonicSlot];
  return braidChord ? [braidChord] : [];
}

const braidChords = getHarmonicToBraidMapping(chord);
console.log(`📍 STEP 4: getHarmonicToBraidMapping("${chord}") = [${braidChords.join(', ')}]`);

const chordsToToggle = braidChords;
console.log(`📍 STEP 5: selectedChords will be set to: [${chordsToToggle.join(', ')}]`);

// Step 6: BraidTonal rendering - check what bubbles exist
console.log('\n🎭 STEP 6: BraidTonal bubble generation');

// Simulate getInUse function (always returns noteArr)
function getInUse(noteArr, romanArr, rotation = 0) {
  // ALWAYS use note names for consistency
  return noteArr;
}

const allBubbleArrays = {
  center_left_in_use: getInUse(cTonality.center_major, tonalities.roman.center_major),
  center_right_in_use: getInUse(cTonality.center_minor, tonalities.roman.center_minor),
  left_up_in_use: getInUse(cTonality.left_up, tonalities.roman.left_up),
  left_down_in_use: getInUse(cTonality.left_down, tonalities.roman.left_down),
  right_up_in_use: getInUse(cTonality.right_up, tonalities.roman.right_up),
  right_down_in_use: getInUse(cTonality.right_down, tonalities.roman.right_down),
  fifth_left_up_in_use: getInUse(cTonality.outer_left_up, tonalities.roman.outer_left_up),
  fifth_left_down_in_use: getInUse(cTonality.outer_left_down, tonalities.roman.outer_left_down),
  fifth_right_up_in_use: getInUse(cTonality.outer_right_up, tonalities.roman.outer_right_up),
  fifth_right_down_in_use: getInUse(cTonality.outer_right_down, tonalities.roman.outer_right_down),
};

// Step 7: Find ALL bubbles that contain "C"
console.log('\n📍 STEP 7: All bubbles that will be checked by isSelected():');
const selectedChords = chordsToToggle; // ["C"]

let totalBubbles = 0;
let selectedBubbles = 0;

Object.entries(allBubbleArrays).forEach(([arrayName, bubbles]) => {
  console.log(`\n${arrayName}:`);
  bubbles.forEach((bubble, i) => {
    totalBubbles++;
    const isThisBubbleSelected = selectedChords.includes(bubble);
    if (isThisBubbleSelected) selectedBubbles++;
    
    const status = isThisBubbleSelected ? '✅ SELECTED' : '  ';
    console.log(`  [${i}] "${bubble}" ${status}`);
  });
});

console.log(`\n🎯 FINAL RESULT:`);
console.log(`Total bubbles: ${totalBubbles}`);
console.log(`Selected bubbles: ${selectedBubbles}`);
console.log(`Selection ratio: ${selectedBubbles}/${totalBubbles}`);

console.log(`\n🚨 EXPECTED: Only 1 bubble ("C") should be selected`);
console.log(`🚨 ACTUAL: ${selectedBubbles} bubbles selected`);

if (selectedBubbles > 1) {
  console.log('\n💥 PROBLEM CONFIRMED: Multiple bubbles selected!');
  console.log('🔍 Bubbles that would light up:');
  Object.entries(allBubbleArrays).forEach(([arrayName, bubbles]) => {
    bubbles.forEach(bubble => {
      if (selectedChords.includes(bubble)) {
        console.log(`  - "${bubble}" (from ${arrayName})`);
      }
    });
  });
} else {
  console.log('\n✅ NO PROBLEM: Only correct bubble selected');
}
