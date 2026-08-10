# repo-mechanics — rules

## A step only the owner can perform goes in its own issue, never in the PR body

A merged PR's body is not a to-do list anyone returns to. PR #12 shipped the
Pages deploy with its one-time setup — *"in the repo's Settings → Pages, set the
source to GitHub Actions"* — as a Notes bullet in the PR description. It merged,
the note went with it, and two days later issue #40 had to re-file that exact
setting, still unticked, alongside the rest of the pipeline's manual settings.
PR #2 did the same with two adoption leftovers in a review comment.

So: when a change lands something that cannot work until a human flips a
repository setting (Pages source, workflow permissions, a repo variable, a
deployment-environment rule), open an **issue** for it — a checkbox per setting,
each saying what breaks while it is off, and a stated closing condition — and
link it from the PR. Keep the note in the PR too if you like, but the issue is
the thing that survives the merge. The exception is a step whose home is an
artifact the owner is already editing (the executor routine carries its own
leftovers in its prompt, per bootstrap); anywhere else, an issue.

And before handing a step over at all, check you actually can't do it — see the
`session-tooling` rule on searching a tool's literal name.

## Key an escalation issue to the root cause, not to the cycle that hit it

A maintenance cycle that meets a blocking finding it must not guess at escalates by
opening an issue. When the cause is upstream and unfixed, *every* later cycle meets the
same finding — so the decision that matters is what the **second** filing does.

`check_the_world`'s blocking `declares unknown pack "claude-code-web-users-support"` has
now recurred on PRs #85, #88, #90, #104 and #106. The first run opened #87 and the next
correctly logged its recurrence as a comment there. The 2026-08-09 run opened **#92**
instead, its stated reason being that PR #90 "is a different cycle/branch than the ones
already logged here." True, and irrelevant: one unresolved upstream cause now carries two
open `needs-decision` issues, its recurrence history is split across both, and a
tidy-issues pass had to spend itself cross-linking them (*"see #87 for the running
history"*, *"see #92 for the latest recurrence"*) while being permitted to close neither.

So: before opening an issue for a blocking finding, search the open issues for the
finding's own text and comment on the match instead. A new branch, a new PR number or a
new dispatch issue is not a new finding. One issue per cause is what keeps "has anyone
decided this yet?" answerable — and what stops a standing upstream defect from minting a
fresh issue every day.

## Check the canon packs before hand-authoring release or CI plumbing

PR #31 hand-rolled this repo's release: `scripts/bump-version.mjs` plus a
version-bump-and-push step in `deploy-pages.yml`, adopting the scheme by copying
what a sibling fleet repo already ran. Within a day, issue #38 and PR #39
deleted all of it — script, bump step, workflow, and the separate `checks.yml` —
for the vendored `static-website` pack, which owns the same pipeline as a
standard with its own checks over it.

The tell was there when it was written: **a mechanic being copied from another
repo in the fleet is a canon candidate, not a file to author here.** The second
copy is the moment to raise it centrally, because a bespoke third copy gets
thrown away and takes its reviewed workflow, its version scheme and its CI entry
with it. So before writing release, deploy, versioning or CI wiring in this
repo, look for the pack that owns it; if none does and a sibling repo already
solved it, that's the finding to report, not the code to duplicate.
