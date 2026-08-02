// This repo's own pack for how the site gets built and shipped — where the
// release/CI plumbing comes from, and what happens to the steps in a change
// that only the owner can perform. Prose only: both rules are judgment calls
// made while planning a change, not shapes a check over repo state can see
// (the canon's own packs already check the plumbing once it is adopted).
//
// Seeded 2026-08-02 by the grow_with_claudinite growth-extract pass over
// PRs #12, #31, #39 and issues #38, #40.
export default {
  id: 'repo-mechanics',
  ruleRoutingGuidance: {
    belongs: "this repo's release/CI plumbing and the setup steps only the owner can perform",
    excludes: 'site markup and copy — html and site-copy; session tooling traps — session-tooling',
  },
  detect: null,
  marker: null,
  prose: 'RULES.md',
  seededByDefault: false,
  worldRules: [],
  workRules: [],
};
