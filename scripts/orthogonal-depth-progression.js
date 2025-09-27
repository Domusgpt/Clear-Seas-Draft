import DeviceTiltHandler from '../js/interactions/device-tilt.js';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const toNumber = (value, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const parseColor = (value, fallback = [0, 0, 0, 1]) => {
  if (!value || typeof value !== 'string') {
    return [...fallback];
  }
  const trimmed = value.trim();
  if (trimmed.startsWith('rgba')) {
    const parts = trimmed
      .replace(/rgba\(|\)/g, '')
      .split(',')
      .map((part) => Number(part.trim()));
    if (parts.length === 4 && parts.every((part) => Number.isFinite(part))) {
      return [parts[0], parts[1], parts[2], parts[3]];
    }
  }
  if (trimmed.startsWith('rgb')) {
    const parts = trimmed
      .replace(/rgb\(|\)/g, '')
      .split(',')
      .map((part) => Number(part.trim()));
    if (parts.length === 3 && parts.every((part) => Number.isFinite(part))) {
      return [parts[0], parts[1], parts[2], 1];
    }
  }
  if (trimmed.startsWith('#')) {
    const hex = trimmed.slice(1);
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      if ([r, g, b].every((part) => Number.isFinite(part))) {
        return [r, g, b, 1];
      }
    }
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      if ([r, g, b].every((part) => Number.isFinite(part))) {
        return [r, g, b, 1];
      }
    }
  }
  return [...fallback];
};

const mix = (current, target, factor) => current + (target - current) * factor;

const mixColor = (current, target, factor) => {
  for (let i = 0; i < 4; i += 1) {
    current[i] = mix(current[i], target[i], factor);
  }
  return current;
};

const colorToString = (color) => {
  const [r, g, b, a] = color;
  return `rgba(${r.toFixed(1)}, ${g.toFixed(1)}, ${b.toFixed(1)}, ${a.toFixed(3)})`;
};

class HolographicBackground {
  constructor(canvas) {
    this.canvas = canvas || null;
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.dpr = window.devicePixelRatio || 1;
    this.width = 0;
    this.height = 0;
    this.time = 0;
    this.tiltState = { tiltX: 0, tiltY: 0, intensity: 0 };
    this.burstLevel = 0;
    this.foldPulse = 0;

    this.currentProfile = {
      density: 0.7,
      speed: 0.6,
      geometry: 'lattice',
      state: 'emerge'
    };

    this.targetProfile = { ...this.currentProfile };

    this.currentColors = {
      primary: parseColor('#020617'),
      secondary: parseColor('#0b193c'),
      glow: parseColor('rgba(0, 255, 255, 0.12)'),
      grid: parseColor('rgba(111, 255, 255, 0.18)')
    };

    this.targetColors = {
      primary: [...this.currentColors.primary],
      secondary: [...this.currentColors.secondary],
      glow: [...this.currentColors.glow],
      grid: [...this.currentColors.grid]
    };

    if (this.canvas && this.ctx) {
      this.resize = this.resize.bind(this);
      this.render = this.render.bind(this);
      this.resize();
      window.addEventListener('resize', this.resize);
      requestAnimationFrame(this.render);
    }
  }

  resize() {
    if (!this.canvas || !this.ctx) {
      return;
    }
    const { clientWidth, clientHeight } = this.canvas;
    this.width = clientWidth;
    this.height = clientHeight;
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.max(1, Math.floor(clientWidth * this.dpr));
    this.canvas.height = Math.max(1, Math.floor(clientHeight * this.dpr));
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  setProfile(profile = {}) {
    if (!profile) {
      return;
    }
    this.targetProfile = {
      density: clamp(toNumber(profile.density, this.currentProfile.density), 0.2, 1.2),
      speed: clamp(toNumber(profile.speed, this.currentProfile.speed), 0.15, 2.5),
      geometry: profile.geometry || this.currentProfile.geometry,
      state: profile.state || this.currentProfile.state
    };

    if (profile.primary) {
      this.targetColors.primary = parseColor(profile.primary, this.targetColors.primary);
    }
    if (profile.secondary) {
      this.targetColors.secondary = parseColor(profile.secondary, this.targetColors.secondary);
    }
    if (profile.glow) {
      this.targetColors.glow = parseColor(profile.glow, this.targetColors.glow);
    }
    if (profile.gridColor) {
      this.targetColors.grid = parseColor(profile.gridColor, this.targetColors.grid);
    } else if (profile.glow) {
      // Derive grid color from glow if provided
      const derived = parseColor(profile.glow, this.targetColors.grid);
      this.targetColors.grid = [derived[0], derived[1], derived[2], clamp(derived[3] * 1.6, 0.05, 0.65)];
    }
  }

  updateTilt({ tiltX = 0, tiltY = 0, intensity = 0 }) {
    this.tiltState = {
      tiltX: clamp(tiltX, -1.2, 1.2),
      tiltY: clamp(tiltY, -1.2, 1.2),
      intensity: clamp(intensity, 0, 2.5)
    };
  }

  pushBurst(amount = 0.4) {
    this.burstLevel = Math.min(1.6, this.burstLevel + amount);
  }

  triggerHypercubeFold() {
    this.foldPulse = 1;
    this.pushBurst(0.9);
  }

  render() {
    if (!this.ctx) {
      return;
    }

    this.time += 0.016 * (0.7 + this.currentProfile.speed * 0.4);

    const easing = 0.08;
    this.currentProfile.density = mix(this.currentProfile.density, this.targetProfile.density, easing);
    this.currentProfile.speed = mix(this.currentProfile.speed, this.targetProfile.speed, easing);
    this.currentProfile.geometry = this.targetProfile.geometry;
    this.currentProfile.state = this.targetProfile.state;

    mixColor(this.currentColors.primary, this.targetColors.primary, easing);
    mixColor(this.currentColors.secondary, this.targetColors.secondary, easing);
    mixColor(this.currentColors.glow, this.targetColors.glow, easing * 0.75);
    mixColor(this.currentColors.grid, this.targetColors.grid, easing * 0.9);

    this.burstLevel *= 0.92;
    this.foldPulse *= 0.9;

    const ctx = this.ctx;
    ctx.save();
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.width, this.height);

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, colorToString(this.currentColors.primary));
    gradient.addColorStop(1, colorToString(this.currentColors.secondary));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);

    // Radial glow reacting to tilt
    const glowColor = [...this.currentColors.glow];
    const glowIntensity = clamp(0.18 + this.tiltState.intensity * 0.35 + this.burstLevel * 0.4, 0.1, 0.9);
    glowColor[3] = clamp(glowColor[3] * glowIntensity, 0.04, 0.9);
    const glowGradient = ctx.createRadialGradient(
      this.width / 2 + this.tiltState.tiltX * 160,
      this.height * 0.38 - this.tiltState.tiltY * 190,
      this.width * 0.05,
      this.width / 2,
      this.height * 0.45,
      this.width * 0.7
    );
    glowGradient.addColorStop(0, colorToString(glowColor));
    glowGradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = glowGradient;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.globalCompositeOperation = 'source-over';

    // Dynamic grid / geometry layer
    const gridColor = [...this.currentColors.grid];
    const baseAlpha = clamp(0.06 + this.tiltState.intensity * 0.08 + this.burstLevel * 0.1, 0.04, 0.45);
    gridColor[3] = clamp(gridColor[3] * baseAlpha, 0.04, 0.45);
    ctx.strokeStyle = colorToString(gridColor);
    ctx.lineWidth = 1.2 + this.foldPulse * 1.2;

    const spacing = clamp(120 - this.currentProfile.density * 50, 48, 160);
    const diagonalOffset = (this.time * 60 + this.tiltState.tiltX * 80) % spacing;

    for (let x = -this.height; x < this.width + this.height; x += spacing) {
      const offsetX = x + diagonalOffset;
      ctx.beginPath();
      ctx.moveTo(offsetX - this.height, this.height + 40);
      ctx.lineTo(offsetX + this.height, -40);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(this.width / 2, this.height / 2);
    ctx.rotate((this.tiltState.tiltX - this.tiltState.tiltY) * 0.25);
    const pulseBase = clamp(0.25 + this.currentProfile.speed * 0.18 + this.burstLevel * 0.25, 0.1, 0.85);
    const pulseColor = [...this.currentColors.glow];
    pulseColor[3] = clamp(pulseColor[3] * pulseBase, 0.05, 0.55);
    ctx.fillStyle = colorToString(pulseColor);

    const particleCount = Math.floor(40 + this.currentProfile.density * 48);
    for (let i = 0; i < particleCount; i += 1) {
      const angle = (i / particleCount) * Math.PI * 2 + this.time * 0.6;
      const radius = (Math.sin(this.time * 0.9 + i * 0.3) * 0.5 + 0.5) * (this.width * 0.25);
      const x = Math.cos(angle) * radius * (1 + this.tiltState.tiltX * 0.15);
      const y = Math.sin(angle) * radius * (1 + this.tiltState.tiltY * 0.15);
      const size = 3 + Math.sin(angle * 2 + this.time * 0.6) * 2 + this.foldPulse * 4;
      ctx.beginPath();
      ctx.ellipse(x, y, size, size * 0.6, angle, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    ctx.restore();

    requestAnimationFrame(this.render);
  }
}

class TiltIndicator {
  constructor(element) {
    this.element = element || null;
    this.xNode = this.element ? this.element.querySelector('#tilt-x') : null;
    this.yNode = this.element ? this.element.querySelector('#tilt-y') : null;
    this.modeNode = this.element ? this.element.querySelector('#rot4d') : null;
    this.mode = 'pointer';
  }

  setMode(mode) {
    this.mode = mode;
    if (this.element) {
      this.element.dataset.mode = mode;
    }
    if (this.modeNode) {
      this.modeNode.textContent = mode === 'dramatic' ? 'Dramatic' : mode === 'device' ? 'Device' : 'Pointer';
    }
  }

  update({ tiltX = 0, tiltY = 0, source = this.mode, extreme = false } = {}) {
    if (source && source !== this.mode) {
      this.setMode(source);
    }
    if (this.xNode) {
      this.xNode.textContent = (tiltX * 45).toFixed(1);
    }
    if (this.yNode) {
      this.yNode.textContent = (tiltY * 45).toFixed(1);
    }
    if (this.element) {
      this.element.classList.toggle('extreme', !!extreme);
    }
  }
}

class SectionChoreographer {
  constructor({ background, container } = {}) {
    this.background = background || null;
    this.container = container || null;
    this.activeCard = null;
  }

  registerCards(cards = []) {
    cards.forEach((card) => {
      if (!card) return;
      if (card.dataset.titleFrom) {
        card.style.setProperty('--section-title-from', card.dataset.titleFrom);
      }
      if (card.dataset.titleTo) {
        card.style.setProperty('--section-title-to', card.dataset.titleTo);
      }
    });
  }

  activate(card) {
    if (!card) {
      return;
    }
    this.activeCard = card;
    const root = document.documentElement;

    if (card.dataset.titleFrom) {
      root.style.setProperty('--section-title-from', card.dataset.titleFrom);
    }
    if (card.dataset.titleTo) {
      root.style.setProperty('--section-title-to', card.dataset.titleTo);
    }
    if (card.dataset.bgPrimary) {
      root.style.setProperty('--visualizer-bg-primary', card.dataset.bgPrimary);
    }
    if (card.dataset.bgSecondary) {
      root.style.setProperty('--visualizer-bg-secondary', card.dataset.bgSecondary);
    }
    if (card.dataset.bgGlow) {
      root.style.setProperty('--visualizer-bg-glow', card.dataset.bgGlow);
      root.style.setProperty('--visualizer-pulse-color', card.dataset.bgGlow);
      root.style.setProperty('--visualizer-grid-color', card.dataset.bgGlow);
    }
    card.dataset.visualizerActive = 'true';
    card.style.removeProperty('--card-visibility');

    if (this.background) {
      this.background.setProfile({
        primary: card.dataset.bgPrimary,
        secondary: card.dataset.bgSecondary,
        glow: card.dataset.bgGlow,
        density: card.dataset.visualizerDensity,
        speed: card.dataset.visualizerSpeed,
        geometry: card.dataset.visualizerGeometry,
        state: card.dataset.visualizerState
      });
    }
  }

  deactivate(card) {
    if (card) {
      card.dataset.visualizerActive = 'false';
      card.style.removeProperty('--card-visibility');
    }
  }

  updateTilt(payload = {}) {
    const { tiltX = 0, tiltY = 0, intensity = 0 } = payload;
    const root = document.documentElement;
    root.style.setProperty('--global-tilt-x', tiltX.toFixed(4));
    root.style.setProperty('--global-tilt-y', tiltY.toFixed(4));
    root.style.setProperty('--global-tilt-strength', intensity.toFixed(3));

    if (this.activeCard) {
      this.activeCard.style.setProperty('--card-tilt-x', tiltX);
      this.activeCard.style.setProperty('--card-tilt-y', tiltY);
    }

    if (this.background) {
      this.background.updateTilt(payload);
    }
  }

  pulseExit(card) {
    if (this.background) {
      this.background.pushBurst(0.35);
    }
    if (card) {
      card.style.setProperty('--card-visibility', '0.45');
    }
  }

  triggerHypercubeFold(nextCard, onComplete) {
    if (this.container) {
      this.container.classList.add('hypercube-folding');
    }
    if (this.background) {
      this.background.triggerHypercubeFold();
    }
    setTimeout(() => {
      if (this.container) {
        this.container.classList.remove('hypercube-folding');
      }
      if (typeof onComplete === 'function') {
        onComplete();
      }
      if (nextCard) {
        this.activate(nextCard);
      }
    }, 1400);
  }
}

class PointerTiltController {
  constructor({ onUpdate, indicator } = {}) {
    this.onUpdate = typeof onUpdate === 'function' ? onUpdate : null;
    this.indicator = indicator || null;
    this.enabled = false;

    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerLeave = this.handlePointerLeave.bind(this);
  }

  enable() {
    if (this.enabled) {
      return;
    }
    this.enabled = true;
    window.addEventListener('pointermove', this.handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', this.handlePointerLeave, { passive: true });
    if (this.indicator) {
      this.indicator.setMode('pointer');
      this.indicator.update({ tiltX: 0, tiltY: 0, source: 'pointer', extreme: false });
    }
  }

  disable() {
    if (!this.enabled) {
      return;
    }
    this.enabled = false;
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointerleave', this.handlePointerLeave);
  }

  handlePointerMove(event) {
    if (!this.enabled) {
      return;
    }
    const { innerWidth, innerHeight } = window;
    const x = (event.clientX / innerWidth - 0.5) * 1.4;
    const y = (event.clientY / innerHeight - 0.5) * 1.4;
    const tiltX = clamp(x, -0.9, 0.9);
    const tiltY = clamp(-y, -0.9, 0.9);
    const intensity = clamp(Math.sqrt(tiltX * tiltX + tiltY * tiltY) * 1.1, 0, 1.5);

    if (this.onUpdate) {
      this.onUpdate({ tiltX, tiltY, intensity, source: 'pointer', extreme: intensity > 1.05 });
    }
  }

  handlePointerLeave() {
    if (this.onUpdate) {
      this.onUpdate({ tiltX: 0, tiltY: 0, intensity: 0, source: 'pointer', extreme: false });
    }
  }
}

class TiltVisualizerAdapter extends DeviceTiltHandler {
  constructor({ onUpdate, indicator } = {}) {
    super();
    this.onUpdate = typeof onUpdate === 'function' ? onUpdate : null;
    this.indicator = indicator || null;
  }

  showTiltIndicator() {
    // Override default indicator injection
  }

  updateTiltDisplay() {
    const tiltX = clamp(this.smoothedRotation.rot4dYW / Math.PI, -0.85, 0.85);
    const tiltY = clamp(this.smoothedRotation.rot4dXW / Math.PI, -0.85, 0.85);
    const payload = {
      tiltX,
      tiltY,
      intensity: this.tiltIntensity,
      rotation: { ...this.smoothedRotation },
      source: this.dramaticMode ? 'dramatic' : 'device',
      extreme: this.extremeTilt
    };

    if (this.indicator) {
      this.indicator.update(payload);
    }
    if (this.onUpdate) {
      this.onUpdate(payload);
    }
  }
}

class OrthogonalDepthProgression {
  constructor(options = {}) {
    this.container = options.container || document.querySelector('.depth-progression-container');
    this.cards = [];
    this.currentIndex = 0;
    this.isAutoProgressing = false;
    this.autoProgressInterval = null;
    this.progressionStates = ['far-depth', 'approaching', 'focused', 'exiting', 'destroyed'];

    this.timings = {
      cardTransition: 800,
      autoProgressDelay: 4200,
      destructionDelay: 1300,
      portalActivation: 320
    };

    this.scrollAccumulator = 0;
    this.scrollThreshold = 100;
    this.isScrollProgression = true;

    this.background = new HolographicBackground(options.backgroundCanvas);
    this.indicator = new TiltIndicator(options.tiltIndicator);
    this.sectionChoreographer = new SectionChoreographer({
      background: this.background,
      container: this.container
    });

    this.tiltAdapter = new TiltVisualizerAdapter({
      onUpdate: (payload) => this.sectionChoreographer.updateTilt(payload),
      indicator: this.indicator
    });
    this.pointerTilt = new PointerTiltController({
      onUpdate: (payload) => this.sectionChoreographer.updateTilt(payload),
      indicator: this.indicator
    });

    this.init();
  }

  init() {
    console.log('🎯 Initializing Orthogonal Depth Progression System...');

    this.findProgressionCards();
    this.sectionChoreographer.registerCards(this.cards);
    this.setupScrollProgression();
    this.setupKeyboardControls();
    this.initializePortalVisualizers();
    this.setInitialPositions();
    this.setupTiltControllers();

    console.log('✅ Orthogonal Depth Progression initialized - immersive visualizer mode');
  }

  setupTiltControllers() {
    this.pointerTilt.enable();
    if (this.indicator) {
      this.indicator.setMode('pointer');
    }

    setTimeout(() => {
      this.tiltAdapter.enable().then((enabled) => {
        if (enabled) {
          this.pointerTilt.disable();
          this.indicator?.setMode(this.tiltAdapter.dramaticMode ? 'dramatic' : 'device');
        }
      }).catch(() => {
        this.pointerTilt.enable();
      });
    }, 400);
  }

  findProgressionCards() {
    if (!this.container) {
      this.cards = [];
      return;
    }
    this.cards = Array.from(this.container.querySelectorAll('.progression-card'));
    console.log(`🎨 Found ${this.cards.length} progression cards`);
  }

  setupScrollProgression() {
    let scrollTimeout;

    window.addEventListener('wheel', (event) => {
      event.preventDefault();
      this.scrollAccumulator += event.deltaY;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.handleScrollProgression();
      }, 60);
    }, { passive: false });

    this.setupTouchProgression();
  }

  setupTouchProgression() {
    let startY = 0;
    let currentY = 0;

    document.addEventListener('touchstart', (event) => {
      startY = event.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchmove', (event) => {
      event.preventDefault();
      currentY = event.touches[0].clientY;
      const deltaY = startY - currentY;

      if (Math.abs(deltaY) > 32) {
        if (deltaY > 0) {
          this.nextCard();
        } else {
          this.previousCard();
        }
        startY = currentY;
      }
    }, { passive: false });
  }

  handleScrollProgression() {
    if (Math.abs(this.scrollAccumulator) > this.scrollThreshold) {
      if (this.scrollAccumulator > 0) {
        this.nextCard();
      } else {
        this.previousCard();
      }
      this.scrollAccumulator = 0;
    } else {
      this.scrollAccumulator *= 0.9;
    }
  }

  setupKeyboardControls() {
    document.addEventListener('keydown', (event) => {
      switch (event.code) {
        case 'ArrowDown':
        case 'Space':
          event.preventDefault();
          this.nextCard();
          break;
        case 'ArrowUp':
          event.preventDefault();
          this.previousCard();
          break;
        case 'Home':
          event.preventDefault();
          this.goToCard(0);
          break;
        case 'End':
          event.preventDefault();
          this.goToCard(this.cards.length - 1);
          break;
        default:
          break;
      }
    });
  }

  initializePortalVisualizers() {
    this.cards.forEach((card, index) => {
      const portalElement = card.querySelector('.portal-text-visualizer');
      if (portalElement) {
        this.createPortalVisualizer(portalElement, card.dataset.vib34d, index);
      }
    });
  }

  createPortalVisualizer(portalElement, systemType, cardIndex) {
    const canvas = document.createElement('canvas');
    canvas.className = 'portal-canvas';
    canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: inherit;
      pointer-events: none;
    `;

    portalElement.appendChild(canvas);
    const portalVisualizer = new PortalTextVisualizer(canvas, systemType, cardIndex);
    portalElement.portalVisualizer = portalVisualizer;
  }

  setInitialPositions() {
    this.cards.forEach((card, index) => {
      card.style.zIndex = this.cards.length - index;
      if (index === 0) {
        this.setCardState(card, 'focused');
      } else {
        this.setCardState(card, 'far-depth');
      }
    });

    if (this.cards[0]) {
      this.activatePortalForCard(this.cards[0]);
      this.sectionChoreographer.activate(this.cards[0]);
    }
  }

  nextCard() {
    if (this.currentIndex >= this.cards.length - 1) {
      const currentCard = this.cards[this.currentIndex];
      this.destroyCurrentCard(() => {
        const nextCard = this.cards[0];
        this.sectionChoreographer.triggerHypercubeFold(nextCard, () => {
          this.currentIndex = 0;
          this.progressToCurrentCard();
        });
      }, currentCard);
      return;
    }
    this.progressToCard(this.currentIndex + 1);
  }

  previousCard() {
    if (this.currentIndex <= 0) {
      this.currentIndex = this.cards.length - 1;
    } else {
      this.currentIndex -= 1;
    }
    this.progressToCurrentCard();
  }

  goToCard(index) {
    if (index >= 0 && index < this.cards.length && index !== this.currentIndex) {
      this.currentIndex = index;
      this.progressToCurrentCard();
    }
  }

  progressToCard(newIndex) {
    const currentCard = this.cards[this.currentIndex];
    const newCard = this.cards[newIndex];

    if (!currentCard || !newCard) {
      return;
    }

    this.deactivatePortalForCard(currentCard);
    this.sectionChoreographer.deactivate(currentCard);
    this.sectionChoreographer.pulseExit(currentCard);
    this.setCardState(currentCard, 'exiting');

    setTimeout(() => {
      this.setCardState(newCard, 'approaching');
      setTimeout(() => {
        this.setCardState(newCard, 'focused');
        this.currentIndex = newIndex;
        this.activatePortalForCard(newCard);
        this.sectionChoreographer.activate(newCard);
        setTimeout(() => {
          this.setCardState(currentCard, 'far-depth');
        }, this.timings.cardTransition);
      }, this.timings.cardTransition / 2);
    }, this.timings.cardTransition / 4);
  }

  progressToCurrentCard() {
    this.cards.forEach((card, index) => {
      if (index === this.currentIndex) {
        this.setCardState(card, 'focused');
        this.activatePortalForCard(card);
        this.sectionChoreographer.activate(card);
      } else {
        this.setCardState(card, 'far-depth');
        this.deactivatePortalForCard(card);
        this.sectionChoreographer.deactivate(card);
      }
    });
  }

  setCardState(card, state) {
    if (!card) {
      return;
    }
    this.progressionStates.forEach((s) => card.classList.remove(s));
    card.classList.add(state);
    card.dataset.progressionState = state;

    switch (state) {
      case 'focused':
        card.style.zIndex = 1000;
        break;
      case 'approaching':
        card.style.zIndex = 900;
        break;
      case 'exiting':
        card.style.zIndex = 800;
        break;
      case 'far-depth':
        card.style.zIndex = 100;
        break;
      case 'destroyed':
        card.style.zIndex = 50;
        break;
      default:
        break;
    }
  }

  activatePortalForCard(card) {
    const portal = card?.querySelector('.portal-text-visualizer');
    if (portal && portal.portalVisualizer) {
      portal.portalVisualizer.activate();
    }
  }

  deactivatePortalForCard(card) {
    const portal = card?.querySelector('.portal-text-visualizer');
    if (portal && portal.portalVisualizer) {
      portal.portalVisualizer.deactivate();
    }
  }

  destroyCurrentCard(callback, currentCard) {
    const card = currentCard || this.cards[this.currentIndex];
    if (!card) {
      if (typeof callback === 'function') {
        callback();
      }
      return;
    }

    const destructionType = card.dataset.destruction || 'quantum';
    this.setCardState(card, 'destroyed');
    card.classList.add(`destruction-${destructionType}`);
    this.deactivatePortalForCard(card);

    setTimeout(() => {
      card.classList.remove(`destruction-${destructionType}`);
      this.setCardState(card, 'far-depth');
      if (typeof callback === 'function') {
        callback();
      }
    }, this.timings.destructionDelay);
  }

  toggleAutoProgress() {
    if (this.isAutoProgressing) {
      this.stopAutoProgress();
    } else {
      this.startAutoProgress();
    }
  }

  startAutoProgress() {
    this.isAutoProgressing = true;
    this.autoProgressInterval = setInterval(() => {
      this.nextCard();
    }, this.timings.autoProgressDelay);
    console.log('▶️ Auto progression started');
  }

  stopAutoProgress() {
    this.isAutoProgressing = false;
    if (this.autoProgressInterval) {
      clearInterval(this.autoProgressInterval);
      this.autoProgressInterval = null;
    }
    console.log('⏸️ Auto progression stopped');
  }

  destroy() {
    this.stopAutoProgress();
    this.pointerTilt.disable();
    this.tiltAdapter.disable();

    this.cards.forEach((card) => {
      const portal = card.querySelector('.portal-text-visualizer');
      if (portal && portal.portalVisualizer) {
        portal.portalVisualizer.destroy();
      }
    });

    console.log('🗑️ Orthogonal Depth Progression destroyed');
  }
}

class PortalTextVisualizer {
  constructor(canvas, systemType, cardIndex) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.systemType = systemType;
    this.cardIndex = cardIndex;
    this.isActive = false;
    this.animationFrame = null;

    this.portalDepth = 0;
    this.targetDepth = 0;
    this.portalRotation = 0;
    this.portalPulse = 0;

    this.init();
  }

  init() {
    this.setupCanvas();
  }

  setupCanvas() {
    const resizeCanvas = () => {
      const rect = this.canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      this.context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(this.canvas);
  }

  activate() {
    this.isActive = true;
    this.targetDepth = 1.0;
    this.startRenderLoop();
  }

  deactivate() {
    this.isActive = false;
    this.targetDepth = 0;
    setTimeout(() => {
      this.stopRenderLoop();
    }, 500);
  }

  startRenderLoop() {
    if (this.animationFrame) return;

    const render = () => {
      this.update();
      this.renderPortal();

      if (this.isActive || this.portalDepth > 0.01) {
        this.animationFrame = requestAnimationFrame(render);
      } else {
        this.animationFrame = null;
      }
    };

    this.animationFrame = requestAnimationFrame(render);
  }

  stopRenderLoop() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  update() {
    this.portalDepth += (this.targetDepth - this.portalDepth) * 0.08;
    this.portalRotation += 0.02;
    this.portalPulse = Math.sin(Date.now() * 0.003) * 0.5 + 0.5;
  }

  renderPortal() {
    const ctx = this.context;
    const width = this.canvas.width / (window.devicePixelRatio || 1);
    const height = this.canvas.height / (window.devicePixelRatio || 1);

    ctx.clearRect(0, 0, width, height);

    if (this.portalDepth < 0.01) return;

    const centerX = width / 2;
    const centerY = height / 2;
    const intensity = this.portalDepth;

    switch (this.systemType) {
      case 'holographic':
        this.renderHolographicPortal(ctx, centerX, centerY, intensity);
        break;
      case 'faceted':
        this.renderFacetedPortal(ctx, centerX, centerY, intensity);
        break;
      case 'quantum':
      default:
        this.renderQuantumPortal(ctx, centerX, centerY, intensity);
        break;
    }
  }

  renderQuantumPortal(ctx, centerX, centerY, intensity) {
    const rings = 8;
    const maxRadius = Math.min(centerX, centerY) * 0.8;

    for (let i = 0; i < rings; i += 1) {
      const progress = i / rings;
      const radius = maxRadius * (1 - progress) * intensity;
      const alpha = intensity * (1 - progress) * this.portalPulse;

      if (alpha > 0.05) {
        ctx.strokeStyle = `hsla(280, 70%, ${60 + progress * 20}%, ${alpha})`;
        ctx.lineWidth = 2 + progress * 3;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 50 * intensity);
    gradient.addColorStop(0, `rgba(138, 43, 226, ${intensity * 0.5})`);
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, centerX * 2, centerY * 2);
  }

  renderHolographicPortal(ctx, centerX, centerY, intensity) {
    const layers = 6;
    const maxRadius = Math.min(centerX, centerY) * 0.9;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(this.portalRotation);

    for (let i = 0; i < layers; i += 1) {
      const progress = i / layers;
      const radius = maxRadius * (1 - progress * 0.8) * intensity;
      const alpha = intensity * (1 - progress) * 0.6;

      ctx.strokeStyle = `hsla(${330 + i * 15}, 80%, 70%, ${alpha})`;
      ctx.lineWidth = 1 + progress * 2;

      const sides = 8 + i * 2;
      ctx.beginPath();
      for (let j = 0; j <= sides; j += 1) {
        const angle = (j / sides) * Math.PI * 2;
        const x = Math.cos(angle) * radius * (1 + Math.sin(angle * 3) * 0.1);
        const y = Math.sin(angle) * radius * (1 + Math.cos(angle * 3) * 0.1);

        if (j === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    ctx.restore();
  }

  renderFacetedPortal(ctx, centerX, centerY, intensity) {
    const facets = 12;
    const maxRadius = Math.min(centerX, centerY) * 0.7;

    ctx.save();
    ctx.translate(centerX, centerY);

    for (let i = 0; i < facets; i += 1) {
      const angle = (i / facets) * Math.PI * 2 + this.portalRotation;
      const radius = maxRadius * intensity * (0.5 + this.portalPulse * 0.3);

      ctx.strokeStyle = `hsla(200, 70%, 60%, ${intensity * 0.8})`;
      ctx.fillStyle = `hsla(200, 70%, 60%, ${intensity * 0.2})`;
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius
      );
      ctx.lineTo(
        Math.cos(angle + Math.PI / facets) * radius,
        Math.sin(angle + Math.PI / facets) * radius
      );
      ctx.closePath();

      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  destroy() {
    this.stopRenderLoop();
    this.context = null;
  }
}

export default OrthogonalDepthProgression;

if (typeof window !== 'undefined') {
  window.OrthogonalDepthProgression = OrthogonalDepthProgression;
  window.PortalTextVisualizer = PortalTextVisualizer;
}
