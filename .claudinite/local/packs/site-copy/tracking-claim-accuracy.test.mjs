// Fixture for the tracking-claim-accuracy rule. No runner in this repo — the
// offline suite is `node .claudinite/shared/engine/checks/check_the_world.mjs`
// — so this is a standalone script, run as:
//
//   node .claudinite/local/packs/site-copy/tracking-claim-accuracy.test.mjs
//
// Rules are invoked through the engine's dispatch seam (runRule), never by
// calling rule.run directly, so the fixture exercises the same path the runner
// does. The context is synthetic: `files` + `read` is the whole surface this
// rule touches.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runRule } from '../../../shared/engine/checks/helpers/work.mjs';
import rule from './tracking-claim-accuracy.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');

const BEACON = `(function () {
  var beacon = document.createElement('script');
  beacon.src = 'https://static.cloudflareinsights.com/beacon.min.js';
})();`;

const ctxOf = (files) => ({
  files: Object.keys(files),
  read: (path) => (path in files ? files[path] : null),
});

const page = (body) => `<!doctype html>
<html lang="en">
<head>
  <meta name="description" content="Missing Bulb — a static site.">
</head>
<body>
  <main class="legal">
${body}
  </main>
  <script defer src="site/analytics.js"></script>
</body>
</html>
`;

let failures = 0;
function check(name, actual, expected) {
  const ok = actual === expected;
  if (!ok) failures += 1;
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}${ok ? '' : `  (expected ${expected}, got ${actual})`}`);
}

const fires = (files) => runRule(rule, ctxOf(files)).length;

// ---- fires: a blanket denial standing beside a shipped beacon --------------
// The exact defect review caught in PR #20 — the lede that shipped in the same
// commit as Cloudflare Web Analytics.
check('PR #20 lede fires', fires({
  'site/analytics.js': BEACON,
  'site/privacy.html': page('    <p>The short version: no cookies, no tracking, no personal data.</p>'),
}), 1);

check('"no analytics" fires', fires({
  'site/analytics.js': BEACON,
  'site/privacy.html': page('    <p>We run no analytics, and never have.</p>'),
}), 1);

check('"we do not use analytics" fires', fires({
  'site/analytics.js': BEACON,
  'site/privacy.html': page('    <p>We do not use analytics.</p>'),
}), 1);

check('"we don\'t track you" fires', fires({
  'site/analytics.js': BEACON,
  'site/privacy.html': page('    <p>We don\'t track you.</p>'),
}), 1);

check('"analytics-free" fires', fires({
  'site/analytics.js': BEACON,
  'site/privacy.html': page('    <p>This site is analytics-free.</p>'),
}), 1);

check('a denial in the meta description fires', fires({
  'site/analytics.js': BEACON,
  'site/privacy.html': `<!doctype html>
<html lang="en"><head>
  <meta name="description" content="No cookies, no tracking, no ads.">
</head><body><p>Hello.</p></body></html>
`,
}), 1);

// ---- quiet: the narrower claims that stay true ------------------------------
check('"no cross-site tracking" stays quiet', fires({
  'site/analytics.js': BEACON,
  'site/privacy.html': page('    <p>There is no cross-site tracking and no advertising profile.</p>'),
}), 0);

check('"no analytics cookies" stays quiet', fires({
  'site/analytics.js': BEACON,
  'site/privacy.html': page('    <p>There are no analytics cookies set by us.</p>'),
}), 0);

check('"no tracking of you across sites" stays quiet', fires({
  'site/analytics.js': BEACON,
  'site/privacy.html': page('    <p>There is no tracking of you across sites.</p>'),
}), 0);

check('"we don\'t track you across the web" stays quiet', fires({
  'site/analytics.js': BEACON,
  'site/privacy.html': page('    <p>We don\'t track you across the web.</p>'),
}), 0);

check('a negated "analytics-free" stays quiet', fires({
  'site/analytics.js': BEACON,
  'site/privacy.html': page('    <p>So this site is <strong>not</strong> analytics-free.</p>'),
}), 0);

// The clause-end guard buys its precision with misses: a denial that runs on
// into a phrase is left alone even when the phrase does not narrow it. Pinned
// so the boundary is a stated limit rather than a surprise.
check('a denial continuing into a phrase is a known miss', fires({
  'site/analytics.js': BEACON,
  'site/privacy.html': page('    <p>We run no analytics on this site.</p>'),
}), 0);

// ---- quiet: relevance-first --------------------------------------------------
check('no beacon shipped ⇒ the denial is true and the rule is quiet', fires({
  'site/analytics.js': '// no beacon here',
  'site/privacy.html': page('    <p>No cookies, no tracking, no personal data.</p>'),
}), 0);

// This module names every beacon host it knows, so it would fingerprint the
// repo as tracking if the Claudinite tree were ever scanned as a shipped asset.
// Two guards keep it out — the .claudinite/ exclusion and the asset extensions —
// and each gets its own case.
check('a .js inside the Claudinite tree does not count as a shipped beacon', fires({
  '.claudinite/local/packs/site-copy/beacon-hosts.js':
    readFileSync(join(repoRoot, '.claudinite/local/packs/site-copy/tracking-claim-accuracy.mjs'), 'utf8'),
  'site/privacy.html': page('    <p>No cookies, no tracking, no personal data.</p>'),
}), 0);

check('the rule module itself is not a shipped beacon', fires({
  '.claudinite/local/packs/site-copy/tracking-claim-accuracy.mjs':
    readFileSync(join(repoRoot, '.claudinite/local/packs/site-copy/tracking-claim-accuracy.mjs'), 'utf8'),
  'site/privacy.html': page('    <p>No cookies, no tracking, no personal data.</p>'),
}), 0);

// ---- quiet: the real corpus this rule will run over --------------------------
check('the shipped site is clean', fires({
  'site/analytics.js': readFileSync(join(repoRoot, 'site/analytics.js'), 'utf8'),
  'site/privacy.html': readFileSync(join(repoRoot, 'site/privacy.html'), 'utf8'),
  'site/index.html': readFileSync(join(repoRoot, 'site/index.html'), 'utf8'),
}), 0);

console.log(failures ? `\n${failures} failing` : '\nall passing');
process.exit(failures ? 1 : 0);
