import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import { uid } from '@/lib/text'
import { emptyItem, emptySection, sectionDefs } from '@/resume/sections'
import { blankResume, defaultSettings, sampleResume } from '@/resume/sample'
import { getTemplate, templates } from '@/resume/templates'
import type { Basics, Item, Profile, Resume, Section, SectionKind, Settings, TemplateId } from '@/resume/types'

/** اگر مرورگر اجازه‌ی ذخیره‌سازی ندهد (حالت خصوصی و …) برنامه بدون ذخیره کار می‌کند. */
const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name)
    } catch {
      return null
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value)
    } catch {
      /* فضای ذخیره‌سازی پر است یا در دسترس نیست */
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name)
    } catch {
      /* نادیده گرفته می‌شود */
    }
  },
}

const str = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback)
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' ? (v as Record<string, unknown>) : {})

/** هر ورودی (فایل JSON کاربر یا داده‌ی ذخیره‌شده‌ی قدیمی) را به رزومه‌ی معتبر تبدیل می‌کند. */
export function normalizeResume(input: unknown): Resume {
  const src = obj(input)
  const base = blankResume()
  const b = obj(src.basics)
  const basics: Basics = {
    ...base.basics,
    ...Object.fromEntries(Object.keys(base.basics).map((k) => [k, str(b[k])])),
    custom: Array.isArray(b.custom)
      ? b.custom.map((c) => ({ id: str(obj(c).id) || uid('cf'), label: str(obj(c).label), value: str(obj(c).value) }))
      : [],
  } as Basics

  const profiles: Profile[] = Array.isArray(src.profiles)
    ? src.profiles.map((p) => ({
        id: str(obj(p).id) || uid('pr'),
        network: str(obj(p).network, 'other'),
        username: str(obj(p).username),
        url: str(obj(p).url),
      }))
    : []

  const sections: Section[] = Array.isArray(src.sections)
    ? src.sections
        .map((raw) => {
          const s = obj(raw)
          const kind = str(s.kind) as SectionKind
          if (!sectionDefs[kind]) return null
          const items: Item[] = Array.isArray(s.items)
            ? s.items.map((rawItem) => {
                const it = obj(rawItem)
                const date = (v: unknown) => ({ y: str(obj(v).y), m: str(obj(v).m) })
                return emptyItem({
                  id: str(it.id) || uid('it'),
                  visible: it.visible !== false,
                  title: str(it.title),
                  subtitle: str(it.subtitle),
                  meta: str(it.meta),
                  location: str(it.location),
                  start: date(it.start),
                  end: date(it.end),
                  current: it.current === true,
                  url: str(it.url),
                  description: str(it.description),
                  tags: Array.isArray(it.tags) ? it.tags.filter((t): t is string => typeof t === 'string') : [],
                  level: typeof it.level === 'number' ? Math.max(0, Math.min(5, it.level)) : 0,
                  x: Object.fromEntries(Object.entries(obj(it.x)).filter(([, v]) => typeof v === 'string')) as Record<string, string>,
                })
              })
            : []
          return emptySection(kind, {
            id: str(s.id) || uid('sec'),
            title: str(s.title),
            visible: s.visible !== false,
            column: s.column === 'side' || s.column === 'main' ? s.column : sectionDefs[kind].column,
            items,
            text: str(s.text),
            display: (['chips', 'inline', 'bars', 'dots', 'list'] as const).includes(s.display as never)
              ? (s.display as Section['display'])
              : (sectionDefs[kind].display ?? 'chips'),
          })
        })
        .filter((s): s is Section => s !== null)
    : base.sections

  const st = obj(src.settings)
  const settings: Settings = { ...defaultSettings }
  for (const key of Object.keys(defaultSettings) as Array<keyof Settings>) {
    if (typeof st[key] === typeof defaultSettings[key]) (settings as unknown as Record<string, unknown>)[key] = st[key]
  }
  if (!templates.some((t) => t.id === settings.template)) settings.template = 'classic'
  settings.palette = Math.max(0, Math.min(5, Math.round(settings.palette)))
  settings.fontScale = Math.max(0.85, Math.min(1.2, settings.fontScale))
  settings.lineHeight = Math.max(1.4, Math.min(2.1, settings.lineHeight))

  return { version: 1, basics, profiles, sections, settings }
}

interface ResumeState {
  resume: Resume
  setBasics: (patch: Partial<Basics>) => void
  setSettings: (patch: Partial<Settings>) => void
  setTemplate: (id: TemplateId) => void
  addProfile: () => void
  updateProfile: (id: string, patch: Partial<Profile>) => void
  removeProfile: (id: string) => void
  addSection: (kind: SectionKind) => string
  updateSection: (id: string, patch: Partial<Section>) => void
  removeSection: (id: string) => void
  reorderSections: (ids: string[]) => void
  addItem: (sectionId: string, partial?: Partial<Item>) => string
  updateItem: (sectionId: string, itemId: string, updater: (item: Item) => Item) => void
  removeItem: (sectionId: string, itemId: string) => void
  duplicateItem: (sectionId: string, itemId: string) => void
  reorderItems: (sectionId: string, ids: string[]) => void
  replace: (resume: Resume) => void
  loadSample: () => void
  startBlank: () => void
}

const mapSection = (resume: Resume, id: string, fn: (s: Section) => Section): Resume => ({
  ...resume,
  sections: resume.sections.map((s) => (s.id === id ? fn(s) : s)),
})

const byOrder = <T extends { id: string }>(list: T[], ids: string[]): T[] => {
  const map = new Map(list.map((x) => [x.id, x]))
  const ordered = ids.map((id) => map.get(id)).filter((x): x is T => !!x)
  const rest = list.filter((x) => !ids.includes(x.id))
  return [...ordered, ...rest]
}

export const useResume = create<ResumeState>()(
  persist(
    (set) => ({
      resume: sampleResume(),

      setBasics: (patch) => set((st) => ({ resume: { ...st.resume, basics: { ...st.resume.basics, ...patch } } })),

      setSettings: (patch) =>
        set((st) => ({ resume: { ...st.resume, settings: { ...st.resume.settings, ...patch } } })),

      // هر قالب رنگ‌ها و قلم پیش‌فرض خودش را دارد؛ با عوض‌شدن قالب به آن‌ها برمی‌گردیم.
      setTemplate: (id) =>
        set((st) => ({
          resume: {
            ...st.resume,
            settings: { ...st.resume.settings, template: id, palette: 0, font: getTemplate(id).font },
          },
        })),

      addProfile: () =>
        set((st) => ({
          resume: {
            ...st.resume,
            profiles: [...st.resume.profiles, { id: uid('pr'), network: 'linkedin', username: '', url: '' }],
          },
        })),
      updateProfile: (id, patch) =>
        set((st) => ({
          resume: { ...st.resume, profiles: st.resume.profiles.map((p) => (p.id === id ? { ...p, ...patch } : p)) },
        })),
      removeProfile: (id) =>
        set((st) => ({ resume: { ...st.resume, profiles: st.resume.profiles.filter((p) => p.id !== id) } })),

      addSection: (kind) => {
        const section = emptySection(kind)
        if (sectionDefs[kind].layout !== 'text') section.items = [emptyItem()]
        set((st) => ({ resume: { ...st.resume, sections: [...st.resume.sections, section] } }))
        return section.id
      },
      updateSection: (id, patch) => set((st) => ({ resume: mapSection(st.resume, id, (s) => ({ ...s, ...patch })) })),
      removeSection: (id) =>
        set((st) => ({ resume: { ...st.resume, sections: st.resume.sections.filter((s) => s.id !== id) } })),
      reorderSections: (ids) =>
        set((st) => ({ resume: { ...st.resume, sections: byOrder(st.resume.sections, ids) } })),

      addItem: (sectionId, partial) => {
        const item = emptyItem(partial)
        set((st) => ({ resume: mapSection(st.resume, sectionId, (s) => ({ ...s, items: [...s.items, item] })) }))
        return item.id
      },
      updateItem: (sectionId, itemId, updater) =>
        set((st) => ({
          resume: mapSection(st.resume, sectionId, (s) => ({
            ...s,
            items: s.items.map((it) => (it.id === itemId ? updater(it) : it)),
          })),
        })),
      removeItem: (sectionId, itemId) =>
        set((st) => ({
          resume: mapSection(st.resume, sectionId, (s) => ({ ...s, items: s.items.filter((it) => it.id !== itemId) })),
        })),
      duplicateItem: (sectionId, itemId) =>
        set((st) => ({
          resume: mapSection(st.resume, sectionId, (s) => {
            const i = s.items.findIndex((it) => it.id === itemId)
            if (i < 0) return s
            const copy: Item = { ...s.items[i], id: uid('it'), tags: [...s.items[i].tags], x: { ...s.items[i].x } }
            return { ...s, items: [...s.items.slice(0, i + 1), copy, ...s.items.slice(i + 1)] }
          }),
        })),
      reorderItems: (sectionId, ids) =>
        set((st) => ({ resume: mapSection(st.resume, sectionId, (s) => ({ ...s, items: byOrder(s.items, ids) })) })),

      replace: (resume) => set({ resume: normalizeResume(resume) }),
      loadSample: () => set((st) => ({ resume: { ...sampleResume(), settings: st.resume.settings } })),
      startBlank: () => set((st) => ({ resume: { ...blankResume(), settings: st.resume.settings } })),
    }),
    {
      name: 'barg:resume',
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (st) => ({ resume: st.resume }),
      merge: (persisted, current) => {
        const saved = obj(persisted).resume
        return saved ? { ...current, resume: normalizeResume(saved) } : current
      },
    },
  ),
)
