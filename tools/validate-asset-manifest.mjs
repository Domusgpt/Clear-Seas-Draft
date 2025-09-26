#!/usr/bin/env node
import { access } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { DEFAULT_MANIFEST_KEY, getAssetManifestSnapshot } from '../scripts/site-asset-manifest.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

async function fileExists(relativePath) {
  try {
    await access(path.resolve(repoRoot, relativePath));
    return true;
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

function normaliseKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

async function main() {
  const snapshot = getAssetManifestSnapshot();
  const knownKeys = new Set(Object.keys(snapshot).map((key) => normaliseKey(key)));
  knownKeys.add(normaliseKey(DEFAULT_MANIFEST_KEY));
  knownKeys.add('css-web-master');

  const missingFiles = [];
  const untaggedSiteAssets = [];
  const unknownSiteCodes = [];

  for (const [key, entry] of Object.entries(snapshot)) {
    const normalisedKey = normaliseKey(key);
    for (const type of ['images', 'videos']) {
      const assets = Array.isArray(entry[type]) ? entry[type] : [];
      for (const src of assets) {
        const assetPath = typeof src === 'string' ? src.trim() : '';
        if (!assetPath) {
          continue;
        }
        const exists = await fileExists(assetPath);
        if (!exists) {
          missingFiles.push({ key, type, src: assetPath });
        }
        const meta = entry.meta?.[type]?.[assetPath] || {};
        const siteCodes = Array.isArray(meta.siteCodes) ? meta.siteCodes : [];
        if (normalisedKey !== normaliseKey(DEFAULT_MANIFEST_KEY) && assets.length) {
          if (!siteCodes.length || !siteCodes.some((code) => normaliseKey(code) === normalisedKey)) {
            untaggedSiteAssets.push({ key, type, src: assetPath });
          }
        }
        siteCodes.forEach((code) => {
          const normalised = normaliseKey(code);
          if (normalised && !knownKeys.has(normalised)) {
            unknownSiteCodes.push({ key, type, src: assetPath, code });
          }
        });
      }
    }
  }

  if (!missingFiles.length && !untaggedSiteAssets.length && !unknownSiteCodes.length) {
    console.log('✅ Asset manifest looks good — all files exist and site tags are aligned.');
    return;
  }

  if (missingFiles.length) {
    console.error('\n❌ Missing asset files:');
    missingFiles.forEach((issue) => {
      console.error(`  • [${issue.key}] ${issue.type.slice(0, -1)} → ${issue.src}`);
    });
  }

  if (untaggedSiteAssets.length) {
    console.warn('\n⚠️ Site-specific entries without matching siteCodes:');
    untaggedSiteAssets.forEach((issue) => {
      console.warn(`  • [${issue.key}] ${issue.type.slice(0, -1)} → ${issue.src}`);
    });
  }

  if (unknownSiteCodes.length) {
    console.warn('\n⚠️ Unknown site codes referenced in metadata:');
    unknownSiteCodes.forEach((issue) => {
      console.warn(`  • [${issue.key}] ${issue.type.slice(0, -1)} → ${issue.src} (tagged as "${issue.code}")`);
    });
  }

  if (missingFiles.length) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('❌ Asset manifest validation failed unexpectedly:', error);
  process.exitCode = 1;
});
