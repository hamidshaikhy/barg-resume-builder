import { digits } from '@/lib/text'
import type { Item, Lang, PartialDate, SectionKind, Settings } from './types'

/** برچسب‌هایی که داخل خودِ برگه‌ی رزومه چاپ می‌شوند. */
const dict = {
  present: { fa: 'اکنون', en: 'Present' },
  contact: { fa: 'تماس', en: 'Contact' },
  personal: { fa: 'مشخصات', en: 'Personal details' },
  birthDate: { fa: 'تاریخ تولد', en: 'Date of birth' },
  maritalStatus: { fa: 'وضعیت تأهل', en: 'Marital status' },
  militaryStatus: { fa: 'وضعیت نظام وظیفه', en: 'Military service' },
  nationality: { fa: 'ملیت', en: 'Nationality' },
  gender: { fa: 'جنسیت', en: 'Gender' },
  reading: { fa: 'خواندن', en: 'Reading' },
  writing: { fa: 'نوشتن', en: 'Writing' },
  listening: { fa: 'شنیدن', en: 'Listening' },
  speaking: { fa: 'صحبت‌کردن', en: 'Speaking' },
  gpa: { fa: 'معدل', en: 'GPA' },
  code: { fa: 'شناسه‌ی مدرک', en: 'Credential ID' },
  hours: { fa: 'مدت', en: 'Duration' },
  number: { fa: 'شماره‌ی ثبت', en: 'Patent no.' },
  link: { fa: 'پیوند', en: 'Link' },
  page: { fa: 'صفحه', en: 'Page' },
} as const

export type LabelKey = keyof typeof dict

export function label(key: LabelKey, lang: Lang): string {
  return dict[key][lang]
}

export const sectionTitles: Record<SectionKind, { fa: string; en: string }> = {
  summary: { fa: 'خلاصه', en: 'Summary' },
  experience: { fa: 'سوابق شغلی', en: 'Experience' },
  education: { fa: 'سوابق تحصیلی', en: 'Education' },
  skills: { fa: 'مهارت‌ها', en: 'Skills' },
  softSkills: { fa: 'مهارت‌های نرم', en: 'Soft skills' },
  languages: { fa: 'زبان‌ها', en: 'Languages' },
  projects: { fa: 'پروژه‌ها', en: 'Projects' },
  certifications: { fa: 'گواهینامه‌ها', en: 'Certifications' },
  courses: { fa: 'دوره‌های آموزشی', en: 'Courses' },
  awards: { fa: 'افتخارات و جوایز', en: 'Honors & awards' },
  publications: { fa: 'مقالات و انتشارات', en: 'Publications' },
  research: { fa: 'سوابق پژوهشی', en: 'Research' },
  teaching: { fa: 'سوابق تدریس', en: 'Teaching' },
  volunteer: { fa: 'فعالیت‌های داوطلبانه', en: 'Volunteering' },
  memberships: { fa: 'عضویت‌ها', en: 'Memberships' },
  talks: { fa: 'سخنرانی‌ها و همایش‌ها', en: 'Talks & conferences' },
  patents: { fa: 'اختراعات ثبت‌شده', en: 'Patents' },
  interests: { fa: 'علاقه‌مندی‌ها', en: 'Interests' },
  references: { fa: 'معرف‌ها', en: 'References' },
  extra: { fa: 'اطلاعات تکمیلی', en: 'Additional information' },
  custom: { fa: 'بخش دلخواه', en: 'Custom section' },
}

const MONTHS = {
  jalali: {
    fa: ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'],
    en: ['Farvardin', 'Ordibehesht', 'Khordad', 'Tir', 'Mordad', 'Shahrivar', 'Mehr', 'Aban', 'Azar', 'Dey', 'Bahman', 'Esfand'],
  },
  gregorian: {
    fa: ['ژانویه', 'فوریه', 'مارس', 'آوریل', 'مه', 'ژوئن', 'ژوئیه', 'اوت', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر'],
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  },
} as const

export function monthNames(calendar: Settings['calendar'], lang: Lang): readonly string[] {
  return MONTHS[calendar][lang]
}

type DateSettings = Pick<Settings, 'calendar' | 'lang' | 'digits'>

export function formatDate(d: PartialDate, s: DateSettings): string {
  const year = d.y.trim()
  if (!year) return ''
  const idx = Number(d.m) - 1
  const month = idx >= 0 && idx < 12 ? monthNames(s.calendar, s.lang)[idx] : ''
  return digits(month ? `${month} ${year}` : year, s.digits)
}

export function formatRange(item: Pick<Item, 'start' | 'end' | 'current'>, s: DateSettings): string {
  const a = formatDate(item.start, s)
  const b = item.current ? label('present', s.lang) : formatDate(item.end, s)
  if (a && b) return `${a} – ${b}`
  return a || b
}
