# Global Motion Telemetry Reference

The `global-page-orchestrator` continuously samples every orchestrated card, smooths the
results, and emits a shared motion snapshot so all Clear Seas builds can react in
lockstep. This document lists the fields, CSS variables, and recommended integration
patterns for downstream systems.

## Runtime snapshot

The orchestrator stores the latest values on `window.__CLEAR_SEAS_GLOBAL_MOTION` and
dispatches them through the `clear-seas:motion-updated` event (also exported as
`window.__CLEAR_SEAS_GLOBAL_MOTION_EVENT`). Each dispatch now includes the following
properties:

| Field | Description |
|-------|-------------|
| `focusX`, `focusY` | Smoothed pointer centroid for the currently emphasised cards (0–1).
| `focusAmount` | Aggregated focus weight across all visible cards (0–1+). |
| `focusTrend` | Frame-to-frame delta of `focusAmount`, eased to highlight acceleration towards/away from the focus. |
| `tiltX`, `tiltY` | Global tilt vector derived from pointer position and scroll momentum. |
| `tiltStrength` | Magnitude of the tilt vector, already clamped to 0–1. |
| `tiltSkew` | Difference between `tiltX` and `tiltY`, useful for twist/warp treatments. |
| `bend` | Shared bending intensity that factors focus, synergy, and scroll momentum. |
| `warp` | Complementary warp component for shader modulation. |
| `scrollMomentum` | Normalised scroll velocity (can exceed 1 during rapid flicks). |
| `scrollSpeed` | Smoothed absolute scroll magnitude (0–1). |
| `scrollDirection` | Directional indicator: `-1` up, `0` idle, `1` down. |
| `synergy` | Global cohesion score derived from active card groups. |
| `palette`, `collection` | Active page palette token and collection key. |
| `timestamp` | High-resolution timestamp for the snapshot. |

Tilt vectors now weight the eased focus centroid, synergy cohesion, and scroll velocity
so the entire stack leans gracefully around the emphasised card without abrupt jumps.
Bend intensity inherits the same blend, which keeps overlays, canvases, and support
elements moving in concert.

Consumers that only need the latest state can read from
`window.__CLEAR_SEAS_GLOBAL_MOTION`. For reactive experiences, listen for the shared
event:

```js
window.addEventListener(window.__CLEAR_SEAS_GLOBAL_MOTION_EVENT, (event) => {
  const motion = event.detail;
  // ...update shaders, canvases, analytics, etc.
});
```

## CSS variables

`global-page-orchestrator.js` mirrors the snapshot as root-level CSS custom properties.
The latest release adds four directional helpers:

| CSS variable | Meaning |
|--------------|---------|
| `--global-focus-trend` | Signed focus acceleration used to offset backgrounds and glow stacks. |
| `--global-scroll-speed` | Absolute scroll momentum for blur/glow amplification. |
| `--global-scroll-direction` | Direction multiplier for directional shadows and parallax. |
| `--global-tilt-skew` | Horizontal vs. vertical tilt imbalance for twist treatments. |

The shared `global-card-synergy.css` stylesheet consumes these properties so primary and
support cards can react together. Cards that opt into the motion feed can also copy the
values onto local variables (`--shared-focus-trend`, etc.) to cascade them into their own
transforms or shader uniforms.

### Static catalog pages

Set `data-orchestrator-mode="static"` on the `<body>` (or
`data-disable-global-orchestrator`) when you only need the page profile metadata but want
to skip heavy observers, canvases, and brand overlays. In static mode the orchestrator
publishes a neutral motion snapshot, seeds the palette/family metadata, and leaves the
page free of injected stylesheets so index-style catalogs stay lightweight.

## Card system integration

Both card controller implementations now propagate the extended motion fields:

- `scripts/card-system-initializer.js` applies `--shared-scroll-direction`,
  `--shared-scroll-speed`, `--shared-focus-trend`, and `--shared-tilt-skew` to each card.
- `scripts/vib34d-contained-card-system.js` normalises the same fields so contained
  holographic canvases, overlays, and shader parameters receive consistent inputs even
  when they are instantiated outside the main orchestrator.

When building a new module, prefer reading these shared custom properties rather than
attaching bespoke event listeners. This keeps every layer synchronised around the focus
card and avoids competing easing loops.

## Suggested use cases

1. **Shader uniforms:** Map `focusTrend` or `scrollSpeed` to bloom or particle density so
   rapid scroll accelerates the visuals while idle states settle gracefully.
2. **Parallax layers:** Apply `--global-scroll-direction` to background translate values
   so supporting elements lean in the direction of travel.
3. **Brand overlays:** Use `--shared-tilt-skew` to counter-rotate logos or frame elements,
   keeping them visually locked to the card even during aggressive tilts.
4. **Analytics:** Record motion bursts by observing `focusTrend` spikes without polling
   pointer events yourself.

By funnelling every reactive surface through this shared snapshot, Clear Seas pages can
maintain the "everyone moves together" choreography the design direction calls for.
