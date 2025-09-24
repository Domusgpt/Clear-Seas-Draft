// src/core/UnifiedResourceManager.js
class UnifiedResourceManager {
  constructor(gl) {
    this.gl = gl;
    this.resources = {
      textures: new Map(),
      buffers: new Map(),
      programs: new Map(),
      framebuffers: new Map()
    };
    
    this.memoryBudget = this.calculateMemoryBudget();
    this.currentUsage = 0;
    this.lastEvictionTime = Date.now();
    this.onMemoryPressure = null;
    
    this.setupMemoryMonitoring();
  }

  calculateMemoryBudget() {
    const isMobile = /Android|iPhone|iPad/.test(navigator.userAgent);
    const screenPixels = window.innerWidth * window.innerHeight * 
                        Math.min(window.devicePixelRatio, 2);
    
    // Conservative memory budget based on device type
    let baseBytesPerPixel = 16; // Desktop default
    
    if (isMobile) {
      const isLowEndDevice = navigator.deviceMemory && navigator.deviceMemory <= 2;
      baseBytesPerPixel = isLowEndDevice ? 4 : 8;
    }
    
    // Reserve some memory for system and other resources
    const reserveRatio = isMobile ? 0.3 : 0.5;
    
    return Math.floor(screenPixels * baseBytesPerPixel * reserveRatio);
  }

  setupMemoryMonitoring() {
    // Monitor memory pressure using available APIs
    if (window.performance && window.performance.memory) {
      setInterval(() => {
        const memory = window.performance.memory;
        const used = memory.usedJSHeapSize;
        const limit = memory.jsHeapSizeLimit;
        
        if (used / limit > 0.85) {
          this.handleMemoryPressure();
        }
      }, 2000);
    }

    // Listen for memory pressure events (if available)
    if (window.addEventListener && 'onmemorywarning' in window) {
      window.addEventListener('memorywarning', () => {
        this.handleMemoryPressure();
      });
    }

    // Monitor our own usage
    setInterval(() => {
      if (this.currentUsage > this.memoryBudget * 0.9) {
        this.handleMemoryPressure();
      }
    }, 5000);
  }

  createManagedTexture(width, height, format = this.gl.RGBA) {
    const bytes = this.estimateTextureMemory(width, height, format);
    
    if (this.currentUsage + bytes > this.memoryBudget) {
      this.evictLRUResources(bytes);
    }
    
    const texture = this.gl.createTexture();
    const id = this.generateId();
    
    this.resources.textures.set(id, {
      texture,
      width,
      height,
      format,
      bytes,
      lastUsed: Date.now(),
      refCount: 1,
      priority: 1
    });
    
    this.currentUsage += bytes;
    return { id, texture };
  }

  estimateTextureMemory(width, height, format) {
    const bytesPerPixel = {
      [this.gl.RGBA]: 4,
      [this.gl.RGB]: 3,
      [this.gl.LUMINANCE]: 1,
      [this.gl.ALPHA]: 1,
      [this.gl.LUMINANCE_ALPHA]: 2
    }[format] || 4;
    
    // Include mipmap overhead (33% additional)
    const baseSize = width * height * bytesPerPixel;
    return Math.floor(baseSize * 1.33);
  }

  evictLRUResources(bytesNeeded) {
    console.log(`Evicting resources to free ${bytesNeeded} bytes`);
    
    // Sort textures by LRU with unreferenced textures first
    const sortedTextures = Array.from(this.resources.textures.entries())
      .filter(([_, data]) => data.refCount === 0)
      .sort((a, b) => {
        // Prioritize by last used time and priority
        const priorityDiff = a[1].priority - b[1].priority;
        if (priorityDiff !== 0) return priorityDiff;
        return a[1].lastUsed - b[1].lastUsed;
      });
    
    let freedBytes = 0;
    for (const [id, data] of sortedTextures) {
      if (freedBytes >= bytesNeeded) break;
      
      this.gl.deleteTexture(data.texture);
      this.resources.textures.delete(id);
      freedBytes += data.bytes;
      this.currentUsage -= data.bytes;
      
      console.log(`Evicted texture ${id}, freed ${data.bytes} bytes`);
    }
    
    // If still need more space, evict buffers
    if (freedBytes < bytesNeeded) {
      this.evictLRUBuffers(bytesNeeded - freedBytes);
    }
  }

  evictLRUBuffers(bytesNeeded) {
    const sortedBuffers = Array.from(this.resources.buffers.entries())
      .sort((a, b) => a[1].lastUsed - b[1].lastUsed);
    
    let freedBytes = 0;
    for (const [id, data] of sortedBuffers) {
      if (freedBytes >= bytesNeeded) break;
      
      this.gl.deleteBuffer(data.buffer);
      this.resources.buffers.delete(id);
      freedBytes += data.bytes;
      this.currentUsage -= data.bytes;
    }
  }

  createManagedBuffer(data, usage = this.gl.STATIC_DRAW, priority = 1) {
    const buffer = this.gl.createBuffer();
    const bytes = data.byteLength;
    
    if (this.currentUsage + bytes > this.memoryBudget) {
      this.evictLRUResources(bytes);
    }
    
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, data, usage);
    
    const id = this.generateId();
    this.resources.buffers.set(id, {
      buffer,
      bytes,
      usage,
      lastUsed: Date.now(),
      priority
    });
    
    this.currentUsage += bytes;
    return { id, buffer };
  }

  createManagedProgram(vertexSource, fragmentSource) {
    const program = this.gl.createProgram();
    
    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentSource);
    
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);
    
    // Clean up shaders
    this.gl.deleteShader(vertexShader);
    this.gl.deleteShader(fragmentShader);
    
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      const error = this.gl.getProgramInfoLog(program);
      this.gl.deleteProgram(program);
      throw new Error(`Program linking failed: ${error}`);
    }
    
    const id = this.generateId();
    this.resources.programs.set(id, {
      program,
      lastUsed: Date.now(),
      vertexSource,
      fragmentSource
    });
    
    return { id, program };
  }

  createShader(type, source) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const error = this.gl.getShaderInfoLog(shader);
      this.gl.deleteShader(shader);
      throw new Error(`Shader compilation failed: ${error}`);
    }
    
    return shader;
  }

  handleMemoryPressure() {
    const now = Date.now();
    
    // Don't evict too frequently
    if (now - this.lastEvictionTime < 5000) return;
    
    console.warn('Memory pressure detected, clearing caches');
    this.lastEvictionTime = now;
    
    // Clear unused resources
    let freedBytes = 0;
    
    // Remove textures with 0 references
    for (const [id, data] of this.resources.textures) {
      if (data.refCount === 0 && now - data.lastUsed > 10000) { // 10s threshold
        this.gl.deleteTexture(data.texture);
        this.resources.textures.delete(id);
        this.currentUsage -= data.bytes;
        freedBytes += data.bytes;
      }
    }
    
    // Remove old buffers
    for (const [id, data] of this.resources.buffers) {
      if (now - data.lastUsed > 30000) { // 30s threshold
        this.gl.deleteBuffer(data.buffer);
        this.resources.buffers.delete(id);
        this.currentUsage -= data.bytes;
        freedBytes += data.bytes;
      }
    }
    
    console.log(`Memory pressure cleanup freed ${freedBytes} bytes`);
    
    // Notify callback if available
    if (this.onMemoryPressure) {
      this.onMemoryPressure();
    }
  }

  addRef(resourceId) {
    const texture = this.resources.textures.get(resourceId);
    if (texture) {
      texture.refCount++;
      texture.lastUsed = Date.now();
      return true;
    }
    return false;
  }

  release(resourceId) {
    const texture = this.resources.textures.get(resourceId);
    if (texture) {
      texture.refCount = Math.max(0, texture.refCount - 1);
      return true;
    }
    return false;
  }

  touch(resourceId) {
    const resources = [
      this.resources.textures,
      this.resources.buffers,
      this.resources.programs,
      this.resources.framebuffers
    ];
    
    for (const resourceMap of resources) {
      const resource = resourceMap.get(resourceId);
      if (resource) {
        resource.lastUsed = Date.now();
        return true;
      }
    }
    return false;
  }

  generateId() {
    return `resource_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getMemoryStats() {
    const stats = {
      used: this.currentUsage,
      budget: this.memoryBudget,
      usage: ((this.currentUsage / this.memoryBudget) * 100).toFixed(2) + '%',
      textureCount: this.resources.textures.size,
      bufferCount: this.resources.buffers.size,
      programCount: this.resources.programs.size,
      framebufferCount: this.resources.framebuffers.size,
      totalResources: Object.values(this.resources).reduce((sum, map) => sum + map.size, 0)
    };
    
    // Calculate texture memory breakdown
    let textureMemory = 0;
    for (const data of this.resources.textures.values()) {
      textureMemory += data.bytes;
    }
    stats.textureMemory = textureMemory;
    
    return stats;
  }

  dispose() {
    // Clean up all resources
    for (const [_, data] of this.resources.textures) {
      this.gl.deleteTexture(data.texture);
    }
    
    for (const [_, data] of this.resources.buffers) {
      this.gl.deleteBuffer(data.buffer);
    }
    
    for (const [_, data] of this.resources.programs) {
      this.gl.deleteProgram(data.program);
    }
    
    for (const [_, data] of this.resources.framebuffers) {
      this.gl.deleteFramebuffer(data.framebuffer);
    }
    
    // Clear maps
    Object.values(this.resources).forEach(map => map.clear());
    this.currentUsage = 0;
  }
}

export default UnifiedResourceManager;