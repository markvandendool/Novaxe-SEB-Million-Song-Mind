// Quick test to check dropdown content
console.log('=== DROPDOWN CONTENT TEST ===');

const chordEl = document.getElementById('chord-inst');
const bassEl = document.getElementById('bass-inst');
const melodyEl = document.getElementById('melody-inst');

console.log('Chord dropdown found:', !!chordEl);
console.log('Bass dropdown found:', !!bassEl);
console.log('Melody dropdown found:', !!melodyEl);

if (chordEl) {
    console.log('Chord dropdown options:', chordEl.innerHTML);
    console.log('Chord dropdown option count:', chordEl.options.length);
}

if (bassEl) {
    console.log('Bass dropdown options:', bassEl.innerHTML);
    console.log('Bass dropdown option count:', bassEl.options.length);
}

if (melodyEl) {
    console.log('Melody dropdown options:', melodyEl.innerHTML);
    console.log('Melody dropdown option count:', melodyEl.options.length);
}

console.log('=== END TEST ===');
