/**
 * UnifiedSaveManager - Single save system for all VIB34D variations
 * Replaces multiple conflicting save systems with one unified approach
 */

export class UnifiedSaveManager {
    constructor(engine) {
        this.engine = engine;
        this.storageKey = 'vib34d-unified-variations';
        this.collectionStorageKey = 'vib34d-unified-collections';
        this.maxVariations = 10000; // Support up to 10k variations
        
        // Initialize storage
        this.variations = [];
        this.collections = new Map();
        
        this.loadFromStorage();
    }
    
    /**
     * Main save method with multiple output options
     */
    async save(options = {}) {
        const variation = this.captureCurrentState();
        
        // Add metadata
        variation.id = this.generateUniqueId();
        variation.timestamp = Date.now();
        variation.created = new Date().toISOString();
        
        // Save based on target
        switch (options.target || 'gallery') {
            case 'localStorage':
                return this.saveToLocalStorage(variation);
                
            case 'download':
                return this.saveToDownload(variation, options.format || 'json');
                
            case 'gallery':
                return this.saveToGallery(variation);
                
            case 'collection':
                return this.saveToCollection(variation, options.collectionName);
                
            case 'share':
                return this.saveForSharing(variation);
                
            default:
                return this.saveToGallery(variation);
        }
    }
    
    /**
     * Capture current engine state as variation
     */
    captureCurrentState() {
        // Use window.currentSystem as primary source since it's managed by main interface
        const currentSys = window.currentSystem || 'faceted';
        
        console.log('🔵 UnifiedSaveManager capturing state for system:', currentSys);
        
        // DIAGNOSTIC: Check what's actually available (3 working systems only)
        console.log('🔍 Available global objects:', {
            engine: !!window.engine,
            quantumEngine: !!window.quantumEngine,
            holographicSystem: !!window.holographicSystem,
            userParameterState: !!window.userParameterState,
            currentSystem: window.currentSystem
        });
        
        const state = {
            system: currentSys,
            name: this.generateVariationName(),
            parameters: {},
            metadata: {}
        };
        
        // FIXED: Try multiple parameter capture methods for each system
        state.parameters = this.getSystemParameters(currentSys);
        
        // Validate that we got some parameters
        if (!state.parameters || Object.keys(state.parameters).length === 0) {
            console.warn('⚠️ No parameters captured via system methods, using manual fallback');
            state.parameters = this.captureManualParameters();
        } else {
            // Even if we got some parameters, ensure we have all the core ones
            const manualParams = this.captureManualParameters();
            const coreParams = ['geometry', 'rot4dXW', 'rot4dYW', 'rot4dZW', 'gridDensity', 'morphFactor', 'chaos', 'speed', 'hue', 'intensity', 'saturation'];
            
            let missingCount = 0;
            coreParams.forEach(param => {
                if (state.parameters[param] === undefined && manualParams[param] !== undefined) {
                    state.parameters[param] = manualParams[param];
                    missingCount++;
                }
            });
            
            if (missingCount > 0) {
                console.log(`🔍 Added ${missingCount} missing core parameters from manual capture`);
            }
        }
        
        // Add metadata
        state.metadata = {
            timestamp: Date.now(),
            engine: 'VIB34D Unified',
            version: '3.0',
            author: 'VIB34D User',
            device: navigator.userAgent,
            
            // ✅ NEW: Save toggle states for reactivity persistence
            toggleStates: {
                audioEnabled: window.audioEnabled || false,
                interactivityEnabled: window.interactivityEnabled || false,
                deviceTiltEnabled: window.deviceTiltHandler?.isEnabled || false,
                reactivityMode: window.getCurrentReactivityState()
            }
        };
        
        console.log('🔵 Final captured state:', state);
        console.log(`🔍 Final parameter count: ${Object.keys(state.parameters).length} parameters`);
        return state;
    }
    
    /**
     * ENHANCED: System-specific parameter capture with correct interfaces
     */
    getSystemParameters(system) {
        let parameters = null;
        let captureMethod = 'unknown';
        
        try {
            switch (system) {
                case 'faceted':
                    // Faceted system uses ParameterManager.getAllParameters()
                    if (this.engine?.parameterManager?.getAllParameters) {
                        parameters = this.engine.parameterManager.getAllParameters();
                        captureMethod = 'this.engine.parameterManager.getAllParameters()';
                    } else if (window.engine?.parameterManager?.getAllParameters) {
                        parameters = window.engine.parameterManager.getAllParameters();
                        captureMethod = 'window.engine.parameterManager.getAllParameters()';
                    } else if (window.facetedEngine?.parameterManager?.getAllParameters) {
                        parameters = window.facetedEngine.parameterManager.getAllParameters();
                        captureMethod = 'window.facetedEngine.parameterManager.getAllParameters()';
                    }
                    break;
                    
                case 'quantum':
                    // Quantum system has getParameters() method that calls this.parameters.getAllParameters()
                    if (this.engine?.getParameters) {
                        parameters = this.engine.getParameters();
                        captureMethod = 'this.engine.getParameters()';
                    } else if (window.quantumEngine?.getParameters) {
                        parameters = window.quantumEngine.getParameters();
                        captureMethod = 'window.quantumEngine.getParameters()';
                    }
                    break;
                    
                case 'holographic':
                    // Holographic system parameter capture - use getParameters() method directly
                    if (window.holographicSystem?.getParameters) {
                        parameters = window.holographicSystem.getParameters();
                        captureMethod = 'window.holographicSystem.getParameters()';
                    }
                    break;
                    
                case 'polychora':
                    // NEW: True 4D Polychora system parameter capture
                    if (window.newPolychoraEngine?.getParameters) {
                        parameters = window.newPolychoraEngine.getParameters();
                        captureMethod = 'window.newPolychoraEngine.getParameters()';
                    } else if (window.newPolychoraEngine?.parameters?.getAllParameters) {
                        parameters = window.newPolychoraEngine.parameters.getAllParameters();
                        captureMethod = 'window.newPolychoraEngine.parameters.getAllParameters()';
                    }
                    break;
                    
                default:
                    console.warn(`⚠️ Unknown system: ${system}`);
                    break;
            }
            
        } catch (error) {
            console.error(`❌ Error capturing ${system} parameters:`, error);
            parameters = null;
            captureMethod = 'error-occurred';
        }
        
        // Enhanced validation and logging
        if (parameters && typeof parameters === 'object') {
            const paramCount = Object.keys(parameters).length;
            if (paramCount > 0) {
                console.log(`✅ Successfully captured ${paramCount} parameters for ${system} via ${captureMethod}`);
                console.log(`🔍 ${system} parameters:`, parameters);
                return parameters;
            } else {
                console.warn(`⚠️ ${system} returned empty parameters object via ${captureMethod}`);
            }
        } else {
            console.warn(`⚠️ ${system} system parameters not available via ${captureMethod}`);
        }
        
        return null;
    }
    
    /**
     * ENHANCED: Robust manual parameter capture with multiple fallback methods
     */
    captureManualParameters() {
        const params = {};
        let captureMethod = 'unknown';
        
        try {
            // FIRST PRIORITY: Use global userParameterState if available
            if (window.userParameterState && typeof window.userParameterState === 'object') {
                Object.assign(params, window.userParameterState);
                captureMethod = 'global-userParameterState';
                console.log('🔵 Using global userParameterState for parameter capture');
            }
            
            // SECOND PRIORITY: DOM element capture as enhancement/fallback
            
            // Enhanced geometry selection with multiple selectors
            let geometryValue = null;
            const selectors = ['.geom-btn.active', '.geometry-btn.active', '[data-geometry].active'];
            
            for (const selector of selectors) {
                const activeGeomBtn = document.querySelector(selector);
                if (activeGeomBtn) {
                    const index = activeGeomBtn.dataset.index || activeGeomBtn.dataset.geometry;
                    if (index !== undefined) {
                        geometryValue = parseInt(index);
                        break;
                    }
                }
            }
            
            if (geometryValue !== null) {
                params.geometry = geometryValue;
                params.geometryType = geometryValue;
                captureMethod = captureMethod === 'unknown' ? 'DOM-geometry' : `${captureMethod}+DOM-geometry`;
            }
            
            // Enhanced slider parameter capture with validation
            const sliderIds = [
                'rot4dXW', 'rot4dYW', 'rot4dZW', 'rot4dXY', 'rot4dXZ', 'rot4dYZ',
                'gridDensity', 'morphFactor', 'chaos', 'speed', 'hue', 'intensity', 'saturation',
                'dimension'
            ];
            
            let domValuesFound = 0;
            sliderIds.forEach(id => {
                const slider = document.getElementById(id);
                if (slider && slider.value !== undefined) {
                    const value = parseFloat(slider.value);
                    // Only use DOM value if it's valid and we don't already have this parameter
                    if (!isNaN(value) && (params[id] === undefined || captureMethod === 'unknown')) {
                        params[id] = value;
                        domValuesFound++;
                    }
                }
            });
            
            if (domValuesFound > 0) {
                captureMethod = captureMethod === 'unknown' ? 'DOM-sliders' : `${captureMethod}+DOM-sliders`;
            }
            
            // THIRD PRIORITY: Apply reasonable defaults for missing critical parameters
            const defaults = {
                geometry: 0,
                geometryType: 0,
                rot4dXW: 0,
                rot4dYW: 0,
                rot4dZW: 0,
                gridDensity: 20,
                morphFactor: 1,
                chaos: 0.2,
                speed: 1,
                hue: 200,
                intensity: 0.7,
                saturation: 0.8
            };
            
            let defaultsApplied = 0;
            Object.entries(defaults).forEach(([key, defaultValue]) => {
                if (params[key] === undefined || isNaN(params[key])) {
                    params[key] = defaultValue;
                    defaultsApplied++;
                }
            });
            
            if (defaultsApplied > 0) {
                captureMethod = `${captureMethod}+defaults(${defaultsApplied})`;
            }
            
        } catch (error) {
            console.error('❌ Error during manual parameter capture:', error);
            captureMethod = 'error-fallback';
            
            // Emergency fallback with minimal viable parameters
            Object.assign(params, {
                geometry: 0,
                geometryType: 0,
                rot4dXW: 0,
                rot4dYW: 0,
                rot4dZW: 0,
                gridDensity: 20,
                morphFactor: 1,
                chaos: 0.2,
                speed: 1,
                hue: 200,
                intensity: 0.7,
                saturation: 0.8
            });
        }
        
        const paramCount = Object.keys(params).length;
        console.log(`🔵 Manual parameter capture complete: ${paramCount} parameters via ${captureMethod}`, params);
        
        return params;
    }
    
    /**
     * ENHANCED: Initialize system with proper parameter injection
     */
    initializeSystemWithParameters(systemName, parameters) {
        console.log(`🔵 Initializing ${systemName} system with parameters:`, parameters);
        
        try {
            // 1. Update global userParameterState first
            if (window.userParameterState && parameters) {
                Object.assign(window.userParameterState, parameters);
                console.log('🔵 Updated global userParameterState');
            }
            
            // 2. Sync UI sliders to reflect parameters
            if (window.syncSlidersToStoredValues) {
                setTimeout(() => {
                    window.syncSlidersToStoredValues();
                    console.log('🔵 Synced UI sliders to parameters');
                }, 100);
            }
            
            // 3. Update geometry selection if specified
            if (parameters.geometry !== undefined) {
                const geometryValue = parseInt(parameters.geometry);
                if (!isNaN(geometryValue) && geometryValue >= 0 && geometryValue <= 7) {
                    setTimeout(() => {
                        if (window.selectGeometry) {
                            window.selectGeometry(geometryValue);
                            console.log(`🔵 Set geometry to ${geometryValue}`);
                        }
                    }, 150);
                }
            }
            
            // 4. Force system to update with new parameters
            setTimeout(() => {
                if (window.syncVisualizerToUI) {
                    const currentEngine = this.getCurrentEngine(systemName);
                    if (currentEngine) {
                        window.syncVisualizerToUI(systemName, currentEngine);
                        console.log(`🔵 Force-synced ${systemName} visualizer`);
                    }
                }
            }, 200);
            
            // 5. Apply individual parameter updates for immediate effect
            setTimeout(() => {
                if (window.updateParameter && parameters) {
                    Object.entries(parameters).forEach(([param, value]) => {
                        if (typeof value === 'number' && !isNaN(value)) {
                            window.updateParameter(param, value);
                        }
                    });
                    console.log(`🔵 Applied ${Object.keys(parameters).length} parameters individually`);
                }
            }, 250);
            
            return true;
            
        } catch (error) {
            console.error(`❌ Error initializing ${systemName} with parameters:`, error);
            return false;
        }
    }
    
    /**
     * Get current engine reference for a system
     */
    getCurrentEngine(systemName) {
        try {
            switch (systemName) {
                case 'faceted':
                    return window.engine || window.facetedEngine || this.engine;
                case 'quantum':
                    return window.quantumEngine;
                case 'holographic':
                    return window.holographicSystem || window.holographicEngine;
                case 'polychora':
                    console.warn('⚠️ Polychora system excluded - no engine available');
                    return null;
                default:
                    return null;
            }
        } catch (error) {
            console.error(`❌ Error getting ${systemName} engine:`, error);
            return null;
        }
    }

    /**
     * Save to localStorage for persistence
     */
    saveToLocalStorage(variation) {
        // Add to variations array
        this.variations.push(variation);
        
        // Limit to max variations
        if (this.variations.length > this.maxVariations) {
            this.variations = this.variations.slice(-this.maxVariations);
        }
        
        // Save to localStorage
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.variations));
            console.log('✅ Saved variation to localStorage:', variation.name);
            return { success: true, id: variation.id };
        } catch (error) {
            console.error('❌ Failed to save to localStorage:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Save to gallery (localStorage + visual notification)
     */
    async saveToGallery(variation) {
        // Save to localStorage first
        const localResult = this.saveToLocalStorage(variation);
        
        if (!localResult.success) {
            return localResult;
        }
        
        // CRITICAL FIX: Group custom saves by date instead of individual collections
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        const collectionKey = `custom-saves-${today}`;
        const todayFormatted = new Date().toLocaleDateString();
        
        // Get or create today's collection
        let todaysCollection = this.collections.get(collectionKey);
        
        if (!todaysCollection) {
            // Create new daily collection
            console.log(`📅 Creating new daily collection: ${collectionKey}`);
            todaysCollection = {
                name: `Custom Saves - ${todayFormatted}`,
                description: `Custom variations saved on ${todayFormatted}`,
                version: '1.0',
                type: 'holographic-collection',
                profileName: 'VIB34D User',
                totalVariations: 0,
                created: variation.created,
                updated: variation.created,
                filename: collectionKey,
                variations: []
            };
            this.collections.set(collectionKey, todaysCollection);
        }
        
        // Add variation to today's collection (not individual collection)
        const variationInCollection = {
            id: todaysCollection.variations.length,
            name: variation.name,
            isCustom: true,
            globalId: variation.id,
            system: variation.system,
            parameters: this.normalizeParameters(variation.parameters)
        };
        
        todaysCollection.variations.push(variationInCollection);
        todaysCollection.totalVariations = todaysCollection.variations.length;
        todaysCollection.updated = new Date().toISOString();
        
        console.log(`📝 Added variation to daily collection. Total in ${collectionKey}: ${todaysCollection.totalVariations}`);
        
        // Update localStorage collections
        this.saveCollectionsToStorage();
        
        // Show success notification with date grouping info
        if (this.engine.statusManager) {
            this.engine.statusManager.success(
                `✅ Saved to Gallery!<br>` +
                `<strong>${variation.name}</strong><br>` +
                `Added to: ${todaysCollection.name}<br>` +
                `Total today: ${todaysCollection.totalVariations}<br>` +
                `<small>Gallery will update automatically</small>`
            );
        }
        
        // Emit event for real-time gallery update
        this.emitGalleryUpdate(variation);
        
        return { success: true, id: variation.id, collection: collectionKey, totalInCollection: todaysCollection.totalVariations };
    }
    
    /**
     * Save as downloadable file
     */
    saveToDownload(variation, format = 'json') {
        let content, filename, mimeType;
        
        switch (format) {
            case 'json':
                content = JSON.stringify(variation, null, 2);
                filename = `vib34d-${variation.id}.json`;
                mimeType = 'application/json';
                break;
                
            case 'collection':
                const collection = this.createCollectionFormat([variation]);
                content = JSON.stringify(collection, null, 2);
                filename = `collection-${variation.id}.json`;
                mimeType = 'application/json';
                break;
                
            default:
                throw new Error(`Unsupported format: ${format}`);
        }
        
        // Create download
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        console.log(`📥 Downloaded ${filename}`);
        return { success: true, filename };
    }
    
    /**
     * Save to named collection
     */
    saveToCollection(variation, collectionName = 'My Collection') {
        // Get or create collection
        let collection = this.collections.get(collectionName);
        
        if (!collection) {
            collection = this.createCollectionFormat([], collectionName);
            this.collections.set(collectionName, collection);
        }
        
        // Add variation to collection
        collection.variations.push({
            id: collection.variations.length,
            name: variation.name,
            isCustom: true,
            globalId: variation.id,
            system: variation.system,
            parameters: this.normalizeParameters(variation.parameters)
        });
        
        collection.totalVariations = collection.variations.length;
        collection.updated = new Date().toISOString();
        
        // Save collections
        this.saveCollectionsToStorage();
        
        console.log(`📁 Added to collection "${collectionName}":`, variation.name);
        return { success: true, collection: collectionName, id: variation.id };
    }
    
    /**
     * Save for sharing (generates shareable URL)
     */
    saveForSharing(variation) {
        // Save to localStorage first
        this.saveToLocalStorage(variation);
        
        // Generate shareable URL
        const baseUrl = window.location.origin + window.location.pathname.replace('index.html', '');
        const params = new URLSearchParams();
        params.set('id', variation.id);
        params.set('system', variation.system);
        
        // Encode parameters
        Object.entries(variation.parameters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.set(key, value);
            }
        });
        
        const shareUrl = `${baseUrl}share.html?${params.toString()}`;
        
        // Copy to clipboard
        if (navigator.clipboard) {
            navigator.clipboard.writeText(shareUrl);
            
            if (this.engine.statusManager) {
                this.engine.statusManager.success(
                    `🔗 Share URL copied!<br>` +
                    `<small>${shareUrl}</small>`
                );
            }
        }
        
        return { success: true, url: shareUrl, id: variation.id };
    }
    
    /**
     * ✅ FIXED: Keep original parameter names for gallery/viewer compatibility
     */
    normalizeParameters(params) {
        const normalized = {};
        
        // ✅ CRITICAL FIX: Don't rename parameters - keep original names for viewer compatibility
        normalized.geometry = params.geometry || params.geometryType || 0;
        normalized.gridDensity = params.gridDensity || params.density || 10;
        normalized.morphFactor = params.morphFactor || params.morph || 0;
        normalized.speed = params.speed || 1.0;
        normalized.chaos = params.chaos || 0;
        normalized.hue = params.hue || 200;
        normalized.saturation = params.saturation || 0.8;
        normalized.intensity = params.intensity || 0.5;
        
        // 4D rotation parameters (keep original names)
        normalized.rot4dXW = params.rot4dXW || 0;
        normalized.rot4dYW = params.rot4dYW || 0;
        normalized.rot4dZW = params.rot4dZW || 0;
        normalized.dimension = params.dimension || 3.8;
        
        // Future 4D rotations (for Polychora enhancement)
        normalized.rot4dXY = params.rot4dXY || 0;
        normalized.rot4dXZ = params.rot4dXZ || 0;
        normalized.rot4dYZ = params.rot4dYZ || 0;
        
        // ✅ ALSO ADD: Both normalized AND original names for compatibility
        normalized.geometryType = normalized.geometry;
        normalized.density = normalized.gridDensity;
        normalized.morph = normalized.morphFactor;
        
        return normalized;
    }
    
    /**
     * Create collection format
     */
    createCollectionFormat(variations = [], name = 'Unnamed Collection') {
        return {
            name,
            description: 'VIB34D Unified Collection',
            version: '1.0',
            type: 'holographic-collection',
            profileName: 'VIB34D System',
            totalVariations: variations.length,
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
            variations: variations.map((v, i) => ({
                id: i,
                name: v.name,
                isCustom: true,
                globalId: v.id || this.generateUniqueId(),
                system: v.system,
                parameters: this.normalizeParameters(v.parameters || {})
            }))
        };
    }
    
    /**
     * Load from localStorage
     */
    loadFromStorage() {
        try {
            // Load variations
            const storedVariations = localStorage.getItem(this.storageKey);
            if (storedVariations) {
                this.variations = JSON.parse(storedVariations);
                console.log(`📂 Loaded ${this.variations.length} variations from storage`);
            }
            
            // Load collections
            const storedCollections = localStorage.getItem(this.collectionStorageKey);
            if (storedCollections) {
                const collectionsArray = JSON.parse(storedCollections);
                this.collections = new Map(collectionsArray);
                console.log(`📁 Loaded ${this.collections.size} collections from storage`);
            }
        } catch (error) {
            console.error('Failed to load from storage:', error);
        }
    }
    
    /**
     * Save collections to localStorage
     */
    saveCollectionsToStorage() {
        try {
            const collectionsArray = Array.from(this.collections.entries());
            localStorage.setItem(this.collectionStorageKey, JSON.stringify(collectionsArray));
        } catch (error) {
            console.error('Failed to save collections:', error);
        }
    }
    
    /**
     * Emit gallery update event
     */
    emitGalleryUpdate(variation) {
        const event = new CustomEvent('vib34d-gallery-update', {
            detail: { variation, timestamp: Date.now() }
        });
        window.dispatchEvent(event);
    }
    
    /**
     * Generate unique ID
     */
    generateUniqueId() {
        return `V${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Generate variation name
     */
    generateVariationName() {
        const systems = {
            faceted: 'FACETED',
            holographic: 'HOLO', 
            polychora: 'POLY'
        };
        
        const currentSys = window.currentSystem || 'faceted';
        const system = systems[currentSys] || 'CUSTOM';
        const timestamp = new Date().toTimeString().split(' ')[0].replace(/:/g, '');
        
        return `${system}-${timestamp}`;
    }
    
    /**
     * Get all variations
     */
    getAllVariations() {
        return this.variations;
    }
    
    /**
     * Get all collections
     */
    getAllCollections() {
        return Array.from(this.collections.values());
    }
    
    /**
     * Clear all data
     */
    clearAll() {
        this.variations = [];
        this.collections.clear();
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.collectionStorageKey);
        console.log('🗑️ Cleared all saved data');
    }
}