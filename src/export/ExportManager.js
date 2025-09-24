/**
 * VIB34D Export/Import Management System
 * Handles all export and import functionality for configurations and media
 */

export class ExportManager {
    constructor(engine) {
        this.engine = engine;
        this.setupFileInputs();
    }
    
    /**
     * Set up file input handlers
     */
    setupFileInputs() {
        // Create hidden file inputs
        const jsonInput = document.createElement('input');
        jsonInput.type = 'file';
        jsonInput.id = 'jsonFileInput';
        jsonInput.accept = '.json';
        jsonInput.style.display = 'none';
        jsonInput.addEventListener('change', (e) => this.handleJSONImport(e));
        document.body.appendChild(jsonInput);
        
        const folderInput = document.createElement('input');
        folderInput.type = 'file';
        folderInput.id = 'folderInput';
        folderInput.webkitdirectory = true;
        folderInput.multiple = true;
        folderInput.style.display = 'none';
        folderInput.addEventListener('change', (e) => this.handleFolderImport(e));
        document.body.appendChild(folderInput);
    }
    
    /**
     * Export current configuration as JSON
     */
    exportJSON() {
        const config = {
            version: "2.0",
            type: "vib34d-integrated-config",
            name: `${this.engine.variationManager.getVariationName(this.engine.currentVariation)} - ${new Date().toLocaleDateString()}`,
            variation: this.engine.currentVariation,
            parameters: this.engine.parameterManager.getAllParameters(),
            timestamp: Date.now(),
            metadata: {
                engine: "VIB34D Integrated",
                features: ["5-layer holographic", "100 variations", "4D mathematics", "agent-ready"],
                author: "Paul Phillips (domusgpt)",
                email: "phillips.paul.email@gmail.com"
            }
        };
        
        const json = JSON.stringify(config, null, 2);
        this.downloadFile(json, 'vib34d-config.json', 'application/json');
        this.engine.statusManager.success('Configuration exported as JSON');
    }
    
    /**
     * Save to Gallery - Creates properly formatted collection for gallery system
     */
    saveToGallery(customName = null) {
        // Get current state
        const params = this.engine.parameterManager.getAllParameters();
        const variationName = customName || this.engine.variationManager.getVariationName(this.engine.currentVariation);
        const timestamp = new Date().toISOString();
        
        // Format as holographic-collection (gallery format)
        const collection = {
            name: `Custom Gallery Collection - ${new Date().toLocaleDateString()}`,
            description: `User-saved variation: ${variationName}`,
            version: "1.0",
            type: "holographic-collection", // Required by gallery system
            profileName: "VIB34D System",
            totalVariations: 1,
            created: timestamp,
            variations: [{
                id: 0,
                name: variationName,
                isCustom: true,
                globalId: Date.now(), // Unique identifier
                system: "faceted", // System type for gallery
                parameters: {
                    // Map VIB34D parameters to gallery format
                    geometryType: params.geometry || 0,
                    density: params.gridDensity || 10,
                    speed: params.speed || 1.0,
                    chaos: params.chaos || 0.0,
                    morph: params.morphFactor || 0.0,
                    hue: params.hue || 200,
                    saturation: 0.8,
                    intensity: 0.5,
                    // Include 4D parameters
                    rot4dXW: params.rot4dXW || 0,
                    rot4dYW: params.rot4dYW || 0,
                    rot4dZW: params.rot4dZW || 0,
                    dimension: params.dimension || 3.8
                }
            }]
        };
        
        const json = JSON.stringify(collection, null, 2);
        const filename = `custom-${Date.now()}.json`;
        
        // Download with instructions
        this.downloadFile(json, filename, 'application/json');
        
        // Show detailed instructions
        this.engine.statusManager.success(
            `🎯 Saved for Gallery!<br><br>` +
            `<strong>File:</strong> ${filename}<br>` +
            `<strong>Next Steps:</strong><br>` +
            `1. Find downloaded file in your Downloads folder<br>` +
            `2. Move it to the <code>collections/</code> folder in your VIB34D directory<br>` +
            `3. Refresh gallery to see your variation<br><br>` +
            `<small>The gallery only shows collections from the collections/ folder</small>`
        );
        
        console.log('🎯 Gallery collection saved:', filename);
        return filename;
    }
    
    /**
     * Export current configuration as CSS theme
     */
    exportCSS() {
        const params = this.engine.parameterManager.getAllParameters();
        const cssContent = `/* VIB34D Integrated Holographic CSS Theme */
/* Generated: ${new Date().toISOString()} */
/* Variation: ${this.engine.currentVariation + 1} - ${this.engine.variationManager.getVariationName(this.engine.currentVariation)} */

:root {
    /* VIB34D Parameters */
    --vib34d-variation: ${this.engine.currentVariation};
    --vib34d-geometry: ${params.geometry};
    --vib34d-grid-density: ${params.gridDensity};
    --vib34d-morph-factor: ${params.morphFactor};
    --vib34d-chaos: ${params.chaos};
    --vib34d-speed: ${params.speed};
    --vib34d-hue: ${params.hue}deg;
    --vib34d-rot-4d-xw: ${params.rot4dXW};
    --vib34d-rot-4d-yw: ${params.rot4dYW};
    --vib34d-rot-4d-zw: ${params.rot4dZW};
    --vib34d-dimension: ${params.dimension};
}

.vib34d-holographic {
    /* Base holographic background */
    background: linear-gradient(45deg, 
        hsl(${params.hue}, 70%, 30%) 0%,
        hsl(${(params.hue + 60) % 360}, 70%, 20%) 25%,
        hsl(${(params.hue + 120) % 360}, 70%, 25%) 50%,
        hsl(${(params.hue + 180) % 360}, 70%, 20%) 75%,
        hsl(${(params.hue + 240) % 360}, 70%, 30%) 100%);
    
    /* Animation based on parameters */
    animation: vib34d-holographic-pulse ${3 / params.speed}s infinite;
    
    /* 4D transformation simulation */
    transform: perspective(1000px) 
               rotateX(${params.rot4dXW * 5}deg) 
               rotateY(${params.rot4dYW * 5}deg) 
               rotateZ(${params.rot4dZW * 5}deg);
    
    /* Layer effects */
    position: relative;
    overflow: hidden;
}

.vib34d-holographic::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 50% 50%, 
        hsla(${(params.hue + 30) % 360}, 80%, 50%, 0.3) 0%,
        hsla(${(params.hue + 90) % 360}, 70%, 40%, 0.2) 30%,
        transparent 60%);
    mix-blend-mode: screen;
    animation: vib34d-overlay-rotate ${6 / params.speed}s linear infinite;
}

.vib34d-holographic::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: repeating-linear-gradient(
        ${params.rot4dXW * 90}deg,
        transparent 0px,
        hsla(${params.hue}, 60%, 60%, ${0.1 + params.chaos * 0.2}) ${2 + params.gridDensity * 0.5}px,
        transparent ${4 + params.gridDensity}px
    );
    mix-blend-mode: overlay;
}

@keyframes vib34d-holographic-pulse {
    0% { 
        filter: hue-rotate(0deg) saturate(1) brightness(1);
        transform: perspective(1000px) 
                   rotateX(${params.rot4dXW * 5}deg) 
                   rotateY(${params.rot4dYW * 5}deg) 
                   rotateZ(${params.rot4dZW * 5}deg) 
                   scale(1);
    }
    50% { 
        filter: hue-rotate(${params.chaos * 180}deg) 
                saturate(${1 + params.morphFactor}) 
                brightness(${1.1 + params.morphFactor * 0.3});
        transform: perspective(1000px) 
                   rotateX(${params.rot4dXW * 5 + 2}deg) 
                   rotateY(${params.rot4dYW * 5 + 2}deg) 
                   rotateZ(${params.rot4dZW * 5 + 2}deg) 
                   scale(${1 + params.morphFactor * 0.1});
    }
    100% { 
        filter: hue-rotate(360deg) saturate(1) brightness(1);
        transform: perspective(1000px) 
                   rotateX(${params.rot4dXW * 5}deg) 
                   rotateY(${params.rot4dYW * 5}deg) 
                   rotateZ(${params.rot4dZW * 5}deg) 
                   scale(1);
    }
}

@keyframes vib34d-overlay-rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

/* Interactive effects */
.vib34d-holographic:hover {
    animation-duration: ${1.5 / params.speed}s;
    filter: saturate(${1.2 + params.morphFactor * 0.3}) brightness(${1.1 + params.chaos * 0.2});
}

.vib34d-holographic:active {
    transform: perspective(1000px) 
               rotateX(${params.rot4dXW * 5 + 5}deg) 
               rotateY(${params.rot4dYW * 5 + 5}deg) 
               rotateZ(${params.rot4dZW * 5 + 3}deg) 
               scale(${0.95 + params.morphFactor * 0.05});
}

/* Configuration comment for reference */
/* VIB34D Configuration: ${JSON.stringify(params, null, 2)} */`;
        
        this.downloadFile(cssContent, 'vib34d-holographic.css', 'text/css');
        this.engine.statusManager.success('CSS theme exported');
    }
    
    /**
     * Export complete HTML page with current visualization
     */
    exportHTML() {
        const params = this.engine.parameterManager.getAllParameters();
        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VIB34D Holographic Export - Variation ${this.engine.currentVariation + 1}</title>
    <style>
        body { 
            margin: 0; 
            padding: 0;
            background: #000; 
            font-family: 'Orbitron', 'Courier New', monospace; 
            overflow: hidden;
        }
        #holographic-canvas { 
            width: 100vw; 
            height: 100vh; 
            display: block;
        }
        .info-overlay {
            position: fixed;
            top: 20px;
            left: 20px;
            color: #fff;
            background: rgba(0,0,0,0.7);
            padding: 15px;
            border-radius: 8px;
            font-size: 12px;
            z-index: 1000;
            max-width: 300px;
        }
        .info-overlay h3 {
            margin: 0 0 10px 0;
            color: hsl(${params.hue}, 70%, 70%);
        }
    </style>
</head>
<body>
    <canvas id="holographic-canvas"></canvas>
    
    <div class="info-overlay">
        <h3>VIB34D Holographic Export</h3>
        <div>Variation: ${this.engine.currentVariation + 1} - ${this.engine.variationManager.getVariationName(this.engine.currentVariation)}</div>
        <div>Geometry: ${this.getGeometryName(params.geometry)}</div>
        <div>Generated: ${new Date().toLocaleString()}</div>
        <div style="margin-top: 10px; font-size: 10px; opacity: 0.7;">
            Click to interact • Double-click to randomize
        </div>
    </div>

    <script>
// VIB34D Configuration
const vib34dConfig = ${JSON.stringify(params, null, 4)};

// Simplified renderer for exported HTML
class ExportedHolographicRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.config = vib34dConfig;
        this.time = 0;
        this.mouseX = 0.5;
        this.mouseY = 0.5;
        this.mouseIntensity = 0;
        this.clickIntensity = 0;
        
        this.setupInteraction();
        this.render();
    }
    
    setupInteraction() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = (e.clientX - rect.left) / rect.width;
            this.mouseY = (e.clientY - rect.top) / rect.height;
            this.mouseIntensity = 0.5;
        });
        
        this.canvas.addEventListener('click', () => {
            this.clickIntensity = 1.0;
        });
        
        this.canvas.addEventListener('dblclick', () => {
            this.randomizeConfig();
        });
    }
    
    randomizeConfig() {
        this.config.hue = Math.random() * 360;
        this.config.gridDensity = 4 + Math.random() * 26;
        this.config.morphFactor = Math.random() * 2;
        this.config.chaos = Math.random();
        this.config.speed = 0.1 + Math.random() * 2.9;
        this.clickIntensity = 1.5;
    }
    
    render() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        const ctx = this.ctx;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Generate holographic pattern based on config
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const interactionX = centerX + (this.mouseX - 0.5) * this.canvas.width * 0.3;
        const interactionY = centerY + (this.mouseY - 0.5) * this.canvas.height * 0.3;
        
        // Multiple layers for depth
        const layers = [
            { alpha: 0.2, size: 1, offset: 0 },
            { alpha: 0.3, size: 1.5, offset: 0.3 },
            { alpha: 0.4, size: 2, offset: 0.6 },
            { alpha: 0.3, size: 1.2, offset: 0.9 },
            { alpha: 0.5, size: 2.5, offset: 1.2 }
        ];
        
        layers.forEach((layer, layerIndex) => {
            for (let i = 0; i < this.config.gridDensity * 8; i++) {
                const angle = (i / (this.config.gridDensity * 8)) * Math.PI * 2;
                const radius = Math.sin(this.time * 0.001 * this.config.speed + angle * this.config.morphFactor + layer.offset) * 
                              (100 + layerIndex * 30) * (1 + this.mouseIntensity * 0.5);
                
                const x = interactionX + Math.cos(angle) * radius;
                const y = interactionY + Math.sin(angle) * radius;
                
                const hue = (this.config.hue + angle * 57.2958 + this.time * 0.1 + layerIndex * 20) % 360;
                const alpha = (layer.alpha + Math.sin(this.time * 0.002 + angle) * 0.2) * 
                             (1 + this.clickIntensity * 0.5);
                
                ctx.fillStyle = \`hsla(\${hue}, 70%, \${50 + layerIndex * 10}%, \${alpha})\`;
                ctx.beginPath();
                ctx.arc(x, y, (2 + this.config.chaos * 3) * layer.size, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        
        // Decay intensities
        this.mouseIntensity *= 0.95;
        this.clickIntensity *= 0.92;
        
        this.time += 16;
        requestAnimationFrame(() => this.render());
    }
}

// Initialize when page loads
window.addEventListener('load', () => {
    new ExportedHolographicRenderer(document.getElementById('holographic-canvas'));
});
    </script>
</body>
</html>`;
        
        this.downloadFile(htmlContent, 'vib34d-holographic.html', 'text/html');
        this.engine.statusManager.success('HTML file exported');
    }
    
    /**
     * Export current visualization as PNG
     */
    exportPNG() {
        try {
            const canvas = document.getElementById('content-canvas');
            if (!canvas) {
                throw new Error('Content canvas not found');
            }
            
            const link = document.createElement('a');
            link.download = `vib34d-variation-${this.engine.currentVariation + 1}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            this.engine.statusManager.success('PNG image exported');
        } catch (error) {
            this.engine.statusManager.error('PNG export failed: ' + error.message);
        }
    }
    
    /**
     * Trigger JSON import file dialog
     */
    importJSON() {
        document.getElementById('jsonFileInput').click();
    }
    
    /**
     * Trigger folder import dialog
     */
    importFolder() {
        document.getElementById('folderInput').click();
    }
    
    /**
     * Handle JSON file import
     */
    async handleJSONImport(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            const text = await file.text();
            const config = JSON.parse(text);
            
            if (this.validateConfiguration(config)) {
                this.loadConfiguration(config);
                this.engine.statusManager.success(`Configuration imported: ${config.name || 'Unnamed'}`);
            } else {
                this.engine.statusManager.error('Invalid configuration file');
            }
        } catch (error) {
            this.engine.statusManager.error('Failed to import configuration: ' + error.message);
        }
        
        // Reset input
        event.target.value = '';
    }
    
    /**
     * Handle folder import
     */
    async handleFolderImport(event) {
        const files = Array.from(event.target.files);
        const jsonFiles = files.filter(file => 
            file.name.toLowerCase().endsWith('.json') && 
            file.type === 'application/json'
        );
        
        if (jsonFiles.length === 0) {
            this.engine.statusManager.warning('No JSON files found in folder');
            return;
        }
        
        let loadedCount = 0;
        
        for (const file of jsonFiles) {
            try {
                const text = await file.text();
                const config = JSON.parse(text);
                
                if (this.validateConfiguration(config)) {
                    // For folder import, save as custom variation
                    this.saveAsCustomVariation(config);
                    loadedCount++;
                }
            } catch (error) {
                console.warn(`Failed to load ${file.name}:`, error);
            }
        }
        
        if (loadedCount > 0) {
            this.engine.statusManager.success(`Imported ${loadedCount} configurations from folder`);
            this.engine.variationManager.populateGrid();
        } else {
            this.engine.statusManager.error('No valid configurations found in folder');
        }
        
        // Reset input
        event.target.value = '';
    }
    
    /**
     * Validate configuration file
     */
    validateConfiguration(config) {
        return config && 
               config.type === 'vib34d-integrated-config' && 
               config.parameters && 
               typeof config.parameters === 'object';
    }
    
    /**
     * Load configuration into engine
     */
    loadConfiguration(config) {
        if (config.parameters) {
            this.engine.parameterManager.setParameters(config.parameters);
            
            if (typeof config.variation === 'number') {
                this.engine.setVariation(config.variation);
            }
            
            this.engine.updateDisplayValues();
            this.engine.updateVisualizers();
        }
    }
    
    /**
     * Save imported config as custom variation
     */
    saveAsCustomVariation(config) {
        const customIndex = this.engine.variationManager.saveCurrentAsCustom();
        return customIndex;
    }
    
    /**
     * Download file helper
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        
        URL.revokeObjectURL(url);
    }
    
    /**
     * Get geometry name helper
     */
    getGeometryName(index) {
        const names = ['Tetrahedron', 'Hypercube', 'Sphere', 'Torus', 'Klein Bottle', 'Fractal', 'Wave', 'Crystal'];
        return names[index] || 'Unknown';
    }
}