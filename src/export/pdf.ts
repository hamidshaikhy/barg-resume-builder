/**
 * دو راه برای PDF:
 * ۱. چاپ مرورگر: متن واقعی و قابل انتخاب، حجم کم و پیوندهای فعال. بهترین گزینه برای ارسال.
 * ۲. تصویری: هر برگه عکس می‌شود و مستقیم دانلود می‌شود؛ ظاهر دقیقاً همان پیش‌نمایش است.
 */

const A4 = { w: 210, h: 297 }

export function printPdf(title: string): void {
  const previous = document.title
  document.title = title
  const restore = () => {
    document.title = previous
    window.removeEventListener('afterprint', restore)
  }
  window.addEventListener('afterprint', restore)
  window.print()
}

export async function buildImagePdf(root: HTMLElement, onProgress?: (done: number, total: number) => void): Promise<Blob> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas-pro'), import('jspdf')])
  await document.fonts?.ready
  const pages = Array.from(root.querySelectorAll<HTMLElement>('.r-page'))
  if (!pages.length) throw new Error('no pages')
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true })

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i]
    const canvas = await html2canvas(page, { scale: 2.5, backgroundColor: '#ffffff', useCORS: true, logging: false })
    if (i > 0) pdf.addPage()
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.93), 'JPEG', 0, 0, A4.w, A4.h, undefined, 'FAST')

    // پیوندها روی تصویر هم قابل کلیک می‌مانند.
    const box = page.getBoundingClientRect()
    const k = A4.w / box.width
    page.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((a) => {
      const r = a.getBoundingClientRect()
      const url = a.getAttribute('href') ?? ''
      if (!url || !r.width) return
      pdf.link((r.left - box.left) * k, (r.top - box.top) * k, r.width * k, r.height * k, { url })
    })
    onProgress?.(i + 1, pages.length)
  }
  return pdf.output('blob')
}
