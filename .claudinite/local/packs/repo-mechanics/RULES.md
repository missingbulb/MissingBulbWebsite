# repo-mechanics — rules

## A rebase that drops work must amend the commit message too

PR #59 opened 2026-08-02 with three pages of product-wiki research and sat seven
days awaiting review. On 2026-08-09 an independent pass landed the same
`audience/` findings as #103 — the same 67% qualifier correction, the same n=646
provenance, the same 69%/45%/seven-sources figures — so #59 was rebased and its
`audience/` half dropped as duplicate work. The rebase corrected the tree. It did
not touch the branch's single commit message, and this repo squash-merges, so
that message became main's permanent record: `9f617bf` opens with three
paragraphs describing an `audience:` correction, while `git show --stat` on it
lists only `brand/README.md` and `consulting-market/README.md`. The explanation
of what was dropped exists only as a PR comment, which the squash never carried.

So: when a rebase or a review round removes part of a branch, amend the commit
message in the same step, and read it back against `git show --stat` before
merging. A PR comment serves whoever reads the PR that week; the commit body is
what the next reader of `git log -- <path>` gets, and a commit claiming a file it
never touched sends them hunting for a change that isn't there.

## An unmerged PR is invisible to the next pass — check open PRs before researching

The `product-wiki` pack gates unattended growth deliberately: it always lands as
an unmerged PR, because researched claims entering a committed knowledge base
need a human reading them. The price of that gate is that a pass's findings are
not in `main`, and the next pass looks only at `main`. PR #59 answered the
audience page's standing open question on 2026-08-02 and was still open on
2026-08-09, when the next pass researched the identical question from scratch and
landed it as #103 — same correction, same provenance, same three new figures. A
whole research half was thrown away, and #59's merge two days later carried none
of it.

So: before opening a research question on a wiki page — or on anything else whose
changes land review-gated here — list the open PRs touching that path and read
them first. An open PR is work already done, not work still to do. When one
already answers the question, the move is to say so on that PR and get it
reviewed, not to answer it a second time.

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

So: before opening an issue for a blocking finding, search the open issues and comment on
the match instead. A new branch, a new PR number or a new dispatch issue is not a new
finding. One issue per cause is what keeps "has anyone decided this yet?" answerable — and
what stops a standing upstream defect from minting a fresh issue every day.

**Search on the invariant identifier the finding names, not on the finding's sentence.**
This rule landed on 2026-08-10 and the same cause was filed twice more anyway — **#120** on
2026-08-11 and **#125** on 2026-08-12, taking the count to four. The reason each search
missed is visible in the four titles: `check_the_world blocks on "declares unknown pack
claude-code-web-users-support"` (#87), `check_the_world blocking: declared pack … has no
vendored code` (#92), `baselining: declared pack … has no vendored content` (#120),
`claudinite: declared pack … has no code in the vendored mount` (#125). Every filer
paraphrased the check's message and prefixed its own stage's name, so the only token common
to all four is the bare identifier `claude-code-web-users-support`. Search **that** — the
pack id, the file path, the symbol, whatever literal the finding is *about* — never the
wording it arrived in, which is the one part that changes per filer.
