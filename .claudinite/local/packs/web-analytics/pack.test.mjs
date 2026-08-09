// See-it-fail fixtures for the web-analytics pack's two checks.
//
// Each rule is asserted twice: it FIRES on an input that violates it, and stays
// QUIET on a clean one — the clean case being the shape this repo actually
// ships, so the fixture and the repo can't drift apart silently.
//
// The rules read only `ctx.files` and `ctx.read(path)`, so the fixture context
// is a two-field object; nothing here needs git, the engine, or the filesystem.
//
// Run: node --test ".claudinite/local/packs/**/*.test.mjs"
import { test } from 'node:test';
import assert from 'node:assert/strict';
import beaconPlaceholderGuard from './beacon-placeholder-guard.mjs';
import placeholderHasInjector from './placeholder-has-injector.mjs';

const ctxOf = (files) => ({
  files: Object.keys(files),
  read: (p) => (p in files ? files[p] : null),
});

// The shipped loader's shape: the sentinel, and the guard that bails on it.
const GUARDED_LOADER = [
  "(function () {",
  "  var TOKEN = 'REPLACE_WITH_CLOUDFLARE_WEB_ANALYTICS_TOKEN';",
  "  if (!TOKEN || TOKEN.lastIndexOf('REPLACE_WITH', 0) === 0) return;",
  "  var beacon = document.createElement('script');",
  "  beacon.setAttribute('data-cf-beacon', JSON.stringify({ token: TOKEN }));",
  "})();",
].join('\n');

// The same loader with the guard removed — the violation.
const UNGUARDED_LOADER = [
  "(function () {",
  "  var TOKEN = 'REPLACE_WITH_CLOUDFLARE_WEB_ANALYTICS_TOKEN';",
  "  var beacon = document.createElement('script');",
  "  beacon.setAttribute('data-cf-beacon', JSON.stringify({ token: TOKEN }));",
  "})();",
].join('\n');

// The deploy step that substitutes the sentinel.
const INJECTING_WORKFLOW = [
  'name: Deploy to GitHub Pages',
  'jobs:',
  '  deploy:',
  '    steps:',
  '      - run: |',
  '          sed -i "s#REPLACE_WITH_CLOUDFLARE_WEB_ANALYTICS_TOKEN#${TOKEN}#" site/analytics.js',
].join('\n');

test('beacon-placeholder-guard fires on a loader that never tests its placeholder', () => {
  const findings = beaconPlaceholderGuard.run(ctxOf({
    'site/analytics.js': UNGUARDED_LOADER,
  }));
  assert.equal(findings.length, 1);
  assert.equal(findings[0].rule, 'analytics/beacon-placeholder-guard');
  assert.equal(findings[0].file, 'site/analytics.js');
  // Anchored to the placeholder itself, not the top of the file.
  assert.equal(findings[0].line, 2);
});

test('beacon-placeholder-guard is quiet on the guarded loader this repo ships', () => {
  assert.deepEqual(beaconPlaceholderGuard.run(ctxOf({
    'site/analytics.js': GUARDED_LOADER,
  })), []);
});

test('beacon-placeholder-guard ignores site files with no placeholder at all', () => {
  assert.deepEqual(beaconPlaceholderGuard.run(ctxOf({
    'site/other.js': 'console.log("no sentinel here");',
  })), []);
});

test('beacon-placeholder-guard ignores non-script site files', () => {
  // Markup carrying the sentinel is the injector-check's business, not this one:
  // an HTML attribute has no place to put a guard.
  assert.deepEqual(beaconPlaceholderGuard.run(ctxOf({
    'site/index.html': '<meta name="t" content="REPLACE_WITH_SOME_TOKEN">',
  })), []);
});

test('placeholder-has-injector fires when nothing in the build substitutes the sentinel', () => {
  const findings = placeholderHasInjector.run(ctxOf({
    'site/analytics.js': GUARDED_LOADER,
    '.github/workflows/deploy-pages.yml': 'name: Deploy to GitHub Pages\njobs:\n  deploy:\n    steps:\n      - uses: actions/deploy-pages@v4\n',
  }));
  assert.equal(findings.length, 1);
  assert.equal(findings[0].rule, 'analytics/placeholder-has-injector');
  assert.match(findings[0].what, /REPLACE_WITH_CLOUDFLARE_WEB_ANALYTICS_TOKEN/);
});

test('placeholder-has-injector is quiet when the deploy workflow names the sentinel', () => {
  assert.deepEqual(placeholderHasInjector.run(ctxOf({
    'site/analytics.js': GUARDED_LOADER,
    '.github/workflows/deploy-pages.yml': INJECTING_WORKFLOW,
  })), []);
});

test('placeholder-has-injector accepts a build script as the injector', () => {
  assert.deepEqual(placeholderHasInjector.run(ctxOf({
    'site/analytics.js': GUARDED_LOADER,
    'scripts/inject-token.mjs': "text.replace('REPLACE_WITH_CLOUDFLARE_WEB_ANALYTICS_TOKEN', token)",
  })), []);
});

test('placeholder-has-injector does not count a mere mention in prose as an injector', () => {
  // The pack's own docs name the sentinel; that must not satisfy the rule.
  const findings = placeholderHasInjector.run(ctxOf({
    'site/analytics.js': GUARDED_LOADER,
    'docs/notes.md': 'The token placeholder is REPLACE_WITH_CLOUDFLARE_WEB_ANALYTICS_TOKEN.',
  }));
  assert.equal(findings.length, 1);
});

test('placeholder-has-injector reports each distinct sentinel once', () => {
  const findings = placeholderHasInjector.run(ctxOf({
    'site/analytics.js': GUARDED_LOADER,
    'site/index.html': '<meta content="REPLACE_WITH_CLOUDFLARE_WEB_ANALYTICS_TOKEN">\n<meta content="REPLACE_WITH_OTHER_TOKEN">',
  }));
  assert.equal(findings.length, 2);
});
