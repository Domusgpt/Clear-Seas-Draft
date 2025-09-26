# CSS Web Master System Overview

The CSS Web Master initiative transforms the Clear Seas draft showcase into a reusable web platform for the broader CSS site family. This guide explains how the shared runtime components fit together, how brand assets flow through the system, and what steps remain before the codebase can power additional domains like **paraerator.com** and **vib3code.com**.

## 1. System Goals
- **Single orchestration layer** for focus/tilt/bend telemetry across cards, canvases, overlays, and motion visualizers.
- **Palette-aware asset delivery** so each site can rotate through curated MP4/image overlays without code duplication.
- **Composable documentation** that allows engineers and designers to understand the relationships between HTML builds, scripts, and stylesheets.
- **Future-ready governance** to plug in new CSS destinations with minimal refactoring.

## 2. Runtime Architecture
```
page-profile-registry.js ──► global-page-orchestrator.js ──► global-card-synergy.css
          │                              │                          │
          │                              │                          ├─ Drives CSS variables for bend, tilt, focus, scroll.
          │                              │
          │                              ├─ Emits motion event (`clear-seas:motion-updated`).
          │                              ├─ Seeds brand overlays + datasets.
          │
          └─ Supplies palette + asset rotation metadata.
```
Additional consumers:
- `vib34d-contained-card-system.js` listens for motion updates and resizes canvases.
- `card-specific-vib34d-visualizer.js` mirrors bend/twist values for standalone cards.
- Stylesheets under `styles/` and `vib34d-styles/` apply palette variables to typography, glow, and blend effects.

## 3. Brand & Asset Flow
1. **Profile Detection** – The page registry identifies the current build via filename, dataset attributes, or title tokens.
2. **Palette Application** – The orchestrator applies CSS variables (`--global-brand-accent`, `--global-synergy-depth`, etc.) and dataset markers (`data-global-page-family`).
3. **Asset Rotation** – Brand overrides and media rotations pull from the registry to assign logos, MP4 overlays, or fallback imagery per collection.
4. **Visualizer Sync** – Canvases overscan beyond card edges while inheriting tilt, bend, and warp cues to maintain cohesion with the host card.

### Uploaded Media Checklist
- Place MP4 and PNG/SVG assets under `assets/` using descriptive names (`brand-<site>-<descriptor>.mp4`).
- Register new assets inside `scripts/page-profile-registry.js` under the appropriate profile.
- When mapping to new sites, create per-site arrays (e.g., `paraerator`, `vib3code`) and flag which experiences should rotate through them.

## 4. Integrating a New Site
1. **Duplicate a Base HTML Build** that matches the desired experience (e.g., Immersive AI collection for a motion-heavy landing page).
2. **Set `data-page-collection`** or update the filename so the registry resolves to the right palette; add a new profile if necessary.
3. **Customize Copy & Assets** using the palette variables rather than hard-coded colors; add brand overlays through the registry so they can refresh at runtime.
4. **Document the Variant** by adding an entry to `docs/html-version-groups.md` and, if it’s a new collection, extend the manifest.

## 5. Outstanding Work for CSS-Wide Adoption
- **Config Abstraction** – Move profile data into JSON to avoid modifying source files when onboarding new domains.
- **Asset Source Control** – Define how large MP4 uploads are stored (Git LFS vs. external CDN) and reference them via configuration.
- **Automation** – Script deployments for GitHub Pages + alternative hosts, and add sanity checks that verify orchestrator injection on every page.
- **Interaction QA** – Create automated scroll/hover scenarios (e.g., Playwright, Cypress) to ensure synchronized animations stay in lockstep across browsers.

## 6. Documentation Map
- [`README.md`](../README.md) – Project overview and roadmap.
- [`docs/brand-asset-overrides.md`](brand-asset-overrides.md) – Runtime brand refresh flow.
- [`docs/global-motion-reference.md`](global-motion-reference.md) – Motion bus variables, events, and telemetry fields.
- [`docs/html-version-groups.md`](html-version-groups.md) – Collection manifest + generalization watchlist.
- [`docs/dev-updates/`](dev-updates/) – Running change log with rationale and follow-ups.

## 7. Next Steps
- Draft JSON schemas for palette/asset configuration.
- Audit all HTML builds for hard-coded Clear Seas copy that should move into content files.
- Prepare onboarding guides for paraerator.com and vib3code.com, outlining which collection best matches their brand direction.

Use this document as the anchor for CSS Web Master onboarding. Update it whenever new shared modules or deployment practices are introduced.
