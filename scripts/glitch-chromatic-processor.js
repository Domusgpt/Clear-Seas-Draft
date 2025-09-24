/*
 * GLITCH CHROMATIC PROCESSOR
 * Advanced chromatic aberration and digital glitch effects
 * For card metamorphosis chromatic occlusion enhancement
 */

class GlitchChromaticProcessor {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.animationFrame = null;
    this.time = 0;
    
    this.glitchIntensity = 0;
    this.chromaticShift = 0;
    this.digitalNoise = 0;
    this.scanlines = true;
    
    this.glitchPatterns = [];
    this.chromaticLayers = [];
    
    this.init();
  }
  
  init() {
    this.createGlitchCanvas();
    this.setupGlitchPatterns();
    this.startGlitchAnimation();
    
    console.log('⚡ Glitch Chromatic Processor - Digital corruption activated');
  }
  
  createGlitchCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 400;
      opacity: 0.6;
      mix-blend-mode: overlay;
    `;
    
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.ctx = this.canvas.getContext('2d');
    
    document.body.appendChild(this.canvas);
    
    window.addEventListener('resize', () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    });
  }
  
  setupGlitchPatterns() {
    // Create glitch interference patterns
    for (let i = 0; i < 5; i++) {
      this.glitchPatterns.push({
        frequency: Math.random() * 0.1 + 0.05,
        amplitude: Math.random() * 100 + 50,
        offset: Math.random() * Math.PI * 2,
        speed: Math.random() * 2 + 1,
        type: Math.random() > 0.5 ? 'horizontal' : 'vertical'
      });
    }
    
    // Setup chromatic layers (RGB separation)
    this.chromaticLayers = [
      { color: 'red', offsetX: 0, offsetY: 0, alpha: 0.7 },
      { color: 'green', offsetX: 0, offsetY: 0, alpha: 0.7 },
      { color: 'blue', offsetX: 0, offsetY: 0, alpha: 0.7 }
    ];
  }
  
  startGlitchAnimation() {
    const animate = () => {
      this.time += 0.016;
      this.updateGlitchEffects();
      this.renderGlitchEffects();
      this.animationFrame = requestAnimationFrame(animate);
    };
    
    animate();
  }
  
  updateGlitchEffects() {
    // Update chromatic aberration offsets
    const maxShift = this.chromaticShift * 8;
    
    this.chromaticLayers[0].offsetX = Math.sin(this.time * 2.3) * maxShift; // Red
    this.chromaticLayers[0].offsetY = Math.cos(this.time * 1.7) * maxShift * 0.5;
    
    this.chromaticLayers[1].offsetX = Math.sin(this.time * 3.1 + Math.PI) * maxShift * 0.7; // Green
    this.chromaticLayers[1].offsetY = Math.cos(this.time * 2.2 + Math.PI) * maxShift * 0.3;
    
    this.chromaticLayers[2].offsetX = Math.sin(this.time * 1.9 + Math.PI * 0.5) * maxShift * 0.9; // Blue
    this.chromaticLayers[2].offsetY = Math.cos(this.time * 2.8 + Math.PI * 0.5) * maxShift * 0.7;
    
    // Update glitch pattern parameters
    this.glitchPatterns.forEach(pattern => {
      pattern.currentOffset = pattern.offset + this.time * pattern.speed;
    });
  }
  
  renderGlitchEffects() {
    const { width, height } = this.canvas;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, width, height);
    
    if (this.glitchIntensity > 0.01) {
      // Render digital noise
      this.renderDigitalNoise();
      
      // Render glitch patterns
      this.renderGlitchPatterns();
      
      // Render scanlines
      if (this.scanlines && this.glitchIntensity > 0.1) {
        this.renderScanlines();
      }
    }
    
    if (this.chromaticShift > 0.01) {
      // Render chromatic aberration effects
      this.renderChromaticAberration();
    }
  }
  
  renderDigitalNoise() {
    const { width, height } = this.canvas;
    const noiseIntensity = this.digitalNoise * this.glitchIntensity;
    
    if (noiseIntensity < 0.01) return;
    
    // Create noise pattern
    const imageData = this.ctx.createImageData(width, height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      if (Math.random() < noiseIntensity * 0.1) {
        const brightness = Math.random() * 255;
        data[i] = brightness;     // Red
        data[i + 1] = brightness; // Green
        data[i + 2] = brightness; // Blue
        data[i + 3] = Math.random() * 100 * noiseIntensity; // Alpha
      } else {
        data[i + 3] = 0; // Transparent
      }
    }
    
    this.ctx.putImageData(imageData, 0, 0);
  }
  
  renderGlitchPatterns() {
    const { width, height } = this.canvas;
    
    this.glitchPatterns.forEach((pattern, index) => {
      const intensity = this.glitchIntensity * (0.3 + Math.random() * 0.7);
      const alpha = intensity * 0.8;
      
      if (alpha < 0.05) return;
      
      this.ctx.globalAlpha = alpha;
      
      if (pattern.type === 'horizontal') {
        // Horizontal glitch lines
        for (let y = 0; y < height; y += Math.random() * 10 + 5) {
          const glitchTest = Math.sin(y * pattern.frequency + pattern.currentOffset);
          
          if (Math.abs(glitchTest) > 0.7) {
            const glitchWidth = Math.random() * pattern.amplitude * intensity;
            const glitchHeight = Math.random() * 8 + 2;
            
            // Random color glitch
            const hue = Math.random() * 360;
            const saturation = 50 + Math.random() * 50;
            const lightness = 30 + Math.random() * 40;
            
            this.ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
            this.ctx.fillRect(
              Math.random() * width - glitchWidth * 0.5,
              y,
              glitchWidth,
              glitchHeight
            );
          }
        }
      } else {
        // Vertical glitch lines
        for (let x = 0; x < width; x += Math.random() * 15 + 10) {
          const glitchTest = Math.cos(x * pattern.frequency + pattern.currentOffset);
          
          if (Math.abs(glitchTest) > 0.8) {
            const glitchHeight = Math.random() * pattern.amplitude * intensity;
            const glitchWidth = Math.random() * 6 + 1;
            
            // Chromatic glitch colors
            const colors = ['#ff0040', '#00ff40', '#4000ff', '#ffff00', '#ff00ff', '#00ffff'];
            this.ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
            
            this.ctx.fillRect(
              x,
              Math.random() * height - glitchHeight * 0.5,
              glitchWidth,
              glitchHeight
            );
          }
        }
      }
    });
    
    this.ctx.globalAlpha = 1.0;
  }
  
  renderScanlines() {
    const { width, height } = this.canvas;
    const scanlineSpacing = 4;
    const scanlineAlpha = this.glitchIntensity * 0.3;
    
    this.ctx.globalAlpha = scanlineAlpha;
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    
    for (let y = 0; y < height; y += scanlineSpacing) {
      // Varying scanline intensity
      const scanlineIntensity = Math.sin(y * 0.1 + this.time * 5) * 0.5 + 0.5;
      
      if (scanlineIntensity > 0.3) {
        this.ctx.globalAlpha = scanlineAlpha * scanlineIntensity;
        this.ctx.fillRect(0, y, width, 1);
      }
    }
    
    this.ctx.globalAlpha = 1.0;
  }
  
  renderChromaticAberration() {
    const { width, height } = this.canvas;
    
    // Create chromatic streak effects
    this.chromaticLayers.forEach((layer, index) => {
      if (Math.abs(layer.offsetX) < 1 && Math.abs(layer.offsetY) < 1) return;
      
      this.ctx.globalAlpha = layer.alpha * this.chromaticShift;
      this.ctx.globalCompositeOperation = 'screen';
      
      // Draw chromatic streaks
      const streakCount = 20;
      for (let i = 0; i < streakCount; i++) {
        const x = (width / streakCount) * i + layer.offsetX * (i / streakCount);
        const y = Math.random() * height + layer.offsetY;
        
        const streakLength = Math.random() * 200 + 100;
        const streakWidth = Math.random() * 3 + 1;
        
        const gradient = this.ctx.createLinearGradient(x, y, x + streakLength, y);
        
        switch (layer.color) {
          case 'red':
            gradient.addColorStop(0, 'rgba(255, 0, 80, 0)');
            gradient.addColorStop(0.5, 'rgba(255, 0, 80, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 0, 80, 0)');
            break;
          case 'green':
            gradient.addColorStop(0, 'rgba(0, 255, 80, 0)');
            gradient.addColorStop(0.5, 'rgba(0, 255, 80, 0.8)');
            gradient.addColorStop(1, 'rgba(0, 255, 80, 0)');
            break;
          case 'blue':
            gradient.addColorStop(0, 'rgba(80, 100, 255, 0)');
            gradient.addColorStop(0.5, 'rgba(80, 100, 255, 0.8)');
            gradient.addColorStop(1, 'rgba(80, 100, 255, 0)');
            break;
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x, y, streakLength, streakWidth);
      }
    });
    
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.globalAlpha = 1.0;
  }
  
  // Card transformation integration methods
  activateGlitchForCard(cardElement, intensity = 1.0) {
    this.glitchIntensity = Math.min(1.0, this.glitchIntensity + intensity * 0.3);
    this.digitalNoise = Math.min(1.0, this.digitalNoise + intensity * 0.2);
    
    // Add temporary chromatic shift
    setTimeout(() => {
      this.chromaticShift = Math.min(1.0, this.chromaticShift + intensity * 0.4);
    }, 100);
  }
  
  createChromaticOcclusion(x, y, size, intensity = 1.0) {
    // Create localized chromatic occlusion effect
    const occlusionRadius = size * 2;
    
    this.ctx.save();
    this.ctx.globalAlpha = intensity * 0.6;
    this.ctx.globalCompositeOperation = 'screen';
    
    // Red layer
    const redGradient = this.ctx.createRadialGradient(
      x - 5, y - 3, 0,
      x - 5, y - 3, occlusionRadius
    );
    redGradient.addColorStop(0, 'rgba(255, 0, 100, 0.8)');
    redGradient.addColorStop(0.7, 'rgba(255, 0, 100, 0.3)');
    redGradient.addColorStop(1, 'rgba(255, 0, 100, 0)');
    
    this.ctx.fillStyle = redGradient;
    this.ctx.beginPath();
    this.ctx.arc(x - 5, y - 3, occlusionRadius, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Green layer
    const greenGradient = this.ctx.createRadialGradient(
      x + 3, y + 2, 0,
      x + 3, y + 2, occlusionRadius
    );
    greenGradient.addColorStop(0, 'rgba(0, 255, 100, 0.8)');
    greenGradient.addColorStop(0.7, 'rgba(0, 255, 100, 0.3)');
    greenGradient.addColorStop(1, 'rgba(0, 255, 100, 0)');
    
    this.ctx.fillStyle = greenGradient;
    this.ctx.beginPath();
    this.ctx.arc(x + 3, y + 2, occlusionRadius, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Blue layer
    const blueGradient = this.ctx.createRadialGradient(
      x + 2, y - 4, 0,
      x + 2, y - 4, occlusionRadius
    );
    blueGradient.addColorStop(0, 'rgba(100, 150, 255, 0.8)');
    blueGradient.addColorStop(0.7, 'rgba(100, 150, 255, 0.3)');
    blueGradient.addColorStop(1, 'rgba(100, 150, 255, 0)');
    
    this.ctx.fillStyle = blueGradient;
    this.ctx.beginPath();
    this.ctx.arc(x + 2, y - 4, occlusionRadius, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.restore();
  }
  
  setGlitchIntensity(intensity) {
    this.glitchIntensity = Math.max(0, Math.min(1, intensity));
  }
  
  setChromaticShift(shift) {
    this.chromaticShift = Math.max(0, Math.min(1, shift));
  }
  
  setDigitalNoise(noise) {
    this.digitalNoise = Math.max(0, Math.min(1, noise));
  }
  
  pulseGlitchEffect(duration = 1000) {
    const startIntensity = this.glitchIntensity;
    const startTime = Date.now();
    
    const pulse = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;
      
      if (progress < 1) {
        const intensity = startIntensity + Math.sin(progress * Math.PI * 4) * 0.5;
        this.setGlitchIntensity(intensity);
        requestAnimationFrame(pulse);
      } else {
        this.setGlitchIntensity(startIntensity);
      }
    };
    
    pulse();
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

// Initialize glitch chromatic processor
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    window.glitchChromatic = new GlitchChromaticProcessor();
    
    console.log('⚡ Glitch Chromatic Processor system initialized');
  }, 400);
});