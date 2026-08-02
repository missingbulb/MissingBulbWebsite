// The publish root is `site/`, not the repo root.
//
// .github/workflows/deploy-pages.yml uploads the Pages artifact with
// `path: site` and says why: "Publishing only site/ (never the repo root) keeps
// the agent tooling and research trees out of the published site." So a page's
// relative reference resolves against site/ in production — while an editor, a
// local `python -m http.server` at the repo root, or an eye reading the tree all
// resolve it against the repo root. The two agree until a reference points at a
// file that isn't under site/ (or isn't there at all), and then production 404s
// a stylesheet or a script with nothing red anywhere to say so: the deploy is
// green, the page just renders unstyled.
//
// The check reads the publish root out of the workflow rather than hard-coding
// "site" — the workflow is the authority on what ships, so moving the artifact
// path moves the check with it.
//
// Local pack modules stay dependency-free (no import of the gitignored shared
// mount), so this file uses node builtins only and returns plain finding objects.

const WORKFLOW = /^\.github\/workflows\/.+\.ya?ml$/;
// `uses: actions/upload-pages-artifact` followed by the `path:` of its `with:`.
const ARTIFACT_PATH = /uses:\s*actions\/upload-pages-artifact[^\n]*\n(?:[^\n]*\n){0,6}?\s*path:\s*['"]?([^'"\s#]+)/;
// href/src attributes, double- or single-quoted.
const REF = /\b(?:href|src)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;

// A reference the browser resolves against the current document's directory.
// Anything with a scheme (http:, mailto:, data:, tel:), a protocol-relative
// `//host`, a bare fragment, or a root-absolute `/path` is out of scope: the
// first three never touch the artifact, and a root-absolute path resolves
// against the site's domain root, which a custom domain can legitimately make
// correct — this check only judges what is unambiguously artifact-relative.
function isRelative(ref) {
  const r = ref.trim();
  if (!r) return false;
  if (r.startsWith('#') || r.startsWith('/')) return false;
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(r)) return false;
  return true;
}

// Resolve `ref` against the directory of `fromFile`, POSIX-style, the way a
// browser does. Returns null when the path climbs above the repo root.
function resolveRef(fromFile, ref) {
  const clean = ref.split('#')[0].split('?')[0];
  const target = clean.endsWith('/') || clean === '.' || clean === '..'
    ? `${clean.replace(/\/$/, '')}/index.html`
    : clean;
  const stack = fromFile.split('/').slice(0, -1);
  for (const part of target.split('/')) {
    if (part === '' || part === '.') continue;
    if (part === '..') {
      if (stack.length === 0) return null;
      stack.pop();
      continue;
    }
    stack.push(part);
  }
  return stack.join('/');
}

const decode = (s) => { try { return decodeURIComponent(s); } catch { return s; } };

const rule = {
  id: 'site-delivery/published-asset-paths',
  severity: 'blocking',
  description: 'a page\'s relative href/src must resolve to a tracked file inside the published root',
  doc: '.claudinite/local/packs/site-delivery/README.md',
  why: 'only the artifact directory is uploaded to Pages, so a reference outside it 404s in production while every local view of the tree looks fine',

  run(ctx) {
    // No Pages upload in this repo's workflows ⇒ no publish root ⇒ nothing to say.
    let root = null;
    for (const wf of ctx.tracked.filter((f) => WORKFLOW.test(f))) {
      const text = ctx.read(wf);
      if (text === null) continue;
      const m = ARTIFACT_PATH.exec(text);
      if (m) { root = m[1].replace(/\/+$/, ''); break; }
    }
    if (!root || root === '.') return [];

    const prefix = `${root}/`;
    const tracked = new Set(ctx.tracked);
    const out = [];
    for (const file of ctx.tracked) {
      if (!file.startsWith(prefix) || !/\.html?$/i.test(file)) continue;
      const text = ctx.read(file);
      if (text === null) continue;
      REF.lastIndex = 0;
      let m;
      const seen = new Set();
      while ((m = REF.exec(text)) !== null) {
        const ref = m[1] ?? m[2];
        if (!isRelative(ref) || seen.has(ref)) continue;
        seen.add(ref);
        const resolved = resolveRef(file, decode(ref));
        if (resolved !== null && resolved.startsWith(prefix) && tracked.has(resolved)) continue;
        out.push({
          rule: rule.id,
          severity: rule.severity,
          file,
          line: text.slice(0, m.index).split('\n').length,
          what: resolved === null || !resolved.startsWith(prefix)
            ? `"${ref}" resolves outside ${prefix} — that file is never uploaded to Pages`
            : `"${ref}" resolves to ${resolved}, which is not a tracked file`,
          why: rule.why,
          fix: `point the reference at a tracked file under ${prefix} (move the asset in if it belongs to the site)`,
          doc: rule.doc,
        });
      }
    }
    return out;
  },
};

export default rule;
