/**
 * ParameterMapper - Unified parameter translation between systems
 * Solves the parameter format chaos between VIB34D, Holographic, and Polychora systems
 */

export class ParameterMapper {
    constructor() {
        // Define parameter mappings between systems
        this.mappings = {
            // VIB34D (faceted) system mappings
            vib34d: {
                to: {
                    geometry: 'geometryType',
                    gridDensity: 'density',
                    morphFactor: 'morph',
                    rot4dXW: 'rot4dXW',
                    rot4dYW: 'rot4dYW',
                    rot4dZW: 'rot4dZW',
                    dimension: 'dimension',
                    chaos: 'chaos',
                    speed: 'speed',
                    hue: 'hue'
                },
                from: {
                    geometryType: 'geometry',
                    density: 'gridDensity',
                    morph: 'morphFactor',
                    rot4dXW: 'rot4dXW',
                    rot4dYW: 'rot4dYW',
                    rot4dZW: 'rot4dZW',
                    dimension: 'dimension',
                    chaos: 'chaos',
                    speed: 'speed',
                    hue: 'hue'
                }
            },
            
            // Holographic system mappings
            holographic: {
                to: {
                    geometryType: 'geometryType',
                    density: 'density',
                    speed: 'speed',
                    chaos: 'chaos',
                    morph: 'morph',
                    hue: 'hue',
                    saturation: 'saturation',
                    intensity: 'intensity'
                },
                from: {
                    geometryType: 'geometryType',
                    density: 'density',
                    speed: 'speed',
                    chaos: 'chaos',
                    morph: 'morph',
                    hue: 'hue',
                    saturation: 'saturation',
                    intensity: 'intensity'
                }
            },
            
            // Polychora system mappings
            polychora: {
                to: {
                    polytope: 'polytope',
                    lineThickness: 'lineThickness',
                    coreSize: 'coreSize',
                    outlineWidth: 'outlineWidth',
                    glassBlur: 'glassBlur',
                    colorMagnetism: 'colorMagnetism',
                    layerScale: 'layerScale',
                    translucency: 'translucency',
                    rot4dXW: 'rot4dXW',
                    rot4dYW: 'rot4dYW',
                    rot4dZW: 'rot4dZW',
                    dimension: 'dimension',
                    speed: 'speed',
                    hue: 'hue',
                    // Future 4D rotations
                    rot4dXY: 'rot4dXY',
                    rot4dXZ: 'rot4dXZ',
                    rot4dYZ: 'rot4dYZ'
                },
                from: {
                    polytope: 'polytope',
                    lineThickness: 'lineThickness',
                    coreSize: 'coreSize',
                    outlineWidth: 'outlineWidth',
                    glassBlur: 'glassBlur',
                    colorMagnetism: 'colorMagnetism',
                    layerScale: 'layerScale',
                    translucency: 'translucency',
                    rot4dXW: 'rot4dXW',
                    rot4dYW: 'rot4dYW',
                    rot4dZW: 'rot4dZW',
                    dimension: 'dimension',
                    speed: 'speed',
                    hue: 'hue',
                    rot4dXY: 'rot4dXY',
                    rot4dXZ: 'rot4dXZ',
                    rot4dYZ: 'rot4dYZ'
                }
            }
        };
        
        // Unified parameter schema (canonical format)
        this.unifiedSchema = {
            // Geometry parameters
            geometryType: { min: 0, max: 7, default: 0, type: 'integer' },
            polytope: { min: 0, max: 5, default: 0, type: 'integer' },
            
            // Density and detail
            density: { min: 1, max: 30, default: 10, type: 'float' },
            gridDensity: { min: 4, max: 30, default: 10, type: 'float' },
            
            // Morphing and transformation
            morph: { min: 0, max: 2, default: 0, type: 'float' },
            morphFactor: { min: 0, max: 2, default: 0, type: 'float' },
            
            // 4D rotation parameters (existing)
            rot4dXW: { min: -Math.PI, max: Math.PI, default: 0, type: 'float' },
            rot4dYW: { min: -Math.PI, max: Math.PI, default: 0, type: 'float' },
            rot4dZW: { min: -Math.PI, max: Math.PI, default: 0, type: 'float' },
            
            // 4D rotation parameters (new for Polychora)
            rot4dXY: { min: -Math.PI, max: Math.PI, default: 0, type: 'float' },
            rot4dXZ: { min: -Math.PI, max: Math.PI, default: 0, type: 'float' },
            rot4dYZ: { min: -Math.PI, max: Math.PI, default: 0, type: 'float' },
            
            // Dimension and physics
            dimension: { min: 3.0, max: 4.5, default: 3.8, type: 'float' },
            
            // Animation and chaos
            speed: { min: 0.1, max: 3.0, default: 1.0, type: 'float' },
            chaos: { min: 0, max: 1, default: 0, type: 'float' },
            
            // Color parameters
            hue: { min: 0, max: 360, default: 200, type: 'float' },
            saturation: { min: 0, max: 1, default: 0.8, type: 'float' },
            intensity: { min: 0, max: 1, default: 0.5, type: 'float' },
            
            // Polychora glass effects
            lineThickness: { min: 0.5, max: 5.0, default: 2.5, type: 'float' },
            coreSize: { min: 0.5, max: 2.0, default: 1.2, type: 'float' },
            outlineWidth: { min: 0.5, max: 3.0, default: 1.8, type: 'float' },
            glassBlur: { min: 0, max: 5.0, default: 3.0, type: 'float' },
            colorMagnetism: { min: 0, max: 1, default: 0.7, type: 'float' },
            layerScale: { min: 0.5, max: 2.0, default: 1.0, type: 'float' },
            translucency: { min: 0, max: 1, default: 0.8, type: 'float' }
        };
    }
    
    /**
     * Convert parameters to unified format
     */
    toUnified(params, sourceSystem) {
        const unified = {};
        const mapping = this.mappings[sourceSystem]?.to || {};
        
        // Map known parameters
        Object.entries(params).forEach(([key, value]) => {
            const unifiedKey = mapping[key] || key;
            unified[unifiedKey] = value;
        });
        
        // Add defaults for missing parameters
        Object.entries(this.unifiedSchema).forEach(([key, schema]) => {
            if (unified[key] === undefined) {
                unified[key] = schema.default;
            }
        });
        
        return unified;
    }
    
    /**
     * Convert unified format to specific system format
     */
    fromUnified(params, targetSystem) {
        const systemParams = {};
        const mapping = this.mappings[targetSystem]?.from || {};
        
        // Map unified parameters to system-specific
        Object.entries(params).forEach(([key, value]) => {
            const systemKey = mapping[key] || key;
            
            // Only include parameters the target system uses
            if (this.mappings[targetSystem]?.to[systemKey] !== undefined || 
                this.mappings[targetSystem]?.from[key] !== undefined) {
                systemParams[systemKey] = value;
            }
        });
        
        return systemParams;
    }
    
    /**
     * Validate parameters against schema
     */
    validate(params) {
        const errors = [];
        const validated = {};
        
        Object.entries(params).forEach(([key, value]) => {
            const schema = this.unifiedSchema[key];
            
            if (!schema) {
                errors.push(`Unknown parameter: ${key}`);
                return;
            }
            
            // Type validation
            if (schema.type === 'integer') {
                value = Math.round(value);
            } else if (schema.type === 'float') {
                value = parseFloat(value);
            }
            
            // Range validation
            if (value < schema.min) {
                value = schema.min;
                errors.push(`${key} clamped to minimum: ${schema.min}`);
            } else if (value > schema.max) {
                value = schema.max;
                errors.push(`${key} clamped to maximum: ${schema.max}`);
            }
            
            validated[key] = value;
        });
        
        return { params: validated, errors };
    }
    
    /**
     * Merge parameters from multiple systems
     */
    merge(...paramSets) {
        const merged = {};
        
        paramSets.forEach(params => {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    merged[key] = value;
                }
            });
        });
        
        return merged;
    }
    
    /**
     * Get default parameters for a system
     */
    getDefaults(system) {
        const defaults = {};
        const mapping = this.mappings[system]?.from || {};
        
        Object.entries(this.unifiedSchema).forEach(([unifiedKey, schema]) => {
            const systemKey = mapping[unifiedKey] || unifiedKey;
            
            // Only include if this system uses this parameter
            if (this.mappings[system]?.to[systemKey] !== undefined ||
                this.mappings[system]?.from[unifiedKey] !== undefined) {
                defaults[systemKey] = schema.default;
            }
        });
        
        return defaults;
    }
    
    /**
     * Get parameter ranges for UI controls
     */
    getRanges(system) {
        const ranges = {};
        const mapping = this.mappings[system]?.from || {};
        
        Object.entries(this.unifiedSchema).forEach(([unifiedKey, schema]) => {
            const systemKey = mapping[unifiedKey] || unifiedKey;
            
            // Only include if this system uses this parameter
            if (this.mappings[system]?.to[systemKey] !== undefined ||
                this.mappings[system]?.from[unifiedKey] !== undefined) {
                ranges[systemKey] = {
                    min: schema.min,
                    max: schema.max,
                    default: schema.default,
                    type: schema.type
                };
            }
        });
        
        return ranges;
    }
    
    /**
     * Cross-pollinate parameters between systems
     * This enables parameter influence across systems for hybrid effects
     */
    crossPollinate(sourceParams, sourceSystem, targetSystem, influence = 0.5) {
        const unified = this.toUnified(sourceParams, sourceSystem);
        const targetParams = this.fromUnified(unified, targetSystem);
        
        // Apply influence factor (0 = no influence, 1 = full replacement)
        const currentParams = this.getDefaults(targetSystem);
        const influenced = {};
        
        Object.keys(targetParams).forEach(key => {
            if (currentParams[key] !== undefined) {
                // Blend current and new values based on influence
                influenced[key] = currentParams[key] * (1 - influence) + targetParams[key] * influence;
            } else {
                influenced[key] = targetParams[key];
            }
        });
        
        return influenced;
    }
}