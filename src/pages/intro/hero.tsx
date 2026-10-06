import { useEffect, useRef, type CSSProperties } from 'react'
import { cx } from '@/lib/text'
import { prefersReducedMotion, SCENE } from './scroll'
import { Sheet } from './sheet'
import { CtaLink, Doodle, labelClass, proseClass } from './ui'

const fragmentKind = {
  display: 'font-sans font-extralight leading-[1.2]',
  serif: 'font-l-serif leading-[1.2]',
  mono: 'font-medium text-[13px] leading-none',
  pill: 'rounded-full px-3.5 py-[9px] font-semibold text-[15px] leading-none',
}

const pillAccent = 'bg-l-accent-soft text-l-accent-text'

/**
 * هجده تکه از یک کارنامه که به برگه می‌رسند. هر کدام از (x, y) شروع می‌کند، به (tx, ty) می‌رود و هنگام نشستن
 * کوچک می‌شود؛ z عمقش است، برای جابه‌جایی با موس.
 */
const fragments = [
  { text: 'سرپرست فنی فرانت‌اند', at: ['30vw', '-28vh', '6vw', '-14vh', '4deg', 1, 0.9], className: cx(fragmentKind.display, 'text-[2.4vw] text-l-ink-2') },
  { text: 'سامانه‌ی طراحی', at: ['39vw', '4vh', '4vw', '2vh', '8deg', 1.1, 1.2], className: cx(fragmentKind.pill, pillAccent) },
  { text: 'تهران', at: ['-41vw', '20vh', '-6vw', '10vh', '3deg', 1, 0.5], className: cx(fragmentKind.serif, 'text-[3.2vw] text-l-ink-3') },
  { text: '۱٫۸ ثانیه بارگذاری', at: ['17vw', '33vh', '2vw', '12vh', '-4deg', 1, 1], className: cx(fragmentKind.display, 'text-[2.6vw] text-l-accent-text') },
  { text: 'React', at: ['-21vw', '37vh', '-4vw', '14vh', '-10deg', 1.1, 1.3], className: cx(fragmentKind.pill, 'bg-l-raised text-l-ink shadow-l-2') },
  { text: 'TypeScript', at: ['44vw', '-12vh', '7vw', '-4vh', '0deg', 1, 0.3], className: cx(fragmentKind.mono, 'font-l-mono text-l-ink-3') },
  { text: 'کارشناسی ارشد نرم‌افزار', at: ['-10vw', '-40vh', '-1vw', '-11vh', '2deg', 1, 0.6], className: cx(fragmentKind.serif, 'text-[1.8vw] text-l-ink-2') },
  { text: 'دانشگاه صنعتی اصفهان', at: ['9vw', '-43vh', '3vw', '-16vh', '-2deg', 1, 0.35], className: cx(fragmentKind.mono, 'text-l-ink-3') },
  { text: 'سوابق کاری', at: ['-39vw', '3vh', '-5vw', '1vh', '6deg', 1, 0.8], className: cx(fragmentKind.display, 'text-[2vw] font-light text-l-ink-2') },
  { text: 'داشبورد برای ۱۲ هزار کاربر', at: ['27vw', '23vh', '5vw', '8vh', '-3deg', 1, 0.7], className: cx(fragmentKind.serif, 'text-[2vw] text-l-ink-2') },
  { text: 'دسترس‌پذیری', at: ['-6vw', '42vh', '0vw', '16vh', '5deg', 1.1, 1.1], className: cx(fragmentKind.pill, pillAccent) },
  { text: 'hamid.shaikhy@example.com', at: ['-25vw', '29vh', '-4vw', '9vh', '-2deg', 1, 0.4], className: cx(fragmentKind.mono, 'font-l-mono text-l-ink-3') },
  { text: 'مهارت‌ها', at: ['44vw', '38vh', '6vw', '15vh', '7deg', 1, 0.8], className: cx(fragmentKind.serif, 'text-[2.5vw] text-l-ink-3') },
  { text: 'پوشش آزمون ۷۸٪', at: ['-44vw', '38vh', '-6vw', '13vh', '4deg', 1, 1], className: cx(fragmentKind.display, 'text-[2.3vw] text-l-ink-2') },
  { text: 'سرپرست تیم، ۱۴۰۱', at: ['38vw', '-38vh', '5vw', '-13vh', '-4deg', 1, 0.5], className: cx(fragmentKind.serif, 'text-[2vw] text-l-ink-2') },
  { text: 'انگلیسی، C1', at: ['26vw', '43vh', '3vw', '16vh', '0deg', 1, 0.3], className: cx(fragmentKind.mono, 'text-l-ink-3') },
  { text: 'چهار تیم محصول', at: ['-30vw', '45vh', '-5vw', '17vh', '2deg', 1, 0.6], className: cx(fragmentKind.display, 'text-[1.6vw] font-light text-l-ink-3') },
  { text: 'رابط راست‌به‌چپ', at: ['13vw', '-33vh', '2vw', '-10vh', '-7deg', 1.1, 1.2], className: cx(fragmentKind.pill, pillAccent) },
] as const

const headline = ['سال‌ها', 'تجربه،', 'روی یک', 'برگ'] as const

/**
 * ۰۰ سرآغاز: «سال‌ها تجربه، روی یک برگ» تکه‌های یک کارنامه شناور می‌آیند، به هم می‌رسند و برگه می‌شوند؛ تیتر
 * دو نیم می‌شود و دو طرف برگه می‌نشیند. بند و دکمه‌ی پایین بدون موتور اسکرول هم دیده می‌شوند.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null)

  // خط‌های راهنمای مدادی یک بار، کمی پس از بارگذاری، کشیده می‌شوند.
  useEffect(() => {
    const section = ref.current
    if (!section) return
    if (prefersReducedMotion()) return void section.style.setProperty('--ld', '1')
    const timer = window.setTimeout(() => section.style.setProperty('--ld', '1'), 120)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <section
      ref={ref}
      id="top"
      data-scene={SCENE.hero}
      data-pin
      aria-labelledby="hero-title"
      className="relative h-[190vh] motion-reduce:h-svh min-[900px]:h-[260vh]"
    >
      <div className="hero-stage sticky top-0 h-svh overflow-hidden motion-reduce:[--ld:1]">
        {/* خط‌های راهنما، با مداد، دور جایی که برگه می‌نشیند. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 text-l-graphite [filter:url(#l-pencil)]">
          <span className="hero-guide hero-guide-v left-[calc(50%-var(--pw)/2)]" style={{ '--delay': '.2s' } as CSSProperties} />
          <span className="hero-guide hero-guide-v left-[calc(50%+var(--pw)/2)]" style={{ '--delay': '.35s' } as CSSProperties} />
          <span className="hero-guide hero-guide-h top-[calc(var(--pt)-var(--pw)*.707)]" style={{ '--delay': '.5s' } as CSSProperties} />
          <span className="hero-guide hero-guide-h top-[calc(var(--pt)+var(--pw)*.707)]" style={{ '--delay': '.65s' } as CSSProperties} />
          <span className="hero-guide hero-guide-circle" />
        </div>

        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-[calc(var(--pt)-var(--pw)*.707-24px)] right-[calc(50%+var(--pw)/2+10px)] text-[11.5px] leading-none text-l-graphite opacity-[var(--ld,0)] transition-opacity delay-[1.4s] duration-1000"
        >
          ۲۱۰ × ۲۹۷
        </span>

        <Doodle
          name="pencil"
          wipe="var(--ld, 0)"
          className="start-[74vw] top-[max(14vh,110px)] w-[12vw] [transform:translate(calc(var(--mx,0)*-22px),calc(var(--my,0)*-14px))_rotate(calc(-14deg+var(--mx,0)*3deg))_translateY(calc(var(--p)*-20px))] [transition:mask-position_1.8s_var(--ease)_.9s,transform_.9s_var(--ease)] max-[900px]:w-[22vw] max-[900px]:start-[70vw] max-[900px]:top-[64vh]"
        />
        <Doodle
          name="paperclip"
          wipe="var(--ld, 0)"
          className="start-[3vw] top-[58%] w-[7vw] [transform:translate(calc(var(--mx,0)*22px),calc(var(--my,0)*16px))_rotate(calc(-16deg+var(--mx,0)*-4deg))_translateY(calc(var(--p)*-30px))] [transition:mask-position_1.4s_var(--ease)_1.3s,transform_1.1s_var(--ease)] max-[900px]:hidden"
        />

        <p className={cx(labelClass, 'absolute inset-x-(--gutter) top-[92px] z-2 text-l-ink-3')}>رزومه‌ساز فارسی، رایگان و بدون ثبت‌نام</p>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-80 [mask-image:linear-gradient(to_bottom,transparent_0,transparent_120px,#000_200px,#000_calc(100%-250px),transparent_calc(100%-170px))]"
        >
          {fragments.map(({ text, at: [x, y, tx, ty, r, s, z], className }) => (
            <span
              key={text}
              dir="auto"
              className={cx('hero-fragment', className)}
              style={{ '--x': x, '--y': y, '--tx': tx, '--ty': ty, '--r': r, '--s': s, '--z': z } as CSSProperties}
            >
              {text}
            </span>
          ))}
        </div>

        <div className="hero-page rounded-[2px] shadow-l-paper">
          <Sheet />
        </div>

        <h1 id="hero-title" className="sr-only">
          سال‌ها تجربه، روی یک برگ
        </h1>

        {/* تیتر، دو نیمه در دو طرف برگه (زیر ۹۰۰ پیکسل، روی هم بالای آن). */}
        <div
          aria-hidden="true"
          className="hero-head-start absolute top-1/2 hidden text-end text-[4.6vw] leading-[1.2] whitespace-nowrap text-l-ink min-[900px]:block"
        >
          <span className="block" style={{ fontWeight: 'calc(260 - var(--e) * 80)' }}>
            {headline[0]}
          </span>
          <span className="block" style={{ fontWeight: 'calc(320 + var(--e) * 60)' }}>
            {headline[1]}
          </span>
        </div>
        <div aria-hidden="true" className="hero-head-end absolute top-1/2 hidden text-[4.6vw] leading-[1.2] whitespace-nowrap min-[900px]:block">
          <span className="block font-l-serif text-[1.22em] leading-[1] font-medium text-l-accent-text">{headline[2]}</span>
          <span className="block font-normal text-l-ink">{headline[3]}</span>
        </div>
        <div aria-hidden="true" className="absolute inset-x-(--gutter) top-32 text-[11vw] leading-[1.15] text-l-ink min-[900px]:hidden">
          <span className="block font-extralight">
            {headline[0]} {headline[1]}
          </span>
          <span className="block opacity-[clamp(0,(var(--e)-.4)*3,1)]">
            <span className="font-l-serif text-[1.2em] font-medium text-l-accent-text">{headline[2]}</span> {headline[3]}
          </span>
        </div>

        <div className="absolute inset-x-(--gutter) bottom-[clamp(20px,4vh,40px)] z-2 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <p className={cx(proseClass, 'max-w-full text-l-ink-2 min-[900px]:max-w-[min(25em,calc(50vw-var(--pw)/2-5vw))]')}>
            برگ یک رزومه‌ساز فارسی و رایگان است. بنویس، قالب و رنگش را انتخاب کن و PDF یا Word بگیر؛ بدون ثبت‌نام، و همه‌چیز فقط در مرورگر خودت.
          </p>
          <CtaLink size="hero" />
        </div>
      </div>
    </section>
  )
}
