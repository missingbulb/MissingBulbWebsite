import { finding } from '../../../shared/engine/checks/helpers/findings.mjs';

// The mechanized half of the site-copy rule: a change that alters WHAT THE
// BROWSER FETCHES from a third party has altered the site's data-collection
// behaviour, and the page that describes that behaviour must move with it.
//
// PR #20 shipped Cloudflare Web Analytics and privacy.html in one commit, and
// the page still led with "no cookies, no tracking, no personal data" — a claim
// the same commit had just made false. Review caught it; a check is cheaper than
// a review round-trip, and the failure mode repeats every time a beacon, an
// embed or a font host is added months after the page was last read.
//
// WHAT IS OBSERVABLE. The judgment "is this claim still true" is not checkable,
// but its trigger is: the set of external HOSTS the shipped site asks the
// browser to contact. Every one of them sees the visitor's request, so a change
// to that set is exactly the class of change privacy.html's "What your browser
// loads" section describes. Detection is scoped to the attributes and calls that
// actually FETCH (script/link/img/iframe/source URLs, a `.src` assignment,
// fetch/sendBeacon) — never an `<a href>`, so adding an outbound link is not a
// data-collection change and does not fire. Relative, `data:` and `mailto:`
// URLs are ignored; only absolute (or protocol-relative) http(s) URLs count.
//
// Scope is `work` (declared by its placement in the pack manifest): "in the same
// commit" is a statement about the change in front of you, so head is compared
// against the scoping base per file, and a change that also touches
// privacy.html has already done what the rule asks — whether it said the right
// thing there is the reviewer's call, not this check's.
//
// KNOWN LIMIT: only files the change TOUCHED are compared, so deleting a loader
// file outright is not seen (the deleted path is no longer in the change's file
// set). The prose beside this check still carries the rest of the rule — which
// claims to lead with, and the footer/marketing copy that references them.
const SITE_DIR = 'site/';
const PRIVACY_PAGE = 'site/privacy.html';

// Markup attributes that make the browser fetch the URL. `<a href>` is
// deliberately absent: a link is followed by the visitor, not by the page.
const MARKUP_FETCHES = [
  /<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi,
  /<link\b[^>]*\bhref\s*=\s*["']([^"']+)["']/gi,
  /<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi,
  /<iframe\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi,
  /<source\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi,
];

// Script calls that make the browser fetch the URL — the shape analytics.js
// itself uses (`beacon.src = 'https://…'`), plus the two request APIs a
// tracker reaches for.
const SCRIPT_FETCHES = [
  /\.src\s*=\s*["'`]([^"'`]+)["'`]/g,
  /\bfetch\s*\(\s*["'`]([^"'`]+)["'`]/g,
  /\bsendBeacon\s*\(\s*["'`]([^"'`]+)["'`]/g,
];

const ABSOLUTE_URL = /^(?:https?:)?\/\/([^/?#"'`\s]+)/i;

const isSiteAsset = (f) => f.startsWith(SITE_DIR) && /\.(html?|js)$/i.test(f);

// The external hosts one file asks the browser to contact, lowercased.
function fetchedHosts(text, file) {
  const hosts = new Set();
  if (text === null) return hosts;
  const patterns = /\.js$/i.test(file) ? SCRIPT_FETCHES : MARKUP_FETCHES;
  for (const re of patterns) {
    for (const m of text.matchAll(re)) {
      const host = ABSOLUTE_URL.exec(m[1].trim());
      if (host) hosts.add(host[1].toLowerCase());
    }
  }
  return hosts;
}

const missing = (a, b) => [...a].filter((h) => !b.has(h));

const rule = {
  id: 'site-copy-tracking-claims',
  severity: 'blocking',
  description: "A change to the third-party hosts the site loads must update site/privacy.html in the same change",
  doc: '.claudinite/local/packs/site-copy/RULES.md',
  why: 'a page describing what the site collects goes false the moment the collecting changes, and a stale privacy claim is published to visitors before any review round-trip can catch it',

  run(work) {
    // No base to compare against (a detached tree, no origin/main): every host
    // would read as newly added. Nothing to say.
    if (!work.baseRef) return [];
    const changed = work.changedFiles.filter(isSiteAsset);
    if (!changed.length) return [];
    // The change already opened the page the rule points at — the claims moved
    // with the behaviour, and whether they now say the right thing is a
    // judgment this check does not make.
    if (work.changedFiles.includes(PRIVACY_PAGE)) return [];

    const out = [];
    for (const file of changed) {
      const head = fetchedHosts(work.read(file), file);
      const base = fetchedHosts(work.readBase(file), file);
      const added = missing(head, base);
      const removed = missing(base, head);
      if (!added.length && !removed.length) continue;
      const delta = [
        ...(added.length ? [`now loads ${added.join(', ')}`] : []),
        ...(removed.length ? [`no longer loads ${removed.join(', ')}`] : []),
      ].join('; ');
      out.push(finding(rule, {
        file,
        what: `${delta} — the third-party hosts this page contacts changed, but ${PRIVACY_PAGE} is untouched by this change`,
        fix: `update ${PRIVACY_PAGE} in this same change (and the footer/marketing copy that references it): lead with what is actually done, then the narrower claims that remain true — never a blanket denial the new behaviour no longer supports. If the host genuinely collects nothing the page describes, accept it in .claudinite-checks.json with a reason`,
      }));
    }
    return out;
  },
};

export default rule;
