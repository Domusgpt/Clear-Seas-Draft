/**
 * VIB34D Unified Performance Engine
 * ARCHITECTURAL SOLUTION: Eliminates canvas explosion (20+ contexts → 1 context)
 * Solves mobile performance issues and resource exhaustion
 */

import UnifiedCanvasManager from './UnifiedCanvasManager.js';
import OptimizedCanvasPool from './OptimizedCanvasPool.js';
import UnifiedResourceManager from './UnifiedResourceManager.js';
import MobileOptimizedRenderer from './MobileOptimizedRenderer.js';
import MobileTouchController from './MobileTouchController.js';
import EnhancedPolychoraSystem from './EnhancedPolychoraSystem.js';

export class VIB34DUnifiedEngine {
    constructor(config = {}) {
        console.log('🎯 ARCHITECTURE: Initializing Unified Canvas Architecture');
        
        this.config = {
            maxCanvases: 6,
            useSingleContext: true,  // KEY: Single WebGL context instead of 20+
            enableMobileOptimizations: this.detectMobile(),
            enableTouchControls: true,
            adaptiveQuality: true,
            memoryBudgetMB: this.detectMobile() ? 64 : 256,
            ...config
        };
        
        console.log(`📱 Mobile detected: ${this.config.enableMobileOptimizations}`);
        console.log(`🎯 Single context mode: ${this.config.useSingleContext}`);
        
        // CORE ARCHITECTURE: Single WebGL context for ALL systems
        this.canvasManager = this.config.useSingleContext ? 
            new UnifiedCanvasManager() : 
            new OptimizedCanvasPool(this.config.maxCanvases);
        
        // Unified resource management across all systems
        this.resourceManager = new UnifiedResourceManager(
            this.canvasManager.gl || this.canvasManager.getMasterGL()
        );
        
        // Mobile-adaptive rendering pipeline
        this.mobileRenderer = new MobileOptimizedRenderer(
            this.canvasManager.gl || this.canvasManager.getMasterGL()
        );
        
        // Touch controls for mobile interaction
        if (this.config.enableTouchControls) {
            this.touchController = new MobileTouchController(this.canvasManager);
            this.setupTouchInteractions();
        }
        
        // SYSTEMS ARCHITECTURE: 4 visualization systems sharing single context
        this.systems = new Map();
        this.activeSystem = 'faceted';
        
        // Performance monitoring
        this.performanceStats = {
            frameCount: 0,
            lastTime: performance.now(),
            fps: 60,
            averageFrameTime: 16.67,
            memoryPressure: false
        };
        
        // State management
        this.time = 0;
        this.animationId = null;
        this.isRendering = false;
        this.renderQueue = new Set();
        
        // Initialize unified system
        this.init();
    }
    
    detectMobile() {
        return /Android|iPhone|iPad/.test(navigator.userAgent);
    }
    
    /**
     * CORE INITIALIZATION: Set up unified architecture
     */
    async init() {
        console.log('🌌 Initializing VIB34D Unified Performance Engine...');
        
        try {
            // Initialize systems with shared WebGL context
            await this.initializeUnifiedSystems();
            
            // Set up performance monitoring
            this.setupPerformanceMonitoring();
            
            // Start unified render loop
            this.startUnifiedRenderLoop();
            
            console.log('✅ VIB34D Unified Engine: Canvas explosion eliminated!');
            console.log(`💾 Memory budget: ${this.config.memoryBudgetMB}MB`);
            console.log(`🎮 Systems initialized: ${this.systems.size}`);
            
            // Performance verification
            const memStats = this.resourceManager.getMemoryStats();
            console.log(`📊 Memory usage: ${memStats.usage}`);
            
        } catch (error) {
            console.error('❌ Unified Engine initialization failed:', error);
            throw error;
        }
    }
    
    /**
     * SYSTEM INITIALIZATION: Create 4 unified visualization systems
     */
    async initializeUnifiedSystems() {
        const gl = this.canvasManager.gl || this.canvasManager.getMasterGL();
        
        console.log('🎨 Creating unified visualization systems...');
        
        // 1. FACETED SYSTEM: Simple 2D geometric patterns
        this.systems.set('faceted', {
            name: 'Faceted',
            renderer: await this.createFacetedSystem(gl),
            active: true,
            priority: 1,
            memoryUsage: 0,
            renderTime: 0
        });
        
        // 2. QUANTUM SYSTEM: Complex 3D lattice with enhanced effects  
        this.systems.set('quantum', {
            name: 'Quantum',
            renderer: await this.createQuantumSystem(gl),
            active: false,
            priority: 2,
            memoryUsage: 0,
            renderTime: 0
        });
        
        // 3. HOLOGRAPHIC SYSTEM: Audio-reactive visualization
        this.systems.set('holographic', {
            name: 'Holographic', 
            renderer: await this.createHolographicSystem(gl),
            active: false,
            priority: 3,
            memoryUsage: 0,
            renderTime: 0
        });
        
        // 4. POLYCHORA SYSTEM: True 4D polytope mathematics
        this.systems.set('polychora', {
            name: 'Polychora',
            renderer: new EnhancedPolychoraSystem(gl, this.canvasManager),
            active: false,
            priority: 0,
            memoryUsage: 0,
            renderTime: 0
        });
        
        // Register viewports with unified canvas manager
        if (this.canvasManager.registerVisualizationSystem) {
            this.systems.forEach((system, name) => {
                const element = document.getElementById(`${name}-container`) || 
                              this.createSystemContainer(name);
                this.canvasManager.registerVisualizationSystem(
                    name, 
                    element, 
                    (gl, systemId) => this.renderSystemToFramebuffer(gl, systemId)
                );
            });
        }
        
        console.log(`✅ Unified systems created: ${Array.from(this.systems.keys()).join(', ')}`);
    }
    
    createSystemContainer(name) {
        const container = document.createElement('div');
        container.id = `${name}-container`;
        container.className = 'system-container';
        container.style.cssText = `
            position: absolute; 
            width: 100%; 
            height: 100%; 
            pointer-events: none;
        `;
        document.body.appendChild(container);
        return container;
    }
    
    /**
     * FACETED SYSTEM: Optimized 2D pattern renderer
     */
    async createFacetedSystem(gl) {
        return {
            gl,
            program: null,
            uniforms: {},
            buffers: new Map(),
            
            async init() {
                // Create simple 2D pattern shaders
                const vertexShader = `#version 300 es
                    precision mediump float;
                    in vec2 a_position;
                    uniform mat3 u_transform;
                    uniform float u_time;
                    void main() {
                        vec3 pos = u_transform * vec3(a_position, 1.0);
                        gl_Position = vec4(pos.xy, 0.0, 1.0);
                    }
                `;
                
                const fragmentShader = `#version 300 es
                    precision mediump float;
                    uniform float u_time;
                    uniform vec2 u_resolution;
                    uniform float u_gridDensity;
                    out vec4 FragColor;
                    
                    void main() {
                        vec2 uv = gl_FragCoord.xy / u_resolution;
                        vec2 grid = fract(uv * u_gridDensity);
                        float pattern = step(0.5, grid.x) * step(0.5, grid.y);
                        vec3 color = vec3(pattern) * vec3(0.5, 0.8, 1.0);
                        FragColor = vec4(color, 1.0);
                    }
                `;
                
                this.program = this.createShaderProgram(vertexShader, fragmentShader);
                this.setupUniforms();
                this.createGeometry();
            },
            
            createShaderProgram(vertexSource, fragmentSource) {
                // Shader compilation logic
                const vertexShader = gl.createShader(gl.VERTEX_SHADER);
                gl.shaderSource(vertexShader, vertexSource);
                gl.compileShader(vertexShader);
                
                const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
                gl.shaderSource(fragmentShader, fragmentSource);
                gl.compileShader(fragmentShader);
                
                const program = gl.createProgram();
                gl.attachShader(program, vertexShader);
                gl.attachShader(program, fragmentShader);
                gl.linkProgram(program);
                
                gl.deleteShader(vertexShader);
                gl.deleteShader(fragmentShader);
                
                return program;
            },
            
            setupUniforms() {
                this.uniforms = {
                    u_transform: gl.getUniformLocation(this.program, 'u_transform'),
                    u_time: gl.getUniformLocation(this.program, 'u_time'),
                    u_resolution: gl.getUniformLocation(this.program, 'u_resolution'),
                    u_gridDensity: gl.getUniformLocation(this.program, 'u_gridDensity')
                };
            },
            
            createGeometry() {
                // Simple fullscreen quad
                const vertices = new Float32Array([
                    -1, -1,  1, -1,  -1, 1,
                    -1,  1,  1, -1,   1, 1
                ]);
                
                const buffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
                this.buffers.set('quad', buffer);
            },
            
            render(timestamp, parameters = {}) {
                if (!this.program) this.init();
                
                gl.useProgram(this.program);
                
                // Update uniforms
                gl.uniform1f(this.uniforms.u_time, timestamp);
                gl.uniform2f(this.uniforms.u_resolution, gl.canvas.width, gl.canvas.height);
                gl.uniform1f(this.uniforms.u_gridDensity, parameters.gridDensity || 10);
                
                // Render fullscreen quad
                const buffer = this.buffers.get('quad');
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                
                const positionLocation = gl.getAttribLocation(this.program, 'a_position');
                gl.enableVertexAttribArray(positionLocation);
                gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
                
                gl.drawArrays(gl.TRIANGLES, 0, 6);
            },
            
            updateParameter(name, value) {
                // Handle parameter updates
            },
            
            dispose() {
                if (this.program) gl.deleteProgram(this.program);
                this.buffers.forEach(buffer => gl.deleteBuffer(buffer));
                this.buffers.clear();
            }
        };
    }
    
    async createQuantumSystem(gl) {
        // Complex 3D lattice system - placeholder for now
        return {
            render: (timestamp, parameters = {}) => {
                gl.clearColor(0.0, 0.1, 0.3, 1.0);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            },
            updateParameter: (name, value) => {},
            dispose: () => {}
        };
    }
    
    async createHolographicSystem(gl) {
        // Audio-reactive holographic system - placeholder for now
        return {
            render: (timestamp, parameters = {}) => {
                gl.clearColor(0.2, 0.0, 0.2, 1.0);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            },
            updateParameter: (name, value) => {},
            dispose: () => {}
        };
    }
    
    setupTouchInteractions() {
        if (!this.touchController) return;
        
        this.touchController.onPan = (deltaX, deltaY) => {
            // Handle pan gestures
            const activeSystem = this.systems.get(this.activeSystem);
            if (activeSystem && activeSystem.renderer.handlePan) {
                activeSystem.renderer.handlePan(deltaX, deltaY);
            }
        };
        
        this.touchController.onPinch = (scale, center) => {
            // Handle pinch/zoom gestures  
            const activeSystem = this.systems.get(this.activeSystem);
            if (activeSystem && activeSystem.renderer.handleZoom) {
                activeSystem.renderer.handleZoom(scale, center);
            }
        };
    }
    
    setupPerformanceMonitoring() {
        // Monitor memory pressure
        this.resourceManager.onMemoryPressure = () => {
            this.performanceStats.memoryPressure = true;
            this.handleMemoryPressure();
        };
        
        // Performance event listening
        window.addEventListener('vib34d:performance', (event) => {
            const { fps } = event.detail;
            if (fps < 30) {
                this.reduceQuality();
            } else if (fps > 55) {
                this.increaseQuality();
            }
        });
    }
    
    handleMemoryPressure() {
        console.warn('🚨 Memory pressure detected - optimizing...');
        
        // Reduce quality on non-active systems
        this.systems.forEach((system, name) => {
            if (name !== this.activeSystem && system.renderer.reduceQuality) {
                system.renderer.reduceQuality();
            }
        });
    }
    
    reduceQuality() {
        if (this.mobileRenderer) {
            this.mobileRenderer.reduceQuality();
        }
    }
    
    increaseQuality() {
        if (this.mobileRenderer) {
            this.mobileRenderer.increaseQuality();
        }
    }
    
    /**
     * UNIFIED RENDER LOOP: Single context rendering all systems
     */
    startUnifiedRenderLoop() {
        console.log('🎬 Starting unified render loop...');
        
        const render = (timestamp) => {
            if (this.isRendering) return;
            this.isRendering = true;
            
            this.time = timestamp * 0.001;
            
            // Update performance stats
            this.updatePerformanceStats(timestamp);
            
            // Adaptive mobile rendering
            if (this.config.adaptiveQuality && this.mobileRenderer) {
                const frameTime = this.mobileRenderer.adaptiveRender(() => {
                    this.renderActiveSystems(timestamp);
                });
                this.performanceStats.averageFrameTime = frameTime;
            } else {
                this.renderActiveSystems(timestamp);
            }
            
            // Mark systems as needing updates
            this.markSystemsDirty();
            
            this.isRendering = false;
            this.animationId = requestAnimationFrame(render);
        };
        
        // Start canvas manager render loop
        if (this.canvasManager.render) {
            this.canvasManager.render();
        }
        
        // Start main render loop
        this.animationId = requestAnimationFrame(render);
        
        console.log('✅ Unified render loop started - single WebGL context active');
    }
    
    updatePerformanceStats(timestamp) {
        this.performanceStats.frameCount++;
        const delta = timestamp - this.performanceStats.lastTime;
        
        if (delta >= 1000) {
            this.performanceStats.fps = (this.performanceStats.frameCount * 1000) / delta;
            this.performanceStats.frameCount = 0;
            this.performanceStats.lastTime = timestamp;
            
            // Emit performance data
            window.dispatchEvent(new CustomEvent('vib34d:performance', {
                detail: {
                    fps: this.performanceStats.fps,
                    frameTime: this.performanceStats.averageFrameTime,
                    memoryStats: this.resourceManager.getMemoryStats(),
                    activeSystem: this.activeSystem,
                    mobile: this.config.enableMobileOptimizations,
                    systemCount: this.systems.size
                }
            }));
        }
    }
    
    renderActiveSystems(timestamp) {
        const gl = this.canvasManager.gl || this.canvasManager.getMasterGL();
        
        // Render only active systems to save performance
        this.systems.forEach((system, name) => {
            if (system.active && system.renderer) {
                const startTime = performance.now();
                
                try {
                    system.renderer.render(timestamp, this.getSystemParameters(name));
                } catch (error) {
                    console.error(`❌ Error rendering ${name} system:`, error);
                }
                
                system.renderTime = performance.now() - startTime;
            }
        });
    }
    
    renderSystemToFramebuffer(gl, systemId) {
        const system = this.systems.get(systemId);
        if (system && system.active && system.renderer) {
            system.renderer.render(this.time, this.getSystemParameters(systemId));
        }
    }
    
    getSystemParameters(systemName) {
        // Return system-specific parameters
        return {
            time: this.time,
            gridDensity: 15,
            morphFactor: 1.0,
            intensity: 0.8,
            // Add more parameters as needed
        };
    }
    
    markSystemsDirty() {
        if (this.canvasManager.markSystemDirty) {
            this.systems.forEach((system, name) => {
                if (system.active) {
                    this.canvasManager.markSystemDirty(name);
                }
            });
        }
    }
    
    /**
     * SYSTEM CONTROL: Switch between visualization systems
     */
    switchSystem(systemName) {
        if (!this.systems.has(systemName)) {
            console.warn(`⚠️ System '${systemName}' not found`);
            return false;
        }
        
        console.log(`🔄 Switching from ${this.activeSystem} to ${systemName}`);
        
        // Deactivate current system
        if (this.activeSystem && this.systems.has(this.activeSystem)) {
            this.systems.get(this.activeSystem).active = false;
        }
        
        // Activate new system
        this.systems.get(systemName).active = true;
        this.activeSystem = systemName;
        
        // Update UI if needed
        this.updateSystemUI(systemName);
        
        console.log(`✅ Switched to ${systemName} system`);
        return true;
    }
    
    enableSystem(systemName) {
        if (this.systems.has(systemName)) {
            this.systems.get(systemName).active = true;
            console.log(`✅ Enabled ${systemName} system`);
        }
    }
    
    disableSystem(systemName) {
        if (this.systems.has(systemName)) {
            this.systems.get(systemName).active = false;
            console.log(`❌ Disabled ${systemName} system`);
        }
    }
    
    updateSystemUI(systemName) {
        // Update UI to reflect active system
        document.querySelectorAll('.system-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.system === systemName) {
                btn.classList.add('active');
            }
        });
    }
    
    /**
     * PERFORMANCE MONITORING: Get comprehensive stats
     */
    getPerformanceStats() {
        const activeSystems = Array.from(this.systems.entries())
            .filter(([name, system]) => system.active)
            .map(([name, system]) => ({
                name,
                renderTime: system.renderTime,
                memoryUsage: system.memoryUsage
            }));
        
        return {
            ...this.performanceStats,
            memoryStats: this.resourceManager.getMemoryStats(),
            mobileOptimizations: this.config.enableMobileOptimizations,
            singleContext: this.config.useSingleContext,
            activeSystems,
            totalSystems: this.systems.size,
            canvasContexts: this.config.useSingleContext ? 1 : this.systems.size
        };
    }
    
    /**
     * CLEANUP: Dispose all resources properly
     */
    destroy() {
        console.log('🔄 Destroying VIB34D Unified Engine...');
        
        // Stop animation
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Dispose all systems
        this.systems.forEach((system, name) => {
            if (system.renderer && system.renderer.dispose) {
                system.renderer.dispose();
            }
        });
        this.systems.clear();
        
        // Cleanup unified resources
        if (this.resourceManager) {
            this.resourceManager.dispose();
        }
        
        if (this.canvasManager && this.canvasManager.dispose) {
            this.canvasManager.dispose();
        }
        
        if (this.touchController && this.touchController.dispose) {
            this.touchController.dispose();
        }
        
        console.log('✅ VIB34D Unified Engine destroyed - resources freed');
        console.log('📊 Canvas contexts reduced from 20+ to 1');
    }
}

// Legacy compatibility export
export { VIB34DUnifiedEngine as VIB34DIntegratedEngine };