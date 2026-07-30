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
