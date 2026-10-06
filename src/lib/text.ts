import type { DigitMode } from '@/resume/types'

const FA = '۰۱۲۳۴۵۶۷۸۹'
const AR = '٠١٢٣٤٥٦٧٨٩'

export function toFaDigits(input: string | number): string {
  return String(input).replace(/\d/g, (d) => FA[Number(d)])
}

export function toLatinDigits(input: string): string {
  return input
    .replace(/[۰-۹]/g, (d) => String(FA.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(AR.indexOf(d)))
}

/** ارقام را به حالت خواسته‌شده برمی‌گرداند و بقیه‌ی متن را دست نمی‌زند. */
export function digits(input: string | number, mode: DigitMode): string {
  return mode === 'fa' ? toFaDigits(input) : toLatinDigits(String(input))
}

let counter = 0
export function uid(prefix = 'id'): string {
  counter += 1
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

/** نشانی را برای نمایش کوتاه می‌کند: بدون پروتکل و اسلش پایانی. */
export function prettyUrl(url: string): string {
  return url
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/$/, '')
}

export function hrefOf(url: string): string {
  const u = url.trim()
  if (!u) return ''
  if (/^(https?:|mailto:|tel:)/i.test(u)) return u
  return `https://${u}`
}

/** خط‌های توضیحات را به پاراگراف و بولت تفکیک می‌کند. */
export interface DescLine {
  bullet: boolean
  text: string
}

export function parseDescription(raw: string): DescLine[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const m = line.match(/^[-•*–▪◦]\s*(.*)$/)
      return m ? { bullet: true, text: m[1] } : { bullet: false, text: line }
    })
}

/** رنگ هگز را با سفید ترکیب می‌کند؛ amount سهم رنگ اصلی است (۰ تا ۱). */
export function tint(hex: string, amount: number): string {
  const h = hex.replace('#', '')
  const n = parseInt(
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h,
    16,
  )
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  const mix = (c: number) => Math.round(255 - (255 - c) * amount)
  return `#${[mix(r), mix(g), mix(b)].map((c) => c.toString(16).padStart(2, '0')).join('')}`
}
