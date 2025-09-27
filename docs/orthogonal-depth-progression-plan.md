# Orthogonal Depth Progression Revamp Plan

## Experience North Star
- Deliver a "master class" scroll replacement where cards glide through a depth corridor with cinematic grace.
- Every interaction (scroll, pointer, tap, tilt, audio) must trigger *paired* reactions: one on the active card, one on a complementary system (next card, backdrop, portal, audio bed, etc.).
- Visualizers inherit traits across the progression so each destruction blossoms into a new geometry with deliberate choreography and color evolution.
- Maintain the Clear Seas professional aesthetic: neon glassmorphism, precise typography, and responsive motion tuned for both desktop and mobile.

## Architectural Pillars
1. **Progression Spine** – The `OrthogonalDepthProgression` engine orchestrates z-axis staging, portal activation, and trait transfer.
2. **Visualizer Core** – The VIB3-4D tilt visualizers render the card backdrops and accept modulation from the conductor.
3. **Portal Overlay** – Canvas-based portal text visualizers that echo the current trait and react to interaction pulses.
4. **Reactive Synergy Conductor** – A new layer that listens to input (pointer, touch, scroll delegates, audio later) and applies relational responses to the focused card, neighboring cards, and the ambient backdrop.
5. **Thematic Skin** – A dedicated stylesheet sets the glassy frame, depth perspective, and per-system color harmonics so we can dial polish without inline clutter.

## Phase Breakdown
### Phase 1 – Foundation & Conductor (this PR)
- Document the experience goals (this file).
- Extract a dedicated stylesheet with theme variables, backdrop gradients, and state-driven transforms using CSS custom properties.
- Add a `ReactiveSynergyConductor` that:
  - Tracks pointer/touch motion and feeds paired responses to the focused card and its successor.
  - Binds to progression events to retheme the environment per card system.
  - Animates the depth backdrop in inverse relation to card tilt for spatial cohesion.
- Extend progression, portal, and VIB3-4D systems with an event bus and relational response hooks so multiple entities react to each interaction.

### Phase 2 – Scrollless Storytelling
- Build segmented storyline timelines per card (copy, metrics, CTA microstates).
- Replace manual buttons with gesture and tempo-aware auto progression (tempo dictated by interaction energy + audio amplitude).
- Layer in choreographed destruction scenes that emit synchronized particle bursts across card, portal, and background.

### Phase 3 – Audio-Reactive Polyrhythms
- Bring in Web Audio analysis to modulate glitch, moiré, and depth pulses.
- Let the conductor synchronize tempo between audio energy and progression cadence; add spectral color cycling tied to frequency bands.

### Phase 4 – Performance & Accessibility Polish
- Audit GPU/canvas load, add adaptive throttling, and expose reduced-motion toggles.
- Tighten keyboard/touch parity, ARIA announcements for state changes, and ensure contrast ratios remain compliant under all palettes.

> This phase plan is our contract—each follow-up will build on this scaffolding until the Clear Seas experience matches the requested polish.
