/** یک Blob را با نام داده‌شده روی دستگاه کاربر ذخیره می‌کند. */
export async function saveBlob(blob: Blob, filename: string): Promise<void> {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

/** آیا این محیط پنجره‌ی چاپ مرورگر را باز می‌کند؟ */
export const canPrint = typeof window !== 'undefined' && typeof window.print === 'function'

/** نام فایل امن از روی نام صاحب رزومه. */
export function fileBase(fullName: string): string {
  const clean = fullName
    .trim()
    .replace(/[\\/:*?"<>|‌]+/g, ' ')
    .replace(/\s+/g, '-')
  return clean ? `resume-${clean}` : 'resume'
}
