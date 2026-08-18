# Chronicle Animation (design)

Turn a dated personal archive — a chronicle, a journal export, a set of posts — into
a vertical animated piece: a year axis that never leaves frame, a metaphor relay in
the center, and one spine on the left that changes state as the years pass.

This skill owns the **design and motion** only. It expects the script (the chapters,
the quotes, the dates) to arrive as JSON — see `schema/beats.schema.json`. Pair it
with a script-writing skill: that one produces `beats.json`, this one renders it.

## When to use

Use when the user has dated source material spanning years and wants it animated,
especially for vertical/social delivery. Do not use for slide decks, explainer
videos, or anything without a real date axis — the axis is the whole device.

## The handoff

Your script skill emits `beats.json`:

```json
{
  "title": "编年史",
  "kicker": "WEIBO ARCHIVE · 180 条",
  "range": "2009 — 2026",
  "opening": "十七年里，你换了五次形容自己的方式。",
  "axis": { "from": 2009, "to": 2026 },
  "chain": ["远方", "翅膀", "完整的自己", "明灯", "细细的根"],
  "chapters": [
    {
      "name": "Distance",
      "year": 2009,
      "kicker": "2009 — 2011",
      "word": "远方",
      "dur": 12,
      "quotes": [
        { "y": 2009, "at": 1.2, "text": "…", "date": "2009.12.23 · 十六岁" },
        { "y": 2011, "at": 6.4, "text": "…", "date": "2011.07.20 · 落榜后一个月" }
      ]
    }
  ]
}
```

Field notes, in the order they bite:

- `name` — ASCII identifier, unique. It is the timeline section name; the user's
  timeline editor keys trims and speed changes to it. Never rename after delivery.
- `year` — the chapter's anchor year, used for the spine, not the marker.
- `word` — the metaphor. One to five characters reads best at 104px.
- `dur` — seconds. 8–13 per chapter. Two quotes need 11+.
- `quotes[].at` — seconds from chapter start. First quote at ~1.0–1.2 so the
  metaphor word lands first. Second at ~6.0–7.6.
- `quotes[].y` — **the year this individual quote is from.** Required, and not
  optional even when it equals the chapter year. The marker follows this, not the
  chapter. A chapter whose kicker advertises a range ("2009 — 2011") contains
  quotes from different years, and the axis must agree with the date line printed
  under the quote at every frame.
- `quotes[].muted: true` — renders smaller and at 62% for retrospective asides
  and archive statistics, so they read as annotation rather than voice.

Set `chain` to the metaphor words in order — it stacks up in the closing beat.

## Building it

1. Copy `reference/engine.jsx`, `reference/piece.jsx`, `reference/index.html`.
2. Replace the `CH` table in `piece.jsx` with the chapters from `beats.json`, and
   the `OM_SCENES` string in `index.html` with one entry per chapter (plus
   `Opening` and a closing beat). **The two must stay in the same order** — the
   engine derives cue times from `OM_SCENES` and `piece.jsx` looks cues up by
   `name`. A name in one and not the other silently breaks that chapter.
3. Nothing else needs editing for a first pass.

## The composition

1080×1920. Three zones, and they do not overlap:

| Zone | x range | Carries |
| --- | --- | --- |
| Spine | 150–300 | One continuous line, state changes only |
| Center | 300–880 | Kicker, metaphor word, quote, date |
| Axis | 894–1010 | All 18 years, marker on the active one |

The center column is **580px wide, hard limit.** The axis marker tick starts at
design x 894; a 620px column overlaps it by 16px and cuts into the tail of the
text. Three places carry this width (quote container, per-quote wrapper,
breadcrumb) — change all three or none.

### The year axis (right)

Every year in the range is drawn at all times, at 20px/40% opacity, with the
active year at 26px/800 in the accent. A 46px tick and a 14px square mark the
current position. The axis draws itself in over the first 2.2s and then never
moves — it is the thing the viewer orients against, so it must not animate again.

### The metaphor relay (center)

Kicker (22px, 0.22em tracking, accent) → word (104px, 800) → 2px rule → quote
(40px, 1.55 line-height) → date (22px, deep accent). The whole block drifts
upward ~40px across its chapter. Quotes cross-fade at 0.85s in, 0.55s out.

A breadcrumb of the metaphor chain sits at y=1560, past words at 30% and the
current one in accent — it is what makes the relay legible as a sequence rather
than a series of unrelated cards. Gate it to start after the first chapter, or it
appears under the title card.

### The spine (left)

One vertical line from the first year to the last, whose **drawing state is the
argument**. Map the user's actual narrative onto these moves; do not decorate:

- Full-weight ink for years the archive is dense.
- 22% opacity for a stretch the person went quiet — the gap is the content.
- A lateral jog (60px over 26px of travel) at a decisive break.
- A closed circle at a year of self-sufficiency, fading out over the next 1.6s.
- A flickering point (`0.55 + 0.45 * |sin(T·2.3)·cos(T·1.31)|`) for an unsteady
  guide, gated to its years only.
- Roots branching downward once something takes hold, drawn with staggered
  `strokeDashoffset` at 0.72 offsets.

Everything is `strokeDasharray="1"` + `pathLength="1"` and driven by
`strokeDashoffset`, so segments draw progressively from the year value.

### Background

A dot grid that tightens from 96px to 40px across the piece, plus a rule grid
that fades in after 20%. This is the only place the piece states a trend rather
than quoting one — use it for something monotonic in the source (volume, media
richness, frequency), never for mood.

## Two clocks, and why

The single hardest bug in this design. Time is read **twice**, from the same axis:

- `markerYear` — follows the **active quote**, easing ~1s at each hand-off. It
  holds steady while a quote is on screen.
- `flowYear` — glides continuously across each chapter window. Only the spine and
  the background read this; they need smooth progress to draw at all.

Deriving both from one value cannot work: hold it and the marker falls behind a
chapter's second quote; glide it and the marker runs ahead of the quote on screen
(up to 3 years, on a chapter followed by a distant one). Keep them separate, and
derive `markerYear` from the flat `quoteBeats()` list — the same start/end math the
text renders from — so the marker and the words cannot disagree.

Verify by sweeping the timeline at 1s steps and comparing the axis year against
the date printed under the visible quote. Expect zero mismatches.

## Never load a CJK webfont

For Chinese, Japanese, or Korean text, use a system stack:

```
'Archivo', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif
```

Noto Sans SC ships as ~202 unicode-range subset files **per weight**. The video
exporter serializes the stage and inlines every `@font-face` as a data: URL into
every frame. Two CJK weights measured at **12.01 MB per frame** — about 77 GB
across a 107s render, and the MP4 export simply fails. The system stack takes it
to 0.02 MB/frame. Latin numerals and kickers still come from the loaded display
face; only the CJK glyphs fall back, and on any real device they land on a good one.

Load exactly one Latin family, at the weights actually used. If a stylesheet
already provides it, do not add a second `<link>` — a duplicate load doubles the
inlined payload.

## Type and color

Archivo (or any grotesque with a strong 800) at 400/600/800. Sizes: 132 title,
104 metaphor, 40 quote, 26 breadcrumb, 22 kicker and date, 20/26 axis.

One ground, one ink, one accent. The default is millennial pink: ground `#f5dcd8`,
ink `#2a1c20`, accent `#b0455e`. Accent at 22px and under needs a deeper step —
`#7d2f42` measures 6.8:1 on that ground where the base accent is 3:1. Nothing is
rounded, nothing has a shadow, all rules are 2px.

## Rules of the medium

- **Render everything from `T`.** The exporter seeks each frame and may serialize
  the moment the seek returns. Anything painted from `useEffect` or your own
  `requestAnimationFrame` exports stale or blank.
- **Match the loop seam.** A looping piece shows its last frame immediately before
  its first. Fade the axis, spine, and texture on a `min(head, tail)` envelope so
  both ends resolve to the same empty frame.
- **No mount/unmount at chapter boundaries.** One element tree, always; opacity
  and interpolation do the transitions. That is what lets the axis and spine
  persist across the whole piece.
- **Never put the exportable-video attribute on your own element.** The stage owns
  it. A second one binds the exporter to the wrong node.

## Audio

Leave a `window.OM_MUSIC_SRC = ''` hook and let the user supply the file. Do not
source copyrighted music. A nested `<video>` element with
`data-om-exportable-video-play-start/end` mixes its audio into the export and
follows timeline scrubs.

## Files

- `schema/beats.schema.json` — the input contract, for your script skill to target.
- `reference/piece.jsx` — a complete worked implementation. Read it before writing
  your own; the `CH` table, `quoteBeats`, `markerYear`, and `Spine` are the parts
  that matter.
- `reference/engine.jsx` — the continuous-composition engine. Do not modify.
- `reference/index.html` — portable host page (React + Babel from CDN).
