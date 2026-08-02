// Red-first fixtures for the site-delivery checks: each rule must FIRE on a
// violating input and stay QUIET on a clean one. Synthetic contexts only — the
// rules read nothing but `ctx.tracked` and `ctx.read`, so no repo state, no git,
// and no import of the gitignored shared mount is involved.
//
//   node --test .claudinite/local/packs/site-delivery/
import test from 'node:test';
import assert from 'node:assert/strict';

import publishedAssetPaths from './published-asset-paths.mjs';
import deployPlaceholderSubstitution from './deploy-placeholder-substitution.mjs';
import releaseVersionShape from './release-version-shape.mjs';

// The two fields the rules use, and nothing else.
const ctxOf = (files) => ({
  tracked: Object.keys(files),
  read: (p) => (p in files ? files[p] : null),
});

const DEPLOY_WORKFLOW = `name: Deploy to GitHub Pages
jobs:
  deploy:
    steps:
      - uses: actions/checkout@v4
      - name: Inject Cloudflare Web Analytics token
        run: |
          sed -i "s#REPLACE_WITH_CLOUDFLARE_WEB_ANALYTICS_TOKEN#\${CLOUDFLARE_ANALYTICS_TOKEN}#" site/analytics.js
      - uses: actions/upload-pages-artifact@v3
        with:
          path: site
`;

const ANALYTICS_CLEAN = "var TOKEN = 'REPLACE_WITH_CLOUDFLARE_WEB_ANALYTICS_TOKEN';\n";

const PAGE_CLEAN = `<!doctype html>
<html lang="en">
<head>
  <link rel="stylesheet" href="styles.css">
  <link rel="icon" href="data:image/svg+xml,%3Csvg%3E%3C/svg%3E">
</head>
<body>
  <a href="#top">top</a>
  <a href="privacy.html">Privacy</a>
  <a href="https://github.com/missingbulb">GitHub</a>
  <a href="mailto:contact@missingbulb.com">mail</a>
  <script defer src="analytics.js"></script>
</body>
</html>
`;

const PAGE_DIRTY = `<!doctype html>
<html lang="en">
<head>
  <link rel="stylesheet" href="../styles.css">
</head>
<body>
  <script defer src="analitycs.js"></script>
</body>
</html>
`;

const SITE_FILES = {
  '.github/workflows/deploy-pages.yml': DEPLOY_WORKFLOW,
  'styles.css': '/* repo-root copy that never ships */',
  'site/styles.css': 'body { margin: 0 }',
  'site/analytics.js': ANALYTICS_CLEAN,
  'site/privacy.html': '<!doctype html><html><head><link rel="stylesheet" href="styles.css"></head></html>',
};

test('published-asset-paths: quiet when every relative ref resolves inside the artifact', () => {
  const findings = publishedAssetPaths.run(ctxOf({ ...SITE_FILES, 'site/index.html': PAGE_CLEAN }));
  assert.deepEqual(findings, []);
});

test('published-asset-paths: fires on a ref that escapes the artifact root', () => {
  const findings = publishedAssetPaths.run(ctxOf({ ...SITE_FILES, 'site/index.html': PAGE_DIRTY }));
  const whats = findings.map((f) => f.what);
  // ../styles.css exists at the repo root — and is exactly what is never uploaded.
  assert.equal(findings.length, 2, whats.join(' | '));
  assert.ok(whats.some((w) => w.includes('"../styles.css"') && w.includes('resolves outside site/')), whats.join(' | '));
  assert.ok(whats.some((w) => w.includes('"analitycs.js"') && w.includes('not a tracked file')), whats.join(' | '));
  assert.ok(findings.every((f) => f.file === 'site/index.html' && f.severity === 'blocking'));
});

test('published-asset-paths: inert when no workflow uploads a Pages artifact', () => {
  const findings = publishedAssetPaths.run(ctxOf({ 'site/index.html': PAGE_DIRTY, 'site/styles.css': '' }));
  assert.deepEqual(findings, []);
});

test('deploy-placeholder-substitution: quiet while the placeholder stands', () => {
  const findings = deployPlaceholderSubstitution.run(ctxOf(SITE_FILES));
  assert.deepEqual(findings, []);
});

test('deploy-placeholder-substitution: fires when the placeholder is gone (a real token committed)', () => {
  const findings = deployPlaceholderSubstitution.run(ctxOf({
    ...SITE_FILES,
    'site/analytics.js': "var TOKEN = 'a1b2c3d4e5f60718293a4b5c6d7e8f90';\n",
  }));
  assert.equal(findings.length, 1, JSON.stringify(findings));
  assert.equal(findings[0].file, 'site/analytics.js');
  assert.match(findings[0].what, /REPLACE_WITH_CLOUDFLARE_WEB_ANALYTICS_TOKEN/);
});

test('deploy-placeholder-substitution: fires when the substituted file is gone', () => {
  const { 'site/analytics.js': _dropped, ...withoutTarget } = SITE_FILES;
  const findings = deployPlaceholderSubstitution.run(ctxOf(withoutTarget));
  assert.equal(findings.length, 1, JSON.stringify(findings));
  assert.match(findings[0].what, /does not exist/);
});

test('release-version-shape: quiet on a version the bump script could have written', () => {
  const files = {
    'scripts/bump-version.mjs': '// the writer',
    'package.json': JSON.stringify({ name: 'missingbulb-website', version: '1.0801.3' }, null, 2),
  };
  assert.deepEqual(releaseVersionShape.run(ctxOf(files)), []);
});

test('release-version-shape: fires on a hand-set version that resets the counter', () => {
  const files = {
    'scripts/bump-version.mjs': '// the writer',
    'package.json': JSON.stringify({ name: 'missingbulb-website', version: '2.0.0' }, null, 2),
  };
  const findings = releaseVersionShape.run(ctxOf(files));
  assert.equal(findings.length, 1, JSON.stringify(findings));
  assert.equal(findings[0].file, 'package.json');
  assert.match(findings[0].what, /"2\.0\.0" is not the 1\.<mmdd>\.<patch> release scheme/);
});

test('release-version-shape: rejects an impossible date component', () => {
  const files = {
    'scripts/bump-version.mjs': '// the writer',
    'package.json': JSON.stringify({ version: '1.1332.4' }),
  };
  assert.equal(releaseVersionShape.run(ctxOf(files)).length, 1);
});

test('release-version-shape: inert without the bump script that defines the scheme', () => {
  const findings = releaseVersionShape.run(ctxOf({ 'package.json': JSON.stringify({ version: '2.0.0' }) }));
  assert.deepEqual(findings, []);
});
