/**
 * Active Holographic System - REAL 5-layer rendering coordinator
 * Manages the exact multi-layer holographic effects from active-holographic-systems-FIXED
 */
import { ActiveHolographicVisualizer } from './ActiveHolographicVisualizer.js';

export class ActiveHolographicSystem {
    constructor() {
        this.layers = new Map();
        this.currentVariant = 0;
        this.isActive = false;
        this.audioContext = null;
        this.audioData = { bass: 0, mid: 0, high: 0 };
        this.animationFrame = null;
        
        // Layer configuration - exact roles from active-holographic-systems-FIXED
        this.layerConfig = [
            { id: 'holo-background-canvas', role: 'background', reactivity: 0.3 },
            { id: 'holo-shadow-canvas', role: 'shadow', reactivity: 0.5 },
            { id: 'holo-content-canvas', role: 'content', reactivity: 1.0 },
            { id: 'holo-highlight-canvas', role: 'highlight', reactivity: 1.2 },
            { id: 'holo-accent-canvas', role: 'accent', reactivity: 1.5 }
        ];
        
        // Global interaction state
        this.mouseX = 0.5;
        this.mouseY = 0.5;
        this.isMouseActive = false;
        
        this.initializeEventListeners();
    }
    
    async initialize() {
        console.log('🌌 Initializing REAL Active Holographic System...');
        
        try {
            // Initialize all 5 layers with their specific roles
            for (const config of this.layerConfig) {
                const visualizer = new ActiveHolographicVisualizer(
                    config.id,
                    config.role,
                    config.reactivity,
                    this.currentVariant
                );
                this.layers.set(config.id, visualizer);
                console.log(`✨ Layer initialized: ${config.role} (${config.id})`);
            }
            
            this.isActive = true;
            console.log('🎨 Active Holographic System ready with 5 layers');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Active Holographic System:', error);
            return false;
        }
    }
    
    start() {
        if (!this.isActive) {
            console.warn('Active Holographic System not initialized');
            return;
        }
        
        console.log('🚀 Starting Active Holographic System render loop');
        this.renderLoop();
    }
    
    stop() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        console.log('⏹️ Active Holographic System stopped');
    }
    
    renderLoop() {
        // Render all active layers
        this.layers.forEach((visualizer, layerId) => {
            visualizer.render();
        });
        
        this.animationFrame = requestAnimationFrame(() => this.renderLoop());
    }
    
    updateVariant(variant) {
        if (variant < 0 || variant > 29) {
            console.warn(`Invalid variant: ${variant}. Using 0.`);
            variant = 0;
        }
        
        this.currentVariant = variant;
        console.log(`🔄 Switching to Holographic Variant #${variant}`);
        
        // Update all layers to new variant
        this.layers.forEach(visualizer => {
            visualizer.updateVariant(variant);
        });
    }
    
    initializeEventListeners() {
        // Mouse movement tracking across all holographic layers
        document.addEventListener('mousemove', (e) => {
            const rect = document.body.getBoundingClientRect();
            this.mouseX = e.clientX / rect.width;
            this.mouseY = e.clientY / rect.height;
            
            // Update all layers with mouse interaction
            this.layers.forEach(visualizer => {
                visualizer.updateInteraction(this.mouseX, this.mouseY, this.isMouseActive ? 1.0 : 0.3);
            });
        });
        
        // Mouse enter/leave for intensity control
        document.addEventListener('mouseenter', () => {
            this.isMouseActive = true;
        });
        
        document.addEventListener('mouseleave', () => {
            this.isMouseActive = false;
        });
        
        // Click reactions
        document.addEventListener('click', (e) => {
            const rect = document.body.getBoundingClientRect();
            const clickX = e.clientX / rect.width;
            const clickY = e.clientY / rect.height;
            
            this.layers.forEach(visualizer => {
                visualizer.triggerClick(clickX, clickY);
            });
        });
        
        // Touch support for mobile
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                const rect = document.body.getBoundingClientRect();
                const touchX = touch.clientX / rect.width;
                const touchY = touch.clientY / rect.height;
                
                this.layers.forEach(visualizer => {
                    visualizer.updateTouch(touchX, touchY, true);
                });
            }
        });
        
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                const rect = document.body.getBoundingClientRect();
                const touchX = touch.clientX / rect.width;
                const touchY = touch.clientY / rect.height;
                
                this.layers.forEach(visualizer => {
                    visualizer.updateTouch(touchX, touchY, true);
                });
            }
        });
        
        document.addEventListener('touchend', () => {
            this.layers.forEach(visualizer => {
                visualizer.updateTouch(0.5, 0.5, false);
            });
        });
        
        // Scroll parallax effects
        window.addEventListener('scroll', (e) => {
            const scrollDelta = window.scrollY;
            this.layers.forEach(visualizer => {
                visualizer.updateScroll(scrollDelta * 0.1);
            });
        });
        
        // Wheel events for enhanced scroll control
        document.addEventListener('wheel', (e) => {
            this.layers.forEach(visualizer => {
                visualizer.updateScroll(e.deltaY);
            });
        });
    }
    
    // Density variation control (for interactive effects)
    updateDensity(variation) {
        this.layers.forEach(visualizer => {
            visualizer.updateDensity(variation);
        });
    }
    
    // Audio reactivity integration
    updateAudio(audioData) {
        if (!audioData) return;
        
        this.audioData = audioData;
        this.layers.forEach(visualizer => {
            visualizer.updateAudio(audioData);
        });
    }
    
    // Initialize audio context for real-time audio reactivity
    async initializeAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('🎵 Audio context initialized for holographic reactivity');
            return true;
        } catch (error) {
            console.warn('Audio context not available:', error);
            return false;
        }
    }
    
    // Resize all layers when window changes
    resize() {
        this.layers.forEach(visualizer => {
            visualizer.resize();
        });
    }
    
    // Get current variant info
    getCurrentVariantInfo() {
        if (this.layers.size === 0) return null;
        
        const contentLayer = this.layers.get('holo-content-canvas');
        if (!contentLayer) return null;
        
        return {
            variant: this.currentVariant,
            name: contentLayer.variantParams.name,
            geometryType: contentLayer.variantParams.geometryType,
            parameters: contentLayer.variantParams
        };
    }
    
    // Get all available variants (0-29)
    getAvailableVariants() {
        const variants = [];
        for (let i = 0; i < 30; i++) {
            // Create a temporary visualizer to get variant info
            const tempCanvas = document.createElement('canvas');
            tempCanvas.id = 'temp-canvas';
            tempCanvas.width = 1;
            tempCanvas.height = 1;
            document.body.appendChild(tempCanvas);
            
            try {
                const tempVisualizer = new ActiveHolographicVisualizer('temp-canvas', 'content', 1.0, i);
                variants.push({
                    id: i,
                    name: tempVisualizer.variantParams.name,
                    geometryType: tempVisualizer.variantParams.geometryType,
                    parameters: tempVisualizer.variantParams
                });
                tempVisualizer.destroy();
            } catch (error) {
                console.warn(`Failed to get info for variant ${i}:`, error);
            }
            
            document.body.removeChild(tempCanvas);
        }
        return variants;
    }
    
    // Cleanup
    destroy() {
        this.stop();
        
        this.layers.forEach(visualizer => {
            visualizer.destroy();
        });
        this.layers.clear();
        
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        console.log('🧹 Active Holographic System destroyed');
    }
}