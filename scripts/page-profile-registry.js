const PALETTE_LIBRARY = {
  meta: {
    accent: '#7ef6ff',
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
  foundation: {
    accent: '#8ddcff',
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
  immersive: {
    accent: '#ffaadf',
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
    }
  },
  concept: {
    accent: '#caa5ff',
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
};

const PROFILE_DEFINITIONS = [
  {
    key: 'meta-index',
    label: 'Meta Index Overview',
    family: 'meta',
    layout: 'map',
    palette: 'meta',
    fileNames: ['index.html'],
    tags: ['index', 'meta', 'map', 'directory'],
    titleTokens: ['all versions', 'collections', 'clear seas solutions'],
    imageOrder: [2, 3, 4, 0, 1, 5, 6, 7, 8],
    videoOrder: [4, 5, 6, 0, 1, 2, 3],
    videoPattern: [0, 1]
  },
  {
    key: 'core-foundation',
    label: 'Core Foundation Builds',
    family: 'foundation',
    layout: 'grid',
    palette: 'foundation',
    fileNames: [
      '1-index.html',
      '2-index-optimized.html',
      '3-index-fixed.html',
      '4-index-unified.html',
      '5-index-vib34d-integrated.html',
      '6-index-totalistic.html'
    ],
    tags: ['core', 'foundation', 'totalistic', 'unified'],
    titleTokens: ['clear seas solutions', 'totalistic', 'integrated'],
    imageOrder: [0, 5, 1, 6, 2, 7, 3, 8, 4],
    videoOrder: [1, 2, 3, 0, 4, 5, 6],
    videoPattern: [0, 1, 0, 0]
  },
  {
    key: 'immersive-ai',
    label: 'Immersive AI Journeys',
    family: 'immersive',
    layout: 'timeline',
    palette: 'immersive',
    fileNames: [
      '10-pr-4.html', '11-pr-5.html', '12-pr-6.html',
      '14-pr-8.html', '15-pr-9.html', '16-pr-10.html',
      '17-pr-11.html', '18-pr-12.html', '19-pr-13.html',
      '20-pr-14.html', '21-pr-15.html', '22-pr-16.html',
      '23-pr-17.html', '24-pr-18.html', '25-pr-19.html',
      '26-pr-20.html', '27-pr-21.html', '28-pr-22.html',
      '29-pr-23.html', '30-pr-24.html'
    ],
    tags: ['immersive', 'mission', 'pulse', 'signal', 'pr', 'blueprint'],
    titleTokens: ['immersive experience', 'mission axis', 'experience blueprint'],
    imageOrder: [4, 0, 5, 1, 6, 2, 7, 3, 8],
    videoOrder: [4, 5, 6, 0, 1, 2, 3],
    videoPattern: [1, 0, 1, 1],
    scripts: ['scripts/immersive-experience-actualizer.js']
  },
  {
    key: 'concept-labs',
    label: 'Concept Lab Explorations',
    family: 'labs',
    layout: 'gallery',
    palette: 'concept',
    fileNames: [
      '7-pr-1.html',
      '8-pr-2.html',
      '9-pr-3.html',
      '13-pr-7.html',
      '25-orthogonal-depth-progression.html',
      'ultimate-clear-seas-holistic-system.html'
    ],
    tags: ['concept', 'lab', 'gallery', 'codex', 'orthogonal', 'ultimate'],
    titleTokens: ['visual codex', 'orthogonal depth', 'holistic system'],
    imageOrder: [6, 7, 8, 3, 4, 0, 1, 2, 5],
    videoOrder: [2, 3, 4, 5, 6, 0, 1],
    videoPattern: [1, 1, 0, 1]
  },
  {
    key: 'parserator-alpha',
    label: 'Parserator Systems Launchpad',
    family: 'parserator',
    siteCode: 'parserator',
    layout: 'grid',
    palette: 'foundation',
    fileNames: ['parserator.html'],
    tags: ['parserator', 'propulsion', 'systems', 'aero', 'launch'],
    titleTokens: ['parserator', 'propulsion systems', 'aero lab'],
    imageOrder: [0, 5, 1, 6, 2, 7, 3, 8, 4],
    videoOrder: [1, 2, 3, 0, 4, 5, 6],
    videoPattern: [0, 1, 0, 1],
    scripts: ['scripts/immersive-experience-actualizer.js']
  }
];

function normaliseToken(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

function normaliseFileName(name) {
  if (!name) {
    return 'index.html';
  }
  const trimmed = name.trim().toLowerCase();
  if (!trimmed) {
    return 'index.html';
  }
  return trimmed.endsWith('.html') ? trimmed : `${trimmed}.html`;
}

function computeHashSeed(input) {
  let hash = 0;
  const source = input || '';
  for (let i = 0; i < source.length; i += 1) {
    hash = (hash * 131 + source.charCodeAt(i)) >>> 0;
  }
  return hash;
}

const normalisedProfiles = PROFILE_DEFINITIONS.map((definition) => {
  const paletteKey = definition.palette || definition.paletteKey || 'foundation';
  const paletteDefaults = PALETTE_LIBRARY[paletteKey] || {};
  const paletteOverrides = definition.paletteOverrides || {};
  const accent = definition.accent || paletteOverrides.accent || paletteDefaults.accent || null;
  const overlay = {
    ...(paletteDefaults.overlay || {}),
    ...(paletteOverrides.overlay || {}),
    ...(definition.overlay || {})
  };
  const canvas = {
    ...(paletteDefaults.canvas || {}),
    ...(paletteOverrides.canvas || {}),
    ...(definition.canvas || {})
  };
  const rawSiteCode = definition.siteCode || null;
  const siteCodeToken = rawSiteCode ? normaliseToken(rawSiteCode) : null;

  return {
    ...definition,
    palette: paletteKey,
    paletteKey,
    siteCode: rawSiteCode,
    siteCodeToken,
    accent,
    overlay,
    canvas,
    fileNames: new Set((definition.fileNames || []).map(normaliseFileName)),
    tags: new Set((definition.tags || []).map(normaliseToken)),
    titleTokens: (definition.titleTokens || []).map(normaliseToken)
  };
});

export function listPageProfiles() {
  return normalisedProfiles.map((profile) => ({
    key: profile.key,
    label: profile.label,
    family: profile.family,
    layout: profile.layout,
    palette: profile.palette,
    accent: profile.accent,
    siteCode: profile.siteCode || null
  }));
}

function readCandidateTokens(docEl, bodyEl) {
  const tokens = [];
  if (docEl) {
    tokens.push(docEl.dataset.pageCollection);
    tokens.push(docEl.dataset.collection);
    tokens.push(docEl.dataset.showcaseTheme);
    tokens.push(docEl.dataset.showcaseCard);
    tokens.push(docEl.dataset.siteCode);
    tokens.push(docEl.dataset.globalSiteCode);
    tokens.push(docEl.dataset.brandSite);
  }
  if (bodyEl && bodyEl.dataset) {
    tokens.push(bodyEl.dataset.pageCollection);
    tokens.push(bodyEl.dataset.collection);
    tokens.push(bodyEl.dataset.siteCode);
    tokens.push(bodyEl.dataset.globalSiteCode);
  }
  return tokens.filter(Boolean).map(normaliseToken);
}

export function resolvePageProfile(context = {}) {
  const doc = context.document || (typeof document !== 'undefined' ? document : null);
  const docEl = doc ? doc.documentElement : null;
  const body = doc ? doc.body : null;
  const path = context.path || (typeof window !== 'undefined' && window.location ? window.location.pathname : '');
  const pathToken = path ? path.split('/').filter(Boolean).pop() : '';
  const metaName = normaliseFileName(pathToken || (docEl && docEl.dataset ? docEl.dataset.pageId : '') || '');
  const title = normaliseToken(doc ? doc.title : context.title || '');
  const candidateTokens = readCandidateTokens(docEl, body);
  const pathTokens = path
    ? path
        .split(/[\\/]+/)
        .filter(Boolean)
        .map(normaliseToken)
    : [];
  const requestedSiteCode = normaliseToken(
    context.siteCode ||
      (docEl && docEl.dataset ? docEl.dataset.siteCode : '') ||
      (docEl && docEl.dataset ? docEl.dataset.globalSiteCode : '') ||
      (body && body.dataset ? body.dataset.siteCode : '') ||
      (body && body.dataset ? body.dataset.globalSiteCode : '')
  );
  const searchTokens = [...candidateTokens];
  if (requestedSiteCode) {
    searchTokens.push(requestedSiteCode);
  }
  pathTokens.forEach((token) => {
    if (token) {
      searchTokens.push(token);
    }
  });

  let matched = normalisedProfiles.find((profile) => profile.fileNames.has(metaName));
  if (!matched && requestedSiteCode) {
    matched = normalisedProfiles.find((profile) => profile.siteCodeToken === requestedSiteCode);
  }
  if (!matched) {
    matched = normalisedProfiles.find((profile) =>
      searchTokens.some((token) => profile.tags.has(token) || (profile.siteCodeToken && profile.siteCodeToken === token))
    );
  }
  if (!matched) {
    matched = normalisedProfiles.find((profile) => profile.titleTokens.some((token) => title.includes(token)));
  }
  if (!matched) {
    matched = normalisedProfiles.find((profile) => profile.key === 'core-foundation') || normalisedProfiles[0];
  }

  const signatureParts = [metaName, title, requestedSiteCode].concat(searchTokens);
  const signature = signatureParts.filter(Boolean).join('|') || metaName;
  const seed = computeHashSeed(signature);

  return {
    key: matched.key,
    label: matched.label,
    family: matched.family,
    layout: matched.layout,
    palette: matched.palette,
    paletteKey: matched.paletteKey,
    accent: matched.accent,
    overlay: matched.overlay ? { ...matched.overlay } : {},
    canvas: matched.canvas ? { ...matched.canvas } : {},
    imageOrder: matched.imageOrder ? [...matched.imageOrder] : null,
    videoOrder: matched.videoOrder ? [...matched.videoOrder] : null,
    videoPattern: matched.videoPattern ? [...matched.videoPattern] : null,
    scripts: matched.scripts ? [...matched.scripts] : [],
    siteCode: matched.siteCode || null,
    siteCodeToken: matched.siteCodeToken || null,
    requestedSiteCode: requestedSiteCode || null,
    signature,
    seed,
    metaName,
    candidateTokens: searchTokens
  };
}

export function applyProfileMetadata(profile, targetDocument = typeof document !== 'undefined' ? document : null) {
  if (!profile || !targetDocument) {
    return;
  }
  const docEl = targetDocument.documentElement;
  const body = targetDocument.body;
  if (!docEl) {
    return;
  }
  docEl.dataset.globalPageCollection = profile.key;
  docEl.dataset.globalBrandPalette = profile.palette;
  docEl.dataset.globalPageFamily = profile.family || profile.key;
  docEl.dataset.globalPageLayout = profile.layout || 'grid';
  docEl.dataset.globalPaletteKey = profile.paletteKey || profile.palette || '';
  if (profile.siteCode) {
    docEl.dataset.globalSiteCode = profile.siteCode;
  } else {
    delete docEl.dataset.globalSiteCode;
  }
  if (body) {
    body.dataset.globalPageCollection = profile.key;
    body.dataset.globalBrandPalette = profile.palette;
    body.dataset.globalPageFamily = profile.family || profile.key;
    body.dataset.globalPageLayout = profile.layout || 'grid';
    body.dataset.globalPaletteKey = profile.paletteKey || profile.palette || '';
    if (profile.siteCode) {
      body.dataset.globalSiteCode = profile.siteCode;
    } else {
      delete body.dataset.globalSiteCode;
    }
  }
  if (profile.accent) {
    docEl.style.setProperty('--global-brand-accent', profile.accent);
  }
  if (profile.palette) {
    docEl.style.setProperty('--global-brand-palette', profile.palette);
  }
  if (profile.overlay?.filter) {
    docEl.style.setProperty('--global-brand-overlay-filter', profile.overlay.filter);
  }
  if (profile.overlay?.opacity != null) {
    docEl.style.setProperty('--global-brand-overlay-opacity', String(profile.overlay.opacity));
  }
}

if (typeof window !== 'undefined') {
  const registry = {
    list: listPageProfiles,
    resolve: resolvePageProfile,
    apply: applyProfileMetadata
  };
  window.__CLEAR_SEAS_PAGE_PROFILE_REGISTRY = registry;
  window.__CSS_WEB_MASTER_PAGE_PROFILE_REGISTRY = registry;
}

export default {
  listPageProfiles,
  resolvePageProfile,
  applyProfileMetadata
};

