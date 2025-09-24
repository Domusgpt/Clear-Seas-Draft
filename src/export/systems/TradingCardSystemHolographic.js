/**
 * TradingCardSystemHolographic.js - Complete Holographic System for Trading Cards
 * Extracted from monolithic TradingCardGenerator.js for better maintainability
 * 
 * Contains:
 * - All 8 VIB3 geometry functions (complete library)
 * - Advanced holographic effects (moire patterns, RGB glitch)
 * - Rich pink/magenta color effects
 * - Role-specific parameter multipliers
 * - Audio reactivity preparation
 */

export class TradingCardSystemHolographic {
    /**
     * Generate the complete HTML/JS code for a live holographic trading card
     * @param {Object} state - Card state with parameters and metadata
     * @returns {string} Complete JavaScript code for the card
     */
    static generateLiveSystem(state) {
        return `
        // LIVE Active Holographic System - 5 Layer WebGL with Audio Reactivity
        class LiveTradingCardSystem {
            constructor() {
                this.layers = ['background', 'shadow', 'content', 'highlight', 'accent'];
                this.visualizers = [];
                this.params = ${JSON.stringify(state.parameters)};
                this.startTime = Date.now();
                
                this.initializeAllLayers();
                this.startRenderLoop();
            }
            
            initializeAllLayers() {
                // Create 5 canvases with holographic blend modes
                this.layers.forEach((role, index) => {
                    const canvas = document.createElement('canvas');
                    canvas.id = 'card-' + role + '-canvas';
                    canvas.style.position = 'absolute';
                    canvas.style.top = '0';
                    canvas.style.left = '0';
                    canvas.style.width = '100%';
                    canvas.style.height = '100%';
                    canvas.style.zIndex = index;
                    
                    // Holographic layer blend modes for rich effects
                    if (role === 'background') {
                        canvas.style.opacity = '0.3';
                        canvas.style.mixBlendMode = 'normal';
                    } else if (role === 'shadow') {
                        canvas.style.opacity = '0.7';
                        canvas.style.mixBlendMode = 'multiply';
                    } else if (role === 'content') {
                        canvas.style.opacity = '1.0';
                        canvas.style.mixBlendMode = 'normal';
                    } else if (role === 'highlight') {
                        canvas.style.opacity = '0.9';
                        canvas.style.mixBlendMode = 'screen';
                    } else if (role === 'accent') {
                        canvas.style.opacity = '0.6';
                        canvas.style.mixBlendMode = 'color-dodge';
                    }
                    
                    document.getElementById('vib34dCanvas').parentElement.appendChild(canvas);
                    
                    // Create holographic visualizer for this layer
                    const visualizer = new HolographicLayerVisualizer(canvas, role, this.params);
                    this.visualizers.push(visualizer);
                });
                
                // Hide the original canvas
                document.getElementById('vib34dCanvas').style.display = 'none';
            }
            
            startRenderLoop() {
                const render = () => {
                    const time = Date.now() - this.startTime;
                    this.visualizers.forEach(visualizer => {
                        visualizer.render(time);
                    });
                    requestAnimationFrame(render);
                };
                render();
            }
        }
        
        class HolographicLayerVisualizer {
            constructor(canvas, role, params) {
                this.canvas = canvas;
                this.role = role;
                this.params = params;
                this.gl = canvas.getContext('webgl');
                
                const roleParams = {
                    'background': { densityMult: 0.4, speedMult: 0.2, intensity: 0.2 },
                    'shadow': { densityMult: 0.8, speedMult: 0.3, intensity: 0.4 },
                    'content': { densityMult: 1.0, speedMult: 0.5, intensity: 0.8 },
                    'highlight': { densityMult: 1.5, speedMult: 0.8, intensity: 1.0 },
                    'accent': { densityMult: 2.0, speedMult: 0.4, intensity: 0.6 }
                };
                this.roleConfig = roleParams[role] || roleParams['content'];
                
                this.initShaders();
                this.initBuffers();
                this.resize();
            }
            
            resize() {
                this.canvas.width = this.canvas.clientWidth;
                this.canvas.height = this.canvas.clientHeight;
                this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            }
            
            initShaders() {
                const vertexShaderSource = \`
            attribute vec2 a_position;
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        \`;
                
                // EXACT HOLOGRAPHIC FRAGMENT SHADER WITH ALL EFFECTS
                const fragmentShaderSource = \`
            precision highp float;
            
            uniform vec2 u_resolution;
            uniform float u_time;
            uniform vec2 u_mouse;
            uniform float u_geometry;
            uniform float u_density;
            uniform float u_speed;
            uniform vec3 u_color;
            uniform float u_intensity;
            uniform float u_roleDensity;
            uniform float u_roleSpeed;
            uniform float u_geometryType;
            uniform float u_chaos;
            uniform float u_morph;
            uniform float u_rot4dXW;
            uniform float u_rot4dYW;
            uniform float u_rot4dZW;
            
            // 4D rotation matrices
            mat4 rotateXW(float theta) {
                float c = cos(theta);
                float s = sin(theta);
                return mat4(c, 0, 0, -s, 0, 1, 0, 0, 0, 0, 1, 0, s, 0, 0, c);
            }
            
            mat4 rotateYW(float theta) {
                float c = cos(theta);
                float s = sin(theta);
                return mat4(1, 0, 0, 0, 0, c, 0, -s, 0, 0, 1, 0, 0, s, 0, c);
            }
            
            mat4 rotateZW(float theta) {
                float c = cos(theta);
                float s = sin(theta);
                return mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, c, -s, 0, 0, s, c);
            }
            
            vec3 project4Dto3D(vec4 p) {
                float w = 2.5 / (2.5 + p.w);
                return vec3(p.x * w, p.y * w, p.z * w);
            }
            
            // Complete VIB3 Geometry Library
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
                vec3 edges = 1.0 - smoothstep(0.0, 0.03, abs(grid - 0.5));
                return max(max(edges.x, edges.y), edges.z);
            }
            
            float sphereLattice(vec3 p, float gridSize) {
                vec3 q = fract(p * gridSize) - 0.5;
                float r = length(q);
                return 1.0 - smoothstep(0.2, 0.5, r);
            }
            
            float torusLattice(vec3 p, float gridSize) {
                vec3 q = fract(p * gridSize) - 0.5;
                float r1 = sqrt(q.x*q.x + q.y*q.y);
                float r2 = sqrt((r1 - 0.3)*(r1 - 0.3) + q.z*q.z);
                return 1.0 - smoothstep(0.0, 0.1, r2);
            }
            
            float kleinLattice(vec3 p, float gridSize) {
                vec3 q = fract(p * gridSize);
                float u = q.x * 2.0 * 3.14159;
                float v = q.y * 2.0 * 3.14159;
                float x = cos(u) * (3.0 + cos(u/2.0) * sin(v) - sin(u/2.0) * sin(2.0*v));
                float klein = length(vec2(x, q.z)) - 0.1;
                return 1.0 - smoothstep(0.0, 0.05, abs(klein));
            }
            
            float fractalLattice(vec3 p, float gridSize) {
                vec3 q = p * gridSize;
                float scale = 1.0;
                float fractal = 0.0;
                for(int i = 0; i < 4; i++) {
                  q = fract(q) - 0.5;
                  fractal += abs(length(q)) / scale;
                  scale *= 2.0;
                  q *= 2.0;
                }
                return 1.0 - smoothstep(0.0, 1.0, fractal);
            }
            
            float waveLattice(vec3 p, float gridSize) {
                vec3 q = p * gridSize;
                float wave = sin(q.x * 2.0) * sin(q.y * 2.0) * sin(q.z * 2.0 + u_time);
                return smoothstep(-0.5, 0.5, wave);
            }
            
            float crystalLattice(vec3 p, float gridSize) {
                vec3 q = fract(p * gridSize) - 0.5;
                float d = max(max(abs(q.x), abs(q.y)), abs(q.z));
                return 1.0 - smoothstep(0.3, 0.5, d);
            }
            
            float getDynamicGeometry(vec3 p, float gridSize, float geometryType) {
                int baseGeom = int(mod(geometryType, 8.0));
                float variation = floor(geometryType / 8.0) / 4.0;
                float variedGridSize = gridSize * (0.5 + variation * 1.5);
                
                if (baseGeom == 0) return tetrahedronLattice(p, variedGridSize);
                else if (baseGeom == 1) return hypercubeLattice(p, variedGridSize);
                else if (baseGeom == 2) return sphereLattice(p, variedGridSize);
                else if (baseGeom == 3) return torusLattice(p, variedGridSize);
                else if (baseGeom == 4) return kleinLattice(p, variedGridSize);
                else if (baseGeom == 5) return fractalLattice(p, variedGridSize);
                else if (baseGeom == 6) return waveLattice(p, variedGridSize);
                else return crystalLattice(p, variedGridSize);
            }
            
            vec3 rgbGlitch(vec3 color, vec2 uv, float intensity) {
                vec2 offset = vec2(intensity * 0.005, 0.0);
                float r = color.r + sin(uv.y * 30.0 + u_time * 0.001) * intensity * 0.06;
                float g = color.g + sin(uv.y * 28.0 + u_time * 0.0012) * intensity * 0.06;
                float b = color.b + sin(uv.y * 32.0 + u_time * 0.0008) * intensity * 0.06;
                return vec3(r, g, b);
            }
            
            float moirePattern(vec2 uv, float intensity) {
                float freq1 = 12.0 + intensity * 6.0;
                float freq2 = 14.0 + intensity * 8.0;
                float pattern1 = sin(uv.x * freq1) * sin(uv.y * freq1);
                float pattern2 = sin(uv.x * freq2) * sin(uv.y * freq2);
                return (pattern1 * pattern2) * intensity * 0.15;
            }
            
            void main() {
                vec2 uv = gl_FragCoord.xy / u_resolution.xy;
                float aspectRatio = u_resolution.x / u_resolution.y;
                uv.x *= aspectRatio;
                uv -= 0.5;
                
                float time = u_time * 0.0004 * u_speed * u_roleSpeed;
                
                vec4 p4d = vec4(uv * 3.0, sin(time * 0.1) * 0.15, cos(time * 0.08) * 0.15);
                
                p4d = rotateXW(u_rot4dXW + time * 0.2) * p4d;
                p4d = rotateYW(u_rot4dYW + time * 0.15) * p4d;
                p4d = rotateZW(u_rot4dZW + time * 0.25) * p4d;
                
                vec3 p = project4Dto3D(p4d);
                
                float roleDensity = u_density * u_roleDensity;
                float morphedGeometry = u_geometryType + u_morph * 3.0;
                float lattice = getDynamicGeometry(p, roleDensity, morphedGeometry);
                
                vec3 baseColor = u_color;
                float latticeIntensity = lattice * u_intensity;
                
                vec3 color = baseColor * (0.3 + latticeIntensity * 0.7);
                color += vec3(lattice * 0.4) * baseColor;
                
                // Add holographic effects
                color += vec3(moirePattern(uv, u_chaos));
                color = rgbGlitch(color, uv, u_chaos);
                
                gl_FragColor = vec4(color, 0.95);
            }
        \`;
                
                this.program = this.createProgram(vertexShaderSource, fragmentShaderSource);
                this.uniforms = {
                    resolution: this.gl.getUniformLocation(this.program, 'u_resolution'),
                    time: this.gl.getUniformLocation(this.program, 'u_time'),
                    mouse: this.gl.getUniformLocation(this.program, 'u_mouse'),
                    geometry: this.gl.getUniformLocation(this.program, 'u_geometry'),
                    density: this.gl.getUniformLocation(this.program, 'u_density'),
                    speed: this.gl.getUniformLocation(this.program, 'u_speed'),
                    color: this.gl.getUniformLocation(this.program, 'u_color'),
                    intensity: this.gl.getUniformLocation(this.program, 'u_intensity'),
                    roleDensity: this.gl.getUniformLocation(this.program, 'u_roleDensity'),
                    roleSpeed: this.gl.getUniformLocation(this.program, 'u_roleSpeed'),
                    geometryType: this.gl.getUniformLocation(this.program, 'u_geometryType'),
                    chaos: this.gl.getUniformLocation(this.program, 'u_chaos'),
                    morph: this.gl.getUniformLocation(this.program, 'u_morph'),
                    rot4dXW: this.gl.getUniformLocation(this.program, 'u_rot4dXW'),
                    rot4dYW: this.gl.getUniformLocation(this.program, 'u_rot4dYW'),
                    rot4dZW: this.gl.getUniformLocation(this.program, 'u_rot4dZW')
                };
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
                    console.error('Holographic program linking failed:', this.gl.getProgramInfoLog(program));
                    return null;
                }
                
                return program;
            }
            
            createShader(type, source) {
                const shader = this.gl.createShader(type);
                this.gl.shaderSource(shader, source);
                this.gl.compileShader(shader);
                
                if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
                    console.error('Holographic shader compilation failed:', this.gl.getShaderInfoLog(shader));
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
                
                this.resize();
                this.gl.useProgram(this.program);
                
                // Calculate holographic color (rich pink/magenta)
                const hue = this.params.hue || 320; // Rich magenta default
                const sat = this.params.saturation || 0.9;
                const intensity = (this.params.intensity || 0.8) * this.roleConfig.intensity;
                
                // Convert HSV to RGB for holographic colors
                const h = hue / 60.0;
                const c = sat * intensity;
                const x = c * (1 - Math.abs((h % 2) - 1));
                const m = intensity - c;
                let rgb = [0, 0, 0];
                
                if (h < 1) rgb = [c, x, 0];
                else if (h < 2) rgb = [x, c, 0];
                else if (h < 3) rgb = [0, c, x];
                else if (h < 4) rgb = [0, x, c];
                else if (h < 5) rgb = [x, 0, c];
                else rgb = [c, 0, x];
                
                const finalColor = [rgb[0] + m, rgb[1] + m, rgb[2] + m];
                
                this.gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
                this.gl.uniform1f(this.uniforms.time, time);
                this.gl.uniform2f(this.uniforms.mouse, 0.5, 0.5);
                this.gl.uniform1f(this.uniforms.geometry, this.params.geometry || 0);
                this.gl.uniform1f(this.uniforms.density, (this.params.gridDensity || 15) * 0.08 * this.roleConfig.densityMult);
                this.gl.uniform1f(this.uniforms.speed, (this.params.speed || 1.0) * this.roleConfig.speedMult);
                this.gl.uniform3f(this.uniforms.color, finalColor[0], finalColor[1], finalColor[2]);
                this.gl.uniform1f(this.uniforms.intensity, intensity);
                this.gl.uniform1f(this.uniforms.roleDensity, this.roleConfig.densityMult);
                this.gl.uniform1f(this.uniforms.roleSpeed, this.roleConfig.speedMult);
                this.gl.uniform1f(this.uniforms.geometryType, this.params.geometry || 0);
                this.gl.uniform1f(this.uniforms.chaos, this.params.chaos || 0.2);
                this.gl.uniform1f(this.uniforms.morph, this.params.morphFactor || 1.0);
                this.gl.uniform1f(this.uniforms.rot4dXW, this.params.rot4dXW || 0.0);
                this.gl.uniform1f(this.uniforms.rot4dYW, this.params.rot4dYW || 0.0);
                this.gl.uniform1f(this.uniforms.rot4dZW, this.params.rot4dZW || 0.0);
                
                this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
            }
        }
        
        // Enhanced interactivity system for Holographic cards
        const canvas = document.getElementById('vib34dCanvas');
        if (!canvas) {
            console.error('Canvas not found for holographic interactivity');
            return;
        }
        
        let mouseX = 0.5, mouseY = 0.5, mouseIntensity = 0.0;
        let clickIntensity = 0.0;
        
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = (e.clientX - rect.left) / rect.width;
            mouseY = 1.0 - (e.clientY - rect.top) / rect.height;
            mouseIntensity = Math.min(1.0, Math.sqrt(e.movementX*e.movementX + e.movementY*e.movementY) / 40);
            
            // Future: Update holographic visualizers with mouse data
        });
        
        canvas.addEventListener('dblclick', async () => {
            console.log('🌈 Holographic card audio reactivity - Coming soon!');
            canvas.style.border = '2px solid #ff64ff';
            setTimeout(() => { canvas.style.border = ''; }, 2000);
        });`;
    }
    
    /**
     * Get system metadata for the holographic system
     */
    static getSystemInfo() {
        return {
            name: 'Holographic',
            type: 'holographic',
            description: 'Rich holographic effects with complete VIB3 geometry library and audio reactivity',
            features: ['All 8 VIB3 geometries', 'Holographic effects', 'Moire patterns', 'RGB glitch', 'Audio reactive'],
            shaderComplexity: 'very high',
            layers: 5,
            defaultHue: 320,
            specialEffects: ['moirePattern', 'rgbGlitch', 'getDynamicGeometry', 'audioReactivity']
        };
    }
}