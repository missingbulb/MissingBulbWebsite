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

## Never use WebFetch to obtain content you must have

`WebFetch` fails two different ways in this environment, and both were paid for in
one session:

- **It summarizes.** Asked for "the complete verbatim content" of a raw
  `githubusercontent.com` file, it returned a prose description of the document
  instead. The file had to be re-fetched with `curl -sSL -o <scratch>/f.md <url>`
  and read from disk — the correct move the first time.
- **It is blocked at the network egress proxy — which is not the same as a
  publisher 403, and this rule said 403 for a week.** The fetcher's actual reply is
  `{"error_type":"EGRESS_BLOCKED","domain":"www.gartner.com","message":"Access to
  www.gartner.com is blocked by the network egress proxy."}`. One 2026-08-09 research
  pass collected nine of them: `gartner.com`, `fortunebusinessinsights.com`,
  `marketdataforecast.com`, `digitalcommerce360.com`, `demandgenreport.com`,
  `businesswire.com`, `barchart.com`, `debriefing.io`, `techintelpro.com`.

So: when the content itself matters, `curl` it into the scratchpad and `Read` it.
`WebSearch` itself works fine and is the right first reach.

The corrected cause changes what to do after a block, in two ways. A publisher 403
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

**`codeload.github.com` is blocked here too** — `curl … | tar -xz` of a repo
tarball returns 403. Use `git clone --depth 1 https://github.com/<owner>/<repo>`,
which works through the proxy and yields the same tree.

## A ToolSearch that finds nothing does not mean the tool is absent

Deferred tools are matched by keyword, and the keywords are not the tool's own
vocabulary. A session searched `"create trigger routine scheduled task
automation"`, got back `TaskCreate`/`CronCreate`/etc., concluded there was no
trigger API in the session, and told the owner to create a scheduled routine by
hand — while `create_trigger` was in its tool list the whole time. The owner's
reply was "Why didn't you create the routine? You should have."

Before telling the owner a step is theirs because the capability is missing:
search the **literal name** (`select:create_trigger`), and try the tool. A
negative keyword search is evidence about the query, not about the environment —
and handing the owner work the session could have done is the expensive half of
the mistake.

**`select:` wants the fully-qualified name — for an MCP tool that means the
`mcp__<server>__` prefix.** `select:issue_read`, `select:pull_request_read` and
`select:enable_pr_auto_merge` each return `No matching deferred tools found`,
which reads exactly like an absent tool; `select:mcp__github__issue_read` returns
it. Three executor sessions on 2026-08-01 hit this six times between them (two in
session `1fc538f6`, three in `ecc58551`, one in `000d1bf8`), every one recovered
by a second `ToolSearch` — ~2–4s and a wasted call each, and the usual recovery
(fall back to a keyword query) pulls back five to ten schemas where the `select:`
would have pulled one. Copy the prefix off the deferred-tools list rather than
typing the short name from memory.

## `Edit` needs the `Read` tool — `cat`/`grep`/`sed` do not count

Inspecting a file through Bash does **not** register it as read. A session that had
just explored a freshly-cloned repo with `cat`, `grep -n` and `tail` went straight to
`Edit` on three of those files and got
`<tool_use_error>File has not been read yet. Read it first before writing to it.</tool_use_error>`
three times in a row (23:25:07, 23:25:09, 23:25:15) before backing off to `Read` and
retrying — ~17s and four wasted calls for zero information gained, since the file
contents were already on screen from the shell.

The trap is specific to **exploring with the shell and then editing**, which is the
natural rhythm when surveying an unfamiliar tree (a second repo cloned into the
session, a vendored directory). So: the moment shell output tells you a file is the
one you're going to change, `Read` that exact path before the first `Edit`. Reading a
targeted `offset`/`limit` window is enough — the precondition is the tool call, not
the byte count.

## `enable_pr_auto_merge` cannot be armed in this repo — don't retry it

`main` carries **no branch-protection rule**, and GitHub only offers auto-merge on a
protected branch. Every task that says "open the PR and arm auto-merge" will fail here
until an owner adds one.

Worse, the *first* refusal lies about why. One run got
`The pull request is in unstable status (required checks are failing)` at 05:11:52 while
the `Claudinite world sweep` check was merely still **queued** — it went green moments
later. The agent believed the message, re-checked, retried at 05:12:19, and only then got
the real error: `Protected branch rules not configured for this branch`. ~50s of retries,
a tracker comment that had to be corrected by a second comment, and an otherwise
completely successful run converged as `needs-human`.

So: **do not treat "required checks are failing" from `enable_pr_auto_merge` as a check
failure** — read `pull_request_read` `get_check_runs` and look at `status`, not
`conclusion`. And do not retry the arm: one refusal mentioning branch protection is
final. When the task's own spec authorizes landing without human review (the growth
tasks do), poll `get_check_runs` until the required check *completes* successfully and
then `merge_pull_request` with `squash`. Escalate `needs-human` only when the task
requires a reviewer.

## A scheduled executor turn still needs a `Comment class:` line

The `comment-classification` check treats the scheduler's launch prompt
(`Execute the Claudinite executor: …`) as the owner's latest comment, so **every**
unattended executor session is one blocking Stop-hook finding away from ending. It fired
in all three executor sessions captured on 2026-07-31, without exception.

Knowing this costs 7–11 seconds (emit the line, stop again). *Not* knowing it cost one
session over two minutes of reading `comment-classification.mjs`, `helpers/work.mjs` and
`helpers/repo-context.mjs` to work out why an automated dispatch was being judged as
conversation.

So: when the session's opening prompt is a scheduler dispatch, put
`Comment class: other` in your **first** substantive reply — a command phrase is `other`
by the rule's own wording. Don't wait for the Stop hook to tell you.

## The mounted `.claudinite/shared/` is code without its docs — and its runners are silent when clean

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
trackers are closed by design — and match the string yourself in the session. All 80
issues come back in one call, well inside the cap. Reserve `search_issues` for what it
is actually good at: finding issues you can only describe, not ones you can name.

The canon `git-github` pack's advice to anchor with `in:title "<exact title>"` is about
GitHub's own search API; it does not carry to this MCP server's semantic tool.
