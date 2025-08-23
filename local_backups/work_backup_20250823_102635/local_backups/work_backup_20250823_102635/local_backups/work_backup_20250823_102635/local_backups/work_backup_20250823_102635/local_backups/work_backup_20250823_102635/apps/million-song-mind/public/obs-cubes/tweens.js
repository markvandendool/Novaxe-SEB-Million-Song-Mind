// Unified tween engine used across the app. Behavior matches previous inline helpers.

export const activeTweens = [];

export function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function tweenObject({ duration = 800, onUpdate, onComplete, ease = easeInOutCubic, owner = null }) {
    const start = performance.now();
    const tw = { cancelled: false, owner };
    tw.tick = (now) => {
        if (tw.cancelled) return true;
        const t = Math.min(1, (now - start) / duration);
        const v = ease(t);
        onUpdate && onUpdate(v);
        if (t >= 1) { onComplete && onComplete(); return true; }
        return false;
    };
    activeTweens.push(tw);
    return tw;
}

export function cancelTweensFor(obj) {
    for (const tw of activeTweens) {
        if (tw.owner === obj) tw.cancelled = true;
    }
}

export function animatePosition(obj, to, duration = 700) {
    const from = obj.position.clone();
    cancelTweensFor(obj);
    return tweenObject({
        duration, owner: obj, onUpdate: (v) => {
            obj.position.lerpVectors(from, to, v);
        }
    });
}

export function animateQuaternion(obj, toQuat, duration = 900) {
    const fromQuat = obj.quaternion.clone();
    const to = toQuat.clone();
    return tweenObject({
        duration, owner: obj, onUpdate: (v) => {
            obj.quaternion.slerpQuaternions(fromQuat, to, v);
        }
    });
}

export function animateScale(obj, toScalar, duration = 500) {
    const from = obj.scale.clone();
    const to = new THREE.Vector3(toScalar, toScalar, toScalar);
    cancelTweensFor(obj);
    return tweenObject({
        duration, owner: obj, onUpdate: (v) => {
            obj.scale.lerpVectors(from, to, v);
        }
    });
}

export function animateVector(vec, to, duration = 800) {
    const from = vec.clone();
    return tweenObject({
        duration, owner: vec, onUpdate: (v) => {
            vec.lerpVectors(from, to, v);
        }
    });
}


