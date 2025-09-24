/*
 * UNIFIED EXPERIENCE ENGINE
 * 
 * The complete redesign of the coordination system from first principles.
 * This is NOT another wrapper around conflicting systems.
 * This IS a clean, elegant, unified system that replaces all the conflicts.
 * 
 * PHILOSOPHY: One source of truth, one update loop, one experience.
 */

class UnifiedExperienceEngine {
  constructor() {
    this.isActive = false;
    this.rafId = null;
    this.lastTime = 0;
    
    // SINGLE SOURCE OF TRUTH
    this.state = {
      // Scroll (unified, no conflicts)
      scroll: {
        y: 0,
        progress: 0, // 0-1 through entire document
        velocity: 0,
        direction: 'none',
        zone: null,
        subZone: null,
        isScrolling: false
      },
      
      // Mouse (unified tracking)
      mouse: {
        x: 0, y: 0,
        normalizedX: 0.5, normalizedY: 0.5, // 0-1 coordinates
        velocity: { x: 0, y: 0 },
        isMoving: false
      },
      
      // User interaction energy
      user: {
        energy: 0, // 0-100
        focusedElement: null,
        inputType: 'none', // mouse, touch, keyboard
        mood: 'exploration' // exploration, focus, creation, reflection
      },
      
      // Performance (adaptive quality)
      performance: {
        fps: 60,
        frameTime: 16,
        quality: 'high', // high, medium, low
        gpuTier: 'medium'
      },
      
      // Viewport
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: false,
        devicePixelRatio: window.devicePixelRatio || 1
      }
    };
    
    // Zone system (clean, no conflicts)
    this.zones = this.defineZones();
    this.visualizers = new Map();
    this.animations = new Set();
    
    // Performance monitoring
    this.frameHistory = [];
    this.performanceThresholds = {
      high: 16.67, // 60fps
      medium: 33.33, // 30fps
      low: 50 // 20fps
    };
    
    this.init();
  }
  
  init() {
    console.log('🎯 Unified Experience Engine - Starting clean initialization');
    
    // Kill ALL existing conflicting systems first
    this.killConflictingSystems();
    
    // Setup single event system
    this.setupUnifiedEventSystem();
    
    // Initialize zones and visualizers
    this.initializeZoneSystem();
    this.initializeVisualizerSystem();
    
    // Setup performance monitoring
    this.setupPerformanceMonitoring();
    
    // Start the single, unified update loop
    this.start();
    
    console.log('✅ Unified Experience Engine - All systems coordinated and running');
  }
  
  killConflictingSystems() {
    console.log('🔇 Killing ALL conflicting systems...');
    
    // Kill existing RAF loops
    const conflictingSystems = [
      'intelligentScrollMaster',
      'choreographedSystem', 
      'masterConductor',
      'smoothSnapController'
    ];
    
    conflictingSystems.forEach(systemName => {
      if (window[systemName]) {
        console.log(`💀 Destroying ${systemName}`);
        if (window[systemName].destroy) window[systemName].destroy();
        if (window[systemName].stop) window[systemName].stop();
        window[systemName] = null;
      }
    });
    
    // Override problematic functions temporarily
    const originalRAF = window.requestAnimationFrame;
    let rafCount = 0;
    
    window.requestAnimationFrame = function(callback) {
      rafCount++;
      if (rafCount > 3) {
        console.warn('⚠️ Blocking excess RAF calls to prevent conflicts');
        return -1;
      }
      return originalRAF.call(window, callback);
    };
    
    // Restore after initialization
    setTimeout(() => {
      window.requestAnimationFrame = originalRAF;
    }, 1000);
  }
  
  setupUnifiedEventSystem() {
    // SINGLE scroll listener (no conflicts)
    window.addEventListener('scroll', (e) => {
      this.updateScrollState();
    }, { passive: true });
    
    // SINGLE mouse listener
    document.addEventListener('mousemove', (e) => {
      this.updateMouseState(e);
    }, { passive: true });
    
    // User interaction tracking
    ['click', 'keydown', 'touchstart'].forEach(eventType => {
      document.addEventListener(eventType, (e) => {
        this.updateUserInteraction(e);
      }, { passive: true });
    });
    
    // Viewport changes
    window.addEventListener('resize', () => {
      this.updateViewportState();
    }, { passive: true });
    
    // Focus tracking
    document.addEventListener('focusin', (e) => {
      this.state.user.focusedElement = e.target;
      this.state.user.mood = 'focus';
    });
    
    document.addEventListener('focusout', () => {
      this.state.user.focusedElement = null;
      this.state.user.mood = 'exploration';
    });
  }
  
  defineZones() {
    const sections = ['hero', 'technology', 'portfolio', 'research', 'about', 'contact'];
    const zones = new Map();
    
    sections.forEach((sectionId, index) => {
      const element = document.getElementById(sectionId);
      if (!element) return;
      
      const rect = element.getBoundingClientRect();
      const offsetTop = window.scrollY + rect.top;
      
      zones.set(sectionId, {
        id: sectionId,
        element,
        startY: offsetTop,
        endY: offsetTop + element.offsetHeight,
        index,
        isActive: false,
        
        // Visualizer config
        visualizerConfig: this.getVisualizerConfig(sectionId),
        
        // Sub-zones for smooth transitions
        subZones: {
          entry: { progress: 0, end: 0.2 },
          development: { progress: 0.2, end: 0.7 },
          flourish: { progress: 0.7, end: 0.9 },
          exit: { progress: 0.9, end: 1.0 }
        }
      });
    });
    
    return zones;
  }
  
  getVisualizerConfig(sectionId) {
    const configs = {
      hero: {
        type: 'polychora',
        intensity: { base: 0.8, range: [0.6, 1.0] },
        reactivity: { scroll: 0.8, mouse: 0.6, energy: 0.9 }
      },
      technology: {
        type: 'quantum', 
        intensity: { base: 0.9, range: [0.7, 1.0] },
        reactivity: { scroll: 0.4, mouse: 0.8, energy: 0.3 }
      },
      portfolio: {
        type: 'faceted',
        intensity: { base: 0.6, range: [0.4, 0.8] },
        reactivity: { scroll: 0.6, mouse: 0.9, energy: 0.7 }
      },
      research: {
        type: 'holographic',
        intensity: { base: 1.0, range: [0.8, 1.0] },
        reactivity: { scroll: 0.5, mouse: 0.4, energy: 0.5 }
      },
      about: {
        type: 'minimal',
        intensity: { base: 0.3, range: [0.1, 0.5] },
        reactivity: { scroll: 0.3, mouse: 0.2, energy: 0.3 }
      },
      contact: {
        type: 'interactive',
        intensity: { base: 0.7, range: [0.5, 1.0] },
        reactivity: { scroll: 0.6, mouse: 0.8, energy: 0.6 }
      }
    };
    
    return configs[sectionId] || configs.minimal;
  }
  
  updateScrollState() {
    const newY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    
    // Update basic scroll state
    this.state.scroll.velocity = newY - this.state.scroll.y;
    this.state.scroll.y = newY;
    this.state.scroll.progress = maxScroll > 0 ? newY / maxScroll : 0;
    this.state.scroll.direction = this.state.scroll.velocity > 0 ? 'down' : 'up';
    this.state.scroll.isScrolling = true;
    
    // Clear scrolling state after delay
    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(() => {
      this.state.scroll.isScrolling = false;
    }, 100);
    
    // Update current zone
    this.updateCurrentZone();
  }
  
  updateCurrentZone() {
    const currentY = this.state.scroll.y + (this.state.viewport.height / 2);
    let activeZone = null;
    
    // Find current zone
    for (const [zoneId, zone] of this.zones) {
      if (currentY >= zone.startY && currentY <= zone.endY) {
        activeZone = zone;
        break;
      }
    }
    
    // Handle zone transitions
    if (activeZone !== this.state.scroll.zone) {
      this.transitionToZone(this.state.scroll.zone, activeZone);
      this.state.scroll.zone = activeZone;
    }
    
    // Update sub-zone
    if (activeZone) {
      const zoneProgress = (currentY - activeZone.startY) / (activeZone.endY - activeZone.startY);
      let currentSubZone = null;
      
      for (const [subZoneName, subZone] of Object.entries(activeZone.subZones)) {
        if (zoneProgress >= subZone.progress && zoneProgress < subZone.end) {
          currentSubZone = {
            name: subZoneName,
            progress: (zoneProgress - subZone.progress) / (subZone.end - subZone.progress),
            globalProgress: zoneProgress
          };
          break;
        }
      }
      
      this.state.scroll.subZone = currentSubZone;
    }
  }
  
  updateMouseState(event) {
    this.state.mouse.velocity.x = event.clientX - this.state.mouse.x;
    this.state.mouse.velocity.y = event.clientY - this.state.mouse.y;
    
    this.state.mouse.x = event.clientX;
    this.state.mouse.y = event.clientY;
    this.state.mouse.normalizedX = event.clientX / this.state.viewport.width;
    this.state.mouse.normalizedY = event.clientY / this.state.viewport.height;
    this.state.mouse.isMoving = true;
    
    clearTimeout(this.mouseTimeout);
    this.mouseTimeout = setTimeout(() => {
      this.state.mouse.isMoving = false;
    }, 50);
  }
  
  updateUserInteraction(event) {
    this.state.user.energy = Math.min(this.state.user.energy + 5, 100);
    
    if (event.type.startsWith('touch')) {
      this.state.user.inputType = 'touch';
    } else if (event.type.startsWith('key')) {
      this.state.user.inputType = 'keyboard';
    } else {
      this.state.user.inputType = 'mouse';
    }
    
    // Decay energy over time
    clearTimeout(this.energyTimeout);
    this.energyTimeout = setTimeout(() => {
      this.state.user.energy = Math.max(this.state.user.energy - 2, 0);
    }, 1000);
    
    // Update mood based on interaction pattern
    this.updateMood();
  }
  
  updateMood() {
    const scrollSpeed = Math.abs(this.state.scroll.velocity);
    const mouseSpeed = Math.sqrt(
      this.state.mouse.velocity.x ** 2 + this.state.mouse.velocity.y ** 2
    );
    
    if (scrollSpeed > 10 || mouseSpeed > 50) {
      this.state.user.mood = 'exploration';
    } else if (this.state.user.focusedElement) {
      this.state.user.mood = 'focus';
    } else if (this.state.user.energy > 50) {
      this.state.user.mood = 'creation';
    } else {
      this.state.user.mood = 'reflection';
    }
  }
  
  updateViewportState() {
    this.state.viewport.width = window.innerWidth;
    this.state.viewport.height = window.innerHeight;
    this.state.viewport.devicePixelRatio = window.devicePixelRatio || 1;
    this.state.viewport.isMobile = window.innerWidth <= 768;
    
    // Recalculate zones on resize
    this.zones = this.defineZones();
  }
  
  transitionToZone(oldZone, newZone) {
    if (oldZone) {
      oldZone.isActive = false;
      oldZone.element.classList.remove('zone-active');
      console.log(`🌊 Zone exit: ${oldZone.id}`);
    }
    
    if (newZone) {
      newZone.isActive = true;
      newZone.element.classList.add('zone-active');
      this.activateZoneVisualizer(newZone);
      console.log(`🌊 Zone enter: ${newZone.id}`);
    }
  }
  
  initializeZoneSystem() {
    // Add zone classes to elements
    this.zones.forEach((zone, zoneId) => {
      zone.element.setAttribute('data-zone', zoneId);
      zone.element.classList.add('unified-zone');
    });
  }
  
  initializeVisualizerSystem() {
    // Initialize visualizers for each zone
    this.zones.forEach((zone, zoneId) => {
      const iframe = zone.element.querySelector('iframe[src*="vib34d"]');
      if (iframe) {
        this.visualizers.set(zoneId, {
          iframe,
          config: zone.visualizerConfig,
          baseUrl: iframe.src.split('?')[0],
          currentParams: this.extractUrlParams(iframe.src),
          isActive: false
        });
      }
    });
  }
  
  activateZoneVisualizer(zone) {
    const visualizer = this.visualizers.get(zone.id);
    if (visualizer) {
      visualizer.isActive = true;
      this.updateVisualizerParams(visualizer, zone);
    }
  }
  
  updateVisualizerParams(visualizer, zone) {
    if (!visualizer || !visualizer.isActive) return;
    
    const config = visualizer.config;
    const subZone = this.state.scroll.subZone;
    
    // Calculate reactive parameters
    const scrollInfluence = this.state.scroll.progress * config.reactivity.scroll;
    const mouseInfluence = Math.abs(this.state.mouse.normalizedX - 0.5) * 2 * config.reactivity.mouse;
    const energyInfluence = (this.state.user.energy / 100) * config.reactivity.energy;
    
    const totalInfluence = (scrollInfluence + mouseInfluence + energyInfluence) / 3;
    
    // Calculate intensity based on sub-zone
    let intensity = config.intensity.base;
    if (subZone) {
      const intensityRange = config.intensity.range;
      intensity = this.lerp(intensityRange[0], intensityRange[1], totalInfluence);
      
      // Sub-zone modifiers
      const subZoneMultipliers = {
        entry: 0.7,
        development: 1.0,
        flourish: 1.3,
        exit: 0.8
      };
      
      intensity *= subZoneMultipliers[subZone.name] || 1.0;
    }
    
    // Update visualizer URL with new parameters
    const params = new URLSearchParams();
    params.set('intensity', intensity.toFixed(3));
    params.set('morphFactor', (totalInfluence * 2).toFixed(3));
    params.set('mood', this.state.user.mood);
    params.set('quality', this.state.performance.quality);
    
    const newUrl = `${visualizer.baseUrl}?${params.toString()}`;
    if (visualizer.iframe.src !== newUrl) {
      visualizer.iframe.src = newUrl;
    }
  }
  
  extractUrlParams(url) {
    const urlParams = new URLSearchParams(url.split('?')[1] || '');
    return {
      intensity: parseFloat(urlParams.get('intensity')) || 0.8,
      morphFactor: parseFloat(urlParams.get('morphFactor')) || 1.0
    };
  }
  
  setupPerformanceMonitoring() {
    // Detect initial performance tier
    this.detectPerformanceTier();
    
    // Start performance monitoring
    this.performanceCheckInterval = setInterval(() => {
      this.checkPerformance();
    }, 1000);
  }
  
  detectPerformanceTier() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    
    if (!gl) {
      this.state.performance.gpuTier = 'low';
      this.state.performance.quality = 'low';
      return;
    }
    
    const renderer = gl.getParameter(gl.RENDERER) || '';
    const memory = navigator.deviceMemory || 4;
    
    if (renderer.includes('NVIDIA') || renderer.includes('AMD')) {
      this.state.performance.gpuTier = 'high';
    } else if (renderer.includes('Intel Iris') || renderer.includes('Apple')) {
      this.state.performance.gpuTier = 'medium';
    } else {
      this.state.performance.gpuTier = 'low';
    }
    
    // Set initial quality based on tier and memory
    if (this.state.performance.gpuTier === 'high' && memory >= 8) {
      this.state.performance.quality = 'high';
    } else if (this.state.performance.gpuTier === 'medium' || memory >= 4) {
      this.state.performance.quality = 'medium';
    } else {
      this.state.performance.quality = 'low';
    }
    
    console.log(`🎯 Performance tier: ${this.state.performance.gpuTier}, Quality: ${this.state.performance.quality}`);
  }
  
  checkPerformance() {
    const avgFrameTime = this.frameHistory.reduce((a, b) => a + b, 0) / this.frameHistory.length;
    this.state.performance.fps = 1000 / avgFrameTime;
    this.state.performance.frameTime = avgFrameTime;
    
    // Adjust quality based on performance
    if (avgFrameTime > this.performanceThresholds.medium && this.state.performance.quality === 'high') {
      this.adjustQuality('medium');
    } else if (avgFrameTime > this.performanceThresholds.low && this.state.performance.quality === 'medium') {
      this.adjustQuality('low');
    } else if (avgFrameTime < this.performanceThresholds.high && this.state.performance.quality !== 'high') {
      this.adjustQuality('high');
    }
  }
  
  adjustQuality(newQuality) {
    this.state.performance.quality = newQuality;
    console.log(`📊 Performance adjusted to: ${newQuality}`);
    
    // Update all active visualizers
    this.visualizers.forEach((visualizer, zoneId) => {
      if (visualizer.isActive) {
        const zone = this.zones.get(zoneId);
        this.updateVisualizerParams(visualizer, zone);
      }
    });
  }
  
  // SINGLE UPDATE LOOP - NO CONFLICTS
  start() {
    if (this.isActive) return;
    this.isActive = true;
    
    const update = (currentTime) => {
      if (!this.isActive) return;
      
      const deltaTime = currentTime - this.lastTime;
      this.lastTime = currentTime;
      
      // Track frame time for performance monitoring
      this.frameHistory.push(deltaTime);
      if (this.frameHistory.length > 60) {
        this.frameHistory.shift();
      }
      
      // Update CSS custom properties for reactive styling
      this.updateCSSProperties();
      
      // Update all active visualizers
      this.updateActiveVisualizers();
      
      // Continue the loop
      this.rafId = requestAnimationFrame(update);
    };
    
    this.rafId = requestAnimationFrame(update);
    console.log('▶️ Unified Experience Engine - Update loop started');
  }
  
  updateCSSProperties() {
    const root = document.documentElement;
    
    // Update scroll-based properties
    root.style.setProperty('--scroll-y', `${this.state.scroll.y}px`);
    root.style.setProperty('--scroll-progress', this.state.scroll.progress);
    
    // Update mouse-based properties
    root.style.setProperty('--mouse-x', this.state.mouse.normalizedX);
    root.style.setProperty('--mouse-y', this.state.mouse.normalizedY);
    
    // Update user energy
    root.style.setProperty('--user-energy', this.state.user.energy / 100);
    
    // Update performance quality
    root.style.setProperty('--quality-multiplier', this.getQualityMultiplier());
  }
  
  getQualityMultiplier() {
    const multipliers = { high: 1.0, medium: 0.7, low: 0.4 };
    return multipliers[this.state.performance.quality] || 0.7;
  }
  
  updateActiveVisualizers() {
    this.visualizers.forEach((visualizer, zoneId) => {
      if (visualizer.isActive) {
        const zone = this.zones.get(zoneId);
        this.updateVisualizerParams(visualizer, zone);
      }
    });
  }
  
  // Utility function
  lerp(a, b, t) {
    return a + (b - a) * Math.max(0, Math.min(1, t));
  }
  
  // Stop the engine
  stop() {
    this.isActive = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    
    if (this.performanceCheckInterval) {
      clearInterval(this.performanceCheckInterval);
    }
    
    console.log('⏹️ Unified Experience Engine - Stopped');
  }
  
  // Get current state (for debugging)
  getState() {
    return { ...this.state };
  }
}

// Initialize the Unified Experience Engine
document.addEventListener('DOMContentLoaded', () => {
  // Wait for all other scripts to load, then take complete control
  setTimeout(() => {
    window.unifiedEngine = new UnifiedExperienceEngine();
    
    // Global access for debugging
    window.getEngineState = () => window.unifiedEngine.getState();
    
    console.log('🎯 Unified Experience Engine - Ready for elegant coordination');
  }, 100);
});

// Make available globally
window.UnifiedExperienceEngine = UnifiedExperienceEngine;