# HTML Version Smoke Test Report

_Generated 2025-09-26T15:15:43.370Z_

This report captures a filesystem-level smoke test of every HTML build in the repository. The automated scan looks for broken relative asset references (scripts, stylesheets, images, and videos) so we can quickly spot pages that need follow-up fixes before promoting them into the CSS-Web-Master production baseline.

## Summary

- **Total HTML builds scanned:** 33
- **Passing builds (no missing local assets):** 29
- **Builds with missing assets:** 4

### Missing asset patterns

- `gallery-proper-system.html` referenced by 4 pages

## Detailed results

| Page | Assets Checked | Missing Assets | Status |
| --- | --- | --- | --- |
| `1-index.html` | 2 | — | ✅ Pass |
| `10-pr-4.html` | 5 | `gallery-proper-system.html` | ⚠️ Missing assets |
| `11-pr-5.html` | 3 | — | ✅ Pass |
| `12-pr-6.html` | 4 | — | ✅ Pass |
| `13-pr-7.html` | 1 | — | ✅ Pass |
| `14-pr-8.html` | 3 | — | ✅ Pass |
| `15-pr-9.html` | 5 | `gallery-proper-system.html` | ⚠️ Missing assets |
| `16-pr-10.html` | 5 | `gallery-proper-system.html` | ⚠️ Missing assets |
| `17-pr-11.html` | 5 | `gallery-proper-system.html` | ⚠️ Missing assets |
| `18-pr-12.html` | 4 | — | ✅ Pass |
| `19-pr-13.html` | 5 | — | ✅ Pass |
| `2-index-optimized.html` | 9 | — | ✅ Pass |
| `20-pr-14.html` | 4 | — | ✅ Pass |
| `21-pr-15.html` | 5 | — | ✅ Pass |
| `22-pr-16.html` | 5 | — | ✅ Pass |
| `23-pr-17.html` | 5 | — | ✅ Pass |
| `24-pr-18.html` | 5 | — | ✅ Pass |
| `25-orthogonal-depth-progression.html` | 3 | — | ✅ Pass |
| `25-pr-19.html` | 5 | — | ✅ Pass |
| `26-pr-20.html` | 5 | — | ✅ Pass |
| `27-pr-21.html` | 5 | — | ✅ Pass |
| `28-pr-22.html` | 5 | — | ✅ Pass |
| `29-pr-23.html` | 5 | — | ✅ Pass |
| `3-index-fixed.html` | 3 | — | ✅ Pass |
| `30-pr-24.html` | 6 | — | ✅ Pass |
| `4-index-unified.html` | 4 | — | ✅ Pass |
| `5-index-vib34d-integrated.html` | 12 | — | ✅ Pass |
| `6-index-totalistic.html` | 6 | — | ✅ Pass |
| `7-pr-1.html` | 4 | — | ✅ Pass |
| `8-pr-2.html` | 3 | — | ✅ Pass |
| `9-pr-3.html` | 4 | — | ✅ Pass |
| `ULTIMATE-clear-seas-holistic-system.html` | 2 | — | ✅ Pass |
| `index.html` | 33 | — | ✅ Pass |

### Next steps

- Replace or remove the `gallery-proper-system.html` links that remain in PR builds #4, #9, #10, and #11. The destination page is not present in the repository, so the “Explore the Codex” CTA opens a 404.
- Rerun the smoke tester (`node scripts/html-smoke-tester.js`) after asset or link updates to keep this report current.
- Layer interactive QA (scroll choreography, card system interactions, audio/tilt behavior) on top of this asset audit so we can document runtime issues alongside missing files.
