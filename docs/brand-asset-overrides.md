# Brand Asset Overrides

The Clear Seas orchestrator, contained card system, and VIB34D contained visualizers now share the same brand override pipeline. Overrides can be applied in two complementary ways:

1. **Per-card data attributes** – add attributes directly to any card element.
2. **Runtime configuration** – populate `window.__CLEAR_SEAS_CARD_BRAND_OVERRIDES` before the orchestrator runs.

Both approaches are normalized by `window.__CLEAR_SEAS_BRAND_OVERRIDE_API`, so the same rules automatically flow into every card controller.

## Supported data attributes

Attach one or more of the following attributes to any element detected as a card (`[data-visualizer-card]`, `[data-card]`, `.global-visualizer-card`, etc.). All attributes are optional; supply only what you need.

| Attribute | Description |
|-----------|-------------|
| `data-brand-mode="video | image | auto"` | Forces the primary asset type. `auto` keeps the original heuristic. |
| `data-brand-images="img1.png, img2.png"` | Comma or newline separated list of image sources to rotate through. |
| `data-brand-videos="clip1.mp4, clip2.mp4"` | Comma or newline separated list of video sources. |
| `data-brand-image-src` / `data-brand-video-src` | Shorthand for a single image or video. |
| `data-brand-palette="concept"` | Overrides the palette token used for CSS theming. |
| `data-brand-overlay-blend`, `data-brand-overlay-filter`, `data-brand-overlay-opacity`, `data-brand-overlay-rotate`, `data-brand-overlay-depth` | Per-card overlay styling. |
| `data-card-canvas-scale`, `data-card-canvas-depth` | Adjusts visualizer canvas scaling/depth. |
| `data-brand-seed-offset` | Integer offset added to the rotation seed for this card. |
| `data-brand-cycle="focus,click"` | Comma separated triggers that advance to the next asset. Supported triggers: `focus`, `click`, `interaction`. |
| `data-brand-cycle-on-focus`, `data-brand-cycle-on-click` | Boolean shortcuts for cycling on a specific trigger. |
| `data-brand-cycle-step` | Numeric increment applied when cycling; defaults to `1`. |

## Runtime configuration

Provide an array of override descriptors before the orchestrator script executes:

```html
<script>
window.__CLEAR_SEAS_CARD_BRAND_OVERRIDES = [
  {
    selector: '.mission-card',
    mode: 'video',
    videos: ['assets/missions/loop-01.mp4', 'assets/missions/loop-02.mp4'],
    palette: 'immersive',
    overlay: {
      blend: 'color-dodge',
      opacity: 1.2
    },
    cycle: ['focus', 'click']
  }
];
</script>
```

Keys mirror the data attributes and accept the same value shapes. The orchestrator merges all matching descriptors (ordered as provided), then layers data attributes on top.

## Site asset manifest

Each site can point the orchestrator at a different base image/video rotation without editing the core script. The default packs
live in `scripts/site-asset-manifest.js`, and the orchestrator exposes a helper for runtime updates:

```html
<script type="module">
  window.__CSS_WEB_MASTER_REGISTER_ASSET_MANIFEST?.({
    parserator: {
      images: [
        {
          src: 'assets/parserator/logo.png',
          siteCodes: ['parserator'],
          tags: ['hero', 'logo']
        },
        {
          src: 'assets/parserator/hangar.png',
          siteCodes: ['parserator'],
          tags: ['diagnostic']
        }
      ],
      videos: [
        {
          src: 'assets/parserator/atmos-loop.mp4',
          siteCodes: ['parserator'],
          tags: ['ambient']
        }
      ]
    }
  }, { reason: 'parserator-brand-pack' });
</script>
```

The helper merges the manifest, refreshes the current page profile's media selection, and dispatches the same
`css-web-master:brand-overrides-changed` / `clear-seas:brand-overrides-changed` events that card systems already listen for.
If no runtime manifest is provided the default Clear Seas pack remains in rotation.

### Manifest metadata

Entries can either be bare strings (for backwards compatibility) or objects with additional metadata. The orchestrator now
tracks the following fields for every asset:

- `src` – required path to the image or video.
- `siteCodes` – optional list of site tokens. When a page resolves to one of these tokens the manifest will prefer the tagged
  assets. If no tagged assets exist the orchestrator falls back to the inherited pack.
- `tags` – free-form descriptors (`hero`, `diagnostic`, `ambient`, etc.) used for reporting and future tooling.
- `label` – human-readable description that surfaces in debugging overlays.
- `weight` – optional numeric hint for future weighted rotations.

The resolved brand bundle (available via `window.__CSS_WEB_MASTER_BRAND_ASSETS`) now includes a `meta` map so downstream systems
can inspect tags or site codes without re-parsing the manifest.

### Validating manifest entries

Run the repository's validator to confirm every manifest path exists and that site-specific manifests include tagged assets:

```bash
node tools/validate-asset-manifest.mjs
```

The script fails when files are missing and warns when site manifests do not tag at least one asset with their site code. This
keeps rotations deterministic as new CSS family properties come online.

## Updating overrides at runtime

When overrides change after the orchestrator has initialised, call the shared refresh helper to keep every card system in sync:

```js
window.__CLEAR_SEAS_BRAND_OVERRIDE_API?.refresh({ reason: 'hot-swap' });
```

The call recomputes global overrides, resets per-card asset cycles, and dispatches the `clear-seas:brand-overrides-changed` event. All orchestrated cards, the legacy initializer, and the VIB34D contained system listen for that event and immediately reapply overlays, canvases, and brand media.

## Behaviour

* Asset rotation respects a shared `assetCycle` counter so focus or click interactions can advance to the next override asset without affecting the global rotation for other cards.
* Overrides cascade to the legacy `card-system-initializer.js` and the VIB34D contained system, so contained visualizers, standard cards, and global orchestrated cards all honor the same configuration.
* When no overrides are supplied, the previous behaviour is unchanged.
