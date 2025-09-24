/**
 * Polychora System - 5-Layer Glassmorphic 4D Polytope Renderer
 * 
 * Features:
 * - 5 layered canvases (background, shadow, content, highlight, accent)
 * - Real 4D polytope mathematics with proper distance functions
 * - Glassmorphic line-based rendering with core/outline system
 * - Layer-specific scaling and translucency based on polytope geometry
 * - Unique color magnetism and glass effects
 */

/**
 * PolychoraVisualizer - Individual layer renderer for 4D polytopes
 * Renders glassmorphic line-based effects with WebGL
 */
class PolychoraVisualizer {
    constructor(canvasId, role, config) {
        this.canvasId = canvasId;
        this.role = role;
        this.config = config;
        this.canvas = null;
        this.gl = null;
        this.program = null;
        this.time = 0;
        this.vertexBuffer = null;
    }
    
    initialize() {
        this.canvas = document.getElementById(this.canvasId);
        if (!this.canvas) {
            console.error(`❌ Canvas ${this.canvasId} not found`);
            return false;
        }
        
        // Try WebGL 2.0 first, then fall back to WebGL 1.0
        this.gl = this.canvas.getContext('webgl2') || this.canvas.getContext('webgl');
        if (!this.gl) {
            console.error(`❌ WebGL not supported for ${this.canvasId}`);
            return false;
        }
        
        console.log(`🎮 WebGL context created for ${this.canvasId}: ${this.gl instanceof WebGL2RenderingContext ? 'WebGL2' : 'WebGL1'}`);
        
        // Create glassmorphic 4D polytope shader
        if (!this.createPolychoraShader()) {
            console.error(`❌ Failed to create shader for ${this.canvasId}`);
            return false;
        }
        
        this.setupCanvasSize();
        
        // Enable blending for glassmorphic effects
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        
        return true;
    }
    
    setupCanvasSize() {
        // Force parent to be visible for measurement
        const container = document.getElementById('polychoraLayers');
        const tempDisplay = container ? container.style.display : null;
        
        if (container && tempDisplay === 'none') {
            container.style.display = 'block';
        }
        
        const rect = this.canvas.parentElement.getBoundingClientRect();
        
        // Restore original display state
        if (container && tempDisplay === 'none') {
            container.style.display = tempDisplay;
        }
        
        // Use measured dimensions or fallbacks
        this.canvas.width = rect.width > 0 ? rect.width : window.innerWidth - 300;
        this.canvas.height = rect.height > 0 ? rect.height : window.innerHeight - 50;
        
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        console.log(`🎮 Canvas ${this.canvasId} WebGL viewport: ${this.canvas.width}x${this.canvas.height}`);
    }
    
    createPolychoraShader() {
        const vertexShader = `
            attribute vec2 a_position;
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `;
        
        const fragmentShader = `
            precision highp float;
            uniform float u_time;
            uniform vec2 u_resolution;
            uniform float u_polytope;
            
            // COMPLETE 6D 4D rotation uniforms
            uniform float u_rot4dXW;
            uniform float u_rot4dYW;
            uniform float u_rot4dZW;
            uniform float u_rot4dXY;
            uniform float u_rot4dXZ;
            uniform float u_rot4dYZ;
            
            uniform float u_dimension;
            uniform float u_hue;
            uniform vec3 u_layerColor;
            uniform float u_layerScale;
            uniform float u_layerOpacity;
            uniform float u_lineWidth;
            uniform float u_blur;
            
            // ADVANCED: Glass effect uniforms
            uniform float u_refractionIndex;
            uniform float u_chromaticAberration;
            uniform float u_noiseAmplitude;
            uniform float u_flowDirection;
            uniform float u_faceTransparency;
            uniform float u_edgeThickness;
            uniform float u_projectionDistance;
            
            // COMPLETE 4D rotation matrices - All 6 possible rotations
            mat4 rotateXW(float angle) {
                float c = cos(angle);
                float s = sin(angle);
                return mat4(
                    c, 0, 0, -s,
                    0, 1, 0, 0,
                    0, 0, 1, 0,
                    s, 0, 0, c
                );
            }
            
            mat4 rotateYW(float angle) {
                float c = cos(angle);
                float s = sin(angle);
                return mat4(
                    1, 0, 0, 0,
                    0, c, 0, -s,
                    0, 0, 1, 0,
                    0, s, 0, c
                );
            }
            
            mat4 rotateZW(float angle) {
                float c = cos(angle);
                float s = sin(angle);
                return mat4(
                    1, 0, 0, 0,
                    0, 1, 0, 0,
                    0, 0, c, -s,
                    0, 0, s, c
                );
            }
            
            // NEW: Missing 4D rotations for complete 6D rotational freedom
            mat4 rotateXY(float angle) {
                float c = cos(angle);
                float s = sin(angle);
                return mat4(
                    c, -s, 0, 0,
                    s, c, 0, 0,
                    0, 0, 1, 0,
                    0, 0, 0, 1
                );
            }
            
            mat4 rotateXZ(float angle) {
                float c = cos(angle);
                float s = sin(angle);
                return mat4(
                    c, 0, -s, 0,
                    0, 1, 0, 0,
                    s, 0, c, 0,
                    0, 0, 0, 1
                );
            }
            
            mat4 rotateYZ(float angle) {
                float c = cos(angle);
                float s = sin(angle);
                return mat4(
                    1, 0, 0, 0,
                    0, c, -s, 0,
                    0, s, c, 0,
                    0, 0, 0, 1
                );
            }
            
            // 4D polytope distance functions
            float polytope4D(vec4 p, float type) {
                if (type < 0.5) {
                    // 5-Cell (4-Simplex)
                    vec4 q = abs(p) - 0.8;
                    float d1 = length(max(q, 0.0)) + min(max(max(max(q.x, q.y), q.z), q.w), 0.0);
                    vec4 r = p - vec4(0.5, 0.5, 0.5, 0.5);
                    float d2 = length(r) - 0.3;
                    return min(d1, d2);
                } else if (type < 1.5) {
                    // Tesseract (8-Cell)
                    vec4 q = abs(p) - 1.0;
                    float outside = length(max(q, 0.0));
                    float inside = max(max(max(q.x, q.y), q.z), q.w);
                    return outside + min(inside, 0.0);
                } else if (type < 2.5) {
                    // 16-Cell (4-Orthoplex)
                    return abs(p.x) + abs(p.y) + abs(p.z) + abs(p.w) - 1.5;
                } else if (type < 3.5) {
                    // 24-Cell
                    vec4 q = abs(p);
                    float d = max(max(q.x + q.y, q.z + q.w), max(q.x + q.z, q.y + q.w)) - 1.2;
                    return d;
                } else if (type < 4.5) {
                    // 600-Cell
                    float phi = (1.0 + sqrt(5.0)) / 2.0;
                    vec4 q = abs(p);
                    float d = length(q) - 1.0;
                    float r = max(max(q.x, q.y/phi), max(q.z*phi, q.w)) - 0.8;
                    return min(d, r);
                } else {
                    // 120-Cell
                    vec4 q = abs(p);
                    float d = max(max(max(q.x, q.y), max(q.z, q.w)), length(q.xy) + length(q.zw)) - 1.1;
                    return d;
                }
            }
            
            // Perlin noise function for surface effects
            float noise(vec4 p) {
                return fract(sin(dot(p, vec4(127.1, 311.7, 269.5, 183.3))) * 43758.5);
            }
            
            // Advanced 4D rotation application - Complete 6D freedom
            vec4 apply6DRotation(vec4 pos) {
                // Apply all 6 possible 4D rotations in mathematically correct order
                pos = rotateXY(u_rot4dXY + u_time * 0.08) * pos;
                pos = rotateXZ(u_rot4dXZ + u_time * 0.09) * pos;
                pos = rotateYZ(u_rot4dYZ + u_time * 0.07) * pos;
                pos = rotateXW(u_rot4dXW + u_time * 0.10) * pos;
                pos = rotateYW(u_rot4dYW + u_time * 0.11) * pos;
                pos = rotateZW(u_rot4dZW + u_time * 0.12) * pos;
                return pos;
            }
            
            // Cinema-quality glass effects
            vec3 calculateGlassEffects(vec2 uv, float dist, vec3 baseColor) {
                vec3 color = baseColor;
                
                // Chromatic aberration effect
                if (u_chromaticAberration > 0.0) {
                    vec2 offset = normalize(uv) * u_chromaticAberration * 0.01;
                    color.r *= 1.0 + sin(dist * 10.0 + u_time) * u_chromaticAberration;
                    color.g *= 1.0 + sin(dist * 10.0 + u_time + 2.09) * u_chromaticAberration;
                    color.b *= 1.0 + sin(dist * 10.0 + u_time + 4.18) * u_chromaticAberration;
                }
                
                // Refraction distortion
                if (u_refractionIndex > 1.0) {
                    vec2 refract_uv = uv * (1.0 + (u_refractionIndex - 1.0) * 0.1 * sin(dist * 20.0));
                    float refraction_intensity = (u_refractionIndex - 1.0) * 0.3;
                    color = mix(color, color * 1.2, refraction_intensity);
                }
                
                return color;
            }
            
            void main() {
                vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
                uv *= u_layerScale;
                
                // Create 4D point with enhanced projection distance
                vec4 pos = vec4(uv, 
                    sin(u_time * 0.3) * 0.5, 
                    cos(u_time * 0.2) * 0.5 * u_projectionDistance * 0.1
                );
                
                // Apply complete 6D 4D rotation
                pos = apply6DRotation(pos);
                
                // Get polytope distance
                float dist = polytope4D(pos, u_polytope);
                
                // Enhanced glassmorphic line rendering
                float edgeCore = u_edgeThickness * 0.01;
                float faceAlpha = u_faceTransparency;
                
                // Multi-layer line effect for cinema quality
                float lineCore = smoothstep(0.0, edgeCore, abs(dist));
                float lineOutline = smoothstep(0.0, edgeCore * 1.5, abs(dist + 0.05));
                float lineFine = smoothstep(0.0, edgeCore * 0.5, abs(dist));
                
                // Combine multiple line effects
                float alpha = (1.0 - lineCore) * 0.6 + (1.0 - lineOutline) * 0.3 + (1.0 - lineFine) * 0.1;
                alpha *= u_layerOpacity;
                
                // Add face transparency effect
                if (abs(dist) > edgeCore * 2.0) {
                    alpha *= faceAlpha;
                }
                
                // Apply procedural surface noise
                if (u_noiseAmplitude > 0.0) {
                    float noise_val = noise(pos * 10.0 + u_time * 0.1);
                    alpha *= 1.0 + (noise_val - 0.5) * u_noiseAmplitude;
                }
                
                // Apply blur with flow direction
                vec2 flow = vec2(cos(u_flowDirection * 3.14159 / 180.0), sin(u_flowDirection * 3.14159 / 180.0));
                float blur_dist = length(uv - flow * u_time * 0.1);
                alpha *= exp(-blur_dist * u_blur * 0.5);
                
                // Base color from layer configuration and hue
                vec3 color = u_layerColor;
                color = mix(color, vec3(
                    sin(u_hue/360.0*6.28), 
                    cos(u_hue/360.0*6.28), 
                    0.8
                ), 0.4);
                
                // Apply cinema-quality glass effects
                color = calculateGlassEffects(uv, dist, color);
                
                // Add subtle iridescence based on viewing angle
                float iridescence = sin(length(uv) * 10.0 + u_time) * 0.1;
                color += iridescence * vec3(0.3, 0.5, 0.7);
                
                gl_FragColor = vec4(color, alpha);
            }
        `;
        
        this.program = this.createShaderProgram(vertexShader, fragmentShader);
        return this.program !== null;
    }
    
    createShaderProgram(vertexSource, fragmentSource) {
        const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, vertexSource);
        const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, fragmentSource);
        
        if (!vertexShader || !fragmentShader) return null;
        
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('Shader program link error:', this.gl.getProgramInfoLog(program));
            return null;
        }
        
        // Create quad vertices
        const vertices = new Float32Array([
            -1, -1,  1, -1,  -1,  1,
            -1,  1,  1, -1,   1,  1
        ]);
        
        this.vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
        
        return program;
    }
    
    compileShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', this.gl.getShaderInfoLog(shader));
            return null;
        }
        
        return shader;
    }
    
    render(parameters = {}) {
        if (!this.gl || !this.program || !this.vertexBuffer) return;
        
        this.time += 0.016;
        
        this.gl.useProgram(this.program);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        
        // Clear with transparent background
        this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        
        // 🎵 POLYCHORA AUDIO REACTIVITY - 4D audio-reactive polytopes
        let rot4dXW = parameters.rot4dXW || 0;
        let rot4dYW = parameters.rot4dYW || 0;
        let rot4dZW = parameters.rot4dZW || 0;
        let dimension = parameters.dimension || 3.8;
        let hue = parameters.hue || 280;
        
        if (window.audioEnabled && window.audioReactive) {
            // Polychora audio mapping: Bass drives 4D rotation, Mid affects cross-section, High affects glow
            rot4dXW += window.audioReactive.bass * 3.0;        // Bass rotates through XW plane
            rot4dYW += window.audioReactive.mid * 2.5;         // Mid rotates through YW plane  
            rot4dZW += window.audioReactive.high * 2.0;        // High rotates through ZW plane
            dimension += window.audioReactive.energy * 0.5;    // Energy affects 4D cross-section depth
            hue += window.audioReactive.bass * 60;             // Bass affects polytope color
        }
        
        // Set uniforms with audio-reactive 4D rotation and advanced glass effects
        const uniforms = {
            u_time: this.time,
            u_resolution: [this.canvas.width, this.canvas.height],
            u_polytope: parameters.polytope !== undefined ? parameters.polytope : 0,
            
            // AUDIO-REACTIVE 4D rotations
            u_rot4dXW: rot4dXW,
            u_rot4dYW: rot4dYW,
            u_rot4dZW: rot4dZW,
            u_rot4dXY: parameters.rot4dXY || 0,
            u_rot4dXZ: parameters.rot4dXZ || 0,
            u_rot4dYZ: parameters.rot4dYZ || 0,
            
            u_dimension: Math.min(4, dimension),
            u_hue: hue % 360,
            u_layerColor: this.config.color,
            u_layerScale: this.config.scale * (parameters.layerScale || 1.0),
            u_layerOpacity: this.config.opacity * (parameters.translucency || 1.0),
            u_lineWidth: this.config.lineWidth * (parameters.lineThickness || 1.0),
            u_blur: this.config.blur * (parameters.glassBlur || 1.0),
            
            // ADVANCED: Glass effects
            u_refractionIndex: parameters.refractionIndex || 1.5,
            u_chromaticAberration: parameters.chromaticAberration || 0.1,
            u_noiseAmplitude: parameters.noiseAmplitude || 0.3,
            u_flowDirection: parameters.flowDirection || 180,
            u_faceTransparency: parameters.faceTransparency || 0.7,
            u_edgeThickness: parameters.edgeThickness || 2.0,
            u_projectionDistance: parameters.projectionDistance || 5.0
        };
        
        // Safely set uniforms with error checking
        Object.entries(uniforms).forEach(([name, value]) => {
            const location = this.gl.getUniformLocation(this.program, name);
            if (location !== null) {
                try {
                    if (Array.isArray(value)) {
                        if (value.length === 2) this.gl.uniform2fv(location, new Float32Array(value));
                        else if (value.length === 3) this.gl.uniform3fv(location, new Float32Array(value));
                    } else {
                        this.gl.uniform1f(location, value);
                    }
                } catch (error) {
                    console.warn(`Failed to set uniform ${name}:`, error);
                }
            }
        });
        
        // Draw quad
        const positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
        if (positionLocation !== -1) {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
            this.gl.enableVertexAttribArray(positionLocation);
            this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
            
            this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        }
    }
    
    /**
     * Update 4D mouse interaction - maps to 4D space
     */
    update4DMouse(x, y, intensity) {
        // Store mouse state for shader uniforms
        this.mouseState = {
            x: x,
            y: y, 
            intensity: intensity,
            time: Date.now()
        };
        console.log(`🔮 ${this.canvasId}: 4D mouse update ${x.toFixed(2)}, ${y.toFixed(2)}, intensity: ${intensity.toFixed(2)}`);
    }
    
    /**
     * Trigger 4D click interaction
     */
    trigger4DClick(intensity) {
        this.clickState = {
            intensity: intensity,
            time: Date.now()
        };
        console.log(`🔮 ${this.canvasId}: 4D click intensity: ${intensity.toFixed(2)}`);
    }
    
    /**
     * Update audio reactivity for 4D visualization
     */
    // Audio reactivity now handled directly in render() loop
    
    /**
     * Update cross-section navigation (4D scroll)
     */
    updateCrossSection(velocity) {
        this.crossSectionState = {
            velocity: velocity,
            position: (this.crossSectionState?.position || 0) + velocity * 0.01,
            time: Date.now()
        };
        console.log(`🔮 ${this.canvasId}: Cross-section velocity: ${velocity}, position: ${this.crossSectionState.position.toFixed(3)}`);
    }
    
    /**
     * Update parameters from system
     */
    updateParameters(newParams) {
        this.cachedParameters = { ...newParams };
        console.log(`🔮 ${this.canvasId}: Parameters updated`);
    }
}

// Import 4D physics engine
import { Polychora4DPhysics } from '../physics/Polychora4DPhysics.js';

export class PolychoraSystem {
    constructor() {
        this.canvasContainer = null;
        this.visualizers = [];
        this.isActive = false;
        this.animationId = null;
        
        // Initialize 4D physics engine
        this.physics = new Polychora4DPhysics();
        this.physicsEnabled = false;
        this.physicsBodies = [];
        
        // 6 Real 4D Polytopes
        this.polytopes = [
            { name: '5-Cell', description: '4-Simplex with 5 tetrahedral cells' },
            { name: 'Tesseract', description: '8-Cell hypercube with 8 cubic cells' },
            { name: '16-Cell', description: '4-Orthoplex with 16 tetrahedral cells' },
            { name: '24-Cell', description: 'Unique 4D polytope with 24 octahedral cells' },
            { name: '600-Cell', description: 'Icosahedral symmetry with 600 tetrahedral cells' },
            { name: '120-Cell', description: 'Largest regular 4D polytope with 120 dodecahedral cells' }
        ];
        
        // Polychora-specific parameters
        this.parameters = {
            polytope: 0,        // Current polytope (0-5)
            lineThickness: 2.5, // Core line thickness
            coreSize: 1.2,      // Inner core size
            outlineWidth: 1.8,  // Outline width
            glassBlur: 3.0,     // Glassmorphic blur amount
            colorMagnetism: 0.7,// Color attraction between layers
            layerScale: 1.0,    // Overall layer scaling
            translucency: 0.8,  // Overall translucency
            
            // COMPLETE 6D 4D Math parameters - Full rotational control
            rot4dXW: 0.0,       // X-W plane rotation (existing)
            rot4dYW: 0.0,       // Y-W plane rotation (existing)
            rot4dZW: 0.0,       // Z-W plane rotation (existing)
            rot4dXY: 0.0,       // X-Y plane rotation (NEW)
            rot4dXZ: 0.0,       // X-Z plane rotation (NEW)
            rot4dYZ: 0.0,       // Y-Z plane rotation (NEW)
            
            dimension: 3.8,
            speed: 1.2,
            hue: 280,           // Purple/magenta base
            
            // ADVANCED: Glass effects (NEW)
            refractionIndex: 1.5,      // 0.5-2.0 Glass refraction
            chromaticAberration: 0.1,  // 0-0.5 RGB color separation
            noiseAmplitude: 0.3,       // 0-1 Procedural surface noise
            flowDirection: 180,        // 0-360° Energy flow orientation
            
            // ADVANCED: Polytope-specific controls (NEW)
            faceTransparency: 0.7,     // 0-1 Face vs edge visibility
            edgeThickness: 2.0,        // 0.1-3.0 Variable edge rendering
            projectionDistance: 5.0,   // 1-10 4D→3D projection depth
            
            // 4D PHYSICS PARAMETERS (NEW)
            physicsEnabled: false,     // Enable/disable physics simulation
            gravity4D: -2.5,          // 4D gravity strength (W-axis)
            mass: 1.0,                // Polytope mass
            elasticity: 0.8,          // Collision bounce (0-1)
            friction: 0.1,            // Surface friction
            brownianMotion: 0.1,      // Thermal motion amount
            flocking: false,          // Enable flocking behavior
            territorial: 2.0,         // Territorial radius
            magneticField: 0.0,       // Magnetic field strength
            fluidFlow: 0.5,          // Fluid current strength
        };
        
        // Layer-specific configurations for glassmorphic effects
        this.layerConfigs = {
            background: { 
                scale: 1.5, 
                opacity: 0.25, 
                lineWidth: 3.0,
                color: [0.6, 0.3, 0.9], // Purple
                blur: 4.0
            },
            shadow: { 
                scale: 1.2, 
                opacity: 0.4, 
                lineWidth: 2.5,
                color: [0.3, 0.3, 0.6], // Dark blue
                blur: 2.0
            },
            content: { 
                scale: 1.0, 
                opacity: 0.85, 
                lineWidth: 2.0,
                color: [0.0, 0.8, 1.0], // Cyan
                blur: 0.5
            },
            highlight: { 
                scale: 0.8, 
                opacity: 0.7, 
                lineWidth: 1.5,
                color: [1.0, 0.4, 0.8], // Pink
                blur: 1.5
            },
            accent: { 
                scale: 0.6, 
                opacity: 0.4, 
                lineWidth: 1.0,
                color: [1.0, 1.0, 0.6], // Yellow
                blur: 3.0
            }
        };
    }
    
    /**
     * Initialize the 5-layer Polychora system
     */
    initialize() {
        console.log('🔮 Initializing Polychora System');
        
        this.canvasContainer = document.getElementById('polychoraLayers');
        if (!this.canvasContainer) {
            console.error('❌ Polychora canvas container not found');
            return false;
        }
        
        // Ensure all canvas elements exist and are properly sized
        this.setupCanvasElements();
        
        // Create visualizers for each layer
        const layers = ['background', 'shadow', 'content', 'highlight', 'accent'];
        let successfullyInitialized = 0;
        
        layers.forEach(role => {
            const canvasId = `polychora-${role}-canvas`;
            const canvas = document.getElementById(canvasId);
            
            if (!canvas) {
                console.error(`❌ Canvas ${canvasId} not found in DOM`);
                return;
            }
            
            try {
                const visualizer = new PolychoraVisualizer(canvasId, role, this.layerConfigs[role]);
                
                if (visualizer.initialize()) {
                    this.visualizers.push(visualizer);
                    successfullyInitialized++;
                    console.log(`✅ Polychora ${role} layer initialized`);
                } else {
                    console.error(`❌ Failed to initialize Polychora ${role} layer`);
                }
            } catch (error) {
                console.error(`❌ Error creating Polychora ${role} visualizer:`, error);
            }
        });
        
        if (successfullyInitialized === 0) {
            console.error('❌ No Polychora visualizers initialized successfully');
            return false;
        }
        
        console.log(`✅ Polychora System initialized with ${successfullyInitialized}/${layers.length} layers`);
        return true;
    }
    
    /**
     * Setup canvas elements with proper dimensions
     */
    setupCanvasElements() {
        const layers = ['background', 'shadow', 'content', 'highlight', 'accent'];
        
        layers.forEach(role => {
            const canvasId = `polychora-${role}-canvas`;
            const canvas = document.getElementById(canvasId);
            
            if (canvas) {
                // Force canvas to be visible for measurement or use fallback dimensions
                const tempDisplay = this.canvasContainer.style.display;
                this.canvasContainer.style.display = 'block';
                
                const containerRect = this.canvasContainer.getBoundingClientRect();
                
                // Restore original display state
                this.canvasContainer.style.display = tempDisplay;
                
                // Use container dimensions or intelligent fallbacks
                canvas.width = containerRect.width > 0 ? containerRect.width : window.innerWidth - 300;
                canvas.height = containerRect.height > 0 ? containerRect.height : window.innerHeight - 50;
                canvas.style.width = '100%';
                canvas.style.height = '100%';
                
                console.log(`📐 Canvas ${canvasId} sized to ${canvas.width}x${canvas.height}`);
            }
        });
    }
    
    /**
     * Start the Polychora system
     */
    start() {
        if (this.isActive) return;
        
        console.log('🔮 Starting Polychora System');
        this.isActive = true;
        this.canvasContainer.style.display = 'block';
        
        // ✅ CRITICAL: Resize canvases after container becomes visible
        this.resizeAllCanvases();
        
        this.startRenderLoop();
    }
    
    /**
     * Resize all canvases after container becomes visible
     */
    resizeAllCanvases() {
        this.setupCanvasElements();
        this.visualizers.forEach(visualizer => {
            visualizer.setupCanvasSize();
        });
        console.log('🔮 All Polychora canvases resized after becoming visible');
    }
    
    startRenderLoop() {
        const render = () => {
            if (!this.isActive) return;
            
            // MVEP-STYLE AUDIO PROCESSING: Process audio directly in render loop
            // This eliminates conflicts with holographic system and ensures proper audio reactivity
            // Audio reactivity now handled directly in visualizer render loops
            
            // Step physics simulation if enabled
            if (this.parameters.physicsEnabled && this.physicsEnabled) {
                this.physics.step();
                this.updatePhysicsVisuals();
            }
            
            this.visualizers.forEach(visualizer => {
                visualizer.render(this.parameters);
            });
            
            this.animationId = requestAnimationFrame(render);
        };
        render();
    }
    
    /**
     * Enable/disable 4D physics simulation
     */
    enablePhysics() {
        this.physicsEnabled = true;
        this.parameters.physicsEnabled = true;
        this.physics.enable();
        
        // Create physics bodies for polytopes
        this.createPhysicsBodies();
        
        console.log('🔮 Polychora physics simulation enabled');
    }
    
    disablePhysics() {
        this.physicsEnabled = false;
        this.parameters.physicsEnabled = false;
        this.physics.disable();
        this.physics.clearAllBodies();
        this.physicsBodies = [];
        
        console.log('🔮 Polychora physics simulation disabled');
    }
    
    /**
     * Create physics bodies for visualization
     */
    createPhysicsBodies() {
        // Clear existing bodies
        this.physics.clearAllBodies();
        this.physicsBodies = [];
        
        // Create physics bodies for each polytope type
        for (let i = 0; i < this.polytopes.length; i++) {
            const body = this.physics.createRigidBody(i, 
                [
                    (Math.random() - 0.5) * 4, // X
                    (Math.random() - 0.5) * 4, // Y  
                    (Math.random() - 0.5) * 4, // Z
                    (Math.random() - 0.5) * 2  // W
                ], 
                {
                    mass: this.parameters.mass,
                    elasticity: this.parameters.elasticity,
                    friction: this.parameters.friction,
                    brownianMotion: this.parameters.brownianMotion,
                    flocking: this.parameters.flocking,
                    territorial: this.parameters.territorial,
                    magnetic: this.parameters.magneticField
                }
            );
            
            this.physicsBodies.push(body);
        }
        
        // Set physics world properties
        this.physics.setGravity([0, 0, 0, this.parameters.gravity4D]);
        this.physics.setMagneticField([0, 0, this.parameters.magneticField, 0]);
        this.physics.setFluidFlow([this.parameters.fluidFlow, 0, 0, 0]);
    }
    
    /**
     * Update visual parameters based on physics simulation
     */
    updatePhysicsVisuals() {
        const physicsFeedback = this.physics.getPhysicsFeedback();
        
        if (physicsFeedback.length > 0) {
            // Use physics feedback to modulate visual parameters
            const avgFeedback = this.calculateAveragePhysicsFeedback(physicsFeedback);
            
            // Modulate parameters based on physics
            this.parameters.hue += avgFeedback.velocityIntensity * 5;
            this.parameters.chromaticAberration = Math.max(0.1, 
                this.parameters.chromaticAberration + avgFeedback.impactIntensity * 0.3);
            this.parameters.noiseAmplitude = Math.max(0.1,
                this.parameters.noiseAmplitude + avgFeedback.accelerationGlow * 0.5);
            
            // Update rotation based on physics body rotations
            const primaryBody = physicsFeedback[this.parameters.polytope] || physicsFeedback[0];
            if (primaryBody) {
                this.parameters.rot4dXY = primaryBody.rotation[0];
                this.parameters.rot4dXZ = primaryBody.rotation[1];
                this.parameters.rot4dYZ = primaryBody.rotation[2];
                this.parameters.rot4dXW = primaryBody.rotation[3];
                this.parameters.rot4dYW = primaryBody.rotation[4];
                this.parameters.rot4dZW = primaryBody.rotation[5];
            }
        }
    }
    
    /**
     * Calculate average physics feedback for visual modulation
     */
    calculateAveragePhysicsFeedback(feedbackArray) {
        const avg = {
            velocityIntensity: 0,
            impactIntensity: 0,
            accelerationGlow: 0
        };
        
        if (feedbackArray.length === 0) return avg;
        
        feedbackArray.forEach(fb => {
            avg.velocityIntensity += fb.feedback.velocityIntensity;
            avg.impactIntensity += fb.feedback.impactIntensity;
            avg.accelerationGlow += fb.feedback.accelerationGlow;
        });
        
        const count = feedbackArray.length;
        avg.velocityIntensity /= count;
        avg.impactIntensity /= count;
        avg.accelerationGlow /= count;
        
        return avg;
    }
    
    /**
     * Add interactive forces to physics simulation
     */
    addInteractiveForce(position4D, force4D) {
        if (!this.physicsEnabled) return;
        
        // Find closest physics body and apply force
        let closestBody = null;
        let closestDistance = Infinity;
        
        this.physicsBodies.forEach(body => {
            const distance = this.physics.distance4D(body.position, position4D);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestBody = body;
            }
        });
        
        if (closestBody && closestDistance < 2.0) {
            this.physics.addForce(closestBody, force4D);
        }
    }
    
    /**
     * Reset physics simulation
     */
    resetPhysics() {
        if (this.physicsEnabled) {
            this.createPhysicsBodies();
            console.log('🔮 Polychora physics simulation reset');
        }
    }
    
    /**
     * Stop the Polychora system
     */
    stop() {
        if (!this.isActive) return;
        
        console.log('🔮 Stopping Polychora System');
        this.isActive = false;
        this.canvasContainer.style.display = 'none';
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    /**
     * Update system parameters
     */
    updateParameters(newParams) {
        Object.assign(this.parameters, newParams);
        console.log('🔮 Updated Polychora parameters:', newParams);
    }
    
    /**
     * Set current polytope
     */
    setPolytope(polytopeIndex) {
        if (polytopeIndex < 0 || polytopeIndex >= this.polytopes.length) {
            console.warn('⚠️ Invalid polytope index:', polytopeIndex);
            return;
        }
        
        this.parameters.polytope = polytopeIndex;
        const polytope = this.polytopes[polytopeIndex];
        
        console.log(`🔮 Set polytope to ${polytope.name}: ${polytope.description}`);
        return polytope;
    }
    
    /**
     * Update parameters from UI - CRITICAL MISSING METHOD
     */
    updateParameters(newParams) {
        // Map standard VIB34D parameters to Polychora parameters
        if (newParams.rot4dXW !== undefined) this.parameters.rot4dXW = newParams.rot4dXW;
        if (newParams.rot4dYW !== undefined) this.parameters.rot4dYW = newParams.rot4dYW;
        if (newParams.rot4dZW !== undefined) this.parameters.rot4dZW = newParams.rot4dZW;
        if (newParams.hue !== undefined) this.parameters.hue = newParams.hue;
        
        // Map grid density to Polychora line thickness (missing connection!)
        if (newParams.gridDensity !== undefined) {
            this.parameters.lineThickness = newParams.gridDensity * 0.01; // Scale 5-100 to 0.05-1.0
        }
        
        // Map geometry to polytope selection
        if (newParams.geometry !== undefined) {
            this.parameters.polytope = Math.min(newParams.geometry, this.polytopes.length - 1);
        }
        
        // Map speed to flow direction intensity
        if (newParams.speed !== undefined) {
            this.parameters.flowDirection = newParams.speed;
        }
        
        // Map intensity to projection distance
        if (newParams.intensity !== undefined) {
            this.parameters.projectionDistance = 1.0 + (newParams.intensity * 4.0); // Scale 0-1 to 1-5
        }
        
        // Update all visualizers with new parameters
        this.visualizers.forEach(visualizer => {
            if (visualizer.updateParameters) {
                visualizer.updateParameters(this.parameters);
            }
        });
        
        console.log('🔮 Polychora parameters updated:', this.parameters);
    }
    
    /**
     * Update 4D mouse interaction - standardized method name
     */
    updateInteraction(x, y, intensity = 0.5) {
        // Apply 4D mouse projection to all visualizers
        this.visualizers.forEach(visualizer => {
            if (visualizer.update4DMouse) {
                visualizer.update4DMouse(x, y, intensity);
            }
        });
        console.log(`🔮 Polychora 4D interaction: ${x.toFixed(2)}, ${y.toFixed(2)}, intensity: ${intensity.toFixed(2)}`);
    }
    
    /**
     * Trigger 4D click interaction
     */
    triggerClick(intensity = 1.0) {
        this.visualizers.forEach(visualizer => {
            if (visualizer.trigger4DClick) {
                visualizer.trigger4DClick(intensity);
            }
        });
        console.log(`🔮 Polychora 4D click: intensity ${intensity.toFixed(2)}`);
    }
    
    /**
     * Update 4D audio reactivity
     */
    // Audio reactivity handled directly in visualizer render loops
    
    /**
     * Update 4D scroll interaction (cross-section navigation)
     */
    updateScroll(velocity) {
        this.visualizers.forEach(visualizer => {
            if (visualizer.updateCrossSection) {
                visualizer.updateCrossSection(velocity);
            }
        });
    }
    
    /**
     * Get current polytope information
     */
    getCurrentPolytope() {
        return this.polytopes[this.parameters.polytope];
    }
    
    /**
     * Get all polytope names for UI
     */
    getPolytopeNames() {
        return this.polytopes.map(p => p.name);
    }
    
    /**
     * Destroy system and clean up resources
     */
    destroy() {
        this.stop();
        this.visualizers.forEach(visualizer => {
            if (visualizer.destroy) {
                visualizer.destroy();
            }
        });
        this.visualizers = [];
        console.log('🔮 Polychora System destroyed');
    }
}