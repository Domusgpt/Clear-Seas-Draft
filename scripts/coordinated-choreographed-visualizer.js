/*
 * COORDINATED CHOREOGRAPHED VISUALIZER
 * Works with MasterConductor for totalistic reactive system
 * Removes independent RAF loops and integrates with unified timing
 */

class CoordinatedChoreographedVisualizerSystem {
  constructor(masterConductor) {
    this.masterConductor = masterConductor;
    this.visualizers = new Map();
    this.activeScenes = new Map();
    this.globalState = {
      scrollProgress: 0,
      mousePosition: { x: 0, y: 0 },
      focusedElement: null,
      userEnergy: 0,
      timeOfDay: this.getTimeOfDay(),
      currentMood: 'exploration'
    };

    this.scenes = {
      'hero': {
        geometry: 'polychora',
        parameters: { 
          morphFactor: 1.0, 
          intensity: 0.8, 
          rotationSpeed: 0.002,
          particleDensity: 0.7 
        },
        reactivity: 'cosmic'
      },
      'technology': {
        geometry: 'faceted',
        parameters: { 
          morphFactor: 0.5, 
          intensity: 0.9, 
          rotationSpeed: 0.001,
          particleDensity: 0.5 
        },
        reactivity: 'precision'
      },
      'portfolio': {
        geometry: 'quantum',
        parameters: { 
          morphFactor: 1.5, 
          intensity: 0.6, 
          rotationSpeed: 0.003,
          particleDensity: 0.8 
        },
        reactivity: 'creative'
      },
      'research': {
        geometry: 'holographic',
        parameters: { 
          morphFactor: 2.0, 
          intensity: 1.0, 
          rotationSpeed: 0.001,
          particleDensity: 0.9 
        },
        reactivity: 'analytical'
      }
    };

    // Flags for coordinated updates
    this.needsScrollUpdate = false;
    this.needsMouseUpdate = false;
    this.needsParameterUpdate = false;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupVisualizerObservers();
    this.setupReactivitySystem();
    
    // Register with master conductor for coordinated updates
    this.masterConductor.registerSystem('choreographedVisualizer', this);
    
    console.log('🎭 Coordinated Choreographed Visualizer - Initialized with MasterConductor integration');
  }

  // COORDINATED UPDATE METHOD - Called by MasterConductor
  coordinatedUpdate(timing) {
    const startTime = performance.now();
    
    // Update global state with coordinated timing
    this.updateGlobalState(timing);
    
    // Process scroll updates if needed
    if (this.needsScrollUpdate) {
      this.updateScrollChoreography(timing);
      this.needsScrollUpdate = false;
    }
    
    // Process mouse updates if needed
    if (this.needsMouseUpdate) {
      this.updateMouseChoreography();
      this.needsMouseUpdate = false;
    }
    
    // Update visualizer parameters
    this.updateVisualizerParameters(timing);
    
    // Update complementary elements
    this.updateComplementaryElements(timing);
    
    // Report performance back to conductor
    const frameTime = performance.now() - startTime;
    this.masterConductor.reportSystemPerformance('choreographedVisualizer', frameTime);
  }

  setupEventListeners() {
    // Scroll choreography - NO INDEPENDENT RAF!
    window.addEventListener('scroll', () => {
      this.needsScrollUpdate = true;
    });

    // Mouse choreography - NO INDEPENDENT RAF!
    document.addEventListener('mousemove', (e) => {
      this.globalState.mousePosition = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1
      };
      this.needsMouseUpdate = true;
    });

    // Focus choreography
    document.addEventListener('focusin', (e) => {
      this.updateFocusChoreography(e.target, 'focus');
    });

    document.addEventListener('focusout', (e) => {
      this.updateFocusChoreography(null, 'unfocus');
    });

    // Interaction energy tracking
    ['click', 'keydown', 'touchstart'].forEach(event => {
      document.addEventListener(event, () => {
        this.incrementUserEnergy();
      });
    });

    // Window visibility changes
    document.addEventListener('visibilitychange', () => {
      this.updateMoodBasedOnVisibility();
    });
  }

  setupVisualizerObservers() {
    // Enhanced intersection observer for scene transitions
    this.sceneObserver = new IntersectionObserver(
      (entries) => this.handleSceneTransitions(entries),
      {
        root: null,
        rootMargin: '-20% 0px -20% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1.0]
      }
    );

    // Observe all sections
    document.querySelectorAll('section[data-scene]').forEach(section => {
      this.sceneObserver.observe(section);
    });

    // Find and register all visualizer iframes
    this.registerVisualizers();
  }

  registerVisualizers() {
    document.querySelectorAll('iframe[src*="vib34d-ultimate-viewer"]').forEach((iframe, index) => {
      const container = iframe.closest('[data-scene]') || iframe.closest('section');
      const sceneId = container?.dataset.scene || container?.id || `scene-${index}`;
      
      const visualizer = {
        iframe,
        container,
        sceneId,
        baseUrl: iframe.src.split('?')[0],
        currentParams: this.extractParamsFromUrl(iframe.src),
        targetParams: { ...this.scenes[sceneId]?.parameters || {} },
        isActive: false,
        needsUpdate: false
      };

      this.visualizers.set(`${sceneId}-${index}`, visualizer);
      console.log(`🎨 Registered coordinated visualizer: ${sceneId}-${index}`);
    });
  }

  extractParamsFromUrl(url) {
    const urlParams = new URLSearchParams(url.split('?')[1] || '');
    return {
      system: urlParams.get('system') || 'polychora',
      geometry: parseInt(urlParams.get('geometry')) || 0,
      morphFactor: parseFloat(urlParams.get('morphFactor')) || 1.0,
      intensity: parseFloat(urlParams.get('intensity')) || 0.8,
      rotationSpeed: parseFloat(urlParams.get('rotationSpeed')) || 0.002,
      particleDensity: parseFloat(urlParams.get('particleDensity')) || 0.7
    };
  }

  setupReactivitySystem() {
    // Create reactive parameter mappings
    this.reactiveParams = {
      'cosmic': {
        scrollInfluence: 0.8,
        mouseInfluence: 0.6,
        energyInfluence: 0.9,
        morphRange: [0.5, 2.0],
        intensityRange: [0.6, 1.0],
        speedRange: [0.001, 0.005]
      },
      'precision': {
        scrollInfluence: 0.4,
        mouseInfluence: 0.8,
        energyInfluence: 0.3,
        morphRange: [0.2, 0.8],
        intensityRange: [0.7, 1.0],
        speedRange: [0.0005, 0.002]
      },
      'creative': {
        scrollInfluence: 0.6,
        mouseInfluence: 0.9,
        energyInfluence: 0.7,
        morphRange: [1.0, 3.0],
        intensityRange: [0.5, 1.2],
        speedRange: [0.002, 0.008]
      },
      'analytical': {
        scrollInfluence: 0.5,
        mouseInfluence: 0.4,
        energyInfluence: 0.5,
        morphRange: [1.5, 2.5],
        intensityRange: [0.8, 1.0],
        speedRange: [0.0008, 0.003]
      }
    };
  }

  updateScrollChoreography(timing) {
    // Calculate scroll progress (0-1)
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    this.globalState.scrollProgress = Math.min(window.scrollY / scrollHeight, 1);

    // Update mood based on scroll behavior
    this.updateScrollMood();

    // Trigger section-specific scroll reactions
    this.triggerScrollReactions();
  }

  updateMouseChoreography() {
    // Create ripple effects
    this.createMouseRipples(
      (this.globalState.mousePosition.x + 1) * window.innerWidth / 2,
      (this.globalState.mousePosition.y + 1) * window.innerHeight / 2
    );
  }

  updateFocusChoreography(element, action) {
    this.globalState.focusedElement = element;
    
    if (action === 'focus' && element) {
      this.intensifyRelatedVisualizers(element);
      this.createFocusAura(element);
    } else {
      this.normalizeAllVisualizers();
    }
  }

  handleSceneTransitions(entries) {
    entries.forEach(entry => {
      const sceneId = entry.target.dataset.scene || entry.target.id;
      const isEntering = entry.isIntersecting;
      const visibility = entry.intersectionRatio;

      if (isEntering && visibility > 0.5) {
        this.activateScene(sceneId, visibility);
      } else if (!isEntering || visibility < 0.1) {
        this.deactivateScene(sceneId);
      }

      this.updateSceneTransition(sceneId, visibility);
    });
  }

  activateScene(sceneId, intensity = 1.0) {
    console.log(`🎬 Activating coordinated scene: ${sceneId} (intensity: ${intensity})`);
    
    this.activeScenes.set(sceneId, {
      intensity,
      activatedAt: Date.now(),
      dominance: intensity
    });

    // Update visualizers for this scene
    this.visualizers.forEach((visualizer, id) => {
      if (visualizer.sceneId === sceneId) {
        this.activateVisualizer(visualizer, intensity);
      }
    });

    this.triggerSceneEffects(sceneId, 'enter');
  }

  deactivateScene(sceneId) {
    if (this.activeScenes.has(sceneId)) {
      console.log(`🎭 Deactivating coordinated scene: ${sceneId}`);
      this.activeScenes.delete(sceneId);
      
      this.visualizers.forEach((visualizer, id) => {
        if (visualizer.sceneId === sceneId) {
          this.deactivateVisualizer(visualizer);
        }
      });

      this.triggerSceneEffects(sceneId, 'exit');
    }
  }

  updateSceneTransition(sceneId, visibility) {
    const scene = this.scenes[sceneId];
    if (!scene) return;

    if (this.activeScenes.has(sceneId)) {
      const sceneData = this.activeScenes.get(sceneId);
      sceneData.intensity = visibility;
      this.activeScenes.set(sceneId, sceneData);
    }

    // Update related visualizers with transition intensity - NO INDEPENDENT RAF!
    this.visualizers.forEach((visualizer, id) => {
      if (visualizer.sceneId === sceneId && visualizer.isActive) {
        const transitionParams = this.calculateReactiveParams(scene, visibility);
        
        Object.entries(transitionParams).forEach(([key, targetValue]) => {
          if (visualizer.currentParams[key] !== undefined) {
            const currentValue = visualizer.currentParams[key];
            const lerpFactor = 0.1;
            visualizer.currentParams[key] = currentValue + (targetValue - currentValue) * lerpFactor;
          }
        });
        
        visualizer.needsUpdate = true;
      }
    });
  }

  activateVisualizer(visualizer, intensity = 1.0) {
    visualizer.isActive = true;
    
    const scene = this.scenes[visualizer.sceneId];
    if (scene) {
      visualizer.targetParams = this.calculateReactiveParams(scene, intensity);
    }

    // Mark for update instead of starting independent animation
    visualizer.needsUpdate = true;
  }

  deactivateVisualizer(visualizer) {
    visualizer.isActive = false;
    visualizer.needsUpdate = false;
  }

  calculateReactiveParams(scene, intensity = 1.0) {
    const reactivity = this.reactiveParams[scene.reactivity] || this.reactiveParams.cosmic;
    const base = scene.parameters;
    
    const scrollInfluence = this.globalState.scrollProgress * reactivity.scrollInfluence;
    const mouseInfluence = Math.abs(this.globalState.mousePosition.x) * reactivity.mouseInfluence;
    const energyInfluence = Math.min(this.globalState.userEnergy / 100, 1) * reactivity.energyInfluence;
    
    const totalInfluence = (scrollInfluence + mouseInfluence + energyInfluence) * intensity;
    
    return {
      morphFactor: this.lerp(
        reactivity.morphRange[0], 
        reactivity.morphRange[1], 
        totalInfluence
      ),
      intensity: this.lerp(
        reactivity.intensityRange[0], 
        reactivity.intensityRange[1], 
        totalInfluence
      ),
      rotationSpeed: this.lerp(
        reactivity.speedRange[0], 
        reactivity.speedRange[1], 
        totalInfluence
      ),
      particleDensity: base.particleDensity * (0.5 + totalInfluence * 0.5)
    };
  }

  updateVisualizerParameters(timing) {
    // Update parameters for all visualizers that need updates
    this.visualizers.forEach((visualizer, id) => {
      if (!visualizer.isActive || !visualizer.needsUpdate) return;

      // Smoothly interpolate current params toward target params
      const lerpSpeed = 0.05;
      let hasChanges = false;

      Object.keys(visualizer.targetParams).forEach(key => {
        if (key in visualizer.currentParams) {
          const current = visualizer.currentParams[key];
          const target = visualizer.targetParams[key];
          const newValue = this.lerp(current, target, lerpSpeed);
          
          if (Math.abs(newValue - current) > 0.001) {
            visualizer.currentParams[key] = newValue;
            hasChanges = true;
          }
        }
      });

      if (hasChanges) {
        this.updateVisualizerUrl(visualizer);
      }

      // Clear update flag if we're close enough to target
      const allClose = Object.keys(visualizer.targetParams).every(key => {
        if (!(key in visualizer.currentParams)) return true;
        return Math.abs(visualizer.currentParams[key] - visualizer.targetParams[key]) < 0.01;
      });

      if (allClose) {
        visualizer.needsUpdate = false;
      }
    });
  }

  updateVisualizerUrl(visualizer) {
    const params = new URLSearchParams();
    
    Object.entries(visualizer.currentParams).forEach(([key, value]) => {
      if (typeof value === 'number') {
        params.append(key, value.toFixed(3));
      } else {
        params.append(key, value);
      }
    });

    params.append('mood', this.globalState.currentMood);
    params.append('timeOfDay', this.globalState.timeOfDay);
    
    const newUrl = `${visualizer.baseUrl}?${params.toString()}`;
    
    if (visualizer.iframe.src !== newUrl) {
      visualizer.iframe.src = newUrl;
    }
  }

  updateComplementaryElements(timing) {
    this.updateBackgroundElements();
    this.updateNavigationIndicators();
    this.updateAmbientEffects(timing);
  }

  updateBackgroundElements() {
    const body = document.body;
    const scrollProgress = this.globalState.scrollProgress;
    const mouseX = this.globalState.mousePosition.x;
    const mouseY = this.globalState.mousePosition.y;

    const hue = (scrollProgress * 60 + (mouseX * 20) + 200) % 360;
    const saturation = 20 + (this.globalState.userEnergy / 100) * 30;
    const lightness = 8 + Math.abs(mouseY) * 3;

    body.style.setProperty(
      '--dynamic-bg', 
      `hsl(${hue}, ${saturation}%, ${lightness}%)`
    );
  }

  updateNavigationIndicators() {
    const indicators = document.querySelectorAll('.scene-indicator');
    indicators.forEach((indicator, index) => {
      const sceneId = indicator.dataset.scene;
      const scene = this.activeScenes.get(sceneId);
      
      if (scene) {
        indicator.style.opacity = scene.intensity;
        indicator.style.transform = `scale(${1 + scene.intensity * 0.5})`;
      } else {
        indicator.style.opacity = 0.3;
        indicator.style.transform = 'scale(1)';
      }
    });
  }

  updateAmbientEffects(timing) {
    this.createAmbientParticles(timing);
    this.updateCursorTrail();
    this.updateAmbientAudio();
  }

  updateGlobalState(timing) {
    // Use timing from MasterConductor for consistent updates
    this.lastUpdateTime = timing.elapsed;
  }

  // Utility functions
  lerp(a, b, t) {
    return a + (b - a) * Math.max(0, Math.min(1, t));
  }

  getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'day';
    return 'evening';
  }

  incrementUserEnergy() {
    this.globalState.userEnergy = Math.min(this.globalState.userEnergy + 1, 100);
    
    setTimeout(() => {
      this.globalState.userEnergy = Math.max(this.globalState.userEnergy - 0.5, 0);
    }, 1000);
  }

  updateScrollMood() {
    const scrollSpeed = Math.abs(this.globalState.scrollProgress - this.lastScrollProgress || 0);
    this.lastScrollProgress = this.globalState.scrollProgress;

    if (scrollSpeed > 0.01) {
      this.globalState.currentMood = 'exploration';
    } else if (this.globalState.focusedElement) {
      this.globalState.currentMood = 'focus';
    } else if (this.globalState.userEnergy > 50) {
      this.globalState.currentMood = 'creation';
    } else {
      this.globalState.currentMood = 'reflection';
    }
  }

  // Enhanced effect functions (coordinated versions)
  createMouseRipples(x, y) {
    // Create coordinated ripple effect at mouse position
    // Implementation would create CSS-based ripple without RAF
  }

  createFocusAura(element) {
    // Create coordinated aura effect around focused element
  }

  intensifyRelatedVisualizers(element) {
    // Find and intensify visualizers related to the focused element
    const section = element.closest('section[data-scene]');
    if (section) {
      const sceneId = section.dataset.scene || section.id;
      this.visualizers.forEach((visualizer, id) => {
        if (visualizer.sceneId === sceneId) {
          visualizer.needsUpdate = true;
        }
      });
    }
  }

  normalizeAllVisualizers() {
    // Return all visualizers to their base state
    this.visualizers.forEach((visualizer, id) => {
      if (visualizer.isActive) {
        const scene = this.scenes[visualizer.sceneId];
        if (scene) {
          visualizer.targetParams = { ...scene.parameters };
          visualizer.needsUpdate = true;
        }
      }
    });
  }

  triggerSceneEffects(sceneId, action) {
    // Trigger coordinated entrance/exit effects for scene transitions
  }

  triggerScrollReactions() {
    // Trigger coordinated reactions based on scroll position
  }

  updateMoodBasedOnVisibility() {
    // Update mood when window becomes visible/hidden
  }

  createAmbientParticles(timing) {
    // Create coordinated ambient particle effects using timing
  }

  updateCursorTrail() {
    // Update coordinated cursor trail effects
  }

  updateAmbientAudio() {
    // Update coordinated ambient audio (if implemented)
  }

  // Public API
  setMood(mood) {
    this.globalState.currentMood = mood;
  }

  getMood() {
    return this.globalState.currentMood;
  }

  getGlobalState() {
    return { ...this.globalState };
  }

  // Method for MasterConductor to get current state
  getVisualizerState() {
    return {
      activeScenes: this.activeScenes.size,
      activeVisualizers: Array.from(this.visualizers.values()).filter(v => v.isActive).length,
      globalState: this.globalState,
      needsUpdate: Array.from(this.visualizers.values()).some(v => v.needsUpdate)
    };
  }

  destroy() {
    if (this.sceneObserver) {
      this.sceneObserver.disconnect();
    }

    this.visualizers.clear();
    this.activeScenes.clear();

    console.log('🎭 Coordinated Choreographed Visualizer System destroyed');
  }
}

// Export for MasterConductor
window.CoordinatedChoreographedVisualizerSystem = CoordinatedChoreographedVisualizerSystem;