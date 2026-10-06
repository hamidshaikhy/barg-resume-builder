import { memo, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { ArrowDown, FileText, FileType } from 'lucide-react'
import { cx, toFaDigits } from '@/lib/text'
import { ResumePages } from '@/resume/ResumePages'
import { sampleResume } from '@/resume/sample'
import { sectionDefs, sectionOrder } from '@/resume/sections'
import { colors, getTemplate } from '@/resume/templates'
import type { Resume, TemplateId } from '@/resume/types'

/*
 * صحنه‌ی اسکرولی صفحه‌ی نخست.
 * یک برگه‌ی A4 از اول تا آخر روی صحنه می‌ماند و با اسکرول چهار کار رویش انجام می‌شود:
 * نوشته می‌شود، به ده قالب باز می‌شود (مثل دستِ ورق)، رنگ عوض می‌کند و در آخر به دو فایل
 * PDF و Word تبدیل می‌شود. برگه‌ها همان کامپوننت واقعی رزومه‌اند، نه تصویر.
 */

/** ترتیب قالب‌ها در بادبزن؛ آخری همانی است که در فصل رنگ روی صحنه می‌ماند. */
const FAN: TemplateId[] = ['classic', 'sidebar', 'minimal', 'academic', 'framed', 'timeline', 'split', 'modern', 'executive', 'band']
const LAST = FAN.length - 1
const COLOR_TEMPLATE = getTemplate(FAN[LAST])

/** مرز فصل‌ها روی محور پیشرفت اسکرول (۰ تا ۱). */
const T = {
  rise: [0.02, 0.13],
  write: [0.15, 0.31],
  fanIn: [0.35, 0.42],
  flip: [0.42, 0.56],
  fanOut: [0.56, 0.62],
  dark: [0.33, 0.37, 0.58, 0.62],
  color: [0.645, 0.79],
  split: [0.82, 0.9],
} as const

const CHAPTERS = [
  { id: 'write', name: 'نوشتن', at: 0.2, from: 0.13, to: 0.33 },
  { id: 'template', name: 'قالب', at: 0.46, from: 0.33, to: 0.62 },
  { id: 'color', name: 'رنگ', at: 0.7, from: 0.62, to: 0.8 },
  { id: 'export', name: 'خروجی', at: 0.93, from: 0.8, to: 1.01 },
] as const

const seg = (v: number, a: number, b: number) => Math.min(1, Math.max(0, (v - a) / (b - a)))
const ease = (t: number) => t * t * (3 - 2 * t)

const SECTION_NAMES = ['اطلاعات شخصی', 'شبکه‌ها و پیوندها', ...sectionOrder.filter((k) => k !== 'custom').map((k) => sectionDefs[k].name)]

interface Geometry {
  compact: boolean
  cardH: number
  cardW: number
  scale: number
  /** فاصله‌ی مرکز دسته‌ی برگه‌ها از مرکز صحنه */
  deckX: number
  deckY: number
  angle: number
  lift: number
  split: number
}

function useGeometry(): Geometry {
  const [vp, setVp] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }))
  useEffect(() => {
    const onResize = () => setVp({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return useMemo(() => {
    const compact = vp.w < 900
    const cardH = compact ? Math.min(vp.h * 0.4, vp.w * 0.6 * 1.414) : Math.min(vp.h * 0.64, vp.w * 0.3 * 1.414)
    const cardW = (cardH * 210) / 297
    return {
      compact,
      cardH,
      cardW,
      scale: cardH / ((297 / 25.4) * 96),
      deckX: compact ? 0 : -vp.w * 0.21,
      deckY: compact ? vp.h * 0.2 : vp.h * 0.03,
      angle: compact ? 2.9 : 4.1,
      lift: cardH * 0.1,
      split: compact ? cardW * 0.56 : cardW * 0.58,
    }
  }, [vp])
}

/* ---------- برگه‌ها ---------- */

function Sheet({ resume, geom }: { resume: Resume; geom: Geometry }) {
  return (
    <div
      dir="ltr"
      style={{ position: 'absolute', top: 0, left: 0, width: '210mm', transform: `scale(${geom.scale})`, transformOrigin: '0 0', pointerEvents: 'none' }}
    >
      <ResumePages resume={resume} maxPages={1} />
    </div>
  )
}

/** خط‌های خاکستری برگه‌ی خالی، پیش از نوشته‌شدن. */
function Skeleton() {
  const lines = [38, 0, 86, 92, 64, 0, 30, 90, 84, 88, 52, 0, 34, 92, 78, 86, 0, 28, 88, 70]
  return (
    <div className="absolute inset-0 flex flex-col items-center gap-[2.1%] px-[9%] pt-[10%]">
      <div className="h-[3.2%] w-[34%] rounded-sm bg-[#dfe3ea]" />
      <div className="mb-[3%] h-[1.4%] w-[22%] rounded-sm bg-[#e8ebf0]" />
      {lines.map((w, i) =>
        w === 0 ? (
          <div key={i} className="h-[1.2%]" />
        ) : (
          <div key={i} className="h-[1.15%] self-end rounded-sm bg-[#e8ebf0]" style={{ width: `${w}%` }} />
        ),
      )}
    </div>
  )
}

const cardShell =
  'absolute left-1/2 top-1/2 rounded-[3px] bg-white shadow-[0_1px_2px_rgba(17,26,46,0.1),0_22px_44px_-22px_rgba(17,26,46,0.42)]'

const FanCard = memo(function FanCard({ index, p, geom, resume }: { index: number; p: MotionValue<number>; geom: Geometry; resume: Resume }) {
  const transform = useTransform(p, (v) => {
    const open = ease(seg(v, T.fanIn[0], T.fanIn[1])) * (1 - ease(seg(v, T.fanOut[0], T.fanOut[1])))
    const active = seg(v, T.flip[0], T.flip[1]) * LAST
    const lift = Math.max(0, 1 - Math.abs(active - index)) * open
    const rot = ((LAST / 2 - index) * geom.angle * open).toFixed(3)
    const x = index === LAST ? ease(seg(v, T.split[0], T.split[1])) * geom.split : 0
    return `translateX(${x.toFixed(1)}px) rotate(${rot}deg) translateY(${(-lift * geom.lift).toFixed(1)}px) scale(${(1 + lift * 0.05).toFixed(4)})`
  })
  const zIndex = useTransform(p, (v) => {
    const active = seg(v, T.flip[0], T.flip[1]) * LAST
    const near = Math.max(0, 1 - Math.abs(active - index))
    const fanning = v > T.fanIn[1] - 0.01 && v < T.fanOut[0] + 0.01
    return index + (fanning ? Math.round(near * 20) : 0)
  })
  // بیرون از فصل قالب‌ها فقط یک برگه دیده می‌شود: پیش از آن برگه‌ی اول و پس از آن برگه‌ی آخر.
  const opacity = useTransform(p, (v) => {
    if (index === 0) return v > T.fanOut[1] ? 0 : 1
    const appear = seg(v, T.fanIn[0] - 0.005, T.fanIn[0] + 0.02)
    return index === LAST ? appear : appear * (1 - seg(v, T.fanOut[1] - 0.012, T.fanOut[1]))
  })
  const wipe = useTransform(p, (v) => `inset(0 0 ${((1 - seg(v, T.write[0], T.write[1])) * 100).toFixed(2)}% 0)`)
  const caretTop = useTransform(p, (v) => `${(seg(v, T.write[0], T.write[1]) * 100).toFixed(2)}%`)
  const caretOpacity = useTransform(p, (v) => {
    const w = seg(v, T.write[0], T.write[1])
    return w > 0.005 && w < 0.995 ? 1 : 0
  })
  const labelOpacity = useTransform(p, (v) => ease(seg(v, T.split[0] + 0.03, T.split[1] + 0.02)))

  return (
    <motion.div
      className={cx(cardShell, index !== LAST && 'overflow-hidden')}
      style={{
        width: geom.cardW,
        height: geom.cardH,
        marginLeft: -geom.cardW / 2,
        marginTop: -geom.cardH / 2,
        transformOrigin: '50% 172%',
        transform,
        zIndex,
        opacity,
      }}
    >
      {index === 0 ? (
        <>
          <Skeleton />
          <motion.div className="absolute inset-0 bg-white" style={{ clipPath: wipe }}>
            <Sheet resume={resume} geom={geom} />
          </motion.div>
          <motion.div
            className="absolute inset-x-0 h-[2px] bg-[var(--accent)]"
            style={{ top: caretTop, opacity: caretOpacity, boxShadow: '0 0 0 3px color-mix(in srgb, var(--accent) 16%, transparent)' }}
          />
        </>
      ) : (
        <div className="absolute inset-0 overflow-hidden rounded-[3px]">
          <Sheet resume={resume} geom={geom} />
        </div>
      )}
      {index === LAST && <FileLabel opacity={labelOpacity} icon={<FileText />} name="resume.pdf" note="برای فرستادن" />}
    </motion.div>
  )
})

function FileLabel({ opacity, icon, name, note }: { opacity: MotionValue<number>; icon: ReactNode; name: string; note: string }) {
  return (
    <motion.div
      style={{ opacity }}
      className="absolute inset-x-0 top-full mt-5 flex items-center justify-center gap-2.5 text-[17px] whitespace-nowrap text-[var(--fg)]"
      dir="rtl"
    >
      <span className="text-[var(--accent)] [&>svg]:size-5">{icon}</span>
      <span className="font-semibold" dir="ltr">
        {name}
      </span>
      <span className="text-[var(--mut)]">{note}</span>
    </motion.div>
  )
}

/** نسخه‌ی دوم همان برگه که در فصل خروجی به سمت دیگر می‌رود و فایل Word می‌شود. */
function WordTwin({ p, geom, resume }: { p: MotionValue<number>; geom: Geometry; resume: Resume }) {
  const transform = useTransform(p, (v) => `translateX(${(-ease(seg(v, T.split[0], T.split[1])) * geom.split).toFixed(1)}px)`)
  const opacity = useTransform(p, (v) => seg(v, T.split[0] - 0.02, T.split[0]))
  const labelOpacity = useTransform(p, (v) => ease(seg(v, T.split[0] + 0.03, T.split[1] + 0.02)))
  return (
    <motion.div
      className={cardShell}
      style={{
        width: geom.cardW,
        height: geom.cardH,
        marginLeft: -geom.cardW / 2,
        marginTop: -geom.cardH / 2,
        transform,
        opacity,
        zIndex: LAST - 1,
      }}
    >
      <div className="absolute inset-0 overflow-hidden rounded-[3px]">
        <Sheet resume={resume} geom={geom} />
      </div>
      <FileLabel opacity={labelOpacity} icon={<FileType />} name="resume.docx" note="برای ویرایش" />
    </motion.div>
  )
}

/* ---------- نوشته‌های کنار صحنه ---------- */

function Caption({
  p,
  from,
  to,
  children,
  className,
}: {
  p: MotionValue<number>
  from: number
  to: number
  children: ReactNode
  className?: string
}) {
  const fade = 0.022
  const opacity = useTransform(p, (v) => (from <= 0 ? 1 : seg(v, from, from + fade)) * (to >= 1 ? 1 : 1 - seg(v, to - fade, to)))
  const y = useTransform(p, (v) => (from <= 0 ? 0 : (1 - ease(seg(v, from, from + fade))) * 26) - (to >= 1 ? 0 : ease(seg(v, to - fade, to)) * 26))
  const pointerEvents = useTransform(p, (v) => (v >= from - 0.001 && v <= to ? 'auto' : 'none'))
  const visibility = useTransform(p, (v) => (v >= from - 0.03 && v <= to + 0.03 ? 'visible' : 'hidden'))
  return (
    <motion.div className={cx('absolute', className)} style={{ opacity, y, pointerEvents, visibility }}>
      {children}
    </motion.div>
  )
}

const captionBox =
  'inset-x-5 top-[96px] md:inset-x-auto md:start-[6vw] md:top-1/2 md:w-[min(34vw,480px)] md:-translate-y-1/2'
const captionTitle = 'font-title text-[clamp(34px,4.6vw,68px)] leading-[1.22] font-bold text-[var(--fg)] text-balance'
const captionText = 'mt-3 max-w-[38ch] text-[15px] leading-8 text-[var(--mut)] md:mt-5 md:text-[17px] md:leading-9'

export function StartButton({ className, children = 'ساخت رزومه' }: { className?: string; children?: ReactNode }) {
  return (
    <Link
      to="/builder"
      className={cx(
        'inline-flex h-13 items-center justify-center rounded-full bg-ink px-8 text-base font-bold text-white transition-colors hover:bg-brand focus-visible:outline-offset-4',
        className,
      )}
    >
      {children}
    </Link>
  )
}

export function Stage() {
  const ref = useRef<HTMLElement>(null)
  const geom = useGeometry()
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const smooth = useSpring(scrollYProgress, { stiffness: 170, damping: 30, mass: 0.35 })
  const p = reduced ? scrollYProgress : smooth

  const [active, setActive] = useState(0)
  const [palette, setPalette] = useState(0)
  const [written, setWritten] = useState(0)
  const [chapter, setChapter] = useState(-1)

  useMotionValueEvent(p, 'change', (v) => {
    setActive(Math.round(seg(v, T.flip[0], T.flip[1]) * LAST))
    setPalette(Math.min(5, Math.floor(seg(v, T.color[0], T.color[1]) * 6)))
    setWritten(Math.round(seg(v, T.write[0], T.write[1]) * SECTION_NAMES.length))
    setChapter(CHAPTERS.findIndex((c) => v >= c.from && v < c.to))
  })

  const base = useMemo(() => sampleResume(), [])
  const fanResumes = useMemo<Resume[]>(
    () => FAN.map((id) => ({ ...base, settings: { ...base.settings, template: id, palette: 0, font: getTemplate(id).font } })),
    [base],
  )
  // فقط برگه‌ی آخر با عوض‌شدن رنگ دوباره ساخته می‌شود.
  const colorResume = useMemo<Resume>(
    () => ({ ...fanResumes[LAST], settings: { ...fanResumes[LAST].settings, palette } }),
    [fanResumes, palette],
  )

  const accent = colors[COLOR_TEMPLATE.palettes[palette]]
  const inColor = chapter >= 2

  // صحنه در فصل قالب‌ها تیره می‌شود تا برگه‌های سفید بهتر دیده شوند.
  const stops = [...T.dark]
  const background = useTransform(p, stops, ['#eceef2', '#101828', '#101828', '#eceef2'])
  const fg = useTransform(p, stops, ['#111a2e', '#f5f6f8', '#f5f6f8', '#111a2e'])
  const mut = useTransform(p, stops, ['#5a6377', '#a7b0c2', '#a7b0c2', '#5a6377'])
  const hair = useTransform(p, stops, ['#c9cfda', '#3a4560', '#3a4560', '#c9cfda'])

  // برگه در آغاز روی میز خوابیده و با اسکرول بلند می‌شود؛ در فصل خروجی کمی کوچک می‌شود تا دو فایل جا شوند.
  const flat = useTransform(p, (v) => 1 - ease(seg(v, T.rise[0], T.rise[1])))
  const rotateX = useTransform(flat, (f) => f * 58)
  const rotateZ = useTransform(flat, (f) => f * 24)
  const deckScale = useTransform(p, (v) => {
    const f = 1 - ease(seg(v, T.rise[0], T.rise[1]))
    const fan = ease(seg(v, T.fanIn[0], T.fanIn[1])) * (1 - ease(seg(v, T.fanOut[0], T.fanOut[1])))
    const split = ease(seg(v, T.split[0], T.split[1]))
    return 1 - f * 0.1 - fan * (geom.compact ? 0.2 : 0.24) - split * (geom.compact ? 0.32 : 0.3)
  })
  const deckX = useTransform(p, (v) => {
    const fan = ease(seg(v, T.fanIn[0], T.fanIn[1])) * (1 - ease(seg(v, T.fanOut[0], T.fanOut[1])))
    const split = ease(seg(v, T.split[0], T.split[1]))
    return geom.deckX + (geom.compact ? 0 : (fan * 0.06 + split * 0.035) * window.innerWidth)
  })
  const deckY = useTransform(p, (v) => geom.deckY + (1 - ease(seg(v, T.rise[0], T.rise[1]))) * geom.cardH * 0.08)
  // پرسپکتیو فقط تا وقتی لازم است که برگه خوابیده؛ بعد از آن برداشته می‌شود تا متن برگه‌ها تیز بماند.
  const perspective = useTransform(p, (v) => (v < T.rise[1] + 0.005 ? '1700px' : 'none'))
  const hintOpacity = useTransform(p, [0, 0.03], [1, 0])

  const scrollTo = (at: number) => {
    const el = ref.current
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top: top + at * (el.offsetHeight - window.innerHeight), behavior: reduced ? 'auto' : 'smooth' })
  }

  const rootStyle = {
    '--accent': inColor ? accent.hex : '#1f3fa8',
    '--logo-accent': inColor ? accent.hex : '#1f3fa8',
  } as CSSProperties

  return (
    <section ref={ref} className="relative h-[760vh]" style={rootStyle} aria-label="برگ چه‌کار می‌کند">
      <motion.div
        className="sticky top-0 h-dvh overflow-hidden"
        style={{ backgroundColor: background, '--fg': fg, '--mut': mut, '--hair': hair } as never}
      >
        {/* دسته‌ی برگه‌ها */}
        <motion.div className="absolute inset-0" style={{ perspective }} aria-hidden="true">
          <motion.div className="absolute left-1/2 top-1/2" style={{ x: deckX, y: deckY, rotateX, rotateZ, scale: deckScale }}>
            {fanResumes.map((r, i) => (
              <FanCard key={FAN[i]} index={i} p={p} geom={geom} resume={i === LAST ? colorResume : r} />
            ))}
            <WordTwin p={p} geom={geom} resume={colorResume} />
          </motion.div>
        </motion.div>

        {/* سرآغاز */}
        <Caption
          p={p}
          from={0}
          to={0.11}
          className="inset-x-5 top-[100px] md:inset-x-auto md:start-[6vw] md:top-1/2 md:w-[min(48vw,720px)] md:-translate-y-1/2"
        >
          <h1 className="font-title text-[clamp(52px,9vw,148px)] leading-[1.08] font-bold text-ink">
            برگِ برنده‌ات
            <br />
            را بساز.
          </h1>
          <p className="mt-4 max-w-[36ch] text-[15px] leading-8 text-muted md:mt-7 md:text-[18px] md:leading-9">
            برگ یک رزومه‌ساز فارسی است. بیست‌ودو بخش، ده قالب رسمی، شش رنگ برای هر قالب، و خروجی PDF و Word. رایگان و بدون ثبت‌نام.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 md:mt-9">
            <StartButton />
            <motion.button
              type="button"
              onClick={() => scrollTo(CHAPTERS[0].at)}
              style={{ opacity: hintOpacity }}
              className="inline-flex items-center gap-2 text-sm font-medium text-ink-2 hover:text-brand"
            >
              <ArrowDown className="size-4 motion-safe:animate-bounce" />
              اول ببین چطور کار می‌کند
            </motion.button>
          </div>
        </Caption>

        {/* ۱. نوشتن */}
        <Caption p={p} from={0.13} to={0.33} className={captionBox}>
          <h2 className={captionTitle}>اول، حرف‌هایت را بنویس.</h2>
          <p className={captionText}>هر چه در فرم بنویسی همان لحظه روی برگه می‌نشیند. بیست‌ودو بخش آماده است و هر بخش دیگری هم بخواهی خودت می‌سازی.</p>
          <ul className="mt-5 hidden max-w-[440px] flex-wrap gap-x-2 gap-y-1.5 md:flex" aria-label="بخش‌های رزومه">
            {SECTION_NAMES.map((name, i) => (
              <li
                key={name}
                className={cx(
                  'rounded-full border px-3 text-[13px] leading-7 transition-colors duration-300',
                  i < written ? 'border-ink bg-ink text-white' : 'border-line text-faint',
                )}
              >
                {name}
              </li>
            ))}
          </ul>
        </Caption>

        {/* ۲. قالب */}
        <Caption p={p} from={0.35} to={0.6} className={captionBox}>
          <h2 className={captionTitle}>بعد، یکی از ده قالب را بردار.</h2>
          <p className={captionText}>همه رسمی و خلوت‌اند. محتوا همان می‌ماند و فقط چیدمان عوض می‌شود؛ هر چند بار بخواهی امتحان کن.</p>
          <div className="mt-5 flex items-baseline gap-4 border-t border-[var(--hair)] pt-4 md:mt-8 md:max-w-[380px]">
            <span className="font-title text-[34px] leading-none font-bold text-[var(--fg)] md:text-[44px]">{getTemplate(FAN[active]).name}</span>
            <span className="text-sm tabular-nums text-[var(--mut)]">
              {toFaDigits(active + 1)} از {toFaDigits(FAN.length)}
            </span>
          </div>
          <p className="mt-2 hidden max-w-[36ch] text-sm leading-7 text-[var(--mut)] md:block">{getTemplate(FAN[active]).description}</p>
        </Caption>

        {/* ۳. رنگ */}
        <Caption p={p} from={0.625} to={0.8} className={captionBox}>
          <h2 className={captionTitle}>رنگش را انتخاب کن.</h2>
          <p className={captionText}>هر قالب شش رنگ‌بندی دارد. رنگ فقط روی تیترها و خط‌ها می‌نشیند؛ برگه سفید می‌ماند و متن سیاه.</p>
          <div className="mt-5 flex items-center gap-2.5 md:mt-8" aria-hidden="true">
            {COLOR_TEMPLATE.palettes.map((id, i) => (
              <span
                key={id}
                className={cx(
                  'size-7 rounded-full transition-[transform,box-shadow] duration-300 md:size-8',
                  i === palette ? 'scale-110 shadow-[0_0_0_3px_#eceef2,0_0_0_5px_var(--accent)]' : 'opacity-75',
                )}
                style={{ background: colors[id].hex }}
              />
            ))}
          </div>
          <p className="mt-4 font-title text-[30px] leading-none font-bold text-[var(--accent)] transition-colors duration-300 md:text-[38px]">
            {accent.name}
          </p>
        </Caption>

        {/* ۴. خروجی */}
        <Caption p={p} from={0.815} to={1} className={captionBox}>
          <h2 className={captionTitle}>و فایلش را بگیر.</h2>
          <p className={captionText}>PDF برای فرستادن، Word برای ویرایش. هر دو روی برگه‌ی A4 و با صفحه‌بندی خودکار.</p>
          <StartButton className="mt-5 md:mt-8" />
        </Caption>

        {/* راهنمای فصل‌ها */}
        <nav aria-label="فصل‌های معرفی" className="absolute end-5 top-1/2 hidden -translate-y-1/2 flex-col gap-1 md:flex">
          {CHAPTERS.map((c, i) => (
            <button
              key={c.id}
              type="button"
              onClick={() => scrollTo(c.at)}
              aria-current={chapter === i ? 'step' : undefined}
              className="group flex h-9 flex-row-reverse items-center gap-3 text-[13px]"
            >
              <span
                className={cx(
                  'h-px transition-[width,background-color] duration-300',
                  chapter === i ? 'w-9 bg-[var(--accent)]' : 'w-4 bg-[var(--mut)] group-hover:w-6',
                )}
              />
              <span className={cx('transition-colors', chapter === i ? 'font-bold text-[var(--fg)]' : 'text-[var(--mut)] group-hover:text-[var(--fg)]')}>
                {c.name}
              </span>
            </button>
          ))}
        </nav>
      </motion.div>
    </section>
  )
}
