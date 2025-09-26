/**
 * Brand Asset Manifest
 * Centralises imagery and video metadata so every Clear Seas build can
 * coordinate overlays, canvases, and motion parameters from a single source.
 */

const imageManifest = [
  {
    id: 'glacial-orbit-panorama',
    src: 'assets/Screenshot_20250430-141821.png',
    palettes: ['foundation', 'meta'],
    accent: '#8ad7ff',
    blend: 'screen',
    depth: '18px',
    rotate: '3deg',
    tiltBias: 0.12
  },
  {
    id: 'luminous-strata',
    src: 'assets/Screenshot_20241012-073718.png',
    palettes: ['foundation', 'immersive'],
    accent: '#ffd7ff',
    blend: 'soft-light',
    depth: '22px',
    rotate: '-4deg',
    tiltBias: -0.06
  },
  {
    id: 'violet-surge',
    src: 'assets/Screenshot_20250430-142024~2.png',
    palettes: ['concept', 'immersive'],
    accent: '#e7b5ff',
    blend: 'color-dodge',
    depth: '28px',
    rotate: '7deg',
    tiltBias: 0.18
  },
  {
    id: 'cyan-ribbon',
    src: 'assets/Screenshot_20250430-142002~2.png',
    palettes: ['foundation', 'concept'],
    accent: '#a2f4ff',
    blend: 'screen',
    depth: '16px',
    rotate: '-6deg',
    tiltBias: -0.08
  },
  {
    id: 'ember-halo',
    src: 'assets/Screenshot_20250430-142032~2.png',
    palettes: ['meta', 'immersive'],
    accent: '#ffc89a',
    blend: 'plus-lighter',
    depth: '24px',
    rotate: '5deg',
    tiltBias: 0.22
  },
  {
    id: 'signal-grid-a',
    src: 'assets/file_00000000fc08623085668cf8b5e0a1e5.png',
    palettes: ['foundation', 'immersive'],
    accent: '#8df0ff',
    blend: 'overlay',
    depth: '20px',
    rotate: '-3deg',
    tiltBias: 0.04
  },
  {
    id: 'signal-grid-b',
    src: 'assets/file_0000000054a06230817873012865d150.png',
    palettes: ['concept', 'meta'],
    accent: '#ffbff5',
    blend: 'color-dodge',
    depth: '26px',
    rotate: '9deg',
    tiltBias: 0.16
  },
  {
    id: 'signal-grid-c',
    src: 'assets/file_0000000006fc6230a8336bfa1fcebd89.png',
    palettes: ['foundation'],
    accent: '#9fe2ff',
    blend: 'screen',
    depth: '18px',
    rotate: '-2deg',
    tiltBias: -0.04
  },
  {
    id: 'aurora-shards',
    src: 'assets/image_8 (1).png',
    palettes: ['concept', 'meta'],
    accent: '#ffd7ff',
    blend: 'soft-light',
    depth: '30px',
    rotate: '11deg',
    tiltBias: 0.28
  }
];

const videoManifest = [
  {
    id: 'neon-blossom',
    src: '20250505_1321_Neon Blossom Transformation_simple_compose_01jtgqf5vjevn8nbrnsx8yd5fs.mp4',
    palettes: ['concept', 'meta'],
    accent: '#ffc9ff',
    blend: 'screen',
    depth: '34px',
    rotate: '12deg',
    playback: { min: 0.9, max: 1.25 },
    tiltBias: 0.24
  },
  {
    id: 'noir-filament',
    src: '20250505_1726_Noir Filament Mystery_simple_compose_01jth5f1kwe9r9zxqet54bz3q0.mp4',
    palettes: ['immersive', 'meta'],
    accent: '#a8dcff',
    blend: 'color-dodge',
    depth: '32px',
    rotate: '-8deg',
    playback: { min: 0.8, max: 1.2 },
    tiltBias: -0.18
  },
  {
    id: 'gemstone-coral-a',
    src: '20250506_0014_Gemstone Coral Transformation_remix_01jthwv071e06vmjd0mn60zm3s.mp4',
    palettes: ['foundation', 'immersive'],
    accent: '#ffe4b2',
    blend: 'soft-light',
    depth: '30px',
    rotate: '6deg',
    playback: { min: 0.85, max: 1.15 },
    tiltBias: 0.1
  },
  {
    id: 'gemstone-coral-b',
    src: '20250506_0014_Gemstone Coral Transformation_remix_01jthwv0c4fxk8m0e79ry2t4ke.mp4',
    palettes: ['foundation', 'concept'],
    accent: '#ffd3c8',
    blend: 'screen',
    depth: '30px',
    rotate: '-5deg',
    playback: { min: 0.9, max: 1.22 },
    tiltBias: -0.06
  },
  {
    id: 'hydrolux-wave',
    src: '1746496560073.mp4',
    palettes: ['foundation', 'immersive'],
    accent: '#8be3ff',
    blend: 'overlay',
    depth: '28px',
    rotate: '4deg',
    playback: { min: 0.95, max: 1.3 },
    tiltBias: 0.08
  },
  {
    id: 'prismatic-tide',
    src: '1746500614769.mp4',
    palettes: ['concept', 'meta'],
    accent: '#ffb8f8',
    blend: 'plus-lighter',
    depth: '36px',
    rotate: '-10deg',
    playback: { min: 0.88, max: 1.28 },
    tiltBias: 0.2
  },
  {
    id: 'harmonic-rift',
    src: '1746576068221.mp4',
    palettes: ['immersive', 'meta'],
    accent: '#9dd8ff',
    blend: 'color-dodge',
    depth: '32px',
    rotate: '9deg',
    playback: { min: 0.92, max: 1.18 },
    tiltBias: -0.12
  }
];

function normaliseAssetEntry(entry) {
  if (!entry) {
    return null;
  }
  if (typeof entry === 'string') {
    return { src: entry };
  }
  if (typeof entry === 'object') {
    const normalised = { ...entry };
    if (!normalised.src && normalised.path) {
      normalised.src = normalised.path;
    }
    return normalised.src ? normalised : null;
  }
  return null;
}

function normaliseAssetList(list) {
  return (Array.isArray(list) ? list : [])
    .map(normaliseAssetEntry)
    .filter(Boolean);
}

function mergeAssetLists(baseList, incoming) {
  const map = new Map();
  normaliseAssetList(baseList).forEach((asset) => {
    if (asset?.src) {
      map.set(asset.src, { ...asset });
    }
  });
  normaliseAssetList(incoming).forEach((asset) => {
    if (asset?.src) {
      map.set(asset.src, { ...asset });
    }
  });
  return Array.from(map.values());
}

function selectBrandAsset({ assets, order, seed = 0, offset = 0, palette, preferNeutral = true }) {
  const normalised = normaliseAssetList(assets);
  if (!normalised.length) {
    return null;
  }
  const total = normalised.length;
  const orderedIndices = Array.isArray(order) && order.length
    ? order.map((value) => ((value % total) + total) % total)
    : Array.from({ length: total }, (_, index) => index);
  if (!orderedIndices.length) {
    return null;
  }
  const cycleIndex = (seed + offset) % orderedIndices.length;
  const rotated = orderedIndices.slice(cycleIndex).concat(orderedIndices.slice(0, cycleIndex));

  const matchesPalette = (asset) => {
    if (!palette || !Array.isArray(asset.palettes) || !asset.palettes.length) {
      return false;
    }
    return asset.palettes.includes(palette) || asset.palettes.includes('*');
  };

  const isNeutral = (asset) => !Array.isArray(asset.palettes) || asset.palettes.length === 0;

  const paletteMatchIndex = rotated.find((index) => matchesPalette(normalised[index]));
  const neutralMatchIndex = rotated.find((index) => isNeutral(normalised[index]));
  const fallbackIndex = rotated[0];
  const selectedIndex = paletteMatchIndex ?? (preferNeutral ? (neutralMatchIndex ?? fallbackIndex) : fallbackIndex);
  const selected = normalised[selectedIndex];
  return selected ? { ...selected, __index: selectedIndex } : null;
}

function registerBrandAssetsFromManifest(manifest = { images: imageManifest, videos: videoManifest }) {
  if (typeof window === 'undefined') {
    return manifest;
  }
  const globalAssets = window.__CLEAR_SEAS_BRAND_ASSETS || { images: [], videos: [] };
  globalAssets.images = mergeAssetLists(globalAssets.images, manifest.images);
  globalAssets.videos = mergeAssetLists(globalAssets.videos, manifest.videos);
  window.__CLEAR_SEAS_BRAND_ASSETS = globalAssets;
  window.__CLEAR_SEAS_BRAND_ASSET_MANIFEST = manifest;
  return globalAssets;
}

export const brandAssetManifest = {
  images: imageManifest,
  videos: videoManifest
};

export { normaliseAssetEntry, normaliseAssetList, mergeAssetLists, registerBrandAssetsFromManifest, selectBrandAsset };

if (typeof window !== 'undefined') {
  window.__CLEAR_SEAS_BRAND_ASSET_MANIFEST = brandAssetManifest;
  window.__selectBrandAsset = selectBrandAsset;
  window.__normaliseBrandAssetList = normaliseAssetList;
  window.__registerBrandAssetsFromManifest = registerBrandAssetsFromManifest;
  registerBrandAssetsFromManifest(brandAssetManifest);
}

export default brandAssetManifest;
