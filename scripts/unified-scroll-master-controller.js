/*
 * UNIFIED SCROLL MASTER CONTROLLER
 * The One System That Rules All Visual Changes
 * Scroll becomes the conductor of a massive visual orchestra
 */

class UnifiedScrollMasterController {
  constructor() {
    // THE MASTER SCROLL STATE - Everything derives from this
    this.masterScrollState = {
      raw: 0,
      normalized: 0,
      velocity: 0,
      acceleration: 0,
      direction: 0,
      momentum: 0,
      phase: 0, // Current scroll phase (0-1 across entire page)
      sectionPhase: 0, // Current phase within active section (0-1)
      activeSection: 0,
      previousSection: -1,
      isTransitioning: false,
      transitionProgress: 0
    };
    
    // CINEMATIC SCENES - Big sweeping movements
    this.scenes = [
      { name: 'ENTRANCE', start: 0.0, end: 0.1, type: 'emergence' },
      { name: 'HERO_MORPH', start: 0.1, end: 0.25, type: 'transformation' },
      { name: 'TECH_DESCENT', start: 0.25, end: 0.5, type: 'descent' },
      { name: 'PORTFOLIO_SPIRAL', start: 0.5, end: 0.75, type: 'spiral' },
      { name: 'RESEARCH_ASCENT', start: 0.75, end: 0.9, type: 'ascent' },
      { name: 'FINALE_CONVERGENCE', start: 0.9, end: 1.0, type: 'convergence' }
    ];
    
    // MASSIVE VISUAL ELEMENTS
    this.elements = {
      cards: new Map(),
      visualizers: new Map(),
      backgrounds: new Map(),
      overlays: new Map(),
      particles: new Map()
    };
    
    // FLUID DYNAMICS ENGINE
    this.fluidSystem = {
      waveAmplitude: 0,
      frequency: 0,
      phase: 0,
      turbulence: 0,
      viscosity: 0.8,
      density: 1.0
    };
    
    // CINEMATIC CAMERA
    this.camera = {
      position: { x: 0, y: 0, z: 0 },
      target: { x: 0, y: 0, z: 0 },
      fov: 75,
      tilt: 0,
      zoom: 1,
      shake: 0
    };
    
    console.log('🎬 UNIFIED SCROLL MASTER CONTROLLER - Initializing Cinematic System');
    this.init();
  }
  
  init() {
    this.setupMasterScrollListener();
    this.discoverAllElements();
    this.createFluidBackgrounds();
    this.startCinematicLoop();
    console.log('🎭 SCROLL MASTER ACTIVE - All visuals now dance to scroll rhythm');
  }
  
  setupMasterScrollListener() {
    let lastScrollTime = 0;
    let scrollHistory = [];
    
    // THE MASTER SCROLL LISTENER - Everything flows from here
    window.addEventListener('scroll', () => {
      const now = performance.now();
      const timeDelta = now - lastScrollTime;
      lastScrollTime = now;
      
      // Calculate all scroll metrics
      const rawScroll = window.pageYOffset;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const normalized = Math.min(1, Math.max(0, rawScroll / maxScroll));
      
      // Velocity with smoothing
      const velocity = (rawScroll - this.masterScrollState.raw) / timeDelta * 100;
      scrollHistory.push(velocity);
      if (scrollHistory.length > 10) scrollHistory.shift();
      const smoothVelocity = scrollHistory.reduce((a, b) => a + b, 0) / scrollHistory.length;
      
      // Acceleration
      const acceleration = smoothVelocity - this.masterScrollState.velocity;
      
      // Update master state with proper section tracking
      const previousNormalized = this.masterScrollState.normalized;
      const newActiveSection = this.determineActiveScene(normalized);
      const previousActiveSection = this.masterScrollState.activeSection;
      
      this.masterScrollState = {
        raw: rawScroll,
        normalized: normalized,
        velocity: smoothVelocity,
        acceleration: acceleration,
        direction: Math.sign(smoothVelocity),
        momentum: Math.abs(smoothVelocity),
        phase: normalized,
        sectionPhase: this.calculateSectionPhase(normalized),
        activeSection: newActiveSection,
        previousSection: previousActiveSection,
        isTransitioning: Math.abs(normalized - previousNormalized) > 0.001,
        transitionProgress: this.calculateTransitionProgress(normalized)
      };
      
      // Update fluid dynamics
      this.updateFluidDynamics();
      
      // Update camera
      this.updateCinematicCamera();
      
      // ORCHESTRATE ALL VISUAL CHANGES
      this.orchestrateVisuals();
      
    }, { passive: true });
    
    // Smooth scroll momentum decay
    setInterval(() => {
      if (Math.abs(this.masterScrollState.velocity) > 0.1) {
        this.masterScrollState.velocity *= 0.95; // Decay
        this.masterScrollState.momentum = Math.abs(this.masterScrollState.velocity);
      }
    }, 16);
  }
  
  discoverAllElements() {
    // Find ALL visual elements and register them
    document.querySelectorAll('.tech-card, .portfolio-item, .paper-card').forEach((card, index) => {
      this.elements.cards.set(card.id || `card-${index}`, {
        element: card,
        baseTransform: { x: 0, y: 0, z: 0, rotX: 0, rotY: 0, rotZ: 0, scale: 1 },
        currentTransform: { x: 0, y: 0, z: 0, rotX: 0, rotY: 0, rotZ: 0, scale: 1 },
        targetTransform: { x: 0, y: 0, z: 0, rotX: 0, rotY: 0, rotZ: 0, scale: 1 },
        geometry: Math.floor(Math.random() * 8),
        targetGeometry: 0,
        intensity: 1,
        color: { h: Math.random() * 360, s: 0.8, l: 0.6 },
        phase: index * 0.1, // Stagger phase
        originalRect: card.getBoundingClientRect()
      });
    });
    
    // Discover sections
    document.querySelectorAll('section').forEach((section, index) => {
      this.elements.backgrounds.set(section.id, {
        element: section,
        baseColor: { r: 0.1, g: 0.1, b: 0.2 },
        currentColor: { r: 0.1, g: 0.1, b: 0.2 },
        intensity: 0,
        wavePhase: index * Math.PI / 4,
        particles: []
      });
    });
    
    console.log(`🎭 Discovered ${this.elements.cards.size} cards and ${this.elements.backgrounds.size} sections`);
  }
  
  createFluidBackgrounds() {
    // Create fluid background elements if they don't exist
    const existingFluidBg = document.getElementById('fluid-background');
    if (!existingFluidBg) {
      const fluidBg = document.createElement('div');
      fluidBg.id = 'fluid-background';
      fluidBg.className = 'fluid-background';
      document.body.appendChild(fluidBg);
    }
    
    const existingParticleSystem = document.getElementById('particle-system');
    if (!existingParticleSystem) {
      const particleSystem = document.createElement('div');
      particleSystem.id = 'particle-system';
      particleSystem.className = 'particle-system';
      document.body.appendChild(particleSystem);
    }
    
    console.log('🌊 Fluid background elements created');
  }
  
  updateFluidDynamics() {
    const scroll = this.masterScrollState;
    
    // Fluid system responds to scroll
    this.fluidSystem.waveAmplitude = scroll.momentum * 0.1;
    this.fluidSystem.frequency = 1 + scroll.velocity * 0.01;
    this.fluidSystem.phase += scroll.velocity * 0.001;
    this.fluidSystem.turbulence = Math.min(1, scroll.momentum * 0.02);
    this.fluidSystem.density = 1 + scroll.acceleration * 0.001;
    
    // Viscosity changes with direction changes
    if (scroll.direction !== this.lastDirection) {
      this.fluidSystem.viscosity = 0.3; // More fluid during direction changes
      this.lastDirection = scroll.direction;
    } else {
      this.fluidSystem.viscosity = Math.min(0.9, this.fluidSystem.viscosity + 0.01);
    }
  }
  
  updateCinematicCamera() {
    const scroll = this.masterScrollState;
    
    // Camera follows scroll with cinematic easing
    this.camera.position.y = -scroll.normalized * 5000;
    this.camera.position.z = 1000 - scroll.normalized * 800;
    
    // Dynamic FOV based on velocity
    this.camera.fov = 75 + scroll.momentum * 0.5;
    
    // Camera shake from acceleration
    this.camera.shake = Math.min(10, Math.abs(scroll.acceleration) * 0.1);
    
    // Tilt based on direction
    this.camera.tilt = scroll.velocity * 0.02;
    
    // Zoom for dramatic effect
    this.camera.zoom = 1 + scroll.momentum * 0.001;
    
    // Apply camera transforms to body
    document.body.style.transform = `
      perspective(${this.camera.fov}vw)
      translateY(${this.camera.position.y * 0.01}px)
      translateZ(${this.camera.position.z * 0.01}px)
      rotateZ(${this.camera.tilt}deg)
      scale(${this.camera.zoom})
    `;
    
    // Add camera shake
    if (this.camera.shake > 0.1) {
      document.body.style.transform += ` 
        translateX(${(Math.random() - 0.5) * this.camera.shake}px)
        translateY(${(Math.random() - 0.5) * this.camera.shake}px)
      `;
      this.camera.shake *= 0.9; // Decay
    }
  }
  
  orchestrateVisuals() {
    const scroll = this.masterScrollState;
    
    // MASSIVE CARD TRANSFORMATIONS
    this.transformCards(scroll);
    
    // BACKGROUND FLUID EFFECTS
    this.animateBackgrounds(scroll);
    
    // VISUALIZER GEOMETRY MORPHING
    this.morphVisualizers(scroll);
    
    // PARTICLE SYSTEMS
    this.updateParticles(scroll);
    
    // SCENE TRANSITIONS (with debouncing to prevent spam)
    if (scroll.activeSection !== scroll.previousSection && scroll.previousSection !== -1) {
      // Only trigger if we have a real section change (not initial load)
      if (!this.lastSceneTransition || (Date.now() - this.lastSceneTransition > 500)) {
        this.triggerSceneTransition(scroll.activeSection, scroll.previousSection);
        this.lastSceneTransition = Date.now();
      }
    }
  }
  
  transformCards(scroll) {
    this.elements.cards.forEach((cardData, cardId) => {
      const card = cardData.element;
      const rect = card.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      
      // Distance from viewport center (-1 to 1)
      const distanceFromCenter = (rect.top + rect.height / 2 - viewportCenter) / viewportCenter;
      
      // MASSIVE SCALE CHANGES based on distance
      const scale = 0.5 + (1 - Math.abs(distanceFromCenter)) * 0.8;
      
      // DRAMATIC Z-DEPTH MOVEMENT
      const zDepth = distanceFromCenter * 500 + scroll.phase * 200;
      
      // FLUID ROTATION based on scroll velocity
      const rotY = scroll.velocity * 0.5 + distanceFromCenter * 20;
      const rotX = scroll.acceleration * 0.3;
      const rotZ = Math.sin(scroll.phase * Math.PI * 2 + cardData.phase) * 5;
      
      // WAVE MOTION
      const waveOffset = Math.sin(scroll.phase * Math.PI * 4 + cardData.phase) * 50;
      
      // OPACITY FADING based on distance
      const opacity = Math.max(0.1, 1 - Math.abs(distanceFromCenter) * 0.7);
      
      // Apply the MASSIVE transformations
      card.style.transform = `
        perspective(1500px)
        translateZ(${zDepth}px)
        translateY(${waveOffset}px)
        rotateX(${rotX}deg)
        rotateY(${rotY}deg)
        rotateZ(${rotZ}deg)
        scale(${scale})
      `;
      
      card.style.opacity = opacity;
      
      // BLUR EFFECTS for depth
      const blur = Math.abs(distanceFromCenter) * 3;
      card.style.filter = `blur(${blur}px) brightness(${0.7 + (1 - Math.abs(distanceFromCenter)) * 0.5})`;
      
      // Update geometry for visualizers
      cardData.targetGeometry = scroll.phase * 8; // Continuous geometry morphing
      cardData.intensity = 1 - Math.abs(distanceFromCenter);
      
      // Color shifts based on scroll
      cardData.color.h = (cardData.color.h + scroll.velocity * 0.1) % 360;
      cardData.color.s = 0.5 + scroll.momentum * 0.01;
      cardData.color.l = 0.4 + cardData.intensity * 0.4;
    });
  }
  
  animateBackgrounds(scroll) {
    this.elements.backgrounds.forEach((bgData, sectionId) => {
      const section = bgData.element;
      
      // MASSIVE BACKGROUND MOVEMENT
      const parallaxY = scroll.raw * 0.3;
      const parallaxX = Math.sin(scroll.phase * Math.PI) * 50;
      
      // FLUID COLOR CHANGES
      const hue = scroll.phase * 360;
      const saturation = 0.3 + scroll.momentum * 0.01;
      const lightness = 0.1 + Math.sin(scroll.phase * Math.PI * 2) * 0.1;
      
      section.style.background = `
        linear-gradient(
          ${scroll.phase * 180}deg,
          hsl(${hue}, ${saturation * 100}%, ${lightness * 100}%) 0%,
          hsl(${(hue + 60) % 360}, ${saturation * 100}%, ${lightness * 50}%) 50%,
          hsl(${(hue + 120) % 360}, ${saturation * 100}%, ${lightness * 30}%) 100%
        )
      `;
      
      section.style.transform = `translateY(${parallaxY}px) translateX(${parallaxX}px)`;
      
      // WAVE OVERLAYS
      if (!section.querySelector('.fluid-overlay')) {
        this.createFluidOverlay(section, bgData);
      }
    });
  }
  
  morphVisualizers(scroll) {
    // Find all active visualizers and morph their geometry
    if (window.cardSystemController && window.cardSystemController.cards) {
      window.cardSystemController.cards.forEach((cardData, cardId) => {
        cardData.visualizers.forEach((visualizer, role) => {
          if (visualizer && visualizer.gl) {
            // CONTINUOUS GEOMETRY MORPHING
            const geometryFloat = scroll.phase * 8; // 0-8 range covers all geometries
            visualizer.currentGeometry = geometryFloat;
            
            // DENSITY CHANGES
            const density = 5 + scroll.momentum * 0.1;
            visualizer.instanceParams.densityMult = density;
            
            // SPEED VARIATIONS
            visualizer.instanceParams.speedMult = 0.5 + scroll.velocity * 0.001;
            
            // COLOR MORPHING
            visualizer.instanceParams.colorShift = scroll.phase * 360;
            
            // INTENSITY PULSING
            visualizer.roleParams.intensity = 0.5 + Math.sin(scroll.phase * Math.PI * 4) * 0.5;
          }
        });
      });
    }
  }
  
  createFluidOverlay(section, bgData) {
    const overlay = document.createElement('div');
    overlay.className = 'fluid-overlay';
    overlay.style.cssText = `
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      pointer-events: none;
      z-index: 1;
      background: radial-gradient(
        ellipse at var(--mouse-x, 50%) var(--mouse-y, 50%),
        rgba(0, 255, 255, 0.1) 0%,
        rgba(255, 0, 255, 0.05) 40%,
        transparent 70%
      );
      animation: fluidPulse 4s ease-in-out infinite;
    `;
    
    section.appendChild(overlay);
    
    // Update overlay based on scroll
    const updateOverlay = () => {
      const scroll = this.masterScrollState;
      const intensity = scroll.momentum * 0.01;
      const hue = scroll.phase * 360;
      
      overlay.style.background = `
        radial-gradient(
          ellipse at ${50 + Math.sin(scroll.phase * Math.PI) * 20}% ${50 + Math.cos(scroll.phase * Math.PI) * 20}%,
          hsla(${hue}, 80%, 60%, ${intensity}) 0%,
          hsla(${(hue + 120) % 360}, 70%, 50%, ${intensity * 0.5}) 40%,
          transparent 70%
        )
      `;
      
      requestAnimationFrame(updateOverlay);
    };
    updateOverlay();
  }
  
  determineActiveScene(normalizedScroll) {
    for (let i = 0; i < this.scenes.length; i++) {
      const scene = this.scenes[i];
      if (normalizedScroll >= scene.start && normalizedScroll <= scene.end) {
        return i;
      }
    }
    return 0;
  }
  
  calculateSectionPhase(normalizedScroll) {
    const activeScene = this.scenes[this.determineActiveScene(normalizedScroll)];
    if (!activeScene) return 0;
    
    const sceneProgress = (normalizedScroll - activeScene.start) / (activeScene.end - activeScene.start);
    return Math.max(0, Math.min(1, sceneProgress));
  }
  
  calculateTransitionProgress(normalizedScroll) {
    const activeScene = this.determineActiveScene(normalizedScroll);
    const scene = this.scenes[activeScene];
    
    const progressInScene = this.calculateSectionPhase(normalizedScroll);
    
    // Transition intensity at scene boundaries
    if (progressInScene < 0.1) return progressInScene * 10; // Entering
    if (progressInScene > 0.9) return (1 - progressInScene) * 10; // Exiting
    return 0;
  }
  
  triggerSceneTransition(newScene, oldScene) {
    console.log(`🎬 SCENE TRANSITION: ${this.scenes[oldScene]?.name} → ${this.scenes[newScene]?.name}`);
    
    // MASSIVE scene transition effects
    const transitionType = this.scenes[newScene]?.type || 'default';
    
    switch(transitionType) {
      case 'emergence':
        this.triggerEmergenceTransition();
        break;
      case 'transformation':
        this.triggerTransformationTransition();
        break;
      case 'descent':
        this.triggerDescentTransition();
        break;
      case 'spiral':
        this.triggerSpiralTransition();
        break;
      case 'ascent':
        this.triggerAscentTransition();
        break;
      case 'convergence':
        this.triggerConvergenceTransition();
        break;
    }
  }
  
  triggerEmergenceTransition() {
    // Cards emerge from deep space
    this.elements.cards.forEach((cardData) => {
      const card = cardData.element;
      card.style.animation = 'emerge 2s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    });
  }
  
  triggerTransformationTransition() {
    // Massive geometry transformation wave
    this.elements.cards.forEach((cardData, index) => {
      setTimeout(() => {
        // Trigger geometry jump
        if (window.cardSystemController) {
          const visualizers = window.cardSystemController.cards.get(cardData.element.id)?.visualizers;
          if (visualizers) {
            visualizers.forEach(viz => {
              viz.currentGeometry = Math.floor(Math.random() * 8);
            });
          }
        }
      }, index * 100);
    });
  }
  
  triggerDescentTransition() {
    // Cards descend in cascade
    this.elements.cards.forEach((cardData, index) => {
      const card = cardData.element;
      card.style.animation = `descent ${1 + index * 0.1}s ease-out`;
    });
  }
  
  triggerSpiralTransition() {
    // Spiral movement
    this.elements.cards.forEach((cardData, index) => {
      const card = cardData.element;
      const angle = index * 60;
      card.style.animation = `spiral-${angle} 3s ease-in-out`;
    });
  }
  
  triggerAscentTransition() {
    // Upward floating motion
    this.elements.cards.forEach((cardData) => {
      const card = cardData.element;
      card.style.animation = 'ascent 2s ease-in-out';
    });
  }
  
  triggerConvergenceTransition() {
    // All elements converge to center then explode
    this.elements.cards.forEach((cardData) => {
      const card = cardData.element;
      card.style.animation = 'convergence 3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    });
  }
  
  updateParticles(scroll) {
    // Generate particles based on scroll velocity
    if (scroll.momentum > 10) {
      this.generateScrollParticles(scroll.momentum);
    }
  }
  
  generateScrollParticles(intensity) {
    for (let i = 0; i < intensity * 0.1; i++) {
      const particle = document.createElement('div');
      particle.className = 'scroll-particle';
      particle.style.cssText = `
        position: fixed;
        width: ${2 + Math.random() * 4}px;
        height: ${2 + Math.random() * 4}px;
        background: hsl(${Math.random() * 360}, 70%, 60%);
        border-radius: 50%;
        left: ${Math.random() * window.innerWidth}px;
        top: ${Math.random() * window.innerHeight}px;
        pointer-events: none;
        z-index: 9999;
        animation: particleLife 1s ease-out forwards;
      `;
      
      document.body.appendChild(particle);
      
      setTimeout(() => particle.remove(), 1000);
    }
  }
  
  startCinematicLoop() {
    const loop = () => {
      // Continuous updates even without scroll
      this.updateFluidDynamics();
      
      // Smooth interpolation of all transforms
      this.elements.cards.forEach((cardData) => {
        // Smooth lerp all transforms
        cardData.currentTransform.x += (cardData.targetTransform.x - cardData.currentTransform.x) * 0.1;
        cardData.currentTransform.y += (cardData.targetTransform.y - cardData.currentTransform.y) * 0.1;
        cardData.currentTransform.z += (cardData.targetTransform.z - cardData.currentTransform.z) * 0.1;
        cardData.geometry += (cardData.targetGeometry - cardData.geometry) * 0.05;
      });
      
      requestAnimationFrame(loop);
    };
    
    loop();
  }
}

// Add cinematic keyframes
const cinematicCSS = `
<style>
@keyframes emerge {
  from {
    transform: translateZ(-1000px) scale(0) rotateY(-180deg);
    opacity: 0;
  }
  to {
    transform: translateZ(0) scale(1) rotateY(0);
    opacity: 1;
  }
}

@keyframes descent {
  from {
    transform: translateY(-200vh) rotateX(90deg);
  }
  to {
    transform: translateY(0) rotateX(0);
  }
}

@keyframes ascent {
  0% {
    transform: translateY(0) rotateZ(0);
  }
  50% {
    transform: translateY(-100px) rotateZ(180deg);
  }
  100% {
    transform: translateY(0) rotateZ(360deg);
  }
}

@keyframes convergence {
  0% {
    transform: translateX(0) translateY(0) scale(1);
  }
  50% {
    transform: translateX(-50vw) translateY(-50vh) scale(0.1);
  }
  100% {
    transform: translateX(0) translateY(0) scale(1.2);
  }
}

@keyframes fluidPulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
}

@keyframes particleLife {
  0% {
    opacity: 1;
    transform: scale(0) translateY(0);
  }
  100% {
    opacity: 0;
    transform: scale(2) translateY(-100px);
  }
}

/* Spiral animations */
@keyframes spiral-0 {
  0% { transform: rotate(0deg) translateX(0px) rotate(0deg); }
  100% { transform: rotate(360deg) translateX(200px) rotate(-360deg); }
}

@keyframes spiral-60 {
  0% { transform: rotate(60deg) translateX(0px) rotate(-60deg); }
  100% { transform: rotate(420deg) translateX(200px) rotate(-420deg); }
}

@keyframes spiral-120 {
  0% { transform: rotate(120deg) translateX(0px) rotate(-120deg); }
  100% { transform: rotate(480deg) translateX(200px) rotate(-480deg); }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', cinematicCSS);

// DISABLED: Causing page bending and swinging issues
// Initialize the MASTER system
// window.addEventListener('DOMContentLoaded', () => {
//   setTimeout(() => {
//     window.scrollMaster = new UnifiedScrollMasterController();
//   }, 2000);
// });

console.log('🚫 UNIFIED SCROLL MASTER CONTROLLER - DISABLED to prevent page bending');