import { useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, FileJson, FileText, FileType, type LucideIcon } from 'lucide-react'
import { cx } from '@/lib/text'
import { SCENE, useLanding } from './scroll'
import { Sheet } from './sheet'
import { Doodle, labelClass, proseClass, Segmented, TypedText } from './ui'

const FILE = 'hamid-shaikhy'

const formats: { ext: string; label: string; icon: LucideIcon }[] = [
  { ext: 'pdf', label: 'PDF', icon: FileText },
  { ext: 'docx', label: 'Word', icon: FileType },
  { ext: 'json', label: 'پشتیبان', icon: FileJson },
]

/** چهل‌وشش ستاره با بذر ثابت، تا آسمان هر بار همان باشد. */
const stars = (() => {
  let seed = 7
  const random = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  return Array.from({ length: 46 }, () => ({
    left: `${(random() * 100).toFixed(2)}%`,
    top: `${(random() * 100).toFixed(2)}%`,
    size: `${(1 + random() * 1.8).toFixed(1)}px`,
    opacity: Number((0.25 + random() * 0.6).toFixed(2)),
  }))
})()

/**
 * ۰۵ خروجی، صحنه‌ی شب. برگه روی یک رد سبز به گوشه‌ی بالا پرواز می‌کند، نام فایل تایپ می‌شود و قالب‌های خروجی پیدا
 * می‌شوند. با عوض‌کردن قالب، پسوند فایل هم عوض می‌شود.
 */
export function Export() {
  const active = useLanding((state) => state.activeScene === SCENE.export)
  const ready = useLanding((state) => state.exportReady)
  const [format, setFormat] = useState(0)
  const current = formats[format]
  const name = `${FILE}.${current.ext}`
  const Icon = current.icon

  return (
    <section
      id="export"
      data-scene={SCENE.export}
      data-pin
      aria-labelledby="export-title"
      className="relative h-[240vh] motion-reduce:h-svh min-[900px]:h-[300vh]"
    >
      <div className="export-stage sticky top-0 h-svh overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(120%_90%_at_30%_0%,oklch(0.24_0.03_265),oklch(0.15_0.02_265)_60%)] opacity-(--nt)"
        />
        <div aria-hidden="true" className="absolute inset-0 translate-y-[calc(var(--p)*-8vh)] opacity-(--nt)">
          {stars.map((star) => (
            <span
              key={`${star.left}${star.top}`}
              className="absolute size-(--size) rounded-full bg-[oklch(0.95_0.02_95)]"
              style={{ left: star.left, top: star.top, opacity: star.opacity, '--size': star.size } as CSSProperties}
            />
          ))}
        </div>

        <Doodle
          name="plane"
          wipe="clamp(0, (var(--p) - .12) / .2, 1)"
          className="start-[6vw] top-[max(12vh,110px)] w-[15vw] translate-y-[calc(var(--p)*-30px)] -rotate-[4deg] -scale-x-100 !text-[oklch(0.92_0.01_95)] !opacity-[calc(var(--nt)*.6)] max-[900px]:w-[28vw]"
        />

        <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full -scale-x-100 opacity-[calc(var(--nt)*.7)]">
          <path
            d="M50 50 Q73 50 96 -20"
            pathLength={1}
            fill="none"
            stroke="oklch(0.8 0.12 150)"
            strokeWidth={0.1}
            strokeDasharray={1}
            style={{ strokeDashoffset: 'calc(1 - var(--fl))' }}
          />
        </svg>

        <div className="export-page absolute top-1/2 left-1/2 aspect-[210/297] w-(--pw) rounded-[2px] shadow-l-paper">
          <Sheet />
        </div>

        <div className="absolute inset-x-(--gutter) top-1/2 flex -translate-y-1/2 flex-col items-center gap-[26px] text-center">
          <span aria-hidden="true" className={cx(labelClass, 'text-(--night-label) opacity-[clamp(0,var(--tu)*20,1)]')}>
            رزومه‌ات، آماده‌ی فرستادن
          </span>
          <h2
            id="export-title"
            dir="ltr"
            className="flex flex-wrap items-center justify-center font-l-mono text-[7vw] leading-[1.2] font-light tracking-[-.04em] text-(--night-ink) min-[900px]:text-[clamp(32px,4.4vw,84px)]"
          >
            <span className="sr-only">رزومه‌ات، آماده‌ی فرستادن: </span>
            <Icon aria-hidden="true" className="me-[.25em] size-[.62em] text-(--night-accent) opacity-[clamp(0,var(--tu)*20,1)]" strokeWidth={1.6} />
            <TypedText
              key={name}
              text={name}
              progress="--tu"
              rate={60}
              className="[overflow-wrap:anywhere]"
              charStyle={(index) => (index > FILE.length - 1 ? { color: 'var(--night-accent)' } : undefined)}
            />
            <span aria-hidden="true" className="ms-[.05em] h-[.9em] w-[.07em] bg-(--night-accent) opacity-[clamp(0,var(--tu)*20,1)]" />
          </h2>

          <div
            inert={!ready}
            className={cx(
              'flex translate-y-[calc((1-var(--ui))*16px)] flex-wrap justify-center gap-3 opacity-(--ui)',
              !active && 'pointer-events-none',
            )}
          >
            <Segmented
              label="قالب فایل"
              value={format}
              onChange={setFormat}
              options={formats.map((f, index) => ({
                value: index,
                label: (
                  <>
                    <f.icon aria-hidden="true" className="size-[17px]" />
                    {f.label}
                  </>
                ),
              }))}
              className="rounded-full border border-(--night-line) bg-(--night-fill) p-1"
              itemClassName={(checked) =>
                cx('h-[36px] px-3.5', checked ? 'bg-(--night-ink) text-(--night-on-ink)' : 'text-(--night-ink-2) hover:text-(--night-ink)')
              }
            />
            <Link
              to="/builder"
              className="flex h-11 items-center gap-1.5 rounded-full bg-(--night-ink) px-[18px] text-sm font-bold text-(--night-on-ink) transition-opacity hover:opacity-90"
            >
              بساز و دانلود کن
              <ArrowLeft aria-hidden="true" className="size-[18px]" />
            </Link>
          </div>

          <ul className="flex flex-wrap justify-center gap-2.5">
            {[
              { icon: FileText, label: 'PDF متنی' },
              { icon: FileType, label: 'WORD' },
              { icon: FileJson, label: 'JSON' },
            ].map((chip, index) => (
              <li
                key={chip.label}
                className="flex h-9 translate-y-[calc((1-var(--f))*10px)] items-center gap-2 rounded-md border border-[color-mix(in_oklch,var(--night-chip-line)_calc(var(--f)*100%),transparent)] px-3.5 text-[12px] leading-none font-semibold text-(--night-chip) opacity-(--f)"
                style={{ '--f': `var(--f${index + 1})` } as CSSProperties}
              >
                <chip.icon aria-hidden="true" className="size-[17px]" />
                {chip.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="absolute start-(--gutter) bottom-[clamp(20px,5vh,44px)] flex max-w-[90vw] flex-col gap-2.5 opacity-[clamp(0,(var(--p)-.2)*6,1)] min-[900px]:max-w-[min(28em,34vw)]">
          <span className={cx(labelClass, 'text-(--night-label)')}>۰۵ / خروجی</span>
          <p className={cx(proseClass, 'text-(--night-ink) min-[900px]:short:hidden')}>
            PDF برای فرستادن، Word برای ویرایش، و یک فایل پشتیبان که هر وقت خواستی، روی هر دستگاهی، دوباره بازش کنی. همه روی برگه‌ی A4 و با
            صفحه‌بندی خودکار.
          </p>
        </div>
      </div>
    </section>
  )
}
