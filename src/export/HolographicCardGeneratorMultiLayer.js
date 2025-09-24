/**
 * Multi-Layer Holographic Card Generator - MATCHES Original 5-Layer System
 * Creates 5 separate canvas layers and composites them like the real engine
 */

export class HolographicCardGeneratorMultiLayer {
    static generateCard(params, canvasId = 'trading-card-canvas') {
        console.log('🌌 HolographicCardGeneratorMultiLayer received parameters:', params);
        
        const geometryNames = {
            0: 'tetrahedron', 1: 'hypercube', 2: 'sphere', 3: 'torus',
            4: 'klein', 5: 'fractal', 6: 'wave', 7: 'crystal'
        };
        
        const geometryName = geometryNames[params.geometry] || 'hypercube';
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        
        console.log('🌌 Using geometry:', params.geometry, '→', geometryName);
        console.log('🌌 GridDensity parameter:', params.gridDensity);
        console.log('🌌 Template literal values that will be baked into HTML:');
        console.log('   geometry:', params.geometry || 0);
        console.log('   speed:', params.speed || 1.0);
        console.log('   intensity:', params.intensity || 0.6);
        console.log('   hue:', params.hue || 320);
        console.log('   saturation:', params.saturation || 0.8);
        console.log('   morphFactor:', params.morphFactor || 1.0);
        console.log('   chaos:', params.chaos || 0.2);
        console.log('   rot4dXW:', params.rot4dXW || 0.0);
        console.log('   rot4dYW:', params.rot4dYW || 0.0);
        console.log('   rot4dZW:', params.rot4dZW || 0.0);
        
        // Use EXACT shader from HolographicVisualizer (WebGL 1.0 compatible)
        const fragmentShader = `precision highp float;
            
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
            
            // 4D to 3D projection
            vec3 project4Dto3D(vec4 p) {
                float w = 2.5 / (2.5 + p.w);
                return vec3(p.x * w, p.y * w, p.z * w);
            }
            
            // Enhanced VIB3 Geometry Library - Higher Fidelity
            float tetrahedronLattice(vec3 p, float gridSize) {
                vec3 q = fract(p * gridSize) - 0.5;
                
                // Enhanced tetrahedron vertices with holographic shimmer
                float d1 = length(q);
                float d2 = length(q - vec3(0.35, 0.0, 0.0));
                float d3 = length(q - vec3(0.0, 0.35, 0.0));
                float d4 = length(q - vec3(0.0, 0.0, 0.35));
                float d5 = length(q - vec3(0.2, 0.2, 0.0));
                float d6 = length(q - vec3(0.2, 0.0, 0.2));
                float d7 = length(q - vec3(0.0, 0.2, 0.2));
                
                float vertices = 1.0 - smoothstep(0.0, 0.03, min(min(min(d1, d2), min(d3, d4)), min(min(d5, d6), d7)));
                
                // Enhanced edge network with interference patterns
                float edges = 0.0;
                float shimmer = sin(u_time * 0.002) * 0.02;
                edges = max(edges, 1.0 - smoothstep(0.0, 0.015, abs(length(q.xy) - (0.18 + shimmer))));
                edges = max(edges, 1.0 - smoothstep(0.0, 0.015, abs(length(q.yz) - (0.18 + shimmer * 0.8))));
                edges = max(edges, 1.0 - smoothstep(0.0, 0.015, abs(length(q.xz) - (0.18 + shimmer * 1.2))));
                
                // Add interference patterns between vertices
                float interference = sin(d1 * 25.0 + u_time * 0.003) * sin(d2 * 22.0 + u_time * 0.0025) * 0.1;
                
                // Volumetric density based on distance field
                float volume = exp(-length(q) * 3.0) * 0.15;
                
                return max(vertices, edges * 0.7) + interference + volume;
            }
            
            float hypercubeLattice(vec3 p, float gridSize) {
                vec3 grid = fract(p * gridSize);
                vec3 q = grid - 0.5;
                
                // Enhanced hypercube with 4D projection effects
                vec3 edges = 1.0 - smoothstep(0.0, 0.025, abs(q));
                float wireframe = max(max(edges.x, edges.y), edges.z);
                
                // Add 4D hypercube vertices (8 corners + 8 hypervertices)
                float vertices = 0.0;
                for(int i = 0; i < 8; i++) {
                    // WebGL 1.0 compatible modulus replacement
                    float iFloat = float(i);
                    vec3 corner = vec3(
                        floor(iFloat - floor(iFloat / 2.0) * 2.0) - 0.5,
                        floor((iFloat / 2.0) - floor((iFloat / 2.0) / 2.0) * 2.0) - 0.5,
                        float(i / 4) - 0.5
                    );
                    float dist = length(q - corner * 0.4);
                    vertices = max(vertices, 1.0 - smoothstep(0.0, 0.04, dist));
                }
                
                // Holographic interference patterns
                float interference = sin(length(q) * 20.0 + u_time * 0.002) * 0.08;
                
                // Cross-dimensional glow
                float glow = exp(-length(q) * 2.5) * 0.12;
                
                return wireframe * 0.8 + vertices + interference + glow;
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
                // WebGL 1.0 compatible modulus replacement
                float baseGeomFloat = geometryType - floor(geometryType / 8.0) * 8.0;
                int baseGeom = int(baseGeomFloat);
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
                
                float mouseInfluence = u_mouseIntensity * 0.5;
                vec2 mouseOffset = (u_mouse - 0.5) * mouseInfluence;
                
                float parallaxOffset = u_scrollParallax * 0.2;
                vec2 scrollOffset = vec2(parallaxOffset * 0.1, parallaxOffset * 0.05);
                
                float morphOffset = u_touchMorph * 0.3;
                
                vec4 p4d = vec4(uv + mouseOffset * 0.1 + scrollOffset, 
                               sin(time * 0.1 + morphOffset) * 0.15, 
                               cos(time * 0.08 + morphOffset * 0.5) * 0.15);
                
                float scrollRotation = u_scrollParallax * 0.1;
                float touchRotation = u_touchMorph * 0.2;
                
                // Combine manual rotation with automatic/interactive rotation
                p4d = rotateXW(u_rot4dXW + time * 0.2 + mouseOffset.y * 0.5 + scrollRotation) * p4d;
                p4d = rotateYW(u_rot4dYW + time * 0.15 + mouseOffset.x * 0.5 + touchRotation) * p4d;
                p4d = rotateZW(u_rot4dZW + time * 0.25 + u_clickIntensity * 0.3 + u_touchChaos * 0.4) * p4d;
                
                vec3 p = project4Dto3D(p4d);
                
                float scrollDensityMod = 1.0 + u_gridDensityShift * 0.3;
                float audioDensityMod = 1.0 + u_audioDensityBoost * 0.5;
                float roleDensity = ((u_density + u_densityVariation) * u_roleDensity) * scrollDensityMod * audioDensityMod;
                
                float morphedGeometry = u_geometryType + u_morph * 3.0 + u_touchMorph * 2.0 + u_audioMorphBoost * 1.5;
                float lattice = getDynamicGeometry(p, roleDensity, morphedGeometry);
                
                // Enhanced holographic color processing
                vec3 baseColor = u_color;
                float latticeIntensity = lattice * u_intensity;
                
                // Multi-layer color composition for higher fidelity
                vec3 color = baseColor * (0.2 + latticeIntensity * 0.8);
                
                // Holographic shimmer layers
                vec3 shimmer1 = baseColor * lattice * 0.5;
                vec3 shimmer2 = baseColor * sin(lattice * 8.0 + u_time * 0.001) * 0.2;
                vec3 shimmer3 = baseColor * cos(lattice * 12.0 + u_time * 0.0008) * 0.15;
                
                color += shimmer1 + shimmer2 + shimmer3;
                
                // Enhanced brightness variations with interference
                color += vec3(lattice * 0.6) * baseColor;
                color += vec3(sin(lattice * 15.0) * 0.1) * baseColor;
                
                // Depth-based coloring for 3D effect
                float depth = 1.0 - length(p) * 0.3;
                color *= (0.7 + depth * 0.3);
                
                float enhancedChaos = u_chaos + u_chaosIntensity + u_touchChaos * 0.3 + u_audioChaosBoost * 0.4;
                color += vec3(moirePattern(uv + scrollOffset, enhancedChaos));
                color += vec3(gridOverlay(uv, u_mouseIntensity + u_scrollParallax * 0.1));
                color = rgbGlitch(color, uv, enhancedChaos);
                
                // Apply morph distortion to position
                vec2 morphDistortion = vec2(sin(uv.y * 10.0 + u_time * 0.001) * u_morph * 0.1, 
                                           cos(uv.x * 10.0 + u_time * 0.001) * u_morph * 0.1);
                color = mix(color, color * (1.0 + length(morphDistortion)), u_morph * 0.5);
                
                // Enhanced holographic interaction effects
                float mouseDist = length(uv - (u_mouse - 0.5) * vec2(aspectRatio, 1.0));
                
                // Multi-layer mouse glow with holographic ripples
                float mouseGlow = exp(-mouseDist * 1.2) * u_mouseIntensity * 0.25;
                float mouseRipple = sin(mouseDist * 15.0 - u_time * 0.003) * exp(-mouseDist * 2.0) * u_mouseIntensity * 0.1;
                color += vec3(mouseGlow + mouseRipple) * baseColor * 0.8;
                
                // Enhanced click pulse with interference
                float clickPulse = u_clickIntensity * exp(-mouseDist * 1.8) * 0.4;
                float clickRing = sin(mouseDist * 20.0 - u_clickIntensity * 5.0) * u_clickIntensity * 0.15;
                color += vec3(clickPulse + clickRing, (clickPulse + clickRing) * 0.6, (clickPulse + clickRing) * 1.2);
                
                // Holographic interference from interactions
                float interference = sin(mouseDist * 25.0 + u_time * 0.002) * u_mouseIntensity * 0.05;
                color += vec3(interference) * baseColor;
                
                gl_FragColor = vec4(color, 0.95);
            }`;

        // Generate complete HTML with EXACT 5-layer system like the engine
        const html = `<!DOCTYPE html>
<html>
<head>
    <title>VIB34D Multi-Layer Holographic Card - ${geometryName}</title>
    <style>
        body { 
            margin: 0; 
            padding: 20px; 
            background: #000; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            min-height: 100vh; 
            font-family: 'Orbitron', monospace;
        }
        .card-container {
            position: relative;
            width: 400px;
            height: 400px;
            border: 2px solid #f0f;
            border-radius: 8px;
            box-shadow: 0 0 20px rgba(255, 0, 255, 0.5);
        }
        .holographic-layers {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }
        canvas { 
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
        }
        .info {
            position: absolute;
            bottom: 20px;
            left: 20px;
            color: #f0f;
            font-size: 12px;
            z-index: 10;
        }
    </style>
</head>
<body>
    <div class="card-container">
        <div class="holographic-layers">
            <canvas id="background-canvas" width="800" height="800"></canvas>
            <canvas id="shadow-canvas" width="800" height="800"></canvas>
            <canvas id="content-canvas" width="800" height="800"></canvas>
            <canvas id="highlight-canvas" width="800" height="800"></canvas>
            <canvas id="accent-canvas" width="800" height="800"></canvas>
        </div>
        <div class="info">
            <div>Multi-Layer Holographic - ${geometryName.charAt(0).toUpperCase() + geometryName.slice(1)}</div>
            <div>5 Layers: Background → Shadow → Content → Highlight → Accent</div>
            <div>Density: ${params.gridDensity} | Morph: ${params.morphFactor}</div>
            <div>Hue: ${params.hue}° | Speed: ${params.speed}</div>
        </div>
    </div>
    
    <script>
        // EXACT 5-layer system matching HolographicVisualizer
        const layers = [
            { id: 'background-canvas', role: 'background', intensityMult: 0.2, densityMult: 0.4, speedMult: 0.2, colorShift: 0.0 },
            { id: 'shadow-canvas', role: 'shadow', intensityMult: 0.4, densityMult: 0.8, speedMult: 0.3, colorShift: 180.0 },
            { id: 'content-canvas', role: 'content', intensityMult: 0.8, densityMult: 1.0, speedMult: 1.0, colorShift: 0.0 },
            { id: 'highlight-canvas', role: 'highlight', intensityMult: 1.0, densityMult: 1.3, speedMult: 0.8, colorShift: 60.0 },
            { id: 'accent-canvas', role: 'accent', intensityMult: 1.2, densityMult: 2.0, speedMult: 0.4, colorShift: 300.0 }
        ];
        
        // Vertex shader (standard for all layers)
        const vertexShaderSource = \`attribute vec2 a_position;
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
            }\`;
        
        const fragmentShaderSource = \`${fragmentShader}\`;
        
        // WebGL setup functions
        function createShader(gl, type, source) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
                return null;
            }
            
            return shader;
        }
        
        function createProgram(gl, vertexSource, fragmentSource) {
            const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
            const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
            
            if (!vertexShader || !fragmentShader) {
                return null;
            }
            
            const program = gl.createProgram();
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);
            
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                console.error('Program linking failed:', gl.getProgramInfoLog(program));
                return null;
            }
            
            return program;
        }
        
        // HSV to RGB conversion
        function hsvToRgb(h, s, v) {
            h = h / 360.0;
            const c = v * s;
            const x = c * (1 - Math.abs((h * 6) % 2 - 1));
            const m = v - c;
            
            let r, g, b;
            if (h < 1/6) { r = c; g = x; b = 0; }
            else if (h < 2/6) { r = x; g = c; b = 0; }
            else if (h < 3/6) { r = 0; g = c; b = x; }
            else if (h < 4/6) { r = 0; g = x; b = c; }
            else if (h < 5/6) { r = x; g = 0; b = c; }
            else { r = c; g = 0; b = x; }
            
            return [(r + m), (g + m), (b + m)];
        }
        
        // Base parameters with EXACT engine scaling - MUST match HolographicVisualizer.js line 723-724
        const rawGridDensity = parseFloat(${params.gridDensity || 15});
        const mappedBaseDensity = 0.6 + (rawGridDensity - 5) / 95 * 6.9; // EXACT same formula as engine
        const baseHue = ${params.hue || 320};
        
        console.log('🔧 Trading card density mapping: gridDensity=' + rawGridDensity + ' → mappedBaseDensity=' + mappedBaseDensity.toFixed(3));
        
        // EXACT role density calculations from HolographicVisualizer.js generateRoleParams() method
        // These MUST match the engine's dynamic calculations exactly
        const roleDensityCalculations = {
            'background': 0.4,  // Static from engine
            'shadow': 0.8,      // Static from engine
            'content': mappedBaseDensity,  // Dynamic: vp.density from engine
            'highlight': 1.5 + (mappedBaseDensity * 0.3),  // Dynamic: 1.5 + (vp.density * 0.3) from engine
            'accent': 2.5 + (mappedBaseDensity * 0.5)       // Dynamic: 2.5 + (vp.density * 0.5) from engine
        };
        
        console.log('🔧 Role density calculations:', roleDensityCalculations);
        
        // Initialize all layers
        const visualizers = [];
        
        layers.forEach(layer => {
            const canvas = document.getElementById(layer.id);
            const gl = canvas.getContext('webgl');
            
            if (!gl) {
                console.error('WebGL not supported for', layer.id);
                return;
            }
            
            const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
            if (!program) return;
            
            // Set up buffers
            const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
            const buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
            
            const positionLocation = gl.getAttribLocation(program, 'a_position');
            gl.enableVertexAttribArray(positionLocation);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
            
            // Get uniform locations (ALL uniforms from HolographicVisualizer)
            const uniforms = {
                resolution: gl.getUniformLocation(program, 'u_resolution'),
                time: gl.getUniformLocation(program, 'u_time'),
                mouse: gl.getUniformLocation(program, 'u_mouse'),
                geometry: gl.getUniformLocation(program, 'u_geometry'),
                density: gl.getUniformLocation(program, 'u_density'),
                speed: gl.getUniformLocation(program, 'u_speed'),
                color: gl.getUniformLocation(program, 'u_color'),
                intensity: gl.getUniformLocation(program, 'u_intensity'),
                roleDensity: gl.getUniformLocation(program, 'u_roleDensity'),
                roleSpeed: gl.getUniformLocation(program, 'u_roleSpeed'),
                colorShift: gl.getUniformLocation(program, 'u_colorShift'),
                chaosIntensity: gl.getUniformLocation(program, 'u_chaosIntensity'),
                mouseIntensity: gl.getUniformLocation(program, 'u_mouseIntensity'),
                clickIntensity: gl.getUniformLocation(program, 'u_clickIntensity'),
                densityVariation: gl.getUniformLocation(program, 'u_densityVariation'),
                geometryType: gl.getUniformLocation(program, 'u_geometryType'),
                chaos: gl.getUniformLocation(program, 'u_chaos'),
                morph: gl.getUniformLocation(program, 'u_morph'),
                touchMorph: gl.getUniformLocation(program, 'u_touchMorph'),
                touchChaos: gl.getUniformLocation(program, 'u_touchChaos'),
                scrollParallax: gl.getUniformLocation(program, 'u_scrollParallax'),
                gridDensityShift: gl.getUniformLocation(program, 'u_gridDensityShift'),
                colorScrollShift: gl.getUniformLocation(program, 'u_colorScrollShift'),
                audioDensityBoost: gl.getUniformLocation(program, 'u_audioDensityBoost'),
                audioMorphBoost: gl.getUniformLocation(program, 'u_audioMorphBoost'),
                audioSpeedBoost: gl.getUniformLocation(program, 'u_audioSpeedBoost'),
                audioChaosBoost: gl.getUniformLocation(program, 'u_audioChaosBoost'),
                audioColorShift: gl.getUniformLocation(program, 'u_audioColorShift'),
                rot4dXW: gl.getUniformLocation(program, 'u_rot4dXW'),
                rot4dYW: gl.getUniformLocation(program, 'u_rot4dYW'),
                rot4dZW: gl.getUniformLocation(program, 'u_rot4dZW')
            };
            
            // Layer-specific color with hue shift
            const layerHue = baseHue + layer.colorShift;
            const [r, g, b] = hsvToRgb(layerHue, ${params.saturation || 0.8}, ${params.intensity || 0.6});
            
            visualizers.push({
                gl, program, uniforms, layer,
                color: [r, g, b]
            });
        });
        
        const startTime = Date.now();
        
        function render() {
            const time = Date.now() - startTime;
            
            visualizers.forEach(viz => {
                const { gl, program, uniforms, layer, color } = viz;
                
                gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
                gl.useProgram(program);
                
                // Set uniforms with EXACT layer-specific role parameters from engine
                const exactRoleDensity = roleDensityCalculations[layer.role] || mappedBaseDensity;
                
                gl.uniform2f(uniforms.resolution, gl.canvas.width, gl.canvas.height);
                gl.uniform1f(uniforms.time, time);
                gl.uniform2f(uniforms.mouse, 0.5, 0.5);
                gl.uniform1f(uniforms.geometry, ${params.geometry || 0});
                gl.uniform1f(uniforms.density, mappedBaseDensity);
                gl.uniform1f(uniforms.speed, ${params.speed || 1.0});
                gl.uniform3fv(uniforms.color, color);
                gl.uniform1f(uniforms.intensity, (${params.intensity || 0.6}) * layer.intensityMult);
                gl.uniform1f(uniforms.roleDensity, exactRoleDensity); // EXACT from engine
                gl.uniform1f(uniforms.roleSpeed, layer.speedMult);
                gl.uniform1f(uniforms.colorShift, layer.colorShift);
                gl.uniform1f(uniforms.chaosIntensity, ${params.chaos || 0.2});
                gl.uniform1f(uniforms.mouseIntensity, 0.0);
                gl.uniform1f(uniforms.clickIntensity, 0.0);
                gl.uniform1f(uniforms.densityVariation, 0.0);
                gl.uniform1f(uniforms.geometryType, ${params.geometry || 0});
                gl.uniform1f(uniforms.chaos, ${params.chaos || 0.2});
                gl.uniform1f(uniforms.morph, ${params.morphFactor || 1.0});
                gl.uniform1f(uniforms.touchMorph, 0.0);
                gl.uniform1f(uniforms.touchChaos, 0.0);
                gl.uniform1f(uniforms.scrollParallax, 0.0);
                gl.uniform1f(uniforms.gridDensityShift, 0.0);
                gl.uniform1f(uniforms.colorScrollShift, 0.0);
                gl.uniform1f(uniforms.audioDensityBoost, 0.0);
                gl.uniform1f(uniforms.audioMorphBoost, 0.0);
                gl.uniform1f(uniforms.audioSpeedBoost, 0.0);
                gl.uniform1f(uniforms.audioChaosBoost, 0.0);
                gl.uniform1f(uniforms.audioColorShift, 0.0);
                gl.uniform1f(uniforms.rot4dXW, ${params.rot4dXW || 0.0});
                gl.uniform1f(uniforms.rot4dYW, ${params.rot4dYW || 0.0});
                gl.uniform1f(uniforms.rot4dZW, ${params.rot4dZW || 0.0});
                
                // Enable blending for layer composition
                gl.enable(gl.BLEND);
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            });
            
            requestAnimationFrame(render);
        }
        
        console.log('🌌 Multi-layer holographic card initialized with', visualizers.length, 'layers');
        render();
    </script>
</body>
</html>`;

        return {
            filename: `vib34d-holographic-multilayer-${geometryName}-${timestamp}.html`,
            content: html,
            system: 'holographic-multilayer'
        };
    }
}