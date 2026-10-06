import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cx } from '@/lib/text'

/* ---------- دکمه ---------- */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

const buttonStyles: Record<ButtonVariant, string> = {
  primary: 'bg-ink text-white hover:bg-ink-2 disabled:bg-faint',
  secondary: 'bg-surface text-ink border border-line hover:border-faint hover:bg-paper/60',
  ghost: 'text-ink-2 hover:bg-paper',
  danger: 'text-danger hover:bg-danger/8',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: 'sm' | 'md'
}

export function Button({ variant = 'secondary', size = 'md', className, type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        'inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60',
        size === 'sm' ? 'h-8 px-3 text-[13px]' : 'h-10 px-4 text-sm',
        buttonStyles[variant],
        className,
      )}
      {...rest}
    />
  )
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  active?: boolean
}

export function IconButton({ label, active, className, type = 'button', children, ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cx(
        'inline-flex size-8 shrink-0 items-center justify-center rounded-md transition-colors disabled:opacity-35',
        active ? 'bg-brand-soft text-brand' : 'text-muted hover:bg-paper hover:text-ink',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

/* ---------- فیلدهای فرم ---------- */

const controlClass =
  'w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink placeholder:text-faint transition-colors hover:border-faint focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15'

export function Field({
  label,
  htmlFor,
  wide,
  hint,
  children,
}: {
  label: string
  htmlFor?: string
  wide?: boolean
  hint?: string
  children: ReactNode
}) {
  return (
    <div className={cx('min-w-0', wide && 'sm:col-span-2')}>
      <label htmlFor={htmlFor} className="mb-1 block text-[13px] font-medium text-ink-2">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs leading-5 text-muted">{hint}</p>}
    </div>
  )
}

export function TextInput({ className, dir = 'auto', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input dir={dir} className={cx(controlClass, 'h-10', className)} {...rest} />
}

/** ناحیه‌ی متنی که با محتوا بلند می‌شود. */
export function TextArea({ className, value, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight + 2}px`
  }, [value])
  return (
    <textarea
      ref={ref}
      dir="auto"
      rows={3}
      value={value}
      className={cx(controlClass, 'resize-none py-2 leading-7', className)}
      {...rest}
    />
  )
}

export function Select({
  value,
  onChange,
  options,
  id,
  className,
}: {
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  id?: string
  className?: string
}) {
  return (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={cx(controlClass, 'h-10 pe-8', className)}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

/** ورودی متنی با فهرست پیشنهاد؛ مقدار آزاد هم پذیرفته می‌شود. */
export function ComboInput({
  id,
  value,
  onChange,
  options,
  placeholder,
}: {
  id?: string
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
}) {
  const listId = useId()
  return (
    <>
      <TextInput id={id} list={listId} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      <datalist id={listId}>
        {options.map((o) => (
          <option key={o} value={o} />
        ))}
      </datalist>
    </>
  )
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 py-1.5 text-sm text-ink-2">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cx(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors',
          checked ? 'bg-brand' : 'bg-line hover:bg-faint/60',
        )}
      >
        <span
          className={cx(
            'absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-[inset-inline-start]',
            checked ? 'start-[22px]' : 'start-0.5',
          )}
        />
      </button>
    </label>
  )
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T
  onChange: (value: T) => void
  options: Array<{ value: T; label: string }>
  label: string
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-lg bg-paper p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cx(
            'h-8 min-w-0 flex-1 truncate rounded-md px-2 text-[13px] transition-colors',
            value === o.value ? 'bg-surface font-semibold text-ink shadow-sm' : 'text-muted hover:text-ink',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/** ورودی برچسب: با Enter یا ویرگول اضافه و با Backspace حذف می‌شود. */
export function TagsInput({
  id,
  value,
  onChange,
  placeholder,
}: {
  id?: string
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}) {
  const [draft, setDraft] = useState('')
  const commit = (raw: string) => {
    const parts = raw
      .split(/[,،\n]/)
      .map((p) => p.trim())
      .filter(Boolean)
    if (parts.length) onChange([...value, ...parts.filter((p) => !value.includes(p))])
    setDraft('')
  }
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      commit(draft)
    } else if (e.key === 'Backspace' && !draft && value.length) {
      onChange(value.slice(0, -1))
    }
  }
  return (
    <div
      className={cx(
        controlClass,
        'flex min-h-10 flex-wrap items-center gap-1.5 py-1.5 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15',
      )}
    >
      {value.map((tag, i) => (
        <span key={`${tag}-${i}`} className="inline-flex items-center gap-1 rounded-md bg-paper py-0.5 ps-2 pe-1 text-[13px]" dir="auto">
          {tag}
          <button
            type="button"
            aria-label={`حذف ${tag}`}
            onClick={() => onChange(value.filter((_, j) => j !== i))}
            className="rounded p-0.5 text-muted hover:bg-line hover:text-ink"
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      <input
        id={id}
        dir="auto"
        value={draft}
        placeholder={value.length ? '' : placeholder}
        onChange={(e) => (/[,،]/.test(e.target.value) ? commit(e.target.value) : setDraft(e.target.value))}
        onKeyDown={onKeyDown}
        onBlur={() => draft.trim() && commit(draft)}
        className="h-7 min-w-24 flex-1 bg-transparent text-sm outline-none placeholder:text-faint"
      />
    </div>
  )
}

export function LevelInput({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex h-10 items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`سطح ${n} از ۵`}
          onClick={() => onChange(value === n ? 0 : n)}
          className={cx(
            'size-5 rounded-full border-2 transition-colors',
            n <= value ? 'border-brand bg-brand' : 'border-line bg-surface hover:border-faint',
          )}
        />
      ))}
    </div>
  )
}

export function Range({
  id,
  value,
  min,
  max,
  step,
  onChange,
}: {
  id?: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
}) {
  return (
    <input
      id={id}
      type="range"
      dir="ltr"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="h-6 w-full accent-brand"
    />
  )
}

/* ---------- منو و پنجره ---------- */

/** منوی کشویی ساده که با کلیک بیرون یا Escape بسته می‌شود. */
export function Menu({
  trigger,
  children,
  align = 'end',
  width = 'w-64',
}: {
  trigger: (props: { onClick: () => void; 'aria-expanded': boolean }) => ReactNode
  children: (close: () => void) => ReactNode
  align?: 'start' | 'end'
  width?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: globalThis.KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])
  return (
    <div ref={ref} className="relative">
      {trigger({ onClick: () => setOpen((o) => !o), 'aria-expanded': open })}
      {open && (
        <div
          role="menu"
          className={cx(
            'absolute top-full z-40 mt-2 max-w-[calc(100vw-2rem)] rounded-xl border border-line bg-surface p-1.5 shadow-[0_12px_32px_-8px_rgba(17,26,46,0.25)]',
            width,
            align === 'end' ? 'end-0' : 'start-0',
          )}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  )
}

export function MenuItem({
  icon,
  title,
  note,
  onClick,
  danger,
  disabled,
}: {
  icon?: ReactNode
  title: string
  note?: string
  onClick: () => void
  danger?: boolean
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className={cx(
        'flex w-full items-start gap-3 rounded-lg px-3 py-2 text-start transition-colors disabled:opacity-50',
        danger ? 'text-danger hover:bg-danger/8' : 'text-ink hover:bg-paper',
      )}
    >
      {icon && <span className="mt-1 shrink-0 text-muted [&>svg]:size-4">{icon}</span>}
      <span className="min-w-0">
        <span className="block text-sm font-medium">{title}</span>
        {note && <span className="block text-xs leading-5 text-muted">{note}</span>}
      </span>
    </button>
  )
}

export function Dialog({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  wide?: boolean
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: globalThis.KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-0 sm:items-center sm:p-6" onPointerDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onPointerDown={(e) => e.stopPropagation()}
        className={cx(
          'flex max-h-[88dvh] w-full flex-col rounded-t-2xl bg-surface shadow-2xl sm:rounded-2xl',
          wide ? 'sm:max-w-3xl' : 'sm:max-w-md',
        )}
      >
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5">
          <h2 className="text-base font-bold">{title}</h2>
          <IconButton label="بستن" onClick={onClose}>
            <X className="size-4" />
          </IconButton>
        </div>
        <div className="thin-scroll min-h-0 overflow-y-auto p-5">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
