/**
 * 🌟 SPECTACULAR VIB3-4D DYNAMIC LOGO SYSTEM
 * Creates a LIVE mini-visualizer inside the "3" character that mirrors the main visualization
 * BEYOND EXPECTATIONS - Interactive holographic logo that responds to system changes!
 */

class DynamicLogoSystem {
    constructor() {
        this.logoCanvas = null;
        this.logoContext = null;
        this.animationId = null;
        this.currentSystem = 'faceted';
        this.logoParams = {
            time: 0,
            intensity: 0.8,
            hue: 200,
            speed: 1.0
        };
        this.isInitialized = false;
    }

    /**
     * 🎭 Initialize the magical "3" with a hidden canvas for live visualization
     */
    init() {
        console.log('🌟 Initializing SPECTACULAR Dynamic Logo System...');
        
        // Create invisible canvas for logo rendering
        this.logoCanvas = document.createElement('canvas');
        this.logoCanvas.width = 64;
        this.logoCanvas.height = 64;
        this.logoCanvas.style.display = 'none';
        document.body.appendChild(this.logoCanvas);
        
        this.logoContext = this.logoCanvas.getContext('2d');
        
        // Apply live canvas as background to the "3"
        const specialThree = document.getElementById('dynamicThree');
        if (specialThree) {
            this.applyLiveBackground(specialThree);
            this.startAnimation();
            this.setupSystemWatching();
            this.isInitialized = true;
            console.log('✨ Dynamic Logo System initialized - BEYOND EXPECTATIONS!');
        } else {
            console.warn('⚠️ Special "3" element not found');
        }
    }

    /**
     * 🎨 Apply the live canvas as a background to the "3" character
     */
    applyLiveBackground(element) {
        // Create a more complex background with the live canvas
        const updateBackground = () => {
            if (this.logoCanvas) {
                const dataURL = this.logoCanvas.toDataURL();
                element.style.background = `
                    linear-gradient(45deg, #ff00ff, #00ffff, #ffff00, #ff00ff),
                    url(${dataURL})
                `;
                element.style.backgroundSize = '400% 400%, cover';
                element.style.backgroundBlendMode = 'overlay, normal';
            }
        };

        // Update background every 100ms for smooth live effect
        setInterval(updateBackground, 100);
    }

    /**
     * 🌈 Render mini-visualization based on current system
     */
    renderMiniVisualization() {
        if (!this.logoContext) return;

        const ctx = this.logoContext;
        const width = this.logoCanvas.width;
        const height = this.logoCanvas.height;
        const time = this.logoParams.time;

        // Clear canvas with alpha for transparency
        ctx.clearRect(0, 0, width, height);
        
        // Set composite mode for additive blending
        ctx.globalCompositeOperation = 'lighter';

        switch (this.currentSystem) {
            case 'faceted':
                this.renderFacetedMini(ctx, width, height, time);
                break;
            case 'quantum':
                this.renderQuantumMini(ctx, width, height, time);
                break;
            case 'holographic':
                this.renderHolographicMini(ctx, width, height, time);
                break;
            case 'polychora':
                this.renderPolychoraMini(ctx, width, height, time);
                break;
        }

        // Reset composite mode
        ctx.globalCompositeOperation = 'source-over';
    }

    /**
     * 🔷 Render Faceted system mini-visualization
     */
    renderFacetedMini(ctx, width, height, time) {
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = 20;

        ctx.strokeStyle = `hsl(${this.logoParams.hue}, 80%, 60%)`;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = ctx.strokeStyle;

        // Rotating geometric pattern
        const sides = 6;
        const rotation = time * this.logoParams.speed * 0.02;
        
        ctx.beginPath();
        for (let i = 0; i <= sides; i++) {
            const angle = (i / sides) * Math.PI * 2 + rotation;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();

        // Inner pattern
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i <= sides; i++) {
            const angle = (i / sides) * Math.PI * 2 - rotation;
            const x = centerX + Math.cos(angle) * (radius * 0.5);
            const y = centerY + Math.sin(angle) * (radius * 0.5);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    }

    /**
     * 🌌 Render Quantum system mini-visualization  
     */
    renderQuantumMini(ctx, width, height, time) {
        const centerX = width / 2;
        const centerY = height / 2;

        // Quantum particle effects
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2 + time * 0.03;
            const distance = 15 + Math.sin(time * 0.05 + i) * 8;
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;

            const hue = (this.logoParams.hue + i * 30 + time * 2) % 360;
            ctx.fillStyle = `hsl(${hue}, 90%, 70%)`;
            ctx.shadowBlur = 8;
            ctx.shadowColor = ctx.fillStyle;

            ctx.beginPath();
            ctx.arc(x, y, 2 + Math.sin(time * 0.1 + i) * 1, 0, Math.PI * 2);
            ctx.fill();
        }

        // Central quantum core
        ctx.fillStyle = `hsl(${this.logoParams.hue}, 100%, 80%)`;
        ctx.shadowBlur = 15;
        ctx.shadowColor = ctx.fillStyle;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * ✨ Render Holographic system mini-visualization
     */
    renderHolographicMini(ctx, width, height, time) {
        const centerX = width / 2;
        const centerY = height / 2;

        // Holographic layers
        for (let layer = 0; layer < 3; layer++) {
            const radius = 10 + layer * 6;
            const alpha = 0.6 - layer * 0.2;
            const hue = (this.logoParams.hue + layer * 60 + time * 3) % 360;

            ctx.strokeStyle = `hsla(${hue}, 90%, 70%, ${alpha})`;
            ctx.lineWidth = 2 - layer * 0.5;
            ctx.shadowBlur = 12;
            ctx.shadowColor = ctx.strokeStyle;

            const rotation = time * (0.02 + layer * 0.01);
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, rotation, rotation + Math.PI * 1.5);
            ctx.stroke();
        }

        // Holographic shimmer effect
        const shimmerX = centerX + Math.sin(time * 0.08) * 10;
        const shimmerY = centerY + Math.cos(time * 0.08) * 10;
        
        ctx.fillStyle = `hsla(${(this.logoParams.hue + 180) % 360}, 100%, 90%, 0.8)`;
        ctx.shadowBlur = 20;
        ctx.shadowColor = ctx.fillStyle;
        ctx.beginPath();
        ctx.arc(shimmerX, shimmerY, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * 🔮 Render Polychora system mini-visualization
     */
    renderPolychoraMini(ctx, width, height, time) {
        const centerX = width / 2;
        const centerY = height / 2;

        // 4D polytope projection simulation
        const vertices = [];
        const numVertices = 8; // Tesseract vertices in 3D projection

        for (let i = 0; i < numVertices; i++) {
            const angle = (i / numVertices) * Math.PI * 2;
            const radius1 = 12 + Math.sin(time * 0.04 + i) * 4;
            const radius2 = 8 + Math.cos(time * 0.04 + i) * 3;
            
            vertices.push({
                x: centerX + Math.cos(angle) * radius1,
                y: centerY + Math.sin(angle) * radius1,
                z: Math.sin(time * 0.03 + i) * radius2
            });
        }

        // Draw 4D projection edges
        ctx.strokeStyle = `hsl(${this.logoParams.hue}, 70%, 60%)`;
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 8;
        ctx.shadowColor = ctx.strokeStyle;

        for (let i = 0; i < vertices.length; i++) {
            for (let j = i + 1; j < vertices.length; j++) {
                if (Math.abs(i - j) <= 2 || (i === 0 && j === vertices.length - 1)) {
                    const alpha = 0.3 + Math.abs(vertices[i].z - vertices[j].z) * 0.05;
                    ctx.globalAlpha = alpha;
                    
                    ctx.beginPath();
                    ctx.moveTo(vertices[i].x, vertices[i].y);
                    ctx.lineTo(vertices[j].x, vertices[j].y);
                    ctx.stroke();
                }
            }
        }
        ctx.globalAlpha = 1.0;

        // Draw vertices
        vertices.forEach((vertex, i) => {
            const size = 2 + Math.abs(vertex.z) * 0.1;
            const brightness = 50 + Math.abs(vertex.z) * 2;
            
            ctx.fillStyle = `hsl(${this.logoParams.hue}, 80%, ${brightness}%)`;
            ctx.shadowBlur = 6;
            ctx.shadowColor = ctx.fillStyle;
            
            ctx.beginPath();
            ctx.arc(vertex.x, vertex.y, size, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    /**
     * 👀 Watch for system changes and update the logo - BEYOND EXPECTATIONS!
     */
    setupSystemWatching() {
        // Watch for system changes
        const originalSwitchSystem = window.switchSystem;
        if (originalSwitchSystem) {
            window.switchSystem = (system) => {
                const result = originalSwitchSystem.call(window, system);
                this.updateSystem(system);
                return result;
            };
        }

        // Watch for parameter changes
        const originalUpdateParameter = window.updateParameter;
        if (originalUpdateParameter) {
            window.updateParameter = (param, value) => {
                const result = originalUpdateParameter.call(window, param, value);
                this.updateParameter(param, value);
                return result;
            };
        }

        // 🎵 AUDIO REACTIVE LOGO - React to audio input!
        this.setupAudioReactivity();
        
        // 🖱️ MOUSE REACTIVE LOGO - React to mouse movement!
        this.setupMouseReactivity();
        
        // ⚡ INTERACTION REACTIVE LOGO - React to button clicks!
        this.setupInteractionReactivity();
    }

    /**
     * 🎵 Make logo react to audio input
     */
    setupAudioReactivity() {
        if (window.audioEngine && window.audioEngine.analyser) {
            const originalGetAudioData = window.audioEngine.getAudioData;
            if (originalGetAudioData) {
                window.audioEngine.getAudioData = () => {
                    const data = originalGetAudioData.call(window.audioEngine);
                    if (data && data.volume > 0.1) {
                        this.triggerAudioPulse(data.volume, data.frequency);
                    }
                    return data;
                };
            }
        }
    }

    /**
     * 🖱️ Make logo react to mouse movement
     */
    setupMouseReactivity() {
        let mouseReactTimeout;
        document.addEventListener('mousemove', (e) => {
            const intensity = Math.sqrt(e.movementX*e.movementX + e.movementY*e.movementY) / 100;
            this.triggerMouseReaction(intensity);
            
            clearTimeout(mouseReactTimeout);
            mouseReactTimeout = setTimeout(() => {
                this.triggerMouseReaction(0);
            }, 500);
        });
    }

    /**
     * ⚡ Make logo react to interactions
     */
    setupInteractionReactivity() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.system-btn, .panel-btn, .nav-btn, .toggle-btn')) {
                this.triggerInteractionBurst();
            }
        });
    }

    /**
     * 🎵 Audio pulse effect
     */
    triggerAudioPulse(volume, frequency) {
        const specialThree = document.getElementById('dynamicThree');
        if (specialThree && volume > 0.2) {
            const scale = 1 + volume * 0.3;
            const hueShift = frequency * 2;
            
            specialThree.style.transform = `scale(${scale})`;
            specialThree.style.filter = `drop-shadow(0 0 ${15 + volume * 20}px rgba(255, 0, 255, ${0.8 + volume * 0.4})) hue-rotate(${hueShift}deg)`;
            
            // Reset after short time
            setTimeout(() => {
                specialThree.style.transform = '';
                specialThree.style.filter = '';
            }, 100);
        }
    }

    /**
     * 🖱️ Mouse reaction effect
     */
    triggerMouseReaction(intensity) {
        const specialThree = document.getElementById('dynamicThree');
        if (specialThree) {
            const rotation = intensity * 10;
            const brightness = 1 + intensity * 0.5;
            
            specialThree.style.transform = `rotate(${rotation}deg) scale(${1 + intensity * 0.1})`;
            specialThree.style.filter = `brightness(${brightness}) drop-shadow(0 0 ${15 + intensity * 10}px rgba(0, 255, 255, ${0.8 + intensity * 0.3}))`;
        }
    }

    /**
     * ⚡ Interaction burst effect
     */
    triggerInteractionBurst() {
        const specialThree = document.getElementById('dynamicThree');
        if (specialThree) {
            // Create spectacular burst effect
            specialThree.style.transform = 'scale(1.5) rotate(180deg)';
            specialThree.style.filter = 'drop-shadow(0 0 40px rgba(255, 255, 255, 1)) hue-rotate(180deg) brightness(1.5)';
            
            setTimeout(() => {
                specialThree.style.transform = '';
                specialThree.style.filter = '';
            }, 400);
        }
    }

    /**
     * 🔄 Update system and create smooth transition effect
     */
    updateSystem(newSystem) {
        if (this.currentSystem !== newSystem) {
            console.log(`🌟 Logo transitioning to ${newSystem} system`);
            this.currentSystem = newSystem;
            
            // Trigger special transition effect
            this.triggerSystemTransition();
        }
    }

    /**
     * 🎛️ Update logo parameters based on main system parameters
     */
    updateParameter(param, value) {
        switch (param) {
            case 'hue':
                this.logoParams.hue = parseFloat(value);
                break;
            case 'speed':
                this.logoParams.speed = parseFloat(value);
                break;
            case 'intensity':
                this.logoParams.intensity = parseFloat(value);
                break;
        }
    }

    /**
     * ⚡ Special transition effect when switching systems
     */
    triggerSystemTransition() {
        const specialThree = document.getElementById('dynamicThree');
        if (specialThree) {
            // Burst effect
            specialThree.style.transform = 'scale(1.3)';
            specialThree.style.filter = 'drop-shadow(0 0 30px rgba(255, 255, 255, 1))';
            
            setTimeout(() => {
                specialThree.style.transform = '';
                specialThree.style.filter = '';
            }, 500);
        }
    }

    /**
     * 🎬 Main animation loop
     */
    startAnimation() {
        const animate = () => {
            this.logoParams.time++;
            this.renderMiniVisualization();
            this.animationId = requestAnimationFrame(animate);
        };
        
        animate();
        console.log('🎭 Dynamic logo animation started!');
    }

    /**
     * 🛑 Stop animation (for cleanup)
     */
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
}

// 🚀 Initialize the SPECTACULAR logo system
window.dynamicLogoSystem = new DynamicLogoSystem();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => window.dynamicLogoSystem.init(), 1000);
    });
} else {
    setTimeout(() => window.dynamicLogoSystem.init(), 1000);
}

export { DynamicLogoSystem };