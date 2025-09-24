/**
 * GALLERY PREVIEW SYSTEM INITIALIZATION FIX
 * Ensures gallery previews work properly even when some systems fail to load
 */

export class GalleryPreviewFix {
    constructor() {
        this.initializationAttempts = 0;
        this.maxAttempts = 10; // Increased from 5 to 10
        this.retryDelay = 1000; // Increased from 500ms to 1000ms
    }

    /**
     * Initialize gallery preview - FAST & SIMPLE approach that works WITH CanvasManager
     */
    async initializeGalleryPreview() {
        // Check if this is a gallery preview
        if (!window.isGalleryPreview || !window.galleryPreviewData) {
            return;
        }

        console.log('🚀 FAST GALLERY PREVIEW: Initializing for', window.galleryPreviewData.system);
        
        // Wait for critical systems to be ready
        await this.waitForCriticalSystems();
        
        // SINGLE system switch - let CanvasManager handle the canvas lifecycle
        const targetSystem = window.galleryPreviewData.system;
        console.log(`🚀 FAST GALLERY PREVIEW: Switching to ${targetSystem} (ONCE)`);
        
        try {
            // Single switch call - CanvasManager will handle everything
            await window.switchSystem(targetSystem);
            console.log(`✅ FAST: ${targetSystem} system ready`);
        } catch (e) {
            console.warn(`❌ FAST: Switch to ${targetSystem} failed, using fallback:`, e.message);
            // Only try fallback if the target system failed
            if (targetSystem !== 'faceted') {
                try {
                    await window.switchSystem('faceted');
                    window.galleryPreviewData.system = 'faceted';
                    console.log('✅ FAST: Fallback to faceted successful');
                } catch (fallbackError) {
                    console.error('❌ FAST: Even fallback failed:', fallbackError.message);
                }
            }
        }
        
        // Apply parameters ONCE after system is ready
        await this.applyParametersFast();
    }

    /**
     * Wait for critical systems - FASTER version
     */
    async waitForCriticalSystems() {
        return new Promise((resolve) => {
            const checkCriticalSystems = () => {
                // Only check for the essentials needed for switchSystem to work
                const hasSwitchSystem = typeof window.switchSystem === 'function';
                const hasCanvasManager = !!window.canvasManager;
                const hasEngineClasses = window.engineClasses && Object.keys(window.engineClasses).length > 0;
                
                const essentialsReady = hasSwitchSystem && hasCanvasManager && hasEngineClasses;
                
                if (essentialsReady) {
                    console.log('🚀 FAST GALLERY PREVIEW: Essential systems ready!');
                    resolve();
                } else if (this.initializationAttempts < 5) { // Reduced max attempts
                    this.initializationAttempts++;
                    console.log(`🚀 FAST: Waiting for essentials... (${this.initializationAttempts}/5)`);
                    console.log(`  - switchSystem: ${hasSwitchSystem ? '✅' : '❌'}`);
                    console.log(`  - canvasManager: ${hasCanvasManager ? '✅' : '❌'}`);
                    console.log(`  - engineClasses: ${hasEngineClasses ? '✅' : '❌'}`);
                    setTimeout(checkCriticalSystems, 500); // Reduced delay
                } else {
                    console.warn('🚀 FAST: Timeout waiting for essentials - proceeding anyway');
                    resolve();
                }
            };
            
            checkCriticalSystems();
        });
    }
    
    /**
     * Check if target system engine is loaded (more lenient check)
     */
    checkTargetSystemEngine(systemName) {
        if (!systemName) return false;
        
        const engineInstances = {
            'faceted': window.engine,
            'quantum': window.quantumEngine,
            'holographic': window.holographicSystem,
            'polychora': window.polychoraSystem
        };
        
        const hasInstance = !!engineInstances[systemName];
        
        // Also check if switchSystem function exists (fallback method)
        const hasSwitchFunction = typeof window.switchSystem === 'function';
        
        // Return true if either the engine exists OR switchSystem is available (it can create engines)
        return hasInstance || hasSwitchFunction;
    }

    /**
     * Check if a system is actually available
     */
    checkSystemAvailability(systemName) {
        console.log(`🎨 GALLERY PREVIEW FIX: Checking ${systemName} system availability...`);
        
        // CRITICAL FIX: Always force switch to faceted for gallery previews if the target system isn't available
        // This prevents infinite parameter loops in gallery previews
        
        // Method 1: Check for actual engine instances (most reliable)
        const engineInstances = {
            'faceted': window.engine,
            'quantum': window.quantumEngine,
            'holographic': window.holographicSystem,
            'polychora': window.polychoraSystem
        };
        
        const hasInstance = !!engineInstances[systemName];
        if (hasInstance) {
            console.log(`✅ ${systemName} available via engine instance`);
            return true;
        }
        
        // Method 2: Check for switchSystem function capability (but only for proven working systems)
        if (window.switchSystem && systemName === 'faceted') {
            // Faceted is always the fallback system and should always work
            console.log(`✅ ${systemName} available via switchSystem (fallback)`);
            return true;
        }
        
        // Method 3: For gallery previews, if the target system isn't available, fall back to faceted
        if (window.isGalleryPreview && systemName !== 'faceted') {
            console.warn(`⚠️ Gallery preview: ${systemName} not available, will fallback to faceted`);
            return false; // This will trigger the fallback logic
        }
        
        console.warn(`❌ ${systemName} system not available`, {
            engineInstance: hasInstance,
            switchSystemExists: !!window.switchSystem,
            isGalleryPreview: window.isGalleryPreview,
            availableInstances: Object.keys(engineInstances).filter(k => engineInstances[k])
        });

        return false;
    }

    /**
     * Apply parameters ENHANCED - handles all 13 parameters including 4D rotations
     */
    async applyParametersFast() {
        const { parameters } = window.galleryPreviewData;
        
        console.log(`🚀 ENHANCED GALLERY PREVIEW: Applying full parameter set`);
        console.log(`🚀 Parameters (${Object.keys(parameters).length}):`, parameters);
        
        // Wait for CanvasManager to finish canvas creation
        await new Promise(resolve => setTimeout(resolve, 100));
        
        try {
            // Update global parameter state with all 13 parameters
            if (window.userParameterState) {
                // Ensure all 13 parameters are included with defaults if missing
                const fullParameters = {
                    variation: 0,
                    geometry: 0,
                    gridDensity: 15,
                    speed: 0.5,
                    chaos: 0.0,
                    morphFactor: 0.0,
                    hue: 0,
                    saturation: 0.8,
                    intensity: 0.5,
                    rot4dXW: 0.0,
                    rot4dYW: 0.0,
                    rot4dZW: 0.0,
                    dimension: 3.2,
                    ...parameters // Override defaults with actual values
                };
                
                Object.assign(window.userParameterState, fullParameters);
                console.log(`🚀 ENHANCED: Global state updated with ${Object.keys(fullParameters).length} parameters`);
            }
            
            // Apply 4D rotation parameters first (critical for spatial positioning)
            const rotationParams = ['rot4dXW', 'rot4dYW', 'rot4dZW'];
            rotationParams.forEach(param => {
                if (parameters[param] !== undefined) {
                    try {
                        if (window.updateParameter) {
                            window.updateParameter(param, parameters[param]);
                            // Safe numeric logging - check if value is a number before using toFixed
                            const value = parameters[param];
                            const displayValue = (typeof value === 'number' && !isNaN(value)) 
                                ? value.toFixed(4) 
                                : value;
                            console.log(`🚀 4D ROTATION: ${param} = ${displayValue}`);
                        }
                    } catch (error) {
                        console.warn(`🚀 4D ROTATION ${param} failed:`, error.message);
                    }
                }
            });
            
            // Apply dimensional parameter (affects projection)
            if (parameters.dimension !== undefined) {
                try {
                    if (window.updateParameter) {
                        window.updateParameter('dimension', parameters.dimension);
                        const value = parameters.dimension;
                        const displayValue = (typeof value === 'number' && !isNaN(value)) 
                            ? value.toFixed(3) 
                            : value;
                        console.log(`🚀 DIMENSION: dimension = ${displayValue}`);
                    }
                } catch (error) {
                    console.warn(`🚀 DIMENSION failed:`, error.message);
                }
            }
            
            // Apply core visual parameters
            const visualParams = ['geometry', 'gridDensity', 'morphFactor', 'chaos', 'speed'];
            visualParams.forEach(param => {
                if (parameters[param] !== undefined) {
                    try {
                        if (window.updateParameter) {
                            window.updateParameter(param, parameters[param]);
                            const value = parameters[param];
                            const displayValue = (typeof value === 'number' && !isNaN(value)) 
                                ? (value % 1 === 0 ? value.toString() : value.toFixed(3))
                                : value;
                            console.log(`🚀 VISUAL: ${param} = ${displayValue}`);
                        }
                    } catch (error) {
                        console.warn(`🚀 VISUAL ${param} failed:`, error.message);
                    }
                }
            });
            
            // Apply color parameters last (visual finalization)
            const colorParams = ['hue', 'saturation', 'intensity'];
            colorParams.forEach(param => {
                if (parameters[param] !== undefined) {
                    try {
                        if (window.updateParameter) {
                            window.updateParameter(param, parameters[param]);
                            const value = parameters[param];
                            const displayValue = (typeof value === 'number' && !isNaN(value)) 
                                ? (value % 1 === 0 ? value.toString() : value.toFixed(3))
                                : value;
                            console.log(`🚀 COLOR: ${param} = ${displayValue}`);
                        }
                    } catch (error) {
                        console.warn(`🚀 COLOR ${param} failed:`, error.message);
                    }
                }
            });
            
            // Apply variation if specified (preset index)
            if (parameters.variation !== undefined) {
                try {
                    if (window.updateParameter) {
                        window.updateParameter('variation', parameters.variation);
                        console.log(`🚀 VARIATION: variation = ${parameters.variation}`);
                    }
                } catch (error) {
                    console.warn(`🚀 VARIATION failed:`, error.message);
                }
            }
            
            console.log('🚀 ENHANCED GALLERY PREVIEW: All parameters applied successfully');
            
            // Update device tilt base rotations if tilt is enabled
            if (window.updateTiltBaseRotations) {
                window.updateTiltBaseRotations();
                console.log('🚀 ENHANCED: Updated device tilt base rotations');
            }
            
        } catch (error) {
            console.error('🚀 ENHANCED: Parameter application error:', error);
        }
    }

    /**
     * Get current engine - simple helper
     */
    
    getCurrentEngine() {
        const system = window.currentSystem;
        switch (system) {
            case 'faceted': return window.engine;
            case 'quantum': return window.quantumEngine;
            case 'holographic': return window.holographicSystem;
            default: return null;
        }
    }

    /**
     * Suppress repetitive warning messages
     */
    suppressWarningSpam() {
        if (!window.originalConsoleWarn) {
            window.originalConsoleWarn = console.warn;
            
            const warningCounts = new Map();
            const maxWarnings = 3;
            
            console.warn = function(...args) {
                const message = args.join(' ');
                
                // Check if this is a repetitive system availability warning
                if (message.includes('System') && message.includes('not available')) {
                    const count = warningCounts.get(message) || 0;
                    
                    if (count < maxWarnings) {
                        warningCounts.set(message, count + 1);
                        window.originalConsoleWarn.apply(console, args);
                        
                        if (count === maxWarnings - 1) {
                            window.originalConsoleWarn('🔇 Suppressing further identical warnings for this session');
                        }
                    }
                } else {
                    // Allow non-repetitive warnings through
                    window.originalConsoleWarn.apply(console, args);
                }
            };
            
            console.log('🔇 Gallery preview warning spam suppression active');
        }
    }
}

// Initialize gallery preview fix if this is a gallery preview
if (typeof window !== 'undefined' && window.location.search.includes('system=')) {
    console.log('🎨 GALLERY PREVIEW FIX: Detected gallery preview mode');
    
    const galleryPreviewFix = new GalleryPreviewFix();
    
    // Suppress warning spam immediately
    galleryPreviewFix.suppressWarningSpam();
    
    // Initialize FAST for gallery previews - minimal delay
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => galleryPreviewFix.initializeGalleryPreview(), 50);
        });
    } else {
        setTimeout(() => galleryPreviewFix.initializeGalleryPreview(), 50);
    }
    
    window.galleryPreviewFix = galleryPreviewFix;
}

console.log('🎨 Gallery Preview Fix: Loaded');