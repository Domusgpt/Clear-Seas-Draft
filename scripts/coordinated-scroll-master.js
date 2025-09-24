/*
 * COORDINATED SCROLL MASTER
 * Works with MasterConductor to provide coordinated scroll management
 * Removes independent RAF loops and integrates with unified timing
 */

class CoordinatedScrollMaster {
  constructor(masterConductor) {
    this.masterConductor = masterConductor;
    this.zones = new Map();
    this.activeVisualizers = new Map();
    this.scrollHistory = [];
    this.currentZone = null;
    this.transitionZone = null;
    
    // Gesture detection
    this.gestureState = {
      isScrolling: false,
      velocity: 0,
      direction: 'none',
      inputType: 'unknown',
      intensity: 0
    };
    
    // Master scroll listener state - NO INDEPENDENT RAF!
    this.masterListenerActive = false;
    this.needsUpdate = false;
    
    this.init();
  }
  
  init() {
    this.defineScrollZones();
    this.setupMasterScrollListener();
    this.setupGestureDetection();
    this.createScrollIndicator();
    this.setupMobileOptimizer();
    
    // Register with master conductor for coordinated updates
    this.masterConductor.registerSystem('scrollMaster', this);
    
    console.log('🧠 Coordinated Scroll Master - Initialized with MasterConductor integration');
  }
  
  // COORDINATED UPDATE METHOD - Called by MasterConductor
  coordinatedUpdate(timing) {
    if (!this.needsUpdate) return;
    
    const startTime = performance.now();
    
    // Update gesture state
    this.updateScrollGesture(timing);
    
    // Determine current zone and sub-zone
    const currentScroll = window.scrollY;
    const newZone = this.determineCurrentZone(currentScroll);
    const subZone = this.determineSubZone(newZone, currentScroll);
    
    // Handle zone transitions
    if (newZone !== this.currentZone) {
      this.handleZoneTransition(this.currentZone, newZone);
      this.currentZone = newZone;
    }
    
    // Update visualizers based on sub-zone
    if (newZone) {
      this.updateVisualizersForSubZone(newZone, subZone, currentScroll, timing);
    }
    
    // Update zone CSS classes
    this.updateZoneClasses(newZone, subZone);
    
    // Update scroll indicator
    this.updateScrollIndicator(currentScroll);
    
    // Report performance back to conductor
    const frameTime = performance.now() - startTime;
    this.masterConductor.reportSystemPerformance('scrollMaster', frameTime);
    
    this.needsUpdate = false;
  }
  
  defineScrollZones() {
    const sectionOrder = ['hero', 'technology', 'portfolio', 'research', 'about', 'contact'];
    const zoneHeight = window.innerHeight;
    
    sectionOrder.forEach((sectionId, index) => {
      const startY = index * zoneHeight;
      
      this.zones.set(sectionId, {
        id: sectionId,
        element: document.getElementById(sectionId),
        startY: startY,
        endY: startY + zoneHeight,
        
        subZones: {
          entry: { start: startY, end: startY + (zoneHeight * 0.2) },
          development: { start: startY + (zoneHeight * 0.2), end: startY + (zoneHeight * 0.7) },
          flourish: { start: startY + (zoneHeight * 0.7), end: startY + (zoneHeight * 0.9) },
          transition: { start: startY + (zoneHeight * 0.9), end: startY + zoneHeight }
        },
        
        visualizerConfig: this.getVisualizerConfig(sectionId),
        
        isActive: false,
        isLoaded: false,
        visualizerInstance: null,
        canvasElements: [],
        
        maxCanvases: this.getMaxCanvasesForSection(sectionId),
        qualityLevel: 'auto'
      });
    });
    
    document.body.style.height = `${sectionOrder.length * zoneHeight}px`;
  }
  
  getVisualizerConfig(sectionId) {
    const configs = {
      hero: {
        type: 'polychora',
        canvasLayers: ['background', 'primary', 'effects', 'particles'],
        reactivity: { scrollSensitivity: 0.8, morphSpeed: 1.2, intensityRange: [0.3, 1.0] },
        effects: ['holographic', 'glitch', 'moire'],
        transitionStyle: 'dramatic'
      },
      technology: {
        type: 'quantum',
        canvasLayers: ['background', 'lattice', 'interference'],
        reactivity: { scrollSensitivity: 1.0, morphSpeed: 0.8, intensityRange: [0.2, 0.9] },
        effects: ['quantum-foam', 'lattice-distort'],
        transitionStyle: 'fluid'
      },
      portfolio: {
        type: 'faceted',
        canvasLayers: ['background', 'geometry'],
        reactivity: { scrollSensitivity: 0.6, morphSpeed: 1.5, intensityRange: [0.1, 0.8] },
        effects: ['geometric-morph'],
        transitionStyle: 'clean'
      },
      research: {
        type: 'holographic',
        canvasLayers: ['background', 'holo-primary', 'shimmer', 'depth'],
        reactivity: { scrollSensitivity: 1.2, morphSpeed: 0.9, intensityRange: [0.4, 1.0] },
        effects: ['holographic', 'depth-parallax', 'shimmer'],
        transitionStyle: 'immersive'
      },
      about: {
        type: 'minimal',
        canvasLayers: ['background'],
        reactivity: { scrollSensitivity: 0.3, morphSpeed: 2.0, intensityRange: [0.0, 0.5] },
        effects: ['subtle-glow'],
        transitionStyle: 'gentle'
      },
      contact: {
        type: 'interactive',
        canvasLayers: ['background', 'interactive'],
        reactivity: { scrollSensitivity: 0.9, morphSpeed: 1.1, intensityRange: [0.2, 1.0] },
        effects: ['interactive-response'],
        transitionStyle: 'responsive'
      }
    };
    
    return configs[sectionId] || configs.minimal;
  }
  
  getMaxCanvasesForSection(sectionId) {
    const limits = {
      hero: 4,
      technology: 3,
      portfolio: 2,
      research: 4,
      about: 1,
      contact: 2
    };
    
    const performanceMultiplier = this.masterConductor.getPerformanceMultiplier();
    return Math.floor(limits[sectionId] * performanceMultiplier);
  }
  
  setupMasterScrollListener() {
    // Single master scroll listener - NO INDEPENDENT RAF!
    window.addEventListener('scroll', this.handleMasterScroll.bind(this), { passive: true });
    window.addEventListener('wheel', this.handleWheelInput.bind(this), { passive: false });
    window.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    window.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: true });
    window.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    
    this.masterListenerActive = true;
    console.log('🎯 Coordinated scroll listener activated - Working with MasterConductor');
  }
  
  handleMasterScroll(event) {
    // Simply flag that we need an update - no independent RAF!
    this.needsUpdate = true;
  }
  
  updateScrollGesture(timing) {
    const now = timing.timestamp;
    const currentScroll = window.scrollY;
    
    this.scrollHistory.push({ y: currentScroll, time: now });
    
    if (this.scrollHistory.length > 10) {
      this.scrollHistory.shift();
    }
    
    if (this.scrollHistory.length >= 2) {
      const latest = this.scrollHistory[this.scrollHistory.length - 1];
      const previous = this.scrollHistory[this.scrollHistory.length - 2];
      
      const deltaY = latest.y - previous.y;
      const deltaTime = Math.max(latest.time - previous.time, 1);
      
      this.gestureState.velocity = Math.abs(deltaY / deltaTime);
      this.gestureState.direction = deltaY > 0 ? 'down' : 'up';
      this.gestureState.intensity = Math.min(this.gestureState.velocity / 2, 1.0);
    }
  }
  
  determineCurrentZone(scrollY) {
    for (const [zoneId, zone] of this.zones) {
      if (scrollY >= zone.startY && scrollY < zone.endY) {
        return zone;
      }
    }
    return null;
  }
  
  determineSubZone(zone, scrollY) {
    if (!zone) return null;
    
    const relativeY = scrollY - zone.startY;
    const zoneProgress = relativeY / (zone.endY - zone.startY);
    
    for (const [subZoneName, subZone] of Object.entries(zone.subZones)) {
      const subZoneStart = (subZone.start - zone.startY) / (zone.endY - zone.startY);
      const subZoneEnd = (subZone.end - zone.startY) / (zone.endY - zone.startY);
      
      if (zoneProgress >= subZoneStart && zoneProgress < subZoneEnd) {
        return {
          name: subZoneName,
          progress: (zoneProgress - subZoneStart) / (subZoneEnd - subZoneStart),
          globalProgress: zoneProgress
        };
      }
    }
    
    return null;
  }
  
  handleZoneTransition(oldZone, newZone) {
    console.log(`🌊 Zone transition: ${oldZone?.id || 'none'} → ${newZone?.id || 'none'}`);
    
    if (this.mobileOptimizer) {
      this.mobileOptimizer.enhanceZoneTransition(oldZone, newZone);
    }
    
    if (oldZone) {
      this.shutdownZoneVisualizers(oldZone);
    }
    
    if (newZone) {
      this.initializeZoneVisualizers(newZone);
    }
  }
  
  shutdownZoneVisualizers(zone) {
    if (zone.visualizerInstance) {
      console.log(`🔄 Shutting down visualizers for ${zone.id}`);
      
      this.fadeOutZoneEffects(zone, () => {
        zone.canvasElements.forEach(canvas => {
          if (canvas.getContext) {
            const ctx = canvas.getContext('webgl') || canvas.getContext('2d');
            if (ctx && ctx.clear) ctx.clear(ctx.COLOR_BUFFER_BIT);
          }
          canvas.remove();
        });
        
        zone.canvasElements = [];
        zone.visualizerInstance = null;
        zone.isActive = false;
      });
    }
  }
  
  initializeZoneVisualizers(zone) {
    if (zone.isActive) return;
    
    console.log(`✨ Initializing visualizers for ${zone.id}`);
    
    const config = zone.visualizerConfig;
    zone.visualizerInstance = this.createZoneVisualizer(zone, config);
    
    this.createZoneCanvases(zone, config);
    
    zone.isActive = true;
    zone.isLoaded = true;
    
    this.fadeInZoneEffects(zone);
  }
  
  createZoneVisualizer(zone, config) {
    const visualizerFactories = {
      polychora: () => new PolychoraZoneVisualizer(zone, config),
      quantum: () => new QuantumZoneVisualizer(zone, config),
      faceted: () => new FacetedZoneVisualizer(zone, config),
      holographic: () => new HolographicZoneVisualizer(zone, config),
      minimal: () => new MinimalZoneVisualizer(zone, config),
      interactive: () => new InteractiveZoneVisualizer(zone, config)
    };
    
    const factory = visualizerFactories[config.type] || visualizerFactories.minimal;
    return factory();
  }
  
  createZoneCanvases(zone, config) {
    const container = zone.element;
    if (!container) return;
    
    const canvasContainer = document.createElement('div');
    canvasContainer.className = 'zone-canvas-container';
    canvasContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: -1;
    `;
    
    config.canvasLayers.forEach((layerName, index) => {
      const canvas = document.createElement('canvas');
      canvas.id = `${zone.id}-${layerName}-canvas`;
      canvas.className = `zone-canvas zone-canvas-${layerName}`;
      
      canvas.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: ${index + 1};
        mix-blend-mode: ${this.getBlendModeForLayer(layerName)};
      `;
      
      const dpr = window.devicePixelRatio || 1;
      canvas.width = container.clientWidth * dpr;
      canvas.height = container.clientHeight * dpr;
      
      canvasContainer.appendChild(canvas);
      zone.canvasElements.push(canvas);
    });
    
    container.appendChild(canvasContainer);
  }
  
  getBlendModeForLayer(layerName) {
    const blendModes = {
      background: 'normal',
      primary: 'multiply',
      effects: 'screen',
      particles: 'lighter',
      lattice: 'overlay',
      interference: 'difference',
      shimmer: 'soft-light',
      depth: 'multiply'
    };
    
    return blendModes[layerName] || 'normal';
  }
  
  updateVisualizersForSubZone(zone, subZone, scrollY, timing) {
    if (!zone.visualizerInstance || !subZone) return;
    
    const params = this.calculateVisualizerParameters(zone, subZone, timing);
    
    zone.visualizerInstance.updateParameters(params);
    
    // Let MasterConductor handle rendering coordination
    this.masterConductor.requestVisualizerRender(zone.visualizerInstance);
  }
  
  calculateVisualizerParameters(zone, subZone, timing) {
    const config = zone.visualizerConfig;
    const reactivity = config.reactivity;
    
    const baseIntensity = this.interpolate(
      reactivity.intensityRange[0],
      reactivity.intensityRange[1],
      subZone.progress
    );
    
    const gestureMultiplier = 1 + (this.gestureState.intensity * 0.3);
    const velocityInfluence = Math.min(this.gestureState.velocity * 0.1, 0.5);
    
    const subZoneMultipliers = {
      entry: { intensity: 0.7, morph: 0.3, chaos: 0.1 },
      development: { intensity: 1.0, morph: 1.0, chaos: 0.5 },
      flourish: { intensity: 1.3, morph: 1.5, chaos: 0.8 },
      transition: { intensity: 0.8, morph: 0.6, chaos: 0.3 }
    };
    
    const multiplier = subZoneMultipliers[subZone.name] || subZoneMultipliers.development;
    
    return {
      intensity: baseIntensity * multiplier.intensity * gestureMultiplier,
      morphFactor: subZone.progress * multiplier.morph + velocityInfluence,
      chaos: subZone.progress * multiplier.chaos,
      hue: (subZone.globalProgress * 360) % 360,
      saturation: 0.7 + (this.gestureState.intensity * 0.3),
      speed: reactivity.morphSpeed * (1 + velocityInfluence),
      
      glitchIntensity: this.gestureState.intensity * 0.5,
      chromaticShift: this.gestureState.velocity * 0.02,
      
      qualityLevel: this.masterConductor.getQualityLevel(),
      maxParticles: this.masterConductor.getMaxParticlesForPerformance(),
      
      // Unified timing from conductor
      time: timing.elapsed,
      delta: timing.delta
    };
  }
  
  interpolate(start, end, progress) {
    return start + (end - start) * Math.max(0, Math.min(1, progress));
  }
  
  fadeOutZoneEffects(zone, callback) {
    if (!zone.element) {
      callback();
      return;
    }
    
    const container = zone.element.querySelector('.zone-canvas-container');
    if (container) {
      container.style.transition = 'opacity 0.8s ease-out';
      container.style.opacity = '0';
      
      setTimeout(callback, 800);
    } else {
      callback();
    }
  }
  
  fadeInZoneEffects(zone) {
    if (!zone.element) return;
    
    const container = zone.element.querySelector('.zone-canvas-container');
    if (container) {
      container.style.transition = 'opacity 1.2s ease-in';
      container.style.opacity = '1';
    }
  }
  
  setupGestureDetection() {
    this.handleWheelInput = (e) => {
      const delta = Math.abs(e.deltaY);
      
      if (delta < 10) {
        this.gestureState.inputType = 'trackpad';
      } else if (delta > 100) {
        this.gestureState.inputType = 'mouse';
      } else {
        this.gestureState.inputType = 'wheel';
      }
      
      const sensitivity = {
        trackpad: 0.6,
        mouse: 1.0,
        wheel: 0.8
      }[this.gestureState.inputType] || 1.0;
      
      this.gestureState.intensity = Math.min(delta * 0.01 * sensitivity, 1.0);
      this.needsUpdate = true;
    };
    
    this.touchStartY = 0;
    this.touchStartTime = 0;
    
    this.handleTouchStart = (e) => {
      this.gestureState.inputType = 'touch';
      this.touchStartY = e.touches[0].clientY;
      this.touchStartTime = performance.now();
      this.needsUpdate = true;
    };
    
    this.handleTouchMove = (e) => {
      if (e.touches.length > 1) {
        this.gestureState.inputType = 'multitouch';
        return;
      }
      
      const currentY = e.touches[0].clientY;
      const deltaY = this.touchStartY - currentY;
      const deltaTime = performance.now() - this.touchStartTime;
      
      this.gestureState.velocity = Math.abs(deltaY / Math.max(deltaTime, 1));
      this.gestureState.direction = deltaY > 0 ? 'up' : 'down';
      this.gestureState.intensity = Math.min(this.gestureState.velocity * 0.1, 1.0);
      this.needsUpdate = true;
    };
    
    this.handleTouchEnd = () => {
      const momentum = this.gestureState.velocity * 0.5;
      this.applyScrollMomentum(momentum);
    };
  }
  
  applyScrollMomentum(momentum) {
    const direction = this.gestureState.direction === 'down' ? 1 : -1;
    const scrollDistance = momentum * direction * 100;
    
    window.scrollBy({
      top: scrollDistance,
      behavior: 'smooth'
    });
  }
  
  createScrollIndicator() {
    this.scrollIndicator = new IntelligentScrollIndicator(this);
  }
  
  setupMobileOptimizer() {
    if (window.MobileTouchOptimizer) {
      this.mobileOptimizer = new MobileTouchOptimizer(this);
    }
    
    if (window.ZonePacingController) {
      this.zonePacingController = new ZonePacingController(this);
    }
  }
  
  updateScrollIndicator(scrollY) {
    if (this.scrollIndicator) {
      this.scrollIndicator.updateIndicator(scrollY);
    }
  }
  
  updateZoneClasses(zone, subZone) {
    if (!zone || !zone.element) return;
    
    zone.element.classList.remove('zone-active', 'subzone-entry', 'subzone-development', 'subzone-flourish', 'subzone-transition');
    
    zone.element.classList.add('zone-active');
    
    if (subZone) {
      zone.element.classList.add(`subzone-${subZone.name}`);
      
      if (this.gestureState.intensity > 0.5) {
        zone.element.classList.add('gesture-active');
        setTimeout(() => {
          zone.element.classList.remove('gesture-active');
        }, 200);
      }
      
      if (this.gestureState.intensity > 0.8) {
        zone.element.classList.add('gesture-intense');
        setTimeout(() => {
          zone.element.classList.remove('gesture-intense');
        }, 300);
      }
    }
  }
  
  // Method for MasterConductor to get current scroll state
  getScrollState() {
    return {
      currentZone: this.currentZone,
      gestureState: this.gestureState,
      activeVisualizers: this.activeVisualizers.size,
      needsUpdate: this.needsUpdate
    };
  }
  
  // Method for MasterConductor to control updates
  setUpdateFlag(value) {
    this.needsUpdate = value;
  }
  
  // Cleanup method for proper disposal
  destroy() {
    // Remove event listeners
    window.removeEventListener('scroll', this.handleMasterScroll);
    window.removeEventListener('wheel', this.handleWheelInput);
    window.removeEventListener('touchstart', this.handleTouchStart);
    window.removeEventListener('touchmove', this.handleTouchMove);
    window.removeEventListener('touchend', this.handleTouchEnd);
    
    // Shutdown all zones
    this.zones.forEach(zone => {
      if (zone.isActive) {
        this.shutdownZoneVisualizers(zone);
      }
    });
    
    // Clear references
    this.zones.clear();
    this.activeVisualizers.clear();
    
    console.log('🔄 Coordinated Scroll Master destroyed');
  }
}

// Export for MasterConductor
window.CoordinatedScrollMaster = CoordinatedScrollMaster;