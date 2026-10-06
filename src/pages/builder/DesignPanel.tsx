import { useMemo, type ReactNode } from 'react'
import { Check } from 'lucide-react'
import { Field, Range, Segmented, Switch } from '@/components/ui'
import { cx, toFaDigits } from '@/lib/text'
import { ResumePages } from '@/resume/ResumePages'
import { colors, fonts, getTemplate, templates, type TemplateDef } from '@/resume/templates'
import type { Calendar, DigitMode, FontId, Lang, MarginId, PhotoShape, Resume } from '@/resume/types'
import { useResume } from '@/store/useResume'

const THUMB_SCALE = 0.235

/** پیش‌نمایش کوچک هر قالب با داده‌ی خود کاربر. */
function TemplateThumb({ tpl, resume, active, onPick }: { tpl: TemplateDef; resume: Resume; active: boolean; onPick: () => void }) {
  const preview = useMemo<Resume>(
    () => ({ ...resume, settings: { ...resume.settings, template: tpl.id, palette: 0, font: tpl.font } }),
    [resume, tpl],
  )
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={active}
      className={cx(
        'group rounded-xl border p-2 text-start transition-colors',
        active ? 'border-brand bg-brand-soft/50' : 'border-line hover:border-faint',
      )}
    >
      <div
        className="relative mx-auto overflow-hidden rounded-md border border-line bg-white"
        style={{ width: `calc(210mm * ${THUMB_SCALE})`, height: `calc(297mm * ${THUMB_SCALE})` }}
        aria-hidden="true"
      >
        <div
          dir="ltr"
          style={{ position: 'absolute', top: 0, left: 0, width: '210mm', transform: `scale(${THUMB_SCALE})`, transformOrigin: '0 0', pointerEvents: 'none' }}
        >
          <ResumePages resume={preview} maxPages={1} />
        </div>
        {active && (
          <span className="absolute end-1.5 top-1.5 inline-flex size-5 items-center justify-center rounded-full bg-brand text-white">
            <Check className="size-3" strokeWidth={3} />
          </span>
        )}
      </div>
      <div className="mt-2 px-1">
        <div className="text-sm font-bold">{tpl.name}</div>
        <div className="text-xs leading-5 text-muted">{tpl.description}</div>
      </div>
    </button>
  )
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-line pt-5 first:border-t-0 first:pt-0">
      <h3 className="mb-3 text-sm font-bold">{title}</h3>
      {children}
    </section>
  )
}

export function DesignPanel() {
  const resume = useResume((s) => s.resume)
  const setSettings = useResume((s) => s.setSettings)
  const setTemplate = useResume((s) => s.setTemplate)
  const { settings } = resume
  const tpl = getTemplate(settings.template)

  return (
    <div className="grid gap-6">
      <Group title="قالب">
        <div className="grid grid-cols-2 gap-2.5">
          {templates.map((t) => (
            <TemplateThumb key={t.id} tpl={t} resume={resume} active={t.id === tpl.id} onPick={() => setTemplate(t.id)} />
          ))}
        </div>
      </Group>

      <Group title={`رنگ‌بندی قالب ${tpl.name}`}>
        <div role="radiogroup" aria-label="رنگ‌بندی" className="grid grid-cols-3 gap-2">
          {tpl.palettes.map((id, i) => {
            const c = colors[id]
            const on = settings.palette === i
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setSettings({ palette: i })}
                className={cx(
                  'flex items-center gap-2 rounded-lg border px-2.5 py-2 text-[13px] transition-colors',
                  on ? 'border-ink bg-paper/70 font-semibold' : 'border-line hover:border-faint',
                )}
              >
                <span className="size-5 shrink-0 rounded-full ring-1 ring-black/10" style={{ background: c.hex }} />
                <span className="truncate">{c.name}</span>
              </button>
            )
          })}
        </div>
        <p className="mt-2 text-xs leading-5 text-muted">رنگ فقط روی تیترها و خط‌ها می‌نشیند؛ برگه سفید و متن سیاه می‌ماند.</p>
      </Group>

      <Group title="قلم و فاصله‌ها">
        <div className="grid gap-4">
          <Field label="قلم">
            <Segmented<FontId>
              label="قلم"
              value={settings.font}
              onChange={(font) => setSettings({ font })}
              options={(Object.keys(fonts) as FontId[]).map((id) => ({ value: id, label: fonts[id].name }))}
            />
          </Field>
          <Field label={`اندازه‌ی قلم: ${toFaDigits(Math.round(settings.fontScale * 100))}٪`} htmlFor="d-size">
            <Range id="d-size" min={0.85} max={1.2} step={0.05} value={settings.fontScale} onChange={(fontScale) => setSettings({ fontScale })} />
          </Field>
          <Field label={`فاصله‌ی خط‌ها: ${toFaDigits(settings.lineHeight.toFixed(2))}`} htmlFor="d-lh">
            <Range id="d-lh" min={1.4} max={2.1} step={0.05} value={settings.lineHeight} onChange={(lineHeight) => setSettings({ lineHeight })} />
          </Field>
          <Field label="حاشیه‌ی برگه">
            <Segmented<MarginId>
              label="حاشیه‌ی برگه"
              value={settings.margin}
              onChange={(margin) => setSettings({ margin })}
              options={[
                { value: 'compact', label: 'کم' },
                { value: 'normal', label: 'معمولی' },
                { value: 'relaxed', label: 'زیاد' },
              ]}
            />
          </Field>
        </div>
      </Group>

      <Group title="زبان و تاریخ">
        <div className="grid gap-4">
          <Field label="زبان رزومه" hint="جهت برگه و عنوان بخش‌ها با این گزینه عوض می‌شود؛ متن‌ها را خودت به همان زبان بنویس.">
            <Segmented<Lang>
              label="زبان رزومه"
              value={settings.lang}
              onChange={(lang) => setSettings({ lang, digits: lang === 'en' ? 'latin' : settings.digits })}
              options={[
                { value: 'fa', label: 'فارسی (راست‌به‌چپ)' },
                { value: 'en', label: 'English' },
              ]}
            />
          </Field>
          <Field label="تقویم تاریخ‌ها">
            <Segmented<Calendar>
              label="تقویم"
              value={settings.calendar}
              onChange={(calendar) => setSettings({ calendar })}
              options={[
                { value: 'jalali', label: 'شمسی' },
                { value: 'gregorian', label: 'میلادی' },
              ]}
            />
          </Field>
          <Field label="ارقام تاریخ‌ها">
            <Segmented<DigitMode>
              label="ارقام"
              value={settings.digits}
              onChange={(digits) => setSettings({ digits })}
              options={[
                { value: 'fa', label: '۱۲۳' },
                { value: 'latin', label: '123' },
              ]}
            />
          </Field>
        </div>
      </Group>

      <Group title="عکس و نشانه‌ها">
        <Switch label="نمایش عکس" checked={settings.showPhoto} onChange={(showPhoto) => setSettings({ showPhoto })} />
        {settings.showPhoto && (
          <div className="mt-1 mb-2">
            <Segmented<PhotoShape>
              label="شکل عکس"
              value={settings.photoShape}
              onChange={(photoShape) => setSettings({ photoShape })}
              options={[
                { value: 'circle', label: 'دایره' },
                { value: 'rounded', label: 'گوشه‌گرد' },
                { value: 'square', label: 'مربع' },
              ]}
            />
          </div>
        )}
        <Switch label="نشانه‌ی کنار راه‌های تماس" checked={settings.showIcons} onChange={(showIcons) => setSettings({ showIcons })} />
      </Group>
    </div>
  )
}
