// ============================================
// 🔍 CHORDCUBES 5.0 - CRITICAL SYSTEM MONITOR
// ============================================
// Real-time monitoring for AudioContext, Memory, WebGL, and MIDI
// Military-grade precision tracking with emergency alerts

class ChordCubesMonitor {
    constructor() {
        this.isRunning = false;
        this.monitoringInterval = null;
        this.alertThresholds = {
            audioContextCount: 1,          // Only ONE AudioContext should exist
            memoryUsagePercent: 70,        // Alert at 70% memory usage
            webglContextCount: 1,          // Only ONE WebGL context
            midiPortCount: 10,             // Alert if more than 10 MIDI ports
            fpsBelow: 30,                  // Alert if FPS drops below 30
            textureCacheSize: 50           // Alert if texture cache exceeds 50 textures
        };
        
        this.currentMetrics = {
            audioContexts: [],
            audioContextCount: 0,
            memoryUsage: 0,
            memoryLimit: 0,
            webglContexts: [],
            webglContextCount: 0,
            midiPorts: [],
            midiPortCount: 0,
            currentFPS: 0,
            textureCacheSize: 0,
            warnings: [],
            emergencyAlerts: []
        };

        this.frameCount = 0;
        this.lastFrameTime = performance.now();
        this.fpsCalculationInterval = 1000; // Calculate FPS every second
        
        console.log('[MONITOR] 🔍 ChordCubes Critical System Monitor initialized');
    }

    // ==========================================
    // EMERGENCY MONITORING STARTUP
    // ==========================================
    async start() {
        if (this.isRunning) {
            console.log('[MONITOR] ⚠️ Monitor already running');
            return;
        }

        console.log('[MONITOR] 🚨 Starting emergency monitoring systems...');
        
        // Hook into global error handling
        this.setupGlobalErrorHandling();
        
        // Hook into Tone.js context tracking
        this.setupAudioContextTracking();
        
        // Hook into Three.js context tracking
        this.setupWebGLContextTracking();
        
        // Hook into WebMIDI tracking
        this.setupMIDITracking();
        
        // Hook into performance tracking
        this.setupPerformanceTracking();
        
        // Start monitoring loop
        this.isRunning = true;
        this.monitoringInterval = setInterval(() => {
            this.runMonitoringCycle();
        }, 1000); // Monitor every second
        
        console.log('[MONITOR] ✅ All monitoring systems active');
        return true;
    }

    stop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        console.log('[MONITOR] 🛑 Monitoring stopped');
    }

    // ==========================================
    // CRITICAL SYSTEM TRACKING
    // ==========================================
    setupAudioContextTracking() {
        // Track all AudioContext instances
        const originalAudioContext = window.AudioContext || window.webkitAudioContext;
        const contextInstances = [];
        
        if (originalAudioContext) {
            window.AudioContext = function(...args) {
                const instance = new originalAudioContext(...args);
                contextInstances.push({
                    instance,
                    created: Date.now(),
                    state: instance.state
                });
                console.log(`[MONITOR] 🎵 AudioContext #${contextInstances.length} created`);
                return instance;
            };
            
            // Copy static methods
            Object.setPrototypeOf(window.AudioContext, originalAudioContext);
        }
        
        this.audioContextInstances = contextInstances;
    }

    setupWebGLContextTracking() {
        // Track WebGL context creation
        const canvas = HTMLCanvasElement.prototype;
        const originalGetContext = canvas.getContext;
        const webglContexts = [];
        
        canvas.getContext = function(contextType, ...args) {
            const context = originalGetContext.call(this, contextType, ...args);
            
            if (contextType.includes('webgl')) {
                webglContexts.push({
                    context,
                    canvas: this,
                    type: contextType,
                    created: Date.now()
                });
                console.log(`[MONITOR] 🎨 WebGL Context #${webglContexts.length} created`);
            }
            
            return context;
        };
        
        this.webglContextInstances = webglContexts;
    }

    setupMIDITracking() {
        // Track MIDI port usage
        if (navigator.requestMIDIAccess) {
            const originalRequestMIDI = navigator.requestMIDIAccess;
            const midiPorts = [];
            
            navigator.requestMIDIAccess = function(...args) {
                return originalRequestMIDI.apply(this, args).then(access => {
                    // Track inputs and outputs
                    for (let input of access.inputs.values()) {
                        midiPorts.push({ type: 'input', port: input, opened: Date.now() });
                    }
                    for (let output of access.outputs.values()) {
                        midiPorts.push({ type: 'output', port: output, opened: Date.now() });
                    }
                    console.log(`[MONITOR] 🎹 MIDI Access granted. ${midiPorts.length} ports tracked`);
                    return access;
                });
            };
            
            this.midiPortInstances = midiPorts;
        }
    }

    setupPerformanceTracking() {
        // FPS tracking using requestAnimationFrame
        const trackFPS = () => {
            this.frameCount++;
            const now = performance.now();
            
            if (now - this.lastFrameTime >= this.fpsCalculationInterval) {
                this.currentMetrics.currentFPS = Math.round(
                    (this.frameCount * 1000) / (now - this.lastFrameTime)
                );
                this.frameCount = 0;
                this.lastFrameTime = now;
            }
            
            if (this.isRunning) {
                requestAnimationFrame(trackFPS);
            }
        };
        
        requestAnimationFrame(trackFPS);
    }

    setupGlobalErrorHandling() {
        // Track critical errors
        const originalConsoleError = console.error;
        const originalConsoleWarn = console.warn;
        
        console.error = (...args) => {
            this.logCriticalError('ERROR', args);
            return originalConsoleError.apply(console, args);
        };
        
        console.warn = (...args) => {
            this.logCriticalError('WARN', args);
            return originalConsoleWarn.apply(console, args);
        };
        
        window.addEventListener('error', (event) => {
            this.logCriticalError('GLOBAL_ERROR', [event.error]);
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            this.logCriticalError('UNHANDLED_PROMISE', [event.reason]);
        });
    }

    logCriticalError(level, args) {
        const error = {
            level,
            message: args.join(' '),
            timestamp: Date.now(),
            stack: new Error().stack
        };
        
        // Check for critical audio/memory/webgl errors
        const msg = error.message.toLowerCase();
        if (msg.includes('audiocontext') || 
            msg.includes('webgl') || 
            msg.includes('memory') || 
            msg.includes('midi')) {
            
            this.currentMetrics.emergencyAlerts.push(error);
            console.log(`[MONITOR] 🚨 CRITICAL SYSTEM ERROR: ${error.message}`);
        }
    }

    // ==========================================
    // MONITORING CYCLE
    // ==========================================
    runMonitoringCycle() {
        try {
            this.updateMetrics();
            this.checkThresholds();
            this.logStatus();
        } catch (error) {
            console.error('[MONITOR] ❌ Monitoring cycle failed:', error);
        }
    }

    updateMetrics() {
        // Update AudioContext count
        if (this.audioContextInstances) {
            this.currentMetrics.audioContextCount = this.audioContextInstances.length;
            this.currentMetrics.audioContexts = this.audioContextInstances.map(ctx => ({
                state: ctx.instance.state,
                created: ctx.created
            }));
        }

        // Update WebGL context count
        if (this.webglContextInstances) {
            this.currentMetrics.webglContextCount = this.webglContextInstances.length;
        }

        // Update MIDI port count
        if (this.midiPortInstances) {
            this.currentMetrics.midiPortCount = this.midiPortInstances.length;
        }

        // Update memory usage (if available)
        if (performance.memory) {
            this.currentMetrics.memoryUsage = performance.memory.usedJSHeapSize;
            this.currentMetrics.memoryLimit = performance.memory.jsHeapSizeLimit;
        }

        // Update texture cache size (if Three.js is available)
        if (window.THREE && window.THREE.TextureLoader && window.THREE.TextureLoader.cache) {
            this.currentMetrics.textureCacheSize = Object.keys(window.THREE.TextureLoader.cache).length;
        }
    }

    checkThresholds() {
        this.currentMetrics.warnings = [];
        
        // Check AudioContext count
        if (this.currentMetrics.audioContextCount > this.alertThresholds.audioContextCount) {
            this.addWarning(`CRITICAL: ${this.currentMetrics.audioContextCount} AudioContexts detected (should be 1)`);
        }

        // Check memory usage
        if (this.currentMetrics.memoryLimit > 0) {
            const memoryPercent = (this.currentMetrics.memoryUsage / this.currentMetrics.memoryLimit) * 100;
            if (memoryPercent > this.alertThresholds.memoryUsagePercent) {
                this.addWarning(`HIGH MEMORY: ${memoryPercent.toFixed(1)}% used`);
            }
        }

        // Check WebGL contexts
        if (this.currentMetrics.webglContextCount > this.alertThresholds.webglContextCount) {
            this.addWarning(`CRITICAL: ${this.currentMetrics.webglContextCount} WebGL contexts (should be 1)`);
        }

        // Check MIDI ports
        if (this.currentMetrics.midiPortCount > this.alertThresholds.midiPortCount) {
            this.addWarning(`HIGH MIDI USAGE: ${this.currentMetrics.midiPortCount} ports open`);
        }

        // Check FPS
        if (this.currentMetrics.currentFPS > 0 && this.currentMetrics.currentFPS < this.alertThresholds.fpsBelow) {
            this.addWarning(`LOW PERFORMANCE: ${this.currentMetrics.currentFPS} FPS`);
        }

        // Check texture cache
        if (this.currentMetrics.textureCacheSize > this.alertThresholds.textureCacheSize) {
            this.addWarning(`HIGH TEXTURE USAGE: ${this.currentMetrics.textureCacheSize} textures cached`);
        }
    }

    addWarning(message) {
        this.currentMetrics.warnings.push({
            message,
            timestamp: Date.now()
        });
    }

    logStatus() {
        // Log status every 10 seconds
        if (Date.now() % 10000 < 1000) {
            console.log('[MONITOR] 📊 System Status:', {
                AudioContexts: this.currentMetrics.audioContextCount,
                WebGLContexts: this.currentMetrics.webglContextCount,
                MIDIPorts: this.currentMetrics.midiPortCount,
                FPS: this.currentMetrics.currentFPS,
                MemoryMB: Math.round(this.currentMetrics.memoryUsage / 1024 / 1024),
                TextureCache: this.currentMetrics.textureCacheSize,
                Warnings: this.currentMetrics.warnings.length
            });
        }

        // Log warnings immediately
        if (this.currentMetrics.warnings.length > 0) {
            console.warn('[MONITOR] ⚠️ Active Warnings:', this.currentMetrics.warnings.map(w => w.message));
        }
    }

    // ==========================================
    // PUBLIC API
    // ==========================================
    getMetrics() {
        return { ...this.currentMetrics };
    }

    getStatus() {
        return {
            isRunning: this.isRunning,
            uptime: Date.now() - (this.startTime || Date.now()),
            metrics: this.getMetrics()
        };
    }

    // Emergency shutdown if critical thresholds exceeded
    emergencyShutdown(reason) {
        console.error(`[MONITOR] 🚨 EMERGENCY SHUTDOWN: ${reason}`);
        
        // Stop all audio
        if (window.Tone && window.Tone.Transport) {
            window.Tone.Transport.stop();
            window.Tone.Transport.cancel();
        }
        
        // Stop all animations
        if (window.cancelAnimationFrame) {
            // Cancel all pending animation frames (brute force approach)
            for (let i = 0; i < 1000; i++) {
                window.cancelAnimationFrame(i);
            }
        }
        
        // Stop monitoring
        this.stop();
        
        // Alert user
        alert(`🚨 EMERGENCY SYSTEM SHUTDOWN\n\nReason: ${reason}\n\nThe system has been stopped to prevent damage. Please refresh the page.`);
    }
}

// ==========================================
// GLOBAL INITIALIZATION
// ==========================================
window.ChordCubesMonitor = ChordCubesMonitor;

// Auto-start monitoring if in production mode
if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    console.log('[MONITOR] 🚀 Production mode detected - auto-starting monitor');
    window.chordCubesMonitor = new ChordCubesMonitor();
    
    // Start monitoring after page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.chordCubesMonitor.start();
        });
    } else {
        window.chordCubesMonitor.start();
    }
} else {
    console.log('[MONITOR] 🔧 Development mode - manual monitor start required');
}

export { ChordCubesMonitor };
