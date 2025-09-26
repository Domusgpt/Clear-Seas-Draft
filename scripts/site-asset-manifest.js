const DEFAULT_MANIFEST_KEY = 'default';

const baseManifest = {
  [DEFAULT_MANIFEST_KEY]: {
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
  },
  parserator: {
    extends: 'default'
  }
};

const manifest = Object.create(null);

function normaliseKey(key) {
  return String(key || '')
    .trim()
    .toLowerCase();
}

function normaliseList(value) {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value
      .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
      .filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(/[\n,]+/)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return [];
}

function mergeEntry(entry) {
  if (!entry || typeof entry !== 'object') {
    return;
  }
  const key = normaliseKey(entry.key || entry.siteCode || entry.id || entry.name);
  if (!key) {
    return;
  }
  const existing = manifest[key] || { images: [], videos: [], extends: null };
  const next = { ...existing };

  if (Object.prototype.hasOwnProperty.call(entry, 'extends')) {
    const extendsKey = normaliseKey(entry.extends);
    next.extends = extendsKey && extendsKey !== key ? extendsKey : null;
  }

  if (Object.prototype.hasOwnProperty.call(entry, 'images')) {
    next.images = normaliseList(entry.images);
  }

  if (Object.prototype.hasOwnProperty.call(entry, 'videos')) {
    next.videos = normaliseList(entry.videos);
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

  const defaultEntry = manifest[DEFAULT_MANIFEST_KEY] || { images: [], videos: [] };
  let images = [];
  let videos = [];

  for (let i = chain.length - 1; i >= 0; i -= 1) {
    const layer = chain[i].entry;
    if (!images.length && Array.isArray(layer.images) && layer.images.length) {
      images = [...layer.images];
    }
    if (!videos.length && Array.isArray(layer.videos) && layer.videos.length) {
      videos = [...layer.videos];
    }
  }

  if (!images.length) {
    images = [...(defaultEntry.images || [])];
  }
  if (!videos.length) {
    videos = [...(defaultEntry.videos || [])];
  }

  const resolvedKey = chain.length ? chain[0].token : DEFAULT_MANIFEST_KEY;

  return {
    key: resolvedKey,
    images,
    videos
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
      images: [...(entry.images || [])],
      videos: [...(entry.videos || [])]
    };
  });
  return snapshot;
}

mergeAssetManifest(baseManifest);

export { DEFAULT_MANIFEST_KEY };
