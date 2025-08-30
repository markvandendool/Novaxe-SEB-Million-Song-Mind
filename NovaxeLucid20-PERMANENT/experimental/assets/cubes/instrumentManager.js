// Lightweight InstrumentManager with primary WebAudioFont and fallback Soundfont-Player

let BASE_URL = null; // optional custom base for Soundfont-Player
const DEFAULT_SF = 'MusyngKite';
const FALLBACK_SF = 'FluidR3_GM';

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

// ---------- Soundfont-Player path (fallback) ----------
async function loadSfSet(ac, names, baseUrlOrNull, soundfontName) {
  const out = {};
  if (!window.Soundfont) return { chord: null, bass: null, melody: null };
  const opts = baseUrlOrNull
    ? {
      nameToUrl: (name, _sf, format) => {
        const resolved = resolveName(name);
        const fmt = format || 'mp3';
        const url = `${baseUrlOrNull}/${resolved}-${fmt}.js`;
        try { console.log('[obs-cubes] Loading soundfont', resolved, url); } catch (_) { }
        return url;
      }
    }
    : { soundfont: soundfontName || DEFAULT_SF };
  for (const [key, name] of Object.entries(names)) {
    try {
      const n = resolveName(name);
      out[key] = await window.Soundfont.instrument(ac, n, opts);
    } catch (e) {
      try { console.warn('[obs-cubes] Failed to load instrument', name, e); } catch (_) { }
      out[key] = null;
    }
  }
  return out;
}

// ---------- WebAudioFont primary ----------
const GM_NUMBER = {
  string_ensemble_1: 48,
  string_ensemble_2: 49,
  choir_aahs: 52,
  contrabass: 43,
  cello: 42,
  violin: 40,
  acoustic_grand_piano: 0,
  electric_piano_1: 4,
  acoustic_bass: 32,
  electric_bass_finger: 33,
  synth_bass_1: 38,
  flute: 73,
  clarinet: 71,
  trumpet: 56,
};

function toGmNumber(name) {
  const resolved = resolveName(name);
  return GM_NUMBER[resolved] ?? 0;
}

function pad3(n) { return String(n).padStart(3, '0'); }
function midiToFreq(m) { return 440 * Math.pow(2, (m - 69) / 12); }

function loadScript(url) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script'); s.src = url; s.async = true;
    s.onload = () => resolve(); s.onerror = (e) => reject(e);
    document.head.appendChild(s);
  });
}

async function ensureWebAudioFont(ac) {
  if (!window.WebAudioFontPlayer) {
    await loadScript('https://surikov.github.io/webaudiofont/npm/dist/WebAudioFontPlayer.js');
  }
  return new window.WebAudioFontPlayer();
}

async function loadWafPreset(prog) {
  // Use FluidR3 GM preset files hosted by Surikov; naming scheme e.g., 0480_FluidR3_GM_sf2_file.js
  const id = `${pad3(prog)}0_FluidR3_GM_sf2_file`;
  const varName = `_tone_${id}`;
  if (!window[varName]) {
    const url = `https://surikov.github.io/webaudiofontdata/sound/${id}.js`;
    console.log('[obs-cubes] Loading WebAudioFont preset', prog, url);
    await loadScript(url);
  }
  return { varName, preset: window[varName] };
}

async function decodeWafPreset(ac, player, varName, presetObj) {
  // trigger decode; then wait until buffers exist
  try { player.loader.decodeAfterLoading(ac, varName); } catch (_) { }
  const deadline = performance.now() + 4000;
  while (performance.now() < deadline) {
    const zones = presetObj?.zones || [];
    if (zones.length && zones.every(z => z.buffer)) return presetObj;
    await new Promise(r => setTimeout(r, 40));
  }
  return presetObj;
}

function makeWafPlayable(ac, player, presetObj) {
  return {
    play(midi, when = ac.currentTime, opts = {}) {
      const duration = opts.duration ?? 0.5; const gain = opts.gain ?? 0.25;
      player.queueWaveTable(ac, ac.destination, presetObj, when, midiToFreq(midi), duration, gain);
    }
  };
}

export async function ensureInstruments(ac, names) {
  try {
    // Primary: WebAudioFont
    try {
      const player = await ensureWebAudioFont(ac);
      const { varName: chordName, preset: chordP } = await loadWafPreset(toGmNumber(names.chord));
      const { varName: bassName, preset: bassP } = await loadWafPreset(toGmNumber(names.bass));
      const { varName: melodyName, preset: melodyP } = await loadWafPreset(toGmNumber(names.melody));
      const chordPreset = await decodeWafPreset(ac, player, chordName, chordP);
      const bassPreset = await decodeWafPreset(ac, player, bassName, bassP);
      const melodyPreset = await decodeWafPreset(ac, player, melodyName, melodyP);
      return {
        chord: makeWafPlayable(ac, player, chordPreset),
        bass: makeWafPlayable(ac, player, bassPreset),
        melody: makeWafPlayable(ac, player, melodyPreset),
      };
    } catch (e) {
      console.warn('[obs-cubes] WebAudioFont load failed, trying Soundfont-Player fallback', e);
    }
    // Fallback: Soundfont-Player cascade
    if (!window.Soundfont) {
      await loadScript('https://unpkg.com/soundfont-player@0.15.7/dist/soundfont-player.js');
    }
    const first = await loadSfSet(ac, names, BASE_URL, DEFAULT_SF);
    const missing = Object.values(first).some(v => !v);
    if (!missing) return first;
    const second = await loadSfSet(ac, names, null, FALLBACK_SF);
    const stillMissing = Object.values(second).some(v => !v);
    if (!stillMissing) return second;
    const fbBase = 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM';
    return await loadSfSet(ac, names, fbBase, FALLBACK_SF);
  } catch (_) {
    return { chord: null, bass: null, melody: null };
  }
}


