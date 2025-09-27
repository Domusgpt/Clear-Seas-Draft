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

        this.pendingInheritedTrait = null;
        this.eventTarget = new EventTarget();

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
        const magnitude = Math.min(1, Math.abs(this.scrollAccumulator) / this.scrollThreshold);
        this.emit('scroll-accumulating', {
            accumulator: this.scrollAccumulator,
            magnitude
        });

        if (Math.abs(this.scrollAccumulator) > this.scrollThreshold) {
            const direction = this.scrollAccumulator > 0 ? 1 : -1;
            this.emit('scroll-threshold', { direction, magnitude });

            if (direction > 0) {
                this.nextCard();
            } else {
                this.previousCard();
            }
            this.scrollAccumulator = 0;
        } else {
            // Decay scroll accumulator
            this.scrollAccumulator *= 0.9;
            this.emit('scroll-decay', {
                accumulator: this.scrollAccumulator,
                magnitude: Math.min(1, Math.abs(this.scrollAccumulator) / this.scrollThreshold)
            });
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

    getVisualizerForCard(card) {
        const canvas = card.querySelector('.vib34d-tilt-canvas');
        if (canvas && canvas.vib34dVisualizer) {
            return canvas.vib34dVisualizer;
        }
        return null;
    }

    updateVisualizerState(card, state, options = {}) {
        const visualizer = this.getVisualizerForCard(card);
        if (!visualizer) return;

        if (state === 'destroyed') {
            visualizer.setCardState(state);
        } else {
            visualizer.setCardState(state, { inheritedTrait: options.inheritedTrait });
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
                const inheritedTrait = this.pendingInheritedTrait;
                this.currentIndex = 0;
                this.progressToCurrentCard(inheritedTrait);
            });
            return;
        }

        this.progressToCard(this.currentIndex + 1);
    }

    previousCard() {
        if (this.currentIndex <= 0) {
            this.currentIndex = this.cards.length - 1;
        } else {
            this.currentIndex--;
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
        const inheritedTrait = this.pendingInheritedTrait;
        this.pendingInheritedTrait = null;

        // Deactivate current card portal
        this.deactivatePortalForCard(currentCard);

        // Exit current card
        this.setCardState(currentCard, 'exiting');

        // Bring new card forward through progression states
        setTimeout(() => {
            this.setCardState(newCard, 'approaching', { inheritedTrait });

            setTimeout(() => {
                this.setCardState(newCard, 'focused', { inheritedTrait });
                this.currentIndex = newIndex;
                this.activatePortalForCard(newCard, inheritedTrait);

                // Move old card to far depth
                setTimeout(() => {
                    this.setCardState(currentCard, 'far-depth');
                }, this.timings.cardTransition);

            }, this.timings.cardTransition / 2);

        }, this.timings.cardTransition / 4);
    }

    progressToCurrentCard(inheritedTrait = null) {
        this.cards.forEach((card, index) => {
            if (index === this.currentIndex) {
                this.setCardState(card, 'focused', { inheritedTrait });
                this.activatePortalForCard(card, inheritedTrait);
            } else if (index < this.currentIndex) {
                this.setCardState(card, 'far-depth');
                this.deactivatePortalForCard(card);
            } else {
                this.setCardState(card, 'far-depth');
                this.deactivatePortalForCard(card);
            }
        });

        this.pendingInheritedTrait = null;
    }

    setCardState(card, state, options = {}) {
        const inheritedTrait = options.inheritedTrait;

        if (inheritedTrait) {
            card._pendingTrait = inheritedTrait;
        }

        const traitForVisualizer = inheritedTrait || card._pendingTrait || card._activeTrait || null;
        this.updateVisualizerState(card, state, { inheritedTrait: traitForVisualizer });

        this.progressionStates.forEach(s => card.classList.remove(s));
        card.classList.add(state);

        switch (state) {
            case 'focused':
                card.style.zIndex = 1000;
                if (card._pendingTrait) {
                    card._activeTrait = card._pendingTrait;
                    card._pendingTrait = null;
                }
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

        this.emit('card-state-changed', {
            card,
            state,
            inheritedTrait: traitForVisualizer
        });
    }

    activatePortalForCard(card, inheritedTrait = null) {
        const portal = card.querySelector('.portal-text-visualizer');
        if (portal && portal.portalVisualizer) {
            const trait = inheritedTrait || card._pendingTrait || card._activeTrait || null;
            if (trait && portal.portalVisualizer.applyInheritedTrait) {
                portal.portalVisualizer.applyInheritedTrait(trait);
            }
            portal.portalVisualizer.activate();
            this.emit('portal-activated', { card, trait });
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
            this.emit('portal-deactivated', { card });
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

        this.deactivatePortalForCard(currentCard);

        this.setCardState(currentCard, 'destroyed');

        const visualizer = this.getVisualizerForCard(currentCard);
        const inheritedTrait = visualizer ? visualizer.triggerDestructionSequence() : null;
        this.pendingInheritedTrait = inheritedTrait;

        this.emit('card-destroyed', { card: currentCard, trait: inheritedTrait });

        currentCard.classList.add(`destruction-${destructionType}`);

        setTimeout(() => {
            currentCard.classList.remove(`destruction-${destructionType}`);
            this.setCardState(currentCard, 'far-depth');
            if (callback) callback();
        }, this.timings.destructionDelay);
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

class OrthogonalAudioDriver {
    constructor(orchestrator, options = {}) {
        this.orchestrator = orchestrator;
        this.options = Object.assign({
            fftSize: 1024,
            smoothingTimeConstant: 0.85,
            minDecibels: -82,
            maxDecibels: -15,
            energyFloor: 0.05,
            peakThreshold: 0.68
        }, options);

        this.audioContext = null;
        this.mediaStream = null;
        this.source = null;
        this.analyser = null;
        this.dataArray = null;
        this.animationFrame = null;
        this.initialized = false;
        this.isActive = false;
        this.pending = null;
    }

    ensureActive() {
        if (this.initialized) {
            if (!this.isActive) {
                this.startMonitoring();
            }
            return Promise.resolve(true);
        }

        if (this.pending) {
            return this.pending;
        }

        this.pending = this.init();
        return this.pending.finally(() => {
            this.pending = null;
        });
    }

    async init() {
        if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.warn('🔇 Audio driver unavailable in this environment');
            return false;
        }

        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContextClass();
            this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            this.source = this.audioContext.createMediaStreamSource(this.mediaStream);

            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = this.options.fftSize;
            this.analyser.smoothingTimeConstant = this.options.smoothingTimeConstant;
            this.analyser.minDecibels = this.options.minDecibels;
            this.analyser.maxDecibels = this.options.maxDecibels;

            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            this.source.connect(this.analyser);

            this.initialized = true;
            this.startMonitoring();
            console.log('🎧 Orthogonal audio driver engaged');
            return true;
        } catch (error) {
            console.warn('🔇 Audio driver initialization failed', error);
            this.initialized = false;
            return false;
        }
    }

    startMonitoring() {
        if (!this.initialized || this.isActive) return;
        this.isActive = true;

        const update = () => {
            if (!this.isActive || !this.analyser || !this.dataArray) return;

            this.analyser.getByteFrequencyData(this.dataArray);

            const metrics = this.computeMetrics();
            if (this.orchestrator && typeof this.orchestrator.handleAudioEnergy === 'function') {
                this.orchestrator.handleAudioEnergy(metrics.energy, {
                    swing: metrics.swing,
                    peak: metrics.peak
                });
            }

            this.animationFrame = requestAnimationFrame(update);
        };

        this.animationFrame = requestAnimationFrame(update);
    }

    computeMetrics() {
        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
            sum += this.dataArray[i];
        }
        const average = sum / (this.dataArray.length * 255);

        const energy = Math.max(0, Math.min(1, (average - this.options.energyFloor) / (1 - this.options.energyFloor)));

        const lowBound = Math.floor(this.dataArray.length * 0.18);
        const highStart = Math.floor(this.dataArray.length * 0.55);

        const low = this.bandAverage(0, lowBound);
        const high = this.bandAverage(highStart, this.dataArray.length);

        const swing = Math.max(-1, Math.min(1, high - low));
        const peak = energy > this.options.peakThreshold;

        return { energy, swing, peak };
    }

    bandAverage(start, end) {
        const clampStart = Math.max(0, start);
        const clampEnd = Math.min(this.dataArray.length, end);
        if (clampEnd <= clampStart) return 0;

        let sum = 0;
        for (let i = clampStart; i < clampEnd; i++) {
            sum += this.dataArray[i];
        }
        return (sum / ((clampEnd - clampStart) * 255)) || 0;
    }

    stopMonitoring() {
        this.isActive = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    destroy() {
        this.stopMonitoring();

        if (this.source && this.source.disconnect) {
            try { this.source.disconnect(); } catch (error) { console.warn('Audio source disconnect failed', error); }
        }

        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }

        if (this.audioContext) {
            try { this.audioContext.close(); } catch (error) { /* ignore */ }
            this.audioContext = null;
        }

        this.analyser = null;
        this.dataArray = null;
        this.initialized = false;
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

        this.inheritedTrait = null;
        this.traitFlourish = null;
        this.resizeObserver = null;
        this.reactiveBurst = { active: false, start: 0, duration: 0, magnitude: 0, polarity: 1 };
        this.audioEnergy = 0;
        this.audioPeak = 0;

        this.basePalettes = {
            quantum: { hue: 280, accent: 220 },
            holographic: { hue: 330, accent: 190 },
            faceted: { hue: 200, accent: 150 }
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

        this.resizeObserver = new ResizeObserver(resizeCanvas);
        this.resizeObserver.observe(this.canvas);
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

    applyInheritedTrait(trait) {
        if (!trait) return;
        this.inheritedTrait = { ...trait };
        this.traitFlourish = {
            active: true,
            start: performance.now(),
            duration: 1200
        };
        this.targetDepth = Math.max(this.targetDepth, 0.9);
    }

    applyReactiveImpulse(options = {}) {
        const {
            depthDelta = 0.18,
            rotationDelta = 0.24,
            pulse = 0.45,
            polarity = 1,
            duration = 900
        } = options;

        const signedDelta = depthDelta * (polarity >= 0 ? 1 : -0.6);
        this.targetDepth = Math.min(1.35, Math.max(0.1, this.targetDepth + signedDelta));
        this.portalRotation += rotationDelta * polarity;

        this.reactiveBurst = {
            active: true,
            start: performance.now(),
            duration,
            magnitude: Math.abs(pulse),
            polarity: polarity >= 0 ? 1 : -1
        };
    }

    applyAudioEnergy(level, meta = {}) {
        if (typeof level !== 'number') return;

        const normalized = Math.max(0, Math.min(1, level));
        const eased = Math.pow(normalized, 1.3);

        this.audioEnergy = Math.max(this.audioEnergy, eased);
        if (meta.peak) {
            this.audioPeak = Math.max(this.audioPeak, 1);
        }

        const swing = typeof meta.swing === 'number' ? meta.swing : 0;
        const polarity = swing < 0 ? -1 : 1;

        this.targetDepth = Math.min(1.4, Math.max(0.6, this.targetDepth + eased * 0.3));
        this.portalRotation += swing * 0.35;

        this.reactiveBurst = {
            active: true,
            start: performance.now(),
            duration: 600 + eased * 600,
            magnitude: Math.max(this.reactiveBurst.magnitude || 0, eased * 0.7),
            polarity
        };
    }

    update() {
        this.portalDepth += (this.targetDepth - this.portalDepth) * 0.08;
        this.portalRotation += 0.02;
        this.portalPulse = Math.sin(Date.now() * 0.003) * 0.5 + 0.5;

        if (this.reactiveBurst && this.reactiveBurst.active) {
            const progress = (performance.now() - this.reactiveBurst.start) / this.reactiveBurst.duration;
            if (progress >= 1) {
                this.reactiveBurst.active = false;
            }
        }

        if (this.traitFlourish && this.traitFlourish.active) {
            const progress = (performance.now() - this.traitFlourish.start) / this.traitFlourish.duration;
            if (progress >= 1) {
                this.traitFlourish.active = false;
            }
        }

        if (this.audioEnergy > 0) {
            this.audioEnergy = Math.max(0, this.audioEnergy - 0.015);
        }

        if (this.audioPeak > 0) {
            this.audioPeak = Math.max(0, this.audioPeak - 0.08);
        }
    }

    getPalette() {
        const palette = this.basePalettes[this.systemType] || this.basePalettes.faceted;
        const trait = this.inheritedTrait || {};
        return {
            hue: this.normalizeHue(palette.hue + (trait.hueShift || 0)),
            accent: this.normalizeHue(palette.accent + (trait.accentShift || 0))
        };
    }

    getTraitFlourishIntensity() {
        if (!this.traitFlourish || !this.traitFlourish.active) return 0;
        const progress = (performance.now() - this.traitFlourish.start) / this.traitFlourish.duration;
        if (progress >= 1) {
            this.traitFlourish.active = false;
            return 0;
        }
        return Math.sin(progress * Math.PI);
    }

    getReactiveBurstIntensity() {
        if (!this.reactiveBurst || !this.reactiveBurst.active) return 0;
        const progress = (performance.now() - this.reactiveBurst.start) / this.reactiveBurst.duration;
        if (progress >= 1) {
            this.reactiveBurst.active = false;
            return 0;
        }
        return Math.sin(progress * Math.PI) * this.reactiveBurst.magnitude * (this.reactiveBurst.polarity >= 0 ? 1 : 0.7);
    }

    renderPortal() {
        const ctx = this.context;
        const width = this.canvas.width / (window.devicePixelRatio || 1);
        const height = this.canvas.height / (window.devicePixelRatio || 1);

        ctx.clearRect(0, 0, width, height);

        if (this.portalDepth < 0.01) return;

        const centerX = width / 2;
        const centerY = height / 2;
        const burst = this.getReactiveBurstIntensity();
        const audioEnergy = this.audioEnergy || 0;
        const intensity = this.portalDepth * (1 + burst * 0.35 + audioEnergy * 0.5);
        const palette = this.getPalette();
        const trait = this.inheritedTrait || {};
        const flourish = this.getTraitFlourishIntensity();
        const moireBoost = (trait.moireBoost || 0) + burst * 0.25 + audioEnergy * 0.35;
        const glitchBoost = (trait.glitchBoost || 0) + burst * 0.3 + audioEnergy * 0.4;

        switch (this.systemType) {
            case 'quantum':
                this.renderQuantumPortal(ctx, centerX, centerY, intensity, palette, moireBoost, glitchBoost, flourish);
                break;
            case 'holographic':
                this.renderHolographicPortal(ctx, centerX, centerY, intensity, palette, moireBoost, glitchBoost, flourish);
                break;
            case 'faceted':
            default:
                this.renderFacetedPortal(ctx, centerX, centerY, intensity, palette, moireBoost, glitchBoost, flourish);
                break;
        }

        if (flourish > 0.01) {
            this.renderTraitFlourish(ctx, centerX, centerY, intensity, palette, flourish);
        }

        if (audioEnergy > 0.02) {
            this.renderAudioAura(ctx, centerX, centerY, intensity, palette, audioEnergy, this.audioPeak > 0.05);
        }
    }

    renderQuantumPortal(ctx, centerX, centerY, intensity, palette, moireBoost, glitchBoost, flourish) {
        const rings = 8 + Math.round((moireBoost + flourish) * 4);
        const maxRadius = Math.min(centerX, centerY) * (0.75 + flourish * 0.2);

        for (let i = 0; i < rings; i++) {
            const progress = i / rings;
            const radius = maxRadius * (1 - progress) * intensity;
            const alpha = intensity * (1 - progress) * (0.6 + flourish * 0.2);
            const hue = this.normalizeHue(palette.hue + progress * 16);
            const offset = Math.sin(this.portalRotation * 2 + i) * glitchBoost * 6;

            if (alpha > 0.05) {
                ctx.save();
                ctx.lineWidth = 2 + progress * 3;
                ctx.strokeStyle = `hsla(${hue}, 72%, ${60 + progress * 18}%, ${alpha})`;
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius + offset, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }
        }

        const glowRadius = 60 * intensity * (1 + flourish * 0.4);
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowRadius);
        gradient.addColorStop(0, `hsla(${palette.accent}, 95%, 72%, ${0.35 + flourish * 0.3})`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, centerX * 2, centerY * 2);
    }

    renderHolographicPortal(ctx, centerX, centerY, intensity, palette, moireBoost, glitchBoost, flourish) {
        const layers = 6 + Math.floor((moireBoost + flourish) * 3);
        const maxRadius = Math.min(centerX, centerY) * (0.85 + flourish * 0.15);

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(this.portalRotation * (1 + flourish * 0.5));

        for (let i = 0; i < layers; i++) {
            const progress = i / layers;
            const radius = maxRadius * (1 - progress * 0.7) * intensity;
            const alpha = intensity * (1 - progress) * (0.5 + flourish * 0.2);
            const hue = this.normalizeHue(palette.hue + progress * 20);

            ctx.strokeStyle = `hsla(${hue}, 90%, ${72 - progress * 18}%, ${alpha})`;
            ctx.lineWidth = 1.2 + progress * 2;

            const sides = 8 + i * 2;
            ctx.beginPath();
            for (let j = 0; j <= sides; j++) {
                const angle = (j / sides) * Math.PI * 2;
                const distortion = 1 + Math.sin(angle * 3 + this.portalRotation * 4) * (0.08 + glitchBoost * 0.05);
                const x = Math.cos(angle) * radius * distortion;
                const y = Math.sin(angle) * radius * distortion;

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

    renderFacetedPortal(ctx, centerX, centerY, intensity, palette, moireBoost, glitchBoost, flourish) {
        const facets = 10 + Math.round((moireBoost + flourish) * 4);
        const maxRadius = Math.min(centerX, centerY) * (0.7 + flourish * 0.2);

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(this.portalRotation * (0.8 + flourish * 0.4));

        for (let i = 0; i < facets; i++) {
            const angle = (i / facets) * Math.PI * 2;
            const radius = maxRadius * intensity * (0.5 + this.portalPulse * 0.3 + flourish * 0.2);
            const hue = this.normalizeHue(palette.hue + i * 6);

            ctx.strokeStyle = `hsla(${hue}, 80%, 66%, ${0.6 + flourish * 0.2})`;
            ctx.fillStyle = `hsla(${palette.accent}, 85%, 68%, ${0.18 + flourish * 0.1})`;
            ctx.lineWidth = 1.8 + glitchBoost * 0.6;

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(
                Math.cos(angle) * radius * (1 + glitchBoost * 0.1),
                Math.sin(angle) * radius * (1 + glitchBoost * 0.1)
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

    renderTraitFlourish(ctx, centerX, centerY, intensity, palette, flourish) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(this.portalRotation * 1.5);

        const radius = Math.min(centerX, centerY) * (0.9 + flourish * 0.3) * intensity;
        ctx.lineWidth = 2 + flourish * 3;
        ctx.strokeStyle = `hsla(${palette.accent}, 100%, 75%, ${0.4 + flourish * 0.4})`;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.setLineDash([6, 12]);
        ctx.strokeStyle = `hsla(${this.normalizeHue(palette.accent + 40)}, 100%, 70%, ${0.3 + flourish * 0.3})`;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.restore();
    }

    renderAudioAura(ctx, centerX, centerY, intensity, palette, energy, peak) {
        const layers = 3 + Math.round(energy * 3);
        const baseRadius = Math.min(centerX, centerY) * (0.35 + intensity * 0.25 + energy * 0.3);
        const hue = this.normalizeHue(palette.hue + 32);

        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        for (let i = 0; i < layers; i++) {
            const progress = layers <= 1 ? 0 : i / (layers - 1);
            const radius = baseRadius * (1 + progress * 0.9);
            const alpha = (0.12 + energy * 0.25) * (1 - progress * 0.35);
            const lightness = peak ? 78 : 68;

            ctx.lineWidth = 1.5 + energy * 2 - progress * 0.8;
            ctx.strokeStyle = `hsla(${(hue + progress * 28) % 360}, 92%, ${lightness - progress * 10}%, ${alpha})`;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    }

    normalizeHue(value) {
        return ((value % 360) + 360) % 360;
    }

    destroy() {
        this.stopRenderLoop();
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
        this.context = null;
        this.inheritedTrait = null;
    }
}

class AmbientBackgroundField {
    constructor(root) {
        this.root = root || document.body;
        this.resetTimer = null;
    }

    applyImpulse({ offsetX = 0, offsetY = 0, energy = 0.3, twist = 0 } = {}) {
        if (!this.root) return;
        const x = (offsetX || 0) * 60;
        const y = (offsetY || 0) * 60;
        const energyClamp = Math.max(0, Math.min(1.2, energy));

        this.root.style.setProperty('--bg-parallax-x', `${x.toFixed(2)}px`);
        this.root.style.setProperty('--bg-parallax-y', `${y.toFixed(2)}px`);
        this.root.style.setProperty('--bg-scale', (1 + energyClamp * 0.18).toFixed(3));
        this.root.style.setProperty('--bg-sheen', (0.28 + energyClamp * 0.45).toFixed(3));
        this.root.style.setProperty('--bg-twist', `${(twist || 0) * 32}deg`);

        clearTimeout(this.resetTimer);
        this.resetTimer = setTimeout(() => this.reset(0.25), 760);
    }

    reset(energy = 0.18) {
        if (!this.root) return;
        this.root.style.setProperty('--bg-parallax-x', '0px');
        this.root.style.setProperty('--bg-parallax-y', '0px');
        this.root.style.setProperty('--bg-scale', (1 + energy * 0.1).toFixed(3));
        this.root.style.setProperty('--bg-sheen', (0.26 + energy * 0.2).toFixed(3));
        this.root.style.setProperty('--bg-twist', '0deg');
    }

    destroy() {
        clearTimeout(this.resetTimer);
        this.resetTimer = null;
    }
}

class OrthogonalDepthReactivityOrchestrator {
    constructor(progression, options = {}) {
        this.progression = progression;
        this.tiltSystem = options.tiltSystem || null;
        this.entities = new Map();
        this.cleanupHandlers = [];
        this.activeCard = null;
        this.pointerState = {
            x: 0.5,
            y: 0.5,
            time: performance.now(),
            velocityX: 0,
            velocityY: 0
        };

        this.backgroundField = new AmbientBackgroundField(document.body);
        this.audioDriver = new OrthogonalAudioDriver(this, options.audio || {});

        this.handlePointerMove = this.handlePointerMove.bind(this);
        this.handlePointerDown = this.handlePointerDown.bind(this);
        this.handlePointerUp = this.handlePointerUp.bind(this);
        this.handlePointerLeave = this.handlePointerLeave.bind(this);

        this.init();
    }

    init() {
        if (!this.progression) return;
        this.syncEntities();
        this.bindProgressionEvents();
        this.bindPointerEvents();
    }

    syncEntities() {
        if (!this.progression || !Array.isArray(this.progression.cards)) return;
        this.progression.cards.forEach((card) => this.registerCard(card));
        this.activeCard = this.progression.cards[this.progression.currentIndex] || null;
    }

    registerCard(card) {
        if (!card) return;
        const visualizer = this.progression.getVisualizerForCard(card);
        const portalEl = card.querySelector('.portal-text-visualizer');
        const portalVisualizer = portalEl ? portalEl.portalVisualizer : null;

        this.entities.set(card, {
            card,
            visualizer: visualizer || null,
            portal: portalVisualizer || null
        });
    }

    getEntity(card) {
        if (!card) return null;
        if (!this.entities.has(card)) {
            this.registerCard(card);
        } else {
            const entity = this.entities.get(card);
            if (entity && !entity.visualizer) {
                entity.visualizer = this.progression.getVisualizerForCard(card);
            }
            if (entity && !entity.portal) {
                const portalEl = card.querySelector('.portal-text-visualizer');
                entity.portal = portalEl ? portalEl.portalVisualizer : null;
            }
        }
        return this.entities.get(card) || null;
    }

    bindProgressionEvents() {
        this.cleanupHandlers.push(this.progression.on('card-state-changed', (detail) => this.handleCardState(detail)));
        this.cleanupHandlers.push(this.progression.on('portal-activated', (detail) => this.handlePortalActivated(detail)));
        this.cleanupHandlers.push(this.progression.on('portal-deactivated', (detail) => this.handlePortalDeactivated(detail)));
        this.cleanupHandlers.push(this.progression.on('card-destroyed', (detail) => this.handleCardDestroyed(detail)));
        this.cleanupHandlers.push(this.progression.on('scroll-threshold', (detail) => this.handleScrollImpulse(detail)));
        this.cleanupHandlers.push(this.progression.on('scroll-accumulating', (detail) => this.handleScrollAccumulation(detail)));
    }

    bindPointerEvents() {
        window.addEventListener('pointermove', this.handlePointerMove, { passive: true });
        window.addEventListener('pointerdown', this.handlePointerDown, { passive: true });
        window.addEventListener('pointerup', this.handlePointerUp, { passive: true });
        window.addEventListener('pointerleave', this.handlePointerLeave, { passive: true });
    }

    handleCardState(detail = {}) {
        const { card, state } = detail;
        if (!card) return;

        const entity = this.getEntity(card);
        if (state === 'focused') {
            this.activeCard = card;
            this.applyCardGlow(card, { intensity: 0.32, scale: 1.08, shiftY: -10 });
            this.backgroundField.applyImpulse({ offsetX: 0, offsetY: -0.12, energy: 0.35, twist: 0 });
        } else if (state === 'far-depth' || state === 'destroyed') {
            this.resetCardGlow(card);
        } else if (state === 'approaching' && entity) {
            this.applyCardGlow(card, { intensity: 0.2, scale: 1.02, shiftY: -6 });
        }
    }

    handlePortalActivated(detail = {}) {
        const { card } = detail;
        if (!card) return;
        this.applyCardGlow(card, { intensity: 0.35, scale: 1.1, shiftY: -14 });
    }

    handlePortalDeactivated(detail = {}) {
        const { card } = detail;
        if (!card) return;
        this.resetCardGlow(card);
    }

    handleCardDestroyed(detail = {}) {
        const { card } = detail;
        if (!card) return;
        this.backgroundField.applyImpulse({ energy: 0.78, offsetX: 0.12, offsetY: 0.18, twist: 0.35 });
        const next = this.getPartnerCard(1);
        if (next && next.portal && typeof next.portal.applyReactiveImpulse === 'function') {
            next.portal.applyReactiveImpulse({ depthDelta: 0.3, rotationDelta: 0.42, pulse: 0.65, polarity: 1, duration: 1400 });
        }
    }

    handleScrollAccumulation(detail = {}) {
        const accumulator = detail.accumulator || 0;
        const magnitude = detail.magnitude || 0;
        const sign = Math.sign(accumulator) || 1;
        const { previous, next } = this.getNeighborEntities();

        this.backgroundField.applyImpulse({
            offsetX: sign * 0.08 * magnitude,
            offsetY: -0.04 * magnitude,
            energy: 0.24 + magnitude * 0.25,
            twist: accumulator * 0.0006
        });

        if (previous) {
            this.applyCardGlow(previous.card, {
                shiftX: sign > 0 ? -12 * magnitude : -4 * magnitude,
                shiftY: -10 * magnitude,
                intensity: 0.16 + magnitude * 0.18,
                scale: 0.96 + magnitude * 0.08
            });
        }

        if (next) {
            this.applyCardGlow(next.card, {
                shiftX: sign > 0 ? 6 * magnitude : 14 * magnitude,
                shiftY: -6 * magnitude,
                intensity: 0.18 + magnitude * 0.22,
                scale: 1.02 + magnitude * 0.1
            });
        }
    }

    handleScrollImpulse(detail = {}) {
        const direction = detail.direction || 1;
        const magnitude = detail.magnitude || 0;
        const polarity = direction >= 0 ? 1 : -1;

        const active = this.getEntity(this.activeCard);
        const { previous, next } = this.getNeighborEntities();

        if (active && active.visualizer && typeof active.visualizer.applyInteractionResponse === 'function') {
            active.visualizer.applyInteractionResponse({
                intensity: 0.45 + magnitude * 0.65,
                polarity,
                hueSpin: polarity * 0.65,
                densityBias: polarity > 0 ? -0.9 : 0.6,
                geometryAdvance: polarity,
                duration: 780
            });
        }

        if (active && active.portal && typeof active.portal.applyReactiveImpulse === 'function') {
            active.portal.applyReactiveImpulse({
                depthDelta: 0.24 * magnitude,
                rotationDelta: polarity * (0.25 + magnitude * 0.18),
                pulse: 0.42 + magnitude * 0.4,
                polarity,
                duration: 1100
            });
        }

        const primaryPartner = polarity > 0 ? next : previous;
        const secondaryPartner = polarity > 0 ? previous : next;

        if (primaryPartner && primaryPartner.visualizer && typeof primaryPartner.visualizer.applyInteractionResponse === 'function') {
            primaryPartner.visualizer.applyInteractionResponse({
                intensity: 0.32 + magnitude * 0.48,
                polarity: -polarity,
                hueSpin: polarity * -0.5,
                densityBias: polarity > 0 ? 0.6 : -0.6,
                geometryAdvance: -polarity,
                duration: 720
            });
        }

        if (secondaryPartner && secondaryPartner.visualizer && typeof secondaryPartner.visualizer.applyInteractionResponse === 'function') {
            secondaryPartner.visualizer.applyInteractionResponse({
                intensity: 0.22 + magnitude * 0.28,
                polarity,
                hueSpin: polarity * 0.35,
                densityBias: polarity > 0 ? -0.32 : 0.32,
                duration: 640
            });
        }

        if (active) {
            this.applyCardGlow(active.card, {
                shiftX: polarity * 18,
                shiftY: -polarity * 24,
                intensity: 0.36 + magnitude * 0.4,
                scale: 1.08 + magnitude * 0.18
            });
        }

        if (primaryPartner) {
            this.applyCardGlow(primaryPartner.card, {
                shiftX: -polarity * 16,
                shiftY: polarity * 18,
                intensity: 0.24 + magnitude * 0.3,
                scale: 1.04 + magnitude * 0.16
            });
        }

        if (secondaryPartner) {
            this.applyCardGlow(secondaryPartner.card, {
                shiftX: polarity * 9,
                shiftY: -polarity * 12,
                intensity: 0.18 + magnitude * 0.18,
                scale: 0.98 + magnitude * 0.1
            });
        }

        this.backgroundField.applyImpulse({
            offsetX: polarity * (0.18 + magnitude * 0.12),
            offsetY: -polarity * (0.16 + magnitude * 0.1),
            energy: 0.36 + magnitude * 0.55,
            twist: polarity * (0.28 + magnitude * 0.2)
        });
    }

    handleAudioEnergy(level = 0, meta = {}) {
        const energy = Math.max(0, Math.min(1, level));
        const swing = Math.max(-1, Math.min(1, meta.swing || 0));
        const polarity = swing >= 0 ? 1 : -1;
        const peak = Boolean(meta.peak);

        const active = this.getEntity(this.activeCard);
        const { previous, next } = this.getNeighborEntities();
        if (active && active.visualizer && typeof active.visualizer.applyAudioEnergy === 'function') {
            active.visualizer.applyAudioEnergy(energy, { swing, peak, polarity });
        }
        if (active && active.portal && typeof active.portal.applyAudioEnergy === 'function') {
            active.portal.applyAudioEnergy(energy, { swing, peak, polarity });
        }

        if (next && next.visualizer && typeof next.visualizer.applyAudioEnergy === 'function') {
            next.visualizer.applyAudioEnergy(Math.max(0, energy - 0.18), {
                swing: -swing * 0.85,
                peak: peak && energy > 0.6,
                polarity: -polarity
            });
        }
        if (next && next.portal && typeof next.portal.applyAudioEnergy === 'function') {
            next.portal.applyAudioEnergy(Math.max(0, energy - 0.22), {
                swing: -swing * 0.65,
                peak: peak && energy > 0.65,
                polarity: -polarity
            });
        }

        if (previous && previous.visualizer && typeof previous.visualizer.applyAudioEnergy === 'function') {
            previous.visualizer.applyAudioEnergy(Math.max(0, energy * 0.55), {
                swing: swing * 0.65,
                peak: peak && energy > 0.55,
                polarity
            });
        }
        if (previous && previous.portal && typeof previous.portal.applyAudioEnergy === 'function') {
            previous.portal.applyAudioEnergy(Math.max(0, energy * 0.5), {
                swing: swing * 0.5,
                peak: peak && energy > 0.5,
                polarity
            });
        }

        if (active) {
            this.applyCardGlow(active.card, {
                shiftX: swing * 26,
                shiftY: -energy * 28,
                intensity: 0.24 + energy * 0.45,
                scale: 1.04 + energy * 0.14
            });
        }

        if (next) {
            this.applyCardGlow(next.card, {
                shiftX: -swing * 18,
                shiftY: energy * 18,
                intensity: 0.18 + energy * 0.25,
                scale: 1.01 + energy * 0.12
            });
        }

        if (previous) {
            this.applyCardGlow(previous.card, {
                shiftX: swing * 12,
                shiftY: -energy * 12,
                intensity: 0.16 + energy * 0.18,
                scale: 0.98 + energy * 0.08
            });
        }

        if (energy > 0.02) {
            this.backgroundField.applyImpulse({
                offsetX: swing * 0.4,
                offsetY: -energy * 0.24,
                energy: 0.28 + energy * 0.6,
                twist: peak ? 0.45 : swing * 0.18
            });
        } else {
            this.backgroundField.reset(0.2);
        }
    }

    handlePointerMove(event) {
        if (!this.activeCard) return;
        const width = window.innerWidth || 1;
        const height = window.innerHeight || 1;
        const normalizedX = event.clientX / width;
        const normalizedY = event.clientY / height;

        const now = performance.now();
        const dt = Math.max(0.016, (now - this.pointerState.time) / 1000);
        const velocityX = (normalizedX - this.pointerState.x) / dt;
        const velocityY = (normalizedY - this.pointerState.y) / dt;

        this.pointerState = {
            x: normalizedX,
            y: normalizedY,
            time: now,
            velocityX,
            velocityY
        };

        const entity = this.getEntity(this.activeCard);
        if (!entity) return;

        const { previous, next } = this.getNeighborEntities();

        const offsetX = normalizedX - 0.5;
        const offsetY = normalizedY - 0.5;
        const displacement = Math.hypot(offsetX, offsetY);
        const velocityMagnitude = Math.hypot(velocityX, velocityY);
        const intensity = Math.min(1, displacement * 3 + velocityMagnitude * 0.12);
        const polarity = velocityY >= 0 ? 1 : -1;

        if (entity.visualizer && typeof entity.visualizer.applyInteractionResponse === 'function') {
            entity.visualizer.applyInteractionResponse({
                intensity: 0.35 + intensity * 0.6,
                polarity,
                hueSpin: offsetX * 0.9,
                densityBias: -offsetY * 0.7,
                duration: 720
            });
        }

        if (entity.portal && typeof entity.portal.applyReactiveImpulse === 'function') {
            entity.portal.applyReactiveImpulse({
                depthDelta: intensity * 0.22,
                rotationDelta: velocityX * 0.02,
                pulse: 0.35 + intensity * 0.4,
                polarity,
                duration: 1050
            });
        }

        if (next) {
            this.applyCardGlow(next.card, {
                shiftX: -offsetX * 18,
                shiftY: -offsetY * 16,
                intensity: 0.2 + intensity * 0.32,
                scale: 1.03 + intensity * 0.12
            });
            if (next.visualizer && typeof next.visualizer.applyInteractionResponse === 'function') {
                next.visualizer.applyInteractionResponse({
                    intensity: 0.24 + intensity * 0.32,
                    polarity: -polarity,
                    hueSpin: offsetX * -0.55,
                    densityBias: offsetY * 0.45,
                    duration: 720
                });
            }
        }

        if (previous) {
            this.applyCardGlow(previous.card, {
                shiftX: offsetX * 12,
                shiftY: offsetY * 10,
                intensity: 0.16 + intensity * 0.22,
                scale: 0.97 + intensity * 0.08
            });
            if (previous.visualizer && typeof previous.visualizer.applyInteractionResponse === 'function') {
                previous.visualizer.applyInteractionResponse({
                    intensity: 0.2 + intensity * 0.26,
                    polarity,
                    hueSpin: offsetX * 0.35,
                    densityBias: offsetY * -0.32,
                    duration: 640
                });
            }
        }

        this.applyCardGlow(entity.card, {
            shiftX: offsetX * 28,
            shiftY: offsetY * 22,
            intensity: 0.28 + intensity * 0.45,
            scale: 1.05 + intensity * 0.18
        });

        this.backgroundField.applyImpulse({
            offsetX: offsetX * 0.7,
            offsetY: offsetY * 0.55,
            energy: 0.3 + intensity * 0.5,
            twist: velocityX * 0.03
        });
    }

    handlePointerDown() {
        if (this.audioDriver) {
            this.audioDriver.ensureActive().catch(() => {});
        }
        const entity = this.getEntity(this.activeCard);
        if (!entity) return;
        const { previous, next } = this.getNeighborEntities();

        if (entity.visualizer && typeof entity.visualizer.applyInteractionResponse === 'function') {
            entity.visualizer.applyInteractionResponse({
                intensity: 0.8,
                polarity: 1,
                hueSpin: 0.8,
                geometryAdvance: 1,
                duration: 960
            });
        }
        if (entity.portal && typeof entity.portal.applyReactiveImpulse === 'function') {
            entity.portal.applyReactiveImpulse({ depthDelta: 0.32, rotationDelta: 0.32, pulse: 0.6, polarity: 1, duration: 1300 });
        }

        if (next && next.visualizer && typeof next.visualizer.applyInteractionResponse === 'function') {
            next.visualizer.applyInteractionResponse({
                intensity: 0.5,
                polarity: -1,
                hueSpin: -0.6,
                geometryAdvance: -1,
                duration: 900
            });
        }

        if (previous && previous.visualizer && typeof previous.visualizer.applyInteractionResponse === 'function') {
            previous.visualizer.applyInteractionResponse({
                intensity: 0.38,
                polarity: 1,
                hueSpin: 0.45,
                duration: 860
            });
        }

        this.backgroundField.applyImpulse({ offsetX: 0, offsetY: -0.2, energy: 0.65, twist: 0.25 });
    }

    handlePointerUp() {
        const entity = this.getEntity(this.activeCard);
        if (entity && entity.visualizer && typeof entity.visualizer.releaseInteraction === 'function') {
            entity.visualizer.releaseInteraction();
        }
        const { previous, next } = this.getNeighborEntities();
        [previous, next].forEach((neighbor) => {
            if (neighbor && neighbor.visualizer && typeof neighbor.visualizer.releaseInteraction === 'function') {
                neighbor.visualizer.releaseInteraction();
            }
        });
        this.backgroundField.reset(0.22);
    }

    handlePointerLeave() {
        const entity = this.getEntity(this.activeCard);
        if (entity) {
            this.resetCardGlow(entity.card);
            if (entity.visualizer && typeof entity.visualizer.releaseInteraction === 'function') {
                entity.visualizer.releaseInteraction();
            }
        }
        const { previous, next } = this.getNeighborEntities();
        [previous, next].forEach((neighbor) => {
            if (neighbor) {
                this.resetCardGlow(neighbor.card);
                if (neighbor.visualizer && typeof neighbor.visualizer.releaseInteraction === 'function') {
                    neighbor.visualizer.releaseInteraction();
                }
            }
        });
        this.backgroundField.reset(0.2);
    }

    getPartnerCard(direction = 1) {
        if (!this.progression) return null;
        const targetIndex = this.progression.currentIndex + (direction >= 0 ? 1 : -1);
        const card = this.progression.cards[targetIndex];
        if (!card) return null;
        return this.getEntity(card);
    }

    getNeighborEntities() {
        if (!this.progression || !Array.isArray(this.progression.cards)) {
            return { previous: null, next: null };
        }

        const previousCard = this.progression.cards[this.progression.currentIndex - 1] || null;
        const nextCard = this.progression.cards[this.progression.currentIndex + 1] || null;

        return {
            previous: previousCard ? this.getEntity(previousCard) : null,
            next: nextCard ? this.getEntity(nextCard) : null
        };
    }

    applyCardGlow(card, { shiftX = 0, shiftY = 0, intensity = 0.18, scale = 1.0 } = {}) {
        if (!card) return;
        card.style.setProperty('--card-glow-shift-x', `${shiftX.toFixed(2)}px`);
        card.style.setProperty('--card-glow-shift-y', `${shiftY.toFixed(2)}px`);
        card.style.setProperty('--card-glow-opacity', Math.min(0.85, intensity).toFixed(3));
        card.style.setProperty('--card-glow-scale', Math.max(0.9, scale).toFixed(3));
    }

    resetCardGlow(card) {
        if (!card) return;
        card.style.setProperty('--card-glow-shift-x', '0px');
        card.style.setProperty('--card-glow-shift-y', '0px');
        card.style.setProperty('--card-glow-opacity', '0.18');
        card.style.setProperty('--card-glow-scale', '1');
    }

    destroy() {
        this.cleanupHandlers.forEach((dispose) => {
            if (typeof dispose === 'function') dispose();
        });
        this.cleanupHandlers = [];

        window.removeEventListener('pointermove', this.handlePointerMove);
        window.removeEventListener('pointerdown', this.handlePointerDown);
        window.removeEventListener('pointerup', this.handlePointerUp);
        window.removeEventListener('pointerleave', this.handlePointerLeave);

        this.backgroundField.destroy();
        if (this.audioDriver) {
            this.audioDriver.destroy();
        }
        this.entities.clear();
    }
}
// Export for global use
window.OrthogonalDepthProgression = OrthogonalDepthProgression;
window.PortalTextVisualizer = PortalTextVisualizer;
window.OrthogonalDepthReactivityOrchestrator = OrthogonalDepthReactivityOrchestrator;
window.AmbientBackgroundField = AmbientBackgroundField;
window.OrthogonalAudioDriver = OrthogonalAudioDriver;