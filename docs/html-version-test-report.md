# HTML Version Smoke Test Report

_Updated: 2025-05-11_

## Test methodology
- A new Playwright smoke harness (`tests/html_smoke_test.py`) serves the repository through a temporary HTTP server and opens every top-level HTML file in headless Chromium. It records console errors, page exceptions, failed network requests, and HTTP 4xx/5xx responses so we can distinguish real defects from environment limitations.【F:tests/html_smoke_test.py†L1-L114】
- Run the audit locally with `python tests/html_smoke_test.py > out.json`. The script prints progress to stderr while writing a JSON summary to stdout so the raw results can be inspected or re-aggregated for new reports.【F:tests/html_smoke_test.py†L85-L114】

## Environment caveats
- **Google Fonts / external HTTPS** – the container image lacks the public CA bundle Playwright expects, so calls to `fonts.googleapis.com` fail with `net::ERR_CERT_AUTHORITY_INVALID`. Treat these as environment warnings unless they surface in production browsers.【F:tests/html_smoke_test.py†L49-L79】
- **Large MP4 downloads** – several pages stream multi-megabyte hero videos. The headless browser cancels those downloads when navigation completes, producing `net::ERR_ABORTED`. Video playback works once the assets live on CDN or when tests wait for the streams to finish; no in-page error surfaced.【F:tests/html_smoke_test.py†L44-L79】
- **Load-state timeouts** – pages 28 and 30 continue requesting 404 images, so `page.goto(... wait_until="load")` never resolves within 20 seconds. Increasing the timeout lets the audit finish but does not hide the underlying missing assets. The navigation timeouts are flagged as actionable defects below.【F:tests/html_smoke_test.py†L61-L72】

## Results summary
| HTML file | Status | Notes |
| --- | --- | --- |
| 1-index.html | ⚠️ | Only external Google Fonts requests fail inside the container. |
| 2-index-optimized.html | ⚠️ | Same Google Fonts warning as 1-index. |
| 3-index-fixed.html | ⚠️ | Only external Google Fonts requests fail inside the container. |
| 4-index-unified.html | ⚠️ | Only external Google Fonts requests fail inside the container. |
| 5-index-vib34d-integrated.html | ⚠️ | Only external Google Fonts requests fail inside the container. |
| 6-index-totalistic.html | ❌ | `ClearSeasContextPool` still never loads, so the layered visualizer bootstrap logs an error. |
| 7-pr-1.html | ⚠️ | Only Google Fonts blocked by environment. |
| 8-pr-2.html | ⚠️ | Only Google Fonts blocked by environment. |
| 9-pr-3.html | ⚠️ | Google Fonts blocked and long MP4 downloads abort when the browser exits. |
| 10-pr-4.html | ❌ | Image cards reference `styles/assets/*.png`, but the images live in `/assets` so every card graphic returns 404. |
| 11-pr-5.html | ❌ | Same missing `styles/assets` imagery as 10-pr-4. |
| 12-pr-6.html | ❌ | Same missing `styles/assets` imagery as 10-pr-4. |
| 13-pr-7.html | ❌ | Embedded showcase iframes point to `/demos/*.html`, which are absent. |
| 14-pr-8.html | ❌ | Same missing `styles/assets` imagery as 10-pr-4. |
| 15-pr-9.html | ❌ | Same missing `styles/assets` imagery as 10-pr-4. |
| 16-pr-10.html | ❌ | Same missing `styles/assets` imagery as 10-pr-4. |
| 17-pr-11.html | ❌ | Same missing `styles/assets` imagery as 10-pr-4. |
| 18-pr-12.html | ❌ | Same missing `styles/assets` imagery as 10-pr-4. |
| 19-pr-13.html | ❌ | Same missing `styles/assets` imagery as 10-pr-4. |
| 20-pr-14.html | ⚠️ | Only Google Fonts blocked and hero MP4 streams cancelled when the browser closes. |
| 21-pr-15.html | ❌ | Same missing `styles/assets` imagery as 10-pr-4. |
| 22-pr-16.html | ❌ | Same missing `styles/assets` imagery as 10-pr-4. |
| 23-pr-17.html | ❌ | Same missing `styles/assets` imagery as 10-pr-4. |
| 24-pr-18.html | ❌ | Same missing `styles/assets` imagery as 10-pr-4. |
| 25-orthogonal-depth-progression.html | ⚠️ | Only Google Fonts blocked by environment. |
| 25-pr-19.html | ❌ | Same missing `styles/assets` imagery as 10-pr-4. |
| 26-pr-20.html | ❌ | Same missing `styles/assets` imagery as 10-pr-4. |
| 27-pr-21.html | ❌ | Same missing `styles/assets` imagery as 10-pr-4. |
| 28-pr-22.html | ❌ | Load event never finishes because every `styles/assets` image 404s; audit hit the 20s timeout. |
| 29-pr-23.html | ❌ | Same missing `styles/assets` imagery as 10-pr-4. |
| 30-pr-24.html | ❌ | Load event never finishes because every `styles/assets` image 404s; audit hit the 20s timeout. |
| ULTIMATE-clear-seas-holistic-system.html | ⚠️ | Google Fonts blocked and hero MP4 streams cancelled when the browser closes. |
| index.html | ✅ | Navigation reaches `load` with no runtime or network errors. |
| parserator.html | ⚠️ | Only external Google Fonts requests fail inside the container. |

The `PRIMARY_BRAND_OVERRIDE_EVENT` redeclaration is resolved, so the core builds now load successfully; Totalistic still needs the
`ClearSeasContextPool` script restored, and the PR galleries continue to 404 their placeholder assets.

## Next steps
1. **Fix static asset paths** – update the PR showcase templates so card imagery references `/assets/*.png` (or move the files under `styles/assets/`). The same adjustment is needed for the missing `/demos/*.html` showcase embeds.
2. **Load the ClearSeas context pool** – ensure `6-index-totalistic.html` includes the script that defines `window.ClearSeasContextPool` so the layered visualizers initialise without logging an error.
3. **Optional test hardening** – if we need fully green runs inside CI, bundle critical fonts locally and host video fixtures under `/assets` so the smoke harness avoids remote TLS altogether.

## Page-by-page upgrade plan

- **index.html** – primary launch surface. The card motion is now smoothed through the shared motion bus, so focus on content polish and call-to-action wiring.
- **1-index.html / 2-index-optimized.html / 3-index-fixed.html** – keep typography fonts local to avoid TLS warnings and revisit hero video fallbacks so large downloads do not cancel on navigation.
- **4-index-unified.html** – card tilt now respects the calmer global motion state; next step is replacing remote iframes with in-repo captures and wiring manifest-driven imagery.
- **5-index-vib34d-integrated.html** – same tilt smoothing applies. Audit embedded viewer URLs and align branding tokens with the CSS-Web-Master palette.
- **6-index-totalistic.html** – still blocked on the missing `ClearSeasContextPool`; restore the loader script and verify the layered canvases ingest the moderated motion signals.
- **7-pr-1.html through 30-pr-24.html** – resolve the 404 asset paths (`styles/assets/*`) and either supply the `/demos/*.html` embeds or update the galleries to reuse existing pages. Each PR template should point at the curated `/assets` manifest so the new tilt curve lands on real art.
- **25-orthogonal-depth-progression.html** – confirm the orthogonal depth lab reads from the shared motion state and bundle any specialty fonts locally.
- **ULTIMATE-clear-seas-holistic-system.html** – big hero videos still abort when the browser closes; preload lighter-weight clips or provide poster frames so the experience survives audits.
- **parserator.html** – the parserator profile loads cleanly apart from Google Fonts; next iteration should wire the parserator asset tags into the manifest and replace the remote font dependency.
