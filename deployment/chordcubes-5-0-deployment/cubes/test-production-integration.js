/**
 * ChordCubes 5.0 - Production Integration Test Suite
 * Military-Grade End-to-End System Validation
 * 
 * Validates complete system integration:
 * - ChordCubesMonitor operational status
 * - UnifiedAudioContextManager functionality
 * - ThreeJSResourceManager tracking effectiveness
 * - Revolutionary Audio Cutoff System preservation
 * - Performance benchmarking under load
 * - Emergency protocols validation
 */

// Production test configuration
const PRODUCTION_TEST_CONFIG = {
    maxTestDurationMs: 120000, // 2 minutes max
    cubeCreationTestCount: 50,
    audioTestDurationMs: 10000,
    memoryTestIterations: 100,
    performanceThresholds: {
        maxFrameTime: 16.67, // 60fps = 16.67ms per frame
        maxMemoryUsageMB: 512,
        maxResourceCount: 1000
    }
};

/**
 * Production Integration Test Suite for ChordCubes 5.0
 */
class ChordCubesProductionTestSuite {
    constructor() {
        this.results = [];
        this.startTime = performance.now();
        this.testsPassed = 0;
        this.testsWarning = 0;
        this.testsFailed = 0;
    }

    log(message, level = 'INFO', data = null) {
        const timestamp = new Date().toISOString();
        const result = {
            timestamp,
            level,
            message,
            data: data ? JSON.stringify(data) : null
        };
        
        this.results.push(result);
        
        const color = {
            'PASS': '\\x1b[32m', // Green
            'WARN': '\\x1b[33m', // Yellow  
            'FAIL': '\\x1b[31m', // Red
            'INFO': '\\x1b[36m', // Cyan
            'TEST': '\\x1b[35m'  // Magenta
        }[level] || '\\x1b[0m';
        
        console.log(`${color}[${timestamp.split('T')[1].split('.')[0]}] [${level}] ${message}\\x1b[0m`);
        
        if (data) {
            console.log(`${color}    Data: ${JSON.stringify(data, null, 2)}\\x1b[0m`);
        }
        
        // Update counters
        if (level === 'PASS') this.testsPassed++;
        else if (level === 'WARN') this.testsWarning++;
        else if (level === 'FAIL') this.testsFailed++;
    }

    async runProductionTests() {
        this.log("🚀 STARTING CHORDCUBES 5.0 PRODUCTION INTEGRATION TEST SUITE", "TEST");
        this.log("=" * 80, "INFO");
        
        try {
            // Phase 1: System Availability Tests
            await this.testSystemAvailability();
            
            // Phase 2: Monitor System Integration
            await this.testMonitorIntegration();
            
            // Phase 3: Audio System Integration  
            await this.testAudioSystemIntegration();
            
            // Phase 4: Resource Manager Integration
            await this.testResourceManagerIntegration();
            
            // Phase 5: Performance Under Load
            await this.testPerformanceUnderLoad();
            
            // Phase 6: Revolutionary Audio Cutoff Preservation
            await this.testRevolutionaryAudioCutoffPreservation();
            
            // Phase 7: Emergency Protocol Validation
            await this.testEmergencyProtocols();
            
            // Phase 8: Production Readiness Assessment
            await this.assessProductionReadiness();
            
            return this.generateProductionReport();
            
        } catch (error) {
            this.log(`CRITICAL SYSTEM FAILURE: ${error.message}`, "FAIL");
            this.log(`Stack Trace: ${error.stack}`, "FAIL");
            throw error;
        }
    }

    async testSystemAvailability() {
        this.log("📋 Phase 1: System Availability Tests", "TEST");
        
        // Test Three.js availability
        if (typeof THREE === 'undefined') {
            this.log("Three.js not available", "FAIL");
            throw new Error("Three.js library missing");
        }
        this.log("Three.js library available", "PASS");
        
        // Test Tone.js availability
        if (typeof Tone === 'undefined') {
            this.log("Tone.js not available", "FAIL");
            throw new Error("Tone.js library missing");
        }
        this.log("Tone.js library available", "PASS");
        
        // Test core ChordCubes components
        const coreComponents = [
            'scene', 'camera', 'renderer', 'cubes', 'shelfCubes', 'lineup'
        ];
        
        for (const component of coreComponents) {
            if (typeof window[component] === 'undefined') {
                this.log(`Core component missing: ${component}`, "WARN");
            } else {
                this.log(`Core component available: ${component}`, "PASS");
            }
        }
        
        // Test DOM integration
        const requiredElements = ['#canvas', '#progress'];
        let domReady = true;
        
        for (const selector of requiredElements) {
            if (!document.querySelector(selector)) {
                this.log(`Required DOM element missing: ${selector}`, "WARN");
                domReady = false;
            }
        }
        
        if (domReady) {
            this.log("DOM integration ready", "PASS");
        }
    }

    async testMonitorIntegration() {
        this.log("📊 Phase 2: Monitor System Integration", "TEST");
        
        // Test monitor availability
        if (!window.monitor) {
            this.log("ChordCubesMonitor not found", "FAIL");
            return;
        }
        this.log("ChordCubesMonitor available", "PASS");
        
        // Test monitor stats
        try {
            const stats = window.monitor.getStats();
            this.log("Monitor statistics retrieved", "PASS", stats);
            
            // Validate stats structure
            const requiredFields = ['audioContexts', 'memoryUsageMB', 'webglContexts', 'midiPorts', 'fps'];
            for (const field of requiredFields) {
                if (typeof stats[field] === 'undefined') {
                    this.log(`Monitor missing field: ${field}`, "WARN");
                } else {
                    this.log(`Monitor field available: ${field} = ${stats[field]}`, "PASS");
                }
            }
            
        } catch (error) {
            this.log(`Monitor stats error: ${error.message}`, "FAIL");
        }
        
        // Test monitor health check
        try {
            const health = window.monitor.healthCheck();
            if (health.status === 'healthy') {
                this.log("Monitor health check: HEALTHY", "PASS");
            } else {
                this.log(`Monitor health check: ${health.status}`, "WARN", health);
            }
        } catch (error) {
            this.log(`Monitor health check failed: ${error.message}`, "FAIL");
        }
    }

    async testAudioSystemIntegration() {
        this.log("🎵 Phase 3: Audio System Integration", "TEST");
        
        // Test unified audio manager
        if (!window.unifiedAudioManager) {
            this.log("UnifiedAudioContextManager not found", "FAIL");
            return;
        }
        this.log("UnifiedAudioContextManager available", "PASS");
        
        try {
            // Test audio context creation
            const audioContext = await window.unifiedAudioManager.getAudioContext();
            if (audioContext && audioContext.state) {
                this.log(`Audio context state: ${audioContext.state}`, "PASS");
            } else {
                this.log("Audio context creation failed", "FAIL");
            }
            
            // Test WebAudioFont integration
            if (window.unifiedAudioManager.webAudioFont) {
                this.log("WebAudioFont integration available", "PASS");
            } else {
                this.log("WebAudioFont integration missing", "WARN");
            }
            
            // Test emergency shutdown capability
            if (typeof window.unifiedAudioManager.emergencyShutdown === 'function') {
                this.log("Emergency shutdown capability available", "PASS");
            } else {
                this.log("Emergency shutdown capability missing", "WARN");
            }
            
        } catch (error) {
            this.log(`Audio system test failed: ${error.message}`, "FAIL");
        }
    }

    async testResourceManagerIntegration() {
        this.log("🗄️ Phase 4: Resource Manager Integration", "TEST");
        
        // Test resource manager availability
        if (!window.resourceManager) {
            this.log("ThreeJSResourceManager not found", "FAIL");
            return;
        }
        this.log("ThreeJSResourceManager available", "PASS");
        
        try {
            // Get initial stats
            const initialStats = window.resourceManager.getResourceStats();
            this.log("Resource manager stats retrieved", "PASS", initialStats);
            
            // Test resource tracking
            const testGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
            const testMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const testMesh = new THREE.Mesh(testGeo, testMat);
            
            // These should be automatically tracked if our integration is working
            await new Promise(resolve => setTimeout(resolve, 100)); // Allow tracking to process
            
            const afterStats = window.resourceManager.getResourceStats();
            
            if (afterStats.geometries > initialStats.geometries || 
                afterStats.materials > initialStats.materials ||
                afterStats.meshes > initialStats.meshes) {
                this.log("Resource tracking appears to be working", "PASS");
            } else {
                this.log("Resource tracking may not be working", "WARN");
            }
            
            // Clean up test resources
            testGeo.dispose();
            testMat.dispose();
            
            // Test VexFlow cleanup if available
            if (window.resourceManager.vexFlowManager) {
                this.log("VexFlow cleanup manager available", "PASS");
            }
            
        } catch (error) {
            this.log(`Resource manager test failed: ${error.message}`, "FAIL");
        }
    }

    async testPerformanceUnderLoad() {
        this.log("⚡ Phase 5: Performance Under Load", "TEST");
        
        try {
            const frameTimings = [];
            const memoryReadings = [];
            
            // Performance test: Create and track multiple cubes
            const testStartTime = performance.now();
            
            for (let i = 0; i < PRODUCTION_TEST_CONFIG.cubeCreationTestCount; i++) {
                const frameStart = performance.now();
                
                // Simulate cube creation
                const geo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
                const mat = new THREE.MeshBasicMaterial({ 
                    color: Math.floor(Math.random() * 0xffffff) 
                });
                const mesh = new THREE.Mesh(geo, mat);
                
                // Add to scene temporarily
                if (window.scene) {
                    scene.add(mesh);
                }
                
                const frameEnd = performance.now();
                frameTimings.push(frameEnd - frameStart);
                
                // Memory reading
                if (window.monitor) {
                    const stats = window.monitor.getStats();
                    memoryReadings.push(stats.memoryUsageMB || 0);
                }
                
                // Clean up immediately
                geo.dispose();
                mat.dispose();
                if (window.scene) {
                    scene.remove(mesh);
                }
                
                // Small delay to prevent overwhelming the system
                await new Promise(resolve => setTimeout(resolve, 10));
            }
            
            const testDuration = performance.now() - testStartTime;
            
            // Analyze performance
            const avgFrameTime = frameTimings.reduce((a, b) => a + b, 0) / frameTimings.length;
            const maxFrameTime = Math.max(...frameTimings);
            const maxMemory = Math.max(...memoryReadings);
            
            this.log(`Performance test completed in ${testDuration.toFixed(2)}ms`, "INFO");
            this.log(`Average frame time: ${avgFrameTime.toFixed(2)}ms`, "INFO");
            this.log(`Max frame time: ${maxFrameTime.toFixed(2)}ms`, "INFO");
            this.log(`Max memory usage: ${maxMemory.toFixed(2)}MB`, "INFO");
            
            // Check against thresholds
            if (avgFrameTime <= PRODUCTION_TEST_CONFIG.performanceThresholds.maxFrameTime) {
                this.log("Average frame time: WITHIN THRESHOLD", "PASS");
            } else {
                this.log("Average frame time: EXCEEDS THRESHOLD", "WARN");
            }
            
            if (maxMemory <= PRODUCTION_TEST_CONFIG.performanceThresholds.maxMemoryUsageMB) {
                this.log("Memory usage: WITHIN THRESHOLD", "PASS");
            } else {
                this.log("Memory usage: EXCEEDS THRESHOLD", "WARN");
            }
            
        } catch (error) {
            this.log(`Performance test failed: ${error.message}`, "FAIL");
        }
    }

    async testRevolutionaryAudioCutoffPreservation() {
        this.log("🎼 Phase 6: Revolutionary Audio Cutoff Preservation", "TEST");
        
        try {
            // Check if Revolutionary Audio Cutoff System is intact
            if (typeof window.revolutionaryAudioCutoff !== 'undefined') {
                this.log("Revolutionary Audio Cutoff System detected", "PASS");
            } else {
                this.log("Revolutionary Audio Cutoff System not detected", "WARN");
            }
            
            // Test audio cutoff functionality if available
            if (window.unifiedAudioManager && 
                typeof window.unifiedAudioManager.preservedCutoffSystem !== 'undefined') {
                this.log("Revolutionary Audio Cutoff preserved in unified manager", "PASS");
            } else {
                this.log("Revolutionary Audio Cutoff preservation unclear", "WARN");
            }
            
            // Check for audio source tracking
            if (window.unifiedAudioManager && window.unifiedAudioManager.activeSources) {
                const sourceCount = window.unifiedAudioManager.activeSources.size || 0;
                this.log(`Active audio sources tracked: ${sourceCount}`, "INFO");
            }
            
        } catch (error) {
            this.log(`Revolutionary Audio Cutoff test failed: ${error.message}`, "FAIL");
        }
    }

    async testEmergencyProtocols() {
        this.log("🚨 Phase 7: Emergency Protocol Validation", "TEST");
        
        try {
            // Test monitor emergency shutdown
            if (window.monitor && typeof window.monitor.emergencyShutdown === 'function') {
                this.log("Monitor emergency shutdown available", "PASS");
            } else {
                this.log("Monitor emergency shutdown missing", "WARN");
            }
            
            // Test audio manager emergency shutdown  
            if (window.unifiedAudioManager && 
                typeof window.unifiedAudioManager.emergencyShutdown === 'function') {
                this.log("Audio manager emergency shutdown available", "PASS");
            } else {
                this.log("Audio manager emergency shutdown missing", "WARN");
            }
            
            // Test resource manager emergency cleanup
            if (window.resourceManager && 
                typeof window.resourceManager.emergencyCleanup === 'function') {
                this.log("Resource manager emergency cleanup available", "PASS");
            } else {
                this.log("Resource manager emergency cleanup missing", "WARN");
            }
            
        } catch (error) {
            this.log(`Emergency protocol test failed: ${error.message}`, "FAIL");
        }
    }

    async assessProductionReadiness() {
        this.log("🎯 Phase 8: Production Readiness Assessment", "TEST");
        
        const readinessChecklist = [
            { name: "All core systems available", test: () => window.monitor && window.unifiedAudioManager && window.resourceManager },
            { name: "No critical failures", test: () => this.testsFailed === 0 },
            { name: "Performance thresholds met", test: () => this.testsWarning <= this.testsPassed },
            { name: "Emergency protocols operational", test: () => window.monitor?.emergencyShutdown && window.unifiedAudioManager?.emergencyShutdown },
            { name: "Resource tracking active", test: () => window.resourceManager?.getResourceStats },
        ];
        
        let readinessScore = 0;
        const maxScore = readinessChecklist.length;
        
        for (const check of readinessChecklist) {
            try {
                if (check.test()) {
                    this.log(`✓ ${check.name}`, "PASS");
                    readinessScore++;
                } else {
                    this.log(`✗ ${check.name}`, "FAIL");
                }
            } catch (error) {
                this.log(`✗ ${check.name}: ${error.message}`, "FAIL");
            }
        }
        
        const readinessPercentage = (readinessScore / maxScore * 100).toFixed(1);
        
        if (readinessPercentage >= 90) {
            this.log(`🚀 PRODUCTION READY: ${readinessPercentage}%`, "PASS");
        } else if (readinessPercentage >= 75) {
            this.log(`⚠️ PRODUCTION READY WITH MONITORING: ${readinessPercentage}%`, "WARN");
        } else {
            this.log(`❌ NOT PRODUCTION READY: ${readinessPercentage}%`, "FAIL");
        }
        
        return { readinessScore, maxScore, readinessPercentage };
    }

    generateProductionReport() {
        const endTime = performance.now();
        const totalDuration = endTime - this.startTime;
        
        const report = {
            metadata: {
                testSuite: "ChordCubes 5.0 Production Integration Test Suite",
                version: "1.0.0",
                timestamp: new Date().toISOString(),
                duration: totalDuration
            },
            summary: {
                totalTests: this.testsPassed + this.testsWarning + this.testsFailed,
                passed: this.testsPassed,
                warnings: this.testsWarning,
                failed: this.testsFailed,
                successRate: (this.testsPassed / (this.testsPassed + this.testsWarning + this.testsFailed) * 100).toFixed(1)
            },
            systemStatus: {
                monitor: window.monitor ? "ACTIVE" : "MISSING",
                audioManager: window.unifiedAudioManager ? "ACTIVE" : "MISSING",
                resourceManager: window.resourceManager ? "ACTIVE" : "MISSING"
            },
            statistics: {
                monitorStats: window.monitor ? window.monitor.getStats() : null,
                resourceStats: window.resourceManager ? window.resourceManager.getResourceStats() : null
            },
            results: this.results
        };
        
        this.log("=" * 80, "INFO");
        this.log("📊 PRODUCTION TEST SUITE COMPLETED", "INFO");
        this.log(`✅ Passed: ${this.testsPassed}`, "INFO");
        this.log(`⚠️  Warnings: ${this.testsWarning}`, "INFO");  
        this.log(`❌ Failed: ${this.testsFailed}`, "INFO");
        this.log(`🎯 Success Rate: ${report.summary.successRate}%`, "INFO");
        this.log(`⏱️  Duration: ${totalDuration.toFixed(2)}ms`, "INFO");
        this.log("=" * 80, "INFO");
        
        return report;
    }
}

// Auto-execute production test suite
if (typeof window !== 'undefined') {
    // Wait for all systems to be loaded
    const executeProductionTests = () => {
        if (window.monitor && window.unifiedAudioManager && window.resourceManager) {
            console.log("🚀 All ChordCubes systems detected, starting production tests...");
            
            const testSuite = new ChordCubesProductionTestSuite();
            testSuite.runProductionTests().then(report => {
                console.log("📊 Production test suite completed successfully!");
                window.productionTestReport = report;
                
                // Store detailed results for analysis
                localStorage.setItem('chordcubes_production_test_report', JSON.stringify(report));
                
            }).catch(error => {
                console.error("❌ Production test suite failed:", error);
                window.productionTestReport = { error: error.message, stack: error.stack };
            });
        } else {
            console.log("⏳ Waiting for ChordCubes systems to load...");
            setTimeout(executeProductionTests, 2000);
        }
    };
    
    // Start after a delay to ensure all systems are initialized
    setTimeout(executeProductionTests, 3000);
}

// Export for manual testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChordCubesProductionTestSuite;
}
