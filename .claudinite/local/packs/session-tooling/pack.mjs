// This repo's own pack for how a session's TOOLING behaves here — the traps that
// cost a working session a retry or a wrong answer to the owner, and that no file
// in the tree would have warned about. Prose only: every rule here is about what
// an agent does at runtime, which no check over repo state can observe.
//
// Seeded 2026-07-30 by the grow_with_claudinite conversation-extract pass over
// the captured adoption session; new rules arrive the same way.
export default {
  id: 'session-tooling',
  ruleRoutingGuidance: {
    belongs: 'traps in the session tooling itself — fetching remote content, discovering available tools',
    excludes: 'anything about this repo content — site markup is html, research is product-wiki',
  },
  detect: null,
  marker: null,
  prose: 'RULES.md',
  seededByDefault: false,
  worldRules: [],
  workRules: [],
};
