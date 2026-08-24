# Audience — who the site is written for

The segments the Missing Bulb website has to serve, what each one needs from it,
and what the research says about how consulting buyers actually behave before
they make contact.

## Key insights

- 67% of B2B buyers prefer rep-free buying for at least part of a purchase — the site does the selling.
- Buyers want fully digital buying (70%) yet 69% still validate AI findings with a human.
- 94% of B2B buyers use an LLM somewhere in buying (45% specifically for vendor research) — AI reads the site first.
- Gartner: 69% hit contradictions between a vendor's website and its sellers, and that costs deals.
- 48% weight peer recommendations above any other content, which a 0-star portfolio cannot supply.
- 73% actively avoid suppliers who send irrelevant outreach, so inbound-only is a feature here.
- Missing security and compliance pages are used by procurement as a rejection signal, not a neutral gap.

## Segments as stated

The owner named, in one breath: people interested in the services of a software
consultancy firm, people interested in AI, people interested in the software
development life cycle, and people interested in the projects Missing Bulb
builds. They flagged the breadth themselves — "it's hard to define because the
audience is wide" — with the instruction not to research the entire world.

That constraint is a scoping rule for this page, not a caveat on it. Passes here
deepen one segment at a time against a concrete question from the backlog, rather
than attempting a market-wide audience survey.

## How these buyers actually behave

The research changes the picture in one specific way: for this audience, the
website is not marketing collateral that precedes a sales conversation. It
substantially *is* the sales conversation.

Gartner's sales survey reports **67% of B2B buyers prefer a rep-free buying
experience** (published 2026-03-09, from **646 B2B buyers surveyed August–September
2025**), up from 61% in the equivalent 2025 release — a consistent upward trend
across two years of the same instrument. For a firm with no sales team, that is
unusually good news: the preference the market is moving toward is the only mode
Missing Bulb can offer anyway. The site has to carry the full weight of
qualification, though, because there is no rep to recover a visitor the page
loses.

**Correction, 2026-08-09:** the previous pass stated the 67% flatly as a
preference for a rep-free experience. Gartner's own headline qualifies it — 67%
prefer a rep-free experience **for at least part of their purchase**, not for the
whole of it. The distinction is the subject of the next section, and it narrows
the claim materially: the finding is that buyers want to get *through most of a
purchase* without a rep, not that they want no human contact at all. The sample
and field dates above were also missing from the previous pass, which is what let
the 2026 figure be read as interchangeable with the 2025 release's n=632 sample.

The same body of research names what breaks trust. A Gartner survey of **632 B2B
buyers** (fielded August–September 2024) found **69% report inconsistencies
between what a vendor's website says and what its sellers say**, and those
contradictions put transactions at risk. Read against the [brand
page](../brand/README.md), the concrete exposure here is the gap between implied
experience and a portfolio of repos all created in mid-2026: the site's claims
and its own evidence have to agree, because a visitor checking the GitHub link
*is* running the consistency test.

**73% of B2B buyers actively avoid suppliers who send irrelevant outreach.** This
argues against a growth strategy built on cold contact, and in favour of the
inbound posture a static site implies. Again, the constraint and the preference
point the same way.

On proof, **48% of buyers weight peer recommendations above any other form of
content** during the consideration phase — the single hardest thing for this site
to supply today, since the portfolio carries no stars, forks or testimonials. The
case-study structure the research says converts is tight and specific: which
company, which problem in the client's own language, what was specifically done,
what changed, and the numbers. That shape is worth knowing now even though there
is nothing to fill it with yet.

One disqualifier worth recording because it is invisible until it costs
something: in regulated categories, absence of SOC 2, ISO 27001 or a security
page functions as an active procurement rejection signal rather than a neutral
gap. That only binds if Missing Bulb sells into fintech, healthtech or similar —
which is currently unknown, and is the sharpest unanswered targeting question.

## The validation paradox, and the AI reader

A **later Gartner release (2026-05-20, n=645, fielded August–September 2025)**
complicates the rep-free story in a way this page previously had backwards. In
the same body of buyers: **70% prefer a completely digital, self-service buying
experience**, and yet **69% prefer to validate AI-generated insights with a sales
rep**. (This is a different 69% from the website-versus-seller inconsistency
figure above — two unrelated Gartner findings that happen to land on the same
number.) Gartner's own reading is that the seller's role moves from being the
buyer's primary source of information to being their source of **validation and
confidence at a few key points**.

That is not a footnote to the rep-free finding, it is the qualification on it,
and it cuts against the previous pass's conclusion that rep-free buying is simply
good news for a firm with no sales team. Buyers want to self-serve the research
and then have a human confirm what they concluded. Missing Bulb can supply the
self-serve half from a static site; the validation half currently has no owner.
Whatever plays that role — a founder's name and a real reply address, a booked
call, a published opinion a human can be held to — is a site requirement, not a
nice-to-have, and it is a different requirement from "explain the services well".

The second finding in that release is the one that changes what the site is read
by. Buyers used an **average of seven information sources** during a recent
purchase, and **45% used GenAI, primarily to gather information on vendors and
products**. For a large minority of visitors, then, the first reader of this site
is a model summarising it on the buyer's behalf, and what reaches the human is
that summary. A site that only makes sense to someone who browses it — claims
carried by layout, proof carried by implication — degrades badly through that
channel. Stated plainly and in text is not merely good writing here; it is what
survives the intermediary.

This partially answers the standing question about what the four groups search
for on the way: increasingly, they do not search, they ask.

## Site legibility to AI readers

This answers the page's own open question: with 45% of buyers using GenAI specifically to research
vendors, and a wider 94% using an LLM somewhere in the buying journey, does the site's current shape
help or hurt when a model, not a human, is the first reader? Two bodies of research point the same
way, and neither could be read at source (see the citation caveat below), so both rest on
search-summary corroboration.

**The buyer-behavior context is bigger than this page previously stated.** 6sense's 2025 Buyer
Experience Report (surveying **4,000+ buyers across North America, EMEA and APAC**, published
2025-11-12) puts LLM use at **94% of B2B buyers somewhere in their buying process** — mainly to
summarize reviews and synthesize research rather than to pick a vendor outright. That is a
different, wider measure than Gartner's 45% figure above ("used GenAI to research vendors"
specifically), not a contradiction of it: the two surveys ask different questions, and both point at
the same conclusion — an AI intermediary reads this site before most buyers do.

**What the AI-search-optimization literature (GEO/AEO — "generative engine optimization" and "answer
engine optimization") converges on, across several independent write-ups:** a page earns citation and
accurate summarization by being *directly answerable*, not by being well-designed for a human
skimmer. The recurring, concrete practices:

- Lead each section with a self-contained 40–60 word direct answer to the question that section
  covers, before any supporting detail.
- Semantic chunking: one concept per section, written so it can be quoted or cited on its own, out of
  context.
- Schema markup (`FAQPage`, `Article`) where the content is genuinely Q&A- or article-shaped — it
  does not fix prose that isn't structured for the purpose.
- First-party detail (a named project, a real outcome, an actual practice) earns a brand-specific
  citation; a re-stated third-party statistic does not, because the model cites the original.
- Freshness: pages that generate AI impressions without earning citations are a signal to update with
  newer specifics, not to rewrite in general.

None of this is site-specific research — it is what the AEO/GEO literature says generally — so it is
recorded here as a finding to weigh, not a design spec: whether `site/index.html` already does this is
a question for whoever reviews it against the actual markup, not for this wiki pass.

## The four groups, revisited

The stated groups are not equivalent, and the research sharpens the split.
*Consultancy-service buyers* and *SDLC practitioners* are plausible hiring
audiences and are the ones the rep-free findings describe. *AI-curious readers*
and *portfolio browsers* are readers; they may generate the peer recommendations
the first group weights so heavily, which makes them indirectly valuable rather
than merely traffic. Whether that referral path is real for a firm this new is
unverified.

## Sources

- [Gartner Sales Survey Finds 67% of B2B Buyers Prefer a Rep-Free Experience (2026-03-09)](https://www.gartner.com/en/newsroom/press-releases/2026-03-09-gartner-sales-survey-finds-67-percent-of-b2b-buyers-prefer-a-rep-free-experience)
- [Gartner Sales Survey Finds 61% of B2B Buyers Prefer a Rep-Free Buying Experience (2025-06-25)](https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-sales-survey-finds-61-percent-of-b2b-buyers-prefer-a-rep-free-buying-experience) — the prior-year figure the trend is measured against, and the source of the n=632 / Aug–Sep 2024 sample.
- [Gartner Survey Finds 69% of B2B Buyers Turn to Sales Reps to Validate AI-Generated Insights (2026-05-20)](https://www.gartner.com/en/newsroom/press-releases/2026-05-20-gartner-survey-finds-sixty-nine-percent-of-b-two-b-buyers-turn-to-sales-reps-to-validate-ai-generated-insights) — the validation finding, the 70% fully-digital preference, the 45% GenAI-usage figure, the seven-information-sources average, and the n=645 / Aug–Sep 2025 sample.
- [Gartner: Two-thirds of B2B buyers prefer rep-free purchasing as AI reshapes sales, Digital Commerce 360 (2026-03-17)](https://www.digitalcommerce360.com/2026/03/17/gartner-b2b-buyers-rep-free-purchasing-ai-reshapes-sales/) — independent report carrying the n=646 / Aug–Sep 2025 sample and the "for at least part of their purchase" qualifier.
- [Gartner: 67% of B2B Buyers Prefer a Rep-Free Experience, Demand Gen Report](https://www.demandgenreport.com/industry-news/news-brief/gartner-67-of-b2b-buyers-prefer-a-rep-free-experience/52142/) — second independent report of the same release.
- [Gartner Survey Finds 69% of B2B Buyers Turn to Sales Reps to Validate AI-Generated Insights, BusinessWire (2026-05-20)](https://www.businesswire.com/news/home/20260520585188/en/Gartner-Survey-Finds-69-of-B2B-Buyers-Turn-to-Sales-Reps-to-Validate-AI-Generated-Insights) — wire carriage of the May release.
- [Gartner survey reveals B2B buyers' preference for rep-free experience, Mi3](https://www.mi-3.com.au/04-07-2025/gartner-survey-reveals-b2b-buyers-preference-rep-free-experience) — carries the 632-buyer sample, the Aug–Sep 2024 field dates, the 69% website-versus-seller inconsistency figure and the 73% irrelevant-outreach figure.
- [Website Trust Signals That Convert B2B Buyers, Square Root SEO](https://squarerootseo.com/blog/website-trust-signals-that-convert/) — the 48% peer-recommendation figure, the converting case-study structure, and security pages as procurement rejection signals.
- [7 Trust Signals B2B Buyers Read Before The First Meeting, Highly Persuasive](https://www.highlypersuasive.com/7-powerful-psychological-triggers-trust/)
- [B2B Website Trust Signals, Trajectory Web Design](https://www.trajectorywebdesign.com/blog/b2b-website-trust-signals)
- [The B2B Buyer Experience Report for 2025, 6sense](https://6sense.com/science-of-b2b/buyer-experience-report-2025/) — the 94%-LLM-use figure, the 4,000+ buyer sample across NA/EMEA/APAC, and what buyers use LLMs for.
- [The Timeline for Influencing B2B Buyers Is Shrinking, BusinessWire (2025-11-12)](https://www.businesswire.com/news/home/20251112018032/en/The-Timeline-for-Influencing-B2B-Buyers-Is-Shrinking-Insights-From-6senses-2025-Buyer-Experience-Report) — wire carriage of the same 6sense report.
- [B2B Buying Statistics (2026), Omnibound](https://www.omnibound.ai/blog/b2b-buying-statistics) — independent secondary carriage of the 6sense figures.
- [What is Answer Engine Optimization?, Profound](https://www.tryprofound.com/resources/articles/what-is-answer-engine-optimization) — direct-answer structure, semantic chunking and schema-markup guidance.
- [Answer Engine Optimization best practices, HubSpot](https://blog.hubspot.com/marketing/answer-engine-optimization-best-practices) — the six-area AEO framework (structure, formatting, citation quality, schema, entity recognition, topical authority).
- [Answer Engine Optimization (AEO): Your Complete Guide for 2026, AirOps](https://www.airops.com/blog/aeo-answer-engine-optimization)
- [How to optimize content for AI answer engines (AEO), Contentstack](https://www.contentstack.com/blog/ai/how-to-optimize-content-for-ai-answer-engines-aeo) — first-party-data-earns-citation finding, and the freshness signal.

**Citation caveat, recorded rather than hidden:** the figures above are attributed
from search-result summaries rather than read at source. The 2026-08-09 pass
revised the stated cause: it is not (only) HTTP 403 from the publishers, as the
first pass recorded — this environment's fetcher is blocked at the **network
egress proxy** for `gartner.com`, `digitalcommerce360.com`, `demandgenreport.com`
and `businesswire.com` alike, so no primary or secondary carriage of these
releases is directly readable here at all. The Gartner numbers are stated because
each is corroborated across independent secondary reports; the March-2026 sample,
field dates and "at least part of their purchase" qualifier were each confirmed
by two separate searches before being written. Re-verification by a human, or by a
pass with unblocked network access, remains in the open questions below. The
2026-08-24 pass hit the same block on every GEO/AEO and 6sense source it tried
(`tryprofound.com`, `6sense.com`, `blog.hubspot.com`, `www.omnibound.ai`) — the
practices and the 94% figure both rest on two-or-more independently corroborating
search results rather than a fetched page.

## Open questions

- Does Missing Bulb sell into any regulated category? That single answer decides whether the security-page disqualifier binds.
- Re-verify the Gartner, trust-signal, 6sense and GEO/AEO figures at source — no agent pass can do this while the egress proxy blocks the publishers and their wire carriers; it needs a human or an unblocked environment.
- Now that concrete GEO/AEO practices are known (direct-answer leads, semantic chunking, schema markup, first-party specifics), does the shipped `site/index.html` actually follow them? That is a markup audit, not wiki research.
- Who supplies the human validation moment 69% of buyers want, when there is no sales team? Is a named founder with a real reply address enough, or does it take a bookable call?
- Of the four stated groups, which actually make contact? (The "what do they search for" half is partly answered — increasingly they ask a model rather than search.)
- Is the referral path from AI-curious readers to paying buyers real for a firm with no track record, or wishful?
- What does a consulting buyer want in the first screen: services, proof, or people?
- With no case studies available, what is the strongest substitute proof the site can offer?

## Growth log

- **2026-07-30** — initial seed at Claudinite adoption. Owner's stated segments and the stay-scoped constraint recorded; no research performed.
- **2026-07-30** — first research pass on buyer behaviour. Answered the "what does the site have to do" question: with 67% of B2B buyers preferring rep-free buying, the site substitutes for a sales call rather than preceding one, which suits a firm with no sales team. Added the Gartner consistency finding (69%, n=632) and tied it to the brand page's portfolio-age exposure; added the 73% outreach-avoidance and 48% peer-recommendation figures, and the procurement disqualifier. Sharpened the four-group split from "two convert, two are traffic" to a referral path that is plausible but unverified. Primary sources 403'd the fetcher — recorded as a citation caveat and an open question rather than passed off as read.
- **2026-08-09** — spot-check pass on the flagged Gartner citations, which found a correction rather than a confirmation. The 67% rep-free figure carries a qualifier the previous pass dropped ("for at least part of their purchase"), and its sample (n=646, Aug–Sep 2025) is not the n=632 / Aug–Sep 2024 sample behind the 69% and 73% figures. A later Gartner release (2026-05-20, n=645) then inverts the previous pass's top-line reading: 70% of buyers want fully digital self-service *and* 69% want a rep to validate AI-generated insights, so rep-free buying is not the unambiguous good news it was recorded as — the validation moment is a site requirement with no current owner. Added the 45% GenAI-research figure and the seven-source average, which make a model the site's first reader for a large minority of visits. Header rewritten: the flat 67% bullet now carries the qualifier, and two bullets added. Re-verification at source is still impossible here, and the caveat's stated cause was corrected — the block is this environment's egress proxy, not publisher 403s.
- **2026-08-24** — research pass answering this page's standing "is the site legible to an AI reader" question. Found a wider buyer-behavior figure (6sense 2025 Buyer Experience Report, n=4,000+: 94% of B2B buyers use an LLM somewhere in buying, not just the 45% who use GenAI for vendor research specifically — a different survey question, not a contradiction) and the concrete GEO/AEO practices the AI-search-optimization literature converges on: direct-answer leads, semantic chunking, schema markup, and first-party detail over restated third-party stats. Added a new section and updated the GenAI header bullet with the 94% figure. Left the site-specific half of the question open — whether `site/index.html` already follows these practices is a markup audit, not wiki research. Every new source (6sense, Profound, HubSpot, Omnibound) was blocked at the network egress proxy, same pattern as the existing Gartner caveat; both findings rest on corroborating search results only.
