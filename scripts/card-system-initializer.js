/*
 * Card System Initializer
 * Sets up card-specific VIB34D visualizers with unique behaviors
 * Manages canvas creation/destruction and performance optimization
 */

class CardSystemController {
  constructor() {
    this.visualizerManager = null;
    this.cards = new Map();
    this.performanceMonitor = {
      activeVisualizers: 0,
      maxVisualizers: 6,
      performanceMode: 'auto'
    };
    
    this.cardConfigs = {
      'hero-section': {
        roles: ['background'],
        geometryPrefs: [0, 1, 4], // Hypercube, Tetrahedron, Wave
        colorScheme: 'polychora'
      },
      'tech-card-polychora': {
        roles: ['shadow', 'content', 'accent'],
        geometryPrefs: [0, 2], // Hypercube, Sphere
        colorScheme: 'cyan-magenta'
      },
      'tech-card-quantum': {
        roles: ['shadow', 'content', 'highlight'],
        geometryPrefs: [1, 5], // Tetrahedron, Crystal
        colorScheme: 'quantum'
      },
      'tech-card-holographic': {
        roles: ['content', 'highlight', 'accent'],
        geometryPrefs: [3, 6], // Torus, Spiral
        colorScheme: 'holographic'
      },
      'portfolio-vib34d': {
        roles: ['content', 'accent'],
        geometryPrefs: [7, 4], // Fractal, Wave
        colorScheme: 'portfolio'
      }
    };

    this.brandAssets = {
      images: [
        'assets/Screenshot_20250430-141821.png',
        'assets/Screenshot_20241012-073718.png',
        'assets/Screenshot_20250430-142024~2.png',
        'assets/Screenshot_20250430-142002~2.png',
        'assets/Screenshot_20250430-142032~2.png',
        'assets/file_00000000fc08623085668cf8b5e0a1e5.png',
        'assets/file_0000000054a06230817873012865d150.png',
        'assets/file_0000000006fc6230a8336bfa1fcebd89.png',
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
      ]
    };

    this.brandAssignmentIndex = 0;
    this.scrollTilt = 0;
    this.scrollTiltTarget = 0;
    this.scrollTiltRaf = null;
    this.scrollMomentum = 0;

    this.ensureBrandStyles();
    this.setupScrollTiltSync();
    this.applyScrollTiltToCards(this.scrollTilt);

    console.log('🎨 Card System Controller initialized');
  }
  
  async initialize() {
    // Wait for visualizer manager to be available
    if (typeof window.CardVisualizerManager === 'undefined') {
      console.warn('⚠️ CardVisualizerManager not loaded, retrying...');
      setTimeout(() => this.initialize(), 100);
      return;
    }
    
    this.visualizerManager = new window.CardVisualizerManager();
    
    // Initialize all configured cards
    for (const [cardId, config] of Object.entries(this.cardConfigs)) {
      await this.initializeCard(cardId, config);
    }
    
    // Setup performance monitoring
    this.setupPerformanceMonitoring();
    
    // Setup resize handling
    window.addEventListener('resize', this.handleResize.bind(this));
    
    console.log('✅ Card System fully initialized with VIB34D visualizers');
  }
  
  async initializeCard(cardId, config) {
    const cardElement = document.getElementById(cardId);
    if (!cardElement) {
      console.warn(`⚠️ Card element not found: ${cardId}`);
      return;
    }
    
    const cardData = {
      element: cardElement,
      config: config,
      visualizers: new Map(),
      active: false,
      focusIntensity: 0,
      clickPulse: 0,
      pointer: {
        rawX: 0.5,
        rawY: 0.5,
        smoothX: 0.5,
        smoothY: 0.5
      },
      layers: {
        overlay: null,
        video: null
      },
      reactiveElements: []
    };
    
    // Create visualizers for each role
    for (const role of config.roles) {
      if (this.performanceMonitor.activeVisualizers >= this.performanceMonitor.maxVisualizers) {
        console.warn('🔥 Performance limit reached, skipping visualizer creation');
        break;
      }
      
      try {
        const visualizer = this.visualizerManager.createCardVisualizer(cardElement, role);
        if (visualizer && visualizer.gl) {
          cardData.visualizers.set(role, visualizer);
          this.performanceMonitor.activeVisualizers++;
          
          // Apply card-specific configurations
          this.applyCardConfiguration(visualizer, config, role);
          
          console.log(`🎯 Visualizer created: ${cardId}-${role}`);
        }
      } catch (error) {
        console.error(`❌ Failed to create visualizer for ${cardId}-${role}:`, error);
      }
    }
    
    // Setup card-specific interactions
    this.setupCardInteractions(cardElement, cardData);
    this.decorateCard(cardElement, cardData);
    this.registerReactiveElements(cardData);
    this.startCardSynergyLoop(cardData);

    this.cards.set(cardId, cardData);
    this.applyScrollTiltToCards(this.scrollTilt);
  }
  
  applyCardConfiguration(visualizer, config, role) {
    if (!visualizer.setConfiguration) return;
    
    // Apply geometry preferences
    if (config.geometryPrefs && config.geometryPrefs.length > 0) {
      const preferredGeometry = config.geometryPrefs[Math.floor(Math.random() * config.geometryPrefs.length)];
      visualizer.currentGeometry = preferredGeometry;
      visualizer.targetGeometry = preferredGeometry;
    }
    
    // Apply color scheme
    const colorSchemes = {
      'polychora': { r: 0.0, g: 1.0, b: 1.0, shift: 0 },
      'quantum': { r: 0.5, g: 0.0, b: 1.0, shift: 60 },
      'holographic': { r: 1.0, g: 0.0, b: 0.5, shift: 300 },
      'portfolio': { r: 1.0, g: 1.0, b: 0.0, shift: 45 },
      'cyan-magenta': { r: 0.0, g: 1.0, b: 1.0, shift: 180 }
    };
    
    if (config.colorScheme && colorSchemes[config.colorScheme]) {
      const scheme = colorSchemes[config.colorScheme];
      visualizer.roleParams.colorShift = scheme.shift + (Math.random() - 0.5) * 60;
    }
    
    // Apply role-specific intensity modifications
    const roleIntensityMods = {
      'background': 0.3,
      'shadow': 0.5,
      'content': 1.0,
      'highlight': 0.7,
      'accent': 0.4
    };
    
    if (roleIntensityMods[role]) {
      visualizer.roleParams.intensity *= roleIntensityMods[role];
    }
  }

  decorateCard(cardElement, cardData) {
    if (!cardElement || cardElement.dataset.brandDecorated === 'true') return;

    cardElement.dataset.brandDecorated = 'true';
    cardElement.classList.add('card-brand-enhanced');
    cardElement.dataset.focusState = cardElement.dataset.focusState || 'idle';
    cardElement.style.setProperty('--scroll-tilt', this.scrollTilt.toFixed(4));
    cardElement.style.setProperty('--visualizer-scroll-tilt', this.scrollTilt.toFixed(4));
    cardElement.style.setProperty('--scroll-tilt-deg', `${(this.scrollTilt * 12).toFixed(2)}deg`);
    cardElement.style.setProperty('--scroll-momentum', this.scrollMomentum.toFixed(4));

    const targetContainer =
      cardElement.querySelector('.visualization-container') ||
      cardElement.querySelector('.card-preview') ||
      cardElement.querySelector('.card-visual') ||
      cardElement;

    if (targetContainer && !['relative', 'absolute', 'fixed'].includes(getComputedStyle(targetContainer).position)) {
      targetContainer.style.position = 'relative';
    }

    this.expandCanvasBounds(targetContainer);
    this.insertBrandOverlay(targetContainer, cardData);

    const observer = new MutationObserver(() => {
      this.expandCanvasBounds(targetContainer);
      this.insertBrandOverlay(targetContainer, cardData);
      this.registerReactiveElements(cardData);
    });

    observer.observe(targetContainer, { childList: true, subtree: true });

    const previousCleanup = cardData.cleanup;
    cardData.cleanup = () => {
      observer.disconnect();
      if (typeof previousCleanup === 'function') {
        previousCleanup();
      }
    };

    this.registerReactiveElements(cardData);
  }

  expandCanvasBounds(container) {
    if (!container) return;
    const canvases = container.querySelectorAll('canvas');
    canvases.forEach(canvas => this.styleVisualizerCanvas(canvas));
  }

  styleVisualizerCanvas(canvas) {
    if (!canvas || canvas.dataset.brandExpanded === 'true') return;

    canvas.dataset.brandExpanded = 'true';
    canvas.dataset.focusReactive = 'true';
    canvas.style.position = 'absolute';
    canvas.style.top = '50%';
    canvas.style.left = '50%';
    canvas.style.width = '135%';
    canvas.style.height = '135%';
    canvas.style.transform = 'translate(-50%, -50%) scale(1.05)';
    canvas.style.transformOrigin = 'center';
    canvas.style.pointerEvents = 'none';
    canvas.style.borderRadius = '20px';
    canvas.style.willChange = 'transform, filter';
  }

  insertBrandOverlay(container, cardData) {
    if (!container) return;

    const hasOverlay = container.querySelector('.card-brand-overlay');
    const hasVideo = container.querySelector('.card-brand-video');

    if (hasOverlay && hasVideo) {
      return;
    }

    const assetIndex = this.brandAssignmentIndex;
    const imageSrc = hasOverlay ? null : this.selectAsset(this.brandAssets.images, assetIndex);
    const videoSrc = hasVideo ? null : this.selectAsset(this.brandAssets.videos, assetIndex);
    let assetApplied = false;

    if (!hasOverlay && imageSrc) {
      const overlay = document.createElement('div');
      overlay.className = 'card-brand-overlay';
      overlay.style.setProperty('--brand-rotation', `${(Math.random() * 12 - 6).toFixed(2)}deg`);
      overlay.style.backgroundImage = `url('${this.getMediaPath(imageSrc)}')`;
      overlay.setAttribute('aria-hidden', 'true');
      overlay.dataset.focusReactive = 'true';
      container.appendChild(overlay);
      if (cardData) {
        cardData.layers.overlay = overlay;
      }
      assetApplied = true;
    }

    if (!hasVideo && videoSrc) {
      const video = document.createElement('video');
      video.className = 'card-brand-video';
      video.muted = true;
      video.loop = true;
      video.autoplay = true;
      video.playsInline = true;
      video.preload = 'metadata';
      video.src = this.getMediaPath(videoSrc);
      video.style.setProperty('--brand-rotation', `${(Math.random() * 10 - 5).toFixed(2)}deg`);
      video.setAttribute('aria-hidden', 'true');
      video.dataset.focusReactive = 'true';
      video.addEventListener('error', () => {
        if (video.parentElement) {
          video.remove();
        }
        if (cardData) {
          cardData.layers.video = null;
          if (cardData.brandVideo === video) {
            delete cardData.brandVideo;
          }
          this.registerReactiveElements(cardData);
        }
      });
      video.addEventListener('loadeddata', () => {
        video.play().catch(() => {});
        if (cardData) {
          this.registerReactiveElements(cardData);
        }
      });
      container.appendChild(video);

      if (cardData) {
        cardData.brandVideo = video;
        cardData.layers.video = video;
      }
      assetApplied = true;
    }

    if (assetApplied) {
      this.brandAssignmentIndex++;
      if (cardData) {
        this.registerReactiveElements(cardData);
      }
    }
  }

  registerReactiveElements(cardData) {
    if (!cardData?.element) return;

    const selectors = [
      '.card-frame',
      '.card-shell',
      '.card-wrapper',
      '.card-content',
      '.card-foreground',
      '.card-background',
      '.card-visual',
      '.visualization-container',
      '.card-preview',
      '.card-title',
      '.card-subtitle',
      '.card-description',
      '.card-meta',
      'img',
      'video',
      'canvas'
    ];

    const reactiveSet = new Set(cardData.reactiveElements || []);

    selectors.forEach(selector => {
      cardData.element.querySelectorAll(selector).forEach(el => {
        if (el !== cardData.element) {
          reactiveSet.add(el);
        }
      });
    });

    if (cardData.layers.overlay) {
      reactiveSet.add(cardData.layers.overlay);
    }
    if (cardData.layers.video) {
      reactiveSet.add(cardData.layers.video);
    }

    const reactiveElements = Array.from(reactiveSet).filter(el => el && el.isConnected);
    reactiveElements.forEach(el => {
      el.dataset.focusReactive = 'true';
    });

    cardData.reactiveElements = reactiveElements;
  }

  startCardSynergyLoop(cardData) {
    if (!cardData?.element) return;

    const animate = () => {
      const targetFocus = cardData.active ? 1 : 0;
      cardData.focusIntensity += (targetFocus - cardData.focusIntensity) * 0.12;

      if (cardData.clickPulse > 0.001) {
        cardData.clickPulse *= 0.92;
      } else {
        cardData.clickPulse = 0;
      }

      const pointer = cardData.pointer;
      pointer.smoothX += (pointer.rawX - pointer.smoothX) * 0.18;
      pointer.smoothY += (pointer.rawY - pointer.smoothY) * 0.18;

      const tiltX = (pointer.smoothY - 0.5) * 2;
      const tiltY = (pointer.smoothX - 0.5) * 2;

      cardData.currentTilt = { x: tiltX, y: tiltY };

      this.applyCardSynergy(cardData, tiltX, tiltY);

      cardData.synergyRaf = requestAnimationFrame(animate);
    };

    animate();

    const previousCleanup = cardData.cleanup;
    cardData.cleanup = () => {
      if (cardData.synergyRaf) {
        cancelAnimationFrame(cardData.synergyRaf);
        cardData.synergyRaf = null;
      }
      if (typeof previousCleanup === 'function') {
        previousCleanup();
      }
    };
  }

  applyCardSynergy(cardData, tiltX, tiltY) {
    if (!cardData?.element) return;

    const focus = Math.max(0, Math.min(1, cardData.focusIntensity));
    const momentum = this.scrollMomentum || 0;

    const parallaxStrength = 26 + focus * 24;
    const parallaxX = tiltY * parallaxStrength;
    const parallaxY = tiltX * -parallaxStrength;
    const depthBase = focus * 60 + Math.abs(momentum) * 80;

    cardData.element.style.setProperty('--focus-intensity', focus.toFixed(4));
    cardData.element.style.setProperty('--focus-tilt-x-deg', `${(-tiltX * 14).toFixed(2)}deg`);
    cardData.element.style.setProperty('--focus-tilt-y-deg', `${(tiltY * 18).toFixed(2)}deg`);
    cardData.element.style.setProperty('--focus-parallax-x', `${parallaxX.toFixed(3)}px`);
    cardData.element.style.setProperty('--focus-parallax-y', `${parallaxY.toFixed(3)}px`);
    cardData.element.style.setProperty('--focus-depth', `${depthBase.toFixed(2)}px`);
    cardData.element.style.setProperty('--focus-pulse', cardData.clickPulse.toFixed(3));

    const overlay = cardData.layers.overlay;
    if (overlay) {
      overlay.style.opacity = '';
    }

    if (cardData.brandVideo) {
      const playbackRate = 0.85 + focus * 0.5 + Math.abs(momentum) * 0.25;
      cardData.brandVideo.playbackRate = Math.max(0.75, Math.min(1.8, playbackRate));
    }

    const sharedTiltTarget = this.scrollTilt + tiltY * 0.45;
    cardData.visualizers.forEach(visualizer => {
      if (!visualizer) return;
      const baseXW = visualizer.variantParams?.rot4dXW || 0;
      const baseYW = visualizer.variantParams?.rot4dYW || 0;
      const baseZW = visualizer.variantParams?.rot4dZW || 0;
      const focusEnergy = focus * 0.6;

      if (visualizer.externalRotations) {
        visualizer.externalRotations.xw = baseXW + (-tiltX * 0.55 + momentum * 0.4) * focusEnergy;
        visualizer.externalRotations.yw = baseYW + (tiltY * 0.65 + momentum * -0.35) * focusEnergy;
        visualizer.externalRotations.zw = baseZW + (tiltX * 0.35 + tiltY * 0.25) * focusEnergy;
      }

      if (typeof visualizer.scrollTiltTarget === 'number') {
        visualizer.scrollTiltTarget = sharedTiltTarget;
      }
    });

    cardData.reactiveElements?.forEach(el => {
      if (!el.isConnected) return;
      el.style.setProperty('--focus-intensity', focus.toFixed(4));
    });
  }

  selectAsset(list, index) {
    if (!Array.isArray(list) || list.length === 0) return null;
    return list[index % list.length];
  }

  getMediaPath(assetPath) {
    if (!assetPath) return '';
    const trimmed = assetPath.trim();
    if (trimmed.startsWith('http')) {
      return trimmed;
    }
    if (trimmed.startsWith('assets/')) {
      return encodeURI(trimmed);
    }
    return encodeURI(`./${trimmed}`);
  }

  ensureBrandStyles() {
    if (document.getElementById('card-brand-enhancements')) return;

    const style = document.createElement('style');
    style.id = 'card-brand-enhancements';
    style.textContent = `
      .card-brand-enhanced {
        position: relative;
        --scroll-tilt: 0;
        --visualizer-scroll-tilt: 0;
        --scroll-momentum: 0;
        --focus-intensity: 0;
        --focus-tilt-x-deg: 0deg;
        --focus-tilt-y-deg: 0deg;
        --focus-parallax-x: 0px;
        --focus-parallax-y: 0px;
        --focus-depth: 0px;
        --focus-pulse: 0;
      }

      .card-brand-enhanced .visualization-container,
      .card-brand-enhanced .card-preview,
      .card-brand-enhanced .card-visual {
        overflow: visible !important;
        transform-style: preserve-3d;
      }

      .card-brand-enhanced [data-focus-reactive="true"] {
        position: relative;
        transition:
          transform 0.6s cubic-bezier(0.16, 1, 0.3, 1),
          filter 0.6s cubic-bezier(0.16, 1, 0.3, 1),
          opacity 0.6s ease,
          box-shadow 0.6s ease;
        transform:
          perspective(1400px)
          rotateX(var(--focus-tilt-x-deg))
          rotateY(var(--focus-tilt-y-deg))
          translate3d(
            calc(var(--focus-parallax-x) * 0.45),
            calc(var(--focus-parallax-y) * 0.45),
            var(--focus-depth)
          );
        filter:
          saturate(calc(1 + var(--focus-intensity) * 0.2))
          brightness(calc(1 + var(--focus-intensity) * 0.15));
        will-change: transform, filter, opacity;
      }

      .card-brand-enhanced[data-focus-state="active"] [data-focus-reactive="true"],
      .card-brand-enhanced[data-focus-state="selected"] [data-focus-reactive="true"] {
        box-shadow:
          0 0 calc(18px + 22px * var(--focus-intensity)) rgba(0, 255, 255, 0.25),
          0 0 calc(28px + 24px * var(--focus-intensity)) rgba(255, 0, 255, 0.22);
      }

      .card-brand-enhanced canvas,
      .card-brand-enhanced .visualizer-canvas {
        will-change: transform, filter;
      }

      .card-brand-enhanced canvas.card-visualizer-canvas,
      .card-brand-enhanced canvas.visualizer-canvas,
      .card-brand-enhanced canvas[data-visualizer],
      .card-brand-enhanced canvas[data-webgl] {
        position: absolute !important;
        top: 50% !important;
        left: 50% !important;
        width: 135% !important;
        height: 135% !important;
        transform: translate(-50%, -50%) scale(1.12)
          rotateX(calc(var(--visualizer-scroll-tilt, 0) * -6deg + var(--focus-tilt-x-deg)))
          rotateY(calc(var(--visualizer-scroll-tilt, 0) * 3deg + var(--focus-tilt-y-deg)))
          translateZ(calc(var(--focus-depth, 0px) * 0.32 + var(--scroll-momentum) * 22px));
        transform-origin: center;
        pointer-events: none;
        border-radius: 20px;
        filter: saturate(calc(1.08 + var(--focus-intensity) * 0.18))
          brightness(calc(1.04 + var(--focus-intensity) * 0.22));
        box-shadow:
          0 0 calc(45px + 35px * var(--focus-intensity)) rgba(0, 255, 255, 0.22),
          0 0 calc(85px + 35px * var(--focus-intensity)) rgba(255, 0, 255, 0.18);
      }

      .card-brand-overlay {
        position: absolute;
        inset: -25%;
        background-position: center;
        background-size: contain;
        background-repeat: no-repeat;
        opacity: calc(0.24 + var(--focus-intensity) * 0.28 + var(--focus-pulse) * 0.18);
        mix-blend-mode: screen;
        pointer-events: none;
        transform:
          rotate(var(--brand-rotation, 0deg))
          translate3d(
            calc(var(--focus-parallax-x) * -0.35 + var(--scroll-momentum) * -14px),
            calc(var(--focus-parallax-y) * 0.35 + var(--scroll-momentum) * 18px),
            calc(var(--focus-depth, 0px) * 0.45 + var(--scroll-momentum) * 28px)
          )
          scale(calc(1.04 + var(--focus-intensity) * 0.08 + var(--focus-pulse) * 0.04));
        animation: cardBrandFloat 18s ease-in-out infinite alternate;
        filter:
          saturate(calc(1.2 + var(--focus-intensity) * 0.25))
          drop-shadow(0 0 calc(25px + 25px * var(--focus-intensity)) rgba(0, 255, 255, 0.25));
      }

      .card-brand-video {
        position: absolute;
        inset: -30%;
        object-fit: cover;
        opacity: calc(0.22 + var(--focus-intensity) * 0.35 + var(--focus-pulse) * 0.22);
        mix-blend-mode: lighten;
        pointer-events: none;
        border-radius: 28px;
        transform:
          rotate(var(--brand-rotation, 0deg))
          translate3d(
            calc(var(--focus-parallax-x) * -0.28 + var(--scroll-momentum) * -10px),
            calc(var(--focus-parallax-y) * 0.28 + var(--scroll-momentum) * 20px),
            calc(var(--focus-depth, 0px) * 0.65 + var(--scroll-momentum) * 36px)
          )
          scale(calc(1.05 + var(--focus-intensity) * 0.08));
        filter:
          saturate(calc(1.2 + var(--focus-intensity) * 0.3))
          contrast(calc(1.05 + var(--focus-intensity) * 0.2))
          blur(0.2px);
        animation: cardBrandDrift 24s ease-in-out infinite;
      }

      @keyframes cardBrandFloat {
        0% { transform: rotate(var(--brand-rotation, 0deg)) translate3d(-5%, -5%, 0); }
        50% { transform: rotate(calc(var(--brand-rotation, 0deg) + 4deg)) translate3d(6%, 4%, 10px); }
        100% { transform: rotate(calc(var(--brand-rotation, 0deg) - 3deg)) translate3d(-4%, 6%, -6px); }
      }

      @keyframes cardBrandDrift {
        0% { transform: rotate(var(--brand-rotation, 0deg)) scale(1.02); opacity: 0.18; }
        50% { transform: rotate(calc(var(--brand-rotation, 0deg) + 2deg)) scale(1.08); opacity: 0.33; }
        100% { transform: rotate(calc(var(--brand-rotation, 0deg) - 2deg)) scale(1.04); opacity: 0.22; }
      }
    `;

    document.head.appendChild(style);
  }

  setupScrollTiltSync() {
    const wheelHandler = (event) => {
      const delta = Math.max(-200, Math.min(200, event.deltaY || 0));
      const normalized = delta / 160;
      this.scrollTiltTarget += normalized;
      this.scrollTiltTarget = Math.max(-3, Math.min(3, this.scrollTiltTarget));

      if (!this.scrollTiltRaf) {
        this.scrollTiltRaf = requestAnimationFrame(() => this.updateScrollTiltAnimation());
      }
    };

    window.addEventListener('wheel', wheelHandler, { passive: true });

    window.addEventListener('scroll', () => {
      if (!this.scrollTiltRaf) {
        this.scrollTiltRaf = requestAnimationFrame(() => this.updateScrollTiltAnimation());
      }
    }, { passive: true });
  }

  updateScrollTiltAnimation() {
    this.scrollTilt += (this.scrollTiltTarget - this.scrollTilt) * 0.2;
    this.scrollTiltTarget *= 0.88;
    const momentumDelta = this.scrollTiltTarget - this.scrollTilt;
    this.scrollMomentum = this.scrollMomentum * 0.82 + momentumDelta * 0.35;

    if (Math.abs(this.scrollTilt) < 0.0005) {
      this.scrollTilt = 0;
    }

    this.applyScrollTiltToCards(this.scrollTilt);

    if (Math.abs(this.scrollTilt) > 0.001 || Math.abs(this.scrollTiltTarget) > 0.001) {
      this.scrollTiltRaf = requestAnimationFrame(() => this.updateScrollTiltAnimation());
    } else {
      this.scrollTiltRaf = null;
      this.scrollTilt = 0;
      this.scrollTiltTarget = 0;
      this.scrollMomentum = 0;
      this.applyScrollTiltToCards(this.scrollTilt);
    }
  }

  applyScrollTiltToCards(tiltValue) {
    const clamped = Math.max(-2, Math.min(2, tiltValue));
    const tiltString = clamped.toFixed(4);

    document.documentElement.style.setProperty('--scroll-tilt', tiltString);
    document.documentElement.style.setProperty('--visualizer-scroll-tilt', tiltString);
    document.documentElement.style.setProperty('--scroll-tilt-deg', `${(clamped * 12).toFixed(2)}deg`);
    document.documentElement.style.setProperty('--scroll-momentum', this.scrollMomentum.toFixed(4));

    this.cards.forEach(cardData => {
      if (cardData?.element) {
        cardData.element.style.setProperty('--scroll-tilt', tiltString);
        cardData.element.style.setProperty('--visualizer-scroll-tilt', tiltString);
        cardData.element.style.setProperty('--scroll-tilt-deg', `${(clamped * 12).toFixed(2)}deg`);
        cardData.element.style.setProperty('--scroll-momentum', this.scrollMomentum.toFixed(4));
      }
    });

    window.dispatchEvent(new CustomEvent('visualizer-scroll-tilt', {
      detail: { tilt: clamped }
    }));
  }
  
  setupCardInteractions(cardElement, cardData) {
    let isHovered = false;
    let mouseX = 0.5, mouseY = 0.5;
    
    // Enhanced mouse tracking
    const handleMouseMove = (e) => {
      if (!isHovered) return;

      const rect = cardElement.getBoundingClientRect();
      mouseX = (e.clientX - rect.left) / rect.width;
      mouseY = (e.clientY - rect.top) / rect.height;
      mouseX = Math.max(0, Math.min(1, mouseX));
      mouseY = Math.max(0, Math.min(1, mouseY));

      // Update all visualizers for this card
      for (const visualizer of cardData.visualizers.values()) {
        visualizer.updateInteraction(mouseX, mouseY, 1.0);
      }

      // Update CSS custom properties for card transforms
      cardElement.style.setProperty('--mouse-x', (mouseX * 100) + '%');
      cardElement.style.setProperty('--mouse-y', (mouseY * 100) + '%');
      cardElement.style.setProperty('--bend-intensity', '1');

      cardData.pointer.rawX = mouseX;
      cardData.pointer.rawY = mouseY;
    };

    const handleMouseEnter = () => {
      isHovered = true;
      cardData.active = true;
      cardElement.classList.add('visualizer-active');
      cardElement.dataset.focusState = 'active';

      // Boost reactivity for all visualizers
      for (const visualizer of cardData.visualizers.values()) {
        visualizer.reactivity = 1.5;
      }
      
      console.log(`🎯 Card activated: ${cardElement.id}`);
    };
    
    const handleMouseLeave = () => {
      isHovered = false;
      cardData.active = false;
      cardElement.classList.remove('visualizer-active');
      cardElement.dataset.focusState = 'idle';

      // Reset visualizers
      for (const visualizer of cardData.visualizers.values()) {
        visualizer.reactivity = 1.0;
        visualizer.mouseIntensity *= 0.8;
      }

      // Reset CSS transforms
      cardElement.style.setProperty('--mouse-x', '50%');
      cardElement.style.setProperty('--mouse-y', '50%');
      cardElement.style.setProperty('--bend-intensity', '0');

      cardData.pointer.rawX = 0.5;
      cardData.pointer.rawY = 0.5;
    };

    const handleClick = (e) => {
      const rect = cardElement.getBoundingClientRect();
      const clickX = (e.clientX - rect.left) / rect.width;
      const clickY = (e.clientY - rect.top) / rect.height;

      // Trigger click effect on all visualizers
      for (const visualizer of cardData.visualizers.values()) {
        visualizer.triggerClick(clickX, clickY);
      }

      cardData.clickPulse = 1;
      cardElement.dataset.focusState = 'selected';
      setTimeout(() => {
        cardElement.dataset.focusState = cardData.active ? 'active' : 'idle';
      }, 420);

      console.log(`💥 Card clicked: ${cardElement.id}`);
    };

    // Add event listeners
    cardElement.addEventListener('mousemove', handleMouseMove, { passive: true });
    cardElement.addEventListener('mouseenter', handleMouseEnter);
    cardElement.addEventListener('mouseleave', handleMouseLeave);
    cardElement.addEventListener('click', handleClick);
    
    // Store cleanup functions
    const previousCleanup = cardData.cleanup;
    cardData.cleanup = () => {
      cardElement.removeEventListener('mousemove', handleMouseMove);
      cardElement.removeEventListener('mouseenter', handleMouseEnter);
      cardElement.removeEventListener('mouseleave', handleMouseLeave);
      cardElement.removeEventListener('click', handleClick);
      if (typeof previousCleanup === 'function') {
        previousCleanup();
      }
    };
  }
  
  setupPerformanceMonitoring() {
    let performanceCheckCount = 0;
    let badFrameCount = 0;
    let goodFrameCount = 0;
    let frameTimeHistory = [];
    
    const monitor = () => {
      performanceCheckCount++;
      
      // Only check performance every 120 frames (about twice per second at 60fps)
      if (performanceCheckCount % 120 !== 0) {
        requestAnimationFrame(monitor);
        return;
      }
      
      // Check performance and adjust quality if needed
      const now = performance.now();
      const frameTime = now - this.lastFrameTime || 16.67; // Default to 60fps
      this.lastFrameTime = now;
      
      // Use moving average for more stable performance detection
      frameTimeHistory.push(frameTime);
      if (frameTimeHistory.length > 10) {
        frameTimeHistory.shift();
      }
      
      const avgFrameTime = frameTimeHistory.reduce((a, b) => a + b, 0) / frameTimeHistory.length;
      
      // More lenient thresholds to reduce quality cycling
      if (avgFrameTime > 50) { // >50ms = dropping below 20fps (very lenient)
        badFrameCount++;
        goodFrameCount = Math.max(0, goodFrameCount - 1);
        
        // Need 5 consecutive bad measurements before reducing quality
        if (badFrameCount >= 5 && this.performanceMonitor.performanceMode !== 'low') {
          this.reduceQuality();
          badFrameCount = 0;
          frameTimeHistory = []; // Reset history after change
        }
      } else if (avgFrameTime < 20) { // <20ms = above 50fps (conservative)
        goodFrameCount++;
        badFrameCount = Math.max(0, badFrameCount - 1);
        
        // Need 8 consecutive good measurements before increasing quality
        if (goodFrameCount >= 8 && this.performanceMonitor.performanceMode !== 'high') {
          this.increaseQuality();
          goodFrameCount = 0;
          frameTimeHistory = []; // Reset history after change
        }
      }
      
      // Throttle monitoring frequency when performance is stable
      const nextCheckDelay = (badFrameCount === 0 && goodFrameCount < 3) ? 2000 : 500;
      setTimeout(() => requestAnimationFrame(monitor), nextCheckDelay);
    };
    
    monitor();
  }
  
  reduceQuality() {
    if (this.performanceMonitor.performanceMode === 'low') return;
    
    console.log('🔥 Performance issue detected, reducing quality');
    this.performanceMonitor.performanceMode = 'low';
    
    // Disable some visualizers
    for (const cardData of this.cards.values()) {
      if (cardData.visualizers.has('accent')) {
        const accentViz = cardData.visualizers.get('accent');
        accentViz.pause();
      }
      if (cardData.visualizers.has('highlight')) {
        const highlightViz = cardData.visualizers.get('highlight');
        if (cardData.visualizers.size > 2) {
          highlightViz.pause();
        }
      }
    }
  }
  
  increaseQuality() {
    if (this.performanceMonitor.performanceMode === 'high') return;
    
    console.log('⚡ Good performance detected, increasing quality');
    this.performanceMonitor.performanceMode = 'high';
    
    // Re-enable visualizers
    for (const cardData of this.cards.values()) {
      for (const visualizer of cardData.visualizers.values()) {
        if (!visualizer.active) {
          visualizer.resume();
        }
      }
    }
  }
  
  handleResize() {
    // Resize all visualizers
    for (const cardData of this.cards.values()) {
      for (const visualizer of cardData.visualizers.values()) {
        visualizer.resize();
      }
    }
  }
  
  destroyCard(cardId) {
    const cardData = this.cards.get(cardId);
    if (!cardData) return;
    
    // Cleanup visualizers
    if (this.visualizerManager) {
      this.visualizerManager.destroyCardVisualizer(cardData.element);
    }
    
    // Cleanup event listeners
    if (cardData.cleanup) {
      cardData.cleanup();
    }

    if (cardData.brandVideo?.parentElement) {
      cardData.brandVideo.remove();
    }
    const overlay = cardData.element?.querySelector('.card-brand-overlay');
    if (overlay) {
      overlay.remove();
    }

    this.cards.delete(cardId);
    console.log(`🗑️ Card destroyed: ${cardId}`);
  }
  
  getCardStatus() {
    const status = {
      totalCards: this.cards.size,
      activeCards: 0,
      totalVisualizers: 0,
      activeVisualizers: 0,
      performanceMode: this.performanceMonitor.performanceMode
    };
    
    for (const cardData of this.cards.values()) {
      if (cardData.active) status.activeCards++;
      status.totalVisualizers += cardData.visualizers.size;
      
      for (const visualizer of cardData.visualizers.values()) {
        if (visualizer.active) status.activeVisualizers++;
      }
    }
    
    return status;
  }
}

// Global card system instance
window.cardSystemController = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  // Wait a bit for other scripts to load
  await new Promise(resolve => setTimeout(resolve, 500));
  
  window.cardSystemController = new CardSystemController();
  await window.cardSystemController.initialize();
  
  // Debug status logging
  setInterval(() => {
    if (window.cardSystemController) {
      const status = window.cardSystemController.getCardStatus();
      console.log('🎨 Card System Status:', status);
    }
  }, 10000); // Log every 10 seconds
});

console.log('🎨 Card System Initializer loaded');