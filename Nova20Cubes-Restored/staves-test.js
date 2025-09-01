/**
 * Music Staves 3D Test - Render staves in front of melody text
 */

class MusicStaves3DTest {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.staveMeshes = [];
        this.initialized = false;

        // Wait for VexFlow to load
        this.initWhenReady();
    }

    async initWhenReady() {
        if (typeof VF === 'undefined') {
            setTimeout(() => this.initWhenReady(), 100);
            return;
        }

        this.initialized = true;
        console.log('[STAVES TEST] VexFlow ready - creating music staves');
        this.createTestStaves();
    }

    createTestStaves() {
        // Create a grand staff (treble + bass) in 3D space
        // Position: In front of melody text, front row area

        const staveWidth = 400;
        const staveHeight = 80;

        // Treble staff
        const trebleStave = this.createStaveCanvas('treble', staveWidth, staveHeight);
        const trebleMesh = this.createStaveMesh(trebleStave, staveWidth, staveHeight);

        // Position treble staff in front of melody text
        // Based on ChordCubes coordinate system - front row is typically around z=5-6
        trebleMesh.position.set(0, 6, 8); // Center, elevated, in front
        trebleMesh.name = 'treble-staff';

        // Bass staff (below treble)
        const bassStave = this.createStaveCanvas('bass', staveWidth, staveHeight);
        const bassMesh = this.createStaveMesh(bassStave, staveWidth, staveHeight);

        bassMesh.position.set(0, 4, 8); // Below treble staff
        bassMesh.name = 'bass-staff';

        // Add both staves to scene
        this.scene.add(trebleMesh);
        this.scene.add(bassMesh);

        this.staveMeshes.push(trebleMesh, bassMesh);

        console.log('[STAVES TEST] ✅ Grand staff created at positions:');
        console.log('  Treble:', trebleMesh.position);
        console.log('  Bass:', bassMesh.position);

        // Add some test notes
        this.addTestChordProgression();
    }

    createStaveCanvas(clef, width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d');

        // Clear with transparent background
        context.clearRect(0, 0, width, height);

        // Create VexFlow renderer
        const renderer = new VF.Renderer(canvas, VF.Renderer.Backends.CANVAS);
        const vfContext = renderer.getContext();

        // Create stave
        const stave = new VF.Stave(10, 10, width - 20);

        // Add clef
        if (clef === 'treble') {
            stave.addClef('treble');
        } else if (clef === 'bass') {
            stave.addClef('bass');
        }

        // Add time signature
        stave.addTimeSignature('4/4');

        // Add key signature (C major for now)
        stave.addKeySignature('C');

        // Draw the stave
        stave.setContext(vfContext).draw();

        return canvas;
    }

    createStaveMesh(canvas, width, height) {
        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;

        // Create material with transparency
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.1,
            side: THREE.DoubleSide
        });

        // Create geometry - scale to reasonable 3D size
        const geometry = new THREE.PlaneGeometry(width / 50, height / 50); // Scale down for 3D space

        const mesh = new THREE.Mesh(geometry, material);

        return mesh;
    }

    addTestChordProgression() {
        // Add a simple chord progression to the treble staff
        // This will show how chord symbols align with the staves

        const chordWidth = 200;
        const chordHeight = 60;

        const testChords = [
            { symbol: 'Cmaj7', position: { x: -6, y: 7, z: 8 } },
            { symbol: 'Am7', position: { x: -2, y: 7, z: 8 } },
            { symbol: 'Dm7', position: { x: 2, y: 7, z: 8 } },
            { symbol: 'G7', position: { x: 6, y: 7, z: 8 } }
        ];

        testChords.forEach(chord => {
            const chordCanvas = this.createChordSymbolCanvas(chord.symbol, chordWidth, chordHeight);
            const chordMesh = this.createStaveMesh(chordCanvas, chordWidth, chordHeight);

            chordMesh.position.set(chord.position.x, chord.position.y, chord.position.z);
            chordMesh.name = `chord-${chord.symbol}`;

            this.scene.add(chordMesh);
            this.staveMeshes.push(chordMesh);
        });

        console.log('[STAVES TEST] ✅ Test chord progression added');
    }

    createChordSymbolCanvas(chordSymbol, width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d');

        // Clear background
        context.clearRect(0, 0, width, height);

        // Semi-transparent background
        context.fillStyle = 'rgba(255, 255, 255, 0.9)';
        context.fillRect(5, 5, width - 10, height - 10);

        // Border
        context.strokeStyle = '#333';
        context.lineWidth = 2;
        context.strokeRect(5, 5, width - 10, height - 10);

        // Chord symbol text
        context.fillStyle = '#000';
        context.font = 'bold 24px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(chordSymbol, width / 2, height / 2);

        return canvas;
    }

    // Update staves to always face camera
    updateStaveOrientations() {
        if (!this.initialized) return;

        this.staveMeshes.forEach(mesh => {
            mesh.lookAt(this.camera.position);
        });
    }

    // Remove all test staves
    clearStaves() {
        this.staveMeshes.forEach(mesh => {
            this.scene.remove(mesh);
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) {
                if (mesh.material.map) mesh.material.map.dispose();
                mesh.material.dispose();
            }
        });
        this.staveMeshes = [];
        console.log('[STAVES TEST] All staves cleared');
    }

    // Test different positions
    testPositions() {
        console.log('[STAVES TEST] Testing different stave positions...');

        // Move staves to different positions to test visibility
        const positions = [
            { name: 'Front Center', treble: [0, 6, 8], bass: [0, 4, 8] },
            { name: 'Front Left', treble: [-4, 6, 8], bass: [-4, 4, 8] },
            { name: 'Front Right', treble: [4, 6, 8], bass: [4, 4, 8] },
            { name: 'Higher', treble: [0, 8, 8], bass: [0, 6, 8] }
        ];

        let currentPosition = 0;

        const cyclePosition = () => {
            if (this.staveMeshes.length < 2) return;

            const pos = positions[currentPosition];
            const trebleStaff = this.staveMeshes.find(m => m.name === 'treble-staff');
            const bassStaff = this.staveMeshes.find(m => m.name === 'bass-staff');

            if (trebleStaff && bassStaff) {
                trebleStaff.position.set(...pos.treble);
                bassStaff.position.set(...pos.bass);
                console.log(`[STAVES TEST] Moved to: ${pos.name}`);
            }

            currentPosition = (currentPosition + 1) % positions.length;

            setTimeout(cyclePosition, 3000); // Change every 3 seconds
        };

        setTimeout(cyclePosition, 1000); // Start after 1 second
    }
}

// Integration with existing system
function initStavesTest() {
    if (typeof window.scene === 'undefined' || typeof window.camera === 'undefined') {
        console.log('[STAVES TEST] Waiting for Three.js scene...');
        setTimeout(initStavesTest, 500);
        return;
    }

    window.stavesTest = new MusicStaves3DTest(window.scene, window.camera);

    // Add to render loop for billboard behavior
    if (window.animate && !window.stavesTestUpdate) {
        const originalAnimate = window.animate;
        window.animate = function () {
            originalAnimate.call(this);
            if (window.stavesTest) {
                window.stavesTest.updateStaveOrientations();
            }
        };
        window.stavesTestUpdate = true;
        console.log('[STAVES TEST] ✅ Integrated into render loop');
    }

    // Add test controls
    addStavesTestControls();
}

function addStavesTestControls() {
    const controlsContainer = document.getElementById('camera-ui');
    if (!controlsContainer) return;

    const stavesControls = document.createElement('div');
    stavesControls.style.marginTop = '10px';
    stavesControls.innerHTML = `
        <div style="background: rgba(0,100,200,0.8); padding: 10px; border-radius: 5px; color: white;">
            <h4>🎼 Music Staves Test</h4>
            <button id="show-staves-btn" style="margin: 5px; padding: 5px 10px;">Show Staves</button>
            <button id="hide-staves-btn" style="margin: 5px; padding: 5px 10px;">Hide Staves</button>
            <button id="test-positions-btn" style="margin: 5px; padding: 5px 10px;">Test Positions</button>
        </div>
    `;

    controlsContainer.appendChild(stavesControls);

    document.getElementById('show-staves-btn').addEventListener('click', () => {
        if (window.stavesTest && !window.stavesTest.initialized) {
            window.stavesTest.initWhenReady();
        } else if (window.stavesTest) {
            window.stavesTest.createTestStaves();
        }
    });

    document.getElementById('hide-staves-btn').addEventListener('click', () => {
        if (window.stavesTest) {
            window.stavesTest.clearStaves();
        }
    });

    document.getElementById('test-positions-btn').addEventListener('click', () => {
        if (window.stavesTest) {
            window.stavesTest.testPositions();
        }
    });
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStavesTest);
} else {
    initStavesTest();
}

console.log('[STAVES TEST] Music staves test system loaded');
