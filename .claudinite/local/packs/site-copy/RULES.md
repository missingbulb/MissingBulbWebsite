# site-copy — rules

## Lead with what the site actually does, then the narrower true claims

PR #20 added Cloudflare Web Analytics (visit counting) and shipped `privacy.html`
in the same commit — but the page's first draft still led with *"no cookies, no
tracking, no personal data,"* a claim the very commit adding it had just made
false. Review caught it before merge: the lede was rewritten to state what's
actually measured first, plainly say the site is **not** analytics-free, and keep
the narrower claims (no cross-site tracking, no ads, no cookies set by us) only
where they remain true.

So: lead with what is actually done, then the narrower true claims — never a
blanket denial the new behavior no longer supports.
