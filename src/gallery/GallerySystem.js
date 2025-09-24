/**
 * VIB34D Gallery System
 * Portfolio view with live hover previews and variation browsing
 */

export class GallerySystem {
    constructor(engine) {
        this.engine = engine;
        this.galleryModal = null;
        this.previewCanvas = null;
        this.previewVisualizer = null;
        this.currentPreview = -1;
        this.previewTimeout = null;
        
        this.init();
    }
    
    /**
     * Initialize gallery system
     */
    init() {
        this.createGalleryModal();
        this.setupEventHandlers();
    }
    
    /**
     * Create gallery modal HTML structure
     */
    createGalleryModal() {
        const modal = document.createElement('div');
        modal.id = 'galleryModal';
        modal.className = 'modal gallery-modal';
        
        modal.innerHTML = `
            <div class="modal-content gallery-content">
                <div class="gallery-header">
                    <h2>VIB34D Variation Gallery</h2>
                    <div class="gallery-controls">
                        <button class="preview-toggle" title="Toggle Live Preview">
                            <span class="icon">👁️</span> Live Preview
                        </button>
                        <button class="gallery-export" title="Export All Variations">
                            <span class="icon">📁</span> Export All
                        </button>
                        <button class="close-btn" title="Close Gallery">×</button>
                    </div>
                </div>
                
                <div class="gallery-body">
                    <div class="gallery-sidebar">
                        <div class="preview-container">
                            <canvas id="galleryPreviewCanvas" width="300" height="300"></canvas>
                            <div class="preview-info">
                                <div class="preview-title">Hover to preview</div>
                                <div class="preview-details"></div>
                            </div>
                        </div>
                        
                        <div class="gallery-stats">
                            <div class="stat-item">
                                <span class="stat-label">Total Variations:</span>
                                <span class="stat-value" id="totalVariationsCount">100</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Custom Variations:</span>
                                <span class="stat-value" id="customVariationsCount">0</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="gallery-grid-container">
                        <div class="gallery-sections">
                            <!-- Populated dynamically -->
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.galleryModal = modal;
        
        // Get preview canvas
        this.previewCanvas = document.getElementById('galleryPreviewCanvas');
        this.initPreviewSystem();
    }
    
    /**
     * Initialize preview system
     */
    initPreviewSystem() {
        if (this.previewCanvas) {
            // Create a preview visualizer (simplified version)
            this.previewVisualizer = {
                canvas: this.previewCanvas,
                ctx: this.previewCanvas.getContext('2d'),
                params: {},
                
                updateParams(params) {
                    this.params = { ...params };
                },
                
                render() {
                    const ctx = this.ctx;
                    const canvas = this.canvas;
                    
                    // Clear canvas
                    ctx.fillStyle = '#000';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    // Simple geometric preview based on parameters
                    const centerX = canvas.width / 2;
                    const centerY = canvas.height / 2;
                    const time = Date.now() * 0.001;
                    
                    // Generate preview pattern
                    for (let i = 0; i < this.params.gridDensity * 5; i++) {
                        const angle = (i / (this.params.gridDensity * 5)) * Math.PI * 2;
                        const radius = Math.sin(time * this.params.speed + angle * this.params.morphFactor) * 80;
                        
                        const x = centerX + Math.cos(angle) * radius;
                        const y = centerY + Math.sin(angle) * radius;
                        
                        const hue = (this.params.hue + angle * 57.2958 + time * 20) % 360;
                        const alpha = 0.4 + Math.sin(time * 2 + angle) * 0.3;
                        
                        ctx.fillStyle = `hsla(${hue}, 70%, 50%, ${alpha})`;
                        ctx.beginPath();
                        ctx.arc(x, y, 2 + this.params.chaos * 4, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            };
            
            // Start preview render loop
            const previewRender = () => {
                if (this.currentPreview >= 0) {
                    this.previewVisualizer.render();
                }
                requestAnimationFrame(previewRender);
            };
            previewRender();
        }
    }
    
    /**
     * Set up event handlers
     */
    setupEventHandlers() {
        // Close button
        const closeBtn = this.galleryModal.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => this.closeGallery());
        
        // Close on backdrop click
        this.galleryModal.addEventListener('click', (e) => {
            if (e.target === this.galleryModal) {
                this.closeGallery();
            }
        });
        
        // Preview toggle
        const previewToggle = this.galleryModal.querySelector('.preview-toggle');
        previewToggle.addEventListener('click', () => {
            this.togglePreview();
        });
        
        // Export all button
        const exportBtn = this.galleryModal.querySelector('.gallery-export');
        exportBtn.addEventListener('click', () => {
            this.exportAllVariations();
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.galleryModal.classList.contains('active')) {
                switch (e.key) {
                    case 'Escape':
                        this.closeGallery();
                        break;
                    case 'ArrowLeft':
                        this.navigatePreview(-1);
                        break;
                    case 'ArrowRight':
                        this.navigatePreview(1);
                        break;
                }
            }
        });
    }
    
    /**
     * Open gallery modal
     */
    openGallery() {
        this.populateGallery();
        this.updateGalleryStats();
        this.galleryModal.classList.add('active');
    }
    
    /**
     * Close gallery modal
     */
    closeGallery() {
        this.galleryModal.classList.remove('active');
        this.currentPreview = -1;
        this.clearPreview();
    }
    
    /**
     * Populate gallery with variation thumbnails
     */
    populateGallery() {
        const sectionsContainer = this.galleryModal.querySelector('.gallery-sections');
        sectionsContainer.innerHTML = '';
        
        // Create sections for each geometry type
        const geometryTypes = [
            { name: 'Tetrahedron Lattice', range: [0, 3], class: 'tetrahedron' },
            { name: 'Hypercube Lattice', range: [4, 7], class: 'hypercube' },
            { name: 'Sphere Lattice', range: [8, 11], class: 'sphere' },
            { name: 'Torus Lattice', range: [12, 15], class: 'torus' },
            { name: 'Klein Bottle Lattice', range: [16, 19], class: 'klein' },
            { name: 'Fractal Lattice', range: [20, 22], class: 'fractal' },
            { name: 'Wave Lattice', range: [23, 25], class: 'wave' },
            { name: 'Crystal Lattice', range: [26, 29], class: 'crystal' }
        ];
        
        // Add default geometry sections
        geometryTypes.forEach(geomType => {
            const section = this.createGallerySection(geomType.name, geomType.range, geomType.class, true);
            sectionsContainer.appendChild(section);
        });
        
        // Add custom variations section
        const customSection = this.createCustomGallerySection();
        sectionsContainer.appendChild(customSection);
    }
    
    /**
     * Create gallery section for geometry type
     */
    createGallerySection(name, range, className, isDefault) {
        const section = document.createElement('div');
        section.className = 'gallery-section';
        
        const header = document.createElement('h3');
        header.textContent = name;
        header.className = `geometry-header ${className}`;
        
        const grid = document.createElement('div');
        grid.className = 'gallery-grid';
        
        for (let i = range[0]; i <= range[1]; i++) {
            if (i < this.engine.variationManager.variationNames.length || !isDefault) {
                const thumbnail = this.createVariationThumbnail(i, isDefault);
                grid.appendChild(thumbnail);
            }
        }
        
        section.appendChild(header);
        section.appendChild(grid);
        
        return section;
    }
    
    /**
     * Create custom variations gallery section
     */
    createCustomGallerySection() {
        const section = document.createElement('div');
        section.className = 'gallery-section custom-section';
        
        const header = document.createElement('h3');
        header.textContent = 'Custom Variations';
        header.className = 'geometry-header custom';
        
        const grid = document.createElement('div');
        grid.className = 'gallery-grid custom-grid';
        
        // Show only populated custom variations
        for (let i = 0; i < 70; i++) {
            const customVar = this.engine.variationManager.customVariations[i];
            if (customVar) {
                const thumbnail = this.createVariationThumbnail(30 + i, false);
                grid.appendChild(thumbnail);
            }
        }
        
        section.appendChild(header);
        section.appendChild(grid);
        
        return section;
    }
    
    /**
     * Create individual variation thumbnail
     */
    createVariationThumbnail(index, isDefault) {
        const thumbnail = document.createElement('div');
        thumbnail.className = `gallery-thumbnail ${isDefault ? 'default' : 'custom'}`;
        thumbnail.dataset.variation = index;
        
        const name = this.engine.variationManager.getVariationName(index);
        const isCurrent = index === this.engine.currentVariation;
        
        if (isCurrent) {
            thumbnail.classList.add('current');
        }
        
        thumbnail.innerHTML = `
            <div class="thumbnail-preview">
                <div class="variation-number">${index + 1}</div>
                <div class="preview-placeholder"></div>
            </div>
            <div class="thumbnail-info">
                <div class="variation-name">${name}</div>
                <div class="variation-type">${isDefault ? 'Default' : 'Custom'}</div>
            </div>
        `;
        
        // Event handlers
        thumbnail.addEventListener('mouseenter', () => {
            this.showPreview(index);
        });
        
        thumbnail.addEventListener('mouseleave', () => {
            this.clearPreview();
        });
        
        thumbnail.addEventListener('click', () => {
            this.selectVariation(index);
        });
        
        return thumbnail;
    }
    
    /**
     * Show preview for variation
     */
    showPreview(index) {
        this.currentPreview = index;
        
        // Clear existing timeout
        if (this.previewTimeout) {
            clearTimeout(this.previewTimeout);
        }
        
        // Delay preview to avoid rapid changes
        this.previewTimeout = setTimeout(() => {
            if (this.currentPreview === index) {
                const params = this.getVariationParameters(index);
                this.previewVisualizer.updateParams(params);
                
                // Update preview info
                const title = this.galleryModal.querySelector('.preview-title');
                const details = this.galleryModal.querySelector('.preview-details');
                
                title.textContent = this.engine.variationManager.getVariationName(index);
                details.innerHTML = `
                    <div>Variation #${index + 1}</div>
                    <div>Geometry: ${this.getGeometryName(params.geometry)}</div>
                    <div>Density: ${params.gridDensity.toFixed(1)}</div>
                    <div>Hue: ${params.hue}°</div>
                `;
            }
        }, 100);
    }
    
    /**
     * Clear preview
     */
    clearPreview() {
        this.currentPreview = -1;
        
        if (this.previewTimeout) {
            clearTimeout(this.previewTimeout);
        }
        
        const title = this.galleryModal.querySelector('.preview-title');
        const details = this.galleryModal.querySelector('.preview-details');
        
        title.textContent = 'Hover to preview';
        details.innerHTML = '';
    }
    
    /**
     * Select variation and close gallery
     */
    selectVariation(index) {
        this.engine.setVariation(index);
        this.closeGallery();
    }
    
    /**
     * Navigate preview with keyboard
     */
    navigatePreview(direction) {
        let newIndex = this.currentPreview + direction;
        
        // Find next valid variation
        while (newIndex >= 0 && newIndex < 100) {
            if (newIndex < 30 || this.engine.variationManager.customVariations[newIndex - 30] !== null) {
                this.showPreview(newIndex);
                
                // Scroll to thumbnail
                const thumbnail = this.galleryModal.querySelector(`[data-variation="${newIndex}"]`);
                if (thumbnail) {
                    thumbnail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
                break;
            }
            newIndex += direction;
        }
    }
    
    /**
     * Get parameters for specific variation
     */
    getVariationParameters(index) {
        if (index < 30) {
            return this.engine.variationManager.generateDefaultVariation(index);
        } else {
            const customVar = this.engine.variationManager.customVariations[index - 30];
            return customVar ? customVar.parameters : this.engine.parameterManager.getAllParameters();
        }
    }
    
    /**
     * Get geometry name by index
     */
    getGeometryName(index) {
        const names = ['Tetrahedron', 'Hypercube', 'Sphere', 'Torus', 'Klein Bottle', 'Fractal', 'Wave', 'Crystal'];
        return names[index] || 'Unknown';
    }
    
    /**
     * Update gallery statistics
     */
    updateGalleryStats() {
        const stats = this.engine.variationManager.getStatistics();
        
        document.getElementById('totalVariationsCount').textContent = stats.totalVariations;
        document.getElementById('customVariationsCount').textContent = stats.customVariations;
    }
    
    /**
     * Toggle preview system
     */
    togglePreview() {
        const previewContainer = this.galleryModal.querySelector('.preview-container');
        previewContainer.classList.toggle('hidden');
    }
    
    /**
     * Export all variations as ZIP
     */
    exportAllVariations() {
        this.engine.statusManager.info('Exporting all variations...');
        
        // This would typically create a ZIP file with all variation configs
        // For now, export custom variations
        this.engine.variationManager.exportCustomVariations();
    }
}