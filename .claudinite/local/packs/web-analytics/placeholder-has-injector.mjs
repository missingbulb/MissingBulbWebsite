// Every build-time placeholder in the published site must have something in this
// repo that substitutes it.
//
// This is the failure the placeholder GUARD creates. Once a loader correctly
// no-ops on an un-substituted sentinel (beacon-placeholder-guard.mjs), a
// placeholder nothing ever injects is perfectly silent: no error, no beacon, no
// broken page — the feature is simply off forever and nothing says so. The one
// thing that turns the site's sentinel into a real token is a single step in
// .github/workflows/deploy-pages.yml:
//
//   sed -i "s#REPLACE_WITH_…#${CLOUDFLARE_ANALYTICS_TOKEN}#" site/analytics.js
//
// Add a second placeholder and forget its sed and you get a dead integration
// that looks exactly like a working one. So: a sentinel in site/ must be named
// by a workflow or a build script — the two places in this repo that touch the
// site between commit and publish.
//
// Dependency-free by the local-pack rule (it must load without the mounted
// engine): plain finding objects, no engine imports.

const SENTINEL = /REPLACE_WITH_[A-Z0-9_]+/g;

// Where a substitution can live: the deploy/CI workflows and the build scripts.
// Deliberately NOT the whole repo — a sentinel merely *mentioned* in prose (this
// pack's own docs included) is documentation, not an injector.
const isInjectorFile = (f) =>
  /^\.github\/workflows\/.+\.ya?ml$/.test(f) || /^scripts\/.+$/.test(f);

const rule = {
  id: 'analytics/placeholder-has-injector',
  severity: 'blocking',
  description: 'A REPLACE_WITH_ placeholder in site/ must be substituted by a workflow or build script in this repo',
  doc: '.claudinite/local/packs/web-analytics/RULES.md',
  why: 'a guarded placeholder nothing injects is silently inert forever — the integration never turns on and nothing reports it',

  run(ctx) {
    // What the build surfaces name.
    const injected = new Set();
    for (const file of ctx.files) {
      if (!isInjectorFile(file)) continue;
      const text = ctx.read(file);
      if (text === null) continue;
      for (const m of text.matchAll(SENTINEL)) injected.add(m[0]);
    }

    const out = [];
    const reported = new Set();
    for (const file of ctx.files) {
      if (!file.startsWith('site/')) continue;
      const text = ctx.read(file);
      if (text === null) continue;
      text.split('\n').forEach((ln, i) => {
        for (const m of ln.matchAll(SENTINEL)) {
          const name = m[0];
          if (injected.has(name) || reported.has(name)) continue;
          reported.add(name);
          out.push({
            rule: rule.id,
            severity: rule.severity,
            file,
            line: i + 1,
            what: `the placeholder ${name} is never substituted — no workflow or build script names it`,
            why: rule.why,
            fix: 'add the substitution step to the deploy workflow (or a build script), or delete the placeholder',
            doc: rule.doc,
          });
        }
      });
    }
    return out;
  },
};

export default rule;
