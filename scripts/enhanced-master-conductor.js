/*
 * ENHANCED MASTER CONDUCTOR SYSTEM v3.0
 * 
 * Builds upon the UnifiedExperienceEngine with additional polytopal-specific
 * reactive systems, total reactivity management, and neoskeuomorphic interactions.
 * 
 * This system integrates with your existing VIB34D visualizers to create
 * the "total reactivity" effect you described - where every interaction
 * creates synchronized, complementary reactions throughout the entire UI.
 */

class EnhancedMasterConductor {
  constructor() {
    this.baseEngine = null;
    this.reactiveElements = new Map();
    this.visualizerManager = new Map();
    this.interactionProfiles = this.defineInteractionProfiles();
    
    this.init();
  }

  async init() {
    // Wait for the base UnifiedExperienceEngine to be ready
    await this.waitForBaseEngine();
    
    // Initialize our enhanced systems
    this.initializeReactiveElements();
    this.initializeVisualizerManager();
    this.initializeInteractionSystem();
    this.initializeNeoskeuomorphicEffects();
    
    console.log('🎭 Enhanced Master Conductor - Total reactivity system online');
  }

  async waitForBaseEngine() {
    return new Promise((resolve) => {
      const checkEngine = () => {
        if (window.unifiedEngine) {
          this.baseEngine = window.unifiedEngine;
          resolve();
        } else {
          setTimeout(checkEngine, 100);
        }
      };
      checkEngine();
    });
  }

  defineInteractionProfiles() {
    return {
      'tech-card': {
        hover: {
          self: { 
            scale: 1.1, 
            rotateX: -10, 
            z: 120,
            visualizer: { gridDensity: 5.0, speed: 0.05, chaos: 0.05, hue: '+30' }
          },
          background: { 
            visualizer: { gridDensity: 25.0, speed: 0.005, chaos: 0.2, hue: '-30' }
          },
          siblings: {
            scale: 0.95,
            opacity: 0.7
          }
        },
        click: {
          self: {
            visualizer: { chaos: 1.0, hue: 'shift', speed: 0.2 }
          },
          background: {
            visualizer: { speed: -0.1, hue: 'complement' }
          },
          duration: { surge: 0.2, settle: 0.8 }
        }
      },
      'portfolio-card': {
        hover: {
          self: { 
            scale: 1.15, 
            rotateX: 5, 
            z: 150,
            visualizer: { gridDensity: 15.0, morphFactor: 2.0 }
          },
          background: { 
            visualizer: { gridDensity: 5.0, morphFactor: 0.5 }
          },
          siblings: {
            blur: 3,
            scale: 0.98
          }
        },
        click: {
          self: {
            visualizer: { speed: 0.2, intensity: 2.0 }
          },
          background: {
            visualizer: { hue: 'complement', intensity: 0.3 }
          }
        }
      },
      'research-card': {
        hover: {
          self: { 
            scale: 1.08, 
            rotateY: 5, 
            z: 80,
            visualizer: { chaos: 0.8, speed: 0.03 }
          },
          background: { 
            visualizer: { chaos: 0.1, speed: 0.001 }
          }
        }
      }
    };
  }

  initializeReactiveElements() {
    // Find all elements with data-profile attributes
    document.querySelectorAll('[data-profile]').forEach(element => {
      const profileName = element.dataset.profile;
      const profile = this.interactionProfiles[profileName];
      
      if (profile) {
        const elementData = {
          element,
          profile,
          originalTransform: null,
          isHovering: false,
          visualizerIds: this.findRelatedVisualizers(element)
        };
        
        this.setupElementInteractions(elementData);
        this.reactiveElements.set(element.id || this.generateId(), elementData);
      }
    });
  }

  findRelatedVisualizers(element) {
    const visualizers = {
      self: null,
      background: 'hero', // Main hero background visualizer
      siblings: []
    };
    
    // Find element's own visualizer
    const iframe = element.querySelector('iframe[src*="vib34d"]');
    if (iframe) {
      visualizers.self = element.id;
    }
    
    // Find sibling visualizers
    const parentSection = element.closest('section');
    if (parentSection) {
      const siblingElements = parentSection.querySelectorAll('[data-profile]');
      siblingElements.forEach(sibling => {
        if (sibling !== element && sibling.querySelector('iframe[src*="vib34d"]')) {
          visualizers.siblings.push(sibling.id);
        }
      });
    }
    
    return visualizers;
  }

  setupElementInteractions(elementData) {
    const { element, profile } = elementData;
    
    // Mouse enter - start total reactivity cascade
    element.addEventListener('mouseenter', (e) => {
      this.triggerHoverReaction(elementData, true);
    });
    
    // Mouse leave - return to normal
    element.addEventListener('mouseleave', (e) => {
      this.triggerHoverReaction(elementData, false);
    });
    
    // Mouse move - update tilt based on mouse position
    element.addEventListener('mousemove', (e) => {
      this.updateElementTilt(elementData, e);
    });
    
    // Click - dramatic surge effect
    element.addEventListener('click', (e) => {
      this.triggerClickReaction(elementData);
    });
  }

  triggerHoverReaction(elementData, isEntering) {
    const { element, profile, visualizerIds } = elementData;
    
    if (isEntering && profile.hover) {
      // Apply self transformations
      if (profile.hover.self) {
        this.applyElementTransform(element, profile.hover.self);
        
        // Update element's own visualizer
        if (visualizerIds.self && profile.hover.self.visualizer) {
          this.updateVisualizerParams(visualizerIds.self, profile.hover.self.visualizer);
        }
      }
      
      // Apply background reactions
      if (profile.hover.background && profile.hover.background.visualizer) {
        this.updateVisualizerParams(visualizerIds.background, profile.hover.background.visualizer);
      }
      
      // Apply sibling reactions
      if (profile.hover.siblings) {
        this.applySiblingEffects(visualizerIds.siblings, profile.hover.siblings);
      }
      
    } else {
      // Return to normal state
      this.resetElementTransform(element);
      
      // Reset visualizers
      if (visualizerIds.self) this.resetVisualizer(visualizerIds.self);
      if (visualizerIds.background) this.resetVisualizer(visualizerIds.background);
      this.resetSiblingEffects(visualizerIds.siblings);
    }
  }

  updateElementTilt(elementData, event) {
    const { element } = elementData;
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const rotateY = (x / rect.width - 0.5) * 20; // Max 10 degrees
    const rotateX = -(y / rect.height - 0.5) * 20; // Max 10 degrees
    
    // Update CSS custom properties for smooth tilt
    element.style.setProperty('--tilt-x', `${rotateX}deg`);
    element.style.setProperty('--tilt-y', `${rotateY}deg`);
  }

  triggerClickReaction(elementData) {
    const { profile, visualizerIds } = elementData;
    
    if (!profile.click) return;
    
    // Create dramatic surge effect
    if (profile.click.self && profile.click.self.visualizer) {
      this.surgeVisualizerParams(visualizerIds.self, profile.click.self.visualizer, profile.click.duration);
    }
    
    if (profile.click.background && profile.click.background.visualizer) {
      this.surgeVisualizerParams(visualizerIds.background, profile.click.background.visualizer, profile.click.duration);
    }
  }

  applyElementTransform(element, transformData) {
    const { scale = 1, rotateX = 0, rotateY = 0, z = 0 } = transformData;
    
    element.style.transform = `
      scale(${scale}) 
      translateZ(${z}px) 
      rotateX(${rotateX}deg) 
      rotateY(${rotateY}deg)
      rotateX(var(--tilt-x, 0deg))
      rotateY(var(--tilt-y, 0deg))
    `;
    
    // Add glow effect
    element.classList.add('is-hovering');
  }

  resetElementTransform(element) {
    element.style.transform = 'scale(1) translateZ(0) rotateX(0deg) rotateY(0deg)';
    element.classList.remove('is-hovering');
    element.style.removeProperty('--tilt-x');
    element.style.removeProperty('--tilt-y');
  }

  applySiblingEffects(siblingIds, effects) {
    siblingIds.forEach(id => {
      const element = document.getElementById(id);
      if (!element) return;
      
      if (effects.scale) {
        element.style.transform = `scale(${effects.scale})`;
      }
      
      if (effects.opacity) {
        element.style.opacity = effects.opacity;
      }
      
      if (effects.blur) {
        element.style.filter = `blur(${effects.blur}px)`;
      }
    });
  }

  resetSiblingEffects(siblingIds) {
    siblingIds.forEach(id => {
      const element = document.getElementById(id);
      if (!element) return;
      
      element.style.transform = '';
      element.style.opacity = '';
      element.style.filter = '';
    });
  }

  updateVisualizerParams(visualizerId, params) {
    // This integrates with your existing VIB34D visualizer system
    const visualizer = this.getVisualizer(visualizerId);
    if (!visualizer) return;
    
    // Apply parameters to visualizer
    Object.keys(params).forEach(key => {
      let value = params[key];
      
      // Handle special value types
      if (typeof value === 'string') {
        if (value.startsWith('+') || value.startsWith('-')) {
          // Relative change
          const currentValue = visualizer.currentParams[key] || 0;
          value = currentValue + parseFloat(value);
        } else if (value === 'complement') {
          // Complementary hue
          const currentHue = visualizer.currentParams.hue || 200;
          value = (currentHue + 180) % 360;
        } else if (value === 'shift') {
          // Random hue shift
          value = Math.random() * 360;
        }
      }
      
      // Update visualizer parameter
      this.setVisualizerParam(visualizerId, key, value);
    });
  }

  surgeVisualizerParams(visualizerId, params, duration) {
    const { surge = 0.2, settle = 0.8 } = duration || {};
    
    // Quick surge to peak values
    this.updateVisualizerParams(visualizerId, params);
    
    // Settle back to normal over time
    setTimeout(() => {
      this.resetVisualizer(visualizerId, settle * 1000);
    }, surge * 1000);
  }

  getVisualizer(visualizerId) {
    // Interface with existing UnifiedExperienceEngine visualizer system
    if (this.baseEngine && this.baseEngine.visualizers) {
      return this.baseEngine.visualizers.get(visualizerId);
    }
    return null;
  }

  setVisualizerParam(visualizerId, param, value) {
    const visualizer = this.getVisualizer(visualizerId);
    if (!visualizer || !visualizer.iframe) return;
    
    // Update URL parameters for VIB34D iframe
    const url = new URL(visualizer.iframe.src);
    url.searchParams.set(param, value);
    
    // Only update if URL actually changed to avoid unnecessary reloads
    if (visualizer.iframe.src !== url.toString()) {
      visualizer.iframe.src = url.toString();
      
      // Store current parameters
      visualizer.currentParams = visualizer.currentParams || {};
      visualizer.currentParams[param] = value;
    }
  }

  resetVisualizer(visualizerId, transitionTime = 500) {
    const visualizer = this.getVisualizer(visualizerId);
    if (!visualizer) return;
    
    // Reset to default parameters gradually
    const defaultParams = {
      gridDensity: 10,
      speed: 0.01,
      chaos: 0.1,
      hue: 200,
      morphFactor: 1.0,
      intensity: 0.8
    };
    
    // Gradual transition back to defaults
    Object.keys(defaultParams).forEach(key => {
      setTimeout(() => {
        this.setVisualizerParam(visualizerId, key, defaultParams[key]);
      }, Math.random() * transitionTime);
    });
  }

  initializeVisualizerManager() {
    // Enhanced visualizer management that works with existing system
    if (this.baseEngine && this.baseEngine.visualizers) {
      this.visualizerManager = this.baseEngine.visualizers;
      console.log('🎯 Visualizer Manager integrated with base engine');
    }
  }

  initializeInteractionSystem() {
    // Add magnetic button effects
    document.querySelectorAll('.btn').forEach(button => {
      button.addEventListener('mousemove', (e) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        const distance = Math.sqrt(x * x + y * y);
        const maxDistance = Math.min(rect.width, rect.height) / 2;
        
        if (distance < maxDistance * 2) {
          const force = 1 - (distance / (maxDistance * 2));
          button.style.transform = `translate(${x * force * 0.3}px, ${y * force * 0.3}px)`;
        }
      });
      
      button.addEventListener('mouseleave', () => {
        button.style.transform = 'translate(0, 0)';
      });
    });
  }

  initializeNeoskeuomorphicEffects() {
    // Add enhanced depth effects to cards
    document.querySelectorAll('.unified-card, .tech-card, .portfolio-item').forEach(card => {
      // Add depth layers if they don't exist
      if (!card.querySelector('.card-depth-background')) {
        this.addDepthLayers(card);
      }
      
      // Enhanced shadow effects
      card.addEventListener('mousedown', () => {
        card.classList.add('pressed');
      });
      
      card.addEventListener('mouseup', () => {
        card.classList.remove('pressed');
      });
      
      card.addEventListener('mouseleave', () => {
        card.classList.remove('pressed');
      });
    });
  }

  addDepthLayers(card) {
    const layers = ['background', 'shadow', 'highlight', 'accent'];
    
    layers.forEach(layer => {
      const div = document.createElement('div');
      div.className = `card-depth-${layer}`;
      card.appendChild(div);
    });
  }

  generateId() {
    return 'reactive-' + Math.random().toString(36).substr(2, 9);
  }

  // Public API for debugging and external control
  getElementData(elementId) {
    return this.reactiveElements.get(elementId);
  }

  triggerReaction(elementId, reactionType) {
    const elementData = this.reactiveElements.get(elementId);
    if (elementData) {
      if (reactionType === 'hover') {
        this.triggerHoverReaction(elementData, true);
      } else if (reactionType === 'click') {
        this.triggerClickReaction(elementData);
      }
    }
  }
}

// Initialize when DOM and base engine are ready
document.addEventListener('DOMContentLoaded', () => {
  // Wait a bit for the base engine to initialize
  setTimeout(() => {
    window.enhancedConductor = new EnhancedMasterConductor();
    
    // Global debugging interface
    window.triggerReaction = (elementId, type) => {
      window.enhancedConductor.triggerReaction(elementId, type);
    };
    
    console.log('🎭 Enhanced Master Conductor - Total reactivity system ready');
  }, 500);
});