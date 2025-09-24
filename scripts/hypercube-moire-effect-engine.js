/*
 * HYPERCUBE MOIRE EFFECT ENGINE
 * Inspired by visual codex hypercube lattice effects
 * Creates interference patterns and moire effects for cards
 */

class HypercubeMoireEffectEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.animationFrame = null;
    this.time = 0;
    
    this.hypercubeVertices = this.generateHypercubeVertices();
    this.moirePatterns = [];
    this.interferenceGrid = [];
    
    this.init();
  }
  
  init() {
    this.createCanvas();
    this.setupMoirePatterns();
    this.startAnimation();
    
    console.log('🔮 Hypercube Moire Effect Engine - Fourth dimension activated');
  }
  
  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 500;
      opacity: 0.3;
      mix-blend-mode: screen;
    `;
    
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.ctx = this.canvas.getContext('2d');
    
    document.body.appendChild(this.canvas);
    
    // Responsive resize
    window.addEventListener('resize', () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    });
  }
  
  generateHypercubeVertices() {
    // Generate 4D hypercube vertices projected to 3D then 2D
    const vertices = [];
    
    for (let i = 0; i < 16; i++) {
      const x = (i & 1) ? 1 : -1;
      const y = (i & 2) ? 1 : -1;
      const z = (i & 4) ? 1 : -1;
      const w = (i & 8) ? 1 : -1;
      
      vertices.push({ x, y, z, w });
    }
    
    return vertices;
  }
  
  setupMoirePatterns() {
    // Create multiple overlapping moire patterns
    for (let i = 0; i < 3; i++) {
      this.moirePatterns.push({
        frequency: 0.1 + i * 0.05,
        phase: i * Math.PI / 3,
        amplitude: 50 + i * 30,
        rotation: i * 15
      });
    }
    
    // Create interference grid
    for (let x = 0; x < 20; x++) {
      this.interferenceGrid[x] = [];
      for (let y = 0; y < 20; y++) {
        this.interferenceGrid[x][y] = {
          intensity: Math.random(),
          phase: Math.random() * Math.PI * 2
        };
      }
    }
  }
  
  startAnimation() {
    const animate = () => {
      this.time += 0.016; // 60fps
      this.render();
      this.animationFrame = requestAnimationFrame(animate);
    };
    
    animate();
  }
  
  render() {
    const { width, height } = this.canvas;
    
    // Clear with slight fade for trails
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.fillRect(0, 0, width, height);
    
    // Render hypercube wireframe with moire interference
    this.renderHypercubeMoire();
    
    // Render interference patterns
    this.renderInterferencePatterns();
    
    // Render hypercube projection
    this.renderHypercubeProjection();
  }
  
  renderHypercubeMoire() {
    const { width, height } = this.canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    
    this.ctx.strokeStyle = `hsl(${(this.time * 50) % 360}, 70%, 50%)`;
    this.ctx.lineWidth = 1;
    this.ctx.globalAlpha = 0.4;
    
    // Draw moire interference lines
    for (let i = 0; i < this.moirePatterns.length; i++) {
      const pattern = this.moirePatterns[i];
      const offset = Math.sin(this.time * pattern.frequency + pattern.phase) * pattern.amplitude;
      
      this.ctx.save();
      this.ctx.translate(centerX, centerY);
      this.ctx.rotate((pattern.rotation + this.time * 10) * Math.PI / 180);
      
      this.ctx.beginPath();
      
      for (let x = -width; x < width; x += 10) {
        const y = Math.sin((x + offset) * 0.02) * 100;
        if (x === -width) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }
      
      this.ctx.stroke();
      this.ctx.restore();
    }
  }
  
  renderInterferencePatterns() {
    const { width, height } = this.canvas;
    const gridSize = Math.min(width, height) / 20;
    
    for (let x = 0; x < 20; x++) {
      for (let y = 0; y < 20; y++) {
        const cell = this.interferenceGrid[x][y];
        const posX = x * gridSize;
        const posY = y * gridSize;
        
        // Calculate interference intensity
        const interference = Math.sin(this.time * 2 + cell.phase) * cell.intensity;
        const alpha = Math.abs(interference) * 0.5;
        
        if (alpha > 0.1) {
          const hue = (this.time * 30 + x * 10 + y * 15) % 360;
          this.ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${alpha})`;
          
          this.ctx.beginPath();
          this.ctx.arc(posX, posY, gridSize * 0.3, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
    }
  }
  
  renderHypercubeProjection() {
    const { width, height } = this.canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = 100;
    
    // Project 4D vertices to 2D
    const projectedVertices = this.hypercubeVertices.map(vertex => {
      // 4D to 3D projection
      const w_offset = 2; // Distance from 4D hyperplane
      const scale_3d = w_offset / (w_offset - vertex.w);
      
      const x3d = vertex.x * scale_3d;
      const y3d = vertex.y * scale_3d;
      const z3d = vertex.z * scale_3d;
      
      // 3D to 2D projection with rotation
      const rotY = this.time * 0.5;
      const rotX = this.time * 0.3;
      
      // Rotate around Y axis
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const xRotY = x3d * cosY - z3d * sinY;
      const zRotY = x3d * sinY + z3d * cosY;
      
      // Rotate around X axis
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const yRotX = y3d * cosX - zRotY * sinX;
      const zRotX = y3d * sinX + zRotY * cosX;
      
      // Perspective projection
      const distance = 300;
      const scale_2d = distance / (distance + zRotX);
      
      return {
        x: centerX + xRotY * scale * scale_2d,
        y: centerY + yRotX * scale * scale_2d,
        z: zRotX
      };
    });
    
    // Draw hypercube edges with moire interference
    this.drawHypercubeEdges(projectedVertices);
  }
  
  drawHypercubeEdges(vertices) {
    const edges = [
      // Inner cube edges
      [0, 1], [1, 3], [3, 2], [2, 0],
      [4, 5], [5, 7], [7, 6], [6, 4],
      [0, 4], [1, 5], [2, 6], [3, 7],
      
      // Outer cube edges
      [8, 9], [9, 11], [11, 10], [10, 8],
      [12, 13], [13, 15], [15, 14], [14, 12],
      [8, 12], [9, 13], [10, 14], [11, 15],
      
      // 4D connecting edges
      [0, 8], [1, 9], [2, 10], [3, 11],
      [4, 12], [5, 13], [6, 14], [7, 15]
    ];
    
    edges.forEach((edge, index) => {
      const v1 = vertices[edge[0]];
      const v2 = vertices[edge[1]];
      
      if (!v1 || !v2) return;
      
      // Calculate moire interference for this edge
      const interference = Math.sin(this.time * 3 + index * 0.5) * 0.5 + 0.5;
      const hue = (this.time * 20 + index * 30) % 360;
      
      this.ctx.strokeStyle = `hsla(${hue}, 70%, 50%, ${interference * 0.8})`;
      this.ctx.lineWidth = 1 + interference * 2;
      this.ctx.globalAlpha = 0.6 + interference * 0.4;
      
      this.ctx.beginPath();
      this.ctx.moveTo(v1.x, v1.y);
      this.ctx.lineTo(v2.x, v2.y);
      this.ctx.stroke();
    });
    
    // Draw vertices with pulsing effect
    vertices.forEach((vertex, index) => {
      if (!vertex) return;
      
      const pulse = Math.sin(this.time * 4 + index * 0.3) * 0.5 + 0.5;
      const hue = (this.time * 40 + index * 45) % 360;
      
      this.ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${pulse * 0.9})`;
      this.ctx.globalAlpha = 0.8;
      
      this.ctx.beginPath();
      this.ctx.arc(vertex.x, vertex.y, 2 + pulse * 3, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }
  
  updateScrollIntensity(intensity) {
    // Modify effect based on scroll intensity
    this.canvas.style.opacity = Math.min(0.6, 0.1 + intensity * 0.5);
    
    // Increase animation speed with scroll
    this.moirePatterns.forEach((pattern, index) => {
      pattern.frequency = (0.1 + index * 0.05) * (1 + intensity);
    });
  }
  
  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

// Initialize when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    window.hypercubeMoireEngine = new HypercubeMoireEffectEngine();
    
    // Connect to scroll system
    window.addEventListener('scroll', () => {
      const scrollProgress = window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight);
      if (window.hypercubeMoireEngine) {
        window.hypercubeMoireEngine.updateScrollIntensity(scrollProgress);
      }
    });
    
  }, 500);
});