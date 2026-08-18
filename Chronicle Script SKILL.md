# Chronicle Script (beats)

Turn a dated chronicle into `beats.json` — the script layer for an animated
chronicle piece. This skill decides **what the piece is about**: which thread
carries it, which years become chapters, which sentences survive.

It does not decide how anything looks or moves. That belongs to the Chronicle
Animation skill, which consumes this file. Keep the split: a bad chapter list
and a bad easing curve are different failures and should be debuggable
separately.

## Pipeline position

```
archive → chronicle skill → 编年史.md
                          → THIS SKILL → beats.json
                                       → animation skill → piece
```

Inputs: a dated chronicle (verified — every quote traceable to a source with a
date), and optionally per-year metrics. Output: one JSON file validated against
`beats.schema.json`.

---

## 1. Find the relay

The composition is a **relay**: a short word per chapter, in sequence, with the
chain accumulating in a breadcrumb. So the first job is finding a sequence in
the source that genuinely runs the length of the archive.

Look for these in order of strength:

**A metaphor the person actually used for themselves.** Words describing their
own position or direction, appearing years apart, where later ones displace
earlier ones. This is the strongest device because the person built it without
knowing they were building it. Test: can you state the chain as a sentence?
"From something external they reached toward, to something they made
themselves, to something they grew downward" — if the chain doesn't narrate,
it isn't a chain.

**A recurring question.** Some archives repeat an interrogative for years —
what am I for, where is home, am I good at this. The chapters become its
successive answers.

**A repeated noun with shifting referent.** 家, work, mother, the city. The
word stays; what it points at moves.

**A stated intention and its instalments.** Someone declares a plan early and
the archive records what happened to it.

If none of these hold, **do not force a metaphor chain onto the material.**
Say so, and use a plain year-word relay instead — one concrete noun per
chapter drawn from that year's own vocabulary. The device degrades gracefully;
a fabricated metaphor does not, and readers who know the source will feel it.

Set `chain` to the words in order. It stacks in the closing beat, so it is also
the piece's argument in five words. If the stack reads as nonsense, the chapter
selection is wrong, not the closing beat.

## 2. Chapters

6–9 chapters plus an opening and a closing beat. Fewer than six and the axis
has nothing to travel across; more than nine and no chapter earns its word.

A chapter is **a state of the person, not a calendar block.** Chapters may span
one year or four, and may be adjacent in the source without being adjacent in
years — a gap between chapter years is information, and the axis will show it.

For each: `name` (ASCII, unique, never renamed after delivery — the timeline
editor keys trims to it), `year` (the anchor, drives the spine), `kicker` (the
displayed range), `word` (the relay term, 1–5 characters at 104px), `dur`.

Duration: 8–13s typical, 11+ if the chapter carries two quotes. Total runtime
including opening and closing lands between 90 and 130 seconds. Beyond that the
axis stops being legible as a whole.

## 3. Quotes

**Verbatim. Never paraphrase into a quote field.** This is the load-bearing
rule of the whole pipeline — the piece's authority comes from the viewer
believing these are real sentences. If a line needs trimming, elide with … and
keep every remaining character exact.

Two per chapter maximum, often one. `at` ~1.0–1.2s for the first so the
metaphor word lands before the text; ~6.0–7.6s for the second.

`y` is **the year of that individual quote**, always set, even when it equals
the chapter year. The axis marker follows the quote, not the chapter. A chapter
labelled 2009 — 2011 holds quotes from different years, and the axis must agree
with the printed date at every frame.

`date` carries the date plus a short context clause — "2011.07.20 · 落榜后一个
月". The context is what makes a stranger's sentence legible; the date alone
makes them do arithmetic.

`muted: true` for archive statistics and retrospective asides. These render at
62% and read as annotation. Never mute the person's own voice.

Selecting quotes: prefer the sentence where a rule for living is set or
overturned, or where the writing changes register mid-thought. Avoid the
best-written sentence if it is not also the truest — polish and significance
come apart, and the piece needs significance.

## 4. Map the spine to the actual narrative

The spine's drawing states are an argument, not decoration. Say in the delivery
notes which years map to which state, from evidence:

- full weight where the archive is dense
- 22% opacity across a silence — the gap is content
- a lateral jog at a decisive break
- a closed circle at a year of self-sufficiency
- a flickering point for an unsteady guide
- roots branching downward once something takes hold

If a state has no year that earns it, drop the state. An archive with no
silence should not get a faded stretch.

## 5. Background trend

The dot grid tightens monotonically across the piece. Bind it to something
genuinely monotonic in the source — cumulative volume, media richness,
vocabulary growth. Never to mood, which is not monotonic in anyone.

If the obvious candidate is non-monotonic, use cumulative count of anything;
it always rises, and it is honest.

## 6. Palette

One ground, one ink, one accent. The accent needs a deeper step for text at
22px and under — target ~6:1 contrast on the ground.

Deriving palette from content, in descending reliability:

- **From the material itself** — average hue of the archive's images per era,
  if images exist. This grounds the piece in what the person actually saw.
- **From the subject's own stated preference**, if the archive names one.
- **From register** — cool neutrals for an analytic archive, warm for a
  domestic one. Weak, but defensible.

Do not pick a palette because it is fashionable. The default millennial pink in
the animation skill is a default, not a recommendation; a chronicle of grief or
of a technical career will fight it.

Offer the user 2–3 palettes with the reasoning attached, and let them choose.
The reasoning is what makes it a design decision rather than a theme picker.

## 7. Music

Leave `music` empty. Never source copyrighted audio; the user supplies the
file. If asked to recommend, describe the tempo and density the cut needs — one
event per 8–13 seconds, no lyrics competing with on-screen text — and let them
find something they have rights to.

## Validation before delivery

1. **Every quote verbatim.** Diff each against the source. Any mismatch is a
   defect, not a style choice.
2. **`quotes[].y` inside `axis.from`–`axis.to`** for every quote.
3. **Chapter `name` values unique**, ASCII, matching the `OM_SCENES` list the
   animation skill will build — same order, same spelling.
4. **Sum of durations** equals the intended runtime; opening and closing
   included.
5. **`chain` is a subset of chapter `word`s**, in the same order.
6. **Marker/date agreement**: for each quote, the axis year the animation will
   show equals the year printed in `date`. Sweep and compare; expect zero
   mismatches.

## Failure modes worth naming

**Verification against a sample, not the full source.** If the chronicle was
written from a digest or excerpt, verify quotes against the *complete* archive.
The most quotable lines — year-end summaries, birthday posts, long reflections
— are exactly the ones sampling heuristics miss, so sample-based verification
reports true quotes as fabrications and invites deleting correct material.

**Reposts break date attribution.** A line written once and re-shared years
later exists twice with different dates. Return all matches, take the earliest
as `y`, and consider whether the repost's timing is itself worth a `muted`
quote — someone re-sharing an old line about self-sufficiency weeks before a
rupture is the archive volunteering a fact.

**Fixed dates drifting.** Birthdays and anniversaries are dates, not ranges.
Archive timestamps sit in the platform's timezone while the person may have
been elsewhere; convert to their local time before printing any date.

**Heavy content flattened into a beat.** Bereavement, illness, violence, and
self-harm appear in real archives. Do not give them a metaphor word or a
motion flourish. State them once, plainly, or leave them out at the user's
direction. A chapter word is a claim that something means something; some
years should not get one.
