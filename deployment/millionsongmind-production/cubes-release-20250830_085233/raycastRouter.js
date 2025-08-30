// Minimal, behavior-preserving raycast router used by main.js
// Priority: centerPlay > overlay/front-face > other faces

export function pickCenterPlay(hits, parentObj) {
    if (!Array.isArray(hits) || !parentObj) return null;
    for (const h of hits) {
        const o = h.object;
        if (o && o.userData && o.userData.isCenterPlay && o.userData.parent === parentObj) {
            return h;
        }
    }
    return null;
}

export function isFrontOverlayHit(hit, parentObj) {
    if (!hit || !parentObj) return false;
    const obj = hit.object;
    if (!obj) return false;
    if (obj === parentObj.userData?.overlay || obj.parent === parentObj) return true;
    return false;
}


