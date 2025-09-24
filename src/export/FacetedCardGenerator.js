/**
 * Faceted Trading Card Generator
 * Specializes in clean, geometric, lightweight cards showcasing mathematical purity
 */
import { CardGeneratorBase } from './CardGeneratorBase.js';

export class FacetedCardGenerator extends CardGeneratorBase {
    constructor() {
        super('Faceted');
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
                
                // Simple 4D rotation matrices
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
                    float w = 2.0 / (2.0 + p.w);
                    return vec3(p.x * w, p.y * w, p.z * w);
                }
                
                // Clean geometric patterns - optimized for faceted system
                float getGeometryPattern(vec3 p, float geometryType) {
                    vec3 q = fract(p * u_gridDensity * 0.08) - 0.5;
                    
                    int geom = int(mod(geometryType, 8.0));
                    
                    if (geom == 0) {
                        // Tetrahedron - clean vertices
                        float d = min(min(length(q), length(q - vec3(0.3))), 
                                     min(length(q - vec3(0.0, 0.3, 0.0)), length(q - vec3(0.0, 0.0, 0.3))));
                        return 1.0 - smoothstep(0.0, 0.05, d);
                    }
                    else if (geom == 1) {
                        // Hypercube - grid lines
                        vec3 grid = abs(q);
                        return 1.0 - smoothstep(0.0, 0.02, min(min(grid.x, grid.y), grid.z) - 0.4);
                    }
                    else if (geom == 2) {
                        // Sphere - circular pattern
                        return 1.0 - smoothstep(0.2, 0.4, length(q));
                    }
                    else if (geom == 3) {
                        // Torus - ring pattern
                        float r1 = length(q.xy);
                        float r2 = length(vec2(r1 - 0.25, q.z));
                        return 1.0 - smoothstep(0.0, 0.08, r2);
                    }
                    else if (geom == 4) {
                        // Klein bottle - twisted pattern
                        float u_val = atan(q.y, q.x);
                        float klein = abs(sin(u_val * 3.0 + q.z * 6.0)) - 0.3;
                        return 1.0 - smoothstep(0.0, 0.1, klein);
                    }
                    else if (geom == 5) {
                        // Fractal - recursive subdivision
                        float scale = 1.0;
                        float fractal = 0.0;
                        vec3 fq = q;
                        for(int i = 0; i < 3; i++) {
                            fq = fract(fq) - 0.5;
                            fractal += length(fq) / scale;
                            scale *= 2.0;
                            fq *= 2.0;
                        }
                        return 1.0 - smoothstep(0.4, 0.8, fractal);
                    }
                    else if (geom == 6) {
                        // Wave - sine pattern
                        float wave = sin(q.x * 8.0 + u_time * 0.001) * sin(q.y * 8.0) * sin(q.z * 8.0);
                        return smoothstep(-0.3, 0.3, wave);
                    }
                    else {
                        // Crystal - diamond grid
                        float crystal = max(max(abs(q.x), abs(q.y)), abs(q.z)) - 0.3;
                        return 1.0 - smoothstep(0.0, 0.05, crystal);
                    }
                }
                
                vec3 hsv2rgb(vec3 c) {
                    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
                    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
                    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
                }
                
                void main() {
                    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
                    float aspectRatio = u_resolution.x / u_resolution.y;
                    uv.x *= aspectRatio;
                    uv -= 0.5;
                    
                    float time = u_time * 0.0005;
                    
                    // 4D point with rotation
                    vec4 p4d = vec4(uv, sin(time * 0.3) * 0.2, cos(time * 0.2) * 0.15);
                    
                    p4d = rotateXW(u_rot4dXW + time * 0.1) * p4d;
                    p4d = rotateYW(u_rot4dYW + time * 0.15) * p4d;
                    p4d = rotateZW(u_rot4dZW + time * 0.2) * p4d;
                    
                    vec3 p = project4Dto3D(p4d);
                    
                    // Apply morph factor
                    p += vec3(sin(p.y * 10.0 + time) * u_morphFactor * 0.1);
                    
                    float pattern = getGeometryPattern(p, u_geometry);
                    
                    // Clean color scheme
                    vec3 color = hsv2rgb(vec3(u_hue / 360.0, 0.8, u_intensity));
                    color *= pattern;
                    
                    // Minimal chaos - just slight variation
                    color += vec3(sin(uv.x * 20.0 + time) * u_chaos * 0.05);
                    
                    gl_FragColor = vec4(color, 1.0);
                }
            `
        };
    }
    
    getSystemStyles() {
        return `
            .visualization-area {
                border: 2px solid rgba(0, 255, 255, 0.3);
                box-shadow: 0 0 30px rgba(0, 255, 255, 0.2);
            }
            
            .card-title {
                color: #00ffff;
            }
        `;
    }
    
    generateSystemContent(parameters) {
        return `<canvas id="faceted-canvas"></canvas>`;
    }
    
    getSystemJavaScript() {
        return `
            function initializeCard(params) {
                const canvas = document.getElementById('faceted-canvas');
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
                
                // Create shader program
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
                    
                    // Set uniforms
                    gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
                    gl.uniform1f(uniforms.time, time);
                    gl.uniform1f(uniforms.geometry, parseFloat(params.geometry) || 0);
                    gl.uniform1f(uniforms.gridDensity, parseFloat(params.gridDensity) || 15);
                    gl.uniform1f(uniforms.hue, parseFloat(params.hue) || 200);
                    gl.uniform1f(uniforms.intensity, parseFloat(params.intensity) || 0.5);
                    gl.uniform1f(uniforms.morphFactor, parseFloat(params.morphFactor) || 1.0);
                    gl.uniform1f(uniforms.chaos, parseFloat(params.chaos) || 0.2);
                    gl.uniform1f(uniforms.rot4dXW, parseFloat(params.rot4dXW) || 0);
                    gl.uniform1f(uniforms.rot4dYW, parseFloat(params.rot4dYW) || 0);
                    gl.uniform1f(uniforms.rot4dZW, parseFloat(params.rot4dZW) || 0);
                    
                    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
                    
                    requestAnimationFrame(render);
                }
                
                render();
                console.log('✅ Faceted trading card initialized');
            }
        `;
    }
}

export default FacetedCardGenerator;