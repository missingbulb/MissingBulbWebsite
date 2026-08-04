import { finding } from '../../../shared/engine/checks/helpers/findings.mjs';

// The one always-testable slice of site-copy's "keep the claims true" rule: a
// page cannot carry a BLANKET denial of tracking while the shipped site loads a
// third-party analytics beacon. Both halves are static signatures in the repo
// artifact — the beacon URL in a shipped asset, the denial in a page's visible
// copy — so a post-hoc scan can see the contradiction the review of PR #20
// caught by hand (its privacy.html draft led with "no cookies, no tracking, no
// personal data" in the very commit that added Cloudflare Web Analytics).
//
// RELEVANCE-FIRST. Inert until the repo actually ships a beacon: drop the
// analytics and "no tracking" becomes true again, so the rule must go quiet on
// its own rather than have to be turned off.
//
// WHY THIS IS NARROW ON PURPOSE. The rule's judgment half — whether a claim
// still *reads* honestly, and whether the copy leads with what is actually done
// — is not mechanizable and stays in RULES.md. Only the flat contradiction is
// here, and detection is held to two guards so it fires on the blanket claim and
// never on the narrower true ones the page must keep:
//   - the denial must end its clause. "no tracking," / "no analytics." are
//     blanket; "no cross-site tracking", "no analytics cookies", "no tracking of
//     you across sites" continue into a qualifier and are left alone.
//   - "analytics-free" is skipped when the sentence negates it, which is how the
//     honest form reads ("this site is not analytics-free").
// Both directions are pinned by tracking-claim-accuracy.test.mjs beside this
// file — run it with `node .claudinite/local/packs/site-copy/tracking-claim-accuracy.test.mjs`.

// Hosts that only ever appear because the page loads visitor analytics. An
// absent host makes the rule QUIET (it can never invent a violation), so this
// list fails safe — extend it when the site adopts another vendor.
const BEACON_HOSTS = [
  'cloudflareinsights.com',
  'google-analytics.com',
  'googletagmanager.com',
  'plausible.io',
  'cdn.segment.com',
  'static.hotjar.com',
  'matomo.cloud',
  'cdn.mxpnl.com',
  'cdn.amplitude.com',
  'clarity.ms',
];

// The site's own shipped assets. Everything under .claudinite/ is Claudinite's
// own tree — including this module, which names every beacon host above and
// would otherwise fingerprint the repo as tracking all by itself.
const SHIPPED = (file) =>
  !file.startsWith('.claudinite/') && !file.startsWith('.github/') && !file.startsWith('.claude/');
const WEB_ASSET = (file) => /\.(html|js)$/.test(file) && SHIPPED(file);
const PAGE = (file) => file.endsWith('.html') && SHIPPED(file);

// A denial ends its clause — the guard that separates the blanket claim from the
// narrowed one, since a qualifier always continues the noun phrase.
const CLAUSE_END = String.raw`(?=\s*[,.;:)\]]|\s+(?:and|or|at\s+all|here|whatsoever|either)\b|\s*$)`;

const DENIALS = [
  {
    re: new RegExp(String.raw`\bno\s+tracking\b${CLAUSE_END}`, 'i'),
    claim: 'an unqualified "no tracking" claim',
  },
  {
    re: new RegExp(String.raw`\bno\s+analytics\b${CLAUSE_END}`, 'i'),
    claim: 'an unqualified "no analytics" claim',
  },
  {
    re: new RegExp(
      String.raw`\b(?:do\s+not|don'?t|does\s+not|doesn'?t)\s+(?:use|run|have|do)\s+(?:any\s+)?analytics\b${CLAUSE_END}`, 'i'),
    claim: 'a "we don\'t use analytics" claim',
  },
  {
    re: new RegExp(
      String.raw`\b(?:do\s+not|don'?t|does\s+not|doesn'?t|never)\s+track\s+(?:you|users|visitors|people|anyone)\b${CLAUSE_END}`, 'i'),
    claim: 'an unqualified "we don\'t track you" claim',
  },
  {
    re: /\banalytics[-\s]free\b/i,
    claim: 'an "analytics-free" claim',
    // The honest form of this sentence is a negation of it.
    unlessBefore: /\b(?:not|isn'?t|is\s+not|never)\b[\s\S]{0,30}$/i,
  },
];

// Blank a span to spaces, keeping newlines — every offset in the document
// survives, so a match's line number is still the line it sits on.
const blank = (s) => s.replace(/[^\n]/g, ' ');

// The page's VISIBLE copy: comments, scripts, styles and the tags themselves
// blanked out. Reading the rendered text rather than the source is what lets the
// negation guard see `is <strong>not</strong> analytics-free` as one sentence,
// and keeps a phrase inside an href or a code comment from ever being judged.
const visibleText = (html) => html
  .replace(/<!--[\s\S]*?-->/g, blank)
  .replace(/<script\b[\s\S]*?<\/script>/gi, blank)
  .replace(/<style\b[\s\S]*?<\/style>/gi, blank)
  .replace(/<[^>]*>/g, blank);

// `<meta name="description">` is copy too — it is what a search result shows —
// but it lives in an attribute the tag-blanking above removes. Re-scan those
// values on their own, at their own offsets.
function metaDescriptions(html) {
  const out = [];
  for (const tag of html.matchAll(/<meta\b[^>]*>/gi)) {
    const name = /\bname\s*=\s*["']([^"']*)["']/i.exec(tag[0]);
    const content = /\bcontent\s*=\s*["']([^"']*)["']/i.exec(tag[0]);
    if (!name || !content || name[1].toLowerCase() !== 'description') continue;
    out.push({ text: content[1], index: tag.index + content.index + content[0].indexOf(content[1]) });
  }
  return out;
}

const lineAt = (text, index) => text.slice(0, index).split('\n').length;

function denialsIn(text) {
  const hits = [];
  for (const denial of DENIALS) {
    const m = denial.re.exec(text);
    if (!m) continue;
    if (denial.unlessBefore?.test(text.slice(Math.max(0, m.index - 60), m.index))) continue;
    hits.push({ claim: denial.claim, index: m.index });
  }
  return hits;
}

const rule = {
  id: 'tracking-claim-accuracy',
  severity: 'blocking',
  description: 'A page may not deny tracking outright while the site ships an analytics beacon',
  doc: '.claudinite/local/packs/site-copy/RULES.md',
  why: 'a blanket denial the shipped behavior no longer supports is a false public claim, not a stale sentence',

  run(ctx) {
    const beacons = [];
    for (const file of ctx.files) {
      if (!WEB_ASSET(file)) continue;
      const text = ctx.read(file);
      if (text === null) continue;
      const host = BEACON_HOSTS.find((h) => text.includes(h));
      if (host) beacons.push({ file, host });
    }
    if (!beacons.length) return [];
    const beacon = beacons[0];

    const out = [];
    for (const file of ctx.files) {
      if (!PAGE(file)) continue;
      const html = ctx.read(file);
      if (html === null) continue;

      const scans = [
        { text: visibleText(html), offset: 0 },
        ...metaDescriptions(html).map((m) => ({ text: m.text, offset: m.index })),
      ];
      for (const scan of scans) {
        for (const hit of denialsIn(scan.text)) {
          out.push(finding(rule, {
            file,
            line: lineAt(html, scan.offset + hit.index),
            what: `makes ${hit.claim} while ${beacon.file} ships the ${beacon.host} analytics beacon`,
            fix: 'state what is actually measured first, then keep only the narrower claims that are still true (no cross-site tracking, no ads, no cookies set by us) — or remove the beacon',
          }));
        }
      }
    }
    return out;
  },
};

export default rule;
