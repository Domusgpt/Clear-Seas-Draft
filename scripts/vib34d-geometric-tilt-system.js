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
        const centerX = width / 2;
        const centerY = height / 2;
        const time = Date.now() * 0.001;

        // Use 4D rotation for geometric transformation
        const rotX = this.rotation4D.rot4dXW;
        const rotY = this.rotation4D.rot4dYW;
        const rotZ = this.rotation4D.rot4dZW;

        // Create geometric patterns based on system type and tilt
        switch (this.systemType) {
            case 'quantum':
                this.renderQuantumTiltPattern(ctx, centerX, centerY, rotX, rotY, rotZ, time);
                break;
            case 'holographic':
                this.renderHolographicTiltPattern(ctx, centerX, centerY, rotX, rotY, rotZ, time);
                break;
            case 'faceted':
                this.renderFacetedTiltPattern(ctx, centerX, centerY, rotX, rotY, rotZ, time);
                break;
            default:
                this.renderFacetedTiltPattern(ctx, centerX, centerY, rotX, rotY, rotZ, time);
        }
    }

    renderQuantumTiltPattern(ctx, centerX, centerY, rotX, rotY, rotZ, time) {
        const gridSize = 40 - this.parameters.gridDensity;
        const intensity = this.parameters.intensity;

        ctx.strokeStyle = `hsla(${this.parameters.hue}, 70%, 60%, ${intensity * 0.6})`;
        ctx.lineWidth = 1 + intensity;

        for (let x = -200; x < 200; x += gridSize) {
            for (let y = -200; y < 200; y += gridSize) {
                const px = centerX + x * (1 + rotY * 0.5);
                const py = centerY + y * (1 + rotX * 0.5);

                const distance = Math.hypot(px - centerX, py - centerY);
                const wave = Math.sin(distance * 0.02 + time + rotZ * 2) * 0.5 + 0.5;
                const alpha = (1 - distance / 300) * wave * intensity;

                if (alpha > 0.1) {
                    ctx.globalAlpha = alpha;
                    ctx.beginPath();
                    ctx.arc(px, py, 2 + wave * 3, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }
        }

        ctx.globalAlpha = 1;
    }

    renderHolographicTiltPattern(ctx, centerX, centerY, rotX, rotY, rotZ, time) {
        const layers = 5;
        const intensity = this.parameters.intensity;

        for (let i = 0; i < layers; i++) {
            const radius = 50 + i * 30;
            const alpha = intensity * (1 - i / layers);

            ctx.strokeStyle = `hsla(${this.parameters.hue + i * 20}, 80%, 70%, ${alpha})`;
            ctx.lineWidth = 2;

            const offsetX = Math.sin(rotY + time) * 20;
            const offsetY = Math.cos(rotX + time) * 20;

            ctx.beginPath();
            ctx.ellipse(
                centerX + offsetX,
                centerY + offsetY,
                radius * (1 + rotX * 0.2),
                radius * (1 + rotY * 0.2),
                rotZ + time,
                0,
                Math.PI * 2
            );
            ctx.stroke();
        }
    }

    renderFacetedTiltPattern(ctx, centerX, centerY, rotX, rotY, rotZ, time) {
        const sides = 6;
        const radius = 80;
        const intensity = this.parameters.intensity;

        ctx.strokeStyle = `hsla(${this.parameters.hue}, 70%, 60%, ${intensity})`;
        ctx.fillStyle = `hsla(${this.parameters.hue}, 70%, 60%, ${intensity * 0.3})`;
        ctx.lineWidth = 2;

        const angle = rotZ + time * 0.5;
        const scaleX = 1 + rotY * 0.3;
        const scaleY = 1 + rotX * 0.3;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(scaleX, scaleY);
        ctx.rotate(angle);

        ctx.beginPath();
        for (let i = 0; i <= sides; i++) {
            const a = (i / sides) * Math.PI * 2;
            const x = Math.cos(a) * radius;
            const y = Math.sin(a) * radius;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.fill();
        ctx.stroke();

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