# Brand — how Missing Bulb positions itself

What the Missing Bulb brand claims to be, what its public work actually shows,
and what the commercial website has to convey for a first-time visitor to
believe it.

## Key insights

- Claudinite may be the real asset: it is a product with its own commercial website, not a consulting service.
- The portfolio is genuinely new — all 15 org repos were created inside a seven-week window in mid-2026.
- Zero stars and zero forks across every repo: the portfolio proves activity, not adoption.
- "AI Software Management consulting" matches no established category; the nearest is AI governance.
- Eleven of the fifteen repos are public, so the boast-about-our-projects strategy has real material to use.
- Thirteen of fifteen repos are JavaScript — the portfolio reads as web and extension work, not broad engineering.

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

**The portfolio has no traction signal.** Every repo shows 0 stars and 0 forks.
A visitor who clicks through from a "look at our projects" section lands on
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
in the org by open issues (42 at the time of writing), and it is the only
project with its own dedicated commercial website repo
([ClaudiniteWebsite](https://github.com/missingbulb/ClaudiniteWebsite), private).
It is a shared-guidelines corpus for coding agents — meaning Missing Bulb's most
developed piece of work is *a system for managing AI-assisted software
development*. That is the literal content of "AI Software Management," built and
running rather than merely offered. The label may be a coinage, but the practice
behind it demonstrably exists.

The technology mix is narrow: 13 of 15 repos are JavaScript, with one HTML and
one Python. That reads as web and browser-extension work. Presenting the
portfolio as evidence of broad engineering range would overstate it.

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

Owner-stated positioning is recorded verbatim in
[`.claudinite-checks.json`](../../.claudinite-checks.json) on the `product-wiki`
pack entry, and is attributable to the owner rather than to a citable source.

## Open questions

- What are the founders' pre-2026 credentials and history, and how much of that belongs on the site?
- Should Claudinite lead the site as the flagship, with consulting positioned as the service wrapped around it?
- Is the brand aimed at startups, mid-market, or enterprise? The positioning language changes materially with the answer.
- Are there any client engagements, paid or unpaid, whose outcomes could be published as case studies?
- Does the visible 0-star portfolio actively hurt, or is linking to real working code net-positive regardless?

## Growth log

- **2026-07-30** — initial seed at Claudinite adoption. Owner's stated positioning recorded; no research performed.
- **2026-07-30** — first research pass, answering the coinage and proof-weight open questions. Grounded the page in the actual org contents via the GitHub API (15 repos, all created in a seven-week window, 0 stars/forks throughout, 13/15 JavaScript). Found the strongest asset is Claudinite — a product, with its own commercial site — and that it *is* AI software management in practice, which reframes the coinage question from "is the label real" to "lead with the working example". Superseded the seed's claim that the differentiator is unresearched. Left the pre-2026 credentials question open; it is not answerable from public repo data.
