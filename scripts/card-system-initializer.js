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
    
    this.cards.set(cardId, cardData);
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