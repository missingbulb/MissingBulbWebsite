// package.json's version is a released artifact, not a hand-set number.
//
// scripts/bump-version.mjs is the only writer: it emits `1.<mmdd>.<prev + 1>` —
// major pinned at 1, minor the release date as zero-padded month+day in
// Asia/Jerusalem, patch a monotonic counter read back out of the *current*
// value. The deploy workflow runs it on every push to main and commits the
// result back, so the number in the repo names the last release that went out.
//
// Because the patch is read back out of the file, the file's shape is an input
// to the next release, not just a record of the last one. The script's own
// comment names the failure: an unparseable third component is treated as 0, so
// one hand-written `2.0.0` or `1.1.0` silently resets the counter and the next
// release ships a version lower than one already published. Nothing else notices
// — package.json has no dependencies, no build, and nothing reads the version at
// runtime.
//
// Local pack modules stay dependency-free (no import of the gitignored shared
// mount): node builtins only, plain finding objects.

// `1.<mm><dd>.<n>`: month 01-12, day 01-31, patch a non-negative integer with no
// leading zero — exactly the strings bump-version.mjs can produce.
const SCHEME = /^1\.(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\.(0|[1-9]\d*)$/;

const rule = {
  id: 'site-delivery/release-version-shape',
  severity: 'blocking',
  description: 'package.json version follows the release scheme scripts/bump-version.mjs writes',
  doc: '.claudinite/local/packs/site-delivery/README.md',
  why: 'the bump script reads the patch back out of this value, so an off-scheme version resets the counter and the next release goes out numbered below one already published',

  run(ctx) {
    // Inert unless this repo carries the bump script that defines the scheme.
    if (!ctx.tracked.includes('scripts/bump-version.mjs')) return [];
    const text = ctx.read('package.json');
    if (text === null) return [];
    let version;
    try { version = JSON.parse(text).version; } catch { return []; } // malformed JSON is not this rule's finding
    if (typeof version !== 'string' || SCHEME.test(version)) return [];
    return [{
      rule: rule.id,
      severity: rule.severity,
      file: 'package.json',
      line: text.slice(0, text.indexOf('"version"')).split('\n').length,
      what: `version "${version}" is not the 1.<mmdd>.<patch> release scheme`,
      why: rule.why,
      fix: 'restore the version the last deploy wrote (git log package.json), and let the deploy bump it — never hand-edit it',
      doc: rule.doc,
    }];
  },
};

export default rule;
