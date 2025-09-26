# 2025-05-10 – Parserator launch surface & smoke audit cleanup

## Highlights
- Shipped `parserator.html`, the first dedicated Parserator entry point wired into the shared profile registry and asset manifest.
- Wrapped both card system bundles in window-scoped IIFEs so `PRIMARY_BRAND_OVERRIDE_EVENT` is resolved once and shared across scripts.
- Refreshed the smoke-test report after rerunning the Playwright harness; core builds now succeed aside from the missing `ClearSeasContextPool` script on Totalistic and the PR asset placeholders.

## Follow-ups
- Restore the Clear Seas context pool module for 6-index-totalistic so the layered visualizers stop logging bootstrap errors.
- Move PR gallery imagery into `/assets` (or change the references) and rebuild the `/demos` showcase embeds to clear the 404 spam.
- Stand up Parserator-specific scenes (labs, telemetry overlays) once the shared launch surface is approved.
