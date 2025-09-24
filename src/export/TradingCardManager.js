/**
 * Trading Card Manager - Smart orchestrator for system-specific card generation
 * Dynamically loads the appropriate generator based on current system
 */
export class TradingCardManager {
    static generators = {}; // Cache loaded generators
    
    /**
     * Create a trading card for the specified system
     */
    static async createCard(system, format = 'classic', parameters = {}) {
        try {
            console.log(`🎴 Creating ${format} trading card for ${system} system...`);
            
            // Get the appropriate generator
            const generator = await this.getGenerator(system);
            
            // Generate the card
            const result = await generator.generateCard(format, parameters);
            
            // Handle both new exact generators (return {filename, content}) and old generators (return {success, ...})
            if (result.filename && result.content) {
                // New exact generator format
                this.downloadCard(result.filename, result.content);
                console.log(`✅ ${system} trading card created: ${result.filename}`);
                return {
                    success: true,
                    filename: result.filename,
                    system: result.system || system
                };
            } else if (result.success) {
                // Old generator format
                console.log(`✅ ${system} trading card created: ${result.filename}`);
                return result;
            } else {
                console.error(`❌ ${system} trading card failed: ${result.error}`);
                return result;
            }
        } catch (error) {
            console.error(`❌ Trading card manager error:`, error);
            return {
                success: false,
                error: error.message,
                system
            };
        }
    }
    
    /**
     * Get generator for specific system (with caching and dynamic import)
     */
    static async getGenerator(system) {
        // Return cached generator if available
        if (this.generators[system]) {
            return this.generators[system];
        }
        
        // Dynamic import based on system - USE EXACT GENERATORS THAT MATCH ENGINE VISUALS
        const generatorMap = {
            'faceted': () => import('./FacetedCardGeneratorExact.js'),
            'quantum': () => import('./QuantumCardGeneratorExact.js'),
            'holographic': () => import('./HolographicCardGeneratorMultiLayer.js'),
            'polychora': () => import('./PolychoraCardGenerator.js')
        };
        
        const importFunction = generatorMap[system];
        if (!importFunction) {
            throw new Error(`Unknown system: ${system}. Available: ${Object.keys(generatorMap).join(', ')}`);
        }
        
        // Import the generator class
        const module = await importFunction();
        const GeneratorClass = module.default || module[Object.keys(module).find(key => key.includes('Generator'))];
        
        if (!GeneratorClass || typeof GeneratorClass !== 'function') {
            throw new Error(`Invalid generator class for system: ${system}`);
        }
        
        // For exact generators, use static methods directly
        const generator = {
            generateCard: (format, parameters) => {
                // Convert to static method call with proper parameters
                return GeneratorClass.generateCard(parameters);
            }
        };
        
        // Cache for future use
        this.generators[system] = generator;
        
        console.log(`📦 Loaded ${system} card generator`);
        return generator;
    }
    
    /**
     * Get current system parameters from the UI
     */
    static getCurrentParameters() {
        const parameters = {};
        
        // Get all slider values
        const sliders = document.querySelectorAll('.control-slider');
        sliders.forEach(slider => {
            parameters[slider.id] = parseFloat(slider.value);
        });
        
        // Get active geometry
        const activeGeometry = document.querySelector('.geom-btn.active');
        if (activeGeometry) {
            parameters.geometry = parseInt(activeGeometry.dataset.index);
        }
        
        // Add system info
        parameters.system = window.currentSystem || 'faceted';
        
        return parameters;
    }
    
    /**
     * Download the generated trading card HTML file
     */
    static downloadCard(filename, content) {
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Clear generator cache (useful for development)
     */
    static clearCache() {
        this.generators = {};
        console.log('🧹 Trading card generator cache cleared');
    }
    
    /**
     * Get available systems
     */
    static getAvailableSystems() {
        return ['faceted', 'quantum', 'holographic', 'polychora'];
    }
    
    /**
     * Get system info for UI
     */
    static getSystemInfo(system) {
        const info = {
            'faceted': {
                name: 'Faceted',
                description: 'Clean geometric patterns showcasing mathematical purity',
                color: '#00ffff',
                specialty: 'Mathematical precision'
            },
            'quantum': {
                name: 'Quantum',
                description: 'Enhanced 3D lattice with complex holographic effects',
                color: '#00ffff',
                specialty: 'Enhanced complexity'
            },
            'holographic': {
                name: 'Holographic',
                description: 'Audio-reactive visualization with rich volumetric effects',
                color: '#ff64ff',
                specialty: 'Audio reactivity'
            },
            'polychora': {
                name: 'Polychora',
                description: 'True 4D polytope mathematics with glassmorphic rendering',
                color: '#ff9600',
                specialty: '4D mathematics'
            }
        };
        
        return info[system] || { name: 'Unknown', description: '', color: '#ffffff', specialty: '' };
    }
}