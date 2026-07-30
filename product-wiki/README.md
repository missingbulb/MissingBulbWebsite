# product-wiki — Missing Bulb's research wiki

Market, audience and competitor research for the Missing Bulb commercial
website, kept as agent-maintained wikis: compiled once, refined in place, every
claim cited. Claudinite's `product-wiki` pack owns the standard — layout,
required page sections, growth-log dating and the isolation wall are all
check-enforced, so this index only says what lives here.

## Why it is walled off

Nothing in the site's own code, content or docs may reference this tree. It
holds unreviewed research, and a marketing page that quietly sources a claim
from an unreviewed wiki page is a claim nobody approved. The one crossing point
is [`product-requirements/`](product-requirements/README.md) — human-reviewed, never grown by an
unattended pass, and the only `product-wiki/` content the rest of the repo may
build on.

## What lives here

| Path | What it is |
|---|---|
| [`product-requirements/`](product-requirements/README.md) | the reviewed sink — research distilled into requirements for the site |
| [`brand/`](brand/README.md) | wiki: how Missing Bulb positions itself and what the site must convey |
| [`audience/`](audience/README.md) | wiki: the segments the site is written for, and what each one needs from it |
| [`consulting-market/`](consulting-market/README.md) | wiki: the software / management / AI consulting category and its competitor set |

`sample-data/` is reserved for small illustrative assets a wiki claim points to;
it does not exist yet because no claim needs one. Any other folder added here
*is* a wiki, by the standard's structural classifier — so add one deliberately.

## Growing it

The pack's weekly `wiki-growth` task rides this repo's own scheduler and lands
its research as an unmerged PR. In-session, the owner phrase **"grow the product
wiki"** runs the same method with web tooling. Most passes correctly change
nothing.
