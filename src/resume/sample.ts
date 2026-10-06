import { uid } from '@/lib/text'
import { emptyItem, emptySection } from './sections'
import type { Resume, Settings } from './types'

export const defaultSettings: Settings = {
  template: 'classic',
  palette: 0,
  font: 'vazirmatn',
  fontScale: 1,
  lineHeight: 1.75,
  margin: 'normal',
  lang: 'fa',
  calendar: 'jalali',
  digits: 'fa',
  showPhoto: true,
  photoShape: 'circle',
  showIcons: true,
}

/** رزومه‌ی خالی با بخش‌های پایه، برای شروع از صفر. */
export function blankResume(): Resume {
  return {
    version: 1,
    basics: {
      fullName: '',
      headline: '',
      photo: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      birthDate: '',
      maritalStatus: '',
      militaryStatus: '',
      nationality: '',
      gender: '',
      custom: [],
    },
    profiles: [],
    sections: [
      emptySection('summary'),
      emptySection('experience'),
      emptySection('education'),
      emptySection('skills'),
      emptySection('languages'),
    ],
    settings: { ...defaultSettings },
  }
}

const d = (y: string, m = '') => ({ y, m })

/**
 * رزومه‌ی نمونه با نام سازنده‌ی برگ. سوابق و شرکت‌ها ساختگی‌اند و فقط برای نمایش قالب‌ها استفاده می‌شوند.
 */
export function sampleResume(): Resume {
  return {
    version: 1,
    basics: {
      fullName: 'حمید شیخی',
      headline: 'مهندس ارشد فرانت‌اند',
      photo: '',
      email: 'hamid.shaikhy@example.com',
      phone: '۰۹۱۲ ۵۵۵ ۰۱۴۲',
      location: 'تهران',
      website: 'hamid.example',
      birthDate: '۱۳۷۲/۰۶/۱۸',
      maritalStatus: 'متأهل',
      militaryStatus: '',
      nationality: '',
      gender: '',
      custom: [],
    },
    profiles: [
      { id: uid('pr'), network: 'linkedin', username: 'hamid-shaikhy', url: '' },
      { id: uid('pr'), network: 'github', username: 'hamidshaikhy', url: '' },
    ],
    sections: [
      emptySection('summary', {
        text: 'مهندس فرانت‌اند با هشت سال تجربه در ساخت محصولات وب پرترافیک. در سه سال گذشته سرپرست فنی تیمی شش‌نفره بوده‌ام و سامانه‌ی طراحی مشترکی ساخته‌ام که چهار تیم محصول از آن استفاده می‌کنند. به کارایی، دسترس‌پذیری و رابط‌های راست‌به‌چپ دقیق اهمیت می‌دهم.',
      }),
      emptySection('experience', {
        items: [
          emptyItem({
            title: 'سرپرست فنی فرانت‌اند',
            subtitle: 'شرکت فناوری آوند',
            meta: 'تمام‌وقت',
            location: 'تهران',
            start: d('1401', '7'),
            current: true,
            description: [
              '- هدایت تیم شش‌نفره‌ی فرانت‌اند و بازنویسی پنل فروشندگان با React و TypeScript',
              '- کاهش زمان بارگذاری صفحه‌ی اصلی از ۴٫۲ به ۱٫۸ ثانیه با تقسیم کد و بهینه‌سازی تصویر',
              '- ساخت سامانه‌ی طراحی مشترک با ۴۸ کامپوننت که چهار تیم محصول از آن استفاده می‌کنند',
            ].join('\n'),
            tags: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
          }),
          emptyItem({
            title: 'توسعه‌دهنده‌ی فرانت‌اند',
            subtitle: 'رایان‌سپهر',
            meta: 'تمام‌وقت',
            location: 'تهران',
            start: d('1398', '1'),
            end: d('1401', '6'),
            description: [
              '- پیاده‌سازی داشبورد تحلیلی با نمودارهای زنده برای بیش از ۱۲ هزار کاربر سازمانی',
              '- افزایش پوشش آزمون واحد از ۲۰ به ۷۸ درصد و راه‌اندازی بررسی خودکار کیفیت کد',
            ].join('\n'),
          }),
          emptyItem({
            title: 'توسعه‌دهنده‌ی وب',
            subtitle: 'استودیو نقش',
            meta: 'پاره‌وقت',
            location: 'اصفهان',
            start: d('1395', '7'),
            end: d('1397', '12'),
            description: '- طراحی و ساخت بیش از ۲۰ وب‌سایت شرکتی واکنش‌گرا',
          }),
        ],
      }),
      emptySection('education', {
        items: [
          emptyItem({
            title: 'کارشناسی ارشد مهندسی نرم‌افزار',
            subtitle: 'دانشگاه صنعتی اصفهان',
            location: 'اصفهان',
            start: d('1395'),
            end: d('1397'),
            x: { gpa: '۱۷٫۸ از ۲۰' },
            description: 'پایان‌نامه: بهینه‌سازی رندر در برنامه‌های تک‌صفحه‌ای',
          }),
          emptyItem({
            title: 'کارشناسی مهندسی کامپیوتر',
            subtitle: 'دانشگاه اصفهان',
            location: 'اصفهان',
            start: d('1391'),
            end: d('1395'),
          }),
        ],
      }),
      emptySection('projects', {
        items: [
          emptyItem({
            title: 'برگ؛ رزومه‌ساز فارسی',
            subtitle: 'پروژه‌ی متن‌باز',
            start: d('1405'),
            current: true,
            description: 'رزومه‌ساز راست‌به‌چپ با ده قالب، تاریخ شمسی و خروجی PDF و Word؛ با React و TypeScript.',
            url: 'github.com/hamidshaikhy/barg-resume-builder',
          }),
        ],
      }),
      emptySection('skills', {
        items: [
          ['React', 5],
          ['TypeScript', 5],
          ['Next.js', 4],
          ['JavaScript', 5],
          ['Tailwind CSS', 4],
          ['HTML و CSS', 5],
          ['Vite', 4],
          ['Git', 4],
          ['Vitest', 3],
          ['Figma', 3],
          ['REST API', 4],
          ['دسترس‌پذیری', 4],
        ].map(([title, level]) => emptyItem({ title: String(title), level: Number(level) })),
      }),
      emptySection('languages', {
        items: [
          emptyItem({ title: 'فارسی', x: { level: 'زبان مادری' } }),
          emptyItem({
            title: 'انگلیسی',
            x: { level: 'C1', cert: 'IELTS 7.5', reading: 'C1', writing: 'B2', listening: 'C1', speaking: 'B2' },
          }),
          emptyItem({ title: 'عربی', x: { level: 'مقدماتی' } }),
        ],
      }),
      emptySection('certifications', {
        items: [
          emptyItem({ title: 'Professional Scrum Master I', subtitle: 'Scrum.org', start: d('1400', '9') }),
        ],
      }),
      emptySection('awards', {
        items: [
          emptyItem({
            title: 'رتبه‌ی دوم هکاتون فناوری مالی تهران',
            subtitle: 'انجمن فناوری‌های مالی',
            start: d('1399'),
          }),
        ],
      }),
      emptySection('softSkills', {
        items: ['رهبری تیم', 'حل مسئله', 'مستندسازی', 'منتورینگ'].map((title) => emptyItem({ title })),
      }),
      emptySection('interests', {
        items: ['کوهنوردی', 'عکاسی', 'پروژه‌های متن‌باز'].map((title) => emptyItem({ title })),
      }),
    ],
    settings: { ...defaultSettings },
  }
}
