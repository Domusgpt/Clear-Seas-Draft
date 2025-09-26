# CSS-Web-Master Gap Analysis

This checklist captures the Clear Seas-specific assumptions that still live in the codebase. Addressing each item will make the
CSS-Web-Master platform production-ready for paraerator.com, vib3code.com, and future CSS family properties.

## Naming & Branding

- **Global variables & events** still use the `clear-seas` prefix (`window.__CLEAR_SEAS_GLOBAL_MOTION`, `clear-seas:motion-updated`).
  - ✅ **Completed:** `global-page-orchestrator`, `card-system-initializer`, and `vib34d-contained-card-system` now publish
    `__CSS_WEB_MASTER_*` globals and dispatch both `css-web-master:*` and legacy `clear-seas:*` events.
  - ⏭️ *Follow-on:* Audit bespoke modules for hard-coded event strings and migrate them to the registry aliases.
- **Dataset attributes** applied by `global-page-orchestrator` are `data-global-page-family/layout`. Confirm if new properties
  require additional tags (e.g., `data-site-code`).

## Page Profile Registry

- Profiles currently reference Clear Seas-specific copy and brand asset packages.
  - ✅ **Completed:** Palette definitions now live in a shared library, and a `paraerator` site profile demonstrates how new
    properties reuse the foundation palette while swapping copy/modules.
- Filename heuristics prioritize `index`/`pr` naming. Define detection patterns for future site URLs or configure explicit
  overrides.

## Asset Management

- The brand override registry expects assets in `/assets/` with Clear Seas naming conventions.
  - *Action:* Add configuration hooks (JSON or module exports) so each site can define its own asset manifest without editing the
    orchestrator.
- Uploaded mp4 overlays are catalogued but not yet grouped by campaign/site.
  - *Action:* Tag assets by site or theme within the registry for deterministic rotation.

## Styling Systems

- `styles/clear-seas-ai.css` includes marketing copy classes and iconography unique to the Clear Seas mission deck.
  - *Action:* Extract generic motion/visualizer styles into a neutral stylesheet and let each site layer its own typography.
- `styles/consolidated-styles.css` references fonts and color tokens specific to Clear Seas.
  - ✅ **Completed:** Neutral tokens live in `styles/css-web-master-tokens.css`, and downstream styles consume them via CSS
    variables for per-site overrides.

## Documentation

- The Master Index references Clear Seas experiences throughout.
  - *Action:* Update hero copy per site launch, or create property-specific indexes that reuse the same component grid.
- Add runbooks for deploying to each production host (paraerator.com, vib3code.com) once the orchestration pattern is finalized.

## Tooling Wishlist

- **Configuration schema:** Provide a JSON/YAML schema for declaring site families, asset packs, and motion tuning.
- **CLI or scripts:** Automate copying a base template into a new `site-name.html` with the correct dataset tags and doc stubs.
- **Visualizer presets:** Document recommended shader parameter ranges per site to keep brand experiences consistent.
