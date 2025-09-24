/**
 * VIB34D Gallery and Export Manager Module
 * Gallery saving, trading card generation, and LLM interface functions
 * Extracted from monolithic index.html for clean architecture
 */

// Global variables for export managers
let unifiedSaveManager = null;

/**
 * CRITICAL FIX: Global Function Preservation System
 * Prevents gallery operations from corrupting global scope
 */
const preserveCriticalFunctions = () => {
    if (!window.vib34dPreservedFunctions) {
        window.vib34dPreservedFunctions = {
            switchSystem: window.switchSystem,
            updateParameter: window.updateParameter,
            currentSystem: window.currentSystem,
            reactivityManager: window.reactivityManager,
            engine: window.engine,
            userParameterState: window.userParameterState,
            selectGeometry: window.selectGeometry,
            quantumEngine: window.quantumEngine,
            holographicSystem: window.holographicSystem,
            polychoraSystem: window.polychoraSystem
        };
        console.log('🛡️ Critical VIB34D functions preserved');
    }
};

const restoreCriticalFunctions = () => {
    if (window.vib34dPreservedFunctions) {
        let restoredCount = 0;
        Object.entries(window.vib34dPreservedFunctions).forEach(([key, value]) => {
            if (!window[key] && value) {
                window[key] = value;
                restoredCount++;
                console.log(`🔧 Restored ${key}`);
            }
        });
        if (restoredCount > 0) {
            console.log(`🛡️ Restored ${restoredCount} critical functions`);
        }
    }
};

/**
 * Save current visualization to gallery
 */
window.saveToGallery = async function() {
    console.log('🔵 Save to Gallery button clicked');
    
    // CRITICAL FIX: Preserve functions before async operations
    preserveCriticalFunctions();
    
    try {
        // Check if any system engine is initialized (flexible check for all 3 working systems)
        const hasAnyEngine = !!(window.engine || window.quantumEngine || window.holographicSystem);
        if (!hasAnyEngine) {
            throw new Error('No engine system initialized yet - please wait a moment');
        }
        
        console.log('🔍 Engine check passed:', {
            faceted: !!window.engine,
            quantum: !!window.quantumEngine,
            holographic: !!window.holographicSystem,
            currentSystem: window.currentSystem
        });
        
        // CRITICAL FIX: Initialize UnifiedSaveManager if needed
        if (!unifiedSaveManager) {
            console.log('🔧 Initializing UnifiedSaveManager...');
            // Dynamic import to avoid circular dependencies
            const { UnifiedSaveManager } = await import('../../src/core/UnifiedSaveManager.js');
            
            // Pass the appropriate engine based on current system, or null (it can handle null)
            let currentEngine = null;
            if (window.currentSystem === 'faceted' && window.engine) {
                currentEngine = window.engine;
            } else if (window.currentSystem === 'quantum' && window.quantumEngine) {
                currentEngine = window.quantumEngine;
            } else if (window.currentSystem === 'holographic' && window.holographicSystem) {
                currentEngine = window.holographicSystem;
            }
            
            console.log('🔧 Initializing UnifiedSaveManager with engine for:', window.currentSystem, !!currentEngine);
            unifiedSaveManager = new UnifiedSaveManager(currentEngine);
        }
        
        // Ensure currentSystem is properly set
        if (!window.currentSystem) {
            window.currentSystem = 'faceted';
            console.log('🔧 Fixed window.currentSystem:', window.currentSystem);
        }
        
        console.log('🔵 Starting save process...');
        
        // Use the UnifiedSaveManager for all saves
        const result = await unifiedSaveManager.save({ target: 'gallery' });
        
        console.log('🔵 Save result:', result);
        
        if (result && result.success) {
            console.log('✅ Saved to gallery:', result.id);
            
            // Show success message
            showSaveConfirmation('Variation saved to gallery!', result.id);
            
            // CRITICAL FIX: Multiple real-time gallery update methods
            
            // Method 1: Local event (same window)
            const event = new CustomEvent('gallery-refresh-needed');
            window.dispatchEvent(event);
            
            // Method 2: Cross-window message (for gallery in new window)
            try {
                // Try to find gallery window and send message
                if (window.galleryWindow && !window.galleryWindow.closed) {
                    window.galleryWindow.postMessage({
                        type: 'vib34d-variation-saved',
                        variationId: result.id,
                        timestamp: Date.now()
                    }, '*');
                    console.log('📤 Sent gallery update message to gallery window');
                }
            } catch (e) {
                console.log('📤 No gallery window to notify');
            }
            
            // Method 3: Force localStorage event (for cross-tab communication)
            // This triggers storage event listeners in other tabs/windows
            localStorage.setItem('vib34d-gallery-update-trigger', Date.now().toString());
        } else {
            throw new Error(result?.error || 'Save failed - no result returned');
        }
    } catch (error) {
        console.error('❌ Failed to save to gallery:', error);
        showSaveError(error.message || 'Gallery save failed');
    } finally {
        // CRITICAL FIX: Always restore functions after async operations
        setTimeout(restoreCriticalFunctions, 100);
    }
};

/**
 * Create trading card in specified format
 */
window.createTradingCard = async function(format = 'classic') {
    console.log(`🎴 Creating ${format} trading card for ${window.currentSystem} system...`);
    
    // CRITICAL FIX: Preserve functions before async operations
    preserveCriticalFunctions();
    
    try {
        // Dynamic import of TradingCardManager
        const { TradingCardManager } = await import('../../src/export/TradingCardManager.js');
        
        // Get current parameters
        const parameters = {
            system: window.currentSystem || 'faceted',
            geometry: getActiveGeometryIndex(),
            rot4dXW: parseFloat(document.getElementById('rot4dXW').value),
            rot4dYW: parseFloat(document.getElementById('rot4dYW').value),
            rot4dZW: parseFloat(document.getElementById('rot4dZW').value),
            gridDensity: parseFloat(document.getElementById('gridDensity').value),
            morphFactor: parseFloat(document.getElementById('morphFactor').value),
            chaos: parseFloat(document.getElementById('chaos').value),
            speed: parseFloat(document.getElementById('speed').value),
            hue: parseFloat(document.getElementById('hue').value),
            intensity: parseFloat(document.getElementById('intensity').value),
            saturation: parseFloat(document.getElementById('saturation').value)
        };
        
        // 🌟 ENHANCED: Generate system-specific trading card with holographic VIB3-4D logo background
        const result = await TradingCardManager.createCard(
            window.currentSystem || 'faceted',
            format,
            parameters,
            {
                holographicLogo: true,
                logoSystem: window.currentSystem,
                logoParameters: parameters,
                sparkleEffects: true,
                logoShine: true
            }
        );
        
        if (result.success) {
            console.log(`✅ ${result.system} trading card created: ${result.filename}`);
            
            // Show success notification
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 70px;
                right: 20px;
                background: rgba(0, 255, 0, 0.9);
                color: black;
                padding: 15px 20px;
                border-radius: 10px;
                font-family: 'Orbitron', monospace;
                font-weight: bold;
                z-index: 10000;
                animation: slideIn 0.3s ease-out;
            `;
            notification.innerHTML = `
                🎴 ${result.system.toUpperCase()} Trading Card Created!<br>
                <small style="opacity: 0.8;">${result.filename}</small>
            `;
            
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 4000);
            
        } else {
            throw new Error(result.error || 'Trading card generation failed');
        }
    } catch (error) {
        console.error('❌ Failed to create trading card:', error);
        
        // Show error notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 70px;
            right: 20px;
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            font-family: 'Orbitron', monospace;
            z-index: 10000;
        `;
        notification.innerHTML = `❌ Trading Card Failed: ${error.message}`;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    } finally {
        // CRITICAL FIX: Always restore functions after async operations
        setTimeout(restoreCriticalFunctions, 100);
    }
};

/**
 * Show LLM AI Parameter Interface
 */
window.showLLMInterface = async function() {
    console.log('🤖 Opening AI parameter interface');
    
    // CRITICAL FIX: Preserve functions before async operations
    preserveCriticalFunctions();
    
    try {
        // Import LLM modules dynamically
        const { LLMParameterInterface } = await import('../../src/llm/LLMParameterInterface.js');
        const { LLMParameterUI } = await import('../../src/llm/LLMParameterUI.js');
        
        // Initialize LLM system if not already done
        if (!window.llmInterface) {
            window.llmInterface = new LLMParameterInterface();
            window.llmUI = new LLMParameterUI(window.llmInterface);
            
            // Set parameter callback to update VIB34D
            window.llmInterface.setParameterCallback((parameters) => {
                console.log('🤖 Applying AI-generated parameters:', parameters);
                
                // Smart system selection based on visual characteristics
                let targetSystem = window.currentSystem || 'faceted';
                
                // Choose system based on parameter values for maximum visual impact
                if (parameters.chaos > 0.7 && parameters.speed > 2.0) {
                    targetSystem = 'quantum'; // High chaos + speed = complex quantum effects
                } else if (parameters.intensity > 0.8 && parameters.saturation > 0.8) {
                    targetSystem = 'holographic'; // High intensity = holographic effects
                } else if (parameters.chaos < 0.3 && parameters.gridDensity > 60) {
                    targetSystem = 'faceted'; // Low chaos + high detail = clean faceted patterns
                }
                
                // Switch system if needed for maximum visual change
                if (targetSystem !== window.currentSystem) {
                    console.log(`🎯 AI switching from ${window.currentSystem} to ${targetSystem} for optimal visual effect`);
                    if (window.switchSystem) {
                        window.switchSystem(targetSystem);
                    }
                }
                
                // Apply each parameter with a small delay for smooth visual effect
                Object.entries(parameters).forEach(([param, value], index) => {
                    setTimeout(() => {
                        // Use the existing updateParameter function that handles all systems
                        if (window.updateParameter) {
                            console.log(`🤖 Applying ${param} = ${value} to ${targetSystem} system`);
                            window.updateParameter(param, value);
                        } else {
                            console.error('❌ window.updateParameter not available');
                        }
                    }, index * 50);
                });
            });
        }
        
        // Show the LLM interface
        window.llmUI.show();
        
    } catch (error) {
        console.error('❌ Error loading LLM interface:', error);
        alert('Error loading AI parameter interface. Please check console for details.');
    } finally {
        // CRITICAL FIX: Always restore functions after async operations
        setTimeout(restoreCriticalFunctions, 100);
    }
};

/**
 * Get active geometry index for current system
 */
function getActiveGeometryIndex() {
    const activeGeomBtn = document.querySelector('.geom-btn.active');
    return activeGeomBtn ? parseInt(activeGeomBtn.dataset.index) || 0 : 0;
}

/**
 * Show save confirmation message
 */
function showSaveConfirmation(message, id) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 70px;
        left: 20px;
        background: rgba(0, 255, 255, 0.9);
        color: black;
        padding: 15px 20px;
        border-radius: 10px;
        font-family: 'Orbitron', monospace;
        font-weight: bold;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.innerHTML = `
        ✅ ${message}<br>
        <small style="opacity: 0.8;">ID: ${id}</small>
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 4000);
}

/**
 * Show save error message
 */
function showSaveError(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 70px;
        left: 20px;
        background: rgba(255, 0, 0, 0.9);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        font-family: 'Orbitron', monospace;
        z-index: 10000;
    `;
    notification.innerHTML = `❌ Save Error: ${message}`;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

/**
 * Gallery parameter loading system
 */
function checkGalleryParameters() {
    const savedParams = localStorage.getItem('vib34d-load-params');
    if (savedParams) {
        try {
            const data = JSON.parse(savedParams);
            console.log('🔗 Received parameters from gallery:', data);
            
            // Clear the stored parameters to prevent repeated loading
            localStorage.removeItem('vib34d-load-params');
            
            // Switch to the appropriate system
            if (data.system && data.system !== window.currentSystem) {
                window.switchSystem(data.system);
                // Wait for system switch to complete
                setTimeout(() => loadGalleryParameters(data), 20);
            } else {
                loadGalleryParameters(data);
            }
        } catch (error) {
            console.error('❌ Failed to parse gallery parameters:', error);
            localStorage.removeItem('vib34d-load-params');
        }
    }
}

/**
 * Load parameters from gallery data
 */
function loadGalleryParameters(data) {
    const { system, parameters, globalId, metadata } = data;
    console.log(`🎯 Loading ${system} variation #${globalId} from gallery`);
    
    // 🆕 FIXED: Restore toggle states (audio/interactivity) from metadata
    if (metadata && metadata.toggleStates) {
        console.log('🔧 Restoring toggle states:', metadata.toggleStates);
        
        // Restore audio state
        if (metadata.toggleStates.audioEnabled !== undefined) {
            window.audioEnabled = metadata.toggleStates.audioEnabled;
            const audioBtn = document.getElementById('audioBtn');
            if (audioBtn) {
                audioBtn.style.background = window.audioEnabled ? 
                    'linear-gradient(45deg, #ff6b9d, #c44569)' : '';
            }
            console.log(`🔧 Audio restored: ${window.audioEnabled}`);
        }
        
        // Restore interactivity state  
        if (metadata.toggleStates.interactivityEnabled !== undefined) {
            window.interactivityEnabled = metadata.toggleStates.interactivityEnabled;
            const interactivityBtn = document.getElementById('interactivityBtn');
            if (interactivityBtn) {
                interactivityBtn.style.background = window.interactivityEnabled ?
                    'linear-gradient(45deg, #74b9ff, #0984e3)' : '';
            }
            console.log(`🔧 Interactivity restored: ${window.interactivityEnabled}`);
        }
        
        // Restore device tilt state
        if (metadata.toggleStates.deviceTiltEnabled !== undefined && window.deviceTiltHandler) {
            if (metadata.toggleStates.deviceTiltEnabled) {
                window.deviceTiltHandler.enable();
            } else {
                window.deviceTiltHandler.disable();
            }
            console.log(`🔧 Device tilt restored: ${metadata.toggleStates.deviceTiltEnabled}`);
        }
    }
    
    // 🆕 FIXED: Support ALL 4 systems in parameter loading
    const engines = {
        faceted: window.engine,
        quantum: window.quantumEngine, 
        holographic: window.holographicSystem,
        polychora: window.polychoraSystem
    };
    
    const currentEngine = engines[system];
    if (currentEngine) {
        console.log(`🎯 Loading ${system} parameters with engine present`);
        
        // Apply all parameters to the correct system
        Object.entries(parameters).forEach(([param, value]) => {
            if (param === 'geometry' && typeof value === 'number') {
                if (window.selectGeometry) {
                    window.selectGeometry(value);
                    console.log(`🎯 Set ${system} geometry to ${value}`);
                }
            } else {
                const slider = document.getElementById(param);
                if (slider) {
                    slider.value = value;
                    window.updateParameter(param, value);
                    console.log(`🎯 Applied ${system} ${param} = ${value}`);
                }
            }
        });
        
        console.log(`✅ Successfully loaded ${system} variation`);
    } else {
        console.error(`❌ ${system} engine not available:`, {
            faceted: !!window.engine,
            quantum: !!window.quantumEngine,
            holographic: !!window.holographicSystem,
            polychora: !!window.polychoraSystem
        });
    }
}

/**
 * Mouse parameter system for smooth interactions
 */
window.baseHue = 200;
window.baseDensity = 15; 
window.baseMorph = 1;

let lastMouseUpdate = 0;
let pendingMouseData = null;
let mouseUpdateRAF = null;

function applyMouseParameters() {
    if (!pendingMouseData || !window.updateParameter || !window.moduleReady) return;
    
    const { mouseX, mouseY, intensity } = pendingMouseData;
    
    // Convert mouse position to parameter changes with smooth interpolation
    const hueShift = (mouseX - 0.5) * 60; // ±30° hue shift
    const densityShift = (mouseY - 0.5) * 10; // ±5 density shift  
    const morphShift = intensity * 0.3; // 0-0.3 morph factor
    
    // Apply parameter updates smoothly
    window.updateParameter('hue', (window.baseHue || 200) + hueShift);
    window.updateParameter('gridDensity', Math.max(5, (window.baseDensity || 15) + densityShift));
    window.updateParameter('morphFactor', Math.max(0, Math.min(2, (window.baseMorph || 1) + morphShift)));
    window.updateParameter('intensity', Math.max(0, Math.min(1, intensity)));
    
    pendingMouseData = null;
}

// Listen for mouse events from parent gallery/viewer for smooth parameter updates
window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'mouseMove') {
        const now = performance.now();
        
        // Throttle mouse updates to 60fps for smooth performance
        if (now - lastMouseUpdate > 16) {
            pendingMouseData = {
                mouseX: event.data.x || 0.5,
                mouseY: event.data.y || 0.5,
                intensity: event.data.intensity || 0.5
            };
            
            if (mouseUpdateRAF) {
                cancelAnimationFrame(mouseUpdateRAF);
            }
            
            mouseUpdateRAF = requestAnimationFrame(applyMouseParameters);
            lastMouseUpdate = now;
        }
    }
});

// Initialize gallery parameter checking
if (typeof window !== 'undefined') {
    // Check for gallery parameters on load
    setTimeout(checkGalleryParameters, 100);
    
    // Listen for storage events for cross-tab communication
    window.addEventListener('storage', (event) => {
        if (event.key === 'vib34d-load-params') {
            checkGalleryParameters();
        }
    });
}

console.log('🖼️ Gallery Manager Module: Loaded');