'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Campaign, Post } from '@/lib/marketing'
import { hasGoal, isGoalMet, getGoalTypeMeta } from '@/lib/marketing'

interface MarketingState {
  campaigns: Campaign[]
  posts: Post[]
  addCampaign: (data: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateCampaign: (id: string, data: Partial<Omit<Campaign, 'id' | 'createdAt'>>) => void
  deleteCampaign: (id: string) => void
  addPost: (data: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>) => string
  updatePost: (id: string, data: Partial<Omit<Post, 'id' | 'createdAt'>>) => void
  deletePost: (id: string) => void
  movePost: (postId: string, newDate: string) => void  // for drag-and-drop calendar
  seedIfEmpty: (campaigns: Campaign[], posts: Post[]) => void
  importData: (
    campaigns: Campaign[],
    posts: Post[],
    mode: 'merge' | 'replace',
  ) => { added: number; skipped: number }
  clearAll: () => void
}

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

function now(): string {
  return new Date().toISOString()
}

export const useMarketingStore = create<MarketingState>()(
  persist(
    (set, get) => ({
      campaigns: [],
      posts: [],

      addCampaign: (data) => {
        const id = uid()
        const ts = now()
        const campaign: Campaign = { ...data, id, createdAt: ts, updatedAt: ts }
        set((state) => ({ campaigns: [campaign, ...state.campaigns] }))
        return id
      },

      updateCampaign: (id, data) => {
        set((state) => ({
          campaigns: state.campaigns.map((c) =>
            c.id === id ? { ...c, ...data, updatedAt: now() } : c,
          ),
        }))
      },

      deleteCampaign: (id) => {
        set((state) => ({
          campaigns: state.campaigns.filter((c) => c.id !== id),
          // Unlink posts from this campaign (don't delete posts)
          posts: state.posts.map((p) =>
            p.campaignId === id ? { ...p, campaignId: undefined } : p,
          ),
        }))
      },

      addPost: (data) => {
        const id = uid()
        const ts = now()
        const post: Post = { ...data, id, createdAt: ts, updatedAt: ts }
        set((state) => ({ posts: [post, ...state.posts] }))
        return id
      },

      updatePost: (id, data) => {
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === id ? { ...p, ...data, updatedAt: now() } : p,
          ),
        }))
      },

      deletePost: (id) => {
        set((state) => ({ posts: state.posts.filter((p) => p.id !== id) }))
      },

      movePost: (postId, newDate) => {
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === postId
              ? { ...p, scheduledDate: newDate, updatedAt: now() }
              : p,
          ),
        }))
      },

      seedIfEmpty: (campaigns, posts) => {
        set((state) => {
          if (state.campaigns.length > 0 || state.posts.length > 0) return state
          return { campaigns, posts }
        })
      },

      importData: (incomingCampaigns, incomingPosts, mode) => {
        if (mode === 'replace') {
          // Unlink posts whose campaign no longer exists after replace
          const ids = new Set(incomingCampaigns.map((c) => c.id))
          const cleanedPosts = incomingPosts.map((p) =>
            p.campaignId && !ids.has(p.campaignId) ? { ...p, campaignId: undefined } : p,
          )
          set({ campaigns: incomingCampaigns, posts: cleanedPosts })
          return { added: incomingCampaigns.length + cleanedPosts.length, skipped: 0 }
        }

        const existingCampaignIds = new Set(get().campaigns.map((c) => c.id))
        const existingPostIds = new Set(get().posts.map((p) => p.id))
        const newCampaigns = incomingCampaigns.filter((c) => !existingCampaignIds.has(c.id))
        const newPosts = incomingPosts.filter((p) => !existingPostIds.has(p.id))

        // A merged post may reference a campaign that exists in neither set — unlink it
        const validCampaignIds = new Set([
          ...existingCampaignIds,
          ...newCampaigns.map((c) => c.id),
        ])
        const safeNewPosts = newPosts.map((p) =>
          p.campaignId && !validCampaignIds.has(p.campaignId)
            ? { ...p, campaignId: undefined }
            : p,
        )

        set((state) => ({
          campaigns: [...newCampaigns, ...state.campaigns],
          posts: [...safeNewPosts, ...state.posts],
        }))
        return {
          added: newCampaigns.length + safeNewPosts.length,
          skipped:
            (incomingCampaigns.length - newCampaigns.length) +
            (incomingPosts.length - newPosts.length),
        }
      },

      clearAll: () => set({ campaigns: [], posts: [] }),
    }),
    {
      name: 'build-ledger-marketing-v1',
      partialize: (state) => ({ campaigns: state.campaigns, posts: state.posts }),
    },
  ),
)

// Selector helpers for marketing stats
export function selectMarketingStats(campaigns: Campaign[], posts: Post[]) {
  const activeCampaigns = campaigns.filter((c) => c.status === 'active').length
  const scheduledPosts = posts.filter((p) => p.status === 'scheduled').length
  const postedToday = posts.filter((p) => {
    if (p.status !== 'posted' || !p.postedDate) return false
    const today = new Date().toDateString()
    return new Date(p.postedDate).toDateString() === today
  }).length

  const totalImpressions = posts.reduce((sum, p) => sum + (p.metrics?.impressions ?? 0), 0)
  const totalClicks = posts.reduce((sum, p) => sum + (p.metrics?.clicks ?? 0), 0)
  const totalEngagement = posts.reduce(
    (sum, p) => sum + (p.metrics?.likes ?? 0) + (p.metrics?.comments ?? 0) + (p.metrics?.shares ?? 0),
    0,
  )

  // By platform
  const byPlatform: Record<string, number> = {}
  for (const p of posts) {
    byPlatform[p.platform] = (byPlatform[p.platform] || 0) + 1
  }

  // Goal progress across all campaigns
  const goalProgress = campaigns.map((c) => ({
    name: c.name,
    current: c.goalCurrent,
    target: c.goalTarget,
    pct: c.goalTarget > 0 ? Math.min(100, (c.goalCurrent / c.goalTarget) * 100) : 0,
    // Raw (uncapped) percentage — used to detect overachievement
    rawPct: c.goalTarget > 0 ? (c.goalCurrent / c.goalTarget) * 100 : 0,
    color: c.color,
    met: isGoalMet(c),
    unit: getGoalTypeMeta(c.goalType).unit,
    typeLabel: getGoalTypeMeta(c.goalType).label,
  }))

  // Success rate: only campaigns that actually set a target count toward this.
  // Campaigns still at 'idea'/'planning' with no target don't drag the rate down.
  const campaignsWithGoals = campaigns.filter(hasGoal)
  const goalsMet = campaignsWithGoals.filter(isGoalMet).length
  const goalsTracked = campaignsWithGoals.length
  const successRate = goalsTracked > 0 ? Math.round((goalsMet / goalsTracked) * 100) : null

  return {
    activeCampaigns,
    scheduledPosts,
    postedToday,
    totalImpressions,
    totalClicks,
    totalEngagement,
    byPlatform,
    goalProgress,
    goalsMet,
    goalsTracked,
    successRate,
  }
}
