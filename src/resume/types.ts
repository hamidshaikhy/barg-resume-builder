/**
 * مدل داده‌ی رزومه.
 * همه‌ی بخش‌های فهرستی از یک شکل مشترک (Item) استفاده می‌کنند و تعریف هر بخش
 * (sections.ts) مشخص می‌کند کدام فیلدها نمایش داده شوند و چه برچسبی داشته باشند.
 */

export type Lang = 'fa' | 'en'
export type Calendar = 'jalali' | 'gregorian'
export type DigitMode = 'fa' | 'latin'

export type SectionKind =
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'softSkills'
  | 'languages'
  | 'projects'
  | 'certifications'
  | 'courses'
  | 'awards'
  | 'publications'
  | 'research'
  | 'teaching'
  | 'volunteer'
  | 'memberships'
  | 'talks'
  | 'patents'
  | 'interests'
  | 'references'
  | 'extra'
  | 'custom'

export type ColumnId = 'main' | 'side'

/** تاریخ ناقص: فقط سال، یا ماه و سال. */
export interface PartialDate {
  y: string
  m: string
}

export interface Item {
  id: string
  visible: boolean
  title: string
  subtitle: string
  meta: string
  location: string
  start: PartialDate
  end: PartialDate
  current: boolean
  url: string
  description: string
  tags: string[]
  /** سطح تسلط از ۰ تا ۵؛ صفر یعنی نمایش داده نشود. */
  level: number
  /** فیلدهای ویژه‌ی هر بخش، مثل معدل یا شماره‌ی ثبت. */
  x: Record<string, string>
}

export type SkillDisplay = 'chips' | 'inline' | 'bars' | 'dots' | 'list'

export interface Section {
  id: string
  kind: SectionKind
  /** عنوان دلخواه؛ اگر خالی باشد عنوان پیش‌فرض همان بخش استفاده می‌شود. */
  title: string
  visible: boolean
  column: ColumnId
  items: Item[]
  /** متن آزاد، فقط برای بخش خلاصه. */
  text: string
  display: SkillDisplay
}

export interface CustomField {
  id: string
  label: string
  value: string
}

export interface Basics {
  fullName: string
  headline: string
  /** data URL تصویر کوچک‌شده. */
  photo: string
  email: string
  phone: string
  location: string
  website: string
  birthDate: string
  maritalStatus: string
  militaryStatus: string
  nationality: string
  gender: string
  custom: CustomField[]
}

export interface Profile {
  id: string
  network: string
  username: string
  url: string
}

export type TemplateId =
  | 'classic'
  | 'modern'
  | 'sidebar'
  | 'band'
  | 'timeline'
  | 'framed'
  | 'split'
  | 'minimal'
  | 'executive'
  | 'academic'

export type FontId = 'vazirmatn' | 'naskh' | 'markazi' | 'notosans'
export type MarginId = 'compact' | 'normal' | 'relaxed'
export type PhotoShape = 'circle' | 'rounded' | 'square'

export interface Settings {
  template: TemplateId
  /** شماره‌ی رنگ‌بندی در فهرست شش‌تایی همان قالب. */
  palette: number
  font: FontId
  /** ضریب اندازه‌ی قلم؛ ۱ یعنی پیش‌فرض قالب. */
  fontScale: number
  lineHeight: number
  margin: MarginId
  lang: Lang
  calendar: Calendar
  digits: DigitMode
  showPhoto: boolean
  photoShape: PhotoShape
  showIcons: boolean
}

export interface Resume {
  version: 1
  basics: Basics
  profiles: Profile[]
  sections: Section[]
  settings: Settings
}
