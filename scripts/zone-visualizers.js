/*
 * ZONE-BASED VISUALIZER CLASSES
 * Smart visualizers that spawn/destroy based on scroll zones
 * Each visualizer is optimized for its specific zone and parameters
 */

// Base class for all zone visualizers
class BaseZoneVisualizer {
  constructor(zone, config) {
    this.zone = zone;
    this.config = config;
    this.canvases = new Map();
    this.contexts = new Map();
    this.animationFrame = null;
    this.isActive = false;
    
    this.parameters = {
      intensity: 0.5,
      morphFactor: 0,
      chaos: 0,
      hue: 0,
      saturation: 0.7,
      speed: 1.0,
      glitchIntensity: 0,
      chromaticShift: 0,
      qualityLevel: 'high',
      maxParticles: 1000
    };
    
    this.setupCanvases();
  }
  
  setupCanvases() {
    this.zone.canvasElements.forEach(canvas => {
      const layerName = canvas.className.match(/zone-canvas-(\w+)/)?.[1];
      if (layerName) {
        this.canvases.set(layerName, canvas);
        
        // Get appropriate context
        const context = this.getContextForLayer(layerName);
        if (context) {
          this.contexts.set(layerName, context);
        }
      }
    });
  }
  
  getContextForLayer(layerName) {
    const canvas = this.canvases.get(layerName);
    if (!canvas) return null;
    
    // Determine if this layer needs WebGL or 2D context
    const webglLayers = ['primary', 'effects', 'particles', 'lattice', 'interference', 'shimmer'];
    
    if (webglLayers.includes(layerName)) {
      const gl = canvas.getContext('webgl', {
        alpha: true,
        antialias: this.parameters.qualityLevel === 'high',
        powerPreference: 'high-performance'
      });
      
      if (gl) {
        // Setup WebGL state
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(0, 0, 0, 0);
        return gl;
      }
    }
    
    // Fallback to 2D context
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.globalCompositeOperation = 'source-over';
    }
    
    return ctx;
  }
  
  updateParameters(newParams) {
    Object.assign(this.parameters, newParams);
    
    // Adjust quality based on performance
    this.adjustQualityLevel();
  }
  
  adjustQualityLevel() {
    const level = this.parameters.qualityLevel;
    
    // Adjust canvas resolution based on quality
    this.canvases.forEach((canvas, layerName) => {
      const baseWidth = this.zone.element.clientWidth;
      const baseHeight = this.zone.element.clientHeight;
      
      let scale = 1;
      if (level === 'low') scale = 0.5;
      else if (level === 'medium') scale = 0.75;
      
      const dpr = window.devicePixelRatio || 1;
      canvas.width = baseWidth * scale * dpr;
      canvas.height = baseHeight * scale * dpr;
    });
  }
  
  render() {
    // Override in subclasses
    console.warn('BaseZoneVisualizer.render() should be overridden');
  }
  
  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    // Clear all contexts
    this.contexts.forEach((context, layerName) => {
      if (context.clear) {
        context.clear(context.COLOR_BUFFER_BIT);
      } else if (context.clearRect) {
        const canvas = this.canvases.get(layerName);
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    });
    
    this.isActive = false;
  }
}

// Polychora Zone Visualizer - Complex 4D polytope mathematics
class PolychoraZoneVisualizer extends BaseZoneVisualizer {
  constructor(zone, config) {
    super(zone, config);
    this.polytope = 'tesseract'; // Current polytope type
    this.rotation4D = { xy: 0, xz: 0, xw: 0, yz: 0, yw: 0, zw: 0 };
    this.setupPolychoraShaders();
  }
  
  setupPolychoraShaders() {
    const gl = this.contexts.get('primary');
    if (!gl) return;
    
    // 4D polytope vertex shader
    const vertexShaderSource = `
      attribute vec4 a_position;
      attribute vec4 a_position4d;
      uniform mat4 u_rotation4d;
      uniform mat4 u_projection;
      uniform float u_morphFactor;
      varying vec4 v_color;
      varying float v_depth;
      
      void main() {
        // 4D to 3D projection
        vec4 pos4d = u_rotation4d * a_position4d;
        vec3 projected = pos4d.xyz / (2.0 - pos4d.w * u_morphFactor);
        
        gl_Position = u_projection * vec4(projected, 1.0);
        v_depth = pos4d.w;
        v_color = vec4(0.3 + abs(pos4d.w) * 0.7, 0.8 - abs(pos4d.x) * 0.3, 1.0, 0.8);
      }
    `;
    
    const fragmentShaderSource = `
      precision mediump float;
      uniform float u_intensity;
      uniform float u_hue;
      uniform float u_glitchIntensity;
      varying vec4 v_color;
      varying float v_depth;
      
      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }
      
      void main() {
        vec3 baseColor = hsv2rgb(vec3(u_hue / 360.0, 0.8, 1.0));
        vec3 color = mix(v_color.rgb, baseColor, 0.6);
        
        // Add depth-based intensity
        float depthFactor = 0.5 + abs(v_depth) * 0.5;
        color *= depthFactor * u_intensity;
        
        // Glitch effect
        if (u_glitchIntensity > 0.1) {
          color.r += sin(gl_FragCoord.x * 0.1) * u_glitchIntensity * 0.3;
          color.g += cos(gl_FragCoord.y * 0.1) * u_glitchIntensity * 0.3;
        }
        
        gl_FragColor = vec4(color, v_color.a * u_intensity);
      }
    `;
    
    this.program = this.createShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
    this.setupPolytopGeometry();
  }
  
  setupPolytopGeometry() {
    // Generate tesseract vertices in 4D
    const vertices4D = [
      // Tesseract vertices (16 vertices)
      [-1, -1, -1, -1], [1, -1, -1, -1], [-1, 1, -1, -1], [1, 1, -1, -1],
      [-1, -1, 1, -1], [1, -1, 1, -1], [-1, 1, 1, -1], [1, 1, 1, -1],
      [-1, -1, -1, 1], [1, -1, -1, 1], [-1, 1, -1, 1], [1, 1, -1, 1],
      [-1, -1, 1, 1], [1, -1, 1, 1], [-1, 1, 1, 1], [1, 1, 1, 1]
    ];
    
    // Convert to flat array for WebGL
    this.vertexData = new Float32Array(vertices4D.flat());
    
    const gl = this.contexts.get('primary');
    if (gl) {
      this.vertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.vertexData, gl.STATIC_DRAW);
    }
  }
  
  render() {
    const gl = this.contexts.get('primary');
    if (!gl || !this.program) return;
    
    // Update 4D rotation based on parameters
    this.rotation4D.xy += this.parameters.speed * 0.01;
    this.rotation4D.xw += this.parameters.speed * 0.008;
    this.rotation4D.zw += this.parameters.morphFactor * 0.005;
    
    // Clear canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // Use shader program
    gl.useProgram(this.program);
    
    // Set uniforms
    const uniformLocations = this.getUniformLocations(gl);
    gl.uniform1f(uniformLocations.u_intensity, this.parameters.intensity);
    gl.uniform1f(uniformLocations.u_hue, this.parameters.hue);
    gl.uniform1f(uniformLocations.u_glitchIntensity, this.parameters.glitchIntensity);
    gl.uniform1f(uniformLocations.u_morphFactor, this.parameters.morphFactor);
    
    // Set up vertex attributes
    const positionLocation = gl.getAttribLocation(this.program, 'a_position4d');
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 4, gl.FLOAT, false, 0, 0);
    
    // Draw the polytope
    gl.drawArrays(gl.POINTS, 0, 16);
    
    // Render background effects
    this.renderBackgroundEffects();
  }
  
  renderBackgroundEffects() {
    const canvas = this.canvases.get('background');
    const ctx = this.contexts.get('background');
    if (!canvas || !ctx) return;
    
    // Clear background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Holographic grid effect
    ctx.strokeStyle = `hsla(${this.parameters.hue}, 70%, 60%, ${this.parameters.intensity * 0.3})`;
    ctx.lineWidth = 1;
    
    const gridSize = 50;
    const offset = (Date.now() * this.parameters.speed * 0.001) % gridSize;
    
    // Vertical lines
    for (let x = -offset; x < canvas.width + gridSize; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = -offset; y < canvas.height + gridSize; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }
  
  createShaderProgram(gl, vertexSource, fragmentSource) {
    const vertexShader = this.compileShader(gl, vertexSource, gl.VERTEX_SHADER);
    const fragmentShader = this.compileShader(gl, fragmentSource, gl.FRAGMENT_SHADER);
    
    if (!vertexShader || !fragmentShader) return null;
    
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Shader program linking failed:', gl.getProgramInfoLog(program));
      return null;
    }
    
    return program;
  }
  
  compileShader(gl, source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compilation failed:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    
    return shader;
  }
  
  getUniformLocations(gl) {
    return {
      u_intensity: gl.getUniformLocation(this.program, 'u_intensity'),
      u_hue: gl.getUniformLocation(this.program, 'u_hue'),
      u_glitchIntensity: gl.getUniformLocation(this.program, 'u_glitchIntensity'),
      u_morphFactor: gl.getUniformLocation(this.program, 'u_morphFactor'),
      u_rotation4d: gl.getUniformLocation(this.program, 'u_rotation4d'),
      u_projection: gl.getUniformLocation(this.program, 'u_projection')
    };
  }
}

// Quantum Zone Visualizer - Lattice and interference patterns
class QuantumZoneVisualizer extends BaseZoneVisualizer {
  constructor(zone, config) {
    super(zone, config);
    this.latticeNodes = [];
    this.interferencePattern = null;
    this.setupQuantumEffects();
  }
  
  setupQuantumEffects() {
    // Generate quantum lattice nodes
    const nodeCount = Math.floor(this.parameters.maxParticles * 0.1);
    
    for (let i = 0; i < nodeCount; i++) {
      this.latticeNodes.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        z: Math.random() * 100,
        phase: Math.random() * Math.PI * 2,
        frequency: 0.02 + Math.random() * 0.08,
        amplitude: 0.5 + Math.random() * 0.5
      });
    }
  }
  
  render() {
    this.renderQuantumLattice();
    this.renderInterferencePatterns();
  }
  
  renderQuantumLattice() {
    const canvas = this.canvases.get('lattice');
    const ctx = this.contexts.get('lattice');
    if (!canvas || !ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const time = Date.now() * 0.001;
    
    // Render lattice nodes and connections
    this.latticeNodes.forEach((node, i) => {
      // Update node position
      node.phase += node.frequency * this.parameters.speed;
      const waveOffset = Math.sin(node.phase) * node.amplitude * 20;
      
      const x = node.x + waveOffset;
      const y = node.y + Math.cos(node.phase * 1.3) * node.amplitude * 15;
      
      // Draw node
      const intensity = this.parameters.intensity * (0.5 + Math.sin(node.phase) * 0.5);
      ctx.fillStyle = `hsla(${this.parameters.hue + node.z}, 80%, 70%, ${intensity})`;
      ctx.beginPath();
      ctx.arc(x, y, 2 + intensity * 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw connections to nearby nodes
      this.latticeNodes.forEach((otherNode, j) => {
        if (i >= j) return;
        
        const dx = node.x - otherNode.x;
        const dy = node.y - otherNode.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
          const alpha = (150 - distance) / 150 * this.parameters.intensity * 0.3;
          ctx.strokeStyle = `hsla(${this.parameters.hue}, 60%, 50%, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(otherNode.x + Math.sin(otherNode.phase) * otherNode.amplitude * 20, 
                     otherNode.y + Math.cos(otherNode.phase * 1.3) * otherNode.amplitude * 15);
          ctx.stroke();
        }
      });
    });
  }
  
  renderInterferencePatterns() {
    const canvas = this.canvases.get('interference');
    const ctx = this.contexts.get('interference');
    if (!canvas || !ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Create interference pattern based on scroll parameters
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const time = Date.now() * 0.001 * this.parameters.speed;
    
    for (let y = 0; y < canvas.height; y += 2) { // Skip pixels for performance
      for (let x = 0; x < canvas.width; x += 2) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Create wave interference
        const wave1 = Math.sin(distance * 0.02 + time * 2);
        const wave2 = Math.sin(distance * 0.03 + time * 1.5 + this.parameters.morphFactor * Math.PI);
        const interference = (wave1 + wave2) * 0.5;
        
        const intensity = Math.abs(interference) * this.parameters.intensity * 255;
        const index = (y * canvas.width + x) * 4;
        
        if (index < data.length) {
          data[index] = intensity * 0.3;     // R
          data[index + 1] = intensity * 0.7; // G
          data[index + 2] = intensity;       // B
          data[index + 3] = intensity * 0.5; // A
        }
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  }
}

// Additional visualizer classes: FacetedZoneVisualizer, HolographicZoneVisualizer, etc.
// [Implementations continue with similar patterns for each visualizer type]

class FacetedZoneVisualizer extends BaseZoneVisualizer {
  render() {
    // Simple geometric patterns
    const canvas = this.canvases.get('geometry');
    const ctx = this.contexts.get('geometry');
    if (!canvas || !ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw faceted geometric shapes
    const time = Date.now() * 0.001;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + time * this.parameters.speed;
      const radius = 100 + this.parameters.morphFactor * 50;
      
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      ctx.fillStyle = `hsla(${this.parameters.hue + i * 60}, 70%, 60%, ${this.parameters.intensity})`;
      ctx.beginPath();
      ctx.polygon = (sides, size) => {
        for (let j = 0; j <= sides; j++) {
          const a = (j / sides) * Math.PI * 2;
          const px = x + Math.cos(a) * size;
          const py = y + Math.sin(a) * size;
          if (j === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
      };
      
      ctx.polygon(6, 20 + this.parameters.intensity * 30);
      ctx.fill();
    }
  }
}

// Export visualizer classes
window.PolychoraZoneVisualizer = PolychoraZoneVisualizer;
window.QuantumZoneVisualizer = QuantumZoneVisualizer;
window.FacetedZoneVisualizer = FacetedZoneVisualizer;
window.HolographicZoneVisualizer = BaseZoneVisualizer; // Placeholder
window.MinimalZoneVisualizer = BaseZoneVisualizer;     // Placeholder  
window.InteractiveZoneVisualizer = BaseZoneVisualizer;  // Placeholder