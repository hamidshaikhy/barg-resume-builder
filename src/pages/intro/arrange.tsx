import type { CSSProperties, ReactNode } from 'react'
import { GripVertical, LayoutList } from 'lucide-react'
import { cx, toFaDigits } from '@/lib/text'
import { SCENE, useLanding } from './scroll'
import { Sheet } from './sheet'
import { Doodle, labelClass, SceneCaption } from './ui'

/** پرشدن برگه، با رسیدن هر کدام از چهار نخ. */
const FILL = [35, 50, 65, 80, 100]
const KEYWORDS = ['a', 'b', 'c', 'd'] as const

/** نام یک بخش در فهرست، که هم‌زمان با رسیدن نخش به برگه برجسته می‌شود. */
function ListKeyword({ id, children }: { id: (typeof KEYWORDS)[number]; children: ReactNode }) {
  const step = KEYWORDS.indexOf(id) + 1
  return (
    <mark data-posting-keyword={id} className="posting-keyword" style={{ '--k': `var(--t${step})` } as CSSProperties}>
      {children}
    </mark>
  )
}

const slots = [
  { label: 'اول', dot: 'bg-[oklch(0.64_0.02_95)]' },
  { label: 'دوم', dot: 'bg-[oklch(0.64_0.11_250)]' },
  { label: 'سوم', dot: 'bg-[oklch(0.64_0.11_80)]' },
  { label: 'چهارم', dot: 'bg-[oklch(0.64_0.11_150)]' },
]

/**
 * ۰۴ چیدمان. فعل «بچین» به هم دوخته می‌شود، از هر بخشِ فهرست نخی تا تیترش روی برگه کشیده می‌شود، برگه پر
 * می‌شود، برگه‌ی دوم از پشتش بیرون می‌آید و یک بخش با کشیدن جابه‌جا می‌شود.
 */
export function Arrange() {
  const matched = useLanding((state) => state.sectionCount)

  return (
    <section
      id="arrange"
      data-scene={SCENE.arrange}
      data-pin
      aria-labelledby="arrange-title"
      className="relative h-[280vh] motion-reduce:h-svh min-[900px]:h-[330vh]"
    >
      <div className="arrange-stage sticky top-0 h-svh overflow-hidden">
        <Doodle
          name="scissors"
          wipe="clamp(0, (var(--p) - .08) / .2, 1)"
          className="start-[40vw] top-[70vh] w-[12vw] translate-y-[calc(var(--p)*-40px)] rotate-[-10deg] -scale-x-100 max-[900px]:hidden"
        />

        <h2
          id="arrange-title"
          className="absolute start-(--gutter) top-[9vh] text-[16vw] leading-[1.2] whitespace-nowrap text-l-ink min-[900px]:top-[8vh] min-[900px]:text-[clamp(72px,9vw,160px)]"
        >
          <span className="block translate-x-[calc(var(--dir)*(1-var(--sw))*-3vw)] font-extralight [clip-path:inset(0_-5%_50%_-5%)]">
            بچین
          </span>
          <span
            aria-hidden="true"
            className="absolute start-0 top-0 block translate-x-[calc(var(--dir)*(1-var(--sw))*3vw)] font-extralight [clip-path:inset(50%_-5%_-10%_-5%)]"
          >
            بچین
          </span>
          <span
            aria-hidden="true"
            className="absolute -inset-x-[1%] top-[calc(50%-1px)] h-0.5 bg-[repeating-linear-gradient(90deg,var(--l-accent)_0_10px,transparent_10px_17px)] [clip-path:inset(0_0_0_calc((1-var(--sw))*100%))]"
          />
        </h2>

        <SceneCaption
          number="۰۴"
          title="چیدمان"
          className="absolute end-(--gutter) top-[11vh] hidden w-[min(25em,34vw)] min-[900px]:flex min-[900px]:short:hidden"
        >
          ۲۲ بخش آماده و یکی دلخواه. پنهانشان کن یا با کشیدن جابه‌جا؛ برگه که پر شد، ادامه خودش به برگه‌ی بعد می‌رود.
        </SceneCaption>

        <svg data-threads aria-hidden="true" className="pointer-events-none absolute inset-0 z-3 size-full overflow-visible">
          {KEYWORDS.map((key, index) => (
            <path
              key={key}
              data-thread={key}
              d="M0 0"
              pathLength={1}
              fill="none"
              stroke="oklch(0.6 0.12 150)"
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeDasharray={1}
              style={{ strokeDashoffset: `calc(1 - var(--t${index + 1}))` }}
            />
          ))}
        </svg>

        <div className="absolute start-(--gutter) top-[calc(9vh+25vw)] z-2 flex w-[calc(100vw-2*var(--gutter))] flex-col gap-4 min-[900px]:top-[40vh] min-[900px]:w-[min(400px,30vw)]">
          <div className="flex rotate-[1deg] flex-col gap-3 rounded-[14px] border border-l-line bg-l-raised p-[18px] text-[14.5px] leading-[1.8] text-l-ink shadow-l-3">
            <div className="flex items-center gap-[11px]">
              <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-[9px] bg-l-ink text-l-bg">
                <LayoutList className="size-5" />
              </span>
              <div className="flex flex-col leading-[1.5]">
                <b className="text-[15px] font-bold">بخش‌های رزومه</b>
                <span className="text-[12.5px] text-l-ink-3">۲۲ بخش آماده، یکی هم دلخواه</span>
              </div>
              <span className={cx(labelClass, 'ms-auto text-[11px] text-l-ink-3')}>فهرست</span>
            </div>
            <p className="text-l-ink-2">
              از <ListKeyword id="a">سوابق کاری</ListKeyword> و <ListKeyword id="b">تحصیلات</ListKeyword> تا{' '}
              <ListKeyword id="c">مهارت‌ها</ListKeyword> و <ListKeyword id="d">زبان‌ها</ListKeyword>؛ پروژه، مقاله، گواهینامه و هر بخش دیگری هم هست.
            </p>
            <div className="flex items-baseline justify-between border-t border-l-line pt-3">
              <span className={cx(labelClass, 'text-[12px] text-l-ink-3')}>پرشدن برگه</span>
              <span className="text-[40px] leading-none font-extralight text-l-accent-text tabular-nums">
                {toFaDigits(FILL[matched] ?? 0)}٪
              </span>
            </div>
          </div>

          <div className="hidden flex-col gap-2 rounded-[14px] border border-dashed border-l-line-2 px-3.5 py-3 min-[900px]:flex min-[900px]:short:hidden">
            <div className="grid grid-cols-4 text-[11.5px] leading-none font-medium text-l-ink-3">
              {slots.map((slot) => (
                <span key={slot.label} className="flex min-w-0 items-center gap-[6px]">
                  <span aria-hidden="true" className={cx('size-[7px] shrink-0 rounded-full', slot.dot)} />
                  {slot.label}
                </span>
              ))}
            </div>
            <div className="relative h-11">
              <div className="absolute start-[calc((2-var(--ap))*25%)] top-0 flex h-11 w-[calc(25%-6px)] min-w-max items-center gap-1 overflow-hidden rounded-[9px] border border-l-line bg-l-raised ps-1 pe-2.5 text-[12px] leading-[1.35] font-bold whitespace-nowrap text-l-ink shadow-l-2 [transition:inset-inline-start_.5s_var(--ease)]">
                <GripVertical aria-hidden="true" className="size-4 shrink-0 text-l-ink-3" />
                <span className="flex flex-col">
                  مهارت‌ها
                  <span className="text-[11px] font-normal text-l-ink-3">با کشیدن جابه‌جا شد</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute end-[8vw] top-[78%] aspect-[210/297] w-(--pw) -translate-y-1/2 min-[900px]:top-[61%]">
          <div
            aria-hidden="true"
            className="absolute inset-0 translate-x-[calc(var(--dir)*var(--cv)*var(--cvx))] translate-y-[calc(var(--cv)*7%)] rotate-[calc(var(--dir)*var(--cv)*-8deg)] overflow-hidden rounded-[2px] bg-[#fbfaf6] shadow-l-paper [container-type:inline-size] [transition:translate_.5s_var(--ease),rotate_.5s_var(--ease)]"
          >
            <div className="flex flex-col gap-[2.6cqw] p-[9cqw] text-[1.9cqw] leading-[1.7] text-[oklch(0.3_0.01_95)]">
              <span className="text-[1.7cqw] font-bold text-[oklch(0.48_0.1_150)]">ادامه‌ی سوابق کاری · برگه‌ی ۲</span>
              <span className="font-l-serif text-[3.4cqw] font-semibold">توسعه‌دهنده‌ی وب</span>
              <span className="opacity-70">استودیو نقش · اصفهان</span>
              {['92%', '86%', '90%', '62%', '0', '80%', '88%', '54%'].map((width, index) =>
                width === '0' ? (
                  <span key={index} className="h-[2cqw]" />
                ) : (
                  <span key={index} className="h-[1.2cqw] rounded-[1cqw] bg-[oklch(0.9_0.006_95)]" style={{ width }} />
                ),
              )}
            </div>
            <span className="absolute inset-x-0 bottom-[5cqw] text-center text-[1.6cqw] text-[oklch(0.55_0.01_95)]">۲ از ۲</span>
          </div>
          <div className="absolute inset-0 rounded-[2px] shadow-l-paper">
            <Sheet />
          </div>
        </div>
      </div>
    </section>
  )
}
