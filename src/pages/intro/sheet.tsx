import type { CSSProperties, ReactNode } from 'react'

/*
 * برگه‌ی نمونه‌ای که همه‌ی صحنه‌ها نشانش می‌دهند: رزومه‌ی «حمید شیخی» (همان رزومه‌ی نمونه‌ی برگ)
 * در پنج ظاهر از قالب‌های واقعی برگ. همه‌چیز با cqw اندازه گرفته شده تا برگه در هر پهنایی یکسان خوانده شود.
 * صحنه‌ها با متغیرهای ارثیِ CSS هدایتش می‌کنند:
 *   --chk        پیشرفت جاروب صحنه‌ی زبان؛ کنار هر تیتر که رد شد، نام انگلیسی‌اش پیدا می‌شود.
 *   --dw         هشدار ارقام در صحنه‌ی زبان؛ تاریخ اولین کار را نشان می‌کند.
 *   --kwa..--kwd نخ‌های صحنه‌ی چیدمان؛ هر بخش را که نخش رسید پررنگ و تیترش را برجسته می‌کند.
 */

const F = {
  vazir: "'Vazirmatn Variable', sans-serif",
  markazi: "'Markazi Text Variable', serif",
  naskh: "'Noto Naskh Arabic Variable', serif",
  sans: "'Noto Sans Arabic Variable', sans-serif",
  amiri: "'Amiri', serif",
}

export interface SheetLook {
  /** نام قالبِ هم‌خانواده در برگ */
  name: string
  accent: string
  root: CSSProperties
  header: CSSProperties
  align: 'flex-start' | 'center'
  title: CSSProperties
  subtitleColor: string
  heading: CSSProperties
  columns: string
  main: CSSProperties
  side: CSSProperties
}

export const looks: SheetLook[] = [
  {
    name: 'کلاسیک',
    accent: '#0e6245',
    root: { fontFamily: F.vazir, fontSize: '1.8cqw' },
    header: { marginInline: '8cqw', padding: '7.5cqw 0 3.4cqw', borderBottom: '0.25cqw solid var(--accent-ink)' },
    align: 'flex-start',
    title: { fontFamily: F.markazi, fontSize: '7.8cqw', fontWeight: 600 },
    subtitleColor: 'var(--accent-ink)',
    heading: { fontFamily: F.vazir, fontSize: '1.95cqw', fontWeight: 800 },
    columns: 'minmax(0,1fr)',
    main: { padding: '4cqw 8cqw 2.6cqw' },
    side: { order: 2, padding: '0 8cqw 6cqw', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)' },
  },
  {
    name: 'ستونی',
    accent: '#0f5b66',
    root: { fontFamily: F.vazir, fontSize: '1.75cqw' },
    header: { padding: '7.5cqw 7cqw 5cqw', background: '#edf3f4' },
    align: 'flex-start',
    title: { fontFamily: F.vazir, fontSize: '6.4cqw', fontWeight: 800 },
    subtitleColor: 'var(--accent-ink)',
    heading: {
      fontFamily: F.vazir,
      fontSize: '2.15cqw',
      fontWeight: 700,
      borderBottom: '0.2cqw solid color-mix(in srgb, var(--accent-ink) 25%, transparent)',
      paddingBottom: '0.5cqw',
    },
    columns: 'minmax(0,34fr) minmax(0,66fr)',
    main: { paddingBlock: '4.4cqw 4cqw', paddingInline: '5cqw 7cqw' },
    side: {
      order: 0,
      paddingBlock: '2cqw 6cqw',
      paddingInline: '7cqw 4.5cqw',
      background: '#edf3f4',
      gridTemplateColumns: 'minmax(0,1fr)',
    },
  },
  {
    name: 'مدرن',
    accent: '#a12a2a',
    root: { fontFamily: F.vazir, fontSize: '1.75cqw' },
    header: { padding: '7cqw 8cqw 5.5cqw', background: '#a12a2a', color: '#fff', textAlign: 'center' },
    align: 'center',
    title: { fontFamily: F.amiri, fontSize: '8cqw', fontWeight: 700 },
    subtitleColor: '#f7ddd6',
    heading: { fontFamily: F.amiri, fontSize: '3cqw', fontWeight: 700 },
    columns: 'minmax(0,66fr) minmax(0,34fr)',
    main: { paddingBlock: '4.6cqw 4cqw', paddingInline: '7cqw 4cqw' },
    side: {
      order: 2,
      paddingBlock: '4.6cqw 6cqw',
      paddingInline: '4cqw 6cqw',
      borderInlineStart: '0.15cqw solid #ece9e2',
      gridTemplateColumns: 'minmax(0,1fr)',
    },
  },
  {
    name: 'مینیمال',
    accent: '#26282c',
    root: { fontFamily: F.sans, fontSize: '1.65cqw' },
    header: { marginInline: '8cqw', padding: '8cqw 0 4cqw', borderBottom: '0.2cqw dashed #3b3b3b' },
    align: 'flex-start',
    title: { fontFamily: F.sans, fontSize: '5.6cqw', fontWeight: 300 },
    subtitleColor: '#686868',
    heading: { fontFamily: F.sans, fontSize: '1.75cqw', fontWeight: 700 },
    columns: 'minmax(0,1fr)',
    main: { padding: '4.4cqw 8cqw 3cqw' },
    side: { order: 2, padding: '0 8cqw 6cqw', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)' },
  },
  {
    name: 'مدیریتی',
    accent: '#7b1e2b',
    root: { fontFamily: F.naskh, fontSize: '1.85cqw' },
    header: { marginInline: '7cqw', padding: '6.5cqw 0 3cqw', borderBottom: '0.6cqw solid #1f1f1f' },
    align: 'flex-start',
    title: { fontFamily: F.vazir, fontSize: '10cqw', fontWeight: 900, lineHeight: 1.05 },
    subtitleColor: 'var(--accent-ink)',
    heading: { fontFamily: F.vazir, fontSize: '2.4cqw', fontWeight: 900 },
    columns: 'minmax(0,63fr) minmax(0,37fr)',
    main: { paddingBlock: '4.2cqw 4cqw', paddingInline: '7cqw 3.5cqw' },
    side: { order: 2, paddingBlock: '4.2cqw 6cqw', paddingInline: '2cqw 7cqw', gridTemplateColumns: 'minmax(0,1fr)' },
  },
]

export const sheetCopy = {
  fa: {
    name: 'حمید شیخی',
    title: 'مهندس ارشد فرانت‌اند',
    place: 'تهران',
    headings: ['درباره‌ی من', 'سوابق کاری', 'تحصیلات', 'مهارت‌ها', 'زبان‌ها'],
    profile: 'مهندس فرانت‌اند با هشت سال تجربه در ساخت محصولات وب پرترافیک و یک سامانه‌ی طراحی مشترک برای چهار تیم محصول.',
    jobs: [
      {
        title: 'سرپرست فنی فرانت‌اند',
        date: '۱۴۰۱ – اکنون',
        org: 'شرکت فناوری آوند · تهران',
        bullets: ['ساخت سامانه‌ی طراحی مشترک با ۴۸ کامپوننت برای چهار تیم محصول.', 'کاهش زمان بارگذاری صفحه‌ی اصلی از ۴٫۲ به ۱٫۸ ثانیه.'],
      },
      {
        title: 'توسعه‌دهنده‌ی فرانت‌اند',
        date: '۱۳۹۸ – ۱۴۰۱',
        org: 'رایان‌سپهر · تهران',
        bullets: ['داشبورد تحلیلی زنده برای بیش از ۱۲ هزار کاربر سازمانی.'],
      },
    ],
    education: { title: 'کارشناسی ارشد مهندسی نرم‌افزار', date: '۱۳۹۵ – ۱۳۹۷', org: 'دانشگاه صنعتی اصفهان' },
    skills: ['React و TypeScript', 'Next.js', 'Tailwind CSS', 'دسترس‌پذیری', 'رابط راست‌به‌چپ'],
    languages: ['فارسی (زبان مادری)', 'انگلیسی (C1)', 'آلمانی (A2)'],
  },
  en: {
    name: 'Hamid Shaikhy',
    title: 'Senior Front-End Engineer',
    place: 'Tehran',
    headings: ['About', 'Experience', 'Education', 'Skills', 'Languages'],
    profile: 'Front-end engineer with eight years of experience building high-traffic web products and a shared design system for four product teams.',
    jobs: [
      {
        title: 'Front-End Tech Lead',
        date: '2022 – Present',
        org: 'Avand Technologies · Tehran',
        bullets: ['Built a shared design system of 48 components for four product teams.', 'Cut home page load time from 4.2 s to 1.8 s.'],
      },
      {
        title: 'Front-End Developer',
        date: '2019 – 2022',
        org: 'Rayan Sepehr · Tehran',
        bullets: ['Live analytics dashboard for 12,000+ business users.'],
      },
    ],
    education: { title: 'MSc, Software Engineering', date: '2016 – 2018', org: 'Isfahan University of Technology' },
    skills: ['React and TypeScript', 'Next.js', 'Tailwind CSS', 'Accessibility', 'RTL interfaces'],
    languages: ['Persian (native)', 'English (C1)', 'German (A2)'],
  },
} as const

type Lang = keyof typeof sheetCopy
type KeywordId = 'a' | 'b' | 'c' | 'd'

interface HeadingProps {
  look: SheetLook
  children: ReactNode
  /** نام انگلیسی که در جاروب صحنه‌ی زبان کنار تیتر پیدا می‌شود. */
  en?: string
  /** کجای جاروب پیدا شود. */
  tick: number
  keyword?: KeywordId
}

function Heading({ look, children, en, tick, keyword }: HeadingProps) {
  return (
    <h3 className="mb-[1cqw] flex items-center justify-between gap-[1cqw] leading-[1.45] text-(--accent-ink)" style={look.heading}>
      <span
        data-keyword={keyword}
        className={keyword && 'sheet-keyword'}
        style={keyword ? ({ '--k': `var(--kw${keyword}, 0)` } as CSSProperties) : undefined}
      >
        {children}
      </span>
      {en && (
        <span
          dir="ltr"
          lang="en"
          className="rounded-[.5cqw] bg-[oklch(0.94_0.035_150)] px-[.8cqw] font-l-mono text-[1.45cqw] leading-[1.5] font-semibold text-[oklch(0.42_0.1_150)]"
          style={{ opacity: `clamp(0, calc((var(--chk, 0) - ${tick}) * 12), 1)` }}
        >
          {en}
        </span>
      )}
    </h3>
  )
}

function Section({ keyword, children }: { keyword?: KeywordId; children: ReactNode }) {
  return (
    <section className="sheet-section" style={keyword ? ({ '--k-on': `var(--kw${keyword}, 1)` } as CSSProperties) : undefined}>
      {children}
    </section>
  )
}

function Row({ title, date, warn }: { title: string; date: string; warn?: boolean }) {
  return (
    <div className="flex justify-between gap-[2cqw]">
      <b className="font-semibold">{title}</b>
      {warn ? (
        <span className="grid justify-items-end whitespace-nowrap">
          <span className="col-start-1 row-start-1" style={{ opacity: 'calc(.7 * (1 - var(--dw, 0)))' }}>
            {date}
          </span>
          <span
            className="col-start-1 row-start-1 -mx-[.5cqw] rounded-[.4cqw] bg-[oklch(0.92_0.09_85)] px-[.5cqw] text-[oklch(0.4_0.09_70)] shadow-[0_0_0_.3cqw_oklch(0.75_0.13_80)]"
            style={{ opacity: 'var(--dw, 0)' }}
          >
            {date}
          </span>
        </span>
      ) : (
        <span className="whitespace-nowrap opacity-70">{date}</span>
      )}
    </div>
  )
}

interface SheetProps {
  look?: SheetLook
  lang?: Lang
  /** نام‌های انگلیسی کنار تیترها، فقط برای صحنه‌ی زبان. */
  translations?: boolean
}

/** رزومه‌ی نمونه‌ی حمید شیخی، به‌شکل یک برگه. تزئینی است؛ متن خود صحنه‌ها می‌گوید چه نشان می‌دهد. */
export function Sheet({ look = looks[0], lang = 'fa', translations = false }: SheetProps) {
  const c = sheetCopy[lang]
  const en = translations ? sheetCopy.en.headings : undefined
  const [job1, job2] = c.jobs

  return (
    <div aria-hidden="true" dir={lang === 'fa' ? 'rtl' : 'ltr'} lang={lang} className="paper-sheet">
      <div
        className="absolute inset-0 flex flex-col leading-[1.7] text-(--sheet-ink)"
        style={{ ...look.root, '--accent-ink': look.accent } as CSSProperties}
      >
        <header className="flex flex-col gap-[.5cqw] text-[oklch(0.22_0.01_95)]" style={{ alignItems: look.align, ...look.header }}>
          <span className="leading-[1.2]" style={look.title}>
            {c.name}
          </span>
          <span className="text-[2.25cqw] font-medium" style={{ color: look.subtitleColor }}>
            {c.title}
          </span>
          <span className="flex flex-wrap gap-x-[3cqw] gap-y-[.4cqw] text-[1.5cqw] opacity-78" style={{ justifyContent: look.align }}>
            <span dir="ltr">hamid.shaikhy@example.com</span>
            <span>{c.place}</span>
            <span dir="ltr">hamid.example</span>
          </span>
        </header>

        <div className="grid min-h-0 flex-1" style={{ gridTemplateColumns: look.columns }}>
          <div className="order-1 flex min-w-0 flex-col gap-[2.8cqw]" style={look.main}>
            <Section>
              <Heading look={look} tick={0.1} en={en?.[0]}>
                {c.headings[0]}
              </Heading>
              <p>{c.profile}</p>
            </Section>

            <Section keyword="a">
              <Heading look={look} tick={0.28} en={en?.[1]} keyword="a">
                {c.headings[1]}
              </Heading>
              <div className="flex flex-col gap-[1.6cqw]">
                <div>
                  <Row title={job1.title} date={job1.date} warn />
                  <div className="opacity-78">{job1.org}</div>
                  <ul className="mt-[.5cqw] flex list-disc flex-col gap-[.3cqw] ps-[2.2cqw]">
                    {job1.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <Row title={job2.title} date={job2.date} />
                  <div className="opacity-78">{job2.org}</div>
                  <ul className="mt-[.5cqw] list-disc ps-[2.2cqw]">
                    {job2.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Section>

            <Section keyword="b">
              <Heading look={look} tick={0.5} en={en?.[2]} keyword="b">
                {c.headings[2]}
              </Heading>
              <Row title={c.education.title} date={c.education.date} />
              <div className="opacity-78">{c.education.org}</div>
            </Section>
          </div>

          <div className="grid min-w-0 content-start gap-[2.8cqw]" style={look.side}>
            <Section keyword="c">
              <Heading look={look} tick={0.66} en={en?.[3]} keyword="c">
                {c.headings[3]}
              </Heading>
              <div className="flex flex-col gap-[.2cqw]">
                {c.skills.map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </div>
            </Section>
            <Section keyword="d">
              <Heading look={look} tick={0.8} en={en?.[4]} keyword="d">
                {c.headings[4]}
              </Heading>
              <div className="flex flex-col gap-[.2cqw]">
                {c.languages.map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </div>
            </Section>
          </div>
        </div>
      </div>
    </div>
  )
}
