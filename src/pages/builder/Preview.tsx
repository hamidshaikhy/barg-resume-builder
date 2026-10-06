import { useCallback, useEffect, useRef, useState } from 'react'
import { Minus, Plus, ScanLine } from 'lucide-react'
import { IconButton } from '@/components/ui'
import { toFaDigits } from '@/lib/text'
import { ResumePages } from '@/resume/ResumePages'
import type { Resume } from '@/resume/types'

const ZOOMS = [0.5, 0.65, 0.8, 1, 1.25, 1.5]

/** پیش‌نمایش زنده: برگه‌ها با اندازه‌ی واقعی رسم و با transform کوچک می‌شوند. */
export function Preview({ resume }: { resume: Resume }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const [fit, setFit] = useState(0.7)
  const [zoom, setZoom] = useState<number | null>(null)
  const [size, setSize] = useState({ w: 794, h: 1123 })
  const [pages, setPages] = useState(1)
  const onPageCount = useCallback((n: number) => setPages(n), [])

  useEffect(() => {
    const wrap = wrapRef.current
    const sheet = sheetRef.current
    if (!wrap || !sheet) return
    const measure = () => {
      const w = sheet.offsetWidth || 794
      setSize({ w, h: sheet.offsetHeight || 1123 })
      setFit(Math.min(1, Math.max(0.2, (wrap.clientWidth - 48) / w)))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(wrap)
    ro.observe(sheet)
    return () => ro.disconnect()
  }, [])

  const scale = zoom ?? fit
  const step = (dir: 1 | -1) => {
    const sorted = [...ZOOMS].sort((a, b) => a - b)
    const next = dir > 0 ? sorted.find((z) => z > scale + 0.01) : [...sorted].reverse().find((z) => z < scale - 0.01)
    if (next) setZoom(next)
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-paper-2">
      <div ref={wrapRef} className="thin-scroll min-h-0 flex-1 overflow-auto px-4 pt-6 pb-24" dir="ltr">
        <div className="relative mx-auto" style={{ width: size.w * scale, height: size.h * scale }}>
          <div
            ref={sheetRef}
            className="absolute top-0 left-0 flex w-[210mm] flex-col gap-6 [&>.r-page]:shadow-[0_1px_2px_rgba(17,26,46,0.08),0_12px_32px_-12px_rgba(17,26,46,0.28)]"
            style={{ transform: `scale(${scale})`, transformOrigin: '0 0' }}
          >
            <ResumePages resume={resume} onPageCount={onPageCount} />
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-line bg-surface/95 px-2 py-1 text-[13px] shadow-[0_8px_24px_-10px_rgba(17,26,46,0.35)] backdrop-blur">
          <span className="px-2 text-muted">{toFaDigits(pages)} صفحه</span>
          <span className="h-4 w-px bg-line" />
          <IconButton label="کوچک‌تر" onClick={() => step(-1)}>
            <Minus className="size-4" />
          </IconButton>
          <span className="w-11 text-center tabular-nums">{toFaDigits(Math.round(scale * 100))}٪</span>
          <IconButton label="بزرگ‌تر" onClick={() => step(1)}>
            <Plus className="size-4" />
          </IconButton>
          <IconButton label="هم‌اندازه‌ی پنجره" active={zoom === null} onClick={() => setZoom(null)}>
            <ScanLine className="size-4" />
          </IconButton>
        </div>
      </div>
    </div>
  )
}
