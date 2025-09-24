/*
 * VISUALIZER PARAMETER ADAPTER v1.0
 * 
 * Advanced adapter system for Clear Seas polytopal visualizer integration.
 * Handles parameter mapping between JSON configurations and VIB34D shaders.
 * Supports complex mathematical operations and real-time parameter synchronization.
 */

class VisualizerParameterAdapter {
  constructor() {
    this.visualizers = new Map();
    this.parameterMappings = this.createParameterMappings();
    this.activeTransitions = new Map();
    this.performanceMonitor = new PerformanceMonitor();
    
    this.initializeAdapter();
  }

  createParameterMappings() {
    return {
      // Visual namespace mappings
      visual: {
        gridDensity: { 
          vib34d: 'density', 
          range: [5, 100], 
          transform: (v) => v * 0.1 
        },
        morphFactor: { 
          vib34d: 'morph', 
          range: [0, 2], 
          transform: (v) => v 
        },
        chaos: { 
          vib34d: 'chaos', 
          range: [0, 1], 
          transform: (v) => v 
        },
        speed: { 
          vib34d: 'speed', 
          range: [0.1, 3], 
          transform: (v) => v * 0.01 
        },
        intensity: { 
          vib34d: 'intensity', 
          range: [0, 1], 
          transform: (v) => v 
        }
      },
      
      // Color namespace mappings
      color: {
        hue: { 
          vib34d: 'hue', 
          range: [0, 360], 
          transform: (v) => v / 360 
        },
        intensity: { 
          vib34d: 'brightness', 
          range: [0, 1], 
          transform: (v) => v 
        },
        saturation: { 
          vib34d: 'saturation', 
          range: [0, 1], 
          transform: (v) => v 
        }
      },
      
      // 4D rotation namespace mappings
      rot4d: {
        xw: { 
          vib34d: 'rot4d_xw', 
          range: [-6.28, 6.28], 
          transform: (v) => v 
        },
        yw: { 
          vib34d: 'rot4d_yw', 
          range: [-6.28, 6.28], 
          transform: (v) => v 
        },
        zw: { 
          vib34d: 'rot4d_zw', 
          range: [-6.28, 6.28], 
          transform: (v) => v 
        }
      },
      
      // Geometry mappings (special handling)
      geometry: {
        type: { 
          vib34d: 'geometry', 
          range: [0, 7], 
          transform: (v) => this.getGeometryString(v)
        }
      }
    };
  }

  initializeAdapter() {
    this.scanForVisualizers();
    this.setupVisualizerObserver();
    
    console.log('🔧 Visualizer Parameter Adapter - Initialized with', this.visualizers.size, 'visualizers');
  }

  scanForVisualizers() {
    // Scan for VIB34D iframes
    document.querySelectorAll('iframe[src*="vib34d"]').forEach(iframe => {
      this.registerVisualizer(iframe, 'vib34d');
    });
    
    // Scan for canvas-based visualizers
    document.querySelectorAll('canvas[data-visualizer]').forEach(canvas => {
      this.registerVisualizer(canvas, canvas.dataset.visualizer || 'canvas');
    });
    
    // Scan for WebGL contexts
    document.querySelectorAll('canvas[data-webgl]').forEach(canvas => {
      this.registerVisualizer(canvas, 'webgl');
    });
  }

  registerVisualizer(element, type) {
    const id = element.id || `${type}-${Math.random().toString(36).substr(2, 9)}`;
    const visualizer = {
      id,
      element,
      type,
      currentParams: new Map(),
      lastUpdate: 0,
      queuedUpdates: new Map(),
      isTransitioning: false
    };
    
    this.visualizers.set(id, visualizer);
    this.captureInitialParameters(visualizer);
    
    return visualizer;
  }

  captureInitialParameters(visualizer) {
    if (visualizer.type === 'vib34d') {
      try {
        const url = new URL(visualizer.element.src);
        url.searchParams.forEach((value, key) => {
          visualizer.currentParams.set(key, parseFloat(value) || 0);
        });
      } catch (error) {
        console.warn('Could not capture initial VIB34D parameters:', error);
      }
    }
  }

  updateVisualizerParameter(visualizerId, namespace, param, value, options = {}) {
    const visualizer = this.visualizers.get(visualizerId);
    if (!visualizer) {
      console.warn('Visualizer not found:', visualizerId);
      return false;
    }

    const mapping = this.parameterMappings[namespace]?.[param];
    if (!mapping) {
      console.warn('Parameter mapping not found:', namespace, param);
      return false;
    }

    // Transform value according to mapping
    const transformedValue = mapping.transform ? mapping.transform(value) : value;
    const vib34dParam = mapping.vib34d;

    // Handle different update modes
    if (options.immediate) {
      return this.applyImmediateUpdate(visualizer, vib34dParam, transformedValue);
    } else if (options.transition) {
      return this.applyTransitionUpdate(visualizer, vib34dParam, transformedValue, options.transition);
    } else {
      return this.applyQueuedUpdate(visualizer, vib34dParam, transformedValue);
    }
  }

  applyImmediateUpdate(visualizer, param, value) {
    if (visualizer.type === 'vib34d') {
      return this.updateVIB34DParameter(visualizer, param, value);
    } else if (visualizer.type === 'webgl') {
      return this.updateWebGLParameter(visualizer, param, value);
    } else if (visualizer.type === 'canvas') {
      return this.updateCanvasParameter(visualizer, param, value);
    }
    return false;
  }

  applyTransitionUpdate(visualizer, param, targetValue, transition) {
    const transitionId = `${visualizer.id}_${param}`;
    const currentValue = visualizer.currentParams.get(param) || 0;
    
    // Cancel existing transition for this parameter
    if (this.activeTransitions.has(transitionId)) {
      clearInterval(this.activeTransitions.get(transitionId).interval);
    }
    
    const duration = transition.duration || 500;
    const easing = transition.easing || 'linear';
    const steps = Math.max(duration / 16, 10); // ~60fps, minimum 10 steps
    const stepDuration = duration / steps;
    
    let currentStep = 0;
    
    const transitionData = {
      interval: setInterval(() => {
        const progress = Math.min(currentStep / steps, 1);
        const easedProgress = this.applyEasing(progress, easing);
        const interpolatedValue = currentValue + (targetValue - currentValue) * easedProgress;
        
        this.applyImmediateUpdate(visualizer, param, interpolatedValue);
        
        currentStep++;
        if (progress >= 1) {
          clearInterval(transitionData.interval);
          this.activeTransitions.delete(transitionId);
          visualizer.isTransitioning = false;
        }
      }, stepDuration),
      startValue: currentValue,
      targetValue,
      progress: 0
    };
    
    this.activeTransitions.set(transitionId, transitionData);
    visualizer.isTransitioning = true;
    
    return true;
  }

  applyQueuedUpdate(visualizer, param, value) {
    visualizer.queuedUpdates.set(param, value);
    
    // Debounce updates to avoid overwhelming the visualizer
    const now = performance.now();
    if (now - visualizer.lastUpdate > 16) { // ~60fps throttle
      this.flushQueuedUpdates(visualizer);
    }
    
    return true;
  }

  flushQueuedUpdates(visualizer) {
    if (visualizer.queuedUpdates.size === 0) return;
    
    const updates = new Map(visualizer.queuedUpdates);
    visualizer.queuedUpdates.clear();
    visualizer.lastUpdate = performance.now();
    
    if (visualizer.type === 'vib34d') {
      this.batchUpdateVIB34D(visualizer, updates);
    } else {
      updates.forEach((value, param) => {
        this.applyImmediateUpdate(visualizer, param, value);
      });
    }
  }

  updateVIB34DParameter(visualizer, param, value) {
    try {
      const url = new URL(visualizer.element.src);
      const stringValue = this.formatParameterValue(param, value);
      
      url.searchParams.set(param, stringValue);
      visualizer.element.src = url.toString();
      visualizer.currentParams.set(param, value);
      
      return true;
    } catch (error) {
      console.error('Error updating VIB34D parameter:', error);
      return false;
    }
  }

  batchUpdateVIB34D(visualizer, updates) {
    try {
      const url = new URL(visualizer.element.src);
      
      updates.forEach((value, param) => {
        const stringValue = this.formatParameterValue(param, value);
        url.searchParams.set(param, stringValue);
        visualizer.currentParams.set(param, value);
      });
      
      visualizer.element.src = url.toString();
      return true;
    } catch (error) {
      console.error('Error batch updating VIB34D parameters:', error);
      return false;
    }
  }

  updateWebGLParameter(visualizer, param, value) {
    // Interface with WebGL context
    const gl = visualizer.element.getContext('webgl') || visualizer.element.getContext('webgl2');
    if (!gl) return false;
    
    // This would integrate with your existing WebGL shader system
    if (visualizer.shaderProgram) {
      const uniformLocation = gl.getUniformLocation(visualizer.shaderProgram, param);
      if (uniformLocation) {
        gl.uniform1f(uniformLocation, value);
        visualizer.currentParams.set(param, value);
        return true;
      }
    }
    
    return false;
  }

  updateCanvasParameter(visualizer, param, value) {
    // Interface with 2D canvas context or custom render loop
    if (visualizer.element.renderParams) {
      visualizer.element.renderParams[param] = value;
      visualizer.currentParams.set(param, value);
      
      // Trigger re-render if available
      if (visualizer.element.render) {
        visualizer.element.render();
      }
      
      return true;
    }
    
    return false;
  }

  formatParameterValue(param, value) {
    // Special formatting for different parameter types
    if (param.includes('rot4d')) {
      return value.toFixed(4);
    } else if (param === 'hue') {
      return Math.round(value).toString();
    } else if (param === 'geometry') {
      return value; // Already transformed to string
    } else {
      return value.toFixed(3);
    }
  }

  getGeometryString(index) {
    const geometries = [
      'TETRAHEDRON',
      'CUBE', 
      'OCTAHEDRON',
      'DODECAHEDRON',
      'ICOSAHEDRON',
      'TORUS',
      'WAVE',
      'CRYSTAL'
    ];
    
    return geometries[Math.floor(index) % geometries.length] || 'TETRAHEDRON';
  }

  applyEasing(t, easing) {
    switch (easing) {
      case 'expoOut':
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      case 'expoIn':
        return t === 0 ? 0 : Math.pow(2, 10 * (t - 1));
      case 'backOut':
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
      case 'bounceOut':
        const n1 = 7.5625;
        const d1 = 2.75;
        if (t < 1 / d1) {
          return n1 * t * t;
        } else if (t < 2 / d1) {
          return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
          return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
          return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
      case 'elastic':
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
      default:
        return t; // linear
    }
  }

  setupVisualizerObserver() {
    // Watch for new visualizers being added to the DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check for new VIB34D iframes
            const iframes = node.querySelectorAll ? node.querySelectorAll('iframe[src*="vib34d"]') : [];
            iframes.forEach(iframe => this.registerVisualizer(iframe, 'vib34d'));
            
            // Check for new canvas elements
            const canvases = node.querySelectorAll ? node.querySelectorAll('canvas[data-visualizer], canvas[data-webgl]') : [];
            canvases.forEach(canvas => {
              const type = canvas.dataset.visualizer || canvas.dataset.webgl || 'canvas';
              this.registerVisualizer(canvas, type);
            });
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Advanced parameter operations
  createParameterGroup(visualizerIds, groupName) {
    const group = {
      name: groupName,
      visualizers: visualizerIds.map(id => this.visualizers.get(id)).filter(Boolean),
      synchronize: (namespace, param, value, options) => {
        return group.visualizers.map(visualizer => 
          this.updateVisualizerParameter(visualizer.id, namespace, param, value, options)
        );
      },
      getAverageValue: (namespace, param) => {
        const values = group.visualizers.map(v => v.currentParams.get(param) || 0);
        return values.reduce((sum, val) => sum + val, 0) / values.length;
      }
    };
    
    return group;
  }

  createParameterMapping(sourceVisualizer, targetVisualizer, mappingFunction) {
    const mapping = {
      source: sourceVisualizer,
      target: targetVisualizer,
      transform: mappingFunction,
      apply: (sourceParam, sourceValue) => {
        const transformedParams = mapping.transform(sourceParam, sourceValue);
        Object.entries(transformedParams).forEach(([param, value]) => {
          const [namespace, paramName] = param.split('.');
          this.updateVisualizerParameter(mapping.target.id, namespace, paramName, value, { immediate: true });
        });
      }
    };
    
    return mapping;
  }

  // Performance monitoring
  getPerformanceMetrics() {
    return {
      activeVisualizers: this.visualizers.size,
      activeTransitions: this.activeTransitions.size,
      averageUpdateTime: this.performanceMonitor.getAverageUpdateTime(),
      memoryUsage: this.performanceMonitor.getMemoryUsage()
    };
  }

  // Public API
  getVisualizer(id) {
    return this.visualizers.get(id);
  }

  getAllVisualizers() {
    return Array.from(this.visualizers.values());
  }

  forceFlushAllUpdates() {
    this.visualizers.forEach(visualizer => {
      if (visualizer.queuedUpdates.size > 0) {
        this.flushQueuedUpdates(visualizer);
      }
    });
  }
}

// Performance monitoring utility
class PerformanceMonitor {
  constructor() {
    this.updateTimes = [];
    this.maxSamples = 100;
  }

  recordUpdateTime(time) {
    this.updateTimes.push(time);
    if (this.updateTimes.length > this.maxSamples) {
      this.updateTimes.shift();
    }
  }

  getAverageUpdateTime() {
    if (this.updateTimes.length === 0) return 0;
    const sum = this.updateTimes.reduce((a, b) => a + b, 0);
    return sum / this.updateTimes.length;
  }

  getMemoryUsage() {
    if (performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }
    return null;
  }
}

// Initialize adapter
document.addEventListener('DOMContentLoaded', () => {
  window.visualizerAdapter = new VisualizerParameterAdapter();
  console.log('🔧 Visualizer Parameter Adapter - Ready for polytopal integration');
});