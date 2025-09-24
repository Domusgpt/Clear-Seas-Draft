/**
 * Unified Reactivity Manager for VIB34D
 * Handles reactivity parameters for all 4 systems consistently
 * Ensures perfect integration between engine → gallery → viewer
 */

export class UnifiedReactivityManager {
    constructor() {
        this.currentSystem = 'faceted';
        this.reactivityState = {
            mouse: { faceted: true, quantum: false, holographic: false, polychora: false, mixed: false },
            click: { faceted: true, quantum: false, holographic: false, polychora: false, mixed: false },
            scroll: { faceted: true, quantum: false, holographic: false, polychora: false, mixed: false },
            audio: false,
            interactivity: true,
            deviceTilt: false
        };
        
        // Global accessibility
        window.unifiedReactivityManager = this;
        this.setupGlobalFunctions();
    }
    
    setupGlobalFunctions() {
        // Make reactivity functions globally available for all contexts
        window.getCurrentReactivityState = () => this.getCurrentState();
        window.setReactivityState = (state) => this.setState(state);
        window.resetReactivityToDefaults = (system) => this.resetToDefaults(system);
        window.syncReactivityToSystem = (system) => this.syncToSystem(system);
    }
    
    getCurrentState() {
        // Enhanced state capture for all 4 systems
        const state = {
            system: this.currentSystem,
            mouse: { ...this.reactivityState.mouse },
            click: { ...this.reactivityState.click },
            scroll: { ...this.reactivityState.scroll },
            audio: this.reactivityState.audio,
            interactivity: this.reactivityState.interactivity,
            deviceTilt: this.reactivityState.deviceTilt,
            
            // Additional metadata for perfect replication
            metadata: {
                timestamp: Date.now(),
                audioEnabled: window.audioEnabled || false,
                interactivityEnabled: window.interactivityEnabled !== false,
                deviceTiltEnabled: window.deviceTiltHandler?.isEnabled || false,
                userAgent: navigator.userAgent.substr(0, 50) // Mobile detection
            }
        };
        
        console.log('🔵 Reactivity state captured:', state);
        return state;
    }
    
    setState(state) {
        if (!state) return false;
        
        console.log('🔵 Setting reactivity state:', state);
        
        // Update internal state
        if (state.system) this.currentSystem = state.system;
        if (state.mouse) this.reactivityState.mouse = { ...state.mouse };
        if (state.click) this.reactivityState.click = { ...state.click };
        if (state.scroll) this.reactivityState.scroll = { ...state.scroll };
        if (typeof state.audio === 'boolean') this.reactivityState.audio = state.audio;
        if (typeof state.interactivity === 'boolean') this.reactivityState.interactivity = state.interactivity;
        if (typeof state.deviceTilt === 'boolean') this.reactivityState.deviceTilt = state.deviceTilt;
        
        // Apply to global state
        this.syncToGlobals();
        
        // Apply to UI if available
        this.syncToUI();
        
        return true;
    }
    
    resetToDefaults(system) {
        console.log(`🎛️ Resetting reactivity to ${system} defaults`);
        
        // Clear all current selections
        Object.keys(this.reactivityState.mouse).forEach(key => {
            this.reactivityState.mouse[key] = false;
            this.reactivityState.click[key] = false;
            this.reactivityState.scroll[key] = false;
        });
        
        // Set system-specific defaults
        const defaults = {
            faceted: { mouse: 'faceted', click: 'faceted', scroll: 'faceted' },
            quantum: { mouse: 'quantum', click: 'quantum', scroll: 'quantum' },
            holographic: { mouse: 'holographic', click: 'holographic', scroll: 'holographic' },
            polychora: { mouse: 'polychora', click: 'polychora', scroll: 'faceted' } // Polychora uses faceted scroll
        };
        
        const systemDefaults = defaults[system] || defaults.faceted;
        
        this.reactivityState.mouse[systemDefaults.mouse] = true;
        this.reactivityState.click[systemDefaults.click] = true;
        this.reactivityState.scroll[systemDefaults.scroll] = true;
        
        // Audio defaults
        this.reactivityState.audio = system === 'holographic';
        
        this.currentSystem = system;
        this.syncToGlobals();
        this.syncToUI();
    }
    
    syncToSystem(system) {
        this.currentSystem = system;
        
        // Ensure the active system has appropriate reactivity
        if (!this.hasAnyReactivity(system)) {
            this.resetToDefaults(system);
        } else {
            this.syncToGlobals();
        }
    }
    
    hasAnyReactivity(system) {
        return this.reactivityState.mouse[system] || 
               this.reactivityState.click[system] || 
               this.reactivityState.scroll[system];
    }
    
    syncToGlobals() {
        // Sync to window globals for engine integration
        window.audioEnabled = this.reactivityState.audio;
        window.interactivityEnabled = this.reactivityState.interactivity;
        
        // Device tilt integration
        if (this.reactivityState.deviceTilt && window.deviceTiltHandler) {
            if (!window.deviceTiltHandler.isEnabled) {
                window.deviceTiltHandler.enable();
            }
        } else if (!this.reactivityState.deviceTilt && window.deviceTiltHandler?.isEnabled) {
            window.deviceTiltHandler.disable();
        }
        
        // Update ReactivityManager if available
        if (window.reactivityManager) {
            window.reactivityManager.updateReactivityState(this.getCurrentState());
        }
    }
    
    syncToUI() {
        // Sync checkboxes if they exist (for gallery/viewer contexts)
        ['faceted', 'quantum', 'holographic', 'polychora', 'mixed'].forEach(system => {
            const mouseCheckbox = document.getElementById(`${system}Mouse`);
            const clickCheckbox = document.getElementById(`${system}Click`);
            const scrollCheckbox = document.getElementById(`${system}Scroll`);
            
            if (mouseCheckbox) mouseCheckbox.checked = this.reactivityState.mouse[system];
            if (clickCheckbox) clickCheckbox.checked = this.reactivityState.click[system];
            if (scrollCheckbox) scrollCheckbox.checked = this.reactivityState.scroll[system];
        });
        
        // Sync toggle buttons
        const audioToggle = document.getElementById('audioToggle');
        const tiltToggle = document.getElementById('deviceTiltToggle');
        
        if (audioToggle) audioToggle.textContent = this.reactivityState.audio ? '🎵 Audio ON' : '🔇 Audio OFF';
        if (tiltToggle) tiltToggle.textContent = this.reactivityState.deviceTilt ? '📱 Tilt ON' : '📱 Tilt OFF';
    }
    
    // System-specific parameter integration
    getSystemParameterOverrides(system) {
        const overrides = {};
        
        // Add reactivity-influenced parameters
        if (this.reactivityState.audio && (system === 'holographic' || system === 'quantum')) {
            overrides.audioReactive = true;
        }
        
        if (this.reactivityState.deviceTilt) {
            overrides.deviceTiltEnabled = true;
        }
        
        // Mouse interaction influence
        if (this.reactivityState.mouse[system] || this.reactivityState.mouse.mixed) {
            overrides.mouseInteractionEnabled = true;
        }
        
        return overrides;
    }
    
    // For save/load integration
    toJSON() {
        return {
            reactivityState: this.getCurrentState(),
            version: '1.0',
            timestamp: Date.now()
        };
    }
    
    fromJSON(data) {
        if (data.reactivityState) {
            this.setState(data.reactivityState);
            return true;
        }
        return false;
    }
}

// Global instantiation
window.UnifiedReactivityManager = UnifiedReactivityManager;