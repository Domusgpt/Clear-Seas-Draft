// src/core/OptimizedCanvasPool.js
import WebGLResourceManager from './WebGLResourceManager.js';

class OptimizedCanvasPool {
  constructor(maxContexts = 6) {
    this.maxContexts = this.detectMaxContexts();
    this.pool = [];
    this.inUse = new Map();
    this.waitQueue = [];
    
    // Pre-warm pool
    this.initializePool();
  }

  detectMaxContexts() {
    const isMobile = /Android|iPhone|iPad/.test(navigator.userAgent);
    const isIOS = /iPhone|iPad/.test(navigator.userAgent);
    
    if (isIOS) return 4; // iOS is most restrictive
    if (isMobile) return 6;
    return 8; // Desktop
  }

  initializePool() {
    // Create only 50% of max contexts initially
    const initialCount = Math.floor(this.maxContexts * 0.5);
    for (let i = 0; i < initialCount; i++) {
      this.createPooledCanvas();
    }
  }

  createPooledCanvas() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2', {
      antialias: false,
      alpha: true,
      depth: true,
      stencil: false,
      powerPreference: 'low-power',
      preserveDrawingBuffer: false,
      failIfMajorPerformanceCaveat: true
    });
    
    if (!gl) return null;
    
    const poolItem = {
      canvas,
      gl,
      allocated: false,
      lastUsed: Date.now(),
      priority: 0,
      resources: new WebGLResourceManager(gl)
    };
    
    this.pool.push(poolItem);
    return poolItem;
  }

  acquire(priority = 0) {
    // Find available canvas
    let available = this.pool.find(item => !item.allocated);
    
    if (!available && this.pool.length < this.maxContexts) {
      available = this.createPooledCanvas();
    }
    
    if (!available) {
      // Evict least recently used low-priority canvas
      const victim = this.findEvictionCandidate(priority);
      if (victim) {
        this.evict(victim);
        available = victim;
      } else {
        // Queue the request
        return new Promise((resolve) => {
          this.waitQueue.push({ priority, resolve });
        });
      }
    }
    
    available.allocated = true;
    available.lastUsed = Date.now();
    available.priority = priority;
    
    const id = this.generateId();
    this.inUse.set(id, available);
    
    return { id, canvas: available.canvas, gl: available.gl };
  }

  release(id) {
    const item = this.inUse.get(id);
    if (!item) return;
    
    // Clear WebGL state
    this.resetWebGLState(item.gl);
    
    item.allocated = false;
    item.lastUsed = Date.now();
    item.priority = 0;
    this.inUse.delete(id);
    
    // Process wait queue
    if (this.waitQueue.length > 0) {
      const next = this.waitQueue.shift();
      next.resolve(this.acquire(next.priority));
    }
  }

  resetWebGLState(gl) {
    gl.useProgram(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
    
    // Reset viewport to canvas size
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    
    // Clear
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  findEvictionCandidate(priority) {
    const candidates = Array.from(this.inUse.values())
      .filter(item => item.priority < priority)
      .sort((a, b) => a.lastUsed - b.lastUsed);
    
    return candidates[0] || null;
  }

  evict(item) {
    // Save state if needed
    item.resources.disposeAll();
    this.resetWebGLState(item.gl);
    item.allocated = false;
  }

  generateId() {
    return `canvas_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getStats() {
    return {
      total: this.pool.length,
      inUse: this.inUse.size,
      available: this.pool.filter(item => !item.allocated).length,
      maxContexts: this.maxContexts,
      waitQueue: this.waitQueue.length
    };
  }

  dispose() {
    // Release all contexts
    for (const item of this.pool) {
      item.resources.disposeAll();
      if (item.canvas.parentNode) {
        item.canvas.parentNode.removeChild(item.canvas);
      }
    }
    
    this.pool.clear();
    this.inUse.clear();
    this.waitQueue.length = 0;
  }
}

export default OptimizedCanvasPool;