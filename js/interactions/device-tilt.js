/**
 * VIB34D DEVICE TILT TO 4D ROTATION SYSTEM
 * Maps device orientation to 4D rotation parameters for immersive interaction
 */

export class DeviceTiltHandler {
    constructor() {
        this.isEnabled = false;
        this.isSupported = false;
        this.sensitivity = 1.0;
        this.smoothing = 0.1; // Smoothing factor (0-1, lower = smoother)
        this.dramaticMode = false; // 🚀 NEW: Dramatic tilting mode
        
        // Current device orientation (radians)
        this.currentTilt = {
            alpha: 0, // Z-axis rotation (compass heading)
            beta: 0,  // X-axis rotation (front-back tilt)  
            gamma: 0  // Y-axis rotation (left-right tilt)
        };
        
        // 🚀 DRAMATIC TILTING: Track tilt intensity for extreme effects
        this.tiltIntensity = 0;
        this.extremeTilt = false;
        
        // Smoothed 4D rotation values
        this.smoothedRotation = {
            rot4dXW: 0,
            rot4dYW: 0,
            rot4dZW: 0
        };
        
        // Base rotation values (from presets/manual control)
        this.baseRotation = {
            rot4dXW: 0,
            rot4dYW: 0,
            rot4dZW: 0
        };
        
        // Mapping configuration
        this.mapping = {
            // 🔷 NORMAL MODE: Conservative mapping (original behavior)
            normal: {
                // Device beta (front-back tilt) -> 4D XW rotation
                betaToXW: {
                    scale: 0.01, // Radians per degree of device tilt
                    range: [-45, 45], // Degrees of device tilt to use
                    clamp: [-1.5, 1.5] // 4D rotation limits (radians)
                },
                // Device gamma (left-right tilt) -> 4D YW rotation  
                gammaToYW: {
                    scale: 0.015,
                    range: [-30, 30],
                    clamp: [-1.5, 1.5]
                },
                // Device alpha (compass heading) -> 4D ZW rotation
                alphaToZW: {
                    scale: 0.008,
                    range: [-180, 180],
                    clamp: [-2.0, 2.0]
                }
            },
            
            // 🚀 DRAMATIC MODE: 8x more sensitive with extended range
            dramatic: {
                // Device beta (front-back tilt) -> 4D XW rotation
                betaToXW: {
                    scale: 0.08, // 8x more sensitive!
                    range: [-120, 120], // Extended range for dramatic effects
                    clamp: [-6.0, 6.0] // Much wider 4D rotation limits
                },
                // Device gamma (left-right tilt) -> 4D YW rotation  
                gammaToYW: {
                    scale: 0.12, // 8x more sensitive!
                    range: [-120, 120], // Extended range
                    clamp: [-6.0, 6.0]
                },
                // Device alpha (compass heading) -> 4D ZW rotation
                alphaToZW: {
                    scale: 0.064, // 8x more sensitive!
                    range: [-180, 180],
                    clamp: [-6.0, 6.0]
                }
            }
        };
        
        this.boundHandleDeviceOrientation = this.handleDeviceOrientation.bind(this);
    }
    
    /**
     * Check if device orientation is supported
     */
    checkSupport() {
        this.isSupported = 'DeviceOrientationEvent' in window;
        
        if (!this.isSupported) {
            console.warn('🎯 DEVICE TILT: Not supported on this device/browser');
            return false;
        }
        
        // Check for iOS 13+ permission requirement
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            console.log('🎯 DEVICE TILT: iOS device detected - permission required');
            return 'permission-required';
        }
        
        console.log('🎯 DEVICE TILT: Supported and ready');
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
                    console.log('🎯 DEVICE TILT: iOS permission granted');
                    return true;
                } else {
                    console.warn('🎯 DEVICE TILT: iOS permission denied');
                    return false;
                }
            } catch (error) {
                console.error('🎯 DEVICE TILT: Permission request failed:', error);
                return false;
            }
        }
        return true; // Non-iOS devices don't need permission
    }
    
    /**
     * Enable device tilt control
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
        }
        
        // Initialize smoothed values to current base
        this.smoothedRotation = { ...this.baseRotation };
        
        window.addEventListener('deviceorientation', this.boundHandleDeviceOrientation);
        this.isEnabled = true;
        
        console.log('🎯 DEVICE TILT: Enabled - tilt your device to control 4D rotation!');
        console.log('🎯 Base rotation values:', this.baseRotation);
        
        // Show tilt UI indicator
        this.showTiltIndicator(true);
        
        return true;
    }
    
    /**
     * Disable device tilt control
     */
    disable() {
        window.removeEventListener('deviceorientation', this.boundHandleDeviceOrientation);
        this.isEnabled = false;
        
        // Reset to base rotation values
        if (window.updateParameter) {
            window.updateParameter('rot4dXW', this.baseRotation.rot4dXW);
            window.updateParameter('rot4dYW', this.baseRotation.rot4dYW);
            window.updateParameter('rot4dZW', this.baseRotation.rot4dZW);
        }
        
        console.log('🎯 DEVICE TILT: Disabled - reset to base rotation');
        
        // Hide tilt UI indicator
        this.showTiltIndicator(false);
    }
    
    /**
     * Handle device orientation changes
     */
    handleDeviceOrientation(event) {
        if (!this.isEnabled) return;
        
        // Get raw orientation values (convert to radians)
        const alpha = (event.alpha || 0) * Math.PI / 180; // Z-axis (compass)
        const beta = (event.beta || 0) * Math.PI / 180;   // X-axis (front-back)
        const gamma = (event.gamma || 0) * Math.PI / 180; // Y-axis (left-right)
        
        // Update current tilt values
        this.currentTilt = { alpha, beta, gamma };
        
        // Map device orientation to 4D rotation values
        const targetRotation = this.mapToRotation(event);
        
        // Apply smoothing to prevent jittery movement
        this.smoothedRotation.rot4dXW = this.lerp(
            this.smoothedRotation.rot4dXW,
            targetRotation.rot4dXW,
            this.smoothing
        );
        
        this.smoothedRotation.rot4dYW = this.lerp(
            this.smoothedRotation.rot4dYW,
            targetRotation.rot4dYW,
            this.smoothing
        );
        
        this.smoothedRotation.rot4dZW = this.lerp(
            this.smoothedRotation.rot4dZW,
            targetRotation.rot4dZW,
            this.smoothing
        );
        
        // Apply to visualization system
        if (window.updateParameter) {
            window.updateParameter('rot4dXW', this.smoothedRotation.rot4dXW);
            window.updateParameter('rot4dYW', this.smoothedRotation.rot4dYW);
            window.updateParameter('rot4dZW', this.smoothedRotation.rot4dZW);
        }
        
        // Update UI display if available
        this.updateTiltDisplay();
    }
    
    /**
     * Map device orientation to 4D rotation parameters
     */
    mapToRotation(event) {
        const betaDeg = event.beta || 0;  // Front-back tilt (-180 to 180)
        const gammaDeg = event.gamma || 0; // Left-right tilt (-90 to 90)
        const alphaDeg = event.alpha || 0; // Compass heading (0 to 360)
        
        // 🚀 DRAMATIC MODE: Choose mapping configuration
        const activeMapping = this.dramaticMode ? this.mapping.dramatic : this.mapping.normal;
        
        // 🚀 CALCULATE TILT INTENSITY for dramatic effects
        const betaNorm = Math.max(-120, Math.min(120, betaDeg));
        const gammaNorm = Math.max(-120, Math.min(120, gammaDeg));
        this.tiltIntensity = Math.sqrt(betaNorm*betaNorm + gammaNorm*gammaNorm) / 90;
        this.extremeTilt = this.tiltIntensity > 1.0;
        
        // Map beta (front-back tilt) to XW rotation
        const betaClamped = Math.max(activeMapping.betaToXW.range[0], 
            Math.min(activeMapping.betaToXW.range[1], betaDeg));
        const rot4dXW = this.baseRotation.rot4dXW + 
            (betaClamped * activeMapping.betaToXW.scale * this.sensitivity);
        
        // Map gamma (left-right tilt) to YW rotation
        const gammaClamped = Math.max(activeMapping.gammaToYW.range[0],
            Math.min(activeMapping.gammaToYW.range[1], gammaDeg));
        const rot4dYW = this.baseRotation.rot4dYW + 
            (gammaClamped * activeMapping.gammaToYW.scale * this.sensitivity);
        
        // Map alpha (compass) to ZW rotation
        let alphaNormalized = alphaDeg;
        if (alphaNormalized > 180) alphaNormalized -= 360; // Normalize to -180 to 180
        const alphaClamped = Math.max(activeMapping.alphaToZW.range[0],
            Math.min(activeMapping.alphaToZW.range[1], alphaNormalized));
        const rot4dZW = this.baseRotation.rot4dZW + 
            (alphaClamped * activeMapping.alphaToZW.scale * this.sensitivity);
        
        // Apply final clamping to prevent extreme values
        return {
            rot4dXW: Math.max(activeMapping.betaToXW.clamp[0],
                Math.min(activeMapping.betaToXW.clamp[1], rot4dXW)),
            rot4dYW: Math.max(activeMapping.gammaToYW.clamp[0],
                Math.min(activeMapping.gammaToYW.clamp[1], rot4dYW)),
            rot4dZW: Math.max(activeMapping.alphaToZW.clamp[0],
                Math.min(activeMapping.alphaToZW.clamp[1], rot4dZW))
        };
    }
    
    /**
     * Linear interpolation for smooth transitions
     */
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    }
    
    /**
     * Update base rotation values (from preset loading or manual adjustment)
     */
    updateBaseRotation(rot4dXW, rot4dYW, rot4dZW) {
        this.baseRotation.rot4dXW = rot4dXW || 0;
        this.baseRotation.rot4dYW = rot4dYW || 0;
        this.baseRotation.rot4dZW = rot4dZW || 0;
        
        console.log('🎯 DEVICE TILT: Base rotation updated:', this.baseRotation);
    }
    
    /**
     * Set tilt sensitivity (0.1 to 3.0)
     */
    setSensitivity(value) {
        this.sensitivity = Math.max(0.1, Math.min(3.0, value));
        console.log(`🎯 DEVICE TILT: Sensitivity set to ${this.sensitivity}`);
    }
    
    /**
     * Set smoothing factor (0.01 to 1.0)
     */
    setSmoothing(value) {
        this.smoothing = Math.max(0.01, Math.min(1.0, value));
        console.log(`🎯 DEVICE TILT: Smoothing set to ${this.smoothing}`);
    }
    
    /**
     * 🚀 Enable/disable dramatic tilting mode
     */
    setDramaticMode(enabled) {
        this.dramaticMode = enabled;
        console.log(`🚀 DEVICE TILT: Dramatic mode ${enabled ? 'ENABLED - 8x more sensitive!' : 'disabled - normal sensitivity'}`);
        
        // Update UI indicator to show mode
        this.updateTiltModeDisplay();
        
        // If dramatic mode is enabled and tilt is active, show warning about extreme effects
        if (enabled && this.isEnabled) {
            console.log('⚠️ DRAMATIC TILTING ACTIVE: Tilt your device carefully - effects are 8x more intense!');
        }
    }
    
    /**
     * 🚀 Toggle dramatic tilting mode
     */
    toggleDramaticMode() {
        this.setDramaticMode(!this.dramaticMode);
        return this.dramaticMode;
    }
    
    /**
     * Show/hide tilt indicator UI
     */
    showTiltIndicator(show) {
        let indicator = document.getElementById('tilt-indicator');
        
        if (show && !indicator) {
            // Create tilt indicator
            indicator = document.createElement('div');
            indicator.id = 'tilt-indicator';
            indicator.innerHTML = `
                <div class="tilt-status">
                    <div class="tilt-icon">📱</div>
                    <div class="tilt-text">4D Tilt Active</div>
                    <div class="tilt-mode" id="tilt-mode">NORMAL MODE</div>
                    <div class="tilt-values">
                        <span id="tilt-xw">XW: 0.00</span>
                        <span id="tilt-yw">YW: 0.00</span>
                        <span id="tilt-zw">ZW: 0.00</span>
                        <span id="tilt-intensity">Intensity: 0.00</span>
                    </div>
                </div>
            `;
            
            indicator.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: rgba(0, 0, 0, 0.8);
                color: #0ff;
                padding: 8px 12px;
                border-radius: 8px;
                font-family: 'Orbitron', monospace;
                font-size: 11px;
                z-index: 10000;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(0, 255, 255, 0.3);
                box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);
            `;
            
            document.body.appendChild(indicator);
        } else if (!show && indicator) {
            // Remove tilt indicator
            indicator.remove();
        }
    }
    
    /**
     * Update tilt display values
     */
    updateTiltDisplay() {
        const xwDisplay = document.getElementById('tilt-xw');
        const ywDisplay = document.getElementById('tilt-yw');
        const zwDisplay = document.getElementById('tilt-zw');
        const intensityDisplay = document.getElementById('tilt-intensity');
        
        if (xwDisplay) xwDisplay.textContent = `XW: ${this.smoothedRotation.rot4dXW.toFixed(2)}`;
        if (ywDisplay) ywDisplay.textContent = `YW: ${this.smoothedRotation.rot4dYW.toFixed(2)}`;
        if (zwDisplay) zwDisplay.textContent = `ZW: ${this.smoothedRotation.rot4dZW.toFixed(2)}`;
        if (intensityDisplay) {
            intensityDisplay.textContent = `Intensity: ${this.tiltIntensity.toFixed(2)}`;
            // 🚀 Color intensity display based on extreme tilt
            intensityDisplay.style.color = this.extremeTilt ? '#ff4444' : '#0ff';
        }
    }
    
    /**
     * 🚀 Update tilt mode display
     */
    updateTiltModeDisplay() {
        const modeDisplay = document.getElementById('tilt-mode');
        if (modeDisplay) {
            modeDisplay.textContent = this.dramaticMode ? '🚀 DRAMATIC MODE' : 'NORMAL MODE';
            modeDisplay.style.color = this.dramaticMode ? '#ff4444' : '#0ff';
            modeDisplay.style.fontWeight = this.dramaticMode ? 'bold' : 'normal';
        }
    }
    
    /**
     * Get current tilt status
     */
    getStatus() {
        return {
            isSupported: this.isSupported,
            isEnabled: this.isEnabled,
            sensitivity: this.sensitivity,
            smoothing: this.smoothing,
            currentTilt: { ...this.currentTilt },
            smoothedRotation: { ...this.smoothedRotation },
            baseRotation: { ...this.baseRotation }
        };
    }
}

// Create global instance with enhanced toggle function
if (typeof window !== 'undefined') {
    window.deviceTiltHandler = new DeviceTiltHandler();
    
    // Add to global functions for UI integration
    window.enableDeviceTilt = async () => {
        return await window.deviceTiltHandler.enable();
    };
    
    window.disableDeviceTilt = () => {
        window.deviceTiltHandler.disable();
    };
    
    // Enhanced toggle function that forces interactivity to mouse movement mode
    window.toggleDeviceTilt = async () => {
        const tiltBtn = document.getElementById('tiltBtn');
        
        if (window.deviceTiltHandler.isEnabled) {
            // Disable tilt
            window.deviceTiltHandler.disable();
            if (tiltBtn) {
                tiltBtn.style.background = '';
                tiltBtn.style.color = '';
                tiltBtn.title = 'Device Tilt (4D Rotation)';
            }
            console.log('🎯 Device tilt disabled');
            return false;
        } else {
            // Enable tilt AND force interactivity to mouse movement mode
            const enabled = await window.deviceTiltHandler.enable();
            if (enabled) {
                // FORCE the interactivity system to mouse movement mode (same as device tilt behavior)
                if (window.interactivityMenu && window.interactivityMenu.engine) {
                    // Force to mouse/touch mode since tilt = mouse movement behavior
                    window.interactivityMenu.engine.setActiveInputMode('mouse/touch');
                    console.log('🎯 Forced interactivity to mouse/touch mode (matches tilt behavior)');
                    
                    // ✅ NEW: Update menu display to show the mode change
                    setTimeout(() => {
                        if (window.interactivityMenu.updateInputSources) {
                            window.interactivityMenu.updateInputSources();
                        }
                    }, 100);
                }
                
                // ✅ NEW: Ensure interactivity is enabled when tilt is enabled
                if (window.interactivityEnabled !== undefined) {
                    window.interactivityEnabled = true;
                    const interactBtn = document.querySelector('[onclick="toggleInteractivity()"]');
                    if (interactBtn) {
                        interactBtn.style.background = 'rgba(0, 255, 0, 0.3)';
                        interactBtn.style.borderColor = '#00ff00';
                        interactBtn.title = 'Mouse/Touch Interactions: ON (Auto-enabled by tilt)';
                    }
                }
                
                if (tiltBtn) {
                    tiltBtn.style.background = 'linear-gradient(45deg, #00ffff, #0099ff)';
                    tiltBtn.style.color = '#000';
                    tiltBtn.title = 'Device Tilt Active + Mouse Movement Mode - Both work together!';
                }
                console.log('🎯 Device tilt enabled');
                console.log('🖱️ Interactivity forced to mouse movement mode (compatible with tilt)');
                return true;
            } else {
                console.warn('🎯 Device tilt failed to enable - permission may be required');
                if (tiltBtn) {
                    tiltBtn.style.background = 'rgba(255, 0, 0, 0.3)';
                    tiltBtn.title = 'Device Tilt (Permission Required - Click to try again)';
                }
                return false;
            }
        }
    };
    
    window.setTiltSensitivity = (value) => {
        window.deviceTiltHandler.setSensitivity(value);
    };
    
    // 🚀 NEW: Dramatic tilting mode functions
    window.setDramaticTilting = (enabled) => {
        window.deviceTiltHandler.setDramaticMode(enabled);
    };
    
    window.toggleDramaticTilting = () => {
        return window.deviceTiltHandler.toggleDramaticMode();
    };
    
    // 🚀 NEW: Enhanced toggle that can enable dramatic mode
    window.toggleDeviceTiltDramatic = async () => {
        if (!window.deviceTiltHandler.isEnabled) {
            // First enable tilt
            const enabled = await window.toggleDeviceTilt();
            if (enabled) {
                // Then enable dramatic mode
                window.deviceTiltHandler.setDramaticMode(true);
                console.log('🚀 DRAMATIC TILTING ENABLED: 8x more sensitive! Tilt carefully!');
                
                const tiltBtn = document.getElementById('tiltBtn');
                if (tiltBtn) {
                    tiltBtn.style.background = 'linear-gradient(45deg, #ff4444, #ff0080)';
                    tiltBtn.title = '🚀 DRAMATIC 4D Tilt Active - 8x More Sensitive!';
                }
            }
            return enabled;
        } else {
            // Toggle dramatic mode if tilt is already enabled
            const dramatic = window.deviceTiltHandler.toggleDramaticMode();
            const tiltBtn = document.getElementById('tiltBtn');
            if (tiltBtn) {
                if (dramatic) {
                    tiltBtn.style.background = 'linear-gradient(45deg, #ff4444, #ff0080)';
                    tiltBtn.title = '🚀 DRAMATIC 4D Tilt Active - 8x More Sensitive!';
                } else {
                    tiltBtn.style.background = 'linear-gradient(45deg, #00ffff, #0099ff)';
                    tiltBtn.title = 'Device Tilt Active - Normal Sensitivity';
                }
            }
            return dramatic;
        }
    };
    
    console.log('🎯 DEVICE TILT: System loaded with DRAMATIC MODE support! 🚀');
}

export default DeviceTiltHandler;