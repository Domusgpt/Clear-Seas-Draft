/**
 * UnifiedCanvasManager - Single master canvas with viewport management
 * Replaces 20+ WebGL contexts with 1 master context + framebuffers
 * Based on compass artifact specifications
 */

export class UnifiedCanvasManager {
  constructor() {
    this.masterCanvas = document.createElement('canvas');
    this.masterCanvas.style.position = 'fixed';
    this.masterCanvas.style.width = '100%';
    this.masterCanvas.style.height = '100%';
    this.masterCanvas.style.zIndex = '-1';
    this.masterCanvas.style.top = '0';
    this.masterCanvas.style.left = '0';
    document.body.appendChild(this.masterCanvas);
    
    this.gl = this.masterCanvas.getContext('webgl2', {
      antialias: false, // Use FXAA instead for mobile
      alpha: true,
      powerPreference: 'low-power',
      preserveDrawingBuffer: false
    });
    
    if (!this.gl) {
      // Fallback to WebGL1
      this.gl = this.masterCanvas.getContext('webgl', {
        antialias: false,
        alpha: true,
        powerPreference: 'low-power',
        preserveDrawingBuffer: false
      });
    }
    
    this.viewports = new Map();
    this.activeSystem = null;
    this.frameBuffers = new Map();
    
    console.log('🎯 UnifiedCanvasManager: Single WebGL context created');
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  registerVisualizationSystem(systemId, element, renderCallback) {
    const canvas2d = document.createElement('canvas');
    canvas2d.style.position = 'absolute';
    canvas2d.style.top = '0';
    canvas2d.style.left = '0';
    canvas2d.style.width = '100%';
    canvas2d.style.height = '100%';
    canvas2d.style.pointerEvents = 'none';
    element.appendChild(canvas2d);
    
    // Get proper dimensions - fallback to window size if element has no size
    let width = element.clientWidth;
    let height = element.clientHeight;
    
    if (width === 0 || height === 0) {
      width = window.innerWidth - 300; // Account for control panel
      height = window.innerHeight - 50; // Account for top bar
      console.log(`📐 Using fallback dimensions for ${systemId}: ${width}x${height}`);
    }
    
    // Create framebuffer for this system
    const fbo = this.createFramebuffer(width, height);
    
    this.viewports.set(systemId, {
      element,
      canvas2d,
      renderCallback,
      framebuffer: fbo,
      dirty: true
    });
    
    console.log(`📦 Registered system: ${systemId}`);
    return systemId;
  }

  createFramebuffer(width, height) {
    const fbo = this.gl.createFramebuffer();
    const texture = this.gl.createTexture();
    
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 
                       width, height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, fbo);
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, 
                                  this.gl.TEXTURE_2D, texture, 0);
    
    // Check framebuffer status
    if (this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER) !== this.gl.FRAMEBUFFER_COMPLETE) {
      console.error('Framebuffer not complete');
    }
    
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    return { fbo, texture, width, height };
  }

  render() {
    this.resizeIfNeeded();
    
    for (const [systemId, viewport] of this.viewports) {
      if (!viewport.dirty) continue;
      
      const rect = viewport.element.getBoundingClientRect();
      
      // Skip if not visible
      if (rect.bottom < 0 || rect.top > window.innerHeight) continue;
      
      // Render to framebuffer
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, viewport.framebuffer.fbo);
      this.gl.viewport(0, 0, viewport.framebuffer.width, viewport.framebuffer.height);
      
      // Switch active system context
      this.activeSystem = systemId;
      viewport.renderCallback(this.gl, systemId);
      
      // Copy to 2D canvas for display
      this.copyToCanvas2D(viewport);
      viewport.dirty = false;
    }
    
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    requestAnimationFrame(() => this.render());
  }

  copyToCanvas2D(viewport) {
    const { canvas2d, framebuffer } = viewport;
    const ctx = canvas2d.getContext('2d');
    
    if (!ctx) return;
    
    // Resize 2D canvas to match container
    const rect = viewport.element.getBoundingClientRect();
    canvas2d.width = rect.width;
    canvas2d.height = rect.height;
    
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer.fbo);
    
    // Read pixels from framebuffer
    const pixels = new Uint8Array(framebuffer.width * framebuffer.height * 4);
    this.gl.readPixels(0, 0, framebuffer.width, framebuffer.height, 
                       this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels);
    
    // Flip vertically and draw to 2D canvas
    const imageData = new ImageData(new Uint8ClampedArray(pixels), 
                                     framebuffer.width, framebuffer.height);
    
    // Create temporary canvas for vertical flip
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = framebuffer.width;
    tempCanvas.height = framebuffer.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.putImageData(imageData, 0, 0);
    
    // Draw flipped to final canvas
    ctx.save();
    ctx.scale(1, -1);
    ctx.translate(0, -canvas2d.height);
    ctx.drawImage(tempCanvas, 0, 0, canvas2d.width, canvas2d.height);
    ctx.restore();
  }

  resizeCanvas() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    
    this.masterCanvas.width = width * dpr;
    this.masterCanvas.height = height * dpr;
    this.masterCanvas.style.width = width + 'px';
    this.masterCanvas.style.height = height + 'px';
    
    if (this.gl) {
      this.gl.viewport(0, 0, this.masterCanvas.width, this.masterCanvas.height);
    }
  }

  resizeIfNeeded() {
    const rect = this.masterCanvas.getBoundingClientRect();
    if (rect.width !== this.masterCanvas.width || rect.height !== this.masterCanvas.height) {
      this.resizeCanvas();
    }
  }

  markDirty(systemId) {
    const viewport = this.viewports.get(systemId);
    if (viewport) {
      viewport.dirty = true;
    }
  }

  dispose() {
    // Clean up framebuffers
    for (const [_, viewport] of this.viewports) {
      this.gl.deleteFramebuffer(viewport.framebuffer.fbo);
      this.gl.deleteTexture(viewport.framebuffer.texture);
    }
    
    // Remove master canvas
    if (this.masterCanvas.parentNode) {
      this.masterCanvas.parentNode.removeChild(this.masterCanvas);
    }
    
    console.log('🧹 UnifiedCanvasManager disposed');
  }
}