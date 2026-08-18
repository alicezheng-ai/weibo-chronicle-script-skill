#!/usr/bin/env python3
"""
Verify a chronicle against the digests it was written from.

For every block quote and inline quotation in the chronicle, find the source
post and report its exact date. Flags quotes that cannot be located — those
are either paraphrases wearing quotation marks, or fabrications.

    python3 verify_chronicle.py 编年史-2009-2026.md backup/digest/

Outputs:
    verify_report.md   quote -> date, plus anything unmatched
"""

import re
import sys
import unicodedata
from pathlib import Path

MONTH_RE = re.compile(r"^##\s*(\d{4})\.(\d{2})")
POST_RE = re.compile(r"^- (.*?)\s*(?:`(\d{2})日[^`]*`)?\s*$")
BLOCKQUOTE = re.compile(r"^>\s?(.*)$")
INLINE = re.compile(r"[「“\"]([^」”\"]{12,})[」”\"]")


def norm(s):
    """Collapse whitespace and punctuation variants so matching is robust."""
    s = unicodedata.normalize("NFKC", s)
    s = re.sub(r"\s+", "", s)
    s = re.sub(r"[，。、．,\.！!？\?；;：:…—\-–～~（）\(\)《》「」『』\"'“”‘’]", "", s)
    return s


def load_json_archive(path):
    """Index the full archive. Digests are a sample; quotes may live outside them."""
    import json
    from datetime import datetime, timedelta, timezone
    TZ = timezone(timedelta(hours=8))
    MON = {m: i + 1 for i, m in enumerate(
        "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split())}
    out = []
    for rec in json.loads(Path(path).read_text(encoding="utf-8")):
        s = str(rec.get("created_at") or "")
        m = re.match(r"^\w{3} (\w{3}) (\d{2}) \d{2}:\d{2}:\d{2} \S+ (\d{4})$", s)
        date = f"{m.group(3)}.{MON[m.group(1)]:02d}.{m.group(2)}" if m else "????"
        body = rec.get("text", "") or ""
        out.append((date, body, norm(body)))
    return out


def load_posts(digest_dir):
    if str(digest_dir).endswith(".json"):
        return load_json_archive(digest_dir)
    posts = []
    for f in sorted(Path(digest_dir).glob("20*.md")):
        year = f.stem
        if not year.isdigit():
            continue
        month = None
        for line in f.read_text(encoding="utf-8").splitlines():
            m = MONTH_RE.match(line)
            if m:
                month = m.group(2)
                continue
            p = POST_RE.match(line)
            if p:
                body = re.sub(r"`[^`]*`", "", p.group(1))
                date = f"{year}.{month or '??'}.{p.group(2) or '??'}"
                posts.append((date, body, norm(body)))
    return posts


def extract_quotes(chronicle):
    text = Path(chronicle).read_text(encoding="utf-8")
    # Drop a leading blockquote used as front matter — it is the author's own
    # note about method, not a quotation from the archive.
    text = re.sub(r"\A(?:#[^\n]*\n+)?(?:>[^\n]*\n)+", lambda m: m.group(0).split("\n")[0] + "\n", text)
    quotes, buf = [], []
    for line in text.splitlines():
        b = BLOCKQUOTE.match(line)
        if b:
            buf.append(b.group(1))
            continue
        if buf:
            joined = " ".join(x for x in buf if x.strip())
            if joined.strip():
                quotes.append(("block", joined.strip()))
            buf = []
        for m in INLINE.finditer(line):
            quotes.append(("inline", m.group(1).strip()))
    if buf:
        quotes.append(("block", " ".join(buf).strip()))
    return quotes


def find_all(needle, posts, min_len=14):
    """
    Return every post containing the quote, oldest first.

    Reposts matter: a line written in 2015 and re-shared in 2022 exists twice
    in the archive with different dates. Returning only the first hit silently
    misattributes the quote — and the gap between an original and its reposting
    is often the most interesting thing in the pair.
    """
    n = norm(needle)
    if len(n) < min_len:
        return []
    hits = [d for d, body, nb in posts if n in nb]
    return sorted(set(hits))


def find(needle, posts, min_len=14):
    n = norm(needle)
    if len(n) < min_len:
        return None, 0.0
    # exact containment first
    for date, body, nb in posts:
        if n in nb:
            return date, 1.0
    # then longest-window partial: quotes may span an elision
    head = n[:40]
    best, score = None, 0.0
    for date, body, nb in posts:
        if head and head in nb:
            return date, 0.9
        # crude overlap on 12-char shingles
        hits = sum(1 for i in range(0, max(len(n) - 12, 1), 6)
                   if n[i:i + 12] in nb)
        total = max(len(range(0, max(len(n) - 12, 1), 6)), 1)
        s = hits / total
        if s > score:
            best, score = date, s
    return (best, score) if score >= 0.5 else (None, score)


def main():
    if len(sys.argv) < 3:
        sys.exit("usage: verify_chronicle.py <chronicle.md> <digest_dir>")
    chronicle, digest_dir = sys.argv[1], sys.argv[2]

    posts = load_posts(digest_dir)
    quotes = extract_quotes(chronicle)
    print(f"{len(posts)} posts indexed · {len(quotes)} quotes in chronicle\n")

    lines = ["# 引文核对报告", "",
             f"来源：{digest_dir}（{len(posts)} 条）", ""]
    ok, miss = 0, 0
    unmatched = []

    lines.append("## 已定位")
    lines.append("")
    for kind, q in quotes:
        date, score = find(q, posts)
        preview = q[:46] + ("…" if len(q) > 46 else "")
        if date:
            ok += 1
            flag = "" if score == 1.0 else f" _(部分匹配 {score:.0%})_"
            lines.append(f"- `{date}` {preview}{flag}")
        else:
            miss += 1
            unmatched.append((kind, preview, score))

    if unmatched:
        lines += ["", "## 未定位 — 需人工核查", "",
                  "以下引文在 digest 中找不到对应原文。可能原因：引自完整存档但未进入"
                  "digest；跨条拼接；或转述被误加了引号。", ""]
        for kind, preview, score in unmatched:
            lines.append(f"- [{kind}] {preview} _(最高相似度 {score:.0%})_")

    Path("verify_report.md").write_text("\n".join(lines), encoding="utf-8")
    print(f"定位 {ok} · 未定位 {miss}")
    print("→ verify_report.md")
    if miss:
        print("\n未定位的引文优先处理——要么补上日期，要么从编年史里删掉。")


if __name__ == "__main__":
    main()
