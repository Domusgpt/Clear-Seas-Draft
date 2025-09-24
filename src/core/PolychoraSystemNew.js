/**
 * VIB34D Polychora Engine - TRUE 4D POLYTOPE MATHEMATICS
 * Uses identical DNA to other systems but with real 4D polytope rendering
 * 
 * SYSTEM DNA:
 * ✅ ParameterManager integration
 * ✅ 5-layer WebGL system with role-based rendering
 * ✅ 8 VIB34D geometries with unique 4D implementations
 * ✅ Audio reactivity with bass/mid/high mapping
 * ✅ 4D rotation mathematics matching other systems
 * ✅ HSV color system integration
 */

import { ParameterManager } from './Parameters.js';

/**
 * True4DPolychoraVisualizer - Individual layer renderer for 4D polytopes
 * Follows exact DNA pattern from other visualizers
 */
class True4DPolychoraVisualizer {
    constructor(canvasId, role, config) {
        this.canvasId = canvasId;
        this.role = role; // background, shadow, content, highlight, accent
        this.config = config;
        this.canvas = null;
        this.gl = null;
        this.program = null;
        this.time = 0;
        this.vertexBuffer = null;
        
        // Layer-specific properties following DNA pattern
        this.layerIntensity = this.getLayerIntensity(role);
        this.layerScale = this.getLayerScale(role);
        this.layerColor = this.getLayerColor(role);
    }
    
    getLayerIntensity(role) {
        const intensities = {
            'background': 0.1,   // Subtle base
            'shadow': 0.3,       // Depth
            'content': 1.0,      // Main content
            'highlight': 0.7,    // Bright accents
            'accent': 0.5        // Detail layer
        };
        return intensities[role] || 0.5;
    }
    
    getLayerScale(role) {
        const scales = {
            'background': 1.0,   // Base scale
            'shadow': 1.1,       // Slightly larger for shadow
            'content': 1.0,      // Normal scale
            'highlight': 0.9,    // Slightly smaller for highlights
            'accent': 0.8        // Smallest for fine details
        };
        return scales[role] || 1.0;
    }
    
    getLayerColor(role) {
        const colors = {
            'background': [0.1, 0.1, 0.2],   // Dark blue base
            'shadow': [0.0, 0.0, 0.1],       // Dark shadow
            'content': [0.5, 0.3, 0.8],      // Purple main
            'highlight': [0.8, 0.6, 1.0],    // Bright purple
            'accent': [0.3, 0.8, 0.9]        // Cyan accent
        };
        return colors[role] || [0.5, 0.5, 0.5];
    }
    
    initialize() {
        this.canvas = document.getElementById(this.canvasId);
        if (!this.canvas) {
            console.error(`❌ Canvas ${this.canvasId} not found`);
            return false;
        }
        
        // WebGL context - following DNA pattern
        this.gl = this.canvas.getContext('webgl2') || this.canvas.getContext('webgl');
        if (!this.gl) {
            console.error(`❌ WebGL not supported for ${this.canvasId}`);
            return false;
        }
        
        console.log(`🔮 4D Polytope WebGL context: ${this.canvasId} (${this.role})`);
        
        // Create TRUE 4D polytope shader following DNA pattern
        if (!this.createTrue4DPolytopeShader()) {
            console.error(`❌ Failed to create 4D polytope shader for ${this.canvasId}`);
            return false;
        }
        
        this.setupCanvasSize();
        return true;
    }
    
    createTrue4DPolytopeShader() {
        // Vertex shader - identical DNA to other systems
        const vertexShader = `
            attribute vec2 a_position;
            varying vec2 v_uv;
            
            void main() {
                v_uv = a_position * 0.5 + 0.5;
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `;
        
        // Fragment shader with TRUE 4D polytope mathematics
        const fragmentShader = `
            precision highp float;
            varying vec2 v_uv;
            
            // Standard VIB34D uniforms - following DNA pattern
            uniform float u_time;
            uniform float u_geometry;
            uniform float u_rot4dXW;
            uniform float u_rot4dYW; 
            uniform float u_rot4dZW;
            uniform float u_gridDensity;
            uniform float u_morphFactor;
            uniform float u_chaos;
            uniform float u_speed;
            uniform float u_hue;
            uniform float u_intensity;
            uniform float u_saturation;
            
            // Layer-specific uniforms
            uniform float u_layerIntensity;
            uniform float u_layerScale;
            uniform vec3 u_layerColor;
            
            // Audio reactivity uniforms - following DNA pattern
            uniform float u_bass;
            uniform float u_mid;
            uniform float u_high;
            
            // 4D rotation matrices - EXACT DNA from other systems
            mat4 rotateXW(float theta) {
                float c = cos(theta);
                float s = sin(theta);
                return mat4(c, 0.0, 0.0, -s, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, s, 0.0, 0.0, c);
            }
            
            mat4 rotateYW(float theta) {
                float c = cos(theta);
                float s = sin(theta);
                return mat4(1.0, 0.0, 0.0, 0.0, 0.0, c, 0.0, -s, 0.0, 0.0, 1.0, 0.0, 0.0, s, 0.0, c);
            }
            
            mat4 rotateZW(float theta) {
                float c = cos(theta);
                float s = sin(theta);
                return mat4(1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, c, -s, 0.0, 0.0, s, c);
            }
            
            // 4D to 3D projection - EXACT DNA from other systems
            vec3 project4Dto3D(vec4 p) {
                float w = 2.5 / (2.5 + p.w);
                return vec3(p.x * w, p.y * w, p.z * w);
            }
            
            // HSV to RGB conversion - EXACT DNA from other systems
            vec3 hsv2rgb(vec3 c) {
                vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
                vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
                return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
            }
            
            // TRUE 4D POLYTOPE DISTANCE FUNCTIONS
            
            // 5-Cell (4D Tetrahedron) - Simplest regular 4D polytope
            float polytope5Cell(vec4 p) {
                vec4 vertices[5];
                vertices[0] = vec4(1.0, 1.0, 1.0, 1.0);
                vertices[1] = vec4(1.0, -1.0, -1.0, 1.0);
                vertices[2] = vec4(-1.0, 1.0, -1.0, 1.0);
                vertices[3] = vec4(-1.0, -1.0, 1.0, 1.0);
                vertices[4] = vec4(0.0, 0.0, 0.0, -1.0);
                
                float minDist = 1000.0;
                for(int i = 0; i < 5; i++) {
                    minDist = min(minDist, distance(p, vertices[i]));
                }
                return minDist;
            }
            
            // Tesseract (4D Hypercube) - Most famous 4D polytope
            float polytopeTesseract(vec4 p) {
                vec4 q = abs(p) - vec4(1.0);
                return length(max(q, 0.0)) + min(max(max(max(q.x, q.y), q.z), q.w), 0.0);
            }
            
            // 16-Cell (4D Cross-polytope)
            float polytope16Cell(vec4 p) {
                return abs(p.x) + abs(p.y) + abs(p.z) + abs(p.w) - 2.0;
            }
            
            // 24-Cell (Unique to 4D)
            float polytope24Cell(vec4 p) {
                vec4 q = abs(p);
                vec4 sorted = q;
                
                // Sort coordinates for 24-cell symmetry
                if(sorted.x < sorted.y) { float temp = sorted.x; sorted.x = sorted.y; sorted.y = temp; }
                if(sorted.y < sorted.z) { float temp = sorted.y; sorted.y = sorted.z; sorted.z = temp; }
                if(sorted.z < sorted.w) { float temp = sorted.z; sorted.z = sorted.w; sorted.w = temp; }
                
                return sorted.x + sorted.y - 2.0;
            }
            
            // 600-Cell (4D Icosahedron analog)
            float polytope600Cell(vec4 p) {
                float phi = 1.618033988749895; // Golden ratio
                vec4 q = abs(p);
                
                float d1 = max(max(max(q.x, q.y), q.z), q.w) - phi;
                float d2 = (q.x + q.y + q.z + q.w) / phi - 2.0;
                
                return max(d1, d2);
            }
            
            // 120-Cell (Most complex regular 4D polytope)
            float polytope120Cell(vec4 p) {
                float phi = 1.618033988749895; // Golden ratio
                vec4 q = abs(p);
                
                // Approximate 120-cell using dodecahedral symmetry
                float d1 = length(q) - 2.0;
                float d2 = max(max(max(q.x/phi, q.y*phi), q.z/phi), q.w*phi) - 1.5;
                
                return max(d1, d2);
            }
            
            // Hypersphere (4D Sphere)
            float polytopeHypersphere(vec4 p) {
                return length(p) - 1.5;
            }
            
            // 4D Torus (Duocylinder) 
            float polytopeDuocylinder(vec4 p) {
                float r1 = length(p.xy) - 1.0;
                float r2 = length(p.zw) - 1.0;
                return sqrt(r1*r1 + r2*r2) - 0.5;
            }
            
            // TRUE 4D GEOMETRY FUNCTION - Following exact DNA pattern
            float true4DGeometryFunction(vec4 p) {
                int geomType = int(u_geometry);
                float gridSize = u_gridDensity * 0.1;
                
                // Apply 4D rotation - EXACT DNA pattern
                mat4 rotation = rotateXW(u_rot4dXW) * rotateYW(u_rot4dYW) * rotateZW(u_rot4dZW);
                vec4 rotatedP = rotation * p;
                
                // Apply grid tiling like other systems
                vec4 tiledP = fract(rotatedP * gridSize) - 0.5;
                
                float dist = 0.0;
                
                if (geomType == 0) {
                    // 5-CELL (4D Tetrahedron)
                    dist = polytope5Cell(tiledP);
                }
                else if (geomType == 1) {
                    // TESSERACT (4D Hypercube) 
                    dist = polytopeTesseract(tiledP);
                }
                else if (geomType == 2) {
                    // HYPERSPHERE (4D Sphere)
                    dist = polytopeHypersphere(tiledP);
                }
                else if (geomType == 3) {
                    // DUOCYLINDER (4D Torus)
                    dist = polytopeDuocylinder(tiledP);
                }
                else if (geomType == 4) {
                    // 16-CELL (4D Cross-polytope)
                    dist = polytope16Cell(tiledP);
                }
                else if (geomType == 5) {
                    // 24-CELL (Unique to 4D)
                    dist = polytope24Cell(tiledP);
                }
                else if (geomType == 6) {
                    // 600-CELL (4D Icosahedron)
                    dist = polytope600Cell(tiledP);
                }
                else if (geomType == 7) {
                    // 120-CELL (Most complex)
                    dist = polytope120Cell(tiledP);
                }
                
                // Apply morphing and chaos - EXACT DNA pattern
                dist *= u_morphFactor;
                if (u_chaos > 0.0) {
                    float noise = sin(rotatedP.x * 10.0) * sin(rotatedP.y * 10.0) * sin(rotatedP.z * 10.0) * sin(rotatedP.w * 10.0);
                    dist += noise * u_chaos * 0.1;
                }
                
                return dist;
            }
            
            void main() {
                vec2 uv = (v_uv - 0.5) * 2.0;
                float time = u_time * 0.001 * u_speed;
                
                // Create 4D coordinate from 2D screen space
                vec4 rayDir = vec4(uv * u_layerScale, 1.0, sin(time * 0.5));
                
                // Audio reactivity - EXACT DNA pattern
                vec4 audioOffset = vec4(u_bass * 0.3, u_mid * 0.2, u_high * 0.1, u_bass * 0.1);
                rayDir += audioOffset;
                
                // Calculate true 4D polytope distance
                float dist = true4DGeometryFunction(rayDir);
                
                // Layer-specific rendering
                float alpha = 0.0;
                
                if (dist < 0.1) {
                    // Inside polytope
                    alpha = 1.0 - (dist / 0.1);
                    alpha = pow(alpha, 2.0); // Sharp edges like other systems
                } else {
                    // Outside polytope - glow effect
                    alpha = exp(-dist * 5.0) * 0.3;
                }
                
                // Apply layer intensity
                alpha *= u_layerIntensity * u_intensity;
                
                // HSV color calculation - EXACT DNA pattern
                float hue = u_hue / 360.0;
                vec3 hsvColor = vec3(hue, u_saturation, 1.0);
                vec3 color = hsv2rgb(hsvColor);
                
                // Mix with layer color
                color = mix(color, u_layerColor, 0.3);
                
                // Audio-reactive color modulation
                color.r += u_high * 0.2;
                color.g += u_mid * 0.2;  
                color.b += u_bass * 0.2;
                
                // Final output
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
            console.error('4D Polytope shader link error:', this.gl.getProgramInfoLog(program));
            return null;
        }
        
        // Create quad vertices - DNA pattern
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
            console.error('4D Polytope shader compile error:', this.gl.getShaderInfoLog(shader));
            return null;
        }
        
        return shader;
    }
    
    setupCanvasSize() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * (window.devicePixelRatio || 1);
        this.canvas.height = rect.height * (window.devicePixelRatio || 1);
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
    
    render(parameters = {}) {
        if (!this.gl || !this.program || !this.vertexBuffer) return;
        
        this.time += 16; // ~60fps
        
        this.gl.useProgram(this.program);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        
        // Clear with transparent background
        this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        
        // Bind vertex buffer
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        const positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
        
        // Set uniforms - EXACT DNA pattern from other systems
        this.setUniform('u_time', this.time);
        this.setUniform('u_geometry', parameters.geometry || 0);
        this.setUniform('u_rot4dXW', parameters.rot4dXW || 0);
        this.setUniform('u_rot4dYW', parameters.rot4dYW || 0);
        this.setUniform('u_rot4dZW', parameters.rot4dZW || 0);
        this.setUniform('u_gridDensity', parameters.gridDensity || 20);
        this.setUniform('u_morphFactor', parameters.morphFactor || 1.0);
        this.setUniform('u_chaos', parameters.chaos || 0.0);
        this.setUniform('u_speed', parameters.speed || 1.0);
        this.setUniform('u_hue', parameters.hue || 280);
        this.setUniform('u_intensity', parameters.intensity || 0.8);
        this.setUniform('u_saturation', parameters.saturation || 0.9);
        
        // Layer-specific uniforms
        this.setUniform('u_layerIntensity', this.layerIntensity);
        this.setUniform('u_layerScale', this.layerScale);
        this.setUniform('u_layerColor', this.layerColor);
        
        // Audio reactivity - DNA pattern
        this.setUniform('u_bass', window.audioReactive?.bass || 0);
        this.setUniform('u_mid', window.audioReactive?.mid || 0);
        this.setUniform('u_high', window.audioReactive?.high || 0);
        
        // Draw quad
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }
    
    setUniform(name, value) {
        const location = this.gl.getUniformLocation(this.program, name);
        if (location === null) return;
        
        if (typeof value === 'number') {
            this.gl.uniform1f(location, value);
        } else if (Array.isArray(value)) {
            if (value.length === 2) {
                this.gl.uniform2f(location, value[0], value[1]);
            } else if (value.length === 3) {
                this.gl.uniform3f(location, value[0], value[1], value[2]);
            } else if (value.length === 4) {
                this.gl.uniform4f(location, value[0], value[1], value[2], value[3]);
            }
        }
    }
    
    cleanup() {
        if (this.gl) {
            if (this.program) {
                this.gl.deleteProgram(this.program);
                this.program = null;
            }
            if (this.vertexBuffer) {
                this.gl.deleteBuffer(this.vertexBuffer);
                this.vertexBuffer = null;
            }
        }
    }
}

/**
 * New Polychora Engine - Following EXACT DNA pattern of other systems
 */
export class NewPolychoraEngine {
    constructor() {
        console.log('🔮 Initializing TRUE 4D Polychora Engine with VIB34D DNA...');
        
        // EXACT DNA pattern from other systems
        this.visualizers = [];
        this.parameters = new ParameterManager();
        this.isActive = false;
        
        // REMOVED: Built-in reactivity - ReactivityManager handles all interactions now
        
        // Mouse interaction state - DNA pattern
        this.mouseX = 0.5;
        this.mouseY = 0.5;
        this.mouseIntensity = 0.0;
        this.clickIntensity = 0.0;
        
        // Animation state - DNA pattern
        this.time = 0;
        this.animationId = null;
        
        // Polychora-specific enhancement: 4D rotation velocity tracking
        this.rotation4DVelocity = { XW: 0, YW: 0, ZW: 0 };
        this.lastRotation4D = { XW: 0, YW: 0, ZW: 0 };
        
        // Set polychora-specific defaults
        this.parameters.setParameter('geometry', 1); // Start with Tesseract
        this.parameters.setParameter('hue', 280); // Purple-blue for 4D
        this.parameters.setParameter('intensity', 0.8);
        this.parameters.setParameter('saturation', 0.9);
        this.parameters.setParameter('gridDensity', 25); // Good for 4D detail
        this.parameters.setParameter('morphFactor', 1.0);
        
        this.init();
    }
    
    init() {
        this.createVisualizers();
        this.setupAudioReactivity();
        this.setup4DInteractivity(); // Unique 4D interaction system
        this.startRenderLoop();
        console.log('✨ TRUE 4D Polychora Engine initialized with VIB34D DNA');
    }
    
    createVisualizers() {
        // 5-layer system - EXACT DNA pattern
        const layers = [
            { id: 'polychora-background-canvas', role: 'background' },
            { id: 'polychora-shadow-canvas', role: 'shadow' },
            { id: 'polychora-content-canvas', role: 'content' },
            { id: 'polychora-highlight-canvas', role: 'highlight' },
            { id: 'polychora-accent-canvas', role: 'accent' }
        ];
        
        this.visualizers = [];
        
        for (const layer of layers) {
            const visualizer = new True4DPolychoraVisualizer(layer.id, layer.role, {});
            if (visualizer.initialize()) {
                this.visualizers.push(visualizer);
                console.log(`✅ 4D Polytope layer initialized: ${layer.role}`);
            } else {
                console.error(`❌ Failed to initialize 4D Polytope layer: ${layer.role}`);
            }
        }
        
        console.log(`🔮 True 4D Polychora: ${this.visualizers.length}/5 layers active`);
    }
    
    setupAudioReactivity() {
        // Audio reactivity - EXACT DNA pattern from other systems
        if (window.audioContext && window.analyser) {
            console.log('🎵 4D Polychora audio reactivity enabled');
            
            // Polychora-specific audio mapping:
            // Bass -> 4D rotation speed
            // Mid -> Polytope morphing
            // High -> Color shifting and layer intensity
        }
    }
    
    setup4DInteractivity() {
        // REMOVED: Built-in reactivity - ReactivityManager handles all interactions
        if (false) { // Disabled
            // Track 4D rotation velocity for advanced interaction
            setInterval(() => {
                const currentRot = {
                    XW: this.parameters.getParameter('rot4dXW'),
                    YW: this.parameters.getParameter('rot4dYW'),
                    ZW: this.parameters.getParameter('rot4dZW')
                };
                
                this.rotation4DVelocity = {
                    XW: currentRot.XW - this.lastRotation4D.XW,
                    YW: currentRot.YW - this.lastRotation4D.YW,
                    ZW: currentRot.ZW - this.lastRotation4D.ZW
                };
                
                this.lastRotation4D = currentRot;
            }, 100);
        }
    }
    
    startRenderLoop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        const renderFrame = () => {
            if (!this.isActive) return;
            
            this.time += 16; // ~60fps
            
            // Get current parameters - EXACT DNA pattern
            const params = {
                geometry: this.parameters.getParameter('geometry'),
                rot4dXW: this.parameters.getParameter('rot4dXW'),
                rot4dYW: this.parameters.getParameter('rot4dYW'),
                rot4dZW: this.parameters.getParameter('rot4dZW'),
                gridDensity: this.parameters.getParameter('gridDensity'),
                morphFactor: this.parameters.getParameter('morphFactor'),
                chaos: this.parameters.getParameter('chaos'),
                speed: this.parameters.getParameter('speed'),
                hue: this.parameters.getParameter('hue'),
                intensity: this.parameters.getParameter('intensity'),
                saturation: this.parameters.getParameter('saturation')
            };
            
            // Audio-reactive 4D rotation enhancement
            if (window.audioReactive) {
                // Bass drives 4D rotation through XW plane
                params.rot4dXW += window.audioReactive.bass * 2.0;
                // Mid drives YW plane rotation
                params.rot4dYW += window.audioReactive.mid * 1.5;
                // High drives ZW plane rotation
                params.rot4dZW += window.audioReactive.high * 1.0;
                
                // Audio affects polytope morphing
                params.morphFactor += window.audioReactive.bass * 0.5;
                
                // Color shifting based on audio
                params.hue += (window.audioReactive.mid + window.audioReactive.high) * 30;
            }
            
            // Render all layers - DNA pattern
            this.visualizers.forEach(visualizer => {
                visualizer.render(params);
            });
            
            this.animationId = requestAnimationFrame(renderFrame);
        };
        
        renderFrame();
    }
    
    activate() {
        console.log('🔮 Activating TRUE 4D Polychora Engine...');
        this.isActive = true;
        
        // Show polychora canvases, hide others - DNA pattern
        const allCanvases = document.querySelectorAll('canvas[id*="-canvas"]');
        allCanvases.forEach(canvas => {
            canvas.style.display = canvas.id.includes('polychora') ? 'block' : 'none';
        });
        
        this.startRenderLoop();
        
        // Update UI to show we're in 4D mode
        if (window.statusManager) {
            window.statusManager.updateStatus('TRUE 4D POLYCHORA ENGINE ACTIVE', 'system');
        }
        
        console.log('✅ True 4D Polychora Engine activated');
    }
    
    deactivate() {
        console.log('🔮 Deactivating 4D Polychora Engine...');
        this.isActive = false;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Hide polychora canvases - DNA pattern
        const polychoraCanvases = document.querySelectorAll('canvas[id*="polychora"]');
        polychoraCanvases.forEach(canvas => {
            canvas.style.display = 'none';
        });
        
        console.log('✅ 4D Polychora Engine deactivated');
    }
    
    updateParameter(param, value) {
        // EXACT DNA pattern from other systems
        this.parameters.setParameter(param, value);
        
        // Special 4D polytope parameter handling
        if (param === 'geometry') {
            const polytopes = ['5-CELL', 'TESSERACT', 'HYPERSPHERE', 'DUOCYLINDER', '16-CELL', '24-CELL', '600-CELL', '120-CELL'];
            console.log(`🔮 4D Polytope changed to: ${polytopes[Math.floor(value)] || 'UNKNOWN'}`);
        }
    }
    
    // CRITICAL: Add getParameters method for save system compatibility
    getParameters() {
        if (this.parameters && typeof this.parameters.getAllParameters === 'function') {
            return this.parameters.getAllParameters();
        }
        
        // Fallback parameter extraction
        const params = {};
        const paramNames = ['geometry', 'rot4dXW', 'rot4dYW', 'rot4dZW', 'gridDensity', 'morphFactor', 'chaos', 'speed', 'hue', 'intensity', 'saturation'];
        
        paramNames.forEach(name => {
            if (this.parameters && typeof this.parameters.getParameter === 'function') {
                params[name] = this.parameters.getParameter(name);
            }
        });
        
        return params;
    }
    
    // CRITICAL: Add setParameters method for load system compatibility
    setParameters(params) {
        if (!params) return;
        
        Object.keys(params).forEach(key => {
            if (this.parameters && typeof this.parameters.setParameter === 'function') {
                this.parameters.setParameter(key, params[key]);
            }
        });
        
        console.log('🔮 4D Polychora parameters updated from load');
    }
    
    getParameterValue(param) {
        return this.parameters.getParameter(param);
    }
    
    randomizeParameters() {
        // Randomize following DNA pattern but with 4D-specific ranges
        this.parameters.randomize();
        
        // Ensure good 4D polytope display
        this.parameters.setParameter('gridDensity', 15 + Math.random() * 20); // 15-35 good for 4D
        this.parameters.setParameter('intensity', 0.6 + Math.random() * 0.4); // Keep bright for 4D
        
        console.log('🎲 4D Polychora parameters randomized');
    }
    
    cleanup() {
        this.deactivate();
        
        // Cleanup all visualizers - DNA pattern
        this.visualizers.forEach(visualizer => {
            visualizer.cleanup();
        });
        this.visualizers = [];
        
        console.log('🧹 4D Polychora Engine cleaned up');
    }
}

// Export the new engine
window.NewPolychoraEngine = NewPolychoraEngine;