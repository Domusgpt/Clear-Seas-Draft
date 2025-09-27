/**
 * VIB34D GEOMETRIC TILT SYSTEM
 * Device orientation controls 4D rotation parameters for professional visualization
 * Based on vib34d-ultimate-viewer geometric tilt implementation
 * A Paul Phillips Manifestation - Paul@clearseassolutions.com
 */

const ORTHOGONAL_REACTIVE_PROFILES = {
    'quantum-hyperglass': {
        system: 'quantum',
        hueOffset: 26,
        accentOffset: -18,
        baseSpeedScale: 1.12,
        baseDensityShift: -0.12,
        baseMoireShift: 0.18,
        geometryCycle: ['hypercube', 'wave', 'lattice', 'klein'],
        traitAmplify: { hue: 1.1, glitch: 1.2, energy: 1.05 },
        transferGifts: [
            { resonance: 'moire', value: 0.32 },
            { resonance: 'density', value: -0.22 },
            { resonance: 'glitch', value: 0.38 }
        ],
        portal: { ringMultiplier: 1.25, burst: 1.18, twist: 0.22 },
        portalVariant: 'spiral'
    },
    'holo-ribbon-surge': {
        system: 'holographic',
        hueOffset: -12,
        accentOffset: 34,
        baseSpeedScale: 1.24,
        baseDensityShift: -0.18,
        baseMoireShift: 0.26,
        geometryCycle: ['ribbon', 'torus', 'klein', 'shell'],
        traitAmplify: { hue: 1.05, glitch: 1.28, energy: 1.18 },
        transferGifts: [
            { resonance: 'glow', value: 0.4 },
            { resonance: 'moire', value: 0.38 },
            { resonance: 'speed', value: 0.35 }
        ],
        portal: { ringMultiplier: 1.18, burst: 1.25, twist: 0.32 },
        portalVariant: 'filament'
    },
    'faceted-orbital-forge': {
        system: 'faceted',
        hueOffset: 8,
        accentOffset: 42,
        baseSpeedScale: 1.08,
        baseDensityShift: -0.08,
        baseMoireShift: 0.2,
        geometryCycle: ['polytope', 'orbital', 'lattice', 'strata'],
        traitAmplify: { hue: 1.2, glitch: 1.1, energy: 1.15 },
        transferGifts: [
            { resonance: 'facet', value: 0.42 },
            { resonance: 'density', value: -0.18 },
            { resonance: 'glitch', value: 0.28 }
        ],
        portal: { ringMultiplier: 1.12, burst: 1.14, twist: 0.18 },
        portalVariant: 'prism'
    },
    'neural-lumen-exchange': {
        system: 'quantum',
        hueOffset: -34,
        accentOffset: -12,
        baseSpeedScale: 1.3,
        baseDensityShift: -0.16,
        baseMoireShift: 0.22,
        geometryCycle: ['crystal', 'wave', 'neuron', 'lattice'],
        traitAmplify: { hue: 1.08, glitch: 1.22, energy: 1.25 },
        transferGifts: [
            { resonance: 'signal', value: 0.36 },
            { resonance: 'moire', value: 0.34 },
            { resonance: 'density', value: -0.2 }
        ],
        portal: { ringMultiplier: 1.28, burst: 1.3, twist: 0.28 },
        portalVariant: 'axon'
    }
};

if (!window.ORTHOGONAL_REACTIVE_PROFILES) {
    window.ORTHOGONAL_REACTIVE_PROFILES = ORTHOGONAL_REACTIVE_PROFILES;
} else {
    window.ORTHOGONAL_REACTIVE_PROFILES = {
        ...ORTHOGONAL_REACTIVE_PROFILES,
        ...window.ORTHOGONAL_REACTIVE_PROFILES
    };
}

class VIB34DGeometricTiltSystem {
    constructor() {
        this.isEnabled = false;
        this.hasPermission = false;
        this.tiltData = {
            alpha: 0,    // Z-axis rotation (compass)
            beta: 0,     // X-axis rotation (front-to-back tilt)
            gamma: 0     // Y-axis rotation (left-to-right tilt)
        };

        // VIB34D 4D rotation mapping
        this.rotation4D = {
            rot4dXW: 0.0,
            rot4dYW: 0.0,
            rot4dZW: 0.0
        };

        // Tilt sensitivity and smoothing
        this.sensitivity = {
            rot4dXW: 0.02,  // Beta (front-back) -> 4D X-W rotation
            rot4dYW: 0.02,  // Gamma (left-right) -> 4D Y-W rotation
            rot4dZW: 0.01   // Alpha (compass) -> 4D Z-W rotation
        };

        this.smoothing = 0.15;
        this.visualizers = new Map();
        this.isSupported = this.checkDeviceOrientationSupport();

        this.init();
    }

    checkDeviceOrientationSupport() {
        return 'DeviceOrientationEvent' in window &&
               'DeviceMotionEvent' in window;
    }

    async init() {
        console.log('🎯 Initializing VIB34D Geometric Tilt System...');

        if (!this.isSupported) {
            console.warn('⚠️ Device orientation not supported on this device');
            this.createFallbackSystem();
            return;
        }

        // Request permission for iOS 13+
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                const permission = await DeviceOrientationEvent.requestPermission();
                this.hasPermission = permission === 'granted';
                console.log('📱 Device orientation permission:', permission);
            } catch (error) {
                console.warn('⚠️ Permission request failed:', error);
                this.createFallbackSystem();
                return;
            }
        } else {
            this.hasPermission = true;
        }

        this.setupTiltListeners();
        this.findTiltCanvases();
        console.log('✅ VIB34D Geometric Tilt System initialized');
    }

    setupTiltListeners() {
        // Device orientation event for tilt data
        window.addEventListener('deviceorientation', (event) => {
            if (!this.isEnabled) return;

            this.updateTiltData(event);
            this.calculateVIB34DRotation();
            this.updateVisualizers();
            this.updateTiltUI();
        });

        // Fallback: Mouse movement for desktop testing
        if (!this.isSupported) {
            window.addEventListener('mousemove', (event) => {
                if (!this.isEnabled) return;
                this.simulateTiltFromMouse(event);
            });
        }
    }

    updateTiltData(event) {
        // Smooth the tilt data to prevent jitter
        this.tiltData.alpha += (event.alpha - this.tiltData.alpha) * this.smoothing;
        this.tiltData.beta += (event.beta - this.tiltData.beta) * this.smoothing;
        this.tiltData.gamma += (event.gamma - this.tiltData.gamma) * this.smoothing;

        // Clamp values to reasonable ranges
        this.tiltData.alpha = this.clampAngle(this.tiltData.alpha);
        this.tiltData.beta = this.clampAngle(this.tiltData.beta, -90, 90);
        this.tiltData.gamma = this.clampAngle(this.tiltData.gamma, -90, 90);
    }

    calculateVIB34DRotation() {
        // Map device tilt to VIB34D 4D rotation parameters
        // Following Paul Phillips' parameter ranges: rot4dXW/YW/ZW: -2.0 to 2.0

        // Beta (front-back tilt) controls X-W plane rotation
        this.rotation4D.rot4dXW = (this.tiltData.beta / 90) * 2.0 * this.sensitivity.rot4dXW;

        // Gamma (left-right tilt) controls Y-W plane rotation
        this.rotation4D.rot4dYW = (this.tiltData.gamma / 90) * 2.0 * this.sensitivity.rot4dYW;

        // Alpha (compass rotation) controls Z-W plane rotation
        this.rotation4D.rot4dZW = (this.tiltData.alpha / 180) * 2.0 * this.sensitivity.rot4dZW;

        // Clamp to VIB34D parameter ranges
        this.rotation4D.rot4dXW = Math.max(-2.0, Math.min(2.0, this.rotation4D.rot4dXW));
        this.rotation4D.rot4dYW = Math.max(-2.0, Math.min(2.0, this.rotation4D.rot4dYW));
        this.rotation4D.rot4dZW = Math.max(-2.0, Math.min(2.0, this.rotation4D.rot4dZW));
    }

    simulateTiltFromMouse(event) {
        // Desktop fallback: simulate tilt from mouse position
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        const deltaX = (event.clientX - centerX) / centerX;
        const deltaY = (event.clientY - centerY) / centerY;

        this.tiltData.gamma = deltaX * 45; // Left-right
        this.tiltData.beta = deltaY * 45;  // Up-down
        this.tiltData.alpha += 0.5;       // Slow rotation

        this.calculateVIB34DRotation();
        this.updateVisualizers();
        this.updateTiltUI();
    }

    findTiltCanvases() {
        // Find all VIB34D tilt canvases and create visualizers
        const tiltCanvases = document.querySelectorAll('.vib34d-tilt-canvas');

        tiltCanvases.forEach(canvas => {
            const card = canvas.closest('[data-vib34d]');
            if (card) {
                const systemType = card.dataset.vib34d;
                const profileKey = card.dataset.reactiveProfile || null;
                const portalVariant = card.dataset.portalVariant || null;
                const dataset = Object.assign({}, card.dataset);
                this.createTiltVisualizer(canvas, systemType, {
                    profileKey,
                    portalVariant,
                    cardDataset: dataset
                });
            }
        });

        console.log(`🎨 Created ${this.visualizers.size} VIB34D tilt visualizers`);
    }

    createTiltVisualizer(canvas, systemType, options = {}) {
        const visualizer = new VIB34DTiltVisualizer(canvas, systemType, options);
        this.visualizers.set(canvas.id, visualizer);
        canvas.vib34dVisualizer = visualizer;
    }

    updateVisualizers() {
        // Update all VIB34D visualizers with current 4D rotation
        this.visualizers.forEach(visualizer => {
            visualizer.updateRotation4D(this.rotation4D);
        });

        // Also update global VIB34D system if available
        if (window.updateParameter) {
            window.updateParameter('rot4dXW', this.rotation4D.rot4dXW);
            window.updateParameter('rot4dYW', this.rotation4D.rot4dYW);
            window.updateParameter('rot4dZW', this.rotation4D.rot4dZW);
        }
    }

    updateTiltUI() {
        // Update tilt indicator UI
        const tiltX = document.getElementById('tilt-x');
        const tiltY = document.getElementById('tilt-y');
        const rot4d = document.getElementById('rot4d');

        if (tiltX) tiltX.textContent = this.tiltData.beta.toFixed(1);
        if (tiltY) tiltY.textContent = this.tiltData.gamma.toFixed(1);
        if (rot4d) rot4d.textContent = this.isEnabled ? 'Active' : 'Inactive';
    }

    clampAngle(angle, min = -180, max = 180) {
        if (angle === null || angle === undefined) return 0;
        return Math.max(min, Math.min(max, angle));
    }

    createFallbackSystem() {
        console.log('🖱️ Creating mouse-based fallback tilt system');
        this.isSupported = true; // Enable mouse fallback
        this.hasPermission = true;
        this.setupTiltListeners();
        this.findTiltCanvases();
    }

    enable() {
        this.isEnabled = true;
        console.log('✅ VIB34D Geometric Tilt System ENABLED');
    }

    disable() {
        this.isEnabled = false;
        console.log('⏸️ VIB34D Geometric Tilt System DISABLED');
    }

    toggle() {
        this.isEnabled ? this.disable() : this.enable();
        return this.isEnabled;
    }

    setSensitivity(rot4dXW, rot4dYW, rot4dZW) {
        this.sensitivity.rot4dXW = rot4dXW;
        this.sensitivity.rot4dYW = rot4dYW;
        this.sensitivity.rot4dZW = rot4dZW;
        console.log('🎛️ Tilt sensitivity updated:', this.sensitivity);
    }

    getCurrentRotation4D() {
        return { ...this.rotation4D };
    }

    destroy() {
        this.visualizers.forEach(visualizer => visualizer.destroy());
        this.visualizers.clear();
        this.isEnabled = false;
        console.log('🗑️ VIB34D Geometric Tilt System destroyed');
    }
}

/**
 * VIB34D TILT VISUALIZER
 * Individual canvas visualizer that responds to geometric tilt
 */
class VIB34DTiltVisualizer {
    constructor(canvas, systemType, options = {}) {
        this.canvas = canvas;
        this.systemType = systemType;
        this.context = null;
        this.resizeObserver = null;
        this.rotation4D = { rot4dXW: 0, rot4dYW: 0, rot4dZW: 0 };

        this.profileKey = options.profileKey || null;
        this.profile = this.resolveProfile(systemType, this.profileKey);
        this.presets = this.applyProfileToPreset(this.getSystemPreset(systemType), this.profile);
        this.state = {
            speed: this.presets.baseSpeed,
            glitch: this.presets.baseGlitch,
            density: this.presets.baseDensity,
            moire: this.presets.baseMoire,
            hue: this.presets.baseHue,
            accentHue: this.presets.accentHue,
            energy: 0.35,
            geometryVariant: this.presets.geometryCycle[0]
        };
        this.targetState = { ...this.state };

        this.variantIndex = 0;
        this.traitIndex = 0;
        this.transferCycleIndex = 0;
        this.hasBeenFocused = false;

        this.destruction = null;
        this.traitFlourish = null;
        this.interactionPulse = { active: false, start: 0, duration: 720, magnitude: 0 };
        this.pulseStrength = 0;

        this.lastTimestamp = performance.now();
        this.time = 0;

        this.init();
    }

    init() {
        this.setupCanvas();
        this.startRenderLoop();
    }

    setupCanvas() {
        this.context = this.canvas.getContext('2d');
        this.resizeCanvas();

        this.resizeObserver = new ResizeObserver(() => {
            this.resizeCanvas();
        });
        this.resizeObserver.observe(this.canvas);
    }

    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;

        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.scale(dpr, dpr);
    }

    getSystemPreset(systemType) {
        const presets = {
            quantum: {
                baseHue: 278,
                accentHue: 210,
                baseSpeed: 1.15,
                baseGlitch: 0.35,
                baseDensity: 0.95,
                baseMoire: 0.35,
                geometryCycle: ['hypercube', 'wave', 'crystal', 'lattice'],
                trait: {
                    hueShiftStep: 38,
                    accentShiftStep: 24,
                    moireBoost: 0.25,
                    glitchBoost: 0.35,
                    energyBoost: 0.3
                }
            },
            holographic: {
                baseHue: 330,
                accentHue: 180,
                baseSpeed: 1.25,
                baseGlitch: 0.4,
                baseDensity: 0.85,
                baseMoire: 0.45,
                geometryCycle: ['torus', 'klein', 'ribbon', 'shell'],
                trait: {
                    hueShiftStep: 28,
                    accentShiftStep: 18,
                    moireBoost: 0.22,
                    glitchBoost: 0.32,
                    energyBoost: 0.28
                }
            },
            faceted: {
                baseHue: 202,
                accentHue: 150,
                baseSpeed: 0.95,
                baseGlitch: 0.25,
                baseDensity: 1.05,
                baseMoire: 0.28,
                geometryCycle: ['prism', 'polytope', 'lattice'],
                trait: {
                    hueShiftStep: 32,
                    accentShiftStep: 20,
                    moireBoost: 0.18,
                    glitchBoost: 0.28,
                    energyBoost: 0.26
                }
            }
        };

        return presets[systemType] || presets.faceted;
    }

    resolveProfile(systemType, profileKey) {
        const library = window.ORTHOGONAL_REACTIVE_PROFILES || {};
        if (profileKey && library[profileKey]) {
            return { key: profileKey, ...library[profileKey] };
        }

        const matchKey = Object.keys(library).find((key) => library[key].system === systemType);
        if (matchKey) {
            return { key: matchKey, ...library[matchKey] };
        }

        return null;
    }

    applyProfileToPreset(preset, profile) {
        if (!profile) {
            return { ...preset };
        }

        const merged = {
            ...preset,
            trait: { ...preset.trait }
        };

        if (Array.isArray(profile.geometryCycle) && profile.geometryCycle.length) {
            merged.geometryCycle = profile.geometryCycle.slice();
        }

        if (profile.hueOffset) {
            merged.baseHue = this.normalizeHue(preset.baseHue + profile.hueOffset);
        }

        if (profile.accentOffset) {
            merged.accentHue = this.normalizeHue((preset.accentHue || preset.baseHue) + profile.accentOffset);
        }

        if (profile.baseSpeedScale) {
            merged.baseSpeed = preset.baseSpeed * profile.baseSpeedScale;
        }

        if (profile.baseDensityShift) {
            merged.baseDensity = preset.baseDensity + profile.baseDensityShift;
        }

        if (profile.baseMoireShift) {
            merged.baseMoire = preset.baseMoire + profile.baseMoireShift;
        }

        if (profile.traitAmplify) {
            Object.keys(profile.traitAmplify).forEach((key) => {
                switch (key) {
                    case 'hue':
                        merged.trait.hueShiftStep *= profile.traitAmplify[key];
                        merged.trait.accentShiftStep *= profile.traitAmplify[key];
                        break;
                    case 'glitch':
                        merged.trait.glitchBoost *= profile.traitAmplify[key];
                        break;
                    case 'energy':
                        merged.trait.energyBoost *= profile.traitAmplify[key];
                        break;
                    case 'moire':
                        merged.trait.moireBoost *= profile.traitAmplify[key];
                        break;
                    case 'density':
                        merged.baseDensity += profile.traitAmplify[key];
                        break;
                }
            });
        }

        return merged;
    }

    updateRotation4D(rotation4D) {
        this.rotation4D = { ...rotation4D };
    }

    startRenderLoop() {
        const render = () => {
            this.renderVIB34DVisualization();
            requestAnimationFrame(render);
        };
        render();
    }

    renderVIB34DVisualization() {
        const ctx = this.context;
        if (!ctx) return;

        const width = this.canvas.width / (window.devicePixelRatio || 1);
        const height = this.canvas.height / (window.devicePixelRatio || 1);

        const now = performance.now();
        const delta = (now - this.lastTimestamp) / 1000;
        this.lastTimestamp = now;

        this.updateDynamicState(delta);

        ctx.clearRect(0, 0, width, height);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        this.renderTiltResponsiveGeometry(ctx, width, height, this.time);

        if (this.traitFlourish && this.traitFlourish.active) {
            this.renderTraitFlourish(ctx, width, height);
        }

        if (this.destruction && this.destruction.active) {
            this.renderDestructionChoreography(ctx, width, height);
        }

        ctx.restore();
    }

    updateDynamicState(delta) {
        const lerp = (current, target, factor) => current + (target - current) * factor;
        const factor = Math.min(1, delta * 3.5);

        this.state.speed = this.clamp(lerp(this.state.speed, this.targetState.speed, factor), 0.15, 4.0);
        this.state.glitch = this.clamp(lerp(this.state.glitch, this.targetState.glitch, factor), 0, 2.5);
        this.state.density = this.clamp(lerp(this.state.density, this.targetState.density, factor), 0.2, 1.8);
        this.state.moire = this.clamp(lerp(this.state.moire, this.targetState.moire, factor), 0, 2.0);
        this.state.hue = lerp(this.state.hue, this.targetState.hue, factor);
        this.state.accentHue = lerp(this.state.accentHue, this.targetState.accentHue, factor);
        this.state.energy = this.clamp(lerp(this.state.energy, this.targetState.energy, factor), 0, 2.0);
        this.state.geometryVariant = this.targetState.geometryVariant;

        this.time += delta * this.state.speed;

        if (this.interactionPulse && this.interactionPulse.active) {
            const elapsed = performance.now() - this.interactionPulse.start;
            const progress = elapsed / this.interactionPulse.duration;
            if (progress >= 1) {
                this.interactionPulse.active = false;
                this.pulseStrength = 0;
            } else {
                this.pulseStrength = Math.sin(progress * Math.PI) * this.interactionPulse.magnitude;
            }
        } else {
            this.pulseStrength *= Math.max(0, 1 - delta * 1.5);
        }

        if (this.destruction && this.destruction.active) {
            const progress = (performance.now() - this.destruction.start) / this.destruction.duration;
            if (progress >= 1) {
                this.destruction.active = false;
            }
        }

        if (this.traitFlourish && this.traitFlourish.active) {
            const progress = (performance.now() - this.traitFlourish.start) / this.traitFlourish.duration;
            if (progress >= 1) {
                this.traitFlourish.active = false;
            }
        }
    }

    applyInteractionResponse(options = {}) {
        const {
            intensity = 0.45,
            polarity = 1,
            hueSpin = 0,
            densityBias = 0,
            geometryAdvance = 0,
            duration = 720
        } = options;

        const clamped = this.clamp(intensity, 0, 2.4);
        const polaritySign = polarity >= 0 ? 1 : -1;

        this.targetState.speed += clamped * 0.35;
        this.targetState.glitch += clamped * 0.4;
        this.targetState.energy += clamped * 0.5;
        this.targetState.moire += clamped * 0.3 * polaritySign;

        if (densityBias !== 0) {
            this.targetState.density += clamped * densityBias * 0.25;
        } else {
            this.targetState.density += clamped * (polaritySign > 0 ? -0.18 : 0.18);
        }

        if (hueSpin) {
            this.targetState.hue += hueSpin * 14;
            this.targetState.accentHue += hueSpin * 9;
        }

        if (geometryAdvance !== 0 && this.presets.geometryCycle.length > 1) {
            const advance = geometryAdvance > 0 ? 1 : -1;
            const nextIndex = (this.variantIndex + advance + this.presets.geometryCycle.length) % this.presets.geometryCycle.length;
            this.variantIndex = nextIndex;
            this.targetState.geometryVariant = this.presets.geometryCycle[nextIndex];
        }

        this.interactionPulse = {
            active: true,
            start: performance.now(),
            duration,
            magnitude: Math.min(1.8, clamped * 0.9 + Math.abs(polarity) * 0.2)
        };
    }

    releaseInteraction() {
        this.interactionPulse = {
            active: true,
            start: performance.now(),
            duration: 820,
            magnitude: Math.max(0.18, this.pulseStrength * 0.6)
        };

        this.targetState.speed = Math.max(this.presets.baseSpeed, this.targetState.speed * 0.9);
        this.targetState.glitch = Math.max(this.presets.baseGlitch * 0.6, this.targetState.glitch * 0.88);
        this.targetState.moire = Math.max(this.presets.baseMoire * 0.5, this.targetState.moire * 0.9);
        this.targetState.energy = Math.max(0.35, this.targetState.energy * 0.92);
    }

    setCardState(state, options = {}) {
        const inheritedTrait = options.inheritedTrait;

        if (inheritedTrait) {
            this.applyInheritedTrait(inheritedTrait);
        }

        switch (state) {
            case 'far-depth':
                this.targetState.speed = this.presets.baseSpeed * 0.6;
                this.targetState.glitch = this.presets.baseGlitch * 0.45;
                this.targetState.density = this.presets.baseDensity * 1.25;
                this.targetState.moire = this.presets.baseMoire * 0.4;
                this.targetState.energy = 0.2;
                break;
            case 'approaching':
                this.targetState.speed = this.presets.baseSpeed * 1.1;
                this.targetState.glitch = this.presets.baseGlitch * 0.8;
                this.targetState.density = this.presets.baseDensity * 0.85;
                this.targetState.moire = this.presets.baseMoire * 0.7;
                this.targetState.energy = 0.65;
                break;
            case 'focused':
                this.targetState.speed = this.presets.baseSpeed * 1.75;
                this.targetState.glitch = this.presets.baseGlitch * 1.4 + 0.2;
                this.targetState.density = this.presets.baseDensity * 0.6;
                this.targetState.moire = this.presets.baseMoire * 1.3 + 0.1;
                this.targetState.energy = 1.05;

                if (!inheritedTrait || !inheritedTrait.geometryVariant) {
                    if (!this.hasBeenFocused) {
                        this.hasBeenFocused = true;
                        this.targetState.geometryVariant = this.presets.geometryCycle[this.variantIndex];
                    } else {
                        this.variantIndex = (this.variantIndex + 1) % this.presets.geometryCycle.length;
                        this.targetState.geometryVariant = this.presets.geometryCycle[this.variantIndex];
                    }
                }
                break;
            case 'exiting':
                this.targetState.speed = this.presets.baseSpeed * 1.35;
                this.targetState.glitch = this.presets.baseGlitch * 1.1;
                this.targetState.density = this.presets.baseDensity * 0.75;
                this.targetState.moire = this.presets.baseMoire * 0.9;
                this.targetState.energy = 0.5;
                break;
            case 'destroyed':
                this.targetState.speed = this.presets.baseSpeed * 2.1;
                this.targetState.glitch = this.presets.baseGlitch * 1.9 + 0.4;
                this.targetState.density = this.presets.baseDensity * 0.35;
                this.targetState.moire = this.presets.baseMoire * 1.6 + 0.2;
                this.targetState.energy = 1.2;
                break;
        }
    }

    applyInheritedTrait(trait, options = {}) {
        if (!trait) return;

        const immediate = options.immediate || false;

        if (typeof trait.hueShift === 'number') {
            this.targetState.hue = this.presets.baseHue + trait.hueShift;
        }

        if (typeof trait.accentShift === 'number') {
            this.targetState.accentHue = this.presets.accentHue + trait.accentShift;
        }

        if (typeof trait.moireBoost === 'number') {
            this.targetState.moire += trait.moireBoost;
        }

        if (typeof trait.glitchBoost === 'number') {
            this.targetState.glitch += trait.glitchBoost;
        }

        if (typeof trait.energyBoost === 'number') {
            this.targetState.energy += trait.energyBoost;
        }

        if (typeof trait.densityShift === 'number') {
            this.targetState.density += trait.densityShift;
        }

        if (typeof trait.speedBoost === 'number') {
            this.targetState.speed += trait.speedBoost;
        }

        if (trait.gift && trait.gift.resonance) {
            switch (trait.gift.resonance) {
                case 'glow':
                case 'facet':
                    this.targetState.moire += (trait.gift.value || 0) * 0.45;
                    this.targetState.energy += (trait.gift.value || 0) * 0.35;
                    break;
                case 'signal':
                    this.targetState.glitch += (trait.gift.value || 0) * 0.5;
                    this.targetState.moire += (trait.gift.value || 0) * 0.25;
                    break;
                case 'density':
                    this.targetState.density += trait.gift.value || 0;
                    break;
                case 'speed':
                    this.targetState.speed += (trait.gift.value || 0) * 0.5;
                    break;
                default:
                    this.targetState.moire += (trait.gift.value || 0) * 0.4;
                    break;
            }
        }

        if (trait.geometryVariant) {
            this.targetState.geometryVariant = trait.geometryVariant;
            const index = this.presets.geometryCycle.indexOf(trait.geometryVariant);
            if (index >= 0) {
                this.variantIndex = index;
            }
        }

        this.traitFlourish = {
            active: true,
            start: performance.now(),
            duration: 1200,
            trait
        };

        if (immediate) {
            Object.keys(this.targetState).forEach((key) => {
                this.state[key] = this.targetState[key];
            });
        }
    }

    generateDestructionTrait() {
        const cycleLength = this.presets.geometryCycle.length;
        const geometryVariant = this.presets.geometryCycle[(this.traitIndex + 1) % cycleLength];

        const trait = {
            geometryVariant,
            hueShift: this.presets.trait.hueShiftStep * (this.traitIndex + 1),
            accentShift: this.presets.trait.accentShiftStep * (this.traitIndex + 1),
            moireBoost: this.presets.trait.moireBoost + 0.08 * this.traitIndex,
            glitchBoost: this.presets.trait.glitchBoost + 0.07 * this.traitIndex,
            energyBoost: this.presets.trait.energyBoost + 0.05 * this.traitIndex
        };

        const giftCycle = this.profile && Array.isArray(this.profile.transferGifts)
            ? this.profile.transferGifts
            : [];

        if (giftCycle.length > 0) {
            const gift = giftCycle[this.transferCycleIndex % giftCycle.length];
            trait.gift = { ...gift };
            this.transferCycleIndex = (this.transferCycleIndex + 1) % giftCycle.length;

            switch (gift.resonance) {
                case 'density':
                    trait.densityShift = gift.value;
                    break;
                case 'glow':
                case 'facet':
                case 'signal':
                    trait.energyBoost += gift.value * 0.6;
                    break;
                case 'speed':
                    trait.speedBoost = gift.value;
                    break;
                default:
                    trait.moireBoost += gift.value * 0.4;
                    break;
            }
        }

        this.traitIndex = (this.traitIndex + 1) % cycleLength;

        return trait;
    }

    triggerDestructionSequence() {
        const trait = this.generateDestructionTrait();

        this.destruction = {
            active: true,
            start: performance.now(),
            duration: 1400,
            trait
        };

        this.targetState.hue = this.presets.baseHue + trait.hueShift;
        this.targetState.accentHue = this.presets.accentHue + trait.accentShift;
        this.targetState.glitch += trait.glitchBoost * 0.5;
        this.targetState.moire += trait.moireBoost * 0.5;
        this.targetState.energy += trait.energyBoost * 0.5;
        if (typeof trait.densityShift === 'number') {
            this.targetState.density += trait.densityShift * 0.5;
        }
        if (typeof trait.speedBoost === 'number') {
            this.targetState.speed += trait.speedBoost * 0.4;
        }

        return trait;
    }

    renderTiltResponsiveGeometry(ctx, width, height, time) {
        const centerX = width / 2;
        const centerY = height / 2;

        const rotX = this.rotation4D.rot4dXW;
        const rotY = this.rotation4D.rot4dYW;
        const rotZ = this.rotation4D.rot4dZW;

        const hue = this.state.hue;
        const accentHue = this.state.accentHue;
        const energy = this.state.energy * (1 + this.pulseStrength * 0.55);
        const glitch = this.state.glitch * (1 + this.pulseStrength * 0.35);
        const density = this.state.density * (1 - this.pulseStrength * 0.22);
        const moire = this.state.moire * (1 + this.pulseStrength * 0.4);

        const state = {
            hue,
            accentHue,
            energy,
            glitch,
            density,
            variant: this.state.geometryVariant,
            moire
        };

        switch (this.systemType) {
            case 'quantum':
                this.renderQuantumTiltPattern(ctx, centerX, centerY, rotX, rotY, rotZ, time, state);
                break;
            case 'holographic':
                this.renderHolographicTiltPattern(ctx, centerX, centerY, rotX, rotY, rotZ, time, state);
                break;
            case 'faceted':
            default:
                this.renderFacetedTiltPattern(ctx, centerX, centerY, rotX, rotY, rotZ, time, state);
                break;
        }

        this.renderMoireOverlay(ctx, centerX, centerY, state.moire, state.hue, state.accentHue, state.energy, time);
    }

    renderQuantumTiltPattern(ctx, centerX, centerY, rotX, rotY, rotZ, time, state) {
        const baseSpacing = 38;
        const clampedDensity = this.clamp(state.density, 0.2, 1.8);
        const spacing = baseSpacing * (1 + (1 - clampedDensity) * 2.6);
        const extent = 220 + state.energy * 140;
        const hue = this.normalizeHue(state.hue);
        const accentHue = this.normalizeHue(state.accentHue);
        const glitch = state.glitch;
        const energy = state.energy;
        const rawDensity = state.density;
        const variant = state.variant;

        ctx.lineWidth = 1.2 + energy * 0.5;

        for (let x = -extent; x <= extent; x += spacing) {
            for (let y = -extent; y <= extent; y += spacing) {
                const baseX = x * (1 + rotY * 0.35);
                const baseY = y * (1 + rotX * 0.35);

                let jitterX = Math.sin(time * 4 + y * 0.06) * glitch * 8;
                let jitterY = Math.cos(time * 4 + x * 0.06) * glitch * 8;

                if (variant === 'wave') {
                    jitterX += Math.sin(time * 3 + y * 0.09) * 12 * energy;
                } else if (variant === 'crystal') {
                    jitterY += Math.cos(time * 3 + x * 0.09) * 12 * energy;
                } else if (variant === 'lattice') {
                    jitterX += Math.sin((x + time * 30) * 0.02) * 6;
                    jitterY += Math.cos((y - time * 30) * 0.02) * 6;
                } else if (variant === 'klein') {
                    const knot = Math.sin(time * 2 + (x - y) * 0.015);
                    jitterX += knot * 16 * energy;
                    jitterY += Math.cos(time * 2.2 + (x + y) * 0.015) * 14 * energy;
                } else if (variant === 'neuron') {
                    const pulse = Math.sin(time * 4 + (x + y) * 0.01) * 0.5 + 0.5;
                    jitterX += Math.sin(time * 6 + y * 0.05) * 18 * pulse;
                    jitterY += Math.cos(time * 5 + x * 0.05) * 18 * (1 - pulse);
                } else if (variant === 'orbital') {
                    const spin = time * 1.5 + (x + y) * 0.002;
                    jitterX += Math.cos(spin) * 14 * energy;
                    jitterY += Math.sin(spin) * 14 * energy;
                } else if (variant === 'strata') {
                    jitterY += Math.sign(Math.sin(y * 0.04 + time * 3)) * 10 * (1 - rawDensity);
                }

                const px = centerX + baseX + jitterX;
                const py = centerY + baseY + jitterY;

                const distance = Math.hypot(px - centerX, py - centerY);
                const normalized = Math.max(0, 1 - distance / (extent * 1.2));
                if (normalized <= 0.01) continue;

                const wave = (Math.sin(distance * 0.016 + time * 3 + rotZ * 2) + 1) * 0.5;
                const alpha = Math.pow(normalized, 1.4) * (0.25 + energy * 0.5) * (0.6 + wave * 0.5);

                ctx.strokeStyle = `hsla(${hue}, 72%, ${55 + wave * 18}%, ${alpha})`;
                ctx.beginPath();
                ctx.arc(px, py, 2 + wave * 4 + glitch * 1.2, 0, Math.PI * 2);
                ctx.stroke();

                if (variant === 'crystal' && wave > 0.65) {
                    ctx.strokeStyle = `hsla(${accentHue}, 88%, 70%, ${alpha * 0.65})`;
                    ctx.beginPath();
                    ctx.moveTo(px, py);
                    ctx.lineTo(
                        centerX + Math.cos(time + x * 0.015) * distance * 0.25,
                        centerY + Math.sin(time + y * 0.015) * distance * 0.25
                    );
                    ctx.stroke();
                }
            }
        }

    }

    renderHolographicTiltPattern(ctx, centerX, centerY, rotX, rotY, rotZ, time, state) {
        const layers = 6 + Math.floor(state.energy * 3.2);
        const hue = this.normalizeHue(state.hue);
        const accentHue = this.normalizeHue(state.accentHue);
        const glitch = state.glitch;
        const energy = state.energy;
        const density = state.density;
        const variant = state.variant;

        for (let i = 0; i < layers; i++) {
            const progress = i / layers;
            let radius = 55 + i * 32 * (1 + (1 - density) * 0.4);
            let rotation = time * (0.45 + progress * 0.5) + rotZ * 1.2;
            let offsetX = Math.sin(time * 1.2 + progress * 6) * 18 * glitch;
            let offsetY = Math.cos(time * 1.1 + progress * 5) * 18 * glitch;

            if (variant === 'klein') {
                rotation += Math.sin(time + progress * 2) * 0.8;
            } else if (variant === 'ribbon') {
                offsetX += Math.sin(time * 2 + progress * 8) * 36 * energy;
                offsetY += Math.cos(time * 2 + progress * 8) * 30 * energy;
            } else if (variant === 'shell') {
                radius *= 1 + progress * 0.5;
            } else if (variant === 'torus') {
                radius *= 1 + Math.sin(time + progress * 3) * 0.12;
            }

            const lineAlpha = 0.55 * (1 - progress) + energy * 0.1;
            ctx.strokeStyle = `hsla(${(hue + progress * 25) % 360}, 88%, ${70 - progress * 18}%, ${lineAlpha})`;
            ctx.lineWidth = 1.2 + energy * 0.4;

            ctx.beginPath();
            ctx.ellipse(
                centerX + offsetX,
                centerY + offsetY,
                radius * (1 + rotX * 0.25 + energy * 0.1),
                radius * (1 + rotY * 0.25 + energy * 0.1),
                rotation,
                0,
                Math.PI * 2
            );
            ctx.stroke();

            const shimmer = 0.2 * (1 - progress) + energy * 0.05;
            ctx.setLineDash([6, 10]);
            ctx.strokeStyle = `hsla(${accentHue + progress * 30}, 95%, 75%, ${shimmer})`;
            ctx.beginPath();
            ctx.ellipse(
                centerX + offsetX * 0.6,
                centerY + offsetY * 0.6,
                radius * 0.85,
                radius * 0.85 * (variant === 'ribbon' ? 0.7 : 1),
                -rotation * 0.6,
                0,
                Math.PI * 2
            );
            ctx.stroke();
            ctx.setLineDash([]);
        }

    }

    renderFacetedTiltPattern(ctx, centerX, centerY, rotX, rotY, rotZ, time, state) {
        const hue = this.normalizeHue(state.hue);
        const accentHue = this.normalizeHue(state.accentHue);
        const glitch = state.glitch;
        const energy = state.energy;
        const variant = state.variant;

        let sides = 6;
        if (variant === 'polytope') {
            sides = 8;
        } else if (variant === 'lattice') {
            sides = 12;
        } else if (variant === 'orbital') {
            sides = 10;
        } else if (variant === 'strata') {
            sides = 14;
        }

        const radius = 70 + energy * 40;

        ctx.save();
        ctx.translate(centerX, centerY);
        const rotationSpeed = variant === 'orbital' ? 1.05 : 0.6;
        ctx.rotate(time * rotationSpeed + rotZ);
        const scaleX = 1 + rotY * 0.35 + energy * 0.12;
        const scaleY = 1 + rotX * 0.35 + energy * 0.12;
        ctx.scale(
            variant === 'strata' ? scaleX * 1.2 : scaleX,
            variant === 'strata' ? scaleY * 0.85 : scaleY
        );

        ctx.beginPath();
        for (let i = 0; i <= sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            let r = radius;

            if (variant === 'lattice') {
                r += Math.sin(time * 3 + angle * 4) * 14 * glitch;
            } else if (variant === 'polytope') {
                r += Math.cos(time * 2 + angle * 3) * 18 * energy;
            } else if (variant === 'orbital') {
                r += Math.sin(time * 1.5 + angle * 2) * 12 * energy;
            } else if (variant === 'strata') {
                r += Math.sign(Math.sin(angle * 4 + time * 3)) * 10 * (1 - density);
            }

            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();

        ctx.fillStyle = `hsla(${hue}, 65%, ${45 + energy * 18}%, ${0.2 + energy * 0.25})`;
        ctx.strokeStyle = `hsla(${hue}, 72%, 60%, ${0.75 + energy * 0.18})`;
        ctx.lineWidth = 2 + glitch * 0.8;
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = `hsla(${accentHue}, 95%, 72%, ${0.35 + glitch * 0.1})`;
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(
                Math.cos(angle) * radius * 1.2,
                Math.sin(angle) * radius * 1.2
            );
            ctx.stroke();

            if (variant === 'orbital') {
                ctx.beginPath();
                ctx.arc(0, 0, radius * 0.55, angle, angle + Math.PI / sides * 0.6);
                ctx.strokeStyle = `hsla(${accentHue}, 88%, 74%, ${0.25 + energy * 0.25})`;
                ctx.stroke();
            } else if (variant === 'strata') {
                ctx.beginPath();
                ctx.moveTo(-radius * 1.1, Math.sin(angle) * radius * 0.3);
                ctx.lineTo(radius * 1.1, Math.sin(angle) * radius * 0.3);
                ctx.strokeStyle = `hsla(${hue}, 62%, 58%, ${0.2 + (1 - density) * 0.25})`;
                ctx.stroke();
            }
        }

        ctx.restore();

    }

    renderMoireOverlay(ctx, centerX, centerY, moire, hue, accentHue, energy, time) {
        const intensity = Math.max(0, moire - 0.05);
        if (intensity <= 0.01) return;

        const layers = 3 + Math.floor(intensity * 2.5);

        for (let i = 0; i < layers; i++) {
            const radius = (i + 1) * 30 * (1 + energy * 0.35);
            const alpha = (0.08 + intensity * 0.12) * (1 - i / layers);
            const angle = time * (0.5 + intensity * 0.4) + i * 0.6;

            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(angle);

            ctx.strokeStyle = `hsla(${(accentHue + i * 14) % 360}, 92%, 68%, ${alpha})`;
            ctx.lineWidth = 1 + intensity * 0.4;

            ctx.beginPath();
            ctx.ellipse(
                0,
                0,
                radius * (1 + Math.sin(time + i) * 0.12 * energy),
                radius * (1 + Math.cos(time + i * 0.8) * 0.12 * energy),
                0,
                0,
                Math.PI * 2
            );
            ctx.stroke();

            ctx.restore();
        }
    }

    renderTraitFlourish(ctx, width, height) {
        if (!this.traitFlourish) return;

        const now = performance.now();
        const progress = (now - this.traitFlourish.start) / this.traitFlourish.duration;
        if (progress >= 1) {
            this.traitFlourish.active = false;
            return;
        }

        const intensity = Math.sin(progress * Math.PI);
        const hue = this.normalizeHue(this.targetState.accentHue + 24);

        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.rotate(progress * Math.PI * 2);

        const radius = (width + height) * 0.12 * (0.6 + intensity);

        ctx.lineWidth = 2 + intensity * 3;
        ctx.strokeStyle = `hsla(${hue}, 96%, 75%, ${0.55 * (1 - progress)})`;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.setLineDash([4, 10]);
        ctx.strokeStyle = `hsla(${(hue + 40) % 360}, 98%, 72%, ${0.35 * (1 - progress)})`;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 1.35, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.restore();
    }

    renderDestructionChoreography(ctx, width, height) {
        if (!this.destruction) return;

        const now = performance.now();
        const progress = (now - this.destruction.start) / this.destruction.duration;
        if (progress >= 1) {
            this.destruction.active = false;
            return;
        }

        const fade = 1 - progress;
        const hue = this.normalizeHue(this.targetState.hue + 18);
        const accentHue = this.normalizeHue(this.targetState.accentHue);
        const radiusBase = Math.max(width, height) * 0.18;
        const radius = radiusBase + progress * Math.max(width, height) * 0.35;

        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.globalCompositeOperation = 'screen';

        const gradient = ctx.createRadialGradient(0, 0, radius * 0.1, 0, 0, radius);
        gradient.addColorStop(0, `hsla(${accentHue}, 100%, 76%, ${0.45 * fade})`);
        gradient.addColorStop(0.5, `hsla(${hue}, 100%, 66%, ${0.35 * fade})`);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();

        const shards = 18;
        for (let i = 0; i < shards; i++) {
            const angle = (i / shards) * Math.PI * 2 + progress * Math.PI * 1.5;
            const shardLength = radius * (0.55 + 0.3 * Math.sin(progress * 6 + i));
            ctx.strokeStyle = `hsla(${(hue + i * 12) % 360}, 100%, 70%, ${0.6 * fade})`;
            ctx.lineWidth = 1.5 + this.state.glitch * 0.4;
            ctx.beginPath();
            ctx.moveTo(Math.cos(angle) * radius * 0.35, Math.sin(angle) * radius * 0.35);
            ctx.lineTo(Math.cos(angle) * shardLength, Math.sin(angle) * shardLength);
            ctx.stroke();
        }

        ctx.restore();
    }

    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    normalizeHue(value) {
        return ((value % 360) + 360) % 360;
    }

    destroy() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
        this.context = null;
    }
}
// Export for global use
window.VIB34DGeometricTiltSystem = VIB34DGeometricTiltSystem;
window.VIB34DTiltVisualizer = VIB34DTiltVisualizer;