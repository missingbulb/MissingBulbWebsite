# Brand — how Missing Bulb positions itself

What the Missing Bulb brand claims to be, what its public work actually shows,
and what the commercial website has to convey for a first-time visitor to
believe it.

## Key insights

- Claudinite is the site's lead proof now, not a candidate — the owner promoted it into the requirements.
- The "closed" creation window reopened: the org is now 20 repos, four created since 2026-07-31.
- The zero-stars/zero-forks streak broke — one repo now carries a fork, after seven weeks flat.
- Twelve of sixteen repos were pushed to on a single day — velocity is the traction signal the stars are not.
- "AI Software Management consulting" matches no established category; the nearest is AI governance.
- Eighteen of the twenty repos are public, so the boast-about-our-projects strategy has real material to use.
- The language mix broadened — 13 of 20 repos are JavaScript now, down from 15 of 16; five other languages appear.

## Positioning as stated

Missing Bulb does software, management, and AI consulting, and describes "AI
Software Management consulting" as its own offering. Its projects are all public
on GitHub, and the website's job is to boast about them — so the portfolio is
evidence for the consulting pitch rather than a separate section of the site.

That framing is the owner's, recorded verbatim at adoption. The research below
tests it against what the org actually contains.

## What the portfolio actually is

The [`missingbulb` GitHub org](https://github.com/missingbulb) holds **15
repositories** — 11 public, 4 private. Every one was created between
**2026-06-12 and 2026-07-30**, a seven-week window. Named work includes
[TLDR](https://github.com/missingbulb/TLDR) (community tl;dr descriptions for
any link), [GoogleCalendarEventCreator](https://github.com/missingbulb/GoogleCalendarEventCreator)
(a Chrome extension), [CrosswordChat](https://github.com/missingbulb/CrosswordChat),
[EdFringeNow](https://github.com/missingbulb/EdFringeNow),
[ShoutsAndWhispers](https://github.com/missingbulb/ShoutsAndWhispers),
[VascularColoring](https://github.com/missingbulb/VascularColoring),
[LaughCounter](https://github.com/missingbulb/LaughCounter) and
[gRatio](https://github.com/missingbulb/gRatio).

Three facts here cut against the stated positioning, and all three are
checkable:

**The portfolio has no traction signal.** Every repo shows 0 stars and 0 forks
at the time of writing — **superseded 2026-09-07: one repo has since picked up
a fork; see the 2026-09-07 re-check below.** A visitor who clicks through from a "look at our projects" section lands on
repositories with no external validation. This matters more than it looks:
Gartner finds 48% of buyers weight peer recommendations above any other content
during consideration ([see audience](../audience/README.md)), and stars are the
GitHub-native form of exactly that signal. The portfolio can demonstrate *taste
and output*; it cannot currently demonstrate *that anyone else uses this*.

**The work is recent.** A seven-week-old org is a defensible thing to have — but
it is not a track record, and a site implying long experience while linking to
repos all stamped mid-2026 creates precisely the website-versus-reality
contradiction that costs deals. Whatever experience the founders have predates
this org and is not visible in it; if the site wants to claim it, it has to
claim it directly rather than by implication from the portfolio.

**The strongest asset is a product, not a service.**
[Claudinite](https://github.com/missingbulb/Claudinite) is the most active repo
in the org by open issues (42 at the time of writing; **now 119 — see the
2026-09-07 re-check**), and it is the only project with its own dedicated
commercial website repo ([ClaudiniteWebsite](https://github.com/missingbulb/ClaudiniteWebsite),
private at the time of writing — **superseded: now public, see the 2026-09-07
re-check**). It is a shared-guidelines corpus for coding agents — meaning Missing Bulb's most
developed piece of work is *a system for managing AI-assisted software
development*. That is the literal content of "AI Software Management," built and
running rather than merely offered. The label may be a coinage, but the practice
behind it demonstrably exists.

The technology mix is narrow: 13 of 15 repos are JavaScript, with one HTML and
one Python. That reads as web and browser-extension work. Presenting the
portfolio as evidence of broad engineering range would overstate it.

### Re-check, 2026-08-02

The org counts above were read on 2026-07-30 and are the load-bearing evidence
on this page, so this pass re-read them from the GitHub API three days later.
What moved, what did not:

- **16 repositories, not 15** — 12 public, 4 private. The addition is
  [ClaudiniteCanary](https://github.com/missingbulb/ClaudiniteCanary), created
  **2026-07-31**, public. The creation window now runs 2026-06-12 to 2026-07-31,
  still seven weeks.
- **Zero stars and zero forks, still, across all 16.** This is the page's most
  consequential claim and it re-verifies cleanly. Three days is a short interval,
  but the finding is that nothing accrued in it.
- **Language mix superseded, not deleted:** the API now reports **15 of 16 repos
  as JavaScript and one as Python**, with no HTML-primary repo. The earlier
  "13 of 15 JavaScript, one HTML, one Python" reflected GitHub's language
  detection on 2026-07-30; detection shifts as repos gain files, so the earlier
  figure was accurate when written. The conclusion is unchanged and slightly
  stronger: the portfolio is web and browser-extension work.
- **Claudinite's open issues rose from 42 to 53** and it remains the most active
  repo in the org, which is corroboration rather than novelty.

One genuinely new observation from the same read: **12 of the 16 repos were
pushed to on 2026-08-02**, a single day. The org's distinguishing signal is not
adoption — it is throughput across a dozen concurrent projects, which is exactly
what a claim about running development with AI agents would predict. That is the
traction evidence the site actually has, and it is not the kind stars measure.

### Re-check, 2026-08-16

The org counts were re-read via the GitHub API a second time, two weeks after the
2026-08-02 check rather than three days. What moved, what did not:

- **Still 16 repositories, 12 public / 4 private.** No repo has been created since
  ClaudiniteCanary on 2026-07-31 — the seven-week creation window has now stayed
  closed for over two weeks. That is the first evidence against this page's own
  standing question of whether the count keeps climbing: for now, it has stopped.
- **Zero stars and zero forks, still, across all 16.** The finding holds a second
  time, at a longer interval than the first re-check.
- **Language mix unchanged:** 15 of 16 repos JavaScript, 1 Python.
- **Claudinite's open issue count is 42, not 53.** The 2026-08-02 pass recorded 53;
  today's API read shows 42 — a real change, not a detection artifact like the
  earlier language-mix shift, since open-issue count is a plain tally rather than
  a heuristic. Claudinite remains the most active repo in the org by a wide margin
  either way.

### Re-check, 2026-09-07

A third org re-read, via the GitHub API, three weeks after 2026-08-16. This is the pass that
finally moves the needle on two of this page's standing claims, not a reconfirmation:

- **The creation window reopened.** The org is now **20 repositories**, not 16. Four were
  created after 2026-07-31, the date this page had been calling the close of a "seven-week window
  that hasn't grown since": [Shepherd](https://github.com/missingbulb/Shepherd) (2026-08-17),
  [WIP](https://github.com/missingbulb/WIP) (2026-08-20),
  [hitbut](https://github.com/missingbulb/hitbut) (2026-08-21) and
  [NoRFinder](https://github.com/missingbulb/NoRFinder) (2026-09-04) — answering the standing
  "does the count keep climbing" open question: **yes**, growth resumed after roughly two weeks
  flat. A fifth repo this read found, [Sheepdog](https://github.com/missingbulb/Sheepdog), was
  created 2026-07-12 — inside the window every earlier read already covered — yet wasn't in any
  prior count; why it was missed is not established by this pass and is left as an open question
  rather than guessed at. Two of the twenty repos (Sheepdog and
  [EdFringeAllocator](https://github.com/missingbulb/EdFringeAllocator)) are now archived, which
  the count alone doesn't show.
- **The zero-stars/zero-forks streak broke.** [EdFringeNow](https://github.com/missingbulb/EdFringeNow)
  now carries **one fork**, after seven-plus weeks at zero across every repo in the org. Stars
  are still zero everywhere. One fork on one repo is a weak signal on its own — it could be a
  single collaborator forking to contribute rather than external adoption — but the finding this
  page built on ("no traction signal, full stop") no longer holds without qualification: it is
  now "no traction signal, with one exception."
- **Visibility shifted.** 18 of 20 repos are now public (was 12 of 16); only
  [EdFringeAllocator](https://github.com/missingbulb/EdFringeAllocator) and
  [Empty](https://github.com/missingbulb/Empty) are private.
  [ClaudiniteWebsite](https://github.com/missingbulb/ClaudiniteWebsite), cited above as private,
  is now public — a correction to that claim, not a new fact this pass created.
- **Language mix broadened, not just shifted.** 13 of 20 repos are JavaScript (65%, down from
  15/16 ≈ 94%). The other seven span Dart (2: WIP, ShoutsAndWhispers), Python (2: NoRFinder,
  Empty), TypeScript (1: hitbut), Swift (1: LaughCounter) and HTML (1: EdFringeNow). "Reads as web
  and extension work, not broad engineering" is a weaker claim than it was — the newest repos
  (hitbut, NoRFinder) are not JavaScript.
- **Claudinite's open issues jumped from 42 to 119** — nearly triple the 2026-08-16 count, and by
  far the largest move any re-check has recorded for that figure. It remains the most active repo
  in the org by a wide margin.

This pass did not re-check the "12 of 16 repos pushed to on a single day" throughput finding —
the search results used here carry no `pushed_at` field, and re-deriving it needs a per-repo
read this pass didn't do. That finding stays as recorded, dated 2026-08-02, not reconfirmed.

### The flagship question is settled

This page's second open question — whether Claudinite should lead the site —
was answered off-wiki while this page waited. On **2026-07-31** the owner
promoted the finding into the human-reviewed sink: requirement 2, *"Lead with
Claudinite as proof of practice,"* with dogfooding named as the strongest honest
claim, and requirement 1 anchoring the category definition on Claudinite
([product-requirements](https://github.com/missingbulb/MissingBulbWebsite/blob/main/product-wiki/product-requirements/README.md),
[PR #17](https://github.com/missingbulb/MissingBulbWebsite/pull/17), closing
[issue #15](https://github.com/missingbulb/MissingBulbWebsite/issues/15)).

Two further open questions on this page were decided in the same promotion:

- **The 0-star portfolio.** Requirement 3 resolves it by reframing rather than
  hiding: feature four projects as *"working code you can read"* — transparency
  — and explicitly not as adoption or significance the repos cannot support.
- **Founder credentials, partially.** Requirement 5 names founder **Ariel
  Raunstien** with a LinkedIn link carrying the detail, and records that
  third-party aggregator listings *proved unreliable and must not be used as a
  source*. That is a real constraint on any future pass researching this
  question: the pre-2026 history is still open, but the obvious research route
  to it is closed by owner decision.

## What this implies for the site

Not yet reviewed into requirements — these are the research's conclusions, and
the sink is a human's call:

- Lead with Claudinite as proof of the AI-software-management practice, rather
  than listing 15 repos of uneven weight and letting the visitor sort them.
- Don't rely on the portfolio to carry social proof it doesn't have. Named client
  outcomes, or the founders' pre-org credentials, are the missing trust layer.
- State experience explicitly if it exists, since the repo dates will otherwise
  imply the org's age is the firm's age.

## Sources

- [missingbulb GitHub organization](https://github.com/missingbulb) — repository count, visibility, creation dates, language, stars, forks and open-issue counts, read 2026-07-30 via the GitHub API.
- [Claudinite](https://github.com/missingbulb/Claudinite) — the AI-software-management corpus, most active repo in the org.
- [ClaudiniteWebsite](https://github.com/missingbulb/ClaudiniteWebsite) — evidence that Claudinite is treated as a commercial product in its own right.
- [Top 10 AI Consulting Companies 2026, LeewayHertz](https://www.leewayhertz.com/top-ai-consulting-companies/) — the service-category vocabulary the market actually uses.
- [AI consulting services, RSM US](https://rsmus.com/services/digital-transformation/artificial-intelligence.html) — established category naming: AI strategy and governance.
- [missingbulb GitHub organization](https://github.com/missingbulb) — re-read 2026-08-02 via the GitHub API for the staleness check: 16 repos, 12 public / 4 private, 0 stars and 0 forks throughout, 15/16 JavaScript, Claudinite at 53 open issues, 12 repos pushed to that day.
- [ClaudiniteCanary](https://github.com/missingbulb/ClaudiniteCanary) — the sixteenth repo, created 2026-07-31, public.
- [product-requirements](https://github.com/missingbulb/MissingBulbWebsite/blob/main/product-wiki/product-requirements/README.md) — requirements 1, 2, 3 and 5, the owner's promoted decisions on flagship, portfolio framing and founder credentials.
- [PR #17, Restructure the site around the AI Software Management practice](https://github.com/missingbulb/MissingBulbWebsite/pull/17) and [issue #15](https://github.com/missingbulb/MissingBulbWebsite/issues/15) — where that promotion happened.
- [missingbulb GitHub organization](https://github.com/missingbulb) — re-read 2026-08-16 via the GitHub API for a second staleness check: still 16 repos, 12 public / 4 private, 0 stars and 0 forks throughout, 15/16 JavaScript, Claudinite now at 42 open issues (was 53 on 2026-08-02), no repo created since 2026-07-31.
- [missingbulb GitHub organization](https://github.com/missingbulb) — re-read 2026-09-07 via the GitHub API for a third staleness check: 20 repos (was 16), 18 public / 2 private, one repo (EdFringeNow) now carries a fork, 13/20 JavaScript with five other languages present, Claudinite at 119 open issues (was 42), four repos created since 2026-07-31.

Owner-stated positioning is recorded verbatim in
[`.claudinite-settings.json`](../../.claudinite-settings.json) on the `product-wiki`
pack entry, and is attributable to the owner rather than to a citable source.

## Open questions

- What are the founder's pre-2026 credentials and history? Still open, and now harder: requirement 5 rules out third-party aggregators, so only owner-supplied detail counts.
- Is the brand aimed at startups, mid-market, or enterprise? The positioning language changes materially with the answer.
- Are there any client engagements, paid or unpaid, whose outcomes could be published as case studies?
- Is sustained throughput (12 repos pushed in a day) legible to a buyer as evidence, or does it read as unfocused without framing? Needs its own re-check — the underlying repo count has since grown from 16 to 20.
- Now that growth has resumed (4 new repos since 2026-07-31, after ~2 weeks flat), does it keep climbing, and at what point does renewed growth start undercutting the focused-practice positioning rather than supporting it?
- EdFringeNow's single fork: who forked it, and is it a collaborator or genuine external pickup? Too small a signal to chase hard, but worth noting if it recurs elsewhere.
- Sheepdog was created 2026-07-12, inside the window every read before 2026-09-07 already covered, but wasn't in any earlier count. Why was it missed — read methodology, pagination, something else? Affects confidence in this page's repo counts generally, not just this one repo.

## Growth log

- **2026-07-30** — initial seed at Claudinite adoption. Owner's stated positioning recorded; no research performed.
- **2026-07-30** — first research pass, answering the coinage and proof-weight open questions. Grounded the page in the actual org contents via the GitHub API (15 repos, all created in a seven-week window, 0 stars/forks throughout, 13/15 JavaScript). Found the strongest asset is Claudinite — a product, with its own commercial site — and that it *is* AI software management in practice, which reframes the coinage question from "is the label real" to "lead with the working example". Superseded the seed's claim that the differentiator is unresearched. Left the pre-2026 credentials question open; it is not answerable from public repo data.
- **2026-08-02** — staleness re-check of this page's load-bearing citation (the org read of 2026-07-30), prompted by the product-wiki tree moving in the window. The org is now **16 repos, 12 public / 4 private** (new: ClaudiniteCanary, 2026-07-31); **0 stars and 0 forks still hold across all 16**, so the central no-traction finding re-verifies. **Superseded with a note rather than deleted:** the language mix now reads 15/16 JavaScript and 1 Python, no HTML-primary repo — GitHub's detection moved, the earlier figure was correct when written, and the conclusion is unchanged. Claudinite 42 → 53 open issues, still the most active repo. New finding: 12 of 16 repos were pushed to on a single day, which makes throughput — not adoption — the traction evidence the org actually has. Closed three open questions against the owner's 2026-07-31 requirements promotion (PR #17): Claudinite leads (req 2), the 0-star portfolio is framed as transparency not adoption (req 3), and the founder is named with aggregator sources ruled out (req 5), which narrows how the still-open credentials question can ever be answered.
- **2026-08-16** — second staleness re-check of the org read, this weekly pass's own spot-check. Repo count, visibility split, language mix and the zero-stars/zero-forks finding all re-verify unchanged, now confirmed two weeks apart rather than three days — and no repo has been created since 2026-07-31, the first evidence against the standing "does the count keep climbing" question. Corrected Claudinite's open-issue count from the previous pass's 53 to today's 42, a real change rather than a stale figure. Header's zero-stars and creation-window bullets reworded to carry the longer confirmation baseline.
- **2026-09-07** — third staleness re-check of the org read, three weeks after 2026-08-16, and the first of these checks to find real movement rather than reconfirmation. The org grew to **20 repos** (4 created since 2026-07-31: Shepherd, WIP, hitbut, NoRFinder), answering the standing "does the count keep climbing" question — yes, growth resumed after roughly two weeks flat. A fifth repo, Sheepdog, was found created inside the window every earlier read already covered yet was absent from every prior count — flagged as a new open question rather than explained away. **The zero-forks finding broke**: EdFringeNow now carries one fork, so the page's central no-traction claim is corrected to "no traction signal, with one exception" rather than an absolute. Visibility shifted to 18 public / 2 private (was 12/4), including a correction that ClaudiniteWebsite, cited elsewhere on this page as private, is now public. Language mix broadened to 13/20 JavaScript (was 15/16), with Dart, Python, TypeScript, Swift and HTML all now present — weakening the "web and extension work, not broad engineering" reading. Claudinite's open-issue count nearly tripled, 42 → 119. The 12-repos-pushed-in-a-day throughput finding was not re-checked (no `pushed_at` data in this pass's read) and stays dated 2026-08-02. Header rewritten across four bullets to carry the new counts; four open questions updated or added.
