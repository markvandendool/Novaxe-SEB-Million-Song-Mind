import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { chordSetsC, inversionByQuarterTurn, noteSetsC, notesToDegreesInC, transposeNotes, degreeSets } from './chords.js';

const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);
const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 1000);
// Melody/Bass presets – lowered angle by ~10°
const melodyTarget = new THREE.Vector3(0, 1.4, 0);
const melodyCamPos = new THREE.Vector3(0, 8.9, 7.04);
const bassTarget = melodyTarget.clone();
const bassCamPos = new THREE.Vector3(0, -8.9, 7.04);
camera.position.copy(melodyCamPos);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.target.copy(melodyTarget);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const dir = new THREE.DirectionalLight(0xffffff, 0.7);
dir.position.set(3, 5, 4);
scene.add(dir);

// Grid plane for visual reference (can be hidden in OBS)
const grid = new THREE.GridHelper(40, 40, 0x444444, 0x333333);
grid.position.y = -2.2;
scene.add(grid);

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
    return String(s)
        .replace(/#/g, '♯')
        .replace(/([A-Ga-g])b/g, '$1♭')   // Eb → E♭
        .replace(/\bb(?=(?:\d|[IViv]))/g, '♭'); // b3/bVI → ♭3/♭VI
}

// Generate a canvas texture for labels (advanced with stacked superscripts)
function makeFrontLabelTexture(labelText, romanLabel) {
    const size = 1024; // extra crisp
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const ctx = c.getContext('2d');

    // Wood panel background + frame
    ctx.fillStyle = '#c89f6a';
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = '#2b1c10';
    ctx.lineWidth = 28;
    ctx.strokeRect(32, 32, size - 64, size - 64);

    // Parse base and superscripts: e.g., V(7)(b9) → base=V, supers=['7','b9']
    const supers = [];
    let base = String(labelText);
    // Pull out parenthetical tokens
    const paren = [...base.matchAll(/\(([^)]+)\)/g)].map(m => m[1]);
    if (paren.length) {
        supers.push(...paren);
        base = base.replace(/\([^)]*\)/g, '');
    }
    // Trailing simple tokens like I7 or viiº7
    const m1 = base.match(/^(.*?)(?:([#b]?\d+)|º7)$/);
    if (m1 && m1[2]) { supers.push(m1[2]); base = m1[1]; }
    else if (/(º7)$/.test(base)) { supers.push('º7'); base = base.replace(/º7$/, ''); }

    base = base.trim();
    const basePretty = toMusicalGlyphs(base);
    const supersPretty = supers.map(toMusicalGlyphs);

    // Main chord text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#1a1a1a';
    const baseSize = 420;
    ctx.font = `700 ${baseSize}px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial`;
    ctx.fillText(basePretty, size / 2, size / 2 + 10);

    // Right-aligned stacked supers in the top-right corner
    const supSize = 180;
    ctx.font = `700 ${supSize}px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'alphabetic';
    const rightX = size - 64;
    let y = 140;
    for (const token of supersPretty) {
        ctx.fillText(token, rightX, y);
        y += supSize * 0.95;
    }

    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
}

function makeFrontLabelTextureStyled(labelText, romanLabel) {
    const size = 1024;
    const c = document.createElement('canvas'); c.width = size; c.height = size;
    const ctx = c.getContext('2d');
    // background wood
    makeWoodPanel(ctx, size);
    // inner frame with border color tied to roman family
    const color = borderColorForRoman(romanLabel);
    const strokeColor = `#${(color).toString(16).padStart(6, '0')}`;
    const borderPx = Math.max(10, Math.round(size / 15)); // 1/15 width
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

    const basePretty = toMusicalGlyphs(base.trim());
    const supersPretty = supers.map(s => toMusicalGlyphs(s));

    // Embossed text color: EXACT same as border color (per requirement)
    const fill = strokeColor;

    // Typography base (Cochin for everything primary)
    const centerX = size / 2; const baselineY = size / 2 + 24;
    const baseSize = 440;
    const cochin = `'Cochin', 'Cochin-Bold', 'Times New Roman', serif`;
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

    // Supers: Finale Numerics (music), large and clear
    if (supersPretty.length) {
        const supSize = 240;
        const supFamily = `900 ${supSize}px 'Finale Numerics', 'Bravura Text', 'Noto Music', 'Cochin', 'Times New Roman', serif`;
        const rightX = size - 70; let y = 170;
        for (const token of supersPretty) {
            const text = String(token);
            ctx.save();
            // Light capsule for contrast
            ctx.font = supFamily; const w = ctx.measureText(text).width;
            const padX = 14, padY = 10; const rectX = rightX - w - padX * 2; const rectY = y - supSize + padY - 8;
            ctx.fillStyle = 'rgba(255,255,255,0.12)';
            ctx.strokeStyle = 'rgba(0,0,0,0.08)'; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.rect(rectX, rectY, w + padX * 2, supSize + padY * 1.2); ctx.fill(); ctx.stroke();
            // Text
            ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic';
            ctx.fillStyle = fill;
            ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 4;
            ctx.font = supFamily; ctx.fillText(text, rightX, y);
            ctx.shadowColor = 'transparent';
            ctx.strokeStyle = 'rgba(255,255,255,0.28)'; ctx.lineWidth = 5;
            ctx.strokeText(text, rightX, y - 1);
            ctx.restore();
            y += supSize * 0.92;
        }
    }

    // Applied-chord annotation small text at bottom
    const annotation = annotationForRoman(romanLabel);
    if (annotation) {
        const a = toMusicalGlyphs(annotation).replace(/ of /g, ' of ');
        ctx.font = `800 120px 'Finale Numerics', 'Bravura Text', 'Noto Music', 'Cochin', 'Times New Roman', serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = fill;
        ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 3;
        ctx.fillText(`[${a}]`, size / 2, size - 110);
        ctx.shadowColor = 'transparent';
    }

    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    tex.generateMipmaps = true; tex.minFilter = THREE.LinearMipmapLinearFilter; tex.magFilter = THREE.LinearFilter;
    tex.colorSpace = THREE.SRGBColorSpace; tex.needsUpdate = true; return tex;
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
    // Attempt multiple PNG name candidates before falling back to manifest or canvas
    const candidates = candidatePngNamesForRoman(romanLabel).map(n => `./${encodeURIComponent(n)}`);
    const tryLoad = (idx) => new Promise((resolve) => {
        if (idx >= candidates.length) {
            // Manifest secondary fallback
            const url = textureManifest && textureManifest[label];
            if (!url) return resolve(makeFrontLabelTexture(label, romanLabel));
            const loader2 = new THREE.TextureLoader();
            loader2.load(url, tex => {
                tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
                tex.generateMipmaps = true; tex.minFilter = THREE.LinearMipmapLinearFilter; tex.magFilter = THREE.LinearFilter; tex.colorSpace = THREE.SRGBColorSpace;
                resolve(tex);
            }, undefined, () => resolve(makeFrontLabelTexture(label, romanLabel)));
            return;
        }
        const loader = new THREE.TextureLoader();
        loader.load(candidates[idx], tex => {
            tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
            tex.generateMipmaps = true; tex.minFilter = THREE.LinearMipmapLinearFilter; tex.magFilter = THREE.LinearFilter; tex.colorSpace = THREE.SRGBColorSpace;
            resolve(tex);
        }, undefined, () => resolve(tryLoad(idx + 1)));
    });
    return tryLoad(0);
}

function makeCircleDiamondFace(text, color, rotateDeg = 0) {
    const size = 512; // higher res for crisp edges
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.translate(size / 2, size / 2);
    ctx.rotate((rotateDeg * Math.PI) / 180);
    ctx.translate(-size / 2, -size / 2);
    ctx.fillStyle = '#f0e6d8';
    ctx.fillRect(0, 0, size, size);
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
    // Use music-capable fonts first if present
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
    // MOTION centered around ~2 o'clock on the right circle (anchor ~ 30°)
    drawCurvedWord('MOTION', right.x, right.y, right.r - 28, Math.PI / 6, { fill: '#222', spacingDeg: 12 });
    // TENSION centered around ~10 o'clock on the left circle (anchor ~ 150°)
    drawCurvedWord('TENSION', left.x, left.y, left.r - 28, (5 * Math.PI) / 6, { fill: '#222', spacingDeg: 12 });
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
    }
    if (!bassMesh) {
        const tex = makeTitleTexture(['BASSLINE'], { width: 4096, height: 1024, size: 420, weight: 1000 });
        bassMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.0, side: THREE.DoubleSide, depthWrite: false });
        const geo = new THREE.PlaneGeometry(16, 8);
        bassMesh = new THREE.Mesh(geo, bassMat);
        // readable from below: flip to face downward without mirroring
        bassMesh.rotation.x = Math.PI / 2;
        bassMesh.position.set(0, 0.002, 2.8);
        scene.add(bassMesh);
    }
}

// State
const cubes = [];
let currentSet = 'none';
let labelMode = 'roman';
let currentKey = 'C';
// Shelf (back-row) configuration
const shelfZ = -4.2;
const shelfY = 1.6;
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
const borderColorByRoman = {
    'I': 0x7fdfff, 'vi': 0x7fdfff, 'I7': 0x7fdfff,
    'IV': 0x6f42c1, 'ii': 0x6f42c1, 'iv': 0x6f42c1, '#ivø': 0x6f42c1,
    'V': 0xff7f50, 'viiø': 0xff7f50, '#vº': 0xff7f50, 'VII': 0xff7f50,
    'iii': 0xbfbfbf,
};
function borderColorForRoman(roman) {
    if (borderColorByRoman[roman]) return borderColorByRoman[roman];
    // Family heuristics to match legacy PNG palette
    if (/IV|iv|\bii\b|#iv/.test(roman)) return 0x6f42c1; // purple family
    if (/\bV\b|\bv\b|VII|#v/.test(roman)) return 0xff7f50; // coral dominants
    if (/\bI\b|\bvi\b|I7/.test(roman)) return 0x7fdfff; // cyan tonics
    return 0xbfbfbf; // neutral
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
    // Always prefer the official map on load
    try {
        const res = await fetch('./Shelf%20Map%20Official.json');
        if (res.ok) {
            const json = await res.json();
            applyShelfMap(json);
            return;
        }
    } catch { }
    // Fallback to any saved local adjustments
    try {
        const raw = localStorage.getItem(MAP_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            applyShelfMap(parsed);
        }
    } catch { }
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

function saveShelfMapToLocalStorage() {
    const positions = {};
    for (const [k, v] of Object.entries(shelfSlots)) {
        positions[k] = { x: v.x, y: v.y, z: v.z };
    }
    const json = { positions, scales: scaleByRoman };
    try { localStorage.setItem(MAP_STORAGE_KEY, JSON.stringify(json)); } catch { }
}

// Ensure web fonts are available before drawing to canvas
async function ensureFontsLoaded() {
    if (window.__obsFontsLoaded) return window.__obsFontsLoaded;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Lobster&family=Noto+Music&family=Noto+Sans+SC:wght@700;900&display=swap';
    document.head.appendChild(link);
    window.__obsFontsLoaded = Promise.race([
        (async () => {
            try {
                await document.fonts.ready;
                await Promise.all([
                    document.fonts.load('900 440px "Lobster"'),
                    document.fonts.load('900 240px "Noto Music"'),
                    document.fonts.load('900 440px "Noto Sans SC"')
                ]);
            } catch (_) { /* ignore */ }
            return true;
        })(),
        new Promise(resolve => setTimeout(() => resolve(true), 1200))
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
    addQuadrantOverlay(m);
    shelfCubes.push(m);
    // Record exact origin
    shelfOriginByRoman[roman] = { position: pos.clone(), scale: s, quaternion: m.quaternion.clone() };
    scene.add(m);
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
    // Start with empty front row
    lineup = [];
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
function getIntersects(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObjects([...cubes, ...shelfCubes], false);
}

function onPointerDown(e) {
    const hits = getIntersects(e);
    if (hits.length > 0) {
        let obj = hits[0].object;
        // If we clicked the invisible overlay, act on its parent cube
        if (obj.userData?.isOverlay && obj.userData.parent) obj = obj.userData.parent;
        pendingObj = obj;
        mouseDownTime = performance.now();
        const rect = renderer.domElement.getBoundingClientRect();
        mouseDownPos.set(e.clientX - rect.left, e.clientY - rect.top);
        controls.enabled = !adjustMode;
        if (adjustMode && pendingObj.userData?.isShelf) {
            lastShelfTarget = pendingObj;
        }
    }
}

function onPointerMove(e) {
    if (!pendingObj && !dragging) return;
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const worldPoint = new THREE.Vector3();
    if (!dragging && pendingObj) {
        // Check drag threshold
        const dx = (e.clientX - rect.left) - mouseDownPos.x;
        const dy = (e.clientY - rect.top) - mouseDownPos.y;
        if (Math.hypot(dx, dy) > DRAG_START_PX) {
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
    if (dragging) {
        const r = dragging.userData.roman;
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
        }
        dragging = null;
        controls.enabled = true;
        return;
    }
    // Rotation click if minimal move/time (only front-face quadrant behavior)
    if (pendingObj) {
        const rect = renderer.domElement.getBoundingClientRect();
        const dx = (e.clientX - rect.left) - mouseDownPos.x;
        const dy = (e.clientY - rect.top) - mouseDownPos.y;
        const moved = Math.hypot(dx, dy);
        const elapsed = now - mouseDownTime;
        if (moved <= CLICK_MAX_PX && elapsed <= CLICK_MAX_MS) {
            // If clicking a shelf cube, enqueue add + audio and return
            if (!adjustMode && pendingObj.userData?.isShelf) {
                enqueueShelfAdd(pendingObj);
                pendingObj = null; return;
            }
            // Do NOT rotate shelf cubes under any circumstance
            if (pendingObj.userData?.isShelf) { pendingObj = null; return; }
            const hits = getIntersects(e);
            let hit = null;
            for (const h of hits) {
                if (h.object === pendingObj || h.object === pendingObj.userData?.overlay || h.object.parent === pendingObj) { hit = h; break; }
            }
            if (hit) {
                const isOverlay = (hit.object === pendingObj.userData?.overlay || hit.object.parent === pendingObj);
                const normalZ = isOverlay ? 1 : (hit.face?.normal?.z ?? 0);
                if (Math.abs(normalZ - 1) < 0.5) {
                    const local = pendingObj.worldToLocal(hit.point.clone());
                    const absX = Math.abs(local.x);
                    const absY = Math.abs(local.y);
                    let targetToneIndex; if (absX > absY) targetToneIndex = local.x > 0 ? 1 : 3; else targetToneIndex = local.y > 0 ? 2 : 0;
                    const r = pendingObj.userData.rotationIndex || 0;
                    const cw = (targetToneIndex - r + 4) % 4; const ccw = (r - targetToneIndex + 4) % 4;
                    let angle = 0; let delta = 0;
                    if (cw <= ccw) { angle = -cw * (Math.PI / 2); delta = +cw; } else { angle = ccw * (Math.PI / 2); delta = -ccw; }
                    if (angle !== 0) {
                        const extra = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), angle);
                        const finalQ = pendingObj.quaternion.clone().multiply(extra);
                        animateQuaternion(pendingObj, finalQ, 700);
                        pendingObj.userData.rotationIndex = (pendingObj.userData.rotationIndex + (delta + 4)) % 4;
                        // Trigger audio with new orientation
                        playChordForObject(pendingObj);
                    }
                    pendingObj.userData.rotationIndex = ((pendingObj.userData.rotationIndex % 4) + 4) % 4;
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
    const overlayGeom = new THREE.PlaneGeometry(1.15, 1.15); // slightly smaller than face
    const overlayMat = makeQuadrantOverlayMaterial();
    const overlay = new THREE.Mesh(overlayGeom, overlayMat);
    overlay.position.set(0, 0, (cubeSize / 2) + 0.002); // sit just above +z face
    parentCube.add(overlay);
    parentCube.userData.overlay = overlay;
    overlay.userData = { isOverlay: true, parent: parentCube };
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
let chordInst = 'acoustic_grand_piano';
let bassInst = 'acoustic_bass';
let melodyInst = 'flute';
let sfChord = null, sfBass = null, sfMelody = null;
async function loadInstruments() {
    try {
        if (window.Soundfont) {
            const ac = ensureAudio();
            sfChord = await window.Soundfont.instrument(ac, chordInst);
            sfBass = await window.Soundfont.instrument(ac, bassInst);
            sfMelody = await window.Soundfont.instrument(ac, melodyInst);
        }
    } catch (_) { }
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
// Initialize labelMode from current UI so startup respects it
labelMode = labelSelect ? labelSelect.value : labelMode;
withSeventh = !!(with7th && with7th.checked);
bassEnabled = !!(bassEnabledEl && bassEnabledEl.checked);
melodyEnabled = !!(melodyEnabledEl && melodyEnabledEl.checked);
chordInst = chordInstEl?.value || chordInst;
bassInst = bassInstEl?.value || bassInst;
melodyInst = melodyInstEl?.value || melodyInst;
with7th?.addEventListener('change', () => { withSeventh = !!with7th.checked; });
bassEnabledEl?.addEventListener('change', () => { bassEnabled = !!bassEnabledEl.checked; });
melodyEnabledEl?.addEventListener('change', () => { melodyEnabled = !!melodyEnabledEl.checked; });
chordInstEl?.addEventListener('change', async () => { chordInst = chordInstEl.value; await loadInstruments(); });
bassInstEl?.addEventListener('change', async () => { bassInst = bassInstEl.value; await loadInstruments(); });
melodyInstEl?.addEventListener('change', async () => { melodyInst = melodyInstEl.value; await loadInstruments(); });
playProgBtn?.addEventListener('click', () => { playFrontRowProgression(); });

setSelect.addEventListener('change', () => {
    currentSet = setSelect.value;
    loadSet(currentSet);
});

labelSelect.addEventListener('change', () => {
    labelMode = labelSelect.value;
    updateLabels();
});
keySelect?.addEventListener('change', () => {
    currentKey = keySelect.value;
    updateLabels();
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
(async () => { await ensureFontsLoaded(); await loadSet(currentSet); await updateLabels(); await loadInstruments(); setViewAbove(); })();

// Animation loop
function animate() {
    controls.update();
    // drive tweens
    const now = performance.now();
    for (let i = activeTweens.length - 1; i >= 0; i--) {
        const done = activeTweens[i].tick(now);
        if (done) activeTweens.splice(i, 1);
    }
    // Harmonized drag smoothing
    tickDragSmoothing();
    // Enforce two rest zones for all non-dragging cubes
    enforceRestZones();
    // Update ground title opacities based on camera angle relative to plane y=0
    let belowAlpha = 0;
    if (melodyMat && bassMat) {
        const toTarget = camera.position.clone().sub(controls.target);
        const horiz = Math.hypot(toTarget.x, toTarget.z);
        const angle = Math.atan2(Math.abs(toTarget.y), horiz); // radians above/below plane
        const deg = angle * (180 / Math.PI);
        const t = Math.min(1, deg / 30);
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
        } else if (c.userData?.isShelf) {
            // Exact shelf origin if available
            const r = c.userData.roman;
            const origin = shelfOriginByRoman[r];
            if (origin?.position) {
                c.position.copy(origin.position);
                c.scale.setScalar(origin.scale ?? c.scale.x);
            } else {
                c.position.z = shelfZ;
            }
        }
    }
}

// Simple WebAudio chord playback
function ensureAudio() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); return audioCtx; }
const NOTE_INDEX = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
function noteToFreq(semitoneIndex, octave = 4) { const a4 = 440; const a4Index = 9 + 12 * 4; const idx = semitoneIndex + 12 * octave; return a4 * Math.pow(2, (idx - a4Index) / 12); }
function parseNoteName(name) {
    // e.g., C, C#, Db, Bb; infer octave around 4
    const n = name.replace(/[^A-G#b]/g, '');
    const idx = NOTE_INDEX[n] ?? 0; return { idx, octave: 4 };
}
function getFaceOrder(rotationIndex, includeSeventh) {
    const r = ((rotationIndex % 4) + 4) % 4;
    const b = r; // bottom
    const right = (r + 1) % 4;
    const top = (r + 2) % 4;
    const left = (r + 3) % 4; // 7th face
    if (includeSeventh) return [b, right, left, top];
    return [b, right, top];
}
function buildVoiceFreqs(roman, rotationIndex, includeSeventh) {
    const ctx = ensureAudio();
    const tones = noteSetsC[roman] || ['C', 'E', 'G', 'B'];
    const names = transposeNotes(tones, currentKey);
    const order = getFaceOrder(rotationIndex || 0, includeSeventh);
    // Map to ascending MIDI
    const baseOct = 4;
    const midiOf = (name) => {
        const { idx, octave } = parseNoteName(name);
        return idx + 12 * (octave || baseOct);
    };
    const semis = order.map(i => midiOf(names[i]));
    const asc = [];
    let prev = semis[0];
    asc.push(prev);
    for (let k = 1; k < semis.length; k++) {
        let m = semis[k];
        while (m < prev) m += 12;
        asc.push(m);
        prev = m;
    }
    return asc.map(m => 440 * Math.pow(2, (m - (9 + 12 * 4)) / 12));
}
function playChordForObject(obj) {
    const ctx = ensureAudio();
    const freqsAsc = buildVoiceFreqs(obj.userData.roman, obj.userData.rotationIndex || 0, withSeventh);
    const now = ctx.currentTime;
    const duration = 1.25;

    // Master
    const master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);

    // Layers
    const chordBus = ctx.createGain(); chordBus.gain.value = 0.22; chordBus.connect(master);
    const bassBus = ctx.createGain(); bassBus.gain.value = 0.28; bassBus.connect(master);
    const melodyBus = ctx.createGain(); melodyBus.gain.value = 0.24; melodyBus.connect(master);

    // Envelope helper
    const env = (g, t0, d) => {
        g.gain.setValueAtTime(0.0, t0);
        g.gain.linearRampToValueAtTime(g.gain.value + 0.001, t0 + 0.01);
        g.gain.linearRampToValueAtTime(g.gain.value, t0 + 0.03);
        g.gain.linearRampToValueAtTime(0.0, t0 + d);
    };

    // Determine bottom/top for bass/melody layers
    const lowest = freqsAsc[0];
    const highest = freqsAsc[freqsAsc.length - 1];

    // Chord bed (triad or with 7th) – same set regardless of inversion, just pitched ascending
    freqsAsc.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = i === 3 ? 'triangle' : 'sine';
        osc.frequency.value = f;
        osc.connect(g).connect(chordBus);
        const t0 = now;
        const d = duration;
        env(g, t0, d);
        osc.start(t0); osc.stop(t0 + d + 0.02);
    });

    // Bass layer – lowest face
    if (lowest) {
        const osc = ctx.createOscillator(); const g = ctx.createGain();
        osc.type = 'sawtooth'; osc.frequency.value = lowest;
        osc.connect(g).connect(bassBus);
        env(g, now, duration);
        osc.start(now); osc.stop(now + duration + 0.02);
    }

    // Melody layer – top face
    if (highest) {
        const osc = ctx.createOscillator(); const g = ctx.createGain();
        osc.type = 'square'; osc.frequency.value = highest;
        osc.connect(g).connect(melodyBus);
        env(g, now, duration);
        osc.start(now); osc.stop(now + duration + 0.02);
    }
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
        clone.userData = { ...shelf.userData, isShelf: false, rotationIndex: 0 };
        clone.position.copy(shelf.position);
        clone.scale.copy(shelf.scale);
        addQuadrantOverlay(clone);
        scene.add(clone);
        cubes.push(clone);
        const xs = computeSlotPositions(lineup.length + 1);
        const targetX = xs[lineup.length];
        lineup.push(clone);
        animateScale(clone, FRONT_ROW_SCALE, 280);
        animatePosition(clone, new THREE.Vector3(targetX, 0, 0), 300);
        reflowLineup();
        playChordForObject(clone);
        addProgressionPointFromCube(shelf); // record from shelf origin too
        await new Promise(r => setTimeout(r, 180));
    } catch (_) { }
}

let progressionEnabled = false;
let progressionArrows = [];
let progressionPoints = [];
let playButtonMesh = null;

function createPlayButton() {
    if (playButtonMesh) return;
    const geo = new THREE.ConeGeometry(0.35, 0.5, 24);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffd34d, emissive: 0x222200, metalness: 0.3, roughness: 0.4 });
    playButtonMesh = new THREE.Mesh(geo, mat);
    playButtonMesh.rotation.z = -Math.PI / 2; // like a play icon
    playButtonMesh.position.set(0, 0.25, 1.1);
    playButtonMesh.userData.isPlayButton = true;
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

async function playFrontRowProgression() {
    if (lineup.length === 0) return;
    for (let i = 0; i < lineup.length; i++) {
        const c = lineup[i];
        playChordForObject(c);
        addProgressionPointFromCube(c);
        await new Promise(r => setTimeout(r, 450));
    }
}


