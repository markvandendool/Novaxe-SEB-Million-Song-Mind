// DEBUG SCRIPT - Check what chord names exist in the tonality data that might contain "C"
import fs from 'fs';

console.log('🔍 CHECKING TONALITY DATA FOR C-CONTAINING CHORDS...\n');

// Read the braid_tonalities.json file if it exists
const tonalityPath = '../../assets/braid_tonalities.json';
const publicTonalityPath = './public/assets/braid_tonalities.json';

let tonalities = null;
if (fs.existsSync(tonalityPath)) {
  tonalities = JSON.parse(fs.readFileSync(tonalityPath, 'utf8'));
  console.log('✅ Found tonalities at assets/braid_tonalities.json');
} else if (fs.existsSync(publicTonalityPath)) {
  tonalities = JSON.parse(fs.readFileSync(publicTonalityPath, 'utf8'));
  console.log('✅ Found tonalities at public/assets/braid_tonalities.json');
} else {
  console.log('❌ Could not find braid_tonalities.json');
  console.log('📍 Expected locations:');
  console.log('  - ' + tonalityPath);
  console.log('  - ' + publicTonalityPath);
  process.exit(1);
}

// Get the C tonality set
const cTonality = tonalities.C;
if (!cTonality) {
  console.log('❌ C tonality not found in data');
  process.exit(1);
}

console.log('✅ Found C tonality data');

// Check all arrays for chords containing "C"
const allArrays = [
  { name: 'center_major', data: cTonality.center_major },
  { name: 'center_minor', data: cTonality.center_minor },
  { name: 'left_up', data: cTonality.left_up },
  { name: 'left_down', data: cTonality.left_down },
  { name: 'right_up', data: cTonality.right_up },
  { name: 'right_down', data: cTonality.right_down },
  { name: 'outer_left_up', data: cTonality.outer_left_up },
  { name: 'outer_left_down', data: cTonality.outer_left_down },
  { name: 'outer_right_up', data: cTonality.outer_right_up },
  { name: 'outer_right_down', data: cTonality.outer_right_down }
];

console.log('\n🎯 CHORDS CONTAINING "C":');
console.log('==========================================');

allArrays.forEach(({ name, data }) => {
  if (!data) return;

  const cChords = data.filter(chord => {
    const chordStr = String(chord);
    return chordStr.includes('C') || chordStr.includes('c');
  });

  if (cChords.length > 0) {
    console.log(`📍 ${name}: [${cChords.join(', ')}]`);
  }
});

// Also check Roman arrays if they exist
if (tonalities.roman) {
  console.log('\n🏛️ ROMAN NUMERAL ARRAYS:');
  console.log('==========================================');

  const romanArrays = [
    { name: 'center_major', data: tonalities.roman.center_major },
    { name: 'center_minor', data: tonalities.roman.center_minor },
    { name: 'left_up', data: tonalities.roman.left_up },
    { name: 'left_down', data: tonalities.roman.left_down },
    { name: 'right_up', data: tonalities.roman.right_up },
    { name: 'right_down', data: tonalities.roman.right_down },
    { name: 'outer_left_up', data: tonalities.roman.outer_left_up },
    { name: 'outer_left_down', data: tonalities.roman.outer_left_down },
    { name: 'outer_right_up', data: tonalities.roman.outer_right_up },
    { name: 'outer_right_down', data: tonalities.roman.outer_right_down }
  ];

  romanArrays.forEach(({ name, data }) => {
    if (!data) return;

    const cChords = data.filter(chord => {
      const chordStr = String(chord);
      return chordStr.includes('I') || chordStr.includes('i');
    });

    if (cChords.length > 0) {
      console.log(`📍 ${name}: [${cChords.join(', ')}]`);
    }
  });
}

console.log('\n🚨 ANALYSIS:');
console.log('==========================================');
console.log('If multiple chord arrays contain different C chords like:');
console.log('  - C (from center_major)');
console.log('  - CFr (from somewhere)');
console.log('  - C7 (from applied chords)');
console.log('  - C#º (from diminished)');
console.log('');
console.log('Then when selectedChords = ["C"], isSelected() will return true for ALL of them!');
console.log('');
console.log('The fix would be to ensure EXACT matching in isSelected(), not substring matching.');
