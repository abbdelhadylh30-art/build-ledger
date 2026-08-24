// Marketing types and constants for Build Ledger

export type Platform =
  | 'twitter'
  | 'linkedin'
  | 'reddit'
  | 'hackernews'
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'discord'
  | 'slack'
  | 'newsletter'
  | 'other'

export type CampaignStatus =
  | 'idea'        // just an idea, no posts yet
  | 'planning'    // outlining posts
  | 'active'      // currently posting
  | 'paused'      // took a break
  | 'completed'   // finished
  | 'abandoned'   // gave up

export type PostStatus =
  | 'idea'        // just an idea
  | 'drafting'    // writing the content
  | 'scheduled'   // scheduled to post
  | 'posted'      // live
  | 'failed'      // posted but flopped / got removed

export type GoalType =
  | 'impressions'   // total views across posts
  | 'clicks'        // clicks to your site
  | 'signups'       // email signups / account creations
  | 'sales'         // direct revenue
  | 'calls'         // discovery calls booked
  | 'followers'     // net new followers
  | 'custom'        // user-defined

export interface Campaign {
  id: string
  name: string
  description: string
  status: CampaignStatus
  startDate: string      // ISO date (planned or actual)
  endDate?: string       // ISO date (planned or actual)
  goalType: GoalType
  goalTarget: number
  goalCurrent: number
  linkedProjectIds: string[]   // which Build Ledger projects this campaign promotes
  notes?: string
  color: string          // hex color for calendar display
  createdAt: string
  updatedAt: string
}

export interface Post {
  id: string
  campaignId?: string    // optional — posts can be standalone
  platform: Platform
  title: string          // short title for the calendar/list
  content: string        // the actual post content (or summary)
  status: PostStatus
  scheduledDate?: string // ISO datetime — when you plan to post
  postedDate?: string    // ISO datetime — when you actually posted
  postUrl?: string       // link to the live post
  // Manual metrics (entered by user)
  metrics?: {
    impressions?: number
    likes?: number
    comments?: number
    shares?: number
    clicks?: number
  }
  notes?: string
  createdAt: string
  updatedAt: string
}

export const PLATFORMS: { value: Platform; label: string; color: string; icon: string }[] = [
  { value: 'twitter',    label: 'Twitter / X',    color: '#1d9bf0', icon: '𝕏' },
  { value: 'linkedin',   label: 'LinkedIn',       color: '#0a66c2', icon: 'in' },
  { value: 'reddit',     label: 'Reddit',         color: '#ff4500', icon: 'r' },
  { value: 'hackernews', label: 'Hacker News',    color: '#ff6600', icon: 'Y' },
  { value: 'instagram',  label: 'Instagram',      color: '#e1306c', icon: 'ig' },
  { value: 'tiktok',     label: 'TikTok',         color: '#000000', icon: 'tt' },
  { value: 'youtube',    label: 'YouTube',        color: '#ff0000', icon: '▶' },
  { value: 'discord',    label: 'Discord',        color: '#5865f2', icon: 'dc' },
  { value: 'slack',      label: 'Slack',          color: '#4a154b', icon: 'sl' },
  { value: 'newsletter', label: 'Newsletter',     color: '#10b981', icon: '✉' },
  { value: 'other',      label: 'Other',          color: '#6b7280', icon: '•' },
]

export const CAMPAIGN_STATUSES: { value: CampaignStatus; label: string; color: string }[] = [
  { value: 'idea',      label: 'Idea',      color: '#6b7280' },
  { value: 'planning',  label: 'Planning',  color: '#f59e0b' },
  { value: 'active',    label: 'Active',    color: '#10b981' },
  { value: 'paused',    label: 'Paused',    color: '#6366f1' },
  { value: 'completed', label: 'Completed', color: '#06b6d4' },
  { value: 'abandoned', label: 'Abandoned', color: '#ef4444' },
]

export const POST_STATUSES: { value: PostStatus; label: string; color: string }[] = [
  { value: 'idea',      label: 'Idea',      color: '#6b7280' },
  { value: 'drafting',  label: 'Drafting',  color: '#f59e0b' },
  { value: 'scheduled', label: 'Scheduled', color: '#6366f1' },
  { value: 'posted',    label: 'Posted',    color: '#10b981' },
  { value: 'failed',    label: 'Failed',    color: '#ef4444' },
]

export const GOAL_TYPES: { value: GoalType; label: string; unit: string }[] = [
  { value: 'impressions', label: 'Impressions',   unit: 'views' },
  { value: 'clicks',      label: 'Clicks',         unit: 'clicks' },
  { value: 'signups',     label: 'Signups',        unit: 'signups' },
  { value: 'sales',       label: 'Sales',          unit: 'sales' },
  { value: 'calls',       label: 'Discovery calls',unit: 'calls' },
  { value: 'followers',   label: 'New followers',  unit: 'followers' },
  { value: 'custom',      label: 'Custom',         unit: 'units' },
]

export const CAMPAIGN_COLORS = [
  '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#6366f1', '#14b8a6',
  '#a855f7', '#22d3ee',
]

export function getPlatformMeta(value: Platform) {
  return PLATFORMS.find((p) => p.value === value) ?? PLATFORMS[0]
}

export function getCampaignStatusMeta(value: CampaignStatus) {
  return CAMPAIGN_STATUSES.find((s) => s.value === value) ?? CAMPAIGN_STATUSES[0]
}

export function getPostStatusMeta(value: PostStatus) {
  return POST_STATUSES.find((s) => s.value === value) ?? POST_STATUSES[0]
}

export function getGoalTypeMeta(value: GoalType) {
  return GOAL_TYPES.find((g) => g.value === value) ?? GOAL_TYPES[0]
}

// A campaign only counts as having a real, checkable goal if a target > 0 was set.
export function hasGoal(campaign: Pick<Campaign, 'goalTarget'>): boolean {
  return campaign.goalTarget > 0
}

export function isGoalMet(campaign: Pick<Campaign, 'goalCurrent' | 'goalTarget'>): boolean {
  return hasGoal(campaign) && campaign.goalCurrent >= campaign.goalTarget
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function toCalendarDate(iso: string): string {
  // Returns YYYY-MM-DD for calendar grouping
  return iso.split('T')[0]
}

export function getDaysFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}
