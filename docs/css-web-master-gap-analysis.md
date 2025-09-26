# CSS-Web-Master Gap Analysis

This checklist captures the Clear Seas-specific assumptions that still live in the codebase. Addressing each item will make the
CSS-Web-Master platform production-ready for paraerator.com, vib3code.com, and future CSS family properties.

## Naming & Branding

- **Global variables & events** still use the `clear-seas` prefix (`window.__CLEAR_SEAS_GLOBAL_MOTION`, `clear-seas:motion-updated`).
  - *Action:* Introduce aliases or a namespace bridge (e.g., `window.__CSS_WEB_MASTER`) so downstream integrations can migrate
    without breaking existing builds.
- **Dataset attributes** applied by `global-page-orchestrator` are `data-global-page-family/layout`. Confirm if new properties
  require additional tags (e.g., `data-site-code`).

## Page Profile Registry

- Profiles currently reference Clear Seas-specific copy and brand asset packages.
  - *Action:* Split palette metadata from marketing copy to allow new sites to opt into the same colors without inheriting copy.
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
  - *Action:* Externalize font stacks and color tokens into CSS variables so sites can swap values without duplicating files.

## Documentation

- The Master Index references Clear Seas experiences throughout.
  - *Action:* Update hero copy per site launch, or create property-specific indexes that reuse the same component grid.
- Add runbooks for deploying to each production host (paraerator.com, vib3code.com) once the orchestration pattern is finalized.

## Tooling Wishlist

- **Configuration schema:** Provide a JSON/YAML schema for declaring site families, asset packs, and motion tuning.
- **CLI or scripts:** Automate copying a base template into a new `site-name.html` with the correct dataset tags and doc stubs.
- **Visualizer presets:** Document recommended shader parameter ranges per site to keep brand experiences consistent.
