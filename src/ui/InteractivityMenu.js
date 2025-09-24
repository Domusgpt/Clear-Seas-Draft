/**
 * Interactivity Menu System
 * Visual interface for Universal Interactivity Engine
 * Shows real-time input data and parameter mappings
 */

export class InteractivityMenu {
    constructor(interactivityEngine) {
        this.engine = interactivityEngine;
        this.isVisible = false;
        this.menuContainer = null;
        this.updateInterval = null;
        
        this.createMenu();
        this.bindEvents();
        
        console.log('🎛️ Interactivity Menu initialized');
    }
    
    /**
     * Create the interactivity menu UI
     */
    createMenu() {
        // Create menu container
        this.menuContainer = document.createElement('div');
        this.menuContainer.id = 'interactivity-menu';
        this.menuContainer.innerHTML = `
            <style>
                #interactivity-menu {
                    position: fixed;
                    top: 50px;
                    right: 20px;
                    width: 350px;
                    background: rgba(0, 0, 0, 0.9);
                    border: 2px solid #00ffff;
                    border-radius: 10px;
                    padding: 20px;
                    font-family: 'Orbitron', monospace;
                    font-size: 0.8rem;
                    color: #00ffff;
                    z-index: 2000;
                    display: none;
                    backdrop-filter: blur(10px);
                    box-shadow: 0 0 30px rgba(0, 255, 255, 0.3);
                }
                
                .interactivity-header {
                    text-align: center;
                    margin-bottom: 20px;
                    font-size: 1rem;
                    color: #ff00ff;
                    text-shadow: 0 0 10px #ff00ff;
                }
                
                .input-source {
                    background: rgba(0, 255, 255, 0.1);
                    border: 1px solid rgba(0, 255, 255, 0.3);
                    border-radius: 5px;
                    padding: 10px;
                    margin-bottom: 10px;
                }
                
                .source-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 5px;
                }
                
                .source-name {
                    font-weight: bold;
                    color: #00ff00;
                }
                
                .source-status {
                    padding: 2px 6px;
                    border-radius: 3px;
                    font-size: 0.7rem;
                    font-weight: bold;
                }
                
                .status-active {
                    background: #00ff00;
                    color: #000;
                }
                
                .status-inactive {
                    background: #ff6600;
                    color: #fff;
                }
                
                .reactive-bands {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 5px;
                    margin-top: 5px;
                }
                
                .reactive-band {
                    display: flex;
                    flex-direction: column;
                    font-size: 0.7rem;
                }
                
                .band-label {
                    color: #ffff00;
                    margin-bottom: 2px;
                }
                
                .band-bar {
                    height: 6px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 3px;
                    overflow: hidden;
                }
                
                .band-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #00ff00, #ffff00, #ff0000);
                    width: 0%;
                    transition: width 0.1s ease;
                }
                
                .parameter-mappings {
                    margin-top: 15px;
                    padding-top: 15px;
                    border-top: 1px solid rgba(0, 255, 255, 0.3);
                }
                
                .mapping-header {
                    color: #ff00ff;
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                
                .parameter-mapping {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 3px 0;
                    font-size: 0.7rem;
                }
                
                .param-name {
                    color: #ffff00;
                }
                
                .param-value {
                    color: #00ff00;
                    font-family: 'Courier New', monospace;
                }
                
                .performance-stats {
                    margin-top: 15px;
                    padding-top: 15px;
                    border-top: 1px solid rgba(0, 255, 255, 0.3);
                    font-size: 0.7rem;
                }
                
                .perf-stat {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 3px;
                }
                
                .toggle-btn {
                    background: rgba(255, 0, 255, 0.2);
                    border: 1px solid #ff00ff;
                    color: #ff00ff;
                    padding: 5px 10px;
                    border-radius: 3px;
                    cursor: pointer;
                    font-size: 0.7rem;
                    transition: all 0.3s;
                }
                
                .toggle-btn:hover {
                    background: rgba(255, 0, 255, 0.4);
                }
                
                .toggle-btn.active {
                    background: #ff00ff;
                    color: #000;
                }
            </style>
            
            <div class="interactivity-header">
                🎛️ UNIVERSAL INTERACTIVITY ENGINE
            </div>
            
            <div id="input-sources">
                <!-- Input sources will be dynamically populated -->
            </div>
            
            <div class="parameter-mappings">
                <div class="mapping-header">📊 PARAMETER MAPPINGS</div>
                <div id="parameter-values">
                    <!-- Parameter values will be dynamically updated -->
                </div>
            </div>
            
            <div class="performance-stats">
                <div class="mapping-header">⚡ PERFORMANCE</div>
                <div id="performance-data">
                    <!-- Performance stats will be updated -->
                </div>
            </div>
        `;
        
        document.body.appendChild(this.menuContainer);
    }
    
    /**
     * Show the interactivity menu
     */
    show() {
        this.isVisible = true;
        this.menuContainer.style.display = 'block';
        this.startUpdates();
        console.log('🎛️ Interactivity Menu shown');
    }
    
    /**
     * Hide the interactivity menu
     */
    hide() {
        this.isVisible = false;
        this.menuContainer.style.display = 'none';
        this.stopUpdates();
        console.log('🎛️ Interactivity Menu hidden');
    }
    
    /**
     * Toggle menu visibility
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
    
    /**
     * Bind keyboard events
     */
    bindEvents() {
        document.addEventListener('keydown', (e) => {
            // Toggle with I key (when not typing in inputs)
            if (e.key === 'i' || e.key === 'I') {
                if (!['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
                    e.preventDefault();
                    this.toggle();
                }
            }
        });
    }
    
    /**
     * Start real-time updates
     */
    startUpdates() {
        if (this.updateInterval) return;
        
        this.updateInterval = setInterval(() => {
            this.updateInputSources();
            this.updateParameterMappings();
            this.updatePerformanceStats();
        }, 100); // Update 10 times per second
    }
    
    /**
     * Stop real-time updates
     */
    stopUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
    
    /**
     * Update input sources display
     */
    updateInputSources() {
        const sourcesContainer = document.getElementById('input-sources');
        const reactiveBands = this.engine.getReactiveBands();
        const activeInputs = this.engine.activeInputs;
        
        let sourcesHTML = '';
        
        // Audio sources
        if (activeInputs.has('audio')) {
            sourcesHTML += this.createSourceHTML('audio', '🎵 Audio Input', true, {
                'Bass': reactiveBands.audio.bass,
                'Mid': reactiveBands.audio.mid,
                'High': reactiveBands.audio.high,
                'Energy': reactiveBands.audio.energy
            });
        }
        
        // Mouse/Touch sources
        if (activeInputs.has('mouse/touch')) {
            sourcesHTML += this.createSourceHTML('mouseTouch', '🖱️ Mouse/Touch', true, {
                'Movement': reactiveBands.movement.smoothed,
                'Velocity': reactiveBands.velocity.smoothed,
                'Precision': reactiveBands.precision.smoothed
            });
        }
        
        // Keyboard sources
        if (activeInputs.has('keyboard')) {
            sourcesHTML += this.createSourceHTML('keyboard', '⌨️ Keyboard', true, {
                'Typing Rate': reactiveBands.ui.typing.velocity || 0,
                'Rhythm': reactiveBands.ui.typing.rhythm || 0
            });
        }
        
        // Gamepad sources
        if (activeInputs.has('gamepad')) {
            sourcesHTML += this.createSourceHTML('gamepad', '🎮 Gamepad', true, {
                'Pressure': reactiveBands.gamepad.pressure,
                'Left X': Math.abs(reactiveBands.gamepad.axes[0] || 0),
                'Left Y': Math.abs(reactiveBands.gamepad.axes[1] || 0),
                'Right X': Math.abs(reactiveBands.gamepad.axes[2] || 0)
            });
        }
        
        // Device orientation
        if (activeInputs.has('device-orientation')) {
            sourcesHTML += this.createSourceHTML('wearable', '⌚ Device Sensors', true, {
                'Tilt X': Math.abs(reactiveBands.wearable.tilt.x),
                'Tilt Y': Math.abs(reactiveBands.wearable.tilt.y),
                'Motion': reactiveBands.wearable.motion
            });
        }
        
        // UI interactions
        if (activeInputs.has('ui')) {
            sourcesHTML += this.createSourceHTML('ui', '🖥️ UI Interactions', true, {
                'Scroll': reactiveBands.ui.scroll || 0,
                'Click': reactiveBands.ui.click || 0,
                'Hover': reactiveBands.ui.hover || 0
            });
        }
        
        sourcesContainer.innerHTML = sourcesHTML;
    }
    
    /**
     * Create HTML for an input source
     */
    createSourceHTML(sourceId, sourceName, isActive, bands) {
        const statusClass = isActive ? 'status-active' : 'status-inactive';
        const statusText = isActive ? 'ACTIVE' : 'INACTIVE';
        
        let bandsHTML = '';
        for (const [name, value] of Object.entries(bands)) {
            const percentage = Math.min(100, Math.max(0, value * 100));
            bandsHTML += `
                <div class="reactive-band">
                    <div class="band-label">${name}</div>
                    <div class="band-bar">
                        <div class="band-fill" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="input-source">
                <div class="source-header">
                    <span class="source-name">${sourceName}</span>
                    <span class="source-status ${statusClass}">${statusText}</span>
                </div>
                <div class="reactive-bands">
                    ${bandsHTML}
                </div>
            </div>
        `;
    }
    
    /**
     * Update parameter mappings display
     */
    updateParameterMappings() {
        const parametersContainer = document.getElementById('parameter-values');
        
        const parameters = [
            'rot4dXW', 'rot4dYW', 'rot4dZW', 
            'speed', 'hue', 'gridDensity', 
            'morphFactor', 'chaos'
        ];
        
        let parametersHTML = '';
        for (const param of parameters) {
            const value = this.engine.getParameterValue(param);
            if (value !== null) {
                parametersHTML += `
                    <div class="parameter-mapping">
                        <span class="param-name">${param}</span>
                        <span class="param-value">${value.toFixed(2)}</span>
                    </div>
                `;
            }
        }
        
        parametersContainer.innerHTML = parametersHTML;
    }
    
    /**
     * Update performance statistics display
     */
    updatePerformanceStats() {
        const performanceContainer = document.getElementById('performance-data');
        const stats = this.engine.getPerformanceStats();
        
        const performanceHTML = `
            <div class="perf-stat">
                <span>Update Rate:</span>
                <span>${stats.updateRate.toFixed(1)} Hz</span>
            </div>
            <div class="perf-stat">
                <span>Processing Time:</span>
                <span>${stats.processingTime.toFixed(2)} ms</span>
            </div>
            <div class="perf-stat">
                <span>Active Sources:</span>
                <span>${stats.totalSources}</span>
            </div>
            <div class="perf-stat">
                <span>Input Latency:</span>
                <span>${stats.inputLatency.toFixed(1)} ms</span>
            </div>
        `;
        
        performanceContainer.innerHTML = performanceHTML;
    }
    
    /**
     * Add custom parameter mapping
     */
    addCustomMapping(parameterName, sourcePath, range = [0, 1], smoothing = 0.5) {
        this.engine.parameterMappings[parameterName] = {
            sources: [sourcePath],
            range: range,
            smoothing: smoothing
        };
        
        console.log(`🎛️ Added custom mapping: ${parameterName} <- ${sourcePath}`);
    }
    
    /**
     * Remove parameter mapping
     */
    removeMapping(parameterName) {
        delete this.engine.parameterMappings[parameterName];
        console.log(`🎛️ Removed mapping: ${parameterName}`);
    }
    
    /**
     * Export current configuration
     */
    exportConfiguration() {
        const config = {
            parameterMappings: this.engine.parameterMappings,
            activeInputs: Array.from(this.engine.activeInputs),
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(config, null, 2)], { 
            type: 'application/json' 
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'vib34d-interactivity-config.json';
        a.click();
        URL.revokeObjectURL(url);
        
        console.log('🎛️ Configuration exported');
    }
    
    /**
     * Import configuration
     */
    async importConfiguration(file) {
        try {
            const text = await file.text();
            const config = JSON.parse(text);
            
            if (config.parameterMappings) {
                this.engine.parameterMappings = config.parameterMappings;
                console.log('🎛️ Configuration imported successfully');
                return true;
            }
        } catch (error) {
            console.error('🎛️ Failed to import configuration:', error);
        }
        
        return false;
    }
    
    /**
     * Destroy the menu
     */
    destroy() {
        this.stopUpdates();
        if (this.menuContainer) {
            this.menuContainer.remove();
            this.menuContainer = null;
        }
        console.log('🧹 Interactivity Menu destroyed');
    }
}