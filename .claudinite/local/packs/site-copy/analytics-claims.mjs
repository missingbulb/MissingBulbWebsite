import { finding } from '../../../shared/engine/checks/helpers/findings.mjs';

// The one always-testable half of site-copy's "keep the claims true" rule: a
// page may not carry a BLANKET denial of tracking/analytics while the site
// itself ships an analytics beacon. That contradiction is a static two-files-
// must-agree invariant — one shipped asset loads a known analytics host, one
// shipped page says the site does none of it — so a post-hoc scan can see it
// without judging anything. PR #20 shipped exactly this state (Cloudflare Web
// Analytics added in the same commit as a privacy page still leading with "no
// cookies, no tracking, no personal data") and only review caught it; the cost
// of missing it is a false public claim on a live marketing page, which is why
// this is blocking.
//
// WHAT THIS DELIBERATELY DOES NOT JUDGE — the rest of the rule stays prose in
// RULES.md and is not covered here: whether a claim matches shipped behaviour
// in general, whether the copy leads with what is actually measured, and
// whether the copy was updated in the SAME commit as the behaviour change. This
// check only refuses the blanket denial once the beacon exists.
//
// The NARROWER claims are true and must never fire: "no cookies", "no personal
// data", "no ads", "no cross-site tracking", "no advertising trackers". That is
// why every pattern below is matched on ADJACENT words — a qualifier between
// "no" and "tracking" ("no cross-site tracking") is exactly what makes the claim
// survivable, and adjacency excludes it for free.

// Analytics loaders, matched as HOSTS rather than product names: a page may
// legitimately name a vendor in prose ("we use Cloudflare Web Analytics", which
// links to cloudflare.com/web-analytics/, not to the beacon host) without
// shipping it. Add a host here when the site adopts a vendor.
const ANALYTICS_HOSTS = [
  'cloudflareinsights.com',
  'google-analytics.com',
  'googletagmanager.com',
  'plausible.io/js',
  'cdn.segment.com',
  'static.hotjar.com',
  'clarity.ms',
  'cdn.usefathom.com',
  'umami.is',
  'cdn.mxpnl.com',
  'posthog.com',
  'matomo.js',
  'matomo.php',
];

// Whitespace inside a pattern is `\s+` so a phrase that hard-wraps across two
// source lines still matches — the copy in this repo wraps mid-sentence.
// `negatable` marks a phrase whose meaning inverts when it is denied ("this site
// is not analytics-free" is the honest form, and must stay quiet).
const BLANKET_DENIALS = [
  { re: /\bno\s+tracking\b/gi, phrase: 'no tracking' },
  { re: /\bno\s+trackers\b/gi, phrase: 'no trackers' },
  { re: /\bno\s+analytics\b/gi, phrase: 'no analytics' },
  { re: /\bno\s+data\s+collection\b/gi, phrase: 'no data collection' },
  { re: /\bwe\s+(?:do\s+not|don['’]?t)\s+collect\s+(?:any\s+)?data\b/gi, phrase: "we don't collect data" },
  { re: /\bwe\s+(?:do\s+not|don['’]?t)\s+use\s+analytics\b/gi, phrase: "we don't use analytics" },
  { re: /\banalytics[-\s]free\b/gi, phrase: 'analytics-free', negatable: true },
];

const NEGATED_BEFORE = /\b(?:not|never|isn['’]?t|aren['’]?t)\s+$/i;

const SHIPPED = /\.(?:html?|js|css)$/i;
const PAGE = /\.html?$/i;

// Same-length blanking: markup, comments and script/style bodies become spaces
// while every newline survives, so a match index still maps to its source line
// and no phrase can be stitched together out of two unrelated elements. Entities
// are replaced by their character padded back to the original width for the same
// reason ("Missing&nbsp;Bulb" must not become one word, and the padding keeps
// offsets exact).
const blank = (m) => m.replace(/[^\n]/g, ' ');
const pad = (ch, width) => ch + ' '.repeat(width - ch.length);

function visibleText(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, blank)
    .replace(/<script\b[\s\S]*?<\/script>/gi, blank)
    .replace(/<style\b[\s\S]*?<\/style>/gi, blank)
    .replace(/<[^>]+>/g, blank)
    .replace(/&nbsp;/gi, (m) => pad(' ', m.length))
    .replace(/&(?:#39|apos|rsquo|#8217);/gi, (m) => pad("'", m.length))
    .replace(/&amp;/gi, (m) => pad('&', m.length));
}

const lineAt = (text, index) => text.slice(0, index).split('\n').length;

// A page's user-facing copy: the rendered body text, plus the meta description —
// which never renders on the page but IS published copy (search results, link
// previews), and is where a stale blanket denial hides longest.
function copySegments(page, html) {
  const segments = [{ text: visibleText(html), offset: 0 }];
  for (const m of html.matchAll(/<meta[^>]*\bname=["']description["'][^>]*\bcontent=["']([^"']*)["']/gi)) {
    segments.push({ text: m[1], offset: m.index + m[0].indexOf(m[1]), source: html });
  }
  return segments.map((s) => ({ ...s, page }));
}

const rule = {
  id: 'site-copy-analytics-claims',
  severity: 'blocking',
  doc: '.claudinite/local/packs/site-copy/RULES.md',
  description: 'A site that ships analytics may not claim it ships none',
  why: 'a blanket "no tracking"/"no analytics" claim beside a live beacon is a false public statement about what the site does to its visitors, and it goes stale silently — the code changes, the copy does not',

  run(ctx) {
    // The consumer's own site, never the vendored engine or the packs' own prose
    // and modules (this file names every analytics host in the list above).
    const shipped = ctx.files.filter((f) => !f.startsWith('.claudinite/') && SHIPPED.test(f));

    let wired = null;
    for (const file of shipped) {
      const text = ctx.read(file);
      if (text === null) continue;
      const host = ANALYTICS_HOSTS.find((h) => text.includes(h));
      if (host) { wired = { file, host }; break; }
    }
    if (!wired) return []; // no beacon shipped — the denial is simply true

    const out = [];
    for (const page of shipped.filter((f) => PAGE.test(f))) {
      const html = ctx.read(page);
      if (html === null) continue;
      for (const segment of copySegments(page, html)) {
        for (const { re, phrase, negatable } of BLANKET_DENIALS) {
          for (const m of segment.text.matchAll(re)) {
            if (negatable && NEGATED_BEFORE.test(segment.text.slice(0, m.index))) continue;
            const whole = segment.source ?? segment.text;
            out.push(finding(rule, {
              file: page,
              line: lineAt(whole, segment.offset + m.index),
              what: `claims "${m[0].replace(/\s+/g, ' ')}" while the site ships analytics (${wired.file} loads ${wired.host})`,
              fix: `say what is actually measured first, then keep only the narrower claims that stay true — "no cookies set by us", "no cross-site tracking", "no ads" — instead of the blanket "${phrase}"; if the site should ship no analytics, remove the beacon rather than the sentence`,
            }));
          }
        }
      }
    }
    return out;
  },
};

export default rule;
