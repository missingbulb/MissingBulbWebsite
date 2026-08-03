// This repo's own pack for the site's user-facing copy — claims made on the
// marketing pages (privacy, disclosures, "what we do/don't do" statements)
// staying accurate to what the site actually does. Mostly prose: whether a claim
// still matches the shipped behavior is generally a judgment call. The one
// exception is a claim that CONTRADICTS a shipped asset outright — a blanket "no
// tracking"/"no analytics" beside a live beacon — which is a static two-files-
// must-agree invariant, and is the check below.
//
// Seeded 2026-08-01 by the grow_with_claudinite growth-extract pass over PR #20.
import analyticsClaims from './analytics-claims.mjs';

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
  worldRules: [analyticsClaims],
  workRules: [],
};
