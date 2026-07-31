// This repo's own pack for the SOURCING of what it publishes as fact — about
// the firm, its portfolio, and named real people — across both the site and the
// product-wiki research trees. Distinct from session-tooling (traps in the
// tooling an agent runs) and from the canon html pack (markup, not truth).
//
// Prose only: whether a claim's source holds up is a judgment about the source,
// which no check over repo state can make.
//
// Seeded 2026-07-31 by the grow_with_claudinite growth-extract pass over the
// window that merged #17; new rules arrive the same way.
export default {
  id: 'site-claims',
  ruleRoutingGuidance: {
    belongs: 'where a published claim about the firm, the portfolio or a named person is allowed to come from',
    excludes: 'markup and page structure — html; traps in the session tooling itself — session-tooling',
  },
  detect: null,
  marker: null,
  prose: 'RULES.md',
  seededByDefault: false,
  worldRules: [],
  workRules: [],
};
