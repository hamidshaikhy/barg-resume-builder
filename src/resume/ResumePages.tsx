import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { digits, tint } from '@/lib/text'
import { buildDocument, type Block, type BuiltDocument } from './document'
import { fonts, paletteOf } from './templates'
import type { Resume } from './types'
import './resume.css'

const MARGIN_MM = { compact: 11, normal: 15, relaxed: 19 } as const

/** متغیرهای CSS هر برگه: رنگ تیترها و قاب‌ها، قلم، اندازه و حاشیه. */
export function pageVars(resume: Resume, doc: BuiltDocument): CSSProperties {
  const { settings } = resume
  const accent = paletteOf(doc.template, settings.palette).hex
  const font = fonts[settings.font] ?? fonts.vazirmatn
  return {
    '--a': accent,
    '--a-line': tint(accent, 0.45),
    '--a-soft': tint(accent, 0.22),
    '--a-tint': tint(accent, 0.07),
    '--r-font': font.stack,
    '--r-fs': `${(9.4 * settings.fontScale * font.scale).toFixed(2)}pt`,
    '--r-lh': String(settings.lineHeight),
    '--r-m': `${MARGIN_MM[settings.margin] ?? 15}mm`,
  } as CSSProperties
}

interface Layout {
  main: string[][]
  side: string[][]
}

interface Measured {
  id: string
  h: number
  keep: boolean
}

/** بلوک‌ها را به ترتیب در صفحه‌ها می‌چیند و تیتر را از محتوای بعدش جدا نمی‌کند. */
export function paginate(blocks: Measured[], first: number, rest: number): string[][] {
  const pages: string[][] = [[]]
  let used = 0
  let avail = first
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i]
    let need = b.h
    let j = i
    while (blocks[j].keep && j + 1 < blocks.length) {
      j += 1
      need += blocks[j].h
    }
    if (used > 0 && used + need > avail + 0.5) {
      pages.push([])
      used = 0
      avail = rest
    }
    pages[pages.length - 1].push(b.id)
    used += b.h
  }
  return pages
}

function BlockList({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b) => (
        <div key={b.id} data-bid={b.id} className={b.className ? `r-block ${b.className}` : 'r-block'}>
          {b.node}
        </div>
      ))}
    </>
  )
}

interface PageProps {
  resume: Resume
  doc: BuiltDocument
  showHeader: boolean
  main: Block[]
  side: Block[]
  pageNo?: number
  total?: number
  style: CSSProperties
}

function Page({ resume, doc, showHeader, main, side, pageNo, total, style }: PageProps) {
  const tpl = doc.template
  const { lang } = resume.settings
  const twoCol = tpl.layout === 'sidebar' || tpl.layout === 'split'
  return (
    <div
      className="r-page"
      data-t={tpl.id}
      data-layout={tpl.layout}
      data-entry={tpl.entry}
      data-first={showHeader ? '' : undefined}
      dir={lang === 'fa' ? 'rtl' : 'ltr'}
      lang={lang}
      style={style}
    >
      <div className="r-deco" aria-hidden="true" />
      {showHeader && doc.header}
      <div className="r-body">
        {twoCol && (
          <div className="r-col r-col-side" data-col="side">
            <BlockList blocks={side} />
          </div>
        )}
        <div className="r-col r-col-main" data-col="main">
          <BlockList blocks={main} />
        </div>
      </div>
      {total !== undefined && total > 1 && pageNo !== undefined && (
        <div className="r-pageno">
          {lang === 'fa'
            ? digits(`صفحه‌ی ${pageNo} از ${total}`, resume.settings.digits)
            : `Page ${pageNo} of ${total}`}
        </div>
      )}
    </div>
  )
}

interface ResumePagesProps {
  resume: Resume
  /** فقط همین تعداد برگه نمایش داده شود (برای پیش‌نمایش‌های کوچک). */
  maxPages?: number
  onPageCount?: (count: number) => void
}

/**
 * رزومه را روی برگه‌های A4 واقعی (۲۱۰ × ۲۹۷ میلی‌متر) رسم می‌کند.
 * یک نسخه‌ی پنهان از کل محتوا بیرون از صفحه ساخته می‌شود تا ارتفاع بلوک‌ها
 * بدون اثر scale و transform اندازه‌گیری شود.
 */
export function ResumePages({ resume, maxPages, onPageCount }: ResumePagesProps) {
  const doc = useMemo(() => buildDocument(resume), [resume])
  const style = useMemo(() => pageVars(resume, doc), [resume, doc])
  const measureRef = useRef<HTMLDivElement>(null)
  const [layout, setLayout] = useState<Layout | null>(null)
  const [fontTick, setFontTick] = useState(0)

  useEffect(() => {
    const fontSet = document.fonts
    if (!fontSet) return
    let alive = true
    const bump = () => alive && setFontTick((n) => n + 1)
    fontSet.ready.then(bump).catch(() => {})
    fontSet.addEventListener?.('loadingdone', bump)
    return () => {
      alive = false
      fontSet.removeEventListener?.('loadingdone', bump)
    }
  }, [])

  useLayoutEffect(() => {
    const root = measureRef.current
    const page = root?.querySelector<HTMLElement>('.r-page')
    const body = page?.querySelector<HTMLElement>('.r-body')
    if (!page || !body) return

    const cs = getComputedStyle(page)
    const padTop = parseFloat(cs.paddingTop) || 0
    const padBottom = parseFloat(cs.paddingBottom) || 0
    const pageRect = page.getBoundingClientRect()
    const headSpace = body.getBoundingClientRect().top - pageRect.top - padTop
    const inner = pageRect.height - padTop - padBottom

    const next: Layout = { main: [[]], side: [[]] }
    for (const col of ['main', 'side'] as const) {
      const el = body.querySelector<HTMLElement>(`[data-col="${col}"]`)
      if (!el) continue
      const ccs = getComputedStyle(el)
      const colPad = (parseFloat(ccs.paddingTop) || 0) + (parseFloat(ccs.paddingBottom) || 0)
      const keep = new Set((col === 'main' ? doc.main : doc.side).filter((b) => b.keepWithNext).map((b) => b.id))
      const measured: Measured[] = Array.from(el.children)
        .filter((c): c is HTMLElement => c instanceof HTMLElement && !!c.dataset.bid)
        .map((c) => ({ id: c.dataset.bid as string, h: c.getBoundingClientRect().height, keep: keep.has(c.dataset.bid as string) }))
      const rest = inner - colPad
      next[col] = paginate(measured, rest - headSpace, rest)
    }
    setLayout((prev) => (prev && JSON.stringify(prev) === JSON.stringify(next) ? prev : next))
  }, [doc, style, fontTick])

  const pageCount = layout ? Math.max(layout.main.length, layout.side.length, 1) : 0

  useEffect(() => {
    if (pageCount) onPageCount?.(pageCount)
  }, [pageCount, onPageCount])

  const mainById = useMemo(() => new Map(doc.main.map((b) => [b.id, b])), [doc])
  const sideById = useMemo(() => new Map(doc.side.map((b) => [b.id, b])), [doc])
  const pick = (ids: string[] | undefined, map: Map<string, Block>) =>
    (ids ?? []).map((id) => map.get(id)).filter((b): b is Block => !!b)

  const shown = maxPages ? Math.min(pageCount, maxPages) : pageCount

  return (
    <>
      {createPortal(
        <div className="r-measure" ref={measureRef} aria-hidden="true">
          <Page resume={resume} doc={doc} showHeader main={doc.main} side={doc.side} style={style} />
        </div>,
        document.body,
      )}
      {layout &&
        Array.from({ length: shown }, (_, i) => (
          <Page
            key={i}
            resume={resume}
            doc={doc}
            showHeader={i === 0}
            main={pick(layout.main[i], mainById)}
            side={pick(layout.side[i], sideById)}
            pageNo={i + 1}
            total={maxPages ? undefined : pageCount}
            style={style}
          />
        ))}
    </>
  )
}
