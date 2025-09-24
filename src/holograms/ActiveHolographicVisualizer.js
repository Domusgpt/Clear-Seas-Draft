/**
 * REAL Active Holographic Visualizer - Exact implementation from active-holographic-systems-FIXED
 * Multi-layer WebGL rendering with audio reactivity, touch interaction, and complex visual effects
 */
export class ActiveHolographicVisualizer {
    constructor(canvasId, role = 'content', reactivity = 1.0, variant = 0) {
        this.canvas = document.getElementById(canvasId);
        this.role = role;
        this.reactivity = reactivity;
        this.variant = variant;
        this.gl = this.canvas.getContext('webgl');
        
        if (!this.gl) {
            throw new Error(`WebGL not supported for ${canvasId}`);
        }
        
        this.variantParams = this.generateVariantParams(variant);
        this.roleParams = this.generateRoleParams(role);
        
        // Initialize state
        this.mouseX = 0.5;
        this.mouseY = 0.5;
        this.mouseIntensity = 0.0;
        this.clickIntensity = 0.0;
        this.clickDecay = 0.95;
        
        // Touch and scroll
        this.touchX = 0.5;
        this.touchY = 0.5;
        this.touchActive = false;
        this.touchMorph = 0.0;
        this.touchChaos = 0.0;
        this.scrollPosition = 0.0;
        this.scrollVelocity = 0.0;
        this.scrollDecay = 0.92;
        this.parallaxDepth = 0.0;
        this.gridDensityShift = 0.0;
        this.colorScrollShift = 0.0;
        
        // Density system
        this.densityVariation = 0.0;
        this.densityTarget = 0.0;
        
        // Audio reactivity
        this.audioData = { bass: 0, mid: 0, high: 0 };
        this.audioDensityBoost = 0.0;
        this.audioMorphBoost = 0.0;
        this.audioSpeedBoost = 0.0;
        this.audioChaosBoost = 0.0;
        this.audioColorShift = 0.0;
        
        this.startTime = Date.now();
        this.initShaders();
        this.initBuffers();
        this.resize();
    }
    
    generateVariantParams(variant) {
        const vib3Geometries = [
            'TETRAHEDRON', 'HYPERCUBE', 'SPHERE', 'TORUS', 
            'KLEIN BOTTLE', 'FRACTAL', 'WAVE', 'CRYSTAL'
        ];
        
        const geometryMap = [
            0, 0, 0, 0,  // 0-3: TETRAHEDRON variations
            1, 1, 1, 1,  // 4-7: HYPERCUBE variations
            2, 2, 2, 2,  // 8-11: SPHERE variations
            3, 3, 3, 3,  // 12-15: TORUS variations
            4, 4, 4, 4,  // 16-19: KLEIN BOTTLE variations
            5, 5, 5,     // 20-22: FRACTAL variations
            6, 6, 6,     // 23-25: WAVE variations
            7, 7, 7, 7   // 26-29: CRYSTAL variations
        ];
        
        const baseGeometry = geometryMap[variant] || 0;
        const variationLevel = variant % 4;
        const geometryName = vib3Geometries[baseGeometry];
        
        const suffixes = [' LATTICE', ' FIELD', ' MATRIX', ' RESONANCE'];
        const finalName = geometryName + suffixes[variationLevel];
        
        const geometryConfigs = {
            0: { density: 0.8 + variationLevel * 0.2, speed: 0.3 + variationLevel * 0.1, chaos: variationLevel * 0.1, morph: 0.0 + variationLevel * 0.2 },
            1: { density: 1.0 + variationLevel * 0.3, speed: 0.5 + variationLevel * 0.1, chaos: variationLevel * 0.15, morph: variationLevel * 0.2 },
            2: { density: 1.2 + variationLevel * 0.4, speed: 0.4 + variationLevel * 0.2, chaos: 0.1 + variationLevel * 0.1, morph: 0.3 + variationLevel * 0.2 },
            3: { density: 0.9 + variationLevel * 0.3, speed: 0.6 + variationLevel * 0.2, chaos: 0.2 + variationLevel * 0.2, morph: 0.5 + variationLevel * 0.1 },
            4: { density: 1.4 + variationLevel * 0.5, speed: 0.7 + variationLevel * 0.1, chaos: 0.3 + variationLevel * 0.2, morph: 0.7 + variationLevel * 0.1 },
            5: { density: 1.8 + variationLevel * 0.3, speed: 0.5 + variationLevel * 0.3, chaos: 0.5 + variationLevel * 0.2, morph: 0.8 + variationLevel * 0.05 },
            6: { density: 0.6 + variationLevel * 0.4, speed: 0.8 + variationLevel * 0.4, chaos: 0.4 + variationLevel * 0.3, morph: 0.6 + variationLevel * 0.2 },
            7: { density: 1.6 + variationLevel * 0.2, speed: 0.2 + variationLevel * 0.1, chaos: 0.1 + variationLevel * 0.1, morph: 0.2 + variationLevel * 0.2 }
        };
        
        const config = geometryConfigs[baseGeometry];
        
        return {
            geometryType: baseGeometry,
            name: finalName,
            density: config.density,
            speed: config.speed,
            hue: (variant * 12.27) % 360,
            saturation: 0.8 + (variationLevel * 0.05),
            intensity: 0.5 + (variationLevel * 0.1),
            chaos: config.chaos,
            morph: config.morph
        };
    }
    
    generateRoleParams(role) {
        const vp = this.variantParams;
        
        const roleConfigs = {
            'background': { 
                densityMult: 0.4, speedMult: 0.2, colorShift: 0.0, intensity: 0.2,
                mouseReactivity: 0.3, clickReactivity: 0.1 
            },
            'shadow': { 
                densityMult: 0.8, speedMult: 0.3, colorShift: 180.0, intensity: 0.4,
                mouseReactivity: 0.5, clickReactivity: 0.3 
            },
            'content': { 
                densityMult: vp.density, speedMult: vp.speed, 
                colorShift: vp.hue, intensity: vp.intensity,
                mouseReactivity: 1.0, clickReactivity: 0.8 
            },
            'highlight': { 
                densityMult: 1.5 + (vp.density * 0.3), speedMult: 0.8 + (vp.speed * 0.2), 
                colorShift: vp.hue + 60.0, intensity: 0.6 + (vp.intensity * 0.2),
                mouseReactivity: 1.2, clickReactivity: 1.0 
            },
            'accent': { 
                densityMult: 2.5 + (vp.density * 0.5), speedMult: 0.4 + (vp.speed * 0.1), 
                colorShift: vp.hue + 300.0, intensity: 0.3 + (vp.intensity * 0.1),
                mouseReactivity: 1.5, clickReactivity: 1.2 
            }
        };
        
        return roleConfigs[role] || { 
            densityMult: 1.0, speedMult: 0.5, colorShift: 0.0, intensity: 0.5, 
            mouseReactivity: 1.0, clickReactivity: 0.5 
        };
    }
    
    initShaders() {
        const vertexShaderSource = `attribute vec2 a_position;
void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
}`;
        
        const fragmentShaderSource = `precision highp float;

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
uniform float u_colorShift;
uniform float u_chaosIntensity;
uniform float u_mouseIntensity;
uniform float u_clickIntensity;
uniform float u_densityVariation;
uniform float u_geometryType;
uniform float u_chaos;
uniform float u_morph;
uniform float u_touchMorph;
uniform float u_touchChaos;
uniform float u_scrollParallax;
uniform float u_gridDensityShift;
uniform float u_colorScrollShift;
uniform float u_audioDensityBoost;
uniform float u_audioMorphBoost;
uniform float u_audioSpeedBoost;
uniform float u_audioChaosBoost;
uniform float u_audioColorShift;

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

// 4D to 3D projection
vec3 project4Dto3D(vec4 p) {
    float w = 2.5 / (2.5 + p.w);
    return vec3(p.x * w, p.y * w, p.z * w);
}

// VIB3 Geometry Library
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

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 rgbGlitch(vec3 color, vec2 uv, float intensity) {
    vec2 offset = vec2(intensity * 0.005, 0.0);
    float r = color.r + sin(uv.y * 30.0 + u_time * 0.001) * intensity * 0.06;
    float g = color.g + sin(uv.y * 28.0 + u_time * 0.0012) * intensity * 0.06;
    float b = color.b + sin(uv.y * 32.0 + u_time * 0.0008) * intensity * 0.06;
    return vec3(r, g, b);
}

float moirePattern(vec2 uv, float intensity) {
    float freq1 = 12.0 + intensity * 6.0 + u_densityVariation * 3.0;
    float freq2 = 14.0 + intensity * 8.0 + u_densityVariation * 4.0;
    float pattern1 = sin(uv.x * freq1) * sin(uv.y * freq1);
    float pattern2 = sin(uv.x * freq2) * sin(uv.y * freq2);
    return (pattern1 * pattern2) * intensity * 0.15;
}

float gridOverlay(vec2 uv, float intensity) {
    vec2 grid = fract(uv * (8.0 + u_densityVariation * 4.0));
    float lines = 0.0;
    lines = max(lines, 1.0 - smoothstep(0.0, 0.02, abs(grid.x - 0.5)));
    lines = max(lines, 1.0 - smoothstep(0.0, 0.02, abs(grid.y - 0.5)));
    return lines * intensity * 0.1;
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float aspectRatio = u_resolution.x / u_resolution.y;
    uv.x *= aspectRatio;
    uv -= 0.5;
    
    float time = u_time * 0.0004 * u_speed * u_roleSpeed;
    
    float mouseInfluence = u_mouseIntensity * 0.25; // FIX: Reduce mouse jarring by 50%
    vec2 mouseOffset = (u_mouse - 0.5) * mouseInfluence;
    
    float parallaxOffset = u_scrollParallax * 0.2;
    vec2 scrollOffset = vec2(parallaxOffset * 0.1, parallaxOffset * 0.05);
    
    float morphOffset = u_touchMorph * 0.3;
    
    vec4 p4d = vec4(uv + mouseOffset * 0.1 + scrollOffset, 
                   sin(time * 0.1 + morphOffset) * 0.15, 
                   cos(time * 0.08 + morphOffset * 0.5) * 0.15);
    
    float scrollRotation = u_scrollParallax * 0.1;
    float touchRotation = u_touchMorph * 0.2;
    
    p4d = rotateXW(time * 0.2 + mouseOffset.y * 0.5 + scrollRotation) * p4d;
    p4d = rotateYW(time * 0.15 + mouseOffset.x * 0.5 + touchRotation) * p4d;
    p4d = rotateZW(time * 0.25 + u_clickIntensity * 0.3 + u_touchChaos * 0.4) * p4d;
    
    vec3 p = project4Dto3D(p4d);
    
    float scrollDensityMod = 1.0 + u_gridDensityShift * 0.3;
    float audioDensityMod = 1.0 + u_audioDensityBoost * 0.5;
    // FIX: Prevent density doubling by using base density with controlled variations
    float baseDensity = u_density * u_roleDensity;
    float densityVariations = (u_densityVariation * 0.3 + (scrollDensityMod - 1.0) * 0.4 + (audioDensityMod - 1.0) * 0.2);
    float roleDensity = baseDensity + densityVariations;
    
    float morphedGeometry = u_geometryType + u_morph * 3.0 + u_touchMorph * 2.0 + u_audioMorphBoost * 1.5;
    float lattice = getDynamicGeometry(p, roleDensity, morphedGeometry);
    
    // Use the passed RGB as base color and modulate with lattice patterns
    vec3 baseColor = u_color;
    float latticeIntensity = lattice * u_intensity;
    
    vec3 color = baseColor * (0.3 + latticeIntensity * 0.7);
    
    // Add lattice-based brightness variations
    color += vec3(lattice * 0.4) * baseColor;
    
    float enhancedChaos = u_chaos + u_chaosIntensity + u_touchChaos * 0.3 + u_audioChaosBoost * 0.4;
    color += vec3(moirePattern(uv + scrollOffset, enhancedChaos));
    color += vec3(gridOverlay(uv, u_mouseIntensity + u_scrollParallax * 0.1));
    color = rgbGlitch(color, uv, enhancedChaos);
    
    // Apply morph distortion to position
    vec2 morphDistortion = vec2(sin(uv.y * 10.0 + u_time * 0.001) * u_morph * 0.1, 
                               cos(uv.x * 10.0 + u_time * 0.001) * u_morph * 0.1);
    color = mix(color, color * (1.0 + length(morphDistortion)), u_morph * 0.5);
    
    float mouseDist = length(uv - (u_mouse - 0.5) * vec2(aspectRatio, 1.0));
    float mouseGlow = exp(-mouseDist * 1.5) * u_mouseIntensity * 0.2;
    color += vec3(mouseGlow) * baseColor * 0.6;
    
    float clickPulse = u_clickIntensity * exp(-mouseDist * 2.0) * 0.3;
    color += vec3(clickPulse, clickPulse * 0.5, clickPulse * 1.5);
    
    gl_FragColor = vec4(color, 0.95);
}`;
        
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
            colorShift: this.gl.getUniformLocation(this.program, 'u_colorShift'),
            chaosIntensity: this.gl.getUniformLocation(this.program, 'u_chaosIntensity'),
            mouseIntensity: this.gl.getUniformLocation(this.program, 'u_mouseIntensity'),
            clickIntensity: this.gl.getUniformLocation(this.program, 'u_clickIntensity'),
            densityVariation: this.gl.getUniformLocation(this.program, 'u_densityVariation'),
            geometryType: this.gl.getUniformLocation(this.program, 'u_geometryType'),
            chaos: this.gl.getUniformLocation(this.program, 'u_chaos'),
            morph: this.gl.getUniformLocation(this.program, 'u_morph'),
            touchMorph: this.gl.getUniformLocation(this.program, 'u_touchMorph'),
            touchChaos: this.gl.getUniformLocation(this.program, 'u_touchChaos'),
            scrollParallax: this.gl.getUniformLocation(this.program, 'u_scrollParallax'),
            gridDensityShift: this.gl.getUniformLocation(this.program, 'u_gridDensityShift'),
            colorScrollShift: this.gl.getUniformLocation(this.program, 'u_colorScrollShift'),
            audioDensityBoost: this.gl.getUniformLocation(this.program, 'u_audioDensityBoost'),
            audioMorphBoost: this.gl.getUniformLocation(this.program, 'u_audioMorphBoost'),
            audioSpeedBoost: this.gl.getUniformLocation(this.program, 'u_audioSpeedBoost'),
            audioChaosBoost: this.gl.getUniformLocation(this.program, 'u_audioChaosBoost'),
            audioColorShift: this.gl.getUniformLocation(this.program, 'u_audioColorShift')
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
            throw new Error('Program linking failed: ' + this.gl.getProgramInfoLog(program));
        }
        
        return program;
    }
    
    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            throw new Error('Shader compilation failed: ' + this.gl.getShaderInfoLog(shader));
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
    
    resize() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
    
    updateInteraction(mouseX, mouseY, intensity) {
        this.mouseX = mouseX;
        this.mouseY = mouseY;
        this.mouseIntensity = intensity * this.roleParams.mouseReactivity * this.reactivity;
    }
    
    triggerClick(x, y) {
        this.clickIntensity = Math.min(1.0, this.clickIntensity + this.roleParams.clickReactivity * this.reactivity);
    }
    
    updateVariant(variant) {
        this.variant = variant;
        this.variantParams = this.generateVariantParams(variant);
        this.roleParams = this.generateRoleParams(this.role);
    }
    
    updateDensity(variation) {
        this.densityTarget = variation;
    }
    
    updateTouch(touchX, touchY, active) {
        this.touchX = touchX;
        this.touchY = touchY;
        this.touchActive = active;
        this.touchMorph = (touchX - 0.5) * 2.0;
        this.touchChaos = Math.abs(touchY - 0.5) * 2.0;
    }
    
    updateScroll(deltaY) {
        this.scrollVelocity += deltaY * 0.001;
        this.scrollVelocity = Math.max(-2.0, Math.min(2.0, this.scrollVelocity));
    }
    
    updateAudio(audioData) {
        if (!audioData) return;
        
        this.audioData = audioData;
        
        // Musical visualization approach - responsive but controlled
        const smoothing = 0.6; // Less smoothing for more reactivity
        
        this.audioDensityBoost = this.audioData.bass * smoothing + this.audioDensityBoost * (1 - smoothing);
        this.audioMorphBoost = this.audioData.mid * smoothing + this.audioMorphBoost * (1 - smoothing);
        this.audioSpeedBoost = this.audioData.high * smoothing + this.audioSpeedBoost * (1 - smoothing);
        this.audioChaosBoost = (this.audioData.bass + this.audioData.high) * 0.5 * smoothing + this.audioChaosBoost * (1 - smoothing);
        this.audioColorShift = this.audioData.mid * 30.0; // Direct mapping for color shifts
    }
    
    render() {
        if (!this.program) return;
        
        this.resize();
        this.gl.useProgram(this.program);
        
        const time = Date.now() - this.startTime;
        
        // Update density variation smoothly
        this.densityVariation += (this.densityTarget - this.densityVariation) * 0.05;
        
        // Update scroll physics
        this.scrollPosition += this.scrollVelocity;
        this.scrollVelocity *= this.scrollDecay;
        this.parallaxDepth = this.scrollPosition * 0.1;
        this.gridDensityShift = this.scrollVelocity * 2.0;
        this.colorScrollShift = this.scrollPosition * 0.5;
        
        // Update click intensity with decay
        this.clickIntensity = Math.max(0.0, this.clickIntensity * this.clickDecay);
        
        // Convert hue to RGB for u_color
        const hue = (this.roleParams.colorShift + this.audioColorShift + this.colorScrollShift) % 360.0;
        const hsv = [hue / 360.0, this.variantParams.saturation, this.roleParams.intensity];
        const rgb = this.hsv2rgb(hsv);
        
        // Set uniforms
        this.gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
        this.gl.uniform1f(this.uniforms.time, time);
        this.gl.uniform2f(this.uniforms.mouse, this.mouseX, this.mouseY);
        this.gl.uniform1f(this.uniforms.geometry, this.variantParams.geometryType);
        this.gl.uniform1f(this.uniforms.density, this.variantParams.density);
        // FIX: Controlled speed calculation - much slower base speed, audio provides subtle boost
        const baseSpeed = (this.variantParams.speed || 0.5) * 0.2; // Much slower base speed
        const audioBoost = (this.audioSpeedBoost || 0.0) * 0.1; // Subtle audio boost only
        this.gl.uniform1f(this.uniforms.speed, baseSpeed + audioBoost);
        this.gl.uniform3f(this.uniforms.color, rgb[0], rgb[1], rgb[2]);
        this.gl.uniform1f(this.uniforms.intensity, this.roleParams.intensity);
        this.gl.uniform1f(this.uniforms.roleDensity, this.roleParams.densityMult);
        this.gl.uniform1f(this.uniforms.roleSpeed, this.roleParams.speedMult);
        this.gl.uniform1f(this.uniforms.colorShift, this.roleParams.colorShift);
        this.gl.uniform1f(this.uniforms.chaosIntensity, this.variantParams.chaos);
        this.gl.uniform1f(this.uniforms.mouseIntensity, this.mouseIntensity);
        this.gl.uniform1f(this.uniforms.clickIntensity, this.clickIntensity);
        this.gl.uniform1f(this.uniforms.densityVariation, this.densityVariation);
        this.gl.uniform1f(this.uniforms.geometryType, this.variantParams.geometryType);
        this.gl.uniform1f(this.uniforms.chaos, this.variantParams.chaos);
        this.gl.uniform1f(this.uniforms.morph, this.variantParams.morph);
        this.gl.uniform1f(this.uniforms.touchMorph, this.touchMorph);
        this.gl.uniform1f(this.uniforms.touchChaos, this.touchChaos);
        this.gl.uniform1f(this.uniforms.scrollParallax, this.parallaxDepth);
        this.gl.uniform1f(this.uniforms.gridDensityShift, this.gridDensityShift);
        this.gl.uniform1f(this.uniforms.colorScrollShift, this.colorScrollShift);
        this.gl.uniform1f(this.uniforms.audioDensityBoost, this.audioDensityBoost);
        this.gl.uniform1f(this.uniforms.audioMorphBoost, this.audioMorphBoost);
        this.gl.uniform1f(this.uniforms.audioSpeedBoost, this.audioSpeedBoost);
        this.gl.uniform1f(this.uniforms.audioChaosBoost, this.audioChaosBoost);
        this.gl.uniform1f(this.uniforms.audioColorShift, this.audioColorShift);
        
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }
    
    // Helper function to convert HSV to RGB
    hsv2rgb(hsv) {
        const h = hsv[0] * 6;
        const s = hsv[1];
        const v = hsv[2];
        const c = v * s;
        const x = c * (1 - Math.abs((h % 2) - 1));
        const m = v - c;
        
        let r, g, b;
        if (h < 1) { r = c; g = x; b = 0; }
        else if (h < 2) { r = x; g = c; b = 0; }
        else if (h < 3) { r = 0; g = c; b = x; }
        else if (h < 4) { r = 0; g = x; b = c; }
        else if (h < 5) { r = x; g = 0; b = c; }
        else { r = c; g = 0; b = x; }
        
        return [r + m, g + m, b + m];
    }
    
    destroy() {
        if (this.gl && this.program) {
            this.gl.deleteProgram(this.program);
        }
        if (this.gl && this.buffer) {
            this.gl.deleteBuffer(this.buffer);
        }
    }
}