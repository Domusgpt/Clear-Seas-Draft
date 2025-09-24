/**
 * Exact Quantum Card Generator - MATCHES QuantumHolographicVisualizer EXACTLY
 * Uses the exact same shader code from src/quantum/QuantumVisualizer.js lines 65-340
 */

export class QuantumCardGeneratorExact {
    static generateCard(params, canvasId = 'trading-card-canvas') {
        const geometryNames = {
            0: 'tetrahedron', 1: 'hypercube', 2: 'sphere', 3: 'torus',
            4: 'klein', 5: 'fractal', 6: 'wave', 7: 'crystal'
        };
        
        const geometryName = geometryNames[params.geometry] || 'hypercube';
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        
        // Use EXACT shader from QuantumHolographicVisualizer (lines 65-340)
        const fragmentShader = `precision highp float;

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

// Complex 3D Lattice Functions - Superior Quantum Shaders
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

float sphereLattice(vec3 p, float gridSize) {
    vec3 cell = fract(p * gridSize) - 0.5;
    float sphere = 1.0 - smoothstep(0.15, 0.25, length(cell));
    
    float rings = 0.0;
    float ringRadius = length(cell.xy);
    rings = max(rings, 1.0 - smoothstep(0.0, 0.02, abs(ringRadius - 0.3)));
    rings = max(rings, 1.0 - smoothstep(0.0, 0.02, abs(ringRadius - 0.2)));
    
    return max(sphere, rings * 0.6);
}

float torusLattice(vec3 p, float gridSize) {
    vec3 cell = fract(p * gridSize) - 0.5;
    float majorRadius = 0.3;
    float minorRadius = 0.1;
    
    float toroidalDist = length(vec2(length(cell.xy) - majorRadius, cell.z));
    float torus = 1.0 - smoothstep(minorRadius - 0.02, minorRadius + 0.02, toroidalDist);
    
    float rings = 0.0;
    float angle = atan(cell.y, cell.x);
    rings = sin(angle * 8.0) * 0.02;
    
    return max(torus, 0.0) + rings;
}

float kleinLattice(vec3 p, float gridSize) {
    vec3 cell = fract(p * gridSize) - 0.5;
    float u = atan(cell.y, cell.x) / 3.14159 + 1.0;
    float v = cell.z + 0.5;
    
    float x = (2.0 + cos(u * 0.5)) * cos(u);
    float y = (2.0 + cos(u * 0.5)) * sin(u);
    float z = sin(u * 0.5) + v;
    
    vec3 kleinPoint = vec3(x, y, z) * 0.1;
    float dist = length(cell - kleinPoint);
    
    return 1.0 - smoothstep(0.1, 0.15, dist);
}

float fractalLattice(vec3 p, float gridSize) {
    vec3 cell = fract(p * gridSize);
    cell = abs(cell * 2.0 - 1.0);
    
    float dist = length(max(abs(cell) - 0.3, 0.0));
    
    // Recursive subdivision
    for(int i = 0; i < 3; i++) {
        cell = abs(cell * 2.0 - 1.0);
        float subdist = length(max(abs(cell) - 0.3, 0.0)) / pow(2.0, float(i + 1));
        dist = min(dist, subdist);
    }
    
    return 1.0 - smoothstep(0.0, 0.05, dist);
}

float waveLattice(vec3 p, float gridSize) {
    float time = u_time * 0.001 * u_speed;
    vec3 cell = fract(p * gridSize) - 0.5;
    
    float wave1 = sin(p.x * gridSize * 2.0 + time * 2.0);
    float wave2 = sin(p.y * gridSize * 1.8 + time * 1.5);
    float wave3 = sin(p.z * gridSize * 2.2 + time * 1.8);
    
    float interference = (wave1 + wave2 + wave3) / 3.0;
    float amplitude = 1.0 - length(cell) * 2.0;
    
    return max(0.0, interference * amplitude);
}

float crystalLattice(vec3 p, float gridSize) {
    vec3 cell = fract(p * gridSize) - 0.5;
    
    // Octahedral crystal structure
    float crystal = max(max(abs(cell.x) + abs(cell.y), abs(cell.y) + abs(cell.z)), abs(cell.x) + abs(cell.z));
    crystal = 1.0 - smoothstep(0.3, 0.4, crystal);
    
    // Add crystalline faces
    float faces = 0.0;
    faces = max(faces, 1.0 - smoothstep(0.0, 0.02, abs(abs(cell.x) - 0.35)));
    faces = max(faces, 1.0 - smoothstep(0.0, 0.02, abs(abs(cell.y) - 0.35)));
    faces = max(faces, 1.0 - smoothstep(0.0, 0.02, abs(abs(cell.z) - 0.35)));
    
    return max(crystal, faces * 0.5);
}

// Enhanced geometry function with holographic effects
float geometryFunction(vec4 p) {
    int geomType = int(u_geometry);
    vec3 p3d = project4Dto3D(p);
    float gridSize = u_gridDensity * 0.08;
    
    if (geomType == 0) {
        return tetrahedronLattice(p3d, gridSize) * u_morphFactor;
    }
    else if (geomType == 1) {
        return hypercubeLattice(p3d, gridSize) * u_morphFactor;
    }
    else if (geomType == 2) {
        return sphereLattice(p3d, gridSize) * u_morphFactor;
    }
    else if (geomType == 3) {
        return torusLattice(p3d, gridSize) * u_morphFactor;
    }
    else if (geomType == 4) {
        return kleinLattice(p3d, gridSize) * u_morphFactor;
    }
    else if (geomType == 5) {
        return fractalLattice(p3d, gridSize) * u_morphFactor;
    }
    else if (geomType == 6) {
        return waveLattice(p3d, gridSize) * u_morphFactor;
    }
    else if (geomType == 7) {
        return crystalLattice(p3d, gridSize) * u_morphFactor;
    }
    else {
        return hypercubeLattice(p3d, gridSize) * u_morphFactor;
    }
}

// HSV to RGB conversion for better color control
vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

// RGB Glitch effect for holographic shimmer
vec3 rgbGlitch(vec3 color, vec2 uv, float intensity) {
    vec2 offset = vec2(intensity * 0.005, 0.0);
    float r = color.r + sin(uv.y * 30.0 + u_time * 0.001) * intensity * 0.06;
    float g = color.g + sin(uv.y * 28.0 + u_time * 0.0012) * intensity * 0.06;
    float b = color.b + sin(uv.y * 32.0 + u_time * 0.0008) * intensity * 0.06;
    return vec3(r, g, b);
}

void main() {
    vec2 uv = (gl_FragCoord.xy - u_resolution.xy * 0.5) / min(u_resolution.x, u_resolution.y);
    
    // Enhanced 4D position with holographic depth
    float timeSpeed = u_time * 0.0001 * u_speed;
    vec4 pos = vec4(uv * 3.0, sin(timeSpeed * 3.0), cos(timeSpeed * 2.0));
    pos.xy += (u_mouse - 0.5) * u_mouseIntensity * 2.0;
    
    // Apply 4D rotations
    pos = rotateXW(u_rot4dXW) * pos;
    pos = rotateYW(u_rot4dYW) * pos;
    pos = rotateZW(u_rot4dZW) * pos;
    
    // Calculate enhanced geometry value
    float value = geometryFunction(pos);
    
    // Enhanced chaos with holographic effects
    float noise = sin(pos.x * 7.0) * cos(pos.y * 11.0) * sin(pos.z * 13.0);
    value += noise * u_chaos;
    
    // Enhanced intensity calculation with holographic glow
    float geometryIntensity = 1.0 - clamp(abs(value * 0.8), 0.0, 1.0);
    geometryIntensity = pow(geometryIntensity, 1.5); // More dramatic falloff
    geometryIntensity += u_clickIntensity * 0.3;
    
    // Holographic shimmer effect
    float shimmer = sin(uv.x * 20.0 + timeSpeed * 5.0) * cos(uv.y * 15.0 + timeSpeed * 3.0) * 0.1;
    geometryIntensity += shimmer * geometryIntensity;
    
    // Apply user intensity control
    float finalIntensity = geometryIntensity * u_intensity;
    
    // Enhanced HSV color system
    float baseHue = u_hue / 360.0;
    float hueShift = value * 0.2 + timeSpeed * 0.1; // Color shifts over time
    float finalHue = baseHue + hueShift;
    
    // Create rich holographic color
    vec3 hsvColor = vec3(finalHue, u_saturation, finalIntensity);
    vec3 baseColor = hsv2rgb(hsvColor);
    
    // Add holographic particles effect
    float particles = 0.0;
    vec2 particleUV = uv * 8.0;
    vec2 particleID = floor(particleUV);
    vec2 particlePos = fract(particleUV) - 0.5;
    float particleDist = length(particlePos);
    
    // Animated particles
    float particleTime = timeSpeed + dot(particleID, vec2(127.1, 311.7));
    float particleAlpha = sin(particleTime) * 0.5 + 0.5;
    particles = (1.0 - smoothstep(0.1, 0.3, particleDist)) * particleAlpha * 0.3;
    
    // Apply RGB glitch for holographic shimmer
    vec3 glitchedColor = rgbGlitch(baseColor, uv, finalIntensity * 0.5);
    
    // Combine base color with particles
    vec3 finalColor = glitchedColor + particles * vec3(1.0, 0.8, 1.0);
    
    // Enhanced role-based intensity
    float roleIntensity = u_roleIntensity;
    
    gl_FragColor = vec4(finalColor, finalIntensity * roleIntensity);
}`;

        // Generate complete HTML with exact parameter values
        const html = `<!DOCTYPE html>
<html>
<head>
    <title>VIB34D Quantum Trading Card - ${geometryName}</title>
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
        canvas { 
            width: 400px; 
            height: 400px; 
            border: 2px solid #a0f; 
            border-radius: 8px;
            box-shadow: 0 0 20px rgba(170, 0, 255, 0.5);
        }
        .info {
            position: absolute;
            bottom: 20px;
            left: 20px;
            color: #a0f;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <canvas id="${canvasId}" width="800" height="800"></canvas>
    <div class="info">
        <div>Quantum System - ${geometryName.charAt(0).toUpperCase() + geometryName.slice(1)}</div>
        <div>Density: ${params.gridDensity} | Morph: ${params.morphFactor}</div>
        <div>Hue: ${params.hue}° | Speed: ${params.speed}</div>
        <div>Enhanced 3D Lattice + Holographic Effects</div>
    </div>
    
    <script>
        // EXACT WebGL implementation matching QuantumHolographicVisualizer
        const canvas = document.getElementById('${canvasId}');
        const gl = canvas.getContext('webgl');
        
        if (!gl) {
            alert('WebGL not supported');
        }
        
        // Vertex shader (standard)
        const vertexShaderSource = \`attribute vec2 a_position;
void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
}\`;
        
        const fragmentShaderSource = \`${fragmentShader}\`;
        
        // Create shader program
        function createShader(type, source) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
                return null;
            }
            
            return shader;
        }
        
        function createProgram(vertexSource, fragmentSource) {
            const vertexShader = createShader(gl.VERTEX_SHADER, vertexSource);
            const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentSource);
            
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
        
        const program = createProgram(vertexShaderSource, fragmentShaderSource);
        
        // Set up buffers
        const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
        
        const positionLocation = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        
        // Get uniform locations
        const uniforms = {
            resolution: gl.getUniformLocation(program, 'u_resolution'),
            time: gl.getUniformLocation(program, 'u_time'),
            mouse: gl.getUniformLocation(program, 'u_mouse'),
            geometry: gl.getUniformLocation(program, 'u_geometry'),
            gridDensity: gl.getUniformLocation(program, 'u_gridDensity'),
            morphFactor: gl.getUniformLocation(program, 'u_morphFactor'),
            chaos: gl.getUniformLocation(program, 'u_chaos'),
            speed: gl.getUniformLocation(program, 'u_speed'),
            hue: gl.getUniformLocation(program, 'u_hue'),
            intensity: gl.getUniformLocation(program, 'u_intensity'),
            saturation: gl.getUniformLocation(program, 'u_saturation'),
            dimension: gl.getUniformLocation(program, 'u_dimension'),
            rot4dXW: gl.getUniformLocation(program, 'u_rot4dXW'),
            rot4dYW: gl.getUniformLocation(program, 'u_rot4dYW'),
            rot4dZW: gl.getUniformLocation(program, 'u_rot4dZW'),
            mouseIntensity: gl.getUniformLocation(program, 'u_mouseIntensity'),
            clickIntensity: gl.getUniformLocation(program, 'u_clickIntensity'),
            roleIntensity: gl.getUniformLocation(program, 'u_roleIntensity')
        };
        
        // EXACT parameters from function call
        const parameters = {
            geometry: ${params.geometry || 0},
            gridDensity: ${params.gridDensity || 20},
            morphFactor: ${params.morphFactor || 1.0},
            chaos: ${params.chaos || 0.2},
            speed: ${params.speed || 1.0},
            hue: ${params.hue || 280},
            intensity: ${params.intensity || 0.7},
            saturation: ${params.saturation || 0.9},
            dimension: ${params.dimension || 3.5},
            rot4dXW: ${params.rot4dXW || 0.0},
            rot4dYW: ${params.rot4dYW || 0.0},
            rot4dZW: ${params.rot4dZW || 0.0}
        };
        
        const startTime = Date.now();
        
        function render() {
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.useProgram(program);
            
            const time = Date.now() - startTime;
            
            // Set uniforms with EXACT values from QuantumHolographicVisualizer
            gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
            gl.uniform1f(uniforms.time, time);
            gl.uniform2f(uniforms.mouse, 0.5, 0.5);
            gl.uniform1f(uniforms.geometry, parameters.geometry);
            gl.uniform1f(uniforms.gridDensity, parameters.gridDensity);
            gl.uniform1f(uniforms.morphFactor, parameters.morphFactor);
            gl.uniform1f(uniforms.chaos, parameters.chaos);
            gl.uniform1f(uniforms.speed, parameters.speed);
            gl.uniform1f(uniforms.hue, parameters.hue);
            gl.uniform1f(uniforms.intensity, parameters.intensity);
            gl.uniform1f(uniforms.saturation, parameters.saturation);
            gl.uniform1f(uniforms.dimension, parameters.dimension);
            gl.uniform1f(uniforms.rot4dXW, parameters.rot4dXW);
            gl.uniform1f(uniforms.rot4dYW, parameters.rot4dYW);
            gl.uniform1f(uniforms.rot4dZW, parameters.rot4dZW);
            gl.uniform1f(uniforms.mouseIntensity, 0.0);
            gl.uniform1f(uniforms.clickIntensity, 0.0);
            gl.uniform1f(uniforms.roleIntensity, 1.0); // Content layer intensity
            
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            
            requestAnimationFrame(render);
        }
        
        render();
    </script>
</body>
</html>`;

        return {
            filename: `vib34d-quantum-exact-${geometryName}-${timestamp}.html`,
            content: html,
            system: 'quantum'
        };
    }
}