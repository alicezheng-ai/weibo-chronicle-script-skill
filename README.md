# Chronicle Script

A Claude skill that turns a verified, dated chronicle into `beats.json`
--- the script layer for an animated chronicle piece.

The skill determines **what the piece is about**: which narrative thread
carries the archive, which years become chapters, and which sentences
survive. It does not determine visual motion or animation behavior; that
belongs to the Chronicle Animation skill. Keeping those concerns
separate makes narrative and animation failures independently
debuggable.

## Pipeline

``` text
archive → chronicle skill → 编年史.md
                           → Chronicle Script → beats.json
                                            → animation skill → piece
```

**Input:** A dated chronicle where every quote is traceable to a
verified source and date, optionally with per-year metrics.

**Output:** `beats.json`, validated against `beats.schema.json`.

## What the skill does

### 1. Find the relay

The composition is a **relay**: one short word per chapter, presented
sequentially, with the chain accumulating into a breadcrumb.

Look for a narrative sequence in this order:

1.  **A metaphor the person actually used for themselves** --- the
    strongest option. Look for self-descriptions that recur years apart,
    with later images displacing earlier ones.
2.  **A recurring question** --- for example, a question about purpose,
    home, or competence whose answer changes over time.
3.  **A repeated noun with a shifting referent** --- such as home, work,
    mother, or city.
4.  **A stated intention and its instalments** --- an early plan
    followed by what actually happened to it.

Do not manufacture a metaphor chain if the source does not support one.
Use a plain year-word relay instead: one concrete noun from each year's
own vocabulary.

The resulting `chain` should read as a coherent five-word argument when
stacked in the closing beat. If it does not, revisit the chapter
selection rather than forcing the closing beat.

### 2. Select chapters

Create **6--9 chapters**, plus an opening and closing beat.

A chapter represents a **state of the person**, not a calendar block. It
may span one year or several, and chapter boundaries do not need to
align with consecutive years. Gaps are meaningful when the archive goes
silent.

Each chapter contains:

-   `name` --- unique ASCII identifier; never rename it after delivery.
-   `year` --- anchor year driving the spine.
-   `kicker` --- displayed date/range.
-   `word` --- relay term, 1--5 characters.
-   `dur` --- typically 8--13 seconds; use 11+ seconds when the chapter
    carries two quotes.

The total runtime, including opening and closing, should land between
**90 and 130 seconds**.

### 3. Select quotes

Quotes are **verbatim**. Never paraphrase into a quote field.

If trimming is necessary, use `…` and preserve every remaining character
exactly.

Use at most two quotes per chapter, often one. Each quote includes:

-   `y` --- the year of that individual quote, always set.
-   `date` --- the date plus a short contextual clause.
-   `at` --- approximate reveal timing.
-   `muted` --- `true` only for archive statistics and retrospective
    asides.

The axis marker follows the quote's actual year, not the chapter's
anchor year.

Prefer sentences where:

-   a rule for living is established or overturned;
-   the writing changes register mid-thought;
-   the sentence is significant and true, rather than merely polished.

### 4. Map the spine to the narrative

The spine's drawing states should express the narrative argument.

Delivery notes should identify which years correspond to states such as:

-   full weight where the archive is dense;
-   reduced opacity across a meaningful silence;
-   a lateral jog at a decisive break;
-   a closed circle at a year of self-sufficiency;
-   a flickering point for an unstable guide;
-   roots branching downward once something takes hold.

Only use a state when the archive provides evidence for it. Do not add a
faded stretch to an archive that contains no meaningful silence.

### 5. Choose a background trend

The dot grid tightens monotonically across the piece.

Bind it to something genuinely monotonic in the source, such as:

-   cumulative archive volume;
-   media richness;
-   vocabulary growth.

Do not bind it to mood. If no meaningful monotonic metric exists, use a
cumulative count of something present in the archive.

### 6. Derive the palette

Use one ground, one ink, and one accent. The accent needs sufficient
contrast for small text, targeting roughly **6:1** contrast against the
ground.

Derive the palette, in descending order of reliability, from:

1.  the material itself --- for example, average image hue by era;
2.  the subject's stated color preference;
3.  the archive's register --- cool neutrals for analytical material,
    warmer tones for domestic material.

Do not choose a fashionable palette without source-based reasoning.

Provide **2--3 palette options**, each with the reasoning behind it, and
let the user choose.

### 7. Handle music

Leave `music` empty.

Do not source copyrighted audio. If the user asks for recommendations,
describe the desired tempo and density instead: approximately one event
every 8--13 seconds, with no lyrics competing with on-screen text. The
user supplies audio they have rights to use.

## Validation checklist

Before delivery, verify:

-   Every quote is verbatim against the complete source.
-   Every `quotes[].y` falls within `axis.from`--`axis.to`.
-   Chapter `name` values are unique, ASCII, and match the `OM_SCENES`
    list used by the animation skill, in the same order and spelling.
-   Chapter durations sum to the intended runtime, including opening and
    closing.
-   `chain` contains only chapter `word` values and preserves their
    order.
-   Every quote's axis year matches the year printed in its `date`.

A mismatch is a defect, not a style choice.

## Important failure modes

### Verifying against only a sample

Do not verify quotes against a digest or excerpt alone. Verify against
the **complete archive**. Highly quotable material such as year-end
summaries, birthday posts, and long reflections can be missed by
sampling.

### Reposts and date attribution

A line may appear multiple times because it was reposted.

Return all matches, use the earliest occurrence as `y`, and consider
whether the repost itself is meaningful enough to become a muted
annotation.

### Fixed dates drifting

Birthdays and anniversaries are fixed dates, not ranges. Archive
timestamps may use the platform's timezone while the subject was
elsewhere. Convert timestamps to the person's local time before printing
dates.

### Flattening heavy content into a beat

Bereavement, illness, violence, and self-harm should not automatically
receive a metaphor word or motion flourish. State such events plainly
once, or omit them at the user's direction. A chapter word implies that
an event represents something; not every year should be made to carry
that kind of meaning.

## Design principle

The central rule is:

> **The script layer determines meaning; the animation layer determines
> movement.**

A strong `beats.json` should therefore be defensible from the archive
alone. If the narrative chain, chapter boundaries, quote selection, or
visual states cannot be traced back to evidence in the source, the
script is not finished.
