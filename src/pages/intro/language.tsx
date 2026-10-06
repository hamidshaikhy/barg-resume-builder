import { useRef, type PointerEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Circle, CircleAlert, CircleCheck } from 'lucide-react'
import { cx } from '@/lib/text'
import { prefersReducedMotion, SCENE, useLanding } from './scroll'
import { Sheet } from './sheet'
import { Doodle, labelClass, SceneCaption } from './ui'

/**
 * ۰۳ زبان. خط جاروب واژه‌ی «فارسی» را به «English» برمی‌گرداند و فهرست کنارش تیک می‌خورد. ذره‌بینی روی برگه
 * پایین می‌رود و همان برگه را به انگلیسی نشان می‌دهد؛ با موس، دنبال نشانگر می‌آید.
 */
export function Language() {
  const progress = useLanding((state) => state.langProgress)
  const sectionRef = useRef<HTMLElement>(null)
  const ltr = progress >= 0.5

  const items = [
    { label: 'برگه از چپ به راست چیده شد', done: progress > 0.08, warning: false },
    { label: 'ایمیل و پیوندها سر جای خودشان', done: progress > 0.2, warning: false },
    { label: 'عنوان بخش‌ها انگلیسی شد', done: progress > 0.36, warning: false },
    {
      label: progress > 0.72 ? 'ارقام لاتین شد' : 'ارقام هنوز فارسی‌اند',
      done: progress > 0.72,
      warning: progress > 0.42,
    },
  ]

  // نشانگر تا روی برگه است ذره‌بین را می‌برد؛ بیرون که رفت، موتور اسکرول پسش می‌گیرد.
  const moveLens = (event: PointerEvent<HTMLDivElement>) => {
    const section = sectionRef.current
    if (!section || event.pointerType !== 'mouse' || prefersReducedMotion()) return
    const rect = event.currentTarget.getBoundingClientRect()
    section.dataset.lensHover = ''
    section.style.setProperty('--lx', `${(((event.clientX - rect.left) / rect.width) * 100).toFixed(2)}%`)
    section.style.setProperty('--ly', `${(((event.clientY - rect.top) / rect.height) * 100).toFixed(2)}%`)
  }
  const releaseLens = () => {
    if (sectionRef.current) delete sectionRef.current.dataset.lensHover
    window.dispatchEvent(new Event('scroll'))
  }

  return (
    <section
      ref={sectionRef}
      id="language"
      data-scene={SCENE.language}
      data-pin
      aria-labelledby="language-title"
      className="relative h-[260vh] motion-reduce:h-svh min-[900px]:h-[320vh]"
    >
      <div className="lang-stage sticky top-0 h-svh overflow-hidden">
        <Doodle
          name="globe"
          wipe="clamp(0, (var(--p) - .04) / .2, 1)"
          className="start-[42vw] top-[60vh] w-[10vw] translate-y-[calc(var(--p)*-50px)] rotate-[10deg] max-[900px]:hidden"
        />

        <h2
          id="language-title"
          className="absolute start-(--gutter) top-[9vh] text-[17vw] leading-[1.15] whitespace-nowrap text-l-ink min-[900px]:top-[8vh] min-[900px]:text-[clamp(76px,9.5vw,168px)]"
        >
          <span className="block font-extralight [clip-path:inset(calc(var(--sv)*120%-20%)_-5%_-20%_-5%)]">
            فارسی
          </span>
          <span
            aria-hidden="true"
            dir="ltr"
            className="absolute top-0 right-0 block font-l-mono text-[.8em] leading-[1.45] font-light tracking-[-.04em] text-l-accent-text [clip-path:inset(-20%_-5%_calc((1-var(--sv))*120%)_-5%)]"
          >
            English
          </span>
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-[calc(var(--sv)*120%-20%)] h-0.5 bg-l-accent opacity-[calc(clamp(0,var(--sv)*30,1)*clamp(0,(1-var(--sv))*30,1))] shadow-[0_0_18px_2px_oklch(0.6_0.12_150/.5)]"
          />
          <span className="sr-only"> انگلیسی هم</span>
        </h2>

        <div className="absolute start-(--gutter) top-[calc(9vh+22vw)] bottom-[clamp(20px,5vh,44px)] flex w-[calc(100vw-2*var(--gutter))] flex-col justify-between gap-6 min-[900px]:top-[calc(8vh+clamp(76px,9.5vw,168px)*1.2+3vh)] min-[900px]:w-[min(34em,36vw)]">
          <div className="flex flex-col gap-3">
            <span className={cx(labelClass, 'text-l-ink-3')}>جهت برگه</span>
            <p className="flex items-baseline gap-3">
              <span dir="ltr" className="font-l-mono text-[44px] leading-[.9] font-light tracking-[-.05em] text-l-ink min-[900px]:text-[clamp(48px,4.6vw,84px)]">
                {ltr ? 'LTR' : 'RTL'}
              </span>
              <span className="text-[14px] text-l-ink-3">{ltr ? 'چپ‌به‌راست' : 'راست‌به‌چپ'}</span>
            </p>
            <ul className="flex flex-col gap-2 text-[14.5px] leading-[1.4] font-medium">
              {items.map((item, index) => {
                const Icon = item.done ? CircleCheck : item.warning ? CircleAlert : Circle
                return (
                  <li
                    key={index}
                    className={cx('flex items-center gap-[9px] transition-colors duration-300', item.done || item.warning ? 'text-l-ink' : 'text-l-ink-3')}
                  >
                    <Icon
                      aria-hidden="true"
                      className={cx(
                        'size-[18px] shrink-0 transition-colors duration-300',
                        item.done ? 'text-l-accent' : item.warning ? 'text-[oklch(0.72_0.14_80)]' : 'text-l-line-2',
                      )}
                    />
                    {item.label}
                  </li>
                )
              })}
            </ul>
          </div>

          <SceneCaption
            number="۰۳"
            title="زبان"
            className="hidden min-[900px]:flex min-[900px]:short:hidden"
            action={
              <Link
                to="/builder"
                className="flex items-center gap-1.5 self-start text-[15px] font-bold text-l-accent-text transition-colors hover:text-l-accent-hover"
              >
                رزومه‌ی انگلیسی بساز
                <ArrowLeft className="size-[18px]" aria-hidden="true" />
              </Link>
            }
          >
            رزومه‌ی انگلیسی هم می‌سازد. با یک گزینه برگه چپ‌به‌راست می‌شود و عنوان بخش‌ها انگلیسی؛ ایمیل و واژه‌های لاتینِ وسط متن فارسی هم، در PDF
            و Word، سر جای خودشان می‌مانند.
          </SceneCaption>
        </div>

        <div
          onPointerMove={moveLens}
          onPointerLeave={releaseLens}
          className="absolute end-[5vw] top-[73%] aspect-[210/297] w-(--pw) -translate-y-1/2 rotate-[-1deg] cursor-crosshair rounded-[2px] shadow-l-paper [container-type:inline-size] min-[900px]:end-[10vw] min-[900px]:top-[54%]"
        >
          <Sheet translations />
          <div aria-hidden="true" className="lang-lens absolute inset-0 overflow-hidden rounded-[2px] opacity-(--lo)">
            <Sheet lang="en" />
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-[var(--ly,16%)] left-[var(--lx,50%)] aspect-square w-[34cqw] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[oklch(0.62_0.13_150)] opacity-(--lo) shadow-[inset_0_0_0_1px_oklch(1_0_0/.35),0_20px_50px_-12px_oklch(0_0_0/.5)]"
          >
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 -translate-y-full rounded-full bg-[oklch(0.2_0.03_160)] px-[10px] py-[5px] text-[11px] leading-none font-semibold whitespace-nowrap text-[oklch(0.88_0.09_150)]">
              همین برگه، به انگلیسی
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
