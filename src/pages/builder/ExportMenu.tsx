import { useRef } from 'react'
import { ChevronDown, Download, FileImage, FileJson, FileText, FileType, FolderOpen, Printer, RotateCcw, Sparkles } from 'lucide-react'
import { Button, Menu, MenuItem } from '@/components/ui'
import { canPrint, fileBase, saveBlob } from '@/export/download'
import { readJsonFile, resumeToJson } from '@/export/json'
import { buildImagePdf, printPdf } from '@/export/pdf'
import { toFaDigits } from '@/lib/text'
import { useResume } from '@/store/useResume'

export type Notice = { kind: 'busy' | 'done' | 'error'; text: string } | null

export function ExportMenu({ notify }: { notify: (n: Notice) => void }) {
  const run = async (busy: string, done: string, job: () => Promise<void>) => {
    notify({ kind: 'busy', text: busy })
    try {
      await job()
      notify({ kind: 'done', text: done })
    } catch (err) {
      // اگر خودِ کاربر ذخیره را لغو کرده باشد، پیام خطا لازم نیست.
      const reason = err as { code?: string; name?: string } | null
      if (reason?.code === 'declined' || reason?.name === 'AbortError') return notify(null)
      console.error(err)
      notify({ kind: 'error', text: 'ساخت فایل انجام نشد. یک بار دیگر امتحان کن.' })
    }
  }

  const name = () => fileBase(useResume.getState().resume.basics.fullName)

  const pdfImage = () =>
    run('در حال ساخت PDF …', 'فایل PDF ذخیره شد.', async () => {
      const root = document.getElementById('export-root')
      if (!root) throw new Error('export root missing')
      const blob = await buildImagePdf(root, (done, total) =>
        notify({ kind: 'busy', text: `در حال ساخت PDF: صفحه‌ی ${toFaDigits(done)} از ${toFaDigits(total)}` }),
      )
      await saveBlob(blob, `${name()}.pdf`)
    })

  const word = () =>
    run('در حال ساخت فایل Word …', 'فایل Word ذخیره شد.', async () => {
      const { buildDocx } = await import('@/export/docx')
      await saveBlob(await buildDocx(useResume.getState().resume), `${name()}.docx`)
    })

  return (
    <Menu
      width="w-80"
      trigger={(p) => (
        <Button variant="primary" {...p}>
          <Download className="size-4" />
          دریافت خروجی
          <ChevronDown className="size-4 opacity-70" />
        </Button>
      )}
    >
      {(close) => (
        <>
          {canPrint && (
            <MenuItem
              icon={<Printer />}
              title="PDF با متن قابل انتخاب"
              note="پنجره‌ی چاپ باز می‌شود؛ مقصد را «Save as PDF» بگذار. برای فرستادن به کارفرما همین بهتر است."
              onClick={() => {
                close()
                printPdf(name())
              }}
            />
          )}
          <MenuItem
            icon={<FileImage />}
            title="PDF تصویری"
            note="مستقیم دانلود می‌شود و عیناً مثل پیش‌نمایش است."
            onClick={() => {
              close()
              void pdfImage()
            }}
          />
          <MenuItem
            icon={<FileType />}
            title="Word (‎.docx‎)"
            note="قابل ویرایش در Word؛ چیدمان به قالب نزدیک است، نه یکسان."
            onClick={() => {
              close()
              void word()
            }}
          />
        </>
      )}
    </Menu>
  )
}

export function ResumeMenu({ notify }: { notify: (n: Notice) => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const replace = useResume((s) => s.replace)
  const loadSample = useResume((s) => s.loadSample)
  const startBlank = useResume((s) => s.startBlank)

  const open = async (file: File | undefined) => {
    if (!file) return
    try {
      replace((await readJsonFile(file)) as never)
      notify({ kind: 'done', text: 'رزومه از فایل پشتیبان باز شد.' })
    } catch {
      notify({ kind: 'error', text: 'این فایل خوانده نشد. فایل پشتیبان باید با پسوند json باشد.' })
    }
  }

  return (
    <>
      <Menu
        width="w-72"
        trigger={(p) => (
          <Button variant="secondary" {...p}>
            <FileText className="size-4" />
            <span className="max-sm:hidden">رزومه</span>
            <ChevronDown className="size-4 opacity-60" />
          </Button>
        )}
      >
        {(close) => (
          <>
            <MenuItem
              icon={<FileJson />}
              title="ذخیره‌ی فایل پشتیبان"
              note="همه‌ی اطلاعات و تنظیمات در یک فایل json."
              onClick={() => {
                close()
                const { resume } = useResume.getState()
                void saveBlob(resumeToJson(resume), `${fileBase(resume.basics.fullName)}.json`).then(() =>
                  notify({ kind: 'done', text: 'فایل پشتیبان ذخیره شد.' }),
                )
              }}
            />
            <MenuItem
              icon={<FolderOpen />}
              title="بازکردن فایل پشتیبان"
              note="رزومه‌ی فعلی با محتوای فایل جایگزین می‌شود."
              onClick={() => {
                close()
                fileRef.current?.click()
              }}
            />
            <div className="my-1.5 border-t border-line" />
            <MenuItem
              icon={<Sparkles />}
              title="پرکردن با رزومه‌ی نمونه"
              note="برای دیدن قالب‌ها با محتوای کامل."
              onClick={() => {
                close()
                loadSample()
              }}
            />
            <MenuItem
              icon={<RotateCcw />}
              title="شروع از برگه‌ی خالی"
              note="محتوا پاک می‌شود؛ قالب و تنظیمات می‌ماند."
              danger
              onClick={() => {
                close()
                startBlank()
              }}
            />
          </>
        )}
      </Menu>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => {
          void open(e.target.files?.[0])
          e.target.value = ''
        }}
      />
    </>
  )
}
