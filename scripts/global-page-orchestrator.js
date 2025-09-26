const brandAssets = window.__CLEAR_SEAS_BRAND_ASSETS || (window.__CLEAR_SEAS_BRAND_ASSETS = {
  images: [
    'assets/Screenshot_20250430-141821.png',
    'assets/Screenshot_20241012-073718.png',
    'assets/Screenshot_20250430-142024~2.png',
    'assets/Screenshot_20250430-142002~2.png',
    'assets/Screenshot_20250430-142032~2.png',
    'assets/file_00000000fc08623085668cf8b5e0a1e5.png',
    'assets/file_0000000054a06230817873012865d150.png',
    'assets/file_0000000006fc6230a8336bfa1fcebd89.png',
    'assets/image_8 (1).png'
  ],
  videos: [
    '20250505_1321_Neon Blossom Transformation_simple_compose_01jtgqf5vjevn8nbrnsx8yd5fs.mp4',
    '20250505_1726_Noir Filament Mystery_simple_compose_01jth5f1kwe9r9zxqet54bz3q0.mp4',
    '20250506_0014_Gemstone Coral Transformation_remix_01jthwv071e06vmjd0mn60zm3s.mp4',
    '20250506_0014_Gemstone Coral Transformation_remix_01jthwv0c4fxk8m0e79ry2t4ke.mp4',
    '1746496560073.mp4',
    '1746500614769.mp4',
    '1746576068221.mp4'
  ]
});

const stylesLoaded = new Set();
const scriptsLoaded = new Map();
const cardStates = new Map();
const groupStates = new Map();
let activeCardState = null;
let rafId = null;

const globalState = {
  scroll: { current: 0, target: 0, lastY: window.scrollY || 0, lastTime: performance.now() },
  synergy: { current: 0, target: 0 }
};

function ensureStylesheet(href, key) {
  if (stylesLoaded.has(key)) {
    return;
  }
  if (document.querySelector(`link[data-global-style="${key}"]`)) {
    stylesLoaded.add(key);
    return;
  }
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.dataset.globalStyle = key;
  document.head.appendChild(link);
  stylesLoaded.add(key);
}

function ensureScript(src) {
  if (scriptsLoaded.has(src)) {
    return scriptsLoaded.get(src);
  }
  const existing = Array.from(document.scripts).find(script => script.src && script.src.includes(src));
  if (existing) {
    if (existing.dataset.loaded === 'true') {
      const resolved = Promise.resolve();
      scriptsLoaded.set(src, resolved);
      return resolved;
    }
    const promise = new Promise((resolve) => {
      existing.addEventListener('load', () => {
        existing.dataset.loaded = 'true';
        resolve();
      }, { once: true });
      existing.addEventListener('error', () => resolve(), { once: true });
    });
    scriptsLoaded.set(src, promise);
    return promise;
  }
  const promise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.dataset.globalInjected = 'true';
    script.addEventListener('load', () => {
      script.dataset.loaded = 'true';
      resolve();
    });
    script.addEventListener('error', (error) => {
      console.warn(`⚠️ Failed to load script: ${src}`, error);
      resolve();
    });
    document.head.appendChild(script);
  });
  scriptsLoaded.set(src, promise);
  return promise;
}

async function ensureCardSystem() {
  await ensureScript('scripts/card-specific-vib34d-visualizer.js');
  await ensureScript('scripts/card-system-initializer.js');
  if (typeof window.bootCardSystem === 'function') {
    try {
      await window.bootCardSystem();
    } catch (error) {
      console.warn('⚠️ Card system boot failed but continuing with synergy orchestrator.', error);
    }
  }
}

function normalise(value, min, max) {
  if (max - min === 0) {
    return 0;
  }
  return Math.min(1, Math.max(0, (value - min) / (max - min)));
}

function shouldRegister(element) {
  if (!(element instanceof HTMLElement)) {
    return false;
  }
  if (element.dataset.globalCardSynergy === 'applied') {
    return false;
  }
  if (element.closest('[data-global-card-synergy="applied"]') && element.closest('[data-global-card-synergy="applied"]') !== element) {
    return false;
  }
  if (element.dataset.globalCardIgnore === 'true') {
    return false;
  }
  const rect = element.getBoundingClientRect();
  if (rect.width < 120 || rect.height < 120) {
    return false;
  }
  const style = getComputedStyle(element);
  if (style.display === 'inline' || style.visibility === 'hidden' || style.opacity === '0') {
    return false;
  }
  return true;
}

function pickBrandImage(index) {
  if (!brandAssets.images.length) {
    return null;
  }
  return brandAssets.images[index % brandAssets.images.length];
}

function pickBrandVideo(index) {
  if (!brandAssets.videos.length) {
    return null;
  }
  return brandAssets.videos[index % brandAssets.videos.length];
}

function ensureBrandLayer(state) {
  const card = state.element;
  let overlay = card.querySelector(':scope > .global-brand-overlay, :scope > .card-brand-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'global-brand-overlay';
    card.appendChild(overlay);
  } else {
    overlay.classList.add('global-brand-overlay');
  }
  const existingVideo = overlay.querySelector('video');
  if (existingVideo) {
    existingVideo.muted = true;
    existingVideo.loop = true;
    existingVideo.autoplay = true;
    existingVideo.playsInline = true;
    state.brandVideo = existingVideo;
  }

  const preferVideo = card.dataset.brandVideo === 'true' || card.classList.contains('brand-video-card') || state.index % 3 === 0;
  const videoSource = preferVideo ? pickBrandVideo(state.index) : null;

  overlay.dataset.brandIndex = state.index;

  if (videoSource) {
    overlay.style.backgroundImage = 'none';
    if (!overlay.querySelector('video')) {
      overlay.innerHTML = '';
      const video = document.createElement('video');
      video.src = videoSource;
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.dataset.globalBrandVideo = 'true';
      video.addEventListener('canplay', () => {
        if (state.focus.current > 0.1) {
          video.play().catch(() => {});
        }
      });
      overlay.appendChild(video);
      state.brandVideo = video;
    } else if (state.brandVideo) {
      state.brandVideo.src = videoSource;
    }
  } else {
    overlay.innerHTML = '';
    const imageSource = pickBrandImage(state.index);
    if (imageSource) {
      overlay.style.backgroundImage = `url('${imageSource}')`;
    }
    state.brandVideo = null;
  }

  return overlay;
}

function resolveGroupElement(element) {
  if (!(element instanceof HTMLElement)) {
    return null;
  }
  const groupSelectors = [
    '[data-card-group]',
    '.version-grid',
    '.card-grid',
    '.cards-grid',
    '.cards',
    '.card-collection',
    '.visualizer-grid',
    '.layout-grid',
    '.module-grid',
    '.experience-grid',
    '.card-stack',
    '.card-list'
  ];
  const selector = groupSelectors.join(', ');
  const matched = element.closest(selector);
  if (matched) {
    return matched;
  }
  const fallback = element.parentElement;
  if (fallback && fallback !== document.body && fallback !== document.documentElement) {
    return fallback;
  }
  return null;
}

function attachToGroup(state) {
  const group = resolveGroupElement(state.element);
  if (!group) {
    return null;
  }
  group.dataset.globalCardGroup = 'true';
  let groupState = groupStates.get(group);
  if (!groupState) {
    groupState = {
      element: group,
      cards: new Set(),
      focus: { current: 0, target: 0 },
      pointer: {
        currentX: 0.5,
        currentY: 0.5,
        targetX: 0.5,
        targetY: 0.5
      },
      synergy: { current: 0, target: 0 },
      section: null
    };
    groupStates.set(group, groupState);
  }
  groupState.cards.add(state);
  state.group = group;
  return group;
}

function detachFromGroup(state) {
  if (!state.group) {
    return;
  }
  const groupState = groupStates.get(state.group);
  if (!groupState) {
    state.group = null;
    return;
  }
  groupState.cards.delete(state);
  if (groupState.cards.size === 0) {
    const { element, section } = groupState;
    element.removeAttribute('data-global-card-group');
    element.removeAttribute('data-global-group-active');
    element.style.removeProperty('--group-focus-amount');
    element.style.removeProperty('--group-focus-x');
    element.style.removeProperty('--group-focus-y');
    element.style.removeProperty('--group-synergy');
    if (section) {
      section.removeAttribute('data-global-group-active');
      section.style.removeProperty('--section-focus-amount');
      section.style.removeProperty('--section-synergy');
    }
    groupStates.delete(state.group);
  }
  state.group = null;
}

function syncGroupAssociation(state) {
  const resolvedGroup = resolveGroupElement(state.element);
  if (resolvedGroup === state.group) {
    return;
  }
  detachFromGroup(state);
  if (resolvedGroup) {
    attachToGroup(state);
  }
}

function createState(element, index) {
  element.classList.add('global-visualizer-card');
  element.dataset.globalCardSynergy = 'applied';
  const state = {
    element,
    index,
    pointer: {
      targetX: 0.5,
      targetY: 0.5,
      smoothX: 0.5,
      smoothY: 0.5,
      lastClientX: null,
      lastClientY: null
    },
    focus: { current: 0, target: 0 },
    support: { current: 0, target: 0 },
    twist: { current: 0, target: 0 },
    pulse: { current: 0, target: 0 },
    scroll: { current: 0, target: 0 },
    overlay: null,
    brandVideo: null,
    group: null
  };
  state.overlay = ensureBrandLayer(state);
  state.element.dataset.supportRole = 'neutral';
  state.group = attachToGroup(state);
  cardStates.set(element, state);
  return state;
}

function updateSupportTargets(activeState) {
  activeCardState = activeState;
  const activeGroup = activeState && activeState.group ? activeState.group : null;

  groupStates.forEach((groupState, groupElement) => {
    if (!activeGroup) {
      groupState.synergy.target = 0;
      groupElement.dataset.globalGroupActive = 'false';
      return;
    }
    if (groupElement === activeGroup) {
      groupState.synergy.target = 1;
      groupElement.dataset.globalGroupActive = 'true';
    } else {
      groupState.synergy.target = 0.32;
      groupElement.dataset.globalGroupActive = 'false';
    }
  });

  cardStates.forEach((state) => {
    if (activeState) {
      if (state === activeState) {
        state.support.target = 0.38;
        state.element.dataset.supportRole = 'primary';
      } else if (activeGroup && state.group === activeGroup) {
        state.support.target = -0.24;
        state.element.dataset.supportRole = 'supporting';
      } else {
        state.support.target = -0.12;
        state.element.dataset.supportRole = 'ambient';
      }
    } else {
      state.support.target = 0;
      state.element.dataset.supportRole = 'neutral';
    }
  });
  globalState.synergy.target = activeState ? 1 : 0;
  requestTick();
}

function pointerPosition(event, element) {
  const rect = element.getBoundingClientRect();
  const x = normalise(event.clientX, rect.left, rect.right);
  const y = normalise(event.clientY, rect.top, rect.bottom);
  return { x, y };
}

function handlePointerEnter(state, event) {
  const { x, y } = pointerPosition(event, state.element);
  state.pointer.targetX = x;
  state.pointer.targetY = y;
  state.pointer.smoothX = x;
  state.pointer.smoothY = y;
  state.focus.target = 1;
  state.element.dataset.hasFocus = 'true';
  state.element.dataset.interactionActive = 'true';
  if (state.group) {
    const groupState = groupStates.get(state.group);
    if (groupState) {
      groupState.pointer.targetX = x;
      groupState.pointer.targetY = y;
      groupState.focus.target = Math.max(groupState.focus.target, 0.85);
      groupState.synergy.target = Math.max(groupState.synergy.target, 0.6);
    }
  }
  if (state.brandVideo) {
    state.brandVideo.play().catch(() => {});
  }
  updateSupportTargets(state);
  requestTick();
}

function handlePointerMove(state, event) {
  const { x, y } = pointerPosition(event, state.element);
  const deltaX = state.pointer.lastClientX !== null ? event.clientX - state.pointer.lastClientX : 0;
  const deltaY = state.pointer.lastClientY !== null ? event.clientY - state.pointer.lastClientY : 0;
  state.pointer.lastClientX = event.clientX;
  state.pointer.lastClientY = event.clientY;
  state.pointer.targetX = x;
  state.pointer.targetY = y;
  state.focus.target = Math.min(1.2, state.focus.target + 0.05);
  state.twist.target = Math.max(-22, Math.min(22, state.twist.target * 0.6 + deltaX * 0.18 - deltaY * 0.12));
  state.element.dataset.interactionActive = 'true';
  if (state.group) {
    const groupState = groupStates.get(state.group);
    if (groupState) {
      groupState.pointer.targetX = x;
      groupState.pointer.targetY = y;
      groupState.synergy.target = Math.max(groupState.synergy.target, 0.8);
    }
  }
  requestTick();
}

function handlePointerLeave(state) {
  state.pointer.targetX = 0.5;
  state.pointer.targetY = 0.5;
  state.pointer.lastClientX = null;
  state.pointer.lastClientY = null;
  state.focus.target = 0;
  state.twist.target = 0;
  state.element.dataset.hasFocus = 'false';
  state.element.dataset.interactionActive = 'false';
  if (state.group) {
    const groupState = groupStates.get(state.group);
    if (groupState && groupState.cards.size <= 1) {
      groupState.pointer.targetX = 0.5;
      groupState.pointer.targetY = 0.5;
      groupState.focus.target = 0;
      groupState.synergy.target = Math.max(0, groupState.synergy.target - 0.35);
    }
  }
  if (activeCardState === state) {
    updateSupportTargets(null);
  }
  requestTick();
}

function handleClick(state) {
  state.pulse.target = 1;
  requestTick();
}

function handleFocusIn(state) {
  state.focus.target = 0.85;
  state.element.dataset.hasFocus = 'true';
  if (state.group) {
    const groupState = groupStates.get(state.group);
    if (groupState) {
      groupState.focus.target = Math.max(groupState.focus.target, 0.85);
      groupState.synergy.target = Math.max(groupState.synergy.target, 0.7);
    }
  }
  updateSupportTargets(state);
  requestTick();
}

function handleFocusOut(state) {
  state.focus.target = 0;
  state.element.dataset.hasFocus = 'false';
  if (state.group) {
    const groupState = groupStates.get(state.group);
    if (groupState && groupState.cards.size <= 1) {
      groupState.focus.target = 0;
      groupState.synergy.target = Math.max(0, groupState.synergy.target - 0.4);
    }
  }
  if (activeCardState === state) {
    updateSupportTargets(null);
  }
  requestTick();
}

function attachListeners(state) {
  const element = state.element;
  const pointerEnter = (event) => handlePointerEnter(state, event);
  const pointerMove = (event) => handlePointerMove(state, event);
  const pointerLeave = () => handlePointerLeave(state);
  const click = () => handleClick(state);
  const focusIn = () => handleFocusIn(state);
  const focusOut = () => handleFocusOut(state);

  element.addEventListener('pointerenter', pointerEnter, { passive: true });
  element.addEventListener('pointermove', pointerMove, { passive: true });
  element.addEventListener('pointerleave', pointerLeave, { passive: true });
  element.addEventListener('click', click, { passive: true });
  element.addEventListener('focusin', focusIn);
  element.addEventListener('focusout', focusOut);

  state.cleanup = () => {
    element.removeEventListener('pointerenter', pointerEnter);
    element.removeEventListener('pointermove', pointerMove);
    element.removeEventListener('pointerleave', pointerLeave);
    element.removeEventListener('click', click);
    element.removeEventListener('focusin', focusIn);
    element.removeEventListener('focusout', focusOut);
  };
}

function registerCard(element) {
  if (!shouldRegister(element)) {
    return;
  }
  const state = createState(element, cardStates.size);
  attachListeners(state);
  requestTick();
}

function collectCandidateElements(root = document) {
  const selectors = [
    '[data-visualizer-card]',
    '[data-card]',
    '.global-visualizer-card',
    '.card',
    '.project-card',
    '.version-card',
    '.experience-card',
    '.portfolio-card',
    '.innovation-card',
    '.module-card',
    '.hero-card',
    '.focus-card',
    '.tilt-card',
    '.holographic-card',
    '.vib34d-card',
    '.trading-card',
    '.clear-seas-card',
    '.concept-card',
    '.immersive-card',
    '.vision-card',
    '.galaxy-card',
    '.grid-card',
    '.quantum-card',
    '.ai-card',
    '.story-card',
    '.lab-card'
  ];
  const elements = new Set();
  selectors.forEach((selector) => {
    root.querySelectorAll(selector).forEach((element) => elements.add(element));
  });
  return Array.from(elements);
}

function requestTick() {
  if (rafId) {
    return;
  }
  rafId = requestAnimationFrame(step);
}

function step() {
  rafId = null;
  let continueAnimation = false;
  let weightedX = 0;
  let weightedY = 0;
  let totalFocus = 0;
  const toRemove = [];

  cardStates.forEach((state, element) => {
    syncGroupAssociation(state);
    if (!document.body.contains(element)) {
      if (state.cleanup) {
        state.cleanup();
      }
      detachFromGroup(state);
      toRemove.push(element);
      return;
    }

    const focusLerp = 0.12;
    const pointerLerp = 0.14;
    const supportLerp = 0.1;
    const twistLerp = 0.18;
    const pulseLerp = 0.22;
    const scrollLerp = 0.16;

    state.pointer.smoothX += (state.pointer.targetX - state.pointer.smoothX) * pointerLerp;
    state.pointer.smoothY += (state.pointer.targetY - state.pointer.smoothY) * pointerLerp;
    state.focus.current += (state.focus.target - state.focus.current) * focusLerp;
    state.support.current += (state.support.target - state.support.current) * supportLerp;
    state.twist.current += (state.twist.target - state.twist.current) * twistLerp;
    state.pulse.current += (state.pulse.target - state.pulse.current) * pulseLerp;
    state.pulse.target *= 0.76;

    state.scroll.current += (state.scroll.target - state.scroll.current) * scrollLerp;
    state.scroll.target *= 0.82;

    const focusStrength = Math.max(0, Math.min(1.2, state.focus.current));
    const supportStrength = Math.max(-1, Math.min(1, state.support.current));
    const twistDeg = state.twist.current;
    const pulse = Math.max(0, state.pulse.current);

    element.style.setProperty('--card-focus-x', state.pointer.smoothX.toFixed(4));
    element.style.setProperty('--card-focus-y', state.pointer.smoothY.toFixed(4));
    element.style.setProperty('--card-focus-strength', focusStrength.toFixed(4));
    element.style.setProperty('--card-support-intensity', supportStrength.toFixed(4));
    element.style.setProperty('--card-twist', `${twistDeg.toFixed(3)}deg`);
    element.style.setProperty('--card-pulse', pulse.toFixed(4));
    element.style.setProperty('--card-scroll-momentum', state.scroll.current.toFixed(4));

    if (focusStrength > 0.05) {
      weightedX += state.pointer.smoothX * focusStrength;
      weightedY += state.pointer.smoothY * focusStrength;
      totalFocus += focusStrength;
    }

    if (Math.abs(state.pointer.targetX - state.pointer.smoothX) > 0.001 ||
        Math.abs(state.pointer.targetY - state.pointer.smoothY) > 0.001 ||
        Math.abs(state.focus.target - state.focus.current) > 0.001 ||
        Math.abs(state.support.target - state.support.current) > 0.001 ||
        Math.abs(state.twist.target - state.twist.current) > 0.001 ||
        Math.abs(state.scroll.current) > 0.001 ||
        state.pulse.current > 0.01) {
      continueAnimation = true;
    }
  });

  groupStates.forEach((groupState) => {
    let weightedGroupX = 0;
    let weightedGroupY = 0;
    let groupFocus = 0;
    groupState.cards.forEach((cardState) => {
      const cardFocus = Math.max(0, Math.min(1.2, cardState.focus.current));
      if (cardFocus > 0.05) {
        weightedGroupX += cardState.pointer.smoothX * cardFocus;
        weightedGroupY += cardState.pointer.smoothY * cardFocus;
        groupFocus += cardFocus;
      }
    });

    groupState.pointer.targetX = groupFocus > 0 ? weightedGroupX / groupFocus : 0.5;
    groupState.pointer.targetY = groupFocus > 0 ? weightedGroupY / groupFocus : 0.5;
    groupState.focus.target = Math.min(1, groupFocus);

    groupState.pointer.currentX += (groupState.pointer.targetX - groupState.pointer.currentX) * 0.16;
    groupState.pointer.currentY += (groupState.pointer.targetY - groupState.pointer.currentY) * 0.16;
    groupState.focus.current += (groupState.focus.target - groupState.focus.current) * 0.12;
    groupState.synergy.current += (groupState.synergy.target - groupState.synergy.current) * 0.12;

    const { element, section } = groupState;
    element.style.setProperty('--group-focus-amount', groupState.focus.current.toFixed(4));
    element.style.setProperty('--group-focus-x', groupState.pointer.currentX.toFixed(4));
    element.style.setProperty('--group-focus-y', groupState.pointer.currentY.toFixed(4));
    element.style.setProperty('--group-synergy', groupState.synergy.current.toFixed(4));

    if (!groupState.section) {
      groupState.section = element.closest('.section, section, .section-block, .section-wrapper, .group-section') || null;
    }
    if (groupState.section) {
      groupState.section.dataset.globalGroupActive = groupState.synergy.current > 0.05 ? 'true' : 'false';
      groupState.section.style.setProperty('--section-focus-amount', groupState.focus.current.toFixed(4));
      groupState.section.style.setProperty('--section-synergy', groupState.synergy.current.toFixed(4));
    }

    if (Math.abs(groupState.pointer.targetX - groupState.pointer.currentX) > 0.001 ||
        Math.abs(groupState.pointer.targetY - groupState.pointer.currentY) > 0.001 ||
        Math.abs(groupState.focus.current - groupState.focus.target) > 0.001 ||
        Math.abs(groupState.synergy.current - groupState.synergy.target) > 0.001) {
      continueAnimation = true;
    }
  });

  toRemove.forEach((element) => cardStates.delete(element));

  globalState.scroll.current += (globalState.scroll.target - globalState.scroll.current) * 0.12;
  globalState.scroll.target *= 0.9;
  if (Math.abs(globalState.scroll.current) > 0.0001 || Math.abs(globalState.scroll.target) > 0.0001) {
    continueAnimation = true;
  }

  globalState.synergy.current += (globalState.synergy.target - globalState.synergy.current) * 0.1;
  if (Math.abs(globalState.synergy.current - globalState.synergy.target) > 0.001) {
    continueAnimation = true;
  }

  const root = document.documentElement;
  root.style.setProperty('--global-scroll-momentum', globalState.scroll.current.toFixed(4));
  root.style.setProperty('--global-scroll-tilt', `${(globalState.scroll.current * 10).toFixed(3)}deg`);
  root.style.setProperty('--global-synergy-glow', globalState.synergy.current.toFixed(4));

  if (totalFocus > 0) {
    root.style.setProperty('--global-focus-x', (weightedX / totalFocus).toFixed(4));
    root.style.setProperty('--global-focus-y', (weightedY / totalFocus).toFixed(4));
    root.style.setProperty('--global-focus-amount', Math.min(1, totalFocus).toFixed(4));
  } else {
    root.style.setProperty('--global-focus-x', '0.5');
    root.style.setProperty('--global-focus-y', '0.5');
    root.style.setProperty('--global-focus-amount', '0');
  }

  if (continueAnimation) {
    requestTick();
  }
}

function handleScroll() {
  const now = performance.now();
  const deltaY = window.scrollY - globalState.scroll.lastY;
  const deltaTime = Math.max(16, now - globalState.scroll.lastTime);
  globalState.scroll.lastY = window.scrollY;
  globalState.scroll.lastTime = now;
  const velocity = deltaY / deltaTime;
  const momentum = Math.max(-3, Math.min(3, velocity * 12));
  globalState.scroll.target = momentum;
  cardStates.forEach((state) => {
    state.scroll.target = momentum;
  });
  requestTick();
}

function observeMutations() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) {
          return;
        }
        if (shouldRegister(node)) {
          registerCard(node);
        }
        collectCandidateElements(node).forEach((element) => registerCard(element));
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

async function initialise() {
  ensureStylesheet('styles/global-card-synergy.css', 'global-card-synergy');
  collectCandidateElements().forEach((element) => registerCard(element));
  observeMutations();
  window.addEventListener('scroll', handleScroll, { passive: true });
  let resizeTimeout = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      collectCandidateElements().forEach((element) => registerCard(element));
    }, 120);
  });
  handleScroll();
  await ensureCardSystem();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialise, { once: true });
} else {
  initialise();
}
