// This repo's own pack for how the site SHIPS — the gap between the tree as you
// read it and the artifact that reaches production. The site is hand-authored
// and has no build step, so there is nothing between `site/` and the web except
// the Pages deploy: what it uploads, what it substitutes on the way, and the
// version it stamps. Every rule here is a place where the repo and the deployed
// site can disagree without anything going red.
//
// Checks, not prose, wherever the disagreement is mechanical — all three rules
// are cross-file contracts a reader has no way to hold in their head, which is
// exactly what a deterministic check is for. The one judgment residue (who owns
// the version) is in RULES.md.
//
// Seeded 2026-08-02 by the grow_with_claudinite growth-discover-packs pass.
import publishedAssetPaths from './published-asset-paths.mjs';
import deployPlaceholderSubstitution from './deploy-placeholder-substitution.mjs';
import releaseVersionShape from './release-version-shape.mjs';

export default {
  id: 'site-delivery',
  ruleRoutingGuidance: {
    belongs: 'how the site ships: the published artifact root, deploy-time value injection, the release version',
    excludes: 'user-facing claims — site-copy; workflow platform behaviour — github-actions; markup gotchas — html',
  },
  detect: null,
  marker: null,
  prose: 'RULES.md',
  seededByDefault: false,
  worldRules: [
    publishedAssetPaths,
    deployPlaceholderSubstitution,
    releaseVersionShape,
  ],
  workRules: [],
};
