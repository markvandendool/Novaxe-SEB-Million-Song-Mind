/**
 * ChordCubes 5.0 - Production Environment Configuration
 * Military-Grade Production Deployment Environment Setup
 * 
 * Provides:
 * - Environment variable management and validation
 * - CDN optimization with edge caching strategies
 * - Asset compression and minification pipelines  
 * - Caching strategies with intelligent invalidation
 * - Security headers and content security policies
 * - Performance optimization settings
 * - Build pipeline configuration
 * - Environment-specific feature toggles
 */

/**
 * Production Environment Configuration
 */
const PRODUCTION_ENV_CONFIG = {
    // Environment definitions
    environments: {
        development: {
            name: 'Development',
            domain: 'localhost:5173',
            https: false,
            cdn: false,
            minify: false,
            sourceMap: true,
            caching: false,
            analytics: false,
            errorReporting: 'console',
            performance: {
                maxCubes: 50,
                targetFPS: 30,
                qualityLevel: 'medium'
            }
        },

        staging: {
            name: 'Staging',
            domain: 'staging.chordcubes.com',
            https: true,
            cdn: true,
            minify: true,
            sourceMap: true,
            caching: 'aggressive',
            analytics: true,
            errorReporting: 'sentry',
            performance: {
                maxCubes: 150,
                targetFPS: 50,
                qualityLevel: 'high'
            }
        },

        production: {
            name: 'Production',
            domain: 'chordcubes.com',
            https: true,
            cdn: true,
            minify: true,
            sourceMap: false,
            caching: 'aggressive',
            analytics: true,
            errorReporting: 'sentry',
            performance: {
                maxCubes: 250,
                targetFPS: 60,
                qualityLevel: 'ultra'
            }
        }
    },

    // CDN Configuration
    cdn: {
        provider: 'cloudflare',
        endpoints: {
            assets: 'https://cdn.chordcubes.com/assets',
            audio: 'https://cdn.chordcubes.com/audio',
            models: 'https://cdn.chordcubes.com/models',
            textures: 'https://cdn.chordcubes.com/textures'
        },
        caching: {
            assets: {
                maxAge: 31536000, // 1 year
                staleWhileRevalidate: 86400, // 1 day
                browserCache: true,
                edgeCache: true
            },
            audio: {
                maxAge: 2592000, // 30 days
                staleWhileRevalidate: 86400,
                browserCache: true,
                edgeCache: true,
                compressionLevel: 'high'
            },
            api: {
                maxAge: 300, // 5 minutes
                staleWhileRevalidate: 60,
                browserCache: false,
                edgeCache: true
            }
        },
        optimization: {
            imageCompression: 85,
            webpConversion: true,
            brotliCompression: true,
            gzipCompression: true,
            minification: true
        }
    },

    // Security Configuration
    security: {
        contentSecurityPolicy: {
            'default-src': ["'self'"],
            'script-src': [
                "'self'",
                "'unsafe-inline'", // Required for Three.js shaders
                "'unsafe-eval'",   // Required for dynamic code generation
                'https://cdn.chordcubes.com',
                'https://www.google-analytics.com'
            ],
            'style-src': [
                "'self'",
                "'unsafe-inline'", // Required for dynamic styling
                'https://fonts.googleapis.com'
            ],
            'img-src': [
                "'self'",
                'data:',
                'blob:',
                'https://cdn.chordcubes.com'
            ],
            'font-src': [
                "'self'",
                'https://fonts.gstatic.com',
                'https://cdn.chordcubes.com'
            ],
            'connect-src': [
                "'self'",
                'https://api.chordcubes.com',
                'https://analytics.chordcubes.com'
            ],
            'media-src': [
                "'self'",
                'https://cdn.chordcubes.com'
            ],
            'worker-src': [
                "'self'",
                'blob:'
            ]
        },

        headers: {
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
        }
    },

    // Asset Optimization
    assets: {
        compression: {
            images: {
                jpeg: { quality: 85, progressive: true },
                png: { compressionLevel: 6, adaptiveFiltering: true },
                webp: { quality: 80, method: 6 }
            },
            audio: {
                mp3: { bitrate: 192, quality: 2 },
                ogg: { quality: 0.7 },
                aac: { bitrate: 128 }
            },
            models: {
                gltf: { draco: true, meshOptimization: true },
                obj: { compression: true }
            }
        },

        bundling: {
            javascript: {
                minify: true,
                sourceMap: false,
                treeShaking: true,
                codesplitting: true,
                chunkSizeLimit: 500 // KB
            },
            css: {
                minify: true,
                autoprefixer: true,
                purgeUnused: true
            }
        },

        preloading: {
            critical: [
                'main.js',
                'style.css',
                'chordcubes-core.js',
                'three.min.js'
            ],
            important: [
                'audio-manager.js',
                'performance-monitor.js',
                'cube-renderer.js'
            ]
        }
    },

    // Performance Configuration
    performance: {
        webVitals: {
            lcp: 2.5,  // Largest Contentful Paint (seconds)
            fid: 100,  // First Input Delay (ms)
            cls: 0.1   // Cumulative Layout Shift
        },

        monitoring: {
            performanceObserver: true,
            resourceTiming: true,
            navigationTiming: true,
            memoryMonitoring: true
        },

        optimization: {
            lazyLoading: true,
            deferNonCritical: true,
            prefetchNext: true,
            serviceWorker: true
        }
    }
};

/**
 * Production Environment Configuration Manager
 */
class ProductionEnvironmentManager {
    constructor() {
        this.currentEnvironment = 'development';
        this.config = null;
        this.initialized = false;
        this.cdnConfig = null;
        this.securityHeaders = new Map();
        this.performanceMetrics = new Map();

        this.initializeEnvironment();
    }

    /**
     * Initialize production environment
     */
    initializeEnvironment() {
        console.log('[PROD_ENV] Initializing Production Environment Configuration');

        // Detect current environment
        this.detectEnvironment();

        // Load environment-specific configuration
        this.loadEnvironmentConfig();

        // Configure CDN settings
        this.configureCDN();

        // Setup security headers
        this.setupSecurityHeaders();

        // Configure asset optimization
        this.configureAssetOptimization();

        // Initialize performance monitoring
        this.initializePerformanceMonitoring();

        // Setup service worker if in production
        this.setupServiceWorker();

        // Expose global interfaces
        this.exposeGlobalInterfaces();

        this.initialized = true;
        this.logInitialization();
    }

    /**
     * Detect current environment based on hostname and other factors
     */
    detectEnvironment() {
        const hostname = window.location.hostname;
        const port = window.location.port;
        const protocol = window.location.protocol;

        console.log('[PROD_ENV] Detecting environment from:', { hostname, port, protocol });

        // Environment detection logic
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            this.currentEnvironment = 'development';
        } else if (hostname.includes('staging')) {
            this.currentEnvironment = 'staging';
        } else if (hostname.includes('chordcubes.com')) {
            this.currentEnvironment = 'production';
        } else {
            // Check for environment variable or fallback
            this.currentEnvironment = process?.env?.NODE_ENV || 'development';
        }

        console.log(`[PROD_ENV] Environment detected: ${this.currentEnvironment}`);
    }

    /**
     * Load environment-specific configuration
     */
    loadEnvironmentConfig() {
        this.config = PRODUCTION_ENV_CONFIG.environments[this.currentEnvironment];

        if (!this.config) {
            console.error('[PROD_ENV] Unknown environment:', this.currentEnvironment);
            this.config = PRODUCTION_ENV_CONFIG.environments.development;
        }

        console.log('[PROD_ENV] Loaded configuration:', this.config);

        // Apply environment variables
        this.applyEnvironmentVariables();
    }

    /**
     * Apply environment-specific variables to global configuration
     */
    applyEnvironmentVariables() {
        // Performance settings
        if (window.PERFORMANCE_CONFIG) {
            window.PERFORMANCE_CONFIG.maxCubes = this.config.performance.maxCubes;
            window.PERFORMANCE_CONFIG.targetFPS = this.config.performance.targetFPS;
            window.PERFORMANCE_CONFIG.qualityLevel = this.config.performance.qualityLevel;
        }

        // Feature flags based on environment
        if (window.FeatureFlags) {
            window.FeatureFlags.setEnvironment(this.currentEnvironment);
        }

        // Error reporting configuration
        this.configureErrorReporting();

        // Analytics configuration
        this.configureAnalytics();
    }

    /**
     * Configure CDN settings
     */
    configureCDN() {
        if (!this.config.cdn) {
            console.log('[PROD_ENV] CDN disabled for this environment');
            return;
        }

        this.cdnConfig = PRODUCTION_ENV_CONFIG.cdn;

        // Configure asset URLs to use CDN
        this.configureCDNAssetURLs();

        // Setup CDN caching strategies
        this.setupCDNCaching();

        // Configure asset preloading
        this.configureAssetPreloading();

        console.log('[PROD_ENV] CDN configuration applied:', this.cdnConfig);
    }

    /**
     * Configure CDN asset URLs
     */
    configureCDNAssetURLs() {
        const assetBaseURL = this.cdnConfig.endpoints.assets;
        const audioBaseURL = this.cdnConfig.endpoints.audio;
        const modelsBaseURL = this.cdnConfig.endpoints.models;

        // Override asset loading functions to use CDN
        window.getAssetURL = (path) => {
            if (path.includes('audio/')) {
                return `${audioBaseURL}/${path.replace('audio/', '')}`;
            } else if (path.includes('models/')) {
                return `${modelsBaseURL}/${path.replace('models/', '')}`;
            } else {
                return `${assetBaseURL}/${path}`;
            }
        };

        // Configure Three.js asset loading
        if (window.THREE && window.THREE.DefaultLoadingManager) {
            const originalLoad = window.THREE.DefaultLoadingManager.resolveURL;
            window.THREE.DefaultLoadingManager.resolveURL = (url) => {
                if (url.startsWith('http')) {
                    return url; // Already absolute URL
                }
                return window.getAssetURL(url);
            };
        }
    }

    /**
     * Setup CDN caching strategies
     */
    setupCDNCaching() {
        // Configure fetch interceptor for caching headers
        if ('serviceWorker' in navigator && this.currentEnvironment === 'production') {
            this.setupAdvancedCaching();
        }

        // Configure browser caching hints
        this.configureBrowserCaching();
    }

    /**
     * Configure asset preloading
     */
    configureAssetPreloading() {
        const preloadConfig = PRODUCTION_ENV_CONFIG.assets.preloading;

        // Preload critical assets
        this.preloadAssets(preloadConfig.critical, 'high');

        // Preload important assets
        setTimeout(() => {
            this.preloadAssets(preloadConfig.important, 'medium');
        }, 2000);
    }

    /**
     * Preload specified assets
     */
    preloadAssets(assetList, priority) {
        assetList.forEach(asset => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = window.getAssetURL ? window.getAssetURL(asset) : asset;

            // Determine asset type
            if (asset.endsWith('.js')) {
                link.as = 'script';
            } else if (asset.endsWith('.css')) {
                link.as = 'style';
            } else if (asset.match(/\.(jpg|jpeg|png|webp)$/)) {
                link.as = 'image';
            } else if (asset.match(/\.(mp3|ogg|wav)$/)) {
                link.as = 'audio';
            }

            // Set priority
            if (link.as) {
                link.fetchPriority = priority;
            }

            document.head.appendChild(link);
        });

        console.log(`[PROD_ENV] Preloaded ${assetList.length} ${priority} priority assets`);
    }

    /**
     * Setup security headers
     */
    setupSecurityHeaders() {
        const securityConfig = PRODUCTION_ENV_CONFIG.security;

        // Configure Content Security Policy
        this.setupContentSecurityPolicy(securityConfig.contentSecurityPolicy);

        // Configure other security headers (would be handled by server)
        this.configureSecurityHeaders(securityConfig.headers);

        // Setup client-side security measures
        this.setupClientSideSecurity();

        console.log('[PROD_ENV] Security configuration applied');
    }

    /**
     * Setup Content Security Policy
     */
    setupContentSecurityPolicy(cspConfig) {
        // Generate CSP string
        const cspDirectives = Object.entries(cspConfig).map(([directive, sources]) => {
            return `${directive} ${sources.join(' ')}`;
        }).join('; ');

        // Apply CSP via meta tag (backup - should be in server headers)
        let cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        if (!cspMeta) {
            cspMeta = document.createElement('meta');
            cspMeta.httpEquiv = 'Content-Security-Policy';
            document.head.appendChild(cspMeta);
        }
        cspMeta.content = cspDirectives;

        console.log('[PROD_ENV] CSP configured:', cspDirectives);
    }

    /**
     * Configure security headers (informational - handled by server)
     */
    configureSecurityHeaders(headers) {
        // Store header configuration for server implementation
        Object.entries(headers).forEach(([header, value]) => {
            this.securityHeaders.set(header, value);
        });

        // Log expected headers for server configuration
        console.log('[PROD_ENV] Security headers to be configured on server:', headers);
    }

    /**
     * Setup client-side security measures
     */
    setupClientSideSecurity() {
        // Disable right-click context menu in production
        if (this.currentEnvironment === 'production') {
            document.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                return false;
            });
        }

        // Disable developer tools detection (basic)
        if (this.currentEnvironment === 'production') {
            this.setupDevToolsDetection();
        }

        // Setup input validation for user interactions
        this.setupInputValidation();
    }

    /**
     * Setup developer tools detection (basic deterrent)
     */
    setupDevToolsDetection() {
        let devtools = { open: false, orientation: null };

        setInterval(() => {
            if (window.outerHeight - window.innerHeight > 160) {
                devtools.open = true;
                devtools.orientation = 'horizontal';
                console.warn('[PROD_ENV] Developer tools detected');
            } else if (window.outerWidth - window.innerWidth > 160) {
                devtools.open = true;
                devtools.orientation = 'vertical';
                console.warn('[PROD_ENV] Developer tools detected');
            } else {
                devtools.open = false;
                devtools.orientation = null;
            }
        }, 1000);
    }

    /**
     * Configure asset optimization
     */
    configureAssetOptimization() {
        const assetConfig = PRODUCTION_ENV_CONFIG.assets;

        // Configure image optimization
        this.configureImageOptimization(assetConfig.compression.images);

        // Configure audio optimization
        this.configureAudioOptimization(assetConfig.compression.audio);

        // Configure JavaScript bundling
        this.configureJavaScriptOptimization(assetConfig.bundling.javascript);

        console.log('[PROD_ENV] Asset optimization configured');
    }

    /**
     * Configure image optimization
     */
    configureImageOptimization(imageConfig) {
        // Override image loading to prefer optimized formats
        const originalCreateImage = () => new Image();

        window.createOptimizedImage = (src, callback) => {
            // Check for WebP support
            if (this.supportsWebP()) {
                const webpSrc = src.replace(/\.(jpg|jpeg|png)$/, '.webp');
                const img = originalCreateImage();

                img.onload = () => callback(img);
                img.onerror = () => {
                    // Fallback to original format
                    const fallbackImg = originalCreateImage();
                    fallbackImg.onload = () => callback(fallbackImg);
                    fallbackImg.onerror = () => callback(null);
                    fallbackImg.src = src;
                };
                img.src = webpSrc;
            } else {
                const img = originalCreateImage();
                img.onload = () => callback(img);
                img.onerror = () => callback(null);
                img.src = src;
            }
        };
    }

    /**
     * Configure audio optimization
     */
    configureAudioOptimization(audioConfig) {
        // Configure audio loading preferences
        window.getOptimizedAudioFormat = () => {
            // Check browser support for different formats
            const audio = document.createElement('audio');

            if (audio.canPlayType('audio/ogg')) {
                return 'ogg';
            } else if (audio.canPlayType('audio/mpeg')) {
                return 'mp3';
            } else if (audio.canPlayType('audio/aac')) {
                return 'aac';
            }

            return 'mp3'; // Fallback
        };
    }

    /**
     * Configure JavaScript optimization
     */
    configureJavaScriptOptimization(jsConfig) {
        // Configure dynamic imports for code splitting
        if (jsConfig.codesplitting) {
            window.loadModule = async (moduleName) => {
                try {
                    const module = await import(`./modules/${moduleName}.js`);
                    return module;
                } catch (error) {
                    console.error(`[PROD_ENV] Failed to load module ${moduleName}:`, error);
                    return null;
                }
            };
        }

        // Configure chunk loading optimization
        if (jsConfig.chunkSizeLimit) {
            console.log(`[PROD_ENV] Chunk size limit: ${jsConfig.chunkSizeLimit}KB`);
        }
    }

    /**
     * Initialize performance monitoring
     */
    initializePerformanceMonitoring() {
        const perfConfig = PRODUCTION_ENV_CONFIG.performance;

        // Setup Web Vitals monitoring
        this.setupWebVitalsMonitoring(perfConfig.webVitals);

        // Setup performance observers
        this.setupPerformanceObservers(perfConfig.monitoring);

        // Configure performance optimization
        this.configurePerformanceOptimization(perfConfig.optimization);

        console.log('[PROD_ENV] Performance monitoring initialized');
    }

    /**
     * Setup Web Vitals monitoring
     */
    setupWebVitalsMonitoring(vitalsConfig) {
        // Largest Contentful Paint (LCP)
        this.observePerformanceMetric('largest-contentful-paint', (entries) => {
            const lcp = entries[entries.length - 1];
            const lcpTime = lcp.startTime / 1000; // Convert to seconds

            this.performanceMetrics.set('lcp', lcpTime);

            if (lcpTime > vitalsConfig.lcp) {
                console.warn(`[PROD_ENV] LCP exceeded target: ${lcpTime}s > ${vitalsConfig.lcp}s`);
            }
        });

        // First Input Delay (FID)
        this.observePerformanceMetric('first-input', (entries) => {
            const fid = entries[0];
            const fidTime = fid.processingStart - fid.startTime;

            this.performanceMetrics.set('fid', fidTime);

            if (fidTime > vitalsConfig.fid) {
                console.warn(`[PROD_ENV] FID exceeded target: ${fidTime}ms > ${vitalsConfig.fid}ms`);
            }
        });

        // Cumulative Layout Shift (CLS)
        this.observePerformanceMetric('layout-shift', (entries) => {
            let clsScore = 0;

            entries.forEach(entry => {
                if (!entry.hadRecentInput) {
                    clsScore += entry.value;
                }
            });

            this.performanceMetrics.set('cls', clsScore);

            if (clsScore > vitalsConfig.cls) {
                console.warn(`[PROD_ENV] CLS exceeded target: ${clsScore} > ${vitalsConfig.cls}`);
            }
        });
    }

    /**
     * Observe performance metrics
     */
    observePerformanceMetric(entryType, callback) {
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    callback(list.getEntries());
                });
                observer.observe({ entryTypes: [entryType] });
            } catch (error) {
                console.warn(`[PROD_ENV] Could not observe ${entryType}:`, error);
            }
        }
    }

    /**
     * Setup service worker for advanced caching
     */
    setupServiceWorker() {
        if (this.currentEnvironment !== 'production' || !('serviceWorker' in navigator)) {
            return;
        }

        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('[PROD_ENV] Service Worker registered:', registration);

                // Update service worker when new version available
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed') {
                            console.log('[PROD_ENV] New Service Worker available');
                            // Could show update notification to user
                        }
                    });
                });
            })
            .catch((error) => {
                console.error('[PROD_ENV] Service Worker registration failed:', error);
            });
    }

    /**
     * Configure error reporting
     */
    configureErrorReporting() {
        if (this.config.errorReporting === 'sentry') {
            // Configure Sentry (would require Sentry SDK)
            console.log('[PROD_ENV] Error reporting configured: Sentry');

            // Setup global error handlers
            window.addEventListener('error', (event) => {
                this.reportError('javascript', event.error, {
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno
                });
            });

            window.addEventListener('unhandledrejection', (event) => {
                this.reportError('promise', event.reason, {
                    promise: event.promise
                });
            });
        }
    }

    /**
     * Configure analytics
     */
    configureAnalytics() {
        if (!this.config.analytics) {
            return;
        }

        // Configure Google Analytics or similar
        console.log('[PROD_ENV] Analytics configured for:', this.currentEnvironment);

        // Track page views, user interactions, performance metrics
        this.setupAnalyticsTracking();
    }

    /**
     * Setup analytics tracking
     */
    setupAnalyticsTracking() {
        // Track application initialization
        this.trackEvent('app_init', {
            environment: this.currentEnvironment,
            performance_level: this.config.performance.qualityLevel,
            max_cubes: this.config.performance.maxCubes
        });

        // Track performance metrics periodically
        setInterval(() => {
            if (this.performanceMetrics.size > 0) {
                const metrics = Object.fromEntries(this.performanceMetrics);
                this.trackEvent('performance_metrics', metrics);
            }
        }, 30000); // Every 30 seconds
    }

    /**
     * Track analytics event
     */
    trackEvent(eventName, properties) {
        // This would integrate with actual analytics service
        console.log(`[ANALYTICS] ${eventName}:`, properties);

        // Example Google Analytics integration:
        // gtag('event', eventName, properties);
    }

    /**
     * Report error to configured service
     */
    reportError(type, error, context) {
        const errorReport = {
            type,
            message: error?.message || error,
            stack: error?.stack,
            context,
            environment: this.currentEnvironment,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        console.error('[PROD_ENV] Error reported:', errorReport);

        // Send to error reporting service
        // Example: Sentry.captureException(error, { contexts: { app: context } });
    }

    /**
     * Utility functions
     */
    supportsWebP() {
        if (!this._webpSupport) {
            const canvas = document.createElement('canvas');
            canvas.width = 1;
            canvas.height = 1;
            this._webpSupport = canvas.toDataURL('image/webp').startsWith('data:image/webp');
        }
        return this._webpSupport;
    }

    configureBrowserCaching() {
        // Configure fetch to include appropriate cache headers
        const originalFetch = window.fetch;

        window.fetch = (input, init = {}) => {
            // Add cache headers based on resource type
            if (typeof input === 'string') {
                if (input.includes('/api/')) {
                    init.cache = 'no-cache';
                } else if (input.match(/\.(js|css|png|jpg|jpeg|gif|webp|svg|woff|woff2)$/)) {
                    init.cache = 'force-cache';
                }
            }

            return originalFetch(input, init);
        };
    }

    setupInputValidation() {
        // Basic input validation for user interactions
        document.addEventListener('input', (event) => {
            const target = event.target;

            // Validate input lengths
            if (target.value && target.value.length > 1000) {
                console.warn('[PROD_ENV] Input exceeds maximum length');
                target.value = target.value.substring(0, 1000);
            }

            // Basic XSS prevention
            if (target.value && /<script|javascript:|data:/i.test(target.value)) {
                console.warn('[PROD_ENV] Potentially malicious input detected');
                target.value = target.value.replace(/<script|javascript:|data:/gi, '');
            }
        });
    }

    setupAdvancedCaching() {
        // Configure advanced caching strategies via service worker
        // This would be implemented in the service worker file
        console.log('[PROD_ENV] Advanced caching configured via Service Worker');
    }

    setupPerformanceObservers(monitoringConfig) {
        // Setup various performance observers
        if (monitoringConfig.resourceTiming && 'PerformanceObserver' in window) {
            const resourceObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    if (entry.duration > 1000) { // Resources taking >1s
                        console.warn('[PROD_ENV] Slow resource:', entry.name, entry.duration + 'ms');
                    }
                });
            });
            resourceObserver.observe({ entryTypes: ['resource'] });
        }

        if (monitoringConfig.memoryMonitoring && performance.memory) {
            setInterval(() => {
                const memory = performance.memory;
                if (memory.usedJSHeapSize > 50 * 1024 * 1024) { // >50MB
                    console.warn('[PROD_ENV] High memory usage:', memory.usedJSHeapSize / 1024 / 1024 + 'MB');
                }
            }, 10000);
        }
    }

    configurePerformanceOptimization(optimizationConfig) {
        // Configure lazy loading
        if (optimizationConfig.lazyLoading) {
            this.setupLazyLoading();
        }

        // Configure resource prefetching
        if (optimizationConfig.prefetchNext) {
            this.setupResourcePrefetching();
        }
    }

    setupLazyLoading() {
        // Setup intersection observer for lazy loading
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            imageObserver.unobserve(img);
                        }
                    }
                });
            });

            // Observe all images with data-src
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    setupResourcePrefetching() {
        // Setup intelligent resource prefetching
        setTimeout(() => {
            const importantResources = [
                'audio/piano-c.mp3',
                'models/cube-high-poly.gltf',
                'textures/cube-material.jpg'
            ];

            importantResources.forEach(resource => {
                const link = document.createElement('link');
                link.rel = 'prefetch';
                link.href = window.getAssetURL ? window.getAssetURL(resource) : resource;
                document.head.appendChild(link);
            });
        }, 5000);
    }

    /**
     * Expose global interfaces
     */
    exposeGlobalInterfaces() {
        window.productionEnvironment = this;
        window.getEnvironmentConfig = () => this.config;
        window.isProduction = () => this.currentEnvironment === 'production';
        window.getPerformanceMetrics = () => Object.fromEntries(this.performanceMetrics);

        // Utility functions
        window.optimizeAsset = (path) => window.getAssetURL ? window.getAssetURL(path) : path;
        window.reportPerformanceIssue = (issue) => this.reportError('performance', issue, {});
    }

    /**
     * Get current configuration
     */
    getConfiguration() {
        return {
            environment: this.currentEnvironment,
            config: this.config,
            cdnConfig: this.cdnConfig,
            securityHeaders: Object.fromEntries(this.securityHeaders),
            performanceMetrics: Object.fromEntries(this.performanceMetrics),
            initialized: this.initialized
        };
    }

    /**
     * Update environment configuration (for dynamic updates)
     */
    updateConfiguration(updates) {
        Object.assign(this.config, updates);
        console.log('[PROD_ENV] Configuration updated:', updates);

        // Re-apply relevant configurations
        this.applyEnvironmentVariables();
    }

    /**
     * Log initialization
     */
    logInitialization() {
        console.log('[PROD_ENV] =====================================');
        console.log('[PROD_ENV] 🏭 Production Environment Ready');
        console.log('[PROD_ENV] Environment:', this.currentEnvironment);
        console.log('[PROD_ENV] Domain:', this.config.domain);
        console.log('[PROD_ENV] HTTPS:', this.config.https);
        console.log('[PROD_ENV] CDN:', this.config.cdn);
        console.log('[PROD_ENV] Performance Target:');
        console.log('[PROD_ENV]   - Max Cubes:', this.config.performance.maxCubes);
        console.log('[PROD_ENV]   - Target FPS:', this.config.performance.targetFPS);
        console.log('[PROD_ENV]   - Quality Level:', this.config.performance.qualityLevel);
        console.log('[PROD_ENV] Security: Headers + CSP configured');
        console.log('[PROD_ENV] Asset Optimization: Active');
        console.log('[PROD_ENV] Performance Monitoring: Active');
        console.log('[PROD_ENV] =====================================');
    }

    /**
     * Cleanup resources
     */
    destroy() {
        this.performanceMetrics.clear();
        this.securityHeaders.clear();

        console.log('[PROD_ENV] Production environment manager destroyed');
    }
}

// Global production environment utilities
const ProductionEnvironment = {
    manager: null,

    initialize() {
        if (!this.manager) {
            this.manager = new ProductionEnvironmentManager();

            // Global utilities
            window.reloadEnvironmentConfig = () => this.manager.loadEnvironmentConfig();
            window.getEnvironmentInfo = () => this.manager.getConfiguration();
            window.updateEnvironmentConfig = (updates) => this.manager.updateConfiguration(updates);

            console.log('🏭 Production Environment Manager ready!');
        }
        return this.manager;
    },

    getConfig() {
        return this.manager ? this.manager.getConfiguration() : null;
    },

    isProduction() {
        return this.manager && this.manager.currentEnvironment === 'production';
    }
};

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
    const initializeProductionEnvironment = () => {
        ProductionEnvironment.initialize();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeProductionEnvironment);
    } else {
        setTimeout(initializeProductionEnvironment, 1000);
    }
}

export { ProductionEnvironmentManager, ProductionEnvironment };
