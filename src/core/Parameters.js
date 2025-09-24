/**
 * VIB34D Parameter Management System
 * Unified parameter control for both holographic and polytopal systems
 */

export class ParameterManager {
    constructor() {
        // Default parameter set combining both systems
        this.params = {
            // Current variation
            variation: 0,
            
            // 4D Polytopal Mathematics
            rot4dXW: 0.0,      // X-W plane rotation (-2 to 2)
            rot4dYW: 0.0,      // Y-W plane rotation (-2 to 2) 
            rot4dZW: 0.0,      // Z-W plane rotation (-2 to 2)
            dimension: 3.5,    // Dimensional level (3.0 to 4.5)
            
            // Holographic Visualization
            gridDensity: 15,   // Geometric detail (4 to 30)
            morphFactor: 1.0,  // Shape transformation (0 to 2)
            chaos: 0.2,        // Randomization level (0 to 1)
            speed: 1.0,        // Animation speed (0.1 to 3)
            hue: 200,          // Color rotation (0 to 360)
            intensity: 0.5,    // Visual intensity (0 to 1)
            saturation: 0.8,   // Color saturation (0 to 1)
            
            // Geometry selection
            geometry: 0        // Current geometry type (0-7)
        };
        
        // Parameter definitions for validation and UI
        this.parameterDefs = {
            variation: { min: 0, max: 99, step: 1, type: 'int' },
            rot4dXW: { min: -2, max: 2, step: 0.01, type: 'float' },
            rot4dYW: { min: -2, max: 2, step: 0.01, type: 'float' },
            rot4dZW: { min: -2, max: 2, step: 0.01, type: 'float' },
            dimension: { min: 3.0, max: 4.5, step: 0.01, type: 'float' },
            gridDensity: { min: 4, max: 100, step: 0.1, type: 'float' },
            morphFactor: { min: 0, max: 2, step: 0.01, type: 'float' },
            chaos: { min: 0, max: 1, step: 0.01, type: 'float' },
            speed: { min: 0.1, max: 3, step: 0.01, type: 'float' },
            hue: { min: 0, max: 360, step: 1, type: 'int' },
            intensity: { min: 0, max: 1, step: 0.01, type: 'float' },
            saturation: { min: 0, max: 1, step: 0.01, type: 'float' },
            geometry: { min: 0, max: 7, step: 1, type: 'int' }
        };
        
        // Default parameter backup for reset
        this.defaults = { ...this.params };
    }
    
    /**
     * Get all current parameters
     */
    getAllParameters() {
        return { ...this.params };
    }
    
    /**
     * Set a specific parameter with validation
     */
    setParameter(name, value) {
        if (this.parameterDefs[name]) {
            const def = this.parameterDefs[name];
            
            // Clamp value to valid range
            value = Math.max(def.min, Math.min(def.max, value));
            
            // Apply type conversion
            if (def.type === 'int') {
                value = Math.round(value);
            }
            
            this.params[name] = value;
            return true;
        }
        
        console.warn(`Unknown parameter: ${name}`);
        return false;
    }
    
    /**
     * Set multiple parameters at once
     */
    setParameters(paramObj) {
        for (const [name, value] of Object.entries(paramObj)) {
            this.setParameter(name, value);
        }
    }
    
    /**
     * Get a specific parameter value
     */
    getParameter(name) {
        return this.params[name];
    }
    
    /**
     * Set geometry type with validation
     */
    setGeometry(geometryType) {
        this.setParameter('geometry', geometryType);
    }
    
    /**
     * Update parameters from UI controls
     */
    updateFromControls() {
        const controlIds = [
            'variationSlider', 'rot4dXW', 'rot4dYW', 'rot4dZW', 'dimension',
            'gridDensity', 'morphFactor', 'chaos', 'speed', 'hue'
        ];
        
        controlIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                const value = parseFloat(element.value);
                
                // Map slider IDs to parameter names
                let paramName = id;
                if (id === 'variationSlider') {
                    paramName = 'variation';
                }
                
                this.setParameter(paramName, value);
            }
        });
    }
    
    /**
     * Update UI display values from current parameters
     */
    updateDisplayValues() {
        // Update slider values
        this.updateSliderValue('variationSlider', this.params.variation);
        this.updateSliderValue('rot4dXW', this.params.rot4dXW);
        this.updateSliderValue('rot4dYW', this.params.rot4dYW);
        this.updateSliderValue('rot4dZW', this.params.rot4dZW);
        this.updateSliderValue('dimension', this.params.dimension);
        this.updateSliderValue('gridDensity', this.params.gridDensity);
        this.updateSliderValue('morphFactor', this.params.morphFactor);
        this.updateSliderValue('chaos', this.params.chaos);
        this.updateSliderValue('speed', this.params.speed);
        this.updateSliderValue('hue', this.params.hue);
        
        // Update display texts
        this.updateDisplayText('rot4dXWDisplay', this.params.rot4dXW.toFixed(2));
        this.updateDisplayText('rot4dYWDisplay', this.params.rot4dYW.toFixed(2));
        this.updateDisplayText('rot4dZWDisplay', this.params.rot4dZW.toFixed(2));
        this.updateDisplayText('dimensionDisplay', this.params.dimension.toFixed(2));
        this.updateDisplayText('gridDensityDisplay', this.params.gridDensity.toFixed(1));
        this.updateDisplayText('morphFactorDisplay', this.params.morphFactor.toFixed(2));
        this.updateDisplayText('chaosDisplay', this.params.chaos.toFixed(2));
        this.updateDisplayText('speedDisplay', this.params.speed.toFixed(2));
        this.updateDisplayText('hueDisplay', this.params.hue + '°');
        
        // Update variation info
        this.updateVariationInfo();
        
        // Update geometry preset buttons
        this.updateGeometryButtons();
    }
    
    updateSliderValue(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.value = value;
        }
    }
    
    updateDisplayText(id, text) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = text;
        }
    }
    
    updateVariationInfo() {
        const variationDisplay = document.getElementById('currentVariationDisplay');
        if (variationDisplay) {
            const geometryNames = [
                'TETRAHEDRON LATTICE', 'HYPERCUBE LATTICE', 'SPHERE LATTICE', 'TORUS LATTICE',
                'KLEIN BOTTLE LATTICE', 'FRACTAL LATTICE', 'WAVE LATTICE', 'CRYSTAL LATTICE'
            ];
            
            const geometryType = Math.floor(this.params.variation / 4);
            const geometryLevel = (this.params.variation % 4) + 1;
            const geometryName = geometryNames[geometryType] || 'CUSTOM VARIATION';
            
            variationDisplay.textContent = `${this.params.variation + 1} - ${geometryName}`;
            
            if (this.params.variation < 30) {
                variationDisplay.textContent += ` ${geometryLevel}`;
            }
        }
    }
    
    updateGeometryButtons() {
        document.querySelectorAll('[data-geometry]').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.geometry) === this.params.geometry);
        });
    }
    
    /**
     * Randomize all parameters
     */
    randomizeAll() {
        this.params.rot4dXW = Math.random() * 4 - 2;
        this.params.rot4dYW = Math.random() * 4 - 2;
        this.params.rot4dZW = Math.random() * 4 - 2;
        this.params.dimension = 3.0 + Math.random() * 1.5;
        this.params.gridDensity = 4 + Math.random() * 26;
        this.params.morphFactor = Math.random() * 2;
        this.params.chaos = Math.random();
        this.params.speed = 0.1 + Math.random() * 2.9;
        this.params.hue = Math.random() * 360;
        this.params.geometry = Math.floor(Math.random() * 8);
    }
    
    /**
     * Reset to default parameters
     */
    resetToDefaults() {
        this.params = { ...this.defaults };
    }
    
    /**
     * Load parameter configuration
     */
    loadConfiguration(config) {
        if (config && typeof config === 'object') {
            // Validate and apply configuration
            for (const [key, value] of Object.entries(config)) {
                if (this.parameterDefs[key]) {
                    this.setParameter(key, value);
                }
            }
            return true;
        }
        return false;
    }
    
    /**
     * Export current configuration
     */
    exportConfiguration() {
        return {
            type: 'vib34d-integrated-config',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            name: `VIB34D Config ${new Date().toLocaleDateString()}`,
            parameters: { ...this.params }
        };
    }
    
    /**
     * Generate variation-specific parameters
     */
    generateVariationParameters(variationIndex) {
        if (variationIndex < 30) {
            // Default variations with consistent patterns
            const geometryType = Math.floor(variationIndex / 4);
            const level = variationIndex % 4;
            
            return {
                geometry: geometryType,
                gridDensity: 8 + (level * 4),
                morphFactor: 0.5 + (level * 0.3),
                chaos: level * 0.15,
                speed: 0.8 + (level * 0.2),
                hue: (geometryType * 45 + level * 15) % 360,
                rot4dXW: (level - 1.5) * 0.5,
                rot4dYW: (geometryType % 2) * 0.3,
                rot4dZW: ((geometryType + level) % 3) * 0.2,
                dimension: 3.2 + (level * 0.2)
            };
        } else {
            // Custom variations - return current parameters
            return { ...this.params };
        }
    }
    
    /**
     * Apply variation to current parameters
     */
    applyVariation(variationIndex) {
        const variationParams = this.generateVariationParameters(variationIndex);
        this.setParameters(variationParams);
        this.params.variation = variationIndex;
    }
    
    /**
     * Get HSV color values for current hue
     */
    getColorHSV() {
        return {
            h: this.params.hue,
            s: 0.8, // Fixed saturation
            v: 0.9  // Fixed value
        };
    }
    
    /**
     * Get RGB color values for current hue
     */
    getColorRGB() {
        const hsv = this.getColorHSV();
        return this.hsvToRgb(hsv.h, hsv.s, hsv.v);
    }
    
    /**
     * Convert HSV to RGB
     */
    hsvToRgb(h, s, v) {
        h = h / 60;
        const c = v * s;
        const x = c * (1 - Math.abs((h % 2) - 1));
        const m = v - c;
        
        let r, g, b;
        if (h < 1) {
            [r, g, b] = [c, x, 0];
        } else if (h < 2) {
            [r, g, b] = [x, c, 0];
        } else if (h < 3) {
            [r, g, b] = [0, c, x];
        } else if (h < 4) {
            [r, g, b] = [0, x, c];
        } else if (h < 5) {
            [r, g, b] = [x, 0, c];
        } else {
            [r, g, b] = [c, 0, x];
        }
        
        return {
            r: Math.round((r + m) * 255),
            g: Math.round((g + m) * 255),
            b: Math.round((b + m) * 255)
        };
    }
    
    /**
     * Validate parameter configuration
     */
    validateConfiguration(config) {
        if (!config || typeof config !== 'object') {
            return { valid: false, error: 'Configuration must be an object' };
        }
        
        if (config.type !== 'vib34d-integrated-config') {
            return { valid: false, error: 'Invalid configuration type' };
        }
        
        if (!config.parameters) {
            return { valid: false, error: 'Missing parameters object' };
        }
        
        // Validate individual parameters
        for (const [key, value] of Object.entries(config.parameters)) {
            if (this.parameterDefs[key]) {
                const def = this.parameterDefs[key];
                if (typeof value !== 'number' || value < def.min || value > def.max) {
                    return { valid: false, error: `Invalid value for parameter ${key}: ${value}` };
                }
            }
        }
        
        return { valid: true };
    }
}