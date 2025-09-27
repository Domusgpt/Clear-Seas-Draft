/**
 * FINAL DEPTH PROGRESSION ENGINE
 * Professional avant-garde system for Clear Seas Solutions
 * Holistic congruent design with finely tuned reactions
 *
 * A Paul Phillips Manifestation
 */

class FinalDepthProgressionEngine {
    constructor() {
        // System Configuration
        this.config = {
            depthStates: ['far', 'mid-far', 'approaching', 'near', 'focused', 'exiting'],
            transitionDuration: 1200,
            destructionDuration: 800,
            handoffDelay: 100,
            sectionTransitionDuration: 2000,
            tiltSensitivity: 0.05,
            backgroundTiltMultiplier: 2.5
        };

        // State Management
        this.currentSection = 'technology';
        this.currentCardIndex = 0;
        this.isTransitioning = false;
        this.cards = new Map();
        this.visualizers = new Map();

        // Section Configurations
        this.sections = {
            technology: {
                visualizerTypes: ['quantum', 'holographic', 'faceted'],
                glitchEffects: ['scanlines', 'chromatic'],
                baseHue: 180,
                cardCount: 3
            },
            portfolio: {
                visualizerTypes: ['holographic', 'quantum', 'faceted'],
                glitchEffects: ['crt', 'chromatic'],
                baseHue: 280,
                cardCount: 4
            },
            research: {
                visualizerTypes: ['faceted', 'holographic', 'quantum'],
                glitchEffects: ['scanlines', 'crt'],
                baseHue: 60,
                cardCount: 3
            }
        };

        // Tilt Data
        this.tiltData = {
            x: 0,
            y: 0,
            targetX: 0,
            targetY: 0
        };

        // Initialize
        this.init();
    }

    async init() {
        console.log('🚀 Initializing Final Depth Progression Engine...');

        // Setup DOM references
        this.setupDOMReferences();

        // Initialize cards for current section
        this.initializeCards();

        // Setup background visualizer
        this.initializeBackgroundVisualizer();

        // Setup event listeners
        this.setupEventListeners();

        // Setup tilt system
        this.setupTiltSystem();

        // Start render loop
        this.startRenderLoop();

        // Initial card positioning
        this.updateCardDepths();

        console.log('✨ Final Depth Progression Engine initialized');
    }

    setupDOMReferences() {
        this.universe = document.getElementById('depthUniverse');
        this.bgContainer = document.getElementById('bgVisualizerContainer');
        this.bgCanvas = document.getElementById('bgVisualizer');
        this.transitionOverlay = document.getElementById('sectionTransition');
        this.hypercubeCanvas = document.getElementById('hypercubeCanvas');

        // Navigation
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.sectionBtn = document.getElementById('sectionBtn');

        // Indicators
        this.indicators = document.querySelectorAll('.indicator');
    }

    initializeCards() {
        const sectionElement = document.querySelector(`[data-section="${this.currentSection}"]`);
        const cardElements = sectionElement.querySelectorAll('.progression-card');

        cardElements.forEach((card, index) => {
            const cardId = card.dataset.cardId;

            // Store card reference
            this.cards.set(cardId, {
                element: card,
                index: index,
                depth: this.config.depthStates[index],
                visualizerType: card.dataset.vib34d,
                isDestroying: false,
                parameters: this.getParametersForDepth(this.config.depthStates[index])
            });

            // Initialize VIB34D visualizer
            this.initializeCardVisualizer(card, cardId);
        });
    }

    initializeCardVisualizer(card, cardId) {
        const canvas = card.querySelector('.vib34d-canvas');
        if (!canvas) return;

        const visualizerType = card.dataset.vib34d;
        const visualizer = new AdvancedVIB34DVisualizer(canvas, visualizerType);

        this.visualizers.set(cardId, visualizer);

        // Set initial parameters based on depth
        const cardData = this.cards.get(cardId);
        visualizer.updateParameters(cardData.parameters);
    }

    initializeBackgroundVisualizer() {
        if (!this.bgCanvas) return;

        const ctx = this.bgCanvas.getContext('2d');

        // Setup canvas sizing
        const resizeCanvas = () => {
            const rect = this.bgContainer.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;

            this.bgCanvas.width = rect.width * dpr;
            this.bgCanvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Create blown-up background visualizer
        this.backgroundVisualizer = new BlownUpBackgroundVisualizer(ctx, {
            scale: 3,
            opacity: 0.15,
            tiltMultiplier: this.config.backgroundTiltMultiplier
        });
    }

    setupEventListeners() {
        // Navigation buttons
        this.prevBtn?.addEventListener('click', () => this.navigatePrevious());
        this.nextBtn?.addEventListener('click', () => this.navigateNext());
        this.sectionBtn?.addEventListener('click', () => this.transitionToNextSection());

        // Card interactions
        this.cards.forEach((cardData, cardId) => {
            cardData.element.addEventListener('click', () => this.handleCardClick(cardId));
            cardData.element.addEventListener('mouseenter', () => this.handleCardHover(cardId, true));
            cardData.element.addEventListener('mouseleave', () => this.handleCardHover(cardId, false));
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                    this.navigatePrevious();
                    break;
                case 'ArrowRight':
                    this.navigateNext();
                    break;
                case 'ArrowUp':
                    this.transitionToNextSection();
                    break;
            }
        });

        // Mouse movement for tilt
        document.addEventListener('mousemove', (e) => {
            this.tiltData.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
            this.tiltData.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
        });
    }

    setupTiltSystem() {
        // Device orientation for mobile
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (e) => {
                this.tiltData.targetX = (e.gamma / 90) * this.config.tiltSensitivity;
                this.tiltData.targetY = (e.beta / 90) * this.config.tiltSensitivity;
            });
        }
    }

    navigateNext() {
        if (this.isTransitioning) return;

        const maxIndex = this.cards.size - 1;

        if (this.currentCardIndex < maxIndex) {
            // Destroy current focused card
            this.destroyCard(this.currentCardIndex);

            // Move to next card
            this.currentCardIndex++;

            // Update all card depths
            setTimeout(() => {
                this.updateCardDepths();
            }, this.config.handoffDelay);
        } else {
            // At end of section, transition to next
            this.transitionToNextSection();
        }
    }

    navigatePrevious() {
        if (this.isTransitioning) return;

        if (this.currentCardIndex > 0) {
            this.currentCardIndex--;
            this.updateCardDepths();
        }
    }

    destroyCard(index) {
        const cards = Array.from(this.cards.values());
        const card = cards[index];

        if (!card || card.isDestroying) return;

        card.isDestroying = true;
        card.element.classList.add('destroying');

        // Trigger destruction visualizer effect
        const visualizer = this.visualizers.get(card.element.dataset.cardId);
        if (visualizer) {
            visualizer.triggerDestruction();
        }

        // Jarring handoff to next card
        if (index < cards.length - 1) {
            const nextCard = cards[index + 1];

            setTimeout(() => {
                nextCard.element.classList.add('receiving-handoff');

                // Zero speed effect
                const nextVisualizer = this.visualizers.get(nextCard.element.dataset.cardId);
                if (nextVisualizer) {
                    nextVisualizer.setSpeed(0);

                    setTimeout(() => {
                        nextVisualizer.restoreSpeed();
                        nextCard.element.classList.remove('receiving-handoff');
                    }, 200);
                }
            }, this.config.handoffDelay);
        }

        // Remove card after animation
        setTimeout(() => {
            card.element.style.display = 'none';
        }, this.config.destructionDuration);
    }

    updateCardDepths() {
        const cards = Array.from(this.cards.values());

        cards.forEach((card, index) => {
            const relativeIndex = index - this.currentCardIndex;
            let depth;

            // Determine depth based on relative position
            if (relativeIndex < -1) {
                depth = 'far';
            } else if (relativeIndex === -1) {
                depth = 'mid-far';
            } else if (relativeIndex === 0) {
                depth = 'focused';
            } else if (relativeIndex === 1) {
                depth = 'near';
            } else if (relativeIndex === 2) {
                depth = 'approaching';
            } else {
                depth = 'far';
            }

            // Update card depth
            card.element.dataset.depth = depth;
            card.depth = depth;

            // Update visualizer parameters based on depth
            const parameters = this.getParametersForDepth(depth);
            const visualizer = this.visualizers.get(card.element.dataset.cardId);

            if (visualizer) {
                visualizer.updateParameters(parameters);
            }

            // Update card visibility
            card.element.style.display = card.isDestroying ? 'none' : 'block';
        });
    }

    getParametersForDepth(depth) {
        const parameterProfiles = {
            far: {
                density: 4,
                chaos: 0.05,
                speed: 0.2,
                morph: 0.1,
                brightness: 0.3,
                scale: 0.2,
                opacity: 0.1
            },
            'mid-far': {
                density: 8,
                chaos: 0.1,
                speed: 0.4,
                morph: 0.3,
                brightness: 0.5,
                scale: 0.4,
                opacity: 0.3
            },
            approaching: {
                density: 15,
                chaos: 0.2,
                speed: 0.6,
                morph: 0.6,
                brightness: 0.7,
                scale: 0.65,
                opacity: 0.6
            },
            near: {
                density: 25,
                chaos: 0.35,
                speed: 0.8,
                morph: 0.8,
                brightness: 0.9,
                scale: 0.9,
                opacity: 0.9
            },
            focused: {
                density: 35,
                chaos: 0.5,
                speed: 1,
                morph: 1,
                brightness: 1,
                scale: 1,
                opacity: 1
            },
            exiting: {
                density: 40,
                chaos: 0.8,
                speed: 1.5,
                morph: 1.5,
                brightness: 1.5,
                scale: 1.3,
                opacity: 0.3
            }
        };

        return parameterProfiles[depth] || parameterProfiles.far;
    }

    transitionToNextSection() {
        if (this.isTransitioning) return;

        this.isTransitioning = true;

        // Determine next section
        const sections = Object.keys(this.sections);
        const currentIndex = sections.indexOf(this.currentSection);
        const nextIndex = (currentIndex + 1) % sections.length;
        const nextSection = sections[nextIndex];

        // Trigger hypercube transition
        this.triggerHypercubeTransition(() => {
            // Change section
            this.changeSection(nextSection);

            // Reset state
            this.isTransitioning = false;
        });
    }

    triggerHypercubeTransition(callback) {
        this.transitionOverlay.style.opacity = '1';

        // Initialize hypercube animation
        const hypercube = new HypercubeTransition(this.hypercubeCanvas);
        hypercube.animate();

        // Change geometry and colors mid-transition
        setTimeout(() => {
            this.updateSectionTheme();

            if (callback) callback();
        }, this.config.sectionTransitionDuration / 2);

        // Hide overlay after transition
        setTimeout(() => {
            this.transitionOverlay.style.opacity = '0';
        }, this.config.sectionTransitionDuration);
    }

    changeSection(newSection) {
        // Hide current section
        const currentSectionElement = document.querySelector(`[data-section="${this.currentSection}"]`);
        if (currentSectionElement) {
            currentSectionElement.style.display = 'none';
        }

        // Update current section
        this.currentSection = newSection;
        this.currentCardIndex = 0;

        // Show new section
        const newSectionElement = document.querySelector(`[data-section="${newSection}"]`);
        if (newSectionElement) {
            newSectionElement.style.display = 'block';
        }

        // Clear old cards and visualizers
        this.cards.clear();
        this.visualizers.forEach(v => v.destroy());
        this.visualizers.clear();

        // Initialize new cards
        this.initializeCards();
        this.updateCardDepths();

        // Update indicators
        this.updateIndicators();
    }

    updateSectionTheme() {
        const sectionConfig = this.sections[this.currentSection];

        // Update CSS variables for section theme
        document.documentElement.style.setProperty('--section-hue', sectionConfig.baseHue);

        // Update background visualizer
        if (this.backgroundVisualizer) {
            this.backgroundVisualizer.updateTheme({
                hue: sectionConfig.baseHue,
                pattern: sectionConfig.visualizerTypes[0]
            });
        }
    }

    updateIndicators() {
        this.indicators.forEach(indicator => {
            const isActive = indicator.dataset.section === this.currentSection;
            indicator.classList.toggle('active', isActive);
        });
    }

    handleCardClick(cardId) {
        const card = this.cards.get(cardId);
        if (!card || card.depth !== 'focused') return;

        // Trigger advanced interaction
        this.triggerCardInteraction(cardId, 'click');
    }

    handleCardHover(cardId, isEntering) {
        const card = this.cards.get(cardId);
        if (!card) return;

        if (isEntering) {
            // Enhance highlight effect
            card.element.querySelector('.card-layer-highlight').style.opacity = '0.5';
            card.element.querySelector('.card-layer-highlight').style.transform = 'translateX(0)';
        } else {
            // Reset highlight
            card.element.querySelector('.card-layer-highlight').style.opacity = '0';
            card.element.querySelector('.card-layer-highlight').style.transform = 'translateX(-100%)';
        }
    }

    triggerCardInteraction(cardId, type) {
        const visualizer = this.visualizers.get(cardId);
        if (!visualizer) return;

        switch(type) {
            case 'click':
                visualizer.triggerBurst();
                break;
            case 'hover':
                visualizer.enhanceParameters({
                    chaos: 0.1,
                    morph: 0.2,
                    brightness: 0.2
                });
                break;
        }
    }

    startRenderLoop() {
        const render = () => {
            // Update tilt
            this.updateTilt();

            // Update background visualizer
            if (this.backgroundVisualizer) {
                this.backgroundVisualizer.render(this.tiltData);
            }

            // Update card visualizers
            this.visualizers.forEach(visualizer => {
                visualizer.render();
            });

            requestAnimationFrame(render);
        };

        render();
    }

    updateTilt() {
        // Smooth tilt interpolation
        const lerpFactor = 0.1;

        this.tiltData.x += (this.tiltData.targetX - this.tiltData.x) * lerpFactor;
        this.tiltData.y += (this.tiltData.targetY - this.tiltData.y) * lerpFactor;

        // Apply tilt to background
        if (this.bgContainer) {
            const tiltX = this.tiltData.x * this.config.backgroundTiltMultiplier;
            const tiltY = this.tiltData.y * this.config.backgroundTiltMultiplier;

            this.bgContainer.style.transform = `rotateX(${tiltY}deg) rotateY(${tiltX}deg)`;
        }
    }
}

/**
 * ADVANCED VIB34D VISUALIZER
 * Handles parameter-based visualization for each card
 */
class AdvancedVIB34DVisualizer {
    constructor(canvas, type) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.type = type;

        this.parameters = {
            density: 15,
            chaos: 0.2,
            speed: 0.5,
            morph: 0.5,
            brightness: 0.7,
            scale: 1,
            opacity: 1
        };

        this.time = 0;
        this.isDestroying = false;
        this.setupCanvas();
    }

    setupCanvas() {
        const resizeCanvas = () => {
            const rect = this.canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;

            this.canvas.width = rect.width * dpr;
            this.canvas.height = rect.height * dpr;
            this.ctx.scale(dpr, dpr);

            this.width = rect.width;
            this.height = rect.height;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }

    updateParameters(newParams) {
        Object.assign(this.parameters, newParams);
    }

    enhanceParameters(enhancements) {
        Object.keys(enhancements).forEach(key => {
            this.parameters[key] = Math.min(1, this.parameters[key] + enhancements[key]);
        });
    }

    setSpeed(speed) {
        this.parameters.speed = speed;
    }

    restoreSpeed() {
        this.parameters.speed = 1;
    }

    triggerBurst() {
        // Temporary parameter burst
        const originalParams = { ...this.parameters };

        this.parameters.chaos = Math.min(1, this.parameters.chaos + 0.5);
        this.parameters.morph = Math.min(2, this.parameters.morph + 0.5);
        this.parameters.brightness = Math.min(1.5, this.parameters.brightness + 0.3);

        setTimeout(() => {
            this.parameters = originalParams;
        }, 500);
    }

    triggerDestruction() {
        this.isDestroying = true;

        // Escalating chaos
        const destructionInterval = setInterval(() => {
            this.parameters.chaos = Math.min(1, this.parameters.chaos + 0.1);
            this.parameters.morph = Math.min(3, this.parameters.morph + 0.2);
            this.parameters.scale = Math.max(0, this.parameters.scale - 0.1);

            if (this.parameters.scale <= 0) {
                clearInterval(destructionInterval);
            }
        }, 50);
    }

    render() {
        if (!this.ctx) return;

        this.time += 0.016 * this.parameters.speed;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Set global alpha based on opacity parameter
        this.ctx.globalAlpha = this.parameters.opacity;

        // Render based on type
        switch(this.type) {
            case 'quantum':
                this.renderQuantum();
                break;
            case 'holographic':
                this.renderHolographic();
                break;
            case 'faceted':
                this.renderFaceted();
                break;
        }

        this.ctx.globalAlpha = 1;
    }

    renderQuantum() {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const points = Math.floor(this.parameters.density);
        const radius = Math.min(this.width, this.height) * 0.3 * this.parameters.scale;

        this.ctx.strokeStyle = `rgba(0, 212, 255, ${this.parameters.brightness})`;
        this.ctx.lineWidth = 2;

        for (let i = 0; i < points; i++) {
            const angle = (i / points) * Math.PI * 2 + this.time;
            const chaosOffset = (Math.random() - 0.5) * this.parameters.chaos * 50;
            const morphRadius = radius * (1 + Math.sin(this.time * this.parameters.morph + i) * 0.3);

            const x = centerX + Math.cos(angle) * morphRadius + chaosOffset;
            const y = centerY + Math.sin(angle) * morphRadius + chaosOffset;

            this.ctx.beginPath();
            this.ctx.arc(x, y, 3, 0, Math.PI * 2);
            this.ctx.stroke();

            // Connections
            if (i > 0) {
                const prevAngle = ((i - 1) / points) * Math.PI * 2 + this.time;
                const prevX = centerX + Math.cos(prevAngle) * morphRadius;
                const prevY = centerY + Math.sin(prevAngle) * morphRadius;

                this.ctx.beginPath();
                this.ctx.moveTo(prevX, prevY);
                this.ctx.lineTo(x, y);
                this.ctx.stroke();
            }
        }
    }

    renderHolographic() {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const layers = Math.floor(this.parameters.density / 5);

        for (let layer = 0; layer < layers; layer++) {
            const layerProgress = layer / layers;
            const radius = (Math.min(this.width, this.height) * 0.35) *
                          (1 - layerProgress * 0.5) * this.parameters.scale;

            this.ctx.strokeStyle = `hsla(${330 + layer * 20}, 80%, 60%, ${this.parameters.brightness * (1 - layerProgress)})`;
            this.ctx.lineWidth = 2 - layerProgress;

            this.ctx.save();
            this.ctx.translate(centerX, centerY);
            this.ctx.rotate(this.time * (1 - layerProgress * 0.5) + layer);

            const sides = 6;
            this.ctx.beginPath();

            for (let i = 0; i <= sides; i++) {
                const angle = (i / sides) * Math.PI * 2;
                const chaosOffset = (Math.random() - 0.5) * this.parameters.chaos * 20;
                const morphFactor = 1 + Math.sin(this.time * this.parameters.morph) * 0.2;

                const x = Math.cos(angle) * radius * morphFactor + chaosOffset;
                const y = Math.sin(angle) * radius * morphFactor + chaosOffset;

                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }

            this.ctx.stroke();
            this.ctx.restore();
        }
    }

    renderFaceted() {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const facets = Math.floor(this.parameters.density / 2);
        const baseRadius = Math.min(this.width, this.height) * 0.25 * this.parameters.scale;

        for (let i = 0; i < facets; i++) {
            const angle = (i / facets) * Math.PI * 2 + this.time * 0.5;
            const nextAngle = ((i + 1) / facets) * Math.PI * 2 + this.time * 0.5;

            const chaosOffset = (Math.random() - 0.5) * this.parameters.chaos * 30;
            const morphRadius = baseRadius * (1 + Math.sin(this.time * this.parameters.morph + i) * 0.3);

            this.ctx.fillStyle = `rgba(200, 100, 255, ${this.parameters.brightness * 0.2})`;
            this.ctx.strokeStyle = `rgba(200, 100, 255, ${this.parameters.brightness})`;
            this.ctx.lineWidth = 1.5;

            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.lineTo(
                centerX + Math.cos(angle) * morphRadius + chaosOffset,
                centerY + Math.sin(angle) * morphRadius + chaosOffset
            );
            this.ctx.lineTo(
                centerX + Math.cos(nextAngle) * morphRadius + chaosOffset,
                centerY + Math.sin(nextAngle) * morphRadius + chaosOffset
            );
            this.ctx.closePath();

            if (i % 2 === 0 || this.isDestroying) {
                this.ctx.fill();
            }
            this.ctx.stroke();
        }
    }

    destroy() {
        // Clean up
        this.ctx = null;
        this.canvas = null;
    }
}

/**
 * BLOWN-UP BACKGROUND VISUALIZER
 * Creates oversized background effects with tilt
 */
class BlownUpBackgroundVisualizer {
    constructor(ctx, config) {
        this.ctx = ctx;
        this.config = config;
        this.time = 0;
        this.pattern = 'quantum';
    }

    updateTheme(theme) {
        this.pattern = theme.pattern;
        // Update other theme properties
    }

    render(tiltData) {
        if (!this.ctx) return;

        this.time += 0.01;

        const width = this.ctx.canvas.width / (window.devicePixelRatio || 1);
        const height = this.ctx.canvas.height / (window.devicePixelRatio || 1);

        this.ctx.clearRect(0, 0, width, height);
        this.ctx.globalAlpha = this.config.opacity;

        // Apply tilt transformation
        this.ctx.save();
        this.ctx.translate(width / 2, height / 2);
        this.ctx.rotate(tiltData.x * 0.05);
        this.ctx.translate(-width / 2, -height / 2);

        // Render oversized pattern
        this.renderPattern(width, height);

        this.ctx.restore();
        this.ctx.globalAlpha = 1;
    }

    renderPattern(width, height) {
        const scale = this.config.scale;
        const centerX = width / 2;
        const centerY = height / 2;

        // Create oversized grid pattern
        const gridSize = 100 * scale;
        const gridCount = 20;

        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;

        for (let i = -gridCount; i <= gridCount; i++) {
            for (let j = -gridCount; j <= gridCount; j++) {
                const x = centerX + i * gridSize + Math.sin(this.time + i) * 20;
                const y = centerY + j * gridSize + Math.cos(this.time + j) * 20;

                this.ctx.beginPath();
                this.ctx.rect(x - gridSize / 2, y - gridSize / 2, gridSize, gridSize);
                this.ctx.stroke();

                // Add dots at intersections
                if (i % 2 === 0 && j % 2 === 0) {
                    this.ctx.fillStyle = 'rgba(255, 0, 255, 0.2)';
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, 3, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
        }
    }
}

/**
 * HYPERCUBE TRANSITION
 * Handles section transitions with 4D rotation
 */
class HypercubeTransition {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.setupCanvas();
    }

    setupCanvas() {
        this.canvas.width = 400;
        this.canvas.height = 400;
    }

    animate() {
        const duration = 2000;
        const startTime = Date.now();

        const render = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            this.renderHypercube(progress);

            if (progress < 1) {
                requestAnimationFrame(render);
            }
        };

        render();
    }

    renderHypercube(progress) {
        const ctx = this.ctx;
        const size = 200;
        const centerX = 200;
        const centerY = 200;

        ctx.clearRect(0, 0, 400, 400);

        // 4D rotation angles
        const angleX = progress * Math.PI * 2;
        const angleY = progress * Math.PI * 2;
        const angleZ = progress * Math.PI * 2;
        const angleW = progress * Math.PI;

        // Scale based on progress
        const scale = Math.sin(progress * Math.PI) * 2;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(scale, scale);

        // Draw hypercube edges
        ctx.strokeStyle = `rgba(0, 255, 255, ${Math.sin(progress * Math.PI)})`;
        ctx.lineWidth = 2;

        // Simplified hypercube projection
        for (let i = 0; i < 8; i++) {
            const x = (i & 1 ? 1 : -1) * size / 2;
            const y = (i & 2 ? 1 : -1) * size / 2;
            const z = (i & 4 ? 1 : -1) * size / 2;

            // Apply rotation
            const rotatedX = x * Math.cos(angleX) - y * Math.sin(angleX);
            const rotatedY = x * Math.sin(angleX) + y * Math.cos(angleX);
            const rotatedZ = z * Math.cos(angleY) + rotatedY * Math.sin(angleY);

            // Project to 2D
            const projectedX = rotatedX * Math.cos(angleZ) - rotatedZ * Math.sin(angleZ);
            const projectedY = rotatedY;

            if (i === 0) {
                ctx.moveTo(projectedX, projectedY);
            } else {
                ctx.lineTo(projectedX, projectedY);
            }
        }

        ctx.stroke();
        ctx.restore();
    }
}

// Initialize the engine when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.finalDepthEngine = new FinalDepthProgressionEngine();
});