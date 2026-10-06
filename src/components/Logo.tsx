import { cx } from '@/lib/text'

/** نشان «برگ»: یک برگه با گوشه‌ی تاخورده. */
export function Logo({ className, tone = 'ink' }: { className?: string; tone?: 'ink' | 'light' }) {
  return (
    <span className={cx('inline-flex items-center gap-2', className)}>
      <svg viewBox="0 0 24 28" className="h-7 w-6 shrink-0" aria-hidden="true">
        <path
          d="M3 1.5h11.5L21 8v17.5a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-23a1 1 0 0 1 1-1z"
          fill={tone === 'ink' ? '#fff' : 'transparent'}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M14.5 1.5V8H21" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M6.5 13.5h11M6.5 17.5h11M6.5 21.5h6" stroke="var(--logo-accent, #1f3fa8)" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
      <span className="font-title text-[28px] leading-none font-bold">برگ</span>
    </span>
  )
}
