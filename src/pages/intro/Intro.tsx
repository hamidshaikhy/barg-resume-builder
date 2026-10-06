import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Link2, UserRound } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { toFaDigits } from '@/lib/text'
import { sectionDefs, sectionOrder } from '@/resume/sections'
import type { SectionKind } from '@/resume/types'
import { sectionIcons } from '@/components/sectionIcons'
import { Stage, StartButton } from './Stage'

/** آنچه در هر بخش می‌شود نوشت؛ کوتاه و فهرست‌وار. */
const contents: Record<SectionKind, string> = {
  summary: 'چند جمله درباره‌ی تخصص، تجربه و هدف شغلی.',
  experience: 'سمت، شرکت، نوع همکاری، بازه‌ی زمانی، دستاوردها و فناوری‌ها.',
  education: 'مقطع و رشته، دانشگاه، گرایش، معدل و عنوان پایان‌نامه.',
  skills: 'تکی یا گروه‌بندی‌شده؛ به شکل برچسب، فهرست، نوار یا نقطه.',
  projects: 'نام پروژه، کارفرما یا نقش، توضیح، فناوری‌ها و پیوند.',
  languages: 'سطح کلی، چهار مهارت جدا از A1 تا C2 و مدرک زبان.',
  certifications: 'نام گواهینامه، صادرکننده، تاریخ و شناسه‌ی مدرک.',
  courses: 'نام دوره، مؤسسه یا مدرس، تاریخ و مدت.',
  softSkills: 'کار تیمی، حل مسئله، مدیریت زمان و مانند این‌ها.',
  awards: 'رتبه‌ها، جایزه‌ها و تقدیرنامه‌ها.',
  publications: 'عنوان، نشریه یا ناشر، نویسندگان همکار و DOI.',
  research: 'عنوان پژوهش، آزمایشگاه، استاد راهنما و بازه‌ی زمانی.',
  teaching: 'تدریس، حل‌تمرین، منتورینگ و کارگاه.',
  talks: 'عنوان ارائه، رویداد، شهر و پیوند اسلاید یا ویدیو.',
  patents: 'عنوان اختراع، مرجع ثبت و شماره‌ی ثبت.',
  volunteer: 'نقش، سازمان و بازه‌ی زمانی.',
  memberships: 'انجمن‌های علمی و نهادهای حرفه‌ای.',
  interests: 'دو تا پنج علاقه‌مندی کوتاه.',
  references: 'نام، سمت، نسبت کاری و راه تماس.',
  extra: 'هر عنوان و مقدار کوتاه: گواهینامه‌ی رانندگی، زمان شروع به کار و …',
  custom: 'عنوان بخش و فیلدهایش با خودت؛ هر چند تا که بخواهی.',
}

const inventory = [
  { name: 'اطلاعات شخصی', hint: 'نام، عنوان شغلی، عکس، راه‌های تماس، تاریخ تولد، تأهل و نظام وظیفه.', icon: <UserRound /> },
  { name: 'شبکه‌ها و پیوندها', hint: 'لینکدین، گیت‌هاب، تلگرام و هر پیوند دیگر.', icon: <Link2 /> },
  ...sectionOrder.map((kind) => ({ name: sectionDefs[kind].name, hint: contents[kind], icon: sectionIcons[kind] })),
]

const facts = [
  {
    title: 'ثبت‌نام ندارد.',
    text: 'اطلاعاتت فقط روی مرورگر خودت ذخیره می‌شود و به هیچ سروری فرستاده نمی‌شود.',
  },
  {
    title: 'تاریخ شمسی دارد.',
    text: 'ماه را از فهرست انتخاب می‌کنی و سال را می‌نویسی. اگر لازم شد، میلادی هم هست.',
  },
  {
    title: 'راست‌به‌چپِ درست.',
    text: 'ایمیل، نشانی و واژه‌های انگلیسیِ وسط متن فارسی سر جای خودشان می‌مانند؛ در PDF و در Word.',
  },
  {
    title: 'خودش صفحه‌بندی می‌کند.',
    text: 'وقتی برگه پر شد ادامه به برگه‌ی بعد می‌رود و هیچ تیتری از متنش جدا نمی‌افتد.',
  },
  {
    title: 'رزومه‌ی انگلیسی هم می‌سازد.',
    text: 'با یک گزینه برگه چپ‌به‌راست می‌شود و عنوان بخش‌ها انگلیسی.',
  },
  {
    title: 'فایل پشتیبان می‌دهد.',
    text: 'رزومه را در یک فایل نگه دار و هر وقت خواستی، روی هر دستگاهی، دوباره بازش کن.',
  },
]

function TopBar() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] sm:px-5">
      <div className="pointer-events-auto mx-auto flex h-14 max-w-6xl items-center justify-between rounded-full border border-line bg-surface ps-5 pe-2 shadow-[0_10px_30px_-18px_rgba(17,26,46,0.45)]">
        <Link to="/" aria-label="برگ، بالای صفحه" className="rounded-md text-ink" onClick={() => window.scrollTo({ top: 0 })}>
          <Logo />
        </Link>
        <Link
          to="/builder"
          className="inline-flex h-10 items-center rounded-full bg-ink px-5 text-sm font-bold text-white transition-colors hover:bg-brand"
        >
          ساخت رزومه
        </Link>
      </div>
    </header>
  )
}

export default function Intro() {
  useEffect(() => {
    document.title = 'برگ | رزومه‌ساز فارسی'
  }, [])

  return (
    <div className="bg-paper text-ink">
      <TopBar />
      <main>
        <Stage />

        <section className="border-t border-line bg-surface">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-[minmax(0,5fr)_minmax(0,8fr)] md:gap-16 md:py-28">
            <div className="md:sticky md:top-28 md:self-start">
              <h2 className="font-title text-[clamp(40px,5.2vw,72px)] leading-[1.25] font-bold text-balance">
                هیچ بخشی جا نمانده.
              </h2>
              <p className="mt-5 max-w-[34ch] text-[17px] leading-9 text-muted">
                {toFaDigits(inventory.length - 1)} بخش آماده و یک بخش دلخواه که عنوان و فیلدهایش با خودت است. هر کدام را لازم نداری پنهان کن؛
                ترتیب‌شان را هم با کشیدن عوض کن.
              </p>
            </div>
            <ul className="grid gap-x-10 sm:grid-cols-2">
              {inventory.map((item) => (
                <li key={item.name} className="flex gap-3.5 border-b border-line py-4">
                  <span className="mt-1 shrink-0 text-brand [&>svg]:size-5">{item.icon}</span>
                  <span className="min-w-0">
                    <span className="block text-[15px] font-bold">{item.name}</span>
                    <span className="block text-[13px] leading-6 text-muted">{item.hint}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bg-paper">
          <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
            <h2 className="max-w-[16ch] font-title text-[clamp(40px,5.2vw,72px)] leading-[1.25] font-bold text-balance">
              چند چیز کوچک که کار را راحت می‌کند.
            </h2>
            <dl className="mt-12 grid gap-x-16 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {facts.map((f) => (
                <div key={f.title} className="border-t-2 border-ink pt-4">
                  <dt className="text-lg font-bold">{f.title}</dt>
                  <dd className="mt-2 max-w-[38ch] text-[15px] leading-8 text-muted">{f.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="bg-ink text-white">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-8 px-5 py-24 md:flex-row md:items-end md:justify-between md:py-32">
            <div>
              <h2 className="font-title text-[clamp(64px,11vw,176px)] leading-[1.1] font-bold">نوبت توست.</h2>
              <p className="mt-6 max-w-[40ch] text-[17px] leading-9 text-[#a7b0c2]">
                با یک رزومه‌ی نمونه شروع می‌کنی و متن‌ها را با حرف‌های خودت عوض می‌کنی. چند دقیقه بیشتر وقت نمی‌برد.
              </p>
            </div>
            <StartButton className="!h-16 shrink-0 !bg-white !px-12 !text-lg !text-ink hover:!bg-brand-soft" />
          </div>
        </section>
      </main>

      <footer className="bg-ink text-[#a7b0c2]">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 border-t border-white/10 px-5 py-8 text-[13px] sm:flex-row sm:items-center sm:justify-between">
          <Logo tone="light" className="text-white [--logo-accent:#8fa6ee]" />
          <p>
            طراحی و توسعه:{' '}
            <a href="https://github.com/hamidshaikhy" target="_blank" rel="noreferrer" className="font-semibold text-white underline-offset-4 hover:underline">
              حمید شیخی
            </a>
            <span className="mx-2 opacity-40">|</span>
            <span dir="ltr">React, TypeScript, Tailwind CSS, Vite</span>
          </p>
        </div>
      </footer>
    </div>
  )
}
