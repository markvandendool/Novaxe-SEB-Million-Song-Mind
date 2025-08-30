// ShelfMapService: loads and validates the official shelf map JSON.
// Intentionally lightweight (no external deps) and browser-friendly.

function isFiniteNumber(n) {
    return typeof n === 'number' && Number.isFinite(n);
}

function validateMap(json) {
    if (!json || typeof json !== 'object') throw new Error('Invalid map: not an object');
    const out = { positions: {}, scales: {} };
    const pos = json.positions || {};
    if (typeof pos !== 'object') throw new Error('Invalid map: positions not an object');
    for (const [k, v] of Object.entries(pos)) {
        if (!v || typeof v !== 'object') continue;
        const { x, y, z } = v;
        if (isFiniteNumber(x) && isFiniteNumber(y) && isFiniteNumber(z)) {
            out.positions[k] = { x, y, z };
        }
    }
    const scales = json.scales || {};
    if (typeof scales === 'object') {
        for (const [k, v] of Object.entries(scales)) {
            if (isFiniteNumber(v)) out.scales[k] = v;
        }
    }
    return out;
}

export async function loadOfficialMap(url = './Shelf%20Map%20Official.json') {
    const u = `${url}?v=${Date.now()}`;
    const res = await fetch(u, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Map fetch failed: ${res.status}`);
    const json = await res.json();
    return validateMap(json);
}


