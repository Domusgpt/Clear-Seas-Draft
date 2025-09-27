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
                this.createPortalVisualizer(portalElement, card.dataset.vib34d, index, card);
            }
        });
    }

    createPortalVisualizer(portalElement, systemType, cardIndex, card) {
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
        const profileKey = card ? card.dataset.reactiveProfile || null : null;
        const portalVariant = card ? card.dataset.portalVariant || null : null;
        const portalVisualizer = new PortalTextVisualizer(canvas, systemType, cardIndex, {
            profileKey,
            portalVariant
        });

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

    peekCard(offset = 1) {
        if (!this.cards.length) return null;
        const length = this.cards.length;
        const index = (this.currentIndex + offset + length) % length;
        return this.cards[index] || null;
    }

    primeCardTrait(card, trait) {
        if (!card || !trait) return;
        const pending = card._pendingTrait || {};
        card._pendingTrait = { ...pending, ...trait };
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

        if (inheritedTrait) {
            const nextCard = this.peekCard(1);
            if (nextCard) {
                this.primeCardTrait(nextCard, inheritedTrait);
                this.emit('trait-handshake', { from: currentCard, to: nextCard, trait: inheritedTrait });
            }
        }

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

/**
 * PORTAL TEXT VISUALIZER
 * Creates portal-style visualizations within focused card text
 */
class PortalTextVisualizer {
    constructor(canvas, systemType, cardIndex, options = {}) {
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
        this.activeGift = null;

        this.profileKey = options.profileKey || null;
        this.profile = this.resolveProfile(this.profileKey, systemType);
        this.portalVariant = options.portalVariant || (this.profile && this.profile.portalVariant) || null;
        this.portalSettings = (this.profile && this.profile.portal) || {};

        this.basePalettes = {
            quantum: { hue: 280, accent: 220 },
            holographic: { hue: 330, accent: 190 },
            faceted: { hue: 200, accent: 150 }
        };

        this.init();
    }

    resolveProfile(profileKey, systemType) {
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
        this.activeGift = trait.gift || null;
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
    }

    getPalette() {
        const palette = this.basePalettes[this.systemType] || this.basePalettes.faceted;
        const hueOffset = (this.profile && this.profile.hueOffset) || 0;
        const accentOffset = (this.profile && this.profile.accentOffset) || 0;
        const trait = this.inheritedTrait || {};
        return {
            hue: this.normalizeHue(palette.hue + hueOffset + (trait.hueShift || 0)),
            accent: this.normalizeHue((palette.accent + accentOffset) + (trait.accentShift || 0))
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
        const gift = this.activeGift || {};
        let giftMoire = 0;
        let giftGlitch = 0;
        let giftPulse = 0;
        switch (gift.resonance) {
            case 'moire':
                giftMoire = (gift.value || 0) * 0.4;
                break;
            case 'glow':
            case 'facet':
                giftPulse = (gift.value || 0) * 0.35;
                giftMoire = (gift.value || 0) * 0.2;
                break;
            case 'density':
                giftPulse = (gift.value || 0) * 0.25;
                break;
            case 'glitch':
            case 'signal':
                giftGlitch = (gift.value || 0) * 0.45;
                break;
        }
        const intensity = this.portalDepth * (1 + burst * 0.35 + giftPulse * 0.3);
        const palette = this.getPalette();
        const trait = this.inheritedTrait || {};
        const flourish = this.getTraitFlourishIntensity();
        const moireBoost = (trait.moireBoost || 0) + burst * 0.25 + giftMoire;
        const glitchBoost = (trait.glitchBoost || 0) + burst * 0.3 + giftGlitch;

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
    }

    renderQuantumPortal(ctx, centerX, centerY, intensity, palette, moireBoost, glitchBoost, flourish) {
        const ringMultiplier = (this.portalSettings.ringMultiplier || 1);
        const burstMultiplier = (this.portalSettings.burst || 1);
        const twist = (this.portalSettings.twist || 0);
        const variant = this.portalVariant;

        const rings = Math.max(6, Math.round((8 + Math.round((moireBoost + flourish) * 4)) * ringMultiplier));
        const maxRadius = Math.min(centerX, centerY) * (0.75 + flourish * 0.2) * (variant === 'spiral' ? 1.1 : 1);

        for (let i = 0; i < rings; i++) {
            const progress = i / rings;
            const radius = maxRadius * (1 - progress) * intensity;
            const alpha = intensity * (1 - progress) * (0.6 + flourish * 0.2) * burstMultiplier;
            const hue = this.normalizeHue(palette.hue + progress * 16);
            const offset = Math.sin(this.portalRotation * 2 + i + twist) * glitchBoost * 6 * burstMultiplier;

            if (alpha > 0.05) {
                ctx.save();
                ctx.lineWidth = 2 + progress * 3 * burstMultiplier;
                ctx.strokeStyle = `hsla(${hue}, 72%, ${60 + progress * 18}%, ${alpha})`;
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius + offset, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }
        }

        if (variant === 'spiral') {
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(this.portalRotation * 1.4);
            ctx.beginPath();
            const spiralTurns = 5 + Math.round(glitchBoost * 6);
            for (let angle = 0; angle < Math.PI * 2 * spiralTurns; angle += 0.2) {
                const radius = (angle / (Math.PI * 2 * spiralTurns)) * maxRadius;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                if (angle === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.strokeStyle = `hsla(${palette.accent}, 96%, 74%, ${0.28 + flourish * 0.25})`;
            ctx.lineWidth = 1.5 + glitchBoost * 0.4;
            ctx.stroke();
            ctx.restore();
        } else if (variant === 'axon') {
            ctx.save();
            ctx.translate(centerX, centerY);
            const spokes = 10;
            ctx.lineWidth = 1.2 + glitchBoost * 0.5;
            ctx.strokeStyle = `hsla(${palette.accent}, 92%, 76%, ${0.22 + flourish * 0.3})`;
            for (let i = 0; i < spokes; i++) {
                const angle = (i / spokes) * Math.PI * 2 + this.portalRotation * 0.8;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.quadraticCurveTo(
                    Math.cos(angle) * maxRadius * 0.4,
                    Math.sin(angle) * maxRadius * 0.4,
                    Math.cos(angle) * maxRadius,
                    Math.sin(angle) * maxRadius
                );
                ctx.stroke();
            }
            ctx.restore();
        }

        const glowRadius = 60 * intensity * (1 + flourish * 0.4) * burstMultiplier;
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowRadius);
        gradient.addColorStop(0, `hsla(${palette.accent}, 95%, 72%, ${0.35 + flourish * 0.3})`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, centerX * 2, centerY * 2);
    }

    renderHolographicPortal(ctx, centerX, centerY, intensity, palette, moireBoost, glitchBoost, flourish) {
        const ringMultiplier = this.portalSettings.ringMultiplier || 1;
        const burstMultiplier = this.portalSettings.burst || 1;
        const twist = this.portalSettings.twist || 0;
        const variant = this.portalVariant;

        const layers = Math.max(5, Math.round((6 + (moireBoost + flourish) * 3) * ringMultiplier));
        const maxRadius = Math.min(centerX, centerY) * (0.85 + flourish * 0.15) * (variant === 'filament' ? 1.12 : 1);

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(this.portalRotation * (1 + flourish * 0.5 + twist));

        for (let i = 0; i < layers; i++) {
            const progress = i / layers;
            const radius = maxRadius * (1 - progress * 0.65) * intensity;
            const alpha = intensity * (1 - progress) * (0.5 + flourish * 0.2) * burstMultiplier;
            const hue = this.normalizeHue(palette.hue + progress * 20);
            const offsetX = Math.sin(this.portalRotation * 1.2 + progress * 6) * 18 * glitchBoost;
            const offsetY = Math.cos(this.portalRotation * 1.1 + progress * 5) * 18 * glitchBoost;

            ctx.strokeStyle = `hsla(${hue}, 90%, ${72 - progress * 18}%, ${alpha})`;
            ctx.lineWidth = 1.2 + progress * 2 * burstMultiplier;

            const sides = 8 + i * 2;
            ctx.beginPath();
            for (let j = 0; j <= sides; j++) {
                const angle = (j / sides) * Math.PI * 2;
                const distortion = 1 + Math.sin(angle * 3 + this.portalRotation * 4 + twist) * (0.08 + glitchBoost * 0.05);
                let x = Math.cos(angle) * radius * distortion;
                let y = Math.sin(angle) * radius * distortion;

                if (variant === 'filament') {
                    const filament = Math.sin(angle * 6 + this.portalRotation * 5) * (0.12 + glitchBoost * 0.05);
                    x += Math.cos(angle + Math.PI / 4) * radius * filament;
                    y += Math.sin(angle + Math.PI / 4) * radius * filament;
                } else if (variant === 'ribbon') {
                    x += Math.sin(angle * 2 + this.portalRotation) * radius * 0.08;
                    y += Math.cos(angle * 2 + this.portalRotation) * radius * 0.08;
                }

                if (j === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();

            const shimmer = (0.2 * (1 - progress) + intensity * 0.05) * burstMultiplier;
            ctx.setLineDash([6, 10]);
            ctx.strokeStyle = `hsla(${this.normalizeHue(palette.accent + progress * 30)}, 95%, 75%, ${shimmer})`;
            ctx.beginPath();
            ctx.ellipse(
                offsetX * 0.4,
                offsetY * 0.4,
                radius * 0.85,
                radius * 0.85 * (variant === 'ribbon' ? 0.7 : 1),
                -this.portalRotation * 0.6,
                0,
                Math.PI * 2
            );
            ctx.stroke();
            ctx.setLineDash([]);
        }

        if (variant === 'filament') {
            ctx.lineWidth = 1 + glitchBoost * 0.6;
            ctx.strokeStyle = `hsla(${palette.accent}, 96%, 76%, ${0.28 + flourish * 0.2})`;
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2 + this.portalRotation * 0.6;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(
                    Math.cos(angle) * maxRadius * 0.9,
                    Math.sin(angle) * maxRadius * 0.9
                );
                ctx.stroke();
            }
        }

        ctx.restore();
    }

    renderFacetedPortal(ctx, centerX, centerY, intensity, palette, moireBoost, glitchBoost, flourish) {
        const facetMultiplier = this.portalSettings.ringMultiplier || 1;
        const burstMultiplier = this.portalSettings.burst || 1;
        const twist = this.portalSettings.twist || 0;
        const variant = this.portalVariant;

        const facets = Math.max(10, Math.round((10 + (moireBoost + flourish) * 4) * facetMultiplier));
        const maxRadius = Math.min(centerX, centerY) * (0.7 + flourish * 0.2) * (variant === 'prism' ? 1.18 : 1);

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(this.portalRotation * (0.8 + flourish * 0.4 + twist));

        for (let i = 0; i < facets; i++) {
            const angle = (i / facets) * Math.PI * 2;
            const radius = maxRadius * intensity * (0.5 + this.portalPulse * 0.3 + flourish * 0.2);
            const hue = this.normalizeHue(palette.hue + i * 6);

            ctx.strokeStyle = `hsla(${hue}, 80%, 66%, ${0.6 + flourish * 0.2})`;
            ctx.fillStyle = `hsla(${palette.accent}, 85%, 68%, ${0.18 + flourish * 0.1})`;
            ctx.lineWidth = 1.8 + glitchBoost * 0.6 * burstMultiplier;

            const outerRadius = radius * (1 + glitchBoost * 0.12);
            const innerRadius = radius * (variant === 'prism' ? 1.08 : 1);

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(
                Math.cos(angle) * outerRadius,
                Math.sin(angle) * outerRadius
            );
            ctx.lineTo(
                Math.cos(angle + Math.PI / facets) * innerRadius,
                Math.sin(angle + Math.PI / facets) * innerRadius
            );
            ctx.closePath();

            ctx.fill();
            ctx.stroke();

            if (variant === 'prism') {
                ctx.beginPath();
                ctx.moveTo(
                    Math.cos(angle) * innerRadius * 0.6,
                    Math.sin(angle) * innerRadius * 0.6
                );
                ctx.lineTo(
                    Math.cos(angle + Math.PI / facets) * innerRadius * 0.6,
                    Math.sin(angle + Math.PI / facets) * innerRadius * 0.6
                );
                ctx.strokeStyle = `hsla(${palette.accent}, 92%, 74%, ${0.25 + flourish * 0.25})`;
                ctx.stroke();
            }
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
        this.cleanupHandlers.push(this.progression.on('trait-handshake', (detail) => this.handleTraitHandshake(detail)));
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
        const { card, trait } = detail;
        if (!card) return;

        const entity = this.getEntity(card);
        if (entity) {
            this.resetCardGlow(entity.card);
        }

        this.backgroundField.applyImpulse({ energy: 0.68, offsetX: 0.14, offsetY: 0.2, twist: 0.32 });

        const partner = this.getPartnerCard(1);
        if (partner && partner.portal && typeof partner.portal.applyReactiveImpulse === 'function') {
            partner.portal.applyReactiveImpulse({ depthDelta: 0.36, rotationDelta: 0.48, pulse: 0.7, polarity: 1, duration: 1500 });
        }

        if (trait) {
            this.handleTraitHandshake({ trait, to: partner ? partner.card : null, from: card });
        }
    }

    handleTraitHandshake(detail = {}) {
        const { trait, to: incomingCard, from: outgoingCard } = detail || {};
        if (!trait) return;

        const incoming = this.getEntity(incomingCard);
        const outgoing = this.getEntity(outgoingCard);

        if (incoming) {
            if (incoming.visualizer && typeof incoming.visualizer.applyInheritedTrait === 'function') {
                incoming.visualizer.applyInheritedTrait(trait, { immediate: false });
            }
            if (incoming.portal && typeof incoming.portal.applyInheritedTrait === 'function') {
                incoming.portal.applyInheritedTrait(trait);
            }
            this.applyCardGlow(incoming.card, {
                shiftX: 0,
                shiftY: -18,
                intensity: 0.34,
                scale: 1.08
            });
        }

        if (outgoing && outgoing.visualizer && typeof outgoing.visualizer.applyInteractionResponse === 'function') {
            outgoing.visualizer.applyInteractionResponse({
                intensity: 0.6,
                polarity: -1,
                hueSpin: -0.8,
                densityBias: -0.4,
                duration: 900
            });
        }

        this.backgroundField.applyImpulse({
            offsetX: 0,
            offsetY: -0.22,
            energy: 0.42,
            twist: 0.35
        });
    }

    handleScrollAccumulation(detail = {}) {
        const accumulator = detail.accumulator || 0;
        const magnitude = detail.magnitude || 0;
        this.backgroundField.applyImpulse({
            offsetX: Math.sign(accumulator) * 0.08 * magnitude,
            offsetY: -0.04 * magnitude,
            energy: 0.24 + magnitude * 0.25,
            twist: accumulator * 0.0006
        });
    }

    handleScrollImpulse(detail = {}) {
        const direction = detail.direction || 1;
        const magnitude = detail.magnitude || 0;
        const polarity = direction >= 0 ? 1 : -1;

        const active = this.getEntity(this.activeCard);
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

        const partner = this.getPartnerCard(polarity);
        if (partner && partner.visualizer && typeof partner.visualizer.applyInteractionResponse === 'function') {
            partner.visualizer.applyInteractionResponse({
                intensity: 0.28 + magnitude * 0.4,
                polarity: -polarity,
                hueSpin: polarity * -0.4,
                densityBias: polarity > 0 ? 0.45 : -0.45,
                duration: 680
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

        if (partner) {
            this.applyCardGlow(partner.card, {
                shiftX: -polarity * 12,
                shiftY: polarity * 16,
                intensity: 0.2 + magnitude * 0.25,
                scale: 1.02 + magnitude * 0.12
            });
        }

        this.backgroundField.applyImpulse({
            offsetX: polarity * (0.18 + magnitude * 0.12),
            offsetY: -polarity * (0.16 + magnitude * 0.1),
            energy: 0.36 + magnitude * 0.55,
            twist: polarity * (0.28 + magnitude * 0.2)
        });
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

        const partner = this.getPartnerCard(polarity);
        if (partner) {
            this.applyCardGlow(partner.card, {
                shiftX: -offsetX * 16,
                shiftY: -offsetY * 14,
                intensity: 0.18 + intensity * 0.3,
                scale: 1.02 + intensity * 0.1
            });
            if (partner.visualizer && typeof partner.visualizer.applyInteractionResponse === 'function') {
                partner.visualizer.applyInteractionResponse({
                    intensity: 0.22 + intensity * 0.3,
                    polarity: -polarity,
                    hueSpin: offsetX * -0.5,
                    densityBias: offsetY * 0.4,
                    duration: 680
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
        const entity = this.getEntity(this.activeCard);
        if (!entity) return;
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
        this.backgroundField.applyImpulse({ offsetX: 0, offsetY: -0.2, energy: 0.65, twist: 0.25 });
    }

    handlePointerUp() {
        const entity = this.getEntity(this.activeCard);
        if (entity && entity.visualizer && typeof entity.visualizer.releaseInteraction === 'function') {
            entity.visualizer.releaseInteraction();
        }
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
        this.backgroundField.reset(0.2);
    }

    getPartnerCard(direction = 1) {
        if (!this.progression) return null;
        const targetIndex = this.progression.currentIndex + (direction >= 0 ? 1 : -1);
        const card = this.progression.cards[targetIndex];
        if (!card) return null;
        return this.getEntity(card);
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
        this.entities.clear();
    }
}
// Export for global use
window.OrthogonalDepthProgression = OrthogonalDepthProgression;
window.PortalTextVisualizer = PortalTextVisualizer;
window.OrthogonalDepthReactivityOrchestrator = OrthogonalDepthReactivityOrchestrator;
window.AmbientBackgroundField = AmbientBackgroundField;