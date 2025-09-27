/**
 * VIB34D GEOMETRIC TILT SYSTEM
 * Device orientation controls 4D rotation parameters for professional visualization
 * Based on vib34d-ultimate-viewer geometric tilt implementation
 * A Paul Phillips Manifestation - Paul@clearseassolutions.com
 */

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
        this.progressionBridge = null;

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
                this.createTiltVisualizer(canvas, systemType);
            }
        });

        console.log(`🎨 Created ${this.visualizers.size} VIB34D tilt visualizers`);
    }

    createTiltVisualizer(canvas, systemType) {
        const visualizer = new VIB34DTiltVisualizer(canvas, systemType);
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

        this.emitTiltUpdate();
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

    emitTiltUpdate() {
        if (this.progressionBridge && this.progressionBridge.hooks && typeof this.progressionBridge.hooks.onTiltUpdate === 'function') {
            this.progressionBridge.hooks.onTiltUpdate({
                alpha: this.tiltData.alpha,
                beta: this.tiltData.beta,
                gamma: this.tiltData.gamma,
                rotation4D: { ...this.rotation4D }
            });
        }
    }

    attachProgressionBus(eventBus, hooks = {}) {
        if (!eventBus || typeof eventBus.on !== 'function') {
            return;
        }

        if (this.progressionBridge && typeof this.progressionBridge.detach === 'function') {
            this.progressionBridge.detach();
        }

        const subscriptions = [];
        const subscribe = (eventName, handler) => {
            const off = eventBus.on(eventName, handler);
            if (typeof off === 'function') {
                subscriptions.push(off);
            }
        };

        const forwardPhase = (phaseName) => (detail) => {
            this.visualizers.forEach((visualizer) => {
                if (typeof visualizer.handlePhaseEvent === 'function') {
                    visualizer.handlePhaseEvent(phaseName, detail);
                }
            });
        };

        const phases = ['priming', 'approach', 'focus', 'handoff', 'retreat', 'settle', 'destabilize', 'transfer', 'reseed', 'recalibrate'];
        phases.forEach((phase) => {
            subscribe(`phase:${phase}`, forwardPhase(phase));
        });

        subscribe('portal:activated', (detail) => {
            this.visualizers.forEach((visualizer) => {
                if (typeof visualizer.handlePortalEvent === 'function') {
                    visualizer.handlePortalEvent('activated', detail);
                }
            });
        });

        subscribe('portal:deactivated', (detail) => {
            this.visualizers.forEach((visualizer) => {
                if (typeof visualizer.handlePortalEvent === 'function') {
                    visualizer.handlePortalEvent('deactivated', detail);
                }
            });
        });

        subscribe('card:state', (detail) => {
            const canvas = detail?.card?.querySelector?.('.vib34d-tilt-canvas');
            if (canvas && this.visualizers.has(canvas.id)) {
                const visualizer = this.visualizers.get(canvas.id);
                if (visualizer && typeof visualizer.handleCardState === 'function') {
                    visualizer.handleCardState(detail.state, detail);
                }
            }
        });

        this.progressionBridge = {
            eventBus,
            hooks,
            detach: () => {
                subscriptions.forEach((off) => {
                    if (typeof off === 'function') {
                        off();
                    }
                });
            }
        };

        console.log('🪢 Attached progression bus to VIB34D tilt system');
    }

    destroy() {
        this.visualizers.forEach(visualizer => visualizer.destroy());
        this.visualizers.clear();
        this.isEnabled = false;
        if (this.progressionBridge && typeof this.progressionBridge.detach === 'function') {
            this.progressionBridge.detach();
        }
        console.log('🗑️ VIB34D Geometric Tilt System destroyed');
    }
}

/**
 * VIB34D TILT VISUALIZER
 * Individual canvas visualizer that responds to geometric tilt
 */
class VIB34DTiltVisualizer {
    constructor(canvas, systemType) {
        this.canvas = canvas;
        this.systemType = systemType;
        this.context = null;
        this.resizeObserver = null;
        this.rotation4D = { rot4dXW: 0, rot4dYW: 0, rot4dZW: 0 };
        this.cardElement = canvas.closest('.progression-card');

        this.presets = this.getSystemPreset(systemType);
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
        this.hasBeenFocused = false;

        this.destruction = null;
        this.traitFlourish = null;

        this.lastTimestamp = performance.now();
        this.time = 0;
        this.phaseMomentum = 0;

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

        this.phaseMomentum = this.clamp(this.phaseMomentum * 0.92, 0, 1.2);
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

        trait.hue = this.presets.baseHue + trait.hueShift;
        trait.accentHue = this.presets.accentHue + trait.accentShift;

        return trait;
    }

    handlePhaseEvent(phase, detail = {}) {
        const card = this.cardElement;
        const { toCard, fromCard, card: eventCard } = detail;
        const matches = (target) => target && target === card;
        if (!(matches(toCard) || matches(fromCard) || matches(eventCard))) {
            return;
        }

        const magnitude = detail?.phase?.magnitude ?? 1;

        switch (phase) {
            case 'priming':
                if (matches(toCard)) {
                    this.nudgeTarget({ speed: 0.12 * magnitude, energy: 0.1 * magnitude, density: -0.08 * magnitude });
                }
                if (matches(fromCard)) {
                    this.nudgeTarget({ energy: -0.05 * magnitude, density: 0.1 * magnitude });
                }
                break;
            case 'approach':
                if (matches(toCard)) {
                    this.phaseMomentum = Math.min(1.1, this.phaseMomentum + 0.2 * magnitude);
                    this.nudgeTarget({ speed: 0.2 * magnitude, glitch: 0.12 * magnitude, moire: 0.1 * magnitude });
                }
                break;
            case 'focus':
                if (matches(toCard)) {
                    this.phaseMomentum = Math.min(1.2, this.phaseMomentum + 0.35 * magnitude);
                    this.nudgeTarget({ speed: 0.35 * magnitude, glitch: 0.22 * magnitude, energy: 0.3 * magnitude, density: -0.18 * magnitude });
                }
                break;
            case 'handoff':
                if (matches(toCard)) {
                    if (detail.inheritedTrait) {
                        this.applyInheritedTrait(detail.inheritedTrait);
                    } else {
                        this.modulateTraitCycle();
                    }
                    this.nudgeTarget({ moire: 0.18 * magnitude, glitch: 0.14 * magnitude });
                }
                if (matches(fromCard)) {
                    this.nudgeTarget({ energy: -0.12 * magnitude, density: 0.18 * magnitude });
                }
                break;
            case 'retreat':
                if (matches(fromCard)) {
                    this.nudgeTarget({ speed: -0.12 * magnitude, glitch: -0.08 * magnitude, density: 0.12 * magnitude });
                }
                break;
            case 'settle':
                this.nudgeTarget({ energy: -0.08 * magnitude });
                break;
            case 'destabilize':
                if (matches(eventCard)) {
                    this.startDestructionMomentum(magnitude);
                }
                break;
            case 'transfer':
                if (matches(eventCard) && detail.inheritedTrait) {
                    this.applyInheritedTrait(detail.inheritedTrait, { immediate: true });
                }
                break;
            case 'reseed':
                this.nudgeTarget({ speed: -0.08 * magnitude, energy: 0.05 * magnitude });
                break;
            case 'recalibrate':
                this.resetPhaseMomentum();
                break;
        }
    }

    handlePortalEvent(type, detail = {}) {
        if (!detail.card || detail.card !== this.cardElement) return;

        if (type === 'activated') {
            this.nudgeTarget({ moire: 0.12, glitch: 0.08, energy: 0.1 });
        } else if (type === 'deactivated') {
            this.nudgeTarget({ moire: -0.1, glitch: -0.08, energy: -0.12 });
        }
    }

    handleCardState(state, detail = {}) {
        this.setCardState(state, { inheritedTrait: detail.inheritedTrait });
    }

    modulateTraitCycle() {
        this.variantIndex = (this.variantIndex + 1) % this.presets.geometryCycle.length;
        this.targetState.geometryVariant = this.presets.geometryCycle[this.variantIndex];
        this.targetState.hue = this.presets.baseHue + this.presets.trait.hueShiftStep * this.variantIndex;
        this.targetState.accentHue = this.presets.accentHue + this.presets.trait.accentShiftStep * this.variantIndex;
        this.targetState.moire += this.presets.trait.moireBoost * 0.5;
        this.targetState.glitch += this.presets.trait.glitchBoost * 0.4;
        this.targetState.energy += this.presets.trait.energyBoost * 0.4;
    }

    nudgeTarget({ speed = 0, glitch = 0, density = 0, moire = 0, energy = 0 }) {
        this.targetState.speed = this.clamp(this.targetState.speed + speed, 0.15, 4.5);
        this.targetState.glitch = this.clamp(this.targetState.glitch + glitch, 0, 3.2);
        this.targetState.density = this.clamp(this.targetState.density + density, 0.2, 2.0);
        this.targetState.moire = this.clamp(this.targetState.moire + moire, 0, 3.0);
        this.targetState.energy = this.clamp(this.targetState.energy + energy, 0, 2.5);
    }

    startDestructionMomentum(magnitude) {
        this.phaseMomentum = Math.min(1.2, this.phaseMomentum + 0.4 * magnitude);
        this.nudgeTarget({ speed: 0.4 * magnitude, glitch: 0.3 * magnitude, density: -0.25 * magnitude, moire: 0.22 * magnitude, energy: 0.35 * magnitude });
        if (!this.destruction || !this.destruction.active) {
            this.triggerDestructionSequence();
        }
    }

    resetPhaseMomentum() {
        this.phaseMomentum = 0;
        this.targetState.speed = this.presets.baseSpeed;
        this.targetState.glitch = this.presets.baseGlitch;
        this.targetState.density = this.presets.baseDensity;
        this.targetState.moire = this.presets.baseMoire;
        this.targetState.energy = 0.4;
    }

    renderTiltResponsiveGeometry(ctx, width, height, time) {
        const centerX = width / 2;
        const centerY = height / 2;

        const rotX = this.rotation4D.rot4dXW;
        const rotY = this.rotation4D.rot4dYW;
        const rotZ = this.rotation4D.rot4dZW;

        switch (this.systemType) {
            case 'quantum':
                this.renderQuantumTiltPattern(ctx, centerX, centerY, rotX, rotY, rotZ, time);
                break;
            case 'holographic':
                this.renderHolographicTiltPattern(ctx, centerX, centerY, rotX, rotY, rotZ, time);
                break;
            case 'faceted':
            default:
                this.renderFacetedTiltPattern(ctx, centerX, centerY, rotX, rotY, rotZ, time);
                break;
        }
    }

    renderQuantumTiltPattern(ctx, centerX, centerY, rotX, rotY, rotZ, time) {
        const baseSpacing = 38;
        const density = this.clamp(this.state.density, 0.2, 1.8);
        const spacing = baseSpacing * (1 + (1 - density) * 2.6);
        const extent = 220 + this.state.energy * 140;
        const hue = this.normalizeHue(this.state.hue);
        const accentHue = this.normalizeHue(this.state.accentHue);
        const glitch = this.state.glitch;
        const energy = this.state.energy;
        const variant = this.state.geometryVariant;

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

        this.renderMoireOverlay(ctx, centerX, centerY, this.state.moire, hue, accentHue, energy, time);
    }

    renderHolographicTiltPattern(ctx, centerX, centerY, rotX, rotY, rotZ, time) {
        const layers = 6 + Math.floor(this.state.energy * 3);
        const hue = this.normalizeHue(this.state.hue);
        const accentHue = this.normalizeHue(this.state.accentHue);
        const glitch = this.state.glitch;
        const energy = this.state.energy;
        const density = this.state.density;
        const variant = this.state.geometryVariant;

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

        this.renderMoireOverlay(ctx, centerX, centerY, this.state.moire, hue, accentHue, energy, time);
    }

    renderFacetedTiltPattern(ctx, centerX, centerY, rotX, rotY, rotZ, time) {
        const hue = this.normalizeHue(this.state.hue);
        const accentHue = this.normalizeHue(this.state.accentHue);
        const glitch = this.state.glitch;
        const energy = this.state.energy;
        const variant = this.state.geometryVariant;

        let sides = 6;
        if (variant === 'polytope') {
            sides = 8;
        } else if (variant === 'lattice') {
            sides = 12;
        }

        const radius = 70 + energy * 40;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(time * 0.6 + rotZ);
        ctx.scale(1 + rotY * 0.35 + energy * 0.12, 1 + rotX * 0.35 + energy * 0.12);

        ctx.beginPath();
        for (let i = 0; i <= sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            let r = radius;

            if (variant === 'lattice') {
                r += Math.sin(time * 3 + angle * 4) * 14 * glitch;
            } else if (variant === 'polytope') {
                r += Math.cos(time * 2 + angle * 3) * 18 * energy;
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
        }

        ctx.restore();

        this.renderMoireOverlay(ctx, centerX, centerY, this.state.moire, hue, accentHue, energy, time);
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