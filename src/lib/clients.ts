// CRM types and constants for Build Ledger — client / prospect tracker.
// Tracks a lead from first discovery (prospect) through communication
// touches to a won/lost outcome, optionally linking a Build Ledger Project
// when the prospect becomes a paying client.

export type ClientStage =
  | 'prospect'    // just identified, not contacted yet
  | 'contacted'   // first outreach sent
  | 'meeting'     // a call / meeting happened
  | 'proposal'   // sent a proposal / quote
  | 'won'        // landed — closed the deal
  | 'lost'       // didn't land

export type LeadSource =
  | 'cold-outreach'
  | 'referral'
  | 'inbound'
  | 'social'
  | 'event'
  | 'community'
  | 'other'

export type CommMethod =
  | 'email'
  | 'call'
  | 'dm'
  | 'meeting'
  | 'linkedin'
  | 'in-person'
  | 'other'

export interface Communication {
  id: string
  method: CommMethod
  date: string            // ISO datetime of the touch
  outcome: string          // short summary of what happened
  notes?: string           // optional longer detail
}

export interface Client {
  id: string
  name: string             // contact name
  company?: string
  email?: string
  phone?: string
  source: LeadSource
  stage: ClientStage
  value?: number           // potential deal value
  currency: string         // e.g. 'USD'
  projectId?: string       // linked Build Ledger Project (when won)
  lastContactDate?: string // ISO datetime — last communication touch
  nextFollowUp?: string    // ISO date — when to follow up next
  communications: Communication[]
  notes?: string
  color: string            // display color (hex)
  createdAt: string
  updatedAt: string
}

export const CLIENT_STAGES: {
  value: ClientStage
  label: string
  color: string
  /** marks the two terminal (won/lost) outcomes */
  terminal?: boolean
}[] = [
  { value: 'prospect',  label: 'Prospect',  color: '#94a3b8' },
  { value: 'contacted', label: 'Contacted', color: '#6366f1' },
  { value: 'meeting',   label: 'Meeting',   color: '#a855f7' },
  { value: 'proposal',  label: 'Proposal',  color: '#f59e0b' },
  { value: 'won',       label: 'Won',       color: '#10b981', terminal: true },
  { value: 'lost',      label: 'Lost',      color: '#ef4444', terminal: true },
]

export const LEAD_SOURCES: { value: LeadSource; label: string; color: string }[] = [
  { value: 'cold-outreach', label: 'Cold outreach', color: '#6366f1' },
  { value: 'referral',      label: 'Referral',       color: '#10b981' },
  { value: 'inbound',       label: 'Inbound',         color: '#06b6d4' },
  { value: 'social',        label: 'Social',           color: '#ec4899' },
  { value: 'event',         label: 'Event',            color: '#f59e0b' },
  { value: 'community',     label: 'Community',        color: '#a855f7' },
  { value: 'other',         label: 'Other',            color: '#64748b' },
]

export const COMM_METHODS: {
  value: CommMethod
  label: string
  color: string
  icon: string
}[] = [
  { value: 'email',     label: 'Email',       color: '#3b82f6', icon: '✉' },
  { value: 'call',      label: 'Call',         color: '#06b6d4', icon: '☎' },
  { value: 'dm',        label: 'DM',           color: '#ec4899', icon: '💬' },
  { value: 'meeting',   label: 'Meeting',      color: '#a855f7', icon: '🗓' },
  { value: 'linkedin',  label: 'LinkedIn',     color: '#0a66c2', icon: 'in' },
  { value: 'in-person', label: 'In person',    color: '#f59e0b', icon: '🤝' },
  { value: 'other',      label: 'Other',        color: '#64748b', icon: '•' },
]

export const CLIENT_COLORS = [
  '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#6366f1', '#14b8a6',
  '#a855f7', '#22d3ee',
]

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'EGP', 'AED', 'INR', 'JPY']

export function getStageMeta(value: ClientStage) {
  return CLIENT_STAGES.find((s) => s.value === value) ?? CLIENT_STAGES[0]
}

export function getSourceMeta(value: LeadSource) {
  return LEAD_SOURCES.find((s) => s.value === value) ?? LEAD_SOURCES[0]
}

export function getCommMethodMeta(value: CommMethod) {
  return COMM_METHODS.find((m) => m.value === value) ?? COMM_METHODS[0]
}

export function isTerminalStage(stage: ClientStage): boolean {
  return stage === 'won' || stage === 'lost'
}

export function isWon(c: Pick<Client, 'stage'>): boolean {
  return c.stage === 'won'
}

export function isLost(c: Pick<Client, 'stage'>): boolean {
  return c.stage === 'lost'
}

/** Pipeline stages shown as columns in the kanban board (excludes terminal). */
export const PIPELINE_STAGES: ClientStage[] = [
  'prospect',
  'contacted',
  'meeting',
  'proposal',
]

export function formatValue(value?: number, currency = 'USD'): string {
  if (value == null || Number.isNaN(value)) return '—'
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value)
  } catch {
    return `${currency} ${value.toLocaleString()}`
  }
}
