const DEFAULT_MANIFEST_KEY = 'default';

const sharedImageRotation = [
  {
    src: 'assets/Screenshot_20250430-141821.png',
    tags: ['hero', 'deck'],
    siteCodes: ['clear-seas', 'css-web-master'],
    label: 'Holographic boardroom spread'
  },
  {
    src: 'assets/Screenshot_20241012-073718.png',
    tags: ['hero', 'canvas'],
    siteCodes: ['clear-seas', 'css-web-master'],
    label: 'Noir corridor traversal'
  },
  {
    src: 'assets/Screenshot_20250430-142024~2.png',
    tags: ['gallery', 'diagnostic'],
    siteCodes: ['clear-seas', 'css-web-master'],
    label: 'Mission analytics lens'
  },
  {
    src: 'assets/Screenshot_20250430-142002~2.png',
    tags: ['gallery', 'diagnostic'],
    siteCodes: ['clear-seas', 'css-web-master'],
    label: 'Beacon matrix overlay'
  },
  {
    src: 'assets/Screenshot_20250430-142032~2.png',
    tags: ['gallery', 'diagnostic'],
    siteCodes: ['clear-seas', 'css-web-master'],
    label: 'Ambient lattice grid'
  },
  {
    src: 'assets/file_00000000fc08623085668cf8b5e0a1e5.png',
    tags: ['parserator', 'blueprint'],
    siteCodes: ['clear-seas', 'parserator', 'css-web-master'],
    label: 'Parserator lattice overlay'
  },
  {
    src: 'assets/file_0000000054a06230817873012865d150.png',
    tags: ['parserator', 'blueprint'],
    siteCodes: ['clear-seas', 'parserator', 'css-web-master'],
    label: 'Parserator stage render'
  },
  {
    src: 'assets/file_0000000006fc6230a8336bfa1fcebd89.png',
    tags: ['vib3code', 'waveform'],
    siteCodes: ['clear-seas', 'vib3code', 'css-web-master'],
    label: 'VIB3Code waveform scaffolding'
  },
  {
    src: 'assets/image_8 (1).png',
    tags: ['vib3code', 'waveform'],
    siteCodes: ['clear-seas', 'vib3code', 'css-web-master'],
    label: 'Immersive volumetric sweep'
  }
];

const sharedVideoRotation = [
  {
    src: '20250505_1321_Neon Blossom Transformation_simple_compose_01jtgqf5vjevn8nbrnsx8yd5fs.mp4',
    tags: ['hero', 'glow'],
    siteCodes: ['clear-seas', 'parserator', 'css-web-master'],
    label: 'Neon Blossom Transformation'
  },
  {
    src: '20250505_1726_Noir Filament Mystery_simple_compose_01jth5f1kwe9r9zxqet54bz3q0.mp4',
    tags: ['ambient', 'noir'],
    siteCodes: ['clear-seas', 'css-web-master'],
    label: 'Noir Filament Mystery'
  },
  {
    src: '20250506_0014_Gemstone Coral Transformation_remix_01jthwv071e06vmjd0mn60zm3s.mp4',
    tags: ['ambient', 'gemstone'],
    siteCodes: ['clear-seas', 'vib3code', 'css-web-master'],
    label: 'Gemstone Coral Transformation – Remix A'
  },
  {
    src: '20250506_0014_Gemstone Coral Transformation_remix_01jthwv0c4fxk8m0e79ry2t4ke.mp4',
    tags: ['ambient', 'gemstone'],
    siteCodes: ['clear-seas', 'vib3code', 'css-web-master'],
    label: 'Gemstone Coral Transformation – Remix B'
  },
  {
    src: '1746496560073.mp4',
    tags: ['ambient', 'signal'],
    siteCodes: ['clear-seas', 'css-web-master'],
    label: 'Signal lattice burst'
  },
  {
    src: '1746500614769.mp4',
    tags: ['ambient', 'signal'],
    siteCodes: ['clear-seas', 'css-web-master'],
    label: 'Spectral corridor drift'
  },
  {
    src: '1746576068221.mp4',
    tags: ['ambient', 'signal'],
    siteCodes: ['clear-seas', 'css-web-master'],
    label: 'Telemetry bloom pulse'
  }
];

const baseManifest = {
  [DEFAULT_MANIFEST_KEY]: {
    label: 'Clear Seas Core',
    tags: ['clear-seas', 'css-web-master'],
    images: sharedImageRotation,
    videos: sharedVideoRotation
  },
  'clear-seas': {
    extends: 'default',
    tags: ['clear-seas']
  },
  parserator: {
    extends: 'default',
    tags: ['parserator'],
    images: [
      sharedImageRotation[5],
      sharedImageRotation[6]
    ],
    videos: [sharedVideoRotation[0]]
  },
  vib3code: {
    extends: 'default',
    tags: ['vib3code'],
    images: [
      sharedImageRotation[7],
      sharedImageRotation[8]
    ],
    videos: [
      sharedVideoRotation[2],
      sharedVideoRotation[3]
    ]
  }
};

const manifest = Object.create(null);

function normaliseKey(key) {
  return String(key || '')
    .trim()
    .toLowerCase();
}

function normaliseTokenList(value) {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value
      .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
      .filter(Boolean)
      .map((entry) => entry.toLowerCase());
  }
  if (typeof value === 'string') {
    return value
      .split(/[\n,]+/)
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => entry.toLowerCase());
  }
  return [];
}

function normaliseAssetCollection(input, fallback = { list: [], meta: {} }) {
  const list = [];
  const meta = { ...(fallback.meta || {}) };

  const ensureMeta = (src) => {
    if (!meta[src]) {
      meta[src] = {
        tags: [],
        siteCodes: [],
        label: null,
        weight: null
      };
    }
    return meta[src];
  };

  const append = (item) => {
    if (!item) {
      return;
    }
    if (typeof item === 'string') {
      const src = item.trim();
      if (!src) {
        return;
      }
      list.push(src);
      ensureMeta(src);
      return;
    }
    if (typeof item === 'object') {
      const src = typeof item.src === 'string' ? item.src.trim() : typeof item.path === 'string' ? item.path.trim() : '';
      if (!src) {
        return;
      }
      list.push(src);
      const entryMeta = ensureMeta(src);
      const tags = normaliseTokenList(item.tags || item.tag);
      const siteCodes = normaliseTokenList(item.siteCodes || item.siteCode || item.sites || item.site);
      if (tags.length) {
        const set = new Set(entryMeta.tags.map((tag) => tag.toLowerCase()));
        tags.forEach((tag) => set.add(tag));
        entryMeta.tags = Array.from(set);
      }
      if (siteCodes.length) {
        const set = new Set(entryMeta.siteCodes.map((code) => code.toLowerCase()));
        siteCodes.forEach((code) => set.add(code));
        entryMeta.siteCodes = Array.from(set);
      }
      if (typeof item.label === 'string' && item.label.trim()) {
        entryMeta.label = item.label.trim();
      }
      if (Number.isFinite(item.weight)) {
        entryMeta.weight = Number(item.weight);
      }
      return;
    }
  };

  if (Array.isArray(input)) {
    input.forEach((item) => append(item));
  } else if (input != null) {
    append(input);
  }

  return { list, meta };
}

function mergeEntry(entry) {
  if (!entry || typeof entry !== 'object') {
    return;
  }
  const key = normaliseKey(entry.key || entry.siteCode || entry.id || entry.name);
  if (!key) {
    return;
  }
  const existing = manifest[key] || {
    images: [],
    videos: [],
    imagesMeta: {},
    videosMeta: {},
    extends: null,
    tags: []
  };
  const next = { ...existing };

  if (Object.prototype.hasOwnProperty.call(entry, 'extends')) {
    const extendsKey = normaliseKey(entry.extends);
    next.extends = extendsKey && extendsKey !== key ? extendsKey : null;
  }

  if (Object.prototype.hasOwnProperty.call(entry, 'tags')) {
    next.tags = normaliseTokenList(entry.tags);
  }

  if (Object.prototype.hasOwnProperty.call(entry, 'images')) {
    const { list, meta } = normaliseAssetCollection(entry.images);
    next.images = list;
    next.imagesMeta = meta;
  }

  if (Object.prototype.hasOwnProperty.call(entry, 'videos')) {
    const { list, meta } = normaliseAssetCollection(entry.videos);
    next.videos = list;
    next.videosMeta = meta;
  }

  manifest[key] = next;
}

export function mergeAssetManifest(source) {
  if (!source || typeof source !== 'object') {
    return;
  }

  if (Array.isArray(source)) {
    source.forEach((entry) => mergeAssetManifest(entry));
    return;
  }

  if (
    Object.prototype.hasOwnProperty.call(source, 'key') ||
    Object.prototype.hasOwnProperty.call(source, 'siteCode') ||
    Object.prototype.hasOwnProperty.call(source, 'id') ||
    Object.prototype.hasOwnProperty.call(source, 'name')
  ) {
    mergeEntry(source);
    return;
  }

  Object.entries(source).forEach(([key, value]) => {
    if (value && typeof value === 'object') {
      mergeEntry({ key, ...value });
    }
  });
}

function resolveManifestKey(requestedKey) {
  const visited = new Set();
  let token = normaliseKey(requestedKey) || DEFAULT_MANIFEST_KEY;
  if (!manifest[token]) {
    token = DEFAULT_MANIFEST_KEY;
  }

  let currentToken = token;
  let entry = manifest[currentToken] || manifest[DEFAULT_MANIFEST_KEY] || { images: [], videos: [], extends: null };
  const chain = [];

  while (entry && !visited.has(currentToken)) {
    visited.add(currentToken);
    chain.push({ token: currentToken, entry });

    const nextToken = normaliseKey(entry.extends);
    if (!nextToken || nextToken === currentToken) {
      break;
    }

    currentToken = manifest[nextToken] ? nextToken : DEFAULT_MANIFEST_KEY;
    entry = manifest[currentToken];
  }

  const defaultEntry = manifest[DEFAULT_MANIFEST_KEY] || {
    images: [],
    videos: [],
    imagesMeta: {},
    videosMeta: {}
  };
  let images = [];
  let videos = [];
  let imagesMeta = {};
  let videosMeta = {};

  for (let i = 0; i < chain.length; i += 1) {
    const layer = chain[i].entry;
    if (!images.length && Array.isArray(layer.images) && layer.images.length) {
      images = [...layer.images];
      imagesMeta = { ...(layer.imagesMeta || {}) };
    }
    if (!videos.length && Array.isArray(layer.videos) && layer.videos.length) {
      videos = [...layer.videos];
      videosMeta = { ...(layer.videosMeta || {}) };
    }
  }

  if (!images.length) {
    images = [...(defaultEntry.images || [])];
    imagesMeta = { ...(defaultEntry.imagesMeta || {}) };
  }
  if (!videos.length) {
    videos = [...(defaultEntry.videos || [])];
    videosMeta = { ...(defaultEntry.videosMeta || {}) };
  }

  const resolvedKey = chain.length ? chain[0].token : DEFAULT_MANIFEST_KEY;

  const filterBySite = (list, meta) => {
    if (!requestedKey) {
      return list;
    }
    const token = normaliseKey(requestedKey);
    if (!token) {
      return list;
    }
    const filtered = list.filter((src) => {
      const entryMeta = meta[src];
      if (!entryMeta) {
        return true;
      }
      if (!Array.isArray(entryMeta.siteCodes) || entryMeta.siteCodes.length === 0) {
        return true;
      }
      return entryMeta.siteCodes.some((code) => normaliseKey(code) === token);
    });
    return filtered.length ? filtered : list;
  };

  const filteredImages = filterBySite(images, imagesMeta);
  const filteredVideos = filterBySite(videos, videosMeta);

  return {
    key: resolvedKey,
    images: filteredImages,
    videos: filteredVideos,
    meta: {
      images: imagesMeta,
      videos: videosMeta
    }
  };
}

export function resolveBrandAssets(siteCode) {
  return resolveManifestKey(siteCode);
}

export function getAssetManifestSnapshot() {
  const snapshot = {};
  Object.entries(manifest).forEach(([key, entry]) => {
    snapshot[key] = {
      extends: entry.extends || null,
      tags: Array.isArray(entry.tags) ? [...entry.tags] : [],
      images: [...(entry.images || [])],
      videos: [...(entry.videos || [])],
      meta: {
        images: { ...(entry.imagesMeta || {}) },
        videos: { ...(entry.videosMeta || {}) }
      }
    };
  });
  return snapshot;
}

mergeAssetManifest(baseManifest);

export { DEFAULT_MANIFEST_KEY };
