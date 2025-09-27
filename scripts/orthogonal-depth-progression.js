import { DeviceTiltHandler } from '../js/interactions/device-tilt.js';
import { RealHolographicSystem } from '../src/holograms/RealHolographicSystem.js';
import { HolographicVisualizer } from '../src/holograms/HolographicVisualizer.js';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const SECTION_PRESETS = {
  quantum: {
    variant: 5,
    parameters: {
      gridDensity: 68,
      morphFactor: 1.1,
      chaos: 0.32,
      intensity: 0.88,
      speed: 0.82,
      hue: 195,
      saturation: 0.88
    }
  },
  holographic: {
    variant: 13,
    parameters: {
      gridDensity: 60,
      morphFactor: 0.95,
      chaos: 0.28,
      intensity: 0.92,
      speed: 0.9,
      hue: 305,
      saturation: 0.93
    }
  },
  faceted: {
    variant: 26,
    parameters: {
      gridDensity: 74,
      morphFactor: 0.72,
      chaos: 0.22,
      intensity: 0.9,
      speed: 0.65,
      hue: 140,
      saturation: 0.86
    }
  },
  neural: {
    variant: 21,
    parameters: {
      gridDensity: 66,
      morphFactor: 1.25,
      chaos: 0.38,
      intensity: 0.94,
      speed: 1.05,
      hue: 255,
      saturation: 0.91
    }
  }
};

const DEFAULT_PARAMETER_STATE = {
  rot4dXW: 0,
  rot4dYW: 0,
  rot4dZW: 0,
  dimension: 3.5,
  morphFactor: 1.0,
  chaos: 0.3,
  intensity: 0.85,
  gridDensity: 55,
  hue: 210,
  saturation: 0.85,
  speed: 0.75
};

const gridDensityToVariant = (value = DEFAULT_PARAMETER_STATE.gridDensity) => 0.3 + ((value ?? DEFAULT_PARAMETER_STATE.gridDensity) - 5) / 95 * 2.2;

class HolographicBackdrop {
  constructor() {
    this.system = null;
    this.currentSection = null;
    this.currentParams = new Map();
    this.initialize();
  }

  initialize() {
    try {
      this.system = new RealHolographicSystem();
      if (typeof this.system.setActive === 'function') {
        this.system.setActive(true);
      }
      window.holographicSystem = this.system;
      console.log('✅ Holographic backdrop initialized');
    } catch (error) {
      console.error('❌ Failed to initialize holographic system:', error);
    }
  }

  applyParameter(param, value) {
    if (!this.system || value === undefined || Number.isNaN(value)) {
      return;
    }
    const prev = this.currentParams.get(param);
    if (prev === undefined || Math.abs(prev - value) >= 0.001) {
      this.currentParams.set(param, value);
      this.system.updateParameter(param, value);
      if (window.userParameterState) {
        window.userParameterState[param] = value;
      }
    }
  }

  applyPreset(section) {
    if (!this.system) {
      return;
    }
    const preset = SECTION_PRESETS[section];
    this.currentSection = section;
    if (preset && typeof preset.variant === 'number' && typeof this.system.updateVariant === 'function') {
      this.system.updateVariant(preset.variant);
    }
    if (preset?.parameters) {
      Object.entries(preset.parameters).forEach(([param, value]) => {
        this.applyParameter(param, value);
      });
    }
  }

  updateTilt({ tiltX = 0, tiltY = 0, intensity = 0, rotation } = {}) {
    const rotationPayload = rotation || {
      rot4dXW: clamp(tiltY * 2.1, -2.6, 2.6),
      rot4dYW: clamp(tiltX * 2.1, -2.6, 2.6),
      rot4dZW: clamp((tiltX - tiltY) * 1.5, -2.3, 2.3)
    };
    this.applyParameter('rot4dXW', rotationPayload.rot4dXW);
    this.applyParameter('rot4dYW', rotationPayload.rot4dYW);
    this.applyParameter('rot4dZW', rotationPayload.rot4dZW);

    const base = SECTION_PRESETS[this.currentSection]?.parameters || {};
    const baseSpeed = base.speed ?? DEFAULT_PARAMETER_STATE.speed;
    this.applyParameter('speed', baseSpeed + intensity * 0.45);

    if (!rotation) {
      const baseChaos = base.chaos ?? DEFAULT_PARAMETER_STATE.chaos;
      const baseMorph = base.morphFactor ?? DEFAULT_PARAMETER_STATE.morphFactor;
      this.applyParameter('chaos', baseChaos + intensity * 0.3);
      this.applyParameter('morphFactor', baseMorph + intensity * 0.25);
    }
  }

  triggerHypercubeFold() {
    const preset = SECTION_PRESETS[this.currentSection]?.parameters || {};
    const baseChaos = preset.chaos ?? DEFAULT_PARAMETER_STATE.chaos;
    const baseSpeed = preset.speed ?? DEFAULT_PARAMETER_STATE.speed;
    this.applyParameter('chaos', baseChaos + 0.35);
    this.applyParameter('speed', baseSpeed + 0.6);
    setTimeout(() => {
      if (this.currentSection) {
        this.applyPreset(this.currentSection);
      }
    }, 900);
  }
}

class CardVisualizer {
  constructor(card) {
    this.card = card;
    this.section = card.dataset.section || 'quantum';
    this.canvas = card.querySelector('canvas');
    const variant = SECTION_PRESETS[this.section]?.variant ?? 0;
    this.visualizer = this.canvas ? new HolographicVisualizer(this.canvas.id, 'content', 1.0, variant) : null;
    this.currentParams = { ...(SECTION_PRESETS[this.section]?.parameters || {}) };
    this.tiltState = { tiltX: 0, tiltY: 0, intensity: 0 };
    this.transitionState = { phase: 'far-depth', startTime: performance.now() };

    if (this.visualizer) {
      this.applyPreset();
      this.start();
    }
  }

  applyPreset() {
    if (!this.visualizer) return;
    const preset = SECTION_PRESETS[this.section];
    if (preset && typeof preset.variant === 'number') {
      this.visualizer.variant = preset.variant;
      this.visualizer.variantParams = this.visualizer.generateVariantParams(preset.variant);
      this.visualizer.roleParams = this.visualizer.generateRoleParams(this.visualizer.role);
    }
    this.applyParameterSet(this.currentParams);
  }

  applyParameterSet(params = {}) {
    Object.entries(params).forEach(([param, value]) => this.handleParameter(param, value));
  }

  updateTilt(tiltX, tiltY, intensity) {
    this.tiltState = { tiltX, tiltY, intensity };
  }

  setTransitionPhase(phase = 'far-depth') {
    this.transitionState = { phase, startTime: performance.now() };
  }

  handleParameter(param, value) {
    if (!this.visualizer || value === undefined || Number.isNaN(value)) return;
    this.currentParams[param] = value;
    switch (param) {
      case 'gridDensity':
        this.visualizer.variantParams.density = gridDensityToVariant(value);
        break;
      case 'morphFactor':
        this.visualizer.variantParams.morph = value;
        break;
      case 'chaos':
        this.visualizer.variantParams.chaos = value;
        break;
      case 'intensity':
        this.visualizer.variantParams.intensity = value;
        break;
      case 'speed':
        this.visualizer.variantParams.speed = value;
        break;
      case 'hue':
        this.visualizer.variantParams.hue = value;
        break;
      case 'saturation':
        this.visualizer.variantParams.saturation = value;
        break;
      case 'rot4dXW':
        this.visualizer.variantParams.rot4dXW = value;
        break;
      case 'rot4dYW':
        this.visualizer.variantParams.rot4dYW = value;
        break;
      case 'rot4dZW':
        this.visualizer.variantParams.rot4dZW = value;
        break;
      default:
        break;
    }
  }

  applyDynamicModulation() {
    if (!this.visualizer) return;
    const { tiltX, tiltY, intensity } = this.tiltState;
    const rotationScale = 2.2;
    this.visualizer.variantParams.rot4dXW = clamp(tiltY * rotationScale, -2.7, 2.7);
    this.visualizer.variantParams.rot4dYW = clamp(tiltX * rotationScale, -2.7, 2.7);
    this.visualizer.variantParams.rot4dZW = clamp((tiltX - tiltY) * 1.6, -2.3, 2.3);

    const preset = SECTION_PRESETS[this.section]?.parameters || {};
    const baseSpeed = this.currentParams.speed ?? preset.speed ?? DEFAULT_PARAMETER_STATE.speed;
    const baseChaos = this.currentParams.chaos ?? preset.chaos ?? DEFAULT_PARAMETER_STATE.chaos;
    const baseIntensity = this.currentParams.intensity ?? preset.intensity ?? DEFAULT_PARAMETER_STATE.intensity;
    const baseMorph = this.currentParams.morphFactor ?? preset.morphFactor ?? DEFAULT_PARAMETER_STATE.morphFactor;
    const baseGrid = this.currentParams.gridDensity ?? preset.gridDensity ?? DEFAULT_PARAMETER_STATE.gridDensity;

    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const { phase, startTime } = this.transitionState;
    const elapsed = Math.max(0, now - startTime);

    let speed;
    let chaos;
    let luminance;
    let morph = baseMorph;
    let densityVariant;

    switch (phase) {
      case 'approaching': {
        const progress = clamp(elapsed / 700, 0, 1);
        speed = baseSpeed + intensity * 0.35 + progress * 0.25;
        chaos = baseChaos + intensity * 0.25 + progress * 0.2;
        luminance = baseIntensity + intensity * 0.18 + progress * 0.12;
        morph = baseMorph + intensity * 0.06 + progress * 0.1;
        densityVariant = gridDensityToVariant(baseGrid) + progress * 0.12 - intensity * 0.05;
        break;
      }
      case 'focused': {
        const pulse = (Math.sin(now * 0.002) + 1) * 0.5;
        speed = baseSpeed + intensity * 0.38 + pulse * 0.16;
        chaos = baseChaos + intensity * 0.28 + pulse * 0.12;
        luminance = baseIntensity + intensity * 0.22 + pulse * 0.1;
        morph = baseMorph + intensity * 0.08 + pulse * 0.06;
        densityVariant = gridDensityToVariant(baseGrid) - pulse * 0.05 - intensity * 0.03;
        break;
      }
      case 'exiting':
      case 'destroyed': {
        const progress = clamp(elapsed / 900, 0, 1);
        speed = baseSpeed + intensity * 0.45 + progress * 0.7;
        chaos = baseChaos + intensity * 0.32 + progress * 0.55;
        luminance = baseIntensity + intensity * 0.25 + progress * 0.34;
        morph = baseMorph + intensity * 0.12 + progress * 0.35;
        densityVariant = gridDensityToVariant(baseGrid) * (1 - progress * 0.55) - intensity * 0.08;
        break;
      }
      case 'far-depth': {
        const progress = clamp(elapsed / 800, 0, 1);
        speed = baseSpeed * (0.55 + (1 - progress) * 0.25) + intensity * 0.18;
        chaos = baseChaos * (0.6 + (1 - progress) * 0.25) + intensity * 0.14;
        luminance = baseIntensity * (0.45 + (1 - progress) * 0.35) + intensity * 0.08;
        morph = baseMorph * (0.8 + (1 - progress) * 0.15) + intensity * 0.04;
        densityVariant = gridDensityToVariant(baseGrid) * (0.75 + (1 - progress) * 0.2) - intensity * 0.05;
        break;
      }
      default: {
        speed = baseSpeed + intensity * 0.35;
        chaos = baseChaos + intensity * 0.25;
        luminance = baseIntensity + intensity * 0.18;
        morph = baseMorph + intensity * 0.06;
        densityVariant = gridDensityToVariant(baseGrid) - intensity * 0.04;
        break;
      }
    }

    this.visualizer.variantParams.speed = clamp(speed, 0, 3.5);
    this.visualizer.variantParams.chaos = clamp(chaos, 0, 2.6);
    this.visualizer.variantParams.intensity = clamp(luminance, 0, 1.8);
    this.visualizer.variantParams.morph = clamp(morph, 0, 3.5);
    this.visualizer.variantParams.density = clamp(densityVariant, 0.08, 3.2);
  }

  start() {
    if (!this.visualizer) return;
    const render = () => {
      this.visualizer.resize();
      this.applyDynamicModulation();
      this.visualizer.render();
      this.frame = requestAnimationFrame(render);
    };
    render();
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
    this.cardVisualizers = new Map();
    this.layoutSamples = new Map();
    this.pointerTilt = { tiltX: 0, tiltY: 0, intensity: 0, rotation: null, source: 'pointer', extreme: false };
    this.pointerSource = 'pointer';
    this.pendingRotation = null;
    this.tiltTarget = { tiltX: 0, tiltY: 0, intensity: 0, rotation: null, source: 'layout', extreme: false };
    this.smoothedTilt = { tiltX: 0, tiltY: 0, intensity: 0 };
    this.layoutInfluence = 0.35;
    this.pointerInfluence = 0.65;
    this.animationFrame = null;
    this.layoutObserver = null;
    this.boundSampleLayout = () => this.sampleLayout();
    window.addEventListener('resize', this.boundSampleLayout);
  }

  registerCards(cards = []) {
    this.cardVisualizers.clear();
    this.layoutSamples.clear();
    cards.forEach((card) => {
      if (!card) return;
      if (card.dataset.titleFrom) {
        card.style.setProperty('--section-title-from', card.dataset.titleFrom);
      }
      if (card.dataset.titleTo) {
        card.style.setProperty('--section-title-to', card.dataset.titleTo);
      }
      const visualizer = new CardVisualizer(card);
      if (card.classList.contains('focused')) {
        visualizer.setTransitionPhase('focused');
      }
      this.cardVisualizers.set(card, visualizer);
      this.updateLayoutForCard(card);
    });
    this.attachLayoutObserver();
    this.sampleLayout();
  }

  attachLayoutObserver() {
    if (typeof ResizeObserver === 'undefined') {
      return;
    }
    if (this.layoutObserver) {
      this.layoutObserver.disconnect();
    }
    this.layoutObserver = new ResizeObserver(() => {
      this.sampleLayout();
    });
    this.cardVisualizers.forEach((_, card) => {
      this.layoutObserver.observe(card);
    });
  }

  sampleLayout() {
    if (!this.cardVisualizers.size) {
      return;
    }
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 1;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;
    this.cardVisualizers.forEach((_, card) => {
      this.updateLayoutForCard(card, viewportWidth, viewportHeight);
    });
    this.recalculateTilt('layout');
  }

  updateLayoutForCard(card, viewportWidth = window.innerWidth || document.documentElement.clientWidth || 1, viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1) {
    if (!card) {
      return;
    }
    const rect = card.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      this.layoutSamples.set(card, { x: 0, y: 0, intensity: 0 });
      card.style.setProperty('--layout-tilt-x', '0');
      card.style.setProperty('--layout-tilt-y', '0');
      card.style.setProperty('--layout-tilt-strength', '0');
      return;
    }
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const normalizedX = ((centerX / viewportWidth) - 0.5) * 2;
    const normalizedY = ((centerY / viewportHeight) - 0.5) * 2;
    const tiltX = clamp(normalizedX * 0.45, -0.65, 0.65);
    const tiltY = clamp(-normalizedY * 0.45, -0.65, 0.65);
    const intensity = clamp(Math.sqrt(tiltX * tiltX + tiltY * tiltY), 0, 1.1);
    this.layoutSamples.set(card, { x: tiltX, y: tiltY, intensity });
    card.style.setProperty('--layout-tilt-x', tiltX.toFixed(4));
    card.style.setProperty('--layout-tilt-y', tiltY.toFixed(4));
    card.style.setProperty('--layout-tilt-strength', intensity.toFixed(3));
  }

  activate(card) {
    if (!card) {
      return;
    }
    if (this.activeCard && this.activeCard !== card) {
      this.activeCard.classList.remove('tilt-extreme');
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

    const sectionKey = card.dataset.section || 'quantum';
    this.background?.applyPreset(sectionKey);
    const visualizer = this.cardVisualizers.get(card);
    visualizer?.applyPreset();
    visualizer?.setTransitionPhase('focused');

    if (window.userParameterState) {
      const presetParams = SECTION_PRESETS[sectionKey]?.parameters || {};
      Object.entries(presetParams).forEach(([param, value]) => {
        window.userParameterState[param] = value;
      });
    }

    this.updateLayoutForCard(card);
    this.recalculateTilt('layout');
  }

  deactivate(card) {
    if (card) {
      card.dataset.visualizerActive = 'false';
      card.style.removeProperty('--card-visibility');
      card.classList.remove('tilt-extreme');
      const visualizer = this.cardVisualizers.get(card);
      visualizer?.setTransitionPhase('far-depth');
    }
  }

  updateTilt(payload = {}) {
    const tiltX = clamp(payload.tiltX ?? 0, -1.2, 1.2);
    const tiltY = clamp(payload.tiltY ?? 0, -1.2, 1.2);
    const intensity = clamp(payload.intensity ?? 0, 0, 2);
    this.pointerTilt = {
      tiltX,
      tiltY,
      intensity,
      rotation: payload.rotation || null,
      source: payload.source || this.pointerSource || 'pointer',
      extreme: !!payload.extreme
    };
    this.pointerSource = this.pointerTilt.source;
    this.pendingRotation = this.pointerTilt.rotation;
    this.recalculateTilt(this.pointerTilt.source, this.pointerTilt.extreme);
  }

  recalculateTilt(reason = 'pointer', externalExtreme = false) {
    const layout = this.activeCard ? this.layoutSamples.get(this.activeCard) || { x: 0, y: 0, intensity: 0 } : { x: 0, y: 0, intensity: 0 };
    const pointer = this.pointerTilt;
    const finalTiltX = clamp(pointer.tiltX * this.pointerInfluence + layout.x * this.layoutInfluence, -1.25, 1.25);
    const finalTiltY = clamp(pointer.tiltY * this.pointerInfluence + layout.y * this.layoutInfluence, -1.25, 1.25);
    const finalIntensity = clamp(pointer.intensity * this.pointerInfluence + layout.intensity * this.layoutInfluence, 0, 1.6);
    const extreme = externalExtreme || pointer.extreme || finalIntensity > 1.1;
    this.setTiltTarget({
      tiltX: finalTiltX,
      tiltY: finalTiltY,
      intensity: finalIntensity,
      rotation: pointer.rotation || this.pendingRotation || null,
      source: pointer.source || reason,
      extreme
    });
  }

  setTiltTarget(target = {}) {
    this.tiltTarget = {
      tiltX: clamp(target.tiltX ?? 0, -1.3, 1.3),
      tiltY: clamp(target.tiltY ?? 0, -1.3, 1.3),
      intensity: clamp(target.intensity ?? 0, 0, 1.8),
      rotation: target.rotation || null,
      source: target.source || 'layout',
      extreme: !!target.extreme
    };
    if (!this.animationFrame) {
      this.animationFrame = requestAnimationFrame(() => this.animateTilt());
    }
  }

  animateTilt() {
    const smoothing = 0.18;
    this.smoothedTilt.tiltX += (this.tiltTarget.tiltX - this.smoothedTilt.tiltX) * smoothing;
    this.smoothedTilt.tiltY += (this.tiltTarget.tiltY - this.smoothedTilt.tiltY) * smoothing;
    this.smoothedTilt.intensity += (this.tiltTarget.intensity - this.smoothedTilt.intensity) * 0.2;

    this.applySmoothedTilt({
      tiltX: this.smoothedTilt.tiltX,
      tiltY: this.smoothedTilt.tiltY,
      intensity: this.smoothedTilt.intensity,
      rotation: this.tiltTarget.rotation,
      source: this.tiltTarget.source,
      extreme: this.tiltTarget.extreme
    });

    const deltaX = Math.abs(this.smoothedTilt.tiltX - this.tiltTarget.tiltX);
    const deltaY = Math.abs(this.smoothedTilt.tiltY - this.tiltTarget.tiltY);
    const deltaI = Math.abs(this.smoothedTilt.intensity - this.tiltTarget.intensity);

    if (deltaX > 0.0008 || deltaY > 0.0008 || deltaI > 0.0008) {
      this.animationFrame = requestAnimationFrame(() => this.animateTilt());
    } else {
      this.animationFrame = null;
    }
  }

  applySmoothedTilt({ tiltX, tiltY, intensity, rotation, extreme }) {
    const root = document.documentElement;
    root.style.setProperty('--global-tilt-x', tiltX.toFixed(4));
    root.style.setProperty('--global-tilt-y', tiltY.toFixed(4));
    root.style.setProperty('--global-tilt-strength', intensity.toFixed(3));

    if (this.activeCard) {
      this.activeCard.style.setProperty('--card-tilt-x', tiltX.toFixed(4));
      this.activeCard.style.setProperty('--card-tilt-y', tiltY.toFixed(4));
      this.activeCard.classList.toggle('tilt-extreme', !!extreme);
      const visualizer = this.cardVisualizers.get(this.activeCard);
      visualizer?.updateTilt(tiltX, tiltY, intensity);
    }

    this.cardVisualizers.forEach((visualizer, card) => {
      if (!visualizer || card === this.activeCard) {
        return;
      }
      const layout = this.layoutSamples.get(card) || { x: 0, y: 0, intensity: 0 };
      const followerTiltX = clamp(tiltX * 0.25 + layout.x * 0.75, -1.1, 1.1);
      const followerTiltY = clamp(tiltY * 0.25 + layout.y * 0.75, -1.1, 1.1);
      const followerIntensity = clamp(intensity * 0.4 + layout.intensity * 0.8, 0, 1.2);
      visualizer.updateTilt(followerTiltX, followerTiltY, followerIntensity);
    });

    this.background?.updateTilt({
      tiltX,
      tiltY,
      intensity,
      rotation: rotation || null
    });
  }

  applyParameterToActiveCard(param, value) {
    if (!this.activeCard) {
      return;
    }
    const visualizer = this.cardVisualizers.get(this.activeCard);
    visualizer?.handleParameter(param, value);
  }

  pulseExit(card) {
    if (card) {
      card.style.setProperty('--card-visibility', '0.45');
    }
  }

  triggerHypercubeFold(nextCard, onComplete) {
    if (this.container) {
      this.container.classList.add('hypercube-folding');
    }
    this.background?.triggerHypercubeFold();
    setTimeout(() => {
      if (this.container) {
        this.container.classList.remove('hypercube-folding');
      }
      if (typeof onComplete === 'function') {
        onComplete();
      }
    }, 900);
  }

  destroy() {
    if (this.layoutObserver) {
      this.layoutObserver.disconnect();
      this.layoutObserver = null;
    }
    window.removeEventListener('resize', this.boundSampleLayout);
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    this.cardVisualizers.clear();
    this.layoutSamples.clear();
    this.activeCard = null;
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
    window.addEventListener('pointermove', this.handlePointerMove);
    window.addEventListener('pointerleave', this.handlePointerLeave);
    this.indicator?.setMode('pointer');
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
    const payload = { tiltX, tiltY, intensity, source: 'pointer', extreme: intensity > 1.05 };
    this.indicator?.update(payload);
    this.onUpdate?.(payload);
  }

  handlePointerLeave() {
    if (!this.enabled) {
      return;
    }
    const payload = { tiltX: 0, tiltY: 0, intensity: 0, source: 'pointer', extreme: false };
    this.indicator?.update(payload);
    this.onUpdate?.(payload);
  }
}

class TiltVisualizerAdapter extends DeviceTiltHandler {
  constructor({ onUpdate, indicator } = {}) {
    super();
    this.onUpdate = typeof onUpdate === 'function' ? onUpdate : null;
    this.indicator = indicator || null;
  }

  applyGeometricWindow(windowData) {
    super.applyGeometricWindow(windowData);
    const tiltX = clamp(windowData.visualRotation.rotateZ / 60, -1, 1);
    const tiltY = clamp(windowData.visualRotation.rotateX / 60, -1, 1);
    const payload = {
      tiltX,
      tiltY,
      intensity: windowData.tiltIntensity,
      rotation: { ...windowData.viewingAngle4D },
      source: 'device',
      extreme: windowData.extremeTilt
    };

    if (this.indicator) {
      this.indicator.update(payload);
    }
    if (this.onUpdate) {
      this.onUpdate(payload);
    }
  }

  resetGeometricWindow() {
    super.resetGeometricWindow();
    const payload = { tiltX: 0, tiltY: 0, intensity: 0, source: 'device', extreme: false };
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

    this.background = new HolographicBackdrop();
    this.indicator = new TiltIndicator(options.tiltIndicator);
    this.sectionChoreographer = new SectionChoreographer({
      background: this.background,
      container: this.container
    });

    this.parameterState = { ...DEFAULT_PARAMETER_STATE };
    window.userParameterState = { ...this.parameterState };
    window.updateParameter = (param, value) => this.handleParameterUpdate(param, value);

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
    this.indicator?.setMode('pointer');

    setTimeout(() => {
      this.tiltAdapter.enable().then((enabled) => {
        if (enabled) {
          this.pointerTilt.disable();
          this.indicator?.setMode('device');
        }
      }).catch(() => {
        this.pointerTilt.enable();
        this.indicator?.setMode('pointer');
      });
    }, 400);
  }

  handleParameterUpdate(param, value) {
    const numeric = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(numeric)) {
      return;
    }
    this.parameterState[param] = numeric;
    this.background?.applyParameter(param, numeric);
    this.sectionChoreographer.applyParameterToActiveCard(param, numeric);
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

    const visualizer = this.sectionChoreographer.cardVisualizers.get(card);
    visualizer?.setTransitionPhase(state);
    this.sectionChoreographer.updateLayoutForCard(card);
    if (card === this.sectionChoreographer.activeCard) {
      this.sectionChoreographer.recalculateTilt('layout');
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
    this.sectionChoreographer.destroy();

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
