/*
 * Clear Seas Solutions - Advanced VIB34D Visualizer Integration
 * Micro-reactive systems with performance optimization
 * 
 * Manages multiple VIB34D instances across sections with intelligent
 * resource management and theme-synchronized parameter control
 */

class VIB34DIntegrationManager {
  constructor() {
    this.visualizers = new Map();
    this.performanceMetrics = {
      activeInstances: 0,
      gpuMemoryUsage: 0,
      frameTime: 0,
      renderCalls: 0
    };
    this.observers = new Map();
    this.currentTheme = 'polychora';
    this.isInitialized = false;
    
    // Performance optimization settings
    this.maxActiveVisualizers = 3;
    this.priorityQueue = [];
    this.resourceMonitor = null;
    
    this.init();
  }

  async init() {
    await this.setupIntersectionObservers();
    this.setupThemeListeners();
    this.setupPerformanceMonitoring();
    this.initializeVisualizers();
    this.isInitialized = true;
    
    console.log('🎨 VIB34D Integration Manager initialized');
  }

  async setupIntersectionObservers() {
    // Main viewport observer for active visualizer management
    const viewportObserver = new IntersectionObserver(
      (entries) => this.handleViewportIntersection(entries),
      {
        root: null,
        rootMargin: '100px',
        threshold: [0.1, 0.5, 0.9]
      }
    );

    // Precise observer for micro-reactive triggers
    const preciseObserver = new IntersectionObserver(
      (entries) => this.handlePreciseIntersection(entries),
      {
        root: null,
        rootMargin: '50px',
        threshold: 0.3
      }
    );

    this.observers.set('viewport', viewportObserver);
    this.observers.set('precise', preciseObserver);

    // Observe all visualizer containers
    document.querySelectorAll('.vib34d-container').forEach(container => {
      viewportObserver.observe(container);
      preciseObserver.observe(container);
    });
  }

  handleViewportIntersection(entries) {
    entries.forEach(entry => {
      const id = entry.target.id || entry.target.dataset.visualizerId;
      const isVisible = entry.isIntersecting;
      const visibility = entry.intersectionRatio;

      if (isVisible && visibility > 0.5) {
        this.activateVisualizer(id, entry.target);
      } else if (!isVisible || visibility < 0.1) {
        this.deactivateVisualizer(id);
      }
    });

    this.optimizeResourceAllocation();
  }

  handlePreciseIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.triggerMicroReaction(entry.target);
      }
    });
  }

  async activateVisualizer(id, container) {
    if (this.visualizers.has(id)) return;

    const config = this.getVisualizerConfig(container);
    const visualizer = await this.createVisualizerInstance(id, container, config);
    
    if (visualizer) {
      this.visualizers.set(id, {
        instance: visualizer,
        container,
        config,
        isActive: true,
        priority: this.calculatePriority(container),
        lastRender: Date.now()
      });

      this.performanceMetrics.activeInstances++;
      this.priorityQueue.push({ id, priority: this.calculatePriority(container) });
      this.priorityQueue.sort((a, b) => b.priority - a.priority);

      console.log(`🌟 Activated visualizer: ${id}`);
    }
  }

  async deactivateVisualizer(id) {
    const visualizer = this.visualizers.get(id);
    if (!visualizer) return;

    // Graceful cleanup
    if (visualizer.instance && typeof visualizer.instance.destroy === 'function') {
      visualizer.instance.destroy();
    }

    this.visualizers.delete(id);
    this.performanceMetrics.activeInstances--;
    this.priorityQueue = this.priorityQueue.filter(item => item.id !== id);

    console.log(`💤 Deactivated visualizer: ${id}`);
  }

  async createVisualizerInstance(id, container, config) {
    try {
      // Create iframe for VIB34D viewer with optimized parameters
      const iframe = document.createElement('iframe');
      iframe.src = this.buildVisualizerUrl(config);
      iframe.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.5s ease;
      `;

      container.appendChild(iframe);

      // Wait for load and apply fade-in
      return new Promise((resolve) => {
        iframe.onload = () => {
          setTimeout(() => {
            iframe.style.opacity = '1';
            resolve({
              iframe,
              config,
              destroy: () => {
                iframe.style.opacity = '0';
                setTimeout(() => container.removeChild(iframe), 500);
              }
            });
          }, 100);
        };
      });
    } catch (error) {
      console.error(`Failed to create visualizer ${id}:`, error);
      return null;
    }
  }

  buildVisualizerUrl(config) {
    const baseUrl = 'https://domusgpt.github.io/vib34d-ultimate-viewer/viewer.html';
    const params = new URLSearchParams();

    // System selection based on config
    params.append('system', config.system || this.currentTheme);
    
    // Performance optimizations
    params.append('quality', config.quality || 'medium');
    params.append('particles', config.particles || '50');
    params.append('effects', config.effects || 'standard');
    
    // Theme synchronization
    params.append('theme', this.currentTheme);
    params.append('autoRotate', config.autoRotate !== false ? 'true' : 'false');
    
    // Micro-reactive parameters
    if (config.microReactive) {
      params.append('reactive', 'true');
      params.append('sensitivity', config.sensitivity || '0.7');
    }

    return `${baseUrl}?${params.toString()}`;
  }

  getVisualizerConfig(container) {
    const section = container.closest('section');
    const theme = section?.dataset.theme || 'polychora';
    const isHero = container.classList.contains('hero-background');
    const isCard = container.closest('.card') !== null;

    return {
      system: this.mapThemeToSystem(theme),
      quality: isHero ? 'high' : 'medium',
      particles: isHero ? '100' : (isCard ? '25' : '50'),
      effects: isHero ? 'enhanced' : 'standard',
      autoRotate: !isCard,
      microReactive: isCard || container.dataset.reactive === 'true',
      sensitivity: container.dataset.sensitivity || '0.7'
    };
  }

  mapThemeToSystem(theme) {
    const themeMap = {
      'teal': 'faceted',
      'purple': 'quantum', 
      'red': 'holographic',
      'polychora': 'polychora'
    };
    return themeMap[theme] || 'polychora';
  }

  calculatePriority(container) {
    let priority = 0;
    
    // Hero sections get highest priority
    if (container.classList.contains('hero-background')) priority += 100;
    
    // Currently visible sections get higher priority
    const rect = container.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const visibilityRatio = Math.max(0, Math.min(1, 
      (Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0)) / viewportHeight
    ));
    priority += visibilityRatio * 50;
    
    // Cards get medium priority
    if (container.closest('.card')) priority += 25;
    
    // Distance from viewport center affects priority
    const centerDistance = Math.abs(rect.top + rect.height / 2 - viewportHeight / 2);
    priority += Math.max(0, 25 - centerDistance / 100);

    return priority;
  }

  triggerMicroReaction(container) {
    const visualizer = Array.from(this.visualizers.values()).find(
      v => v.container === container
    );

    if (visualizer && visualizer.config.microReactive) {
      // Send micro-reaction trigger to visualizer
      this.sendMessageToVisualizer(visualizer, {
        type: 'microReaction',
        intensity: Math.random() * 0.5 + 0.5,
        timestamp: Date.now()
      });
    }
  }

  sendMessageToVisualizer(visualizer, message) {
    if (visualizer.instance && visualizer.instance.iframe) {
      try {
        visualizer.instance.iframe.contentWindow.postMessage(message, '*');
      } catch (error) {
        console.warn('Failed to send message to visualizer:', error);
      }
    }
  }

  setupThemeListeners() {
    // Listen for theme changes from the main theme system
    document.addEventListener('themechange', (event) => {
      this.handleThemeChange(event.detail?.theme || this.currentTheme);
    });

    // MutationObserver for data-theme attribute changes
    const themeObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          const newTheme = mutation.target.getAttribute('data-theme');
          if (newTheme !== this.currentTheme) {
            this.handleThemeChange(newTheme);
          }
        }
      });
    });

    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
  }

  async handleThemeChange(newTheme) {
    if (newTheme === this.currentTheme) return;

    this.currentTheme = newTheme;
    console.log(`🎨 Theme changed to: ${newTheme}`);

    // Update all active visualizers with new theme
    const updatePromises = Array.from(this.visualizers.entries()).map(
      async ([id, visualizer]) => {
        const newConfig = { ...visualizer.config, system: this.mapThemeToSystem(newTheme) };
        await this.updateVisualizerConfig(id, newConfig);
      }
    );

    await Promise.all(updatePromises);
  }

  async updateVisualizerConfig(id, newConfig) {
    const visualizer = this.visualizers.get(id);
    if (!visualizer) return;

    // Send configuration update to visualizer
    this.sendMessageToVisualizer(visualizer, {
      type: 'updateConfig',
      config: newConfig
    });

    visualizer.config = newConfig;
  }

  setupPerformanceMonitoring() {
    let frameCount = 0;
    let lastTime = performance.now();

    const measurePerformance = () => {
      frameCount++;
      const now = performance.now();
      const deltaTime = now - lastTime;

      if (deltaTime >= 1000) { // Update every second
        this.performanceMetrics.fps = Math.round((frameCount * 1000) / deltaTime);
        this.performanceMetrics.frameTime = deltaTime / frameCount;
        
        frameCount = 0;
        lastTime = now;
        
        this.updatePerformanceDisplay();
      }

      requestAnimationFrame(measurePerformance);
    };

    this.resourceMonitor = requestAnimationFrame(measurePerformance);
  }

  updatePerformanceDisplay() {
    // Update performance metrics in hero section if available
    const metricsDisplay = document.querySelector('.performance-metrics');
    if (metricsDisplay) {
      const fpsElement = metricsDisplay.querySelector('.fps-value');
      const instancesElement = metricsDisplay.querySelector('.instances-value');
      
      if (fpsElement) fpsElement.textContent = this.performanceMetrics.fps;
      if (instancesElement) instancesElement.textContent = this.performanceMetrics.activeInstances;
    }
  }

  optimizeResourceAllocation() {
    // Ensure we don't exceed maximum active visualizers
    if (this.visualizers.size > this.maxActiveVisualizers) {
      // Sort by priority and deactivate lowest priority visualizers
      const sorted = this.priorityQueue.slice().sort((a, b) => a.priority - b.priority);
      const toDeactivate = sorted.slice(0, this.visualizers.size - this.maxActiveVisualizers);
      
      toDeactivate.forEach(item => {
        this.deactivateVisualizer(item.id);
      });
    }
  }

  initializeVisualizers() {
    // Initialize visualizers that are immediately visible
    document.querySelectorAll('.vib34d-container').forEach(container => {
      const rect = container.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const id = container.id || `visualizer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        container.dataset.visualizerId = id;
        this.activateVisualizer(id, container);
      }
    });
  }

  // Public API methods
  getPerformanceMetrics() {
    return { ...this.performanceMetrics };
  }

  setMaxActiveVisualizers(max) {
    this.maxActiveVisualizers = Math.max(1, max);
    this.optimizeResourceAllocation();
  }

  forceThemeUpdate(theme) {
    this.handleThemeChange(theme);
  }

  getActiveVisualizers() {
    return Array.from(this.visualizers.keys());
  }

  destroy() {
    // Cleanup all visualizers
    this.visualizers.forEach((visualizer, id) => {
      this.deactivateVisualizer(id);
    });

    // Cleanup observers
    this.observers.forEach(observer => observer.disconnect());
    
    // Cancel performance monitoring
    if (this.resourceMonitor) {
      cancelAnimationFrame(this.resourceMonitor);
    }

    console.log('🧹 VIB34D Integration Manager destroyed');
  }
}

// Global integration manager instance
let vib34dManager = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  vib34dManager = new VIB34DIntegrationManager();
  
  // Expose to window for debugging
  if (typeof window !== 'undefined') {
    window.vib34dManager = vib34dManager;
  }
});

// Legacy global access
window.initVIB34DIntegration = () => {
  if (!vib34dManager) {
    vib34dManager = new VIB34DIntegrationManager();
  }
  return vib34dManager;
};

// Global class access for other scripts
window.VIB34DIntegrationManager = VIB34DIntegrationManager;