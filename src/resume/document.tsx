import { Fragment, type ReactNode } from 'react'
import { hrefOf, parseDescription, prettyUrl } from '@/lib/text'
import { formatDate, formatRange, label, sectionTitles } from './i18n'
import { ResumeIcon, getNetwork } from './icons'
import { sectionDefs } from './sections'
import { getTemplate, type TemplateDef } from './templates'
import type { ColumnId, Item, Resume, Section, Settings } from './types'

/**
 * رزومه به فهرستی از «بلوک»های کوچک تبدیل می‌شود (تیتر بخش، سر هر مورد، هر خط توضیح …).
 * صفحه‌بند ارتفاع هر بلوک را اندازه می‌گیرد و آن‌ها را بین برگه‌های A4 پخش می‌کند.
 */
export interface Block {
  id: string
  /** اگر true باشد این بلوک نباید آخرین بلوک صفحه باشد (مثل تیتر بخش). */
  keepWithNext?: boolean
  className?: string
  node: ReactNode
}

export interface BuiltDocument {
  template: TemplateDef
  header: ReactNode | null
  main: Block[]
  side: Block[]
}

interface Ctx {
  s: Settings
  tpl: TemplateDef
  twoCol: boolean
}

interface ContactItem {
  key: string
  icon: string
  text: string
  href: string
  /** شماره‌ی تلفن همیشه چپ‌به‌راست نوشته می‌شود تا گروه‌های رقم جابه‌جا نشوند. */
  ltr?: boolean
}

export function contactItems(resume: Resume): ContactItem[] {
  const { basics, profiles } = resume
  const out: ContactItem[] = []
  if (basics.email.trim()) out.push({ key: 'email', icon: 'mail', text: basics.email.trim(), href: `mailto:${basics.email.trim()}` })
  if (basics.phone.trim()) out.push({ key: 'phone', icon: 'phone', text: basics.phone.trim(), href: '', ltr: true })
  if (basics.location.trim()) out.push({ key: 'loc', icon: 'pin', text: basics.location.trim(), href: '' })
  if (basics.website.trim())
    out.push({ key: 'web', icon: 'globe', text: prettyUrl(basics.website), href: hrefOf(basics.website) })
  for (const p of profiles) {
    const net = getNetwork(p.network)
    const username = p.username.trim()
    const url = p.url.trim() || (username && net.base ? net.base + username.replace(/^@/, '') : '')
    const text = username || prettyUrl(url)
    if (!text) continue
    out.push({ key: p.id, icon: p.network, text, href: hrefOf(url) })
  }
  return out
}

export function personalItems(resume: Resume): Array<{ key: string; label: string; value: string }> {
  const { basics, settings } = resume
  const lang = settings.lang
  const out: Array<{ key: string; label: string; value: string }> = []
  const push = (key: 'birthDate' | 'maritalStatus' | 'militaryStatus' | 'nationality' | 'gender') => {
    const value = basics[key].trim()
    if (value) out.push({ key, label: label(key, lang), value })
  }
  push('birthDate')
  push('maritalStatus')
  push('militaryStatus')
  push('nationality')
  push('gender')
  for (const f of basics.custom) {
    if (f.label.trim() && f.value.trim()) out.push({ key: f.id, label: f.label.trim(), value: f.value.trim() })
  }
  return out
}

function Photo({ resume }: { resume: Resume }) {
  const { basics, settings } = resume
  if (!settings.showPhoto || !basics.photo) return null
  return <img className={`r-photo r-photo--${settings.photoShape}`} src={basics.photo} alt="" />
}

function ContactList({ items, icons }: { items: ContactItem[]; icons: boolean }) {
  if (!items.length) return null
  return (
    <ul className="r-contact">
      {items.map((c) => (
        <li key={c.key}>
          {icons && <ResumeIcon name={c.icon} />}
          {c.href ? (
            <a href={c.href} dir="ltr">
              {c.text}
            </a>
          ) : (
            <span dir={c.ltr ? 'ltr' : 'auto'}>{c.text}</span>
          )}
        </li>
      ))}
    </ul>
  )
}

function PersonalList({ items }: { items: ReturnType<typeof personalItems> }) {
  if (!items.length) return null
  return (
    <ul className="r-personal">
      {items.map((p) => (
        <li key={p.key}>
          <span className="r-personal-k">{p.label}:</span> <span>{p.value}</span>
        </li>
      ))}
    </ul>
  )
}

function NameBlock({ resume }: { resume: Resume }) {
  const { basics, settings } = resume
  const placeholder = settings.lang === 'fa' ? 'نام و نام خانوادگی' : 'Your name'
  return (
    <div className="r-head-names">
      <h1 className={basics.fullName.trim() ? 'r-name' : 'r-name r-placeholder'}>{basics.fullName.trim() || placeholder}</h1>
      {basics.headline.trim() && (
        <p className="r-headline" dir="auto">
          {basics.headline.trim()}
        </p>
      )}
    </div>
  )
}

function Header({ resume, tpl }: { resume: Resume; tpl: TemplateDef }) {
  return (
    <header className={`r-head r-head--${tpl.header}`}>
      <div className="r-head-id">
        <Photo resume={resume} />
        <NameBlock resume={resume} />
      </div>
      <ContactList items={contactItems(resume)} icons={resume.settings.showIcons} />
      <PersonalList items={personalItems(resume)} />
    </header>
  )
}

/* ---------- بلوک‌های بخش‌ها ---------- */

function titleOf(sec: Section, s: Settings): string {
  return sec.title.trim() || sectionTitles[sec.kind][s.lang]
}

function titleBlock(sec: Section, ctx: Ctx): Block {
  return {
    id: `${sec.id}:t`,
    keepWithNext: true,
    className: 'r-b-stitle',
    node: (
      <h2 className="r-stitle">
        <span>{titleOf(sec, ctx.s)}</span>
      </h2>
    ),
  }
}

function DescNode({ bullet, text }: { bullet: boolean; text: string }) {
  return bullet ? (
    <div className="r-bullet" dir="auto">
      {text}
    </div>
  ) : (
    <p className="r-desc" dir="auto">
      {text}
    </p>
  )
}

function isEmptyItem(it: Item): boolean {
  return !it.title.trim() && !it.subtitle.trim() && !it.description.trim() && it.tags.length === 0
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

function entryBlocks(sec: Section, it: Item, ctx: Ctx): Block[] {
  const def = sectionDefs[sec.kind]
  const { s } = ctx
  const hasRange = def.fields.some((f) => f.type === 'dates')
  const hasDate = def.fields.some((f) => f.type === 'date')
  const date = hasRange ? formatRange(it, s) : hasDate ? formatDate(it.start, s) : ''
  const title = it.title.trim() || it.subtitle.trim()
  const subParts = [it.title.trim() ? it.subtitle.trim() : '', it.meta.trim(), it.location.trim()].filter(Boolean)
  const extras = (def.extras ?? [])
    .map((k) => ({ k, v: (it.x[k] ?? '').trim() }))
    .filter((e) => e.v)
  const lines = parseDescription(it.description)
  const blocks: Block[] = []

  blocks.push({
    id: `${it.id}:h`,
    node: (
      <div className="r-ehead">
        <div className="r-erow">
          <span className="r-etitle" dir="auto">
            {title}
          </span>
          {date && <span className="r-edate">{date}</span>}
        </div>
        {subParts.length > 0 && (
          <div className="r-esub">
            {subParts.map((p, i) => (
              <Fragment key={i}>
                {i > 0 && <i className="r-sep" />}
                <span dir="auto">{p}</span>
              </Fragment>
            ))}
          </div>
        )}
        {extras.length > 0 && (
          <div className="r-eextra">
            {extras.map((e) => (
              <span key={e.k}>
                {label(e.k, s.lang)}: <span dir="auto">{e.v}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    ),
  })

  lines.forEach((line, i) => {
    blocks.push({ id: `${it.id}:d${i}`, node: <DescNode {...line} /> })
  })

  if (it.tags.length) {
    blocks.push({
      id: `${it.id}:g`,
      node: (
        <div className="r-chips r-chips--entry">
          {it.tags.map((t, i) => (
            <span className="r-chip" key={i} dir="auto">
              {t}
            </span>
          ))}
        </div>
      ),
    })
  }

  if (it.url.trim()) {
    blocks.push({
      id: `${it.id}:u`,
      node: (
        <div className="r-elink">
          <span>{label('link', s.lang)}:</span>{' '}
          <a href={hrefOf(it.url)} dir="ltr">
            {prettyUrl(it.url)}
          </a>
        </div>
      ),
    })
  }

  blocks.forEach((b, i) => {
    const first = i === 0
    const last = i === blocks.length - 1
    b.className = ['r-in-entry', first && 'r-entry-start', last && 'r-entry-end'].filter(Boolean).join(' ')
    // سرِ هر مورد نباید از اولین خط توضیحش جدا بیفتد.
    if (first && !last) b.keepWithNext = true
  })
  return blocks
}

function skillBlocks(sec: Section, items: Item[], ctx: Ctx, col: ColumnId): Block[] {
  const blocks: Block[] = []
  const sep = ctx.s.lang === 'fa' ? '، ' : ', '
  const singles = items.filter((it) => it.tags.length === 0 && it.title.trim())
  const groups = items.filter((it) => it.tags.length > 0)
  const narrow = ctx.twoCol && col === 'side'
  const display = sec.display

  if (singles.length) {
    if (display === 'chips') {
      blocks.push({
        id: `${sec.id}:chips`,
        node: (
          <div className="r-chips">
            {singles.map((it) => (
              <span className="r-chip" key={it.id} dir="auto">
                {it.title}
              </span>
            ))}
          </div>
        ),
      })
    } else if (display === 'inline') {
      blocks.push({
        id: `${sec.id}:inline`,
        node: <p className="r-desc">{singles.map((it) => it.title.trim()).join(sep)}</p>,
      })
    } else if (display === 'list') {
      const cols = narrow ? 1 : ctx.twoCol ? 2 : 3
      chunk(singles, cols).forEach((row, i) => {
        blocks.push({
          id: `${sec.id}:l${i}`,
          node: (
            <div className="r-grid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
              {row.map((it) => (
                <div className="r-bullet" key={it.id} dir="auto">
                  {it.title}
                </div>
              ))}
            </div>
          ),
        })
      })
    } else {
      const cols = narrow ? 1 : 2
      chunk(singles, cols).forEach((row, i) => {
        blocks.push({
          id: `${sec.id}:m${i}`,
          node: (
            <div className="r-grid r-grid--meters" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
              {row.map((it) => (
                <div className="r-meter" key={it.id}>
                  <span className="r-meter-name" dir="auto">
                    {it.title}
                  </span>
                  {it.level > 0 &&
                    (display === 'bars' ? (
                      <span className="r-bar">
                        <i style={{ width: `${(it.level / 5) * 100}%` }} />
                      </span>
                    ) : (
                      <span className="r-dots">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <i key={n} className={n <= it.level ? 'on' : ''} />
                        ))}
                      </span>
                    ))}
                </div>
              ))}
            </div>
          ),
        })
      })
    }
  }

  for (const g of groups) {
    blocks.push({
      id: `${g.id}:grp`,
      node:
        display === 'chips' ? (
          <div className="r-skillgroup">
            {g.title.trim() && <div className="r-skillgroup-name">{g.title.trim()}</div>}
            <div className="r-chips">
              {g.tags.map((t, i) => (
                <span className="r-chip" key={i} dir="auto">
                  {t}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <p className="r-desc r-skillline">
            {g.title.trim() && <b>{g.title.trim()}: </b>}
            <span dir="auto">{g.tags.join(sep)}</span>
          </p>
        ),
    })
  }
  return blocks
}

function languageBlocks(items: Item[], ctx: Ctx): Block[] {
  const lang = ctx.s.lang
  return items
    .filter((it) => it.title.trim())
    .map((it) => {
      const parts = [it.x.level, it.x.cert].map((v) => (v ?? '').trim()).filter(Boolean)
      const four = (['reading', 'writing', 'listening', 'speaking'] as const)
        .map((k) => ({ k, v: (it.x[k] ?? '').trim() }))
        .filter((e) => e.v)
      return {
        id: `${it.id}:lang`,
        node: (
          <div className="r-lang">
            <div className="r-lang-row">
              <span className="r-lang-name" dir="auto">
                {it.title.trim()}
              </span>
              {parts.length > 0 && (
                <span className="r-lang-level" dir="auto">
                  {parts.join(lang === 'fa' ? '، ' : ', ')}
                </span>
              )}
            </div>
            {four.length > 0 && (
              <div className="r-lang-four">
                {four.map((e) => (
                  <span key={e.k}>
                    {label(e.k, lang)} <b>{e.v}</b>
                  </span>
                ))}
              </div>
            )}
          </div>
        ),
      }
    })
}

function referenceBlocks(sec: Section, items: Item[], ctx: Ctx, col: ColumnId): Block[] {
  const cols = ctx.twoCol && col === 'side' ? 1 : 2
  return chunk(
    items.filter((it) => it.title.trim()),
    cols,
  ).map((row, i) => ({
    id: `${sec.id}:r${i}`,
    node: (
      <div className="r-grid r-grid--refs" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {row.map((it) => (
          <div className="r-ref" key={it.id}>
            <div className="r-etitle" dir="auto">
              {it.title.trim()}
            </div>
            {it.subtitle.trim() && (
              <div className="r-esub">
                <span dir="auto">{it.subtitle.trim()}</span>
              </div>
            )}
            {it.description.trim() && (
              <div className="r-ref-line" dir="auto">
                {it.description.trim()}
              </div>
            )}
            {(it.x.phone ?? '').trim() && (
              <div className="r-ref-line" dir="auto">
                {it.x.phone.trim()}
              </div>
            )}
            {(it.x.email ?? '').trim() && (
              <div className="r-ref-line" dir="ltr">
                {it.x.email.trim()}
              </div>
            )}
          </div>
        ))}
      </div>
    ),
  }))
}

function pairBlocks(sec: Section, items: Item[], ctx: Ctx, col: ColumnId): Block[] {
  const cols = ctx.twoCol && col === 'side' ? 1 : 2
  return chunk(
    items.filter((it) => it.title.trim() || it.subtitle.trim()),
    cols,
  ).map((row, i) => ({
    id: `${sec.id}:p${i}`,
    node: (
      <div className="r-grid r-grid--pairs" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {row.map((it) => (
          <div className="r-pair" key={it.id}>
            {it.title.trim() && <span className="r-pair-k">{it.title.trim()}:</span>}{' '}
            <span dir="auto">{it.subtitle.trim()}</span>
          </div>
        ))}
      </div>
    ),
  }))
}

function sectionBlocks(sec: Section, ctx: Ctx, col: ColumnId): Block[] {
  const def = sectionDefs[sec.kind]
  const items = sec.items.filter((it) => it.visible)
  let body: Block[] = []

  switch (def.layout) {
    case 'text':
      body = parseDescription(sec.text).map((line, i) => ({ id: `${sec.id}:x${i}`, node: <DescNode {...line} /> }))
      break
    case 'entry':
      body = items.filter((it) => !isEmptyItem(it)).flatMap((it) => entryBlocks(sec, it, ctx))
      break
    case 'skills':
    case 'tags':
      body = skillBlocks(sec, items, ctx, col)
      break
    case 'languages':
      body = languageBlocks(items, ctx)
      break
    case 'references':
      body = referenceBlocks(sec, items, ctx, col)
      break
    case 'pairs':
      body = pairBlocks(sec, items, ctx, col)
      break
  }
  if (!body.length) return []
  const last = body[body.length - 1]
  last.className = [last.className, 'r-sec-end'].filter(Boolean).join(' ')
  body[0].className = [body[0].className, 'r-sec-start'].filter(Boolean).join(' ')
  return [titleBlock(sec, ctx), ...body]
}

/** در قالب ستونی، سربرگ جدا نداریم و تماس و مشخصات به ستون کناری می‌روند. */
function sideIdentityBlocks(resume: Resume): Block[] {
  const blocks: Block[] = []
  const { settings, basics } = resume
  if (settings.showPhoto && basics.photo) {
    blocks.push({ id: 'side:photo', className: 'r-b-photo', node: <Photo resume={resume} /> })
  }
  const contacts = contactItems(resume)
  if (contacts.length) {
    blocks.push({
      id: 'side:contact:t',
      keepWithNext: true,
      className: 'r-b-stitle',
      node: (
        <h2 className="r-stitle">
          <span>{label('contact', settings.lang)}</span>
        </h2>
      ),
    })
    blocks.push({
      id: 'side:contact',
      className: 'r-sec-start r-sec-end',
      node: <ContactList items={contacts} icons={settings.showIcons} />,
    })
  }
  const personal = personalItems(resume)
  if (personal.length) {
    blocks.push({
      id: 'side:personal:t',
      keepWithNext: true,
      className: 'r-b-stitle',
      node: (
        <h2 className="r-stitle">
          <span>{label('personal', settings.lang)}</span>
        </h2>
      ),
    })
    blocks.push({ id: 'side:personal', className: 'r-sec-start r-sec-end', node: <PersonalList items={personal} /> })
  }
  return blocks
}

export function buildDocument(resume: Resume): BuiltDocument {
  const tpl = getTemplate(resume.settings.template)
  const twoCol = tpl.layout === 'sidebar' || tpl.layout === 'split'
  const ctx: Ctx = { s: resume.settings, tpl, twoCol }
  const main: Block[] = []
  const side: Block[] = []

  if (tpl.header === 'none') {
    main.push({ id: 'main:name', className: 'r-b-name', node: <NameBlock resume={resume} /> })
    side.push(...sideIdentityBlocks(resume))
  }

  for (const sec of resume.sections) {
    if (!sec.visible) continue
    const col: ColumnId = twoCol ? sec.column : 'main'
    const blocks = sectionBlocks(sec, ctx, col)
    ;(col === 'side' ? side : main).push(...blocks)
  }

  return {
    template: tpl,
    header: tpl.header === 'none' ? null : <Header resume={resume} tpl={tpl} />,
    main,
    side,
  }
}
