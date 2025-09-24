/*
 * SMOOTH SNAP CONTROLLER
 * Enhances scroll-snap with smooth transitions and immediate response
 */

class SmoothSnapController {
  constructor() {
    this.sections = document.querySelectorAll('.scroll-section');
    this.currentSection = 0;
    this.isScrolling = false;
    this.scrollTimeout = null;
    
    this.init();
  }
  
  init() {
    this.setupIntersectionObserver();
    this.enhanceScrollBehavior();
    this.setupKeyboardNavigation();
    this.addVisualIndicators();
    console.log('🎯 Smooth Snap Controller - Initialized');
  }
  
  setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Update current section
          const sectionIndex = Array.from(this.sections).indexOf(entry.target);
          this.currentSection = sectionIndex;
          
          // Add active class immediately
          this.sections.forEach(s => s.classList.remove('in-view'));
          entry.target.classList.add('in-view');
          
          // Trigger content animations
          this.triggerSectionAnimations(entry.target);
          
          // Update navigation
          this.updateNavigation(sectionIndex);
        }
      });
    }, options);
    
    this.sections.forEach(section => observer.observe(section));
  }
  
  enhanceScrollBehavior() {
    let lastScrollTime = 0;
    const scrollDelay = 50; // Minimum time between scroll events
    
    window.addEventListener('wheel', (e) => {
      const now = Date.now();
      if (now - lastScrollTime < scrollDelay) return;
      
      lastScrollTime = now;
      
      // Clear existing timeout
      clearTimeout(this.scrollTimeout);
      
      // Add scrolling class for visual feedback
      document.body.classList.add('scrolling');
      
      // Remove scrolling class after scroll ends
      this.scrollTimeout = setTimeout(() => {
        document.body.classList.remove('scrolling');
      }, 150);
    }, { passive: true });
  }
  
  triggerSectionAnimations(section) {
    // Immediate content reveal
    const content = section.querySelector('.section-container');
    if (content) {
      content.style.opacity = '1';
      content.style.transform = 'translateY(0) scale(1)';
    }
    
    // Stagger child element animations
    const elements = section.querySelectorAll('[data-animate]');
    elements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('animated');
      }, index * 50); // 50ms stagger
    });
    
    // Trigger canvas animations if present
    const canvas = section.querySelector('.zone-canvas-container');
    if (canvas) {
      canvas.style.opacity = '1';
      canvas.classList.add('active');
    }
  }
  
  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      switch(e.key) {
        case 'ArrowDown':
        case 'PageDown':
          e.preventDefault();
          this.scrollToSection(this.currentSection + 1);
          break;
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          this.scrollToSection(this.currentSection - 1);
          break;
        case 'Home':
          e.preventDefault();
          this.scrollToSection(0);
          break;
        case 'End':
          e.preventDefault();
          this.scrollToSection(this.sections.length - 1);
          break;
      }
    });
  }
  
  scrollToSection(index) {
    if (index < 0 || index >= this.sections.length) return;
    
    const section = this.sections[index];
    section.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
    
    this.currentSection = index;
  }
  
  updateNavigation(index) {
    // Update scroll indicators
    const indicators = document.querySelectorAll('.zone-indicator');
    indicators.forEach((ind, i) => {
      ind.classList.toggle('active', i === index);
    });
    
    // Update navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach((link, i) => {
      link.classList.toggle('active', i === index);
    });
    
    // Update progress bar if exists
    const progressBar = document.querySelector('.scroll-progress');
    if (progressBar) {
      const progress = ((index + 1) / this.sections.length) * 100;
      progressBar.style.width = `${progress}%`;
    }
  }
  
  addVisualIndicators() {
    // Create scroll progress bar
    const progressContainer = document.createElement('div');
    progressContainer.className = 'scroll-progress-container';
    progressContainer.innerHTML = `
      <div class="scroll-progress"></div>
    `;
    document.body.appendChild(progressContainer);
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .scroll-progress-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 3px;
        background: rgba(0, 0, 0, 0.1);
        z-index: 10000;
        pointer-events: none;
      }
      
      .scroll-progress {
        height: 100%;
        background: linear-gradient(90deg, 
          rgba(0, 255, 255, 0.8) 0%, 
          rgba(255, 0, 255, 0.8) 100%);
        width: 0;
        transition: width 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
      }
      
      .scroll-section.in-view {
        opacity: 1 !important;
      }
      
      .scroll-section.in-view .section-container {
        animation: quickReveal 0.4s ease-out forwards;
      }
      
      @keyframes quickReveal {
        from {
          opacity: 0.8;
          transform: translateY(20px) scale(0.98);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      
      body.scrolling .scroll-section {
        transition: transform 0.1s ease-out;
      }
      
      body.scrolling .scroll-section.in-view {
        transform: scale(1.01);
      }
      
      /* Smooth snap enhancements */
      .scroll-section [data-animate] {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.4s ease-out;
      }
      
      .scroll-section [data-animate].animated {
        opacity: 1;
        transform: translateY(0);
      }
    `;
    
    document.head.appendChild(style);
  }
}

// Initialize smooth snap controller
window.SmoothSnapController = SmoothSnapController;