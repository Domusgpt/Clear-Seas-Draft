/**
 * ORTHOGONAL DEPTH PROGRESSION SYSTEM – REACTIVE MAGAZINE DECK
 * Scroll-locked card progression with VIB3-4D inspired visualizers.
 * Implements choreographed destruction hand-off and attribute inheritance.
 */

class OrthogonalDepthProgression {
    constructor() {
        this.cards = [];
        this.currentIndex = 0;
        this.progressionStates = ['far-depth', 'approaching', 'focused', 'exiting', 'destroyed'];

        this.timings = {
            cardTransition: 900,
            approachDelay: 260,
            destructionDelay: 1400,
            portalActivation: 320,
            flourishLifetime: 1600
        };

        this.scrollAccumulator = 0;
        this.scrollThreshold = 120;
        this.touchStart = 0;
        this.touchActive = false;

        this.isTransitioning = false;
        this.isDestroying = false;
        this.isAutoProgressing = false;
        this.autoProgressInterval = null;

        this.signatureRelay = null;

        this.init();
    }

    init() {
        this.findProgressionCards();
        if (!this.cards.length) {
            console.warn('⚠️ No progression cards found for Orthogonal Depth Progression.');
            return;
        }

        this.setupScrollProgression();
        this.setupKeyboardControls();
        this.initializePortalVisualizers();
        this.setInitialPositions();

        console.log('✅ Orthogonal Depth Progression ready with', this.cards.length, 'cards.');
    }

    findProgressionCards() {
        this.cards = Array.from(document.querySelectorAll('.progression-card'));
        this.cards.forEach((card, index) => {
            card.dataset.cardIndex = index;
        });
    }

    setupScrollProgression() {
        let scrollTimeout;

        window.addEventListener('wheel', (event) => {
            event.preventDefault();
            if (this.isTransitioning || this.isDestroying) return;

            this.scrollAccumulator += event.deltaY;
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => this.handleScrollProgression(), 60);
        }, { passive: false });

        this.setupTouchProgression();
    }

    setupTouchProgression() {
        document.addEventListener('touchstart', (event) => {
            if (event.touches.length !== 1) return;
            this.touchActive = true;
            this.touchStart = event.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchmove', (event) => {
            if (!this.touchActive || event.touches.length !== 1) return;
            event.preventDefault();

            const currentY = event.touches[0].clientY;
            const delta = this.touchStart - currentY;

            if (Math.abs(delta) > 32) {
                if (delta > 0) {
                    this.nextCard();
                } else {
                    this.previousCard();
                }
                this.touchStart = currentY;
            }
        }, { passive: false });

        document.addEventListener('touchend', () => {
            this.touchActive = false;
        });
    }

    handleScrollProgression() {
        if (Math.abs(this.scrollAccumulator) >= this.scrollThreshold) {
            if (this.scrollAccumulator > 0) {
                this.nextCard();
            } else {
                this.previousCard();
            }
            this.scrollAccumulator = 0;
        } else {
            this.scrollAccumulator *= 0.7;
        }
    }

    setupKeyboardControls() {
        document.addEventListener('keydown', (event) => {
            if (this.isTransitioning || this.isDestroying) return;

            switch (event.code) {
                case 'ArrowDown':
                case 'Space':
                case 'PageDown':
                    event.preventDefault();
                    this.nextCard();
                    break;
                case 'ArrowUp':
                case 'PageUp':
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
            if (!portalElement) return;

            const config = {
                geometry: card.dataset.visualizerGeometry || card.dataset.vib34d || 'hypercube',
                hue: Number(card.dataset.visualizerHue) || 210,
                baseSpeed: Number(card.dataset.visualizerSpeed) || 0.6,
                baseDensity: Number(card.dataset.visualizerDensity) || 1,
                baseGlitch: Number(card.dataset.visualizerGlitch) || 0.3,
                baseMoire: Number(card.dataset.visualizerMoire) || 0.6,
                signature: card.dataset.signature || 'core'
            };

            const canvas = document.createElement('canvas');
            canvas.className = 'portal-canvas';
            canvas.style.cssText = '
                position:absolute;
                inset:0;
                border-radius:inherit;
                pointer-events:none;
            ';
            portalElement.appendChild(canvas);

            portalElement.portalVisualizer = new PortalTextVisualizer(canvas, card.dataset.vib34d || 'quantum', index, config);
        });
    }

    setInitialPositions() {
        this.cards.forEach((card, index) => {
            if (index === 0) {
                this.setCardState(card, 'focused');
                this.activatePortalForCard(card);
                card.style.zIndex = 1000;
            } else {
                this.setCardState(card, 'far-depth');
                card.style.zIndex = String(this.cards.length - index);
            }
        });
        this.currentIndex = 0;
    }

    setCardState(card, state) {
        this.progressionStates.forEach(s => card.classList.remove(s));
        card.classList.add(state);

        switch (state) {
            case 'focused':
                card.style.zIndex = 1000;
                break;
            case 'approaching':
                card.style.zIndex = 920;
                break;
            case 'exiting':
                card.style.zIndex = 820;
                break;
            case 'far-depth':
                card.style.zIndex = 120;
                break;
            case 'destroyed':
                card.style.zIndex = 60;
                break;
        }

        this.updatePortalStateForCard(card, state);
        this.updateCardTitleState(card, state === 'focused');
    }

    updatePortalStateForCard(card, state) {
        const portal = card.querySelector('.portal-text-visualizer');
        if (portal && portal.portalVisualizer) {
            portal.portalVisualizer.updateCardState(state);
        }
    }

    updateCardTitleState(card, isFocused) {
        const title = card.querySelector('.card-title');
        if (!title) return;
        if (isFocused) {
            title.style.textShadow = '0 0 28px rgba(86, 240, 255, 0.55), 0 0 48px rgba(255, 102, 249, 0.35)';
            title.style.transform = 'translateZ(0) scale(1.02)';
        } else {
            title.style.textShadow = '';
            title.style.transform = '';
        }
    }

    activatePortalForCard(card) {
        const portal = card.querySelector('.portal-text-visualizer');
        if (portal && portal.portalVisualizer) {
            const signature = this.signatureRelay;
            portal.portalVisualizer.activate(signature);
            if (signature) {
                this.createSignatureFlourish(card, signature);
            }
        }
        this.signatureRelay = null;
    }

    deactivatePortalForCard(card) {
        const portal = card.querySelector('.portal-text-visualizer');
        if (portal && portal.portalVisualizer) {
            portal.portalVisualizer.deactivate();
        }
    }

    createSignatureFlourish(card, signature) {
        const flourish = document.createElement('div');
        flourish.className = 'signature-flourish';
        flourish.style.setProperty('--flourish-hue', String((signature.sourceHue + (signature.hueShift || 0)) % 360));

        const label = document.createElement('div');
        label.className = 'signature-flourish__label';
        label.textContent = `${signature.label || signature.id} transfered`;
        flourish.appendChild(label);

        card.appendChild(flourish);
        setTimeout(() => flourish.remove(), this.timings.flourishLifetime);
    }

    nextCard() {
        if (this.isTransitioning || this.isDestroying) return;

        if (this.currentIndex >= this.cards.length - 1) {
            this.isTransitioning = true;
            this.destroyCurrentCard(() => {
                this.currentIndex = 0;
                this.progressToCurrentCard(true);
                this.isTransitioning = false;
            });
            return;
        }

        this.progressToCard(this.currentIndex + 1);
    }

    previousCard() {
        if (this.isTransitioning || this.isDestroying) return;

        const target = this.currentIndex <= 0 ? this.cards.length - 1 : this.currentIndex - 1;
        this.progressToCard(target);
    }

    goToCard(index) {
        if (this.isTransitioning || this.isDestroying) return;
        if (index < 0 || index >= this.cards.length || index === this.currentIndex) return;
        this.progressToCard(index);
    }

    progressToCard(newIndex) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        const currentCard = this.cards[this.currentIndex];
        const nextCard = this.cards[newIndex];

        this.deactivatePortalForCard(currentCard);
        this.setCardState(currentCard, 'exiting');

        setTimeout(() => {
            this.setCardState(nextCard, 'approaching');

            setTimeout(() => {
                this.currentIndex = newIndex;
                this.setCardState(nextCard, 'focused');
                this.activatePortalForCard(nextCard);

                setTimeout(() => {
                    this.setCardState(currentCard, 'far-depth');
                    this.isTransitioning = false;
                }, this.timings.cardTransition * 0.7);
            }, this.timings.cardTransition * 0.6);
        }, this.timings.approachDelay);
    }

    progressToCurrentCard(fromDestruction = false) {
        this.cards.forEach((card, index) => {
            if (index === this.currentIndex) {
                this.setCardState(card, 'focused');
                this.activatePortalForCard(card);
            } else if (fromDestruction) {
                this.setCardState(card, 'far-depth');
                this.deactivatePortalForCard(card);
            } else if (index < this.currentIndex) {
                this.setCardState(card, 'far-depth');
                this.deactivatePortalForCard(card);
            } else {
                this.setCardState(card, 'far-depth');
                this.deactivatePortalForCard(card);
            }
        });
    }

    destroyCurrentCard(callback) {
        if (this.isDestroying) return;
        this.isDestroying = true;

        const currentCard = this.cards[this.currentIndex];
        const destructionType = currentCard.dataset.destruction || 'quantum';
        const portal = currentCard.querySelector('.portal-text-visualizer');
        let signature = null;

        if (portal && portal.portalVisualizer) {
            signature = portal.portalVisualizer.triggerDestruction(destructionType);
            setTimeout(() => portal.portalVisualizer.deactivateAfterDestruction(), this.timings.destructionDelay * 0.6);
        }

        if (signature) {
            this.signatureRelay = signature;
        }

        this.setCardState(currentCard, 'destroyed');
        currentCard.classList.add(`destruction-${destructionType}`);

        setTimeout(() => {
            currentCard.classList.remove(`destruction-${destructionType}`);
            this.deactivatePortalForCard(currentCard);
            this.setCardState(currentCard, 'far-depth');

            this.isDestroying = false;
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
        if (this.isAutoProgressing) return;
        this.isAutoProgressing = true;
        this.autoProgressInterval = setInterval(() => this.nextCard(), 5200);
        console.log('▶️ Auto progression engaged');
    }

    stopAutoProgress() {
        if (!this.isAutoProgressing) return;
        this.isAutoProgressing = false;
        if (this.autoProgressInterval) {
            clearInterval(this.autoProgressInterval);
            this.autoProgressInterval = null;
        }
        console.log('⏸️ Auto progression halted');
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
 * PORTAL TEXT VISUALIZER – Canvas driven VIB3-4D inspired renderer
 */
class PortalTextVisualizer {
    constructor(canvas, systemType, cardIndex, config) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.systemType = systemType;
        this.cardIndex = cardIndex;

        this.config = {
            geometry: config.geometry,
            hue: config.hue,
            baseSpeed: config.baseSpeed,
            baseDensity: config.baseDensity,
            baseGlitch: config.baseGlitch,
            baseMoire: config.baseMoire,
            signature: config.signature
        };

        this.state = 'far-depth';
        this.isActive = false;
        this.portalDepth = 0;
        this.targetDepth = 0;

        this.current = {
            speed: this.config.baseSpeed * 0.25,
            glitch: this.config.baseGlitch * 0.2,
            density: this.config.baseDensity,
            moire: this.config.baseMoire
        };

        this.target = { ...this.current };

        this.effects = {
            moireStrength: this.config.baseMoire,
            chromaBloom: 0.35,
            particleBloom: 0.5
        };

        this.hueShift = 0;
        this.targetHueShift = 0;
        this.time = Math.random() * 100;
        this.glitchSeed = Math.random() * 1000;

        this.animationFrame = null;
        this.resizeObserver = null;

        this.signatureRegistry = new Set([this.config.signature || 'core']);
        this.signatureHistory = [];

        this.particles = [];
        this.destructionActive = false;
        this.destructionPhase = 0;

        this.init();
    }

    init() {
        this.setupCanvas();
        this.applyStateTargets('far-depth');
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

    activate(signature) {
        this.isActive = true;
        this.targetDepth = Math.max(this.targetDepth, 1.0);
        if (signature) {
            this.applyInheritedSignature(signature);
        }
        this.startRenderLoop();
        console.log(`🌀 Portal activated for card ${this.cardIndex}`);
    }

    deactivate() {
        this.isActive = false;
        this.targetDepth = Math.min(this.targetDepth, 0.08);
        if (!this.animationFrame && this.portalDepth > 0.01) {
            this.startRenderLoop();
        }
    }

    deactivateAfterDestruction() {
        this.isActive = false;
        this.targetDepth = 0;
        this.destructionActive = false;
    }

    updateCardState(state) {
        this.state = state;
        this.applyStateTargets(state);
    }

    applyStateTargets(state) {
        const base = this.config;
        const profiles = {
            'far-depth': {
                depth: 0.06,
                speed: base.baseSpeed * 0.32,
                glitch: base.baseGlitch * 0.18,
                density: base.baseDensity * 1.2,
                moire: base.baseMoire * 0.85
            },
            'approaching': {
                depth: 0.58,
                speed: base.baseSpeed * 0.9,
                glitch: base.baseGlitch * 0.95,
                density: base.baseDensity * 0.88,
                moire: base.baseMoire * 1.05
            },
            'focused': {
                depth: 1.12,
                speed: base.baseSpeed * 1.45,
                glitch: base.baseGlitch * 1.65,
                density: base.baseDensity * 0.56,
                moire: base.baseMoire * 1.32
            },
            'exiting': {
                depth: 0.46,
                speed: base.baseSpeed * 1.1,
                glitch: base.baseGlitch * 1.4,
                density: base.baseDensity * 0.74,
                moire: base.baseMoire * 1.12
            },
            'destroyed': {
                depth: 1.38,
                speed: base.baseSpeed * 1.85,
                glitch: base.baseGlitch * 2.15,
                density: base.baseDensity * 0.42,
                moire: base.baseMoire * 1.6
            }
        };

        const profile = profiles[state] || profiles['far-depth'];
        this.targetDepth = profile.depth;
        this.target.speed = profile.speed;
        this.target.glitch = profile.glitch;
        this.target.density = profile.density;
        this.target.moire = profile.moire;
    }

    startRenderLoop() {
        if (this.animationFrame) return;

        const render = () => {
            this.update();
            this.renderPortal();

            if (this.isActive || this.portalDepth > 0.01 || this.destructionActive || this.particles.length > 0) {
                this.animationFrame = requestAnimationFrame(render);
            } else {
                this.animationFrame = null;
            }
        };

        this.animationFrame = requestAnimationFrame(render);
    }

    update() {
        const smoothing = 0.085;
        this.portalDepth += (this.targetDepth - this.portalDepth) * 0.09;
        this.current.speed += (this.target.speed - this.current.speed) * smoothing;
        this.current.glitch += (this.target.glitch - this.current.glitch) * smoothing;
        this.current.density += (this.target.density - this.current.density) * smoothing;
        this.current.moire += (this.target.moire - this.current.moire) * smoothing;

        this.effects.moireStrength += (this.current.moire - this.effects.moireStrength) * 0.04;
        this.hueShift += (this.targetHueShift - this.hueShift) * 0.06;

        this.time += 0.016 * (0.9 + this.current.speed * 1.9);

        if (this.destructionActive) {
            this.destructionPhase += 0.035 * (1 + this.current.speed * 0.5);
            if (this.destructionPhase > 1.6) {
                this.destructionActive = false;
            }
        }

        this.updateParticles();
    }

    renderPortal() {
        const ctx = this.context;
        const dpr = window.devicePixelRatio || 1;
        const width = this.canvas.width / dpr;
        const height = this.canvas.height / dpr;

        ctx.clearRect(0, 0, width, height);
        if (this.portalDepth < 0.02 && !this.destructionActive && !this.particles.length) {
            return;
        }

        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(centerX, centerY) * 0.92;

        const baseHue = (this.config.hue + this.hueShift) % 360;
        const depth = Math.max(0.05, this.portalDepth);
        const glitch = Math.max(0.01, this.current.glitch);
        const density = Math.max(0.1, this.current.density);
        const moire = Math.max(0.2, this.effects.moireStrength);

        // Background glow
        const glow = ctx.createRadialGradient(centerX, centerY, radius * 0.08, centerX, centerY, radius);
        glow.addColorStop(0, `hsla(${baseHue}, 88%, ${48 + depth * 12}%, ${0.18 + depth * 0.4})`);
        glow.addColorStop(0.65, `hsla(${(baseHue + 40) % 360}, 92%, 62%, ${0.12 + glitch * 0.18})`);
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);

        // Moiré rings
        const ringCount = Math.max(6, Math.floor(26 * density));
        for (let i = 0; i < ringCount; i++) {
            const progress = i / ringCount;
            const dynamicRadius = radius * (1 - progress * 0.82);
            const distort = Math.sin(progress * (6 + moire * 3) + this.time * (0.6 + this.current.speed * 0.4));

            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(progress * Math.PI * (0.4 + moire * 0.15));
            ctx.strokeStyle = `hsla(${(baseHue + progress * 55) % 360}, 85%, ${60 - progress * 20}%, ${(0.45 - progress * 0.32) * depth})`;
            ctx.lineWidth = 1 + depth * (1 - progress) * 2.4;
            ctx.globalAlpha = Math.max(0, 0.75 - progress * 0.7) * depth;
            ctx.beginPath();
            ctx.ellipse(distort * 6, distort * -4, dynamicRadius, dynamicRadius * (0.82 + moire * 0.12 + distort * 0.06), 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
        ctx.globalAlpha = 1;

        // Core geometry
        this.renderGeometry(ctx, centerX, centerY, radius, baseHue, depth, glitch);

        // Glitch overlays
        if (glitch > 0.05) {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            const offsets = [-1, 1, 0];
            offsets.forEach((mult, index) => {
                const offset = Math.sin(this.time * (0.6 + index * 0.2) + this.glitchSeed) * glitch * 24 * mult;
                ctx.strokeStyle = `hsla(${(baseHue + 90 + index * 24) % 360}, 92%, 70%, ${0.18 + glitch * 0.22})`;
                ctx.lineWidth = 2.2 + glitch * 3.1;
                ctx.beginPath();
                ctx.arc(centerX + offset, centerY - offset, radius * (0.32 + index * 0.08 + depth * 0.1), 0, Math.PI * 2);
                ctx.stroke();
            });
            ctx.restore();
        }

        // Particle system
        if (this.particles.length) {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            this.particles.forEach(particle => {
                const alpha = Math.max(0, particle.life);
                if (alpha <= 0) return;

                const px = centerX + Math.cos(particle.angle) * particle.radius;
                const py = centerY + Math.sin(particle.angle) * particle.radius;
                const size = 3 + particle.energy * 6;

                ctx.fillStyle = `hsla(${(baseHue + particle.hueShift) % 360}, 100%, ${68 + particle.energy * 24}%, ${alpha * 0.8})`;
                ctx.beginPath();
                ctx.arc(px, py, size, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.restore();
        }
    }

    renderGeometry(ctx, centerX, centerY, radius, hue, depth, glitch) {
        ctx.save();
        ctx.translate(centerX, centerY);
        const rotation = this.time * (0.4 + this.current.speed * 0.35);

        switch (this.config.geometry) {
            case 'orbital':
                this.drawOrbitalGeometry(ctx, radius, hue, rotation, depth, glitch);
                break;
            case 'polyhedral':
                this.drawPolyhedralGeometry(ctx, radius, hue, rotation, depth);
                break;
            case 'helix':
                this.drawHelixGeometry(ctx, radius, hue, rotation, depth);
                break;
            case 'hypercube':
            default:
                this.drawHypercubeGeometry(ctx, radius, hue, rotation, depth);
                break;
        }

        ctx.restore();
    }

    drawHypercubeGeometry(ctx, radius, hue, rotation, depth) {
        const size = radius * 0.42;
        const inner = size * 0.68;
        const pointsOuter = [];
        const pointsInner = [];

        for (let i = 0; i < 4; i++) {
            const angle = rotation + (Math.PI / 2) * i;
            pointsOuter.push({ x: Math.cos(angle) * size, y: Math.sin(angle) * size });
            pointsInner.push({ x: Math.cos(angle) * inner, y: Math.sin(angle) * inner });
        }

        ctx.strokeStyle = `hsla(${hue}, 90%, 72%, ${0.45 + depth * 0.3})`;
        ctx.lineWidth = 1.6 + depth * 1.2;
        ctx.beginPath();
        pointsOuter.forEach((pt, index) => {
            if (index === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
        });
        ctx.closePath();
        ctx.stroke();

        ctx.globalAlpha = 0.42 + depth * 0.3;
        ctx.beginPath();
        pointsInner.forEach((pt, index) => {
            if (index === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
        });
        ctx.closePath();
        ctx.stroke();

        ctx.globalAlpha = 0.58 + depth * 0.25;
        pointsOuter.forEach((pt, index) => {
            ctx.beginPath();
            ctx.moveTo(pt.x, pt.y);
            ctx.lineTo(pointsInner[index].x, pointsInner[index].y);
            ctx.stroke();
        });
        ctx.globalAlpha = 1;
    }

    drawOrbitalGeometry(ctx, radius, hue, rotation, depth, glitch) {
        const rings = 3;
        for (let i = 0; i < rings; i++) {
            const prog = i / rings;
            ctx.save();
            ctx.rotate(rotation * (1.4 - prog * 0.6));
            ctx.strokeStyle = `hsla(${(hue + prog * 48) % 360}, 95%, 70%, ${0.35 + depth * 0.25})`;
            ctx.lineWidth = 1.2 + depth * 1.1;
            ctx.beginPath();
            ctx.ellipse(0, 0, radius * (0.35 + prog * 0.18), radius * (0.18 + prog * 0.28), rotation * (0.5 + prog), 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        ctx.fillStyle = `hsla(${(hue + 22) % 360}, 90%, 68%, ${0.26 + glitch * 0.25})`;
        ctx.beginPath();
        ctx.arc(Math.sin(rotation) * radius * 0.18, Math.cos(rotation * 1.2) * radius * 0.18, radius * 0.08 + glitch * 4, 0, Math.PI * 2);
        ctx.fill();
    }

    drawPolyhedralGeometry(ctx, radius, hue, rotation, depth) {
        const sides = 6;
        const size = radius * 0.5;
        ctx.strokeStyle = `hsla(${hue}, 85%, 68%, ${0.42 + depth * 0.28})`;
        ctx.lineWidth = 1.4 + depth * 1.4;
        ctx.beginPath();
        for (let i = 0; i <= sides; i++) {
            const angle = rotation + (Math.PI * 2 * i) / sides;
            const x = Math.cos(angle) * size;
            const y = Math.sin(angle) * size;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.globalAlpha = 0.35 + depth * 0.32;
        ctx.beginPath();
        for (let i = 0; i <= sides; i++) {
            const angle = rotation + (Math.PI * 2 * i) / sides;
            const x = Math.cos(angle) * size * 0.6;
            const y = Math.sin(angle) * size * 0.6;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
    }

    drawHelixGeometry(ctx, radius, hue, rotation, depth) {
        const strands = 3;
        const turns = 5;
        const helixHeight = radius * 0.7;

        for (let strand = 0; strand < strands; strand++) {
            ctx.beginPath();
            for (let t = 0; t <= turns * Math.PI; t += Math.PI / 24) {
                const phase = rotation * (strand + 1) + t;
                const x = Math.cos(phase) * radius * 0.32 * (1 + 0.12 * Math.sin(t * 2));
                const y = (t / (turns * Math.PI) - 0.5) * helixHeight;
                const wobble = Math.sin(phase * 1.6) * 8;
                const px = x + wobble;
                const py = y;
                if (t === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.strokeStyle = `hsla(${(hue + strand * 26) % 360}, 92%, 70%, ${0.36 + depth * 0.26})`;
            ctx.lineWidth = 1 + depth * 0.8;
            ctx.stroke();
        }
    }

    applyInheritedSignature(signature) {
        if (!signature || !signature.id) return;
        if (!this.signatureRegistry.has(signature.id)) {
            this.signatureRegistry.add(signature.id);
        }

        this.signatureHistory.push({ ...signature, appliedAt: performance.now() });

        switch (signature.id) {
            case 'moireBands':
                this.effects.moireStrength = Math.min(2.1, this.effects.moireStrength + signature.value);
                break;
            case 'chromaticBloom':
                this.effects.chromaBloom = Math.min(1.8, this.effects.chromaBloom + signature.value);
                this.targetHueShift += signature.hueShift;
                break;
            case 'glitchTrails':
                this.target.glitch += signature.value;
                this.target.speed += signature.value * 0.6;
                break;
            case 'particleMemory':
                this.effects.particleBloom = Math.min(1.5, this.effects.particleBloom + signature.value);
                this.spawnSignatureParticles(signature);
                break;
        }
    }

    generateDestructionSignature(destructionType) {
        const options = [
            { id: 'moireBands', label: 'Moiré Bands', value: 0.2 + Math.random() * 0.15, hueShift: 12 },
            { id: 'chromaticBloom', label: 'Chromatic Bloom', value: 0.24 + Math.random() * 0.18, hueShift: 28 },
            { id: 'glitchTrails', label: 'Glitch Trails', value: 0.28 + Math.random() * 0.16, hueShift: -18 },
            { id: 'particleMemory', label: 'Particle Memory', value: 0.32 + Math.random() * 0.22, hueShift: 36 }
        ];

        const unused = options.filter(option => !this.signatureRegistry.has(option.id));
        const choicePool = unused.length ? unused : options;
        const signature = choicePool[Math.floor(Math.random() * choicePool.length)];

        return {
            ...signature,
            sourceGeometry: this.config.geometry,
            sourceHue: this.config.hue,
            destructionType,
            timestamp: Date.now()
        };
    }

    triggerDestruction(destructionType) {
        this.updateCardState('destroyed');
        this.destructionActive = true;
        this.destructionPhase = 0;
        this.spawnDestructionParticles();

        this.targetHueShift += 18 + Math.random() * 24;
        this.target.glitch += 0.4;
        this.target.speed += 0.35;

        const signature = this.generateDestructionSignature(destructionType);
        console.log(`💥 Portal destruction on card ${this.cardIndex} emitted signature`, signature.id);
        return signature;
    }

    spawnDestructionParticles() {
        const count = 54;
        this.particles = [];
        for (let i = 0; i < count; i++) {
            this.particles.push({
                angle: (i / count) * Math.PI * 2 + Math.random() * 0.06,
                radius: 0,
                speed: 3 + Math.random() * 3.5,
                life: 1.1,
                decay: 0.018 + Math.random() * 0.02,
                energy: 0.65 + Math.random() * 0.4,
                hueShift: Math.random() * 80
            });
        }
    }

    spawnSignatureParticles(signature) {
        const extra = 24;
        for (let i = 0; i < extra; i++) {
            this.particles.push({
                angle: Math.random() * Math.PI * 2,
                radius: Math.random() * 40,
                speed: 1.2 + Math.random() * 1.8,
                life: 0.8,
                decay: 0.02 + Math.random() * 0.015,
                energy: 0.5 + Math.random() * 0.3,
                hueShift: signature.hueShift + Math.random() * 24
            });
        }
    }

    updateParticles() {
        if (!this.particles.length) return;
        this.particles = this.particles.filter(particle => {
            particle.radius += particle.speed * (1 + this.current.speed * 0.2);
            particle.speed *= 1.01;
            particle.life -= particle.decay * (1 + this.current.speed * 0.15);
            particle.energy = Math.max(0, particle.energy - 0.012);
            return particle.life > 0;
        });
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        this.particles = [];
    }
}

window.OrthogonalDepthProgression = OrthogonalDepthProgression;
