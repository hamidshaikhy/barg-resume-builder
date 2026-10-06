import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { siGithub } from 'simple-icons'
import { cx } from '@/lib/text'
import { doodles, type DoodleName } from './doodles'

export const GITHUB_URL = 'https://github.com/hamidshaikhy/barg-resume-builder'

export function GithubIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d={siGithub.path} />
    </svg>
  )
}

/** برچسب کوچک: سرتیتر بخش‌ها، شماره‌ی صحنه‌ها. */
export const labelClass = 'text-[12.5px] leading-[1.5] font-semibold'

/** متن خواندنی کنار صحنه‌ها، با قلم نسخ «مرکزی». */
export const proseClass = 'font-l-serif text-[19px] leading-[1.55] text-pretty min-[900px]:text-[clamp(20px,1.55vw,25px)]'

interface CtaLinkProps {
  size: 'header' | 'hero' | 'closing'
  className?: string
}

/** «ساخت رزومه»: تنها دعوت صفحه، در سرصفحه، سرآغاز و پایان. */
export function CtaLink({ size, className }: CtaLinkProps) {
  return (
    <Link
      to="/builder"
      className={cx(
        'inline-flex shrink-0 items-center rounded-full bg-l-accent font-bold text-l-on-accent transition-[background-color,transform] duration-150 hover:bg-l-accent-hover motion-safe:active:scale-[.97]',
        size === 'header' && 'h-[38px] px-4 text-sm',
        size === 'hero' && 'h-[54px] gap-2.5 px-6 text-base shadow-l-2',
        size === 'closing' && 'h-14 gap-2.5 px-7 text-[17px] shadow-l-2',
        className,
      )}
    >
      ساخت رزومه
      {size !== 'header' && <ArrowLeft className="size-5" aria-hidden="true" />}
    </Link>
  )
}

interface SceneCaptionProps {
  number: string
  title: string
  children: ReactNode
  /** پیوندی زیر جمله. */
  action?: ReactNode
  className?: string
}

/** زیرنویس صحنه‌های سنجاق‌شده: «۰۱ / نوشتن» بالای یکی دو جمله. */
export function SceneCaption({ number, title, children, action, className }: SceneCaptionProps) {
  return (
    <div className={cx('flex flex-col gap-2.5', className)}>
      <span className={cx(labelClass, 'text-l-accent-text')}>
        {number} / {title}
      </span>
      <p className={cx(proseClass, 'text-l-ink')}>{children}</p>
      {action}
    </div>
  )
}

interface DoodleProps {
  name: DoodleName
  /** پیشرفت کشیده‌شدن، معمولاً از --p بخش. */
  wipe: string
  className?: string
  style?: CSSProperties
}

/** یک طرح مدادی. تزئینی است؛ از صفحه‌خوان پنهان است و نشانگر را نمی‌گیرد. */
export function Doodle({ name, wipe, className, style }: DoodleProps) {
  const Drawing = doodles[name]
  return (
    <span aria-hidden="true" className={cx('doodle', className)} style={{ '--wipe': wipe, ...style } as CSSProperties}>
      <Drawing />
    </span>
  )
}

const segmenter = new Intl.Segmenter('fa', { granularity: 'grapheme' })

interface TypedTextProps {
  text: string
  /** متغیر CSS از ۰ تا ۱ که متن را تایپ می‌کند. */
  progress: string
  className?: string
  charClassName?: string
  charStyle?: (index: number) => CSSProperties | undefined
  /** هر حرف چقدر تند پیدا شود؛ بیشتر یعنی بیشتر شبیه زدن کلید. */
  rate?: number
}

/**
 * متنی که با بالا رفتن progress تایپ می‌شود. حرف‌ها تزئینی‌اند و با محتوای ساختگی کشیده می‌شوند؛ کل جمله یک بار و
 * پنهان در صفحه هست تا صفحه‌خوان آن را یک جمله بخواند. مرورگر حرف‌های فارسی را از روی مرز span‌ها هم به هم می‌چسباند.
 */
export function TypedText({ text, progress, className, charClassName, charStyle, rate }: TypedTextProps) {
  const characters = Array.from(segmenter.segment(text), (part) => part.segment)
  const style = { '--typed': `var(${progress})`, '--typed-rate': rate } as CSSProperties

  return (
    <span className={className} style={style}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {characters.map((character, index) => (
          <span
            key={index}
            data-char={character}
            className={cx('typed', charClassName)}
            style={{ '--f': (index / characters.length).toFixed(4), ...charStyle?.(index) } as CSSProperties}
          />
        ))}
      </span>
    </span>
  )
}

/** دکمه‌های کنار هم که یکی‌شان انتخاب است. */
export function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
  className,
  itemClassName,
}: {
  label: string
  value: T
  options: { value: T; label: ReactNode }[]
  onChange: (value: T) => void
  className?: string
  itemClassName?: (checked: boolean) => string
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cx('flex', className)}>
      {options.map((option) => {
        const checked = option.value === value
        return (
          <button
            key={String(option.value)}
            type="button"
            role="radio"
            aria-checked={checked}
            onClick={() => onChange(option.value)}
            className={cx('flex flex-none items-center gap-1.5 rounded-full text-sm font-medium transition-colors duration-300', itemClassName?.(checked))}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
