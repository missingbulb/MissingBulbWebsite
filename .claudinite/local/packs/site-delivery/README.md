# site-delivery

This repo's own pack for **how the site ships**: `site/` is uploaded to GitHub
Pages as-is on every push to `main`, with no build step in between
(`.github/workflows/deploy-pages.yml`, `scripts/bump-version.mjs`,
`site/analytics.js`).

The pack exists because that path has three places where the repo and the
deployed site can disagree while everything stays green — a reference that
resolves locally but is never uploaded, a deploy-time substitution whose two
halves drift apart, and a version the next release reads back out of the file.
Each is a cross-file contract no reader holds in their head, so each is a check.

Distilled 2026-08-02 by the `grow_with_claudinite` `growth-discover-packs` pass,
from this repo's own deploy pipeline.

## Checks (world scope)

| Rule (≤5 words) | Id | How enforced |
|---|---|---|
| Relative refs stay inside artifact | `site-delivery/published-asset-paths` | check (blocking) |
| Deploy placeholder must still exist | `site-delivery/deploy-placeholder-substitution` | check (blocking) |
| Version follows the bump scheme | `site-delivery/release-version-shape` | check (blocking) |

- **`published-asset-paths`** — the Pages artifact is only what the deploy's
  `upload-pages-artifact` `path:` names (`site`). Every relative `href`/`src` in a
  published HTML page must resolve to a tracked file inside that root; anything
  above it is never uploaded and 404s in production while every local view of the
  tree looks correct. The publish root is read out of the workflow, not
  hard-coded. Root-absolute (`/x`) and schemed (`https:`, `mailto:`, `data:`)
  references are deliberately out of scope.
- **`deploy-placeholder-substitution`** — the deploy injects the Cloudflare Web
  Analytics token with `sed -i "s#REPLACE_WITH_…#…#" site/analytics.js`. `sed`
  exits 0 when it matches nothing, so renaming the placeholder — or committing a
  real token over it — silently ships an unpatched file while the deploy logs
  "Injected …". The check holds every literal `sed -i` substitution in the
  workflows against the file it patches.
- **`release-version-shape`** — `scripts/bump-version.mjs` writes
  `1.<mmdd>.<prev patch + 1>` and reads the previous patch back out of
  `package.json`, treating anything unparseable as `0`. An off-scheme version
  therefore resets the counter and the next release ships numbered below one
  already published. Inert unless the bump script is present.

## Prose ([RULES.md](RULES.md))

| Rule (≤5 words) | How enforced |
|---|---|
| Deploy owns the version | prose |
| `site/` is served as-is | prose |

## Fixtures

`pack.test.mjs` — each check red on a violating fixture and quiet on a clean one,
over a synthetic context (no repo state involved):

```
node --test .claudinite/local/packs/site-delivery/
```

CI runs it as the first step of `.github/workflows/checks.yml`, ahead of the
world sweep.
