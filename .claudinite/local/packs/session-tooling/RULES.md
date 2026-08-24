# session-tooling — rules

## Don't retype file content into `push_files` / `create_or_update_file`

The GitHub MCP file-write tools take the file body as a literal string, so what
lands is the model's *transcription* of the file, not the file. Two sessions
corrupted a file that way on 2026-08-11 alone:

- **`push_files` truncated `.claudinite-checks.json`** onto PR #116's branch at
  10:09:12 — `maintenance`, `taskScheduler` and `claudinite` gone, a bogus
  top-level `config` key in their place. The repair commit `26abc08` says it
  plainly: *"a manual transcription error in the push tool call, not a real
  converge/check finding."* Recovery cost a `get_file_contents`, a
  `git reset --hard` onto the bad commit, a re-copy from the scratch file, a diff
  to prove the match and a second commit — about 100 seconds, with a mangled
  config file live on an open PR in between.
- **`create_or_update_file` added a stray leading blank line** to
  `.github/workflows/claudinite-scheduler.yml` at 15:56:20, caught only because
  that session happened to re-read the file afterwards, and fixed by a re-push.

Both files already existed byte-exact on disk — one written by
`converge-wiring.mjs`, one by a scratch script — and `git commit && git push`
would have shipped them unchanged. That is exactly what the first session fell
back to once it saw the damage.

So: push with git. Reserve the MCP file-write tools for the case that genuinely
needs them — files under `.github/workflows/`, which the Action's `GITHUB_TOKEN`
is structurally forbidden to push (see the comment in `baselining/worker.mjs`) —
and when you use them, read the result back with `get_file_contents` and diff it
against the local file before moving on. Folding a non-workflow file into the
same MCP push "so it's one commit" is what cost both of these.

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

- Pass a **`fields` subset** on every `search_issues` / `list_issues` call —
  `["number","title","state"]` is enough for almost everything Claudinite tasks do.
  Dropping `body` alone is usually the whole difference; the same session's third
  `search_issues` call, identical but for `fields`, came back fine. `search_repositories`
  has no `fields` param at all — its knob is `minimal_output` (default `true`, already the
  small shape); pass `minimal_output: false` only when full objects are actually needed.
- `actions_list` has **no `fields` and no `minimal_output`** — `per_page` is its only knob and
  it doesn't work. Don't retry it smaller. Either narrow with `workflow_runs_filter`, or take
  the overflow as the answer and query the spilled file directly
  (`python3 -c "import json; …"` or `jq` over the `tool-results/*.txt` path in the error).
  That fallback is what finally worked, ~35s after the first attempt.
- For a PR, prefer the narrow method (`get_files`, `get_commits`, `get_check_runs`) over
  `get`, whose body plus every field is what overflows.

## An egress block is not a publisher 403 — and doesn't forgive a second source

`WebFetch` is blocked at the network egress proxy for some domains — a distinct failure
from an ordinary publisher `403`, and one this rule mislabeled as 403 for a week. The
fetcher's actual reply is
`{"error_type":"EGRESS_BLOCKED","domain":"www.gartner.com","message":"Access to
www.gartner.com is blocked by the network egress proxy."}`. One 2026-08-09 research
pass collected nine of them: `gartner.com`, `fortunebusinessinsights.com`,
`marketdataforecast.com`, `digitalcommerce360.com`, `demandgenreport.com`,
`businesswire.com`, `barchart.com`, `debriefing.io`, `techintelpro.com`.

The distinction changes what to do after a block, in two ways. A publisher 403
is per-site, so a wire service or an independent report carrying the same release is
a live alternative to try; an egress block is not — in that one session it took out
the primary release **and** every secondary carrier of it. Don't work down a list of
alternative URLs hoping one is reachable. And don't file "re-verify at source next
pass" as an open question: no agent pass here can ever close it. Write it as needing
a human or an unblocked environment, so it stops being re-attempted.

**A snippet gives you the number, not its publisher.** Working from search summaries,
the first wiki pass attributed "$14.1bn in 2026 / ~26.5% CAGR" to Fortune Business
Insights. Those are Business Research Insights' figures ($14.08bn / 26.49%); Fortune
publishes $11.91bn / 25.6%. Corroborating a figure across several snippets does not
corroborate **who published it** — the snippets quote each other. When you cannot open
the report, attribute a number to the firm a source explicitly names as its origin,
and when sources disagree about that, say so rather than picking one.

## `enable_pr_auto_merge` can never arm in this repo — skip straight to a direct merge

`main` carries **no branch-protection rule**, and GitHub only offers auto-merge on a
protected branch, so every call here fails with `Protected branch rules not configured
for this branch` no matter how it's retried. Don't call it at all: when the task's own
spec authorizes landing without human review (the growth tasks do), poll
`pull_request_read` `get_check_runs` until the required check *completes* successfully,
then `merge_pull_request` with `squash` directly. Escalate `needs-human` only when the
task requires a reviewer.

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

## `ScheduleWakeup` wants a `prompt`, and its refusal is not "this tool isn't for you"

Every executor session here hands the real work to a subagent and then wants a fallback
heartbeat in case the completion notification never lands. Five captured sessions tried
it. Three passed only `delaySeconds` and `reason` and got back

> `` `prompt` is required when `stop` is not true ``

(2026-08-08 on issues #86 and #89, 2026-08-09 on #105). The two that also passed a
`prompt` were armed normally — `Next wakeup scheduled for 03:26:00 (in 1524s)` — so the
tool works here and is the right reach.

The ~2s rejection is not the cost. What it cost is the conclusion: two of the three
sessions decided out loud that the tool "is for `/loop` mode, not applicable here" and
moved on, and #105 spent a further call on `ScheduleWakeup {stop: true}` cancelling a
wakeup that had never been set. All three then sat waiting on a bare task-notification
with **no fallback armed while believing they had one** — precisely the safety net an
unattended run has no way to notice is missing.

So: on any `ScheduleWakeup` that isn't `{stop: true}`, pass `prompt` — what the woken
turn should resume doing. And read that message literally: it names an argument you
left out, not a mode you are not in.

## `search_issues` ranks, it never filters — find a known title with `list_issues`

Every task here that keeps a standing log opens by finding an issue **by its exact
title**, and `mcp__github__search_issues` is the wrong tool for that. Its own
description says what it is: *"natural-language semantic matching."* It does not honour
GitHub's search qualifiers, it ranks by resemblance — so the title that matches exactly
can be absent from the page while five that don't are on it. Four captured sessions in
two days paid for this:

- **#131** (2026-08-13) searched `Claudinite tracker Growth Extract` and got back
  `Growth Dedup`, `Product Wiki Growth`, `Tidy Issues`, `Tidy Branches`, `Tidy PRs` —
  every tracker except the one it named. The wanted issue, `Claudinite tracker: Growth
  Extract`, is **#9** and is **closed**; it was not in the result at all. The session
  recovered with `list_issues`.
- **#124** (2026-08-12) ran the same query and missed the same way, then composed a
  longer sentence for a second search, which surfaced #9 — fifth, below three misses.
- **#134** (2026-08-13) used the qualifier form, `repo:… in:title "Claudinite tracker:
  Tidy Issues"`, with no `fields`, twice: **109,350 and 107,368 characters**, both over
  the token cap, both spilled to a file. It fell back to `list_issues`.
- **#128** (2026-08-12) used that same qualifier form *with* `fields` and got a usable
  answer — with `Claudinite tracker: Tidy PRs` sitting second in it. `in:title` filtered
  nothing; passing `fields` only fixed the size, never the ranking.

So: when you already know the title, call `list_issues` with
`fields: ["number","title"]` and `perPage: 100`, **no `state` filter** — this repo's
trackers are closed by design — and match the string yourself in the session. The issue
count keeps growing (131 as of 2026-08-24, already past one page), so check
`pageInfo.hasNextPage` and follow `endCursor` into a second page with `after` before
concluding a title isn't there. Reserve `search_issues` for what it is actually good at:
finding issues you can only describe, not ones you can name.

The canon `git-github` pack's advice to anchor with `in:title "<exact title>"` is about
GitHub's own search API; it does not carry to this MCP server's semantic tool.
