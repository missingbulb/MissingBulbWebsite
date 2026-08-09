// A client script that ships with a build-time placeholder must GUARD on that
// placeholder and do nothing while it is still in place.
//
// The site's analytics loader (site/analytics.js) carries its beacon token as a
// `REPLACE_WITH_<NAME>` sentinel that the Pages deploy substitutes at build time
// — and the deploy substitutes it only when the repo variable is set:
//
//   if [ -n "$CLOUDFLARE_ANALYTICS_TOKEN" ]; then sed -i "s#REPLACE…#…#" …
//   else echo "… analytics stays off (placeholder retained)."
//
// So the un-substituted file IS a shipping artifact, not a hypothetical: with the
// variable unset (and on every local open of the page) the literal sentinel is
// what the browser gets. Without a guard the loader would hand that sentinel to
// the third-party beacon as a real token — a live request with a garbage
// credential on every page view. analytics.js states the intent it must not lose:
// "no beacon is requested, so the site keeps its 'no analytics' behaviour and
// never ships a broken tag."
//
// Dependency-free by the local-pack rule (it must load without the mounted
// engine): plain finding objects, no engine imports.

// The sentinel shape the deploy substitutes: an all-caps token name.
const SENTINEL = /REPLACE_WITH_[A-Z0-9_]+/;
// The guard: a conditional that tests the sentinel before the value is used.
const GUARD = /\bif\s*\([^\n]*REPLACE_WITH/;

const rule = {
  id: 'analytics/beacon-placeholder-guard',
  severity: 'blocking',
  description: 'A site script carrying a build-time REPLACE_WITH_ placeholder must guard on it and no-op while it is un-substituted',
  doc: '.claudinite/local/packs/web-analytics/RULES.md',
  why: 'the deploy leaves the placeholder in place when its variable is unset, so an unguarded script ships the literal sentinel to the third-party service as a token',

  run(ctx) {
    const out = [];
    for (const file of ctx.files) {
      if (!/^site\/.+\.(?:js|mjs)$/.test(file)) continue;
      const text = ctx.read(file);
      if (text === null) continue;
      const lines = text.split('\n');
      const at = lines.findIndex((l) => SENTINEL.test(l));
      if (at === -1) continue;
      if (GUARD.test(text)) continue;
      out.push({
        rule: rule.id,
        severity: rule.severity,
        file,
        line: at + 1,
        what: 'carries a build-time REPLACE_WITH_ placeholder but never tests for it before using the value',
        why: rule.why,
        fix: 'bail out while the placeholder is un-substituted, e.g. `if (TOKEN.lastIndexOf(\'REPLACE_WITH\', 0) === 0) return;` before anything uses it',
        doc: rule.doc,
      });
    }
    return out;
  },
};

export default rule;
