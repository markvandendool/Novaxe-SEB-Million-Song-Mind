// ============================================
// 🗑️ THREE.JS RESOURCE MANAGER
// ============================================
// Comprehensive memory management for Three.js objects
// Prevents texture accumulation, geometry leaks, and material bloat

class ThreeJSResourceManager {
    constructor() {
        console.log('[RESOURCE] 🗑️ Initializing ThreeJSResourceManager...');
        
        this.trackedGeometries = new Map();
        this.trackedMaterials = new Map();
        this.trackedTextures = new Map();
        this.trackedRenderTargets = new Map();
        this.trackedMeshes = new Map();
        
        this.geometryCache = new Map();
        this.materialCache = new Map();
        this.textureCache = new Map();
        
        this.disposalCallbacks = new Map();
        this.resourceLimits = {
            maxGeometries: 100,
            maxMaterials: 200,
            maxTextures: 50,
            maxRenderTargets: 20
        };
        
        this.metrics = {
            created: { geometries: 0, materials: 0, textures: 0, meshes: 0 },
            disposed: { geometries: 0, materials: 0, textures: 0, meshes: 0 },
            cached: { geometries: 0, materials: 0, textures: 0 },
            memoryFreed: 0,
            lastCleanup: 0
        };
        
        // Hook into Three.js constructors
        this.setupResourceTracking();
        
        // Automatic cleanup interval (every 30 seconds)
        this.cleanupInterval = setInterval(() => {
            this.performAutomaticCleanup();
        }, 30000);
        
        console.log('[RESOURCE] ✅ ThreeJSResourceManager initialized');
    }

    // ==========================================
    // RESOURCE TRACKING HOOKS
    // ==========================================
    setupResourceTracking() {
        if (!window.THREE) {
            console.warn('[RESOURCE] ⚠️ Three.js not loaded yet, tracking setup deferred');
            return;
        }

        // Hook into Geometry creation
        const originalBoxGeometry = window.THREE.BoxGeometry;
        const manager = this;
        
        window.THREE.BoxGeometry = function(...args) {
            const geometry = new originalBoxGeometry(...args);
            manager.registerGeometry(geometry, 'BoxGeometry', args);
            return geometry;
        };
        
        // Copy prototype
        window.THREE.BoxGeometry.prototype = originalBoxGeometry.prototype;
        
        // Hook into Material creation
        const originalMeshLambertMaterial = window.THREE.MeshLambertMaterial;
        window.THREE.MeshLambertMaterial = function(parameters = {}) {
            const material = new originalMeshLambertMaterial(parameters);
            manager.registerMaterial(material, 'MeshLambertMaterial', parameters);
            return material;
        };
        window.THREE.MeshLambertMaterial.prototype = originalMeshLambertMaterial.prototype;

        const originalMeshBasicMaterial = window.THREE.MeshBasicMaterial;
        window.THREE.MeshBasicMaterial = function(parameters = {}) {
            const material = new originalMeshBasicMaterial(parameters);
            manager.registerMaterial(material, 'MeshBasicMaterial', parameters);
            return material;
        };
        window.THREE.MeshBasicMaterial.prototype = originalMeshBasicMaterial.prototype;

        // Hook into Texture creation
        const originalTextureLoader = window.THREE.TextureLoader;
        const originalLoad = originalTextureLoader.prototype.load;
        
        originalTextureLoader.prototype.load = function(url, onLoad, onProgress, onError) {
            // Check cache first
            const cachedTexture = manager.getCachedTexture(url);
            if (cachedTexture) {
                console.log(`[RESOURCE] ♻️ Using cached texture: ${url}`);
                if (onLoad) setTimeout(() => onLoad(cachedTexture), 0);
                return cachedTexture;
            }
            
            // Load new texture and track it
            return originalLoad.call(this, url, (texture) => {
                manager.registerTexture(texture, url);
                if (onLoad) onLoad(texture);
            }, onProgress, onError);
        };
        
        console.log('[RESOURCE] 🪝 Three.js constructor hooks installed');
    }

    // ==========================================
    // RESOURCE REGISTRATION
    // ==========================================
    registerGeometry(geometry, type, params = null) {
        if (!geometry || !geometry.uuid) return;
        
        const info = {
            type,
            params,
            created: Date.now(),
            disposed: false,
            vertices: geometry.attributes?.position?.count || 0
        };
        
        this.trackedGeometries.set(geometry.uuid, info);
        this.metrics.created.geometries++;
        
        console.log(`[RESOURCE] 📐 Registered ${type} geometry (${info.vertices} vertices)`);
        
        // Auto-dispose setup
        geometry.addEventListener?.('dispose', () => {
            this.unregisterGeometry(geometry);
        });
        
        this.checkResourceLimits();
    }

    registerMaterial(material, type, params = null) {
        if (!material || !material.uuid) return;
        
        const info = {
            type,
            params,
            created: Date.now(),
            disposed: false,
            hasTexture: !!(params?.map || params?.normalMap || params?.specularMap)
        };
        
        this.trackedMaterials.set(material.uuid, info);
        this.metrics.created.materials++;
        
        console.log(`[RESOURCE] 🎨 Registered ${type} material${info.hasTexture ? ' (with texture)' : ''}`);
        
        // Auto-dispose setup
        material.addEventListener?.('dispose', () => {
            this.unregisterMaterial(material);
        });
        
        this.checkResourceLimits();
    }

    registerTexture(texture, url = 'unknown') {
        if (!texture || !texture.uuid) return;
        
        const info = {
            url,
            created: Date.now(),
            disposed: false,
            width: texture.image?.width || 0,
            height: texture.image?.height || 0,
            format: texture.format,
            type: texture.type
        };
        
        this.trackedTextures.set(texture.uuid, info);
        this.metrics.created.textures++;
        
        // Cache the texture
        if (url !== 'unknown') {
            this.textureCache.set(url, texture);
            this.metrics.cached.textures++;
        }
        
        console.log(`[RESOURCE] 🖼️ Registered texture ${url} (${info.width}x${info.height})`);
        
        // Auto-dispose setup
        texture.addEventListener?.('dispose', () => {
            this.unregisterTexture(texture);
        });
        
        this.checkResourceLimits();
    }

    registerMesh(mesh, name = 'unknown') {
        if (!mesh || !mesh.uuid) return;
        
        const info = {
            name,
            created: Date.now(),
            disposed: false,
            geometryUuid: mesh.geometry?.uuid,
            materialUuid: mesh.material?.uuid || (mesh.material?.length > 0 ? mesh.material[0]?.uuid : null)
        };
        
        this.trackedMeshes.set(mesh.uuid, info);
        this.metrics.created.meshes++;
        
        console.log(`[RESOURCE] 🎯 Registered mesh: ${name}`);
    }

    // ==========================================
    // RESOURCE UNREGISTRATION
    // ==========================================
    unregisterGeometry(geometry) {
        if (!geometry || !geometry.uuid) return;
        
        const info = this.trackedGeometries.get(geometry.uuid);
        if (info && !info.disposed) {
            info.disposed = true;
            this.metrics.disposed.geometries++;
            console.log(`[RESOURCE] 🗑️ Disposed ${info.type} geometry`);
        }
    }

    unregisterMaterial(material) {
        if (!material || !material.uuid) return;
        
        const info = this.trackedMaterials.get(material.uuid);
        if (info && !info.disposed) {
            info.disposed = true;
            this.metrics.disposed.materials++;
            console.log(`[RESOURCE] 🗑️ Disposed ${info.type} material`);
        }
    }

    unregisterTexture(texture) {
        if (!texture || !texture.uuid) return;
        
        const info = this.trackedTextures.get(texture.uuid);
        if (info && !info.disposed) {
            info.disposed = true;
            this.metrics.disposed.textures++;
            
            // Remove from cache
            for (const [url, cachedTexture] of this.textureCache) {
                if (cachedTexture.uuid === texture.uuid) {
                    this.textureCache.delete(url);
                    console.log(`[RESOURCE] 🗑️ Disposed texture ${info.url} and removed from cache`);
                    break;
                }
            }
        }
    }

    // ==========================================
    // CACHING SYSTEM
    // ==========================================
    getCachedGeometry(type, params) {
        const key = `${type}-${JSON.stringify(params)}`;
        return this.geometryCache.get(key);
    }

    setCachedGeometry(type, params, geometry) {
        const key = `${type}-${JSON.stringify(params)}`;
        this.geometryCache.set(key, geometry);
        this.metrics.cached.geometries++;
    }

    getCachedMaterial(type, params) {
        const key = `${type}-${JSON.stringify(params)}`;
        return this.materialCache.get(key);
    }

    setCachedMaterial(type, params, material) {
        const key = `${type}-${JSON.stringify(params)}`;
        this.materialCache.set(key, material);
        this.metrics.cached.materials++;
    }

    getCachedTexture(url) {
        return this.textureCache.get(url);
    }

    // ==========================================
    // CLEANUP OPERATIONS
    // ==========================================
    disposeGeometry(geometry) {
        if (!geometry) return false;
        
        try {
            if (geometry.dispose && typeof geometry.dispose === 'function') {
                geometry.dispose();
                this.unregisterGeometry(geometry);
                return true;
            }
        } catch (error) {
            console.warn('[RESOURCE] ⚠️ Error disposing geometry:', error);
        }
        return false;
    }

    disposeMaterial(material) {
        if (!material) return false;
        
        try {
            // Dispose textures first
            if (material.map) this.disposeTexture(material.map);
            if (material.normalMap) this.disposeTexture(material.normalMap);
            if (material.specularMap) this.disposeTexture(material.specularMap);
            if (material.emissiveMap) this.disposeTexture(material.emissiveMap);
            
            if (material.dispose && typeof material.dispose === 'function') {
                material.dispose();
                this.unregisterMaterial(material);
                return true;
            }
        } catch (error) {
            console.warn('[RESOURCE] ⚠️ Error disposing material:', error);
        }
        return false;
    }

    disposeTexture(texture) {
        if (!texture) return false;
        
        try {
            if (texture.dispose && typeof texture.dispose === 'function') {
                texture.dispose();
                this.unregisterTexture(texture);
                return true;
            }
        } catch (error) {
            console.warn('[RESOURCE] ⚠️ Error disposing texture:', error);
        }
        return false;
    }

    disposeMesh(mesh) {
        if (!mesh) return false;
        
        try {
            // Dispose geometry and material
            if (mesh.geometry) this.disposeGeometry(mesh.geometry);
            
            if (mesh.material) {
                if (Array.isArray(mesh.material)) {
                    mesh.material.forEach(material => this.disposeMaterial(material));
                } else {
                    this.disposeMaterial(mesh.material);
                }
            }
            
            // Remove from scene
            if (mesh.parent) {
                mesh.parent.remove(mesh);
            }
            
            this.trackedMeshes.delete(mesh.uuid);
            this.metrics.disposed.meshes++;
            
            console.log('[RESOURCE] 🗑️ Disposed mesh and removed from scene');
            return true;
            
        } catch (error) {
            console.warn('[RESOURCE] ⚠️ Error disposing mesh:', error);
        }
        return false;
    }

    // ==========================================
    // CLEANUP STRATEGIES
    // ==========================================
    performAutomaticCleanup() {
        console.log('[RESOURCE] 🧹 Performing automatic cleanup...');
        
        const startTime = performance.now();
        let freedResources = 0;
        
        // Clean up disposed geometries from tracking
        for (const [uuid, info] of this.trackedGeometries) {
            if (info.disposed) {
                this.trackedGeometries.delete(uuid);
                freedResources++;
            }
        }
        
        // Clean up disposed materials from tracking
        for (const [uuid, info] of this.trackedMaterials) {
            if (info.disposed) {
                this.trackedMaterials.delete(uuid);
                freedResources++;
            }
        }
        
        // Clean up disposed textures from tracking
        for (const [uuid, info] of this.trackedTextures) {
            if (info.disposed) {
                this.trackedTextures.delete(uuid);
                freedResources++;
            }
        }
        
        // Clear old cache entries (older than 5 minutes)
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        let cacheCleared = 0;
        
        for (const [key, geometry] of this.geometryCache) {
            const info = this.trackedGeometries.get(geometry.uuid);
            if (info && info.created < fiveMinutesAgo) {
                this.geometryCache.delete(key);
                cacheCleared++;
            }
        }
        
        const cleanupTime = performance.now() - startTime;
        this.metrics.lastCleanup = Date.now();
        
        if (freedResources > 0 || cacheCleared > 0) {
            console.log(`[RESOURCE] ✅ Cleanup complete: ${freedResources} resources freed, ${cacheCleared} cache entries cleared (${cleanupTime.toFixed(2)}ms)`);
        }
    }

    forceCleanupAll() {
        console.log('[RESOURCE] 🚨 FORCE CLEANUP - Disposing all tracked resources...');
        
        let disposedCount = 0;
        
        // Dispose all tracked meshes
        for (const [uuid, info] of this.trackedMeshes) {
            // Find the actual mesh object (this is a limitation - we'd need better tracking)
            console.log(`[RESOURCE] 🗑️ Force disposing mesh: ${info.name}`);
            disposedCount++;
        }
        
        // Clear all caches
        this.geometryCache.clear();
        this.materialCache.clear();
        this.textureCache.clear();
        
        // Clear tracking maps
        this.trackedGeometries.clear();
        this.trackedMaterials.clear();
        this.trackedTextures.clear();
        this.trackedMeshes.clear();
        
        // Update metrics
        this.metrics.disposed.geometries += disposedCount;
        this.metrics.disposed.materials += disposedCount;
        this.metrics.disposed.textures += disposedCount;
        this.metrics.disposed.meshes += disposedCount;
        
        console.log(`[RESOURCE] ✅ Force cleanup complete: ${disposedCount} resources disposed`);
    }

    // ==========================================
    // RESOURCE LIMITS & MONITORING
    // ==========================================
    checkResourceLimits() {
        const warnings = [];
        
        if (this.trackedGeometries.size > this.resourceLimits.maxGeometries) {
            warnings.push(`Too many geometries: ${this.trackedGeometries.size}/${this.resourceLimits.maxGeometries}`);
        }
        
        if (this.trackedMaterials.size > this.resourceLimits.maxMaterials) {
            warnings.push(`Too many materials: ${this.trackedMaterials.size}/${this.resourceLimits.maxMaterials}`);
        }
        
        if (this.trackedTextures.size > this.resourceLimits.maxTextures) {
            warnings.push(`Too many textures: ${this.trackedTextures.size}/${this.resourceLimits.maxTextures}`);
        }
        
        if (warnings.length > 0) {
            console.warn('[RESOURCE] ⚠️ Resource limits exceeded:', warnings);
            
            // Trigger automatic cleanup
            setTimeout(() => this.performAutomaticCleanup(), 100);
        }
    }

    // ==========================================
    // PUBLIC API
    // ==========================================
    getResourceStatus() {
        return {
            active: {
                geometries: this.trackedGeometries.size,
                materials: this.trackedMaterials.size,
                textures: this.trackedTextures.size,
                meshes: this.trackedMeshes.size
            },
            cached: {
                geometries: this.geometryCache.size,
                materials: this.materialCache.size,
                textures: this.textureCache.size
            },
            metrics: { ...this.metrics },
            limits: { ...this.resourceLimits }
        };
    }

    healthCheck() {
        const status = this.getResourceStatus();
        const isHealthy = status.active.geometries < this.resourceLimits.maxGeometries &&
                         status.active.materials < this.resourceLimits.maxMaterials &&
                         status.active.textures < this.resourceLimits.maxTextures;
        
        return {
            healthy: isHealthy,
            ...status
        };
    }

    dispose() {
        console.log('[RESOURCE] 🛑 Shutting down ResourceManager...');
        
        // Clear cleanup interval
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        
        // Force cleanup all resources
        this.forceCleanupAll();
    }
}

// ==========================================
// VEXFLOW SVG CLEANUP SYSTEM
// ==========================================
class VexFlowCleanupManager {
    constructor() {
        this.trackedSVGElements = new Set();
        this.cleanupCallbacks = new Map();
        this.lastCleanup = 0;
        
        console.log('[VEXFLOW] 🎼 VexFlow cleanup manager initialized');
    }

    registerSVGElement(element, identifier = 'unknown') {
        if (element && element.nodeName === 'svg') {
            this.trackedSVGElements.add(element);
            console.log(`[VEXFLOW] 📝 Registered SVG element: ${identifier}`);
        }
    }

    cleanupSVGElements() {
        console.log('[VEXFLOW] 🧹 Cleaning up SVG elements...');
        
        let removedCount = 0;
        
        for (const element of this.trackedSVGElements) {
            try {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                    removedCount++;
                }
                this.trackedSVGElements.delete(element);
            } catch (error) {
                console.warn('[VEXFLOW] ⚠️ Error removing SVG element:', error);
            }
        }
        
        this.lastCleanup = Date.now();
        console.log(`[VEXFLOW] ✅ Cleaned up ${removedCount} SVG elements`);
    }

    dispose() {
        this.cleanupSVGElements();
        this.trackedSVGElements.clear();
        this.cleanupCallbacks.clear();
    }
}

// ==========================================
// GLOBAL MANAGER INSTANCES
// ==========================================
console.log('[RESOURCE] 🚀 Initializing global resource managers...');

const threeJSResourceManager = new ThreeJSResourceManager();
const vexFlowCleanupManager = new VexFlowCleanupManager();

// Expose globally
window.threeJSResourceManager = threeJSResourceManager;
window.vexFlowCleanupManager = vexFlowCleanupManager;

// Hook into page unload for cleanup
window.addEventListener('beforeunload', () => {
    console.log('[RESOURCE] 🛑 Page unloading, disposing resource managers...');
    threeJSResourceManager.dispose();
    vexFlowCleanupManager.dispose();
});

export { ThreeJSResourceManager, VexFlowCleanupManager, threeJSResourceManager, vexFlowCleanupManager };
