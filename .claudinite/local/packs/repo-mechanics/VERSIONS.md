# Version history

Records for `local/packs/repo-mechanics`'s own change log — one row per change automatic
work makes to it. There is no version number here (a local pack is neither versioned nor
distributed); the granularity is one row per change.

| Date | Task | Change |
|---|---|---|
| 2026-08-24 | `growth-dedup` | Removed: **Key an escalation issue to the root cause, not to the cycle that hit it** — covered by `basics` RULES.md: "Search for that open one by the invariant identifier the finding names — the symbol, path or id it is about — never the sentence it arrived in: every filer paraphrases the message and prefixes its own stage's name, so the wording is the one part that differs across filings, and a new branch, PR number or run is not a new finding." |
| 2026-08-24 | `growth-dedup` | Removed: **An unmerged PR is invisible to the next pass — check open PRs before researching** — covered by `product-wiki`'s `wiki-growth` task.md, which now gates the run itself: "it declines while any open PR carries a pending change under `product-wiki/`, whoever opened it." |
| 2026-08-24 | `growth-dedup` | Removed: **A rebase that drops work must amend the commit message too** — covered by `git-github`'s `git-github-advanced` SKILL.md: "When a rebase or a review round drops part of a branch, amend the commit message in the same step... Under a squash merge the branch's commit body *becomes* `main`'s permanent record..." |
