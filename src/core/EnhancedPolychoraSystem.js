// src/core/EnhancedPolychoraSystem.js
class EnhancedPolychoraSystem {
  constructor(gl, canvasManager) {
    this.gl = gl;
    this.canvasManager = canvasManager;
    this.rotation4D = this.createIdentityMatrix4D();
    this.projectionMethod = 'stereographic';
    this.polytopes = new Map();
    
    this.rotationAngles = {
      XY: 0, XZ: 0, YZ: 0,
      XW: 0, YW: 0, ZW: 0
    };
    
    this.rotationSpeeds = {
      XY: 0.001, XZ: 0.002, YZ: 0.001,
      XW: 0.003, YW: 0.002, ZW: 0.001
    };

    this.parameters = {
      geometry: 0, // tesseract, 16-cell, 24-cell, 120-cell, 600-cell, 5-cell
      glassRefraction: 1.5,
      holographicIntensity: 0.3,
      quantumParticleSize: 0.2,
      viewDistance4D: 3.0,
      complexity: 1.0
    };
    
    this.initializeShaders();
    this.initializePolytopes();
    this.createNoiseTexture();
  }

  createIdentityMatrix4D() {
    const matrix = new Float32Array(16);
    for (let i = 0; i < 16; i++) {
      matrix[i] = (i % 5 === 0) ? 1 : 0;
    }
    return matrix;
  }

  initializeShaders() {
    // Enhanced 4D vertex shader with all rotation planes
    this.vertexShader = `#version 300 es
      precision highp float;
      
      in vec4 a_position4D;
      in vec3 a_normal;
      in vec4 a_color;
      
      uniform mat4 u_rotationXY;
      uniform mat4 u_rotationXZ;
      uniform mat4 u_rotationYZ;
      uniform mat4 u_rotationXW;
      uniform mat4 u_rotationYW;
      uniform mat4 u_rotationZW;
      uniform mat4 u_modelView;
      uniform mat4 u_projection;
      uniform float u_viewDistance4D;
      uniform int u_projectionType;
      
      out vec3 v_position;
      out vec3 v_normal;
      out vec4 v_color;
      out float v_depth4D;
      
      vec3 stereographicProject(vec4 p) {
        return p.xyz / (1.0 + p.w);
      }
      
      vec3 perspectiveProject4D(vec4 p) {
        float w = p.w + u_viewDistance4D;
        return (w > 0.0) ? p.xyz / w : vec3(0.0);
      }
      
      vec3 orthographicProject(vec4 p) {
        return p.xyz;
      }
      
      void main() {
        // Apply all 4D rotations in sequence
        vec4 rotated = a_position4D;
        rotated = u_rotationXY * rotated;
        rotated = u_rotationXZ * rotated;
        rotated = u_rotationYZ * rotated;
        rotated = u_rotationXW * rotated;
        rotated = u_rotationYW * rotated;
        rotated = u_rotationZW * rotated;
        
        // Project from 4D to 3D based on projection type
        vec3 projected;
        if (u_projectionType == 0) {
          projected = stereographicProject(rotated);
        } else if (u_projectionType == 1) {
          projected = perspectiveProject4D(rotated);
        } else {
          projected = orthographicProject(rotated);
        }
        
        v_position = projected;
        v_normal = normalize(mat3(u_modelView) * a_normal);
        v_color = a_color;
        v_depth4D = rotated.w;
        
        gl_Position = u_projection * u_modelView * vec4(projected, 1.0);
        gl_PointSize = 3.0 + v_depth4D * 2.0;
      }
    `;

    // Fragment shader combining faceted, quantum, and holographic styles
    this.fragmentShader = `#version 300 es
      precision highp float;
      
      uniform vec3 u_lightPosition;
      uniform float u_time;
      uniform float u_glassRefraction;
      uniform float u_holographicIntensity;
      uniform float u_quantumParticleSize;
      uniform sampler2D u_noiseTexture;
      
      in vec3 v_position;
      in vec3 v_normal;
      in vec4 v_color;
      in float v_depth4D;
      
      out vec4 FragColor;
      
      vec3 glassmorphicEffect(vec3 baseColor) {
        // Fresnel effect based on viewing angle
        vec3 viewDir = normalize(-v_position);
        float fresnel = pow(1.0 - max(dot(viewDir, v_normal), 0.0), 2.0);
        
        // Glass tint with 4D depth modulation
        vec3 glassColor = mix(baseColor, vec3(0.8, 0.9, 1.0), fresnel * 0.5);
        glassColor *= 1.0 + v_depth4D * 0.1;
        
        return glassColor;
      }
      
      vec3 holographicEffect(vec3 baseColor) {
        // Rainbow interference pattern based on 4D coordinates
        float interference = sin(v_position.x * 10.0 + u_time) * 
                           cos(v_position.y * 10.0 - u_time) * 
                           sin(v_position.z * 10.0 + v_depth4D * 5.0);
        
        vec3 hologram = baseColor;
        hologram.r += sin(interference * 2.0 + u_time) * u_holographicIntensity;
        hologram.g += sin(interference * 3.0 + u_time * 1.1) * u_holographicIntensity;
        hologram.b += sin(interference * 4.0 + u_time * 0.9) * u_holographicIntensity;
        
        return hologram;
      }
      
      vec3 quantumEffect(vec3 baseColor) {
        // Particle noise based on 4D position and time
        vec2 noiseCoord = vec2(v_depth4D * 0.1, u_time * 0.1);
        float noise = texture(u_noiseTexture, noiseCoord).r;
        
        // Quantum fluctuation with 4D modulation
        vec3 quantum = baseColor * (1.0 + noise * u_quantumParticleSize);
        quantum *= 1.0 + sin(u_time * 5.0 + v_depth4D * 10.0) * 0.1;
        
        return quantum;
      }
      
      vec3 facetedLighting(vec3 baseColor) {
        // Standard Phong lighting
        vec3 lightDir = normalize(u_lightPosition - v_position);
        vec3 viewDir = normalize(-v_position);
        vec3 reflectDir = reflect(-lightDir, v_normal);
        
        float diffuse = max(dot(v_normal, lightDir), 0.0);
        float specular = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
        
        vec3 ambient = baseColor * 0.3;
        vec3 diffuseColor = baseColor * diffuse * 0.7;
        vec3 specularColor = vec3(1.0) * specular * 0.3;
        
        return ambient + diffuseColor + specularColor;
      }
      
      void main() {
        // Start with faceted lighting
        vec3 finalColor = facetedLighting(v_color.rgb);
        
        // Apply glassmorphic effect
        finalColor = glassmorphicEffect(finalColor);
        
        // Add holographic shimmer
        finalColor = holographicEffect(finalColor);
        
        // Add quantum fluctuations
        finalColor = quantumEffect(finalColor);
        
        // Alpha based on 4D depth and distance
        float alpha = v_color.a * (1.0 - abs(v_depth4D) * 0.2);
        alpha *= smoothstep(10.0, 5.0, length(v_position));
        
        FragColor = vec4(finalColor, alpha);
      }
    `;
    
    this.program = this.createShaderProgram(this.vertexShader, this.fragmentShader);
    this.setupUniforms();
  }

  createShaderProgram(vertexSource, fragmentSource) {
    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentSource);
    
    const program = this.gl.createProgram();
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);
    
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error('Program link error:', this.gl.getProgramInfoLog(program));
      return null;
    }
    
    // Clean up shaders
    this.gl.deleteShader(vertexShader);
    this.gl.deleteShader(fragmentShader);
    
    return program;
  }

  createShader(type, source) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', this.gl.getShaderInfoLog(shader));
      return null;
    }
    
    return shader;
  }

  setupUniforms() {
    this.uniforms = {
      rotationXY: this.gl.getUniformLocation(this.program, 'u_rotationXY'),
      rotationXZ: this.gl.getUniformLocation(this.program, 'u_rotationXZ'),
      rotationYZ: this.gl.getUniformLocation(this.program, 'u_rotationYZ'),
      rotationXW: this.gl.getUniformLocation(this.program, 'u_rotationXW'),
      rotationYW: this.gl.getUniformLocation(this.program, 'u_rotationYW'),
      rotationZW: this.gl.getUniformLocation(this.program, 'u_rotationZW'),
      modelView: this.gl.getUniformLocation(this.program, 'u_modelView'),
      projection: this.gl.getUniformLocation(this.program, 'u_projection'),
      lightPosition: this.gl.getUniformLocation(this.program, 'u_lightPosition'),
      time: this.gl.getUniformLocation(this.program, 'u_time'),
      glassRefraction: this.gl.getUniformLocation(this.program, 'u_glassRefraction'),
      holographicIntensity: this.gl.getUniformLocation(this.program, 'u_holographicIntensity'),
      quantumParticleSize: this.gl.getUniformLocation(this.program, 'u_quantumParticleSize'),
      viewDistance4D: this.gl.getUniformLocation(this.program, 'u_viewDistance4D'),
      projectionType: this.gl.getUniformLocation(this.program, 'u_projectionType'),
      noiseTexture: this.gl.getUniformLocation(this.program, 'u_noiseTexture')
    };
  }

  create4DRotationMatrix(plane, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const matrix = new Float32Array(16);
    
    // Initialize as identity matrix
    for (let i = 0; i < 16; i++) {
      matrix[i] = (i % 5 === 0 && i < 15) ? 1 : 0;
    }
    matrix[15] = 1; // w component
    
    switch (plane) {
      case 'XY':
        matrix[0] = c; matrix[1] = -s;
        matrix[4] = s; matrix[5] = c;
        break;
      case 'XZ':
        matrix[0] = c; matrix[2] = -s;
        matrix[8] = s; matrix[10] = c;
        break;
      case 'YZ':
        matrix[5] = c; matrix[6] = -s;
        matrix[9] = s; matrix[10] = c;
        break;
      case 'XW':
        matrix[0] = c; matrix[3] = -s;
        matrix[12] = s; matrix[15] = c;
        break;
      case 'YW':
        matrix[5] = c; matrix[7] = -s;
        matrix[13] = s; matrix[15] = c;
        break;
      case 'ZW':
        matrix[10] = c; matrix[11] = -s;
        matrix[14] = s; matrix[15] = c;
        break;
    }
    
    return matrix;
  }

  initializePolytopes() {
    this.polytopes.set('tesseract', this.createTesseract());
    this.polytopes.set('16-cell', this.create16Cell());
    this.polytopes.set('24-cell', this.create24Cell());
    this.polytopes.set('120-cell', this.create120Cell());
    this.polytopes.set('600-cell', this.create600Cell());
    this.polytopes.set('5-cell', this.create5Cell());
  }

  createTesseract() {
    const vertices = [];
    const colors = [];
    const indices = [];
    
    // Generate tesseract vertices (16 vertices)
    for (let i = 0; i < 16; i++) {
      vertices.push(
        (i & 1) ? 1 : -1,    // x
        (i & 2) ? 1 : -1,    // y
        (i & 4) ? 1 : -1,    // z
        (i & 8) ? 1 : -1     // w
      );
      
      // Color based on 4D position
      colors.push(
        (i & 1) ? 1 : 0.5,
        (i & 2) ? 1 : 0.5,
        (i & 4) ? 1 : 0.5,
        0.8
      );
    }
    
    // Generate edges (32 edges)
    for (let i = 0; i < 16; i++) {
      for (let j = i + 1; j < 16; j++) {
        const diff = i ^ j;
        // Connected if they differ in exactly one bit
        if ((diff & (diff - 1)) === 0) {
          indices.push(i, j);
        }
      }
    }
    
    return {
      vertices: new Float32Array(vertices),
      colors: new Float32Array(colors),
      indices: new Uint16Array(indices),
      vertexCount: vertices.length / 4
    };
  }

  create5Cell() {
    // Regular 5-cell (4D simplex) - 5 vertices
    const vertices = new Float32Array([
      1, 1, 1, 1,
      1, -1, -1, 1,
      -1, 1, -1, 1,
      -1, -1, 1, 1,
      0, 0, 0, -1
    ]);
    
    const colors = new Float32Array([
      1, 0, 0, 0.9,
      0, 1, 0, 0.9,
      0, 0, 1, 0.9,
      1, 1, 0, 0.9,
      1, 0, 1, 0.9
    ]);
    
    // Connect all pairs (complete graph)
    const indices = [];
    for (let i = 0; i < 5; i++) {
      for (let j = i + 1; j < 5; j++) {
        indices.push(i, j);
      }
    }
    
    return {
      vertices,
      colors,
      indices: new Uint16Array(indices),
      vertexCount: 5
    };
  }

  create16Cell() {
    // 16-cell (regular cross-polytope in 4D)
    const vertices = [];
    const colors = [];
    
    // 8 vertices: ±(1,0,0,0), ±(0,1,0,0), ±(0,0,1,0), ±(0,0,0,1)
    const coords = [[1,0,0,0], [0,1,0,0], [0,0,1,0], [0,0,0,1]];
    
    for (const coord of coords) {
      // Positive vertex
      vertices.push(...coord);
      colors.push(0.8, 0.4, 1.0, 0.9);
      
      // Negative vertex
      vertices.push(...coord.map(x => -x));
      colors.push(0.4, 0.8, 1.0, 0.9);
    }
    
    const indices = [];
    // Connect vertices that are perpendicular
    for (let i = 0; i < 8; i++) {
      for (let j = i + 1; j < 8; j++) {
        // Skip opposite vertices (they're antipodal)
        if (Math.floor(i/2) !== Math.floor(j/2)) {
          indices.push(i, j);
        }
      }
    }
    
    return {
      vertices: new Float32Array(vertices),
      colors: new Float32Array(colors),
      indices: new Uint16Array(indices),
      vertexCount: vertices.length / 4
    };
  }

  create24Cell() {
    // 24-cell vertices (simplified version)
    const vertices = [];
    const colors = [];
    
    // Generate permutations of (±1, ±1, 0, 0)
    const signs = [1, -1];
    const positions = [0, 1, 2, 3];
    
    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        for (const s1 of signs) {
          for (const s2 of signs) {
            const vertex = [0, 0, 0, 0];
            vertex[i] = s1;
            vertex[j] = s2;
            vertices.push(...vertex);
            
            colors.push(
              Math.abs(vertex[0]),
              Math.abs(vertex[1]) + Math.abs(vertex[2]),
              Math.abs(vertex[3]),
              0.8
            );
          }
        }
      }
    }
    
    // Simplified connectivity
    const indices = [];
    const vertexCount = vertices.length / 4;
    for (let i = 0; i < vertexCount; i++) {
      for (let j = i + 1; j < Math.min(i + 8, vertexCount); j++) {
        indices.push(i, j);
      }
    }
    
    return {
      vertices: new Float32Array(vertices),
      colors: new Float32Array(colors),
      indices: new Uint16Array(indices),
      vertexCount
    };
  }

  create120Cell() {
    // Simplified 120-cell (too complex for full implementation)
    // Using golden ratio-based vertices
    const phi = (1 + Math.sqrt(5)) / 2;
    const vertices = [];
    const colors = [];
    
    // Simplified set of vertices using golden ratio
    const baseVertices = [
      [1, 1, 1, 1],
      [1, 1, -1, -1],
      [1, -1, 1, -1],
      [-1, 1, 1, -1],
      [phi, 1/phi, 0, 0],
      [1/phi, 0, 0, phi],
      [0, phi, 1/phi, 0],
      [0, 0, phi, 1/phi]
    ];
    
    for (const vertex of baseVertices) {
      vertices.push(...vertex);
      colors.push(
        0.9, 0.7 + 0.3 * Math.sin(vertex[3]),
        0.5 + 0.5 * Math.cos(vertex[0] + vertex[1]),
        0.9
      );
    }
    
    const indices = [];
    for (let i = 0; i < 8; i++) {
      for (let j = i + 1; j < 8; j++) {
        indices.push(i, j);
      }
    }
    
    return {
      vertices: new Float32Array(vertices),
      colors: new Float32Array(colors),
      indices: new Uint16Array(indices),
      vertexCount: 8
    };
  }

  create600Cell() {
    // Simplified 600-cell
    const phi = (1 + Math.sqrt(5)) / 2;
    const vertices = [];
    const colors = [];
    
    // Use permutations of (±1, ±1, ±1, ±1) and golden ratio coordinates
    for (let i = 0; i < 16; i++) {
      vertices.push(
        (i & 1) ? 1 : -1,
        (i & 2) ? 1 : -1,
        (i & 4) ? 1 : -1,
        (i & 8) ? 1 : -1
      );
      
      colors.push(
        0.3 + 0.7 * ((i & 1) ? 1 : 0),
        0.3 + 0.7 * ((i & 2) ? 1 : 0),
        0.3 + 0.7 * ((i & 4) ? 1 : 0),
        0.9
      );
    }
    
    const indices = [];
    for (let i = 0; i < 16; i++) {
      for (let j = i + 1; j < 16; j++) {
        const diff = i ^ j;
        if ((diff & (diff - 1)) === 0) { // One bit difference
          indices.push(i, j);
        }
      }
    }
    
    return {
      vertices: new Float32Array(vertices),
      colors: new Float32Array(colors),
      indices: new Uint16Array(indices),
      vertexCount: 16
    };
  }

  createNoiseTexture() {
    const size = 256;
    const data = new Uint8Array(size * size * 4);
    
    for (let i = 0; i < size * size; i++) {
      const noise = Math.random();
      data[i * 4] = noise * 255;
      data[i * 4 + 1] = noise * 255;
      data[i * 4 + 2] = noise * 255;
      data[i * 4 + 3] = 255;
    }
    
    this.noiseTexture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.noiseTexture);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, size, size, 0, 
                       this.gl.RGBA, this.gl.UNSIGNED_BYTE, data);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
  }

  render(timestamp) {
    if (!this.program) return;
    
    this.gl.useProgram(this.program);
    
    // Update rotation angles
    this.updateRotationAngles(timestamp);
    
    // Update uniforms
    this.updateUniforms(timestamp);
    
    // Get current polytope
    const polytopeName = this.getPolytopeName();
    const polytope = this.polytopes.get(polytopeName);
    
    if (polytope) {
      this.renderPolytope(polytope);
    }
  }

  updateRotationAngles(timestamp) {
    const time = timestamp * 0.001; // Convert to seconds
    
    Object.keys(this.rotationAngles).forEach(plane => {
      this.rotationAngles[plane] += this.rotationSpeeds[plane];
    });
  }

  updateUniforms(timestamp) {
    const time = timestamp * 0.001;
    
    // Update rotation matrices
    Object.keys(this.rotationAngles).forEach(plane => {
      const angle = this.rotationAngles[plane];
      const matrix = this.create4DRotationMatrix(plane, angle);
      const uniform = this.uniforms['rotation' + plane];
      if (uniform) {
        this.gl.uniformMatrix4fv(uniform, false, matrix);
      }
    });
    
    // Update other uniforms
    this.gl.uniform1f(this.uniforms.time, time);
    this.gl.uniform1f(this.uniforms.glassRefraction, this.parameters.glassRefraction);
    this.gl.uniform1f(this.uniforms.holographicIntensity, this.parameters.holographicIntensity);
    this.gl.uniform1f(this.uniforms.quantumParticleSize, this.parameters.quantumParticleSize);
    this.gl.uniform1f(this.uniforms.viewDistance4D, this.parameters.viewDistance4D);
    this.gl.uniform1i(this.uniforms.projectionType, this.projectionMethod === 'stereographic' ? 0 : 1);
    
    // Bind noise texture
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.noiseTexture);
    this.gl.uniform1i(this.uniforms.noiseTexture, 0);
  }

  renderPolytope(polytope) {
    // Create and bind vertex buffer
    if (!polytope.vertexBuffer) {
      polytope.vertexBuffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, polytope.vertexBuffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, polytope.vertices, this.gl.STATIC_DRAW);
    }
    
    // Create and bind color buffer
    if (!polytope.colorBuffer) {
      polytope.colorBuffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, polytope.colorBuffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, polytope.colors, this.gl.STATIC_DRAW);
    }
    
    // Create and bind index buffer
    if (!polytope.indexBuffer) {
      polytope.indexBuffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, polytope.indexBuffer);
      this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, polytope.indices, this.gl.STATIC_DRAW);
    }
    
    // Setup vertex attributes
    const positionLocation = this.gl.getAttribLocation(this.program, 'a_position4D');
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, polytope.vertexBuffer);
    this.gl.enableVertexAttribArray(positionLocation);
    this.gl.vertexAttribPointer(positionLocation, 4, this.gl.FLOAT, false, 0, 0);
    
    const colorLocation = this.gl.getAttribLocation(this.program, 'a_color');
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, polytope.colorBuffer);
    this.gl.enableVertexAttribArray(colorLocation);
    this.gl.vertexAttribPointer(colorLocation, 4, this.gl.FLOAT, false, 0, 0);
    
    // Draw edges
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, polytope.indexBuffer);
    this.gl.drawElements(this.gl.LINES, polytope.indices.length, this.gl.UNSIGNED_SHORT, 0);
    
    // Draw vertices as points
    this.gl.drawArrays(this.gl.POINTS, 0, polytope.vertexCount);
  }

  getPolytopeName() {
    const names = ['tesseract', '16-cell', '24-cell', '120-cell', '600-cell', '5-cell'];
    return names[this.parameters.geometry % names.length];
  }

  updateParameter(name, value) {
    if (name in this.parameters) {
      this.parameters[name] = value;
    }
    
    // Update rotation speeds based on parameters
    if (name === 'speed') {
      const speedMultiplier = value;
      Object.keys(this.rotationSpeeds).forEach(plane => {
        this.rotationSpeeds[plane] = this.rotationSpeeds[plane] * speedMultiplier;
      });
    }
  }

  dispose() {
    // Clean up WebGL resources
    if (this.program) {
      this.gl.deleteProgram(this.program);
    }
    
    if (this.noiseTexture) {
      this.gl.deleteTexture(this.noiseTexture);
    }
    
    // Clean up polytope buffers
    this.polytopes.forEach(polytope => {
      if (polytope.vertexBuffer) this.gl.deleteBuffer(polytope.vertexBuffer);
      if (polytope.colorBuffer) this.gl.deleteBuffer(polytope.colorBuffer);
      if (polytope.indexBuffer) this.gl.deleteBuffer(polytope.indexBuffer);
    });
  }
}

export default EnhancedPolychoraSystem;