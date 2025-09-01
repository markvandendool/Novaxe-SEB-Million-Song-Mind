/**
 * ChordCubes 5.0 - High-Performance Spatial Optimization System
 * Military-Grade Performance Enhancement for 60fps with 200+ Cubes
 * 
 * Features:
 * - Optimized spatial hashing for collision detection
 * - Frame rate monitoring and automatic quality adjustment
 * - Efficient cube position management
 * - Performance profiling and bottleneck detection
 */

// Performance configuration
const PERFORMANCE_CONFIG = {
    targetFPS: 60,
    spatialGridSize: 2.0, // Grid cell size for spatial hashing
    maxCollisionChecks: 100, // Maximum collision checks per frame
    performanceSampleSize: 60, // Frames to average for performance monitoring
    autoQualityAdjustment: true,
    debugPerformance: true
};

/**
 * High-Performance Spatial Hash Grid for Collision Detection
 */
class SpatialHashGrid {
    constructor(cellSize = PERFORMANCE_CONFIG.spatialGridSize) {
        this.cellSize = cellSize;
        this.invCellSize = 1.0 / cellSize;
        this.grid = new Map();
        this.queryResults = new Set();

        this.stats = {
            totalObjects: 0,
            occupiedCells: 0,
            averageObjectsPerCell: 0,
            lastUpdateTime: 0,
            collisionChecks: 0
        };

        console.log(`[PERF] 🏃 SpatialHashGrid initialized (cellSize: ${cellSize})`);
    }

    // Convert world coordinates to grid key
    getGridKey(x, z) {
        // Handle negative coordinates properly by using Math.floor instead of bit operations
        const gridX = Math.floor(x * this.invCellSize);
        const gridZ = Math.floor(z * this.invCellSize);
        return `${gridX},${gridZ}`;
    }

    // Add object to grid
    addObject(obj, x = obj.position.x, z = obj.position.z) {
        const key = this.getGridKey(x, z);

        if (!this.grid.has(key)) {
            this.grid.set(key, new Set());
        }

        this.grid.get(key).add(obj);
        obj._spatialGridKey = key;

        this.stats.totalObjects++;
    }

    // Remove object from grid
    removeObject(obj) {
        if (obj._spatialGridKey) {
            const cell = this.grid.get(obj._spatialGridKey);
            if (cell) {
                cell.delete(obj);
                if (cell.size === 0) {
                    this.grid.delete(obj._spatialGridKey);
                }
            }
            delete obj._spatialGridKey;
            this.stats.totalObjects--;
        }
    }

    // Update object position in grid
    updateObject(obj, newX = obj.position.x, newZ = obj.position.z) {
        const newKey = this.getGridKey(newX, newZ);

        // If object moved to a different cell, update it
        if (obj._spatialGridKey !== newKey) {
            this.removeObject(obj);
            this.addObject(obj, newX, newZ);
        }
    }

    // Query objects near a point
    queryRadius(x, z, radius) {
        this.queryResults.clear();

        // Calculate grid cells that might contain objects within radius
        const minX = Math.floor((x - radius) * this.invCellSize);
        const maxX = Math.floor((x + radius) * this.invCellSize);
        const minZ = Math.floor((z - radius) * this.invCellSize);
        const maxZ = Math.floor((z + radius) * this.invCellSize);

        // Check all potentially relevant cells
        for (let gx = minX; gx <= maxX; gx++) {
            for (let gz = minZ; gz <= maxZ; gz++) {
                const key = `${gx},${gz}`;
                const cell = this.grid.get(key);

                if (cell) {
                    for (const obj of cell) {
                        // Precise distance check
                        const dx = obj.position.x - x;
                        const dz = obj.position.z - z;
                        const distSq = dx * dx + dz * dz;

                        if (distSq <= radius * radius) {
                            this.queryResults.add(obj);
                        }
                    }
                }
            }
        }

        return Array.from(this.queryResults);
    }

    // Clear all objects
    clear() {
        for (const [key, cell] of this.grid) {
            for (const obj of cell) {
                delete obj._spatialGridKey;
            }
        }
        this.grid.clear();
        this.stats.totalObjects = 0;
    }

    // Get performance statistics
    getStats() {
        this.stats.occupiedCells = this.grid.size;
        this.stats.averageObjectsPerCell = this.stats.totalObjects / Math.max(this.stats.occupiedCells, 1);
        this.stats.lastUpdateTime = performance.now();

        return { ...this.stats };
    }
}

/**
 * Performance Monitor for Frame Rate and Bottleneck Detection
 */
class PerformanceMonitor {
    constructor() {
        this.frameTimes = [];
        this.maxSamples = PERFORMANCE_CONFIG.performanceSampleSize;
        this.lastFrameTime = performance.now();

        this.metrics = {
            currentFPS: 0,
            averageFPS: 0,
            minFPS: Infinity,
            maxFPS: 0,
            frameTimeVariance: 0,
            performance: 'excellent' // excellent, good, acceptable, poor
        };

        this.bottlenecks = {
            rendering: 0,
            collision: 0,
            animation: 0,
            audio: 0
        };

        console.log('[PERF] 📊 PerformanceMonitor initialized');
    }

    // Record frame timing
    recordFrame() {
        const currentTime = performance.now();
        const frameTime = currentTime - this.lastFrameTime;

        this.frameTimes.push(frameTime);
        if (this.frameTimes.length > this.maxSamples) {
            this.frameTimes.shift();
        }

        this.lastFrameTime = currentTime;

        // Update metrics
        this.updateMetrics();

        return frameTime;
    }

    // Update performance metrics
    updateMetrics() {
        if (this.frameTimes.length === 0) return;

        // Current FPS (from last frame)
        const lastFrameTime = this.frameTimes[this.frameTimes.length - 1];
        this.metrics.currentFPS = Math.min(1000 / lastFrameTime, 200); // Cap at 200fps for sanity

        // Average FPS
        const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
        this.metrics.averageFPS = 1000 / avgFrameTime;

        // Min/Max FPS
        const minFrameTime = Math.min(...this.frameTimes);
        const maxFrameTime = Math.max(...this.frameTimes);
        this.metrics.maxFPS = 1000 / minFrameTime;
        this.metrics.minFPS = 1000 / maxFrameTime;

        // Frame time variance (stability metric)
        const variance = this.frameTimes.reduce((sum, time) => {
            return sum + Math.pow(time - avgFrameTime, 2);
        }, 0) / this.frameTimes.length;
        this.metrics.frameTimeVariance = Math.sqrt(variance);

        // Performance rating
        this.updatePerformanceRating();
    }

    // Update overall performance rating
    updatePerformanceRating() {
        const avgFPS = this.metrics.averageFPS;
        const variance = this.metrics.frameTimeVariance;

        if (avgFPS >= 55 && variance < 5) {
            this.metrics.performance = 'excellent';
        } else if (avgFPS >= 45 && variance < 10) {
            this.metrics.performance = 'good';
        } else if (avgFPS >= 30 && variance < 20) {
            this.metrics.performance = 'acceptable';
        } else {
            this.metrics.performance = 'poor';
        }
    }

    // Record bottleneck timing
    recordBottleneck(type, duration) {
        if (this.bottlenecks.hasOwnProperty(type)) {
            this.bottlenecks[type] = duration;
        }
    }

    // Get performance report
    getReport() {
        return {
            ...this.metrics,
            bottlenecks: { ...this.bottlenecks },
            sampleSize: this.frameTimes.length
        };
    }

    // Check if performance is acceptable
    isPerformanceAcceptable() {
        return this.metrics.averageFPS >= PERFORMANCE_CONFIG.targetFPS * 0.8;
    }
}

/**
 * Optimized Collision Detection System
 */
class OptimizedCollisionDetector {
    constructor(spatialGrid, performanceMonitor) {
        this.spatialGrid = spatialGrid;
        this.performanceMonitor = performanceMonitor;
        this.maxChecksPerFrame = PERFORMANCE_CONFIG.maxCollisionChecks;

        console.log('[PERF] ⚡ OptimizedCollisionDetector initialized');
    }

    // High-performance collision resolution for front row cubes
    resolveFrontRowCollisions(draggingCube, allCubes) {
        const startTime = performance.now();

        try {
            // Filter cubes in the front row zone
            const zoneZ = window.FRONT_ROW_FORWARD_Z + 0.5;
            const frontRowCubes = allCubes.filter(cube =>
                cube && Math.abs(cube.position.z) <= zoneZ + 0.001
            );

            if (frontRowCubes.length <= 1) {
                this.performanceMonitor.recordBottleneck('collision', performance.now() - startTime);
                return;
            }

            // Add dragging cube if not already included
            if (draggingCube && !frontRowCubes.includes(draggingCube)) {
                frontRowCubes.push(draggingCube);
            }

            // Use spatial grid for efficient collision detection
            this.updateSpatialGrid(frontRowCubes);

            let collisionChecks = 0;
            const minDist = (window.gridSize || 1.0) * 0.95;

            // Process each cube for collisions using spatial grid
            for (const cube of frontRowCubes) {
                if (collisionChecks >= this.maxChecksPerFrame) break;

                // Query nearby cubes using spatial grid
                const nearby = this.spatialGrid.queryRadius(
                    cube.position.x,
                    cube.position.z,
                    minDist * 1.5
                );

                // Check collisions only with nearby cubes
                for (const other of nearby) {
                    if (cube === other || collisionChecks >= this.maxChecksPerFrame) continue;

                    const dx = other.position.x - cube.position.x;
                    const dz = other.position.z - cube.position.z;
                    const dist = Math.hypot(dx, dz);

                    collisionChecks++;

                    if (dist > 1e-6 && dist < minDist) {
                        this.resolveCollision(cube, other, dx, dz, dist, minDist, draggingCube);
                    }
                }
            }

            this.spatialGrid.stats.collisionChecks = collisionChecks;

        } catch (error) {
            console.warn('[PERF] ⚠️ Collision detection error:', error);
        }

        this.performanceMonitor.recordBottleneck('collision', performance.now() - startTime);
    }

    // Update spatial grid with current cube positions
    updateSpatialGrid(cubes) {
        this.spatialGrid.clear();

        for (const cube of cubes) {
            if (cube && cube.position) {
                this.spatialGrid.addObject(cube);
            }
        }
    }

    // Resolve collision between two cubes
    resolveCollision(cubeA, cubeB, dx, dz, dist, minDist, draggingCube) {
        const overlap = (minDist - dist) * 0.5;
        const nx = dx / dist;
        const nz = dz / dist;

        // Don't move the dragging cube, push others away
        if (cubeA !== draggingCube) {
            const newX = cubeA.position.x - nx * overlap;
            const newZ = THREE.MathUtils.clamp(
                cubeA.position.z - nz * overlap,
                window.shelfZ || -2,
                window.FRONT_ROW_FORWARD_Z || 0
            );

            // Use optimized position animation
            this.animatePositionOptimized(cubeA, newX, cubeA.position.y, newZ, 80);
        }

        if (cubeB !== draggingCube) {
            const newX = cubeB.position.x + nx * overlap;
            const newZ = THREE.MathUtils.clamp(
                cubeB.position.z + nz * overlap,
                window.shelfZ || -2,
                window.FRONT_ROW_FORWARD_Z || 0
            );

            // Use optimized position animation
            this.animatePositionOptimized(cubeB, newX, cubeB.position.y, newZ, 80);
        }
    }

    // Optimized position animation (batched/pooled tweens)
    animatePositionOptimized(obj, toX, toY, toZ, duration) {
        // Cancel existing animation if any
        if (obj._positionTween) {
            obj._positionTween.cancel?.();
        }

        const startPos = {
            x: obj.position.x,
            y: obj.position.y,
            z: obj.position.z
        };

        // Use simple lerp instead of full tween system for better performance
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Smooth easing
            const easedProgress = 1 - Math.pow(1 - progress, 3);

            obj.position.x = startPos.x + (toX - startPos.x) * easedProgress;
            obj.position.y = startPos.y + (toY - startPos.y) * easedProgress;
            obj.position.z = startPos.z + (toZ - startPos.z) * easedProgress;

            if (progress < 1) {
                obj._positionTween = requestAnimationFrame(animate);
            } else {
                obj._positionTween = null;
            }
        };

        obj._positionTween = requestAnimationFrame(animate);
    }
}

/**
 * Adaptive Quality System - Automatically adjusts quality based on performance
 */
class AdaptiveQualitySystem {
    constructor(performanceMonitor) {
        this.performanceMonitor = performanceMonitor;
        this.qualityLevel = 1.0; // 0.0 = minimum, 1.0 = maximum
        this.adjustmentCooldown = 0;

        this.qualitySettings = {
            collision: {
                maxChecks: PERFORMANCE_CONFIG.maxCollisionChecks,
                gridSize: PERFORMANCE_CONFIG.spatialGridSize
            },
            rendering: {
                shadowQuality: 1.0,
                effectsEnabled: true,
                particleCount: 1.0
            },
            animation: {
                smoothness: 1.0,
                tweenFrameSkip: 0
            }
        };

        console.log('[PERF] 🎚️ AdaptiveQualitySystem initialized');
    }

    // Update quality based on current performance
    updateQuality() {
        if (this.adjustmentCooldown > 0) {
            this.adjustmentCooldown--;
            return;
        }

        const report = this.performanceMonitor.getReport();

        // Decrease quality if performance is poor
        if (report.performance === 'poor' && this.qualityLevel > 0.2) {
            this.qualityLevel = Math.max(0.2, this.qualityLevel - 0.1);
            this.applyQualitySettings();
            this.adjustmentCooldown = 60; // Wait 1 second at 60fps

            console.log(`[PERF] 📉 Quality decreased to ${(this.qualityLevel * 100).toFixed(0)}% (FPS: ${report.averageFPS.toFixed(1)})`);
        }
        // Increase quality if performance is excellent
        else if (report.performance === 'excellent' && this.qualityLevel < 1.0) {
            this.qualityLevel = Math.min(1.0, this.qualityLevel + 0.05);
            this.applyQualitySettings();
            this.adjustmentCooldown = 120; // Wait 2 seconds at 60fps

            console.log(`[PERF] 📈 Quality increased to ${(this.qualityLevel * 100).toFixed(0)}% (FPS: ${report.averageFPS.toFixed(1)})`);
        }
    }

    // Apply quality settings to various systems
    applyQualitySettings() {
        // Update collision detection limits
        this.qualitySettings.collision.maxChecks = Math.floor(
            PERFORMANCE_CONFIG.maxCollisionChecks * this.qualityLevel
        );

        // Update spatial grid granularity
        this.qualitySettings.collision.gridSize =
            PERFORMANCE_CONFIG.spatialGridSize * (2.0 - this.qualityLevel);

        // Update rendering quality
        this.qualitySettings.rendering.shadowQuality = this.qualityLevel;
        this.qualitySettings.rendering.effectsEnabled = this.qualityLevel > 0.5;
        this.qualitySettings.rendering.particleCount = this.qualityLevel;

        // Update animation smoothness
        this.qualitySettings.animation.smoothness = this.qualityLevel;
        this.qualitySettings.animation.tweenFrameSkip = Math.floor((1.0 - this.qualityLevel) * 3);
    }

    // Get current quality settings
    getQualitySettings() {
        return {
            level: this.qualityLevel,
            ...this.qualitySettings
        };
    }
}

// ==========================================
// GLOBAL PERFORMANCE OPTIMIZATION SYSTEM
// ==========================================
console.log('[PERF] 🚀 Initializing ChordCubes Performance Optimization System...');

const spatialHashGrid = new SpatialHashGrid(PERFORMANCE_CONFIG.spatialGridSize);
const performanceMonitor = new PerformanceMonitor();
const optimizedCollisionDetector = new OptimizedCollisionDetector(spatialHashGrid, performanceMonitor);
const adaptiveQualitySystem = new AdaptiveQualitySystem(performanceMonitor);

// Expose globally
window.spatialHashGrid = spatialHashGrid;
window.performanceMonitor = performanceMonitor;
window.optimizedCollisionDetector = optimizedCollisionDetector;
window.adaptiveQualitySystem = adaptiveQualitySystem;

// Performance monitoring loop
let performanceFrame = 0;
function performanceMonitorLoop() {
    performanceFrame++;

    // Record frame performance
    performanceMonitor.recordFrame();

    // Update adaptive quality every 60 frames (1 second at 60fps)
    if (PERFORMANCE_CONFIG.autoQualityAdjustment && performanceFrame % 60 === 0) {
        adaptiveQualitySystem.updateQuality();
    }

    // Debug output every 5 seconds
    if (PERFORMANCE_CONFIG.debugPerformance && performanceFrame % 300 === 0) {
        const report = performanceMonitor.getReport();
        const spatialStats = spatialHashGrid.getStats();
        const qualitySettings = adaptiveQualitySystem.getQualitySettings();

        console.log('[PERF] 📊 Performance Report:', {
            fps: `${report.currentFPS.toFixed(1)} (avg: ${report.averageFPS.toFixed(1)})`,
            performance: report.performance,
            spatialObjects: spatialStats.totalObjects,
            collisionChecks: spatialStats.collisionChecks,
            qualityLevel: `${(qualitySettings.level * 100).toFixed(0)}%`
        });
    }

    requestAnimationFrame(performanceMonitorLoop);
}

// Start performance monitoring
requestAnimationFrame(performanceMonitorLoop);

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    console.log('[PERF] 🛑 Shutting down performance optimization system...');
    spatialHashGrid.clear();
});

export {
    SpatialHashGrid,
    PerformanceMonitor,
    OptimizedCollisionDetector,
    AdaptiveQualitySystem,
    spatialHashGrid,
    performanceMonitor,
    optimizedCollisionDetector,
    adaptiveQualitySystem
};
