import trackingClaimAccuracy from './tracking-claim-accuracy.mjs';

// This repo's own pack for the site's user-facing copy — claims made on the
// marketing pages (privacy, disclosures, "what we do/don't do" statements)
// staying accurate to what the site actually does. Mostly prose: whether a claim
// still READS honestly is a judgment call no check over markup can make.
//
// One slice of it is not a judgment call, though, and is a check as of the
// 2026-08-04 prose-to-checks sweep: a page denying tracking outright while the
// site ships an analytics beacon is a flat contradiction between two static
// signatures in the repo, and tracking-claim-accuracy.mjs reads both.
//
// Seeded 2026-08-01 by the grow_with_claudinite growth-extract pass over PR #20.
export default {
  id: 'site-copy',
  ruleRoutingGuidance: {
    belongs: 'user-facing claims on the site (privacy page, footer disclosures, "what we do" copy) staying true to shipped behavior',
    excludes: 'markup/accessibility mechanics — html; CI and deploy mechanics — github-actions',
  },
  detect: null,
  marker: null,
  prose: 'RULES.md',
  seededByDefault: false,
  worldRules: [trackingClaimAccuracy],
  workRules: [],
};
