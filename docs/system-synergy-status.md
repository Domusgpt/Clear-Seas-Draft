# Clear Seas Interaction System Status

## Overview
The Clear Seas multi-page builds now share a single orchestration layer that watches every interactive card, groups them by their container, and streams the combined motion state through `window.__CLEAR_SEAS_GLOBAL_MOTION`. The latest refinement deepens that coordination by:

- Assigning persistent group identifiers so any layout wrapper (grids, stacks, lists, or section wrappers) can express a stable identity while cards move in and out of view.
- Ranking the three most active groups on each animation frame and exposing their synergy, focus strength, and focal coordinates through global CSS variables **and** the shared motion event payload.
- Blending the ranked group energy into a universal backdrop wash that bends with page focus and scroll momentum, ensuring non-focused sections still reinforce the primary interaction.

## Shared Motion Data
The motion object now contains an additional `groups` array alongside the existing focus, tilt, bend, warp, scroll, and synergy properties. Each entry is shaped as:

```json
{
  "id": 3,
  "rank": 1,
  "synergy": 0.78,
  "focus": 0.62,
  "focusX": 0.41,
  "focusY": 0.57
}
```

The array is kept in rank order (up to three groups) and is also included on the throttled `clear-seas:motion-updated` event so listeners can drive per-section effects without re-traversing the DOM.

## Global Styling Hooks
The orchestrator injects the following CSS custom properties every frame:

| Variable | Description |
| --- | --- |
| `--global-active-group-count` | Number of groups currently contributing to the ranked list. |
| `--global-group-[1-3]-synergy` | Normalised synergy value for the Nth ranked group. |
| `--global-group-[1-3]-focus` | Weighted focus amount for the group (0–1). |
| `--global-group-[1-3]-focus-x/y` | Focus centroid within the group container. |
| `--global-top-groups-synergy` | Weighted blend of the ranked groups, ideal for backdrop intensity. |

These land in addition to the existing root-level focus, tilt, bend, warp, and scroll variables.

The universal stylesheet now paints a fixed-screen `body::before` holographic wash that responds to the ranked group metrics. As cards rally inside any grid, their container glow spills over into the global background, keeping supporting areas animated in unison even when the pointer is locked onto a single card.

## What’s Working Well
- **Group Cohesion:** Supporting cards inherit stable `data-global-group-id` values, so effects can persist during DOM mutations or lazy loading.
- **Event Consumers:** Visualizer scripts listening to `clear-seas:motion-updated` receive richer context without adjusting their subscription logic.
- **Design Harmony:** Every page that loads `global-page-orchestrator.js` automatically benefits from the new variables and the expanded synergy backdrop.

## Future Enhancements
- **Per-Group Brand Blends:** Allow palette overrides to key off `--global-group-[n]-id` for nuanced color modulation.
- **Responsive Thresholds:** Surface the ranking thresholds so minimal layouts can tune how quickly supporting sections join the wash.
- **Server-Side Snapshots:** Export a lightweight manifest of current group IDs and assets to assist static prerenders or previews.

With these additions documented, the builds stay consistent across the 30 linked HTML experiences while leaving a clear roadmap for the next round of polish.
