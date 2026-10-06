import { useEffect, useRef, useState } from 'react'
import { Logo } from '@/components/Logo'
import { cx } from '@/lib/text'
import { goToScene, prefersReducedMotion, SCENE, toggleTheme, useLanding } from './scroll'
import { CtaLink, GITHUB_URL, GithubIcon } from './ui'

/** جوهر سرصفحه در صحنه‌ی شب، در هر حالتی. */
const nightInk = 'text-[oklch(0.95_0.01_95)]'

const storyScenes = [
  { scene: SCENE.write, label: 'نوشتن' },
  { scene: SCENE.design, label: 'طراحی' },
  { scene: SCENE.language, label: 'زبان' },
  { scene: SCENE.arrange, label: 'چیدمان' },
  { scene: SCENE.export, label: 'خروجی' },
]

export function LandingHeader() {
  const scrolled = useLanding((state) => state.scrolled)
  const night = useLanding((state) => state.night)
  const theme = useLanding((state) => state.theme)
  const activeScene = useLanding((state) => state.activeScene)
  const lightInk = night || theme === 'dark'

  return (
    <header
      className={cx(
        'fixed inset-x-0 top-0 z-70 flex h-16 items-center gap-7 ps-(--gutter) pe-[calc(var(--gutter)+34px)] whitespace-nowrap transition-colors duration-[.4s]',
        night ? nightInk : 'text-l-ink',
      )}
    >
      <div
        aria-hidden="true"
        className={cx(
          'header-taper pointer-events-none absolute inset-x-0 top-0 -z-1 h-28 transition-opacity duration-[.4s]',
          scrolled && !night ? 'opacity-100' : 'opacity-0',
        )}
      />

      <button
        type="button"
        aria-label="برگ، بالای صفحه"
        onClick={() => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })}
        className="rounded-md [--logo-accent:var(--l-accent)]"
      >
        <Logo tone={lightInk ? 'light' : 'ink'} className="[&_span]:text-[26px]" />
      </button>

      <nav aria-label="بخش‌های معرفی" className="mx-auto hidden items-center gap-0.5 min-[960px]:flex">
        {storyScenes.map(({ scene, label }) => {
          const active = activeScene === scene
          return (
            <button
              key={scene}
              type="button"
              aria-current={active ? 'step' : undefined}
              onClick={() => goToScene(scene, 0.04)}
              className={cx(
                'flex h-[34px] items-center gap-[7px] rounded-full px-3 text-[13.5px] leading-none font-medium transition-colors duration-300',
                night
                  ? active
                    ? nightInk
                    : 'text-[oklch(0.95_0.01_95/.72)] hover:text-[oklch(0.95_0.01_95)]'
                  : active
                    ? 'text-l-ink'
                    : 'text-l-ink-3 hover:text-l-ink',
              )}
            >
              <span aria-hidden="true" className={cx('size-1.5 rounded-full transition-colors duration-300', active && 'bg-l-accent')} />
              {label}
            </button>
          )
        })}
      </nav>

      <div className="ms-auto flex items-center gap-2">
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          className="hidden h-[38px] items-center gap-2 rounded-md px-2.5 text-[13px] font-medium transition-colors hover:bg-l-hover lg:flex"
        >
          <GithubIcon className="size-[18px]" />
          گیت‌هاب
        </a>
        <CtaLink size="header" />
      </div>
    </header>
  )
}

/**
 * تنها کلید رنگ صفحه: یک بند با لامپی خطی که از گوشه‌ی بالا آویزان است. تا اولین بار کشیده نشده، هر چند ثانیه
 * تاب می‌خورد؛ در حالت تیره لامپ روشن است.
 */
export function ThemeCord() {
  const theme = useLanding((state) => state.theme)
  const night = useLanding((state) => state.night)
  const [pulling, setPulling] = useState(false)
  const [pulledOnce, setPulledOnce] = useState(false)
  const timeout = useRef(0)
  const lit = theme === 'dark'

  useEffect(() => () => window.clearTimeout(timeout.current), [])

  const pull = () => {
    setPulling(true)
    setPulledOnce(true)
    window.clearTimeout(timeout.current)
    // رنگ صفحه وقتی عوض می‌شود که بند به پایین کشیده شده.
    timeout.current = window.setTimeout(() => {
      setPulling(false)
      toggleTheme()
    }, 170)
  }

  const label = lit ? 'روشن کردن صفحه' : 'تاریک کردن صفحه'

  return (
    <button
      type="button"
      onClick={pull}
      aria-label={label}
      title={label}
      className={cx(
        'fixed end-[clamp(8px,1.2vw,18px)] top-0 z-72 flex w-[30px] origin-top flex-col items-center [transition:height_.45s_cubic-bezier(.3,1.7,.5,1),color_.4s]',
        pulling ? 'h-[124px]' : 'h-[92px] hover:h-[112px]',
        !pulledOnce && 'motion-safe:animate-l-swing',
        night || lit ? nightInk : 'text-l-ink',
      )}
    >
      <span aria-hidden="true" className="w-[1.5px] flex-1 bg-current opacity-50" />
      <svg aria-hidden="true" width="30" height="40" viewBox="0 0 30 40" className="flex-none overflow-visible">
        <circle
          cx="15"
          cy="22"
          r="16"
          className={cx('fill-[oklch(0.9_0.14_90)] blur-[6px] transition-opacity duration-500', lit ? 'opacity-40 motion-safe:animate-l-flicker' : 'opacity-0')}
        />
        <rect x="11.5" y="2" width="7" height="6" rx="1.2" fill="currentColor" opacity="0.75" />
        <path d="M11.8 5h6.4M11.8 7h6.4" strokeWidth="0.8" opacity="0.6" className="stroke-l-bg" />
        <path
          d="M11.5 8 C11.5 12 5 15 5 22 a10 10 0 0 0 20 0 C25 15 18.5 12 18.5 8 Z"
          stroke="currentColor"
          strokeWidth="1.3"
          className={cx('transition-[fill] duration-[.4s]', lit ? 'fill-[oklch(0.95_0.11_92)]' : 'fill-[color-mix(in_oklch,var(--l-bg)_60%,transparent)]')}
        />
        <path
          d="M12.5 10 V16 M17.5 10 V16 M12.5 16 c0 3 1 4 1.25 5 c.25-1 .5-2 1.25-2 c.75 0 1 1 1.25 2 c.25-1 1.25-2 1.25-5"
          fill="none"
          strokeWidth="1"
          strokeLinecap="round"
          className={lit ? 'stroke-[oklch(0.7_0.16_60)]' : 'stroke-current opacity-55'}
        />
      </svg>
    </button>
  )
}
