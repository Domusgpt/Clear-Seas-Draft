/**
 * VIB34D GEOMETRIC TILT WINDOW SYSTEM
 * Creates "angled window" effect where device tilt matches visual grid rotation
 * Plus 4D depth changes based on viewing angle through the tilted window
 */

export class DeviceTiltHandler {
    constructor() {
        this.isEnabled = false;
        this.isSupported = false;
        this.sensitivity = 1.0;
        this.smoothing = 0.15; // Slightly more smoothing for geometric effects
        
        // Current device orientation (degrees for easier geometric calculations)
        this.currentTilt = {
            alpha: 0, // Z-axis rotation (compass heading)
            beta: 0,  // X-axis rotation (front-back tilt)  
            gamma: 0  // Y-axis rotation (left-right tilt)
        };
        
        // Smoothed values for smooth visual transitions
        this.smoothedTilt = {
            alpha: 0,
            beta: 0,
            gamma: 0
        };
        
        // Base rotation values (from presets/manual control)
        this.baseRotation = {
            rot4dXW: 0,
            rot4dYW: 0,
            rot4dZW: 0
        };
        
        // Base parameters for restoration
        this.baseParameters = {
            dimension: 3.5,
            morphFactor: 1.0,
            chaos: 0.2,
            intensity: 0.8,
            gridDensity: 15
        };
        
        this.boundHandleDeviceOrientation = this.handleDeviceOrientation.bind(this);
    }
    
    /**
     * 🌐 GEOMETRIC TILT WINDOW SYSTEM
     * Maps device tilt to visual rotation + 4D depth exploration
     */
    calculateGeometricWindow(alpha, beta, gamma) {
        // Convert to degrees for easier geometric calculations
        const alphaDeg = alpha;
        const betaDeg = beta;  
        const gammaDeg = gamma;
        
        // 1. CALCULATE TILT INTENSITY (how far from level)
        const tiltIntensity = Math.sqrt(betaDeg*betaDeg + gammaDeg*gammaDeg) / 90; // 0-1+ range
        const extremeTilt = tiltIntensity > 0.7;
        
        // 2. VISUAL ROTATION MATCHING (1:1 with device tilt)
        const visualRotation = {
            // Device tilts physically match visual grid rotation
            rotateX: betaDeg * 0.8,  // Front-back tilt → X-axis visual rotation
            rotateY: alphaDeg * 0.2, // Compass → slight Y-axis rotation  
            rotateZ: gammaDeg * 0.8  // Left-right tilt → Z-axis visual rotation
        };
        
        // 3. WINDOW DEPTH PROGRESSION (more tilt = deeper into 4D)
        const windowDepth = {
            // Tilt intensity determines how "deep" through window you're looking
            depthMultiplier: 1 + tiltIntensity * 2.5, // 1x to 3.5x depth
            
            // 4D parameters based on window depth
            dimension: this.baseParameters.dimension + tiltIntensity * 1.8, // 3.5 to 5.3
            morphFactor: this.baseParameters.morphFactor + tiltIntensity * 1.2, // More morph when deeper
            chaos: Math.min(0.9, this.baseParameters.chaos + (tiltIntensity * tiltIntensity) * 0.6), // Quadratic chaos increase
            intensity: Math.min(1.0, this.baseParameters.intensity + tiltIntensity * 0.3), // Brighter when deeper
            gridDensity: this.baseParameters.gridDensity * (1 + tiltIntensity * 0.8) // More detail when deeper
        };
        
        // 4. 4D ROTATION BASED ON VIEWING ANGLE
        const viewingAngle4D = {
            // Combine base rotation with tilt-based 4D exploration
            rot4dXW: this.baseRotation.rot4dXW + (betaDeg * Math.PI / 180) * 0.025 * windowDepth.depthMultiplier,
            rot4dYW: this.baseRotation.rot4dYW + (gammaDeg * Math.PI / 180) * 0.035 * windowDepth.depthMultiplier,  
            rot4dZW: this.baseRotation.rot4dZW + (alphaDeg * Math.PI / 180) * 0.015 * windowDepth.depthMultiplier
        };
        
        // 5. PERSPECTIVE DISTORTION EFFECTS
        const perspectiveEffects = {
            // Grid scaling based on viewing angle (like looking through thick glass)
            scaleX: 1 + Math.abs(gammaDeg) / 300, // Horizontal tilt → horizontal stretch
            scaleY: 1 + Math.abs(betaDeg) / 300,  // Vertical tilt → vertical stretch
            
            // Edge complexity (extreme angles show more detail)
            edgeComplexity: extremeTilt ? 0.4 : 0,
            
            // Visual filters for angled viewing
            brightness: 1 + tiltIntensity * 0.15,
            contrast: 1 + tiltIntensity * 0.1
        };
        
        return {
            tiltIntensity,
            extremeTilt,
            visualRotation,
            windowDepth,
            viewingAngle4D,
            perspectiveEffects
        };
    }
    
    /**
     * Apply geometric window effects to the visualization
     */
    applyGeometricWindow(windowData) {
        const { visualRotation, windowDepth, viewingAngle4D, perspectiveEffects, tiltIntensity } = windowData;
        
        // 1. Calculate dynamic scaling to fill perspective view (prevents background showing)
        const tiltScale = 1 + (tiltIntensity * 0.6); // 1.0x to 1.6x scaling based on tilt intensity
        const maxTilt = Math.max(Math.abs(visualRotation.rotateX), Math.abs(visualRotation.rotateZ));
        const clampedScale = Math.min(tiltScale, 1.8); // Cap at 1.8x to avoid too much zoom
        
        // 2. Apply visual CSS rotation with dynamic scaling to match device tilt
        const canvases = document.querySelectorAll('canvas');
        canvases.forEach(canvas => {
            if (canvas) {
                // Limit tilt angles to prevent edge-on view
                const clampedRotateX = Math.max(-45, Math.min(45, visualRotation.rotateX));
                const clampedRotateZ = Math.max(-45, Math.min(45, visualRotation.rotateZ));
                
                canvas.style.transform = `
                    perspective(1500px)
                    rotateX(${clampedRotateX}deg) 
                    rotateY(${visualRotation.rotateY}deg) 
                    rotateZ(${clampedRotateZ}deg)
                    scale3d(${clampedScale * perspectiveEffects.scaleX}, ${clampedScale * perspectiveEffects.scaleY}, 1)
                `;
                canvas.style.filter = `
                    brightness(${perspectiveEffects.brightness}) 
                    contrast(${perspectiveEffects.contrast})
                `;
            }
        });
        
        // 3. Add dark background overlay when tilting to hide any gaps
        const portalWindow = document.getElementById('portalWindow');
        if (portalWindow) {
            if (tiltIntensity > 0.3) {
                portalWindow.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
            } else {
                portalWindow.style.backgroundColor = 'transparent';
            }
        }
        
        // 2. Update 4D rotation parameters
        if (window.updateParameter) {
            window.updateParameter('rot4dXW', viewingAngle4D.rot4dXW);
            window.updateParameter('rot4dYW', viewingAngle4D.rot4dYW);
            window.updateParameter('rot4dZW', viewingAngle4D.rot4dZW);
        }
        
        // 3. Update window depth parameters
        if (window.updateParameter) {
            window.updateParameter('dimension', windowDepth.dimension);
            window.updateParameter('morphFactor', windowDepth.morphFactor);
            window.updateParameter('chaos', windowDepth.chaos);
            window.updateParameter('intensity', windowDepth.intensity);
            window.updateParameter('gridDensity', windowDepth.gridDensity);
        }
        
        // 4. Update body class for CSS effects
        document.body.classList.toggle('extreme-tilt', windowData.extremeTilt);
        document.body.classList.toggle('geometric-tilt-active', windowData.tiltIntensity > 0.1);
    }
    
    /**
     * Reset visual effects to normal
     */
    resetGeometricWindow() {
        // Reset canvas transforms
        const canvases = document.querySelectorAll('canvas');
        canvases.forEach(canvas => {
            if (canvas) {
                canvas.style.transform = '';
                canvas.style.filter = '';
            }
        });
        
        // Reset parameters to base values
        if (window.updateParameter) {
            window.updateParameter('rot4dXW', this.baseRotation.rot4dXW);
            window.updateParameter('rot4dYW', this.baseRotation.rot4dYW);
            window.updateParameter('rot4dZW', this.baseRotation.rot4dZW);
            window.updateParameter('dimension', this.baseParameters.dimension);
            window.updateParameter('morphFactor', this.baseParameters.morphFactor);
            window.updateParameter('chaos', this.baseParameters.chaos);
            window.updateParameter('intensity', this.baseParameters.intensity);
            window.updateParameter('gridDensity', this.baseParameters.gridDensity);
        }
        
        // Remove CSS classes
        document.body.classList.remove('extreme-tilt', 'geometric-tilt-active');
    }
    
    /**
     * Check if device orientation is supported
     */
    checkSupport() {
        this.isSupported = 'DeviceOrientationEvent' in window;
        
        if (!this.isSupported) {
            console.warn('🌐 GEOMETRIC TILT WINDOW: Not supported on this device/browser');
            return false;
        }
        
        // Check for iOS 13+ permission requirement
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            console.log('🌐 GEOMETRIC TILT WINDOW: iOS device detected - permission required');
            return 'permission-required';
        }
        
        console.log('🌐 GEOMETRIC TILT WINDOW: Supported and ready');
        return true;
    }
    
    /**
     * Request permission for iOS devices
     */
    async requestPermission() {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                const permission = await DeviceOrientationEvent.requestPermission();
                if (permission === 'granted') {
                    console.log('🌐 GEOMETRIC TILT WINDOW: iOS permission granted');
                    return true;
                } else {
                    console.warn('🌐 GEOMETRIC TILT WINDOW: iOS permission denied');
                    return false;
                }
            } catch (error) {
                console.error('🌐 GEOMETRIC TILT WINDOW: Permission request failed:', error);
                return false;
            }
        }
        return true; // Non-iOS devices don't need permission
    }
    
    /**
     * Enable geometric tilt window system
     */
    async enable() {
        if (!this.checkSupport()) {
            return false;
        }
        
        // Request permission if needed
        const hasPermission = await this.requestPermission();
        if (!hasPermission) {
            return false;
        }
        
        // Store current parameter values as base
        if (window.userParameterState) {
            this.baseRotation.rot4dXW = window.userParameterState.rot4dXW || 0;
            this.baseRotation.rot4dYW = window.userParameterState.rot4dYW || 0;
            this.baseRotation.rot4dZW = window.userParameterState.rot4dZW || 0;
            this.baseParameters.dimension = window.userParameterState.dimension || 3.5;
            this.baseParameters.morphFactor = window.userParameterState.morphFactor || 1.0;
            this.baseParameters.chaos = window.userParameterState.chaos || 0.2;
            this.baseParameters.intensity = window.userParameterState.intensity || 0.8;
            this.baseParameters.gridDensity = window.userParameterState.gridDensity || 15;
        }
        
        // Initialize smoothed values
        this.smoothedTilt = { ...this.currentTilt };
        
        window.addEventListener('deviceorientation', this.boundHandleDeviceOrientation);
        this.isEnabled = true;
        
        console.log('🌐 GEOMETRIC TILT WINDOW: Enabled - tilt device to change viewing angle!');
        console.log('🌐 Physical tilt will match visual rotation + explore 4D depth');
        
        return true;
    }
    
    /**
     * Disable geometric tilt window system
     */
    disable() {
        window.removeEventListener('deviceorientation', this.boundHandleDeviceOrientation);
        this.isEnabled = false;
        
        // Reset all visual effects
        this.resetGeometricWindow();
        
        console.log('🌐 GEOMETRIC TILT WINDOW: Disabled - reset to normal view');
    }
    
    /**
     * Handle device orientation changes with geometric window logic
     */
    handleDeviceOrientation(event) {
        if (!this.isEnabled) return;
        
        // Get raw orientation values (keep in degrees)
        const alpha = event.alpha || 0; // Z-axis (compass)
        const beta = event.beta || 0;   // X-axis (front-back)
        const gamma = event.gamma || 0; // Y-axis (left-right)
        
        // Update current tilt values
        this.currentTilt = { alpha, beta, gamma };
        
        // Apply smoothing to prevent jittery movement
        this.smoothedTilt.alpha = this.lerp(this.smoothedTilt.alpha, alpha, this.smoothing);
        this.smoothedTilt.beta = this.lerp(this.smoothedTilt.beta, beta, this.smoothing);
        this.smoothedTilt.gamma = this.lerp(this.smoothedTilt.gamma, gamma, this.smoothing);
        
        // Calculate geometric window effects
        const windowData = this.calculateGeometricWindow(
            this.smoothedTilt.alpha,
            this.smoothedTilt.beta, 
            this.smoothedTilt.gamma
        );
        
        // Apply all effects to visualization
        this.applyGeometricWindow(windowData);
        
        // Debug logging
        if (Math.random() < 0.02) { // Log occasionally to avoid spam
            console.log(`🌐 GEOMETRIC WINDOW: Tilt(${beta.toFixed(1)}°, ${gamma.toFixed(1)}°) → Visual(${windowData.visualRotation.rotateX.toFixed(1)}°, ${windowData.visualRotation.rotateZ.toFixed(1)}°) Depth:${windowData.windowDepth.depthMultiplier.toFixed(2)}x`);
        }
    }
    
    /**
     * Linear interpolation for smooth transitions
     */
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    }
    
    /**
     * Get current tilt status for UI display
     */
    getTiltStatus() {
        if (!this.isEnabled) return { enabled: false };
        
        const tiltIntensity = Math.sqrt(
            this.currentTilt.beta * this.currentTilt.beta + 
            this.currentTilt.gamma * this.currentTilt.gamma
        ) / 90;
        
        return {
            enabled: true,
            tiltIntensity: tiltIntensity,
            angles: { ...this.currentTilt },
            extremeTilt: tiltIntensity > 0.7
        };
    }
}