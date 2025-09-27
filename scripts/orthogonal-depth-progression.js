/**
 * ORTHOGONAL DEPTH PROGRESSION SYSTEM
 * Professional avant-garde card progression through Z-axis depth
 * Cards emerge from screen depths with portal-style text visualizers
 * A Paul Phillips Manifestation - Paul@clearseassolutions.com
 */

class OrthogonalDepthProgression {
    constructor() {
        this.cards = [];
        this.currentIndex = 0;
        this.isAutoProgressing = false;
        this.autoProgressInterval = null;
        this.progressionStates = ['far-depth', 'approaching', 'focused', 'exiting', 'destroyed'];

        // Progression timing
        this.timings = {
            cardTransition: 800,
            autoProgressDelay: 4000,
            destructionDelay: 1200,
            portalActivation: 300
        };

        // Scroll-to-progress system
        this.scrollAccumulator = 0;
        this.scrollThreshold = 100;
        this.isScrollProgression = true;
        this.pendingTransferPayload = null;

        this.init();
    }

    init() {
        console.log('🎯 Initializing Orthogonal Depth Progression System...');

        this.findProgressionCards();
        this.setupScrollProgression();
        this.setupKeyboardControls();
        this.initializePortalVisualizers();
        this.setInitialPositions();

        console.log('✅ Orthogonal Depth Progression initialized - Professional Avant-garde Mode');
    }

    findProgressionCards() {
        this.cards = Array.from(document.querySelectorAll('.progression-card'));
        console.log(`🎨 Found ${this.cards.length} progression cards`);
    }

    setupScrollProgression() {
        // Intercept scroll events and convert to Z-axis progression
        let scrollTimeout;

        window.addEventListener('wheel', (event) => {
            event.preventDefault(); // Block traditional scrolling

            this.scrollAccumulator += event.deltaY;

            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.handleScrollProgression();
            }, 50);

        }, { passive: false });

        // Touch support for mobile
        this.setupTouchProgression();
    }

    setupTouchProgression() {
        let startY = 0;
        let currentY = 0;

        document.addEventListener('touchstart', (event) => {
            startY = event.touches[0].clientY;
        });

        document.addEventListener('touchmove', (event) => {
            event.preventDefault(); // Block traditional scrolling
            currentY = event.touches[0].clientY;
            const deltaY = startY - currentY;

            if (Math.abs(deltaY) > 30) {
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
            // Decay scroll accumulator
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
        // Create canvas for portal visualization
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

        // Create portal visualizer instance
        const portalVisualizer = new PortalTextVisualizer(canvas, systemType, cardIndex);

        // Store reference on card
        portalElement.portalVisualizer = portalVisualizer;
    }

    prepareTransferFromCard(card) {
        if (!card) return null;
        const payload = this.captureCardSignature(card);
        this.pendingTransferPayload = payload;
        return payload;
    }

    captureCardSignature(card) {
        if (!card) return null;
        const tiltSystem = window.geometricTiltSystem;
        if (!tiltSystem || typeof tiltSystem.getVisualizerForCard !== 'function') {
            return null;
        }

        const visualizer = tiltSystem.getVisualizerForCard(card);
        if (!visualizer || typeof visualizer.createTransferPayload !== 'function') {
            return null;
        }

        try {
            return visualizer.createTransferPayload();
        } catch (error) {
            console.warn('⚠️ Failed to capture card signature', error);
            return null;
        }
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

        this.activatePortalForCard(this.cards[0]);
    }

    nextCard() {
        if (this.currentIndex >= this.cards.length - 1) {
            // Loop to beginning with destruction animation
            this.destroyCurrentCard(() => {
                this.currentIndex = 0;
                this.progressToCurrentCard();
            });
            return;
        }

        this.progressToCard(this.currentIndex + 1);
    }

    previousCard() {
        const currentCard = this.cards[this.currentIndex];
        this.prepareTransferFromCard(currentCard);

        if (this.currentIndex <= 0) {
            this.currentIndex = this.cards.length - 1;
        } else {
            this.currentIndex--;
        }
        this.progressToCurrentCard();
    }

    goToCard(index) {
        if (index >= 0 && index < this.cards.length && index !== this.currentIndex) {
            const currentCard = this.cards[this.currentIndex];
            this.prepareTransferFromCard(currentCard);
            this.currentIndex = index;
            this.progressToCurrentCard();
        }
    }

    progressToCard(newIndex) {
        const currentCard = this.cards[this.currentIndex];
        const newCard = this.cards[newIndex];

        this.prepareTransferFromCard(currentCard);

        // Deactivate current card portal
        this.deactivatePortalForCard(currentCard);

        // Exit current card
        this.setCardState(currentCard, 'exiting');

        // Bring new card forward through progression states
        setTimeout(() => {
            this.setCardState(newCard, 'approaching');

            setTimeout(() => {
                this.setCardState(newCard, 'focused');
                this.currentIndex = newIndex;
                this.activatePortalForCard(newCard);

                // Move old card to far depth
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
            } else if (index < this.currentIndex) {
                this.setCardState(card, 'far-depth');
                this.deactivatePortalForCard(card);
            } else {
                this.setCardState(card, 'far-depth');
                this.deactivatePortalForCard(card);
            }
        });
    }

    setCardState(card, state) {
        // Remove all progression state classes
        this.progressionStates.forEach(s => card.classList.remove(s));

        // Add new state
        card.classList.add(state);

        // Update card z-index based on state
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
        }

        this.updateCardVisualSystems(card, state);
    }

    updateCardVisualSystems(card, state, options = {}) {
        const tiltSystem = window.geometricTiltSystem;
        const visualizer = tiltSystem && typeof tiltSystem.getVisualizerForCard === 'function'
            ? tiltSystem.getVisualizerForCard(card)
            : null;

        const portalElement = card.querySelector('.portal-text-visualizer');
        const portalVisualizer = portalElement?.portalVisualizer;

        const visualOptions = { ...options };

        if (state === 'approaching' && !visualOptions.transferPreview && this.pendingTransferPayload) {
            visualOptions.transferPreview = this.pendingTransferPayload;
        }

        if (state === 'focused' && !visualOptions.transferSignature && this.pendingTransferPayload) {
            visualOptions.transferSignature = this.pendingTransferPayload;
        }

        if (visualizer && typeof visualizer.setState === 'function') {
            visualizer.setState(state, visualOptions);
        }

        if (portalVisualizer && typeof portalVisualizer.setCardState === 'function') {
            portalVisualizer.setCardState(state, visualOptions);
        }

        if (state === 'focused') {
            if (portalVisualizer && typeof portalVisualizer.activate === 'function') {
                portalVisualizer.activate();
            }
            if (visualOptions.transferSignature) {
                this.pendingTransferPayload = null;
            }
        } else {
            if ((state === 'far-depth' || state === 'destroyed') && portalVisualizer && typeof portalVisualizer.deactivate === 'function') {
                portalVisualizer.deactivate();
            }
        }
    }

    activatePortalForCard(card) {
        const portal = card.querySelector('.portal-text-visualizer');
        if (portal && portal.portalVisualizer) {
            portal.portalVisualizer.activate();
        }

        // Add glow effect to card title
        const title = card.querySelector('.card-title');
        if (title) {
            title.style.textShadow = '0 0 20px var(--clear-seas-primary), 0 0 40px var(--clear-seas-primary)';
            title.style.transform = 'scale(1.05)';
        }
    }

    deactivatePortalForCard(card) {
        const portal = card.querySelector('.portal-text-visualizer');
        if (portal && portal.portalVisualizer) {
            portal.portalVisualizer.deactivate();
        }

        // Remove glow effect from card title
        const title = card.querySelector('.card-title');
        if (title) {
            title.style.textShadow = '';
            title.style.transform = '';
        }
    }

    destroyCurrentCard(callback) {
        const currentCard = this.cards[this.currentIndex];
        const destructionType = currentCard.dataset.destruction || 'quantum';

        this.prepareTransferFromCard(currentCard);

        // Apply unique destruction animation
        this.setCardState(currentCard, 'destroyed');
        currentCard.classList.add(`destruction-${destructionType}`);

        // Deactivate portal
        this.deactivatePortalForCard(currentCard);

        // Reset card after destruction animation
        setTimeout(() => {
            currentCard.classList.remove(`destruction-${destructionType}`);
            this.setCardState(currentCard, 'far-depth');
            if (callback) callback();
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

        this.cards.forEach(card => {
            const portal = card.querySelector('.portal-text-visualizer');
            if (portal && portal.portalVisualizer) {
                portal.portalVisualizer.destroy();
            }
        });

        console.log('🗑️ Orthogonal Depth Progression destroyed');
    }
}

/**
 * PORTAL TEXT VISUALIZER
 * Creates portal-style visualizations within focused card text
 */
class PortalTextVisualizer {
    constructor(canvas, systemType, cardIndex) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.systemType = systemType;
        this.cardIndex = cardIndex;
        this.isActive = false;
        this.animationFrame = null;

        // Portal parameters
        this.portalDepth = 0;
        this.targetDepth = 0;
        this.portalRotation = 0;
        this.portalPulse = 0;

        this.stateDynamics = {
            intensity: 0,
            targetIntensity: 0,
            rotationSpeed: 0.02,
            targetRotationSpeed: 0.02,
            hueShift: 0,
            targetHueShift: 0,
            glitch: 0,
            targetGlitch: 0,
            moire: 0,
            targetMoire: 0
        };
        this.inherited = {
            hueShift: 0,
            glitch: 0,
            moire: 0
        };
        this.preview = {
            hueShift: 0,
            glitch: 0,
            moire: 0
        };

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
            this.context.setTransform(1, 0, 0, 1, 0, 0);
            this.context.scale(dpr, dpr);
        };

        resizeCanvas();

        const resizeObserver = new ResizeObserver(resizeCanvas);
        resizeObserver.observe(this.canvas);
    }

    activate() {
        this.isActive = true;
        this.targetDepth = 1.0;
        this.startRenderLoop();
        console.log(`🌀 Portal activated for ${this.systemType} system`);
    }

    deactivate() {
        this.isActive = false;
        this.targetDepth = 0;
        setTimeout(() => {
            this.stopRenderLoop();
        }, 500);
    }

    setCardState(state, options = {}) {
        const transitions = {
            'far-depth': { intensity: 0.15, rotationSpeed: 0.015, hueShift: 0, glitch: 0.05, moire: 0.05 },
            approaching: { intensity: 0.5, rotationSpeed: 0.035, hueShift: 0.08, glitch: 0.18, moire: 0.25 },
            focused: { intensity: 0.95, rotationSpeed: 0.07, hueShift: 0.22, glitch: 0.45, moire: 0.7 },
            exiting: { intensity: 0.3, rotationSpeed: 0.028, hueShift: -0.05, glitch: 0.12, moire: 0.2 },
            destroyed: { intensity: 0.05, rotationSpeed: 0.1, hueShift: 0.35, glitch: 0.75, moire: 1.0 }
        };

        const config = transitions[state] || transitions['far-depth'];
        this.stateDynamics.targetIntensity = config.intensity;
        this.stateDynamics.targetRotationSpeed = config.rotationSpeed;
        this.stateDynamics.targetHueShift = config.hueShift;
        this.stateDynamics.targetGlitch = config.glitch;
        this.stateDynamics.targetMoire = config.moire;

        if (options.transferSignature) {
            this.absorbTransferPayload(options.transferSignature);
            this.previewTransferPayload(null);
        } else if (options.transferPreview) {
            this.previewTransferPayload(options.transferPreview);
        } else {
            this.previewTransferPayload(null);
        }

        if (state === 'destroyed') {
            this.targetDepth = 0;
        }
    }

    previewTransferPayload(payload) {
        if (!payload) {
            this.preview.hueShift = 0;
            this.preview.glitch = 0;
            this.preview.moire = 0;
            return;
        }

        this.preview.hueShift = typeof payload.hue === 'number' ? (payload.hue - this.getBaseHue()) * 0.4 : 0;
        this.preview.glitch = typeof payload.glitch === 'number' ? payload.glitch * 0.4 : 0;
        this.preview.moire = typeof payload.moire === 'number' ? payload.moire * 0.5 : 0;
    }

    absorbTransferPayload(payload) {
        if (!payload) return;

        if (typeof payload.hue === 'number') {
            const hueDelta = payload.hue - this.getBaseHue();
            this.inherited.hueShift += hueDelta * 0.45;
        }

        if (typeof payload.glitch === 'number') {
            this.inherited.glitch = Math.max(this.inherited.glitch, payload.glitch * 0.45);
        }

        if (typeof payload.moire === 'number') {
            this.inherited.moire = Math.max(this.inherited.moire, payload.moire * 0.55);
        }
    }

    getBaseHue() {
        switch (this.systemType) {
            case 'quantum':
                return 280;
            case 'holographic':
                return 330;
            case 'faceted':
                return 200;
            default:
                return 260;
        }
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
        // Smooth portal depth transition
        this.portalDepth += (this.targetDepth - this.portalDepth) * 0.08;

        // Portal animation
        this.updateDynamics();
        this.portalRotation += this.stateDynamics.rotationSpeed;
        const pulseSpeed = 0.003 + this.stateDynamics.moire * 0.002;
        this.portalPulse = Math.sin(Date.now() * pulseSpeed) * (0.4 + this.stateDynamics.intensity * 0.35) + 0.5;
    }

    updateDynamics() {
        const smoothing = 0.075;
        const lerp = (current, target) => current + (target - current) * smoothing;

        this.stateDynamics.intensity = lerp(this.stateDynamics.intensity, this.stateDynamics.targetIntensity);
        this.stateDynamics.rotationSpeed = lerp(this.stateDynamics.rotationSpeed, this.stateDynamics.targetRotationSpeed);
        this.stateDynamics.hueShift = lerp(this.stateDynamics.hueShift, this.stateDynamics.targetHueShift);
        this.stateDynamics.glitch = lerp(this.stateDynamics.glitch, this.stateDynamics.targetGlitch);
        this.stateDynamics.moire = lerp(this.stateDynamics.moire, this.stateDynamics.targetMoire);

        this.inherited.hueShift *= 0.987;
        this.inherited.glitch *= 0.985;
        this.inherited.moire *= 0.984;

        this.preview.hueShift *= 0.9;
        this.preview.glitch *= 0.9;
        this.preview.moire *= 0.9;
    }

    getEffectiveHue() {
        const totalShift = this.stateDynamics.hueShift + this.inherited.hueShift + this.preview.hueShift;
        let hue = this.getBaseHue() + totalShift * 140;
        hue = ((hue % 360) + 360) % 360;
        return hue;
    }

    getRenderState() {
        const intensity = Math.max(0, Math.min(1.2, this.portalDepth * (0.5 + this.stateDynamics.intensity)));
        const glitch = Math.min(1.2, Math.max(0, this.stateDynamics.glitch + this.inherited.glitch + this.preview.glitch));
        const moire = Math.min(1.2, Math.max(0, this.stateDynamics.moire + this.inherited.moire + this.preview.moire));

        return {
            intensity,
            hue: this.getEffectiveHue(),
            glitch,
            moire,
            pulse: this.portalPulse,
            rotation: this.portalRotation,
            depth: this.portalDepth
        };
    }

    renderPortal() {
        const ctx = this.context;
        const width = this.canvas.width / (window.devicePixelRatio || 1);
        const height = this.canvas.height / (window.devicePixelRatio || 1);

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        if (this.portalDepth < 0.01) return;

        const centerX = width / 2;
        const centerY = height / 2;
        const state = this.getRenderState();

        // Render portal based on system type
        switch (this.systemType) {
            case 'quantum':
                this.renderQuantumPortal(ctx, centerX, centerY, state);
                break;
            case 'holographic':
                this.renderHolographicPortal(ctx, centerX, centerY, state);
                break;
            case 'faceted':
                this.renderFacetedPortal(ctx, centerX, centerY, state);
                break;
        }
    }

    renderQuantumPortal(ctx, centerX, centerY, state) {
        const rings = 8;
        const maxRadius = Math.min(centerX, centerY) * 0.8;

        for (let i = 0; i < rings; i++) {
            const progress = i / rings;
            const radius = maxRadius * (1 - progress) * (0.4 + state.intensity * 0.8);
            const alpha = state.intensity * (1 - progress) * state.pulse;

            if (alpha > 0.05) {
                const hue = (state.hue + progress * 20 + state.moire * 40) % 360;
                ctx.strokeStyle = `hsla(${hue}, 70%, ${60 + progress * 20}%, ${alpha})`;
                ctx.lineWidth = 2 + progress * 3 + state.glitch * 1.5;

                ctx.beginPath();
                const ripple = Math.sin(progress * 6 + state.rotation * 2) * state.moire * 8;
                ctx.arc(centerX, centerY, radius + ripple, 0, Math.PI * 2);
                ctx.stroke();
            }
        }

        // Central quantum glow
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 60 * (0.5 + state.intensity));
        gradient.addColorStop(0, `hsla(${(state.hue + 30) % 360}, 85%, 65%, ${state.intensity * 0.6})`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, centerX * 2, centerY * 2);
    }

    renderHolographicPortal(ctx, centerX, centerY, state) {
        const layers = 6;
        const maxRadius = Math.min(centerX, centerY) * 0.9;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(state.rotation);

        for (let i = 0; i < layers; i++) {
            const progress = i / layers;
            const radius = maxRadius * (1 - progress * 0.8) * (0.5 + state.intensity * 0.7);
            const alpha = state.intensity * (1 - progress) * 0.65;

            const hue = (state.hue + i * 18 + state.moire * 40) % 360;
            ctx.strokeStyle = `hsla(${hue}, 80%, 70%, ${alpha})`;
            ctx.lineWidth = 1 + progress * 2 + state.glitch;

            // Create holographic interference pattern
            const sides = 8 + i * 2 + Math.round(state.moire * 4);
            ctx.beginPath();
            for (let j = 0; j <= sides; j++) {
                const angle = (j / sides) * Math.PI * 2;
                const ripple = Math.sin(angle * (3 + state.moire * 2) + state.rotation * 3) * 0.12 * state.moire;
                const x = Math.cos(angle) * radius * (1 + ripple);
                const y = Math.sin(angle) * radius * (1 - ripple);

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

    renderFacetedPortal(ctx, centerX, centerY, state) {
        const facets = 12;
        const maxRadius = Math.min(centerX, centerY) * 0.7;

        ctx.save();
        ctx.translate(centerX, centerY);

        for (let i = 0; i < facets; i++) {
            const angle = (i / facets) * Math.PI * 2 + state.rotation;
            const radius = maxRadius * (0.4 + state.intensity * 0.6) * (0.5 + state.pulse * 0.4);

            const hue = (state.hue + i * 6) % 360;
            ctx.strokeStyle = `hsla(${hue}, 70%, 60%, ${state.intensity * 0.85})`;
            ctx.fillStyle = `hsla(${(hue + 20) % 360}, 70%, 60%, ${state.intensity * 0.25})`;
            ctx.lineWidth = 2 + state.glitch;

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(
                Math.cos(angle) * radius * (1 + state.glitch * 0.1),
                Math.sin(angle) * radius * (1 - state.glitch * 0.08)
            );
            ctx.lineTo(
                Math.cos(angle + Math.PI / facets) * radius * (1 + state.moire * 0.08),
                Math.sin(angle + Math.PI / facets) * radius * (1 - state.moire * 0.08)
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

// Export for global use
window.OrthogonalDepthProgression = OrthogonalDepthProgression;
window.PortalTextVisualizer = PortalTextVisualizer;