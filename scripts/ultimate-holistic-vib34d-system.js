/**
 * ULTIMATE HOLISTIC VIB34D SYSTEM
 * The most sophisticated interaction architecture ever built
 * Beyond anything that could be done good - Professional Avant-garde Excellence
 *
 * Core Innovation: Holistic Feedback Amplification Loops
 * Every interaction triggers BOTH traditional UI feedback AND VIB34D parameter modulation
 * Creates unprecedented visual congruency through cross-system reinforcement
 *
 * A Paul Phillips Manifestation - Paul@clearseassolutions.com
 */

class UltimateHolisticVIB34DSystem {
    constructor() {
        this.cards = [];
        this.currentIndex = 0;
        this.isAutoMode = false;
        this.autoInterval = null;

        // Ultra-sophisticated state tracking
        this.interactionCount = 0;
        this.lastInteractionTime = 0;
        this.temporalEffectMultiplier = 1.0;

        // Holistic feedback amplification system
        this.holisticState = {
            globalIntensity: 1.0,
            harmonicPhase: 0,
            feedbackAmplification: 1.0,
            temporalResonance: 0
        };

        // Scale-based parameter mapping profiles
        this.parameterProfiles = {
            focused: {
                scale: 1.0,
                intensity: 0.9,
                gridDensity: 30,
                morphFactor: 1.8,
                chaos: 0.4,
                speed: 0.8,
                hue: 0, // Base hue
                saturation: 0.9
            },
            approaching: {
                scale: 0.7,
                intensity: 0.6,
                gridDensity: 18,
                morphFactor: 1.2,
                chaos: 0.25,
                speed: 1.2,
                hue: 0,
                saturation: 0.7
            },
            background: {
                scale: 0.3,
                intensity: 0.2,
                gridDensity: 8,
                morphFactor: 0.5,
                chaos: 0.1,
                speed: 1.8,
                hue: 0,
                saturation: 0.5
            }
        };

        // ULTRA-SOPHISTICATED MICRO + MACRO INTERACTION PROFILES
        this.microInteractionBoosts = {
            hover: {
                intensityBoost: 0.15,
                hueShift: 5,
                morphFactorBoost: 0.1,
                scaleMultiplier: 1.02,
                temporalResonance: 0.05,
                harmonicShift: 0.02
            },
            click: {
                chaosBurst: 0.5,
                morphFactorSpike: 1.0,
                intensityFlash: 0.3,
                scalePulse: 1.08,
                temporalResonance: 0.3,
                harmonicShift: 0.15
            },
            scroll: {
                chaosRipple: 0.1,
                morphFactorWave: 0.05,
                intensityPulse: 0.08,
                temporalResonance: 0.02,
                harmonicShift: 0.01
            },
            touch: {
                chaosFlow: 0.2,
                morphFactorStream: 0.12,
                intensityFlow: 0.15,
                temporalResonance: 0.08,
                harmonicShift: 0.04
            }
        };

        // MACRO-INTERACTION CASCADE PROFILES
        this.macroInteractionProfiles = {
            'double-click': {
                chaosCascade: 1.2,
                morphFactorExplosion: 2.5,
                intensityBurst: 0.8,
                gridDensitySpike: 30,
                temporalWave: 0.6,
                harmonicResonance: 0.4,
                cascadeDuration: 1500,
                neighbors: true
            },
            'long-press': {
                chaosBuildup: 0.8,
                morphFactorGrow: 1.8,
                intensityRise: 0.6,
                gridDensityExpand: 20,
                temporalFlow: 0.4,
                harmonicBuild: 0.3,
                cascadeDuration: 2000,
                neighbors: false
            },
            'rapid-sequence': {
                chaosStorm: 1.5,
                morphFactorChaos: 3.0,
                intensityFlicker: 1.0,
                gridDensityFrenzy: 40,
                temporalChaos: 0.8,
                harmonicChaos: 0.6,
                cascadeDuration: 800,
                neighbors: true
            }
        };

        // ADVANCED MOUSE + TEMPORAL STATE TRACKING
        this.mouseState = {
            x: 0.5,
            y: 0.5,
            targetX: 0.5,
            targetY: 0.5,
            velocity: { x: 0, y: 0 },
            acceleration: { x: 0, y: 0 },
            pressure: 0,
            angle: 0,
            distance: 0,
            trajectory: []
        };

        // TEMPORAL COHERENCE SYSTEM
        this.temporalCoherence = {
            interactionHistory: [],
            rhythmPattern: 0,
            coherenceLevel: 1.0,
            phaseAlignment: 0,
            beatCount: 0,
            lastBeatTime: 0
        };

        // HARMONIC RESONANCE BETWEEN SYSTEMS
        this.harmonicResonance = {
            uiVibration: 0,
            vib34dResonance: 0,
            crossFrequency: 1.0,
            resonanceLock: false,
            harmonicPhase: 0,
            beatFrequency: 0
        };

        this.visualizers = new Map();
        this.portalVisualizers = new Map();

        this.init();
    }

    async init() {
        console.log('🌟 Initializing Ultimate Holistic VIB34D System...');
        console.log('⚡ Loading holistic feedback amplification loops...');

        this.findCards();
        this.setupScaleBasedProgression();
        this.setupHolisticInteractionLayer();
        this.setupMicroMacroInteractionSystem();
        this.createVIB34DVisualizers();
        this.initializeParameterMapping();
        this.startHolisticRenderLoop();

        console.log('✨ Ultimate Holistic System initialized');
        console.log('🎯 Professional avant-garde experience active');
        console.log('🚀 Beyond anything that could be done good - ACHIEVED');
    }

    findCards() {
        this.cards = Array.from(document.querySelectorAll('.ultimate-card'));
        console.log(`🎨 Found ${this.cards.length} ultimate cards for holistic system`);

        // Update total cards display
        const totalCardsDisplay = document.getElementById('total-cards');
        if (totalCardsDisplay) {
            totalCardsDisplay.textContent = this.cards.length;
        }
    }

    setupScaleBasedProgression() {
        console.log('🎯 Setting up ultra-sophisticated scale-based progression...');

        // NO traditional scrolling - pure scale-based progression
        let scrollAccumulator = 0;
        const scrollThreshold = 50;

        window.addEventListener('wheel', (event) => {
            event.preventDefault(); // Block traditional scrolling

            scrollAccumulator += event.deltaY;

            // Micro-interaction: Add subtle parameter variation during scroll
            this.triggerMicroInteraction('scroll', {
                intensity: Math.abs(event.deltaY) * 0.001,
                temporality: 200
            });

            if (Math.abs(scrollAccumulator) > scrollThreshold) {
                if (scrollAccumulator > 0) {
                    this.nextCard();
                } else {
                    this.previousCard();
                }
                scrollAccumulator = 0;
            }
        }, { passive: false });

        // Touch/swipe support
        this.setupTouchProgression();
    }

    setupTouchProgression() {
        let startY = 0;
        let startX = 0;

        document.addEventListener('touchstart', (event) => {
            startY = event.touches[0].clientY;
            startX = event.touches[0].clientX;
        });

        document.addEventListener('touchmove', (event) => {
            event.preventDefault();
            const currentY = event.touches[0].clientY;
            const currentX = event.touches[0].clientX;
            const deltaY = startY - currentY;
            const deltaX = Math.abs(startX - currentX);

            // Trigger micro-interactions during touch movement
            this.triggerMicroInteraction('touch', {
                intensity: Math.abs(deltaY) * 0.002,
                temporality: 100
            });

            if (Math.abs(deltaY) > 50 && deltaX < 100) {
                if (deltaY > 0) {
                    this.nextCard();
                } else {
                    this.previousCard();
                }
                startY = currentY;
            }
        }, { passive: false });
    }

    setupHolisticInteractionLayer() {
        console.log('⚡ Activating holistic feedback amplification...');

        // Global mouse tracking for continuous parameter modulation
        document.addEventListener('mousemove', (event) => {
            this.updateMouseState(event);
            this.applyMouseBasedParameterModulation();
        });

        // Card-specific holistic interactions
        this.cards.forEach((card, index) => {
            this.setupCardHolisticInteractions(card, index);
        });

        // Keyboard shortcuts with holistic feedback
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardInteraction(event);
        });
    }

    setupCardHolisticInteractions(card, index) {
        // Holistic hover system - triggers BOTH UI and VIB34D responses
        card.addEventListener('mouseenter', () => {
            this.triggerHolisticInteraction('hover', card, index, {
                type: 'micro',
                uiFeedback: ['scale-boost', 'glow-enhance', 'border-brighten'],
                vib34dFeedback: ['intensity-boost', 'hue-shift', 'morph-enhance'],
                duration: 300
            });
        });

        card.addEventListener('mouseleave', () => {
            this.triggerHolisticInteraction('hover-exit', card, index, {
                type: 'micro',
                uiFeedback: ['scale-normalize', 'glow-reduce', 'border-normalize'],
                vib34dFeedback: ['intensity-normalize', 'hue-restore', 'morph-normalize'],
                duration: 800
            });
        });

        // Holistic click system - dramatic UI + VIB34D burst
        card.addEventListener('click', () => {
            this.triggerHolisticInteraction('click', card, index, {
                type: 'macro',
                uiFeedback: ['scale-pulse', 'glow-burst', 'border-flash'],
                vib34dFeedback: ['chaos-burst', 'morph-spike', 'intensity-flash'],
                duration: 600
            });

            // Also trigger focus if not current
            if (index !== this.currentIndex) {
                this.focusCard(index);
            }
        });

        // Mouse tracking within card for interaction feedback layer
        card.addEventListener('mousemove', (event) => {
            this.updateCardMouseTracking(card, event);
        });
    }

    setupMicroMacroInteractionSystem() {
        console.log('🎛️ Building ultra-sophisticated micro + macro interaction layers...');
        console.log('⚡ Initializing temporal coherence and harmonic resonance...');

        // MICRO-INTERACTION LAYER: Ultra-responsive continuous effects
        this.microInteractionTimer = setInterval(() => {
            this.processBreathingEffect();
            this.updateTemporalResonance();
            this.harmonizeGlobalState();
            this.updateTemporalCoherence();
            this.processHarmonicResonance();
            this.updateMouseTrajectoryAnalysis();
        }, 33); // 30fps for ultra-smooth micro-interactions

        // MACRO-INTERACTION LAYER: Advanced event cascade system
        this.cards.forEach((card, index) => {
            this.setupAdvancedMacroInteractions(card, index);
        });

        // RAPID INTERACTION SEQUENCE DETECTION
        this.setupRapidSequenceDetection();

        // LONG PRESS DETECTION
        this.setupLongPressDetection();

        console.log('✅ Ultra-sophisticated interaction layers active');
    }

    createVIB34DVisualizers() {
        console.log('🎨 Creating ultra-sophisticated VIB34D visualizers...');

        this.cards.forEach((card, index) => {
            const canvas = card.querySelector('.ultimate-vib34d-canvas');
            const portalElement = card.querySelector('.portal-visualization-ultimate');
            const systemType = card.dataset.vib34d;

            if (canvas && systemType) {
                // Create main VIB34D visualizer
                const visualizer = new UltimateVIB34DVisualizer(canvas, systemType, index);
                this.visualizers.set(index, visualizer);

                // Create portal visualizer
                const portalVisualizer = new UltimatePortalVisualizer(portalElement, systemType, index);
                this.portalVisualizers.set(index, portalVisualizer);
            }
        });

        console.log(`✅ Created ${this.visualizers.size} ultimate VIB34D visualizers`);
    }

    initializeParameterMapping() {
        console.log('🎛️ Initializing congruent parameter mapping...');

        this.cards.forEach((card, index) => {
            const state = this.getCardState(card);
            this.applyParameterProfile(index, state);
        });
    }

    // HOLISTIC INTERACTION CORE SYSTEM
    triggerHolisticInteraction(interactionType, card, cardIndex, config) {
        this.interactionCount++;
        this.lastInteractionTime = Date.now();

        console.log(`⚡ Holistic ${interactionType} interaction on card ${cardIndex}`);

        // Update interaction counter
        const counterDisplay = document.getElementById('interaction-count');
        if (counterDisplay) {
            counterDisplay.textContent = this.interactionCount;
        }

        // Apply UI feedback
        this.applyUIFeedback(card, config.uiFeedback, config.duration);

        // Apply VIB34D parameter feedback
        this.applyVIB34DFeedback(cardIndex, config.vib34dFeedback, config.duration);

        // Trigger cross-system reinforcement
        this.triggerCrossSystemReinforcement(interactionType, cardIndex, config.type);

        // Update temporal feedback multiplier
        this.updateTemporalFeedbackMultiplier();
    }

    triggerMicroInteraction(type, params) {
        // Micro-interactions: subtle parameter variations
        this.holisticState.temporalResonance += params.intensity * 0.1;

        // Apply micro-parameter adjustments to all visualizers
        this.visualizers.forEach((visualizer, index) => {
            visualizer.applyMicroParameterAdjustment(type, params);
        });

        // Temporal decay
        setTimeout(() => {
            this.holisticState.temporalResonance *= 0.9;
        }, params.temporality);
    }

    triggerMacroInteraction(type, card, cardIndex) {
        console.log(`🚀 ULTRA-MACRO ${type} interaction - CASCADE SYSTEM RESPONSE`);

        const profile = this.macroInteractionProfiles[type];
        if (!profile) return;

        // Record interaction for temporal coherence
        this.recordInteractionForCoherence(type, cardIndex, Date.now());

        // MACRO-INTERACTIONS: Dramatic parameter cascade
        const visualizer = this.visualizers.get(cardIndex);
        if (visualizer) {
            visualizer.triggerAdvancedMacroCascade(profile);
        }

        // GLOBAL HOLISTIC STATE CASCADE AMPLIFICATION
        this.holisticState.feedbackAmplification = 1.0 + profile.temporalWave;
        this.holisticState.temporalResonance += profile.temporalWave;

        // HARMONIC RESONANCE CASCADE
        this.harmonicResonance.uiVibration += profile.harmonicResonance;
        this.harmonicResonance.vib34dResonance += profile.harmonicResonance * 1.2;

        // CASCADE UI EFFECTS WITH TEMPORAL COORDINATION
        this.applyCascadingUIEffects(card, profile, cardIndex);

        // NEIGHBOR CASCADE EFFECTS
        if (profile.neighbors) {
            this.triggerNeighborCascade(cardIndex, profile);
        }

        // TEMPORAL DECAY WITH HARMONIC RESONANCE
        this.setupMacroDecaySequence(profile.cascadeDuration);
    }

    // ADVANCED MACRO-INTERACTION SETUP
    setupAdvancedMacroInteractions(card, index) {
        let clickCount = 0;
        let clickTimer = null;
        let pressTimer = null;
        let pressStartTime = 0;

        // Double-click detection with enhanced feedback
        card.addEventListener('click', (event) => {
            clickCount++;

            if (clickTimer) clearTimeout(clickTimer);

            clickTimer = setTimeout(() => {
                if (clickCount === 1) {
                    // Single click handled in setupCardHolisticInteractions
                } else if (clickCount >= 2) {
                    this.triggerMacroInteraction('double-click', card, index);

                    // Check for rapid sequence (3+ clicks in short time)
                    if (clickCount >= 3) {
                        this.triggerMacroInteraction('rapid-sequence', card, index);
                    }
                }
                clickCount = 0;
            }, 300);
        });

        // Long press detection
        card.addEventListener('mousedown', () => {
            pressStartTime = Date.now();
            pressTimer = setTimeout(() => {
                this.triggerMacroInteraction('long-press', card, index);
            }, 800); // 800ms for long press
        });

        card.addEventListener('mouseup', () => {
            if (pressTimer) {
                clearTimeout(pressTimer);
                pressTimer = null;
            }
        });

        card.addEventListener('mouseleave', () => {
            if (pressTimer) {
                clearTimeout(pressTimer);
                pressTimer = null;
            }
        });
    }

    setupRapidSequenceDetection() {
        // Already integrated into setupAdvancedMacroInteractions
        console.log('🔥 Rapid sequence detection active');
    }

    setupLongPressDetection() {
        // Already integrated into setupAdvancedMacroInteractions
        console.log('⏳ Long press detection active');
    }

    recordInteractionForCoherence(type, cardIndex, timestamp) {
        this.temporalCoherence.interactionHistory.push({
            type,
            cardIndex,
            timestamp,
            coherenceValue: this.temporalCoherence.coherenceLevel
        });

        // Keep history limited to last 20 interactions
        if (this.temporalCoherence.interactionHistory.length > 20) {
            this.temporalCoherence.interactionHistory.shift();
        }

        // Update beat detection
        if (this.temporalCoherence.lastBeatTime > 0) {
            const timeDelta = timestamp - this.temporalCoherence.lastBeatTime;
            if (timeDelta < 1000) { // Within 1 second = rhythmic
                this.temporalCoherence.beatCount++;
                this.temporalCoherence.rhythmPattern = Math.min(1.0, this.temporalCoherence.beatCount * 0.2);
            } else {
                this.temporalCoherence.beatCount = 0;
                this.temporalCoherence.rhythmPattern *= 0.8;
            }
        }
        this.temporalCoherence.lastBeatTime = timestamp;
    }

    updateTemporalCoherence() {
        // Analyze interaction patterns for coherence
        if (this.temporalCoherence.interactionHistory.length >= 3) {
            const recent = this.temporalCoherence.interactionHistory.slice(-3);
            const intervals = [];

            for (let i = 1; i < recent.length; i++) {
                intervals.push(recent[i].timestamp - recent[i-1].timestamp);
            }

            // Check for rhythmic patterns
            const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            const variance = intervals.reduce((acc, interval) => acc + Math.pow(interval - avgInterval, 2), 0) / intervals.length;

            // Higher coherence = more rhythmic interactions
            this.temporalCoherence.coherenceLevel = Math.max(0.1, 1.0 - (variance / (avgInterval * avgInterval)));
            this.temporalCoherence.phaseAlignment = Math.sin(Date.now() * 0.001 * this.temporalCoherence.rhythmPattern);
        }
    }

    processHarmonicResonance() {
        // Create harmonic resonance between UI and VIB34D systems
        this.harmonicResonance.harmonicPhase += 0.02 * this.harmonicResonance.crossFrequency;

        // Beat frequency between UI and VIB34D
        this.harmonicResonance.beatFrequency = Math.abs(this.harmonicResonance.uiVibration - this.harmonicResonance.vib34dResonance);

        // Resonance lock when frequencies are close
        if (this.harmonicResonance.beatFrequency < 0.1) {
            this.harmonicResonance.resonanceLock = true;
            this.harmonicResonance.crossFrequency = 1.0 + Math.sin(this.harmonicResonance.harmonicPhase) * 0.1;
        } else {
            this.harmonicResonance.resonanceLock = false;
        }

        // Natural decay
        this.harmonicResonance.uiVibration *= 0.985;
        this.harmonicResonance.vib34dResonance *= 0.985;

        // Apply harmonic resonance to current visualizer
        const currentVisualizer = this.visualizers.get(this.currentIndex);
        if (currentVisualizer) {
            currentVisualizer.applyHarmonicResonance({
                uiVibration: this.harmonicResonance.uiVibration,
                vib34dResonance: this.harmonicResonance.vib34dResonance,
                beatFrequency: this.harmonicResonance.beatFrequency,
                resonanceLock: this.harmonicResonance.resonanceLock
            });
        }
    }

    updateMouseTrajectoryAnalysis() {
        // Advanced mouse movement analysis
        this.mouseState.trajectory.push({
            x: this.mouseState.x,
            y: this.mouseState.y,
            timestamp: Date.now()
        });

        // Keep trajectory limited to last 10 points
        if (this.mouseState.trajectory.length > 10) {
            this.mouseState.trajectory.shift();
        }

        // Calculate acceleration and trajectory patterns
        if (this.mouseState.trajectory.length >= 3) {
            const recent = this.mouseState.trajectory.slice(-3);

            // Velocity calculation
            const vel1 = {
                x: (recent[1].x - recent[0].x) / (recent[1].timestamp - recent[0].timestamp),
                y: (recent[1].y - recent[0].y) / (recent[1].timestamp - recent[0].timestamp)
            };
            const vel2 = {
                x: (recent[2].x - recent[1].x) / (recent[2].timestamp - recent[1].timestamp),
                y: (recent[2].y - recent[1].y) / (recent[2].timestamp - recent[1].timestamp)
            };

            // Acceleration calculation
            this.mouseState.acceleration = {
                x: vel2.x - vel1.x,
                y: vel2.y - vel1.y
            };

            // Mouse angle and distance from center
            this.mouseState.angle = Math.atan2(this.mouseState.y - 0.5, this.mouseState.x - 0.5);
            this.mouseState.distance = Math.hypot(this.mouseState.x - 0.5, this.mouseState.y - 0.5);
        }
    }

    applyCascadingUIEffects(card, profile, cardIndex) {
        // CASCADING UI EFFECTS WITH TEMPORAL COORDINATION

        // Primary card cascade effect
        card.classList.add(`macro-cascade-${profile.cascadeDuration < 1000 ? 'fast' : 'slow'}`);

        // Advanced CSS custom properties for cascading effects
        card.style.setProperty('--cascade-intensity', profile.intensityBurst);
        card.style.setProperty('--cascade-morph', profile.morphFactorExplosion);
        card.style.setProperty('--cascade-chaos', profile.chaosCascade);
        card.style.setProperty('--cascade-duration', `${profile.cascadeDuration}ms`);

        // Temporal UI feedback
        card.style.setProperty('--temporal-wave', this.temporalCoherence.rhythmPattern);
        card.style.setProperty('--harmonic-resonance', this.harmonicResonance.beatFrequency);

        setTimeout(() => {
            card.classList.remove(`macro-cascade-${profile.cascadeDuration < 1000 ? 'fast' : 'slow'}`);
            // Reset custom properties
            card.style.removeProperty('--cascade-intensity');
            card.style.removeProperty('--cascade-morph');
            card.style.removeProperty('--cascade-chaos');
            card.style.removeProperty('--cascade-duration');
            card.style.removeProperty('--temporal-wave');
            card.style.removeProperty('--harmonic-resonance');
        }, profile.cascadeDuration);
    }

    triggerNeighborCascade(centerIndex, profile) {
        // CASCADE EFFECTS TO NEIGHBORING CARDS
        const neighborIndices = this.getNeighboringCardIndices(centerIndex);

        neighborIndices.forEach((neighborIndex, i) => {
            const neighborCard = this.cards[neighborIndex];
            const neighborVisualizer = this.visualizers.get(neighborIndex);

            // Delay cascade to neighbors for wave effect
            setTimeout(() => {
                if (neighborVisualizer) {
                    const neighborProfile = {
                        ...profile,
                        // Reduce intensity for neighbors
                        chaosCascade: profile.chaosCascade * 0.6,
                        morphFactorExplosion: profile.morphFactorExplosion * 0.7,
                        intensityBurst: profile.intensityBurst * 0.5,
                        temporalWave: profile.temporalWave * 0.4
                    };
                    neighborVisualizer.triggerAdvancedMacroCascade(neighborProfile);
                }

                // UI cascade to neighbor
                neighborCard.classList.add('neighbor-cascade');
                setTimeout(() => {
                    neighborCard.classList.remove('neighbor-cascade');
                }, profile.cascadeDuration * 0.6);

            }, i * 100); // Staggered delay
        });
    }

    setupMacroDecaySequence(duration) {
        // ADVANCED TEMPORAL DECAY WITH HARMONIC RESONANCE

        const decaySteps = 5;
        const stepDuration = duration / decaySteps;

        for (let step = 1; step <= decaySteps; step++) {
            setTimeout(() => {
                const decayFactor = 1.0 - (step / decaySteps);

                // Gradual decay of global amplification
                this.holisticState.feedbackAmplification = 1.0 + (this.holisticState.feedbackAmplification - 1.0) * decayFactor;
                this.holisticState.temporalResonance *= 0.8;

                // Harmonic decay
                this.harmonicResonance.uiVibration *= 0.85;
                this.harmonicResonance.vib34dResonance *= 0.85;

                // Update temporal coherence phase alignment
                this.temporalCoherence.phaseAlignment *= decayFactor;

            }, step * stepDuration);
        }
    }

    // SCALE-BASED PROGRESSION SYSTEM
    nextCard() {
        const nextIndex = (this.currentIndex + 1) % this.cards.length;
        this.transitionToCard(nextIndex);
    }

    previousCard() {
        const nextIndex = (this.currentIndex - 1 + this.cards.length) % this.cards.length;
        this.transitionToCard(nextIndex);
    }

    focusCard(index) {
        if (index === this.currentIndex) return;
        this.transitionToCard(index);
    }

    transitionToCard(newIndex) {
        console.log(`🎯 Transitioning from card ${this.currentIndex} to card ${newIndex}`);

        const oldCard = this.cards[this.currentIndex];
        const newCard = this.cards[newIndex];

        // Deactivate old card systems
        this.deactivateCard(this.currentIndex);

        // Update card states with scale-based progression
        this.updateAllCardStates(newIndex);

        // Activate new card systems
        this.activateCard(newIndex);

        // Apply holistic transition effect
        this.triggerHolisticTransition(this.currentIndex, newIndex);

        this.currentIndex = newIndex;

        // Update status display
        this.updateStatusDisplay();
    }

    updateAllCardStates(focusedIndex) {
        this.cards.forEach((card, index) => {
            // Remove all state classes
            card.classList.remove('focused-state', 'approaching-state', 'background-state', 'exiting-state');

            let newState;
            if (index === focusedIndex) {
                newState = 'focused-state';
            } else {
                // Calculate relative distance for approaching vs background
                const distance = Math.abs(index - focusedIndex);
                if (distance === 1 || (focusedIndex === 0 && index === this.cards.length - 1) ||
                    (focusedIndex === this.cards.length - 1 && index === 0)) {
                    newState = 'approaching-state';
                } else {
                    newState = 'background-state';
                }
            }

            card.classList.add(newState);

            // Apply parameter profile for new state
            this.applyParameterProfile(index, newState);
        });
    }

    // PARAMETER MAPPING SYSTEM
    applyParameterProfile(cardIndex, state) {
        const visualizer = this.visualizers.get(cardIndex);
        if (!visualizer) return;

        const stateKey = state.replace('-state', '');
        const profile = this.parameterProfiles[stateKey];

        if (profile) {
            // Apply base parameters from profile
            visualizer.updateParameters({
                intensity: profile.intensity * this.holisticState.globalIntensity,
                gridDensity: profile.gridDensity,
                morphFactor: profile.morphFactor + this.holisticState.temporalResonance,
                chaos: profile.chaos,
                speed: profile.speed,
                saturation: profile.saturation,
                // Add mouse-based 4D rotation
                rot4dXW: (this.mouseState.x - 0.5) * 2.0,
                rot4dYW: (this.mouseState.y - 0.5) * 2.0,
                rot4dZW: this.holisticState.harmonicPhase
            });

            console.log(`🎛️ Applied ${stateKey} parameter profile to card ${cardIndex}`);
        }
    }

    // HOLISTIC FEEDBACK APPLICATION SYSTEM
    applyUIFeedback(card, feedbackTypes, duration) {
        feedbackTypes.forEach(feedbackType => {
            switch (feedbackType) {
                case 'scale-boost':
                    card.style.transform = card.style.transform.replace(/scale\([^)]*\)/, '') +
                                          ` scale(${this.microInteractionBoosts.hover.scaleMultiplier})`;
                    break;
                case 'scale-pulse':
                    card.classList.add('click-pulse');
                    setTimeout(() => card.classList.remove('click-pulse'), duration);
                    break;
                case 'glow-enhance':
                    card.style.filter = (card.style.filter || '') + ' drop-shadow(0 0 20px rgba(0,255,255,0.3))';
                    break;
                case 'border-brighten':
                    card.style.borderColor = 'rgba(0, 255, 255, 0.6)';
                    break;
            }
        });

        // Reset UI feedback after duration
        setTimeout(() => {
            // Reset transforms and effects based on current state
            const currentState = this.getCardState(card);
            this.resetCardUIToState(card, currentState);
        }, duration);
    }

    applyVIB34DFeedback(cardIndex, feedbackTypes, duration) {
        const visualizer = this.visualizers.get(cardIndex);
        if (!visualizer) return;

        const parameterBoosts = {};

        feedbackTypes.forEach(feedbackType => {
            switch (feedbackType) {
                case 'intensity-boost':
                    parameterBoosts.intensity = this.microInteractionBoosts.hover.intensityBoost;
                    break;
                case 'hue-shift':
                    parameterBoosts.hueShift = this.microInteractionBoosts.hover.hueShift;
                    break;
                case 'morph-enhance':
                    parameterBoosts.morphFactor = this.microInteractionBoosts.hover.morphFactorBoost;
                    break;
                case 'chaos-burst':
                    parameterBoosts.chaos = this.microInteractionBoosts.click.chaosBurst;
                    break;
                case 'morph-spike':
                    parameterBoosts.morphFactor = this.microInteractionBoosts.click.morphFactorSpike;
                    break;
                case 'intensity-flash':
                    parameterBoosts.intensity = this.microInteractionBoosts.click.intensityFlash;
                    break;
            }
        });

        visualizer.applyParameterBoosts(parameterBoosts, duration);
    }

    triggerCrossSystemReinforcement(interactionType, cardIndex, interactionLevel) {
        // Cross-system reinforcement: UI enhances visualizer, visualizer enhances UI
        this.holisticState.feedbackAmplification += (interactionLevel === 'macro') ? 0.3 : 0.1;

        // Propagate effects to neighboring cards (system-wide coherence)
        const neighborIndices = this.getNeighboringCardIndices(cardIndex);
        neighborIndices.forEach(neighborIndex => {
            const neighborVisualizer = this.visualizers.get(neighborIndex);
            if (neighborVisualizer) {
                neighborVisualizer.applyResonanceEffect(this.holisticState.feedbackAmplification * 0.3);
            }
        });

        console.log(`⚡ Cross-system reinforcement: ${interactionType} amplification=${this.holisticState.feedbackAmplification.toFixed(2)}`);
    }

    // CONTINUOUS SYSTEMS
    updateMouseState(event) {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        this.mouseState.targetX = event.clientX / window.innerWidth;
        this.mouseState.targetY = event.clientY / window.innerHeight;

        // Calculate velocity for advanced parameter modulation
        this.mouseState.velocity.x = this.mouseState.targetX - this.mouseState.x;
        this.mouseState.velocity.y = this.mouseState.targetY - this.mouseState.y;
    }

    applyMouseBasedParameterModulation() {
        // Smooth mouse following with advanced interpolation
        this.mouseState.x += (this.mouseState.targetX - this.mouseState.x) * 0.08;
        this.mouseState.y += (this.mouseState.targetY - this.mouseState.y) * 0.08;

        // Apply mouse-based parameter changes to focused card
        const focusedVisualizer = this.visualizers.get(this.currentIndex);
        if (focusedVisualizer) {
            focusedVisualizer.updateMouseParameters({
                rot4dXW: (this.mouseState.x - 0.5) * 2.0,
                rot4dYW: (this.mouseState.y - 0.5) * 2.0,
                mouseVelocity: Math.hypot(this.mouseState.velocity.x, this.mouseState.velocity.y)
            });
        }
    }

    updateCardMouseTracking(card, event) {
        const rect = card.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;

        // Update CSS custom properties for interaction feedback layer
        card.style.setProperty('--mouse-x', `${x}%`);
        card.style.setProperty('--mouse-y', `${y}%`);
    }

    processBreathingEffect() {
        // Subtle parameter breathing for organic feel
        this.holisticState.harmonicPhase += 0.02;

        const breathingIntensity = Math.sin(this.holisticState.harmonicPhase) * 0.05;

        this.visualizers.forEach(visualizer => {
            visualizer.applyBreathingEffect(breathingIntensity);
        });
    }

    updateTemporalResonance() {
        // Temporal effects that decay over time
        const timeSinceLastInteraction = Date.now() - this.lastInteractionTime;

        if (timeSinceLastInteraction > 2000) {
            this.holisticState.temporalResonance *= 0.98;
        }

        if (this.holisticState.feedbackAmplification > 1.0) {
            this.holisticState.feedbackAmplification -= 0.01;
        }
    }

    harmonizeGlobalState() {
        // Maintain global coherence across all systems
        this.holisticState.globalIntensity = 0.8 +
            Math.sin(this.holisticState.harmonicPhase * 0.7) * 0.1 +
            this.holisticState.temporalResonance * 0.2;
    }

    startHolisticRenderLoop() {
        const renderLoop = () => {
            this.updateSystemMetrics();
            requestAnimationFrame(renderLoop);
        };
        renderLoop();
    }

    // UTILITY FUNCTIONS
    getCardState(card) {
        if (card.classList.contains('focused-state')) return 'focused-state';
        if (card.classList.contains('approaching-state')) return 'approaching-state';
        if (card.classList.contains('background-state')) return 'background-state';
        return 'background-state';
    }

    getNeighboringCardIndices(centerIndex) {
        const neighbors = [];
        const prevIndex = (centerIndex - 1 + this.cards.length) % this.cards.length;
        const nextIndex = (centerIndex + 1) % this.cards.length;
        neighbors.push(prevIndex, nextIndex);
        return neighbors;
    }

    activateCard(cardIndex) {
        const portalVisualizer = this.portalVisualizers.get(cardIndex);
        if (portalVisualizer) {
            portalVisualizer.activate();
        }
    }

    deactivateCard(cardIndex) {
        const portalVisualizer = this.portalVisualizers.get(cardIndex);
        if (portalVisualizer) {
            portalVisualizer.deactivate();
        }
    }

    resetCardUIToState(card, state) {
        // Reset card UI to match its current state
        card.style.transform = '';
        card.style.filter = '';
        card.style.borderColor = '';
    }

    updateStatusDisplay() {
        const currentCardDisplay = document.getElementById('current-card-index');
        const currentScaleDisplay = document.getElementById('current-scale');
        const vib34dStatusDisplay = document.getElementById('vib34d-status');

        if (currentCardDisplay) {
            currentCardDisplay.textContent = this.currentIndex + 1;
        }

        if (currentScaleDisplay) {
            const focusedCard = this.cards[this.currentIndex];
            const computedScale = this.parameterProfiles.focused.scale;
            currentScaleDisplay.textContent = computedScale.toFixed(2);
        }

        if (vib34dStatusDisplay) {
            vib34dStatusDisplay.textContent = 'Ultra-Active';
        }
    }

    updateSystemMetrics() {
        // Update real-time system metrics
        const amplification = this.holisticState.feedbackAmplification.toFixed(2);
        const resonance = this.holisticState.temporalResonance.toFixed(3);

        // Could display these if needed for debugging
        // console.log(`Amplification: ${amplification}, Resonance: ${resonance}`);
    }

    // PUBLIC API
    toggleAutoMode() {
        if (this.isAutoMode) {
            this.stopAutoMode();
        } else {
            this.startAutoMode();
        }
    }

    startAutoMode() {
        this.isAutoMode = true;
        this.autoInterval = setInterval(() => {
            this.nextCard();
        }, 4000);
        console.log('▶️ Auto mode activated');
    }

    stopAutoMode() {
        this.isAutoMode = false;
        if (this.autoInterval) {
            clearInterval(this.autoInterval);
        }
        console.log('⏸️ Auto mode deactivated');
    }

    resetSystem() {
        console.log('🔄 Resetting ultimate holistic system...');

        this.holisticState.globalIntensity = 1.0;
        this.holisticState.harmonicPhase = 0;
        this.holisticState.feedbackAmplification = 1.0;
        this.holisticState.temporalResonance = 0;

        this.interactionCount = 0;

        this.transitionToCard(0);

        console.log('✅ System reset complete');
    }

    triggerHolisticTransition(fromIndex, toIndex) {
        // Holistic transition effects between cards
        console.log(`🌀 Holistic transition: ${fromIndex} → ${toIndex}`);

        // Temporal feedback loop effect
        this.holisticState.temporalResonance += 0.2;

        setTimeout(() => {
            this.holisticState.temporalResonance *= 0.8;
        }, 800);
    }

    destroy() {
        if (this.microInteractionTimer) {
            clearInterval(this.microInteractionTimer);
        }

        this.stopAutoMode();

        this.visualizers.forEach(visualizer => visualizer.destroy());
        this.portalVisualizers.forEach(visualizer => visualizer.destroy());

        console.log('🗑️ Ultimate holistic system destroyed');
    }
}

/**
 * ULTIMATE VIB34D VISUALIZER
 * Ultra-sophisticated VIB34D visualizer with holistic parameter responsiveness
 */
class UltimateVIB34DVisualizer {
    constructor(canvas, systemType, cardIndex) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.systemType = systemType;
        this.cardIndex = cardIndex;

        // Ultra-sophisticated parameter state
        this.parameters = {
            intensity: 0.5,
            gridDensity: 15,
            morphFactor: 1.0,
            chaos: 0.2,
            speed: 1.0,
            hue: this.getSystemHue(systemType),
            saturation: 0.8,
            rot4dXW: 0,
            rot4dYW: 0,
            rot4dZW: 0
        };

        this.targetParameters = { ...this.parameters };
        this.parameterBoosts = {};
        this.breathingOffset = Math.random() * Math.PI * 2;

        this.init();
    }

    init() {
        this.setupCanvas();
        this.startRenderLoop();
    }

    getSystemHue(systemType) {
        const systemHues = {
            quantum: 280,
            holographic: 330,
            faceted: 200
        };
        return systemHues[systemType] || 200;
    }

    setupCanvas() {
        const resizeCanvas = () => {
            const rect = this.canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;

            this.canvas.width = rect.width * dpr;
            this.canvas.height = rect.height * dpr;
            this.context.scale(dpr, dpr);
        };

        resizeCanvas();

        const resizeObserver = new ResizeObserver(resizeCanvas);
        resizeObserver.observe(this.canvas);
    }

    updateParameters(newParameters) {
        Object.assign(this.targetParameters, newParameters);
    }

    applyParameterBoosts(boosts, duration) {
        Object.assign(this.parameterBoosts, boosts);

        setTimeout(() => {
            // Decay boosts
            Object.keys(this.parameterBoosts).forEach(key => {
                delete this.parameterBoosts[key];
            });
        }, duration);
    }

    applyMicroParameterAdjustment(type, params) {
        // Subtle micro-adjustments
        this.parameterBoosts.microIntensity = (this.parameterBoosts.microIntensity || 0) + params.intensity * 0.1;
    }

    applyResonanceEffect(amplification) {
        // Resonance from neighboring cards
        this.parameterBoosts.resonance = amplification * 0.2;
    }

    applyBreathingEffect(breathingIntensity) {
        this.parameterBoosts.breathing = breathingIntensity;
    }

    updateMouseParameters(mouseParams) {
        this.targetParameters.rot4dXW = mouseParams.rot4dXW;
        this.targetParameters.rot4dYW = mouseParams.rot4dYW;

        // Mouse velocity affects chaos
        if (mouseParams.mouseVelocity > 0.01) {
            this.parameterBoosts.mouseVelocityChaos = mouseParams.mouseVelocity * 0.3;
        }
    }

    triggerMacroBurst() {
        // Legacy support - redirect to advanced cascade
        this.triggerAdvancedMacroCascade({
            chaosCascade: 1.0,
            morphFactorExplosion: 1.5,
            intensityBurst: 0.5,
            cascadeDuration: 1000
        });
    }

    triggerAdvancedMacroCascade(profile) {
        console.log(`🌊 Advanced macro cascade on visualizer ${this.cardIndex}`);

        // ADVANCED CASCADE PARAMETER APPLICATION
        this.parameterBoosts.cascadeChaos = profile.chaosCascade;
        this.parameterBoosts.cascadeMorphFactor = profile.morphFactorExplosion;
        this.parameterBoosts.cascadeIntensity = profile.intensityBurst;
        this.parameterBoosts.cascadeGridDensity = profile.gridDensitySpike || 0;

        // TEMPORAL WAVE EFFECTS
        this.parameterBoosts.temporalWave = profile.temporalWave || 0;
        this.parameterBoosts.harmonicResonance = profile.harmonicResonance || 0;

        // CASCADE DECAY SEQUENCE
        const decayInterval = setInterval(() => {
            // Gradual decay of cascade effects
            if (this.parameterBoosts.cascadeChaos) this.parameterBoosts.cascadeChaos *= 0.9;
            if (this.parameterBoosts.cascadeMorphFactor) this.parameterBoosts.cascadeMorphFactor *= 0.92;
            if (this.parameterBoosts.cascadeIntensity) this.parameterBoosts.cascadeIntensity *= 0.88;
            if (this.parameterBoosts.cascadeGridDensity) this.parameterBoosts.cascadeGridDensity *= 0.85;
            if (this.parameterBoosts.temporalWave) this.parameterBoosts.temporalWave *= 0.9;
            if (this.parameterBoosts.harmonicResonance) this.parameterBoosts.harmonicResonance *= 0.9;

            // Clean up when effects are minimal
            if (this.parameterBoosts.cascadeChaos < 0.01) {
                clearInterval(decayInterval);
                delete this.parameterBoosts.cascadeChaos;
                delete this.parameterBoosts.cascadeMorphFactor;
                delete this.parameterBoosts.cascadeIntensity;
                delete this.parameterBoosts.cascadeGridDensity;
                delete this.parameterBoosts.temporalWave;
                delete this.parameterBoosts.harmonicResonance;
            }
        }, 50);
    }

    applyHarmonicResonance(resonanceData) {
        // HARMONIC RESONANCE INTEGRATION WITH VIB34D PARAMETERS

        // UI vibration affects intensity and morphFactor
        if (resonanceData.uiVibration > 0.1) {
            this.parameterBoosts.harmonicIntensity = resonanceData.uiVibration * 0.3;
            this.parameterBoosts.harmonicMorphFactor = resonanceData.uiVibration * 0.2;
        }

        // VIB34D resonance affects chaos and grid density
        if (resonanceData.vib34dResonance > 0.1) {
            this.parameterBoosts.harmonicChaos = resonanceData.vib34dResonance * 0.25;
            this.parameterBoosts.harmonicGridDensity = resonanceData.vib34dResonance * 10;
        }

        // Beat frequency creates oscillating effects
        if (resonanceData.beatFrequency > 0.05) {
            const beatOscillation = Math.sin(Date.now() * 0.01 * resonanceData.beatFrequency) * 0.1;
            this.parameterBoosts.beatOscillation = beatOscillation;
        }

        // Resonance lock creates stability bonus
        if (resonanceData.resonanceLock) {
            this.parameterBoosts.resonanceLockStability = 0.15;
        } else {
            delete this.parameterBoosts.resonanceLockStability;
        }
    }

    startRenderLoop() {
        const render = () => {
            this.updateParameterInterpolation();
            this.renderVisualization();
            requestAnimationFrame(render);
        };
        render();
    }

    updateParameterInterpolation() {
        // Smooth parameter interpolation
        const lerpFactor = 0.06;

        Object.keys(this.parameters).forEach(key => {
            this.parameters[key] += (this.targetParameters[key] - this.parameters[key]) * lerpFactor;
        });

        // Apply parameter boosts
        this.applyCurrentBoosts();
    }

    applyCurrentBoosts() {
        // Apply all active parameter boosts
        Object.keys(this.parameterBoosts).forEach(boostKey => {
            const boostValue = this.parameterBoosts[boostKey];

            switch (boostKey) {
                case 'intensity':
                case 'microIntensity':
                case 'macroIntensity':
                case 'resonance':
                    this.parameters.intensity = Math.min(1.0, this.parameters.intensity + boostValue);
                    break;
                case 'chaos':
                case 'macroChaos':
                case 'mouseVelocityChaos':
                case 'cascadeChaos':
                case 'harmonicChaos':
                    this.parameters.chaos = Math.min(1.0, this.parameters.chaos + boostValue);
                    break;
                case 'morphFactor':
                case 'macroMorphFactor':
                case 'cascadeMorphFactor':
                case 'harmonicMorphFactor':
                    this.parameters.morphFactor = Math.min(3.0, this.parameters.morphFactor + boostValue);
                    break;
                case 'gridDensity':
                case 'cascadeGridDensity':
                case 'harmonicGridDensity':
                    this.parameters.gridDensity = Math.min(100, this.parameters.gridDensity + boostValue);
                    break;
                case 'intensity':
                case 'microIntensity':
                case 'macroIntensity':
                case 'cascadeIntensity':
                case 'harmonicIntensity':
                case 'resonance':
                    this.parameters.intensity = Math.min(1.0, this.parameters.intensity + boostValue);
                    break;
                case 'temporalWave':
                    // Temporal wave affects multiple parameters
                    this.parameters.morphFactor = Math.min(3.0, this.parameters.morphFactor + boostValue * 0.5);
                    this.parameters.chaos = Math.min(1.0, this.parameters.chaos + boostValue * 0.3);
                    break;
                case 'beatOscillation':
                    // Beat oscillation creates rhythmic parameter changes
                    this.parameters.intensity += boostValue;
                    this.parameters.morphFactor += boostValue * 0.5;
                    break;
                case 'resonanceLockStability':
                    // Resonance lock provides stability bonus
                    this.parameters.intensity = Math.max(0.3, this.parameters.intensity + boostValue);
                    break;
                case 'hueShift':
                    this.parameters.hue = (this.parameters.hue + boostValue) % 360;
                    break;
                case 'breathing':
                    this.parameters.intensity += Math.sin(Date.now() * 0.003 + this.breathingOffset) * boostValue;
                    break;
            }
        });
    }

    renderVisualization() {
        const ctx = this.context;
        const width = this.canvas.width / (window.devicePixelRatio || 1);
        const height = this.canvas.height / (window.devicePixelRatio || 1);

        // Clear canvas with ultra-sophisticated approach
        ctx.clearRect(0, 0, width, height);

        // Render based on system type with enhanced parameters
        switch (this.systemType) {
            case 'quantum':
                this.renderUltimateQuantumVisualization(ctx, width, height);
                break;
            case 'holographic':
                this.renderUltimateHolographicVisualization(ctx, width, height);
                break;
            case 'faceted':
                this.renderUltimateFacetedVisualization(ctx, width, height);
                break;
        }
    }

    renderUltimateQuantumVisualization(ctx, width, height) {
        const centerX = width / 2;
        const centerY = height / 2;
        const time = Date.now() * 0.001 * this.parameters.speed;

        // Ultra-sophisticated quantum lattice with 4D rotation influence
        const gridSpacing = Math.max(20, 60 - this.parameters.gridDensity);
        const maxRadius = Math.min(width, height) * 0.6;

        ctx.globalCompositeOperation = 'screen';

        for (let i = 0; i < this.parameters.gridDensity * 2; i++) {
            const angle = (i / (this.parameters.gridDensity * 2)) * Math.PI * 2 + time;
            const radius = (i / (this.parameters.gridDensity * 2)) * maxRadius;

            // 4D rotation influence
            const rotatedX = radius * Math.cos(angle + this.parameters.rot4dXW);
            const rotatedY = radius * Math.sin(angle + this.parameters.rot4dYW);

            const x = centerX + rotatedX * (1 + this.parameters.morphFactor * 0.3);
            const y = centerY + rotatedY * (1 + this.parameters.morphFactor * 0.3);

            const wave = Math.sin(radius * 0.02 + time + this.parameters.rot4dZW * 2) * 0.5 + 0.5;
            const chaosOffset = (Math.random() - 0.5) * this.parameters.chaos * 20;

            const alpha = this.parameters.intensity * wave * (1 - radius / maxRadius);

            if (alpha > 0.05) {
                ctx.fillStyle = `hsla(${this.parameters.hue}, ${this.parameters.saturation * 100}%, 60%, ${alpha})`;
                ctx.beginPath();
                ctx.arc(x + chaosOffset, y + chaosOffset, 2 + wave * 4, 0, Math.PI * 2);
                ctx.fill();

                // Quantum connections
                if (i > 0) {
                    const prevAngle = ((i - 1) / (this.parameters.gridDensity * 2)) * Math.PI * 2 + time;
                    const prevRadius = ((i - 1) / (this.parameters.gridDensity * 2)) * maxRadius;
                    const prevX = centerX + prevRadius * Math.cos(prevAngle + this.parameters.rot4dXW);
                    const prevY = centerY + prevRadius * Math.sin(prevAngle + this.parameters.rot4dYW);

                    ctx.strokeStyle = `hsla(${this.parameters.hue}, ${this.parameters.saturation * 100}%, 70%, ${alpha * 0.3})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(prevX, prevY);
                    ctx.lineTo(x, y);
                    ctx.stroke();
                }
            }
        }

        ctx.globalCompositeOperation = 'source-over';
    }

    renderUltimateHolographicVisualization(ctx, width, height) {
        const centerX = width / 2;
        const centerY = height / 2;
        const time = Date.now() * 0.001 * this.parameters.speed;

        // Ultra-sophisticated holographic interference patterns
        const layers = Math.floor(5 + this.parameters.gridDensity * 0.2);

        ctx.globalCompositeOperation = 'screen';

        for (let layer = 0; layer < layers; layer++) {
            const progress = layer / layers;
            const radius = (width * 0.4) * (1 - progress * 0.8);

            // 4D rotation creates holographic depth
            const rotationPhase = time + this.parameters.rot4dXW * 2 + layer * 0.5;
            const verticalPhase = this.parameters.rot4dYW + layer * 0.3;

            ctx.save();
            ctx.translate(centerX, centerY + Math.sin(verticalPhase) * 20);
            ctx.rotate(rotationPhase);

            const sides = 8 + layer * 2;
            const morphing = this.parameters.morphFactor + Math.sin(time + layer) * 0.3;

            ctx.strokeStyle = `hsla(${this.parameters.hue + layer * 15}, ${this.parameters.saturation * 100}%, 70%, ${this.parameters.intensity * (1 - progress)})`;
            ctx.lineWidth = 2;

            ctx.beginPath();
            for (let i = 0; i <= sides; i++) {
                const angle = (i / sides) * Math.PI * 2;
                const chaosOffset = (Math.random() - 0.5) * this.parameters.chaos * 10;
                const x = Math.cos(angle) * radius * (1 + Math.sin(angle * 3 + time) * morphing * 0.1) + chaosOffset;
                const y = Math.sin(angle) * radius * (1 + Math.cos(angle * 3 + time) * morphing * 0.1) + chaosOffset;

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();

            ctx.restore();
        }

        ctx.globalCompositeOperation = 'source-over';
    }

    renderUltimateFacetedVisualization(ctx, width, height) {
        const centerX = width / 2;
        const centerY = height / 2;
        const time = Date.now() * 0.001 * this.parameters.speed;

        // Ultra-sophisticated faceted geometry with 4D influence
        const facets = Math.floor(6 + this.parameters.gridDensity * 0.3);
        const baseRadius = Math.min(width, height) * 0.3;

        ctx.globalCompositeOperation = 'source-over';

        for (let f = 0; f < facets; f++) {
            const facetAngle = (f / facets) * Math.PI * 2 + time + this.parameters.rot4dZW;
            const facetRadius = baseRadius * (0.5 + f / facets * 0.5);

            // 4D rotation influence on facet positioning
            const x = centerX + Math.cos(facetAngle + this.parameters.rot4dXW) * facetRadius * this.parameters.morphFactor;
            const y = centerY + Math.sin(facetAngle + this.parameters.rot4dYW) * facetRadius * this.parameters.morphFactor;

            const alpha = this.parameters.intensity * (1 - f / facets);

            ctx.fillStyle = `hsla(${this.parameters.hue}, ${this.parameters.saturation * 100}%, 60%, ${alpha * 0.3})`;
            ctx.strokeStyle = `hsla(${this.parameters.hue}, ${this.parameters.saturation * 100}%, 80%, ${alpha})`;
            ctx.lineWidth = 2;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(facetAngle);

            const facetSize = 30 + this.parameters.gridDensity + this.parameters.chaos * 20;

            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                const fx = Math.cos(angle) * facetSize;
                const fy = Math.sin(angle) * facetSize;

                if (i === 0) {
                    ctx.moveTo(fx, fy);
                } else {
                    ctx.lineTo(fx, fy);
                }
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.restore();
        }
    }

    destroy() {
        // Clean up resources
        this.context = null;
    }
}

/**
 * ULTIMATE PORTAL VISUALIZER
 * Portal-style text visualization system
 */
class UltimatePortalVisualizer {
    constructor(portalElement, systemType, cardIndex) {
        this.portalElement = portalElement;
        this.systemType = systemType;
        this.cardIndex = cardIndex;
        this.isActive = false;

        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');

        this.portalDepth = 0;
        this.targetDepth = 0;

        this.init();
    }

    init() {
        this.canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: inherit;
            pointer-events: none;
        `;

        this.portalElement.appendChild(this.canvas);
        this.setupCanvas();
        this.startRenderLoop();
    }

    setupCanvas() {
        const resizeCanvas = () => {
            const rect = this.portalElement.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;

            this.canvas.width = rect.width * dpr;
            this.canvas.height = rect.height * dpr;
            this.context.scale(dpr, dpr);
        };

        resizeCanvas();

        const resizeObserver = new ResizeObserver(resizeCanvas);
        resizeObserver.observe(this.portalElement);
    }

    activate() {
        this.isActive = true;
        this.targetDepth = 1.0;
    }

    deactivate() {
        this.isActive = false;
        this.targetDepth = 0;
    }

    startRenderLoop() {
        const render = () => {
            this.update();
            this.renderPortal();
            requestAnimationFrame(render);
        };
        render();
    }

    update() {
        this.portalDepth += (this.targetDepth - this.portalDepth) * 0.06;
    }

    renderPortal() {
        const ctx = this.context;
        const width = this.canvas.width / (window.devicePixelRatio || 1);
        const height = this.canvas.height / (window.devicePixelRatio || 1);

        ctx.clearRect(0, 0, width, height);

        if (this.portalDepth < 0.01) return;

        const centerX = width / 2;
        const centerY = height / 2;
        const time = Date.now() * 0.002;

        // Ultra-sophisticated portal rendering based on system type
        switch (this.systemType) {
            case 'quantum':
                this.renderQuantumPortal(ctx, centerX, centerY, time);
                break;
            case 'holographic':
                this.renderHolographicPortal(ctx, centerX, centerY, time);
                break;
            case 'faceted':
                this.renderFacetedPortal(ctx, centerX, centerY, time);
                break;
        }
    }

    renderQuantumPortal(ctx, centerX, centerY, time) {
        const rings = 12;
        const maxRadius = Math.min(centerX, centerY) * 0.8;

        ctx.globalCompositeOperation = 'screen';

        for (let i = 0; i < rings; i++) {
            const progress = i / rings;
            const radius = maxRadius * (1 - progress) * this.portalDepth;
            const alpha = this.portalDepth * (1 - progress) * 0.6;

            ctx.strokeStyle = `hsla(280, 80%, ${60 + progress * 30}%, ${alpha})`;
            ctx.lineWidth = 3;

            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.globalCompositeOperation = 'source-over';
    }

    renderHolographicPortal(ctx, centerX, centerY, time) {
        const layers = 8;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(time);

        for (let i = 0; i < layers; i++) {
            const progress = i / layers;
            const radius = (Math.min(centerX, centerY) * 0.9) * (1 - progress * 0.7) * this.portalDepth;
            const alpha = this.portalDepth * (1 - progress) * 0.5;

            ctx.strokeStyle = `hsla(${330 + i * 20}, 90%, 70%, ${alpha})`;
            ctx.lineWidth = 2;

            const sides = 8 + i;
            ctx.beginPath();
            for (let j = 0; j <= sides; j++) {
                const angle = (j / sides) * Math.PI * 2;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

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

    renderFacetedPortal(ctx, centerX, centerY, time) {
        const facets = 16;

        ctx.save();
        ctx.translate(centerX, centerY);

        for (let i = 0; i < facets; i++) {
            const angle = (i / facets) * Math.PI * 2 + time * 0.5;
            const radius = (Math.min(centerX, centerY) * 0.7) * this.portalDepth;

            ctx.strokeStyle = `hsla(200, 80%, 70%, ${this.portalDepth * 0.4})`;
            ctx.fillStyle = `hsla(200, 80%, 70%, ${this.portalDepth * 0.1})`;
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius
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

    destroy() {
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// Export for global use
window.UltimateHolisticVIB34DSystem = UltimateHolisticVIB34DSystem;