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
    }

    getVisualizerForCard(card) {
        if (!card) return null;
        const canvas = card.querySelector('.vib34d-tilt-canvas');
        if (!canvas) return null;
        return this.visualizers.get(canvas.id) || null;
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
    constructor(canvas, systemType) {
        this.canvas = canvas;
        this.systemType = systemType;
        this.context = null;
        this.rotation4D = { rot4dXW: 0, rot4dYW: 0, rot4dZW: 0 };

        // VIB34D Parameters from Paul Phillips' system
        this.parameters = this.getVIB34DParametersForSystem(systemType);

        this.state = 'far-depth';
        this.dynamics = {
            speed: 0.3,
            targetSpeed: 0.3,
            glitch: 0,
            targetGlitch: 0,
            moire: 0,
            targetMoire: 0,
            densityDrop: 0,
            targetDensityDrop: 0,
            hueShift: 0,
            targetHueShift: 0
        };
        this.inherited = {
            hueShift: 0,
            glitchBoost: 0,
            moireBoost: 0,
            densityMemory: 0
        };
        this.preview = {
            hueShift: 0,
            glitchBoost: 0,
            moireBoost: 0,
            densityMemory: 0
        };
        this.destructionEvent = null;
        this.lastStateChange = performance.now();

        this.init();
    }

    init() {
        this.setupCanvas();
        this.startRenderLoop();
    }

    setupCanvas() {
        this.context = this.canvas.getContext('2d');
        this.resizeCanvas();

        // Resize observer
        const resizeObserver = new ResizeObserver(() => {
            this.resizeCanvas();
        });
        resizeObserver.observe(this.canvas);
    }

    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.scale(dpr, dpr);
    }

    getVIB34DParametersForSystem(systemType) {
        const configs = {
            quantum: {
                gridDensity: 20,
                morphFactor: 1.5,
                chaos: 0.3,
                hue: 280,
                intensity: 0.8,
                geometry: 3
            },
            holographic: {
                gridDensity: 25,
                morphFactor: 1.8,
                chaos: 0.4,
                hue: 330,
                intensity: 0.9,
                geometry: 7
            },
            faceted: {
                gridDensity: 15,
                morphFactor: 1.0,
                chaos: 0.2,
                hue: 200,
                intensity: 0.7,
                geometry: 0
            }
        };
        return configs[systemType] || configs.faceted;
    }

    setState(state, options = {}) {
        this.state = state;
        const transitions = {
            'far-depth': { speed: 0.25, glitch: 0.05, moire: 0.05, densityDrop: 0.05, hueShift: 0 },
            approaching: { speed: 0.55, glitch: 0.25, moire: 0.35, densityDrop: 0.25, hueShift: 0.1 },
            focused: { speed: 1.0, glitch: 0.75, moire: 0.85, densityDrop: 0.65, hueShift: 0.25 },
            exiting: { speed: 0.45, glitch: 0.2, moire: 0.25, densityDrop: 0.35, hueShift: -0.05 },
            destroyed: { speed: 1.35, glitch: 1.0, moire: 1.0, densityDrop: 0.8, hueShift: 0.35 }
        };

        const config = transitions[state] || transitions['far-depth'];
        this.dynamics.targetSpeed = config.speed;
        this.dynamics.targetGlitch = config.glitch;
        this.dynamics.targetMoire = config.moire;
        this.dynamics.targetDensityDrop = config.densityDrop;
        this.dynamics.targetHueShift = config.hueShift;

        if (options.transferSignature) {
            this.absorbTransferPayload(options.transferSignature);
            this.previewTransferPayload(null);
        } else if (options.transferPreview) {
            this.previewTransferPayload(options.transferPreview);
        } else {
            this.previewTransferPayload(null);
        }

        if (state === 'destroyed') {
            this.triggerDestructionFlourish();
        }

        this.lastStateChange = performance.now();
    }

    previewTransferPayload(payload) {
        if (!payload) {
            this.preview.hueShift = 0;
            this.preview.glitchBoost = 0;
            this.preview.moireBoost = 0;
            this.preview.densityMemory = 0;
            return;
        }

        this.preview.hueShift = typeof payload.hue === 'number' ? (payload.hue - this.parameters.hue) * 0.35 : 0;
        this.preview.glitchBoost = typeof payload.glitch === 'number' ? payload.glitch * 0.35 : 0;
        this.preview.moireBoost = typeof payload.moire === 'number' ? payload.moire * 0.4 : 0;
        this.preview.densityMemory = typeof payload.densityDrop === 'number' ? payload.densityDrop * 0.25 : 0;
    }

    absorbTransferPayload(payload) {
        if (!payload) return;

        if (typeof payload.hue === 'number') {
            const hueDelta = payload.hue - this.parameters.hue;
            this.inherited.hueShift += hueDelta * 0.45;
        }

        if (typeof payload.glitch === 'number') {
            this.inherited.glitchBoost = Math.max(this.inherited.glitchBoost, payload.glitch * 0.4);
        }

        if (typeof payload.moire === 'number') {
            this.inherited.moireBoost = Math.max(this.inherited.moireBoost, payload.moire * 0.5);
        }

        if (typeof payload.densityDrop === 'number') {
            this.inherited.densityMemory = Math.max(this.inherited.densityMemory, payload.densityDrop * 0.3);
        }

        if (typeof payload.geometry === 'number') {
            this.parameters.geometry = payload.geometry;
        }
    }

    updateDynamics() {
        const smoothing = 0.08;
        const lerp = (current, target) => current + (target - current) * smoothing;

        this.dynamics.speed = lerp(this.dynamics.speed, this.dynamics.targetSpeed);
        this.dynamics.glitch = lerp(this.dynamics.glitch, this.dynamics.targetGlitch);
        this.dynamics.moire = lerp(this.dynamics.moire, this.dynamics.targetMoire);
        this.dynamics.densityDrop = lerp(this.dynamics.densityDrop, this.dynamics.targetDensityDrop);
        this.dynamics.hueShift = lerp(this.dynamics.hueShift, this.dynamics.targetHueShift);

        this.inherited.hueShift *= 0.985;
        this.inherited.glitchBoost *= 0.987;
        this.inherited.moireBoost *= 0.985;
        this.inherited.densityMemory *= 0.982;

        this.preview.hueShift *= 0.92;
        this.preview.glitchBoost *= 0.9;
        this.preview.moireBoost *= 0.9;
        this.preview.densityMemory *= 0.9;

        if (this.destructionEvent) {
            this.destructionEvent.progress += 0.02 * (1 + this.dynamics.speed);
            if (this.destructionEvent.progress >= 1.1) {
                this.destructionEvent = null;
            }
        }
    }

    createTransferPayload() {
        const hue = this.getEffectiveHue();
        return {
            hue,
            glitch: this.dynamics.glitch + this.inherited.glitchBoost,
            moire: this.dynamics.moire + this.inherited.moireBoost,
            densityDrop: this.dynamics.densityDrop + this.inherited.densityMemory,
            geometry: this.parameters.geometry
        };
    }

    getEffectiveHue() {
        const totalHueShift = this.dynamics.hueShift + this.inherited.hueShift + this.preview.hueShift;
        let hue = this.parameters.hue + totalHueShift * 120;
        hue = ((hue % 360) + 360) % 360;
        return hue;
    }

    triggerDestructionFlourish() {
        this.destructionEvent = {
            progress: 0,
            rippleSeed: Math.random() * 1000
        };
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
        const width = this.canvas.width / (window.devicePixelRatio || 1);
        const height = this.canvas.height / (window.devicePixelRatio || 1);

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Render tilt-responsive VIB34D visualization
        this.renderTiltResponsiveGeometry(ctx, width, height);
    }

    renderTiltResponsiveGeometry(ctx, width, height) {
        this.updateDynamics();

        const centerX = width / 2;
        const centerY = height / 2;
        const speedMultiplier = 0.6 + this.dynamics.speed * 1.4 + this.inherited.glitchBoost * 0.3 + this.preview.glitchBoost * 0.3;
        const time = Date.now() * 0.001 * speedMultiplier;

        const state = {
            glitch: Math.min(1.2, Math.max(0, this.dynamics.glitch + this.inherited.glitchBoost + this.preview.glitchBoost)),
            moire: Math.min(1.2, Math.max(0, this.dynamics.moire + this.inherited.moireBoost + this.preview.moireBoost)),
            densityDrop: Math.min(1, Math.max(0, this.dynamics.densityDrop + this.inherited.densityMemory + this.preview.densityMemory)),
            hue: this.getEffectiveHue(),
            speed: speedMultiplier
        };

        // Use 4D rotation for geometric transformation
        const rotX = this.rotation4D.rot4dXW;
        const rotY = this.rotation4D.rot4dYW;
        const rotZ = this.rotation4D.rot4dZW;

        // Create geometric patterns based on system type and tilt
        switch (this.systemType) {
            case 'quantum':
                this.renderQuantumTiltPattern(ctx, centerX, centerY, rotX, rotY, rotZ, time, state);
                break;
            case 'holographic':
                this.renderHolographicTiltPattern(ctx, centerX, centerY, rotX, rotY, rotZ, time, state);
                break;
            case 'faceted':
                this.renderFacetedTiltPattern(ctx, centerX, centerY, rotX, rotY, rotZ, time, state);
                break;
            default:
                this.renderFacetedTiltPattern(ctx, centerX, centerY, rotX, rotY, rotZ, time, state);
        }

        if (this.destructionEvent) {
            this.renderDestructionFlourish(ctx, centerX, centerY, width, height, state);
        }
    }

    renderQuantumTiltPattern(ctx, centerX, centerY, rotX, rotY, rotZ, time, state) {
        const baseSpacing = Math.max(6, 40 - this.parameters.gridDensity);
        const spacing = baseSpacing * (1 + state.densityDrop * 1.6);
        const intensity = this.parameters.intensity + state.glitch * 0.25;
        const hue = state.hue;
        const glitch = state.glitch;
        const moire = state.moire;

        ctx.lineWidth = 1.2 + intensity;

        for (let x = -220; x < 220; x += spacing) {
            for (let y = -220; y < 220; y += spacing) {
                const jitterX = Math.sin((x + y) * 0.05 + time * 6) * glitch * 8;
                const jitterY = Math.cos((x - y) * 0.05 + time * 5.2) * glitch * 8;
                const px = centerX + (x + jitterX) * (1 + rotY * 0.45);
                const py = centerY + (y + jitterY) * (1 + rotX * 0.45);

                const distance = Math.hypot(px - centerX, py - centerY);
                const moireWave = Math.sin((px + py) * 0.02 * (1 + moire * 3) + time * (2.4 + moire * 5));
                const wave = Math.sin(distance * 0.018 + time * (1.2 + glitch) + rotZ * 1.8) * 0.5 + 0.5;
                const alpha = Math.max(0, (1 - distance / 320) * (wave * 0.9 + moireWave * 0.2) * intensity);

                if (alpha > 0.08) {
                    ctx.globalAlpha = alpha;
                    ctx.strokeStyle = `hsla(${(hue + moireWave * 25) % 360}, 75%, ${60 + wave * 20}%, ${alpha})`;
                    ctx.beginPath();
                    const radius = 2.5 + wave * 4 + moire * 2;
                    ctx.arc(px, py, radius, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }
        }

        ctx.globalAlpha = 1;
    }

    renderHolographicTiltPattern(ctx, centerX, centerY, rotX, rotY, rotZ, time, state) {
        const layers = 6;
        const intensity = this.parameters.intensity + state.glitch * 0.2;
        const hue = state.hue;
        const moire = state.moire;
        const glitch = state.glitch;

        for (let i = 0; i < layers; i++) {
            const progress = i / layers;
            const radius = 48 + i * 32 * (1 + state.densityDrop * 0.4);
            const alpha = intensity * (1 - progress * 0.9);

            const hueShift = hue + i * 18 + moire * 40;
            const lineWidth = 1.2 + progress * 2.5 + glitch * 1.2;
            const wobble = Math.sin(time * (2 + moire * 3) + i * 0.6);
            const offsetX = Math.sin(rotY * 2 + time * (1.4 + glitch)) * (18 + progress * 14);
            const offsetY = Math.cos(rotX * 2 + time * (1.2 + glitch * 0.5)) * (18 + progress * 18);

            ctx.strokeStyle = `hsla(${hueShift % 360}, 85%, ${65 + progress * 12}%, ${alpha})`;
            ctx.lineWidth = lineWidth;
            ctx.beginPath();
            ctx.ellipse(
                centerX + offsetX,
                centerY + offsetY,
                radius * (1 + rotX * 0.24 + wobble * 0.04),
                radius * (1 + rotY * 0.24 - wobble * 0.04),
                rotZ + time * (1.2 + moire),
                0,
                Math.PI * 2
            );
            ctx.stroke();

            // Draw inner moiré lines
            const interiorSides = Math.round(6 + moire * 6 + progress * 4);
            ctx.save();
            ctx.translate(centerX + offsetX, centerY + offsetY);
            ctx.rotate(time * (1.4 + moire) + i * 0.3);
            ctx.beginPath();
            for (let j = 0; j <= interiorSides; j++) {
                const angle = (j / interiorSides) * Math.PI * 2;
                const r = radius * 0.45 * (1 + Math.sin(angle * 3 + time * 3) * 0.08 * moire);
                const x = Math.cos(angle) * r;
                const y = Math.sin(angle) * r;
                if (j === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.strokeStyle = `hsla(${(hueShift + 120) % 360}, 80%, 70%, ${alpha * 0.6})`;
            ctx.lineWidth = Math.max(0.8, lineWidth * 0.4);
            ctx.stroke();
            ctx.restore();
        }
    }

    renderFacetedTiltPattern(ctx, centerX, centerY, rotX, rotY, rotZ, time, state) {
        const sides = Math.round(6 + state.moire * 6);
        const radius = 78 * (1 + state.densityDrop * 0.3);
        const intensity = this.parameters.intensity + state.moire * 0.15;
        const hue = state.hue;
        const glitch = state.glitch;

        ctx.strokeStyle = `hsla(${hue % 360}, 72%, ${60 + state.moire * 10}%, ${0.9 - state.densityDrop * 0.2})`;
        ctx.fillStyle = `hsla(${(hue + 30) % 360}, 70%, 55%, ${0.25 + state.densityDrop * 0.3})`;
        ctx.lineWidth = 2.4 + glitch * 1.5;

        const angle = rotZ + time * (0.45 + state.moire * 0.6);
        const scaleX = 1 + rotY * 0.28 + glitch * 0.15;
        const scaleY = 1 + rotX * 0.28 - glitch * 0.1;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(scaleX, scaleY);
        ctx.rotate(angle);

        ctx.beginPath();
        for (let i = 0; i <= sides; i++) {
            const a = (i / sides) * Math.PI * 2;
            const radialPulse = 1 + Math.sin(a * (3 + state.moire * 2) + time * (3 + glitch * 2)) * 0.08 * (1 + state.moire);
            const x = Math.cos(a) * radius * radialPulse;
            const y = Math.sin(a) * radius * radialPulse;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Inner lattice detail
        const innerSides = Math.round(4 + state.moire * 5);
        ctx.lineWidth = 1.4 + glitch;
        ctx.strokeStyle = `hsla(${(hue + 180) % 360}, 70%, 65%, ${0.6})`;
        for (let ring = 1; ring <= 3; ring++) {
            const ringRadius = (radius * 0.3) * ring;
            ctx.beginPath();
            for (let i = 0; i <= innerSides; i++) {
                const a = (i / innerSides) * Math.PI * 2;
                const x = Math.cos(a + rotZ * 0.5 + ring * 0.2) * ringRadius * (1 + glitch * 0.1);
                const y = Math.sin(a + rotZ * 0.5 + ring * 0.2) * ringRadius * (1 - glitch * 0.05);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        ctx.restore();
    }

    renderDestructionFlourish(ctx, centerX, centerY, width, height, state) {
        const progress = this.destructionEvent?.progress ?? 0;
        const eased = Math.min(1, progress);
        const alpha = 1 - Math.pow(eased, 1.5);
        if (alpha <= 0) return;

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const timeSeed = this.destructionEvent?.rippleSeed || 0;
        const time = (performance.now() + timeSeed) * 0.001;
        const hue = state.hue + eased * 120;

        const rippleRadius = Math.max(width, height) * (0.2 + eased * 0.9);
        const rippleWidth = Math.max(2, 12 - eased * 6);
        ctx.lineWidth = rippleWidth;
        ctx.strokeStyle = `hsla(${hue % 360}, 100%, 75%, ${alpha * 0.6})`;
        ctx.beginPath();
        ctx.arc(centerX, centerY, rippleRadius, 0, Math.PI * 2);
        ctx.stroke();

        const burstCount = Math.round(12 + state.moire * 10);
        for (let i = 0; i < burstCount; i++) {
            const angle = (i / burstCount) * Math.PI * 2 + time * 0.5;
            const length = rippleRadius * (0.3 + eased * 1.1);
            const jitter = Math.sin(angle * 7 + progress * 12) * state.glitch * 30;
            ctx.strokeStyle = `hsla(${(hue + i * 8) % 360}, 100%, 70%, ${alpha * (0.6 + state.glitch * 0.3)})`;
            ctx.lineWidth = Math.max(1.5, 3.5 - eased * 2 + state.glitch * 1.5);
            ctx.beginPath();
            ctx.moveTo(centerX + Math.cos(angle) * 20, centerY + Math.sin(angle) * 20);
            ctx.lineTo(
                centerX + Math.cos(angle) * (length + jitter),
                centerY + Math.sin(angle) * (length + jitter)
            );
            ctx.stroke();
        }

        // Central flash
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, rippleRadius * 0.4);
        gradient.addColorStop(0, `hsla(${(hue + 40) % 360}, 100%, 75%, ${alpha})`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(centerX - rippleRadius, centerY - rippleRadius, rippleRadius * 2, rippleRadius * 2);

        ctx.restore();
    }

    destroy() {
        // Clean up resources
        this.context = null;
    }
}

// Export for global use
window.VIB34DGeometricTiltSystem = VIB34DGeometricTiltSystem;
window.VIB34DTiltVisualizer = VIB34DTiltVisualizer;