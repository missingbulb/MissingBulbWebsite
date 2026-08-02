import { finding } from '../../../shared/engine/checks/helpers/findings.mjs';

// PR #20 shipped Cloudflare Web Analytics and `privacy.html` in one commit, and
// the page still led with "no cookies, no tracking, no personal data" — a claim
// the very commit adding it had just made false. Review caught it; nothing
// mechanical did. This rule is the mechanical half: when a change alters what
// the shipped site collects, the page that documents that collection has to move
// in the SAME change, not in a review round-trip.
//
// WHY A SIGNAL SET AND NOT A GREP OVER ADDED LINES. Grepping the diff fires on a
// reindent of the <head> block and on any doc that merely names the vendor. So
// the rule compares the SET of tracking vendors present at the merge-base with
// the set present at head, over the site's shipped assets only. A pure reformat,
// a copy edit, or moving the beacon between files leaves the set identical and
// stays silent; adding, swapping, or removing a vendor changes it and fires.
//
// `site/privacy.html` is deliberately excluded from the scan: it *describes*
// tracking rather than performing it, so its own prose naming a vendor is not a
// behavior signal. (A change that touches it satisfies the rule anyway.)
//
// THE RENAME BOUND, stated because it is the one false alarm left. git's rename
// detection means a MOVED tracking asset never appears in ctx.deleted, and no
// helper enumerates the base tree — so the moved file's old path is invisible and
// the move reads as an added vendor. It is unreachable in this site's shape:
// every page that runs the loader carries its own <script src>, privacy.html
// included, so moving the loader edits privacy.html and the rule short-circuits
// above. If a page ever runs tracking that privacy.html does not, revisit this.
//
// BOUNDS, deliberately. The vendor list is an allowlist of unambiguous
// third-party measurement endpoints plus the site's own loader — a vendor nobody
// has added yet is a false negative, which is the safe direction for a blocking
// rule. Non-vendor collection the set cannot see (a cookie set by hand, a form
// posting somewhere, an email capture) stays the reader's job; RULES.md still
// carries that broader rule and the copy-writing remedy that goes with it.
const PRIVACY_PAGE = 'site/privacy.html';

// A shipped asset of the site: what a visitor's browser actually executes.
const isShippedAsset = (f) => /^site\/.*\.(?:html|js)$/.test(f) && f !== PRIVACY_PAGE;

// Each entry maps a pattern to the NAME of the thing collecting, so the finding
// names a vendor a human can look up rather than echoing a regex.
const VENDORS = [
  ['cloudflare-web-analytics', /static\.cloudflareinsights\.com|data-cf-beacon/i],
  ['google-analytics', /www\.google-analytics\.com|googletagmanager\.com|\bgtag\s*\(|\bdataLayer\b/],
  ['plausible', /plausible\.io/i],
  ['matomo', /matomo/i],
  ['segment', /cdn\.segment\.(?:com|io)/i],
  ['hotjar', /static\.hotjar\.com/i],
  ['posthog', /posthog/i],
  ['mixpanel', /mixpanel/i],
  ['microsoft-clarity', /clarity\.ms/i],
  ['fathom', /cdn\.usefathom\.com/i],
  ['umami', /umami\.is/i],
  ['beacon-api', /navigator\.sendBeacon\s*\(/],
  // The site's own loader, referenced from the pages it runs on — dropping the
  // tag is how tracking gets removed, and that needs the page updated too.
  ['site-analytics-loader', /(?:src|href)\s*=\s*["'][^"']*\banalytics\.js\b/i],
];

const vendorsIn = (text) => {
  const found = new Set();
  if (!text) return found;
  for (const [name, pattern] of VENDORS) if (pattern.test(text)) found.add(name);
  return found;
};

const rule = {
  id: 'privacy-claims-follow-tracking',
  severity: 'blocking',
  description: 'A change that alters the site\'s tracking must update site/privacy.html in the same change',
  doc: '.claudinite/local/packs/site-copy/RULES.md',
  why: 'the privacy page is a public claim about what is collected; a change that alters collection without it leaves the site asserting something the same commit just made false',

  run(work) {
    // `mergeBase` and `deleted` have no fluent accessor yet; without a base there
    // is no "before" to compare against, so there is no change to judge.
    const ctx = work.ctx;
    if (!ctx.mergeBase) return [];
    if (work.changedFiles.includes(PRIVACY_PAGE)) return [];

    // Head-side assets plus the ones this change deleted — a deleted loader is a
    // tracking change too, and it is absent from the head file list by definition.
    const candidates = [...new Set([...work.tracked, ...ctx.deleted])].filter(isShippedAsset);

    const before = new Set();
    const after = new Set();
    for (const file of candidates) {
      for (const v of vendorsIn(work.readBase(file))) before.add(v);
      for (const v of vendorsIn(work.read(file))) after.add(v);
    }

    const added = [...after].filter((v) => !before.has(v)).sort();
    const removed = [...before].filter((v) => !after.has(v)).sort();
    if (!added.length && !removed.length) return [];

    const parts = [
      ...(added.length ? [`now collects via ${added.join(', ')}`] : []),
      ...(removed.length ? [`no longer collects via ${removed.join(', ')}`] : []),
    ];
    return [finding(rule, {
      file: PRIVACY_PAGE,
      what: `this change alters what the shipped site collects — it ${parts.join('; ')} — but ${PRIVACY_PAGE} is not part of the same change`,
      fix: `read ${PRIVACY_PAGE} in this change and update the claims it makes — lead with what is actually measured now, and keep a denial (no cross-site tracking, no ads, no cookies set by us) only where it is still true; never leave a blanket "no tracking" the new behavior no longer supports`,
    })];
  },
};

export default rule;
