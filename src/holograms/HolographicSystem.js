/**
 * Holographic System - Main coordinator for the modular architecture
 * Clean implementation without debugging mess
 */
import { HolographicVisualizer } from './HolographicVisualizer.js';
import { ExportSystem } from '../features/ExportSystem.js';

export class HolographicSystem {
    constructor() {
        this.visualizers = [];
        this.currentVariant = 0;
        this.baseVariants = 30; // Original 30 variations
        this.customVariants = []; // Store custom variations
        this.totalVariants = 30; // Will update dynamically
        this.maxVariants = 10000; // Maximum allowed variations
        this.autoCycleActive = false;
        this.autoCycleInterval = null;
        this.mouseX = 0.5;
        this.mouseY = 0.5;
        this.mouseIntensity = 0.0;
        
        // Audio reactivity system
        this.audioEnabled = false;
        this.audioContext = null;
        this.analyser = null;
        this.frequencyData = null;
        this.audioData = { bass: 0, mid: 0, high: 0 };
        
        // Variant names for display - SEQUENTIAL ORDER
        this.variantNames = [
            // 0-3: TETRAHEDRON variations
            'TETRAHEDRON LATTICE', 'TETRAHEDRON FIELD', 'TETRAHEDRON MATRIX', 'TETRAHEDRON RESONANCE',
            // 4-7: HYPERCUBE variations
            'HYPERCUBE LATTICE', 'HYPERCUBE FIELD', 'HYPERCUBE MATRIX', 'HYPERCUBE QUANTUM',
            // 8-11: SPHERE variations
            'SPHERE LATTICE', 'SPHERE FIELD', 'SPHERE MATRIX', 'SPHERE RESONANCE',
            // 12-15: TORUS variations
            'TORUS LATTICE', 'TORUS FIELD', 'TORUS MATRIX', 'TORUS QUANTUM',
            // 16-19: KLEIN BOTTLE variations
            'KLEIN BOTTLE LATTICE', 'KLEIN BOTTLE FIELD', 'KLEIN BOTTLE MATRIX', 'KLEIN BOTTLE QUANTUM',
            // 20-22: FRACTAL variations
            'FRACTAL LATTICE', 'FRACTAL FIELD', 'FRACTAL QUANTUM',
            // 23-25: WAVE variations
            'WAVE LATTICE', 'WAVE FIELD', 'WAVE QUANTUM',
            // 26-29: CRYSTAL variations
            'CRYSTAL LATTICE', 'CRYSTAL FIELD', 'CRYSTAL MATRIX', 'CRYSTAL QUANTUM'
        ];
        
        // Initialize export system
        this.exportSystem = new ExportSystem(this);
        
        // Load any saved custom variations from session
        this.loadSavedVariations();
        
        this.initialize();
    }
    
    loadSavedVariations() {
        try {
            const saved = localStorage.getItem('customHolographicVariations');
            if (saved) {
                const data = JSON.parse(saved);
                this.customVariants = data.variations || [];
                this.totalVariants = this.baseVariants + this.customVariants.length;
                
                // Restore variant names
                this.customVariants.forEach(cv => {
                    this.variantNames[cv.id] = cv.name;
                });
                
                console.log(`💾 Loaded ${this.customVariants.length} saved custom variations`);
            }
        } catch (e) {
            console.error('Failed to load saved variations:', e);
        }
    }
    
    saveVariations() {
        try {
            localStorage.setItem('customHolographicVariations', JSON.stringify({
                variations: this.customVariants,
                timestamp: Date.now()
            }));
            console.log(`💾 Saved ${this.customVariants.length} custom variations`);
        } catch (e) {
            console.error('Failed to save variations:', e);
        }
    }
    
    clearSavedVariations() {
        try {
            localStorage.removeItem('customHolographicVariations');
            this.customVariants = [];
            this.totalVariants = this.baseVariants;
            console.log('🗑️ Cleared all saved variations');
        } catch (e) {
            console.error('Failed to clear variations:', e);
        }
    }
    
    initialize() {
        console.log('🎨 Initializing Holographic System...');
        
        this.createVisualizers();
        this.setupInteractions();
        this.updateVariantDisplay();
        this.startRenderLoop();
    }
    
    createVisualizers() {
        // Create the 5 visualizers using clean layer configuration
        const layers = [
            { id: 'background-canvas', role: 'background', reactivity: 0.5 },
            { id: 'shadow-canvas', role: 'shadow', reactivity: 0.7 },
            { id: 'content-canvas', role: 'content', reactivity: 0.9 },
            { id: 'highlight-canvas', role: 'highlight', reactivity: 1.1 },
            { id: 'accent-canvas', role: 'accent', reactivity: 1.5 }
        ];
        
        layers.forEach(layer => {
            const visualizer = new HolographicVisualizer(layer.id, layer.role, layer.reactivity, this.currentVariant);
            this.visualizers.push(visualizer);
        });
        
        console.log(`✅ Created 5-layer holographic system`);
    }
    
    updateVariant(newVariant) {
        if (newVariant < 0) newVariant = this.totalVariants - 1;
        if (newVariant >= this.totalVariants) newVariant = 0;
        
        this.currentVariant = newVariant;
        
        // Check if this is a custom variation
        this.isCustomVariation = newVariant >= this.baseVariants;
        
        // Update all visualizers with new variant parameters
        this.visualizers.forEach(visualizer => {
            visualizer.variant = this.currentVariant;
            
            // For custom variations, use stored parameters
            if (this.isCustomVariation) {
                const customIndex = this.currentVariant - this.baseVariants;
                const customData = this.customVariants[customIndex];
                if (customData) {
                    visualizer.variantParams = {
                        geometryType: customData.params.geometryType,
                        density: customData.params.density,
                        speed: customData.params.speed,
                        chaos: customData.params.chaos,
                        morph: customData.params.morph,
                        hue: customData.params.hue,
                        saturation: customData.params.saturation,
                        intensity: customData.params.intensity,
                        bassResponse: customData.params.bassResponse || 1.0,
                        midResponse: customData.params.midResponse || 1.0,
                        highResponse: customData.params.highResponse || 1.0,
                        name: customData.name
                    };
                }
            } else {
                visualizer.variantParams = visualizer.generateVariantParams(this.currentVariant);
            }
            
            // Regenerate role parameters with new variant values
            visualizer.roleParams = visualizer.generateRoleParams(visualizer.role);
        });
        
        this.updateVariantDisplay();
        console.log(`🔄 Switched to variant ${this.currentVariant + 1}: ${this.variantNames[this.currentVariant]}`);
    }
    
    updateVariantDisplay() {
        const variantNumber = document.getElementById('variantNumber');
        const variantName = document.getElementById('variantName');
        
        if (variantNumber) {
            variantNumber.textContent = String(this.currentVariant + 1).padStart(2, '0');
        }
        
        if (variantName) {
            // Get the geometry name from the variant parameters
            const geometryName = this.isCustomVariation ? 
                (this.customVariants[this.currentVariant - this.baseVariants]?.name || 'CUSTOM') : 
                (this.visualizers[0]?.variantParams?.name || this.variantNames[this.currentVariant]);
            variantName.textContent = geometryName;
        }
        
        // Update parameter display
        this.updateParameterDisplay();
    }
    
    updateParameterDisplay() {
        const vp = this.visualizers[2]?.variantParams; // Get from content layer
        if (!vp) return;
        
        // Update parameter values regardless of variation type
        const paramGeometry = document.getElementById('paramGeometry');
        const paramDensity = document.getElementById('paramDensity');
        const paramSpeed = document.getElementById('paramSpeed');
        const paramChaos = document.getElementById('paramChaos');
        const paramMorph = document.getElementById('paramMorph');
        const paramHue = document.getElementById('paramHue');
        
        if (paramGeometry) paramGeometry.textContent = this.getGeometryName(vp.geometryType);
        if (paramDensity) paramDensity.textContent = vp.density.toFixed(2);
        if (paramSpeed) paramSpeed.textContent = vp.speed.toFixed(2);
        if (paramChaos) paramChaos.textContent = vp.chaos.toFixed(2);
        if (paramMorph) paramMorph.textContent = vp.morph.toFixed(2);
        if (paramHue) paramHue.textContent = Math.round(vp.hue) + '°';
        
        // Show parameter display for custom variations by default
        const paramDisplay = document.getElementById('paramDisplay');
        if (paramDisplay && this.isCustomVariation && !this.hideParams) {
            paramDisplay.classList.add('active');
        }
    }
    
    nextVariant() {
        this.updateVariant(this.currentVariant + 1);
    }
    
    previousVariant() {
        this.updateVariant(this.currentVariant - 1);
    }
    
    randomVariant() {
        const randomIndex = Math.floor(Math.random() * this.totalVariants);
        this.updateVariant(randomIndex);
    }
    
    toggleAutoCycle() {
        this.autoCycleActive = !this.autoCycleActive;
        const btn = document.getElementById('autoCycleBtn');
        const status = document.getElementById('autoCycleStatus');
        
        if (this.autoCycleActive) {
            if (btn) btn.textContent = '⏸ AUTO';
            if (status) status.textContent = 'Auto-cycle: ON (3s)';
            this.autoCycleInterval = setInterval(() => {
                this.nextVariant();
            }, 3000);
        } else {
            if (btn) btn.textContent = '▶ AUTO';
            if (status) status.textContent = 'Auto-cycle: OFF';
            if (this.autoCycleInterval) {
                clearInterval(this.autoCycleInterval);
                this.autoCycleInterval = null;
            }
        }
    }

    async initAudio() {
        // Don't initialize audio if in preview/gallery mode
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('hideui') === 'true' || urlParams.get('preview') === 'true') {
            console.log('🔇 Audio disabled in preview mode');
            return;
        }
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
            
            const constraints = {
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false,
                    sampleRate: 44100
                }
            };
            
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            const source = this.audioContext.createMediaStreamSource(stream);
            source.connect(this.analyser);
            
            this.audioEnabled = true;
            const audioBtn = document.getElementById('audioBtn');
            if (audioBtn) {
                audioBtn.textContent = '🎵 ON';
                audioBtn.style.background = 'rgba(0,255,77,0.3)';
                audioBtn.style.borderColor = '#00ff4d';
                audioBtn.style.color = '#00ff4d';
            }
            
            console.log('🎵 Audio reactivity enabled');
        } catch (error) {
            console.error('Audio initialization failed:', error.name, error.message);
            
            try {
                const fallbackStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const source = this.audioContext.createMediaStreamSource(fallbackStream);
                source.connect(this.analyser);
                
                this.audioEnabled = true;
                console.log('🎵 Audio reactivity enabled (fallback mode)');
            } catch (fallbackError) {
                console.error('Fallback audio failed:', fallbackError);
                alert(`Audio access failed: ${error.name}. Please check microphone permissions.`);
            }
        }
    }

    updateAudio() {
        if (!this.audioEnabled || !this.analyser) return;
        
        this.analyser.getByteFrequencyData(this.frequencyData);
        
        const bassEnd = Math.floor(this.frequencyData.length * 0.1);
        const midEnd = Math.floor(this.frequencyData.length * 0.4);
        
        let bass = 0, mid = 0, high = 0;
        
        for (let i = 0; i < bassEnd; i++) {
            bass += this.frequencyData[i];
        }
        bass /= (bassEnd * 255);
        
        for (let i = bassEnd; i < midEnd; i++) {
            mid += this.frequencyData[i];
        }
        mid /= ((midEnd - bassEnd) * 255);
        
        for (let i = midEnd; i < this.frequencyData.length; i++) {
            high += this.frequencyData[i];
        }
        high /= ((this.frequencyData.length - midEnd) * 255);
        
        // Smooth and musical audio processing
        const smoothedAudio = {
            bass: this.smoothAudioValue(bass, 'bass'),
            mid: this.smoothAudioValue(mid, 'mid'), 
            high: this.smoothAudioValue(high, 'high'),
            // Add musical features
            energy: (bass + mid + high) / 3,
            rhythm: this.detectRhythm(bass),
            melody: this.detectMelody(mid, high)
        };
        
        this.audioData = smoothedAudio;
        
        // Apply controlled audio reactivity to all visualizers
        if (this.audioEnabled) {
            this.visualizers.forEach(visualizer => {
                visualizer.updateAudio(this.audioData);
            });
        }
    }
    
    smoothAudioValue(currentValue, type) {
        // Smooth audio values to prevent jarring changes
        if (!this.audioSmoothing) {
            this.audioSmoothing = { bass: 0, mid: 0, high: 0 };
        }
        
        const smoothingFactor = 0.4; // Less smoothing for more reactivity
        this.audioSmoothing[type] = this.audioSmoothing[type] * smoothingFactor + currentValue * (1 - smoothingFactor);
        
        // Lower threshold for more sensitivity
        const threshold = 0.05;
        return this.audioSmoothing[type] > threshold ? this.audioSmoothing[type] : 0;
    }
    
    detectRhythm(bassLevel) {
        // Simple beat detection based on bass changes
        if (!this.previousBass) this.previousBass = 0;
        const beatDetected = bassLevel > this.previousBass + 0.2;
        this.previousBass = bassLevel;
        return beatDetected ? 1.0 : 0.0;
    }
    
    detectMelody(midLevel, highLevel) {
        // Detect melodic movement in mid/high frequencies
        const melodicActivity = (midLevel + highLevel) / 2;
        return melodicActivity > 0.3 ? melodicActivity : 0.0;
    }

    toggleAudio() {
        // Don't toggle audio if in preview/gallery mode
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('hideui') === 'true' || urlParams.get('preview') === 'true') {
            return;
        }
        
        if (!this.audioEnabled) {
            this.initAudio();
        } else {
            this.audioEnabled = false;
            const audioBtn = document.getElementById('audioBtn');
            if (audioBtn) {
                audioBtn.textContent = '🎵 AUDIO';
                audioBtn.style.background = 'rgba(255,0,77,0.3)';
                audioBtn.style.borderColor = '#ff004d';
                audioBtn.style.color = '#ff004d';
            }
            console.log('🎵 Audio reactivity disabled');
        }
    }
    
    setupInteractions() {
        // Mouse tracking system
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX / window.innerWidth;
            this.mouseY = 1.0 - (e.clientY / window.innerHeight);
            this.mouseIntensity = Math.min(1.0, Math.sqrt(e.movementX*e.movementX + e.movementY*e.movementY) / 40);
            
            // Update all visualizers
            this.visualizers.forEach(visualizer => {
                visualizer.updateInteraction(this.mouseX, this.mouseY, this.mouseIntensity);
            });
            
            // Grid overlay activation
            const gridOverlay = document.getElementById('gridOverlay');
            if (gridOverlay) {
                if (this.mouseIntensity > 0.3) {
                    gridOverlay.classList.add('active');
                } else {
                    gridOverlay.classList.remove('active');
                }
            }
            
            // Density variation
            const densityVar = Math.sin(this.mouseX * Math.PI) * Math.sin(this.mouseY * Math.PI) * 1.0; // FIX: Cut density changes in half
            this.visualizers.forEach(visualizer => {
                visualizer.updateDensity(densityVar);
            });
        });
        
        // Click interactions
        document.addEventListener('click', (e) => {
            const rect = document.body.getBoundingClientRect();
            const clickX = (e.clientX - rect.left) / rect.width;
            const clickY = 1.0 - ((e.clientY - rect.top) / rect.height);
            
            // Trigger click effect on all visualizers
            this.visualizers.forEach(visualizer => {
                visualizer.triggerClick(clickX, clickY);
            });
            
            // Create ripple effect
            this.createRipple(e.clientX, e.clientY);
        });
        
        // Touch and scroll interactions (simplified for modular version)
        this.setupTouchInteractions();
        this.setupScrollInteractions();
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Skip if user is focused on a button or input
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    this.previousVariant();
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                    this.nextVariant();
                    e.preventDefault();
                    break;
                case ' ':
                    this.randomVariant();
                    e.preventDefault();
                    break;
                case 'Enter':
                    this.toggleAutoCycle();
                    e.preventDefault();
                    break;
                case 'p':
                case 'P':
                    // Toggle parameter display
                    const paramDisplay = document.getElementById('paramDisplay');
                    if (paramDisplay) {
                        paramDisplay.classList.toggle('active');
                    }
                    e.preventDefault();
                    break;
            }
        });
    }
    
    setupTouchInteractions() {
        let currentTouch = null;
        let touchStartTime = 0;
        
        const holographicDisplay = document.getElementById('holographicDisplay');
        if (!holographicDisplay) return;
        
        const isOverHolographicArea = (e) => {
            const touch = e.touches[0] || e.changedTouches[0];
            if (!touch) return false;
            
            const element = document.elementFromPoint(touch.clientX, touch.clientY);
            if (!element) return false;
            
            return element.tagName === 'CANVAS' || 
                   element.id === 'holographicDisplay' ||
                   element.id === 'gridOverlay' ||
                   holographicDisplay.contains(element);
        };
        
        const isOverUIControl = (e) => {
            const touch = e.touches[0] || e.changedTouches[0];
            if (!touch) return false;
            
            const element = document.elementFromPoint(touch.clientX, touch.clientY);
            if (!element) return false;
            
            return element.closest('.control-panel') || 
                   element.closest('.control-btn') ||
                   element.classList.contains('control-btn') ||
                   element.classList.contains('control-panel');
        };
        
        document.addEventListener('touchstart', (e) => {
            if (isOverUIControl(e)) return;
            
            if (isOverHolographicArea(e) && e.touches.length > 0) {
                e.preventDefault();
                currentTouch = e.touches[0];
                touchStartTime = Date.now();
                const touchX = currentTouch.clientX / window.innerWidth;
                const touchY = 1.0 - (currentTouch.clientY / window.innerHeight);
                
                this.visualizers.forEach(visualizer => {
                    visualizer.triggerClick(touchX, touchY);
                    visualizer.updateTouch(touchX, touchY, true);
                });
                
                this.createRipple(currentTouch.clientX, currentTouch.clientY);
            }
        }, { passive: false });
        
        document.addEventListener('touchmove', (e) => {
            if (isOverUIControl(e)) return;
            
            if (isOverHolographicArea(e) && e.touches.length > 0 && currentTouch) {
                e.preventDefault();
                const touch = e.touches[0];
                const touchX = touch.clientX / window.innerWidth;
                const touchY = 1.0 - (touch.clientY / window.innerHeight);
                
                this.visualizers.forEach(visualizer => {
                    visualizer.updateTouch(touchX, touchY, true);
                });
                
                currentTouch = touch;
            }
        }, { passive: false });
        
        document.addEventListener('touchend', (e) => {
            if (currentTouch) {
                const touchDuration = Date.now() - touchStartTime;
                
                if (touchDuration < 150) {
                    this.visualizers.forEach(visualizer => {
                        visualizer.clickIntensity = Math.min(1.0, visualizer.clickIntensity + 0.3);
                    });
                }
                
                this.visualizers.forEach(visualizer => {
                    visualizer.updateTouch(0.5, 0.5, false);
                });
                currentTouch = null;
            }
        }, { passive: false });
    }
    
    setupScrollInteractions() {
        const holographicDisplay = document.getElementById('holographicDisplay');
        if (!holographicDisplay) return;
        
        document.addEventListener('wheel', (e) => {
            const element = document.elementFromPoint(e.clientX, e.clientY);
            const isOverUI = element && (element.closest('.control-panel') || element.closest('.control-btn'));
            
            const isOverHolographic = !isOverUI && (element && (
                element.tagName === 'CANVAS' ||
                element.id === 'holographicDisplay' ||
                element.id === 'gridOverlay' ||
                holographicDisplay.contains(element)
            ));
            
            if (isOverHolographic) {
                e.preventDefault();
                
                this.visualizers.forEach(visualizer => {
                    visualizer.updateScroll(e.deltaY);
                });
                
                const gridOverlay = document.getElementById('gridOverlay');
                if (gridOverlay) {
                    gridOverlay.style.transform = `translateY(${e.deltaY * 0.1}px)`;
                    setTimeout(() => {
                        gridOverlay.style.transform = 'translateY(0px)';
                    }, 100);
                }
            }
        }, { passive: false });
    }
    
    createRipple(x, y) {
        const ripple = document.createElement('div');
        ripple.className = 'interaction-ripple';
        ripple.style.left = (x - 50) + 'px';
        ripple.style.top = (y - 50) + 'px';
        document.body.appendChild(ripple);
        
        setTimeout(() => {
            if (document.body.contains(ripple)) {
                document.body.removeChild(ripple);
            }
        }, 600);
    }
    
    startRenderLoop() {
        const render = () => {
            // Update audio reactivity
            this.updateAudio();
            
            // Render all visualizers
            this.visualizers.forEach(visualizer => {
                visualizer.render();
            });
            
            requestAnimationFrame(render);
        };
        
        render();
        console.log('🎬 Holographic render loop started');
    }
    
    loadCustomVariation(customParams) {
        console.log('🎛️ Loading custom variation with parameters:', customParams);
        
        // Convert string parameters to appropriate types and map correctly
        const params = {
            geometryType: customParams.geometry !== null ? parseInt(customParams.geometry) : 0,
            density: customParams.density !== null ? parseFloat(customParams.density) : 1.0,
            speed: customParams.speed !== null ? parseFloat(customParams.speed) : 0.5,
            chaos: customParams.chaos !== null ? parseFloat(customParams.chaos) : 0.0,
            morph: customParams.morph !== null ? parseFloat(customParams.morph) : 0.0,
            hue: customParams.hue !== null ? parseFloat(customParams.hue) : 0,
            saturation: customParams.saturation !== null ? parseFloat(customParams.saturation) : 0.8,
            intensity: customParams.intensity !== null ? parseFloat(customParams.intensity) : 0.5,
            bassResponse: customParams.bassResponse !== null ? parseFloat(customParams.bassResponse) : 1.0,
            midResponse: customParams.midResponse !== null ? parseFloat(customParams.midResponse) : 1.0,
            highResponse: customParams.highResponse !== null ? parseFloat(customParams.highResponse) : 1.0
        };
        
        console.log('🔍 Parsed parameters:', params);
        
        // Check if this exact variation already exists
        const existingIndex = this.customVariants.findIndex(cv => 
            cv.params.geometryType === params.geometryType &&
            cv.params.density === params.density &&
            cv.params.speed === params.speed &&
            cv.params.chaos === params.chaos &&
            cv.params.morph === params.morph &&
            Math.abs(cv.params.hue - params.hue) < 0.01 &&
            Math.abs(cv.params.saturation - params.saturation) < 0.01 &&
            Math.abs(cv.params.intensity - params.intensity) < 0.01
        );
        
        if (existingIndex !== -1) {
            const existingId = this.customVariants[existingIndex].id;
            console.log(`♻️ Variation already exists at #${existingId}, switching to it`);
            this.updateVariant(existingId);
            return;
        }
        
        // Add as a new variation if under the limit
        if (this.totalVariants < this.maxVariants) {
            const newVariantId = this.totalVariants;
            this.customVariants.push({
                id: newVariantId,
                params: params,
                name: this.getGeometryName(params.geometryType) + ' CUSTOM ' + (this.customVariants.length + 1)
            });
            this.totalVariants++;
            this.currentVariant = newVariantId;
            this.isCustomVariation = true;
            
            this.variantNames[newVariantId] = this.customVariants[this.customVariants.length - 1].name;
            this.saveVariations();
            
            console.log(`✅ Added custom variation #${newVariantId}`);
        } else {
            console.warn('⚠️ Maximum variations limit reached (10000)');
            if (confirm('Maximum 10000 variations allowed. Would you like to clear saved variations and start fresh?')) {
                this.clearSavedVariations();
                this.loadCustomVariation(customParams);
            }
            return;
        }
        
        // Update visualizers with custom parameters
        this.updateVariant(this.currentVariant);
        this.updateVariantDisplay();
        console.log('✅ Custom variation loaded successfully');
    }
    
    getGeometryName(geometryId) {
        const geometryNames = [
            'TETRAHEDRON', 'HYPERCUBE', 'SPHERE', 'TORUS',
            'KLEIN BOTTLE', 'FRACTAL', 'WAVE', 'CRYSTAL'
        ];
        return geometryNames[geometryId] || 'UNKNOWN';
    }
}