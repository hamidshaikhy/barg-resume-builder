import type { CSSProperties } from 'react'

/** مولد Park–Miller با بذر ثابت، تا ذره‌ها هر بار همان‌جا بنشینند. */
function seeded(seed: number) {
  let state = seed
  return () => {
    state = (state * 16807) % 2147483647
    return state / 2147483647
  }
}

const random = seeded(11)
const motes = Array.from({ length: 18 }, () => ({
  right: `${4 + random() * 50}%`,
  top: `${8 + random() * 74}%`,
  '--size': `${1.5 + random() * 2.4}px`,
  '--mote-duration': `${(16 + random() * 18).toFixed(1)}s`,
  '--mote-delay': `${(-random() * 34).toFixed(1)}s`,
  '--dx': `${-(20 + random() * 70)}px`,
  '--dy': `${-(70 + random() * 150)}px`,
}))

/**
 * میزی که برگه رویش است. در حالت تیره، نوری گرم دنبال نشانگر موس می‌آید. در حالت روشن، نور پنجره نفس می‌کشد، سایه‌ی
 * محوِ چهارچوب پنجره آرام جابه‌جا می‌شود و ذره‌های غبار در آن بالا می‌روند. با «کاهش حرکت» همه ساکن‌اند.
 */
export function LandingBackground() {
  return (
    <>
      <div
        data-lamp
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 opacity-0 transition-opacity duration-[.8s] dk:opacity-100"
        style={{
          background:
            'radial-gradient(circle 180px at var(--lx, 28%) var(--ly, 24%), oklch(0.96 0.03 90 / .07), transparent 70%), radial-gradient(circle 680px at var(--lx, 28%) var(--ly, 24%), oklch(0.93 0.02 90 / .075), transparent 70%)',
        }}
      />
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="transition-opacity duration-[.8s] dk:opacity-0">
          <div className="absolute -inset-[20%] bg-[radial-gradient(38%_34%_at_76%_20%,oklch(0.995_0.04_85/.8),transparent_72%)] motion-safe:animate-l-breathe" />
          <div className="window-shadow absolute -top-[30%] -right-[12%] h-[140%] w-[78%] motion-safe:animate-l-drift" />
        </div>
        {motes.map((style) => (
          <span
            key={style.right}
            className="absolute size-(--size) rounded-full bg-[oklch(0.5_0.04_80/.35)] opacity-0 motion-safe:animate-l-mote dk:bg-[oklch(0.9_0.06_80/.45)]"
            style={style as CSSProperties}
          />
        ))}
      </div>
    </>
  )
}
