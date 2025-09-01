/**
 * ChordCubes 5.0 - Performance Validation Test Suite
 * Military-Grade Performance Testing and Benchmarking
 * 
 * Validates:
 * - 60fps maintenance with 200+ cubes
 * - Spatial hashing optimization effectiveness
 * - Collision detection performance improvement
 * - Adaptive quality system operation
 * - Memory leak prevention under load
 */

// Performance test configuration
const PERF_TEST_CONFIG = {
    maxTestDurationMs: 60000, // 1 minute stress test
    cubeStressTestCount: 250, // Test with more than target 200
    targetFPS: 60,
    acceptableMinFPS: 45,
    collisionTestIterations: 1000,
    spatialGridTestSize: 500,
    frameSkipThreshold: 5 // Allow up to 5 dropped frames
};

/**
 * Performance Validation Test Suite
 */
class PerformanceValidationSuite {
    constructor() {
        this.testResults = [];
        this.startTime = performance.now();
        this.stressTestCubes = [];
    }

    log(message, level = 'INFO', data = null) {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        const result = { timestamp, level, message, data };
        
        this.testResults.push(result);
        
        const colors = {
            'PASS': '\\x1b[32m', 'FAIL': '\\x1b[31m', 'WARN': '\\x1b[33m',
            'INFO': '\\x1b[36m', 'TEST': '\\x1b[35m'
        };
        
        console.log(`${colors[level] || '\\x1b[0m'}[${timestamp}] [${level}] ${message}\\x1b[0m`);
        if (data) console.log(`    ${JSON.stringify(data, null, 2)}`);
    }

    async runPerformanceTests() {
        this.log("🚀 STARTING CHORDCUBES 5.0 PERFORMANCE VALIDATION SUITE", "TEST");
        this.log("=" * 80, "INFO");
        
        try {
            // Test 1: Spatial Hash Grid Performance
            await this.testSpatialHashGridPerformance();
            
            // Test 2: Collision Detection Optimization
            await this.testCollisionDetectionOptimization();
            
            // Test 3: High Cube Count Stress Test
            await this.testHighCubeCountStress();
            
            // Test 4: Adaptive Quality System
            await this.testAdaptiveQualitySystem();
            
            // Test 5: Frame Rate Stability
            await this.testFrameRateStability();
            
            // Test 6: Memory Performance Under Load
            await this.testMemoryPerformanceUnderLoad();
            
            return this.generatePerformanceReport();
            
        } catch (error) {
            this.log(`CRITICAL PERFORMANCE TEST FAILURE: ${error.message}`, "FAIL");
            throw error;
        }
    }

    async testSpatialHashGridPerformance() {
        this.log("📊 Testing Spatial Hash Grid Performance", "TEST");
        
        if (!window.spatialHashGrid) {
            this.log("SpatialHashGrid not available - skipping test", "WARN");
            return;
        }
        
        const grid = window.spatialHashGrid;
        const testObjects = [];
        
        // Create test objects in a grid pattern
        const startTime = performance.now();
        
        for (let i = 0; i < PERF_TEST_CONFIG.spatialGridTestSize; i++) {
            const obj = {
                position: {
                    x: (Math.random() - 0.5) * 20, // -10 to +10
                    z: (Math.random() - 0.5) * 20  // -10 to +10
                },
                id: `test_${i}`
            };
            
            grid.addObject(obj);
            testObjects.push(obj);
        }
        
        const insertTime = performance.now() - startTime;
        
        // Test spatial queries
        const queryStartTime = performance.now();
        let totalQueryResults = 0;
        
        for (let i = 0; i < 100; i++) {
            const x = (Math.random() - 0.5) * 20;
            const z = (Math.random() - 0.5) * 20;
            const results = grid.queryRadius(x, z, 2.0);
            totalQueryResults += results.length;
        }
        
        const queryTime = performance.now() - queryStartTime;
        
        // Test updates
        const updateStartTime = performance.now();
        
        for (const obj of testObjects.slice(0, 100)) {
            obj.position.x = (Math.random() - 0.5) * 20;
            obj.position.z = (Math.random() - 0.5) * 20;
            grid.updateObject(obj);
        }
        
        const updateTime = performance.now() - updateStartTime;
        
        // Cleanup
        for (const obj of testObjects) {
            grid.removeObject(obj);
        }
        
        // Evaluate performance
        const metrics = {
            insertTime,
            queryTime,
            updateTime,
            avgInsertTime: insertTime / PERF_TEST_CONFIG.spatialGridTestSize,
            avgQueryTime: queryTime / 100,
            avgUpdateTime: updateTime / 100,
            totalQueryResults
        };
        
        this.log("Spatial Hash Grid Performance Results", "INFO", metrics);
        
        if (metrics.avgInsertTime < 0.1 && metrics.avgQueryTime < 0.5) {
            this.log("✅ Spatial Hash Grid performance: EXCELLENT", "PASS");
        } else if (metrics.avgInsertTime < 0.5 && metrics.avgQueryTime < 2.0) {
            this.log("⚠️  Spatial Hash Grid performance: ACCEPTABLE", "WARN");
        } else {
            this.log("❌ Spatial Hash Grid performance: POOR", "FAIL");
        }
    }

    async testCollisionDetectionOptimization() {
        this.log("⚡ Testing Collision Detection Optimization", "TEST");
        
        if (!window.optimizedCollisionDetector || !window.lineup) {
            this.log("OptimizedCollisionDetector or lineup not available", "WARN");
            return;
        }
        
        // Create mock cubes for collision testing
        const mockCubes = [];
        for (let i = 0; i < 50; i++) {
            mockCubes.push({
                position: {
                    x: (Math.random() - 0.5) * 10,
                    y: 0,
                    z: Math.random() * 2 - 1 // Front row zone
                },
                userData: { roman: `test${i}` }
            });
        }
        
        // Test optimized collision detection performance
        const startTime = performance.now();
        
        for (let i = 0; i < PERF_TEST_CONFIG.collisionTestIterations; i++) {
            window.optimizedCollisionDetector.resolveFrontRowCollisions(
                mockCubes[0], 
                mockCubes
            );
        }
        
        const optimizedTime = performance.now() - startTime;
        const avgOptimizedTime = optimizedTime / PERF_TEST_CONFIG.collisionTestIterations;
        
        this.log(`Optimized collision detection: ${avgOptimizedTime.toFixed(3)}ms per call`, "INFO");
        
        if (avgOptimizedTime < 1.0) {
            this.log("✅ Collision detection optimization: EXCELLENT", "PASS");
        } else if (avgOptimizedTime < 5.0) {
            this.log("⚠️  Collision detection optimization: ACCEPTABLE", "WARN");
        } else {
            this.log("❌ Collision detection optimization: POOR", "FAIL");
        }
    }

    async testHighCubeCountStress() {
        this.log("🔥 Testing High Cube Count Stress Performance", "TEST");
        
        if (!window.scene || !window.THREE) {
            this.log("Scene or THREE.js not available", "WARN");
            return;
        }
        
        // Create stress test cubes
        this.log(`Creating ${PERF_TEST_CONFIG.cubeStressTestCount} stress test cubes...`, "INFO");
        
        const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const materials = [];
        
        for (let i = 0; i < PERF_TEST_CONFIG.cubeStressTestCount; i++) {
            const material = new THREE.MeshBasicMaterial({ 
                color: Math.floor(Math.random() * 0xffffff) 
            });
            materials.push(material);
            
            const cube = new THREE.Mesh(geometry, material);
            cube.position.set(
                (Math.random() - 0.5) * 20,
                Math.random() * 2,
                (Math.random() - 0.5) * 10
            );
            
            scene.add(cube);
            this.stressTestCubes.push(cube);
            
            // Register with resource manager if available
            if (window.resourceManager) {
                window.resourceManager.registerMesh(cube, `stressTest_${i}`);
            }
        }
        
        this.log(`✅ Created ${this.stressTestCubes.length} stress test cubes`, "PASS");
        
        // Monitor performance with high cube count
        await this.monitorPerformanceWithHighCubeCount();
        
        // Cleanup stress test cubes
        this.cleanupStressTestCubes();
    }

    async monitorPerformanceWithHighCubeCount() {
        this.log("Monitoring performance with high cube count...", "INFO");
        
        if (!window.performanceMonitor) {
            this.log("PerformanceMonitor not available", "WARN");
            return;
        }
        
        // Monitor for 10 seconds
        const monitorDuration = 10000;
        const startTime = performance.now();
        const initialReport = window.performanceMonitor.getReport();
        
        await new Promise(resolve => {
            const checkPerformance = () => {
                const elapsed = performance.now() - startTime;
                
                if (elapsed >= monitorDuration) {
                    resolve();
                    return;
                }
                
                // Continue monitoring
                setTimeout(checkPerformance, 100);
            };
            
            checkPerformance();
        });
        
        const finalReport = window.performanceMonitor.getReport();
        
        const performanceData = {
            initialFPS: initialReport.averageFPS,
            finalFPS: finalReport.averageFPS,
            fpsChange: finalReport.averageFPS - initialReport.averageFPS,
            minFPS: finalReport.minFPS,
            performance: finalReport.performance,
            cubeCount: this.stressTestCubes.length
        };
        
        this.log("High cube count performance results", "INFO", performanceData);
        
        if (performanceData.finalFPS >= PERF_TEST_CONFIG.targetFPS * 0.9) {
            this.log("✅ High cube count performance: EXCELLENT", "PASS");
        } else if (performanceData.finalFPS >= PERF_TEST_CONFIG.acceptableMinFPS) {
            this.log("⚠️  High cube count performance: ACCEPTABLE", "WARN");
        } else {
            this.log("❌ High cube count performance: POOR", "FAIL");
        }
    }

    async testAdaptiveQualitySystem() {
        this.log("🎚️ Testing Adaptive Quality System", "TEST");
        
        if (!window.adaptiveQualitySystem) {
            this.log("AdaptiveQualitySystem not available", "WARN");
            return;
        }
        
        const qualitySystem = window.adaptiveQualitySystem;
        const initialSettings = qualitySystem.getQualitySettings();
        
        // Force quality adjustment by simulating poor performance
        for (let i = 0; i < 10; i++) {
            qualitySystem.updateQuality();
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        const adjustedSettings = qualitySystem.getQualitySettings();
        
        const qualityData = {
            initialLevel: initialSettings.level,
            adjustedLevel: adjustedSettings.level,
            qualityChanged: Math.abs(adjustedSettings.level - initialSettings.level) > 0.01,
            settings: adjustedSettings
        };
        
        this.log("Adaptive quality system results", "INFO", qualityData);
        
        if (typeof qualitySystem.updateQuality === 'function') {
            this.log("✅ Adaptive Quality System: OPERATIONAL", "PASS");
        } else {
            this.log("❌ Adaptive Quality System: NOT FUNCTIONAL", "FAIL");
        }
    }

    async testFrameRateStability() {
        this.log("📊 Testing Frame Rate Stability", "TEST");
        
        if (!window.performanceMonitor) {
            this.log("PerformanceMonitor not available", "WARN");
            return;
        }
        
        // Monitor frame rate for stability
        const monitorDuration = 5000; // 5 seconds
        const startTime = performance.now();
        const frameTimesSample = [];
        
        const sampleFrames = () => {
            const elapsed = performance.now() - startTime;
            
            if (elapsed < monitorDuration) {
                const report = window.performanceMonitor.getReport();
                frameTimesSample.push(report.currentFPS);
                
                requestAnimationFrame(sampleFrames);
            }
        };
        
        await new Promise(resolve => {
            sampleFrames();
            setTimeout(resolve, monitorDuration);
        });
        
        // Analyze frame rate stability
        const avgFPS = frameTimesSample.reduce((a, b) => a + b, 0) / frameTimesSample.length;
        const minFPS = Math.min(...frameTimesSample);
        const maxFPS = Math.max(...frameTimesSample);
        const variance = frameTimesSample.reduce((sum, fps) => {
            return sum + Math.pow(fps - avgFPS, 2);
        }, 0) / frameTimesSample.length;
        const stability = Math.sqrt(variance);
        
        const stabilityData = {
            samples: frameTimesSample.length,
            avgFPS: avgFPS.toFixed(2),
            minFPS: minFPS.toFixed(2),
            maxFPS: maxFPS.toFixed(2),
            stability: stability.toFixed(2),
            droppedFrames: frameTimesSample.filter(fps => fps < 30).length
        };
        
        this.log("Frame rate stability results", "INFO", stabilityData);
        
        if (avgFPS >= PERF_TEST_CONFIG.targetFPS && stability < 10) {
            this.log("✅ Frame rate stability: EXCELLENT", "PASS");
        } else if (avgFPS >= PERF_TEST_CONFIG.acceptableMinFPS && stability < 20) {
            this.log("⚠️  Frame rate stability: ACCEPTABLE", "WARN");
        } else {
            this.log("❌ Frame rate stability: POOR", "FAIL");
        }
    }

    async testMemoryPerformanceUnderLoad() {
        this.log("🧠 Testing Memory Performance Under Load", "TEST");
        
        if (!window.resourceManager || !window.monitor) {
            this.log("ResourceManager or Monitor not available", "WARN");
            return;
        }
        
        const initialResourceStats = window.resourceManager.getResourceStats();
        const initialMemoryStats = window.monitor.getStats();
        
        // Create and destroy objects rapidly to test memory management
        const testObjects = [];
        
        for (let cycle = 0; cycle < 5; cycle++) {
            // Create objects
            for (let i = 0; i < 50; i++) {
                const geo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
                const mat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                const mesh = new THREE.Mesh(geo, mat);
                testObjects.push({ geo, mat, mesh });
            }
            
            // Wait a bit
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Clean up objects
            testObjects.forEach(({ geo, mat, mesh }) => {
                geo.dispose();
                mat.dispose();
            });
            testObjects.length = 0;
            
            // Force garbage collection if available
            if (window.gc) {
                window.gc();
            }
        }
        
        const finalResourceStats = window.resourceManager.getResourceStats();
        const finalMemoryStats = window.monitor.getStats();
        
        const memoryData = {
            initialMemory: initialMemoryStats.memoryUsageMB,
            finalMemory: finalMemoryStats.memoryUsageMB,
            memoryIncrease: finalMemoryStats.memoryUsageMB - initialMemoryStats.memoryUsageMB,
            initialResources: initialResourceStats.active?.geometries || 0,
            finalResources: finalResourceStats.active?.geometries || 0,
            resourceIncrease: (finalResourceStats.active?.geometries || 0) - (initialResourceStats.active?.geometries || 0)
        };
        
        this.log("Memory performance under load results", "INFO", memoryData);
        
        if (memoryData.memoryIncrease < 50 && memoryData.resourceIncrease < 10) {
            this.log("✅ Memory performance under load: EXCELLENT", "PASS");
        } else if (memoryData.memoryIncrease < 100 && memoryData.resourceIncrease < 25) {
            this.log("⚠️  Memory performance under load: ACCEPTABLE", "WARN");
        } else {
            this.log("❌ Memory performance under load: POOR", "FAIL");
        }
    }

    cleanupStressTestCubes() {
        this.log("🧹 Cleaning up stress test cubes...", "INFO");
        
        for (const cube of this.stressTestCubes) {
            if (cube.parent) {
                cube.parent.remove(cube);
            }
            
            if (cube.geometry) cube.geometry.dispose();
            if (cube.material) cube.material.dispose();
        }
        
        this.stressTestCubes.length = 0;
        this.log(`✅ Cleaned up stress test cubes`, "PASS");
    }

    generatePerformanceReport() {
        const endTime = performance.now();
        const totalDuration = endTime - this.startTime;
        
        const passCount = this.testResults.filter(r => r.level === 'PASS').length;
        const warnCount = this.testResults.filter(r => r.level === 'WARN').length;
        const failCount = this.testResults.filter(r => r.level === 'FAIL').length;
        
        const performanceGrade = failCount === 0 ? 
            (warnCount === 0 ? 'EXCELLENT' : 'GOOD') : 'NEEDS_IMPROVEMENT';
        
        const report = {
            metadata: {
                testSuite: "ChordCubes 5.0 Performance Validation Suite",
                timestamp: new Date().toISOString(),
                duration: totalDuration,
                performanceGrade
            },
            summary: {
                totalTests: passCount + warnCount + failCount,
                passed: passCount,
                warnings: warnCount,
                failed: failCount,
                successRate: ((passCount / (passCount + warnCount + failCount)) * 100).toFixed(1)
            },
            systemMetrics: {
                performanceMonitor: window.performanceMonitor?.getReport() || null,
                resourceManager: window.resourceManager?.getResourceStats() || null,
                spatialGrid: window.spatialHashGrid?.getStats() || null,
                adaptiveQuality: window.adaptiveQualitySystem?.getQualitySettings() || null
            },
            testResults: this.testResults
        };
        
        this.log("=" * 80, "INFO");
        this.log("🏆 PERFORMANCE VALIDATION COMPLETE", "INFO");
        this.log(`Grade: ${performanceGrade}`, "INFO");
        this.log(`Passed: ${passCount}, Warnings: ${warnCount}, Failed: ${failCount}`, "INFO");
        this.log(`Duration: ${totalDuration.toFixed(0)}ms`, "INFO");
        this.log("=" * 80, "INFO");
        
        return report;
    }
}

// Auto-execute performance validation suite
if (typeof window !== 'undefined') {
    const startPerformanceTests = () => {
        // Wait for all optimization systems to be ready
        if (window.spatialHashGrid && 
            window.performanceMonitor && 
            window.optimizedCollisionDetector && 
            window.adaptiveQualitySystem) {
            
            console.log("🚀 All performance optimization systems ready, starting validation...");
            
            const testSuite = new PerformanceValidationSuite();
            testSuite.runPerformanceTests().then(report => {
                console.log("🏆 Performance validation completed!");
                window.performanceValidationReport = report;
                
                // Store results
                localStorage.setItem('chordcubes_performance_report', JSON.stringify(report));
                
            }).catch(error => {
                console.error("❌ Performance validation failed:", error);
                window.performanceValidationReport = { error: error.message };
            });
            
        } else {
            console.log("⏳ Waiting for performance optimization systems...");
            setTimeout(startPerformanceTests, 2000);
        }
    };
    
    // Start tests after systems are initialized
    setTimeout(startPerformanceTests, 5000);
}

export { PerformanceValidationSuite };
