// This repo's own pack for the site's user-facing copy — claims made on the
// marketing pages (privacy, disclosures, "what we do/don't do" statements)
// staying accurate to what the site actually does. Whether a claim still says
// the right thing stays a judgment call and stays prose; what a check can see
// is the TRIGGER — a change to the third-party hosts the site loads, which is
// the moment the claims must move with it (tracking-claims.mjs).
//
// Seeded 2026-08-01 by the grow_with_claudinite growth-extract pass over PR #20;
// tracking-claims added 2026-08-05 by the prose-to-checks sweep.
import trackingClaims from './tracking-claims.mjs';

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
  worldRules: [],
  // "In the same commit" is a statement about the change in front of you, so
  // the rule is work-scoped — its placement here is what declares that.
  workRules: [trackingClaims],
};
