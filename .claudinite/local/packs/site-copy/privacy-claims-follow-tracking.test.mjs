// See-it-fail fixture for the privacy-claims-follow-tracking rule. Each case
// builds a REAL throwaway git repo (base commit on `main`, then the change on a
// branch) and runs the rule through the engine's own dispatch seam, so the test
// exercises the same merge-base/readBase machinery the Stop hook does rather
// than a hand-rolled stand-in for it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';

import { buildContext } from '../../../shared/engine/checks/helpers/repo-context.mjs';
import { runRule } from '../../../shared/engine/checks/helpers/work.mjs';
import { normalizeManifest } from '../../../shared/engine/pack_loader/pack-schema.mjs';
import manifest from './pack.mjs';

// Taken from the NORMALIZED manifest, not imported bare: a rule's scope is its
// placement on the pack (`workRules`), and the loader is what stamps it. Reading
// it back this way proves the rule is registered and dispatches as work-scoped.
const rule = normalizeManifest(manifest).rules.find((r) => r.id === 'privacy-claims-follow-tracking');

const git = (root, ...args) => execFileSync('git', args, { cwd: root, stdio: 'pipe' });

const put = (root, path, text) => {
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(join(root, path), text);
};

const drop = (root, path) => rmSync(join(root, path), { force: true });

// A base commit on `main`, then `apply` on a branch off it — the shape
// resolveBaseRef expects (it accepts a local `main`).
function fixture(base, apply) {
  const root = mkdtempSync(join(tmpdir(), 'privacy-claims-'));
  git(root, 'init', '-q', '-b', 'main');
  git(root, 'config', 'user.email', 'fixture@example.invalid');
  git(root, 'config', 'user.name', 'Fixture');
  for (const [path, text] of Object.entries(base)) put(root, path, text);
  git(root, 'add', '-A');
  git(root, 'commit', '-q', '-m', 'base');
  git(root, 'checkout', '-q', '-b', 'change');
  apply(root);
  git(root, 'add', '-A');
  git(root, 'commit', '-q', '-m', 'the change');
  return root;
}

function findings(base, apply) {
  const root = fixture(base, apply);
  try {
    const ctx = buildContext({ root, mode: 'changed' });
    return runRule(rule, ctx);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

const PAGE_WITHOUT_TRACKING = '<!doctype html>\n<html><body><h1>Missing Bulb</h1></body></html>\n';
const PAGE_WITH_TRACKING = '<!doctype html>\n<html><body><h1>Missing Bulb</h1>\n<script defer src="analytics.js"></script>\n</body></html>\n';
const LOADER = "var b = document.createElement('script');\nb.src = 'https://static.cloudflareinsights.com/beacon.min.js';\n";
const PRIVACY = '<!doctype html>\n<html><body><p>We set no cookies.</p></body></html>\n';

const CLEAN_BASE = { 'site/index.html': PAGE_WITHOUT_TRACKING, 'site/privacy.html': PRIVACY };
const TRACKING_BASE = {
  'site/index.html': PAGE_WITH_TRACKING,
  'site/analytics.js': LOADER,
  'site/privacy.html': PRIVACY,
};

test('fires when a change adds tracking and leaves the privacy page untouched', () => {
  const found = findings(CLEAN_BASE, (root) => {
    put(root, 'site/index.html', PAGE_WITH_TRACKING);
    put(root, 'site/analytics.js', LOADER);
  });
  assert.equal(found.length, 1);
  assert.equal(found[0].rule, 'privacy-claims-follow-tracking');
  assert.equal(found[0].severity, 'blocking');
  assert.equal(found[0].file, 'site/privacy.html');
  assert.match(found[0].what, /cloudflare-web-analytics/);
  assert.match(found[0].fix, /site\/privacy\.html/);
});

test('fires when a change REMOVES tracking and leaves the privacy page untouched', () => {
  const found = findings(TRACKING_BASE, (root) => {
    put(root, 'site/index.html', PAGE_WITHOUT_TRACKING);
    drop(root, 'site/analytics.js');
  });
  assert.equal(found.length, 1);
  assert.match(found[0].what, /no longer/);
});

test('stays quiet when the same change updates the privacy page', () => {
  const found = findings(CLEAN_BASE, (root) => {
    put(root, 'site/index.html', PAGE_WITH_TRACKING);
    put(root, 'site/analytics.js', LOADER);
    put(root, 'site/privacy.html', PRIVACY.replace('We set no cookies.', 'We count visits with Cloudflare Web Analytics.'));
  });
  assert.deepEqual(found, []);
});

test('stays quiet when the change touches the site but not its tracking', () => {
  const found = findings(TRACKING_BASE, (root) => {
    put(root, 'site/index.html', PAGE_WITH_TRACKING.replace('Missing Bulb', 'Missing Bulb Ltd'));
  });
  assert.deepEqual(found, []);
});

test('stays quiet when the tracking asset is only moved, as this site is shaped', () => {
  // Every page that runs the loader carries its own <script src>, privacy.html
  // included — so moving the loader edits privacy.html by construction and the
  // rule short-circuits. This pins the shape the rename bound depends on: were
  // privacy.html NOT to reference the loader, the move would read as an added
  // vendor and fire (git's rename detection empties ctx.deleted, so the base
  // path is not enumerable). See the module header.
  const base = { ...TRACKING_BASE, 'site/privacy.html': PRIVACY.replace('</body>', '<script defer src="analytics.js"></script></body>') };
  const found = findings(base, (root) => {
    put(root, 'site/index.html', PAGE_WITH_TRACKING.replace('"analytics.js"', '"vendor/analytics.js"'));
    put(root, 'site/privacy.html', base['site/privacy.html'].replace('"analytics.js"', '"vendor/analytics.js"'));
    drop(root, 'site/analytics.js');
    put(root, 'site/vendor/analytics.js', LOADER);
  });
  assert.deepEqual(found, []);
});

test('stays quiet when the privacy page merely re-words its own vendor prose', () => {
  // privacy.html documents tracking, it does not perform it — its own text must
  // never count as a behavior signal.
  const found = findings(TRACKING_BASE, (root) => {
    put(root, 'site/privacy.html', PRIVACY.replace('We set no cookies.', 'We use static.cloudflareinsights.com. We set no cookies.'));
  });
  assert.deepEqual(found, []);
});
