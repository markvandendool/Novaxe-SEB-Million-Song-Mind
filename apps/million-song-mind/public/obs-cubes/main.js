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
let shelfPickCamera = null; // orthographic camera used only for shelf picking
// CRITICAL: Enable all layers on camera
try { camera.layers.enable(0); camera.layers.enable(1); camera.layers.enable(2); } catch (_) { }
// Melody/Bass presets – lowered angle by ~10°
const melodyTarget = new THREE.Vector3(0, 1.4, 0);
const melodyCamPos = new THREE.Vector3(0, 5.8, 11.5);
const bassTarget = melodyTarget.clone();
const bassCamPos = new THREE.Vector3(0, -5.8, 11.5);
camera.position.copy(melodyCamPos);
// Ensure camera renders default, front, and shelf layers
try { camera.layers.enable(0); camera.layers.enable(1); camera.layers.enable(2); } catch (_) { }
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.target.copy(melodyTarget);

// Lighting
const ambient = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambient);
const dir = new THREE.DirectionalLight(0xffffff, 0.7);
dir.position.set(3, 5, 4);
scene.add(dir);
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
    const spotFrom = frontSpot.intensity, spotTo = 2.9; // +~30%
    const spotLFrom = frontSpotL.intensity, spotLTo = 1.8;
    const spotRFrom = frontSpotR.intensity, spotRTo = 1.8;
    const stageSpotFrom = stageSpot.intensity, stageSpotTo = 4.9; // +40%
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
    animateVector(camera.position, melodyCamPos.clone(), 650);
    animateVector(controls.target, melodyTarget.clone(), 650);
    pokeInteraction();
}
function setViewBelow() {
    currentStickyView = 'below';
    animateVector(camera.position, bassCamPos.clone(), 650);
    animateVector(controls.target, bassTarget.clone(), 650);
    pokeInteraction();
}

// Convert accidentals to musical glyphs and tidy typography
function toMusicalGlyphs(s) {
    if (!s) return s;
    // Tight kerning around accidentals by removing stray spaces and using narrow no-break space
    const NNBSP = '\u202F';
    let out = String(s)
        .replace(/\s*#\s*/g, NNBSP + '♯')
        .replace(/([A-Ga-g])\s*b/g, '$1' + NNBSP + '♭')   // Eb → E♭ with tight space
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

function loadFaceTexture(label, romanLabel) {
    // Always use canvas-rendered texture; no PNGs
    return makeFrontLabelTextureStyled(label, romanLabel);
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

async function makeMaterials(label, romanLabel) {
    // Front face: chord name label texture (strong bias always facing camera)
    const labelTex = await loadFaceTexture(label, romanLabel);
    const front = new THREE.MeshStandardMaterial({ map: labelTex, transparent: true });
    const wood = new THREE.MeshStandardMaterial({ color: 0xd5b38a });

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

    // Face order: [px, nx, py, ny, pz, nz]
    // We'll orient so nz (index 5) is the front-facing chord-name; map sides accordingly
    // left(n x) -> 1; right(p x) -> 0; top(p y) -> 2; bottom(n y) -> 3; front(n z) -> 5; back(p z) -> 4
    const materials = [];
    materials[0] = faceRight; // +x right → 3rd
    materials[1] = faceLeft;  // -x left → 7th
    materials[2] = faceTop;   // +y top → 5th
    materials[3] = faceBottom;// -y bottom → root
    materials[4] = front;     // +z front chord label (toward camera)
    materials[5] = wood;      // -z back
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
    // MOTION centered around ~2 o'clock on the right circle (anchor ~ 60°)
    drawCurvedWord('MOTION', right.x, right.y, right.r - 28, Math.PI / 3, { fill: '#222', spacingDeg: 12 });
    // TENSION centered around ~10 o'clock on the left circle (anchor ~ 120°)
    drawCurvedWord('TENSION', left.x, left.y, left.r - 28, (2 * Math.PI) / 3, { fill: '#222', spacingDeg: 12 });
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
    const weight = opts.weight || 900;
    const size = opts.size || 220;
    const gap = opts.lineGap || 0.68; // tighten leading by default
    const fontFamily = `${weight} ${size}px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial`;
    ctx.fillStyle = opts.fill || '#ffffff';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    // Stylized shadow/glow
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 24; ctx.shadowOffsetY = 6;
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
    // Anchor big three to circle centers
    'I': new THREE.Vector3(0, shelfY + 0.8, shelfZ),
    'IV': new THREE.Vector3(2.2, shelfY - 0.6, shelfZ),
    'V': new THREE.Vector3(-2.2, shelfY - 0.6, shelfZ),
    'ii': new THREE.Vector3(3.4, shelfY - 2.1, shelfZ),
    'viiø': new THREE.Vector3(-3.4, shelfY - 2.1, shelfZ),
    'vi': new THREE.Vector3(0.9, shelfY + 0.2, shelfZ),
    'iii': new THREE.Vector3(-0.9, shelfY + 0.2, shelfZ),
    // Minor placements (approximate)
    'i': new THREE.Vector3(0, shelfY - 0.9, shelfZ),
    'iiø': new THREE.Vector3(3.8, shelfY - 2.4, shelfZ),
    'bIII': new THREE.Vector3(-0.5, shelfY - 0.4, shelfZ),
    // Minor iv should be smaller and nearer the center than IV major
    'iv': new THREE.Vector3(1.31, shelfY - 0.03, shelfZ),
    'v': new THREE.Vector3(-2.2, shelfY - 1.7, shelfZ),
    'bVI': new THREE.Vector3(0.6, shelfY - 0.5, shelfZ),
    'bVII': new THREE.Vector3(-0.6, shelfY - 0.6, shelfZ),
    'V(7)(b9)': new THREE.Vector3(-1.8, shelfY - 2.0, shelfZ),
    'viiº7': new THREE.Vector3(-3.0, shelfY - 2.3, shelfZ),
    // Applied placements (approximate, around intersections)
    'I7': new THREE.Vector3(0.2, shelfY + 0.6, shelfZ),
    'iiiø': new THREE.Vector3(-0.9, shelfY - 0.1, shelfZ),
    // Align applied columns between iiiø→#ivø and I7→II
    'II(7)': new THREE.Vector3(2.5, shelfY - 0.7, shelfZ),
    '#ivø': new THREE.Vector3(2.9, shelfY - 1.5, shelfZ),
    'III(7)': new THREE.Vector3(0.4, shelfY - 0.2, shelfZ),
    '#vº': new THREE.Vector3(-2.9, shelfY - 1.6, shelfZ),
    'VI(7)': new THREE.Vector3(1.3, shelfY - 0.3, shelfZ),
    '#iº': new THREE.Vector3(0.3, shelfY - 1.1, shelfZ),
    'VII(7)': new THREE.Vector3(-2.5, shelfY - 0.7, shelfZ),
    '#iiº': new THREE.Vector3(2.6, shelfY - 2.4, shelfZ),
    // New plain dominants (II and VII) slotted just beyond their altered neighbors
    'II': new THREE.Vector3(3.2, shelfY - 0.7, shelfZ),
    'VII': new THREE.Vector3(-3.2, shelfY - 0.7, shelfZ),
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
    // Major: 1.0 for I/IV/V; slightly smaller for others
    'I': 1.2, 'IV': 1.2, 'V': 1.2,
    'ii': 0.7, 'iii': 0.7, 'vi': 0.7, 'viiø': 0.6,
    // Minor reduced family
    'i': 0.65, 'iiø': 0.55, 'bIII': 0.55, 'iv': 0.55, 'v': 0.55, 'bVI': 0.55, 'bVII': 0.55, 'V(7)(b9)': 0.55, 'viiº7': 0.55,
    // Applied compact
    'I7': 0.5, 'iiiø': 0.5, 'II(7)': 0.5, '#ivø': 0.5, 'III(7)': 0.5, '#vº': 0.5, 'VI(7)': 0.5, '#iº': 0.5, 'VII(7)': 0.5, '#iiº': 0.5,
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
    try {
        const json = await loadOfficialMap('./Shelf%20Map%20Official.json');
        applyShelfMap(json);
        return;
    } catch { }
    // If fetch fails, keep built-in defaults; do not read localStorage
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
    try { ensureTempoUi(); } catch (_) { }
}

async function updateLabels() {
    for (const c of cubes) {
        const label = c.userData[labelMode];
        const materials = await makeMaterials(label, c.userData.roman);
        c.material.forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
        c.material = materials;
    }
    for (const s of shelfCubes) {
        const label = s.userData[labelMode];
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
let debugEnabled = new URLSearchParams(window.location.search).has('debug');
let debugOverlay = null;
function createDebugOverlay() {
    if (!debugEnabled || debugOverlay) return;
    debugOverlay = document.createElement('div');
    debugOverlay.style.cssText = 'position:fixed;top:10px;left:10px;background:rgba(0,0,0,0.8);color:#0f0;padding:10px;font-family:monospace;font-size:12px;z-index:10000;max-width:420px;pointer-events:none;';
    document.body.appendChild(debugOverlay);
}
function updateDebugOverlay(info) { if (debugOverlay) debugOverlay.innerHTML = info; }

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
    // Only honor left-click for selections/drags
    if (typeof e.button === 'number' && e.button !== 0) return;
    const rect = renderer.domElement.getBoundingClientRect();
    mouseDownPos.set(e.clientX - rect.left, e.clientY - rect.top);
    mouseDownTime = performance.now();
    fsm.onPointerDown(mouseDownPos.x, mouseDownPos.y, mouseDownTime);
    try { renderer.domElement.setPointerCapture?.(e.pointerId); } catch (_) { }

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
    if (hits.length > 0) {
        let obj = resolveCubeFromObject(hits[0].object);
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
            // Depth control via vertical mouse motion
            const dyScreen = e.clientY - dragStartScreenY;
            const r = dragging.userData.roman;
            const shelfY0 = dragging.userData.shelfY0 ?? (shelfOriginByRoman[r]?.position.y ?? shelfY);
            const desired = ensureDesired(dragging.userData);
            if (dragging.userData.fromShelf) {
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
        if (res.isClick) {
            const hits = getIntersects(e);
            // Global 3D play button check
            for (const h of hits) { if (h.object?.userData?.isPlayButton) { playFrontRowProgression(); pendingObj = null; return; } }
            // Use screen-space rectangle picking for shelf cubes
            let shelfHit = null;
            try { shelfHit = pickShelfCubeAtPointer(e); } catch (_) { }
            // If we pressed a FRONT-ROW cube on pointerdown, force it as the target for click handling
            const frontOverride = !!(pendingObj && !pendingObj.userData?.isShelf);
            const fromShelfBand = frontOverride ? false : isPointerOverShelf(e);
            // If polygon picker already chose a shelf cube at mousedown, trust it
            if (pendingObj && pendingObj.userData?.isShelf) {
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
            if (!targetObj) { pendingObj = null; return; }
            // If clicking a shelf cube, enqueue add + audio and return
            if (!adjustMode && targetObj.userData?.isShelf) {
                try {
                    const d = decideShelfDeltaScreen(targetObj, e);
                    targetObj.userData.desiredRotationDelta = d;
                    console.log('[shelf] target click screen delta =', d, 'for', targetObj.userData?.roman);
                } catch (_) { targetObj.userData.desiredRotationDelta = 0; }
                enqueueShelfAdd(targetObj); pendingObj = null; return;
            }
            if (targetObj.userData?.isShelf) { pendingObj = null; return; }
            // Center play priority for the pressed cube
            const centerHit = pickCenterPlay(hits, targetObj);
            if (centerHit) { playChordForObject(targetObj); pendingObj = null; return; }
            // Find a hit belonging to the pressed cube (overlay or face)
            let hit = null;
            for (const h of hits) { const o = resolveCubeFromObject(h.object); if (o === targetObj) { hit = h; break; } }
            if (hit) {
                // Then overlay/front, then faces
                const isOverlay = isFrontOverlayHit(hit, targetObj);
                const normalZ = isOverlay ? 1 : (hit.face?.normal?.z ?? 0);
                if (Math.abs(normalZ - 1) < 0.5) {
                    const local = targetObj.worldToLocal(hit.point.clone());
                    const absX = Math.abs(local.x);
                    const absY = Math.abs(local.y);
                    let targetToneIndex; if (absX > absY) targetToneIndex = local.x > 0 ? 1 : 3; else targetToneIndex = local.y > 0 ? 2 : 0;
                    const r = targetObj.userData.rotationIndex || 0;
                    const cw = (targetToneIndex - r + 4) % 4; const ccw = (r - targetToneIndex + 4) % 4;
                    let angle = 0; let delta = 0;
                    if (cw <= ccw) { angle = -cw * (Math.PI / 2); delta = +cw; } else { angle = ccw * (Math.PI / 2); delta = -ccw; }
                    if (angle !== 0) {
                        const extra = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), angle);
                        const finalQ = targetObj.quaternion.clone().multiply(extra);
                        if (hasActiveTweenFor(targetObj)) cancelTweensFor(targetObj);
                        // Gentle eased rotation
                        animateQuaternion(targetObj, finalQ, 650);
                        targetObj.userData.rotationIndex = (targetObj.userData.rotationIndex + (delta + 4)) % 4;
                        // Trigger audio with new orientation slightly after animation starts
                        setTimeout(() => playChordForObject(targetObj), 80);
                    }
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
                        // Force into a strong low register around C2..C3 for presence
                        while (midi > 55) midi -= 12; // keep <= G#2
                        while (midi < 36) midi += 12; // keep >= C2
                        midi = voiceLeadMidi(midi, lastBassMidi);
                        if (sfBass && sfBass.play) {
                            sfBass.play(midi, t0, { duration: 0.45, gain: 0.34 });
                            lastBassMidi = midi;
                        }
                        else { console.error('[obs-cubes] Bass instrument missing; no oscillator fallback.'); }
                    } else if (voice === 'melody') {
                        let midi = getMelodyMidiForObject(targetObj);
                        // Keep melody modest: around C4..C6
                        while (midi > 84) midi -= 12; // <= C6
                        while (midi < 60) midi += 12; // >= C4
                        midi = voiceLeadMidi(midi, lastMelodyMidi);
                        if (sfMelody && sfMelody.play) {
                            sfMelody.play(midi, t0, { duration: 0.45, gain: 0.32 });
                            lastMelodyMidi = midi;
                        }
                        else { console.error('[obs-cubes] Melody instrument missing; no oscillator fallback.'); }
                    } else {
                        const midi = 60 + pcOf(names[idx]);
                        if (sfChord && sfChord.play) sfChord.play(midi, t0, { duration: 0.4, gain: 0.22 });
                        else { console.error('[obs-cubes] Chord instrument missing; no oscillator fallback.'); }
                    }
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
    const radius = (1.15 * 0.5) / 2; // half the square width
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
// Right-click toggles between Melody (above) and Bassline (below) views
renderer.domElement.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if (currentStickyView === 'above') setViewBelow(); else setViewAbove();
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

document.getElementById('view-down').addEventListener('click', setViewAbove);
document.getElementById('view-up').addEventListener('click', setViewBelow);

// Audio state (declare before any usage)
let audioCtx = null;
let withSeventh = false;
let bassEnabled = true;
let melodyEnabled = false;
let instrumentsReady = false;
let wafPlayer = null;
let sfChord = null, sfBass = null, sfMelody = null;
// Back-compat guards: some older handlers referenced these names directly
let chordInst = null, bassInst = null, melodyInst = null;
// Voice-leading state for closest-octave selection
let lastBassMidi = null, lastMelodyMidi = null;
let voiceLeadingMode = 'vl1'; // 'vl1' nearest-octave, 'vl2' tonal.js assisted
let lockedMelody = null; // [{ roman, midi, color } ...]
let lockedBass = null;   // [{ roman, midi, color } ...]
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
const WAF_PRESETS = {
    chord: { url: 'https://surikov.github.io/webaudiofontdata/sound/0480_FluidR3_GM_sf2_file.js', var: '_tone_0480_FluidR3_GM_sf2_file' },
    bass: { url: 'https://surikov.github.io/webaudiofontdata/sound/0430_FluidR3_GM_sf2_file.js', var: '_tone_0430_FluidR3_GM_sf2_file' },
    melody: { url: 'https://surikov.github.io/webaudiofontdata/sound/0400_FluidR3_GM_sf2_file.js', var: '_tone_0400_FluidR3_GM_sf2_file' },
};

function initializeWebAudioFont() {
    console.warn('[obs-cubes] WebAudioFont path disabled; using Tone.js engine');
}

// Tone.js-based instrument loading to mirror Novaxe stack
async function loadInstruments() {
    try {
        // Prepare a user-gesture unlock for mobile/browsers
        const setupToneUnlock = () => {
            const unlock = async () => {
                try { if (window.Tone && window.Tone.context?.state !== 'running') { await window.Tone.start(); console.log('[obs-cubes] Tone.js audio unlocked'); } } catch (_) { }
                document.removeEventListener('pointerdown', unlock);
                document.removeEventListener('touchstart', unlock);
            };
            document.addEventListener('pointerdown', unlock);
            document.addEventListener('touchstart', unlock);
        };

        if (window.Tone) {
            setupToneUnlock();
            // Create a simple mix bus similar to previous WebAudio gains
            // Output chain: Master → Compressor → Limiter → Destination
            const limiter = new window.Tone.Limiter(-1).toDestination();
            const compressor = new window.Tone.Compressor({ threshold: -18, ratio: 3, attack: 0.01, release: 0.1 }).connect(limiter);
            const toneMaster = new window.Tone.Gain(0.95).connect(compressor);
            const chordBus = new window.Tone.Gain(0.22).connect(toneMaster);
            const bassBus = new window.Tone.Gain(0.85).connect(toneMaster);
            const melodyBus = new window.Tone.Gain(0.28).connect(toneMaster);

            // Create light-weight synths
            const chordSynth = new window.Tone.PolySynth(window.Tone.Synth, {
                oscillator: { type: 'triangle' },
                envelope: { attack: 0.01, decay: 0.08, sustain: 0.5, release: 0.3 }
            }).connect(chordBus);
            // Monophonic bass with punchy lowpass and envelope
            const bassSynth = new window.Tone.MonoSynth({
                oscillator: { type: 'sawtooth' },
                filter: { type: 'lowpass', Q: 1 },
                filterEnvelope: { attack: 0.002, decay: 0.08, sustain: 0.2, release: 0.2, baseFrequency: 80, octaves: 2.5 },
                envelope: { attack: 0.002, decay: 0.12, sustain: 0.7, release: 0.28 }
            }).connect(bassBus);
            const melodySynth = new window.Tone.PolySynth(window.Tone.Synth, {
                oscillator: { type: 'triangle' },
                envelope: { attack: 0.005, decay: 0.06, sustain: 0.4, release: 0.25 }
            }).connect(melodyBus);

            const makeTonePlayable = (synth) => ({
                play(midi, time, opts = {}) {
                    const ctx = ensureAudio();
                    const nowCtx = ctx.currentTime;
                    const offset = Math.max(0, (time ?? nowCtx) - nowCtx);
                    const when = window.Tone.now() + offset;
                    const duration = opts.duration ?? 0.5;
                    const velocity = 1.0; // use bus gains for mix; ensure audibility
                    try {
                        synth.triggerAttackRelease(window.Tone.Frequency(midi, 'midi'), duration, when, velocity);
                    } catch (e) { console.warn('[obs-cubes] Tone play error', e); }
                }
            });

            sfChord = makeTonePlayable(chordSynth);
            sfBass = makeTonePlayable(bassSynth);
            sfMelody = makeTonePlayable(melodySynth);
            // legacy aliases
            chordInst = sfChord; bassInst = sfBass; melodyInst = sfMelody;

            // If Tone uses any async loading (samples), wait; with Synth there's nothing to load.
            if (typeof window.Tone.loaded === 'function') {
                try { await window.Tone.loaded(); } catch (_) { }
            }
            instrumentsReady = true;
            console.log('[obs-cubes] Tone.js instruments ready');
        } else {
            console.warn('[obs-cubes] Tone.js not available; audio disabled');
            instrumentsReady = false;
        }
    } catch (err) {
        console.error('[obs-cubes] Failed to initialize Tone instruments', err);
        instrumentsReady = false;
    }
}

// UI wiring
const setSelect = document.getElementById('set-select');
const labelSelect = document.getElementById('label-mode');
const keySelect = document.getElementById('key-select');
const with7th = document.getElementById('with-7th');
const bassEnabledEl = document.getElementById('bass-enabled');
const melodyEnabledEl = document.getElementById('melody-enabled');
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
bassEnabled = !!(bassEnabledEl && bassEnabledEl.checked);
melodyEnabled = !!(melodyEnabledEl && melodyEnabledEl.checked);
// Instrument dropdowns are currently cosmetic with WebAudioFont presets
try { setState({ key: currentKey, withSeventh, bassEnabled, melodyEnabled }); } catch (_) { }
with7th?.addEventListener('change', () => {
    withSeventh = !!with7th.checked;
    try { setState({ withSeventh }); bridge.emit('settingsChanged', { withSeventh }); } catch (_) { }
});
bassEnabledEl?.addEventListener('change', () => {
    bassEnabled = !!bassEnabledEl.checked;
    try { setState({ bassEnabled }); bridge.emit('settingsChanged', { bassEnabled }); } catch (_) { }
});
melodyEnabledEl?.addEventListener('change', () => {
    melodyEnabled = !!melodyEnabledEl.checked;
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
resetBtn?.addEventListener('click', () => {
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
    // Also clear any locked lanes to avoid leftover markers
    try { clearLockedLines(); setMelodyLockVisual('open'); setBassLockVisual('open'); } catch (_) { }
});

// Lock icon events handled above via melodyLockIcon/bassLockIcon

setSelect.addEventListener('change', () => {
    // Toggle shelf visibility only; default shows all
    const val = setSelect.value;
    currentSet = val;
    const show = new Set();
    if (val === 'major') chordSetsC.major.forEach(c => show.add(c.roman));
    else if (val === 'minor') chordSetsC.minor.forEach(c => show.add(c.roman));
    else if (val === 'applied') chordSetsC.applied.forEach(c => show.add(c.roman));
    else {
        [...chordSetsC.major, ...chordSetsC.minor, ...chordSetsC.applied].forEach(c => show.add(c.roman));
    }
    for (const s of shelfCubes) { s.visible = show.has(s.userData.roman); }
});

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
    // drive tweens
    const now = performance.now();
    for (let i = activeTweens.length - 1; i >= 0; i--) {
        const done = activeTweens[i].tick(now);
        if (done) activeTweens.splice(i, 1);
    }
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
        } else { // below plane
            melodyMat.opacity = 0; bassMat.opacity = alpha; belowAlpha = alpha;
        }
    }
    // Link shelf plane opacity to camera being below the plane for legibility
    if (shelfPlane && shelfPlane.material && typeof belowAlpha === 'number') {
        shelfPlane.material.transparent = true;
        shelfPlane.material.opacity = Math.max(shelfPlane.material.opacity ?? 0, belowAlpha);
        // When above plane, keep the original texture fully visible (no forced fade)
        if (belowAlpha === 0) shelfPlane.material.opacity = 1.0;
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

// Voice leading 2 (tonal-assisted): prefer interval steps up to a 3rd/4th; fallback to nearest octave
function voiceLeadMidi(targetMidi, referenceMidi) {
    if (voiceLeadingMode !== 'vl2') return nearestOctave(targetMidi, referenceMidi);
    if (referenceMidi == null || !isFinite(referenceMidi)) return targetMidi;
    // Evaluate target in a window of +/- 2 octaves and pick minimal absolute semitone distance
    let best = targetMidi, bestDist = Infinity;
    for (let o = -2; o <= 2; o++) {
        const cand = targetMidi + o * 12;
        const d = Math.abs(cand - referenceMidi);
        if (d < bestDist) { bestDist = d; best = cand; }
    }
    return best;
}

// Chord bed: lock voices into C4..C5 regardless of chord
function buildLockedChordBedMidis(roman, includeSeventh) {
    const tones = noteSetsC[roman] || ['C', 'E', 'G', 'B'];
    const names = transposeNotes(tones, currentKey);
    const use = includeSeventh ? names.slice(0, 4) : names.slice(0, 3);
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
    return rootBaseMidi + diff; // within one octave above root
}

// Melody: map top-face tone into a higher octave anchored to the chord root
function getMelodyMidiForObject(obj) {
    const tones = noteSetsC[obj.userData.roman] || ['C', 'E', 'G', 'B'];
    const names = transposeNotes(tones, currentKey);
    const r = ((obj.userData.rotationIndex || 0) % 4 + 4) % 4;
    const rootPc = pcOf(names[0]);
    const topPc = pcOf(names[(r + 2) % 4]);
    const baseC5 = 72; // higher register
    const rootBaseMidi = baseC5 + ((rootPc - 0 + 12) % 12);
    const diff = (topPc - rootPc + 12) % 12;
    return rootBaseMidi + diff;
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
function playChordForObject(obj) {
    const ctx = ensureAudio();
    const now = ctx.currentTime;
    const duration = 1.1;

    if (!instrumentsReady) { console.log('[obs-cubes] Instruments still loading...'); return; }

    // Master
    const master = ctx.createGain(); master.gain.value = 0.8; master.connect(ctx.destination);

    // Layers
    const chordBus = ctx.createGain(); chordBus.gain.value = 0.18; chordBus.connect(master);
    const bassBus = ctx.createGain(); bassBus.gain.value = 0.3; bassBus.connect(master);
    const melodyBus = ctx.createGain(); melodyBus.gain.value = 0.26; melodyBus.connect(master);

    // Envelope helper
    const env = (g, t0, d) => {
        g.gain.setValueAtTime(0.0, t0);
        g.gain.linearRampToValueAtTime(g.gain.value + 0.001, t0 + 0.01);
        g.gain.linearRampToValueAtTime(g.gain.value, t0 + 0.03);
        g.gain.linearRampToValueAtTime(0.0, t0 + d);
    };

    // Chord bed: locked octave C4..C5
    const chordMidis = buildLockedChordBedMidis(obj.userData.roman, withSeventh);
    if (sfChord && sfChord.play) {
        chordMidis.forEach(m => sfChord.play(m, now, { duration, gain: 0.18 }));
    } else {
        console.error('[obs-cubes] Chord instrument missing; skipping chord bed.');
    }

    // Bass: if locked, use locked line; else use cube bottom face
    if (bassEnabled) {
        let bassMidi = getBassMidiForObject(obj);
        const idx = lineup.indexOf(obj);
        if (lockedBass && idx >= 0 && lockedBass[idx] && typeof lockedBass[idx].midi === 'number') bassMidi = lockedBass[idx].midi;
        if (sfBass && sfBass.play) {
            sfBass.play(bassMidi, now, { duration, gain: 0.34 });
        } else {
            console.error('[obs-cubes] Bass instrument missing; skipping bass note.');
        }
    }

    // Melody: if locked, use locked line; else use cube top face
    if (melodyEnabled) {
        let melMidi = getMelodyMidiForObject(obj);
        const idx = lineup.indexOf(obj);
        if (lockedMelody && idx >= 0 && lockedMelody[idx] && typeof lockedMelody[idx].midi === 'number') melMidi = lockedMelody[idx].midi;
        if (sfMelody && sfMelody.play) {
            sfMelody.play(melMidi, now, { duration, gain: 0.3 });
        } else {
            console.error('[obs-cubes] Melody instrument missing; skipping melody note.');
        }
    }
    try { bridge.emit('chordPlayed', { roman: obj.userData?.roman, key: currentKey, withSeventh, bassEnabled, melodyEnabled, rotationIndex: obj.userData?.rotationIndex || 0 }); } catch (_) { }
}

// Shelf-click sequencing
const shelfClickQueue = [];
let processingShelfQueue = false;
async function enqueueShelfAdd(shelfMesh) {
    shelfClickQueue.push(shelfMesh);
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
        // Play with intended inversion immediately
        if (Object.prototype.hasOwnProperty.call(shelf.userData || {}, 'desiredRotationDelta')) clone.userData.rotationIndex = ((clone.userData.rotationIndex + deltaSteps) % 4 + 4) % 4;
        playChordForObject(clone);
        addProgressionPointFromCube(shelf); // record from shelf origin too
        await new Promise(r => setTimeout(r, 180));
    } catch (_) { }
}

let progressionEnabled = false;
let progressionArrows = [];
let progressionPoints = [];
let playButtonMesh = null;
let progressionBpm = 30; // 30 BPM → 2s per chord by default
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

// Tempo/Metronome UI
function ensureTempoUi() {
    if (tempoUi) return;
    const box = document.createElement('div');
    box.style.cssText = 'position:fixed;top:10px;right:10px;background:rgba(20,20,20,0.85);color:#fff;padding:8px 10px;border-radius:8px;font:12px/1.2 system-ui, -apple-system, Segoe UI, Roboto;z-index:20000;display:flex;gap:8px;align-items:center;';
    const label = document.createElement('span'); label.textContent = 'Tempo'; tempoLabel = label;
    const slider = document.createElement('input'); slider.type = 'range'; slider.min = '30'; slider.max = '240'; slider.value = String(progressionBpm); slider.style.width = '120px';
    const val = document.createElement('span'); val.textContent = `${progressionBpm} BPM`;
    slider.oninput = () => { progressionBpm = Math.max(30, Math.min(240, Number(slider.value) || 120)); val.textContent = `${progressionBpm} BPM`; };
    const btn = document.createElement('button'); btn.textContent = 'Metronome: Off'; btn.style.cssText = 'background:#333;color:#fff;border:1px solid #666;border-radius:6px;padding:4px 8px;cursor:pointer;';
    btn.onclick = async () => {
        try { if (window.Tone) await window.Tone.start(); } catch (_) { }
        if (!metroSynth && window.Tone) { metroSynth = new window.Tone.MembraneSynth({ envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.05 } }).toDestination(); }
        if (!metroLoop && window.Tone) {
            metroLoop = new window.Tone.Loop((time) => { try { metroSynth && metroSynth.triggerAttackRelease('C3', 0.05, time, 0.7); } catch (_) { } }, '4n');
        }
        if (!metroOn) {
            try { window.Tone.Transport.bpm.value = progressionBpm; metroLoop?.start(0); window.Tone.Transport.start(); } catch (_) { }
            btn.textContent = 'Metronome: On'; metroOn = true;
        } else {
            try { metroLoop?.stop(0); window.Tone.Transport.stop(); } catch (_) { }
            btn.textContent = 'Metronome: Off'; metroOn = false;
        }
    };
    box.appendChild(label); box.appendChild(slider); box.appendChild(val); box.appendChild(btn);
    document.body.appendChild(box);
    tempoUi = box; tempoSlider = slider; metroBtn = btn;
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
    if (lineup.length === 0) return;
    // Capture current melody BEFORE any possible normalization using current rotationIndex
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
    renderMelodyLane();
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
    if (lineup.length === 0) return;
    lockedBass = [];
    for (let i = 0; i < lineup.length; i++) {
        const cube = lineup[i];
        let midi = getBassMidiForObject(cube);
        while (midi > 55) midi -= 12; while (midi < 36) midi += 12;
        lockedBass.push({ roman: cube.userData.roman, midi, color: borderColorForRoman(cube.userData.roman) });
    }
    renderBassLane();
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
    const msPerBeat = Math.round(60000 / progressionBpm);
    const perChordMs = 1000; // 1 second per chord per request
    for (let i = 0; i < lineup.length; i++) {
        const c = lineup[i];
        // Ultra-flashy active chord highlight + camera dolly follow
        try { highlightChordEffect(c, 900); pulseGiantAt(i, 700); focusCameraOnCube(c, 600); } catch (_) { }
        if (lockedMelody || lockedBass) {
            // Use locked lines if present; fallback to face-derived where missing
            const ctx = ensureAudio(); const now = ctx.currentTime; const duration = 1.1;
            const roman = c.userData.roman;
            // chord bed stays the same
            const chordMidis = buildLockedChordBedMidis(roman, withSeventh);
            if (sfChord && sfChord.play) chordMidis.forEach(m => sfChord.play(m, now, { duration, gain: 0.18 }));
            // bass
            if (bassEnabled) {
                let bassMidi = lockedBass?.[i]?.midi ?? getBassMidiForObject(c);
                while (bassMidi > 55) bassMidi -= 12; while (bassMidi < 36) bassMidi += 12;
                bassMidi = voiceLeadMidi(bassMidi, lastBassMidi);
                if (sfBass && sfBass.play) { sfBass.play(bassMidi, now, { duration, gain: 0.34 }); lastBassMidi = bassMidi; }
            }
            // melody
            if (melodyEnabled) {
                let melMidi = lockedMelody?.[i]?.midi ?? getMelodyMidiForObject(c);
                while (melMidi > 84) melMidi -= 12; while (melMidi < 60) melMidi += 12;
                melMidi = voiceLeadMidi(melMidi, lastMelodyMidi);
                if (sfMelody && sfMelody.play) { sfMelody.play(melMidi, now, { duration, gain: 0.3 }); lastMelodyMidi = melMidi; }
            }
        } else {
            playChordForObject(c);
        }
        addProgressionPointFromCube(c);
        await new Promise(r => setTimeout(r, perChordMs));
    }
}

// Optional: pin a specific CDN via ?sf= param already supported in readFlagsFromUrl()


