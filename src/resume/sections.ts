import { uid } from '@/lib/text'
import type { ColumnId, Item, Section, SectionKind, SkillDisplay } from './types'

export type FieldType = 'text' | 'textarea' | 'tags' | 'level' | 'select' | 'dates' | 'date' | 'url' | 'cefr'

export interface FieldDef {
  /** نام فیلد در Item؛ فیلدهای ویژه با پیشوند «x.» نوشته می‌شوند. */
  key: string
  label: string
  type: FieldType
  placeholder?: string
  /** پیشنهادها؛ کاربر می‌تواند مقدار دیگری هم بنویسد. */
  options?: string[]
  /** عرض کامل ردیف. */
  wide?: boolean
}

export type SectionLayout = 'text' | 'entry' | 'skills' | 'tags' | 'languages' | 'references' | 'pairs'

export interface SectionDef {
  kind: SectionKind
  /** نام بخش در رابط ویرایشگر. */
  name: string
  hint: string
  layout: SectionLayout
  fields: FieldDef[]
  /** ستون پیش‌فرض در قالب‌های دوستونه. */
  column: ColumnId
  /** نام یک مورد، برای دکمه‌ی «افزودن …». */
  itemName: string
  display?: SkillDisplay
  /** فیلدهای ویژه‌ای که زیر عنوان با برچسب چاپ می‌شوند. */
  extras?: Array<'gpa' | 'code' | 'hours' | 'number'>
}

const text = (key: string, label: string, placeholder = '', wide = false): FieldDef => ({
  key,
  label,
  type: 'text',
  placeholder,
  wide,
})
const desc = (label = 'توضیحات', placeholder = 'هر خط یک پاراگراف است. برای بولت، خط را با «-» شروع کن.'): FieldDef => ({
  key: 'description',
  label,
  type: 'textarea',
  placeholder,
  wide: true,
})
const url = (label = 'پیوند', placeholder = 'https://'): FieldDef => ({ key: 'url', label, type: 'url', placeholder, wide: true })
const range: FieldDef = { key: 'dates', label: 'بازه‌ی زمانی', type: 'dates', wide: true }
const single = (label = 'تاریخ'): FieldDef => ({ key: 'date', label, type: 'date' })
const tags = (label: string, placeholder: string): FieldDef => ({ key: 'tags', label, type: 'tags', placeholder, wide: true })

export const CEFR = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export const sectionDefs: Record<SectionKind, SectionDef> = {
  summary: {
    kind: 'summary',
    name: 'خلاصه',
    hint: 'دو تا چهار جمله درباره‌ی تخصص، تجربه و هدف شغلی‌ات.',
    layout: 'text',
    fields: [],
    column: 'main',
    itemName: '',
  },
  experience: {
    kind: 'experience',
    name: 'سوابق شغلی',
    hint: 'از جدیدترین سابقه شروع کن و دستاوردها را با عدد بنویس.',
    layout: 'entry',
    column: 'main',
    itemName: 'سابقه‌ی شغلی',
    fields: [
      text('title', 'عنوان شغلی', 'توسعه‌دهنده‌ی فرانت‌اند'),
      text('subtitle', 'شرکت یا سازمان', 'نام شرکت'),
      {
        key: 'meta',
        label: 'نوع همکاری',
        type: 'select',
        options: ['تمام‌وقت', 'پاره‌وقت', 'قراردادی', 'پروژه‌ای', 'دورکاری', 'کارآموزی', 'آزادکار'],
      },
      text('location', 'محل کار', 'تهران'),
      range,
      desc('وظایف و دستاوردها'),
      tags('فناوری‌ها و ابزارها', 'بنویس و Enter بزن'),
      url('وب‌سایت شرکت'),
    ],
  },
  education: {
    kind: 'education',
    name: 'سوابق تحصیلی',
    hint: 'مقطع، رشته و دانشگاه. معدل را فقط اگر به سودت است بنویس.',
    layout: 'entry',
    column: 'main',
    itemName: 'سابقه‌ی تحصیلی',
    extras: ['gpa'],
    fields: [
      text('title', 'مقطع و رشته', 'کارشناسی مهندسی کامپیوتر'),
      text('subtitle', 'دانشگاه یا مؤسسه', 'نام دانشگاه'),
      text('meta', 'گرایش', 'نرم‌افزار'),
      text('x.gpa', 'معدل', '۱۷٫۵ از ۲۰'),
      text('location', 'شهر', 'تبریز'),
      range,
      desc('توضیحات', 'عنوان پایان‌نامه، رتبه، دروس شاخص …'),
    ],
  },
  skills: {
    kind: 'skills',
    name: 'مهارت‌ها',
    hint: 'هر مورد می‌تواند یک مهارت باشد یا یک گروه با چند زیرمهارت.',
    layout: 'skills',
    column: 'side',
    itemName: 'مهارت',
    display: 'chips',
    fields: [
      text('title', 'مهارت یا نام گروه', 'React.js'),
      { key: 'level', label: 'سطح تسلط', type: 'level' },
      tags('زیرمهارت‌ها (اختیاری)', 'برای گروه‌بندی: Redux، Router …'),
    ],
  },
  softSkills: {
    kind: 'softSkills',
    name: 'مهارت‌های نرم',
    hint: 'مهارت‌های رفتاری و فردی، مثل کار تیمی یا حل مسئله.',
    layout: 'tags',
    column: 'side',
    itemName: 'مهارت نرم',
    display: 'list',
    fields: [text('title', 'مهارت', 'حل مسئله', true)],
  },
  languages: {
    kind: 'languages',
    name: 'زبان‌ها',
    hint: 'سطح کلی را بنویس؛ چهار مهارت جداگانه اختیاری است.',
    layout: 'languages',
    column: 'side',
    itemName: 'زبان',
    fields: [
      text('title', 'زبان', 'انگلیسی'),
      {
        key: 'x.level',
        label: 'سطح کلی',
        type: 'select',
        options: ['زبان مادری', 'مسلط', 'پیشرفته', 'متوسط', 'مقدماتی', ...CEFR],
      },
      { key: 'x.reading', label: 'خواندن', type: 'cefr' },
      { key: 'x.writing', label: 'نوشتن', type: 'cefr' },
      { key: 'x.listening', label: 'شنیدن', type: 'cefr' },
      { key: 'x.speaking', label: 'صحبت‌کردن', type: 'cefr' },
      text('x.cert', 'مدرک زبان', 'IELTS 7', true),
    ],
  },
  projects: {
    kind: 'projects',
    name: 'پروژه‌ها',
    hint: 'پروژه‌هایی که نتیجه‌ی قابل نمایش دارند، با پیوند.',
    layout: 'entry',
    column: 'main',
    itemName: 'پروژه',
    fields: [
      text('title', 'نام پروژه', 'داشبورد مدیریت مالی'),
      text('subtitle', 'کارفرما یا نقش تو', 'کارفرما: …'),
      range,
      desc(),
      tags('فناوری‌ها', 'بنویس و Enter بزن'),
      url('پیوند پروژه'),
    ],
  },
  certifications: {
    kind: 'certifications',
    name: 'گواهینامه‌ها',
    hint: 'مدرک‌های حرفه‌ای معتبر با نام صادرکننده.',
    layout: 'entry',
    column: 'main',
    itemName: 'گواهینامه',
    extras: ['code'],
    fields: [
      text('title', 'نام گواهینامه', 'AWS Certified Developer'),
      text('subtitle', 'صادرکننده', 'Amazon Web Services'),
      single('تاریخ دریافت'),
      text('x.code', 'شناسه‌ی مدرک', ''),
      url('پیوند اعتبارسنجی'),
      desc(),
    ],
  },
  courses: {
    kind: 'courses',
    name: 'دوره‌های آموزشی',
    hint: 'دوره‌های مرتبط با شغلی که برایش درخواست می‌دهی.',
    layout: 'entry',
    column: 'main',
    itemName: 'دوره',
    extras: ['hours'],
    fields: [
      text('title', 'نام دوره', ''),
      text('subtitle', 'مؤسسه یا مدرس', ''),
      single('تاریخ'),
      text('x.hours', 'مدت دوره', '۴۰ ساعت'),
      url('پیوند'),
      desc(),
    ],
  },
  awards: {
    kind: 'awards',
    name: 'افتخارات و جوایز',
    hint: 'رتبه‌ها، جوایز و تقدیرنامه‌ها.',
    layout: 'entry',
    column: 'main',
    itemName: 'افتخار',
    fields: [text('title', 'عنوان', 'رتبه‌ی اول مسابقه‌ی …'), text('subtitle', 'اهداکننده', ''), single(), desc()],
  },
  publications: {
    kind: 'publications',
    name: 'مقالات و انتشارات',
    hint: 'مقاله، کتاب یا نوشته‌ی تخصصی منتشرشده.',
    layout: 'entry',
    column: 'main',
    itemName: 'مقاله',
    fields: [
      text('title', 'عنوان', '', true),
      text('subtitle', 'نشریه یا ناشر', ''),
      text('meta', 'نویسندگان همکار', ''),
      single('تاریخ انتشار'),
      url('پیوند یا DOI'),
      desc(),
    ],
  },
  research: {
    kind: 'research',
    name: 'سوابق پژوهشی',
    hint: 'پروژه‌های پژوهشی، پایان‌نامه و همکاری با آزمایشگاه‌ها.',
    layout: 'entry',
    column: 'main',
    itemName: 'پژوهش',
    fields: [
      text('title', 'عنوان پژوهش', '', true),
      text('subtitle', 'مؤسسه یا آزمایشگاه', ''),
      text('meta', 'استاد راهنما یا نقش تو', ''),
      range,
      url(),
      desc(),
    ],
  },
  teaching: {
    kind: 'teaching',
    name: 'سوابق تدریس',
    hint: 'تدریس، حل‌تمرین، منتورینگ و کارگاه.',
    layout: 'entry',
    column: 'main',
    itemName: 'سابقه‌ی تدریس',
    fields: [
      text('title', 'درس یا سمت', 'حل‌تمرین ساختمان داده'),
      text('subtitle', 'مؤسسه', ''),
      text('location', 'شهر', ''),
      range,
      desc(),
    ],
  },
  volunteer: {
    kind: 'volunteer',
    name: 'فعالیت‌های داوطلبانه',
    hint: 'کارهای داوطلبانه و اجتماعی.',
    layout: 'entry',
    column: 'main',
    itemName: 'فعالیت',
    fields: [text('title', 'نقش', ''), text('subtitle', 'سازمان', ''), text('location', 'شهر', ''), range, desc()],
  },
  memberships: {
    kind: 'memberships',
    name: 'عضویت‌ها',
    hint: 'انجمن‌های علمی و نهادهای حرفه‌ای.',
    layout: 'entry',
    column: 'main',
    itemName: 'عضویت',
    fields: [text('title', 'انجمن یا نهاد', ''), text('subtitle', 'نوع عضویت', 'عضو پیوسته'), range, desc()],
  },
  talks: {
    kind: 'talks',
    name: 'سخنرانی‌ها و همایش‌ها',
    hint: 'ارائه در رویداد، همایش یا دورهمی تخصصی.',
    layout: 'entry',
    column: 'main',
    itemName: 'ارائه',
    fields: [
      text('title', 'عنوان ارائه', '', true),
      text('subtitle', 'رویداد', ''),
      text('location', 'شهر', ''),
      single(),
      url('پیوند اسلاید یا ویدیو'),
      desc(),
    ],
  },
  patents: {
    kind: 'patents',
    name: 'اختراعات ثبت‌شده',
    hint: 'اختراع یا طرح صنعتی ثبت‌شده.',
    layout: 'entry',
    column: 'main',
    itemName: 'اختراع',
    extras: ['number'],
    fields: [
      text('title', 'عنوان اختراع', '', true),
      text('subtitle', 'مرجع ثبت', ''),
      text('x.number', 'شماره‌ی ثبت', ''),
      single('تاریخ ثبت'),
      url(),
      desc(),
    ],
  },
  interests: {
    kind: 'interests',
    name: 'علاقه‌مندی‌ها',
    hint: 'کوتاه و واقعی؛ دو تا پنج مورد کافی است.',
    layout: 'tags',
    column: 'side',
    itemName: 'علاقه‌مندی',
    display: 'inline',
    fields: [text('title', 'علاقه‌مندی', 'کوهنوردی', true)],
  },
  references: {
    kind: 'references',
    name: 'معرف‌ها',
    hint: 'پیش از نوشتن نام هر معرف از او اجازه بگیر.',
    layout: 'references',
    column: 'main',
    itemName: 'معرف',
    fields: [
      text('title', 'نام و نام خانوادگی', ''),
      text('subtitle', 'سمت و سازمان', ''),
      text('x.phone', 'تلفن', ''),
      text('x.email', 'ایمیل', ''),
      desc('نسبت کاری', 'مثلاً: مدیر مستقیم من در شرکت …'),
    ],
  },
  extra: {
    kind: 'extra',
    name: 'اطلاعات تکمیلی',
    hint: 'هر چیز کوتاهی که جای دیگری ندارد: گواهینامه‌ی رانندگی، آمادگی جابه‌جایی، زمان شروع به کار.',
    layout: 'pairs',
    column: 'side',
    itemName: 'مورد',
    fields: [text('title', 'عنوان', 'زمان شروع به کار'), text('subtitle', 'مقدار', 'دو هفته پس از توافق')],
  },
  custom: {
    kind: 'custom',
    name: 'بخش دلخواه',
    hint: 'عنوان بخش را خودت انتخاب کن و هر فیلدی را که لازم نداری خالی بگذار.',
    layout: 'entry',
    column: 'main',
    itemName: 'مورد',
    fields: [
      text('title', 'عنوان', ''),
      text('subtitle', 'زیرعنوان', ''),
      text('meta', 'جزئیات', ''),
      text('location', 'مکان', ''),
      range,
      desc(),
      tags('برچسب‌ها', 'بنویس و Enter بزن'),
      url(),
    ],
  },
}

/** ترتیب نمایش بخش‌ها در پنجره‌ی «افزودن بخش». */
export const sectionOrder: SectionKind[] = [
  'summary',
  'experience',
  'education',
  'skills',
  'projects',
  'languages',
  'certifications',
  'courses',
  'softSkills',
  'awards',
  'publications',
  'research',
  'teaching',
  'talks',
  'patents',
  'volunteer',
  'memberships',
  'interests',
  'references',
  'extra',
  'custom',
]

export function emptyItem(partial: Partial<Item> = {}): Item {
  return {
    id: uid('it'),
    visible: true,
    title: '',
    subtitle: '',
    meta: '',
    location: '',
    start: { y: '', m: '' },
    end: { y: '', m: '' },
    current: false,
    url: '',
    description: '',
    tags: [],
    level: 0,
    x: {},
    ...partial,
  }
}

export function emptySection(kind: SectionKind, partial: Partial<Section> = {}): Section {
  const def = sectionDefs[kind]
  return {
    id: uid('sec'),
    kind,
    title: '',
    visible: true,
    column: def.column,
    items: [],
    text: '',
    display: def.display ?? 'chips',
    ...partial,
  }
}

/** خواندن و نوشتن یک فیلد با کلیدی مثل «title» یا «x.gpa». */
export function readField(item: Item, key: string): string {
  if (key.startsWith('x.')) return item.x[key.slice(2)] ?? ''
  const v = (item as unknown as Record<string, unknown>)[key]
  return typeof v === 'string' ? v : ''
}

export function writeField(item: Item, key: string, value: string): Item {
  if (key.startsWith('x.')) return { ...item, x: { ...item.x, [key.slice(2)]: value } }
  return { ...item, [key]: value }
}
