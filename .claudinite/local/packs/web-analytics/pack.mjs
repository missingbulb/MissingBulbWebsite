import beaconPlaceholderGuard from './beacon-placeholder-guard.mjs';
import placeholderHasInjector from './placeholder-has-injector.mjs';

// This repo's own pack for the site's visitor-analytics integration — the
// Cloudflare Web Analytics beacon in site/analytics.js, the public token the
// Pages deploy substitutes into it, and what the page does while that token is
// not there. No canon pack on this repo's shelf homes it: `html` owns markup,
// `github-actions` owns workflow/runner behaviour, and neither has anything to
// say about a third-party client beacon or a build-time token placeholder.
//
// Two of its three rules are checks, because the placeholder contract is a
// shape over repo state: the client must test for the un-substituted sentinel,
// and something in the build must substitute it. The third — whether a given
// vendor token is public at all — is a judgment about the vendor, so it stays
// prose in RULES.md.
//
// Seeded 2026-08-09 by the grow_with_claudinite growth-discover-packs pass over
// site/analytics.js, site/index.html, site/privacy.html and
// .github/workflows/deploy-pages.yml.
export default {
  id: 'web-analytics',
  ruleRoutingGuidance: {
    belongs: "the site's visitor-analytics beacon: its public token, the build-time injection of that token, and the un-injected fallback",
    excludes: 'privacy-page claims about what is collected — site-copy; where the deploy pipeline itself comes from — repo-mechanics',
  },
  detect: null,
  marker: null,
  prose: 'RULES.md',
  seededByDefault: false,
  worldRules: [beaconPlaceholderGuard, placeholderHasInjector],
  workRules: [],
};
