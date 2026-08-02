// This repo's own pack for the site's user-facing copy — claims made on the
// marketing pages (privacy, disclosures, "what we do/don't do" statements)
// staying accurate to what the site actually does. Mostly prose: whether a claim
// still reads honestly is a judgment call. The one mechanical half that a check
// can hold is the COUPLING — a change that alters what the shipped site collects
// must carry the page documenting that collection with it — which is what
// privacy-claims-follow-tracking enforces; the wording judgment stays in RULES.md.
//
// Seeded 2026-08-01 by the grow_with_claudinite growth-extract pass over PR #20.
import privacyClaimsFollowTracking from './privacy-claims-follow-tracking.mjs';

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
  workRules: [privacyClaimsFollowTracking],
};
