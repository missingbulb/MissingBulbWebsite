# web-analytics

This repo's own pack for the site's visitor-analytics integration: the
third-party beacon loaded by `site/analytics.js`, the public token the GitHub
Pages deploy substitutes into it at build time, and what the page does while
that token is not there.

Distilled from `site/analytics.js`, `site/index.html`, `site/privacy.html` and
the token-injection step of `.github/workflows/deploy-pages.yml`.

| Rule | How enforced |
|---|---|
| A site script with a build-time placeholder must guard on it and no-op | check `analytics/beacon-placeholder-guard` |
| A placeholder in `site/` must be substituted by a workflow or build script | check `analytics/placeholder-has-injector` |
| A token that ships in the client is a repo variable, never a secret | prose, `RULES.md` |

Both checks are world-scope: they audit the repo as it stands, at every Stop
hook and every CI sweep. `pack.test.mjs` is their see-it-fail fixture — each
rule is asserted to fire on a violating input and stay quiet on the repo's real
shape. Run it with `node --test ".claudinite/local/packs/**/*.test.mjs"` — a
glob, not a directory: `node --test <dir>` resolves the path as a module and
dies. The Checks workflow runs it ahead of the world sweep.

The checks are dependency-free on purpose: a local pack must load even when the
vendored engine mount is absent, so they return plain finding objects instead of
importing the engine's helpers.

## What is not here

Whether the privacy page's claims still match what the beacon collects is
`site-copy`'s rule. Where the deploy pipeline itself should come from is
`repo-mechanics`'. Workflow and runner mechanics are the canon `github-actions`
pack's.
