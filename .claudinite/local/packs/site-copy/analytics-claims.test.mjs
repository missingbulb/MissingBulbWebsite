// Fixture test for site-copy-analytics-claims. Standalone by construction —
// this repo has no test runner and no `npm test` script, so the suite is
// `node:test` and runs as:
//
//   node .claudinite/local/packs/site-copy/analytics-claims.test.mjs
//
// The rule is a world-scope rule, so it takes the raw context; the fixture
// context below is the whole surface it uses (files / read), which keeps every
// case a few lines of literal HTML with no repo state behind it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import rule from './analytics-claims.mjs';

const ctx = (files) => ({
  files: Object.keys(files),
  read: (path) => (path in files ? files[path] : null),
});

const BEACON = `(function () {
  var beacon = document.createElement('script');
  beacon.src = 'https://static.cloudflareinsights.com/beacon.min.js';
})();`;

const page = (body, head = '') => `<!doctype html>
<html lang="en">
<head>
  <title>Privacy</title>
${head}
</head>
<body>
  <main>
${body}
  </main>
  <script defer src="analytics.js"></script>
</body>
</html>`;

// --- fires on a violating input ------------------------------------------

test('fires when a page claims "no tracking" and the site ships a beacon', () => {
  const found = rule.run(ctx({
    'site/analytics.js': BEACON,
    'site/privacy.html': page('    <p>No cookies, no tracking, no personal data.</p>'),
  }));
  assert.equal(found.length, 1);
  assert.equal(found[0].rule, 'site-copy-analytics-claims');
  assert.equal(found[0].severity, 'blocking');
  assert.equal(found[0].file, 'site/privacy.html');
  assert.equal(found[0].line, 9);
  assert.match(found[0].what, /no tracking/);
  assert.match(found[0].what, /site\/analytics\.js loads cloudflareinsights\.com/);
  assert.match(found[0].fix, /narrower claims/);
});

test('fires when the denial hard-wraps across two source lines', () => {
  const found = rule.run(ctx({
    'site/analytics.js': BEACON,
    'site/privacy.html': page('    <p>We use no\n      analytics on this site.</p>'),
  }));
  assert.equal(found.length, 1);
  assert.equal(found[0].line, 9);
});

test('fires on a blanket denial that only lives in the meta description', () => {
  const found = rule.run(ctx({
    'site/analytics.js': BEACON,
    'site/index.html': page(
      '    <p>We count visits with cookieless analytics.</p>',
      '  <meta name="description" content="A static site with no analytics at all.">',
    ),
  }));
  assert.equal(found.length, 1);
  assert.equal(found[0].file, 'site/index.html');
  assert.equal(found[0].line, 5);
});

test('fires on each remaining blanket form', () => {
  for (const claim of [
    'No trackers here.',
    'This site has no data collection.',
    "We don't collect any data.",
    'We do not use analytics.',
    'This site is analytics-free.',
  ]) {
    const found = rule.run(ctx({
      'site/analytics.js': BEACON,
      'site/privacy.html': page(`    <p>${claim}</p>`),
    }));
    assert.equal(found.length, 1, `expected a finding for: ${claim}`);
  }
});

// --- stays quiet on clean input ------------------------------------------

test('stays quiet on the honest copy this site actually ships', () => {
  const found = rule.run(ctx({
    'site/analytics.js': BEACON,
    'site/privacy.html': page(`    <p>The short version: we count visits using privacy-first,
      cookieless analytics. No cookies, no personal data, no ads, and no
      following you around the web.</p>
    <p>So this site is <strong>not</strong> analytics-free, and we would rather
      say so plainly: we do count visits. There is no cross-site tracking and
      no advertising profile.</p>
    <p><strong>We don't sell your data, and we don't track you across the
      web.</strong> No ads, no advertising trackers, no cookies set by us.</p>`),
  }));
  assert.deepEqual(found, []);
});

test('stays quiet when the site ships no beacon — the denial is simply true', () => {
  const found = rule.run(ctx({
    'site/analytics.js': '// no beacon here yet\n',
    'site/privacy.html': page('    <p>No cookies, no tracking, no analytics.</p>'),
  }));
  assert.deepEqual(found, []);
});

test('a vendor named in prose or linked to is not a shipped beacon', () => {
  const found = rule.run(ctx({
    'site/privacy.html': page(
      '    <p>We considered <a href="https://www.cloudflare.com/web-analytics/">Cloudflare\n'
      + '      Web Analytics</a> and declined it: no tracking, no analytics.</p>',
    ),
  }));
  assert.deepEqual(found, []);
});

// A `.mjs` rule module is already outside the shipped-asset extensions, so the
// case that proves the `.claudinite/` exclusion has to be a file the extension
// filter would otherwise admit.
test('the pack tree is not the site — a host named there does not arm the check', () => {
  const found = rule.run(ctx({
    '.claudinite/local/packs/site-copy/fixtures/beacon-sample.js': "src = 'https://static.cloudflareinsights.com/beacon.min.js';",
    'site/privacy.html': page('    <p>No cookies, no tracking, no analytics.</p>'),
  }));
  assert.deepEqual(found, []);
});

test('a denial inside markup, a comment or a script body is not page copy', () => {
  const found = rule.run(ctx({
    'site/analytics.js': BEACON,
    'site/privacy.html': page(`    <!-- historical: the first draft said no tracking -->
    <p data-note="no analytics">We count visits.</p>
    <script>var legend = 'no trackers';</script>`),
  }));
  assert.deepEqual(found, []);
});
