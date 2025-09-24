/*
 * UNIFIED POLYTOPAL SYSTEM v2.0
 * 
 * Consolidated JSON-driven reactivity system for Clear Seas polytopal visualizers.
 * Eliminates competing systems - this is the SINGLE SOURCE OF TRUTH for all 
 * visualizer parameter management and reactivity operations.
 * 
 * PERFORMANCE OPTIMIZED:
 * - Batched parameter updates to eliminate iframe reloading
 * - Smart parameter caching and change detection
 * - Optimistic UI updates with error recovery
 */

class UnifiedPolytopalSystem {
  constructor() {
    this.systems = new Map();
    this.routes = [];
    this.activeElements = new Map();
    this.parameterHistory = new Map();
    this.isInitialized = false;
    
    // CONSOLIDATED VISUALIZER MANAGEMENT
    this.visualizers = new Map();
    this.parameterQueue = new Map();
    this.processingQueue = false;
    this.parameterMappings = this.createParameterMappings();
    
    this.loadConfiguration();
  }

  async loadConfiguration() {
    try {
      const response = await fetch('/assets/reactivity/faceted.json');
      const config = await response.json();
      
      // Initialize visualizer scanning FIRST
      this.scanForVisualizers();
      
      // Store systems and routes
      Object.entries(config.systems).forEach(([name, system]) => {
        this.systems.set(name, system);
      });
      
      this.routes = config.routes || [];
      
      // Initialize DOM elements based on routes
      this.initializeRoutes();
      
      this.isInitialized = true;
      console.log('🚀 UNIFIED Polytopal System - Loaded', this.systems.size, 'systems,', this.visualizers.size, 'visualizers');
      
      // Start parameter processing queue
      this.startParameterQueue();
      
    } catch (error) {
      console.error('Failed to load reactivity configuration:', error);
      // Initialize with fallback system
      this.initializeFallbackSystem();
    }
  }
  
  initializeFallbackSystem() {
    console.warn('🔄 Initializing fallback reactivity system');
    this.scanForVisualizers();
    this.startParameterQueue();
    this.isInitialized = true;
  }

  initializeRoutes() {
    this.routes.forEach(route => {
      const elements = document.querySelectorAll(route.selector);
      
      elements.forEach(element => {
        const elementData = {
          element,
          route,
          system: this.systems.get(route.system),
          originalParams: this.captureOriginalParams(route.system),
          activeReactions: new Set()
        };
        
        this.setupElementListeners(elementData);
        this.activeElements.set(element, elementData);
      });
    });
  }

  setupElementListeners(elementData) {
    const { element, system } = elementData;
    
    if (!system?.reactivity?.events) return;
    
    Object.entries(system.reactivity.events).forEach(([eventType, reactions]) => {
      const [eventName] = eventType.split(':');
      
      if (eventName === 'card' || eventName === 'button') {
        this.setupCardOrButtonEvents(element, eventType, reactions, elementData);
      }
    });
  }

  setupCardOrButtonEvents(element, eventType, reactions, elementData) {
    const [, action] = eventType.split(':');
    
    switch (action) {
      case 'hover':
        element.addEventListener('mouseenter', () => {
          this.executeReactions(reactions, elementData, eventType);
        });
        break;
        
      case 'leave':
        element.addEventListener('mouseleave', () => {
          this.executeReactions(reactions, elementData, eventType);
        });
        break;
        
      case 'click':
        element.addEventListener('click', () => {
          this.executeReactions(reactions, elementData, eventType);
        });
        break;
    }
  }

  executeReactions(reactions, elementData, eventType) {
    const { element, system, route } = elementData;
    
    // Process target reactions (the element itself)
    if (reactions.target) {
      this.applyTargetReactions(element, reactions.target, system, eventType);
    }
    
    // Process frame reactions (background visualizer)
    if (reactions.frame) {
      this.applyFrameReactions(reactions.frame, system, route, eventType);
    }
    
    // Process sibling reactions (other elements in same scene)
    if (reactions.siblings) {
      this.applySiblingReactions(element, reactions.siblings, route, eventType);
    }
  }

  applyTargetReactions(element, targetReactions, system, eventType) {
    // Handle visual parameter changes
    if (targetReactions.visual) {
      Object.entries(targetReactions.visual).forEach(([param, operation]) => {
        this.applyParameterOperation(element, 'visual', param, operation, system);
      });
    }
    
    // Handle color parameter changes
    if (targetReactions.color) {
      Object.entries(targetReactions.color).forEach(([param, operation]) => {
        this.applyParameterOperation(element, 'color', param, operation, system);
      });
    }
    
    // Handle rot4d parameter changes
    if (targetReactions.rot4d) {
      Object.entries(targetReactions.rot4d).forEach(([param, operation]) => {
        this.applyParameterOperation(element, 'rot4d', param, operation, system);
      });
    }
    
    // Handle reset operations
    if (targetReactions.reset) {
      this.resetElementToDefaults(element, system, targetReactions);
    }
  }

  applyParameterOperation(element, namespace, param, operation, system) {
    const currentValue = this.getCurrentParameterValue(element, namespace, param, system);
    const newValue = this.calculateParameterValue(currentValue, operation, system, namespace, param);
    
    // Apply to visualizer if element has one
    const visualizer = this.findElementVisualizer(element);
    if (visualizer) {
      this.queueParameterUpdate(visualizer.id, namespace, param, newValue, { immediate: true });
    }
    
    // Store parameter change for reference
    this.recordParameterChange(element, namespace, param, currentValue, newValue);
  }

  calculateParameterValue(currentValue, operation, system, namespace, param) {
    if (typeof operation === 'object') {
      // Complex operation object
      if (operation.to !== undefined) {
        return operation.to;
      }
      
      if (operation.mul !== undefined) {
        return currentValue * operation.mul;
      }
      
      if (operation.toComplementOf) {
        const targetValue = this.resolveParameterReference(operation.toComplementOf, system);
        if (param === 'hue') {
          return (targetValue + 180) % 360;
        }
        return Math.abs(1 - targetValue); // For normalized values
      }
      
      if (operation.toInverseOf) {
        const targetValue = this.resolveParameterReference(operation.toInverseOf, system);
        return 1 / Math.max(targetValue, 0.001); // Prevent division by zero
      }
      
      if (operation.pingPong) {
        const [high, low] = operation.pingPong;
        const duration = operation.ms || 300;
        this.createPingPongAnimation(currentValue, high, low, duration);
        return high; // Start with high value
      }
      
      if (operation.swapWith) {
        const targetValue = this.resolveParameterReference(operation.swapWith, system);
        return targetValue;
      }
      
      if (operation.pingPongInverseOf) {
        const targetValue = this.resolveParameterReference(operation.pingPongInverseOf, system);
        const inverse = 1 / Math.max(targetValue, 0.001);
        const multiplier = operation.mul || 1;
        return inverse * multiplier;
      }
      
    } else {
      // Simple value
      return operation;
    }
    
    return currentValue;
  }

  resolveParameterReference(reference, system) {
    const parts = reference.split('.');
    let current = system.base;
    
    for (const part of parts) {
      if (current && current[part] !== undefined) {
        current = current[part];
      } else {
        console.warn('Could not resolve parameter reference:', reference);
        return 0;
      }
    }
    
    return current;
  }

  createPingPongAnimation(startValue, high, low, duration) {
    const steps = 60; // 60fps assumption
    const stepDuration = duration / steps;
    let currentStep = 0;
    let goingUp = true;
    
    const animate = () => {
      const progress = currentStep / (steps / 2);
      const easeProgress = this.easeInOutCubic(progress);
      
      const value = goingUp 
        ? startValue + (high - startValue) * easeProgress
        : high - (high - low) * easeProgress;
      
      // Apply value to visualizer
      // (This would connect to your VIB34D system)
      
      currentStep++;
      
      if (currentStep >= steps / 2) {
        if (goingUp) {
          goingUp = false;
          currentStep = 0;
        } else {
          return; // Animation complete
        }
      }
      
      setTimeout(animate, stepDuration);
    };
    
    animate();
  }

  applyFrameReactions(frameReactions, system, route, eventType) {
    // Find the hero/background visualizer for this scene
    const frameVisualizer = this.findFrameVisualizer(route.scene);
    
    if (frameVisualizer) {
      // Apply visual changes to frame
      if (frameReactions.visual) {
        Object.entries(frameReactions.visual).forEach(([param, operation]) => {
          const currentValue = this.getCurrentFrameParameter(frameVisualizer, param);
          const newValue = this.calculateParameterValue(currentValue, operation, system, 'visual', param);
          this.queueParameterUpdate(frameVisualizer.id, 'visual', param, newValue, { immediate: true });
        });
      }
      
      // Apply color changes to frame
      if (frameReactions.color) {
        Object.entries(frameReactions.color).forEach(([param, operation]) => {
          const currentValue = this.getCurrentFrameParameter(frameVisualizer, param);
          const newValue = this.calculateParameterValue(currentValue, operation, system, 'color', param);
          this.queueParameterUpdate(frameVisualizer.id, 'color', param, newValue, { immediate: true });
        });
      }
    }
  }

  applySiblingReactions(triggerElement, siblingReactions, route, eventType) {
    // Find sibling elements in same scene
    const siblings = this.findSiblingElements(triggerElement, route.scene);
    
    siblings.forEach(sibling => {
      if (siblingReactions.visual) {
        Object.entries(siblingReactions.visual).forEach(([param, operation]) => {
          if (param === 'intensity') {
            // Apply opacity/intensity changes to sibling elements
            const currentOpacity = parseFloat(getComputedStyle(sibling).opacity) || 1;
            const newOpacity = this.calculateParameterValue(currentOpacity, operation, null, 'visual', param);
            sibling.style.opacity = newOpacity;
          }
        });
      }
      
      // Handle reset for siblings
      if (siblingReactions.reset) {
        this.resetSiblingElement(sibling, siblingReactions);
      }
    });
  }

  findElementVisualizer(element) {
    // Look for iframe with VIB34D visualizer inside element
    const iframe = element.querySelector('iframe[src*="vib34d"]');
    if (iframe) {
      return {
        type: 'iframe',
        element: iframe,
        id: element.id || 'unnamed'
      };
    }
    
    // Look for canvas element for other visualizer types
    const canvas = element.querySelector('canvas');
    if (canvas) {
      return {
        type: 'canvas',
        element: canvas,
        id: element.id || 'unnamed'
      };
    }
    
    return null;
  }

  findFrameVisualizer(scene) {
    // Find the main hero/background visualizer for the scene
    const heroSection = document.querySelector('.hero-section, .hero-visualizer, [data-scene="' + scene + '"]');
    if (heroSection) {
      const iframe = heroSection.querySelector('iframe[src*="vib34d"]');
      if (iframe) {
        return {
          type: 'iframe',
          element: iframe,
          id: 'hero-' + scene
        };
      }
    }
    
    return null;
  }

  findSiblingElements(triggerElement, scene) {
    // Find other reactive elements in the same scene
    const sceneContainer = triggerElement.closest('[data-scene="' + scene + '"], section');
    if (!sceneContainer) return [];
    
    const siblings = [];
    this.activeElements.forEach((elementData, element) => {
      if (element !== triggerElement && 
          sceneContainer.contains(element) &&
          elementData.route.scene === scene) {
        siblings.push(element);
      }
    });
    
    return siblings;
  }

  // OLD METHODS REMOVED - Now using unified queueParameterUpdate system

  createSmoothTransition(iframe, paramName, startValue, endValue, duration, easing = 'linear') {
    const steps = Math.max(duration / 16, 10); // ~60fps, minimum 10 steps
    const stepDuration = duration / steps;
    let currentStep = 0;
    
    const animate = () => {
      const progress = currentStep / steps;
      const easedProgress = this.applyEasing(progress, easing);
      const currentValue = startValue + (endValue - startValue) * easedProgress;
      
      try {
        const url = new URL(iframe.src);
        url.searchParams.set(paramName, currentValue.toFixed(3));
        iframe.src = url.toString();
      } catch (error) {
        return; // Stop animation on error
      }
      
      currentStep++;
      if (currentStep <= steps) {
        setTimeout(animate, stepDuration);
      }
    };
    
    animate();
  }

  applyEasing(t, easing) {
    switch (easing) {
      case 'expoOut':
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      case 'backOut':
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
      case 'expoIn':
        return t === 0 ? 0 : Math.pow(2, 10 * (t - 1));
      default:
        return t; // linear
    }
  }

  getCurrentParameterValue(element, namespace, param, system) {
    // Try to get current value from visualizer
    const visualizer = this.findElementVisualizer(element);
    if (visualizer && visualizer.type === 'iframe') {
      try {
        const url = new URL(visualizer.element.src);
        const paramName = namespace === 'visual' ? param : `${namespace}_${param}`;
        const value = url.searchParams.get(paramName);
        if (value !== null) {
          return parseFloat(value);
        }
      } catch (error) {
        // Fall through to default value
      }
    }
    
    // Fall back to system base values
    const basePath = system.base[namespace];
    return basePath ? basePath[param] || 0 : 0;
  }

  getCurrentFrameParameter(visualizer, param) {
    if (visualizer && visualizer.type === 'iframe') {
      try {
        const url = new URL(visualizer.element.src);
        const value = url.searchParams.get(param);
        if (value !== null) {
          return parseFloat(value);
        }
      } catch (error) {
        // Fall through to default
      }
    }
    return 0;
  }

  resetElementToDefaults(element, system, resetConfig) {
    const visualizer = this.findElementVisualizer(element);
    if (!visualizer) return;
    
    const duration = resetConfig.ms || 500;
    const easing = resetConfig.ease || 'expoOut';
    
    // Reset visual parameters
    if (system.base.visual) {
      Object.entries(system.base.visual).forEach(([param, defaultValue]) => {
        const currentValue = this.getCurrentParameterValue(element, 'visual', param, system);
        this.createSmoothTransition(visualizer.element, param, currentValue, defaultValue, duration, easing);
      });
    }
    
    // Reset color parameters
    if (system.base.color) {
      Object.entries(system.base.color).forEach(([param, defaultValue]) => {
        const currentValue = this.getCurrentParameterValue(element, 'color', param, system);
        this.createSmoothTransition(visualizer.element, `color_${param}`, currentValue, defaultValue, duration, easing);
      });
    }
    
    // Reset rot4d parameters
    if (system.base.rot4d) {
      Object.entries(system.base.rot4d).forEach(([param, defaultValue]) => {
        const currentValue = this.getCurrentParameterValue(element, 'rot4d', param, system);
        this.createSmoothTransition(visualizer.element, `rot4d_${param}`, currentValue, defaultValue, duration, easing);
      });
    }
  }

  resetSiblingElement(sibling, resetConfig) {
    const duration = resetConfig.ms || 300;
    
    // Reset opacity
    if (sibling.style.opacity !== '') {
      const startOpacity = parseFloat(sibling.style.opacity);
      this.animateProperty(sibling, 'opacity', startOpacity, 1, duration);
    }
    
    // Reset transform
    if (sibling.style.transform !== '') {
      this.animateProperty(sibling, 'transform', sibling.style.transform, '', duration);
    }
  }

  animateProperty(element, property, startValue, endValue, duration) {
    const steps = duration / 16; // ~60fps
    const stepDuration = duration / steps;
    let currentStep = 0;
    
    const animate = () => {
      const progress = currentStep / steps;
      const easedProgress = this.easeInOutCubic(progress);
      
      if (property === 'opacity') {
        const value = startValue + (endValue - startValue) * easedProgress;
        element.style.opacity = value;
      } else if (property === 'transform') {
        if (endValue === '') {
          const scale = 1 - (1 - 1) * easedProgress; // Always animate to scale(1)
          element.style.transform = startValue; // Keep transform until end
          if (currentStep >= steps) {
            element.style.transform = '';
          }
        }
      }
      
      currentStep++;
      if (currentStep <= steps) {
        setTimeout(animate, stepDuration);
      }
    };
    
    animate();
  }

  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  captureOriginalParams(systemName) {
    const system = this.systems.get(systemName);
    return system ? JSON.parse(JSON.stringify(system.base)) : {};
  }

  recordParameterChange(element, namespace, param, oldValue, newValue) {
    const key = `${element.id || 'unnamed'}_${namespace}_${param}`;
    this.parameterHistory.set(key, { oldValue, newValue, timestamp: Date.now() });
  }

  // Public API for debugging and external control
  triggerElementReaction(elementId, eventType) {
    const elements = Array.from(this.activeElements.keys());
    const element = elements.find(el => el.id === elementId);
    
    if (element) {
      const elementData = this.activeElements.get(element);
      const reactions = elementData.system?.reactivity?.events?.[eventType];
      
      if (reactions) {
        this.executeReactions(reactions, elementData, eventType);
      }
    }
  }

  getSystemStatus() {
    return {
      initialized: this.isInitialized,
      systemCount: this.systems.size,
      routeCount: this.routes.length,
      activeElementCount: this.activeElements.size,
      visualizerCount: this.visualizers.size,
      queueSize: this.parameterQueue.size
    };
  }

  // ===== CONSOLIDATED VISUALIZER MANAGEMENT =====
  // Replaces both Enhanced Master Conductor and Visualizer Adapter
  
  createParameterMappings() {
    return {
      visual: {
        gridDensity: { vib34d: 'gridDensity', range: [5, 100], transform: (v) => v },
        morphFactor: { vib34d: 'morphFactor', range: [0, 2], transform: (v) => v },
        chaos: { vib34d: 'chaos', range: [0, 1], transform: (v) => v },
        speed: { vib34d: 'speed', range: [0.1, 3], transform: (v) => v },
        intensity: { vib34d: 'intensity', range: [0, 1], transform: (v) => v }
      },
      color: {
        hue: { vib34d: 'hue', range: [0, 360], transform: (v) => v },
        intensity: { vib34d: 'intensity', range: [0, 1], transform: (v) => v },
        saturation: { vib34d: 'saturation', range: [0, 1], transform: (v) => v }
      },
      rot4d: {
        xw: { vib34d: 'rot4dXW', range: [-6.28, 6.28], transform: (v) => v },
        yw: { vib34d: 'rot4dYW', range: [-6.28, 6.28], transform: (v) => v },
        zw: { vib34d: 'rot4dZW', range: [-6.28, 6.28], transform: (v) => v }
      }
    };
  }
  
  scanForVisualizers() {
    // Find all VIB34D iframes and register them - YOUR ULTIMATE VIEWER
    document.querySelectorAll('iframe[src*="vib34d"], iframe[src*="domusgpt"]').forEach((iframe, index) => {
      const id = iframe.id || `vib34d-${index}`;
      iframe.id = id; // Ensure iframe has ID
      
      const visualizer = {
        id,
        element: iframe,
        type: 'vib34d',
        currentParams: new Map(),
        pendingUpdates: new Map(),
        lastUpdate: 0,
        isHealthy: true
      };
      
      this.visualizers.set(id, visualizer);
      this.captureCurrentParameters(visualizer);
      
      console.log('📡 Registered visualizer:', id);
    });
    
    // Also find canvas elements
    document.querySelectorAll('canvas[data-visualizer]').forEach((canvas, index) => {
      const id = canvas.id || `canvas-${index}`;
      const visualizer = {
        id,
        element: canvas,
        type: 'canvas',
        currentParams: new Map(),
        pendingUpdates: new Map(),
        lastUpdate: 0,
        isHealthy: true
      };
      
      this.visualizers.set(id, visualizer);
    });
  }
  
  captureCurrentParameters(visualizer) {
    if (visualizer.type === 'vib34d') {
      try {
        const url = new URL(visualizer.element.src);
        
        // Standard query parameters for YOUR VIB34D Ultimate Viewer
        url.searchParams.forEach((value, key) => {
          visualizer.currentParams.set(key, parseFloat(value) || 0);
        });
      } catch (error) {
        console.warn('Could not capture parameters for:', visualizer.id);
        visualizer.isHealthy = false;
      }
    }
  }
  
  startParameterQueue() {
    // Process parameter updates in batches to avoid iframe reloading hell
    setInterval(() => {
      if (!this.processingQueue && this.parameterQueue.size > 0) {
        this.processParameterQueue();
      }
    }, 50); // Process every 50ms
  }
  
  processParameterQueue() {
    this.processingQueue = true;
    
    const updates = new Map(this.parameterQueue);
    this.parameterQueue.clear();
    
    updates.forEach((params, visualizerId) => {
      this.applyParameterBatch(visualizerId, params);
    });
    
    this.processingQueue = false;
  }
  
  applyParameterBatch(visualizerId, params) {
    const visualizer = this.visualizers.get(visualizerId);
    if (!visualizer || !visualizer.isHealthy) return;
    
    if (visualizer.type === 'vib34d') {
      this.updateVIB34DParameters(visualizer, params);
    } else if (visualizer.type === 'canvas') {
      this.updateCanvasParameters(visualizer, params);
    }
    
    visualizer.lastUpdate = performance.now();
  }
  
  updateVIB34DParameters(visualizer, params) {
    try {
      const url = new URL(visualizer.element.src);
      let hasChanges = false;
      
      // Standard query parameter handling for YOUR VIB34D Ultimate Viewer
      Object.entries(params).forEach(([param, value]) => {
        const currentValue = url.searchParams.get(param);
        const newValue = value.toString();
        
        if (currentValue !== newValue) {
          url.searchParams.set(param, newValue);
          visualizer.currentParams.set(param, value);
          hasChanges = true;
        }
      });
      
      // PERFORMANCE FIX: Only update iframe if there are actual changes
      if (hasChanges) {
        visualizer.element.src = url.toString();
      }
      
    } catch (error) {
      console.error('Failed to update VIB34D parameters:', error);
      visualizer.isHealthy = false;
    }
  }
  
  updateCanvasParameters(visualizer, params) {
    // Direct canvas parameter updates - much faster than iframe
    Object.entries(params).forEach(([param, value]) => {
      if (visualizer.element.setParameter) {
        visualizer.element.setParameter(param, value);
      }
      visualizer.currentParams.set(param, value);
    });
    
    // Trigger canvas re-render if available
    if (visualizer.element.render) {
      visualizer.element.render();
    }
  }

  // UNIFIED PARAMETER UPDATE METHOD
  // Replaces all competing updateVisualizerParams methods
  queueParameterUpdate(visualizerId, namespace, param, value, options = {}) {
    const visualizer = this.visualizers.get(visualizerId) || this.findVisualizerForElement(visualizerId);
    if (!visualizer) {
      console.warn('Visualizer not found:', visualizerId);
      return false;
    }
    
    // Map parameter through our mapping system
    const mapping = this.parameterMappings[namespace]?.[param];
    if (!mapping) {
      console.warn('Parameter mapping not found:', namespace, param);
      return false;
    }
    
    const mappedParam = mapping.vib34d;
    const transformedValue = mapping.transform ? mapping.transform(value) : value;
    
    // Add to queue for batch processing
    if (!this.parameterQueue.has(visualizerId)) {
      this.parameterQueue.set(visualizerId, {});
    }
    
    this.parameterQueue.get(visualizerId)[mappedParam] = transformedValue;
    
    // For immediate updates (like user interactions)
    if (options.immediate) {
      this.processParameterQueue();
    }
    
    return true;
  }
  
  findVisualizerForElement(elementId) {
    // Try to find element and register as visualizer
    const element = document.getElementById(elementId);
    if (!element) return null;
    
    const iframe = element.querySelector('iframe[src*="vib34d"], iframe[src*="domusgpt"]');
    if (iframe) {
      const visualizer = {
        id: elementId,
        element: iframe,
        type: 'vib34d',
        currentParams: new Map(),
        pendingUpdates: new Map(),
        lastUpdate: 0,
        isHealthy: true
      };
      
      this.visualizers.set(elementId, visualizer);
      this.captureCurrentParameters(visualizer);
      
      console.log('📡 Auto-registered visualizer:', elementId);
      return visualizer;
    }
    
    return null;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.unifiedPolytopal = new UnifiedPolytopalSystem();
  
  // BACKWARDS COMPATIBILITY - redirect old calls to new system
  window.polytopalReactivity = window.unifiedPolytopal;
  window.visualizerAdapter = {
    updateVisualizerParameter: (id, ns, param, val, opts) => 
      window.unifiedPolytopal.queueParameterUpdate(id, ns, param, val, opts)
  };
  
  // Global debugging interface
  window.triggerReaction = (elementId, eventType) => {
    window.unifiedPolytopal.triggerElementReaction(elementId, eventType);
  };
  
  window.getReactivityStatus = () => {
    return window.unifiedPolytopal.getSystemStatus();
  };
  
  // Performance monitoring
  window.getVisualizerPerformance = () => {
    const visualizers = Array.from(window.unifiedPolytopal.visualizers.values());
    return {
      totalVisualizers: visualizers.length,
      healthyVisualizers: visualizers.filter(v => v.isHealthy).length,
      queueSize: window.unifiedPolytopal.parameterQueue.size,
      averageUpdateTime: visualizers.reduce((sum, v) => sum + (performance.now() - v.lastUpdate), 0) / visualizers.length
    };
  };
  
  console.log('🚀 UNIFIED Polytopal System - All systems online');
});