/**
 * ChordCubes 5.0 - Production Feature Flag System
 * Military-Grade Feature Management and Controlled Rollout
 * 
 * Provides:
 * - Environment-based feature configuration
 * - Runtime feature toggles for safe deployment
 * - A/B testing capabilities
 * - Gradual rollout controls
 * - Emergency kill switches
 * - Performance-based automatic adjustments
 */

/**
 * Production Feature Flag Configuration
 */
const PRODUCTION_FEATURE_CONFIG = {
    // Environment-based defaults
    development: {
        enablePerformanceOptimization: true,
        enableSpatialHashing: true,
        enableAdaptiveQuality: true,
        enablePerformanceMonitoring: true,
        enableCollisionOptimization: true,
        enableProductionTesting: true,
        enableDebugLogging: true,
        enableExperimentalFeatures: true
    },

    staging: {
        enablePerformanceOptimization: true,
        enableSpatialHashing: true,
        enableAdaptiveQuality: true,
        enablePerformanceMonitoring: true,
        enableCollisionOptimization: true,
        enableProductionTesting: true,
        enableDebugLogging: false,
        enableExperimentalFeatures: false
    },

    production: {
        enablePerformanceOptimization: false, // Start with false for gradual rollout
        enableSpatialHashing: false,          // Gradually enable based on traffic %
        enableAdaptiveQuality: true,          // Safe to enable (backward compatible)
        enablePerformanceMonitoring: true,    // Always enabled for monitoring
        enableCollisionOptimization: false,   // High-risk change, gradual rollout
        enableProductionTesting: false,       // Disable testing in production
        enableDebugLogging: false,            // Never enable in production
        enableExperimentalFeatures: false     // Never enable in production
    }
};

/**
 * Rollout Percentage Configuration
 * Controls what percentage of users get new features
 */
const ROLLOUT_PERCENTAGES = {
    performanceOptimization: {
        week1: 5,    // 5% of users
        week2: 15,   // 15% of users
        week3: 35,   // 35% of users
        week4: 65,   // 65% of users
        week5: 85,   // 85% of users
        week6: 100   // Full rollout
    },

    spatialHashing: {
        week1: 2,    // 2% of users (high-risk feature)
        week2: 8,    // 8% of users
        week3: 20,   // 20% of users
        week4: 45,   // 45% of users
        week5: 70,   // 70% of users
        week6: 100   // Full rollout
    },

    collisionOptimization: {
        week1: 1,    // 1% of users (highest-risk feature)
        week2: 5,    // 5% of users
        week3: 15,   // 15% of users
        week4: 30,   // 30% of users
        week5: 55,   // 55% of users
        week6: 100   // Full rollout
    }
};

/**
 * Production Feature Flag Manager
 */
class ProductionFeatureFlagManager {
    constructor() {
        this.environment = this.detectEnvironment();
        this.userId = this.generateUserId();
        this.rolloutWeek = this.getCurrentRolloutWeek();
        this.baseConfig = PRODUCTION_FEATURE_CONFIG[this.environment] || PRODUCTION_FEATURE_CONFIG.production;
        this.overrides = this.loadOverrides();
        this.emergencyKillSwitches = new Set();
        this.performanceMetrics = new Map();

        this.initializeFeatureFlags();
        this.setupPerformanceMonitoring();
        this.logInitialization();
    }

    /**
     * Detect current environment
     */
    detectEnvironment() {
        // Check URL patterns
        const hostname = window.location?.hostname || '';

        if (hostname.includes('localhost') || hostname.includes('127.0.0.1') || hostname === '') {
            return 'development';
        } else if (hostname.includes('staging') || hostname.includes('dev.') || hostname.includes('-staging')) {
            return 'staging';
        } else {
            return 'production';
        }
    }

    /**
     * Generate consistent user ID for rollout calculations
     */
    generateUserId() {
        let userId = localStorage.getItem('chordcubes_user_id');

        if (!userId) {
            // Create deterministic user ID based on browser fingerprint
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillText('ChordCubes 5.0 fingerprint', 2, 2);

            const fingerprint = canvas.toDataURL() +
                navigator.userAgent +
                navigator.language +
                screen.width + 'x' + screen.height;

            // Convert to hash
            let hash = 0;
            for (let i = 0; i < fingerprint.length; i++) {
                const char = fingerprint.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32bit integer
            }

            userId = Math.abs(hash).toString();
            localStorage.setItem('chordcubes_user_id', userId);
        }

        return userId;
    }

    /**
     * Determine current rollout week (for gradual feature deployment)
     */
    getCurrentRolloutWeek() {
        // In production, this would be determined by deployment metadata
        // For now, calculate based on current date and deployment start
        const deploymentStart = new Date('2024-09-01'); // Phase 6 start
        const now = new Date();
        const daysSinceDeployment = Math.floor((now - deploymentStart) / (1000 * 60 * 60 * 24));
        const weeksSinceDeployment = Math.floor(daysSinceDeployment / 7) + 1;

        return Math.min(weeksSinceDeployment, 6); // Max 6 weeks for full rollout
    }

    /**
     * Load feature flag overrides from various sources
     */
    loadOverrides() {
        const overrides = {};

        // URL parameter overrides (for testing)
        const urlParams = new URLSearchParams(window.location.search);
        for (const [key, value] of urlParams.entries()) {
            if (key.startsWith('ff_')) {
                const featureName = key.substring(3); // Remove 'ff_' prefix
                overrides[featureName] = value === 'true' || value === '1';
            }
        }

        // localStorage overrides (for development)
        try {
            const localOverrides = JSON.parse(localStorage.getItem('chordcubes_feature_flags') || '{}');
            Object.assign(overrides, localOverrides);
        } catch (e) {
            console.warn('[FEATURE_FLAGS] Invalid localStorage overrides:', e);
        }

        // Remote config overrides (would be loaded from server in production)
        // For now, using static configuration

        return overrides;
    }

    /**
     * Initialize feature flags with rollout logic
     */
    initializeFeatureFlags() {
        this.flags = { ...this.baseConfig };

        // Apply rollout percentages in production
        if (this.environment === 'production') {
            this.applyRolloutLogic();
        }

        // Apply manual overrides
        Object.assign(this.flags, this.overrides);

        // Apply emergency kill switches
        this.applyEmergencyKillSwitches();

        // Expose globally for easy access
        window.featureFlags = this.flags;
        window.featureFlagManager = this;
    }

    /**
     * Apply rollout logic based on user ID and rollout percentages
     */
    applyRolloutLogic() {
        const userHash = parseInt(this.userId) % 100; // 0-99

        // Check each rollout configuration
        for (const [featureName, schedule] of Object.entries(ROLLOUT_PERCENTAGES)) {
            const currentPercentage = schedule[`week${this.rolloutWeek}`] || 0;

            if (userHash < currentPercentage) {
                // User is in rollout group
                switch (featureName) {
                    case 'performanceOptimization':
                        this.flags.enablePerformanceOptimization = true;
                        break;
                    case 'spatialHashing':
                        this.flags.enableSpatialHashing = true;
                        break;
                    case 'collisionOptimization':
                        this.flags.enableCollisionOptimization = true;
                        break;
                }
            }
        }
    }

    /**
     * Apply emergency kill switches
     */
    applyEmergencyKillSwitches() {
        // Check for emergency kill switches (would be loaded from server)
        const killSwitches = this.loadEmergencyKillSwitches();

        for (const feature of killSwitches) {
            if (this.flags.hasOwnProperty(feature)) {
                this.flags[feature] = false;
                this.emergencyKillSwitches.add(feature);
                console.warn(`[FEATURE_FLAGS] Emergency kill switch activated for: ${feature}`);
            }
        }
    }

    /**
     * Load emergency kill switches from server
     */
    loadEmergencyKillSwitches() {
        // In production, this would fetch from server
        // For now, check localStorage for testing
        try {
            const killSwitches = JSON.parse(localStorage.getItem('chordcubes_kill_switches') || '[]');
            return Array.isArray(killSwitches) ? killSwitches : [];
        } catch (e) {
            return [];
        }
    }

    /**
     * Setup performance monitoring for feature flags
     */
    setupPerformanceMonitoring() {
        // Monitor performance impact of enabled features
        setInterval(() => {
            if (window.performanceMonitor) {
                const report = window.performanceMonitor.getReport();
                this.recordPerformanceMetrics(report);
                this.checkPerformanceThresholds(report);
            }
        }, 5000); // Check every 5 seconds
    }

    /**
     * Record performance metrics for feature impact analysis
     */
    recordPerformanceMetrics(report) {
        const timestamp = Date.now();

        for (const [feature, enabled] of Object.entries(this.flags)) {
            if (enabled && feature.startsWith('enable')) {
                if (!this.performanceMetrics.has(feature)) {
                    this.performanceMetrics.set(feature, []);
                }

                const metrics = this.performanceMetrics.get(feature);
                metrics.push({
                    timestamp,
                    fps: report.currentFPS,
                    averageFPS: report.averageFPS,
                    performance: report.performance
                });

                // Keep only last 100 data points
                if (metrics.length > 100) {
                    metrics.shift();
                }
            }
        }
    }

    /**
     * Check performance thresholds and auto-disable features if needed
     */
    checkPerformanceThresholds(report) {
        const MIN_FPS_THRESHOLD = 30;
        const PERFORMANCE_THRESHOLD = 0.5; // 50% performance

        if (report.currentFPS < MIN_FPS_THRESHOLD || report.performance < PERFORMANCE_THRESHOLD) {
            console.warn('[FEATURE_FLAGS] Performance below threshold, checking for auto-disable...');

            // Auto-disable high-impact features if performance is poor
            if (this.flags.enableCollisionOptimization && report.currentFPS < 20) {
                console.warn('[FEATURE_FLAGS] Auto-disabling collision optimization due to poor performance');
                this.disableFeature('enableCollisionOptimization', 'PERFORMANCE_AUTO_DISABLE');
            }

            if (this.flags.enableSpatialHashing && report.currentFPS < 15) {
                console.warn('[FEATURE_FLAGS] Auto-disabling spatial hashing due to critical performance');
                this.disableFeature('enableSpatialHashing', 'PERFORMANCE_AUTO_DISABLE');
            }
        }
    }

    /**
     * Disable a feature with reason logging
     */
    disableFeature(featureName, reason = 'MANUAL') {
        if (this.flags[featureName]) {
            this.flags[featureName] = false;
            window.featureFlags = this.flags;

            console.warn(`[FEATURE_FLAGS] Feature disabled: ${featureName} (Reason: ${reason})`);

            // Notify monitoring system
            if (window.monitor) {
                window.monitor.logEvent('feature_disabled', {
                    feature: featureName,
                    reason,
                    timestamp: new Date().toISOString(),
                    environment: this.environment,
                    userId: this.userId
                });
            }

            // Trigger system reconfiguration if needed
            this.reconfigureSystem();
        }
    }

    /**
     * Enable a feature with validation
     */
    enableFeature(featureName, reason = 'MANUAL') {
        if (this.flags.hasOwnProperty(featureName) && !this.emergencyKillSwitches.has(featureName)) {
            this.flags[featureName] = true;
            window.featureFlags = this.flags;

            console.log(`[FEATURE_FLAGS] Feature enabled: ${featureName} (Reason: ${reason})`);

            // Notify monitoring system
            if (window.monitor) {
                window.monitor.logEvent('feature_enabled', {
                    feature: featureName,
                    reason,
                    timestamp: new Date().toISOString(),
                    environment: this.environment,
                    userId: this.userId
                });
            }

            // Trigger system reconfiguration
            this.reconfigureSystem();
        } else {
            console.error(`[FEATURE_FLAGS] Cannot enable feature: ${featureName} (Kill switch active or invalid feature)`);
        }
    }

    /**
     * Reconfigure system based on current feature flags
     */
    reconfigureSystem() {
        // Notify all systems that feature flags have changed
        if (window.spatialHashGrid) {
            window.spatialHashGrid.setEnabled(this.flags.enableSpatialHashing);
        }

        if (window.optimizedCollisionDetector) {
            window.optimizedCollisionDetector.setEnabled(this.flags.enableCollisionOptimization);
        }

        if (window.adaptiveQualitySystem) {
            window.adaptiveQualitySystem.setEnabled(this.flags.enableAdaptiveQuality);
        }

        if (window.performanceMonitor) {
            window.performanceMonitor.setEnabled(this.flags.enablePerformanceMonitoring);
        }

        // Dispatch custom event for other systems to listen
        window.dispatchEvent(new CustomEvent('featureFlagsChanged', {
            detail: { flags: this.flags, manager: this }
        }));
    }

    /**
     * Get current feature flag status
     */
    getFeatureStatus() {
        return {
            environment: this.environment,
            userId: this.userId,
            rolloutWeek: this.rolloutWeek,
            flags: { ...this.flags },
            overrides: { ...this.overrides },
            emergencyKillSwitches: Array.from(this.emergencyKillSwitches),
            performanceMetrics: Object.fromEntries(this.performanceMetrics)
        };
    }

    /**
     * Log initialization information
     */
    logInitialization() {
        console.log('[FEATURE_FLAGS] Production Feature Flag System Initialized');
        console.log(`[FEATURE_FLAGS] Environment: ${this.environment}`);
        console.log(`[FEATURE_FLAGS] User ID: ${this.userId}`);
        console.log(`[FEATURE_FLAGS] Rollout Week: ${this.rolloutWeek}`);
        console.log('[FEATURE_FLAGS] Active Features:', this.flags);

        if (Object.keys(this.overrides).length > 0) {
            console.log('[FEATURE_FLAGS] Manual Overrides:', this.overrides);
        }

        if (this.emergencyKillSwitches.size > 0) {
            console.warn('[FEATURE_FLAGS] Emergency Kill Switches:', Array.from(this.emergencyKillSwitches));
        }
    }

    /**
     * Manual override for testing/debugging
     */
    setFeatureFlag(featureName, enabled, permanent = false) {
        if (this.flags.hasOwnProperty(featureName)) {
            this.flags[featureName] = enabled;
            window.featureFlags = this.flags;

            if (permanent) {
                this.overrides[featureName] = enabled;
                localStorage.setItem('chordcubes_feature_flags', JSON.stringify(this.overrides));
            }

            this.reconfigureSystem();

            console.log(`[FEATURE_FLAGS] Manual override: ${featureName} = ${enabled} (Permanent: ${permanent})`);
        } else {
            console.error(`[FEATURE_FLAGS] Invalid feature name: ${featureName}`);
        }
    }

    /**
     * Emergency kill switch activation
     */
    activateEmergencyKillSwitch(featureName) {
        console.error(`[FEATURE_FLAGS] EMERGENCY KILL SWITCH ACTIVATED: ${featureName}`);

        this.emergencyKillSwitches.add(featureName);
        this.disableFeature(featureName, 'EMERGENCY_KILL_SWITCH');

        // Store in localStorage for persistence
        const killSwitches = Array.from(this.emergencyKillSwitches);
        localStorage.setItem('chordcubes_kill_switches', JSON.stringify(killSwitches));

        // Immediate system reconfiguration
        this.reconfigureSystem();
    }

    /**
     * Clear all overrides and kill switches (for testing)
     */
    resetToDefaults() {
        this.overrides = {};
        this.emergencyKillSwitches.clear();
        localStorage.removeItem('chordcubes_feature_flags');
        localStorage.removeItem('chordcubes_kill_switches');

        this.initializeFeatureFlags();

        console.log('[FEATURE_FLAGS] Reset to default configuration');
    }
}

// Global feature flag utilities
const FeatureFlags = {
    // Quick access functions
    isEnabled: (featureName) => {
        return window.featureFlags?.[featureName] || false;
    },

    // Performance optimization checks
    usePerformanceOptimization: () => FeatureFlags.isEnabled('enablePerformanceOptimization'),
    useSpatialHashing: () => FeatureFlags.isEnabled('enableSpatialHashing'),
    useAdaptiveQuality: () => FeatureFlags.isEnabled('enableAdaptiveQuality'),
    usePerformanceMonitoring: () => FeatureFlags.isEnabled('enablePerformanceMonitoring'),
    useCollisionOptimization: () => FeatureFlags.isEnabled('enableCollisionOptimization'),

    // Development/testing checks
    useDebugLogging: () => FeatureFlags.isEnabled('enableDebugLogging'),
    useExperimentalFeatures: () => FeatureFlags.isEnabled('enableExperimentalFeatures'),
    useProductionTesting: () => FeatureFlags.isEnabled('enableProductionTesting')
};

// Initialize feature flag manager when DOM is ready
if (typeof window !== 'undefined') {
    const initializeFeatureFlags = () => {
        window.productionFeatureFlagManager = new ProductionFeatureFlagManager();
        window.FeatureFlags = FeatureFlags;

        console.log('🎛️ Production Feature Flag System ready!');
        console.log('Use window.featureFlagManager for management');
        console.log('Use FeatureFlags.isEnabled("featureName") for checks');
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeFeatureFlags);
    } else {
        initializeFeatureFlags();
    }
}

export { ProductionFeatureFlagManager, FeatureFlags };
