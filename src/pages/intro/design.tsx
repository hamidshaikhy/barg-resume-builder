import type { CSSProperties } from 'react'
import { cx, toFaDigits } from '@/lib/text'
import { goToScene, SCENE, useLanding } from './scroll'
import { looks, Sheet } from './sheet'
import { Doodle, SceneCaption, Segmented } from './ui'

/** هر زبانه‌ی قالب صحنه را به کجا می‌برد: کمی پس از کشیده‌شدن آن قالب. */
const TEMPLATE_AT = [0.05, 0.2, 0.36, 0.52, 0.7]

interface Mini {
  template: string
  color: string
  accent: string
  banded?: boolean
  tinted?: boolean
  sidebar?: boolean
  sidebarEnd?: boolean
  centred?: boolean
  ruled?: boolean
  framed?: boolean
  wideName?: boolean
}

/**
 * برگه‌های کوچکی که صحنه در پایان به آن‌ها دور می‌شود: پانزده خانه، پنج در سه. خانه‌ی وسط برای دسته‌ی برگه‌های
 * بزرگ خالی می‌ماند که کوچک می‌شود و جایش می‌نشیند. هر کدام یکی از قالب‌های برگ است با یکی از رنگ‌بندی‌هایش.
 */
const minis: (Mini | null)[] = [
  { template: 'مدرن', color: 'نفتی', accent: '#0f5b66', banded: true, centred: true },
  { template: 'سربرگ', color: 'زمردی', accent: '#0e6245', tinted: true, ruled: true },
  { template: 'خط زمان', color: 'مسی', accent: '#9a4b1c', ruled: true },
  { template: 'قاب', color: 'برنزی', accent: '#7a5520', framed: true, centred: true },
  { template: 'دوستونه', color: 'زمردی', accent: '#0e6245', banded: true, sidebar: true, sidebarEnd: true },
  { template: 'آکادمیک', color: 'نیلی', accent: '#3b3486', ruled: true },
  { template: 'کلاسیک', color: 'سرمه‌ای', accent: '#1e3a5f', centred: true, ruled: true },
  null,
  { template: 'ستونی', color: 'زرشکی', accent: '#7b1e2b', sidebar: true },
  { template: 'مینیمال', color: 'نفتی', accent: '#0f5b66' },
  { template: 'مدیریتی', color: 'یشمی', accent: '#2e5339', wideName: true, ruled: true },
  { template: 'مدرن', color: 'لاجوردی', accent: '#1f4fb5', banded: true, centred: true },
  { template: 'سربرگ', color: 'بادمجانی', accent: '#55305f', tinted: true, ruled: true },
  { template: 'خط زمان', color: 'نیلی', accent: '#3b3486', sidebar: true, sidebarEnd: true },
  { template: 'قاب', color: 'سرمه‌ای', accent: '#1e3a5f', framed: true, centred: true },
]

const lines = 'bg-[repeating-linear-gradient(to_bottom,oklch(0.88_0.006_95)_0_1.6cqw,transparent_1.6cqw_4.2cqw)]'

function MiniPage({ mini }: { mini: Mini }) {
  const headerBg = mini.banded ? mini.accent : mini.tinted ? `color-mix(in oklch, ${mini.accent} 10%, white)` : undefined
  return (
    <div
      className="absolute inset-0 flex flex-col overflow-hidden rounded-[2px] bg-white shadow-l-paper [container-type:inline-size]"
      style={mini.framed ? { boxShadow: `inset 0 0 0 2.5cqw white, inset 0 0 0 3cqw ${mini.accent}` } : undefined}
    >
      <div
        className="flex flex-col gap-[2.6cqw] px-[9cqw] pt-[9cqw] pb-[6cqw]"
        style={{
          background: headerBg,
          alignItems: mini.centred ? 'center' : 'flex-start',
          borderBottom: mini.ruled ? `${mini.wideName ? 1.2 : 0.5}cqw solid ${mini.accent}` : undefined,
        }}
      >
        <span
          className="h-[5.5cqw] rounded-[1cqw]"
          style={{ width: mini.wideName ? '78%' : '52%', background: mini.banded ? '#fff' : 'oklch(0.3 0.01 95)' }}
        />
        <span className="h-[2.4cqw] w-[32%] rounded-[1cqw]" style={{ background: mini.banded ? 'oklch(1 0 0 / .7)' : mini.accent }} />
      </div>
      <div className="grid flex-1" style={{ gridTemplateColumns: mini.sidebar ? 'minmax(0,34fr) minmax(0,66fr)' : 'minmax(0,1fr)' }}>
        {mini.sidebar && (
          <div
            className="flex flex-col gap-[2.6cqw] px-[5cqw] py-[7cqw]"
            style={{ order: mini.sidebarEnd ? 2 : 0, background: `color-mix(in oklch, ${mini.accent} 9%, white)` }}
          >
            <div className={cx(lines, 'h-[26cqw]')} />
          </div>
        )}
        <div className="order-1 flex flex-col gap-[3cqw] px-[8cqw] py-[7cqw]">
          <span className="h-[2cqw] w-[30%] rounded-[1cqw]" style={{ background: mini.accent }} />
          <div className={cx(lines, 'h-[34cqw]')} />
          <span className="h-[2cqw] w-[26%] rounded-[1cqw]" style={{ background: mini.accent }} />
          <div className={cx(lines, 'h-[30cqw]')} />
        </div>
      </div>
    </div>
  )
}

const pageNumber = (value: number, name?: string) => `شماره‌ی ${toFaDigits(String(value).padStart(2, '0'))}${name ? ` · ${name}` : ''}`
const pageLabel = 'font-medium text-[calc(var(--pw)*.05)] leading-none text-l-ink-3 whitespace-nowrap'

/** تیتر «طراحی» در پنج قلم، هر کدام با کشیده‌شدن یک قالب. */
const titleLayers = [
  { className: 'font-l-serif text-[1.15em] font-semibold', style: { opacity: 'calc(1 - var(--w1))' } },
  { className: 'font-bold text-(--l-tone-1)', style: { opacity: 'calc(var(--w1) * (1 - var(--w2)))' } },
  { className: 'font-title text-(--l-tone-2)', style: { opacity: 'calc(var(--w2) * (1 - var(--w3)))' } },
  { className: 'font-l-sans font-extralight', style: { opacity: 'calc(var(--w3) * (1 - var(--w4)))' } },
  { className: 'font-black', style: { opacity: 'var(--w4)' } },
]

/**
 * ۰۲ طراحی. واژه‌ی «طراحی» با کشیده‌شدن پنج قالب روی برگه قلمش را عوض می‌کند و بعد صحنه دور می‌شود تا برگه‌های
 * کوچک همه‌ی قالب‌ها پیدا شوند. زبانه‌ها به کشیده‌شدن هر قالب می‌پرند.
 *
 * هر چه با اسکرول حرکت می‌کند لایه‌ی خودش را دارد (will-change) و کشیده‌شدن قالب‌ها لایه‌های بریده را جابه‌جا
 * می‌کند، نه clip-path را؛ وگرنه هر فریم کل صحنه دوباره رنگ می‌شود.
 */
export function Design() {
  const step = useLanding((state) => state.designStep)
  const zoomed = useLanding((state) => state.designZoomed)
  const active = useLanding((state) => state.activeScene === SCENE.design)

  return (
    <section
      id="design"
      data-scene={SCENE.design}
      data-pin
      aria-labelledby="design-title"
      className="relative h-[380vh] motion-reduce:h-svh min-[900px]:h-[440vh]"
    >
      <div className="design-stage sticky top-0 h-svh overflow-hidden">
        <Doodle
          name="curve"
          wipe="clamp(0, (var(--p) - .03) / .2, 1)"
          className="start-[78vw] top-[58vh] w-[16vw] translate-y-[calc(var(--p)*-50px)] rotate-[-8deg] max-[900px]:hidden"
          style={{ '--doodle-fade': 'calc(1 - var(--z))' } as CSSProperties}
        />

        <h2
          id="design-title"
          className="absolute inset-x-0 top-[10vh] h-[1.3em] translate-y-[calc(var(--z)*-10vh)] text-[15vw] text-l-ink opacity-[calc(1-var(--z))] will-change-[transform,opacity] min-[900px]:top-[6vh] min-[900px]:text-[clamp(64px,7.5vw,140px)]"
        >
          {titleLayers.map((layer, index) => (
            <span
              key={index}
              aria-hidden={index > 0 || undefined}
              className={cx('absolute inset-0 text-center leading-[1.3]', layer.className)}
              style={layer.style}
            >
              طراحی
            </span>
          ))}
        </h2>

        <div
          aria-hidden="true"
          className="design-zoom absolute top-(--dpt) left-1/2 grid grid-cols-[repeat(5,var(--pw))] gap-[calc(var(--pw)*.12)] opacity-(--z) will-change-[transform,opacity]"
        >
          {minis.map((mini, index) => (
            <div
              key={index}
              className={cx('design-mini relative aspect-[210/297]', !mini && 'invisible')}
              style={{ '--rise': `${30 + ((index * 37) % 60)}px` } as CSSProperties}
            >
              {mini && (
                <>
                  <MiniPage mini={mini} />
                  <span className={cx(pageLabel, 'absolute start-0 top-[calc(100%+10px)]')}>
                    {mini.template} · {mini.color}
                  </span>
                </>
              )}
            </div>
          ))}
        </div>

        <div data-stack className="design-zoom absolute top-(--dpt) left-1/2 aspect-[210/297] w-(--pw)">
          <div className="absolute inset-0 rounded-[2px] shadow-l-paper" />
          {looks.map((look, index) => (
            <div key={look.name} className="absolute inset-0" style={{ '--w': index === 0 ? 1 : `var(--w${index})` } as CSSProperties}>
              <div className="design-wipe-window">
                <div className="design-wipe-content">
                  <Sheet look={look} />
                </div>
              </div>
              {index > 0 && (
                <div aria-hidden="true" className="design-wipe-line">
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full rounded-full bg-l-ink px-[10px] py-[6px] text-[11.5px] leading-none font-semibold whitespace-nowrap text-l-bg">
                    {pageNumber(index + 1, look.name)}
                  </span>
                </div>
              )}
            </div>
          ))}
          <span aria-hidden="true" className={cx(pageLabel, 'absolute start-0 top-[calc(100%+10px)] opacity-(--z) will-change-[opacity]')}>
            {looks[step]?.name} · قالب اصلی
          </span>
        </div>

        <Segmented
          label="قالب‌ها"
          value={step}
          onChange={(value) => goToScene(SCENE.design, TEMPLATE_AT[value] ?? 0)}
          options={looks.map((look, index) => ({ value: index, label: look.name }))}
          className={cx(
            'absolute bottom-[5vh] left-1/2 max-w-[calc(100vw-2*var(--gutter))] -translate-x-1/2 gap-0.5 overflow-x-auto rounded-full border border-l-line bg-[color-mix(in_oklch,var(--l-surface)_85%,transparent)] p-1 whitespace-nowrap opacity-[calc(1-var(--z)*2)] backdrop-blur-[8px] [scrollbar-width:none] min-[900px]:bottom-[clamp(20px,5vh,44px)]',
            (!active || zoomed) && 'pointer-events-none',
          )}
          itemClassName={(checked) =>
            cx('h-8 px-3.5 min-[900px]:px-4', checked ? 'bg-l-ink text-l-bg' : 'text-l-ink-2 hover:text-l-ink')
          }
        />

        <SceneCaption
          number="۰۲"
          title="طراحی"
          className="absolute start-(--gutter) bottom-[clamp(20px,5vh,44px)] hidden max-w-[21em] opacity-[calc(1-var(--z)*2)] min-[1100px]:flex"
        >
          از ده قالب رسمی یکی را بردار و رنگ، قلم و فاصله‌ها را تنظیم کن. متن سر جایش می‌ماند؛ پس هر چند بار خواستی امتحان کن.
        </SceneCaption>

        <p className="pointer-events-none absolute inset-x-(--gutter) bottom-[7vh] translate-y-[calc((1-var(--z))*30px)] text-center text-[8vw] leading-[1.3] text-balance opacity-(--z) will-change-[transform,opacity] min-[900px]:bottom-[5vh] min-[900px]:text-[clamp(40px,4.6vw,84px)]">
          <span className="font-extralight text-l-ink">۱۰ قالب، ۶ رنگ برای هر کدام؛</span>{' '}
          <span className="font-l-serif text-[1.2em] font-medium text-l-accent-text">مال خودت کن</span>
        </p>
      </div>
    </section>
  )
}
