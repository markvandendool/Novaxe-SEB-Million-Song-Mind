import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { chordSetsC, inversionByQuarterTurn, noteSetsC, notesToDegreesInC } from './chords.js';

const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 4, 12);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const dir = new THREE.DirectionalLight(0xffffff, 0.7);
dir.position.set(3, 5, 4);
scene.add(dir);

// Grid plane for visual reference (can be hidden in OBS)
const grid = new THREE.GridHelper(40, 40, 0x444444, 0x333333);
grid.position.y = -1.5;
scene.add(grid);

// Shared geometry
const cubeSize = 1.2;
const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

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

// Generate a canvas texture for labels
function makeLabelTexture(text) {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#c89f6a'; // wood-ish
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#3b2c1e';
    ctx.strokeStyle = '#2b1c10';
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, size - 20, size - 20);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 110px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial';
    ctx.fillText(text, size / 2, size / 2 + 8);
    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    texture.needsUpdate = true;
    return texture;
}

function loadFaceTexture(label) {
    const url = textureManifest && textureManifest[label];
    if (!url) return Promise.resolve(makeLabelTexture(label));
    return new Promise((resolve) => {
        const loader = new THREE.TextureLoader();
        loader.load(url, tex => {
            tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
            resolve(tex);
        }, undefined, () => resolve(makeLabelTexture(label)));
    });
}

function makeCircleDiamondFace(text, color, rotateDeg = 0) {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    // rotate full artwork
    ctx.translate(size / 2, size / 2);
    ctx.rotate((rotateDeg * Math.PI) / 180);
    ctx.translate(-size / 2, -size / 2);
    ctx.fillStyle = '#f0e6d8';
    ctx.fillRect(0, 0, size, size);
    // colored circle (use most of face)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.45, 0, Math.PI * 2);
    ctx.fill();
    // white diamond on top
    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = '#ffffff';
    const d = size * 0.42;
    ctx.fillRect(-d / 2, -d / 2, d, d);
    ctx.restore();
    // note or degree label
    ctx.fillStyle = '#111';
    ctx.font = 'bold 80px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, size / 2, size / 2);
    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    tex.needsUpdate = true;
    return new THREE.MeshStandardMaterial({ map: tex, transparent: true });
}

async function makeMaterials(label, romanLabel) {
    // Front face: chord name label texture (strong bias always facing camera)
    const labelTex = await loadFaceTexture(label);
    const front = new THREE.MeshStandardMaterial({ map: labelTex, transparent: true });
    const wood = new THREE.MeshStandardMaterial({ color: 0xd5b38a });

    // Determine ingredients (root,3rd,5th,7th)
    const notes = noteSetsC[romanLabel] || ['-', '-', '-', '-'];
    const display = (labelMode === 'roman') ? notesToDegreesInC(notes) : notes;
    // rotate faces so that a 90° cube rotation around Z keeps diamond labels upright
    const faceBottom = makeCircleDiamondFace(display[0], '#2ecc71', 0);     // root
    const faceRight = makeCircleDiamondFace(display[1], '#e74c3c', 90);     // 3rd
    const faceTop = makeCircleDiamondFace(display[2], '#3498db', 180);      // 5th
    const faceLeft = makeCircleDiamondFace(display[3], '#bdc3c7', -90);     // 7th

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

// State
const cubes = [];
let currentSet = 'major';
let labelMode = 'roman';
let textureManifest = null;

// Interaction helpers
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let dragging = null;
let dragOffset = new THREE.Vector3();
const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
let pendingObj = null;
let mouseDownPos = new THREE.Vector2();
let mouseDownTime = 0;
const DRAG_START_PX = 8;
const CLICK_MAX_PX = 5;
const CLICK_MAX_MS = 250;

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

async function loadSet(setName) {
    clearCubes();
    const data = chordSetsC[setName];
    for (const item of data) {
        const label = item[labelMode];
        const materials = await makeMaterials(label, item.roman);
        const mesh = new THREE.Mesh(geometry.clone(), materials);
        mesh.userData = {
            roman: item.roman,
            letter: item.letter,
            rotationIndex: 0,
        };
        mesh.position.set((Math.random() - 0.5) * 6, 0, (Math.random() - 0.5) * 4);
        mesh.quaternion.identity();
        cubes.push(mesh);
        scene.add(mesh);
    }
    lineup = [...cubes];
    reflowLineup();
}

async function updateLabels() {
    for (const c of cubes) {
        const label = c.userData[labelMode];
        const materials = await makeMaterials(label);
        c.material.forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
        c.material = materials;
    }
}

// Raycast helpers
function getIntersects(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObjects(cubes, false);
}

function onPointerDown(e) {
    const hits = getIntersects(e);
    if (hits.length > 0) {
        pendingObj = hits[0].object;
        mouseDownTime = performance.now();
        const rect = renderer.domElement.getBoundingClientRect();
        mouseDownPos.set(e.clientX - rect.left, e.clientY - rect.top);
        controls.enabled = true;
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
            dragging = pendingObj;
            pendingObj = null;
            removeFromLineup(dragging);
            cancelTweensFor(dragging);
            plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 1, 0), dragging.position);
            raycaster.ray.intersectPlane(plane, worldPoint);
            dragOffset.copy(worldPoint).sub(dragging.position);
            controls.enabled = false;
        }
    }
    if (dragging) {
        if (raycaster.ray.intersectPlane(plane, worldPoint)) {
            const target = worldPoint.sub(dragOffset);
            target.y = 0;
            dragging.position.copy(target);
            const idx = computeInsertionIndex(dragging.position.x);
            if (idx !== previewIndex) {
                previewIndex = idx;
                previewMakeWay(previewIndex);
            }
        }
    }
}

function onPointerUp(e) {
    const now = performance.now();
    if (dragging) {
        // Finalize insertion at preview index
        const idx = (previewIndex == null) ? computeInsertionIndex(dragging.position.x) : previewIndex;
        previewIndex = null;
        lineup.splice(idx, 0, dragging);
        reflowLineup();
        dragging = null;
        controls.enabled = true;
        return;
    }
    // Rotation click if minimal move/time
    if (pendingObj) {
        const rect = renderer.domElement.getBoundingClientRect();
        const dx = (e.clientX - rect.left) - mouseDownPos.x;
        const dy = (e.clientY - rect.top) - mouseDownPos.y;
        const moved = Math.hypot(dx, dy);
        const elapsed = now - mouseDownTime;
        if (moved <= CLICK_MAX_PX && elapsed <= CLICK_MAX_MS) {
            const hits = getIntersects(e);
            const hit = (hits.length && hits[0].object === pendingObj) ? hits[0] : null;
            if (hit) {
                const faceNormal = hit.face.normal.clone();
                if (Math.abs(faceNormal.z - 1) < 0.5) {
                    // Front face zones → bring chosen side to bottom using local point
                    const localPoint = pendingObj.worldToLocal(hit.point.clone());
                    const absX = Math.abs(localPoint.x);
                    const absY = Math.abs(localPoint.y);
                    let angle = 0; // radians around Z
                    let delta = 0; // inversion index increment modulo 4
                    if (absX > absY) {
                        if (localPoint.x > 0) { // right → bottom
                            angle = -Math.PI / 2; delta = +1;
                        } else { // left → bottom
                            angle = +Math.PI / 2; delta = -1;
                        }
                    } else {
                        if (localPoint.y > 0) { // top → bottom
                            angle = Math.PI; delta = +2;
                        } else { // bottom → bottom (no change)
                            angle = 0; delta = 0;
                        }
                    }
                    if (angle !== 0) {
                        const extra = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), angle);
                        const finalQ = pendingObj.quaternion.clone().multiply(extra);
                        animateQuaternion(pendingObj, finalQ, 700);
                        pendingObj.userData.rotationIndex = (pendingObj.userData.rotationIndex + (delta + 4)) % 4;
                    }
                    const inversion = inversionByQuarterTurn[pendingObj.userData.rotationIndex];
                    console.log('Play chord', { roman: pendingObj.userData.roman, letter: pendingObj.userData.letter, inversion });
                } else {
                    // Bring clicked face to front
                    const targetQ = targetQuaternionForFaceNormal(faceNormal);
                    animateQuaternion(pendingObj, targetQ, 800);
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

function onClick(e) {
    const hits = getIntersects(e);
    if (!hits.length) return;
    const hit = hits[0];
    const obj = hit.object;
    // If front face was clicked, spin 90° around Y for next inversion
    const faceNormal = hit.face.normal.clone(); // local space
    const targetQ = targetQuaternionForFaceNormal(faceNormal);
    // Determine if face is +z (front)
    if (Math.abs(faceNormal.z - 1) < 0.5) {
        obj.userData.rotationIndex = (obj.userData.rotationIndex + 1) % 4;
        const extra = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
        const finalQ = obj.quaternion.clone().multiply(extra);
        animateQuaternion(obj, finalQ, 900);
        const inversion = inversionByQuarterTurn[obj.userData.rotationIndex];
        console.log('Play chord', { roman: obj.userData.roman, letter: obj.userData.letter, inversion });
    } else {
        // Rotate cube so the clicked face comes to the front (+Z)
        animateQuaternion(obj, targetQ, 900);
    }
}

renderer.domElement.addEventListener('pointerdown', (e) => {
    const hits = getIntersects(e);
    if (hits.length > 0) {
        dragging = hits[0].object;
        // Remove from lineup immediately so others close the gap
        removeFromLineup(dragging);
        cancelTweensFor(dragging);
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const worldPoint = new THREE.Vector3();
        plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 1, 0), dragging.position);
        raycaster.ray.intersectPlane(plane, worldPoint);
        dragOffset.copy(worldPoint).sub(dragging.position);
        controls.enabled = false;
    }
});
renderer.domElement.addEventListener('pointermove', onPointerMove);
window.addEventListener('pointerup', onPointerUp);

// UI wiring
const setSelect = document.getElementById('set-select');
const labelSelect = document.getElementById('label-mode');
document.getElementById('arrange-btn').addEventListener('click', reflowLineup);
document.getElementById('reset-btn').addEventListener('click', () => loadSet(currentSet));

setSelect.addEventListener('change', () => {
    currentSet = setSelect.value;
    loadSet(currentSet);
});

labelSelect.addEventListener('change', () => {
    labelMode = labelSelect.value;
    updateLabels();
});

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onResize);

// Initial: try to load texture manifest mapping { label: url }
fetch('./textures/manifest.json')
    .then(r => r.ok ? r.json() : null)
    .then(j => { textureManifest = j || null; loadSet(currentSet); })
    .catch(() => loadSet(currentSet));

// Animation loop
function animate() {
    controls.update();
    // drive tweens
    const now = performance.now();
    for (let i = activeTweens.length - 1; i >= 0; i--) {
        const done = activeTweens[i].tick(now);
        if (done) activeTweens.splice(i, 1);
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
animate();


