/**
 * Export System - Safe HTML gallery generation
 * Clean implementation without nested JavaScript execution
 * Version: 2025-07-08-v3 (Collection Manager Integration)
 */
import { CollectionManager } from './CollectionManager.js';

export class ExportSystem {
    constructor(holographicSystem) {
        this.system = holographicSystem;
        this.profileName = 'Active Holographic Systems';
        this.collectionManager = new CollectionManager();
    }
    
    /**
     * Add current variation to gallery (opens gallery with new item)
     */
    addToGallery() {
        const currentVariation = this.getVariationById(this.system.currentVariant);
        if (!currentVariation) {
            console.error('No current variation to add to gallery');
            return;
        }
        
        // Get existing gallery items from localStorage
        let galleryItems = [];
        try {
            const saved = localStorage.getItem('holographicGallery');
            if (saved) {
                galleryItems = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Could not load existing gallery:', e);
        }
        
        // Check if this variation is already in gallery
        const existingIndex = galleryItems.findIndex(item => 
            item.id === currentVariation.id ||
            (item.parameters.geometryType === currentVariation.parameters.geometryType &&
             Math.abs(item.parameters.density - currentVariation.parameters.density) < 0.01 &&
             Math.abs(item.parameters.speed - currentVariation.parameters.speed) < 0.01)
        );
        
        if (existingIndex >= 0) {
            console.log(`➡️ Variation "${currentVariation.name}" already in gallery`);
        } else {
            // Add new variation to gallery
            galleryItems.push({
                ...currentVariation,
                addedDate: new Date().toISOString(),
                fromSystem: 'Active Holographic Systems'
            });
            
            // Save updated gallery
            try {
                localStorage.setItem('holographicGallery', JSON.stringify(galleryItems));
                console.log(`➕ Added "${currentVariation.name}" to gallery (${galleryItems.length} total)`);
            } catch (e) {
                console.error('Failed to save to gallery:', e);
            }
        }
        
        // Open gallery viewer
        this.openGalleryViewer(galleryItems);
    }
    
    /**
     * Open gallery viewer in new window/tab
     */
    openGalleryViewer(galleryItems) {
        const galleryHTML = this.generateGalleryViewerHTML(galleryItems);
        const blob = new Blob([galleryHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const galleryWindow = window.open(url, 'holographic-gallery', 'width=1200,height=800');
        if (!galleryWindow) {
            console.warn('Gallery popup blocked, downloading instead');
            this.downloadFile(galleryHTML, 'holographic-gallery.html');
        } else {
            // Clean up URL after window loads
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
    }
    
    /**
     * Export complete gallery as downloadable file (for backup)
     */
    exportCompleteGallery() {
        let galleryItems = [];
        try {
            const saved = localStorage.getItem('holographicGallery');
            if (saved) {
                galleryItems = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Could not load gallery:', e);
        }
        
        if (galleryItems.length === 0) {
            alert('No items in gallery to export. Add some variations first!');
            return;
        }
        
        const html = this.generateGalleryViewerHTML(galleryItems);
        this.downloadFile(html, 'holographic-gallery.html');
        console.log(`✅ Exported gallery with ${galleryItems.length} variations`);
    }
    
    /**
     * Export single variation as standalone HTML
     */
    exportSingleVariation(variantId) {
        const variation = this.getVariationById(variantId);
        if (!variation) {
            console.error('Variation not found:', variantId);
            return;
        }
        
        const html = this.generateSingleVariationHTML(variation);
        this.downloadFile(html, `holographic-${variation.name.toLowerCase().replace(/\s+/g, '-')}.html`);
        console.log(`✅ Exported standalone variation: ${variation.name}`);
    }
    
    /**
     * Export variations as JSON data (auto-discovery compatible)
     */
    exportJSON() {
        // Create collection from current custom variations
        const collection = this.collectionManager.createCustomCollection(
            this.system.customVariants,
            `${this.profileName} Custom Pack`
        );
        
        // Generate filename with date
        const dateStr = new Date().toISOString().split('T')[0];
        const filename = `user-custom-${dateStr}.json`;
        
        // Save using collection manager
        this.collectionManager.saveCollection(collection, filename);
        
        console.log(`📁 Collection exported: ${filename}`);
        console.log(`📂 To use: Move ${filename} to collections/ folder and refresh portfolio`);
    }
    
    /**
     * Import variations from JSON file
     */
    importJSON(fileInput) {
        const file = fileInput.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.type === 'holographic-collection') {
                    this.system.customVariants = data.customVariations || [];
                    this.system.totalVariants = this.system.baseVariants + this.system.customVariants.length;
                    this.system.saveVariations();
                    console.log(`Imported ${this.system.customVariants.length} custom variations`);
                } else {
                    throw new Error('Invalid file format');
                }
            } catch (error) {
                console.error('Failed to import JSON:', error);
                alert('Failed to import variations. Please check the file format.');
            }
        };
        reader.readAsText(file);
    }
    
    /**
     * Get all variations (base + custom)
     */
    getAllVariations() {
        const variations = [];
        
        // Add base variations (0-29)
        for (let i = 0; i < this.system.baseVariants; i++) {
            // Get variant name from system
            const variantName = this.system.variantNames[i] || `Base Variant ${i + 1}`;
            
            // Create base variant with standard parameters
            const geometryType = Math.floor(i / 4); // 0-7 for 8 geometries
            const variation = i % 4; // 0-3 for 4 variations per geometry
            
            variations.push({
                id: i,
                name: variantName,
                isCustom: false,
                parameters: {
                    geometryType: geometryType,
                    density: 1.0 + variation * 0.3,
                    speed: 0.5 + variation * 0.2,
                    chaos: variation * 0.25,
                    morph: variation * 0.3,
                    hue: (geometryType * 45) % 360,
                    saturation: 0.8,
                    intensity: 0.5 + variation * 0.1
                }
            });
        }
        
        // Add custom variations
        this.system.customVariants.forEach((cv, index) => {
            variations.push({
                id: this.system.baseVariants + index,
                name: cv.name || `Custom ${index + 1}`,
                isCustom: true,
                parameters: {
                    geometryType: cv.params.geometry,
                    density: cv.params.density,
                    speed: cv.params.speed,
                    chaos: cv.params.chaos,
                    morph: cv.params.morph,
                    hue: cv.params.hue,
                    saturation: cv.params.saturation,
                    intensity: cv.params.intensity
                }
            });
        });
        
        return variations;
    }
    
    /**
     * Get variation by ID
     */
    getVariationById(id) {
        const variations = this.getAllVariations();
        return variations.find(v => v.id === id);
    }
    
    /**
     * Generate gallery viewer HTML with grid layout
     */
    generateGalleryViewerHTML(galleryItems) {
        const cssStyles = this.generateGalleryCSS();
        const jsCore = this.generateCoreJavaScript();
        
        let variationCards = '';
        galleryItems.forEach(item => {
            variationCards += this.generateGalleryItemCard(item);
        });
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.escapeHtml(this.profileName)} - Holographic Gallery</title>
    <style>${cssStyles}</style>
</head>
<body>
    <div class="gallery-header">
        <h1>🌌 Holographic Gallery</h1>
        <p>Personal Collection - ${galleryItems.length} Variations</p>
        <div class="controls">
            <button onclick="toggleAutoplay()">Auto Play</button>
            <button onclick="window.print()">Print Gallery</button>
            <button onclick="window.close()">Close</button>
        </div>
    </div>
    
    <div class="gallery-grid">
        ${variationCards}
    </div>
    
    <script>${jsCore}</script>
</body>
</html>`;
    }
    
    /**
     * Generate single variation HTML using working modular system
     */
    generateSingleVariationHTML(variation) {
        // Build URL parameters for the variation
        const params = new URLSearchParams({
            geometry: variation.parameters.geometryType || 0,
            density: variation.parameters.density || 1.0,
            speed: variation.parameters.speed || 0.5,
            chaos: variation.parameters.chaos || 0.0,
            morph: variation.parameters.morph || 0.0,
            hue: variation.parameters.hue || 0,
            saturation: variation.parameters.saturation || 0.8,
            intensity: variation.parameters.intensity || 0.5,
            autoplay: 'true'
        });
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.escapeHtml(variation.name)} - Holographic Visualization</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
        
        body {
            margin: 0;
            background: #000;
            overflow: hidden;
            font-family: 'Orbitron', 'Courier New', monospace;
            height: 100vh;
            position: relative;
        }
        
        .info-overlay {
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.9);
            border: 1px solid #00ffff;
            border-radius: 15px;
            padding: 20px;
            color: #fff;
            font-family: 'Orbitron', monospace;
            z-index: 1000;
            backdrop-filter: blur(25px);
            max-width: 300px;
            transition: opacity 0.3s ease;
        }
        
        .info-overlay h1 {
            color: #00ffff;
            font-size: 1.2rem;
            margin: 0 0 15px 0;
            text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
        }
        
        .param-row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            font-size: 0.8rem;
        }
        
        .param-label {
            color: rgba(0, 255, 255, 0.7);
        }
        
        .param-value {
            color: #ffffff;
            font-weight: bold;
        }
        
        .controls {
            margin-top: 15px;
            display: flex;
            gap: 10px;
        }
        
        .controls button {
            background: rgba(0, 255, 255, 0.2);
            border: 1px solid #00ffff;
            color: #00ffff;
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-family: 'Orbitron', monospace;
            font-size: 0.7rem;
            transition: all 0.3s ease;
        }
        
        .controls button:hover {
            background: rgba(0, 255, 255, 0.4);
            box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
        }
        
        .holographic-frame {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: none;
        }
        
        .loading-message {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #00ffff;
            font-size: 1.2rem;
            text-align: center;
            z-index: 10;
        }
    </style>
</head>
<body>
    <div class="info-overlay" id="infoPanel">
        <h1>${this.escapeHtml(variation.name)}</h1>
        <div class="parameters">
            <div class="param-row">
                <span class="param-label">Geometry:</span>
                <span class="param-value">${this.getGeometryName(variation.parameters.geometryType)}</span>
            </div>
            <div class="param-row">
                <span class="param-label">Density:</span>
                <span class="param-value">${variation.parameters.density.toFixed(2)}</span>
            </div>
            <div class="param-row">
                <span class="param-label">Speed:</span>
                <span class="param-value">${variation.parameters.speed.toFixed(2)}</span>
            </div>
            <div class="param-row">
                <span class="param-label">Chaos:</span>
                <span class="param-value">${variation.parameters.chaos.toFixed(2)}</span>
            </div>
            <div class="param-row">
                <span class="param-label">Morph:</span>
                <span class="param-value">${variation.parameters.morph.toFixed(2)}</span>
            </div>
            <div class="param-row">
                <span class="param-label">Hue:</span>
                <span class="param-value">${variation.parameters.hue.toFixed(0)}°</span>
            </div>
        </div>
        <div class="controls">
            <button onclick="toggleInfo()">Hide Info</button>
            <button onclick="location.reload()">Reload</button>
        </div>
    </div>
    
    <div class="loading-message" id="loadingMsg">
        🌌 Loading Holographic System...
    </div>
    
    <!-- Use the working modular system as embedded iframe -->
    <iframe 
        class="holographic-frame" 
        id="holographicFrame"
        onload="frameLoaded()"
        style="display: none;">
    </iframe>
    
    <script>
        // Load the working modular system with specific parameters
        function frameLoaded() {
            document.getElementById('loadingMsg').style.display = 'none';
            document.getElementById('holographicFrame').style.display = 'block';
            console.log('✅ Holographic system loaded successfully');
        }
        
        function toggleInfo() {
            const panel = document.getElementById('infoPanel');
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }
        
        // Auto-hide info panel after 8 seconds
        setTimeout(() => {
            const panel = document.getElementById('infoPanel');
            panel.style.opacity = '0.3';
        }, 8000);
        
        // Initialize the iframe with proper parameters
        window.addEventListener('load', () => {
            const iframe = document.getElementById('holographicFrame');
            const demoUrl = './demo-modular.html?${params.toString()}';
            
            console.log('🎯 Loading variation with URL:', demoUrl);
            iframe.src = demoUrl;
        });
    </script>
</body>
</html>`;
    }
    
    /**
     * Generate single variation CSS styles (removed - using iframe approach)
     */
    generateSingleVariationCSS() {
        // This method is no longer used with the iframe approach
        return '';
    }
    
    /**
     * Build parameters query string for URL
     */
    buildParametersQuery(parameters) {
        const params = new URLSearchParams({
            geometry: parameters.geometryType || 0,
            density: parameters.density || 1.0,
            speed: parameters.speed || 0.5,
            chaos: parameters.chaos || 0.0,
            morph: parameters.morph || 0.0,
            hue: parameters.hue || 0,
            saturation: parameters.saturation || 0.8,
            intensity: parameters.intensity || 0.5
        });
        return params.toString();
    }
    
    /**
     * Build demo URL with parameters
     */
    buildDemoURL(parameters, baseUrl = './demo-modular.html') {
        const urlParams = new URLSearchParams({
            geometry: parameters.geometryType || 0,
            density: parameters.density || 1.0,
            speed: parameters.speed || 0.5,
            chaos: parameters.chaos || 0.0,
            morph: parameters.morph || 0.0,
            hue: parameters.hue || 0,
            saturation: parameters.saturation || 0.8,
            intensity: parameters.intensity || 0.5,
            autoplay: 'true'
        });
        return `${baseUrl}?${urlParams.toString()}`;
    }
    
    /**
     * Generate gallery CSS styles
     */
    generateGalleryCSS() {
        return `
            @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
            
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body {
                background: #000;
                color: #fff;
                font-family: 'Orbitron', monospace;
                line-height: 1.6;
                background: radial-gradient(ellipse at center, #1a0033 0%, #000000 70%);
            }
            
            .gallery-header {
                text-align: center;
                padding: 40px 20px;
                border-bottom: 1px solid rgba(0, 255, 255, 0.3);
                margin-bottom: 40px;
            }
            
            .gallery-header h1 {
                color: #00ffff;
                font-size: 2.5rem;
                margin-bottom: 10px;
                text-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
            }
            
            .gallery-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 30px;
                padding: 20px;
                max-width: 1400px;
                margin: 0 auto;
            }
            
            .variation-card {
                background: rgba(0, 0, 0, 0.8);
                border: 1px solid rgba(0, 255, 255, 0.3);
                border-radius: 15px;
                padding: 20px;
                transition: all 0.3s ease;
                cursor: pointer;
            }
            
            .variation-card:hover {
                border-color: #00ffff;
                box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
                transform: translateY(-5px);
            }
            
            .card-preview {
                width: 100%;
                height: 200px;
                border-radius: 10px;
                overflow: hidden;
                margin-bottom: 15px;
                background: #111;
            }
            
            .card-preview iframe {
                width: 100%;
                height: 100%;
                border: none;
            }
            
            .card-info h3 {
                color: #00ffff;
                font-size: 1.1rem;
                margin-bottom: 8px;
            }
            
            .card-controls {
                display: flex;
                gap: 10px;
                margin-top: 15px;
            }
            
            .card-controls button {
                background: rgba(0, 255, 255, 0.2);
                border: 1px solid #00ffff;
                color: #00ffff;
                padding: 8px 12px;
                border-radius: 6px;
                cursor: pointer;
                font-family: 'Orbitron', monospace;
                font-size: 0.7rem;
                transition: all 0.3s ease;
            }
            
            .card-controls button:hover {
                background: rgba(0, 255, 255, 0.4);
                box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
            }
        `;
    }
    
    /**
     * Generate gallery item card HTML  
     */
    generateGalleryItemCard(variation) {
        const parametersQuery = this.buildParametersQuery(variation.parameters);
        const customBadge = variation.isCustom ? '<span class="custom-badge">CUSTOM</span>' : '';
        const dateAdded = variation.addedDate ? new Date(variation.addedDate).toLocaleDateString() : 'Unknown';
        
        return `
        <div class="variation-card" data-id="${variation.id}">
            <div class="card-header">
                <h3>${this.escapeHtml(variation.name)}</h3>
                ${customBadge}
            </div>
            <div class="card-preview">
                <iframe src="./demo-modular.html?${parametersQuery}&autoplay=true" loading="lazy"></iframe>
            </div>
            <div class="card-info">
                <small>Added: ${dateAdded}</small>
            </div>
            <div class="card-controls">
                <button onclick="openFullscreen(${variation.id})">Fullscreen</button>
                <button onclick="exportSingle(${variation.id})">Export</button>
            </div>
        </div>`;
    }
    
    /**
     * Helper method to get geometry name
     */
    getGeometryName(geometryType) {
        const geometryNames = [
            'TETRAHEDRON', 'TETRAHEDRON', 'TETRAHEDRON', 'TETRAHEDRON',
            'HYPERCUBE', 'HYPERCUBE', 'HYPERCUBE', 'HYPERCUBE', 
            'SPHERE', 'SPHERE', 'SPHERE', 'SPHERE',
            'TORUS', 'TORUS', 'TORUS', 'TORUS',
            'KLEIN BOTTLE', 'KLEIN BOTTLE', 'KLEIN BOTTLE', 'KLEIN BOTTLE',
            'FRACTAL', 'FRACTAL', 'FRACTAL',
            'WAVE', 'WAVE', 'WAVE',
            'CRYSTAL', 'CRYSTAL', 'CRYSTAL', 'CRYSTAL'
        ];
        return geometryNames[geometryType] || 'UNKNOWN';
    }
    
    /**
     * Safe HTML escaping
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Download file helper
     */
    downloadFile(content, filename) {
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log(`📁 Downloaded: ${filename}`);
    }
    
    /**
     * Generate gallery item card
     */
    generateGalleryItemCard(item) {
        const parametersQuery = this.buildParametersQuery(item.parameters);
        const customBadge = item.isCustom ? '<span class="custom-badge">CUSTOM</span>' : '';
        const dateAdded = item.addedDate ? new Date(item.addedDate).toLocaleDateString() : 'Unknown';
        
        return `
        <div class="variation-card" data-id="${item.id}">
            <div class="card-header">
                <h3>${this.escapeHtml(item.name)}</h3>
                ${customBadge}
            </div>
            <div class="card-preview">
                <iframe src="${parametersQuery}&autoplay=true" loading="lazy"></iframe>
            </div>
            <div class="card-controls">
                <button onclick="openFullscreen(${item.id})">Fullscreen</button>
                <button onclick="exportSingle(${item.id})">Export</button>
            </div>
        </div>`;
    }
    
    /**
     * Build parameters query string for URLs
     */
    buildParametersQuery(params) {
        const baseUrl = './demo-modular.html';
        const urlParams = new URLSearchParams();
        
        if (params.geometryType !== undefined) urlParams.set('geometry', params.geometryType);
        if (params.density !== undefined) urlParams.set('density', params.density);
        if (params.speed !== undefined) urlParams.set('speed', params.speed);
        if (params.chaos !== undefined) urlParams.set('chaos', params.chaos);
        if (params.morph !== undefined) urlParams.set('morph', params.morph);
        if (params.hue !== undefined) urlParams.set('hue', params.hue);
        if (params.saturation !== undefined) urlParams.set('saturation', params.saturation);
        if (params.intensity !== undefined) urlParams.set('intensity', params.intensity);
        
        return `${baseUrl}?${urlParams.toString()}`;
    }
    
    /**
     * Build demo URL with parameters
     */
    buildDemoURL(parameters, baseUrl = './demo-modular.html') {
        const urlParams = new URLSearchParams({
            geometry: parameters.geometryType || 0,
            density: parameters.density || 1.0,
            speed: parameters.speed || 0.5,
            chaos: parameters.chaos || 0.0,
            morph: parameters.morph || 0.0,
            hue: parameters.hue || 0,
            saturation: parameters.saturation || 0.8,
            intensity: parameters.intensity || 0.5,
            autoplay: 'true'
        });
        return `${baseUrl}?${urlParams.toString()}`;
    }
    
    /**
     * Generate gallery CSS styles
     */
    generateGalleryCSS() {
        return `
            @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
            
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body {
                background: #000;
                color: #fff;
                font-family: 'Orbitron', monospace;
                line-height: 1.6;
                background: radial-gradient(ellipse at center, #1a0033 0%, #000000 70%);
            }
            
            .gallery-header {
                text-align: center;
                padding: 40px 20px;
                border-bottom: 1px solid rgba(0, 255, 255, 0.3);
                margin-bottom: 40px;
            }
            
            .gallery-header h1 {
                color: #00ffff;
                font-size: 2.5rem;
                margin-bottom: 10px;
                text-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
            }
            
            .gallery-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 30px;
                padding: 20px;
                max-width: 1400px;
                margin: 0 auto;
            }
            
            .variation-card {
                background: rgba(0, 0, 0, 0.8);
                border: 1px solid rgba(0, 255, 255, 0.3);
                border-radius: 15px;
                padding: 20px;
                transition: all 0.3s ease;
                cursor: pointer;
            }
            
            .variation-card:hover {
                border-color: #00ffff;
                box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
                transform: translateY(-5px);
            }
            
            .card-preview {
                width: 100%;
                height: 200px;
                border-radius: 10px;
                overflow: hidden;
                margin-bottom: 15px;
                background: #111;
            }
            
            .card-preview iframe {
                width: 100%;
                height: 100%;
                border: none;
            }
            
            .card-info h3 {
                color: #00ffff;
                font-size: 1.1rem;
                margin-bottom: 8px;
            }
            
            .card-controls {
                display: flex;
                gap: 10px;
                margin-top: 15px;
            }
            
            .card-controls button {
                background: rgba(0, 255, 255, 0.2);
                border: 1px solid #00ffff;
                color: #00ffff;
                padding: 8px 12px;
                border-radius: 6px;
                cursor: pointer;
                font-family: 'Orbitron', monospace;
                font-size: 0.7rem;
                transition: all 0.3s ease;
            }
            
            .card-controls button:hover {
                background: rgba(0, 255, 255, 0.4);
                box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
            }
        `;
    }
    
    /**
     * Generate core JavaScript for gallery functionality
     */
    generateCoreJavaScript() {
        return `
            let autoplayInterval = null;
            let currentIndex = 0;
            
            function toggleAutoplay() {
                if (autoplayInterval) {
                    clearInterval(autoplayInterval);
                    autoplayInterval = null;
                    event.target.textContent = 'Auto Play';
                } else {
                    autoplayInterval = setInterval(() => {
                        const cards = document.querySelectorAll('.variation-card');
                        if (cards.length > 0) {
                            currentIndex = (currentIndex + 1) % cards.length;
                            cards[currentIndex].scrollIntoView({ 
                                behavior: 'smooth', 
                                block: 'center' 
                            });
                        }
                    }, 5000);
                    event.target.textContent = 'Stop Auto';
                }
            }
            
            function openFullscreen(variantId) {
                const url = './demo-modular.html?variant=' + variantId + '&autoplay=true';
                window.open(url, '_blank');
            }
            
            function exportSingle(variantId) {
                alert('Export functionality requires the main holographic system');
            }
        `;
    }
}