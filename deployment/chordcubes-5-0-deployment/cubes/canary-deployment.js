/**
 * ChordCubes 5.0 - Canary Deployment Strategy
 * Military-Grade Gradual Rollout and A/B Testing System
 * 
 * Provides:
 * - Percentage-based traffic routing for gradual feature rollout
 * - A/B testing capabilities with statistical significance
 * - Automatic promotion/rollback based on performance metrics
 * - Blue-green deployment support
 * - Risk mitigation through controlled exposure
 * - Real-time monitoring and decision making
 */

/**
 * Canary Deployment Configuration
 */
const CANARY_CONFIG = {
    // Deployment phases with automatic progression
    phases: {
        phase1: { percentage: 1, duration: '6h', criteria: 'error_rate < 0.1%' },
        phase2: { percentage: 5, duration: '12h', criteria: 'error_rate < 0.5% && fps > 50' },
        phase3: { percentage: 15, duration: '24h', criteria: 'error_rate < 1% && user_satisfaction > 0.8' },
        phase4: { percentage: 30, duration: '48h', criteria: 'error_rate < 1.5% && performance_regression < 5%' },
        phase5: { percentage: 60, duration: '72h', criteria: 'error_rate < 2% && stability_score > 0.9' },
        phase6: { percentage: 100, duration: 'permanent', criteria: 'full_rollout' }
    },

    // Success criteria for automatic progression
    successCriteria: {
        errorRate: { max: 0.02 }, // Max 2% error rate
        performanceRegression: { max: 0.1 }, // Max 10% performance loss
        userSatisfactionScore: { min: 0.75 }, // Min 75% user satisfaction
        stabilityScore: { min: 0.85 }, // Min 85% stability
        fpsThreshold: { min: 45 }, // Min 45 FPS average
        memoryThreshold: { max: 800 } // Max 800MB memory usage
    },

    // Rollback triggers
    rollbackTriggers: {
        criticalErrorRate: 0.05, // 5% error rate triggers immediate rollback
        severePerfRegression: 0.25, // 25% performance loss triggers rollback
        criticalFPS: 20, // FPS below 20 triggers rollback
        criticalMemory: 1200, // Memory above 1.2GB triggers rollback
        userComplaintThreshold: 10 // 10+ user complaints in 1 hour triggers review
    },

    // A/B test configurations
    abTests: {
        spatialHashingOptimization: {
            variants: ['control', 'enabled'],
            trafficSplit: [50, 50],
            successMetric: 'fps_improvement',
            minimumSampleSize: 1000,
            statisticalSignificance: 0.95
        },
        adaptiveQualitySystem: {
            variants: ['disabled', 'conservative', 'aggressive'],
            trafficSplit: [33, 34, 33],
            successMetric: 'user_experience_score',
            minimumSampleSize: 500,
            statisticalSignificance: 0.90
        }
    }
};

/**
 * Canary Deployment Manager
 */
class CanaryDeploymentManager {
    constructor() {
        this.currentPhase = this.loadCurrentPhase();
        this.deploymentStartTime = this.loadDeploymentStartTime();
        this.userGroup = this.determineUserGroup();
        this.metrics = new Map();
        this.abTestResults = new Map();
        this.rollbackHistory = [];
        
        this.initializeCanaryDeployment();
        this.startMonitoring();
    }

    /**
     * Initialize canary deployment system
     */
    initializeCanaryDeployment() {
        console.log('[CANARY] Initializing Canary Deployment System');
        console.log(`[CANARY] Current Phase: ${this.currentPhase}`);
        console.log(`[CANARY] User Group: ${this.userGroup}`);
        
        // Determine which features this user should get
        this.activeFeatures = this.determineActiveFeatures();
        
        // Configure feature flags based on canary assignment
        this.configureFeatureFlags();
        
        // Initialize A/B tests
        this.initializeABTests();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Expose global interface
        window.canaryDeploymentManager = this;
        window.getCanaryStatus = () => this.getStatus();
        
        this.logInitialization();
    }

    /**
     * Load current deployment phase
     */
    loadCurrentPhase() {
        // In production, this would come from deployment metadata or server
        const savedPhase = localStorage.getItem('chordcubes_canary_phase');
        return savedPhase || 'phase1';
    }

    /**
     * Load deployment start time
     */
    loadDeploymentStartTime() {
        const savedTime = localStorage.getItem('chordcubes_deployment_start');
        if (savedTime) {
            return new Date(savedTime);
        } else {
            const startTime = new Date();
            localStorage.setItem('chordcubes_deployment_start', startTime.toISOString());
            return startTime;
        }
    }

    /**
     * Determine user group assignment for canary deployment
     */
    determineUserGroup() {
        // Get consistent user ID from feature flag manager
        let userId = window.featureFlagManager?.userId;
        
        if (!userId) {
            // Create our own if not available
            userId = localStorage.getItem('chordcubes_user_id') || Math.random().toString(36);
            localStorage.setItem('chordcubes_user_id', userId);
        }

        // Convert user ID to number for percentage calculation
        let hash = 0;
        for (let i = 0; i < userId.length; i++) {
            const char = userId.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }

        const userPercentile = Math.abs(hash) % 100;
        const currentPhaseConfig = CANARY_CONFIG.phases[this.currentPhase];
        
        if (userPercentile < currentPhaseConfig.percentage) {
            return 'canary';
        } else {
            return 'control';
        }
    }

    /**
     * Determine which features should be active for this user
     */
    determineActiveFeatures() {
        const features = {
            performanceOptimization: false,
            spatialHashing: false,
            adaptiveQuality: false,
            collisionOptimization: false,
            experimentalFeatures: false
        };

        // If user is in canary group, enable features based on phase
        if (this.userGroup === 'canary') {
            switch (this.currentPhase) {
                case 'phase1':
                    features.performanceOptimization = true;
                    features.adaptiveQuality = true; // Safe feature
                    break;
                case 'phase2':
                    features.performanceOptimization = true;
                    features.adaptiveQuality = true;
                    features.spatialHashing = true; // Add spatial hashing
                    break;
                case 'phase3':
                    features.performanceOptimization = true;
                    features.adaptiveQuality = true;
                    features.spatialHashing = true;
                    features.collisionOptimization = true; // Add collision optimization
                    break;
                case 'phase4':
                case 'phase5':
                case 'phase6':
                    // Enable all features for later phases
                    Object.keys(features).forEach(key => features[key] = true);
                    break;
            }
        }

        return features;
    }

    /**
     * Configure feature flags based on canary assignment
     */
    configureFeatureFlags() {
        if (window.featureFlagManager) {
            for (const [feature, enabled] of Object.entries(this.activeFeatures)) {
                const flagName = `enable${feature.charAt(0).toUpperCase()}${feature.slice(1)}`;
                window.featureFlagManager.setFeatureFlag(flagName, enabled, false);
            }
        }

        console.log('[CANARY] Feature flags configured:', this.activeFeatures);
    }

    /**
     * Initialize A/B tests
     */
    initializeABTests() {
        for (const [testName, config] of Object.entries(CANARY_CONFIG.abTests)) {
            const variant = this.assignABTestVariant(testName, config);
            
            this.abTestResults.set(testName, {
                variant,
                config,
                startTime: Date.now(),
                metrics: []
            });

            console.log(`[CANARY] A/B Test ${testName}: assigned variant '${variant}'`);
        }
    }

    /**
     * Assign A/B test variant to user
     */
    assignABTestVariant(testName, config) {
        const userId = window.featureFlagManager?.userId || 'default';
        
        // Create hash specific to this test
        const testKey = testName + userId;
        let hash = 0;
        for (let i = 0; i < testKey.length; i++) {
            hash = ((hash << 5) - hash) + testKey.charCodeAt(i);
            hash = hash & hash;
        }

        const percentage = Math.abs(hash) % 100;
        let cumulativePercentage = 0;
        
        for (let i = 0; i < config.variants.length; i++) {
            cumulativePercentage += config.trafficSplit[i];
            if (percentage < cumulativePercentage) {
                return config.variants[i];
            }
        }
        
        return config.variants[0]; // Fallback
    }

    /**
     * Start monitoring for deployment progression and rollback
     */
    startMonitoring() {
        // Monitor every 30 seconds
        this.monitoringInterval = setInterval(() => {
            this.collectCanaryMetrics();
            this.evaluateProgressionCriteria();
            this.checkRollbackTriggers();
            this.updateABTestMetrics();
        }, 30000);

        // Evaluate less frequently (every 5 minutes)
        this.evaluationInterval = setInterval(() => {
            this.evaluatePhaseProgression();
        }, 300000);

        console.log('[CANARY] Monitoring started');
    }

    /**
     * Collect metrics for canary evaluation
     */
    collectCanaryMetrics() {
        const timestamp = Date.now();
        
        // Performance metrics
        const performanceMetrics = window.performanceMonitor?.getReport();
        
        // Error metrics
        const errorMetrics = window.monitor?.getStats();
        
        // Resource metrics
        const resourceMetrics = window.resourceManager?.getResourceStats();
        
        // User experience metrics (from feature flag manager)
        const userExperienceMetrics = this.calculateUserExperienceScore();

        const metrics = {
            timestamp,
            phase: this.currentPhase,
            userGroup: this.userGroup,
            performance: performanceMetrics,
            errors: errorMetrics,
            resources: resourceMetrics,
            userExperience: userExperienceMetrics,
            activeFeatures: this.activeFeatures
        };

        // Store metrics (keep last 1000 points)
        if (!this.metrics.has('canary_history')) {
            this.metrics.set('canary_history', []);
        }

        const history = this.metrics.get('canary_history');
        history.push(metrics);
        
        if (history.length > 1000) {
            history.shift();
        }

        this.metrics.set('current', metrics);
    }

    /**
     * Calculate user experience score based on various factors
     */
    calculateUserExperienceScore() {
        const performance = window.performanceMonitor?.getReport();
        if (!performance) return 0.5;

        let score = 0;
        
        // FPS contribution (40% weight)
        if (performance.currentFPS >= 55) score += 0.4;
        else if (performance.currentFPS >= 45) score += 0.3;
        else if (performance.currentFPS >= 30) score += 0.2;
        else score += 0.1;

        // Stability contribution (30% weight)
        const fpsStability = Math.abs(performance.maxFPS - performance.minFPS);
        if (fpsStability < 5) score += 0.3;
        else if (fpsStability < 15) score += 0.2;
        else if (fpsStability < 25) score += 0.1;

        // Responsiveness contribution (20% weight)
        if (performance.performance > 0.9) score += 0.2;
        else if (performance.performance > 0.7) score += 0.15;
        else if (performance.performance > 0.5) score += 0.1;

        // No errors contribution (10% weight)
        const errorCount = window.monitor?.getStats().errorCount || 0;
        if (errorCount === 0) score += 0.1;
        else if (errorCount < 3) score += 0.05;

        return Math.min(score, 1.0);
    }

    /**
     * Evaluate criteria for phase progression
     */
    evaluateProgressionCriteria() {
        const current = this.metrics.get('current');
        if (!current) return false;

        const phaseConfig = CANARY_CONFIG.phases[this.currentPhase];
        const criteria = CANARY_CONFIG.successCriteria;

        const checks = {
            errorRate: this.calculateErrorRate() <= criteria.errorRate.max,
            performance: !this.hasPerformanceRegression(criteria.performanceRegression.max),
            userSatisfaction: current.userExperience >= criteria.userSatisfactionScore.min,
            stability: this.calculateStabilityScore() >= criteria.stabilityScore.min,
            fps: current.performance?.averageFPS >= criteria.fpsThreshold.min,
            memory: current.resources?.memoryUsage <= criteria.memoryThreshold.max
        };

        console.log('[CANARY] Progression criteria check:', checks);
        
        // All criteria must pass
        return Object.values(checks).every(Boolean);
    }

    /**
     * Calculate current error rate
     */
    calculateErrorRate() {
        const history = this.metrics.get('canary_history') || [];
        if (history.length === 0) return 0;

        const recent = history.slice(-20); // Last 20 data points (10 minutes)
        const totalEvents = recent.reduce((sum, m) => sum + (m.errors?.totalEvents || 0), 0);
        const totalErrors = recent.reduce((sum, m) => sum + (m.errors?.errorCount || 0), 0);

        return totalEvents > 0 ? totalErrors / totalEvents : 0;
    }

    /**
     * Check if there's significant performance regression
     */
    hasPerformanceRegression(maxRegression) {
        const history = this.metrics.get('canary_history') || [];
        if (history.length < 10) return false;

        const baseline = history.slice(-50, -25); // Earlier period
        const current = history.slice(-25); // Recent period

        if (baseline.length === 0 || current.length === 0) return false;

        const baselineAvg = baseline.reduce((sum, m) => sum + (m.performance?.averageFPS || 0), 0) / baseline.length;
        const currentAvg = current.reduce((sum, m) => sum + (m.performance?.averageFPS || 0), 0) / current.length;

        const regression = (baselineAvg - currentAvg) / baselineAvg;
        return regression > maxRegression;
    }

    /**
     * Calculate stability score
     */
    calculateStabilityScore() {
        const history = this.metrics.get('canary_history') || [];
        if (history.length < 5) return 0.5;

        const recent = history.slice(-20);
        const fpsValues = recent.map(m => m.performance?.currentFPS || 0);
        const mean = fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length;
        const variance = fpsValues.reduce((sum, fps) => sum + Math.pow(fps - mean, 2), 0) / fpsValues.length;
        const stdDev = Math.sqrt(variance);

        // Lower standard deviation = higher stability
        // Normalize to 0-1 scale (assuming stdDev of 0-20 FPS)
        return Math.max(0, 1 - (stdDev / 20));
    }

    /**
     * Check for rollback triggers
     */
    checkRollbackTriggers() {
        const current = this.metrics.get('current');
        if (!current) return;

        const triggers = CANARY_CONFIG.rollbackTriggers;
        
        // Critical error rate
        if (this.calculateErrorRate() > triggers.criticalErrorRate) {
            this.initiateRollback('CRITICAL_ERROR_RATE', `Error rate: ${(this.calculateErrorRate() * 100).toFixed(2)}%`);
            return;
        }

        // Severe performance regression
        if (this.hasPerformanceRegression(triggers.severePerfRegression)) {
            this.initiateRollback('SEVERE_PERFORMANCE_REGRESSION', 'Performance dropped by more than 25%');
            return;
        }

        // Critical FPS
        if (current.performance?.currentFPS < triggers.criticalFPS) {
            this.initiateRollback('CRITICAL_FPS', `FPS: ${current.performance.currentFPS}`);
            return;
        }

        // Critical memory usage
        if (current.resources?.memoryUsage > triggers.criticalMemory) {
            this.initiateRollback('CRITICAL_MEMORY', `Memory: ${current.resources.memoryUsage}MB`);
            return;
        }
    }

    /**
     * Evaluate if ready for phase progression
     */
    evaluatePhaseProgression() {
        if (this.currentPhase === 'phase6') return; // Already at full rollout

        const phaseConfig = CANARY_CONFIG.phases[this.currentPhase];
        const timeSincePhaseStart = Date.now() - this.deploymentStartTime.getTime();
        const phaseDuration = this.parseDuration(phaseConfig.duration);

        // Check if minimum time has passed and criteria are met
        if (timeSincePhaseStart >= phaseDuration && this.evaluateProgressionCriteria()) {
            this.progressToNextPhase();
        }
    }

    /**
     * Parse duration string to milliseconds
     */
    parseDuration(duration) {
        if (duration === 'permanent') return Infinity;
        
        const match = duration.match(/(\d+)([hm])/);
        if (!match) return 0;
        
        const value = parseInt(match[1]);
        const unit = match[2];
        
        if (unit === 'h') return value * 60 * 60 * 1000;
        if (unit === 'm') return value * 60 * 1000;
        
        return 0;
    }

    /**
     * Progress to next deployment phase
     */
    progressToNextPhase() {
        const phases = Object.keys(CANARY_CONFIG.phases);
        const currentIndex = phases.indexOf(this.currentPhase);
        
        if (currentIndex < phases.length - 1) {
            const nextPhase = phases[currentIndex + 1];
            
            console.log(`[CANARY] Progressing from ${this.currentPhase} to ${nextPhase}`);
            
            this.currentPhase = nextPhase;
            localStorage.setItem('chordcubes_canary_phase', nextPhase);
            
            // Recalculate user group and features
            this.userGroup = this.determineUserGroup();
            this.activeFeatures = this.determineActiveFeatures();
            this.configureFeatureFlags();
            
            // Log progression
            if (window.monitor) {
                window.monitor.logEvent('canary_progression', {
                    from: phases[currentIndex],
                    to: nextPhase,
                    userGroup: this.userGroup,
                    timestamp: new Date().toISOString()
                });
            }
            
            console.log(`[CANARY] ✅ Progressed to ${nextPhase}. User group: ${this.userGroup}`);
        }
    }

    /**
     * Initiate rollback to previous stable version
     */
    initiateRollback(reason, details) {
        console.error(`[CANARY] 🚨 INITIATING ROLLBACK: ${reason} - ${details}`);
        
        const rollbackEvent = {
            timestamp: new Date().toISOString(),
            reason,
            details,
            phase: this.currentPhase,
            metrics: this.metrics.get('current')
        };
        
        this.rollbackHistory.push(rollbackEvent);
        
        // Disable all canary features immediately
        Object.keys(this.activeFeatures).forEach(feature => {
            this.activeFeatures[feature] = false;
        });
        
        this.configureFeatureFlags();
        
        // Notify monitoring system
        if (window.monitor) {
            window.monitor.logEvent('canary_rollback', rollbackEvent);
        }
        
        // Alert production monitoring
        if (window.ProductionMonitoring) {
            window.ProductionMonitoring.addAlert('critical', 'Canary Rollback', `${reason}: ${details}`);
        }
        
        console.error('[CANARY] 🚨 ROLLBACK COMPLETE - All canary features disabled');
        
        // In production, this might also trigger infrastructure rollback
        this.notifyOpsTeam(rollbackEvent);
    }

    /**
     * Notify operations team of rollback (placeholder)
     */
    notifyOpsTeam(rollbackEvent) {
        console.log('[CANARY] Notifying operations team of rollback:', rollbackEvent);
        
        // In production, this would send alerts via:
        // - Slack/Teams notifications
        // - Email alerts
        // - PagerDuty/OpsGenie
        // - SMS alerts for critical events
    }

    /**
     * Update A/B test metrics
     */
    updateABTestMetrics() {
        for (const [testName, testData] of this.abTestResults.entries()) {
            const current = this.metrics.get('current');
            if (!current) continue;

            // Record metric for this variant
            testData.metrics.push({
                timestamp: Date.now(),
                variant: testData.variant,
                value: this.getABTestMetricValue(testData.config.successMetric, current)
            });

            // Keep only last 1000 data points per test
            if (testData.metrics.length > 1000) {
                testData.metrics.shift();
            }
        }
    }

    /**
     * Get specific metric value for A/B testing
     */
    getABTestMetricValue(metricName, currentMetrics) {
        switch (metricName) {
            case 'fps_improvement':
                return currentMetrics.performance?.currentFPS || 0;
            case 'user_experience_score':
                return currentMetrics.userExperience || 0;
            case 'memory_efficiency':
                return 1000 - (currentMetrics.resources?.memoryUsage || 1000); // Inverse for efficiency
            case 'error_rate':
                return this.calculateErrorRate();
            default:
                return 0;
        }
    }

    /**
     * Get statistical significance of A/B test results
     */
    getABTestSignificance(testName) {
        const testData = this.abTestResults.get(testName);
        if (!testData || testData.metrics.length < testData.config.minimumSampleSize) {
            return { significant: false, reason: 'Insufficient sample size' };
        }

        // Simple statistical significance check (in production, would use proper t-test)
        const variantGroups = {};
        testData.metrics.forEach(metric => {
            if (!variantGroups[metric.variant]) {
                variantGroups[metric.variant] = [];
            }
            variantGroups[metric.variant].push(metric.value);
        });

        const variants = Object.keys(variantGroups);
        if (variants.length < 2) {
            return { significant: false, reason: 'Need at least 2 variants' };
        }

        // Calculate means and basic comparison
        const means = {};
        for (const variant of variants) {
            const values = variantGroups[variant];
            means[variant] = values.reduce((a, b) => a + b, 0) / values.length;
        }

        // Find best performing variant
        const bestVariant = variants.reduce((best, current) => 
            means[current] > means[best] ? current : best
        );

        // Simple significance check - improvement > 5% with enough samples
        const baseline = means[variants[0]];
        const improvement = (means[bestVariant] - baseline) / baseline;

        return {
            significant: Math.abs(improvement) > 0.05 && testData.metrics.length >= testData.config.minimumSampleSize,
            bestVariant,
            improvement: improvement * 100,
            means
        };
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for performance degradation
        window.addEventListener('performanceDegradation', (event) => {
            console.warn('[CANARY] Performance degradation detected:', event.detail);
            this.checkRollbackTriggers();
        });

        // Listen for critical errors
        window.addEventListener('criticalError', (event) => {
            console.error('[CANARY] Critical error detected:', event.detail);
            this.initiateRollback('CRITICAL_ERROR', event.detail.message);
        });
    }

    /**
     * Get canary deployment status
     */
    getStatus() {
        return {
            currentPhase: this.currentPhase,
            userGroup: this.userGroup,
            activeFeatures: this.activeFeatures,
            deploymentStartTime: this.deploymentStartTime.toISOString(),
            progressionCriteriaMet: this.evaluateProgressionCriteria(),
            errorRate: this.calculateErrorRate(),
            stabilityScore: this.calculateStabilityScore(),
            rollbackHistory: this.rollbackHistory,
            abTestResults: Object.fromEntries(
                Array.from(this.abTestResults.entries()).map(([name, data]) => [
                    name,
                    {
                        variant: data.variant,
                        significance: this.getABTestSignificance(name)
                    }
                ])
            )
        };
    }

    /**
     * Manual phase override (for testing/emergency)
     */
    overridePhase(targetPhase, reason = 'Manual override') {
        if (CANARY_CONFIG.phases[targetPhase]) {
            console.log(`[CANARY] Manual phase override to ${targetPhase}: ${reason}`);
            
            this.currentPhase = targetPhase;
            localStorage.setItem('chordcubes_canary_phase', targetPhase);
            
            this.userGroup = this.determineUserGroup();
            this.activeFeatures = this.determineActiveFeatures();
            this.configureFeatureFlags();
            
            if (window.monitor) {
                window.monitor.logEvent('canary_manual_override', {
                    targetPhase,
                    reason,
                    timestamp: new Date().toISOString()
                });
            }
        } else {
            console.error(`[CANARY] Invalid phase: ${targetPhase}`);
        }
    }

    /**
     * Force rollback (for emergency situations)
     */
    forceRollback(reason = 'Manual rollback') {
        this.initiateRollback('MANUAL_ROLLBACK', reason);
    }

    /**
     * Log initialization details
     */
    logInitialization() {
        console.log('[CANARY] ==========================================');
        console.log('[CANARY] 🚀 Canary Deployment System Initialized');
        console.log(`[CANARY] Phase: ${this.currentPhase}`);
        console.log(`[CANARY] User Group: ${this.userGroup}`);
        console.log(`[CANARY] Traffic Percentage: ${CANARY_CONFIG.phases[this.currentPhase].percentage}%`);
        console.log('[CANARY] Active Features:', this.activeFeatures);
        console.log('[CANARY] A/B Tests:', Array.from(this.abTestResults.keys()));
        console.log('[CANARY] ==========================================');
    }

    /**
     * Cleanup resources
     */
    destroy() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        
        if (this.evaluationInterval) {
            clearInterval(this.evaluationInterval);
        }
        
        console.log('[CANARY] Canary deployment manager destroyed');
    }
}

// Global canary deployment utilities
const CanaryDeployment = {
    manager: null,
    
    initialize() {
        if (!this.manager) {
            this.manager = new CanaryDeploymentManager();
            
            // Global utilities
            window.getCanaryPhase = () => this.manager.currentPhase;
            window.getCanaryUserGroup = () => this.manager.userGroup;
            window.forceCanaryRollback = (reason) => this.manager.forceRollback(reason);
            window.overrideCanaryPhase = (phase, reason) => this.manager.overridePhase(phase, reason);
            
            console.log('🎯 Canary Deployment System ready!');
        }
        return this.manager;
    },
    
    getPhase() {
        return this.manager?.currentPhase || 'unknown';
    },
    
    getUserGroup() {
        return this.manager?.userGroup || 'unknown';
    },
    
    isCanaryUser() {
        return this.getUserGroup() === 'canary';
    }
};

// Auto-initialize when feature flags are ready
if (typeof window !== 'undefined') {
    const initializeCanaryDeployment = () => {
        // Wait for feature flags to be ready
        if (window.featureFlagManager) {
            CanaryDeployment.initialize();
        } else {
            setTimeout(initializeCanaryDeployment, 1000);
        }
    };
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeCanaryDeployment);
    } else {
        setTimeout(initializeCanaryDeployment, 2000);
    }
}

export { CanaryDeploymentManager, CanaryDeployment };
