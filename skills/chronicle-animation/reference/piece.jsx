/* 编年史 2009–2026 — vertical (1080x1920) continuous composition.
   Right: a year axis always in frame. Center: the metaphor relay.
   Left: one spine that dims, jogs, then puts out roots. */

const { useComposition, Shot, Easing, interpolate, animate, clamp, CompositionStage } = window;
const { useTweaks, TweaksPanel, TweakSection, TweakToggle, TweakColor } = window;

const INK = '#2a1c20';
const BG = '#f5dcd8';
const W = 1080, H = 1920;

const AX = 940;              // year axis x
const TOP = 300, BOT = 1560; // 2009 .. 2026
const yearY = (y) => TOP + ((y - 2009) / 17) * (BOT - TOP);

const MOTION = {
  enter: (start, from, to, d) => animate({ from, to, start, end: start + (d || 0.9), ease: Easing.easeOutCubic }),
  draw: (start, end) => animate({ from: 0, to: 1, start, end, ease: Easing.easeInOutSine }),
  pop: (start) => animate({ from: 0.94, to: 1, start, end: start + 0.5, ease: Easing.easeOutBack }),
};

const CH = [
  {
    name: 'Distance', year: 2009, kicker: '2009 — 2011', word: '远方',
    quotes: [
      { at: 1.2, text: '我晓得我的缺陷是易受环境影响与眼高手低努力不够。或者是缺乏毅力。我不会放任自流的。', y: 2009, date: '2009.12.23 · 十六岁' },
      { at: 6.4, text: '我就像是光脚穿着大裙摆的曳地裙在跳舞，地面全是梦想破碎以后又尖又利的玻璃碴。表面看起来我很好，我在微笑。', y: 2011, date: '2011.07.20 · 高考落榜后一个月' },
    ],
  },
  {
    name: 'Wings', year: 2011, kicker: '2011 — 2013', word: '翅膀',
    quotes: [
      { at: 1.0, text: '我不想一辈子缩在一个城市一种生活里，我想去不同的地方，有不同的朋友爱人，让自己变得无比丰盛。这是目的也是路径。', y: 2011, date: '2011.08.20 · 塌方一个月后' },
      { at: 6.0, text: '之前我理解「幸运」，是把这个世界当成夹娃娃机，不停索取。但现在，我觉得这是相互的过程，你给世界它想要的，它自然报你以歌。', y: 2013, date: '2013.12.21 · 到纽约第五个月' },
    ],
  },
  {
    name: 'DarkMatter', year: 2014, kicker: '2014', word: '暗物质',
    quotes: [
      { at: 1.2, text: '我的情绪是暗物质，占 70% 的世界，而我放弃书写它。让心被吃空，我不觉得有问题，直到问题把我吞没。', y: 2014, date: '2014.01.02 · 这一年的第九天' },
      { at: 7.6, text: '第一人称密度：每千汉字 24.4 → 5.2，六年单调下行。你在 1 月 2 日就宣布了，也在同一条里写下了代价。', y: 2014, date: '存档统计 · 2010 — 2020', muted: true },
    ],
  },
  {
    name: 'Whole', year: 2015, kicker: '2015', word: '完整的自己',
    quotes: [
      { at: 1.2, text: '爱情不是你拯救了我，我没有你不行，而是一些锦上添花的快乐。在没有你的时候，我是完整的自己。', y: 2015, date: '2015.06.01 · 七年后又发了一遍' },
    ],
  },
  {
    name: 'Lamp', year: 2021, kicker: '2021', word: '明灯',
    quotes: [
      { at: 1.2, text: '明灯是要自己钻木取火的。它不像太阳一样明确，它也不像月亮一样有规律。它忽明忽暗，不定性状，只能走一步亮一步。', y: 2021, date: '2021.01.01 · 跨年看完《Soul》' },
      { at: 7.4, text: '十二年前那个需要明媚的远方、要飞蛾一般投奔过去的人，不再等外部世界给一个宏大确定的答案。', y: 2021, date: '', muted: true },
    ],
  },
  {
    name: 'Turn', year: 2022, kicker: '2022', word: '翻篇',
    quotes: [
      { at: 1.0, text: '今天我就离开圣路易斯啦！接下来的路就是我一个人往前走啦。翻篇！', y: 2022, date: '2022.07.25 · 距坍塌十六天' },
      { at: 6.6, text: '刚搬过来那一个星期，我每天傍晚都走到这里坐（哭）到天黑再回酒店。现在两个月过去了，我有力气早起跑过来看日出。我有进步。', y: 2022, date: '2022.09.28 · 西雅图' },
    ],
  },
  {
    name: 'Root', year: 2023, kicker: '2023', word: '细细的根',
    quotes: [
      { at: 1.2, text: '我在飘飘荡荡的世界里，勇敢拧出一条细细的根，给自己一个家。这条细根可能不是一个非常牢靠的结构，但我信任自己的能力。', y: 2023, date: '2023.10.15 · 三十岁生日' },
    ],
  },
  {
    name: 'Bandwidth', year: 2026, kicker: '2026', word: '带宽',
    quotes: [
      { at: 1.0, text: '宝宝挤爆了我所有的内存和带宽，清醒的时间全在应对他的无规律大哭。', y: 2026, date: '2026.07.21 · 儿子出生一个月' },
    ],
  },
  { name: 'RootGrows', year: 2026, kicker: '', word: '', quotes: [] },
];

const CHAIN = ['远方', '翅膀', '完整的自己', '明灯', '细细的根'];

function windows(CUES, authoredTotal) {
  return CH.map((c, i) => {
    const start = CUES[c.name];
    const end = i + 1 < CH.length ? CUES[CH[i + 1].name] : authoredTotal;
    const nextYear = i + 1 < CH.length ? CH[i + 1].year : c.year;
    return { ...c, start, end, nextYear };
  });
}

// Two readings of the same clock. markerYear indexes what the viewer is
// reading: it HOLDS on the chapter's own year and travels only in the last
// 1.6s, as the next chapter takes over. flowYear glides across the whole
// window — the spine's draw progress needs continuous motion, not a hold.
// Flat list of quote beats — the same start/end math Chapter renders from,
// hoisted so the marker and the text cannot disagree.
function quoteBeats(wins) {
  const out = [];
  for (const c of wins) {
    c.quotes.forEach((q, i) => {
      const next = c.quotes[i + 1];
      out.push({
        y: q.y,
        start: c.start + q.at,
        end: next ? c.start + next.at - 0.45 : c.end - 0.35,
      });
    });
  }
  return out;
}

// Marker year follows the ACTIVE QUOTE, easing over ~1s into each hand-off.
function markerYear(T, beats) {
  if (!beats.length) return 2009;
  if (T <= beats[0].start) return beats[0].y;
  const last = beats[beats.length - 1];
  if (T >= last.start) return last.y;
  for (let i = 0; i < beats.length - 1; i++) {
    const a = beats[i], b = beats[i + 1];
    if (T >= a.start && T < b.start) {
      if (a.y === b.y) return a.y;
      const glide = Math.min(1, Math.max(0.35, b.start - a.start));
      const p = clamp((T - (b.start - glide)) / glide, 0, 1);
      return interpolate([0, 1], [a.y, b.y], Easing.easeInOutCubic)(p);
    }
  }
  return last.y;
}

function currentYear(T, wins, CUES, mode) {
  if (T < CUES.Distance) return 2009;
  for (const w of wins) {
    if (T >= w.start && T <= w.end) {
      const span = Math.max(0.001, w.end - w.start);
      let p;
      if (mode === 'marker') {
        const glide = Math.min(1.6, span * 0.35);
        p = clamp((T - (w.end - glide)) / glide, 0, 1);
      } else {
        const hold = Math.min(1.1, span * 0.15);
        p = clamp((T - w.start - hold) / (span - hold), 0, 1);
      }
      return interpolate([0, 1], [w.year, w.nextYear], Easing.easeInOutCubic)(p);
    }
  }
  return 2026;
}

/* ---------- background: the recordable world getting denser ---------- */
function Texture({ p, on }) {
  if (!on) return null;
  const dotGap = 96 - 56 * p;
  const ruleGap = 220 - 110 * p;
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.7,
        backgroundImage: `radial-gradient(circle, rgba(42,28,32,${(0.13 + 0.16 * p).toFixed(3)}) 1.6px, rgba(0,0,0,0) 1.7px)`,
        backgroundSize: `${dotGap}px ${dotGap}px`,
      }} />
      <div style={{
        position: 'absolute', inset: 0, opacity: clamp((p - 0.2) * 1.4, 0, 1) * 0.5,
        backgroundImage: `linear-gradient(to bottom, rgba(42,28,32,0.10) 0 1px, rgba(0,0,0,0) 1px)`,
        backgroundSize: `100% ${ruleGap}px`,
      }} />
    </div>
  );
}

/* ---------- right: the year axis, always in frame ---------- */
function YearAxis({ T, year, accent }) {
  const drawn = MOTION.draw(0.3, 2.2)(T);
  const markY = yearY(year);
  const years = [];
  for (let y = 2009; y <= 2026; y++) years.push(y);
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute', left: AX, top: TOP - 40, width: 2, background: INK,
        height: (BOT - TOP + 80) * drawn, transformOrigin: 'top',
      }} />
      {years.map((y) => {
        const near = Math.abs(y - year) < 0.55;
        const app = clamp((drawn - (y - 2009) / 20) * 6, 0, 1);
        return (
          <div key={y} style={{
            position: 'absolute', left: AX + 18, top: yearY(y) - 15, opacity: app * (near ? 1 : 0.4),
            fontFamily: 'Archivo, sans-serif', fontSize: near ? 26 : 20,
            fontWeight: near ? 800 : 600, letterSpacing: '0.02em',
            color: near ? accent : INK, transition: 'none',
          }}>{y}</div>
        );
      })}
      <div style={{ position: 'absolute', left: AX - 46, top: markY - 1, width: 46, height: 2, background: accent, opacity: drawn }} />
      <div style={{ position: 'absolute', left: AX - 7, top: markY - 7, width: 14, height: 14, background: accent, opacity: drawn }} />
    </div>
  );
}

/* ---------- left: one spine, dimmed, jogged, then rooting ---------- */
function Spine({ T, year, accent }) {
  const x1 = 176, x2 = 236;
  const yA = yearY(2009), yD = yearY(2014), yT = yearY(2022), yR = yearY(2023), yEnd = yearY(2026);
  const seg = (from, to) => clamp((year - from) / (to - from), 0, 1);
  const flick = 0.55 + 0.45 * Math.abs(Math.sin(T * 2.3) * Math.cos(T * 1.31));
  const lampOn = clamp((year - 2020.4) / 0.8, 0, 1) * clamp((2022.4 - year) / 0.8, 0, 1);
  const rootP = clamp((year - 2022.9) / 3.1, 0, 1);

  const branch = (i) => {
    const dir = i % 2 ? 1 : -1;
    const y0 = yEnd + 30 + i * 62;
    const len = 90 + (i % 3) * 46;
    return `M ${x2} ${y0} C ${x2 + dir * 20} ${y0 + 26}, ${x2 + dir * len * 0.7} ${y0 + 40}, ${x2 + dir * len} ${y0 + 78 + (i % 2) * 24}`;
  };

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {/* 2009–2014: full ink */}
      <path d={`M ${x1} ${yA - 30} L ${x1} ${yD}`} stroke={INK} strokeWidth="2" fill="none"
        pathLength="1" strokeDasharray="1" strokeDashoffset={1 - seg(2009, 2014)} opacity="0.9" />
      {/* 2014–2022: the dark-matter years, drawn faint */}
      <path d={`M ${x1} ${yD} L ${x1} ${yT}`} stroke={INK} strokeWidth="2" fill="none"
        pathLength="1" strokeDasharray="1" strokeDashoffset={1 - seg(2014, 2022)} opacity="0.22" />
      {/* the jog — 翻篇 */}
      <path d={`M ${x1} ${yT} L ${x2} ${yT + 26} L ${x2} ${yEnd + 30}`} stroke={INK} strokeWidth="2" fill="none"
        pathLength="1" strokeDasharray="1" strokeDashoffset={1 - seg(2022, 2026)} opacity="0.9" />
      {/* roots */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path key={i} d={branch(i)} stroke={accent} strokeWidth="2" fill="none" pathLength="1"
          strokeDasharray="1" strokeDashoffset={1 - clamp(rootP * 6 - i * 0.72, 0, 1)} opacity="0.85" />
      ))}
      <path d={`M ${x2} ${yEnd + 30} L ${x2} ${yEnd + 30 + 460 * rootP}`} stroke={accent} strokeWidth="2" fill="none" opacity="0.85" />
      {/* 完整的自己 — a closed circle */}
      <circle cx={x1} cy={yearY(2015)} r="26" stroke={INK} strokeWidth="2" fill="none" pathLength="1"
        strokeDasharray="1" strokeDashoffset={1 - clamp((year - 2014.9) / 0.7, 0, 1)}
        opacity={0.75 * clamp((2018 - year) / 1.6, 0, 1)} />
      {/* 明灯 — one small flickering lamp */}
      <circle cx={x1} cy={yearY(2021)} r="9" fill={accent} opacity={lampOn * flick} />
      <circle cx={x1} cy={yearY(2021)} r={22 + 8 * flick} fill="none" stroke={accent} strokeWidth="2" opacity={lampOn * 0.3 * flick} />
      {/* 远方 — the horizon it once flew toward */}
      <g opacity={clamp((2012.4 - year) / 1.2, 0, 1) * 0.5}>
        <path d={`M ${x1 - 60} ${yA - 84} L ${x1 + 300} ${yA - 84}`} stroke={INK} strokeWidth="2" />
      </g>
    </svg>
  );
}

/* ---------- center: the metaphor relay ---------- */
function Chapter({ c, T, accent }) {
  const t = T - c.start;
  const drift = MOTION.enter(c.start, 26, -14, Math.max(1, c.end - c.start))(T);
  const wordIn = MOTION.enter(c.start + 0.15, 0, 1, 0.8)(T);
  const wordOut = clamp((c.end - T) / 0.5, 0, 1);
  return (
    <Shot from={c.start} to={c.end}>
      <div style={{ position: 'absolute', left: 300, top: 300, width: 600, transform: `translateY(${drift}px)` }}>
        <div style={{
          fontFamily: 'Archivo, sans-serif', fontSize: 22, fontWeight: 800, letterSpacing: '0.22em',
          color: accent, opacity: wordIn * wordOut, marginBottom: 18,
        }}>{c.kicker}</div>
        <div style={{
          fontFamily: 'Archivo, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif', fontSize: 104, fontWeight: 800, lineHeight: 1.02,
          letterSpacing: '-0.01em', color: INK,
          opacity: wordIn * wordOut,
          transform: `translateY(${(1 - wordIn) * 18}px)`,
        }}>{c.word}</div>
        <div style={{ height: 2, background: INK, marginTop: 34, width: 600 * wordIn * wordOut, opacity: 0.85 }} />
      </div>

      <div style={{ position: 'absolute', left: 300, top: 720, width: 580, transform: `translateY(${drift * 0.5}px)` }}>
        {c.quotes.map((q, i) => {
          const next = c.quotes[i + 1];
          const start = c.start + q.at;
          const end = next ? c.start + next.at - 0.45 : c.end - 0.35;
          const inP = clamp((T - start) / 0.85, 0, 1);
          const outP = clamp((end - T) / 0.55, 0, 1);
          const op = Easing.easeOutCubic(inP) * outP;
          if (op <= 0.001) return null;
          return (
            <div key={i} style={{ position: 'absolute', left: 0, top: 0, width: 580, opacity: op, transform: `translateY(${(1 - Easing.easeOutCubic(inP)) * 24}px)` }}>
              <div style={{
                fontFamily: 'Archivo, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif', fontSize: q.muted ? 32 : 40, fontWeight: q.muted ? 400 : 600,
                lineHeight: 1.55, color: INK, opacity: q.muted ? 0.62 : 1, textWrap: 'pretty',
              }}>{q.text}</div>
              {q.date ? (
                <div style={{
                  marginTop: 28, fontFamily: 'Archivo, sans-serif', fontSize: 22, fontWeight: 800,
                  letterSpacing: '0.06em', color: '#7d2f42',
                }}>{q.date}</div>
              ) : null}
            </div>
          );
        })}
      </div>
    </Shot>
  );
}

function Opening({ T, accent }) {
  const a = MOTION.enter(0.2, 0, 1, 1.1)(T);
  const out = clamp((4.7 - T) / 0.6, 0, 1);
  return (
    <Shot from={0} to={5.05}>
      <div style={{ position: 'absolute', left: 176, top: 700, width: 720, opacity: a * out, transform: `translateY(${(1 - a) * 24}px)` }}>
        <div style={{ fontFamily: 'Archivo, sans-serif', fontSize: 24, fontWeight: 800, letterSpacing: '0.28em', color: accent, marginBottom: 26 }}>
          WEIBO ARCHIVE · 180 条
        </div>
        <div style={{ fontFamily: 'Archivo, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif', fontSize: 132, fontWeight: 800, lineHeight: 1, color: INK }}>编年史</div>
        <div style={{ height: 2, background: INK, margin: '34px 0 30px', width: 720 * a }} />
        <div style={{ fontFamily: 'Archivo, sans-serif', fontSize: 56, fontWeight: 600, letterSpacing: '0.04em', color: INK }}>2009 — 2026</div>
        <div style={{ marginTop: 40, fontFamily: 'Archivo, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif', fontSize: 34, lineHeight: 1.5, color: INK, opacity: 0.7 }}>
          十七年里，你换了五次形容自己的方式。
        </div>
      </div>
    </Shot>
  );
}

function Ending({ T, start, accent, total }) {
  const seam = clamp((total - T) / 1.2, 0, 1);
  return (
    <Shot from={start} to={9999}>
      <div style={{ position: 'absolute', left: 300, top: 420, width: 600, opacity: seam }}>
        {CHAIN.map((w, i) => {
          const at = start + 0.6 + i * 0.95;
          const op = clamp((T - at) / 0.7, 0, 1);
          const last = i === CHAIN.length - 1;
          return (
            <div key={w} style={{
              fontFamily: 'Archivo, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif', fontSize: last ? 76 : 52, fontWeight: last ? 800 : 600,
              lineHeight: 1.34, color: last ? accent : INK, opacity: op * (last ? 1 : 0.42),
              transform: `translateY(${(1 - op) * 16}px)`, marginTop: last ? 20 : 0,
            }}>{w}</div>
          );
        })}
      </div>
    </Shot>
  );
}

const CHAIN_YEARS = [[2009, '远方'], [2011, '翅膀'], [2015, '完整的自己'], [2021, '明灯'], [2023, '细细的根']];

function Breadcrumb({ year, accent, T, start, end }) {
  const fade = clamp((T - start) / 0.6, 0, 1) * clamp((end - T) / 0.8, 0, 1);
  if (fade <= 0.01) return null;
  return (
    <div style={{ position: 'absolute', left: 300, top: 1560, width: 580, opacity: fade }}>
      <div style={{ height: 2, background: INK, opacity: 0.18, marginBottom: 20 }} />
      <div style={{ display: 'flex', gap: 26, alignItems: 'baseline', flexWrap: 'wrap' }}>
        {CHAIN_YEARS.map(([y, w]) => {
          const seen = year >= y - 0.05;
          const now = year >= y - 0.05 && !CHAIN_YEARS.some(([y2]) => y2 > y && year >= y2 - 0.05);
          return (
            <div key={w} style={{
              fontFamily: 'Archivo, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif', fontSize: 26,
              fontWeight: now ? 800 : 600, color: now ? accent : INK,
              opacity: seen ? (now ? 1 : 0.3) : 0.12,
            }}>{w}</div>
          );
        })}
      </div>
    </div>
  );
}

function Soundtrack({ T, total }) {
  const src = window.OM_MUSIC_SRC;
  const ref = React.useRef(null);
  React.useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (Math.abs(v.currentTime - T) > 0.3) { try { v.currentTime = Math.min(T, Math.max(0, (v.duration || total) - 0.05)); } catch (e) {} }
  }, [T, total]);
  if (!src) return null;
  return (
    <video ref={ref} src={src} playsInline
      data-om-exportable-video-play-start="0"
      data-om-exportable-video-play-end={total}
      style={{ position: 'absolute', width: 2, height: 2, opacity: 0.01, pointerEvents: 'none', left: 0, bottom: 0 }} />
  );
}

function Piece() {
  const { T, CUES, authoredTotal } = useComposition();
  const [tw, setTweak] = useTweaks(window.TWEAK_DEFAULTS || {});
  const accent = tw.accent || '#b0455e';
  const wins = windows(CUES, authoredTotal);
  const flowYear = currentYear(T, wins, CUES, 'flow');
  const year = markerYear(T, quoteBeats(wins));
  const p = clamp((flowYear - 2009) / 17, 0, 1);
  const camera = 1 + 0.012 * Math.sin(T * 0.19);
  const seam = Math.min(clamp((authoredTotal - T) / 1.2, 0, 1), clamp(T / 1.2, 0, 1));

  return (
    <div data-screen-label={`t=${T.toFixed(0)}s · ${Math.round(year)}`} style={{
      position: 'absolute', inset: 0, background: BG, overflow: 'hidden',
      fontFamily: 'Archivo, sans-serif', color: INK,
    }}>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${camera})`, transformOrigin: '55% 45%' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: seam }}>
          <Texture p={p} on={tw.texture !== false} />
          <Spine T={T} year={flowYear} accent={accent} />
          <YearAxis T={T} year={year} accent={accent} />
        </div>
        <Opening T={T} accent={accent} />
        {wins.slice(0, -1).map((c) => <Chapter key={c.name} c={c} T={T} accent={accent} />)}
        <Ending T={T} start={CUES.RootGrows} accent={accent} total={authoredTotal} />
      </div>
      <Soundtrack T={T} total={authoredTotal} />
      <Breadcrumb year={year} accent={accent} T={T} start={CUES.Distance + 0.3} end={CUES.RootGrows} />
      <TweaksPanel>
        <TweakSection label="Motion" />
        <TweakToggle label="Motion editor" value={tw.motionEditor} onChange={(v) => setTweak('motionEditor', v)} />
        <TweakToggle label="背景纹理" value={tw.texture} onChange={(v) => setTweak('texture', v)} />
        <TweakSection label="Color" />
        <TweakColor label="强调色" value={accent} options={['#b0455e', '#8c3f52', '#2a1c20']} onChange={(v) => setTweak('accent', v)} />
      </TweaksPanel>
    </div>
  );
}

function ChronicleVideo() {
  return (
    <CompositionStage width={W} height={H} bg={BG} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK}>
      <Piece />
    </CompositionStage>
  );
}

window.ChronicleVideo = ChronicleVideo;
