import type { Resume } from '@/resume/types'

export function resumeToJson(resume: Resume): Blob {
  return new Blob([JSON.stringify({ app: 'barg', ...resume }, null, 2)], { type: 'application/json' })
}

export async function readJsonFile(file: File): Promise<unknown> {
  return JSON.parse(await file.text())
}
