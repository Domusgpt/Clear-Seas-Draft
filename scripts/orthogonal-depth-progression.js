/*
 * CLEAR SEAS ORTHOGONAL HOLOSTAGE DIRECTOR
 * Reimagined orthogonal progression orchestrator with section-aware visualizers,
 * hypercube folds, and device tilt choreography.
 * A Paul Phillips Manifestation - Paul@clearseassolutions.com
 */

(() => {
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const lerp = (a, b, t) => a + (b - a) * clamp(t, 0, 1);
  const smooth = (current, target, smoothing = 0.12) => current + (target - current) * smoothing;
  const easeInOut = (t) => {
    const c = clamp(t, 0, 1);
    return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
  };

  const mergeProfiles = (base = {}, override = {}) => {
    const result = { ...base };
    Object.keys(override).forEach((key) => {
      const value = override[key];
      if (Array.isArray(value)) {
        result[key] = value.slice();
      } else if (value && typeof value === 'object') {
        result[key] = mergeProfiles(base[key], value);
      } else if (value !== undefined) {
        result[key] = value;
      }
    });
    return result;
  };

  const SECTION_BLUEPRINTS = [
    {
      id: 'synthetic-dawn',
      label: 'Synthetic Dawn Chorus',
      subtitle: 'Quantum intake, holographic alignment, ambient aqua flux',
      palette: ['#00f6ff', '#6e37ff', '#0a1324'],
      visualizer: 'quantum',
      portalProfile: {
        baseHue: 198,
        hueSpread: 48,
        densityRange: [0.28, 1.1],
        speedRange: [0.35, 1.2],
        glitchRange: [0.02, 0.48],
        vividRange: [0.35, 1.0],
        warpRange: [0.0, 0.55],
        baseSaturation: 72,
        baseLightness: 58
      },
      background: {
        geometry: 'vector-grid',
        palette: ['#021625', '#06314b', '#00f6ff'],
        energy: [0.2, 1.05],
        glitch: [0.04, 0.42],
        warp: [0.1, 0.65],
        stars: true
      },
      cards: [
        {
          id: 'synthetic-intake',
          title: 'Holographic Intake Gateway',
          description: 'We synchronise the orthogonal data lattice with live telemetry, inviting crystalline insight into the opening portal.',
          accent: 'Phase pre-alignment & ambient aqua flux.',
          effects: ['Portal Bloom Calibration', 'Quantum Signal Imprint', 'VIB34D Intake Resonance'],
          visualizerProfile: {
            densityRange: [0.34, 1.18],
            glitchRange: [0.05, 0.55],
            warpRange: [0.1, 0.66],
            baseHue: 188
          }
        },
        {
          id: 'synthetic-scout',
          title: 'Vector Scout Telemetry',
          description: 'Cards hover in a crystalline crossfire, scanning for vibrational harmonics that keep our canvas alive.',
          accent: 'Triangulated scanning passes capture volumetric memory.',
          effects: ['Adaptive Depth Sensing', 'Chromatic Scout Threads', 'Refraction Memory Braid'],
          visualizerProfile: {
            densityRange: [0.28, 0.96],
            speedRange: [0.28, 1.05],
            glitchRange: [0.02, 0.38],
            baseHue: 210
          }
        },
        {
          id: 'synthetic-threshold',
          title: 'Threshold Aperture Bloom',
          description: 'The array opens. Each card releases luminous glyphs that fold toward our next geometric invocation.',
          accent: 'Threshold signatures shimmer with recollection.',
          effects: ['Hypercube Bloom Trigger', 'Liminal Echo Wash', 'Cardinal Memory Pulse'],
          visualizerProfile: {
            densityRange: [0.36, 1.24],
            speedRange: [0.45, 1.32],
            glitchRange: [0.12, 0.62],
            baseHue: 204
          }
        }
      ]
    },
    {
      id: 'luminous-resurgence',
      label: 'Luminous Resurgence Array',
      subtitle: 'Iridescent recovery rituals and luminous hydrostatic rebalancing',
      palette: ['#ff6bff', '#4b00c9', '#120021'],
      visualizer: 'holographic',
      portalProfile: {
        baseHue: 312,
        hueSpread: 64,
        densityRange: [0.32, 1.05],
        speedRange: [0.4, 1.4],
        glitchRange: [0.08, 0.7],
        vividRange: [0.45, 1.0],
        warpRange: [0.0, 0.7],
        baseSaturation: 78,
        baseLightness: 65
      },
      background: {
        geometry: 'orbital-ribbons',
        palette: ['#170021', '#3a005e', '#ff6bff'],
        energy: [0.25, 1.15],
        glitch: [0.1, 0.75],
        warp: [0.2, 0.82],
        stars: false
      },
      cards: [
        {
          id: 'resurgence-ripple',
          title: 'Radiant Ripple Reconstitution',
          description: 'Cards bloom with iridescent moiré as we restore the luminous body. Each pulse is a breath returning.',
          accent: 'Ripple harmonics thread through every glyph.',
          effects: ['Prismatic Flowfields', 'Aurora Recovery Lines', 'Reactive Pulse Chains'],
          visualizerProfile: {
            densityRange: [0.4, 1.2],
            speedRange: [0.52, 1.45],
            glitchRange: [0.18, 0.82],
            warpRange: [0.24, 0.9],
            baseHue: 332
          }
        },
        {
          id: 'resurgence-cascade',
          title: 'Cascade Memory Loom',
          description: 'We weave recovered fragments into a fresh volumetric tapestry. The cards echo each other, shimmering with recall.',
          accent: 'Cascade threads keep momentum between beats.',
          effects: ['Fractal Threading', 'Memory Loom Refractions', 'Pulse Drift Stabiliser'],
          visualizerProfile: {
            densityRange: [0.3, 1.0],
            speedRange: [0.35, 1.18],
            glitchRange: [0.12, 0.68],
            baseHue: 318
          }
        },
        {
          id: 'resurgence-transit',
          title: 'Transit into Prismatic Shelter',
          description: 'The deck arches forward, dissolving into rosy static that forms the door to the next chamber.',
          accent: 'Transit arcs fold inward like a hypercube bloom.',
          effects: ['Hypercube Transit Call', 'Glitch Bloom Finale', 'Section Signature Release'],
          visualizerProfile: {
            densityRange: [0.36, 1.25],
            speedRange: [0.5, 1.55],
            glitchRange: [0.22, 0.95],
            warpRange: [0.3, 0.95],
            baseHue: 342
          }
        }
      ]
    },
    {
      id: 'abyssal-codex',
      label: 'Abyssal Codex Transmission',
      subtitle: 'Deep sea latticework, codified signal bursts, crystalline recall',
      palette: ['#00ffe1', '#00a2ff', '#001922'],
      visualizer: 'faceted',
      portalProfile: {
        baseHue: 186,
        hueSpread: 42,
        densityRange: [0.26, 0.96],
        speedRange: [0.28, 1.08],
        glitchRange: [0.04, 0.52],
        vividRange: [0.3, 0.9],
        warpRange: [0.0, 0.45],
        baseSaturation: 68,
        baseLightness: 54
      },
      background: {
        geometry: 'tetra-wave',
        palette: ['#00141d', '#00304a', '#00ffe1'],
        energy: [0.18, 0.9],
        glitch: [0.05, 0.56],
        warp: [0.08, 0.58],
        stars: true
      },
      cards: [
        {
          id: 'abyssal-index',
          title: 'Bathyspheric Index Bloom',
          description: 'We launch a bathysphere of cards downward, indexing the abyss for luminous fragments that survived.',
          accent: 'Bathyspheric sweeps maintain structural truth.',
          effects: ['Tetrahedral Depth Sweep', 'Aqua Resonance Sparks', 'Bathysphere Signal Bloom'],
          visualizerProfile: {
            densityRange: [0.28, 1.02],
            speedRange: [0.3, 1.12],
            glitchRange: [0.08, 0.64],
            warpRange: [0.1, 0.58],
            baseHue: 188
          }
        },
        {
          id: 'abyssal-synthesis',
          title: 'Synthesis Node Invocation',
          description: 'Recovered shards reassemble into crystalline nodes. Each node pulses with an ancient oceanic cadence.',
          accent: 'Nodes listen, respond, and glow with hidden recall.',
          effects: ['Node Pulse Ingress', 'Tidal Vector Harmoniser', 'Crystalline Feedback Mesh'],
          visualizerProfile: {
            densityRange: [0.24, 0.92],
            speedRange: [0.28, 1.0],
            glitchRange: [0.06, 0.52],
            baseHue: 202
          }
        },
        {
          id: 'abyssal-exit',
          title: 'Return to Surface Signal',
          description: 'The final deck lifts forward, edges glowing azure while text fractures into moiré static and recedes.',
          accent: 'Surface beacons call the next experience into being.',
          effects: ['Surface Recall Pulse', 'Glitch Tide Dissolution', 'Etheric Reassembly Beacon'],
          visualizerProfile: {
            densityRange: [0.34, 1.18],
            speedRange: [0.4, 1.28],
            glitchRange: [0.18, 0.82],
            warpRange: [0.18, 0.68],
            baseHue: 196
          }
        }
      ]
    }
  ];

  const CARD_STATE_MAP = {
    birth: {
      css: {
        '--card-depth': '-1500px',
        '--card-scale': '0.28',
        '--card-opacity': '0',
        '--card-blur': '10px',
        '--card-glow': '0'
      },
      focus: 0,
      glitch: 0,
      speed: 0,
      vivid: 0,
      warp: 0,
      activation: 0
    },
    far: {
      css: {
        '--card-depth': '-980px',
        '--card-scale': '0.44',
        '--card-opacity': '0.14',
        '--card-blur': '6px',
        '--card-glow': '0.15'
      },
      focus: 0.1,
      glitch: 0.08,
      speed: 0.25,
      vivid: 0.25,
      warp: 0.08,
      activation: 0.2
    },
    reemerge: {
      css: {
        '--card-depth': '-540px',
        '--card-scale': '0.72',
        '--card-opacity': '0.52',
        '--card-blur': '2px',
        '--card-glow': '0.45'
      },
      focus: 0.45,
      glitch: 0.12,
      speed: 0.38,
      vivid: 0.55,
      warp: 0.22,
      activation: 0.55
    },
    approach: {
      css: {
        '--card-depth': '-320px',
        '--card-scale': '0.84',
        '--card-opacity': '0.72',
        '--card-blur': '1px',
        '--card-glow': '0.6'
      },
      focus: 0.62,
      glitch: 0.18,
      speed: 0.52,
      vivid: 0.68,
      warp: 0.32,
      activation: 0.72
    },
    focus: {
      css: {
        '--card-depth': '0px',
        '--card-scale': '1',
        '--card-opacity': '1',
        '--card-blur': '0px',
        '--card-glow': '1'
      },
      focus: 1,
      glitch: 0.22,
      speed: 0.78,
      vivid: 1,
      warp: 0.45,
      activation: 1
    },
    trailing: {
      css: {
        '--card-depth': '-420px',
        '--card-scale': '0.66',
        '--card-opacity': '0.4',
        '--card-blur': '2px',
        '--card-glow': '0.32'
      },
      focus: 0.35,
      glitch: 0.18,
      speed: 0.38,
      vivid: 0.46,
      warp: 0.18,
      activation: 0.42
    },
    archive: {
      css: {
        '--card-depth': '-820px',
        '--card-scale': '0.38',
        '--card-opacity': '0.12',
        '--card-blur': '5px',
        '--card-glow': '0.2'
      },
      focus: 0.12,
      glitch: 0.1,
      speed: 0.2,
      vivid: 0.24,
      warp: 0.1,
      activation: 0.18
    },
    exit: {
      css: {
        '--card-depth': '420px',
        '--card-scale': '1.24',
        '--card-opacity': '0.18',
        '--card-blur': '6px',
        '--card-glow': '0.72'
      },
      focus: 0.25,
      glitch: 0.68,
      speed: 0.82,
      vivid: 0.55,
      warp: 0.62,
      activation: 0.45
    },
    deconstruct: {
      css: {
        '--card-depth': '760px',
        '--card-scale': '1.62',
        '--card-opacity': '0',
        '--card-blur': '14px',
        '--card-glow': '0.8'
      },
      focus: 0,
      glitch: 0.9,
      speed: 0.92,
      vivid: 0.32,
      warp: 0.8,
      activation: 0.1
    }
  };
  class OrthogonalHolostage {
    constructor({ root, cardStage, backgroundCanvas, sections, hud }) {
      this.root = root;
      this.cardStage = cardStage;
      this.sections = sections;
      this.hud = hud;
      this.background = new HypercubeBackgroundOrchestra(backgroundCanvas);

      this.sectionIndex = 0;
      this.cardIndex = 0;
      this.cards = [];
      this.isTransitioning = false;
      this.scrollAccumulator = 0;
      this.touchStartY = 0;
      this.activeSection = null;

      this.pointer = { x: 0, y: 0, distance: 0 };
      this.tilt = { x: 0, y: 0, z: 0, magnitude: 0 };

      this.loadSection(0, { immediate: true });
      this.setupInput();
      this.setupTiltBridge();
      this.setupPointerInteractions();
      this.updateHud();
    }

    loadSection(index, options = {}) {
      const targetIndex = (index + this.sections.length) % this.sections.length;
      const definition = this.sections[targetIndex];
      this.sectionIndex = targetIndex;
      this.activeSection = definition;

      document.documentElement.style.setProperty('--section-primary', definition.palette[0]);
      document.documentElement.style.setProperty('--section-secondary', definition.palette[1]);
      document.documentElement.style.setProperty('--section-tertiary', definition.palette[2]);

      if (this.hud.section) {
        this.hud.section.textContent = definition.label;
      }
      if (this.hud.subtitle) {
        this.hud.subtitle.textContent = definition.subtitle || '';
      }

      this.background.setSection(definition);

      this.cardStage.innerHTML = '';
      this.cards = definition.cards.map((cardDef, idx) => this.buildCard(definition, cardDef, idx));

      this.cards.forEach((cardObj) => {
        this.cardStage.appendChild(cardObj.element);
      });

      this.cards.forEach((cardObj, idx) => {
        cardObj.portal.setSectionModifiers(definition.background);
        cardObj.portal.setTilt(this.tilt);
        this.setCardState(cardObj, 'birth', { immediate: true, silent: true });
        setTimeout(() => {
          const targetState = idx === 0 ? 'focus' : 'far';
          this.setCardState(cardObj, targetState, { silent: true });
        }, options.immediate ? 0 : idx * 120 + 80);
      });

      this.cardIndex = 0;
      this.isTransitioning = false;
      setTimeout(() => {
        this.updateHud();
        this.background.setStageProgress({
          focus: 1,
          glitch: 0.2,
          speed: 0.6,
          cardIndex: 0,
          cardCount: this.cards.length,
          state: 'focus'
        });
      }, 60);
    }

    buildCard(section, cardDef, index) {
      const card = document.createElement('article');
      card.className = 'progression-card';
      card.dataset.state = 'birth';
      card.dataset.section = section.id;
      card.dataset.visualizer = cardDef.visualizer || section.visualizer;
      card.setAttribute('data-vib34d', cardDef.visualizer || section.visualizer);
      card.style.setProperty('--card-tilt-x', '0');
      card.style.setProperty('--card-tilt-y', '0');
      card.style.setProperty('--card-tilt-z', '0');

      const surface = document.createElement('div');
      surface.className = 'card-surface';

      const header = document.createElement('header');
      header.className = 'card-header';
      header.innerHTML = `
        <span class="card-label">${section.label}</span>
        <h2 class="card-title">${cardDef.title}</h2>
        <p class="card-description">${cardDef.description}</p>
      `;

      const accent = document.createElement('p');
      accent.className = 'card-accent';
      accent.textContent = cardDef.accent || '';

      const effects = document.createElement('ul');
      effects.className = 'card-effects';
      (cardDef.effects || []).forEach((effect) => {
        const item = document.createElement('li');
        item.textContent = effect;
        effects.appendChild(item);
      });

      const portalContainer = document.createElement('div');
      portalContainer.className = 'portal-text-visualizer';
      const portalCanvas = document.createElement('canvas');
      portalCanvas.className = 'portal-canvas';
      portalContainer.appendChild(portalCanvas);

      surface.appendChild(header);
      surface.appendChild(accent);
      surface.appendChild(effects);
      surface.appendChild(portalContainer);
      card.appendChild(surface);

      const portalProfile = mergeProfiles(section.portalProfile, cardDef.visualizerProfile);
      const portal = new PortalTextVisualizer(portalCanvas, portalProfile);

      const cardObject = {
        element: card,
        portal,
        definition: cardDef,
        index,
        state: 'birth'
      };

      card.addEventListener('click', () => {
        if (this.cardIndex === cardObject.index) {
          this.nextCard();
        } else {
          this.goToCard(cardObject.index);
        }
      });

      card.addEventListener('pointerenter', () => {
        portal.injectImpulse(0.6, 'hover');
        if (cardObject.state !== 'focus') {
          this.setCardState(cardObject, 'reemerge', { silent: true });
        }
      });

      card.addEventListener('pointerleave', () => {
        if (cardObject.index < this.cardIndex) {
          this.setCardState(cardObject, 'archive', { silent: true });
        } else if (cardObject.index > this.cardIndex) {
          this.setCardState(cardObject, 'far', { silent: true });
        }
      });

      return cardObject;
    }
    setCardState(cardObj, state, options = {}) {
      if (!cardObj || !CARD_STATE_MAP[state]) return;
      if (!options.force && cardObj.state === state) return;

      const config = CARD_STATE_MAP[state];
      cardObj.state = state;
      cardObj.element.dataset.state = state;

      Object.entries(config.css).forEach(([key, value]) => {
        cardObj.element.style.setProperty(key, value);
      });

      const direction = options.direction || 0;
      const focus = config.focus ?? 0;
      const glitch = config.glitch ?? 0;
      const speed = config.speed ?? focus;
      const vivid = config.vivid ?? focus;
      const warp = config.warp ?? 0;
      const activation = config.activation ?? focus;

      if (cardObj.portal) {
        cardObj.portal.setChoreography({
          focus,
          glitch,
          speed,
          vivid,
          warp,
          activation,
          direction,
          cardIndex: cardObj.index,
          cardCount: this.cards.length
        });
      }

      if (!options.silent) {
        this.background.setStageProgress({
          focus,
          glitch,
          speed,
          vivid,
          warp,
          cardIndex: this.cardIndex,
          cardCount: this.cards.length,
          state,
          sectionId: this.activeSection?.id
        });
      }
    }

    nextCard() {
      if (this.isTransitioning) return;
      if (this.cardIndex >= this.cards.length - 1) {
        this.advanceSection(1);
        return;
      }

      this.transitionToCard(this.cardIndex + 1);
    }

    previousCard() {
      if (this.isTransitioning) return;
      if (this.cardIndex <= 0) {
        this.advanceSection(-1);
        return;
      }

      this.transitionToCard(this.cardIndex - 1);
    }

    goToCard(index) {
      if (index === this.cardIndex || index < 0 || index >= this.cards.length) return;
      this.transitionToCard(index);
    }

    transitionToCard(targetIndex) {
      if (this.isTransitioning) return;
      const direction = Math.sign(targetIndex - this.cardIndex);
      const currentCard = this.cards[this.cardIndex];
      const nextCard = this.cards[targetIndex];

      this.isTransitioning = true;

      if (direction > 0) {
        this.setCardState(currentCard, 'exit', { direction });
        this.setCardState(nextCard, 'approach', { direction, force: true });
      } else {
        this.setCardState(currentCard, 'reemerge', { direction });
        this.setCardState(nextCard, 'approach', { direction, force: true });
      }

      setTimeout(() => {
        this.cardIndex = targetIndex;
        this.cards.forEach((cardObj, idx) => {
          if (idx < this.cardIndex) {
            this.setCardState(cardObj, 'archive', { silent: true });
          } else if (idx > this.cardIndex) {
            this.setCardState(cardObj, 'far', { silent: true });
          }
        });
        this.setCardState(nextCard, 'focus', { direction, force: true });
        this.isTransitioning = false;
        this.updateHud();
      }, 520);
    }

    advanceSection(direction = 1) {
      if (this.isTransitioning) return;
      this.isTransitioning = true;

      this.root.classList.add('is-folding');
      this.background.triggerHypercubeFold();

      this.cards.forEach((cardObj, idx) => {
        setTimeout(() => {
          this.setCardState(cardObj, 'deconstruct', { silent: true, force: true });
        }, idx * 120);
      });

      setTimeout(() => {
        const nextSectionIndex = this.sectionIndex + direction;
        this.loadSection(nextSectionIndex);
        this.root.classList.remove('is-folding');
        this.updateHud();
      }, 1180);
    }

    updateHud() {
      if (this.hud.card) {
        const current = this.cards[this.cardIndex];
        this.hud.card.textContent = current ? current.definition.title : '';
      }
      if (this.hud.step) {
        this.hud.step.textContent = `${this.cardIndex + 1} / ${this.cards.length}`;
      }
    }
    setupInput() {
      const onWheel = (event) => {
        event.preventDefault();
        this.scrollAccumulator += event.deltaY;
        if (Math.abs(this.scrollAccumulator) > 80) {
          if (this.scrollAccumulator > 0) {
            this.nextCard();
          } else {
            this.previousCard();
          }
          this.scrollAccumulator = 0;
        }
      };

      window.addEventListener('wheel', onWheel, { passive: false });

      this.root.addEventListener('touchstart', (event) => {
        this.touchStartY = event.touches[0].clientY;
      }, { passive: true });

      this.root.addEventListener('touchmove', (event) => {
        event.preventDefault();
        const currentY = event.touches[0].clientY;
        const delta = this.touchStartY - currentY;
        if (Math.abs(delta) > 40) {
          if (delta > 0) {
            this.nextCard();
          } else {
            this.previousCard();
          }
          this.touchStartY = currentY;
        }
      }, { passive: false });

      document.addEventListener('keydown', (event) => {
        switch (event.code) {
          case 'ArrowDown':
          case 'Space':
          case 'PageDown':
            event.preventDefault();
            this.nextCard();
            break;
          case 'ArrowUp':
          case 'PageUp':
            event.preventDefault();
            this.previousCard();
            break;
          case 'Home':
            event.preventDefault();
            this.goToCard(0);
            break;
          case 'End':
            event.preventDefault();
            this.goToCard(this.cards.length - 1);
            break;
        }
      });

      const controls = this.root.querySelectorAll('[data-action]');
      controls.forEach((control) => {
        control.addEventListener('click', () => {
          const action = control.dataset.action;
          if (action === 'next') this.nextCard();
          if (action === 'previous') this.previousCard();
          if (action === 'fold') this.advanceSection(1);
        });
      });
    }

    setupPointerInteractions() {
      const updatePointer = (event) => {
        const rect = this.cardStage.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        const offsetX = clamp(x - 0.5, -0.5, 0.5) * 2;
        const offsetY = clamp(y - 0.5, -0.5, 0.5) * 2;
        const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);

        this.pointer = { x: offsetX, y: offsetY, distance };
        this.cardStage.style.setProperty('--pointer-x', offsetX.toFixed(4));
        this.cardStage.style.setProperty('--pointer-y', offsetY.toFixed(4));
        this.cardStage.style.setProperty('--pointer-distance', distance.toFixed(4));
        this.background.setPointer(this.pointer);

        const active = this.cards[this.cardIndex];
        if (active) {
          active.portal.injectImpulse(distance * 0.45, 'pointer');
        }
      };

      this.root.addEventListener('pointermove', updatePointer);
      this.root.addEventListener('pointerleave', () => {
        this.pointer = { x: 0, y: 0, distance: 0 };
        this.cardStage.style.setProperty('--pointer-x', '0');
        this.cardStage.style.setProperty('--pointer-y', '0');
        this.cardStage.style.setProperty('--pointer-distance', '0');
        this.background.setPointer(this.pointer);
      });
    }

    setupTiltBridge() {
      const eventName = window.__VIB34D_ROTATION_EVENT || 'vib34d:rotation';
      window.addEventListener(eventName, (event) => {
        const detail = event.detail || {};
        const normalized = detail.normalized || { x: 0, y: 0, z: 0 };
        const magnitude = detail.magnitude || 0;

        const tiltX = normalized.x * 38;
        const tiltY = normalized.y * 32;
        const tiltZ = normalized.z * 28;

        this.tilt = { x: tiltX, y: tiltY, z: tiltZ, magnitude };

        this.cardStage.style.setProperty('--tilt-x', tiltX.toFixed(4));
        this.cardStage.style.setProperty('--tilt-y', tiltY.toFixed(4));
        this.cardStage.style.setProperty('--tilt-z', tiltZ.toFixed(4));
        this.cardStage.style.setProperty('--tilt-magnitude', magnitude.toFixed(4));

        this.cards.forEach((cardObj) => {
          cardObj.element.style.setProperty('--card-tilt-x', tiltX.toFixed(4));
          cardObj.element.style.setProperty('--card-tilt-y', (-tiltY).toFixed(4));
          cardObj.element.style.setProperty('--card-tilt-z', tiltZ.toFixed(4));
          cardObj.portal.setTilt(this.tilt);
        });

        this.background.setTilt({
          normalized,
          magnitude,
          rotation4D: detail.rotation4D,
          tilt: detail.tilt
        });

        this.updateTiltReadout(detail);
      });
    }

    updateTiltReadout(detail) {
      const beta = detail?.tilt?.beta ?? 0;
      const gamma = detail?.tilt?.gamma ?? 0;
      const alpha = detail?.tilt?.alpha ?? 0;
      const magnitude = detail?.magnitude ?? 0;

      const tiltX = document.getElementById('tilt-x');
      const tiltY = document.getElementById('tilt-y');
      const tiltZ = document.getElementById('tilt-z');
      const tiltMag = document.getElementById('tilt-mag');

      if (tiltX) tiltX.textContent = beta.toFixed(1);
      if (tiltY) tiltY.textContent = gamma.toFixed(1);
      if (tiltZ) tiltZ.textContent = alpha.toFixed(1);
      if (tiltMag) tiltMag.textContent = magnitude.toFixed(2);
    }
  }
  class PortalTextVisualizer {
    constructor(canvas, profile = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.profile = Object.assign({
        baseHue: 210,
        hueSpread: 50,
        densityRange: [0.2, 1.0],
        speedRange: [0.2, 1.2],
        glitchRange: [0.0, 0.6],
        vividRange: [0.2, 0.9],
        warpRange: [0.0, 0.6],
        baseSaturation: 70,
        baseLightness: 60
      }, profile);

      this.sectionModifiers = null;
      this.tilt = { x: 0, y: 0, z: 0, magnitude: 0 };
      this.state = {
        activation: 0,
        targetActivation: 0,
        density: this.profile.densityRange[0],
        targetDensity: this.profile.densityRange[0],
        speed: this.profile.speedRange[0],
        targetSpeed: this.profile.speedRange[0],
        glitch: this.profile.glitchRange[0],
        targetGlitch: this.profile.glitchRange[0],
        vivid: this.profile.vividRange[0],
        targetVivid: this.profile.vividRange[0],
        warp: this.profile.warpRange[0],
        targetWarp: this.profile.warpRange[0],
        impulse: 0
      };

      this.time = 0;
      this.animationFrame = null;
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(this.canvas);
      this.resize();
    }

    resize() {
      const rect = this.canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    setSectionModifiers(modifiers) {
      this.sectionModifiers = modifiers;
    }

    setTilt(tilt) {
      this.tilt = { ...tilt };
    }

    setChoreography(payload) {
      const focus = clamp(payload.focus ?? 0, 0, 1);
      const glitch = clamp(payload.glitch ?? focus * 0.4, 0, 1);
      const speed = clamp(payload.speed ?? focus, 0, 1);
      const vivid = clamp(payload.vivid ?? focus, 0, 1);
      const warp = clamp(payload.warp ?? focus * 0.4, 0, 1);
      const activation = clamp(payload.activation ?? focus, 0, 1);

      this.state.targetDensity = lerp(this.profile.densityRange[0], this.profile.densityRange[1], focus);
      this.state.targetSpeed = lerp(this.profile.speedRange[0], this.profile.speedRange[1], speed);
      this.state.targetGlitch = lerp(this.profile.glitchRange[0], this.profile.glitchRange[1], glitch);
      this.state.targetVivid = lerp(this.profile.vividRange[0], this.profile.vividRange[1], vivid);
      this.state.targetWarp = lerp(this.profile.warpRange[0], this.profile.warpRange[1], warp);
      this.state.targetActivation = Math.max(this.state.targetActivation, activation);

      if (!this.animationFrame) {
        this.start();
      }
    }

    injectImpulse(amount, type = 'generic') {
      const scaled = clamp(amount, 0, 1);
      this.state.impulse = Math.max(this.state.impulse, scaled * (type === 'hover' ? 0.8 : 0.6));
      this.state.targetActivation = Math.max(this.state.targetActivation, scaled * 0.7);
      if (!this.animationFrame) {
        this.start();
      }
    }

    start() {
      const render = () => {
        this.update();
        this.render();
        if (this.shouldContinue()) {
          this.animationFrame = requestAnimationFrame(render);
        } else {
          this.animationFrame = null;
        }
      };
      this.animationFrame = requestAnimationFrame(render);
    }

    shouldContinue() {
      return (
        this.state.activation > 0.01 ||
        this.state.targetActivation > 0.01 ||
        this.state.glitch > 0.01 ||
        this.state.targetGlitch > 0.01 ||
        this.state.impulse > 0.01
      );
    }

    update() {
      this.state.activation = smooth(this.state.activation, this.state.targetActivation, 0.18);
      this.state.density = smooth(this.state.density, this.state.targetDensity, 0.14);
      this.state.speed = smooth(this.state.speed, this.state.targetSpeed, 0.14);
      this.state.glitch = smooth(this.state.glitch, this.state.targetGlitch, 0.18);
      this.state.vivid = smooth(this.state.vivid, this.state.targetVivid, 0.16);
      this.state.warp = smooth(this.state.warp, this.state.targetWarp, 0.16);
      this.state.impulse = smooth(this.state.impulse, 0, 0.08);
      this.state.targetActivation = smooth(this.state.targetActivation, this.state.activation, 0.1);
      this.time += 0.016 * (1 + this.state.speed * 1.4);
    }

    render() {
      const ctx = this.ctx;
      const width = this.canvas.width / (window.devicePixelRatio || 1);
      const height = this.canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, width, height);

      const intensity = Math.max(this.state.activation, this.state.impulse * 0.8);
      if (intensity < 0.02 && this.state.glitch < 0.04) {
        return;
      }

      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(centerX, centerY) * (0.45 + intensity * 0.35);

      const hueShift = (this.sectionModifiers?.hueShift || 0) + this.tilt.z * 0.4;
      const baseHue = (this.profile.baseHue + hueShift) % 360;
      const ringCount = Math.max(4, Math.floor(6 + this.state.density * 12));
      const noise = this.state.glitch + this.state.impulse * 0.5;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate((this.tilt.x - this.tilt.y) * 0.004);

      for (let i = 0; i < ringCount; i++) {
        const ringProgress = i / (ringCount - 1);
        const ringRadius = radius * (0.45 + ringProgress * 0.85 + Math.sin(this.time * 0.9 + ringProgress * 6) * this.state.warp * 0.6);
        const ringHue = (baseHue + ringProgress * this.profile.hueSpread + noise * 40) % 360;
        const alpha = clamp(intensity * (1 - ringProgress * 0.68) + this.state.impulse * 0.3, 0, 1);
        const lineWidth = 1.2 + ringProgress * 2.6 + this.state.glitch * 1.4;
        const segments = 72;

        ctx.beginPath();
        for (let j = 0; j <= segments; j++) {
          const t = j / segments;
          const angle = t * Math.PI * 2 + this.time * this.state.speed * (1 + ringProgress * 0.8);
          const wobble = Math.sin(angle * (3 + noise * 8) + ringProgress * 8) * noise * 18;
          const offsetX = Math.cos(angle) * ringRadius + Math.sin(angle * 2) * this.state.warp * 22 + wobble * 0.5;
          const offsetY = Math.sin(angle) * ringRadius + Math.cos(angle * 2) * this.state.warp * 18 + wobble * 0.35;
          if (j === 0) {
            ctx.moveTo(offsetX, offsetY);
          } else {
            ctx.lineTo(offsetX, offsetY);
          }
        }
        ctx.strokeStyle = `hsla(${ringHue}, ${this.profile.baseSaturation + this.state.vivid * 25}%, ${this.profile.baseLightness - ringProgress * 18}%, ${alpha})`;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
      }

      const pulseRadius = radius * (0.35 + intensity * 0.28 + this.state.impulse * 0.22);
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, pulseRadius);
      gradient.addColorStop(0, `hsla(${baseHue + 18}, 95%, ${60 + intensity * 20}%, ${0.4 + this.state.impulse * 0.4})`);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(-centerX, -centerY, width, height);

      if (this.state.glitch > 0.2) {
        const shards = Math.floor(6 + this.state.glitch * 18);
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < shards; i++) {
          const angle = (i / shards) * Math.PI * 2 + this.time * 1.2;
          const length = radius * (0.4 + Math.random() * 0.4);
          const hue = (baseHue + 120 + Math.random() * 80) % 360;
          const alpha = 0.08 + this.state.glitch * 0.18;
          ctx.strokeStyle = `hsla(${hue}, 90%, 70%, ${alpha})`;
          ctx.lineWidth = 0.6 + this.state.glitch * 1.8;
          ctx.beginPath();
          ctx.moveTo(Math.cos(angle) * length * 0.2, Math.sin(angle) * length * 0.2);
          ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
          ctx.stroke();
        }
        ctx.globalCompositeOperation = 'source-over';
      }

      ctx.restore();
    }

    destroy() {
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = null;
      }
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
      }
      this.ctx = null;
    }
  }
  class HypercubeBackgroundOrchestra {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.section = null;
      this.pointer = { x: 0, y: 0, distance: 0 };
      this.tilt = { normalized: { x: 0, y: 0, z: 0 }, magnitude: 0 };
      this.progress = {
        focus: 0,
        targetFocus: 0,
        glitch: 0,
        targetGlitch: 0,
        speed: 0.4,
        targetSpeed: 0.4,
        vivid: 0.4,
        targetVivid: 0.4,
        warp: 0.2,
        targetWarp: 0.2
      };
      this.foldPhase = 0;
      this.time = 0;

      this.resize();
      window.addEventListener('resize', () => this.resize());
      this.start();
    }

    resize() {
      const rect = this.canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    setSection(section) {
      this.section = section;
      this.progress.targetFocus = section.background?.energy?.[0] ?? 0.2;
      this.progress.focus = this.progress.targetFocus;
      this.progress.targetGlitch = section.background?.glitch?.[0] ?? 0.1;
      this.progress.glitch = this.progress.targetGlitch;
      this.progress.targetSpeed = section.background?.energy?.[0] ?? 0.3;
      this.progress.speed = this.progress.targetSpeed;
      this.progress.targetVivid = 0.4;
      this.progress.vivid = 0.4;
      this.progress.targetWarp = section.background?.warp?.[0] ?? 0.2;
      this.progress.warp = this.progress.targetWarp;
    }

    setStageProgress(progress) {
      if (progress.focus != null) {
        const [min, max] = this.section?.background?.energy || [0.2, 1.0];
        this.progress.targetFocus = lerp(min, max, clamp(progress.focus, 0, 1));
      }
      if (progress.glitch != null) {
        const [min, max] = this.section?.background?.glitch || [0.05, 0.6];
        this.progress.targetGlitch = lerp(min, max, clamp(progress.glitch, 0, 1));
      }
      if (progress.speed != null) {
        const [min, max] = this.section?.background?.energy || [0.2, 1.0];
        this.progress.targetSpeed = lerp(min, max, clamp(progress.speed, 0, 1));
      }
      if (progress.vivid != null) {
        this.progress.targetVivid = clamp(progress.vivid, 0, 1);
      }
      if (progress.warp != null) {
        const [min, max] = this.section?.background?.warp || [0.1, 0.7];
        this.progress.targetWarp = lerp(min, max, clamp(progress.warp, 0, 1));
      }
    }

    setPointer(pointer) {
      this.pointer = { ...pointer };
    }

    setTilt(tilt) {
      this.tilt = { ...tilt };
    }

    triggerHypercubeFold() {
      this.foldPhase = 1;
    }

    start() {
      const render = () => {
        this.update();
        this.render();
        requestAnimationFrame(render);
      };
      requestAnimationFrame(render);
    }

    update() {
      this.progress.focus = smooth(this.progress.focus, this.progress.targetFocus, 0.08);
      this.progress.glitch = smooth(this.progress.glitch, this.progress.targetGlitch, 0.1);
      this.progress.speed = smooth(this.progress.speed, this.progress.targetSpeed, 0.08);
      this.progress.vivid = smooth(this.progress.vivid, this.progress.targetVivid, 0.07);
      this.progress.warp = smooth(this.progress.warp, this.progress.targetWarp, 0.08);

      if (this.foldPhase > 0) {
        this.foldPhase = Math.max(0, this.foldPhase - 0.04);
      }

      this.time += 0.016 * (0.6 + this.progress.speed * 1.6);
    }

    render() {
      const ctx = this.ctx;
      const width = this.canvas.width / (window.devicePixelRatio || 1);
      const height = this.canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, width, height);

      if (!this.section) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);
        return;
      }

      const palette = this.section.background?.palette || ['#020b12', '#061d2c', '#0ff'];
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, palette[0]);
      gradient.addColorStop(0.5, palette[1]);
      gradient.addColorStop(1, palette[2]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const energy = this.progress.focus;
      const warp = this.progress.warp;
      const glitch = this.progress.glitch;
      const pointerInfluence = this.pointer.distance * 0.6;
      const tiltInfluence = (this.tilt.magnitude || 0) * 0.6;

      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate((this.pointer.x + this.pointer.y) * 0.08);

      const layers = 4 + Math.floor(energy * 6);
      for (let i = 0; i < layers; i++) {
        const layerProgress = i / (layers - 1 || 1);
        const radius = Math.max(width, height) * (0.15 + layerProgress * 0.45);
        const hueShift = (this.section.portalProfile?.baseHue || 200) + layerProgress * 30 + tiltInfluence * 120;
        const alpha = 0.08 + energy * 0.12 - layerProgress * 0.05 + pointerInfluence * 0.1;
        ctx.strokeStyle = `hsla(${hueShift % 360}, ${65 + energy * 20}%, ${20 + layerProgress * 25}%, ${clamp(alpha, 0, 0.35)})`;
        ctx.lineWidth = 1 + energy * 1.6 + layerProgress * 2.2;
        const segments = 64;

        ctx.beginPath();
        for (let j = 0; j <= segments; j++) {
          const t = j / segments;
          const angle = t * Math.PI * 2 + this.time * (0.4 + layerProgress * 0.6);
          const wobble = Math.sin(angle * (2 + warp * 6) + layerProgress * 8) * warp * 40 + Math.cos(angle * 3) * pointerInfluence * 40;
          const offsetX = Math.cos(angle) * radius + wobble;
          const offsetY = Math.sin(angle) * radius + wobble * 0.6 + (this.tilt.normalized?.y || 0) * 120 * layerProgress;
          if (j === 0) {
            ctx.moveTo(offsetX, offsetY);
          } else {
            ctx.lineTo(offsetX, offsetY);
          }
        }
        ctx.stroke();
      }

      ctx.restore();

      if (glitch > 0.2) {
        const shards = Math.floor(8 + glitch * 24);
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        for (let i = 0; i < shards; i++) {
          const x = Math.random() * width;
          const y = Math.random() * height;
          const w = 40 + Math.random() * 160 * glitch;
          const h = 4 + Math.random() * 24 * glitch;
          ctx.fillStyle = `hsla(${(this.section.portalProfile?.baseHue || 180) + Math.random() * 80}, 90%, 60%, ${0.08 + glitch * 0.12})`;
          ctx.fillRect(x, y, w, h);
        }
        ctx.restore();
      }

      if (this.foldPhase > 0) {
        ctx.save();
        ctx.translate(width / 2, height / 2);
        const fold = easeInOut(this.foldPhase);
        ctx.scale(1 - fold * 0.6, 1 - fold * 0.6);
        ctx.rotate(fold * Math.PI);
        ctx.globalAlpha = 0.35 + fold * 0.4;
        ctx.fillStyle = `hsla(${(this.section.portalProfile?.baseHue || 200) + 140}, 90%, 65%, 0.35)`;
        ctx.fillRect(-width, -height, width * 2, height * 2);
        ctx.restore();
      }
    }
  }
  document.addEventListener('DOMContentLoaded', () => {
    const root = document.querySelector('[data-holostage]');
    if (!root) return;

    const holostage = new OrthogonalHolostage({
      root,
      cardStage: root.querySelector('[data-card-stage]'),
      backgroundCanvas: root.querySelector('[data-background-canvas]'),
      sections: SECTION_BLUEPRINTS,
      hud: {
        section: root.querySelector('[data-holostage-section]'),
        subtitle: root.querySelector('[data-holostage-subtitle]'),
        card: root.querySelector('[data-holostage-card]'),
        step: root.querySelector('[data-holostage-step]')
      }
    });

    window.__CLEAR_SEAS_ORTHOGONAL_HOLOSTAGE = holostage;
    window.OrthogonalHolostage = OrthogonalHolostage;
    window.PortalTextVisualizer = PortalTextVisualizer;
    window.HypercubeBackgroundOrchestra = HypercubeBackgroundOrchestra;
  });
})();
