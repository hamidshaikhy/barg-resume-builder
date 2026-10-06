import { useEffect, useRef } from 'react'
import { Arrange } from './arrange'
import { LandingBackground } from './background'
import { Design } from './design'
import { GraphiteFilters } from './doodles'
import { Export } from './export'
import { LandingHeader, ThemeCord } from './header'
import { Hero } from './hero'
import { Language } from './language'
import { useLanding, useScrollScenes } from './scroll'
import { Closing, EndMark, Faq, Numbers, Support } from './sections'
import { Write } from './write'

/**
 * صفحه‌ی نخست: یک داستان اسکرولی، «سال‌ها تجربه، روی یک برگ». یک برگه‌ی رزومه با اسکرول ساخته، نوشته، طراحی،
 * انگلیسی، چیده و فرستاده می‌شود؛ بعد اعداد، رسید رایگان‌بودن، پرسش‌ها، دعوت پایانی و واژه‌ی «برگ».
 * پیش‌فرض تیره است و لامپ بالای صفحه روشنش می‌کند. این رنگ‌ها فقط مال همین صفحه‌اند و به رزومه‌ساز کاری ندارند.
 */
export default function Intro() {
  const root = useRef<HTMLDivElement>(null)
  const theme = useLanding((state) => state.theme)
  useScrollScenes(root)

  useEffect(() => {
    document.title = 'برگ | رزومه‌ساز فارسی'
  }, [])

  const skipToContent = () => {
    const main = document.getElementById('main')
    main?.focus()
    main?.scrollIntoView()
  }

  return (
    <div ref={root} data-theme={theme} className="landing relative isolate overflow-x-clip bg-l-bg text-l-ink transition-colors duration-[.4s]">
      <GraphiteFilters />
      <LandingBackground />
      <button
        type="button"
        onClick={skipToContent}
        className="fixed start-4 top-2.5 z-100 -translate-y-[160%] rounded-md bg-l-ink px-3.5 py-2.5 text-sm font-bold text-l-bg transition-transform focus:translate-y-0"
      >
        رفتن به محتوا
      </button>
      <LandingHeader />
      <ThemeCord />
      <main id="main" tabIndex={-1} className="relative outline-none">
        <Hero />
        <Write />
        <Design />
        <Language />
        <Arrange />
        <Export />
        <Numbers />
        <Support />
        <Faq />
        <Closing />
        <EndMark />
      </main>
    </div>
  )
}
