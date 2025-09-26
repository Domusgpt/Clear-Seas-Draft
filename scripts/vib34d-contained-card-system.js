/**
 * VIB34D CONTAINED CARD SYSTEM
 * Uses Paul Phillips' VIB34D 5-layer architecture for card visualizations
 * Stays within card boundaries, loads/destroys smartly, follows user interactions
 * A Paul Phillips Manifestation - Paul@clearseassolutions.com
 */

const BRAND_OVERRIDE_EVENT = window.__CLEAR_SEAS_BRAND_OVERRIDE_EVENT || 'clear-seas:brand-overrides-changed';

const VIB34D_BRAND_LIBRARY_DEFAULTS = {
  overlays: [
    'assets/Screenshot_20250430-141821.png',
    'assets/Screenshot_20250430-142002~2.png',
    'assets/Screenshot_20250430-142024~2.png',
    'assets/Screenshot_20250430-142032~2.png',
    'assets/Screenshot_20241012-073718.png',
    'assets/file_0000000006fc6230a8336bfa1fcebd89.png',
    'assets/file_0000000054a06230817873012865d150.png',
    'assets/file_00000000fc08623085668cf8b5e0a1e5.png',
    'assets/image_8 (1).png'
  ],
  videos: [
    '20250505_1321_Neon Blossom Transformation_simple_compose_01jtgqf5vjevn8nbrnsx8yd5fs.mp4',
    '20250505_1726_Noir Filament Mystery_simple_compose_01jth5f1kwe9r9zxqet54bz3q0.mp4',
    '20250506_0014_Gemstone Coral Transformation_remix_01jthwv071e06vmjd0mn60zm3s.mp4',
    '20250506_0014_Gemstone Coral Transformation_remix_01jthwv0c4fxk8m0e79ry2t4ke.mp4',
    '1746496560073.mp4',
    '1746500614769.mp4',
    '1746576068221.mp4'
  ],
  logos: [
    'assets/clear-seas-logo-aurora.svg',
    'assets/clear-seas-monogram.svg'
  ]
};

const vibBrandOverrideFallback = {
  collect: () => null,
  mergeOverlaySettings: (base) => ({ ...(base || {}) }),
  mergeCanvasSettings: (base) => ({ ...(base || {}) }),
  resolveMode: (_overrides, fallback) => fallback,
  pickAsset: (_overrides, _type, index, fallback) => (typeof fallback === 'function' ? fallback(index) : null),
  shouldCycle: () => false,
  nextCycleIndex: (_overrides, current) => (Number.isFinite(current) ? current + 1 : 1),
  applyPalette: (overrides, fallback) => overrides?.palette || fallback,
  hasAssetList: (overrides, type) => {
    const key = type === 'videos' ? 'videos' : 'images';
    return Array.isArray(overrides?.[key]) && overrides[key].length > 0;
  },
  refresh: (detail) => {
    const eventDetail = {
      reason: detail && typeof detail === 'object' && detail.reason ? detail.reason : 'manual-refresh',
      timestamp: Date.now()
    };
    if (detail && typeof detail === 'object') {
      Object.keys(detail).forEach((key) => {
        if (key === 'reason') {
          return;
        }
        eventDetail[key] = detail[key];
      });
    }
    window.dispatchEvent(new CustomEvent(BRAND_OVERRIDE_EVENT, { detail: eventDetail }));
    return [];
  },
  eventName: BRAND_OVERRIDE_EVENT
};

const vibBrandOverrideApi = window.__CLEAR_SEAS_BRAND_OVERRIDE_API || vibBrandOverrideFallback;

function ensureVibSharedBrandLibrary() {
  const mergeUnique = (target, source) => {
    if (!Array.isArray(source)) return target;
    source.forEach((item) => {
      if (typeof item === 'string' && !target.includes(item)) {
        target.push(item);
      }
    });
    return target;
  };

  if (window.ClearSeasBrandLibrary && typeof window.clearSeasAcquireBrandAsset === 'function') {
    mergeUnique(window.ClearSeasBrandLibrary.overlays ||= [], VIB34D_BRAND_LIBRARY_DEFAULTS.overlays);
    mergeUnique(window.ClearSeasBrandLibrary.videos ||= [], VIB34D_BRAND_LIBRARY_DEFAULTS.videos);
    mergeUnique(window.ClearSeasBrandLibrary.logos ||= [], VIB34D_BRAND_LIBRARY_DEFAULTS.logos);
    return window.clearSeasAcquireBrandAsset;
  }

  const pageProfile = window.__CLEAR_SEAS_PAGE_PROFILE || {};
  const library = {
    overlays: [...VIB34D_BRAND_LIBRARY_DEFAULTS.overlays],
    videos: [...VIB34D_BRAND_LIBRARY_DEFAULTS.videos],
    logos: [...VIB34D_BRAND_LIBRARY_DEFAULTS.logos],
    cursor: 0,
    palette: pageProfile.palette || 'foundation'
  };

  if (typeof pageProfile.seed === 'number') {
    const poolSize = Math.max(1, library.overlays.length + library.videos.length + library.logos.length);
    library.cursor = Math.abs(pageProfile.seed) % poolSize;
  }

  const getPool = (preference) => {
    const pref = (preference || '').toLowerCase();
    if (pref.startsWith('video')) return library.videos;
    if (pref.startsWith('logo')) return library.logos.length ? library.logos : library.overlays;
    if (pref.startsWith('overlay') || pref.startsWith('image') || pref.startsWith('brand')) {
      return library.overlays.length ? library.overlays : [...library.logos, ...library.videos];
    }
    return [...library.videos, ...library.overlays, ...library.logos];
  };

  const acquire = (preference) => {
    const pool = getPool(preference);
    if (!pool.length) {
      return null;
    }
    const index = Math.abs(library.cursor) % pool.length;
    library.cursor += 1;
    const src = pool[index];
    const type = typeof src === 'string' && src.toLowerCase().endsWith('.mp4') ? 'video' : 'image';
    return { src, type };
  };

  library.acquire = acquire;
  window.ClearSeasBrandLibrary = library;
  window.clearSeasAcquireBrandAsset = acquire;
  return acquire;
}

const acquireVibBrandAsset = ensureVibSharedBrandLibrary();

class VIB34DContainedCardSystem {
  constructor() {
    this.cardVisualizers = new Map();
    this.observer = null;
    this.isInitialized = false;

    // Import VIB34D systems
    this.engineClasses = {};
    this.brandOverrideEvent = vibBrandOverrideApi.eventName || BRAND_OVERRIDE_EVENT;
    this.handleBrandOverridesChanged = () => {
      this.cardVisualizers.forEach((visualizer) => {
        if (!visualizer || typeof visualizer.refreshBrandLayer !== 'function') {
          return;
        }
        visualizer.refreshBrandLayer({ recalcOverrides: true, resetCycle: true });
      });
    };
    window.addEventListener(this.brandOverrideEvent, this.handleBrandOverridesChanged);
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
    window.removeEventListener(this.brandOverrideEvent, this.handleBrandOverridesChanged);
    this.cardVisualizers.forEach(visualizer => visualizer.destroy());
    this.cardVisualizers.clear();
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
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

    this.focusState = {
      current: 0.28,
      target: 0.35,
      pulse: 0,
      raf: null
    };

    this.brandHost = null;
    this.brandMedia = null;
    this.resizeObserver = null;
    this.layerCanvases = [];

    this.brandOverrideApi = vibBrandOverrideApi;
    this.brandOverrides = this.brandOverrideApi.collect ? this.brandOverrideApi.collect(this.card) : null;
    this.assetCycle = 0;

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
    this.startFocusLoop();
    this.start();
  }

  createContainedCanvasSystem() {
    if (getComputedStyle(this.card).position === 'static') {
      this.card.style.position = 'relative';
    }

    this.card.classList.add('visualizer-host', 'card-brand-enhanced');

    const baseWeight = Number(this.card.dataset.visualizerWeight || '1.1');
    const bleed = Number.isFinite(baseWeight) ? Math.max(1.22, baseWeight + 0.2) : 1.28;
    this.card.style.setProperty('--visualizer-bleed', bleed.toFixed(3));
    this.card.style.setProperty('--visualizer-scale', (bleed + 0.14).toFixed(3));
    if (!this.card.style.getPropertyValue('--brand-rotation')) {
      this.card.style.setProperty('--brand-rotation', `${(Math.random() * 36 - 18).toFixed(2)}deg`);
    }

    this.canvasContainer = document.createElement('div');
    this.canvasContainer.className = 'visualizer-shell vib34d-card-container';
    this.canvasContainer.setAttribute('aria-hidden', 'true');
    this.canvasContainer.style.pointerEvents = 'none';

    const pageProfile = window.__CLEAR_SEAS_PAGE_PROFILE || {};
    const overlaySettings = this.brandOverrideApi.mergeOverlaySettings(pageProfile.overlay || {}, this.brandOverrides ? this.brandOverrides.overlay : null);
    const canvasSettings = this.brandOverrideApi.mergeCanvasSettings(pageProfile.canvas || {}, this.brandOverrides ? this.brandOverrides.canvas : null);
    const palette = this.brandOverrideApi.applyPalette(this.brandOverrides, pageProfile.palette || 'foundation');

    this.card.dataset.brandPalette = palette;
    this.card.style.setProperty('--brand-overlay-opacity', overlaySettings.opacity != null ? String(overlaySettings.opacity) : '1');
    this.card.style.setProperty('--brand-overlay-filter', overlaySettings.filter || 'brightness(1)');
    this.card.style.setProperty('--brand-overlay-blend', overlaySettings.blend || 'screen');
    this.card.style.setProperty('--brand-overlay-rotate', overlaySettings.rotate || '0deg');
    this.card.style.setProperty('--brand-overlay-depth', overlaySettings.depth || '0px');
    if (canvasSettings.scale != null) {
      this.card.style.setProperty('--card-canvas-scale', String(canvasSettings.scale));
    }
    if (canvasSettings.depth) {
      this.card.style.setProperty('--card-canvas-depth', canvasSettings.depth);
    }

    const layerNames = ['background', 'shadow', 'content', 'highlight', 'accent'];
    const containerId = `vib34d-card-${Math.random().toString(36).substr(2, 9)}`;
    this.layerCanvases = [];

    layerNames.forEach((layerName, index) => {
      const canvas = document.createElement('canvas');
      canvas.id = `${containerId}-${layerName}`;
      canvas.dataset.visualizerLayer = layerName;
      canvas.className = `visualizer-shell__canvas vib34d-card-layer vib34d-card-layer--${layerName}`;
      canvas.style.zIndex = String(index + 1);
      this.canvasContainer.appendChild(canvas);
      this.layerCanvases.push(canvas);
    });

    this.brandHost = this.attachBrandLayer();
    if (this.brandHost) {
      this.canvasContainer.appendChild(this.brandHost);
    }

    this.card.insertBefore(this.canvasContainer, this.card.firstChild);
    this.resizeCanvases();
  }

  resizeCanvases() {
    if (!this.canvasContainer) return;
    const rect = this.card.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const bleedFactor = Number(this.card.style.getPropertyValue('--visualizer-bleed')) || 1.28;
    const resolutionScale = bleedFactor + 0.36;

    const canvases = this.layerCanvases && this.layerCanvases.length
      ? this.layerCanvases
      : Array.from(this.canvasContainer.querySelectorAll('canvas'));

    canvases.forEach(canvas => {
      const width = Math.max(1, Math.round(rect.width * resolutionScale * dpr));
      const height = Math.max(1, Math.round(rect.height * resolutionScale * dpr));
      if (canvas.width !== width) canvas.width = width;
      if (canvas.height !== height) canvas.height = height;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
    });
  }

  attachBrandLayer() {
    const assetPreference = this.card.dataset.visualizerAsset || this.systemType;
    if (typeof acquireVibBrandAsset !== 'function') {
      return null;
    }

    const pageProfile = window.__CLEAR_SEAS_PAGE_PROFILE || {};
    const overlaySettings = this.brandOverrideApi.mergeOverlaySettings(pageProfile.overlay || {}, this.brandOverrides ? this.brandOverrides.overlay : null);
    const palette = this.brandOverrideApi.applyPalette(this.brandOverrides, pageProfile.palette || 'foundation');

    let asset = null;
    const cycleIndex = this.assetCycle || 0;
    if (this.brandOverrides && this.brandOverrideApi.hasAssetList(this.brandOverrides, 'videos')) {
      const overrideVideo = this.brandOverrideApi.pickAsset(this.brandOverrides, 'videos', cycleIndex, () => null);
      if (overrideVideo) {
        asset = { type: 'video', src: overrideVideo };
      }
    }
    if (!asset && this.brandOverrides && this.brandOverrideApi.hasAssetList(this.brandOverrides, 'images')) {
      const overrideImage = this.brandOverrideApi.pickAsset(this.brandOverrides, 'images', cycleIndex, () => null);
      if (overrideImage) {
        asset = { type: 'image', src: overrideImage };
      }
    }
    if (!asset) {
      const fallback = acquireVibBrandAsset(assetPreference);
      if (!fallback || !fallback.src) {
        return null;
      }
      asset = fallback;
    }

    const host = document.createElement('div');
    host.className = 'visualizer-shell__brand';
    host.dataset.brandType = asset.type;
    host.dataset.brandPalette = palette;
    host.style.setProperty('--brand-overlay-opacity', overlaySettings.opacity != null ? String(overlaySettings.opacity) : '1');
    host.style.setProperty('--brand-overlay-filter', overlaySettings.filter || 'brightness(1)');
    host.style.setProperty('--brand-overlay-blend', overlaySettings.blend || 'screen');
    host.style.setProperty('--brand-overlay-rotate', overlaySettings.rotate || '0deg');
    host.style.setProperty('--brand-overlay-depth', overlaySettings.depth || '0px');

    if (!this.card.style.getPropertyValue('--brand-rotation')) {
      this.card.style.setProperty('--brand-rotation', `${(Math.random() * 32 - 16).toFixed(2)}deg`);
    }

    if (asset.type === 'video') {
      host.classList.add('visualizer-shell__brand--video');
      const video = document.createElement('video');
      video.className = 'visualizer-shell__brand-media';
      video.src = this.resolveMediaSource(asset.src);
      video.muted = true;
      video.loop = true;
      video.autoplay = true;
      video.playsInline = true;
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');
      video.addEventListener('loadeddata', () => {
        video.play().catch(() => {});
      }, { once: true });
      host.appendChild(video);
      this.brandMedia = video;
    } else {
      host.classList.add('visualizer-shell__brand--image');
      host.style.setProperty('--brand-image', `url(${this.resolveMediaSource(asset.src)})`);
      this.brandMedia = null;
    }

    this.brandHost = host;
    return host;
  }

  resolveMediaSource(src) {
    if (!src) {
      return '';
    }
    const trimmed = String(src).trim();
    if (/^(?:https?:|data:)/i.test(trimmed)) {
      return trimmed;
    }
    if (trimmed.startsWith('assets/') || trimmed.startsWith('./') || trimmed.startsWith('../')) {
      return trimmed;
    }
    return `./${trimmed.replace(/^\.\/?/, '')}`;
  }

  refreshBrandLayer(options = {}) {
    const { recalcOverrides = false, resetCycle = false } = options || {};
    if (recalcOverrides && this.brandOverrideApi && typeof this.brandOverrideApi.collect === 'function') {
      this.brandOverrides = this.brandOverrideApi.collect(this.card);
    }
    if (resetCycle) {
      this.assetCycle = 0;
    }
    if (this.brandHost && this.brandHost.parentNode) {
      this.brandHost.parentNode.removeChild(this.brandHost);
    }
    if (this.brandMedia) {
      try {
        this.brandMedia.pause();
      } catch (error) {
        // ignore pause errors
      }
      this.brandMedia = null;
    }
    this.brandHost = this.attachBrandLayer();
    if (this.brandHost && this.canvasContainer) {
      this.canvasContainer.appendChild(this.brandHost);
    }
  }

  tryCycleBrand(trigger) {
    if (!this.brandOverrideApi.shouldCycle(this.brandOverrides, trigger)) {
      return;
    }
    this.assetCycle = this.brandOverrideApi.nextCycleIndex(this.brandOverrides, this.assetCycle);
    this.refreshBrandLayer();
  }

  setupUserInteractions() {
    // Smart mouse tracking for elegant parameter changes
    const handleEnter = () => {
      this.mouseState.intensity = 1.0;
      this.focusState.target = Math.max(this.focusState.target, 1.05);
      this.updateVIB34DParameters({ intensity: 1.0 });
      this.tryCycleBrand('focus');
      if (this.brandMedia) {
        this.brandMedia.play().catch(() => {});
      }
    };

    const handleLeave = () => {
      this.mouseState.intensity = 0.7;
      this.mouseState.targetX = 0.5;
      this.mouseState.targetY = 0.5;
      this.focusState.target = Math.max(0.32, this.focusState.target * 0.75);
      this.updateVIB34DParameters({ intensity: 0.7 });
    };

    const handleMove = (e) => {
      const rect = this.card.getBoundingClientRect();
      this.mouseState.targetX = (e.clientX - rect.left) / rect.width;
      this.mouseState.targetY = (e.clientY - rect.top) / rect.height;

      // Convert mouse position to VIB34D rotation parameters
      this.updateMouseBasedParameters();
    };

    this.card.addEventListener('mouseenter', handleEnter);
    this.card.addEventListener('mouseleave', handleLeave);
    this.card.addEventListener('mousemove', handleMove);
    const handlePointerDown = () => {
      this.focusState.pulse = 1;
      this.tryCycleBrand('click');
      if (this.brandMedia) {
        this.brandMedia.play().catch(() => {});
      }
    };
    this.card.addEventListener('pointerdown', handlePointerDown);
    this.card.addEventListener('focusin', handleEnter);
    this.card.addEventListener('focusout', handleLeave);

    // Responsive resize observer
    this.resizeObserver = new ResizeObserver(() => {
      this.resizeCanvases();
      if (this.engine && this.engine.resize) {
        this.engine.resize();
      }
    });
    this.resizeObserver.observe(this.card);
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

    const tiltXDeg = (0.5 - this.mouseState.y) * 18;
    const tiltYDeg = (this.mouseState.x - 0.5) * 18;
    this.card.style.setProperty('--tilt-x', `${tiltXDeg.toFixed(2)}deg`);
    this.card.style.setProperty('--tilt-y', `${tiltYDeg.toFixed(2)}deg`);
    this.card.style.setProperty('--tilt-x-value', tiltXDeg.toFixed(4));
    this.card.style.setProperty('--tilt-y-value', tiltYDeg.toFixed(4));
    this.card.style.setProperty('--focus-pointer-x', this.mouseState.x.toFixed(3));
    this.card.style.setProperty('--focus-pointer-y', this.mouseState.y.toFixed(3));
  }

  startFocusLoop() {
    if (this.focusState.raf) {
      cancelAnimationFrame(this.focusState.raf);
    }

    const step = () => {
      const isEngaged = this.card.matches(':hover') || this.card.matches(':focus-within');
      const baseTarget = isEngaged ? 1.05 : 0.32;
      this.focusState.target += (baseTarget - this.focusState.target) * 0.08;
      this.focusState.current += (this.focusState.target - this.focusState.current) * 0.12;
      this.focusState.pulse *= 0.88;

      const focusValue = Math.max(0, this.focusState.current);
      this.card.style.setProperty('--focus-intensity', focusValue.toFixed(3));
      this.card.style.setProperty('--focus-pulse', this.focusState.pulse.toFixed(3));

      if (this.brandMedia instanceof HTMLVideoElement) {
        const scrollVelocity = Number(this.card.style.getPropertyValue('--scroll-velocity') || 0);
        const playbackRate = 0.85 + focusValue * 0.42 + Math.abs(scrollVelocity) * 0.18;
        this.brandMedia.playbackRate = Math.min(1.8, Math.max(0.7, playbackRate));
      }

      this.focusState.raf = requestAnimationFrame(step);
    };

    this.focusState.raf = requestAnimationFrame(step);
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

    if (this.focusState.raf) {
      cancelAnimationFrame(this.focusState.raf);
      this.focusState.raf = null;
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.brandHost && this.brandHost.parentNode) {
      this.brandHost.parentNode.removeChild(this.brandHost);
    }

    // Remove canvas container
    if (this.canvasContainer && this.canvasContainer.parentNode) {
      this.canvasContainer.parentNode.removeChild(this.canvasContainer);
    }

    this.card.classList.remove('visualizer-host');
    this.card.classList.remove('card-brand-enhanced');
    this.brandHost = null;
    this.brandMedia = null;
    this.layerCanvases = [];
    this.canvasContainer = null;

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