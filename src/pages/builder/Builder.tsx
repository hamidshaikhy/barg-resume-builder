import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { CheckCircle2, Eye, LoaderCircle, PencilLine, TriangleAlert } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { cx } from '@/lib/text'
import { ResumePages } from '@/resume/ResumePages'
import { useResume } from '@/store/useResume'
import { ContentPanel } from './ContentPanel'
import { DesignPanel } from './DesignPanel'
import { ExportMenu, ResumeMenu, type Notice } from './ExportMenu'
import { Preview } from './Preview'

type Tab = 'content' | 'design'
type Pane = 'edit' | 'preview'

/** نسخه‌ی بدون مقیاسِ برگه‌ها برای چاپ و خروجی تصویری؛ بیرون از دید کاربر. */
function ExportRoot() {
  const resume = useResume((s) => s.resume)
  return createPortal(
    <div id="export-root" aria-hidden="true">
      <ResumePages resume={resume} />
    </div>,
    document.body,
  )
}

function NoticeBar({ notice }: { notice: Notice }) {
  if (!notice) return null
  const icon =
    notice.kind === 'busy' ? (
      <LoaderCircle className="size-4 animate-spin" />
    ) : notice.kind === 'done' ? (
      <CheckCircle2 className="size-4 text-emerald-700" />
    ) : (
      <TriangleAlert className="size-4 text-danger" />
    )
  return (
    <div
      role="status"
      className="fixed inset-x-0 top-[72px] z-40 mx-auto flex w-fit max-w-[calc(100vw-2rem)] items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-[13px] shadow-[0_10px_28px_-10px_rgba(17,26,46,0.35)]"
    >
      {icon}
      {notice.text}
    </div>
  )
}

export default function Builder() {
  const resume = useResume((s) => s.resume)
  const [tab, setTab] = useState<Tab>('content')
  const [pane, setPane] = useState<Pane>('edit')
  const [notice, setNotice] = useState<Notice>(null)

  useEffect(() => {
    document.title = 'ساخت رزومه | برگ'
  }, [])

  useEffect(() => {
    if (!notice || notice.kind === 'busy') return
    const t = setTimeout(() => setNotice(null), 4000)
    return () => clearTimeout(t)
  }, [notice])

  return (
    <div className="flex h-dvh flex-col bg-paper">
      <header className="z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-line bg-surface px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-4">
          <Link to="/" aria-label="برگ، صفحه‌ی نخست" className="shrink-0 rounded-md text-ink">
            <Logo />
          </Link>
          <span className="hidden text-[13px] text-muted md:block">هر تغییر خودکار روی همین مرورگر ذخیره می‌شود.</span>
        </div>
        <div className="flex items-center gap-2">
          <ResumeMenu notify={setNotice} />
          <ExportMenu notify={setNotice} />
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside
          className={cx(
            'w-full shrink-0 flex-col border-e border-line bg-surface lg:flex lg:w-[470px]',
            pane === 'edit' ? 'flex' : 'hidden',
          )}
        >
          <div role="tablist" aria-label="بخش‌های ویرایشگر" className="flex shrink-0 gap-1 border-b border-line px-3 pt-2">
            {(
              [
                ['content', 'محتوا'],
                ['design', 'قالب و ظاهر'],
              ] as const
            ).map(([id, name]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={cx(
                  '-mb-px h-10 border-b-2 px-4 text-sm transition-colors',
                  tab === id ? 'border-ink font-bold text-ink' : 'border-transparent text-muted hover:text-ink',
                )}
              >
                {name}
              </button>
            ))}
          </div>
          <div className="thin-scroll min-h-0 flex-1 overflow-y-auto p-3 pb-24 lg:pb-6">
            {tab === 'content' ? <ContentPanel /> : <DesignPanel />}
          </div>
        </aside>

        <main className={cx('min-w-0 flex-1 flex-col lg:flex', pane === 'preview' ? 'flex' : 'hidden')}>
          <Preview resume={resume} />
        </main>
      </div>

      <nav
        aria-label="جابه‌جایی بین ویرایش و پیش‌نمایش"
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-surface p-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom,0px))] lg:hidden"
      >
        {(
          [
            ['edit', 'ویرایش', <PencilLine key="i" className="size-4" />],
            ['preview', 'پیش‌نمایش', <Eye key="i" className="size-4" />],
          ] as const
        ).map(([id, name, icon]) => (
          <button
            key={id}
            type="button"
            aria-pressed={pane === id}
            onClick={() => setPane(id)}
            className={cx(
              'flex h-10 flex-1 items-center justify-center gap-2 rounded-lg text-sm',
              pane === id ? 'bg-ink font-semibold text-white' : 'text-muted',
            )}
          >
            {icon}
            {name}
          </button>
        ))}
      </nav>

      <NoticeBar notice={notice} />
      <ExportRoot />
    </div>
  )
}
