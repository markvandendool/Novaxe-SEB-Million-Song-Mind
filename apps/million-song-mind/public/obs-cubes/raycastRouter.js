// Minimal, behavior-preserving raycast router used by main.js
// Priority: centerPlay > overlay/front-face > other faces

export function pickCenterPlay(hits, parentObj) {
    if (!Array.isArray(hits) || !parentObj) return null;
    const center = parentObj.userData?.centerPlay;
    if (!center) {
        // fallback to identity check
        for (const h of hits) { const o = h.object; if (o && o.userData && o.userData.isCenterPlay && o.userData.parent === parentObj) return h; }
        return null;
    }
    // Choose the hit closest to the center circle’s position on Z+ face
    let best = null; let bestDist = Infinity;
    for (const h of hits) {
        const p = h.point || null; if (!p) continue;
        const cp = center.getWorldPosition(new (center.position.constructor)());
        const d = Math.hypot(p.x - cp.x, p.y - cp.y);
        if (d < bestDist) { bestDist = d; best = h; }
    }
    // Treat within radius as center hit
    if (bestDist < 0.35) return best;
    return null;
}

export function isFrontOverlayHit(hit, parentObj) {
    if (!hit || !parentObj) return false;
    const obj = hit.object;
    if (!obj) return false;
    if (obj === parentObj.userData?.overlay || obj.parent === parentObj) return true;
    return false;
}


