import type { FontId, TemplateId } from './types'

/**
 * رنگ‌ها فقط برای تیترها و قاب‌بندی استفاده می‌شوند؛ زمینه‌ی برگه سفید و متن سیاه می‌ماند.
 * همه‌ی رنگ‌ها تیره انتخاب شده‌اند تا روی کاغذ سفید و در چاپ سیاه‌وسفید هم خوانا باشند.
 */
export const colors = {
  navy: { name: 'سرمه‌ای', hex: '#1e3a5f' },
  royal: { name: 'لاجوردی', hex: '#1f4fb5' },
  steel: { name: 'آبی فولادی', hex: '#2c5d8a' },
  indigo: { name: 'نیلی', hex: '#3b3486' },
  teal: { name: 'نفتی', hex: '#0f5b66' },
  emerald: { name: 'زمردی', hex: '#0e6245' },
  forest: { name: 'یشمی', hex: '#2e5339' },
  olive: { name: 'زیتونی', hex: '#5a5f1e' },
  bronze: { name: 'برنزی', hex: '#7a5520' },
  copper: { name: 'مسی', hex: '#9a4b1c' },
  burgundy: { name: 'زرشکی', hex: '#7b1e2b' },
  crimson: { name: 'عنابی', hex: '#a12a2a' },
  plum: { name: 'بادمجانی', hex: '#55305f' },
  slate: { name: 'خاکستری فولادی', hex: '#3f4b5b' },
  graphite: { name: 'ذغالی', hex: '#26282c' },
} as const

export type ColorId = keyof typeof colors

export type TemplateLayout = 'single' | 'sidebar' | 'split' | 'labels'
export type HeaderVariant = 'center' | 'start' | 'split' | 'band' | 'none'
export type EntryVariant = 'stacked' | 'timeline' | 'datecol'

export interface TemplateDef {
  id: TemplateId
  name: string
  nameEn: string
  description: string
  layout: TemplateLayout
  header: HeaderVariant
  entry: EntryVariant
  /** اطلاعات تماس در سربرگ می‌آید یا در ستون کناری. */
  contact: 'header' | 'side'
  /** شش رنگ‌بندی این قالب؛ اولی پیش‌فرض است. */
  palettes: [ColorId, ColorId, ColorId, ColorId, ColorId, ColorId]
  font: FontId
  /** سبک تیتر بخش‌ها در خروجی Word. */
  docxHeading: 'underline' | 'bar' | 'side' | 'center' | 'plain' | 'double'
}

export const templates: TemplateDef[] = [
  {
    id: 'classic',
    name: 'کلاسیک',
    nameEn: 'Classic',
    description: 'سربرگ وسط‌چین و تیترهای خط‌دار؛ مناسب هر شغلی.',
    layout: 'single',
    header: 'center',
    entry: 'stacked',
    contact: 'header',
    palettes: ['navy', 'graphite', 'burgundy', 'emerald', 'bronze', 'plum'],
    font: 'vazirmatn',
    docxHeading: 'underline',
  },
  {
    id: 'modern',
    name: 'مدرن',
    nameEn: 'Modern',
    description: 'نوار رنگی بالای برگه و تیترهای نشانه‌دار.',
    layout: 'single',
    header: 'start',
    entry: 'stacked',
    contact: 'header',
    palettes: ['royal', 'teal', 'graphite', 'crimson', 'indigo', 'forest'],
    font: 'vazirmatn',
    docxHeading: 'side',
  },
  {
    id: 'sidebar',
    name: 'ستونی',
    nameEn: 'Sidebar',
    description: 'ستون باریک برای تماس و مهارت‌ها، ستون اصلی برای سوابق.',
    layout: 'sidebar',
    header: 'none',
    entry: 'stacked',
    contact: 'side',
    palettes: ['teal', 'navy', 'slate', 'burgundy', 'olive', 'plum'],
    font: 'vazirmatn',
    docxHeading: 'underline',
  },
  {
    id: 'band',
    name: 'سربرگ',
    nameEn: 'Letterhead',
    description: 'سربرگ با زمینه‌ی کم‌رنگ و خط رنگی، مثل سربرگ اداری.',
    layout: 'single',
    header: 'band',
    entry: 'stacked',
    contact: 'header',
    palettes: ['steel', 'emerald', 'bronze', 'plum', 'graphite', 'crimson'],
    font: 'vazirmatn',
    docxHeading: 'side',
  },
  {
    id: 'timeline',
    name: 'خط زمان',
    nameEn: 'Timeline',
    description: 'سوابق روی یک خط زمانی با تاریخ بالای هر مورد.',
    layout: 'single',
    header: 'split',
    entry: 'timeline',
    contact: 'header',
    palettes: ['royal', 'emerald', 'copper', 'indigo', 'slate', 'burgundy'],
    font: 'vazirmatn',
    docxHeading: 'plain',
  },
  {
    id: 'framed',
    name: 'قاب',
    nameEn: 'Framed',
    description: 'قاب نازک دور برگه و تیترهای وسط‌چین؛ رسمی و اداری.',
    layout: 'single',
    header: 'center',
    entry: 'stacked',
    contact: 'header',
    palettes: ['bronze', 'navy', 'burgundy', 'forest', 'graphite', 'indigo'],
    font: 'vazirmatn',
    docxHeading: 'center',
  },
  {
    id: 'split',
    name: 'دوستونه',
    nameEn: 'Two-column',
    description: 'سربرگ تمام‌عرض و دو ستون زیر آن؛ برای رزومه‌های پرمحتوا.',
    layout: 'split',
    header: 'split',
    entry: 'stacked',
    contact: 'header',
    palettes: ['emerald', 'steel', 'copper', 'plum', 'slate', 'navy'],
    font: 'vazirmatn',
    docxHeading: 'underline',
  },
  {
    id: 'minimal',
    name: 'مینیمال',
    nameEn: 'Minimal',
    description: 'عنوان بخش‌ها در حاشیه و فضای خالی زیاد.',
    layout: 'labels',
    header: 'start',
    entry: 'stacked',
    contact: 'header',
    palettes: ['graphite', 'navy', 'teal', 'burgundy', 'olive', 'royal'],
    font: 'vazirmatn',
    docxHeading: 'plain',
  },
  {
    id: 'executive',
    name: 'مدیریتی',
    nameEn: 'Executive',
    description: 'نام درشت و تیترهای نواری؛ برای سمت‌های ارشد.',
    layout: 'single',
    header: 'start',
    entry: 'stacked',
    contact: 'header',
    palettes: ['burgundy', 'navy', 'graphite', 'forest', 'bronze', 'teal'],
    font: 'vazirmatn',
    docxHeading: 'bar',
  },
  {
    id: 'academic',
    name: 'آکادمیک',
    nameEn: 'Academic',
    description: 'قلم نسخ، تاریخ‌ها در ستون جدا؛ برای رزومه‌ی دانشگاهی.',
    layout: 'single',
    header: 'center',
    entry: 'datecol',
    contact: 'header',
    palettes: ['graphite', 'indigo', 'burgundy', 'forest', 'steel', 'bronze'],
    font: 'naskh',
    docxHeading: 'double',
  },
]

const byId = new Map(templates.map((t) => [t.id, t]))

export function getTemplate(id: TemplateId): TemplateDef {
  return byId.get(id) ?? templates[0]
}

export function paletteOf(template: TemplateDef, index: number) {
  const id = template.palettes[Math.max(0, Math.min(5, index))] ?? template.palettes[0]
  return { id, ...colors[id] }
}

export const fonts: Record<FontId, { name: string; stack: string; docx: string; scale: number }> = {
  vazirmatn: {
    name: 'وزیرمتن',
    stack: "'Vazirmatn Variable', 'Vazirmatn', Tahoma, sans-serif",
    docx: 'Vazirmatn',
    scale: 1,
  },
  notosans: {
    name: 'نوتو سنس',
    stack: "'Noto Sans Arabic Variable', 'Vazirmatn Variable', Tahoma, sans-serif",
    docx: 'Noto Sans Arabic',
    scale: 1,
  },
  naskh: {
    name: 'نوتو نسخ',
    stack: "'Noto Naskh Arabic Variable', 'Vazirmatn Variable', 'Times New Roman', serif",
    docx: 'Noto Naskh Arabic',
    scale: 1.06,
  },
  markazi: {
    name: 'مرکزی',
    stack: "'Markazi Text Variable', 'Vazirmatn Variable', 'Times New Roman', serif",
    docx: 'Markazi Text',
    scale: 1.2,
  },
}
