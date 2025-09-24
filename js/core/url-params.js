/**
 * VIB34D URL Parameter Handler
 * Parses URL parameters for gallery preview mode and system configuration
 */

export class URLParameterHandler {
    constructor() {
        this.galleryPreviewData = null;
        this.isGalleryPreview = false;
    }

    parseURLParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Check if this is a gallery preview
        if (urlParams.has('system')) {
            const targetSystem = urlParams.get('system');
            const hideUI = urlParams.get('hideui') === 'true';
            
            // Hide UI for clean preview (with DOM ready check)
            if (hideUI) {
                this.setupCleanPreview();
            }
            
            // Load parameters from URL with safe numeric conversion
            const parameters = {};
            urlParams.forEach((value, key) => {
                if (!['system', 'hideui', 'alllayers', 'highquality'].includes(key)) {
                    // Safe numeric conversion - ensure we always get a valid number or fallback
                    const numericValue = parseFloat(value);
                    if (!isNaN(numericValue) && isFinite(numericValue)) {
                        parameters[key] = numericValue;
                    } else {
                        // For non-numeric values, keep as string but warn
                        parameters[key] = value;
                        console.warn(`🎨 Gallery preview: Non-numeric parameter ${key} = "${value}"`);
                    }
                }
            });
            
            // Enable all layers for gallery preview if requested
            const allLayers = urlParams.get('alllayers') === 'true';
            const highQuality = urlParams.get('highquality') === 'true';
            if (allLayers || highQuality) {
                window.forceAllLayers = true;
                window.forceHighQuality = true;
                console.log('🎨 Gallery preview: Forcing all 5 layers with high quality');
            }
            
            // Store for initialization
            this.galleryPreviewData = {
                system: targetSystem,
                parameters: parameters,
                hideUI: hideUI
            };
            
            console.log('🎨 Gallery preview mode detected:', this.galleryPreviewData);
            console.log('🎨 URL that triggered this:', window.location.href);
            console.log('🎨 Parameters parsed:', parameters);
            console.log('🎨 System to switch to:', targetSystem);
            
            this.isGalleryPreview = true;
            
            // Set currentSystem for gallery previews (CanvasManager will handle canvas layers)
            const previousSystem = window.currentSystem;
            window.currentSystem = targetSystem;
            console.log(`🎯 Gallery preview: currentSystem set to '${targetSystem}' (was '${previousSystem}')`);
            
            // Don't manipulate canvas layers early - let CanvasManager handle this during switchSystem
            
            // Store in window for global access
            window.galleryPreviewData = this.galleryPreviewData;
            window.isGalleryPreview = this.isGalleryPreview;
            
            // Store parameters for later application - don't apply too early
            // (Engines need to be loaded first to properly receive parameters)
        }
    }

    setupCleanPreview() {
        // Wait for DOM to be ready before trying to hide elements
        const hideUIElements = () => {
            const topBar = document.querySelector('.top-bar');
            const controlPanel = document.querySelector('.control-panel');
            const canvasContainer = document.querySelector('.canvas-container');
            
            if (topBar) topBar.style.display = 'none';
            if (controlPanel) controlPanel.style.display = 'none';
            if (canvasContainer) {
                // Make canvas container fill the entire iframe viewport
                canvasContainer.style.cssText = `
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100vw !important;
                    height: 100vh !important;
                    display: block !important;
                    background: #000 !important;
                `;
                
                // Make all canvas layers fill the container completely
                const allCanvases = canvasContainer.querySelectorAll('canvas');
                allCanvases.forEach((canvas, index) => {
                    canvas.style.cssText = `
                        position: absolute !important;
                        top: 0 !important;
                        left: 0 !important;
                        width: 100% !important;
                        height: 100% !important;
                    `;
                });
            }
        };
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', hideUIElements);
        } else {
            hideUIElements();
        }
    }

    showCorrectSystemLayers(targetSystem) {
        const showCorrectSystemLayers = () => {
            const systems = ['faceted', 'quantum', 'holographic', 'polychora'];
            systems.forEach(sys => {
                const layerId = sys === 'faceted' ? 'vib34dLayers' : `${sys}Layers`;
                const layers = document.getElementById(layerId);
                if (layers) {
                    const shouldShow = sys === targetSystem;
                    layers.style.display = shouldShow ? 'block' : 'none';
                    console.log(`🎯 EARLY CANVAS CONTROL: ${sys} layers → ${shouldShow ? 'VISIBLE' : 'HIDDEN'}`);
                }
            });
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', showCorrectSystemLayers);
        } else {
            showCorrectSystemLayers();
        }
    }
}

// Initialize URL parameter handler immediately
const urlHandler = new URLParameterHandler();
urlHandler.parseURLParameters();

export default urlHandler;