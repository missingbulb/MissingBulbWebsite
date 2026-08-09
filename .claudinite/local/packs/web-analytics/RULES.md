# web-analytics — rules

The site counts visits with a third-party beacon whose token is injected into the
client at deploy time. Two of that arrangement's rules are checks in this pack
(`analytics/beacon-placeholder-guard`, `analytics/placeholder-has-injector`) and
need no prose. What is left is the one call a check can't make.

## The beacon token is public — it belongs in a repo *variable*, never a secret

`site/analytics.js` ships the token to every visitor: it is embedded in the
`data-cf-beacon` attribute of the script tag the loader appends, so anyone
viewing source has it. The file says so, and the deploy step in
`.github/workflows/deploy-pages.yml` reads it accordingly — `vars.CLOUDFLARE_ANALYTICS_TOKEN`,
with the workflow's own comment explaining the choice: *"The beacon token is
public (it ships in the client), so it lives in a repo variable, not a secret."*

Treating it as a secret instead is not a harmless extra precaution. It hides a
public value behind an approval surface the owner has to maintain, it makes the
deploy's log output useless (Actions masks the value, so the injection step can
no longer show what it did), and — the part that actually bites — it puts a
value nobody needs to protect into the same bucket as the ones that must be,
which is how a real secret ends up handled casually later.

So when adding any third-party client-side integration here, decide first
whether the credential **ships in the client**. If it does, it is a `vars.`
entry; if it doesn't, it never belongs in `site/` at all and the placeholder
mechanism these checks guard is the wrong shape for it. This is a judgment about
what a given vendor's token *is* — no check can read that off the repo, which is
why it is prose.

Related, and deliberately elsewhere: what the privacy page is allowed to claim
about what this beacon collects is `site-copy`'s rule, and where the deploy
pipeline itself should come from is `repo-mechanics`'.
