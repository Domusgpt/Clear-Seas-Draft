/*
 * Smart VIB34D Visualizer Manager
 * Intelligent canvas loading/destruction with scroll reactivity
 * Maximum 2-3 active visualizers to prevent performance issues
 */

class SmartVisualizerManager {
  constructor() {
    this.activeVisualizers = new Map();
    this.visualizerQueue = [];
    this.maxActiveVisualizers = 2; // Conservative limit
    this.scrollThrottle = null;
    this.intersectionObserver = null;
    this.performanceObserver = null;
    
    this.metrics = {
      fps: 60,
      activeCount: 0,
      memoryUsage: 0,
      loadedCount: 0
    };

    this.init();
  }

  init() {
    this.setupIntersectionObserver();
    this.setupScrollHandler();
    this.setupPerformanceMonitoring();
    this.findAndPrepareVisualizers();
    
    console.log('🎯 Smart Visualizer Manager initialized - Max active:', this.maxActiveVisualizers);
  }

  setupIntersectionObserver() {
    this.intersectionObserver = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      {
        root: null,
        rootMargin: '200px', // Start loading before element is visible
        threshold: [0, 0.25, 0.5, 0.75, 1.0]
      }
    );
  }

  setupScrollHandler() {
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
      if (this.scrollThrottle) return;
      
      this.scrollThrottle = requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
        const scrollSpeed = Math.abs(currentScrollY - lastScrollY);
        
        this.handleScroll(currentScrollY, scrollDirection, scrollSpeed);
        
        lastScrollY = currentScrollY;
        this.scrollThrottle = null;
      });
    });
  }

  setupPerformanceMonitoring() {
    let frameCount = 0;
    let lastTime = performance.now();

    const measurePerformance = () => {
      frameCount++;
      const now = performance.now();
      const deltaTime = now - lastTime;

      if (deltaTime >= 1000) {
        this.metrics.fps = Math.round((frameCount * 1000) / deltaTime);
        this.metrics.activeCount = this.activeVisualizers.size;
        
        // Adapt to performance
        this.adaptToPerformance();
        
        frameCount = 0;
        lastTime = now;
      }

      requestAnimationFrame(measurePerformance);
    };

    requestAnimationFrame(measurePerformance);
  }

  adaptToPerformance() {
    if (this.metrics.fps < 25 && this.maxActiveVisualizers > 1) {
      // Performance is poor, reduce active visualizers
      this.maxActiveVisualizers = 1;
      this.cullLowPriorityVisualizers();
      console.log('⚠️ Reducing active visualizers due to performance:', this.metrics.fps, 'fps');
    } else if (this.metrics.fps > 50 && this.maxActiveVisualizers < 2) {
      // Performance is good, allow more visualizers
      this.maxActiveVisualizers = 2;
      console.log('✅ Increasing active visualizers - performance good:', this.metrics.fps, 'fps');
    }
  }

  findAndPrepareVisualizers() {
    // Find all potential visualizer containers
    const containers = document.querySelectorAll(
      '.vib34d-container, .hero-background, .project-canvas, .research-canvas, .blog-canvas'
    );

    containers.forEach((container, index) => {
      if (!container.id) {
        container.id = `visualizer-${index}`;
      }
      
      // Add to intersection observer
      this.intersectionObserver.observe(container);
      
      // Store metadata
      const metadata = this.extractVisualizerMetadata(container);
      container.dataset.visualizerMeta = JSON.stringify(metadata);
    });

    console.log(`📊 Found ${containers.length} potential visualizer containers`);
  }

  extractVisualizerMetadata(container) {
    const section = container.closest('section');
    const isHero = container.classList.contains('hero-background');
    const isCard = container.closest('.card, .project-card, .research-card') !== null;
    
    return {
      priority: this.calculatePriority(container),
      system: this.determineSystem(container, section),
      quality: isHero ? 'high' : (isCard ? 'low' : 'medium'),
      type: isHero ? 'hero' : (isCard ? 'card' : 'section'),
      theme: section?.dataset.theme || 'polychora'
    };
  }

  calculatePriority(container) {
    let priority = 0;
    
    // Hero gets highest priority
    if (container.classList.contains('hero-background')) priority += 100;
    
    // Currently visible gets high priority
    const rect = container.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    if (rect.top < viewportHeight && rect.bottom > 0) {
      const visibleRatio = Math.min(
        (Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0)) / viewportHeight,
        1
      );
      priority += visibleRatio * 50;
    }
    
    // Distance from center affects priority
    const centerDistance = Math.abs(rect.top + rect.height / 2 - viewportHeight / 2);
    priority += Math.max(0, 25 - centerDistance / 100);
    
    return priority;
  }

  determineSystem(container, section) {
    if (container.dataset.system) return container.dataset.system;
    
    const themeMap = {
      'teal': 'faceted',
      'purple': 'quantum',
      'red': 'holographic',
      'polychora': 'polychora'
    };
    
    const theme = section?.dataset.theme || 'polychora';
    return themeMap[theme] || 'polychora';
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      const container = entry.target;
      const id = container.id;
      const isVisible = entry.isIntersecting;
      const visibilityRatio = entry.intersectionRatio;

      if (isVisible && visibilityRatio > 0.1) {
        // Element is becoming visible
        this.requestVisualizerActivation(id, container);
      } else if (!isVisible || visibilityRatio < 0.05) {
        // Element is leaving viewport
        this.requestVisualizerDeactivation(id);
      }
    });
  }

  handleScroll(scrollY, direction, speed) {
    // Update priorities based on current scroll position
    this.activeVisualizers.forEach((visualizer, id) => {
      const newPriority = this.calculatePriority(visualizer.container);
      visualizer.priority = newPriority;
    });

    // If scrolling fast, reduce quality temporarily
    if (speed > 50) {
      this.temporaryQualityReduction();
    }

    // Reorder visualizers by priority
    this.reorderVisualizerQueue();
  }

  async requestVisualizerActivation(id, container) {
    if (this.activeVisualizers.has(id)) return;

    const metadata = JSON.parse(container.dataset.visualizerMeta || '{}');
    
    // Add to queue
    this.visualizerQueue.push({
      id,
      container,
      priority: metadata.priority || 0,
      metadata,
      timestamp: Date.now()
    });

    // Process queue
    await this.processVisualizerQueue();
  }

  async processVisualizerQueue() {
    // Sort queue by priority
    this.visualizerQueue.sort((a, b) => b.priority - a.priority);

    // Activate visualizers up to limit
    while (
      this.visualizerQueue.length > 0 && 
      this.activeVisualizers.size < this.maxActiveVisualizers
    ) {
      const item = this.visualizerQueue.shift();
      await this.activateVisualizer(item);
    }

    // If queue still has items and we're at limit, replace lowest priority
    if (this.visualizerQueue.length > 0 && this.activeVisualizers.size >= this.maxActiveVisualizers) {
      await this.replaceLowestPriorityVisualizer();
    }
  }

  async activateVisualizer({ id, container, metadata }) {
    try {
      console.log(`🌟 Activating visualizer: ${id} (${metadata.system})`);

      const iframe = this.createVisualizerIframe(metadata);
      container.appendChild(iframe);

      // Wait for load
      await new Promise((resolve) => {
        iframe.onload = () => {
          // Smooth fade in
          iframe.style.opacity = '0';
          iframe.style.transition = 'opacity 0.8s ease';
          
          requestAnimationFrame(() => {
            iframe.style.opacity = '1';
            resolve();
          });
        };
      });

      // Store active visualizer
      this.activeVisualizers.set(id, {
        iframe,
        container,
        metadata,
        priority: metadata.priority,
        activatedAt: Date.now(),
        destroy: () => this.destroyVisualizer(id)
      });

      this.updateMetrics();

    } catch (error) {
      console.error(`Failed to activate visualizer ${id}:`, error);
    }
  }

  createVisualizerIframe(metadata) {
    const iframe = document.createElement('iframe');
    iframe.src = this.buildVisualizerUrl(metadata);
    iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
      pointer-events: none;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
    `;
    return iframe;
  }

  buildVisualizerUrl(metadata) {
    const baseUrl = 'https://domusgpt.github.io/vib34d-ultimate-viewer/viewer.html';
    const params = new URLSearchParams();

    params.append('system', metadata.system || 'polychora');
    params.append('quality', metadata.quality || 'medium');
    params.append('theme', metadata.theme || 'polychora');
    params.append('autoRotate', 'true');
    
    // Performance optimizations
    if (metadata.quality === 'low') {
      params.append('particles', '15');
      params.append('effects', 'minimal');
    } else if (metadata.quality === 'medium') {
      params.append('particles', '30');
      params.append('effects', 'standard');
    } else {
      params.append('particles', '50');
      params.append('effects', 'enhanced');
    }

    return `${baseUrl}?${params.toString()}`;
  }

  async replaceLowestPriorityVisualizer() {
    if (this.visualizerQueue.length === 0) return;

    // Find lowest priority active visualizer
    let lowestPriority = Infinity;
    let lowestId = null;

    this.activeVisualizers.forEach((visualizer, id) => {
      if (visualizer.priority < lowestPriority) {
        lowestPriority = visualizer.priority;
        lowestId = id;
      }
    });

    const newItem = this.visualizerQueue[0];
    
    // Only replace if new item has higher priority
    if (newItem.priority > lowestPriority && lowestId) {
      console.log(`🔄 Replacing visualizer ${lowestId} with ${newItem.id}`);
      
      await this.deactivateVisualizer(lowestId);
      this.visualizerQueue.shift(); // Remove from queue
      await this.activateVisualizer(newItem);
    }
  }

  requestVisualizerDeactivation(id) {
    // Remove from queue if present
    this.visualizerQueue = this.visualizerQueue.filter(item => item.id !== id);
    
    // Deactivate if active
    if (this.activeVisualizers.has(id)) {
      this.deactivateVisualizer(id);
    }
  }

  async deactivateVisualizer(id) {
    const visualizer = this.activeVisualizers.get(id);
    if (!visualizer) return;

    console.log(`💤 Deactivating visualizer: ${id}`);

    // Smooth fade out
    visualizer.iframe.style.transition = 'opacity 0.5s ease';
    visualizer.iframe.style.opacity = '0';

    // Remove after animation
    setTimeout(() => {
      if (visualizer.iframe.parentNode) {
        visualizer.iframe.parentNode.removeChild(visualizer.iframe);
      }
    }, 500);

    this.activeVisualizers.delete(id);
    this.updateMetrics();
  }

  cullLowPriorityVisualizers() {
    const visualizers = Array.from(this.activeVisualizers.entries());
    visualizers.sort((a, b) => a[1].priority - b[1].priority);

    // Remove lowest priority visualizers
    while (this.activeVisualizers.size > this.maxActiveVisualizers) {
      const [id] = visualizers.shift();
      this.deactivateVisualizer(id);
    }
  }

  temporaryQualityReduction() {
    // Temporarily reduce quality during fast scrolling
    this.activeVisualizers.forEach(visualizer => {
      if (visualizer.iframe) {
        visualizer.iframe.style.filter = 'blur(1px)';
        
        // Restore after scroll settles
        setTimeout(() => {
          visualizer.iframe.style.filter = '';
        }, 1000);
      }
    });
  }

  reorderVisualizerQueue() {
    this.visualizerQueue.sort((a, b) => b.priority - a.priority);
  }

  updateMetrics() {
    this.metrics.activeCount = this.activeVisualizers.size;
    this.metrics.loadedCount = this.activeVisualizers.size + this.visualizerQueue.length;
    
    // Update UI if performance monitor exists
    const fpsElement = document.querySelector('[data-performance-metric="fps"]');
    const activeElement = document.querySelector('[data-performance-metric="activeVisualizers"]');
    
    if (fpsElement) fpsElement.textContent = this.metrics.fps;
    if (activeElement) activeElement.textContent = this.metrics.activeCount;
  }

  // Public API
  setMaxActiveVisualizers(max) {
    this.maxActiveVisualizers = Math.max(1, Math.min(3, max));
    if (this.activeVisualizers.size > this.maxActiveVisualizers) {
      this.cullLowPriorityVisualizers();
    }
  }

  getMetrics() {
    return { ...this.metrics };
  }

  forceRefresh() {
    // Deactivate all and reprocess queue
    const ids = Array.from(this.activeVisualizers.keys());
    ids.forEach(id => this.deactivateVisualizer(id));
    
    setTimeout(() => {
      this.processVisualizerQueue();
    }, 600);
  }

  destroy() {
    // Cleanup all visualizers
    this.activeVisualizers.forEach((visualizer, id) => {
      this.deactivateVisualizer(id);
    });

    // Cleanup observers
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }

    if (this.scrollThrottle) {
      cancelAnimationFrame(this.scrollThrottle);
    }

    console.log('🧹 Smart Visualizer Manager destroyed');
  }
}

// Initialize smart visualizer manager
let smartVisualizerManager = null;

document.addEventListener('DOMContentLoaded', () => {
  smartVisualizerManager = new SmartVisualizerManager();
  
  // Global access
  window.smartVisualizerManager = smartVisualizerManager;
  window.SmartVisualizerManager = SmartVisualizerManager;
});

// Legacy compatibility
window.initSmartVisualizer = () => {
  if (!smartVisualizerManager) {
    smartVisualizerManager = new SmartVisualizerManager();
  }
  return smartVisualizerManager;
};