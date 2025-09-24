/**
 * Quantum Trading Card Generator
 * Specializes in enhanced 3D lattice with complex holographic effects
 */
import { CardGeneratorBase } from './CardGeneratorBase.js';

export class QuantumCardGenerator extends CardGeneratorBase {
    constructor() {
        super('Quantum');
    }
    
    getSystemShaders() {
        return {
            vertex: `
                attribute vec2 a_position;
                void main() {
                    gl_Position = vec4(a_position, 0.0, 1.0);
                }
            `,
            fragment: `
                precision highp float;
                
                uniform vec2 u_resolution;
                uniform float u_time;
                uniform float u_geometry;
                uniform float u_gridDensity;
                uniform float u_hue;
                uniform float u_intensity;
                uniform float u_morphFactor;
                uniform float u_chaos;
                uniform float u_rot4dXW;
                uniform float u_rot4dYW;
                uniform float u_rot4dZW;
                
                // Enhanced 4D rotation matrices
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
                
                // Enhanced quantum lattice patterns
                float quantumLattice(vec3 p, float gridSize) {
                    vec3 q = fract(p * gridSize) - 0.5;
                    
                    // Base structure
                    float d1 = length(q);
                    float d2 = length(q - vec3(0.4, 0.0, 0.0));
                    float d3 = length(q - vec3(0.0, 0.4, 0.0));
                    float d4 = length(q - vec3(0.0, 0.0, 0.4));
                    float vertices = 1.0 - smoothstep(0.0, 0.05, min(min(d1, d2), min(d3, d4)));
                    
                    // Enhanced edges with shimmer
                    float edges = 0.0;
                    edges = max(edges, 1.0 - smoothstep(0.0, 0.02, abs(length(q.xy) - 0.25 + sin(u_time * 0.001) * 0.05)));
                    edges = max(edges, 1.0 - smoothstep(0.0, 0.02, abs(length(q.yz) - 0.25 + cos(u_time * 0.0012) * 0.05)));
                    edges = max(edges, 1.0 - smoothstep(0.0, 0.02, abs(length(q.xz) - 0.25 + sin(u_time * 0.0008) * 0.05)));
                    
                    // Quantum interference patterns
                    float interference = sin(d1 * 20.0 + u_time * 0.002) * sin(d2 * 18.0 + u_time * 0.0015);
                    
                    return max(vertices, edges * 0.7) + interference * 0.1;
                }
                
                float getQuantumGeometry(vec3 p, float geometryType) {
                    vec3 q = fract(p * u_gridDensity * 0.12) - 0.5;
                    
                    int geom = int(mod(geometryType, 8.0));
                    
                    if (geom == 0) {
                        return quantumLattice(p, u_gridDensity * 0.15);
                    }
                    else if (geom == 1) {
                        // Quantum hypercube with shimmer
                        vec3 grid = abs(q);
                        float shimmer = sin(grid.x * 30.0 + u_time * 0.001) * sin(grid.y * 25.0 + u_time * 0.0012);
                        return (1.0 - smoothstep(0.0, 0.02, min(min(grid.x, grid.y), grid.z) - 0.4)) + shimmer * 0.1;
                    }
                    else if (geom == 2) {
                        // Quantum sphere with volumetric effects
                        float r = length(q);
                        float volume = sin(r * 15.0 + u_time * 0.001) * 0.1;
                        return (1.0 - smoothstep(0.2, 0.45, r)) + volume;
                    }
                    else {
                        // Enhanced patterns for other geometries
                        return quantumLattice(p, u_gridDensity * 0.1 + sin(u_time * 0.0005) * 0.02);
                    }
                }
                
                vec3 hsv2rgb(vec3 c) {
                    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
                    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
                    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
                }
                
                // RGB glitch effect
                vec3 rgbGlitch(vec3 color, vec2 uv, float intensity) {
                    vec2 offset = vec2(intensity * 0.008, 0.0);
                    float r = color.r + sin(uv.y * 40.0 + u_time * 0.001) * intensity * 0.08;
                    float g = color.g + sin(uv.y * 38.0 + u_time * 0.0015) * intensity * 0.08;
                    float b = color.b + sin(uv.y * 42.0 + u_time * 0.0008) * intensity * 0.08;
                    return vec3(r, g, b);
                }
                
                void main() {
                    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
                    float aspectRatio = u_resolution.x / u_resolution.y;
                    uv.x *= aspectRatio;
                    uv -= 0.5;
                    
                    float time = u_time * 0.0008;
                    
                    // Enhanced 4D transformations
                    vec4 p4d = vec4(uv, 
                                   sin(time * 0.4 + uv.x * 2.0) * 0.25, 
                                   cos(time * 0.3 + uv.y * 2.0) * 0.2);
                    
                    // Enhanced rotations with quantum effects
                    p4d = rotateXW(u_rot4dXW + time * 0.2 + sin(time * 2.0) * 0.1) * p4d;
                    p4d = rotateYW(u_rot4dYW + time * 0.25 + cos(time * 1.5) * 0.1) * p4d;
                    p4d = rotateZW(u_rot4dZW + time * 0.3 + sin(time * 1.2) * 0.1) * p4d;
                    
                    vec3 p = project4Dto3D(p4d);
                    
                    // Enhanced morphing
                    p += vec3(
                        sin(p.y * 12.0 + time * 2.0) * u_morphFactor * 0.15,
                        cos(p.x * 10.0 + time * 1.5) * u_morphFactor * 0.12,
                        sin(p.z * 14.0 + time * 1.8) * u_morphFactor * 0.1
                    );
                    
                    float pattern = getQuantumGeometry(p, u_geometry);
                    
                    // Enhanced quantum color scheme
                    vec3 baseColor = hsv2rgb(vec3(u_hue / 360.0, 0.9, u_intensity));
                    vec3 quantumColor = hsv2rgb(vec3((u_hue + 60.0) / 360.0, 0.7, u_intensity * 0.8));
                    
                    vec3 color = mix(baseColor, quantumColor, pattern * 0.6) * (0.4 + pattern * 0.8);
                    
                    // Enhanced quantum effects
                    color += vec3(pattern * 0.5) * baseColor;
                    color += quantumColor * sin(length(uv) * 10.0 + time * 3.0) * 0.1;
                    
                    // Enhanced chaos/glitch
                    color = rgbGlitch(color, uv, u_chaos);
                    color += vec3(sin(uv.x * 25.0 + time * 2.0) * u_chaos * 0.08);
                    
                    // Quantum shimmer overlay
                    float shimmer = sin(length(uv) * 20.0 + time * 4.0) * 0.05;
                    color += vec3(shimmer) * baseColor;
                    
                    gl_FragColor = vec4(color, 1.0);
                }
            `
        };
    }
    
    getSystemStyles() {
        return `
            .visualization-area {
                border: 2px solid rgba(0, 255, 255, 0.4);
                box-shadow: 
                    0 0 30px rgba(0, 255, 255, 0.3),
                    inset 0 0 20px rgba(0, 255, 255, 0.1);
                background: rgba(0, 255, 255, 0.02);
            }
            
            .card-title {
                color: #00ffff;
                text-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
            }
            
            .system-badge.quantum {
                box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
                animation: quantum-glow 2s ease-in-out infinite alternate;
            }
            
            @keyframes quantum-glow {
                from { box-shadow: 0 0 15px rgba(0, 255, 255, 0.5); }
                to { box-shadow: 0 0 25px rgba(0, 255, 255, 0.8); }
            }
        `;
    }
    
    generateSystemContent(parameters) {
        return `<canvas id="quantum-canvas"></canvas>`;
    }
    
    getSystemJavaScript() {
        return `
            function initializeCard(params) {
                const canvas = document.getElementById('quantum-canvas');
                const gl = canvas.getContext('webgl');
                
                if (!gl) {
                    throw new Error('WebGL not supported');
                }
                
                // Resize canvas
                function resize() {
                    canvas.width = canvas.clientWidth;
                    canvas.height = canvas.clientHeight;
                    gl.viewport(0, 0, canvas.width, canvas.height);
                }
                window.addEventListener('resize', resize);
                resize();
                
                // Create shader program (same as faceted but with quantum shaders)
                function createShader(type, source) {
                    const shader = gl.createShader(type);
                    gl.shaderSource(shader, source);
                    gl.compileShader(shader);
                    
                    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
                        gl.deleteShader(shader);
                        return null;
                    }
                    return shader;
                }
                
                const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
                const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
                
                const program = gl.createProgram();
                gl.attachShader(program, vertexShader);
                gl.attachShader(program, fragmentShader);
                gl.linkProgram(program);
                
                if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                    console.error('Program link error:', gl.getProgramInfoLog(program));
                    return;
                }
                
                // Set up buffers
                const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
                const positionBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
                
                const positionLocation = gl.getAttribLocation(program, 'a_position');
                gl.enableVertexAttribArray(positionLocation);
                gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
                
                // Get uniform locations
                const uniforms = {
                    resolution: gl.getUniformLocation(program, 'u_resolution'),
                    time: gl.getUniformLocation(program, 'u_time'),
                    geometry: gl.getUniformLocation(program, 'u_geometry'),
                    gridDensity: gl.getUniformLocation(program, 'u_gridDensity'),
                    hue: gl.getUniformLocation(program, 'u_hue'),
                    intensity: gl.getUniformLocation(program, 'u_intensity'),
                    morphFactor: gl.getUniformLocation(program, 'u_morphFactor'),
                    chaos: gl.getUniformLocation(program, 'u_chaos'),
                    rot4dXW: gl.getUniformLocation(program, 'u_rot4dXW'),
                    rot4dYW: gl.getUniformLocation(program, 'u_rot4dYW'),
                    rot4dZW: gl.getUniformLocation(program, 'u_rot4dZW')
                };
                
                // Animation loop
                const startTime = Date.now();
                
                function render() {
                    const time = Date.now() - startTime;
                    
                    gl.useProgram(program);
                    
                    // Set uniforms (MATCHING QUANTUM ENGINE EXACTLY)
                    gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
                    gl.uniform1f(uniforms.time, time);
                    gl.uniform1f(uniforms.geometry, parseFloat(params.geometry) || 0);
                    gl.uniform1f(uniforms.gridDensity, parseFloat(params.gridDensity) || 15); // EXACT match to engine
                    gl.uniform1f(uniforms.hue, parseFloat(params.hue) || 200);
                    gl.uniform1f(uniforms.intensity, parseFloat(params.intensity) || 0.5); // EXACT match to engine
                    gl.uniform1f(uniforms.morphFactor, parseFloat(params.morphFactor) || 1.0);
                    gl.uniform1f(uniforms.chaos, parseFloat(params.chaos) || 0.2); // EXACT match to engine
                    gl.uniform1f(uniforms.rot4dXW, parseFloat(params.rot4dXW) || 0);
                    gl.uniform1f(uniforms.rot4dYW, parseFloat(params.rot4dYW) || 0);
                    gl.uniform1f(uniforms.rot4dZW, parseFloat(params.rot4dZW) || 0);
                    
                    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
                    
                    requestAnimationFrame(render);
                }
                
                render();
                console.log('✅ Quantum trading card initialized');
            }
        `;
    }
    
    getCardTitle(parameters) {
        return `QUANTUM ${this.getGeometryName(parameters)} ENHANCED`;
    }
}

export default QuantumCardGenerator;