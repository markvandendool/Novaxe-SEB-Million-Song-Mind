/**
 * ChordCubes 5.0 - Automatic Rollback System
 * Military-Grade Intelligent Failure Detection and Recovery
 * 
 * Provides:
 * - Real-time failure detection with multiple trigger mechanisms
 * - Intelligent rollback decision making
 * - Circuit breaker patterns for system protection
 * - Automatic recovery and health restoration
 * - Manual override capabilities for ops teams
 * - Comprehensive incident logging and postmortem data
 */

/**
 * Automatic Rollback Configuration
 */
const ROLLBACK_CONFIG = {
    // Failure detection thresholds
    thresholds: {
        // Critical failures - immediate rollback
        critical: {
            errorRate: 0.05,           // 5% error rate
            fpsCollapse: 15,           // FPS below 15
            memoryLeak: 1500,          // Memory above 1.5GB
            responseTime: 2000,        // Response time above 2s
            crashRate: 0.02,           // 2% crash rate
            userComplaintRate: 0.1     // 10% user complaints
        },

        // Warning levels - prepare for rollback
        warning: {
            errorRate: 0.03,           // 3% error rate
            fpsDrops: 25,              // FPS below 25
            memoryGrowth: 1000,        // Memory above 1GB
            responseTime: 1000,        // Response time above 1s
            crashRate: 0.01,           // 1% crash rate
            userComplaintRate: 0.05    // 5% user complaints
        }
    },

    // Detection windows and sensitivity
    detection: {
        errorRateWindow: 300000,       // 5 minute window
        performanceWindow: 180000,     // 3 minute window
        memoryWindow: 600000,          // 10 minute window
        consecutiveFailures: 3,        // 3 consecutive failures trigger rollback
        recoveryWindow: 900000,        // 15 minute recovery observation
        healthCheckInterval: 30000     // Health check every 30 seconds
    },

    // Circuit breaker settings
    circuitBreaker: {
        failureThreshold: 5,           // Open circuit after 5 failures
        recoveryTimeout: 300000,       // 5 minute recovery timeout
        halfOpenMaxCalls: 3,           // Max calls in half-open state
        successThreshold: 2,           // Successes needed to close circuit
        monitoringWindow: 60000        // 1 minute monitoring window
    },

    // Rollback strategies
    strategies: {
        immediate: {
            name: 'Immediate Rollback',
            description: 'Instant rollback for critical failures',
            rollbackTime: 0,
            features: ['disable_all_features', 'notify_ops', 'save_metrics']
        },

        graceful: {
            name: 'Graceful Rollback',
            description: 'Gradual rollback with user notification',
            rollbackTime: 30000, // 30 seconds
            features: ['notify_users', 'gradual_disable', 'save_state']
        },

        targeted: {
            name: 'Targeted Feature Rollback',
            description: 'Roll back specific problematic features only',
            rollbackTime: 60000, // 1 minute
            features: ['isolate_feature', 'partial_rollback', 'monitor_impact']
        }
    }
};

/**
 * Automatic Rollback System
 */
class AutomaticRollbackSystem {
    constructor() {
        this.isActive = true;
        this.rollbackHistory = [];
        this.circuitBreakers = new Map();
        this.healthChecks = new Map();
        this.metrics = new Map();
        this.alertingCallbacks = [];
        this.recoveryAttempts = 0;

        this.initializeRollbackSystem();
        this.startMonitoring();
        this.setupCircuitBreakers();
    }

    /**
     * Initialize the automatic rollback system
     */
    initializeRollbackSystem() {
        console.log('[ROLLBACK] Initializing Automatic Rollback System');

        // Initialize metrics storage
        this.metrics.set('failures', []);
        this.metrics.set('rollbacks', []);
        this.metrics.set('recoveries', []);
        this.metrics.set('health_history', []);

        // Setup event listeners
        this.setupEventListeners();

        // Initialize health checks
        this.initializeHealthChecks();

        // Expose global interface
        window.automaticRollbackSystem = this;
        window.forceRollback = (reason, strategy) => this.forceRollback(reason, strategy);
        window.getRollbackStatus = () => this.getStatus();

        this.logInitialization();
    }

    /**
     * Setup event listeners for system events
     */
    setupEventListeners() {
        // Listen for critical errors
        window.addEventListener('error', (event) => {
            this.handleJavaScriptError(event);
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.handleUnhandledPromiseRejection(event);
        });

        // Listen for performance events
        window.addEventListener('performanceDegradation', (event) => {
            this.handlePerformanceDegradation(event.detail);
        });

        // Listen for memory warnings
        window.addEventListener('memoryWarning', (event) => {
            this.handleMemoryWarning(event.detail);
        });

        // Listen for user complaints (custom events)
        window.addEventListener('userComplaint', (event) => {
            this.handleUserComplaint(event.detail);
        });

        // Listen for system crashes
        window.addEventListener('beforeunload', () => {
            this.handlePotentialCrash();
        });
    }

    /**
     * Initialize health check functions
     */
    initializeHealthChecks() {
        this.healthChecks.set('performance', () => this.checkPerformanceHealth());
        this.healthChecks.set('memory', () => this.checkMemoryHealth());
        this.healthChecks.set('errors', () => this.checkErrorHealth());
        this.healthChecks.set('features', () => this.checkFeatureHealth());
        this.healthChecks.set('audio', () => this.checkAudioHealth());
        this.healthChecks.set('rendering', () => this.checkRenderingHealth());
    }

    /**
     * Setup circuit breakers for different system components
     */
    setupCircuitBreakers() {
        const components = [
            'performance_optimization',
            'spatial_hashing',
            'collision_detection',
            'audio_system',
            'rendering_system'
        ];

        for (const component of components) {
            this.circuitBreakers.set(component, {
                state: 'closed', // closed, open, half-open
                failures: 0,
                lastFailure: 0,
                lastSuccess: 0,
                callCount: 0,
                successCount: 0
            });
        }

        console.log('[ROLLBACK] Circuit breakers initialized for:', components);
    }

    /**
     * Start continuous monitoring
     */
    startMonitoring() {
        // Health check interval
        this.healthCheckInterval = setInterval(() => {
            this.performHealthCheck();
        }, ROLLBACK_CONFIG.detection.healthCheckInterval);

        // Failure detection interval
        this.failureDetectionInterval = setInterval(() => {
            this.detectFailures();
        }, 10000); // Every 10 seconds

        // Circuit breaker maintenance
        this.circuitBreakerInterval = setInterval(() => {
            this.maintainCircuitBreakers();
        }, 60000); // Every minute

        console.log('[ROLLBACK] Monitoring started');
    }

    /**
     * Perform comprehensive system health check
     */
    performHealthCheck() {
        const timestamp = Date.now();
        const healthStatus = {};

        // Run all health checks
        for (const [checkName, checkFunction] of this.healthChecks.entries()) {
            try {
                healthStatus[checkName] = checkFunction();
            } catch (error) {
                console.error(`[ROLLBACK] Health check failed: ${checkName}`, error);
                healthStatus[checkName] = { healthy: false, error: error.message };
            }
        }

        // Calculate overall health score
        const healthyChecks = Object.values(healthStatus).filter(check => check.healthy).length;
        const totalChecks = Object.keys(healthStatus).length;
        const overallHealth = healthyChecks / totalChecks;

        const healthReport = {
            timestamp,
            overallHealth,
            checks: healthStatus,
            systemLoad: this.calculateSystemLoad()
        };

        // Store health history
        const healthHistory = this.metrics.get('health_history');
        healthHistory.push(healthReport);

        // Keep last 1000 health checks
        if (healthHistory.length > 1000) {
            healthHistory.shift();
        }

        // Trigger failure detection if health is poor
        if (overallHealth < 0.6) { // Less than 60% healthy
            this.handleSystemHealthDegradation(healthReport);
        }

        return healthReport;
    }

    /**
     * Check performance health
     */
    checkPerformanceHealth() {
        const perfMonitor = window.performanceMonitor;
        if (!perfMonitor) return { healthy: false, reason: 'Performance monitor not available' };

        const report = perfMonitor.getReport();
        const currentFPS = report.currentFPS || 0;
        const avgFPS = report.averageFPS || 0;

        const healthy = currentFPS > ROLLBACK_CONFIG.thresholds.warning.fpsDrops &&
            avgFPS > ROLLBACK_CONFIG.thresholds.warning.fpsDrops;

        return {
            healthy,
            currentFPS,
            avgFPS,
            reason: healthy ? 'Performance within acceptable range' : 'Performance below threshold'
        };
    }

    /**
     * Check memory health
     */
    checkMemoryHealth() {
        const resourceManager = window.resourceManager;
        if (!resourceManager) return { healthy: false, reason: 'Resource manager not available' };

        const stats = resourceManager.getResourceStats();
        const memoryUsage = stats.memoryUsageMB || 0;

        const healthy = memoryUsage < ROLLBACK_CONFIG.thresholds.warning.memoryGrowth;

        return {
            healthy,
            memoryUsage,
            reason: healthy ? 'Memory usage within limits' : 'Memory usage too high'
        };
    }

    /**
     * Check error health
     */
    checkErrorHealth() {
        const monitor = window.monitor;
        if (!monitor) return { healthy: false, reason: 'Monitor not available' };

        const stats = monitor.getStats();
        const errorCount = stats.errorCount || 0;
        const totalEvents = stats.totalEvents || 1;
        const errorRate = errorCount / totalEvents;

        const healthy = errorRate < ROLLBACK_CONFIG.thresholds.warning.errorRate;

        return {
            healthy,
            errorRate,
            errorCount,
            reason: healthy ? 'Error rate acceptable' : 'Error rate too high'
        };
    }

    /**
     * Check feature health
     */
    checkFeatureHealth() {
        const featureFlags = window.featureFlags;
        if (!featureFlags) return { healthy: false, reason: 'Feature flags not available' };

        // Count enabled features and check for any that might be problematic
        const enabledFeatures = Object.entries(featureFlags).filter(([_, enabled]) => enabled);
        const totalFeatures = Object.keys(featureFlags).length;

        // If too many features are disabled, it might indicate problems
        const healthy = enabledFeatures.length / totalFeatures > 0.5;

        return {
            healthy,
            enabledFeatures: enabledFeatures.length,
            totalFeatures,
            reason: healthy ? 'Feature system stable' : 'Many features disabled'
        };
    }

    /**
     * Check audio health
     */
    checkAudioHealth() {
        const audioManager = window.unifiedAudioManager;
        if (!audioManager) return { healthy: false, reason: 'Audio manager not available' };

        // Check if audio context is running and stable
        const contextCount = audioManager.getContextCount ? audioManager.getContextCount() : 1;
        const healthy = contextCount === 1; // Should have exactly one context

        return {
            healthy,
            contextCount,
            reason: healthy ? 'Audio system stable' : 'Audio context issues detected'
        };
    }

    /**
     * Check rendering health
     */
    checkRenderingHealth() {
        // Check if Three.js renderer is working
        const scene = window.scene;
        const renderer = window.renderer;

        if (!scene || !renderer) {
            return { healthy: false, reason: 'Rendering components not available' };
        }

        // Check if rendering is happening
        const renderInfo = renderer.info;
        const triangles = renderInfo?.render?.triangles || 0;
        const calls = renderInfo?.render?.calls || 0;

        const healthy = triangles > 0 && calls > 0;

        return {
            healthy,
            triangles,
            calls,
            reason: healthy ? 'Rendering system active' : 'Rendering system inactive'
        };
    }

    /**
     * Calculate system load based on various metrics
     */
    calculateSystemLoad() {
        const perfMonitor = window.performanceMonitor;
        const resourceManager = window.resourceManager;

        let load = 0.5; // Default moderate load

        if (perfMonitor) {
            const report = perfMonitor.getReport();
            // Higher load if FPS is low
            if (report.currentFPS < 30) load += 0.3;
            else if (report.currentFPS < 50) load += 0.1;
        }

        if (resourceManager) {
            const stats = resourceManager.getResourceStats();
            // Higher load if memory usage is high
            if (stats.memoryUsageMB > 800) load += 0.2;
            else if (stats.memoryUsageMB > 500) load += 0.1;
        }

        return Math.min(load, 1.0);
    }

    /**
     * Detect various types of failures
     */
    detectFailures() {
        this.detectPerformanceFailures();
        this.detectMemoryFailures();
        this.detectErrorRateFailures();
        this.detectRenderingFailures();
    }

    /**
     * Detect performance failures
     */
    detectPerformanceFailures() {
        const perfMonitor = window.performanceMonitor;
        if (!perfMonitor) return;

        const report = perfMonitor.getReport();
        const currentFPS = report.currentFPS || 0;

        if (currentFPS < ROLLBACK_CONFIG.thresholds.critical.fpsCollapse) {
            this.recordFailure('performance_critical', {
                type: 'fps_collapse',
                value: currentFPS,
                threshold: ROLLBACK_CONFIG.thresholds.critical.fpsCollapse,
                severity: 'critical'
            });
        } else if (currentFPS < ROLLBACK_CONFIG.thresholds.warning.fpsDrops) {
            this.recordFailure('performance_warning', {
                type: 'fps_drop',
                value: currentFPS,
                threshold: ROLLBACK_CONFIG.thresholds.warning.fpsDrops,
                severity: 'warning'
            });
        }
    }

    /**
     * Detect memory failures
     */
    detectMemoryFailures() {
        const resourceManager = window.resourceManager;
        if (!resourceManager) return;

        const stats = resourceManager.getResourceStats();
        const memoryUsage = stats.memoryUsageMB || 0;

        if (memoryUsage > ROLLBACK_CONFIG.thresholds.critical.memoryLeak) {
            this.recordFailure('memory_critical', {
                type: 'memory_leak',
                value: memoryUsage,
                threshold: ROLLBACK_CONFIG.thresholds.critical.memoryLeak,
                severity: 'critical'
            });
        } else if (memoryUsage > ROLLBACK_CONFIG.thresholds.warning.memoryGrowth) {
            this.recordFailure('memory_warning', {
                type: 'memory_growth',
                value: memoryUsage,
                threshold: ROLLBACK_CONFIG.thresholds.warning.memoryGrowth,
                severity: 'warning'
            });
        }
    }

    /**
     * Detect error rate failures
     */
    detectErrorRateFailures() {
        const monitor = window.monitor;
        if (!monitor) return;

        const stats = monitor.getStats();
        const errorRate = stats.errorCount / (stats.totalEvents || 1);

        if (errorRate > ROLLBACK_CONFIG.thresholds.critical.errorRate) {
            this.recordFailure('error_rate_critical', {
                type: 'high_error_rate',
                value: errorRate,
                threshold: ROLLBACK_CONFIG.thresholds.critical.errorRate,
                severity: 'critical'
            });
        }
    }

    /**
     * Detect rendering failures
     */
    detectRenderingFailures() {
        const renderer = window.renderer;
        if (!renderer) return;

        const renderInfo = renderer.info?.render;
        if (renderInfo && renderInfo.calls === 0) {
            this.recordFailure('rendering_failure', {
                type: 'no_render_calls',
                value: 0,
                threshold: 1,
                severity: 'critical'
            });
        }
    }

    /**
     * Record a failure for rollback consideration
     */
    recordFailure(failureType, details) {
        const failure = {
            timestamp: Date.now(),
            type: failureType,
            details,
            resolved: false
        };

        const failures = this.metrics.get('failures');
        failures.push(failure);

        // Keep last 1000 failures
        if (failures.length > 1000) {
            failures.shift();
        }

        console.warn(`[ROLLBACK] Failure recorded: ${failureType}`, details);

        // Check if this failure should trigger rollback
        this.evaluateRollbackTriggers(failure);

        // Update circuit breaker for related component
        this.updateCircuitBreaker(failureType, false);
    }

    /**
     * Evaluate if failures should trigger rollback
     */
    evaluateRollbackTriggers(latestFailure) {
        const recentFailures = this.getRecentFailures(300000); // Last 5 minutes
        const criticalFailures = recentFailures.filter(f => f.details.severity === 'critical');

        // Immediate rollback for critical failures
        if (latestFailure.details.severity === 'critical') {
            this.initiateRollback('CRITICAL_FAILURE', 'immediate', latestFailure);
            return;
        }

        // Rollback for consecutive failures
        const consecutiveFailures = this.getConsecutiveFailures();
        if (consecutiveFailures >= ROLLBACK_CONFIG.detection.consecutiveFailures) {
            this.initiateRollback('CONSECUTIVE_FAILURES', 'graceful', {
                count: consecutiveFailures,
                failures: recentFailures.slice(-consecutiveFailures)
            });
            return;
        }

        // Rollback for failure rate
        const failureRate = recentFailures.length / 300; // Failures per second over 5 minutes
        if (failureRate > 0.1) { // More than 0.1 failures per second
            this.initiateRollback('HIGH_FAILURE_RATE', 'targeted', {
                rate: failureRate,
                recentFailures: recentFailures.length
            });
        }
    }

    /**
     * Get recent failures within a time window
     */
    getRecentFailures(windowMs) {
        const now = Date.now();
        const failures = this.metrics.get('failures');

        return failures.filter(failure =>
            now - failure.timestamp <= windowMs && !failure.resolved
        );
    }

    /**
     * Get count of consecutive unresolved failures
     */
    getConsecutiveFailures() {
        const failures = this.metrics.get('failures');
        let consecutive = 0;

        // Count from the end until we find a resolved failure or success
        for (let i = failures.length - 1; i >= 0; i--) {
            if (failures[i].resolved) {
                break;
            }
            consecutive++;
        }

        return consecutive;
    }

    /**
     * Initiate rollback with specified strategy
     */
    initiateRollback(reason, strategy, details) {
        if (!this.isActive) {
            console.log('[ROLLBACK] Rollback system disabled, ignoring trigger');
            return;
        }

        console.error(`[ROLLBACK] 🚨 INITIATING ROLLBACK: ${reason} using ${strategy} strategy`);

        const rollbackEvent = {
            timestamp: Date.now(),
            reason,
            strategy,
            details,
            rollbackId: this.generateRollbackId(),
            status: 'in_progress'
        };

        this.rollbackHistory.push(rollbackEvent);

        try {
            // Execute rollback strategy
            this.executeRollbackStrategy(strategy, rollbackEvent);

            // Mark as completed
            rollbackEvent.status = 'completed';
            rollbackEvent.completedAt = Date.now();

            console.log(`[ROLLBACK] ✅ Rollback completed: ${rollbackEvent.rollbackId}`);

        } catch (error) {
            console.error(`[ROLLBACK] ❌ Rollback failed: ${error.message}`);

            rollbackEvent.status = 'failed';
            rollbackEvent.error = error.message;
            rollbackEvent.failedAt = Date.now();
        }

        // Notify monitoring systems
        this.notifyRollback(rollbackEvent);

        return rollbackEvent.rollbackId;
    }

    /**
     * Execute specific rollback strategy
     */
    executeRollbackStrategy(strategy, rollbackEvent) {
        const config = ROLLBACK_CONFIG.strategies[strategy];
        if (!config) {
            throw new Error(`Unknown rollback strategy: ${strategy}`);
        }

        console.log(`[ROLLBACK] Executing ${config.name}: ${config.description}`);

        switch (strategy) {
            case 'immediate':
                this.executeImmediateRollback(rollbackEvent);
                break;
            case 'graceful':
                this.executeGracefulRollback(rollbackEvent);
                break;
            case 'targeted':
                this.executeTargetedRollback(rollbackEvent);
                break;
            default:
                throw new Error(`Rollback strategy not implemented: ${strategy}`);
        }
    }

    /**
     * Execute immediate rollback
     */
    executeImmediateRollback(rollbackEvent) {
        console.log('[ROLLBACK] Executing immediate rollback - disabling all features');

        // Disable all performance features immediately
        if (window.featureFlagManager) {
            window.featureFlagManager.setFeatureFlag('enablePerformanceOptimization', false);
            window.featureFlagManager.setFeatureFlag('enableSpatialHashing', false);
            window.featureFlagManager.setFeatureFlag('enableCollisionOptimization', false);
            window.featureFlagManager.setFeatureFlag('enableAdaptiveQuality', false);
        }

        // Open all circuit breakers
        for (const [component, breaker] of this.circuitBreakers.entries()) {
            breaker.state = 'open';
            breaker.lastFailure = Date.now();
        }

        // Save current metrics for postmortem
        rollbackEvent.preRollbackMetrics = this.captureSystemState();

        // Force garbage collection if available
        if (window.gc) {
            try {
                window.gc();
            } catch (e) {
                console.warn('[ROLLBACK] Could not force garbage collection:', e.message);
            }
        }
    }

    /**
     * Execute graceful rollback
     */
    executeGracefulRollback(rollbackEvent) {
        console.log('[ROLLBACK] Executing graceful rollback - gradual feature disable');

        // Notify users of temporary performance mode
        this.notifyUsersOfRollback();

        // Gradually disable features over 30 seconds
        setTimeout(() => {
            if (window.featureFlagManager) {
                window.featureFlagManager.setFeatureFlag('enableCollisionOptimization', false);
            }
        }, 10000);

        setTimeout(() => {
            if (window.featureFlagManager) {
                window.featureFlagManager.setFeatureFlag('enableSpatialHashing', false);
            }
        }, 20000);

        setTimeout(() => {
            if (window.featureFlagManager) {
                window.featureFlagManager.setFeatureFlag('enablePerformanceOptimization', false);
            }
        }, 30000);

        // Save system state
        rollbackEvent.preRollbackMetrics = this.captureSystemState();
    }

    /**
     * Execute targeted rollback
     */
    executeTargetedRollback(rollbackEvent) {
        console.log('[ROLLBACK] Executing targeted rollback - isolating problem features');

        // Analyze which features are causing issues
        const problematicFeatures = this.identifyProblematicFeatures(rollbackEvent.details);

        // Disable only the problematic features
        for (const feature of problematicFeatures) {
            console.log(`[ROLLBACK] Disabling problematic feature: ${feature}`);

            if (window.featureFlagManager) {
                window.featureFlagManager.setFeatureFlag(feature, false);
            }
        }

        rollbackEvent.disabledFeatures = problematicFeatures;
        rollbackEvent.preRollbackMetrics = this.captureSystemState();
    }

    /**
     * Identify problematic features based on failure patterns
     */
    identifyProblematicFeatures(details) {
        const problematicFeatures = [];

        if (details.recentFailures) {
            for (const failure of details.recentFailures) {
                if (failure.type.includes('performance')) {
                    problematicFeatures.push('enablePerformanceOptimization');
                    problematicFeatures.push('enableSpatialHashing');
                }
                if (failure.type.includes('memory')) {
                    problematicFeatures.push('enableCollisionOptimization');
                }
                if (failure.type.includes('rendering')) {
                    problematicFeatures.push('enableAdaptiveQuality');
                }
            }
        }

        // Remove duplicates
        return [...new Set(problematicFeatures)];
    }

    /**
     * Capture current system state for analysis
     */
    captureSystemState() {
        return {
            timestamp: Date.now(),
            performance: window.performanceMonitor?.getReport(),
            resources: window.resourceManager?.getResourceStats(),
            errors: window.monitor?.getStats(),
            featureFlags: { ...window.featureFlags },
            memoryUsage: performance.memory ? {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            } : null
        };
    }

    /**
     * Notify users of rollback (graceful strategy)
     */
    notifyUsersOfRollback() {
        // Create temporary notification
        const notification = document.createElement('div');
        notification.id = 'rollback-notification';
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: #ff6b6b;
                color: white;
                padding: 15px;
                border-radius: 8px;
                z-index: 10000;
                font-family: monospace;
                font-size: 14px;
                max-width: 300px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            ">
                <strong>🔄 System Recovery</strong><br>
                Temporarily switching to stable mode for optimal performance.
            </div>
        `;

        document.body.appendChild(notification);

        // Remove notification after 10 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 10000);
    }

    /**
     * Update circuit breaker state
     */
    updateCircuitBreaker(component, success) {
        const breaker = this.circuitBreakers.get(component);
        if (!breaker) return;

        const now = Date.now();

        if (success) {
            breaker.lastSuccess = now;
            breaker.successCount++;

            if (breaker.state === 'half-open') {
                if (breaker.successCount >= ROLLBACK_CONFIG.circuitBreaker.successThreshold) {
                    breaker.state = 'closed';
                    breaker.failures = 0;
                    console.log(`[ROLLBACK] Circuit breaker closed for ${component}`);
                }
            }
        } else {
            breaker.lastFailure = now;
            breaker.failures++;

            if (breaker.failures >= ROLLBACK_CONFIG.circuitBreaker.failureThreshold) {
                breaker.state = 'open';
                console.log(`[ROLLBACK] Circuit breaker opened for ${component}`);
            }
        }
    }

    /**
     * Maintain circuit breakers (transition from open to half-open)
     */
    maintainCircuitBreakers() {
        const now = Date.now();

        for (const [component, breaker] of this.circuitBreakers.entries()) {
            if (breaker.state === 'open') {
                if (now - breaker.lastFailure >= ROLLBACK_CONFIG.circuitBreaker.recoveryTimeout) {
                    breaker.state = 'half-open';
                    breaker.callCount = 0;
                    breaker.successCount = 0;
                    console.log(`[ROLLBACK] Circuit breaker half-open for ${component}`);
                }
            }
        }
    }

    /**
     * Generate unique rollback ID
     */
    generateRollbackId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        return `rollback-${timestamp}-${random}`;
    }

    /**
     * Handle various system events
     */
    handleJavaScriptError(event) {
        this.recordFailure('javascript_error', {
            type: 'js_error',
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            severity: 'warning'
        });
    }

    handleUnhandledPromiseRejection(event) {
        this.recordFailure('unhandled_promise_rejection', {
            type: 'promise_rejection',
            reason: event.reason,
            severity: 'warning'
        });
    }

    handlePerformanceDegradation(details) {
        this.recordFailure('performance_degradation', {
            type: 'performance',
            ...details,
            severity: details.severity || 'warning'
        });
    }

    handleMemoryWarning(details) {
        this.recordFailure('memory_warning', {
            type: 'memory',
            ...details,
            severity: 'warning'
        });
    }

    handleUserComplaint(details) {
        this.recordFailure('user_complaint', {
            type: 'user_feedback',
            ...details,
            severity: 'info'
        });
    }

    handleSystemHealthDegradation(healthReport) {
        if (healthReport.overallHealth < 0.4) { // Less than 40% healthy
            this.recordFailure('system_health_degradation', {
                type: 'health_check',
                overallHealth: healthReport.overallHealth,
                severity: 'critical'
            });
        } else if (healthReport.overallHealth < 0.6) { // Less than 60% healthy
            this.recordFailure('system_health_warning', {
                type: 'health_check',
                overallHealth: healthReport.overallHealth,
                severity: 'warning'
            });
        }
    }

    handlePotentialCrash() {
        // Record potential crash (page unload might be crash)
        this.recordFailure('potential_crash', {
            type: 'crash',
            severity: 'critical',
            timestamp: Date.now()
        });
    }

    /**
     * Notify monitoring systems of rollback
     */
    notifyRollback(rollbackEvent) {
        // Notify production monitoring dashboard
        if (window.ProductionMonitoring) {
            window.ProductionMonitoring.addAlert(
                'critical',
                'Automatic Rollback Executed',
                `${rollbackEvent.reason} - Strategy: ${rollbackEvent.strategy}`
            );
        }

        // Notify canary deployment system
        if (window.canaryDeploymentManager) {
            window.canaryDeploymentManager.forceRollback(rollbackEvent.reason);
        }

        // Log to monitor
        if (window.monitor) {
            window.monitor.logEvent('automatic_rollback', rollbackEvent);
        }

        // Execute alerting callbacks
        for (const callback of this.alertingCallbacks) {
            try {
                callback(rollbackEvent);
            } catch (error) {
                console.error('[ROLLBACK] Alerting callback failed:', error);
            }
        }
    }

    /**
     * Force rollback (manual override)
     */
    forceRollback(reason = 'Manual rollback', strategy = 'immediate') {
        return this.initiateRollback('MANUAL_OVERRIDE', strategy, { reason });
    }

    /**
     * Add alerting callback
     */
    addAlertingCallback(callback) {
        this.alertingCallbacks.push(callback);
    }

    /**
     * Get system status
     */
    getStatus() {
        const recentFailures = this.getRecentFailures(3600000); // Last hour
        const recentRollbacks = this.rollbackHistory.filter(
            r => Date.now() - r.timestamp <= 3600000
        );

        return {
            isActive: this.isActive,
            recentFailures: recentFailures.length,
            recentRollbacks: recentRollbacks.length,
            circuitBreakers: Object.fromEntries(this.circuitBreakers),
            rollbackHistory: this.rollbackHistory.slice(-10), // Last 10 rollbacks
            consecutiveFailures: this.getConsecutiveFailures(),
            systemHealth: this.performHealthCheck(),
            recoveryAttempts: this.recoveryAttempts
        };
    }

    /**
     * Log initialization
     */
    logInitialization() {
        console.log('[ROLLBACK] ========================================');
        console.log('[ROLLBACK] 🛡️ Automatic Rollback System Active');
        console.log('[ROLLBACK] Monitoring for failure conditions');
        console.log('[ROLLBACK] Circuit breakers initialized');
        console.log('[ROLLBACK] Health checks configured');
        console.log('[ROLLBACK] ========================================');
    }

    /**
     * Cleanup resources
     */
    destroy() {
        if (this.healthCheckInterval) clearInterval(this.healthCheckInterval);
        if (this.failureDetectionInterval) clearInterval(this.failureDetectionInterval);
        if (this.circuitBreakerInterval) clearInterval(this.circuitBreakerInterval);

        this.isActive = false;
        console.log('[ROLLBACK] Automatic rollback system destroyed');
    }
}

// Global rollback utilities
const AutomaticRollback = {
    system: null,

    initialize() {
        if (!this.system) {
            this.system = new AutomaticRollbackSystem();

            // Global utilities
            window.triggerRollback = (reason, strategy) => this.system.forceRollback(reason, strategy);
            window.getRollbackHistory = () => this.system.rollbackHistory;
            window.getSystemHealth = () => this.system.performHealthCheck();

            console.log('🛡️ Automatic Rollback System ready!');
        }
        return this.system;
    },

    isActive() {
        return this.system?.isActive || false;
    }
};

// Auto-initialize when other systems are ready
if (typeof window !== 'undefined') {
    const initializeRollbackSystem = () => {
        // Wait for prerequisite systems
        if (window.monitor && window.performanceMonitor) {
            AutomaticRollback.initialize();
        } else {
            setTimeout(initializeRollbackSystem, 2000);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeRollbackSystem);
    } else {
        setTimeout(initializeRollbackSystem, 3000);
    }
}

export { AutomaticRollbackSystem, AutomaticRollback };
