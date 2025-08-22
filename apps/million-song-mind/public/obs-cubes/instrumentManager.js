// Lightweight InstrumentManager for Soundfont-Player with caching and graceful fallback

let BASE_URL = null; // if set, will be passed to Soundfont.instrument

export function setBaseUrl(url) { BASE_URL = url; }

export async function ensureInstruments(ac, names) {
    const out = {};
    try {
        if (!window.Soundfont) return { chord: null, bass: null, melody: null };
        const opts = BASE_URL ? { nameToUrl: (n) => `${BASE_URL}/${n}-mp3.js` } : undefined;
        // Load sequentially to avoid spikes; cached by Soundfont internally
        for (const [key, name] of Object.entries(names)) {
            try { out[key] = await window.Soundfont.instrument(ac, name, opts); }
            catch (_) { out[key] = null; }
        }
        return out;
    } catch (_) {
        return { chord: null, bass: null, melody: null };
    }
}


