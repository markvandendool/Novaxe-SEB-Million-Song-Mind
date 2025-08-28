// Minimal local app state store with pub/sub. No external deps.

const initial = {
    key: 'C',
    lineup: [],
    withSeventh: false,
    bassEnabled: true,
    melodyEnabled: false,
    lastChord: null,
};

const state = { ...initial };
const subs = new Set();

export function getState() { return { ...state }; }

export function subscribe(listener) {
    if (typeof listener !== 'function') return () => { };
    subs.add(listener);
    try { listener(getState()); } catch (_) { }
    return () => subs.delete(listener);
}

export function setState(patch) {
    if (!patch || typeof patch !== 'object') return;
    Object.assign(state, patch);
    for (const fn of subs) { try { fn(getState()); } catch (_) { } }
}

export function resetState() {
    Object.assign(state, initial);
    for (const fn of subs) { try { fn(getState()); } catch (_) { } }
}


