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
    ],
    tags: {
      foundation: {
        images: [
          'assets/Screenshot_20250430-141821.png',
          'assets/Screenshot_20250430-142024~2.png',
          'assets/file_0000000054a06230817873012865d150.png',
          'assets/image_8 (1).png'
        ],
        videos: [
          '20250505_1321_Neon Blossom Transformation_simple_compose_01jtgqf5vjevn8nbrnsx8yd5fs.mp4',
          '20250506_0014_Gemstone Coral Transformation_remix_01jthwv071e06vmjd0mn60zm3s.mp4'
        ]
      },
      immersive: {
        images: [
          'assets/Screenshot_20250430-142002~2.png',
          'assets/Screenshot_20250430-142032~2.png',
          'assets/file_00000000fc08623085668cf8b5e0a1e5.png'
        ],
        videos: [
          '20250505_1726_Noir Filament Mystery_simple_compose_01jth5f1kwe9r9zxqet54bz3q0.mp4',
          '1746496560073.mp4'
        ]
      },
      labs: {
        images: [
          'assets/Screenshot_20241012-073718.png',
          'assets/file_0000000006fc6230a8336bfa1fcebd89.png'
        ],
        videos: ['1746500614769.mp4', '1746576068221.mp4']
      }
    }
  },
  parserator: {
    extends: 'default',
    tags: {
      parserator: {
        images: [
          'assets/Screenshot_20250430-142024~2.png',
          'assets/Screenshot_20250430-142002~2.png',
          'assets/file_0000000054a06230817873012865d150.png'
        ],
        videos: [
          '20250505_1321_Neon Blossom Transformation_simple_compose_01jtgqf5vjevn8nbrnsx8yd5fs.mp4',
          '1746500614769.mp4'
        ]
      }
    }
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

function normaliseGroupMap(value) {
  if (!value || typeof value !== 'object') {
    return {};
  }
  const groups = {};
  Object.entries(value).forEach(([groupKey, groupValue]) => {
    if (!groupKey || !groupValue || typeof groupValue !== 'object') {
      return;
    }
    const token = normaliseKey(groupKey);
    if (!token) {
      return;
    }
    groups[token] = {
      images: normaliseList(groupValue.images),
      videos: normaliseList(groupValue.videos)
    };
  });
  return groups;
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

  if (Object.prototype.hasOwnProperty.call(entry, 'tags') || Object.prototype.hasOwnProperty.call(entry, 'groups')) {
    const groupMap = normaliseGroupMap(entry.tags || entry.groups);
    next.tags = { ...(existing.tags || {}), ...groupMap };
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

function resolveManifestKey(requestedKey, options = {}) {
  const requestedTag = normaliseKey(options.tag || options.group || options.campaign || options.family);
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
  let resolvedTag = requestedTag && requestedTag.length ? requestedTag : null;
  const availableTags = new Set();

  for (let i = chain.length - 1; i >= 0; i -= 1) {
    const layer = chain[i].entry;
    const tagMap = layer.tags || {};
    Object.keys(tagMap).forEach((key) => availableTags.add(normaliseKey(key)));
    if (resolvedTag && tagMap[resolvedTag]) {
      const tagEntry = tagMap[resolvedTag];
      if (!images.length && Array.isArray(tagEntry.images) && tagEntry.images.length) {
        images = [...tagEntry.images];
      }
      if (!videos.length && Array.isArray(tagEntry.videos) && tagEntry.videos.length) {
        videos = [...tagEntry.videos];
      }
    }
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
  const tagsFromDefault = defaultEntry.tags || {};
  Object.keys(tagsFromDefault).forEach((key) => availableTags.add(normaliseKey(key)));

  if (!images.length && resolvedTag && manifest[resolvedKey]?.tags?.[resolvedTag]) {
    images = [...(manifest[resolvedKey].tags[resolvedTag].images || [])];
  }
  if (!videos.length && resolvedTag && manifest[resolvedKey]?.tags?.[resolvedTag]) {
    videos = [...(manifest[resolvedKey].tags[resolvedTag].videos || [])];
  }

  if (resolvedTag && (!availableTags.has(resolvedTag) || (!images.length && !videos.length))) {
    resolvedTag = null;
  }

  return {
    key: resolvedKey,
    tag: resolvedTag,
    images,
    videos,
    availableTags: Array.from(availableTags).sort()
  };
}

export function resolveBrandAssets(siteCode, options = {}) {
  return resolveManifestKey(siteCode, options);
}

export function getAssetManifestSnapshot() {
  const snapshot = {};
  Object.entries(manifest).forEach(([key, entry]) => {
    snapshot[key] = {
      extends: entry.extends || null,
      images: [...(entry.images || [])],
      videos: [...(entry.videos || [])],
      tags: entry.tags
        ? Object.fromEntries(
            Object.entries(entry.tags).map(([tagKey, tagEntry]) => [
              tagKey,
              {
                images: [...(tagEntry.images || [])],
                videos: [...(tagEntry.videos || [])]
              }
            ])
          )
        : undefined
    };
  });
  return snapshot;
}

mergeAssetManifest(baseManifest);

export { DEFAULT_MANIFEST_KEY };
