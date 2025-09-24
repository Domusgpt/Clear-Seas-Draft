/**
 * Trading Card Generator - Creates personalized trading cards from current visualization
 * Allows users to export their current VIB34D state as a shareable trading card
 * 
 * REFACTORED: Now uses modular system architecture
 */

import { TradingCardSystemFaceted } from './systems/TradingCardSystemFaceted.js';
import { TradingCardSystemQuantum } from './systems/TradingCardSystemQuantum.js';
import { TradingCardSystemHolographic } from './systems/TradingCardSystemHolographic.js';

export class TradingCardGenerator {
    constructor(engine) {
        this.engine = engine;
        // Detect current system reliably from multiple sources
        this.currentSystem = this.detectCurrentSystem();
    }
    
    /**
     * Reliably detect which visualization system is currently active
     */
    detectCurrentSystem() {
        // Method 1: Check active system button in UI
        const activeSystemBtn = document.querySelector('.system-btn.active');
        if (activeSystemBtn?.dataset.system) {
            return activeSystemBtn.dataset.system;
        }
        
        // Method 2: Check global variable
        if (window.currentSystem) {
            return window.currentSystem;
        }
        
        // Method 3: Check which canvas layers are visible
        const holographicLayers = document.getElementById('holographicLayers');
        const polychoraLayers = document.getElementById('polychoraLayers');
        const vib34dLayers = document.getElementById('vib34dLayers');
        
        if (holographicLayers && holographicLayers.style.display !== 'none') {
            return 'holographic';
        } else if (polychoraLayers && polychoraLayers.style.display !== 'none') {
            return 'polychora';
        } else if (vib34dLayers && vib34dLayers.style.display !== 'none') {
            return 'faceted';
        }
        
        // Fallback
        console.warn('⚠️ Could not detect current system, defaulting to faceted');
        return 'faceted';
    }
    
    /**
     * Generate a trading card from current visualization state
     */
    async generateTradingCard(format = 'classic') {
        console.log('🎴 Generating trading card from current state...');
        
        // Capture current parameters
        const state = this.captureCurrentState();
        
        // Capture the actual canvas visual as base64 image
        const canvasImage = await this.captureCanvasImage();
        
        // Generate card HTML based on format
        const cardHTML = format === 'social' ? 
            this.generateSocialCard(state, canvasImage) : 
            this.generateClassicCard(state, canvasImage);
        
        // Create blob and download
        const blob = new Blob([cardHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        // Generate filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `vib34d-card-${state.geometry.toLowerCase()}-${timestamp}.html`;
        
        // Trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        console.log(`🎴 Trading card generated: ${filename}`);
        
        // Show success message
        if (this.engine?.statusManager) {
            this.engine.statusManager.success(
                `🎴 Trading Card Created!<br>` +
                `<strong>${state.name}</strong><br>` +
                `Format: ${format === 'social' ? 'Social Media' : 'Classic'}<br>` +
                `<small>File: ${filename}</small>`
            );
        }
        
        return { success: true, filename, state };
    }
    
    /**
     * Generate trading card HTML without downloading (for viewer.html compatibility)
     * @param {string} format - Card format ('classic' or 'social')
     * @returns {Promise<{success: boolean, html: string}>} Card HTML for navigation
     */
    async generateCardHTML(format = 'classic') {
        console.log('🎴 Generating trading card HTML for navigation...');
        
        // Capture current parameters
        const state = this.captureCurrentState();
        
        // Capture the actual canvas visual as base64 image
        const canvasImage = await this.captureCanvasImage();
        
        // Generate card HTML based on format
        const cardHTML = format === 'social' ? 
            this.generateSocialCard(state, canvasImage) : 
            this.generateClassicCard(state, canvasImage);
        
        return { success: true, html: cardHTML };
    }
    
    /**
     * Capture ALL 5 layers from the current active system and composite them properly
     */
    async captureCanvasImage() {
        console.log('📸 Capturing multi-layer visualization from system:', this.currentSystem);
        
        // System-specific layer configuration
        const systemLayers = {
            'faceted': {
                prefix: '',
                layers: ['background-canvas', 'shadow-canvas', 'content-canvas', 'highlight-canvas', 'accent-canvas'],
                name: 'VIB34D Faceted'
            },
            'holographic': {
                prefix: 'holo-',
                layers: ['background-canvas', 'shadow-canvas', 'content-canvas', 'highlight-canvas', 'accent-canvas'],  
                name: 'Active Holograms'
            },
            'polychora': {
                prefix: 'polychora-',
                layers: ['background-canvas', 'shadow-canvas', 'content-canvas', 'highlight-canvas', 'accent-canvas'],
                name: 'Polychora System'
            }
        };
        
        const systemConfig = systemLayers[this.currentSystem] || systemLayers['faceted'];
        
        // Layer-specific properties matching the actual system
        const layerProperties = {
            'background-canvas': { alpha: 0.4, blendMode: 'normal' },
            'shadow-canvas': { alpha: 0.6, blendMode: 'multiply' },
            'content-canvas': { alpha: 1.0, blendMode: 'normal' },
            'highlight-canvas': { alpha: 1.0, blendMode: 'screen' },
            'accent-canvas': { alpha: 0.8, blendMode: 'overlay' }
        };
        
        try {
            // Create high-quality composite canvas
            const compositeCanvas = document.createElement('canvas');
            const targetWidth = 800;
            const targetHeight = 600;
            compositeCanvas.width = targetWidth;
            compositeCanvas.height = targetHeight;
            const ctx = compositeCanvas.getContext('2d');
            
            // Start with black background
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, targetWidth, targetHeight);
            
            // Composite all 5 layers in correct order
            let layersFound = 0;
            for (const layerBase of systemConfig.layers) {
                const layerId = systemConfig.prefix + layerBase;
                const layerCanvas = document.getElementById(layerId);
                
                if (layerCanvas && layerCanvas.width > 0 && layerCanvas.height > 0) {
                    const props = layerProperties[layerBase];
                    
                    // Set blend mode and alpha
                    ctx.globalAlpha = props.alpha;
                    ctx.globalCompositeOperation = props.blendMode;
                    
                    // Draw the layer
                    ctx.drawImage(layerCanvas, 0, 0, targetWidth, targetHeight);
                    layersFound++;
                    
                    console.log(`✅ Composited ${layerId} (alpha: ${props.alpha}, blend: ${props.blendMode})`);
                } else {
                    console.warn(`⚠️ Layer ${layerId} not found or empty`);
                }
            }
            
            // Reset composite operation
            ctx.globalCompositeOperation = 'normal';
            ctx.globalAlpha = 1.0;
            
            if (layersFound === 0) {
                console.error('❌ No layers captured from current system');
                return null;
            }
            
            // Convert to high-quality base64
            const imageData = compositeCanvas.toDataURL('image/png', 0.95);
            console.log(`✅ Multi-layer capture complete: ${layersFound} layers from ${systemConfig.name}`);
            return imageData;
            
        } catch (error) {
            console.error('❌ Error capturing multi-layer canvas:', error);
            return null;
        }
    }
    
    /**
     * Capture current visualization state with improved system detection
     */
    captureCurrentState() {
        // Detect current system more reliably
        const activeSystemBtn = document.querySelector('.system-btn.active');
        const detectedSystem = activeSystemBtn?.dataset.system || window.currentSystem || 'faceted';
        this.currentSystem = detectedSystem;
        
        console.log('🎯 Capturing state for system:', this.currentSystem);
        
        // Get parameters based on current system
        let params = {};
        let geometryType = 0;
        
        if (this.currentSystem === 'faceted' && this.engine) {
            // VIB34D Faceted System
            params = this.engine.parameterManager?.getAllParameters() || {};
            geometryType = params.geometry || this.getActiveGeometryIndex();
        } else if (this.currentSystem === 'holographic') {
            // CRITICAL FIX: Use SAME parameter names as holographicSystem.getParameters()
            // This ensures trading cards match gallery save/load system
            params = {
                geometry: this.getActiveGeometryIndex(),
                gridDensity: parseFloat(document.getElementById('gridDensity')?.value || 15), // Raw value, not divided
                morphFactor: parseFloat(document.getElementById('morphFactor')?.value || 1.0),
                speed: parseFloat(document.getElementById('speed')?.value || 1.0),
                chaos: parseFloat(document.getElementById('chaos')?.value || 0.2),
                hue: parseFloat(document.getElementById('hue')?.value || 320), // Match holographic default
                intensity: parseFloat(document.getElementById('intensity')?.value || 0.6), // Match holographic default
                saturation: parseFloat(document.getElementById('saturation')?.value || 0.8),
                rot4dXW: parseFloat(document.getElementById('rot4dXW')?.value || 0),
                rot4dYW: parseFloat(document.getElementById('rot4dYW')?.value || 0),
                rot4dZW: parseFloat(document.getElementById('rot4dZW')?.value || 0)
            };
            geometryType = params.geometry;
        } else if (this.currentSystem === 'polychora') {
            // Polychora System  
            params = {
                polytope: this.getActiveGeometryIndex(),
                gridDensity: parseFloat(document.getElementById('gridDensity')?.value || 15),
                morphFactor: parseFloat(document.getElementById('morphFactor')?.value || 1.0),
                chaos: parseFloat(document.getElementById('chaos')?.value || 0.2),
                speed: parseFloat(document.getElementById('speed')?.value || 1.0),
                hue: parseFloat(document.getElementById('hue')?.value || 200),
                intensity: parseFloat(document.getElementById('intensity')?.value || 0.5),
                saturation: parseFloat(document.getElementById('saturation')?.value || 0.8),
                rot4dXW: parseFloat(document.getElementById('rot4dXW')?.value || 0),
                rot4dYW: parseFloat(document.getElementById('rot4dYW')?.value || 0),
                rot4dZW: parseFloat(document.getElementById('rot4dZW')?.value || 0)
            };
            geometryType = params.polytope;
        }
        
        const geometryNames = ['TETRAHEDRON', 'HYPERCUBE', 'SPHERE', 'TORUS', 'KLEIN BOTTLE', 'FRACTAL', 'WAVE', 'CRYSTAL'];
        const systemNames = {
            faceted: 'FACETED',
            holographic: 'HOLOGRAPHIC',
            polychora: 'POLYCHORA'
        };
        
        const state = {
            name: `${geometryNames[geometryType] || 'QUANTUM'} ${systemNames[this.currentSystem] || 'SYSTEM'}`,
            geometry: geometryNames[geometryType] || 'QUANTUM',
            system: this.currentSystem,
            dimension: (params.dimension || 3.8).toString(),
            hue: params.hue || 200,
            saturation: ((params.saturation || 0.8) * 100).toFixed(0),
            intensity: ((params.intensity || 0.5) * 100).toFixed(0),
            speed: (params.speed || 1.0).toFixed(1),
            chaos: ((params.chaos || 0) * 100).toFixed(0),
            rarity: this.calculateRarity(params),
            parameters: params,
            portalUrl: window.location.origin + '/vib34d-portal.html'
        };
        
        console.log('🎯 Captured state:', state);
        return state;
    }
    
    getActiveGeometryIndex() {
        const activeBtn = document.querySelector('.geom-btn.active');
        return activeBtn ? parseInt(activeBtn.dataset.index) : 0;
    }
    
    /**
     * Calculate rarity based on parameter extremity
     */
    calculateRarity(params) {
        const extremity = 
            Math.abs(params.rot4dXW || 0) + 
            Math.abs(params.rot4dYW || 0) + 
            Math.abs(params.rot4dZW || 0) +
            (params.chaos || 0) * 2 +
            Math.abs((params.dimension || 3.8) - 3.8);
        
        if (extremity > 8) return 'MYTHIC';
        if (extremity > 6) return 'LEGENDARY';
        if (extremity > 4) return 'EPIC';
        if (extremity > 2) return 'RARE';
        return 'COMMON';
    }
    
    /**
     * Generate classic vertical trading card HTML - ALWAYS use live WebGL
     */
    generateClassicCard(state, canvasImage) {
        // ALWAYS use live WebGL visualization, never static images
        const visualizationContent = this.generateVisualizationCode(state);
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VIB34D Trading Card - ${state.name}</title>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            background: #000;
            color: #fff;
            font-family: 'Orbitron', monospace;
            overflow: hidden;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: 
                radial-gradient(circle at 20% 20%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
                linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
        }
        
        .trading-card {
            width: 400px;
            height: auto;
            background: rgba(0, 0, 0, 0.85);
            border: 2px solid rgba(0, 255, 255, 0.3);
            border-radius: 15px;
            padding: 20px;
            transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            cursor: pointer;
            position: relative;
            overflow: visible;
            transform-style: preserve-3d;
            transform-origin: 50% 50%;
            will-change: transform;
            /* CSS variables for mouse tracking */
            --mouse-x: 50%;
            --mouse-y: 50%;
            --bend-intensity: 0;
        }
        
        .trading-card:hover {
            border-color: #00ffff;
            box-shadow: 
                0 30px 60px rgba(0, 255, 255, 0.3),
                inset 0 2px 0 rgba(255, 255, 255, 0.2),
                0 0 40px rgba(255, 0, 255, 0.4);
            transform: 
                perspective(800px)
                rotateY(calc((var(--mouse-x) - 50) * 0.25deg * var(--bend-intensity)))
                rotateX(calc((var(--mouse-y) - 50) * 0.12deg * var(--bend-intensity)))
                translateZ(calc(var(--bend-intensity) * 30px))
                translateY(-10px)
                scale(1.05);
            backdrop-filter: blur(20px);
            z-index: 10;
        }
        
        @keyframes cardGlow {
            0% { 
                box-shadow: 
                    0 0 50px hsla(${state.hue}, 80%, 50%, 0.3),
                    inset 0 0 50px rgba(255, 255, 255, 0.05);
            }
            100% { 
                box-shadow: 
                    0 0 80px hsla(${(state.hue + 60) % 360}, 80%, 50%, 0.4),
                    inset 0 0 80px rgba(255, 255, 255, 0.1);
            }
        }
        
        .card-border {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            border-radius: 20px;
            background: linear-gradient(45deg, 
                hsl(${state.hue}, 80%, 50%), 
                hsl(${(state.hue + 120) % 360}, 80%, 50%), 
                hsl(${(state.hue + 240) % 360}, 80%, 50%),
                hsl(${state.hue}, 80%, 50%));
            background-size: 300% 300%;
            animation: borderShift 4s ease-in-out infinite;
            z-index: -1;
        }
        
        @keyframes borderShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }
        
        .card-header {
            position: relative;
            z-index: 10;
            padding: 20px;
            text-align: center;
            background: linear-gradient(180deg, rgba(0,0,0,0.8), transparent);
        }
        
        .card-title {
            font-size: 1.4rem;
            font-weight: 900;
            color: hsl(${state.hue}, 80%, 60%);
            text-shadow: 0 0 20px hsla(${state.hue}, 80%, 60%, 0.8);
            margin-bottom: 5px;
            letter-spacing: 2px;
        }
        
        .card-subtitle {
            font-size: 0.8rem;
            color: rgba(255, 255, 255, 0.7);
            font-weight: 400;
            letter-spacing: 1px;
        }
        
        .rarity-badge {
            position: absolute;
            top: 15px;
            right: 15px;
            background: ${state.rarity === 'MYTHIC' ? 'linear-gradient(45deg, #ff00ff, #00ffff)' :
                         state.rarity === 'LEGENDARY' ? 'linear-gradient(45deg, #ff6b35, #f7931e)' :
                         state.rarity === 'EPIC' ? 'linear-gradient(45deg, #9b59b6, #e74c3c)' :
                         state.rarity === 'RARE' ? 'linear-gradient(45deg, #3498db, #2ecc71)' :
                         'linear-gradient(45deg, #95a5a6, #7f8c8d)'};
            color: ${state.rarity === 'COMMON' ? '#fff' : '#000'};
            padding: 5px 15px;
            border-radius: 15px;
            font-size: 0.7rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            box-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
            animation: rarityPulse 2s ease-in-out infinite;
        }
        
        @keyframes rarityPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        
        .card-preview {
            width: 100%;
            height: 350px;
            aspect-ratio: 1 / 1;
            border-radius: 12px;
            overflow: visible;
            margin-bottom: 15px;
            background: #111;
            position: relative;
            border: 1px solid rgba(0, 255, 255, 0.2);
            transform-style: preserve-3d;
            transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        /* GALLERY-STYLE: Card preview expands and tilts based on mouse position */
        .trading-card:hover .card-preview {
            /* Match gallery card preview behavior exactly */
            transform: 
                perspective(1000px)
                translateZ(30px)
                scale(1.1)
                rotateY(calc((var(--mouse-x) - 50) * 0.2deg))
                rotateX(calc((var(--mouse-y) - 50) * 0.15deg));
            box-shadow: 
                0 0 50px rgba(0, 255, 255, 0.6),
                0 0 100px rgba(255, 0, 255, 0.4),
                inset 0 0 20px rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.8);
            background: rgba(17, 17, 17, 0.7);
            backdrop-filter: blur(15px);
            filter: brightness(1.2) contrast(1.05) saturate(1.1);
            overflow: visible;
            transition: transform 0.1s ease-out;
        }
        
        /* Canvas visualization container inside preview - EXACT MATCH */
        .visualization-container {
            width: 100%;
            height: 100%;
            position: relative;
            border-radius: 12px;
            overflow: hidden;
            background: #000;
        }
        
        .visualizer-canvas {
            width: 100%;
            height: 100%;
            display: block;
            border-radius: 10px;
        }
        
        .stats-panel {
            padding: 0 20px;
            margin-bottom: 20px;
        }
        
        .stat-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 0.7rem;
        }
        
        .stat-label {
            color: rgba(255, 255, 255, 0.6);
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .stat-value {
            color: hsl(${state.hue}, 80%, 60%);
            font-weight: 700;
            text-shadow: 0 0 10px hsla(${state.hue}, 80%, 60%, 0.5);
        }
        
        .action-panel {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(0deg, rgba(0,0,0,0.9), transparent);
            padding: 20px;
            text-align: center;
        }
        
        .collect-button {
            width: 100%;
            background: linear-gradient(45deg, #ff6b35, #f7931e);
            border: none;
            color: #000;
            padding: 15px 20px;
            border-radius: 25px;
            font-family: 'Orbitron', monospace;
            font-size: 1rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 2px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 0 30px rgba(255, 107, 53, 0.4);
            position: relative;
            overflow: hidden;
        }
        
        .collect-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 0 50px rgba(255, 107, 53, 0.8);
        }
        
        .edition-number {
            position: absolute;
            bottom: 15px;
            left: 20px;
            font-size: 0.6rem;
            color: rgba(255, 255, 255, 0.5);
            font-weight: 400;
        }
        
        .hologram-effect {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: linear-gradient(45deg, 
                hsla(${state.hue}, 80%, 50%, 0.1), 
                hsla(${(state.hue + 120) % 360}, 80%, 50%, 0.1), 
                hsla(${(state.hue + 240) % 360}, 80%, 50%, 0.1));
            background-size: 300% 300%;
            animation: hologramShift 6s ease-in-out infinite;
            pointer-events: none;
            border-radius: 20px;
        }
        
        @keyframes hologramShift {
            0%, 100% { 
                background-position: 0% 50%; 
                opacity: 0.3;
            }
            50% { 
                background-position: 100% 50%; 
                opacity: 0.6;
            }
        }
        
        @media (max-width: 480px) {
            .trading-card {
                width: 350px;
                height: 550px;
            }
        }
    </style>
</head>
<body>
    <div class="trading-card">
        <div class="card-border"></div>
        <div class="hologram-effect"></div>
        
        <div class="rarity-badge">${state.rarity}</div>
        
        <div class="card-header">
            <h1 class="card-title">${state.name}</h1>
            <p class="card-subtitle">${state.system} System • ${state.dimension}D</p>
        </div>
        
        <div class="card-preview" data-preview-container>
            <div class="visualization-container">
                <canvas class="visualizer-canvas" id="vib34dCanvas"></canvas>
            </div>
        </div>
        
        <div class="stats-panel">
            <div class="stat-row">
                <span class="stat-label">Dimension</span>
                <span class="stat-value">${state.dimension}D</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Geometry</span>
                <span class="stat-value">${state.geometry}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">System</span>
                <span class="stat-value">${state.system.toUpperCase()}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Chaos</span>
                <span class="stat-value">${state.chaos}%</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Speed</span>
                <span class="stat-value">${state.speed}x</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Rarity</span>
                <span class="stat-value">${state.rarity}</span>
            </div>
        </div>
        
        <div class="action-panel">
            <button class="collect-button" onclick="collectFullSystem()">
                <span class="collect-text">🌌 Get VIB34D Collection</span>
            </button>
        </div>
        
        <div class="edition-number">Generated ${new Date().toLocaleDateString()}</div>
    </div>

    <script>
        ${visualizationContent}
        
        // Initialize LIVE multi-layer WebGL system
        document.addEventListener('DOMContentLoaded', () => {
            const canvas = document.getElementById('vib34dCanvas');
            if (canvas) {
                console.log('🎴 Initializing LIVE trading card system...');
                new LiveTradingCardSystem();
            }
            
            // EXACT MATCH: Add portfolio card mouse tracking behavior
            initializeHolographicCardEffects();
        });
        
        // EXACT COPY from gallery.html - Mouse tracking for trading cards
        function initializeHolographicCardEffects() {
            console.log('🌟 Initializing trading card holographic effects...');
            
            const card = document.querySelector('.trading-card');
            if (!card) return;
            
            let isHovering = false;
            
            // Mouse enter - start holographic effect
            card.addEventListener('mouseenter', (e) => {
                isHovering = true;
                card.style.setProperty('--bend-intensity', '0.8');
                console.log('🌌 Trading card holographic effect activated');
            });
            
            // Mouse leave - end holographic effect
            card.addEventListener('mouseleave', (e) => {
                isHovering = false;
                card.style.setProperty('--bend-intensity', '0');
                card.style.setProperty('--mouse-x', '50%');
                card.style.setProperty('--mouse-y', '50%');
                console.log('🌌 Trading card holographic effect deactivated');
            });
            
            // Mouse move - track position for card bending + visual reactivity
            card.addEventListener('mousemove', (e) => {
                if (!isHovering) return;
                
                const rect = card.getBoundingClientRect();
                const cardX = ((e.clientX - rect.left) / rect.width) * 100;
                const cardY = ((e.clientY - rect.top) / rect.height) * 100;
                
                // Calculate distance from center for bend intensity
                const centerX = 50;
                const centerY = 50;
                const distanceFromCenter = Math.sqrt(
                    Math.pow(cardX - centerX, 2) + Math.pow(cardY - centerY, 2)
                );
                
                // Dynamic bend intensity based on mouse position
                const bendIntensity = Math.min(1, (distanceFromCenter / 70) + 0.3);
                
                // Update CSS variables for real-time transformation
                card.style.setProperty('--mouse-x', cardX);
                card.style.setProperty('--mouse-y', cardY);
                card.style.setProperty('--bend-intensity', bendIntensity);
            });
            
            console.log('✅ Trading card holographic effects initialized');
        }
        
        // Collect button action - leads to VIB34D Portal
        function collectFullSystem() {
            const portalUrl = '${state.portalUrl}';
            const confirmed = confirm(
                "🌌 Ready to explore the complete VIB34D Collection?\\n\\n" +
                "✨ 100+ Legendary Variations\\n" +
                "🎮 3 Complete Visualization Systems\\n" +
                "🎯 4D Mathematics & Physics\\n" +
                "💫 Real-time Parameter Control\\n" +
                "🎨 Create Your Own Trading Cards\\n\\n" +
                "Click OK to visit the VIB34D Portal!"
            );
            
            if (confirmed) {
                try {
                    window.location.href = portalUrl;
                } catch (e) {
                    window.open(portalUrl, '_blank');
                }
            }
        }
    </script>
</body>
</html>`;
    }
    
    /**
     * Generate social media card HTML
     */
    generateSocialCard(state, canvasImage) {
        const visualizationContent = canvasImage ? 
            this.generateImageVisualization(canvasImage) : 
            this.generateVisualizationCode(state);
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VIB34D - ${state.name}</title>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            background: #000;
            color: #fff;
            font-family: 'Orbitron', monospace;
            overflow: hidden;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
        }
        
        .social-card {
            width: 500px;
            height: 280px;
            background: linear-gradient(145deg, rgba(0,0,0,0.9), rgba(30,30,60,0.9));
            border-radius: 15px;
            border: 2px solid transparent;
            background-clip: padding-box;
            position: relative;
            overflow: hidden;
            display: flex;
            box-shadow: 0 0 40px hsla(${state.hue}, 80%, 50%, 0.3);
            animation: cardPulse 4s ease-in-out infinite alternate;
        }
        
        @keyframes cardPulse {
            0% { box-shadow: 0 0 40px hsla(${state.hue}, 80%, 50%, 0.3); }
            100% { box-shadow: 0 0 60px hsla(${(state.hue + 60) % 360}, 80%, 50%, 0.4); }
        }
        
        .card-visual {
            flex: 1;
            position: relative;
            background: radial-gradient(ellipse at center, hsla(${state.hue}, 80%, 50%, 0.1), rgba(0, 0, 0, 0.8));
        }
        
        .visualizer-canvas {
            width: 100%;
            height: 100%;
            display: block;
            border-radius: 10px;
        }
        
        .visualizer-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 10px;
        }
        
        .card-info {
            flex: 1;
            padding: 25px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            background: linear-gradient(90deg, transparent, rgba(0,0,0,0.7));
        }
        
        .card-title {
            font-size: 1.6rem;
            font-weight: 900;
            color: hsl(${state.hue}, 80%, 60%);
            text-shadow: 0 0 20px hsla(${state.hue}, 80%, 60%, 0.8);
            margin-bottom: 8px;
            letter-spacing: 1px;
            line-height: 1.2;
        }
        
        .card-subtitle {
            font-size: 0.9rem;
            color: rgba(255, 255, 255, 0.8);
            margin-bottom: 20px;
            letter-spacing: 1px;
        }
        
        .feature-list {
            margin-bottom: 20px;
        }
        
        .feature-item {
            font-size: 0.7rem;
            color: rgba(255, 255, 255, 0.7);
            margin-bottom: 5px;
        }
        
        .cta-button {
            background: linear-gradient(45deg, #ff6b35, #f7931e);
            border: none;
            color: #000;
            padding: 12px 20px;
            border-radius: 20px;
            font-family: 'Orbitron', monospace;
            font-size: 0.8rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 0 20px rgba(255, 107, 53, 0.4);
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 0 30px rgba(255, 107, 53, 0.7);
        }
        
        .rarity-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            background: ${state.rarity === 'MYTHIC' ? 'linear-gradient(45deg, #ff00ff, #00ffff)' :
                         state.rarity === 'LEGENDARY' ? 'linear-gradient(45deg, #ff6b35, #f7931e)' :
                         state.rarity === 'EPIC' ? 'linear-gradient(45deg, #9b59b6, #e74c3c)' :
                         state.rarity === 'RARE' ? 'linear-gradient(45deg, #3498db, #2ecc71)' :
                         'linear-gradient(45deg, #95a5a6, #7f8c8d)'};
            color: ${state.rarity === 'COMMON' ? '#fff' : '#000'};
            padding: 4px 12px;
            border-radius: 10px;
            font-size: 0.6rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
        }
    </style>
</head>
<body>
    <div class="social-card">
        <div class="rarity-badge">${state.rarity}</div>
        
        <div class="card-visual">
            ${canvasImage ? 
                `<img src="${canvasImage}" class="visualizer-canvas" alt="${state.name}" style="width: 100%; height: 100%; object-fit: cover;" />` : 
                `<canvas class="visualizer-canvas" id="vib34dCanvas"></canvas>`
            }
        </div>
        
        <div class="card-info">
            <div>
                <h1 class="card-title">VIB34D<br>${state.geometry}</h1>
                <p class="card-subtitle">${state.system} • ${state.dimension}D</p>
                
                <div class="feature-list">
                    <div class="feature-item">🌌 Dimension: ${state.dimension}D</div>
                    <div class="feature-item">⚡ Speed: ${state.speed}x</div>
                    <div class="feature-item">🎮 Chaos: ${state.chaos}%</div>
                    <div class="feature-item">✨ Rarity: ${state.rarity}</div>
                </div>
            </div>
            
            <button class="cta-button" onclick="exploreCollection()">
                🚀 Get Collection
            </button>
        </div>
    </div>

    <script>
        ${visualizationContent}
        
        document.addEventListener('DOMContentLoaded', () => {
            const canvas = document.getElementById('vib34dCanvas');
            if (canvas) {
                ${canvasImage ? '// Using captured image, no animation needed' : 'new TradingCardVisualizer(canvas);'}
            }
        });
        
        function exploreCollection() {
            const portalUrl = '${state.portalUrl}';
            if (confirm("🌌 Visit the VIB34D Portal to collect more variations?")) {
                try {
                    window.location.href = portalUrl;
                } catch (e) {
                    window.open(portalUrl, '_blank');
                }
            }
        }
    </script>
</body>
</html>`;
    }
    
    /**
     * Generate LIVE multi-layer WebGL visualization code for the trading card
     * REFACTORED: Now uses modular system architecture
     */
    generateVisualizationCode(state) {
        console.log(`🎯 Generating ${this.currentSystem} system using modular architecture`);
        
        if (this.currentSystem === 'faceted') {
            return TradingCardSystemFaceted.generateLiveSystem(state);
        } else if (this.currentSystem === 'quantum') {
            return TradingCardSystemQuantum.generateLiveSystem(state);
        } else if (this.currentSystem === 'holographic') {
            return TradingCardSystemHolographic.generateLiveSystem(state);
        } else if (this.currentSystem === 'polychora') {
            // Use faceted as fallback for polychora (placeholder system)
            console.log('🔮 Polychora system using faceted fallback');
            return TradingCardSystemFaceted.generateLiveSystem(state);
        } else {
            console.warn(`⚠️ Unknown system: ${this.currentSystem}, using faceted fallback`);
            return TradingCardSystemFaceted.generateLiveSystem(state);
        }
    }
    
    /**
     * Generate LIVE 5-layer Faceted system with actual Engine code
     */
    generateLiveFacetedSystem(state) {
        return `
        // LIVE VIB34D Faceted System - 5 Layer WebGL Rendering
        class LiveTradingCardSystem {
            constructor() {
                this.layers = ['background', 'shadow', 'content', 'highlight', 'accent'];
                this.visualizers = [];
                this.params = ${JSON.stringify(state.parameters)};
                this.startTime = Date.now();
                
                this.initializeAllLayers();
                this.startRenderLoop();
            }
            
            initializeAllLayers() {
                // Create 5 canvases dynamically
                this.layers.forEach((role, index) => {
                    const canvas = document.createElement('canvas');
                    canvas.id = 'card-' + role + '-canvas';
                    canvas.style.position = 'absolute';
                    canvas.style.top = '0';
                    canvas.style.left = '0';
                    canvas.style.width = '100%';
                    canvas.style.height = '100%';
                    canvas.style.zIndex = index;
                    
                    // Set layer-specific blend modes and opacity
                    if (role === 'background') {
                        canvas.style.opacity = '0.4';
                    } else if (role === 'shadow') {
                        canvas.style.mixBlendMode = 'multiply';
                        canvas.style.opacity = '0.6';
                    } else if (role === 'content') {
                        canvas.style.opacity = '1.0';
                    } else if (role === 'highlight') {
                        canvas.style.mixBlendMode = 'screen';
                    } else if (role === 'accent') {
                        canvas.style.mixBlendMode = 'overlay';
                        canvas.style.opacity = '0.8';
                    }
                    
                    document.getElementById('vib34dCanvas').parentElement.appendChild(canvas);
                    
                    // Create WebGL visualizer for this layer
                    const visualizer = new LayerVisualizer(canvas, role, this.params);
                    this.visualizers.push(visualizer);
                });
                
                // Hide the original canvas
                document.getElementById('vib34dCanvas').style.display = 'none';
            }
            
            startRenderLoop() {
                const render = () => {
                    const time = Date.now() - this.startTime;
                    this.visualizers.forEach(visualizer => {
                        visualizer.render(time);
                    });
                    requestAnimationFrame(render);
                };
                render();
            }
        }
        
        class LayerVisualizer {
            constructor(canvas, role, params) {
                this.canvas = canvas;
                this.role = role;
                this.params = params;
                this.gl = canvas.getContext('webgl');
                
                const roleIntensities = {
                    'background': 0.3, 'shadow': 0.5, 'content': 0.8,
                    'highlight': 1.0, 'accent': 1.2
                };
                this.roleIntensity = roleIntensities[role] || 1.0;
                
                this.initShaders();
                this.initBuffers();
                this.resize();
            }
            
            resize() {
                this.canvas.width = this.canvas.clientWidth;
                this.canvas.height = this.canvas.clientHeight;
                this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            }
            
            initShaders() {
                const vertexShaderSource = \`attribute vec2 a_position;
void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
}\`;
                
                // EXACT FRAGMENT SHADER FROM FACETED SYSTEM
                const fragmentShaderSource = \`precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_geometry;
uniform float u_gridDensity;
uniform float u_morphFactor;
uniform float u_chaos;
uniform float u_speed;
uniform float u_hue;
uniform float u_intensity;
uniform float u_saturation;
uniform float u_dimension;
uniform float u_rot4dXW;
uniform float u_rot4dYW;
uniform float u_rot4dZW;
uniform float u_mouseIntensity;
uniform float u_clickIntensity;
uniform float u_roleIntensity;

// 4D rotation matrices
mat4 rotateXW(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat4(c, 0.0, 0.0, -s, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, s, 0.0, 0.0, c);
}
mat4 rotateYW(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat4(1.0, 0.0, 0.0, 0.0, 0.0, c, 0.0, -s, 0.0, 0.0, 1.0, 0.0, 0.0, s, 0.0, c);
}
mat4 rotateZW(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat4(1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, c, -s, 0.0, 0.0, s, c);
}
vec3 project4Dto3D(vec4 p) {
    float w = 2.5 / (2.5 + p.w);
    return vec3(p.x * w, p.y * w, p.z * w);
}

float geometryFunction(vec4 p) {
    int geomType = int(u_geometry);
    
    if (geomType == 0) {
        vec4 pos = fract(p * u_gridDensity * 0.08);
        vec4 dist = min(pos, 1.0 - pos);
        return min(min(dist.x, dist.y), min(dist.z, dist.w)) * u_morphFactor;
    }
    else if (geomType == 1) {
        vec4 pos = fract(p * u_gridDensity * 0.08);
        vec4 dist = min(pos, 1.0 - pos);
        float minDist = min(min(dist.x, dist.y), min(dist.z, dist.w));
        return minDist * u_morphFactor;
    }
    else if (geomType == 2) {
        float r = length(p);
        float density = u_gridDensity * 0.08;
        float spheres = abs(fract(r * density) - 0.5) * 2.0;
        float theta = atan(p.y, p.x);
        float harmonics = sin(theta * 3.0) * 0.2;
        return (spheres + harmonics) * u_morphFactor;
    }
    else if (geomType == 3) {
        float r1 = length(p.xy) - 2.0;
        float torus = length(vec2(r1, p.z)) - 0.8;
        float lattice = sin(p.x * u_gridDensity * 0.08) * sin(p.y * u_gridDensity * 0.08);
        return (torus + lattice * 0.3) * u_morphFactor;
    }
    else if (geomType == 4) {
        float u = atan(p.y, p.x);
        float v = atan(p.w, p.z);
        float dist = length(p) - 2.0;
        float lattice = sin(u * u_gridDensity * 0.08) * sin(v * u_gridDensity * 0.08);
        return (dist + lattice * 0.4) * u_morphFactor;
    }
    else if (geomType == 5) {
        vec4 pos = fract(p * u_gridDensity * 0.08);
        pos = abs(pos * 2.0 - 1.0);
        float dist = length(max(abs(pos) - 1.0, 0.0));
        return dist * u_morphFactor;
    }
    else if (geomType == 6) {
        float freq = u_gridDensity * 0.08;
        float time = u_time * 0.001 * u_speed;
        float wave1 = sin(p.x * freq + time);
        float wave2 = sin(p.y * freq + time * 1.3);
        float wave3 = sin(p.z * freq * 0.8 + time * 0.7);
        float interference = wave1 * wave2 * wave3;
        return interference * u_morphFactor;
    }
    else if (geomType == 7) {
        vec4 pos = fract(p * u_gridDensity * 0.08) - 0.5;
        float cube = max(max(abs(pos.x), abs(pos.y)), max(abs(pos.z), abs(pos.w)));
        return cube * u_morphFactor;
    }
    else {
        vec4 pos = fract(p * u_gridDensity * 0.08);
        vec4 dist = min(pos, 1.0 - pos);
        return min(min(dist.x, dist.y), min(dist.z, dist.w)) * u_morphFactor;
    }
}

void main() {
    vec2 uv = (gl_FragCoord.xy - u_resolution.xy * 0.5) / min(u_resolution.x, u_resolution.y);
    
    float timeSpeed = u_time * 0.0001 * u_speed;
    vec4 pos = vec4(uv * 3.0, sin(timeSpeed * 3.0), cos(timeSpeed * 2.0));
    pos.xy += (u_mouse - 0.5) * u_mouseIntensity * 2.0;
    
    pos = rotateXW(u_rot4dXW) * pos;
    pos = rotateYW(u_rot4dYW) * pos;
    pos = rotateZW(u_rot4dZW) * pos;
    
    float value = geometryFunction(pos);
    
    float noise = sin(pos.x * 7.0) * cos(pos.y * 11.0) * sin(pos.z * 13.0);
    value += noise * u_chaos;
    
    float geometryIntensity = 1.0 - clamp(abs(value), 0.0, 1.0);
    geometryIntensity += u_clickIntensity * 0.3;
    
    float finalIntensity = geometryIntensity * u_intensity;
    
    float hue = u_hue / 360.0 + value * 0.1;
    
    vec3 baseColor = vec3(
        sin(hue * 6.28318 + 0.0) * 0.5 + 0.5,
        sin(hue * 6.28318 + 2.0943) * 0.5 + 0.5,
        sin(hue * 6.28318 + 4.1887) * 0.5 + 0.5
    );
    
    float gray = (baseColor.r + baseColor.g + baseColor.b) / 3.0;
    vec3 color = mix(vec3(gray), baseColor, u_saturation) * finalIntensity;
    
    gl_FragColor = vec4(color, finalIntensity * u_roleIntensity);
}\`;
                
                this.program = this.createProgram(vertexShaderSource, fragmentShaderSource);
                this.uniforms = {
                    resolution: this.gl.getUniformLocation(this.program, 'u_resolution'),
                    time: this.gl.getUniformLocation(this.program, 'u_time'),
                    mouse: this.gl.getUniformLocation(this.program, 'u_mouse'),
                    geometry: this.gl.getUniformLocation(this.program, 'u_geometry'),
                    gridDensity: this.gl.getUniformLocation(this.program, 'u_gridDensity'),
                    morphFactor: this.gl.getUniformLocation(this.program, 'u_morphFactor'),
                    chaos: this.gl.getUniformLocation(this.program, 'u_chaos'),
                    speed: this.gl.getUniformLocation(this.program, 'u_speed'),
                    hue: this.gl.getUniformLocation(this.program, 'u_hue'),
                    intensity: this.gl.getUniformLocation(this.program, 'u_intensity'),
                    saturation: this.gl.getUniformLocation(this.program, 'u_saturation'),
                    dimension: this.gl.getUniformLocation(this.program, 'u_dimension'),
                    rot4dXW: this.gl.getUniformLocation(this.program, 'u_rot4dXW'),
                    rot4dYW: this.gl.getUniformLocation(this.program, 'u_rot4dYW'),
                    rot4dZW: this.gl.getUniformLocation(this.program, 'u_rot4dZW'),
                    mouseIntensity: this.gl.getUniformLocation(this.program, 'u_mouseIntensity'),
                    clickIntensity: this.gl.getUniformLocation(this.program, 'u_clickIntensity'),
                    roleIntensity: this.gl.getUniformLocation(this.program, 'u_roleIntensity')
                };
            }
            
            createProgram(vertexSource, fragmentSource) {
                const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexSource);
                const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentSource);
                
                const program = this.gl.createProgram();
                this.gl.attachShader(program, vertexShader);
                this.gl.attachShader(program, fragmentShader);
                this.gl.linkProgram(program);
                
                if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
                    console.error('Program linking failed:', this.gl.getProgramInfoLog(program));
                    return null;
                }
                
                return program;
            }
            
            createShader(type, source) {
                const shader = this.gl.createShader(type);
                this.gl.shaderSource(shader, source);
                this.gl.compileShader(shader);
                
                if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
                    console.error('Shader compilation failed:', this.gl.getShaderInfoLog(shader));
                    return null;
                }
                
                return shader;
            }
            
            initBuffers() {
                const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
                
                this.buffer = this.gl.createBuffer();
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
                this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
                
                const positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
                this.gl.enableVertexAttribArray(positionLocation);
                this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
            }
            
            render(time) {
                if (!this.program) return;
                
                this.resize();
                this.gl.useProgram(this.program);
                
                this.gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
                this.gl.uniform1f(this.uniforms.time, time);
                this.gl.uniform2f(this.uniforms.mouse, 0.5, 0.5);
                this.gl.uniform1f(this.uniforms.geometry, this.params.geometry || 0);
                this.gl.uniform1f(this.uniforms.gridDensity, this.params.gridDensity || 15);
                this.gl.uniform1f(this.uniforms.morphFactor, this.params.morphFactor || 1.0);
                this.gl.uniform1f(this.uniforms.chaos, this.params.chaos || 0.2);
                this.gl.uniform1f(this.uniforms.speed, this.params.speed || 1.0);
                this.gl.uniform1f(this.uniforms.hue, this.params.hue || 200);
                this.gl.uniform1f(this.uniforms.intensity, this.params.intensity || 0.5);
                this.gl.uniform1f(this.uniforms.saturation, this.params.saturation || 0.8);
                this.gl.uniform1f(this.uniforms.dimension, this.params.dimension || 3.8);
                this.gl.uniform1f(this.uniforms.rot4dXW, this.params.rot4dXW || 0.0);
                this.gl.uniform1f(this.uniforms.rot4dYW, this.params.rot4dYW || 0.0);
                this.gl.uniform1f(this.uniforms.rot4dZW, this.params.rot4dZW || 0.0);
                this.gl.uniform1f(this.uniforms.mouseIntensity, this.mouseIntensity || 0.0);
                this.gl.uniform1f(this.uniforms.clickIntensity, this.clickIntensity || 0.0);
                this.gl.uniform1f(this.uniforms.roleIntensity, this.roleIntensity);
                
                this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
            }
        }
        
        // Enhanced interactivity system - FIXED CANVAS SCOPE
        const canvas = document.getElementById('vib34dCanvas');
        if (!canvas) {
            console.error('Canvas not found for interactivity');
            return;
        }
        
        let mouseX = 0.5, mouseY = 0.5, mouseIntensity = 0.0;
        let clickIntensity = 0.0;
        let currentTouch = null;
        
        // Mouse interactions
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = (e.clientX - rect.left) / rect.width;
            mouseY = 1.0 - (e.clientY - rect.top) / rect.height;
            mouseIntensity = Math.min(1.0, Math.sqrt(e.movementX*e.movementX + e.movementY*e.movementY) / 40);
            
            // Update all layer visualizers
            layers.forEach(layer => {
                if (layer.visualizer) {
                    layer.visualizer.mouseX = mouseX;
                    layer.visualizer.mouseY = mouseY;
                    layer.visualizer.mouseIntensity = mouseIntensity;
                }
            });
        });
        
        canvas.addEventListener('click', (e) => {
            clickIntensity = 1.0;
            layers.forEach(layer => {
                if (layer.visualizer) {
                    layer.visualizer.clickIntensity = clickIntensity;
                }
            });
            setTimeout(() => { 
                clickIntensity = 0.0;
                layers.forEach(layer => {
                    if (layer.visualizer) {
                        layer.visualizer.clickIntensity = 0.0;
                    }
                });
            }, 500);
        });
        
        // Touch interactions
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (e.touches.length > 0) {
                currentTouch = e.touches[0];
                const rect = canvas.getBoundingClientRect();
                mouseX = (currentTouch.clientX - rect.left) / rect.width;
                mouseY = 1.0 - (currentTouch.clientY - rect.top) / rect.height;
                clickIntensity = 1.0;
                
                layers.forEach(layer => {
                    if (layer.visualizer) {
                        layer.visualizer.mouseX = mouseX;
                        layer.visualizer.mouseY = mouseY;
                        layer.visualizer.clickIntensity = clickIntensity;
                    }
                });
            }
        }, { passive: false });
        
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                const rect = canvas.getBoundingClientRect();
                mouseX = (touch.clientX - rect.left) / rect.width;
                mouseY = 1.0 - (touch.clientY - rect.top) / rect.height;
                mouseIntensity = 0.8;
                currentTouch = touch;
                
                layers.forEach(layer => {
                    if (layer.visualizer) {
                        layer.visualizer.mouseX = mouseX;
                        layer.visualizer.mouseY = mouseY;
                        layer.visualizer.mouseIntensity = mouseIntensity;
                    }
                });
            }
        }, { passive: false });
        
        canvas.addEventListener('touchend', (e) => {
            clickIntensity = 0.0;
            mouseIntensity = 0.0;
            currentTouch = null;
            
            layers.forEach(layer => {
                if (layer.visualizer) {
                    layer.visualizer.clickIntensity = 0.0;
                    layer.visualizer.mouseIntensity = 0.0;
                }
            });
        }, { passive: false });
        
        // Scroll interactions
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            clickIntensity = Math.min(1.0, Math.abs(e.deltaY) / 100);
            
            layers.forEach(layer => {
                if (layer.visualizer) {
                    layer.visualizer.clickIntensity = clickIntensity;
                }
            });
            
            setTimeout(() => { 
                clickIntensity = 0.0;
                layers.forEach(layer => {
                    if (layer.visualizer) {
                        layer.visualizer.clickIntensity = 0.0;
                    }
                });
            }, 300);
        }, { passive: false });`;
    }
    
    /**
     * Generate LIVE Quantum system with enhanced holographic effects
     */
    generateLiveQuantumSystem(state) {
        return `
        // LIVE VIB34D Quantum System - Enhanced 5 Layer WebGL Rendering
        class LiveQuantumTradingCardSystem {
            constructor(canvas) {
                this.canvas = canvas;
                this.layers = [];
                this.params = ${JSON.stringify(state.parameters)};
                this.startTime = Date.now();
                
                console.log('🌌 Initializing LIVE Quantum Trading Card System');
                this.initializeLayers();
                this.startRenderLoop();
            }
            
            initializeLayers() {
                const layerConfigs = [
                    { id: 'quantum-bg', role: 'background', blend: 'multiply', opacity: 0.4, intensity: 0.4, densityMult: 0.8, speedMult: 0.6 },
                    { id: 'quantum-shadow', role: 'shadow', blend: 'multiply', opacity: 0.6, intensity: 0.6, densityMult: 0.9, speedMult: 0.8 },
                    { id: 'quantum-content', role: 'content', blend: 'normal', opacity: 1.0, intensity: 1.0, densityMult: 1.0, speedMult: 1.0 },
                    { id: 'quantum-highlight', role: 'highlight', blend: 'screen', opacity: 0.8, intensity: 1.3, densityMult: 1.1, speedMult: 1.2 },
                    { id: 'quantum-accent', role: 'accent', blend: 'color-dodge', opacity: 0.7, intensity: 1.6, densityMult: 1.2, speedMult: 1.4 }
                ];
                
                layerConfigs.forEach(config => {
                    const layerCanvas = document.createElement('canvas');
                    layerCanvas.id = config.id;
                    layerCanvas.width = this.canvas.width;
                    layerCanvas.height = this.canvas.height;
                    layerCanvas.style.position = 'absolute';
                    layerCanvas.style.top = '0';
                    layerCanvas.style.left = '0';
                    layerCanvas.style.width = '100%';
                    layerCanvas.style.height = '100%';
                    layerCanvas.style.mixBlendMode = config.blend;
                    layerCanvas.style.opacity = config.opacity;
                    layerCanvas.style.pointerEvents = 'none';
                    
                    this.canvas.parentNode.appendChild(layerCanvas);
                    
                    const visualizer = new QuantumLayerVisualizer(layerCanvas, config);
                    this.layers.push({ visualizer, config });
                    console.log(\`🌌 Created quantum layer: \${config.role}\`);
                });
            }
            
            startRenderLoop() {
                const render = () => {
                    this.layers.forEach(({ visualizer }) => {
                        if (visualizer && visualizer.render) {
                            visualizer.render(Date.now());
                        }
                    });
                    requestAnimationFrame(render);
                };
                render();
            }
        }
        
        // Enhanced Quantum Layer Visualizer with complex 3D lattice shaders
        class QuantumLayerVisualizer {
            constructor(canvas, roleConfig) {
                this.canvas = canvas;
                this.roleConfig = roleConfig;
                this.gl = canvas.getContext('webgl');
                this.params = ${JSON.stringify(state.parameters)};
                this.mouseX = 0.5;
                this.mouseY = 0.5;
                this.mouseIntensity = 0.0;
                this.clickIntensity = 0.0;
                this.startTime = Date.now();
                
                if (!this.gl) {
                    console.error(\`WebGL not supported for quantum layer \${roleConfig.role}\`);
                    return;
                }
                
                this.initShaders();
                this.initBuffers();
            }
            
            initShaders() {
                const vertexShader = \`
                attribute vec2 a_position;
                void main() {
                    gl_Position = vec4(a_position, 0.0, 1.0);
                }\`;
                
                const fragmentShader = \`
                precision highp float;
                uniform vec2 u_resolution;
                uniform float u_time;
                uniform vec2 u_mouse;
                uniform float u_geometry;
                uniform float u_gridDensity;
                uniform float u_morphFactor;
                uniform float u_chaos;
                uniform float u_speed;
                uniform float u_hue;
                uniform float u_intensity;
                uniform float u_saturation;
                uniform float u_rot4dXW;
                uniform float u_rot4dYW;
                uniform float u_rot4dZW;
                uniform float u_mouseIntensity;
                uniform float u_clickIntensity;
                uniform float u_roleIntensity;
                
                // 4D rotation matrices
                mat4 rotateXW(float theta) {
                    float c = cos(theta);
                    float s = sin(theta);
                    return mat4(c, 0.0, 0.0, -s, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, s, 0.0, 0.0, c);
                }
                
                mat4 rotateYW(float theta) {
                    float c = cos(theta);
                    float s = sin(theta);
                    return mat4(1.0, 0.0, 0.0, 0.0, 0.0, c, 0.0, -s, 0.0, 0.0, 1.0, 0.0, 0.0, s, 0.0, c);
                }
                
                mat4 rotateZW(float theta) {
                    float c = cos(theta);
                    float s = sin(theta);
                    return mat4(1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, c, -s, 0.0, 0.0, s, c);
                }
                
                vec3 project4Dto3D(vec4 p) {
                    float w = 2.5 / (2.5 + p.w);
                    return vec3(p.x * w, p.y * w, p.z * w);
                }
                
                // COMPLEX 3D LATTICE FUNCTIONS - QUANTUM ENHANCED
                float tetrahedronLattice(vec3 p, float gridSize) {
                    vec3 q = fract(p * gridSize) - 0.5;
                    float d1 = length(q);
                    float d2 = length(q - vec3(0.4, 0.0, 0.0));
                    float d3 = length(q - vec3(0.0, 0.4, 0.0));
                    float d4 = length(q - vec3(0.0, 0.0, 0.4));
                    float vertices = 1.0 - smoothstep(0.0, 0.04, min(min(d1, d2), min(d3, d4)));
                    float edges = 0.0;
                    edges = max(edges, 1.0 - smoothstep(0.0, 0.02, abs(length(q.xy) - 0.2)));
                    edges = max(edges, 1.0 - smoothstep(0.0, 0.02, abs(length(q.yz) - 0.2)));
                    edges = max(edges, 1.0 - smoothstep(0.0, 0.02, abs(length(q.xz) - 0.2)));
                    return max(vertices, edges * 0.5);
                }
                
                float hypercubeLattice(vec3 p, float gridSize) {
                    vec3 grid = fract(p * gridSize);
                    vec3 edges = min(grid, 1.0 - grid);
                    float minEdge = min(min(edges.x, edges.y), edges.z);
                    float lattice = 1.0 - smoothstep(0.0, 0.03, minEdge);
                    
                    vec3 centers = abs(grid - 0.5);
                    float maxCenter = max(max(centers.x, centers.y), centers.z);
                    float vertices = 1.0 - smoothstep(0.45, 0.5, maxCenter);
                    
                    return max(lattice * 0.7, vertices);
                }
                
                // ENHANCED GEOMETRY FUNCTION WITH QUANTUM EFFECTS
                float quantumGeometry(vec4 p) {
                    int geomType = int(u_geometry);
                    vec3 p3d = project4Dto3D(p);
                    float gridSize = u_gridDensity * 0.08;
                    
                    if (geomType == 0) {
                        return tetrahedronLattice(p3d, gridSize) * u_morphFactor;
                    } else if (geomType == 1) {
                        return hypercubeLattice(p3d, gridSize) * u_morphFactor;
                    } else {
                        return hypercubeLattice(p3d, gridSize) * u_morphFactor;
                    }
                }
                
                // HSV to RGB conversion
                vec3 hsv2rgb(vec3 c) {
                    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
                    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
                    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
                }
                
                // RGB Glitch effect
                vec3 rgbGlitch(vec3 color, vec2 uv, float intensity) {
                    float r = color.r + sin(uv.y * 30.0 + u_time * 0.001) * intensity * 0.06;
                    float g = color.g + sin(uv.y * 28.0 + u_time * 0.0012) * intensity * 0.06;
                    float b = color.b + sin(uv.y * 32.0 + u_time * 0.0008) * intensity * 0.06;
                    return vec3(r, g, b);
                }
                
                void main() {
                    vec2 uv = (gl_FragCoord.xy - u_resolution.xy * 0.5) / min(u_resolution.x, u_resolution.y);
                    
                    // Enhanced 4D position with quantum effects
                    float timeSpeed = u_time * 0.0001 * u_speed;
                    vec4 pos = vec4(uv * 3.0, sin(timeSpeed * 3.0), cos(timeSpeed * 2.0));
                    pos.xy += (u_mouse - 0.5) * u_mouseIntensity * 2.0;
                    
                    // Apply 4D rotations
                    pos = rotateXW(u_rot4dXW) * pos;
                    pos = rotateYW(u_rot4dYW) * pos;
                    pos = rotateZW(u_rot4dZW) * pos;
                    
                    // Calculate quantum geometry value
                    float value = quantumGeometry(pos);
                    
                    // Enhanced chaos with quantum noise
                    float noise = sin(pos.x * 7.0) * cos(pos.y * 11.0) * sin(pos.z * 13.0);
                    value += noise * u_chaos;
                    
                    // Quantum intensity calculation with holographic glow
                    float geometryIntensity = 1.0 - clamp(abs(value * 0.8), 0.0, 1.0);
                    geometryIntensity = pow(geometryIntensity, 1.5);
                    geometryIntensity += u_clickIntensity * 0.3;
                    
                    // Quantum shimmer effect
                    float shimmer = sin(uv.x * 20.0 + timeSpeed * 5.0) * cos(uv.y * 15.0 + timeSpeed * 3.0) * 0.1;
                    geometryIntensity += shimmer * geometryIntensity;
                    
                    float finalIntensity = geometryIntensity * u_intensity;
                    
                    // Enhanced quantum color system
                    float baseHue = u_hue / 360.0;
                    float hueShift = value * 0.2 + timeSpeed * 0.1;
                    float finalHue = baseHue + hueShift;
                    
                    vec3 hsvColor = vec3(finalHue, u_saturation, finalIntensity);
                    vec3 baseColor = hsv2rgb(hsvColor);
                    
                    // Add quantum particles
                    float particles = 0.0;
                    vec2 particleUV = uv * 8.0;
                    vec2 particleID = floor(particleUV);
                    vec2 particlePos = fract(particleUV) - 0.5;
                    float particleDist = length(particlePos);
                    
                    float particleTime = timeSpeed + dot(particleID, vec2(127.1, 311.7));
                    float particleAlpha = sin(particleTime) * 0.5 + 0.5;
                    particles = (1.0 - smoothstep(0.1, 0.3, particleDist)) * particleAlpha * 0.3;
                    
                    vec3 glitchedColor = rgbGlitch(baseColor, uv, finalIntensity * 0.5);
                    vec3 finalColor = glitchedColor + particles * vec3(1.0, 0.8, 1.0);
                    
                    gl_FragColor = vec4(finalColor, finalIntensity * u_roleIntensity);
                }\`;
                
                this.program = this.createProgram(vertexShader, fragmentShader);
                if (this.program) {
                    this.uniforms = {
                        resolution: this.gl.getUniformLocation(this.program, 'u_resolution'),
                        time: this.gl.getUniformLocation(this.program, 'u_time'),
                        mouse: this.gl.getUniformLocation(this.program, 'u_mouse'),
                        geometry: this.gl.getUniformLocation(this.program, 'u_geometry'),
                        gridDensity: this.gl.getUniformLocation(this.program, 'u_gridDensity'),
                        morphFactor: this.gl.getUniformLocation(this.program, 'u_morphFactor'),
                        chaos: this.gl.getUniformLocation(this.program, 'u_chaos'),
                        speed: this.gl.getUniformLocation(this.program, 'u_speed'),
                        hue: this.gl.getUniformLocation(this.program, 'u_hue'),
                        intensity: this.gl.getUniformLocation(this.program, 'u_intensity'),
                        saturation: this.gl.getUniformLocation(this.program, 'u_saturation'),
                        rot4dXW: this.gl.getUniformLocation(this.program, 'u_rot4dXW'),
                        rot4dYW: this.gl.getUniformLocation(this.program, 'u_rot4dYW'),
                        rot4dZW: this.gl.getUniformLocation(this.program, 'u_rot4dZW'),
                        mouseIntensity: this.gl.getUniformLocation(this.program, 'u_mouseIntensity'),
                        clickIntensity: this.gl.getUniformLocation(this.program, 'u_clickIntensity'),
                        roleIntensity: this.gl.getUniformLocation(this.program, 'u_roleIntensity')
                    };
                }
            }
            
            createProgram(vertexSource, fragmentSource) {
                const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexSource);
                const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentSource);
                
                if (!vertexShader || !fragmentShader) return null;
                
                const program = this.gl.createProgram();
                this.gl.attachShader(program, vertexShader);
                this.gl.attachShader(program, fragmentShader);
                this.gl.linkProgram(program);
                
                if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
                    console.error('Quantum program linking failed:', this.gl.getProgramInfoLog(program));
                    return null;
                }
                
                return program;
            }
            
            createShader(type, source) {
                const shader = this.gl.createShader(type);
                this.gl.shaderSource(shader, source);
                this.gl.compileShader(shader);
                
                if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
                    console.error('Quantum shader compilation failed:', this.gl.getShaderInfoLog(shader));
                    return null;
                }
                
                return shader;
            }
            
            initBuffers() {
                const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
                this.buffer = this.gl.createBuffer();
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
                this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
                
                const positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
                this.gl.enableVertexAttribArray(positionLocation);
                this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
            }
            
            render(time) {
                if (!this.program) return;
                
                this.canvas.width = this.canvas.clientWidth;
                this.canvas.height = this.canvas.clientHeight;
                this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
                this.gl.useProgram(this.program);
                
                this.gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
                this.gl.uniform1f(this.uniforms.time, time);
                this.gl.uniform2f(this.uniforms.mouse, this.mouseX || 0.5, this.mouseY || 0.5);
                this.gl.uniform1f(this.uniforms.geometry, this.params.geometry || 0);
                this.gl.uniform1f(this.uniforms.gridDensity, (this.params.gridDensity || 15) * this.roleConfig.densityMult);
                this.gl.uniform1f(this.uniforms.morphFactor, this.params.morphFactor || 1.0);
                this.gl.uniform1f(this.uniforms.chaos, this.params.chaos || 0.2);
                this.gl.uniform1f(this.uniforms.speed, (this.params.speed || 1.0) * this.roleConfig.speedMult);
                this.gl.uniform1f(this.uniforms.hue, this.params.hue || 280); // Quantum purple-blue
                this.gl.uniform1f(this.uniforms.intensity, (this.params.intensity || 0.7) * this.roleConfig.intensity);
                this.gl.uniform1f(this.uniforms.saturation, this.params.saturation || 0.9);
                this.gl.uniform1f(this.uniforms.rot4dXW, this.params.rot4dXW || 0.0);
                this.gl.uniform1f(this.uniforms.rot4dYW, this.params.rot4dYW || 0.0);
                this.gl.uniform1f(this.uniforms.rot4dZW, this.params.rot4dZW || 0.0);
                this.gl.uniform1f(this.uniforms.mouseIntensity, this.mouseIntensity || 0.0);
                this.gl.uniform1f(this.uniforms.clickIntensity, this.clickIntensity || 0.0);
                this.gl.uniform1f(this.uniforms.roleIntensity, this.roleConfig.intensity);
                
                this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
            }
        }
        
        // Enhanced interactivity system for Quantum cards - FIXED CANVAS SCOPE
        const canvas = document.getElementById('vib34dCanvas');
        if (!canvas) {
            console.error('Canvas not found for quantum interactivity');
            return;
        }
        
        let mouseX = 0.5, mouseY = 0.5, mouseIntensity = 0.0;
        let clickIntensity = 0.0;
        
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = (e.clientX - rect.left) / rect.width;
            mouseY = 1.0 - (e.clientY - rect.top) / rect.height;
            mouseIntensity = Math.min(1.0, Math.sqrt(e.movementX*e.movementX + e.movementY*e.movementY) / 40);
            
            layers.forEach(layer => {
                if (layer.visualizer) {
                    layer.visualizer.mouseX = mouseX;
                    layer.visualizer.mouseY = mouseY;
                    layer.visualizer.mouseIntensity = mouseIntensity;
                }
            });
        });
        
        canvas.addEventListener('dblclick', async () => {
            console.log('🌌 Quantum card audio reactivity - Coming soon!');
            canvas.style.border = '2px solid #ff00ff';
            setTimeout(() => { canvas.style.border = ''; }, 2000);
        });`;
    }
    
    /**
     * Generate LIVE 5-layer Holographic system with actual shader code
     */
    generateLiveHolographicSystem(state) {
        return `
        // LIVE Active Holographic System - 5 Layer WebGL with Audio Reactivity
        class LiveTradingCardSystem {
            constructor() {
                this.layers = ['background', 'shadow', 'content', 'highlight', 'accent'];
                this.visualizers = [];
                this.params = ${JSON.stringify(state.parameters)};
                this.startTime = Date.now();
                
                this.initializeAllLayers();
                this.startRenderLoop();
            }
            
            initializeAllLayers() {
                // Create 5 canvases with holographic blend modes
                this.layers.forEach((role, index) => {
                    const canvas = document.createElement('canvas');
                    canvas.id = 'card-' + role + '-canvas';
                    canvas.style.position = 'absolute';
                    canvas.style.top = '0';
                    canvas.style.left = '0';
                    canvas.style.width = '100%';
                    canvas.style.height = '100%';
                    canvas.style.zIndex = index;
                    
                    // Holographic layer blend modes for rich effects
                    if (role === 'background') {
                        canvas.style.opacity = '0.3';
                        canvas.style.mixBlendMode = 'normal';
                    } else if (role === 'shadow') {
                        canvas.style.opacity = '0.7';
                        canvas.style.mixBlendMode = 'multiply';
                    } else if (role === 'content') {
                        canvas.style.opacity = '1.0';
                        canvas.style.mixBlendMode = 'normal';
                    } else if (role === 'highlight') {
                        canvas.style.opacity = '0.9';
                        canvas.style.mixBlendMode = 'screen';
                    } else if (role === 'accent') {
                        canvas.style.opacity = '0.6';
                        canvas.style.mixBlendMode = 'color-dodge';
                    }
                    
                    document.getElementById('vib34dCanvas').parentElement.appendChild(canvas);
                    
                    // Create holographic visualizer for this layer
                    const visualizer = new HolographicLayerVisualizer(canvas, role, this.params);
                    this.visualizers.push(visualizer);
                });
                
                // Hide the original canvas
                document.getElementById('vib34dCanvas').style.display = 'none';
            }
            
            startRenderLoop() {
                const render = () => {
                    const time = Date.now() - this.startTime;
                    this.visualizers.forEach(visualizer => {
                        visualizer.render(time);
                    });
                    requestAnimationFrame(render);
                };
                render();
            }
        }
        
        class HolographicLayerVisualizer {
            constructor(canvas, role, params) {
                this.canvas = canvas;
                this.role = role;
                this.params = params;
                this.gl = canvas.getContext('webgl');
                
                const roleParams = {
                    'background': { densityMult: 0.4, speedMult: 0.2, intensity: 0.2 },
                    'shadow': { densityMult: 0.8, speedMult: 0.3, intensity: 0.4 },
                    'content': { densityMult: 1.0, speedMult: 0.5, intensity: 0.8 },
                    'highlight': { densityMult: 1.5, speedMult: 0.8, intensity: 1.0 },
                    'accent': { densityMult: 2.0, speedMult: 0.4, intensity: 0.6 }
                };
                this.roleConfig = roleParams[role] || roleParams['content'];
                
                this.initShaders();
                this.initBuffers();
                this.resize();
            }
            
            resize() {
                this.canvas.width = this.canvas.clientWidth;
                this.canvas.height = this.canvas.clientHeight;
                this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            }
            
            initShaders() {
                const vertexShaderSource = \`
            attribute vec2 a_position;
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        \`;
                
                // EXACT HOLOGRAPHIC FRAGMENT SHADER WITH ALL EFFECTS
                const fragmentShaderSource = \`
            precision highp float;
            
            uniform vec2 u_resolution;
            uniform float u_time;
            uniform vec2 u_mouse;
            uniform float u_geometry;
            uniform float u_density;
            uniform float u_speed;
            uniform vec3 u_color;
            uniform float u_intensity;
            uniform float u_roleDensity;
            uniform float u_roleSpeed;
            uniform float u_geometryType;
            uniform float u_chaos;
            uniform float u_morph;
            uniform float u_rot4dXW;
            uniform float u_rot4dYW;
            uniform float u_rot4dZW;
            
            // 4D rotation matrices
            mat4 rotateXW(float theta) {
                float c = cos(theta);
                float s = sin(theta);
                return mat4(c, 0, 0, -s, 0, 1, 0, 0, 0, 0, 1, 0, s, 0, 0, c);
            }
            
            mat4 rotateYW(float theta) {
                float c = cos(theta);
                float s = sin(theta);
                return mat4(1, 0, 0, 0, 0, c, 0, -s, 0, 0, 1, 0, 0, s, 0, c);
            }
            
            mat4 rotateZW(float theta) {
                float c = cos(theta);
                float s = sin(theta);
                return mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, c, -s, 0, 0, s, c);
            }
            
            vec3 project4Dto3D(vec4 p) {
                float w = 2.5 / (2.5 + p.w);
                return vec3(p.x * w, p.y * w, p.z * w);
            }
            
            // Complete VIB3 Geometry Library
            float tetrahedronLattice(vec3 p, float gridSize) {
                vec3 q = fract(p * gridSize) - 0.5;
                float d1 = length(q);
                float d2 = length(q - vec3(0.4, 0.0, 0.0));
                float d3 = length(q - vec3(0.0, 0.4, 0.0));
                float d4 = length(q - vec3(0.0, 0.0, 0.4));
                float vertices = 1.0 - smoothstep(0.0, 0.04, min(min(d1, d2), min(d3, d4)));
                float edges = 0.0;
                edges = max(edges, 1.0 - smoothstep(0.0, 0.02, abs(length(q.xy) - 0.2)));
                edges = max(edges, 1.0 - smoothstep(0.0, 0.02, abs(length(q.yz) - 0.2)));
                edges = max(edges, 1.0 - smoothstep(0.0, 0.02, abs(length(q.xz) - 0.2)));
                return max(vertices, edges * 0.5);
            }
            
            float hypercubeLattice(vec3 p, float gridSize) {
                vec3 grid = fract(p * gridSize);
                vec3 edges = 1.0 - smoothstep(0.0, 0.03, abs(grid - 0.5));
                return max(max(edges.x, edges.y), edges.z);
            }
            
            float sphereLattice(vec3 p, float gridSize) {
                vec3 q = fract(p * gridSize) - 0.5;
                float r = length(q);
                return 1.0 - smoothstep(0.2, 0.5, r);
            }
            
            float torusLattice(vec3 p, float gridSize) {
                vec3 q = fract(p * gridSize) - 0.5;
                float r1 = sqrt(q.x*q.x + q.y*q.y);
                float r2 = sqrt((r1 - 0.3)*(r1 - 0.3) + q.z*q.z);
                return 1.0 - smoothstep(0.0, 0.1, r2);
            }
            
            float kleinLattice(vec3 p, float gridSize) {
                vec3 q = fract(p * gridSize);
                float u = q.x * 2.0 * 3.14159;
                float v = q.y * 2.0 * 3.14159;
                float x = cos(u) * (3.0 + cos(u/2.0) * sin(v) - sin(u/2.0) * sin(2.0*v));
                float klein = length(vec2(x, q.z)) - 0.1;
                return 1.0 - smoothstep(0.0, 0.05, abs(klein));
            }
            
            float fractalLattice(vec3 p, float gridSize) {
                vec3 q = p * gridSize;
                float scale = 1.0;
                float fractal = 0.0;
                for(int i = 0; i < 4; i++) {
                  q = fract(q) - 0.5;
                  fractal += abs(length(q)) / scale;
                  scale *= 2.0;
                  q *= 2.0;
                }
                return 1.0 - smoothstep(0.0, 1.0, fractal);
            }
            
            float waveLattice(vec3 p, float gridSize) {
                vec3 q = p * gridSize;
                float wave = sin(q.x * 2.0) * sin(q.y * 2.0) * sin(q.z * 2.0 + u_time);
                return smoothstep(-0.5, 0.5, wave);
            }
            
            float crystalLattice(vec3 p, float gridSize) {
                vec3 q = fract(p * gridSize) - 0.5;
                float d = max(max(abs(q.x), abs(q.y)), abs(q.z));
                return 1.0 - smoothstep(0.3, 0.5, d);
            }
            
            float getDynamicGeometry(vec3 p, float gridSize, float geometryType) {
                int baseGeom = int(mod(geometryType, 8.0));
                float variation = floor(geometryType / 8.0) / 4.0;
                float variedGridSize = gridSize * (0.5 + variation * 1.5);
                
                if (baseGeom == 0) return tetrahedronLattice(p, variedGridSize);
                else if (baseGeom == 1) return hypercubeLattice(p, variedGridSize);
                else if (baseGeom == 2) return sphereLattice(p, variedGridSize);
                else if (baseGeom == 3) return torusLattice(p, variedGridSize);
                else if (baseGeom == 4) return kleinLattice(p, variedGridSize);
                else if (baseGeom == 5) return fractalLattice(p, variedGridSize);
                else if (baseGeom == 6) return waveLattice(p, variedGridSize);
                else return crystalLattice(p, variedGridSize);
            }
            
            vec3 rgbGlitch(vec3 color, vec2 uv, float intensity) {
                vec2 offset = vec2(intensity * 0.005, 0.0);
                float r = color.r + sin(uv.y * 30.0 + u_time * 0.001) * intensity * 0.06;
                float g = color.g + sin(uv.y * 28.0 + u_time * 0.0012) * intensity * 0.06;
                float b = color.b + sin(uv.y * 32.0 + u_time * 0.0008) * intensity * 0.06;
                return vec3(r, g, b);
            }
            
            float moirePattern(vec2 uv, float intensity) {
                float freq1 = 12.0 + intensity * 6.0;
                float freq2 = 14.0 + intensity * 8.0;
                float pattern1 = sin(uv.x * freq1) * sin(uv.y * freq1);
                float pattern2 = sin(uv.x * freq2) * sin(uv.y * freq2);
                return (pattern1 * pattern2) * intensity * 0.15;
            }
            
            void main() {
                vec2 uv = gl_FragCoord.xy / u_resolution.xy;
                float aspectRatio = u_resolution.x / u_resolution.y;
                uv.x *= aspectRatio;
                uv -= 0.5;
                
                float time = u_time * 0.0004 * u_speed * u_roleSpeed;
                
                vec4 p4d = vec4(uv * 3.0, sin(time * 0.1) * 0.15, cos(time * 0.08) * 0.15);
                
                p4d = rotateXW(u_rot4dXW + time * 0.2) * p4d;
                p4d = rotateYW(u_rot4dYW + time * 0.15) * p4d;
                p4d = rotateZW(u_rot4dZW + time * 0.25) * p4d;
                
                vec3 p = project4Dto3D(p4d);
                
                float roleDensity = u_density * u_roleDensity;
                float morphedGeometry = u_geometryType + u_morph * 3.0;
                float lattice = getDynamicGeometry(p, roleDensity, morphedGeometry);
                
                vec3 baseColor = u_color;
                float latticeIntensity = lattice * u_intensity;
                
                vec3 color = baseColor * (0.3 + latticeIntensity * 0.7);
                color += vec3(lattice * 0.4) * baseColor;
                
                // Add holographic effects
                color += vec3(moirePattern(uv, u_chaos));
                color = rgbGlitch(color, uv, u_chaos);
                
                gl_FragColor = vec4(color, 0.95);
            }
        \`;
                
                this.program = this.createProgram(vertexShaderSource, fragmentShaderSource);
                this.uniforms = {
                    resolution: this.gl.getUniformLocation(this.program, 'u_resolution'),
                    time: this.gl.getUniformLocation(this.program, 'u_time'),
                    mouse: this.gl.getUniformLocation(this.program, 'u_mouse'),
                    geometry: this.gl.getUniformLocation(this.program, 'u_geometry'),
                    density: this.gl.getUniformLocation(this.program, 'u_density'),
                    speed: this.gl.getUniformLocation(this.program, 'u_speed'),
                    color: this.gl.getUniformLocation(this.program, 'u_color'),
                    intensity: this.gl.getUniformLocation(this.program, 'u_intensity'),
                    roleDensity: this.gl.getUniformLocation(this.program, 'u_roleDensity'),
                    roleSpeed: this.gl.getUniformLocation(this.program, 'u_roleSpeed'),
                    geometryType: this.gl.getUniformLocation(this.program, 'u_geometryType'),
                    chaos: this.gl.getUniformLocation(this.program, 'u_chaos'),
                    morph: this.gl.getUniformLocation(this.program, 'u_morph'),
                    rot4dXW: this.gl.getUniformLocation(this.program, 'u_rot4dXW'),
                    rot4dYW: this.gl.getUniformLocation(this.program, 'u_rot4dYW'),
                    rot4dZW: this.gl.getUniformLocation(this.program, 'u_rot4dZW')
                };
            }
            
            createProgram(vertexSource, fragmentSource) {
                const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexSource);
                const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentSource);
                
                const program = this.gl.createProgram();
                this.gl.attachShader(program, vertexShader);
                this.gl.attachShader(program, fragmentShader);
                this.gl.linkProgram(program);
                
                if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
                    console.error('Program linking failed:', this.gl.getProgramInfoLog(program));
                    return null;
                }
                
                return program;
            }
            
            createShader(type, source) {
                const shader = this.gl.createShader(type);
                this.gl.shaderSource(shader, source);
                this.gl.compileShader(shader);
                
                if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
                    console.error('Shader compilation failed:', this.gl.getShaderInfoLog(shader));
                    return null;
                }
                
                return shader;
            }
            
            initBuffers() {
                const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
                
                this.buffer = this.gl.createBuffer();
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
                this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
                
                const positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
                this.gl.enableVertexAttribArray(positionLocation);
                this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
            }
            
            render(time) {
                if (!this.program) return;
                
                this.resize();
                this.gl.useProgram(this.program);
                
                const hue = (this.params.hue || 200) / 360;
                const saturation = this.params.saturation || 0.8;
                const lightness = this.params.intensity || 0.5;
                
                // HSL to RGB conversion
                const hslToRgb = (h, s, l) => {
                    let r, g, b;
                    if (s === 0) {
                        r = g = b = l;
                    } else {
                        const hue2rgb = (p, q, t) => {
                            if (t < 0) t += 1;
                            if (t > 1) t -= 1;
                            if (t < 1/6) return p + (q - p) * 6 * t;
                            if (t < 1/2) return q;
                            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                            return p;
                        };
                        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                        const p = 2 * l - q;
                        r = hue2rgb(p, q, h + 1/3);
                        g = hue2rgb(p, q, h);
                        b = hue2rgb(p, q, h - 1/3);
                    }
                    return [r, g, b];
                };
                
                const rgbColor = hslToRgb(hue, saturation, lightness);
                
                this.gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
                this.gl.uniform1f(this.uniforms.time, time);
                this.gl.uniform2f(this.uniforms.mouse, 0.5, 0.5);
                this.gl.uniform1f(this.uniforms.geometryType, this.params.geometryType || 0);
                this.gl.uniform1f(this.uniforms.density, (this.params.density || 1.0) * this.roleConfig.densityMult);
                this.gl.uniform1f(this.uniforms.speed, (this.params.speed || 0.5) * this.roleConfig.speedMult);
                this.gl.uniform3fv(this.uniforms.color, new Float32Array(rgbColor));
                this.gl.uniform1f(this.uniforms.intensity, (this.params.intensity || 0.5) * this.roleConfig.intensity);
                this.gl.uniform1f(this.uniforms.roleDensity, this.roleConfig.densityMult);
                this.gl.uniform1f(this.uniforms.roleSpeed, this.roleConfig.speedMult);
                this.gl.uniform1f(this.uniforms.chaos, this.params.chaos || 0.0);
                this.gl.uniform1f(this.uniforms.morph, this.params.morph || 0.0);
                this.gl.uniform1f(this.uniforms.rot4dXW, this.params.rot4dXW || 0.0);
                this.gl.uniform1f(this.uniforms.rot4dYW, this.params.rot4dYW || 0.0);
                this.gl.uniform1f(this.uniforms.rot4dZW, this.params.rot4dZW || 0.0);
                
                this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
            }
        }
        
        // Enhanced interactivity system for Holographic cards - FIXED CANVAS SCOPE
        const canvas = document.getElementById('vib34dCanvas');
        if (!canvas) {
            console.error('Canvas not found for holographic interactivity');
            return;
        }
        
        let mouseX = 0.5, mouseY = 0.5, mouseIntensity = 0.0;
        let clickIntensity = 0.0;
        let currentTouch = null;
        
        // Mouse interactions
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = (e.clientX - rect.left) / rect.width;
            mouseY = 1.0 - (e.clientY - rect.top) / rect.height;
            mouseIntensity = Math.min(1.0, Math.sqrt(e.movementX*e.movementX + e.movementY*e.movementY) / 40);
            
            // Update all layer visualizers
            layers.forEach(layer => {
                if (layer.visualizer) {
                    layer.visualizer.mouseX = mouseX;
                    layer.visualizer.mouseY = mouseY;
                    layer.visualizer.mouseIntensity = mouseIntensity;
                }
            });
        });
        
        // Audio reactivity (double-click to enable)
        let audioEnabled = false;
        let audioContext = null;
        let analyser = null;
        let frequencyData = null;
        
        canvas.addEventListener('dblclick', async () => {
            if (!audioEnabled) {
                try {
                    audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    analyser = audioContext.createAnalyser();
                    analyser.fftSize = 256;
                    frequencyData = new Uint8Array(analyser.frequencyBinCount);
                    
                    const stream = await navigator.mediaDevices.getUserMedia({
                        audio: { echoCancellation: false, noiseSuppression: false }
                    });
                    
                    const source = audioContext.createMediaStreamSource(stream);
                    source.connect(analyser);
                    audioEnabled = true;
                    
                    console.log('🎵 Trading card audio reactivity ENABLED');
                    canvas.style.border = '2px solid #00ff00';
                    setTimeout(() => { canvas.style.border = ''; }, 2000);
                } catch (error) {
                    console.error('Audio failed:', error);
                }
            }
        });`;
    }
    
    /**
     * Generate LIVE Polychora system (placeholder for now)
     */
    generateLivePolychoraSystem(state) {
        // For now, use faceted system as base - will be enhanced later
        return this.generateLiveFacetedSystem(state);
    }
    
    /**
     * Generate WebGL code for Faceted system with EXACT shader from Visualizer.js
     */
    generateFacetedVisualizationCode(state) {
        return `
        // VIB34D Faceted System Trading Card - ${state.name}
        // EXACT SHADER CODE FROM src/core/Visualizer.js IntegratedHolographicVisualizer
        class TradingCardVisualizer {
            constructor(canvas) {
                this.canvas = canvas;
                this.gl = canvas.getContext('webgl');
                this.params = ${JSON.stringify(state.parameters)};
                this.startTime = Date.now();
                
                if (!this.gl) {
                    console.error('WebGL not supported');
                    return;
                }
                
                this.initShaders();
                this.initBuffers();
                this.resize();
                this.animate();
            }
            
            resize() {
                this.canvas.width = this.canvas.clientWidth;
                this.canvas.height = this.canvas.clientHeight;
                this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            }
            
            initShaders() {
                const vertexShaderSource = \`attribute vec2 a_position;
void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
}\`;
                
                // EXACT FRAGMENT SHADER FROM FACETED SYSTEM
                const fragmentShaderSource = \`precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_geometry;
uniform float u_gridDensity;
uniform float u_morphFactor;
uniform float u_chaos;
uniform float u_speed;
uniform float u_hue;
uniform float u_intensity;
uniform float u_saturation;
uniform float u_dimension;
uniform float u_rot4dXW;
uniform float u_rot4dYW;
uniform float u_rot4dZW;
uniform float u_mouseIntensity;
uniform float u_clickIntensity;
uniform float u_roleIntensity;
// 4D rotation matrices
mat4 rotateXW(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat4(c, 0.0, 0.0, -s, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, s, 0.0, 0.0, c);
}
mat4 rotateYW(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat4(1.0, 0.0, 0.0, 0.0, 0.0, c, 0.0, -s, 0.0, 0.0, 1.0, 0.0, 0.0, s, 0.0, c);
}
mat4 rotateZW(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat4(1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, c, -s, 0.0, 0.0, s, c);
}
vec3 project4Dto3D(vec4 p) {
    float w = 2.5 / (2.5 + p.w);
    return vec3(p.x * w, p.y * w, p.z * w);
}
// Simplified geometry functions for WebGL 1.0 compatibility
float geometryFunction(vec4 p) {
    int geomType = int(u_geometry);
    
    if (geomType == 0) {
        // Tetrahedron lattice - UNIFORM GRID DENSITY
        vec4 pos = fract(p * u_gridDensity * 0.08);
        vec4 dist = min(pos, 1.0 - pos);
        return min(min(dist.x, dist.y), min(dist.z, dist.w)) * u_morphFactor;
    }
    else if (geomType == 1) {
        // Hypercube lattice - UNIFORM GRID DENSITY
        vec4 pos = fract(p * u_gridDensity * 0.08);
        vec4 dist = min(pos, 1.0 - pos);
        float minDist = min(min(dist.x, dist.y), min(dist.z, dist.w));
        return minDist * u_morphFactor;
    }
    else if (geomType == 2) {
        // Sphere lattice - UNIFORM GRID DENSITY
        float r = length(p);
        float density = u_gridDensity * 0.08;
        float spheres = abs(fract(r * density) - 0.5) * 2.0;
        float theta = atan(p.y, p.x);
        float harmonics = sin(theta * 3.0) * 0.2;
        return (spheres + harmonics) * u_morphFactor;
    }
    else if (geomType == 3) {
        // Torus lattice - UNIFORM GRID DENSITY
        float r1 = length(p.xy) - 2.0;
        float torus = length(vec2(r1, p.z)) - 0.8;
        float lattice = sin(p.x * u_gridDensity * 0.08) * sin(p.y * u_gridDensity * 0.08);
        return (torus + lattice * 0.3) * u_morphFactor;
    }
    else if (geomType == 4) {
        // Klein bottle lattice - UNIFORM GRID DENSITY
        float u = atan(p.y, p.x);
        float v = atan(p.w, p.z);
        float dist = length(p) - 2.0;
        float lattice = sin(u * u_gridDensity * 0.08) * sin(v * u_gridDensity * 0.08);
        return (dist + lattice * 0.4) * u_morphFactor;
    }
    else if (geomType == 5) {
        // Fractal lattice - NOW WITH UNIFORM GRID DENSITY
        vec4 pos = fract(p * u_gridDensity * 0.08);
        pos = abs(pos * 2.0 - 1.0);
        float dist = length(max(abs(pos) - 1.0, 0.0));
        return dist * u_morphFactor;
    }
    else if (geomType == 6) {
        // Wave lattice - UNIFORM GRID DENSITY
        float freq = u_gridDensity * 0.08;
        float time = u_time * 0.001 * u_speed;
        float wave1 = sin(p.x * freq + time);
        float wave2 = sin(p.y * freq + time * 1.3);
        float wave3 = sin(p.z * freq * 0.8 + time * 0.7); // Add Z-dimension waves
        float interference = wave1 * wave2 * wave3;
        return interference * u_morphFactor;
    }
    else if (geomType == 7) {
        // Crystal lattice - UNIFORM GRID DENSITY
        vec4 pos = fract(p * u_gridDensity * 0.08) - 0.5;
        float cube = max(max(abs(pos.x), abs(pos.y)), max(abs(pos.z), abs(pos.w)));
        return cube * u_morphFactor;
    }
    else {
        // Default hypercube - UNIFORM GRID DENSITY
        vec4 pos = fract(p * u_gridDensity * 0.08);
        vec4 dist = min(pos, 1.0 - pos);
        return min(min(dist.x, dist.y), min(dist.z, dist.w)) * u_morphFactor;
    }
}
void main() {
    vec2 uv = (gl_FragCoord.xy - u_resolution.xy * 0.5) / min(u_resolution.x, u_resolution.y);
    
    // 4D position with mouse interaction - NOW USING SPEED PARAMETER
    float timeSpeed = u_time * 0.0001 * u_speed;
    vec4 pos = vec4(uv * 3.0, sin(timeSpeed * 3.0), cos(timeSpeed * 2.0));
    pos.xy += (u_mouse - 0.5) * u_mouseIntensity * 2.0;
    
    // Apply 4D rotations
    pos = rotateXW(u_rot4dXW) * pos;
    pos = rotateYW(u_rot4dYW) * pos;
    pos = rotateZW(u_rot4dZW) * pos;
    
    // Calculate geometry value
    float value = geometryFunction(pos);
    
    // Apply chaos
    float noise = sin(pos.x * 7.0) * cos(pos.y * 11.0) * sin(pos.z * 13.0);
    value += noise * u_chaos;
    
    // Color based on geometry value and hue with user-controlled intensity/saturation
    float geometryIntensity = 1.0 - clamp(abs(value), 0.0, 1.0);
    geometryIntensity += u_clickIntensity * 0.3;
    
    // Apply user intensity control
    float finalIntensity = geometryIntensity * u_intensity;
    
    float hue = u_hue / 360.0 + value * 0.1;
    
    // Create color with saturation control
    vec3 baseColor = vec3(
        sin(hue * 6.28318 + 0.0) * 0.5 + 0.5,
        sin(hue * 6.28318 + 2.0943) * 0.5 + 0.5,
        sin(hue * 6.28318 + 4.1887) * 0.5 + 0.5
    );
    
    // Apply saturation (mix with grayscale)
    float gray = (baseColor.r + baseColor.g + baseColor.b) / 3.0;
    vec3 color = mix(vec3(gray), baseColor, u_saturation) * finalIntensity;
    
    gl_FragColor = vec4(color, finalIntensity * u_roleIntensity);
}\`;
                
                this.program = this.createProgram(vertexShaderSource, fragmentShaderSource);
                this.uniforms = {
                    resolution: this.gl.getUniformLocation(this.program, 'u_resolution'),
                    time: this.gl.getUniformLocation(this.program, 'u_time'),
                    mouse: this.gl.getUniformLocation(this.program, 'u_mouse'),
                    geometry: this.gl.getUniformLocation(this.program, 'u_geometry'),
                    gridDensity: this.gl.getUniformLocation(this.program, 'u_gridDensity'),
                    morphFactor: this.gl.getUniformLocation(this.program, 'u_morphFactor'),
                    chaos: this.gl.getUniformLocation(this.program, 'u_chaos'),
                    speed: this.gl.getUniformLocation(this.program, 'u_speed'),
                    hue: this.gl.getUniformLocation(this.program, 'u_hue'),
                    intensity: this.gl.getUniformLocation(this.program, 'u_intensity'),
                    saturation: this.gl.getUniformLocation(this.program, 'u_saturation'),
                    dimension: this.gl.getUniformLocation(this.program, 'u_dimension'),
                    rot4dXW: this.gl.getUniformLocation(this.program, 'u_rot4dXW'),
                    rot4dYW: this.gl.getUniformLocation(this.program, 'u_rot4dYW'),
                    rot4dZW: this.gl.getUniformLocation(this.program, 'u_rot4dZW'),
                    mouseIntensity: this.gl.getUniformLocation(this.program, 'u_mouseIntensity'),
                    clickIntensity: this.gl.getUniformLocation(this.program, 'u_clickIntensity'),
                    roleIntensity: this.gl.getUniformLocation(this.program, 'u_roleIntensity')
                };
            }
            
            createProgram(vertexSource, fragmentSource) {
                const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexSource);
                const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentSource);
                
                const program = this.gl.createProgram();
                this.gl.attachShader(program, vertexShader);
                this.gl.attachShader(program, fragmentShader);
                this.gl.linkProgram(program);
                
                if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
                    console.error('Program linking failed:', this.gl.getProgramInfoLog(program));
                    return null;
                }
                
                return program;
            }
            
            createShader(type, source) {
                const shader = this.gl.createShader(type);
                this.gl.shaderSource(shader, source);
                this.gl.compileShader(shader);
                
                if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
                    console.error('Shader compilation failed:', this.gl.getShaderInfoLog(shader));
                    return null;
                }
                
                return shader;
            }
            
            initBuffers() {
                const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
                
                this.buffer = this.gl.createBuffer();
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
                this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
                
                const positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
                this.gl.enableVertexAttribArray(positionLocation);
                this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
            }
            
            animate() {
                this.render();
                requestAnimationFrame(() => this.animate());
            }
            
            render() {
                if (!this.program) return;
                
                this.resize();
                this.gl.useProgram(this.program);
                
                const time = Date.now() - this.startTime;
                
                this.gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
                this.gl.uniform1f(this.uniforms.time, time);
                this.gl.uniform2f(this.uniforms.mouse, 0.5, 0.5);
                this.gl.uniform1f(this.uniforms.geometry, this.params.geometry || 0);
                this.gl.uniform1f(this.uniforms.gridDensity, this.params.gridDensity || 15);
                this.gl.uniform1f(this.uniforms.morphFactor, this.params.morphFactor || 1.0);
                this.gl.uniform1f(this.uniforms.chaos, this.params.chaos || 0.2);
                this.gl.uniform1f(this.uniforms.speed, this.params.speed || 1.0);
                this.gl.uniform1f(this.uniforms.hue, this.params.hue || 200);
                this.gl.uniform1f(this.uniforms.intensity, this.params.intensity || 0.5);
                this.gl.uniform1f(this.uniforms.saturation, this.params.saturation || 0.8);
                this.gl.uniform1f(this.uniforms.dimension, this.params.dimension || 3.8);
                this.gl.uniform1f(this.uniforms.rot4dXW, this.params.rot4dXW || 0.0);
                this.gl.uniform1f(this.uniforms.rot4dYW, this.params.rot4dYW || 0.0);
                this.gl.uniform1f(this.uniforms.rot4dZW, this.params.rot4dZW || 0.0);
                this.gl.uniform1f(this.uniforms.mouseIntensity, 0.0);
                this.gl.uniform1f(this.uniforms.clickIntensity, 0.0);
                this.gl.uniform1f(this.uniforms.roleIntensity, 1.0);
                
                this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
            }
        }`;
    }
    
    /**
     * Generate WebGL code for Holographic system with EXACT shader from HolographicVisualizer.js
     */
    generateHolographicVisualizationCode(state) {
        return `
        // VIB34D Holographic System Trading Card - ${state.name}
        // EXACT SHADER CODE FROM src/holograms/HolographicVisualizer.js
        class TradingCardVisualizer {
            constructor(canvas) {
                this.canvas = canvas;
                this.gl = canvas.getContext('webgl');
                this.params = ${JSON.stringify(state.parameters)};
                this.startTime = Date.now();
                
                if (!this.gl) {
                    console.error('WebGL not supported');
                    return;
                }
                
                this.initHolographicShaders();
                this.initBuffers();
                this.resize();
                this.animate();
            }
            
            initHolographicShaders() {
                const vertexShaderSource = \`
            attribute vec2 a_position;
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        \`;
                
                // EXACT FRAGMENT SHADER FROM HOLOGRAPHIC SYSTEM
                const fragmentShaderSource = \`
            precision highp float;
            
            uniform vec2 u_resolution;
            uniform float u_time;
            uniform vec2 u_mouse;
            uniform float u_geometry;
            uniform float u_density;
            uniform float u_speed;
            uniform vec3 u_color;
            uniform float u_intensity;
            uniform float u_roleDensity;
            uniform float u_roleSpeed;
            uniform float u_colorShift;
            uniform float u_chaosIntensity;
            uniform float u_mouseIntensity;
            uniform float u_clickIntensity;
            uniform float u_densityVariation;
            uniform float u_geometryType;
            uniform float u_chaos;
            uniform float u_morph;
            uniform float u_touchMorph;
            uniform float u_touchChaos;
            uniform float u_scrollParallax;
            uniform float u_gridDensityShift;
            uniform float u_colorScrollShift;
            uniform float u_audioDensityBoost;
            uniform float u_audioMorphBoost;
            uniform float u_audioSpeedBoost;
            uniform float u_audioChaosBoost;
            uniform float u_audioColorShift;
            uniform float u_rot4dXW;
            uniform float u_rot4dYW;
            uniform float u_rot4dZW;
            
            // 4D rotation matrices
            mat4 rotateXW(float theta) {
                float c = cos(theta);
                float s = sin(theta);
                return mat4(c, 0, 0, -s, 0, 1, 0, 0, 0, 0, 1, 0, s, 0, 0, c);
            }
            
            mat4 rotateYW(float theta) {
                float c = cos(theta);
                float s = sin(theta);
                return mat4(1, 0, 0, 0, 0, c, 0, -s, 0, 0, 1, 0, 0, s, 0, c);
            }
            
            mat4 rotateZW(float theta) {
                float c = cos(theta);
                float s = sin(theta);
                return mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, c, -s, 0, 0, s, c);
            }
            
            // 4D to 3D projection
            vec3 project4Dto3D(vec4 p) {
                float w = 2.5 / (2.5 + p.w);
                return vec3(p.x * w, p.y * w, p.z * w);
            }
            
            // VIB3 Geometry Library
            float tetrahedronLattice(vec3 p, float gridSize) {
                vec3 q = fract(p * gridSize) - 0.5;
                float d1 = length(q);
                float d2 = length(q - vec3(0.4, 0.0, 0.0));
                float d3 = length(q - vec3(0.0, 0.4, 0.0));
                float d4 = length(q - vec3(0.0, 0.0, 0.4));
                float vertices = 1.0 - smoothstep(0.0, 0.04, min(min(d1, d2), min(d3, d4)));
                float edges = 0.0;
                edges = max(edges, 1.0 - smoothstep(0.0, 0.02, abs(length(q.xy) - 0.2)));
                edges = max(edges, 1.0 - smoothstep(0.0, 0.02, abs(length(q.yz) - 0.2)));
                edges = max(edges, 1.0 - smoothstep(0.0, 0.02, abs(length(q.xz) - 0.2)));
                return max(vertices, edges * 0.5);
            }
            
            float hypercubeLattice(vec3 p, float gridSize) {
                vec3 grid = fract(p * gridSize);
                vec3 edges = 1.0 - smoothstep(0.0, 0.03, abs(grid - 0.5));
                return max(max(edges.x, edges.y), edges.z);
            }
            
            float sphereLattice(vec3 p, float gridSize) {
                vec3 q = fract(p * gridSize) - 0.5;
                float r = length(q);
                return 1.0 - smoothstep(0.2, 0.5, r);
            }
            
            float torusLattice(vec3 p, float gridSize) {
                vec3 q = fract(p * gridSize) - 0.5;
                float r1 = sqrt(q.x*q.x + q.y*q.y);
                float r2 = sqrt((r1 - 0.3)*(r1 - 0.3) + q.z*q.z);
                return 1.0 - smoothstep(0.0, 0.1, r2);
            }
            
            float kleinLattice(vec3 p, float gridSize) {
                vec3 q = fract(p * gridSize);
                float u = q.x * 2.0 * 3.14159;
                float v = q.y * 2.0 * 3.14159;
                float x = cos(u) * (3.0 + cos(u/2.0) * sin(v) - sin(u/2.0) * sin(2.0*v));
                float klein = length(vec2(x, q.z)) - 0.1;
                return 1.0 - smoothstep(0.0, 0.05, abs(klein));
            }
            
            float fractalLattice(vec3 p, float gridSize) {
                vec3 q = p * gridSize;
                float scale = 1.0;
                float fractal = 0.0;
                for(int i = 0; i < 4; i++) {
                  q = fract(q) - 0.5;
                  fractal += abs(length(q)) / scale;
                  scale *= 2.0;
                  q *= 2.0;
                }
                return 1.0 - smoothstep(0.0, 1.0, fractal);
            }
            
            float waveLattice(vec3 p, float gridSize) {
                vec3 q = p * gridSize;
                float wave = sin(q.x * 2.0) * sin(q.y * 2.0) * sin(q.z * 2.0 + u_time);
                return smoothstep(-0.5, 0.5, wave);
            }
            
            float crystalLattice(vec3 p, float gridSize) {
                vec3 q = fract(p * gridSize) - 0.5;
                float d = max(max(abs(q.x), abs(q.y)), abs(q.z));
                return 1.0 - smoothstep(0.3, 0.5, d);
            }
            
            float getDynamicGeometry(vec3 p, float gridSize, float geometryType) {
                int baseGeom = int(mod(geometryType, 8.0));
                float variation = floor(geometryType / 8.0) / 4.0;
                float variedGridSize = gridSize * (0.5 + variation * 1.5);
                
                if (baseGeom == 0) return tetrahedronLattice(p, variedGridSize);
                else if (baseGeom == 1) return hypercubeLattice(p, variedGridSize);
                else if (baseGeom == 2) return sphereLattice(p, variedGridSize);
                else if (baseGeom == 3) return torusLattice(p, variedGridSize);
                else if (baseGeom == 4) return kleinLattice(p, variedGridSize);
                else if (baseGeom == 5) return fractalLattice(p, variedGridSize);
                else if (baseGeom == 6) return waveLattice(p, variedGridSize);
                else return crystalLattice(p, variedGridSize);
            }
            
            vec3 hsv2rgb(vec3 c) {
                vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
                vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
                return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
            }
            
            vec3 rgbGlitch(vec3 color, vec2 uv, float intensity) {
                vec2 offset = vec2(intensity * 0.005, 0.0);
                float r = color.r + sin(uv.y * 30.0 + u_time * 0.001) * intensity * 0.06;
                float g = color.g + sin(uv.y * 28.0 + u_time * 0.0012) * intensity * 0.06;
                float b = color.b + sin(uv.y * 32.0 + u_time * 0.0008) * intensity * 0.06;
                return vec3(r, g, b);
            }
            
            float moirePattern(vec2 uv, float intensity) {
                float freq1 = 12.0 + intensity * 6.0 + u_densityVariation * 3.0;
                float freq2 = 14.0 + intensity * 8.0 + u_densityVariation * 4.0;
                float pattern1 = sin(uv.x * freq1) * sin(uv.y * freq1);
                float pattern2 = sin(uv.x * freq2) * sin(uv.y * freq2);
                return (pattern1 * pattern2) * intensity * 0.15;
            }
            
            float gridOverlay(vec2 uv, float intensity) {
                vec2 grid = fract(uv * (8.0 + u_densityVariation * 4.0));
                float lines = 0.0;
                lines = max(lines, 1.0 - smoothstep(0.0, 0.02, abs(grid.x - 0.5)));
                lines = max(lines, 1.0 - smoothstep(0.0, 0.02, abs(grid.y - 0.5)));
                return lines * intensity * 0.1;
            }
            
            void main() {
                vec2 uv = gl_FragCoord.xy / u_resolution.xy;
                float aspectRatio = u_resolution.x / u_resolution.y;
                uv.x *= aspectRatio;
                uv -= 0.5;
                
                float time = u_time * 0.0004 * u_speed * u_roleSpeed;
                
                float mouseInfluence = u_mouseIntensity * 0.5;
                vec2 mouseOffset = (u_mouse - 0.5) * mouseInfluence;
                
                float parallaxOffset = u_scrollParallax * 0.2;
                vec2 scrollOffset = vec2(parallaxOffset * 0.1, parallaxOffset * 0.05);
                
                float morphOffset = u_touchMorph * 0.3;
                
                vec4 p4d = vec4(uv + mouseOffset * 0.1 + scrollOffset, 
                               sin(time * 0.1 + morphOffset) * 0.15, 
                               cos(time * 0.08 + morphOffset * 0.5) * 0.15);
                
                float scrollRotation = u_scrollParallax * 0.1;
                float touchRotation = u_touchMorph * 0.2;
                
                // Combine manual rotation with automatic/interactive rotation
                p4d = rotateXW(u_rot4dXW + time * 0.2 + mouseOffset.y * 0.5 + scrollRotation) * p4d;
                p4d = rotateYW(u_rot4dYW + time * 0.15 + mouseOffset.x * 0.5 + touchRotation) * p4d;
                p4d = rotateZW(u_rot4dZW + time * 0.25 + u_clickIntensity * 0.3 + u_touchChaos * 0.4) * p4d;
                
                vec3 p = project4Dto3D(p4d);
                
                float scrollDensityMod = 1.0 + u_gridDensityShift * 0.3;
                float audioDensityMod = 1.0 + u_audioDensityBoost * 0.5;
                float roleDensity = ((u_density + u_densityVariation) * u_roleDensity) * scrollDensityMod * audioDensityMod;
                
                float morphedGeometry = u_geometryType + u_morph * 3.0 + u_touchMorph * 2.0 + u_audioMorphBoost * 1.5;
                float lattice = getDynamicGeometry(p, roleDensity, morphedGeometry);
                
                // Use the passed RGB as base color and modulate with lattice patterns
                vec3 baseColor = u_color;
                float latticeIntensity = lattice * u_intensity;
                
                vec3 color = baseColor * (0.3 + latticeIntensity * 0.7);
                
                // Add lattice-based brightness variations
                color += vec3(lattice * 0.4) * baseColor;
                
                float enhancedChaos = u_chaos + u_chaosIntensity + u_touchChaos * 0.3 + u_audioChaosBoost * 0.4;
                color += vec3(moirePattern(uv + scrollOffset, enhancedChaos));
                color += vec3(gridOverlay(uv, u_mouseIntensity + u_scrollParallax * 0.1));
                color = rgbGlitch(color, uv, enhancedChaos);
                
                // Apply morph distortion to position
                vec2 morphDistortion = vec2(sin(uv.y * 10.0 + u_time * 0.001) * u_morph * 0.1, 
                                           cos(uv.x * 10.0 + u_time * 0.001) * u_morph * 0.1);
                color = mix(color, color * (1.0 + length(morphDistortion)), u_morph * 0.5);
                
                float mouseDist = length(uv - (u_mouse - 0.5) * vec2(aspectRatio, 1.0));
                float mouseGlow = exp(-mouseDist * 1.5) * u_mouseIntensity * 0.2;
                color += vec3(mouseGlow) * baseColor * 0.6;
                
                float clickPulse = u_clickIntensity * exp(-mouseDist * 2.0) * 0.3;
                color += vec3(clickPulse, clickPulse * 0.5, clickPulse * 1.5);
                
                gl_FragColor = vec4(color, 0.95);
            }
        \`;
                
                this.program = this.createProgram(vertexShaderSource, fragmentShaderSource);
                this.uniforms = {
                    resolution: this.gl.getUniformLocation(this.program, 'u_resolution'),
                    time: this.gl.getUniformLocation(this.program, 'u_time'),
                    mouse: this.gl.getUniformLocation(this.program, 'u_mouse'),
                    geometry: this.gl.getUniformLocation(this.program, 'u_geometry'),
                    density: this.gl.getUniformLocation(this.program, 'u_density'),
                    speed: this.gl.getUniformLocation(this.program, 'u_speed'),
                    color: this.gl.getUniformLocation(this.program, 'u_color'),
                    intensity: this.gl.getUniformLocation(this.program, 'u_intensity'),
                    roleDensity: this.gl.getUniformLocation(this.program, 'u_roleDensity'),
                    roleSpeed: this.gl.getUniformLocation(this.program, 'u_roleSpeed'),
                    colorShift: this.gl.getUniformLocation(this.program, 'u_colorShift'),
                    chaosIntensity: this.gl.getUniformLocation(this.program, 'u_chaosIntensity'),
                    mouseIntensity: this.gl.getUniformLocation(this.program, 'u_mouseIntensity'),
                    clickIntensity: this.gl.getUniformLocation(this.program, 'u_clickIntensity'),
                    densityVariation: this.gl.getUniformLocation(this.program, 'u_densityVariation'),
                    geometryType: this.gl.getUniformLocation(this.program, 'u_geometryType'),
                    chaos: this.gl.getUniformLocation(this.program, 'u_chaos'),
                    morph: this.gl.getUniformLocation(this.program, 'u_morph'),
                    touchMorph: this.gl.getUniformLocation(this.program, 'u_touchMorph'),
                    touchChaos: this.gl.getUniformLocation(this.program, 'u_touchChaos'),
                    scrollParallax: this.gl.getUniformLocation(this.program, 'u_scrollParallax'),
                    gridDensityShift: this.gl.getUniformLocation(this.program, 'u_gridDensityShift'),
                    colorScrollShift: this.gl.getUniformLocation(this.program, 'u_colorScrollShift'),
                    audioDensityBoost: this.gl.getUniformLocation(this.program, 'u_audioDensityBoost'),
                    audioMorphBoost: this.gl.getUniformLocation(this.program, 'u_audioMorphBoost'),
                    audioSpeedBoost: this.gl.getUniformLocation(this.program, 'u_audioSpeedBoost'),
                    audioChaosBoost: this.gl.getUniformLocation(this.program, 'u_audioChaosBoost'),
                    audioColorShift: this.gl.getUniformLocation(this.program, 'u_audioColorShift'),
                    rot4dXW: this.gl.getUniformLocation(this.program, 'u_rot4dXW'),
                    rot4dYW: this.gl.getUniformLocation(this.program, 'u_rot4dYW'),
                    rot4dZW: this.gl.getUniformLocation(this.program, 'u_rot4dZW')
                };
            }
            
            createProgram(vertexSource, fragmentSource) {
                const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexSource);
                const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentSource);
                
                const program = this.gl.createProgram();
                this.gl.attachShader(program, vertexShader);
                this.gl.attachShader(program, fragmentShader);
                this.gl.linkProgram(program);
                
                if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
                    console.error('Program linking failed:', this.gl.getProgramInfoLog(program));
                    return null;
                }
                
                return program;
            }
            
            createShader(type, source) {
                const shader = this.gl.createShader(type);
                this.gl.shaderSource(shader, source);
                this.gl.compileShader(shader);
                
                if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
                    console.error('Shader compilation failed:', this.gl.getShaderInfoLog(shader));
                    return null;
                }
                
                return shader;
            }
            
            initBuffers() {
                const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
                
                this.buffer = this.gl.createBuffer();
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
                this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
                
                const positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
                this.gl.enableVertexAttribArray(positionLocation);
                this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
            }
            
            resize() {
                this.canvas.width = this.canvas.clientWidth;
                this.canvas.height = this.canvas.clientHeight;
                this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            }
            
            animate() {
                this.render();
                requestAnimationFrame(() => this.animate());
            }
            
            render() {
                if (!this.program) return;
                
                this.resize();
                this.gl.useProgram(this.program);
                
                const time = Date.now() - this.startTime;
                const hue = (this.params.hue || 200) / 360;
                
                // Convert hue to RGB
                const hslToRgb = (h, s, l) => {
                    let r, g, b;
                    if (s === 0) {
                        r = g = b = l;
                    } else {
                        const hue2rgb = (p, q, t) => {
                            if (t < 0) t += 1;
                            if (t > 1) t -= 1;
                            if (t < 1/6) return p + (q - p) * 6 * t;
                            if (t < 1/2) return q;
                            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                            return p;
                        };
                        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                        const p = 2 * l - q;
                        r = hue2rgb(p, q, h + 1/3);
                        g = hue2rgb(p, q, h);
                        b = hue2rgb(p, q, h - 1/3);
                    }
                    return [r, g, b];
                };
                
                const rgbColor = hslToRgb(hue, this.params.saturation || 0.8, this.params.intensity || 0.5);
                
                this.gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
                this.gl.uniform1f(this.uniforms.time, time);
                this.gl.uniform2f(this.uniforms.mouse, 0.5, 0.5);
                this.gl.uniform1f(this.uniforms.geometryType, this.params.geometryType || 0);
                this.gl.uniform1f(this.uniforms.density, this.params.density || 1.0);
                this.gl.uniform1f(this.uniforms.speed, this.params.speed || 0.5);
                this.gl.uniform3fv(this.uniforms.color, new Float32Array(rgbColor));
                this.gl.uniform1f(this.uniforms.intensity, this.params.intensity || 0.5);
                this.gl.uniform1f(this.uniforms.roleDensity, 1.0);
                this.gl.uniform1f(this.uniforms.roleSpeed, 1.0);
                this.gl.uniform1f(this.uniforms.colorShift, 0.0);
                this.gl.uniform1f(this.uniforms.chaosIntensity, this.params.chaos || 0.0);
                this.gl.uniform1f(this.uniforms.mouseIntensity, 0.0);
                this.gl.uniform1f(this.uniforms.clickIntensity, 0.0);
                this.gl.uniform1f(this.uniforms.densityVariation, 0.0);
                this.gl.uniform1f(this.uniforms.chaos, this.params.chaos || 0.0);
                this.gl.uniform1f(this.uniforms.morph, this.params.morph || 0.0);
                this.gl.uniform1f(this.uniforms.touchMorph, 0.0);
                this.gl.uniform1f(this.uniforms.touchChaos, 0.0);
                this.gl.uniform1f(this.uniforms.scrollParallax, 0.0);
                this.gl.uniform1f(this.uniforms.gridDensityShift, 0.0);
                this.gl.uniform1f(this.uniforms.colorScrollShift, 0.0);
                this.gl.uniform1f(this.uniforms.audioDensityBoost, 0.0);
                this.gl.uniform1f(this.uniforms.audioMorphBoost, 0.0);
                this.gl.uniform1f(this.uniforms.audioSpeedBoost, 0.0);
                this.gl.uniform1f(this.uniforms.audioChaosBoost, 0.0);
                this.gl.uniform1f(this.uniforms.audioColorShift, 0.0);
                this.gl.uniform1f(this.uniforms.rot4dXW, this.params.rot4dXW || 0.0);
                this.gl.uniform1f(this.uniforms.rot4dYW, this.params.rot4dYW || 0.0);
                this.gl.uniform1f(this.uniforms.rot4dZW, this.params.rot4dZW || 0.0);
                
                this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
            }
        }`;
    }
    
    /**
     * Generate fallback visualization code
     */
    generateFallbackVisualizationCode(state) {
        return `
        // VIB34D Trading Card - Fallback Canvas Renderer
        class TradingCardVisualizer {
            constructor(canvas) {
                console.log('🎴 Trading card using fallback 2D renderer');
                // Simple 2D fallback if WebGL fails
                this.canvas = canvas;
                this.ctx = canvas.getContext('2d');
                this.animate();
            }
            
            animate() {
                if (this.ctx) {
                    this.ctx.fillStyle = '#000';
                    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                    this.ctx.fillStyle = '#00ffff';
                    this.ctx.font = '20px Orbitron';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText('VIB34D', this.canvas.width/2, this.canvas.height/2);
                }
                requestAnimationFrame(() => this.animate());
            }
        }`;
    }
    
    /**
     * Generate simple image display code for captured canvas
     */
    generateImageVisualization(imageData) {
        return `
        // VIB34D Trading Card - Captured Visualization
        // This card contains the exact visual state from when it was created
        console.log('🎴 Trading card using captured visualization');
        
        // The visualization is embedded as an image
        // Original state preserved perfectly
        `;
    }
}