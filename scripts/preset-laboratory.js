/*
 * PRESET LABORATORY v1.0
 * 
 * Advanced preset management and live parameter tweaking system for Clear Seas.
 * Provides real-time parameter exploration, preset generation, and asset export
 * with sophisticated parameter space exploration capabilities.
 */

class PresetLaboratory {
  constructor() {
    this.presets = new Map();
    this.currentPreset = null;
    this.parameterHistory = [];
    this.isRecording = false;
    this.tweakingSession = null;
    this.exportFormats = ['json', 'css', 'shader', 'trading-card'];
    
    this.initialize();
  }

  async initialize() {
    await this.loadPresetLibrary();
    this.createLabInterface();
    this.setupParameterMonitoring();
    
    console.log('🧪 Preset Laboratory - Initialized with', this.presets.size, 'presets');
  }

  async loadPresetLibrary() {
    try {
      // Load base presets from existing systems
      const systems = ['FACETED', 'QUANTUM', 'HOLOGRAPHIC'];
      
      for (const system of systems) {
        const response = await fetch(`/assets/reactivity/faceted.json`);
        const config = await response.json();
        
        if (config.systems[system]) {
          const preset = this.createPresetFromSystem(system, config.systems[system]);
          this.presets.set(system.toLowerCase(), preset);
        }
      }
      
      // Generate variations automatically
      this.generatePresetVariations();
      
    } catch (error) {
      console.warn('Could not load preset library:', error);
      this.generateDefaultPresets();
    }
  }

  createPresetFromSystem(name, systemConfig) {
    return {
      id: name.toLowerCase(),
      name: name,
      description: `${name} system preset with optimized parameters`,
      category: 'system',
      parameters: {
        visual: { ...systemConfig.base.visual },
        color: { ...systemConfig.base.color },
        rot4d: { ...systemConfig.base.rot4d },
        geometry: systemConfig.base.geometry
      },
      reactivity: systemConfig.reactivity,
      timestamp: Date.now(),
      usage: 0
    };
  }

  generatePresetVariations() {
    const basePresets = Array.from(this.presets.values()).filter(p => p.category === 'system');
    
    basePresets.forEach(base => {
      // High energy variation
      const highEnergyId = `${base.id}-high-energy`;
      const highEnergy = this.createVariation(base, highEnergyId, 'High Energy', {
        visual: {
          speed: base.parameters.visual.speed * 2,
          chaos: Math.min(base.parameters.visual.chaos * 1.5, 1),
          intensity: Math.min(base.parameters.visual.intensity * 1.3, 1)
        },
        color: {
          saturation: Math.min(base.parameters.color.saturation * 1.2, 1)
        }
      });
      this.presets.set(highEnergyId, highEnergy);
      
      // Calm variation
      const calmId = `${base.id}-calm`;
      const calm = this.createVariation(base, calmId, 'Calm', {
        visual: {
          speed: base.parameters.visual.speed * 0.3,
          chaos: base.parameters.visual.chaos * 0.2,
          gridDensity: Math.max(base.parameters.visual.gridDensity * 0.7, 5)
        },
        color: {
          saturation: base.parameters.color.saturation * 0.8,
          intensity: base.parameters.color.intensity * 0.9
        }
      });
      this.presets.set(calmId, calm);
      
      // Psychedelic variation
      const psychedelicId = `${base.id}-psychedelic`;
      const psychedelic = this.createVariation(base, psychedelicId, 'Psychedelic', {
        visual: {
          morphFactor: Math.min(base.parameters.visual.morphFactor * 1.8, 2),
          chaos: Math.min(base.parameters.visual.chaos * 2, 1),
          gridDensity: base.parameters.visual.gridDensity * 1.5
        },
        color: {
          hue: (base.parameters.color.hue + 120) % 360,
          saturation: 1.0,
          intensity: Math.min(base.parameters.color.intensity * 1.4, 1)
        },
        rot4d: {
          xw: base.parameters.rot4d.xw + 1.5,
          yw: base.parameters.rot4d.yw + 1.2,
          zw: base.parameters.rot4d.zw + 0.8
        }
      });
      this.presets.set(psychedelicId, psychedelic);
    });
  }

  createVariation(basePreset, id, name, overrides) {
    const variation = JSON.parse(JSON.stringify(basePreset));
    variation.id = id;
    variation.name = `${basePreset.name} - ${name}`;
    variation.category = 'variation';
    variation.basePreset = basePreset.id;
    variation.timestamp = Date.now();
    
    // Apply overrides
    Object.keys(overrides).forEach(namespace => {
      Object.keys(overrides[namespace]).forEach(param => {
        if (variation.parameters[namespace]) {
          variation.parameters[namespace][param] = overrides[namespace][param];
        }
      });
    });
    
    return variation;
  }

  generateDefaultPresets() {
    // Fallback presets if loading fails
    const defaults = [
      {
        id: 'minimal',
        name: 'Minimal',
        description: 'Clean, minimal visualization',
        category: 'default',
        parameters: {
          visual: { gridDensity: 8, morphFactor: 0.5, chaos: 0.1, speed: 0.5, intensity: 0.7 },
          color: { hue: 200, intensity: 0.8, saturation: 0.6 },
          rot4d: { xw: 0, yw: 0, zw: 0 },
          geometry: 'TETRAHEDRON'
        }
      },
      {
        id: 'dynamic',
        name: 'Dynamic',
        description: 'High-energy visualization with movement',
        category: 'default',
        parameters: {
          visual: { gridDensity: 15, morphFactor: 1.5, chaos: 0.4, speed: 1.8, intensity: 1.0 },
          color: { hue: 280, intensity: 1.0, saturation: 0.9 },
          rot4d: { xw: 0.2, yw: 0.3, zw: 0.1 },
          geometry: 'CRYSTAL'
        }
      }
    ];
    
    defaults.forEach(preset => {
      preset.timestamp = Date.now();
      preset.usage = 0;
      this.presets.set(preset.id, preset);
    });
  }

  createLabInterface() {
    // Create floating lab interface
    const labContainer = document.createElement('div');
    labContainer.id = 'preset-laboratory';
    labContainer.className = 'preset-lab-container';
    labContainer.innerHTML = `
      <div class="lab-header">
        <h3>🧪 Preset Laboratory</h3>
        <button class="lab-toggle" onclick="toggleLab()">−</button>
      </div>
      <div class="lab-content">
        <div class="lab-section">
          <h4>Quick Actions</h4>
          <div class="lab-buttons">
            <button onclick="startTweaking()" class="btn-tweak">Start Tweaking</button>
            <button onclick="recordParameters()" class="btn-record">Record</button>
            <button onclick="generateRandom()" class="btn-random">Random</button>
            <button onclick="exportPreset()" class="btn-export">Export</button>
          </div>
        </div>
        
        <div class="lab-section">
          <h4>Preset Browser</h4>
          <div class="preset-grid" id="preset-grid">
            <!-- Presets will be populated here -->
          </div>
        </div>
        
        <div class="lab-section">
          <h4>Parameter Space</h4>
          <div class="parameter-space" id="parameter-space">
            <canvas id="param-space-canvas" width="200" height="150"></canvas>
          </div>
        </div>
        
        <div class="lab-section">
          <h4>Live Tweaking</h4>
          <div class="tweak-controls" id="tweak-controls" style="display: none;">
            <!-- Dynamic controls will be added here -->
          </div>
        </div>
      </div>
    `;
    
    // Add styles
    const labStyles = document.createElement('style');
    labStyles.textContent = `
      .preset-lab-container {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 320px;
        max-height: 80vh;
        background: rgba(13, 17, 23, 0.95);
        border: 1px solid rgba(58, 212, 237, 0.3);
        border-radius: 12px;
        backdrop-filter: blur(10px);
        font-family: 'Orbitron', monospace;
        font-size: 12px;
        z-index: 9999;
        overflow: hidden;
        transition: all 0.3s ease;
      }
      
      .lab-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: rgba(58, 212, 237, 0.1);
        border-bottom: 1px solid rgba(58, 212, 237, 0.2);
      }
      
      .lab-header h3 {
        margin: 0;
        color: #3ad4ed;
        font-size: 14px;
      }
      
      .lab-toggle {
        background: none;
        border: none;
        color: #3ad4ed;
        font-size: 18px;
        cursor: pointer;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .lab-content {
        max-height: calc(80vh - 50px);
        overflow-y: auto;
        padding: 16px;
      }
      
      .lab-section {
        margin-bottom: 20px;
      }
      
      .lab-section h4 {
        margin: 0 0 8px 0;
        color: #fff;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      
      .lab-buttons {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      
      .lab-buttons button {
        padding: 8px 12px;
        background: rgba(58, 212, 237, 0.1);
        border: 1px solid rgba(58, 212, 237, 0.3);
        border-radius: 6px;
        color: #3ad4ed;
        font-family: 'Orbitron', monospace;
        font-size: 10px;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .lab-buttons button:hover {
        background: rgba(58, 212, 237, 0.2);
        transform: translateY(-1px);
      }
      
      .preset-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
        max-height: 200px;
        overflow-y: auto;
      }
      
      .preset-item {
        padding: 8px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .preset-item:hover {
        background: rgba(58, 212, 237, 0.1);
        border-color: rgba(58, 212, 237, 0.3);
      }
      
      .preset-item.active {
        background: rgba(58, 212, 237, 0.2);
        border-color: #3ad4ed;
      }
      
      .preset-name {
        font-weight: bold;
        color: #fff;
        font-size: 11px;
        margin-bottom: 2px;
      }
      
      .preset-desc {
        color: rgba(255, 255, 255, 0.6);
        font-size: 9px;
      }
      
      .parameter-space {
        position: relative;
      }
      
      #param-space-canvas {
        width: 100%;
        height: 150px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 6px;
      }
      
      .tweak-controls {
        display: grid;
        grid-template-columns: 1fr;
        gap: 8px;
      }
      
      .tweak-slider {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }
      
      .tweak-slider label {
        color: #fff;
        font-size: 10px;
        min-width: 80px;
      }
      
      .tweak-slider input {
        flex: 1;
        margin: 0 8px;
      }
      
      .tweak-slider .value {
        color: #3ad4ed;
        font-size: 10px;
        min-width: 40px;
        text-align: right;
      }
    `;
    
    document.head.appendChild(labStyles);
    document.body.appendChild(labContainer);
    
    // Populate preset grid
    this.updatePresetGrid();
    this.initializeParameterSpace();
    
    // Make functions global for HTML onclick handlers
    window.toggleLab = () => this.toggleLab();
    window.startTweaking = () => this.startTweaking();
    window.recordParameters = () => this.recordParameters();
    window.generateRandom = () => this.generateRandom();
    window.exportPreset = () => this.exportPreset();
  }

  updatePresetGrid() {
    const grid = document.getElementById('preset-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    Array.from(this.presets.values())
      .sort((a, b) => b.usage - a.usage)
      .forEach(preset => {
        const item = document.createElement('div');
        item.className = 'preset-item';
        item.onclick = () => this.loadPreset(preset.id);
        
        if (this.currentPreset && this.currentPreset.id === preset.id) {
          item.classList.add('active');
        }
        
        item.innerHTML = `
          <div class="preset-name">${preset.name}</div>
          <div class="preset-desc">${preset.description}</div>
        `;
        
        grid.appendChild(item);
      });
  }

  initializeParameterSpace() {
    const canvas = document.getElementById('param-space-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Draw parameter space visualization
    this.drawParameterSpace(ctx);
  }

  drawParameterSpace(ctx) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    
    // Clear canvas
    ctx.fillStyle = 'rgba(13, 17, 23, 1)';
    ctx.fillRect(0, 0, width, height);
    
    // Draw parameter dots
    Array.from(this.presets.values()).forEach((preset, index) => {
      const x = (preset.parameters.visual.gridDensity / 100) * width;
      const y = (1 - preset.parameters.visual.speed / 3) * height;
      
      ctx.fillStyle = `hsl(${preset.parameters.color.hue}, 70%, 60%)`;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
      
      if (this.currentPreset && this.currentPreset.id === preset.id) {
        ctx.strokeStyle = '#3ad4ed';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
    
    // Draw axes labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '10px Orbitron';
    ctx.fillText('Grid Density →', 5, height - 5);
    ctx.save();
    ctx.translate(15, height - 20);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Speed →', 0, 0);
    ctx.restore();
  }

  loadPreset(presetId) {
    const preset = this.presets.get(presetId);
    if (!preset) return;
    
    this.currentPreset = preset;
    preset.usage++;
    
    // Apply preset to all active visualizers
    this.applyPresetToAll(preset);
    
    // Update UI
    this.updatePresetGrid();
    this.initializeParameterSpace();
    
    console.log('🎯 Loaded preset:', preset.name);
  }

  applyPresetToAll(preset) {
    if (!window.visualizerAdapter) return;
    
    const visualizers = window.visualizerAdapter.getAllVisualizers();
    
    visualizers.forEach(visualizer => {
      // Apply visual parameters
      Object.entries(preset.parameters.visual).forEach(([param, value]) => {
        window.visualizerAdapter.updateVisualizerParameter(
          visualizer.id, 'visual', param, value, { transition: { duration: 800, easing: 'expoOut' } }
        );
      });
      
      // Apply color parameters
      Object.entries(preset.parameters.color).forEach(([param, value]) => {
        window.visualizerAdapter.updateVisualizerParameter(
          visualizer.id, 'color', param, value, { transition: { duration: 800, easing: 'expoOut' } }
        );
      });
      
      // Apply rot4d parameters
      Object.entries(preset.parameters.rot4d).forEach(([param, value]) => {
        window.visualizerAdapter.updateVisualizerParameter(
          visualizer.id, 'rot4d', param, value, { transition: { duration: 800, easing: 'expoOut' } }
        );
      });
      
      // Apply geometry
      if (preset.parameters.geometry) {
        window.visualizerAdapter.updateVisualizerParameter(
          visualizer.id, 'geometry', 'type', preset.parameters.geometry, { immediate: true }
        );
      }
    });
  }

  startTweaking() {
    if (!this.currentPreset) {
      this.generateRandom();
    }
    
    this.tweakingSession = {
      startTime: Date.now(),
      originalPreset: JSON.parse(JSON.stringify(this.currentPreset)),
      modifications: []
    };
    
    this.createTweakingControls();
    this.isRecording = true;
    
    console.log('🎛️ Started tweaking session');
  }

  createTweakingControls() {
    const container = document.getElementById('tweak-controls');
    if (!container) return;
    
    container.style.display = 'block';
    container.innerHTML = '';
    
    const parameters = [
      { namespace: 'visual', param: 'gridDensity', min: 5, max: 100, step: 1 },
      { namespace: 'visual', param: 'speed', min: 0.1, max: 3, step: 0.1 },
      { namespace: 'visual', param: 'chaos', min: 0, max: 1, step: 0.01 },
      { namespace: 'visual', param: 'morphFactor', min: 0, max: 2, step: 0.1 },
      { namespace: 'color', param: 'hue', min: 0, max: 360, step: 1 },
      { namespace: 'color', param: 'intensity', min: 0, max: 1, step: 0.01 },
      { namespace: 'color', param: 'saturation', min: 0, max: 1, step: 0.01 }
    ];
    
    parameters.forEach(({ namespace, param, min, max, step }) => {
      const currentValue = this.currentPreset.parameters[namespace][param];
      
      const slider = document.createElement('div');
      slider.className = 'tweak-slider';
      slider.innerHTML = `
        <label>${param}</label>
        <input 
          type="range" 
          min="${min}" 
          max="${max}" 
          step="${step}" 
          value="${currentValue}"
          data-namespace="${namespace}"
          data-param="${param}"
        >
        <span class="value">${currentValue}</span>
      `;
      
      const input = slider.querySelector('input');
      const valueDisplay = slider.querySelector('.value');
      
      input.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        valueDisplay.textContent = value.toFixed(2);
        
        // Apply in real-time
        this.applyParameterChange(namespace, param, value);
        
        // Record change
        if (this.isRecording) {
          this.recordParameterChange(namespace, param, value);
        }
      });
      
      container.appendChild(slider);
    });
    
    // Add control buttons
    const controls = document.createElement('div');
    controls.innerHTML = `
      <button onclick="saveTweakedPreset()" style="margin-top: 12px; width: 100%;" class="lab-buttons button">Save as New Preset</button>
      <button onclick="stopTweaking()" style="margin-top: 4px; width: 100%;" class="lab-buttons button">Stop Tweaking</button>
    `;
    container.appendChild(controls);
    
    window.saveTweakedPreset = () => this.saveTweakedPreset();
    window.stopTweaking = () => this.stopTweaking();
  }

  applyParameterChange(namespace, param, value) {
    if (!this.currentPreset) return;
    
    this.currentPreset.parameters[namespace][param] = value;
    
    // Apply to visualizers
    if (window.visualizerAdapter) {
      const visualizers = window.visualizerAdapter.getAllVisualizers();
      visualizers.forEach(visualizer => {
        window.visualizerAdapter.updateVisualizerParameter(
          visualizer.id, namespace, param, value, { immediate: true }
        );
      });
    }
    
    // Update parameter space
    this.initializeParameterSpace();
  }

  recordParameterChange(namespace, param, value) {
    if (!this.tweakingSession) return;
    
    this.tweakingSession.modifications.push({
      timestamp: Date.now(),
      namespace,
      param,
      value
    });
  }

  saveTweakedPreset() {
    if (!this.currentPreset || !this.tweakingSession) return;
    
    const newId = `custom-${Date.now()}`;
    const newPreset = {
      id: newId,
      name: `Custom ${this.currentPreset.name}`,
      description: 'Hand-tweaked preset variation',
      category: 'custom',
      parameters: JSON.parse(JSON.stringify(this.currentPreset.parameters)),
      timestamp: Date.now(),
      usage: 0,
      tweakingSession: this.tweakingSession
    };
    
    this.presets.set(newId, newPreset);
    this.currentPreset = newPreset;
    
    this.updatePresetGrid();
    this.stopTweaking();
    
    console.log('💾 Saved tweaked preset:', newPreset.name);
  }

  stopTweaking() {
    this.tweakingSession = null;
    this.isRecording = false;
    
    const container = document.getElementById('tweak-controls');
    if (container) {
      container.style.display = 'none';
    }
    
    console.log('🛑 Stopped tweaking session');
  }

  generateRandom() {
    const randomPreset = {
      id: `random-${Date.now()}`,
      name: 'Random Discovery',
      description: 'Randomly generated parameters',
      category: 'random',
      parameters: {
        visual: {
          gridDensity: Math.random() * 95 + 5,
          morphFactor: Math.random() * 2,
          chaos: Math.random(),
          speed: Math.random() * 2.9 + 0.1,
          intensity: Math.random() * 0.5 + 0.5
        },
        color: {
          hue: Math.random() * 360,
          intensity: Math.random() * 0.5 + 0.5,
          saturation: Math.random() * 0.5 + 0.5
        },
        rot4d: {
          xw: (Math.random() - 0.5) * 6.28,
          yw: (Math.random() - 0.5) * 6.28,
          zw: (Math.random() - 0.5) * 6.28
        },
        geometry: ['TETRAHEDRON', 'CUBE', 'OCTAHEDRON', 'CRYSTAL', 'TORUS', 'WAVE'][Math.floor(Math.random() * 6)]
      },
      timestamp: Date.now(),
      usage: 0
    };
    
    this.presets.set(randomPreset.id, randomPreset);
    this.loadPreset(randomPreset.id);
    
    console.log('🎲 Generated random preset');
  }

  recordParameters() {
    if (!this.isRecording) {
      this.isRecording = true;
      this.parameterHistory = [];
      console.log('🔴 Started recording parameters');
    } else {
      this.isRecording = false;
      console.log('⏹️ Stopped recording parameters');
      
      if (this.parameterHistory.length > 0) {
        this.createAnimatedPreset();
      }
    }
  }

  createAnimatedPreset() {
    const animatedPreset = {
      id: `animated-${Date.now()}`,
      name: 'Recorded Animation',
      description: 'Animation created from recorded parameters',
      category: 'animated',
      keyframes: this.parameterHistory,
      duration: this.parameterHistory[this.parameterHistory.length - 1].timestamp - this.parameterHistory[0].timestamp,
      timestamp: Date.now(),
      usage: 0
    };
    
    this.presets.set(animatedPreset.id, animatedPreset);
    this.updatePresetGrid();
    
    console.log('🎬 Created animated preset from recording');
  }

  exportPreset(format = 'json') {
    if (!this.currentPreset) return;
    
    let exportData;
    let filename;
    let mimeType;
    
    switch (format) {
      case 'json':
        exportData = JSON.stringify(this.currentPreset, null, 2);
        filename = `${this.currentPreset.id}.json`;
        mimeType = 'application/json';
        break;
        
      case 'css':
        exportData = this.generateCSS(this.currentPreset);
        filename = `${this.currentPreset.id}.css`;
        mimeType = 'text/css';
        break;
        
      case 'shader':
        exportData = this.generateShaderCode(this.currentPreset);
        filename = `${this.currentPreset.id}.glsl`;
        mimeType = 'text/plain';
        break;
        
      case 'trading-card':
        this.exportTradingCard();
        return;
        
      default:
        exportData = JSON.stringify(this.currentPreset, null, 2);
        filename = `${this.currentPreset.id}.json`;
        mimeType = 'application/json';
    }
    
    // Create download
    const blob = new Blob([exportData], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    
    console.log('📦 Exported preset as', format);
  }

  generateCSS(preset) {
    const params = preset.parameters;
    return `
/* Clear Seas Preset: ${preset.name} */
:root {
  --grid-density: ${params.visual.gridDensity};
  --morph-factor: ${params.visual.morphFactor};
  --chaos-level: ${params.visual.chaos};
  --speed-multiplier: ${params.visual.speed};
  --color-hue: ${params.color.hue}deg;
  --color-intensity: ${params.color.intensity};
  --color-saturation: ${params.color.saturation};
  --rot4d-xw: ${params.rot4d.xw}rad;
  --rot4d-yw: ${params.rot4d.yw}rad;
  --rot4d-zw: ${params.rot4d.zw}rad;
  --geometry-type: '${params.geometry}';
}

.polytopal-visualizer {
  --primary-hue: var(--color-hue);
  filter: hue-rotate(var(--color-hue)) 
          saturate(var(--color-saturation)) 
          brightness(var(--color-intensity));
  animation: polytopal-rotation calc(10s / var(--speed-multiplier)) linear infinite;
}

@keyframes polytopal-rotation {
  from { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
  to { transform: rotateX(360deg) rotateY(360deg) rotateZ(360deg); }
}
    `;
  }

  generateShaderCode(preset) {
    const params = preset.parameters;
    return `
// Clear Seas Preset: ${preset.name}
// Generated shader uniforms

uniform float u_gridDensity; // ${params.visual.gridDensity}
uniform float u_morphFactor; // ${params.visual.morphFactor}
uniform float u_chaos; // ${params.visual.chaos}
uniform float u_speed; // ${params.visual.speed}
uniform float u_hue; // ${params.color.hue}
uniform float u_intensity; // ${params.color.intensity}
uniform float u_saturation; // ${params.color.saturation}
uniform float u_rot4d_xw; // ${params.rot4d.xw}
uniform float u_rot4d_yw; // ${params.rot4d.yw}
uniform float u_rot4d_zw; // ${params.rot4d.zw}

vec3 applyPresetTransform(vec3 position) {
    // Apply 4D rotation
    vec4 pos4d = vec4(position, 1.0);
    
    // XW rotation
    float c_xw = cos(u_rot4d_xw);
    float s_xw = sin(u_rot4d_xw);
    vec4 temp = pos4d;
    pos4d.x = c_xw * temp.x - s_xw * temp.w;
    pos4d.w = s_xw * temp.x + c_xw * temp.w;
    
    // Apply morphing and chaos
    pos4d.xyz *= (1.0 + u_morphFactor * sin(pos4d.w * u_gridDensity + u_time * u_speed));
    pos4d.xyz += u_chaos * noise(pos4d.xyz * 10.0) * 0.1;
    
    return pos4d.xyz;
}

vec3 applyPresetColor(vec3 baseColor) {
    vec3 hsv = rgb2hsv(baseColor);
    hsv.x = mod(hsv.x + u_hue / 360.0, 1.0);
    hsv.y *= u_saturation;
    hsv.z *= u_intensity;
    return hsv2rgb(hsv);
}
    `;
  }

  exportTradingCard() {
    if (!this.currentPreset) return;
    
    // This would integrate with your existing trading card system
    console.log('🃏 Exporting trading card for preset:', this.currentPreset.name);
    
    // Create a preview image
    this.generatePreviewImage().then(imageData => {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      
      // Draw card background
      ctx.fillStyle = 'linear-gradient(135deg, #0d1117, #161b22)';
      ctx.fillRect(0, 0, 400, 600);
      
      // Add preset visualization (imageData would be applied here)
      
      // Add text
      ctx.fillStyle = '#3ad4ed';
      ctx.font = 'bold 24px Orbitron';
      ctx.fillText(this.currentPreset.name, 20, 550);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px Orbitron';
      ctx.fillText(this.currentPreset.description, 20, 580);
      
      // Convert to download
      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.currentPreset.id}-card.png`;
        link.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    });
  }

  async generatePreviewImage() {
    // This would capture the current visualizer state
    return new Promise(resolve => {
      setTimeout(() => resolve(null), 100); // Placeholder
    });
  }

  toggleLab() {
    const lab = document.getElementById('preset-laboratory');
    const content = lab.querySelector('.lab-content');
    const toggle = lab.querySelector('.lab-toggle');
    
    if (content.style.display === 'none') {
      content.style.display = 'block';
      toggle.textContent = '−';
    } else {
      content.style.display = 'none';
      toggle.textContent = '+';
    }
  }

  setupParameterMonitoring() {
    // Monitor parameter changes from other systems
    if (window.visualizerAdapter) {
      const originalUpdate = window.visualizerAdapter.updateVisualizerParameter.bind(window.visualizerAdapter);
      
      window.visualizerAdapter.updateVisualizerParameter = (visualizerId, namespace, param, value, options) => {
        const result = originalUpdate(visualizerId, namespace, param, value, options);
        
        if (this.isRecording) {
          this.parameterHistory.push({
            timestamp: Date.now(),
            visualizerId,
            namespace,
            param,
            value
          });
        }
        
        return result;
      };
    }
  }

  // Public API
  getPreset(id) {
    return this.presets.get(id);
  }

  getAllPresets() {
    return Array.from(this.presets.values());
  }

  deletePreset(id) {
    if (this.presets.has(id) && this.presets.get(id).category !== 'system') {
      this.presets.delete(id);
      this.updatePresetGrid();
      return true;
    }
    return false;
  }
}

// Initialize Laboratory
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    window.presetLab = new PresetLaboratory();
    console.log('🧪 Preset Laboratory - Ready for experimentation');
  }, 1000); // Wait for other systems to initialize
});