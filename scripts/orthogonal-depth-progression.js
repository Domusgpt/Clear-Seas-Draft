/**
 * ORTHOGONAL DEPTH PROGRESSION SYSTEM
 * Professional avant-garde card progression through Z-axis depth
 * Cards emerge from screen depths with portal-style text visualizers
 * A Paul Phillips Manifestation - Paul@clearseassolutions.com
 */

const ORTHOGONAL_PHASE_PLAN = {
    advance: [
        { name: 'priming', offset: 0, magnitude: 0.32 },
        { name: 'approach', offset: 160, magnitude: 0.58 },
        { name: 'focus', offset: 360, magnitude: 0.9 },
        { name: 'handoff', offset: 720, magnitude: 1.0 }
    ],
    retreat: [
        { name: 'retreat', offset: 0, magnitude: 0.42 },
        { name: 'settle', offset: 320, magnitude: 0.18 }
    ],
    destruction: [
        { name: 'destabilize', offset: 0, magnitude: 0.85 },
        { name: 'transfer', offset: 420, magnitude: 1.15 },
        { name: 'reseed', offset: 960, magnitude: 0.55 }
    ],
    reset: [
        { name: 'recalibrate', offset: 0, magnitude: 0.28 }
    ]
};

class ProgressionPhasePlan {
    constructor(plan) {
        this.plan = plan;
        this.timeouts = new Map();
    }

    schedule(sequence, payload, callback) {
        if (!this.timeouts.has(sequence)) {
            this.timeouts.set(sequence, new Set());
        }

        const timeoutSet = this.timeouts.get(sequence);
        timeoutSet.forEach((timeout) => clearTimeout(timeout));
        timeoutSet.clear();

        const phases = this.plan[sequence] || [];

        phases.forEach((phase) => {
            const timeout = setTimeout(() => {
                callback({ ...payload, phase });
                timeoutSet.delete(timeout);
            }, phase.offset);
            timeoutSet.add(timeout);
        });

        return phases.length;
    }

    clear(sequence = null) {
        if (sequence && this.timeouts.has(sequence)) {
            const set = this.timeouts.get(sequence);
            set.forEach((timeout) => clearTimeout(timeout));
            set.clear();
            return;
        }

        this.timeouts.forEach((set) => {
            set.forEach((timeout) => clearTimeout(timeout));
            set.clear();
        });
        this.timeouts.clear();
    }
}

class ProgressionEventBus {
    constructor(namespace) {
        this.namespace = namespace;
        this.listeners = new Map();
    }

    on(event, handler) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(handler);
        return () => this.off(event, handler);
    }

    off(event, handler) {
        if (!this.listeners.has(event)) return;
        this.listeners.get(event).delete(handler);
    }

    emit(event, detail) {
        const scopedEvent = `${this.namespace}:${event}`;
        const payload = { ...detail, event: scopedEvent, time: performance.now() };

        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach((handler) => handler(payload));
        }

        document.dispatchEvent(new CustomEvent(scopedEvent, { detail: payload }));
    }
}

class ProgressionReactivityController {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.backdrop = new ProgressionDepthBackdrop();
        this.cardMeta = new WeakMap();
        this.activeCard = null;
        this.pointer = { x: 0, y: 0 };
        this.tilt = { beta: 0, gamma: 0 };
        this.attachListeners();
    }

    attachListeners() {
        this.eventBus.on('phase:priming', (detail) => this.handlePriming(detail));
        this.eventBus.on('phase:approach', (detail) => this.handleApproach(detail));
        this.eventBus.on('phase:focus', (detail) => this.handleFocus(detail));
        this.eventBus.on('phase:handoff', (detail) => this.handleHandoff(detail));
        this.eventBus.on('phase:retreat', (detail) => this.handleRetreat(detail));
        this.eventBus.on('phase:settle', (detail) => this.handleSettle(detail));
        this.eventBus.on('phase:destabilize', (detail) => this.handleDestabilize(detail));
        this.eventBus.on('phase:transfer', (detail) => this.handleTransfer(detail));
        this.eventBus.on('phase:reseed', (detail) => this.handleReseed(detail));
        this.eventBus.on('phase:recalibrate', (detail) => this.handleRecalibrate(detail));
        this.eventBus.on('card:state', (detail) => this.handleCardState(detail));
        this.eventBus.on('cards:registered', (detail) => this.backdrop.setCardCount(detail.cards?.length || 0));

        window.addEventListener('pointermove', (event) => {
            const normalizedX = (event.clientX / window.innerWidth) * 2 - 1;
            const normalizedY = (event.clientY / window.innerHeight) * 2 - 1;
            this.pointer = { x: normalizedX, y: normalizedY };
            this.backdrop.updatePointer(normalizedX, normalizedY);
            this.syncActiveCardPointer();
        });
    }

    initializeWithCards(cards) {
        cards.forEach((card, index) => {
            this.cardMeta.set(card, {
                index,
                originTilt: { x: 0, y: 0 },
                inheritedTrait: null
            });
        });
        this.backdrop.setCardCount(cards.length);
        this.bindTiltSystem();
    }

    bindTiltSystem() {
        if (window.geometricTiltSystem && typeof window.geometricTiltSystem.attachProgressionBus === 'function') {
            window.geometricTiltSystem.attachProgressionBus(this.eventBus, {
                onTiltUpdate: (tilt) => {
                    this.tilt = tilt;
                    this.backdrop.updateTilt(tilt);
                    this.syncActiveCardTilt();
                }
            });
        }
    }

    handlePriming(detail) {
        this.backdrop.pushIntensity(0.3 + detail.phase.magnitude * 0.4);
        this.applyComplementaryResponse(detail.toCard, 0.08, 0.02);
    }

    handleApproach(detail) {
        this.activeCard = detail.toCard || this.activeCard;
        this.backdrop.shiftGrid({ tiltX: 52, tiltZ: -3, scale: 0.9, opacity: 0.52 });
        this.applyComplementaryResponse(detail.toCard, 0.12, 0.05);
        this.syncActiveCardPointer();
    }

    handleFocus(detail) {
        this.activeCard = detail.toCard;
        this.backdrop.pushIntensity(0.8);
        this.backdrop.shiftGrid({ scale: 0.78, opacity: 0.65 });
        this.applyComplementaryResponse(detail.toCard, 0.18, 0.06, detail.phase.magnitude);
        this.syncActiveCardTilt();
    }

    handleHandoff(detail) {
        if (detail.toCard && detail.fromCard) {
            this.backdrop.spark(detail.phase.magnitude);
            this.bridgeTrait(detail.fromCard, detail.toCard, detail.inheritedTrait);
        }
        this.applyComplementaryResponse(detail.toCard, 0.2, 0.08);
    }

    handleRetreat(detail) {
        if (detail.fromCard) {
            this.applyComplementaryResponse(detail.fromCard, -0.08, -0.04);
        }
        this.backdrop.shiftGrid({ scale: 1.05, opacity: 0.4 });
    }

    handleSettle() {
        this.backdrop.pushIntensity(0.35);
    }

    handleDestabilize(detail) {
        if (detail.card) {
            this.applyComplementaryResponse(detail.card, 0.28, 0.12);
        }
        this.backdrop.spark(detail.phase.magnitude + 0.2);
    }

    handleTransfer(detail) {
        if (detail.card) {
            this.backdrop.pushIntensity(0.95);
            this.backdrop.shiftGrid({ scale: 0.74, opacity: 0.7 });
        }
    }

    handleReseed() {
        this.backdrop.pushIntensity(0.45);
        this.backdrop.shiftGrid({ scale: 0.88, opacity: 0.48 });
    }

    handleRecalibrate() {
        this.backdrop.pushIntensity(0.25);
        this.backdrop.shiftGrid({ scale: 1, opacity: 0.42 });
    }

    handleCardState(detail) {
        const { card, state } = detail;
        if (!card) return;
        const entry = this.cardMeta.get(card) || {};
        entry.state = state;
        this.cardMeta.set(card, entry);

        if (state === 'focused') {
            this.activeCard = card;
            this.syncActiveCardPointer();
            this.syncActiveCardTilt();
        } else if (state === 'far-depth' || state === 'destroyed') {
            card.style.setProperty('--card-reactive-translate-x', '0px');
            card.style.setProperty('--card-reactive-translate-y', '0px');
            card.style.setProperty('--card-reactive-tilt-x', '0deg');
            card.style.setProperty('--card-reactive-tilt-y', '0deg');
        }
    }

    applyComplementaryResponse(card, translate = 0, scale = 0, magnitude = 1) {
        if (!(card instanceof HTMLElement)) return;
        const mod = this.cardMeta.get(card) || {};
        const translateX = this.pointer.x * translate * 40 * magnitude;
        const translateY = this.pointer.y * translate * 30 * magnitude;
        const tiltX = this.tilt.gamma * scale * 4 * magnitude;
        const tiltY = this.tilt.beta * scale * 4 * magnitude;

        card.style.setProperty('--card-reactive-translate-x', `${translateX.toFixed(2)}px`);
        card.style.setProperty('--card-reactive-translate-y', `${translateY.toFixed(2)}px`);
        card.style.setProperty('--card-reactive-tilt-x', `${tiltX.toFixed(2)}deg`);
        card.style.setProperty('--card-reactive-tilt-y', `${tiltY.toFixed(2)}deg`);

        mod.lastComplementary = { translateX, translateY, tiltX, tiltY };
        this.cardMeta.set(card, mod);
    }

    bridgeTrait(fromCard, toCard, trait) {
        if (!trait) return;
        const entry = this.cardMeta.get(toCard) || {};
        entry.inheritedTrait = trait;
        this.cardMeta.set(toCard, entry);

        const title = toCard?.querySelector('.card-title');
        if (title) {
            title.style.setProperty('--inherited-hue', `${trait.hue || 210}`);
            title.style.textShadow = `0 0 25px hsla(${trait.hue || 210}, 100%, 60%, 0.5)`;
        }
    }

    syncActiveCardPointer() {
        if (!this.activeCard) return;
        this.applyComplementaryResponse(this.activeCard, 0.18, 0.06);
    }

    syncActiveCardTilt() {
        if (!this.activeCard) return;
        this.applyComplementaryResponse(this.activeCard, 0.1, 0.12);
    }
}

class ProgressionDepthBackdrop {
    constructor() {
        this.backdrop = document.getElementById('depthBackdrop');
        this.grid = document.getElementById('depthBackdropGrid');
        this.canvas = document.getElementById('depthBackdropCanvas');
        this.context = this.canvas ? this.canvas.getContext('2d') : null;
        this.cardCount = 0;
        this.intensity = 0.4;
        this.pointer = { x: 0, y: 0 };
        this.tilt = { beta: 0, gamma: 0 };
        this.noiseSeed = Math.random() * 1000;
        this.animationFrame = null;
        this.resizeObserver = null;
        this.setup();
    }

    setup() {
        if (!this.canvas || !this.context) return;

        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            this.canvas.width = this.canvas.clientWidth * dpr;
            this.canvas.height = this.canvas.clientHeight * dpr;
            this.context.setTransform(1, 0, 0, 1, 0, 0);
            this.context.scale(dpr, dpr);
        };

        resize();

        this.resizeObserver = new ResizeObserver(resize);
        this.resizeObserver.observe(this.canvas);

        this.startLoop();
    }

    startLoop() {
        if (this.animationFrame) return;

        const render = () => {
            this.draw();
            this.animationFrame = requestAnimationFrame(render);
        };

        this.animationFrame = requestAnimationFrame(render);
    }

    draw() {
        if (!this.context) return;
        const ctx = this.context;
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        ctx.clearRect(0, 0, width, height);

        const intensity = this.intensity;
        const gradient = ctx.createRadialGradient(
            width * (0.5 + this.pointer.x * 0.1),
            height * (0.45 + this.pointer.y * 0.1),
            0,
            width * (0.5 + this.pointer.x * 0.1),
            height * (0.45 + this.pointer.y * 0.1),
            Math.max(width, height) * 0.7
        );
        gradient.addColorStop(0, `hsla(${210 + this.tilt.gamma * 2}, 95%, ${30 + intensity * 40}%, ${0.35 + intensity * 0.25})`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        const rings = 8;
        for (let i = 0; i < rings; i++) {
            const radius = (Math.max(width, height) * (i + 1)) / rings;
            ctx.beginPath();
            ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
            ctx.strokeStyle = `hsla(${(260 + i * 12 + this.tilt.beta) % 360}, 85%, 60%, ${(0.04 + intensity * 0.08) * (1 - i / rings)})`;
            ctx.lineWidth = 1 + intensity * 4;
            ctx.stroke();
        }
    }

    pushIntensity(target) {
        this.intensity = Math.max(0.2, Math.min(1.25, target));
        if (this.backdrop) {
            this.backdrop.style.setProperty('--backdrop-intensity', this.intensity.toFixed(2));
        }
    }

    shiftGrid({ tiltX, tiltZ, scale, opacity }) {
        if (!this.grid) return;
        if (typeof tiltX === 'number') {
            this.grid.style.setProperty('--grid-tilt-x', `${tiltX}deg`);
        }
        if (typeof tiltZ === 'number') {
            this.grid.style.setProperty('--grid-tilt-z', `${tiltZ}deg`);
        }
        if (typeof scale === 'number') {
            this.grid.style.setProperty('--grid-scale', scale.toFixed(2));
        }
        if (typeof opacity === 'number') {
            this.grid.style.setProperty('--grid-opacity', opacity.toFixed(2));
        }
    }

    spark(energy) {
        this.pushIntensity(Math.min(1.35, this.intensity + energy * 0.15));
        if (this.backdrop) {
            this.backdrop.style.setProperty('--backdrop-canvas-opacity', Math.min(1, 0.55 + energy * 0.2).toFixed(2));
        }
    }

    updatePointer(x, y) {
        this.pointer = { x, y };
    }

    updateTilt(tilt) {
        this.tilt = tilt;
        this.shiftGrid({ tiltZ: -tilt.gamma * 0.2 });
    }

    setCardCount(count) {
        this.cardCount = count;
        if (this.grid) {
            this.grid.dataset.cardCount = count;
        }
    }
}

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

        this.eventBus = new ProgressionEventBus('orthogonal-depth');
        this.phasePlan = new ProgressionPhasePlan(ORTHOGONAL_PHASE_PLAN);
        this.reactivity = new ProgressionReactivityController(this.eventBus);

        this.init();
    }

    init() {
        console.log('🎯 Initializing Orthogonal Depth Progression System...');

        this.findProgressionCards();
        this.setupScrollProgression();
        this.setupKeyboardControls();
        this.initializePortalVisualizers();
        this.setInitialPositions();

        this.reactivity.initializeWithCards(this.cards);
        this.eventBus.emit('plan:ready', { cards: this.cards });

        console.log('✅ Orthogonal Depth Progression initialized - Professional Avant-garde Mode');
    }

    findProgressionCards() {
        this.cards = Array.from(document.querySelectorAll('.progression-card'));
        console.log(`🎨 Found ${this.cards.length} progression cards`);
        this.eventBus.emit('cards:registered', { cards: this.cards });
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

        this.phasePlan.schedule('advance', {
            fromCard: currentCard,
            toCard: newCard,
            inheritedTrait
        }, (detail) => {
            this.eventBus.emit(`phase:${detail.phase.name}`, {
                ...detail,
                fromCard: currentCard,
                toCard: newCard,
                inheritedTrait,
                plan: 'advance'
            });
        });

        // Deactivate current card portal
        this.deactivatePortalForCard(currentCard);

        // Exit current card
        this.setCardState(currentCard, 'exiting');

        this.phasePlan.schedule('retreat', { fromCard: currentCard }, (detail) => {
            this.eventBus.emit(`phase:${detail.phase.name}`, {
                ...detail,
                fromCard: currentCard,
                plan: 'retreat'
            });
        });

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

        this.phasePlan.schedule('reset', { card: this.cards[this.currentIndex] }, (detail) => {
            this.eventBus.emit(`phase:${detail.phase.name}`, {
                ...detail,
                plan: 'reset'
            });
        });
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

        this.eventBus.emit('card:state', { card, state, inheritedTrait });
    }

    activatePortalForCard(card, inheritedTrait = null) {
        const portal = card.querySelector('.portal-text-visualizer');
        if (portal && portal.portalVisualizer) {
            const trait = inheritedTrait || card._pendingTrait || card._activeTrait || null;
            if (trait && portal.portalVisualizer.applyInheritedTrait) {
                portal.portalVisualizer.applyInheritedTrait(trait);
            }
            portal.portalVisualizer.activate();
        }

        // Add glow effect to card title
        const title = card.querySelector('.card-title');
        if (title) {
            title.style.textShadow = '0 0 20px var(--clear-seas-primary), 0 0 40px var(--clear-seas-primary)';
            title.style.transform = 'scale(1.05)';
        }

        this.eventBus.emit('portal:activated', { card, inheritedTrait });
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

        this.eventBus.emit('portal:deactivated', { card });
    }

    destroyCurrentCard(callback) {
        const currentCard = this.cards[this.currentIndex];
        const destructionType = currentCard.dataset.destruction || 'quantum';

        this.deactivatePortalForCard(currentCard);

        this.setCardState(currentCard, 'destroyed');

        const visualizer = this.getVisualizerForCard(currentCard);
        const inheritedTrait = visualizer ? visualizer.triggerDestructionSequence() : null;
        this.pendingInheritedTrait = inheritedTrait;

        currentCard.classList.add(`destruction-${destructionType}`);

        this.phasePlan.schedule('destruction', { card: currentCard, inheritedTrait }, (detail) => {
            this.eventBus.emit(`phase:${detail.phase.name}`, {
                ...detail,
                card: currentCard,
                inheritedTrait,
                plan: 'destruction'
            });
        });

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

        this.phasePlan.clear();
        this.eventBus.emit('progression:destroyed', {});

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

        this.inheritedTrait = null;
        this.traitFlourish = null;
        this.resizeObserver = null;

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

    update() {
        this.portalDepth += (this.targetDepth - this.portalDepth) * 0.08;
        this.portalRotation += 0.02;
        this.portalPulse = Math.sin(Date.now() * 0.003) * 0.5 + 0.5;

        if (this.traitFlourish && this.traitFlourish.active) {
            const progress = (performance.now() - this.traitFlourish.start) / this.traitFlourish.duration;
            if (progress >= 1) {
                this.traitFlourish.active = false;
            }
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

    renderPortal() {
        const ctx = this.context;
        const width = this.canvas.width / (window.devicePixelRatio || 1);
        const height = this.canvas.height / (window.devicePixelRatio || 1);

        ctx.clearRect(0, 0, width, height);

        if (this.portalDepth < 0.01) return;

        const centerX = width / 2;
        const centerY = height / 2;
        const intensity = this.portalDepth;
        const palette = this.getPalette();
        const trait = this.inheritedTrait || {};
        const flourish = this.getTraitFlourishIntensity();
        const moireBoost = trait.moireBoost || 0;
        const glitchBoost = trait.glitchBoost || 0;

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
// Export for global use
window.ORTHOGONAL_DEPTH_PHASE_PLAN = ORTHOGONAL_PHASE_PLAN;
window.OrthogonalDepthProgression = OrthogonalDepthProgression;
window.PortalTextVisualizer = PortalTextVisualizer;