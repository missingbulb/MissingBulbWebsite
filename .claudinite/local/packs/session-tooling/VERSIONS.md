# Version history

Records for `local/packs/session-tooling`'s own change log — one row per change automatic
work makes to it. There is no version number here (a local pack is neither versioned nor
distributed); the granularity is one row per change.

| Date | Task | Change |
|---|---|---|
| 2026-08-24 | `growth-dedup` | Stripped: **`enable_pr_auto_merge` can never arm in this repo** to its residue (kept as "`enable_pr_auto_merge` never arms here — skip straight to a direct merge") — the diagnosis is now covered by `git-github`'s `git-github-advanced` SKILL.md: "'Protected branch rules not configured' — auto-merge is a protected-branch feature, so a repo with no rule on its default branch can never arm it. Final; don't let an earlier refusal's wording talk you out of it." |
| 2026-08-24 | `growth-dedup` | Stripped: **An egress block is not a publisher 403 — and doesn't forgive a second source** to its residue (kept as "`codeload.github.com` is blocked here too") — the egress-block half is now covered by `basics` RULES.md: "Recognize a fetch tool's own signal for a domain-wide **egress block**... mark it as needing a human or an unblocked environment instead," and the snippet-attribution half by `product-wiki` RULES.md: "Seeing a figure in several places is not evidence of who published it." |
| 2026-08-24 | `growth-dedup` | Removed: **`search_issues` ranks, it never filters — find a known title with `list_issues`** — covered by `git-github`'s `git-github-advanced` SKILL.md: "an MCP layer in front of it may match **semantically** instead... Enumerate with `list_issues` (a narrow field list, a large page size, no state filter — a log issue is often deliberately closed) and compare the string in-session." |
| 2026-08-24 | `growth-dedup` | Removed: **`ScheduleWakeup` wants a `prompt`, and its refusal is not "this tool isn't for you"** — covered by `basics` RULES.md: "Scheduling a wake-up with the harness — pass `prompt`... A rejection leaves no fallback armed, which is what the `unattended-agents` skill's re-issue rule is for." |
| 2026-08-24 | `growth-dedup` | Removed: **Don't retype file content into `push_files` / `create_or_update_file`** — covered by `git-github`'s `git-github-advanced` SKILL.md: "`push_files`/`create_or_update_file` take the file body as a literal string the model composes for the call, so what lands is a **transcription** of the file, not the file... read the result back with a file-contents fetch and diff it against the local copy before moving on." |
