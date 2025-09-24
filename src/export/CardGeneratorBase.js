/**
 * Base class for all VIB34D trading card generators
 * Provides shared utilities while allowing system-specific implementations
 */
export class CardGeneratorBase {
    constructor(systemName) {
        this.systemName = systemName;
        this.canvasCount = 0;
    }
    
    /**
     * Generate a trading card HTML file
     */
    async generateCard(format, parameters) {
        try {
            const systemShaders = this.getSystemShaders();
            const systemStyles = this.getSystemStyles();
            const systemContent = this.generateSystemContent(parameters);
            
            const html = this.buildHTML({
                format,
                parameters,
                shaders: systemShaders,
                styles: systemStyles,
                content: systemContent
            });
            
            const filename = this.generateFilename(format, parameters);
            
            // Create and download the file
            this.downloadFile(filename, html);
            
            return {
                success: true,
                filename,
                system: this.systemName
            };
        } catch (error) {
            console.error(`❌ ${this.systemName} card generation failed:`, error);
            return {
                success: false,
                error: error.message,
                system: this.systemName
            };
        }
    }
    
    /**
     * Build complete HTML structure
     */
    buildHTML({ format, parameters, shaders, styles, content }) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.systemName.toUpperCase()} Trading Card</title>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet">
    <style>
        ${this.getBaseStyles()}
        ${styles}
    </style>
</head>
<body>
    <div class="card-container">
        <div class="card-header">
            <div class="system-badge ${this.systemName.toLowerCase()}">${this.systemName.toUpperCase()}</div>
            <div class="card-title">${this.getCardTitle(parameters)}</div>
        </div>
        
        <div class="visualization-area">
            ${content}
        </div>
        
        <div class="card-footer">
            <div class="parameters">
                ${this.formatParameters(parameters)}
            </div>
            <div class="signature">
                VIB34D Engine • ${timestamp}
            </div>
        </div>
    </div>
    
    <script>
        ${shaders.vertex ? `const vertexShaderSource = \`${shaders.vertex}\`;` : ''}
        ${shaders.fragment ? `const fragmentShaderSource = \`${shaders.fragment}\`;` : ''}
        
        // System-specific initialization
        ${this.getSystemJavaScript()}
        
        // Start visualization
        window.addEventListener('load', () => {
            try {
                initializeCard(${JSON.stringify(parameters)});
            } catch (error) {
                console.error('Card initialization failed:', error);
                document.querySelector('.visualization-area').innerHTML = 
                    '<div style="color: #ff0000; text-align: center; padding: 50px;">Visualization failed to load</div>';
            }
        });
    </script>
</body>
</html>`;
    }
    
    /**
     * Base CSS styles shared by all cards
     */
    getBaseStyles() {
        return `
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body {
                background: #000;
                color: #fff;
                font-family: 'Orbitron', monospace;
                overflow: hidden;
            }
            
            .card-container {
                width: 100vw;
                height: 100vh;
                display: flex;
                flex-direction: column;
                background: radial-gradient(ellipse at center, #1a0033 0%, #000000 70%);
            }
            
            .card-header {
                padding: 20px;
                background: rgba(0, 0, 0, 0.8);
                border-bottom: 2px solid rgba(0, 255, 255, 0.5);
                display: flex;
                justify-content: space-between;
                align-items: center;
                backdrop-filter: blur(10px);
            }
            
            .system-badge {
                padding: 8px 16px;
                border-radius: 12px;
                font-weight: 700;
                font-size: 0.9rem;
                text-shadow: 0 0 10px currentColor;
            }
            
            .system-badge.faceted {
                background: rgba(0, 255, 255, 0.2);
                border: 2px solid #00ffff;
                color: #00ffff;
            }
            
            .system-badge.quantum {
                background: rgba(0, 255, 255, 0.2);
                border: 2px solid #00ffff;
                color: #00ffff;
            }
            
            .system-badge.holographic {
                background: rgba(255, 100, 255, 0.2);
                border: 2px solid #ff64ff;
                color: #ff64ff;
            }
            
            .system-badge.polychora {
                background: rgba(255, 150, 0, 0.2);
                border: 2px solid #ff9600;
                color: #ff9600;
            }
            
            .card-title {
                font-size: 1.4rem;
                font-weight: 700;
                text-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
            }
            
            .visualization-area {
                flex: 1;
                position: relative;
                overflow: hidden;
            }
            
            .card-footer {
                padding: 15px 20px;
                background: rgba(0, 0, 0, 0.9);
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 0.8rem;
            }
            
            .parameters {
                color: rgba(255, 255, 255, 0.8);
                line-height: 1.4;
            }
            
            .signature {
                color: rgba(0, 255, 255, 0.7);
                font-weight: 400;
                font-size: 0.7rem;
            }
            
            canvas {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
            }
        `;
    }
    
    /**
     * Generate filename based on parameters
     */
    generateFilename(format, parameters) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const geometry = this.getGeometryName(parameters);
        return `vib34d-card-${this.systemName.toLowerCase()}-${geometry.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.html`;
    }
    
    /**
     * Format parameters for display
     */
    formatParameters(params) {
        const key = Object.entries(params)
            .filter(([key, value]) => !['system', 'hideui'].includes(key))
            .slice(0, 4)
            .map(([key, value]) => `${key}: ${typeof value === 'number' ? value.toFixed(1) : value}`)
            .join(' • ');
        return key || 'Default parameters';
    }
    
    /**
     * Download the generated file
     */
    downloadFile(filename, content) {
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
    
    // Abstract methods that each system must implement
    getSystemShaders() {
        throw new Error(`${this.systemName} must implement getSystemShaders()`);
    }
    
    getSystemStyles() {
        throw new Error(`${this.systemName} must implement getSystemStyles()`);
    }
    
    generateSystemContent(parameters) {
        throw new Error(`${this.systemName} must implement generateSystemContent()`);
    }
    
    getSystemJavaScript() {
        throw new Error(`${this.systemName} must implement getSystemJavaScript()`);
    }
    
    getCardTitle(parameters) {
        return `${this.systemName.toUpperCase()} ${this.getGeometryName(parameters)}`;
    }
    
    getGeometryName(parameters) {
        // Default implementation - systems can override
        const geometryNames = ['TETRAHEDRON', 'HYPERCUBE', 'SPHERE', 'TORUS', 'KLEIN BOTTLE', 'FRACTAL', 'WAVE', 'CRYSTAL'];
        const geomIndex = parameters.geometry || parameters.geometryType || 0;
        return geometryNames[geomIndex] || 'GEOMETRY';
    }
}