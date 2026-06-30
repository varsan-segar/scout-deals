import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// ── Constants ──────────────────────────────────────────────────────
export const PIPELINE_STAGES = [
  'Screening',
  'Interested',
  'Meeting',
  'Term Sheet',
  'Passed',
] as const

export type PipelineStage = (typeof PIPELINE_STAGES)[number]

export const SECTORS = [
  'FinTech',
  'HealthTech',
  'EdTech',
  'SaaS B2B',
  'Consumer',
  'D2C',
  'PropTech',
  'DeepTech',
  'Other',
] as const

export type Sector = (typeof SECTORS)[number]

// ── Formatting ─────────────────────────────────────────────────────
export function formatStage(stage: string): string {
  return stage
}

export function formatDate(iso?: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatScore(score?: number | null): string {
  if (score == null) return '—'
  return `${Math.round(score * 10) / 10}/10`
}

export function getScoreClass(score?: number | null): string {
  if (score == null) return ''
  if (score >= 7) return 'score-high'
  if (score >= 4) return 'score-medium'
  return 'score-low'
}

export function formatSector(sector: string): string {
  const labels: Record<string, string> = {
    'FinTech': 'FinTech',
    'HealthTech': 'HealthTech',
    'EdTech': 'EdTech',
    'SaaS B2B': 'SaaS B2B',
    'Consumer': 'Consumer',
    'D2C': 'D2C',
    'PropTech': 'PropTech',
    'DeepTech': 'DeepTech',
    'Other': 'Other',
  }
  return labels[sector] || sector
}

// ── ID / slugify ───────────────────────────────────────────────────
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ── JSON parsing helper ────────────────────────────────────────────
export function parseJSON<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback
  if (typeof value === 'object') return value as T
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T
    } catch {}
    let trimmed = value.trimEnd()
    for (let i = 0; i < 5; i++) {
      if (trimmed.endsWith('}') || trimmed.endsWith(']')) {
        trimmed = trimmed.slice(0, -1)
        try {
          return JSON.parse(trimmed) as T
        } catch {}
      }
    }
    return fallback
  }
  return fallback
}
