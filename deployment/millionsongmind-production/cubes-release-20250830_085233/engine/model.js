// v1.1 Engine models: minimal, non-breaking scaffolding

export class FaceModel {
    constructor(cubeModel, faceIdx) {
        this.cube = cubeModel; // backref
        this.faceIdx = faceIdx; // 0 bottom,1 right,2 top,3 left (fixed)
    }
    getToneIdx() {
        // Proxy/quaternion-first mapping: map the face's local normal into world and
        // pick the nearest axis among [down,right,up,left] -> [0,1,2,3]
        try {
            const baseNormals = [
                new THREE.Vector3(0, -1, 0),
                new THREE.Vector3(1, 0, 0),
                new THREE.Vector3(0, 1, 0),
                new THREE.Vector3(-1, 0, 0),
            ];
            const axes = [
                new THREE.Vector3(0, -1, 0),
                new THREE.Vector3(1, 0, 0),
                new THREE.Vector3(0, 1, 0),
                new THREE.Vector3(-1, 0, 0),
            ];
            const faceNormalWorld = baseNormals[this.faceIdx].clone().applyQuaternion(this.cube.obj.quaternion);
            let bestIdx = 0; let bestDot = -Infinity;
            for (let j = 0; j < axes.length; j++) { const d = faceNormalWorld.dot(axes[j]); if (d > bestDot) { bestDot = d; bestIdx = j; } }
            return bestIdx;
        } catch (_) {
            // Fallback to rotationIndex if necessary
            const r = ((this.cube.rotationIndex % 4) + 4) % 4;
            return (r + this.faceIdx) % 4;
        }
    }
    getToneName(noteSetsC, transposeNotes, key) {
        const roman = this.cube.roman;
        const tones = noteSetsC[roman] || ['C', 'E', 'G', 'B'];
        const names = transposeNotes(tones, key);
        return names[this.getToneIdx()];
    }
    rotateFaceToBottom(faceIdx, threeObj) {
        try {
            const targetNormal = new THREE.Vector3(0, -1, 0);
            const baseNormals = [
                new THREE.Vector3(0, -1, 0),
                new THREE.Vector3(1, 0, 0),
                new THREE.Vector3(0, 1, 0),
                new THREE.Vector3(-1, 0, 0),
            ];
            const faceNormal = baseNormals[faceIdx].clone();
            const currentQ = threeObj.quaternion.clone();
            const worldFaceNormal = faceNormal.clone().applyQuaternion(currentQ);
            const deltaQ = new THREE.Quaternion().setFromUnitVectors(worldFaceNormal, targetNormal);
            const finalQ = currentQ.clone().multiply(deltaQ);
            return finalQ;
        } catch (_) { return threeObj?.quaternion?.clone?.() || null; }
    }
}

export class CubeModel {
    constructor({ roman, key, threeObject }) {
        this.roman = roman;
        this.key = key || 'C';
        this.obj = threeObject; // Three.Group or Mesh
        this.rotationIndex = 0;
        this.faces = [0, 1, 2, 3].map(i => new FaceModel(this, i));
    }
    setRotationIndex(idx) {
        this.rotationIndex = ((idx % 4) + 4) % 4;
    }
    updateFromQuaternion(quat) {
        try {
            // project four base normals and pick dominant for bottom
            const base = [
                new THREE.Vector3(0, -1, 0),
                new THREE.Vector3(1, 0, 0),
                new THREE.Vector3(0, 1, 0),
                new THREE.Vector3(-1, 0, 0),
            ];
            const down = new THREE.Vector3(0, -1, 0);
            let best = 0, bestDot = -Infinity;
            for (let i = 0; i < 4; i++) {
                const d = base[i].clone().applyQuaternion(quat).dot(down);
                if (d > bestDot) { bestDot = d; best = i; }
            }
            this.rotationIndex = best;
        } catch (_) { }
    }
    getTopFace() { return this.faces[2]; }
    getBottomFace() { return this.faces[0]; }
}


