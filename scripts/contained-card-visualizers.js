/*
 * CONTAINED CARD VISUALIZERS
 * Smart visualizers that stay perfectly contained within card boundaries
 * Follow user interactions and adapt elegantly to card dimensions
 * Paul Phillips - Clear Seas Solutions LLC
 */

class ContainedCardVisualizer {
  constructor(card, type = 'polytopal') {
    this.card = card;
    this.type = type;
    this.canvas = null;
    this.context = null;
    this.isActive = false;
    this.animationFrame = null;

    // Smart responsive parameters
    this.params = {
      intensity: 0.7,
      followMouse: true,
      mouseX: 0.5,
      mouseY: 0.5,
      targetMouseX: 0.5,
      targetMouseY: 0.5,
      time: 0,
      contained: true,
      autoAdapt: true
    };

    this.init();
  }

  init() {
    this.createCanvas();
    this.setupInteractions();
    this.start();
  }

  createCanvas() {
    // Find or create canvas within card
    this.canvas = this.card.querySelector('.card-visualizer-canvas');

    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.className = 'card-visualizer-canvas';
      this.canvas.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        border-radius: inherit;
        opacity: 0.8;
        mix-blend-mode: screen;
        z-index: 1;
      `;

      // Insert as first child so it stays behind content
      this.card.style.position = 'relative';
      this.card.insertBefore(this.canvas, this.card.firstChild);
    }

    this.resizeCanvas();
    this.context = this.canvas.getContext('2d');
  }

  resizeCanvas() {
    const rect = this.card.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';

    if (this.context) {
      this.context.scale(dpr, dpr);
    }
  }

  setupInteractions() {
    // Mouse tracking within card boundaries
    this.card.addEventListener('mouseenter', () => {
      this.params.intensity = 1.0;
    });

    this.card.addEventListener('mouseleave', () => {
      this.params.intensity = 0.7;
      this.params.targetMouseX = 0.5;
      this.params.targetMouseY = 0.5;
    });

    this.card.addEventListener('mousemove', (e) => {
      const rect = this.card.getBoundingClientRect();
      this.params.targetMouseX = (e.clientX - rect.left) / rect.width;
      this.params.targetMouseY = (e.clientY - rect.top) / rect.height;
    });

    // Responsive resize
    const resizeObserver = new ResizeObserver(() => {
      this.resizeCanvas();
    });
    resizeObserver.observe(this.card);
  }

  start() {
    this.isActive = true;
    this.render();
  }

  stop() {
    this.isActive = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  render() {
    if (!this.isActive || !this.context) return;

    // Smooth mouse following
    this.params.mouseX += (this.params.targetMouseX - this.params.mouseX) * 0.1;
    this.params.mouseY += (this.params.targetMouseY - this.params.mouseY) * 0.1;
    this.params.time += 0.016;

    // Clear canvas
    this.context.clearRect(0, 0, this.canvas.width / (window.devicePixelRatio || 1), this.canvas.height / (window.devicePixelRatio || 1));

    // Render based on type
    switch (this.type) {
      case 'polytopal':
        this.renderPolytopal();
        break;
      case 'neural':
        this.renderNeural();
        break;
      case 'quantum':
        this.renderQuantum();
        break;
      default:
        this.renderPolytopal();
    }

    this.animationFrame = requestAnimationFrame(() => this.render());
  }

  renderPolytopal() {
    const ctx = this.context;
    const width = this.canvas.width / (window.devicePixelRatio || 1);
    const height = this.canvas.height / (window.devicePixelRatio || 1);

    // Create polytopal geometric patterns
    ctx.save();

    // Center on mouse position
    const centerX = width * this.params.mouseX;
    const centerY = height * this.params.mouseY;

    // Polytopal lattice
    ctx.strokeStyle = `hsla(180, 70%, 60%, ${this.params.intensity * 0.6})`;
    ctx.lineWidth = 1;

    const gridSize = 40;
    const time = this.params.time;

    for (let x = 0; x < width; x += gridSize) {
      for (let y = 0; y < height; y += gridSize) {
        const distance = Math.hypot(x - centerX, y - centerY);
        const wave = Math.sin(distance * 0.02 + time) * 0.5 + 0.5;
        const alpha = (1 - distance / Math.hypot(width, height)) * wave * this.params.intensity;

        if (alpha > 0.1) {
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(x, y, 2 + wave * 3, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }

    // Connection lines
    ctx.strokeStyle = `hsla(200, 80%, 70%, ${this.params.intensity * 0.3})`;
    ctx.lineWidth = 0.5;

    const connectDistance = 80;
    for (let x = 0; x < width; x += gridSize) {
      for (let y = 0; y < height; y += gridSize) {
        const distance = Math.hypot(x - centerX, y - centerY);
        if (distance < connectDistance) {
          const alpha = (1 - distance / connectDistance) * this.params.intensity * 0.5;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(centerX, centerY);
          ctx.stroke();
        }
      }
    }

    ctx.restore();
  }

  renderNeural() {
    const ctx = this.context;
    const width = this.canvas.width / (window.devicePixelRatio || 1);
    const height = this.canvas.height / (window.devicePixelRatio || 1);

    ctx.save();

    // Neural network style visualization
    const nodes = 12;
    const centerX = width * this.params.mouseX;
    const centerY = height * this.params.mouseY;

    ctx.fillStyle = `hsla(280, 80%, 60%, ${this.params.intensity * 0.8})`;

    for (let i = 0; i < nodes; i++) {
      const angle = (i / nodes) * Math.PI * 2 + this.params.time;
      const radius = 50 + Math.sin(this.params.time + i) * 20;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      if (x > 0 && x < width && y > 0 && y < height) {
        ctx.beginPath();
        ctx.arc(x, y, 3 + Math.sin(this.params.time + i) * 2, 0, Math.PI * 2);
        ctx.fill();

        // Connections
        ctx.strokeStyle = `hsla(280, 60%, 70%, ${this.params.intensity * 0.3})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  renderQuantum() {
    const ctx = this.context;
    const width = this.canvas.width / (window.devicePixelRatio || 1);
    const height = this.canvas.height / (window.devicePixelRatio || 1);

    ctx.save();

    // Quantum interference patterns
    const centerX = width * this.params.mouseX;
    const centerY = height * this.params.mouseY;

    // Multiple wave sources
    const sources = 3;
    for (let s = 0; s < sources; s++) {
      const sourceX = centerX + Math.cos(s * Math.PI * 2 / sources + this.params.time * 0.5) * 30;
      const sourceY = centerY + Math.sin(s * Math.PI * 2 / sources + this.params.time * 0.5) * 30;

      ctx.strokeStyle = `hsla(${60 + s * 60}, 70%, 60%, ${this.params.intensity * 0.4})`;
      ctx.lineWidth = 0.5;

      for (let r = 10; r < 100; r += 15) {
        const alpha = (1 - r / 100) * this.params.intensity * Math.sin(this.params.time * 2 + r * 0.1);
        if (alpha > 0) {
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(sourceX, sourceY, r, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }

    ctx.restore();
  }

  destroy() {
    this.stop();
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

// Smart Visualizer Manager - automatically applies to cards
class SmartVisualizerManager {
  constructor() {
    this.visualizers = new Map();
    this.observer = null;
    this.init();
  }

  init() {
    // Observe cards entering/leaving viewport
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.createVisualizerForCard(entry.target);
        } else {
          this.destroyVisualizerForCard(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    });

    this.scanForCards();
  }

  scanForCards() {
    // Look for cards that should have visualizers
    const cards = document.querySelectorAll('[data-visualizer], .unified-card, .polytopal-card');
    cards.forEach(card => {
      this.observer.observe(card);
    });
  }

  createVisualizerForCard(card) {
    if (this.visualizers.has(card)) return;

    // Determine visualizer type from card attributes
    const type = card.dataset.visualizer ||
                card.classList.contains('neural-card') ? 'neural' :
                card.classList.contains('quantum-card') ? 'quantum' :
                'polytopal';

    const visualizer = new ContainedCardVisualizer(card, type);
    this.visualizers.set(card, visualizer);
  }

  destroyVisualizerForCard(card) {
    const visualizer = this.visualizers.get(card);
    if (visualizer) {
      visualizer.destroy();
      this.visualizers.delete(card);
    }
  }

  destroy() {
    this.visualizers.forEach(visualizer => visualizer.destroy());
    this.visualizers.clear();
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.smartVisualizerManager = new SmartVisualizerManager();
  });
} else {
  window.smartVisualizerManager = new SmartVisualizerManager();
}

// Export for manual use
window.ContainedCardVisualizer = ContainedCardVisualizer;
window.SmartVisualizerManager = SmartVisualizerManager;