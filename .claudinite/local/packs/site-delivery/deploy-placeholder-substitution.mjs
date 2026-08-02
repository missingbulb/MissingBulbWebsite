// A value the deploy injects has two halves in two files — keep them in sync.
//
// The site ships with no build step, so the one thing that differs between the
// repo and production is substituted by the deploy itself:
// .github/workflows/deploy-pages.yml runs
//   sed -i "s#REPLACE_WITH_CLOUDFLARE_WEB_ANALYTICS_TOKEN#${CLOUDFLARE_ANALYTICS_TOKEN}#" site/analytics.js
// and site/analytics.js carries that exact literal, with a guard that makes the
// loader a no-op while the placeholder is still in place.
//
// The failure mode is silence in both directions. Rename or drop the placeholder
// in analytics.js and sed matches nothing, exits 0, and the deploy prints
// "Injected …" while the beacon never ships — analytics simply stops, with no
// red anywhere. Commit a real token in place of the placeholder and the same
// thing happens, plus a value that should only exist at deploy time is now in
// git history. Nothing else in the repo ties the two files together, so this
// check is the tie.
//
// Local pack modules stay dependency-free (no import of the gitignored shared
// mount): node builtins only, plain finding objects.

const WORKFLOW = /^\.github\/workflows\/.+\.ya?ml$/;
// `sed -i "s<D>PATTERN<D>REPLACEMENT<D>" FILE` on one line, any punctuation
// delimiter. Only a plain-literal pattern is judged (see below).
const SED_SUBST = /sed\s+-i\s+"s(\W)(.*?)\1(.*?)\1"\s+(\S+)/g;
// A pattern with no regex metacharacters: what sed matches is exactly what a
// reader sees, so "is it present in the file" is a question with one answer.
const LITERAL = /^[A-Za-z0-9_.\-/]+$/;

const rule = {
  id: 'site-delivery/deploy-placeholder-substitution',
  severity: 'blocking',
  description: 'a placeholder the deploy substitutes must still be present in the file it patches',
  doc: '.claudinite/local/packs/site-delivery/README.md',
  why: 'sed exits 0 when it matches nothing, so a renamed or committed-over placeholder silently ships a file the deploy believes it patched',

  run(ctx) {
    const out = [];
    for (const wf of ctx.tracked.filter((f) => WORKFLOW.test(f))) {
      const text = ctx.read(wf);
      if (text === null) continue;
      SED_SUBST.lastIndex = 0;
      let m;
      while ((m = SED_SUBST.exec(text)) !== null) {
        const [, , pattern, , target] = m;
        if (!LITERAL.test(pattern)) continue;
        const targetText = ctx.read(target);
        if (targetText === null) {
          out.push({
            rule: rule.id,
            severity: rule.severity,
            file: wf,
            line: text.slice(0, m.index).split('\n').length,
            what: `the deploy substitutes into ${target}, which does not exist`,
            why: rule.why,
            fix: `point the sed at the file that carries "${pattern}", or drop the substitution`,
            doc: rule.doc,
          });
          continue;
        }
        if (targetText.includes(pattern)) continue;
        out.push({
          rule: rule.id,
          severity: rule.severity,
          file: target,
          line: null,
          what: `the deploy substitutes "${pattern}" here, but the file no longer contains it`,
          why: rule.why,
          fix: `restore the "${pattern}" placeholder in ${target} (never commit the injected value), or update the sed in ${wf} to the literal the file now carries`,
          doc: rule.doc,
        });
      }
    }
    return out;
  },
};

export default rule;
