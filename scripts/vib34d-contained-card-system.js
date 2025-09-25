/**
 * VIB34D CONTAINED CARD SYSTEM
 * Uses Paul Phillips' VIB34D 5-layer architecture for card visualizations
 * Stays within card boundaries, loads/destroys smartly, follows user interactions
 * A Paul Phillips Manifestation - Paul@clearseassolutions.com
 */

class VIB34DContainedCardSystem {
  constructor() {
    this.cardVisualizers = new Map();
    this.observer = null;
    this.isInitialized = false;

    // Import VIB34D systems
    this.engineClasses = {};
    this.loadVIB34DSystems();
  }

  async loadVIB34DSystems() {
    try {
      // Load the user's actual VIB34D systems
      if (window.VIB34DIntegratedEngine) this.engineClasses.VIB34DIntegratedEngine = window.VIB34DIntegratedEngine;
      if (window.QuantumEngine) this.engineClasses.QuantumEngine = window.QuantumEngine;
      if (window.RealHolographicSystem) this.engineClasses.RealHolographicSystem = window.RealHolographicSystem;
      if (window.NewPolychoraEngine) this.engineClasses.NewPolychoraEngine = window.NewPolychoraEngine;

      console.log('🎨 VIB34D systems loaded:', Object.keys(this.engineClasses));
      this.init();
    } catch (error) {
      console.error('❌ Failed to load VIB34D systems:', error);
    }
  }

  init() {
    // Smart card observer - creates/destroys visualizers based on viewport
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.createCardVisualizer(entry.target);
        } else {
          this.destroyCardVisualizer(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    });

    this.scanForCards();
    this.isInitialized = true;
    console.log('✅ VIB34D Contained Card System initialized');
  }

  scanForCards() {
    const cards = document.querySelectorAll('[data-vib34d], .tech-card, .unified-card');
    cards.forEach(card => {
      this.observer.observe(card);
    });
  }

  createCardVisualizer(card) {
    if (this.cardVisualizers.has(card)) return;

    // Determine VIB34D system type from card
    const systemType = this.getSystemTypeFromCard(card);

    // Create contained visualizer instance
    const visualizer = new VIB34DContainedVisualizer(card, systemType, this.engineClasses);
    this.cardVisualizers.set(card, visualizer);

    console.log(`🎨 Created ${systemType} visualizer for card:`, card.id);
  }

  destroyCardVisualizer(card) {
    const visualizer = this.cardVisualizers.get(card);
    if (visualizer) {
      visualizer.destroy();
      this.cardVisualizers.delete(card);
      console.log('🗑️ Destroyed card visualizer for:', card.id);
    }
  }

  getSystemTypeFromCard(card) {
    if (card.dataset.vib34d) return card.dataset.vib34d;
    if (card.classList.contains('polytopal-card') || card.id.includes('polychora')) return 'polychora';
    if (card.classList.contains('quantum-card') || card.id.includes('quantum')) return 'quantum';
    if (card.classList.contains('holographic-card') || card.id.includes('holographic')) return 'holographic';
    return 'faceted'; // Default to faceted system
  }

  destroy() {
    this.cardVisualizers.forEach(visualizer => visualizer.destroy());
    this.cardVisualizers.clear();
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

/**
 * VIB34D CONTAINED VISUALIZER
 * Individual visualizer that uses Paul Phillips' 5-layer VIB34D system
 * Contained within card boundaries with smart parameter adaptation
 */
class VIB34DContainedVisualizer {
  constructor(card, systemType, engineClasses) {
    this.card = card;
    this.systemType = systemType;
    this.engineClasses = engineClasses;
    this.engine = null;
    this.canvasContainer = null;
    this.isActive = false;

    // Mouse tracking for elegant parameter changes
    this.mouseState = {
      x: 0.5,
      y: 0.5,
      targetX: 0.5,
      targetY: 0.5,
      intensity: 0.7
    };

    // VIB34D Parameters - Rich parameter sets based on Paul Phillips' system configurations
    this.parameters = this.getVIB34DParametersForSystem(systemType);

    // Add dynamic parameters for user interaction
    this.dynamicParams = {
      rot4dXW: 0,
      rot4dYW: 0,
      rot4dZW: 0
    };

    this.init();
  }

  init() {
    this.createContainedCanvasSystem();
    this.setupUserInteractions();
    this.createVIB34DEngine();
    this.start();
  }

  createContainedCanvasSystem() {
    // Create contained canvas system within card boundaries
    this.canvasContainer = document.createElement('div');
    this.canvasContainer.className = 'vib34d-card-container';
    this.canvasContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      border-radius: inherit;
      pointer-events: none;
      z-index: 1;
    `;

    // Ensure card is positioned relatively
    if (getComputedStyle(this.card).position === 'static') {
      this.card.style.position = 'relative';
    }

    // Create 5-layer VIB34D canvas system - CONTAINED within card
    const layerNames = ['background', 'shadow', 'content', 'highlight', 'accent'];
    const containerId = `vib34d-card-${Math.random().toString(36).substr(2, 9)}`;

    layerNames.forEach((layerName, index) => {
      const canvas = document.createElement('canvas');
      canvas.id = `${containerId}-${layerName}`;
      canvas.className = 'vib34d-card-canvas';
      canvas.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: ${index + 1};
      `;

      this.canvasContainer.appendChild(canvas);
    });

    // Insert as first child so it stays behind card content
    this.card.insertBefore(this.canvasContainer, this.card.firstChild);
    this.resizeCanvases();
  }

  resizeCanvases() {
    const rect = this.card.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const canvases = this.canvasContainer.querySelectorAll('canvas');
    canvases.forEach(canvas => {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
    });
  }

  setupUserInteractions() {
    // Smart mouse tracking for elegant parameter changes
    this.card.addEventListener('mouseenter', () => {
      this.mouseState.intensity = 1.0;
      this.updateVIB34DParameters({ intensity: 1.0 });
    });

    this.card.addEventListener('mouseleave', () => {
      this.mouseState.intensity = 0.7;
      this.mouseState.targetX = 0.5;
      this.mouseState.targetY = 0.5;
      this.updateVIB34DParameters({ intensity: 0.7 });
    });

    this.card.addEventListener('mousemove', (e) => {
      const rect = this.card.getBoundingClientRect();
      this.mouseState.targetX = (e.clientX - rect.left) / rect.width;
      this.mouseState.targetY = (e.clientY - rect.top) / rect.height;

      // Convert mouse position to VIB34D rotation parameters
      this.updateMouseBasedParameters();
    });

    // Responsive resize observer
    const resizeObserver = new ResizeObserver(() => {
      this.resizeCanvases();
      if (this.engine && this.engine.resize) {
        this.engine.resize();
      }
    });
    resizeObserver.observe(this.card);
  }

  getVIB34DParametersForSystem(systemType) {
    // ACTUAL VIB34D parameter sets based on Paul Phillips' ParameterManager specifications
    // Using REAL ranges from Parameters.js parameter definitions
    const systemConfigs = {
      faceted: {
        // 4D Polytopal Mathematics (Parameters.js: rot4dXW/YW/ZW: min: -2, max: 2)
        rot4dXW: 0.0,
        rot4dYW: 0.0,
        rot4dZW: 0.0,

        // Holographic Visualization (Parameters.js actual ranges)
        gridDensity: 15,     // min: 4, max: 100 - default: 15
        morphFactor: 1.0,    // min: 0, max: 2 - default: 1.0
        chaos: 0.2,          // min: 0, max: 1 - default: 0.2
        speed: 1.0,          // min: 0.1, max: 3 - default: 1.0
        hue: 200,            // min: 0, max: 360 - default: 200
        intensity: 0.5,      // min: 0, max: 1 - default: 0.5
        saturation: 0.8,     // min: 0, max: 1 - default: 0.8

        // Geometry selection (Parameters.js: geometry: min: 0, max: 7)
        geometry: 0,         // Tetrahedron lattice

        // Dimensional level (Parameters.js: dimension: min: 3.0, max: 4.5)
        dimension: 3.5,      // default: 3.5

        // Variation (Parameters.js: variation: min: 0, max: 99)
        variation: 0
      },
      quantum: {
        // Quantum-enhanced parameters from QuantumEngine.js initialization
        rot4dXW: 0.0,
        rot4dYW: 0.0,
        rot4dZW: 0.0,

        // QuantumEngine.js sets these enhanced values
        gridDensity: 20,     // Denser quantum patterns (QuantumEngine: setParameter('gridDensity', 20))
        morphFactor: 1.0,    // Default morphing
        chaos: 0.2,          // Base chaos level
        speed: 1.0,          // Default speed
        hue: 280,            // Purple-blue quantum (QuantumEngine: setParameter('hue', 280))
        intensity: 0.7,      // Higher quantum intensity (QuantumEngine: setParameter('intensity', 0.7))
        saturation: 0.9,     // Vivid quantum colors (QuantumEngine: setParameter('saturation', 0.9))

        geometry: 3,         // Sphere lattice (good for quantum fields)
        dimension: 3.8,      // Higher dimensional quantum space
        variation: 3         // Sphere resonance variant
      },
      holographic: {
        // Holographic system parameters from RealHolographicSystem.js
        rot4dXW: 0.0,
        rot4dYW: 0.0,
        rot4dZW: 0.0,

        // Enhanced holographic parameters
        gridDensity: 25,     // Higher density for holographic matrix
        morphFactor: 1.5,    // More complex holographic distortion
        chaos: 0.3,          // Holographic interference patterns
        speed: 1.2,          // Dynamic holographic flow
        hue: 330,            // Magenta holographic spectrum
        intensity: 0.8,      // Bright holographic display
        saturation: 1.0,     // Maximum color saturation for holograms

        geometry: 7,         // Crystal lattice (advanced holographic geometry)
        dimension: 4.2,      // Higher-dimensional holographic space
        variation: 29        // Crystal quantum variant (from RealHolographicSystem variantNames)
      }
    };

    return systemConfigs[systemType] || systemConfigs.faceted;
  }

  updateMouseBasedParameters() {
    // Smooth mouse following for elegant parameter changes
    this.mouseState.x += (this.mouseState.targetX - this.mouseState.x) * 0.1;
    this.mouseState.y += (this.mouseState.targetY - this.mouseState.y) * 0.1;

    // Convert mouse position to VIB34D 4D rotation parameters
    this.dynamicParams.rot4dXW = (this.mouseState.x - 0.5) * Math.PI;
    this.dynamicParams.rot4dYW = (this.mouseState.y - 0.5) * Math.PI;
    this.dynamicParams.rot4dZW = Math.sin(Date.now() * 0.001) * 0.2;

    // Dynamic parameter modulation based on mouse interaction
    const morphModulation = this.parameters.morphFactor + (this.mouseState.y - 0.5) * 0.8;
    const chaosModulation = this.parameters.chaos + (this.mouseState.x - 0.5) * 0.3;
    const intensityModulation = this.parameters.intensity + (this.mouseState.intensity - 0.7) * 0.5;

    // Geometry morphing based on mouse movement (cycles through available geometries)
    const geometryFloat = this.parameters.geometry + (this.mouseState.x * 2.0); // Allows geometry blending

    // Update VIB34D system with rich parameter set
    this.updateVIB34DParameters({
      // 4D Rotation (dynamic)
      rot4dXW: this.dynamicParams.rot4dXW,
      rot4dYW: this.dynamicParams.rot4dYW,
      rot4dZW: this.dynamicParams.rot4dZW,

      // Core VIB34D parameters (base + modulation)
      geometry: Math.floor(geometryFloat) % 9, // Cycle through 0-8 geometries
      gridDensity: this.parameters.gridDensity,
      morphFactor: Math.max(0, Math.min(3.0, morphModulation)),
      chaos: Math.max(0, Math.min(1.0, chaosModulation)),
      speed: this.parameters.speed,
      hue: this.parameters.hue + (this.mouseState.x * 60), // Hue shift based on mouse
      intensity: Math.max(0.3, Math.min(2.0, intensityModulation)),
      saturation: this.parameters.saturation
    });
  }

  updateVIB34DParameters(newParams) {
    // Store geometry separately for selectGeometry call
    const geometryChange = newParams.geometry !== undefined && newParams.geometry !== this.parameters.geometry;
    Object.assign(this.parameters, newParams);

    // Apply parameters to VIB34D engine using Paul Phillips' parameter system
    if (this.engine) {
      Object.entries(newParams).forEach(([param, value]) => {
        if (param === 'geometry' && geometryChange) {
          // Use Paul Phillips' geometry selection system
          if (window.selectGeometry) {
            window.selectGeometry(value);
          }
        } else if (window.updateParameter) {
          // Use standard parameter update for other parameters
          window.updateParameter(param, value);
        }
      });
    }
  }

  initializeWithRichParameters() {
    // Initialize VIB34D engine with full parameter set on creation
    console.log(`🎨 Initializing ${this.systemType} with rich parameters:`, this.parameters);

    // Apply all initial parameters
    if (this.engine) {
      // Apply geometry first
      if (window.selectGeometry && this.parameters.geometry !== undefined) {
        window.selectGeometry(this.parameters.geometry);
      }

      // Apply all other VIB34D parameters
      const parameterOrder = ['gridDensity', 'morphFactor', 'chaos', 'speed', 'hue', 'intensity', 'saturation', 'rot4dXW', 'rot4dYW', 'rot4dZW'];

      parameterOrder.forEach(param => {
        if (this.parameters[param] !== undefined && window.updateParameter) {
          window.updateParameter(param, this.parameters[param]);
        }
      });

      console.log(`✅ ${this.systemType} initialized with sophisticated VIB34D parameters`);
    }
  }

  async createVIB34DEngine() {
    try {
      // Create VIB34D engine instance using Paul Phillips' CanvasManager approach
      const containerId = this.canvasContainer.querySelector('canvas').id.split('-')[0] + '-' + this.canvasContainer.querySelector('canvas').id.split('-')[1];

      if (window.canvasManager) {
        this.engine = await window.canvasManager.createVisualizerInContainer(
          containerId,
          this.systemType,
          this.engineClasses
        );
      } else {
        // Fallback: Create engine directly
        this.engine = this.createEngineDirectly();
      }

      if (this.engine) {
        console.log(`✅ VIB34D ${this.systemType} engine created for card`);

        // Initialize with rich parameter set immediately after engine creation
        setTimeout(() => {
          this.initializeWithRichParameters();
        }, 100); // Small delay to ensure engine is fully ready
      }

    } catch (error) {
      console.error('❌ Failed to create VIB34D engine:', error);
    }
  }

  createEngineDirectly() {
    try {
      switch (this.systemType) {
        case 'faceted':
          return this.engineClasses.VIB34DIntegratedEngine ?
            new this.engineClasses.VIB34DIntegratedEngine() : null;
        case 'quantum':
          return this.engineClasses.QuantumEngine ?
            new this.engineClasses.QuantumEngine() : null;
        case 'holographic':
          return this.engineClasses.RealHolographicSystem ?
            new this.engineClasses.RealHolographicSystem() : null;
        case 'polychora':
          return this.engineClasses.NewPolychoraEngine ?
            new this.engineClasses.NewPolychoraEngine() : null;
        default:
          return null;
      }
    } catch (error) {
      console.error('Engine creation failed:', error);
      return null;
    }
  }

  start() {
    this.isActive = true;
    if (this.engine && this.engine.setActive) {
      this.engine.setActive(true);
    }
    this.render();
  }

  render() {
    if (!this.isActive) return;

    // Update mouse-based parameters for smooth interaction
    this.updateMouseBasedParameters();

    // Continue rendering loop
    requestAnimationFrame(() => this.render());
  }

  destroy() {
    this.isActive = false;

    // Destroy VIB34D engine properly
    if (this.engine) {
      if (this.engine.setActive) this.engine.setActive(false);
      if (this.engine.destroy) this.engine.destroy();
    }

    // Remove canvas container
    if (this.canvasContainer && this.canvasContainer.parentNode) {
      this.canvasContainer.parentNode.removeChild(this.canvasContainer);
    }

    console.log('🗑️ VIB34D contained visualizer destroyed');
  }
}

// Auto-initialize VIB34D Contained Card System
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.vib34dCardSystem = new VIB34DContainedCardSystem();
  });
} else {
  window.vib34dCardSystem = new VIB34DContainedCardSystem();
}

// Export for manual use
window.VIB34DContainedCardSystem = VIB34DContainedCardSystem;
window.VIB34DContainedVisualizer = VIB34DContainedVisualizer;