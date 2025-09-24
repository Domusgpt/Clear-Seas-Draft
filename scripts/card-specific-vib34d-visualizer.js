/*
 * Card-Specific VIB34D Visualizer System
 * Ultra-advanced 4D rotation grid-based visualizers for individual cards
 * Each card gets unique geometry, tilt animations, and reactive behaviors
 * Based on deep analysis of VIB34D geometric tilt-window system
 */

class WebGLContextManager {
  static contexts = new Map();
  static contextUsage = new Map(); // Track last used time for LRU cleanup
  static maxContexts = 12; // Reduced for better performance
  
  static getContext(canvas) {
    // Check if context already exists for this canvas
    if (this.contexts.has(canvas)) {
      this.contextUsage.set(canvas, Date.now());
      return this.contexts.get(canvas);
    }
    
    // Clean up oldest contexts if we're at the limit
    if (this.contexts.size >= this.maxContexts) {
      this.cleanupOldestContexts(3); // Clean 3 oldest contexts at once
    }
    
    const gl = canvas.getContext('webgl', {
      antialias: false, // Performance optimization
      alpha: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance'
    });
    
    if (gl) {
      this.contexts.set(canvas, gl);
      this.contextUsage.set(canvas, Date.now());
      
      // Set up common WebGL state for performance
      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.CULL_FACE);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    }
    
    return gl;
  }
  
  static cleanupOldestContexts(count = 1) {
    // Sort contexts by usage time and remove oldest
    const sortedContexts = Array.from(this.contextUsage.entries())
      .sort((a, b) => a[1] - b[1])
      .slice(0, count);
    
    for (const [canvas, time] of sortedContexts) {
      this.releaseContext(canvas);
    }
    
    console.log(`🧹 Cleaned up ${count} oldest WebGL contexts`);
  }
  
  static releaseContext(canvas) {
    const gl = this.contexts.get(canvas);
    if (gl) {
      // Clean up WebGL resources properly
      const loseContext = gl.getExtension('WEBGL_lose_context');
      if (loseContext) {
        loseContext.loseContext();
      }
      this.contexts.delete(canvas);
      this.contextUsage.delete(canvas);
    }
  }
  
  static updateUsage(canvas) {
    if (this.contexts.has(canvas)) {
      this.contextUsage.set(canvas, Date.now());
    }
  }
}

class CardSpecificVIB34DVisualizer {
  constructor(canvasId, role = 'content', cardElement) {
    this.canvasId = canvasId;
    this.canvas = document.getElementById(canvasId);
    this.cardElement = cardElement;
    this.role = role;
    this.active = true;
    this.startTime = Date.now();
    
    if (!this.canvas || !this.canvas.getContext) {
      console.error(`Canvas ${canvasId} not found or WebGL not supported`);
      return;
    }
    
    this.gl = WebGLContextManager.getContext(this.canvas);
    if (!this.gl) {
      console.error(`WebGL context creation failed for ${canvasId}`);
      return;
    }
    
    // Generate unique seed for this card
    this.cardSeed = this.hashCode(canvasId) / 2147483647; // Normalize to 0-1
    
    // Role-specific parameters with randomization
    this.roleParams = this.getRoleParameters(role);
    this.instanceParams = this.generateInstanceParams();
    this.behaviorProfile = this.generateBehaviorProfile(role, this.cardSeed);
    
    // Interactive state
    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseIntensity = 0;
    this.clickIntensity = 0;
    this.reactivity = 1.0;
    
    // Animation state
    this.currentGeometry = Math.floor(Math.random() * 8);
    this.targetGeometry = this.currentGeometry;
    this.geometryTransition = 0;
    
    this.initShaders();
    this.initBuffers();
    this.resize();
    this.setupCardAnimations();
    this.startRenderLoop();
    
    console.log(`🎨 Card visualizer created: ${canvasId} (${role}) - Seed: ${this.cardSeed.toFixed(3)}`);
  }
  
  getRoleParameters(role) {
    const params = {
      'background': { 
        densityMult: 0.4, speedMult: 0.2, colorShift: 0.0, intensity: 0.2,
        mouseReactivity: 0.3, clickReactivity: 0.1 
      },
      'shadow': { 
        densityMult: 0.8, speedMult: 0.3, colorShift: 180.0, intensity: 0.4,
        mouseReactivity: 0.5, clickReactivity: 0.3 
      },
      'content': { 
        densityMult: 1.0 + Math.random() * 0.5, 
        speedMult: 0.6 + Math.random() * 0.3, 
        colorShift: Math.random() * 360, 
        intensity: 0.7 + Math.random() * 0.2,
        mouseReactivity: 1.0, clickReactivity: 0.8 
      },
      'highlight': { 
        densityMult: 1.5, speedMult: 0.8, colorShift: 60.0, intensity: 0.6,
        mouseReactivity: 1.2, clickReactivity: 1.0 
      },
      'accent': { 
        densityMult: 2.5, speedMult: 0.4, colorShift: 300.0, intensity: 0.3,
        mouseReactivity: 1.5, clickReactivity: 1.2 
      }
    };
    
    return params[role] || params['content'];
  }
  
  generateInstanceParams() {
    return {
      densityMult: 1.2 + Math.random() * 0.8,    // 1.2-2.0x
      speedMult: 0.4 + Math.random() * 0.3,      // 0.4-0.7x
      colorShift: Math.random() * 360,            // 0-360 degrees
      intensity: 0.6 + Math.random() * 0.3        // 0.6-0.9
    };
  }
  
  generateBehaviorProfile(role, seed) {
    const profiles = {
      'background': {
        geometryMorphSpeed: 0.1 + seed * 0.2,
        colorCycleRate: 0.05 + seed * 0.1,
        densityFluctuation: 0.3 + seed * 0.4,
        mouseInfluence: 0.2 + seed * 0.3
      },
      'content': {
        geometryMorphSpeed: 0.3 + seed * 0.5,
        colorCycleRate: 0.1 + seed * 0.2,
        densityFluctuation: 0.5 + seed * 0.8,
        mouseInfluence: 0.8 + seed * 0.4
      },
      'highlight': {
        geometryMorphSpeed: 0.5 + seed * 0.7,
        colorCycleRate: 0.2 + seed * 0.3,
        densityFluctuation: 0.7 + seed * 1.0,
        mouseInfluence: 1.0 + seed * 0.5
      },
      'accent': {
        geometryMorphSpeed: 0.2 + seed * 0.3,
        colorCycleRate: 0.15 + seed * 0.25,
        densityFluctuation: 0.4 + seed * 0.6,
        mouseInfluence: 1.2 + seed * 0.8
      }
    };
    
    return profiles[role] || profiles['content'];
  }
  
  initShaders() {
    const vertexShaderSource = `
      precision highp float;
      
      attribute vec2 a_position;
      varying vec2 v_uv;
      
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_uv = a_position * 0.5 + 0.5;
      }
    `;
    
    const fragmentShaderSource = `
      precision highp float;
      
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec2 u_mouse;
      uniform float u_geometry;
      uniform float u_density;
      uniform float u_speed;
      uniform vec3 u_color;
      uniform float u_intensity;
      uniform float u_instanceDensity;
      uniform float u_instanceSpeed;
      uniform float u_colorShift;
      uniform float u_cardSeed;
      uniform float u_densityVariation;
      uniform float u_rot4dXW;
      uniform float u_rot4dYW;
      uniform float u_rot4dZW;
      uniform float u_mouseIntensity;
      uniform float u_clickIntensity;
      
      varying vec2 v_uv;
      
      // 4D rotation matrices
      mat4 rotateXW(float theta) {
        float c = cos(theta), s = sin(theta);
        return mat4(c, 0.0, 0.0, -s, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, s, 0.0, 0.0, c);
      }
      
      mat4 rotateYW(float theta) {
        float c = cos(theta), s = sin(theta);
        return mat4(1.0, 0.0, 0.0, 0.0, 0.0, c, 0.0, -s, 0.0, 0.0, 1.0, 0.0, 0.0, s, 0.0, c);
      }
      
      mat4 rotateZW(float theta) {
        float c = cos(theta), s = sin(theta);
        return mat4(1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, c, -s, 0.0, 0.0, s, c);
      }
      
      // 4D to 3D projection
      vec3 project4Dto3D(vec4 p) {
        float w = 2.5 / (2.5 + p.w);
        return vec3(p.x * w, p.y * w, p.z * w);
      }
      
      // HYPERCUBE LATTICE - Primary 4D structure
      float hypercubeLattice(vec3 p, float gridSize) {
        vec3 q = fract(p * gridSize) - 0.5;
        float d = max(max(abs(q.x), abs(q.y)), abs(q.z));
        return 1.0 - smoothstep(0.4, 0.45, d);
      }
      
      // TETRAHEDRON LATTICE - Complex 3D geometric structure
      float tetrahedronLattice(vec3 p, float gridSize) {
        vec3 q = fract(p * gridSize) - 0.5;
        
        // Tetrahedron vertices
        float d1 = length(q);
        float d2 = length(q - vec3(0.4, 0.0, 0.0));
        float d3 = length(q - vec3(0.0, 0.4, 0.0));
        float d4 = length(q - vec3(0.0, 0.0, 0.4));
        
        float vertices = 1.0 - smoothstep(0.0, 0.04, min(min(d1, d2), min(d3, d4)));
        
        // Edge connections
        float edges = 0.0;
        edges = max(edges, 1.0 - smoothstep(0.0, 0.02, abs(length(q.xy) - 0.2)));
        edges = max(edges, 1.0 - smoothstep(0.0, 0.02, abs(length(q.yz) - 0.2)));
        edges = max(edges, 1.0 - smoothstep(0.0, 0.02, abs(length(q.xz) - 0.2)));
        
        return max(vertices, edges * 0.5);
      }
      
      // SPHERE LATTICE
      float sphereLattice(vec3 p, float gridSize) {
        vec3 q = fract(p * gridSize) - 0.5;
        float d = length(q);
        return 1.0 - smoothstep(0.3, 0.35, d);
      }
      
      // TORUS LATTICE  
      float torusLattice(vec3 p, float gridSize) {
        vec3 q = fract(p * gridSize) - 0.5;
        float d1 = length(q.xy) - 0.3;
        float d2 = sqrt(d1 * d1 + q.z * q.z);
        return 1.0 - smoothstep(0.05, 0.1, d2);
      }
      
      // WAVE LATTICE
      float waveLattice(vec3 p, float gridSize) {
        vec3 q = p * gridSize;
        float wave = sin(q.x * 3.0) * sin(q.y * 3.0) * sin(q.z * 3.0);
        return smoothstep(-0.5, 0.5, wave);
      }
      
      // CRYSTAL LATTICE
      float crystalLattice(vec3 p, float gridSize) {
        vec3 q = fract(p * gridSize) - 0.5;
        float d = max(max(abs(q.x) + abs(q.y), abs(q.y) + abs(q.z)), abs(q.z) + abs(q.x));
        return 1.0 - smoothstep(0.4, 0.5, d);
      }
      
      // SPIRAL LATTICE
      float spiralLattice(vec3 p, float gridSize) {
        vec3 q = p * gridSize;
        float angle = atan(q.y, q.x);
        float radius = length(q.xy);
        float spiral = sin(angle * 3.0 + radius - q.z * 2.0);
        return smoothstep(-0.3, 0.3, spiral);
      }
      
      // FRACTAL LATTICE
      float fractalLattice(vec3 p, float gridSize) {
        vec3 q = p * gridSize;
        float fractal = 0.0;
        float amplitude = 1.0;
        for (int i = 0; i < 4; i++) {
          fractal += sin(length(q) * amplitude) / amplitude;
          q *= 2.0;
          amplitude *= 2.0;
        }
        return smoothstep(-0.5, 0.5, fractal);
      }
      
      // GEOMETRY SELECTOR - Dynamic switching system
      float getGeometryValue(vec3 p, float gridSize, float geomType) {
        if (geomType < 0.5) return hypercubeLattice(p, gridSize);
        else if (geomType < 1.5) return tetrahedronLattice(p, gridSize);
        else if (geomType < 2.5) return sphereLattice(p, gridSize);
        else if (geomType < 3.5) return torusLattice(p, gridSize);
        else if (geomType < 4.5) return waveLattice(p, gridSize);
        else if (geomType < 5.5) return crystalLattice(p, gridSize);
        else if (geomType < 6.5) return spiralLattice(p, gridSize);
        else return fractalLattice(p, gridSize);
      }
      
      // HSV to RGB conversion
      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }
      
      // Moire pattern for chaos
      float moirePattern(vec2 uv, float intensity) {
        float freq1 = 12.0 + intensity * 6.0 + u_densityVariation * 3.0;
        float freq2 = 14.0 + intensity * 8.0 + u_densityVariation * 4.0;
        float pattern1 = sin(uv.x * freq1) * sin(uv.y * freq1);
        float pattern2 = sin(uv.x * freq2) * sin(uv.y * freq2);
        return (pattern1 * pattern2) * intensity * 0.15;
      }
      
      // RGB glitch effect
      vec3 rgbGlitch(vec3 color, vec2 uv, float intensity) {
        vec2 offset = vec2(intensity * 0.005, 0.0);
        float r = color.r + sin(uv.y * 30.0 + u_time * 0.001) * intensity * 0.06;
        float g = color.g + sin(uv.y * 28.0 + u_time * 0.0012) * intensity * 0.06;
        float b = color.b + sin(uv.y * 32.0 + u_time * 0.0008) * intensity * 0.06;
        return vec3(r, g, b);
      }
      
      void main() {
        vec2 uv = v_uv;
        vec2 coord = (v_uv - 0.5) * 2.0;
        coord.x *= u_resolution.x / u_resolution.y;
        
        // Apply mouse-based coordinate warping
        vec2 mouseOffset = (u_mouse - 0.5) * u_mouseIntensity * 0.3;
        coord += mouseOffset;
        
        // 4D coordinate with unique card seed offset
        vec4 p4d = vec4(coord * 3.0, u_cardSeed * 2.0, u_time * u_speed * u_instanceSpeed * 0.001);
        
        // Apply 4D rotations with mouse influence
        p4d = rotateXW(u_rot4dXW + u_mouseIntensity * (u_mouse.x - 0.5) * 2.0) * p4d;
        p4d = rotateYW(u_rot4dYW + u_mouseIntensity * (u_mouse.y - 0.5) * 2.0) * p4d;
        p4d = rotateZW(u_rot4dZW + u_clickIntensity * 3.14159) * p4d;
        
        // Project to 3D
        vec3 p = project4Dto3D(p4d);
        
        // Dynamic density with role and instance variations
        float roleDensity = (u_density + u_densityVariation) * u_instanceDensity;
        float lattice = getGeometryValue(p, roleDensity, u_geometry);
        
        // Card-specific color with HSV manipulation
        float hue = atan(u_color.r, u_color.g) + u_colorShift * 0.017453 + u_cardSeed * 6.28318;
        float saturation = 0.8 + u_mouseIntensity * 0.2;
        float brightness = u_intensity * (0.8 + lattice * 0.6);
        
        vec3 color = hsv2rgb(vec3(hue, saturation, brightness));
        
        // Add chaos effects for dramatic interactions
        float chaosIntensity = u_mouseIntensity + u_clickIntensity * 0.5;
        color += vec3(moirePattern(uv, chaosIntensity));
        color = rgbGlitch(color, uv, chaosIntensity);
        
        // Click explosion effect
        if (u_clickIntensity > 0.5) {
          float explosion = exp(-length(coord - (u_mouse - 0.5) * 2.0) * 5.0) * u_clickIntensity;
          color += vec3(explosion * 2.0);
        }
        
        gl_FragColor = vec4(color, 0.95);
      }
    `;
    
    this.program = this.createShaderProgram(vertexShaderSource, fragmentShaderSource);
    this.gl.useProgram(this.program);
    
    // Get uniform locations
    this.uniforms = {
      resolution: this.gl.getUniformLocation(this.program, 'u_resolution'),
      time: this.gl.getUniformLocation(this.program, 'u_time'),
      mouse: this.gl.getUniformLocation(this.program, 'u_mouse'),
      geometry: this.gl.getUniformLocation(this.program, 'u_geometry'),
      density: this.gl.getUniformLocation(this.program, 'u_density'),
      speed: this.gl.getUniformLocation(this.program, 'u_speed'),
      color: this.gl.getUniformLocation(this.program, 'u_color'),
      intensity: this.gl.getUniformLocation(this.program, 'u_intensity'),
      instanceDensity: this.gl.getUniformLocation(this.program, 'u_instanceDensity'),
      instanceSpeed: this.gl.getUniformLocation(this.program, 'u_instanceSpeed'),
      colorShift: this.gl.getUniformLocation(this.program, 'u_colorShift'),
      cardSeed: this.gl.getUniformLocation(this.program, 'u_cardSeed'),
      densityVariation: this.gl.getUniformLocation(this.program, 'u_densityVariation'),
      rot4dXW: this.gl.getUniformLocation(this.program, 'u_rot4dXW'),
      rot4dYW: this.gl.getUniformLocation(this.program, 'u_rot4dYW'),
      rot4dZW: this.gl.getUniformLocation(this.program, 'u_rot4dZW'),
      mouseIntensity: this.gl.getUniformLocation(this.program, 'u_mouseIntensity'),
      clickIntensity: this.gl.getUniformLocation(this.program, 'u_clickIntensity')
    };
  }
  
  createShaderProgram(vertexSource, fragmentSource) {
    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentSource);
    
    const program = this.gl.createProgram();
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);
    
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error('Program link error:', this.gl.getProgramInfoLog(program));
      return null;
    }
    
    return program;
  }
  
  createShader(type, source) {
    if (!this.gl || !source) {
      console.error('Missing WebGL context or shader source');
      return null;
    }
    
    const shader = this.gl.createShader(type);
    if (!shader) {
      console.error('Failed to create shader');
      return null;
    }
    
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const error = this.gl.getShaderInfoLog(shader);
      console.error('Shader compile error:', error);
      console.error('Shader source:', source);
      this.gl.deleteShader(shader);
      return null;
    }
    
    return shader;
  }
  
  initBuffers() {
    // Create quad for full-canvas rendering
    const vertices = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1,
    ]);
    
    this.vertexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
    
    const positionAttribute = this.gl.getAttribLocation(this.program, 'a_position');
    this.gl.enableVertexAttribArray(positionAttribute);
    this.gl.vertexAttribPointer(positionAttribute, 2, this.gl.FLOAT, false, 0, 0);
  }
  
  setupCardAnimations() {
    if (!this.cardElement) return;
    
    // Mouse tracking for card transforms and visualizer interaction
    this.cardElement.addEventListener('mousemove', (e) => {
      const rect = this.cardElement.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      this.updateInteraction(x, y, 0.5);
      
      // Update CSS custom properties for card transforms
      this.cardElement.style.setProperty('--mouse-x', (x * 100) + '%');
      this.cardElement.style.setProperty('--mouse-y', (y * 100) + '%');
      this.cardElement.style.setProperty('--bend-intensity', this.mouseIntensity);
    });
    
    // Click interactions
    this.cardElement.addEventListener('click', (e) => {
      const rect = this.cardElement.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      this.triggerClick(x, y);
    });
    
    // Mouse enter/leave for activation states
    this.cardElement.addEventListener('mouseenter', () => {
      this.cardElement.classList.add('visualizer-active');
      this.reactivity = 1.5;
    });
    
    this.cardElement.addEventListener('mouseleave', () => {
      this.cardElement.classList.remove('visualizer-active');
      this.reactivity = 1.0;
      this.mouseIntensity *= 0.8; // Gradual fade
      
      // Reset CSS transforms
      this.cardElement.style.setProperty('--mouse-x', '50%');
      this.cardElement.style.setProperty('--mouse-y', '50%');
      this.cardElement.style.setProperty('--bend-intensity', '0');
    });
  }
  
  updateInteraction(mouseX, mouseY, intensity = 1.0) {
    this.mouseX = mouseX;
    this.mouseY = mouseY;
    this.mouseIntensity = intensity * this.roleParams.mouseReactivity * this.reactivity;
  }
  
  triggerClick(x, y) {
    this.clickIntensity = Math.min(1.0, this.clickIntensity + 
      this.roleParams.clickReactivity * this.reactivity);
    
    // Add explosive effect for dramatic clicks
    if (this.clickIntensity > 0.8 && this.cardElement) {
      this.cardElement.classList.add('exploding');
      setTimeout(() => this.cardElement.classList.remove('exploding'), 300);
    }
    
    // Gradual cooldown
    setTimeout(() => {
      this.clickIntensity *= 0.7;
    }, 200);
  }
  
  resize() {
    if (!this.canvas) return;
    
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }
  
  render() {
    if (!this.active || !this.gl || !this.program) return;
    
    // Update context usage for LRU management
    WebGLContextManager.updateUsage(this.canvas);
    
    const time = Date.now() - this.startTime;
    const morphTime = time * this.behaviorProfile.geometryMorphSpeed;
    const colorTime = time * this.behaviorProfile.colorCycleRate;
    
    // Dynamic geometry morphing
    const geometryFloat = Math.sin(morphTime * 0.001) * 3.5 + 3.5; // 0-7 range
    
    // Per-card color variations
    const hueShift = (Math.sin(colorTime * 0.0008) * 180) + 
                    this.instanceParams.colorShift;
    
    // Apply unique density fluctuations
    const densityVariation = Math.sin(morphTime * 0.0012) * 
                           this.behaviorProfile.densityFluctuation;
    
    // 4D rotations with time and mouse influence
    const rot4dXW = time * 0.0003 + this.cardSeed * 6.28;
    const rot4dYW = time * 0.0002 + this.cardSeed * 3.14;
    const rot4dZW = time * 0.0005 + this.mouseIntensity * 3.14159;
    
    // Set uniforms
    this.gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
    this.gl.uniform1f(this.uniforms.time, time);
    this.gl.uniform2f(this.uniforms.mouse, this.mouseX, this.mouseY);
    this.gl.uniform1f(this.uniforms.geometry, geometryFloat);
    this.gl.uniform1f(this.uniforms.density, 8.0);
    this.gl.uniform1f(this.uniforms.speed, this.roleParams.speedMult);
    this.gl.uniform3f(this.uniforms.color, 0.0, 1.0, 1.0); // Cyan base
    this.gl.uniform1f(this.uniforms.intensity, this.roleParams.intensity * this.instanceParams.intensity);
    this.gl.uniform1f(this.uniforms.instanceDensity, this.roleParams.densityMult * this.instanceParams.densityMult);
    this.gl.uniform1f(this.uniforms.instanceSpeed, this.instanceParams.speedMult);
    this.gl.uniform1f(this.uniforms.colorShift, hueShift);
    this.gl.uniform1f(this.uniforms.cardSeed, this.cardSeed);
    this.gl.uniform1f(this.uniforms.densityVariation, densityVariation);
    this.gl.uniform1f(this.uniforms.rot4dXW, rot4dXW);
    this.gl.uniform1f(this.uniforms.rot4dYW, rot4dYW);
    this.gl.uniform1f(this.uniforms.rot4dZW, rot4dZW);
    this.gl.uniform1f(this.uniforms.mouseIntensity, this.mouseIntensity);
    this.gl.uniform1f(this.uniforms.clickIntensity, this.clickIntensity);
    
    // Render
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    
    // Decay click intensity
    if (this.clickIntensity > 0) {
      this.clickIntensity *= 0.95;
    }
  }
  
  startRenderLoop() {
    const renderFrame = () => {
      if (!this.active) return;
      
      this.render();
      requestAnimationFrame(renderFrame);
    };
    
    renderFrame();
  }
  
  pause() {
    this.active = false;
  }
  
  resume() {
    this.active = true;
    this.startRenderLoop();
  }
  
  destroy() {
    this.active = false;
    if (this.canvas && this.gl) {
      WebGLContextManager.releaseContext(this.canvas);
    }
    
    // Clean up event listeners
    if (this.cardElement) {
      this.cardElement.removeEventListener('mousemove', this.updateInteraction);
      this.cardElement.removeEventListener('click', this.triggerClick);
    }
  }
  
  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }
}

// Card Visualizer Manager
class CardVisualizerManager {
  constructor() {
    this.activeVisualizers = new Map();
    this.canvasPool = [];
    this.maxConcurrent = 8; // Prevent performance issues
    this.observerOptions = { threshold: 0.1 };
    this.intersectionObserver = new IntersectionObserver(
      this.handleIntersection.bind(this), this.observerOptions
    );
    
    console.log('🎨 Card Visualizer Manager initialized');
  }
  
  createCardVisualizer(cardElement, role = 'content') {
    const canvasId = `${cardElement.id}-visualizer-${role}`;
    
    // Check if visualizer already exists
    if (this.activeVisualizers.has(canvasId)) {
      return this.activeVisualizers.get(canvasId);
    }
    
    // Create canvas element
    const canvas = this.getOrCreateCanvas(canvasId, role);
    cardElement.appendChild(canvas);
    
    // Create visualizer instance
    const visualizer = new CardSpecificVIB34DVisualizer(canvasId, role, cardElement);
    
    if (visualizer.gl) {
      this.activeVisualizers.set(canvasId, visualizer);
      this.intersectionObserver.observe(cardElement);
      
      console.log(`✨ Visualizer created: ${canvasId} (${role})`);
    }
    
    return visualizer;
  }
  
  getOrCreateCanvas(canvasId, role) {
    // Try to reuse from pool
    let canvas = this.canvasPool.pop();
    
    if (!canvas) {
      canvas = document.createElement('canvas');
    }
    
    // Apply role-specific styling
    canvas.id = canvasId;
    canvas.className = `card-visualizer ${role}-visualizer`;
    this.applyRoleStyles(canvas, role);
    
    return canvas;
  }
  
  applyRoleStyles(canvas, role) {
    const styles = {
      'shadow': {
        opacity: '0.6',
        filter: 'blur(2px) brightness(0.7)',
        mixBlendMode: 'multiply',
        transform: 'translate(4px, 4px)',
        zIndex: '3'
      },
      'content': {
        opacity: '0.8',
        mixBlendMode: 'normal',
        zIndex: '5'
      },
      'highlight': {
        opacity: '0.4',
        filter: 'blur(1px) brightness(1.5)',
        mixBlendMode: 'screen',
        transform: 'translate(-2px, -2px)',
        zIndex: '7'
      },
      'accent': {
        opacity: '0.3',
        filter: 'blur(3px)',
        mixBlendMode: 'color-dodge',
        transform: 'scale(1.02)',
        zIndex: '15'
      }
    }[role] || {};
    
    Object.assign(canvas.style, {
      position: 'absolute',
      top: '0', left: '0',
      width: '100%', height: '100%',
      pointerEvents: 'none',
      ...styles
    });
  }
  
  handleIntersection(entries) {
    entries.forEach(entry => {
      const cardElement = entry.target;
      const visualizers = this.getCardVisualizers(cardElement);
      
      if (entry.isIntersecting) {
        // Start rendering when visible
        visualizers.forEach(viz => viz.resume());
      } else {
        // Pause rendering when out of view (performance optimization)
        visualizers.forEach(viz => viz.pause());
      }
    });
  }
  
  getCardVisualizers(cardElement) {
    const visualizers = [];
    for (const [canvasId, visualizer] of this.activeVisualizers) {
      if (canvasId.startsWith(cardElement.id + '-visualizer-')) {
        visualizers.push(visualizer);
      }
    }
    return visualizers;
  }
  
  destroyCardVisualizer(cardElement) {
    const visualizers = this.getCardVisualizers(cardElement);
    
    visualizers.forEach(viz => {
      viz.destroy();
      this.activeVisualizers.delete(viz.canvasId);
      
      // Return canvas to pool for reuse
      const canvas = viz.canvas;
      if (canvas) {
        canvas.remove();
        this.canvasPool.push(canvas);
      }
    });
    
    this.intersectionObserver.unobserve(cardElement);
  }
}

// Global instance
window.CardVisualizerManager = CardVisualizerManager;
window.CardSpecificVIB34DVisualizer = CardSpecificVIB34DVisualizer;

console.log('🎨 Card-Specific VIB34D Visualizer System loaded');