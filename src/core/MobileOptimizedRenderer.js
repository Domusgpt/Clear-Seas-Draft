// src/core/MobileOptimizedRenderer.js
class MobileOptimizedRenderer {
  constructor(gl) {
    this.gl = gl;
    this.deviceProfile = this.detectDeviceCapabilities();
    this.qualitySettings = this.getQualitySettings();
    this.frameTimeTarget = 1000 / this.qualitySettings.targetFPS;
    this.performanceHistory = [];
    this.adaptationCooldown = 0;
  }

  detectDeviceCapabilities() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    
    const profile = {
      tier: 'low',
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      maxVertexAttributes: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
      maxTextureUnits: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
      isIOS: /iPhone|iPad/.test(navigator.userAgent),
      isAndroid: /Android/.test(navigator.userAgent),
      pixelRatio: Math.min(window.devicePixelRatio, 2), // Cap at 2 for mobile
      memory: this.estimateDeviceMemory()
    };

    // Run quick benchmark
    const benchmarkTime = this.runBenchmark(gl);
    
    if (benchmarkTime < 30) {
      profile.tier = 'high';
    } else if (benchmarkTime < 60) {
      profile.tier = 'medium';
    }
    
    return profile;
  }

  estimateDeviceMemory() {
    if (navigator.deviceMemory) {
      return navigator.deviceMemory;
    }
    
    // Fallback estimation based on user agent
    const isMobile = /Android|iPhone|iPad/.test(navigator.userAgent);
    return isMobile ? 2 : 4; // GB estimate
  }

  runBenchmark(gl) {
    const start = performance.now();
    
    // Simple triangle rendering benchmark
    const vertices = new Float32Array([-1,-1, 1,-1, 0,1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
    // Create simple shader
    const vertexShader = this.createShader(gl, gl.VERTEX_SHADER, `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `);
    
    const fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, `
      precision mediump float;
      void main() {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
      }
    `);
    
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);
    
    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    
    // Render 100 frames
    for (let i = 0; i < 100; i++) {
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    
    // Cleanup
    gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    
    return performance.now() - start;
  }

  createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  }

  getQualitySettings() {
    const settings = {
      high: {
        targetFPS: 60,
        maxCanvases: 10,
        textureResolution: 1.0,
        particleCount: 1000,
        shadowQuality: 'high',
        postProcessing: true,
        antialiasing: true,
        complexity: 1.0
      },
      medium: {
        targetFPS: 45,
        maxCanvases: 6,
        textureResolution: 0.75,
        particleCount: 500,
        shadowQuality: 'medium',
        postProcessing: false,
        antialiasing: false,
        complexity: 0.7
      },
      low: {
        targetFPS: 30,
        maxCanvases: 3,
        textureResolution: 0.5,
        particleCount: 200,
        shadowQuality: 'none',
        postProcessing: false,
        antialiasing: false,
        complexity: 0.4
      }
    };
    
    return settings[this.deviceProfile.tier];
  }

  adaptiveRender(renderCallback) {
    const frameStart = performance.now();
    
    // Render with current quality settings
    renderCallback(this.qualitySettings);
    
    const frameTime = performance.now() - frameStart;
    this.performanceHistory.push(frameTime);
    
    // Keep last 30 frames
    if (this.performanceHistory.length > 30) {
      this.performanceHistory.shift();
    }
    
    // Adjust quality based on performance (with cooldown)
    if (this.adaptationCooldown <= 0) {
      this.adjustQuality();
    } else {
      this.adaptationCooldown--;
    }
    
    return frameTime;
  }

  adjustQuality() {
    if (this.performanceHistory.length < 10) return;
    
    const avgFrameTime = this.performanceHistory.reduce((a, b) => a + b, 0) / 
                         this.performanceHistory.length;
    
    const targetTime = this.frameTimeTarget;
    
    if (avgFrameTime > targetTime * 1.3) {
      // Performance is poor, reduce quality
      this.reduceQuality();
      this.adaptationCooldown = 60; // 1 second cooldown at 60fps
    } else if (avgFrameTime < targetTime * 0.7) {
      // Performance is good, can increase quality
      this.increaseQuality();
      this.adaptationCooldown = 120; // 2 second cooldown at 60fps
    }
  }

  reduceQuality() {
    const settings = this.qualitySettings;
    
    // Reduce texture resolution first
    if (settings.textureResolution > 0.25) {
      settings.textureResolution = Math.max(0.25, settings.textureResolution - 0.1);
    }
    
    // Reduce particle count
    if (settings.particleCount > 100) {
      settings.particleCount = Math.max(100, Math.floor(settings.particleCount * 0.8));
    }
    
    // Reduce complexity
    if (settings.complexity > 0.2) {
      settings.complexity = Math.max(0.2, settings.complexity - 0.1);
    }
    
    // Disable post processing
    if (settings.postProcessing) {
      settings.postProcessing = false;
    }
    
    // Disable antialiasing
    if (settings.antialiasing) {
      settings.antialiasing = false;
    }
    
    console.log('Quality reduced:', settings);
  }

  increaseQuality() {
    const settings = this.qualitySettings;
    const originalSettings = this.getQualitySettings();
    
    // Increase texture resolution
    if (settings.textureResolution < originalSettings.textureResolution) {
      settings.textureResolution = Math.min(
        originalSettings.textureResolution,
        settings.textureResolution + 0.05
      );
    }
    
    // Increase particle count
    if (settings.particleCount < originalSettings.particleCount) {
      settings.particleCount = Math.min(
        originalSettings.particleCount,
        Math.floor(settings.particleCount * 1.1)
      );
    }
    
    // Increase complexity
    if (settings.complexity < originalSettings.complexity) {
      settings.complexity = Math.min(
        originalSettings.complexity,
        settings.complexity + 0.05
      );
    }
    
    // Enable features if performance allows
    if (!settings.postProcessing && originalSettings.postProcessing) {
      settings.postProcessing = true;
    }
    
    if (!settings.antialiasing && originalSettings.antialiasing) {
      settings.antialiasing = true;
    }
    
    console.log('Quality increased:', settings);
  }

  getPerformanceMetrics() {
    if (this.performanceHistory.length === 0) return null;
    
    const avgFrameTime = this.performanceHistory.reduce((a, b) => a + b, 0) / 
                         this.performanceHistory.length;
    const fps = 1000 / avgFrameTime;
    
    return {
      avgFrameTime: avgFrameTime.toFixed(2),
      fps: fps.toFixed(1),
      tier: this.deviceProfile.tier,
      textureResolution: this.qualitySettings.textureResolution,
      particleCount: this.qualitySettings.particleCount,
      complexity: this.qualitySettings.complexity
    };
  }

  isMobile() {
    return this.deviceProfile.isIOS || this.deviceProfile.isAndroid;
  }

  shouldUseLowPower() {
    return this.deviceProfile.tier === 'low' || this.deviceProfile.memory < 3;
  }

  getRecommendedCanvasSize() {
    const maxSize = Math.min(window.innerWidth, window.innerHeight);
    const multiplier = this.qualitySettings.textureResolution;
    
    return {
      width: Math.floor(window.innerWidth * multiplier),
      height: Math.floor(window.innerHeight * multiplier)
    };
  }
}

export default MobileOptimizedRenderer;