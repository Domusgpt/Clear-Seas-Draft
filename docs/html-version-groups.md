# HTML Version Collections

This manifest groups every published HTML experience by the layout framework, shared stylesheets, and JavaScript orchestration they rely on. Use it as a quick map when deciding which builds to compare or extend together.

## Core System Foundation (1–6)
These flagship builds establish the production-ready stack, moving from the launch deck through unified and totalistic orchestration layers.

- **`1-index.html` – AI Innovation Portfolio**  
  *Stack:* `scripts/vib34d-contained-card-system.js`.  
  *Focus:* Flagship trading-card portfolio with the contained VIB34D card system.
- **`2-index-optimized.html` – Performance Enhanced Core**  
  *Stack:* `styles/consolidated-styles.css` + `scripts/enhanced-master-conductor.js`, `scripts/main.js`, `scripts/mobile-navigation-injector.js`, `scripts/unified-experience-engine.js`, `scripts/vib34d-contained-card-system.js`, `scripts/zone-visualizers.js`.  
  *Focus:* Speed-tuned navigation with synchronized canvas zones.
- **`3-index-fixed.html` – Stabilized System**  
  *Stack:* `styles/consolidated-styles.css` + `scripts/polytopal-reactivity-json.js`.  
  *Focus:* Hardens the fixed-layout controls and reactivity JSON pipeline.
- **`4-index-unified.html` – Unified Architecture**  
  *Stack:* `styles/consolidated-styles.css` + `scripts/polytopal-reactivity-json.js`, `scripts/preset-laboratory.js`.  
  *Focus:* Brings disparate modules under a single preset lab configuration.
- **`5-index-vib34d-integrated.html` – Advanced VIB34D Integration**  
  *Stack:* layered base/animations/reactivity styles with `js/audio/audio-engine.js`, `js/controls/ui-handlers.js`, `js/core/url-params.js`, `js/gallery/gallery-manager.js`, `js/interactions/device-tilt.js`.  
  *Focus:* Full VIB34D integration with audio, gallery, and tilt controls.
- **`6-index-totalistic.html` – Totalistic Experience**  
  *Stack:* `styles/consolidated-styles.css` + `scripts/core-engine.js`, `scripts/polytopal-reactivity-json.js`, `scripts/unified-experience-engine.js`, `scripts/vib34d-contained-card-system.js`.  
  *Focus:* Total-system choreography that threads every engine together.

## Immersive AI Command Deck Collection (PR #4–#24)
All of these prototypes load `styles/clear-seas-ai.css` and `scripts/clear-seas-ai.js`, delivering the mission-axis navigation, translucent orb canvases, and scroll-synced scene choreography used across the modern marketing journey. Iterate within this collection to explore copy, choreography, and module density without changing the underlying framework.

- **Launch Arc (PR #4–#6):** `10-pr-4.html`, `11-pr-5.html`, `12-pr-6.html`.
- **Experience Refinements (PR #8–#14):** `14-pr-8.html`, `15-pr-9.html`, `16-pr-10.html`, `17-pr-11.html`, `18-pr-12.html`, `19-pr-13.html`, `20-pr-14.html`.
- **Blueprint & Deck Explorations (PR #15–#18):** `21-pr-15.html`, `22-pr-16.html`, `23-pr-17.html`, `24-pr-18.html`.
- **Holographic Depth Studies (PR #19–#24):** `25-pr-19.html`, `26-pr-20.html`, `27-pr-21.html`, `28-pr-22.html`, `29-pr-23.html`, `30-pr-24.html` (adds `scripts/immersive-experience-actualizer.js` for amplified choreography).

## Concept Labs & Special Studies
These builds experiment with alternative canvases, typography systems, or research tooling outside of the shared AI stack.

- **`7-pr-1.html` – Polytopal Home Experience:** Combines `styles/clear-seas-home.css` & `styles/main.css` with `scripts/clear-seas-home.js` to keep the original particle field and narrative-led navigation.
- **`8-pr-2.html` – Avant-garde AI Landing:** Uses `styles/avant-garde.css` with `scripts/orbital-field.js` for a cinematic orbiting hero.
- **`9-pr-3.html` – Clear Seas Intelligence Homepage:** Blends `styles/clear-seas-ai.css` with `styles/main.css` for a hybrid presentation that bridges the home and mission-axis directions.
- **`13-pr-7.html` – Visual Codex Gallery:** Inline neon codex with 4D polytopal backgrounds and crystalline gallery narration.
- **`25-orthogonal-depth-progression.html` – Orthogonal Depth Lab:** Couples `scripts/orthogonal-depth-progression.js` with `scripts/vib34d-geometric-tilt-system.js` to map scroll to holographic tilt.
- **`ULTIMATE-clear-seas-holistic-system.html` – Ultimate Holistic System:** Runs the `scripts/ultimate-holistic-vib34d-system.js` choreography for a maximal VIB34D showcase.

## Meta
- **`index.html`** now surfaces these collections with descriptive section copy, meta chips, and lab highlights so teams can jump directly into comparable builds.

## Brand Palette Synchronization

The `global-page-orchestrator` now detects which collection a page belongs to and shares that profile through `window.__CLEAR_SEAS_PAGE_PROFILE`. The four active palettes are:

- **Meta Index (`meta-index`)** – used for the overview map.
- **Core Foundation (`core-foundation`)** – powers the 1–6 flagship builds.
- **Immersive AI (`immersive-ai`)** – covers PR #4–#24 experiences.
- **Concept Labs (`concept-labs`)** – all experimental lab studies.

Each palette drives:

- Unique brand overlay blends, hues, and depth offsets.
- Canvas overscan/tilt scaling so holograms always clear card edges.
- Deterministic brand asset rotation (images & mp4 overlays) so every build receives a distinct mix of the uploaded footage.
- Conditional script preloads (e.g., immersive pages auto-load `immersive-experience-actualizer.js`).

Any custom page can opt into a palette by setting `data-page-collection` or `data-showcase-theme` on `<html>`/`<body>` before loading the orchestrator.

### Page Profile Registry

The new `scripts/page-profile-registry.js` module exposes these group definitions so other scripts can reference them without duplicating logic. It exports a lightweight API:

- `list()` – returns the available profile keys plus their family, palette, and layout metadata.
- `resolve()` – matches the active document against filenames, dataset tags, and title tokens to pick the correct profile.
- `apply()` – applies dataset attributes (`data-global-page-family`, `data-global-page-layout`) and CSS variables (e.g., `--global-brand-accent`) that downstream styles consume.

`global-page-orchestrator.js` now imports the registry directly, ensuring every HTML build shares the same grouping, accent colors, and overlay depth heuristics.

## Global Motion Telemetry

The shared orchestrator now publishes frame-smoothed motion data so satellite scripts and inline styles can react in unison:

- **CSS variables:** `--global-bend-intensity`, `--global-tilt-x`, `--global-tilt-y`, `--global-tilt-strength`, and `--global-warp` join the existing focus/scroll values on `:root`. The latest refresh also adds directional helpers (`--global-focus-trend`, `--global-scroll-speed`, `--global-scroll-direction`, `--global-tilt-skew`) that let cards echo scroll direction and focus acceleration without reimplementing easing.
- **Runtime object:** `window.__CLEAR_SEAS_GLOBAL_MOTION` mirrors the latest focus, tilt, bend, scroll, and synergy readings for JavaScript consumers. Read-only access lets visualizer engines or analytics tap into the same smoothed signals without reimplementing observers.
- **Browser event:** `clear-seas:motion-updated` (also exposed as `window.__CLEAR_SEAS_GLOBAL_MOTION_EVENT`) dispatches whenever the shared motion snapshot shifts. Card systems can subscribe once and receive normalized `focus`, `tilt`, `bend`, `warp`, `scrollMomentum`, and `synergy` values instead of polling.

Tie new modules or shader parameters into these shared signals instead of duplicating interaction listeners to keep every layer phase-aligned.
