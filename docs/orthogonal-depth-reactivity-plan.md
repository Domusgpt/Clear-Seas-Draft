# Orthogonal Depth Reactivity Rebuild Roadmap

This roadmap captures the staged rebuild required to deliver the "refined and proper" Clear Seas reactive card progression.  Each phase tightens the choreography between the progression cards, VIB3-4D visualizers, portal canvases, and the ambient field so **every action drives at least two coordinated responses**.

---

## Phase 1 — Systems Architecture & Dual-Reaction Foundation *(current pull request)*
- Introduce a formal reactivity orchestrator that observes progression state changes and pointer / scroll input.
- Pipe every interaction into **paired responses** (active card + background field, active card + incoming card, card visualizer + portal visualizer) using lightweight CSS custom properties and the existing VIB34D APIs.
- Enrich the VIB34D tilt visualizer and portal renderer with `applyInteractionResponse` / `applyReactiveImpulse` hooks, giving the orchestrator a deterministic way to modulate speed, glitch, density, depth, hue, and flourish energy.
- Establish ambient background parallax and intra-card glow layers that animate via CSS transitions so motions remain smooth even when JavaScript pulses are brief.

## Phase 2 — Trait Hand-off Micro-choreography
- Extend the orchestrator to listen for destruction events and orchestrate choreographed trait transfers: dying card performs a multi-stage collapse while the successor card mirrors the effect with inverse density and inherited geometry seeds.
- Layer in audio-reactive channels (FFT bands from the Ultimate Viewer engine) that modulate both the background field and the focused card’s moiré / glitch envelopes.
- Add scroll velocity sampling so rapid scrolls trigger higher-order responses (e.g., card orbiting, portal vortex shearing) while gentle scrolls surface subtle parallax and color grading changes.

### Phase 2 Progress Update *(current work)*
- Trait inheritance now travels through a formal handshake signal. Destruction sequences generate gift-bearing trait packets that pre-charge the incoming card’s tilt visualizer and portal before it reaches focus.
- Portal visualizers respond to inherited gifts with bespoke geometry variants (spiral, filament, prism, axon) and intensity boosts so the successor canvas always reacts in tandem with the outgoing collapse.
- The reactivity orchestrator listens for `trait-handshake` broadcasts and coordinates glow, portal, and background surges to satisfy the dual-entity motion requirement during transfers.

## Phase 3 — Magazine-grade Presentation Polish
- Integrate page-level typography and navigation polish inspired by versions #30 and #1, ensuring the novel depth progression still reads like a “master class” scrolling site.
- Add choreographed entrance / exit cinematics for menus, copy blocks, and metrics panels so they tether visually to the card and portal responses.
- Implement persistent session memory of trait evolution so revisiting cards shows evolved geometry palettes instead of resetting to defaults.

## Phase 4 — Hyper Reactive Refinements
- Blend Ultimate Viewer presets for touch, swipe, audio, and idle states into the orchestrator so each input channel has curated presets (e.g., idle breathing, swipe ribbon casting, hold-induced dimensional lifts).
- Introduce per-card shader swaps (WebGL or WASM pipelines) for the background field that react to inherited traits, ensuring every card transition feels bespoke in both geometry and chroma.
- Add detailed destruction cinematics with timed particle systems and inter-card crossfades, finalizing the “spectacular choreographed event” requirement.

---

> **Implementation Note:** The current code submission completes Phase 1 by wiring the orchestrator, reactivity hooks, and shared polish layers.  Subsequent phases build directly on this foundation.
