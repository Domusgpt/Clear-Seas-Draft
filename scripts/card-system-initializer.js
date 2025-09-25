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
      active: false
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
    cardElement.style.setProperty('--scroll-tilt', this.scrollTilt.toFixed(4));
    cardElement.style.setProperty('--visualizer-scroll-tilt', this.scrollTilt.toFixed(4));
    cardElement.style.setProperty('--scroll-tilt-deg', `${(this.scrollTilt * 12).toFixed(2)}deg`);

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
    });

    observer.observe(targetContainer, { childList: true, subtree: true });

    const previousCleanup = cardData.cleanup;
    cardData.cleanup = () => {
      observer.disconnect();
      if (typeof previousCleanup === 'function') {
        previousCleanup();
      }
    };
  }

  expandCanvasBounds(container) {
    if (!container) return;
    const canvases = container.querySelectorAll('canvas');
    canvases.forEach(canvas => this.styleVisualizerCanvas(canvas));
  }

  styleVisualizerCanvas(canvas) {
    if (!canvas || canvas.dataset.brandExpanded === 'true') return;

    canvas.dataset.brandExpanded = 'true';
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
      container.appendChild(overlay);
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
      video.addEventListener('error', () => video.remove());
      video.addEventListener('loadeddata', () => {
        video.play().catch(() => {});
      });
      container.appendChild(video);

      if (cardData) {
        cardData.brandVideo = video;
      }
      assetApplied = true;
    }

    if (assetApplied) {
      this.brandAssignmentIndex++;
    }
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
      }

      .card-brand-enhanced .visualization-container,
      .card-brand-enhanced .card-preview,
      .card-brand-enhanced .card-visual {
        overflow: visible !important;
        transform-style: preserve-3d;
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
          rotateX(calc(var(--visualizer-scroll-tilt, 0) * -6deg))
          rotateY(calc(var(--visualizer-scroll-tilt, 0) * 3deg));
        transform-origin: center;
        pointer-events: none;
        border-radius: 20px;
        filter: saturate(1.08) brightness(1.04);
        box-shadow:
          0 0 45px rgba(0, 255, 255, 0.22),
          0 0 85px rgba(255, 0, 255, 0.18);
      }

      .card-brand-overlay {
        position: absolute;
        inset: -25%;
        background-position: center;
        background-size: contain;
        background-repeat: no-repeat;
        opacity: 0.32;
        mix-blend-mode: screen;
        pointer-events: none;
        transform: rotate(var(--brand-rotation, 0deg));
        animation: cardBrandFloat 18s ease-in-out infinite alternate;
        filter: saturate(1.2) drop-shadow(0 0 25px rgba(0, 255, 255, 0.25));
      }

      .card-brand-video {
        position: absolute;
        inset: -30%;
        object-fit: cover;
        opacity: 0.28;
        mix-blend-mode: lighten;
        pointer-events: none;
        border-radius: 28px;
        transform: rotate(var(--brand-rotation, 0deg)) scale(1.05);
        filter: saturate(1.2) contrast(1.05) blur(0.2px);
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
      this.applyScrollTiltToCards(this.scrollTilt);
    }
  }

  applyScrollTiltToCards(tiltValue) {
    const clamped = Math.max(-2, Math.min(2, tiltValue));
    const tiltString = clamped.toFixed(4);

    document.documentElement.style.setProperty('--scroll-tilt', tiltString);
    document.documentElement.style.setProperty('--visualizer-scroll-tilt', tiltString);
    document.documentElement.style.setProperty('--scroll-tilt-deg', `${(clamped * 12).toFixed(2)}deg`);

    this.cards.forEach(cardData => {
      if (cardData?.element) {
        cardData.element.style.setProperty('--scroll-tilt', tiltString);
        cardData.element.style.setProperty('--visualizer-scroll-tilt', tiltString);
        cardData.element.style.setProperty('--scroll-tilt-deg', `${(clamped * 12).toFixed(2)}deg`);
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
      
      // Update all visualizers for this card
      for (const visualizer of cardData.visualizers.values()) {
        visualizer.updateInteraction(mouseX, mouseY, 1.0);
      }
      
      // Update CSS custom properties for card transforms
      cardElement.style.setProperty('--mouse-x', (mouseX * 100) + '%');
      cardElement.style.setProperty('--mouse-y', (mouseY * 100) + '%');
      cardElement.style.setProperty('--bend-intensity', '1');
    };
    
    const handleMouseEnter = () => {
      isHovered = true;
      cardData.active = true;
      cardElement.classList.add('visualizer-active');
      
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
      
      // Reset visualizers
      for (const visualizer of cardData.visualizers.values()) {
        visualizer.reactivity = 1.0;
        visualizer.mouseIntensity *= 0.8;
      }
      
      // Reset CSS transforms
      cardElement.style.setProperty('--mouse-x', '50%');
      cardElement.style.setProperty('--mouse-y', '50%');
      cardElement.style.setProperty('--bend-intensity', '0');
    };
    
    const handleClick = (e) => {
      const rect = cardElement.getBoundingClientRect();
      const clickX = (e.clientX - rect.left) / rect.width;
      const clickY = (e.clientY - rect.top) / rect.height;
      
      // Trigger click effect on all visualizers
      for (const visualizer of cardData.visualizers.values()) {
        visualizer.triggerClick(clickX, clickY);
      }
      
      console.log(`💥 Card clicked: ${cardElement.id}`);
    };
    
    // Add event listeners
    cardElement.addEventListener('mousemove', handleMouseMove, { passive: true });
    cardElement.addEventListener('mouseenter', handleMouseEnter);
    cardElement.addEventListener('mouseleave', handleMouseLeave);
    cardElement.addEventListener('click', handleClick);
    
    // Store cleanup functions
    cardData.cleanup = () => {
      cardElement.removeEventListener('mousemove', handleMouseMove);
      cardElement.removeEventListener('mouseenter', handleMouseEnter);
      cardElement.removeEventListener('mouseleave', handleMouseLeave);
      cardElement.removeEventListener('click', handleClick);
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