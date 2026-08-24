# session-tooling — rules

## A GitHub MCP list read blows the token cap — `fields` is the size knob, not `per_page`

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

- Pass a **`fields` subset** on every `search_issues` / `list_issues` / `search_repositories`
  call — `["number","title","state"]` is enough for almost everything Claudinite tasks do.
  Dropping `body` alone is usually the whole difference; the same session's third
  `search_issues` call, identical but for `fields`, came back fine.
- `actions_list` has **no `fields` and no `minimal_output`** — `per_page` is its only knob and
  it doesn't work. Don't retry it smaller. Either narrow with `workflow_runs_filter`, or take
  the overflow as the answer and query the spilled file directly
  (`python3 -c "import json; …"` or `jq` over the `tool-results/*.txt` path in the error).
  That fallback is what finally worked, ~35s after the first attempt.
- For a PR, prefer the narrow method (`get_files`, `get_commits`, `get_check_runs`) over
  `get`, whose body plus every field is what overflows.

## `codeload.github.com` is blocked here too

`curl … | tar -xz` of a repo tarball returns 403 through the network egress proxy. Use
`git clone --depth 1 https://github.com/<owner>/<repo>` instead, which works through the
proxy and yields the same tree.

## `enable_pr_auto_merge` never arms here — skip straight to a direct merge

When the task's own spec authorizes landing without human review (the growth tasks do),
don't retry `enable_pr_auto_merge` — poll `pull_request_read` `get_check_runs` until the
required check *completes* successfully, then `merge_pull_request` with `squash` directly.
Escalate `needs-human` only when the task requires a reviewer.

## The mounted `.claudinite/shared/` is code without docs — and its runners are silent when clean

Two ways the engine mount misleads a session that goes reading it, both paid for
on 2026-08-01:

- **The `DESIGN.md` it cites is not vendored here.** Engine source refers to it
  constantly (`// World-scope conformance runner (see DESIGN.md)`,
  `// … (per-project-scheduling DESIGN §1, §5.5)`), but
  `find .claudinite -iname 'DESIGN*'` returns nothing — the mount carries
  `.mjs` and pack docs only. Session `000d1bf8` chased it twice independently:
  the executor spent 05:00:52→05:01:00 on a failed `Read` plus two `find`s, then
  its subagent repeated the same hunt at 05:02:23→05:02:26. ~25s and five calls
  for a file that was never there. Read the module header comment instead — it
  restates what the missing section would have said.
- **A clean check run prints nothing at all.** `check_the_world.mjs` on a green
  repo emits zero output and exits `0`; `report-findings.mjs` only prints when
  there are findings. Session `055f2992` had `EXIT:0` in hand at 05:01:40 and
  still spent 05:01:42→05:02:12 — four more calls, `--help`, `head`, `tail`,
  `grep`, a full `Read` — confirming that silence meant success.

So: when the engine's own comments point at a doc, check it exists before
hunting for it, and re-run a runner with `; echo "EXIT:$?"` **once** — the exit
code is the whole answer, and no output is the good outcome.

## Never publish an unverified fact about a real person

When the primary source for a person's background is blocked, **do not substitute a
data broker, and do not publish the claim with a caveat** — ask the owner.

A session needed the founder's career history for the site's who-we-are section.
`WebFetch` of his LinkedIn profile returned `403`, so the pass fell back to `WebSearch`
and wrote employers and a degree onto a public marketing page from third-party
aggregator listings, flagging the paragraph for the owner to sanity-check. The owner's
reply: *"zoominfo is wrong and rocketreach doesn't add anything"* — the facts were
wrong, and the page had already shipped in a PR. Stripping them cost a second commit
and an amended requirement.

Flagging is not a substitute for verification here, because the cost is not a wrong
paragraph — it is a public claim about a named person that they never made. The person
is in the conversation; one question is cheaper than any research. (The site-specific
form of this now sits in `product-wiki/product-requirements/` as a reviewed
requirement; this rule is the general one, for any repo and any surface.)
