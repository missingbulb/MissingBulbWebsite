# site-delivery — rules

How this site reaches production: `site/` is uploaded to GitHub Pages as-is on
every push to `main`, with no build in between. What follows is the judgment part
of that; the mechanical parts are checks (see [README.md](README.md)).

## The version in `package.json` belongs to the deploy — never bump it yourself

`package.json` carries no dependencies and drives no build. Its own description
says what it is for: *"This file exists to carry the released version."* The
number is written by `scripts/bump-version.mjs`, which the Pages deploy runs
**after** a change has already landed on `main`, then commits back with
`[skip ci]`.

So a version bump written in a feature branch is a claim about a release that
hasn't happened, and it lands in the middle of a workflow built to defend that
number: the deploy's push loop rebases and retries up to five times precisely
because "the Claudinite scheduler and its maintenance PRs also land on main, and
a race here would otherwise lose the bump." A hand bump either loses to that
loop or wins and leaves the repo naming a version that never shipped.

If a change *needs* a version — release notes, a support question — read the one
the last deploy wrote (`git log -1 --format=%s -- package.json`); don't write a
new one. Changing the numbering *scheme* means editing `bump-version.mjs`, and
that is a deliberate change to how releases are numbered, not a side effect of
editing `package.json`.

## `site/` is the artifact — anything added there must be servable as it stands

There is no build step, by design and in two places: `package.json` ("there is no
build and no dependency") and `deploy-pages.yml` ("the site is static and
hand-authored, so there is no build step: the `site/` directory is the artifact,
uploaded as-is").

That makes "add a file to `site/`" mean "publish this file, byte for byte." A
preprocessor source — Sass, TypeScript, a template to be rendered — put there is
not compiled on the way out; it is served, or referenced and 404s, and the deploy
stays green either way. Hand-authored CSS and ES5-safe browser JavaScript are the
shapes this site is built from (`site/styles.css`, `site/analytics.js`), and
anything else needs the deploy to grow a build step first — a change to
`deploy-pages.yml` made on purpose, with the extra failure surface accepted, not
a consequence of dropping in a file.

The corollary for values that must differ in production: they are substituted at
deploy time into a file that is already valid without them, the way the
Cloudflare Analytics token is (`site/analytics.js` no-ops while its placeholder
stands). Keep that property — the repo's copy of a page must always be a working
page.
