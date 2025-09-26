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

const pageCollectionProfiles = [
  {
    key: 'meta-index',
    palette: 'meta',
    fileNames: new Set(['index.html']),
    tags: new Set(['index', 'map', 'meta']),
    titleTokens: ['all versions', 'collections'],
    videoPattern: [0, 1],
    imageOrder: [2, 3, 4, 0, 1, 5, 6, 7, 8],
    videoOrder: [4, 5, 6, 0, 1, 2, 3],
    overlay: {
      blend: 'screen',
      opacity: 1.08,
      filter: 'hue-rotate(18deg) saturate(1.35) brightness(1.1)',
      rotate: '6deg',
      depth: '18px'
    },
    canvas: {
      scale: 0.08,
      depth: '12px'
    }
  },
  {
    key: 'core-foundation',
    palette: 'foundation',
    fileNames: new Set([
      '1-index.html',
      '2-index-optimized.html',
      '3-index-fixed.html',
      '4-index-unified.html',
      '5-index-vib34d-integrated.html',
      '6-index-totalistic.html'
    ]),
    tags: new Set(['core', 'foundation', 'totalistic', 'unified']),
    titleTokens: ['clear seas solutions', 'totalistic', 'integrated'],
    videoPattern: [0, 1, 0, 0],
    imageOrder: [0, 5, 1, 6, 2, 7, 3, 8, 4],
    videoOrder: [1, 2, 3, 0, 4, 5, 6],
    overlay: {
      blend: 'soft-light',
      opacity: 0.96,
      filter: 'saturate(1.2) brightness(1.05)',
      rotate: '2deg',
      depth: '8px'
    },
    canvas: {
      scale: 0.12,
      depth: '18px'
    }
  },
  {
    key: 'immersive-ai',
    palette: 'immersive',
    fileNames: new Set([
      '10-pr-4.html', '11-pr-5.html', '12-pr-6.html',
      '14-pr-8.html', '15-pr-9.html', '16-pr-10.html',
      '17-pr-11.html', '18-pr-12.html', '19-pr-13.html',
      '20-pr-14.html', '21-pr-15.html', '22-pr-16.html',
      '23-pr-17.html', '24-pr-18.html', '25-pr-19.html',
      '26-pr-20.html', '27-pr-21.html', '28-pr-22.html',
      '29-pr-23.html', '30-pr-24.html'
    ]),
    tags: new Set(['immersive', 'mission', 'pulse', 'signal', 'pr', 'blueprint']),
    titleTokens: ['immersive experience', 'mission axis', 'experience blueprint'],
    videoPattern: [1, 0, 1, 1],
    imageOrder: [4, 0, 5, 1, 6, 2, 7, 3, 8],
    videoOrder: [4, 5, 6, 0, 1, 2, 3],
    overlay: {
      blend: 'color-dodge',
      opacity: 1.14,
      filter: 'hue-rotate(32deg) saturate(1.5) brightness(1.18)',
      rotate: '9deg',
      depth: '28px'
    },
    canvas: {
      scale: 0.18,
      depth: '26px'
    },
    scripts: ['scripts/immersive-experience-actualizer.js']
  },
  {
    key: 'concept-labs',
    palette: 'concept',
    fileNames: new Set([
      '7-pr-1.html',
      '8-pr-2.html',
      '9-pr-3.html',
      '13-pr-7.html',
      '25-orthogonal-depth-progression.html',
      'ultimate-clear-seas-holistic-system.html'
    ]),
    tags: new Set(['concept', 'lab', 'gallery', 'codex', 'orthogonal', 'ultimate']),
    titleTokens: ['visual codex', 'orthogonal depth', 'holistic system'],
    videoPattern: [1, 1, 0, 1],
    imageOrder: [6, 7, 8, 3, 4, 0, 1, 2, 5],
    videoOrder: [2, 3, 4, 5, 6, 0, 1],
    overlay: {
      blend: 'lighten',
      opacity: 1.22,
      filter: 'hue-rotate(280deg) saturate(1.45) brightness(1.12)',
      rotate: '-7deg',
      depth: '32px'
    },
    canvas: {
      scale: 0.22,
      depth: '34px'
    }
  }
];

function normaliseFileName(name) {
  if (!name) {
    return 'index.html';
  }
  const trimmed = name.trim().toLowerCase();
  if (!trimmed) {
    return 'index.html';
  }
  if (trimmed.endsWith('.html')) {
    return trimmed;
  }
  return `${trimmed}.html`;
}

function computeHashSeed(input) {
  let hash = 0;
  const source = input || '';
  for (let i = 0; i < source.length; i += 1) {
    hash = (hash * 131 + source.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function detectActivePageProfile() {
  const docEl = document.documentElement;
  const body = document.body || null;
  const path = typeof window !== 'undefined' && window.location ? window.location.pathname : '';
  const pathToken = path ? path.split('/').filter(Boolean).pop() : '';
  const metaName = normaliseFileName(pathToken || docEl.dataset.pageId || '');
  const candidateTokens = [
    docEl.dataset.pageCollection,
    docEl.dataset.collection,
    docEl.dataset.showcaseTheme,
    docEl.dataset.showcaseCard,
    body && body.dataset ? body.dataset.pageCollection : null,
    body && body.dataset ? body.dataset.collection : null
  ].filter(Boolean).map((token) => token.toLowerCase());
  const title = (document.title || '').toLowerCase();

  let matched = pageCollectionProfiles.find((profile) => profile.fileNames.has(metaName));
  if (!matched) {
    matched = pageCollectionProfiles.find((profile) => candidateTokens.some((token) => profile.tags.has(token)));
  }
  if (!matched) {
    matched = pageCollectionProfiles.find((profile) => profile.titleTokens.some((token) => title.includes(token)));
  }
  if (!matched) {
    matched = pageCollectionProfiles.find((profile) => profile.key === 'core-foundation') || pageCollectionProfiles[0];
  }

  const signatureParts = [metaName, title].concat(candidateTokens);
  const signature = signatureParts.filter(Boolean).join('|') || metaName;
  const seed = computeHashSeed(signature);
  const imageSeed = brandAssets.images.length ? seed % brandAssets.images.length : 0;
  const videoSeed = brandAssets.videos.length ? Math.floor(seed / 7) % brandAssets.videos.length : 0;

  const profile = {
    key: matched.key,
    palette: matched.palette,
    videoPattern: matched.videoPattern || null,
    imageOrder: matched.imageOrder || null,
    videoOrder: matched.videoOrder || null,
    overlay: matched.overlay || {},
    canvas: matched.canvas || {},
    scripts: matched.scripts ? [...matched.scripts] : [],
    signature,
    seed,
    imageSeed,
    videoSeed
  };

  if (metaName === 'ultimate-clear-seas-holistic-system.html') {
    profile.scripts.push('scripts/ultimate-holistic-vib34d-system.js');
  }

  docEl.dataset.globalPageCollection = profile.key;
  docEl.dataset.globalBrandPalette = profile.palette;
  if (body) {
    body.dataset.globalPageCollection = profile.key;
    body.dataset.globalBrandPalette = profile.palette;
  }
  docEl.style.setProperty('--global-brand-palette', profile.palette);
  if (profile.overlay?.filter) {
    docEl.style.setProperty('--global-brand-overlay-filter', profile.overlay.filter);
  }
  if (profile.overlay?.opacity != null) {
    docEl.style.setProperty('--global-brand-overlay-opacity', profile.overlay.opacity.toString());
  }
  window.__CLEAR_SEAS_PAGE_PROFILE = profile;
  return profile;
}

const activePageProfile = detectActivePageProfile();

function preparePageProfile(profile) {
  if (!profile) {
    return;
  }
  const overlaySettings = profile.overlay || {};
  if (overlaySettings.blend) {
    document.documentElement.style.setProperty('--global-brand-overlay-blend', overlaySettings.blend);
  }
  if (Array.isArray(profile.scripts) && profile.scripts.length) {
    profile.scripts.forEach((src) => ensureScript(src));
  }
  if (sharedMotion) {
    sharedMotion.palette = profile.palette || null;
    sharedMotion.collection = profile.key || null;
  }
}

const stylesLoaded = new Set();
const scriptsLoaded = new Map();
const cardStates = new Map();
const groupStates = new Map();
let activeCardState = null;
let rafId = null;

const globalState = {
  scroll: { current: 0, target: 0, lastY: window.scrollY || 0, lastTime: performance.now() },
  synergy: { current: 0, target: 0 },
  focus: {
    currentX: 0.5,
    currentY: 0.5,
    currentAmount: 0,
    targetX: 0.5,
    targetY: 0.5,
    targetAmount: 0
  },
  tilt: {
    currentX: 0,
    currentY: 0,
    targetX: 0,
    targetY: 0
  },
  bend: { current: 0, target: 0 },
  warp: { current: 0, target: 0 }
};

const sharedMotion = window.__CLEAR_SEAS_GLOBAL_MOTION || (window.__CLEAR_SEAS_GLOBAL_MOTION = {
  focus: { x: 0.5, y: 0.5, amount: 0 },
  tilt: { x: 0, y: 0, strength: 0 },
  bend: 0,
  warp: 0,
  scroll: 0,
  synergy: 0,
  palette: null,
  collection: null
});

const supportsVisibilityObserver = typeof window !== 'undefined' && 'IntersectionObserver' in window;
let visibilityObserver = null;

function ensureVisibilityObserver() {
  if (!supportsVisibilityObserver) {
    return null;
  }
  if (!visibilityObserver) {
    visibilityObserver = new IntersectionObserver(handleVisibilityEntries, {
      rootMargin: '15% 0px 15% 0px',
      threshold: [0, 0.08, 0.2, 0.35, 0.5, 0.75, 0.95]
    });
  }
  return visibilityObserver;
}

function handleVisibilityEntries(entries) {
  entries.forEach((entry) => {
    const { target, intersectionRatio, isIntersecting } = entry;
    const state = cardStates.get(target);
    if (!state) {
      return;
    }
    const visibleRatio = Math.max(0, Math.min(1, intersectionRatio));
    state.visibilityRatio = visibleRatio;
    const isVisible = isIntersecting && visibleRatio > 0.001;
    if (isVisible !== state.isVisible) {
      state.isVisible = isVisible;
      target.dataset.globalCardVisible = isVisible ? 'true' : 'false';
      if (!isVisible) {
        state.pointer.targetX = 0.5;
        state.pointer.targetY = 0.5;
        state.focus.target = Math.min(state.focus.target, 0.35);
        state.twist.target = 0;
        state.pulse.target = 0;
        state.support.target = Math.min(state.support.target, 0.02);
        target.dataset.supportDistance = 'far';
      }
      updateSupportTargets(activeCardState);
      requestTick();
    }
    target.style.setProperty('--card-visibility', visibleRatio.toFixed(4));
  });
  if (!rafId) {
    requestTick();
  }
}

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

function resolveAssetIndex(order, seed, offset, length) {
  if (!length) {
    return 0;
  }
  if (Array.isArray(order) && order.length) {
    const orderIndex = (seed + offset) % order.length;
    return order[orderIndex % order.length] % length;
  }
  return (seed + offset) % length;
}

function pickBrandImage(index) {
  if (!brandAssets.images.length) {
    return null;
  }
  const assetIndex = resolveAssetIndex(activePageProfile.imageOrder, activePageProfile.imageSeed || 0, index, brandAssets.images.length);
  return brandAssets.images[assetIndex];
}

function pickBrandVideo(index) {
  if (!brandAssets.videos.length) {
    return null;
  }
  const assetIndex = resolveAssetIndex(activePageProfile.videoOrder, activePageProfile.videoSeed || 0, index, brandAssets.videos.length);
  return brandAssets.videos[assetIndex];
}

function shouldPreferVideo(state) {
  const element = state?.element;
  if (!element) {
    return false;
  }
  if (element.dataset.brandVideo === 'true') {
    return true;
  }
  if (element.dataset.brandVideo === 'false') {
    return false;
  }
  if (element.classList.contains('brand-video-card')) {
    return true;
  }
  const pattern = activePageProfile.videoPattern;
  if (Array.isArray(pattern) && pattern.length) {
    const cycleIndex = state.index % pattern.length;
    return Boolean(pattern[cycleIndex]);
  }
  return state.index % 3 === 0;
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

  const overlaySettings = activePageProfile.overlay || {};

  card.dataset.brandPalette = activePageProfile.palette;
  card.style.setProperty('--brand-overlay-opacity', overlaySettings.opacity != null ? String(overlaySettings.opacity) : '1');
  card.style.setProperty('--brand-overlay-filter', overlaySettings.filter || 'brightness(1)');
  card.style.setProperty('--brand-overlay-blend', overlaySettings.blend || 'screen');
  card.style.setProperty('--brand-overlay-rotate', overlaySettings.rotate || '0deg');
  card.style.setProperty('--brand-overlay-depth', overlaySettings.depth || '0px');
  if (activePageProfile.canvas?.scale != null) {
    card.style.setProperty('--card-canvas-scale', String(activePageProfile.canvas.scale));
  }
  if (activePageProfile.canvas?.depth) {
    card.style.setProperty('--card-canvas-depth', activePageProfile.canvas.depth);
  }

  const preferVideo = shouldPreferVideo(state);
  const videoSource = preferVideo ? pickBrandVideo(state.index) : null;

  overlay.dataset.brandIndex = state.index;
  overlay.dataset.brandPalette = activePageProfile.palette;
  overlay.style.setProperty('--brand-overlay-opacity', overlaySettings.opacity != null ? String(overlaySettings.opacity) : '1');
  overlay.style.setProperty('--brand-overlay-filter', overlaySettings.filter || 'brightness(1)');
  overlay.style.setProperty('--brand-overlay-blend', overlaySettings.blend || 'screen');
  overlay.style.setProperty('--brand-overlay-rotate', overlaySettings.rotate || '0deg');
  overlay.style.setProperty('--brand-overlay-depth', overlaySettings.depth || '0px');

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
      if (state.brandVideo.src !== videoSource) {
        try {
          state.brandVideo.pause();
        } catch (error) {
          // ignore pause failures
        }
        state.brandVideo.src = videoSource;
        state.brandVideo.load();
      }
      state.brandVideo.play().catch(() => {});
    }
  } else {
    if (state.brandVideo) {
      try {
        state.brandVideo.pause();
      } catch (error) {
        // ignore pause failures
      }
    }
    overlay.innerHTML = '';
    const imageSource = pickBrandImage(state.index);
    if (imageSource) {
      overlay.style.backgroundImage = `url('${imageSource}')`;
    } else {
      overlay.style.removeProperty('background-image');
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
  state.element.dataset.supportDistance = 'far';
  state.element.style.removeProperty('--card-sibling-focus-max');
  state.element.style.removeProperty('--card-sibling-focus-avg');
  state.element.style.removeProperty('--card-sibling-support-avg');
  state.element.style.removeProperty('--card-cohesion');
  state.element.style.removeProperty('--card-group-focus');
  state.element.style.removeProperty('--card-group-synergy');
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
    scroll: 0,
    overlay: null,
    brandVideo: null,
    group: null,
    isVisible: true,
    visibilityRatio: 1,
    cleanupCallbacks: []
  };
  state.overlay = ensureBrandLayer(state);
  state.element.dataset.supportRole = 'neutral';
  state.element.dataset.supportDistance = 'far';
  state.element.dataset.globalCardVisible = 'true';
  state.element.style.setProperty('--card-visibility', '1');
  state.group = attachToGroup(state);
  const observer = ensureVisibilityObserver();
  if (observer) {
    observer.observe(element);
    state.cleanupCallbacks.push(() => observer.unobserve(element));
  }
  state.cleanup = () => {
    while (state.cleanupCallbacks.length) {
      const callback = state.cleanupCallbacks.shift();
      try {
        callback();
      } catch (error) {
        console.warn('⚠️ Card cleanup callback failed', error);
      }
    }
  };
  cardStates.set(element, state);
  return state;
}

function updateSupportTargets(activeState) {
  activeCardState = activeState;
  const activeGroup = activeState && activeState.group ? activeState.group : null;

  let ambientSynergy = 0;
  groupStates.forEach((groupState) => {
    const visibleCount = Array.from(groupState.cards).reduce((count, cardState) => (
      count + (cardState.isVisible ? 1 : 0)
    ), 0);
    const ratio = groupState.cards.size ? visibleCount / groupState.cards.size : 0;
    ambientSynergy = Math.max(ambientSynergy, ratio * 0.45);

    if (!activeGroup) {
      groupState.synergy.target = ratio * 0.45;
      groupState.element.dataset.globalGroupActive = ratio > 0.08 ? 'true' : 'false';
      return;
    }

    if (groupState.element === activeGroup) {
      groupState.synergy.target = 1;
      groupState.element.dataset.globalGroupActive = 'true';
    } else {
      const ambientTarget = Math.max(0.18, ratio * 0.4);
      groupState.synergy.target = ambientTarget;
      groupState.element.dataset.globalGroupActive = ambientTarget > 0.12 ? 'true' : 'false';
    }
  });

  if (!activeState) {
    cardStates.forEach((state) => {
      if (state.isVisible) {
        state.support.target = 0.06;
        state.element.dataset.supportRole = 'supporting';
        state.element.dataset.supportDistance = 'visible';
      } else {
        state.support.target = 0;
        state.element.dataset.supportRole = 'neutral';
        state.element.dataset.supportDistance = 'far';
      }
    });
    globalState.synergy.target = ambientSynergy;
    requestTick();
    return;
  }

  let orderedGroupCards = [];
  if (activeGroup) {
    const activeGroupState = groupStates.get(activeGroup);
    if (activeGroupState) {
      orderedGroupCards = Array.from(activeGroupState.cards).sort((a, b) => a.index - b.index);
    }
  }

  const activeIndex = orderedGroupCards.length ? orderedGroupCards.indexOf(activeState) : -1;

  cardStates.forEach((state) => {
    if (state === activeState) {
      state.support.target = 0.45;
      state.element.dataset.supportRole = 'primary';
      state.element.dataset.supportDistance = '0';
      return;
    }

    if (activeGroup && state.group === activeGroup && activeIndex !== -1) {
      const index = orderedGroupCards.indexOf(state);
      const distance = index === -1 ? 3 : Math.abs(index - activeIndex);
      state.element.dataset.supportDistance = String(distance);
      let intensity = -0.02;
      if (state.isVisible) {
        if (distance === 1) {
          intensity = 0.22;
        } else if (distance === 2) {
          intensity = 0.1;
        }
      }
      state.support.target = intensity;
      state.element.dataset.supportRole = 'supporting';
    } else {
      state.element.dataset.supportDistance = 'far';
      state.support.target = state.isVisible ? -0.06 : -0.12;
      state.element.dataset.supportRole = 'ambient';
    }
  });

  globalState.synergy.target = Math.min(1, Math.max(0.85, 0.85 + ambientSynergy * 0.4));
  requestTick();
}

function pointerPosition(event, element) {
  const rect = element.getBoundingClientRect();
  const x = normalise(event.clientX, rect.left, rect.right);
  const y = normalise(event.clientY, rect.top, rect.bottom);
  return { x, y };
}

function handlePointerEnter(state, event) {
  if (!state.isVisible) {
    state.isVisible = true;
    state.element.dataset.globalCardVisible = 'true';
    state.visibilityRatio = 1;
    state.element.style.setProperty('--card-visibility', '1');
  }
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
  if (!state.isVisible) {
    state.isVisible = true;
    state.element.dataset.globalCardVisible = 'true';
  }
  state.visibilityRatio = 1;
  state.element.style.setProperty('--card-visibility', '1');
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

  const cleanupCallbacks = Array.isArray(state.cleanupCallbacks)
    ? state.cleanupCallbacks
    : (state.cleanupCallbacks = []);
  cleanupCallbacks.push(() => {
    element.removeEventListener('pointerenter', pointerEnter);
    element.removeEventListener('pointermove', pointerMove);
    element.removeEventListener('pointerleave', pointerLeave);
    element.removeEventListener('click', click);
    element.removeEventListener('focusin', focusIn);
    element.removeEventListener('focusout', focusOut);
  });
}

function registerCard(element) {
  if (!shouldRegister(element)) {
    return;
  }
  const state = createState(element, cardStates.size);
  attachListeners(state);
  updateSupportTargets(activeCardState);
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

    const visibilityFactor = typeof state.visibilityRatio === 'number'
      ? state.visibilityRatio
      : (state.isVisible ? 1 : 0);

    if (!state.isVisible) {
      state.pointer.targetX += (0.5 - state.pointer.targetX) * 0.2;
      state.pointer.targetY += (0.5 - state.pointer.targetY) * 0.2;
      state.focus.target *= 0.82;
      state.twist.target *= 0.6;
      state.pulse.target *= 0.6;
      state.scroll *= 0.85;
    }

    const focusLerp = state.isVisible ? 0.12 : 0.18;
    const pointerLerp = state.isVisible ? 0.14 : 0.22;
    const supportLerp = state.isVisible ? 0.1 : 0.16;
    const twistLerp = state.isVisible ? 0.18 : 0.26;
    const pulseLerp = state.isVisible ? 0.22 : 0.3;

    state.pointer.smoothX += (state.pointer.targetX - state.pointer.smoothX) * pointerLerp;
    state.pointer.smoothY += (state.pointer.targetY - state.pointer.smoothY) * pointerLerp;
    state.focus.current += (state.focus.target - state.focus.current) * focusLerp;
    state.support.current += (state.support.target - state.support.current) * supportLerp;
    state.twist.current += (state.twist.target - state.twist.current) * twistLerp;
    state.pulse.current += (state.pulse.target - state.pulse.current) * pulseLerp;
    state.pulse.target *= 0.76;

    const focusBase = Math.max(0, Math.min(1.2, state.focus.current));
    const focusStrength = focusBase * (0.25 + visibilityFactor * 0.75);
    const supportBase = Math.max(-1, Math.min(1, state.support.current));
    const supportStrength = supportBase * (0.3 + visibilityFactor * 0.7);
    const twistDeg = state.twist.current;
    const pulse = Math.max(0, state.pulse.current);

    element.style.setProperty('--card-focus-x', state.pointer.smoothX.toFixed(4));
    element.style.setProperty('--card-focus-y', state.pointer.smoothY.toFixed(4));
    element.style.setProperty('--card-focus-strength', focusStrength.toFixed(4));
    element.style.setProperty('--card-support-intensity', supportStrength.toFixed(4));
    element.style.setProperty('--card-twist', `${twistDeg.toFixed(3)}deg`);
    element.style.setProperty('--card-pulse', pulse.toFixed(4));
    element.style.setProperty('--card-scroll-momentum', state.scroll.toFixed(4));
    const rotationPhase = ((state.pointer.smoothX - 0.5) * 0.65) - ((state.pointer.smoothY - 0.5) * 0.55) + state.scroll * 0.32 + supportStrength * 0.18;
    element.style.setProperty('--card-rotation-phase', rotationPhase.toFixed(4));
    state.metrics = state.metrics || {};
    state.metrics.focusStrength = focusStrength;
    state.metrics.supportStrength = supportStrength;
    state.metrics.visibility = visibilityFactor;
    if (!supportsVisibilityObserver) {
      element.style.setProperty('--card-visibility', state.isVisible ? '1' : '0');
    }

    if (focusStrength > 0.05) {
      const weighting = focusStrength * (0.5 + visibilityFactor * 0.5);
      weightedX += state.pointer.smoothX * weighting;
      weightedY += state.pointer.smoothY * weighting;
      totalFocus += weighting;
    }

    if (Math.abs(state.pointer.targetX - state.pointer.smoothX) > 0.001 ||
        Math.abs(state.pointer.targetY - state.pointer.smoothY) > 0.001 ||
        Math.abs(state.focus.target - state.focus.current) > 0.001 ||
        Math.abs(state.support.target - state.support.current) > 0.001 ||
        Math.abs(state.twist.target - state.twist.current) > 0.001 ||
        state.pulse.current > 0.01 ||
        (!state.isVisible && (Math.abs(state.pointer.smoothX - 0.5) > 0.001 || Math.abs(state.pointer.smoothY - 0.5) > 0.001))) {
      continueAnimation = true;
    }
  });

  groupStates.forEach((groupState) => {
    const cardList = Array.from(groupState.cards);
    const metricsList = cardList.map((cardState) => {
      const focusCurrent = Math.max(0, Math.min(1.2, cardState.focus.current));
      const focusStrength = Math.max(0, Math.min(1.2, cardState.metrics?.focusStrength ?? focusCurrent));
      const supportStrength = Math.max(-1, Math.min(1, cardState.metrics?.supportStrength ?? 0));
      const positiveSupport = Math.max(0, supportStrength);
      const visibility = Math.max(0, Math.min(1, cardState.metrics?.visibility ?? (cardState.isVisible ? 1 : 0)));
      return {
        state: cardState,
        focusCurrent,
        focusStrength,
        supportStrength,
        positiveSupport,
        visibility
      };
    });

    let weightedGroupX = 0;
    let weightedGroupY = 0;
    let groupFocus = 0;
    metricsList.forEach((entry) => {
      if (entry.focusCurrent > 0.05) {
        weightedGroupX += entry.state.pointer.smoothX * entry.focusCurrent;
        weightedGroupY += entry.state.pointer.smoothY * entry.focusCurrent;
        groupFocus += entry.focusCurrent;
      }
    });

    groupState.pointer.targetX = groupFocus > 0 ? weightedGroupX / groupFocus : 0.5;
    groupState.pointer.targetY = groupFocus > 0 ? weightedGroupY / groupFocus : 0.5;
    groupState.focus.target = Math.min(1, groupFocus);

    let totalFocusStrength = 0;
    let totalSupportStrength = 0;
    let maxFocusStrength = 0;
    let secondMaxFocusStrength = 0;
    let maxFocusCount = 0;
    let visibleMembers = 0;
    metricsList.forEach((entry) => {
      totalFocusStrength += entry.focusStrength;
      totalSupportStrength += entry.positiveSupport;
      if (entry.focusStrength > maxFocusStrength) {
        secondMaxFocusStrength = maxFocusStrength;
        maxFocusStrength = entry.focusStrength;
        maxFocusCount = 1;
      } else if (entry.focusStrength === maxFocusStrength && entry.focusStrength > 0) {
        maxFocusCount += 1;
      } else if (entry.focusStrength > secondMaxFocusStrength) {
        secondMaxFocusStrength = entry.focusStrength;
      }
      if (entry.visibility > 0.1) {
        visibleMembers += 1;
      }
    });

    const cardCount = metricsList.length;
    const averageFocusStrength = cardCount ? totalFocusStrength / cardCount : 0;
    const averageSupportStrength = cardCount ? totalSupportStrength / cardCount : 0;
    const visibleRatio = cardCount ? visibleMembers / cardCount : 0;

    groupState.pointer.currentX += (groupState.pointer.targetX - groupState.pointer.currentX) * 0.16;
    groupState.pointer.currentY += (groupState.pointer.targetY - groupState.pointer.currentY) * 0.16;
    groupState.focus.current += (groupState.focus.target - groupState.focus.current) * 0.12;
    groupState.synergy.current += (groupState.synergy.target - groupState.synergy.current) * 0.12;

    const { element, section } = groupState;
    element.style.setProperty('--group-focus-amount', groupState.focus.current.toFixed(4));
    element.style.setProperty('--group-focus-x', groupState.pointer.currentX.toFixed(4));
    element.style.setProperty('--group-focus-y', groupState.pointer.currentY.toFixed(4));
    element.style.setProperty('--group-synergy', groupState.synergy.current.toFixed(4));
    element.style.setProperty('--group-focus-peak', maxFocusStrength.toFixed(4));
    element.style.setProperty('--group-focus-average', averageFocusStrength.toFixed(4));
    element.style.setProperty('--group-support-average', averageSupportStrength.toFixed(4));
    element.style.setProperty('--group-visible-ratio', visibleRatio.toFixed(4));

    if (!groupState.section) {
      groupState.section = element.closest('.section, section, .section-block, .section-wrapper, .group-section') || null;
    }
    if (groupState.section) {
      groupState.section.dataset.globalGroupActive = groupState.synergy.current > 0.05 ? 'true' : 'false';
      groupState.section.style.setProperty('--section-focus-amount', groupState.focus.current.toFixed(4));
      groupState.section.style.setProperty('--section-synergy', groupState.synergy.current.toFixed(4));
    }

    if (cardCount > 0) {
      metricsList.forEach((entry) => {
        const othersCount = cardCount > 1 ? cardCount - 1 : 0;
        const siblingFocusAvg = othersCount > 0 ? (totalFocusStrength - entry.focusStrength) / othersCount : 0;
        const siblingSupportAvg = othersCount > 0 ? (totalSupportStrength - entry.positiveSupport) / othersCount : 0;
        const siblingMax = cardCount > 1
          ? ((entry.focusStrength === maxFocusStrength && maxFocusCount === 1) ? secondMaxFocusStrength : maxFocusStrength)
          : entry.focusStrength;
        const cohesionSource = othersCount > 0 ? siblingFocusAvg : entry.focusStrength;
        const cohesion = Math.min(1, Math.max(0, (groupState.synergy.current * 0.6) + (cohesionSource * 0.4)));
        const cardElement = entry.state.element;
        cardElement.style.setProperty('--card-sibling-focus-max', siblingMax.toFixed(4));
        cardElement.style.setProperty('--card-sibling-focus-avg', siblingFocusAvg.toFixed(4));
        cardElement.style.setProperty('--card-sibling-support-avg', siblingSupportAvg.toFixed(4));
        cardElement.style.setProperty('--card-cohesion', cohesion.toFixed(4));
        cardElement.style.setProperty('--card-group-focus', groupState.focus.current.toFixed(4));
        cardElement.style.setProperty('--card-group-synergy', groupState.synergy.current.toFixed(4));
      });
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

  const focusX = totalFocus > 0 ? weightedX / totalFocus : 0.5;
  const focusY = totalFocus > 0 ? weightedY / totalFocus : 0.5;
  const focusAmount = Math.min(1, totalFocus);
  globalState.focus.targetX = focusX;
  globalState.focus.targetY = focusY;
  globalState.focus.targetAmount = focusAmount;

  const tiltBase = 0.9 + globalState.synergy.current * 0.4;
  const scrollInfluence = globalState.scroll.current * 0.18;
  globalState.tilt.targetX = (focusX - 0.5) * tiltBase + scrollInfluence;
  globalState.tilt.targetY = (0.5 - focusY) * tiltBase - scrollInfluence * 0.6;

  const synergyWeight = globalState.synergy.current * 0.55;
  const momentumWeight = Math.min(0.6, Math.abs(globalState.scroll.current) * 0.85);
  globalState.bend.target = Math.min(1, focusAmount * 0.65 + synergyWeight + momentumWeight);
  globalState.warp.target = Math.max(-1, Math.min(1, (globalState.tilt.targetX - globalState.tilt.targetY) * 0.5));

  globalState.focus.currentX += (globalState.focus.targetX - globalState.focus.currentX) * 0.12;
  globalState.focus.currentY += (globalState.focus.targetY - globalState.focus.currentY) * 0.12;
  globalState.focus.currentAmount += (globalState.focus.targetAmount - globalState.focus.currentAmount) * 0.12;
  globalState.tilt.currentX += (globalState.tilt.targetX - globalState.tilt.currentX) * 0.16;
  globalState.tilt.currentY += (globalState.tilt.targetY - globalState.tilt.currentY) * 0.16;
  globalState.bend.current += (globalState.bend.target - globalState.bend.current) * 0.14;
  globalState.warp.current += (globalState.warp.target - globalState.warp.current) * 0.14;

  const tiltStrength = Math.min(1, Math.sqrt((globalState.tilt.currentX ** 2) + (globalState.tilt.currentY ** 2)) * 1.2 + globalState.bend.current * 0.5);

  if (
    Math.abs(globalState.focus.currentX - globalState.focus.targetX) > 0.0008 ||
    Math.abs(globalState.focus.currentY - globalState.focus.targetY) > 0.0008 ||
    Math.abs(globalState.focus.currentAmount - globalState.focus.targetAmount) > 0.0008 ||
    Math.abs(globalState.tilt.currentX - globalState.tilt.targetX) > 0.0008 ||
    Math.abs(globalState.tilt.currentY - globalState.tilt.targetY) > 0.0008 ||
    Math.abs(globalState.bend.current - globalState.bend.target) > 0.0008 ||
    Math.abs(globalState.warp.current - globalState.warp.target) > 0.0008
  ) {
    continueAnimation = true;
  }

  const root = document.documentElement;
  root.style.setProperty('--global-scroll-momentum', globalState.scroll.current.toFixed(4));
  root.style.setProperty('--global-scroll-tilt', `${(globalState.scroll.current * 10).toFixed(3)}deg`);
  root.style.setProperty('--global-synergy-glow', globalState.synergy.current.toFixed(4));
  root.style.setProperty('--global-focus-x', globalState.focus.currentX.toFixed(4));
  root.style.setProperty('--global-focus-y', globalState.focus.currentY.toFixed(4));
  root.style.setProperty('--global-focus-amount', globalState.focus.currentAmount.toFixed(4));
  root.style.setProperty('--global-bend-intensity', globalState.bend.current.toFixed(4));
  root.style.setProperty('--global-tilt-x', globalState.tilt.currentX.toFixed(4));
  root.style.setProperty('--global-tilt-y', globalState.tilt.currentY.toFixed(4));
  root.style.setProperty('--global-tilt-strength', tiltStrength.toFixed(4));
  root.style.setProperty('--global-warp', globalState.warp.current.toFixed(4));

  sharedMotion.focus.x = globalState.focus.currentX;
  sharedMotion.focus.y = globalState.focus.currentY;
  sharedMotion.focus.amount = globalState.focus.currentAmount;
  sharedMotion.tilt.x = globalState.tilt.currentX;
  sharedMotion.tilt.y = globalState.tilt.currentY;
  sharedMotion.tilt.strength = tiltStrength;
  sharedMotion.bend = globalState.bend.current;
  sharedMotion.warp = globalState.warp.current;
  sharedMotion.scroll = globalState.scroll.current;
  sharedMotion.synergy = globalState.synergy.current;
  sharedMotion.updatedAt = performance.now();

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
  globalState.scroll.target = Math.max(-3, Math.min(3, velocity * 12));
  cardStates.forEach((state) => {
    state.scroll += (globalState.scroll.target - state.scroll) * 0.25;
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
  preparePageProfile(activePageProfile);
  ensureStylesheet('styles/global-card-synergy.css', 'global-card-synergy');
  collectCandidateElements().forEach((element) => registerCard(element));
  updateSupportTargets(null);
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
