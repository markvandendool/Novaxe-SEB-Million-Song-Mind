// Minimal, safe messaging bridge for MSM/Obsidian integration.
// Uses CustomEvent locally and optional postMessage if origins provided.

export function createBridge(opts = {}) {
    const msmOrigin = opts.msmOrigin || window.__MSM_ORIGIN || null;
    const obsOrigin = opts.obsidianOrigin || window.__OBSIDIAN_ORIGIN || null;

    function emit(type, payload) {
        try {
            const detail = { type, payload, ts: Date.now() };
            window.dispatchEvent(new CustomEvent('obs-cubes:event', { detail }));
            if (msmOrigin && window.parent) {
                window.parent.postMessage({ channel: 'MSM', ...detail }, msmOrigin);
            }
            if (obsOrigin && window.parent) {
                window.parent.postMessage({ channel: 'OBSIDIAN', ...detail }, obsOrigin);
            }
        } catch (_) { /* no-op */ }
    }

    function on(type, handler) {
        const listener = (e) => {
            try { if (e?.detail?.type === type) handler(e.detail.payload, e.detail); } catch (_) { }
        };
        window.addEventListener('obs-cubes:event', listener);
        return () => window.removeEventListener('obs-cubes:event', listener);
    }

    return { emit, on };
}


