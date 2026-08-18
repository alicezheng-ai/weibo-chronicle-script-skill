# Exporting an archive

Notes from building this against a large social archive. The specifics are
Weibo's, but the failure shapes recur anywhere you pull years of your own data
out of a platform that never intended you to.

## The general problem

Long archives fail differently from short ones. A tool that works perfectly on
500 posts can be quietly wrong on 30,000, because at that scale the export takes
days rather than minutes — and things that expire, throttle, or get interrupted
start to matter. Worse, most of these failures are **silent**: the tool reports
success and the archive is incomplete.

Check the result against a known total before trusting it. Most platforms
display a post count somewhere; it is the only end-to-end assertion available.

## Silent truncation

**A hard page cap you did not set.** A crawler with `--max-pages` will stop at
that number and write a complete-looking output file. A suspiciously round
result — exactly 5,000 posts — is the tell.

**An ambiguous end-of-data signal.** Pagination endpoints often return an empty
page with a success status both when the data is exhausted and when you are
being throttled. There is no field distinguishing them. Treating consecutive
empty pages as termination will truncate an archive under load and report
success. Wait considerably longer than the normal delay and re-probe before
accepting the end.

**Text truncated at source.** Long posts frequently arrive cut off with a
"read more" marker and require a second request per post to retrieve the body.
If that call fails, or the run is interrupted, or a page was cached before the
logic existed, the truncation becomes permanent — and the post still looks
valid. Make repair a **separate pass** over the finished export rather than a
step inside the crawl, so it can be re-run against everything.

That second call is also not universally reliable. For recent long posts it may
return nothing while the post's own detail page has the full text. Have a
fallback, and detect truncation by the marker rather than by length: a repaired
post can be *shorter* than the truncated one, because the truncated version
carried an ellipsis and a "read more" suffix the real text does not.

## Media has more than one authentication model

Three kinds of media in one archive behaved three different ways:

**Still images** — plain CDN URLs, no auth, no expiry. Download whenever.

**Live photos** — the URL in the API response is *unsigned* and returns 403
with a body reading `deny by url auth`. A signed variant has to be minted by
requesting the player wrapper and following the redirect. Recording the URL as
captured produces a list of dead links.

**Videos** — the URL *is* signed, and expires roughly an hour after issue. On a
multi-day crawl, the videos from the early pages are dead before the crawl
finishes. Each must be re-resolved immediately before download. This makes
"collect URLs, download at the end" structurally broken at scale and perfectly
fine at 500 posts, which is why nobody writes it down.

Before bulk-downloading, fetch three files and read the response headers. A 403
with a tiny body is an auth problem and probably solvable; a 404 means the
content is gone and nothing will bring it back.

## Practical

**Cache raw responses per page.** It makes an interrupted run resumable, which
matters when the run is measured in days. Only cache pages that actually
contained data — caching an empty or error response poisons every later run.

**Do not parallelize.** Platforms rate-limit by IP, so two processes make both
slower and cause timeouts that cost more than the delay you saved.

**Session cookies expire in weeks.** Any scheduled backup at a longer interval
than that will find a dead credential every time it fires. Have it notify rather
than fail silently, and keep the credential out of plaintext files.

**Prevent sleep** for long runs, and expect network drops — retry logic earns
its keep.
