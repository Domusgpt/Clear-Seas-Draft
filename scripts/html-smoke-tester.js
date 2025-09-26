#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const skipDirs = new Set(['.git', 'node_modules', '.github']);

function collectHtmlFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    if (skipDirs.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectHtmlFiles(fullPath));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

function normalizeAssetPath(asset) {
  let cleaned = asset.split('?')[0].split('#')[0].trim();
  if (!cleaned) return null;
  if (/^(https?:)?\/\//i.test(cleaned)) return null;
  if (/^(mailto:|tel:|data:|javascript:)/i.test(cleaned)) return null;
  if (cleaned.startsWith('about:')) return null;
  if (cleaned === '#') return null;
  if (cleaned.includes('${') || cleaned.includes('{{')) return null;
  if (!cleaned.includes('.') && !cleaned.includes('/')) return null;
  return cleaned;
}

function resolveAsset(baseDir, asset) {
  if (!asset) return null;
  if (asset.startsWith('/')) {
    return path.resolve(rootDir, asset.slice(1));
  }
  return path.resolve(baseDir, asset);
}

const ATTRIBUTES = ['src', 'href', 'poster', 'data-src', 'data-video'];

function extractAssets(html) {
  const matches = [];
  const regex = new RegExp(`(?:${ATTRIBUTES.join('|')})\\s*=\\s*"([^"]+)"`, 'gi');
  let m;
  while ((m = regex.exec(html)) !== null) {
    matches.push(m[1]);
  }
  const regexSingle = new RegExp(`(?:${ATTRIBUTES.join('|')})\\s*=\\s*'([^']+)'`, 'gi');
  while ((m = regexSingle.exec(html)) !== null) {
    matches.push(m[1]);
  }
  return matches;
}

const report = [];
const htmlFiles = collectHtmlFiles(rootDir).sort();

for (const filePath of htmlFiles) {
  const relPath = path.relative(rootDir, filePath);
  const html = fs.readFileSync(filePath, 'utf8');
  const assets = extractAssets(html);
  const seen = new Map();
  for (const raw of assets) {
    const normalized = normalizeAssetPath(raw);
    if (!normalized) continue;
    if (!seen.has(normalized)) {
      seen.set(normalized, { raw, normalized });
    }
  }
  const totalAssets = seen.size;
  const missing = [];
  const present = [];
  for (const { normalized, raw } of seen.values()) {
    const abs = resolveAsset(path.dirname(filePath), normalized);
    const exists = abs ? fs.existsSync(abs) : false;
    const relAsset = normalized.startsWith('/') ? normalized : path.relative(rootDir, abs);
    const entry = { raw, normalized: relAsset.replace(/\\/g, '/') };
    if (exists) {
      present.push(entry);
    } else {
      missing.push(entry);
    }
  }
  report.push({
    file: relPath.replace(/\\/g, '/'),
    totalAssets,
    missingCount: missing.length,
    presentCount: present.length,
    missing,
  });
}

console.log(JSON.stringify(report, null, 2));
