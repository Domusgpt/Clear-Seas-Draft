/**
 * VIB34D Variation Management System
 * Manages 100 total variations: 30 default + 70 custom
 */

import { GeometryLibrary } from '../geometry/GeometryLibrary.js';

export class VariationManager {
    constructor(engine) {
        this.engine = engine;
        
        // Default variation names (30 total)
        this.variationNames = [
            // Tetrahedron Lattice (0-3)
            'TETRAHEDRON LATTICE 1', 'TETRAHEDRON LATTICE 2', 'TETRAHEDRON LATTICE 3', 'TETRAHEDRON LATTICE 4',
            
            // Hypercube Lattice (4-7)
            'HYPERCUBE LATTICE 1', 'HYPERCUBE LATTICE 2', 'HYPERCUBE LATTICE 3', 'HYPERCUBE LATTICE 4',
            
            // Sphere Lattice (8-11)
            'SPHERE LATTICE 1', 'SPHERE LATTICE 2', 'SPHERE LATTICE 3', 'SPHERE LATTICE 4',
            
            // Torus Lattice (12-15)
            'TORUS LATTICE 1', 'TORUS LATTICE 2', 'TORUS LATTICE 3', 'TORUS LATTICE 4',
            
            // Klein Bottle Lattice (16-19)
            'KLEIN BOTTLE LATTICE 1', 'KLEIN BOTTLE LATTICE 2', 'KLEIN BOTTLE LATTICE 3', 'KLEIN BOTTLE LATTICE 4',
            
            // Fractal Lattice (20-22)
            'FRACTAL LATTICE 1', 'FRACTAL LATTICE 2', 'FRACTAL LATTICE 3',
            
            // Wave Lattice (23-25)
            'WAVE LATTICE 1', 'WAVE LATTICE 2', 'WAVE LATTICE 3',
            
            // Crystal Lattice (26-29)
            'CRYSTAL LATTICE 1', 'CRYSTAL LATTICE 2', 'CRYSTAL LATTICE 3', 'CRYSTAL LATTICE 4'
        ];
        
        // Custom variations storage (70 slots)
        this.customVariations = new Array(70).fill(null);
        
        // Total variation count
        this.totalVariations = 100;
    }
    
    /**
     * Get variation name for display
     */
    getVariationName(index) {
        if (index < 30) {
            return this.variationNames[index];
        } else {
            const customIndex = index - 30;
            const customVar = this.customVariations[customIndex];
            return customVar ? customVar.name : `CUSTOM ${customIndex + 1}`;
        }
    }
    
    /**
     * Generate default variation parameters
     */
    generateDefaultVariation(index) {
        if (index >= 30) return null;
        
        const geometryType = Math.floor(index / 4);
        const level = index % 4;
        
        // Special handling for reduced geometry sets
        let adjustedGeometryType = geometryType;
        if (geometryType === 5 && level > 2) { // Fractal only has 3 levels
            adjustedGeometryType = 5;
            level = 2;
        }
        if (geometryType === 6 && level > 2) { // Wave only has 3 levels  
            adjustedGeometryType = 6;
            level = 2;
        }
        
        return {
            variation: index,
            geometry: adjustedGeometryType,
            gridDensity: 8 + adjustedGeometryType * 2 + level * 1.5,
            morphFactor: 0.2 + level * 0.2,
            chaos: level * 0.2,
            speed: 0.8 + level * 0.2,
            hue: (index * 12.27) % 360,
            rot4dXW: (level - 1.5) * 0.3,
            rot4dYW: (adjustedGeometryType % 2) * 0.2,
            rot4dZW: ((adjustedGeometryType + level) % 3) * 0.15,
            dimension: 3.2 + level * 0.2
        };
    }
    
    /**
     * Apply specific variation to the engine
     */
    applyVariation(index) {
        if (index < 0 || index >= this.totalVariations) return false;
        
        let params;
        
        if (index < 30) {
            // Default variation
            params = this.generateDefaultVariation(index);
        } else {
            // Custom variation
            const customIndex = index - 30;
            const customVar = this.customVariations[customIndex];
            
            if (customVar) {
                params = { ...customVar.parameters, variation: index };
            } else {
                // Empty slot - use current parameters
                params = { ...this.engine.parameterManager.getAllParameters(), variation: index };
            }
        }
        
        if (params) {
            this.engine.parameterManager.setParameters(params);
            this.engine.currentVariation = index;
            return true;
        }
        
        return false;
    }
    
    /**
     * Save current state as custom variation
     */
    saveCurrentAsCustom() {
        // Find first empty custom slot
        const emptyIndex = this.customVariations.findIndex(slot => slot === null);
        
        if (emptyIndex === -1) {
            return -1; // No empty slots
        }
        
        const currentParams = this.engine.parameterManager.getAllParameters();
        const currentGeometry = GeometryLibrary.getGeometryName(currentParams.geometry);
        
        const customVariation = {
            name: `${currentGeometry} CUSTOM ${emptyIndex + 1}`,
            timestamp: new Date().toISOString(),
            parameters: { ...currentParams },
            metadata: {
                basedOnVariation: this.engine.currentVariation,
                createdFrom: 'current-state'
            }
        };
        
        this.customVariations[emptyIndex] = customVariation;
        this.saveCustomVariations();
        
        return 30 + emptyIndex; // Return absolute variation index
    }
    
    /**
     * Delete custom variation
     */
    deleteCustomVariation(customIndex) {
        if (customIndex >= 0 && customIndex < 70) {
            this.customVariations[customIndex] = null;
            this.saveCustomVariations();
            return true;
        }
        return false;
    }
    
    /**
     * Populate the variation grid UI
     */
    populateGrid() {
        const gridContainer = document.getElementById('variationGrid');
        if (!gridContainer) return;
        
        gridContainer.innerHTML = '';
        
        // Create sections for different geometry types
        const sections = [
            { name: 'Tetrahedron', range: [0, 3], class: 'tetrahedron' },
            { name: 'Hypercube', range: [4, 7], class: 'hypercube' },
            { name: 'Sphere', range: [8, 11], class: 'sphere' },
            { name: 'Torus', range: [12, 15], class: 'torus' },
            { name: 'Klein Bottle', range: [16, 19], class: 'klein' },
            { name: 'Fractal', range: [20, 22], class: 'fractal' },
            { name: 'Wave', range: [23, 25], class: 'wave' },
            { name: 'Crystal', range: [26, 29], class: 'crystal' }
        ];
        
        // Add default variations
        sections.forEach(section => {
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'variation-section';
            sectionDiv.innerHTML = `<h3>${section.name} Lattice</h3>`;
            
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'variation-buttons';
            
            for (let i = section.range[0]; i <= section.range[1]; i++) {
                if (i < this.variationNames.length) {
                    const button = this.createVariationButton(i, true, section.class);
                    buttonContainer.appendChild(button);
                }
            }
            
            sectionDiv.appendChild(buttonContainer);
            gridContainer.appendChild(sectionDiv);
        });
        
        // Add custom variations section
        const customSection = document.createElement('div');
        customSection.className = 'variation-section custom-section';
        customSection.innerHTML = '<h3>Custom Variations</h3>';
        
        const customContainer = document.createElement('div');
        customContainer.className = 'variation-buttons custom-grid';
        
        for (let i = 0; i < 70; i++) {
            const button = this.createVariationButton(30 + i, false, 'custom');
            customContainer.appendChild(button);
        }
        
        customSection.appendChild(customContainer);
        gridContainer.appendChild(customSection);
    }
    
    /**
     * Create individual variation button
     */
    createVariationButton(variationIndex, isDefault, geomClass) {
        const button = document.createElement('button');
        const name = this.getVariationName(variationIndex);
        
        button.className = `preset-btn ${geomClass} ${isDefault ? 'default-variation' : 'custom-variation'}`;
        button.dataset.variation = variationIndex;
        button.title = `${variationIndex + 1}. ${name}`;
        
        // Button content
        if (isDefault) {
            button.innerHTML = `
                <div class="variation-number">${(variationIndex + 1).toString().padStart(2, '0')}</div>
                <div class="variation-level">Level ${(variationIndex % 4) + 1}</div>
            `;
        } else {
            const customIndex = variationIndex - 30;
            const hasCustom = this.customVariations[customIndex] !== null;
            
            button.innerHTML = `
                <div class="variation-number">${(variationIndex + 1).toString()}</div>
                <div class="variation-type">${hasCustom ? 'CUSTOM' : 'EMPTY'}</div>
            `;
            
            if (!hasCustom) {
                button.classList.add('empty-slot');
            }
        }
        
        // Click handler
        button.addEventListener('click', () => {
            if (isDefault || this.customVariations[variationIndex - 30] !== null) {
                this.engine.setVariation(variationIndex);
                this.updateVariationGrid();
            }
        });
        
        // Right-click for custom variations (delete)
        if (!isDefault) {
            button.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                const customIndex = variationIndex - 30;
                if (this.customVariations[customIndex] !== null) {
                    if (confirm(`Delete custom variation ${variationIndex + 1}?`)) {
                        this.deleteCustomVariation(customIndex);
                        this.populateGrid();
                    }
                }
            });
        }
        
        return button;
    }
    
    /**
     * Update variation grid to show current selection
     */
    updateVariationGrid() {
        const buttons = document.querySelectorAll('.preset-btn');
        buttons.forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.dataset.variation) === this.engine.currentVariation) {
                btn.classList.add('active');
            }
        });
    }
    
    /**
     * Load custom variations from localStorage
     */
    loadCustomVariations() {
        try {
            const stored = localStorage.getItem('vib34d-custom-variations');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length === 70) {
                    this.customVariations = parsed;
                }
            }
        } catch (error) {
            console.warn('Failed to load custom variations:', error);
        }
    }
    
    /**
     * Save custom variations to localStorage
     */
    saveCustomVariations() {
        try {
            localStorage.setItem('vib34d-custom-variations', JSON.stringify(this.customVariations));
        } catch (error) {
            console.warn('Failed to save custom variations:', error);
        }
    }
    
    /**
     * Export all custom variations as JSON
     */
    exportCustomVariations() {
        const exportData = {
            type: 'vib34d-custom-variations',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            variations: this.customVariations.filter(v => v !== null)
        };
        
        const json = JSON.stringify(exportData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'vib34d-custom-variations.json';
        link.click();
        
        URL.revokeObjectURL(url);
    }
    
    /**
     * Import custom variations from JSON
     */
    async importCustomVariations(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (data.type === 'vib34d-custom-variations' && Array.isArray(data.variations)) {
                // Merge imported variations
                let importCount = 0;
                
                data.variations.forEach(variation => {
                    const emptyIndex = this.customVariations.findIndex(slot => slot === null);
                    if (emptyIndex !== -1) {
                        this.customVariations[emptyIndex] = variation;
                        importCount++;
                    }
                });
                
                this.saveCustomVariations();
                this.populateGrid();
                
                return importCount;
            }
        } catch (error) {
            console.error('Failed to import custom variations:', error);
        }
        
        return 0;
    }
    
    /**
     * Get variation statistics
     */
    getStatistics() {
        const customCount = this.customVariations.filter(v => v !== null).length;
        
        return {
            totalVariations: this.totalVariations,
            defaultVariations: 30,
            customVariations: customCount,
            emptySlots: 70 - customCount,
            currentVariation: this.engine.currentVariation,
            isCustom: this.engine.currentVariation >= 30
        };
    }
}