import {
  AlignmentType,
  BorderStyle,
  CharacterSet,
  Document,
  ExternalHyperlink,
  ImageRun,
  LevelFormat,
  LineRuleType,
  PageBorderDisplay,
  PageBorderOffsetFrom,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  VerticalAlignTable,
  WidthType,
  type IBorderOptions,
  type IParagraphOptions,
  type IRunOptions,
  type ITableCellOptions,
  type ParagraphChild,
} from 'docx'
import vazirRegularUrl from 'vazirmatn/fonts/ttf/Vazirmatn-Regular.ttf?url'
import { hrefOf, parseDescription, prettyUrl, tint } from '@/lib/text'
import { contactItems, personalItems } from '@/resume/document'
import { formatDate, formatRange, label, sectionTitles } from '@/resume/i18n'
import { sectionDefs } from '@/resume/sections'
import { fonts, getTemplate, paletteOf } from '@/resume/templates'
import type { Item, Resume, Section } from '@/resume/types'

/**
 * خروجی Word (‎.docx‎) قابل‌ویرایش.
 * چیدمان هر قالب با پاراگراف و جدول بی‌خط بازسازی می‌شود؛ متن فارسی با ویژگی‌های
 * bidi نوشته می‌شود و تکه‌های لاتین داخل آن جدا می‌شوند تا ترتیبشان در Word به‌هم نریزد.
 */

type Child = Paragraph | Table

const MM = 56.7
const PAGE_W = 11906
const PAGE_H = 16838
const MARGIN_MM = { compact: 12, normal: 16, relaxed: 20 } as const

const NONE: IBorderOptions = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
const noBorders = { top: NONE, bottom: NONE, left: NONE, right: NONE }
const noTableBorders = { ...noBorders, insideHorizontal: NONE, insideVertical: NONE }

const LATIN = /[A-Za-z0-9@#&][A-Za-z0-9 .,:;+#&@_/\\\-()'%!?=~]*[A-Za-z0-9+#)%]|[A-Za-z0-9]/g

function splitByScript(text: string): Array<{ text: string; latin: boolean }> {
  const out: Array<{ text: string; latin: boolean }> = []
  let last = 0
  for (const m of text.matchAll(LATIN)) {
    let seg = m[0]
    // پرانتزِ بسته‌ای که بازش در متن فارسی مانده، به تکه‌ی فارسی برمی‌گردد.
    while (seg.endsWith(')') && seg.split(')').length > seg.split('(').length) seg = seg.slice(0, -1)
    const start = m.index ?? 0
    if (start > last) out.push({ text: text.slice(last, start), latin: false })
    out.push({ text: seg, latin: true })
    last = start + seg.length
  }
  if (last < text.length) out.push({ text: text.slice(last), latin: false })
  return out
}

async function fetchBytes(url: string): Promise<Uint8Array> {
  // در بیلد تک‌فایلی، قلم به‌صورت data URL درون برنامه است و نیازی به درخواست شبکه ندارد.
  const inline = url.match(/^data:[^;,]*;base64,(.+)$/)
  if (inline) {
    const bin = atob(inline[1])
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    return bytes
  }
  const res = await fetch(url)
  if (!res.ok) throw new Error(`fetch ${url}`)
  return new Uint8Array(await res.arrayBuffer())
}

function dataUrlBytes(dataUrl: string): { bytes: Uint8Array; type: 'jpg' | 'png' } | null {
  const m = dataUrl.match(/^data:image\/(png|jpe?g);base64,(.+)$/)
  if (!m) return null
  const bin = atob(m[2])
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return { bytes, type: m[1] === 'png' ? 'png' : 'jpg' }
}

export async function buildDocx(resume: Resume): Promise<Blob> {
  const { settings, basics } = resume
  const tpl = getTemplate(settings.template)
  const rtl = settings.lang === 'fa'
  const lang = settings.lang
  const accent = paletteOf(tpl, settings.palette).hex.replace('#', '').toUpperCase()
  const accentSoft = tint(`#${accent}`, 0.35).replace('#', '').toUpperCase()
  const accentTint = tint(`#${accent}`, 0.08).replace('#', '').toUpperCase()
  const font = (fonts[settings.font] ?? fonts.vazirmatn).docx
  const marginMm = MARGIN_MM[settings.margin] ?? 16
  const margin = Math.round(marginMm * MM) + (tpl.id === 'framed' ? Math.round(4 * MM) : 0)
  const contentW = PAGE_W - margin * 2
  const base = Math.round(20 * settings.fontScale * (settings.font === 'markazi' ? 1.15 : 1))
  const line = Math.round(240 * (0.55 + settings.lineHeight * 0.35))
  const sep = rtl ? '، ' : ', '
  const startSide = rtl ? 'right' : 'left'
  // نشانه‌ی راست‌به‌چپ کنار جداکننده‌ها می‌نشیند تا چند تکه‌ی لاتینِ پشت‌سرهم جابه‌جا نشوند.
  const RLM = rtl ? '\u200F' : ''
  const BAR = `  ${RLM}|${RLM}  `
  const DOT = `  ${RLM}•${RLM}  `
  const GAP = `     ${RLM}`
  const ltrText = (value: string) => (rtl ? `\u202A${value}\u202C` : value)

  /* ---------- ابزارهای ساخت متن ---------- */

  type RunStyle = Pick<IRunOptions, 'bold' | 'color' | 'size'>

  const runs = (text: string, style: RunStyle = {}): TextRun[] => {
    const common = { font, size: base, ...style }
    if (!rtl) return [new TextRun({ text, ...common })]
    return splitByScript(text).map((part) => new TextRun({ text: part.text, ...common, rightToLeft: !part.latin }))
  }

  const para = (children: ParagraphChild[], opts: Partial<IParagraphOptions> = {}): Paragraph =>
    new Paragraph({
      bidirectional: rtl,
      ...opts,
      spacing: { line, lineRule: LineRuleType.AUTO, before: 0, after: 40, ...opts.spacing },
      children,
    })

  const text = (value: string, style: RunStyle = {}, opts: Partial<IParagraphOptions> = {}) => para(runs(value, style), opts)

  const cell = (children: Child[], width: number, opts: Partial<ITableCellOptions> = {}): TableCell =>
    new TableCell({
      children: children.length ? children : [para([])],
      width: { size: width, type: WidthType.DXA },
      borders: noBorders,
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      ...opts,
    })

  /**
   * جدول بی‌خط برای چیدمان. در رزومه‌ی راست‌به‌چپ، خانه‌ها را خودمان وارونه می‌چینیم و از
   * ویژگی bidiVisual استفاده نمی‌کنیم؛ چون برنامه‌های مختلف با آن ویژگی، چپ و راستِ خط و
   * حاشیه‌ی خانه‌ها را یک‌جور تفسیر نمی‌کنند.
   */
  const grid = (rows: TableCell[][], widths: number[]): Table =>
    new Table({
      rows: rows.map((cells) => new TableRow({ children: rtl ? [...cells].reverse() : cells })),
      width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
      columnWidths: rtl ? [...widths].reverse() : widths,
      layout: TableLayoutType.FIXED,
      borders: noTableBorders,
    })

  /* ---------- تیتر بخش ---------- */

  const heading = (title: string): Paragraph => {
    const style: RunStyle = { bold: true, color: accent, size: Math.round(base * 1.25) }
    const spacing = { line, before: 220, after: 100 }
    const rule = (s: (typeof BorderStyle)[keyof typeof BorderStyle], size: number, color = accent): IBorderOptions => ({
      style: s,
      size,
      color,
      space: 3,
    })
    switch (tpl.docxHeading) {
      case 'underline':
        return text(title, style, { spacing, border: { bottom: rule(BorderStyle.SINGLE, 8, accentSoft) } })
      case 'double':
        return text(title, style, { spacing, border: { bottom: rule(BorderStyle.DOUBLE, 6, accentSoft) } })
      case 'center':
        return text(title, style, {
          spacing,
          alignment: AlignmentType.CENTER,
          border: { bottom: rule(BorderStyle.SINGLE, 6, accentSoft) },
        })
      case 'bar':
        return text(title, style, {
          spacing,
          shading: { type: ShadingType.CLEAR, fill: accentTint, color: 'auto' },
          border: { [startSide]: { style: BorderStyle.SINGLE, size: 30, color: accent, space: 6 } },
        })
      case 'side':
        return text(title, style, {
          spacing,
          border: { [startSide]: { style: BorderStyle.SINGLE, size: 26, color: accent, space: 6 } },
        })
      default:
        return text(title, style, { spacing })
    }
  }

  /* ---------- محتوای بخش‌ها ---------- */

  const bullet = (value: string) =>
    para(runs(value), { numbering: { reference: 'barg-bullets', level: 0 }, spacing: { line, before: 0, after: 20 } })

  const descLines = (raw: string): Paragraph[] =>
    parseDescription(raw).map((l) => (l.bullet ? bullet(l.text) : text(l.text, {}, { alignment: AlignmentType.BOTH })))

  const link = (url: string): Paragraph =>
    para([
      ...runs(`${label('link', lang)}: `, { color: '444444', size: base - 1 }),
      new ExternalHyperlink({
        link: hrefOf(url),
        children: [new TextRun({ text: prettyUrl(url), font, size: base - 1, color: accent, underline: {} })],
      }),
    ])

  const entry = (sec: Section, it: Item, width: number, narrow: boolean): Child[] => {
    const def = sectionDefs[sec.kind]
    const hasRange = def.fields.some((f) => f.type === 'dates')
    const hasDate = def.fields.some((f) => f.type === 'date')
    const date = hasRange ? formatRange(it, settings) : hasDate ? formatDate(it.start, settings) : ''
    const title = it.title.trim() || it.subtitle.trim()
    const sub = [it.title.trim() ? it.subtitle.trim() : '', it.meta.trim(), it.location.trim()].filter(Boolean)
    const extras = (def.extras ?? [])
      .map((k) => ({ k, v: (it.x[k] ?? '').trim() }))
      .filter((e) => e.v)
    const out: Child[] = []
    const titleRuns = runs(title, { bold: true, size: Math.round(base * 1.08) })
    const dateRuns = runs(date, { color: '333333', size: base - 1 })

    if (date && !narrow) {
      const dateW = Math.max(Math.round(width * 0.3), 2550)
      out.push(
        grid(
          [
            [
              cell([para(titleRuns, { spacing: { line, before: 80, after: 0 } })], width - dateW),
              cell([para(dateRuns, { alignment: AlignmentType.END, spacing: { line, before: 80, after: 0 } })], dateW),
            ],
          ],
          [width - dateW, dateW],
        ),
      )
    } else {
      out.push(para(titleRuns, { spacing: { line, before: 80, after: 0 } }))
      if (date) out.push(para(dateRuns, { spacing: { line, before: 0, after: 0 } }))
    }
    if (sub.length) out.push(text(sub.join(BAR), { color: '222222' }, { spacing: { line, before: 0, after: 20 } }))
    if (extras.length) {
      out.push(text(extras.map((e) => `${label(e.k, lang)}: ${e.v}`).join(GAP), { color: '333333', size: base - 1 }))
    }
    out.push(...descLines(it.description))
    if (it.tags.length) out.push(text(it.tags.join(DOT), { size: base - 1, color: '222222' }))
    if (it.url.trim()) out.push(link(it.url))
    return out
  }

  const dots = (level: number): TextRun =>
    new TextRun({ text: `  ${'●'.repeat(level)}${'○'.repeat(5 - level)}`, color: accent, size: base - 4, font: 'Segoe UI Symbol' })

  const skills = (sec: Section, items: Item[], width: number, narrow: boolean): Child[] => {
    const out: Child[] = []
    const singles = items.filter((it) => it.tags.length === 0 && it.title.trim())
    const groups = items.filter((it) => it.tags.length > 0)
    if (singles.length) {
      if (sec.display === 'bars' || sec.display === 'dots') {
        const cols = narrow ? 1 : 2
        const w = Math.floor(width / cols)
        const rows: TableCell[][] = []
        for (let i = 0; i < singles.length; i += cols) {
          const row = singles.slice(i, i + cols)
          const cells = row.map((it) => cell([para([...runs(it.title.trim()), ...(it.level ? [dots(it.level)] : [])])], w))
          while (cells.length < cols) cells.push(cell([], w))
          rows.push(cells)
        }
        out.push(grid(rows, Array(cols).fill(w)))
      } else if (sec.display === 'list') {
        singles.forEach((it) => out.push(bullet(it.title.trim())))
      } else {
        out.push(text(singles.map((it) => it.title.trim()).join(sec.display === 'chips' ? DOT : sep)))
      }
    }
    for (const g of groups) {
      out.push(para([...(g.title.trim() ? runs(`${g.title.trim()}: `, { bold: true }) : []), ...runs(g.tags.join(sep))]))
    }
    return out
  }

  const sectionBody = (sec: Section, width: number, narrow: boolean): Child[] => {
    const def = sectionDefs[sec.kind]
    const items = sec.items.filter((it) => it.visible)
    switch (def.layout) {
      case 'text':
        return descLines(sec.text)
      case 'entry':
        return items
          .filter((it) => it.title.trim() || it.subtitle.trim() || it.description.trim() || it.tags.length)
          .flatMap((it) => entry(sec, it, width, narrow))
      case 'skills':
      case 'tags':
        return skills(sec, items, width, narrow)
      case 'languages':
        return items
          .filter((it) => it.title.trim())
          .flatMap((it) => {
            const parts = [it.x.level, it.x.cert].map((v) => (v ?? '').trim()).filter(Boolean)
            const four = (['reading', 'writing', 'listening', 'speaking'] as const)
              .map((k) => ({ k, v: (it.x[k] ?? '').trim() }))
              .filter((e) => e.v)
            const rows: Child[] = [
              para([...runs(it.title.trim(), { bold: true }), ...(parts.length ? runs(`  —  ${parts.join(sep)}`) : [])]),
            ]
            if (four.length) {
              rows.push(text(four.map((e) => `${label(e.k, lang)}: ${e.v}`).join(GAP), { color: '333333', size: base - 1 }))
            }
            return rows
          })
      case 'references':
        return items
          .filter((it) => it.title.trim())
          .flatMap((it) => {
            const rows: Child[] = [text(it.title.trim(), { bold: true }, { spacing: { line, before: 80, after: 0 } })]
            for (const v of [it.subtitle, it.description, it.x.phone ?? '', it.x.email ?? '']) {
              if (v.trim()) rows.push(text(v.trim(), { color: '333333', size: base - 1 }, { spacing: { line, before: 0, after: 0 } }))
            }
            return rows
          })
      case 'pairs':
        return items
          .filter((it) => it.title.trim() || it.subtitle.trim())
          .map((it) => para([...runs(it.title.trim() ? `${it.title.trim()}: ` : '', { color: '444444' }), ...runs(it.subtitle.trim())]))
    }
  }

  const titleOf = (sec: Section) => sec.title.trim() || sectionTitles[sec.kind][lang]

  const sectionsOf = (list: Section[], width: number, narrow: boolean): Child[] =>
    list.flatMap((sec) => {
      const body = sectionBody(sec, width, narrow)
      return body.length ? [heading(titleOf(sec)), ...body] : []
    })

  /* ---------- سربرگ ---------- */

  const contacts = contactItems(resume)
  const personal = personalItems(resume)
  const photo = settings.showPhoto && basics.photo ? dataUrlBytes(basics.photo) : null

  const photoPara = (align: (typeof AlignmentType)[keyof typeof AlignmentType]): Paragraph | null =>
    photo
      ? para([new ImageRun({ type: photo.type, data: photo.bytes, transformation: { width: 96, height: 96 } })], {
          alignment: align,
          spacing: { before: 0, after: 120 },
        })
      : null

  const nameParas = (align: (typeof AlignmentType)[keyof typeof AlignmentType]): Paragraph[] => {
    const out: Paragraph[] = []
    const nameColor = tpl.id === 'timeline' ? accent : '000000'
    out.push(
      text(basics.fullName.trim() || ' ', { bold: tpl.id !== 'minimal', size: Math.round(base * 2.6), color: nameColor }, {
        alignment: align,
        spacing: { before: 0, after: 0, line: 240 },
      }),
    )
    if (basics.headline.trim()) {
      const colored = ['modern', 'sidebar', 'band', 'framed', 'minimal'].includes(tpl.id)
      out.push(
        text(basics.headline.trim(), { size: Math.round(base * 1.25), color: colored ? accent : '222222' }, {
          alignment: align,
          spacing: { before: 0, after: 80 },
        }),
      )
    }
    return out
  }

  const contactRun = (c: (typeof contacts)[number]): ParagraphChild[] =>
    c.href && !c.href.startsWith('mailto:')
      ? [new ExternalHyperlink({ link: c.href, children: [new TextRun({ text: c.text, font, size: base - 1 })] })]
      : c.ltr || c.href
        ? [new TextRun({ text: ltrText(c.text), font, size: base - 1 })]
        : runs(c.text, { size: base - 1 })

  const contactInline = (align: (typeof AlignmentType)[keyof typeof AlignmentType]): Paragraph[] => {
    if (!contacts.length) return []
    const children: ParagraphChild[] = []
    contacts.forEach((c, i) => {
      if (i) children.push(new TextRun({ text: ` ${BAR} `, font, size: base - 1, color: accentSoft, rightToLeft: rtl }))
      children.push(...contactRun(c))
    })
    return [para(children, { alignment: align, spacing: { line, before: 40, after: 20 } })]
  }

  const contactStacked = (): Paragraph[] =>
    contacts.map((c) => para(contactRun(c), { alignment: AlignmentType.END, spacing: { line, before: 0, after: 0 } }))

  const personalInline = (align: (typeof AlignmentType)[keyof typeof AlignmentType]): Paragraph[] =>
    personal.length
      ? [text(personal.map((p) => `${p.label}: ${p.value}`).join(GAP), { size: base - 1, color: '222222' }, { alignment: align })]
      : []

  const headerRule = (): Paragraph => {
    const styles: Record<string, IBorderOptions> = {
      classic: { style: BorderStyle.SINGLE, size: 8, color: accent },
      modern: { style: BorderStyle.SINGLE, size: 6, color: 'D9D9D9' },
      timeline: { style: BorderStyle.DASHED, size: 6, color: accentSoft },
      split: { style: BorderStyle.SINGLE, size: 18, color: accent },
      minimal: { style: BorderStyle.SINGLE, size: 6, color: 'D9D9D9' },
      executive: { style: BorderStyle.SINGLE, size: 8, color: accent },
      academic: { style: BorderStyle.DOUBLE, size: 8, color: accent },
      band: { style: BorderStyle.SINGLE, size: 24, color: accent },
      framed: { style: BorderStyle.SINGLE, size: 6, color: accentSoft },
    }
    const b = styles[tpl.id]
    return para([], { spacing: { before: 60, after: 60, line: 120 }, border: b ? { bottom: { ...b, space: 1 } } : undefined })
  }

  const header = (): Child[] => {
    if (tpl.header === 'none') return []
    const out: Child[] = []
    if (tpl.id === 'modern') {
      out.push(para([], { spacing: { before: 0, after: 160, line: 120 }, border: { top: { style: BorderStyle.SINGLE, size: 48, color: accent, space: 1 } } }))
    }
    if (tpl.header === 'center') {
      const p = photoPara(AlignmentType.CENTER)
      if (p) out.push(p)
      out.push(...nameParas(AlignmentType.CENTER), ...contactInline(AlignmentType.CENTER), ...personalInline(AlignmentType.CENTER))
    } else if (tpl.header === 'start') {
      const p = photoPara(AlignmentType.START)
      if (p) out.push(p)
      out.push(...nameParas(AlignmentType.START), ...contactInline(AlignmentType.START), ...personalInline(AlignmentType.START))
    } else {
      const sideW = Math.round(contentW * 0.36)
      const shade = tpl.header === 'band' ? { shading: { type: ShadingType.CLEAR, fill: accentTint, color: 'auto' } } : {}
      const pad = tpl.header === 'band' ? { margins: { top: 140, bottom: 100, left: 140, right: 140 } } : {}
      const p = photoPara(AlignmentType.START)
      const photoW = p ? 1750 : 0
      const middle = { verticalAlign: VerticalAlignTable.CENTER, ...shade, ...pad }
      out.push(
        grid(
          [
            [
              ...(p ? [cell([p], photoW, middle)] : []),
              cell(nameParas(AlignmentType.START), contentW - sideW - photoW, middle),
              cell(contactStacked(), sideW, middle),
            ],
          ],
          [...(p ? [photoW] : []), contentW - sideW - photoW, sideW],
        ),
      )
      out.push(...personalInline(AlignmentType.START))
    }
    out.push(headerRule())
    return out
  }

  /* ---------- چیدمان ---------- */

  const visible = resume.sections.filter((s) => s.visible)
  const body: Child[] = [...header()]

  if (tpl.layout === 'sidebar' || tpl.layout === 'split') {
    const gap = Math.round(5 * MM)
    const sideW = Math.round(contentW * (tpl.layout === 'sidebar' ? 0.32 : 0.34))
    const mainW = contentW - sideW
    const sideInner = sideW - gap
    const mainInner = mainW - gap
    const sideChildren: Child[] = []
    const mainChildren: Child[] = []

    if (tpl.header === 'none') {
      mainChildren.push(...nameParas(AlignmentType.START))
      const p = photoPara(AlignmentType.CENTER)
      if (p) sideChildren.push(p)
      if (contacts.length) {
        sideChildren.push(heading(label('contact', lang)))
        contacts.forEach((c) => sideChildren.push(para(contactRun(c), { spacing: { line, before: 0, after: 0 } })))
      }
      if (personal.length) {
        sideChildren.push(heading(label('personal', lang)))
        personal.forEach((p2) => sideChildren.push(text(`${p2.label}: ${p2.value}`, { size: base - 1 })))
      }
    }
    sideChildren.push(...sectionsOf(visible.filter((s) => s.column === 'side'), sideInner, true))
    mainChildren.push(...sectionsOf(visible.filter((s) => s.column === 'main'), mainInner, false))

    const divider: IBorderOptions = { style: BorderStyle.SINGLE, size: 6, color: tpl.layout === 'sidebar' ? accentSoft : 'D9D9D9' }
    // در قالب ستونی ستون باریک اول می‌آید؛ در قالب دوستونه ستون اصلی اول است.
    const sideFirst = tpl.layout === 'sidebar'
    const innerEdge = (first: boolean) => (first ? (rtl ? 'left' : 'right') : rtl ? 'right' : 'left')
    const sideCell = cell(sideChildren, sideW, {
      margins: { top: 0, bottom: 0, [innerEdge(sideFirst)]: gap, [innerEdge(!sideFirst)]: 0 },
      borders: { ...noBorders, [innerEdge(sideFirst)]: divider },
    })
    const mainCell = cell(mainChildren, mainW, {
      margins: { top: 0, bottom: 0, [innerEdge(!sideFirst)]: gap, [innerEdge(sideFirst)]: 0 },
    })
    body.push(grid([sideFirst ? [sideCell, mainCell] : [mainCell, sideCell]], sideFirst ? [sideW, mainW] : [mainW, sideW]))
  } else if (tpl.layout === 'labels') {
    const labelW = Math.round(contentW * 0.22)
    const rows = visible
      .map((sec) => ({ sec, content: sectionBody(sec, contentW - labelW, false) }))
      .filter((r) => r.content.length)
      .map((r, i) => {
        const top: IBorderOptions = i === 0 ? NONE : { style: BorderStyle.SINGLE, size: 4, color: 'D9D9D9' }
        const pad = { top: 120, bottom: 120, left: 0, right: 0 }
        return [
          cell([text(titleOf(r.sec), { bold: true, color: accent })], labelW, { borders: { ...noBorders, top }, margins: pad }),
          cell(r.content, contentW - labelW, { borders: { ...noBorders, top }, margins: pad }),
        ]
      })
    if (rows.length) body.push(grid(rows, [labelW, contentW - labelW]))
  } else {
    body.push(...sectionsOf(visible, contentW, false))
  }

  // Word بعد از جدولِ پایانی به یک پاراگراف نیاز دارد.
  body.push(para([], { spacing: { before: 0, after: 0, line: 120 } }))

  let embedded: { name: string; data: Buffer; characterSet: typeof CharacterSet.ARABIC }[] = []
  if (font === 'Vazirmatn') {
    try {
      embedded = [{ name: 'Vazirmatn', data: (await fetchBytes(vazirRegularUrl)) as unknown as Buffer, characterSet: CharacterSet.ARABIC }]
    } catch {
      embedded = []
    }
  }

  const frame: IBorderOptions = { style: BorderStyle.SINGLE, size: 6, color: accent, space: 18 }

  const doc = new Document({
    creator: basics.fullName.trim() || 'Barg',
    title: basics.fullName.trim() ? `${rtl ? 'رزومه‌ی' : 'Resume —'} ${basics.fullName.trim()}` : 'Resume',
    fonts: embedded,
    styles: {
      default: {
        document: {
          run: { font, size: base },
          paragraph: { spacing: { line, lineRule: LineRuleType.AUTO } },
        },
      },
    },
    numbering: {
      config: [
        {
          reference: 'barg-bullets',
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: '•',
              alignment: AlignmentType.START,
              style: { paragraph: { indent: { start: 300, hanging: 220 } } },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: PAGE_W, height: PAGE_H },
            margin: { top: margin, bottom: margin, left: margin, right: margin },
            ...(tpl.id === 'framed'
              ? {
                  borders: {
                    pageBorders: { display: PageBorderDisplay.ALL_PAGES, offsetFrom: PageBorderOffsetFrom.PAGE },
                    pageBorderTop: frame,
                    pageBorderBottom: frame,
                    pageBorderLeft: frame,
                    pageBorderRight: frame,
                  },
                }
              : {}),
          },
        },
        children: body,
      },
    ],
  })

  return Packer.toBlob(doc)
}
