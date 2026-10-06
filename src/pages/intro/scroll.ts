import { useEffect, type RefObject } from 'react'
import { create } from 'zustand'

/** شماره‌ی data-scene هر بخش، به ترتیب صفحه. صحنه‌های ۰ تا ۵ سنجاق‌شده‌اند و بقیه عادی اسکرول می‌شوند. */
export const SCENE = {
  hero: 0,
  write: 1,
  design: 2,
  language: 3,
  arrange: 4,
  export: 5,
  numbers: 6,
  support: 7,
  faq: 8,
  end: 9,
} as const

export type Theme = 'dark' | 'light'

const THEME_KEY = 'barg:intro-theme'

function readTheme(): Theme {
  try {
    return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

/**
 * وضعیت درشت داستان. حرکت پیوسته هیچ‌وقت از React نمی‌گذرد: موتور پایین پیشرفت هر بخش را در --p می‌نویسد و
 * صحنه‌ها بقیه را با calc() می‌سازند. React فقط از گام‌ها باخبر می‌شود.
 */
interface LandingState {
  theme: Theme
  activeScene: number
  reducedMotion: boolean
  scrolled: boolean
  /** نوشتن: ۰ وقتی خط تایپ می‌شود، ۱ وقتی نکته باز است، ۲ وقتی بازنویسی پذیرفته شد. */
  writeStep: 0 | 1 | 2
  /** طراحی: قالبی که روی دسته است (۰ تا ۴). */
  designStep: number
  /** طراحی: نما دور شده و برگه‌های کوچک پیدا شده‌اند. */
  designZoomed: boolean
  /** زبان: پیشرفت جاروب، در ۴۰ گام. */
  langProgress: number
  /** چیدمان: چند بخش از چهار بخش به برگه وصل شده‌اند. */
  sectionCount: number
  /** خروجی: دکمه‌ها پیدا شده‌اند. */
  exportReady: boolean
  /** خروجی: آسمان شب بالاست، پس سرصفحه با جوهر روشن کشیده می‌شود. */
  night: boolean
  /** اعداد: به اندازه‌ی کافی دیده شده‌اند که رقم‌ها بچرخند. دیگر برنمی‌گردد. */
  numbersInView: boolean
}

export const useLanding = create<LandingState>()(() => ({
  theme: readTheme(),
  activeScene: SCENE.hero,
  reducedMotion: false,
  scrolled: false,
  writeStep: 0,
  designStep: 0,
  designZoomed: false,
  langProgress: 0,
  sectionCount: 0,
  exportReady: false,
  night: false,
  numbersInView: false,
}))

export function toggleTheme() {
  const theme: Theme = useLanding.getState().theme === 'dark' ? 'light' : 'dark'
  useLanding.setState({ theme })
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    // بدون حافظه‌ی مرورگر هم کار می‌کند؛ فقط انتخاب به خاطر نمی‌ماند.
  }
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))
const stepsPassed = (progress: number, thresholds: number[]) => thresholds.filter((at) => progress >= at).length

/**
 * پیشرفت یک بخش در نمایشگر، از ۰ تا ۱. صحنه‌ی سنجاق‌شده می‌شمارد صحنه‌ی چسبانش چقدر جلو رفته؛ بخش عادی می‌شمارد
 * چقدرش به دید آمده.
 */
function sectionProgress(top: number, height: number, viewportHeight: number, pinned: boolean) {
  if (pinned) return clamp01(-top / Math.max(1, height - viewportHeight))
  return clamp01((viewportHeight - top) / Math.max(1, Math.min(height, viewportHeight)))
}

const reducedMotionQuery = '(prefers-reduced-motion: reduce)'

export const prefersReducedMotion = () => window.matchMedia(reducedMotionQuery).matches

/** اسکرول تا نقطه‌ای درون یک صحنه؛ مثلاً at = 0.93 برای پایان صحنه‌ی نوشتن. */
export function goToScene(index: number, at: number) {
  const section = document.querySelector<HTMLElement>(`[data-scene="${index}"]`)
  if (!section) return
  const rect = section.getBoundingClientRect()
  const top = rect.top + window.scrollY + at * Math.max(0, rect.height - window.innerHeight)
  window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
}

/** نخ‌های صحنه‌ی چیدمان را از هر بخشِ فهرست تا تیترش روی برگه می‌کشد، در فضای SVG نخ‌ها. */
function drawThreads(section: HTMLElement) {
  const svg = section.querySelector<SVGSVGElement>('[data-threads]')
  if (!svg) return
  const origin = svg.getBoundingClientRect()

  for (const path of svg.querySelectorAll<SVGPathElement>('[data-thread]')) {
    const key = path.dataset.thread
    const from = section.querySelector(`[data-posting-keyword="${key}"]`)?.getBoundingClientRect()
    const to = section.querySelector(`[data-keyword="${key}"]`)?.getBoundingClientRect()
    if (!from || !to) continue

    const sideBySide = to.left > from.right || to.right < from.left
    if (sideBySide) {
      const leftToRight = to.left > from.right
      const x1 = (leftToRight ? from.right + 3 : from.left - 3) - origin.left
      const x2 = (leftToRight ? to.left - 3 : to.right + 3) - origin.left
      const y1 = from.top + from.height / 2 - origin.top
      const y2 = to.top + to.height / 2 - origin.top
      const mid = (x1 + x2) / 2
      path.setAttribute('d', `M${x1} ${y1} C${mid} ${y1} ${mid} ${y2} ${x2} ${y2}`)
    } else {
      const x1 = from.left + from.width / 2 - origin.left
      const x2 = to.left + to.width / 2 - origin.left
      const y1 = from.bottom + 2 - origin.top
      const y2 = to.top - 2 - origin.top
      const mid = (y1 + y2) / 2
      path.setAttribute('d', `M${x1} ${y1} C${x1} ${mid} ${x2} ${mid} ${x2} ${y2}`)
    }
  }
}

/**
 * موتور اسکرول: یک شنونده که با requestAnimationFrame کند می‌شود و --p را روی هر [data-scene] می‌نویسد، به‌علاوه‌ی
 * چند مقداری که به چیدمان نیاز دارند (مقیاس برگه‌های کوچک، مسیر ذره‌بین، نخ‌ها). نور دور نشانگر و جابه‌جایی
 * تکه‌های سرآغاز را هم با موس حرکت می‌دهد.
 */
export function useScrollScenes(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const container = root.current
    if (!container) return

    const reducedMotion = window.matchMedia(reducedMotionQuery)
    const sections = [...container.querySelectorAll<HTMLElement>('[data-scene]')]
    const sectionAt = (index: number) => sections.find((section) => section.dataset.scene === String(index))
    // نوشتن دوباره‌ی یک --p بی‌تغییر هم کل بخش را دوباره سبک‌دهی می‌کند، پس فقط تغییرها نوشته می‌شوند.
    const writtenProgress = new WeakMap<HTMLElement, string>()

    // مقدارهایی که فقط با اندازه‌ی پنجره عوض می‌شوند.
    const layout = () => {
      const design = sectionAt(SCENE.design)
      const stack = design?.querySelector<HTMLElement>('[data-stack]')
      if (!design || !stack) return
      const pageWidth = stack.offsetWidth || 1
      // پنج ستون و سه ردیف برگه‌ی A4 با فاصله‌ی ۰٫۱۲ برگه میانشان.
      const scale = Math.min((window.innerWidth * 0.94) / (5.48 * pageWidth), (window.innerHeight * 0.56) / (4.482 * pageWidth))
      design.style.setProperty('--smin', scale.toFixed(4))
    }

    let frame = 0
    let threadsDrawn = false

    const measure = () => {
      frame = 0
      const viewportHeight = window.innerHeight
      const reduced = reducedMotion.matches
      const progress: number[] = []
      let activeScene: number = SCENE.hero

      for (const section of sections) {
        const index = Number(section.dataset.scene)
        const rect = section.getBoundingClientRect()
        const pinned = section.dataset.pin !== undefined
        progress[index] = reduced ? 1 : sectionProgress(rect.top, rect.height, viewportHeight, pinned)
        if (rect.top <= viewportHeight / 2 && rect.bottom > viewportHeight / 2) activeScene = index
      }
      for (const section of sections) {
        const value = (progress[Number(section.dataset.scene)] ?? 0).toFixed(4)
        if (writtenProgress.get(section) === value) continue
        section.style.setProperty('--p', value)
        writtenProgress.set(section, value)
      }

      const [, write = 0, design = 0, language = 0, arrange = 0, exportP = 0, numbers = 0] = progress
      const scan = clamp01((language - 0.06) / 0.8)

      // ذره‌بین صحنه‌ی زبان مسیر لیساژو را پایین می‌رود، مگر اینکه نشانگر موس هدایتش کند.
      const langSection = sectionAt(SCENE.language)
      if (langSection && (reduced || langSection.dataset.lensHover === undefined)) {
        langSection.style.setProperty('--lx', `${(50 + 30 * Math.sin(scan * Math.PI * 2.5)).toFixed(2)}%`)
        langSection.style.setProperty('--ly', `${(14 + 72 * scan).toFixed(2)}%`)
      }

      // نخ‌ها جای واقعی واژه‌ها را دنبال می‌کنند، پس تا وقتی صحنه نزدیک است دوباره کشیده می‌شوند.
      const arrangeSection = sectionAt(SCENE.arrange)
      const nearArrange = activeScene >= SCENE.language && activeScene <= SCENE.export
      if (arrangeSection && (nearArrange || !threadsDrawn)) {
        drawThreads(arrangeSection)
        threadsDrawn = true
      }

      const state = useLanding.getState()
      const next: Partial<LandingState> = {
        activeScene,
        reducedMotion: reduced,
        scrolled: window.scrollY > 8,
        writeStep: write >= 0.84 ? 2 : write >= 0.4 ? 1 : 0,
        designStep: stepsPassed(design, [0.15, 0.31, 0.47, 0.63]),
        designZoomed: design >= 0.84,
        langProgress: Math.round(scan * 40) / 40,
        sectionCount: stepsPassed(arrange, [0.19, 0.31, 0.43, 0.55]),
        exportReady: exportP >= 0.66,
        night: activeScene === SCENE.export && (reduced || (exportP > 0.06 && exportP < 0.93)),
        numbersInView: state.numbersInView || numbers > 0.2,
      }
      const changed = (Object.keys(next) as (keyof LandingState)[]).some((key) => next[key] !== state[key])
      if (changed) useLanding.setState(next)
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    const onResize = () => {
      layout()
      schedule()
    }

    // نشانگر موس نور دورش را همه‌جا حرکت می‌دهد و تکه‌ها و طرح‌های سرآغاز را تا وقتی سرآغاز دیده می‌شود.
    let pointerFrame = 0
    let pointer = { x: 0, y: 0 }
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      pointer = { x: event.clientX, y: event.clientY }
      if (pointerFrame) return
      pointerFrame = requestAnimationFrame(() => {
        pointerFrame = 0
        if (reducedMotion.matches) return
        const lamp = container.querySelector<HTMLElement>('[data-lamp]')
        lamp?.style.setProperty('--lx', `${pointer.x}px`)
        lamp?.style.setProperty('--ly', `${pointer.y}px`)
        const hero = sectionAt(SCENE.hero)
        if (hero && useLanding.getState().activeScene === SCENE.hero) {
          hero.style.setProperty('--mx', ((pointer.x / window.innerWidth) * 2 - 1).toFixed(3))
          hero.style.setProperty('--my', ((pointer.y / window.innerHeight) * 2 - 1).toFixed(3))
        }
      })
    }

    layout()
    measure()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', onResize)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    reducedMotion.addEventListener('change', schedule)
    // قلم‌های وب اندازه‌ی متن را عوض می‌کنند و واژه‌هایی که نخ‌ها به آن‌ها می‌رسند جابه‌جا می‌شوند.
    void document.fonts?.ready.then(onResize)

    return () => {
      cancelAnimationFrame(frame)
      cancelAnimationFrame(pointerFrame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onPointerMove)
      reducedMotion.removeEventListener('change', schedule)
    }
  }, [root])
}
