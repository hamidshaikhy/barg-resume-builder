import type { ReactNode } from 'react'

/*
 * طرح‌های مدادی کنار صحنه‌ها. همه با خط کشیده شده‌اند و رنگشان currentColor است؛ صافی «graphite» که یک بار در
 * ریشه‌ی صفحه تعریف می‌شود لرزش دست را به خط‌ها می‌دهد و هر خط یک بار دیگر، کمی جابه‌جا و کم‌رنگ، تکرار می‌شود.
 */

const stroke = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' } as const

/** خط‌ها را دو بار می‌کشد، دومی کمی جابه‌جا و کم‌رنگ، مثل مدادی که دو بار روی خط رفته. */
function Sketch({ children, width = 2 }: { children: ReactNode; width?: number }) {
  return (
    <g {...stroke} strokeWidth={width} filter="url(#l-graphite)">
      <g>{children}</g>
      <g transform="translate(1.1 .8)" opacity=".38">
        {children}
      </g>
    </g>
  )
}

/** هاشور: خط‌های کوتاه موازی برای سایه. */
function Hatch({ x1, x2, y, length, slant = 4, step = 5, opacity = 0.45 }: { x1: number; x2: number; y: number; length: number; slant?: number; step?: number; opacity?: number }) {
  const lines = []
  for (let x = x1; x <= x2; x += step) lines.push(`M${x} ${y}l${slant} ${length}`)
  return <path d={lines.join('')} strokeWidth={1.1} opacity={opacity} />
}

/** تراشه‌ی مداد: دایره‌ای با لبه‌ی چین‌دار و پیچی در میانه. */
function Shaving({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const n = 14
  let d = ''
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2
    const rr = i % 2 ? r * 0.72 : r
    const x = cx + Math.cos(a) * rr
    const y = cy + Math.sin(a) * rr * 0.8
    d += i === 0 ? `M${x.toFixed(1)} ${y.toFixed(1)}` : `L${x.toFixed(1)} ${y.toFixed(1)}`
  }
  return (
    <>
      <path d={d} />
      <path d={`M${cx} ${cy}c${r * 0.3} -${r * 0.3} ${r * 0.5} ${r * 0.2} ${r * 0.1} ${r * 0.35}`} strokeWidth={1.2} />
    </>
  )
}

function Pencil() {
  return (
    <svg viewBox="0 0 240 250">
      <Sketch>
        <g transform="rotate(125 120 120)">
          <path d="M40 109H28q-8 0-8 8v6q0 8 8 8h12" />
          <path d="M40 108h18v24H40z" />
          <path d="M45 108v24M50 108v24M54 108v24" strokeWidth={1.2} opacity=".7" />
          <path d="M58 109h122M58 131h122" />
          <path d="M58 116.3h122M58 123.7h122" strokeWidth={1.2} opacity=".55" />
          <Hatch x1={62} x2={174} y={124.5} length={6} slant={3} step={5} />
          <path d="M180 109l38 11-38 11" />
          <path d="M180 109q5 3.7 0 7.3q5 3.7 0 7.4q5 3.6 0 7.3" strokeWidth={1.3} />
          <path d="M206 116.6 218 120l-12 3.4q-2-3.4 0-6.8z" fill="currentColor" />
          <Hatch x1={186} x2={202} y={122} length={6} slant={2} step={4} opacity={0.35} />
        </g>
        <Shaving cx={128} cy={214} r={13} />
        <Shaving cx={160} cy={196} r={9} />
        <Shaving cx={150} cy={232} r={7} />
      </Sketch>
    </svg>
  )
}

function Paperclip() {
  const clip = 'M100 70V170a16 16 0 0 0 32 0V50a24 24 0 0 0-48 0V180a32 32 0 0 0 64 0V80'
  return (
    <svg viewBox="0 0 240 240">
      <Sketch>
        <path d={clip} transform="rotate(-28 116 120) translate(-30 4)" />
        <path d={clip} transform="rotate(14 116 120) translate(34 10)" />
      </Sketch>
    </svg>
  )
}

function Eraser() {
  return (
    <svg viewBox="0 0 240 230">
      <Sketch>
        <path d="M40 110 150 70l50 30-110 40z" />
        <path d="M40 110v34l50 30v-34M90 174l110-40v-34" />
        <path d="M95 90l50 30v34" strokeWidth={1.4} />
        <path d="M65 125v34" strokeWidth={1.2} opacity=".6" />
        <Hatch x1={150} x2={194} y={122} length={22} slant={-3} step={5} />
        <Hatch x1={44} x2={86} y={128} length={20} slant={2} step={6} opacity={0.3} />
        <path d="M210 160a3 3 0 1 0 .1 0M222 150a2 2 0 1 0 .1 0M198 176a2.5 2.5 0 1 0 .1 0M226 172a1.6 1.6 0 1 0 .1 0" strokeWidth={1.4} />
      </Sketch>
    </svg>
  )
}

function Curve() {
  const ticks = []
  for (let x = 16; x <= 226; x += 7) ticks.push(`M${x} 0v${(x - 16) % 35 === 0 ? 13 : 7}`)
  return (
    <svg viewBox="0 0 250 240">
      <Sketch>
        <path d="M40 200C30 140 70 70 130 60s90 30 70 70c-15 30-50 20-60 45s20 45-20 53-72 0-80-28z" />
        <path d="M46 198C38 144 74 78 130 68s82 28 64 62c-14 26-48 20-58 44" strokeWidth={1.1} opacity=".45" />
        <path d="M100 110c20-20 60-20 70 0-10 15-50 15-70 0z" />
        <path d="M80 190c0-20 25-25 30-5-2 15-25 20-30 5z" />
        <g transform="translate(6 92) rotate(-20 120 17)">
          <path d="M10 0h230v34H10z" />
          <path d={ticks.join('')} strokeWidth={1.2} />
          <path d="M14 28h222" strokeWidth={1} opacity=".4" />
        </g>
      </Sketch>
    </svg>
  )
}

function Globe() {
  return (
    <svg viewBox="0 0 240 240">
      <Sketch>
        <g transform="rotate(-18 120 110)">
          <circle cx="120" cy="110" r="62" />
          <ellipse cx="120" cy="110" rx="22" ry="62" strokeWidth={1.4} />
          <ellipse cx="120" cy="110" rx="44" ry="62" strokeWidth={1.4} />
          <path d="M58 110q62 12 124 0M66 79q54 9 108 0M66 141q54 9 108 0" strokeWidth={1.4} />
          <path d="M84 88c10-8 22-4 26 4s-6 14-2 22-14 10-20 2-12-20-4-28zM138 120c8-4 20 0 18 10s-12 14-18 8-6-14 0-18z" strokeWidth={1.3} />
          <Hatch x1={88} x2={104} y={92} length={18} slant={3} step={4} opacity={0.4} />
        </g>
        <path d="M44 150a78 78 0 0 0 150-70" />
        <path d="M120 188v18M86 214q34-14 68 0" />
      </Sketch>
    </svg>
  )
}

function Scissors() {
  return (
    <svg viewBox="0 0 250 250">
      <Sketch>
        <path d="M104 124 222 38l-104 96z" />
        <path d="M100 114l128-40-114 54z" />
        <circle cx="110" cy="122" r="4" />
        <path d="M104 128 74 160M114 130l-20 52" />
        <ellipse cx="56" cy="174" rx="26" ry="18" transform="rotate(-32 56 174)" />
        <ellipse cx="86" cy="204" rx="24" ry="17" transform="rotate(-12 86 204)" />
        <Hatch x1={150} x2={206} y={60} length={10} slant={-6} step={7} opacity={0.35} />
        <ellipse cx="186" cy="182" rx="22" ry="7" />
        <path d="M164 182v38M208 182v38" />
        <ellipse cx="186" cy="220" rx="22" ry="7" />
        <path d="M166 192q20 6 40 0M166 200q20 6 40 0M166 208q20 6 40 0" strokeWidth={1.1} opacity=".6" />
        <path d="M164 214c-30 10-40-20-60-6s-10 30-30 30" strokeWidth={1.2} />
      </Sketch>
    </svg>
  )
}

function Plane() {
  return (
    <svg viewBox="0 0 240 240">
      <Sketch>
        <path d="M40 100 220 30 110 115z" />
        <path d="M110 115 220 30l-80 105z" />
        <path d="M110 115 95 165l45-30" />
        <Hatch x1={100} x2={130} y={128} length={18} slant={-4} step={5} />
        <path d="M95 168c-15 22-45 32-55 17s10-35 22-20 8 40-12 57-50 9-60-6" strokeDasharray="6 7" strokeWidth={1.6} />
      </Sketch>
    </svg>
  )
}

function Jar() {
  return (
    <svg viewBox="0 0 240 240">
      <Sketch>
        <path d="M70 40h100v18H70z" />
        <path d="M76 44v10M84 44v10M92 44v10M100 44v10M108 44v10M116 44v10M124 44v10M132 44v10M140 44v10M148 44v10M156 44v10M164 44v10" strokeWidth={1} opacity=".6" />
        <path d="M78 58c-18 12-22 26-22 42v96q0 18 18 18h92q18 0 18-18v-96c0-16-4-30-22-42" />
        <path d="M70 100v80" strokeWidth={1.4} opacity=".55" />
        <path d="M84 112h72v38H84z" strokeWidth={1.4} />
        <path d="M94 124h50M94 136h34" strokeWidth={1.2} opacity=".6" />
        <ellipse cx="102" cy="200" rx="14" ry="5" />
        <ellipse cx="134" cy="203" rx="14" ry="5" />
        <ellipse cx="156" cy="194" rx="13" ry="5" />
        <ellipse cx="118" cy="188" rx="14" ry="5" />
        <circle cx="196" cy="22" r="10" />
        <path d="M196 16v12" strokeWidth={1.2} />
      </Sketch>
    </svg>
  )
}

function Note() {
  return (
    <svg viewBox="0 0 240 240">
      <Sketch>
        <path d="M50 40h140v130l-30 30H50z" />
        <path d="M190 170h-30v30" />
        <path d="M70 80h100M70 105h94M70 130h80M70 155h60" strokeWidth={1.3} opacity=".7" />
        <path d="M92 26l58 8-3 20-58-8z" strokeWidth={1.3} />
        <Hatch x1={94} x2={142} y={32} length={14} slant={-2} step={5} opacity={0.4} />
      </Sketch>
    </svg>
  )
}

function Leaf() {
  return (
    <svg viewBox="0 0 240 240">
      <Sketch>
        <path d="M40 200C30 120 90 50 200 40c0 80-60 160-160 160z" />
        <path d="M40 200C90 150 150 90 196 44" />
        <path d="M70 170c-6-20-4-40 4-52M70 170c20 4 40 2 56-6M100 140c-4-22 0-42 10-56M100 140c22 2 42-4 58-14M132 106c-2-16 2-30 10-42M132 106c16 0 32-6 44-14" strokeWidth={1.3} />
        <path d="M40 200 20 224" />
      </Sketch>
    </svg>
  )
}

export const doodles = {
  pencil: Pencil,
  paperclip: Paperclip,
  eraser: Eraser,
  curve: Curve,
  globe: Globe,
  scissors: Scissors,
  plane: Plane,
  jar: Jar,
  note: Note,
  leaf: Leaf,
}

export type DoodleName = keyof typeof doodles

/** صافی‌های مدادی، یک بار در ریشه‌ی صفحه. */
export function GraphiteFilters() {
  return (
    <svg aria-hidden="true" width="0" height="0" className="absolute">
      <filter id="l-graphite" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves={2} seed={3} />
        <feDisplacementMap in="SourceGraphic" scale={3} />
      </filter>
      <filter id="l-pencil" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={2} seed={4} />
        <feDisplacementMap in="SourceGraphic" scale={3.5} />
      </filter>
    </svg>
  )
}
