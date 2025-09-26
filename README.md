🌐 **CSS-Web-Master System** _(formerly the Clear Seas Draft showcase)_

The repository now serves as the **CSS-Web-Master** control surface for the Clear Seas family of properties. It retains every
historical Clear Seas Draft experience while layering documentation, orchestration guides, and asset registries so new landing
pages—like **parserator.com**, **vib3code.com**, and future CSS destinations—can inherit the same choreography with minimal
duplication.

Runtime globals now expose both `__CSS_WEB_MASTER_*` and legacy `__CLEAR_SEAS_*` namespaces, and shared typography/color tokens
live in `styles/css-web-master-tokens.css` so each property can reskin the choreography without forking the master styles.
Brand asset rotations are sourced from `scripts/site-asset-manifest.js`, and teams can call
`window.__CSS_WEB_MASTER_REGISTER_ASSET_MANIFEST` to swap media packs per property without touching the orchestrator core.

### ✅ Deployment Snapshot
- **6 Main HTML Versions**: Baseline production-ready experiences.
- **Parserator Launch Surface**: `parserator.html` boots the `parserator-alpha` profile with CSS-Web-Master orchestration.
- **13 PR Branch Versions**: Themed explorations sourced from the showcase (PRs #1, #4–#24).
- **Supporting Assets**: Shared scripts, orchestrators, style systems, and uploaded video/logo packs.

### 🎯 Access Everything
Use the **[Master Index](https://domusgpt.github.io/Clear-Seas-Draft/)** to browse every build. The index now highlights where
modules overlap so you can pick the correct starting point for each CSS family site.

### 🚀 Deploying from GitHub Pages
1. Push the latest `work` branch to GitHub.
2. In the repository settings, open **Pages** → **Build and deployment** and choose **Deploy from a branch**.
3. Select the `work` branch and the **/** (root) directory, then save.
4. After GitHub Pages finishes building, the published site will mirror this repository's root—`index.html`, `parserator.html`,
   the Master Index, and every supporting asset will be available under the Pages hostname.
5. Re-run the smoke tests (`python tests/html_smoke_test.py`) after major updates so the latest report reflects the live Pages
   deployment gaps.

---

## 📋 Version Collections

### Core HTML Versions (1-6):
1. **Production** - Main website (index.html)
2. **Optimized** - Performance enhanced
3. **Fixed** - Bug fixes applied
4. **Unified** - Unified architecture
5. **VIB34D Integrated** - Advanced 4D visualization
6. **Totalistic** - Complete experience

### Site launch surfaces
- **Parserator Systems** – [`parserator.html`](parserator.html) activates the parserator-specific profile while preserving the
  Clear Seas fallbacks.

### PR Branch Versions (7-30):
- **7-pr-1** - Initial avant-garde consulting experience
- **18-pr-12** - Streamlined fit-focused pitch
- **19-pr-13** - Visual Codex polish refinements
- **20-pr-14** - Minimal fit-focused messaging
- **21-pr-15** - Scroll-locked showcase rebuild
- **22-pr-16** - Placeholder staging deck rebuild
- **23-pr-17** - Placeholder blueprint with scroll staging
- **24-pr-18** - Reimagined layout with holographic depth
- **25-pr-19** - Reimagined card system with holographic depth
- **26-pr-20** - Deepened placeholder narrative and interactions
- **27-pr-21** - Immersive blueprint with signal lab scaffolding
- **28-pr-22** - Multi-layer interactions expansion
- **29-pr-23** - Holographic background with pinned showcases
- **30-pr-24** - Amplified reactive background and card choreography

🚀 **Core versions load successfully; PR galleries still reference placeholder imagery/iframes (see the smoke report for open
items).**

### Motion choreography docs

The shared motion bus, CSS variables, and integration guidance are documented in
[`docs/global-motion-reference.md`](docs/global-motion-reference.md).

Additional CSS-Web-Master documentation is tracked in:

- [`docs/css-web-master-system-overview.md`](docs/css-web-master-system-overview.md) – explains the multi-site orchestration
  model, shared registries, and how to extend the system for new CSS properties.
- [`docs/css-web-master-gap-analysis.md`](docs/css-web-master-gap-analysis.md) – outlines Clear Seas-specific assumptions to
  generalize before production rollouts on parserator.com or vib3code.com.
- [`docs/dev-updates/2025-05-07-css-web-master-transition.md`](docs/dev-updates/2025-05-07-css-web-master-transition.md) –
  developer log detailing the latest transition steps and recommended next moves.
- [`docs/dev-updates/2025-05-10-parserator-launch-surface.md`](docs/dev-updates/2025-05-10-parserator-launch-surface.md) –
  documents the Parserator entry point, brand-event dedupe, and the current smoke-test focus areas.
- [`styles/css-web-master-tokens.css`](styles/css-web-master-tokens.css) – neutral design tokens consumed by consolidated
  stylesheets for per-site overrides.
- [`docs/html-version-test-report.md`](docs/html-version-test-report.md) – latest smoke-test results for every HTML build and the
  outstanding defects to close before CSS-Web-Master goes live.
- `node [tools/validate-asset-manifest.mjs](tools/validate-asset-manifest.mjs)` – verifies manifest paths exist and that site
  manifests include tagged assets before deployment.

---
© 2025 Paul Phillips - Clear Seas Solutions LLC
