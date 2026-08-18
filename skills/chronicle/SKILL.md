# 个人编年史 / Personal Chronicle

Turn a longitudinal personal archive into a chronicle worth reading — 见证，
not a report, not a highlight reel, not a horoscope.

## Inputs

| file | role |
|------|------|
| `digest/YYYY.md` | per-year selected posts, chronological |
| `style_by_year.csv` | per-year metrics (第一人称密度、英文比例、篇幅、作息) |
| `changepoints.json` | algorithmically detected structural breaks |
| `facts.yaml` | user anchors: 生日、居住地时间线、关系、学校、工作、exclusions |

`facts.yaml` overrides anything inferred from the archive. The archive is
evidence; the user is the authority.

---

## Three layers

Work through all three before writing a word of final prose. Each answers a
question the others cannot.

### 1. 望远镜 — Macro thematic framing

Group years into eras by psychological movement, not by calendar convenience.
An era ends when the writer's relationship to their own life changes, which
is usually not January.

For each era, identify the inciting condition and how it resolved or was
absorbed. Then give it a title that names the movement — 「梦断博雅：理想崩解
与八月的重启」, not 「2011：高考与大学」. A title that could sit on any year is
a failed title.

### 2. 提取 — Golden quotes

A chronicle without primary source is empty. Scan for three kinds:

- **情绪密度高的时刻** — where the guardrails come down
- **隐喻地标** — strong imagery for the self or the world（玻璃碴、暗物质、
  细细的根、明灯）
- **范式转变** — declarative statements where a rule for living is set or
  overturned（"这是相互的过程"、"Good intentions don't work, mechanisms do"）

Quote generously — aim for **6–10 per era**, not one or two. The writer's own
sentences are the best thing in the document. Quote exactly, with the exact
date. Never paraphrase inside quotation marks.

### 3. 显微镜 — Cognitive and linguistic analysis

This is what separates a chronicle from a summary. Analyze *how* the writing
works and how the mind behind it changed:

- **词汇迁移** — poetic/abstract（梦想、远方、谶语）→ analytical/structural
  （杠杆、compounding growth、accountability）. Name the shift with examples
  from both ends.
- **隐喻演化** — trace one concept across years. 家 as destination → 家 as
  a root system the writer generates. 光 as external beacon → 明灯是要自己
  钻木取火的.
- **应对机制的结构变化** — how the text metabolizes difficulty. Watch for
  the deliberate separation of emotion from execution（"情绪还没走出来，头脑
  却清醒知道要保护自己"）, or the reverse.
- **Cross-year threads** — a stated intention and its outcome years later; a
  metric trend the writer named in their own words; a judgment made once and
  rechecked a decade on; a habit recurring under different names.

Cross-year threads are the reason the chronicle is worth reading, and they
require holding the year digests against `style_by_year.csv` simultaneously.
No single year contains them.

---

## Prose form

Continuous prose. Real paragraphs. **No bullet lists in the final chronicle**,
no per-event headers, no labelled 「分析：」 blocks — the analysis is woven
into the narration, not appended to it. Era titles are the only headers.

Quotes sit as block quotes inside the prose, introduced by the sentence that
earns them and followed by the observation they support.

Match the writer's own register. Read the digests for how they actually
write and let that set the diction. For a bilingual writer, code-switch the
way they do, not the way a translator would. 中文保持中文，不译。

Avoid: 成长与挣扎, 蜕变, 破茧, 人生的十字路口, 治愈, 华丽转身, and any
sentence that would stay true if the archive belonged to someone else.

---

## What to discard

Platform sync exhaust carries no meaning and crowds out real posts:

```
啪啪 / 我用啪啪发了张有声照片 / #啪啪随手拍#
Just posted a photo with Instagram
人人网 / 街旁 / 豌豆荚 / 美图秀秀
我的节目《...》已经上传（荔枝FM 等播客同步）
我在#地点# / 我在这里:（纯签到）
分享图片 / 转发微博 / 网页链接（无自述）
发表了博文《...》（仅标题）
来自我的 <设备名>
```

Never narrate these.

### 媒介演化 — treat as a thread, not a tool list

A list of dead apps is trivia. What matters is what the writer became able to
express, and the platforms are only the evidence. Trace, using
`media_by_year.csv`:

- **图文比例的变化** — posts with images per year, images per post. A rising
  ratio usually means the writer stopped relying on words alone to carry a
  scene.
- **媒介类型的扩张** — text → photo → 有声照片 → video → live photo. Each new
  form arrives at a datable moment and changes what gets recorded. 有声照片
  captured ambient sound; live photo captures the seconds around a still.
  Name what each format made possible that the previous one could not.
- **表达带宽与文字长度的关系** — when images rise, does text shorten
  (offloading) or lengthen (annotating)? Both happen, and which one tells you
  something about the writer.
- **拍摄对象的迁移** — self → food and places → other people → work artifacts
  → family. Read this from the digests, not the counts.

Place this as one short movement near the end of the chronicle — a paragraph
or two of prose about expression widening over the years, with the format
names appearing as landmarks inside it. Never as a bulleted list of apps.

Exception elsewhere: when a tool change *is* the story — a year where sync
exhaust displaced real writing — note it once as an observation about the
archive, not about the person.

---

## Tone

Surface hardship honestly. Do not skip failure, grief, rejection, betrayal,
or the years the writer went quiet. A chronicle that omits them is flattery
and the reader will feel it.

Land the footing forward. Where the archive shows what came after a collapse,
put it in the same movement of prose — not as consolation, not as a moral,
but because it happened and the reader already knows it did. Let the reader
finish able to appreciate the person they were.

Never invent recovery the archive does not show.

## Heavy content

Scan each year for bereavement, illness, self-harm, disordered eating, and
relationship violence before writing. In those years: state plainly what the
archive shows, once; do not perform insight; do not use it as a narrative
pivot or a lesson; shorten sentences and drop metaphor.

Honor `facts.yaml` exclusions silently — never mention that something was
excluded.

---

## Fact consistency

**Fixed personal dates do not drift.** A birthday is a date, not a range.
Archive timestamps are in the platform's timezone (Weibo: +0800) while the
writer may have been elsewhere — a post stamped 10/15 06:00 +0800 was written
on 10/14 in New York. Convert to local time via the residence timeline before
asserting any date, and take fixed dates from `facts.yaml`, never from the
stamp.

Never write 生日前一天 / 生日当天 from a raw timestamp. If birthday posts
appear on different dates across years, that is a timezone artifact.

Verify across the whole document: ages（birth year + N）, 学校起止, 居住城市,
工作单位, 伴侣姓名与出现时段, 家人称谓. An age stated in one era must agree
with every other era.

## Citation discipline

Every factual claim traces to a dated post. After drafting, check each date
reference against the archive, and flag any sentence with no proper noun, no
quoted fragment, and no number — the signature of horoscope prose. A flagged
sentence usually needs cutting, not rewriting.
