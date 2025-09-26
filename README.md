# CSS Web Master System – Multi-Site Experience Orchestrator

The CSS Web Master system evolves the original Clear Seas draft showcase into a reusable control hub for upcoming CSS-family properties (e.g., **paraerator.com**, **vib3code.com**) while continuing to ship the reference Clear Seas experiences. It centralizes version indexes, shared motion orchestration, and brand asset management so each site can inherit polished choreography without duplicating engineering work.

## 🚀 Current Deliverables
- **Multi-version gallery (30 builds)** with curated sections that highlight how layouts, scripts, and visualizers overlap across the portfolio.
- **Shared runtime stack** including the global page orchestrator, synergy stylesheet, and VIB34D visualizer hooks that drive synchronized tilt/bend interactions between cards, overlays, and holographic canvases.
- **Documentation suite** outlining page collections, brand override workflows, and motion telemetry so teams can extend or remix existing builds with confidence.

Visit the **[Master Index](https://domusgpt.github.io/Clear-Seas-Draft/)** to explore every shipped build from a single entry point.

## 🗂 Version Collections
The system organizes HTML builds into families based on their structure, stylesheets, and runtime controllers. Use this taxonomy to decide where a new concept should live or which builds to compare when refining choreography.

| Collection | Files | Shared Stack Highlights |
| --- | --- | --- |
| **Core System Foundation** | `1-index.html` – `6-index-totalistic.html` | Production-ready stacks that blend consolidated styles with `vib34d-contained-card-system.js` variations.
| **Immersive AI Command Deck** | `10-pr-4.html` – `30-pr-24.html` | Uses `styles/clear-seas-ai.css` + `scripts/clear-seas-ai.js` plus optional immersive amplifiers for holographic depth.
| **Concept Labs & Studies** | `7-pr-1.html`, `8-pr-2.html`, `9-pr-3.html`, `13-pr-7.html`, `25-orthogonal-depth-progression.html`, `ULTIMATE-clear-seas-holistic-system.html` | Experimental canvases, typography explorations, and standalone VIB34D showcases.

Reference [`docs/html-version-groups.md`](docs/html-version-groups.md) for detailed breakdowns, palette usage, and runtime notes.

## 🔁 Shared Infrastructure
The following modules convert the Clear Seas prototype code into a reusable CSS Web Master layer:

- **`scripts/page-profile-registry.js`** exposes family metadata, brand palettes, and deterministic asset rotations that can be shared by future sites.
- **`scripts/global-page-orchestrator.js`** injects the synergy stylesheet, synchronizes scroll/pointer motion, and emits CSS variables + custom events so every card element reacts cohesively.
- **`styles/global-card-synergy.css`** scales canvases beyond card edges, applies bend-aware transforms, and ensures overlays echo the same motion signatures as their host cards.
- **`scripts/vib34d-contained-card-system.js`** adapts VIB34D canvases for contained cards and listens to the shared motion bus for tilt, bend, and warp cues.

Supporting guides:
- [`docs/brand-asset-overrides.md`](docs/brand-asset-overrides.md)
- [`docs/global-motion-reference.md`](docs/global-motion-reference.md)

## 🧭 Roadmap Toward a Full CSS Web Master Release
To serve additional CSS web properties, the system needs:

1. **Site-Agnostic Configuration** – promote brand/color definitions from the Clear Seas defaults into environment-specific JSON/YAML configs.
2. **Asset Packaging Strategy** – define how uploaded MP4/logo assets map to each domain (naming scheme, CDN structure, fallback tiers).
3. **Deployment Templates** – document or script GitHub Pages / CDN deployment steps for each downstream site.
4. **Automated Testing Hooks** – add smoke tests (Lighthouse, interaction snapshots) to ensure shared orchestration stays stable across variants.

Progress on these items will be tracked in the Dev Updates (see below) and folded into documentation as features land.

## 📝 Dev Updates
All implementation notes, rationale, and follow-up tasks are captured in dated entries under [`docs/dev-updates/`](docs/dev-updates/). Start with the latest report for a full summary of the current sprint.

---
© 2025 CSS Web Master Initiative (Clear Seas Solutions lineage)
