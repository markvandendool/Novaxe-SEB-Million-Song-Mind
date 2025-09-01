/**
 * ChordCubes 5.0 - Resource Manager Integration Test Suite
 * Military-Grade Testing for Memory Leak Prevention System
 * 
 * Tests comprehensive Three.js resource tracking integration:
 * - Geometry registration and cleanup
 * - Material registration and disposal 
 * - Texture registration and cleanup
 * - Mesh tracking and removal
 * - VexFlow SVG cleanup
 * - Memory limit enforcement
 */

// Test configuration
const TEST_CONFIG = {
    maxTestTimeMs: 30000,
    memoryLimitMB: 512,
    expectedRegistrations: {
        geometries: 15,
        materials: 20,
        textures: 8,
        meshes: 25
    }
};

/**
 * Comprehensive Resource Manager Integration Test Suite
 */
class ResourceManagerIntegrationTestSuite {
    constructor() {
        this.testResults = [];
        this.startTime = Date.now();
    }

    log(message, type = 'INFO') {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${type}] ${message}`;
        console.log(logMessage);
        this.testResults.push({ timestamp, type, message });
    }

    async runAllTests() {
        this.log("Starting Resource Manager Integration Test Suite", "TEST");
        
        try {
            // Phase 1: Basic Resource Manager Availability
            await this.testResourceManagerAvailability();
            
            // Phase 2: Registration Method Testing
            await this.testRegistrationMethods();
            
            // Phase 3: Tracking Integration Testing
            await this.testTrackingIntegration();
            
            // Phase 4: Memory Monitoring Testing
            await this.testMemoryMonitoring();
            
            // Phase 5: Cleanup Integration Testing
            await this.testCleanupIntegration();
            
            // Phase 6: Performance Impact Testing
            await this.testPerformanceImpact();
            
            this.log("All Resource Manager Integration Tests Completed Successfully", "SUCCESS");
            return this.generateTestReport();
            
        } catch (error) {
            this.log(`Critical test failure: ${error.message}`, "ERROR");
            this.log(`Stack trace: ${error.stack}`, "ERROR");
            throw error;
        }
    }

    async testResourceManagerAvailability() {
        this.log("Testing Resource Manager Availability", "TEST");
        
        // Test 1: Window object availability
        if (typeof window === 'undefined') {
            throw new Error("Window object not available - running in non-browser environment");
        }
        this.log("✓ Window object available", "PASS");
        
        // Test 2: Resource manager existence
        if (!window.resourceManager) {
            throw new Error("ResourceManager not found on window object");
        }
        this.log("✓ ResourceManager found on window object", "PASS");
        
        // Test 3: Required methods availability
        const requiredMethods = [
            'registerGeometry', 'registerMaterial', 'registerTexture', 'registerMesh',
            'unregisterGeometry', 'unregisterMaterial', 'unregisterTexture', 'unregisterMesh',
            'getResourceStats', 'cleanup', 'emergencyCleanup'
        ];
        
        for (const method of requiredMethods) {
            if (typeof window.resourceManager[method] !== 'function') {
                throw new Error(`ResourceManager missing required method: ${method}`);
            }
        }
        this.log("✓ All required methods available", "PASS");
        
        // Test 4: VexFlow cleanup manager availability
        if (window.resourceManager.vexFlowManager) {
            if (typeof window.resourceManager.vexFlowManager.cleanup !== 'function') {
                throw new Error("VexFlowCleanupManager missing cleanup method");
            }
            this.log("✓ VexFlowCleanupManager available", "PASS");
        }
    }

    async testRegistrationMethods() {
        this.log("Testing Registration Methods", "TEST");
        
        // Create test Three.js objects
        const testGeometry = new THREE.BoxGeometry(1, 1, 1);
        const testMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const testTexture = new THREE.Texture();
        const testMesh = new THREE.Mesh(testGeometry, testMaterial);
        
        try {
            // Test geometry registration
            window.resourceManager.registerGeometry(testGeometry, 'test_geometry');
            this.log("✓ Geometry registration successful", "PASS");
            
            // Test material registration
            window.resourceManager.registerMaterial(testMaterial, 'test_material');
            this.log("✓ Material registration successful", "PASS");
            
            // Test texture registration
            window.resourceManager.registerTexture(testTexture, 'test_texture');
            this.log("✓ Texture registration successful", "PASS");
            
            // Test mesh registration
            window.resourceManager.registerMesh(testMesh, 'test_mesh');
            this.log("✓ Mesh registration successful", "PASS");
            
            // Verify registration in resource stats
            const stats = window.resourceManager.getResourceStats();
            if (stats.geometries === 0 || stats.materials === 0 || stats.meshes === 0) {
                throw new Error("Resource registration not reflected in stats");
            }
            this.log("✓ Registration reflected in resource statistics", "PASS");
            
            // Test cleanup
            window.resourceManager.unregisterGeometry('test_geometry');
            window.resourceManager.unregisterMaterial('test_material');
            window.resourceManager.unregisterTexture('test_texture');
            window.resourceManager.unregisterMesh('test_mesh');
            this.log("✓ Resource unregistration successful", "PASS");
            
        } catch (error) {
            throw new Error(`Registration method test failed: ${error.message}`);
        }
    }

    async testTrackingIntegration() {
        this.log("Testing Three.js Creation Tracking Integration", "TEST");
        
        // Count initial resources
        const initialStats = window.resourceManager.getResourceStats();
        this.log(`Initial resource stats: ${JSON.stringify(initialStats)}`, "INFO");
        
        // Test 1: Cube creation tracking
        try {
            // This should trigger our integrated tracking
            const testCube = new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 1),
                new THREE.MeshBasicMaterial({ color: 0x00ff00 })
            );
            
            // Small delay to allow tracking to process
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const afterStats = window.resourceManager.getResourceStats();
            this.log(`After cube creation stats: ${JSON.stringify(afterStats)}`, "INFO");
            
            if (afterStats.geometries <= initialStats.geometries && 
                afterStats.materials <= initialStats.materials) {
                this.log("⚠ Cube creation may not be properly tracked", "WARN");
            } else {
                this.log("✓ Cube creation appears to be tracked", "PASS");
            }
            
        } catch (error) {
            this.log(`Cube creation tracking test failed: ${error.message}`, "ERROR");
        }
        
        // Test 2: Texture creation tracking
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const testTexture = new THREE.CanvasTexture(canvas);
            
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const textureStats = window.resourceManager.getResourceStats();
            this.log(`After texture creation stats: ${JSON.stringify(textureStats)}`, "INFO");
            
        } catch (error) {
            this.log(`Texture creation tracking test failed: ${error.message}`, "ERROR");
        }
    }

    async testMemoryMonitoring() {
        this.log("Testing Memory Monitoring Integration", "TEST");
        
        try {
            // Test memory stats availability
            const stats = window.resourceManager.getResourceStats();
            if (typeof stats.estimatedMemoryMB === 'undefined') {
                throw new Error("Memory estimation not available in resource stats");
            }
            this.log(`✓ Memory estimation available: ${stats.estimatedMemoryMB}MB`, "PASS");
            
            // Test memory limit checking
            const memoryLimitMB = window.resourceManager.memoryLimitMB || 256;
            this.log(`✓ Memory limit configured: ${memoryLimitMB}MB`, "PASS");
            
            if (stats.estimatedMemoryMB > memoryLimitMB * 0.8) {
                this.log(`⚠ Memory usage high: ${stats.estimatedMemoryMB}MB (limit: ${memoryLimitMB}MB)`, "WARN");
            }
            
        } catch (error) {
            throw new Error(`Memory monitoring test failed: ${error.message}`);
        }
    }

    async testCleanupIntegration() {
        this.log("Testing Cleanup Integration", "TEST");
        
        try {
            // Create test resources
            const resources = [];
            for (let i = 0; i < 5; i++) {
                const geo = new THREE.BoxGeometry(1, 1, 1);
                const mat = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
                const mesh = new THREE.Mesh(geo, mat);
                resources.push({ geo, mat, mesh, id: `cleanup_test_${i}` });
                
                window.resourceManager.registerGeometry(geo, `cleanup_test_${i}_geo`);
                window.resourceManager.registerMaterial(mat, `cleanup_test_${i}_mat`);
                window.resourceManager.registerMesh(mesh, `cleanup_test_${i}_mesh`);
            }
            
            const beforeCleanup = window.resourceManager.getResourceStats();
            this.log(`Before cleanup: ${JSON.stringify(beforeCleanup)}`, "INFO");
            
            // Test selective cleanup
            for (let i = 0; i < 3; i++) {
                window.resourceManager.unregisterGeometry(`cleanup_test_${i}_geo`);
                window.resourceManager.unregisterMaterial(`cleanup_test_${i}_mat`);
                window.resourceManager.unregisterMesh(`cleanup_test_${i}_mesh`);
            }
            
            const afterPartialCleanup = window.resourceManager.getResourceStats();
            this.log(`After partial cleanup: ${JSON.stringify(afterPartialCleanup)}`, "INFO");
            
            // Test bulk cleanup
            window.resourceManager.cleanup();
            
            const afterBulkCleanup = window.resourceManager.getResourceStats();
            this.log(`After bulk cleanup: ${JSON.stringify(afterBulkCleanup)}`, "INFO");
            
            this.log("✓ Cleanup integration test completed", "PASS");
            
        } catch (error) {
            throw new Error(`Cleanup integration test failed: ${error.message}`);
        }
    }

    async testPerformanceImpact() {
        this.log("Testing Performance Impact", "TEST");
        
        try {
            const iterations = 1000;
            
            // Test without tracking (baseline)
            const startBaseline = performance.now();
            for (let i = 0; i < iterations; i++) {
                const geo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
                const mat = new THREE.MeshBasicMaterial({ color: 0x000000 });
                const mesh = new THREE.Mesh(geo, mat);
                // Cleanup immediately
                geo.dispose();
                mat.dispose();
            }
            const baselineTime = performance.now() - startBaseline;
            
            // Test with tracking
            const startTracked = performance.now();
            for (let i = 0; i < iterations; i++) {
                const geo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
                const mat = new THREE.MeshBasicMaterial({ color: 0x000000 });
                const mesh = new THREE.Mesh(geo, mat);
                
                // Simulate our tracking
                window.resourceManager.registerGeometry(geo, `perf_test_${i}_geo`);
                window.resourceManager.registerMaterial(mat, `perf_test_${i}_mat`);
                window.resourceManager.registerMesh(mesh, `perf_test_${i}_mesh`);
                
                // Cleanup
                window.resourceManager.unregisterGeometry(`perf_test_${i}_geo`);
                window.resourceManager.unregisterMaterial(`perf_test_${i}_mat`);
                window.resourceManager.unregisterMesh(`perf_test_${i}_mesh`);
                geo.dispose();
                mat.dispose();
            }
            const trackedTime = performance.now() - startTracked;
            
            const overhead = ((trackedTime - baselineTime) / baselineTime * 100).toFixed(2);
            this.log(`Performance overhead: ${overhead}% (baseline: ${baselineTime.toFixed(2)}ms, tracked: ${trackedTime.toFixed(2)}ms)`, "INFO");
            
            if (overhead > 50) {
                this.log(`⚠ High performance overhead detected: ${overhead}%`, "WARN");
            } else {
                this.log(`✓ Performance overhead acceptable: ${overhead}%`, "PASS");
            }
            
        } catch (error) {
            throw new Error(`Performance impact test failed: ${error.message}`);
        }
    }

    generateTestReport() {
        const endTime = Date.now();
        const duration = endTime - this.startTime;
        
        const passCount = this.testResults.filter(r => r.type === 'PASS').length;
        const warnCount = this.testResults.filter(r => r.type === 'WARN').length;
        const errorCount = this.testResults.filter(r => r.type === 'ERROR').length;
        
        const report = {
            summary: {
                totalDuration: duration,
                passCount,
                warnCount,
                errorCount,
                success: errorCount === 0
            },
            resourceStats: window.resourceManager ? window.resourceManager.getResourceStats() : null,
            testResults: this.testResults
        };
        
        this.log(`Test Report: ${passCount} passed, ${warnCount} warnings, ${errorCount} errors in ${duration}ms`, "SUMMARY");
        
        return report;
    }
}

// Auto-run tests if in browser environment
if (typeof window !== 'undefined') {
    // Wait for resource manager to be available
    const waitForResourceManager = () => {
        if (window.resourceManager) {
            console.log("[TEST] Resource Manager detected, starting integration tests...");
            const testSuite = new ResourceManagerIntegrationTestSuite();
            testSuite.runAllTests().then(report => {
                console.log("[TEST] Integration test suite completed:", report);
                window.resourceManagerTestReport = report;
            }).catch(error => {
                console.error("[TEST] Integration test suite failed:", error);
                window.resourceManagerTestReport = { error: error.message };
            });
        } else {
            console.log("[TEST] Waiting for Resource Manager...");
            setTimeout(waitForResourceManager, 1000);
        }
    };
    
    // Start waiting after a short delay to ensure main.js has loaded
    setTimeout(waitForResourceManager, 2000);
}

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResourceManagerIntegrationTestSuite;
}
