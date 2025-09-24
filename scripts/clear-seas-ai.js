/*
 * Clear Seas Solutions — Experiential Scroll Director
 * Coordinates bespoke scene activations, pointer choreography, and ambient pulses.
 */

(function () {
  const docEl = document.documentElement;
  const body = document.body;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const setPointer = (x, y) => {
    docEl.style.setProperty('--pointer-x', `${x}px`);
    docEl.style.setProperty('--pointer-y', `${y}px`);
  };

  if (!prefersReducedMotion) {
    setPointer(window.innerWidth / 2, window.innerHeight / 3);

    window.addEventListener(
      'pointermove',
      (event) => {
        setPointer(event.clientX, event.clientY);
      },
      { passive: true }
    );

    window.addEventListener(
      'resize',
      () => {
        setPointer(window.innerWidth / 2, window.innerHeight / 3);
      },
      { passive: true }
    );
  } else {
    setPointer(window.innerWidth / 2, window.innerHeight / 2);
  }

  const scenes = Array.from(document.querySelectorAll('[data-scene-title]'));
  const progressContainer = document.querySelector('[data-scene-progress]');
  const lensLabel = document.querySelector('[data-scroll-label]');
  const progressItems = [];

  if (progressContainer && scenes.length) {
    const fragment = document.createDocumentFragment();

    scenes.forEach((scene, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'scene-progress__item';
      button.innerHTML = `
        <span class="scene-progress__dot" aria-hidden="true"></span>
        <span class="scene-progress__label">${scene.dataset.sceneTitle}</span>
      `;
      button.addEventListener('click', () => {
        scene.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      button.setAttribute('aria-label', `Jump to ${scene.dataset.sceneTitle}`);
      fragment.appendChild(button);
      progressItems.push(button);
    });

    progressContainer.appendChild(fragment);
  }

  let activeSceneIndex = -1;
  const activateScene = (index) => {
    if (index === activeSceneIndex || index < 0 || index >= scenes.length) return;
    activeSceneIndex = index;

    const scene = scenes[index];
    if (!scene) return;

    const sceneKey = scene.dataset.scene;
    if (sceneKey) {
      body.dataset.scene = sceneKey;
    }

    if (lensLabel) {
      lensLabel.textContent = scene.dataset.sceneTitle || '';
    }

    progressItems.forEach((item, idx) => {
      item.classList.toggle('is-active', idx === index);
    });
  };

  if (scenes.length) {
    const sceneObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = scenes.indexOf(entry.target);
            if (index !== -1) {
              activateScene(index);
            }
          }
        });
      },
      { threshold: [0.35, 0.55], rootMargin: '0px 0px -20% 0px' }
    );

    scenes.forEach((scene) => sceneObserver.observe(scene));
    activateScene(0);
  }

  const animatedElements = Array.from(document.querySelectorAll('[data-animation]'));
  if (animatedElements.length) {
    if (!prefersReducedMotion) {
      const animationObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              animationObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.25, rootMargin: '0px 0px -12% 0px' }
      );

      animatedElements.forEach((element, index) => {
        if (!element.style.getPropertyValue('--delay')) {
          const delay = Math.min(index * 40, 400);
          element.style.setProperty('--delay', `${delay}ms`);
        }
        animationObserver.observe(element);
      });
    } else {
      animatedElements.forEach((element) => element.classList.add('is-visible'));
    }
  }

  if (!prefersReducedMotion) {
    const constellations = Array.from(document.querySelectorAll('[data-constellation]'));
    let activeConstellation = null;
    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    let animationFrameRequested = false;

    const updateConstellationTilt = () => {
      animationFrameRequested = false;
      if (!activeConstellation) return;

      const rect = activeConstellation.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const relativeX = ((pointerX - rect.left) / rect.width - 0.5) * 12;
      const relativeY = ((pointerY - rect.top) / rect.height - 0.5) * -12;

      if (Number.isFinite(relativeX)) {
        activeConstellation.style.setProperty('--tilt-x', relativeX.toFixed(2));
      }
      if (Number.isFinite(relativeY)) {
        activeConstellation.style.setProperty('--tilt-y', relativeY.toFixed(2));
      }
    };

    const requestConstellationUpdate = () => {
      if (!animationFrameRequested) {
        animationFrameRequested = true;
        window.requestAnimationFrame(updateConstellationTilt);
      }
    };

    constellations.forEach((constellation) => {
      constellation.addEventListener('pointerenter', () => {
        activeConstellation = constellation;
      });

      constellation.addEventListener('pointerleave', () => {
        if (activeConstellation === constellation) {
          constellation.style.setProperty('--tilt-x', '0');
          constellation.style.setProperty('--tilt-y', '0');
          activeConstellation = null;
        }
      });
    });

    if (constellations.length) {
      window.addEventListener(
        'pointermove',
        (event) => {
          pointerX = event.clientX;
          pointerY = event.clientY;
          requestConstellationUpdate();
        },
        { passive: true }
      );
    }
  }

  const pathElement = document.querySelector('[data-path]');
  if (pathElement) {
    const updatePathProgress = () => {
      const rect = pathElement.getBoundingClientRect();
      const viewportHeight = window.innerHeight || docEl.clientHeight;
      const visibleRatio = Math.min(Math.max(1 - rect.top / viewportHeight, 0), 1);
      const spread = rect.height / viewportHeight + 0.4;
      const progress = Math.min(Math.max(visibleRatio / spread, 0), 1);
      pathElement.style.setProperty('--path-progress', progress.toFixed(3));
    };

    updatePathProgress();
    window.addEventListener('scroll', updatePathProgress, { passive: true });
    window.addEventListener('resize', updatePathProgress);
  }

  if (!prefersReducedMotion) {
    const insightCards = Array.from(document.querySelectorAll('.insight-card'));
    if (insightCards.length) {
      let activeCard = 0;
      setInterval(() => {
        insightCards.forEach((card, index) => {
          card.classList.toggle('is-pulsing', index === activeCard);
        });
        activeCard = (activeCard + 1) % insightCards.length;
      }, 3600);
    }
  }

  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();
