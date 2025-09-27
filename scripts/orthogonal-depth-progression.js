import DeviceTiltHandler from '../js/interactions/device-tilt.js';
import { HolographicSystem as VIB34DHolographicSystem } from '../systems/holographic/HolographicSystem.js';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const lerp = (from, to, factor) => from + (to - from) * factor;

const SECTION_VARIANTS = {
  quantum: 5,
  holographic: 9,
  faceted: 27,
  neural: 21
};

const SECTION_HUES = {
  quantum: 200,
  holographic: 320,
  faceted: 145,
  neural: 265
};

export default class OrthogonalDepthProgression {
  constructor(options = {}) {
    const { container, tiltIndicator } = options;
    this.container = container;
    this.tiltIndicator = tiltIndicator;
    this.cards = Array.from(container?.querySelectorAll('.progression-card') || []);

    this.currentIndex = -1;
    this.autoProgress = false;
    this.autoHandle = null;
    this.isTransitioning = false;

    this.pointerState = { active: false, x: 0, y: 0 };
    this.deviceState = { active: false, x: 0, y: 0, intensity: 0, dramatic: false };
    this.tiltState = { x: 0, y: 0, targetX: 0, targetY: 0, strength: 0 };

    this.holographic = null;
    this.holographicEngine = null;

    this.ready = this.initialize();
  }

  async initialize() {
    if (!this.container || this.cards.length === 0) {
      console.warn('OrthogonalDepthProgression: no cards found to orchestrate.');
      return;
    }

    this.bindPointerHandlers();
    this.bindCardControls();

    this.installSystemManagerStub();
    await this.initializeHolographicSystem();
    this.installTiltSystem();

    this.focusCard(0, { immediate: true });
    this.startTicker();
  }

  bindPointerHandlers() {
    window.addEventListener('pointermove', (event) => {
      const viewportWidth = window.innerWidth || 1;
      const viewportHeight = window.innerHeight || 1;
      const normalizedX = (event.clientX / viewportWidth) * 2 - 1;
      const normalizedY = (event.clientY / viewportHeight) * 2 - 1;

      this.pointerState.x = clamp(normalizedX, -1, 1);
      this.pointerState.y = clamp(normalizedY, -1, 1);
      this.pointerState.active = true;
    });

    window.addEventListener('pointerleave', () => {
      this.pointerState.active = false;
    });

    window.addEventListener('blur', () => {
      this.pointerState.active = false;
    });
  }

  bindCardControls() {
    this.cards.forEach((card, index) => {
      card.addEventListener('click', () => this.focusCard(index));
      card.addEventListener('pointerdown', (event) => {
        event.stopPropagation();
        this.focusCard(index);
      });
    });
  }

  installSystemManagerStub() {
    const manager = window.systemManager || {};
    manager.getCurrentSystemName = () => 'holographic';
    window.systemManager = manager;
  }

  async initializeHolographicSystem() {
    try {
      this.holographic = new VIB34DHolographicSystem();
      await this.holographic.initialize();
      await this.holographic.activate();
      this.holographicEngine = window.holographicSystem || this.holographic.engine;

      const layers = document.getElementById('holographicLayers');
      if (layers) {
        requestAnimationFrame(() => {
          layers.style.opacity = '1';
        });
      }
    } catch (error) {
      console.error('OrthogonalDepthProgression: Failed to initialize holographic system', error);
    }
  }

  installTiltSystem() {
    const enableDeviceTilt = () => {
      if (typeof window.enableDeviceTilt === 'function') {
        window.enableDeviceTilt().then((enabled) => {
          this.deviceState.active = Boolean(enabled);
        }).catch(() => {
          this.deviceState.active = false;
        });
      }
    };

    window.addEventListener('click', enableDeviceTilt, { once: true });
    window.addEventListener('touchstart', enableDeviceTilt, { once: true, passive: true });

    if (!window.deviceTiltHandler) {
      window.deviceTiltHandler = new DeviceTiltHandler();
    }
  }

  startTicker() {
    const tick = () => {
      this.updateTiltState();
      requestAnimationFrame(tick);
    };
    tick();
  }

  updateTiltState() {
    const tiltHandler = window.deviceTiltHandler;
    const deviceActive = tiltHandler && tiltHandler.isEnabled;

    if (deviceActive) {
      const rotation = tiltHandler.smoothedRotation || { rot4dXW: 0, rot4dYW: 0 };
      const xTilt = clamp(rotation.rot4dYW / 1.25, -1.2, 1.2);
      const yTilt = clamp(-rotation.rot4dXW / 1.25, -1.2, 1.2);

      this.tiltState.targetX = xTilt;
      this.tiltState.targetY = yTilt;
      this.deviceState.active = true;
      this.deviceState.dramatic = Boolean(tiltHandler.dramaticMode);
      this.deviceState.intensity = tiltHandler.tiltIntensity || Math.min(Math.hypot(xTilt, yTilt), 1.6);
    } else if (this.pointerState.active) {
      this.tiltState.targetX = this.pointerState.x * 0.75;
      this.tiltState.targetY = -this.pointerState.y * 0.75;
      this.deviceState.active = false;
      this.deviceState.intensity = Math.min(Math.hypot(this.tiltState.targetX, this.tiltState.targetY), 1.1);
    } else {
      this.tiltState.targetX = 0;
      this.tiltState.targetY = 0;
      this.deviceState.active = false;
      this.deviceState.intensity = 0;
    }

    this.tiltState.x = lerp(this.tiltState.x, this.tiltState.targetX, 0.12);
    this.tiltState.y = lerp(this.tiltState.y, this.tiltState.targetY, 0.12);
    this.tiltState.strength = lerp(
      this.tiltState.strength,
      this.deviceState.active ? this.deviceState.intensity : Math.min(Math.hypot(this.tiltState.x, this.tiltState.y), 1.0),
      0.08
    );

    document.documentElement.style.setProperty('--global-tilt-x', this.tiltState.x.toFixed(4));
    document.documentElement.style.setProperty('--global-tilt-y', this.tiltState.y.toFixed(4));
    document.documentElement.style.setProperty('--global-tilt-strength', this.tiltState.strength.toFixed(4));

    if (!deviceActive && typeof window.updateParameter === 'function') {
      const rot4dYW = clamp(this.tiltState.x * 1.25, -1.5, 1.5);
      const rot4dXW = clamp(-this.tiltState.y * 1.25, -1.5, 1.5);
      const rot4dZW = clamp(this.tiltState.strength * 0.6, -1.5, 1.5);

      window.updateParameter('rot4dYW', rot4dYW);
      window.updateParameter('rot4dXW', rot4dXW);
      window.updateParameter('rot4dZW', rot4dZW);
    }

    this.updateTiltIndicator();
  }

  updateTiltIndicator() {
    if (!this.tiltIndicator) {
      return;
    }

    const tiltXElement = this.tiltIndicator.querySelector('#tilt-x');
    const tiltYElement = this.tiltIndicator.querySelector('#tilt-y');
    const rotElement = this.tiltIndicator.querySelector('#rot4d');

    if (tiltXElement) {
      tiltXElement.textContent = (this.tiltState.y * -45).toFixed(1);
    }
    if (tiltYElement) {
      tiltYElement.textContent = (this.tiltState.x * 45).toFixed(1);
    }
    if (rotElement) {
      rotElement.textContent = this.deviceState.active ? 'Device Tilt' : 'Pointer';
    }

    const mode = this.deviceState.active
      ? (this.deviceState.dramatic ? 'dramatic' : 'device')
      : 'pointer';
    this.tiltIndicator.dataset.mode = mode;
    this.tiltIndicator.classList.toggle('extreme', this.deviceState.intensity > 1.05);
  }

  focusCard(index, options = {}) {
    if (this.isTransitioning || index === this.currentIndex) {
      if (!options.immediate) {
        this.triggerCardPulse(this.cards[index]);
      }
      return;
    }

    const previousCard = this.currentIndex >= 0 ? this.cards[this.currentIndex] : null;
    const nextCard = this.cards[index];

    this.currentIndex = index;
    this.isTransitioning = true;

    this.updateCardStates();
    this.applyCardTheme(nextCard);
    this.applySectionProfile(nextCard);
    this.triggerHypercubeFold();

    if (previousCard) {
      this.runCardDestruction(previousCard);
    }

    setTimeout(() => {
      this.isTransitioning = false;
    }, 950);
  }

  updateCardStates() {
    this.cards.forEach((card, idx) => {
      card.classList.remove('focused', 'approaching', 'exiting', 'far-depth');

      if (idx === this.currentIndex) {
        card.classList.add('focused');
      } else {
        const offset = idx - this.currentIndex;
        if (offset === 1 || (offset === -(this.cards.length - 1))) {
          card.classList.add('approaching');
        } else if (offset === -1 || (offset === this.cards.length - 1)) {
          card.classList.add('exiting');
        } else {
          card.classList.add('far-depth');
        }
      }

      card.style.zIndex = String(this.cards.length - Math.abs(idx - this.currentIndex));
    });
  }

  triggerCardPulse(card) {
    if (!card) return;
    card.classList.add('pulse');
    setTimeout(() => card.classList.remove('pulse'), 420);
  }

  applyCardTheme(card) {
    if (!card) return;

    const rootStyle = document.documentElement.style;
    const from = card.dataset.titleFrom;
    const to = card.dataset.titleTo;
    const bgPrimary = card.dataset.bgPrimary;
    const bgSecondary = card.dataset.bgSecondary;
    const bgGlow = card.dataset.bgGlow;

    if (from) rootStyle.setProperty('--section-title-from', from);
    if (to) rootStyle.setProperty('--section-title-to', to);

    if (bgPrimary && bgSecondary) {
      document.body.style.background = `radial-gradient(circle at 50% 50%, ${bgGlow || 'rgba(0,0,0,0.2)'}, transparent 70%), linear-gradient(180deg, ${bgPrimary}, ${bgSecondary})`;
    }
  }

  applySectionProfile(card) {
    if (!card || !this.holographicEngine) {
      return;
    }

    const section = card.dataset.section || 'quantum';
    const variant = SECTION_VARIANTS[section] ?? 5;
    const density = Number(card.dataset.visualizerDensity) || 0.8;
    const speed = Number(card.dataset.visualizerSpeed) || 0.6;
    const hue = SECTION_HUES[section] ?? 220;

    if (typeof this.holographicEngine.setVariant === 'function') {
      this.holographicEngine.setVariant(variant);
    }

    const updates = [
      ['gridDensity', 12 + density * 12],
      ['speed', 0.6 + speed * 1.2],
      ['chaos', 0.15 + density * 0.3],
      ['hue', hue],
      ['intensity', 0.55 + density * 0.4],
      ['saturation', 0.75 + Math.min(speed, 1.0) * 0.2]
    ];

    updates.forEach(([param, value]) => {
      try {
        this.holographicEngine.updateParameter(param, value);
      } catch (error) {
        console.warn(`OrthogonalDepthProgression: Failed to update holographic parameter ${param}`, error);
      }
    });
  }

  triggerHypercubeFold() {
    this.container.classList.remove('hypercube-folding');
    void this.container.offsetWidth;
    this.container.classList.add('hypercube-folding');
  }

  runCardDestruction(card) {
    if (!card) return;
    const destruction = card.dataset.destruction;
    const animationClass = destruction ? `destruction-${destruction}` : 'destruction-quantum';

    card.classList.add(animationClass);
    setTimeout(() => {
      card.classList.remove(animationClass);
    }, 1600);
  }

  nextCard() {
    const nextIndex = (this.currentIndex + 1) % this.cards.length;
    this.focusCard(nextIndex);
  }

  previousCard() {
    const nextIndex = (this.currentIndex - 1 + this.cards.length) % this.cards.length;
    this.focusCard(nextIndex);
  }

  toggleAutoProgress() {
    this.autoProgress = !this.autoProgress;

    if (this.autoProgress) {
      this.autoHandle = setInterval(() => this.nextCard(), 6000);
    } else if (this.autoHandle) {
      clearInterval(this.autoHandle);
      this.autoHandle = null;
    }

    return this.autoProgress;
  }
}
