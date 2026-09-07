# missingbulb-website — this repo's own rules

The lessons this repo has paid for once, in two surfaces: how the session tooling behaves
here, and what the site's user-facing copy has to stay true to. A lesson that would hold in
another repo does not belong here — propose it to the Claudinite canon instead, where every
repo gets it.

## Session tooling

### A GitHub MCP list read blows the token cap — `fields` is the size knob, not `per_page`

Any `mcp__github__*` read that returns a *list* of objects here returns the objects whole,
and the result is routinely 80KB–400KB — over the cap, so nothing reaches the session and
the body is spilled to a `tool-results/*.txt` file instead. Eight captured sessions between
2026-07-30 and 2026-08-12 hit it twelve times, across four different tools:
`search_repositories` (80KB, 86KB), `pull_request_read` `get` (158KB, 157KB, 168KB),
`search_issues` (112KB, 106KB) and `actions_list` `list_workflow_runs` (395KB, twice).

The trap is that the obvious knob is the wrong one. On 2026-08-12 a session called
`actions_list list_workflow_runs` with `per_page: 5`, got the overflow, and retried 23s
later with `per_page: 3` — **exactly 395,103 characters both times.** `per_page` does not
shrink these payloads; the per-object field set does. So:

- Pass a **`fields` subset** on every `search_issues` / `list_issues` call —
  `["number","title","state"]` is enough for almost everything Claudinite tasks do.
  Dropping `body` alone is usually the whole difference; the same session's third
  `search_issues` call, identical but for `fields`, came back fine.
- `search_repositories` has no `fields` parameter — its knob is `minimal_output`,
  which now defaults to `true` and already returns compact objects without asking.
- `actions_list` has **no `fields` and no `minimal_output`** — `per_page` is its only knob and
  it doesn't work. Don't retry it smaller. Either narrow with `workflow_runs_filter`, or take
  the overflow as the answer and query the spilled file directly
  (`python3 -c "import json; …"` or `jq` over the `tool-results/*.txt` path in the error).
  That fallback is what finally worked, ~35s after the first attempt.
- For a PR, prefer the narrow method (`get_files`, `get_commits`, `get_check_runs`) over
  `get`, whose body plus every field is what overflows.
- `issue_read`'s `get_comments` method has the same no-`fields` shape as `actions_list` — a
  2026-08-24 session hit 66KB reading one issue's comments and spilled. Same fallback: read
  the spilled `tool-results/*.txt` file directly rather than retrying.

### Verifying "checks are clean" needs the Stop hook's own runner, not the CI one

`check_the_world.mjs` and `check_the_work.mjs` share no code and cover disjoint rule scopes:
the world runner only sees `scope !== 'work'` rules and is wired to CI, never Stop; the Stop
hook runs the work runner (`scope: 'work'` — the diff-plus-transcript rules, where
`reference-integrity` lives). A session (issue #208, 2026-08-24) ran `check_the_world.mjs`,
declared "checks are clean," and committed — then Stop blocked anyway on a
`reference-integrity` finding in a file the session had never touched, forcing a second
commit, push and session-capture cycle. Verify with `check_the_work.mjs` when the question
is "will Stop block me," never the world runner.

### Don't cite a not-yet-filed issue's number — comments here can't be edited afterward

A session (#207, 2026-08-24) wrote "filed as a dedicated issue: #222" in a comment, then
created the issue a call later and got #227 instead. GitHub issue comments have no edit path
through this toolset (a `ToolSearch` for one came back empty), so fixing the wrong number cost
a second, correcting comment. File the issue first, read back the real number it returns,
then write anything that cites it — never guess ahead.

### Never publish an unverified fact about a real person

A session needed the founder's career history for the site's who-we-are section.
`WebFetch` of his LinkedIn profile returned `403`, so the pass fell back to `WebSearch`
and wrote employers and a degree onto a public marketing page from third-party
aggregator listings, flagging the paragraph for the owner to sanity-check. The owner's
reply: *"zoominfo is wrong and rocketreach doesn't add anything"* — the facts were
wrong, and the page had already shipped in a PR. Stripping them cost a second commit
and an amended requirement.

The site-specific form of this now sits in `product-wiki/product-requirements/` as a
reviewed requirement.

## Site copy

### Lead with what the site actually does, then the narrower true claims

PR #20 added Cloudflare Web Analytics (visit counting) and shipped `privacy.html`
in the same commit — but the page's first draft still led with *"no cookies, no
tracking, no personal data,"* a claim the very commit adding it had just made
false. Review caught it before merge: the lede was rewritten to state what's
actually measured first, plainly say the site is **not** analytics-free, and keep
the narrower claims (no cross-site tracking, no ads, no cookies set by us) only
where they remain true.

So: lead with what is actually done, then the narrower true claims — never a
blanket denial the new behavior no longer supports.
