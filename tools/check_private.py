#!/usr/bin/env python3
"""
Flag personal content before publishing.

The animation skill ships a complete worked implementation, which means the
reference files contain somebody's real quotes, dates, and metaphor chain.
That is useful to read and dangerous to publish unchanged — forks and caches
outlive a deleted repository.

    python3 tools/check_private.py
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Signals that a file carries lived material rather than structure.
PATTERNS = [
    (re.compile(r"[\u4e00-\u9fff]{6,}"), "long CJK string (likely a quote)"),
    (re.compile(r"\b(19|20)\d{2}[.\-/](0?[1-9]|1[0-2])[.\-/](0?[1-9]|[12]\d|3[01])\b"),
     "specific date"),
    (re.compile(r"\b[\w.+-]+@[\w-]+\.[\w.]+\b"), "email address"),
    (re.compile(r"SUB=|SUBP=|Cookie:", re.I), "credential"),
]

SKIP = {".git", "node_modules", "example", "__pycache__"}
EXTS = {".jsx", ".js", ".json", ".html", ".md", ".py", ".css"}

def main():
    hits = []
    for p in ROOT.rglob("*"):
        if not p.is_file() or p.suffix not in EXTS:
            continue
        if any(part in SKIP for part in p.parts):
            continue
        if p.name == "check_private.py":
            continue
        try:
            text = p.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        for rx, label in PATTERNS:
            found = rx.findall(text)
            if found:
                hits.append((p.relative_to(ROOT), label, len(found)))

    if not hits:
        print("clean — no personal content detected")
        return 0

    print("Review before publishing:\n")
    for path, label, n in sorted(hits):
        print(f"  {path}  —  {label} ×{n}")
    print("\nThese are signals, not verdicts. Structural files may match "
          "legitimately.\nThe one that matters most is reference/piece.jsx: "
          "replace its content\nwith your own or with the example before "
          "pushing.")
    return 1

if __name__ == "__main__":
    sys.exit(main())
