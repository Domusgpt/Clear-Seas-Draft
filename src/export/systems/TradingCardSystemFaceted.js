/**
 * TradingCardSystemFaceted.js - Complete Faceted System for Trading Cards
 * Extracted from monolithic TradingCardGenerator.js for better maintainability
 * 
 * Contains:
 * - Complete WebGL shaders matching main engine
 * - 5-layer canvas rendering system
 * - Full interactivity (mouse, touch, scroll)
 * - Parameter-driven visualization
 */

export class TradingCardSystemFaceted {
    /**
     * Generate the complete HTML/JS code for a live faceted trading card
     * @param {Object} state - Card state with parameters and metadata
     * @returns {string} Complete JavaScript code for the card
     */
    static generateLiveSystem(state) {
        return `
        // LIVE VIB34D Faceted System - 5 Layer WebGL Rendering
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
                // Create 5 canvases dynamically
                this.layers.forEach((role, index) => {
                    const canvas = document.createElement('canvas');
                    canvas.id = 'card-' + role + '-canvas';
                    canvas.style.position = 'absolute';
                    canvas.style.top = '0';
                    canvas.style.left = '0';
                    canvas.style.width = '100%';
                    canvas.style.height = '100%';
                    canvas.style.zIndex = index;
                    
                    // Set layer-specific blend modes and opacity
                    if (role === 'background') {
                        canvas.style.opacity = '0.4';
                    } else if (role === 'shadow') {
                        canvas.style.mixBlendMode = 'multiply';
                        canvas.style.opacity = '0.6';
                    } else if (role === 'content') {
                        canvas.style.opacity = '1.0';
                    } else if (role === 'highlight') {
                        canvas.style.mixBlendMode = 'screen';
                    } else if (role === 'accent') {
                        canvas.style.mixBlendMode = 'overlay';
                        canvas.style.opacity = '0.8';
                    }
                    
                    document.getElementById('vib34dCanvas').parentElement.appendChild(canvas);
                    
                    // Create WebGL visualizer for this layer
                    const visualizer = new LayerVisualizer(canvas, role, this.params);
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
        
        class LayerVisualizer {
            constructor(canvas, role, params) {
                this.canvas = canvas;
                this.role = role;
                this.params = params;
                this.gl = canvas.getContext('webgl');
                
                const roleIntensities = {
                    'background': 0.3, 'shadow': 0.5, 'content': 0.8,
                    'highlight': 1.0, 'accent': 1.2
                };
                this.roleIntensity = roleIntensities[role] || 1.0;
                
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
                const vertexShaderSource = \`attribute vec2 a_position;
void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
}\`;
                
                // EXACT FRAGMENT SHADER FROM FACETED SYSTEM
                const fragmentShaderSource = \`precision highp float;
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
uniform float u_dimension;
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

float geometryFunction(vec4 p) {
    int geomType = int(u_geometry);
    
    if (geomType == 0) {
        vec4 pos = fract(p * u_gridDensity * 0.08);
        vec4 dist = min(pos, 1.0 - pos);
        return min(min(dist.x, dist.y), min(dist.z, dist.w)) * u_morphFactor;
    }
    else if (geomType == 1) {
        vec4 pos = fract(p * u_gridDensity * 0.08);
        vec4 dist = min(pos, 1.0 - pos);
        float minDist = min(min(dist.x, dist.y), min(dist.z, dist.w));
        return minDist * u_morphFactor;
    }
    else if (geomType == 2) {
        float r = length(p);
        float density = u_gridDensity * 0.08;
        float spheres = abs(fract(r * density) - 0.5) * 2.0;
        float theta = atan(p.y, p.x);
        float harmonics = sin(theta * 3.0) * 0.2;
        return (spheres + harmonics) * u_morphFactor;
    }
    else if (geomType == 3) {
        float r1 = length(p.xy) - 2.0;
        float torus = length(vec2(r1, p.z)) - 0.8;
        float lattice = sin(p.x * u_gridDensity * 0.08) * sin(p.y * u_gridDensity * 0.08);
        return (torus + lattice * 0.3) * u_morphFactor;
    }
    else if (geomType == 4) {
        float u = atan(p.y, p.x);
        float v = atan(p.w, p.z);
        float dist = length(p) - 2.0;
        float lattice = sin(u * u_gridDensity * 0.08) * sin(v * u_gridDensity * 0.08);
        return (dist + lattice * 0.4) * u_morphFactor;
    }
    else if (geomType == 5) {
        vec4 pos = fract(p * u_gridDensity * 0.08);
        pos = abs(pos * 2.0 - 1.0);
        float dist = length(max(abs(pos) - 1.0, 0.0));
        return dist * u_morphFactor;
    }
    else if (geomType == 6) {
        float freq = u_gridDensity * 0.08;
        float time = u_time * 0.001 * u_speed;
        float wave1 = sin(p.x * freq + time);
        float wave2 = sin(p.y * freq + time * 1.3);
        float wave3 = sin(p.z * freq * 0.8 + time * 0.7);
        float interference = wave1 * wave2 * wave3;
        return interference * u_morphFactor;
    }
    else if (geomType == 7) {
        vec4 pos = fract(p * u_gridDensity * 0.08) - 0.5;
        float cube = max(max(abs(pos.x), abs(pos.y)), max(abs(pos.z), abs(pos.w)));
        return cube * u_morphFactor;
    }
    else {
        vec4 pos = fract(p * u_gridDensity * 0.08);
        vec4 dist = min(pos, 1.0 - pos);
        return min(min(dist.x, dist.y), min(dist.z, dist.w)) * u_morphFactor;
    }
}

void main() {
    vec2 uv = (gl_FragCoord.xy - u_resolution.xy * 0.5) / min(u_resolution.x, u_resolution.y);
    
    float timeSpeed = u_time * 0.0001 * u_speed;
    vec4 pos = vec4(uv * 3.0, sin(timeSpeed * 3.0), cos(timeSpeed * 2.0));
    pos.xy += (u_mouse - 0.5) * u_mouseIntensity * 2.0;
    
    pos = rotateXW(u_rot4dXW) * pos;
    pos = rotateYW(u_rot4dYW) * pos;
    pos = rotateZW(u_rot4dZW) * pos;
    
    float value = geometryFunction(pos);
    
    float noise = sin(pos.x * 7.0) * cos(pos.y * 11.0) * sin(pos.z * 13.0);
    value += noise * u_chaos;
    
    float geometryIntensity = 1.0 - clamp(abs(value), 0.0, 1.0);
    geometryIntensity += u_clickIntensity * 0.3;
    
    float finalIntensity = geometryIntensity * u_intensity;
    
    float hue = u_hue / 360.0 + value * 0.1;
    
    vec3 baseColor = vec3(
        sin(hue * 6.28318 + 0.0) * 0.5 + 0.5,
        sin(hue * 6.28318 + 2.0943) * 0.5 + 0.5,
        sin(hue * 6.28318 + 4.1887) * 0.5 + 0.5
    );
    
    float gray = (baseColor.r + baseColor.g + baseColor.b) / 3.0;
    vec3 color = mix(vec3(gray), baseColor, u_saturation) * finalIntensity;
    
    gl_FragColor = vec4(color, finalIntensity * u_roleIntensity);
}\`;
                
                this.program = this.createProgram(vertexShaderSource, fragmentShaderSource);
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
                    dimension: this.gl.getUniformLocation(this.program, 'u_dimension'),
                    rot4dXW: this.gl.getUniformLocation(this.program, 'u_rot4dXW'),
                    rot4dYW: this.gl.getUniformLocation(this.program, 'u_rot4dYW'),
                    rot4dZW: this.gl.getUniformLocation(this.program, 'u_rot4dZW'),
                    mouseIntensity: this.gl.getUniformLocation(this.program, 'u_mouseIntensity'),
                    clickIntensity: this.gl.getUniformLocation(this.program, 'u_clickIntensity'),
                    roleIntensity: this.gl.getUniformLocation(this.program, 'u_roleIntensity')
                };
            }
            
            createProgram(vertexSource, fragmentSource) {
                const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexSource);
                const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentSource);
                
                const program = this.gl.createProgram();
                this.gl.attachShader(program, vertexShader);
                this.gl.attachShader(program, fragmentShader);
                this.gl.linkProgram(program);
                
                if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
                    console.error('Program linking failed:', this.gl.getProgramInfoLog(program));
                    return null;
                }
                
                return program;
            }
            
            createShader(type, source) {
                const shader = this.gl.createShader(type);
                this.gl.shaderSource(shader, source);
                this.gl.compileShader(shader);
                
                if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
                    console.error('Shader compilation failed:', this.gl.getShaderInfoLog(shader));
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
                
                this.gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
                this.gl.uniform1f(this.uniforms.time, time);
                this.gl.uniform2f(this.uniforms.mouse, 0.5, 0.5);
                this.gl.uniform1f(this.uniforms.geometry, this.params.geometry || 0);
                this.gl.uniform1f(this.uniforms.gridDensity, this.params.gridDensity || 15);
                this.gl.uniform1f(this.uniforms.morphFactor, this.params.morphFactor || 1.0);
                this.gl.uniform1f(this.uniforms.chaos, this.params.chaos || 0.2);
                this.gl.uniform1f(this.uniforms.speed, this.params.speed || 1.0);
                this.gl.uniform1f(this.uniforms.hue, this.params.hue || 200);
                this.gl.uniform1f(this.uniforms.intensity, this.params.intensity || 0.5);
                this.gl.uniform1f(this.uniforms.saturation, this.params.saturation || 0.8);
                this.gl.uniform1f(this.uniforms.dimension, this.params.dimension || 3.8);
                this.gl.uniform1f(this.uniforms.rot4dXW, this.params.rot4dXW || 0.0);
                this.gl.uniform1f(this.uniforms.rot4dYW, this.params.rot4dYW || 0.0);
                this.gl.uniform1f(this.uniforms.rot4dZW, this.params.rot4dZW || 0.0);
                this.gl.uniform1f(this.uniforms.mouseIntensity, this.mouseIntensity || 0.0);
                this.gl.uniform1f(this.uniforms.clickIntensity, this.clickIntensity || 0.0);
                this.gl.uniform1f(this.uniforms.roleIntensity, this.roleIntensity);
                
                this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
            }
        }
        
        // Enhanced interactivity system - FIXED CANVAS SCOPE
        const canvas = document.getElementById('vib34dCanvas');
        if (!canvas) {
            console.error('Canvas not found for interactivity');
            return;
        }
        
        let mouseX = 0.5, mouseY = 0.5, mouseIntensity = 0.0;
        let clickIntensity = 0.0;
        let currentTouch = null;
        
        // Mouse interactions
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = (e.clientX - rect.left) / rect.width;
            mouseY = 1.0 - (e.clientY - rect.top) / rect.height;
            mouseIntensity = Math.min(1.0, Math.sqrt(e.movementX*e.movementX + e.movementY*e.movementY) / 40);
            
            // Update all layer visualizers
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
        
        canvas.addEventListener('click', (e) => {
            clickIntensity = 1.0;
            if (typeof layers !== 'undefined') {
                layers.forEach(layer => {
                    if (layer.visualizer) {
                        layer.visualizer.clickIntensity = clickIntensity;
                    }
                });
            }
            setTimeout(() => { 
                clickIntensity = 0.0;
                if (typeof layers !== 'undefined') {
                    layers.forEach(layer => {
                        if (layer.visualizer) {
                            layer.visualizer.clickIntensity = 0.0;
                        }
                    });
                }
            }, 500);
        });
        
        // Touch interactions
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (e.touches.length > 0) {
                currentTouch = e.touches[0];
                const rect = canvas.getBoundingClientRect();
                mouseX = (currentTouch.clientX - rect.left) / rect.width;
                mouseY = 1.0 - (currentTouch.clientY - rect.top) / rect.height;
                clickIntensity = 1.0;
                
                if (typeof layers !== 'undefined') {
                    layers.forEach(layer => {
                        if (layer.visualizer) {
                            layer.visualizer.mouseX = mouseX;
                            layer.visualizer.mouseY = mouseY;
                            layer.visualizer.clickIntensity = clickIntensity;
                        }
                    });
                }
            }
        }, { passive: false });
        
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                const rect = canvas.getBoundingClientRect();
                mouseX = (touch.clientX - rect.left) / rect.width;
                mouseY = 1.0 - (touch.clientY - rect.top) / rect.height;
                mouseIntensity = 0.8;
                currentTouch = touch;
                
                if (typeof layers !== 'undefined') {
                    layers.forEach(layer => {
                        if (layer.visualizer) {
                            layer.visualizer.mouseX = mouseX;
                            layer.visualizer.mouseY = mouseY;
                            layer.visualizer.mouseIntensity = mouseIntensity;
                        }
                    });
                }
            }
        }, { passive: false });
        
        canvas.addEventListener('touchend', (e) => {
            clickIntensity = 0.0;
            mouseIntensity = 0.0;
            currentTouch = null;
            
            if (typeof layers !== 'undefined') {
                layers.forEach(layer => {
                    if (layer.visualizer) {
                        layer.visualizer.clickIntensity = 0.0;
                        layer.visualizer.mouseIntensity = 0.0;
                    }
                });
            }
        }, { passive: false });
        
        // Scroll interactions
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            clickIntensity = Math.min(1.0, Math.abs(e.deltaY) / 100);
            
            if (typeof layers !== 'undefined') {
                layers.forEach(layer => {
                    if (layer.visualizer) {
                        layer.visualizer.clickIntensity = clickIntensity;
                    }
                });
            }
            
            setTimeout(() => { 
                clickIntensity = 0.0;
                if (typeof layers !== 'undefined') {
                    layers.forEach(layer => {
                        if (layer.visualizer) {
                            layer.visualizer.clickIntensity = 0.0;
                        }
                    });
                }
            }, 300);
        }, { passive: false });`;
    }
    
    /**
     * Get system metadata for the faceted system
     */
    static getSystemInfo() {
        return {
            name: 'Faceted',
            type: 'faceted',
            description: 'Clean 2D geometric patterns with 4D mathematical foundations',
            features: ['5-layer rendering', '8 geometry types', '4D rotations', 'Interactive mouse/touch'],
            shaderComplexity: 'medium',
            layers: 5
        };
    }
}