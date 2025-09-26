# Dev Update – 9 May 2025

## What changed

- Tagged every default image/video in `scripts/site-asset-manifest.js` with site codes, labels, and descriptor tags so rotations
  stay deterministic when parserator.com, vib3code.com, or future CSS properties take over the control surface.
- Exposed manifest metadata to the orchestrator and card controllers (`window.__CSS_WEB_MASTER_BRAND_ASSETS.meta`) so downstream
  systems can choose assets by tag without re-parsing the manifest.
- Added `tools/validate-asset-manifest.mjs`, a lightweight Node script that checks each manifest path exists and that site packs
  include tagged assets before deployment.
- Updated the brand override guide, README, system overview, and gap analysis to document the metadata format and validation
  workflow.

## Why it matters

- Manifest metadata finally closes the "tag assets by site" item from the CSS-Web-Master gap analysis, enabling reproducible
  media rotations per property.
- Teams can now run a single command to confirm manifests stay healthy, preventing staging surprises when assets move or site
  packs omit required tags.

## Next recommendations

1. Feed the manifest metadata into dashboard tooling (or the smoke harness) so reports can highlight which assets each site
   currently rotates.
2. Extend `tools/validate-asset-manifest.mjs` with optional `--site <code>` filters to preview the exact bundle a property will
   receive.
3. Capture additional metadata (codec, resolution, duration) once media files are finalized to support future optimization
   pipelines.
