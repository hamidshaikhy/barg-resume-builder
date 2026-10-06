import { useEffect, useId, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { ComboInput, Field, IconButton, LevelInput, Select, TagsInput, TextArea, TextInput } from '@/components/ui'
import { toLatinDigits } from '@/lib/text'
import { monthNames } from '@/resume/i18n'
import { CEFR, readField, writeField, type FieldDef } from '@/resume/sections'
import type { Item, PartialDate, Settings } from '@/resume/types'

function DateInput({
  id,
  value,
  onChange,
  settings,
  disabled,
  label,
}: {
  id?: string
  value: PartialDate
  onChange: (d: PartialDate) => void
  settings: Settings
  disabled?: boolean
  label: string
}) {
  const months = monthNames(settings.calendar, 'fa')
  return (
    <div className="flex gap-2" role="group" aria-label={label}>
      <Select
        id={id}
        value={value.m}
        onChange={(m) => onChange({ ...value, m })}
        options={[{ value: '', label: 'ماه' }, ...months.map((name, i) => ({ value: String(i + 1), label: name }))]}
        className={`min-w-0 flex-1 ${disabled ? 'pointer-events-none opacity-45' : ''}`}
      />
      <TextInput
        aria-label={`${label}، سال`}
        dir="ltr"
        inputMode="numeric"
        maxLength={4}
        disabled={disabled}
        placeholder={settings.calendar === 'jalali' ? '۱۴۰۳' : '2024'}
        value={value.y}
        onChange={(e) => onChange({ ...value, y: toLatinDigits(e.target.value).replace(/\D/g, '') })}
        className="w-24! shrink-0 text-center disabled:opacity-45"
      />
    </div>
  )
}

/** یک فیلد از تعریف بخش را برای یک مورد رسم می‌کند. */
export function ItemField({
  def,
  item,
  onChange,
  settings,
}: {
  def: FieldDef
  item: Item
  onChange: (updater: (item: Item) => Item) => void
  settings: Settings
}) {
  const id = useId()
  const set = (value: string) => onChange((it) => writeField(it, def.key, value))

  switch (def.type) {
    case 'textarea':
      return (
        <Field label={def.label} htmlFor={id} wide>
          <TextArea id={id} value={item.description} placeholder={def.placeholder} onChange={(e) => set(e.target.value)} />
        </Field>
      )
    case 'tags':
      return (
        <Field label={def.label} htmlFor={id} wide>
          <TagsInput id={id} value={item.tags} placeholder={def.placeholder} onChange={(tags) => onChange((it) => ({ ...it, tags }))} />
        </Field>
      )
    case 'level':
      return (
        <Field label={def.label}>
          <LevelInput label={def.label} value={item.level} onChange={(level) => onChange((it) => ({ ...it, level }))} />
        </Field>
      )
    case 'select':
      return (
        <Field label={def.label} htmlFor={id} wide={def.wide}>
          <ComboInput id={id} value={readField(item, def.key)} options={def.options ?? []} placeholder="انتخاب کن یا بنویس" onChange={set} />
        </Field>
      )
    case 'cefr':
      return (
        <Field label={def.label} htmlFor={id}>
          <Select
            id={id}
            value={readField(item, def.key)}
            onChange={set}
            options={[{ value: '', label: 'خالی' }, ...CEFR.map((c) => ({ value: c, label: c }))]}
          />
        </Field>
      )
    case 'date':
      return (
        <Field label={def.label} htmlFor={id}>
          <DateInput id={id} label={def.label} value={item.start} settings={settings} onChange={(start) => onChange((it) => ({ ...it, start }))} />
        </Field>
      )
    case 'dates':
      return (
        <div className="grid grid-cols-1 gap-3 sm:col-span-2">
          <Field label="شروع" htmlFor={id}>
            <DateInput id={id} label="شروع" value={item.start} settings={settings} onChange={(start) => onChange((it) => ({ ...it, start }))} />
          </Field>
          <Field label="پایان" htmlFor={`${id}-end`}>
            <DateInput
              id={`${id}-end`}
              label="پایان"
              value={item.end}
              settings={settings}
              disabled={item.current}
              onChange={(end) => onChange((it) => ({ ...it, end }))}
            />
          </Field>
          <label className="flex cursor-pointer items-center gap-2 text-[13px] text-ink-2">
            <input
              type="checkbox"
              checked={item.current}
              onChange={(e) => onChange((it) => ({ ...it, current: e.target.checked }))}
              className="size-4 accent-brand"
            />
            هنوز ادامه دارد
          </label>
        </div>
      )
    case 'url':
      return (
        <Field label={def.label} htmlFor={id} wide>
          <TextInput id={id} dir="ltr" inputMode="url" value={readField(item, def.key)} placeholder={def.placeholder} onChange={(e) => set(e.target.value)} />
        </Field>
      )
    default:
      return (
        <Field label={def.label} htmlFor={id} wide={def.wide}>
          <TextInput id={id} value={readField(item, def.key)} placeholder={def.placeholder} onChange={(e) => set(e.target.value)} />
        </Field>
      )
  }
}

/** دکمه‌ی حذف دومرحله‌ای: کلیک اول تأیید می‌خواهد، کلیک دوم حذف می‌کند. */
export function DeleteButton({ label, onConfirm }: { label: string; onConfirm: () => void }) {
  const [armed, setArmed] = useState(false)
  useEffect(() => {
    if (!armed) return
    const t = setTimeout(() => setArmed(false), 3000)
    return () => clearTimeout(t)
  }, [armed])
  if (armed) {
    return (
      <button
        type="button"
        onClick={onConfirm}
        className="h-8 shrink-0 rounded-md bg-danger px-2.5 text-xs font-semibold text-white"
      >
        حذف شود؟
      </button>
    )
  }
  return (
    <IconButton label={label} onClick={() => setArmed(true)} className="hover:!bg-danger/8 hover:!text-danger">
      <Trash2 className="size-4" />
    </IconButton>
  )
}
