# Dev Update – 8 May 2025

## What changed

- Added `scripts/site-asset-manifest.js` to centralize default image/video rotations and support per-site overrides.
- Updated `global-page-orchestrator.js` to resolve brand assets via the manifest, expose
  `window.__CSS_WEB_MASTER_REGISTER_ASSET_MANIFEST`, and synchronize both Clear Seas and CSS-Web-Master event namespaces when the
  manifest changes.
- Refreshed documentation (`README.md`, system overview, gap analysis, and brand override guide) so teams know how to publish
  their own media packs without editing the orchestrator.

## Why it matters

- The Clear Seas showcase can now act as a true control surface: every site can declare its own asset bundle while the shared
  motion/override plumbing stays untouched.
- Runtime registration enables launch teams to iterate on brand media (and validate manifests) directly in staging without
  triggering manual code edits.

## Next recommendations

1. Build validation tooling that compares manifest entries against the `/assets` directory to catch typos before deployment.
2. Extend the manifest format with optional metadata (e.g., attribution, dimensions, codecs) to assist downstream optimizers.
3. Group uploaded MP4 overlays by campaign/site to make deterministic rotation rules easier to author.
