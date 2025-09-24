/**
 * Exact Faceted Card Generator - MATCHES IntegratedHolographicVisualizer EXACTLY
 * Uses the exact same shader code from src/core/Visualizer.js lines 64-222
 */

export class FacetedCardGeneratorExact {
    static generateCard(params, canvasId = 'trading-card-canvas') {
        const geometryNames = {
            0: 'tetrahedron', 1: 'hypercube', 2: 'sphere', 3: 'torus',
            4: 'klein', 5: 'fractal', 6: 'wave', 7: 'crystal'
        };
        
        const geometryName = geometryNames[params.geometry] || 'hypercube';
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        
        // Use EXACT shader from IntegratedHolographicVisualizer (lines 64-222)
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

// Simplified geometry functions for WebGL 1.0 compatibility (ORIGINAL FACETED)
float geometryFunction(vec4 p) {
    int geomType = int(u_geometry);
    
    if (geomType == 0) {
        // Tetrahedron lattice - UNIFORM GRID DENSITY
        vec4 pos = fract(p * u_gridDensity * 0.08);
        vec4 dist = min(pos, 1.0 - pos);
        return min(min(dist.x, dist.y), min(dist.z, dist.w)) * u_morphFactor;
    }
    else if (geomType == 1) {
        // Hypercube lattice - UNIFORM GRID DENSITY
        vec4 pos = fract(p * u_gridDensity * 0.08);
        vec4 dist = min(pos, 1.0 - pos);
        float minDist = min(min(dist.x, dist.y), min(dist.z, dist.w));
        return minDist * u_morphFactor;
    }
    else if (geomType == 2) {
        // Sphere lattice - UNIFORM GRID DENSITY
        float r = length(p);
        float density = u_gridDensity * 0.08;
        float spheres = abs(fract(r * density) - 0.5) * 2.0;
        float theta = atan(p.y, p.x);
        float harmonics = sin(theta * 3.0) * 0.2;
        return (spheres + harmonics) * u_morphFactor;
    }
    else if (geomType == 3) {
        // Torus lattice - UNIFORM GRID DENSITY
        float r1 = length(p.xy) - 2.0;
        float torus = length(vec2(r1, p.z)) - 0.8;
        float lattice = sin(p.x * u_gridDensity * 0.08) * sin(p.y * u_gridDensity * 0.08);
        return (torus + lattice * 0.3) * u_morphFactor;
    }
    else if (geomType == 4) {
        // Klein bottle lattice - UNIFORM GRID DENSITY
        float u = atan(p.y, p.x);
        float v = atan(p.w, p.z);
        float dist = length(p) - 2.0;
        float lattice = sin(u * u_gridDensity * 0.08) * sin(v * u_gridDensity * 0.08);
        return (dist + lattice * 0.4) * u_morphFactor;
    }
    else if (geomType == 5) {
        // Fractal lattice - NOW WITH UNIFORM GRID DENSITY
        vec4 pos = fract(p * u_gridDensity * 0.08);
        pos = abs(pos * 2.0 - 1.0);
        float dist = length(max(abs(pos) - 1.0, 0.0));
        return dist * u_morphFactor;
    }
    else if (geomType == 6) {
        // Wave lattice - UNIFORM GRID DENSITY
        float freq = u_gridDensity * 0.08;
        float time = u_time * 0.001 * u_speed;
        float wave1 = sin(p.x * freq + time);
        float wave2 = sin(p.y * freq + time * 1.3);
        float wave3 = sin(p.z * freq * 0.8 + time * 0.7); // Add Z-dimension waves
        float interference = wave1 * wave2 * wave3;
        return interference * u_morphFactor;
    }
    else if (geomType == 7) {
        // Crystal lattice - UNIFORM GRID DENSITY
        vec4 pos = fract(p * u_gridDensity * 0.08) - 0.5;
        float cube = max(max(abs(pos.x), abs(pos.y)), max(abs(pos.z), abs(pos.w)));
        return cube * u_morphFactor;
    }
    else {
        // Default hypercube - UNIFORM GRID DENSITY
        vec4 pos = fract(p * u_gridDensity * 0.08);
        vec4 dist = min(pos, 1.0 - pos);
        return min(min(dist.x, dist.y), min(dist.z, dist.w)) * u_morphFactor;
    }
}

void main() {
    vec2 uv = (gl_FragCoord.xy - u_resolution.xy * 0.5) / min(u_resolution.x, u_resolution.y);
    
    // 4D position with mouse interaction - NOW USING SPEED PARAMETER
    float timeSpeed = u_time * 0.0001 * u_speed;
    vec4 pos = vec4(uv * 3.0, sin(timeSpeed * 3.0), cos(timeSpeed * 2.0));
    pos.xy += (u_mouse - 0.5) * u_mouseIntensity * 2.0;
    
    // Apply 4D rotations
    pos = rotateXW(u_rot4dXW) * pos;
    pos = rotateYW(u_rot4dYW) * pos;
    pos = rotateZW(u_rot4dZW) * pos;
    
    // Calculate geometry value
    float value = geometryFunction(pos);
    
    // Apply chaos
    float noise = sin(pos.x * 7.0) * cos(pos.y * 11.0) * sin(pos.z * 13.0);
    value += noise * u_chaos;
    
    // Color based on geometry value and hue with user-controlled intensity/saturation
    float geometryIntensity = 1.0 - clamp(abs(value), 0.0, 1.0);
    geometryIntensity += u_clickIntensity * 0.3;
    
    // Apply user intensity control
    float finalIntensity = geometryIntensity * u_intensity;
    
    float hue = u_hue / 360.0 + value * 0.1;
    
    // Create color with saturation control
    vec3 baseColor = vec3(
        sin(hue * 6.28318 + 0.0) * 0.5 + 0.5,
        sin(hue * 6.28318 + 2.0943) * 0.5 + 0.5,
        sin(hue * 6.28318 + 4.1887) * 0.5 + 0.5
    );
    
    // Apply saturation (mix with grayscale)
    float gray = (baseColor.r + baseColor.g + baseColor.b) / 3.0;
    vec3 color = mix(vec3(gray), baseColor, u_saturation) * finalIntensity;
    
    gl_FragColor = vec4(color, finalIntensity * u_roleIntensity);
}`;

        // Generate complete HTML with exact parameter values
        const html = `<!DOCTYPE html>
<html>
<head>
    <title>VIB34D Faceted Trading Card - ${geometryName}</title>
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
            border: 2px solid #0ff; 
            border-radius: 8px;
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
        }
        .info {
            position: absolute;
            bottom: 20px;
            left: 20px;
            color: #0ff;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <canvas id="${canvasId}" width="800" height="800"></canvas>
    <div class="info">
        <div>Faceted System - ${geometryName.charAt(0).toUpperCase() + geometryName.slice(1)}</div>
        <div>Density: ${params.gridDensity} | Morph: ${params.morphFactor}</div>
        <div>Hue: ${params.hue}° | Speed: ${params.speed}</div>
    </div>
    
    <script>
        // EXACT WebGL implementation matching IntegratedHolographicVisualizer
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
            gridDensity: ${params.gridDensity || 15},
            morphFactor: ${params.morphFactor || 1.0},
            chaos: ${params.chaos || 0.2},
            speed: ${params.speed || 1.0},
            hue: ${params.hue || 200},
            intensity: ${params.intensity || 0.5},
            saturation: ${params.saturation || 0.8},
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
            
            // Set uniforms with EXACT values from IntegratedHolographicVisualizer
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
            gl.uniform1f(uniforms.roleIntensity, 0.8); // Content layer intensity
            
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            
            requestAnimationFrame(render);
        }
        
        render();
    </script>
</body>
</html>`;

        return {
            filename: `vib34d-faceted-exact-${geometryName}-${timestamp}.html`,
            content: html,
            system: 'faceted'
        };
    }
}