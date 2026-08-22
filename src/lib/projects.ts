export type StorageLocation = 'local' | 'sandbox' | 'cloud' | 'github'
export type ClientStatus = 'personal' | 'client' | 'in-progress' | 'delivered'

export interface Project {
  id: string
  name: string
  description: string
  aiUsed: string[]
  storageLocation: StorageLocation
  inPortfolio: boolean
  clientStatus: ClientStatus
  clientName?: string
  tags: string[]
  repoUrl?: string
  liveUrl?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export const STORAGE_LOCATIONS: { value: StorageLocation; label: string; color: string }[] = [
  { value: 'local', label: 'Local', color: '#10b981' },
  { value: 'sandbox', label: 'Sandbox', color: '#f59e0b' },
  { value: 'cloud', label: 'Cloud', color: '#06b6d4' },
  { value: 'github', label: 'GitHub', color: '#a855f7' },
]

export const CLIENT_STATUSES: { value: ClientStatus; label: string; color: string }[] = [
  { value: 'personal', label: 'Personal', color: '#64748b' },
  { value: 'in-progress', label: 'In Progress', color: '#f59e0b' },
  { value: 'client', label: 'For Client', color: '#3b82f6' },
  { value: 'delivered', label: 'Delivered', color: '#10b981' },
]

export const AI_OPTIONS = [
  'Claude',
  'GPT-5',
  'Cursor',
  'v0',
  'Lovable',
  'Bolt',
  'Replit Agent',
  'Windsurf',
  'Gemini',
  'GitHub Copilot',
  'Other',
]

export function getLocationMeta(value: StorageLocation) {
  return STORAGE_LOCATIONS.find((s) => s.value === value) ?? STORAGE_LOCATIONS[0]
}

export function getStatusMeta(value: ClientStatus) {
  return CLIENT_STATUSES.find((s) => s.value === value) ?? CLIENT_STATUSES[0]
}
