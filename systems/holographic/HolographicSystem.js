/**
 * VIB34D Holographic System - Complete modular implementation
 * ULTRA PRESERVATION: Every visual effect, audio reactivity, pink/magenta theme, and interaction preserved EXACTLY
 */

export class HolographicSystem {
    constructor() {
        this.name = 'holographic';
        this.isActive = false;
        this.isInitialized = false;
        
        // Canvas management - EXACT same IDs as index.html
        this.canvasIds = [
            'holo-background-canvas',
            'holo-shadow-canvas', 
            'holo-content-canvas',
            'holo-highlight-canvas',
            'holo-accent-canvas'
        ];
        
        // Engine and UI components
        this.engine = null;
        this.visualizers = [];
        this.parameters = new Map();
        
        // CRITICAL: Holographic system uses variant names instead of simple geometry
        this.variantNames = [
            // 0-3: TETRAHEDRON variations
            'TETRAHEDRON LATTICE', 'TETRAHEDRON FIELD', 'TETRAHEDRON MATRIX', 'TETRAHEDRON RESONANCE',
            // 4-7: HYPERCUBE variations
            'HYPERCUBE LATTICE', 'HYPERCUBE FIELD', 'HYPERCUBE MATRIX', 'HYPERCUBE QUANTUM',
            // 8-11: SPHERE variations
            'SPHERE LATTICE', 'SPHERE FIELD', 'SPHERE MATRIX', 'SPHERE RESONANCE',
            // 12-15: TORUS variations
            'TORUS LATTICE', 'TORUS FIELD', 'TORUS MATRIX', 'TORUS QUANTUM',
            // 16-19: KLEIN BOTTLE variations
            'KLEIN BOTTLE LATTICE', 'KLEIN BOTTLE FIELD', 'KLEIN BOTTLE MATRIX', 'KLEIN BOTTLE QUANTUM',
            // 20-22: FRACTAL variations
            'FRACTAL LATTICE', 'FRACTAL FIELD', 'FRACTAL QUANTUM',
            // 23-25: WAVE variations
            'WAVE LATTICE', 'WAVE FIELD', 'WAVE QUANTUM',
            // 26-29: CRYSTAL variations
            'CRYSTAL LATTICE', 'CRYSTAL FIELD', 'CRYSTAL MATRIX', 'CRYSTAL QUANTUM'
        ];
        
        // Audio reactivity system - PRESERVED EXACTLY
        this.audioEnabled = false;
        this.audioContext = null;
        this.analyser = null;
        this.frequencyData = null;
        this.audioData = { bass: 0, mid: 0, high: 0 };
        
        console.log('✨ HolographicSystem: Initialized with REAL audio-reactive holographic effects');
    }

    /**
     * Initialize the Holographic system - PRESERVE ALL AUDIO REACTIVITY
     */
    async initialize() {
        console.log('✨ HolographicSystem: Starting initialization with audio-reactive holographic effects');
        
        try {
            // Import engine exactly like index.html does
            const { RealHolographicSystem } = await import('../../src/holograms/RealHolographicSystem.js');
            
            // CRITICAL: Don't create engine yet - will be created on activation
            // This preserves the exact behavior of index.html
            this.RealHolographicSystem = RealHolographicSystem;
            
            // Setup variant UI exactly like index.html (holographic uses variants not simple geometry)
            this.setupVariants();
            
            // Initialize holographic parameters exactly like index.html
            this.initializeParameters();
            
            this.isInitialized = true;
            console.log('✅ HolographicSystem: Initialization complete with REAL audio-reactive effects');
            return true;
        } catch (error) {
            console.error('❌ HolographicSystem: Initialization failed:', error);
            return false;
        }
    }

    /**
     * Activate the Holographic system - PRESERVE EXACT AUDIO REACTIVITY
     */
    async activate() {
        console.log('✨ HolographicSystem: Activating with REAL audio-reactive holographic effects');
        
        try {
            // Create engine if not exists (exactly like index.html does)
            if (!this.engine) {
                await this.createEngine();
            }
            
            // Show canvas layers
            this.showCanvasLayers();
            
            // Activate engine with EXACT parameters from original
            if (this.engine) {
                this.engine.isActive = true;
                this.engine.setActive(true); // Holographic engine specific activation
                
                // CRITICAL: Start audio system if available
                if (this.engine.setupAudio) {
                    try {
                        await this.engine.setupAudio();
                        console.log('🎵 HolographicSystem: Audio reactivity enabled');
                    } catch (audioError) {
                        console.warn('⚠️ HolographicSystem: Audio setup failed, continuing without audio:', audioError);
                    }
                }
                
                // Start render loop exactly like index.html
                if (this.engine.startRenderLoop) {
                    this.engine.startRenderLoop();
                }
                
                // Force all visualizers to start rendering - CRITICAL for gallery preview
                if (this.engine.visualizers) {
                    this.engine.visualizers.forEach(visualizer => {
                        if (visualizer && visualizer.gl) {
                            visualizer.isActive = true;
                        }
                    });
                }
                
                // Make globally accessible for gallery/viewer integration
                window.holographicSystem = this.engine;
            }
            
            // Update UI state
            this.updateUI();
            
            this.isActive = true;
            console.log('✅ HolographicSystem: Activated successfully with REAL audio-reactive holographic mode');
            return true;
        } catch (error) {
            console.error('❌ HolographicSystem: Activation failed:', error);
            return false;
        }
    }

    /**
     * Deactivate the Holographic system
     */
    async deactivate() {
        console.log('✨ HolographicSystem: Deactivating');
        
        try {
            // Deactivate engine
            if (this.engine) {
                this.engine.isActive = false;
                this.engine.setActive(false); // Holographic engine specific deactivation
                
                // Stop audio system
                if (this.engine.stopAudio) {
                    this.engine.stopAudio();
                }
                
                // Stop render loop
                if (this.engine.stopRenderLoop) {
                    this.engine.stopRenderLoop();
                }
            }
            
            // Hide canvas layers
            this.hideCanvasLayers();
            
            this.isActive = false;
            console.log('✅ HolographicSystem: Deactivated successfully');
            return true;
        } catch (error) {
            console.error('❌ HolographicSystem: Deactivation failed:', error);
            return false;
        }
    }

    /**
     * Create engine exactly like index.html does - PRESERVE ALL HOLOGRAPHIC EFFECTS
     */
    async createEngine() {
        console.log('✨ HolographicSystem: Creating engine with REAL audio-reactive holographic effects');
        
        try {
            // Create engine with exact parameters from index.html
            this.engine = new this.RealHolographicSystem();
            
            // Wait for initialization (holographic engine auto-initializes)
            // The engine creates visualizers in constructor
            
            if (this.engine.visualizers && this.engine.visualizers.length > 0) {
                // Make visualizers accessible
                this.visualizers = this.engine.visualizers;
                
                // Setup parameter listeners exactly like index.html
                this.setupParameterListeners();
                
                console.log(`✅ HolographicSystem: Engine created with ${this.visualizers.length} REAL audio-reactive visualizers`);
                return true;
            } else {
                throw new Error('Holographic engine initialization failed - no visualizers created');
            }
        } catch (error) {
            console.error('❌ HolographicSystem: Engine creation failed:', error);
            this.engine = null;
            return false;
        }
    }

    /**
     * Show canvas layers for this system - EXACT layer management
     */
    showCanvasLayers() {
        const layers = document.getElementById('holographicLayers');
        if (layers) {
            layers.style.display = 'block';
            layers.style.visibility = 'visible';
            layers.style.opacity = '1';
            console.log('✨ HolographicSystem: Canvas layers visible with REAL audio-reactive effects');
        }
    }

    /**
     * Hide canvas layers for this system
     */
    hideCanvasLayers() {
        const layers = document.getElementById('holographicLayers');
        if (layers) {
            layers.style.display = 'none';
            layers.style.visibility = 'hidden';
            layers.style.opacity = '0';
            console.log('✨ HolographicSystem: Canvas layers hidden');
        }
    }

    /**
     * Setup variant UI exactly like index.html - HOLOGRAPHIC USES VARIANTS NOT GEOMETRY
     */
    setupVariants() {
        const geometryGrid = document.getElementById('geometryGrid');
        if (!geometryGrid) return;
        
        geometryGrid.innerHTML = '';
        
        // CRITICAL: Holographic system shows first 8 variants in 3x3 grid (original behavior)
        const displayVariants = this.variantNames.slice(0, 8);
        
        displayVariants.forEach((variant, index) => {
            const btn = document.createElement('button');
            btn.className = 'geom-btn';
            btn.textContent = variant;
            btn.dataset.index = index;
            btn.onclick = () => this.selectVariant(index);
            
            // Set active state for default variant (index 0)
            if (index === 0) {
                btn.classList.add('active');
            }
            
            geometryGrid.appendChild(btn);
        });
        
        console.log('✨ HolographicSystem: Holographic variant UI setup complete');
    }

    /**
     * Initialize holographic parameters exactly like index.html
     */
    initializeParameters() {
        // HOLOGRAPHIC specific parameters - rich pink/magenta theme
        const defaultParams = {
            geometry: 0,        // Actually variant index for holographic
            rot4dXW: 0,
            rot4dYW: 0, 
            rot4dZW: 0,
            gridDensity: 15,    // Standard density
            morphFactor: 1.0,
            chaos: 0.2,
            speed: 1.0,
            hue: 320,           // Pink/Magenta for holographic
            intensity: 0.6,     // Rich intensity
            saturation: 0.9     // Vivid saturation
        };
        
        Object.entries(defaultParams).forEach(([param, value]) => {
            this.parameters.set(param, value);
        });
        
        console.log('✨ HolographicSystem: REAL audio-reactive parameters initialized');
    }

    /**
     * Setup parameter listeners exactly like index.html
     */
    setupParameterListeners() {
        // CRITICAL: Holographic system needs to hook into global parameter updates
        const originalUpdateParameter = window.updateParameter;
        
        window.updateParameter = (param, value) => {
            // If holographic system is active, handle the parameter
            if (window.systemManager && window.systemManager.getCurrentSystemName() === 'holographic') {
                this.updateParameter(param, value);
            } else if (originalUpdateParameter) {
                // Pass through to other systems
                originalUpdateParameter(param, value);
            }
        };
        
        // CRITICAL: Holographic system needs to hook into global variant selection
        const originalSelectGeometry = window.selectGeometry;
        
        window.selectGeometry = (index) => {
            // If holographic system is active, handle as variant selection
            if (window.systemManager && window.systemManager.getCurrentSystemName() === 'holographic') {
                this.selectVariant(index);
            } else if (originalSelectGeometry) {
                // Pass through to other systems
                originalSelectGeometry(index);
            }
        };
    }

    /**
     * Update parameter exactly like index.html - PRESERVE ALL HOLOGRAPHIC EFFECTS
     */
    updateParameter(param, value) {
        console.log(`✨ HolographicSystem: Updating ${param} = ${value} with REAL audio-reactive processing`);
        
        // Store parameter
        this.parameters.set(param, value);
        
        // Update UI display
        this.updateParameterDisplay(param, value);
        
        // Update engine if active - CRITICAL for holographic effects
        if (this.engine && this.isActive) {
            try {
                // Holographic engine has audio-reactive parameter processing
                if (this.engine.updateParameter) {
                    this.engine.updateParameter(param, value);
                } else {
                    // Direct visualizer update for holographic system
                    this.visualizers.forEach(visualizer => {
                        if (visualizer.updateParameter) {
                            visualizer.updateParameter(param, value);
                        }
                    });
                }
                
                // CRITICAL: Force immediate render for gallery preview mode
                if (window.isGalleryPreview && this.engine.render) {
                    this.engine.render();
                }
            } catch (error) {
                console.warn(`✨ HolographicSystem: Parameter update failed for ${param}:`, error);
            }
        }
    }

    /**
     * Update parameter display exactly like index.html
     */
    updateParameterDisplay(param, value) {
        // Update slider value
        const slider = document.getElementById(param);
        if (slider) {
            slider.value = value;
        }
        
        // Update value display
        const displays = {
            rot4dXW: 'xwValue',
            rot4dYW: 'ywValue', 
            rot4dZW: 'zwValue',
            gridDensity: 'densityValue',
            morphFactor: 'morphValue',
            chaos: 'chaosValue',
            speed: 'speedValue',
            hue: 'hueValue',
            intensity: 'intensityValue',
            saturation: 'saturationValue'
        };
        
        const displayId = displays[param];
        if (displayId) {
            const display = document.getElementById(displayId);
            if (display) {
                if (param === 'hue') {
                    display.textContent = `${value}°`;
                } else if (param === 'gridDensity') {
                    display.textContent = value;
                } else {
                    display.textContent = parseFloat(value).toFixed(2);
                }
            }
        }
    }

    /**
     * Select variant exactly like index.html - HOLOGRAPHIC SPECIFIC
     */
    selectVariant(index) {
        console.log(`✨ HolographicSystem: Selecting holographic variant ${index} (${this.variantNames[index]})`);
        
        // Update UI
        document.querySelectorAll('.geom-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.index == index);
        });
        
        // Update variant in engine if active
        if (this.engine && this.isActive) {
            if (this.engine.setVariant) {
                this.engine.setVariant(index);
            } else if (this.engine.currentVariant !== undefined) {
                this.engine.currentVariant = index;
                // Update all visualizers with new variant
                this.visualizers.forEach(visualizer => {
                    if (visualizer.setVariant) {
                        visualizer.setVariant(index);
                    }
                });
            }
        }
        
        // Update parameter
        this.updateParameter('geometry', index);
    }

    /**
     * Update UI for this system - SHOW HOLOGRAPHIC FEATURES
     */
    updateUI() {
        // Show geometry section for holographic system (shows variants)
        const geometrySection = document.getElementById('geometrySection');
        if (geometrySection) {
            geometrySection.style.display = 'block';
        }
        
        // Show holographic section with audio info
        const holographicSection = document.getElementById('holographicSection');
        if (holographicSection) {
            holographicSection.style.display = 'block';
        }
    }

    /**
     * Force render for gallery preview mode - CRITICAL for holographic effects
     */
    forceRender() {
        if (this.engine && this.engine.render) {
            // Call render multiple times to ensure holographic animation starts
            for (let i = 0; i < 5; i++) {
                setTimeout(() => this.engine.render(), i * 10);
            }
            console.log('✨ HolographicSystem: Force render triggered for gallery preview with REAL audio-reactive effects');
        }
    }

    /**
     * Get current parameters
     */
    getParameters() {
        return new Map(this.parameters);
    }

    /**
     * Get system info
     */
    getInfo() {
        return {
            name: this.name,
            isActive: this.isActive,
            isInitialized: this.isInitialized,
            hasEngine: !!this.engine,
            visualizerCount: this.visualizers.length,
            variants: this.variantNames.length,
            audioReactive: true,  // Holographic system marker
            effects: ['audio_reactive', 'pink_magenta_theme', 'real_holographic', 'variant_system', 'microphone_input']
        };
    }
}