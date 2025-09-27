import { DeviceTiltHandler } from '../js/interactions/device-tilt.js';
import { RealHolographicSystem } from '../src/holograms/RealHolographicSystem.js';
import { HolographicVisualizer } from '../src/holograms/HolographicVisualizer.js';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

class ParameterMappingSystem {
  constructor(baseParameters = {}, interactionProvider = () => ({}), mappings = []) {
    this.baseParameters = { ...baseParameters };
    this.interactionProvider = typeof interactionProvider === 'function' ? interactionProvider : () => ({});
    this.effectiveParameters = { ...this.baseParameters };
    this.mappings = mappings.length ? mappings : ParameterMappingSystem.createCardMappings();
  }

  static createCardMappings() {
    return [
      {
        target: 'gridDensity',
        clamp: { min: 12, max: 110 },
        compute: (base, state) => {
          const tilt = state.tilt?.intensity ?? 0;
          const focus = state.stage?.focus ?? 0;
          const entry = state.stage?.entry ?? 0;
          const exit = state.stage?.exit ?? 0;
          const depth = state.stage?.depth ?? 0;
          const fold = state.fold ?? 0;
          const hover = state.hover ?? 0;
          const glitch = state.glitch ?? 0;
          const forwardPull = focus + entry;
          return base
            - forwardPull * 6.5
            - exit * 18.5
            - tilt * 12.5
            - fold * 8
            - hover * 3
            - glitch * 24
            + depth * 11;
        }
      },
      {
        target: 'speed',
        clamp: { min: 0.35, max: 2.2 },
        compute: (base, state) => {
          const tilt = state.tilt?.intensity ?? 0;
          const focus = state.stage?.focus ?? 0;
          const entry = state.stage?.entry ?? 0;
          const exit = state.stage?.exit ?? 0;
          const fold = state.fold ?? 0;
          const click = state.click ?? 0;
          const glitch = state.glitch ?? 0;
          return base
            + focus * 0.25
            + entry * 0.35
            + exit * 0.65
            + tilt * 0.4
            + fold * 0.6
            + click * 0.15
            + glitch * 0.55;
        }
      },
      {
        target: 'chaos',
        clamp: { min: 0, max: 1.4 },
        compute: (base, state) => {
          const tilt = state.tilt?.intensity ?? 0;
          const exit = state.stage?.exit ?? 0;
          const focus = state.stage?.focus ?? 0;
          const hover = state.hover ?? 0;
          const fold = state.fold ?? 0;
          const click = state.click ?? 0;
          const glitch = state.glitch ?? 0;
          return base
            + (tilt * tilt) * 0.45
            + exit * 0.6
            + focus * 0.18
            + hover * 0.12
            + click * 0.22
            + fold * 0.55
            + glitch * 0.9;
        }
      },
      {
        target: 'morphFactor',
        clamp: { min: 0.1, max: 2.4 },
        compute: (base, state) => {
          const tilt = state.tilt?.intensity ?? 0;
          const entry = state.stage?.entry ?? 0;
          const exit = state.stage?.exit ?? 0;
          const fold = state.fold ?? 0;
          const glitch = state.glitch ?? 0;
          return base
            + entry * 0.28
            + exit * 0.46
            + tilt * 0.22
            + fold * 0.52
            + glitch * 0.42;
        }
      },
      {
        target: 'intensity',
        clamp: { min: 0.35, max: 1.6 },
        compute: (base, state) => {
          const focus = state.stage?.focus ?? 0;
          const exit = state.stage?.exit ?? 0;
          const hover = state.hover ?? 0;
          const click = state.click ?? 0;
          const fold = state.fold ?? 0;
          const glitch = state.glitch ?? 0;
          return base
            + focus * 0.14
            + exit * 0.32
            + hover * 0.12
            + click * 0.26
            + fold * 0.34
            + glitch * 0.4;
        }
      },
      {
        target: 'hue',
        clamp: { min: 0, max: 720 },
        compute: (base, state) => {
          const tiltX = state.tilt?.x ?? 0;
          const tiltY = state.tilt?.y ?? 0;
          const exit = state.stage?.exit ?? 0;
          const fold = state.fold ?? 0;
          const hover = state.hover ?? 0;
          const glitch = state.glitch ?? 0;
          return base
            + exit * 32
            + fold * 110
            + hover * 12
            + tiltX * 26
            - tiltY * 18
            + glitch * 48;
        }
      },
      {
        target: 'saturation',
        clamp: { min: 0.35, max: 1.1 },
        compute: (base, state) => {
          const focus = state.stage?.focus ?? 0;
          const exit = state.stage?.exit ?? 0;
          const hover = state.hover ?? 0;
          const fold = state.fold ?? 0;
          const glitch = state.glitch ?? 0;
          return base
            + focus * 0.05
            + exit * 0.18
            + hover * 0.08
            + fold * 0.12
            + glitch * 0.14;
        }
      },
      {
        target: 'rot4dXW',
        clamp: { min: -3, max: 3 },
        compute: (base, state) => {
          const tiltY = state.tilt?.y ?? 0;
          const exit = state.stage?.exit ?? 0;
          const fold = state.fold ?? 0;
          const glitch = state.glitch ?? 0;
          return base + tiltY * 2.6 + exit * 0.45 + fold * 0.9 + glitch * 0.6;
        }
      },
      {
        target: 'rot4dYW',
        clamp: { min: -3, max: 3 },
        compute: (base, state) => {
          const tiltX = state.tilt?.x ?? 0;
          const entry = state.stage?.entry ?? 0;
          const fold = state.fold ?? 0;
          const glitch = state.glitch ?? 0;
          return base + tiltX * 2.6 - entry * 0.3 + fold * 0.8 + glitch * 0.6;
        }
      },
      {
        target: 'rot4dZW',
        clamp: { min: -3, max: 3 },
        compute: (base, state) => {
          const tiltX = state.tilt?.x ?? 0;
          const tiltY = state.tilt?.y ?? 0;
          const exit = state.stage?.exit ?? 0;
          const fold = state.fold ?? 0;
          const glitch = state.glitch ?? 0;
          return base + (tiltX - tiltY) * 1.9 + exit * 0.42 + fold * 1.1 + glitch * 0.75;
        }
      }
    ];
  }

  static createBackdropMappings() {
    return [
      {
        target: 'gridDensity',
        clamp: { min: 18, max: 120 },
        compute: (base, state) => {
          const tilt = state.tilt?.intensity ?? 0;
          const focus = state.stage?.focus ?? 0;
          const exit = state.stage?.exit ?? 0;
          const fold = state.fold ?? 0;
          const glitch = state.glitch ?? 0;
          return base - focus * 8 - exit * 16 - tilt * 10 - fold * 12 - glitch * 18;
        }
      },
      {
        target: 'speed',
        clamp: { min: 0.25, max: 2.5 },
        compute: (base, state) => {
          const tilt = state.tilt?.intensity ?? 0;
          const focus = state.stage?.focus ?? 0;
          const exit = state.stage?.exit ?? 0;
          const fold = state.fold ?? 0;
          const glitch = state.glitch ?? 0;
          return base + focus * 0.3 + tilt * 0.35 + exit * 0.7 + fold * 0.85 + glitch * 0.7;
        }
      },
      {
        target: 'chaos',
        clamp: { min: 0, max: 1.2 },
        compute: (base, state) => {
          const tilt = state.tilt?.intensity ?? 0;
          const exit = state.stage?.exit ?? 0;
          const fold = state.fold ?? 0;
          const glitch = state.glitch ?? 0;
          return base + (tilt * tilt) * 0.38 + exit * 0.52 + fold * 0.6 + glitch * 0.82;
        }
      },
      {
        target: 'morphFactor',
        clamp: { min: 0.1, max: 2.1 },
        compute: (base, state) => {
          const exit = state.stage?.exit ?? 0;
          const fold = state.fold ?? 0;
          const glitch = state.glitch ?? 0;
          return base + exit * 0.32 + fold * 0.48 + glitch * 0.44;
        }
      },
      {
        target: 'intensity',
        clamp: { min: 0.3, max: 1.4 },
        compute: (base, state) => {
          const focus = state.stage?.focus ?? 0;
          const exit = state.stage?.exit ?? 0;
          const fold = state.fold ?? 0;
          const glitch = state.glitch ?? 0;
          return base + focus * 0.1 + exit * 0.22 + fold * 0.28 + glitch * 0.35;
        }
      },
      {
        target: 'hue',
        clamp: { min: 0, max: 720 },
        compute: (base, state) => {
          const exit = state.stage?.exit ?? 0;
          const fold = state.fold ?? 0;
          const glitch = state.glitch ?? 0;
          return base + exit * 18 + fold * 140 + glitch * 64;
        }
      },
      {
        target: 'saturation',
        clamp: { min: 0.4, max: 1.05 },
        compute: (base, state) => {
          const exit = state.stage?.exit ?? 0;
          const fold = state.fold ?? 0;
          const glitch = state.glitch ?? 0;
          return base + exit * 0.12 + fold * 0.14 + glitch * 0.16;
        }
      },
      {
        target: 'rot4dXW',
        clamp: { min: -2.6, max: 2.6 },
        compute: (base, state) => {
          const tiltY = state.tilt?.y ?? 0;
          const fold = state.fold ?? 0;
          const glitch = state.glitch ?? 0;
          return base + tiltY * 2.2 + fold * 0.8 + glitch * 0.55;
        }
      },
      {
        target: 'rot4dYW',
        clamp: { min: -2.6, max: 2.6 },
        compute: (base, state) => {
          const tiltX = state.tilt?.x ?? 0;
          const fold = state.fold ?? 0;
          const glitch = state.glitch ?? 0;
          return base + tiltX * 2.2 + fold * 0.8 + glitch * 0.55;
        }
      },
      {
        target: 'rot4dZW',
        clamp: { min: -2.6, max: 2.6 },
        compute: (base, state) => {
          const tiltX = state.tilt?.x ?? 0;
          const tiltY = state.tilt?.y ?? 0;
          const fold = state.fold ?? 0;
          const glitch = state.glitch ?? 0;
          return base + (tiltX - tiltY) * 1.4 + fold * 1.0 + glitch * 0.65;
        }
      }
    ];
  }

  setBaseParameters(newBase = {}) {
    Object.keys(newBase).forEach((key) => {
      this.baseParameters[key] = newBase[key];
    });
    this.effectiveParameters = { ...this.baseParameters };
  }

  setBaseParameter(key, value) {
    if (key in this.baseParameters) {
      this.baseParameters[key] = value;
    }
  }

  setMappings(mappings) {
    if (Array.isArray(mappings) && mappings.length) {
      this.mappings = mappings;
    }
  }

  update() {
    const state = this.interactionProvider ? this.interactionProvider() : {};
    this.effectiveParameters = { ...this.baseParameters };

    this.mappings.forEach((mapping) => {
      const baseValue = this.baseParameters[mapping.target];
      if (baseValue === undefined) {
        return;
      }
      const value = mapping.compute(baseValue, state, this.baseParameters);
      const clamped = mapping.clamp
        ? clamp(value, mapping.clamp.min, mapping.clamp.max)
        : value;
      this.effectiveParameters[mapping.target] = clamped;
    });
  }

  getEffectiveParameters() {
    this.update();
    return { ...this.effectiveParameters };
  }
}

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

class HolographicBackdrop {
  constructor() {
    this.system = null;
    this.currentSection = null;
    this.currentParams = new Map();
    this.baseParameters = { ...DEFAULT_PARAMETER_STATE };
    this.interactionState = {
      tilt: { x: 0, y: 0, intensity: 0 },
      stage: { focus: 0.6, entry: 0, exit: 0, depth: 1 },
      fold: 0,
      glitch: 0
    };
    this.mapper = new ParameterMappingSystem(
      this.baseParameters,
      () => this.interactionState,
      ParameterMappingSystem.createBackdropMappings()
    );
    this.glitchTimestamp = 0;
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
      if (param in this.baseParameters) {
        this.baseParameters[param] = value;
        this.mapper.setBaseParameter(param, value);
      }
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
      this.baseParameters = {
        ...DEFAULT_PARAMETER_STATE,
        ...preset.parameters
      };
      this.mapper.setBaseParameters(this.baseParameters);
      this.interactionState.stage = { focus: 0.75, entry: 0, exit: 0, depth: 0.2 };
      this.syncParameters();
    }
  }

  updateTilt({ tiltX = 0, tiltY = 0, intensity = 0, rotation } = {}) {
    this.interactionState.tilt = { x: tiltX, y: tiltY, intensity: clamp(intensity, 0, 1.6) };
    if (rotation) {
      this.interactionState.tilt.rotation = rotation;
    }
    this.syncParameters();
  }

  transferExitEnergy(amount = 0) {
    const pulse = clamp(amount, 0, 1.6);
    if (pulse <= 0.001) {
      return;
    }
    this.interactionState.glitch = Math.min(1.6, Math.max(this.interactionState.glitch || 0, pulse));
    this.glitchTimestamp = typeof performance !== 'undefined' ? performance.now() : Date.now();
    this.syncParameters();
  }

  triggerHypercubeFold() {
    this.setStageState({ fold: 1 });
    this.syncParameters();
    setTimeout(() => {
      this.setStageState({ fold: 0, stage: { focus: 0.75, entry: 0, exit: 0, depth: 0.2 } });
      this.syncParameters();
    }, 900);
  }

  setStageState({ stage, fold } = {}) {
    if (stage) {
      this.interactionState.stage = { ...this.interactionState.stage, ...stage };
    }
    if (typeof fold === 'number') {
      this.interactionState.fold = clamp(fold, 0, 1.2);
    }
    this.syncParameters();
  }

  syncParameters() {
    if (!this.system) {
      return;
    }
    this.decayGlitch();
    const effective = this.mapper.getEffectiveParameters();
    Object.entries(effective).forEach(([param, value]) => {
      if (param === 'hue') {
        this.applyParameter(param, ((value % 360) + 360) % 360);
      } else if (param === 'saturation') {
        this.applyParameter(param, clamp(value, 0.35, 1.05));
      } else {
        this.applyParameter(param, value);
      }
    });
  }

  decayGlitch() {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (!this.glitchTimestamp) {
      this.glitchTimestamp = now;
      return;
    }
    const elapsed = Math.max(0, now - this.glitchTimestamp);
    if (elapsed > 0 && this.interactionState.glitch > 0) {
      this.interactionState.glitch *= Math.exp(-elapsed / 950);
      if (this.interactionState.glitch < 0.01) {
        this.interactionState.glitch = 0;
      }
    }
    this.glitchTimestamp = now;
  }
}

class CardVisualizer {
  constructor(card) {
    this.card = card;
    this.section = card.dataset.section || 'quantum';
    this.canvas = card.querySelector('canvas');
    const variant = SECTION_PRESETS[this.section]?.variant ?? 0;
    this.visualizer = this.canvas ? new HolographicVisualizer(this.canvas.id, 'content', 1.0, variant) : null;
    this.baseParams = {
      ...DEFAULT_PARAMETER_STATE,
      ...(SECTION_PRESETS[this.section]?.parameters || {})
    };
    this.interactionState = {
      tilt: { x: 0, y: 0, intensity: 0 },
      stage: { focus: 0, entry: 0, exit: 0, depth: 1 },
      hover: 0,
      click: 0,
      fold: 0,
      glitch: 0
    };
    this.mapper = new ParameterMappingSystem(this.baseParams, () => this.interactionState);
    this.stage = 'far-depth';
    this.hoverTimeout = null;
    this.glitchTimeout = null;
    this.glitchPulse = 0;

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
    this.mapper.setBaseParameters(this.baseParams);
    this.applyParameterSet(this.baseParams);
    this.applyDynamicModulation();
  }

  applyParameterSet(params = {}) {
    Object.entries(params).forEach(([param, value]) => this.handleParameter(param, value));
    this.mapper.setBaseParameters({ ...this.baseParams });
  }

  updateTilt(tiltX, tiltY, intensity) {
    const isFocused = this.stage === 'focused';
    const safeTiltX = isFocused ? tiltX : 0;
    const safeTiltY = isFocused ? tiltY : 0;
    const safeIntensity = clamp(isFocused ? intensity : 0, 0, 1.5);
    this.interactionState.tilt = {
      x: safeTiltX,
      y: safeTiltY,
      intensity: safeIntensity
    };
    this.card.style.setProperty('--card-tilt-x', safeTiltX.toFixed(4));
    this.card.style.setProperty('--card-tilt-y', safeTiltY.toFixed(4));
    this.card.style.setProperty('--card-tilt-strength', this.interactionState.tilt.intensity.toFixed(3));
    this.card.classList.toggle('card-tilt-active', isFocused && safeIntensity > 0.05);
  }

  transferExitEnergy(amount = 0) {
    const pulse = clamp(amount, 0, 1.6);
    if (pulse <= 0.001) {
      return;
    }
    this.interactionState.glitch = Math.min(1.6, Math.max(this.interactionState.glitch, pulse));
    this.glitchPulse = Math.min(1.6, this.glitchPulse + pulse * 0.85);
    this.card.classList.add('card-glitch-transfer');
    clearTimeout(this.glitchTimeout);
    this.glitchTimeout = setTimeout(() => {
      this.card.classList.remove('card-glitch-transfer');
    }, 620);
  }

  decayGlitchSignals() {
    if (this.interactionState.glitch > 0) {
      this.interactionState.glitch *= 0.94;
      if (this.interactionState.glitch < 0.01) {
        this.interactionState.glitch = 0;
      }
    }
    if (this.glitchPulse > 0) {
      this.glitchPulse *= 0.88;
      if (this.glitchPulse < 0.01) {
        this.glitchPulse = 0;
      }
    }
    this.card.style.setProperty('--card-glitch-intensity', this.interactionState.glitch.toFixed(3));
    this.card.style.setProperty('--card-glitch-pulse', this.glitchPulse.toFixed(3));
  }

  handleParameter(param, value) {
    if (!this.visualizer || value === undefined || Number.isNaN(value)) return;
    this.baseParams[param] = value;
    this.mapper.setBaseParameter(param, value);
    switch (param) {
      case 'gridDensity':
        this.visualizer.variantParams.density = 0.3 + (value - 5) / 95 * 2.2;
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
    this.decayGlitchSignals();
    const effective = this.mapper.getEffectiveParameters();
    const convertDensity = (value) => 0.3 + (clamp(value, 5, 110) - 5) / 95 * 2.2;

    this.visualizer.variantParams.density = convertDensity(effective.gridDensity ?? this.baseParams.gridDensity);
    this.visualizer.variantParams.speed = clamp(effective.speed ?? this.baseParams.speed, 0.05, 2.8);
    this.visualizer.variantParams.chaos = clamp(effective.chaos ?? this.baseParams.chaos, 0, 1.5);
    this.visualizer.variantParams.morph = clamp(effective.morphFactor ?? this.baseParams.morphFactor, 0.05, 2.5);
    this.visualizer.variantParams.intensity = clamp(effective.intensity ?? this.baseParams.intensity, 0.25, 1.8);
    this.visualizer.variantParams.hue = ((effective.hue ?? this.baseParams.hue) % 360 + 360) % 360;
    this.visualizer.variantParams.saturation = clamp(effective.saturation ?? this.baseParams.saturation, 0.35, 1.1);
    this.visualizer.variantParams.rot4dXW = clamp(effective.rot4dXW ?? 0, -3, 3);
    this.visualizer.variantParams.rot4dYW = clamp(effective.rot4dYW ?? 0, -3, 3);
    this.visualizer.variantParams.rot4dZW = clamp(effective.rot4dZW ?? 0, -3, 3);

    const stageState = this.interactionState.stage || {};
    const moireEnergy = clamp(
      (this.interactionState.glitch || 0) * 0.8 +
      (stageState.exit || 0) * 0.5 +
      (this.interactionState.tilt?.intensity || 0) * 0.3,
      0,
      1.6
    );
    this.card.style.setProperty('--card-moire-energy', moireEnergy.toFixed(3));
  }

  setStage(stage) {
    this.stage = stage;
    this.card.dataset.cardStage = stage;
    const stageState = {
      focus: stage === 'focused' ? 1 : stage === 'approaching' ? 0.6 : 0,
      entry: stage === 'approaching' ? 1 : 0,
      exit: stage === 'exiting' || stage === 'destroyed' ? 1 : 0,
      depth: stage === 'far-depth' ? 1 : stage === 'approaching' ? 0.4 : 0.15
    };
    this.interactionState.stage = stageState;
    const morphPhase =
      stage === 'focused'
        ? 0.9
        : stage === 'approaching'
        ? 0.55
        : stage === 'exiting'
        ? 1.25
        : stage === 'destroyed'
        ? 0.05
        : 0.18;
    this.card.style.setProperty('--card-morph-phase', morphPhase.toFixed(3));
    if (stage !== 'focused') {
      this.updateTilt(0, 0, 0);
      this.card.classList.remove('card-glitch-transfer');
    }
    this.card.classList.toggle('card-dissolving', stage === 'exiting' || stage === 'destroyed');
  }

  setHover(isHovered) {
    this.interactionState.hover = isHovered ? 1 : 0;
    this.card.classList.toggle('card-hovered', !!isHovered);
  }

  pulseClick() {
    this.interactionState.click = 1;
    this.card.classList.add('card-clicked');
    clearTimeout(this.hoverTimeout);
    this.hoverTimeout = setTimeout(() => {
      this.interactionState.click = 0;
      this.card.classList.remove('card-clicked');
    }, 420);
  }

  setFoldProgress(value) {
    this.interactionState.fold = clamp(value, 0, 1.2);
    this.card.style.setProperty('--card-fold-progress', this.interactionState.fold.toFixed(2));
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
    this.exitEnergy = 0;
    this.exitTimestamp = 0;
  }

  registerCards(cards = []) {
    this.cardVisualizers.clear();
    cards.forEach((card) => {
      if (!card) return;
      if (card.dataset.titleFrom) {
        card.style.setProperty('--section-title-from', card.dataset.titleFrom);
      }
      if (card.dataset.titleTo) {
        card.style.setProperty('--section-title-to', card.dataset.titleTo);
      }
      const visualizer = new CardVisualizer(card);
      visualizer.setStage(card.dataset.progressionState || 'far-depth');
      card.addEventListener('pointerenter', () => visualizer.setHover(true));
      card.addEventListener('pointerleave', () => visualizer.setHover(false));
      card.addEventListener('click', () => visualizer.pulseClick());
      this.cardVisualizers.set(card, visualizer);
    });
  }

  decayExitEnergy() {
    const now = performance.now();
    if (!this.exitTimestamp) {
      this.exitTimestamp = now;
      return this.exitEnergy;
    }
    const elapsed = Math.max(0, now - this.exitTimestamp);
    if (elapsed > 0) {
      this.exitEnergy *= Math.exp(-elapsed / 900);
      if (this.exitEnergy < 0.01) {
        this.exitEnergy = 0;
      }
    }
    this.exitTimestamp = now;
    return this.exitEnergy;
  }

  recordExitPulse(amount = 1) {
    const current = this.decayExitEnergy();
    this.exitEnergy = clamp(current + clamp(amount, 0, 1.6), 0, 1.6);
  }

  pullExitEnergy(fraction = 1) {
    const available = this.decayExitEnergy();
    if (available <= 0) {
      return 0;
    }
    const ratio = clamp(fraction, 0, 1);
    const amount = available * ratio;
    this.exitEnergy = Math.max(0, available - amount);
    if (this.exitEnergy < 0.01) {
      this.exitEnergy = 0;
    }
    return amount;
  }

  peekExitEnergy() {
    return this.decayExitEnergy();
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

    const sectionKey = card.dataset.section || 'quantum';
    this.background?.applyPreset(sectionKey);
    const visualizer = this.cardVisualizers.get(card);
    visualizer?.applyPreset();
    visualizer?.setStage('focused');
    const inherited = this.pullExitEnergy(0.6);
    if (inherited > 0.001) {
      visualizer?.transferExitEnergy(inherited);
      this.background?.transferExitEnergy(inherited * 0.75);
    }
    this.background?.setStageState({ stage: { focus: 1, entry: 0, exit: 0, depth: 0.05 } });

    if (window.userParameterState) {
      const presetParams = SECTION_PRESETS[sectionKey]?.parameters || {};
      Object.entries(presetParams).forEach(([param, value]) => {
        window.userParameterState[param] = value;
      });
    }
  }

  deactivate(card) {
    if (card) {
      card.dataset.visualizerActive = 'false';
      card.style.removeProperty('--card-visibility');
      const visualizer = this.cardVisualizers.get(card);
      visualizer?.setHover(false);
      if (card.dataset.progressionState !== 'destroyed') {
        visualizer?.setStage('far-depth');
      }
      if (this.activeCard === card) {
        this.activeCard = null;
        if (card.dataset.progressionState !== 'destroyed' && card.dataset.progressionState !== 'exiting') {
          this.background?.setStageState({ stage: { focus: 0, exit: 0, depth: 0.55 } });
        }
      }
    }
  }

  updateTilt(payload = {}) {
    const { tiltX = 0, tiltY = 0, intensity = 0, rotation } = payload;
    const root = document.documentElement;
    root.style.setProperty('--global-tilt-x', tiltX.toFixed(4));
    root.style.setProperty('--global-tilt-y', tiltY.toFixed(4));
    root.style.setProperty('--global-tilt-strength', intensity.toFixed(3));

    const exitEcho = this.peekExitEnergy();
    if (this.activeCard) {
      const visualizer = this.cardVisualizers.get(this.activeCard);
      visualizer?.updateTilt(tiltX, tiltY, intensity);
      if (exitEcho > 0.01 && intensity > 0.05) {
        const transferred = this.pullExitEnergy(Math.min(0.35 + intensity * 0.4, 0.85));
        if (transferred > 0.001) {
          visualizer?.transferExitEnergy(transferred);
          this.background?.transferExitEnergy(transferred * 0.85);
        }
      }
    } else if (exitEcho > 0.01) {
      const bleed = this.pullExitEnergy(0.2);
      if (bleed > 0.001) {
        this.background?.transferExitEnergy(bleed);
      }
    }

    this.background?.updateTilt({ tiltX, tiltY, intensity, rotation });
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
      const visualizer = this.cardVisualizers.get(card);
      visualizer?.setStage('exiting');
      this.recordExitPulse(1);
      const immediate = Math.min(this.exitEnergy, 0.45);
      if (immediate > 0.001) {
        visualizer?.transferExitEnergy(immediate * 0.35);
        this.background?.transferExitEnergy(immediate * 0.5);
      }
      this.background?.setStageState({ stage: { exit: 1, focus: 0 } });
    }
  }

  triggerHypercubeFold(nextCard, onComplete) {
    if (this.container) {
      this.container.classList.add('hypercube-folding');
    }
    this.background?.triggerHypercubeFold();
    this.setFoldProgress(1);
    setTimeout(() => {
      if (this.container) {
        this.container.classList.remove('hypercube-folding');
      }
      this.setFoldProgress(0);
      if (typeof onComplete === 'function') {
        onComplete();
      }
    }, 900);
  }

  updateStage(card, state) {
    const visualizer = this.cardVisualizers.get(card);
    visualizer?.setStage(state);
    if (state === 'exiting' || state === 'destroyed') {
      this.recordExitPulse(state === 'destroyed' ? 0.8 : 0.4);
    }
    if (card === this.activeCard && state === 'focused') {
      this.background?.setStageState({ stage: { focus: 1, exit: 0, entry: 0, depth: 0.05 } });
    } else if (card === this.activeCard && state === 'approaching') {
      this.background?.setStageState({ stage: { focus: 0.4, entry: 0.8, exit: 0, depth: 0.18 } });
    } else if (card === this.activeCard && (state === 'exiting' || state === 'destroyed')) {
      this.background?.setStageState({ stage: { focus: 0, entry: 0, exit: 1, depth: 0 } });
    } else if (card === this.activeCard && state === 'far-depth') {
      this.background?.setStageState({ stage: { focus: 0, exit: 0, depth: 0.6 } });
    }
  }

  setFoldProgress(value) {
    this.cardVisualizers.forEach((visualizer) => visualizer.setFoldProgress(value));
  }
}

class PointerTiltController {
  constructor({ onUpdate, indicator, getActiveCard } = {}) {
    this.onUpdate = typeof onUpdate === 'function' ? onUpdate : null;
    this.indicator = indicator || null;
    this.getActiveCard = typeof getActiveCard === 'function' ? getActiveCard : null;
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
    let tiltX;
    let tiltY;
    const activeCard = this.getActiveCard ? this.getActiveCard() : null;
    if (activeCard) {
      const rect = activeCard.getBoundingClientRect();
      const relativeX = (event.clientX - rect.left) / rect.width - 0.5;
      const relativeY = (event.clientY - rect.top) / rect.height - 0.5;
      tiltX = clamp(relativeX * 1.6, -1, 1);
      tiltY = clamp(-relativeY * 1.6, -1, 1);
    } else {
      const { innerWidth, innerHeight } = window;
      const x = (event.clientX / innerWidth - 0.5) * 1.4;
      const y = (event.clientY / innerHeight - 0.5) * 1.4;
      tiltX = clamp(x, -0.9, 0.9);
      tiltY = clamp(-y, -0.9, 0.9);
    }
    const intensity = clamp(Math.sqrt(tiltX * tiltX + tiltY * tiltY) * 1.05, 0, 1.5);
    const payload = {
      tiltX,
      tiltY,
      intensity,
      source: 'pointer',
      extreme: intensity > 1.05,
      pointer: {
        x: event.clientX / window.innerWidth,
        y: event.clientY / window.innerHeight
      }
    };
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
    const { viewingAngle4D, windowDepth, tiltIntensity, extremeTilt } = windowData;
    if (window.updateParameter) {
      window.updateParameter('rot4dXW', viewingAngle4D.rot4dXW);
      window.updateParameter('rot4dYW', viewingAngle4D.rot4dYW);
      window.updateParameter('rot4dZW', viewingAngle4D.rot4dZW);
      window.updateParameter('dimension', windowDepth.dimension);
      window.updateParameter('morphFactor', windowDepth.morphFactor);
      window.updateParameter('chaos', windowDepth.chaos);
      window.updateParameter('intensity', windowDepth.intensity);
      window.updateParameter('gridDensity', windowDepth.gridDensity);
    }
    document.body.classList.toggle('extreme-tilt', extremeTilt);
    document.body.classList.toggle('geometric-tilt-active', tiltIntensity > 0.1);
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
      indicator: this.indicator,
      getActiveCard: () => this.sectionChoreographer.activeCard
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
    this.sectionChoreographer.pulseExit(currentCard);
    this.setCardState(currentCard, 'exiting');
    this.sectionChoreographer.deactivate(currentCard);

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
    this.sectionChoreographer.updateStage(card, state);

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
    this.sectionChoreographer.deactivate(card);

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
