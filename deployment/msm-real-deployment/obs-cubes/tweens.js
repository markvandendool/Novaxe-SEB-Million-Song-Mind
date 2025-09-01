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

export function animateQuaternion(obj, toQuat, duration = 900, onCompleteUser) {
    const fromQuat = obj.quaternion.clone();
    const to = toQuat.clone();
    let finished = false;
    return tweenObject({
        duration, owner: obj,
        onUpdate: (v) => {
            obj.quaternion.slerpQuaternions(fromQuat, to, v);
        },
        onComplete: () => {
            if (finished) return; finished = true;
            try {
                // Snap to nearest quarter-turn around Z (cube faces) and emit rotation-finished
                const zAngles = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
                const cur = new THREE.Euler().setFromQuaternion(obj.quaternion, 'XYZ');
                // Only snap around Z; keep X/Y small if any drift
                let z = cur.z;
                let best = zAngles[0], bestDiff = Math.abs(normalizeAngle(z) - normalizeAngle(zAngles[0]));
                for (let i = 1; i < zAngles.length; i++) {
                    const d = Math.abs(normalizeAngle(z) - normalizeAngle(zAngles[i]));
                    if (d < bestDiff) { best = zAngles[i]; bestDiff = d; }
                }
                cur.z = best; cur.x = 0; cur.y = 0;
                obj.quaternion.setFromEuler(cur);
                // Update rotationIndex from quaternion via app helper if present
                if (typeof window.syncRotationIndexFromQuaternion === 'function') {
                    window.syncRotationIndexFromQuaternion(obj);
                }
                obj.userData && (obj.userData.rotEventTs = performance.now());
            } catch (_) { }
            try { if (typeof onCompleteUser === 'function') onCompleteUser(); } catch (_) { }
        }
    });
}

function normalizeAngle(a) {
    let x = a; while (x <= -Math.PI) x += Math.PI * 2; while (x > Math.PI) x -= Math.PI * 2; return x;
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


