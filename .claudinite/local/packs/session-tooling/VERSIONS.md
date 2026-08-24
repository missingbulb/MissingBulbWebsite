# Version history

Record of changes to this local pack's rules, one row per change that actually corrected or
deleted something — a run that found everything still true leaves no row.

| Date | Task | What changed |
|---|---|---|
| 2026-08-24 | rule-revalidation | `codeload.github.com` no longer blocked at the egress proxy — a `curl … \| tar` of a repo tarball now succeeds (HTTP 200, valid tarball). Deleted the bullet claiming it's blocked. |
| 2026-08-24 | rule-revalidation | `search_repositories` has no `fields` param — probing its live schema shows only `minimal_output` (default `true`). Corrected the "pass a `fields` subset on every … `search_repositories` call" guidance to name the right knob. |
| 2026-08-24 | rule-revalidation | The repo has grown past one `list_issues` page (131 issues, `hasNextPage: true` at `perPage: 100`), so "All 80 issues come back in one call" no longer holds. Replaced the fixed count with a check on `pageInfo.hasNextPage`/`endCursor`. |
