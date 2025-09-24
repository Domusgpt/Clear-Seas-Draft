/**
 * VIB34D UI Handlers Module
 * Parameter controls, randomization, reset functions, and interactivity management
 * Extracted from monolithic index.html for clean architecture
 */

// Global state variables
let audioEnabled = window.audioEnabled || false;
let interactivityEnabled = false;

/**
 * Main parameter update function - CRITICAL for all visualizers
 * Routes parameters to appropriate engine based on current system
 */
window.updateParameter = function(param, value) {
    // CRITICAL: Store user's parameter choice for persistence
    window.userParameterState[param] = parseFloat(value);
    
    // GALLERY PERFORMANCE FIX: Reduce parameter logging spam in gallery context
    if (!window.isGalleryPreview) {
        console.log(`💾 User parameter: ${param} = ${value}`);
    }
    
    const displays = {
        rot4dXW: 'xwValue',
        rot4dYW: 'ywValue', 
        rot4dZW: 'zwValue',
        gridDensity: 'densityValue',
        morphFactor: 'morphValue',
        chaos: 'chaosValue',
        speed: 'speedValue',
        hue: 'hueValue',
        intensity: 'intensityValue',
        saturation: 'saturationValue'
    };
    
    const display = document.getElementById(displays[param]);
    if (display) {
        if (param === 'hue') {
            display.textContent = value + '°';
        } else if (param.startsWith('rot4d')) {
            display.textContent = parseFloat(value).toFixed(2);
        } else {
            display.textContent = parseFloat(value).toFixed(1);
        }
    }
    
    // SURGICAL FIX: Unified parameter router - eliminates scope confusion
    try {
        const activeSystem = window.currentSystem || 'faceted';
        const engines = {
            faceted: window.engine,
            quantum: window.quantumEngine,
            holographic: window.holographicSystem,
            polychora: window.polychoraSystem
        };
        
        const engine = engines[activeSystem];
        if (!engine) {
            console.warn(`⚠️ System ${activeSystem} not available - engines:`, Object.keys(engines).map(k => `${k}:${!!engines[k]}`).join(', '));
            
            // CRITICAL FIX: Track retry count to prevent infinite loops
            if (!window.parameterRetryCount) window.parameterRetryCount = {};
            const retryKey = `${param}_${value}_${activeSystem}`;
            const currentRetries = window.parameterRetryCount[retryKey] || 0;
            
            // Only retry once, then give up to prevent infinite loops
            if (currentRetries < 1) {
                window.parameterRetryCount[retryKey] = currentRetries + 1;
                console.log(`🔄 Retrying parameter ${param} = ${value} for ${activeSystem} (attempt ${currentRetries + 2})`);
                setTimeout(() => {
                    window.updateParameter(param, value);
                }, 100);
            } else {
                console.warn(`❌ Parameter ${param} = ${value} failed for ${activeSystem} - system not available, giving up after 2 attempts`);
                // Clean up retry tracking for this parameter
                delete window.parameterRetryCount[retryKey];
            }
            return;
        }
        
        // Route to appropriate engine method
        if (activeSystem === 'faceted') {
            engine.parameterManager.setParameter(param, parseFloat(value));
            engine.updateVisualizers();
        } else if (activeSystem === 'quantum') {
            engine.updateParameter(param, parseFloat(value));
        } else if (activeSystem === 'holographic') {
            engine.updateParameter(param, parseFloat(value));
        } else if (activeSystem === 'polychora') {
            engine.updateParameters({ [param]: parseFloat(value) });
        }
        
        // GALLERY PERFORMANCE FIX: Reduce engine parameter logging spam in gallery context
        if (!window.isGalleryPreview) {
            console.log(`📊 ${activeSystem.toUpperCase()}: ${param} = ${value}`);
        }
        
    } catch (error) {
        console.error(`❌ Parameter update error in ${window.currentSystem || 'unknown'} for ${param}:`, error);
        // Don't break the UI, just log the error
    }
};

/**
 * Randomize all parameters except hue and geometry
 */
window.randomizeAll = function() {
    // Randomize ONLY parameters (NO hue, NO geometry)
    randomizeParameters();
};

/**
 * Full randomization: parameters + geometry + hue
 */
window.randomizeEverything = function() {
    // Full randomization: parameters + geometry + hue
    randomizeParameters();
    setTimeout(() => randomizeGeometryAndHue(), 10);
};

/**
 * Randomize parameters excluding hue
 */
function randomizeParameters() {
    // Randomize all parameters EXCEPT hue and geometry
    const skipParams = ['hue'];
    
    document.querySelectorAll('.control-slider').forEach(slider => {
        const paramName = slider.id;
        if (!skipParams.includes(paramName)) {
            const min = parseFloat(slider.min);
            const max = parseFloat(slider.max);
            const value = Math.random() * (max - min) + min;
            slider.value = value;
            slider.oninput();
        }
    });
    
    console.log('🎲 Parameters randomized (NO hue, NO geometry)');
}

/**
 * Randomize geometry selection and hue value
 */
function randomizeGeometryAndHue() {
    // Randomize geometry selection
    if (window.currentSystem !== 'holographic') {
        const geometryCount = window.geometries?.[window.currentSystem]?.length || 8;
        const randomGeometry = Math.floor(Math.random() * geometryCount);
        if (window.selectGeometry) {
            window.selectGeometry(randomGeometry);
        }
    }
    
    // Randomize hue
    const hueSlider = document.getElementById('hue');
    if (hueSlider) {
        const randomHue = Math.random() * 360;
        hueSlider.value = randomHue;
        hueSlider.oninput();
    }
    
    console.log('🎲 Stage 2: Randomized geometry and hue');
}

/**
 * Reset all parameters to their default values
 */
window.resetAll = function() {
    // Reset all sliders to defaults
    const defaults = {
        rot4dXW: 0,
        rot4dYW: 0,
        rot4dZW: 0,
        gridDensity: 15,
        morphFactor: 1,
        chaos: 0.2,
        speed: 1,
        hue: 200,
        intensity: 0.5,
        saturation: 0.8
    };
    
    Object.entries(defaults).forEach(([id, value]) => {
        const slider = document.getElementById(id);
        if (slider) {
            slider.value = value;
            slider.oninput();
        }
    });
    console.log('🔄 Reset all parameters');
};

/**
 * Gallery Functions
 */
window.openGallery = function() {
    console.log('🖼️ Navigating to gallery...');
    // MEMORY OPTIMIZATION: Navigate in same tab instead of opening new window
    window.location.href = './gallery.html';
    
    // Listen for gallery window close
    if (window.galleryWindow) {
        const checkClosed = setInterval(() => {
            if (window.galleryWindow.closed) {
                window.galleryWindow = null;
                clearInterval(checkClosed);
                console.log('🖼️ Gallery window closed');
            }
        }, 1000);
    }
};

/**
 * Get current active geometry index
 */
function getCurrentGeometryIndex() {
    const activeBtn = document.querySelector('.geom-btn.active');
    if (activeBtn) {
        return parseInt(activeBtn.dataset.index) || 0;
    }
    return 0;
}

/**
 * Randomize Lite - Only parameters, not geometry or hue
 */
window.randomizeLite = function() {
    console.log('🎲 Randomizing parameters only (not geometry or hue)...');
    
    // Keep current geometry and hue
    const currentGeometry = getCurrentGeometryIndex();
    const currentHue = document.getElementById('hue')?.value || 200;
    
    // Randomize other parameters
    updateParameter('rot4dXW', (Math.random() - 0.5) * 12.56);
    updateParameter('rot4dYW', (Math.random() - 0.5) * 12.56);
    updateParameter('rot4dZW', (Math.random() - 0.5) * 12.56);
    updateParameter('gridDensity', 5 + Math.random() * 95);
    updateParameter('morphFactor', Math.random() * 2);
    updateParameter('chaos', Math.random());
    updateParameter('speed', 0.1 + Math.random() * 2.9);
    updateParameter('intensity', 0.2 + Math.random() * 0.8);
    updateParameter('saturation', 0.3 + Math.random() * 0.7);
    
    // Keep current hue and geometry
    updateParameter('hue', currentHue);
    if (window.selectGeometry) {
        window.selectGeometry(currentGeometry);
    }
    
    console.log('✅ Lite randomization complete - geometry and hue preserved');
};

/**
 * Open Viewer/Display Card - Navigate to viewer interface
 */
window.openViewer = function() {
    console.log('👁️ Navigating to viewer...');
    // Save current parameters for viewer
    const currentState = {
        system: window.currentSystem || 'faceted',
        parameters: window.userParameterState || {},
        toggleStates: {
            audioEnabled: window.audioEnabled || false,
            interactivityEnabled: window.interactivityEnabled !== false
        }
    };
    localStorage.setItem('vib34d-viewer-state', JSON.stringify(currentState));
    
    // Navigate to viewer
    window.location.href = './viewer.html';
};

/**
 * Interactivity Toggle - Enable/disable mouse and touch interactions
 */
window.toggleInteractivity = function() {
    interactivityEnabled = !interactivityEnabled;
    
    // Update interactivity button visual state
    const interactBtn = document.getElementById('interactivityToggle') || document.querySelector('[onclick="toggleInteractivity()"]');
    if (interactBtn) {
        if (interactivityEnabled) {
            interactBtn.classList.add('active');
        } else {
            interactBtn.classList.remove('active');
        }
        interactBtn.title = `Interactive Control: ${interactivityEnabled ? 'ON' : 'OFF'}`;
    }
    
    console.log(`🎛️ Mouse/Touch Interactions: ${interactivityEnabled ? 'ENABLED' : 'DISABLED'}`);
    console.log('🔷 Faceted: Mouse tracking', interactivityEnabled ? '✅' : '❌');
    console.log('🌌 Quantum: Enhanced interactions', interactivityEnabled ? '✅' : '❌'); 
    console.log('✨ Holographic: Touch interactions', interactivityEnabled ? '✅' : '❌');
    console.log('🔮 Polychora: 4D precision tracking', interactivityEnabled ? '✅' : '❌');
    
    // Show status overlay
    showInteractivityStatus();
};

/**
 * 3×3 Modular Reactivity Grid System (accessible from HTML)
 */
window.toggleSystemReactivity = function(system, interaction, enabled) {
    if (!window.reactivityManager) {
        console.warn('⚠️ ReactivityManager not initialized');
        return;
    }
    
    console.log(`🎛️ ${system.toUpperCase()} ${interaction.toUpperCase()}: ${enabled ? 'ON' : 'OFF'}`);
    
    // Map grid selections to ReactivityManager methods
    const interactionKey = `${system}${interaction.charAt(0).toUpperCase()}${interaction.slice(1)}`;
    
    if (interaction === 'mouse') {
        // Set mouse mode based on system (FIXED: matching actual mode names)
        if (enabled) {
            if (system === 'faceted') {
                window.reactivityManager.setMouseMode('rotations'); // 4D rotations
                console.log('  🔷 Activating Faceted 4D rotation mouse tracking');
            } else if (system === 'quantum') {
                window.reactivityManager.setMouseMode('velocity'); // Velocity tracking
                console.log('  🌌 Activating Quantum velocity mouse tracking');
            } else if (system === 'holographic') {
                window.reactivityManager.setMouseMode('distance'); // Shimmer effects (distance mode)
                console.log('  ✨ Activating Holographic shimmer mouse tracking');
            }
            window.reactivityManager.toggleMouse(true);
        } else {
            // If this system's mouse is being disabled, check if any others are still enabled
            const facetedEnabled = document.getElementById('facetedMouse')?.checked || false;
            const quantumEnabled = document.getElementById('quantumMouse')?.checked || false; 
            const holographicEnabled = document.getElementById('holographicMouse')?.checked || false;
            
            if (!facetedEnabled && !quantumEnabled && !holographicEnabled) {
                window.reactivityManager.toggleMouse(false);
                console.log('  🖱️ All mouse reactivity disabled');
            }
        }
    } else if (interaction === 'click') {
        // Set click mode based on system (FIXED: matching actual mode names)
        if (enabled) {
            if (system === 'faceted') {
                window.reactivityManager.setClickMode('burst'); // FIXED: burst not flash
                console.log('  🔷 Activating Faceted burst clicks');
            } else if (system === 'quantum') {
                window.reactivityManager.setClickMode('blast'); // FIXED: blast not burst
                console.log('  🌌 Activating Quantum blast clicks');
            } else if (system === 'holographic') {
                window.reactivityManager.setClickMode('ripple'); // FIXED: ripple not burst
                console.log('  ✨ Activating Holographic ripple clicks');
            }
            window.reactivityManager.toggleClick(true);
        } else {
            // Check if any other click modes are enabled
            const facetedEnabled = document.getElementById('facetedClick')?.checked || false;
            const quantumEnabled = document.getElementById('quantumClick')?.checked || false;
            const holographicEnabled = document.getElementById('holographicClick')?.checked || false;
            
            if (!facetedEnabled && !quantumEnabled && !holographicEnabled) {
                window.reactivityManager.toggleClick(false);
                console.log('  👆 All click reactivity disabled');
            }
        }
    } else if (interaction === 'scroll') {
        // Set scroll mode based on system (FIXED: matching actual mode names)
        if (enabled) {
            if (system === 'faceted') {
                window.reactivityManager.setScrollMode('cycle'); // FIXED: cycle not density
                console.log('  🔷 Activating Faceted cycle scroll effects');
            } else if (system === 'quantum') {
                window.reactivityManager.setScrollMode('wave'); // FIXED: wave not cycles
                console.log('  🌌 Activating Quantum wave scroll');
            } else if (system === 'holographic') {
                window.reactivityManager.setScrollMode('sweep'); // FIXED: sweep not flow
                console.log('  ✨ Activating Holographic sweep scroll effects');
            }
            window.reactivityManager.toggleScroll(true);
        } else {
            // Check if any other scroll modes are enabled
            const facetedEnabled = document.getElementById('facetedScroll')?.checked || false;
            const quantumEnabled = document.getElementById('quantumScroll')?.checked || false;
            const holographicEnabled = document.getElementById('holographicScroll')?.checked || false;
            
            if (!facetedEnabled && !quantumEnabled && !holographicEnabled) {
                window.reactivityManager.toggleScroll(false);
                console.log('  🌀 All scroll reactivity disabled');
            }
        }
    }
};

/**
 * 3×3 Audio Reactivity Grid System (accessible from HTML)
 */
window.toggleAudioReactivity = function(sensitivity, visualMode, enabled) {
    console.log(`🎵 ${sensitivity.toUpperCase()} ${visualMode.toUpperCase()}: ${enabled ? 'ON' : 'OFF'}`);
    
    // Initialize audio reactivity settings if not exists
    if (!window.audioReactivitySettings) {
        window.audioReactivitySettings = {
            // Sensitivity multipliers
            sensitivity: {
                low: 0.3,    // 30% sensitivity
                medium: 1.0, // 100% sensitivity (default)
                high: 2.0    // 200% sensitivity
            },
            // Visual mode parameters
            visualModes: {
                color: ['hue', 'saturation', 'intensity'],
                geometry: ['morphFactor', 'gridDensity', 'chaos'],  
                movement: ['speed', 'rot4dXW', 'rot4dYW', 'rot4dZW']
            },
            // Active modes
            activeSensitivity: 'medium',
            activeVisualModes: new Set(['color']) // Default: medium color only
        };
    }
    
    const settings = window.audioReactivitySettings;
    const modeKey = `${sensitivity}-${visualMode}`;
    
    if (enabled) {
        // Enable this mode
        settings.activeVisualModes.add(modeKey);
        settings.activeSensitivity = sensitivity;
        
        console.log(`  🎵 Activated: ${sensitivity} sensitivity with ${visualMode} visual changes`);
        console.log(`  📊 Sensitivity multiplier: ${settings.sensitivity[sensitivity]}x`);
        console.log(`  🎨 Visual parameters:`, settings.visualModes[visualMode]);
    } else {
        // Disable this mode  
        settings.activeVisualModes.delete(modeKey);
        console.log(`  🎵 Deactivated: ${sensitivity} ${visualMode}`);
    }
    
    // Update audio processing if any system has audio capability
    if (window.holographicSystem && window.holographicSystem.audioEnabled) {
        window.holographicSystem.audioReactivitySettings = settings;
        console.log('  ✨ Updated holographic system audio settings');
    }
    
    if (window.quantumEngine && window.quantumEngine.audioEnabled) {
        window.quantumEngine.audioReactivitySettings = settings;
        console.log('  🌌 Updated quantum engine audio settings');
    }
    
    // Show audio reactivity status
    showAudioReactivityStatus();
};

/**
 * Helper function for audio cell clicks (makes the checkboxes more clickable)
 */
window.toggleAudioCell = function(cellId) {
    const checkbox = document.getElementById(cellId);
    if (checkbox) {
        checkbox.checked = !checkbox.checked;
        
        // Parse the cell ID to get sensitivity and visual mode
        const sensitivity = cellId.replace(/Color|Geometry|Movement/, '').toLowerCase();
        let visualMode = '';
        if (cellId.includes('Color')) visualMode = 'color';
        else if (cellId.includes('Geometry')) visualMode = 'geometry';
        else if (cellId.includes('Movement')) visualMode = 'movement';
        
        // Call the main toggle function
        toggleAudioReactivity(sensitivity, visualMode, checkbox.checked);
    }
};

/**
 * Helper function to update UI sliders when LLM sets parameters
 */
function updateUIParameter(param, value) {
    const slider = document.getElementById(param);
    if (slider) {
        slider.value = value;
        // Trigger change event to update display value
        const event = new Event('input', { bubbles: true });
        slider.dispatchEvent(event);
    }
}

/**
 * Show interactivity status overlay
 */
function showInteractivityStatus() {
    // Create floating overlay for interactivity status
    let overlay = document.getElementById('reactivity-status-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'reactivity-status-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 60px;
            right: 20px;
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid #00ffff;
            padding: 15px;
            border-radius: 10px;
            color: #fff;
            font-family: 'Orbitron', monospace;
            font-size: 0.9rem;
            z-index: 2000;
            backdrop-filter: blur(10px);
            animation: fadeInOut 3s ease;
        `;
        document.body.appendChild(overlay);
    }
    
    overlay.innerHTML = `
        <div style="color: #00ffff; font-weight: bold; margin-bottom: 10px;">
            🎛️ REACTIVITY STATUS
        </div>
        <div>🎵 Audio: ${audioEnabled ? '<span style="color: #00ff00">ON</span>' : '<span style="color: #ff4444">OFF</span>'}</div>
        <div>🖱️ Interactions: ${interactivityEnabled ? '<span style="color: #00ff00">ON</span>' : '<span style="color: #ff4444">OFF</span>'}</div>
    `;
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        if (overlay && overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
    }, 3000);
}

/**
 * Show audio reactivity status overlay
 */
function showAudioReactivityStatus() {
    const settings = window.audioReactivitySettings;
    if (!settings) return;
    
    // Create floating overlay for audio reactivity status
    let overlay = document.getElementById('audio-reactivity-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'audio-reactivity-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 60px;
            left: 20px;
            background: rgba(40, 0, 40, 0.9);
            border: 2px solid #ff64ff;
            padding: 15px;
            border-radius: 10px;
            color: #fff;
            font-family: 'Orbitron', monospace;
            font-size: 0.8rem;
            z-index: 2000;
            backdrop-filter: blur(10px);
            animation: fadeInOut 4s ease;
            max-width: 300px;
        `;
        document.body.appendChild(overlay);
    }
    
    const activeModes = Array.from(settings.activeVisualModes);
    const modesList = activeModes.length > 0 ? 
        activeModes.map(mode => mode.replace('-', ' ')).join(', ') : 
        'None active';
        
    overlay.innerHTML = `
        <div style="color: #ff64ff; font-weight: bold; margin-bottom: 10px;">
            🎵 AUDIO REACTIVITY STATUS
        </div>
        <div>🔊 Sensitivity: <span style="color: #ff64ff">${settings.activeSensitivity.toUpperCase()}</span></div>
        <div>🎨 Active Modes: <span style="color: #ff64ff">${modesList}</span></div>
        <div>📊 Multiplier: <span style="color: #ff64ff">${settings.sensitivity[settings.activeSensitivity]}x</span></div>
    `;
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
        if (overlay && overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
    }, 4000);
}

// Legacy function name support
function showInteractivityOverlay() {
    showInteractivityStatus();
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'i' || e.key === 'I') {
        window.toggleInteractivity();
    }
});

// Listen for mouse events from gallery iframe for visualizer interactivity
window.addEventListener('message', (event) => {
    if (event.data && event.data.type) {
        if (event.data.type === 'mouseMove') {
            // Update all visualizers with mouse position
            const updateMouseForSystem = (system) => {
                if (system && system.visualizers) {
                    system.visualizers.forEach(vis => {
                        if (vis) {
                            vis.mouseX = event.data.x;
                            vis.mouseY = event.data.y;
                            vis.mouseIntensity = event.data.intensity || 0.5;
                        }
                    });
                }
            };
            
            // Update the active system's visualizers
            if (window.currentSystem === 'faceted' && window.engine) {
                updateMouseForSystem(window.engine);
            } else if (window.currentSystem === 'quantum' && window.quantumEngine) {
                updateMouseForSystem(window.quantumEngine);
            } else if (window.currentSystem === 'holographic' && window.holographicSystem) {
                updateMouseForSystem(window.holographicSystem);
            }
        } else if (event.data.type === 'mouseClick') {
            // Trigger click effects on all visualizers
            const triggerClickForSystem = (system) => {
                if (system && system.visualizers) {
                    system.visualizers.forEach(vis => {
                        if (vis) {
                            vis.clickIntensity = event.data.intensity || 1.0;
                        }
                    });
                }
            };
            
            // Trigger click on active system
            if (window.currentSystem === 'faceted' && window.engine) {
                triggerClickForSystem(window.engine);
            } else if (window.currentSystem === 'quantum' && window.quantumEngine) {
                triggerClickForSystem(window.quantumEngine);
            } else if (window.currentSystem === 'holographic' && window.holographicSystem) {
                triggerClickForSystem(window.holographicSystem);
            }
        }
    }
});

/**
 * Setup geometry buttons for the current system
 */
window.setupGeometry = function(system) {
    const grid = document.getElementById('geometryGrid');
    if (!grid) return;
    
    const geoList = window.geometries?.[system] || window.geometries?.faceted || [
        'TETRAHEDRON', 'HYPERCUBE', 'SPHERE', 'TORUS', 
        'KLEIN BOTTLE', 'FRACTAL', 'WAVE', 'CRYSTAL'
    ];
    
    grid.innerHTML = geoList.map((name, i) => 
        `<button class="geom-btn ${i === 0 ? 'active' : ''}" 
                 data-index="${i}" onclick="selectGeometry(${i})">
            ${name}
        </button>`
    ).join('');
};

/**
 * Mobile panel toggle function
 */
window.toggleMobilePanel = function() {
    const controlPanel = document.getElementById('controlPanel');
    const collapseBtn = document.querySelector('.mobile-collapse-btn');
    
    if (controlPanel && collapseBtn) {
        controlPanel.classList.toggle('collapsed');
        collapseBtn.textContent = controlPanel.classList.contains('collapsed') ? '▲' : '▼';
        console.log('📱 Mobile panel toggled');
    }
};

// Note: createTradingCard is defined in gallery-manager.js

console.log('🎛️ UI Handlers Module: Loaded');