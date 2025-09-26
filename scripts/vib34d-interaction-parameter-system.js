/*
 * VIB34D Interaction Parameter System
 * Bridges card-level interactions with shader parameters so every layer reacts
 * cohesively to hover, scroll, and click energy. Built from the design notes
 * shared in the VIB34D parameter guide and tuned for the Clear Seas builds.
 */
(function() {
  const lerp = (from, to, factor) => from + (to - from) * factor;

  class VIB34DInteractionEngine {
    constructor(element, options = {}) {
      this.element = element;
      this.options = Object.assign({
        pointerSmoothing: 0.2,
        idleTimeout: 2800,
        pointerIntensityScale: 1.25,
        velocitySmoothing: 0.18
      }, options);

      this.state = {
        pointer: {
          isHovering: false,
          x: 0.5,
          y: 0.5,
          velocityX: 0,
          velocityY: 0,
          intensity: 0,
          lastTime: performance.now()
        },
        scroll: {
          intensity: 0,
          velocity: 0,
          direction: 0,
          lastY: window.scrollY || 0,
          lastTime: performance.now()
        },
        click: {
          intensity: 0,
          burst: 0,
          isDown: false,
          holdDuration: 0,
          lastClickTime: 0
        },
        idle: {
          decay: 1,
          lastActive: performance.now()
        }
      };

      this.destroyed = false;

      this.handlePointerMove = this.handlePointerMove.bind(this);
      this.handlePointerEnter = this.handlePointerEnter.bind(this);
      this.handlePointerLeave = this.handlePointerLeave.bind(this);
      this.handlePointerDown = this.handlePointerDown.bind(this);
      this.handlePointerUp = this.handlePointerUp.bind(this);
      this.handleScroll = this.handleScroll.bind(this);

      this.attachListeners();
    }

    attachListeners() {
      if (!this.element) return;

      this.element.addEventListener('pointermove', this.handlePointerMove, { passive: true });
      this.element.addEventListener('pointerenter', this.handlePointerEnter, { passive: true });
      this.element.addEventListener('pointerleave', this.handlePointerLeave, { passive: true });
      this.element.addEventListener('pointerdown', this.handlePointerDown);
      window.addEventListener('pointerup', this.handlePointerUp);
      window.addEventListener('scroll', this.handleScroll, { passive: true });

      // Fallback for environments without pointer events
      this.element.addEventListener('mousemove', (event) => {
        if (!event.pointerId) {
          this.handlePointerMove(event);
        }
      }, { passive: true });
    }

    markActive() {
      this.state.idle.lastActive = performance.now();
      this.state.idle.decay = 1;
    }

    ingestPointer(x, y, options = {}) {
      const now = performance.now();
      const pointerState = this.state.pointer;
      const dt = Math.max(0.001, (now - pointerState.lastTime) / 1000);

      const dx = x - pointerState.x;
      const dy = y - pointerState.y;

      const velX = dx / dt;
      const velY = dy / dt;
      const speed = Math.sqrt(velX * velX + velY * velY);

      pointerState.velocityX = lerp(pointerState.velocityX, velX, this.options.velocitySmoothing);
      pointerState.velocityY = lerp(pointerState.velocityY, velY, this.options.velocitySmoothing);
      pointerState.intensity = Math.min(1, (options.intensity ?? speed * 0.25) * this.options.pointerIntensityScale);
      pointerState.x = lerp(pointerState.x, x, this.options.pointerSmoothing);
      pointerState.y = lerp(pointerState.y, y, this.options.pointerSmoothing);
      pointerState.lastTime = now;

      if (options.isHovering !== undefined) {
        pointerState.isHovering = options.isHovering;
      }

      this.markActive();
    }

    ingestClick(options = {}) {
      const clickState = this.state.click;
      const now = performance.now();
      const intensity = options.intensity ?? 1;

      clickState.intensity = Math.min(1, clickState.intensity + intensity);
      clickState.burst = Math.min(1, clickState.burst + intensity * 0.65);
      clickState.lastClickTime = now;
      this.markActive();
    }

    setHoverState(isHovering) {
      this.state.pointer.isHovering = isHovering;
      if (!isHovering) {
        this.state.pointer.intensity *= 0.6;
      }
    }

    handlePointerMove(event) {
      if (!this.element) return;
      const rect = this.element.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
      this.ingestPointer(x, y);
    }

    handlePointerEnter() {
      this.setHoverState(true);
      this.markActive();
    }

    handlePointerLeave() {
      this.setHoverState(false);
      this.ingestPointer(0.5, 0.5, { intensity: 0, isHovering: false });
    }

    handlePointerDown() {
      this.state.click.isDown = true;
      this.state.click.holdStart = performance.now();
      this.ingestClick({ intensity: 0.35 });
    }

    handlePointerUp() {
      if (!this.state.click.isDown) return;
      const now = performance.now();
      const duration = now - (this.state.click.holdStart || now);
      const holdIntensity = Math.min(1, duration / 600);
      this.state.click.isDown = false;
      this.state.click.holdDuration = duration;
      this.ingestClick({ intensity: 0.45 + holdIntensity * 0.5 });
    }

    handleScroll() {
      const now = performance.now();
      const scrollState = this.state.scroll;
      const currentY = window.scrollY || window.pageYOffset || 0;
      const deltaY = currentY - scrollState.lastY;
      const dt = Math.max(0.001, (now - scrollState.lastTime) / 1000);

      const velocity = deltaY / dt;
      const intensity = Math.min(1, Math.abs(velocity) / 2000);

      scrollState.velocity = lerp(scrollState.velocity, velocity, 0.35);
      scrollState.intensity = lerp(scrollState.intensity, intensity, 0.45);
      scrollState.direction = Math.sign(scrollState.velocity);
      scrollState.lastY = currentY;
      scrollState.lastTime = now;

      this.markActive();
    }

    updateIdle() {
      const now = performance.now();
      const idleState = this.state.idle;
      const inactiveTime = now - idleState.lastActive;

      if (inactiveTime > this.options.idleTimeout) {
        const decayProgress = Math.min(1, (inactiveTime - this.options.idleTimeout) / (this.options.idleTimeout * 0.75));
        idleState.decay = 1 - decayProgress;
      } else {
        idleState.decay = 1;
      }

      // Cool down click bursts gradually
      const clickState = this.state.click;
      clickState.intensity *= 0.92;
      clickState.burst *= 0.86;

      // Ease scroll intensity down when idle
      const scrollState = this.state.scroll;
      scrollState.intensity *= 0.88;
      scrollState.velocity *= 0.88;
    }

    getInteractionState() {
      if (this.destroyed) {
        return this.state;
      }
      this.updateIdle();
      return this.state;
    }

    destroy() {
      if (this.destroyed) return;
      this.destroyed = true;
      if (!this.element) return;

      this.element.removeEventListener('pointermove', this.handlePointerMove);
      this.element.removeEventListener('pointerenter', this.handlePointerEnter);
      this.element.removeEventListener('pointerleave', this.handlePointerLeave);
      this.element.removeEventListener('pointerdown', this.handlePointerDown);
      window.removeEventListener('pointerup', this.handlePointerUp);
      window.removeEventListener('scroll', this.handleScroll);
    }
  }

  class ParameterMappingSystem {
    constructor(baseParameters, interactionEngine) {
      this.baseParameters = Object.assign({}, baseParameters);
      this.interactionEngine = interactionEngine;
      this.effectiveParameters = Object.assign({}, baseParameters);
    }

    setBaseParameter(key, value) {
      if (key in this.baseParameters) {
        this.baseParameters[key] = value;
      }
    }

    setBaseParameters(parameters) {
      Object.entries(parameters).forEach(([key, value]) => this.setBaseParameter(key, value));
    }

    clamp(value, min, max) {
      return Math.min(max, Math.max(min, value));
    }

    update() {
      const interaction = this.interactionEngine?.getInteractionState?.() || null;

      // Reset to base before applying mappings
      Object.keys(this.baseParameters).forEach((key) => {
        this.effectiveParameters[key] = this.baseParameters[key];
      });

      if (!interaction) {
        return this.effectiveParameters;
      }

      const pointer = interaction.pointer;
      const scroll = interaction.scroll;
      const click = interaction.click;
      const idle = interaction.idle;

      const pointerSpeed = Math.sqrt(pointer.velocityX * pointer.velocityX + pointer.velocityY * pointer.velocityY);
      const pointerCenteredX = pointer.x - 0.5;
      const pointerCenteredY = (0.5 - pointer.y);

      const hoverEnergy = pointer.intensity * (pointer.isHovering ? 1 : 0.5);
      const scrollEnergy = Math.abs(scroll.intensity);
      const clickEnergy = click.intensity;
      const idleFactor = idle.decay;

      // 1. Pointer velocity enriches density and speed
      const densityBoost = this.clamp(pointerSpeed / 12, 0, 6);
      this.effectiveParameters.density = this.clamp(
        this.baseParameters.density + densityBoost,
        2,
        18
      );
      this.effectiveParameters.speedMultiplier = this.clamp(
        this.baseParameters.speedMultiplier + hoverEnergy * 0.65 + scrollEnergy * 0.25,
        0.35,
        2.5
      );

      // 2. Pointer location remaps color space
      this.effectiveParameters.colorHue = (this.baseParameters.colorHue + pointerCenteredX * 160 + scroll.direction * 12 + clickEnergy * 40 + 360) % 360;
      this.effectiveParameters.colorSaturation = this.clamp(
        this.baseParameters.colorSaturation + pointerCenteredY * 0.25 + hoverEnergy * 0.1,
        0.35,
        0.98
      );
      this.effectiveParameters.colorBrightness = this.clamp(
        this.baseParameters.colorBrightness * (0.6 + 0.4 * idleFactor) + hoverEnergy * 0.15,
        0.4,
        1
      );

      // 3. Scroll momentum modulates geometry and parallax
      this.effectiveParameters.geometryMorph = this.clamp(
        this.baseParameters.geometryMorph + scroll.velocity * 0.0006,
        -Math.PI,
        Math.PI
      );
      this.effectiveParameters.parallaxOffset = this.clamp(pointerCenteredX * 0.35 + scroll.velocity * 0.00025, -0.75, 0.75);

      // 4. Pointer offset produces tilt for cards and canvases
      this.effectiveParameters.tiltX = this.clamp(pointerCenteredY * 18 + scroll.velocity * 0.0045, -28, 28);
      this.effectiveParameters.tiltY = this.clamp(pointerCenteredX * 22, -32, 32);
      this.effectiveParameters.tiltSkew = this.clamp(pointerCenteredX * pointerCenteredY * 90, -45, 45);

      // 5. Interaction energy shapes 4D rotation parameters
      const pointerRotation = hoverEnergy * 1.4 + pointerSpeed * 0.008;
      this.effectiveParameters.rot4dXW = this.baseParameters.rot4dXW + scroll.velocity * 0.0018;
      this.effectiveParameters.rot4dYW = this.baseParameters.rot4dYW + pointerCenteredX * 1.6;
      this.effectiveParameters.rot4dZW = this.baseParameters.rot4dZW + pointerRotation + clickEnergy * 1.2;

      // 6. Clicks trigger glitch pulses and bend depth
      this.effectiveParameters.glitchIntensity = this.clamp(
        this.baseParameters.glitchIntensity + clickEnergy * 0.85 + scrollEnergy * 0.25,
        0,
        1.5
      );
      this.effectiveParameters.canvasBendDepth = this.clamp(
        (hoverEnergy + click.burst * 0.5) * 220,
        0,
        360
      );
      this.effectiveParameters.bendIntensity = this.clamp(
        (hoverEnergy * 0.9) + (scrollEnergy * 0.35) + clickEnergy * 0.55,
        0,
        1.6
      );

      // 7. Idle state softens intensity
      this.effectiveParameters.intensity = this.clamp(
        this.baseParameters.intensity * idleFactor + hoverEnergy * 0.5,
        0.2,
        1.5
      );

      // 8. Aggregate energy for CSS exposure
      this.effectiveParameters.interactionEnergy = this.clamp(
        hoverEnergy * 0.55 + scrollEnergy * 0.35 + clickEnergy * 0.6,
        0,
        1.75
      );

      return this.effectiveParameters;
    }

    getEffectiveParameters() {
      return this.update();
    }
  }

  window.VIB34DInteractionEngine = VIB34DInteractionEngine;
  window.ParameterMappingSystem = ParameterMappingSystem;
})();
