# CSS-Web-Master System Overview

The CSS-Web-Master system elevates the original Clear Seas Draft showcase into a multi-site orchestration platform. It keeps the
legacy builds intact while introducing shared registries, motion buses, and styling primitives that future CSS-family properties
can reuse without rewriting motion logic or asset loading rules.

## Core Goals

1. **Unify shared infrastructure.** Global scripts (`global-page-orchestrator`, `page-profile-registry`) centralize brand
   palettes, asset rotation, and CSS variable broadcasting so each site inherits the same reactive scaffolding.
2. **Scale across properties.** paraerator.com, vib3code.com, and other CSS launches can point at the same orchestrator and
   stylesheet bundle, then layer site-specific copy or modules on top.
3. **Preserve creative experimentation.** Every HTML build remains available as a reference implementation, letting teams remix
   existing choreography patterns instead of starting from scratch.

## Architecture Snapshot

| Layer | Purpose | Key Files |
| ----- | ------- | --------- |
| **Registry** | Detects the active page family, palette, and layout metadata. | `scripts/page-profile-registry.js` |
| **Orchestrator** | Applies profile data, injects shared CSS variables, and broadcasts motion telemetry. | `scripts/global-page-orchestrator.js` |
| **Card Systems** | Provides synchronized card bending, tilt, and overlay management. | `scripts/card-system-initializer.js`, `scripts/vib34d-contained-card-system.js` |
| **Synergy Stylesheets** | Consumes the broadcast variables to animate cards, overlays, and canvases in unison. | `styles/global-card-synergy.css`, `styles/clear-seas-ai.css`, `styles/consolidated-styles.css` |
| **Visualizer Engines** | Render holographic canvases, overscan assets, and 4D rotations. | `src/holograms/HolographicVisualizer.js`, `src/core/CanvasManager.js` |

### Multi-Site Workflow

1. **Choose a baseline template** from the Master Index based on the desired experience (e.g., Immersive AI deck, Blueprint lab,
   Totalistic showcase).
2. **Set the page profile** using `data-page-collection` or filename conventions so the orchestrator loads the correct palette
   and asset set. Provide `data-site-code="<site>`" (or configure an explicit registry override) to target the right site family
   when launching new properties.
3. **Register brand assets** through the shared brand override registry or by dropping new media into `assets/` and referencing
   them within the profile metadata.
4. **Customize copy and modules** while leaving the orchestrator hooks in place so focus, pointer, and scroll telemetry continue
   to propagate to canvases, overlays, and videos.
5. **Document site-specific adjustments** in the `/docs` folder to keep the control surface accurate for each deployment.

## Shared Asset Strategy

- **Brand overrides**: Use `docs/brand-asset-overrides.md` as the canonical guide. New logo treatments, translucent overlays, or
  short-form mp4 loops can be registered once and consumed across every card system.
- **Uploaded media**: Recent additions (e.g., `20250505_1321_Neon Blossom Transformation_simple_compose_01jtgqf5vjevn8nbrnsx8yd5fs.mp4`,
  `20250506_0014_Gemstone Coral Transformation_remix_01jthwv0c4fxk8m0e79ry2t4ke.mp4`) are ready for rotation within the
  orchestrator-managed palettes.
- **Overscan defaults**: Canvas overscan is now managed globally, ensuring holographic visuals always bleed past card edges while
  respecting tilt and bend cues supplied by motion telemetry.

## Site codes & design tokens

- **Namespace bridge:** Runtime globals now publish both `__CSS_WEB_MASTER_*` and legacy `__CLEAR_SEAS_*` properties. New builds
  should subscribe to `css-web-master:motion-updated` (via `window.__CSS_WEB_MASTER_GLOBAL_MOTION_EVENT`) while maintaining
  legacy listeners.
- **Profile palette library:** Palette metadata is defined once and shared across profiles. The new `paraerator` entry reuses the
  foundation palette while layering property-specific scripts and copy.
- **Token overrides:** `styles/css-web-master-tokens.css` centralises typography, color, and motion variables. Override
  `--csswm-*` tokens per site to re-skin experiences without duplicating the choreography stylesheets.

## Extending to New Sites

- **paraerator.com**: Start from a PR-series immersive deck to reuse mission-axis navigation. Update the profile registry with a
  `paraerator` family that swaps in the new logos/videos and adjust copy modules accordingly.
- **vib3code.com**: Leverage the VIB34D-integrated builds for continuity with the existing visualizer engines. Register
  additional shader parameters if new interaction types are required.
- **Future CSS properties**: Define new families within `page-profile-registry`, point them at shared synergy styles, and create
  dedicated docs (similar to this overview) to capture any divergent requirements.

## Next Documentation Steps

- Maintain rolling developer updates under `docs/dev-updates/` so every transition is auditable.
- Expand the gap analysis (see `docs/css-web-master-gap-analysis.md`) as teams discover Clear Seas-specific logic that should be
  abstracted for broader use.
- Annotate new palette definitions with the assets they expect, making it easy to substitute brand packages without editing the
  orchestrator core.
