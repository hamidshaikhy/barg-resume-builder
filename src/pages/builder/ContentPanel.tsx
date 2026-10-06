import { useRef, useState } from 'react'
import { Camera, Link2, Plus, Trash2, UserRound } from 'lucide-react'
import { SortableList } from '@/components/Sortable'
import { sectionIcons } from '@/components/sectionIcons'
import { Button, ComboInput, Dialog, Field, IconButton, Select, TextInput } from '@/components/ui'
import { cx, uid } from '@/lib/text'
import { networks } from '@/resume/icons'
import { sectionDefs, sectionOrder } from '@/resume/sections'
import type { SectionKind } from '@/resume/types'
import { useResume } from '@/store/useResume'
import { Card, SectionEditor } from './SectionEditor'

/** عکس را مربع می‌بُرد و کوچک می‌کند تا در حافظه‌ی مرورگر جا بگیرد. */
function readPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const size = 420
      const side = Math.min(img.naturalWidth, img.naturalHeight)
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('canvas'))
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, size, size)
      ctx.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, size, size)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.9))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('image'))
    }
    img.src = url
  })
}

function BasicsEditor() {
  const basics = useResume((s) => s.resume.basics)
  const setBasics = useResume((s) => s.setBasics)
  const fileRef = useRef<HTMLInputElement>(null)
  const [photoError, setPhotoError] = useState('')

  const onFile = async (file: File | undefined) => {
    if (!file) return
    try {
      setBasics({ photo: await readPhoto(file) })
      setPhotoError('')
    } catch {
      setPhotoError('این فایل خوانده نشد. یک عکس JPG یا PNG انتخاب کن.')
    }
  }

  const setCustom = (id: string, patch: { label?: string; value?: string }) =>
    setBasics({ custom: basics.custom.map((c) => (c.id === id ? { ...c, ...patch } : c)) })

  return (
    <div className="grid gap-5">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="group relative size-20 shrink-0 overflow-hidden rounded-full border border-dashed border-faint bg-paper text-muted hover:border-brand hover:text-brand"
          aria-label={basics.photo ? 'تغییر عکس' : 'افزودن عکس'}
        >
          {basics.photo ? (
            <img src={basics.photo} alt="" className="size-full object-cover" />
          ) : (
            <Camera className="mx-auto size-6" />
          )}
        </button>
        <div className="min-w-0 text-[13px] leading-6 text-muted">
          <p>عکس اختیاری است و فقط روی همین مرورگر ذخیره می‌شود.</p>
          <div className="mt-1 flex gap-2">
            <Button size="sm" onClick={() => fileRef.current?.click()}>
              {basics.photo ? 'تغییر عکس' : 'انتخاب عکس'}
            </Button>
            {basics.photo && (
              <Button size="sm" variant="danger" onClick={() => setBasics({ photo: '' })}>
                حذف عکس
              </Button>
            )}
          </div>
          {photoError && <p className="mt-1 text-danger">{photoError}</p>}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            void onFile(e.target.files?.[0])
            e.target.value = ''
          }}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="نام و نام خانوادگی" htmlFor="b-name">
          <TextInput id="b-name" value={basics.fullName} placeholder="نام کامل" onChange={(e) => setBasics({ fullName: e.target.value })} />
        </Field>
        <Field label="عنوان شغلی" htmlFor="b-headline">
          <TextInput
            id="b-headline"
            value={basics.headline}
            placeholder="توسعه‌دهنده‌ی فرانت‌اند"
            onChange={(e) => setBasics({ headline: e.target.value })}
          />
        </Field>
        <Field label="ایمیل" htmlFor="b-email">
          <TextInput id="b-email" dir="ltr" inputMode="email" value={basics.email} placeholder="name@example.com" onChange={(e) => setBasics({ email: e.target.value })} />
        </Field>
        <Field label="تلفن همراه" htmlFor="b-phone">
          <TextInput id="b-phone" dir="ltr" inputMode="tel" value={basics.phone} placeholder="۰۹۱۲ ۱۲۳ ۴۵۶۷" onChange={(e) => setBasics({ phone: e.target.value })} />
        </Field>
        <Field label="شهر محل سکونت" htmlFor="b-location">
          <TextInput id="b-location" value={basics.location} placeholder="تهران" onChange={(e) => setBasics({ location: e.target.value })} />
        </Field>
        <Field label="وب‌سایت" htmlFor="b-website">
          <TextInput id="b-website" dir="ltr" inputMode="url" value={basics.website} placeholder="example.com" onChange={(e) => setBasics({ website: e.target.value })} />
        </Field>
      </div>

      <div>
        <h3 className="mb-2 text-[13px] font-bold text-ink">مشخصات فردی</h3>
        <p className="mb-3 text-[13px] leading-6 text-muted">هر کدام را خالی بگذاری روی برگه نمی‌آید.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="تاریخ تولد" htmlFor="b-birth">
            <TextInput id="b-birth" dir="ltr" value={basics.birthDate} placeholder="۱۳۸۲/۰۱/۱۵" onChange={(e) => setBasics({ birthDate: e.target.value })} className="text-end" />
          </Field>
          <Field label="وضعیت تأهل" htmlFor="b-marital">
            <ComboInput id="b-marital" value={basics.maritalStatus} options={['مجرد', 'متأهل']} placeholder="انتخاب کن یا بنویس" onChange={(v) => setBasics({ maritalStatus: v })} />
          </Field>
          <Field label="وضعیت نظام وظیفه" htmlFor="b-military">
            <ComboInput
              id="b-military"
              value={basics.militaryStatus}
              options={['پایان خدمت', 'معافیت دائم', 'معافیت تحصیلی', 'مشمول', 'در حال خدمت']}
              placeholder="انتخاب کن یا بنویس"
              onChange={(v) => setBasics({ militaryStatus: v })}
            />
          </Field>
          <Field label="ملیت" htmlFor="b-nationality">
            <TextInput id="b-nationality" value={basics.nationality} placeholder="ایرانی" onChange={(e) => setBasics({ nationality: e.target.value })} />
          </Field>
          <Field label="جنسیت" htmlFor="b-gender">
            <ComboInput id="b-gender" value={basics.gender} options={['زن', 'مرد']} placeholder="اختیاری" onChange={(v) => setBasics({ gender: v })} />
          </Field>
        </div>

        {basics.custom.length > 0 && (
          <div className="mt-3 grid gap-2">
            {basics.custom.map((c) => (
              <div key={c.id} className="flex items-center gap-2">
                <TextInput aria-label="عنوان مشخصه" value={c.label} placeholder="عنوان، مثلاً گواهینامه" onChange={(e) => setCustom(c.id, { label: e.target.value })} />
                <TextInput aria-label="مقدار مشخصه" value={c.value} placeholder="مقدار، مثلاً پایه سه" onChange={(e) => setCustom(c.id, { value: e.target.value })} />
                <IconButton label="حذف مشخصه" onClick={() => setBasics({ custom: basics.custom.filter((x) => x.id !== c.id) })}>
                  <Trash2 className="size-4" />
                </IconButton>
              </div>
            ))}
          </div>
        )}
        <Button
          size="sm"
          className="mt-3"
          onClick={() => setBasics({ custom: [...basics.custom, { id: uid('cf'), label: '', value: '' }] })}
        >
          <Plus className="size-4" />
          افزودن مشخصه‌ی دلخواه
        </Button>
      </div>
    </div>
  )
}

function ProfilesEditor() {
  const profiles = useResume((s) => s.resume.profiles)
  const addProfile = useResume((s) => s.addProfile)
  const updateProfile = useResume((s) => s.updateProfile)
  const removeProfile = useResume((s) => s.removeProfile)
  return (
    <div>
      <p className="mb-3 text-[13px] leading-6 text-muted">
        فقط نام کاربری کافی است؛ نشانی کامل خودش ساخته می‌شود. برای پیوندهای دیگر، نشانی را کامل بنویس.
      </p>
      <div className="grid gap-2">
        {profiles.map((p) => (
          <div key={p.id} className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)_auto] items-center gap-2">
            <Select
              value={p.network}
              onChange={(network) => updateProfile(p.id, { network })}
              options={networks.map((n) => ({ value: n.id, label: n.name }))}
            />
            {p.network === 'other' ? (
              <TextInput dir="ltr" aria-label="نشانی پیوند" value={p.url} placeholder="https://" onChange={(e) => updateProfile(p.id, { url: e.target.value })} />
            ) : (
              <TextInput dir="ltr" aria-label="نام کاربری" value={p.username} placeholder="username" onChange={(e) => updateProfile(p.id, { username: e.target.value })} />
            )}
            <IconButton label="حذف پیوند" onClick={() => removeProfile(p.id)}>
              <Trash2 className="size-4" />
            </IconButton>
          </div>
        ))}
      </div>
      <Button size="sm" className="mt-3" onClick={addProfile}>
        <Plus className="size-4" />
        افزودن شبکه یا پیوند
      </Button>
    </div>
  )
}

function AddSectionDialog({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (kind: SectionKind) => void }) {
  const sections = useResume((s) => s.resume.sections)
  const used = new Set(sections.map((s) => s.kind))
  return (
    <Dialog open={open} onClose={onClose} title="افزودن بخش" wide>
      <div className="grid gap-2 sm:grid-cols-2">
        {sectionOrder.map((kind) => {
          const def = sectionDefs[kind]
          const taken = used.has(kind) && kind !== 'custom'
          return (
            <button
              key={kind}
              type="button"
              disabled={taken}
              onClick={() => onAdd(kind)}
              className={cx(
                'flex items-start gap-3 rounded-xl border border-line p-3 text-start transition-colors',
                taken ? 'cursor-default opacity-55' : 'hover:border-brand hover:bg-brand-soft/40',
              )}
            >
              <span className="mt-0.5 shrink-0 text-muted [&>svg]:size-5">{sectionIcons[kind]}</span>
              <span className="min-w-0">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  {def.name}
                  {taken && <span className="rounded-full bg-paper px-2 text-[11px] font-normal leading-5 text-muted">در رزومه هست</span>}
                </span>
                <span className="block text-xs leading-5 text-muted">{def.hint}</span>
              </span>
            </button>
          )
        })}
      </div>
    </Dialog>
  )
}

export function ContentPanel() {
  const sections = useResume((s) => s.resume.sections)
  const settings = useResume((s) => s.resume.settings)
  const reorderSections = useResume((s) => s.reorderSections)
  const addSection = useResume((s) => s.addSection)
  const [open, setOpen] = useState<string | null>('basics')
  const [adding, setAdding] = useState(false)
  const toggle = (id: string) => setOpen((cur) => (cur === id ? null : id))

  return (
    <div className="grid gap-2.5">
      <Card icon={<UserRound />} title="اطلاعات شخصی" open={open === 'basics'} onToggle={() => toggle('basics')}>
        <BasicsEditor />
      </Card>
      <Card icon={<Link2 />} title="شبکه‌ها و پیوندها" open={open === 'profiles'} onToggle={() => toggle('profiles')}>
        <ProfilesEditor />
      </Card>

      <SortableList items={sections} onReorder={reorderSections} className="grid gap-2.5">
        {(section, handle) => (
          <SectionEditor
            section={section}
            settings={settings}
            handle={handle}
            open={open === section.id}
            onToggle={() => toggle(section.id)}
          />
        )}
      </SortableList>

      <button
        type="button"
        onClick={() => setAdding(true)}
        className="flex h-12 items-center justify-center gap-2 rounded-xl border border-dashed border-faint text-sm font-medium text-ink-2 transition-colors hover:border-brand hover:bg-brand-soft/40 hover:text-brand"
      >
        <Plus className="size-4" />
        افزودن بخش
      </button>

      <AddSectionDialog
        open={adding}
        onClose={() => setAdding(false)}
        onAdd={(kind) => {
          setOpen(addSection(kind))
          setAdding(false)
        }}
      />
    </div>
  )
}
