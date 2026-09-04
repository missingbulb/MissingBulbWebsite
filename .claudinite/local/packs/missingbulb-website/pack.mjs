// This repo's own pack: the lessons it has paid for once, across both surfaces
// that produced any — how the session tooling behaves here, and whether the
// site's user-facing copy still matches what the site does.
//
// Prose only. Every rule here is either about what an agent does at runtime (no
// check over repo state can observe it) or a judgment about whether a claim is
// still true (no check over markup can decide it).
//
// Consolidated 2026-09-04 from `session-tooling` and `site-copy`. The third pack
// this repo carried, `repo-mechanics`, held no rules at all — an empty RULES.md
// and two empty rule arrays — and was dropped rather than merged.
export default {
  id: 'missingbulb-website',
  ruleRoutingGuidance: {
    belongs: "this repo's own lessons: session-tooling traps, and site copy staying true to shipped behavior",
    excludes: 'site markup — html; deploy mechanics — git-github; audience research — product-wiki',
  },
  detect: null,
  marker: null,
  prose: 'RULES.md',
  seededByDefault: false,
  worldRules: [],
  workRules: [],
};
