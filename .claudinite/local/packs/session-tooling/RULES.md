# session-tooling — rules

## Never use WebFetch to obtain content you must have

`WebFetch` fails two different ways in this environment, and both were paid for in
one session:

- **It summarizes.** Asked for "the complete verbatim content" of a raw
  `githubusercontent.com` file, it returned a prose description of the document
  instead. The file had to be re-fetched with `curl -sSL -o <scratch>/f.md <url>`
  and read from disk — the correct move the first time.
- **It 403s.** Four consecutive fetches of ordinary publisher pages
  (`gartner.com`, `fortunebusinessinsights.com`, `marketdataforecast.com`,
  `squarerootseo.com`) all returned `403 Forbidden`, so a research pass ended up
  attributing figures to search snippets instead of verifying them at source.

So: when the content itself matters, `curl` it into the scratchpad and `Read` it.
When a page 403s, do **not** retry it or try a sibling URL — take the `WebSearch`
snippet, attribute it to the publisher rather than asserting it, and flag it for
re-verification. `WebSearch` itself works fine and is the right first reach.

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
