import type { CSSProperties } from 'react'
import { ArrowLeft, ArrowUpLeft, Bug, Star } from 'lucide-react'
import { cx, toFaDigits } from '@/lib/text'
import { SCENE, useLanding } from './scroll'
import { CtaLink, Doodle, GITHUB_URL, GithubIcon, labelClass, proseClass } from './ui'

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹'

/** عددی که رقم‌هایش، ستون به ستون، می‌چرخند و سر جایشان می‌نشینند. */
function RollingNumber({ value, roll, delay }: { value: number; roll: boolean; delay: number }) {
  const text = toFaDigits(value)
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" dir="ltr" className="inline-flex">
        {Array.from(text).map((character, index) => {
          const digit = FA_DIGITS.indexOf(character)
          // ستون به پهنای رقم پایانی‌اش است، نه پهن‌ترین رقم؛ وگرنه رقم‌های باریک فارسی از هم دور می‌افتند.
          return (
            <span key={index} className="relative inline-block h-[1.2em] overflow-hidden">
              <span className="invisible block leading-[1.2]">{character}</span>
              <span
                className="absolute inset-x-[-50%] top-0 flex translate-y-[calc(var(--offset)*1.2em)] flex-col items-center transition-transform duration-[2s] ease-[cubic-bezier(.2,.8,.2,1)]"
                style={{ '--offset': roll ? -Math.max(0, digit) : 0, transitionDelay: `${delay + index * 80}ms` } as CSSProperties}
              >
                {digit === -1 ? (
                  <span className="h-[1.2em] leading-[1.2]">{character}</span>
                ) : (
                  Array.from(FA_DIGITS).map((glyph) => (
                    <span key={glyph} className="h-[1.2em] leading-[1.2]">
                      {glyph}
                    </span>
                  ))
                )}
              </span>
            </span>
          )
        })}
      </span>
    </>
  )
}

const facts = [
  { value: 22, label: 'بخش آماده', detail: 'از سوابق کاری و تحصیلات تا مقاله و اختراع' },
  { value: 10, label: 'قالب رسمی', detail: 'همه خلوت، همه راست‌به‌چپ' },
  { value: 60, label: 'ترکیب قالب و رنگ', detail: 'شش رنگ‌بندی برای هر قالب' },
  { value: 0, label: 'ثبت‌نام', detail: 'و هیچ سروری؛ رزومه در مرورگر خودت می‌ماند' },
]

/** ۰۶ اعداد. */
export function Numbers() {
  const inView = useLanding((state) => state.numbersInView)
  return (
    <section data-scene={SCENE.numbers} aria-labelledby="numbers-title" className="relative mx-auto max-w-[1440px] px-(--gutter) pt-[18vh] pb-[10vh]">
      <Doodle
        name="leaf"
        wipe="clamp(0, (var(--p) - .2) / .25, 1)"
        className="end-[24vw] top-[13vh] w-[9vw] translate-y-[calc(var(--p)*-40px)] rotate-[-14deg] max-[900px]:hidden"
      />
      <h2 id="numbers-title" className={cx(labelClass, 'text-l-ink-3')}>
        برگ، به عدد
      </h2>
      <dl className="mt-[22px]">
        {facts.map((row, index) => (
          <div key={row.label} className="flex flex-wrap items-end justify-between gap-x-10 gap-y-3 border-t border-l-line py-[3vh]">
            <dt className="flex flex-col gap-1 pb-[1.4vh]">
              <span className={cx(labelClass, 'text-l-ink-3')}>{row.label}</span>
              <span className="font-l-serif text-[clamp(21px,1.9vw,29px)] leading-[1.3] text-l-ink-2">{row.detail}</span>
            </dt>
            <dd className="text-[clamp(60px,8vw,144px)] leading-none font-extralight text-l-ink">
              <RollingNumber value={row.value} roll={inView} delay={index * 150} />
            </dd>
          </div>
        ))}
      </dl>
      <p className="border-t border-l-line pt-3.5 text-[13px] text-l-ink-3">این‌ها را می‌شمریم، نه آدم‌ها را؛ برگ هیچ آماری از تو جمع نمی‌کند.</p>
    </section>
  )
}

const pillLinkClass =
  'flex h-10 items-center gap-2 rounded-full border border-l-line-2 px-3.5 text-sm font-medium text-l-ink transition-colors hover:bg-l-hover'
const receiptButtonClass = 'flex h-[42px] items-center justify-between rounded-md px-3.5 text-sm font-bold transition-colors'

/** ۰۷ رایگان: رسیدی که جمعش صفر است. */
export function Support() {
  const date = new Intl.DateTimeFormat('fa-IR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())
  const free = '۰'
  const none = 'ندارد'
  const lineItems = [
    ['رزومه‌ساز', free],
    ['قالب‌ها × ۱۰', free],
    ['رنگ‌بندی‌ها × ۶', free],
    ['خروجی PDF و Word', free],
    ['فایل پشتیبان', free],
    ['ثبت‌نام', none],
    ['تبلیغ', none],
    ['ردیابی', none],
  ] as const
  const pills = [
    { href: GITHUB_URL, icon: GithubIcon, label: 'کد در گیت‌هاب' },
    { href: `${GITHUB_URL}/issues`, icon: Bug, label: 'گزارش اشکال' },
    { href: GITHUB_URL, icon: Star, label: 'ستاره بده' },
  ]

  return (
    <section
      id="support"
      data-scene={SCENE.support}
      aria-labelledby="support-title"
      className="relative mx-auto grid max-w-[1440px] grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))] items-start gap-16 border-t border-l-line px-(--gutter) pt-[12vh] pb-[16vh]"
    >
      <Doodle
        name="jar"
        wipe="clamp(0, (var(--p) - .3) / .2, 1)"
        className="start-[3vw] bottom-[4vh] w-[9vw] translate-y-[calc(var(--p)*-30px)] rotate-[-4deg] max-[900px]:hidden"
      />

      <div className="flex flex-col gap-[22px] pt-[4vh]">
        <span className={cx(labelClass, 'text-l-ink-3')}>هزینه</span>
        <h2 id="support-title" className="text-[clamp(52px,6vw,108px)] leading-[1.15] font-extralight text-l-ink">
          همیشه <em className="font-l-serif text-[1.15em] font-medium text-l-accent-text not-italic">رایگان</em>
        </h2>
        <p className={cx(proseClass, 'max-w-[26em] text-l-ink-2')}>
          برگ رایگان است و کدش روی گیت‌هاب برای همه باز است: ببینش، از آن استفاده کن یا بهترش کن. نه نسخه‌ی پولی دارد، نه تبلیغ و نه ثبت‌نام.
        </p>
        <ul className="flex flex-wrap gap-2">
          {pills.map((pill) => (
            <li key={pill.label}>
              <a href={pill.href} target="_blank" rel="noreferrer" className={pillLinkClass}>
                <pill.icon aria-hidden="true" className="size-[18px] text-l-ink-2" />
                {pill.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex w-[min(100%,400px)] flex-col items-center justify-self-center">
        <div
          aria-hidden="true"
          className="relative z-2 h-[18px] w-[calc(100%+36px)] rounded-[9px] bg-l-ink shadow-[inset_0_-4px_0_oklch(0_0_0/.35),0_6px_14px_-6px_oklch(0_0_0/.4)]"
        >
          <span className="absolute inset-x-[18px] top-2 h-[3px] rounded-[2px] bg-[oklch(0_0_0/.6)]" />
        </div>
        <div className="-mx-3 -mt-[9px] box-content w-full overflow-hidden px-3 pb-10">
          <div className="translate-y-[calc((1-clamp(0,var(--p)*1.7-.15,1))*-100%)] drop-shadow-[0_18px_24px_oklch(0.2_0.01_95/.22)] [transition:translate_.4s_linear]">
            <div className="receipt-paper bg-[#fdfcf8] px-[26px] pt-[30px] pb-[46px] text-[14.5px] leading-[1.9] font-medium text-[oklch(0.25_0.01_95)] tabular-nums">
              <div className="mb-4 flex flex-col gap-0.5 text-center">
                <b className="font-title text-[30px] leading-[1.2] font-bold">برگ</b>
                <span className="text-[oklch(0.5_0.01_95)]">رزومه‌ساز فارسیِ رایگان</span>
                <span className="text-[oklch(0.5_0.01_95)]">{date}</span>
              </div>
              <dl className="grid grid-cols-[1fr_auto] gap-x-3.5 border-t-[1.5px] border-dashed border-[oklch(0.7_0.01_95)] pt-2.5">
                {lineItems.map(([item, amount]) => (
                  <div key={item} className="contents">
                    <dt>{item}</dt>
                    <dd>{amount}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-2.5 flex justify-between border-t-[1.5px] border-dashed border-[oklch(0.7_0.01_95)] pt-2.5 text-[17px] font-black">
                <span>جمع</span>
                <span>۰ تومان</span>
              </p>
              <p className="mt-2.5 border-t-[1.5px] border-dashed border-[oklch(0.7_0.01_95)] pt-3 text-[oklch(0.4_0.01_95)]">
                هزینه‌ای ندارد. اگر به کارت آمد، این‌طور پشتش باش:
              </p>
              <div className="mt-2.5 flex flex-col gap-1.5">
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noreferrer"
                  className={cx(receiptButtonClass, 'bg-[oklch(0.22_0.01_95)] text-white hover:bg-[oklch(0.32_0.01_95)]')}
                >
                  یک ستاره در گیت‌هاب
                  <ArrowUpLeft aria-hidden="true" className="size-[19px]" />
                </a>
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noreferrer"
                  className={cx(receiptButtonClass, 'border border-[oklch(0.82_0.008_95)] text-[oklch(0.22_0.01_95)] hover:bg-[oklch(0.96_0.005_95)]')}
                >
                  دیدن کد منبع
                  <ArrowUpLeft aria-hidden="true" className="size-[19px]" />
                </a>
              </div>
              <div aria-hidden="true" className="receipt-barcode mx-auto mt-[18px] mb-1.5 h-11 w-[78%]" />
              <p className="text-center text-[oklch(0.5_0.01_95)]">ممنون که سر زدی.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

interface Question {
  question: string
  answer: string
  link?: { label: string; href: string }
}

const questions: Question[] = [
  {
    question: 'برگ واقعاً رایگان است؟',
    answer: 'بله. همه‌ی امکاناتش رایگان است: ده قالب، شش رنگ‌بندی برای هر قالب، خروجی PDF و Word و فایل پشتیبان. نه نسخه‌ی پولی دارد، نه تبلیغ و نه ثبت‌نام.',
  },
  {
    question: 'اطلاعاتم کجا می‌رود؟',
    answer: 'هیچ‌جا. رزومه فقط در حافظه‌ی مرورگر خودت ذخیره می‌شود و به هیچ سروری فرستاده نمی‌شود. برای بردنش به دستگاه دیگر، فایل پشتیبان بگیر و آنجا بازش کن.',
  },
  {
    question: 'تاریخ شمسی دارد؟',
    answer: 'بله. ماه را از فهرست انتخاب می‌کنی و سال را می‌نویسی. اگر رزومه را برای جای دیگری می‌فرستی، تقویم میلادی هم هست.',
  },
  {
    question: 'رزومه‌ی انگلیسی هم می‌سازد؟',
    answer: 'بله. با یک گزینه برگه چپ‌به‌راست می‌شود و عنوان بخش‌ها انگلیسی؛ متن‌ها را هم خودت انگلیسی می‌نویسی. ارقام را هم می‌توانی لاتین کنی.',
  },
  {
    question: 'چه فایل‌هایی می‌توانم بگیرم؟',
    answer: 'PDF با متن قابل انتخاب (از پنجره‌ی چاپ مرورگر)، PDF تصویری که مستقیم دانلود می‌شود، Word برای ویرایش، و فایل پشتیبان json که بعداً دوباره در برگ باز می‌شود.',
  },
  {
    question: 'اگر رزومه‌ام از یک برگه بیشتر شد؟',
    answer: 'برگ خودش صفحه‌بندی می‌کند: وقتی برگه پر شد ادامه به برگه‌ی بعد می‌رود و هیچ تیتری از متنش جدا نمی‌افتد.',
  },
  {
    question: 'کدش کجاست؟',
    answer: 'روی گیت‌هاب. می‌توانی ببینی‌اش، رویش کار کنی یا اگر جایی درست کار نکرد، گزارشش را بدهی.',
    link: { label: 'مخزن برگ در گیت‌هاب', href: GITHUB_URL },
  },
]

// مدادی که دور شماره‌ی پرسش می‌چرخد و از نقطه‌ی شروعش کمی جلوتر می‌رود، مثل دستی که دایره می‌کشد.
const circlePath = 'M18 44C6 38 3 24 14 14C28 3 66 2 84 10C99 17 99 33 86 41C70 50 32 51 14 42C6 37 7 27 16 20'
// زیرخط مدادی پرسش، کمی ناهموار؛ از راست به چپ کشیده می‌شود.
const underlinePath = 'M298 7C270 4 242 9 204 6S140 3 104 7S38 9 2 5'

function FaqItem({ item, index }: { item: Question; index: number }) {
  return (
    <details name="faq" className="faq-item border-b border-l-line">
      <summary className="flex cursor-pointer list-none items-start gap-5 rounded-sm py-6 outline-offset-4 focus-visible:outline-2 focus-visible:outline-l-accent [&::-webkit-details-marker]:hidden">
        <span className={cx(labelClass, 'relative mt-[.55em] w-8 shrink-0 text-center text-l-ink-3')}>
          {toFaDigits(String(index + 1).padStart(2, '0'))}
          <svg
            aria-hidden="true"
            viewBox="0 0 100 52"
            preserveAspectRatio="none"
            className="pointer-events-none absolute -inset-x-2.5 -inset-y-2.5 size-[calc(100%+20px)] overflow-visible text-l-accent"
          >
            <path data-stroke="circle" pathLength={1} d={circlePath} strokeWidth={2.6} />
          </svg>
        </span>
        <h3 className="flex-1 text-[clamp(21px,2vw,30px)] leading-[1.45] font-light text-pretty text-l-ink">
          <span className="relative inline-block pb-1.5">
            {item.question}
            <svg
              aria-hidden="true"
              viewBox="0 0 300 12"
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-x-0 -bottom-1 h-2.5 w-full overflow-visible text-l-ink-3"
            >
              <path data-stroke="underline" pathLength={1} d={underlinePath} strokeWidth={1.6} />
            </svg>
          </span>
        </h3>
        <span aria-hidden="true" data-plus className="relative mt-[.7em] size-5 shrink-0 text-l-ink-2">
          <span className="absolute inset-x-0 top-1/2 h-[1.5px] -translate-y-1/2 rounded-full bg-current" />
          <span className="absolute inset-y-0 left-1/2 w-[1.5px] -translate-x-1/2 rounded-full bg-current" />
        </span>
      </summary>

      <div className="ps-13 pe-2 pb-8">
        <div
          data-note
          className="relative rounded-[3px] bg-white px-6 py-5 text-[oklch(0.28_0.01_95)] shadow-[0_1px_2px_oklch(0.2_0.01_95/.12),0_18px_36px_-18px_oklch(0.2_0.01_95/.4)]"
          style={{ '--tilt': `${index % 2 === 0 ? 0.5 : -0.4}deg` } as CSSProperties}
        >
          <p className={proseClass}>{item.answer}</p>
          {item.link && (
            <a
              href={item.link.href}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-[14.5px] font-bold text-[oklch(0.42_0.1_150)] underline underline-offset-[5px] transition-colors hover:text-[oklch(0.32_0.1_150)]"
            >
              {item.link.label}
              <ArrowLeft aria-hidden="true" className="size-4" />
            </a>
          )}
        </div>
      </div>
    </details>
  )
}

/**
 * ۰۸ پرسش‌ها، مثل یادداشت‌های تاخورده. بازکردن یک پرسش دور شماره‌اش را با مداد خط می‌کشد، زیرش خط می‌کشد و پاسخ
 * را باز می‌کند؛ هر بار فقط یکی باز می‌ماند.
 */
export function Faq() {
  return (
    <section
      id="faq"
      data-scene={SCENE.faq}
      aria-labelledby="faq-title"
      className="relative mx-auto grid max-w-[1440px] items-start gap-x-16 gap-y-10 border-t border-l-line px-(--gutter) pt-[12vh] pb-[14vh] min-[900px]:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
    >
      <Doodle
        name="note"
        wipe="clamp(0, (var(--p) - .3) / .2, 1)"
        className="start-[4vw] bottom-[8vh] w-[11vw] translate-y-[calc(var(--p)*-30px)] rotate-[6deg] max-[900px]:hidden"
      />

      <div className="flex flex-col gap-[22px] min-[900px]:sticky min-[900px]:top-[14vh]">
        <span className={cx(labelClass, 'text-l-ink-3')}>پرسش‌ها</span>
        <h2 id="faq-title" className="text-[clamp(52px,6vw,108px)] leading-[1.15] font-extralight text-l-ink">
          پرسیدند،{' '}
          <em className="font-l-serif text-[1.15em] font-medium text-l-accent-text not-italic">جواب دادیم</em>
        </h2>
        <p className={cx(proseClass, 'max-w-[22em] text-l-ink-2')}>
          {toFaDigits(questions.length)} جواب کوتاه به چیزهایی که پیش از شروع می‌پرسند. سؤال دیگری داری؟ در{' '}
          <a
            href={`${GITHUB_URL}/issues`}
            target="_blank"
            rel="noreferrer"
            className="text-l-accent-text underline underline-offset-[5px] transition-colors hover:text-l-accent-hover"
          >
            گیت‌هاب
          </a>{' '}
          بپرس.
        </p>
      </div>

      <div className="border-t border-l-line">
        {questions.map((item, index) => (
          <FaqItem key={item.question} item={item} index={index} />
        ))}
      </div>
    </section>
  )
}

/** ۰۹ دعوت پایانی. */
export function Closing() {
  return (
    <section
      aria-labelledby="closing-title"
      className="relative mx-auto flex max-w-[1440px] flex-col items-center gap-7 border-t border-l-line px-(--gutter) pt-[16vh] pb-[12vh] text-center"
    >
      <span className={cx(labelClass, 'text-l-ink-3')}>نوبت توست</span>
      <h2 id="closing-title" className="text-[clamp(52px,6.4vw,116px)] leading-[1.2] font-extralight text-balance text-l-ink">
        همه را روی <em className="font-l-serif text-[1.15em] font-medium text-l-accent-text not-italic">یک برگ</em> بیاور
      </h2>
      <p className={cx(proseClass, 'max-w-[26em] text-l-ink-2')}>
        با یک رزومه‌ی نمونه شروع می‌کنی و متن‌ها را با حرف‌های خودت عوض می‌کنی. چند دقیقه بیشتر وقت نمی‌برد و هر وقت خواستی برمی‌گردی.
      </p>
      <CtaLink size="closing" />
    </section>
  )
}

/** پایان صفحه: واژه‌ی «برگ» از خط افق بالا می‌آید و بازتابش، سبز و محو، در آب پایین می‌رود. */
export function EndMark() {
  return (
    <div data-scene={SCENE.end} aria-hidden="true" className="endmark mx-auto max-w-[1440px] px-(--gutter) pt-[6vh]">
      <div className="endmark-word endmark-up text-center text-l-ink">
        <span>برگ</span>
      </div>
      <div className="h-px bg-l-line" />
      <div className="endmark-word endmark-down text-center text-l-accent-text">
        <span>برگ</span>
      </div>
    </div>
  )
}
