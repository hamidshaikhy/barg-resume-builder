import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ChevronDown, Copy, Eye, EyeOff, Plus } from 'lucide-react'
import { DragHandle, SortableList, type HandleProps } from '@/components/Sortable'
import { sectionIcons } from '@/components/sectionIcons'
import { Button, Field, IconButton, LevelInput, Segmented, TagsInput, TextArea, TextInput } from '@/components/ui'
import { cx, toFaDigits } from '@/lib/text'
import { sectionTitles } from '@/resume/i18n'
import { emptyItem, sectionDefs } from '@/resume/sections'
import { getTemplate } from '@/resume/templates'
import type { ColumnId, Item, Section, Settings, SkillDisplay } from '@/resume/types'
import { useResume } from '@/store/useResume'
import { DeleteButton, ItemField } from './fields'

/** پوسته‌ی مشترک کارت‌های تاشو در ستون ویرایشگر. */
export function Card({
  icon,
  title,
  badge,
  open,
  onToggle,
  handle,
  actions,
  dimmed,
  children,
}: {
  icon: ReactNode
  title: string
  badge?: string
  open: boolean
  onToggle: () => void
  handle?: HandleProps
  actions?: ReactNode
  dimmed?: boolean
  children: ReactNode
}) {
  const ref = useRef<HTMLElement>(null)
  const wasOpen = useRef(open)
  // کارتی که تازه باز شده به دید کاربر آورده می‌شود (مثلاً بخشی که همین حالا اضافه شده).
  useEffect(() => {
    if (open && !wasOpen.current) ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    wasOpen.current = open
  }, [open])

  return (
    <section ref={ref} className={cx('scroll-mt-3 rounded-xl border bg-surface transition-colors', open ? 'border-faint/70' : 'border-line')}>
      <div className="flex items-center gap-1 py-1.5 ps-1.5 pe-2">
        {handle ? <DragHandle handle={handle} label={`جابه‌جایی ${title}`} /> : <span className="w-6 shrink-0" />}
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className={cx('flex min-w-0 flex-1 items-center gap-2.5 rounded-md py-1.5 text-start', dimmed && 'opacity-50')}
        >
          <span className="shrink-0 text-muted [&>svg]:size-[18px]">{icon}</span>
          <span className="truncate text-sm font-semibold">{title}</span>
          {badge && <span className="shrink-0 rounded-full bg-paper px-2 text-xs leading-5 text-muted">{badge}</span>}
        </button>
        {actions}
        <IconButton label={open ? 'بستن' : 'بازکردن'} onClick={onToggle}>
          <ChevronDown className={cx('size-4 transition-transform', open && 'rotate-180')} />
        </IconButton>
      </div>
      {open && <div className="border-t border-line p-4">{children}</div>}
    </section>
  )
}

function ItemCard({
  section,
  item,
  settings,
  open,
  onToggle,
  handle,
}: {
  section: Section
  item: Item
  settings: Settings
  open: boolean
  onToggle: () => void
  handle: HandleProps
}) {
  const def = sectionDefs[section.kind]
  const updateItem = useResume((s) => s.updateItem)
  const removeItem = useResume((s) => s.removeItem)
  const duplicateItem = useResume((s) => s.duplicateItem)
  const update = (updater: (it: Item) => Item) => updateItem(section.id, item.id, updater)
  const heading = item.title.trim() || item.subtitle.trim() || `${def.itemName} بدون عنوان`

  return (
    <div className={cx('rounded-lg border', open ? 'border-faint/60 bg-surface' : 'border-line bg-paper/40')}>
      <div className="flex items-center gap-0.5 py-1 ps-1 pe-1.5">
        <DragHandle handle={handle} label={`جابه‌جایی ${heading}`} />
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className={cx('min-w-0 flex-1 py-1 text-start', !item.visible && 'opacity-50')}
        >
          <span className="block truncate text-[13px] font-semibold" dir="auto">
            {heading}
          </span>
          {item.title.trim() && item.subtitle.trim() && (
            <span className="block truncate text-xs text-muted" dir="auto">
              {item.subtitle}
            </span>
          )}
        </button>
        <IconButton
          label={item.visible ? 'پنهان‌کردن در رزومه' : 'نمایش در رزومه'}
          onClick={() => update((it) => ({ ...it, visible: !it.visible }))}
        >
          {item.visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
        </IconButton>
        <IconButton label="ساخت رونوشت" onClick={() => duplicateItem(section.id, item.id)}>
          <Copy className="size-4" />
        </IconButton>
        <DeleteButton label={`حذف ${def.itemName}`} onConfirm={() => removeItem(section.id, item.id)} />
        <IconButton label={open ? 'بستن' : 'ویرایش'} onClick={onToggle}>
          <ChevronDown className={cx('size-4 transition-transform', open && 'rotate-180')} />
        </IconButton>
      </div>
      {open && (
        <div className="grid gap-3 border-t border-line p-3 sm:grid-cols-2">
          {def.fields.map((f) => (
            <ItemField key={f.key} def={f} item={item} onChange={update} settings={settings} />
          ))}
        </div>
      )}
    </div>
  )
}

/** ردیف فشرده برای مهارت‌ها: نام، سطح و زیرمهارت‌های اختیاری. */
function SkillRow({ section, item, handle }: { section: Section; item: Item; handle: HandleProps }) {
  const updateItem = useResume((s) => s.updateItem)
  const removeItem = useResume((s) => s.removeItem)
  const [more, setMore] = useState(item.tags.length > 0)
  const update = (updater: (it: Item) => Item) => updateItem(section.id, item.id, updater)
  return (
    <div className="rounded-lg border border-line bg-paper/40 p-1.5">
      <div className="flex items-center gap-1.5">
        <DragHandle handle={handle} label={`جابه‌جایی ${item.title || 'مهارت'}`} />
        <TextInput
          aria-label="نام مهارت یا گروه"
          value={item.title}
          placeholder="نام مهارت"
          onChange={(e) => update((it) => ({ ...it, title: e.target.value }))}
          className="!h-9 min-w-0 flex-1"
        />
        <LevelInput label="سطح تسلط" value={item.level} onChange={(level) => update((it) => ({ ...it, level }))} />
        <IconButton label="زیرمهارت‌ها" active={more} onClick={() => setMore((m) => !m)}>
          <Plus className={cx('size-4 transition-transform', more && 'rotate-45')} />
        </IconButton>
        <DeleteButton label="حذف مهارت" onConfirm={() => removeItem(section.id, item.id)} />
      </div>
      {more && (
        <div className="mt-1.5 ps-7">
          <TagsInput
            value={item.tags}
            placeholder="زیرمهارت‌ها؛ با این کار نام بالا عنوان گروه می‌شود"
            onChange={(tags) => update((it) => ({ ...it, tags }))}
          />
        </div>
      )}
    </div>
  )
}

const displayOptions: Array<{ value: SkillDisplay; label: string }> = [
  { value: 'chips', label: 'برچسب' },
  { value: 'inline', label: 'پشت‌سرهم' },
  { value: 'list', label: 'فهرست' },
  { value: 'bars', label: 'نوار' },
  { value: 'dots', label: 'نقطه' },
]

export function SectionEditor({
  section,
  settings,
  open,
  onToggle,
  handle,
}: {
  section: Section
  settings: Settings
  open: boolean
  onToggle: () => void
  handle: HandleProps
}) {
  const def = sectionDefs[section.kind]
  const tpl = getTemplate(settings.template)
  const twoCol = tpl.layout === 'sidebar' || tpl.layout === 'split'
  const updateSection = useResume((s) => s.updateSection)
  const removeSection = useResume((s) => s.removeSection)
  const addItem = useResume((s) => s.addItem)
  const reorderItems = useResume((s) => s.reorderItems)
  // بخشِ تازه یک مورد خالی دارد؛ همان را باز نشان می‌دهیم تا بشود فوری نوشت.
  const [openItem, setOpenItem] = useState<string | null>(() => {
    const only = section.items.length === 1 ? section.items[0] : null
    return only && !only.title && !only.subtitle && !only.description ? only.id : null
  })

  const defaultTitle = sectionTitles[section.kind][settings.lang]
  const title = section.title.trim() || (section.kind === 'custom' ? 'بخش دلخواه' : def.name)
  const count = def.layout === 'text' ? '' : toFaDigits(section.items.length)

  const add = () => setOpenItem(addItem(section.id))

  return (
    <Card
      icon={sectionIcons[section.kind]}
      title={title}
      badge={count || undefined}
      open={open}
      onToggle={onToggle}
      handle={handle}
      dimmed={!section.visible}
      actions={
        <IconButton
          label={section.visible ? 'پنهان‌کردن بخش در رزومه' : 'نمایش بخش در رزومه'}
          onClick={() => updateSection(section.id, { visible: !section.visible })}
        >
          {section.visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
        </IconButton>
      }
    >
      <p className="mb-3 text-[13px] leading-6 text-muted">{def.hint}</p>

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <Field label="عنوان روی برگه">
          <TextInput value={section.title} placeholder={defaultTitle} onChange={(e) => updateSection(section.id, { title: e.target.value })} />
        </Field>
        {twoCol && (
          <Field label="جای بخش در قالب دوستونه">
            <Segmented<ColumnId>
              label="ستون"
              value={section.column}
              onChange={(column) => updateSection(section.id, { column })}
              options={[
                { value: 'main', label: 'ستون اصلی' },
                { value: 'side', label: 'ستون کناری' },
              ]}
            />
          </Field>
        )}
        {(def.layout === 'skills' || def.layout === 'tags') && (
          <Field label="شکل نمایش" wide>
            <Segmented<SkillDisplay>
              label="شکل نمایش"
              value={section.display}
              onChange={(display) => updateSection(section.id, { display })}
              options={def.layout === 'skills' ? displayOptions : displayOptions.slice(0, 3)}
            />
          </Field>
        )}
      </div>

      {def.layout === 'text' && (
        <Field label="متن خلاصه">
          <TextArea
            value={section.text}
            rows={5}
            placeholder="مثلاً: توسعه‌دهنده‌ی فرانت‌اند با سه سال تجربه در ساخت رابط‌های کاربری React …"
            onChange={(e) => updateSection(section.id, { text: e.target.value })}
          />
        </Field>
      )}

      {def.layout === 'tags' && (
        <Field label={`${def.itemName}‌ها`} hint="بنویس و Enter بزن. با Backspace آخرین مورد حذف می‌شود.">
          <TagsInput
            value={section.items.map((it) => it.title)}
            placeholder={def.fields[0]?.placeholder}
            onChange={(tags) => {
              const byTitle = new Map(section.items.map((it) => [it.title, it]))
              updateSection(section.id, { items: tags.map((t) => byTitle.get(t) ?? emptyItem({ title: t })) })
            }}
          />
        </Field>
      )}

      {def.layout === 'skills' && (
        <>
          <SortableList items={section.items} onReorder={(ids) => reorderItems(section.id, ids)} className="grid gap-1.5">
            {(item, h) => <SkillRow section={section} item={item} handle={h} />}
          </SortableList>
          <Button variant="secondary" size="sm" onClick={() => addItem(section.id)} className="mt-3">
            <Plus className="size-4" />
            افزودن مهارت
          </Button>
        </>
      )}

      {def.layout !== 'text' && def.layout !== 'tags' && def.layout !== 'skills' && (
        <>
          {section.items.length === 0 && (
            <p className="rounded-lg border border-dashed border-line px-3 py-4 text-center text-[13px] text-muted">
              هنوز چیزی اضافه نشده است. با دکمه‌ی زیر اولین {def.itemName} را بنویس.
            </p>
          )}
          <SortableList items={section.items} onReorder={(ids) => reorderItems(section.id, ids)} className="grid gap-2">
            {(item, h) => (
              <ItemCard
                section={section}
                item={item}
                settings={settings}
                handle={h}
                open={openItem === item.id}
                onToggle={() => setOpenItem(openItem === item.id ? null : item.id)}
              />
            )}
          </SortableList>
          <Button variant="secondary" size="sm" onClick={add} className="mt-3">
            <Plus className="size-4" />
            افزودن {def.itemName}
          </Button>
        </>
      )}

      <div className="mt-5 flex justify-end border-t border-line pt-3">
        <DeleteSection onConfirm={() => removeSection(section.id)} />
      </div>
    </Card>
  )
}

function DeleteSection({ onConfirm }: { onConfirm: () => void }) {
  const [armed, setArmed] = useState(false)
  return armed ? (
    <div className="flex items-center gap-2 text-[13px]">
      <span className="text-muted">این بخش و همه‌ی موردهایش حذف می‌شود.</span>
      <Button size="sm" variant="ghost" onClick={() => setArmed(false)}>
        انصراف
      </Button>
      <Button size="sm" className="!border-danger !bg-danger !text-white" onClick={onConfirm}>
        حذف بخش
      </Button>
    </div>
  ) : (
    <Button size="sm" variant="danger" onClick={() => setArmed(true)}>
      حذف این بخش
    </Button>
  )
}
