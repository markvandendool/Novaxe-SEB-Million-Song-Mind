// ============================================
// 🎵 UNIFIED AUDIO CONTEXT MANAGER
// ============================================
// Claude's solution to eliminate AudioContext race conditions
// Military-grade singleton pattern with emergency failsafes

class UnifiedAudioContextManager {
    constructor() {
        if (UnifiedAudioContextManager.instance) {
            console.log('[AUDIO] ✅ Returning existing UnifiedAudioContextManager instance');
            return UnifiedAudioContextManager.instance;
        }

        console.log('[AUDIO] 🚀 Creating new UnifiedAudioContextManager singleton');
        
        this.audioContext = null;
        this.toneInitialized = false;
        this.webAudioFontInitialized = false;
        this.initializationPromise = null;
        this.initializationState = 'idle'; // idle, initializing, success, failed
        this.lastError = null;
        
        // Track all audio sources for emergency shutdown
        this.activeSources = new Set();
        this.audioWorklets = new Set();
        this.scheduledEvents = new Set();
        
        // Revolutionary Audio Cutoff System compatibility
        this.revolutionaryAudioCutoffEnabled = true;
        this.emergencyShutdownCallbacks = [];
        
        // Performance metrics
        this.metrics = {
            contextSwitches: 0,
            initializationAttempts: 0,
            emergencyShutdowns: 0,
            lastInitTime: 0
        };

        UnifiedAudioContextManager.instance = this;
        
        // Bind methods to prevent context loss
        this.ensureAudioContext = this.ensureAudioContext.bind(this);
        this.emergencyShutdown = this.emergencyShutdown.bind(this);
        this.registerAudioSource = this.registerAudioSource.bind(this);
        this.unregisterAudioSource = this.unregisterAudioSource.bind(this);
        
        console.log('[AUDIO] ✅ UnifiedAudioContextManager singleton created');
    }

    // ==========================================
    // AUDIO CONTEXT INITIALIZATION
    // ==========================================
    async ensureAudioContext(forceRestart = false) {
        console.log(`[AUDIO] 🎵 ensureAudioContext called (forceRestart: ${forceRestart})`);
        
        this.metrics.initializationAttempts++;
        
        // Return existing promise if already initializing
        if (this.initializationState === 'initializing' && this.initializationPromise) {
            console.log('[AUDIO] ⏳ AudioContext initialization in progress, waiting...');
            return this.initializationPromise;
        }
        
        // Return success if already initialized (unless force restart)
        if (this.initializationState === 'success' && !forceRestart) {
            console.log('[AUDIO] ✅ AudioContext already initialized');
            return {
                success: true,
                audioContext: this.audioContext,
                toneContext: window.Tone?.context
            };
        }

        // Create initialization promise
        this.initializationState = 'initializing';
        this.initializationPromise = this._initializeAudioSystems(forceRestart);
        
        return this.initializationPromise;
    }

    async _initializeAudioSystems(forceRestart = false) {
        const startTime = performance.now();
        console.log('[AUDIO] 🚀 Starting unified audio system initialization...');
        
        try {
            // Step 1: Clean up existing contexts if force restart
            if (forceRestart) {
                await this._cleanupExistingContexts();
            }

            // Step 2: Initialize or verify AudioContext
            await this._initializeBaseAudioContext();
            
            // Step 3: Initialize Tone.js with our context
            await this._initializeToneJS();
            
            // Step 4: Initialize WebAudioFont compatibility
            await this._initializeWebAudioFont();
            
            // Step 5: Verify everything is working
            const verification = await this._verifyAudioSystems();
            
            if (!verification.success) {
                throw new Error(`Audio verification failed: ${verification.error}`);
            }
            
            this.metrics.lastInitTime = performance.now() - startTime;
            this.initializationState = 'success';
            this.lastError = null;
            
            console.log(`[AUDIO] ✅ Unified audio system initialized successfully (${this.metrics.lastInitTime.toFixed(2)}ms)`);
            
            return {
                success: true,
                audioContext: this.audioContext,
                toneContext: window.Tone?.context,
                initTime: this.metrics.lastInitTime,
                metrics: { ...this.metrics }
            };
            
        } catch (error) {
            this.initializationState = 'failed';
            this.lastError = error;
            this.initializationPromise = null;
            
            console.error('[AUDIO] ❌ Audio system initialization failed:', error);
            
            return {
                success: false,
                error: error.message,
                lastError: this.lastError,
                metrics: { ...this.metrics }
            };
        }
    }

    async _cleanupExistingContexts() {
        console.log('[AUDIO] 🧹 Cleaning up existing audio contexts...');
        
        // Stop Tone.js transport
        if (window.Tone && window.Tone.Transport) {
            window.Tone.Transport.stop();
            window.Tone.Transport.cancel();
            console.log('[AUDIO] 🛑 Tone.js transport stopped');
        }
        
        // Close existing AudioContext
        if (this.audioContext && this.audioContext.state !== 'closed') {
            try {
                await this.audioContext.close();
                console.log('[AUDIO] 🛑 Previous AudioContext closed');
            } catch (error) {
                console.warn('[AUDIO] ⚠️ Error closing AudioContext:', error);
            }
        }
        
        // Clear tracking
        this.audioContext = null;
        this.toneInitialized = false;
        this.webAudioFontInitialized = false;
        this.activeSources.clear();
        this.audioWorklets.clear();
        this.scheduledEvents.clear();
    }

    async _initializeBaseAudioContext() {
        console.log('[AUDIO] 🎵 Initializing base AudioContext...');
        
        if (!this.audioContext || this.audioContext.state === 'closed') {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            
            if (!AudioContextClass) {
                throw new Error('AudioContext not supported in this browser');
            }
            
            this.audioContext = new AudioContextClass({
                latencyHint: 'interactive',
                sampleRate: 44100
            });
            
            console.log('[AUDIO] ✅ New AudioContext created');
        }
        
        // Ensure context is running
        if (this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
                console.log('[AUDIO] ✅ AudioContext resumed');
            } catch (error) {
                console.warn('[AUDIO] ⚠️ AudioContext resume failed:', error);
                // Continue - might work anyway
            }
        }
        
        // Verify context is usable
        if (this.audioContext.state === 'closed') {
            throw new Error('AudioContext is closed and cannot be used');
        }
        
        console.log(`[AUDIO] ✅ AudioContext ready (state: ${this.audioContext.state}, sampleRate: ${this.audioContext.sampleRate})`);
    }

    async _initializeToneJS() {
        console.log('[AUDIO] 🎼 Initializing Tone.js integration...');
        
        if (!window.Tone) {
            console.warn('[AUDIO] ⚠️ Tone.js not loaded yet, skipping Tone initialization');
            return;
        }
        
        try {
            // Set Tone.js to use our AudioContext
            if (window.Tone.setContext) {
                window.Tone.setContext(this.audioContext);
                console.log('[AUDIO] ✅ Tone.js context set to unified AudioContext');
            }
            
            // Start Tone.js if needed
            if (window.Tone.context.state !== 'running') {
                await window.Tone.start();
                console.log('[AUDIO] ✅ Tone.js started');
            }
            
            // Verify Tone.js is using our context
            const toneContextMatches = window.Tone.context === this.audioContext || 
                                     window.Tone.context.rawContext === this.audioContext;
            
            if (toneContextMatches) {
                console.log('[AUDIO] ✅ Tone.js successfully unified with our AudioContext');
            } else {
                console.warn('[AUDIO] ⚠️ Tone.js context mismatch - this may cause issues');
            }
            
            this.toneInitialized = true;
            
        } catch (error) {
            console.error('[AUDIO] ❌ Tone.js initialization failed:', error);
            // Don't throw - system can work without Tone.js
        }
    }

    async _initializeWebAudioFont() {
        console.log('[AUDIO] 🎹 Initializing WebAudioFont compatibility...');
        
        // WebAudioFont expects global AudioContext variable
        if (window.AudioContext && !window.AudioContext._unifiedManager) {
            // Mark that we've taken control
            window.AudioContext._unifiedManager = true;
            
            // Store original constructor
            const OriginalAudioContext = window.AudioContext;
            
            // Override AudioContext constructor to return our singleton
            window.AudioContext = () => {
                console.log('[AUDIO] 🎵 WebAudioFont requesting AudioContext - returning unified instance');
                return this.audioContext;
            };
            
            // Copy static methods
            Object.setPrototypeOf(window.AudioContext, OriginalAudioContext);
            
            console.log('[AUDIO] ✅ WebAudioFont integration prepared');
        }
        
        this.webAudioFontInitialized = true;
    }

    async _verifyAudioSystems() {
        console.log('[AUDIO] 🔍 Verifying audio system integrity...');
        
        const results = {
            success: true,
            audioContext: false,
            toneJs: false,
            webAudioFont: false,
            errors: []
        };
        
        // Test AudioContext
        try {
            if (this.audioContext && this.audioContext.state === 'running') {
                // Create a test oscillator
                const testOsc = this.audioContext.createOscillator();
                const testGain = this.audioContext.createGain();
                testGain.gain.value = 0; // Silent test
                testOsc.connect(testGain);
                testGain.connect(this.audioContext.destination);
                testOsc.start(this.audioContext.currentTime);
                testOsc.stop(this.audioContext.currentTime + 0.001);
                
                results.audioContext = true;
                console.log('[AUDIO] ✅ AudioContext verification passed');
            } else {
                results.errors.push('AudioContext not running');
            }
        } catch (error) {
            results.errors.push(`AudioContext test failed: ${error.message}`);
        }
        
        // Test Tone.js
        if (window.Tone && this.toneInitialized) {
            try {
                if (window.Tone.context.state === 'running') {
                    results.toneJs = true;
                    console.log('[AUDIO] ✅ Tone.js verification passed');
                } else {
                    results.errors.push('Tone.js context not running');
                }
            } catch (error) {
                results.errors.push(`Tone.js test failed: ${error.message}`);
            }
        }
        
        // WebAudioFont is passive, just mark as ready
        results.webAudioFont = this.webAudioFontInitialized;
        
        if (results.errors.length > 0) {
            results.success = false;
            results.error = results.errors.join('; ');
        }
        
        console.log('[AUDIO] 🔍 Verification results:', results);
        return results;
    }

    // ==========================================
    // REVOLUTIONARY AUDIO CUTOFF SYSTEM
    // ==========================================
    async revolutionaryAudioCutoff() {
        if (!this.revolutionaryAudioCutoffEnabled) {
            console.log('[AUDIO] ⚠️ Revolutionary Audio Cutoff disabled');
            return false;
        }
        
        console.log('[AUDIO] 🛑 REVOLUTIONARY AUDIO CUTOFF ACTIVATED');
        
        try {
            // Stop all tracked audio sources
            this.activeSources.forEach(source => {
                try {
                    if (source.stop) source.stop();
                    if (source.disconnect) source.disconnect();
                } catch (error) {
                    console.warn('[AUDIO] ⚠️ Error stopping audio source:', error);
                }
            });
            
            // Stop Tone.js
            if (window.Tone && window.Tone.Transport) {
                window.Tone.Transport.stop();
                window.Tone.Transport.cancel();
            }
            
            // Stop all scheduled events
            this.scheduledEvents.forEach(eventId => {
                try {
                    clearTimeout(eventId);
                } catch (error) {
                    // Ignore
                }
            });
            
            // Suspend AudioContext (keeps it alive for restart)
            if (this.audioContext && this.audioContext.state === 'running') {
                await this.audioContext.suspend();
                console.log('[AUDIO] ✅ AudioContext suspended');
            }
            
            // Clear tracking sets
            this.activeSources.clear();
            this.scheduledEvents.clear();
            
            console.log('[AUDIO] ✅ Revolutionary Audio Cutoff complete');
            return true;
            
        } catch (error) {
            console.error('[AUDIO] ❌ Revolutionary Audio Cutoff failed:', error);
            return false;
        }
    }

    async restartAfterCutoff() {
        console.log('[AUDIO] 🔄 Restarting audio after Revolutionary Cutoff...');
        
        if (this.audioContext && this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
                console.log('[AUDIO] ✅ AudioContext resumed after cutoff');
                
                if (window.Tone && window.Tone.context.state === 'suspended') {
                    await window.Tone.start();
                    console.log('[AUDIO] ✅ Tone.js restarted after cutoff');
                }
                
                return true;
            } catch (error) {
                console.error('[AUDIO] ❌ Restart after cutoff failed:', error);
                return false;
            }
        }
        
        return false;
    }

    // ==========================================
    // RESOURCE MANAGEMENT
    // ==========================================
    registerAudioSource(source, type = 'unknown') {
        this.activeSources.add(source);
        console.log(`[AUDIO] 📝 Registered ${type} audio source (${this.activeSources.size} total)`);
    }

    unregisterAudioSource(source) {
        if (this.activeSources.delete(source)) {
            console.log(`[AUDIO] 🗑️ Unregistered audio source (${this.activeSources.size} remaining)`);
        }
    }

    scheduleEvent(callback, delay, ...args) {
        const timeoutId = setTimeout(() => {
            this.scheduledEvents.delete(timeoutId);
            callback(...args);
        }, delay);
        
        this.scheduledEvents.add(timeoutId);
        return timeoutId;
    }

    cancelScheduledEvent(eventId) {
        if (this.scheduledEvents.has(eventId)) {
            clearTimeout(eventId);
            this.scheduledEvents.delete(eventId);
            return true;
        }
        return false;
    }

    // ==========================================
    // EMERGENCY SYSTEMS
    // ==========================================
    async emergencyShutdown(reason = 'Unknown emergency') {
        console.error(`[AUDIO] 🚨 EMERGENCY AUDIO SHUTDOWN: ${reason}`);
        
        this.metrics.emergencyShutdowns++;
        
        try {
            // Execute registered callbacks
            for (const callback of this.emergencyShutdownCallbacks) {
                try {
                    callback(reason);
                } catch (error) {
                    console.error('[AUDIO] ❌ Emergency callback failed:', error);
                }
            }
            
            // Revolutionary cutoff
            await this.revolutionaryAudioCutoff();
            
            // Close context completely
            if (this.audioContext && this.audioContext.state !== 'closed') {
                await this.audioContext.close();
                this.audioContext = null;
            }
            
            // Reset state
            this.initializationState = 'idle';
            this.toneInitialized = false;
            this.webAudioFontInitialized = false;
            
            console.log('[AUDIO] ✅ Emergency shutdown complete');
            return true;
            
        } catch (error) {
            console.error('[AUDIO] ❌ Emergency shutdown failed:', error);
            return false;
        }
    }

    addEmergencyShutdownCallback(callback) {
        this.emergencyShutdownCallbacks.push(callback);
    }

    // ==========================================
    // PUBLIC API
    // ==========================================
    getAudioContext() {
        return this.audioContext;
    }

    getToneContext() {
        return window.Tone?.context;
    }

    getState() {
        return {
            initializationState: this.initializationState,
            audioContextState: this.audioContext?.state,
            toneInitialized: this.toneInitialized,
            webAudioFontInitialized: this.webAudioFontInitialized,
            activeSources: this.activeSources.size,
            scheduledEvents: this.scheduledEvents.size,
            metrics: { ...this.metrics },
            lastError: this.lastError
        };
    }

    async healthCheck() {
        const state = this.getState();
        const isHealthy = state.initializationState === 'success' && 
                         state.audioContextState === 'running';
        
        return {
            healthy: isHealthy,
            ...state
        };
    }
}

// ==========================================
// GLOBAL SINGLETON INSTANCE
// ==========================================
console.log('[AUDIO] 🎵 Initializing UnifiedAudioContextManager...');
const unifiedAudioManager = new UnifiedAudioContextManager();

// Expose globally for compatibility
window.unifiedAudioManager = unifiedAudioManager;
window.UnifiedAudioContextManager = UnifiedAudioContextManager;

// Hook into existing systems
if (window.chordCubesTransport) {
    // Upgrade transport with unified audio
    const originalEnsureAudioContext = window.chordCubesTransport.ensureAudioContext;
    window.chordCubesTransport.ensureAudioContext = async function() {
        console.log('[TRANSPORT] 🔗 Using UnifiedAudioContextManager for audio initialization');
        return unifiedAudioManager.ensureAudioContext();
    };
    
    console.log('[AUDIO] ✅ Transport bridge updated to use UnifiedAudioContextManager');
}

export { UnifiedAudioContextManager, unifiedAudioManager };
