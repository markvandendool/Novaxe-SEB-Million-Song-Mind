/**
 * ChordCubes 5.0 - Production Monitoring Dashboard
 * Military-Grade Real-Time System Monitoring and Alerting
 * 
 * Provides:
 * - Real-time performance metrics visualization
 * - System health indicators and status
 * - Error tracking and alerting
 * - User experience monitoring
 * - Feature flag impact analysis
 * - Production deployment metrics
 */

/**
 * Production Monitoring Dashboard
 */
class ProductionMonitoringDashboard {
    constructor() {
        this.metrics = new Map();
        this.alerts = [];
        this.dashboardElement = null;
        this.updateInterval = null;
        this.isVisible = false;
        
        this.thresholds = {
            fps: { critical: 15, warning: 30, target: 60 },
            memory: { critical: 1000, warning: 500, target: 200 }, // MB
            errorRate: { critical: 10, warning: 5, target: 1 }, // errors per minute
            latency: { critical: 1000, warning: 500, target: 100 }, // ms
            userExperience: { critical: 0.3, warning: 0.6, target: 0.8 } // 0-1 score
        };
        
        this.initializeDashboard();
        this.startMonitoring();
    }

    /**
     * Initialize the monitoring dashboard UI
     */
    initializeDashboard() {
        // Create dashboard container
        this.dashboardElement = document.createElement('div');
        this.dashboardElement.id = 'production-monitoring-dashboard';
        this.dashboardElement.innerHTML = this.getDashboardHTML();
        
        // Add CSS styles
        this.addDashboardStyles();
        
        // Append to body (hidden by default)
        document.body.appendChild(this.dashboardElement);
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('[PRODUCTION_MONITOR] Dashboard initialized');
    }

    /**
     * Get dashboard HTML structure
     */
    getDashboardHTML() {
        return `
            <div class="dashboard-header">
                <h2>🎼 ChordCubes 5.0 - Production Monitor</h2>
                <div class="dashboard-controls">
                    <button id="dashboard-toggle">📊 Toggle</button>
                    <button id="dashboard-alerts">🚨 Alerts (<span id="alert-count">0</span>)</button>
                    <button id="dashboard-export">📊 Export</button>
                    <button id="dashboard-reset">🔄 Reset</button>
                </div>
            </div>
            
            <div class="dashboard-content">
                <!-- System Health Section -->
                <div class="monitoring-section">
                    <h3>🏥 System Health</h3>
                    <div class="health-grid">
                        <div class="health-card" id="overall-health">
                            <div class="health-status">🟢 HEALTHY</div>
                            <div class="health-label">Overall Status</div>
                        </div>
                        <div class="health-card" id="performance-health">
                            <div class="health-status">🟡 MONITORING</div>
                            <div class="health-label">Performance</div>
                        </div>
                        <div class="health-card" id="error-health">
                            <div class="health-status">🟢 CLEAN</div>
                            <div class="health-label">Error Rate</div>
                        </div>
                        <div class="health-card" id="feature-health">
                            <div class="health-status">🟢 STABLE</div>
                            <div class="health-label">Features</div>
                        </div>
                    </div>
                </div>

                <!-- Performance Metrics Section -->
                <div class="monitoring-section">
                    <h3>⚡ Performance Metrics</h3>
                    <div class="metrics-grid">
                        <div class="metric-card">
                            <div class="metric-value" id="current-fps">--</div>
                            <div class="metric-label">Current FPS</div>
                            <div class="metric-trend" id="fps-trend">--</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value" id="avg-fps">--</div>
                            <div class="metric-label">Average FPS</div>
                            <div class="metric-trend" id="avg-fps-trend">--</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value" id="memory-usage">--</div>
                            <div class="metric-label">Memory (MB)</div>
                            <div class="metric-trend" id="memory-trend">--</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value" id="cube-count">--</div>
                            <div class="metric-label">Active Cubes</div>
                            <div class="metric-trend" id="cube-trend">--</div>
                        </div>
                    </div>
                </div>

                <!-- Feature Flags Section -->
                <div class="monitoring-section">
                    <h3>🎛️ Feature Flags Status</h3>
                    <div class="feature-flags-grid" id="feature-flags-status">
                        <!-- Dynamic content -->
                    </div>
                </div>

                <!-- System Resources Section -->
                <div class="monitoring-section">
                    <h3>💾 System Resources</h3>
                    <div class="resources-grid">
                        <div class="resource-card">
                            <div class="resource-value" id="geometries-count">--</div>
                            <div class="resource-label">Geometries</div>
                        </div>
                        <div class="resource-card">
                            <div class="resource-value" id="materials-count">--</div>
                            <div class="resource-label">Materials</div>
                        </div>
                        <div class="resource-card">
                            <div class="resource-value" id="textures-count">--</div>
                            <div class="resource-label">Textures</div>
                        </div>
                        <div class="resource-card">
                            <div class="resource-value" id="audio-contexts">--</div>
                            <div class="resource-label">Audio Contexts</div>
                        </div>
                    </div>
                </div>

                <!-- Recent Alerts Section -->
                <div class="monitoring-section">
                    <h3>🚨 Recent Alerts</h3>
                    <div class="alerts-container" id="alerts-container">
                        <div class="no-alerts">No alerts in the last 24 hours ✅</div>
                    </div>
                </div>

                <!-- Performance Charts Section -->
                <div class="monitoring-section">
                    <h3>📈 Performance History</h3>
                    <div class="charts-container">
                        <canvas id="fps-chart" width="600" height="200"></canvas>
                        <canvas id="memory-chart" width="600" height="200"></canvas>
                    </div>
                </div>

                <!-- Spatial Hash Grid Stats -->
                <div class="monitoring-section">
                    <h3>🗂️ Spatial Hash Grid</h3>
                    <div class="spatial-stats" id="spatial-stats">
                        <!-- Dynamic content -->
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Add dashboard CSS styles
     */
    addDashboardStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #production-monitoring-dashboard {
                position: fixed;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.95);
                color: #fff;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                z-index: 2147483647;
                overflow-y: auto;
                transition: left 0.3s ease-in-out;
                backdrop-filter: blur(10px);
            }

            #production-monitoring-dashboard.visible {
                left: 0;
            }

            .dashboard-header {
                padding: 20px;
                background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
                border-bottom: 2px solid #00ff00;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .dashboard-header h2 {
                margin: 0;
                color: #00ff00;
                font-size: 18px;
            }

            .dashboard-controls button {
                margin-left: 10px;
                padding: 8px 12px;
                background: #333;
                color: #fff;
                border: 1px solid #555;
                border-radius: 4px;
                cursor: pointer;
                font-family: inherit;
                font-size: 11px;
            }

            .dashboard-controls button:hover {
                background: #555;
                border-color: #00ff00;
            }

            .dashboard-content {
                padding: 20px;
                display: grid;
                gap: 20px;
            }

            .monitoring-section {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                padding: 15px;
            }

            .monitoring-section h3 {
                margin: 0 0 15px 0;
                color: #00ff00;
                font-size: 14px;
            }

            .health-grid, .metrics-grid, .resources-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 10px;
            }

            .health-card, .metric-card, .resource-card {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 6px;
                padding: 12px;
                text-align: center;
            }

            .health-status {
                font-size: 14px;
                font-weight: bold;
                margin-bottom: 5px;
            }

            .health-label, .metric-label, .resource-label {
                font-size: 10px;
                color: #ccc;
                text-transform: uppercase;
            }

            .metric-value, .resource-value {
                font-size: 18px;
                font-weight: bold;
                color: #00ff00;
                margin-bottom: 5px;
            }

            .metric-trend {
                font-size: 10px;
                color: #888;
            }

            .feature-flags-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 8px;
            }

            .feature-flag-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 12px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 4px;
                font-size: 11px;
            }

            .feature-flag-status {
                font-weight: bold;
            }

            .feature-flag-status.enabled {
                color: #00ff00;
            }

            .feature-flag-status.disabled {
                color: #ff4444;
            }

            .alerts-container {
                max-height: 200px;
                overflow-y: auto;
            }

            .alert-item {
                padding: 8px 12px;
                margin-bottom: 8px;
                border-left: 4px solid;
                background: rgba(255, 255, 255, 0.05);
                font-size: 11px;
            }

            .alert-item.critical {
                border-left-color: #ff4444;
                background: rgba(255, 68, 68, 0.1);
            }

            .alert-item.warning {
                border-left-color: #ffaa00;
                background: rgba(255, 170, 0, 0.1);
            }

            .alert-item.info {
                border-left-color: #0088ff;
                background: rgba(0, 136, 255, 0.1);
            }

            .charts-container {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
            }

            .charts-container canvas {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 4px;
            }

            .spatial-stats {
                font-family: 'Courier New', monospace;
                font-size: 11px;
                line-height: 1.4;
            }

            .no-alerts {
                text-align: center;
                color: #00ff00;
                font-style: italic;
                padding: 20px;
            }

            /* Mobile responsiveness */
            @media (max-width: 768px) {
                .dashboard-header {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 10px;
                }

                .charts-container {
                    grid-template-columns: 1fr;
                }

                .health-grid, .metrics-grid, .resources-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Toggle dashboard visibility
        document.getElementById('dashboard-toggle').addEventListener('click', () => {
            this.toggleVisibility();
        });

        // Show alerts detail
        document.getElementById('dashboard-alerts').addEventListener('click', () => {
            this.showAlertsDetail();
        });

        // Export data
        document.getElementById('dashboard-export').addEventListener('click', () => {
            this.exportData();
        });

        // Reset data
        document.getElementById('dashboard-reset').addEventListener('click', () => {
            this.resetData();
        });

        // Listen for feature flag changes
        window.addEventListener('featureFlagsChanged', () => {
            this.updateFeatureFlagsDisplay();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'M') {
                this.toggleVisibility();
                e.preventDefault();
            }
        });
    }

    /**
     * Start monitoring loop
     */
    startMonitoring() {
        this.updateInterval = setInterval(() => {
            this.collectMetrics();
            this.updateDashboard();
            this.checkAlerts();
        }, 1000); // Update every second

        console.log('[PRODUCTION_MONITOR] Monitoring started');
    }

    /**
     * Stop monitoring
     */
    stopMonitoring() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        console.log('[PRODUCTION_MONITOR] Monitoring stopped');
    }

    /**
     * Collect current system metrics
     */
    collectMetrics() {
        const timestamp = Date.now();
        const metrics = {
            timestamp,
            performance: this.getPerformanceMetrics(),
            resources: this.getResourceMetrics(),
            featureFlags: this.getFeatureFlagMetrics(),
            errors: this.getErrorMetrics(),
            userExperience: this.getUserExperienceMetrics()
        };

        // Store in metrics history (keep last 1000 points)
        if (!this.metrics.has('history')) {
            this.metrics.set('history', []);
        }
        
        const history = this.metrics.get('history');
        history.push(metrics);
        
        if (history.length > 1000) {
            history.shift();
        }

        // Update current metrics
        this.metrics.set('current', metrics);
    }

    /**
     * Get performance metrics
     */
    getPerformanceMetrics() {
        const perfMonitor = window.performanceMonitor;
        if (!perfMonitor) return null;

        const report = perfMonitor.getReport();
        return {
            currentFPS: report.currentFPS || 0,
            averageFPS: report.averageFPS || 0,
            minFPS: report.minFPS || 0,
            maxFPS: report.maxFPS || 0,
            performance: report.performance || 0,
            frameTime: report.frameTime || 0
        };
    }

    /**
     * Get resource metrics
     */
    getResourceMetrics() {
        const resourceManager = window.resourceManager;
        if (!resourceManager) return null;

        const stats = resourceManager.getResourceStats();
        return {
            geometries: stats.active?.geometries || 0,
            materials: stats.active?.materials || 0,
            textures: stats.active?.textures || 0,
            meshes: stats.active?.meshes || 0,
            memoryUsage: stats.memoryUsageMB || 0
        };
    }

    /**
     * Get feature flag metrics
     */
    getFeatureFlagMetrics() {
        const featureFlags = window.featureFlags;
        if (!featureFlags) return null;

        return { ...featureFlags };
    }

    /**
     * Get error metrics
     */
    getErrorMetrics() {
        const monitor = window.monitor;
        if (!monitor) return null;

        const stats = monitor.getStats();
        return {
            errorCount: stats.errorCount || 0,
            warningCount: stats.warningCount || 0,
            totalEvents: stats.totalEvents || 0
        };
    }

    /**
     * Get user experience metrics
     */
    getUserExperienceMetrics() {
        // Calculate user experience score based on various factors
        const perf = this.getPerformanceMetrics();
        if (!perf) return null;

        // UX score based on FPS, responsiveness, and stability
        let uxScore = 0;
        
        if (perf.currentFPS >= 55) uxScore += 0.4;
        else if (perf.currentFPS >= 30) uxScore += 0.2;
        
        if (perf.averageFPS >= 50) uxScore += 0.3;
        else if (perf.averageFPS >= 25) uxScore += 0.15;
        
        const fpsStability = Math.abs(perf.maxFPS - perf.minFPS);
        if (fpsStability < 10) uxScore += 0.2;
        else if (fpsStability < 20) uxScore += 0.1;
        
        if (perf.performance > 0.8) uxScore += 0.1;

        return {
            score: Math.min(uxScore, 1.0),
            fpsStability,
            responsiveness: perf.performance
        };
    }

    /**
     * Update dashboard display
     */
    updateDashboard() {
        const current = this.metrics.get('current');
        if (!current) return;

        // Update system health
        this.updateSystemHealth(current);
        
        // Update performance metrics
        this.updatePerformanceDisplay(current.performance);
        
        // Update resource display
        this.updateResourceDisplay(current.resources);
        
        // Update feature flags
        this.updateFeatureFlagsDisplay();
        
        // Update spatial hash stats
        this.updateSpatialHashStats();
        
        // Update charts
        this.updateCharts();
    }

    /**
     * Update system health indicators
     */
    updateSystemHealth(metrics) {
        const overallHealth = document.getElementById('overall-health');
        const performanceHealth = document.getElementById('performance-health');
        const errorHealth = document.getElementById('error-health');
        const featureHealth = document.getElementById('feature-health');

        // Overall system health
        let overallStatus = '🟢 HEALTHY';
        if (metrics.performance?.currentFPS < this.thresholds.fps.critical) {
            overallStatus = '🔴 CRITICAL';
        } else if (metrics.performance?.currentFPS < this.thresholds.fps.warning) {
            overallStatus = '🟡 WARNING';
        }

        overallHealth.querySelector('.health-status').textContent = overallStatus;

        // Performance health
        let perfStatus = '🟢 EXCELLENT';
        if (metrics.performance?.currentFPS < this.thresholds.fps.critical) {
            perfStatus = '🔴 POOR';
        } else if (metrics.performance?.currentFPS < this.thresholds.fps.warning) {
            perfStatus = '🟡 DEGRADED';
        }

        performanceHealth.querySelector('.health-status').textContent = perfStatus;

        // Error health
        const errorRate = metrics.errors?.errorCount || 0;
        let errorStatus = '🟢 CLEAN';
        if (errorRate > this.thresholds.errorRate.critical) {
            errorStatus = '🔴 HIGH ERRORS';
        } else if (errorRate > this.thresholds.errorRate.warning) {
            errorStatus = '🟡 SOME ERRORS';
        }

        errorHealth.querySelector('.health-status').textContent = errorStatus;

        // Feature health
        const featuresEnabled = Object.values(metrics.featureFlags || {}).filter(Boolean).length;
        featureHealth.querySelector('.health-status').textContent = `🟢 ${featuresEnabled} ACTIVE`;
    }

    /**
     * Update performance metrics display
     */
    updatePerformanceDisplay(performance) {
        if (!performance) return;

        document.getElementById('current-fps').textContent = performance.currentFPS.toFixed(1);
        document.getElementById('avg-fps').textContent = performance.averageFPS.toFixed(1);
        document.getElementById('memory-usage').textContent = (performance.memoryUsage || 0).toFixed(0);
        document.getElementById('cube-count').textContent = window.lineup?.length || 0;

        // Update trends
        this.updateTrends();
    }

    /**
     * Update resource display
     */
    updateResourceDisplay(resources) {
        if (!resources) return;

        document.getElementById('geometries-count').textContent = resources.geometries || 0;
        document.getElementById('materials-count').textContent = resources.materials || 0;
        document.getElementById('textures-count').textContent = resources.textures || 0;
        document.getElementById('audio-contexts').textContent = window.unifiedAudioManager?.getContextCount() || 0;
    }

    /**
     * Update feature flags display
     */
    updateFeatureFlagsDisplay() {
        const container = document.getElementById('feature-flags-status');
        const flags = window.featureFlags || {};

        container.innerHTML = '';

        for (const [flag, enabled] of Object.entries(flags)) {
            const item = document.createElement('div');
            item.className = 'feature-flag-item';
            
            const displayName = flag.replace('enable', '').replace(/([A-Z])/g, ' $1').trim();
            
            item.innerHTML = `
                <span>${displayName}</span>
                <span class="feature-flag-status ${enabled ? 'enabled' : 'disabled'}">
                    ${enabled ? '✅ ON' : '❌ OFF'}
                </span>
            `;
            
            container.appendChild(item);
        }
    }

    /**
     * Update spatial hash grid statistics
     */
    updateSpatialHashStats() {
        const container = document.getElementById('spatial-stats');
        const spatialGrid = window.spatialHashGrid;

        if (!spatialGrid) {
            container.innerHTML = '<div>Spatial Hash Grid not available</div>';
            return;
        }

        const stats = spatialGrid.getStats ? spatialGrid.getStats() : {};
        
        container.innerHTML = `
            <div>Grid Size: ${stats.gridSize || 'N/A'}</div>
            <div>Active Objects: ${stats.objectCount || 0}</div>
            <div>Occupied Buckets: ${stats.occupiedBuckets || 0}</div>
            <div>Query Performance: ${stats.avgQueryTime || 'N/A'}ms</div>
            <div>Memory Usage: ${stats.memoryUsage || 'N/A'}KB</div>
        `;
    }

    /**
     * Update performance charts
     */
    updateCharts() {
        // Simple canvas-based charts (in production, could use Chart.js or similar)
        this.updateFPSChart();
        this.updateMemoryChart();
    }

    /**
     * Update FPS chart
     */
    updateFPSChart() {
        const canvas = document.getElementById('fps-chart');
        const ctx = canvas.getContext('2d');
        const history = this.metrics.get('history') || [];

        if (history.length === 0) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        
        for (let i = 0; i <= 10; i++) {
            const y = (canvas.height / 10) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        // Draw FPS line
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.beginPath();

        const maxDataPoints = 100;
        const dataToShow = history.slice(-maxDataPoints);
        const stepX = canvas.width / (dataToShow.length - 1 || 1);

        dataToShow.forEach((point, index) => {
            const fps = point.performance?.currentFPS || 0;
            const x = index * stepX;
            const y = canvas.height - (fps / 60) * canvas.height;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Draw target line
        ctx.strokeStyle = '#ffaa00';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        const targetY = canvas.height - (60 / 60) * canvas.height;
        ctx.moveTo(0, targetY);
        ctx.lineTo(canvas.width, targetY);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    /**
     * Update memory chart
     */
    updateMemoryChart() {
        const canvas = document.getElementById('memory-chart');
        const ctx = canvas.getContext('2d');
        const history = this.metrics.get('history') || [];

        if (history.length === 0) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw memory usage line
        ctx.strokeStyle = '#0088ff';
        ctx.lineWidth = 2;
        ctx.beginPath();

        const maxDataPoints = 100;
        const dataToShow = history.slice(-maxDataPoints);
        const stepX = canvas.width / (dataToShow.length - 1 || 1);
        const maxMemory = Math.max(...dataToShow.map(p => p.resources?.memoryUsage || 0), 100);

        dataToShow.forEach((point, index) => {
            const memory = point.resources?.memoryUsage || 0;
            const x = index * stepX;
            const y = canvas.height - (memory / maxMemory) * canvas.height;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();
    }

    /**
     * Check for alert conditions
     */
    checkAlerts() {
        const current = this.metrics.get('current');
        if (!current) return;

        const now = Date.now();

        // FPS alerts
        if (current.performance?.currentFPS < this.thresholds.fps.critical) {
            this.addAlert('critical', 'Performance Critical', `FPS dropped to ${current.performance.currentFPS.toFixed(1)}`, now);
        } else if (current.performance?.currentFPS < this.thresholds.fps.warning) {
            this.addAlert('warning', 'Performance Warning', `FPS below target at ${current.performance.currentFPS.toFixed(1)}`, now);
        }

        // Memory alerts
        if (current.resources?.memoryUsage > this.thresholds.memory.critical) {
            this.addAlert('critical', 'Memory Critical', `Memory usage at ${current.resources.memoryUsage}MB`, now);
        }

        // Error rate alerts
        if (current.errors?.errorCount > this.thresholds.errorRate.critical) {
            this.addAlert('critical', 'High Error Rate', `${current.errors.errorCount} errors detected`, now);
        }

        // Clean old alerts (older than 24 hours)
        this.alerts = this.alerts.filter(alert => (now - alert.timestamp) < 24 * 60 * 60 * 1000);
        
        // Update alert count
        document.getElementById('alert-count').textContent = this.alerts.length;
    }

    /**
     * Add an alert
     */
    addAlert(level, title, message, timestamp = Date.now()) {
        const alert = { level, title, message, timestamp };
        this.alerts.unshift(alert);

        // Update alerts display
        this.updateAlertsDisplay();

        // Log to console
        const logMethod = level === 'critical' ? 'error' : level === 'warning' ? 'warn' : 'info';
        console[logMethod](`[PRODUCTION_MONITOR] ${title}: ${message}`);
    }

    /**
     * Update alerts display
     */
    updateAlertsDisplay() {
        const container = document.getElementById('alerts-container');
        
        if (this.alerts.length === 0) {
            container.innerHTML = '<div class="no-alerts">No alerts in the last 24 hours ✅</div>';
            return;
        }

        container.innerHTML = this.alerts.slice(0, 10).map(alert => {
            const timeStr = new Date(alert.timestamp).toLocaleTimeString();
            return `
                <div class="alert-item ${alert.level}">
                    <strong>${alert.title}</strong> (${timeStr})<br>
                    ${alert.message}
                </div>
            `;
        }).join('');
    }

    /**
     * Toggle dashboard visibility
     */
    toggleVisibility() {
        this.isVisible = !this.isVisible;
        this.dashboardElement.classList.toggle('visible', this.isVisible);
        
        if (this.isVisible) {
            this.updateDashboard();
        }
    }

    /**
     * Show alerts detail modal
     */
    showAlertsDetail() {
        const alertsData = {
            total: this.alerts.length,
            critical: this.alerts.filter(a => a.level === 'critical').length,
            warning: this.alerts.filter(a => a.level === 'warning').length,
            info: this.alerts.filter(a => a.level === 'info').length,
            recent: this.alerts.slice(0, 5)
        };

        console.log('[PRODUCTION_MONITOR] Alerts Detail:', alertsData);
        alert(`Alerts Summary:\nTotal: ${alertsData.total}\nCritical: ${alertsData.critical}\nWarnings: ${alertsData.warning}\nInfo: ${alertsData.info}`);
    }

    /**
     * Export monitoring data
     */
    exportData() {
        const exportData = {
            timestamp: new Date().toISOString(),
            metrics: this.metrics.get('current'),
            alerts: this.alerts,
            thresholds: this.thresholds,
            history: this.metrics.get('history')?.slice(-100) // Last 100 points
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chordcubes-monitoring-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('[PRODUCTION_MONITOR] Data exported');
    }

    /**
     * Reset monitoring data
     */
    resetData() {
        this.metrics.clear();
        this.alerts = [];
        this.updateDashboard();
        
        console.log('[PRODUCTION_MONITOR] Data reset');
    }

    /**
     * Update trend indicators
     */
    updateTrends() {
        const history = this.metrics.get('history') || [];
        if (history.length < 2) return;

        const recent = history.slice(-10);
        const current = recent[recent.length - 1];
        const previous = recent[recent.length - 2];

        // FPS trend
        if (current.performance && previous.performance) {
            const fpsChange = current.performance.currentFPS - previous.performance.currentFPS;
            const fpsTrend = document.getElementById('fps-trend');
            if (fpsChange > 0.5) {
                fpsTrend.textContent = '📈 +' + fpsChange.toFixed(1);
                fpsTrend.style.color = '#00ff00';
            } else if (fpsChange < -0.5) {
                fpsTrend.textContent = '📉 ' + fpsChange.toFixed(1);
                fpsTrend.style.color = '#ff4444';
            } else {
                fpsTrend.textContent = '➡️ stable';
                fpsTrend.style.color = '#888';
            }
        }
    }

    /**
     * Get dashboard status for external monitoring
     */
    getStatus() {
        return {
            isActive: !!this.updateInterval,
            isVisible: this.isVisible,
            alertCount: this.alerts.length,
            currentMetrics: this.metrics.get('current'),
            uptime: Date.now() - (this.startTime || Date.now())
        };
    }
}

// Global monitoring interface
const ProductionMonitoring = {
    dashboard: null,
    
    initialize() {
        if (!this.dashboard) {
            this.dashboard = new ProductionMonitoringDashboard();
            console.log('📊 Production Monitoring Dashboard initialized');
            
            // Global shortcuts
            window.showMonitoringDashboard = () => this.dashboard.toggleVisibility();
            window.getMonitoringStatus = () => this.dashboard.getStatus();
            window.exportMonitoringData = () => this.dashboard.exportData();
        }
        return this.dashboard;
    },
    
    show() {
        if (this.dashboard) {
            this.dashboard.toggleVisibility();
        }
    },
    
    addAlert(level, title, message) {
        if (this.dashboard) {
            this.dashboard.addAlert(level, title, message);
        }
    }
};

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
    const initializeMonitoring = () => {
        ProductionMonitoring.initialize();
        
        // Add global keyboard shortcut info
        console.log('📊 Production Monitoring ready!');
        console.log('Use Ctrl+Shift+M to toggle dashboard');
        console.log('Use window.showMonitoringDashboard() to show/hide');
    };
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeMonitoring);
    } else {
        setTimeout(initializeMonitoring, 1000);
    }
}

export { ProductionMonitoringDashboard, ProductionMonitoring };
