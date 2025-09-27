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
        this.eventTarget = typeof EventTarget !== 'undefined' ? new EventTarget() : null;
        this.lastTiltSnapshot = {
            alpha: 0,
            beta: 0,
            gamma: 0,
            time: performance.now()
        };

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
        if (this.hasPermission) {
            this.enable();
        }
        console.log('✅ VIB34D Geometric Tilt System initialized');
    }

    setupTiltListeners() {
        // Device orientation event for tilt data
        window.addEventListener('deviceorientation', (event) => {
            if (!this.isEnabled) return;

            this.updateTiltData(event);
            this.processTiltUpdate();
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

    processTiltUpdate() {
        this.calculateVIB34DRotation();
        this.updateVisualizers();
        this.updateTiltUI();
        this.emitTiltMetrics();
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

        this.processTiltUpdate();
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
        const layerRole = canvas.dataset.layer || 'primary';
        const visualizer = new VIB34DTiltVisualizer(canvas, systemType, layerRole);
        const key = canvas.id || `${systemType}-${layerRole}-${this.visualizers.size}`;
        this.visualizers.set(key, visualizer);
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

    emitTiltMetrics() {
        if (!this.eventTarget || !this.isEnabled) return;

        const now = performance.now();
        const previous = this.lastTiltSnapshot || { alpha: 0, beta: 0, gamma: 0, time: now - 16 };
        const dt = Math.max(0.016, (now - previous.time) / 1000);

        const deltaAlpha = this.normalizeAngleDelta(this.tiltData.alpha, previous.alpha);
        const deltaBeta = this.tiltData.beta - previous.beta;
        const deltaGamma = this.tiltData.gamma - previous.gamma;

        const velocity = {
            alpha: deltaAlpha / dt,
            beta: deltaBeta / dt,
            gamma: deltaGamma / dt
        };

        const normalized = {
            alpha: this.tiltData.alpha / 180,
            beta: this.tiltData.beta / 90,
            gamma: this.tiltData.gamma / 90
        };

        const planarMagnitude = Math.sqrt((normalized.beta ** 2) + (normalized.gamma ** 2));
        const velocityMagnitude = Math.min(1.4, Math.sqrt(((velocity.beta / 120) ** 2) + ((velocity.gamma / 120) ** 2)));
        const intensity = Math.max(0, Math.min(1.2, planarMagnitude * 0.85 + velocityMagnitude * 0.45));

        const detail = {
            timestamp: now,
            raw: { ...this.tiltData },
            normalized,
            velocity,
            intensity,
            rotation4D: { ...this.rotation4D }
        };

        this.emit('tilt-vector', detail);
        this.lastTiltSnapshot = { ...this.tiltData, time: now };
    }

    clampAngle(angle, min = -180, max = 180) {
        if (angle === null || angle === undefined) return 0;
        return Math.max(min, Math.min(max, angle));
    }

    normalizeAngleDelta(current, previous) {
        let delta = current - previous;
        while (delta > 180) delta -= 360;
        while (delta < -180) delta += 360;
        return delta;
    }

    createFallbackSystem() {
        console.log('🖱️ Creating mouse-based fallback tilt system');
        this.isSupported = true; // Enable mouse fallback
        this.hasPermission = true;
        this.setupTiltListeners();
        this.findTiltCanvases();
        this.enable();
    }

    enable() {
        if (!this.hasPermission) {
            console.warn('⚠️ Cannot enable tilt system without permission');
            return false;
        }
        if (this.isEnabled) return true;

        this.isEnabled = true;
        console.log('✅ VIB34D Geometric Tilt System ENABLED');
        this.emitTiltMetrics();
        return true;
    }

    disable() {
        if (!this.isEnabled) return;
        this.isEnabled = false;
        console.log('⏸️ VIB34D Geometric Tilt System DISABLED');
    }

    toggle() {
        return this.isEnabled ? (this.disable(), false) : this.enable();
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

    on(eventName, handler) {
        if (!this.eventTarget || typeof handler !== 'function') {
            return () => {};
        }
        const listener = (event) => handler(event.detail, event);
        this.eventTarget.addEventListener(eventName, listener);
        return () => this.eventTarget.removeEventListener(eventName, listener);
    }

    off(eventName, handler) {
        if (!this.eventTarget || typeof handler !== 'function') return;
        this.eventTarget.removeEventListener(eventName, handler);
    }

    emit(eventName, detail = {}) {
        if (!this.eventTarget) return;
        this.eventTarget.dispatchEvent(new CustomEvent(eventName, { detail }));
    }
}

/**
 * VIB34D TILT VISUALIZER
 * Individual canvas visualizer that responds to geometric tilt
 */
class VIB34DTiltVisualizer {
    constructor(canvas, systemType, layerRole = 'primary') {
        this.canvas = canvas;
        this.systemType = systemType;
        this.layerRole = layerRole;
        this.context = null;
        this.resizeObserver = null;
        this.rotation4D = { rot4dXW: 0, rot4dYW: 0, rot4dZW: 0 };

        this.presets = this.getSystemPreset(systemType);
        this.layerProfile = this.getLayerProfile(layerRole);
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
        this.applyLayerMultipliers(this.state);
        this.targetState = { ...this.state };

        this.variantIndex = 0;
        this.traitIndex = 0;
        this.hasBeenFocused = false;

        this.destruction = null;
        this.traitFlourish = null;
        this.interactionPulse = { active: false, start: 0, duration: 720, magnitude: 0 };
        this.pulseStrength = 0;
        this.audioEnergy = 0;
        this.audioPeak = 0;

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

    getLayerProfile(layerRole) {
        const baseProfile = {
            role: layerRole,
            speedMultiplier: 1,
            glitchMultiplier: 1,
            densityMultiplier: 1,
            moireMultiplier: 1,
            energyMultiplier: 1,
            responseGain: 1,
            audioGain: 1,
            depthBias: 0,
            depthAttenuation: 0,
            scaleGain: 0,
            parallaxGain: 0,
            tiltAmplification: 1,
            swirlStrength: 9,
            rotationalBiasX: 0,
            rotationalBiasY: 0,
            rotationalBiasZ: 0,
            wAmplitude: 1,
            wFrequency: 1,
            wPhase: 0.85,
            wRadialGain: 0.45,
            alphaMultiplier: 1,
            moireLayerGain: 1,
            rippleGain: 1,
            lineWidthGain: 1,
            jitterGain: 1
        };

        const profiles = {
            primary: {
                swirlStrength: 9,
                wPhase: 0.75,
                wRadialGain: 0.5
            },
            echo: {
                speedMultiplier: 1.08,
                glitchMultiplier: 1.2,
                densityMultiplier: 0.92,
                moireMultiplier: 1.35,
                energyMultiplier: 0.88,
                responseGain: 1.25,
                audioGain: 0.85,
                depthBias: 90,
                depthAttenuation: 0.55,
                scaleGain: 0.28,
                parallaxGain: 0.65,
                tiltAmplification: 1.18,
                swirlStrength: 14,
                rotationalBiasX: 0.08,
                rotationalBiasY: -0.06,
                rotationalBiasZ: 0.04,
                wAmplitude: 1.5,
                wFrequency: 1.3,
                wPhase: 1.1,
                wRadialGain: 0.7,
                alphaMultiplier: 0.75,
                moireLayerGain: 1.25,
                rippleGain: 1.2,
                lineWidthGain: 0.95,
                jitterGain: 1.25
            },
            fracture: {
                speedMultiplier: 1.18,
                glitchMultiplier: 1.55,
                densityMultiplier: 0.78,
                moireMultiplier: 0.92,
                energyMultiplier: 1.15,
                responseGain: 1.45,
                audioGain: 1.18,
                depthBias: -110,
                depthAttenuation: 0.32,
                scaleGain: 0.45,
                parallaxGain: 1.05,
                tiltAmplification: 1.32,
                swirlStrength: 18,
                rotationalBiasX: -0.12,
                rotationalBiasY: 0.16,
                rotationalBiasZ: -0.08,
                wAmplitude: 2.05,
                wFrequency: 1.6,
                wPhase: 1.7,
                wRadialGain: 0.92,
                alphaMultiplier: 0.62,
                moireLayerGain: 0.78,
                rippleGain: 1.45,
                lineWidthGain: 1.25,
                jitterGain: 1.6
            }
        };

        const profile = profiles[layerRole] || profiles.primary;
        return { ...baseProfile, ...profile };
    }

    applyLayerMultipliers(state) {
        if (!state || !this.layerProfile) return state;
        state.speed *= this.layerProfile.speedMultiplier;
        state.glitch *= this.layerProfile.glitchMultiplier;
        state.density *= this.layerProfile.densityMultiplier;
        state.moire *= this.layerProfile.moireMultiplier;
        state.energy *= this.layerProfile.energyMultiplier;
        return state;
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

        if (this.audioEnergy > 0) {
            this.audioEnergy = Math.max(0, this.audioEnergy - delta * 0.9);
        }

        if (this.audioPeak > 0) {
            this.audioPeak = Math.max(0, this.audioPeak - delta * 2.2);
        }
    }

    applyTiltVector(tilt = {}) {
        const normalized = tilt.normalized || {};
        const velocity = tilt.velocity || {};
        const rotation4D = tilt.rotation4D || this.rotation4D;
        const intensity = typeof tilt.intensity === 'number'
            ? this.clamp(tilt.intensity, 0, 1.2)
            : Math.min(1.2, Math.sqrt(((normalized.beta || 0) ** 2) + ((normalized.gamma || 0) ** 2)));

        const forward = this.clamp(normalized.beta || 0, -1.3, 1.3);
        const lateral = this.clamp(normalized.gamma || 0, -1.3, 1.3);
        const swirl = this.clamp(normalized.alpha || 0, -1.3, 1.3);

        const velocityAlpha = velocity.alpha || 0;
        const velocityBeta = velocity.beta || 0;
        const velocityGamma = velocity.gamma || 0;

        this.targetState.speed = this.presets.baseSpeed + Math.abs(lateral) * 0.35 + intensity * 0.55 + Math.abs(velocityGamma) * 0.012;
        this.targetState.glitch = this.presets.baseGlitch + Math.abs(velocityBeta) * 0.018 + Math.abs(rotation4D.rot4dZW || 0) * 0.45 + intensity * 0.2;
        this.targetState.moire = this.presets.baseMoire + Math.abs(forward) * 0.42 + Math.abs(swirl) * 0.18;
        this.targetState.density = this.presets.baseDensity + lateral * 0.22 - forward * 0.3;
        this.targetState.energy = Math.max(this.targetState.energy, 0.4 + intensity * 0.6 + Math.abs(velocityAlpha) * 0.002);
        this.pulseStrength = Math.max(this.pulseStrength, intensity * 0.55);

        if (Math.abs(velocityAlpha) > 35) {
            const polarity = velocityAlpha > 0 ? 1 : -1;
            this.applyInteractionResponse({
                intensity: 0.28 + intensity * 0.5,
                polarity,
                hueSpin: swirl * 1.1,
                densityBias: -forward * 0.5,
                geometryAdvance: polarity,
                duration: 680
            });
        } else {
            this.targetState.hue += swirl * 6;
            this.targetState.accentHue += swirl * 4;
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
        const layerGain = this.layerProfile ? this.layerProfile.responseGain || 1 : 1;

        this.targetState.speed += clamped * 0.35 * layerGain;
        this.targetState.glitch += clamped * 0.4 * layerGain;
        this.targetState.energy += clamped * 0.5 * layerGain;
        this.targetState.moire += clamped * 0.3 * polaritySign * layerGain;

        if (densityBias !== 0) {
            this.targetState.density += clamped * densityBias * 0.25 * layerGain;
        } else {
            this.targetState.density += clamped * (polaritySign > 0 ? -0.18 : 0.18) * layerGain;
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
            magnitude: Math.min(1.8, (clamped * 0.9 + Math.abs(polarity) * 0.2) * layerGain)
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

    applyAudioEnergy(level, meta = {}) {
        if (typeof level !== 'number') return;

        const normalized = this.clamp(level, 0, 1);
        const eased = Math.pow(normalized, 1.2);
        const audioGain = this.layerProfile ? this.layerProfile.audioGain || 1 : 1;

        this.audioEnergy = Math.max(this.audioEnergy, eased * audioGain);
        if (meta.peak) {
            this.audioPeak = Math.max(this.audioPeak, 0.85 * audioGain);
        }

        const swing = typeof meta.swing === 'number' ? meta.swing : 0;
        const polarity = meta.polarity || (swing < 0 ? -1 : 1);

        this.targetState.speed += eased * 0.55 * audioGain;
        this.targetState.glitch += eased * 0.6 * audioGain;
        this.targetState.energy += eased * 0.8 * audioGain;
        this.targetState.moire += eased * (polarity >= 0 ? 0.4 : 0.22) * audioGain;
        this.targetState.density -= eased * 0.35 * audioGain;
        this.targetState.hue += swing * 12;
        this.targetState.accentHue += swing * 8;

        if (meta.peak) {
            this.interactionPulse = {
                active: true,
                start: performance.now(),
                duration: 880 + eased * 520,
                magnitude: Math.max(this.pulseStrength, (0.55 + eased * 0.6) * audioGain)
            };
        }
    }

    setCardState(state, options = {}) {
        const inheritedTrait = options.inheritedTrait;

        if (inheritedTrait) {
            this.applyInheritedTrait(inheritedTrait);
        }

        switch (state) {
            case 'far-depth':
                this.targetState.speed = this.presets.baseSpeed * 0.6 * this.layerProfile.speedMultiplier;
                this.targetState.glitch = this.presets.baseGlitch * 0.45 * this.layerProfile.glitchMultiplier;
                this.targetState.density = this.presets.baseDensity * 1.25 * this.layerProfile.densityMultiplier;
                this.targetState.moire = this.presets.baseMoire * 0.4 * this.layerProfile.moireMultiplier;
                this.targetState.energy = 0.2 * this.layerProfile.energyMultiplier;
                this.applyInteractionResponse({
                    intensity: 0.28,
                    polarity: -1,
                    hueSpin: -0.35,
                    densityBias: 0.55,
                    duration: 1180
                });
                break;
            case 'approaching':
                this.targetState.speed = this.presets.baseSpeed * 1.1 * this.layerProfile.speedMultiplier;
                this.targetState.glitch = this.presets.baseGlitch * 0.8 * this.layerProfile.glitchMultiplier;
                this.targetState.density = this.presets.baseDensity * 0.85 * this.layerProfile.densityMultiplier;
                this.targetState.moire = this.presets.baseMoire * 0.7 * this.layerProfile.moireMultiplier;
                this.targetState.energy = 0.65 * this.layerProfile.energyMultiplier;
                this.applyInteractionResponse({
                    intensity: 0.62,
                    polarity: 1,
                    hueSpin: 0.9,
                    densityBias: -0.95,
                    geometryAdvance: 1,
                    duration: 1320
                });
                break;
            case 'focused':
                this.targetState.speed = this.presets.baseSpeed * 1.75 * this.layerProfile.speedMultiplier;
                this.targetState.glitch = (this.presets.baseGlitch * 1.4 + 0.2) * this.layerProfile.glitchMultiplier;
                this.targetState.density = this.presets.baseDensity * 0.6 * this.layerProfile.densityMultiplier;
                this.targetState.moire = (this.presets.baseMoire * 1.3 + 0.1) * this.layerProfile.moireMultiplier;
                this.targetState.energy = 1.05 * this.layerProfile.energyMultiplier;

                if (!inheritedTrait || !inheritedTrait.geometryVariant) {
                    if (!this.hasBeenFocused) {
                        this.hasBeenFocused = true;
                        this.targetState.geometryVariant = this.presets.geometryCycle[this.variantIndex];
                    } else {
                        this.variantIndex = (this.variantIndex + 1) % this.presets.geometryCycle.length;
                        this.targetState.geometryVariant = this.presets.geometryCycle[this.variantIndex];
                    }
                }

                this.applyInteractionResponse({
                    intensity: 0.88,
                    polarity: 1,
                    hueSpin: 1.25,
                    densityBias: -1.15,
                    geometryAdvance: 1,
                    duration: 1480
                });
                break;
            case 'exiting':
                this.targetState.speed = this.presets.baseSpeed * 1.35 * this.layerProfile.speedMultiplier;
                this.targetState.glitch = this.presets.baseGlitch * 1.1 * this.layerProfile.glitchMultiplier;
                this.targetState.density = this.presets.baseDensity * 0.75 * this.layerProfile.densityMultiplier;
                this.targetState.moire = this.presets.baseMoire * 0.9 * this.layerProfile.moireMultiplier;
                this.targetState.energy = 0.5 * this.layerProfile.energyMultiplier;
                this.applyInteractionResponse({
                    intensity: 0.5,
                    polarity: -1,
                    hueSpin: -0.85,
                    densityBias: 0.7,
                    geometryAdvance: -1,
                    duration: 1120
                });
                break;
            case 'destroyed':
                this.targetState.speed = this.presets.baseSpeed * 2.1 * this.layerProfile.speedMultiplier;
                this.targetState.glitch = (this.presets.baseGlitch * 1.9 + 0.4) * this.layerProfile.glitchMultiplier;
                this.targetState.density = this.presets.baseDensity * 0.35 * this.layerProfile.densityMultiplier;
                this.targetState.moire = (this.presets.baseMoire * 1.6 + 0.2) * this.layerProfile.moireMultiplier;
                this.targetState.energy = 1.2 * this.layerProfile.energyMultiplier;
                this.applyInteractionResponse({
                    intensity: 1.1,
                    polarity: 1,
                    hueSpin: 1.6,
                    densityBias: -1.4,
                    geometryAdvance: 1,
                    duration: 1820
                });
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
        this.renderAudioRipples(ctx, centerX, centerY, this.audioEnergy, this.audioPeak > 0.05, state.hue, time);
    }

    computeHyperSpatialW(x, y, time, energy = 0, variant = 'default', glitch = 0) {
        const profile = this.layerProfile || {};
        const radial = Math.sqrt(x * x + y * y);
        const angle = Math.atan2(y, x);
        const frequency = (profile.wFrequency || 1);
        const amplitude = (profile.wAmplitude || 1);
        const phase = profile.wPhase || 0.8;
        const radialGain = profile.wRadialGain || 0.45;
        const jitterGain = profile.jitterGain || 1;

        let wave = Math.sin((x + y) * 0.01 * frequency + time * (0.85 + energy * 0.55) + phase);
        let moire = Math.cos((x - y) * 0.012 * frequency - time * (1.4 + energy * 0.35) + angle * 1.4);
        let lattice = 0;

        if (variant === 'wave') {
            wave += Math.sin(radial * 0.02 + time * 2.4) * 0.6;
        } else if (variant === 'crystal' || variant === 'polytope') {
            lattice += Math.cos(angle * 4 + time * 1.8) * 0.6;
        } else if (variant === 'lattice') {
            lattice += Math.sin((x * 0.015 + y * 0.015) + time * 1.3) * 0.8;
        } else if (variant === 'klein') {
            lattice += Math.sin(angle * 3 + time * 1.6) * 0.7;
        }

        const base = (wave + moire * 0.65 + lattice * 0.5) * 160 * amplitude * (1 + energy * 0.35);
        const radialOffset = radial * radialGain * Math.sin(angle * 2 + time * 0.8);
        const glitchInfluence = glitch * 35 * jitterGain;

        return base + radialOffset + glitchInfluence;
    }

    projectPortalPoint(x, y, options = {}) {
        const {
            time = 0,
            rotX = 0,
            rotY = 0,
            rotZ = 0,
            energy = 0,
            glitch = 0,
            variant = 'default',
            density = 1,
            z = 0
        } = options;

        const profile = this.layerProfile || {};
        const tiltAmplification = profile.tiltAmplification || 1;
        const swirlStrength = profile.swirlStrength || 10;

        let px = x * (1 + rotY * 0.35 * tiltAmplification);
        let py = y * (1 + rotX * 0.35 * tiltAmplification);

        const swirl = Math.sin((px + py) * 0.005 * (profile.wFrequency || 1) + time * 0.8) * swirlStrength;
        px += swirl * 0.6;
        py += swirl * -0.4;

        if (variant === 'wave') {
            px += Math.sin(time * 2 + y * 0.02) * 12 * (energy + glitch * 0.5);
        } else if (variant === 'ribbon') {
            py += Math.cos(time * 2.2 + x * 0.02) * 16 * (energy + glitch * 0.4);
        } else if (variant === 'shell') {
            px += Math.sin(time * 1.6 + density * 0.5) * 8;
            py += Math.cos(time * 1.4 + density * 0.4) * 8;
        }

        const w = this.computeHyperSpatialW(px, py, time, energy, variant, glitch);
        const depthBias = profile.depthBias || 0;
        const zBase = (z || 0) + depthBias;
        const rotXW = rotX + (profile.rotationalBiasX || 0);
        const rotYW = rotY + (profile.rotationalBiasY || 0);
        const rotZW = rotZ + (profile.rotationalBiasZ || 0);

        const sinX = Math.sin(rotXW);
        const cosX = Math.cos(rotXW);
        let x1 = px * cosX - w * sinX;
        let w1 = px * sinX + w * cosX;

        const sinY = Math.sin(rotYW);
        const cosY = Math.cos(rotYW);
        let y1 = py * cosY - w1 * sinY;
        let w2 = py * sinY + w1 * cosY;

        const sinZ = Math.sin(rotZW);
        const cosZ = Math.cos(rotZW);
        let z1 = zBase * cosZ - w2 * sinZ;
        let w3 = zBase * sinZ + w2 * cosZ;

        const planarSpin = rotZ * 0.6;
        const sinP = Math.sin(planarSpin);
        const cosP = Math.cos(planarSpin);
        const x2 = x1 * cosP - y1 * sinP;
        const y2 = x1 * sinP + y1 * cosP;

        const attenuation = profile.depthAttenuation || 0;
        const depthFactor = 1 / (1 + Math.abs(w3) * 0.0028 * (1 + attenuation));
        const scale = depthFactor * (1 + (profile.scaleGain || 0) * Math.sign(w3));
        const parallax = w3 * 0.0012 * (1 + (profile.parallaxGain || 0));

        const finalX = x2 * scale + parallax * 120;
        const finalY = y2 * scale - parallax * 90;

        return {
            x: finalX,
            y: finalY,
            depth: w3,
            alpha: depthFactor,
            scale,
            parallax
        };
    }

    renderQuantumTiltPattern(ctx, centerX, centerY, rotX, rotY, rotZ, time, state) {
        const baseSpacing = 38;
        const density = this.clamp(state.density, 0.2, 1.8);
        const densityFactor = this.layerProfile ? this.layerProfile.densityMultiplier || 1 : 1;
        const spacing = (baseSpacing * (1 + (1 - density) * 2.6)) / densityFactor;
        const extent = 220 + state.energy * 140;
        const hue = this.normalizeHue(state.hue);
        const accentHue = this.normalizeHue(state.accentHue);
        const glitch = state.glitch;
        const energy = state.energy;
        const variant = state.variant;
        const alphaMultiplier = this.layerProfile ? this.layerProfile.alphaMultiplier || 1 : 1;
        const lineWidthGain = this.layerProfile ? this.layerProfile.lineWidthGain || 1 : 1;
        const jitterGain = this.layerProfile ? this.layerProfile.jitterGain || 1 : 1;

        ctx.lineWidth = (1.2 + energy * 0.5) * lineWidthGain;

        for (let x = -extent; x <= extent; x += spacing) {
            for (let y = -extent; y <= extent; y += spacing) {
                let jitterX = Math.sin(time * 4 + y * 0.06) * glitch * 8 * jitterGain;
                let jitterY = Math.cos(time * 4 + x * 0.06) * glitch * 8 * jitterGain;

                if (variant === 'wave') {
                    jitterX += Math.sin(time * 3 + y * 0.09) * 12 * energy;
                } else if (variant === 'crystal') {
                    jitterY += Math.cos(time * 3 + x * 0.09) * 12 * energy;
                } else if (variant === 'lattice') {
                    jitterX += Math.sin((x + time * 30) * 0.02) * 6;
                    jitterY += Math.cos((y - time * 30) * 0.02) * 6;
                }

                const projected = this.projectPortalPoint(x + jitterX, y + jitterY, {
                    time,
                    rotX,
                    rotY,
                    rotZ,
                    energy,
                    glitch,
                    variant,
                    density
                });

                const px = centerX + projected.x;
                const py = centerY + projected.y;

                const distance = Math.hypot(projected.x, projected.y);
                const normalized = Math.max(0, 1 - distance / (extent * 1.15));
                if (normalized <= 0.01) continue;

                const wave = (Math.sin(distance * 0.016 + time * 3 + rotZ * 2 + projected.depth * 0.0015) + 1) * 0.5;
                const depthAlpha = projected.alpha * alphaMultiplier;
                const alpha = Math.pow(normalized, 1.35) * (0.25 + energy * 0.5) * (0.6 + wave * 0.5) * depthAlpha;

                const radius = (2 + wave * 4 + glitch * 1.2) * (0.6 + projected.scale * 0.4);
                ctx.strokeStyle = `hsla(${hue}, 72%, ${55 + wave * 18 + projected.parallax * 30}%, ${alpha})`;
                ctx.beginPath();
                ctx.arc(px, py, radius, 0, Math.PI * 2);
                ctx.stroke();

                if (variant === 'crystal' && wave > 0.65) {
                    const anchor = this.projectPortalPoint(x * 0.6, y * 0.6, {
                        time,
                        rotX,
                        rotY,
                        rotZ,
                        energy: energy * 0.8,
                        glitch,
                        variant,
                        density
                    });
                    ctx.strokeStyle = `hsla(${accentHue}, 88%, 70%, ${alpha * 0.65})`;
                    ctx.beginPath();
                    ctx.moveTo(px, py);
                    ctx.lineTo(centerX + anchor.x, centerY + anchor.y);
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
        const alphaMultiplier = this.layerProfile ? this.layerProfile.alphaMultiplier || 1 : 1;
        const lineWidthGain = this.layerProfile ? this.layerProfile.lineWidthGain || 1 : 1;

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

            const anchor = this.projectPortalPoint(offsetX, offsetY, {
                time,
                rotX,
                rotY,
                rotZ,
                energy,
                glitch,
                variant,
                density
            });

            const px = centerX + anchor.x;
            const py = centerY + anchor.y;
            const scaleFactor = 0.8 + anchor.scale * 0.6;
            const radiusX = Math.max(8, radius * (1 + rotX * 0.25 + energy * 0.1) * scaleFactor);
            const radiusY = Math.max(8, radius * (1 + rotY * 0.25 + energy * 0.1) * scaleFactor);

            const lineAlpha = (0.55 * (1 - progress) + energy * 0.1) * anchor.alpha * alphaMultiplier;
            ctx.strokeStyle = `hsla(${(hue + progress * 25) % 360}, 88%, ${70 - progress * 18 + anchor.parallax * 20}%, ${lineAlpha})`;
            ctx.lineWidth = (1.2 + energy * 0.4) * lineWidthGain;

            ctx.beginPath();
            ctx.ellipse(
                px,
                py,
                radiusX,
                radiusY,
                rotation + anchor.parallax * 2,
                0,
                Math.PI * 2
            );
            ctx.stroke();

            const shimmer = (0.2 * (1 - progress) + energy * 0.05) * anchor.alpha * alphaMultiplier;
            ctx.setLineDash([6, 10]);
            ctx.strokeStyle = `hsla(${accentHue + progress * 30}, 95%, 75%, ${shimmer})`;
            ctx.beginPath();
            ctx.ellipse(
                px + anchor.parallax * 30,
                py - anchor.parallax * 22,
                Math.max(6, radiusX * 0.7),
                Math.max(6, radiusY * 0.7 * (variant === 'ribbon' ? 0.75 : 1)),
                rotation - anchor.parallax * 1.5,
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
        const density = state.density;
        const alphaMultiplier = this.layerProfile ? this.layerProfile.alphaMultiplier || 1 : 1;
        const lineWidthGain = this.layerProfile ? this.layerProfile.lineWidthGain || 1 : 1;

        let sides = 6;
        if (variant === 'polytope') {
            sides = 8;
        } else if (variant === 'lattice') {
            sides = 12;
        }

        const radius = 70 + energy * 40;
        const rotation = time * 0.6 + rotZ;
        const scaleX = 1 + rotY * 0.35 + energy * 0.12;
        const scaleY = 1 + rotX * 0.35 + energy * 0.12;

        const points = [];
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2 + rotation;
            let r = radius;

            if (variant === 'lattice') {
                r += Math.sin(time * 3 + angle * 4) * 14 * glitch;
            } else if (variant === 'polytope') {
                r += Math.cos(time * 2 + angle * 3) * 18 * energy;
            }

            const baseX = Math.cos(angle) * r * scaleX;
            const baseY = Math.sin(angle) * r * scaleY;

            const projected = this.projectPortalPoint(baseX, baseY, {
                time,
                rotX,
                rotY,
                rotZ,
                energy,
                glitch,
                variant,
                density
            });

            points.push({
                x: centerX + projected.x,
                y: centerY + projected.y,
                alpha: projected.alpha,
                scale: projected.scale
            });
        }

        if (!points.length) return;

        const avgAlpha = points.reduce((sum, p) => sum + p.alpha, 0) / points.length;
        const fillAlpha = (0.2 + energy * 0.25) * avgAlpha * alphaMultiplier;
        const strokeAlpha = (0.75 + energy * 0.18) * avgAlpha * alphaMultiplier;

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.closePath();

        ctx.fillStyle = `hsla(${hue}, 65%, ${45 + energy * 18}%, ${fillAlpha})`;
        ctx.strokeStyle = `hsla(${hue}, 72%, 60%, ${strokeAlpha})`;
        ctx.lineWidth = (2 + glitch * 0.8) * lineWidthGain;
        ctx.fill();
        ctx.stroke();

        const centerAnchor = this.projectPortalPoint(0, 0, {
            time,
            rotX,
            rotY,
            rotZ,
            energy: energy * 0.6,
            glitch,
            variant,
            density
        });
        const centerXProjected = centerX + centerAnchor.x;
        const centerYProjected = centerY + centerAnchor.y;

        ctx.strokeStyle = `hsla(${accentHue}, 95%, 72%, ${(0.35 + glitch * 0.1) * avgAlpha * alphaMultiplier})`;
        for (let i = 0; i < points.length; i++) {
            ctx.beginPath();
            ctx.moveTo(centerXProjected, centerYProjected);
            ctx.lineTo(points[i].x, points[i].y);
            ctx.stroke();
        }

    }

    renderMoireOverlay(ctx, centerX, centerY, moire, hue, accentHue, energy, time) {
        const intensity = Math.max(0, moire - 0.05);
        if (intensity <= 0.01) return;

        const layers = 3 + Math.floor(intensity * 2.5);

        const anchor = this.projectPortalPoint(0, 0, {
            time,
            rotX: this.rotation4D.rot4dXW,
            rotY: this.rotation4D.rot4dYW,
            rotZ: this.rotation4D.rot4dZW,
            energy,
            glitch: this.state.glitch,
            variant: this.state.geometryVariant,
            density: this.state.density || 1
        });

        const px = centerX + anchor.x;
        const py = centerY + anchor.y;
        const alphaMultiplier = this.layerProfile ? this.layerProfile.alphaMultiplier || 1 : 1;
        const moireLayerGain = this.layerProfile ? this.layerProfile.moireLayerGain || 1 : 1;

        for (let i = 0; i < layers; i++) {
            const radius = (i + 1) * 30 * (1 + energy * 0.35) * (0.8 + anchor.scale * 0.6);
            const alpha = (0.08 + intensity * 0.12) * (1 - i / layers) * anchor.alpha * alphaMultiplier * moireLayerGain;
            const angle = time * (0.5 + intensity * 0.4) + i * 0.6 + anchor.parallax * 3;

            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(angle);

            ctx.strokeStyle = `hsla(${(accentHue + i * 14) % 360}, 92%, 68%, ${alpha})`;
            ctx.lineWidth = (1 + intensity * 0.4) * (this.layerProfile ? this.layerProfile.lineWidthGain || 1 : 1);

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

    renderAudioRipples(ctx, centerX, centerY, energy, peak, hue, time) {
        if (!energy || energy <= 0.01) return;

        const layers = 3;
        const anchor = this.projectPortalPoint(0, 0, {
            time,
            rotX: this.rotation4D.rot4dXW,
            rotY: this.rotation4D.rot4dYW,
            rotZ: this.rotation4D.rot4dZW,
            energy,
            glitch: this.state.glitch,
            variant: this.state.geometryVariant,
            density: this.state.density || 1
        });

        const px = centerX + anchor.x;
        const py = centerY + anchor.y;
        const rippleGain = this.layerProfile ? this.layerProfile.rippleGain || 1 : 1;
        const baseRadius = (40 + energy * 160) * (0.8 + anchor.scale * 0.5);
        const brightness = peak ? 82 : 68;
        const accentHue = this.normalizeHue(hue + 24);

        ctx.save();
        ctx.translate(px, py);
        ctx.globalCompositeOperation = 'screen';

        for (let i = 0; i < layers; i++) {
            const progress = i / layers;
            const radius = baseRadius * (1 + progress * 0.8 + Math.sin(time * 2 + progress * 5) * energy * 0.25) * rippleGain;
            const alpha = (0.18 + energy * 0.32) * (1 - progress * 0.3) * anchor.alpha;

            ctx.lineWidth = 2 + energy * 3 - progress * 1.2;
            ctx.strokeStyle = `hsla(${(accentHue + progress * 36) % 360}, 100%, ${brightness - progress * 14}%, ${alpha})`;
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
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