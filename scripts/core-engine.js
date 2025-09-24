/**
 * Clear Seas Solutions - Core Engine
 * Integrated VIB34D Visualizer Engine with Professional Extensions
 * 
 * This engine provides the foundational systems for:
 * - Real-time polytopal projection rendering
 * - GPU-accelerated shader processing
 * - Micro-reactive system management
 * - Performance monitoring and optimization
 * - Agentic integration capabilities
 */

class ClearSeasCoreEngine {
  constructor() {
    this.isInitialized = false;
    this.performanceMetrics = {
      fps: 0,
      gpuUtilization: 0,
      memoryUsage: 0,
      activePolytopes: 0,
      renderTime: 0
    };
    
    this.visualizers = new Map();
    this.animationFrame = null;
    this.lastFrameTime = 0;
    this.frameCount = 0;
    
    // VIB34D Engine Integration
    this.vib34dSystems = {
      polychora: null,
      quantum: null,
      holographic: null,
      faceted: null
    };
    
    // Theme Management
    this.currentTheme = 'polychora';
    this.themeTransitions = new Map();
    
    // Performance Monitoring
    this.performanceMonitor = null;
    this.metricsUpdateInterval = null;
    
    this.init();
  }
  
  async init() {
    if (this.isInitialized) return;
    
    try {
      console.log('🚀 Initializing Clear Seas Core Engine...');
      
      // Initialize performance monitoring
      this.initPerformanceMonitoring();
      
      // Initialize theme system
      this.initThemeSystem();
      
      // Start main render loop
      this.startRenderLoop();
      
      // Initialize WebGL context validation
      await this.validateWebGLSupport();
      
      this.isInitialized = true;
      console.log('✅ Clear Seas Core Engine initialized successfully');
      
      // Dispatch initialization complete event
      window.dispatchEvent(new CustomEvent('clear-seas:engine-ready', {
        detail: { engine: this }
      }));
      
    } catch (error) {
      console.error('❌ Failed to initialize Clear Seas Core Engine:', error);
      throw error;
    }
  }
  
  /**
   * Performance Monitoring System
   */
  initPerformanceMonitoring() {
    this.performanceMonitor = {
      fpsHistory: [],
      gpuHistory: [],
      memoryHistory: [],
      maxHistoryLength: 60
    };
    
    // Update metrics every second
    this.metricsUpdateInterval = setInterval(() => {
      this.updatePerformanceMetrics();
    }, 1000);
    
    // Monitor WebGL context loss
    window.addEventListener('webglcontextlost', (event) => {
      console.warn('⚠️ WebGL context lost:', event);
      event.preventDefault();
      this.handleContextLoss();
    });
    
    window.addEventListener('webglcontextrestored', (event) => {
      console.log('🔄 WebGL context restored:', event);
      this.handleContextRestore();
    });
  }
  
  updatePerformanceMetrics() {
    const now = performance.now();
    
    // Calculate FPS
    if (this.lastFrameTime > 0) {
      const deltaTime = now - this.lastFrameTime;
      const currentFPS = 1000 / deltaTime;
      this.performanceMetrics.fps = Math.round(currentFPS * 10) / 10;
      
      // Update FPS history
      this.performanceMonitor.fpsHistory.push(currentFPS);
      if (this.performanceMonitor.fpsHistory.length > this.performanceMonitor.maxHistoryLength) {
        this.performanceMonitor.fpsHistory.shift();
      }
    }
    
    // Estimate GPU utilization (approximation based on render complexity)
    this.performanceMetrics.gpuUtilization = Math.min(
      Math.round((this.visualizers.size * 15 + (60 - this.performanceMetrics.fps)) * 1.2),
      100
    );
    
    // Memory usage approximation
    if (performance.memory) {
      this.performanceMetrics.memoryUsage = Math.round(
        (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100
      );
    }
    
    // Active polytopes count
    this.performanceMetrics.activePolytopes = this.visualizers.size;
    
    // Update UI elements
    this.updateMetricsDisplay();
    
    // Dispatch performance update event
    window.dispatchEvent(new CustomEvent('clear-seas:metrics-update', {
      detail: { metrics: this.performanceMetrics }
    }));
  }
  
  updateMetricsDisplay() {
    // Update hero metrics
    const fpsCounter = document.getElementById('fps-counter');
    const gpuUtil = document.getElementById('gpu-util');
    const polytopeCount = document.getElementById('polytope-count');
    
    if (fpsCounter) fpsCounter.textContent = `${this.performanceMetrics.fps} fps`;
    if (gpuUtil) gpuUtil.textContent = `${this.performanceMetrics.gpuUtilization}%`;
    if (polytopeCount) polytopeCount.textContent = this.performanceMetrics.activePolytopes;
    
    // Update performance monitor
    const monitorFps = document.getElementById('monitor-fps');
    const monitorGpu = document.getElementById('monitor-gpu');
    const monitorMemory = document.getElementById('monitor-memory');
    
    if (monitorFps) monitorFps.textContent = `${this.performanceMetrics.fps}`;
    if (monitorGpu) monitorGpu.textContent = `${this.performanceMetrics.gpuUtilization}%`;
    if (monitorMemory) monitorMemory.textContent = `${this.performanceMetrics.memoryUsage}%`;
    
    // Update contact section GPU status
    const gpuStatus = document.getElementById('gpu-status');
    if (gpuStatus) gpuStatus.textContent = `${this.performanceMetrics.fps} FPS`;
  }
  
  /**
   * Theme System Management
   */
  initThemeSystem() {
    this.themeColors = {
      polychora: {
        primary: '#00d4ff',
        secondary: '#ff006e',
        tertiary: '#ff3300',
        quaternary: '#33ff00'
      },
      quantum: {
        primary: '#7b2cbf',
        secondary: '#9d4edd',
        tertiary: '#c77dff',
        quaternary: '#e0aaff'
      },
      holographic: {
        primary: '#ff006e',
        secondary: '#ff5bb5',
        tertiary: '#ff8cc8',
        quaternary: '#ffb3db'
      },
      faceted: {
        primary: '#00f5ff',
        secondary: '#66ffcc',
        tertiary: '#99ffdd',
        quaternary: '#ccffee'
      },
      teal: {
        primary: '#0a9396',
        secondary: '#94d2bd',
        tertiary: '#b7e3d6',
        quaternary: '#daf0ec'
      },
      red: {
        primary: '#e63946',
        secondary: '#f4a261',
        tertiary: '#f6b092',
        quaternary: '#f9c5a4'
      }
    };
  }
  
  setTheme(themeName, smooth = true) {
    if (!this.themeColors[themeName]) {
      console.warn(`Unknown theme: ${themeName}`);
      return;
    }
    
    const colors = this.themeColors[themeName];
    const root = document.documentElement;
    
    if (smooth) {
      // Smooth color transition
      root.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
      setTimeout(() => {
        root.style.transition = '';
      }, 600);
    }
    
    // Update CSS custom properties
    root.style.setProperty('--theme-primary', colors.primary);
    root.style.setProperty('--theme-secondary', colors.secondary);
    root.style.setProperty('--theme-tertiary', colors.tertiary);
    root.style.setProperty('--theme-quaternary', colors.quaternary);
    
    // Update derived colors
    root.style.setProperty('--theme-primary-dark', this.darkenColor(colors.primary, 0.2));
    root.style.setProperty('--theme-primary-light', this.lightenColor(colors.primary, 0.2));
    root.style.setProperty('--theme-secondary-dark', this.darkenColor(colors.secondary, 0.2));
    root.style.setProperty('--theme-secondary-light', this.lightenColor(colors.secondary, 0.2));
    
    this.currentTheme = themeName;
    
    // Notify all visualizers of theme change
    this.visualizers.forEach(visualizer => {
      if (visualizer.setTheme) {
        visualizer.setTheme(colors);
      }
    });
    
    // Dispatch theme change event
    window.dispatchEvent(new CustomEvent('clear-seas:theme-change', {
      detail: { theme: themeName, colors }
    }));
  }
  
  darkenColor(color, amount) {
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substring(0, 2), 16) - Math.round(255 * amount));
    const g = Math.max(0, parseInt(hex.substring(2, 4), 16) - Math.round(255 * amount));
    const b = Math.max(0, parseInt(hex.substring(4, 6), 16) - Math.round(255 * amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  
  lightenColor(color, amount) {
    const hex = color.replace('#', '');
    const r = Math.min(255, parseInt(hex.substring(0, 2), 16) + Math.round(255 * amount));
    const g = Math.min(255, parseInt(hex.substring(2, 4), 16) + Math.round(255 * amount));
    const b = Math.min(255, parseInt(hex.substring(4, 6), 16) + Math.round(255 * amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  
  /**
   * WebGL Support Validation
   */
  async validateWebGLSupport() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    
    if (!gl) {
      throw new Error('WebGL not supported');
    }
    
    // Check for required extensions
    const requiredExtensions = [
      'EXT_color_buffer_float',
      'WEBGL_color_buffer_float',
      'OES_texture_float'
    ];
    
    const supportedExtensions = [];
    const unsupportedExtensions = [];
    
    requiredExtensions.forEach(ext => {
      if (gl.getExtension(ext)) {
        supportedExtensions.push(ext);
      } else {
        unsupportedExtensions.push(ext);
      }
    });
    
    console.log('✅ WebGL Extensions Supported:', supportedExtensions);
    if (unsupportedExtensions.length > 0) {
      console.warn('⚠️ WebGL Extensions Not Supported:', unsupportedExtensions);
    }
    
    // Store WebGL capabilities
    this.webglCapabilities = {
      version: gl.getParameter(gl.VERSION),
      vendor: gl.getParameter(gl.VENDOR),
      renderer: gl.getParameter(gl.RENDERER),
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
      supportedExtensions,
      unsupportedExtensions
    };
    
    console.log('🔧 WebGL Capabilities:', this.webglCapabilities);
    
    canvas.remove();
  }
  
  /**
   * Main Render Loop
   */
  startRenderLoop() {
    const render = (timestamp) => {
      this.lastFrameTime = timestamp;
      this.frameCount++;
      
      // Update all active visualizers
      this.visualizers.forEach((visualizer, id) => {
        try {
          if (visualizer && visualizer.render) {
            visualizer.render(timestamp);
          }
        } catch (error) {
          console.error(`Error rendering visualizer ${id}:`, error);
          // Remove problematic visualizer
          this.removeVisualizer(id);
        }
      });
      
      // Continue render loop
      this.animationFrame = requestAnimationFrame(render);
    };
    
    this.animationFrame = requestAnimationFrame(render);
  }
  
  stopRenderLoop() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }
  
  /**
   * Visualizer Management
   */
  addVisualizer(id, visualizer) {
    this.visualizers.set(id, visualizer);
    console.log(`✅ Added visualizer: ${id}`);
  }
  
  removeVisualizer(id) {
    const visualizer = this.visualizers.get(id);
    if (visualizer) {
      if (visualizer.destroy) {
        visualizer.destroy();
      }
      this.visualizers.delete(id);
      console.log(`🗑️ Removed visualizer: ${id}`);
    }
  }
  
  getVisualizer(id) {
    return this.visualizers.get(id);
  }
  
  /**
   * Context Loss Handling
   */
  handleContextLoss() {
    console.warn('🔄 Handling WebGL context loss...');
    
    // Stop render loop temporarily
    this.stopRenderLoop();
    
    // Notify all visualizers
    this.visualizers.forEach(visualizer => {
      if (visualizer.handleContextLoss) {
        visualizer.handleContextLoss();
      }
    });
  }
  
  handleContextRestore() {
    console.log('🔄 Handling WebGL context restore...');
    
    // Restart render loop
    this.startRenderLoop();
    
    // Notify all visualizers
    this.visualizers.forEach(visualizer => {
      if (visualizer.handleContextRestore) {
        visualizer.handleContextRestore();
      }
    });
  }
  
  /**
   * Utility Methods
   */
  getPerformanceMetrics() {
    return { ...this.performanceMetrics };
  }
  
  getWebGLCapabilities() {
    return { ...this.webglCapabilities };
  }
  
  getCurrentTheme() {
    return this.currentTheme;
  }
  
  getThemeColors(themeName = this.currentTheme) {
    return this.themeColors[themeName] || this.themeColors.polychora;
  }
  
  /**
   * Cleanup
   */
  destroy() {
    console.log('🛑 Destroying Clear Seas Core Engine...');
    
    // Stop render loop
    this.stopRenderLoop();
    
    // Clear metrics interval
    if (this.metricsUpdateInterval) {
      clearInterval(this.metricsUpdateInterval);
      this.metricsUpdateInterval = null;
    }
    
    // Destroy all visualizers
    this.visualizers.forEach((visualizer, id) => {
      this.removeVisualizer(id);
    });
    
    // Reset state
    this.isInitialized = false;
    this.performanceMetrics = {
      fps: 0,
      gpuUtilization: 0,
      memoryUsage: 0,
      activePolytopes: 0,
      renderTime: 0
    };
    
    console.log('✅ Clear Seas Core Engine destroyed');
  }
}

/**
 * VIB34D Polytopal Projection Renderer
 * Enhanced version with professional optimizations
 */
class VIB34DRenderer {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.gl = null;
    this.program = null;
    this.isInitialized = false;
    
    // Configuration
    this.config = {
      system: options.system || 'polychora',
      resolution: options.resolution || 1.0,
      quality: options.quality || 'high',
      enableAntialiasing: options.enableAntialiasing !== false,
      enableBloom: options.enableBloom !== false,
      animationSpeed: options.animationSpeed || 1.0,
      ...options
    };
    
    // State
    this.time = 0;
    this.uniforms = {};
    this.buffers = {};
    this.textures = {};
    
    // Parameters (VIB34D compatible)
    this.parameters = {
      geometry: 0,
      rot4dXW: 0,
      rot4dYW: 0,
      rot4dZW: 0,
      gridDensity: 20,
      morphFactor: 0.5,
      chaos: 0.1,
      speed: 1.0,
      hue: 0,
      intensity: 0.8,
      saturation: 0.9
    };
    
    this.init();
  }
  
  async init() {
    try {
      // Initialize WebGL context
      this.initWebGL();
      
      // Compile shaders
      await this.compileShaders();
      
      // Setup geometry
      this.setupGeometry();
      
      // Setup uniforms
      this.setupUniforms();
      
      // Setup resize observer
      this.setupResizeObserver();
      
      this.isInitialized = true;
      console.log(`✅ VIB34D Renderer initialized: ${this.config.system}`);
      
    } catch (error) {
      console.error('❌ Failed to initialize VIB34D Renderer:', error);
      throw error;
    }
  }
  
  initWebGL() {
    this.gl = this.canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance',
      antialias: this.config.enableAntialiasing
    });
    
    if (!this.gl) {
      throw new Error('WebGL2 not supported');
    }
    
    // Configure WebGL state
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
  }
  
  async compileShaders() {
    const vertexShaderSource = this.getVertexShader();
    const fragmentShaderSource = this.getFragmentShader();
    
    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    this.program = this.createProgram(vertexShader, fragmentShader);
    this.gl.useProgram(this.program);
  }
  
  createShader(type, source) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const error = this.gl.getShaderInfoLog(shader);
      this.gl.deleteShader(shader);
      throw new Error(`Shader compilation error: ${error}`);
    }
    
    return shader;
  }
  
  createProgram(vertexShader, fragmentShader) {
    const program = this.gl.createProgram();
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);
    
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      const error = this.gl.getProgramInfoLog(program);
      this.gl.deleteProgram(program);
      throw new Error(`Program linking error: ${error}`);
    }
    
    return program;
  }
  
  getVertexShader() {
    return `#version 300 es
      precision highp float;
      
      in vec2 a_position;
      out vec2 v_uv;
      out vec2 v_position;
      
      void main() {
        v_uv = a_position * 0.5 + 0.5;
        v_position = a_position;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;
  }
  
  getFragmentShader() {
    // System-specific shader selection
    const systemShaders = {
      polychora: this.getPolychoraShader(),
      quantum: this.getQuantumShader(),
      holographic: this.getHolographicShader(),
      faceted: this.getFacetedShader()
    };
    
    return systemShaders[this.config.system] || systemShaders.polychora;
  }
  
  getPolychoraShader() {
    return `#version 300 es
      precision highp float;
      
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform float u_rot4dXW;
      uniform float u_rot4dYW;
      uniform float u_rot4dZW;
      uniform float u_gridDensity;
      uniform float u_intensity;
      uniform float u_hue;
      
      in vec2 v_uv;
      in vec2 v_position;
      out vec4 fragColor;
      
      // 4D rotation matrices
      mat4 rotateXW(float theta) {
        float c = cos(theta);
        float s = sin(theta);
        return mat4(
          c, 0, 0, -s,
          0, 1, 0, 0,
          0, 0, 1, 0,
          s, 0, 0, c
        );
      }
      
      mat4 rotateYW(float theta) {
        float c = cos(theta);
        float s = sin(theta);
        return mat4(
          1, 0, 0, 0,
          0, c, 0, -s,
          0, 0, 1, 0,
          0, s, 0, c
        );
      }
      
      mat4 rotateZW(float theta) {
        float c = cos(theta);
        float s = sin(theta);
        return mat4(
          1, 0, 0, 0,
          0, 1, 0, 0,
          0, 0, c, -s,
          0, 0, s, c
        );
      }
      
      // HSV to RGB conversion
      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }
      
      // 4D polytope distance functions
      float tesseractSDF(vec4 p) {
        vec4 d = abs(p) - vec4(1.0);
        return length(max(d, 0.0)) + min(max(max(max(d.x, d.y), d.z), d.w), 0.0);
      }
      
      float cell120SDF(vec4 p) {
        // Approximation of 120-cell polytope
        float r = length(p);
        float phi = (1.0 + sqrt(5.0)) / 2.0;
        return r - phi * 0.8 + sin(r * 8.0) * 0.1;
      }
      
      void main() {
        vec2 uv = (v_position * 2.0 - 1.0) * vec2(u_resolution.x / u_resolution.y, 1.0);
        
        // Create 4D point
        vec4 p4d = vec4(uv * 2.0, sin(u_time * 0.5), cos(u_time * 0.3));
        
        // Apply 4D rotations
        p4d = rotateXW(u_rot4dXW + u_time * 0.1) * p4d;
        p4d = rotateYW(u_rot4dYW + u_time * 0.13) * p4d;
        p4d = rotateZW(u_rot4dZW + u_time * 0.17) * p4d;
        
        // Project to 3D (perspective projection)
        vec3 p3d = p4d.xyz / (2.0 - p4d.w);
        
        // Calculate distance to polytope
        float d1 = tesseractSDF(p4d * u_gridDensity * 0.1);
        float d2 = cell120SDF(p4d * u_gridDensity * 0.05 + vec4(sin(u_time), cos(u_time), sin(u_time * 1.3), cos(u_time * 1.7)));
        
        float d = min(d1, d2);
        
        // Color based on distance and hue
        vec3 color1 = hsv2rgb(vec3(u_hue / 360.0, 0.8, u_intensity));
        vec3 color2 = hsv2rgb(vec3(u_hue / 360.0 + 0.3, 0.9, u_intensity * 0.7));
        
        float intensity = 1.0 / (1.0 + d * d * 10.0);
        vec3 finalColor = mix(color1, color2, sin(d * 20.0 + u_time) * 0.5 + 0.5) * intensity;
        
        // Add glow effect
        float glow = exp(-d * 5.0) * u_intensity * 0.5;
        finalColor += color1 * glow;
        
        fragColor = vec4(finalColor, intensity * 0.8 + glow);
      }
    `;
  }
  
  getQuantumShader() {
    return `#version 300 es
      precision highp float;
      
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform float u_gridDensity;
      uniform float u_intensity;
      uniform float u_chaos;
      
      in vec2 v_uv;
      in vec2 v_position;
      out vec4 fragColor;
      
      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }
      
      float noise(vec3 p) {
        return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
      }
      
      void main() {
        vec2 uv = v_position * vec2(u_resolution.x / u_resolution.y, 1.0);
        
        vec3 p = vec3(uv * u_gridDensity * 0.1, u_time * 0.5);
        
        float n1 = noise(p);
        float n2 = noise(p * 2.0 + vec3(1.0));
        float n3 = noise(p * 4.0 + vec3(2.0));
        
        float lattice = sin(p.x * 8.0) * sin(p.y * 8.0) * sin(p.z * 8.0);
        float combined = (n1 + n2 * 0.5 + n3 * 0.25) * lattice;
        
        vec3 color = hsv2rgb(vec3(0.7 + combined * u_chaos, 0.8, u_intensity));
        float alpha = abs(combined) * u_intensity;
        
        fragColor = vec4(color, alpha);
      }
    `;
  }
  
  getHolographicShader() {
    return `#version 300 es
      precision highp float;
      
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform float u_intensity;
      uniform float u_morphFactor;
      
      in vec2 v_uv;
      in vec2 v_position;
      out vec4 fragColor;
      
      void main() {
        vec2 uv = v_position;
        float t = u_time;
        
        // Holographic interference pattern
        float wave1 = sin(length(uv - vec2(cos(t), sin(t))) * 20.0 + t * 5.0);
        float wave2 = sin(length(uv - vec2(-cos(t * 1.3), -sin(t * 1.7))) * 15.0 + t * 3.0);
        float interference = wave1 * wave2 * u_morphFactor;
        
        vec3 color = vec3(1.0, 0.2, 0.8) * (interference * 0.5 + 0.5) * u_intensity;
        
        fragColor = vec4(color, abs(interference) * u_intensity);
      }
    `;
  }
  
  getFacetedShader() {
    return `#version 300 es
      precision highp float;
      
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform float u_gridDensity;
      uniform float u_intensity;
      
      in vec2 v_uv;
      in vec2 v_position;
      out vec4 fragColor;
      
      void main() {
        vec2 uv = v_position * u_gridDensity * 0.1;
        
        vec2 grid = fract(uv) - 0.5;
        float d = length(grid);
        
        vec3 color = vec3(0.0, 0.8, 1.0);
        float alpha = step(d, 0.3) * u_intensity;
        
        fragColor = vec4(color, alpha);
      }
    `;
  }
  
  setupGeometry() {
    // Create fullscreen quad
    const vertices = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1
    ]);
    
    this.buffers.vertex = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.vertex);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
    
    const positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
    this.gl.enableVertexAttribArray(positionLocation);
    this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
  }
  
  setupUniforms() {
    this.uniforms = {
      u_time: this.gl.getUniformLocation(this.program, 'u_time'),
      u_resolution: this.gl.getUniformLocation(this.program, 'u_resolution'),
      u_rot4dXW: this.gl.getUniformLocation(this.program, 'u_rot4dXW'),
      u_rot4dYW: this.gl.getUniformLocation(this.program, 'u_rot4dYW'),
      u_rot4dZW: this.gl.getUniformLocation(this.program, 'u_rot4dZW'),
      u_gridDensity: this.gl.getUniformLocation(this.program, 'u_gridDensity'),
      u_morphFactor: this.gl.getUniformLocation(this.program, 'u_morphFactor'),
      u_chaos: this.gl.getUniformLocation(this.program, 'u_chaos'),
      u_intensity: this.gl.getUniformLocation(this.program, 'u_intensity'),
      u_hue: this.gl.getUniformLocation(this.program, 'u_hue')
    };
  }
  
  setupResizeObserver() {
    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        this.resize(width * this.config.resolution, height * this.config.resolution);
      }
    });
    
    this.resizeObserver.observe(this.canvas);
  }
  
  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.gl.viewport(0, 0, width, height);
  }
  
  render(timestamp) {
    if (!this.isInitialized) return;
    
    this.time = timestamp * 0.001;
    
    // Update 4D rotations
    this.parameters.rot4dXW = this.time * this.parameters.speed * 0.1;
    this.parameters.rot4dYW = this.time * this.parameters.speed * 0.13;
    this.parameters.rot4dZW = this.time * this.parameters.speed * 0.17;
    
    // Clear canvas
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    
    // Update uniforms
    this.gl.uniform1f(this.uniforms.u_time, this.time);
    this.gl.uniform2f(this.uniforms.u_resolution, this.canvas.width, this.canvas.height);
    this.gl.uniform1f(this.uniforms.u_rot4dXW, this.parameters.rot4dXW);
    this.gl.uniform1f(this.uniforms.u_rot4dYW, this.parameters.rot4dYW);
    this.gl.uniform1f(this.uniforms.u_rot4dZW, this.parameters.rot4dZW);
    this.gl.uniform1f(this.uniforms.u_gridDensity, this.parameters.gridDensity);
    this.gl.uniform1f(this.uniforms.u_morphFactor, this.parameters.morphFactor);
    this.gl.uniform1f(this.uniforms.u_chaos, this.parameters.chaos);
    this.gl.uniform1f(this.uniforms.u_intensity, this.parameters.intensity);
    this.gl.uniform1f(this.uniforms.u_hue, this.parameters.hue);
    
    // Draw
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
  }
  
  setParameters(params) {
    Object.assign(this.parameters, params);
  }
  
  setTheme(colors) {
    // Convert primary color to HSV hue
    const hex = colors.primary.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    let hue = 0;
    if (diff !== 0) {
      switch (max) {
        case r: hue = ((g - b) / diff + (g < b ? 6 : 0)) / 6; break;
        case g: hue = ((b - r) / diff + 2) / 6; break;
        case b: hue = ((r - g) / diff + 4) / 6; break;
      }
    }
    
    this.parameters.hue = hue * 360;
  }
  
  handleContextLoss() {
    this.isInitialized = false;
  }
  
  async handleContextRestore() {
    await this.init();
  }
  
  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    
    if (this.gl && this.program) {
      this.gl.deleteProgram(this.program);
    }
    
    Object.values(this.buffers).forEach(buffer => {
      if (buffer && this.gl) {
        this.gl.deleteBuffer(buffer);
      }
    });
    
    this.isInitialized = false;
  }
}

// Export for global access
window.ClearSeasCoreEngine = ClearSeasCoreEngine;
window.VIB34DRenderer = VIB34DRenderer;