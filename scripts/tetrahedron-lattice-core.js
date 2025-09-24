/*
 * TETRAHEDRON LATTICE CORE ENGINE
 * Advanced 4D tetrahedron lattice mathematics for card transformations
 * Inspired by visual codex hypercube-core-webgl-framework
 */

class TetrahedronLatticeCore {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.animationFrame = null;
    this.time = 0;
    
    // Tetrahedron geometry in 4D space
    this.tetrahedronVertices = this.generateTetrahedronVertices();
    this.latticeGrid = [];
    this.activeNodes = new Set();
    this.connectionStrength = 1.0;
    this.morphFactor = 0;
    
    this.init();
  }
  
  init() {
    this.createLatticeCanvas();
    this.generateLatticGrid();
    this.startLatticeAnimation();
    
    console.log('🔺 Tetrahedron Lattice Core - 4D mathematics activated');
  }
  
  createLatticeCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 100;
      opacity: 0.15;
      mix-blend-mode: multiply;
    `;
    
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.ctx = this.canvas.getContext('2d');
    
    document.body.appendChild(this.canvas);
    
    window.addEventListener('resize', () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.generateLatticGrid();
    });
  }
  
  generateTetrahedronVertices() {
    // Regular tetrahedron vertices in 4D hyperspace
    const sqrt2 = Math.sqrt(2);
    const sqrt6 = Math.sqrt(6);
    
    return [
      { x: 1, y: 1, z: 1, w: 1 },
      { x: 1, y: -1, z: -1, w: 1 },
      { x: -1, y: 1, z: -1, w: 1 },
      { x: -1, y: -1, z: 1, w: 1 }
    ];
  }
  
  generateLatticGrid() {
    this.latticeGrid = [];
    const { width, height } = this.canvas;
    const gridSpacing = 60;
    
    for (let x = 0; x < width; x += gridSpacing) {
      for (let y = 0; y < height; y += gridSpacing) {
        this.latticeGrid.push({
          x: x,
          y: y,
          baseX: x,
          baseY: y,
          phase: Math.random() * Math.PI * 2,
          amplitude: 20 + Math.random() * 30,
          frequency: 0.02 + Math.random() * 0.03,
          connections: [],
          energy: 0
        });
      }
    }
    
    // Generate connections between nearby nodes
    this.generateLatticeConnections();
  }
  
  generateLatticeConnections() {
    const maxDistance = 120;
    
    this.latticeGrid.forEach((node, index) => {
      node.connections = [];
      
      this.latticeGrid.forEach((otherNode, otherIndex) => {
        if (index !== otherIndex) {
          const distance = Math.sqrt(
            Math.pow(node.baseX - otherNode.baseX, 2) + 
            Math.pow(node.baseY - otherNode.baseY, 2)
          );
          
          if (distance < maxDistance) {
            node.connections.push({
              target: otherIndex,
              distance: distance,
              strength: 1 - (distance / maxDistance)
            });
          }
        }
      });
    });
  }
  
  startLatticeAnimation() {
    const animate = () => {
      this.time += 0.016;
      this.updateLatticeNodes();
      this.renderLattice();
      this.animationFrame = requestAnimationFrame(animate);
    };
    
    animate();
  }
  
  updateLatticeNodes() {
    // Apply tetrahedron transformation to lattice nodes
    this.latticeGrid.forEach((node, index) => {
      // 4D rotation influence
      const rotationInfluence = this.calculateTetrahedronInfluence(
        node.baseX, 
        node.baseY, 
        this.time
      );
      
      // Dynamic position based on tetrahedron mathematics
      node.x = node.baseX + Math.sin(this.time * node.frequency + node.phase) * node.amplitude * rotationInfluence.x;
      node.y = node.baseY + Math.cos(this.time * node.frequency + node.phase) * node.amplitude * rotationInfluence.y;
      
      // Energy propagation through connections
      node.energy = rotationInfluence.energy * this.connectionStrength;
      
      // Activate nodes based on energy threshold
      if (node.energy > 0.3) {
        this.activeNodes.add(index);
      } else {
        this.activeNodes.delete(index);
      }
    });
  }
  
  calculateTetrahedronInfluence(x, y, time) {
    // Project screen coordinates to 4D tetrahedron space
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    const normalizedX = (x - centerX) / centerX;
    const normalizedY = (y - centerY) / centerY;
    
    // 4D tetrahedron rotation matrices
    const rotW = time * 0.3;
    const rotX = time * 0.2;
    const rotY = time * 0.4;
    const rotZ = time * 0.1;
    
    // Apply tetrahedron vertex transformations
    let influence = { x: 0, y: 0, energy: 0 };
    
    this.tetrahedronVertices.forEach((vertex, index) => {
      // 4D to 3D projection
      const w_offset = 3;
      const scale3d = w_offset / (w_offset - vertex.w * Math.sin(rotW));
      
      const x3d = vertex.x * scale3d;
      const y3d = vertex.y * scale3d;
      const z3d = vertex.z * scale3d;
      
      // 3D rotations
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosZ = Math.cos(rotZ);
      const sinZ = Math.sin(rotZ);
      
      // Rotate around X axis
      const yRotX = y3d * cosX - z3d * sinX;
      const zRotX = y3d * sinX + z3d * cosX;
      
      // Rotate around Y axis
      const xRotY = x3d * cosY + zRotX * sinY;
      const zRotY = -x3d * sinY + zRotX * cosY;
      
      // Rotate around Z axis
      const xFinal = xRotY * cosZ - yRotX * sinZ;
      const yFinal = xRotY * sinZ + yRotX * cosZ;
      
      // Calculate influence on this lattice node
      const distance = Math.sqrt(
        Math.pow(normalizedX - xFinal * 0.3, 2) + 
        Math.pow(normalizedY - yFinal * 0.3, 2)
      );
      
      const vertexInfluence = Math.exp(-distance * 2);
      
      influence.x += xFinal * vertexInfluence;
      influence.y += yFinal * vertexInfluence;
      influence.energy += vertexInfluence;
    });
    
    // Normalize and apply morphing factor
    influence.x *= 0.25 * (1 + this.morphFactor);
    influence.y *= 0.25 * (1 + this.morphFactor);
    influence.energy *= 0.25;
    
    return influence;
  }
  
  renderLattice() {
    const { width, height } = this.canvas;
    
    // Clear with subtle fade
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    this.ctx.fillRect(0, 0, width, height);
    
    // Render connections between active nodes
    this.renderLatticeConnections();
    
    // Render active nodes
    this.renderLatticeNodes();
    
    // Render tetrahedron projections
    this.renderTetrahedronProjections();
  }
  
  renderLatticeConnections() {
    this.activeNodes.forEach(nodeIndex => {
      const node = this.latticeGrid[nodeIndex];
      if (!node) return;
      
      node.connections.forEach(connection => {
        if (this.activeNodes.has(connection.target)) {
          const targetNode = this.latticeGrid[connection.target];
          if (!targetNode) return;
          
          const connectionStrength = connection.strength * node.energy * targetNode.energy;
          
          if (connectionStrength > 0.1) {
            const alpha = connectionStrength * 0.6;
            const hue = (this.time * 30 + nodeIndex * 15) % 360;
            
            this.ctx.strokeStyle = `hsla(${hue}, 70%, 50%, ${alpha})`;
            this.ctx.lineWidth = connectionStrength * 2;
            this.ctx.globalAlpha = alpha;
            
            this.ctx.beginPath();
            this.ctx.moveTo(node.x, node.y);
            this.ctx.lineTo(targetNode.x, targetNode.y);
            this.ctx.stroke();
          }
        }
      });
    });
  }
  
  renderLatticeNodes() {
    this.activeNodes.forEach(nodeIndex => {
      const node = this.latticeGrid[nodeIndex];
      if (!node) return;
      
      const pulse = Math.sin(this.time * 3 + node.phase) * 0.5 + 0.5;
      const nodeSize = (2 + node.energy * 4) * (0.5 + pulse * 0.5);
      const alpha = node.energy * 0.8;
      
      if (alpha > 0.1) {
        const hue = (this.time * 40 + nodeIndex * 20) % 360;
        
        this.ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${alpha})`;
        this.ctx.globalAlpha = alpha;
        
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, nodeSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Inner glow
        const gradient = this.ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, nodeSize * 2
        );
        gradient.addColorStop(0, `hsla(${hue}, 90%, 80%, ${alpha * 0.8})`);
        gradient.addColorStop(1, `hsla(${hue}, 90%, 80%, 0)`);
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, nodeSize * 2, 0, Math.PI * 2);
        this.ctx.fill();
      }
    });
  }
  
  renderTetrahedronProjections() {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const scale = 150;
    
    // Project tetrahedron vertices to 2D
    const projectedVertices = this.tetrahedronVertices.map((vertex, index) => {
      const rotationInfluence = this.calculateTetrahedronInfluence(centerX, centerY, this.time);
      
      return {
        x: centerX + vertex.x * scale + rotationInfluence.x * 50,
        y: centerY + vertex.y * scale + rotationInfluence.y * 50,
        energy: rotationInfluence.energy
      };
    });
    
    // Draw tetrahedron edges
    const edges = [
      [0, 1], [0, 2], [0, 3],
      [1, 2], [1, 3], [2, 3]
    ];
    
    edges.forEach((edge, edgeIndex) => {
      const v1 = projectedVertices[edge[0]];
      const v2 = projectedVertices[edge[1]];
      
      if (!v1 || !v2) return;
      
      const edgeEnergy = (v1.energy + v2.energy) * 0.5;
      const alpha = edgeEnergy * 0.4;
      
      if (alpha > 0.05) {
        const hue = (this.time * 25 + edgeIndex * 60) % 360;
        
        this.ctx.strokeStyle = `hsla(${hue}, 75%, 55%, ${alpha})`;
        this.ctx.lineWidth = 1 + edgeEnergy * 3;
        this.ctx.globalAlpha = alpha;
        
        this.ctx.beginPath();
        this.ctx.moveTo(v1.x, v1.y);
        this.ctx.lineTo(v2.x, v2.y);
        this.ctx.stroke();
      }
    });
    
    // Draw vertices
    projectedVertices.forEach((vertex, index) => {
      if (vertex.energy > 0.1) {
        const vertexSize = 3 + vertex.energy * 5;
        const alpha = vertex.energy * 0.7;
        const hue = (this.time * 50 + index * 90) % 360;
        
        this.ctx.fillStyle = `hsla(${hue}, 85%, 65%, ${alpha})`;
        this.ctx.globalAlpha = alpha;
        
        this.ctx.beginPath();
        this.ctx.arc(vertex.x, vertex.y, vertexSize, 0, Math.PI * 2);
        this.ctx.fill();
      }
    });
  }
  
  setMorphFactor(factor) {
    this.morphFactor = Math.max(0, Math.min(2, factor));
  }
  
  setConnectionStrength(strength) {
    this.connectionStrength = Math.max(0, Math.min(2, strength));
  }
  
  activateCardInfluence(cardX, cardY, intensity) {
    // Activate lattice nodes near card transformations
    this.latticeGrid.forEach((node, index) => {
      const distance = Math.sqrt(
        Math.pow(node.baseX - cardX, 2) + 
        Math.pow(node.baseY - cardY, 2)
      );
      
      if (distance < 200) {
        const influence = Math.exp(-distance / 100) * intensity;
        node.energy = Math.max(node.energy, influence);
        
        if (influence > 0.3) {
          this.activeNodes.add(index);
        }
      }
    });
  }
  
  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

// Initialize tetrahedron lattice system
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    window.tetrahedronLattice = new TetrahedronLatticeCore();
    
    console.log('🔺 Tetrahedron Lattice Core system initialized');
  }, 300);
});