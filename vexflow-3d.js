/**
 * ChordCubes VexFlow 3D Integration - Phase 1 Prototype
 * Floating notation system above 3D cubes
 */

// VexFlow 3D Notation Renderer
class VexFlow3DRenderer {
    constructor(threeJSScene, camera) {
        this.scene = threeJSScene;
        this.camera = camera;
        this.notationMeshes = new Map();
        this.vexFlowFactory = null;
        this.initVexFlow();
    }

    async initVexFlow() {
        // Wait for VexFlow to load from CDN
        if (typeof VF === 'undefined') {
            console.log('[VEXFLOW 3D] Waiting for VexFlow library to load...');
            setTimeout(() => this.initVexFlow(), 100);
            return;
        }

        this.vexFlowFactory = new VF.Factory();
        console.log('[VEXFLOW 3D] VexFlow initialized successfully');
    }

    // Create floating notation above a chord cube
    createChordNotation(musicXMLChord, cubePosition) {
        if (!this.vexFlowFactory) {
            console.warn('[VEXFLOW 3D] VexFlow not initialized yet');
            return null;
        }

        try {
            // Create canvas for notation
            const canvas = document.createElement('canvas');
            canvas.width = 300;
            canvas.height = 100;
            const context = canvas.getContext('2d');

            // Clear canvas
            context.clearRect(0, 0, canvas.width, canvas.height);

            // Generate chord symbol
            const chordSymbol = this.generateChordSymbol(musicXMLChord);

            // Render chord symbol to canvas
            this.renderChordSymbol(context, chordSymbol, musicXMLChord);

            // Create Three.js texture from canvas
            const texture = new THREE.CanvasTexture(canvas);
            texture.needsUpdate = true;

            // Create billboard mesh (always faces camera)
            const material = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                alphaTest: 0.1
            });

            const geometry = new THREE.PlaneGeometry(3, 1);
            const mesh = new THREE.Mesh(geometry, material);

            // Position above cube
            mesh.position.set(
                cubePosition.x,
                cubePosition.y + 2,
                cubePosition.z
            );

            // Make it always face the camera
            mesh.lookAt(this.camera.position);

            // Store reference
            const meshId = `notation_${musicXMLChord.harmony.root.step}_${Date.now()}`;
            this.notationMeshes.set(meshId, mesh);

            // Add to scene
            this.scene.add(mesh);

            console.log(`[VEXFLOW 3D] Created notation for ${chordSymbol} at position`, cubePosition);
            return mesh;

        } catch (error) {
            console.error('[VEXFLOW 3D] Error creating chord notation:', error);
            return null;
        }
    }

    // Generate chord symbol string from MusicXML data
    generateChordSymbol(musicXMLChord) {
        const root = musicXMLChord.harmony.root.step;
        const kind = musicXMLChord.harmony.kind;
        const extensions = musicXMLChord.harmony.degree;

        let symbol = root;

        // Add chord quality
        switch (kind) {
            case 'major':
                // Major chords have no symbol
                break;
            case 'minor':
                symbol += 'm';
                break;
            case 'diminished':
                symbol += '°';
                break;
            case 'half-diminished':
                symbol += 'ø';
                break;
            case 'dominant-seventh':
                symbol += '7';
                break;
        }

        // Add extensions
        extensions.forEach(degree => {
            const value = degree['degree-value'];
            const alter = degree['degree-alter'];
            const type = degree['degree-type'];

            if (type === 'add') {
                if (alter === -1) symbol += 'b' + value;
                else if (alter === 1) symbol += '#' + value;
                else symbol += value;
            } else if (type === 'subtract-third-add') {
                symbol += 'sus' + value;
            }
        });

        return symbol;
    }

    // Render chord symbol with ChordCubes enhancements
    renderChordSymbol(context, chordSymbol, musicXMLChord) {
        // Set font and style
        context.font = 'bold 32px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';

        // Background
        context.fillStyle = 'rgba(255, 255, 255, 0.9)';
        context.fillRect(0, 0, 300, 100);

        // Border
        context.strokeStyle = '#333';
        context.lineWidth = 2;
        context.strokeRect(0, 0, 300, 100);

        // Main chord symbol
        context.fillStyle = '#000';
        context.fillText(chordSymbol, 150, 35);

        // Add scale degree information (ChordCubes enhancement)
        if (musicXMLChord.visual.showExtensions && musicXMLChord.harmony.degree.length > 0) {
            context.font = 'bold 16px Arial';
            context.fillStyle = '#666';
            const extensionText = musicXMLChord.harmony.degree
                .map(d => `${d['degree-alter'] === -1 ? 'b' : d['degree-alter'] === 1 ? '#' : ''}${d['degree-value']}`)
                .join(', ');
            context.fillText(`Extensions: ${extensionText}`, 150, 70);
        }

        // Add color coding for chord tones (Phase 2 enhancement)
        this.addColorCoding(context, musicXMLChord);
    }

    // Add color-coded chord tone indicators
    addColorCoding(context, musicXMLChord) {
        const colors = {
            root: '#FF0000',
            third: '#0000FF',
            fifth: '#00FF00',
            seventh: '#FF00FF',
            extension: '#FFFF00'
        };

        // Draw small colored circles for chord tones
        const y = 15;
        let x = 20;

        // Root
        context.fillStyle = colors.root;
        context.beginPath();
        context.arc(x, y, 8, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = '#FFF';
        context.font = 'bold 10px Arial';
        context.fillText('R', x, y);
        x += 25;

        // Third (if not sus chord)
        if (!musicXMLChord.harmony.degree.some(d => d['degree-type'] === 'subtract-third-add')) {
            context.fillStyle = colors.third;
            context.beginPath();
            context.arc(x, y, 8, 0, Math.PI * 2);
            context.fill();
            context.fillStyle = '#FFF';
            context.fillText('3', x, y);
            x += 25;
        }

        // Fifth
        context.fillStyle = colors.fifth;
        context.beginPath();
        context.arc(x, y, 8, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = '#FFF';
        context.fillText('5', x, y);
        x += 25;

        // Extensions
        musicXMLChord.harmony.degree.forEach(degree => {
            if (degree['degree-type'] === 'add') {
                context.fillStyle = colors.extension;
                context.beginPath();
                context.arc(x, y, 8, 0, Math.PI * 2);
                context.fill();
                context.fillStyle = '#000';
                context.fillText(degree['degree-value'].toString(), x, y);
                x += 25;
            }
        });
    }

    // Update notation when chord changes
    updateChordNotation(meshId, newMusicXMLChord) {
        const mesh = this.notationMeshes.get(meshId);
        if (!mesh) return;

        // Regenerate texture
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 100;
        const context = canvas.getContext('2d');

        const chordSymbol = this.generateChordSymbol(newMusicXMLChord);
        this.renderChordSymbol(context, chordSymbol, newMusicXMLChord);

        // Update texture
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        mesh.material.map = texture;
        mesh.material.needsUpdate = true;
    }

    // Remove notation mesh
    removeNotation(meshId) {
        const mesh = this.notationMeshes.get(meshId);
        if (mesh) {
            this.scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
            if (mesh.material.map) mesh.material.map.dispose();
            this.notationMeshes.delete(meshId);
        }
    }

    // Update all notation to face camera (call in animation loop)
    updateBillboards() {
        this.notationMeshes.forEach(mesh => {
            mesh.lookAt(this.camera.position);
        });
    }

    // Clear all notation
    clearAllNotation() {
        this.notationMeshes.forEach((mesh, meshId) => {
            this.removeNotation(meshId);
        });
    }
}

// Integration with existing ChordCubes system
class ChordCubesNotationIntegrator {
    constructor(scene, camera) {
        this.vexFlowRenderer = new VexFlow3DRenderer(scene, camera);
        this.migrator = new LegacyDataMigrator();
        this.notationMap = new Map(); // cube -> notation mapping
    }

    // Add notation to existing chord cube
    addNotationToCube(cubeObject) {
        if (!cubeObject.userData || !cubeObject.userData.roman) {
            console.warn('[NOTATION INTEGRATOR] Cube missing required userData');
            return;
        }

        try {
            // Convert legacy chord to MusicXML format
            const musicXMLChord = new MusicXMLChord(cubeObject);

            // Create floating notation
            const notationMesh = this.vexFlowRenderer.createChordNotation(
                musicXMLChord,
                cubeObject.position
            );

            if (notationMesh) {
                this.notationMap.set(cubeObject, notationMesh);
                console.log(`[NOTATION INTEGRATOR] Added notation to ${cubeObject.userData.roman} cube`);
            }

        } catch (error) {
            console.error('[NOTATION INTEGRATOR] Error adding notation to cube:', error);
        }
    }

    // Update notation when cube changes
    updateCubeNotation(cubeObject) {
        const notationMesh = this.notationMap.get(cubeObject);
        if (!notationMesh) return;

        const musicXMLChord = new MusicXMLChord(cubeObject);
        const meshId = Array.from(this.vexFlowRenderer.notationMeshes.entries())
            .find(([id, mesh]) => mesh === notationMesh)?.[0];

        if (meshId) {
            this.vexFlowRenderer.updateChordNotation(meshId, musicXMLChord);
        }
    }

    // Remove notation from cube
    removeCubeNotation(cubeObject) {
        const notationMesh = this.notationMap.get(cubeObject);
        if (notationMesh) {
            const meshId = Array.from(this.vexFlowRenderer.notationMeshes.entries())
                .find(([id, mesh]) => mesh === notationMesh)?.[0];

            if (meshId) {
                this.vexFlowRenderer.removeNotation(meshId);
            }
            this.notationMap.delete(cubeObject);
        }
    }

    // Add notation to entire lineup
    addNotationToLineup(lineup) {
        lineup.forEach(cube => {
            this.addNotationToCube(cube);
        });
    }

    // Update all billboard orientations (call in render loop)
    updateNotationBillboards() {
        this.vexFlowRenderer.updateBillboards();
    }
}

// Export classes for global use
window.VexFlow3DRenderer = VexFlow3DRenderer;
window.ChordCubesNotationIntegrator = ChordCubesNotationIntegrator;

console.log('[PHASE 1] VexFlow 3D Integration loaded successfully');
