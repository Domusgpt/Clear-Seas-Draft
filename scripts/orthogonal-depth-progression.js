function createResizeObserver(callback) {
  if (typeof window !== 'undefined' && typeof window.ResizeObserver === 'function') {
    return new window.ResizeObserver(callback);
  }
  return {
    observe() {},
    unobserve() {},
    disconnect() {},
  };
}

class SectionalOrthogonalProgression {
  constructor() {
    this.root = document.getElementById('orthogonalRoot');
    this.container = document.getElementById('depthContainer');
    this.sectionLabel = document.getElementById('sectionLabel');
    this.cardLabel = document.getElementById('cardLabel');
    this.sectionIndicator = document.getElementById('sectionIndicator');
    this.backgroundCanvas = document.getElementById('holographicBackground');

    this.sections = [];
    this.currentSectionIndex = 0;
    this.currentCardIndex = 0;
    this.isTransitioning = false;
    this.scrollAccumulator = 0;
    this.scrollTimeout = null;

    this.sectionPresets = this.createSectionPresets();

    this.background = this.backgroundCanvas
      ? new BackgroundVisualizer(this.backgroundCanvas, this.sectionPresets)
      : new NoopBackground();

    this.collectSections();
    this.buildSectionIndicator();
    this.applySectionTheme(this.sections[this.currentSectionIndex]);
    this.updateCardStates();

    this.bindEvents();
  }

  createSectionPresets() {
    return {
      genesis: {
        label: 'Holographic Genesis',
        accent: '#00f6ff',
        secondary: '#f400ff',
        tertiary: '#7c45ff',
        hue: 182,
        background: {
          geometry: 'lattice',
          baseDensity: 0.75,
          motion: 0.45,
          saturation: 1.2,
        },
        visualizer: {
          densityBias: 1,
          speedBias: 1,
          glitchBias: 0.15,
          colorShift: 0,
        },
      },
      'vector-wake': {
        label: 'Vector Wake',
        accent: '#7cf7ff',
        secondary: '#00ffb9',
        tertiary: '#0d8bff',
        hue: 204,
        background: {
          geometry: 'flux',
          baseDensity: 1.05,
          motion: 0.65,
          saturation: 1.45,
        },
        visualizer: {
          densityBias: 1.15,
          speedBias: 1.35,
          glitchBias: 0.26,
          colorShift: 32,
        },
      },
      'hypercube-resolve': {
        label: 'Hypercube Resolve',
        accent: '#ff8dfb',
        secondary: '#ffe66d',
        tertiary: '#64f9ff',
        hue: 318,
        background: {
          geometry: 'pulse',
          baseDensity: 0.9,
          motion: 0.85,
          saturation: 1.65,
        },
        visualizer: {
          densityBias: 0.92,
          speedBias: 1.6,
          glitchBias: 0.4,
          colorShift: 88,
        },
      },
    };
  }

  collectSections() {
    const sectionElements = Array.from(
      this.container.querySelectorAll('.progression-section'),
    );

    this.sections = sectionElements.map((element, sectionIndex) => {
      const key = element.dataset.section || `section-${sectionIndex}`;
      const config = this.sectionPresets[key] || this.createFallbackPreset(key, sectionIndex);
      const cards = Array.from(element.querySelectorAll('.progression-card')).map(
        (cardElement, cardIndex) =>
          new CardController(cardElement, {
            sectionIndex,
            cardIndex,
            sectionKey: key,
            sectionConfig: config,
          }),
      );

      const section = new SectionController(element, config, cards, sectionIndex);
      return section;
    });
  }

  createFallbackPreset(key, index) {
    const hue = (index * 97) % 360;
    return {
      label: key.replace(/[-_]/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase()),
      accent: `hsl(${hue}, 90%, 62%)`,
      secondary: `hsl(${(hue + 42) % 360}, 80%, 58%)`,
      tertiary: `hsl(${(hue + 210) % 360}, 72%, 56%)`,
      hue,
      background: {
        geometry: 'lattice',
        baseDensity: 1,
        motion: 0.55,
        saturation: 1.2,
      },
      visualizer: {
        densityBias: 1,
        speedBias: 1,
        glitchBias: 0.18,
        colorShift: hue,
      },
    };
  }

  buildSectionIndicator() {
    this.sectionIndicator.innerHTML = '';
    this.sections.forEach((section, index) => {
      const dot = document.createElement('span');
      dot.className = 'dot';
      if (index === this.currentSectionIndex) {
        dot.classList.add('is-active');
      }
      this.sectionIndicator.appendChild(dot);
      section.setIndicator(dot);
    });
    this.updateSectionIndicator();
  }

  bindEvents() {
    window.addEventListener(
      'wheel',
      (event) => {
        event.preventDefault();
        if (this.isTransitioning) {
          return;
        }
        this.scrollAccumulator += event.deltaY;
        clearTimeout(this.scrollTimeout);
        this.scrollTimeout = setTimeout(() => this.handleScrollProgression(), 80);
      },
      { passive: false },
    );

    window.addEventListener('keydown', (event) => {
      if (this.isTransitioning) {
        return;
      }
      if (event.code === 'ArrowDown' || event.code === 'Space' || event.code === 'PageDown') {
        event.preventDefault();
        this.advance();
      } else if (event.code === 'ArrowUp' || event.code === 'PageUp') {
        event.preventDefault();
        this.retreat();
      }
    });

    this.pointerHandler = this.handlePointerMove.bind(this);
    this.pointerLeaveHandler = this.handlePointerLeave.bind(this);
    window.addEventListener('pointermove', this.pointerHandler);
    window.addEventListener('pointerleave', this.pointerLeaveHandler);

    // Touch progression
    let touchStartY = null;
    window.addEventListener(
      'touchstart',
      (event) => {
        if (event.touches.length > 0) {
          touchStartY = event.touches[0].clientY;
        }
      },
      { passive: true },
    );

    window.addEventListener(
      'touchmove',
      (event) => {
        if (touchStartY == null || this.isTransitioning) {
          return;
        }
        const deltaY = touchStartY - event.touches[0].clientY;
        if (Math.abs(deltaY) > 28) {
          if (deltaY > 0) {
            this.advance();
          } else {
            this.retreat();
          }
          touchStartY = event.touches[0].clientY;
        }
        event.preventDefault();
      },
      { passive: false },
    );
  }

  handleScrollProgression() {
    const threshold = 88;
    if (Math.abs(this.scrollAccumulator) > threshold) {
      if (this.scrollAccumulator > 0) {
        this.advance();
      } else {
        this.retreat();
      }
    }
    this.scrollAccumulator = 0;
  }

  handlePointerMove(event) {
    const activeSection = this.sections[this.currentSectionIndex];
    const activeCard = activeSection.getCard(this.currentCardIndex);
    if (!activeCard) {
      return;
    }
    const centerX = window.innerWidth * 0.5;
    const centerY = window.innerHeight * 0.5;
    const strength = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--card-tilt-strength')) || 16;
    const tiltX = ((centerY - event.clientY) / centerY) * strength;
    const tiltY = ((event.clientX - centerX) / centerX) * strength;
    activeCard.setTilt(tiltX, tiltY);
    this.background.setPointer(event.clientX / window.innerWidth, event.clientY / window.innerHeight);
  }

  handlePointerLeave() {
    const activeSection = this.sections[this.currentSectionIndex];
    const activeCard = activeSection.getCard(this.currentCardIndex);
    if (activeCard) {
      activeCard.resetTilt();
    }
    this.background.setPointer(0.5, 0.5);
  }

  advance() {
    if (this.isTransitioning) {
      return;
    }
    const section = this.sections[this.currentSectionIndex];
    if (this.currentCardIndex < section.cardCount - 1) {
      this.currentCardIndex += 1;
      this.updateCardStates();
      return;
    }
    this.completeSectionForward();
  }

  retreat() {
    if (this.isTransitioning) {
      return;
    }
    if (this.currentCardIndex > 0) {
      this.currentCardIndex -= 1;
      this.updateCardStates();
      return;
    }
    this.completeSectionBackward();
  }

  completeSectionForward() {
    const nextSectionIndex = (this.currentSectionIndex + 1) % this.sections.length;
    this.triggerHypercubeFold(nextSectionIndex, 'forward');
  }

  completeSectionBackward() {
    const nextSectionIndex =
      (this.currentSectionIndex - 1 + this.sections.length) % this.sections.length;
    this.triggerHypercubeFold(nextSectionIndex, 'backward');
  }

  triggerHypercubeFold(nextSectionIndex, direction) {
    if (this.isTransitioning) {
      return;
    }

    const currentSection = this.sections[this.currentSectionIndex];
    currentSection.prepareForFold(direction);
    this.isTransitioning = true;
    this.root.classList.add('is-folding');

    const nextSection = this.sections[nextSectionIndex];
    this.background.prepareFold(nextSection.config, direction);

    setTimeout(() => {
      currentSection.deactivate();
      this.currentSectionIndex = nextSectionIndex;
      this.currentCardIndex = direction === 'backward' ? nextSection.cardCount - 1 : 0;
      nextSection.activate();
      this.applySectionTheme(nextSection);
      this.updateCardStates(true);
      this.root.classList.remove('is-folding');
      this.isTransitioning = false;
    }, 1020);
  }

  applySectionTheme(section) {
    if (!section) {
      return;
    }
    const config = section.config;
    const rootStyle = document.documentElement.style;
    rootStyle.setProperty('--section-accent', config.accent);
    rootStyle.setProperty('--section-secondary', config.secondary);
    rootStyle.setProperty('--section-tertiary', config.tertiary);
    this.sectionLabel.textContent = config.label;
    this.background.setSection(config);
    this.updateSectionIndicator();
  }

  updateSectionIndicator() {
    this.sections.forEach((section, index) => {
      section.updateIndicator(index === this.currentSectionIndex);
    });
  }

  updateCardStates(isAfterFold = false) {
    const section = this.sections[this.currentSectionIndex];
    const cards = section.cards;
    const activeIndex = this.currentCardIndex;

    cards.forEach((card, index) => {
      if (index === activeIndex) {
        card.setState('focused', section.config, {
          index,
          total: cards.length,
          sectionIndex: this.currentSectionIndex,
          direction: isAfterFold ? 'fold' : 'progress',
        });
      } else if (index === activeIndex - 1) {
        card.setState('exiting', section.config, {
          index,
          total: cards.length,
          sectionIndex: this.currentSectionIndex,
        });
      } else if (index < activeIndex - 1) {
        card.setState('destroyed', section.config, {
          index,
          total: cards.length,
          sectionIndex: this.currentSectionIndex,
        });
      } else if (index === activeIndex + 1) {
        card.setState('approaching', section.config, {
          index,
          total: cards.length,
          sectionIndex: this.currentSectionIndex,
        });
      } else {
        card.setState('far', section.config, {
          index,
          total: cards.length,
          sectionIndex: this.currentSectionIndex,
        });
      }
    });

    this.cardLabel.textContent = `Card ${activeIndex + 1} of ${cards.length}`;
  }
}

class SectionController {
  constructor(element, config, cards, index) {
    this.element = element;
    this.config = config;
    this.cards = cards;
    this.index = index;
    this.indicator = null;
    this.cardCount = cards.length;
    if (index === 0) {
      this.element.classList.add('is-active');
    }
  }

  setIndicator(element) {
    this.indicator = element;
  }

  updateIndicator(isActive) {
    if (this.indicator) {
      this.indicator.classList.toggle('is-active', Boolean(isActive));
    }
  }

  activate() {
    this.element.classList.add('is-active');
  }

  deactivate() {
    this.element.classList.remove('is-active');
  }

  prepareForFold(direction) {
    this.cards.forEach((card, index) => {
      const offset = direction === 'forward' ? index : this.cardCount - index;
      const delay = Math.min(360, offset * 90);
      card.prepareForFold(delay, direction);
    });
  }

  getCard(index) {
    return this.cards[index] || null;
  }
}

class CardController {
  constructor(element, context) {
    this.element = element;
    this.context = context;
    this.state = 'far';
    this.tiltX = 0;
    this.tiltY = 0;

    this.visualizer = new CardVisualizer(
      element.querySelector('.card-visualizer'),
      context.sectionConfig,
      element.dataset,
    );
    this.portal = new PortalVisualizer(
      element.querySelector('.portal-visualizer'),
      context.sectionConfig,
      element.dataset,
    );
  }

  setState(state, sectionConfig, meta) {
    if (this.state === state && state !== 'focused') {
      return;
    }
    this.state = state;
    this.applyStateClasses(state);
    this.visualizer.setPhase(state, sectionConfig, meta);
    this.portal.setPhase(state, sectionConfig, meta);
    if (state !== 'focused') {
      this.resetTilt();
    }
  }

  applyStateClasses(state) {
    const classMap = {
      far: [],
      approaching: ['is-approaching'],
      focused: ['is-focused'],
      exiting: ['is-exiting-forward'],
      destroyed: ['is-destroyed'],
    };
    this.element.style.transitionDelay = '';
    this.element.style.removeProperty('--depth-offset');
    this.element.style.removeProperty('--card-scale');
    this.element.classList.remove(
      'is-focused',
      'is-approaching',
      'is-exiting-forward',
      'is-destroyed',
    );
    const classes = classMap[state] || [];
    classes.forEach((cls) => this.element.classList.add(cls));
  }

  setTilt(xDeg, yDeg) {
    this.tiltX = xDeg;
    this.tiltY = yDeg;
    if (!this.element.classList.contains('is-focused')) {
      return;
    }
    this.element.style.setProperty('--tilt-x', `${xDeg}deg`);
    this.element.style.setProperty('--tilt-y', `${yDeg}deg`);
    this.visualizer.setTilt(xDeg, yDeg);
    this.portal.setTilt(xDeg, yDeg);
  }

  resetTilt() {
    this.tiltX = 0;
    this.tiltY = 0;
    this.element.style.setProperty('--tilt-x', '0deg');
    this.element.style.setProperty('--tilt-y', '0deg');
    this.visualizer.setTilt(0, 0);
    this.portal.setTilt(0, 0);
  }

  prepareForFold(delay, direction) {
    this.visualizer.prepareForFold(delay, direction);
    this.portal.prepareForFold(delay, direction);
    const offsetScale = direction === 'forward' ? 1 : -1;
    this.element.style.transitionDelay = `${delay}ms`;
    this.element.classList.add('is-exiting-forward');
    this.element.style.setProperty('--depth-offset', `${420 * offsetScale}px`);
  }
}

class CardVisualizer {
  constructor(container, sectionConfig, dataset) {
    this.container = container;
    this.dataset = dataset;
    this.sectionConfig = sectionConfig;
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);

    this.devicePixelRatio = window.devicePixelRatio || 1;

    this.baseDensity = parseFloat(dataset.density || '1');
    this.baseSpeed = parseFloat(dataset.speed || '1');
    this.phase = 'far';
    this.tilt = { x: 0, y: 0 };

    this.current = {
      density: this.baseDensity * 0.35,
      speed: this.baseSpeed * 0.6,
      glitch: 0.08,
      intensity: 0.2,
      hue: sectionConfig.hue,
      alpha: 0.3,
    };

    this.target = { ...this.current };

    this.resizeObserver = createResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.container);
    this.resize();

    this.animationFrame = null;
    this.render = this.render.bind(this);
    this.render();
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    const ratio = this.devicePixelRatio;
    this.canvas.width = Math.max(1, Math.floor(rect.width * ratio));
    this.canvas.height = Math.max(1, Math.floor(rect.height * ratio));
    if (this.context.resetTransform) {
      this.context.resetTransform();
    } else {
      this.context.setTransform(1, 0, 0, 1, 0, 0);
    }
    this.context.scale(ratio, ratio);
  }

  setPhase(phase, sectionConfig, meta = {}) {
    this.phase = phase;
    const modifiers = getPhaseModifiers(phase, sectionConfig, meta, this.baseDensity, this.baseSpeed);
    this.target = {
      density: modifiers.density,
      speed: modifiers.speed,
      glitch: modifiers.glitch,
      intensity: modifiers.intensity,
      hue: sectionConfig.hue + (sectionConfig.visualizer?.colorShift || 0),
      alpha: modifiers.alpha,
    };
  }

  setTilt(xDeg, yDeg) {
    this.tilt.x = xDeg;
    this.tilt.y = yDeg;
  }

  prepareForFold(delay, direction) {
    const foldIntensity = direction === 'forward' ? 1.4 : 1.1;
    this.target = {
      density: this.baseDensity * 0.2,
      speed: this.baseSpeed * 2.6 * foldIntensity,
      glitch: 0.55,
      intensity: 0.65,
      hue: this.sectionConfig.hue + (direction === 'forward' ? 64 : -48),
      alpha: 0.1,
    };
  }

  render() {
    this.animationFrame = requestAnimationFrame(this.render);
    const ctx = this.context;
    if (!ctx) {
      return;
    }

    const { width, height } = this.canvas;
    if (width === 0 || height === 0) {
      return;
    }

    const eased = 0.08;
    this.current.density += (this.target.density - this.current.density) * eased;
    this.current.speed += (this.target.speed - this.current.speed) * eased;
    this.current.glitch += (this.target.glitch - this.current.glitch) * eased;
    this.current.intensity += (this.target.intensity - this.current.intensity) * eased;
    this.current.hue += (this.target.hue - this.current.hue) * eased;
    this.current.alpha += (this.target.alpha - this.current.alpha) * eased;

    ctx.clearRect(0, 0, width, height);

    const time = performance.now() * 0.001 * this.current.speed;
    const density = Math.max(6, Math.floor(36 * this.current.density));
    const centerX = width / (2 * (window.devicePixelRatio || 1));
    const centerY = height / (2 * (window.devicePixelRatio || 1));
    const maxRadius = Math.min(centerX, centerY) * 0.92;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(((this.tilt.x - this.tilt.y) / 180) * Math.PI * 0.15);

    for (let i = 0; i < density; i += 1) {
      const progress = i / density;
      const radius = maxRadius * Math.pow(progress, 0.72);
      const angleOffset = progress * Math.PI * 6 + time * 1.6;
      const glitch = (Math.sin(time * 4.2 + i) + Math.cos(time * 3.1 + i * 1.2)) * this.current.glitch;
      const hue = (this.current.hue + progress * 120 + glitch * 120) % 360;
      const alpha = Math.max(0, this.current.alpha * (1 - progress * 0.85));

      ctx.beginPath();
      ctx.strokeStyle = `hsla(${hue}, 90%, ${60 + progress * 20}%, ${alpha})`;
      ctx.lineWidth = Math.max(0.6, 2.2 - progress * 1.8 + Math.abs(glitch) * 1.5);
      ctx.setLineDash([
        12 + Math.sin(time + i) * 4 * this.current.intensity,
        32 - Math.cos(time * 0.8 + i * 0.4) * 6 * this.current.glitch,
      ]);
      ctx.lineDashOffset = angleOffset * 8;
      ctx.arc(0, 0, radius + glitch * 24, 0, Math.PI * 2, false);
      ctx.stroke();
    }

    ctx.setLineDash([]);
    ctx.globalCompositeOperation = 'lighter';
    ctx.beginPath();
    ctx.fillStyle = `hsla(${(this.current.hue + 42) % 360}, 95%, 72%, ${this.current.alpha * 0.6})`;
    ctx.arc(0, 0, maxRadius * 0.16 + Math.sin(time * 2.4) * 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class PortalVisualizer {
  constructor(container, sectionConfig, dataset) {
    this.container = container;
    this.sectionConfig = sectionConfig;
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);

    this.devicePixelRatio = window.devicePixelRatio || 1;
    this.tilt = { x: 0, y: 0 };

    this.current = {
      halo: 0.2,
      flare: 0.12,
      jitter: 0.02,
      hue: sectionConfig.hue,
      alpha: 0.18,
    };
    this.target = { ...this.current };

    this.resizeObserver = createResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.container);
    this.resize();
    this.render = this.render.bind(this);
    this.render();
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    const ratio = this.devicePixelRatio;
    this.canvas.width = Math.max(1, Math.floor(rect.width * ratio));
    this.canvas.height = Math.max(1, Math.floor(rect.height * ratio));
    if (this.context.resetTransform) {
      this.context.resetTransform();
    } else {
      this.context.setTransform(1, 0, 0, 1, 0, 0);
    }
    this.context.scale(ratio, ratio);
  }

  setPhase(phase, sectionConfig) {
    const baseHue = sectionConfig.hue;
    switch (phase) {
      case 'focused':
        this.target = { halo: 1, flare: 0.95, jitter: 0.12, hue: baseHue, alpha: 0.65 };
        break;
      case 'approaching':
        this.target = { halo: 0.65, flare: 0.45, jitter: 0.08, hue: baseHue - 18, alpha: 0.48 };
        break;
      case 'exiting':
        this.target = { halo: 1.25, flare: 1.4, jitter: 0.22, hue: baseHue + 42, alpha: 0.72 };
        break;
      case 'destroyed':
        this.target = { halo: 0.1, flare: 0.05, jitter: 0.4, hue: baseHue + 84, alpha: 0.06 };
        break;
      default:
        this.target = { halo: 0.25, flare: 0.18, jitter: 0.04, hue: baseHue - 24, alpha: 0.2 };
    }
  }

  setTilt(xDeg, yDeg) {
    this.tilt = { x: xDeg, y: yDeg };
  }

  prepareForFold(delay, direction) {
    this.target = {
      halo: 1.5,
      flare: 1.8,
      jitter: 0.35,
      hue: this.sectionConfig.hue + (direction === 'forward' ? 96 : -96),
      alpha: 0.4,
    };
  }

  render() {
    requestAnimationFrame(this.render);
    const ctx = this.context;
    if (!ctx) {
      return;
    }
    const { width, height } = this.canvas;
    if (width === 0 || height === 0) {
      return;
    }

    const eased = 0.08;
    this.current.halo += (this.target.halo - this.current.halo) * eased;
    this.current.flare += (this.target.flare - this.current.flare) * eased;
    this.current.jitter += (this.target.jitter - this.current.jitter) * eased;
    this.current.hue += (this.target.hue - this.current.hue) * eased;
    this.current.alpha += (this.target.alpha - this.current.alpha) * eased;

    ctx.clearRect(0, 0, width, height);
    const centerX = width / (2 * this.devicePixelRatio);
    const centerY = height / (2 * this.devicePixelRatio);
    const maxRadius = Math.min(centerX, centerY) * 0.92;
    const time = performance.now() * 0.001;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((this.tilt.y - this.tilt.x) * 0.0022);

    const gradient = ctx.createRadialGradient(
      0,
      0,
      maxRadius * 0.08,
      Math.sin(time * 1.4) * 12,
      Math.cos(time * 1.4) * 12,
      maxRadius * (0.45 + this.current.halo * 0.35),
    );
    gradient.addColorStop(0, `hsla(${(this.current.hue + 40) % 360}, 100%, 74%, ${this.current.alpha})`);
    gradient.addColorStop(0.45, `hsla(${this.current.hue}, 90%, 60%, ${this.current.alpha * 0.7})`);
    gradient.addColorStop(1, `hsla(${(this.current.hue + 120) % 360}, 90%, 40%, 0)`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, maxRadius * 0.95, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalCompositeOperation = 'lighter';
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = `hsla(${(this.current.hue + 160) % 360}, 100%, 60%, ${this.current.alpha * 0.8})`;
    ctx.beginPath();
    ctx.ellipse(
      Math.sin(time * 1.8) * this.current.jitter * 24,
      Math.cos(time * 1.8) * this.current.jitter * 24,
      maxRadius * (0.45 + this.current.flare * 0.15),
      maxRadius * (0.35 + this.current.flare * 0.12),
      time * 0.7,
      0,
      Math.PI * 2,
    );
    ctx.stroke();

    ctx.restore();
  }
}

class BackgroundVisualizer {
  constructor(canvas, presets) {
    this.canvas = canvas;
    this.context = this.canvas.getContext('2d');
    this.presets = presets;
    this.devicePixelRatio = window.devicePixelRatio || 1;
    this.pointer = { x: 0.5, y: 0.5 };

    this.current = {
      density: 0.6,
      motion: 0.4,
      saturation: 1.2,
      hue: 180,
      alpha: 0.5,
      geometry: 'lattice',
    };
    this.target = { ...this.current };

    this.resizeObserver = createResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.canvas);
    this.resize();
    this.render = this.render.bind(this);
    this.render();
  }

  resize() {
    const ratio = this.devicePixelRatio;
    this.canvas.width = Math.max(1, Math.floor(this.canvas.clientWidth * ratio));
    this.canvas.height = Math.max(1, Math.floor(this.canvas.clientHeight * ratio));
    if (this.context.resetTransform) {
      this.context.resetTransform();
    } else {
      this.context.setTransform(1, 0, 0, 1, 0, 0);
    }
    this.context.scale(ratio, ratio);
  }

  setPointer(xNorm, yNorm) {
    this.pointer = { x: xNorm, y: yNorm };
  }

  setSection(config) {
    this.target = {
      density: config.background.baseDensity,
      motion: config.background.motion,
      saturation: config.background.saturation,
      hue: config.hue,
      alpha: 0.6,
      geometry: config.background.geometry,
    };
  }

  prepareFold(nextConfig, direction) {
    this.target = {
      density: nextConfig.background.baseDensity * (direction === 'forward' ? 0.4 : 0.5),
      motion: nextConfig.background.motion * 2,
      saturation: nextConfig.background.saturation * 1.5,
      hue: nextConfig.hue + (direction === 'forward' ? 54 : -54),
      alpha: 0.35,
      geometry: 'fold',
    };
  }

  render() {
    requestAnimationFrame(this.render);
    const ctx = this.context;
    if (!ctx) {
      return;
    }
    const { width, height } = this.canvas;
    if (width === 0 || height === 0) {
      return;
    }

    const eased = 0.05;
    this.current.density += (this.target.density - this.current.density) * eased;
    this.current.motion += (this.target.motion - this.current.motion) * eased;
    this.current.saturation += (this.target.saturation - this.current.saturation) * eased;
    this.current.hue += (this.target.hue - this.current.hue) * eased;
    this.current.alpha += (this.target.alpha - this.current.alpha) * eased;

    ctx.clearRect(0, 0, width, height);

    ctx.save();
    const time = performance.now() * 0.001 * (0.5 + this.current.motion);
    const density = Math.floor(24 * this.current.density);
    const pointerX = this.pointer.x * width;
    const pointerY = this.pointer.y * height;

    ctx.globalCompositeOperation = 'lighter';

    for (let i = 0; i < density; i += 1) {
      const progress = i / Math.max(1, density - 1);
      const noise = Math.sin(time * 2.1 + i * 1.7);
      const hue = (this.current.hue + progress * 120 + noise * 40) % 360;
      const alpha = Math.max(0.05, this.current.alpha * (1 - progress * 0.75));

      const orbitRadius =
        (Math.min(width, height) * 0.36 + progress * Math.min(width, height) * 0.42) *
        (0.6 + this.current.motion * 0.4);
      const angle = time * 0.6 + progress * Math.PI * 2 + noise * 0.6;
      const x = pointerX + Math.cos(angle) * orbitRadius;
      const y = pointerY + Math.sin(angle * 1.3) * orbitRadius;

      ctx.beginPath();
      ctx.fillStyle = `hsla(${hue}, ${80 + progress * 20}%, ${40 + progress * 40}%, ${alpha})`;
      const size = 60 + Math.sin(time * 1.6 + i) * 18 + this.current.motion * 24;
      ctx.ellipse(x, y, size * 0.6, size, angle, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

class NoopBackground {
  setSection() {}
  setPointer() {}
  prepareFold() {}
}

function getPhaseModifiers(phase, sectionConfig, meta, baseDensity, baseSpeed) {
  const bias = sectionConfig.visualizer || {
    densityBias: 1,
    speedBias: 1,
    glitchBias: 0.2,
  };

  const base = {
    density: baseDensity * 0.5 * bias.densityBias,
    speed: baseSpeed * 0.7 * bias.speedBias,
    glitch: 0.12 * bias.glitchBias,
    intensity: 0.32,
    alpha: 0.28,
  };

  switch (phase) {
    case 'focused':
      return {
        density: baseDensity * 1.12 * bias.densityBias,
        speed: baseSpeed * 1.12 * bias.speedBias,
        glitch: 0.16 * bias.glitchBias,
        intensity: 1.1,
        alpha: 0.8,
      };
    case 'approaching':
      return {
        density: baseDensity * 0.78 * bias.densityBias,
        speed: baseSpeed * 0.92 * bias.speedBias,
        glitch: 0.12 * bias.glitchBias,
        intensity: 0.6,
        alpha: 0.52,
      };
    case 'exiting':
      return {
        density: Math.max(0.25, baseDensity * 0.42 * bias.densityBias),
        speed: baseSpeed * 1.8 * bias.speedBias,
        glitch: 0.35 * bias.glitchBias,
        intensity: 1.4,
        alpha: 0.68,
      };
    case 'destroyed':
      return {
        density: baseDensity * 0.16,
        speed: baseSpeed * 2.1,
        glitch: 0.5 * bias.glitchBias,
        intensity: 0.2,
        alpha: 0.1,
      };
    default:
      return base;
  }
}

function initializeOrthogonalProgression() {
  if (!document.getElementById('orthogonalRoot')) {
    return;
  }
  window.__CLEAR_SEAS_ORTHOGONAL = new SectionalOrthogonalProgression();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initializeOrthogonalProgression());
} else {
  initializeOrthogonalProgression();
}
