// Nine styleframes for the receptionist reel's storyboard (one per frame of "RecFrames"), and the sheet
// ("RecSheet") with time, beat and voice line under each. Static on purpose: the owner approves the look
// and the copy before anything is animated. Beats: wat-framework/.tmp/remake-receptionist/plan.md.
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import {
  ASSIST, Beam, C, CallLog, Caption, Core, Glass, Ground, Headline, HudTitle, Icon, Incoming, KARANTINA, MONO, Node, Num, Phone, Sample,
} from './parts';

// 1 -- 0:00-0:04 the hook: the phone's call log, four coral missed calls, and the question.
const F1: React.FC = () => (
  <Ground tint={C.coral} focusY={1050} seed={11}>
    <Headline lines={['מי התקשר?', 'מה הוא רצה?']} top={250} size={196} glow={C.coral} />
    <div style={{ position: 'absolute', left: 56, top: 930, textAlign: 'center' }}>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 104, lineHeight: 1, color: C.coral(), textShadow: `0 0 34px ${C.coral(0.6)}` }}>04</div>
      <div dir="rtl" style={{ fontFamily: ASSIST, fontWeight: 700, fontSize: 28, color: C.fg2(), marginTop: 8 }}>לא נענו</div>
    </div>
    <Phone cx={612} top={660} w={560} glow={C.coral}>
      <CallLog />
    </Phone>
  </Ground>
);

// 2 -- 0:04-0:08 a new call: 20 seconds with no answer, and the call goes up into her green wave.
const F2: React.FC = () => (
  <Ground tint={C.green} focusY={700} seed={12}>
    <Core cx={540} cy={360} R={104} />
    <Beam from={[540, 668]} to={[540, 448]} width={5} dot={0.42} />
    <Phone cx={540} top={650} w={330} tilt="perspective(2600px) rotateX(6deg)" glow={C.green}>
      <Incoming />
    </Phone>
    <Caption text="אחרי עשרים שניות בלי מענה, השיחה עוברת אליה." />
  </Ground>
);

// 3 -- 0:08-0:13 node 01: she answers in Hebrew, only from what you wrote.
const F3: React.FC = () => (
  <Ground tint={C.green} focusY={900} seed={13}>
    <HudTitle idx="01" title="עונה בעברית" sub="רק ממה שכתבתם לה" color={C.green} />
    <Core cx={540} cy={905} R={148} />
    <Beam from={[640, 830]} to={[780, 742]} bend={-20} width={3} />
    <Beam from={[430, 920]} to={[372, 960]} width={3} />
    <Beam from={[600, 1020]} to={[720, 1118]} bend={18} width={3} />
    <Glass x={620} y={600} w={400} pad={24}>
      <div style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 26, color: C.green() }}>שעות פעילות</div>
      <div style={{ fontSize: 40, color: C.fg(), marginTop: 4 }}><Num style={{ fontWeight: 700 }}>08:00–17:00</Num></div>
      <div style={{ fontFamily: ASSIST, fontWeight: 600, fontSize: 23, color: C.fg2() }}>ראשון עד חמישי</div>
    </Glass>
    <Glass x={54} y={890} w={330} pad={24}>
      <div style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 26, color: C.green() }}>שירותים</div>
      {['טיפול שנתי', 'בדיקה לפני טסט', 'דיאגנוסטיקה'].map((s) => (
        <div key={s} style={{ fontFamily: ASSIST, fontWeight: 700, fontSize: 25, color: C.fg(), marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 9, height: 9, borderRadius: 2, background: C.green(), boxShadow: `0 0 10px ${C.green()}` }} />
          {s}
        </div>
      ))}
    </Glass>
    <Glass x={500} y={1100} w={526} pad={24}>
      <div style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 26, color: C.green() }}>שאלות נפוצות</div>
      <div style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 29, color: C.fg(), marginTop: 6 }}>עובדים בתיאום מראש?</div>
      <div style={{ fontFamily: ASSIST, fontWeight: 600, fontSize: 24, color: C.fg2(), marginTop: 2 }}>כן. משאירים פרטים, ונחזור לקבוע.</div>
    </Glass>
    <Sample style={{ position: 'absolute', left: 60, top: 1300 }} />
    <Caption text="היא עונה בעברית, ורק ממה שכתבתם לה: שעות, שירותים, שאלות נפוצות." top={1430} />
  </Ground>
);

// 4 -- 0:13-0:18 node 02: who to call back, and the number read back digit by digit.
const DIGITS = '0501234567'.split('');
const F4: React.FC = () => (
  <Ground tint={C.green} focusY={900} seed={14}>
    <Core cx={150} cy={548} R={52} calm />
    <HudTitle idx="02" title="רושמת למי לחזור" sub="שם, מה צריך, מתי נוח" color={C.green} />
    <Beam from={[196, 560]} to={[902, 640]} bend={-40} width={3} dot={0.62} />
    <Glass x={90} y={640} w={900} pad={36}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: 70 }}>
        <span style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 30, color: C.green() }}>בקשה לחזור</span>
        <Sample />
      </div>
      {[
        ['שם', 'דנה שפירא'],
        ['מה צריך', 'נורת מנוע דולקת, רוצה לבוא לבדיקה'],
        ['מתי נוח', 'יום חמישי'],
      ].map(([k, v]) => (
        <div key={k} style={{ display: 'flex', gap: 24, alignItems: 'baseline', marginTop: 20, paddingTop: 16, borderTop: `1.5px solid ${C.fg(0.1)}` }}>
          <span style={{ width: 150, flex: 'none', fontFamily: ASSIST, fontWeight: 700, fontSize: 27, color: C.fg3() }}>{k}</span>
          <span style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 36, color: C.fg() }}>{v}</span>
        </div>
      ))}
    </Glass>
    <Node cx={952} cy={648} r={50} color={C.green} icon="note" />
    <div dir="rtl" style={{ position: 'absolute', left: 90, right: 90, top: 1132, fontFamily: ASSIST, fontWeight: 700, fontSize: 26, color: C.fg3(), textAlign: 'center' }}>מקריאה בחזרה</div>
    <div dir="ltr" style={{ position: 'absolute', left: 0, right: 0, top: 1180, display: 'flex', justifyContent: 'center', gap: 10 }}>
      {DIGITS.map((d, i) => {
        const lit = i < 7;
        return (
          <React.Fragment key={i}>
            {(i === 3 || i === 6) && <span style={{ width: 8 }} />}
            <span
              style={{
                width: 74, height: 102, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: MONO, fontWeight: 700, fontSize: 56,
                color: lit ? 'oklch(16% 0.04 150)' : C.fg(0.35),
                background: lit ? C.green() : C.fg(0.06), border: `1.5px solid ${lit ? C.green() : C.fg(0.16)}`,
                boxShadow: lit ? `0 0 ${i === 6 ? 40 : 18}px ${C.green(i === 6 ? 0.9 : 0.45)}` : undefined,
              }}
            >
              {d}
            </span>
          </React.Fragment>
        );
      })}
    </div>
    <Caption text="שואלת מה צריך ומתי נוח לחזור, ומקריאה את המספר ספרה אחר ספרה." top={1430} />
  </Ground>
);

// 5 -- 0:18-0:23 node 03: she books, only in a free slot and only after a clear yes.
const DAYS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳'];
const HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00'];
type Block = { d: number; h: number; len: number; kind: 'busy' | 'free' | 'booked' };
const BLOCKS: Block[] = [
  { d: 0, h: 0, len: 1.5, kind: 'busy' }, { d: 0, h: 2.5, len: 1, kind: 'busy' },
  { d: 1, h: 0, len: 1, kind: 'booked' }, { d: 1, h: 1, len: 1.5, kind: 'busy' }, { d: 1, h: 2.5, len: 1, kind: 'free' },
  { d: 2, h: 0.5, len: 2, kind: 'busy' }, { d: 2, h: 3, len: 1.5, kind: 'busy' },
  { d: 3, h: 0, len: 1, kind: 'busy' }, { d: 3, h: 1.5, len: 1, kind: 'busy' }, { d: 3, h: 3, len: 2, kind: 'busy' },
  { d: 4, h: 0, len: 2.5, kind: 'busy' }, { d: 4, h: 3.5, len: 1, kind: 'busy' },
];
const F5: React.FC = () => {
  const gx = 110; // grid left inside the card (time column is on the right)
  const gw = 690;
  const gy = 120;
  const rowH = 118;
  const colW = gw / 5;
  return (
    <Ground tint={C.green} focusY={950} seed={15}>
      <Core cx={150} cy={548} R={52} calm />
      <HudTitle idx="03" title="קובעת תור" sub="רק בשעה פנויה, רק אחרי כן" color={C.green} />
      <Beam from={[196, 560]} to={[918, 618]} bend={-40} width={3} dot={0.62} />
      <Glass x={60} y={620} w={960} h={760} pad={0}>
        <div style={{ position: 'absolute', right: 96, top: 26, fontFamily: ASSIST, fontWeight: 800, fontSize: 30, color: C.fg() }}>היומן של השבוע</div>
        <Sample style={{ position: 'absolute', left: 30, top: 28 }} />
        {DAYS.map((d, i) => (
          <div key={d} style={{ position: 'absolute', left: gx + gw - (i + 1) * colW, width: colW, top: 78, textAlign: 'center', fontFamily: ASSIST, fontWeight: 800, fontSize: 28, color: i === 1 ? C.green() : C.fg2() }}>
            {d}
            {i === 1 && <span style={{ fontSize: 20, fontWeight: 700 }}> · מחר</span>}
          </div>
        ))}
        {HOURS.map((h, i) => (
          <React.Fragment key={h}>
            <div style={{ position: 'absolute', left: gx + gw + 18, top: gy + i * rowH - 12, fontSize: 22, color: C.fg3() }}><Num style={{ fontWeight: 500 }}>{h}</Num></div>
            <div style={{ position: 'absolute', left: gx, width: gw, top: gy + i * rowH, height: 1.5, background: C.fg(0.09) }} />
          </React.Fragment>
        ))}
        {BLOCKS.map((b, i) => {
          const left = gx + gw - (b.d + 1) * colW + 6;
          const top = gy + b.h * rowH + 4;
          const height = b.len * rowH - 8;
          const base: React.CSSProperties = { position: 'absolute', left, top, width: colW - 12, height, borderRadius: 12, boxSizing: 'border-box', padding: 10 };
          if (b.kind === 'busy')
            return <div key={i} style={{ ...base, background: `repeating-linear-gradient(135deg, ${C.fg(0.07)} 0 10px, ${C.fg(0.035)} 10px 20px)`, border: `1px solid ${C.fg(0.1)}` }} />;
          if (b.kind === 'free')
            return (
              <div key={i} dir="rtl" style={{ ...base, border: `2.5px dashed ${C.green(0.9)}`, background: C.green(0.08), boxShadow: `0 0 24px ${C.green(0.25)}` }}>
                <div style={{ fontSize: 22, color: C.green() }}><Num style={{ fontWeight: 700 }}>10:30</Num></div>
                <div style={{ fontFamily: ASSIST, fontWeight: 700, fontSize: 19, color: C.fg2() }}>פנוי</div>
              </div>
            );
          return (
            <div key={i} dir="rtl" style={{ ...base, width: colW - 12, background: C.green(), boxShadow: `0 0 44px ${C.green(0.7)}`, color: 'oklch(16% 0.04 150)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="check" size={24} color="oklch(16% 0.04 150)" width={3} />
                <Num style={{ fontWeight: 700, fontSize: 22 }}>08:00</Num>
              </div>
              <div style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 19, marginTop: 2 }}>המענה קבע</div>
            </div>
          );
        })}
        <div dir="rtl" style={{ position: 'absolute', left: gx + gw - 2 * colW - 150, top: gy + 20, width: 170, padding: '8px 12px', borderRadius: 10, background: C.bg(0.92), border: `1.5px solid ${C.green(0.7)}`, fontFamily: ASSIST, fontWeight: 700, fontSize: 19, color: C.fg(), lineHeight: 1.25 }}>
          רוני כהן · בדיקה לפני טסט
        </div>
      </Glass>
      <Node cx={968} cy={624} r={50} color={C.green} icon="cal" />
      <Caption text="ובחבילת היומן היא גם קובעת תור, רק בשעה פנויה ורק אחרי כן ברור." top={1430} />
    </Ground>
  );
};

// 6 -- 0:23-0:28 node 04 (amber): what she won't say.
const RULES: { icon: 'shekel' | 'chip' | 'siren'; text: string; sub: string }[] = [
  { icon: 'shekel', text: 'לא מבטיחה מחיר בשמכם', sub: 'את המחיר אתם נותנים' },
  { icon: 'chip', text: 'אומרת שהיא ממוחשבת', sub: 'כשמישהו שואל' },
  { icon: 'siren', text: 'במקרה חירום: 101 או 100', sub: 'מפנה מיד' },
];
const F6: React.FC = () => (
  <Ground tint={C.amber} focusY={950} seed={16}>
    <Core cx={150} cy={548} R={52} calm />
    <HudTitle idx="04" title="יודעת מה לא להגיד" sub="כללים קבועים בכל שיחה" color={C.amber} />
    <Beam from={[196, 560]} to={[934, 646]} bend={-40} width={3} color={C.amber} dot={0.62} />
    {RULES.map((r, i) => (
      <Glass key={r.text} x={84} y={650 + i * 232} w={912} h={196} color={C.amber} pad={0}>
        <div style={{ position: 'absolute', right: 36, top: 38, width: 118, height: 118, borderRadius: '50%', background: C.amber(0.14), border: `2px solid ${C.amber(0.8)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 30px ${C.amber(0.3)}` }}>
          {r.icon === 'shekel' ? (
            <span style={{ position: 'relative', fontFamily: ASSIST, fontWeight: 800, fontSize: 66, lineHeight: 1, color: C.amber() }}>
              ₪
              <span style={{ position: 'absolute', left: -12, right: -12, top: '50%', height: 5, borderRadius: 3, background: C.amber(), transform: 'rotate(-38deg)', boxShadow: `0 0 0 3px ${C.bg(0.9)}` }} />
            </span>
          ) : (
            <Icon name={r.icon} size={62} color={C.amber()} width={1.9} />
          )}
        </div>
        <div style={{ position: 'absolute', right: 186, left: 36, top: 44 }}>
          <div style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 44, color: C.fg(), lineHeight: 1.1 }}>{r.text}</div>
          <div style={{ fontFamily: ASSIST, fontWeight: 600, fontSize: 28, color: C.fg2(), marginTop: 8 }}>{r.sub}</div>
        </div>
      </Glass>
    ))}
    <Node cx={980} cy={652} r={46} color={C.amber} icon="shield" />
    <Caption text="מחיר בשמכם היא לא מבטיחה, ואם שואלים, היא אומרת שהיא ממוחשבת." top={1430} />
  </Ground>
);

// 7 -- 0:28-0:33 back to the same call log: now each call has a name, a reason and a time.
const F7: React.FC = () => (
  <Ground tint={C.green} focusY={850} seed={17}>
    <Phone cx={540} top={300} w={510} glow={C.green} tilt="perspective(2600px) rotateY(-6deg) rotateX(3deg)">
      <CallLog rich />
    </Phone>
    <Caption text="עכשיו אתם רואים מי התקשר, מה הוא צריך ומתי לחזור אליו." top={1448} />
  </Ground>
);

// 8 -- 0:33-0:35 the payoff: the core with all four nodes lit.
const NODES: { a: number; label: string; icon: 'chat' | 'note' | 'cal' | 'shield'; tone: typeof C.green }[] = [
  { a: -38, label: 'עונה בעברית', icon: 'chat', tone: C.green },
  { a: -142, label: 'רושמת למי לחזור', icon: 'note', tone: C.green },
  { a: 38, label: 'קובעת תור', icon: 'cal', tone: C.green },
  { a: 142, label: 'יודעת מה לא להגיד', icon: 'shield', tone: C.amber },
];
const F8: React.FC = () => {
  const cx = 540;
  const cy = 990;
  const rad = 318;
  return (
    <Ground tint={C.green} focusY={990} seed={18}>
      <Headline lines={['אף שיחה לא נשארת', 'רק מספר.']} top={236} size={150} />
      {NODES.map((n) => {
        const a = (n.a * Math.PI) / 180;
        return <Beam key={n.label} from={[cx + 120 * Math.cos(a), cy + 120 * Math.sin(a)]} to={[cx + (rad - 52) * Math.cos(a), cy + (rad - 52) * Math.sin(a)]} color={n.tone} width={3.5} dot={0.55} />;
      })}
      <Core cx={cx} cy={cy} R={128} />
      {NODES.map((n) => {
        const a = (n.a * Math.PI) / 180;
        return <Node key={n.label} cx={cx + rad * Math.cos(a)} cy={cy + rad * Math.sin(a)} r={50} color={n.tone} icon={n.icon} label={n.label} labelSize={27} above={n.a < 0} />;
      })}
      <Caption text="הטלפון מצלצל אצלכם קודם." top={1460} />
    </Ground>
  );
};

// 9 -- 0:35-0:37 end card: the name for the first time, and the one action.
const F9: React.FC = () => (
  <Ground tint={C.green} focusY={700} seed={19}>
    <Core cx={540} cy={600} R={112} calm />
    <div dir="rtl" style={{ position: 'absolute', left: 40, right: 40, top: 860, textAlign: 'center' }}>
      <div style={{ fontFamily: KARANTINA, fontWeight: 700, fontSize: 236, lineHeight: 0.9, color: C.fg(), textShadow: `0 0 60px ${C.green(0.35)}` }}>מזכירה קולית</div>
      <div style={{ fontFamily: ASSIST, fontWeight: 600, fontSize: 38, color: C.fg2(), marginTop: 18 }}>מענה טלפוני ב-AI, בעברית, לעסקים קטנים</div>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, marginTop: 64, padding: '24px 46px', borderRadius: 99, background: C.green(), boxShadow: `0 0 60px ${C.green(0.5)}, inset 0 2px 0 rgba(255,255,255,.45)`, fontFamily: ASSIST, fontWeight: 800, fontSize: 44, color: 'oklch(16% 0.04 150)' }}>
        <Icon name="chat" size={44} color="oklch(16% 0.04 150)" width={2.4} />
        לכתוב לנו בוואטסאפ
      </div>
      <div style={{ fontFamily: ASSIST, fontWeight: 700, fontSize: 36, color: C.fg(), marginTop: 70 }}>כשאתם לא יכולים, היא עונה.</div>
    </div>
  </Ground>
);

export const REC_FRAMES = [F1, F2, F3, F4, F5, F6, F7, F8, F9];
export const RecFrames: React.FC = () => {
  const f = useCurrentFrame();
  const F = REC_FRAMES[Math.min(REC_FRAMES.length - 1, f)];
  return <F />;
};

// ---------------------------------------------------------------------------------------------
// All nine on one sheet: time, beat and the spoken line under each.
const LABELS: [string, string, string][] = [
  ['0:00–0:04', 'פתיחה: יומן שיחות שלא נענו', 'כשאתם באמצע עבודה, מי יודע מה פספסתם?'],
  ['0:04–0:08', 'שיחה חדשה: 20 שניות, ואז אליה', 'אחרי עשרים שניות בלי מענה, השיחה עוברת אליה.'],
  ['0:08–0:13', '01 · עונה בעברית', 'היא עונה בעברית, ורק ממה שכתבתם לה: שעות, שירותים, שאלות נפוצות.'],
  ['0:13–0:18', '02 · רושמת למי לחזור', 'שואלת מה צריך ומתי נוח לחזור, ומקריאה את המספר ספרה אחר ספרה.'],
  ['0:18–0:23', '03 · קובעת תור', 'ובחבילת היומן היא גם קובעת תור, רק בשעה פנויה ורק אחרי כן ברור.'],
  ['0:23–0:28', '04 · יודעת מה לא להגיד', 'מחיר בשמכם היא לא מבטיחה, ואם שואלים, היא אומרת שהיא ממוחשבת.'],
  ['0:28–0:33', 'חזרה ליומן השיחות', 'עכשיו אתם רואים מי התקשר, מה הוא צריך ומתי לחזור אליו.'],
  ['0:33–0:35', 'הכול דולק', 'הטלפון מצלצל אצלכם קודם.'],
  ['0:35–0:37', 'כרטיס סיום', 'כשאתם לא יכולים, היא עונה.'],
];
const K = 0.4;
const CELL = { w: 1080 * K, h: 1920 * K };
export const REC_SHEET = { w: 44 * 2 + CELL.w * 3 + 36 * 2, h: 2930 };
export const RecSheet: React.FC = () => (
  <AbsoluteFill style={{ background: 'oklch(17% 0.02 172)', padding: 44 }}>
    <div dir="rtl" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', color: C.fg(), marginBottom: 30 }}>
      <div style={{ fontFamily: ASSIST, fontWeight: 800, fontSize: 40 }}>מזכירה קולית · סטוריבורד לאישור</div>
      <div style={{ fontFamily: ASSIST, fontWeight: 600, fontSize: 24, color: C.fg3() }}>9:16 · 37 שניות · קריינות AI בעברית + מוזיקה + כתוביות</div>
    </div>
    <div dir="rtl" style={{ display: 'grid', gridTemplateColumns: `repeat(3, ${CELL.w}px)`, columnGap: 36, rowGap: 34 }}>
      {REC_FRAMES.map((F, i) => (
        <div key={i}>
          <div style={{ position: 'relative', width: CELL.w, height: CELL.h, overflow: 'hidden', borderRadius: 14, boxShadow: `0 0 0 1px ${C.fg(0.1)}` }}>
            <div dir="ltr" style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${K})`, transformOrigin: '0 0' }}>
              <F />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'baseline', marginTop: 14, fontFamily: ASSIST, color: C.fg() }}>
            <span style={{ fontWeight: 800, fontSize: 30, color: C.green() }}>{i + 1}</span>
            <span dir="ltr" style={{ fontFamily: MONO, fontWeight: 500, fontSize: 20, color: C.fg3(), whiteSpace: 'nowrap' }}>{LABELS[i][0]}</span>
            <span style={{ fontWeight: 700, fontSize: 25 }}>{LABELS[i][1]}</span>
          </div>
          <div dir="rtl" style={{ fontFamily: ASSIST, fontWeight: 600, fontSize: 22, lineHeight: 1.35, color: C.fg2(), marginTop: 6 }}>״{LABELS[i][2]}״</div>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);
