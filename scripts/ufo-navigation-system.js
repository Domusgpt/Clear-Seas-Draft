/*
 * UFO Navigation System
 * Orbital navigation buttons with portal transitions
 * Smooth section jumping with beam effects
 */

class UFONavigationSystem {
  constructor() {
    this.sections = [];
    this.currentSection = 0;
    this.isTransitioning = false;
    this.ufoButtons = new Map();
    
    this.init();
  }
  
  init() {
    console.log('🛸 UFO Navigation System initializing...');
    
    // Find all major sections
    this.findSections();
    
    // Create UFO navigation
    this.createUFONavigation();
    
    // Setup scroll detection
    this.setupScrollDetection();
    
    // Setup keyboard navigation
    this.setupKeyboardNavigation();
    
    console.log('🛸 UFO Navigation ready for interdimensional travel');
  }
  
  findSections() {
    // Find main content sections
    const sectionElements = [
      document.querySelector('#hero'),
      document.querySelector('#technology'),
      document.querySelector('#portfolio'),
      document.querySelector('#research'),
      document.querySelector('#about'),
      document.querySelector('#contact')
    ].filter(el => el !== null);
    
    this.sections = sectionElements.map((element, index) => ({
      element,
      id: element.id,
      name: element.id.charAt(0).toUpperCase() + element.id.slice(1),
      index,
      icon: this.getSectionIcon(element.id)
    }));
    
    console.log(`📍 Found ${this.sections.length} navigable sections`);
  }
  
  getSectionIcon(sectionId) {
    const icons = {
      hero: '🌌',
      technology: '⚡',
      portfolio: '💎',
      research: '📡',
      about: '👁️',
      contact: '📬'
    };
    return icons[sectionId] || '🔮';
  }
  
  createUFONavigation() {
    // Create main UFO container
    const ufoContainer = document.createElement('div');
    ufoContainer.className = 'ufo-nav-container';
    ufoContainer.innerHTML = `
      <div class="ufo-orbital-system">
        <div class="ufo-main-button" id="ufo-main">
          <div class="ufo-body">
            <div class="ufo-disc"></div>
            <div class="ufo-lights">
              <span class="ufo-light"></span>
              <span class="ufo-light"></span>
              <span class="ufo-light"></span>
              <span class="ufo-light"></span>
            </div>
            <div class="ufo-cockpit">
              <span class="section-indicator">${this.sections[0]?.icon || '🌌'}</span>
            </div>
          </div>
          <div class="ufo-menu-ring"></div>
        </div>
        <div class="ufo-satellites"></div>
      </div>
      <div class="ufo-tooltip">
        <span class="tooltip-text">Navigate</span>
      </div>
    `;
    
    document.body.appendChild(ufoContainer);
    
    // Get references
    this.mainUFO = ufoContainer.querySelector('#ufo-main');
    this.satellites = ufoContainer.querySelector('.ufo-satellites');
    this.menuRing = ufoContainer.querySelector('.ufo-menu-ring');
    this.sectionIndicator = ufoContainer.querySelector('.section-indicator');
    
    // Create satellite buttons for each section
    this.createSatelliteButtons();
    
    // Setup main UFO interactions
    this.setupMainUFOInteractions();
  }
  
  createSatelliteButtons() {
    const angleStep = 360 / this.sections.length;
    
    this.sections.forEach((section, index) => {
      const satellite = document.createElement('div');
      satellite.className = 'ufo-satellite';
      satellite.dataset.section = section.id;
      satellite.dataset.index = index;
      
      // Calculate orbital position
      const angle = angleStep * index - 90; // Start from top
      const radius = 100;
      const x = Math.cos(angle * Math.PI / 180) * radius;
      const y = Math.sin(angle * Math.PI / 180) * radius;
      
      satellite.style.cssText = `
        --orbit-x: ${x}px;
        --orbit-y: ${y}px;
        --orbit-angle: ${angle}deg;
        --orbit-delay: ${index * 0.1}s;
      `;
      
      satellite.innerHTML = `
        <div class="satellite-body">
          <span class="satellite-icon">${section.icon}</span>
          <div class="satellite-ring"></div>
          <div class="satellite-glow"></div>
        </div>
        <div class="satellite-label">${section.name}</div>
      `;
      
      // Add click handler
      satellite.addEventListener('click', () => {
        this.navigateToSection(index);
      });
      
      // Hover effects
      satellite.addEventListener('mouseenter', () => {
        this.highlightSection(section.element);
      });
      
      satellite.addEventListener('mouseleave', () => {
        this.unhighlightSection(section.element);
      });
      
      this.satellites.appendChild(satellite);
      this.ufoButtons.set(section.id, satellite);
    });
  }
  
  setupMainUFOInteractions() {
    let isMenuOpen = false;
    
    // Toggle orbital menu
    this.mainUFO.addEventListener('click', () => {
      isMenuOpen = !isMenuOpen;
      
      if (isMenuOpen) {
        this.openOrbitalMenu();
      } else {
        this.closeOrbitalMenu();
      }
    });
    
    // Hover effects
    this.mainUFO.addEventListener('mouseenter', () => {
      this.mainUFO.classList.add('hovering');
    });
    
    this.mainUFO.addEventListener('mouseleave', () => {
      this.mainUFO.classList.remove('hovering');
    });
  }
  
  openOrbitalMenu() {
    this.satellites.classList.add('expanded');
    this.menuRing.classList.add('active');
    
    // Animate satellites into position
    const satellites = this.satellites.querySelectorAll('.ufo-satellite');
    satellites.forEach((satellite, index) => {
      setTimeout(() => {
        satellite.classList.add('visible');
        satellite.style.transform = `
          translate(var(--orbit-x), var(--orbit-y))
          rotate(var(--orbit-angle))
          scale(1)
        `;
      }, index * 50);
    });
    
    // Create energy field
    this.createEnergyField();
  }
  
  closeOrbitalMenu() {
    this.satellites.classList.remove('expanded');
    this.menuRing.classList.remove('active');
    
    // Retract satellites
    const satellites = this.satellites.querySelectorAll('.ufo-satellite');
    satellites.forEach((satellite) => {
      satellite.classList.remove('visible');
      satellite.style.transform = 'translate(0, 0) scale(0)';
    });
    
    // Remove energy field
    this.removeEnergyField();
  }
  
  createEnergyField() {
    const field = document.createElement('div');
    field.className = 'ufo-energy-field';
    field.innerHTML = `
      <svg viewBox="0 0 400 400" class="energy-svg">
        <defs>
          <radialGradient id="energy-gradient">
            <stop offset="0%" stop-color="rgba(0,255,255,0.4)"/>
            <stop offset="50%" stop-color="rgba(255,0,255,0.2)"/>
            <stop offset="100%" stop-color="transparent"/>
          </radialGradient>
        </defs>
        <circle cx="200" cy="200" r="150" fill="url(#energy-gradient)" 
                class="energy-pulse"/>
      </svg>
    `;
    
    this.mainUFO.appendChild(field);
  }
  
  removeEnergyField() {
    const field = this.mainUFO.querySelector('.ufo-energy-field');
    if (field) {
      field.classList.add('fading');
      setTimeout(() => field.remove(), 500);
    }
  }
  
  navigateToSection(index) {
    if (this.isTransitioning || index === this.currentSection) return;
    
    this.isTransitioning = true;
    const targetSection = this.sections[index];
    
    // Close menu
    this.closeOrbitalMenu();
    
    // Trigger beam effect
    this.triggerBeamTransition(targetSection);
    
    // Smooth scroll to section
    setTimeout(() => {
      targetSection.element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      
      this.currentSection = index;
      this.updateSectionIndicator(targetSection);
      
      // Update URL hash
      window.location.hash = targetSection.id;
      
      setTimeout(() => {
        this.isTransitioning = false;
      }, 1000);
    }, 300);
  }
  
  triggerBeamTransition(targetSection) {
    // Add beaming class to UFO
    this.mainUFO.classList.add('beaming');
    
    // Create portal effect at target
    const portal = document.createElement('div');
    portal.className = 'section-portal';
    portal.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 9999;
    `;
    
    portal.innerHTML = `
      <div class="portal-vortex">
        <div class="vortex-ring"></div>
        <div class="vortex-ring"></div>
        <div class="vortex-ring"></div>
      </div>
    `;
    
    targetSection.element.appendChild(portal);
    
    // Clean up after animation
    setTimeout(() => {
      this.mainUFO.classList.remove('beaming');
      portal.remove();
    }, 1000);
  }
  
  updateSectionIndicator(section) {
    // Update UFO cockpit indicator
    this.sectionIndicator.textContent = section.icon;
    
    // Update active satellite
    this.ufoButtons.forEach((button, sectionId) => {
      if (sectionId === section.id) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  }
  
  highlightSection(element) {
    element.classList.add('ufo-highlighted');
    element.style.filter = 'brightness(1.2) contrast(1.1)';
    element.style.transform = 'scale(1.02)';
  }
  
  unhighlightSection(element) {
    element.classList.remove('ufo-highlighted');
    element.style.filter = '';
    element.style.transform = '';
  }
  
  setupScrollDetection() {
    // Detect which section is currently in view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          const section = this.sections.find(s => s.element === entry.target);
          if (section && section.index !== this.currentSection) {
            this.currentSection = section.index;
            this.updateSectionIndicator(section);
          }
        }
      });
    }, {
      threshold: [0.5]
    });
    
    this.sections.forEach(section => {
      observer.observe(section.element);
    });
  }
  
  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      if (this.isTransitioning) return;
      
      switch(e.key) {
        case 'PageDown':
        case 'ArrowDown':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            this.navigateToNext();
          }
          break;
        case 'PageUp':
        case 'ArrowUp':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            this.navigateToPrevious();
          }
          break;
        case ' ':
          if (e.shiftKey) {
            e.preventDefault();
            this.toggleOrbitalMenu();
          }
          break;
      }
    });
  }
  
  navigateToNext() {
    const nextIndex = (this.currentSection + 1) % this.sections.length;
    this.navigateToSection(nextIndex);
  }
  
  navigateToPrevious() {
    const prevIndex = (this.currentSection - 1 + this.sections.length) % this.sections.length;
    this.navigateToSection(prevIndex);
  }
  
  toggleOrbitalMenu() {
    this.mainUFO.click();
  }
}

// Additional CSS for UFO system
const ufoStyles = `
<style>
.ufo-orbital-system {
  position: relative;
  width: 80px;
  height: 80px;
}

.ufo-main-button {
  position: relative;
  width: 80px;
  height: 80px;
  cursor: pointer;
  z-index: 10;
}

.ufo-cockpit {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  border: 2px solid rgba(0, 255, 255, 0.6);
}

.section-indicator {
  font-size: 20px;
  animation: indicator-pulse 2s ease-in-out infinite;
}

@keyframes indicator-pulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.2); opacity: 1; }
}

.ufo-satellites {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  height: 300px;
  pointer-events: none;
}

.ufo-satellites.expanded {
  pointer-events: all;
}

.ufo-satellite {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 50px;
  height: 50px;
  transform: translate(-50%, -50%) scale(0);
  transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  cursor: pointer;
  opacity: 0;
}

.ufo-satellite.visible {
  opacity: 1;
}

.satellite-body {
  position: relative;
  width: 100%;
  height: 100%;
  background: radial-gradient(ellipse at center,
    rgba(0, 255, 255, 0.4) 0%,
    rgba(0, 255, 255, 0.2) 40%,
    transparent 70%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 0 20px rgba(0, 255, 255, 0.6),
    inset 0 0 10px rgba(255, 255, 255, 0.3);
}

.satellite-icon {
  font-size: 24px;
  z-index: 2;
}

.satellite-ring {
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  border: 2px solid rgba(0, 255, 255, 0.5);
  border-radius: 50%;
  animation: ring-rotate 3s linear infinite;
}

@keyframes ring-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.satellite-label {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 5px;
  font-size: 10px;
  color: rgba(0, 255, 255, 0.8);
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.ufo-satellite:hover .satellite-label {
  opacity: 1;
}

.ufo-satellite.active .satellite-body {
  background: radial-gradient(ellipse at center,
    rgba(255, 0, 255, 0.6) 0%,
    rgba(0, 255, 255, 0.4) 40%,
    transparent 70%);
  box-shadow:
    0 0 30px rgba(255, 0, 255, 0.8),
    inset 0 0 15px rgba(255, 255, 255, 0.5);
}

.ufo-menu-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
  border: 2px dashed rgba(0, 255, 255, 0.2);
  border-radius: 50%;
  opacity: 0;
  transition: all 0.5s ease;
  pointer-events: none;
}

.ufo-menu-ring.active {
  opacity: 1;
  animation: menu-ring-rotate 10s linear infinite;
}

@keyframes menu-ring-rotate {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

.ufo-energy-field {
  position: absolute;
  top: -100%;
  left: -100%;
  width: 300%;
  height: 300%;
  pointer-events: none;
  animation: energy-expand 0.5s ease-out;
}

@keyframes energy-expand {
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.energy-pulse {
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
}

.portal-vortex {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 500px;
  height: 500px;
  animation: vortex-spin 1s ease-out;
}

@keyframes vortex-spin {
  from {
    transform: translate(-50%, -50%) scale(0) rotate(0deg);
    opacity: 1;
  }
  to {
    transform: translate(-50%, -50%) scale(3) rotate(720deg);
    opacity: 0;
  }
}

.vortex-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 3px solid rgba(0, 255, 255, 0.6);
  border-radius: 50%;
  animation: ring-expand 1s ease-out infinite;
}

.vortex-ring:nth-child(1) {
  width: 100px;
  height: 100px;
  animation-delay: 0s;
}

.vortex-ring:nth-child(2) {
  width: 200px;
  height: 200px;
  animation-delay: 0.2s;
}

.vortex-ring:nth-child(3) {
  width: 300px;
  height: 300px;
  animation-delay: 0.4s;
}

@keyframes ring-expand {
  from {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  to {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}
</style>
`;

// Inject UFO styles
document.head.insertAdjacentHTML('beforeend', ufoStyles);

// Initialize when ready
document.addEventListener('DOMContentLoaded', () => {
  window.ufoNav = new UFONavigationSystem();
});

console.log('🛸 UFO Navigation System loaded');