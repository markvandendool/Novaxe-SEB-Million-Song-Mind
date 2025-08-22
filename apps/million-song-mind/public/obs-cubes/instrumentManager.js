// Lightweight InstrumentManager for Soundfont-Player with caching and graceful fallback

let BASE_URL = null; // if set, will be passed to Soundfont.instrument

export function setBaseUrl(url) { BASE_URL = url; }

// Map friendly names to known midi-js-soundfonts ids
const NAME_MAP = {
  // Ensembles
  string_ensemble_1: 'string_ensemble_1',
  string_ensemble_2: 'string_ensemble_2',
  choir_aahs: 'choir_aahs',
  // Solo strings
  violin: 'violin',
  cello: 'cello',
  contrabass: 'contrabass',
  // Keys
  acoustic_grand_piano: 'acoustic_grand_piano',
  electric_piano_1: 'electric_piano_1',
  // Winds/Brass
  flute: 'flute',
  clarinet: 'clarinet',
  trumpet: 'trumpet',
  // Bass
  acoustic_bass: 'acoustic_bass',
  electric_bass_finger: 'electric_bass_finger',
  synth_bass_1: 'synth_bass_1',
};

function resolveName(name) {
  return NAME_MAP[name] || name;
}

export async function ensureInstruments(ac, names) {
  const out = {};
  try {
    if (!window.Soundfont) return { chord: null, bass: null, melody: null };
    const opts = BASE_URL
      ? { nameToUrl: (n) => `${BASE_URL}/${resolveName(n)}-mp3.js` }
      : undefined;
    // Load sequentially to avoid spikes; cached by Soundfont internally
    for (const [key, name] of Object.entries(names)) {
      try { out[key] = await window.Soundfont.instrument(ac, resolveName(name), opts); }
      catch (_) { out[key] = null; }
    }
    return out;
  } catch (_) {
    return { chord: null, bass: null, melody: null };
  }
}


