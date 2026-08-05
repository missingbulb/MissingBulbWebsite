import test from 'node:test';
import assert from 'node:assert/strict';
import { runRule } from '../../../shared/engine/checks/helpers/work.mjs';
import rule from './tracking-claims.mjs';

// Fixtures are whole file contents at head and at the scoping base, so the check
// is exercised through exactly the surface the runner hands it (runRule wraps the
// raw context in the fluent work object for a work-scoped rule).
const ctx = ({ head = {}, base = {}, changedFiles = [], baseRef = 'origin/main' }) => ({
  baseRef,
  files: Object.keys(head),
  changedFiles,
  tracked: Object.keys(base),
  read: (p) => head[p] ?? null,
  readBase: (p) => base[p] ?? null,
  exists: (p) => p in head,
});

const withScript = (src) => `<!doctype html>
<html><body>
  <p>Missing Bulb</p>
  <script defer src="${src}"></script>
</body></html>
`;

const CLEAN_PAGE = withScript('analytics.js');
const PRIVACY = '<html><body><h1>Privacy</h1></body></html>\n';

// Scope-in-the-manifest: the rule sits in the pack's workRules, so it must not
// also declare a conflicting scope, and runRule must hand it the work surface.
test('is a work-scoped rule the runner can dispatch', () => {
  assert.equal(rule.severity, 'blocking');
  assert.ok(!('scope' in rule) || rule.scope === 'work');
});

test('fires when a change adds a third-party host and leaves privacy.html alone', () => {
  const found = runRule({ ...rule, scope: 'work' }, ctx({
    head: {
      'site/index.html': withScript('https://www.googletagmanager.com/gtag/js?id=G-123'),
      'site/privacy.html': PRIVACY,
    },
    base: { 'site/index.html': CLEAN_PAGE, 'site/privacy.html': PRIVACY },
    changedFiles: ['site/index.html'],
  }));
  assert.equal(found.length, 1);
  assert.equal(found[0].rule, 'site-copy-tracking-claims');
  assert.equal(found[0].file, 'site/index.html');
  assert.equal(found[0].severity, 'blocking');
  assert.match(found[0].what, /googletagmanager\.com/);
  assert.match(found[0].fix, /site\/privacy\.html/);
});

test('fires when a change removes the beacon host from the loader script', () => {
  const found = runRule({ ...rule, scope: 'work' }, ctx({
    head: { 'site/analytics.js': 'var b = document.createElement("script");\n' },
    base: {
      'site/analytics.js':
        'var b = document.createElement("script");\nb.src = "https://static.cloudflareinsights.com/beacon.min.js";\n',
    },
    changedFiles: ['site/analytics.js'],
  }));
  assert.equal(found.length, 1);
  assert.match(found[0].what, /no longer loads static\.cloudflareinsights\.com/);
});

test('stays quiet when the same change updates privacy.html', () => {
  const found = runRule({ ...rule, scope: 'work' }, ctx({
    head: {
      'site/index.html': withScript('https://www.googletagmanager.com/gtag/js?id=G-123'),
      'site/privacy.html': `${PRIVACY}<p>We now use Google Analytics.</p>\n`,
    },
    base: { 'site/index.html': CLEAN_PAGE, 'site/privacy.html': PRIVACY },
    changedFiles: ['site/index.html', 'site/privacy.html'],
  }));
  assert.deepEqual(found, []);
});

test('stays quiet on a copy-only edit that loads nothing new', () => {
  const found = runRule({ ...rule, scope: 'work' }, ctx({
    head: { 'site/index.html': CLEAN_PAGE.replace('Missing Bulb', 'Missing Bulb — consultancy') },
    base: { 'site/index.html': CLEAN_PAGE },
    changedFiles: ['site/index.html'],
  }));
  assert.deepEqual(found, []);
});

test('stays quiet when a new outbound link is added — a link is not a fetch', () => {
  const head = CLEAN_PAGE.replace('<p>Missing Bulb</p>',
    '<p><a href="https://www.linkedin.com/company/missingbulb">LinkedIn</a></p>');
  const found = runRule({ ...rule, scope: 'work' }, ctx({
    head: { 'site/index.html': head },
    base: { 'site/index.html': CLEAN_PAGE },
    changedFiles: ['site/index.html'],
  }));
  assert.deepEqual(found, []);
});

test('stays quiet when the change touches no site asset', () => {
  const found = runRule({ ...rule, scope: 'work' }, ctx({
    head: { 'README.md': 'hi\n' },
    base: { 'README.md': 'hello\n' },
    changedFiles: ['README.md'],
  }));
  assert.deepEqual(found, []);
});

test('stays quiet with no base ref to compare against', () => {
  const found = runRule({ ...rule, scope: 'work' }, ctx({
    head: { 'site/index.html': withScript('https://www.googletagmanager.com/gtag/js?id=G-123') },
    base: {},
    changedFiles: ['site/index.html'],
    baseRef: null,
  }));
  assert.deepEqual(found, []);
});
