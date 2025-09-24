/*
 * Clear Seas Solutions - Main Application Controller
 * Orchestrates all systems and micro-reactive integrations
 * 
 * This is the central coordination layer that brings together:
 * - VIB34D visualizer integration
 * - Theme management systems
 * - Portfolio and research systems
 * - Performance monitoring
 * - Micro-reactive UI elements
 */

class ClearSeasMainController {
  constructor() {
    this.systems = new Map();
    this.performance = {
      startTime: performance.now(),
      initialized: false,
      loadTime: 0,
      systemsReady: 0,
      totalSystems: 6
    };
    
    this.theme = {
      current: 'polychora',
      transition: false,
      observers: new Set()
    };

    this.microReactivity = {
      enabled: true,
      sensitivity: 0.7,
      interactions: new Map()
    };

    this.init();
  }

  async init() {
    console.log('🚀 Clear Seas Solutions - Starting system initialization');
    
    try {
      // Initialize core systems in sequence
      await this.initializeThemeSystem();
      await this.initializePerformanceMonitoring();
      await this.initializeMicroReactivity();
      await this.initializeChoreographedSystem();
      await this.initializeVisualizers();
      await this.initializeContentSystems();
      
      // Setup cross-system integrations
      this.setupSystemIntegrations();
      this.setupGlobalEventHandlers();
      
      // Finalize initialization
      this.performance.initialized = true;
      this.performance.loadTime = performance.now() - this.performance.startTime;
      
      console.log(`✅ All systems initialized in ${this.performance.loadTime.toFixed(2)}ms`);
      this.dispatchSystemReady();
      
    } catch (error) {
      console.error('❌ System initialization failed:', error);
      this.handleInitializationError(error);
    }
  }

  async initializeThemeSystem() {
    console.log('🎨 Initializing theme system...');
    
    const themeSystem = {
      currentTheme: 'polychora',
      transitions: new Map(),
      observers: new Map()
    };

    // Theme mapping for different sections
    const sectionThemes = {
      hero: 'polychora',
      about: 'teal',
      portfolio: 'faceted', 
      research: 'purple',
      contact: 'red'
    };

    // Setup intersection observer for theme transitions
    const themeObserver = new IntersectionObserver(
      (entries) => this.handleThemeTransitions(entries, sectionThemes),
      { threshold: 0.3, rootMargin: '-20% 0px' }
    );

    // Observe all major sections
    document.querySelectorAll('section[data-theme], #hero').forEach(section => {
      themeObserver.observe(section);
    });

    themeSystem.observers.set('section', themeObserver);

    // Setup smooth theme transitions
    this.setupThemeTransitions();

    this.systems.set('theme', themeSystem);
    this.incrementSystemReady();
  }

  async initializePerformanceMonitoring() {
    console.log('📊 Initializing performance monitoring...');
    
    const performanceSystem = {
      metrics: {
        fps: 0,
        frameTime: 0,
        memoryUsage: 0,
        activeVisualizers: 0,
        networkRequests: 0
      },
      monitors: new Map(),
      updateInterval: null
    };

    // FPS monitoring
    let frameCount = 0;
    let lastFrameTime = performance.now();

    const fpsMonitor = () => {
      frameCount++;
      const currentTime = performance.now();
      const deltaTime = currentTime - lastFrameTime;

      if (deltaTime >= 1000) {
        performanceSystem.metrics.fps = Math.round((frameCount * 1000) / deltaTime);
        performanceSystem.metrics.frameTime = deltaTime / frameCount;
        
        frameCount = 0;
        lastFrameTime = currentTime;
        
        this.updatePerformanceDisplay(performanceSystem.metrics);
      }

      requestAnimationFrame(fpsMonitor);
    };

    performanceSystem.monitors.set('fps', requestAnimationFrame(fpsMonitor));

    // Memory usage monitoring (if available)
    if ('memory' in performance) {
      performanceSystem.updateInterval = setInterval(() => {
        performanceSystem.metrics.memoryUsage = Math.round(
          performance.memory.usedJSHeapSize / 1024 / 1024
        );
      }, 2000);
    }

    this.systems.set('performance', performanceSystem);
    this.incrementSystemReady();
  }

  async initializeMicroReactivity() {
    console.log('⚡ Initializing micro-reactive systems...');
    
    const reactivitySystem = {
      interactions: new Map(),
      observers: new Map(),
      debounceTimers: new Map()
    };

    // Setup hover reactivity for cards and interactive elements
    this.setupHoverReactivity(reactivitySystem);
    
    // Setup scroll-based micro-animations
    this.setupScrollReactivity(reactivitySystem);
    
    // Setup cursor following effects
    this.setupCursorEffects(reactivitySystem);
    
    // Setup intersection-based micro-reactions
    this.setupIntersectionReactivity(reactivitySystem);

    this.systems.set('reactivity', reactivitySystem);
    this.incrementSystemReady();
  }

  async initializeChoreographedSystem() {
    console.log('🎭 Initializing choreographed reactive visualizer system...');
    
    // Check if ChoreographedVisualizerSystem is available
    if (typeof window.ChoreographedVisualizerSystem === 'undefined') {
      console.warn('⚠️ ChoreographedVisualizerSystem not found, using fallback');
      this.incrementSystemReady();
      return;
    }
    
    try {
      // Initialize the choreographed system
      this.choreographedSystem = new window.ChoreographedVisualizerSystem();
      
      // System initializes automatically in constructor, no start() method needed
      console.log('✅ Choreographed visualizer system initialized successfully');
      this.systems.set('choreographed', this.choreographedSystem);
    } catch (error) {
      console.error('❌ Failed to initialize choreographed system:', error);
      console.error('Error details:', error.message, error.stack);
    }
    
    this.incrementSystemReady();
  }

  async initializeVisualizers() {
    console.log('🌟 Initializing VIB34D iframe visualizers...');
    
    const visualizerSystem = {
      iframes: document.querySelectorAll('iframe[src*="vib34d-ultimate-viewer"]'),
      performanceMode: 'auto',
      adaptiveQuality: true
    };

    console.log(`📊 Found ${visualizerSystem.iframes.length} VIB34D visualizer iframes`);

    // Setup theme synchronization for iframes
    this.setupVisualizerThemeSync(visualizerSystem);

    this.systems.set('visualizers', visualizerSystem);
    this.incrementSystemReady();
  }

  async initializeContentSystems() {
    console.log('📚 Initializing content management systems...');
    
    const contentSystems = {
      portfolio: null,
      research: null,
      ready: 0,
      total: 2
    };

    // Wait for portfolio system
    if (window.portfolioSystem) {
      contentSystems.portfolio = window.portfolioSystem;
      contentSystems.ready++;
    }

    // Wait for research system  
    if (window.researchSystem) {
      contentSystems.research = window.researchSystem;
      contentSystems.ready++;
    }

    // If systems aren't ready yet, wait for them
    if (contentSystems.ready < contentSystems.total) {
      await new Promise(resolve => {
        const checkSystems = setInterval(() => {
          let ready = 0;
          if (window.portfolioSystem) {
            contentSystems.portfolio = window.portfolioSystem;
            ready++;
          }
          if (window.researchSystem) {
            contentSystems.research = window.researchSystem;
            ready++;
          }
          
          if (ready >= contentSystems.total) {
            clearInterval(checkSystems);
            resolve();
          }
        }, 100);
      });
    }

    this.systems.set('content', contentSystems);
    this.incrementSystemReady();
  }

  setupThemeTransitions() {
    // CSS custom property transitions
    const root = document.documentElement;
    
    // Add transition classes for smooth theme changes
    root.style.setProperty('--theme-transition-duration', '0.6s');
    root.style.setProperty('--theme-transition-easing', 'cubic-bezier(0.4, 0, 0.2, 1)');

    // Apply transitions to key elements
    const transitionProperties = [
      '--theme-primary',
      '--theme-secondary', 
      '--theme-tertiary',
      'background-color',
      'border-color',
      'color'
    ];

    const style = document.createElement('style');
    style.textContent = `
      :root {
        transition: ${transitionProperties.map(prop => 
          `${prop} var(--theme-transition-duration) var(--theme-transition-easing)`
        ).join(', ')};
      }
      
      .theme-transition * {
        transition: inherit;
      }
    `;
    
    document.head.appendChild(style);
  }

  handleThemeTransitions(entries, sectionThemes) {
    let mostVisibleSection = null;
    let maxVisibility = 0;

    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio > maxVisibility) {
        maxVisibility = entry.intersectionRatio;
        mostVisibleSection = entry.target;
      }
    });

    if (mostVisibleSection) {
      const sectionId = mostVisibleSection.id || 
                       mostVisibleSection.className.split(' ')[0].replace('-section', '');
      const newTheme = sectionThemes[sectionId] || 
                      mostVisibleSection.dataset.theme || 
                      'polychora';

      if (newTheme !== this.theme.current) {
        this.transitionToTheme(newTheme);
      }
    }
  }

  transitionToTheme(newTheme) {
    if (this.theme.transition) return; // Already transitioning
    
    this.theme.transition = true;
    const oldTheme = this.theme.current;
    
    console.log(`🎨 Theme transition: ${oldTheme} → ${newTheme}`);

    // Update CSS custom properties
    const themeColors = {
      polychora: { primary: '#00d4ff', secondary: '#ff006e', tertiary: '#7b2cbf' },
      teal: { primary: '#0a9396', secondary: '#94d2bd', tertiary: '#005f73' },
      faceted: { primary: '#00f5ff', secondary: '#66ffcc', tertiary: '#0080ff' },
      purple: { primary: '#7b2cbf', secondary: '#9d4edd', tertiary: '#5a189a' },
      red: { primary: '#e63946', secondary: '#f4a261', tertiary: '#e76f51' }
    };

    const colors = themeColors[newTheme] || themeColors.polychora;
    const root = document.documentElement;

    // Apply new theme colors
    root.style.setProperty('--theme-primary', colors.primary);
    root.style.setProperty('--theme-secondary', colors.secondary);
    root.style.setProperty('--theme-tertiary', colors.tertiary);

    // Update theme data attribute
    root.setAttribute('data-theme', newTheme);

    // Notify all systems of theme change
    this.dispatchThemeChange(newTheme, oldTheme);

    this.theme.current = newTheme;
    
    // Reset transition flag after animation completes
    setTimeout(() => {
      this.theme.transition = false;
    }, 600);
  }

  setupHoverReactivity(reactivitySystem) {
    // Enhanced hover effects for interactive elements
    const hoverElements = [
      { selector: '.card', effect: 'elevate' },
      { selector: '.btn', effect: 'glow' },
      { selector: '.nav-link', effect: 'highlight' },
      { selector: '.project-card', effect: 'transform' },
      { selector: '.research-card', effect: 'transform' }
    ];

    hoverElements.forEach(({ selector, effect }) => {
      document.addEventListener('mouseover', (e) => {
        const element = e.target.closest(selector);
        if (element) this.applyHoverEffect(element, effect, true);
      });

      document.addEventListener('mouseout', (e) => {
        const element = e.target.closest(selector);
        if (element) this.applyHoverEffect(element, effect, false);
      });
    });
  }

  applyHoverEffect(element, effect, isHover) {
    const effectMap = {
      elevate: () => {
        element.style.transform = isHover ? 'translateY(-8px) scale(1.02)' : '';
        element.style.boxShadow = isHover ? '0 20px 40px rgba(0,0,0,0.3)' : '';
      },
      glow: () => {
        element.style.boxShadow = isHover ? 
          '0 0 20px var(--theme-primary), 0 4px 15px rgba(0,0,0,0.2)' : '';
      },
      highlight: () => {
        element.style.color = isHover ? 'var(--theme-primary)' : '';
        element.style.textShadow = isHover ? '0 0 10px var(--theme-primary)' : '';
      },
      transform: () => {
        element.style.transform = isHover ? 'translateY(-4px) rotateX(2deg)' : '';
        element.style.borderColor = isHover ? 'var(--theme-primary)' : '';
      }
    };

    if (effectMap[effect]) {
      effectMap[effect]();
    }
  }

  setupScrollReactivity(reactivitySystem) {
    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;

    const scrollHandler = () => {
      const currentScrollY = window.scrollY;
      scrollVelocity = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;

      // Parallax effects for hero elements
      this.applyScrollParallax(currentScrollY, scrollVelocity);
      
      // Header transparency based on scroll
      this.applyScrollTransparency(currentScrollY);
    };

    // Throttled scroll handler
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      if (!scrollTimeout) {
        scrollTimeout = requestAnimationFrame(() => {
          scrollHandler();
          scrollTimeout = null;
        });
      }
    });
  }

  applyScrollParallax(scrollY, velocity) {
    const heroElements = document.querySelectorAll('.hero-background, .vib34d-container');
    const parallaxFactor = 0.3;

    heroElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        const offset = scrollY * parallaxFactor;
        element.style.transform = `translateY(${offset}px)`;
      }
    });
  }

  applyScrollTransparency(scrollY) {
    const header = document.querySelector('header');
    if (header) {
      const opacity = Math.min(scrollY / 100, 0.95);
      header.style.backgroundColor = `rgba(10, 11, 13, ${opacity})`;
      header.style.backdropFilter = scrollY > 50 ? 'blur(20px)' : 'none';
    }
  }

  setupCursorEffects(reactivitySystem) {
    // Custom cursor effects for interactive elements
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.style.cssText = `
      position: fixed;
      width: 20px;
      height: 20px;
      background: var(--theme-primary);
      border-radius: 50%;
      pointer-events: none;
      opacity: 0;
      transform: translate(-50%, -50%);
      transition: opacity 0.2s, transform 0.1s;
      z-index: 9999;
      mix-blend-mode: difference;
    `;
    document.body.appendChild(cursor);

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // Smooth cursor following
    const animateCursor = () => {
      cursorX += (mouseX - cursorX) * 0.1;
      cursorY += (mouseY - cursorY) * 0.1;
      
      cursor.style.left = cursorX + 'px';
      cursor.style.top = cursorY + 'px';
      
      requestAnimationFrame(animateCursor);
    };
    animateCursor();

    // Show/hide cursor on interactive elements
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest('a, button, .card, [data-cursor="pointer"]')) {
        cursor.style.opacity = '1';
        cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest('a, button, .card, [data-cursor="pointer"]')) {
        cursor.style.opacity = '0';
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
      }
    });
  }

  setupIntersectionReactivity(reactivitySystem) {
    // Micro-animations triggered by element visibility
    const reactivityObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.triggerMicroAnimation(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    // Observe all reactive elements
    document.querySelectorAll('[data-reactive]').forEach(element => {
      reactivityObserver.observe(element);
    });

    reactivitySystem.observers.set('reactivity', reactivityObserver);
  }

  triggerMicroAnimation(element) {
    const animationType = element.dataset.reactive || 'fadeIn';
    
    const animations = {
      fadeIn: () => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        requestAnimationFrame(() => {
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
        });
      },
      slideIn: () => {
        element.style.transform = 'translateX(-50px)';
        element.style.opacity = '0';
        element.style.transition = 'transform 0.8s ease, opacity 0.8s ease';
        
        requestAnimationFrame(() => {
          element.style.transform = 'translateX(0)';
          element.style.opacity = '1';
        });
      },
      scale: () => {
        element.style.transform = 'scale(0.8)';
        element.style.opacity = '0';
        element.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
        
        requestAnimationFrame(() => {
          element.style.transform = 'scale(1)';
          element.style.opacity = '1';
        });
      }
    };

    if (animations[animationType]) {
      animations[animationType]();
    }
  }

  setupAdaptiveQuality(visualizerSystem) {
    const performanceThresholds = {
      high: { fps: 55, memory: 100 },
      medium: { fps: 30, memory: 150 },
      low: { fps: 20, memory: 200 }
    };

    setInterval(() => {
      const perfSystem = this.systems.get('performance');
      if (!perfSystem) return;

      const { fps, memoryUsage } = perfSystem.metrics;
      let targetQuality = 'high';

      if (fps < performanceThresholds.low.fps || memoryUsage > performanceThresholds.low.memory) {
        targetQuality = 'low';
      } else if (fps < performanceThresholds.medium.fps || memoryUsage > performanceThresholds.medium.memory) {
        targetQuality = 'medium';
      }

      if (visualizerSystem.performanceMode !== targetQuality && visualizerSystem.adaptiveQuality) {
        console.log(`📊 Adaptive quality change: ${visualizerSystem.performanceMode} → ${targetQuality}`);
        visualizerSystem.performanceMode = targetQuality;
        
        // Update all visualizers with new quality setting
        if (visualizerSystem.manager) {
          // This would be implemented in the VIB34D manager
          // visualizerSystem.manager.setGlobalQuality(targetQuality);
        }
      }
    }, 5000);
  }

  setupVisualizerThemeSync(visualizerSystem) {
    // Sync visualizer themes with main theme changes
    this.theme.observers.add((newTheme, oldTheme) => {
      console.log(`🎨 Theme sync: ${oldTheme} → ${newTheme}`);
      
      // Update iframe src with new theme (optional - VIB34D handles themes internally)
      visualizerSystem.iframes.forEach(iframe => {
        const currentSrc = iframe.src;
        if (currentSrc.includes('theme=')) {
          iframe.src = currentSrc.replace(/theme=[^&]*/, `theme=${newTheme}`);
        } else {
          iframe.src = currentSrc + (currentSrc.includes('?') ? '&' : '?') + `theme=${newTheme}`;
        }
      });
    });
  }

  setupSystemIntegrations() {
    // Cross-system data sharing and coordination
    
    // Portfolio-Research integration
    const portfolio = this.systems.get('content')?.portfolio;
    const research = this.systems.get('content')?.research;
    
    if (portfolio && research) {
      // Share project data between systems
      this.setupContentSynchronization(portfolio, research);
    }

    // Performance-Visualizer integration
    const performance = this.systems.get('performance');
    const visualizers = this.systems.get('visualizers');
    
    if (performance && visualizers) {
      this.setupPerformanceVisualizerIntegration(performance, visualizers);
    }
  }

  setupContentSynchronization(portfolio, research) {
    // Sync project updates between portfolio and research systems
    // This enables research papers to reference portfolio projects
    console.log('🔗 Setting up content synchronization');
  }

  setupPerformanceVisualizerIntegration(performance, visualizers) {
    // Monitor visualizer impact on performance
    performance.visualizerImpact = {
      baseline: 0,
      current: 0,
      threshold: 10 // fps drop threshold
    };
  }

  setupGlobalEventHandlers() {
    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            this.navigateToSection('hero');
            break;
          case '2':
            e.preventDefault();
            this.navigateToSection('portfolio');
            break;
          case '3':
            e.preventDefault();
            this.navigateToSection('research');
            break;
          case 't':
            e.preventDefault();
            this.toggleTheme();
            break;
          case 'p':
            e.preventDefault();
            this.togglePerformanceMonitor();
            break;
        }
      }
    });

    // Global error handling
    window.addEventListener('error', (e) => {
      console.error('Global error caught:', e);
      this.handleGlobalError(e);
    });

    // Resize handler for responsive adjustments
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.handleResize();
      }, 250);
    });
  }

  navigateToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  toggleTheme() {
    const themes = ['polychora', 'teal', 'faceted', 'purple', 'red'];
    const currentIndex = themes.indexOf(this.theme.current);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    this.transitionToTheme(nextTheme);
  }

  togglePerformanceMonitor() {
    const monitor = document.querySelector('.performance-display');
    if (monitor) {
      monitor.style.display = monitor.style.display === 'none' ? 'block' : 'none';
    }
  }

  handleResize() {
    // Notify all systems of resize
    this.systems.forEach((system, name) => {
      if (system.handleResize) {
        system.handleResize();
      }
    });

    // Visualizer iframes handle resize automatically
    const visualizerSystem = this.systems.get('visualizers');
    if (visualizerSystem && visualizerSystem.iframes) {
      console.log(`🔄 Resize detected - ${visualizerSystem.iframes.length} visualizer iframes will auto-adjust`);
    }
  }

  updatePerformanceDisplay(metrics) {
    // Update performance metrics in UI
    const displays = document.querySelectorAll('[data-performance-metric]');
    displays.forEach(display => {
      const metric = display.dataset.performanceMetric;
      if (metrics[metric] !== undefined) {
        display.textContent = metrics[metric];
      }
    });

    // Update visualizer iframe count
    const visualizerSystem = this.systems.get('visualizers');
    if (visualizerSystem && visualizerSystem.iframes) {
      const activeVisualizersDisplay = document.querySelector('#monitor-gpu');
      if (activeVisualizersDisplay) {
        activeVisualizersDisplay.textContent = `${visualizerSystem.iframes.length} iframes`;
      }
    }

    // Update performance color indicators
    const fpsIndicator = document.querySelector('.fps-indicator');
    if (fpsIndicator) {
      fpsIndicator.className = `fps-indicator ${this.getPerformanceClass(metrics.fps)}`;
    }
  }

  getPerformanceClass(fps) {
    if (fps >= 55) return 'excellent';
    if (fps >= 30) return 'good';
    if (fps >= 20) return 'fair';
    return 'poor';
  }

  dispatchThemeChange(newTheme, oldTheme) {
    // Notify all registered theme observers
    this.theme.observers.forEach(callback => {
      try {
        callback(newTheme, oldTheme);
      } catch (error) {
        console.warn('Theme observer error:', error);
      }
    });

    // Dispatch global theme change event
    document.dispatchEvent(new CustomEvent('themechange', {
      detail: { theme: newTheme, previousTheme: oldTheme }
    }));
  }

  dispatchSystemReady() {
    document.dispatchEvent(new CustomEvent('systemready', {
      detail: {
        loadTime: this.performance.loadTime,
        systems: Array.from(this.systems.keys())
      }
    }));
  }

  incrementSystemReady() {
    this.performance.systemsReady++;
    console.log(`✅ System ready: ${this.performance.systemsReady}/${this.performance.totalSystems}`);
  }

  handleInitializationError(error) {
    // Graceful degradation on initialization failure
    document.body.classList.add('initialization-error');
    
    const errorDisplay = document.createElement('div');
    errorDisplay.className = 'system-error-notice';
    errorDisplay.innerHTML = `
      <div class="error-content">
        <h3>System Loading Issue</h3>
        <p>Some advanced features may not be available. The site will continue to function with basic functionality.</p>
        <button onclick="window.location.reload()">Retry</button>
      </div>
    `;
    
    document.body.appendChild(errorDisplay);
  }

  handleGlobalError(error) {
    // Log error for debugging
    console.error('Handled global error:', error);
    
    // In production, this might send errors to an error tracking service
    // errorTrackingService.captureError(error);
  }

  // Public API methods
  getSystem(name) {
    return this.systems.get(name);
  }

  getPerformanceMetrics() {
    return this.systems.get('performance')?.metrics || {};
  }

  setTheme(theme) {
    this.transitionToTheme(theme);
  }

  enableMicroReactivity(enabled = true) {
    this.microReactivity.enabled = enabled;
    document.body.classList.toggle('micro-reactivity-disabled', !enabled);
  }

  destroy() {
    // Cleanup all systems
    this.systems.forEach((system, name) => {
      if (system.destroy) {
        system.destroy();
      }
    });

    console.log('🧹 Clear Seas Main Controller destroyed');
  }
}

// Global main controller instance
let mainController = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  mainController = new ClearSeasMainController();
  
  // Expose to window for debugging and external access
  if (typeof window !== 'undefined') {
    window.clearSeasController = mainController;
  }
});

// Global class access for other scripts
window.ClearSeasMainController = ClearSeasMainController;