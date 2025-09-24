/**
 * TradingCardSystemQuantum.js - Complete Quantum System for Trading Cards
 * Extracted from monolithic TradingCardGenerator.js for better maintainability
 * 
 * Contains:
 * - Enhanced 3D lattice functions (tetrahedron, hypercube)
 * - HSV color system with quantum effects
 * - RGB glitch effects and particle systems
 * - Layer-specific multipliers for density, speed, intensity
 * - Advanced holographic shimmer effects
 */

export class TradingCardSystemQuantum {
    /**
     * Generate the complete HTML/JS code for a live quantum trading card
     * @param {Object} state - Card state with parameters and metadata
     * @returns {string} Complete JavaScript code for the card
     */
    static generateLiveSystem(state) {
        return `
        // LIVE VIB34D Quantum System - Enhanced 5 Layer WebGL Rendering
        class LiveQuantumTradingCardSystem {
            constructor(canvas) {
                this.canvas = canvas;
                this.layers = [];
                this.params = ${JSON.stringify(state.parameters)};
                this.startTime = Date.now();
                
                console.log('🌌 Initializing LIVE Quantum Trading Card System');
                this.initializeLayers();
                this.startRenderLoop();
            }
            
            initializeLayers() {
                const layerConfigs = [
                    { id: 'quantum-bg', role: 'background', blend: 'multiply', opacity: 0.4, intensity: 0.4, densityMult: 0.8, speedMult: 0.6 },
                    { id: 'quantum-shadow', role: 'shadow', blend: 'multiply', opacity: 0.6, intensity: 0.6, densityMult: 0.9, speedMult: 0.8 },
                    { id: 'quantum-content', role: 'content', blend: 'normal', opacity: 1.0, intensity: 1.0, densityMult: 1.0, speedMult: 1.0 },
                    { id: 'quantum-highlight', role: 'highlight', blend: 'screen', opacity: 0.8, intensity: 1.3, densityMult: 1.1, speedMult: 1.2 },
                    { id: 'quantum-accent', role: 'accent', blend: 'color-dodge', opacity: 0.7, intensity: 1.6, densityMult: 1.2, speedMult: 1.4 }
                ];
                
                layerConfigs.forEach(config => {
                    const layerCanvas = document.createElement('canvas');
                    layerCanvas.id = config.id;
                    layerCanvas.width = this.canvas.width;
                    layerCanvas.height = this.canvas.height;
                    layerCanvas.style.position = 'absolute';
                    layerCanvas.style.top = '0';
                    layerCanvas.style.left = '0';
                    layerCanvas.style.width = '100%';
                    layerCanvas.style.height = '100%';
                    layerCanvas.style.mixBlendMode = config.blend;
                    layerCanvas.style.opacity = config.opacity;
                    layerCanvas.style.pointerEvents = 'none';
                    
                    this.canvas.parentNode.appendChild(layerCanvas);
                    
                    const visualizer = new QuantumLayerVisualizer(layerCanvas, config);
                    this.layers.push({ visualizer, config });
                    console.log(\`🌌 Created quantum layer: \${config.role}\`);
                });
            }
            
            startRenderLoop() {
                const render = () => {
                    this.layers.forEach(({ visualizer }) => {
                        if (visualizer && visualizer.render) {
                            visualizer.render(Date.now());
                        }
                    });
                    requestAnimationFrame(render);
                };
                render();
            }
        }
        
        // Enhanced Quantum Layer Visualizer with complex 3D lattice shaders
        class QuantumLayerVisualizer {
            constructor(canvas, roleConfig) {
                this.canvas = canvas;
                this.roleConfig = roleConfig;
                this.gl = canvas.getContext('webgl');
                this.params = ${JSON.stringify(state.parameters)};
                this.mouseX = 0.5;
                this.mouseY = 0.5;
                this.mouseIntensity = 0.0;
                this.clickIntensity = 0.0;
                this.startTime = Date.now();
                
                if (!this.gl) {
                    console.error(\`WebGL not supported for quantum layer \${roleConfig.role}\`);
                    return;
                }
                
                this.initShaders();
                this.initBuffers();
            }
            
            initShaders() {
                const vertexShader = \`
                attribute vec2 a_position;
                void main() {
                    gl_Position = vec4(a_position, 0.0, 1.0);
                }\`;
                
                const fragmentShader = \`
                precision highp float;
                uniform vec2 u_resolution;
                uniform float u_time;
                uniform vec2 u_mouse;
                uniform float u_geometry;
                uniform float u_gridDensity;
                uniform float u_morphFactor;
                uniform float u_chaos;
                uniform float u_speed;
                uniform float u_hue;
                uniform float u_intensity;
                uniform float u_saturation;
                uniform float u_rot4dXW;
                uniform float u_rot4dYW;
                uniform float u_rot4dZW;
                uniform float u_mouseIntensity;
                uniform float u_clickIntensity;
                uniform float u_roleIntensity;
                
                // 4D rotation matrices
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
                
                vec3 project4Dto3D(vec4 p) {
                    float w = 2.5 / (2.5 + p.w);
                    return vec3(p.x * w, p.y * w, p.z * w);
                }
                
                // COMPLEX 3D LATTICE FUNCTIONS - QUANTUM ENHANCED
                float tetrahedronLattice(vec3 p, float gridSize) {
                    vec3 q = fract(p * gridSize) - 0.5;
                    float d1 = length(q);
                    float d2 = length(q - vec3(0.4, 0.0, 0.0));
                    float d3 = length(q - vec3(0.0, 0.4, 0.0));
                    float d4 = length(q - vec3(0.0, 0.0, 0.4));
                    float vertices = 1.0 - smoothstep(0.0, 0.04, min(min(d1, d2), min(d3, d4)));
                    float edges = 0.0;
                    edges = max(edges, 1.0 - smoothstep(0.0, 0.02, abs(length(q.xy) - 0.2)));
                    edges = max(edges, 1.0 - smoothstep(0.0, 0.02, abs(length(q.yz) - 0.2)));
                    edges = max(edges, 1.0 - smoothstep(0.0, 0.02, abs(length(q.xz) - 0.2)));
                    return max(vertices, edges * 0.5);
                }
                
                float hypercubeLattice(vec3 p, float gridSize) {
                    vec3 grid = fract(p * gridSize);
                    vec3 edges = min(grid, 1.0 - grid);
                    float minEdge = min(min(edges.x, edges.y), edges.z);
                    float lattice = 1.0 - smoothstep(0.0, 0.03, minEdge);
                    
                    vec3 centers = abs(grid - 0.5);
                    float maxCenter = max(max(centers.x, centers.y), centers.z);
                    float vertices = 1.0 - smoothstep(0.45, 0.5, maxCenter);
                    
                    return max(lattice * 0.7, vertices);
                }
                
                // ENHANCED GEOMETRY FUNCTION WITH QUANTUM EFFECTS
                float quantumGeometry(vec4 p) {
                    int geomType = int(u_geometry);
                    vec3 p3d = project4Dto3D(p);
                    float gridSize = u_gridDensity * 0.08;
                    
                    if (geomType == 0) {
                        return tetrahedronLattice(p3d, gridSize) * u_morphFactor;
                    } else if (geomType == 1) {
                        return hypercubeLattice(p3d, gridSize) * u_morphFactor;
                    } else {
                        return hypercubeLattice(p3d, gridSize) * u_morphFactor;
                    }
                }
                
                // HSV to RGB conversion
                vec3 hsv2rgb(vec3 c) {
                    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
                    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
                    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
                }
                
                // RGB Glitch effect
                vec3 rgbGlitch(vec3 color, vec2 uv, float intensity) {
                    float r = color.r + sin(uv.y * 30.0 + u_time * 0.001) * intensity * 0.06;
                    float g = color.g + sin(uv.y * 28.0 + u_time * 0.0012) * intensity * 0.06;
                    float b = color.b + sin(uv.y * 32.0 + u_time * 0.0008) * intensity * 0.06;
                    return vec3(r, g, b);
                }
                
                void main() {
                    vec2 uv = (gl_FragCoord.xy - u_resolution.xy * 0.5) / min(u_resolution.x, u_resolution.y);
                    
                    // Enhanced 4D position with quantum effects
                    float timeSpeed = u_time * 0.0001 * u_speed;
                    vec4 pos = vec4(uv * 3.0, sin(timeSpeed * 3.0), cos(timeSpeed * 2.0));
                    pos.xy += (u_mouse - 0.5) * u_mouseIntensity * 2.0;
                    
                    // Apply 4D rotations
                    pos = rotateXW(u_rot4dXW) * pos;
                    pos = rotateYW(u_rot4dYW) * pos;
                    pos = rotateZW(u_rot4dZW) * pos;
                    
                    // Calculate quantum geometry value
                    float value = quantumGeometry(pos);
                    
                    // Enhanced chaos with quantum noise
                    float noise = sin(pos.x * 7.0) * cos(pos.y * 11.0) * sin(pos.z * 13.0);
                    value += noise * u_chaos;
                    
                    // Quantum intensity calculation with holographic glow
                    float geometryIntensity = 1.0 - clamp(abs(value * 0.8), 0.0, 1.0);
                    geometryIntensity = pow(geometryIntensity, 1.5);
                    geometryIntensity += u_clickIntensity * 0.3;
                    
                    // Quantum shimmer effect
                    float shimmer = sin(uv.x * 20.0 + timeSpeed * 5.0) * cos(uv.y * 15.0 + timeSpeed * 3.0) * 0.1;
                    geometryIntensity += shimmer * geometryIntensity;
                    
                    float finalIntensity = geometryIntensity * u_intensity;
                    
                    // Enhanced quantum color system
                    float baseHue = u_hue / 360.0;
                    float hueShift = value * 0.2 + timeSpeed * 0.1;
                    float finalHue = baseHue + hueShift;
                    
                    vec3 hsvColor = vec3(finalHue, u_saturation, finalIntensity);
                    vec3 baseColor = hsv2rgb(hsvColor);
                    
                    // Add quantum particles
                    float particles = 0.0;
                    vec2 particleUV = uv * 8.0;
                    vec2 particleID = floor(particleUV);
                    vec2 particlePos = fract(particleUV) - 0.5;
                    float particleDist = length(particlePos);
                    
                    float particleTime = timeSpeed + dot(particleID, vec2(127.1, 311.7));
                    float particleAlpha = sin(particleTime) * 0.5 + 0.5;
                    particles = (1.0 - smoothstep(0.1, 0.3, particleDist)) * particleAlpha * 0.3;
                    
                    vec3 glitchedColor = rgbGlitch(baseColor, uv, finalIntensity * 0.5);
                    vec3 finalColor = glitchedColor + particles * vec3(1.0, 0.8, 1.0);
                    
                    gl_FragColor = vec4(finalColor, finalIntensity * u_roleIntensity);
                }\`;
                
                this.program = this.createProgram(vertexShader, fragmentShader);
                if (this.program) {
                    this.uniforms = {
                        resolution: this.gl.getUniformLocation(this.program, 'u_resolution'),
                        time: this.gl.getUniformLocation(this.program, 'u_time'),
                        mouse: this.gl.getUniformLocation(this.program, 'u_mouse'),
                        geometry: this.gl.getUniformLocation(this.program, 'u_geometry'),
                        gridDensity: this.gl.getUniformLocation(this.program, 'u_gridDensity'),
                        morphFactor: this.gl.getUniformLocation(this.program, 'u_morphFactor'),
                        chaos: this.gl.getUniformLocation(this.program, 'u_chaos'),
                        speed: this.gl.getUniformLocation(this.program, 'u_speed'),
                        hue: this.gl.getUniformLocation(this.program, 'u_hue'),
                        intensity: this.gl.getUniformLocation(this.program, 'u_intensity'),
                        saturation: this.gl.getUniformLocation(this.program, 'u_saturation'),
                        rot4dXW: this.gl.getUniformLocation(this.program, 'u_rot4dXW'),
                        rot4dYW: this.gl.getUniformLocation(this.program, 'u_rot4dYW'),
                        rot4dZW: this.gl.getUniformLocation(this.program, 'u_rot4dZW'),
                        mouseIntensity: this.gl.getUniformLocation(this.program, 'u_mouseIntensity'),
                        clickIntensity: this.gl.getUniformLocation(this.program, 'u_clickIntensity'),
                        roleIntensity: this.gl.getUniformLocation(this.program, 'u_roleIntensity')
                    };
                }
            }
            
            createProgram(vertexSource, fragmentSource) {
                const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexSource);
                const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentSource);
                
                if (!vertexShader || !fragmentShader) return null;
                
                const program = this.gl.createProgram();
                this.gl.attachShader(program, vertexShader);
                this.gl.attachShader(program, fragmentShader);
                this.gl.linkProgram(program);
                
                if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
                    console.error('Quantum program linking failed:', this.gl.getProgramInfoLog(program));
                    return null;
                }
                
                return program;
            }
            
            createShader(type, source) {
                const shader = this.gl.createShader(type);
                this.gl.shaderSource(shader, source);
                this.gl.compileShader(shader);
                
                if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
                    console.error('Quantum shader compilation failed:', this.gl.getShaderInfoLog(shader));
                    return null;
                }
                
                return shader;
            }
            
            initBuffers() {
                const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
                this.buffer = this.gl.createBuffer();
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
                this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
                
                const positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
                this.gl.enableVertexAttribArray(positionLocation);
                this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
            }
            
            render(time) {
                if (!this.program) return;
                
                this.canvas.width = this.canvas.clientWidth;
                this.canvas.height = this.canvas.clientHeight;
                this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
                this.gl.useProgram(this.program);
                
                this.gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
                this.gl.uniform1f(this.uniforms.time, time);
                this.gl.uniform2f(this.uniforms.mouse, this.mouseX || 0.5, this.mouseY || 0.5);
                this.gl.uniform1f(this.uniforms.geometry, this.params.geometry || 0);
                this.gl.uniform1f(this.uniforms.gridDensity, (this.params.gridDensity || 15) * this.roleConfig.densityMult);
                this.gl.uniform1f(this.uniforms.morphFactor, this.params.morphFactor || 1.0);
                this.gl.uniform1f(this.uniforms.chaos, this.params.chaos || 0.2);
                this.gl.uniform1f(this.uniforms.speed, (this.params.speed || 1.0) * this.roleConfig.speedMult);
                this.gl.uniform1f(this.uniforms.hue, this.params.hue || 280); // Quantum purple-blue
                this.gl.uniform1f(this.uniforms.intensity, (this.params.intensity || 0.7) * this.roleConfig.intensity);
                this.gl.uniform1f(this.uniforms.saturation, this.params.saturation || 0.9);
                this.gl.uniform1f(this.uniforms.rot4dXW, this.params.rot4dXW || 0.0);
                this.gl.uniform1f(this.uniforms.rot4dYW, this.params.rot4dYW || 0.0);
                this.gl.uniform1f(this.uniforms.rot4dZW, this.params.rot4dZW || 0.0);
                this.gl.uniform1f(this.uniforms.mouseIntensity, this.mouseIntensity || 0.0);
                this.gl.uniform1f(this.uniforms.clickIntensity, this.clickIntensity || 0.0);
                this.gl.uniform1f(this.uniforms.roleIntensity, this.roleConfig.intensity);
                
                this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
            }
        }
        
        // Enhanced interactivity system for Quantum cards - FIXED CANVAS SCOPE
        const canvas = document.getElementById('vib34dCanvas');
        if (!canvas) {
            console.error('Canvas not found for quantum interactivity');
            return;
        }
        
        let mouseX = 0.5, mouseY = 0.5, mouseIntensity = 0.0;
        let clickIntensity = 0.0;
        
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = (e.clientX - rect.left) / rect.width;
            mouseY = 1.0 - (e.clientY - rect.top) / rect.height;
            mouseIntensity = Math.min(1.0, Math.sqrt(e.movementX*e.movementX + e.movementY*e.movementY) / 40);
            
            if (typeof layers !== 'undefined') {
                layers.forEach(layer => {
                    if (layer.visualizer) {
                        layer.visualizer.mouseX = mouseX;
                        layer.visualizer.mouseY = mouseY;
                        layer.visualizer.mouseIntensity = mouseIntensity;
                    }
                });
            }
        });
        
        canvas.addEventListener('dblclick', async () => {
            console.log('🌌 Quantum card audio reactivity - Coming soon!');
            canvas.style.border = '2px solid #ff00ff';
            setTimeout(() => { canvas.style.border = ''; }, 2000);
        });`;
    }
    
    /**
     * Get system metadata for the quantum system
     */
    static getSystemInfo() {
        return {
            name: 'Quantum',
            type: 'quantum',
            description: 'Enhanced 3D lattice with holographic effects and particle systems',
            features: ['3D lattice functions', 'HSV color system', 'RGB glitch', 'Quantum particles', 'Shimmer effects'],
            shaderComplexity: 'high',
            layers: 5,
            defaultHue: 280,
            specialEffects: ['tetrahedronLattice', 'hypercubeLattice', 'particleSystem', 'rgbGlitch']
        };
    }
}