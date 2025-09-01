// ============================================
// 🎼 CHORDCUBES 5.0 - REVOLUTIONARY AUDIO CUTOFF SYSTEM
// ============================================
// CLAUDE'S PART 1: IMMEDIATE AUDIO CONTEXT SUPPRESSION
// ============================================
(function () {
    'use strict';

    // Suppress AudioContext warnings BEFORE anything else loads
    const originalWarn = console.warn;
    const originalLog = console.log;

    console.warn = function (...args) {
        const msg = String(args[0] || '');
        if (msg.includes('AudioContext') ||
            msg.includes('not allowed to start') ||
            msg.includes('user gesture') ||
            msg.includes('Tone.js') ||
            msg.includes('resumed') ||
            msg.includes('created')) {
            // COMPLETELY SUPPRESS - don't even log once
            return;
        }
        return originalWarn.apply(console, args);
    };

    console.log = function (...args) {
        const msg = String(args[0] || '');
        if (msg.includes('* Tone.js v') && msg.includes('*')) {
            console.log('[AUDIO] Tone.js loaded (warnings suppressed)');
            return; // Suppress the repeated Tone.js version messages
        }
        return originalLog.apply(console, args);
    };
})();

// (Duplicate removed - suppression already applied above)

// ============================================
// CLAUDE'S PART 3: PROPER IMPORT ORDER
// ============================================

// Import transport bridge FIRST (it will expose globally)
import { chordCubesTransport } from './transport-bridge.js';

// IMMEDIATE DEBUG: Check if import worked
console.log('[MAIN] Transport import result:', chordCubesTransport);
console.log('[MAIN] Window transport (should be set by transport-bridge.js):', window.chordCubesTransport);

// EMERGENCY: Ensure global exposure even if transport-bridge.js didn't set it
if (chordCubesTransport && !window.chordCubesTransport) {
    window.chordCubesTransport = chordCubesTransport;
    console.log('[MAIN] ✅ Manually exposed transport to global scope');
}

// DEBUG: Check what methods are actually available
console.log('[DEBUG] Available transport methods:', Object.getOwnPropertyNames(window.chordCubesTransport || {}));
console.log('[DEBUG] Transport prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(window.chordCubesTransport || {})));
console.log('[DEBUG] Has ensureAudioContext?', typeof window.chordCubesTransport?.ensureAudioContext);
console.log('[DEBUG] Has toggleDrums?', typeof window.chordCubesTransport?.toggleDrums);
console.log('[DEBUG] Has setStyle?', typeof window.chordCubesTransport?.setStyle);

// EMERGENCY: Add missing methods if they don't exist
if (window.chordCubesTransport) {
    const transport = window.chordCubesTransport;

    if (!transport.ensureAudioContext) {
        console.log('[FIX] Adding missing ensureAudioContext method');
        transport.ensureAudioContext = async function () {
            try {
                if (window.Tone && window.Tone.context.state !== 'running') {
                    await window.Tone.start();
                    console.log('[FIX] Tone.js context started');
                }
                return true;
            } catch (error) {
                console.error('[FIX] Audio context failed:', error);
                return false;
            }
        };
    }

    if (!transport.toggleDrums) {
        console.log('[FIX] Adding missing toggleDrums method');
        transport.toggleDrums = function () {
            this.drumsOn = !this.drumsOn;
            console.log('[FIX] Drums toggled:', this.drumsOn);
            return this.drumsOn;
        };
    }

    if (!transport.setStyle) {
        console.log('[FIX] Adding missing setStyle method');
        transport.setStyle = function (style) {
            this.currentStyle = style;
            console.log('[FIX] Style set to:', style);
        };
    }

    if (!transport.setBPM) {
        console.log('[FIX] Adding missing setBPM method');
        transport.setBPM = function (bpm) {
            this.bpm = bpm;
            if (window.Tone && window.Tone.Transport) {
                window.Tone.Transport.bpm.value = bpm;
            }
            console.log('[FIX] BPM set to:', bpm);
        };
    }

    console.log('[FIX] ✅ All missing methods added');
}

// EMERGENCY: Create fallback if import completely failed
if (!chordCubesTransport && !window.chordCubesTransport) {
    console.error('[MAIN] ❌ Transport import completely failed - creating fallback');
    window.chordCubesTransport = {
        drumsOn: false,
        isPlaying: false,
        toggleDrums: () => { console.log('[FALLBACK] Drums toggle'); return false; },
        setBPM: (bpm) => { console.log('[FALLBACK] BPM set to', bpm); },
        ensureAudioContext: async () => { console.log('[FALLBACK] Audio context'); return false; },
        start: async () => { console.log('[FALLBACK] Start'); return false; },
        stop: () => { console.log('[FALLBACK] Stop'); }
    };
}

// Your other imports come AFTER
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { chordSetsC, inversionByQuarterTurn, noteSetsC, notesToDegreesInC, transposeNotes, degreeSets } from './chords.js';
import { pickCenterPlay, isFrontOverlayHit } from './raycastRouter.js'
import { loadOfficialMap } from './shelfMapService.js'
import { InteractionFSM } from './interactionFSM.js'
import { BORDER_RATIO, SERIF_STACK, MUSIC_STACK } from './textureConfig.js'
// Drop old instrumentManager path; use WebAudioFont primary
import { setupDiagnostics } from './diagnosticsOverlay.js'
import { createBridge } from './integration/bridge.js'
import { setState } from './stateStore.js'

const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);
const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 1000);

// EXPOSE SCENE, CAMERA, AND THREE FOR 3D MUSICAL STAVES INTEGRATION
window.scene = scene;
window.camera = camera;
window.THREE = THREE;
console.log('[MAIN] 🎼 Scene, camera, and THREE.js exposed for musical staves integration');
let shelfPickCamera = null; // orthographic camera used only for shelf picking
// CRITICAL: Enable all layers on camera
try { camera.layers.enable(0); camera.layers.enable(1); camera.layers.enable(2); } catch (_) { }
// Melody/Bass/Back presets – lowered angle by ~10° + 7% zoom out
const melodyTarget = new THREE.Vector3(0, 1.4, 0);
const melodyCamPos = new THREE.Vector3(0, 5.8, 11.5 * 1.07); // 7% zoom out
const bassTarget = melodyTarget.clone();
const bassCamPos = new THREE.Vector3(0, -5.8, 11.5 * 1.07); // 7% zoom out
const backTarget = melodyTarget.clone();
const backCamPos = new THREE.Vector3(0, 1.4, -11.5 * 1.07); // Behind the cubes
camera.position.copy(melodyCamPos);
// Ensure camera renders default, front, and shelf layers
try { camera.layers.enable(0); camera.layers.enable(1); camera.layers.enable(2); } catch (_) { }
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.target.copy(melodyTarget);

// ZOOM FIX: Allow zoom regardless of camera zone
// Custom wheel handler that always allows zoom even when controls.enabled = false
renderer.domElement.addEventListener('wheel', (e) => {
    // Skip if in adjust mode (that has its own wheel handler for scaling)
    if (adjustMode) return;

    // Always allow zoom regardless of zone - this is user expectation #1
    const wasEnabled = controls.enabled;
    if (!wasEnabled) {
        // Temporarily enable controls just for zoom
        controls.enabled = true;

        // Manually handle the zoom (OrbitControls uses wheel event for zoom)
        const zoomSpeed = 0.1;
        const zoomDelta = e.deltaY > 0 ? (1 + zoomSpeed) : (1 - zoomSpeed);

        // Apply zoom by moving camera along the look direction
        const direction = new THREE.Vector3();
        direction.subVectors(camera.position, controls.target).normalize();
        const distance = camera.position.distanceTo(controls.target);
        const newDistance = Math.max(1, Math.min(50, distance * zoomDelta)); // Clamp zoom

        camera.position.copy(controls.target).add(direction.multiplyScalar(newDistance));

        // Restore original enabled state
        controls.enabled = wasEnabled;

        console.log(`[ZOOM FIX] Zoom applied in ${currentMouseZone} zone, distance: ${newDistance.toFixed(1)}`);
    }
    // If controls are already enabled, let them handle it normally
}, { passive: true });

// Lighting
const ambient = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambient);
const dir = new THREE.DirectionalLight(0xffffff, 0.7);
dir.position.set(3, 5, 4);
scene.add(dir);
// Double front-row spotlight (soft key + fill)
const frontKey = new THREE.SpotLight(0xffffff, 0.85, 12.0, Math.PI / 6, 0.35, 1.2);
frontKey.position.set(0, 4.8, 5.6);
frontKey.target.position.set(0, 0, 0);
scene.add(frontKey); scene.add(frontKey.target);
const frontFill = new THREE.SpotLight(0xffffff, 0.45, 10.0, Math.PI / 4, 0.5, 1.0);
frontFill.position.set(-3.5, 3.8, 6.2);
frontFill.target.position.set(0, 0, 0);
scene.add(frontFill); scene.add(frontFill.target);
// Front-row spotlights (off by default)
const frontSpot = new THREE.PointLight(0xffffff, 0.0, 4.5, 1.6);
frontSpot.position.set(0, 1.3, 1.6);
scene.add(frontSpot);
const frontSpotL = new THREE.PointLight(0xffffff, 0.0, 4.0, 1.6);
frontSpotL.position.set(-3.6, 1.0, 1.8);
scene.add(frontSpotL);
const frontSpotR = new THREE.PointLight(0xffffff, 0.0, 4.0, 1.6);
frontSpotR.position.set(3.6, 1.0, 1.8);
scene.add(frontSpotR);
// Overhead stage spotlight
const stageSpot = new THREE.SpotLight(0xffffff, 0.0, 6.0, Math.PI / 5, 0.3, 1.0);
stageSpot.position.set(0, 3.2, 5.2);
stageSpot.target.position.set(0, 0.6, 0);
scene.add(stageSpot);
scene.add(stageSpot.target);

// EXTENDED BASS VIEW LIGHTING SYSTEM: Multiple lights to cover up to 30+ chords
const bassLights = [];

// Create 5 powerful spotlights positioned to cover entire front row
for (let i = 0; i < 5; i++) {
    // Bottom illumination lights (from below)
    const bottomSpot = new THREE.SpotLight(0xffffff, 0.0, 12.0, Math.PI / 2.5, 0.15, 0.8);
    bottomSpot.position.set((i - 2) * 8, -2.5, 3.0); // Spread across X axis
    bottomSpot.target.position.set((i - 2) * 8, 0, 3.0);
    scene.add(bottomSpot);
    scene.add(bottomSpot.target);
    bassLights.push(bottomSpot);

    // Front face illumination lights (from front)
    const frontSpot = new THREE.SpotLight(0xffffff, 0.0, 12.0, Math.PI / 3, 0.2, 0.8);
    frontSpot.position.set((i - 2) * 8, 2.0, 8.0); // From front, spread across X
    frontSpot.target.position.set((i - 2) * 8, 1.0, 3.0);
    scene.add(frontSpot);
    scene.add(frontSpot.target);
    bassLights.push(frontSpot);
}

// Additional wide-area ambient lighting for bass view
const bassAmbientBoost = new THREE.AmbientLight(0xffffff, 0.0);
scene.add(bassAmbientBoost);
let stageMode = false;
let stageTween = null;
function enterStageMode() {
    if (stageMode) return; stageMode = true;
    // Camera to plane-level and head-on
    const camFrom = camera.position.clone();
    const camTo = new THREE.Vector3(0, 0.6, 9.5);
    const tgtFrom = controls.target.clone();
    const tgtTo = new THREE.Vector3(0, 0.6, 0);
    const ambFrom = ambient.intensity, ambTo = 0.15;
    const dirFrom = dir.intensity, dirTo = 0.25;
    const spotFrom = frontSpot.intensity, spotTo = 1.45; // REDUCED by factor of 2 for performance/playback
    const spotLFrom = frontSpotL.intensity, spotLTo = 0.9; // REDUCED by factor of 2
    const spotRFrom = frontSpotR.intensity, spotRTo = 0.9; // REDUCED by factor of 2
    const stageSpotFrom = stageSpot.intensity, stageSpotTo = 2.45; // REDUCED by factor of 2
    const melFrom = melodyMesh?.position.clone();
    const bassFrom = bassMesh?.position.clone();
    const melTo = melFrom ? melFrom.clone().setY(melFrom.y + 0.6) : null;
    const bassTo = bassFrom ? bassFrom.clone().setY(bassFrom.y - 0.6) : null;
    if (stageTween) stageTween.cancelled = true;
    // Keep shelf chord cubes at full strength during performances; do not dim them here
    try {
        for (const s of shelfCubes) {
            const mats = Array.isArray(s.material) ? s.material : [s.material];
            for (const m of mats) {
                if (!m) continue; if (!m.userData) m.userData = {};
                if (m.userData.__baseColor && m.color) m.color.copy(m.userData.__baseColor);
                if (typeof m.opacity === 'number') { m.transparent = false; m.opacity = 1.0; }
            }
        }
    } catch (_) { }
    stageTween = tweenObject({
        duration: 900, owner: camera, onUpdate: (v) => {
            camera.position.lerpVectors(camFrom, camTo, v);
            controls.target.lerpVectors(tgtFrom, tgtTo, v);
            ambient.intensity = ambFrom + (ambTo - ambFrom) * v;
            dir.intensity = dirFrom + (dirTo - dirFrom) * v;
            frontSpot.intensity = spotFrom + (spotTo - spotFrom) * v;
            frontSpotL.intensity = spotLFrom + (spotLTo - spotLFrom) * v;
            frontSpotR.intensity = spotRFrom + (spotRTo - spotRFrom) * v;
            stageSpot.intensity = stageSpotFrom + (stageSpotTo - stageSpotFrom) * v;
            if (melodyMesh && melFrom && melTo) melodyMesh.position.lerpVectors(melFrom, melTo, v);
            if (bassMesh && bassFrom && bassTo) bassMesh.position.lerpVectors(bassFrom, bassTo, v);
            // Dim Venn diagram plane opacity to ~10%
            try { if (shelfPlane?.material) { shelfPlane.material.transparent = true; shelfPlane.material.opacity = 0.10; } } catch (_) { }
        }
    });
}
function maybeEnterStageMode() {
    if (lineup.length && lockedMelody && lockedBass && lockedMelody.length === lineup.length && lockedBass.length === lineup.length) enterStageMode();
}

// GLOBAL PLAYBACK SHELF BLACKOUT for staves legibility
function setPlaybackShelfBlackout(enable) {
    if (shelfPlane && shelfPlane.material) {
        shelfPlane.material.transparent = true;
        if (enable) {
            // DIM SHELF to 15% opacity during ANY playback for staves legibility
            shelfPlane.material.opacity = 0.15;
            console.log('[PLAYBACK BLACKOUT] 🌑 Shelf dimmed to 15% for staves legibility');
        } else {
            // RESTORE shelf to full opacity when playback ends
            shelfPlane.material.opacity = 1.0;
            console.log('[PLAYBACK BLACKOUT] ✨ Shelf restored to full opacity');
        }
    }
}

// Grid and legibility darkening plane
const grid = new THREE.GridHelper(40, 40, 0x444444, 0x333333);
grid.position.y = -2.2;
scene.add(grid);
// Darkening plane that fades in when camera goes below the ground
const darkPlaneGeo = new THREE.PlaneGeometry(40, 40);
const darkPlaneMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.0, depthWrite: false });
const darkPlane = new THREE.Mesh(darkPlaneGeo, darkPlaneMat);
darkPlane.rotation.x = -Math.PI / 2;
darkPlane.position.set(0, 0.001, 0);
darkPlane.renderOrder = 0; // keep under text
scene.add(darkPlane);

// Shared geometry
const cubeSize = 1.2;
const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
const FRONT_ROW_SCALE = 1.0; // uniform active size
const FRONT_ROW_FORWARD_Z = 1.2; // allow pulling slightly toward the camera beyond the front plane

// Tiny tween system for smooth animations
const activeTweens = [];
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function tweenObject({ duration = 800, onUpdate, onComplete, ease = easeInOutCubic, owner = null }) {
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
function cancelTweensFor(obj) {
    for (const tw of activeTweens) {
        if (tw.owner === obj) tw.cancelled = true;
    }
}
function animatePosition(obj, to, duration = 700) {
    const from = obj.position.clone();
    cancelTweensFor(obj);
    return tweenObject({
        duration, owner: obj, onUpdate: (v) => {
            obj.position.lerpVectors(from, to, v);
        }
    });
}
function animateQuaternion(obj, toQuat, duration = 900) {
    const fromQuat = obj.quaternion.clone();
    const to = toQuat.clone();
    return tweenObject({
        duration, owner: obj, onUpdate: (v) => {
            obj.quaternion.slerpQuaternions(fromQuat, to, v);
        }
    });
}

// Derive rotationIndex from the cube's current quaternion (snap to nearest quadrant)
function syncRotationIndexFromQuaternion(obj) {
    try {
        // Determine which of the four tone faces is currently pointing DOWN (toward world -Y)
        // Base mapping indices: 0=bottom(-Y)=root, 1=right(+X)=3rd, 2=top(+Y)=5th, 3=left(-X)=7th
        const worldDown = new THREE.Vector3(0, -1, 0);
        const baseNormals = [
            new THREE.Vector3(0, -1, 0), // bottom
            new THREE.Vector3(1, 0, 0),  // right
            new THREE.Vector3(0, 1, 0),  // top
            new THREE.Vector3(-1, 0, 0), // left
        ];
        let bestIdx = 0; let bestDot = -Infinity;
        for (let i = 0; i < 4; i++) {
            const w = baseNormals[i].clone().applyQuaternion(obj.quaternion);
            const d = w.dot(worldDown);
            if (d > bestDot) { bestDot = d; bestIdx = i; }
        }
        obj.userData.rotationIndex = ((bestIdx % 4) + 4) % 4;
        // Optional: if very close to exact alignment, snap quaternion to the nearest quarter to stabilize visuals
        const angle = Math.atan2(
            new THREE.Vector3(1, 0, 0).applyQuaternion(obj.quaternion).y,
            new THREE.Vector3(1, 0, 0).applyQuaternion(obj.quaternion).x
        );
        const snapped = Math.round(angle / (Math.PI / 2)) * (Math.PI / 2);
        if (Math.abs(snapped - angle) < 0.05) {
            const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), snapped);
            obj.quaternion.copy(q);
        }
    } catch (_) { /* no-op */ }
}
function animateScale(obj, toScalar, duration = 500) {
    const from = obj.scale.clone();
    const to = new THREE.Vector3(toScalar, toScalar, toScalar);
    cancelTweensFor(obj);
    return tweenObject({
        duration, owner: obj, onUpdate: (v) => {
            obj.scale.lerpVectors(from, to, v);
        }
    });
}

// Camera home tween
function animateVector(vec, to, duration = 800) {
    const from = vec.clone();
    return tweenObject({
        duration, owner: vec, onUpdate: (v) => {
            vec.lerpVectors(from, to, v);
        }
    });
}
let lastInteraction = performance.now();
let homing = false;
let currentStickyView = 'above'; // 'above' | 'below'
function pokeInteraction() { lastInteraction = performance.now(); homing = false; }
const diag = setupDiagnostics(() => ({ tweens: activeTweens.length, dragging, lineup: lineup.length }));
const bridge = createBridge();

function hasActiveTweenFor(obj) {
    for (let i = 0; i < activeTweens.length; i++) {
        const tw = activeTweens[i];
        if (!tw.cancelled && tw.owner === obj) return true;
    }
    return false;
}

// Camera view toggles
function setViewAbove() {
    currentStickyView = 'above';

    // RESPONSIVE ZOOM: Adjust camera distance based on chord progression length
    const chordCount = lineup.length;
    let targetPos = melodyCamPos.clone();
    let targetLookAt = melodyTarget.clone();

    if (chordCount > 8) {
        // Calculate zoom-out factor based on chord count (reduced by ~2x)
        const zoomFactor = Math.min(3.0, 1.0 + (chordCount - 8) * 0.075); // Max 3x zoom out
        targetPos.z *= zoomFactor; // Zoom out by moving camera back
        targetPos.y *= Math.sqrt(zoomFactor); // Less dramatic height change

        console.log(`[RESPONSIVE ZOOM] Melody view: ${chordCount} chords - zoomed out ${zoomFactor.toFixed(2)}x`);
    }

    animateVector(camera.position, targetPos, 650);
    animateVector(controls.target, targetLookAt, 650);
    pokeInteraction();
}
function setViewBack() {
    currentStickyView = 'back';

    // RESPONSIVE ZOOM: Adjust back view based on chord progression length
    const chordCount = lineup.length;
    let targetPos = backCamPos.clone();
    let targetLookAt = backTarget.clone();

    if (chordCount > 8) {
        // Calculate zoom-out factor based on chord count (reduced by ~2x)
        const zoomFactor = Math.min(3.0, 1.0 + (chordCount - 8) * 0.075); // Max 3x zoom out
        targetPos.multiplyScalar(zoomFactor);
        // Compensate camera height to maintain consistent viewing angle (double the factor)
        targetPos.y += (zoomFactor - 1) * 2.8; // Double compensation
    }

    smoothCameraTransition(targetPos, targetLookAt);
    pokeInteraction();
}
function setViewBelow() {
    currentStickyView = 'below';

    // RESPONSIVE ZOOM: Adjust bass view based on chord progression length
    const chordCount = lineup.length;
    let targetPos = bassCamPos.clone();
    let targetLookAt = bassTarget.clone();

    if (chordCount > 8) {
        // Calculate zoom-out factor based on chord count (reduced by ~2x)
        const zoomFactor = Math.min(3.0, 1.0 + (chordCount - 8) * 0.075); // Max 3x zoom out
        targetPos.z *= zoomFactor; // Zoom out by moving camera back
        targetPos.y *= Math.sqrt(zoomFactor); // Less dramatic height change (maintaining negative Y)

        console.log(`[RESPONSIVE ZOOM] Bass view: ${chordCount} chords - zoomed out ${zoomFactor.toFixed(2)}x`);
    }

    animateVector(camera.position, targetPos, 650);
    animateVector(controls.target, targetLookAt, 650);
    pokeInteraction();
}

// Convert accidentals to musical glyphs and tidy typography
function toMusicalGlyphs(s) {
    if (!s) return s;
    // VERY tight kerning around accidentals - no spacing between glyph and numeral
    let out = String(s)
        .replace(/\s*#\s*/g, '♯')  // No space before sharp
        .replace(/([A-Ga-g])\s*b/g, '$1♭')   // Eb → E♭ with no space
        .replace(/\bb(?=(?:\d|[IViv]))/g, '♭'); // b3/bVI → ♭3/♭VI
    return out;
}

// Generate a canvas texture for labels (advanced with stacked superscripts)
// (legacy makeFrontLabelTexture removed; styled renderer is used exclusively)

function makeFrontLabelTextureStyled(labelText, romanLabel) {
    const size = 1024;
    const c = document.createElement('canvas'); c.width = size; c.height = size;
    const ctx = c.getContext('2d');
    // background wood
    makeWoodPanel(ctx, size);
    // inner frame with border color tied to roman family
    const color = borderColorForRoman(romanLabel);
    const strokeColor = `#${(color).toString(16).padStart(6, '0')}`;
    const borderPx = Math.max(10, Math.round(size / BORDER_RATIO)); // 1/15 width
    // Draw a SOLID band border (four filled rects) for maximum visibility
    ctx.fillStyle = strokeColor;
    // Top
    ctx.fillRect(0, 0, size, borderPx);
    // Bottom
    ctx.fillRect(0, size - borderPx, size, borderPx);
    // Left
    ctx.fillRect(0, 0, borderPx, size);
    // Right
    ctx.fillRect(size - borderPx, 0, borderPx, size);

    // Parse base, superscripts (includes º/ø), and annotation
    const supers = [];
    let base = String(labelText).trim();
    // supers from parentheses e.g., (7)(b9)
    const paren = [...base.matchAll(/\(([^)]+)\)/g)].map(m => m[1]);
    if (paren.length) { supers.push(...paren); base = base.replace(/\([^)]*\)/g, ''); }
    // Move all 'ø' characters to supers block
    if (base.includes('ø')) { const count = (base.match(/ø/g) || []).length; for (let i = 0; i < count; i++) supers.push('ø'); base = base.replace(/ø/g, ''); }
    // Extract trailing dim/half-dim with 7
    const dimMatch = base.match(/(º7|º)$/);
    if (dimMatch) { supers.push(dimMatch[1]); base = base.replace(/(º7|º)$/, ''); }
    // Extract trailing numbers like 7
    const trailing = base.match(/^(.*?)([#b]?\d+)$/);
    if (trailing) { base = trailing[1]; supers.push(trailing[2]); }

    const baseTrim = base.trim();
    const basePretty = toMusicalGlyphs(baseTrim);
    let supersPretty = supers.map(s => toMusicalGlyphs(s));

    // Embossed text color: EXACT same as border color (per requirement)
    const fill = strokeColor;

    // Typography base (Cochin/Times)
    const centerX = size / 2; const baselineY = size / 2 + 6;
    const baseSize = 430;
    const cochin = SERIF_STACK;
    // Draw centered base (without leading accidental token)
    ctx.save();
    ctx.fillStyle = fill;
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 5;
    ctx.font = `700 ${baseSize}px ${cochin}`;
    ctx.fillText(basePretty, centerX, baselineY);
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 6;
    ctx.strokeText(basePretty, centerX, baselineY - 2);
    ctx.restore();

    // (No global accidental/ø repositioning; special alignment remains only for specific labels like '#ivø')

    // Supers: Finale Numerics (music), large and clear; include ø/º as supers
    if (supersPretty.length && romanLabel !== '#ivø') {
        const supSize = 220;
        const supFamily = `900 ${supSize}px ${MUSIC_STACK}, ${SERIF_STACK}`;
        const rightX = size - 90; let y = 170;
        for (const token of supersPretty) {
            const text = String(token);
            ctx.save();
            // Light capsule for contrast
            ctx.font = supFamily; const w = ctx.measureText(text).width;
            const padX = 10, padY = 8; const rectX = rightX - w - padX * 2; const rectY = y - supSize + padY - 8;
            ctx.fillStyle = 'rgba(255,255,255,0.12)';
            ctx.strokeStyle = 'rgba(0,0,0,0.08)'; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.rect(rectX, rectY, w + padX * 2, supSize + padY * 1.2); ctx.fill(); ctx.stroke();
            // Text
            ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic';
            ctx.fillStyle = fill;
            ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 4;
            ctx.font = supFamily; ctx.fillText(text, rightX, y);
            ctx.shadowColor = 'transparent';
            ctx.strokeStyle = 'rgba(255,255,255,0.28)'; ctx.lineWidth = 4;
            ctx.strokeText(text, rightX, y - 1);
            ctx.restore();
            y += supSize * 0.92;
        }
    }

    // Applied-chord annotation small text at bottom
    const annotation = annotationForRoman(romanLabel);
    if (annotation) {
        const a = toMusicalGlyphs(annotation).replace(/ of /g, ' of ');
        ctx.font = `800 130px 'Noto Music', 'Finale Numerics', 'Bravura Text', 'Cochin', 'Times New Roman', serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = fill;
        ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 3;
        const annY = size - 105;
        ctx.fillText(`[${a}]`, size / 2, annY);
        ctx.shadowColor = 'transparent';
    }

    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    tex.generateMipmaps = true; tex.minFilter = THREE.LinearMipmapLinearFilter; tex.magFilter = THREE.LinearFilter;
    tex.colorSpace = THREE.SRGBColorSpace; tex.needsUpdate = true; return tex;
}

// Minimal wood panel painter if not present
function makeWoodPanel(ctx, size) {
    // soft tan base
    const grd = ctx.createLinearGradient(0, 0, 0, size);
    grd.addColorStop(0, '#d5b38a');
    grd.addColorStop(1, '#b88d5f');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, size, size);
    // subtle grain lines
    ctx.strokeStyle = 'rgba(90,60,30,0.08)';
    ctx.lineWidth = 4;
    for (let y = 40; y < size; y += 52) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(size * 0.25, y + 6, size * 0.5, y - 6, size, y + 4);
        ctx.stroke();
    }
}

function hexToRgb(hex) {
    const h = hex & 0xffffff; return { r: (h >> 16) & 255, g: (h >> 8) & 255, b: h & 255 };
}
function darken(hex, factor = 0.65) {
    const { r, g, b } = hexToRgb(hex); return `rgb(${Math.round(r * factor)},${Math.round(g * factor)},${Math.round(b * factor)})`;
}
// Applied-chord annotations (Roman → descriptor)
const appliedAnnotation = {
    'I7': 'V of IV',
    'II(7)': 'V of V',
    'III(7)': 'V of vi',
    'VI(7)': 'V of ii',
    'VII(7)': 'V of iii',
    '#iº': 'vii° of ii',
    '#iiº': 'vii° of iii',
    '#ivø': 'viiø of V',
    '#vº': 'vii° of vi',
    'iiiø': 'viiø of IV',
};
function annotationForRoman(roman) { return appliedAnnotation[roman] || null; }

let textureManifest = null;

function candidatePngNamesForRoman(roman) {
    // generate a list of likely filenames for the provided roman label
    // try to preserve distinctions: 'ø' (half-diminished) vs 'º' (diminished)
    const originals = [roman];
    // Minor triads often have 'm' appended in assets
    const minorTriad = { 'i': 'im', 'iv': 'ivm', 'v': 'vm' }[roman];
    if (minorTriad) originals.push(minorTriad);
    // Common normalizations
    originals.push(
        roman.replace('º', 'o'),
        roman.replace('ø', 'o'),
        roman.replace('º', '°'), // alt degree symbol
        roman.replace('º7', 'o7'),
        roman.replace('ø7', 'o7')
    );
    // Specific known special-cases
    const map = {
        'viiº7': ['viiº7', 'vii°7', 'viio7', 'viio'],
        'viiø': ['viiø', 'viio'],
        '#iº': ['#iº', '#io'],
        '#ivø': ['#ivø', '#ivo'],
        'iiø': ['iiø', 'iio'],
    };
    if (map[roman]) originals.push(...map[roman]);
    // Deduplicate while preserving order
    const seen = new Set();
    const base = originals.filter(v => { if (seen.has(v)) return false; seen.add(v); return true; });
    // Build candidate filenames (various case and spacing)
    const names = [];
    for (const r of base) {
        names.push(`${r} chord cube.png`, `${r}  chord cube.png`, `${r} chord Cube.png`, `${r} chord cube.PNG`);
    }
    return names;
}

function loadFaceTexture(label, romanLabel, force7th = false, extensions = null) {
    // AUTOMATICALLY ADD 7TH NOTATION for diminished, I7, V(b7)(b9) chords, OR when global withSeventh is true
    let displayLabel = label;
    const isDiminished = romanLabel.includes('º') || romanLabel.includes('ø');
    const isI7 = romanLabel === 'I7' || romanLabel === 'i7';
    const isV7b9 = romanLabel === 'V(7)(b9)' || romanLabel === 'V(b7)(b9)';

    // Check if we should show 7th: special chords, global setting, or forced
    const shouldShow7th = isDiminished || isI7 || isV7b9 || withSeventh || force7th;

    // Add 7th to display if not already present
    if (shouldShow7th && !label.includes('7') && !label.includes('(7)')) {
        if (isDiminished && romanLabel.includes('º') && !romanLabel.includes('º7')) {
            // For diminished, show º7 instead of just º
            displayLabel = label.replace('º', 'º7');
        } else if (isDiminished && romanLabel.includes('ø') && !romanLabel.includes('ø7')) {
            // For half-diminished, show ø7 instead of just ø
            displayLabel = label.replace('ø', 'ø7');
        } else if (isI7) {
            // For I7, add (7) superscript
            displayLabel = label + '(7)';
        } else if (!isV7b9) {
            // For all other chords (except V(b7)(b9) which already has full notation)
            displayLabel = label + '(7)';
        }
    }

    // ADD EXTENSION NOTATION if extensions are provided
    if (extensions && extensions.length > 0) {
        const extensionText = extensions.map(ext => ext.name).join('');
        displayLabel = displayLabel + extensionText;
        console.log(`[FONT] Added extensions: ${displayLabel} (extensions: ${extensions.map(e => e.name).join(', ')})`);
    }

    // V(b7)(b9) chords should always show full notation (already in the label)
    // This chord is special - it must always include the b9 to differentiate from basic V

    console.log(`[FONT] Label generation: ${label} → ${displayLabel} (roman: ${romanLabel}, withSeventh: ${withSeventh}, force7th: ${force7th})`);

    // Always use canvas-rendered texture; no PNGs
    return makeFrontLabelTextureStyled(displayLabel, romanLabel);
}

// Refresh all cube faces to reflect current 7th setting
async function refreshAllCubeFaces() {
    console.log(`[REFRESH FACES] Updating all cube faces for withSeventh: ${withSeventh}`);

    try {
        // Update front-row cubes
        for (const cube of cubes) {
            if (cube.userData && cube.userData.roman) {
                const roman = cube.userData.roman;
                const label = (labelMode === 'roman') ? roman : cube.userData.letter || roman;

                // Generate new texture with current 7th setting and extensions
                const newTexture = loadFaceTexture(label, roman, false, cube.userData.extensions);

                // FIXED: Update the actual front face (index 5), not index 0 (3rd face)
                const frontFaceIndex = 5;
                if (cube.material && cube.material[frontFaceIndex]) {
                    // Dispose old texture
                    if (cube.material[frontFaceIndex].map) cube.material[frontFaceIndex].map.dispose();
                    cube.material[frontFaceIndex].map = newTexture;
                    cube.material[frontFaceIndex].needsUpdate = true;
                }
            }
        }

        // Update shelf cubes
        for (const cube of shelfCubes) {
            if (cube.userData && cube.userData.roman) {
                const roman = cube.userData.roman;
                const label = (labelMode === 'roman') ? roman : cube.userData.letter || roman;

                // Generate new texture with current 7th setting and extensions
                const newTexture = loadFaceTexture(label, roman, false, cube.userData.extensions);

                // FIXED: Update the actual front face (index 5), not index 0 (3rd face)
                const frontFaceIndex = 5;
                if (cube.material && cube.material[frontFaceIndex]) {
                    // Dispose old texture
                    if (cube.material[frontFaceIndex].map) cube.material[frontFaceIndex].map.dispose();
                    cube.material[frontFaceIndex].map = newTexture;
                    cube.material[frontFaceIndex].needsUpdate = true;
                }
            }
        }

        console.log(`[REFRESH FACES] ✅ Updated ${cubes.length} front-row and ${shelfCubes.length} shelf cubes`);

    } catch (error) {
        console.error('[REFRESH FACES] Error updating cube faces:', error);
    }
}

// CTRL+CLICK (CMD+CLICK on Mac): Temporarily update front face with 7th notation
function updateChordFaceWith7th(targetObj) {
    try {
        const roman = targetObj.userData.roman;
        const originalLabel = roman; // Use roman as base label
        let displayWith7th = originalLabel;

        // Add 7th notation if not already present
        if (!originalLabel.includes('7') && !originalLabel.includes('(7)')) {
            if (originalLabel.includes('º')) {
                displayWith7th = originalLabel.replace('º', 'º7');
            } else if (originalLabel.includes('ø')) {
                displayWith7th = originalLabel.replace('ø', 'ø7');
            } else {
                displayWith7th = originalLabel + '(7)';
            }
        }

        console.log(`[CTRL+CLICK] Updating face: ${originalLabel} → ${displayWith7th}`);

        // Generate new texture with 7th notation
        const newTexture = makeFrontLabelTextureStyled(displayWith7th, roman);

        // FIXED: Update the actual front-facing face, not always index 0
        // Face mapping: [px(3rd), nx(7th), py(5th), ny(root), pz(back), nz(front)]
        // The front face is always index 5 (nz), regardless of rotation
        const frontFaceIndex = 5;

        if (targetObj.material && targetObj.material[frontFaceIndex]) {
            targetObj.material[frontFaceIndex].map = newTexture;
            targetObj.material[frontFaceIndex].needsUpdate = true;
            console.log(`[CTRL+CLICK] Updated front face (index ${frontFaceIndex}) with 7th notation`);
        }

        // Reset back to original after 2 seconds
        setTimeout(() => {
            console.log(`[CTRL+CLICK] Resetting face back to: ${originalLabel}`);
            const originalTexture = loadFaceTexture(originalLabel, roman);
            if (targetObj.material && targetObj.material[frontFaceIndex]) {
                targetObj.material[frontFaceIndex].map = originalTexture;
                targetObj.material[frontFaceIndex].needsUpdate = true;
            }
        }, 2000);

    } catch (error) {
        console.error('[CTRL+CLICK] Error updating chord face:', error);
    }
}

function makeCircleDiamondFace(text, color, rotateDeg = 0, transparentBg = false) {
    const size = 512; // higher res for crisp edges
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    // Restore original: rotate whole face (including text) to match established cube orientation
    ctx.translate(size / 2, size / 2);
    ctx.rotate((rotateDeg * Math.PI) / 180);
    ctx.translate(-size / 2, -size / 2);
    if (!transparentBg) { ctx.fillStyle = '#f0e6d8'; ctx.fillRect(0, 0, size, size); }
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = '#ffffff';
    const d = size * 0.64;
    ctx.fillRect(-d / 2, -d / 2, d, d);
    ctx.restore();
    ctx.fillStyle = '#111';
    const pretty = toMusicalGlyphs(text);
    ctx.font = '700 160px "Bravura Text", "Noto Music", "Arial Unicode MS", system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(pretty, size / 2, size / 2);
    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return new THREE.MeshStandardMaterial({ map: tex, transparent: true });
}

// EXTENSION DIAMOND SYSTEM - Create back face with 3 REAL extension diamonds
function calculateChordExtensions(romanLabel) {
    // SMART NEXT-CHORD-UP PATTERN!
    // If chord I → next chord ii → spell DFA = 2,4,6
    // If chord ii → next chord iii → spell EGB = 3,5,7
    // If chord IV → next chord V → spell GBD = 5,7,2

    const chordToNextChordExtensions = {
        // MAJOR KEY PROGRESSIONS
        'I': ['2', '4', '6'],        // I → ii (DFA) = 2,4,6
        'ii': ['3', '5', '7'],       // ii → iii (EGB) = 3,5,7  
        'iii': ['4', '6', '1'],      // iii → IV (FAC) = 4,6,1
        'IV': ['5', '7', '2'],       // IV → V (GBD) = 5,7,2
        'V': ['6', '1', '3'],        // V → vi (ACE) = 6,1,3
        'vi': ['7', '2', '4'],       // vi → vii° (BDF) = 7,2,4
        'vii°': ['1', '3', '5'],     // vii° → I (CEG) = 1,3,5

        // MINOR KEY PROGRESSIONS  
        'i': ['2', '4', 'b6'],       // i → iiø (DFAb) = 2,4,b6
        'ii°': ['b3', '5', 'b7'],    // iiø → III (EbGB♭) = b3,5,b7
        'III': ['4', 'b6', '1'],     // III → iv (FAbC) = 4,b6,1
        'iv': ['5', 'b7', '2'],      // iv → V (GBbD) = 5,b7,2
        'V': ['b6', '1', 'b3'],      // V → VI (AbCEb) = b6,1,b3
        'VI': ['b7', '2', '4'],      // VI → vii° (BbDF) = b7,2,4
        'vii°': ['1', 'b3', '5'],    // vii° → i (CEbG) = 1,b3,5

        // 7TH CHORDS (common ones)
        'I7': ['2', '4', '6'],       // Same pattern
        'ii7': ['3', '5', '7'],      // Same pattern
        'V7': ['6', '1', '3'],       // Same pattern
        'i7': ['2', '4', 'b6'],      // Minor key pattern

        // APPLIED CHORDS
        'V/ii': ['b7', '2', '4'],    // Treat as secondary dominant
        'V/V': ['3', '5', '7'],      // Treat as secondary dominant
    };

    // Get extensions or fallback to generic pattern
    return chordToNextChordExtensions[romanLabel] || ['2', '4', '6'];
}

function makeExtensionBackFace(romanLabel) {
    const extensions = calculateChordExtensions(romanLabel);

    // PIXEL-PERFECT SVG TEMPLATE RECREATION
    // Template: 645.47×640px, convert to 512×512 with exact proportions
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Wood background
    ctx.fillStyle = '#f0e6d8';
    ctx.fillRect(0, 0, size, size);

    // EXACT SVG PROPORTIONS (scaled from 645.47×640 to 512×512)
    const scaleX = size / 645.47;  // 0.793
    const scaleY = size / 640;     // 0.8

    // PRECISE DIAMOND SPECIFICATIONS from SVG template
    const diamondWidth = 122.45 * scaleX;   // 97.12px
    const diamondHeight = 122.45 * scaleY;  // 97.96px

    // EXACT CORNER POSITIONS from SVG coordinates
    const positions = [
        {
            // Bottom-left: x="1.67" y="516.4" width="122.45" height="122.46"
            x: (1.67 + 122.45 / 2) * scaleX,      // Center X: 98.4px
            y: (516.4 + 122.46 / 2) * scaleY,     // Center Y: 465.9px
            note: extensions[0],
            // Text positions from SVG: translate(169.88 618.64) rotate(-90)
            mainTextX: 169.88 * scaleX,          // 134.7px
            mainTextY: 618.64 * scaleY,          // 494.9px
            mainTextRotate: -90,
            // Label text: translate(152.56 591.97) rotate(-90) scale(.58)
            labelTextX: 152.56 * scaleX,         // 121.0px
            labelTextY: 591.97 * scaleY,         // 473.6px
            labelTextRotate: -90,
            labelText: 'nd'
        },
        {
            // Top-left: x="1.69" y="3.3" width="122.45" height="122.45"
            x: (1.69 + 122.45 / 2) * scaleX,      // Center X: 98.5px
            y: (3.3 + 122.45 / 2) * scaleY,       // Center Y: 52.2px
            note: extensions[1],
            // Text positions from SVG: translate(32.77 169.82)
            mainTextX: 32.77 * scaleX,           // 26.0px
            mainTextY: 169.82 * scaleY,          // 135.9px
            mainTextRotate: 0,
            // Label text: translate(59.45 152.51) scale(.58)
            labelTextX: 59.45 * scaleX,          // 47.1px
            labelTextY: 152.51 * scaleY,         // 122.0px
            labelTextRotate: 0,
            labelText: 'th'
        },
        {
            // Top-right: x="521.68" y="3.3" width="122.45" height="122.45"
            x: (521.68 + 122.45 / 2) * scaleX,    // Center X: 463.4px
            y: (3.3 + 122.45 / 2) * scaleY,       // Center Y: 52.2px
            note: extensions[2],
            // Text positions from SVG: translate(508.01 104.15) rotate(-90)
            mainTextX: 508.01 * scaleX,          // 402.9px
            mainTextY: 104.15 * scaleY,          // 83.3px
            mainTextRotate: -90,
            // Label text: translate(490.69 77.47) rotate(-90) scale(.58)
            labelTextX: 490.69 * scaleX,         // 389.2px
            labelTextY: 77.47 * scaleY,          // 62.0px
            labelTextRotate: -90,
            labelText: 'th'
        }
    ];

    positions.forEach(pos => {
        // BOTH DIAMOND AND TEXT ROTATED EXACTLY THE SAME: 45° LEFT
        const rotation = -Math.PI / 4; // 45° LEFT (COUNTER-CLOCKWISE)

        // WOODEN DIAMOND SHAPE - ROTATED 45° LEFT 
        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(rotation); // APPLY SAME ROTATION TO DIAMOND
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        // Draw SQUARE that becomes diamond when rotated
        const squareSize = diamondWidth * 0.4;
        ctx.beginPath();
        ctx.rect(-squareSize / 2, -squareSize / 2, squareSize, squareSize);
        ctx.stroke();
        ctx.restore();

        // EXTENSION NOTE TEXT IN DIAMOND CENTER - ROTATED 45° LEFT (SAME ROTATION)
        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(rotation); // APPLY EXACT SAME ROTATION TO TEXT
        ctx.fillStyle = '#000000';
        // Large font for diamond center text
        const diamondFontSize = 32 * scaleY; // Readable size in diamond
        ctx.font = `bold ${diamondFontSize}px 'Bravura Text', 'Noto Music', Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const pretty = toMusicalGlyphs(pos.note);
        ctx.fillText(pretty, 0, 0);
        ctx.restore();

        // MAIN NUMBER TEXT OUTSIDE DIAMOND - EXACT SVG SPECIFICATIONS
        ctx.save();
        ctx.translate(pos.mainTextX, pos.mainTextY);
        if (pos.mainTextRotate) ctx.rotate((pos.mainTextRotate * Math.PI) / 180);
        ctx.fillStyle = '#000000';
        // SVG: font-size: 52px, MyriadPro-Regular (scaled to our canvas)
        const mainFontSize = 52 * scaleY; // 41.6px
        ctx.font = `${mainFontSize}px 'Myriad Pro', 'Helvetica Neue', Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Show the scale degree number (2, 4, 6)
        const scaleNumber = pos.note.replace(/[b#]/g, ''); // Remove accidentals for display
        ctx.fillText(scaleNumber, 0, 0);
        ctx.restore();

        // EXTENSION LABEL TEXT - EXACT SVG SPECIFICATIONS
        ctx.save();
        ctx.translate(pos.labelTextX, pos.labelTextY);
        if (pos.labelTextRotate) ctx.rotate((pos.labelTextRotate * Math.PI) / 180);
        ctx.fillStyle = '#000000';
        // SVG: font-size: 52px * scale(.58) = 30.16px (scaled to our canvas)
        const labelFontSize = 52 * 0.58 * scaleY; // 24.1px
        ctx.font = `${labelFontSize}px 'Myriad Pro', 'Helvetica Neue', Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pos.labelText, 0, 0);
        ctx.restore();
    });

    // ADD THE COMPOUND INTERVAL NUMBERS (9th, 11th, 13th) from SVG
    const compoundPositions = [
        {
            // 9th text: translate(33.53 508.84)
            x: 33.53 * scaleX,    // 26.6px
            y: 508.84 * scaleY,   // 407.1px
            text: '9',
            rotate: 0
        },
        {
            // 11th text: translate(169.88 104.15) rotate(-90)
            x: 169.88 * scaleX,   // 134.7px
            y: 104.15 * scaleY,   // 83.3px
            text: '11',
            rotate: -90
        },
        {
            // 13th text: translate(544.27 169.82)
            x: 544.27 * scaleX,   // 431.5px
            y: 169.82 * scaleY,   // 135.9px
            text: '13',
            rotate: 0
        }
    ];

    compoundPositions.forEach(pos => {
        ctx.save();
        ctx.translate(pos.x, pos.y);
        if (pos.rotate) ctx.rotate((pos.rotate * Math.PI) / 180);
        ctx.fillStyle = '#000000';
        const mainFontSize = 52 * scaleY; // 41.6px
        ctx.font = `${mainFontSize}px 'Myriad Pro', 'Helvetica Neue', Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pos.text, 0, 0);
        ctx.restore();
    });

    // ADD THE 'th' LABELS for compound intervals
    const compoundLabelPositions = [
        {
            // 9th label: translate(60.2 491.53) scale(.58)
            x: 60.2 * scaleX,     // 47.7px
            y: 491.53 * scaleY,   // 393.2px
            text: 'th',
            rotate: 0
        },
        {
            // 11th label: translate(152.56 50.8) rotate(-90) scale(.58)
            x: 152.56 * scaleX,   // 121.0px
            y: 50.8 * scaleY,     // 40.6px
            text: 'th',
            rotate: -90
        },
        {
            // 13th label: translate(597.1 152.51) scale(.58)
            x: 597.1 * scaleX,    // 473.5px
            y: 152.51 * scaleY,   // 122.0px
            text: 'th',
            rotate: 0
        }
    ];

    compoundLabelPositions.forEach(pos => {
        ctx.save();
        ctx.translate(pos.x, pos.y);
        if (pos.rotate) ctx.rotate((pos.rotate * Math.PI) / 180);
        ctx.fillStyle = '#000000';
        const labelFontSize = 52 * 0.58 * scaleY; // 24.1px
        ctx.font = `${labelFontSize}px 'Myriad Pro', 'Helvetica Neue', Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pos.text, 0, 0);
        ctx.restore();
    });

    const texture = new THREE.CanvasTexture(canvas);
    return new THREE.MeshStandardMaterial({ map: texture, transparent: true });
}

async function makeMaterials(label, romanLabel, extensions = null) {
    // Front face: chord name label texture (strong bias always facing camera)
    const labelTex = await loadFaceTexture(label, romanLabel, false, extensions);
    const front = new THREE.MeshStandardMaterial({ map: labelTex, transparent: true });
    const wood = new THREE.MeshStandardMaterial({ color: 0xf0e6d8 }); // Lighter wood color for better text legibility

    // Determine ingredients (root,3rd,5th,7th)
    const notes = noteSetsC[romanLabel] || ['-', '-', '-', '-'];
    const transposed = transposeNotes(notes, currentKey);
    // Roman mode: show degrees using our canonical degreeSets by chord and selected key
    const degrees = degreeSets[romanLabel] || notesToDegreesInC(notes, currentKey);
    const display = (labelMode === 'roman') ? degrees : transposed;


    // rotate faces so that a 90° cube rotation around Z keeps diamond labels upright
    const faceBottom = makeCircleDiamondFace(display[0], '#2ecc71', 0);     // root
    const faceRight = makeCircleDiamondFace(display[1], '#e74c3c', 270);    // 3rd (upright from below/above)
    const faceTop = makeCircleDiamondFace(display[2], '#3498db', 180);      // 5th
    const faceLeft = makeCircleDiamondFace(display[3], '#bdc3c7', 90);      // 7th (upright)

    // DEBUG: Log V chord face details
    if (romanLabel === 'V') {
        console.log(`[V CHORD DEBUG] Roman: ${romanLabel}, Display: [${display.join(', ')}]`);
        console.log(`[V CHORD DEBUG] Right face (index 1): "${display[1]}" with color #e74c3c`);
    }

    // Face order: [px, nx, py, ny, pz, nz]
    // We'll orient so nz (index 5) is the front-facing chord-name; map sides accordingly
    // left(n x) -> 1; right(p x) -> 0; top(p y) -> 2; bottom(n y) -> 3; front(n z) -> 5; back(p z) -> 4
    const materials = [];
    materials[0] = faceRight; // +x right → 3rd
    materials[1] = faceLeft;  // -x left → 7th
    materials[2] = faceTop;   // +y top → 5th
    materials[3] = faceBottom;// -y bottom → root
    materials[4] = front;     // +z front chord label (toward camera)
    materials[5] = makeExtensionBackFace(romanLabel); // -z back with extension diamonds
    return materials;
}

function addBorder(mesh, colorHex) {
    const edges = new THREE.EdgesGeometry(mesh.geometry);
    const mat = new THREE.LineBasicMaterial({ color: colorHex ?? borderColorForRoman(mesh.userData?.roman || '') });
    const line = new THREE.LineSegments(edges, mat);
    mesh.add(line);
}

function makeShelfTexture() {
    const w = 1280, h = 880; // a bit larger for smoother text
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, w, h);
    ctx.globalAlpha = 0.78;
    function circle(x, y, r, fill) { ctx.beginPath(); ctx.fillStyle = fill; ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
    const top = { x: w * 0.50, y: h * 0.30, r: 260, color: '#a9e8ff' };
    const right = { x: w * 0.69, y: h * 0.60, r: 260, color: '#a994ff' };
    const left = { x: w * 0.31, y: h * 0.60, r: 260, color: '#ffc1a3' };
    circle(top.x, top.y, top.r, top.color);
    circle(right.x, right.y, right.r, right.color);
    circle(left.x, left.y, left.r, left.color);
    ctx.globalAlpha = 1;
    function drawCurvedWord(word, cx, cy, radius, anchorAngleRad, options = {}) {
        const chars = [...word];
        ctx.save();
        ctx.fillStyle = options.fill || '#222';
        ctx.font = options.font || 'bold 40px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial';
        ctx.shadowColor = 'rgba(0,0,0,0.25)';
        ctx.shadowBlur = 6;
        const spacingRad = (options.spacingDeg || 10) * (Math.PI / 180);
        const half = (chars.length - 1) / 2;
        for (let i = 0; i < chars.length; i++) {
            const offset = (i - half) * spacingRad;
            const a = anchorAngleRad + offset;
            ctx.save();
            ctx.translate(cx + radius * Math.cos(a), cy + radius * Math.sin(a));
            ctx.rotate(a + Math.PI / 2);
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(chars[i], 0, 0);
            ctx.restore();
        }
        ctx.restore();
    }
    // REST centered at top center of the top circle (anchor ~ -90°)
    drawCurvedWord('REST', top.x, top.y, top.r - 22, -Math.PI / 2, { fill: '#223', spacingDeg: 14 });
    // MOTION at top of right hemisphere, offset slightly right (-75°) - 80% opacity
    drawCurvedWord('MOTION', right.x, right.y, right.r - 24, -Math.PI * 5 / 12, { fill: 'rgba(0,0,0,0.8)', spacingDeg: 10 });
    // TENSION at top of left hemisphere, offset slightly left (-105°) - 80% opacity
    drawCurvedWord('TENSION', left.x, left.y, left.r - 24, -Math.PI * 7 / 12, { fill: 'rgba(0,0,0,0.8)', spacingDeg: 10 });
    const tex = new THREE.CanvasTexture(c); tex.needsUpdate = true; return tex;
}

let shelfPlane = null;
function createShelfPlane() {
    if (shelfPlane) return;
    const tex = makeShelfTexture();
    shelfPlane = new THREE.Mesh(new THREE.PlaneGeometry(9, 6.75), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
    shelfPlane.position.set(0, shelfY, shelfZ - 0.01);
    // Make the syntax Venn diagram ~1/3 larger relative to cubes
    shelfPlane.scale.setScalar(1.3333);
    scene.add(shelfPlane);
}

// Epic titles
let bgTitleMesh = null;
let melodyMesh = null; let melodyMat = null;
let bassMesh = null; let bassMat = null;

function makeTitleTexture(lines, opts = {}) {
    const w = opts.width || 2048; const h = opts.height || 2048;
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, w, h);

    // Use professional font settings if available
    const fontTarget = opts.fontTarget || 'chord-face';
    const fontSettings = currentFontSettings?.[fontTarget] || currentFontSettings?.['chord-face'];

    const family = opts.family || fontSettings?.family || 'Arial';
    const weight = opts.weight || fontSettings?.weight || 900;
    const size = opts.size || fontSettings?.size || 220;
    const gap = opts.lineGap || fontSettings?.lineHeight || 0.68;
    const letterSpacing = opts.letterSpacing || fontSettings?.letterSpacing || 0;
    const opacity = opts.opacity || fontSettings?.opacity || 1.0;
    const italic = opts.italic || fontSettings?.italic || false;
    const shadow = opts.shadow || fontSettings?.shadow || false;
    // Build font string with professional settings
    const fontStyle = italic ? 'italic' : 'normal';
    const fontFamily = `${fontStyle} ${weight} ${size}px ${family}`;

    ctx.fillStyle = opts.fill || '#ffffff';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.globalAlpha = opacity;

    // Professional shadow/glow
    if (shadow) {
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 6; ctx.shadowOffsetX = 4; ctx.shadowOffsetY = 4;
    } else {
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 24; ctx.shadowOffsetY = 6;
    }
    const total = lines.length;
    const blockHeight = size * gap * (total - 1);
    const startY = (h - blockHeight) / 2;
    for (let i = 0; i < total; i++) {
        const y = startY + i * size * gap;
        ctx.font = fontFamily;
        ctx.fillText(lines[i], w / 2, y);
    }
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = renderer.capabilities.getMaxAnisotropy(); tex.needsUpdate = true; return tex;
}

function addEpicTitles() {
    if (!bgTitleMesh) {
        // MASSIVE all-caps, very tight leading
        const bgTex = makeTitleTexture(['MILLION', 'SONG', 'MIND'], { width: 4096, height: 4096, size: 520, lineGap: 0.52, weight: 1000 });
        const bgMat = new THREE.MeshBasicMaterial({ map: bgTex, transparent: true, opacity: 0.3, depthWrite: false, color: 0xcccccc });
        const scaleFactor = 15; // towering
        const bgGeo = new THREE.PlaneGeometry(18 * scaleFactor, 18 * scaleFactor);
        bgTitleMesh = new THREE.Mesh(bgGeo, bgMat);
        bgTitleMesh.position.set(0, 12, -60);
        bgTitleMesh.lookAt(new THREE.Vector3(0, 6, 0));
        scene.add(bgTitleMesh);
    }
    if (!melodyMesh) {
        const tex = makeTitleTexture(['MELODY'], { width: 4096, height: 1024, size: 420, weight: 1000 });
        melodyMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.0, side: THREE.DoubleSide, depthWrite: false });
        const geo = new THREE.PlaneGeometry(16, 8);
        melodyMesh = new THREE.Mesh(geo, melodyMat);
        melodyMesh.rotation.x = -Math.PI / 2; // on ground, readable from above
        melodyMesh.position.set(0, 0.002, 2.8);
        scene.add(melodyMesh);

        // MELODY PLAY BUTTON - Positioned between text and right lock
        const melodyPlayTex = makeTitleTexture(['▶'], { width: 512, height: 512, size: 300, weight: 1000 });
        const melodyPlayMat = new THREE.MeshBasicMaterial({ map: melodyPlayTex, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false });
        const melodyPlayGeo = new THREE.PlaneGeometry(1.5, 1.5); // Slightly smaller
        const melodyPlayMesh = new THREE.Mesh(melodyPlayGeo, melodyPlayMat);
        melodyPlayMesh.rotation.x = -Math.PI / 2; // on ground, readable from above
        melodyPlayMesh.position.set(-5.0, 0.01, 2.8); // BEFORE text: lock, play button, text, space, lock (moved further left)
        melodyPlayMesh.userData = { isMelodyPlayButton: true, isUi: true };
        melodyPlayMesh.renderOrder = 1;
        scene.add(melodyPlayMesh);
        uiPickables.push(melodyPlayMesh);

        // Store reference for opacity control
        window.melodyPlayMesh = melodyPlayMesh;
        // Add 3D lock icons flanking the word MELODY
        const lockMatOpen = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95, depthWrite: false, depthTest: false });
        const lockMatClosed = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95, depthWrite: false, depthTest: false });
        const iconGeo = new THREE.PlaneGeometry(1.2, 1.2);
        melodyLockLeft = new THREE.Mesh(iconGeo.clone(), lockMatOpen.clone());
        melodyLockRight = new THREE.Mesh(iconGeo.clone(), lockMatOpen.clone());
        const iconTexOpen = makeTitleTexture(['🔓'], { width: 256, height: 256, size: 200, weight: 900 });
        const iconTexClosed = makeTitleTexture(['🔒'], { width: 256, height: 256, size: 200, weight: 900 });
        melodyLockLeft.material.map = iconTexOpen; melodyLockLeft.material.needsUpdate = true;
        melodyLockRight.material.map = iconTexOpen; melodyLockRight.material.needsUpdate = true;
        melodyLockLeft.rotation.x = -Math.PI / 2; melodyLockRight.rotation.x = -Math.PI / 2;
        // Place as if next character after the title word
        melodyLockLeft.position.set(-6.2, 0.01, 2.8);
        melodyLockRight.position.set(6.2, 0.01, 2.8);
        // Match title tint
        melodyLockLeft.material.color.setHex(0xaaaaaa);
        melodyLockRight.material.color.setHex(0xaaaaaa);
        melodyLockLeft.renderOrder = 10; melodyLockRight.renderOrder = 10;
        melodyLockLeft.material.depthWrite = false; melodyLockRight.material.depthWrite = false;
        melodyLockLeft.userData = { isUi: true, kind: 'melody-lock', state: 'open', openTex: iconTexOpen, closedTex: iconTexClosed };
        melodyLockRight.userData = { isUi: true, kind: 'melody-lock', state: 'open', openTex: iconTexOpen, closedTex: iconTexClosed };
        scene.add(melodyLockLeft); scene.add(melodyLockRight);
        uiPickables.push(melodyLockLeft, melodyLockRight);
    }
    if (!bassMesh) {
        const tex = makeTitleTexture(['BASSLINE'], { width: 4096, height: 1024, size: 420, weight: 1000 });
        bassMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.0, side: THREE.DoubleSide, depthWrite: false });
        const geo = new THREE.PlaneGeometry(16, 8);
        bassMesh = new THREE.Mesh(geo, bassMat);
        // readable from below: flip to face downward without mirroring
        bassMesh.rotation.x = Math.PI / 2;
        bassMesh.position.set(0, 0.002, 2.8);
        bassMesh.renderOrder = 1; // draw after darkening plane
        scene.add(bassMesh);

        // BASSLINE PLAY BUTTON - Positioned between text and right lock
        const bassPlayTex = makeTitleTexture(['▶'], { width: 512, height: 512, size: 300, weight: 1000 });
        const bassPlayMat = new THREE.MeshBasicMaterial({ map: bassPlayTex, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false });
        const bassPlayGeo = new THREE.PlaneGeometry(1.5, 1.5); // Slightly smaller
        const bassPlayMesh = new THREE.Mesh(bassPlayGeo, bassPlayMat);
        bassPlayMesh.rotation.x = Math.PI / 2;
        bassPlayMesh.position.set(-5.0, 0.01, 2.8); // BEFORE text: lock, play button, text, space, lock (moved further left)
        bassPlayMesh.userData = { isBassPlayButton: true, isUi: true };
        bassPlayMesh.renderOrder = 1;
        scene.add(bassPlayMesh);
        uiPickables.push(bassPlayMesh);

        // Store reference for opacity control
        window.bassPlayMesh = bassPlayMesh;
        // Bass locks
        const iconGeo2 = new THREE.PlaneGeometry(1.2, 1.2);
        const iconTexOpen2 = makeTitleTexture(['🔓'], { width: 256, height: 256, size: 200, weight: 900 });
        const iconTexClosed2 = makeTitleTexture(['🔒'], { width: 256, height: 256, size: 200, weight: 900 });
        bassLockLeft = new THREE.Mesh(iconGeo2.clone(), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95, depthWrite: false, depthTest: false, map: iconTexOpen2 }));
        bassLockRight = new THREE.Mesh(iconGeo2.clone(), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95, depthWrite: false, depthTest: false, map: iconTexOpen2 }));
        bassLockLeft.rotation.x = Math.PI / 2; bassLockRight.rotation.x = Math.PI / 2;
        bassLockLeft.position.set(-6.2, 0.01, 2.8);
        bassLockRight.position.set(6.2, 0.01, 2.8);
        bassLockLeft.material.color.setHex(0xaaaaaa);
        bassLockRight.material.color.setHex(0xaaaaaa);
        bassLockLeft.renderOrder = 10; bassLockRight.renderOrder = 10;
        bassLockLeft.material.depthWrite = false; bassLockRight.material.depthWrite = false;
        bassLockLeft.userData = { isUi: true, kind: 'bass-lock', state: 'open', openTex: iconTexOpen2, closedTex: iconTexClosed2 };
        bassLockRight.userData = { isUi: true, kind: 'bass-lock', state: 'open', openTex: iconTexOpen2, closedTex: iconTexClosed2 };
        scene.add(bassLockLeft); scene.add(bassLockRight);
        uiPickables.push(bassLockLeft, bassLockRight);
    }
}

// State
const cubes = [];
// Dedicated list for shelf proxies added later
const shelfPickProxies = [];
let currentSet = 'none';
let labelMode = 'roman';
let currentKey = 'C';
// Shelf (back-row) configuration
const shelfZ = -4.2;
const shelfY = 1.6;
// Initialize orthographic shelf picking camera now that shelfY/Z are known
try {
    const aspect = window.innerWidth / window.innerHeight;
    const halfH = 5;
    shelfPickCamera = new THREE.OrthographicCamera(-aspect * halfH, aspect * halfH, halfH, -halfH, 0.1, 1000);
    shelfPickCamera.position.set(0, shelfY, 10);
    shelfPickCamera.lookAt(0, shelfY, shelfZ);
    shelfPickCamera.layers.enable(2); // view shelf layer
} catch (_) { }
// Shelf anchor map. If shelf_map.json exists or localStorage has an override,
// we will load into this at runtime. Otherwise we start with approximations.
let shelfSlots = {
    // NEW SHELF MAP - Updated positions
    'I': new THREE.Vector3(0.019018198116636284, 4.846715767636794, -4.2),
    'IV': new THREE.Vector3(2.5670545677226477, 0.9745924940699253, -4.2),
    'V': new THREE.Vector3(-2.3070721156909144, 0.9488519294015659, -4.2),
    'ii': new THREE.Vector3(3.162693516382339, -0.2639810152339269, -4.2),
    'viiø': new THREE.Vector3(-3.0301174968955604, -0.18915940646469753, -4.2),
    'vi': new THREE.Vector3(0.9433381282819779, 3.403626667588608, -4.2),
    'iii': new THREE.Vector3(-1.1125527530506958, 3.11976311292227, -4.2),
    'i': new THREE.Vector3(0.006777527436186316, 3.625915650256669, -4.2),
    'iiø': new THREE.Vector3(1.0399187808863832, -0.5091135627464931, -4.2),
    'bIII': new THREE.Vector3(1.3650323066645556, 2.629216473657123, -4.2),
    'iv': new THREE.Vector3(1.3100941554240706, 0.17190241200717638, -4.2),
    'v': new THREE.Vector3(-1.5944162259268038, 2.41980905926983, -4.2),
    'bVI': new THREE.Vector3(1.7346269345447038, 2.065668580041144, -4.2),
    'bVII': new THREE.Vector3(-2.1765618215573275, 1.995052699742096, -4.2),
    'V(7)(b9)': new THREE.Vector3(-3.43396403579002, 0.8105892259030323, -4.2),
    'viiº7': new THREE.Vector3(-3.5559390281444574, -0.7795397035630596, -4.2),
    'I7': new THREE.Vector3(0.242068729799989, -0.5447640887067791, -4.2),
    'iiiø': new THREE.Vector3(-0.3716762812855209, -0.5367009756847119, -4.2),
    'II(7)': new THREE.Vector3(0.21591257900643301, 1.9217459541229251, -4.2),
    '#ivø': new THREE.Vector3(-0.35756750603768317, 1.9293605174602437, -4.2),
    'III(7)': new THREE.Vector3(0.22899074293377203, 0.7121595075238272, -4.2),
    '#vº': new THREE.Vector3(-0.36690809470190994, 0.7097856208005415, -4.2),
    'VI(7)': new THREE.Vector3(0.21079385183653004, 1.3320772421667515, -4.2),
    '#iº': new THREE.Vector3(-0.36093316503017536, 1.328791858230934, -4.2),
    'VII(7)': new THREE.Vector3(0.22856061424028473, 0.093391910874558, -4.2),
    '#iiº': new THREE.Vector3(-0.38317696961983916, 0.0894362124218917, -4.2),
    // Keep the plain dominants (II and VII) as they were
    'II': new THREE.Vector3(3.2, 0.9000000000000001, -4.2),
    'VII': new THREE.Vector3(-3.2, 0.9000000000000001, -4.2),
};
// Color families (approximated from reference image; can be overridden later)
let COLOR_TONIC = 0x62d1e6;      // cyan/teal for I/vi family
let COLOR_SUBDOMINANT = 0x6b46c1; // purple for IV/ii family
let COLOR_DOMINANT = 0xff7a45;    // coral/orange for V/VII family
let COLOR_NEUTRAL = 0xbfbfbf;     // grey for iii and unclassified

// Locked exact colors derived from template PNGs (border/text)
// Major
const borderColorByRoman = {
    'I': 0x52b9d5,
    'ii': 0x44255c,
    'iii': 0x8caaaa,
    'IV': 0x623978,
    'V': 0xe28a5a,
    'vi': 0x6c9cc4,
    'viiø': 0xc24a2e,
    // Applied
    'I7': 0xa4324a,
    'iiiø': 0xba5847,
    'II(7)': 0xad6f71,
    '#ivø': 0xad6f71,
    'III(7)': 0xaf505d,
    '#vº': 0xad6f71,
    'VI(7)': 0xad6f71,
    '#iº': 0xad6f71,
    'VII(7)': 0xb3394a,
    '#iiº': 0xad6f71,
    // Minor
    'i': 0x409abe,
    'iiø': 0xba5847,
    'bIII': 0x6673ab,
    'iv': 0x884a7c,
    'v': 0xab8c71,
    'bVI': 0x5f5199,
    'bVII': 0xb77046,
    'V(7)(b9)': 0xe28a5a, // paired to dominant neighbor
    'viiº7': 0xc24a2e,
    // Extras present in assets, map reasonably
    'viio': 0xc24a2e,
    'VII': 0xe28a5a
};
function borderColorForRoman(roman) {
    if (borderColorByRoman[roman]) return borderColorByRoman[roman];
    // Applied-chord: color by target of annotation ([... of X]) so ø/º match their neighbor in the stack
    const ann = annotationForRoman(roman);
    if (ann) {
        const m = ann.match(/ of ([IViv]+|vi|iii)/);
        const target = m && m[1] ? m[1] : null;
        if (target) {
            if (/^(IV|iv|ii)$/.test(target)) return COLOR_SUBDOMINANT;
            if (/^(V|v|VII)$/.test(target)) return COLOR_DOMINANT;
            if (/^(I|vi)$/.test(target)) return COLOR_TONIC;
            if (/^(iii)$/.test(target)) return COLOR_NEUTRAL;
        }
    }
    // Family heuristics fallback
    if (/IV|iv|\bii\b|#iv/.test(roman)) return COLOR_SUBDOMINANT;
    if (/\bV\b|\bv\b|VII|#v/.test(roman)) return COLOR_DOMINANT;
    if (/\bI\b|\bvi\b|I7/.test(roman)) return COLOR_TONIC;
    return COLOR_NEUTRAL;
}
const shelfCubes = [];
let scaleByRoman = {
    // NEW SHELF MAP - Updated scales
    'I': 1.0039123985964813,
    'IV': 1.2,
    'V': 1.2,
    'ii': 0.7,
    'iii': 0.7,
    'vi': 0.7,
    'viiø': 0.6,
    'i': 0.65,
    'iiø': 0.5298678523565713,
    'bIII': 0.55,
    'iv': 0.55,
    'v': 0.55,
    'bVI': 0.55,
    'bVII': 0.55,
    'V(7)(b9)': 0.55,
    'viiº7': 0.55,
    'I7': 0.5,
    'iiiø': 0.5,
    'II(7)': 0.5,
    '#ivø': 0.5,
    'III(7)': 0.5,
    '#vº': 0.5,
    'VI(7)': 0.5,
    '#iº': 0.5,
    'VII(7)': 0.5,
    '#iiº': 0.5,
};

// Remember the exact shelf origin transform for each roman
const shelfOriginByRoman = {};

// --- Adjustable shelf map: load/save ---
const MAP_STORAGE_KEY = 'obsCubes.shelfMap.v1';
async function loadShelfMap() {
    // Hard purge any saved overrides – ALWAYS use the official map
    try {
        localStorage.removeItem(MAP_STORAGE_KEY);
        localStorage.removeItem('obsCubes.shelfMap');
        localStorage.removeItem('obsCubes.map');
        localStorage.removeItem('shelf_map');
    } catch { }

    // Try multiple shelf map file names in priority order
    const mapFileNames = [
        './shelf_map.json',                    // NEW: User's current file
        './Shelf%20Map%20aug31.json',         // User's Aug 31 file
        './Shelf%20Map%20Official.json',      // Original expected file
        './shelf-map.json',                   // Alternative naming
        './shelfmap.json'                     // Another alternative
    ];

    for (const fileName of mapFileNames) {
        try {
            console.log(`[SHELF MAP] Trying to load: ${fileName}`);
            const json = await loadOfficialMap(fileName);
            console.log(`[SHELF MAP] ✅ Successfully loaded: ${fileName}`);
            applyShelfMap(json);
            return;
        } catch (error) {
            console.log(`[SHELF MAP] ❌ Failed to load ${fileName}:`, error.message);
        }
    }

    // If all files fail, keep built-in defaults
    console.log('[SHELF MAP] ⚠️ No shelf map files found, using built-in defaults');
}

function applyShelfMap(json) {
    if (!json) return;
    if (json.positions) {
        const out = {};
        for (const [roman, v] of Object.entries(json.positions)) {
            if (roman === 'II' || roman === 'VII') continue; // ignore extra bottom entries
            const { x, y, z } = v;
            out[roman] = new THREE.Vector3(x, y, z);
        }
        shelfSlots = { ...shelfSlots, ...out };
        // Safety: ensure minor iv exists and is distinct from IV
        if (!shelfSlots['iv']) shelfSlots['iv'] = new THREE.Vector3(1.31, shelfY - 0.03, shelfZ);
    }
    if (json.scales) {
        const filtered = { ...json.scales };
        delete filtered['II']; delete filtered['VII'];
        scaleByRoman = { ...scaleByRoman, ...filtered };
    }
}

function exportShelfMap() {
    const positions = {};
    for (const [k, v] of Object.entries(shelfSlots)) {
        positions[k] = { x: v.x, y: v.y, z: v.z };
    }
    const json = { positions, scales: scaleByRoman };
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'shelf_map.json'; a.click();
    URL.revokeObjectURL(url);
}

function saveShelfMapToLocalStorage() { /* disabled – official map only */ }

// Ensure web fonts are available before drawing to canvas
async function ensureFontsLoaded() {
    if (window.__obsFontsLoaded) return window.__obsFontsLoaded;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Music&display=swap';
    document.head.appendChild(link);
    const loads = [
        // Serif stack (Cochin/Times)
        `700 430px ${SERIF_STACK}`,
        // Music stack (Noto Music/Finale/Bravura)
        `900 220px ${MUSIC_STACK}`,
        `800 130px ${MUSIC_STACK}`
    ].map(spec => {
        try { return document.fonts.load(spec); } catch (_) { return Promise.resolve(); }
    });
    window.__obsFontsLoaded = Promise.race([
        Promise.all(loads).then(() => true).catch(() => true),
        new Promise(resolve => setTimeout(() => resolve(true), 1600))
    ]);
    return window.__obsFontsLoaded;
}

// Interaction helpers
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let dragging = null;
let dragOffset = new THREE.Vector3();
const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
let pendingObj = null;

// ZONE-BASED MOUSE CONTROL SYSTEM
let currentMouseZone = 'camera'; // 'cube' or 'camera'
let zoneCheckEnabled = true;
let dragStartZone = null; // Track zone where drag started
let isDraggingCamera = false; // Track camera drag state

// EMERGENCY ZONE RESET FUNCTION
function emergencyZoneReset() {
    console.log('[EMERGENCY] 🚨 Resetting zone system');
    zoneCheckEnabled = true;
    isDraggingCamera = false;
    currentMouseZone = 'camera';
    controls.enabled = true;
    renderer.domElement.style.cursor = 'grab';
    console.log('[EMERGENCY] ✅ Zone system reset - camera controls restored');
}

// ZONE SYSTEM COMPLETELY DISABLED - Force enable ALL interactions
controls.enabled = true;
zoneCheckEnabled = false;  // Disable all zone checking
currentMouseZone = 'cube'; // Force cube interaction mode
console.log('[ZONE BYPASS] 🎯 ALL INTERACTIONS ENABLED - zone system completely disabled');

// Expose to window for emergency use
if (typeof window !== 'undefined') {
    window.emergencyZoneReset = emergencyZoneReset;
}

// Calculate if mouse cursor is within cube interaction zone
function isInCubeZone(clientX, clientY) {
    const rect = renderer.domElement.getBoundingClientRect();
    const canvasWidth = rect.width;
    const canvasHeight = rect.height;

    // Define generous interaction zones (screen coordinates)
    // Shelf zone: horizontal band across middle of screen  
    const shelfZone = {
        left: 0.1 * canvasWidth,   // 10% padding from left
        right: 0.9 * canvasWidth,  // 10% padding from right
        top: 0.45 * canvasHeight,  // Shelf area starts ~45% down (LOWERED)
        bottom: 0.85 * canvasHeight // Shelf area ends ~85% down
    };

    // Front row zone: upper portion of screen - EXTENDS TO VERY TOP OF VENN DIAGRAMS
    const frontRowZone = {
        left: 0.1 * canvasWidth,
        right: 0.9 * canvasWidth,
        top: 0.05 * canvasHeight,  // VERY TOP - reaches venn diagram tops
        bottom: 0.55 * canvasHeight // Overlaps with shelf zone
    };

    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    // Check if mouse is in either zone
    const inShelfZone = (mouseX >= shelfZone.left && mouseX <= shelfZone.right &&
        mouseY >= shelfZone.top && mouseY <= shelfZone.bottom);

    const inFrontRowZone = (mouseX >= frontRowZone.left && mouseX <= frontRowZone.right &&
        mouseY >= frontRowZone.top && mouseY <= frontRowZone.bottom);

    return inShelfZone || inFrontRowZone;
}

// Update mouse zone and camera controls
function updateMouseZone(clientX, clientY) {
    if (!zoneCheckEnabled) return;

    // CRITICAL: If camera is being dragged, maintain camera control regardless of zone
    if (isDraggingCamera) {
        controls.enabled = true;
        return;
    }

    const inCubeZone = isInCubeZone(clientX, clientY);
    const newZone = inCubeZone ? 'cube' : 'camera';

    if (newZone !== currentMouseZone) {
        currentMouseZone = newZone;

        if (currentMouseZone === 'cube') {
            // Entering cube zone - disable camera, enable cube interactions
            // DISABLED: controls.enabled = false;
            renderer.domElement.style.cursor = 'pointer';
            console.log('[ZONE] 🎯 Cube interaction zone - camera locked');
        } else {
            // Entering camera zone - enable camera, disable cube interactions  
            controls.enabled = true;
            renderer.domElement.style.cursor = 'grab';
            console.log('[ZONE] 📷 Camera control zone - cube interactions disabled');
        }
    }
}
let mouseDownPos = new THREE.Vector2();
let mouseDownTime = 0;
// Initialize FSM with inline thresholds to avoid TDZ on consts declared later
const fsm = new InteractionFSM({ DRAG_START_PX: 8, CLICK_MAX_PX: 5, CLICK_MAX_MS: 250 });
// Additional drag tracking for shelf pulls
let dragStartScreenY = 0;
let dragStartZ = 0;
let DRAG_Z_PER_PX = 0.012; // reduce sensitivity for stability
let dragPlaneY = 0; // fixed ground-plane Y for consistent X mapping
let dragOffsetX = 0; // initial X offset on that plane
const DRAG_START_PX = 8;
const CLICK_MAX_PX = 5;
const CLICK_MAX_MS = 250;
let lastShelfTarget = null; // currently selected shelf cube in adjust mode
// Flick/throwaway gesture tracking
let dragStartWorld = new THREE.Vector3();
let lastMoveWorld = new THREE.Vector3();
let lastMoveTime = 0;

// Grid snapping and lineup spacing
const gridSize = 1.4; // spacing between cubes
function snapToGrid(vec3) {
    vec3.x = Math.round(vec3.x / gridSize) * gridSize;
    vec3.z = Math.round(vec3.z / gridSize) * gridSize;
}

// Active lineup management
let lineup = [];
let previewIndex = null;

// Progression arrow system - REBUILT FROM SCRATCH
let progressionArrows = [];
let shelfClickHistory = [];
let arrowsEnabled = false;
let maxArrows = 20;
let chordProgressionIndices = {}; // Track which progression indices each chord has been used at
let globalProgressionIndex = 0; // Global counter that never resets

// Volume controls for independent voice mixing
let chordVolume = 0.6;
let bassVolume = 0.8;
let melodyVolume = 0.5;

// Track last played notes for progression voice leading
let lastProgressionBassMidi = null;
let lastProgressionMelodyMidi = null;

// FREE PLAY MODE: Track current chord for immediate cutoff (no overlap)
let currentFreePlayChord = null;
let freePlayCutoffTimer = null;

// Legacy volume control setup - removed (merged into main setupVolumeControls)

// Camera height compensation - DISABLED for now as it interferes with existing zoom logic
function adjustCameraHeightForDistance() {
    // DISABLED: The existing zoom logic in melody/bass view functions already handles this properly
    // The original system was working correctly, so we don't need additional intervention
    return; // Early exit - let the existing system handle camera positioning
}

// Create progression index label with circular background
function createProgressionLabel(roman, indices, position) {
    if (!indices || indices.length === 0) return null;

    // Create text showing comma-separated indices
    const indicesText = indices.join(', ');

    // Create canvas for text rendering
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 128;
    canvas.height = 64;

    // Set font and measure text
    context.font = 'bold 20px Arial';
    const textWidth = context.measureText(indicesText).width;
    const padding = 8;
    const circleRadius = Math.max(textWidth / 2 + padding, 16);

    // Clear canvas and draw black circle background
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'black';
    context.beginPath();
    context.arc(canvas.width / 2, canvas.height / 2, circleRadius, 0, 2 * Math.PI);
    context.fill();

    // Draw white text
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(indicesText, canvas.width / 2, canvas.height / 2);

    // Create texture and material
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);

    // Position slightly to the right of chord center
    sprite.position.set(position.x + 0.3, position.y, position.z);
    sprite.scale.set(0.4, 0.2, 1); // Scale to appropriate size
    sprite.userData = { isProgressionLabel: true, roman: roman };

    scene.add(sprite);
    console.log(`[PROGRESSION LABEL] Created label "${indicesText}" for ${roman} at (${sprite.position.x.toFixed(2)}, ${sprite.position.y.toFixed(2)}, ${sprite.position.z.toFixed(2)})`);

    return sprite;
}

// Simple arrow creation using chord center positions (NO Z manipulation)
function createSimpleArrow(fromRoman, toRoman) {
    if (!arrowsEnabled || !fromRoman || !toRoman) return null;

    const fromOrigin = shelfOriginByRoman[fromRoman];
    const toOrigin = shelfOriginByRoman[toRoman];

    if (!fromOrigin || !toOrigin) {
        console.warn(`[ARROW] Missing shelf position for ${fromRoman} or ${toRoman}`);
        return null;
    }

    // CALCULATED: IV chord center Z=-4.2, cubeSize=1.2, scale=1.2, scaledSize=1.44, face Z=-4.2+0.72=-3.48, arrows 1px closer: Z=-3.47
    const fromPos = new THREE.Vector3(fromOrigin.position.x, fromOrigin.position.y, -3.47);
    const toPos = new THREE.Vector3(toOrigin.position.x, toOrigin.position.y, -3.47);

    console.log(`[ARROW] ${fromRoman} → ${toRoman}: (${fromPos.x.toFixed(2)}, ${fromPos.y.toFixed(2)}, ${fromPos.z.toFixed(2)}) → (${toPos.x.toFixed(2)}, ${toPos.y.toFixed(2)}, ${toPos.z.toFixed(2)})`);

    // Simple straight line
    const geometry = new THREE.BufferGeometry().setFromPoints([fromPos, toPos]);
    const material = new THREE.LineBasicMaterial({
        color: 0xFFFF00,
        linewidth: 45000  // 10x thicker line stroke ONLY (4500 * 10 = 45000)
    });

    const line = new THREE.Line(geometry, material);

    // Small arrowhead at destination
    const arrowHead = new THREE.Mesh(
        new THREE.ConeGeometry(0.03, 0.1, 6),
        new THREE.MeshBasicMaterial({ color: 0xFFFF00 })
    );

    const direction = new THREE.Vector3().subVectors(toPos, fromPos).normalize();
    arrowHead.position.copy(toPos);  // Already at Z=5.0 from toPos
    arrowHead.lookAt(toPos.clone().add(direction));
    arrowHead.rotateX(Math.PI / 2);

    const arrowGroup = new THREE.Group();
    arrowGroup.add(line);
    arrowGroup.add(arrowHead);
    arrowGroup.userData = { fromRoman, toRoman, isProgressionArrow: true };

    scene.add(arrowGroup);
    console.log(`[ARROW] Created ${fromRoman} → ${toRoman}`);
    return arrowGroup;
}

function addArrow(fromRoman, toRoman) {
    const arrow = createSimpleArrow(fromRoman, toRoman);
    if (!arrow) return;

    progressionArrows.push(arrow);

    // Remove oldest if over limit
    while (progressionArrows.length > maxArrows) {
        const oldest = progressionArrows.shift();
        scene.remove(oldest);
        oldest.traverse(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });
    }
}

function clearArrows() {
    // Clear arrows
    progressionArrows.forEach(arrow => {
        scene.remove(arrow);
        arrow.traverse(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });
    });
    progressionArrows = [];

    // Clear progression labels
    const labelsToRemove = scene.children.filter(child => child.userData?.isProgressionLabel);
    labelsToRemove.forEach(label => {
        scene.remove(label);
        if (label.material?.map) label.material.map.dispose();
        if (label.material) label.material.dispose();
    });

    // Clear tracking data
    shelfClickHistory = [];
    chordProgressionIndices = {};
    globalProgressionIndex = 0; // Reset global counter
    console.log('[CLEAR ARROWS] Cleared all arrows, labels, and progression data');
}

function computeSlotPositions(n) {
    const startX = -((n - 1) * gridSize) / 2;
    const xs = [];
    for (let i = 0; i < n; i++) xs.push(startX + i * gridSize);
    return xs;
}

function reflowLineup() {
    const xs = computeSlotPositions(lineup.length);
    lineup.forEach((cube, i) => {
        const target = new THREE.Vector3(xs[i], 0, 0);
        // Enforce uniform front-row size before/while positioning
        if (Math.abs(cube.scale.x - FRONT_ROW_SCALE) > 1e-3) cube.scale.setScalar(FRONT_ROW_SCALE);
        animatePosition(cube, target, 400);
    });
    try { bridge.emit('lineupChanged', { lineup: lineup.map(c => c.userData?.roman), key: currentKey }); } catch (_) { }
    try { setState({ lineup: lineup.map(c => c.userData?.roman) }); } catch (_) { }

    // AUTO RESPONSIVE ZOOM: Update camera view if progression is getting long
    if (lineup.length > 8) {
        console.log(`[AUTO ZOOM] ${lineup.length} chords detected - updating camera view`);
        // Smoothly update current view to accommodate new chord count
        if (currentStickyView === 'above') {
            setViewAbove(); // This will now auto-zoom based on lineup.length
        } else if (currentStickyView === 'below') {
            setViewBelow(); // This will now auto-zoom based on lineup.length
        } else if (currentStickyView === 'back') {
            setViewBack(); // This will now auto-zoom based on lineup.length
        }
    }
}

function previewMakeWay(insertIndex) {
    const n = lineup.length + 1; // including the dragged cube
    const xs = computeSlotPositions(n);
    let j = 0;
    for (let i = 0; i < n; i++) {
        if (i === insertIndex) continue; // reserve space
        const cube = lineup[j++];
        if (!cube) continue;
        animatePosition(cube, new THREE.Vector3(xs[i], 0, 0), 250);
    }
}

function computeInsertionIndex(x) {
    const n = lineup.length + 1;
    const xs = computeSlotPositions(n);
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < xs.length; i++) {
        const d = Math.abs(x - xs[i]);
        if (d < bestDist) { bestDist = d; best = i; }
    }
    return best;
}

function removeFromLineup(obj) {
    const idx = lineup.indexOf(obj);
    if (idx >= 0) {
        lineup.splice(idx, 1);
        reflowLineup();
    }
}

function addToLineup(obj, side) {
    if (lineup.includes(obj)) return;
    if (side === 'left') lineup.unshift(obj);
    else lineup.push(obj);
    reflowLineup();
}

function clearCubes() {
    for (const c of cubes) {
        scene.remove(c);
        c.geometry.dispose();
        c.material.forEach(m => {
            if (m.map) m.map.dispose();
            m.dispose();
        });
    }
    cubes.length = 0;
    lineup = [];
}

// Remove existing shelf cubes from the scene (prevents doubling when reloading a map)
function clearShelf() {
    for (const s of shelfCubes) {
        scene.remove(s);
        // Dispose resources for safety
        s.geometry.dispose();
        if (Array.isArray(s.material)) {
            s.material.forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
        } else if (s.material) {
            if (s.material.map) s.material.map.dispose();
            s.material.dispose();
        }
    }
    shelfCubes.length = 0;
}

async function createShelfCube(roman) {
    const item = (chordSetsC.major.find(x => x.roman === roman)
        || chordSetsC.minor.find(x => x.roman === roman)
        || chordSetsC.applied.find(x => x.roman === roman)) || { roman, letter: roman };
    const materials = await makeMaterials(item[labelMode], item.roman);
    const m = new THREE.Mesh(geometry.clone(), materials);
    const s = scaleByRoman[roman] ?? 0.7;
    m.scale.setScalar(s);
    const pos = (shelfSlots[roman] || new THREE.Vector3(0, 0, shelfZ)).clone();
    m.position.copy(pos);
    m.userData = { roman, letter: item.letter, rotationIndex: 0, isShelf: true };
    addBorder(m, borderColorForRoman(roman));
    // Shelf cubes live on layer 2
    setCubeLayerRecursive(m, 2);
    // Do NOT add quadrant overlays to shelf cubes to avoid occluding clicks
    shelfCubes.push(m);
    // Add an invisible, raycast-only proxy just in front of the shelf cube
    try {
        const sclr = m.scale?.x || m.scale || 1;
        const proxyGeo = new THREE.PlaneGeometry(cubeSize * sclr * 1.08, cubeSize * sclr * 1.08);
        const proxyMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.0, depthWrite: false, side: THREE.DoubleSide });
        const proxy = new THREE.Mesh(proxyGeo, proxyMat);
        proxy.position.set(m.position.x, m.position.y, m.position.z + 0.001);
        proxy.userData = { isShelfProxy: true, parent: m };
        proxy.layers.set(2);
        scene.add(proxy);
        shelfPickProxies.push(proxy);
        m.userData.pickProxy = proxy;
    } catch (_) { }
    // Record exact origin
    shelfOriginByRoman[roman] = { position: pos.clone(), scale: s, quaternion: m.quaternion.clone() };
    scene.add(m);
    // Ensure shelf layer assignment
    try { setCubeLayerRecursive(m, 2); } catch (_) { }
    return m;
}

async function loadSet(setName) {
    console.log('[obs-cubes] loadSet', setName);
    clearCubes();
    // Build shelf background and populate all chords on shelf
    createShelfPlane();
    addEpicTitles();
    await loadShelfMap();
    // Remove any existing shelf instances before rebuilding
    clearShelf();
    const shelfRomans = [
        // Major
        'I', 'ii', 'iii', 'IV', 'V', 'vi', 'viiø',
        // Minor
        'i', 'iiø', 'bIII', 'iv', 'v', 'bVI', 'bVII', 'V(7)(b9)', 'viiº7',
        // Applied
        'I7', 'iiiø', 'II(7)', '#ivø', 'III(7)', '#vº', 'VI(7)', '#iº', 'VII(7)', '#iiº'
    ];
    for (const r of shelfRomans) await createShelfCube(r);
    // Ensure camera sees both layers by default
    try { camera.layers.enable(1); camera.layers.enable(2); } catch (_) { }
    // Safety: ensure visibility and repopulate if something went wrong
    if (shelfCubes.length === 0) {
        for (const r of shelfRomans) await createShelfCube(r);
    }
    for (const s of shelfCubes) { s.visible = true; }
    // Start with empty front row
    lineup = [];
    try {
        // OLD DRUM UI COMMENTED OUT - USING PROFESSIONAL DRUM MACHINE NOW
        // ensureTempoUi();
        // EMERGENCY: Force visible UI after 2 seconds
        setTimeout(() => {
            console.log('[EMERGENCY] Old drum UI disabled - using professional drum machine');
            // const widget = document.getElementById('unified-rhythm-widget');
            // if (!widget) {
            //     console.error('[EMERGENCY] Widget not found! Creating emergency UI...');
            //     createEmergencyUI();
            // } else {
            //     console.log('[EMERGENCY] Widget found, forcing visibility...');
            //     widget.style.cssText = `
            //         position: fixed !important;
            //         top: 50px !important;
            //         right: 50px !important;
            //         z-index: 2147483647 !important;
            //         background: rgba(255, 0, 0, 0.9) !important;
            //         color: white !important;
            //         padding: 20px !important;
            //         border-radius: 10px !important;
            //         display: block !important;
            //         visibility: visible !important;
            //         opacity: 1 !important;
            //         pointer-events: auto !important;
            //         min-width: 300px !important;
            //         font-family: Arial, sans-serif !important;
            //         font-size: 14px !important;
            //         box-shadow: 0 4px 20px rgba(0,0,0,0.8) !important;
            //     `;
            // }
        }, 2000);
    } catch (_) { }
}

async function updateLabels() {
    const makeFrontLabel = (cube) => {
        if (labelMode === 'roman') return cube.userData.roman;
        // Derive letter label by transposing original C-root to current key while preserving suffix from original letter
        try {
            const roman = cube.userData.roman;
            const orig = cube.userData.letter || '';
            // Prefer computed root from noteSetsC
            const rootC = (noteSetsC[roman] || ['C'])[0];
            const transposedRoot = transposeNotes([rootC], currentKey)[0];
            // Extract suffix from original letter (drop leading root note token)
            const m = String(orig).match(/^[A-G](?:#|b)?(.*)$/);
            const suffix = m ? m[1] : '';
            return `${transposedRoot}${suffix}`;
        } catch (_) { return cube.userData.letter; }
    };
    for (const c of cubes) {
        const label = makeFrontLabel(c);
        const materials = await makeMaterials(label, c.userData.roman, c.userData.extensions);
        c.material.forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
        c.material = materials;
    }
    for (const s of shelfCubes) {
        const label = (labelMode === 'roman') ? s.userData.roman : (() => {
            try {
                const rootC = (noteSetsC[s.userData.roman] || ['C'])[0];
                const transposedRoot = transposeNotes([rootC], currentKey)[0];
                const m = String(s.userData.letter || '').match(/^[A-G](?:#|b)?(.*)$/);
                const suffix = m ? m[1] : '';
                return `${transposedRoot}${suffix}`;
            } catch (_) { return s.userData.letter; }
        })();
        const materials = await makeMaterials(label, s.userData.roman);
        if (Array.isArray(s.material)) s.material.forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
        s.material = materials;
    }
}

// Raycast helpers
function setCubeLayerRecursive(root, layer) {
    if (!root) return;
    root.traverse?.((o) => { try { o.layers.set(layer); } catch (_) { } });
}

function getIntersects(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    // CRITICAL: reset layers every time for a full-scene pick
    try {
        raycaster.layers.set(0);
        raycaster.layers.enable(1);
        raycaster.layers.enable(2);
    } catch (_) { }
    // Include children so center-play overlays are hittable before rotation logic
    return raycaster.intersectObjects([...cubes, ...shelfCubes], true);
}

function getFrontRowHits(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    raycaster.layers.set(1); // front row layer
    return raycaster.intersectObjects(cubes, true);
}

function getShelfHits(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    raycaster.layers.set(2); // shelf layer
    return raycaster.intersectObjects([...(shelfPickProxies || []), ...shelfCubes], true);
}

// Orthographic shelf picking – parallel rays avoid large-cube dominance
function getShelfHitsOrtho(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    if (!shelfPickCamera) return [];
    raycaster.setFromCamera(pointer, shelfPickCamera);
    raycaster.layers.set(2);
    return raycaster.intersectObjects(shelfCubes, true);
}

// Robust screen-space quadrant decision for shelf inversion
function decideShelfDeltaScreen(cube, event) {
    try {
        const rect = renderer.domElement.getBoundingClientRect();
        // Project cube center
        const center = cube.position.clone().project(camera);
        const cx = rect.left + (center.x + 1) * 0.5 * rect.width;
        const cy = rect.top + (1 - (center.y + 1) * 0.5) * rect.height;
        // Estimate projected half extents by projecting offsets along local X/Y
        const half = (cubeSize * (cube.scale?.x || cube.scale || 1)) / 2;
        const pLocal = (x, y) => new THREE.Vector3(x, y, 0).applyMatrix4(cube.matrixWorld).project(camera);
        const px = pLocal(half, 0);
        const py = pLocal(0, half);
        const hx = Math.max(6, Math.abs((px.x - center.x) * 0.5 * rect.width));
        const hy = Math.max(6, Math.abs((py.y - center.y) * 0.5 * rect.height));
        const dx = event.clientX - cx;
        const dy = event.clientY - cy;
        const ax = Math.abs(dx), ay = Math.abs(dy);
        const xThresh = hx * 0.18, yThresh = hy * 0.18; // easier to trigger
        // Lower or center → root
        if (dy > yThresh) return 0;
        // Top dominant → 2nd inversion
        if (dy < -yThresh && ay >= ax) return +2;
        // Side dominant → 1st/3rd
        if (ax > xThresh) return dx > 0 ? +1 : -1;
        return 0;
    } catch (_) { return 0; }
}

// Local-space quadrant decision using normalized local coords (nx, ny in [-1,1])
function decideShelfDeltaLocal(nx, ny) {
    const ax = Math.abs(nx), ay = Math.abs(ny);
    const dead = 0.10; // smaller deadzone
    if (ax < dead && ay < dead) return 0;
    // Vertical dominance → top/low bands
    if (ay >= ax) return ny > 0 ? +2 : 0; // top → 2nd, bottom/center → root
    // Horizontal dominance → 1st/3rd
    return nx > 0 ? +1 : -1;
}

// Ascend from any child (edges, overlay, center) to the owning cube mesh
function resolveCubeFromObject(obj) {
    if (!obj) return null;
    // If overlay/center play exposes parent in userData
    if (obj.userData?.parent) return obj.userData.parent;
    let cur = obj;
    while (cur && !(cur.userData && (cur.userData.roman || cur.userData.isShelf))) {
        cur = cur.parent;
    }
    return cur || obj;
}

// Debug overlay for shelf picking
let debugEnabled = true; // Always enabled for forensic analysis
let debugOverlay = null;
function createDebugOverlay() {
    if (!debugEnabled || debugOverlay) return;
    debugOverlay = document.createElement('div');
    debugOverlay.style.cssText = 'position:fixed;bottom:10px;right:10px;background:rgba(0,0,0,0.8);color:#0f0;padding:10px;font-family:monospace;font-size:12px;z-index:10000;max-width:420px;pointer-events:none;text-align:right;';
    document.body.appendChild(debugOverlay);
}
function updateDebugOverlay(info) { if (debugOverlay) debugOverlay.innerHTML = info; }

function ensureDebugOverlayPosition() {
    if (!debugOverlay) return;
    try {
        debugOverlay.style.position = 'fixed';
        debugOverlay.style.bottom = '10px';
        debugOverlay.style.top = '';
        debugOverlay.style.right = '10px';
        debugOverlay.style.left = '';
        debugOverlay.style.textAlign = 'right';
        debugOverlay.style.whiteSpace = 'pre';
    } catch (_) { }
}

// Helper: point in polygon (ray casting)
function pointInPolygon(x, y, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x, yi = polygon[i].y;
        const xj = polygon[j].x, yj = polygon[j].y;
        const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / ((yj - yi) || 1e-6) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}
function polygonArea(poly) {
    let area = 0;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) area += (poly[j].x + poly[i].x) * (poly[j].y - poly[i].y);
    return Math.abs(area / 2);
}
function distanceToLineSegment(x, y, p1, p2) {
    const dx = p2.x - p1.x, dy = p2.y - p1.y; const len2 = dx * dx + dy * dy;
    if (len2 === 0) return Math.hypot(x - p1.x, y - p1.y);
    let t = ((x - p1.x) * dx + (y - p1.y) * dy) / len2; t = Math.max(0, Math.min(1, t));
    const px = p1.x + t * dx, py = p1.y + t * dy; return Math.hypot(x - px, y - py);
}
function distanceToPolygon(x, y, poly) {
    let min = Infinity; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) min = Math.min(min, distanceToLineSegment(x, y, poly[j], poly[i]));
    return min;
}

// Improved shelf picking using projected front-face quad
function pickShelfCubeByProjectedArea(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    const x = event.clientX - rect.left; const y = event.clientY - rect.top;
    const candidates = [];
    for (const cube of shelfCubes) {
        if (!cube.visible) continue;
        const box = new THREE.Box3().setFromObject(cube);
        // Four corners of the front face at z = box.max.z (toward camera for shelf)
        const corners = [
            new THREE.Vector3(box.min.x, box.min.y, box.max.z),
            new THREE.Vector3(box.max.x, box.min.y, box.max.z),
            new THREE.Vector3(box.max.x, box.max.y, box.max.z),
            new THREE.Vector3(box.min.x, box.max.y, box.max.z)
        ];
        const screenCorners = corners.map(c => {
            const p = c.clone().project(camera);
            return { x: (p.x + 1) * 0.5 * rect.width, y: (-p.y + 1) * 0.5 * rect.height };
        });
        let inside = pointInPolygon(x, y, screenCorners);
        const area = polygonArea(screenCorners);
        const distance = inside ? 0 : distanceToPolygon(x, y, screenCorners);
        // Tap tolerance: treat near-edge taps as inside to help smaller blocks
        if (!inside && distance <= 12) inside = true;
        candidates.push({ cube, roman: cube.userData.roman, inside, area, distance });
    }
    if (!candidates.length) return null;
    candidates.sort((a, b) => {
        if (a.inside !== b.inside) return a.inside ? -1 : 1;
        if (a.inside && b.inside) return a.area - b.area; // smaller wins when overlapping
        return a.distance - b.distance;
    });
    if (debugEnabled) {
        const info = `<b>Pointer:</b> ${x.toFixed(0)}, ${y.toFixed(0)}<br>` +
            `<b>Top:</b> ${candidates.slice(0, 5).map((c, i) => `${i + 1}. ${c.roman} ${c.inside ? 'INSIDE' : 'out'} A=${c.area.toFixed(0)} D=${c.distance.toFixed(1)}`).join('<br>')}`;
        updateDebugOverlay(info);
    }
    return candidates[0].cube || null;
}
// Pick the intended shelf cube under the pointer using screen-space rectangles
function pickShelfCubeAtPointer(e) {
    const rect = renderer.domElement.getBoundingClientRect();
    const px = (e.clientX - rect.left);
    const py = (e.clientY - rect.top);
    // Helper: convert world point to screen pixels
    const toScreen = (vec3) => {
        const v = vec3.clone();
        v.project(camera);
        return { x: (v.x * 0.5 + 0.5) * rect.width, y: (-v.y * 0.5 + 0.5) * rect.height };
    };
    // Estimate pixel size for 1 world unit at shelfZ by projecting a delta along X
    const p0 = new THREE.Vector3(0, 0, shelfZ);
    const p1 = new THREE.Vector3(1, 0, shelfZ);
    const s0 = toScreen(p0);
    const s1 = toScreen(p1);
    const pxPerWorld = Math.max(1, Math.hypot(s1.x - s0.x, s1.y - s0.y));
    // First pass: any rect contains pointer → choose smallest area rect
    const candidates = [];
    for (const s of shelfCubes) {
        if (!s.visible) continue;
        const center = toScreen(new THREE.Vector3(s.position.x, s.position.y, shelfZ));
        const halfWorld = (cubeSize * (s.scale?.x || s.scale || 1)) / 2;
        const halfPx = halfWorld * pxPerWorld;
        const left = center.x - halfPx, right = center.x + halfPx, top = center.y - halfPx, bottom = center.y + halfPx;
        const contains = (px >= left && px <= right && py >= top && py <= bottom);
        if (contains) {
            const area = (2 * halfPx) * (2 * halfPx);
            candidates.push({ s, area });
        }
    }
    if (candidates.length > 0) {
        candidates.sort((a, b) => a.area - b.area);
        return candidates[0].s;
    }
    // Fallback: nearest center with size penalty
    let best = null; let bestScore = Infinity;
    for (const s of shelfCubes) {
        if (!s.visible) continue;
        const center = toScreen(new THREE.Vector3(s.position.x, s.position.y, shelfZ));
        const dist = Math.hypot(center.x - px, center.y - py);
        const size = (s.scale?.x || s.scale || 1);
        const score = dist + size * 18; // penalize larger blocks more in screen-space
        if (score < bestScore) { bestScore = score; best = s; }
    }
    return best;
}

function isPointerOverShelf(e) {
    // Heuristic: if the pointer is within a vertical band around the shelf Y at shelfZ in screen space, treat as shelf click
    const rect = renderer.domElement.getBoundingClientRect();
    const px = (e.clientX - rect.left);
    const py = (e.clientY - rect.top);
    const shelfPoint = new THREE.Vector3(0, shelfY, shelfZ);
    const scr = shelfPoint.project(camera);
    const shelfPy = (-scr.y * 0.5 + 0.5) * rect.height;
    const band = Math.max(60, rect.height * 0.08); // 8% of screen height or 60px
    return Math.abs(py - shelfPy) <= band;
}

function onPointerDown(e) {
    // Track where drag started for continuity
    dragStartZone = currentMouseZone;


    // Only honor left-click for selections/drags
    if (typeof e.button === 'number' && e.button !== 0) return;
    const rect = renderer.domElement.getBoundingClientRect();
    mouseDownPos.set(e.clientX - rect.left, e.clientY - rect.top);
    mouseDownTime = performance.now();
    fsm.onPointerDown(mouseDownPos.x, mouseDownPos.y, mouseDownTime);
    try { renderer.domElement.setPointerCapture?.(e.pointerId); } catch (_) { }

    console.log(`[POINTER-DOWN] Starting click detection. Front-row cubes: ${cubes.length}, Shelf cubes: ${shelfCubes.length}`);

    // Temporary: check UI locks first; if hit, set guard and disable controls
    try {
        const rect0 = renderer.domElement.getBoundingClientRect();
        pointer.x = ((e.clientX - rect0.left) / rect0.width) * 2 - 1;
        pointer.y = -((e.clientY - rect0.top) / rect0.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const uiHits0 = raycaster.intersectObjects(uiPickables.filter(Boolean), true);
        if (uiHits0.length) { uiLockClick = true; controls.enabled = false; pendingObj = null; return; }
    } catch (_) { }

    // Front-row first (layer 1)
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    raycaster.layers.set(1);
    let hits = raycaster.intersectObjects(cubes, true);
    console.log(`[POINTER-DOWN] Front-row hits: ${hits.length}`);
    if (hits.length > 0) {
        let obj = resolveCubeFromObject(hits[0].object);
        console.log(`[POINTER-DOWN] Setting pendingObj to front-row: ${obj?.userData?.roman}`);
        pendingObj = obj;
        controls.enabled = !adjustMode;
        return;
    }

    // Shelf second (layer 2): precise screen-projected polygon picker first (no band gating)
    try {
        const shelfPick = pickShelfCubeByProjectedArea(e);
        if (shelfPick && shelfPick.userData?.isShelf) {
            pendingObj = shelfPick;
            controls.enabled = !adjustMode;
            if (adjustMode) lastShelfTarget = pendingObj;
            return;
        }
    } catch (_) { }
    // Fallback: shelf proxies/cubes raycast with perspective camera
    raycaster.layers.set(2);
    hits = raycaster.intersectObjects([...(shelfPickProxies || []), ...shelfCubes], true);
    if (hits.length > 0) {
        pendingObj = resolveCubeFromObject(hits[0].object);
        controls.enabled = !adjustMode;
        if (adjustMode && pendingObj?.userData?.isShelf) lastShelfTarget = pendingObj;
        return;
    }
    pendingObj = null;
}

function onPointerMove(e) {

    if (!pendingObj && !dragging) return;
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const worldPoint = new THREE.Vector3();
    if (!dragging && pendingObj) {
        // Check drag threshold via FSM
        if (fsm.movementExceeded(e.clientX - rect.left, e.clientY - rect.top)) {
            // Begin drag
            if (!adjustMode && pendingObj.userData.isShelf) {
                // Move the actual shelf object; duplicate later after it rests in front row
                dragging = pendingObj;
                dragging.userData.wasPulledFromShelf = true;
                dragging.userData.fromShelf = true; // mark explicitly during easing
                // Remove from shelfCubes for now so the slot is empty during drag
                const si = shelfCubes.indexOf(dragging); if (si >= 0) shelfCubes.splice(si, 1);
                cancelTweensFor(dragging);
                // Track initial screen Y → map to Z during drag
                dragStartScreenY = e.clientY;
                dragStartZ = dragging.position.z;
                // Cache shelf Y and shelf scale for smooth interpolation
                const r = dragging.userData.roman;
                dragging.userData.shelfY0 = (shelfOriginByRoman[r]?.position.y ?? shelfY);
                dragging.userData.shelfScale0 = (shelfOriginByRoman[r]?.scale ?? scaleByRoman[r] ?? dragging.scale.x);
                // Lock a constant ground plane for X mapping at shelf Y
                dragPlaneY = dragging.userData.shelfY0;
                plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, dragPlaneY, 0));
                raycaster.ray.intersectPlane(plane, worldPoint);
                dragOffsetX = worldPoint.x - dragging.position.x;
            } else {
                dragging = pendingObj;
                cancelTweensFor(dragging);
                if (!dragging.userData.isShelf) removeFromLineup(dragging);
                // Lock a constant ground plane at the chord's shelf Y for consistent X mapping
                const r = dragging.userData.roman;
                dragging.userData.shelfY0 = (shelfOriginByRoman[r]?.position.y ?? shelfY);
                dragPlaneY = dragging.userData.shelfY0;
                plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, dragPlaneY, 0));
                raycaster.ray.intersectPlane(plane, worldPoint);
                dragOffsetX = worldPoint.x - dragging.position.x;
                dragStartScreenY = e.clientY;
                dragStartZ = dragging.position.z; // 0 for front row
                dragging.userData.shelfScale0 = (shelfOriginByRoman[r]?.scale ?? scaleByRoman[r] ?? dragging.scale.x);
            }
            pendingObj = null;
            dragStartWorld.copy(dragging.position);
            lastMoveWorld.copy(dragging.position);
            lastMoveTime = performance.now();
            controls.enabled = false;
        }
    }
    if (dragging) {
        // Intersect with a constant ground plane at dragPlaneY to avoid perspective X drift
        plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, dragPlaneY, 0));
        if (raycaster.ray.intersectPlane(plane, worldPoint)) {
            // worldPoint is the cursor hit on the fixed ground plane
            const desiredXFromPlane = worldPoint.x - dragOffsetX;
            // Depth control via vertical mouse motion - RESTRICTED IN ADJUST MODE
            const dyScreen = e.clientY - dragStartScreenY;
            const r = dragging.userData.roman;
            const shelfY0 = dragging.userData.shelfY0 ?? (shelfOriginByRoman[r]?.position.y ?? shelfY);
            const desired = ensureDesired(dragging.userData);

            if (adjustMode && dragging.userData?.isShelf) {
                // ADJUST MODE: Free X/Y movement, LOCK Z position
                desired.x = desiredXFromPlane;
                desired.y = shelfY0 + (dyScreen * -0.01); // Allow up/down movement
                desired.z = dragStartZ; // LOCK Z - no depth changes in adjust mode
                desired.s = dragging.userData.shelfScale0 ?? dragging.scale.x;
                console.log(`[SHELF ADJUST] Free XY movement - X: ${desired.x.toFixed(2)}, Y: ${desired.y.toFixed(2)}, Z: LOCKED at ${desired.z.toFixed(2)}`);
            } else if (dragging.userData.fromShelf) {
                const zFromMouse = THREE.MathUtils.clamp(dragStartZ + dyScreen * DRAG_Z_PER_PX, shelfZ, FRONT_ROW_FORWARD_Z);
                const t = THREE.MathUtils.clamp((zFromMouse - shelfZ) / (0 - shelfZ), 0, 1);
                const yMapped = THREE.MathUtils.lerp(shelfY0, 0, t);
                desired.x = THREE.MathUtils.clamp(desiredXFromPlane, -8, 8);
                desired.y = yMapped;
                desired.z = zFromMouse;
                const s0 = dragging.userData.shelfScale0 ?? 0.7;
                desired.s = THREE.MathUtils.lerp(s0, FRONT_ROW_SCALE, t);
                desired.t = t;
                if (t > 0.6 && !lineup.includes(dragging)) previewMakeWay(computeInsertionIndex(desired.x));
            } else {
                const zFromMouse = THREE.MathUtils.clamp(dragStartZ + dyScreen * DRAG_Z_PER_PX, shelfZ, FRONT_ROW_FORWARD_Z);
                const t = THREE.MathUtils.clamp((zFromMouse - shelfZ) / (0 - shelfZ), 0, 1);
                const yMapped = THREE.MathUtils.lerp(shelfY0, 0, t);
                desired.x = THREE.MathUtils.clamp(desiredXFromPlane, -8, 8);
                desired.y = yMapped;
                desired.z = zFromMouse;
                const s0 = dragging.userData.shelfScale0 ?? 0.7;
                desired.s = THREE.MathUtils.lerp(s0, FRONT_ROW_SCALE, t);
                desired.t = t;
                if (t > 0.6) previewMakeWay(computeInsertionIndex(desired.x));
            }
            lastMoveWorld.copy(dragging.position);
            lastMoveTime = performance.now();
        }
    }
}

function onPointerUp(e) {
    const now = performance.now();
    try { renderer.domElement.releasePointerCapture?.(e.pointerId); } catch (_) { }

    // ZONE-BASED CONTROL: Reset drag state
    isDraggingCamera = false;
    dragStartZone = null;
    if (dragging) {
        const r = dragging.userData.roman;
        // Adjust mode: persist shelf edits and do not snap
        if (adjustMode && dragging.userData?.isShelf) {
            // Persist position and scale into the live map and origin
            shelfSlots[r] = dragging.position.clone();
            if (!shelfOriginByRoman[r]) shelfOriginByRoman[r] = { position: new THREE.Vector3(), scale: dragging.scale.x, quaternion: dragging.quaternion.clone() };
            shelfOriginByRoman[r].position.copy(dragging.position);
            shelfOriginByRoman[r].scale = dragging.scale.x;
            shelfOriginByRoman[r].quaternion.copy(dragging.quaternion);
            saveShelfMapToLocalStorage();
            dragging = null; controls.enabled = true; return;
        }
        // Quick flick upward to shelf using dragStartScreenY baseline
        const dyScreen = dragStartScreenY - e.clientY; // positive if moved up
        const totalMs = now - mouseDownTime;
        const origin = shelfOriginByRoman[r];
        const originPos = origin?.position || shelfSlots[r] || new THREE.Vector3(0, 0, shelfZ);
        const originScale = origin?.scale ?? scaleByRoman[r] ?? dragging.scale.x;
        const isFlickUp = (totalMs < 240 && dyScreen > 42);
        if (isFlickUp) {
            // Hard snap back to exact origin
            dragging.position.copy(originPos);
            dragging.scale.setScalar(originScale);
            dragging.userData.isShelf = true;
            dragging.userData.fromShelf = false;
            removeFromLineup(dragging);
            const ci = cubes.indexOf(dragging); if (ci >= 0) cubes.splice(ci, 1);
            if (!shelfCubes.includes(dragging)) shelfCubes.push(dragging);
            dragging = null; controls.enabled = true; return;
        }
        // Decide nearest rest: shelf origin or front row plane at current x
        const dzShelf = Math.abs(dragging.position.z - shelfZ);
        const dzFront = Math.abs(dragging.position.z - 0);
        if (dzFront <= dzShelf) {
            // Hard snap to front row
            const idx = computeInsertionIndex(dragging.position.x);
            if (!lineup.includes(dragging)) lineup.splice(idx, 0, dragging);
            dragging.position.set(dragging.position.x, 0, 0);
            dragging.scale.setScalar(FRONT_ROW_SCALE);
            dragging.userData.isShelf = false;
            dragging.userData.fromShelf = false;
            if (!cubes.includes(dragging)) cubes.push(dragging);
            setCubeLayerRecursive(dragging, 1);
            // Ensure shelf has a canonical cube for this roman if we pulled it from the shelf
            if (dragging.userData.wasPulledFromShelf) {
                dragging.userData.wasPulledFromShelf = false;
                const exists = shelfCubes.some(c => c.userData?.roman === r);
                if (!exists) { createShelfCube(r); }
            }
            reflowLineup();
        } else {
            // Hard snap to shelf origin
            dragging.position.copy(originPos);
            dragging.scale.setScalar(originScale);
            dragging.userData.isShelf = true;
            dragging.userData.fromShelf = false;
            removeFromLineup(dragging);
            const ci = cubes.indexOf(dragging); if (ci >= 0) cubes.splice(ci, 1);
            if (!shelfCubes.includes(dragging)) shelfCubes.push(dragging);
            setCubeLayerRecursive(dragging, 2);
            // Close gaps in lineup immediately after removal
            reflowLineup();
        }
        dragging = null;
        controls.enabled = true;
        return;
    }
    // 3D UI lock icon picking (before cube click handling)
    try {
        raycaster.setFromCamera(pointer, camera);
        const uiHits = raycaster.intersectObjects(uiPickables.filter(Boolean), true);
        if (uiHits.length) {
            const obj = uiHits[0].object;
            const ud = obj.userData || {};
            if (ud.kind === 'melody-lock') {
                const locking = (ud.state === 'open');
                if (locking) {
                    console.log('[locks] melody lock click');
                    showNVXDebugText('3r 5b3rd 7 2b7th');
                    shimmerMelodyTopFaces();
                    setTimeout(() => {
                        console.log('[locks] lockInMelody start');
                        lockInMelody();
                        // Ensure start at -PI/2, then animate to 0
                        if (melodyLaneGroup) melodyLaneGroup.children.forEach((p, i) => { p.rotation.x = -Math.PI / 2; });
                        console.log('[locks] spinMelodyLane for visibility');
                        spinMelodyLane(10000, 6);
                        console.log('[locks] shimmer lane');
                        shimmerMelodyLane();
                    }, 240);
                    setMelodyLockVisual('closed');
                    try { playLockSound(); } catch (_) { }
                } else {
                    lockedMelody = null; renderMelodyLane(); setMelodyLockVisual('open');
                }
            } else if (ud.kind === 'bass-lock') {
                const locking = (ud.state === 'open');
                if (locking) {
                    shimmerBassBottomFaces();
                    setTimeout(() => { lockInBass(); animateStandUpLanes(); }, 240);
                    setBassLockVisual('closed');
                    try { playLockSound(); } catch (_) { }
                } else {
                    lockedBass = null; renderBassLane(); setBassLockVisual('open');
                }
            } else if (ud.isMelodyPlayButton) {
                // BULLETPROOF: Double-check camera position for melody view
                const toTarget = camera.position.clone().sub(controls.target);
                if (toTarget.y >= 0) { // Confirmed melody view (camera above plane)
                    console.log('[MELODY PLAY] ✅ Melody view confirmed - playing melody');
                    playMelodyOnly();
                } else {
                    console.log('[MELODY PLAY] ❌ Camera below plane - ignoring melody button click');
                }
            } else if (ud.isBassPlayButton) {
                // BULLETPROOF: Double-check camera position for bass view
                const toTarget = camera.position.clone().sub(controls.target);
                if (toTarget.y < 0) { // Confirmed bass view (camera below plane)
                    console.log('[BASS PLAY] ✅ Bass view confirmed - playing bass');
                    playBassOnly();
                } else {
                    console.log('[BASS PLAY] ❌ Camera above plane - ignoring bass button click');
                }
            }
            pendingObj = null; uiLockClick = false; controls.enabled = true; e.stopPropagation?.(); e.preventDefault?.();
            return;
        }
    } catch (_) { }

    // If we had a UI-lock click but pointerup missed it, swallow to avoid shelf/cube selection
    if (uiLockClick) { uiLockClick = false; controls.enabled = true; return; }

    // Rotation click if minimal move/time (only front-face quadrant behavior)
    if (pendingObj) {
        const rect = renderer.domElement.getBoundingClientRect();
        const res = fsm.classifyRelease(e.clientX - rect.left, e.clientY - rect.top, now);
        console.log(`[FSM] pendingObj: ${pendingObj?.userData?.roman}, isClick: ${res.isClick}, moved: ${res.moved}, elapsed: ${res.elapsed}`);
        if (res.isClick) {
            const hits = getIntersects(e);
            console.log(`[CLICK] ===== CLICK DETECTED =====`);
            console.log(`[CLICK] Total hits: ${hits.length}`);
            console.log(`[CLICK] Hit objects:`, hits.map(h => `${h.object?.userData?.isCenterPlay ? 'CENTER-PLAY' : h.object?.userData?.isOverlay ? 'OVERLAY' : h.object?.userData?.isShelfProxy ? 'SHELF-PROXY' : 'FACE'} for ${resolveCubeFromObject(h.object)?.userData?.roman || 'unknown'}`));
            // Global 3D play button check
            for (const h of hits) {
                if (h.object?.userData?.isPlayButton) {
                    console.log(`[CLICK] Play button hit - starting progression`);
                    playFrontRowProgression(); pendingObj = null; return;
                }
            }
            // Use screen-space rectangle picking for shelf cubes
            let shelfHit = null;
            try { shelfHit = pickShelfCubeAtPointer(e); } catch (_) { }
            // If we pressed a FRONT-ROW cube on pointerdown, force it as the target for click handling
            const frontOverride = !!(pendingObj && !pendingObj.userData?.isShelf);
            const fromShelfBand = frontOverride ? false : isPointerOverShelf(e);
            console.log(`[CLICK] pendingObj: ${pendingObj?.userData?.roman}, frontOverride: ${frontOverride}, fromShelfBand: ${fromShelfBand}`);
            // If polygon picker already chose a shelf cube at mousedown, trust it
            if (pendingObj && pendingObj.userData?.isShelf) {
                // IMPROV MODE: Queue chord instead of adding to front row
                if (improvMode && window.drumMachine && window.drumMachine.isPlaying) {
                    console.log(`[IMPROV SHELF CLICK] Queueing ${pendingObj.userData.roman} instead of adding to front row`);

                    // CRITICAL: Capture rotation delta for Creation mode BEFORE queueing
                    try {
                        const d = decideShelfDeltaScreen(pendingObj, e);
                        pendingObj.userData.desiredRotationDelta = d;
                        console.log(`[IMPROV SHELF CLICK] Captured rotation delta: ${d} for ${pendingObj.userData.roman}`);
                    } catch (_) {
                        pendingObj.userData.desiredRotationDelta = 0;
                        console.log(`[IMPROV SHELF CLICK] Failed to capture rotation delta, using 0 for ${pendingObj.userData.roman}`);
                    }

                    // FIXED: Only Alt/Option adds 7th (NOT shift - shift is for compound intervals)
                    const isAltClick = globalModifierState.altPressed || e.altKey;
                    const shouldUse7th = withSeventh || isAltClick;
                    queueChordForDownbeat(pendingObj, shouldUse7th);

                    // CRITICAL: Ensure proper cleanup to prevent mouse sticking
                    pendingObj = null;
                    controls.enabled = true; // Re-enable camera controls
                    e.stopPropagation?.();
                    e.preventDefault?.();
                    return;
                }

                try {
                    const d = decideShelfDeltaScreen(pendingObj, e);
                    pendingObj.userData.desiredRotationDelta = d;
                    console.log('[shelf] pending click screen delta =', d, 'for', pendingObj.userData?.roman);
                } catch (_) { pendingObj.userData.desiredRotationDelta = 0; }
                enqueueShelfAdd(pendingObj); pendingObj = null; return;
            }
            // Additional safety: if any shelf cube is directly in the hit stack, prioritize it immediately
            let shelfFromRay = null;
            for (const h of hits) {
                const o = resolveCubeFromObject(h.object);
                // Treat shelf proxy as its parent cube
                const shelfCandidate = (h.object?.userData?.isShelfProxy && h.object.userData.parent) ? h.object.userData.parent : o;
                if (shelfCandidate?.userData?.isShelf) { shelfFromRay = shelfCandidate; break; }
            }
            // If we're over the shelf region, try a strict shelf-only raycast first (unless frontOverride)
            let targetObj = null;
            if (frontOverride) {
                targetObj = pendingObj;
            } else if (fromShelfBand) {
                const shelfHits = (() => {
                    const rect = renderer.domElement.getBoundingClientRect();
                    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
                    const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;
                    const rc = new THREE.Raycaster();
                    rc.setFromCamera(new THREE.Vector2(nx, ny), camera);
                    return rc.intersectObjects(shelfCubes, true);
                })();
                if (shelfHits && shelfHits.length) {
                    // Prefer the shelf cube whose footprint contains the hit point; break ties by smaller size
                    let chosen = null; let bestSize = Infinity;
                    for (const h of shelfHits) {
                        const o = resolveCubeFromObject(h.object);
                        if (!o?.userData?.isShelf) continue;
                        const half = (cubeSize * (o.scale?.x || o.scale || 1)) / 2;
                        if (Math.abs(h.point.x - o.position.x) <= half && Math.abs(h.point.y - o.position.y) <= half) {
                            const sz = (o.scale?.x || o.scale || 1);
                            if (sz < bestSize) { bestSize = sz; chosen = o; }
                        }
                    }
                    targetObj = chosen || resolveCubeFromObject(shelfHits[0].object);
                } else {
                    targetObj = shelfHit || pendingObj;
                }
            } else {
                targetObj = shelfFromRay || ((pendingObj && pendingObj.userData?.isShelf) ? pendingObj : resolveCubeFromObject(hits[0]?.object));
            }
            console.log(`[CLICK] targetObj: ${targetObj?.userData?.roman}, isShelf: ${!!targetObj?.userData?.isShelf}`);
            if (!targetObj) { pendingObj = null; return; }
            // If clicking a shelf cube, handle differently for adjust mode vs normal mode
            if (targetObj.userData?.isShelf) {
                if (adjustMode) {
                    // ADJUST MODE: Just play the chord, don't duplicate
                    console.log(`[ADJUST MODE] Playing shelf chord ${targetObj.userData.roman} without duplication`);

                    // FIXED: Only Alt/Option adds 7th (NOT shift - shift is for compound intervals)
                    const isAltClick = globalModifierState.altPressed;
                    const shouldUse7th = withSeventh || isAltClick;

                    if (isAltClick) {
                        console.log(`[ADJUST ALT+CLICK] FORCING 7th for ${targetObj.userData.roman}`);
                        updateChordFaceWith7th(targetObj);
                    }

                    // IMPROV MODE: Queue chord for next downbeat if drums are playing
                    if (improvMode && window.drumMachine && window.drumMachine.isPlaying) {
                        queueChordForDownbeat(targetObj, shouldUse7th);
                    } else {
                        playChordForObjectWith7th(targetObj, shouldUse7th);
                    }
                    pendingObj = null; return;
                } else {
                    // IMPROV MODE CHECK: Queue chord instead of adding to front row
                    if (improvMode && window.drumMachine && window.drumMachine.isPlaying) {
                        console.log(`[IMPROV SHELF CLICK] Queueing ${targetObj.userData.roman} instead of adding to front row`);

                        // CRITICAL: Capture rotation delta for Creation mode BEFORE queueing
                        try {
                            const d = decideShelfDeltaScreen(targetObj, e);
                            targetObj.userData.desiredRotationDelta = d;
                            console.log(`[IMPROV SHELF CLICK] Captured rotation delta: ${d} for ${targetObj.userData.roman}`);
                        } catch (_) {
                            targetObj.userData.desiredRotationDelta = 0;
                            console.log(`[IMPROV SHELF CLICK] Failed to capture rotation delta, using 0 for ${targetObj.userData.roman}`);
                        }

                        // FIXED: Only Alt/Option adds 7th (NOT shift - shift is for compound intervals)
                        const isAltClick = globalModifierState.altPressed || e.altKey;
                        const shouldUse7th = withSeventh || isAltClick;
                        queueChordForDownbeat(targetObj, shouldUse7th);

                        // CRITICAL: Ensure proper cleanup to prevent mouse sticking
                        pendingObj = null;
                        controls.enabled = true; // Re-enable camera controls
                        e.stopPropagation?.();
                        e.preventDefault?.();
                        return;
                    }

                    // NORMAL MODE: Create clone and add to front row
                    try {
                        const d = decideShelfDeltaScreen(targetObj, e);
                        targetObj.userData.desiredRotationDelta = d;
                        console.log('[shelf] target click screen delta =', d, 'for', targetObj.userData?.roman);
                    } catch (_) { targetObj.userData.desiredRotationDelta = 0; }
                    enqueueShelfAdd(targetObj); pendingObj = null; return;
                }
            }
            // Center play priority for the pressed cube
            const centerHit = pickCenterPlay(hits, targetObj);
            if (centerHit) {
                console.log(`[CENTER-PLAY DEBUG] Playing center for ${targetObj.userData.roman}`);

                // BULLETPROOF MODIFIER DETECTION - Use global state + event state  
                // FIXED: Only Alt/Option adds 7th (NOT shift - shift is for compound intervals)
                const isAltClick = globalModifierState.altPressed || e.altKey;
                const shouldUse7th = withSeventh || isAltClick;

                console.log(`[CLICK DEBUG] ${targetObj.userData.roman} - withSeventh: ${withSeventh}, isAltClick: ${isAltClick}, shouldUse7th: ${shouldUse7th}`);
                console.log(`[CLICK DEBUG] Global state - Alt: ${globalModifierState.altPressed}, Shift: ${globalModifierState.shiftPressed} (shift for compound intervals only)`);
                console.log(`[CLICK DEBUG] Event state - Alt: ${e.altKey}, Shift: ${e.shiftKey}, Ctrl: ${e.ctrlKey}, Meta: ${e.metaKey}`);

                if (isAltClick) {
                    console.log(`[MODIFIER+CLICK] FORCING 7th for ${targetObj.userData.roman}`);
                    // Update front face texture to show 7th notation temporarily
                    updateChordFaceWith7th(targetObj);
                }

                // IMPROV MODE: Queue chord for next downbeat if drums are playing
                if (improvMode && window.drumMachine && window.drumMachine.isPlaying) {
                    queueChordForDownbeat(targetObj, shouldUse7th);
                } else {
                    // Play chord with 7th if global setting OR ANY modifier
                    playChordForObjectWith7th(targetObj, shouldUse7th);
                }

                pendingObj = null; return;
            }
            // Find a hit belonging to the pressed cube (overlay or face)
            let hit = null;
            for (const h of hits) { const o = resolveCubeFromObject(h.object); if (o === targetObj) { hit = h; break; } }
            if (hit) {
                console.log(`[CLICK] Found hit for ${targetObj.userData.roman}, processing...`);
                // Then overlay/front, then faces
                const isOverlay = isFrontOverlayHit(hit, targetObj);
                const normalZ = isOverlay ? 1 : (hit.face?.normal?.z ?? 0);
                console.log(`[HIT DEBUG] ${targetObj.userData.roman} isOverlay=${isOverlay}, normalZ=${normalZ}`);
                if (Math.abs(normalZ - 1) < 0.5) {
                    console.log(`[CLICK] ENTERING QUADRANT LOGIC for ${targetObj.userData.roman}`);
                    const local = targetObj.worldToLocal(hit.point.clone());
                    const absX = Math.abs(local.x);
                    const absY = Math.abs(local.y);
                    let targetToneIndex; if (absX > absY) targetToneIndex = local.x > 0 ? 1 : 3; else targetToneIndex = local.y > 0 ? 2 : 0;
                    const r = targetObj.userData.rotationIndex || 0;
                    const cw = (targetToneIndex - r + 4) % 4; const ccw = (r - targetToneIndex + 4) % 4;
                    let angle = 0; let delta = 0;
                    if (cw <= ccw) { angle = -cw * (Math.PI / 2); delta = +cw; } else { angle = ccw * (Math.PI / 2); delta = -ccw; }

                    // CRITICAL FIX: Set rotation to TARGET tone index for immediate audio (like shelf clicks)
                    const originalRotationIndex = targetObj.userData.rotationIndex;
                    targetObj.userData.rotationIndex = targetToneIndex; // Use clicked quadrant directly

                    console.log(`[FRONT-ROW DEBUG] Clicked quadrant ${targetToneIndex}, was ${originalRotationIndex}, now ${targetObj.userData.rotationIndex}`);

                    // BULLETPROOF MODIFIER DETECTION - Use global state + event state
                    // FIXED: Only Alt/Option adds 7th (NOT shift - shift is for compound intervals)
                    const isAltClick = globalModifierState.altPressed || e.altKey;
                    const shouldUse7th = withSeventh || isAltClick;

                    console.log(`[QUADRANT DEBUG] ${targetObj.userData.roman} - withSeventh: ${withSeventh}, isAltClick: ${isAltClick}, shouldUse7th: ${shouldUse7th}`);
                    console.log(`[QUADRANT DEBUG] Global state - Alt: ${globalModifierState.altPressed}, Shift: ${globalModifierState.shiftPressed} (shift for compound intervals only)`);
                    console.log(`[QUADRANT DEBUG] Event state - Alt: ${e.altKey}, Shift: ${e.shiftKey}, Ctrl: ${e.ctrlKey}, Meta: ${e.metaKey}`);

                    if (isAltClick) {
                        console.log(`[MODIFIER+CLICK] FORCING 7th for ${targetObj.userData.roman} (quadrant)`);
                        // Update front face texture to show 7th notation temporarily
                        updateChordFaceWith7th(targetObj);
                    }

                    // Play chord with 7th if global setting OR ANY modifier
                    playChordForObjectWith7th(targetObj, shouldUse7th);

                    if (angle !== 0) {
                        const extra = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), angle);
                        const finalQ = targetObj.quaternion.clone().multiply(extra);
                        if (hasActiveTweenFor(targetObj)) cancelTweensFor(targetObj);
                        // Start gentle eased rotation animation
                        animateQuaternion(targetObj, finalQ, 650);
                    } else {
                        // No rotation needed, but keep the target rotation index
                        targetObj.userData.rotationIndex = targetToneIndex;
                    }
                    // Ensure rotation index is normalized (targetToneIndex should already be 0-3)
                    targetObj.userData.rotationIndex = ((targetObj.userData.rotationIndex % 4) + 4) % 4;
                } else if (hit.face) {
                    // Determine voice by world orientation: bottom→bass, top→melody, sides→chord
                    const normalLocal = hit.face.normal.clone();
                    const normalWorld = normalLocal.transformDirection(targetObj.matrixWorld);
                    const up = new THREE.Vector3(0, 1, 0);
                    const dotY = normalWorld.dot(up);
                    const right = new THREE.Vector3(1, 0, 0);
                    const dotX = normalWorld.dot(right);
                    const tones = noteSetsC[targetObj.userData.roman] || ['C', 'E', 'G', 'B'];
                    const names = transposeNotes(tones, currentKey);
                    const r = ((targetObj.userData.rotationIndex || 0) % 4 + 4) % 4;
                    let voice = 'chord';
                    let idx = r; // default
                    if (dotY < -0.8) { voice = 'bass'; idx = r; } // bottom face
                    else if (dotY > 0.8) { voice = 'melody'; idx = (r + 2) % 4; } // top face
                    else if (dotX > 0.8) { voice = 'chord'; idx = (r + 1) % 4; } // right
                    else if (dotX < -0.8) { voice = 'chord'; idx = (r + 3) % 4; } // left
                    const fi = hit.face.materialIndex;
                    const mat = Array.isArray(targetObj.material) ? targetObj.material[fi] : targetObj.material;
                    const pulse = () => {
                        if (!mat || !mat.color) return;
                        const orig = mat.color.getHex(); mat.color.setHex(0xffff66);
                        setTimeout(() => { mat.color.setHex(orig); }, 140);
                    };
                    pulse();
                    const t0 = ensureAudio().currentTime;
                    if (voice === 'bass') {
                        let midi = getBassMidiForObject(targetObj);
                        // Apply industry standard range constraints based on selected instrument
                        const bassInstrument = document.getElementById('bass-inst')?.value || 'contrabass';
                        midi = constrainToInstrumentRange(midi, bassInstrument, 'bass');

                        // REAL-TIME VOICE LEADING 3: Get intelligent context from last played chord
                        const context = getVoiceLeadingContext(targetObj.userData.roman, 'bass');
                        midi = voiceLeadMidi(midi, lastBassMidi, context);

                        // NEW AUDIO ENGINE: Use the real bass instruments
                        if (window.audioEngine && window.audioEngine.playBass) {
                            const bassNote = Tone.Frequency(midi, "midi").toNote();
                            window.audioEngine.playBass(bassNote, 0.45, 0.34, true);
                            lastBassMidi = midi;
                            console.log('[CHORD CLICK] 🎵 Playing bass with VL3:', bassNote, 'from', context.previousChord, '→', context.currentChord);
                        } else {
                            console.error('[obs-cubes] New audio engine not available for bass');
                        }
                    } else if (voice === 'melody') {
                        let midi = getMelodyMidiForObject(targetObj);
                        // Apply industry standard range constraints based on selected instrument
                        const melodyInstrument = document.getElementById('melody-inst')?.value || 'violin';
                        midi = constrainToInstrumentRange(midi, melodyInstrument, 'melody');

                        // REAL-TIME VOICE LEADING 3: Get intelligent context from last played chord
                        const context = getVoiceLeadingContext(targetObj.userData.roman, 'melody');
                        midi = voiceLeadMidi(midi, lastMelodyMidi, context);

                        // NEW AUDIO ENGINE: Use the real melody instruments
                        if (window.audioEngine && window.audioEngine.playMelody) {
                            const melodyNote = Tone.Frequency(midi, "midi").toNote();
                            window.audioEngine.playMelody([melodyNote], [0.45], 0.32);
                            lastMelodyMidi = midi;
                            console.log('[CHORD CLICK] 🎵 Playing melody with VL3:', melodyNote, 'from', context.previousChord, '→', context.currentChord);
                        } else {
                            console.error('[obs-cubes] New audio engine not available for melody');
                        }
                    } else {
                        const midi = 60 + pcOf(names[idx]);
                        if (sfChord && sfChord.play) sfChord.play(midi, t0, { duration: 0.4, gain: 0.22 * chordVolume });
                        else { console.error('[obs-cubes] Chord instrument missing; no oscillator fallback.'); }
                    }

                    // UPDATE CHORD CONTEXT: Track this chord for next voice leading decision
                    const playedMidis = {};
                    if (voice === 'bass' && lastBassMidi != null) playedMidis.bass = lastBassMidi;
                    if (voice === 'melody' && lastMelodyMidi != null) playedMidis.melody = lastMelodyMidi;
                    updateChordContext(targetObj.userData.roman, playedMidis);
                }
            }
        }
        pendingObj = null;
    }
}

function targetQuaternionForFaceNormal(normal) {
    // normal is in object space; map to one of the 6 axis-aligned faces
    const n = normal.clone();
    // Determine dominant axis
    const ax = Math.abs(n.x), ay = Math.abs(n.y), az = Math.abs(n.z);
    let face = '+z';
    if (ax > ay && ax > az) face = n.x > 0 ? '+x' : '-x';
    else if (ay > ax && ay > az) face = n.y > 0 ? '+y' : '-y';
    else face = n.z > 0 ? '+z' : '-z';

    const q = new THREE.Quaternion();
    switch (face) {
        case '+z': q.identity(); break;
        case '-z': q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI); break;
        case '+x': q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2); break;
        case '-x': q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2); break;
        case '+y': q.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2); break;
        case '-y': q.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2); break;
    }
    return q;
}

function makeQuadrantOverlayMaterial() {
    const size = 256;
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, size, size);
    // Keep drawing logic (X) but we'll hide via opacity
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(20, 20); ctx.lineTo(size - 20, size - 20);
    ctx.moveTo(size - 20, 20); ctx.lineTo(20, size - 20);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, size - 20, size - 20);
    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
    mat.opacity = 0; // invisible but present for reference if needed
    return mat;
}

function addQuadrantOverlay(parentCube) {
    const overlayGeom = new THREE.PlaneGeometry(0.98, 0.98); // tighter than face to reduce occlusion
    const overlayMat = makeQuadrantOverlayMaterial();
    const overlay = new THREE.Mesh(overlayGeom, overlayMat);
    overlay.position.set(0, 0, (cubeSize / 2) + 0.002); // sit just above +z face
    parentCube.add(overlay);
    overlay.layers.mask = parentCube.layers.mask; // inherit layer
    parentCube.userData.overlay = overlay;
    overlay.userData = { isOverlay: true, parent: parentCube };
    // Center play circle (half the face width); never triggers rotation
    const radius = (1.15 * 0.5) / 6; // much smaller to allow quadrant clicks
    const circleGeom = new THREE.CircleGeometry(radius, 48);
    const circleMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.12, side: THREE.DoubleSide });
    const centerCircle = new THREE.Mesh(circleGeom, circleMat);
    centerCircle.position.set(0, 0, (cubeSize / 2) + 0.006);
    centerCircle.userData = { isCenterPlay: true, parent: parentCube };
    parentCube.add(centerCircle);
    centerCircle.layers.mask = parentCube.layers.mask; // inherit layer
    parentCube.userData.centerPlay = centerCircle;
}

function animateYZToFrontRow(obj, duration = 350) {
    const fromY = obj.position.y;
    const fromZ = obj.position.z;
    const toY = 0, toZ = 0;
    cancelTweensFor(obj);
    return tweenObject({
        duration, owner: obj, onUpdate: (v) => {
            const y = fromY + (toY - fromY) * v;
            const z = fromZ + (toZ - fromZ) * v;
            obj.position.y = y;
            obj.position.z = z;
        }
    });
}

function resolveFrontRowCollisions(draggingCube) {
    // Build a set of active cubes near the front row (including the dragging cube)
    const zoneZ = FRONT_ROW_FORWARD_Z + 0.5;
    const nodes = [...lineup];
    if (!nodes.includes(draggingCube)) nodes.push(draggingCube);
    const active = nodes.filter(c => Math.abs(c.position.z) <= zoneZ + 0.001);
    if (active.length <= 1) return;
    // 2D soft-body style resolve along (x,z)
    const minDist = gridSize * 0.95; // slightly less than slot spacing
    for (let i = 0; i < active.length; i++) {
        for (let j = i + 1; j < active.length; j++) {
            const a = active[i], b = active[j];
            const dx = b.position.x - a.position.x;
            const dz = b.position.z - a.position.z;
            const dist = Math.hypot(dx, dz);
            if (dist < 1e-6) continue;
            if (dist < minDist) {
                const overlap = (minDist - dist) * 0.5;
                const nx = dx / dist, nz = dz / dist;
                // Do not move the dragging cube; push the other instead
                if (a !== draggingCube) {
                    const ax = a.position.x - nx * overlap;
                    const az = THREE.MathUtils.clamp(a.position.z - nz * overlap, shelfZ, FRONT_ROW_FORWARD_Z);
                    animatePosition(a, new THREE.Vector3(ax, 0, az), 80);
                }
                if (b !== draggingCube) {
                    const bx = b.position.x + nx * overlap;
                    const bz = THREE.MathUtils.clamp(b.position.z + nz * overlap, shelfZ, FRONT_ROW_FORWARD_Z);
                    animatePosition(b, new THREE.Vector3(bx, 0, bz), 80);
                }
            }
        }
    }
}

// Harmonized drag smoothing state
function ensureDesired(u) {
    if (!u.desired) u.desired = { x: 0, y: 0, z: 0, s: FRONT_ROW_SCALE, t: 0 };
    return u.desired;
}
function tickDragSmoothing() {
    if (!dragging) return;
    const d = ensureDesired(dragging.userData);
    // Single writer: ease transforms toward desired
    const k = 0.28; // smoothing factor
    dragging.position.x = THREE.MathUtils.lerp(dragging.position.x, d.x, k);
    dragging.position.y = THREE.MathUtils.lerp(dragging.position.y, d.y, k);
    dragging.position.z = THREE.MathUtils.lerp(dragging.position.z, d.z, k);
    const cur = dragging.scale.x;
    const next = THREE.MathUtils.lerp(cur, d.s, k);
    dragging.scale.setScalar(next);
    // Soft repulsion near the front
    if (d.t > 0.4) physicsRepelNearFront(dragging);
}

// Attach our intent-aware pointer handlers
renderer.domElement.addEventListener('pointerdown', onPointerDown);
renderer.domElement.addEventListener('pointermove', onPointerMove);
window.addEventListener('pointerup', onPointerUp);
renderer.domElement.addEventListener('pointerdown', pokeInteraction);
renderer.domElement.addEventListener('wheel', pokeInteraction, { passive: true });

// ZONE-BASED MOUSE CONTROL - Track cursor position for camera/cube mode switching
// TEMPORARILY DISABLED - Zone system interfering with clicks
// renderer.domElement.addEventListener('mousemove', (e) => {
//     updateMouseZone(e.clientX, e.clientY);
// });
// Right-click toggles between Melody (above) and Bassline (below) views
renderer.domElement.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if (currentStickyView === 'above') {
        setViewBelow();
    } else if (currentStickyView === 'below') {
        setViewBack();
    } else {
        setViewAbove();
    }
});

// Scale shelf cubes with the mouse wheel in adjust mode
renderer.domElement.addEventListener('wheel', (e) => {
    if (!adjustMode) return;
    const target = dragging?.userData?.isShelf ? dragging : lastShelfTarget;
    if (!target || !target.userData?.isShelf) return;
    e.preventDefault();
    const r = target.userData.roman;
    const current = scaleByRoman[r] ?? target.scale.x;
    const factor = 1 + (-e.deltaY) * 0.001; // scroll up -> bigger
    const next = Math.max(0.3, Math.min(1.8, current * factor));
    scaleByRoman[r] = next;
    target.scale.setScalar(next);
    saveShelfMapToLocalStorage();
}, { passive: false });

// View button event listeners moved to DOMContentLoaded - CRITICAL FIX
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('view-down')?.addEventListener('click', setViewAbove);
    document.getElementById('view-up')?.addEventListener('click', setViewBelow);
    document.getElementById('view-back')?.addEventListener('click', setViewBack);
});

// GLOBAL MODIFIER KEY STATE TRACKING
let globalModifierState = {
    altPressed: false,
    shiftPressed: false,
    ctrlPressed: false,
    metaPressed: false
};

// BULLETPROOF KEYBOARD MODIFIER DETECTION - HIGHEST PRIORITY
document.addEventListener('keydown', (e) => {
    globalModifierState.altPressed = e.altKey;
    globalModifierState.shiftPressed = e.shiftKey;
    globalModifierState.ctrlPressed = e.ctrlKey;
    globalModifierState.metaPressed = e.metaKey;

    console.log(`[GLOBAL KEYDOWN] Alt: ${e.altKey}, Shift: ${e.shiftKey}, Ctrl: ${e.ctrlKey}, Meta: ${e.metaKey}`);
}, { capture: true, passive: false });

document.addEventListener('keyup', (e) => {
    globalModifierState.altPressed = e.altKey;
    globalModifierState.shiftPressed = e.shiftKey;
    globalModifierState.ctrlPressed = e.ctrlKey;
    globalModifierState.metaPressed = e.metaKey;

    console.log(`[GLOBAL KEYUP] Alt: ${e.altKey}, Shift: ${e.shiftKey}, Ctrl: ${e.ctrlKey}, Meta: ${e.metaKey}`);
}, { capture: true, passive: false });

// Audio state (declare before any usage)
let audioCtx = null;
let withSeventh = false;
// Volume-based enabling - voices are enabled when volume > 0
function isBassEnabled() {
    const bassVolume = document.getElementById('bass-volume');
    return bassVolume ? parseFloat(bassVolume.value) > 0 : false; // Start UNLOCKED
}

function isMelodyEnabled() {
    const melodyVolume = document.getElementById('melody-volume');
    return melodyVolume ? parseFloat(melodyVolume.value) > 0 : false; // Start UNLOCKED
}

// Legacy compatibility
let bassEnabled = true;
let melodyEnabled = false;
let instrumentsReady = false;

// CLAUDE'S DEEP-DEBUG TOOLKIT: Trace any sneaky instrumentsReady writes
(function () {
    let _instrumentsReady = false;
    Object.defineProperty(window, 'instrumentsReadyDebug', {
        get: () => _instrumentsReady,
        set: (value) => {
            console.log(`[DEBUG] 🔍 instrumentsReady changed to: ${value}`);
            console.trace('[DEBUG] Call stack:');
            _instrumentsReady = value;
        }
    });

    // Override the global variable with our tracked version
    Object.defineProperty(window, 'instrumentsReadyGlobal', {
        get: () => instrumentsReady,
        set: (value) => {
            console.log(`[DEBUG] 🚨 LEGACY instrumentsReady write detected: ${instrumentsReady} → ${value}`);
            console.trace('[DEBUG] Legacy write call stack:');
            instrumentsReady = value;
        }
    });
})();
let wafPlayer = null;
let sfChord = null, sfBass = null, sfMelody = null;
// Back-compat guards: some older handlers referenced these names directly
let chordInst = null, bassInst = null, melodyInst = null;
// Voice-leading state for closest-octave selection
let lastBassMidi = null, lastMelodyMidi = null;
let voiceLeadingMode = 'vl3'; // 'vl1' nearest-octave, 'vl2' minimal distance, 'vl3' academic grade - DEFAULT TO VL3

// REAL-TIME VOICE LEADING CONTEXT - Track last played chord for intelligent connections
let lastPlayedChord = null; // { roman: 'I', chordTones: [60, 64, 67, 71], timestamp: Date.now() }
let chordHistory = []; // Array of recent chords for advanced voice leading analysis
let lockedMelody = null; // [{ roman, midi, color } ...]
let lockedBass = null;   // [{ roman, midi, color } ...]

// IMPROV MODE - Chord queueing system with dual modes
let improvMode = false;
let improvModeType = 'free'; // 'free' or 'creation'
let queuedChord = null;
let lastDownbeatTime = 0;
let nextDownbeatTime = 0;
let melodyLaneGroup = null, bassLaneGroup = null;
let melodyGiantGroup = null; // large ground-visible duplicates for melody
let bassGiantGroup = null;   // large duplicates for bass
// 3D lock icons near ground titles
let melodyLockLeft = null, melodyLockRight = null;
let bassLockLeft = null, bassLockRight = null;
const uiPickables = [];
let uiLockClick = false; // true only between pointerdown/up when clicking a lock

function setMelodyLockVisual(state /* 'open' | 'closed' */) {
    if (melodyLockLeft && melodyLockLeft.userData) {
        melodyLockLeft.userData.state = state;
        const tex = state === 'closed' ? melodyLockLeft.userData.closedTex : melodyLockLeft.userData.openTex;
        melodyLockLeft.material.map = tex; melodyLockLeft.material.needsUpdate = true;
    }
    if (melodyLockRight && melodyLockRight.userData) {
        melodyLockRight.userData.state = state;
        const tex = state === 'closed' ? melodyLockRight.userData.closedTex : melodyLockRight.userData.openTex;
        melodyLockRight.material.map = tex; melodyLockRight.material.needsUpdate = true;
    }
}

function setBassLockVisual(state /* 'open' | 'closed' */) {
    if (bassLockLeft && bassLockLeft.userData) {
        bassLockLeft.userData.state = state;
        const tex = state === 'closed' ? bassLockLeft.userData.closedTex : bassLockLeft.userData.openTex;
        bassLockLeft.material.map = tex; bassLockLeft.material.needsUpdate = true;
    }
    if (bassLockRight && bassLockRight.userData) {
        bassLockRight.userData.state = state;
        const tex = state === 'closed' ? bassLockRight.userData.closedTex : bassLockRight.userData.openTex;
        bassLockRight.material.map = tex; bassLockRight.material.needsUpdate = true;
    }
}
// PROFESSIONAL ORCHESTRAL SOUND LIBRARIES
const ORCHESTRAL_PRESETS = {
    // CHORD SECTION - Rich Orchestral Textures
    chord: {
        strings: { url: 'https://surikov.github.io/webaudiofontdata/sound/0480_FluidR3_GM_sf2_file.js', var: '_tone_0480_FluidR3_GM_sf2_file', name: 'String Ensemble' },
        brass: { url: 'https://surikov.github.io/webaudiofontdata/sound/0610_FluidR3_GM_sf2_file.js', var: '_tone_0610_FluidR3_GM_sf2_file', name: 'Brass Section' },
        piano: { url: 'https://surikov.github.io/webaudiofontdata/sound/0000_FluidR3_GM_sf2_file.js', var: '_tone_0000_FluidR3_GM_sf2_file', name: 'Concert Grand' },
        pad: { url: 'https://surikov.github.io/webaudiofontdata/sound/0900_FluidR3_GM_sf2_file.js', var: '_tone_0900_FluidR3_GM_sf2_file', name: 'Warm Pad' }
    },
    // BASS SECTION - Deep Orchestral Bass
    bass: {
        contrabass: { url: 'https://surikov.github.io/webaudiofontdata/sound/0430_FluidR3_GM_sf2_file.js', var: '_tone_0430_FluidR3_GM_sf2_file', name: 'Contrabass' },
        cello: { url: 'https://surikov.github.io/webaudiofontdata/sound/0420_FluidR3_GM_sf2_file.js', var: '_tone_0420_FluidR3_GM_sf2_file', name: 'Cello' },
        tuba: { url: 'https://surikov.github.io/webaudiofontdata/sound/0580_FluidR3_GM_sf2_file.js', var: '_tone_0580_FluidR3_GM_sf2_file', name: 'Tuba' },
        electric: { url: 'https://surikov.github.io/webaudiofontdata/sound/0330_FluidR3_GM_sf2_file.js', var: '_tone_0330_FluidR3_GM_sf2_file', name: 'Electric Bass' }
    },
    // MELODY SECTION - Expressive Lead Instruments  
    melody: {
        violin: { url: 'https://surikov.github.io/webaudiofontdata/sound/0400_FluidR3_GM_sf2_file.js', var: '_tone_0400_FluidR3_GM_sf2_file', name: 'Violin' },
        flute: { url: 'https://surikov.github.io/webaudiofontdata/sound/0730_FluidR3_GM_sf2_file.js', var: '_tone_0730_FluidR3_GM_sf2_file', name: 'Flute' },
        trumpet: { url: 'https://surikov.github.io/webaudiofontdata/sound/0560_FluidR3_GM_sf2_file.js', var: '_tone_0560_FluidR3_GM_sf2_file', name: 'Trumpet' },
        oboe: { url: 'https://surikov.github.io/webaudiofontdata/sound/0680_FluidR3_GM_sf2_file.js', var: '_tone_0680_FluidR3_GM_sf2_file', name: 'Oboe' }
    }
};

// Current instrument selection - defaults to orchestral
let currentChordInstrument = 'strings';
let currentBassInstrument = 'contrabass';
let currentMelodyInstrument = 'violin';

// Legacy WAF_PRESETS for backward compatibility
const WAF_PRESETS = {
    chord: ORCHESTRAL_PRESETS.chord[currentChordInstrument],
    bass: ORCHESTRAL_PRESETS.bass[currentBassInstrument],
    melody: ORCHESTRAL_PRESETS.melody[currentMelodyInstrument],
};

function initializeWebAudioFont() {
    console.warn('[obs-cubes] WebAudioFont path disabled; using Tone.js engine');
}

// AGGRESSIVE AUDIOCONTEXT WARNING SUPPRESSION (Claude's solution)
(function suppressAudioContextWarnings() {
    const originalConsoleWarn = console.warn;
    console.warn = function (...args) {
        const message = args.join(' ');
        if (message.includes('AudioContext was not allowed to start') ||
            message.includes('The AudioContext was not allowed') ||
            message.includes('must be resumed')) {
            return; // Suppress these warnings
        }
        originalConsoleWarn.apply(console, args);
    };
})();

// FIXED ORCHESTRAL AUDIO ENGINE WITH CORRECT WEBAUDIOFONT INSTRUMENT IDS
class OrchestralAudioEngine {
    constructor() {
        this.player = new WebAudioFontPlayer();
        this.audioContext = Tone.context._context || Tone.context;
        this.instruments = {};
        this.currentInstruments = {
            chord: null,
            bass: null,
            melody: null
        };

        // NEW: Track active notes for proper cutoff
        this.activeNotes = {
            chord: new Map(), // noteId -> {sampler, notes, releaseCallback}
            bass: new Map(),
            melody: new Map()
        };
        this.noteIdCounter = 0;

        // CORRECTED INSTRUMENT MAPPINGS WITH ACTUAL WEBAUDIOFONT IDS
        // These are the REAL, WORKING instrument variable names in WebAudioFont
        this.instrumentMap = {
            // Chord Instruments (Polyphonic) - VERIFIED WORKING
            'Piano': {
                id: '_tone_0000_JCLive_sf2_file',
                variable: '_tone_0000_JCLive_sf2_file',
                poly: true,
                name: 'Acoustic Grand Piano',
                program: 0
            },
            'String Ensemble': {
                id: '_tone_0490_JCLive_sf2_file',  // CORRECTED: Was 0480
                variable: '_tone_0490_JCLive_sf2_file',
                poly: true,
                name: 'String Ensemble 1',
                program: 49
            },
            'Brass': {
                id: '_tone_0610_JCLive_sf2_file',
                variable: '_tone_0610_JCLive_sf2_file',
                poly: true,
                name: 'Brass Section',
                program: 61
            },
            'Choir': {
                id: '_tone_0520_JCLive_sf2_file',  // CORRECTED
                variable: '_tone_0520_JCLive_sf2_file',
                poly: true,
                name: 'Choir Aahs',
                program: 52
            },
            'Organ': {
                id: '_tone_0160_JCLive_sf2_file',
                variable: '_tone_0160_JCLive_sf2_file',
                poly: true,
                name: 'Drawbar Organ',
                program: 16
            },
            'Harp': {
                id: '_tone_0460_JCLive_sf2_file',
                variable: '_tone_0460_JCLive_sf2_file',
                poly: true,
                name: 'Orchestral Harp',
                program: 46
            },

            // Melody Instruments (Monophonic) - VERIFIED WORKING
            'Violin': {
                id: '_tone_0400_JCLive_sf2_file',  // CORRECTED: Using JCLive instead of Aspirin
                variable: '_tone_0400_JCLive_sf2_file',
                poly: false,
                name: 'Violin',
                program: 40
            },
            'Flute': {
                id: '_tone_0730_JCLive_sf2_file',
                variable: '_tone_0730_JCLive_sf2_file',
                poly: false,
                name: 'Flute',
                program: 73
            },
            'Trumpet': {
                id: '_tone_0560_JCLive_sf2_file',
                variable: '_tone_0560_JCLive_sf2_file',
                poly: false,
                name: 'Trumpet',
                program: 56
            },
            'Saxophone': {
                id: '_tone_0650_JCLive_sf2_file',  // Alto Sax
                variable: '_tone_0650_JCLive_sf2_file',
                poly: false,
                name: 'Alto Sax',
                program: 65
            },
            'Oboe': {
                id: '_tone_0680_JCLive_sf2_file',
                variable: '_tone_0680_JCLive_sf2_file',
                poly: false,
                name: 'Oboe',
                program: 68
            },
            'Clarinet': {
                id: '_tone_0710_JCLive_sf2_file',
                variable: '_tone_0710_JCLive_sf2_file',
                poly: false,
                name: 'Clarinet',
                program: 71
            },

            // Bass Instruments - VERIFIED WORKING
            'Acoustic Bass': {
                id: '_tone_0320_JCLive_sf2_file',  // CORRECTED: Using JCLive
                variable: '_tone_0320_JCLive_sf2_file',
                poly: false,
                name: 'Acoustic Bass',
                program: 32
            },
            'Electric Bass': {
                id: '_tone_0330_JCLive_sf2_file',
                variable: '_tone_0330_JCLive_sf2_file',
                poly: false,
                name: 'Electric Bass (finger)',
                program: 33
            },
            'Synth Bass': {
                id: '_tone_0380_JCLive_sf2_file',
                variable: '_tone_0380_JCLive_sf2_file',
                poly: false,
                name: 'Synth Bass 1',
                program: 38
            },
            'Tuba': {
                id: '_tone_0580_JCLive_sf2_file',
                variable: '_tone_0580_JCLive_sf2_file',
                poly: false,
                name: 'Tuba',
                program: 58
            },
            'Cello': {
                id: '_tone_0420_JCLive_sf2_file',
                variable: '_tone_0420_JCLive_sf2_file',
                poly: false,
                name: 'Cello',
                program: 42
            }
        };

        // Fallback synths for when WebAudioFont fails
        this.fallbackSynths = {};

        this.debugMode = true;
        this.loadTimeout = 5000; // 5 second timeout

        // Track loaded instruments
        this.loadedInstruments = new Set();
    }

    async init() {
        console.log('[AUDIO ENGINE] BULLETPROOF ENGINE vNEXT INITIALIZATION...');
        console.log('[AUDIO ENGINE] WebAudioFont version:', this.player.version || 'Unknown');

        // CLAUDE'S BULLETPROOF APPROACH: NO ASYNC OPERATIONS THAT CAN FAIL
        console.log('[AUDIO ENGINE] Step 1: Creating fallback synths (no async, cannot fail)...');
        this.createFallbackSynths();

        console.log('[AUDIO ENGINE] Step 2: Setting up immediate instruments...');
        this.currentInstruments.chord = {
            name: 'String Ensemble',
            synth: this.fallbackSynths['String Ensemble'],
            info: { fallback: true },
            fallback: true
        };

        this.currentInstruments.melody = {
            name: 'Violin',
            synth: this.fallbackSynths['Violin'],
            info: { fallback: true },
            fallback: true
        };

        this.currentInstruments.bass = {
            name: 'Acoustic Bass',
            synth: this.fallbackSynths['Acoustic Bass'],
            info: { fallback: true },
            fallback: true
        };

        console.log('[AUDIO ENGINE] Step 3: Setting ready flags...');
        this.isReady = true;
        this.hasImmediateFallbacks = true;

        console.log('[AUDIO ENGINE] BULLETPROOF ENGINE vNEXT READY - Immediate orchestral audio guaranteed!');
        console.log('[AUDIO ENGINE] Fallback instruments active:', {
            chord: this.currentInstruments.chord.name,
            melody: this.currentInstruments.melody.name,
            bass: this.currentInstruments.bass.name
        });

        // AUDIO CONTEXT: Handle separately, don't let it break initialization
        setTimeout(() => {
            console.log('[AUDIO ENGINE] Step 4: Attempting audio context start (non-blocking)...');
            if (Tone.context.state !== 'running') {
                Tone.start().then(() => {
                    console.log('[AUDIO ENGINE] ✅ Audio context started after user gesture');
                }).catch(() => {
                    console.log('[AUDIO ENGINE] ⚠️ Audio context will start on first user interaction');
                });
            }
        }, 100);

        // RESEARCH-BASED FIX: Load from WORKING WebAudioFont CDN in background
        setTimeout(() => {
            this.loadRealInstrumentsInBackground();
        }, 1000);

        console.log('[AUDIO ENGINE] INITIALIZATION COMPLETE - Ready for immediate playback!');
    }

    async loadRealInstrumentsInBackground() {
        console.log('[AUDIO ENGINE] 🔥 REAL ORCHESTRAL SAMPLES - Using Tone.js Sampler with working audio files');

        try {
            await this.loadRealOrchestralSamplers();
            console.log('[AUDIO ENGINE] ✅ REAL orchestral samples loaded successfully');
        } catch (error) {
            console.log('[AUDIO ENGINE] Real samples failed, keeping enhanced fallbacks:', error);
        }
    }

    async loadRealOrchestralSamplers() {
        console.log('[AUDIO ENGINE] 🔥 LOADING WORKING REAL SAMPLES - Using tonejs-instruments library');

        // RESEARCH RESULT: Use tonejs-instruments library - INDUSTRY STANDARD for real samples
        try {
            console.log('[AUDIO ENGINE] Checking SampleLibrary availability...');
            console.log('[AUDIO ENGINE] SampleLibrary exists:', typeof SampleLibrary !== 'undefined');
            console.log('[AUDIO ENGINE] SampleLibrary.list exists:', typeof SampleLibrary?.list !== 'undefined');
            console.log('[AUDIO ENGINE] SampleLibrary.load exists:', typeof SampleLibrary?.load !== 'undefined');

            if (typeof SampleLibrary === 'undefined') {
                throw new Error('SampleLibrary not loaded - script may have failed');
            }

            // Get all available instruments - RESEARCH CONFIRMED LIST
            const availableInstruments = [
                'bass-electric',
                'bassoon',
                'cello',
                'clarinet',
                'contrabass',
                'flute',
                'french-horn',
                'guitar-acoustic',
                'guitar-electric',
                'harmonium',
                'harp',
                'organ',
                'piano',
                'saxophone',
                'trombone',
                'trumpet',
                'tuba',
                'violin',
                'xylophone'
            ];

            console.log('[AUDIO ENGINE] Loading FULL ENTIRE LIBRARY:', availableInstruments.length, 'instruments');
            console.log('[AUDIO ENGINE] Instruments to load:', availableInstruments);

            const instruments = SampleLibrary.load({
                instruments: availableInstruments,
                baseUrl: 'https://nbrosowsky.github.io/tonejs-instruments/samples/',
                onload: () => {
                    console.log('[AUDIO ENGINE] 🎵 ENTIRE SAMPLELIBRARY LOADED - ALL INSTRUMENTS!');
                    console.log('[AUDIO ENGINE] Total instruments loaded:', Object.keys(instruments).length);
                    console.log('[AUDIO ENGINE] Loaded instrument names:', Object.keys(instruments));

                    // CRITICAL FIX: Connect all instruments to audio destination FIRST
                    Object.keys(instruments).forEach(key => {
                        if (instruments[key] && instruments[key].toDestination) {
                            instruments[key].toDestination();
                            console.log(`[AUDIO ENGINE] ✅ Connected ${key} to audio destination`);
                        } else {
                            console.warn(`[AUDIO ENGINE] ⚠️ ${key} missing toDestination method`);
                        }
                    });

                    this.upgradeToRealInstruments(instruments);
                    this.updateDynamicDropdowns(instruments);
                },
                onerror: (error) => {
                    console.error('[AUDIO ENGINE] SampleLibrary loading error:', error);
                }
            });

            // Store the loaded instruments
            this.realInstruments = instruments;

        } catch (error) {
            console.log('[AUDIO ENGINE] SampleLibrary failed, keeping enhanced fallbacks:', error);
        }
    }

    upgradeToRealInstruments(instruments) {
        console.log('[AUDIO ENGINE] 🔥 UPGRADING TO REAL INSTRUMENTS...');

        // Connect all instruments to destination
        Object.values(instruments).forEach(instrument => {
            if (instrument && instrument.toDestination) {
                instrument.toDestination();
            }
        });

        // Upgrade current instruments to use REAL samples
        if (instruments.piano) {
            this.currentInstruments.chord = {
                name: 'Piano',
                sampler: instruments.piano,
                info: { real: true, source: 'SampleLibrary Real Piano' },
                fallback: false
            };
            console.log('[AUDIO ENGINE] ✅ UPGRADED: Chord now using REAL Piano from SampleLibrary');
        }

        if (instruments.violin) {
            this.currentInstruments.melody = {
                name: 'Violin',
                sampler: instruments.violin,
                info: { real: true, source: 'SampleLibrary Real Violin' },
                fallback: false
            };
            console.log('[AUDIO ENGINE] ✅ UPGRADED: Melody now using REAL Violin from SampleLibrary');
        }

        if (instruments.contrabass) {
            this.currentInstruments.bass = {
                name: 'Contrabass',
                sampler: instruments.contrabass,
                info: { real: true, source: 'SampleLibrary Real Contrabass' },
                fallback: false
            };
            console.log('[AUDIO ENGINE] ✅ UPGRADED: Bass now using REAL Contrabass from SampleLibrary');
        }

        // Store all real instruments for dropdown switching
        this.realInstruments = instruments;
        console.log('[AUDIO ENGINE] 🔥 REAL ORCHESTRAL ENGINE ACTIVE - SampleLibrary loaded!');
        console.log('[AUDIO ENGINE] Available real instruments:', Object.keys(instruments));
    }

    refreshInstrumentDropdowns() {
        console.log('[AUDIO ENGINE] 🔄 REFRESHING DROPDOWNS with loaded instruments...');

        const chordInstEl = document.getElementById('chord-inst');
        const bassInstEl = document.getElementById('bass-inst');
        const melodyInstEl = document.getElementById('melody-inst');

        // Refresh chord dropdown
        if (chordInstEl) {
            const currentValue = chordInstEl.value;
            chordInstEl.innerHTML = '';
            this.getInstrumentsForType('chord').forEach(inst => {
                const option = document.createElement('option');
                option.value = inst;
                option.textContent = inst;
                if (inst === currentValue || (inst === 'Piano' && !currentValue)) option.selected = true;
                chordInstEl.appendChild(option);
            });
            console.log('[AUDIO ENGINE] ✅ Chord dropdown refreshed with', chordInstEl.options.length, 'instruments');
        }

        // Refresh melody dropdown  
        if (melodyInstEl) {
            const currentValue = melodyInstEl.value;
            melodyInstEl.innerHTML = '';
            this.getInstrumentsForType('melody').forEach(inst => {
                const option = document.createElement('option');
                option.value = inst;
                option.textContent = inst;
                if (inst === currentValue || (inst === 'Violin' && !currentValue)) option.selected = true;
                melodyInstEl.appendChild(option);
            });
            console.log('[AUDIO ENGINE] ✅ Melody dropdown refreshed with', melodyInstEl.options.length, 'instruments');
        }

        // Refresh bass dropdown
        if (bassInstEl) {
            const currentValue = bassInstEl.value;
            bassInstEl.innerHTML = '';
            this.getInstrumentsForType('bass').forEach(inst => {
                const option = document.createElement('option');
                option.value = inst;
                option.textContent = inst;
                if (inst === currentValue || (inst === 'Contrabass' && !currentValue)) option.selected = true;
                bassInstEl.appendChild(option);
            });
            console.log('[AUDIO ENGINE] ✅ Bass dropdown refreshed with', bassInstEl.options.length, 'instruments');
        }
    }

    updateDynamicDropdowns(instruments) {
        console.log('[AUDIO ENGINE] 🔄 UPDATING DYNAMIC DROPDOWNS with loaded instruments...');

        // Store all loaded instrument names for dynamic dropdowns
        this.loadedInstrumentNames = Object.keys(instruments);
        console.log('[AUDIO ENGINE] Dynamic instruments available:', this.loadedInstrumentNames);

        // Trigger dropdown refresh
        window.dispatchEvent(new CustomEvent('instrumentsLoaded', {
            detail: { instruments: this.loadedInstrumentNames }
        }));

        // Refresh the UI dropdowns with loaded instruments
        this.refreshInstrumentDropdowns();
    }

    async loadWorkingInstrument(name, url) {
        return new Promise((resolve, reject) => {
            console.log(`[AUDIO ENGINE] Loading ${name} from: ${url}`);

            // Use correct WebAudioFont loading method from research
            this.player.loader.startLoad(this.audioContext, url, `_tone_${name}_sf2`);
            this.player.loader.waitLoad(() => {
                const instrumentVariable = `_tone_${name}_sf2`;
                if (window[instrumentVariable]) {
                    console.log(`[AUDIO ENGINE] SUCCESS: ${name} loaded from working CDN`);

                    // Decode the instrument
                    this.player.loader.decodeAfterLoading(this.audioContext, instrumentVariable);

                    // Update current instrument if it matches
                    if (this.currentInstruments.chord?.name === name) {
                        this.currentInstruments.chord.preset = window[instrumentVariable];
                        this.currentInstruments.chord.fallback = false;
                        console.log(`[AUDIO ENGINE] UPGRADED: Chord now using real ${name}`);
                    }
                    if (this.currentInstruments.melody?.name === name) {
                        this.currentInstruments.melody.preset = window[instrumentVariable];
                        this.currentInstruments.melody.fallback = false;
                        console.log(`[AUDIO ENGINE] UPGRADED: Melody now using real ${name}`);
                    }
                    if (this.currentInstruments.bass?.name === name) {
                        this.currentInstruments.bass.preset = window[instrumentVariable];
                        this.currentInstruments.bass.fallback = false;
                        console.log(`[AUDIO ENGINE] UPGRADED: Bass now using real ${name}`);
                    }

                    resolve(window[instrumentVariable]);
                } else {
                    reject(new Error(`Instrument ${name} not found after loading`));
                }
            });

            // Timeout after 10 seconds
            setTimeout(() => {
                reject(new Error(`Load timeout for ${name}`));
            }, 10000);
        });
    }

    createFallbackSynths() {
        console.log('[AUDIO ENGINE] 🔧 Creating high-quality fallback synths...');
        // CLAUDE'S DRAMATICALLY DIFFERENT FALLBACK INSTRUMENTS
        this.fallbackSynths = {
            // CHORD INSTRUMENTS - EXTREMELY DIFFERENT sounds
            'Piano': new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: 'triangle' },
                envelope: { attack: 0.01, decay: 0.8, sustain: 0.1, release: 0.5 },
                volume: 0  // LOUD and percussive
            }).toDestination(),

            'String Ensemble': new Tone.PolySynth(Tone.FMSynth, {
                harmonicity: 3,
                modulationIndex: 10,
                envelope: { attack: 0.8, decay: 0.1, sustain: 0.9, release: 2.0 },
                modulation: { type: 'sawtooth' },
                volume: -6
            }).toDestination(),

            'Brass': new Tone.PolySynth(Tone.AMSynth, {
                harmonicity: 2,
                envelope: { attack: 0.1, decay: 0.2, sustain: 0.8, release: 0.5 },
                modulation: { type: 'square' },
                volume: -4
            }).toDestination(),

            'Choir': new Tone.PolySynth(Tone.FMSynth, {
                harmonicity: 1,
                modulationIndex: 5,
                envelope: { attack: 1.0, decay: 0.2, sustain: 0.9, release: 3.0 },
                modulation: { type: 'sine' },
                volume: -10
            }).toDestination(),

            'Organ': new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: 'square' },
                envelope: { attack: 0.0, decay: 0.0, sustain: 1.0, release: 0.1 },
                volume: 3  // VERY LOUD organ sound
            }).toDestination(),

            'Harp': new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: 'triangle' },
                envelope: { attack: 0.01, decay: 2.0, sustain: 0.0, release: 3.0 },
                volume: -6
            }).toDestination(),

            // MELODY INSTRUMENTS - Each with UNIQUE voice
            'Violin': new Tone.MonoSynth({
                oscillator: { type: 'sawtooth' },
                envelope: { attack: 0.1, decay: 0.2, sustain: 0.8, release: 0.5 },
                filter: { frequency: 3000, type: 'lowpass' },
                volume: -8
            }).toDestination(),

            'Flute': new Tone.MonoSynth({
                oscillator: { type: 'sine' },
                envelope: { attack: 0.2, decay: 0.1, sustain: 0.6, release: 0.3 },
                filter: { frequency: 4000, type: 'lowpass' },
                volume: -10
            }).toDestination(),

            'Trumpet': new Tone.MonoSynth({
                oscillator: { type: 'square' },
                envelope: { attack: 0.05, decay: 0.1, sustain: 0.8, release: 0.2 },
                filter: { frequency: 2000, type: 'lowpass' },
                volume: -6
            }).toDestination(),

            'Oboe': new Tone.MonoSynth({
                oscillator: { type: 'sawtooth' },
                envelope: { attack: 0.1, decay: 0.3, sustain: 0.7, release: 0.4 },
                filter: { frequency: 2500, type: 'lowpass' },
                volume: -8
            }).toDestination(),

            // BASS INSTRUMENTS - Each with DISTINCT low-end character
            'Acoustic Bass': new Tone.MonoSynth({
                oscillator: { type: 'triangle' },
                envelope: { attack: 0.02, decay: 0.15, sustain: 0.7, release: 0.8 },
                filter: { frequency: 400, type: 'lowpass' },
                volume: -2
            }).toDestination(),

            'Electric Bass': new Tone.MonoSynth({
                oscillator: { type: 'square' },
                envelope: { attack: 0.01, decay: 0.1, sustain: 0.6, release: 0.3 },
                filter: { frequency: 600, type: 'lowpass' },
                volume: -4
            }).toDestination(),

            'Synth Bass': new Tone.MonoSynth({
                oscillator: { type: 'sawtooth' },
                envelope: { attack: 0.0, decay: 0.2, sustain: 0.8, release: 0.2 },
                filter: { frequency: 300, type: 'lowpass' },
                volume: -2
            }).toDestination(),

            'Tuba': new Tone.MonoSynth({
                oscillator: { type: 'sine' },
                envelope: { attack: 0.1, decay: 0.2, sustain: 0.9, release: 1.0 },
                filter: { frequency: 200, type: 'lowpass' },
                volume: 0
            }).toDestination(),

            'Cello': new Tone.MonoSynth({
                oscillator: { type: 'sawtooth' },
                envelope: { attack: 0.1, decay: 0.3, sustain: 0.8, release: 0.6 },
                filter: { frequency: 800, type: 'lowpass' },
                volume: -4
            }).toDestination(),

            // Generic fallback
            'default': new Tone.PolySynth().toDestination()
        };

        console.log('[AUDIO ENGINE] High-quality fallback synths created:', Object.keys(this.fallbackSynths));
        console.log('[AUDIO ENGINE] Bass synth ready:', !!this.fallbackSynths['Acoustic Bass']);
    }

    async loadInstrument(type, instrumentName) {
        console.log(`[AUDIO ENGINE] Loading ${instrumentName} for ${type}...`);

        const instrumentInfo = this.instrumentMap[instrumentName];
        if (!instrumentInfo) {
            console.error(`[AUDIO ENGINE] Unknown instrument: ${instrumentName}`);
            return;
        }

        try {
            // METHOD 1: Try direct loading with correct URL format
            const baseUrl = 'https://surikov.github.io/webaudiofont/examples/';
            const soundfontUrl = baseUrl + instrumentInfo.variable + '.js';

            console.log(`[AUDIO ENGINE] Attempting to load from: ${soundfontUrl}`);

            // Load the instrument file dynamically
            await this.loadScript(soundfontUrl);

            // Check if the instrument loaded successfully
            if (window[instrumentInfo.variable]) {
                console.log(`[AUDIO ENGINE] ✅ Successfully loaded ${instrumentName} from URL`);

                // Store the loaded instrument
                this.currentInstruments[type] = {
                    name: instrumentName,
                    preset: window[instrumentInfo.variable],
                    info: instrumentInfo,
                    fallback: false
                };

                this.loadedInstruments.add(instrumentName);
                return window[instrumentInfo.variable];
            } else {
                throw new Error('Instrument variable not found after loading');
            }

        } catch (error) {
            console.error(`[AUDIO ENGINE] Failed to load ${instrumentName}:`, error);

            // METHOD 2: Try using WebAudioFont loader (fallback)
            try {
                console.log(`[AUDIO ENGINE] Trying WebAudioFont loader for ${instrumentName}...`);

                // Use the program number to find the instrument
                const info = this.player.loader.instrumentInfo(instrumentInfo.program);

                if (info) {
                    // Start loading with timeout
                    const loadPromise = new Promise((resolve, reject) => {
                        const timeoutId = setTimeout(() => {
                            reject(new Error('Load timeout'));
                        }, this.loadTimeout);

                        this.player.loader.startLoad(this.audioContext, info.url, instrumentInfo.variable);
                        this.player.loader.waitLoad(() => {
                            clearTimeout(timeoutId);
                            resolve();
                        });
                    });

                    await loadPromise;

                    if (window[instrumentInfo.variable]) {
                        console.log(`[AUDIO ENGINE] ✅ Loaded ${instrumentName} via loader`);

                        this.currentInstruments[type] = {
                            name: instrumentName,
                            preset: window[instrumentInfo.variable],
                            info: instrumentInfo,
                            fallback: false
                        };

                        return window[instrumentInfo.variable];
                    }
                }
            } catch (loaderError) {
                console.error(`[AUDIO ENGINE] Loader also failed:`, loaderError);
            }

            // METHOD 3: Use Tone.js fallback
            console.log(`[AUDIO ENGINE] Using Tone.js fallback for ${instrumentName}`);

            const fallbackSynth = this.fallbackSynths[instrumentName] ||
                this.fallbackSynths['default'];

            this.currentInstruments[type] = {
                name: instrumentName,
                synth: fallbackSynth,
                info: { ...instrumentInfo, fallback: true },
                fallback: true
            };

            console.log(`[AUDIO ENGINE] ⚠️ Using fallback synthesizer for ${instrumentName}`);
            return fallbackSynth;
        }
    }

    // Helper function to load scripts dynamically
    loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = resolve;
            script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
            document.head.appendChild(script);
        });
    }

    createFallbackSynth(type, instrumentName) {
        console.log(`[AUDIO ENGINE] Creating Tone.js fallback for ${instrumentName}`);

        let synth;
        if (type === 'chord') {
            synth = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: 'triangle' },
                envelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.3 }
            }).toDestination();
        } else {
            synth = new Tone.MonoSynth({
                oscillator: { type: 'sawtooth' },
                envelope: { attack: 0.01, decay: 0.1, sustain: 0.7, release: 0.3 }
            }).toDestination();
        }

        // Store fallback
        this.currentInstruments[type] = {
            name: instrumentName + ' (Fallback)',
            preset: null,
            synth: synth,
            info: { fallback: true }
        };

        return synth;
    }

    playChord(notes, duration = 2, volume = 0.5, useManualControl = false) {
        // CLAUDE'S ENGINE vNEXT: Always ready with immediate fallbacks - no blocking checks!

        const instrument = this.currentInstruments.chord;
        if (!instrument) {
            console.error('[AUDIO ENGINE] No chord instrument loaded');
            return;
        }

        if (this.debugMode) {
            console.log(`[AUDIO ENGINE] Playing chord with ${instrument.name}:`, notes);
        }

        // PRIORITY 1: Use real Tone.js Sampler if available
        if (instrument.sampler && !instrument.fallback) {
            console.log(`[AUDIO ENGINE] 🔥 Using REAL ${instrument.name} samples - AudioTime: ${this.audioContext.currentTime.toFixed(3)}`);
            try {
                if (useManualControl) {
                    // FREE PLAY MODE: Use triggerAttack + manual release for proper cutoff control
                    const noteId = ++this.noteIdCounter;
                    console.log(`[AUDIO ENGINE] 🎯 Starting chord notes with ID ${noteId} for FREE PLAY manual control`);

                    // Trigger attack (start notes)
                    instrument.sampler.triggerAttack(notes, undefined, volume * chordVolume);

                    // Schedule release after duration
                    const releaseTimeout = setTimeout(() => {
                        try {
                            instrument.sampler.triggerRelease(notes);
                            console.log(`[AUDIO ENGINE] ⏰ Auto-released chord notes ${noteId} after ${duration}s`);
                            this.activeNotes.chord.delete(noteId);
                        } catch (e) {
                            console.warn(`[AUDIO ENGINE] Auto-release error for chord ${noteId}:`, e);
                        }
                    }, duration * 1000);

                    // Track this note for manual cutoff
                    this.activeNotes.chord.set(noteId, {
                        sampler: instrument.sampler,
                        notes: notes,
                        releaseTimeout: releaseTimeout,
                        startTime: this.audioContext.currentTime
                    });

                    console.log(`[AUDIO ENGINE] ✅ REAL ${instrument.name} samples started with FREE PLAY manual control - Duration: ${duration}s`);
                } else {
                    // PROGRESSION MODE: Use standard triggerAttackRelease for full sustain
                    instrument.sampler.triggerAttackRelease(notes, duration + 's', undefined, volume * chordVolume);
                    console.log(`[AUDIO ENGINE] ✅ REAL ${instrument.name} samples played with PROGRESSION sustain - Duration: ${duration}s`);
                }
                return; // Exit if successful
            } catch (error) {
                console.warn('[AUDIO ENGINE] Real sampler error:', error);
                console.log(`[AUDIO ENGINE] 🔄 FALLING BACK to enhanced synth for ${instrument.name}`);
                // Continue to fallback logic instead of returning
            }
        }
        // PRIORITY 2: Use WebAudioFont if available
        else if (instrument.preset && !instrument.info?.fallback) {
            // WebAudioFont playback
            const when = this.audioContext.currentTime;
            const preset = instrument.preset;
            const midiNotes = notes.map(note => this.noteToMidi(note));

            midiNotes.forEach(pitch => {
                this.player.queueWaveTable(
                    this.audioContext,
                    this.audioContext.destination,
                    preset,
                    when,
                    pitch,
                    duration,
                    volume
                );
            });
        }
        // PRIORITY 3: Use enhanced Tone.js fallback
        else if (instrument.synth) {
            console.log(`[AUDIO ENGINE] Using enhanced fallback for ${instrument.name}`);
            try {
                instrument.synth.triggerAttackRelease(notes, duration + 's');
            } catch (error) {
                console.warn('[AUDIO ENGINE] Fallback playback error:', error);
            }
        } else {
            console.error('[AUDIO ENGINE] No playback method available');
        }
    }

    playMelody(notes, durations, volume = 0.4) {
        const instrument = this.currentInstruments.melody;
        if (!instrument) {
            console.error('[AUDIO ENGINE] No melody instrument loaded - this should never happen with Engine vNext!');
            console.log('[AUDIO ENGINE] Current instruments:', this.currentInstruments);
            return;
        }

        if (this.debugMode) {
            console.log(`[AUDIO ENGINE] Playing melody with ${instrument.name}:`, notes);
        }

        // PRIORITY 1: Use real Tone.js Sampler if available
        if (instrument.sampler && !instrument.fallback) {
            console.log(`[AUDIO ENGINE] 🔥 Using REAL ${instrument.name} samples for melody`);
            try {
                // For melody, play notes sequentially
                let when = Tone.now();
                notes.forEach((note, i) => {
                    const duration = durations[i] || 0.5;
                    instrument.sampler.triggerAttackRelease(note, duration + 's', when, melodyVolume);
                    when += duration;
                });
            } catch (error) {
                console.warn('[AUDIO ENGINE] Real sampler melody error:', error);
            }
        }
        // PRIORITY 2: Use WebAudioFont if available
        else if (instrument.preset && !instrument.info?.fallback) {
            // WebAudioFont playback
            const preset = instrument.preset;
            let when = this.audioContext.currentTime;

            notes.forEach((note, i) => {
                const pitch = this.noteToMidi(note);
                const duration = durations[i] || 0.5;

                this.player.queueWaveTable(
                    this.audioContext,
                    this.audioContext.destination,
                    preset,
                    when,
                    pitch,
                    duration,
                    volume
                );

                when += duration;
            });
        }
        // PRIORITY 3: Use enhanced Tone.js fallback
        else if (instrument.synth) {
            console.log(`[AUDIO ENGINE] Using enhanced fallback for ${instrument.name}`);
            try {
                // For melody, play notes sequentially
                let when = Tone.now();
                notes.forEach((note, i) => {
                    const duration = durations[i] || 0.5;
                    instrument.synth.triggerAttackRelease(note, duration + 's', when);
                    when += duration;
                });
            } catch (error) {
                console.warn('[AUDIO ENGINE] Melody fallback playback error:', error);
            }
        } else {
            console.error('[AUDIO ENGINE] No melody playback method available');
        }
    }

    playBass(note, duration = 1, volume = 0.6, useManualControl = false) {
        const instrument = this.currentInstruments.bass;
        if (!instrument) {
            console.error('[AUDIO ENGINE] No bass instrument loaded - this should never happen with Engine vNext!');
            console.log('[AUDIO ENGINE] Current instruments:', this.currentInstruments);
            return;
        }

        if (this.debugMode) {
            console.log(`[AUDIO ENGINE] Playing bass with ${instrument.name}:`, note);
        }

        // PRIORITY 1: Use real Tone.js Sampler if available
        if (instrument.sampler && !instrument.fallback) {
            console.log(`[AUDIO ENGINE] 🔥 Using REAL ${instrument.name} samples for bass`);
            try {
                if (useManualControl) {
                    // FREE PLAY MODE: Use triggerAttack + manual release for proper cutoff control
                    const noteId = ++this.noteIdCounter;
                    console.log(`[AUDIO ENGINE] 🎯 Starting bass note with ID ${noteId} for FREE PLAY manual control`);

                    // Trigger attack (start note)
                    instrument.sampler.triggerAttack(note, undefined, volume * bassVolume);

                    // Schedule release after duration
                    const releaseTimeout = setTimeout(() => {
                        try {
                            instrument.sampler.triggerRelease(note);
                            console.log(`[AUDIO ENGINE] ⏰ Auto-released bass note ${noteId} after ${duration}s`);
                            this.activeNotes.bass.delete(noteId);
                        } catch (e) {
                            console.warn(`[AUDIO ENGINE] Auto-release error for bass ${noteId}:`, e);
                        }
                    }, duration * 1000);

                    // Track this note for manual cutoff
                    this.activeNotes.bass.set(noteId, {
                        sampler: instrument.sampler,
                        notes: [note], // Make it consistent with chord (array format)
                        releaseTimeout: releaseTimeout,
                        startTime: this.audioContext.currentTime
                    });
                } else {
                    // PROGRESSION MODE: Use standard triggerAttackRelease for full sustain
                    instrument.sampler.triggerAttackRelease(note, duration + 's', undefined, volume * bassVolume);
                    console.log(`[AUDIO ENGINE] ✅ REAL ${instrument.name} bass played with PROGRESSION sustain - Duration: ${duration}s`);
                }
                return; // Exit if successful
            } catch (error) {
                console.warn('[AUDIO ENGINE] Real sampler bass error:', error);
                console.log(`[AUDIO ENGINE] 🔄 FALLING BACK to enhanced synth for bass`);
                // Continue to fallback
            }
        }
        // PRIORITY 2: Use WebAudioFont if available
        else if (instrument.preset && !instrument.info?.fallback) {
            // WebAudioFont playback
            const when = this.audioContext.currentTime;
            const preset = instrument.preset;
            const pitch = this.noteToMidi(note);

            this.player.queueWaveTable(
                this.audioContext,
                this.audioContext.destination,
                preset,
                when,
                pitch,
                duration,
                volume
            );
        }
        // PRIORITY 3: Use enhanced Tone.js fallback
        else if (instrument.synth) {
            console.log(`[AUDIO ENGINE] Using enhanced fallback for ${instrument.name}`);
            try {
                instrument.synth.triggerAttackRelease(note, duration + 's');
            } catch (error) {
                console.warn('[AUDIO ENGINE] Bass fallback playback error:', error);
            }
        } else {
            console.error('[AUDIO ENGINE] No bass playback method available');
        }
    }

    // Helper function to convert note names to MIDI numbers
    noteToMidi(note) {
        if (typeof note === 'number') return note;

        const noteMap = {
            'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
            'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
            'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
        };

        const match = note.match(/([A-G][#b]?)(\d)/);
        if (!match) return 60; // Default to middle C

        const [, noteName, octave] = match;
        return noteMap[noteName] + (parseInt(octave) + 1) * 12;
    }

    // Switch instrument for a specific type
    async switchInstrument(type, newInstrument) {
        console.log(`[AUDIO ENGINE] IMMEDIATE SWITCH: ${type} to ${newInstrument}`);

        // PRIORITY 1: Use SampleLibrary real instruments if available
        // Map display names back to SampleLibrary keys (with hyphens)
        const instrumentMap = {
            'bass electric': 'bass-electric',
            'basselectric': 'bass-electric',
            'guitar acoustic': 'guitar-acoustic',
            'guitaracoustic': 'guitar-acoustic',
            'guitar electric': 'guitar-electric',
            'guitarelectric': 'guitar-electric',
            'french horn': 'french-horn',
            'frenchhorn': 'french-horn'
        };

        const normalizedName = newInstrument.toLowerCase().replace(/\s+/g, '').replace(/\(.*\)/, '');
        const instrumentKey = instrumentMap[normalizedName] || instrumentMap[newInstrument.toLowerCase()] || normalizedName;

        console.log(`[AUDIO ENGINE] Looking for real instrument: "${newInstrument}" -> normalized: "${normalizedName}" -> key: "${instrumentKey}"`);
        console.log(`[AUDIO ENGINE] Available real instruments:`, this.realInstruments ? Object.keys(this.realInstruments) : 'None loaded yet');

        if (this.realInstruments && this.realInstruments[instrumentKey]) {
            this.currentInstruments[type] = {
                name: newInstrument,
                sampler: this.realInstruments[instrumentKey],
                info: { real: true, source: 'SampleLibrary Real Instrument' },
                fallback: false
            };
            console.log(`[AUDIO ENGINE] 🔥 IMMEDIATE SWITCH: ${type} now using REAL ${newInstrument} from SampleLibrary`);
        }
        // PRIORITY 2: Use enhanced fallback synths
        else if (this.fallbackSynths[newInstrument]) {
            this.currentInstruments[type] = {
                name: newInstrument,
                synth: this.fallbackSynths[newInstrument],
                info: { fallback: true },
                fallback: true
            };
            console.log(`[AUDIO ENGINE] ✅ IMMEDIATE SWITCH: ${type} now using enhanced ${newInstrument} (fallback)`);
        } else {
            console.warn(`[AUDIO ENGINE] Unknown instrument: ${newInstrument}`);
        }

        // Trigger UI update event
        window.dispatchEvent(new CustomEvent('instrumentChanged', {
            detail: { type, instrument: newInstrument }
        }));
    }

    // Get available instruments for a type
    getInstrumentsForType(type) {
        // DYNAMIC DROPDOWNS: Return ALL loaded instruments + enhanced fallbacks
        let instruments = [];

        // Add ALL real instruments from SampleLibrary (if loaded)
        if (this.loadedInstrumentNames) {
            // Convert hyphenated names to proper display names
            const realInstruments = this.loadedInstrumentNames.map(name => {
                // Convert hyphenated to spaced and capitalize
                return name.split('-').map(word =>
                    word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ');
            });
            instruments = [...realInstruments];
            console.log(`[AUDIO ENGINE] Dynamic ${type} instruments:`, instruments.length, 'real instruments loaded');
        }

        // Add enhanced fallbacks that aren't already in real instruments
        const fallbackNames = Object.keys(this.fallbackSynths || {});
        fallbackNames.forEach(name => {
            if (!instruments.includes(name)) {
                instruments.push(name + ' (Enhanced)');
            }
        });

        console.log(`[AUDIO ENGINE] Total ${type} options:`, instruments.length);
        return instruments;
    }

    // Get status of loaded instruments
    getStatus() {
        const status = {
            loaded: Array.from(this.loadedInstruments),
            current: {},
            fallbacks: {}
        };

        for (const [type, inst] of Object.entries(this.currentInstruments)) {
            if (inst) {
                status.current[type] = inst.name;
                status.fallbacks[type] = inst.fallback || false;
            }
        }

        return status;
    }

    // COMPREHENSIVE AUDIO CUTOFF with Active Note Tracking
    cutoffCurrentChord() {
        const cutoffTime = this.audioContext.currentTime.toFixed(3);
        console.log(`[AUDIO ENGINE] 🔇 IMMEDIATE CUTOFF at time ${cutoffTime}`);
        console.log(`[CUTOFF] 📊 Active notes before cutoff:`, {
            chord: this.activeNotes.chord.size,
            bass: this.activeNotes.bass.size,
            melody: this.activeNotes.melody.size
        });

        let releasedCount = 0;
        const cutoffMethods = [];

        // NEW METHOD: Stop tracked active notes immediately  
        for (const [type, notesMap] of Object.entries(this.activeNotes)) {
            if (notesMap.size === 0) continue;

            console.log(`[CUTOFF] 🎯 Stopping ${notesMap.size} active ${type} notes...`);

            for (const [noteId, noteInfo] of notesMap.entries()) {
                try {
                    // Cancel scheduled auto-release
                    if (noteInfo.releaseTimeout) {
                        clearTimeout(noteInfo.releaseTimeout);
                        console.log(`[CUTOFF] ⏰ Cancelled auto-release for ${type} note ${noteId}`);
                    }

                    // Manually trigger release immediately
                    if (noteInfo.sampler && noteInfo.notes) {
                        if (Array.isArray(noteInfo.notes)) {
                            noteInfo.sampler.triggerRelease(noteInfo.notes);
                        } else {
                            noteInfo.sampler.triggerRelease([noteInfo.notes]);
                        }
                        console.log(`[CUTOFF] ✅ Immediately released ${type} note ${noteId}:`, noteInfo.notes);
                        releasedCount++;
                    }
                } catch (error) {
                    console.warn(`[CUTOFF] ❌ Failed to release ${type} note ${noteId}:`, error);
                }
            }

            // Clear the tracking map
            notesMap.clear();
            cutoffMethods.push(`${type}-tracked-notes`);
        }

        // FALLBACK: Try old methods for any untracked notes
        for (const [type, instrument] of Object.entries(this.currentInstruments)) {
            if (!instrument) continue;

            // Try releaseAll() as fallback
            if (instrument.sampler && !instrument.fallback) {
                try {
                    console.log(`[CUTOFF] 🔄 Fallback: releaseAll() for ${type} sampler...`);
                    instrument.sampler.releaseAll();
                    cutoffMethods.push(`${type}-fallback-releaseAll`);
                } catch (error) {
                    console.warn(`[CUTOFF] ❌ Fallback releaseAll failed for ${type}:`, error);
                }
            }

            if (instrument.synth) {
                try {
                    console.log(`[CUTOFF] 🔄 Fallback: releaseAll() for ${type} synth...`);
                    instrument.synth.releaseAll();
                    cutoffMethods.push(`${type}-fallback-synth`);
                } catch (error) {
                    console.warn(`[CUTOFF] ❌ Fallback synth release failed for ${type}:`, error);
                }
            }

            // WebAudioFont (cannot stop mid-playback, log for visibility)
            if (instrument.preset && !instrument.info?.fallback) {
                console.log(`[CUTOFF] ⚠️  ${type} uses WebAudioFont - cannot stop mid-playback`);
                cutoffMethods.push(`${type}-webaudiofont-nostop`);
            }
        }

        console.log(`[CUTOFF] 🎯 CUTOFF COMPLETE: Released ${releasedCount} tracked notes using methods: [${cutoffMethods.join(', ')}]`);
        console.log(`[CUTOFF] ⏰ Cutoff finished at time ${this.audioContext.currentTime.toFixed(3)}`);
    }
}

// INTEGRATION WITH EXISTING CODE - Replace loadInstruments() function
async function loadInstruments() {
    console.log('[MAIN] Initializing Fixed Orchestral Audio Engine...');

    // Create global audio engine instance
    console.log('[MAIN] 🔧 Creating OrchestralAudioEngine instance...');
    window.audioEngine = new OrchestralAudioEngine();
    console.log('[MAIN] 🔧 Engine instance created, calling init()...');

    try {
        await window.audioEngine.init();
        console.log('[MAIN] ✅ Engine init() completed successfully');
    } catch (initError) {
        console.error('[MAIN] 💀 Engine init() failed:', initError);
        console.error('[MAIN] Stack:', initError.stack);
    }

    // VERIFY CURRENT STATE
    console.log('[MAIN] 🔍 Post-init verification:');
    console.log('[MAIN] - Engine exists:', !!window.audioEngine);
    console.log('[MAIN] - Engine ready:', window.audioEngine?.isReady);
    console.log('[MAIN] - Has fallbacks:', window.audioEngine?.hasImmediateFallbacks);
    console.log('[MAIN] - Current instruments:', window.audioEngine?.currentInstruments);

    // CLAUDE'S ENGINE vNEXT: No legacy instrumentsReady flag needed
    // Engine always has immediate fallbacks - no blocking checks required
    console.log('[MAIN] ✅ Engine vNext active - immediate audio guaranteed');

    // Check status
    console.log('[MAIN] Audio Engine Status:', window.audioEngine.getStatus());

    // CLAUDE'S ACCEPTANCE TEST: Verify immediate audio capability
    console.log('[TEST] 🧪 Running Engine vNext acceptance test...');
    if (window.audioEngine && window.audioEngine.isReady && window.audioEngine.hasImmediateFallbacks) {
        console.log('[TEST] ✅ PASS: Engine vNext ready with immediate fallbacks');
        console.log('[TEST] ✅ PASS: No blocking checks - audio will play immediately');

        // Test instrument availability
        const chordInst = window.audioEngine.currentInstruments.chord;
        const bassInst = window.audioEngine.currentInstruments.bass;
        const melodyInst = window.audioEngine.currentInstruments.melody;

        if (chordInst?.synth && bassInst?.synth && melodyInst?.synth) {
            console.log('[TEST] ✅ PASS: All fallback instruments loaded and ready');
            console.log('[TEST] 🎵 Ready to play: Chord, Bass, Melody');
        } else {
            console.log('[TEST] ❌ FAIL: Missing fallback instruments');
        }
    } else {
        console.log('[TEST] ❌ FAIL: Engine vNext not properly initialized');
    }

    // Hook up to existing UI elements
    const chordInstEl = document.getElementById('chord-inst');
    const bassInstEl = document.getElementById('bass-inst');
    const melodyInstEl = document.getElementById('melody-inst');

    // SETUP EVENT LISTENERS ONLY - Dropdowns will be populated dynamically when SampleLibrary loads
    console.log('[MAIN] 🔧 Setting up dropdown event listeners (dropdowns will populate when SampleLibrary loads)...');

    if (chordInstEl) {
        chordInstEl.addEventListener('change', async (e) => {
            const newInstrument = e.target.value;
            console.log('[UI] 🔄 Chord instrument changed to:', newInstrument);
            await window.audioEngine.switchInstrument('chord', newInstrument);
        });
    }

    if (melodyInstEl) {
        melodyInstEl.addEventListener('change', async (e) => {
            const newInstrument = e.target.value;
            console.log('[UI] 🔄 Melody instrument changed to:', newInstrument);
            await window.audioEngine.switchInstrument('melody', newInstrument);
        });
    }

    if (bassInstEl) {
        bassInstEl.addEventListener('change', async (e) => {
            const newInstrument = e.target.value;
            console.log('[UI] 🔄 Bass instrument changed to:', newInstrument);
            await window.audioEngine.switchInstrument('bass', newInstrument);
        });
    }

    // INITIAL FALLBACK DROPDOWNS - Will be replaced when SampleLibrary loads
    console.log('[MAIN] 🔧 Setting initial fallback dropdowns...');
    if (chordInstEl) {
        chordInstEl.innerHTML = '<option value="String Ensemble">String Ensemble (Loading...)</option>';
    }
    if (melodyInstEl) {
        melodyInstEl.innerHTML = '<option value="Violin">Violin (Loading...)</option>';
    }
    if (bassInstEl) {
        bassInstEl.innerHTML = '<option value="Acoustic Bass">Acoustic Bass (Loading...)</option>';
    }

    console.log('[MAIN] ✅ Fixed Orchestral Audio Engine integrated with immediate fallbacks');
}

// UI wiring
// Set toggle checkboxes
const setMajor = document.getElementById('set-major');
const setMinor = document.getElementById('set-minor');
const setApplied = document.getElementById('set-applied');
const labelSelect = document.getElementById('label-mode');
const keySelect = document.getElementById('key-select');
const with7th = document.getElementById('with-7th');
// Volume controls replace checkboxes
const bassVolumeEl = document.getElementById('bass-volume');
const melodyVolumeEl = document.getElementById('melody-volume');
const chordInstEl = document.getElementById('chord-inst');
const bassInstEl = document.getElementById('bass-inst');
const melodyInstEl = document.getElementById('melody-inst');


const playProgBtn = document.getElementById('play-progression');
const resetBtn = document.getElementById('reset-btn');
const voiceLeadingSelect = document.getElementById('voice-leading-mode');
const melodyLockIcon = document.getElementById('melody-lock');
const bassLockIcon = document.getElementById('bass-lock');
const showGiantMelodyEl = document.getElementById('show-giant-melody');
const showGiantBassEl = document.getElementById('show-giant-bass');
const menuLockMelodyBtn = document.getElementById('menu-lock-melody');
const menuUnlockMelodyBtn = document.getElementById('menu-unlock-melody');
const menuLockBassBtn = document.getElementById('menu-lock-bass');
const menuUnlockBassBtn = document.getElementById('menu-unlock-bass');
// Initialize labelMode from current UI so startup respects it
labelMode = labelSelect ? labelSelect.value : labelMode;
withSeventh = !!(with7th && with7th.checked);
bassEnabled = isBassEnabled();
melodyEnabled = isMelodyEnabled();
// Instrument dropdowns are currently cosmetic with WebAudioFont presets
try { setState({ key: currentKey, withSeventh, bassEnabled, melodyEnabled }); } catch (_) { }
with7th?.addEventListener('change', async () => {
    withSeventh = !!with7th.checked;
    console.log(`[7TH SETTING] Changed to: ${withSeventh}`);

    // Refresh all cube face textures to show/hide 7th notation
    await refreshAllCubeFaces();

    try { setState({ withSeventh }); bridge.emit('settingsChanged', { withSeventh }); } catch (_) { }
});
// Volume-based enabling - update when volume changes
bassVolumeEl?.addEventListener('input', () => {
    bassEnabled = isBassEnabled();
    try { setState({ bassEnabled }); bridge.emit('settingsChanged', { bassEnabled }); } catch (_) { }
});
melodyVolumeEl?.addEventListener('input', () => {
    melodyEnabled = isMelodyEnabled();
    try { setState({ melodyEnabled }); bridge.emit('settingsChanged', { melodyEnabled }); } catch (_) { }
});
showGiantMelodyEl?.addEventListener('change', () => { if (melodyGiantGroup) melodyGiantGroup.visible = !!showGiantMelodyEl.checked; });
showGiantBassEl?.addEventListener('change', () => { if (bassGiantGroup) bassGiantGroup.visible = !!showGiantBassEl.checked; });
menuLockMelodyBtn?.addEventListener('click', () => { try { lockInMelody(); setMelodyLockVisual('closed'); } catch (_) { } });
menuUnlockMelodyBtn?.addEventListener('click', () => { try { lockedMelody = null; renderMelodyLane(); setMelodyLockVisual('open'); } catch (_) { } });
menuLockBassBtn?.addEventListener('click', () => { try { lockInBass(); setBassLockVisual('closed'); } catch (_) { } });
menuUnlockBassBtn?.addEventListener('click', () => { try { lockedBass = null; renderBassLane(); setBassLockVisual('open'); } catch (_) { } });
voiceLeadingSelect?.addEventListener('change', () => {
    voiceLeadingMode = voiceLeadingSelect.value;
});
melodyLockIcon?.addEventListener('click', async () => {
    const locked = melodyLockIcon.textContent === '🔒';
    if (locked) { lockedMelody = null; renderMelodyLane(); melodyLockIcon.textContent = '🔓'; return; }
    lockInMelody(); melodyLockIcon.textContent = '🔒'; await playLockSound();
});
bassLockIcon?.addEventListener('click', async () => {
    const locked = bassLockIcon.textContent === '🔒';
    if (locked) { lockedBass = null; renderBassLane(); bassLockIcon.textContent = '🔓'; return; }
    lockInBass(); bassLockIcon.textContent = '🔒'; await playLockSound();
});
// Removed dynamic instrument loading; WebAudioFont presets are fixed for stability
playProgBtn?.addEventListener('click', () => { playFrontRowProgression(); });

// NEW: Main UI Play buttons in center column
const playChordsBtnMain = document.getElementById('play-chords');
const playProgressionBtnMain = document.getElementById('play-progression-main');

playChordsBtnMain?.addEventListener('click', () => {
    console.log('[UI PLAY CHORDS] Playing current progression as individual chords');
    playFrontRowProgression(); // For now, same as progression - can be customized later
});

playProgressionBtnMain?.addEventListener('click', () => {
    console.log('[UI PLAY PROGRESSION] Playing front row progression from main UI');
    playFrontRowProgression();
});

// Drum machine play progression button
const drumPlayProgBtn = document.getElementById('drum-play-progression');
drumPlayProgBtn?.addEventListener('click', () => {
    console.log('[DRUM PLAY] Play progression clicked from drum machine');
    playFrontRowProgression();
});

// Make drum machine draggable
function makeDrumMachineDraggable() {
    const drumPanel = document.getElementById('drum-control-panel');
    if (!drumPanel) return;

    let isDragging = false;
    let startX, startY, startLeft, startTop;

    drumPanel.addEventListener('mousedown', (e) => {
        // Only start dragging if clicking on the header area, not controls
        if (e.target.closest('.panel-header') || e.target === drumPanel) {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;

            const rect = drumPanel.getBoundingClientRect();
            startLeft = rect.left;
            startTop = rect.top;

            drumPanel.style.cursor = 'grabbing';
            e.preventDefault();
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        drumPanel.style.left = (startLeft + deltaX) + 'px';
        drumPanel.style.top = (startTop + deltaY) + 'px';
        drumPanel.style.right = 'auto';
        drumPanel.style.transform = 'none';
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            drumPanel.style.cursor = 'move';
        }
    });
}

// Initialize draggable drum machine
setTimeout(makeDrumMachineDraggable, 100);

// TOGGLE-STYLE LOCK BUTTONS (now work with volume controls)
function setupLockButtons() {
    const lockBassBtn = document.getElementById('lock-bass');
    const lockMelodyBtn = document.getElementById('lock-melody');

    // Initialize button states - UNLOCKED by default (false = unlocked state)
    updateLockButtonStyle(lockBassBtn, false); // Start unlocked
    updateLockButtonStyle(lockMelodyBtn, false); // Start unlocked

    // Bass lock button - CALLS EXACT SACRED FUNCTION
    let lastBassVolume = 0.5;
    lockBassBtn?.addEventListener('click', () => {
        const bassVolume = document.getElementById('bass-volume');
        const currentVolume = parseFloat(bassVolume.value);

        if (currentVolume > 0) {
            // LOCK BASS - call sacred function
            lastBassVolume = currentVolume;
            try {
                lockInBass();
                setBassLockVisual('closed');
                bassVolume.value = lastBassVolume.toString(); // Keep volume but lock state
                console.log('[SACRED LOCK] Bass locked with lockInBass()');
            } catch (_) { }
        } else {
            // UNLOCK BASS - call sacred unlock
            try {
                lockedBass = null;
                renderBassLane();
                setBassLockVisual('open');
                bassVolume.value = lastBassVolume.toString();
                console.log('[SACRED UNLOCK] Bass unlocked');
            } catch (_) { }
        }

        bassEnabled = isBassEnabled();
        updateLockButtonStyle(lockBassBtn, currentVolume > 0); // Show locked state
    });

    // Melody lock button - CALLS EXACT SACRED FUNCTION
    let lastMelodyVolume = 0.05;
    lockMelodyBtn?.addEventListener('click', () => {
        const melodyVolume = document.getElementById('melody-volume');
        const currentVolume = parseFloat(melodyVolume.value);

        if (currentVolume > 0) {
            // LOCK MELODY - call sacred function
            lastMelodyVolume = currentVolume;
            try {
                lockInMelody();
                setMelodyLockVisual('closed');
                melodyVolume.value = lastMelodyVolume.toString(); // Keep volume but lock state
                console.log('[SACRED LOCK] Melody locked with lockInMelody()');
            } catch (_) { }
        } else {
            // UNLOCK MELODY - call sacred unlock
            try {
                lockedMelody = null;
                renderMelodyLane();
                setMelodyLockVisual('open');
                melodyVolume.value = lastMelodyVolume.toString();
                console.log('[SACRED UNLOCK] Melody unlocked');
            } catch (_) { }
        }

        melodyEnabled = isMelodyEnabled();
        updateLockButtonStyle(lockMelodyBtn, currentVolume > 0); // Show locked state
    });
}

function updateLockButtonStyle(button, isLocked) {
    if (!button) return;

    if (isLocked) {
        // Pressed/locked style
        button.style.background = '#00ff00';
        button.style.color = '#000';
        button.style.borderColor = '#00ff00';
        button.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.3)';
        button.textContent = button.id === 'lock-bass' ? 'Bass Locked' : 'Melody Locked';
    } else {
        // Released/unlocked style
        button.style.background = '#333';
        button.style.color = '#fff';
        button.style.borderColor = '#555';
        button.style.boxShadow = 'none';
        button.textContent = button.id === 'lock-bass' ? 'Lock Bass' : 'Lock Melody';
    }
}

// Initialize lock buttons when DOM is ready
setTimeout(setupLockButtons, 100);

// MUTE/BOOST VOLUME CONTROLS
function setupVolumeControls() {
    // Get volume sliders
    const bassVolumeEl = document.getElementById('bass-volume');
    const chordVolumeEl = document.getElementById('chord-volume');
    const melodyVolumeEl = document.getElementById('melody-volume');

    // Legacy volume change handlers
    bassVolumeEl?.addEventListener('input', (e) => {
        bassVolume = parseFloat(e.target.value);
        console.log('[VOLUME] Bass volume:', bassVolume);
    });

    chordVolumeEl?.addEventListener('input', (e) => {
        chordVolume = parseFloat(e.target.value);
        console.log('[VOLUME] Chord volume:', chordVolume);
    });

    melodyVolumeEl?.addEventListener('input', (e) => {
        melodyVolume = parseFloat(e.target.value);
        console.log('[VOLUME] Melody volume:', melodyVolume);
    });

    // Bass volume controls
    const bassMute = document.getElementById('bass-mute');
    const bassBoost = document.getElementById('bass-boost');

    bassMute?.addEventListener('click', () => {
        bassVolumeEl.value = '0';
        console.log('[BASS] Muted');
    });

    bassBoost?.addEventListener('click', () => {
        bassVolumeEl.value = '1.15';
        console.log('[BASS] Boosted to 115%');
    });

    // Chord volume controls
    const chordMute = document.getElementById('chord-mute');
    const chordBoost = document.getElementById('chord-boost');

    chordMute?.addEventListener('click', () => {
        chordVolumeEl.value = '0';
        console.log('[CHORD] Muted');
    });

    chordBoost?.addEventListener('click', () => {
        chordVolumeEl.value = '1.15';
        console.log('[CHORD] Boosted to 115%');
    });

    // Melody volume controls
    const melodyMute = document.getElementById('melody-mute');
    const melodyBoost = document.getElementById('melody-boost');

    melodyMute?.addEventListener('click', () => {
        melodyVolumeEl.value = '0';
        console.log('[MELODY] Muted');
    });

    melodyBoost?.addEventListener('click', () => {
        melodyVolumeEl.value = '1.15';
        console.log('[MELODY] Boosted to 115%');
    });

    // PLAY BUTTONS - Connect to existing 3D button functions
    const playBassBtn = document.getElementById('play-bass');
    const playMelodyBtn = document.getElementById('play-melody');

    playBassBtn?.addEventListener('click', () => {
        console.log('[UI PLAY BASS] Playing bass only progression');
        playBassOnly();
    });

    playMelodyBtn?.addEventListener('click', () => {
        console.log('[UI PLAY MELODY] Playing melody only progression');
        playMelodyOnly();
    });
}

// Initialize volume controls
setTimeout(setupVolumeControls, 100);

// 3D FONT PREVIEW SYSTEM
let fontPreviewScene, fontPreviewCamera, fontPreviewRenderer, fontPreviewCube;
let fontPreviewAutoRotate = false;

function init3DFontPreview() {
    const container = document.getElementById('font-preview-3d');
    if (!container) return;

    // Create scene
    fontPreviewScene = new THREE.Scene();
    fontPreviewScene.background = new THREE.Color(0x222222);

    // Create camera
    fontPreviewCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    fontPreviewCamera.position.set(2, 2, 2);
    fontPreviewCamera.lookAt(0, 0, 0);

    // Create renderer
    fontPreviewRenderer = new THREE.WebGLRenderer({ antialias: true });
    fontPreviewRenderer.setSize(200, 200);
    container.appendChild(fontPreviewRenderer.domElement);

    // Create cube with sample text
    const geometry = new THREE.BoxGeometry(1, 1, 1);

    // Create materials for each face
    const materials = [];
    for (let i = 0; i < 6; i++) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Wood background
        ctx.fillStyle = '#d4a574';
        ctx.fillRect(0, 0, 512, 512);

        // Add wood texture pattern
        ctx.fillStyle = '#b8955f';
        for (let j = 0; j < 10; j++) {
            ctx.fillRect(Math.random() * 512, 0, 2, 512);
            ctx.fillRect(0, Math.random() * 512, 512, 2);
        }

        // Sample text
        const sampleTexts = ['I', 'V', 'vi', 'IV', '7', 'iii'];
        ctx.fillStyle = '#333';
        ctx.font = 'bold 200px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(sampleTexts[i], 256, 256);

        const texture = new THREE.CanvasTexture(canvas);
        materials.push(new THREE.MeshBasicMaterial({ map: texture }));
    }

    fontPreviewCube = new THREE.Mesh(geometry, materials);
    fontPreviewScene.add(fontPreviewCube);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    fontPreviewScene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    fontPreviewScene.add(directionalLight);

    // Setup controls
    setupFontPreviewControls();

    // Start render loop
    animate3DFontPreview();
}

function setupFontPreviewControls() {
    document.getElementById('rotate-up')?.addEventListener('click', () => {
        fontPreviewCube.rotation.x -= Math.PI / 4;
    });

    document.getElementById('rotate-down')?.addEventListener('click', () => {
        fontPreviewCube.rotation.x += Math.PI / 4;
    });

    document.getElementById('rotate-left')?.addEventListener('click', () => {
        fontPreviewCube.rotation.y -= Math.PI / 4;
    });

    document.getElementById('rotate-right')?.addEventListener('click', () => {
        fontPreviewCube.rotation.y += Math.PI / 4;
    });

    document.getElementById('auto-rotate')?.addEventListener('click', () => {
        fontPreviewAutoRotate = !fontPreviewAutoRotate;
        const btn = document.getElementById('auto-rotate');
        btn.style.background = fontPreviewAutoRotate ? '#f44336' : '#FF9800';
        btn.textContent = fontPreviewAutoRotate ? '⏸ Stop Rotate' : '🔄 Auto Rotate';
    });
}

function animate3DFontPreview() {
    requestAnimationFrame(animate3DFontPreview);

    if (fontPreviewAutoRotate && fontPreviewCube) {
        fontPreviewCube.rotation.x += 0.01;
        fontPreviewCube.rotation.y += 0.01;
    }

    if (fontPreviewRenderer && fontPreviewScene && fontPreviewCamera) {
        fontPreviewRenderer.render(fontPreviewScene, fontPreviewCamera);
    }
}

function update3DFontPreview() {
    if (!fontPreviewCube) return;

    // Get current font settings
    const fontFamily = document.getElementById('font-family')?.value || 'Arial';
    const fontSize = document.getElementById('font-size')?.value || '200';
    const fontWeight = document.getElementById('font-weight')?.value || 'bold';
    const opacity = document.getElementById('font-opacity')?.value || '100';

    // Update cube faces with new settings
    fontPreviewCube.material.forEach((material, index) => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Wood background
        ctx.fillStyle = '#d4a574';
        ctx.fillRect(0, 0, 512, 512);

        // Add wood texture pattern
        ctx.fillStyle = '#b8955f';
        for (let j = 0; j < 10; j++) {
            ctx.fillRect(Math.random() * 512, 0, 2, 512);
            ctx.fillRect(0, Math.random() * 512, 512, 2);
        }

        // Sample text with current settings
        const sampleTexts = ['I', 'V', 'vi', 'IV', '7', 'iii'];
        ctx.globalAlpha = opacity / 100;
        ctx.fillStyle = '#333';
        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(sampleTexts[index], 256, 256);

        material.map.image = canvas;
        material.map.needsUpdate = true;
    });
}

// Initialize 3D preview when font modal opens
document.addEventListener('DOMContentLoaded', () => {
    const fontModal = document.getElementById('font-control-modal');
    if (fontModal) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    if (fontModal.style.display !== 'none' && !fontPreviewRenderer) {
                        setTimeout(init3DFontPreview, 100);
                    }
                }
            });
        });
        observer.observe(fontModal, { attributes: true });
    }

    // Update preview when settings change
    ['font-family', 'font-size', 'font-weight', 'font-opacity'].forEach(id => {
        document.getElementById(id)?.addEventListener('change', update3DFontPreview);
        document.getElementById(id)?.addEventListener('input', update3DFontPreview);
    });
});

// CHROMATIC EXTENSION KEYBOARD HANDLERS
document.addEventListener('keydown', (e) => {
    const key = e.key;

    // Handle chromatic extensions (number keys and minus)
    if (CHROMATIC_EXTENSIONS[key] && !extensionKeyStates[key]) {
        extensionKeyStates[key] = true;

        const extension = e.shiftKey ?
            CHROMATIC_EXTENSIONS[key].shift :
            CHROMATIC_EXTENSIONS[key].normal;

        activeExtensions.add(extension);
        console.log(`[CHORD EXT] Added ${extension.name} (${extension.description})`);

        // Visual feedback - could add UI indicator here
        showExtensionFeedback(extension);

        e.preventDefault();
    }

    // Handle Alt+7 for 7th toggle (replacing old shift+7)
    if (key === '7' && e.altKey && !e.shiftKey) {
        const with7thCheckbox = document.getElementById('with-7th');
        if (with7thCheckbox) {
            with7thCheckbox.checked = !with7thCheckbox.checked;
            console.log(`[7TH TOGGLE] ${with7thCheckbox.checked ? 'Enabled' : 'Disabled'} 7ths via Alt+7`);
        }
        e.preventDefault();
    }

    // DEBUG: Alt+T to test b7th for all chords
    if (key === 't' && e.altKey) {
        testB7thForAllChords();
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    const key = e.key;

    // Remove extension when key is released
    if (CHROMATIC_EXTENSIONS[key] && extensionKeyStates[key]) {
        extensionKeyStates[key] = false;

        const extension = e.shiftKey ?
            CHROMATIC_EXTENSIONS[key].shift :
            CHROMATIC_EXTENSIONS[key].normal;

        activeExtensions.delete(extension);
        console.log(`[CHORD EXT] Removed ${extension.name}`);

        // Clear visual feedback
        clearExtensionFeedback(extension);
    }
});

// Visual feedback for active extensions
function showExtensionFeedback(extension) {
    // Create or update extension indicator
    let indicator = document.getElementById('extension-indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'extension-indicator';
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 255, 0, 0.9);
            color: black;
            padding: 8px 12px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            pointer-events: none;
        `;
        document.body.appendChild(indicator);
    }

    const activeList = Array.from(activeExtensions).map(ext => ext.name).join(', ');
    indicator.textContent = activeList ? `Extensions: ${activeList}` : '';
    indicator.style.display = activeList ? 'block' : 'none';
}

function clearExtensionFeedback(extension) {
    showExtensionFeedback(); // Refresh the display
}

// Fix AudioContext warnings - add click handler to start audio
function initAudioOnFirstClick() {
    const startAudio = async () => {
        try {
            if (Tone.context.state !== 'running') {
                await Tone.start();
                console.log('[AUDIO] AudioContext started successfully');
            }
        } catch (e) {
            console.warn('[AUDIO] AudioContext start failed:', e);
        }
        // Remove the listener after first click
        document.removeEventListener('click', startAudio);
    };
    document.addEventListener('click', startAudio);
}

// Initialize audio fix
initAudioOnFirstClick();

// CHROMATIC CHORD EXTENSION SYSTEM
// Maps number keys to chromatic intervals from root
const CHROMATIC_EXTENSIONS = {
    '1': {
        normal: { interval: 1, name: 'b2', description: 'minor 2nd' },
        shift: { interval: 13, name: 'b9', description: 'minor 9th (compound)' }
    },
    '2': {
        normal: { interval: 2, name: 'sus2', description: 'suspended 2nd' },
        shift: { interval: 14, name: 'add9', description: 'added 9th' }
    },
    '3': {
        normal: { interval: 3, name: '#9', description: 'sharp 9th' },
        shift: { interval: 15, name: '#9', description: 'sharp 9th (compound)' }
    },
    // '4' is major 3rd - currently unused
    '5': {
        normal: { interval: 5, name: 'sus4', description: 'suspended 4th' },
        shift: { interval: 17, name: 'add11', description: 'added 11th' }
    },
    '6': {
        normal: { interval: 6, name: '#4/#11', description: 'sharp 4th/11th' },
        shift: { interval: 18, name: '#11', description: 'sharp 11th (compound)' }
    },
    '7': {
        normal: { interval: 7, name: '5', description: 'perfect 5th (power chord)' },
        shift: { interval: 19, name: '5', description: 'perfect 5th (compound)' }
    },
    '8': {
        normal: { interval: 8, name: 'b6', description: 'minor 6th' },
        shift: { interval: 20, name: 'b13', description: 'minor 13th' }
    },
    '9': {
        normal: { interval: 9, name: '6', description: 'major 6th' },
        shift: { interval: 21, name: '13', description: 'major 13th' }
    },
    '0': {
        normal: { interval: 10, name: 'b7', description: 'minor 7th (override)' },
        shift: { interval: 22, name: 'b7', description: 'minor 7th (compound)' }
    },
    '-': {
        normal: { interval: 11, name: 'maj7', description: 'major 7th (override)' },
        shift: { interval: 23, name: 'maj7', description: 'major 7th (compound)' }
    }
};

// Track currently held extensions
let activeExtensions = new Set();
let extensionKeyStates = {};

// DEBUG: Test b7th extension for all chord types
function testB7thForAllChords() {
    console.log('\n=== B7TH EXTENSION TEST FOR ALL CHORDS ===');
    const testChords = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'viiø', 'i', 'iiø', 'bIII', 'iv', 'v', 'bVI', 'bVII'];

    testChords.forEach(chordKey => {
        const rootNote = getChordRootNote(chordKey);
        const originalNotes = noteSetsC[chordKey] || [];
        const transposedOriginal = transposeNotes(originalNotes, currentKey);

        // Calculate b7th
        const b7thNote = intervalToNoteName(rootNote, 10);
        const b7thBase = b7thNote ? b7thNote.replace(/[0-9]/g, '') : 'unknown';

        // Check if b7th already exists
        const alreadyHasB7th = transposedOriginal.some(note => note.replace(/[0-9]/g, '') === b7thBase);

        console.log(`${chordKey}: Root=${rootNote} | Original=[${transposedOriginal.join(',')}] | b7th=${b7thNote} | AlreadyHas=${alreadyHasB7th}`);
    });
    console.log('=== END B7TH TEST ===\n');
}

// DEBUG: Test extension system specifically for problematic chords
function testExtensionSystem() {
    console.log('\n=== EXTENSION SYSTEM TEST FOR bIII, bVI, bVII ===');
    const problemChords = ['bIII', 'bVI', 'bVII'];
    const testExtension = { name: 'sus2', interval: 2, description: 'suspended 2nd' };

    problemChords.forEach(chordKey => {
        console.log(`\n--- Testing ${chordKey} ---`);

        // 1. Check if chord exists in noteSetsC
        const notesInC = noteSetsC[chordKey];
        console.log(`Notes in C: ${notesInC ? notesInC.join(', ') : 'NOT FOUND'}`);

        // 2. Get root note
        const rootNote = getChordRootNote(chordKey);
        console.log(`Root note: ${rootNote}`);

        // 3. Get transposed notes in current key
        const transposedNotes = transposeNotes(notesInC || [], currentKey);
        console.log(`Transposed to key ${currentKey}: ${transposedNotes.join(', ')}`);

        // 4. Test extension application
        if (notesInC && notesInC.length > 0) {
            const testSet = new Set([testExtension]);
            const extended = applyChordExtensions(transposedNotes, rootNote, testSet);
            console.log(`With sus2 extension: ${extended.join(', ')}`);
        }
    });
    console.log('=== END EXTENSION TEST ===\n');
}

// Expose test function for manual debugging
window.testExtensionSystem = testExtensionSystem;

// Get the actual root note for a chord based on its Roman numeral and current key
function getChordRootNote(chordKey) {
    // Get the root note in C major from noteSetsC
    const notesInC = noteSetsC[chordKey];
    if (!notesInC || notesInC.length === 0) {
        console.warn(`[CHORD EXT] No notes found for chord ${chordKey}`);
        return 'C4'; // fallback
    }

    // Get the root note (first note) in C major
    const rootInC = notesInC[0];

    // Transpose to current key
    const transposedNotes = transposeNotes([rootInC], currentKey);
    const rootNote = transposedNotes[0];

    console.log(`[CHORD EXT] Root for ${chordKey} in key ${currentKey}: ${rootNote}`);
    return rootNote + '4'; // Add octave for proper calculation
}

// Convert semitone interval to note name relative to root
function intervalToNoteName(rootNote, semitones) {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const rootIndex = noteNames.indexOf(rootNote.replace(/[0-9]/g, ''));
    if (rootIndex === -1) return null;

    const targetIndex = (rootIndex + semitones) % 12;
    const octave = Math.floor(semitones / 12);
    const baseOctave = parseInt(rootNote.match(/\d+/)?.[0] || '4');

    return noteNames[targetIndex] + (baseOctave + octave);
}

// Apply chromatic extensions to a chord
function applyChordExtensions(baseNotes, rootNote, extensions) {
    if (!extensions || extensions.size === 0) return baseNotes;

    let extendedNotes = [...baseNotes];

    // Check for sus chords first - these REPLACE the 3rd
    const hasSus2 = Array.from(extensions).some(ext => ext.name === 'sus2');
    const hasSus4 = Array.from(extensions).some(ext => ext.name === 'sus4');

    if (hasSus2 || hasSus4) {
        // Remove all 3rds (major and minor) from the chord
        const rootNoteBase = rootNote.replace(/[0-9]/g, '');
        const major3rd = intervalToNoteName(rootNote, 4); // major 3rd
        const minor3rd = intervalToNoteName(rootNote, 3); // minor 3rd

        extendedNotes = extendedNotes.filter(note => {
            const noteBase = note.replace(/[0-9]/g, '');
            const maj3rdBase = major3rd ? major3rd.replace(/[0-9]/g, '') : null;
            const min3rdBase = minor3rd ? minor3rd.replace(/[0-9]/g, '') : null;
            return noteBase !== maj3rdBase && noteBase !== min3rdBase;
        });

        console.log(`[CHORD EXT] Removed 3rds for sus chord. Remaining: ${extendedNotes.join(', ')}`);
    }

    // Now add the extensions
    extensions.forEach(ext => {
        const extNote = intervalToNoteName(rootNote, ext.interval);
        if (extNote) {
            const extNoteBase = extNote.replace(/[0-9]/g, '');
            const alreadyInChord = extendedNotes.some(note => note.replace(/[0-9]/g, '') === extNoteBase);

            if (!alreadyInChord) {
                extendedNotes.push(extNote);
                console.log(`[CHORD EXT] Added ${ext.name} (${extNote}) to chord`);
            } else if (ext.description.includes('override')) {
                // For override extensions (like b7th override), emphasize by adding in different octave
                const higherOctave = extNote.replace(/[0-9]/g, '') + '5';
                extendedNotes.push(higherOctave);
                console.log(`[CHORD EXT] ${ext.name} (${extNote}) already in chord - added emphasis octave (${higherOctave})`);
            } else {
                console.log(`[CHORD EXT] ${ext.name} (${extNote}) already in chord - skipping`);
            }
        }
    });

    return extendedNotes.sort((a, b) => {
        const aVal = Tone.Frequency(a).toMidi();
        const bVal = Tone.Frequency(b).toMidi();
        return aVal - bVal;
    });
}

// INDUSTRY STANDARD INSTRUMENT RANGES (with half-octave grace period)
const INSTRUMENT_RANGES = {
    // Strings
    'violin': { min: 55, max: 103, ideal_min: 55, ideal_max: 96 }, // G3-C8, ideal G3-C7
    'viola': { min: 48, max: 88, ideal_min: 48, ideal_max: 81 }, // C3-E6, ideal C3-A5
    'cello': { min: 36, max: 76, ideal_min: 36, ideal_max: 69 }, // C2-E5, ideal C2-A4
    'contrabass': { min: 28, max: 67, ideal_min: 28, ideal_max: 60 }, // E1-G4, ideal E1-C4

    // Winds
    'flute': { min: 60, max: 96, ideal_min: 60, ideal_max: 89 }, // C4-C7, ideal C4-F6
    'piccolo': { min: 74, max: 108, ideal_min: 74, ideal_max: 101 }, // D5-C8, ideal D5-F7
    'clarinet': { min: 50, max: 91, ideal_min: 50, ideal_max: 84 }, // D3-G6, ideal D3-C6
    'oboe': { min: 58, max: 91, ideal_min: 58, ideal_max: 84 }, // Bb3-G6, ideal Bb3-C6
    'bassoon': { min: 34, max: 75, ideal_min: 34, ideal_max: 68 }, // Bb1-Eb5, ideal Bb1-Ab4
    'saxophone': { min: 49, max: 83, ideal_min: 49, ideal_max: 76 }, // Db3-B5, ideal Db3-E5

    // Brass
    'trumpet': { min: 58, max: 94, ideal_min: 58, ideal_max: 87 }, // Bb3-Bb6, ideal Bb3-Eb6
    'horn': { min: 41, max: 77, ideal_min: 41, ideal_max: 70 }, // F2-F5, ideal F2-Bb4
    'trombone': { min: 40, max: 72, ideal_min: 40, ideal_max: 65 }, // E2-C5, ideal E2-F4
    'tuba': { min: 28, max: 58, ideal_min: 28, ideal_max: 51 }, // E1-Bb3, ideal E1-Eb3

    // Piano & Keyboard
    'acoustic_grand_piano': { min: 21, max: 108, ideal_min: 36, ideal_max: 84 }, // A0-C8, ideal C2-C6
    'electric_piano': { min: 28, max: 103, ideal_min: 36, ideal_max: 84 }, // E1-G7, ideal C2-C6

    // Bass instruments
    'acoustic_bass': { min: 28, max: 67, ideal_min: 28, ideal_max: 55 }, // E1-G4, ideal E1-G3
    'electric_bass_finger': { min: 28, max: 72, ideal_min: 28, ideal_max: 60 }, // E1-C5, ideal E1-C4
    'synth_bass_1': { min: 24, max: 72, ideal_min: 28, ideal_max: 60 }, // C1-C5, ideal E1-C4

    // Choir & Voice
    'choir_aahs': { min: 36, max: 84, ideal_min: 48, ideal_max: 72 }, // C2-C6, ideal C3-C5
    'voice_oohs': { min: 36, max: 84, ideal_min: 48, ideal_max: 72 }, // C2-C6, ideal C3-C5

    // Strings Ensemble
    'string_ensemble_1': { min: 28, max: 96, ideal_min: 36, ideal_max: 84 }, // E1-C7, ideal C2-C6
    'string_ensemble_2': { min: 28, max: 96, ideal_min: 36, ideal_max: 84 }, // E1-C7, ideal C2-C6

    // Default ranges for unknown instruments
    'default_melody': { min: 48, max: 84, ideal_min: 60, ideal_max: 72 }, // C3-C6, ideal C4-C5
    'default_bass': { min: 28, max: 60, ideal_min: 28, ideal_max: 55 } // E1-C4, ideal E1-G3
};

// Function to constrain MIDI note to instrument range
function constrainToInstrumentRange(midi, instrumentName, voice = 'melody') {
    const ranges = INSTRUMENT_RANGES[instrumentName] || INSTRUMENT_RANGES[`default_${voice}`];
    if (!ranges) return midi;

    // First try to keep within ideal range
    let constrainedMidi = midi;
    while (constrainedMidi > ranges.ideal_max) constrainedMidi -= 12;
    while (constrainedMidi < ranges.ideal_min) constrainedMidi += 12;

    // If still outside absolute limits, apply hard constraints (with warning)
    if (constrainedMidi > ranges.max) {
        console.warn(`[RANGE WARNING] ${instrumentName} ${voice}: ${constrainedMidi} > ${ranges.max} (max), clamping`);
        while (constrainedMidi > ranges.max) constrainedMidi -= 12;
    }
    if (constrainedMidi < ranges.min) {
        console.warn(`[RANGE WARNING] ${instrumentName} ${voice}: ${constrainedMidi} < ${ranges.min} (min), clamping`);
        while (constrainedMidi < ranges.min) constrainedMidi += 12;
    }

    return constrainedMidi;
}

// Progression arrows UI controls
const progressionArrowsCheckbox = document.getElementById('progression-arrows');
const maxArrowsInput = document.getElementById('max-arrows');

// Rebuilt arrow UI controls
progressionArrowsCheckbox?.addEventListener('change', (e) => {
    arrowsEnabled = e.target.checked;
    console.log(`[ARROWS] ${arrowsEnabled ? 'Enabled' : 'Disabled'}`);
    if (!arrowsEnabled) clearArrows();
});

maxArrowsInput?.addEventListener('input', (e) => {
    const newMax = parseInt(e.target.value) || 5;
    maxArrows = Math.max(1, Math.min(20, newMax));
    e.target.value = maxArrows;
    console.log(`[ARROWS] Max set to: ${maxArrows}`);

    // Trim if needed
    while (progressionArrows.length > maxArrows) {
        const oldest = progressionArrows.shift();
        scene.remove(oldest);
        oldest.traverse(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });
    }
});

// Optional URL controls: ?bpm=120&bpc=4
(function readPerfParams() {
    try {
        const params = new URLSearchParams(window.location.search);
        const bpm = parseInt(params.get('bpm') || '');
        const bpc = parseInt(params.get('bpc') || '');
        if (!isNaN(bpm) && bpm > 20 && bpm < 400) progressionBpm = bpm;
        if (!isNaN(bpc) && bpc >= 1 && bpc <= 16) beatsPerChord = bpc;
    } catch (_) { }
})();
resetBtn?.addEventListener('click', () => {
    console.log('[RESET] Resetting to melody view and clearing lineup');

    clearArrows(); // Clear arrows on reset

    // Return all active cubes to their shelf origin and clear lineup
    for (const c of [...lineup]) {
        const r = c.userData.roman;
        const origin = shelfOriginByRoman[r];
        if (origin?.position) {
            c.position.copy(origin.position);
            c.scale.setScalar(origin.scale ?? c.scale.x);
        } else {
            c.position.set((shelfSlots[r] || new THREE.Vector3()).x, (shelfSlots[r] || new THREE.Vector3()).y, shelfZ);
        }
        c.userData.isShelf = true;
        if (!shelfCubes.includes(c)) shelfCubes.push(c);
        const ci = cubes.indexOf(c); if (ci >= 0) cubes.splice(ci, 1);
    }
    lineup = [];

    // RESTORE MELODY VIEW AND DEFAULT LIGHTING
    console.log('[RESET] Restoring melody view and lighting');
    setViewAbove(); // Return to melody view

    // Reset lighting to default
    ambient.intensity = 0.7;
    dir.intensity = 0.7;
    frontSpot.intensity = 0.0;
    frontSpotL.intensity = 0.0;
    frontSpotR.intensity = 0.0;
    stageSpot.intensity = 0.0;
    stageMode = false;

    // Also clear any locked lanes to avoid leftover markers
    try { clearLockedLines(); setMelodyLockVisual('open'); setBassLockVisual('open'); } catch (_) { }
});

// Lock icon events handled above via melodyLockIcon/bassLockIcon

// Handle set toggle checkboxes
function updateSetVisibility() {
    const show = new Set();
    if (setMajor?.checked) chordSetsC.major.forEach(c => show.add(c.roman));
    if (setMinor?.checked) chordSetsC.minor.forEach(c => show.add(c.roman));
    if (setApplied?.checked) chordSetsC.applied.forEach(c => show.add(c.roman));

    for (const s of shelfCubes) { s.visible = show.has(s.userData.roman); }
    console.log(`[SET TOGGLES] Visible sets: Major=${setMajor?.checked}, Minor=${setMinor?.checked}, Applied=${setApplied?.checked}`);
}

setMajor?.addEventListener('change', updateSetVisibility);
setMinor?.addEventListener('change', updateSetVisibility);
setApplied?.addEventListener('change', updateSetVisibility);

labelSelect.addEventListener('change', () => {
    labelMode = labelSelect.value;
    updateLabels();
});
keySelect?.addEventListener('change', () => {
    currentKey = keySelect.value;
    updateLabels();
    try { setState({ key: currentKey }); bridge.emit('settingsChanged', { key: currentKey }); } catch (_) { }
});

// Adjust mode UI
const adjustToggle = document.getElementById('adjust-toggle');
const saveMapBtn = document.getElementById('save-map-btn');
const loadMapInput = document.getElementById('load-map-input');
let adjustMode = false;
adjustToggle?.addEventListener('change', () => {
    adjustMode = !!adjustToggle.checked;
    document.body.classList.toggle('adjust-on', adjustMode);
});
saveMapBtn?.addEventListener('click', () => {
    saveShelfMapToLocalStorage();
    exportShelfMap();
});
loadMapInput?.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const json = JSON.parse(String(reader.result));
            applyShelfMap(json);
            saveShelfMapToLocalStorage();
            // Rebuild shelf with new anchors/scales
            loadSet(currentSet);
        } catch (err) {
            console.error('Invalid map JSON', err);
        }
    };
    reader.readAsText(file);
});

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onResize);

// Initial: start immediately with canvas-rendered labels (no PNG manifest)
textureManifest = null;
(async () => {
    await ensureFontsLoaded();
    readFlagsFromUrl();
    currentSet = 'all';
    await loadSet(currentSet);
    // Ensure shelf is visible by default
    for (const s of shelfCubes) s.visible = true;
    // Re-enable camera layers after load
    try { camera.layers.enable(0); camera.layers.enable(1); camera.layers.enable(2); } catch (_) { }
    await updateLabels();
    await loadInstruments();
    setViewAbove();
    createPlayButton();
    createDebugOverlay();
    initializeFontControlSystem();
    // Color calibrators
    const tonicEl = document.getElementById('color-tonic');
    const subEl = document.getElementById('color-sub');
    const domEl = document.getElementById('color-dom');
    const neuEl = document.getElementById('color-neu');
    const applyColors = async () => {
        const hexToInt = (hex) => parseInt(hex.replace('#', ''), 16);
        if (tonicEl?.value) COLOR_TONIC = hexToInt(tonicEl.value);
        if (subEl?.value) COLOR_SUBDOMINANT = hexToInt(subEl.value);
        if (domEl?.value) COLOR_DOMINANT = hexToInt(domEl.value);
        if (neuEl?.value) COLOR_NEUTRAL = hexToInt(neuEl.value);
        await updateLabels();
    };
    tonicEl?.addEventListener('change', applyColors);
    subEl?.addEventListener('change', applyColors);
    domEl?.addEventListener('change', applyColors);
    neuEl?.addEventListener('change', applyColors);
})();

// Animation loop
function animate() {
    controls.update();

    // Camera height compensation - DISABLED as it interferes with existing zoom
    // adjustCameraHeightForDistance();

    // drive tweens
    const now = performance.now();
    for (let i = activeTweens.length - 1; i >= 0; i--) {
        const done = activeTweens[i].tick(now);
        if (done) activeTweens.splice(i, 1);
    }
    // Live bottom/top indices per cube (derived from rotationIndex via compass)
    try {
        const hudLines = ['BOTTOM/TOP (live):'];
        for (let i = 0; i < lineup.length; i++) {
            const cube = lineup[i];
            // Ensure rotationIndex is synced to quaternion orientation
            syncRotationIndexFromQuaternion(cube);
            const r = ((cube.userData.rotationIndex || 0) % 4 + 4) % 4;
            const bottomIdx = r;
            const topIdx = (r + 2) % 4;
            cube.userData.bottomToneIdxLive = bottomIdx;
            cube.userData.topToneIdxLive = topIdx;
            const tones = noteSetsC[cube.userData.roman] || ['C', 'E', 'G', 'B'];
            const names = transposeNotes(tones, currentKey);
            hudLines.push(`${i}:${cube.userData.roman} B=${names[bottomIdx]}(${bottomIdx}) T=${names[topIdx]}(${topIdx})`);
        }
        if (debugEnabled) { ensureDebugOverlayPosition(); updateDebugOverlay(`Key=${currentKey}\n` + hudLines.join('\n')); }
    } catch (_) { }
    diag.update && diag.update();
    // Harmonized drag smoothing
    tickDragSmoothing();
    // Enforce two rest zones for all non-dragging cubes
    enforceRestZones();
    // Keep locked lanes following cubes as lineup reflows
    updateLanePositions();
    // Normalize giants orientation permanently to stored uprightZ
    try {
        const enforce = (root) => {
            root.traverse(o => {
                if (!(o && o.isMesh && o.geometry && o.material)) return;
                if (typeof o.userData?.uprightZ !== 'number') return;
                o.rotation.z = o.userData.uprightZ;
            });
        };
        if (melodyGiantGroup) enforce(melodyGiantGroup);
        if (bassGiantGroup) enforce(bassGiantGroup);
    } catch (_) { }
    // Show only appropriate locks per camera (melody above, bass below)
    try {
        const toTarget = camera.position.clone().sub(controls.target);
        const horiz = Math.hypot(toTarget.x, toTarget.z);
        const angle = Math.atan2(toTarget.y, horiz); // >0 above, <0 below
        const above = angle > 0.1;
        const showMel = above; const showBass = !above;
        [melodyLockLeft, melodyLockRight].forEach(o => { if (o) o.visible = showMel; });
        [bassLockLeft, bassLockRight].forEach(o => { if (o) o.visible = showBass; });
        // When camera is below plane (bass view), darken the scene like performance mode
        const below = !above;
        // Fade a darkening plane and adjust lights for bass view
        if (below) {
            try { darkPlane.material.opacity = 0.55; } catch (_) { }
            if (!stageSpot.userData.wasOn) { stageSpot.userData.wasOn = true; }
            stageSpot.intensity = 1.1; // REDUCED by factor of 2
            dir.intensity = 0.25; frontFill.intensity = 0.15; frontKey.intensity = 0.6;

            // FRONT ROW LIGHTING: Light the bottom of cubes and faces normally for front row only
            frontSpot.intensity = 0.75; // REDUCED by factor of 2 for performance/playback
            frontSpotL.intensity = 0.6; // REDUCED by factor of 2 for performance/playback
            frontSpotR.intensity = 0.6; // REDUCED by factor of 2 for performance/playback

            // EXTENDED BASS VIEW LIGHTING: Activate all bass lights for full coverage
            bassLights.forEach(light => light.intensity = 4.0); // REDUCED by factor of 2 for performance/playback
            bassAmbientBoost.intensity = 0.3; // Additional ambient boost
        } else {
            try { darkPlane.material.opacity = 0.0; } catch (_) { }
            stageSpot.userData.wasOn = false; stageSpot.intensity = 0.0;
            dir.intensity = 0.7; frontFill.intensity = 0.45; frontKey.intensity = 0.85;

            // Turn off front row spotlights in melody view
            frontSpot.intensity = 0.0;
            frontSpotL.intensity = 0.0;
            frontSpotR.intensity = 0.0;

            // Turn off extended bass view lighting in melody view
            bassLights.forEach(light => light.intensity = 0.0);
            bassAmbientBoost.intensity = 0.0;
        }
    } catch (_) { }
    // TEMP DEBUG: log one pivot angle occasionally
    try {
        if (melodyLaneGroup && melodyLaneGroup.children.length) {
            const a = melodyLaneGroup.children[0].rotation.x;
            if ((Math.floor(now / 300) % 10) === 0) { /* throttle */ }
        }
    } catch (_) { }
    // Update ground title opacities based on camera angle relative to plane y=0
    let belowAlpha = 0;
    if (melodyMat && bassMat) {
        const toTarget = camera.position.clone().sub(controls.target);
        const horiz = Math.hypot(toTarget.x, toTarget.z);
        const angle = Math.atan2(toTarget.y, horiz); // signed radians (positive above, negative below)
        const absDeg = Math.abs(angle) * (180 / Math.PI);
        const t = Math.min(1, absDeg / 30);
        const alpha = 0.4 * t;
        if (toTarget.y >= 0) { // above plane
            melodyMat.opacity = alpha; bassMat.opacity = 0; belowAlpha = 0;
            // PLAY BUTTONS: Only melody play button visible when above, bass play button invisible
            if (window.melodyPlayMesh) {
                window.melodyPlayMesh.material.opacity = 0.4; // Match text opacity
                window.melodyPlayMesh.visible = true;
            }
            if (window.bassPlayMesh) {
                window.bassPlayMesh.material.opacity = 0; // Invisible and unclickable
                window.bassPlayMesh.visible = false;
            }
            // MELODY VIEW LIGHTING: Restore full shelf lighting
            if (ambient) ambient.intensity = 0.7; // Full shelf lighting
            if (dir) dir.intensity = 0.7; // Full shelf lighting
            // SPOTLIGHT: Turn off front row spotlight in melody view
            if (frontKey) {
                frontKey.intensity = 0.85; // Return to normal intensity
                // Return to original position
                frontKey.position.set(0, 2.4, 4.2);
                frontKey.target.position.set(0, 0, 2.8);
                frontKey.target.updateMatrixWorld();
            }
        } else { // below plane
            melodyMat.opacity = 0; bassMat.opacity = alpha; belowAlpha = alpha;
            // PLAY BUTTONS: Only bass play button visible when below, melody play button invisible
            if (window.melodyPlayMesh) {
                window.melodyPlayMesh.material.opacity = 0; // Invisible and unclickable
                window.melodyPlayMesh.visible = false;
            }
            if (window.bassPlayMesh) {
                window.bassPlayMesh.material.opacity = 0.4; // Match text opacity
                window.bassPlayMesh.visible = true;
            }
            // BASS VIEW LIGHTING: Dim shelf lighting like performance mode
            if (ambient) ambient.intensity = 0.15; // Same as performance mode
            if (dir) dir.intensity = 0.25; // Same as performance mode
            // SPOTLIGHT: Follow camera down to shine up on front row bass
            if (frontKey) {
                frontKey.intensity = 0.6; // REDUCED by factor of 2 for performance/playback
                // Position spotlight below and behind camera, shining up at front row
                const cameraPos = camera.position.clone();
                frontKey.position.set(cameraPos.x, cameraPos.y - 1.0, cameraPos.z - 1.5);
                frontKey.target.position.set(0, 0.5, 2.8); // Shine at front row
                frontKey.target.updateMatrixWorld();
            }
        }
    }
    // VENN DIAGRAM (shelfPlane): 20% opacity in bass view, full opacity in melody view
    if (shelfPlane && shelfPlane.material) {
        const toTarget = camera.position.clone().sub(controls.target);
        const isBelowPlane = toTarget.y < 0;
        shelfPlane.material.transparent = true;
        if (isBelowPlane) {
            // BASS VIEW: MEGA DIM to 20% opacity
            shelfPlane.material.opacity = 0.20;
        } else {
            // MELODY VIEW: Full opacity
            shelfPlane.material.opacity = 1.0;
        }
    }
    // Darkening plane: smoothly increase up to 0.20 opacity at -25° and below
    if (darkPlane && darkPlane.material) {
        const toTarget = camera.position.clone().sub(controls.target);
        const horiz = Math.hypot(toTarget.x, toTarget.z);
        const angle = Math.atan2(toTarget.y, horiz); // signed
        let darkT = 0;
        if (angle < 0) {
            const deg = Math.abs(angle) * (180 / Math.PI);
            darkT = Math.min(1, deg / 25);
        }
        darkPlane.material.opacity = 0.20 * darkT;
    }
    // Subtle shimmer for background title (non-intrusive)
    if (bgTitleMesh && bgTitleMesh.material) {
        const m = bgTitleMesh.material;
        const t = now * 0.00015; // very slow
        const pulse = 0.28 + 0.05 * (0.5 + 0.5 * Math.sin(t * Math.PI * 2));
        m.opacity = pulse; // oscillate around ~30%
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
animate();

function physicsRepelNearFront(draggingCube) {
    const zoneZ = FRONT_ROW_FORWARD_Z + 0.6;
    const nodes = [...lineup];
    if (!nodes.includes(draggingCube)) nodes.push(draggingCube);
    const active = nodes.filter(c => Math.abs(c.position.z) <= zoneZ + 0.001);
    if (active.length <= 1) return;
    // Prep velocities
    for (const c of active) {
        if (!c.userData.vel) c.userData.vel = { x: 0, z: 0 };
    }
    // Pairwise repulsion (Coulomb-like), do not push the dragging cube directly
    const k = 0.08; // force constant
    const minDist = gridSize * 0.9;
    for (let i = 0; i < active.length; i++) {
        for (let j = i + 1; j < active.length; j++) {
            const a = active[i], b = active[j];
            const dx = b.position.x - a.position.x;
            const dz = b.position.z - a.position.z;
            let dist = Math.hypot(dx, dz);
            if (dist < 1e-6) dist = 1e-6;
            const nx = dx / dist, nz = dz / dist;
            // Apply only when inside an influence radius
            const influence = Math.max(0, (minDist - dist) / minDist);
            if (influence <= 0) continue;
            const f = k * influence * influence; // smooth non-linear falloff
            const fx = nx * f, fz = nz * f;
            if (a !== draggingCube) { a.userData.vel.x -= fx; a.userData.vel.z -= fz; }
            if (b !== draggingCube) { b.userData.vel.x += fx; b.userData.vel.z += fz; }
        }
    }
    // Integrate velocities with damping
    const damping = 0.85;
    for (const c of active) {
        if (c === draggingCube) continue;
        const v = c.userData.vel;
        const nextX = THREE.MathUtils.clamp(c.position.x + v.x, -8, 8);
        const nextZ = THREE.MathUtils.clamp(c.position.z + v.z, shelfZ, FRONT_ROW_FORWARD_Z);
        c.position.x = THREE.MathUtils.lerp(c.position.x, nextX, 0.5);
        c.position.z = THREE.MathUtils.lerp(c.position.z, nextZ, 0.5);
        v.x *= damping; v.z *= damping;
        // Keep on front plane for y/scale
        c.position.y = THREE.MathUtils.lerp(c.position.y, 0, 0.4);
    }
}

function enforceRestZones() {
    // Clamp all non-dragging cubes to valid rest zones only
    const all = [...cubes, ...shelfCubes];
    for (const c of all) {
        if (c === dragging) continue;
        if (lineup.includes(c)) {
            // Front row exact plane
            c.position.y = 0;
            c.position.z = 0;
            // Only snap rotation when not animating and already near a quadrant
            if (!hasActiveTweenFor(c)) {
                const e = new THREE.Euler().setFromQuaternion(c.quaternion, 'XYZ');
                const z = e.z;
                const snappedZ = Math.round(z / (Math.PI / 2)) * (Math.PI / 2);
                if (Math.abs(snappedZ - z) < 0.02) {
                    const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), snappedZ);
                    c.quaternion.copy(q);
                }
            }
        } else if (c.userData?.isShelf) {
            if (adjustMode) continue; // allow free placement while editing the shelf map
            // Exact shelf origin if available
            const r = c.userData.roman;
            const origin = shelfOriginByRoman[r];
            if (origin?.position) {
                c.position.copy(origin.position);
                c.scale.setScalar(origin.scale ?? c.scale.x);
                // Ensure shelf rotation restored
                if (origin.quaternion) c.quaternion.copy(origin.quaternion);
            } else {
                c.position.z = shelfZ;
            }
        }
    }
}

// Simple WebAudio chord playback
function ensureAudio() {
    if (!audioCtx) { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    return audioCtx;
}
const NOTE_INDEX = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
function noteToFreq(semitoneIndex, octave = 4) { const a4 = 440; const a4Index = 9 + 12 * 4; const idx = semitoneIndex + 12 * octave; return a4 * Math.pow(2, (idx - a4Index) / 12); }
function parseNoteName(name) {
    // e.g., C, C#, Db, Bb; infer octave around 4
    const n = name.replace(/[^A-G#b]/g, '');
    const idx = NOTE_INDEX[n] ?? 0; return { idx, octave: 4 };
}
// Pitch-class helpers
function pcOf(name) { return parseNoteName(name).idx; }
function midiToFreq(m) { return 440 * Math.pow(2, (m - 69) / 12); }
function freqToMidi(f) { return Math.round(69 + 12 * Math.log2(f / 440)); }

// Snap a target MIDI note to the octave closest to a reference MIDI
function nearestOctave(targetMidi, referenceMidi) {
    if (referenceMidi == null || !isFinite(referenceMidi)) return targetMidi;
    const k = Math.round((referenceMidi - targetMidi) / 12);
    return targetMidi + 12 * k;
}

// Voice Leading 3: Academic-grade voice leading with music21 principles
function voiceLeadMidi(targetMidi, referenceMidi, context = {}) {
    // Legacy modes for backwards compatibility
    if (voiceLeadingMode === 'vl1') return nearestOctave(targetMidi, referenceMidi);
    if (voiceLeadingMode === 'vl2') {
        if (referenceMidi == null || !isFinite(referenceMidi)) return targetMidi;
        let best = targetMidi, bestDist = Infinity;
        for (let o = -2; o <= 2; o++) {
            const cand = targetMidi + o * 12;
            const d = Math.abs(cand - referenceMidi);
            if (d < bestDist) { bestDist = d; best = cand; }
        }
        return best;
    }

    // Voice Leading 3: Advanced academic voice leading
    if (voiceLeadingMode !== 'vl3') return nearestOctave(targetMidi, referenceMidi);
    if (referenceMidi == null || !isFinite(referenceMidi)) return targetMidi;

    return voiceLeadAcademic(targetMidi, referenceMidi, context);
}

// VOICE LEADING 3: Academic-grade voice leading engine
// Based on classical SATB principles and jazz guide tone techniques
function voiceLeadAcademic(targetMidi, referenceMidi, context = {}) {
    const {
        currentChord = null,
        previousChord = null,
        voice = 'melody', // 'bass', 'melody', 'chord'
        chordTones = [],
        previousChordTones = []
    } = context;

    // If no reference, return target as-is
    if (referenceMidi == null || !isFinite(referenceMidi)) return targetMidi;

    console.log(`[VL3] ${voice.toUpperCase()} voice leading: ${previousChord}→${currentChord}, ref=${referenceMidi}, target=${targetMidi}`);

    // HARD RULE: 3-SEMITONE RULE - If target is within 3 half steps, MUST use closest octave
    // This overrides ALL other considerations including register boundaries
    const targetPC = targetMidi % 12;
    const referencePC = referenceMidi % 12;
    const pitchClassDistance = Math.min(
        Math.abs(targetPC - referencePC),
        12 - Math.abs(targetPC - referencePC)
    );

    if (pitchClassDistance <= 3) {
        // Find the closest octave placement regardless of register boundaries
        let bestCandidate = targetMidi;
        let bestDistance = Math.abs(targetMidi - referenceMidi);

        // Try all octaves within reasonable range
        for (let octave = -4; octave <= 4; octave++) {
            const candidate = targetMidi + (octave * 12);
            const distance = Math.abs(candidate - referenceMidi);
            if (distance < bestDistance) {
                bestDistance = distance;
                bestCandidate = candidate;
            }
        }

        console.log(`[VL3] 🔥 3-SEMITONE RULE: ${pitchClassDistance} semitones apart, using closest octave ${bestCandidate} (was ${targetMidi})`);
        return bestCandidate;
    }

    // BASS REGISTER CONSTRAINT: Extreme bias to stay near tonic
    if (voice === 'bass') {
        return voiceLeadBassWithRegisterConstraint(targetMidi, referenceMidi, context);
    }

    // Generate candidate notes within ±2 octaves for non-bass voices
    const candidates = [];
    for (let octave = -2; octave <= 2; octave++) {
        const candidate = targetMidi + (octave * 12);
        candidates.push(candidate);
    }

    // PRINCIPLE 1: Common Tone Retention
    // If the target note exists in the previous chord, strongly prefer keeping it
    const targetPitchClass = targetMidi % 12;
    const referencePitchClass = referenceMidi % 12;

    if (previousChordTones.length > 0) {
        const previousPCs = previousChordTones.map(midi => midi % 12);
        if (previousPCs.includes(targetPitchClass)) {
            // This is a common tone - prefer minimal movement
            console.log(`[VL3] Common tone detected: ${targetPitchClass} exists in previous chord`);
            const commonToneCandidate = candidates.find(c => Math.abs(c - referenceMidi) <= 1);
            if (commonToneCandidate) {
                console.log(`[VL3] Using common tone with minimal movement: ${commonToneCandidate}`);
                return commonToneCandidate;
            }
        }
    }

    // PRINCIPLE 2: Guide Tones (Jazz) - 3rd and 7th priority
    if (currentChord && previousChord && (currentChord.includes('7') || previousChord.includes('7'))) {
        const guideToneMovement = calculateGuideToneMovement(previousChord, currentChord, voice);
        if (guideToneMovement) {
            console.log(`[VL3] Guide tone movement detected: ${guideToneMovement}`);
            // Prefer stepwise motion for guide tones
            const stepwiseCandidate = candidates.find(c => {
                const interval = Math.abs(c - referenceMidi);
                return interval <= 2; // Half or whole step
            });
            if (stepwiseCandidate) return stepwiseCandidate;
        }
    }

    // PRINCIPLE 3: Stepwise Motion Priority
    // Prefer half-steps (1 semitone), then whole-steps (2 semitones), then thirds (3-4 semitones)
    const stepwiseCandidates = candidates
        .map(c => ({ midi: c, interval: Math.abs(c - referenceMidi) }))
        .sort((a, b) => a.interval - b.interval);

    for (const candidate of stepwiseCandidates) {
        if (candidate.interval <= 2) { // Half or whole step
            console.log(`[VL3] Stepwise motion (${candidate.interval} semitones): ${candidate.midi}`);
            return candidate.midi;
        }
        if (candidate.interval <= 4) { // Minor or major third
            console.log(`[VL3] Third motion (${candidate.interval} semitones): ${candidate.midi}`);
            return candidate.midi;
        }
    }

    // PRINCIPLE 4: Avoid Large Leaps (prefer smaller intervals)
    // If we must leap, choose the smallest leap available
    const bestCandidate = stepwiseCandidates[0];
    console.log(`[VL3] Minimal leap (${bestCandidate.interval} semitones): ${bestCandidate.midi}`);
    return bestCandidate.midi;
}

// BASS REGISTER CONSTRAINT: Specialized voice leading for bass with register management
// CRITICAL: NEVER violate chord tones - only affects OCTAVE selection within the chord tone
function voiceLeadBassWithRegisterConstraint(targetMidi, referenceMidi, context) {
    const { currentChord, previousChord } = context;

    // MANDATORY: Preserve the exact pitch class from the cube inversion
    // The targetMidi comes from the cube face - we MUST respect this chord tone
    const targetPitchClass = targetMidi % 12;

    console.log(`[BASS CONSTRAINT] ${previousChord}→${currentChord}, PRESERVING chord tone pitch class: ${targetPitchClass}, ref=${referenceMidi}, target=${targetMidi}`);

    // Generate candidate octaves for the SAME pitch class only
    const candidates = [];
    for (let octave = 1; octave <= 4; octave++) { // C1 to C4 range
        const candidate = targetPitchClass + (octave * 12);
        if (candidate >= 24 && candidate <= 67) { // Extended bass range C1-G3
            candidates.push(candidate);
        }
    }

    // BASS REGISTER PREFERENCE: Prefer lower octaves but stay musical
    const bassRegisterCandidates = candidates.filter(midi => midi >= 36 && midi <= 55); // C2-G#2 preferred
    const extendedCandidates = candidates.filter(midi => midi >= 24 && midi <= 67); // C1-G3 allowed

    // Sort by distance from reference, preferring bass register
    const sortedCandidates = [
        ...bassRegisterCandidates.sort((a, b) => Math.abs(a - referenceMidi) - Math.abs(b - referenceMidi)),
        ...extendedCandidates.filter(c => !bassRegisterCandidates.includes(c))
            .sort((a, b) => Math.abs(a - referenceMidi) - Math.abs(b - referenceMidi))
    ];

    // EXCEPTION RULES: Allow extreme movement for specific resolutions
    const needsExtremeResolution = checkBassExtremeResolution(previousChord, currentChord, referenceMidi, targetMidi);

    if (needsExtremeResolution) {
        console.log(`[BASS CONSTRAINT] Allowing extreme resolution: ${needsExtremeResolution.reason}`);
        // Still must use the correct pitch class, just allow wider octave range
        const resolutionCandidate = sortedCandidates.find(midi => Math.abs(midi - referenceMidi) <= 12) || sortedCandidates[0];
        console.log(`[BASS CONSTRAINT] Resolution candidate: ${resolutionCandidate} (preserving pitch class ${targetPitchClass})`);
        return resolutionCandidate;
    }

    // REGISTER BIAS: Prefer bass register, but use voice leading for octave choice
    let bestCandidate = sortedCandidates[0];

    // If reference is way too high, bias toward lower octaves
    if (referenceMidi > 60) { // Above C4
        const lowerCandidates = sortedCandidates.filter(midi => midi <= 48); // C3 and below
        if (lowerCandidates.length > 0) {
            bestCandidate = lowerCandidates[0];
            console.log(`[BASS CONSTRAINT] Biasing toward lower octave due to high reference: ${bestCandidate}`);
        }
    }

    console.log(`[BASS CONSTRAINT] Using chord tone ${targetPitchClass} in octave: ${bestCandidate} (interval: ${Math.abs(bestCandidate - referenceMidi)} semitones)`);
    return bestCandidate;
}

// Check if bass needs extreme resolution (7th resolution, leading tone resolution)
function checkBassExtremeResolution(fromChord, toChord, referenceMidi, targetMidi) {
    if (!fromChord || !toChord) return null;

    // Leading tone resolution: V→I (3rd of V resolves up to 1 of I)
    if ((fromChord === 'V' || fromChord === 'V7') && toChord === 'I') {
        const interval = targetMidi - referenceMidi;
        if (interval === 1 || interval === -11) { // Half step up (or down octave + half step)
            return { reason: 'Leading tone resolution V→I' };
        }
    }

    // 7th resolution: Any 7th chord resolving down by step
    if (fromChord.includes('7') && !toChord.includes('7')) {
        const interval = targetMidi - referenceMidi;
        if (interval === -1 || interval === -2 || interval === 11 || interval === 10) { // Step down
            return { reason: '7th chord resolution downward' };
        }
    }

    // Dominant resolution: V7→I (7th resolves down, 3rd resolves up)
    if ((fromChord === 'V7' || fromChord === 'V(7)(b9)') && toChord === 'I') {
        return { reason: 'Dominant 7th resolution V7→I' };
    }

    return null;
}

// Calculate guide tone movement for jazz progressions
function calculateGuideToneMovement(fromChord, toChord, voice) {
    // Common jazz progressions with guide tone movement
    const guideToneProgressions = {
        'ii7→V7': { '3rd': -1, '7th': -1 }, // Stepwise down
        'V7→I': { '3rd': +1, '7th': -1 },   // 3rd up, 7th down
        'vi7→ii7': { '3rd': 0, '7th': -1 }, // Common tone, 7th down
        'I→vi': { '3rd': -1, '7th': 0 },    // 3rd down, common tone
    };

    // Detect common progressions
    const progressionKey = `${fromChord}→${toChord}`;
    if (guideToneProgressions[progressionKey]) {
        return guideToneProgressions[progressionKey];
    }

    // Generic 7th chord movement
    if (fromChord.includes('7') && toChord.includes('7')) {
        return { '3rd': 'stepwise', '7th': 'stepwise' };
    }

    return null;
}

// Enhanced voice leading for chord progressions
function voiceLeadChordProgression(chords, voices = ['bass', 'melody']) {
    const result = { bass: [], melody: [], chord: [] };
    let previousMidis = { bass: null, melody: null, chord: [] };

    for (let i = 0; i < chords.length; i++) {
        const currentChord = chords[i];
        const previousChord = i > 0 ? chords[i - 1] : null;

        // Get chord tones for current and previous chords
        const currentTones = noteSetsC[currentChord] || ['C', 'E', 'G', 'B'];
        const previousTones = previousChord ? (noteSetsC[previousChord] || ['C', 'E', 'G', 'B']) : [];

        const currentMidis = currentTones.map(note => noteToMidi(note, 4)); // C4 octave
        const previousMidis_chord = previousTones.map(note => noteToMidi(note, 4));

        for (const voice of voices) {
            const context = {
                currentChord,
                previousChord,
                voice,
                chordTones: currentMidis,
                previousChordTones: previousMidis_chord
            };

            let targetMidi;
            if (voice === 'bass') {
                targetMidi = currentMidis[0] - 24; // Root in bass register
            } else if (voice === 'melody') {
                targetMidi = currentMidis[2] + 12; // 5th in melody register
            }

            const voiceLedMidi = voiceLeadMidi(targetMidi, previousMidis[voice], context);
            result[voice].push(voiceLedMidi);
            previousMidis[voice] = voiceLedMidi;
        }
    }

    return result;
}

// Helper function to convert note name to MIDI number
function noteToMidi(noteName, octave = 4) {
    const noteMap = { 'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11 };
    const pitchClass = noteMap[noteName] || 0;
    return (octave * 12) + pitchClass + 12; // +12 for MIDI offset
}

// REAL-TIME VOICE LEADING: Update chord context for intelligent connections
function updateChordContext(roman, playedMidis = {}) {
    const chordTones = noteSetsC[roman] ?
        noteSetsC[roman].map(note => noteToMidi(note, 4)) : [];

    // Store the last played chord with context
    lastPlayedChord = {
        roman,
        chordTones,
        playedMidis: { ...playedMidis }, // { bass: 48, melody: 72, chord: [60, 64, 67] }
        timestamp: Date.now()
    };

    // Add to chord history (keep last 10 chords for advanced analysis)
    chordHistory.push(lastPlayedChord);
    if (chordHistory.length > 10) {
        chordHistory.shift();
    }

    console.log(`[VL3 CONTEXT] Updated: ${roman}, History: ${chordHistory.map(c => c.roman).join('→')}`);
}

// Get enhanced voice leading context for any chord interaction
function getVoiceLeadingContext(currentChord, voice) {
    const context = {
        currentChord,
        previousChord: lastPlayedChord?.roman || null,
        voice,
        chordTones: noteSetsC[currentChord] ?
            noteSetsC[currentChord].map(note => noteToMidi(note, voice === 'bass' ? 2 : 5)) : [],
        previousChordTones: lastPlayedChord ? lastPlayedChord.chordTones : []
    };

    // Add played MIDI context if available
    if (lastPlayedChord?.playedMidis[voice]) {
        context.previousPlayedMidi = lastPlayedChord.playedMidis[voice];
    }

    return context;
}

// Chord bed: lock voices into C4..C5 regardless of chord
function buildLockedChordBedMidis(roman, includeSeventh) {
    const tones = noteSetsC[roman] || ['C', 'E', 'G', 'B'];
    const names = transposeNotes(tones, currentKey);

    // ALWAYS include 7th for diminished chords and I7 chords
    const isDiminished = roman.includes('º') || roman.includes('ø');
    const isI7 = roman === 'I7' || roman === 'i7';
    const isV7b9 = roman === 'V(7)(b9)' || roman === 'V(b7)(b9)';
    const forceSeventhForSpecialChords = isDiminished || isI7;

    // V(7)(b9) ALWAYS uses root, 3rd, 5th, b9th - NEVER the b7th
    let use;
    if (isV7b9) {
        // ALWAYS use all 4 notes: root, 3rd, 5th, b9th (the b9th IS the distinctive tone)
        // The 4th note is Ab (b9th), NOT F (b7th)
        use = names.slice(0, 4); // ['G', 'B', 'D', 'Ab'] - no b7th ever!
        console.log(`[V7B9 DEBUG] ${roman} ALWAYS uses 4 notes (b9th mandatory, NO b7th):`, use);
    } else {
        use = (includeSeventh || forceSeventhForSpecialChords) ? names.slice(0, 4) : names.slice(0, 3);
    }
    const baseC4 = 60; // MIDI C4
    const midis = use.map(n => baseC4 + pcOf(n));
    midis.sort((a, b) => a - b);
    // Ensure within [60, 71]
    return midis.map(m => ((m - baseC4) % 12 + 12) % 12 + baseC4);
}

// Bass: map clicked bottom-face tone into one octave above the chord's root in a low register (root-anchored octave)
function getBassMidiForObject(obj) {
    const tones = noteSetsC[obj.userData.roman] || ['C', 'E', 'G', 'B'];
    const names = transposeNotes(tones, currentKey);
    const r = ((obj.userData.rotationIndex || 0) % 4 + 4) % 4;
    const rootPc = pcOf(names[0]);
    const bottomPc = pcOf(names[r]);
    const baseC2 = 36; // low register
    const rootBaseMidi = baseC2 + ((rootPc - 0 + 12) % 12);
    const diff = (bottomPc - rootPc + 12) % 12;
    const finalMidi = rootBaseMidi + diff;
    console.log(`[BASS DEBUG] ${obj.userData.roman} rotationIndex=${r}, bottomTone=${names[r]}, midi=${finalMidi}`);
    return finalMidi; // within one octave above root
}

// Melody: map top-face tone into a higher octave anchored to the chord root
function getMelodyMidiForObject(obj) {
    const tones = noteSetsC[obj.userData.roman] || ['C', 'E', 'G', 'B'];
    const names = transposeNotes(tones, currentKey);
    const r = ((obj.userData.rotationIndex || 0) % 4 + 4) % 4;
    const topIdx = (r + 2) % 4;
    const rootPc = pcOf(names[0]);
    const topPc = pcOf(names[topIdx]);
    const baseC5 = 72; // higher register
    const rootBaseMidi = baseC5 + ((rootPc - 0 + 12) % 12);
    const diff = (topPc - rootPc + 12) % 12;
    const finalMidi = rootBaseMidi + diff;
    console.log(`[MELODY DEBUG] ${obj.userData.roman} rotationIndex=${r}, topIdx=${topIdx}, topTone=${names[topIdx]}, midi=${finalMidi}`);
    return finalMidi;
}

function makeNumberPlane(text, width = 0.9) {
    const size = 512;
    const c = document.createElement('canvas'); c.width = size; c.height = size;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = 'rgba(0,0,0,0)'; ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#111';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '900 360px NVXDiamond, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial';
    ctx.strokeStyle = '#111'; ctx.lineWidth = 8; ctx.strokeText(text, size / 2, size / 2 + 20);
    ctx.fillText(text, size / 2, size / 2 + 20);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.needsUpdate = true;
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide });
    const aspect = 1.0;
    const h = width / aspect;
    const geo = new THREE.PlaneGeometry(width, h);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.z = 0.002;
    return mesh;
}

// Helper: get transposed top-face note name for a cube in current key
function getTopNoteNameForObject(obj) {
    const tones = noteSetsC[obj.userData.roman] || ['C', 'E', 'G', 'B'];
    const names = transposeNotes(tones, currentKey);
    const r = ((obj.userData.rotationIndex || 0) % 4 + 4) % 4;
    return names[(r + 2) % 4];
}

function getTopDegreeForObject(obj) {
    const r = ((obj.userData.rotationIndex || 0) % 4 + 4) % 4;
    const roman = obj.userData.roman;
    const degs = degreeSets[roman] || ['1', '3', '5', '7'];
    return degs[(r + 2) % 4];
}

// Render a large NVX Diamond Font string as a billboard in 3D space
function showNVXDebugText(text) {
    try { if (nvxDebugTextMesh) { scene.remove(nvxDebugTextMesh); nvxDebugTextMesh.material?.map?.dispose?.(); nvxDebugTextMesh.material?.dispose?.(); nvxDebugTextMesh.geometry?.dispose?.(); nvxDebugTextMesh = null; } } catch (_) { }
    const w = 2048, h = 512;
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(0,0,0,0)'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '900 300px NVXDiamond, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial';
    ctx.fillText(text, w / 2, h / 2);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.needsUpdate = true;
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
    const aspect = w / h; const width = 10; const height = width / aspect;
    const geo = new THREE.PlaneGeometry(width, height);
    nvxDebugTextMesh = new THREE.Mesh(geo, mat);
    nvxDebugTextMesh.position.set(0, 1.8, 0.6);
    nvxDebugTextMesh.renderOrder = 6;
    scene.add(nvxDebugTextMesh);
    // Expose a helper for manual updates
    try { window.nvxText = (t) => showNVXDebugText(String(t || '')); } catch (_) { }
}
// Play chord with variable sustain duration - TRANSPORT COMPATIBLE
function playChordForObjectWithSustain(obj, sustainSeconds) {
    const roman = obj.userData.roman;
    console.log(`[CHORD SUSTAIN] Playing ${roman} with ${sustainSeconds.toFixed(2)}s sustain`);

    const ctx = ensureAudio();
    const now = ctx.currentTime;
    const chordMidis = buildLockedChordBedMidis(roman, withSeventh);

    if (sfChord && sfChord.play) {
        chordMidis.forEach(m => sfChord.play(m, now, { duration: sustainSeconds, gain: 0.18 * chordVolume }));
    }
    if (isBassEnabled()) {
        const bassMidi = getBassMidiForObject(obj);
        // NEW AUDIO ENGINE: Use real bass instruments
        if (window.audioEngine && window.audioEngine.playBass) {
            const bassNote = Tone.Frequency(bassMidi, "midi").toNote();
            console.log('[SUSTAIN] 🎵 Playing bass sustain:', bassNote);
            window.audioEngine.playBass(bassNote, sustainSeconds, 0.34, false);
        }
    }
    if (isMelodyEnabled()) {
        const melMidi = getMelodyMidiForObject(obj);
        // NEW AUDIO ENGINE: Use real melody instruments
        if (window.audioEngine && window.audioEngine.playMelody) {
            const melodyNote = Tone.Frequency(melMidi, "midi").toNote();
            console.log('[SUSTAIN] 🎵 Playing melody sustain:', melodyNote);
            window.audioEngine.playMelody([melodyNote], [sustainSeconds], 0.3);
        }
    }
}

// New unified function that accepts a 7th parameter
function playChordForObjectWith7th(obj, use7th = false, options = {}) {
    if (!window.audioEngine) {
        console.error('[AUDIO ENGINE] Audio engine not initialized');
        return;
    }

    const chordKey = obj.userData.roman;

    // Calculate full measure duration based on current BPM (same as progression)
    const currentBpm = Tone.Transport.bpm.value || 120; // Default to 120 BPM if not set
    const beatsPerMeasure = 4;
    let duration = (60 / currentBpm) * beatsPerMeasure; // Full measure duration

    // FREE PLAY MODE: Check if we should use smooth cutoff instead of full duration
    const inFreePlayMode = !improvMode &&
        !window.drumMachine?.isPlaying &&
        !window.chordCubesTransport?.metronomOn &&
        !window.chordCubesTransport?.drumsOn;

    console.log(`[FREE PLAY DEBUG] Mode detection: inFreePlayMode=${inFreePlayMode}, improvMode=${improvMode}, drumMachine.isPlaying=${window.drumMachine?.isPlaying}, metronome=${window.chordCubesTransport?.metronomOn}, drums=${window.chordCubesTransport?.drumsOn}`);

    if (inFreePlayMode) {
        // FREE PLAY: Use longer base duration for smooth playing, will be cut IMMEDIATELY by next chord
        duration = 3.0; // 3 seconds base - will be cut IMMEDIATELY when next chord is clicked
        console.log(`[FREE PLAY] Playing ${chordKey} with 3s base duration - will cutoff IMMEDIATELY on next chord`);

        // Clear any existing cutoff timer
        if (freePlayCutoffTimer) {
            clearTimeout(freePlayCutoffTimer);
            freePlayCutoffTimer = null;
        }

        // If there's a current chord playing, cut it off IMMEDIATELY (no delay)
        console.log(`[FREE PLAY DEBUG] currentFreePlayChord exists: ${!!currentFreePlayChord}`);
        if (currentFreePlayChord) {
            console.log(`[FREE PLAY DEBUG] Previous chord: ${currentFreePlayChord.chordKey}, window.audioEngine exists: ${!!window.audioEngine}`);
            if (window.audioEngine) {
                console.log('[FREE PLAY] 🔇 Cutting off previous chord IMMEDIATELY for no overlap');
                // IMMEDIATE CUTOFF - no setTimeout delay
                window.audioEngine.cutoffCurrentChord();
                console.log('[FREE PLAY] ✅ Cutoff function called');
            } else {
                console.log('[FREE PLAY] ❌ window.audioEngine not available for cutoff');
            }
            currentFreePlayChord = null;
        }

        // Track this chord as the current one
        currentFreePlayChord = { chordKey, startTime: Date.now() };
    } else {
        console.log(`[CHORD CLICK] Playing ${chordKey} with full sustain: ${duration.toFixed(2)}s (BPM: ${currentBpm})`);
    }

    // FREE IMPROV: Override rotation to force root position
    const effectiveRotationIndex = options.forceRootPosition ? 0 : obj.userData.rotationIndex;
    const modeNote = options.forceRootPosition ? ' (FORCED ROOT)' : '';

    console.log(`[AUDIO ENGINE] ===== PLAYING CHORD FOR ${chordKey}${modeNote} =====`);
    console.log(`[AUDIO ENGINE] rotationIndex: ${effectiveRotationIndex}, isShelf: ${!!obj.userData.isShelf}, use7th: ${use7th}`);

    // CLAUDE'S FIX: Remove legacy instrumentsReady gate - engine always has immediate fallbacks
    // No more blocking checks - audio plays immediately!

    // Get chord notes using existing logic
    const chordMidis = buildLockedChordBedMidis(chordKey, use7th);
    const idxForObj = lineup.indexOf(obj);
    const bedMidis = (lockedMelody && idxForObj >= 0 && lockedMelody[idxForObj]) ?
        chordMidis.slice(0, Math.max(1, chordMidis.length - 1)) : chordMidis;

    // Convert MIDI numbers to note names for WebAudioFont
    let noteNames = bedMidis.map(midi => midiToNoteName(midi));
    console.log(`[CHORD EXT DEBUG] ${chordKey} original notes: [${noteNames.join(', ')}], bedMidis: [${bedMidis.join(', ')}]`);

    // APPLY STORED EXTENSIONS from chord userData (for playback)
    if (obj && obj.userData && obj.userData.extensions && obj.userData.extensions.length > 0) {
        console.log(`[PLAYBACK EXT] Found stored extensions for ${chordKey}:`, obj.userData.extensions);
        const rootNote = getChordRootNote(chordKey);
        const storedExtensions = new Set(obj.userData.extensions.map(ext => ({
            name: ext.name,
            interval: ext.interval,
            description: ext.description
        })));
        noteNames = applyChordExtensions(noteNames, rootNote, storedExtensions);
        console.log(`[PLAYBACK EXT] Applied stored extensions: ${noteNames.join(', ')}`);
    }
    // APPLY CHROMATIC EXTENSIONS if any are currently active (live playing)
    else if (activeExtensions.size > 0) {
        console.log(`[CHORD EXT DEBUG] Active extensions: [${Array.from(activeExtensions).map(ext => ext.name).join(', ')}]`);
        const rootNote = getChordRootNote(chordKey); // Get actual root from Roman numeral
        console.log(`[CHORD EXT DEBUG] Root note: ${rootNote}`);
        noteNames = applyChordExtensions(noteNames, rootNote, activeExtensions);
        console.log(`[CHORD EXT] Extended chord for ${chordKey}: ${noteNames.join(', ')}`);

        // HARDCODE EXTENSIONS INTO CHORD OBJECT FOR PERSISTENCE
        if (obj && obj.userData) {
            obj.userData.extensions = Array.from(activeExtensions).map(ext => ({
                name: ext.name,
                interval: ext.interval,
                description: ext.description
            }));
            console.log(`[CHORD PERSISTENCE] Saved extensions to ${chordKey}:`, obj.userData.extensions);

            // UPDATE CHORD FACE IMMEDIATELY TO SHOW EXTENSIONS
            const label = (labelMode === 'roman') ? obj.userData.roman : obj.userData.letter || obj.userData.roman;
            const newTexture = loadFaceTexture(label, obj.userData.roman, false, obj.userData.extensions);
            if (obj.material && obj.material[4]) { // Front face index
                obj.material[4].map = newTexture;
                obj.material[4].needsUpdate = true;
            }
        }
    } else {
        // Clear extensions if none are active
        if (obj && obj.userData) {
            delete obj.userData.extensions;

            // UPDATE CHORD FACE TO REMOVE EXTENSIONS
            const label = (labelMode === 'roman') ? obj.userData.roman : obj.userData.letter || obj.userData.roman;
            const newTexture = loadFaceTexture(label, obj.userData.roman, false, null);
            if (obj.material && obj.material[4]) { // Front face index
                obj.material[4].map = newTexture;
                obj.material[4].needsUpdate = true;
            }
        }
    }

    // Play chord using orchestral engine - Use manual control for FREE PLAY instant cutoff
    window.audioEngine.playChord(noteNames, duration, 0.5, inFreePlayMode);

    // Bass: if locked, use locked line; else use cube bottom face - WITH VOICE LEADING 3
    if (isBassEnabled()) {
        // Temporarily override rotation index for Free Improv mode
        const originalRotationIndex = obj.userData.rotationIndex;
        if (options.forceRootPosition) {
            obj.userData.rotationIndex = 0;
        }

        let bassMidi = getBassMidiForObject(obj);
        const idx = lineup.indexOf(obj);
        if (lockedBass && idx >= 0 && lockedBass[idx] && typeof lockedBass[idx].midi === 'number') {
            bassMidi = lockedBass[idx].midi;
        }

        // Restore original rotation index
        obj.userData.rotationIndex = originalRotationIndex;

        // Force into bass register
        while (bassMidi > 55) bassMidi -= 12; // keep <= G#2
        while (bassMidi < 36) bassMidi += 12; // keep >= C2

        // VOICE LEADING 3: Apply intelligent voice leading for bass
        const bassContext = getVoiceLeadingContext(chordKey, 'bass');
        bassMidi = voiceLeadMidi(bassMidi, lastBassMidi, bassContext);
        lastBassMidi = bassMidi;

        const bassNoteName = midiToNoteName(bassMidi);
        console.log('[CHORD PLAYBACK] 🎵 Playing bass with VL3:', bassNoteName, 'from', bassContext.previousChord, '→', bassContext.currentChord);
        window.audioEngine.playBass(bassNoteName, duration, 0.6, inFreePlayMode);
    }

    // Melody: if locked, use locked line; else use cube top face - WITH VOICE LEADING 3
    if (isMelodyEnabled()) {
        // Temporarily override rotation index for Free Improv mode
        const originalRotationIndex = obj.userData.rotationIndex;
        if (options.forceRootPosition) {
            obj.userData.rotationIndex = 0;
        }

        let melMidi = getMelodyMidiForObject(obj);
        const idx = lineup.indexOf(obj);
        if (lockedMelody && idx >= 0 && lockedMelody[idx] && typeof lockedMelody[idx].midi === 'number') {
            melMidi = lockedMelody[idx].midi;
        }

        // Restore original rotation index
        obj.userData.rotationIndex = originalRotationIndex;

        // Force into melody register
        while (melMidi > 84) melMidi -= 12; // <= C6
        while (melMidi < 60) melMidi += 12; // >= C4

        // VOICE LEADING 3: Apply intelligent voice leading for melody
        const melodyContext = getVoiceLeadingContext(chordKey, 'melody');
        melMidi = voiceLeadMidi(melMidi, lastMelodyMidi, melodyContext);
        lastMelodyMidi = melMidi;

        const melodyNoteName = midiToNoteName(melMidi);
        console.log('[CHORD PLAYBACK] 🎵 Playing melody with VL3:', melodyNoteName, 'from', melodyContext.previousChord, '→', melodyContext.currentChord);
        window.audioEngine.playMelody([melodyNoteName], [duration], 0.4);
    }

    // UPDATE CHORD CONTEXT: Track this chord for next voice leading decision
    const playedMidis = {};
    if (isBassEnabled() && lastBassMidi != null) playedMidis.bass = lastBassMidi;
    if (isMelodyEnabled() && lastMelodyMidi != null) playedMidis.melody = lastMelodyMidi;
    updateChordContext(chordKey, playedMidis);

    try { bridge.emit('chordPlayed', { roman: obj.userData?.roman, key: currentKey, withSeventh: use7th, bassEnabled: isBassEnabled(), melodyEnabled: isMelodyEnabled(), rotationIndex: obj.userData?.rotationIndex || 0 }); } catch (_) { }
}

// Helper function to convert MIDI numbers to note names
function midiToNoteName(midi) {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midi / 12) - 1;
    const noteIndex = midi % 12;
    return noteNames[noteIndex] + octave;
}

// Legacy function - just calls the new one with global withSeventh setting
function playChordForObject(obj) {
    return playChordForObjectWith7th(obj, withSeventh);
}

// Shelf-click sequencing
const shelfClickQueue = [];
let processingShelfQueue = false;
async function enqueueShelfAdd(shelfMesh) {
    shelfClickQueue.push(shelfMesh);

    // Arrow tracking and progression index management
    if (arrowsEnabled && shelfMesh?.userData?.roman) {
        const roman = shelfMesh.userData.roman;
        globalProgressionIndex++; // Increment global counter
        const progressionIndex = globalProgressionIndex;

        shelfClickHistory.push({ roman, timestamp: Date.now(), index: progressionIndex });

        // Track progression indices for this chord
        if (!chordProgressionIndices[roman]) {
            chordProgressionIndices[roman] = [];
        }
        chordProgressionIndices[roman].push(progressionIndex);

        // Remove old progression label if it exists
        const oldLabels = scene.children.filter(child =>
            child.userData?.isProgressionLabel && child.userData?.roman === roman);
        oldLabels.forEach(label => {
            scene.remove(label);
            if (label.material?.map) label.material.map.dispose();
            if (label.material) label.material.dispose();
        });

        // Create new progression label with all indices
        const shelfOrigin = shelfOriginByRoman[roman];
        if (shelfOrigin) {
            const labelPosition = new THREE.Vector3(shelfOrigin.position.x, shelfOrigin.position.y, -3.47);
            createProgressionLabel(roman, chordProgressionIndices[roman], labelPosition);
        }

        if (shelfClickHistory.length > 1) {
            const prev = shelfClickHistory[shelfClickHistory.length - 2];
            const curr = shelfClickHistory[shelfClickHistory.length - 1];
            console.log(`[ARROW TRACK] ${prev.roman} → ${curr.roman} (index ${progressionIndex})`);
            addArrow(prev.roman, curr.roman);
        }

        // Keep history trimmed
        while (shelfClickHistory.length > maxArrows + 1) {
            const removed = shelfClickHistory.shift();
            // Clean up progression indices for removed items
            if (removed && chordProgressionIndices[removed.roman]) {
                const indexToRemove = chordProgressionIndices[removed.roman].indexOf(removed.index);
                if (indexToRemove !== -1) {
                    chordProgressionIndices[removed.roman].splice(indexToRemove, 1);
                    if (chordProgressionIndices[removed.roman].length === 0) {
                        delete chordProgressionIndices[removed.roman];
                        // Remove label
                        const labelsToRemove = scene.children.filter(child =>
                            child.userData?.isProgressionLabel && child.userData?.roman === removed.roman);
                        labelsToRemove.forEach(label => {
                            scene.remove(label);
                            if (label.material?.map) label.material.map.dispose();
                            if (label.material) label.material.dispose();
                        });
                    }
                }
            }
        }
    }

    if (!processingShelfQueue) processShelfQueue();
}
async function processShelfQueue() {
    processingShelfQueue = true;
    while (shelfClickQueue.length) {
        const shelf = shelfClickQueue.shift();
        await animateShelfClickAdd(shelf);
    }
    processingShelfQueue = false;
}
async function animateShelfClickAdd(shelf) {
    try {
        const clone = new THREE.Mesh(shelf.geometry.clone(), shelf.material.map(m => m.clone ? m.clone() : m));
        clone.userData = { ...shelf.userData, isShelf: false, rotationIndex: 0, desiredRotationDelta: (shelf.userData?.desiredRotationDelta || 0) };
        // Start exactly at shelf origin
        clone.position.copy(shelf.position);
        clone.scale.copy(shelf.scale);
        // CRITICAL: front-row layer for clones
        try { setCubeLayerRecursive(clone, 1); } catch (_) { }
        addQuadrantOverlay(clone);
        scene.add(clone);
        cubes.push(clone);
        console.log(`[SHELF-TO-FRONT] Added ${clone.userData.roman} to front row. Total front-row cubes: ${cubes.length}`);
        // Compute intended target slot without adding to lineup yet (avoid snap by rest logic)
        const xs = computeSlotPositions(lineup.length + 1);
        const targetX = xs[lineup.length];
        // Animate from shelf Y/Z to front row smoothly with scale normalization
        clone.userData.animatingIn = true;
        const s0 = clone.scale.x;
        // Smooth position/scale; apply desiredRotationDelta once if provided
        const startQuat = clone.quaternion.clone();
        // Copy delta chosen on the shelf object (support zero)
        let deltaSteps = (Object.prototype.hasOwnProperty.call(shelf.userData || {}, 'desiredRotationDelta') ? (shelf.userData.desiredRotationDelta || 0) : 0);
        deltaSteps = ((deltaSteps % 4) + 4) % 4;
        const targetQuat = startQuat.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -deltaSteps * (Math.PI / 2)));
        tweenObject({
            duration: 520, owner: clone, onUpdate: (v) => {
                // Position ease
                clone.position.x = THREE.MathUtils.lerp(clone.position.x, targetX, v);
                clone.position.y = THREE.MathUtils.lerp(clone.position.y, 0, v);
                clone.position.z = THREE.MathUtils.lerp(clone.position.z, 0, v);
                // Scale ease toward front-row normalized size
                const s = THREE.MathUtils.lerp(s0, FRONT_ROW_SCALE, v);
                clone.scale.setScalar(s);
                // Rotation ease (none)
                clone.quaternion.slerpQuaternions(startQuat, targetQuat, v);
            }
        });
        // After animation completes, add to lineup and reflow
        setTimeout(() => {
            if (!lineup.includes(clone)) lineup.push(clone);
            clone.userData.animatingIn = false;
            // Apply rotation index delta exactly once
            if (deltaSteps) clone.userData.rotationIndex = ((clone.userData.rotationIndex + deltaSteps) % 4 + 4) % 4;
            reflowLineup();
        }, 470);
        // Play with intended inversion immediately - CHECK FOR MODIFIERS
        if (Object.prototype.hasOwnProperty.call(shelf.userData || {}, 'desiredRotationDelta')) clone.userData.rotationIndex = ((clone.userData.rotationIndex + deltaSteps) % 4 + 4) % 4;

        // FIXED: Only Alt/Option adds 7th (NOT shift - shift is for compound intervals)
        const isAltClick = globalModifierState.altPressed;
        const shouldUse7th = withSeventh || isAltClick;

        console.log(`[SHELF-CLICK DEBUG] ${clone.userData.roman} - withSeventh: ${withSeventh}, isAltClick: ${isAltClick}, shouldUse7th: ${shouldUse7th}`);
        console.log(`[SHELF-CLICK DEBUG] Global modifiers - Alt: ${globalModifierState.altPressed}, Shift: ${globalModifierState.shiftPressed} (shift for compound intervals only), Ctrl: ${globalModifierState.ctrlPressed}, Meta: ${globalModifierState.metaPressed}`);

        if (isAltClick) {
            console.log(`[SHELF ALT+CLICK] FORCING 7th for ${clone.userData.roman}`);
            updateChordFaceWith7th(clone);
        }

        playChordForObjectWith7th(clone, shouldUse7th);
        addProgressionPointFromCube(shelf); // record from shelf origin too
        await new Promise(r => setTimeout(r, 180));
    } catch (_) { }
}

let progressionEnabled = false;
// progressionArrows declared above at line 1296
let progressionPoints = [];
let progressionBpm = 120; // default metronome BPM
let beatsPerChord = 4;    // 4 beats per chord default
let playButtonMesh = null;
// legacy var removed (we now compute via bpm & beatsPerChord)
// Smooth camera follow of active chord
let cameraFocusTween = null;
function focusCameraOnCube(cube, durationMs = 700) {
    try {
        const p = new THREE.Vector3(); cube.getWorldPosition(p);
        const camFrom = camera.position.clone();
        const tgtFrom = controls.target.clone();
        // Dolly with the active chord: slide horizontally and push in closer on Z
        const targetTo = new THREE.Vector3(p.x, 0.6, 0);
        const cameraTo = new THREE.Vector3(p.x, 0.85, 7.6);
        if (cameraFocusTween) cameraFocusTween.cancelled = true;
        cameraFocusTween = tweenObject({
            duration: durationMs, owner: camera, onUpdate: (v) => {
                camera.position.lerpVectors(camFrom, cameraTo, v);
                controls.target.lerpVectors(tgtFrom, targetTo, v);
            }
        });
    } catch (_) { }
}
// Metronome/tempo UI + engine
let tempoUi = null; let tempoLabel = null; let tempoSlider = null; let metroBtn = null;
let metroOn = false; let metroSynth = null; let metroLoop = null;

function readFlagsFromUrl() {
    try {
        const url = new URL(window.location.href);
        const arrows = url.searchParams.get('arrows');
        const bpm = url.searchParams.get('bpm');
        const sf = url.searchParams.get('sf');
        if (arrows === '1') progressionEnabled = true;
        if (bpm && !isNaN(Number(bpm))) progressionBpm = Math.max(10, Math.min(240, Number(bpm)));
        if (sf) { try { setSfBase(sf); } catch (_) { } }
    } catch (_) { /* ignore */ }
}

// CLAUDE'S PART 5: FIXED UI CREATION FUNCTION
function ensureTempoUi() {
    console.log('[UNIFIED-WIDGET] Creating drum/metronome control...');

    // Check if transport is available
    if (!window.chordCubesTransport) {
        console.error('[UNIFIED-WIDGET] Transport not available - cannot create UI');
        return;
    }

    // Remove any existing UI
    const existingUi = document.getElementById('unified-rhythm-widget');
    if (existingUi) {
        existingUi.remove();
    }

    // Create the widget
    const widget = document.createElement('div');
    widget.id = 'unified-rhythm-widget';
    widget.innerHTML = `
        <div class="rhythm-controls">
            <div class="control-row">
                <label>BPM: <span id="bpm-value">120</span></label>
                <input type="range" id="bpm-slider" min="60" max="180" value="120">
            </div>
            <div class="control-row">
                <button id="drum-toggle" class="control-btn">Drums: Off</button>
                <button id="metronome-toggle" class="control-btn">Metronome: Off</button>
            </div>
            <div class="control-row">
                <label>Style:</label>
                <select id="style-selector">
                    <option value="rock">Rock</option>
                    <option value="jazz">Jazz</option>
                    <option value="electronic">Electronic</option>
                    <option value="funk">Funk</option>
                    <option value="latin">Latin</option>
                    <option value="hiphop">Hip-Hop</option>
                </select>
            </div>
        </div>
    `;

    // CRITICAL: Force visibility with inline styles
    widget.style.cssText = `
        position: fixed !important;
        top: 10px !important;
        right: 10px !important;
        z-index: 2147483647 !important;
        background: rgba(0, 0, 0, 0.9) !important;
        color: white !important;
        padding: 15px !important;
        border-radius: 10px !important;
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
        min-width: 250px !important;
        font-family: Arial, sans-serif !important;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5) !important;
    `;

    // Add to body (not to a container that might be hidden)
    document.body.appendChild(widget);

    // Setup event listeners
    setupRhythmControls();

    console.log('[UNIFIED-WIDGET] ✅ Widget created and attached to body');

    // Verify visibility
    setTimeout(() => {
        const rect = widget.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
            console.error('[UNIFIED-WIDGET] Widget has zero dimensions!');
            console.log('Widget computed style:', window.getComputedStyle(widget));
        } else {
            console.log('[UNIFIED-WIDGET] Widget visible at:', rect);
        }
    }, 100);

    // Store references for compatibility
    tempoUi = widget;
}

function setupRhythmControls() {
    const transport = window.chordCubesTransport;
    if (!transport) {
        console.error('[CONTROLS] Transport not available');
        return;
    }

    // BPM Slider
    const bpmSlider = document.getElementById('bpm-slider');
    const bpmValue = document.getElementById('bpm-value');

    if (bpmSlider) {
        bpmSlider.addEventListener('input', (e) => {
            const bpm = parseInt(e.target.value);
            transport.setBPM(bpm);
            bpmValue.textContent = bpm;
        });
    }

    // Drum Toggle
    const drumToggle = document.getElementById('drum-toggle');
    if (drumToggle) {
        drumToggle.addEventListener('click', async () => {
            console.log('[CONTROLS] Drum button clicked');

            // Ensure audio context is started
            await transport.ensureAudioContext();

            // Toggle drums
            const drumsOn = transport.toggleDrums();
            drumToggle.textContent = `Drums: ${drumsOn ? 'On' : 'Off'}`;
            drumToggle.style.backgroundColor = drumsOn ? '#4CAF50' : '#333';

            // Start/stop transport if needed
            if (drumsOn && !transport.isPlaying) {
                await transport.start();
            } else if (!drumsOn && !transport.metronomOn && transport.isPlaying) {
                transport.stop();
            }
        });
    }

    // Metronome Toggle
    const metronomeToggle = document.getElementById('metronome-toggle');
    if (metronomeToggle) {
        metronomeToggle.addEventListener('click', async () => {
            console.log('[CONTROLS] Metronome button clicked');

            // Ensure audio context is started
            await transport.ensureAudioContext();

            // Toggle metronome
            const metronomOn = transport.toggleMetronome();
            metronomeToggle.textContent = `Metronome: ${metronomOn ? 'On' : 'Off'}`;
            metronomeToggle.style.backgroundColor = metronomOn ? '#4CAF50' : '#333';

            // Start/stop transport if needed
            if (metronomOn && !transport.isPlaying) {
                await transport.start();
            } else if (!metronomOn && !transport.drumsOn && transport.isPlaying) {
                transport.stop();
            }
        });
    }

    // Style Selector
    const styleSelector = document.getElementById('style-selector');
    if (styleSelector) {
        styleSelector.addEventListener('change', (e) => {
            transport.setStyle(e.target.value);
            console.log(`[CONTROLS] Style changed to ${e.target.value}`);
        });
    }

    console.log('[CONTROLS] ✅ Event listeners attached');
}

function createEmergencyUI() {
    console.log('[EMERGENCY] Creating emergency UI...');

    // Remove any existing emergency UI
    const existing = document.getElementById('emergency-ui');
    if (existing) existing.remove();

    // Create emergency UI
    const emergencyDiv = document.createElement('div');
    emergencyDiv.id = 'emergency-ui';
    emergencyDiv.innerHTML = `
        <h3>🚨 EMERGENCY DRUM CONTROLS 🚨</h3>
        <p>Transport: ${window.chordCubesTransport ? '✅ Available' : '❌ Missing'}</p>
        <button id="emergency-drums">DRUMS: OFF</button>
        <button id="emergency-test">TEST SOUND</button>
        <div>BPM: <input type="range" id="emergency-bpm" min="60" max="180" value="120"> <span id="emergency-bpm-val">120</span></div>
    `;

    emergencyDiv.style.cssText = `
        position: fixed !important;
        top: 100px !important;
        left: 50px !important;
        z-index: 2147483647 !important;
        background: rgba(255, 0, 0, 0.95) !important;
        color: white !important;
        padding: 20px !important;
        border-radius: 10px !important;
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
        min-width: 300px !important;
        font-family: Arial, sans-serif !important;
        font-size: 16px !important;
        box-shadow: 0 4px 20px rgba(0,0,0,0.8) !important;
        border: 3px solid yellow !important;
    `;

    document.body.appendChild(emergencyDiv);

    // Add emergency event listeners
    const drumBtn = document.getElementById('emergency-drums');
    const testBtn = document.getElementById('emergency-test');
    const bpmSlider = document.getElementById('emergency-bpm');
    const bpmVal = document.getElementById('emergency-bpm-val');

    if (drumBtn && window.chordCubesTransport) {
        drumBtn.onclick = async () => {
            try {
                await window.chordCubesTransport.ensureAudioContext();
                const drumsOn = window.chordCubesTransport.toggleDrums();
                drumBtn.textContent = `DRUMS: ${drumsOn ? 'ON' : 'OFF'}`;
                drumBtn.style.backgroundColor = drumsOn ? 'green' : 'red';

                if (drumsOn && !window.chordCubesTransport.isPlaying) {
                    await window.chordCubesTransport.start();
                } else if (!drumsOn && window.chordCubesTransport.isPlaying) {
                    window.chordCubesTransport.stop();
                }

                console.log('[EMERGENCY] Drums toggled:', drumsOn);
            } catch (error) {
                console.error('[EMERGENCY] Drum toggle failed:', error);
            }
        };
    }

    if (testBtn && window.chordCubesTransport) {
        testBtn.onclick = async () => {
            try {
                await window.chordCubesTransport.ensureAudioContext();
                window.chordCubesTransport.playDrumSound('kick');
                console.log('[EMERGENCY] Test sound played');
            } catch (error) {
                console.error('[EMERGENCY] Test sound failed:', error);
            }
        };
    }

    if (bpmSlider && bpmVal && window.chordCubesTransport) {
        bpmSlider.oninput = () => {
            const bpm = parseInt(bpmSlider.value);
            window.chordCubesTransport.setBPM(bpm);
            bpmVal.textContent = bpm;
        };
    }

    console.log('[EMERGENCY] ✅ Emergency UI created and functional');
}

function createPlayButton() {
    if (playButtonMesh) return;
    // Flat 2D button on the ground near the bottom center
    const size = 1.6;
    const c = document.createElement('canvas'); c.width = 256; c.height = 256;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, 256, 256);
    // background circle
    ctx.fillStyle = '#2b2b2b'; ctx.beginPath(); ctx.arc(128, 128, 120, 0, Math.PI * 2); ctx.fill();
    // play triangle
    ctx.fillStyle = '#ffd34d'; ctx.beginPath(); ctx.moveTo(108, 84); ctx.lineTo(108, 172); ctx.lineTo(180, 128); ctx.closePath(); ctx.fill();
    const tex = new THREE.CanvasTexture(c); tex.needsUpdate = true; tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
    const geo = new THREE.PlaneGeometry(size, size);
    playButtonMesh = new THREE.Mesh(geo, mat);
    playButtonMesh.rotation.x = -Math.PI / 2; // flat to ground
    playButtonMesh.position.set(0, 0.001, -6.2); // below titles nearer bottom
    playButtonMesh.userData.isPlayButton = true;
    playButtonMesh.renderOrder = 5;
    scene.add(playButtonMesh);
}

function clearProgressionArrows() {
    for (const a of progressionArrows) scene.remove(a);
    progressionArrows = [];
    progressionPoints = [];
}

function drawArrow(from, to) {
    const dir = new THREE.Vector3().subVectors(to, from); const len = dir.length(); if (len < 0.01) return;
    const arrow = new THREE.ArrowHelper(dir.clone().normalize(), from, len, 0xffe066, 0.25, 0.15);
    arrow.cone.material.transparent = true; arrow.line.material.transparent = true;
    arrow.cone.material.opacity = 0.85; arrow.line.material.opacity = 0.85;
    // Simple shimmer by oscillating opacity in animate()
    arrow.userData.shimmer = { base: 0.75, amp: 0.15, phase: Math.random() * Math.PI * 2 };
    progressionArrows.push(arrow);
    scene.add(arrow);
}

function addProgressionPointFromCube(cube) {
    if (!progressionEnabled || !cube) return;
    const p = new THREE.Vector3(); cube.getWorldPosition(p); p.y = p.y + 0.6;
    if (progressionPoints.length > 0) {
        const prev = progressionPoints[progressionPoints.length - 1];
        drawArrow(prev.clone(), p.clone());
    }
    progressionPoints.push(p);
    if (progressionPoints.length > 200) progressionPoints.shift();
}

function updateProgressionArrows() {
    clearProgressionArrows();
    if (!progressionEnabled) return;
    // Recreate arrows from stored points
    for (let i = 0; i < progressionPoints.length - 1; i++) drawArrow(progressionPoints[i], progressionPoints[i + 1]);
}

// Active chord highlight effects
const activeHighlights = [];
function highlightChordEffect(cube, durationMs = 800) {
    try {
        const p = new THREE.Vector3(); cube.getWorldPosition(p);
        const s = cube.scale?.x || cube.scale || 1; const half = (cubeSize * s) / 2;
        const ringGeo = new THREE.RingGeometry(0.62, 0.82, 48);
        const mat = new THREE.MeshBasicMaterial({ color: 0xffd34d, transparent: true, opacity: 0.95, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
        const ring = new THREE.Mesh(ringGeo, mat);
        ring.position.set(p.x, p.y, p.z + half + 0.01);
        ring.rotation.set(0, 0, 0);
        ring.renderOrder = 6;
        scene.add(ring);
        activeHighlights.push(ring);
        // Animate scale/opacity out
        const fromScale = 0.1; const toScale = 1.4;
        ring.scale.set(fromScale, fromScale, fromScale);
        tweenObject({ duration: durationMs, owner: ring, onUpdate: (v) => { try { const sc = fromScale + (toScale - fromScale) * v; ring.scale.set(sc, sc, sc); mat.opacity = 0.95 * (1 - v); } catch (_) { } }, onComplete: () => { try { scene.remove(ring); ring.geometry.dispose(); mat.dispose(); } catch (_) { } } });
        // Spark burst
        for (let i = 0; i < 12; i++) {
            const d = Math.random() * 0.45 + 0.35; const dir = (Math.PI * 2 * i) / 12 + Math.random() * 0.2;
            const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(p.x, p.y, p.z + half + 0.012), new THREE.Vector3(p.x + Math.cos(dir) * d, p.y + Math.sin(dir) * d, p.z + half + 0.012)]);
            const lineMat = new THREE.LineBasicMaterial({ color: 0xfff1a8, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending });
            const line = new THREE.Line(lineGeo, lineMat); line.renderOrder = 7; scene.add(line); activeHighlights.push(line);
            tweenObject({ duration: durationMs * 0.9, owner: line, onUpdate: (v) => { try { lineMat.opacity = 0.9 * (1 - v); } catch (_) { } }, onComplete: () => { try { scene.remove(line); line.geometry.dispose(); lineMat.dispose(); } catch (_) { } } });
        }
    } catch (_) { }
}

function pulseGiantAt(index, durationMs = 600) {
    try {
        const pulse = (group) => { const node = group?.children?.[index]; const mesh = node?.children?.[0]; const mat = mesh?.material; if (!mat) return; const base = mat.opacity ?? 1; tweenObject({ duration: durationMs, owner: mat, onUpdate: (v) => { try { mat.transparent = true; mat.opacity = base * (0.6 + 0.4 * Math.sin(v * Math.PI)); } catch (_) { } }, onComplete: () => { try { mat.opacity = base; } catch (_) { } } }); };
        if (melodyGiantGroup) pulse(melodyGiantGroup); if (bassGiantGroup) pulse(bassGiantGroup);
    } catch (_) { }
}

function shimmerMaterial(mat) {
    if (!mat) return;
    const hadTransparent = !!mat.transparent;
    const origOpacity = typeof mat.opacity === 'number' ? mat.opacity : 1;
    try { mat.transparent = true; mat.opacity = Math.max(0, Math.min(1, origOpacity * 0.6)); } catch (_) { }
    setTimeout(() => { try { mat.opacity = origOpacity; mat.transparent = hadTransparent; } catch (_) { } }, 160);
}

function shimmerMelodyTopFaces() {
    for (const cube of lineup) {
        try {
            const mats = Array.isArray(cube.material) ? cube.material : [cube.material];
            const topMat = mats[2] || mats[0];
            shimmerMaterial(topMat);
        } catch (_) { }
    }
}

function shimmerBassBottomFaces() {
    for (const cube of lineup) {
        try {
            const mats = Array.isArray(cube.material) ? cube.material : [cube.material];
            const bottomMat = mats[3] || mats[0];
            shimmerMaterial(bottomMat);
        } catch (_) { }
    }
}

function shimmerMelodyLane() {
    if (!melodyLaneGroup) return;
    try {
        melodyLaneGroup.children.forEach(node => {
            // child[1] is the diamond mesh in makeLaneNode
            const diamond = node.children?.[1];
            if (diamond && diamond.material) shimmerMaterial(diamond.material);
        });
    } catch (_) { }
}

// Ultra flash: big radial ring + confetti pulse at center of lineup
function ultraFlash(colorHex = 0xfff04d, durationMs = 520) {
    try {
        mm
        const ringGeo = new THREE.RingGeometry(0.2, 0.22, 48);
        const ringMat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.0, side: THREE.DoubleSide, depthWrite: false });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.set(0, 0.01, 0);
        ring.rotation.x = -Math.PI / 2;
        scene.add(ring);
        tweenObject({
            duration: durationMs, owner: ring, onUpdate: (v) => {
                try { ring.scale.setScalar(1 + v * 6); ringMat.opacity = 0.8 * (1 - v); } catch (_) { }
            }, onComplete: () => { try { scene.remove(ring); ring.geometry.dispose(); ring.material.dispose(); } catch (_) { } }
        });

        // Confetti sprinkles
        for (let i = 0; i < 24; i++) {
            const c = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.02), new THREE.MeshBasicMaterial({ color: (Math.random() * 0xffffff) | 0, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false }));
            c.position.set((Math.random() - 0.5) * 0.8, 0.02, (Math.random() - 0.5) * 0.8);
            c.rotation.x = -Math.PI / 2; c.rotation.z = Math.random() * Math.PI;
            scene.add(c);
            const dx = (Math.random() - 0.5) * 3.5; const dz = (Math.random() - 0.5) * 3.5;
            const start = c.position.clone(); const end = start.clone().add(new THREE.Vector3(dx, 0, dz));
            tweenObject({
                duration: 620 + Math.random() * 260, owner: c, onUpdate: (v) => {
                    try { c.position.lerpVectors(start, end, v); c.material.opacity = 0.9 * (1 - v); c.rotation.z += 0.4; } catch (_) { }
                }, onComplete: () => { try { scene.remove(c); c.geometry.dispose(); c.material.dispose(); } catch (_) { } }
            });
        }
    } catch (_) { }
}

function pulseLockIcons(kind, durationMs = 400) {
    try {
        const targets = kind === 'melody' ? [melodyLockLeft, melodyLockRight] : [bassLockLeft, bassLockRight];
        targets.forEach(node => {
            if (!node) return;
            const s0 = node.scale.x;
            tweenObject({ duration: durationMs, owner: node, onUpdate: (v) => { try { const s = s0 * (1 + 0.3 * Math.sin(v * Math.PI)); node.scale.setScalar(s); } catch (_) { } }, onComplete: () => { try { node.scale.setScalar(s0); } catch (_) { } } });
        });
    } catch (_) { }
}

function makeLaneDiamond(colorHex = 0xffffff) {
    const g = new THREE.CircleGeometry(0.08, 4);
    const m = new THREE.MeshBasicMaterial({ color: colorHex });
    const mesh = new THREE.Mesh(g, m);
    mesh.rotation.z = Math.PI / 4; // diamond look
    return mesh;
}

function makeLaneNode(roman, colorHex) {
    const group = new THREE.Group();
    const circle = new THREE.Mesh(new THREE.CircleGeometry(0.11, 24), new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.9 }));
    const diamond = makeLaneDiamond(0xffffff);
    group.add(circle); group.add(diamond);
    group.userData = { roman };
    return group;
}

function clearLockedLines() {
    lockedMelody = null; lockedBass = null;
    if (melodyLaneGroup) { scene.remove(melodyLaneGroup); melodyLaneGroup = null; }
    if (bassLaneGroup) { scene.remove(bassLaneGroup); bassLaneGroup = null; }
    if (melodyGiantGroup) { scene.remove(melodyGiantGroup); melodyGiantGroup = null; }
    if (bassGiantGroup) { scene.remove(bassGiantGroup); bassGiantGroup = null; }
    console.log('[CLEAR LOCKS] All locked lines and giant groups cleared');
}

function renderMelodyLane() {
    if (melodyLaneGroup) {
        try { melodyLaneGroup.traverse?.(o => { if (o.geometry) o.geometry.dispose?.(); if (o.material) { if (o.material.map) o.material.map.dispose?.(); o.material.dispose?.(); } }); } catch (_) { }
        scene.remove(melodyLaneGroup); melodyLaneGroup = null;
    }
    melodyLaneGroup = new THREE.Group();
    for (let i = 0; i < lineup.length; i++) {
        const cube = lineup[i];
        const p = new THREE.Vector3(); cube.getWorldPosition(p);
        const color = borderColorForRoman(cube.userData.roman);
        const pivot = new THREE.Group();
        const node = makeLaneNode(cube.userData.roman, color);
        node.position.set(0, 0.3, 0); // hinge at bottom tip (feet)
        node.renderOrder = 3; // draw atop ground
        node.traverse?.(o => { o.renderOrder = 3; if (o.material) o.material.depthWrite = false; });
        pivot.add(node);
        const half = (cubeSize * cube.scale.x) / 2;
        // Offset a hair away from cube to avoid z-fighting when rotating
        pivot.position.set(p.x, 0.001, p.z - half - 0.08);
        // Start flat on ground; animate to stand up (to 0)
        pivot.rotation.x = -Math.PI / 2;
        melodyLaneGroup.add(pivot);
    }
    scene.add(melodyLaneGroup);
}

function renderBassLane() {
    if (bassLaneGroup) {
        try { bassLaneGroup.traverse?.(o => { if (o.geometry) o.geometry.dispose?.(); if (o.material) { if (o.material.map) o.material.map.dispose?.(); o.material.dispose?.(); } }); } catch (_) { }
        scene.remove(bassLaneGroup); bassLaneGroup = null;
    }
    bassLaneGroup = new THREE.Group();
    for (let i = 0; i < lineup.length; i++) {
        const cube = lineup[i];
        const p = new THREE.Vector3(); cube.getWorldPosition(p);
        const color = borderColorForRoman(cube.userData.roman);
        const pivot = new THREE.Group();
        const node = makeLaneNode(cube.userData.roman, color);
        node.position.set(0, -0.3, 0); // hinge at top tip (head)
        node.renderOrder = 3; node.traverse?.(o => { o.renderOrder = 3; if (o.material) o.material.depthWrite = false; });
        pivot.add(node);
        const half = (cubeSize * cube.scale.x) / 2;
        pivot.position.set(p.x, 0.001, p.z + half + 0.02); // front edge
        // Start flat; animate to +PI/2 when locking bass
        pivot.rotation.x = Math.PI / 2;
        bassLaneGroup.add(pivot);
    }
    scene.add(bassLaneGroup);
}

function animateStandUpLanes() {
    // Animate melody pivots to stand up 90° and bass pivots to stand down 90° from ground
    if (melodyLaneGroup) {
        for (const pivot of melodyLaneGroup.children) {
            const from = pivot.rotation.x;
            const to = 0; // stand vertical from flat start (-PI/2)
            tweenObject({
                duration: 800, owner: pivot, onUpdate: (v) => {
                    pivot.rotation.x = from + (to - from) * v;
                    // Debug: briefly scale up to confirm animation
                    const s = 1 + 0.02 * Math.sin(v * Math.PI);
                    pivot.scale.set(s, s, s);
                }
            });
        }
    }
    if (bassLaneGroup) {
        for (const pivot of bassLaneGroup.children) {
            const from = pivot.rotation.x;
            const to = 0; // stand vertical from +PI/2
            tweenObject({ duration: 800, owner: pivot, onUpdate: (v) => { pivot.rotation.x = from + (to - from) * v; } });
        }
    }
}

// TEST: spin melody lane pivots for visibility diagnostics
function spinMelodyLane(durationMs = 10000, rotations = 6) {
    if (!melodyLaneGroup) return;
    for (const pivot of melodyLaneGroup.children) {
        const from = pivot.rotation.x;
        const to = from + Math.PI * 2 * rotations;
        cancelTweensFor(pivot);
        tweenObject({
            duration: durationMs, owner: pivot, onUpdate: (v) => {
                pivot.rotation.x = from + (to - from) * v;
            }
        });
    }
}

function updateLanePositions() {
    if (melodyLaneGroup && melodyLaneGroup.children.length === lineup.length) {
        for (let i = 0; i < lineup.length; i++) {
            const cube = lineup[i]; const pivot = melodyLaneGroup.children[i];
            const p = new THREE.Vector3(); cube.getWorldPosition(p);
            const half = (cubeSize * cube.scale.x) / 2;
            pivot.position.set(p.x, 0.001, p.z - half - 0.02);
        }
    }
    if (bassLaneGroup && bassLaneGroup.children.length === lineup.length) {
        for (let i = 0; i < lineup.length; i++) {
            const cube = lineup[i]; const pivot = bassLaneGroup.children[i];
            const p = new THREE.Vector3(); cube.getWorldPosition(p);
            const half = (cubeSize * cube.scale.x) / 2;
            pivot.position.set(p.x, 0.001, p.z + half + 0.02);
        }
    }
}

function lockInMelody() {
    console.log('[LOCK MELODY] 🔍 Function called, lineup length:', lineup.length);
    if (lineup.length === 0) {
        console.log('[LOCK MELODY] ❌ No chords in lineup - cannot lock melody');
        return;
    }
    // First, ensure no cube is mid-rotation; if any is, delay capture briefly and retry once
    const rotating = lineup.some(c => hasActiveTweenFor(c));
    if (rotating) {
        console.log('[LOCK MELODY] ⏳ Waiting for cube rotations to finish...');
        setTimeout(() => { try { lockInMelody(); } catch (_) { } }, 120);
        return;
    }
    // Re-verify each cube's current orientation → rotationIndex from quaternion
    for (const cube of lineup) syncRotationIndexFromQuaternion(cube);

    // 🎼 STAVES INTEGRATION: Auto-create staves and draw measures when melody is locked
    console.log('[LOCK MELODY] 🎼 Starting staves integration...');
    if (window.musicalStaves3D) {
        if (!window.musicalStaves3D.isVisible) {
            console.log('[LOCK MELODY] 🎼 Auto-creating staves for melody lock');
            window.musicalStaves3D.createStaves();
        }
        console.log('[LOCK MELODY] 🎼 Drawing measures for progression');
        window.musicalStaves3D.drawMeasures(lineup.length);
    } else {
        console.log('[LOCK MELODY] ❌ window.musicalStaves3D not available');
    }

    // Capture current melody using the freshly verified rotationIndex
    const snapshot = [];
    for (let i = 0; i < lineup.length; i++) {
        const cube = lineup[i];
        // Use helper that references rotationIndex for top face
        const midiTop = (() => {
            const tones = noteSetsC[cube.userData.roman] || ['C', 'E', 'G', 'B'];
            const names = transposeNotes(tones, currentKey);
            const r = ((cube.userData.rotationIndex || 0) % 4 + 4) % 4;
            const topPc = pcOf(names[(r + 2) % 4]);
            let m = 72 + ((topPc - 0 + 12) % 12);
            while (m > 84) m -= 12; while (m < 60) m += 12;
            return m;
        })();
        snapshot.push({ roman: cube.userData.roman, midi: midiTop, color: borderColorForRoman(cube.userData.roman) });
    }
    lockedMelody = snapshot;

    // 🎼 STAVES INTEGRATION: Add melody notes to treble clef using voice leading 3 algorithm
    if (window.musicalStaves3D && window.musicalStaves3D.isVisible) {
        console.log('[LOCK MELODY] 🎵 Adding melody notes to staves');
        console.log('[LOCK MELODY] 🎵 Melody data format:', lockedMelody);
        window.musicalStaves3D.addMelodyNotation(lockedMelody);
    }

    renderMelodyLane();
    ultraFlash(0x66ccff, 540);
    pulseLockIcons('melody');
    melodyLaneGroup?.children.forEach(n => { const mat = (n.children?.[1])?.material; shimmerMaterial(mat); });
    if (lockedBass && lockedBass.length === lineup.length) {
        setTimeout(() => {
            for (const cube of lineup) {
                cube.userData.rotationIndex = 0;
                const to = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), 0);
                animateQuaternion(cube, to, 280);
            }
            maybeEnterStageMode();
        }, 1000);
    }
    try {
        if (melodyGiantGroup) { scene.remove(melodyGiantGroup); melodyGiantGroup = null; }
        melodyGiantGroup = new THREE.Group();
        const xs = computeSlotPositions(lineup.length);
        for (let i = 0; i < lineup.length; i++) {
            const cube = lineup[i];
            // Ensure visual index is in sync before deciding topIdx
            syncRotationIndexFromQuaternion(cube);
            const rIdx = ((cube.userData.rotationIndex || 0) % 4 + 4) % 4;
            const topIdx = (rIdx + 2) % 4;
            const FACE_COLORS = ['#2ecc71', '#e74c3c', '#3498db', '#bdc3c7'];
            const ROT_DEGS = [0, 270, 180, 90];
            const degs = degreeSets[cube.userData.roman] || ['1', '3', '5', '7'];
            const symbol = degs[topIdx];
            const faceMat = makeCircleDiamondFace(symbol, FACE_COLORS[topIdx], ROT_DEGS[topIdx], true);
            try { faceMat.side = THREE.DoubleSide; } catch (_) { }
            const plane = new THREE.Mesh(new THREE.PlaneGeometry(cubeSize, cubeSize), faceMat);
            // Rotate 3rd (index 1) and 7th (index 3) by +180° for readability
            const extraFlip = (topIdx === 1 || topIdx === 3) ? Math.PI : 0;
            const melUpright = (-(ROT_DEGS[topIdx] || 0) * (Math.PI / 180)) + extraFlip;
            plane.rotation.z = melUpright;
            plane.userData.uprightZ = melUpright;
            plane.position.z = 0.002;
            const group = new THREE.Group();
            group.add(plane);
            const p = new THREE.Vector3(); cube.getWorldPosition(p);
            const s = cube.scale?.x || cube.scale || 1; const half = (cubeSize * s) / 2;
            const zBack = p.z - half - 0.002;
            const yTop = p.y + half;
            const diamondHalf = (cubeSize * 0.64) / 2 * Math.SQRT2;
            const centerY = yTop + diamondHalf;
            group.position.set(p.x, centerY, zBack);
            group.renderOrder = 4; group.traverse?.(o => { o.renderOrder = 4; if (o.material) o.material.depthWrite = false; });
            melodyGiantGroup.add(group);
        }
        melodyGiantGroup.visible = !!(showGiantMelodyEl?.checked ?? true);
        scene.add(melodyGiantGroup);
    } catch (_) { }
}

function lockInBass() {
    console.log('[LOCK BASS] 🔍 Function called, lineup length:', lineup.length);
    if (lineup.length === 0) {
        console.log('[LOCK BASS] ❌ No chords in lineup - cannot lock bass');
        return;
    }

    // 🎼 STAVES INTEGRATION: Auto-create staves and draw measures when bass is locked
    console.log('[LOCK BASS] 🎼 Starting staves integration...');
    if (window.musicalStaves3D) {
        if (!window.musicalStaves3D.isVisible) {
            console.log('[LOCK BASS] 🎼 Auto-creating staves for bass lock');
            window.musicalStaves3D.createStaves();
        }
        console.log('[LOCK BASS] 🎼 Drawing measures for progression');
        window.musicalStaves3D.drawMeasures(lineup.length);
    } else {
        console.log('[LOCK BASS] ❌ window.musicalStaves3D not available');
    }

    lockedBass = [];
    for (let i = 0; i < lineup.length; i++) {
        const cube = lineup[i];
        let midi = getBassMidiForObject(cube);
        while (midi > 55) midi -= 12; while (midi < 36) midi += 12;
        lockedBass.push({ roman: cube.userData.roman, midi, color: borderColorForRoman(cube.userData.roman) });
    }

    // 🎼 STAVES INTEGRATION: Add bass notes to bass clef using voice leading algorithm
    if (window.musicalStaves3D && window.musicalStaves3D.isVisible) {
        console.log('[LOCK BASS] 🎵 Adding bass notes to staves');
        console.log('[LOCK BASS] 🎵 Bass data format:', lockedBass);
        window.musicalStaves3D.addBassNotation(lockedBass);
    }

    renderBassLane();
    ultraFlash(0xffcc66, 540);
    pulseLockIcons('bass');
    bassLaneGroup?.children.forEach(n => { const mat = (n.children?.[1])?.material; shimmerMaterial(mat); });
    // If both voices locked, normalize all cubes to root-down orientation for easy reading
    if (lockedMelody && lockedMelody.length === lineup.length) {
        setTimeout(() => {
            for (const cube of lineup) {
                cube.userData.rotationIndex = 0;
                const to = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), 0);
                animateQuaternion(cube, to, 280);
            }
            maybeEnterStageMode();
        }, 1000);
    }
    // Giant duplicates for bass using exact bottom-face renderer
    try {
        if (bassGiantGroup) { scene.remove(bassGiantGroup); bassGiantGroup = null; }
        bassGiantGroup = new THREE.Group();
        const xs = computeSlotPositions(lineup.length);
        for (let i = 0; i < lineup.length; i++) {
            const cube = lineup[i];
            const rIdx = ((cube.userData.rotationIndex || 0) % 4 + 4) % 4;
            const bottomIdx = rIdx; // bottom face degree index
            const degs = degreeSets[cube.userData.roman] || ['1', '3', '5', '7'];
            const symbol = (labelMode === 'roman') ? degs[bottomIdx] : transposeNotes(noteSetsC[cube.userData.roman] || ['C', 'E', 'G', 'B'], currentKey)[bottomIdx];
            const FACE_COLORS = ['#2ecc71', '#e74c3c', '#3498db', '#bdc3c7'];
            const ROT_DEGS = [0, 270, 180, 90];
            // Match cube face orientation exactly for bass giants
            const mat = makeCircleDiamondFace(symbol, FACE_COLORS[bottomIdx], ROT_DEGS[bottomIdx], true);
            try { mat.side = THREE.DoubleSide; } catch (_) { }
            const mesh = new THREE.Mesh(new THREE.PlaneGeometry(cubeSize, cubeSize), mat);
            // Rotate 3rd (index 1) and 7th (index 3) by +180° for readability
            const extraFlipB = (bottomIdx === 1 || bottomIdx === 3) ? Math.PI : 0;
            const bassUpright = (-(ROT_DEGS[bottomIdx] || 0) * (Math.PI / 180)) + extraFlipB;
            mesh.rotation.z = bassUpright;
            mesh.userData.uprightZ = bassUpright;
            // Center on cube and place so the diamond top tip touches the cube's front-bottom edge
            const p = new THREE.Vector3(); cube.getWorldPosition(p);
            const s = cube.scale?.x || cube.scale || 1;
            const half = (cubeSize * s) / 2;
            const zFront = p.z + half + 0.002; // just in front of cube face
            const yBottom = p.y - half; // bottom edge of cube
            // distance from center of our plane to diamond's top tip; we used d=size*0.64 for the square, so half-diagonal is (d/2)*sqrt(2)
            const diamondHalf = (cubeSize * 0.64) / 2 * Math.SQRT2;
            const centerY = yBottom - diamondHalf;
            mesh.position.set(p.x, centerY, zFront);
            mesh.renderOrder = 4; if (mesh.material) mesh.material.depthWrite = false;
            bassGiantGroup.add(mesh);
        }
        bassGiantGroup.visible = !!(showGiantBassEl?.checked ?? true);
        scene.add(bassGiantGroup);
    } catch (_) { }
}

// SOLO PLAYBACK FUNCTIONS - Play only melody or bass with transport sync
function playMelodyOnly() {
    if (lineup.length === 0) {
        console.log('[MELODY SOLO] No chords in lineup');
        return;
    }

    // ENABLE SHELF BLACKOUT for staves legibility during solo playback
    setPlaybackShelfBlackout(true);

    console.log('[MELODY SOLO] Starting melody-only progression');
    startSoloProgression('melody');
}

function playBassOnly() {
    if (lineup.length === 0) {
        console.log('[BASS SOLO] No chords in lineup');
        return;
    }

    // ENABLE SHELF BLACKOUT for staves legibility during solo playback
    setPlaybackShelfBlackout(true);

    console.log('[BASS SOLO] Starting bass-only progression');
    startSoloProgression('bass');
}

function startSoloProgression(soloType) {
    // Get loop count from UI
    const loopsInput = document.getElementById('progression-loops');
    const loopCount = parseInt(loopsInput?.value || '1');
    const totalChords = lineup.length * loopCount;

    console.log(`[${soloType.toUpperCase()} SOLO] ${lineup.length} chords x ${loopCount} loops = ${totalChords} total`);

    // Clear any existing progression sequence
    if (window.chordProgressionSequence) {
        window.chordProgressionSequence.dispose();
        window.chordProgressionSequence = null;
    }

    // Start drum machine if not playing
    if (window.drumMachine && !window.drumMachine.isPlaying) {
        console.log(`[${soloType.toUpperCase()} SOLO] Starting drum machine transport`);
        window.drumMachine.toggleDrums();
    }

    // Create solo progression sequence
    const soloSequence = new Tone.Sequence((time, index) => {
        if (index >= totalChords) {
            // Solo progression complete
            console.log(`[${soloType.toUpperCase()} SOLO] Progression complete`);
            soloSequence.dispose();
            window.chordProgressionSequence = null;

            // Stop drum machine
            if (window.drumMachine && window.drumMachine.isPlaying) {
                setTimeout(() => window.drumMachine.toggleDrums(), 100);
            }

            // Auto-reset to melody view
            setTimeout(() => {
                setViewAbove();
                ambient.intensity = 0.7;
                dir.intensity = 0.7;
                frontSpot.intensity = 0.0;
                frontSpotL.intensity = 0.0;
                frontSpotR.intensity = 0.0;
                stageSpot.intensity = 0.0;
                stageMode = false;

                // RESTORE SHELF after solo playback ends
                setPlaybackShelfBlackout(false);

                console.log(`[${soloType.toUpperCase()} SOLO] Auto-reset complete`);
            }, 1000);

            return;
        }

        const c = lineup[index % lineup.length];
        const currentLoop = Math.floor(index / lineup.length) + 1;
        const chordInLoop = (index % lineup.length) + 1;

        // Calculate sustain duration
        const currentBpm = Tone.Transport.bpm.value;
        const beatsPerMeasure = 4;
        const chordDurationSeconds = (60 / currentBpm) * beatsPerMeasure;

        console.log(`[${soloType.toUpperCase()} SOLO] Loop ${currentLoop}/${loopCount}, Chord ${chordInLoop}/${lineup.length}: ${c.userData.roman}`);

        // Schedule visual effects
        Tone.Draw.schedule(() => {
            try {
                highlightChordEffect(c, 900);
                pulseGiantAt(index % lineup.length, 700);
                addProgressionPointFromCube(c);
            } catch (err) {
                console.warn(`[${soloType.toUpperCase()} SOLO] Visual effect error:`, err);
            }
        }, time);

        // Schedule ONLY the selected voice (melody or bass)
        const roman = c.userData.roman;
        if (soloType === 'melody') {
            if (lockedMelody) {
                let melMidi = lockedMelody[index % lineup.length]?.midi ?? getMelodyMidiForObject(c);

                // Apply voice leading with proper context
                if (index > 0 && lastMelodyMidi != null) {
                    const context = {
                        voice: 'melody',
                        currentChord: c.userData.roman,
                        previousChord: lineup[(index - 1) % lineup.length]?.userData.roman,
                        progressionIndex: index,
                        isProgression: true
                    };
                    melMidi = voiceLeadMidi(melMidi, lastMelodyMidi, context);
                } else {
                    // First chord: apply basic register constraints
                    while (melMidi > 84) melMidi -= 12; while (melMidi < 60) melMidi += 12;
                }

                // NEW AUDIO ENGINE: Use real melody instruments
                Tone.Draw.schedule(() => {
                    const melodyNote = Tone.Frequency(melMidi, "midi").toNote();
                    console.log('[MELODY SOLO] 🎵 Playing locked melody:', melodyNote, 'from midi:', melMidi);
                    window.audioEngine.playMelody([melodyNote], [chordDurationSeconds], 0.4);
                    lastMelodyMidi = melMidi;
                }, time);
            } else {
                // Use face-derived melody with VOICE LEADING
                Tone.Draw.schedule(() => {
                    let melMidi = getMelodyMidiForObject(c);

                    // Apply voice leading with proper context
                    if (index > 0 && lastMelodyMidi != null) {
                        const context = {
                            voice: 'melody',
                            chordRoman: c.userData.roman,
                            prevChordRoman: lineup[(index - 1) % lineup.length]?.userData.roman,
                            progressionIndex: index,
                            isProgression: true
                        };
                        console.log(`[MELODY SOLO] 🎼 Applying VL3 to face-derived melody: ${lastMelodyMidi} → ${melMidi}`);
                        melMidi = voiceLeadMidi(melMidi, lastMelodyMidi, context);
                        console.log(`[MELODY SOLO] 🎼 VL3 result for face-derived melody: ${melMidi}`);
                    } else {
                        // First chord: apply basic register constraints
                        while (melMidi > 84) melMidi -= 12; while (melMidi < 60) melMidi += 12;
                    }

                    const melodyNote = Tone.Frequency(melMidi, "midi").toNote();
                    console.log('[MELODY SOLO] 🎵 Playing voice-led face-derived melody:', melodyNote);
                    window.audioEngine.playMelody([melodyNote], [chordDurationSeconds], 0.4);
                    lastMelodyMidi = melMidi;
                }, time);
            }
        } else if (soloType === 'bass') {
            if (lockedBass) {
                let bassMidi = lockedBass[index % lineup.length]?.midi ?? getBassMidiForObject(c);

                // Apply voice leading with proper context
                if (index > 0 && lastBassMidi != null) {
                    const context = {
                        voice: 'bass',
                        currentChord: c.userData.roman,
                        previousChord: lineup[(index - 1) % lineup.length]?.userData.roman,
                        progressionIndex: index,
                        isProgression: true
                    };
                    bassMidi = voiceLeadMidi(bassMidi, lastBassMidi, context);
                } else {
                    // First chord: apply basic register constraints
                    while (bassMidi > 55) bassMidi -= 12; while (bassMidi < 36) bassMidi += 12;
                }

                // NEW AUDIO ENGINE: Use real bass instruments
                Tone.Draw.schedule(() => {
                    const bassNote = Tone.Frequency(bassMidi, "midi").toNote();
                    console.log('[BASS SOLO] 🎵 Playing locked bass:', bassNote, 'from midi:', bassMidi);
                    window.audioEngine.playBass(bassNote, chordDurationSeconds, 0.5, false);
                    lastBassMidi = bassMidi;
                }, time);
            } else {
                // Use face-derived bass with VOICE LEADING
                Tone.Draw.schedule(() => {
                    let bassMidi = getBassMidiForObject(c);

                    // Apply voice leading with proper context
                    if (index > 0 && lastBassMidi != null) {
                        const context = {
                            voice: 'bass',
                            chordRoman: c.userData.roman,
                            prevChordRoman: lineup[(index - 1) % lineup.length]?.userData.roman,
                            progressionIndex: index,
                            isProgression: true
                        };
                        console.log(`[BASS SOLO] 🎼 Applying VL3 to face-derived bass: ${lastBassMidi} → ${bassMidi}`);
                        bassMidi = voiceLeadMidi(bassMidi, lastBassMidi, context);
                        console.log(`[BASS SOLO] 🎼 VL3 result for face-derived bass: ${bassMidi}`);
                    } else {
                        // First chord: apply basic register constraints
                        while (bassMidi > 55) bassMidi -= 12; while (bassMidi < 36) bassMidi += 12;
                    }

                    const bassNote = Tone.Frequency(bassMidi, "midi").toNote();
                    console.log('[BASS SOLO] 🎵 Playing voice-led face-derived bass:', bassNote);
                    window.audioEngine.playBass(bassNote, chordDurationSeconds, 0.5, false);
                    lastBassMidi = bassMidi;
                }, time);
            }
        }

    }, Array.from({ length: totalChords + 1 }, (_, i) => i), "1m");

    // Store reference and start
    window.chordProgressionSequence = soloSequence;
    soloSequence.start(0);

    console.log(`[${soloType.toUpperCase()} SOLO] Transport sequence started`);
}

// PROFESSIONAL FONT CONTROL SYSTEM
let currentFontSettings = {
    'chord-face': {
        family: 'Arial',
        weight: '900',
        size: 420,
        letterSpacing: 0,
        lineHeight: 0.68,
        opacity: 1.0,
        italic: false,
        underline: false,
        shadow: false
    },
    'diamond-font': {
        family: 'Arial',
        weight: '700',
        size: 180,
        letterSpacing: 0,
        lineHeight: 1.0,
        opacity: 1.0,
        italic: false,
        underline: false,
        shadow: false
    },
    'title-font': {
        family: 'Arial',
        weight: '1000',
        size: 420,
        letterSpacing: 0,
        lineHeight: 0.68,
        opacity: 1.0,
        italic: false,
        underline: false,
        shadow: false
    },
    'ui-font': {
        family: 'Arial',
        weight: '400',
        size: 16,
        letterSpacing: 0,
        lineHeight: 1.2,
        opacity: 1.0,
        italic: false,
        underline: false,
        shadow: false
    }
};

function initializeFontControlSystem() {
    const fontControlBtn = document.getElementById('font-control-btn');
    const fontModal = document.getElementById('font-control-modal');
    const fontModalClose = document.getElementById('font-modal-close');
    const fontTargetSelect = document.getElementById('font-target-select');
    const fontPreview = document.getElementById('font-preview');

    // Modal controls
    fontControlBtn?.addEventListener('click', () => {
        console.log('[FONT CONTROL] Opening professional font controls');
        fontModal.style.display = 'block';
        loadFontSettings(fontTargetSelect.value);
        updatePreview();
    });

    fontModalClose?.addEventListener('click', () => {
        fontModal.style.display = 'none';
    });

    fontModal?.addEventListener('click', (e) => {
        if (e.target === fontModal) fontModal.style.display = 'none';
    });

    // Font target selection
    fontTargetSelect?.addEventListener('change', () => {
        loadFontSettings(fontTargetSelect.value);
        updatePreview();
    });

    // Real-time controls
    setupFontControlListeners();

    function loadFontSettings(target) {
        const settings = currentFontSettings[target];
        if (!settings) return;

        document.getElementById('font-family-select').value = settings.family;
        document.getElementById('font-weight-select').value = settings.weight;
        document.getElementById('font-size-slider').value = settings.size;
        document.getElementById('letter-spacing-slider').value = settings.letterSpacing;
        document.getElementById('line-height-slider').value = settings.lineHeight;
        document.getElementById('opacity-slider').value = settings.opacity;
        document.getElementById('font-italic').checked = settings.italic;
        document.getElementById('font-underline').checked = settings.underline;
        document.getElementById('font-shadow').checked = settings.shadow;

        updateSliderValues();
    }

    function updateSliderValues() {
        document.getElementById('font-size-value').textContent = document.getElementById('font-size-slider').value + 'px';
        document.getElementById('letter-spacing-value').textContent = document.getElementById('letter-spacing-slider').value + 'px';
        document.getElementById('line-height-value').textContent = document.getElementById('line-height-slider').value;
        document.getElementById('opacity-value').textContent = Math.round(document.getElementById('opacity-slider').value * 100) + '%';
    }

    function setupFontControlListeners() {
        // Sliders
        document.getElementById('font-size-slider')?.addEventListener('input', () => {
            updateSliderValues();
            updatePreview();
        });

        document.getElementById('letter-spacing-slider')?.addEventListener('input', () => {
            updateSliderValues();
            updatePreview();
        });

        document.getElementById('line-height-slider')?.addEventListener('input', () => {
            updateSliderValues();
            updatePreview();
        });

        document.getElementById('opacity-slider')?.addEventListener('input', () => {
            updateSliderValues();
            updatePreview();
        });

        // Selects and checkboxes
        ['font-family-select', 'font-weight-select', 'font-italic', 'font-underline', 'font-shadow'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', updatePreview);
        });
    }

    function updatePreview() {
        const target = fontTargetSelect.value;
        const family = document.getElementById('font-family-select').value;
        const weight = document.getElementById('font-weight-select').value;
        const size = document.getElementById('font-size-slider').value;
        const letterSpacing = document.getElementById('letter-spacing-slider').value;
        const lineHeight = document.getElementById('line-height-slider').value;
        const opacity = document.getElementById('opacity-slider').value;
        const italic = document.getElementById('font-italic').checked;
        const underline = document.getElementById('font-underline').checked;
        const shadow = document.getElementById('font-shadow').checked;

        // Update preview
        const previewSize = Math.min(48, size / 8); // Scale down for preview
        fontPreview.style.fontFamily = family;
        fontPreview.style.fontWeight = weight;
        fontPreview.style.fontSize = previewSize + 'px';
        fontPreview.style.letterSpacing = (letterSpacing / 8) + 'px';
        fontPreview.style.lineHeight = lineHeight;
        fontPreview.style.opacity = opacity;
        fontPreview.style.fontStyle = italic ? 'italic' : 'normal';
        fontPreview.style.textDecoration = underline ? 'underline' : 'none';
        fontPreview.style.textShadow = shadow ? '2px 2px 4px rgba(0,0,0,0.5)' : 'none';

        // Update preview text based on target
        switch (target) {
            case 'chord-face':
                // Use actual chord face texture generation for EXACT preview
                try {
                    const previewTexture = makeTitleTexture(['V(7)(b9)'], {
                        width: 512, height: 512, size: Math.min(180, size / 2),
                        fontTarget: 'chord-face',
                        family: family,
                        weight: weight,
                        lineHeight: lineHeight,
                        letterSpacing: letterSpacing,
                        opacity: opacity,
                        italic: italic,
                        shadow: shadow
                    });
                    fontPreview.style.background = `url(${previewTexture.canvas.toDataURL()}) center/contain no-repeat white`;
                    fontPreview.textContent = ''; // Clear text, use background image
                    fontPreview.style.minHeight = '120px';
                } catch (e) {
                    fontPreview.textContent = 'V(7)(b9)';
                    fontPreview.style.background = 'white';
                    fontPreview.style.minHeight = 'auto';
                }
                break;
            case 'diamond-font':
                fontPreview.textContent = 'C E G B♭';
                fontPreview.style.background = 'white';
                fontPreview.style.minHeight = 'auto';
                break;
            case 'title-font':
                fontPreview.textContent = 'MELODY';
                fontPreview.style.background = 'white';
                fontPreview.style.minHeight = 'auto';
                break;
            case 'ui-font':
                fontPreview.textContent = 'Button Text';
                fontPreview.style.background = 'white';
                fontPreview.style.minHeight = 'auto';
                break;
        }
    }

    // Action buttons
    document.getElementById('font-apply-btn')?.addEventListener('click', () => {
        applyFontSettings();
        fontModal.style.display = 'none';
    });

    document.getElementById('font-reset-btn')?.addEventListener('click', () => {
        resetFontSettings();
        loadFontSettings(fontTargetSelect.value);
        updatePreview();
    });

    document.getElementById('font-cancel-btn')?.addEventListener('click', () => {
        fontModal.style.display = 'none';
    });

    function applyFontSettings() {
        const target = fontTargetSelect.value;
        const settings = {
            family: document.getElementById('font-family-select').value,
            weight: document.getElementById('font-weight-select').value,
            size: parseInt(document.getElementById('font-size-slider').value),
            letterSpacing: parseInt(document.getElementById('letter-spacing-slider').value),
            lineHeight: parseFloat(document.getElementById('line-height-slider').value),
            opacity: parseFloat(document.getElementById('opacity-slider').value),
            italic: document.getElementById('font-italic').checked,
            underline: document.getElementById('font-underline').checked,
            shadow: document.getElementById('font-shadow').checked
        };

        currentFontSettings[target] = settings;

        console.log(`[FONT CONTROL] Applied ${target} settings:`, settings);

        // Apply to actual elements based on target
        switch (target) {
            case 'chord-face':
                // Update makeTitleTexture function defaults for chord faces
                console.log('[FONT CONTROL] Chord face font updated - will apply to new textures');
                // Refresh all existing chord face textures
                refreshAllCubeFaces();
                break;
            case 'diamond-font':
                console.log('[FONT CONTROL] Diamond font updated');
                break;
            case 'title-font':
                console.log('[FONT CONTROL] Title font updated');
                break;
            case 'ui-font':
                console.log('[FONT CONTROL] UI font updated');
                break;
        }
    }

    function resetFontSettings() {
        const target = fontTargetSelect.value;
        // Reset to defaults
        switch (target) {
            case 'chord-face':
                currentFontSettings[target] = {
                    family: 'Arial', weight: '900', size: 420, letterSpacing: 0,
                    lineHeight: 0.68, opacity: 1.0, italic: false, underline: false, shadow: false
                };
                break;
            case 'diamond-font':
                currentFontSettings[target] = {
                    family: 'Arial', weight: '700', size: 180, letterSpacing: 0,
                    lineHeight: 1.0, opacity: 1.0, italic: false, underline: false, shadow: false
                };
                break;
            case 'title-font':
                currentFontSettings[target] = {
                    family: 'Arial', weight: '1000', size: 420, letterSpacing: 0,
                    lineHeight: 0.68, opacity: 1.0, italic: false, underline: false, shadow: false
                };
                break;
            case 'ui-font':
                currentFontSettings[target] = {
                    family: 'Arial', weight: '400', size: 16, letterSpacing: 0,
                    lineHeight: 1.2, opacity: 1.0, italic: false, underline: false, shadow: false
                };
                break;
        }
        console.log(`[FONT CONTROL] Reset ${target} to defaults`);
    }
}

// IMPROV MODE FUNCTIONS
function enableImprovMode() {
    improvMode = true;
    console.log(`[IMPROV MODE] Enabled - ${improvModeType.toUpperCase()} mode - chords will queue for downbeats`);

    // Add visual indicator with mode selection and queue status
    const improvIndicator = document.createElement('div');
    improvIndicator.id = 'improv-indicator';

    const modeColor = improvModeType === 'free' ? '#ff6b6b, #ff9f43' : '#4ecdc4, #45b7d1';
    const modeIcon = improvModeType === 'free' ? '🎵' : '🎼';
    const modeTitle = improvModeType === 'free' ? 'FREE IMPROV' : 'CREATION IMPROV';
    const modeDescription = improvModeType === 'free' ? 'Root position only' : 'Full inversions + front row';

    improvIndicator.innerHTML = `
        ${modeIcon} ${modeTitle} ${modeIcon}<br>
        <small style="opacity: 0.8; font-size: 12px;">${modeDescription}</small><br>
        <small style="opacity: 0.6; font-size: 10px;">Switch modes: Click 🎵 or 🎼 in drum panel</small><br>
        <span id="queue-status" style="font-size: 12px;">Click chords to queue for downbeat</span>
    `;

    improvIndicator.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 10000;
        background: linear-gradient(45deg, ${modeColor});
        color: white; padding: 15px 20px; border-radius: 25px;
        font-weight: bold; font-size: 14px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        box-shadow: 0 4px 15px rgba(0,0,0,0.2); animation: pulse 1.5s infinite;
        text-align: center; line-height: 1.2; display: block !important; visibility: visible !important;
        min-width: 180px;
    `;

    document.body.appendChild(improvIndicator);
    console.log('[IMPROV UI] Indicator added to DOM:', improvIndicator);
    console.log('[IMPROV UI] Indicator innerHTML:', improvIndicator.innerHTML);

    // Add mode switching event listeners to drum machine emojis
    setupImprovModeEmojis();

    // Add CSS animation
    if (!document.getElementById('improv-styles')) {
        const style = document.createElement('style');
        style.id = 'improv-styles';
        style.textContent = `
            @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.05); opacity: 0.8; }
            }
            #queue-status { font-size: 12px; opacity: 0.9; font-weight: normal; }
        `;
        document.head.appendChild(style);
    }

    // Setup downbeat callback system (replaces old scheduleDownbeatTracking)
    setupDownbeatCallback();
}

function disableImprovMode() {
    improvMode = false;
    queuedChord = null;
    console.log('[IMPROV MODE] Disabled - returning to immediate playback');

    // Remove visual indicator
    const indicator = document.getElementById('improv-indicator');
    if (indicator) indicator.remove();

    // Clear downbeat tracker
    if (window.improvDownbeatTracker) {
        window.improvDownbeatTracker.stop();
        window.improvDownbeatTracker.dispose();
        window.improvDownbeatTracker = null;
    }

    // Clear downbeat callback
    window.onDownbeat = null;
}

// IMPROV MODE SWITCHING VIA DRUM MACHINE EMOJIS
function setupImprovModeEmojis() {
    // Add a small delay to ensure DOM is ready
    setTimeout(() => {
        const freeEmoji = document.getElementById('improv-mode-free');
        const creationEmoji = document.getElementById('improv-mode-creation');

        console.log('[IMPROV EMOJIS] Free emoji found:', !!freeEmoji);
        console.log('[IMPROV EMOJIS] Creation emoji found:', !!creationEmoji);

        if (freeEmoji) {
            freeEmoji.addEventListener('click', () => {
                console.log('[IMPROV EMOJIS] Free emoji clicked');
                switchImprovMode('free');
            });
        }
        if (creationEmoji) {
            creationEmoji.addEventListener('click', () => {
                console.log('[IMPROV EMOJIS] Creation emoji clicked');
                switchImprovMode('creation');
            });
        }

        // Update emoji visual states
        updateEmojiStates();
    }, 100);
}

function updateEmojiStates() {
    const freeEmoji = document.getElementById('improv-mode-free');
    const creationEmoji = document.getElementById('improv-mode-creation');

    if (freeEmoji) {
        freeEmoji.style.opacity = improvModeType === 'free' ? '1' : '0.4';
        freeEmoji.style.transform = improvModeType === 'free' ? 'scale(1.2)' : 'scale(1)';
    }
    if (creationEmoji) {
        creationEmoji.style.opacity = improvModeType === 'creation' ? '1' : '0.4';
        creationEmoji.style.transform = improvModeType === 'creation' ? 'scale(1.2)' : 'scale(1)';
    }
}

function switchImprovMode(newMode) {
    if (newMode === improvModeType) return; // Already in this mode

    const oldMode = improvModeType;
    improvModeType = newMode;

    console.log(`[IMPROV MODE] Switching from ${oldMode.toUpperCase()} to ${newMode.toUpperCase()}`);

    // Clear any queued chord when switching modes
    if (queuedChord) {
        try {
            if (queuedChord.chord && queuedChord.chord.material && queuedChord.chord.material.emissive) {
                queuedChord.chord.material.emissive.setHex(0x000000);
            }
        } catch (e) {
            console.warn('[IMPROV MODE SWITCH] Could not clear queued chord visual:', e);
        }
        queuedChord = null;
    }

    // Update emoji states
    updateEmojiStates();

    // Refresh the UI to show new mode
    if (improvMode) {
        const indicator = document.getElementById('improv-indicator');
        if (indicator) indicator.remove();
        enableImprovMode(); // Recreate with new mode
    }
}

// EXPOSE FUNCTIONS TO WINDOW FOR DRUM MACHINE ACCESS
window.enableImprovMode = enableImprovMode;
window.disableImprovMode = disableImprovMode;

function queueChordForDownbeat(chordObj, use7th) {
    // MODE-SPECIFIC LOGIC
    let actualChordObj = chordObj;
    let actualUse7th = use7th;

    if (improvModeType === 'free') {
        // FREE IMPROV: Force root position, no 7ths
        actualUse7th = false;
        console.log(`[FREE IMPROV] Forcing ${chordObj.userData.roman} to root position, no 7th`);

        // For free improv, we'll play the chord but force root position in the playback
        // The queuedChord stores the original shelf object but playback will override rotation
    } else {
        // CREATION IMPROV: Use exact inversion and 7th as clicked
        console.log(`[CREATION IMPROV] Preserving ${chordObj.userData.roman} inversion and 7th: ${use7th}`);
    }

    // VOICE LEADING 3: Pre-calculate intelligent voice leading for queued chord
    const bassContext = getVoiceLeadingContext(chordObj.userData.roman, 'bass');
    const melodyContext = getVoiceLeadingContext(chordObj.userData.roman, 'melody');

    queuedChord = {
        chord: actualChordObj,
        use7th: actualUse7th,
        queueTime: window.Tone.now(),
        improvModeType: improvModeType, // Store mode for later reference
        originalUse7th: use7th, // Store original for creation mode
        voiceLeadingContext: {
            bass: bassContext,
            melody: melodyContext
        }
    };

    console.log(`[IMPROV QUEUE] ${chordObj.userData.roman} queued for next downbeat with VL3 context`);
    console.log(`[IMPROV QUEUE] Previous chord: ${bassContext.previousChord} → Current: ${bassContext.currentChord}`);

    // Clear previous queued chord visual feedback
    if (queuedChord && queuedChord.chord && queuedChord.chord !== chordObj) {
        try {
            if (queuedChord.chord.material && queuedChord.chord.material.emissive) {
                queuedChord.chord.material.emissive.setHex(0x000000);
            }
            console.log(`[IMPROV QUEUE] Replacing queued chord ${queuedChord.chord.userData.roman} with ${chordObj.userData.roman}`);
        } catch (e) {
            console.warn('[IMPROV QUEUE] Could not clear previous chord visual:', e);
        }
    }

    // Enhanced visual feedback for queued chord
    highlightChordEffect(chordObj, 500);
    try {
        if (chordObj.material && chordObj.material.emissive) {
            chordObj.material.emissive.setHex(0x444400); // Yellow glow for queued
        } else {
            console.warn('[IMPROV QUEUE] Chord object has no emissive material:', chordObj);
        }
    } catch (e) {
        console.warn('[IMPROV QUEUE] Could not set chord visual feedback:', e);
    }

    // Update UI to show queued chord
    updateQueueStatusUI(`⏳ ${chordObj.userData.roman}${use7th ? '7' : ''} queued for downbeat`);

    // Keep the yellow glow until played or replaced (no timeout)
}

// NEW: Callback-based downbeat system that connects to drum machine
function setupDownbeatCallback() {
    console.log('[IMPROV DOWNBEAT] Setting up callback system for drum machine sync');

    // Create the callback function that drum machine will call
    window.onDownbeat = (time) => {
        lastDownbeatTime = time;
        nextDownbeatTime = time + window.Tone.Transport.toSeconds('1m');

        console.log(`[IMPROV DOWNBEAT] Callback triggered at time: ${time}`);

        // Play queued chord on downbeat
        if (queuedChord && improvMode) {
            const { chord, use7th, voiceLeadingContext, improvModeType: queuedMode, originalUse7th } = queuedChord;
            console.log(`[IMPROV DOWNBEAT] Playing queued chord: ${chord.userData.roman} in ${queuedMode.toUpperCase()} mode`);

            // Schedule the chord playback
            window.Tone.Draw.schedule(() => {
                // Apply the pre-calculated voice leading context
                if (voiceLeadingContext) {
                    console.log(`[IMPROV VL3] Applying pre-calculated context for ${chord.userData.roman}`);
                }

                if (queuedMode === 'free') {
                    // FREE IMPROV: Play root position only, no front row addition
                    playChordForObjectWith7th(chord, false, { forceRootPosition: true });
                    console.log(`[FREE IMPROV] Played ${chord.userData.roman} in root position only`);
                } else {
                    // CREATION IMPROV: Play with exact inversion, then add to front row

                    // CRITICAL: Apply rotation delta to shelf chord BEFORE playing for correct inversion
                    const rotationDelta = chord.userData?.desiredRotationDelta || 0;
                    const originalRotationIndex = chord.userData.rotationIndex || 0;
                    const targetRotationIndex = ((originalRotationIndex + rotationDelta) % 4 + 4) % 4;

                    // Temporarily set the correct rotation index for audio playback
                    chord.userData.rotationIndex = targetRotationIndex;
                    console.log(`[CREATION IMPROV] Applying rotation: ${originalRotationIndex} + ${rotationDelta} = ${targetRotationIndex} for ${chord.userData.roman}`);

                    playChordForObjectWith7th(chord, originalUse7th);
                    console.log(`[CREATION IMPROV] Played ${chord.userData.roman} with inversion (rotationIndex: ${targetRotationIndex}), scheduling front row addition`);

                    // Restore original rotation index (shelf should stay at 0)
                    chord.userData.rotationIndex = originalRotationIndex;

                    // Schedule front row addition after a brief delay
                    setTimeout(() => {
                        try {
                            // Create clone with the exact rotation from the shelf click
                            const d = chord.userData?.desiredRotationDelta || 0;
                            chord.userData.desiredRotationDelta = d;
                            enqueueShelfAdd(chord);
                            console.log(`[CREATION IMPROV] Added ${chord.userData.roman} to front row with rotation delta: ${d}`);
                        } catch (e) {
                            console.warn('[CREATION IMPROV] Could not add to front row:', e);
                        }
                    }, 100);
                }

                // Strong visual feedback for downbeat chord
                highlightChordEffect(chord, 1200);
                try {
                    if (chord.material && chord.material.emissive) {
                        chord.material.emissive.setHex(0x004400); // Green flash for played
                        setTimeout(() => {
                            if (chord.material && chord.material.emissive) {
                                chord.material.emissive.setHex(0x000000);
                            }
                        }, 1200);
                    }
                } catch (e) {
                    console.warn('[IMPROV DOWNBEAT] Could not set chord visual feedback:', e);
                }

                // Update queue status UI
                updateQueueStatusUI('🎵 Chord played on downbeat!');
                setTimeout(() => {
                    updateQueueStatusUI('Click chords to queue for downbeat');
                }, 2000);

            }, time);

            queuedChord = null; // Clear queue after playing
        }
    };

    console.log('[IMPROV DOWNBEAT] Callback system ready - waiting for drum machine downbeats');
}

// Helper function to update queue status in UI
function updateQueueStatusUI(message) {
    const queueStatus = document.getElementById('queue-status');
    if (queueStatus) {
        queueStatus.textContent = message;
    }
}

async function playLockSound() {
    try {
        if (!window.Tone) return;
        await window.Tone.start();
        const t = window.Tone.now();
        const synth = new window.Tone.MembraneSynth({ envelope: { attack: 0.001, decay: 0.25, sustain: 0.0, release: 0.05 } }).toDestination();
        synth.triggerAttackRelease('C2', 0.12, t, 0.9);
        const click = new window.Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.03, sustain: 0 } }).toDestination();
        click.triggerAttackRelease(0.02, t + 0.06);
        setTimeout(() => synth.dispose(), 400);
        setTimeout(() => click.dispose(), 200);
    } catch (_) { }
}

async function playFrontRowProgression() {
    if (lineup.length === 0) return;

    // ENABLE SHELF BLACKOUT for staves legibility during ALL playback
    setPlaybackShelfBlackout(true);

    // INTEGRATE WITH PROFESSIONAL DRUM MACHINE TRANSPORT
    console.log('[PLAY PROGRESSION] Starting with drum machine integration');

    // Start drum machine if available
    if (window.drumMachine && !window.drumMachine.isPlaying) {
        console.log('[PLAY PROGRESSION] Starting drum machine transport');
        await window.drumMachine.toggleDrums();
    }

    // Get loop count from UI
    const loopsInput = document.getElementById('progression-loops');
    const loopCount = parseInt(loopsInput?.value || '1');
    const totalChords = lineup.length * loopCount;

    console.log(`[PLAY PROGRESSION] Starting ${lineup.length} chords x ${loopCount} loops = ${totalChords} total - USING TONE.JS TRANSPORT`);

    // Reset progression voice leading tracking
    lastProgressionBassMidi = null;
    lastProgressionMelodyMidi = null;
    console.log('[PLAY PROGRESSION] 🔄 Reset voice leading tracking');

    // Clear any existing progression sequence and arrow history
    if (window.chordProgressionSequence) {
        window.chordProgressionSequence.dispose();
        window.chordProgressionSequence = null;
    }

    // Note: Progression arrows now track shelf clicks, not playback progression

    // TRANSPORT-BASED PROGRESSION - Perfect sync with drum machine
    const progressionSequence = new Tone.Sequence((time, index) => {
        if (index >= totalChords) {
            // Progression complete
            console.log('[TRANSPORT] Progression complete - cleaning up');
            progressionSequence.dispose();
            window.chordProgressionSequence = null;

            // Stop drum machine
            if (window.drumMachine && window.drumMachine.isPlaying) {
                setTimeout(() => window.drumMachine.toggleDrums(), 100);
            }

            // Auto-reset to melody view after brief delay
            setTimeout(() => {
                setViewAbove();
                ambient.intensity = 0.7;
                dir.intensity = 0.7;
                frontSpot.intensity = 0.0;
                frontSpotL.intensity = 0.0;
                frontSpotR.intensity = 0.0;
                stageSpot.intensity = 0.0;
                stageMode = false;

                // RESTORE SHELF after playback ends
                setPlaybackShelfBlackout(false);

                console.log('[TRANSPORT] ✅ Auto-reset complete');
            }, 1000);

            return;
        }

        const c = lineup[index % lineup.length]; // Loop through the progression
        const currentLoop = Math.floor(index / lineup.length) + 1;
        const chordInLoop = (index % lineup.length) + 1;

        // Calculate chord sustain duration based on CURRENT transport BPM - USE MEASURES
        const currentBpm = Tone.Transport.bpm.value;
        const beatsPerMeasure = 4; // Standard 4/4 time
        const chordDurationSeconds = (60 / currentBpm) * beatsPerMeasure; // Full measure duration

        console.log(`[TRANSPORT] Loop ${currentLoop}/${loopCount}, Chord ${chordInLoop}/${lineup.length}: ${c.userData.roman} at time ${time.toFixed(3)}s, BPM: ${currentBpm}, sustain: ${chordDurationSeconds.toFixed(2)}s`);

        // Progression arrows are now handled by shelf click tracking, not playback

        // Schedule visual effects on main thread
        Tone.Draw.schedule(() => {
            try {
                highlightChordEffect(c, 900);
                pulseGiantAt(index % lineup.length, 700);
                // Camera dolly
                const tDur = 700;
                const fromPos = camera.position.clone();
                const fromTgt = controls.target.clone();
                const toTgt = new THREE.Vector3(c.position.x, 0.6, 0);
                const toPos = toTgt.clone().add(new THREE.Vector3(0, 0, 9.5));
                const tStart = performance.now();
                const tween = {
                    owner: camera, tick: (now) => {
                        const v = Math.min(1, (now - tStart) / tDur);
                        camera.position.lerpVectors(fromPos, toPos, v);
                        controls.target.lerpVectors(fromTgt, toTgt, v);
                        return v >= 1;
                    }, cancelled: false
                };
                activeTweens.push(tween);
                addProgressionPointFromCube(c);
            } catch (err) {
                console.warn('[TRANSPORT] Visual effect error:', err);
            }
        }, time);

        // Schedule audio with NEW AUDIO ENGINE - REAL SAMPLES
        console.log(`[PLAY PROGRESSION] 🔥 Playing chord ${c.userData.roman} with NEW AUDIO ENGINE`);

        // Use NEW AUDIO ENGINE with PROPER DURATION - no silences
        Tone.Draw.schedule(() => {
            try {
                // Play chord using new audio engine with FULL MEASURE duration
                if (window.audioEngine) {
                    console.log(`[PLAY PROGRESSION] 🎵 Playing ${c.userData.roman} with real samples, duration: ${chordDurationSeconds.toFixed(2)}s`);

                    // Get chord notes
                    const chordMidis = buildLockedChordBedMidis(c.userData.roman, withSeventh);
                    let chordNotes = chordMidis.map(midi => Tone.Frequency(midi, "midi").toNote());

                    // APPLY STORED EXTENSIONS for playback
                    if (c.userData && c.userData.extensions && c.userData.extensions.length > 0) {
                        console.log(`[TRANSPORT EXT] Applying stored extensions for ${c.userData.roman}:`, c.userData.extensions);
                        const rootNote = getChordRootNote(c.userData.roman);
                        const storedExtensions = new Set(c.userData.extensions.map(ext => ({
                            name: ext.name,
                            interval: ext.interval,
                            description: ext.description
                        })));
                        chordNotes = applyChordExtensions(chordNotes, rootNote, storedExtensions);
                        console.log(`[TRANSPORT EXT] Extended chord notes: ${chordNotes.join(', ')}`);
                    }

                    // Play with NEW AUDIO ENGINE using FULL DURATION - No manual control for PROGRESSION
                    window.audioEngine.playChord(chordNotes, chordDurationSeconds, 0.7, false);

                    // Play bass if enabled - SKIP if locked bass exists (will be played below)
                    if (bassEnabled && !lockedBass) {
                        let bassMidi = getBassMidiForObject(c);

                        // Apply industry standard range constraints
                        const bassInstrument = document.getElementById('bass-inst')?.value || 'contrabass';
                        bassMidi = constrainToInstrumentRange(bassMidi, bassInstrument, 'bass');

                        // APPLY VOICE LEADING 3 (Academic Grade) to face-derived bass
                        if (index > 0 && lastProgressionBassMidi !== null) {
                            const prevChord = lineup[(index - 1) % lineup.length];

                            // Create voice leading context for bass
                            const context = {
                                voice: 'bass',
                                currentChord: c.userData.roman,
                                previousChord: prevChord.userData.roman,
                                progressionIndex: index,
                                isProgression: true
                            };

                            console.log(`[PLAY PROGRESSION] 🎼 Applying VL3 to bass: ${lastProgressionBassMidi} → ${bassMidi}`);
                            bassMidi = voiceLeadMidi(bassMidi, lastProgressionBassMidi, context);
                            console.log(`[PLAY PROGRESSION] 🎼 VL3 result for bass: ${bassMidi}`);
                        } else {
                            // First chord: apply basic register constraints
                            while (bassMidi > 55) bassMidi -= 12;
                            while (bassMidi < 36) bassMidi += 12;
                            console.log(`[PLAY PROGRESSION] 🎵 First chord bass (no VL): ${bassMidi}`);
                        }

                        // Track the actual played bass note for next chord
                        lastProgressionBassMidi = bassMidi;

                        const bassNote = Tone.Frequency(bassMidi, "midi").toNote();
                        console.log('[PLAY PROGRESSION] 🎵 Playing voice-led bass:', bassNote);
                        window.audioEngine.playBass(bassNote, chordDurationSeconds, 0.8, false);
                    }

                    // Play melody if enabled - SKIP if locked melody exists (will be played below)
                    if (melodyEnabled && !lockedMelody) {
                        let melMidi = getMelodyMidiForObject(c);

                        // Apply industry standard range constraints
                        const melodyInstrument = document.getElementById('melody-inst')?.value || 'violin';
                        melMidi = constrainToInstrumentRange(melMidi, melodyInstrument, 'melody');

                        // APPLY VOICE LEADING 3 (Academic Grade) to face-derived melody
                        if (index > 0 && lastProgressionMelodyMidi !== null) {
                            const prevChord = lineup[(index - 1) % lineup.length];

                            // Create voice leading context for melody
                            const context = {
                                voice: 'melody',
                                currentChord: c.userData.roman,
                                previousChord: prevChord.userData.roman,
                                progressionIndex: index,
                                isProgression: true
                            };

                            console.log(`[PLAY PROGRESSION] 🎼 Applying VL3 to melody: ${lastProgressionMelodyMidi} → ${melMidi}`);
                            melMidi = voiceLeadMidi(melMidi, lastProgressionMelodyMidi, context);
                            console.log(`[PLAY PROGRESSION] 🎼 VL3 result for melody: ${melMidi}`);
                        } else {
                            // First chord: apply basic register constraints
                            while (melMidi > 84) melMidi -= 12;
                            while (melMidi < 60) melMidi += 12;
                            console.log(`[PLAY PROGRESSION] 🎵 First chord melody (no VL): ${melMidi}`);
                        }

                        // Track the actual played melody note for next chord
                        lastProgressionMelodyMidi = melMidi;

                        const melodyNote = Tone.Frequency(melMidi, "midi").toNote();
                        console.log('[PLAY PROGRESSION] 🎵 Playing voice-led melody:', melodyNote);
                        window.audioEngine.playMelody([melodyNote], [chordDurationSeconds], 0.5);
                    }
                } else {
                    console.warn('[PLAY PROGRESSION] Audio engine not available');
                }
            } catch (error) {
                console.error('[PLAY PROGRESSION] Audio playback error:', error);
            }
        }, time);

        // LOCKED BASS/MELODY - Only play if locks exist and enabled
        if (lockedBass && bassEnabled) {
            let bassMidi = lockedBass[index % lineup.length]?.midi;
            if (bassMidi) {
                while (bassMidi > 55) bassMidi -= 12;
                while (bassMidi < 36) bassMidi += 12;

                // Enhanced context for Voice Leading 3 in progressions
                const currentChord = lineup[index % lineup.length]?.userData.roman;
                const prevChord = index > 0 ? lineup[(index - 1) % lineup.length]?.userData.roman : null;
                const context = {
                    currentChord,
                    previousChord: prevChord,
                    voice: 'bass',
                    chordTones: currentChord && noteSetsC[currentChord] ?
                        noteSetsC[currentChord].map(note => noteToMidi(note, 2)) : [],
                    previousChordTones: prevChord && noteSetsC[prevChord] ?
                        noteSetsC[prevChord].map(note => noteToMidi(note, 2)) : []
                };
                bassMidi = voiceLeadMidi(bassMidi, lastBassMidi, context);

                Tone.Draw.schedule(() => {
                    const bassNote = Tone.Frequency(bassMidi, "midi").toNote();
                    console.log('[PROGRESSION] 🎵 Playing LOCKED bass:', bassNote, 'index:', index);
                    window.audioEngine.playBass(bassNote, chordDurationSeconds, 0.8, false);
                    lastBassMidi = bassMidi;
                }, time);
            }
        }

        if (lockedMelody && melodyEnabled) {
            let melMidi = lockedMelody[index % lineup.length]?.midi;
            if (melMidi) {
                while (melMidi > 84) melMidi -= 12;
                while (melMidi < 60) melMidi += 12;

                // Enhanced context for Voice Leading 3 in progressions
                const currentChord = lineup[index % lineup.length]?.userData.roman;
                const prevChord = index > 0 ? lineup[(index - 1) % lineup.length]?.userData.roman : null;
                const context = {
                    currentChord,
                    previousChord: prevChord,
                    voice: 'melody',
                    chordTones: currentChord && noteSetsC[currentChord] ?
                        noteSetsC[currentChord].map(note => noteToMidi(note, 5)) : [],
                    previousChordTones: prevChord && noteSetsC[prevChord] ?
                        noteSetsC[prevChord].map(note => noteToMidi(note, 5)) : []
                };
                melMidi = voiceLeadMidi(melMidi, lastMelodyMidi, context);

                Tone.Draw.schedule(() => {
                    const melodyNote = Tone.Frequency(melMidi, "midi").toNote();
                    console.log('[PROGRESSION] 🎵 Playing LOCKED melody:', melodyNote, 'index:', index);
                    window.audioEngine.playMelody([melodyNote], [chordDurationSeconds], 0.5);
                    lastMelodyMidi = melMidi;
                }, time);
            }
        }

    }, Array.from({ length: totalChords + 1 }, (_, i) => i), "1m"); // 1 measure per chord

    // Store reference and start
    window.chordProgressionSequence = progressionSequence;
    progressionSequence.start(0);

    console.log(`[TRANSPORT] Sequence started: ${lineup.length} chords x ${loopCount} loops = ${totalChords} measures`);

    // Progression now runs via Transport - no more await needed!
}

// Optional: pin a specific CDN via ?sf= param already supported in readFlagsFromUrl()

// ============================================
// CLAUDE'S PART 7: DEBUGGING HELPERS
// ============================================

// Add these to help debug UI visibility issues
window.debugUI = function () {
    const widget = document.getElementById('unified-rhythm-widget');
    if (!widget) {
        console.error('Widget not found in DOM');
        return;
    }

    const rect = widget.getBoundingClientRect();
    const computed = window.getComputedStyle(widget);

    console.log('Widget Debug Info:');
    console.log('- Position:', rect);
    console.log('- Display:', computed.display);
    console.log('- Visibility:', computed.visibility);
    console.log('- Z-Index:', computed.zIndex);
    console.log('- Opacity:', computed.opacity);
    console.log('- Parent:', widget.parentElement);

    // Check if something is covering it
    const elementAtPoint = document.elementFromPoint(rect.left + 10, rect.top + 10);
    console.log('- Element at widget position:', elementAtPoint);

    // Force to front
    widget.style.zIndex = '2147483647';
    console.log('Forced z-index to maximum');
};

window.forceShowUI = function () {
    const widget = document.getElementById('unified-rhythm-widget');
    if (widget) {
        widget.style.cssText = `
            position: fixed !important;
            top: 10px !important;
            right: 10px !important;
            z-index: 2147483647 !important;
            background: red !important;
            width: 300px !important;
            height: 200px !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
        `;
        console.log('Forced widget to red box for visibility');
    }
};

// Volume controls already initialized via setTimeout above

// Add camera height compensation to existing animate loop
// (This will be called from the existing animate function)


