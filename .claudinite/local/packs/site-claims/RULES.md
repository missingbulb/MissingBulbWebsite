# site-claims — rules

## Facts about a named real person come from that person, or not at all

Writing the who-we-are section (#17) an agent researched the founder and stated
credentials it had picked up from third-party data-aggregator listings — the
company-profile sites that surface for any name. The owner flagged them as
wrong, and the whole section had to be cut back to his name and his LinkedIn
link in a follow-up commit on the already-open PR.

So, for any real person this repo names: use only what the **owner supplies** or
what the person **publishes about themselves** (their own profile, their own
site). Aggregator listings are not a source here — they read as authoritative,
they are unattributed, and the person is the one who gets to correct them. When
the confirmable facts are thin, ship thin and **link out** to the profile that
carries the detail; do not top it up from a search result.

`product-wiki/product-requirements/` requirement 5 pins this for the site's
copy. The rule is written here too because it binds the **research wikis** as
well — and those are exactly where it can recur unseen, since an unattended
growth pass writes them with no human reading before the commit, while the
requirements sink is the reviewed crossing point no unattended pass may touch.
