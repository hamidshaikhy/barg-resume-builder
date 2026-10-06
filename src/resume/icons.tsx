import { Globe, Link2, Mail, MapPin, Phone } from 'lucide-react'
import {
  siBehance,
  siDribbble,
  siGithub,
  siGitlab,
  siGooglescholar,
  siInstagram,
  siKaggle,
  siMedium,
  siOrcid,
  siResearchgate,
  siStackoverflow,
  siTelegram,
  siWhatsapp,
  siX,
  siYoutube,
} from 'simple-icons'

const LINKEDIN =
  'M4.98 1.75a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 8h4v11.25H3zM9.5 8h3.8v1.6h.06c.53-1 1.83-1.9 3.76-1.9 4.02 0 4.88 2.5 4.88 5.9v5.65h-4v-4.9c0-1.3-.03-2.9-1.8-2.9-1.8 0-2.1 1.37-2.1 2.8v5h-4z'

export interface NetworkDef {
  id: string
  name: string
  /** پیشوندی که اگر کاربر فقط نام کاربری بدهد، نشانی از آن ساخته می‌شود. */
  base: string
  path?: string
}

export const networks: NetworkDef[] = [
  { id: 'linkedin', name: 'لینکدین', base: 'https://linkedin.com/in/', path: LINKEDIN },
  { id: 'github', name: 'گیت‌هاب', base: 'https://github.com/', path: siGithub.path },
  { id: 'gitlab', name: 'گیت‌لب', base: 'https://gitlab.com/', path: siGitlab.path },
  { id: 'telegram', name: 'تلگرام', base: 'https://t.me/', path: siTelegram.path },
  { id: 'instagram', name: 'اینستاگرام', base: 'https://instagram.com/', path: siInstagram.path },
  { id: 'x', name: 'ایکس (توییتر)', base: 'https://x.com/', path: siX.path },
  { id: 'whatsapp', name: 'واتس‌اپ', base: 'https://wa.me/', path: siWhatsapp.path },
  { id: 'stackoverflow', name: 'استک‌اورفلو', base: 'https://stackoverflow.com/users/', path: siStackoverflow.path },
  { id: 'dribbble', name: 'دریبل', base: 'https://dribbble.com/', path: siDribbble.path },
  { id: 'behance', name: 'بیهنس', base: 'https://behance.net/', path: siBehance.path },
  { id: 'medium', name: 'مدیوم', base: 'https://medium.com/@', path: siMedium.path },
  { id: 'youtube', name: 'یوتیوب', base: 'https://youtube.com/@', path: siYoutube.path },
  { id: 'kaggle', name: 'کگل', base: 'https://kaggle.com/', path: siKaggle.path },
  { id: 'scholar', name: 'گوگل اسکالر', base: 'https://scholar.google.com/citations?user=', path: siGooglescholar.path },
  { id: 'researchgate', name: 'ریسرچ‌گیت', base: 'https://researchgate.net/profile/', path: siResearchgate.path },
  { id: 'orcid', name: 'ارکید', base: 'https://orcid.org/', path: siOrcid.path },
  { id: 'other', name: 'پیوند دیگر', base: '' },
]

const networkById = new Map(networks.map((n) => [n.id, n]))

export function getNetwork(id: string): NetworkDef {
  return networkById.get(id) ?? networks[networks.length - 1]
}

export type ContactIcon = 'mail' | 'phone' | 'pin' | 'globe' | string

export function ResumeIcon({ name }: { name: ContactIcon }) {
  const common = { className: 'r-ico', 'aria-hidden': true } as const
  switch (name) {
    case 'mail':
      return <Mail {...common} strokeWidth={1.8} />
    case 'phone':
      return <Phone {...common} strokeWidth={1.8} />
    case 'pin':
      return <MapPin {...common} strokeWidth={1.8} />
    case 'globe':
      return <Globe {...common} strokeWidth={1.8} />
  }
  const net = networkById.get(name)
  if (net?.path) {
    return (
      <svg {...common} viewBox="0 0 24 24" fill="currentColor">
        <path d={net.path} />
      </svg>
    )
  }
  return <Link2 {...common} strokeWidth={1.8} />
}
