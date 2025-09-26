import { resolvePageProfile, applyProfileMetadata } from './page-profile-registry.js';
import { mergeAssetManifest, resolveBrandAssets, getAssetManifestSnapshot } from './site-asset-manifest.js';

const cssWebMasterGlobals = window.__CSS_WEB_MASTER_GLOBALS || (window.__CSS_WEB_MASTER_GLOBALS = {});

const DEFAULT_BRAND_EVENT = 'css-web-master:brand-overrides-changed';
const DEFAULT_CLEAR_SEAS_BRAND_EVENT = 'clear-seas:brand-overrides-changed';
const resolvedCssBrandEvent =
  cssWebMasterGlobals.brandOverrideEvent ||
  window.__CSS_WEB_MASTER_BRAND_OVERRIDE_EVENT ||
  DEFAULT_BRAND_EVENT;
const resolvedClearSeasBrandEvent = window.__CLEAR_SEAS_BRAND_OVERRIDE_EVENT || DEFAULT_CLEAR_SEAS_BRAND_EVENT;
const BRAND_OVERRIDE_EVENTS = [...new Set([resolvedCssBrandEvent, resolvedClearSeasBrandEvent])];
const BRAND_OVERRIDE_EVENT = resolvedCssBrandEvent;
window.__CSS_WEB_MASTER_BRAND_OVERRIDE_EVENT = resolvedCssBrandEvent;
window.__CLEAR_SEAS_BRAND_OVERRIDE_EVENT = resolvedClearSeasBrandEvent;
cssWebMasterGlobals.brandOverrideEvent = resolvedCssBrandEvent;
cssWebMasterGlobals.brandOverrideEvents = BRAND_OVERRIDE_EVENTS;

const DEFAULT_MOTION_EVENT = 'css-web-master:motion-updated';
const DEFAULT_CLEAR_SEAS_MOTION_EVENT = 'clear-seas:motion-updated';
const resolvedCssMotionEvent =
  cssWebMasterGlobals.motionEvent ||
  window.__CSS_WEB_MASTER_GLOBAL_MOTION_EVENT ||
  DEFAULT_MOTION_EVENT;
const resolvedClearSeasMotionEvent = window.__CLEAR_SEAS_GLOBAL_MOTION_EVENT || DEFAULT_CLEAR_SEAS_MOTION_EVENT;
const GLOBAL_MOTION_EVENTS = [...new Set([resolvedCssMotionEvent, resolvedClearSeasMotionEvent])];
const GLOBAL_MOTION_EVENT = resolvedCssMotionEvent;
window.__CSS_WEB_MASTER_GLOBAL_MOTION_EVENT = resolvedCssMotionEvent;
window.__CLEAR_SEAS_GLOBAL_MOTION_EVENT = resolvedClearSeasMotionEvent;
cssWebMasterGlobals.motionEvent = resolvedCssMotionEvent;
cssWebMasterGlobals.motionEvents = GLOBAL_MOTION_EVENTS;

const existingBrandAssets = window.__CSS_WEB_MASTER_BRAND_ASSETS || window.__CLEAR_SEAS_BRAND_ASSETS;

if (existingBrandAssets && typeof existingBrandAssets === 'object') {
  try {
    mergeAssetManifest({
      key: 'default',
      images: existingBrandAssets.images,
      videos: existingBrandAssets.videos
    });
  } catch (error) {
    console.warn('⚠️ Failed to merge legacy brand asset globals into manifest', error);
  }
}

const runtimeAssetManifests = [
  window.__CSS_WEB_MASTER_ASSET_MANIFEST,
  window.__CLEAR_SEAS_ASSET_MANIFEST
].filter((value) => value && typeof value === 'object');
runtimeAssetManifests.forEach((manifest) => {
  try {
    mergeAssetManifest(manifest);
  } catch (error) {
    console.warn('⚠️ Failed to merge runtime asset manifest', error);
  }
});

let brandAssets = { images: [], videos: [] };
let brandAssetKey = null;
let activePageProfile = null;

const updateManifestSnapshot = () => {
  const snapshot = getAssetManifestSnapshot();
  cssWebMasterGlobals.assetManifest = snapshot;
  window.__CSS_WEB_MASTER_ASSET_MANIFEST = snapshot;
  window.__CLEAR_SEAS_ASSET_MANIFEST = snapshot;
  return snapshot;
};

updateManifestSnapshot();

const syncBrandAssets = (siteCode) => {
  const resolved = resolveBrandAssets(siteCode);
  const meta =
    resolved && resolved.meta
      ? {
          images: { ...(resolved.meta.images || {}) },
          videos: { ...(resolved.meta.videos || {}) }
        }
      : { images: {}, videos: {} };
  brandAssets = {
    images: Array.isArray(resolved.images) ? [...resolved.images] : [],
    videos: Array.isArray(resolved.videos) ? [...resolved.videos] : [],
    meta
  };
  brandAssetKey = resolved.key || null;
  window.__CSS_WEB_MASTER_BRAND_ASSETS = brandAssets;
  window.__CLEAR_SEAS_BRAND_ASSETS = brandAssets;
  window.__CSS_WEB_MASTER_BRAND_ASSET_META = meta;
  window.__CLEAR_SEAS_BRAND_ASSET_META = meta;
  cssWebMasterGlobals.brandAssets = brandAssets;
  cssWebMasterGlobals.brandAssetKey = brandAssetKey;
  cssWebMasterGlobals.brandAssetMeta = meta;
  return resolved;
};

const brandOverrideApi = (() => {
  if (window.__CSS_WEB_MASTER_BRAND_OVERRIDE_API) {
    return window.__CSS_WEB_MASTER_BRAND_OVERRIDE_API;
  }
  if (window.__CLEAR_SEAS_BRAND_OVERRIDE_API) {
    return window.__CLEAR_SEAS_BRAND_OVERRIDE_API;
  }

  const overlayKeys = new Set(['blend', 'filter', 'opacity', 'rotate', 'depth']);
  const canvasKeys = new Set(['scale', 'depth']);

  const overrideCache = {
    source: null,
    version: 0,
    marker: 0,
    signature: null,
    length: 0,
    list: []
  };

  const readArrayMeta = (input) => {
    if (!input || typeof input !== 'object') {
      return { version: 0, marker: 0, signature: null };
    }
    return {
      version: Number(input.__version ?? input.version ?? input.__CLEAR_SEAS_VERSION ?? input.__clearSeasVersion ?? 0),
      marker: Number(input.__clearSeasOverrideMarker ?? 0),
      signature: typeof input.__signature === 'string' ? input.__signature : null
    };
  };

  const computeGlobalOverrides = () => {
    const source = window.__CLEAR_SEAS_CARD_BRAND_OVERRIDES;
    if (!Array.isArray(source)) {
      overrideCache.source = null;
      overrideCache.version = 0;
      overrideCache.marker = 0;
      overrideCache.signature = null;
      overrideCache.length = 0;
      overrideCache.list = [];
      return overrideCache.list;
    }

    const meta = readArrayMeta(source);
    if (
      source !== overrideCache.source ||
      meta.version !== overrideCache.version ||
      meta.marker !== overrideCache.marker ||
      meta.signature !== overrideCache.signature ||
      source.length !== overrideCache.length
    ) {
      overrideCache.list = source.map(normaliseOverrideEntry).filter(Boolean);
      overrideCache.source = source;
      overrideCache.version = meta.version;
      overrideCache.marker = meta.marker;
      overrideCache.signature = meta.signature;
      overrideCache.length = source.length;
    }

    return overrideCache.list;
  };

  const getGlobalOverrides = () => computeGlobalOverrides();

  const dispatchOverrideEvent = (detail) => {
    const eventDetail = {
      reason: detail && typeof detail === 'object' && detail.reason ? detail.reason : 'manual-refresh',
      timestamp: Date.now()
    };
    if (detail && typeof detail === 'object') {
      Object.keys(detail).forEach((key) => {
        if (key === 'reason') {
          return;
        }
        eventDetail[key] = detail[key];
      });
    }
    BRAND_OVERRIDE_EVENTS.forEach((eventName) => {
      window.dispatchEvent(new CustomEvent(eventName, { detail: eventDetail }));
    });
  };

  const refreshGlobalOverrides = (detail) => {
    overrideCache.source = null;
    overrideCache.version = 0;
    overrideCache.marker = 0;
    overrideCache.signature = null;
    overrideCache.length = 0;
    overrideCache.list = [];
    const overrides = computeGlobalOverrides();
    dispatchOverrideEvent(detail);
    return overrides;
  };

  const parseList = (value) => {
    if (!value) {
      return [];
    }
    if (Array.isArray(value)) {
      return value
        .map((item) => (typeof item === 'string' ? item.trim() : ''))
        .filter(Boolean);
    }
    return String(value)
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const sanitiseOverlay = (input) => {
    if (!input || typeof input !== 'object') {
      return null;
    }
    const result = {};
    overlayKeys.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
        const value = input[key];
        if (value == null || value === '') {
          return;
        }
        if (key === 'opacity') {
          const numeric = Number(value);
          if (Number.isFinite(numeric)) {
            result.opacity = numeric;
          }
        } else {
          result[key] = String(value);
        }
      }
    });
    return Object.keys(result).length ? result : null;
  };

  const sanitiseCanvas = (input) => {
    if (!input || typeof input !== 'object') {
      return null;
    }
    const result = {};
    canvasKeys.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
        const value = input[key];
        if (value == null || value === '') {
          return;
        }
        if (key === 'scale') {
          const numeric = Number(value);
          if (Number.isFinite(numeric)) {
            result.scale = numeric;
          }
        } else {
          result[key] = String(value);
        }
      }
    });
    return Object.keys(result).length ? result : null;
  };

  const normaliseCycleTriggers = (entry) => {
    const triggers = new Set();
    const append = (value) => {
      const key = String(value || '').trim().toLowerCase();
      if (!key) {
        return;
      }
      if (key === 'focus' || key === 'hover') {
        triggers.add('focus');
      } else if (key === 'click' || key === 'press') {
        triggers.add('click');
      } else if (key === 'interaction' || key === 'cycle') {
        triggers.add('interaction');
      }
    };
    if (!entry) {
      return triggers;
    }
    if (Array.isArray(entry)) {
      entry.forEach(append);
    } else if (entry instanceof Set) {
      entry.forEach(append);
    } else {
      parseList(entry).forEach(append);
    }
    if (entry && typeof entry === 'object') {
      if (entry.cycleOnFocus) {
        append('focus');
      }
      if (entry.cycleOnClick) {
        append('click');
      }
    }
    return triggers;
  };

  const normaliseOverrideEntry = (entry) => {
    if (!entry || typeof entry !== 'object') {
      return null;
    }
    const normalised = {};
    if (entry.selector) {
      normalised.selector = String(entry.selector);
    }
    if (entry.exclude || entry.excludes) {
      normalised.exclude = String(entry.exclude || entry.excludes);
    }
    if (typeof entry.mode === 'string') {
      const mode = entry.mode.trim().toLowerCase();
      if (mode === 'video' || mode === 'image' || mode === 'auto') {
        normalised.mode = mode;
      }
    }
    if (entry.palette) {
      normalised.palette = String(entry.palette);
    }
    if (entry.seedOffset != null) {
      const offset = Number(entry.seedOffset);
      if (Number.isFinite(offset)) {
        normalised.seedOffset = Math.trunc(offset);
      }
    }
    const images = parseList(entry.images || entry.image || entry.assets);
    if (images.length) {
      normalised.images = images;
    }
    const videos = parseList(entry.videos || entry.video);
    if (videos.length) {
      normalised.videos = videos;
    }
    const overlay = sanitiseOverlay(entry.overlay || entry.brandOverlay);
    if (overlay) {
      normalised.overlay = overlay;
    }
    const canvas = sanitiseCanvas(entry.canvas || entry.brandCanvas);
    if (canvas) {
      normalised.canvas = canvas;
    }
    const triggers = normaliseCycleTriggers(entry.cycle || entry.cycles || entry.cycleTriggers);
    if (triggers.size) {
      normalised.cycleTriggers = triggers;
    }
    if (entry.cycleStep != null) {
      const step = Number(entry.cycleStep);
      if (Number.isFinite(step)) {
        normalised.cycleStep = step;
      }
    }
    return normalised;
  };

  const mergeOverride = (target, source) => {
    if (!source) {
      return target;
    }
    if (source.mode) {
      target.mode = source.mode;
    }
    if (source.palette) {
      target.palette = source.palette;
    }
    if (source.seedOffset != null) {
      target.seedOffset = (target.seedOffset || 0) + source.seedOffset;
    }
    if (Array.isArray(source.images) && source.images.length) {
      target.images = (target.images || []).concat(source.images);
    }
    if (Array.isArray(source.videos) && source.videos.length) {
      target.videos = (target.videos || []).concat(source.videos);
    }
    if (source.overlay) {
      target.overlay = { ...(target.overlay || {}), ...source.overlay };
    }
    if (source.canvas) {
      target.canvas = { ...(target.canvas || {}), ...source.canvas };
    }
    if (source.cycleTriggers instanceof Set && source.cycleTriggers.size) {
      if (!(target.cycleTriggers instanceof Set)) {
        target.cycleTriggers = new Set();
      }
      source.cycleTriggers.forEach((trigger) => target.cycleTriggers.add(trigger));
    }
    if (source.cycleStep != null && Number.isFinite(source.cycleStep)) {
      target.cycleStep = Number(source.cycleStep);
    }
    return target;
  };

  const parseDatasetOverride = (element) => {
    if (!(element instanceof HTMLElement)) {
      return null;
    }
    const { dataset } = element;
    if (!dataset) {
      return null;
    }
    const override = {};
    const modeValue = dataset.brandMode || dataset.brandAssetMode;
    if (modeValue) {
      const mode = modeValue.trim().toLowerCase();
      if (mode === 'video' || mode === 'image' || mode === 'auto') {
        override.mode = mode;
      }
    }
    if (dataset.brandPalette) {
      override.palette = dataset.brandPalette.trim();
    }
    if (dataset.brandSeedOffset != null || dataset.brandSeed != null) {
      const offsetValue = dataset.brandSeedOffset ?? dataset.brandSeed;
      const offset = Number(offsetValue);
      if (Number.isFinite(offset)) {
        override.seedOffset = Math.trunc(offset);
      }
    }
    const imageList = parseList(dataset.brandImages || dataset.brandImageSrc || dataset.brandImage);
    if (imageList.length) {
      override.images = imageList;
    }
    const videoList = parseList(dataset.brandVideos || dataset.brandVideoSrc || dataset.brandVideoUrl);
    if (videoList.length) {
      override.videos = videoList;
    }
    const overlay = sanitiseOverlay({
      blend: dataset.brandOverlayBlend,
      filter: dataset.brandOverlayFilter,
      opacity: dataset.brandOverlayOpacity,
      rotate: dataset.brandOverlayRotate,
      depth: dataset.brandOverlayDepth
    });
    if (overlay) {
      override.overlay = overlay;
    }
    const canvas = sanitiseCanvas({
      scale: dataset.cardCanvasScale,
      depth: dataset.cardCanvasDepth
    });
    if (canvas) {
      override.canvas = canvas;
    }
    const triggers = normaliseCycleTriggers([
      dataset.brandCycle,
      dataset.brandCycleOnFocus === 'true' ? 'focus' : '',
      dataset.brandCycleOnClick === 'true' ? 'click' : ''
    ]);
    if (triggers.size) {
      override.cycleTriggers = triggers;
    }
    if (dataset.brandCycleStep != null) {
      const step = Number(dataset.brandCycleStep);
      if (Number.isFinite(step)) {
        override.cycleStep = step;
      }
    }
    const hasContent = Boolean(
      override.mode ||
      override.palette ||
      override.seedOffset != null ||
      (override.images && override.images.length) ||
      (override.videos && override.videos.length) ||
      override.overlay ||
      override.canvas ||
      (override.cycleTriggers && override.cycleTriggers.size)
    );
    return hasContent ? override : null;
  };

  const collect = (element) => {
    if (!(element instanceof HTMLElement)) {
      return null;
    }
    const aggregate = {};
    const globalOverrides = getGlobalOverrides();
    globalOverrides.forEach((entry) => {
      if (entry.selector && !element.matches(entry.selector)) {
        return;
      }
      if (entry.exclude && element.matches(entry.exclude)) {
        return;
      }
      mergeOverride(aggregate, entry);
    });
    mergeOverride(aggregate, parseDatasetOverride(element));
    const hasContent = Boolean(
      aggregate.mode ||
      aggregate.palette ||
      aggregate.seedOffset != null ||
      (aggregate.images && aggregate.images.length) ||
      (aggregate.videos && aggregate.videos.length) ||
      aggregate.overlay ||
      aggregate.canvas ||
      (aggregate.cycleTriggers && aggregate.cycleTriggers.size)
    );
    if (!hasContent) {
      return null;
    }
    if (aggregate.images) {
      aggregate.images = Array.from(new Set(aggregate.images));
    }
    if (aggregate.videos) {
      aggregate.videos = Array.from(new Set(aggregate.videos));
    }
    return aggregate;
  };

  const mergeOverlaySettings = (base, override) => {
    const result = { ...(base || {}) };
    if (override) {
      overlayKeys.forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(override, key) && override[key] != null) {
          result[key] = override[key];
        }
      });
    }
    return result;
  };

  const mergeCanvasSettings = (base, override) => {
    const result = { ...(base || {}) };
    if (override) {
      canvasKeys.forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(override, key) && override[key] != null) {
          result[key] = override[key];
        }
      });
    }
    return result;
  };

  const resolveMode = (overrides, fallback) => {
    if (!overrides || !overrides.mode || overrides.mode === 'auto') {
      return fallback;
    }
    if (overrides.mode === 'video') {
      return true;
    }
    if (overrides.mode === 'image') {
      return false;
    }
    return fallback;
  };

  const applyPalette = (overrides, fallback) => {
    if (overrides && overrides.palette) {
      return overrides.palette;
    }
    return fallback;
  };

  const pickAsset = (overrides, type, index, fallback) => {
    const listKey = type === 'videos' ? 'videos' : 'images';
    const list = overrides && overrides[listKey];
    const seedOffset = overrides && overrides.seedOffset ? overrides.seedOffset : 0;
    const effectiveIndex = Number.isFinite(index) ? index + seedOffset : seedOffset;
    if (Array.isArray(list) && list.length) {
      const position = ((effectiveIndex % list.length) + list.length) % list.length;
      return list[position] || null;
    }
    if (typeof fallback === 'function') {
      return fallback(effectiveIndex);
    }
    return null;
  };

  const shouldCycle = (overrides, trigger) => {
    if (!overrides || !(overrides.cycleTriggers instanceof Set)) {
      return false;
    }
    const key = trigger === 'hover' ? 'focus' : trigger;
    return overrides.cycleTriggers.has(key);
  };

  const nextCycleIndex = (overrides, current) => {
    const step = overrides && Number.isFinite(overrides.cycleStep) ? overrides.cycleStep : 1;
    return (Number.isFinite(current) ? current : 0) + step;
  };

  const hasAssetList = (overrides, type) => {
    const listKey = type === 'videos' ? 'videos' : 'images';
    return Array.isArray(overrides?.[listKey]) && overrides[listKey].length > 0;
  };

  const api = {
    collect,
    mergeOverlaySettings,
    mergeCanvasSettings,
    resolveMode,
    pickAsset,
    shouldCycle,
    nextCycleIndex,
    applyPalette,
    hasAssetList,
    refresh: refreshGlobalOverrides,
    eventName: BRAND_OVERRIDE_EVENT,
    events: BRAND_OVERRIDE_EVENTS
  };

  window.__CSS_WEB_MASTER_BRAND_OVERRIDE_EVENT = BRAND_OVERRIDE_EVENT;
  window.__CLEAR_SEAS_BRAND_OVERRIDE_EVENT = resolvedClearSeasBrandEvent;
  window.__CSS_WEB_MASTER_BRAND_OVERRIDE_API = api;
  window.__CLEAR_SEAS_BRAND_OVERRIDE_API = api;
  cssWebMasterGlobals.brandOverrideApi = api;
  return api;
})();

function detectActivePageProfile() {
  const resolved = resolvePageProfile();
  const brandPackage = syncBrandAssets(resolved?.siteCode || resolved?.requestedSiteCode || null);

  const profile = {
    key: resolved?.key || 'core-foundation',
    palette: resolved?.palette || 'foundation',
    paletteKey: resolved?.paletteKey || resolved?.palette || 'foundation',
    family: resolved?.family || resolved?.key || 'core-foundation',
    layout: resolved?.layout || 'grid',
    accent: resolved?.accent || null,
    videoPattern: resolved?.videoPattern || null,
    imageOrder: resolved?.imageOrder || null,
    videoOrder: resolved?.videoOrder || null,
    overlay: resolved?.overlay || {},
    canvas: resolved?.canvas || {},
    scripts: Array.isArray(resolved?.scripts) ? [...resolved.scripts] : [],
    signature: resolved?.signature || '',
    seed: resolved?.seed || 0,
    siteCode: resolved?.siteCode || null,
    requestedSiteCode: resolved?.requestedSiteCode || null,
    brandAssetKey: brandAssetKey
  };

  profile.imageSeed = brandPackage.images.length ? profile.seed % brandPackage.images.length : 0;
  profile.videoSeed = brandPackage.videos.length ? Math.floor(profile.seed / 7) % brandPackage.videos.length : 0;

  if (resolved?.metaName === 'ultimate-clear-seas-holistic-system.html') {
    profile.scripts.push('scripts/ultimate-holistic-vib34d-system.js');
  }

  applyProfileMetadata(profile);
  window.__CLEAR_SEAS_PAGE_PROFILE = profile;
  window.__CSS_WEB_MASTER_PAGE_PROFILE = profile;
  cssWebMasterGlobals.pageProfile = profile;
  cssWebMasterGlobals.siteCode = profile.siteCode || null;
  cssWebMasterGlobals.paletteKey = profile.paletteKey || profile.palette;
  return profile;
}

activePageProfile = detectActivePageProfile();

const registerAssetManifest = (input, detail = {}) => {
  if (!input || typeof input !== 'object') {
    return updateManifestSnapshot();
  }

  mergeAssetManifest(input);
  const snapshot = updateManifestSnapshot();

  const detailPayload = {
    reason: (detail && typeof detail === 'object' && detail.reason) || 'asset-manifest-update',
    timestamp: Date.now()
  };
  if (detail && typeof detail === 'object') {
    Object.keys(detail).forEach((key) => {
      if (key === 'reason') {
        return;
      }
      detailPayload[key] = detail[key];
    });
  }

  const currentSiteCode =
    (activePageProfile && (activePageProfile.siteCode || activePageProfile.requestedSiteCode)) || null;
  syncBrandAssets(currentSiteCode);

  if (activePageProfile) {
    activePageProfile.brandAssetKey = brandAssetKey;
    activePageProfile.imageSeed = brandAssets.images.length
      ? activePageProfile.seed % brandAssets.images.length
      : 0;
    activePageProfile.videoSeed = brandAssets.videos.length
      ? Math.floor(activePageProfile.seed / 7) % brandAssets.videos.length
      : 0;
    cssWebMasterGlobals.pageProfile = activePageProfile;
  }

  BRAND_OVERRIDE_EVENTS.forEach((eventName) => {
    window.dispatchEvent(new CustomEvent(eventName, { detail: detailPayload }));
  });

  return snapshot;
};

cssWebMasterGlobals.registerAssetManifest = registerAssetManifest;
window.__CSS_WEB_MASTER_REGISTER_ASSET_MANIFEST = registerAssetManifest;
window.__CLEAR_SEAS_REGISTER_ASSET_MANIFEST = registerAssetManifest;

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
    sharedMotion.family = profile.family || null;
    sharedMotion.layout = profile.layout || null;
    sharedMotion.siteCode = profile.siteCode || null;
  }
}

const stylesLoaded = new Set();
const scriptsLoaded = new Map();
const cardStates = new Map();

function refreshAllCardOverrides(options = {}) {
  const { resetCycle = false } = options || {};
  cardStates.forEach((state) => {
    if (!state || !state.element) {
      return;
    }
    state.overrides = brandOverrideApi.collect(state.element);
    if (resetCycle) {
      state.assetCycle = 0;
    }
    state.overlay = ensureBrandLayer(state);
  });
}

const handleBrandOverridesUpdated = () => {
  refreshAllCardOverrides({ resetCycle: true });
};
BRAND_OVERRIDE_EVENTS.forEach((eventName) => {
  window.addEventListener(eventName, handleBrandOverridesUpdated);
});
const groupStates = new Map();
let activeCardState = null;
let rafId = null;

const globalState = {
  scroll: {
    current: 0,
    target: 0,
    lastY: window.scrollY || 0,
    lastTime: performance.now(),
    direction: 0,
    speed: 0
  },
  synergy: { current: 0, target: 0 },
  focus: {
    currentX: 0.5,
    currentY: 0.5,
    currentAmount: 0,
    targetX: 0.5,
    targetY: 0.5,
    targetAmount: 0,
    trend: 0,
    lastAmount: 0
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

const DEFAULT_MOTION_STATE = {
  focus: { x: 0.5, y: 0.5, amount: 0 },
  tilt: { x: 0, y: 0, strength: 0 },
  bend: 0,
  warp: 0,
  scroll: 0,
  scrollDirection: 0,
  scrollSpeed: 0,
  focusTrend: 0,
  tiltSkew: 0,
  synergy: 0,
  palette: null,
  collection: null,
  family: null,
  layout: null,
  siteCode: null,
  updatedAt: performance.now(),
  eventName: GLOBAL_MOTION_EVENT
};

const existingMotionState = window.__CSS_WEB_MASTER_GLOBAL_MOTION || window.__CLEAR_SEAS_GLOBAL_MOTION;
const sharedMotion = existingMotionState && typeof existingMotionState === 'object' ? existingMotionState : {};
sharedMotion.focus = { ...DEFAULT_MOTION_STATE.focus, ...(sharedMotion.focus || {}) };
sharedMotion.tilt = { ...DEFAULT_MOTION_STATE.tilt, ...(sharedMotion.tilt || {}) };
sharedMotion.bend = Number.isFinite(sharedMotion.bend) ? sharedMotion.bend : DEFAULT_MOTION_STATE.bend;
sharedMotion.warp = Number.isFinite(sharedMotion.warp) ? sharedMotion.warp : DEFAULT_MOTION_STATE.warp;
sharedMotion.scroll = Number.isFinite(sharedMotion.scroll) ? sharedMotion.scroll : DEFAULT_MOTION_STATE.scroll;
sharedMotion.scrollDirection = Number.isFinite(sharedMotion.scrollDirection)
  ? sharedMotion.scrollDirection
  : DEFAULT_MOTION_STATE.scrollDirection;
sharedMotion.scrollSpeed = Number.isFinite(sharedMotion.scrollSpeed)
  ? sharedMotion.scrollSpeed
  : DEFAULT_MOTION_STATE.scrollSpeed;
sharedMotion.focusTrend = Number.isFinite(sharedMotion.focusTrend)
  ? sharedMotion.focusTrend
  : DEFAULT_MOTION_STATE.focusTrend;
sharedMotion.tiltSkew = Number.isFinite(sharedMotion.tiltSkew) ? sharedMotion.tiltSkew : DEFAULT_MOTION_STATE.tiltSkew;
sharedMotion.synergy = Number.isFinite(sharedMotion.synergy) ? sharedMotion.synergy : DEFAULT_MOTION_STATE.synergy;
sharedMotion.palette = sharedMotion.palette ?? DEFAULT_MOTION_STATE.palette;
sharedMotion.collection = sharedMotion.collection ?? DEFAULT_MOTION_STATE.collection;
sharedMotion.family = sharedMotion.family ?? DEFAULT_MOTION_STATE.family;
sharedMotion.layout = sharedMotion.layout ?? DEFAULT_MOTION_STATE.layout;
sharedMotion.siteCode = sharedMotion.siteCode ?? DEFAULT_MOTION_STATE.siteCode;
sharedMotion.updatedAt = sharedMotion.updatedAt ?? DEFAULT_MOTION_STATE.updatedAt;
sharedMotion.eventName = GLOBAL_MOTION_EVENT;
window.__CSS_WEB_MASTER_GLOBAL_MOTION = sharedMotion;
window.__CLEAR_SEAS_GLOBAL_MOTION = sharedMotion;
cssWebMasterGlobals.motionState = sharedMotion;

const motionEventState = {
  lastDispatch: 0,
  lastDetail: null
};

function shouldDispatchMotionEvent(previous, next) {
  if (!previous) {
    return true;
  }

  const thresholds = {
    focusX: 0.0012,
    focusY: 0.0012,
    focusAmount: 0.0012,
    focusTrend: 0.0006,
    tiltX: 0.001,
    tiltY: 0.001,
    tiltStrength: 0.001,
    tiltSkew: 0.001,
    bend: 0.001,
    warp: 0.001,
    scrollMomentum: 0.001,
    scrollSpeed: 0.001,
    scrollDirection: 0.51,
    synergy: 0.001
  };

  return Object.keys(thresholds).some((key) => {
    const delta = Math.abs((next[key] || 0) - (previous[key] || 0));
    return delta > thresholds[key];
  });
}

function maybeDispatchGlobalMotionEvent() {
  const detail = {
    focusX: sharedMotion.focus.x,
    focusY: sharedMotion.focus.y,
    focusAmount: sharedMotion.focus.amount,
    focusTrend: sharedMotion.focusTrend,
    tiltX: sharedMotion.tilt.x,
    tiltY: sharedMotion.tilt.y,
    tiltStrength: sharedMotion.tilt.strength,
    tiltSkew: sharedMotion.tiltSkew,
    bend: sharedMotion.bend,
    warp: sharedMotion.warp,
    scrollMomentum: sharedMotion.scroll,
    scrollSpeed: sharedMotion.scrollSpeed,
    scrollDirection: sharedMotion.scrollDirection,
    synergy: sharedMotion.synergy,
    palette: sharedMotion.palette,
    collection: sharedMotion.collection,
    timestamp: sharedMotion.updatedAt
  };

  const now = detail.timestamp || performance.now();
  const elapsed = now - motionEventState.lastDispatch;

  if (elapsed < 32 && !shouldDispatchMotionEvent(motionEventState.lastDetail, detail)) {
    return;
  }

  if (!shouldDispatchMotionEvent(motionEventState.lastDetail, detail) && elapsed < 120) {
    return;
  }

  motionEventState.lastDetail = { ...detail };
  motionEventState.lastDispatch = now;
  GLOBAL_MOTION_EVENTS.forEach((eventName) => {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
  });
}

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

  const overlaySettings = brandOverrideApi.mergeOverlaySettings(
    activePageProfile.overlay || {},
    state.overrides ? state.overrides.overlay : null
  );

  const canvasSettings = brandOverrideApi.mergeCanvasSettings(
    activePageProfile.canvas || {},
    state.overrides ? state.overrides.canvas : null
  );

  const palette = brandOverrideApi.applyPalette(state.overrides, activePageProfile.palette);
  card.dataset.brandPalette = palette;
  card.style.setProperty('--brand-overlay-opacity', overlaySettings.opacity != null ? String(overlaySettings.opacity) : '1');
  card.style.setProperty('--brand-overlay-filter', overlaySettings.filter || 'brightness(1)');
  card.style.setProperty('--brand-overlay-blend', overlaySettings.blend || 'screen');
  card.style.setProperty('--brand-overlay-rotate', overlaySettings.rotate || '0deg');
  card.style.setProperty('--brand-overlay-depth', overlaySettings.depth || '0px');
  if (canvasSettings.scale != null) {
    card.style.setProperty('--card-canvas-scale', String(canvasSettings.scale));
  }
  if (canvasSettings.depth) {
    card.style.setProperty('--card-canvas-depth', canvasSettings.depth);
  }

  const preferVideo = brandOverrideApi.resolveMode(state.overrides, shouldPreferVideo(state));
  const cycleIndex = state.index + (state.assetCycle || 0);
  let videoSource = null;
  let imageSource = null;

  if (preferVideo) {
    videoSource = brandOverrideApi.pickAsset(state.overrides, 'videos', cycleIndex, (index) => pickBrandVideo(index));
    if (!videoSource) {
      imageSource = brandOverrideApi.pickAsset(state.overrides, 'images', cycleIndex, (index) => pickBrandImage(index));
    }
  } else {
    imageSource = brandOverrideApi.pickAsset(state.overrides, 'images', cycleIndex, (index) => pickBrandImage(index));
    if (!imageSource) {
      videoSource = brandOverrideApi.pickAsset(state.overrides, 'videos', cycleIndex, (index) => pickBrandVideo(index));
    }
  }

  overlay.dataset.brandIndex = state.index;
  overlay.dataset.brandPalette = palette;
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
  const overrides = brandOverrideApi.collect(element);
  const state = {
    element,
    index,
    overrides,
    assetCycle: 0,
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
  if (brandOverrideApi.shouldCycle(state.overrides, 'focus')) {
    state.assetCycle = brandOverrideApi.nextCycleIndex(state.overrides, state.assetCycle);
    state.overlay = ensureBrandLayer(state);
  }
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
  if (brandOverrideApi.shouldCycle(state.overrides, 'click')) {
    state.assetCycle = brandOverrideApi.nextCycleIndex(state.overrides, state.assetCycle);
    state.overlay = ensureBrandLayer(state);
  }
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

  const focusX = totalFocus > 0 ? weightedX / totalFocus : 0.5;
  const focusY = totalFocus > 0 ? weightedY / totalFocus : 0.5;
  const focusAmount = Math.min(1, totalFocus);
  globalState.focus.targetX = focusX;
  globalState.focus.targetY = focusY;
  globalState.focus.targetAmount = focusAmount;

  const focusPresence = focusAmount > 0.08;
  const scrollEnergy = Math.abs(globalState.scroll.current);
  const tiltBase = focusPresence ? 0.35 + globalState.synergy.current * 0.2 : 0;
  const scrollInfluence = focusPresence ? globalState.scroll.current * 0.06 : 0;

  if (focusPresence || scrollEnergy > 0.08) {
    globalState.tilt.targetX = (focusX - 0.5) * tiltBase + scrollInfluence;
    globalState.tilt.targetY = (0.5 - focusY) * tiltBase - scrollInfluence * 0.6;
  } else {
    globalState.tilt.targetX = 0;
    globalState.tilt.targetY = 0;
  }

  const synergyWeight = globalState.synergy.current * 0.35;
  const momentumWeight = Math.min(0.3, scrollEnergy * 0.5);
  const bendBase = focusPresence ? focusAmount * 0.45 : 0;
  globalState.bend.target = Math.min(0.6, bendBase + synergyWeight + momentumWeight);

  const tiltDelta = (globalState.tilt.targetX - globalState.tilt.targetY) * 0.22;
  globalState.warp.target = Math.max(-0.35, Math.min(0.35, tiltDelta));

  globalState.focus.currentX += (globalState.focus.targetX - globalState.focus.currentX) * 0.12;
  globalState.focus.currentY += (globalState.focus.targetY - globalState.focus.currentY) * 0.12;
  globalState.focus.currentAmount += (globalState.focus.targetAmount - globalState.focus.currentAmount) * 0.12;
  globalState.tilt.currentX += (globalState.tilt.targetX - globalState.tilt.currentX) * 0.16;
  globalState.tilt.currentY += (globalState.tilt.targetY - globalState.tilt.currentY) * 0.16;
  globalState.bend.current += (globalState.bend.target - globalState.bend.current) * 0.14;
  globalState.warp.current += (globalState.warp.target - globalState.warp.current) * 0.14;

  const tiltMagnitude = Math.sqrt((globalState.tilt.currentX ** 2) + (globalState.tilt.currentY ** 2)) * 0.6;
  const tiltStrength = Math.min(0.45, tiltMagnitude + globalState.bend.current * 0.3);

  const focusDelta = globalState.focus.currentAmount - globalState.focus.lastAmount;
  globalState.focus.trend += (focusDelta - globalState.focus.trend) * 0.28;
  globalState.focus.lastAmount = globalState.focus.currentAmount;

  globalState.scroll.speed += (Math.abs(globalState.scroll.current) - globalState.scroll.speed) * 0.25;
  globalState.scroll.direction = Math.abs(globalState.scroll.current) < 0.0001 ? 0 : (globalState.scroll.current > 0 ? 1 : -1);
  const scrollDirection = globalState.scroll.direction;
  const scrollSpeed = Math.min(1, Math.max(0, globalState.scroll.speed));
  const focusTrend = globalState.focus.trend;
  const tiltSkew = globalState.tilt.currentX - globalState.tilt.currentY;

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
  root.style.setProperty('--global-scroll-tilt', `${(globalState.scroll.current * 6).toFixed(3)}deg`);
  root.style.setProperty('--global-synergy-glow', globalState.synergy.current.toFixed(4));
  root.style.setProperty('--global-focus-x', globalState.focus.currentX.toFixed(4));
  root.style.setProperty('--global-focus-y', globalState.focus.currentY.toFixed(4));
  root.style.setProperty('--global-focus-amount', globalState.focus.currentAmount.toFixed(4));
  root.style.setProperty('--global-bend-intensity', globalState.bend.current.toFixed(4));
  root.style.setProperty('--global-tilt-x', globalState.tilt.currentX.toFixed(4));
  root.style.setProperty('--global-tilt-y', globalState.tilt.currentY.toFixed(4));
  root.style.setProperty('--global-tilt-strength', tiltStrength.toFixed(4));
  root.style.setProperty('--global-tilt-skew', tiltSkew.toFixed(4));
  root.style.setProperty('--global-warp', globalState.warp.current.toFixed(4));
  root.style.setProperty('--global-focus-trend', focusTrend.toFixed(4));
  root.style.setProperty('--global-scroll-speed', scrollSpeed.toFixed(4));
  root.style.setProperty('--global-scroll-direction', scrollDirection.toFixed(0));

  sharedMotion.focus.x = globalState.focus.currentX;
  sharedMotion.focus.y = globalState.focus.currentY;
  sharedMotion.focus.amount = globalState.focus.currentAmount;
  sharedMotion.tilt.x = globalState.tilt.currentX;
  sharedMotion.tilt.y = globalState.tilt.currentY;
  sharedMotion.tilt.strength = tiltStrength;
  sharedMotion.bend = globalState.bend.current;
  sharedMotion.warp = globalState.warp.current;
  sharedMotion.scroll = globalState.scroll.current;
  sharedMotion.scrollDirection = scrollDirection;
  sharedMotion.scrollSpeed = scrollSpeed;
  sharedMotion.synergy = globalState.synergy.current;
  sharedMotion.focusTrend = focusTrend;
  sharedMotion.tiltSkew = tiltSkew;
  sharedMotion.updatedAt = performance.now();

  maybeDispatchGlobalMotionEvent();

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
  if (Math.abs(globalState.scroll.target) > 0.0001) {
    globalState.scroll.direction = globalState.scroll.target > 0 ? 1 : -1;
  }
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

const GLOBAL_CARD_MOTION_ENABLE_ATTRIBUTE = 'data-enable-global-card-motion';
const GLOBAL_CARD_MOTION_DISABLE_ATTRIBUTE = 'data-disable-global-card-motion';
let hasLoggedGlobalMotionDisabled = false;

function elementHasTruthyDataAttribute(element, attribute) {
  if (!element || !element.hasAttribute(attribute)) {
    return false;
  }
  const rawValue = element.getAttribute(attribute);
  if (rawValue === null) {
    return false;
  }
  const value = rawValue.trim().toLowerCase();
  return value === '' || value === 'true' || value === '1' || value === attribute;
}

function resolveCardMotionGateElements() {
  const elements = [document.documentElement];
  if (document.body) {
    elements.push(document.body);
  }
  return elements.filter(Boolean);
}

function isGlobalCardMotionOptedIn() {
  const gateElements = resolveCardMotionGateElements();
  const hasOptOut = gateElements.some((element) =>
    elementHasTruthyDataAttribute(element, GLOBAL_CARD_MOTION_DISABLE_ATTRIBUTE)
  );
  if (hasOptOut) {
    return false;
  }
  return true;
}

function logGlobalMotionDisabled(reason) {
  if (hasLoggedGlobalMotionDisabled) {
    return;
  }
  hasLoggedGlobalMotionDisabled = true;
  try {
    console.info(`⏸️ Global card orchestrator disabled: ${reason}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('Global card orchestrator disabled.');
  }
}

async function initialise() {
  preparePageProfile(activePageProfile);
  ensureStylesheet('styles/global-card-synergy.css', 'global-card-synergy');
  await ensureCardSystem();
  if (window.cardSystemController && typeof window.cardSystemController.startGlobalMotionBroadcast === 'function') {
    window.cardSystemController.startGlobalMotionBroadcast();
  }
}

const maybeInitialise = () => {
  if (isGlobalCardMotionOptedIn()) {
    initialise();
  } else {
    logGlobalMotionDisabled(
      `remove ${GLOBAL_CARD_MOTION_DISABLE_ATTRIBUTE} from <html> or <body> to re-enable.`
    );
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', maybeInitialise, { once: true });
} else {
  maybeInitialise();
}
