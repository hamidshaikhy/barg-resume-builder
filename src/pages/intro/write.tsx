import { useEffect, useRef } from 'react'
import { Check, CircleCheck, Lightbulb, Undo2 } from 'lucide-react'
import { cx } from '@/lib/text'
import { goToScene, SCENE, useLanding } from './scroll'
import { sheetCopy } from './sheet'
import { Doodle, SceneCaption, TypedText } from './ui'

/** نقطه‌ی پذیرفته‌شدن بازنویسی (بازنویسی کن) و نقطه‌ی بازبودن نکته (همین بماند، برگردان). */
const ACCEPTED_AT = 0.93
const NOTE_AT = 0.42

const [job1, job2] = sheetCopy.fa.jobs
const WEAK_LINE = 'مسئول بخشی از فرانت‌اند و کمک به تیم‌های دیگر در طراحی.'

/**
 * ۰۱ نوشتن. یک خط روی برگه تایپ می‌شود، یک نکته در حاشیه پیدا می‌شود، خط قبلی خط می‌خورد و جمله‌ی تازه جایش
 * تایپ و ذخیره می‌شود. دکمه‌های نکته صحنه را به هر کدام از دو پایان می‌برند.
 */
export function Write() {
  const step = useLanding((state) => state.writeStep)
  const active = useLanding((state) => state.activeScene === SCENE.write)
  const acceptRef = useRef<HTMLButtonElement>(null)
  const undoRef = useRef<HTMLButtonElement>(null)
  // دکمه‌ای که با صفحه‌کلید زده شد وسط اسکرول غیرفعال می‌شود، پس تمرکز به همتایش در مقصد می‌رود.
  const pendingFocus = useRef<'accept' | 'undo' | null>(null)

  useEffect(() => {
    if (pendingFocus.current === 'undo' && step === 2) undoRef.current?.focus({ preventScroll: true })
    else if (pendingFocus.current === 'accept' && step === 1) acceptRef.current?.focus({ preventScroll: true })
    else return
    pendingFocus.current = null
  }, [step])

  const accept = () => {
    pendingFocus.current = 'undo'
    goToScene(SCENE.write, ACCEPTED_AT)
  }
  const reopen = (focusAccept: boolean) => {
    pendingFocus.current = focusAccept ? 'accept' : null
    goToScene(SCENE.write, NOTE_AT)
  }

  return (
    <section
      id="write"
      data-scene={SCENE.write}
      data-pin
      aria-labelledby="write-title"
      className="relative h-[280vh] motion-reduce:h-svh min-[900px]:h-[330vh]"
    >
      <div className="write-stage sticky top-0 h-svh overflow-hidden">
        <Doodle
          name="eraser"
          wipe="clamp(0, (var(--p) - .02) / .2, 1)"
          className="start-[8vw] top-[38vh] w-[11vw] translate-y-[calc(var(--p)*-50px)] rotate-[8deg] max-[900px]:hidden"
        />

        <h2
          id="write-title"
          className="write-title absolute start-(--gutter) top-[9vh] text-[17vw] leading-[1.1] whitespace-nowrap text-l-ink min-[900px]:top-[8vh] min-[900px]:text-[clamp(80px,10vw,176px)]"
        >
          بنویس
        </h2>

        <SceneCaption
          number="۰۱"
          title="نوشتن"
          className="absolute inset-x-(--gutter) top-[calc(10vh+21vw)] opacity-(--in) min-[900px]:end-auto min-[900px]:top-auto min-[900px]:bottom-[clamp(20px,5vh,44px)] min-[900px]:max-w-[min(30em,34vw)]"
        >
          کنار یک برگه‌ی زنده بنویس. هر چه در فرم بنویسی همان لحظه روی برگه می‌نشیند و در همین مرورگر ذخیره می‌شود. تاریخ‌ها شمسی‌اند، و اگر
          خواستی میلادی.
        </SceneCaption>

        <div className="write-paper">
          <div className="absolute start-[5vw] top-[1.4vw] flex h-7 items-center gap-1.5 rounded-full bg-[oklch(0.95_0.006_95)] ps-2 pe-3 text-[12.5px] font-medium text-[oklch(0.42_0.01_95)] opacity-(--cl)">
            <CircleCheck className="size-4 text-[oklch(0.42_0.1_150)]" aria-hidden="true" />
            ذخیره شد · در همین مرورگر
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-x-[3vw] gap-y-[.4em] min-[900px]:grid-cols-[minmax(0,1fr)_minmax(0,max(15vw,220px))]">
            <div className="col-start-1 flex flex-col gap-[.2em]">
              <span className="mb-[.7em] border-b border-[oklch(0.45_0.1_150/.35)] pb-[.5em] text-[.75em] leading-[1.4] font-bold text-[oklch(0.45_0.1_150)]">
                {sheetCopy.fa.headings[1]}
              </span>
              <div className="flex items-baseline justify-between gap-[1em]">
                <b className="font-l-serif text-[1.75em] leading-[1.2] font-semibold">{job1.title}</b>
                <span className="text-[.8em] whitespace-nowrap text-[oklch(0.5_0.01_95)]">{job1.date}</span>
              </div>
              <span className="text-[oklch(0.45_0.01_95)]">{job1.org}</span>
            </div>

            {/* هر خط نقطه‌ی خودش را می‌کشد تا وقتی خط قبلی جمع می‌شود، جمله‌ی تازه نقطه‌اش را نگه دارد. */}
            <ul className="col-start-1 mt-[.3em]">
              <li>
                <span className="write-old relative block ps-[1.1em] before:absolute before:start-[.2em] before:content-['•']">
                  <TypedText text={WEAK_LINE} progress="--ta" className="write-struck" />
                </span>
                <span className="write-new relative block ps-[1.1em] before:absolute before:start-[.2em] before:opacity-(--cl) before:content-['•']">
                  <TypedText text={job1.bullets[0]} progress="--ti" charClassName="typed-suggestion" />
                </span>
              </li>
            </ul>

            <div
              className={cx(
                'write-note relative col-start-1 grid min-w-0 text-[13.5px] leading-[1.6] text-[oklch(0.25_0.01_95)] min-[900px]:col-start-2 min-[900px]:row-start-2',
                !active && 'pointer-events-none',
              )}
            >
              <span
                aria-hidden="true"
                className="absolute -start-[3vw] top-[24px] hidden w-[3vw] border-t-[1.5px] border-dashed border-[oklch(0.5_0.1_150/.6)] min-[900px]:block"
              />
              <div
                inert={step !== 1}
                className="col-start-1 row-start-1 flex flex-col gap-[9px] rounded-xl border border-[oklch(0.9_0.006_95)] bg-white px-[13px] py-3 opacity-[calc(1-var(--cl))] shadow-[0_12px_30px_-12px_oklch(0.2_0.01_95/.3)]"
              >
                <div className="flex items-center gap-2">
                  <span className="flex size-[24px] items-center justify-center rounded-full bg-[oklch(0.94_0.035_150)] text-[oklch(0.42_0.1_150)]">
                    <Lightbulb className="size-[15px]" aria-hidden="true" />
                  </span>
                  <b className="font-bold">نکته‌ی نوشتن</b>
                </div>
                <span>با نتیجه شروع کن و برایش عدد بیاور.</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    ref={acceptRef}
                    type="button"
                    onClick={accept}
                    className="h-[30px] rounded-md bg-[oklch(0.5_0.1_150)] px-3 text-[12.5px] font-bold text-white transition-colors hover:bg-[oklch(0.44_0.1_150)]"
                  >
                    بازنویسی کن
                  </button>
                  <button
                    type="button"
                    onClick={() => reopen(false)}
                    className="h-[30px] rounded-md border border-[oklch(0.82_0.008_95)] bg-white px-[11px] text-[12.5px] font-medium text-[oklch(0.25_0.01_95)] transition-colors hover:bg-[oklch(0.96_0.005_95)]"
                  >
                    همین بماند
                  </button>
                </div>
              </div>
              <div
                inert={step !== 2}
                className="col-start-1 row-start-1 flex items-center gap-2 self-start rounded-xl bg-[oklch(0.95_0.03_150)] px-[13px] py-2.5 font-medium text-[oklch(0.38_0.1_150)] opacity-(--cl)"
              >
                <Check className="size-[17px]" aria-hidden="true" />
                بازنویسی شد
                {/* برگرداندن صحنه را عقب می‌برد، که با «کاهش حرکت» معنا ندارد. */}
                <button
                  ref={undoRef}
                  type="button"
                  onClick={() => reopen(true)}
                  className="ms-auto flex h-7 items-center gap-1 rounded-sm px-2 text-[12.5px] font-medium text-[oklch(0.3_0.01_95)] transition-colors hover:bg-[oklch(0.9_0.04_150)] motion-reduce:hidden"
                >
                  <Undo2 className="size-4" aria-hidden="true" />
                  برگردان
                </button>
              </div>
            </div>

            <ul className="col-start-1 list-disc ps-[1.1em]">
              <li>{job1.bullets[1]}</li>
            </ul>
            <div className="col-start-1 mt-[1.1em] flex flex-col gap-[.2em]">
              <div className="flex items-baseline justify-between gap-[1em]">
                <b className="font-l-serif text-[1.75em] leading-[1.2] font-semibold">{job2.title}</b>
                <span className="text-[.8em] whitespace-nowrap text-[oklch(0.5_0.01_95)]">{job2.date}</span>
              </div>
              <span className="text-[oklch(0.45_0.01_95)]">{job2.org}</span>
              <ul className="mt-[.3em] list-disc ps-[1.1em]">
                <li>{job2.bullets[0]}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
