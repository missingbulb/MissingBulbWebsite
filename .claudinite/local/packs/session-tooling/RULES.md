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
